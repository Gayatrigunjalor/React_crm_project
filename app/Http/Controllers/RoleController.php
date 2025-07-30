<?php

namespace App\Http\Controllers;

use App\Http\Requests\RoleRequest;
use App\Models\Role;
use App\Models\Employee;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $this->authorize('role_list');
        $rows = Role::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function roleListing()
    {
        $rows = Role::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @param \App\Http\Requests\RoleRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(RoleRequest $request)
    {
        $this->authorize('role_create');
        if (Role::create(['name' => $request->name])) {
            return response()->json(['success' => true, 'message' => 'Role saved successfully'], 200);
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
        $this->authorize('role_edit');
        $role = Role::select('id', 'name')->find($id);
        if($role) {
            return response()->json($role);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find role'], 422);
        }
    }

    /**
     * @param \App\Http\Requests\RoleRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(RoleRequest $request, $id)
    {
        $this->authorize('role_edit');
        if (Role::find($id)->update(['name' => $request->name])) {
            return response()->json(['success' => true, 'message' => 'Role updated successfully'], 200);
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
        $this->authorize('role_delete');

        $employeeCount = Employee::where('role_id', $id)->count();
        if( $employeeCount > 0) {
            if($employeeCount > 0) {
                $message = 'Role cannot be removed as it is used in Employee\'s record.';
            }
            return response()->json(['success' => false, 'message' => $message], 422);
        } else {
            if (Role::find($id)->delete()) {
                return response()->json(['success' => true, 'message' => 'Role deleted successfully'], 200);
            } else {
                return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
            }
        }
    }
}
