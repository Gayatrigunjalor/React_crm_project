<?php

namespace App\Http\Controllers;

use App\Http\Requests\CurrencyRequest;
use App\Models\Currency;
use App\Models\Irm;
use App\Models\IrmPaymentHistory;
use App\Models\PurchaseOrder;
use App\Models\Quotation;
use Illuminate\Http\Request;

class CurrencyController extends Controller
{
    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function index()
    {
        $this->authorize('currency_list');
        $rows = Currency::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function currencyListing()
    {
        $rows = Currency::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @param \App\Http\Requests\CurrencyRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(CurrencyRequest $request)
    {
        $this->authorize('currency_create');
        if (Currency::create(['name' => $request->name, 'symbol' => $request->symbol])) {
            return response()->json(['success' => true, 'message' => 'Currency saved successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $this->authorize('currency_edit');
        $currency = Currency::select('id', 'name', 'symbol')->find($id);
        if($currency) {
            return response()->json($currency);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find Currency'], 422);
        }
    }

    /**
     * @param \App\Http\Requests\CurrencyRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(CurrencyRequest $request, $id)
    {
        $this->authorize('currency_edit');
        if (Currency::find($id)->update(['name' => $request->name, 'symbol' => $request->symbol])) {
            return response()->json(['success' => true, 'message' => 'Currency updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse|void
     */
    public function destroy($id)
    {
        $this->authorize('currency_delete');
        $currency = Currency::find($id);
        if(!$currency) {
            return response()->json(['success' => false, 'message' => 'Proforma Invoice not found'], 404);
        }
        $irmCount = Irm::where('currency_id', $id)->count();
        $quotationCount = Quotation::where('currency_id', $id)->count();
        $poCount = PurchaseOrder::where('currency_id', $id)->count();
        $irmPayCount = IrmPaymentHistory::where('currency_id', $id)->count();
        $message = '';
        $message = 'Currency cannot be removed as it is used in ';
        if($irmCount > 0 || $quotationCount > 0 || $poCount > 0 || $irmPayCount > 0){
            if($irmCount > 0) {
                $message .= ' | IRM record(s) | ';
            }
            if($quotationCount > 0) {
                $message .= ' | Proforma Invoice record(s) | ';
            }
            if($poCount > 0) {
                $message .= ' | Purchase Order record(s) | ';
            }
            if($irmPayCount > 0) {
                $message .= ' | IRM Payment History record(s) | ';
            }
            return response()->json(['success' => false, 'message' => $message], 422);
        } else {
            if (Currency::find($id)->delete()) {
                return response()->json(['success' => true, 'message' => 'Currency deleted successfully'], 200);
            } else {
                return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
            }
        }
    }
}
