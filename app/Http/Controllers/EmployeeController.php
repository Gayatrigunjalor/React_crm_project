<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Task;
use App\Models\User;
use App\Models\Employee;
use Illuminate\Http\Request;
use Laravel\Fortify\Fortify;
use App\Rules\MatchOldPassword;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
// use App\Models\UserCompaniesPermissions;
use App\Models\EmployeeAuthenticationLog;
use App\Models\Role;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use App\Notifications\CheckerNotification;
use App\Services\ImmediateHierarchyService;
use Illuminate\Support\Facades\Notification;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use Laravel\Fortify\Actions\DisableTwoFactorAuthentication;

class EmployeeController extends Controller
{
    private $hierarchyService;

    public function __construct(ImmediateHierarchyService $hierarchyService)
    {
        $this->hierarchyService = $hierarchyService;
    }

    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function index()
    {
        $this->authorize('employee_list');
        // $employees = Employee::where('approved', '=', '1')->get(['id', 'name']);
        // $checkers = Employee::where('approved', '=', '1')->get(['user_id', 'name']);
        $rows = Employee::select('id', 'user_id', 'name', 'emp_id', 'department_id', 'is_under_id', 'role_id', 'designation_id', 'status', 'is_click_up_on')
            ->whereNot('id', 1)
            ->with(['department:id,name', 'designation:id,name', 'role:id,name', 'isUnder:id,name', 'empUser:id,email,two_factor_confirmed_at'])
            ->orderBy('emp_id', 'desc')
            ->get();
        return response()->json($rows, 200);
    }


    public function getHierarchy(Request $request)
    {
        $this->authorize('employee_list');
        $userId = $request->id;
        $employees = Employee::select('id', 'name', 'is_under_id', 'designation_id', 'role_id', 'department_id', 'email')
        ->where('is_click_up_on', 1)
        ->with([
            'designation:id,name',
            'role:id,name',
            'department:id,name',
        ])
        ->orderBy('id', 'asc')
        ->get();

        $tree = $this->buildHierarchy($employees, $userId);

        // If the user is not a root node, add the user as the root of the tree
        $rootEmployee = $employees->firstWhere('id', $userId);
        if ($rootEmployee) {
            $tree = [
                'id' => $rootEmployee->id,
                'name' => $rootEmployee->name,
                'designation' => $rootEmployee->designation->name ?? '',
                'children' => $tree
            ];
        }

        return response()->json($tree, 200);
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

public function getHierarchy_auth(Request $request)
    {
        $this->authorize('employee_list');

        // $userId = Auth::id();
        $userId = $request->user_id;

        $employees = Employee::select('id', 'name', 'is_under_id', 'designation_id', 'role_id', 'department_id', 'email')
            ->where('is_click_up_on', 1)
            ->with([
                'designation:id,name',
                'role:id,name',
                'department:id,name',
            ])
            ->orderBy('id', 'asc')
            ->get();

        // Filter employees by auth user id
        $filteredEmployees = $employees->filter(function ($employee) use ($userId) {
            return $employee->id == $userId || $employee->is_under_id == $userId;
        });

        $tree = $this->buildHierarchy_auth($employees, $userId);

        return response()->json($tree, 200);
    }

    private function buildHierarchy_auth($employees, $parentId = null)
    {
        $tree = [];
        foreach ($employees as $employee) {
            if ($employee->is_under_id == $parentId) {
                $children = $this->buildHierarchy($employees, $employee->id);
                $tree[] = [
                    'id' => $employee->id,
                    'name' => $employee->name,
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

    public function getHierarchy_ImmediateHierarchy(Request $request)
    {
        // $userId = Auth::id();
        $userId = $request->id;

        return $this->hierarchyService->getImmediateHierarchy($userId);
    }

    public function getHierarchyAceAndGoal(Request $request)
    {
        $empId = $request->id; //employee_id
        return $this->hierarchyService->getAceAndGoalHierarchy($empId);
    }

    public function getHierarchyWithKpi(Request $request)
    {
        $this->validate($request, [
            'id' => 'required|integer',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d'
        ]);
        $userId = $request->id;
        $start_date = $request->start_date ?? null;
        $end_date = $request->end_date ?? null;

        return $this->hierarchyService->getImmediateHierarchyWithKpi($userId, $start_date, $end_date);
    }

    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function employees_list()
    {
        $rows = Employee::select('id', 'name', 'emp_id', 'user_id')
            ->whereNot('id', 1)
            ->get();
        return response()->json($rows, 200);
    }

    public function isUnderEmployeeList()
    {
        if(Auth::user()->user_role == 0){
            $emps = Employee::select('id','user_id','name','is_under_id','role_id')->where('is_click_up_on', 1)->with(['role:id,name','isUnder:id,user_id,name,is_under_id'])->get()->toArray();
            return response()->json($emps, 200);
        } else {
            $emp_id = Employee::where('user_id', Auth::id())->value('id');
            $employees = [];
            $employees[0] = Employee::select('id','user_id','name','is_under_id','is_click_up_on','role_id')->where('id', $emp_id )->with(['role:id,name','isUnder:id,user_id,name,is_under_id'])->first()->toArray();
            $emp_arr = Employee::select('id','user_id','name','is_under_id','is_click_up_on','role_id')->where('is_click_up_on', 1)->where('is_under_id', $emp_id)->with(['role:id,name','isUnder:id,user_id,name,is_under_id'])->get()->toArray();
            $employees = array_merge($employees, $emp_arr);
            //level 1
            foreach($emp_arr as $emp) {
                $emps = Employee::select('id','user_id','name','is_under_id','is_click_up_on','role_id')->where('is_click_up_on', 1)->where('is_under_id', $emp['id'])->with(['role:id,name','isUnder:id,user_id,name,is_under_id'])->get()->toArray();
                if(count($emps) > 0){
                    $employees = array_merge($employees, $emps);
                }
            }
            $emp_arr2 = $employees;
            // //level 2
            foreach($emp_arr2 as $empl) {
                $e = Employee::select('id','user_id','name','is_under_id','is_click_up_on','role_id')->where('is_click_up_on', 1)->where('is_under_id', $empl['id'])->with(['role:id,name','isUnder:id,user_id,name,is_under_id'])->get()->toArray();
                if(count($e) > 0) {
                    $employees = array_merge($employees, $e);
                }
            }
            $emp_list = [];
            foreach($employees as $data){
                if(!array_key_exists($data['id'], $emp_list)) {
                    $emp_list[] = $data;
                }
            }
            $uniqueData = [];
            $existingIds = [];

            foreach ($emp_list as $item) {
                if (!in_array($item['id'], $existingIds)) {
                    $uniqueData[] = $item;
                    $existingIds[] = $item['id'];
                }
            }

            $emp_list = $uniqueData;
            return response()->json($emp_list, 200);
        }
    }

    private function getNewEmpId()
    {
        $query = Employee::orderBy('id', 'DESC')->first();
        if (!empty($query)) {
            $value2 = substr($query->emp_id, 5, 8) + 1;
            $empId = "EMP-" . sprintf('%04s', $value2);
        } else {
            $empId = "EMP-0001";
        }
        return $empId;
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $this->authorize('employee_create');
        $this->validate($request, [
            'email' => 'required|email|unique:users',
            'department_id' => 'required|integer',
            'is_under_id' => 'required|integer',
            'address' => 'required',
            'role_id' => 'required|integer',
            'designation_id' => 'required|integer',
            'official_mobile_number' => 'required'
        ]);
        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make('123456789')
        ]);
        // UserCompaniesPermissions::create([
        //     'user_id' => $user->id,
        //     'company_id' => session('company_id')
        // ]);

        if ($request->hasFile('photograph')) {
            $attachment = $request->file('photograph');
            $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/employee/photograph/' . $attachmentName, file_get_contents($attachment));
            $photograph = "$attachmentName";
        } else {
            $photograph = "";
        }

        //kpi roles multiple selected roles convert them into comma separated
        $ancillary_roles = '';
        if(count($request->ancillary_roles) > 0) {
            $roleString = [];
            foreach($request->ancillary_roles as $role) {
                $roleString[] = $role['value'];
            }
            $ancillary_roles = implode(",", $roleString);
        }

        $formId = $user->employeeDetail()->create([
            'name' => $request->name,
            'emp_id' => $this->getNewEmpId(),
            'department_id' => $request->department_id,
            'is_under_id' => $request->is_under_id,
            'address' => $request->address,
            'role_id' => $request->role_id,
            'designation_id' => $request->designation_id,
            'official_mobile_number' => $request->official_mobile_number,
            'photograph' => $photograph,
            'status' => $request->status,
            'leadership_kpi_id' => $request->leadership_kpi_id,
            'ancillary_roles' => $ancillary_roles,
            'date_of_birth' => null,
            'city' => null,
            'pin_code' => null,
            'mobile_number' => null,
            'emergency_mobile_number' => null,
            'email' => null,
            'gender' => null,
            'blood_group' => null,
            'salary' => null,
            'security_deposit' => null,
            'joining_date' => null,
            'anniversary_date' => null,
            'file_no' => null,
            'biometric_no' => null,
            'created_by' => Auth::id(),
            'approved' => (Auth::user()->user_role == 0) ? true : false
        ]);
        $user->rolePermissions()->create([]);
        // $user->checkers()->create([]);
        if (Auth::user()->user_role != 0) {
            // $checker = User::find(Auth::id());
            // $checkerData = [
            //     'subject' => 'New Employee Created',
            //     'body' => 'New Employee Is Created by ' . $checker->employeeDetail->name . ' Please Check It',
            //     'url' => '/employeeChecker',
            //     'form_id' => $formId->id
            // ];
            // if ($checker->checkers->employee_c1 != null) {
            //     $userSchema = User::find($checker->checkers->employee_c1);
            //     Employee::find($formId->id)->update(array('checker_id' => 1));
            //     Notification::send($userSchema, new CheckerNotification($checkerData));
            // } elseif ($checker->checkers->employee_admin_approve == 1) {
            //     $userSchema = User::find(1);
            //     Employee::find($formId->id)->update(array('checker_id' => 0));
            //     Notification::send($userSchema, new CheckerNotification($checkerData));
            // } else {
            //     Employee::find($formId->id)->update(array('approved' => true));
            // }
        }
        return response()->json(['success' => true, 'message' => 'Employee created successfully'], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $this->authorize('employee_edit');
        $row = Employee::with(['designation:id,name', 'role:id,name', 'isUnder:id,name', 'empUser:id,email', 'leadershipKpi:id,name'])->find($id);
        $isUnderKpiRoles = Employee::where('is_under_id', $row->id)->where('is_click_up_on', 1)->pluck('role_id');
        $kpiRoleNames = [];
        if($isUnderKpiRoles->count()){
            foreach($isUnderKpiRoles as $role_id)
            {
                $kpiRoleNames[] = Role::where('id', $role_id)->value('name');
            }
        }
        $row['isUnderKpiRoles'] = array_values(array_unique($kpiRoleNames));
        return response()->json($row);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $this->authorize('employee_edit');
        $this->validate($request, [
            'department_id' => 'required|integer',
            'is_under_id' => 'required|integer',
            'address' => 'required',
            'role_id' => 'required|integer',
            'designation_id' => 'required|integer',
            'official_mobile_number' => 'required'
        ]);
        $formArray = $request->all();

        //kpi roles multiple selected roles convert them into comma separated
        $ancillary_roles = '';
        if(count($request->ancillary_roles) > 0) {
            $roleString = [];
            foreach($request->ancillary_roles as $role) {
                $roleString[] = $role['value'];
            }
            $ancillary_roles = implode(",", $roleString);
        }
        $formArray['ancillary_roles'] = $ancillary_roles;
        if(Employee::find($id)->update($formArray)) {
            return response()->json(['success' => true, 'message' => 'Employee updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function editEmployeePassword(Request $request)
    {
        $id = $request->id;
        return response()->json($id);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateEmployeePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'new_password' => ['required', Password::min(8)->letters()->mixedCase()->numbers()->symbols()],
            'confirm_password' => ['required', 'same:new_password'],
        ]);

        if ($validator->passes()) {
            User::find($request->id)->update(['password' => Hash::make($request->new_password)]);
            return response()->json(['success' => true, 'message' => 'Password changed successfully'], 200);
        }

        return response()->json($validator->errors(),422);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function editTaskIsUnder(Request $request)
    {
        $response['users'] = Employee::where('id', '!=', $request->id)->get();
        $response['row'] = Employee::find($request->id);
        return response()->json($response);
    }

    public function updateTaskIsUnder(Request $request)
    {
        if (!empty($request->is_under_user_ids)) {
            $userIds = [];
            for ($i = 0; $i < count($request->is_under_user_ids); $i++) {
                array_push($userIds, $request->is_under_user_ids[$i]);
            }
            $userIds = implode(",", $userIds);
        } else {
            $userIds = $request->is_under_user_ids;
        }
        if (Employee::find($request->id)->update([
            'is_under_user_ids' => $userIds
        ])) {
            return response()->json(['status' => 200]);
        }
    }

    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function activityLogs()
    {
        $activityLogs = EmployeeAuthenticationLog::with(['employeeDetails' => function ($query) {
            $query->select('id', 'name', 'user_id');
        }])->orderBy('id', 'desc')->get();
        return response()->json($activityLogs, 200);
    }

    /**
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function changeIsClickUpOn(Request $request)
    {
        $user = Employee::find($request->id);
        $user->is_click_up_on = $request->is_click_up_on;
        $user->save();
        $status = $request->is_click_up_on ? 'enabled' : 'disabled';
        return response()->json(['success' => true, 'message' => "Employee $status successfully!" ], 200);
    }

    public function showEmpMFA($id)
    {
        $employeeRow = User::with('employeeDetail:id,user_id,name,emp_id')->find($id);
        $employeeRow['twoFAQrImg'] = $employeeRow->two_factor_secret ? $employeeRow->twoFactorQrCodeSvg() : '';
        $employeeRow['recovery_codes'] = $employeeRow->two_factor_recovery_codes ? json_decode(decrypt($employeeRow->two_factor_recovery_codes)) : [];
        // dd(json_decode(decrypt($employeeRow->two_factor_recovery_codes)));
        return response()->json($employeeRow, 200);
    }

    /**
     * Enable two factor authentication for the user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Laravel\Fortify\Actions\EnableTwoFactorAuthentication  $enable
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function enableEmpMFA(Request $request, EnableTwoFactorAuthentication $enable)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => ['required', new MatchOldPassword],
        ]);

        if ($validator->passes()) {
            $enable(User::find($request->id));
            User::find($request->id)->forceFill([
                'two_factor_confirmed_at' => now(),
            ])->save();
            return response()->json(['success' => true, 'message' => 'Multi-factor authentication enabled successful!' ], 200);
        }

        return response()->json($validator->errors(), 422);
    }

    /**
     * @param \Illuminate\Http\Request $request
     * @param \Laravel\Fortify\Actions\DisableTwoFactorAuthentication $disable
     */
    public function disableEmployeeMfa(Request $request, DisableTwoFactorAuthentication $disable)
    {
        $disable(User::find($request->id));
        return $request->wantsJson()
            ? new JsonResponse(['success' => true, 'message' => 'Multi-factor authentication disabled successful!' ], 200)
            : back()->with('status', Fortify::TWO_FACTOR_AUTHENTICATION_DISABLED);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteEmployeeTasks(Request $request)
    {
        $this->authorize('employee_create');
        $user_id = $request->user_id;
        if($request->delete_emp_tasks == 0)
        {
            $this->validate($request, [
                'month_from' => 'required|date_format:Y-m',
                'month_to' => 'required|date_format:Y-m',
            ]);

            $month_start = $request->month_from;
            $month_end = $request->month_to;
            $start_date = Carbon::createFromFormat('Y-m', $month_start)->startOfMonth()->toDateTimeString();
            $end_date = Carbon::createFromFormat('Y-m', $month_end)->endOfMonth()->toDateTimeString();

            $task = Task::whereBetween('created_at', [$start_date, $end_date])->where('created_by', $user_id)->delete();


        } else {
            $start_date = '';
            $end_date = '';

            $task = Task::where('created_by', $user_id)->delete();
        }

        return response()->json(['success' => true,
            'start_dt' => $start_date,
            'end_dt' => $end_date,
            'message' => 'Task deleted successfully. Deleted task count - '.$task.''
        ],200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchEmployeeCounts()
    {
        $active = 0;
        $inactive = 0;
        $employees = Employee::all();
        $active = $employees->where('is_click_up_on', '1')->count();
        $inactive = $employees->where('is_click_up_on', '0')->count();
        return response()->json([
            'total' => $employees->count(),
            'active' => $active,
            'inactive' => $inactive,
        ], 200);
    }
}
