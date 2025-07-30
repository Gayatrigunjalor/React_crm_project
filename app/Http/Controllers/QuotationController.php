<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Lead_customer;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\Currency;
use App\Models\Customer;
use App\Models\Employee;
use App\Models\IncoTerm;
use App\Models\Consignee;
use App\Models\Quotation;
use App\Models\Warehouse;
use App\Models\BankAccount;
use Illuminate\Http\Request;
use App\Models\QuotationSent;
use App\Models\CompanyDetails;
use App\Models\SdeAttachmentBt;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\QuotationProduct;
use App\Models\TermsAndConditions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class QuotationController extends Controller
{
    private function returnBack(){
        Session::flash('incorrect_company_id', 'The Proforma Invoice you are trying to access is created from different company, to access it please switch company from the navbar.');
    }

    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function index()
    {
        $this->authorize('quotation_list');

        if(Auth::id() != 1){
            $quotations = Quotation::select('id','pi_number', 'pi_date', 'document_type', 'buyer_id', 'consignee_id', 'sales_manager_id', 'bank_id', 'grand_total')->where('created_by', Auth::id());
        } else {

            $quotations = Quotation::select('id','pi_number', 'pi_date', 'document_type', 'buyer_id', 'consignee_id', 'sales_manager_id', 'bank_id', 'grand_total');
        }

        $quotations = $quotations->with([
            'consignee:id,name',
            'buyer:id,name',
            'bankDetails:id,bank_name',
            'sdeAttachment:id,name,attachment_details,business_task_id',
        ])->orderBy('id', 'desc')->get();

        return response()->json($quotations, 200);
    }

    private function nextQuotationId() {
        $quo = new Quotation;
        return $quo->getLatestId();
    }

    public function piListing() {
        $quotations = Quotation::select('id', 'pi_number', 'pi_date')->get();
        return response()->json($quotations, 200);
    }

    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function create()
    {
        $this->authorize('quotation_create');
        $buyers = Customer::where('approved', '=', '1')->get();
        $employees = Employee::where('approved', '=', '1')->get();
        $products = Product::where('approved', '=', '1')->get();
        $banks = new BankAccount;
        if(Auth::id() != 1){
            $banks = $banks->where('id', 1);
        }
        $banks = $banks->get();
        $currencies = Currency::all();
        $incoTerms = IncoTerm::all();

        $pi_number = $this->nextQuotationId();

        $user = Auth::user();
        if ($user->user_role == 0) {
            $employee_name =  "Admin";
        } else {
            $employee_name =  $user->employeeRole->name;
        }
        return view('admin.quotation.create', compact('buyers', 'employees', 'pi_number', 'products', 'banks', 'currencies', 'incoTerms', 'employee_name'));
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $this->authorize('quotation_create');
        $this->validate($request, [
            'buyer_id'              => 'required|exists:customers,id',
            'consignee_id'          => 'required',
            'sales_manager_id'      => 'required',
            'document_type'         => 'required',
            'bank_id'               => 'required',
            'total'                 => 'required',
            'grand_total'           => 'required',
            'terms_and_conditions'  => 'required'
        ]);
        $reqArray = [];
        $reqArray['pi_number']              = $this->nextQuotationId();
        $reqArray['pi_date']                = date('Y-m-d');
        $reqArray['buyer_id']               = $request->buyer_id;
        $reqArray['consignee_id']           = $request->consignee_id;
        $reqArray['sales_manager_id']       = $request->sales_manager_id;
        $reqArray['document_type']          = $request->document_type;
        $reqArray['bank_id']                = $request->bank_id;
        $reqArray['state_code']             = $request->state_code;
        $reqArray['currency_id']            = $request->currency_id;
        $reqArray['exchange_rate']          = $request->exchange_rate;
        $reqArray['port_of_loading']        = $request->port_of_loading;
        $reqArray['port_of_discharge']      = $request->port_of_discharge;
        $reqArray['final_destination']      = $request->final_destination;
        $reqArray['origin_country']         = $request->origin_country;
        $reqArray['inco_term_id']           = $request->inco_term_id;
        $reqArray['net_weight']             = $request->net_weight;
        $reqArray['gross_weight']           = $request->gross_weight;
        $reqArray['total']                  = $request->total;
        $reqArray['igst']                   = $request->igst;
        $reqArray['cgst']                   = $request->cgst;
        $reqArray['sgst']                   = $request->sgst;
        $reqArray['shipping_cost']          = $request->shipping_cost;
        $reqArray['grand_total']            = $request->grand_total;
        $reqArray['terms_and_conditions']   = $request->terms_and_conditions;
        $reqArray['approved']               = true;
        $reqArray['created_by']             = Auth::id() ?? 1;
        $reqArray['company_id']             = session('company_id') ?? 1;
        $reqArray['lead_id']                = $request->lead_id;
        $reqArray['lead_customer_id']       = $request->lead_customer_id;

        if($request->document_type == 'Domestic') {
            $reqArray['currency_id'] = null;
            $reqArray['exchange_rate'] = null;
            $reqArray['port_of_loading'] = null;
            $reqArray['port_of_discharge'] = null;
            $reqArray['final_destination'] = null;
            $reqArray['origin_country'] = null;
            $reqArray['inco_term_id'] = null;
            $reqArray['net_weight'] = null;
            $reqArray['gross_weight'] = null;
            $reqArray['shipping_cost'] = null;
        } else {
            $reqArray['state_code'] = null;
            $reqArray['igst'] = null;
            $reqArray['cgst'] = null;
            $reqArray['sgst'] = null;
        }

        $quotation = Quotation::create($reqArray); //create quotations data

        if (!empty($quotation->id)) {
            //add quotations product in quotation_products table
            $pi_order_item_ids = [];
            foreach($request->products as $product){
                $dataProduct = [
                    'product_name' => $product['title'],
                    'pi_order_id' => $quotation['id'],
                    'product_id' => $product['prod_id'],
                    'quantity' => $product['quantity'],
                    'tax' => $product['tax'],
                    'tax_amount' => $product['taxAmount'],
                    'rate' => $product['rate'],
                    'rate_with_tax' => $product['rateWithTax'],
                    'amount' => $product['amount'],
                ];
                $qp = QuotationProduct::create($dataProduct);
                if (!empty($qp->id)) {
                    array_push($pi_order_item_ids, $qp->id);
                }
            }
            $pi_order_item_ids = implode(",", $pi_order_item_ids);
            //update quotations product IDs in quotations record
            Quotation::find($quotation->id)->update(['pi_product_ids' => $pi_order_item_ids]);

            if (!empty($request->lead_id) && !empty($request->lead_customer_id)) {
                $this->storeQuotationSent($request->lead_id, $request->lead_customer_id, $quotation->id, $quotation->pi_number);
            }
        }

        return response()->json(['success' => true, 'message' => 'Quotation created successfully'], 200);
    }


    private function storeQuotationSent($lead_id, $lead_customer_id, $quotation_id = null, $pi_number = null)
{
    $lead = Lead::find($lead_id);
    $customer = Lead_customer::find($lead_customer_id);

    if (!$lead || !$customer) {
        return null;
    }

    $quotationSentData = [
        'lead_id' => $lead_id,
        'customer_id'  => $lead_customer_id,
        'product_name' => $lead->product_name ?? null,
        'make' => $lead->make ?? null,
        'model' => $lead->model ?? null,
        'qty' => $lead->quantity ?? null,
        'target_price' => $lead->target_price ?? null,
        'quoted_price' => null, // can be updated if needed
        'date' => now(),
        'status' => '1',
        'quotation_id' => $quotation_id,
        'pi_number' => $pi_number ?? $this->nextQuotationId(),
    ];

    $quotation = QuotationSent::create($quotationSentData);

    DB::table('price_shareds')
        ->where('lead_id', $lead_id)
        ->where('customer_id', $customer->id)
        ->update(['status' => '0']);

    return $quotation;
}


    /**
     * @param mixed $id
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function show($id)
    {
        $this->authorize('quotation_edit');
        if(!$id || (empty(Quotation::find($id)))) {
            return response()->json(['success'=> false, 'message' => 'Quotation details not found'], 404);
        }
        // if($quotation->company_id != session('company_id')){
        //     $this->returnBack();
        //     return redirect('/quotation');
        // }
        $quotation = Quotation::where("id", $id)->with([
            'quotation_products',
            'buyer:id,name',
            'consignee:id,name,contact_person',
            'bankDetails:id,bank_name',
            'currency:id,name',
            'inco_term:id,inco_term',
        ])->first();
        return response()->json($quotation);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $this->authorize('quotation_edit');
        $this->validate($request, [
            'buyer_id'              => 'required',
            'consignee_id'          => 'required',
            'sales_manager_id'      => 'required',
            'document_type'         => 'required',
            'bank_id'               => 'required',
            'total'                 => 'required',
            'grand_total'           => 'required',
            'terms_and_conditions'  => 'required'
        ]);

        $reqArray = [];

        $reqArray['buyer_id']               = $request->buyer_id;
        $reqArray['consignee_id']           = $request->consignee_id;
        $reqArray['sales_manager_id']       = $request->sales_manager_id;
        $reqArray['document_type']          = $request->document_type;
        $reqArray['bank_id']                = $request->bank_id;
        $reqArray['state_code']             = $request->state_code;
        $reqArray['currency_id']            = $request->currency_id;
        $reqArray['exchange_rate']          = $request->exchange_rate;
        $reqArray['port_of_loading']        = $request->port_of_loading;
        $reqArray['port_of_discharge']      = $request->port_of_discharge;
        $reqArray['final_destination']      = $request->final_destination;
        $reqArray['origin_country']         = $request->origin_country;
        $reqArray['inco_term_id']           = $request->inco_term_id;
        $reqArray['net_weight']             = $request->net_weight;
        $reqArray['gross_weight']           = $request->gross_weight;
        $reqArray['total']                  = $request->total;
        $reqArray['igst']                   = $request->igst;
        $reqArray['cgst']                   = $request->cgst;
        $reqArray['sgst']                   = $request->sgst;
        $reqArray['shipping_cost']          = $request->shipping_cost;
        $reqArray['grand_total']            = $request->grand_total;
        $reqArray['terms_and_conditions']   = $request->terms_and_conditions;

        if($request->document_type == 'Domestic') {
            $reqArray['currency_id'] = null;
            $reqArray['exchange_rate'] = null;
            $reqArray['port_of_loading'] = null;
            $reqArray['port_of_discharge'] = null;
            $reqArray['final_destination'] = null;
            $reqArray['origin_country'] = null;
            $reqArray['inco_term_id'] = null;
            $reqArray['net_weight'] = null;
            $reqArray['gross_weight'] = null;
            $reqArray['shipping_cost'] = null;
        } else {
            $reqArray['state_code'] = null;
            $reqArray['igst'] = null;
            $reqArray['cgst'] = null;
            $reqArray['sgst'] = null;
        }
        //Delete all products from quotations and re-add products
        // QuotationProduct::where('pi_order_id', $id)->delete();
        $pi_order_item_ids = [];
        if(!empty($request->products)) {
            foreach($request->products as $product){
                if($product['qp_id'] == 0){
                    $dataProduct = [
                        'product_name' => $product['title'],
                        'pi_order_id' => $id,
                        'product_id' => $product['prod_id'],
                        'quantity' => $product['quantity'],
                        'tax' => $product['tax'],
                        'tax_amount' => $product['taxAmount'],
                        'rate' => $product['rate'],
                        'rate_with_tax' => $product['rateWithTax'],
                        'amount' => $product['amount'],
                    ];
                    QuotationProduct::create($dataProduct);
                }
            }
        }
        $row = QuotationProduct::select('id')->where('pi_order_id', $id)->get()->toArray();
        foreach($row as $qp){
            $pi_order_item_ids[] = $qp['id'];
        }
        $reqArray['pi_product_ids'] = implode(",", $pi_order_item_ids);
        Quotation::find($id)->update($reqArray);
        return response()->json(['success'=> true, 'message' => "Quotation details updated successfully!"], 200);
    }

    /**
     * @param mixed $id
     * @return \Illuminate\Http\Response
     */
    public function pdfWithSignatureQuotation($id)
    {
        $session_id = session('company_id') ?? 1;
        $quotation = Quotation::leftJoin('currencies', 'currencies.id', '=', 'quotations.currency_id')
            ->leftJoin('inco_terms', 'inco_terms.id', '=', 'quotations.inco_term_id')
            ->get(['quotations.*', 'currencies.name as currency_name', 'inco_terms.inco_term as inco_term_name'])
            ->where("id", $id)->first();
        if($quotation->company_id != $session_id){
            $this->returnBack();
            return redirect('/quotation');
        }
        $buyerDetails = Customer::leftJoin('countries', 'countries.id', '=', 'customers.country_id')
            ->get(['customers.*', 'countries.name as country_name'])
            ->where("id", $quotation->buyer_id)->first();
        $consigneeDetails = Consignee::leftJoin('countries', 'countries.id', '=', 'consignees.country')
            ->leftJoin('states', 'states.id', '=', 'consignees.state')
            ->get(['consignees.*', 'countries.name as country_name', 'states.name as state_name'])
            ->where("id", $quotation->consignee_id)->first();
        $quotationProducts = QuotationProduct::leftJoin('products', 'products.id', '=', 'quotation_products.product_id')
            ->get(['quotation_products.*', 'products.model_name as model_name', 'products.printable_description as product_description', 'products.product_code as product_code'])
            ->where('pi_order_id', $quotation->id);
        if ($quotation->document_type == "Domestic") {
            $order = "Domestic Proforma Invoice";
        } else {
            $order = "International Proforma Invoice";
        }
        $termsAndConditions = TermsAndConditions::where('order', $order)->first();
        $companyDetails = CompanyDetails::where('id', $session_id)->first();
        $bankDetails = BankAccount::where('id', $quotation->bank_id)->first();
        $data = [
            'pdf_title' => 'Proforma Invoice',
            'signature'    => 'Yes',
            'quotation' => $quotation,
            'buyerDetails' => $buyerDetails,
            'consigneeDetails' => $consigneeDetails,
            'quotationProducts' => $quotationProducts,
            'termsAndConditions' => $termsAndConditions,
            'companyDetails' => $companyDetails,
            'bankDetails' => $bankDetails
        ];

        $pdf = Pdf::loadView('admin.quotation.order_pdf', $data, ['isHtml5ParserEnabled' => true, 'enable_php' => true]);

        // Get the raw PDF content as a string
        $pdfContent = $pdf->output();

        // Get the filename (you can customize the filename as needed)
        $filename = 'quotation_sign_'.$id.'.pdf'; // You can dynamically set the name

        // Set the headers for the response
        $headers = [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        // Return the file as a download response
        return response($pdfContent, 200, $headers);
    }

    /**
     * @param mixed $id
     * @return \Illuminate\Http\Response
     */
    public function pdfWithOutSignatureQuotation($id)
    {
        $session_id = session('company_id') ?? 1;
        $quotation = Quotation::leftJoin('currencies', 'currencies.id', '=', 'quotations.currency_id')
            ->leftJoin('inco_terms', 'inco_terms.id', '=', 'quotations.inco_term_id')
            ->get(['quotations.*', 'currencies.name as currency_name', 'inco_terms.inco_term as inco_term_name'])
            ->where("id", $id)->first();
        if($quotation->company_id != $session_id){
            $this->returnBack();
            return redirect('/quotation');
        }
        $buyerDetails = Customer::leftJoin('countries', 'countries.id', '=', 'customers.country_id')
            ->get(['customers.*', 'countries.name as country_name'])
            ->where("id", $quotation->buyer_id)->first();
        $consigneeDetails = Consignee::leftJoin('countries', 'countries.id', '=', 'consignees.country')
            ->leftJoin('states', 'states.id', '=', 'consignees.state')
            ->get(['consignees.*', 'countries.name as country_name', 'states.name as state_name'])
            ->where("id", $quotation->consignee_id)->first();
        $quotationProducts = QuotationProduct::leftJoin('products', 'products.id', '=', 'quotation_products.product_id')
            ->get(['quotation_products.*', 'products.model_name as model_name', 'products.printable_description as product_description', 'products.product_code as product_code'])
            ->where('pi_order_id', $quotation->id);
        if ($quotation->document_type == "Domestic") {
            $order = "Domestic Proforma Invoice";
        } else {
            $order = "International Proforma Invoice";
        }
        $termsAndConditions = TermsAndConditions::where('order', $order)->first();
        $companyDetails = CompanyDetails::where('id', $session_id)->first();
        $bankDetails = BankAccount::where('id', $quotation->bank_id)->first();
        $data = [
            'pdf_title' => 'Proforma Invoice',
            'signature'    => 'No',
            'quotation' => $quotation,
            'buyerDetails' => $buyerDetails,
            'consigneeDetails' => $consigneeDetails,
            'quotationProducts' => $quotationProducts,
            'termsAndConditions' => $termsAndConditions,
            'companyDetails' => $companyDetails,
            'bankDetails' => $bankDetails
        ];
        $pdf = Pdf::loadView('admin.quotation.order_pdf', $data, ['isHtml5ParserEnabled' => true, 'enable_php' => true]);

        // // Get the canvas before outputting the PDF content
        // $canvas = $pdf->getCanvas();

        // // Add page numbers to each page
        // $canvas->page_text(525, 800, "Page {PAGE_NUM} of {PAGE_COUNT}", "Helvetica", 7, array(0, 0, 0));

        // Get the raw PDF content as a string
        $pdfContent = $pdf->output();

        // Get the filename (you can customize the filename as needed)
        $filename = 'quotation_'.$id.'.pdf'; // You can dynamically set the name

        // Set the headers for the response
        $headers = [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        // Return the file as a download response
        return response($pdfContent, 200, $headers);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    public function deleteQuotationProduct(Request $request)
    {
        $this->authorize('quotation_edit');
        QuotationProduct::where('id', $request->id)->delete();
        return response()->json(['success' => true, 'message' => 'Product deleted successfully!'], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    public function destroy($id)
    {
        $this->authorize('quotation_delete');
        $quotation = Quotation::find($id);
        if(!$quotation) {
            return response()->json(['success' => false, 'message' => 'Proforma Invoice not found'], 404);
        }
        $sdeCount = SdeAttachmentBt::where('attachment_name', 'Proforma Invoice')->where('attachment_details', $id)->count();
        $invoiceCount = Invoice::where('quotation_id', $id)->count();
        $wmsCount = Warehouse::where('proforma_invoice_id', $id)->count();
        $message = '';
        $message = 'Proforma Invoice cannot be removed as it is used in ';
        if($sdeCount > 0 || $invoiceCount > 0 || $wmsCount > 0){
            if($sdeCount > 0) {
                $message .= ' | SDE attachment | ';
            }
            if($invoiceCount > 0) {
                $message .= ' | Invoice record(s) | ';
            }
            if($wmsCount > 0) {
                $message .= ' | WMS record(s) | ';
            }
            return response()->json(['success' => false, 'message' => $message], 422);
        } else {

            $this->authorize('quotation_delete');
            $quotation->delete();
            QuotationProduct::where('pi_order_id', '=', $id)->delete();

            return response()->json(['success' => true, 'message' => 'Proforma Invoice deleted successfully!'], 200);
        }

    }

    /**
     * @param mixed $id
     * @return \Illuminate\Http\Response
     */
    public function quotation_pdfTPA($id)
    {
        $view = 'admin.quotation.pdf.quotation_tpa';
        $pdfName = 'tpa';
        return $this->getPdf($id, $view, $pdfName);
    }

    /**
     * @param mixed $id
     * @return \Illuminate\Http\Response
     */
    public function quotation_pdfBD($id)
    {
        $view = 'admin.quotation.pdf.quotation_bd';
        $pdfName = 'bd';
        return $this->getPdf($id, $view, $pdfName);
    }

    /**
     * @param mixed $id
     * @return \Illuminate\Http\Response
     */
    public function quotation_pdfCD($id)
    {
        $view = 'admin.quotation.pdf.quotation_cd';
        $pdfName = 'cd';
        return $this->getPdf($id, $view, $pdfName);
    }

    /**
     * @param mixed $id
     * @return \Illuminate\Http\Response
     */
    public function quotation_pdfSC($id)
    {
        $view = 'admin.quotation.pdf.quotation_sales';
        $pdfName = 'sales-contract';
        return $this->getPdf($id, $view, $pdfName);
    }

    /**
     * @param mixed $id
     * @param mixed $view
     * @param mixed $pdfName
     * @return \Illuminate\Http\Response
     */
    public function getPdf($id, $view, $pdfName)
    {
        $session_id = session('company_id') ?? 1;
        $quotation = Quotation::where("id", $id)->first();
        if($quotation->company_id != $session_id){
            $this->returnBack();
            return redirect('/quotation');
        }
        $consigneeDetails = "";
        $symbol = Currency::where("id", '=', $quotation->currency_id)->first();
        $incoTerm = IncoTerm::where('id', $quotation->inco_term_id)->first();
        $buyerDetails = Customer::leftJoin('countries', 'countries.id', '=', 'customers.country_id')
            ->get(['customers.*', 'countries.name as country_name'])
            ->where("id", $quotation->buyer_id)->first();

        if ($quotation->consignee_id) {

            $consigneeDetails = Consignee::leftJoin('countries', 'countries.id', '=', 'consignees.country')
                ->leftJoin('states', 'states.id', '=', 'consignees.state')
                ->get(['consignees.*', 'countries.name as country_name', 'states.name as state_name'])
                ->where("id", $quotation->consignee_id)
                ->first();
        }
        $quotationProducts =  QuotationProduct::leftJoin('products', 'products.id', '=', 'quotation_products.product_id')
            ->get(['quotation_products.*', 'products.hsn_code_id as hsn', 'products.model_name as model_name', 'products.product_code as product_code'])
            ->where('pi_order_id', $quotation->id);

        $bankDetails = BankAccount::where('id', $quotation->bank_id)->first();

        $data = [
            'quotation' => $quotation,
            'quotationProducts' => $quotationProducts,
            'buyerDetails' => $buyerDetails,
            'consigneeDetails' => $consigneeDetails,
            'bankDetails' => $bankDetails,
            'symbol' => $symbol,
            'incoTerm' => $incoTerm
        ];
        $pdf = Pdf::loadView($view, $data, ['isHtml5ParserEnabled' => true, 'enable_php' => true]);
        $pdfContent = $pdf->output();
        $filename = $id . '-' . $pdfName . '.pdf';
        $headers = [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => "attachment; filename=\"{$filename}\"",
                ];
        return response($pdfContent, 200, $headers);
    }

    public function getCustomerConsignee(Request $request)
    {
        $consignees = Consignee::select('id','name')->where('customer_id', $request->customer_id)->get();
        if (count($consignees) > 0) {
            return response()->json($consignees);
        } else {
            return 0;
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getQuoteProduct(Request $request)
    {
        $product = Product::select('*')->where('id', $request->id)->first();
        return response()->json($product);
    }

    public function createNextQuotationId()
    {
        $quo = new Quotation;
        return response()->json($quo->getLatestId());
    }
}
