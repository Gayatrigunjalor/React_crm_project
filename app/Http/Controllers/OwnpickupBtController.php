<?php

namespace App\Http\Controllers;

use App\Models\OwnpickupBt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OwnpickupBtController extends Controller
{
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    public function getOwnpickupBt($id) {
		$ownpickups = OwnpickupBt::with(['ffd_name:id,ffd_name', 'purchase_order:id,purchase_order_number'])->where('business_task_id', $id)->get();
        if ($ownpickups->count() > 0) {
            return response()->json($ownpickups, 200);
        } else {
            return response()->json([], 200);
        }
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
	public function storeOwnpickupBt(Request $request) {
        $this->validate($request,[
            'ffd_id' => 'required|integer',
            'business_task_id' => 'required|integer',
        ]);
		if (OwnpickupBt::create([
            'pick_up_location'=> $request->pick_up_location,
            'delivery_location'=> $request->delivery_location,
            'ffd_id'=> $request->ffd_id,
            'agent_name'=> $request->agent_name,
            'opu_freight_cost'=> $request->opu_freight_cost,
            'purchase_order_no'=> $request->purchase_order_no,
            'pickup_refrence_number'=> $request->pickup_refrence_number,
            'pick_up_booking_date'=> $request->pick_up_booking_date,
            'accepted_shipment_arrival_date'=> $request->accepted_shipment_arrival_date,
            'own_pick_up_follow_up'=> $request->own_pick_up_follow_up,
            'business_task_id'=> $request->business_task_id,
            'created_by' => Auth::id()
        ])) {
            return response()->json(['success' => true, 'message' => 'Paid pickup details saved successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function editOwnpickupBt($id) {
        $pickup = OwnpickupBt::with(['ffd_name:id,ffd_name', 'purchase_order:id,purchase_order_number'])->find($id);
        if($pickup) {
            return response()->json($pickup, 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find pickup details'], 422);
        }
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
	public function updateOwnpickupBt(Request $request, $id) {
        $this->validate($request,[
            'ffd_id' => 'required|integer',
            'business_task_id' => 'required|integer',
        ]);
		$data = array(
            'ffd_id'=> $request->ffd_id,
            'pick_up_location'=> $request->pick_up_location,
            'delivery_location'=> $request->delivery_location,
            'agent_name'=> $request->agent_name,
            'opu_freight_cost'=> $request->opu_freight_cost,
            'purchase_order_no'=> $request->purchase_order_no,
            'pickup_refrence_number'=> $request->pickup_refrence_number,
            'pick_up_booking_date'=> $request->pick_up_booking_date,
            'accepted_shipment_arrival_date'=> $request->accepted_shipment_arrival_date,
            'own_pick_up_follow_up'=> $request->own_pick_up_follow_up,
            'business_task_id'=> $request->business_task_id,
        );
		if (OwnpickupBt::find($id)->update($data)) {
            return response()->json(['success' => true, 'message' => 'Paid pickup details updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
	}
}
