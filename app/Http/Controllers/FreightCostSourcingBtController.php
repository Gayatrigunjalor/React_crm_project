<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\FreightCostSourcingBt;

class FreightCostSourcingBtController extends Controller
{
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    public function getFreightcostSourcingBt($id)
    {
        $freightsourcings = FreightCostSourcingBt::with(['ffd_name:id,ffd_name'])->where('business_task_id', '=', $id)->get();
        if ($freightsourcings->count() > 0) {
            return response()->json($freightsourcings, 200);
        } else {
            return response()->json([], 200);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function storeFreightcostSourcingBt(Request $request)
    {
        $this->validate($request,[
            'ffd_id' => 'required|integer',
            'business_task_id' => 'required|integer',
            'pick_up_location' => 'required',
            'delivery_location' => 'required',
            'quoting_price' => 'required',
            'contact_person_name' => 'required',
            'contact_person_email' => 'required|email',
            'contact_person_phone' => 'required',
            'tender_status' => 'required'
        ]);

        if ($request->hasFile('freight_cost_invoice')) {
            $this->validate($request,[
                'freight_cost_invoice' => 'required|max:2048',
            ]);
            $attachment = $request->file('freight_cost_invoice');
            $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/business-task/lm/freightcostsourcing/' . $attachmentName, file_get_contents($attachment));
        } else {
            $attachmentName = null;
        }
        if(FreightcostSourcingBt::create([
            'ffd_id' => $request->ffd_id,
            'freight_agent' => $request->freight_agent,
            'pick_up_location' => $request->pick_up_location,
            'delivery_location' => $request->delivery_location,
            'quoting_price' => $request->quoting_price,
            'rate_contract_price' => $request->rate_contract_price ?? 0,
            'contact_person_name' => $request->contact_person_name,
            'contact_person_email' => $request->contact_person_email,
            'contact_person_phone' => $request->contact_person_phone,
            'budget' => $request->budget ?? 0,
            'vessel_airline_name' => $request->vessel_airline_name,
            'vessel_airline_date' => $request->vessel_airline_date,
            'freight_cost_invoice' => $attachmentName,
            'tender_status' => $request->tender_status,
            'business_task_id' => $request->business_task_id,
            'created_by' => Auth::id()
        ])) {
            return response()->json(['success' => true, 'message' => 'Freight Cost Sourcing saved successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function editFreightcostSourcingBt($id)
    {
        $freight = FreightcostSourcingBt::with('ffd_name:id,ffd_name')->find($id);
        if($freight) {
            return response()->json($freight, 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find freight details'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateFreightcostSourcingBt(Request $request, $id)
    {
        $this->validate($request,[
            'ffd_id' => 'required|integer',
            'business_task_id' => 'required|integer',
            'pick_up_location' => 'required',
            'delivery_location' => 'required',
            'quoting_price' => 'required',
            'contact_person_name' => 'required',
            'contact_person_email' => 'required|email',
            'contact_person_phone' => 'required',
            'tender_status' => 'required'
        ]);
        $data = array(
            'ffd' => $request->freight_agent,
            'freight_agent' => $request->freight_agent,
            'pick_up_location' => $request->pick_up_location,
            'delivery_location' => $request->delivery_location,
            'quoting_price' => $request->quoting_price,
            'rate_contract_price' => $request->rate_contract_price ?? 0,
            'contact_person_name' => $request->contact_person_name,
            'contact_person_email' => $request->contact_person_email,
            'contact_person_phone' => $request->contact_person_phone,
            'budget' => $request->budget ?? 0,
            'tender_status' => $request->tender_status,
            'business_task_id' => $request->business_task_id,
            'vessel_airline_name' => $request->vessel_airline_name,
            'vessel_airline_date' => $request->vessel_airline_date,
        );
        if ($request->hasFile('freight_cost_invoice')) {
            $this->validate($request,[
                'freight_cost_invoice' => 'required|max:2048',
            ]);
            $old_file = FreightcostSourcingBt::find($id);
            if (!empty($old_file->freight_cost_invoice)) {
                Storage::delete('uploads/business-task/lm/freightcostsourcing/' . $old_file->freight_cost_invoice);
            }
            $attachment = $request->file('freight_cost_invoice');
            $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/business-task/lm/freightcostsourcing/' . $attachmentName, file_get_contents($attachment));
            $data['freight_cost_invoice'] = "$attachmentName";
        } else {
            unset($data['freight_cost_invoice']);
        }
        if(FreightcostSourcingBt::find($id)->update($data))
        {
            return response()->json(['success' => true, 'message' => 'Freight Cost Sourcing saved successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    public function getWinnerFFD(Request $request)
    {
        $freight_sourcing = FreightCostSourcingBt::where('business_task_id', $request->id)->where('tender_status', 'Winner')->orderBy('id', 'desc')->get();
        if ($freight_sourcing->count() > 0) {
            return response()->json($freight_sourcing[0], 200);
        }
        return response()->json([], 200);
    }
}
