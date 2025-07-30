<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\RegulatoryDashboard;
use App\Models\Warehouse;
use App\Models\WarehousePSD;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class WarehousePsdController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $this->authorize('warehouse_list');
        $psds = WarehousePSD::with(['inward:id,inward_sys_id,inward_date,proforma_invoice_id,business_task_id,port_of_loading,port_of_discharge,inco_term_id',
                'inward.grns:id,inward_id,grn_number',
                'inward.business_task:id,customer_name',
                'inward.proforma_invoice:id,pi_number',
                'inward.inco_term:id,inco_term',
                'invoice:id,invoice_number'
                ])->has('inward')
            ->orderBy('id', 'DESC')
            ->get();

        return response()->json($psds, 200);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function createPsd()
    {
        $this->authorize('warehouse_list');
        $inwards = Warehouse::select('id', 'inward_sys_id')->has('outwards')->orderBy('id', 'DESC')->get();
        $invoices = Invoice::select('id', 'invoice_number')->where('psd_id', 0)->orderBy('id', 'DESC')->get();

        return response()->json(['inwards' => $inwards, 'invoices' => $invoices], 200);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $this->authorize('warehouse_create');
        //get latest ids
        $next_out_id = (new WarehousePSD)->getLatestId();

        $this->validate($request,[
            'inward_id' => 'required',
            'invoice_id' => 'required',
            'psd_date' => 'required|date_format:Y-m-d',
            'awb_no' => 'string|max:255',
            'awb_date' => 'date_format:Y-m-d',
            'shipping_bill_no' => 'string|max:255',
            'shipping_bill_date' => 'date_format:Y-m-d',
            'egm_no' => 'string|max:255',
            'egm_date' => 'date_format:Y-m-d',
        ]);
        if(empty($request->regulatory['id'])) {
            $this->validate($request, [
                'invoiceUpload' => 'required|max:2048',
                'awbUpload' => 'required|max:2048',
                'shippingBillUpload' => 'required|max:2048',
                'packingListUpload' => 'required|max:2048',
                'otherUpload' => 'max:2048',
            ],[
                'invoiceUpload.max' => 'Invoice upload max size is 2MB',
                'awbUpload.max' => 'Awb upload max size is 2MB',
                'shippingBillUpload.max' => 'Shipping Bill upload max size is 2MB',
                'packingListUpload.max' => 'Packing List upload max size is 2MB',
                'otherUpload.max' => 'Other upload max size is 2MB',
            ]);
        }

        $data = array(
            'psd_sys_id' => "PSD-". $next_out_id,
            'inward_id' => $request->inward_id,
            'psd_date' => date('Y-m-d', strtotime($request->psd_date)),
            'invoice_id' => $request->invoice_id,
            'created_by' => Auth::id(),
        );
        //Store info in Regulatory Dashboard table
        $this->storeRegulatory($request);

        if(WarehousePSD::create($data)){
            $map = array(
                'regulatory_id' => 1,
                'psd_id' => true
            );
            Invoice::find($request->invoice_id)->update($map);
            return response()->json(['success' => true, 'message' => "PSD data submitted successfully"], 200);
        } else {
            return response()->json(['success' => false, 'message' => "Something went wrong"], 422);
        }

    }

    /**
     * @param  mixed $request
     * @return mixed
     */
    public function storeRegulatory($request)
    {
        if ($request->hasFile('invoiceUpload')) {
            $attachment = $request->file('invoiceUpload');
            $attachmentName = "Psd_Inv_" . date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/regulatory/invoice/' . $attachmentName, file_get_contents($attachment));
            $invoiceName = $attachmentName;
        }
        if ($request->hasFile('awbUpload')) {
            $attachment = $request->file('awbUpload');
            $attachmentName = "Psd_Awb_" . date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/regulatory/awb/' . $attachmentName, file_get_contents($attachment));
            $awbName = $attachmentName;
        }
        if ($request->hasFile('shippingBillUpload')) {
            $attachment = $request->file('shippingBillUpload');
            $attachmentName = "Psd_SB_" . date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/regulatory/shippingbill/' . $attachmentName, file_get_contents($attachment));
            $shippingBillName = $attachmentName;
        }
        if ($request->hasFile('packingListUpload')) {
            $attachment = $request->file('packingListUpload');
            $attachmentName = "Psd_PL_" . date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/regulatory/packinglist/' . $attachmentName, file_get_contents($attachment));
            $packingListName = $attachmentName;
        }
        if ($request->hasFile('otherUpload')) {
            $attachment = $request->file('otherUpload');
            $attachmentName = "Psd_" . date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/regulatory/other/' . $attachmentName, file_get_contents($attachment));
            $otherName = $attachmentName;
        }
        return RegulatoryDashboard::create([
            'invoice_id' => $request->invoice_id,
            'shipping_bill_no' => $request->regulatory['shipping_bill_no'],
            'shipping_bill_date' => $request->regulatory['shipping_bill_date'],
            'awb_no' => $request->regulatory['awb_no'],
            'awb_date' => $request->regulatory['awb_date'],
            'egm_no' => $request->regulatory['egm_no'],
            'egm_date' => $request->regulatory['egm_date'],
            'invoice' => $invoiceName ?? null,
            'awb' => $awbName ?? null,
            'shipping_bill' => $shippingBillName ?? null,
            'packing_list' => $packingListName ?? null,
            'other' => $otherName ?? null,
            'created_by' => Auth::id(),
        ]);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\WarehousePSD  $warehousePSD
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $this->authorize('warehouse_edit');

        $warehousePSD = WarehousePSD::select('id','psd_sys_id','inward_id','invoice_id','psd_date')->with([
                'inward:id,inward_sys_id',
                'invoice:id,invoice_number,regulatory_id'
            ])
            ->find($id);

        return response()->json($warehousePSD, 200);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\WarehousePSD  $warehousePSD
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $this->authorize('warehouse_edit');
        $warehousePSD = WarehousePSD::find($id);
        $invoices = Invoice::select('id', 'invoice_number')->where('psd_id', 0)->get()->toArray();
        $inwards = Warehouse::select('id', 'inward_sys_id')
        ->where('packaging_done', 1)->orderBy('id', 'desc')->get();

        $invoice_details = $warehousePSD->invoice;

        $invoices[] = array('id' => $warehousePSD->invoice->id, 'invoice_number' => $warehousePSD->invoice->invoice_number);

        $regulatory_details = "";
        if($warehousePSD->invoice->regulatory_id){
            $regulatory_details = RegulatoryDashboard::where('invoice_id', $warehousePSD->invoice->id)->first();
        }


        return view('admin.warehouse.psd.map-psd-invoice')->with(['psd'=> $warehousePSD, 'inwards' => $inwards, 'invoices' => array_reverse($invoices), 'invoice_details' => $invoice_details, 'regulatory' => $regulatory_details]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\WarehousePSD  $warehousePSD
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $psd_id)
    {
        $this->authorize('warehouse_edit');
        $this->validate($request,[
            'psd_id'    => 'required',
            'inward_id' => 'required',
            'invoice_id' => 'required',
            'psd_date' => 'required'
        ]);
        $warehousePSD = WarehousePSD::find($psd_id);
        $warehousePSD->inward_id = $request->inward_id;
        $warehousePSD->invoice_id = $request->invoice_id;
        $warehousePSD->psd_date = $request->psd_date;

        if($warehousePSD->save()) {
            return response()->json(['success' => true, 'message' => "PSD data updated successfully"], 200);
        } else {
            return response()->json(['success' => false, 'message' => "Something went wrong"], 422);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\WarehousePSD  $warehousePSD
     * @return \Illuminate\Http\Response
     */
    public function destroy($psd_id)
    {
        $this->authorize('warehouse_delete');
        $warehouseOutward = WarehousePSD::find($psd_id);
        if($warehouseOutward->delete()) {
            Invoice::find($warehouseOutward->invoice_id)->update(['psd_id' => false]);
            return response()->json(['success' => true, 'message' => "PSD deleted successfully"], 200);
        } else {
            return response()->json(['success' => false, 'message' => "Something went wrong"], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getInvoiceDetailsOnPsd(Request $request) {
        $this->authorize('warehouse_list');
        $invoice = Invoice::select('id', 'invoice_number', 'regulatory_id')->find($request->invoice_id);
        $regulatory_details = "";
        if($invoice->regulatory_id){
            $regulatory_details = RegulatoryDashboard::where('invoice_id', $invoice->id)->first();
        }
        return response()->json(['invoice_details' => $invoice, 'regulatory' => $regulatory_details]);
    }
}
