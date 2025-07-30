<?php

namespace App\Http\Controllers;

use App\Models\PortOfLandingBt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PortOfLandingBtController extends Controller
{
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    public function getPortOfLandingBt($id) {
		$portoflandings = PortOfLandingBt::with(['ffd_name:id,ffd_name', 'purchase_order:id,purchase_order_number'])->where('business_task_id','=',$id)->get();
		if ($portoflandings->count() > 0) {
            return response()->json($portoflandings, 200);
        } else {
            return response()->json([], 200);
        }
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
	public function storePortOfLandingBt(Request $request) {
        $this->validate($request,[
            'ffd_id' => 'required|integer',
            'business_task_id' => 'required|integer',
        ]);
		if (PortOfLandingBt::create([
            'ffd_id' => $request->ffd_id,
            'agent_name'=> $request->agent_name,
            'freight_cost'=> $request->freight_cost,
            'po_no'=> $request->po_no,
            'pickup_refrence_number'=> $request->pickup_refrence_number,
            'pickup_booking_date'=> $request->pickup_booking_date,
            'delivery_location'=> $request->delivery_location,
            'expected_shipment'=> $request->expected_shipment,
            'accepted_shipment_delivery_date'=> $request->accepted_shipment_delivery_date,
            'follow_up_port_of_landing'=> $request->follow_up_port_of_landing,
            'business_task_id'=> $request->business_task_id,
            'created_by' => Auth::id()
        ])) {
            return response()->json(['success' => true, 'message' => 'FOB Shipment details saved successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function editPortOfLandingBt($id) {
        $pickup = PortOfLandingBt::with(['ffd_name:id,ffd_name', 'purchase_order:id,purchase_order_number'])->find($id);
        if($pickup) {
            return response()->json($pickup, 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find FOB Shipment details'], 422);
        }
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
	public function updatePortOfLandingBt(Request $request, $id) {
        $this->validate($request,[
            'ffd_id' => 'required|integer',
            'business_task_id' => 'required|integer',
        ]);
		$data = array(
            'ffd_id' => $request->ffd_id,
            'agent_name'=> $request->agent_name,
            'freight_cost'=> $request->freight_cost,
            'po_no'=> $request->po_no,
            'pickup_refrence_number'=> $request->pickup_refrence_number,
            'pickup_booking_date'=> $request->pickup_booking_date,
            'delivery_location'=> $request->delivery_location,
            'expected_shipment'=> $request->expected_shipment,
            'accepted_shipment_delivery_date'=> $request->accepted_shipment_delivery_date,
            'follow_up_port_of_landing'=> $request->follow_up_port_of_landing,
            'business_task_id'=> $request->business_task_id,
        );
		if (PortOfLandingBt::find($id)->update($data)) {
            return response()->json(['success' => true, 'message' => 'FOB Shipment details updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
	}
}
