<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ExportAgentBt;
use Illuminate\Support\Facades\Auth;

class ExportAgentBtController extends Controller
{
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    public function getExportAgentBt($id) {
		$exportagents = ExportAgentBt::with(['ffd_name:id,ffd_name'])->where('business_task_id', $id)->get();
		if ($exportagents->count() > 0) {
            return response()->json($exportagents, 200);
        } else {
            return response()->json([], 200);
        }
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
	public function storeExportAgentBt(Request $request) {
        $this->validate($request,[
            'ffd_id' => 'required|integer',
            'business_task_id' => 'required|integer',
        ]);
		if (ExportAgentBt::create([
            'ffd_id'=> $request->ffd_id,
            'agent_name'=> $request->agent_name,
            'freight_cost'=> $request->freight_cost,
            'purchase_order_no'=> $request->purchase_order_no,
            'pickup_ref_number'=> $request->pickup_ref_number,
            'pickup_booking_date'=> $request->pickup_booking_date,
            'awb_acceptance_date'=> $request->awb_acceptance_date,
            'follow_up_export_agent'=> $request->follow_up_export_agent,
            'accepted_shipment_delivery_date'=> $request->accepted_shipment_delivery_date,
            'expected_documents_handover_date'=> $request->expected_documents_handover_date,
            'courier_pod_no'=> $request->courier_pod_no,
            'business_task_id'=> $request->business_task_id,
            'created_by' => Auth::id()
        ])) {
            return response()->json(['success' => true, 'message' => 'C&F CIF Shipment details saved successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function editExportAgentBt($id) {
        $exportAgent = ExportAgentBt::with(['ffd_name:id,ffd_name'])->find($id);
        if($exportAgent) {
            return response()->json($exportAgent, 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find C&F CIF details'], 422);
        }
		return response()->json(ExportAgentBt::find($request->id));
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
	public function updateExportAgentBt(Request $request, $id) {
        $this->validate($request,[
            'ffd_id' => 'required|integer',
            'business_task_id' => 'required|integer',
        ]);
		$data = array(
            'ffd_id'=> $request->ffd_id,
            'agent_name'=> $request->agent_name,
            'freight_cost'=> $request->freight_cost,
            'purchase_order_no'=> $request->purchase_order_no,
            'pickup_ref_number'=> $request->pickup_ref_number,
            'pickup_booking_date'=> $request->pickup_booking_date,
            'awb_acceptance_date'=> $request->awb_acceptance_date,
            'follow_up_export_agent'=> $request->follow_up_export_agent,
            'accepted_shipment_delivery_date'=> $request->accepted_shipment_delivery_date,
            'expected_documents_handover_date'=> $request->expected_documents_handover_date,
            'courier_pod_no'=> $request->courier_pod_no,
            'business_task_id'=> $request->business_task_id,
        );
		if(ExportAgentBt::find($id)->update($data)) {
            return response()->json(['success' => true, 'message' => 'C&F CIF Shipment details updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
	}
}
