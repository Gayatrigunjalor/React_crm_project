<?php

namespace App\Http\Controllers;

use App\Models\ServeBySuppliersBt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ServedBySuppliersBtController extends Controller
{
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    public function getServeBySuppliersBt($id) {
		$servedbysuppliers = ServeBySuppliersBt::with(['ffd_name:id,ffd_name'])->where('business_task_id',$id)->get();
		if ($servedbysuppliers->count() > 0) {
            return response()->json($servedbysuppliers, 200);
        } else {
            return response()->json([], 200);
        }
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
	public function storeServeBySuppliersBt(Request $request) {
        $this->validate($request,[
            'ffd_id' => 'required|integer',
            'business_task_id' => 'required|integer',
        ]);
		if(ServeBySuppliersBt::create([
            'ffd_id'=> $request->ffd_id,
            'pod_lorry_receipt'=> $request->pod_lorry_receipt,
            'booking_date'=> $request->booking_date,
            'acpcted_shipment_arrivel_date'=> $request->acpcted_shipment_arrivel_date,
            'follow_up_served_by'=> $request->follow_up_served_by,
            'pod_for_lorry'=> $request->pod_for_lorry,
            'business_task_id'=> $request->business_task_id,
            'created_by' => Auth::id()
        ])) {
            return response()->json(['success' => true, 'message' => 'Supplier Paid Dispatch saved successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function editServeBySuppliersBt($id) {
        $pickup = ServeBySuppliersBt::with(['ffd_name:id,ffd_name'])->find($id);
        if($pickup) {
            return response()->json($pickup, 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find Supplier Paid Dispatch details'], 422);
        }
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
	public function updateServeBySuppliersBt(Request $request, $id) {
        $this->validate($request,[
            'ffd_id' => 'required|integer',
            'business_task_id' => 'required|integer',
        ]);
		$data = array(
            'ffd_id'=> $request->ffd_id,
            'pod_lorry_receipt'=> $request->pod_lorry_receipt,
            'booking_date'=> $request->booking_date,
            'acpcted_shipment_arrivel_date'=> $request->acpcted_shipment_arrivel_date,
            'follow_up_served_by'=> $request->follow_up_served_by,
            'pod_for_lorry'=> $request->pod_for_lorry,
            'business_task_id'=> $request->business_task_id,
        );
		if (ServeBySuppliersBt::find($id)->update($data)) {
            return response()->json(['success' => true, 'message' => 'Supplier Paid Dispatch details updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
	}
}
