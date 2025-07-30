<?php

namespace App\Http\Controllers;

use App\Models\PaimentHistoryPaidAmountBt;
use Illuminate\Http\Request;
use App\Models\PaymentHistoryBt;
use Illuminate\Support\Facades\Auth;

class PaymentHistoryBtController extends Controller
{
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    public function getPaymentHistoryBt($id)
    {
        $paymenthistories = PaymentHistoryBt::where('business_task_id', $id)->get();
        if ($paymenthistories->count() > 0) {
            return response()->json($paymenthistories, 200);
        } else {
            return response()->json([], 200);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function storePaymentHistoryBt(Request $request)
    {
        PaymentHistoryBt::create([
            'po_invoice_number' => $request->po_invoice_number,
            'po_invoice_amount' => $request->po_invoice_amount,
            'paid_amount' => 0,
            'balance_amount' => $request->po_invoice_amount,
            'business_task_id' => $request->business_task_id,
            'tds_amount' => $request->tds_amount,
            'tds_rate' => $request->tds_rate,
            'gst_rate' => $request->gst_rate,
            'gst_amount' => $request->gst_amount,
            'gst_type' => $request->gst_type,
            'created_by' => Auth::id()
        ]);
        return response()->json([
            'status' => 200,
        ]);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function editPaymentHistoryBt(Request $request)
    {
        return response()->json(PaymentHistoryBt::find($request->id));
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePaymentHistoryBt(Request $request)
    {
        $data = array(
            'po_invoice_number' => $request->po_invoice_number,
            'po_invoice_amount' => $request->po_invoice_amount,
            'business_task_id' => $request->business_task_id,
            'tds_amount' => $request->tds_amount,
            'tds_rate' => $request->tds_rate,
            'gst_rate' => $request->gst_rate,
            'gst_amount' => $request->gst_amount,
            'gst_type' => $request->gst_type,
        );
        PaymentHistoryBt::find($request->payment_history_id)->update($data);
        return response()->json([
            'status' => 200,
        ]);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function storePaidAmountBt(Request $request)
    {
        PaimentHistoryPaidAmountBt::create([
            'paid_amount' => $request->po_paid_amount,
            'bank_name' => $request->bank_name,
            'utr_number' => $request->utr_number,
            'utr_date' => $request->utr_date,
            'payment_history_id' =>  $request->payment_history_id,
            'created_by' => Auth::id()
        ]);
        $paymentHistory = PaymentHistoryBt::find($request->payment_history_id);
        $paidAmount = $paymentHistory->paid_amount + $request->po_paid_amount;
        $data = array(
            'paid_amount' => $paidAmount,
            'balance_amount' => $request->po_balance_amount_add,
        );
        PaymentHistoryBt::find($request->payment_history_id)->update($data);
        return response()->json([
            'status' => 200,
        ]);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory|string
     */
    public function getPaidAmountBt(Request $request)
    {
        $paidhistories = PaimentHistoryPaidAmountBt::where('payment_history_id', '=', $request->id)->orderBy('id', 'desc')->get();
        if ($paidhistories->count() > 0) {
            return view('admin.business-task.account-worksheet.payment-history.list-paid-history-rows', compact('paidhistories'));
        } else {
            return '<h4 class="text-danger">No record present in the database!</h4>';
        }
    }
}
