<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AcAttachmentBt;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AcAttachmentBtController extends Controller
{
    /**
     * @param  \Illuminate\Http\Request  $request
     */
    public function showAcAttachmentBt($id)
    {
        $rows = AcAttachmentBt::where('supplier_scrutiny_id',$id)->get();
        if ($rows->count() > 0) {
            return response()->json($rows);
        }
        return response()->json([],200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function storeAcAttachmentBt(Request $request)
    {
        $this->validate($request, [
            'name' => 'required',
            'attachment_name' => 'required|string',
            'attachment_details' => 'required|string',
            'supplier_scrutiny_id' => 'required|integer'
        ]);
        if ($request->hasFile('name')) {
            $attachment = $request->file('name');
            $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/business-task/ac/scrutiny/' . $attachmentName, file_get_contents($attachment));
        } else {
            $attachmentName = null;
        }
        if (AcAttachmentBt::create([
            'supplier_scrutiny_id' => $request->supplier_scrutiny_id,
            'attachment_name' => $request->attachment_name,
            'attachment_details' => $request->attachment_details,
            'name' => $attachmentName,
            'created_by' => Auth::id()
        ])) {
            return response()->json(['success' => true, 'message' => 'Accounts attachment saved successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @param \App\Services\AcAttachmentBtService $acAttachmentBtService
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteAcAttachment($id)
    {
        $row = AcAttachmentBt::find($id);
        if (!empty($row->name)) {
            Storage::delete('uploads/business-task/ac/scrutiny/' . $row->name);
        }
        $row->delete();
        return response()->json(['success' => true, 'message' => 'Accounts attachment deleted successfully'], 200);
    }
}
