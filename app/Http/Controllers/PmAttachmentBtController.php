<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PmAttachmentBt;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PmAttachmentBtController extends Controller
{
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function storePmAttachmentBt(Request $request)
    {
        $data = array(
            'business_task_id' => $request->business_task_id,
            'attachment_name' => $request->attachment_name,
            'attachment_details' => $request->attachment_details,
            'created_by' => Auth::id()
        );
        if ($request->hasFile('name')) {
            $this->validate($request,[
                'name' => 'required|max:2048',
            ]);
            $attachment = $request->file('name');
            $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/business-task/pm/' . $attachmentName, file_get_contents($attachment));
            $data['name'] = "$attachmentName";
        }
        if (PmAttachmentBt::create($data)) {
            return response()->json(['success' => true, 'message' => 'PM attachment saved successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    public function showPmAttachmentBt($id)
    {
        $rows = PmAttachmentBt::where('business_task_id', $id)->get();
        if ($rows->count() > 0) {
            return response()->json($rows);
        }
        return response()->json([],200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deletePmAttachment(Request $request)
    {
        $row = PmAttachmentBt::find($request->id);
        if (!empty($row->name)) {
            Storage::delete('uploads/business-task/pm/' . $row->name);
        }
        $row->delete();
        return response()->json(['success' => true, 'message' => 'PM attachment deleted successfully'], 200);
    }
}
