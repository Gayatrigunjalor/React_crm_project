<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SubTaskTimeLine;
use App\Models\SubTaskCheckList;
use Illuminate\Support\Facades\Auth;

class SubTaskCheckListController extends Controller
{
    /**
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addSubTaskCheckList(Request $request){
        $this->validate($request, [
            'checklist' => 'required|string',
            'sub_task_id' => 'required|integer'
        ]);
        SubTaskCheckList::create([
            'checklist'=> $request->checklist,
            'sub_task_id'=> $request->sub_task_id,
            'created_by' => Auth::id()
        ]);
        $description = 'added item '.$request->checklist.' check list to checklist';
        SubTaskTimeLine::create([
            'description' => $description,
            'sub_task_id'=> $request->sub_task_id,
            'created_by' => Auth::id()
        ]);
		return response()->json(['success' => true, 'message' => 'Sub checklist added successfully'], 200);
    }

    /**
     * @return void
     */
	public function fetchSubTaskTodoList(Request $request) {
        $this->validate($request, [
            'sub_task_id' => 'required|integer'
        ]);
		$rows = SubTaskCheckList::where('sub_task_id', $request->sub_task_id)->where('status', 0)->orderBy('id', 'desc')->get();
		if ($rows->count() > 0) {
            return response()->json($rows, 200);
        } else {
            return response()->json([], 200);
        }
	}

    /**
     * @return void
     */
	public function fetchSubTaskCompleteList(Request $request) {
        $this->validate($request, [
            'sub_task_id' => 'required|integer'
        ]);
		$rows = SubTaskCheckList::where('sub_task_id', $request->sub_task_id)->where('status', 1)->orderBy('id', 'desc')->get();
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
    public function editSubTaskCheckList(Request $request) {
        $this->validate($request, [
            'id' => 'required|integer'
        ]);
        $row = SubTaskCheckList::find($request->id);
		return response()->json($row, 200);
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateSubTaskCheckList(Request $request) {
        $this->validate($request, [
            'subcheck_list_id' => 'required|integer',
            'checklist' => 'required|string',
        ]);
        $formData = array(
            'checklist'=> $request->checklist,
        );
		SubTaskCheckList::find($request->subcheck_list_id)->update($formData);
		return response()->json(['success' => true, 'message' => 'Sub CheckList updated successfully'], 200);
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function markSubTaskCompleted(Request $request) {
        $formData = array(
            'status'=> 1,
        );
		SubTaskCheckList::find($request->id)->update($formData);
        $checkList = SubTaskCheckList::find($request->id);
        $description = 'checked '.$checkList->checklist.' in Checklist';
        SubTaskTimeLine::create([
            'description' => $description,
            'sub_task_id'=> $checkList->sub_task_id,
            'created_by' => Auth::id()
        ]);
		return response()->json(['success' => true, 'message' => 'Sub CheckList marked as completed'], 200);
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function markSubTaskTodo(Request $request) {
        $formData = array(
            'status'=> 0,
        );
		SubTaskCheckList::find($request->id)->update($formData);
        $checkList = SubTaskCheckList::find($request->id);
        $description = 'unchecked '.$checkList->checklist.' in Checklist';
        SubTaskTimeLine::create([
            'description' => $description,
            'sub_task_id'=> $checkList->sub_task_id,
            'created_by' => Auth::id()
        ]);
		return response()->json(['success' => true, 'message' => 'Sub CheckList reinstate to TO DO'], 200);
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteSubTaskCheckList(Request $request) {
        $this->validate($request, [
            'id' => 'required|integer'
        ]);
        SubTaskCheckList::find($request->id)->delete();
        return response()->json(['success' => true, 'message' => 'CheckList deleted succesfully'], 200);
	}
}
