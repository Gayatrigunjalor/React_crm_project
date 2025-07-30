<?php

namespace App\Http\Controllers;

use App\Models\ImportPickupBt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ImportPickupBtController extends Controller
{
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    public function getImportPickupBt($id) {
		$importpickups = ImportPickupBt::with(['ffd_name:id,ffd_name'])->where('business_task_id', $id)->get();
        if ($importpickups->count() > 0) {
            return response()->json($importpickups, 200);
        } else {
            return response()->json([], 200);
        }
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
	public function storeImportPickupBt(Request $request) {
        $this->validate($request,[
            'ffd_id' => 'required|integer',
            'business_task_id' => 'required|integer',
        ]);
		if (ImportPickupBt::create([
            'ffd_id'=> $request->ffd_id,
            'email_id'=> $request->email_id,
            'contact_no'=> $request->contact_no,
            'ffd_name'=> $request->ffd_name['ffd_name'],
            'agent_name'=> $request->agent_name,
            'followup_reminder_importer'=> $request->followup_reminder_importer,
            'kyc_done'=> $request->kyc_done,
            'pick_up_reference_number'=> $request->pick_up_reference_number,
            'pick_up_booking_date'=> $request->pick_up_booking_date,
            'expected_document_handover'=> $request->expected_document_handover,
            'business_task_id'=> $request->business_task_id,
            'created_by' => Auth::id()
        ])) {
            return response()->json(['success' => true, 'message' => 'ExW Shipment details saved successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function editImportPickupBt($id) {
        $pickup = ImportPickupBt::with(['ffd_name:id,ffd_name'])->find($id);
        if($pickup) {
            return response()->json($pickup, 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find ExW Shipment details'], 422);
        }
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
	public function updateImportPickupBt(Request $request, $id) {
        $this->validate($request,[
            'ffd_id' => 'required|integer',
            'business_task_id' => 'required|integer',
        ]);
		$data = array(
            'ffd_id'=> $request->ffd_id,
            'email_id'=> $request->email_id,
            'contact_no'=> $request->contact_no,
            'ffd_name'=> $request->ffd_name,
            'agent_name'=> $request->agent_name,
            'kyc_done'=> $request->kyc_done,
            'pick_up_reference_number'=> $request->pick_up_reference_number,
            'pick_up_booking_date'=> $request->pick_up_booking_date,
            'expected_document_handover'=> $request->expected_document_handover,
            'followup_reminder_importer'=> $request->followup_reminder_importer,
            'business_task_id'=> $request->business_task_id,
        );
		if (ImportPickupBt::find($id)->update($data)) {
            return response()->json(['success' => true, 'message' => 'ExW Shipment details updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
	}
}
