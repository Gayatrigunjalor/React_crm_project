<?php

namespace App\Http\Controllers;

use App\Http\Requests\DesignationRequest;
use App\Models\Designation;
use App\Models\Employee;

class DesignationController extends Controller
{
    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $this->authorize('designation_list');
        $rows = Designation::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function designationListing()
    {
        $rows = Designation::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @param \App\Http\Requests\DesignationRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(DesignationRequest $request)
    {
        $this->authorize('designation_create');
        if (Designation::create(['name' => $request->name])) {
            return response()->json(['success' => true, 'message' => 'Designation saved successfully'], 200);
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
        $this->authorize('designation_edit');
        $designation = Designation::select('id', 'name')->find($id);
        if($designation) {
            return response()->json($designation);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find designation'], 422);
        }
    }

    /**
     * @param \App\Http\Requests\DesignationRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(DesignationRequest $request, $id)
    {
        $this->authorize('designation_edit');
        if (Designation::find($id)->update(['name' => $request->name])) {
            return response()->json(['success' => true, 'message' => 'Designation updated successfully'], 200);
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
        $this->authorize('designation_delete');

        $employeeCount = Employee::where('designation_id', $id)->count();
        if( $employeeCount > 0) {
            if($employeeCount > 0) {
                $message = 'Designation cannot be removed as it is used in Employee\'s record.';
            }

            return response()->json(['success' => false, 'message' => $message], 422);
        } else {
            if (Designation::find($id)->delete()) {
                return response()->json(['success' => true, 'message' => 'Designation deleted successfully'], 200);
            } else {
                return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
            }
        }
    }
}
