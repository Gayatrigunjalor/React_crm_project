<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Carbon\Carbon;
use Illuminate\Http\Request;

class SbKnockOffController extends Controller
{
    public function sb_knockoff() {
        return view('admin.smart-view.sb-knockoff');
    }

    public function getKnockoff(Request $request) {
        $this->validate($request, [
            'startDate' => 'required|date_format:Y-m-d\TH:i:s.v\Z',
            'endDate' => 'required|date_format:Y-m-d\TH:i:s.v\Z',
        ]);

        $startDate = Carbon::parse($request->startDate)->startOfDay()->toDateTimeString();
        $endDate = Carbon::parse($request->endDate)->endOfDay()->toDateTimeString();

        if($startDate != "" && $endDate != "") {

            $selected_date = true;
            //fetch invoices between start & end date
            // $invoices = Invoice::whereBetween('invoice_date', [$startDate,$endDate])->with(['regulatory_psd', 'tax_purchase_invoices', 'proforma_attachment', 'firc_attachment'])->get();
            $invoices = Invoice::select('id','invoice_number','invoice_date','grand_total')->whereBetween('invoice_date', [$startDate,$endDate])->with([
                'regulatory_psd:id,invoice_id,awb,shipping_bill',
                'tax_purchase_invoices:id,invoice_id,attachment_name',
                'proforma_attachment:id,invoice_id,attachment_name',
                'firc_attachment:id,invoice_id,attachment_name'
            ])->get();
            return response()->json($invoices, 200);
        } else {

            return response()->json(['success' => false, 'message' => 'Selected date cannot be empty'], 422);
        }
    }
}
