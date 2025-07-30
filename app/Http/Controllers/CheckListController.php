<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\CheckList;
use App\Models\TaskTimeLine;

class CheckListController extends Controller
{
    /**
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addCheckList(Request $request)
    {
        $this->validate($request, [
            'checklist' => 'required|string',
            'task_id' => 'required|integer'
        ]);
        CheckList::create([
            'checklist' => $request->checklist,
            'task_id' => $request->task_id,
            'created_by' => Auth::id()
        ]);
        $description = 'added item ' . $request->checklist . ' check list to checklist';
        if (TaskTimeLine::create([
            'description' => $description,
            'task_id' => $request->task_id,
            'created_by' => Auth::id()
        ])) {
            return response()->json(['success' => true, 'message' => 'CheckList added successfully'], 200);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @param \App\Services\CheckListService $checkListService
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory|string
     */
    public function fetchTodoList(Request $request)
    {
        $this->validate($request, [
            'task_id' => 'required|integer'
        ]);
        $rows = CheckList::where('task_id', $request->task_id)->where('status', 0)->orderBy('id', 'desc')->get();
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
    public function fetchCompleteList(Request $request)
    {
        $this->validate($request, [
            'task_id' => 'required|integer'
        ]);
        $rows = CheckList::where('task_id', $request->task_id)->where('status', 1)->orderBy('id', 'desc')->get();
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
    public function editTaskCheckList(Request $request)
    {
        $this->validate($request, [
            'id' => 'required|integer'
        ]);
        $list = CheckList::find($request->id);
        return response()->json($list, 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateCheckList(Request $request)
    {
        $this->validate($request, [
            'check_list_id' => 'required|integer',
            'checklist' => 'required|string',
        ]);
        if (CheckList::find($request->check_list_id)->update([
            'checklist' => $request->checklist
        ])) {
            return response()->json(['success' => true, 'message' => 'CheckList updated successfully'], 200);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function markCompleted(Request $request)
    {
        $this->validate($request, [
            'id' => 'required|integer'
        ]);
        CheckList::find($request->id)->update(['status' => 1]);
        $checkList = CheckList::find($request->id);
        $description = 'checked ' . $checkList->checklist . ' in Checklist';
        if (TaskTimeLine::create([
            'description' => $description,
            'task_id' => $checkList->task_id,
            'created_by' => Auth::id()
        ])) {
            return response()->json(['success' => true, 'message' => 'CheckList marked as completed'], 200);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function markTodo(Request $request)
    {
        $this->validate($request, [
            'id' => 'required|integer'
        ]);
        CheckList::find($request->id)->update(['status' => 0]);
        $checkList = CheckList::find($request->id);
        $description = 'unchecked ' . $checkList->checklist . ' in Checklist';
        if (TaskTimeLine::create([
            'description' => $description,
            'task_id' => $checkList->task_id,
            'created_by' => Auth::id()
        ])) {
            return response()->json(['success' => true, 'message' => 'CheckList reinstate to TO DO'], 200);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteCheckList(Request $request)
    {
        $this->validate($request, [
            'id' => 'required|integer'
        ]);
        if (CheckList::find($request->id)->delete()) {
            return response()->json(['success' => true, 'message' => 'CheckList deleted succesfully'], 200);
        }
    }
}
