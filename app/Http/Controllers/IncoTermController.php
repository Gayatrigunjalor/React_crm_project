<?php

namespace App\Http\Controllers;

use App\Http\Requests\IncoTermsRequest;
use App\Models\BusinessTask;
use App\Models\IncoTerm;
use App\Models\Invoice;
use App\Models\Irm;
use App\Models\PurchaseOrder;
use App\Models\Quotation;
use App\Models\Warehouse;

class IncoTermController extends Controller
{
    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function index()
    {
        $this->authorize('inco_terms_list');
        $rows = IncoTerm::select('id', 'inco_term')->orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function incoTermsListing()
    {
        $rows = IncoTerm::select('id', 'inco_term')->orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @param \App\Http\Requests\IncoTermsRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(IncoTermsRequest $request)
    {
        $this->authorize('inco_terms_create');

        if (IncoTerm::create(['inco_term' => $request->inco_term])) {
            return response()->json(['success' => true, 'message' => 'Inco term saved successfully'], 200);
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
        $this->authorize('inco_terms_edit');
        $term = IncoTerm::select('id', 'inco_term')->find($id);
        if($term) {
            return response()->json($term);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find inco term'], 422);
        }
    }

    /**
     * @param \App\Http\Requests\IncoTermsRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(IncoTermsRequest $request, $id)
    {
        $this->authorize('inco_terms_edit');
        if (IncoTerm::find($id)->update(['inco_term' => $request->inco_term])) {
            return response()->json(['success' => true, 'message' => 'Inco term updated successfully'], 200);
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
        $this->authorize('inco_terms_delete');
        $irmCount = Irm::where('inco_term_id', $id)->count();
        $invoiceCount = Invoice::where('inco_term_id', $id)->count();
        $quotationCount = Quotation::where('inco_term_id', $id)->count();
        $btCount = BusinessTask::where('inco_term_id', $id)->count();
        $poCount = PurchaseOrder::where('inco_term_id', $id)->count();
        $warehouseCount = Warehouse::where('inco_term_id', $id)->count();
        $message = '';
        $message = 'Bank ID cannot be removed as it is used in ';
        if($irmCount > 0 || $invoiceCount > 0 || $quotationCount > 0 || $btCount > 0 || $poCount > 0 || $warehouseCount > 0 ){
            if($irmCount > 0) {
                $message .= ' | IRM record(s) | ';
            }
            if($invoiceCount > 0) {
                $message .= ' | Invoice record(s) | ';
            }
            if($quotationCount > 0) {
                $message .= ' | Proforma Invoice record(s) | ';
            }
            if($btCount > 0) {
                $message .= ' | Business Tasks record(s) | ';
            }
            if($poCount > 0) {
                $message .= ' | Purchase Order record(s) | ';
            }
            if($warehouseCount > 0) {
                $message .= ' | WMS record(s) | ';
            }
            return response()->json(['success' => false, 'message' => $message], 422);
        } else {
            if (IncoTerm::find($id)->delete()) {
                return response()->json(['success' => true, 'message' => 'Inco term deleted successfully'], 200);
            } else {
                return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
            }
        }
    }
}
