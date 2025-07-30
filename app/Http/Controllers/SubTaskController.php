<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Stage;
use App\Models\SubTask;
use App\Models\TaskTimeLine;
use Illuminate\Http\Request;
use App\Models\SubTaskTimeLine;
use Illuminate\Support\Facades\Auth;
use App\Notifications\TaskNotification;
use Illuminate\Support\Facades\Storage;
use App\Models\CommentAttachmentSubtask;
use Illuminate\Support\Facades\Notification;

class SubTaskController extends Controller
{
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addSubtaskList(Request $request)
    {
        $this->validate($request, [
            'title' => 'required|string',
            'task_id' => 'required|integer'
        ]);
        $data = SubTask::create([
            'title' => $request->title,
            'task_id' => $request->task_id,
            'stage_id' => 2,
            'created_by' => Auth::id()
        ]);
        TaskTimeLine::create([
            'description' => 'created subtask: ' . $request->title,
            'task_id' => $request->task_id,
            'created_by' => Auth::id()
        ]);
        SubTaskTimeLine::create([
            'description' => 'Created This Task',
            'sub_task_id' => $data->id,
            'created_by' => Auth::id()
        ]);
        return response()->json(['success' => true, 'message' => 'Subtask created successfully'], 200);
    }

    /**
     * @return void
     */
    public function fetchSubtaskList(Request $request)
    {
        $this->validate($request, [
            'task_id' => 'required|integer'
        ]);
        $rows = [];
        $rows = SubTask::with('stages')->where('task_id', $request->task_id)->orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteSubtask(Request $request)
    {
        $this->validate($request, [
            'id' => 'required|integer'
        ]);
        if(SubTask::find($request->id)->delete()){
            return response()->json(['success' => true, 'message' => 'Subtask deleted successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateSubtaskStage(Request $request)
    {
        $this->validate($request, [
            'sub_task_id' => 'required|integer',
            'current_stage_id' => 'required|integer',
            'updated_stage_id' => 'required|integer'
        ]);
        $formData = array(
            'stage_id' => $request->updated_stage_id,
        );
        SubTask::find($request->sub_task_id)->update($formData);
        $stageC = Stage::find($request->current_stage_id);
        $stageU = Stage::find($request->updated_stage_id);
        $description = 'changed status from <b>' . $stageC->stage_name . '</b> to <b>' . $stageU->stage_name . '</b>';
        SubTaskTimeLine::create([
            'description' => $description,
            'sub_task_id' => $request->sub_task_id,
            'created_by' => Auth::id()
        ]);
        return response()->json([
            'success' => true,
            'message' => 'Subtask updated successfully',
            'data' => $stageU
        ], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function editSubtask(Request $request)
    {
        $this->validate($request, [
            'id' => 'required|integer'
        ]);
        $row = SubTask::with('stages')->find($request->id);
        if ($row->created_by == Auth::id()) {
            $row['isAuthorizedAssignee'] = 1;
        } else {
            $row['isAuthorizedAssignee'] = 0;
        }
        $row['created'] = date("M, d H:i a", strtotime($row->created_at));
        return response()->json($row, 200);
    }

    /**
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function timelineSubTask(Request $request)
    {
        $this->validate($request, [
            'sub_task_id' => 'required|integer'
        ]);
        $subTaskTimeLines = SubTaskTimeLine::with(['attachments'])->where('sub_task_id', $request->sub_task_id)->get();
        $i = 0;
        foreach ($subTaskTimeLines as $row) {
            if ($row->created_by == Auth::id()) {
                $subTaskTimeLines[$i]['name'] = 'You';
            } else {
                $user = User::find($row->created_by);
                if ($user->user_role == 0) {
                    $subTaskTimeLines[$i]['name'] =  "Admin";
                } else {
                    $subTaskTimeLines[$i]['name'] =  $user->employeeRole->name;
                }
            }
            $i++;
        }
        return response()->json($subTaskTimeLines, 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStageNextSubtask(Request $request)
    {
        $this->validate($request, [
            'id' => 'required|integer',
            'stage_id' => 'required|integer',
            'new_stage_id' => 'required|integer',
        ]);
        $formData = array(
            'stage_id' => $request->new_stage_id,
        );
        $tasksC = SubTask::with(['stages'])->find($request->id);
        $stageC = Stage::find($tasksC->stage_id);
        $stageUpdated = Stage::find($request->new_stage_id);
        $description = 'changed status from <b>' . $stageC->stage_name . '</b> to <b>' . $stageUpdated->stage_name . '</b>';
        SubTaskTimeLine::create([
            'description' => $description,
            'sub_task_id' => $request->id,
            'created_by' => Auth::id()
        ]);
        SubTask::find($request->id)->update($formData);
        return response()->json(['success' => true, 'message' => 'Stage successfully updated for subtask'], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateSubtaskSprintPoint(Request $request)
    {
        $this->validate($request, [
            'id' => 'required|integer',
            'sprint_point' => 'required'
        ]);
        $formData = array(
            'sprint_point' => $request->sprint_point,
        );
        $tasksC = SubTask::find($request->id);
        if ($tasksC->sprint_point == null) {
            $task_sprint_point = '-';
        } else {
            $task_sprint_point = $tasksC->sprint_point;
        }
        $description = 'changed status from <b>' . $task_sprint_point . '</b> to <b>' . $request->sprint_point . '</b>';
        SubTaskTimeLine::create([
            'description' => $description,
            'sub_task_id' => $request->id,
            'created_by' => Auth::id()
        ]);
        SubTask::find($request->id)->update($formData);
        return response()->json(['success' => true, 'message' => 'Sprint Point updated successfully'], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateSubTask(Request $request)
    {
        $formData = array(
            $request->col_name => $request->col_val,
        );
        SubTask::find($request->id)->update($formData);
        SubTaskTimeLine::create([
            'description' => $request->description,
            'sub_task_id' => $request->id,
            'created_by' => Auth::id()
        ]);
        return response()->json(['success' => true, 'message' => 'SubTask updated successfully'], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function storeCommentSubTask(Request $request)
    {
        $this->validate($request, [
            'sub_task_id' => 'required|integer',
            'task_comment_subtask' => 'string'
        ]);
        $description = 'commented <b>' . $request->task_comment_subtask . '</b>';
        $commentId = SubTaskTimeLine::create([
            'description' => $description,
            'sub_task_id' => $request->sub_task_id,
            'created_by' => Auth::id()
        ]);
        if ($request->hasfile('subtask_comment_attachments')) {
            foreach ($request->file('subtask_comment_attachments') as $image) {
                $imageName = date('YmdHis') . "." . $image->getClientOriginalExtension();
                Storage::put('uploads/subtasks/comment/' . $imageName, file_get_contents($image));
                $data = array(
                    'image' => $imageName,
                    'comment_id' => $commentId->id
                );
                CommentAttachmentSubtask::create($data);
            }
        }
        return response()->json(['success' => true, 'message' => 'Comment added successfully'], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateAssigneeSubTask(Request $request)
    {
        $data = SubTask::where('id', $request->sub_task_id)->first();
        if (!empty($request->user_ids)) {
            $user = Auth::user();
            if ($user->user_role == 0) {
                $employee_name = "Admin";
            } else {
                $employee_name = $user->employeeRole->name;
            }
            $taskData = [
                'body' => $data->title . ' Assign To You by ' . $employee_name,
            ];
            $user_ids = [];
            for ($i = 0; $i < count($request->user_ids); $i++) {
                // $userSchema = User::find($request->user_ids[$i]);
                // Notification::send($userSchema, new TaskNotification($taskData));
                array_push($user_ids, $request->user_ids[$i]);
            }
            $user_ids = implode(",", $user_ids);
        } else {
            $user_ids = $request->user_ids;
        }
        $formData = array(
            'user_ids' => $user_ids,
        );
        SubTask::find($request->sub_task_id)->update($formData);
        SubTaskTimeLine::create([
            'description' => 'Updated Assignee to This Task',
            'sub_task_id' => $request->sub_task_id,
            'created_by' => Auth::id()
        ]);
        return response()->json(['success' => true, 'message' => 'Updated assignee to This Task'], 200);
    }
}
