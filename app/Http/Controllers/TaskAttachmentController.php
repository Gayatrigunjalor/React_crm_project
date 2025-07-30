<?php

namespace App\Http\Controllers;

use App\Models\TaskTimeLine;
use Illuminate\Http\Request;
use App\Models\TaskAttachment;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class TaskAttachmentController extends Controller
{
    /**
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addTaskAttachment(Request $request)
    {
        $messages = [
            "files.max" => "file can't be more than 3. File size limit upto 5MB"
        ];

        $this->validate($request, [
            'files.*' => 'max:5000',
            'files' => 'max:3',
        ], $messages);
        if ($request->TotalFiles > 0) {
            for ($x = 0; $x < $request->TotalFiles; $x++) {
                if ($request->hasFile('files' . $x)) {
                    $file      = $request->file('files' . $x);
                    $name = $file->getClientOriginalName();
                    Storage::put('uploads/tasks/attachment/' . $name, file_get_contents($file));
                    $insert[$x]['name'] = $name;
                    $insert[$x]['task_id'] = $request->task_id;
                    $insert[$x]['created_by'] = Auth::id();
                    TaskTimeLine::create([
                        'description' => 'uploaded a file ' . $name,
                        'task_id' => $request->task_id,
                        'created_by' => Auth::id()
                    ]);
                }
            }
            TaskAttachment::insert($insert);
        }
        return response()->json(['success' => true, 'message' => 'Task Attachment added successfully'], 200);
    }

    /**
     * @return void
     */
    public function fetchAllTaskAttachments(Request $request)
    {
        $this->validate($request, [
            'id' => 'required'
        ]);
        $rows = TaskAttachment::where('task_id', $request->id)->orderBy('id', 'desc')->get();
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
    public function deleteTaskAttachment(Request $request)
    {
        $this->validate($request, [
            'id' => 'required'
        ]);
        $row = TaskAttachment::find($request->id);
        if (!empty($row->name)) {
            Storage::delete('uploads/tasks/attachment/' . $row->name);
        }
        TaskAttachment::find($request->id)->delete();
        TaskTimeLine::create([
            'description' => 'deleted a file ' . $row->name,
            'task_id' => $row->task_id,
            'created_by' => Auth::id()
        ]);
        return response()->json(['success' => true, 'message' => 'Task Attachment deleted successfully'], 200);
    }
}
