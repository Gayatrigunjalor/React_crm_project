<?php

namespace App\Http\Controllers;

use App\Models\FreightCostSourcingBt;
use App\Models\PurchaseOrder;

class FfdPaymentController extends Controller
{
    public function index() {
        $ffd_winners = FreightCostSourcingBt::where('tender_status', 'Winner')->with('ffd_name')->get();
        $ffd_bidders = FreightCostSourcingBt::where('tender_status', '!=', 'Winner')->with('ffd_name')->get();
        $ffd_purch_orders = PurchaseOrder::where('po_type', 'ffd')->with('quotation_attach')->get();
        return response()->json([
            'ffd_winners' => $ffd_winners,
            'ffd_bidders' => $ffd_bidders,
            'ffd_purch_orders' => $ffd_purch_orders
        ]);
    }
}
