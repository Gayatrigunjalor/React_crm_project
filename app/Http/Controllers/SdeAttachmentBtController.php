<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Quotation;
use App\Models\SdeAttachmentBt;
use App\Models\BusinessTask;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class SdeAttachmentBtController extends Controller
{
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    public function sdeAttachmentListing($id)
    {
        $rows = SdeAttachmentBt::select('id','name','attachment_name','attachment_details','business_task_id')->where('business_task_id', '=', $id)->get();
        if ($rows->count() > 0) {
            $attachments = [];
            foreach ($rows as $row) {
                if($row->attachment_name == "Proforma Invoice" && ($row->name == "" || $row->name == null))
                {
                    $pi = Quotation::where('id', $row->attachment_details)->first();
                    $row['name'] = $pi->pi_number;
                    $row['attachment_details'] = '';
                }
                $attachments[] = $row;
            }
            return response()->json($attachments, 200);
        }
        return response()->json([], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function storeSdeAttachmentBt(Request $request)
    {
        $data = array(
            'business_task_id' => $request->business_task_id,
            'attachment_name' => $request->attachment_name,
            'attachment_details' => $request->attachment_details,
            'created_by' => Auth::id()
        );
        $data['name'] = "";
        if ($request->hasFile('name')) {
            $this->validate($request,[
                'name' => 'max:4096',
            ],['name.max' => 'Maximum file upload size is 4MB' ]);
            $attachment = $request->file('name');
            $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            if(!Storage::put('uploads/business-task/sde/' . $attachmentName, file_get_contents($attachment))){
                return response()->json(['success' => false, 'message' => "File Upload failed"], 422);
            }
            $data['name'] = "$attachmentName";
        }
        SdeAttachmentBt::create($data);
        BusinessTask::find($request->business_task_id)->update(['inorbvict_commitment' => $request->inorbvict_commitment]);
        return response()->json(['success' => true, 'message' => 'SDE Attachment added successfully'], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    public function showSdeAttachmentBt($id)
    {
        $row = SdeAttachmentBt::select('id','name','attachment_name','attachment_details','business_task_id', 'name as attachment_title')->find($id);
        if($row) {
            $row['inorbvict_commitment'] = '';
            if($row->attachment_name == 'Proforma Invoice') {
                $pi = Quotation::where('id', $row->attachment_details)->first();
                $row['name'] = $pi->pi_number;
                $row['quotation'] = ['id' => $pi->id, 'pi_number' => $pi->pi_number];
            }
            $row['inorbvict_commitment'] = BusinessTask::where('id', $row->business_task_id)->value('inorbvict_commitment');
        }
        return response()->json($row, 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateSdeAttachmentBt(Request $request)
    {
        $this->validate($request,[
            'sde_id' => 'required|integer',
        ],['sde_id.required' => 'SDE Attachment ID is missing' ]);
        $data = array(
            'business_task_id' => $request->business_task_id,
            'attachment_name' => $request->attachment_name,
            'attachment_details' => $request->attachment_details,
            'created_by' => Auth::id()
        );
        if ($request->hasFile('name')) {
            $this->validate($request,[
                'name' => 'max:4096',
            ],['name.max' => 'Maximum file upload size is 4MB' ]);
            $old_file = SdeAttachmentBt::find($request->sde_id);
            if (!empty($old_file->name)) {
                Storage::delete('uploads/business-task/sde/' . $old_file->name);
            }
            $attachment = $request->file('name');
            $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            if(!Storage::put('uploads/business-task/sde/' . $attachmentName, file_get_contents($attachment))){
                return response()->json(['success' => false, 'message' => "File Upload failed"], 422);
            }
            $data['name'] = "$attachmentName";
        }
        SdeAttachmentBt::find($request->sde_id)->update($data);
        BusinessTask::find($request->business_task_id)->update(['inorbvict_commitment' => $request->inorbvict_commitment]);
        return response()->json(['success' => true, 'message' => 'SDE Attachment updated successfully'], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteSdeAttachment(Request $request)
    {
        $row = SdeAttachmentBt::find($request->id);
        if (!empty($row->name)) {
            Storage::delete('uploads/business-task/sde/' . $row->name);
        }
        if ($row->delete()) {
            return response()->json(['success' => true, 'message' => 'SDE Attachment deleted successfully'], 200);
        } else {
            return response()->json(['success' => true, 'message' => 'Something went wrong'], 200);
        }

    }
}
