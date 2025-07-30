<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ItcController extends Controller
{
    public function itc() {
        return view('admin.smart-view.itc');
    }

    public function getItcData(Request $request) {

        $this->validate($request, [
            'startDate' => 'required|date_format:Y-m-d\TH:i:s.v\Z',
            'endDate' => 'required|date_format:Y-m-d\TH:i:s.v\Z',
        ]);

        $startDate = Carbon::parse($request->startDate)->startOfDay()->toDateTimeString();
        $endDate = Carbon::parse($request->endDate)->endOfDay()->toDateTimeString();

        if($startDate != "" && $endDate != "") {
            $selected_date = true;
            //fetch invoices between start & end date
            $invoices = Invoice::select('id','invoice_number','invoice_date','grand_total')->whereBetween('invoice_date', [$startDate,$endDate])->with([
                'regulatory_psd:id,invoice_id,awb,shipping_bill',
                'tax_purchase_invoices:id,invoice_id,attachment_name',
                'proforma_attachment:id,invoice_id,attachment_name',
                'firc_attachment:id,invoice_id,attachment_name',
                'ebrc:id,invoice_id,e_brc_no,e_brc_date'
            ])->get();

            return response()->json($invoices, 200);
        } else {

            return response()->json(['success' => false, 'message' => 'Selected date cannot be empty'], 422);
        }
    }
}
