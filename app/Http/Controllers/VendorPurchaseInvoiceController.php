<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\Vendor;
use App\Models\PurchaseOrder;
use App\Models\BusinessTask;
use App\Models\VendorPurchaseInvoice;
use App\Models\PaymentHistoryBt;
use App\Models\PaimentHistoryPaidAmountBt;
use App\Models\VendorPurchaseInvoiceAttachments;

class VendorPurchaseInvoiceController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $rows = VendorPurchaseInvoice::with(['vendor:id,name', 'purchase_order:id,purchase_order_number', 'attachments'])->orderBy('id', 'desc')->get();
        return response()->json($rows);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function getVendorPurchaseAttachments(Request $request)
    {
        $rows = VendorPurchaseInvoice::with(['attachments'])->find($request->vpi_id);
        return response()->json($rows);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $vendors = Vendor::where('approved', '=', '1')->get();
        $poNumber = PurchaseOrder::select('id', 'purchase_order_number', 'vendor_id')->with('vendor')->orderBy('id', 'desc')->get();
        $businesstasks = BusinessTask::orderBy('id', 'desc')->get()->toArray();
        return view('admin.vendor-purchase-invoice.create', compact('vendors', 'poNumber', 'businesstasks'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'purchase_invoice_no' => 'required',
            'purchase_invoice_date' => 'required',
            'base_amount' => 'required',
            'paid_amount' => 'required',
            'proof_of_payment.*' => 'max:2048'
        ]);

        $btId = ($request->business_task_id != 0) ? $request->business_task_id : null;

        $vpi = VendorPurchaseInvoice::create([
            'purchase_order_id' => $request->purchase_order_id,
            'purchase_invoice_no' => $request->purchase_invoice_no,
            'purchase_invoice_date' => $request->purchase_invoice_date,
            'business_task_id' => $btId,
            'vendor_id' => $request->vendor_id,
            'base_amount' => $request->base_amount,
            'gst_percent' => $request->gst_percent,
            'gst_amount' => $request->gst_amount,
            'tds_deduction' => $request->tds_deduction,
            'tds_amount' => $request->tds_amount,
            'net_payable' => $request->net_payable,
            'paid_amount' => $request->paid_amount,
            'bank_name' => $request->bank_name,
            'utr_number' => $request->utr_number,
            'utr_date' => $request->utr_date,
            'created_by' => Auth::id()
        ]);

        if ($request->hasfile('proof_of_payment')) {
            foreach ($request->file('proof_of_payment') as $tp) {
                $vpiName = 'vpi_' .rand(10000, 99999). "." . $tp->getClientOriginalExtension();
                Storage::put('uploads/vendor-purchase-invoice/' . $vpiName, file_get_contents($tp));
                $data = array(
                    'vendor_pi_id' => $vpi->id,
                    'name' => $vpiName,
                    'attachment_type' => 'Proof of payment',
                    'attachment_details' => 'Proof of payment',
                    'created_by' => Auth::id()
                );
                VendorPurchaseInvoiceAttachments::create($data);
            }
        }

        if(!empty($request->purchase_order_id) && $request->purchase_order_id != 0){
            $phb = PaymentHistoryBt::where('po_id',$request->purchase_order_id)->get();

            $paidTotal = 0;
            if($phb->count() > 0){
                foreach($phb as $pay){
                    $paidTotal += $pay->paid_amount;
                }
            }

            $history = PaymentHistoryBt::create([
                'po_id' => $request->purchase_order_id,
                'po_invoice_number' => $request['purchase_order']['purchase_order_number'],
                'po_invoice_amount' => $request->po_invoice_amount,
                'paid_amount' => $request->paid_amount,
                'balance_amount' => $request->po_balance_amount - $request->paid_amount,
                'business_task_id' => $btId,
                'tds_amount' => $request->tds_amount,
                'tds_rate' => $request->tds_deduction,
                'gst_rate' => $request->gst_percent,
                'gst_amount' => $request->gst_amount,
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
        }

        return response()->json(['message' => "Vendor Purchase Invoice added successfully"], 200);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $row = VendorPurchaseInvoice::with(['vendor:id,name','business_task:id,customer_name', 'purchase_order:id,purchase_order_number', 'attachments:id,vendor_pi_id,name,attachment_type,attachment_details'])->find($id);
        $purchase_order = null;
        $payDetails = null;
        if($row->purchase_order_id != null){
            $purchase_order = PurchaseOrder::select('id','purchase_order_number', 'order_date','po_type','vendor_id','document_type','total','grand_total','business_task_id')
            ->with(['vendor:id,name', 'business_task:id,customer_name'])
            ->find($row->purchase_order_id);
            $payDetails = PaymentHistoryBt::where('po_id', $row->purchase_order_id)->get();
        }

        return response()->json(['vendor_purchase_invoice' => $row, 'po_details' => $purchase_order, 'paydetails' => $payDetails]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function updateVendorPurchaseInvoice(Request $request)
    {
        $this->validate($request, [
            'id' => 'required|integer',
            'purchase_invoice_no' => 'required|string|max:255',
            'purchase_invoice_date' => 'required|date_format:Y-m-d',
            'base_amount' => 'required',
            'paid_amount' => 'required',
            'bank_name' => 'required|string|max:255',
            'utr_number' => 'required|string|max:255',
            'utr_date' => 'required|date_format:Y-m-d',
            'proof_of_payment.*' => 'max:2048'
        ],[
            'purchase_invoice_no.max' => 'Purch. Invoice Number can be of 255 characters max',
            'bank_name.max' => 'Bank Name can be of 255 characters max',
            'utr_number.max' => 'UTR/Cheque Number can be of 255 characters max',
            'proof_of_payment.*.max' => 'Max allowed file size for Proof of Payment is 2MB'
        ]);

        $data = [
            'purchase_invoice_no' => $request->purchase_invoice_no,
            'purchase_invoice_date' => $request->purchase_invoice_date,
            'bank_name' => $request->bank_name,
            'utr_number' => $request->utr_number,
            'utr_date' => $request->utr_date,
        ];
        $vpi_update = VendorPurchaseInvoice::find($request->id)->update($data);
        if($vpi_update){
            if ($request->hasfile('proof_of_payment')) {
                foreach ($request->file('proof_of_payment') as $tp) {
                    $vpiName = 'vpi_' .rand(10000, 99999). "." . $tp->getClientOriginalExtension();
                    Storage::put('uploads/vendor-purchase-invoice/' . $vpiName, file_get_contents($tp));
                    $data = array(
                        'vendor_pi_id' => $request->id,
                        'name' => $vpiName,
                        'attachment_type' => 'Proof of payment',
                        'attachment_details' => 'Proof of payment',
                        'created_by' => Auth::id()
                    );
                    VendorPurchaseInvoiceAttachments::create($data);
                }
            }
        }

        return response()->json(['message' => "Vendor Purchase Invoice updated successfully"], 200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }


    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function getVendorPayment()
    {
        $purchase_orders = VendorPurchaseInvoice::whereNotNull('purchase_order_id')->with(['purchase_order', 'vendor', 'attachments'])->get();
        $vendor_purchases = VendorPurchaseInvoice::where(function($query){
            $query->whereNull('purchase_order_id')
            ->orWhere('purchase_order_id', 0);
        })->with(['purchase_order', 'vendor', 'attachments'])->get();
        return response()->json(['purchase_orders' => $purchase_orders, 'vendor_purchases' => $vendor_purchases], 200);
    }
}
