<?php

namespace App\Http\Controllers;

use App\Models\Irm;
use App\Models\Invoice;
use App\Models\Customer;
use App\Models\Consignee;
use App\Models\BankAccount;
use App\Models\InvoiceWeight;
use App\Models\CompanyDetails;
use App\Models\Currency;
use App\Models\InvoiceProducts;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\TermsAndConditions;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;

class InternationalTreadingPdfController extends Controller
{
    private function returnBack(){
        Session::flash('incorrect_company_id', 'The Invoice you are trying to access is created from different company, to access it please switch company from the navbar.');
    }

    /**
     * @param mixed $id
     * @return \Illuminate\Http\Response
     */
    public function pdfInvoice($id)
    {
        $view = 'admin.e-docs.international-treading.pdf.invoice';
        $pdfName = 'invoice';
        $pdfTitle = 'Invoice';
        return $this->getPdf($id, $view, $pdfName, $pdfTitle);
    }

    /**
     * @param mixed $id
     * @return \Illuminate\Http\Response
     */
    public function pdfPackingList($id)
    {
        $view = 'admin.e-docs.international-treading.pdf.packing-list';
        $pdfName = 'packing-list';
        $pdfTitle = 'Packing List';
        return $this->getPdf($id, $view, $pdfName, $pdfTitle);
    }

    /**
     * @param mixed $id
     * @return \Illuminate\Http\Response
     */
    public function pdfAWB_BL($id)
    {
        $view = 'admin.e-docs.international-treading.pdf.awb-bl';
        $pdfName = 'awb-bl';
        $pdfTitle= 'AWB-BL';
        return $this->getPdf($id, $view, $pdfName, $pdfTitle);
    }
    /**
     * @param mixed $id
     * @return \Illuminate\Http\Response
     */
    public function pdfInvoiceWithSign($id)
    {
        $view = 'admin.e-docs.international-treading.pdf.invoice';
        $pdfName = 'invoice';
        $pdfTitle = 'Invoice';
        return $this->getPdf($id, $view, $pdfName, $pdfTitle, true);
    }

    /**
     * @param mixed $id
     * @return \Illuminate\Http\Response
     */
    public function pdfPackingListWithSign($id)
    {
        $view = 'admin.e-docs.international-treading.pdf.packing-list';
        $pdfName = 'packing-list';
        $pdfTitle = 'Packing List';
        return $this->getPdf($id, $view, $pdfName, $pdfTitle, true);
    }

    /**
     *  @param mixed $id
     * @return \Illuminate\Http\Response
     */
    public function pdfShipperLetter($id)
    {
        $view = 'admin.e-docs.international-treading.pdf.shipper-letter';
        $pdfName = 'shipper-letter-of-instruction';
        $pdfTitle = 'Shipper Letter Of Instruction';
        return $this->getPdf($id, $view, $pdfName, $pdfTitle);
    }

    /**
     * @param mixed $id
     * @return \Illuminate\Http\Response
     */
    public function pdfNonHazardousCargo($id)
    {
        $view = 'admin.e-docs.international-treading.pdf.non-hazardous-cargo';
        $pdfName = 'non-hazardous-cargo';
        $pdfTitle = 'SHIPPER\'S CERTIFICATION FOR NON - HAZARDOUS CARGO';
        return $this->getPdf($id, $view, $pdfName, $pdfTitle);
    }

    /**
     * @param mixed $id
     * @return \Illuminate\Http\Response
     */
    public function pdfAnnexureA($id)
    {
        $view = 'admin.e-docs.international-treading.pdf.annexure-a';
        $pdfName = 'annexure-a';
        $pdfTitle = 'ANNEXURE - A EXPORT VALUE DECLARATION';
        return $this->getPdf($id, $view, $pdfName, $pdfTitle);
    }

    /**
     * @param mixed $id
     * @return \Illuminate\Http\Response
     */
    public function pdfAppendixI($id)
    {
        $view = 'admin.e-docs.international-treading.pdf.appendix-i';
        $pdfName = 'appendix-i';
        $pdfTitle = '(APPENDIX I) FORM SDF';
        return $this->getPdf($id, $view, $pdfName, $pdfTitle);
    }

    /**
     * @param mixed $id
     * @return \Illuminate\Http\Response
     */
    public function pdfDeliveryChallan($id)
    {
        $view = 'admin.e-docs.international-treading.pdf.delivery-challan';
        $pdfName = 'delivery-challan';
        $pdfTitle = 'Delivery Challan';
        return $this->getPdf($id, $view, $pdfName, $pdfTitle);
    }

    /**
     * @param mixed $id
     * @return \Illuminate\Http\Response
     */
    public function pdfAP($id)
    {
        $view = 'admin.e-docs.international-treading.pdf.a-p';
        $pdfName = 'a-p';
        $pdfTitle = 'A-P';
        return $this->getPdf($id, $view, $pdfName, $pdfTitle);
    }

    /**
     * @param mixed $id
     * @return \Illuminate\Http\Response
     */
    public function pdfIRS($id)
    {
        $view = 'admin.e-docs.international-treading.pdf.irs';
        $pdfName = 'irs';
        $pdfTitle = 'IRS';
        return $this->getPdf($id, $view, $pdfName, $pdfTitle);
    }

    /**
     * @param mixed $id
     * @return \Illuminate\Http\Response
     */
    public function pdfTPA($id)
    {
        $view = 'admin.e-docs.international-treading.pdf.tpa';
        $pdfName = 'tpa';
        $pdfTitle = 'TPA';
        return $this->getPdf($id, $view, $pdfName, $pdfTitle);
    }

    /**
     * @param mixed $id
     * @return \Illuminate\Http\Response
     */
    public function pdfBD($id)
    {
        $view = 'admin.e-docs.international-treading.pdf.bd';
        $pdfName = 'bd';
        $pdfTitle = 'BD';
        return $this->getPdf($id, $view, $pdfName, $pdfTitle);
    }

    /**
     * @param mixed $id
     * @return \Illuminate\Http\Response
     */
    public function pdfCD($id)
    {
        $view = 'admin.e-docs.international-treading.pdf.cd';
        $pdfName = 'cd';
        $pdfTitle = 'CD';
        return $this->getPdf($id, $view, $pdfName, $pdfTitle);
    }

    /**
     * @param mixed $id
     * @return \Illuminate\Http\Response
     */
    public function getScometPDF($inv_id, $use_of_goods)
    {
        // Define validation rules
        $rules = [
            'inv_id' => 'required|integer',
            'use_of_goods' => 'required|string',
        ];

        // Define custom error messages
        $messages = [
            'inv_id.required' => 'The invoice ID is required.',
            'inv_id.integer' => 'The invoice ID must be an integer.',
            'use_of_goods.required' => 'The use of goods is required.',
            'use_of_goods.string' => 'The use of goods must be a string.',
        ];

        // Validate the input
        $validator = Validator::make(compact('inv_id', 'use_of_goods'), $rules, $messages);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $view = 'admin.e-docs.international-treading.pdf.scomet';
        $pdfName = 'scomet';
        $pdfTitle = 'SCOMET';
        $invoice = Invoice::select('id','invoice_number','invoice_date','port_of_loading','port_of_discharge','final_destination')->find($inv_id);
        $invoiceProducts =  InvoiceProducts::where('invoice_id', $invoice->id)->get();
        $data = [
            'pdf_title' => $pdfTitle,
            'invoice' => $invoice,
            'invoiceProducts' => $invoiceProducts,
            'usage' => $use_of_goods
        ];

        $pdf = Pdf::setOptions(['isHtml5ParserEnabled' => true])->loadView($view, $data);
        return $pdf->download($inv_id . '-' . $pdfName . '.pdf');
        // return $this->getPdf($inv_id, $view, $pdfName, $pdfTitle);
    }

    /**
     * @param mixed $id
     * @param mixed $view
     * @param mixed $pdfName
     * @return \Illuminate\Http\Response
     */
    public function getPdf($id, $view, $pdfName, $pdfTitle, $sign=false)
    {
        $session_id = session('company_id') ?? 1;
        $invoice = Invoice::with(['incoTerm'])->where("id", $id)->first();

        if($invoice->company_id != $session_id){
            $this->returnBack();
            return redirect('/invoice');
        }

        $invoiceWeights = InvoiceWeight::where('invoice_id', $invoice->id)->get();
        $total_net_weight = 0;
        $total_gross_weight = 0;
        $total_volume_weight = 0;
        $noofboxes = 0;

        foreach ($invoiceWeights as $wt) {
            $total_net_weight += $wt->net_wt * $wt->noofboxes;
            $total_gross_weight += $wt->gross_wt * $wt->noofboxes;
            $total_volume_weight += $wt->vol_wt * $wt->noofboxes;
            $noofboxes += $wt->noofboxes;
        }

        $symbol = Currency::where("name", '=', $invoice->currency)->first();
        $invoiceProducts =  InvoiceProducts::leftJoin('products', 'products.id', '=', 'invoice_products.product_id')
            ->get(['invoice_products.*', 'products.model_name as model_name', 'products.product_code as product_code'])
            ->where('invoice_id', $invoice->id);
        $irms = Irm::whereNull('invoice_id')->orderBy('id', 'desc')->get();
        $buyerDetails = Customer::leftJoin('countries', 'countries.id', '=', 'customers.country_id')
            ->get(['customers.*', 'countries.name as country_name'])
            ->where("id", $invoice->buyer_id)->first();
        $consigneeDetails = Consignee::leftJoin('countries', 'countries.id', '=', 'consignees.country')
            ->leftJoin('states', 'states.id', '=', 'consignees.state')
            ->get(['consignees.*', 'countries.name as country_name', 'states.name as state_name'])
            ->where("id", $invoice->consignee_ids)->first();
        $termsAndConditions = TermsAndConditions::where('order', 'International Sales Invoice')->first();
        $companyDetails = CompanyDetails::where('id', '1')->first();
        $bankDetails = BankAccount::where('id', $invoice->bank_id)->first();

        $data = [
            'pdf_title' => $pdfTitle,
            'sign' => $sign,
            'invoice' => $invoice,
            'buyerDetails' => $buyerDetails,
            'consigneeDetails' => $consigneeDetails,
            'invoiceProducts' => $invoiceProducts,
            'invoiceWeights' => $invoiceWeights,
            'irms' => $irms,
            'termsAndConditions' => $termsAndConditions,
            'companyDetails' => $companyDetails,
            'bankDetails' => $bankDetails,
            'symbol' => $symbol,
            'total_net_weight' => $total_net_weight,
            'total_gross_weight' => $total_gross_weight,
            'total_volume_weight' => $total_volume_weight,
            'noofboxes' => $noofboxes
        ];

        $pdf = Pdf::setOptions(['isHtml5ParserEnabled' => true])
            ->loadView($view, $data);
        return $pdf->download($id . '-' . $pdfName . '.pdf');
        // return view($view, compact('invoice', 'sign', 'buyerDetails', 'total_volume_weight', 'consigneeDetails', 'invoiceProducts', 'invoiceWeights', 'irms', 'companyDetails', 'termsAndConditions', 'bankDetails', 'symbol', 'noofboxes', 'total_net_weight', 'total_gross_weight'));
    }
}
