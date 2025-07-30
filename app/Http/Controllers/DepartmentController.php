<?php

namespace App\Http\Controllers;

use App\Http\Requests\DepartmentRequest;
use App\Models\Department;
use App\Models\Employee;

class DepartmentController extends Controller
{
    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $this->authorize('department_list');
        $rows = Department::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function departmentListing()
    {
        $rows = Department::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @param \App\Http\Requests\DepartmentRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(DepartmentRequest $request)
    {
        $this->authorize('department_create');
        if (Department::create(['name' => $request->name])) {
            return response()->json(['success' => true, 'message' => 'Department saved successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $this->authorize('department_edit');
        $department = Department::select('id', 'name')->find($id);
        if($department) {
            return response()->json($department);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find department'], 422);
        }
    }

    /**
     * @param \App\Http\Requests\DepartmentRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(DepartmentRequest $request, $id)
    {
        $this->authorize('department_edit');
        if (Department::find($id)->update(['name' => $request->name])) {
            return response()->json(['success' => true, 'message' => 'Department updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse|void
     */
    public function destroy($id)
    {
        $this->authorize('department_delete');

        $employeeCount = Employee::where('department_id', $id)->count();
        if( $employeeCount > 0) {
            if($employeeCount > 0) {
                $message = 'Department cannot be removed as it is used in Employee\'s record.';
            }

            return response()->json(['success' => false, 'message' => $message], 422);
        } else {
            if (Department::find($id)->delete()) {
                return response()->json(['success' => true, 'message' => 'Department deleted successfully'], 200);
            } else {
                return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
            }
        }
    }
}
