<?php

namespace App\Http\Controllers;

use App\Models\AceAndGoalPreferences;
use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\Role;
use App\Services\ImmediateHierarchyService;
use Illuminate\Support\Facades\Log;

class AceAndGoalController extends Controller
{
    public function index(Request $request)
    {
        if(empty($request->role_id)) {
            return response()->json(['success' => false, 'message' => 'Please mention role']);
        }
        $role_id = $request->role_id;

        $employees = Employee::select('id', 'user_id', 'name', 'emp_id', 'department_id', 'is_under_id', 'role_id', 'leadership_kpi_id', 'ancillary_roles')->with(['isUnder:id,user_id,name', 'role:id,name', 'leadershipKpi:id,name','aceAndGoalPreference'])
        ->where(function($query) use($role_id){
            $query->where('role_id', $role_id)
                ->orWhereRaw("find_in_set('" . $role_id . "',ancillary_roles)");
        })
        ->where('is_click_up_on', 1)
        ->where('is_under_id', 1)
        ->get();

        $data = [];

        foreach($employees as $emp) {
            $emp['ancillary_roles_names'] = [];
            if(!empty($emp->ancillary_roles)) {
                $emp['ancillary_roles_names'] = Role::select('id','name')->whereIn('id', explode(",", $emp->ancillary_roles))->get();
            }

            //get isUnder employees list
            $isUnderEmployees = Employee::select('id','name','is_under_id','role_id','ancillary_roles')->where('is_click_up_on', 1)
            // ->where(function($query) use($emp) {
            //     $query->where('is_under_id', $emp->id)
            //     ->orWhere('id', $emp->id);
            // })
            ->where('is_under_id', $emp->id)
            ->get();

            $isUnderRoles = [];
            foreach($isUnderEmployees as $isUnder) {
                $isUnderRoles[] = $isUnder->role;
            }
            $emp['isUnderKpiRoles'] = $isUnderRoles;

            $service = new ImmediateHierarchyService;
            $hierarchyData = $service->getHierarchy($emp->id);
            $emp['position'] = 'L-' . $this->getMaxDepth($hierarchyData);
            $data[] = $emp;
        }
        return response()->json($data, 200);
    }

    protected function getMaxDepth(array &$node): int
    {
        // If no children, level is 0
        if (empty($node['children'])) {
            $node['level'] = 0;
            return 0;
        }

        // Compute levels of children recursively
        $childLevels = [];
        foreach ($node['children'] as &$child) {
            $childLevels[] = $this->getMaxDepth($child);
        }

        // Current node level is max child level + 1
        $level = max($childLevels) + 1;
        $node['level'] = $level;

        return $level;
    }

    public function aceAndGoalAllIsUnderUsers(Request $request) {
        $this->validate($request, [
            'id' => 'required|integer',
        ]);

        $employee = Employee::select('id', 'user_id', 'name', 'is_under_id')->with('isUnder:id,user_id,name')->find($request->id);

        $isUnderEmployees = Employee::select('id', 'user_id', 'name', 'role_id', 'is_under_id', 'ancillary_roles')->where('is_under_id', $request->id)->where('is_click_up_on', 1)->with(['isUnder:id,user_id,name','role:id,name','aceAndGoalPreference:id,user_id,role_id,isHidden,isBypass'])->withCount('subordinates')->get();

        $data = [];
        foreach($isUnderEmployees as $emp) {
            $emp['ancillary_roles_names'] = [];
            if(!empty($emp->ancillary_roles)) {
                $emp['ancillary_roles_names'] = Role::select('id','name')->whereIn('id', explode(",", $emp->ancillary_roles))->get();
            }
            $data[] = $emp;
        }
        return response()->json(['employee' => $employee, 'isUnderEmployees' => $data], 200);
    }

    public function aceAndGoalIsUnderUsersByRole(Request $request) {
        $this->validate($request, [
            'id' => 'required|integer',
            'role_id' => 'required|integer',
        ]);

        $employee = Employee::select('id', 'user_id', 'name', 'is_under_id')->with('isUnder:id,user_id,name')->find($request->id);

        $isUnderEmployees = Employee::select('id','user_id','name','role_id', 'is_under_id', 'ancillary_roles')->where('role_id', $request->role_id)->where('is_under_id', $request->id)->where('is_click_up_on', 1)->with(['isUnder:id,user_id,name','role:id,name','aceAndGoalPreference:id,user_id,role_id,isHidden,isBypass'])->withCount('subordinates')->get();

        $data = [];
        foreach($isUnderEmployees as $emp) {
            $emp['ancillary_roles_names'] = [];
            if(!empty($emp->ancillary_roles)) {
                $emp['ancillary_roles_names'] = Role::select('id','name')->whereIn('id', explode(",", $emp->ancillary_roles))->get();
            }
            $data[] = $emp;
        }
        return response()->json(['employee' => $employee, 'isUnderEmployees' => $data], 200);
    }

    public function toggleAceAndGoalPreferences(Request $request) {
        $this->validate($request, [
            'user_id' => 'required|integer',
            'role_id' => 'required|integer',
            'hide' => 'required_without:bypass|integer',
            'bypass' => 'required_without:hide|integer',
        ]);

        try {
            if($request->has('hide')) {
                $preference = ['isHidden' => $request->hide];
            } else {
                $preference = ['isBypass' => $request->bypass];
            }
            AceAndGoalPreferences::updateOrCreate(
                ['user_id' => $request->user_id, 'role_id' => $request->role_id],
                $preference
            );

            return response()->json(['success' => true, 'message' => 'Preference saved successfully']);

        } catch (\Throwable $th) {
            Log::error("Unable to save ace & goal preference". json_encode($th->getMessage));
            return response()->json(['success' => true, 'message' => 'Something went wrong']);
        }
    }
}
