<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Stage;
use App\Models\Task;
use Carbon\Carbon;

class ImmediateHierarchyService
{
    public function getImmediateHierarchy($id)
    {
        $userId = $id;

        $employees = Employee::select('id', 'user_id','name', 'is_under_id', 'designation_id', 'role_id', 'department_id', 'email', 'leadership_kpi_id', 'ancillary_roles')
            ->where('is_click_up_on', 1)
            ->with([
                'designation:id,name',
                'role:id,name',
                'department:id,name',
                'aceAndGoalPreference:id,user_id,role_id,isHidden,isBypass'
            ])
            ->orderBy('id', 'asc')
            ->get();

        // Filter employees to only include the auth user and their immediate subordinates
        $filteredEmployees = $employees->filter(function ($employee) use ($userId) {
            return $employee->id == $userId || $employee->is_under_id == $userId;
        });

        $tree = $this->buildImmediateHierarchy($filteredEmployees, $userId);

        return response()->json($tree, 200);
    }

    public function getImmediateHierarchyWithKpi($id, $start_date, $end_date)
    {
        $userId = $id;

        $employees = Employee::select('id', 'user_id','name', 'is_under_id', 'designation_id', 'role_id', 'department_id', 'email', 'leadership_kpi_id')
            ->where('is_click_up_on', 1)
            ->with([
                'designation:id,name',
                'role:id,name',
                'department:id,name',
                'aceAndGoalPreference:id,user_id,role_id,isHidden,isBypass'
            ])
            ->orderBy('id', 'asc')
            ->get();

        // Filter employees to only include the auth user and their immediate subordinates
        $filteredEmployees = $employees->filter(function ($employee) use ($userId) {
            return $employee->id == $userId || $employee->is_under_id == $userId;
        });

        $tree = $this->buildImmediateHierarchyWithKpi($filteredEmployees, $userId, $start_date, $end_date);

        return response()->json($tree, 200);
    }

    public function buildImmediateHierarchy($employees, $parentId = null)
    {
        $tree = [];
        foreach ($employees as $employee) {
            if ($employee->id == $parentId) {
                $children = $employees->filter(function ($child) use ($employee) {
                    return $child->is_under_id == $employee->id;
                })->map(function ($child) {

                    $kpiRoleArray = [];
                    $kpiRoleArray[] = $child->role_id;
                    if(!empty($child->ancillary_roles)){
                        $temp = explode(",", $child->ancillary_roles);
                        $kpiRoleArray = array_merge($kpiRoleArray, $temp);
                    }
                    return [
                        'id' => $child->id,
                        'user_id'=> $child->user_id,
                        'name' => $child->name,
                        'designation' => $child->designation->name ?? '',
                        'role_id'=> $child->role_id,
                        'role' => $child->role->name ?? '',
                        'leadership_kpi_id' => $child->leadership_kpi_id ?? null,
                        'ancillary_roles' => $kpiRoleArray,
                        'department' => $child->department->name ?? '',
                        'email' => $child->email ?? '',
                        'aceAndGoalPreference' => $child->aceAndGoalPreference ?? null
                    ];
                })->values()->toArray();

                $tree = [
                    'id' => $employee->id,
                    'user_id'=> $employee->user_id,
                    'name' => $employee->name,
                    'designation' => $employee->designation->name ?? '',
                    'role_id'=> $employee->role_id,
                    'role' => $employee->role->name ?? '',
                    'leadership_kpi_id' => $employee->leadership_kpi_id ?? null,
                    'ancillary_roles' => $employee->ancillary_roles ?? '',
                    'department' => $employee->department->name ?? '',
                    'email' => $employee->email ?? '',
                    'aceAndGoalPreference' => $employee->aceAndGoalPreference ?? null,
                    'children' => $children,
                ];
            }
        }

        return $tree;
    }

    private function buildImmediateHierarchyWithKpi($employees, $parentId = null, $start_date = null, $end_date = null)
    {
        $tree = [];
        foreach ($employees as $employee) {
            if ($employee->id == $parentId) {
                $children = $employees->filter(function ($child) use ($employee) {
                    return $child->is_under_id == $employee->id;
                })->map(function ($child) {
                    return [
                        'id' => $child->id,
                        'user_id'=> $child->user_id,
                        'name' => $child->name,
                        'designation' => $child->designation->name ?? '',
                        'role_id'=> $child->role_id,
                        'role' => $child->role->name ?? '',
                        'leadership_kpi_id' => $child->leadership_kpi_id ?? null,
                        'department' => $child->department->name ?? '',
                        'email' => $child->email ?? '',
                    ];
                })->values()->toArray();

                $tree = [
                    'id' => $employee->id,
                    'user_id'=> $employee->user_id,
                    'name' => $employee->name,
                    'designation' => $employee->designation->name ?? '',
                    'role_id'=> $employee->role_id,
                    'role' => $employee->role->name ?? '',
                    'leadership_kpi_id' => $employee->leadership_kpi_id ?? null,
                    'department' => $employee->department->name ?? '',
                    'email' => $employee->email ?? '',
                    'children' => $children,
                    'kpis' => $this->getKpis($employee->user_id, $start_date, $end_date)
                ];
            }
        }

        return $tree;
    }

    protected function getKpis($userId, $start_dt, $end_dt)
    {
        if (empty($start_dt) && empty($end_dt)) {
            $endDate = Carbon::now()->endOfDay(); // current date and time, end of day
            $startDate = $endDate->copy()->subMonth()->startOfDay(); // one month before, start of day
        } else {
            $startDate = Carbon::parse($start_dt)->startOfDay();
            $endDate = Carbon::parse($end_dt)->endOfDay();
        }

        // Collect month names between startDate and endDate
        $kpiMonths = [];
        $current = $startDate->copy()->startOfMonth();

        while ($current->lte($endDate)) {
            $kpiMonths[] = ['kpi_month' => $current->format('F'), 'kpi_year' => $current->format('Y')];
            $current->addMonth();
        }

        $tasks = Task::where('task_type', 'kpi')->where('created_by', $userId)->where(function($query) use($startDate,$endDate,$kpiMonths){
            $query->whereBetween('created_at',[$startDate,$endDate])->orWhere(function($qry) use($kpiMonths){
                foreach($kpiMonths as $kpiMonth){
                    $qry->orWhere('kpi_month', $kpiMonth['kpi_month'])
                    ->where('kpi_year', $kpiMonth['kpi_year']);
                }
            });
        })->with('kpi:id,kpi_name')->orderBy('id', 'ASC')->get();

        return $tasks;
    }


    public function getHierarchy($empId)
    {
        $employees = Employee::select('id', 'name', 'is_under_id', 'designation_id', 'role_id', 'department_id', 'email')
        ->where('is_click_up_on', 1)
        ->with([
            'designation:id,name',
            'role:id,name',
            'department:id,name',
        ])
        ->orderBy('id', 'asc')
        ->get();

        $tree = $this->buildHierarchy($employees, $empId);

        // If the user is not a root node, add the user as the root of the tree
        $rootEmployee = $employees->firstWhere('id', $empId);
        if ($rootEmployee) {
            $tree = [
                'id' => $rootEmployee->id,
                'name' => $rootEmployee->name,
                'designation' => $rootEmployee->designation->name ?? '',
                'children' => $tree
            ];
        }

        return $tree;
    }

    private function buildHierarchy($employees, $parentId = null)
    {
        $tree = [];
        foreach ($employees as $employee) {
            if ($employee->is_under_id == $parentId) {
                $children = $this->buildHierarchy($employees, $employee->id);
                $tree[] = [
                    'id' => $employee->id,
                    'name' => $employee->name,
                    'designation' => $employee->designation->name ?? '',
                    'indicating_name' => $employee->isUnder->name ?? '',
                    'designation' => $employee->designation->name ?? '',
                    'role' => $employee->role->name ?? '',
                    'department' => $employee->department->name ?? '',
                    'email' => $employee->email ?? '',
                    'children' => $children
                ];
            }
        }
        return $tree;
    }

    public function getStages()
    {
        $stages = Stage::select('id','stage_name')->get();

        return $stages;
    }

    public function getAceAndGoalHierarchy($empId)
    {
        $employees = Employee::select('id', 'user_id','name', 'is_under_id', 'designation_id', 'role_id', 'department_id', 'email', 'leadership_kpi_id', 'ancillary_roles')
            ->where(function($query) use($empId) {
                $query->where('id', $empId)
                    ->orWhere('is_under_id', $empId);
            })
            ->where('is_click_up_on', 1)
            ->with([
                'designation:id,name',
                'role:id,name',
                'department:id,name',
                'aceAndGoalPreference:id,user_id,role_id,isHidden,isBypass'
            ])
            ->withCount('aceAndGoalPreference')
            ->orderBy('id', 'asc')
            ->get();

        $tree = $this->buildAceAndGoalHierarchy($employees, $empId);

        return response()->json($tree, 200);
    }

    private function buildAceAndGoalHierarchy($employees, $parentId = null) {
        $children = [];
        $allEmployees = null;
        foreach($employees as $employee) {
            $getPreference = [];
            $nextIsUnderUsers = null;
            if($employee->id != $parentId) {

                //check each employee preference
                if($employee->ace_and_goal_preference_count) {
                    $getPreference = $this->fetchPreferences($employee->aceAndGoalPreference, $employee->id);
                }

                if(count($getPreference)) {
                    $nextIsUnderUsers = $this->fetchNextIsUnderUsers($getPreference);
                }

                $children[] = $employee;
                if($nextIsUnderUsers != null) {
                    foreach($nextIsUnderUsers as $nextUsers) {
                        foreach($nextUsers as $child) {
                            $children[] = $child;
                        }
                    }
                }
            } else {
                $allEmployees[] = $employee;
            }
        }

        $allEmployees['children'] = $children;

        return $allEmployees;
    }

    protected function fetchNextIsUnderUsers($data) {
        $nextUsers = [];

        foreach($data as $emp) {
            $employees = Employee::select('id', 'user_id','name', 'is_under_id', 'designation_id', 'role_id', 'department_id', 'email', 'leadership_kpi_id', 'ancillary_roles')
                            ->where('is_under_id', $emp['emp_id'])
                            ->where('is_click_up_on', 1)
                            ->where('role_id', $emp['role_id'])
                            ->with([
                                'designation:id,name',
                                'role:id,name',
                                'department:id,name',
                                'aceAndGoalPreference:id,user_id,role_id,isHidden,isBypass'
                            ])
                            ->withCount('aceAndGoalPreference')
                            ->orderBy('id', 'asc')
                            ->get();
            if($employees->count()) {
                $nextUsers[] = $employees;
            }
        }

        return (count($nextUsers) > 0) ? $nextUsers : null;
    }

    protected function fetchPreferences($preferences, $empId) {
        $fetch = [];
        foreach($preferences as $pref) {
            if(($pref->isBypass == 1) || ($pref->isHidden == 1)) {
                $fetch[] = [
                    'emp_id' => $empId,
                    'user_id' => $pref->user_id,
                    'role_id' => $pref->role_id,
                ];
            }
        }

        return $fetch;
    }
}
