<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SupplierScrutinyBt;
use Illuminate\Support\Facades\Auth;

class SupplierScrutinyBtController extends Controller
{
    /**
     * @return string
     */
    public function getSupplierScrutinyBt($btId) {
		$supplierscrutinies = SupplierScrutinyBt::select('id','vendor_id','supplier_name','gst_number','gst_status','gst_last_filing_date','previousnongstinvoice','undertaking_accountant','business_task_id')->with('vendor_details:id,name')->where('business_task_id', $btId)->get();
		if ($supplierscrutinies->count() > 0) {
			return response()->json($supplierscrutinies, 200);
		}
        else {
			return response()->json([], 200);
		}
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
	public function storeSupplierScrutinyBt(Request $request) {
        $this->validate($request, [
            'vendor_id' => 'required|integer',
            'gst_number' => 'required|alpha_num',
            'gst_status' => 'required',
            'gst_last_filing_date' => 'required',
            'previousnongstinvoice' => 'nullable|string|max:100',
        ]);
		SupplierScrutinyBt::create([
            'vendor_id'=> $request->vendor_id,
            'supplier_name'=> null,
            'gst_number'=> $request->gst_number,
            'gst_status'=> $request->gst_status,
            'gst_last_filing_date'=> $request->gst_last_filing_date,
            'previousnongstinvoice'=> $request->previousnongstinvoice ?? '',
            'undertaking_accountant' => $request->has('undertaking_accountant') ? 1 : 0,
            'business_task_id'=> $request->business_task_id,
            'created_by' => Auth::id()
        ]);
        return response()->json(['success' => true, 'message' => 'Supplier Scrutiny saved successfully'], 200);
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function editSupplierScrutinyBt($id) {
        $supplier = SupplierScrutinyBt::with('vendor_details:id,name')->find($id);
        if($supplier) {
            return response()->json($supplier);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find supplier scrutiny'], 422);
        }
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
	public function updateSupplierScrutinyBt(Request $request) {
        $this->validate($request, [
            'supplier_scrutiny_id' => 'required|integer',
            'vendor_id' => 'required|integer',
            'gst_number' => 'required|alpha_num',
            'gst_status' => 'required',
            'gst_last_filing_date' => 'required',
            'previousnongstinvoice' => 'nullable|string|max:100',
        ]);
		$data = array(
            'vendor_id' => $request->vendor_id,
            'supplier_name'=> $request->supplier_name,
            'gst_number'=> $request->gst_number,
            'gst_status'=> $request->gst_status,
            'gst_last_filing_date'=> $request->gst_last_filing_date,
            'previousnongstinvoice'=> $request->previousnongstinvoice ?? '',
            'undertaking_accountant' => $request->has('undertaking_accountant') ? 1 : 0,
        );
		SupplierScrutinyBt::find($request->supplier_scrutiny_id)->update($data);
		return response()->json(['success' => true, 'message' => 'Supplier Scrutiny updated successfully']);
	}
}
