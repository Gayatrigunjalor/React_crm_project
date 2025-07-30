<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Ffd;
use App\Models\Vendor;
use App\Models\Product;
use App\Models\BankDetails;
use App\Models\BusinessTaskEdit;
use App\Models\BusinessTaskView;
use Illuminate\Http\Request;
use App\Models\PurchaseOrder;
use App\Models\CompanyDetails;
use App\Models\BusinessTask;
use App\Models\PaymentHistoryBt;
use App\Models\PaimentHistoryPaidAmountBt;
use App\Models\PaymentHistoryAttachmentBt;
use App\Models\ProductVendor;
use App\Models\TermsAndConditions;
use App\Models\PurchaseOrderProduct;
use App\Models\PO_Quotation_AttachmentModel;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Notifications\CheckerNotification;
use Illuminate\Support\Facades\Notification;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Session;

class PurchaseOrderController extends Controller
{
    protected $poAttachmentPath = 'uploads/purchase-order/quotations/';
    protected $session_id = null;

    private function returnBack(){
        Session::flash('incorrect_company_id', 'The Purchase Order you are trying to access is created from different company, to access it please switch company from the navbar.');
    }
    public function __construct()
    {
        $this->session_id = session('company_id') ?? 1;
    }
    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function index()
    {
        $this->authorize('purchase_order_list');

        $purchaseOrders = PurchaseOrder::select('id','purchase_order_number','order_date','expected_delivery_date','po_type','ffd_id','vendor_id','business_task_id','grand_total','company_id')
        ->where('company_id', $this->session_id)
        ->with(['quotation_attach:id,po_id,name', 'ffd:id,ffd_name', 'vendor:id,name'])
        ->orderBy('id', 'desc')
        ->get();
        return response()->json($purchaseOrders);
    }


    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function po_listing(Request $request)
    {
        $sort = 'desc';
        if($request->has('sort')){
            $sort = $request->sort;
        }

        $purchaseOrders = PurchaseOrder::select('id', 'purchase_order_number')->orderBy('id', $sort)->get();
        return response()->json($purchaseOrders, 200);
    }

    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function po_vendor_only_listing(Request $request)
    {
        $sort = 'desc';
        if($request->has('sort')){
            $sort = $request->sort;
        }

        $purchaseOrders = PurchaseOrder::select('id', 'purchase_order_number')->where('po_type', '!=', 'ffd')->orderBy('id', $sort)->get();
        return response()->json($purchaseOrders, 200);
    }

    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function getNextPOId()
    {
        $this->authorize('purchase_order_create');
        $quo = new PurchaseOrder;
        return $quo->getLatestId();
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // dd($request->all());
        $this->authorize('purchase_order_create');

        $this->validate($request, [
            'po_type' => 'required|string',
            'order_date' => 'required|date_format:Y-m-d',
            'expected_delivery_date' => 'required|date_format:Y-m-d',
            'employee_name' => 'required|string',
            'document_type' => 'required|string',
            'grand_total' => 'required',
            'quotations_attachment.files.*' => 'max:5120',
        ]);
        if($request->po_type == 'ffd'){
            $this->validate($request, [
                'ffd_id' => 'required|integer'
            ]);
        }
        if($request->po_type == 'goods'){
            $this->validate($request, [
                'vendor_id' => 'required|integer',
                'business_task_id' => 'required|integer'
            ]);
        }
        $quo = new PurchaseOrder;

        $reqArray = [];
        $reqArray['purchase_order_number']  = $quo->getLatestId();
        $reqArray['order_date']             = date('Y-m-d');
        $reqArray['expected_delivery_date'] = date('Y-m-d', strtotime($request->expected_delivery_date));
        $reqArray['vendor_id']              = $request->vendor_id ?? null;
        $reqArray['po_type']                = $request->po_type ?? 'goods';
        $reqArray['ffd_id']                 = $request->ffd_id != 0 ? $request->ffd_id : null;
        $reqArray['document_type']          = $request->document_type;
        $reqArray['employee_name']          = $request->employee_name;
        $reqArray['state_code']             = $request->state_code;
        $reqArray['currency_id']            = $request->currency_id;
        $reqArray['business_task_id']       = $request->business_task_id;
        $reqArray['exchange_rate']          = $request->exchange_rate;
        $reqArray['port_of_loading']        = $request->port_of_loading;
        $reqArray['port_of_discharge']      = $request->port_of_discharge;
        $reqArray['final_destination']      = $request->final_destination;
        $reqArray['origin_country']         = $request->origin_country;
        $reqArray['inco_term_id']           = $request->inco_term_id;
        $reqArray['net_weight']             = $request->net_weight;
        $reqArray['gross_weight']           = $request->gross_weight;
        $reqArray['shp_charge']             = $request->shp_charge;
        $reqArray['pkg_charge']             = $request->pkg_charge;
        $reqArray['other_charge']           = $request->other_charge;
        $reqArray['total']                  = $request->total;
        $reqArray['igst']                   = $request->igst;
        $reqArray['cgst']                   = $request->cgst;
        $reqArray['sgst']                   = $request->sgst;
        $reqArray['grand_total']            = $request->grand_total;
        $reqArray['terms_and_conditions']   = $request->terms_and_conditions;
        $reqArray['approved']               = true;
        $reqArray['created_by']             = Auth::id() ?? 1;
        $reqArray['company_id']             = session('company_id') ?? 1;

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

        $purchaseOrder = PurchaseOrder::create($reqArray); //create quotations data

        if (!empty($purchaseOrder->id)) {
            //add quotations product in quotation_products table
            $po_item_ids = [];
            foreach($request->products as $product){
                $dataProduct = [
                    'product_name' => $product['title'],
                    'purchase_order_id' => $purchaseOrder->id,
                    'product_id' => $product['prod_id'],
                    'quantity' => $product['quantity'],
                    'tax' => $product['tax'],
                    'tax_amount' => $product['taxAmount'],
                    'rate' => $product['rate'],
                    'rate_with_tax' => $product['rateWithTax'],
                    'amount' => $product['amount'],
                ];
                $po_product = PurchaseOrderProduct::updateOrInsert(['id' => $product['pp_id']],$dataProduct);
                if (!empty($po_product->id)) {
                    array_push($po_item_ids, $po_product->id);
                }
            }
            $po_item_ids = implode(",", $po_item_ids);
            //update quotations product IDs in quotations record
            PurchaseOrder::find($purchaseOrder->id)->update(['purchase_order_product_ids' => $po_item_ids]);
        }
        if (!empty($purchaseOrder->id)) {
            //add attachments
            if ($request->hasfile('quotations_attachment')) {
                foreach ($request->quotations_attachment as $tp) {
                    $poAttachName = 'po_quotations_' .date('YmdHis'). '_' .rand(10000, 99999). "." . $tp->getClientOriginalExtension();
                    Storage::put($this->poAttachmentPath . $poAttachName, file_get_contents($tp));
                    $data = array(
                        'po_id' => $purchaseOrder->id,
                        'name' => $poAttachName,
                        'attachment_type' => 'Quotations Attachment',
                        'attachment_details' => '',
                        'created_by' => Auth::id()
                    );
                    PO_Quotation_AttachmentModel::create($data);
                }
            }
        }
        // if (Auth::user()->user_role != 0) {
            // $checker = User::find(Auth::id());
            // $checkerData = [
            //     'subject' => 'New Purchase Order Created',
            //     'body' => 'New Purchase Order Is Created by ' . $checker->employeeDetail->name . ' Please Check It',
            //     'url' => '/purchaseOrderChecker',
            //     'form_id' => $purchaseOrder->id
            // ];
            // if ($checker->checkers->purchase_order_c1 != null) {
            //     $userSchema = User::find($checker->checkers->purchase_order_c1);
            //     PurchaseOrder::find($purchaseOrder->id)->update(array('checker_id' => 1));
            //     Notification::send($userSchema, new CheckerNotification($checkerData));
            // } elseif ($checker->checkers->purchase_order_admin_approve == 1) {
            //     $userSchema = User::find(1);
            //     PurchaseOrder::find($purchaseOrder->id)->update(array('checker_id' => 0));
            //     Notification::send($userSchema, new CheckerNotification($checkerData));
            // } else {
            //     PurchaseOrder::find($purchaseOrder->id)->update(array('approved' => true));
            // }
        // }
        return response()->json(['success' => true, 'message' => 'Purchase Order created successfully'], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePo(Request $request)
    {
        $this->authorize('purchase_order_edit');
        $this->validate($request, [
            'po_type'              => 'required',
            'document_type'         => 'required',
            'total'                 => 'required',
            'grand_total'           => 'required',
            'terms_and_conditions'  => 'required'
        ]);
        $reqArray = [];

        $reqArray['purchase_order_number'] = $request->purchase_order_number;
        $reqArray['order_date'] = $request->order_date;
        $reqArray['expected_delivery_date'] = $request->expected_delivery_date;
        $reqArray['vendor_id'] = $request->vendor_id ?? null;
        $reqArray['po_type'] = $request->po_type ?? 'goods';
        $reqArray['ffd_id'] = $request->ffd_id;
        $reqArray['business_task_id'] = $request->business_task_id;
        $reqArray['employee_name'] = $request->employee_name;
        $reqArray['document_type'] = $request->document_type;
        $reqArray['state_code'] = $request->state_code;
        $reqArray['currency_id'] = $request->currency_id;
        $reqArray['exchange_rate'] = $request->exchange_rate;
        $reqArray['port_of_loading'] = $request->port_of_loading;
        $reqArray['port_of_discharge'] = $request->port_of_discharge;
        $reqArray['final_destination'] = $request->final_destination;
        $reqArray['origin_country'] = $request->origin_country;
        $reqArray['inco_term_id'] = $request->inco_term_id;
        $reqArray['net_weight'] = $request->net_weight;
        $reqArray['gross_weight'] = $request->gross_weight;
        $reqArray['shp_charge'] = $request->shp_charge;
        $reqArray['pkg_charge'] = $request->pkg_charge;
        $reqArray['other_charge'] = $request->other_charge;
        $reqArray['total'] = $request->total;
        $reqArray['igst'] = $request->igst;
        $reqArray['cgst'] = $request->cgst;
        $reqArray['sgst'] = $request->sgst;
        $reqArray['grand_total'] = $request->grand_total;
        $reqArray['terms_and_conditions'] = $request->terms_and_conditions;

        if($reqArray['po_type'] != 'ffd'){
            $reqArray['ffd_id'] = null;
        }

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
        } else {
            $reqArray['state_code'] = null;
            $reqArray['igst'] = null;
            $reqArray['cgst'] = null;
            $reqArray['sgst'] = null;
        }
        PurchaseOrder::find($request->id)->update($reqArray);
        if($request->po_type != 'ffd'){
            if(!empty($request->products)) {
                foreach($request->products as $product){
                    //add products where pp_id == 0
                    if($product['pp_id'] == 0){
                        $dataProduct = [
                            'product_name' => $product['title'],
                            'purchase_order_id' => $request->id,
                            'product_id' => $product['prod_id'],
                            'quantity' => $product['quantity'],
                            'tax' => $product['tax'],
                            'tax_amount' => $product['taxAmount'],
                            'rate' => $product['rate'],
                            'rate_with_tax' => $product['rateWithTax'],
                            'amount' => $product['amount'],
                        ];
                        PurchaseOrderProduct::create($dataProduct);
                    }
                }
            }
            $purch_order_item_ids = [];
            $row = PurchaseOrderProduct::select('id')->where('purchase_order_id', $request->id)->get()->toArray();
            foreach($row as $qp){
                $purch_order_item_ids[] = $qp['id'];
            }
            $prodIds['purchase_order_product_ids'] = implode(",", $purch_order_item_ids);
            PurchaseOrder::find($request->id)->update($prodIds);
        }

        //add attachments
        if ($request->hasfile('quotations_attachment')) {
            foreach ($request->quotations_attachment as $tp) {
                $poAttachName = 'po_quotations_' .date('YmdHis'). '_' .rand(10000, 99999). "." . $tp->getClientOriginalExtension();
                Storage::put($this->poAttachmentPath . $poAttachName, file_get_contents($tp));
                $data = array(
                    'po_id' => $request->id,
                    'name' => $poAttachName,
                    'attachment_type' => 'Purchase Order Attachment',
                    'attachment_details' => '',
                    'created_by' => Auth::id()
                );
                PO_Quotation_AttachmentModel::create($data);
            }
        }

        return response()->json(['success'=> true, 'message' => "Purchase Order details updated successfully!"], 200);
    }

    /**
     * @param mixed $id
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function show($id)
    {
        $this->authorize('purchase_order_edit');
        $purchaseOrder = PurchaseOrder::with([
            'vendor:id,name',
            'inco:id,inco_term',
            'currency',
            'po_products',
            'ffd:id,ffd_name',
            'quotation_attach:id,po_id,name',
            'business_task:id,customer_name'
        ])->find($id);
        if($purchaseOrder){
            return response()->json($purchaseOrder, 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Purchase Order not found'], 404);
        }
        // if($purchaseOrder->company_id != $this->session_id){
        //     $this->returnBack();
        //     return redirect()->back('purchase-order');
        // }
        $purchaseProducts = PurchaseOrderProduct::leftJoin('products', 'products.id', '=', 'purchase_order_products.product_id')
            ->get(['purchase_order_products.*', 'products.model_name as model_name', 'products.printable_description as product_description'])
            ->where('purchase_order_id', $id);

        return response()->json();
    }

    // /**
    //  * @param mixed $id
    //  * @return \Illuminate\Http\Response
    //  */
    public function pdfWithSignature($id)
    {
        $purchaseOrder = PurchaseOrder::with(['inco','currency'])->find($id);
        // if($purchaseOrder->company_id != $this->session_id){
        //     $this->returnBack();
        //     return redirect()->back('purchase-order');
        // }
        $ffd_name = '';
        if($purchaseOrder->ffd_id != null){
            $ffd = Ffd::find($purchaseOrder->ffd_id);
            $ffd_name = $ffd->ffd_name;
        }

        $vendorDetails = Vendor::where("id", $purchaseOrder->vendor_id)->first();
        $purchaseProducts = PurchaseOrderProduct::leftJoin('products', 'products.id', '=', 'purchase_order_products.product_id')
            ->get(['purchase_order_products.*', 'products.model_name as model_name', 'products.printable_description as product_description', 'products.product_code as product_code'])
            ->where('purchase_order_id', $purchaseOrder->id);
        if ($purchaseOrder->document_type == "Domestic") {
            $order = "Domestic Purchase Order";
        } else {
            $order = "International Purchase Order";
        }
        $termsAndConditions = TermsAndConditions::where('order', $order)->first();
        $companyDetails = CompanyDetails::where('id', $this->session_id)->first();
        $bankDetails = BankDetails::where('id', '1')->first();
        $data = [
            'pdf_title' => 'Purchase Order',
            'signature'    => 'Yes',
            'purchaseOrder' => $purchaseOrder,
            'vendorDetails' => $vendorDetails,
            'purchaseProducts' => $purchaseProducts,
            'termsAndConditions' => $termsAndConditions,
            'companyDetails' => $companyDetails,
            'bankDetails' => $bankDetails,
            'ffd_name'    => $ffd_name
        ];
        $pdf = Pdf::setOptions(['isHtml5ParserEnabled' => true, 'enable_php' => true])
            ->loadView('admin.purchase-order.order_pdf', $data);
        return $pdf->stream($id . '.pdf');
    }

    /**
     * @param mixed $id
     * @return \Illuminate\Http\Response
     */
    public function pdfWithOutSignature($id)
    {
        $purchaseOrder = PurchaseOrder::with(['inco','currency'])->find($id);
        // if($purchaseOrder->company_id != $this->session_id){
        //     $this->returnBack();
        //     return redirect()->back('purchase-order');
        // }
        $ffd_name = '';
        if($purchaseOrder->ffd_id != null){
            $ffd = Ffd::find($purchaseOrder->ffd_id);
            $ffd_name = $ffd->ffd_name;
        }
        $vendorDetails = Vendor::where("id", $purchaseOrder->vendor_id)->first();
        $purchaseProducts = PurchaseOrderProduct::leftJoin('products', 'products.id', '=', 'purchase_order_products.product_id')
            ->get(['purchase_order_products.*', 'products.model_name as model_name', 'products.printable_description as product_description', 'products.product_code as product_code'])
            ->where('purchase_order_id', $purchaseOrder->id);
        if ($purchaseOrder->document_type == "Domestic") {
            $order = "Domestic Purchase Order";
        } else {
            $order = "International Purchase Order";
        }
        $termsAndConditions = TermsAndConditions::where('order', $order)->first();
        $companyDetails = CompanyDetails::where('id', '1')->first();
        $bankDetails = BankDetails::where('id', '1')->first();
        $data = [
            'pdf_title' => 'Purchase Order',
            'signature'    => 'No',
            'purchaseOrder' => $purchaseOrder,
            'vendorDetails' => $vendorDetails,
            'purchaseProducts' => $purchaseProducts,
            'termsAndConditions' => $termsAndConditions,
            'companyDetails' => $companyDetails,
            'bankDetails' => $bankDetails,
            'ffd_name'    => $ffd_name
        ];
        $pdf = Pdf::setOptions(['isHtml5ParserEnabled' => true, 'enable_php' => true])
            ->loadView('admin.purchase-order.order_pdf', $data);
        return $pdf->stream($id . '.pdf');
    }

    // /**
    //  * @param  \Illuminate\Http\Request  $request
    //  * @return \Illuminate\Http\JsonResponse
    //  */
    // public function getProductWithVendorAmount(Request $request)
    // {
    //     $productDetails = Product::find($request->id);
    //     $vendorRate = ProductVendor::where('product_id', $productDetails->product_code)->where('vendor_id', $request->vendor_id)->first();
    //     $productDetails['vendorRate'] = $vendorRate->purchase_price;
    //     return response()->json($productDetails);
    // }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPOVendorName(Request $request)
    {
        $poDetails = PurchaseOrder::with('vendor')->find($request->po_id);
        return response()->json($poDetails->vendor->name);
    }

    // /**
    //  * @param  \Illuminate\Http\Request  $request
    //  * @return \Illuminate\Http\JsonResponse
    //  */
    // public function getPOPaymentHistory(Request $request)
    // {
    //     $poDetails = PurchaseOrder::find($request->id);

    //     return response()->json($poDetails);
    // }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPaymentHistories(Request $request)
    {
        $purchase_order = PurchaseOrder::select('id','purchase_order_number', 'order_date','po_type','ffd_id','vendor_id','document_type','total','igst','cgst','sgst','grand_total','business_task_id')
            ->with(['vendor:id,name', 'business_task:id,customer_name'])
            ->find($request->po_id);
        $payDetails = PaymentHistoryBt::where('po_id', $request->po_id)->get();
        // $payDetails = PaymentHistoryBt::with(['histories', 'histories.attachments'])->where('po_id', $request->po_id)->first();

        return response()->json(['po_details' => $purchase_order,'paydetails' => $payDetails]);
    }

    // /**
    //  * @param  \Illuminate\Http\Request  $request
    //  * @return \Illuminate\Http\JsonResponse
    //  */
    // public function link_PO_to_BT(Request $request)
    // {
    //     $poDetails = PurchaseOrder::find($request->purchase_order_id);
    //     if($poDetails->business_task_id == null) {
    //         $poDetails->update(['business_task_id' => $request->business_task_id]);

    //         return response()->json(["status" => 'BT ID Updated'],200);
    //     } else {
    //         return response()->json(["message" => 'BT ID already attached with - '.$poDetails->purchase_order_number.'!'],422);
    //     }

    // }

    // /**
    //  * @param  \Illuminate\Http\Request  $request
    //  * @return \Illuminate\Http\JsonResponse
    //  */
    // public function link_BT_TO_PO(Request $request)
    // {
    //     $poDetails = PurchaseOrder::find($request->purchase_o_id);
    //     $poDetails->update(['business_task_id' => $request->business_task_id]);
    //     return response()->json(["status" => 'BT ID Updated'],200);
    // }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addPayment(Request $request)
    {
        $this->validate($request, [
            'purchase_order_id' => 'required|integer',
            'paid_amount' => 'required|numeric',
            'bank_name' => 'required|string',
            'utr_number' => 'required|string',
            'utr_date' => 'required|string',
            'payment_history_attach' => 'required|max:2048'
        ], [
            'payment_history_attach.required' => 'Attachment is required.',
            'payment_history_attach.max' => 'Maximum attachment file size is 2MB.'
        ]);

        $btId = ($request->business_task_id != 0) ? $request->business_task_id : null;

        $history = PaymentHistoryBt::create([
            'po_id' => $request->purchase_order_id,
            'po_invoice_number' => $request['purchase_order']['purchase_order_number'],
            'po_invoice_amount' => $request->po_invoice_amount,
            'paid_amount' => $request->paid_amount,
            'balance_amount' => $request->po_balance_amount - $request->paid_amount,
            'business_task_id' => $btId,
            'gst_rate' => $request->gst_percent,
            'gst_amount' => $request->gst_amount,
            'tds_rate' => $request->tds_deduction,
            'tds_amount' => $request->tds_amount,
            'gst_type' => 'Gst',
            'bank_name' => $request->bank_name,
            'utr_number' => $request->utr_number,
            'utr_date' => $request->utr_date,
            'created_by' => Auth::id()
        ]);

        PaimentHistoryPaidAmountBt::create([
            'payment_history_id' => $history->id,
            'paid_amount' => $request->paid_amount,
            'bank_name' => $request->bank_name,
            'utr_number' => $request->utr_number,
            'utr_date' => $request->utr_date,
            'created_by' => Auth::id()
        ]);

        $data = array(
            'payment_history_id' => $history->id,
            'attachment_name' => "",
            'attachment_details' => "",
            'created_by' => Auth::id()
        );
        if ($request->hasFile('payment_history_attach')) {
            $attachment = $request->file('payment_history_attach');
            $attachmentName = date('YmdHis_') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/business-task/ac/payment-history/' . $attachmentName, file_get_contents($attachment));
            $data['name'] = "$attachmentName";
        }
        PaymentHistoryAttachmentBt::create($data);

        return response()->json(['success'=> true, 'message' => "Payment history added for ". $request['purchase_order']['purchase_order_number'] ." updated successfully!"], 200);
    }

    // /**
    //  * @param  \Illuminate\Http\Request  $request
    //  * @return \Illuminate\Http\JsonResponse
    //  */
    // public function addHistory(Request $request)
    // {
    //     $this->validate($request, [
    //         'po_paid_amount' => 'required|numeric',
    //         'po_invoice_amount_add' => 'numeric',
    //     ]);
    //     // dd($request->all());
    //     if(!empty($request->pay_history_id)) {
    //         // dd("here history found");
    //         $history_id = $request->pay_history_id;

    //         $payment_create = PaimentHistoryPaidAmountBt::create([
    //             'payment_history_id' => $history_id,
    //             'paid_amount' => $request->po_paid_amount,
    //             'bank_name' => $request->bank_name,
    //             'utr_number' => $request->utr_number,
    //             'utr_date' => $request->utr_date,
    //             'created_by' => auth()->id()
    //         ]);

    //         $data = array(
    //             'payment_history_id' => $payment_create->id,
    //             'attachment_name' => "",
    //             'attachment_details' => "",
    //             'created_by' => auth()->id()
    //         );
    //         if ($request->hasFile('payment_history_attach')) {
    //             $attachment = $request->file('payment_history_attach');
    //             $attachmentName = date('YmdHis_') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
    //             Storage::put('uploads/business-task/ac/payment-history/' . $attachmentName, file_get_contents($attachment));
    //             $data['name'] = "$attachmentName";
    //         }
    //         PaymentHistoryAttachmentBt::create($data);

    //         $pay_hist = PaymentHistoryBt::find($history_id);

    //         $prev_bal = $pay_hist->balance_amount;
    //         $prev_paid = $pay_hist->paid_amount;
    //         $new_bal = $prev_bal - $request->po_paid_amount;
    //         $new_paid = $prev_paid + $request->po_paid_amount;

    //         PaymentHistoryBt::find($history_id)->update(['balance_amount' => $new_bal, 'paid_amount' => $new_paid]);
    //         if($request->business_task_id != null) {
    //             PaymentHistoryBt::find($history_id)->update(['business_task_id' => $request->business_task_id]);
    //         }

    //         return response()->json(['status' => 'added'], 200);

    //     }
    // }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addQuotationAttachmentPO(Request $request)
    {
        $this->validate($request, [
            'purch_id' => 'required',
            'quotations_attachment.*' => 'max:2048'
        ]);
        // dd($request->all());
        $po = PurchaseOrder::find($request->purch_id);
        if(!empty($po->id)) {
            if ($request->hasfile('quotations_attachment')) {
                foreach ($request->file('quotations_attachment') as $tp) {
                    $vpiName = 'po_quotes_' .date('YmdHis'). '_' .rand(10000, 99999). "." . $tp->getClientOriginalExtension();
                    Storage::put($this->poAttachmentPath . $vpiName, file_get_contents($tp));
                    $data = array(
                        'po_id' => $po->id,
                        'name' => $vpiName,
                        'attachment_type' => 'Quotation',
                        'attachment_details' => '',
                        'created_by' => Auth::id()
                    );
                    PO_Quotation_AttachmentModel::create($data);
                }
            }

            return response()->json(['success' => true, 'message' => 'Attachments added successfully'], 200);

        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    public function deletePOProduct(Request $request)
    {
        $prod = PurchaseOrderProduct::find($request->id);

        if($prod){
            $po_id = $prod->purchase_order_id;
            $prod->delete();
            $purch_order_item_ids = [];
            $row = PurchaseOrderProduct::select('id')->where('purchase_order_id', $po_id)->get()->toArray();
            foreach($row as $qp){
                $purch_order_item_ids[] = $qp['id'];
            }
            $prodIds['purchase_order_product_ids'] = implode(",", $purch_order_item_ids);
            PurchaseOrder::find($po_id)->update($prodIds);
        }
        return response()->json(['success' => true, 'message' => 'Purchase order product deleted successfully!'], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    public function deletePOQuotationsAttachment(Request $request)
    {
        $this->validate($request, [
            'id' => 'required',
            'po_id' => 'required'
        ]);

        $attachment = PO_Quotation_AttachmentModel::find($request->id);
        if($attachment != null){
            if (Storage::exists($this->poAttachmentPath . $attachment->name)) {
                Storage::delete($this->poAttachmentPath . $attachment->name);
            }
        }
        $attachment->delete();

        return response()->json(['success' => true, 'message' => 'Attachment deleted successfully!'], 200);
    }
}
