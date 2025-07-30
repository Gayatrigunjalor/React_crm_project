<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SubTaskTimeLine;
use App\Models\SubTaskAttachment;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class SubTaskAttachmentController extends Controller
{
    /**
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addSubTaskAttachment(Request $request)
    {
        $this->validate($request, [
            'attachmentFiles.*' => 'required|max:2048'
        ],[
            'attachmentFiles.required' => 'File is required',
            'attachmentFiles.max' => 'Maximum file size is 2 MB'
        ]);
        if ($request->attachmentFiles > 0) {
            for ($x = 0; $x < $request->attachmentFiles; $x++) {
                if ($request->hasFile('subtaskfiles' . $x)) {
                    $file      = $request->file('subtaskfiles' . $x);
                    $name = $file->getClientOriginalName();
                    Storage::put('uploads/subtasks/attachment/' . $name, file_get_contents($file));
                    $insert[$x]['name'] = $name;
                    $insert[$x]['sub_task_id'] = $request->sub_task_id;
                    $insert[$x]['created_by'] = Auth::id();
                    SubTaskTimeLine::create([
                        'description' => 'uploaded a file ' . $name,
                        'sub_task_id' => $request->sub_task_id,
                        'created_by' => Auth::id()
                    ]);
                }
            }
            SubTaskAttachment::insert($insert);
        }
        return response()->json(['success' => true, 'message' => 'Sub Task Attachment added successfully'], 200);
    }

    /**
     * @return void
     */
    public function fetchAllSubTaskAttachments(Request $request)
    {
        $this->validate($request, [
            'id' => 'required'
        ]);
        $rows = SubTaskAttachment::where('sub_task_id', $request->id)->orderBy('id', 'desc')->get();
        if ($rows->count() > 0) {
            return response()->json($rows, 200);
        } else {
            return response()->json([], 200);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteSubTaskAttachment(Request $request)
    {
        $this->validate($request, [
            'id' => 'required'
        ]);
        $row = SubTaskAttachment::find($request->id);
        if (!empty($row->name)) {
            Storage::delete('uploads/subtasks/attachment/' . $row->name);
        }
        SubTaskAttachment::find($request->id)->delete();
        SubTaskTimeLine::create([
            'description' => 'deleted a file ' . $row->name,
            'sub_task_id' => $row->sub_task_id,
            'created_by' => Auth::id()
        ]);
        return response()->json(['success' => true, 'message' => 'Sub Task Attachment deleted successfully'], 200);
    }
}
