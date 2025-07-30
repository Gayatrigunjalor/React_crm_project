<?php

namespace App\Http\Controllers;

use App\Models\Ffd;
use App\Models\Irm;
use App\Models\User;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\Currency;
use App\Models\Customer;
use App\Models\IncoTerm;
use App\Models\Consignee;
use App\Models\BankAccount;
use App\Models\BusinessTask;
use App\Models\InvoiceWeight;
use App\Models\FircAttachment;
use App\Models\InvoiceProducts;
use App\Models\IrmPaymentHistory;
use App\Models\RemarkInvoiceForm;
use App\Models\BuyersEmailAttachment;
use App\Models\TaxPurchaseAttachment;
use App\Models\VendorsEmailAttachment;
use App\Models\LegalContractAttachment;
use App\Models\PurchaseOrderAttachment;
use App\Models\ProfarmaInvoiceAttachment;
use App\Notifications\CheckerAllNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Session;

class InternationalTreadingController extends Controller
{
    protected $session_id = null;

    private function returnBack(){
        Session::flash('incorrect_company_id', 'The Invoice you are trying to access is created from different company, to access it please switch company from the navbar.');
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
        $this->authorize('invoice_list');
        $rows = Invoice::with(['buyer:id,name', 'consignee:id,name,contact_person'])->where('company_id', $this->session_id)->orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }
    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function create()
    {
        $this->authorize('invoice_create');
        $session_id = session('company_id') ?? 1;
        $irms = Irm::with(['currency', 'buyer', 'bank'])->where('outstanding_amount', '!=', '0')->where('company_id', $this->session_id)->orderBy('outstanding_amount', 'asc')->get();
        $products = Product::where('approved', '=', '1')->get();
        $internationalFfds = Ffd::whereIn('ffd_type', ['International', 'Both'])->get();
        $domesticFfds = Ffd::whereIn('ffd_type', ['Domestic', 'Both'])->get();
        $currencies = Currency::all();
        $incoTerms = IncoTerm::all();
        $businesstasks_inv_null = BusinessTask::whereNull('invoice_id')->orderBy('id', 'desc')->where('company_id', $this->session_id)->get()->toArray();
        $businesstasks_inv_partial = BusinessTask::select('business_tasks.*', 'invoices.id AS inv_id', 'invoices.shipment_type')
                                        ->leftJoin('invoices', 'business_tasks.invoice_id', '=', 'invoices.id')
                                        ->where('business_tasks.company_id', $this->session_id)
                                        ->where('invoices.shipment_type', '=', 'Partial')
                                        ->whereNotNull('business_tasks.invoice_id')
                                        ->orderBy('business_tasks.id', 'desc')->get()->toArray();
        $businesstasks = array_merge($businesstasks_inv_null, $businesstasks_inv_partial);
        $invoice_number = $this->generateInvoiceNumber();
        $sli_number = $this->generateSliNumber();
        $dc_number = $this->generateDcNumber();
        return view('admin.e-docs.international-treading.create', compact('invoice_number', 'sli_number', 'dc_number', 'irms', 'products', 'internationalFfds', 'domesticFfds', 'currencies', 'incoTerms', 'businesstasks'));
    }

    /**
     * @return string
     */
    public function generateInvoiceNumber()
    {
        $inv = new Invoice;
        return $inv->getLatestId();
    }

    public function getNextInvoiceId()
    {
        $inv = new Invoice;
        return response()->json($inv->getLatestId());
    }

    /**
     * @return string
     */
    public function generateSliNumber()
    {
        $query = Invoice::select('sli_number')->orderBy('sli_number', 'DESC')->skip(0)->take(1)->first();
        if (!empty($query)) {
            $value2 = substr($query->sli_number, 5, 9);
            $value2 = floatval($value2) + 1;
            return "SLI/" . sprintf('%05s', $value2);
        } else {
            return "SLI/00001";
        }
    }

    /**
     * @return string
     */
    public function generateDcNumber()
    {
        $query = Invoice::select('dc_number')->orderBy('dc_number', 'DESC')->skip(0)->take(1)->first();
        if (!empty($query)) {
            $value2 = substr($query->dc_number, 4, 10);
            $value2 = floatval($value2) + 1;
            return "DC/" . sprintf('%07s', $value2);
        } else {
            return "DC/0000001";
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {

        $this->authorize('invoice_create');
        $this->validate($request, [
            'invoice_date' => 'required|date_format:Y-m-d',
            'bank_id' => 'required|integer',
            'currency' => 'required',
            'exchange_rate' => 'required',
            'port_of_loading' => 'required',
            'port_of_discharge' => 'required',
            'final_destination' => 'required',
            'origin_country' => 'required',
            'inco_term_id' => 'required|integer',
            'total_net_weight' => 'required',
            'total_gross_weight' => 'required',
            'grand_total' => 'required',

            'irms.*.irm_id' => 'required|integer',
            'irms.*.reference_no' => 'required|string',
            'irms.*.buyer_id' => 'required|integer',
            'irms.*.currency_id' => 'required|integer',
            'irms.*.received_amount' => 'required',

            'products.*.prod_id' => 'required|integer',
            'products.*.title' => 'required|string|max:255',
            'products.*.printable_description' => 'required|string',
            'products.*.hsn_code_id' => 'required|integer',
            'products.*.quantity' => 'required',
            'products.*.rate' => 'required',
            'products.*.amount' => 'required',

            'marks_packages.*.net_wt' => 'required|numeric',
            'marks_packages.*.gross_wt' => 'required|numeric',
            'marks_packages.*.vol_wt' => 'required|numeric',
            'marks_packages.*.noofboxes' => 'required|numeric',
            'marks_packages.*.l_wt' => 'required|numeric',
            'marks_packages.*.b_wt' => 'required|numeric',
            'marks_packages.*.h_wt' => 'required|numeric',
        ]);

        DB::beginTransaction();

        try {
            // All DB operations moved under transactions
            $invoice = $this->storeInvoice($request);
            if (!empty($invoice->id)) {
                $this->balancingAmount($request, $invoice->id, $request->grand_total);
                $this->storeProducts($request, $invoice->id);
                $this->storeWeights($request, $invoice->id);
                $this->updateBusinessTask($request, $invoice->id);
                if ($request->hasfile('proforma_invoice_attachment')) {
                    foreach ($request->file('proforma_invoice_attachment') as $pi) {
                        $piName = date('YmdHis_') .rand(10000, 99999). "." . $pi->getClientOriginalExtension();
                        Storage::put('uploads/international-trade/proforma-invoice-attachment/' . $piName, file_get_contents($pi));
                        $data = array(
                            'attachment_name' => $piName,
                            'invoice_id' => $invoice->id
                        );
                        ProfarmaInvoiceAttachment::create($data);
                    }
                }
                if ($request->hasfile('tax_purchase_attachment')) {
                    foreach ($request->file('tax_purchase_attachment') as $tp) {
                        $tpName = date('YmdHis_') .rand(10000, 99999). "." . $tp->getClientOriginalExtension();
                        Storage::put('uploads/international-trade/tax-purchase-attachment/' . $tpName, file_get_contents($tp));
                        $data = array(
                            'attachment_name' => $tpName,
                            'invoice_id' => $invoice->id
                        );
                        TaxPurchaseAttachment::create($data);
                    }
                }
                if ($request->hasfile('firc_attachment')) {
                    foreach ($request->file('firc_attachment') as $fi) {
                        $fiName = date('YmdHis_') .rand(10000, 99999). "." . $fi->getClientOriginalExtension();
                        Storage::put('uploads/international-trade/firc-attachment/' . $fiName, file_get_contents($fi));
                        $data = array(
                            'attachment_name' => $fiName,
                            'invoice_id' => $invoice->id
                        );
                        FircAttachment::create($data);
                    }
                }

                if ($request->hasfile('legal_contract_attachment')) {
                    foreach ($request->file('legal_contract_attachment') as $lc) {
                        $lcName = date('YmdHis_') .rand(10000, 99999). "." . $lc->getClientOriginalExtension();
                        Storage::put('uploads/international-trade/legal-contract-attachment/' . $lcName, file_get_contents($lc));
                        $data = array(
                            'attachment_name' => $lcName,
                            'invoice_id' => $invoice->id
                        );
                        LegalContractAttachment::create($data);
                    }
                }

                if ($request->hasfile('buyers_email_attachment')) {
                    foreach ($request->file('buyers_email_attachment') as $be) {
                        $beName = date('YmdHis_') .rand(10000, 99999). "." . $be->getClientOriginalExtension();
                        Storage::put('uploads/international-trade/buyers-email-attachment/' . $beName, file_get_contents($be));
                        $data = array(
                            'attachment_name' => $beName,
                            'invoice_id' => $invoice->id
                        );
                        BuyersEmailAttachment::create($data);
                    }
                }

                if ($request->hasfile('vendors_email_attachment')) {
                    foreach ($request->file('vendors_email_attachment') as $ve) {
                        $veName = date('YmdHis_') .rand(10000, 99999). "." . $ve->getClientOriginalExtension();
                        Storage::put('uploads/international-trade/vendors-email-attachment/' . $veName, file_get_contents($ve));
                        $data = array(
                            'attachment_name' => $veName,
                            'invoice_id' => $invoice->id
                        );
                        VendorsEmailAttachment::create($data);
                    }
                }

                if ($request->hasfile('purchase_order_attachment')) {
                    foreach ($request->file('purchase_order_attachment') as $po) {
                        $poName = date('YmdHis_') .rand(10000, 99999). "." . $po->getClientOriginalExtension();
                        Storage::put('uploads/international-trade/purchase-order-attachment/' . $poName, file_get_contents($po));
                        $data = array(
                            'attachment_name' => $poName,
                            'invoice_id' => $invoice->id
                        );
                        PurchaseOrderAttachment::create($data);
                    }
                }
            }

            DB::commit();
            return response()->json(['success' => true, 'message' => 'Invoice created successfully'], 200);
        } catch (\Exception $e) {
            // Handle the exception
            DB::rollBack();
            Log::error("Error while creating Invoice " . json_encode($e->getMessage()));
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param mixed $request
     * @return \Illuminate\Database\Eloquent\Model
     */

    public function storeInvoice($request)
    {
        if (!empty($request->business_task)) {
            $business_task_ids = [];
            foreach ($request->business_task as $bt ) {
                array_push($business_task_ids, $bt['value']);
            }
            $business_task_ids = implode(",", $business_task_ids);
        }
        return Invoice::create([
            'invoice_number' => $this->generateInvoiceNumber(),
            'invoice_date' => $request->invoice_date,
            'bank_id' => $request->bank_id,
            'currency' => $request->currency,
            'exchange_rate' => $request->exchange_rate,
            'port_of_loading' => $request->port_of_loading,
            'port_of_discharge' => $request->port_of_discharge,
            'final_destination' => $request->final_destination,
            'origin_country' => $request->origin_country,
            'inco_term_id' => $request->inco_term_id,
            'total_net_weight' => $request->total_net_weight,
            'total_gross_weight' => $request->total_gross_weight,
            'grand_total' => $request->grand_total,
            // 'invoice_product_ids' => $request->invoice_product_ids,
            'quotation_id' => $request->quotation_id,
            'po_number' => $request->po_number,
            'po_date' => $request->po_date,
            'sli_number' => $request->sli_number,
            'dc_number' => $request->dc_number,
            'remmittance_value' => $request->remmittance_value,
            'received_amount' => $request->total_received_irm_amount,
            'shipment_type' => $request->shipment_type,
            'total_value_weight' => $request->total_value_weight,
            'freight_weight' => $request->freight_weight,
            'pre_carriage_by' => $request->pre_carriage_by,
            'placereceiptprecarrier' => $request->placereceiptprecarrier,
            'payment_terms' => $request->payment_terms,
            'vessel_no' => $request->vessel_no,
            'no_of_packages' => $request->no_of_packages,
            'international_ffd_id' => $request->international_ffd_id,
            'lut_export_under_bond' => $request->lut_export_under_bond,
            'exportpaymentofigst' => $request->exportpaymentofigst,
            'nature_of_payment' => $request->nature_of_payment,
            'exw_value' => $request->exw_value,
            'domestic_ffd_id' => $request->domestic_ffd_id,
            'insurance' => $request->insurance,
            'commission' => $request->commission,
            'discount' => $request->discount,
            'free_trade_sample' => $request->free_trade_sample,
            'eou_shipping_bill' => $request->eou_shipping_bill,
            'duty_drawback' => $request->duty_drawback,
            'epcg_shipping_bill' => $request->epcg_shipping_bill,
            'licenceshippingbill' => $request->licenceshippingbill,
            'rebate_of_state_levies' => $request->rebate_of_state_levies,
            'repair_and_return' => $request->repair_and_return,
            'advance_authorization' => $request->advance_authorization,
            'drwaback_or_rosctl' => $request->drwaback_or_rosctl,
            'epcg' => $request->epcg,
            'nfei' => $request->nfei,
            'jobbing' => $request->jobbing,
            're_export' => $request->re_export,
            'drawback_epcg' => $request->drawback_epcg,
            'eou' => $request->eou,
            'mesi' => $request->mesi,
            'any_other' => $request->any_other,
            'dbk_sl_no' => $request->dbk_sl_no,
            'regnnoanddtofepcglic' => $request->regnnoanddtofepcglic,
            'regnnodtepcglicregcopy' => $request->regnnodtepcglicregcopy,
            'noadditionaldocrequire' => $request->noadditionaldocrequire,
            'orginable' => $request->orginable,
            'invoice_copies' => $request->invoice_copies,
            'packing_list_copies' => $request->packing_list_copies,
            'non_dg_declaration' => $request->non_dg_declaration,
            'lab_analysis_report' => $request->lab_analysis_report,
            'msds' => $request->msds,
            'phytosanitary_cert' => $request->phytosanitary_cert,
            'visa_aepc_endorsement' => $request->visa_aepc_endorsement,
            'letter_to_dc' => $request->letter_to_dc,
            'gspcertificateoforigin' => $request->gspcertificateoforigin,
            'bank_certificate' => $request->bank_certificate,
            'annexure_a' => $request->annexure_a,
            'invitemnumberregno' => $request->invitemnumberregno,
            'invitemnumberregnodate' => $request->invitemnumberregnodate,
            'authorization_epcg' => $request->authorization_epcg,
            'method_of_valuation' => $request->method_of_valuation,
            'buyer_saller_related' => $request->buyer_saller_related,
            'buyersallerprice' => $request->buyersallerprice,
            'tracking_or_awb_number' => $request->tracking_or_awb_number,
            'ein_no' => $request->ein_no,
            'under_lut' => $request->under_lut,
            'special_instuction' => $request->special_instuction,
            'preferentialagreement' => $request->preferentialagreement,
            'standardunitdetails' => $request->standardunitdetails,
            'state_of_origin_item' => $request->state_of_origin_item,
            'districtoforiginitem' => $request->districtoforiginitem,
            'exporter_type' => $request->exporter_type,
            'evd' => $request->evd,
            'remarks' => $request->remarks,
            'ad_code' => $request->ad_code,
            'allSymbol' => $request->allSymbol,
            'volum_range' => $request->volum_range,
            'duty_free_commercial' => $request->duty_free_commercial,
            'non_drawback' => $request->non_drawback,
            'advathoepcddtlregno' => $request->advathoepcddtlregno,
            'pickupreferencenumber' => $request->pickupreferencenumber,
            'sdf_fema_declaration' => $request->sdf_fema_declaration,
            'extratermsconditions' => $request->extratermsconditions,
            'nature_of_transaction' => $request->nature_of_transaction,
            'business_task_id' => $business_task_ids,
            'created_by' => Auth::id(),
            'company_id' => session('company_id') ?? 1,
            'approved' => true
        ]);
    }

    /**
     * @param mixed $request
     * @param mixed $invoice_id
     * @return bool|int
     */

    public function storeProducts($request, $invoice_id)
    {
        if (!empty($request->products)) {
            $invoice = Invoice::select('id','invoice_product_ids')->find($invoice_id);
            if (!empty($invoice->invoice_product_ids)) {
                $invoice_item_ids = explode(",", $invoice->invoice_product_ids);
            } else {
                $invoice_item_ids = [];
            }
            foreach ($request->products as $prod) {
                if($prod['inv_prod_id'] == 0) {
                    $invoice_item_id = InvoiceProducts::create([
                        'product_name' => $prod['title'],
                        'invoice_id' => $invoice_id,
                        'product_id' => $prod['prod_id'],
                        'description' => $prod['printable_description'],
                        'hsn' => $prod['hsn_code_id'],
                        'quantity' => $prod['quantity'],
                        'unit' => $prod['unit'],
                        'rate' => $prod['rate'],
                        'amount' => $prod['amount'],
                    ]);
                    if (!empty($invoice_item_id->id)) {
                        array_push($invoice_item_ids, $invoice_item_id->id);
                    }
                }
            }
            $invoice_item_ids = implode(",", $invoice_item_ids);

            return Invoice::find($invoice_id)->update(['invoice_product_ids' => $invoice_item_ids]);
        } else {
            return 0;
        }
    }

    /**
     * @param mixed $request
     * @param mixed $invoice_id
     * @return bool|int
     */
    public function storeWeights($request, $invoice_id)
    {
        if (!empty($request->marks_packages)) {
            $invoice = Invoice::select('id','invoice_weight_ids')->find($invoice_id);
            if (!empty($invoice->invoice_weight_ids)) {
                $invoice_weight_ids = explode(",", $invoice->invoice_weight_ids);
            } else {
                $invoice_weight_ids = [];
            }

            foreach ($request->marks_packages as $pack) {
                if($pack['id'] == 0) {
                    $invoice_weight_id = InvoiceWeight::create([
                        'invoice_id' => $invoice_id,
                        'net_wt' => $pack['net_wt'],
                        'gross_wt' => $pack['gross_wt'],
                        'vol_wt' => $pack['vol_wt'],
                        'noofboxes' => $pack['noofboxes'],
                        'l_wt' => $pack['l_wt'],
                        'b_wt' => $pack['b_wt'],
                        'h_wt' => $pack['h_wt'],
                    ]);
                }
                if (!empty($invoice_weight_id->id)) {
                    array_push($invoice_weight_ids, $invoice_weight_id->id);
                }
            }
            $invoice_weight_ids = implode(",", $invoice_weight_ids);

            return Invoice::find($invoice_id)->update(['invoice_weight_ids' => $invoice_weight_ids]);
        } else {
            return 0;
        }
    }

    /**
     * @param mixed $request
     * @param mixed $invoice_id
     * @param mixed $invoice_amount
     * @return bool|int
     */
    public function balancingAmount($request, $invoice_id, $invoice_amount, $updateInv=null)
    {
        if (!empty($request->irms)) {
            $actual_invoice_amount = $invoice_amount;
            $invoice_irm_ids = [];
            $buyer_ids = [];
            $consignee_ids = [];
            $received_amount = 0;

            foreach ($request->irms as $irm) {
                if($irm['irm_pay_history_id'] == 0) {
                    $received_amount = $irm['received_amount'];
                    $difference = $received_amount - $invoice_amount;
                    //positive difference
                    if($difference == 0)
                    {
                        $outstanding_amount = 0;
                    }
                    elseif($difference > 0)
                    {
                        $outstanding_amount = $difference;
                    }
                    else{
                        $outstanding_amount = 0;
                    }
                    $invoice_amount = abs($difference);

                    $outstanding_amount = abs($outstanding_amount);
                    Irm::find($irm['irm_id'])->update(['outstanding_amount' => $outstanding_amount]);

                    IrmPaymentHistory::create([
                        'irm_id' => $irm['irm_id'],
                        'invoice_id' => $invoice_id,
                        'received_amount' => $irm['received_amount'],
                        'invoice_amount' => $actual_invoice_amount,
                        'outstanding_amount' => $outstanding_amount,
                        'reference_no' => $irm['reference_no'],
                        'remittance_date' => $irm['remittance_date'],
                        'currency_id' => $irm['currency_id'],
                        'buyer_id' => $irm['buyer_id'],
                        'consignee_id' => $irm['consignee_id'],
                        'old_outstanding_amount' => $irm['received_amount']
                    ]);

                    array_push($invoice_irm_ids, $irm['irm_id']);

                    if (!in_array($irm['buyer_id'], $buyer_ids, true)) {
                        array_push($buyer_ids, $irm['buyer_id']);
                    }
                    if (!in_array($irm['consignee_id'], $consignee_ids, true)) {
                        array_push($consignee_ids, $irm['consignee_id']);
                    }
                }
            }
            $invoice_irm_ids = implode(",", $invoice_irm_ids);
            $buyer_ids = implode(",", $buyer_ids);
            $consignee_ids = implode(",", $consignee_ids);
            $data = array(
                'invoice_irm_ids' => $invoice_irm_ids,
                'buyer_id' => $buyer_ids,
                'consignee_ids' => $consignee_ids
            );
            return Invoice::find($invoice_id)->update($data);
        } else {
            return 0;
        }
    }

    public function balancingIRMPayments($request, $invoice_id, $invoice_amount)
    {
        // if (!empty($request->irms)) {
        //     $actual_invoice_amount = $invoice_amount;
        //     $invoice_irm_ids = [];
        //     $buyer_ids = [];
        //     $consignee_ids = [];
        //     $received_amount = 0;
        //     $total_received_amount = 0;
        //     for ($i = 0; $i < count($request->irm_id); $i++) {
        //         $total_received_amount += $request->received_amount[$i];
        //     }
        //     if ($invoice_amount <= $total_received_amount)
        //     {


        //             for ($i = 0; $i < count($request->irm_id); $i++) {

        //                 //1. remittance_value should be greater than equal to all invoices amount
        //                     $invoices_sum = IrmPaymentHistory::where('irm_id', $request->irm_id[$i])->where('invoice_id', '!=', $invoice_id)->sum('invoice_amount');
        //                     $all_invoices_total = $invoices_sum + $invoice_amount;
        //                     //check against all remittance value
        //                 if($request->remittance_value <= $all_invoices_total)
        //                 {
        //                     $received_amount = $request->received_amount[$i];
        //                     $difference = $received_amount - $invoice_amount;

        //                     //positive difference
        //                     if($difference == 0)
        //                     {
        //                         $outstanding_amount = 0;
        //                     }
        //                     elseif($difference > 0)
        //                     {
        //                         $outstanding_amount = $difference;
        //                     }
        //                     else{
        //                         $outstanding_amount = 0;
        //                     }
        //                     $invoice_amount = abs($difference);

        //                     if($request->irm_payment_id[$i] == ""){
        //                         IrmPaymentHistory::create([
        //                             'irm_id' => $request->irm_id[$i],
        //                             'invoice_id' => $invoice_id,
        //                             'received_amount' => $request->received_amount_main[$i],
        //                             'invoice_amount' => $actual_invoice_amount,
        //                             'outstanding_amount' => abs($outstanding_amount),
        //                             'reference_no' => $request->reference_no[$i],
        //                             'remittance_date' => $request->remittance_date[$i],
        //                             'currency_id' => $request->currency_id[$i],
        //                             'buyer_id' => $request->buyer_id[$i],
        //                             'consignee_id' => $request->consignee_id[$i],
        //                             'old_outstanding_amount' => $request->received_amount[$i]
        //                         ]);
        //                         array_push($invoice_irm_ids, $request->irm_id[$i]);
        //                     }
        //                     else{
        //                         $update_data = array(
        //                             'irm_id' => $request->irm_id[$i],
        //                             'invoice_id' => $invoice_id,
        //                             'received_amount' => $request->received_amount_main[$i],
        //                             'invoice_amount' => $actual_invoice_amount,
        //                             'outstanding_amount' => abs($outstanding_amount),
        //                             'reference_no' => $request->reference_no[$i],
        //                             'remittance_date' => $request->remittance_date[$i],
        //                             'currency_id' => $request->currency_id[$i],
        //                             'buyer_id' => $request->buyer_id[$i],
        //                             'consignee_id' => $request->consignee_id[$i],
        //                             'old_outstanding_amount' => $request->received_amount[$i]
        //                         );
        //                         IrmPaymentHistory::find($request->irm_payment_id[$i])->update($update_data);
        //                         array_push($invoice_irm_ids, $request->irm_id[$i]);
        //                     }

        //                     $histories = IrmPaymentHistory::where('irm_id', $request->irm_id[$i])->get();
        //                     if ($histories->count() > 1) {
        //                         $history_old_outstanding = 0;
        //                         $selectedInv = IrmPaymentHistory::where('id', $request->irm_payment_id[$i])->first();
        //                         $history_old_outstanding = $selectedInv['outstanding_amount'];
        //                         foreach($histories as $history) {
        //                             if ($history['invoice_id'] > $invoice_id){

        //                                 $old_o_a = $history_old_outstanding;
        //                                 $new_outstanding = $old_o_a - $history['invoice_amount'];
        //                                 $data_history = array(
        //                                     'outstanding_amount' => $new_outstanding,
        //                                     'old_outstanding_amount' => $old_o_a
        //                                 );
        //                                 IrmPaymentHistory::find($history['id'])->update($data_history);
        //                                 Invoice::find($history['invoice_id'])->update(['remmittance_value' => $old_o_a]);

        //                                 $history_old_outstanding = $new_outstanding;
        //                             }
        //                         }
        //                     }

        //                     $irm_final_amount = IrmPaymentHistory::where('irm_id', $request->irm_id[$i])->orderBy('invoice_id', 'DESC')->first();

        //                     $data_irm = array(
        //                         'outstanding_amount' => $irm_final_amount['outstanding_amount']
        //                     );
        //                     Irm::find($request->irm_id[$i])->update($data_irm);

        //                     if (!in_array($request->buyer_id[$i], $buyer_ids, true)) {
        //                         array_push($buyer_ids, $request->buyer_id[$i]);
        //                     }
        //                     if (!in_array($request->consignee_id[$i], $consignee_ids, true)) {
        //                         array_push($consignee_ids, $request->consignee_id[$i]);
        //                     }
        //                 } else {
        //                     //Invoices total value increasing than selected IRMs remittance total
        //                     abort(400, json_encode(['error'=>'Invoices total value increasing than selected IRMs received amount total']), ['Content-Type: application/json']);
        //                 }
        //             }
        //             $invoice_irm_ids = implode(",", $invoice_irm_ids);
        //             $buyer_ids = implode(",", $buyer_ids);
        //             $consignee_ids = implode(",", $consignee_ids);
        //             $data = array(
        //                 'invoice_irm_ids' => $invoice_irm_ids,
        //                 'buyer_id' => $buyer_ids,
        //                 'consignee_ids' => $consignee_ids,
        //             );
        //             return Invoice::find($invoice_id)->update($data);


        //     } else {
        //         //invoice amount cannot be greater than total received amount
        //         abort(400, json_encode(['error'=>'Invoice amount cannot be greater than total Outstanding amount (Received amount)']), ['Content-Type: application/json']);
        //     }
        // } else {
        //     return 0;
        // }
    }

    /**
     * @param mixed $request
     * @param mixed $invoice_id
     * @return bool|int
     */
    public function updateBusinessTask($request, $invoice_id)
    {
        if (!empty($request->business_task)) {
            foreach($request->business_task as $bt) {
                BusinessTask::find($bt['value'])->update(['invoice_id' => $invoice_id]);
            }
            return 1;
        } else {
            return 0;
        }
    }

    /**
     * @param mixed $id
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function show($id)
    {
        $this->authorize('invoice_edit');
        $session_id = session('company_id') ?? 1;
        $invoice = Invoice::with(['incoTerm:id,inco_term','ffdInternational:id,ffd_name','ffdDomestic:id,ffd_name','bank:id,bank_name','quotation:id,pi_number,pi_date'])->find($id);
        if(!$invoice) {
            return response()->json(['success' => false, 'message' => 'Invoice not found' ], 404);
        }
        // if($invoice->company_id != $session_id){
        //     $this->returnBack();
        //     return redirect('/invoice');
        // }
        // $remarks = RemarkInvoiceForm::with(['employee'])->where('form_id', '=', $id)->get();
        $invoiceIrms = IrmPaymentHistory::with(['currency:id,name,symbol', 'buyer:id,name', 'bank:id,bank_name', 'consignee:id,name'])->where('invoice_id', $invoice->id)->get();
        $invoiceProducts = InvoiceProducts::where('invoice_id', $invoice->id)->get();
        $invoiceWeights = InvoiceWeight::where('invoice_id', $invoice->id)->get();
        $pis = ProfarmaInvoiceAttachment::where('invoice_id', $invoice->id)->get();
        $tps = TaxPurchaseAttachment::where('invoice_id', $invoice->id)->get();
        $fis = FircAttachment::where('invoice_id', $invoice->id)->get();
        $lcs = LegalContractAttachment::where('invoice_id', $invoice->id)->get();
        $bes = BuyersEmailAttachment::where('invoice_id', $invoice->id)->get();
        $ves = VendorsEmailAttachment::where('invoice_id', $invoice->id)->get();
        $pos = PurchaseOrderAttachment::where('invoice_id', $invoice->id)->get();

        return response()->json([
            'invoice' => $invoice,
            'invoiceIrms' => $invoiceIrms,
            'invoiceProducts' => $invoiceProducts,
            'invoiceWeights' => $invoiceWeights,
            'pis' => $pis,
            'tps' => $tps,
            'fis' => $fis,
            'lcs' => $lcs,
            'bes' => $bes,
            'ves' => $ves,
            'pos' => $pos
        ]);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateInvoice(Request $request)
    {
        $this->authorize('invoice_edit');
        // dd($request->all());
        // $this->balancingIRMPayments($request, $request->id, $request->grand_total);
        $this->saveInvoice($request);
        $this->storeProducts($request, $request->id);
        $this->storeWeights($request, $request->id);
        if ($request->hasfile('proforma_invoice_attachment')) {
            foreach ($request->file('proforma_invoice_attachment') as $pi) {
                $piName = date('YmdHis_') .rand(10000, 99999). "." . $pi->getClientOriginalExtension();
                Storage::put('uploads/international-trade/proforma-invoice-attachment/' . $piName, file_get_contents($pi));
                $pi->move(public_path(''), $piName);
                $data = array(
                    'attachment_name' => $piName,
                    'invoice_id' => $request->id
                );
                ProfarmaInvoiceAttachment::create($data);
            }
        }
        if ($request->hasfile('tax_purchase_attachment')) {
            foreach ($request->file('tax_purchase_attachment') as $tp) {
                $tpName = date('YmdHis_') .rand(10000, 99999). "." . $tp->getClientOriginalExtension();
                Storage::put('uploads/international-trade/tax-purchase-attachment/' . $tpName, file_get_contents($tp));
                $data = array(
                    'attachment_name' => $tpName,
                    'invoice_id' => $request->id
                );
                TaxPurchaseAttachment::create($data);
            }
        }
        if ($request->hasfile('firc_attachment')) {
            foreach ($request->file('firc_attachment') as $fi) {
                $fiName = date('YmdHis_') .rand(10000, 99999). "." . $fi->getClientOriginalExtension();
                Storage::put('uploads/international-trade/firc-attachment/' . $fiName, file_get_contents($fi));
                $data = array(
                    'attachment_name' => $fiName,
                    'invoice_id' => $request->id
                );
                FircAttachment::create($data);
            }
        }

        if ($request->hasfile('legal_contract_attachment')) {
            foreach ($request->file('legal_contract_attachment') as $lc) {
                $lcName = date('YmdHis_') .rand(10000, 99999). "." . $lc->getClientOriginalExtension();
                Storage::put('uploads/international-trade/legal-contract-attachment/' . $lcName, file_get_contents($lc));
                $data = array(
                    'attachment_name' => $lcName,
                    'invoice_id' => $request->id
                );
                LegalContractAttachment::create($data);
            }
        }

        if ($request->hasfile('buyers_email_attachment')) {
            foreach ($request->file('buyers_email_attachment') as $be) {
                $beName = date('YmdHis_') .rand(10000, 99999). "." . $be->getClientOriginalExtension();
                Storage::put('uploads/international-trade/buyers-email-attachment/' . $beName, file_get_contents($be));
                $data = array(
                    'attachment_name' => $beName,
                    'invoice_id' => $request->id
                );
                BuyersEmailAttachment::create($data);
            }
        }

        if ($request->hasfile('vendors_email_attachment')) {
            foreach ($request->file('vendors_email_attachment') as $ve) {
                $veName = date('YmdHis_') .rand(10000, 99999). "." . $ve->getClientOriginalExtension();
                Storage::put('uploads/international-trade/vendors-email-attachment/' . $veName, file_get_contents($ve));
                $ve->move(public_path(''), $veName);
                $data = array(
                    'attachment_name' => $veName,
                    'invoice_id' => $request->id
                );
                VendorsEmailAttachment::create($data);
            }
        }

        if ($request->hasfile('purchase_order_attachment')) {
            foreach ($request->file('purchase_order_attachment') as $po) {
                $poName = date('YmdHis_') .rand(10000, 99999). "." . $po->getClientOriginalExtension();
                Storage::put('uploads/international-trade/purchase-order-attachment/' . $poName, file_get_contents($po));
                $data = array(
                    'attachment_name' => $poName,
                    'invoice_id' => $request->id
                );
                PurchaseOrderAttachment::create($data);
            }
        }
        // $this->updateBusinessTaskEdit($request);
        return response()->json(['success' => true, 'message' => 'Invoice updated successfully'], 200);
    }

    /**
     * @param mixed $request
     * @return bool
     */
    public function saveInvoice($request)
    {
        $this->validate($request, [
            'insurance' => 'numeric',
            'freight_weight' => 'numeric',
            'discount' => 'numeric',
            'commission' => 'numeric',
        ]);

        if (!empty($request->business_task)) {
            $business_task_ids = [];
            foreach ($request->business_task as $bt ) {
                array_push($business_task_ids, $bt['value']);
            }
            $business_task_ids = implode(",", $business_task_ids);
        }
        return Invoice::find($request->id)->update([
            'invoice_number' => $request->invoice_number,
            'invoice_date' => $request->invoice_date,
            'bank_id' => $request->bank_id,
            'currency' => $request->currency,
            'exchange_rate' => $request->exchange_rate,
            'port_of_loading' => $request->port_of_loading,
            'port_of_discharge' => $request->port_of_discharge,
            'final_destination' => $request->final_destination,
            'origin_country' => $request->origin_country,
            'inco_term_id' => $request->inco_term_id,
            'total_net_weight' => $request->total_net_weight,
            'total_gross_weight' => $request->total_gross_weight,
            'grand_total' => $request->grand_total,
            // 'invoice_product_ids' => $request->invoice_product_ids,
            'po_number' => $request->po_number,
            'po_date' => $request->po_date,
            'sli_number' => $request->sli_number,
            'dc_number' => $request->dc_number,
            'remmittance_value' => $request->remmittance_value,
            'received_amount' => $request->total_received_irm_amount,
            'shipment_type' => $request->shipment_type,
            'total_value_weight' => $request->total_value_weight,
            'freight_weight' => $request->freight_weight,
            'pre_carriage_by' => $request->pre_carriage_by,
            'placereceiptprecarrier' => $request->placereceiptprecarrier,
            'payment_terms' => $request->payment_terms,
            'vessel_no' => $request->vessel_no,
            'no_of_packages' => $request->no_of_packages,
            'international_ffd_id' => $request->international_ffd_id,
            'lut_export_under_bond' => $request->lut_export_under_bond,
            'exportpaymentofigst' => $request->exportpaymentofigst,
            'nature_of_payment' => $request->nature_of_payment,
            'exw_value' => $request->exw_value,
            'domestic_ffd_id' => $request->domestic_ffd_id,
            'insurance' => $request->insurance,
            'commission' => $request->commission,
            'discount' => $request->discount,
            'free_trade_sample' => $request->free_trade_sample,
            'eou_shipping_bill' => $request->eou_shipping_bill,
            'duty_drawback' => $request->duty_drawback,
            'epcg_shipping_bill' => $request->epcg_shipping_bill,
            'licenceshippingbill' => $request->licenceshippingbill,
            'rebate_of_state_levies' => $request->rebate_of_state_levies,
            'repair_and_return' => $request->repair_and_return,
            'advance_authorization' => $request->advance_authorization,
            'drwaback_or_rosctl' => $request->drwaback_or_rosctl,
            'epcg' => $request->epcg,
            'nfei' => $request->nfei,
            'jobbing' => $request->jobbing,
            're_export' => $request->re_export,
            'drawback_epcg' => $request->drawback_epcg,
            'eou' => $request->eou,
            'mesi' => $request->mesi,
            'any_other' => $request->any_other,
            'dbk_sl_no' => $request->dbk_sl_no,
            'regnnoanddtofepcglic' => $request->regnnoanddtofepcglic,
            'regnnodtepcglicregcopy' => $request->regnnodtepcglicregcopy,
            'noadditionaldocrequire' => $request->noadditionaldocrequire,
            'orginable' => $request->orginable,
            'invoice_copies' => $request->invoice_copies,
            'packing_list_copies' => $request->packing_list_copies,
            'non_dg_declaration' => $request->non_dg_declaration,
            'lab_analysis_report' => $request->lab_analysis_report,
            'msds' => $request->msds,
            'phytosanitary_cert' => $request->phytosanitary_cert,
            'visa_aepc_endorsement' => $request->visa_aepc_endorsement,
            'letter_to_dc' => $request->letter_to_dc,
            'gspcertificateoforigin' => $request->gspcertificateoforigin,
            'bank_certificate' => $request->bank_certificate,
            'annexure_a' => $request->annexure_a,
            'invitemnumberregno' => $request->invitemnumberregno,
            'invitemnumberregnodate' => $request->invitemnumberregnodate,
            'authorization_epcg' => $request->authorization_epcg,
            'method_of_valuation' => $request->method_of_valuation,
            'buyer_saller_related' => $request->buyer_saller_related,
            'buyersallerprice' => $request->buyersallerprice,
            'tracking_or_awb_number' => $request->tracking_or_awb_number,
            'ein_no' => $request->ein_no,
            'under_lut' => $request->under_lut,
            'special_instuction' => $request->special_instuction,
            'preferentialagreement' => $request->preferentialagreement,
            'standardunitdetails' => $request->standardunitdetails,
            'state_of_origin_item' => $request->state_of_origin_item,
            'districtoforiginitem' => $request->districtoforiginitem,
            'exporter_type' => $request->exporter_type,
            'evd' => $request->evd,
            'remarks' => $request->remarks,
            'ad_code' => $request->ad_code,
            'allSymbol' => $request->allSymbol,
            'volum_range' => $request->volum_range,
            'duty_free_commercial' => $request->duty_free_commercial,
            'non_drawback' => $request->non_drawback,
            'advathoepcddtlregno' => $request->advathoepcddtlregno,
            'pickupreferencenumber' => $request->pickupreferencenumber,
            'sdf_fema_declaration' => $request->sdf_fema_declaration,
            'extratermsconditions' => $request->extratermsconditions,
            'nature_of_transaction' => $request->nature_of_transaction,
            'business_task_id' => $business_task_ids,
        ]);
    }

    /**
     * @param mixed $request
     * @return bool|int
     */
    public function updateBusinessTaskEdit($request)
    {

        if (!empty($request->business_task_id)) {
            $dataNull = array(
                'invoice_id' => Null,
            );
            $oldBts = explode(",", $request->old_bt);
            BusinessTask::whereIn('id', $oldBts)->update($dataNull);
            $data = array(
                'invoice_id' => $request->id,
            );
            for ($i = 0; $i < count($request->business_task_id); $i++) {
                BusinessTask::find($request->business_task_id[$i])->update($data);
            }
            return 1;
        } else {
            return 0;
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    public function deleteInvoiceProduct(Request $request)
    {
        $prod_id = $request->id;

        $invoice_product = InvoiceProducts::find($request->id);
        if($invoice_product) {
            $invoice = Invoice::find($invoice_product->invoice_id);
            $invoice_prod_ids = $invoice->invoice_product_ids;
            $ids_array = explode(',', $invoice_prod_ids);

            while (($i = array_search($prod_id, $ids_array)) !== false) {
                unset($ids_array[$i]);
            }

            $prod_update = implode(',', $ids_array);

            Invoice::find($invoice_product->invoice_id)->update(['invoice_product_ids' => $prod_update]);
            if($invoice_product->delete()) {
                return response()->json(['success' => true, 'message' => 'Invoice Product deleted successfully!']);
            } else {
                return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
            }

        }
        return response()->json(['success' => false, 'message' => 'Invoice Product not found'], 404);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    public function deleteInvoiceWt(Request $request)
    {
        $this->authorize('invoice_edit');
        $wt_id = $request->id;
        $invoice_weight = InvoiceWeight::find($wt_id);
        if($invoice_weight){
            $invoice = Invoice::find($invoice_weight->invoice_id);
            $invoice_wt_ids = $invoice->invoice_weight_ids;
            $ids_array = explode(',', $invoice_wt_ids);

            //find invoice and unset wt_id from invoice_weight_ids
            while (($i = array_search($wt_id, $ids_array)) !== false) {
                unset($ids_array[$i]);
            }

            $wt_update = implode(',', $ids_array);

            $update_data = array(
                'total_net_weight'   => $invoice->total_net_weight - $invoice_weight->net_wt,
                'total_gross_weight' => $invoice->total_gross_weight - $invoice_weight->gross_wt,
                'total_value_weight' => $invoice->total_value_weight - $invoice_weight->vol_wt,
                'no_of_packages'     => $invoice->no_of_packages - $invoice_weight->noofboxes,
                'invoice_weight_ids' => $wt_update
            );
            Invoice::find($invoice->id)->update($update_data);

            if($invoice_weight->delete()){
                return response()->json(['success' => true, 'message' => 'Invoice weight deleted successfully!']);
            } else {
                return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
            }
        }
        return response()->json(['success' => false, 'message' => 'Invoice weight not found'], 404);

    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteInvoicePiAttachment(Request $request)
    {
        if (ProfarmaInvoiceAttachment::where("id", $request->id)->delete()) {
            if (Storage::exists('uploads/international-trade/proforma-invoice-attachment/' . $request->name)) {
                Storage::delete('uploads/international-trade/proforma-invoice-attachment/' . $request->name);
            }
        }
        return response()->json([
            'status'  => true, 'message' => 'Proforma Invoice attachment deleted successfully!'
        ]);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteInvoiceTpAttachment(Request $request)
    {
        if (TaxPurchaseAttachment::where("id", $request->id)->delete()) {
            if (Storage::exists('uploads/international-trade/tax-purchase-attachment/' . $request->name)) {
                Storage::delete('uploads/international-trade/tax-purchase-attachment/' . $request->name);
            }
        }
        return response()->json([
            'status' => true, 'message' => 'Tax Invoice Purchase deleted successfully!'
        ]);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteInvoiceFiAttachment(Request $request)
    {
        if (FircAttachment::where("id", $request->id)->delete()) {
            if (Storage::exists('uploads/international-trade/firc-attachment/' . $request->name)) {
                Storage::delete('uploads/international-trade/firc-attachment/' . $request->name);
            }
        }
        return response()->json([
            'status' => true, 'message' => 'FIRC deleted successfully!'
        ]);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteInvoicePoAttachment(Request $request)
    {
        if (PurchaseOrderAttachment::where("id", $request->id)->delete()) {
            if (Storage::exists('uploads/international-trade/purchase-order-attachment/' . $request->name)) {
                Storage::delete('uploads/international-trade/purchase-order-attachment/' . $request->name);
            }
        }
        return response()->json([
            'status' => true, 'message' => 'Buyers Signed PO deleted successfully!'
        ]);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteInvoiceLcAttachment(Request $request)
    {
        if (LegalContractAttachment::where("id", $request->id)->delete()) {
            if (Storage::exists('uploads/international-trade/legal-contract-attachment/' . $request->name)) {
                Storage::delete('uploads/international-trade/legal-contract-attachment/' . $request->name);
            }
        }
        return response()->json([
            'status' => true, 'message' => 'Legal Contract deleted successfully!'
        ]);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteInvoiceBeAttachment(Request $request)
    {
        if (BuyersEmailAttachment::where("id", $request->id)->delete()) {
            if (Storage::exists('uploads/international-trade/buyers-email-attachment/' . $request->name)) {
                Storage::delete('uploads/international-trade/buyers-email-attachment/' . $request->name);
            }
        }
        return response()->json([
            'status' => true, 'message' => 'Buyers Email Communication deleted successfully!'
        ]);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteInvoiceVeAttachment(Request $request)
    {
        if (VendorsEmailAttachment::where("id", $request->id)->delete()) {
            if (Storage::exists('uploads/international-trade/vendors-email-attachment/' . $request->name)) {
                Storage::delete('uploads/international-trade/vendors-email-attachment/' . $request->name);
            }
        }
        return response()->json([
            'status' => true, 'message' => 'Vendors Email Communication deleted successfully!'
        ]);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getInvoiceByNumberBt(Request $request)
    {
        return response()->json(Invoice::where('invoice_number', $request->invoice_number)->first());
    }

    // /**
    //  * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory|string
    //  */
    // public function fetchITHistory(Request $request)
    // {
    //     $rows = RemarkInvoiceForm::with(['employee'])->where('form_id', '=', $request->id)->get();
    //     if ($rows->count() > 0) {
    //         return view('admin.e-docs.international-treading.history-row', compact('rows'));
    //     } else {
    //         return '<tr><td colspan="3" class="text-center text-danger">No record present in the database!</td></tr>';
    //     }
    // }

    // public function sendNotificationToAllCheckers($checker, $checkerId, $formId)
    // {
    //     $checkerAllData = [
    //         'subject' => 'New International Trade ' . $formId . ' Created',
    //         'body' => 'New International Trade ' . $formId . ' Is Created by ' . $checker->employeeDetail->name
    //     ];
    //     return Notification::send(User::find($checkerId), new CheckerAllNotification($checkerAllData));
    // }

    /**
     * @param \App\Services\BusinessTaskService $businessTaskService
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function getEDocsTimelineByBtId(Request $request)
    {
        // $this->authorize('edoc_timeline');
        if(!isset($request->businessTaskId)){
            return response()->json(['success' => false, 'message' => 'Timeline not found'], 404);
        }
        $businessTaskId = $request->businessTaskId;
        $row = BusinessTask::select('id','created_at','date','enquiry','customer_name','segment','category')->find($businessTaskId);
        $invoices = Invoice::with(['buyer'])->where('business_task_id', $businessTaskId)->get();
        $irms = Irm::with(['currency', 'buyer:id,name', 'bank:id,bank_name'])->where('business_task_id', $businessTaskId)->get();
        $irm_payment_histories = collect();
        if(count($irms) > 0){
            foreach($irms as $irm){
                $payment = IrmPaymentHistory::with('invoiceDetails:id,invoice_number')
                    ->where('irm_id', $irm->id)
                    ->get();

                // Merge the retrieved payments into the irm_payment_histories collection
                $irm_payment_histories = $irm_payment_histories->merge($payment);
            }
        }

        if($irms->count() > 0) {
            $irmData = [];
            foreach($irms as $irm) {
                $irmItem['id'] = $irm->id;
                $irmItem['time'] = date('d-M-Y', strtotime($irm->created_at));
                $irmItem['icon'] = 'faClipboard';
                $irmItem['iconColor'] = 'success';
                $irmItem['title'] = 'IRM System ID : '.$irm->irm_sys_id;
                $irmItem['content'] = '<span class="fw-semibold">Reference number </span> : '.$irm->reference_no .'<br />
                <span class="fw-semibold">Remittance date </span> : '.$irm->remittance_date .'<br />
                <span class="fw-semibold">Currency </span> : '.$irm->currency->name .'<br />
                <span class="fw-semibold">Received Amount </span> : '.$irm->received_amount .'<br />
                <span class="fw-semibold">Final Balance Amount </span> : '.$irm->outstanding_amount .'<br />
                <span class="fw-semibold">Buyer </span> : '.$irm->buyer->name .'<br />
                <span class="fw-semibold">Bank Name </span> : '.$irm->bank->bank_name .'<br />';
                $irmItem['tasker'] = '';

                $irmData[] = $irmItem;
            }
        } else {
            $irmItem['id'] = 0;
            $irmItem['time'] = '';
            $irmItem['icon'] = 'faClipboard';
            $irmItem['iconColor'] = 'warning';
            $irmItem['title'] = 'IRM not created';
            $irmItem['content'] = '';
            $irmItem['tasker'] = '';
            $irmData[] = $irmItem;
        }

        if($invoices->count() > 0) {
            $invoiceData = [];
            foreach($invoices as $inv) {
                $invoiceItem['id'] = $inv->id;
                $invoiceItem['time'] = date('d-M-Y', strtotime($inv->created_at));
                $invoiceItem['icon'] = 'faClipboard';
                $invoiceItem['iconColor'] = 'success';
                $invoiceItem['title'] = 'Invoice Number : '.$inv->invoice_number;
                $invoiceItem['content'] = '<span class="fw-semibold">Invoice Date </span> : '.$inv->remittance_date .'<br />
                <span class="fw-semibold">Buyer Name </span> : '. ($inv->buyer != null) ? $inv->buyer->name : '' .'<br />
                <span class="fw-semibold">Shipment Type </span> : '.$inv->shipment_type .'<br />
                <span class="fw-semibold">Exchange Rate </span> : '.$inv->exchange_rate .'<br />
                <span class="fw-semibold">Currency </span> : '.$inv->currency .'<br />
                <span class="fw-semibold">Received Amount </span> : '.$inv->received_amount .'<br />
                <span class="fw-semibold">Outstanding Amount </span> : '.$inv->received_amount - $inv->grand_total .'<br />
                <span class="fw-semibold">Invoice Value </span> : '.$inv->grand_total .'<br />
                <span class="fw-semibold">Final </span> : '.$inv->received_amount - $inv->grand_total .'<br />
                <span class="fw-semibold">BUSINESS TASK ID </span> : '.$inv->business_task_id .'<br />';
                $invoiceItem['tasker'] = '';

                $invoiceData[] = $invoiceItem;
            }
        } else {
            $invoiceItem['id'] = 0;
            $invoiceItem['time'] = '';
            $invoiceItem['icon'] = 'faClipboard';
            $invoiceItem['iconColor'] = 'warning';
            $invoiceItem['title'] = 'Invoice not created';
            $invoiceItem['content'] = '';
            $invoiceItem['tasker'] = '';
            $invoiceData[] = $invoiceItem;
        }

        if($irm_payment_histories->count() > 0) {
            $historyData = [];
            foreach($irm_payment_histories as $hist) {
                $historyItem['id'] = $hist->id;
                $historyItem['time'] = date('d-M-Y', strtotime($hist->created_at));
                $historyItem['icon'] = 'faClipboard';
                $historyItem['iconColor'] = 'success';
                $historyItem['title'] = 'Invoice Number : '.$hist->invoiceDetails->invoice_number;
                $historyItem['content'] = '<span class="fw-semibold">Reference number </span> : '.$hist->reference_no .'<br />
                <span class="fw-semibold">Received Amount </span> : '.$hist->received_amount .'<br />
                <span class="fw-semibold">Previous Outstanding Amount </span> : '.$hist->outstanding_amount .'<br />
                <span class="fw-semibold">Invoice Amount </span> : '.$hist->invoice_amount .'<br />
                <span class="fw-semibold">Outstanding Amount </span> : '.$hist->old_outstanding_amount .'<br />';
                $historyItem['tasker'] = '';

                $historyData[] = $historyItem;
            }
        } else {
            $historyItem['id'] = 0;
            $historyItem['time'] = '';
            $historyItem['icon'] = 'faClipboard';
            $historyItem['iconColor'] = 'warning';
            $historyItem['title'] = 'IRM Payment History not created';
            $historyItem['content'] = '';
            $historyItem['tasker'] = '';
            $historyData[] = $historyItem;
        }

        //Timeline data
        $businessTaskData = [
            'id' => 1,
            'date' => 'Business Task',
            'items' => [
                [
                    'id' => 1,
                    'time' => date('d-M-Y', strtotime($row->created_at)),
                    'icon' => 'faClipboard',
                    'iconColor' => 'success',
                    'title' => 'Customer',
                    'content' => '<span class="fw-semibold">Enquiry </span> : '.$row->enquiry .'<br />
                    <span class="fw-semibold">Customer </span> : '.$row->customer_name .'<br />
                    <span class="fw-semibold">Category </span> : '.$row->category .'<br />',
                    'tasker' => ''
                ],
            ]
        ];
        $irmsData = [
            'id' => 2,
            'date' => 'IRM',
            'items' => $irmData
        ];

        $irmPaymentData = [
            'id' => 3,
            'date' => 'IRM Payment History',
            'items' => $historyData
        ];
        $invoicesData = [
            'id' => 4,
            'date' => 'Invoices',
            'items' => $invoiceData
        ];

        $timeline[] = $businessTaskData;
        $timeline[] = $irmsData;
        $timeline[] = $irmPaymentData;
        $timeline[] = $invoicesData;

        return response()->json($timeline, 200);
    }
}
