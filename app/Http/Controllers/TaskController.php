<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Kpi;
use App\Models\Task;
use App\Models\User;
use App\Models\Stage;
use App\Models\Employee;
use App\Models\CheckList;
use App\Models\TargetReport;
use App\Models\TaskTimeLine;
use Illuminate\Http\Request;
use App\Services\FilterService;
use App\Models\CommentAttachment;
use App\Models\SubTask;
use App\Http\Requests\TaskRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Notifications\TaskNotification;
use App\Services\ColleagueFilterService;
use App\Services\ImmediateHierarchyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Notification;

class TaskController extends Controller
{
    private $hierarchyService;

    public function __construct(ImmediateHierarchyService $hierarchyService)
    {
        $this->hierarchyService = $hierarchyService;
    }

    /**
     * @param mixed $id
     * @return \Illuminate\Contracts\View\View
     */
    public function getEmployeeTasks($id, $isAdmin)
    {
        $stages = Stage::orderBy('stage_order')->get();
        $lastStage = Stage::orderBy('stage_order', 'desc')->first();
        if ($isAdmin) {
            $kpis = Kpi::orderBy('id','desc')->get();
        } else {
            $role = Employee::where('user_id', '=', $id)->first();
            $kpis = Kpi::whereRaw("find_in_set('" . $id . "',user_ids)")->orWhere('role_id', '=', $role->role_id)->orderBy('id')->get();
        }
        $i = 0;
        foreach ($stages as $row) {
            $stages[$i]['tasks'] = Task::where('stage_id', '=', $row->id)->where('created_by', '=', $id)->get();
            $stages[$i]['task_count'] = Task::where('stage_id', '=', $row->id)->where('created_by', '=', $id)->count();
            $j = 0;
            foreach ($row->tasks as $taskRow) {
                $userIds = explode(',', $taskRow->user_ids);
                $row->tasks[$j]['users'] = Employee::whereIn('user_id', $userIds)->get();
                $row->tasks[$j]['checklist_all'] = CheckList::where('task_id', '=', $taskRow->id)->count();
                $row->tasks[$j]['checklist_complete'] = CheckList::where('task_id', '=', $taskRow->id)->where('status', '=', 1)->count();
                if ($taskRow->created_by == Auth::id()) {
                    $row->tasks[$j]['isAuthorizedAssignee'] = 1;
                } else {
                    $row->tasks[$j]['isAuthorizedAssignee'] = 0;
                }
                $j++;
            }
            $i++;
        }

        $assignStages = Stage::orderBy('stage_order')->get();
        $as = 0;
        foreach ($assignStages as $row) {
            $assignStages[$as]['assignTasks'] = Task::where('stage_id', '=', $row->id)->whereRaw("find_in_set('" . $id . "',user_ids)")->orderBy('id', 'DESC')->get();
            $at = 0;
            foreach ($row->assignTasks as $assignTaskRow) {
                $user = User::find($assignTaskRow->created_by);
                if ($user->user_role == 0) {
                    $employeeName =  "Admin";
                } else {
                    $employeeName =  $user->employeeRole->name;
                }
                $row->assignTasks[$at]['created_name'] = $employeeName;
                $userIds = explode(',', $assignTaskRow->user_ids);
                $row->assignTasks[$at]['users'] = Employee::whereIn('user_id', $userIds)->get();
                $row->assignTasks[$at]['checklist_all'] = CheckList::where('task_id', '=', $assignTaskRow->id)->count();
                $row->assignTasks[$at]['checklist_complete'] = CheckList::where('task_id', '=', $assignTaskRow->id)->where('status', '=', 1)->count();
                if ($assignTaskRow->created_by == Auth::id()) {
                    $row->assignTasks[$at]['isAuthorizedAssignee'] = 1;
                } else {
                    $row->assignTasks[$at]['isAuthorizedAssignee'] = 0;
                }
                $at++;
            }
            $assignStages[$as]['assignSubtasks'] = SubTask::where('stage_id', '=', $row->id)->whereRaw("find_in_set('" . $id . "',user_ids)")->orderBy('id', 'DESC')->get();
            $ast = 0;
            foreach ($row->assignSubtasks as $assignSubTaskRow) {
                $user = User::find($assignSubTaskRow->created_by);
                if ($user->user_role == 0) {
                    $employeeName =  "Admin";
                } else {
                    $employeeName =  $user->employeeRole->name;
                }
                $row->assignSubtasks[$ast]['created_name'] = $employeeName;
                $userIds = explode(',', $assignSubTaskRow->user_ids);
                $row->assignSubtasks[$ast]['users'] = Employee::whereIn('user_id', $userIds)->get();
                $row->assignSubtasks[$ast]['checklist_all'] = CheckList::where('task_id', '=', $assignSubTaskRow->id)->count();
                $row->assignSubtasks[$ast]['checklist_complete'] = CheckList::where('task_id', '=', $assignSubTaskRow->id)->where('status', '=', 1)->count();
                $ast++;
            }
            $taskCount = Task::where('stage_id', '=', $row->id)->whereRaw("find_in_set('" . $id . "',user_ids)")->count();
            $subTaskCount = Subtask::where('stage_id', '=', $row->id)->whereRaw("find_in_set('" . $id . "',user_ids)")->count();
            $assignStages[$as]['assignCount'] = $taskCount + $subTaskCount;
            $as++;
        }
        $taskAssignedToMeCount = Task::whereRaw("find_in_set('" . $id . "',user_ids)")->count();
        $subTaskAssignedToMeCount = SubTask::whereRaw("find_in_set('" . $id . "',user_ids)")->count();
        $objectiveAssignedToMeCount = $taskAssignedToMeCount + $subTaskAssignedToMeCount;

        if($reportingName = Employee::select('id','user_id','name','is_under_id')->where('user_id', '=', $id)->first()) {
            $isUnderName = Employee::select('id','user_id','name')->where('user_id', '=', $reportingName->is_under_id)->first();
        }
        $isUnderName = $isUnderName != null ? $isUnderName->name : 'Admin';


        return response()->json(['stages' => $stages, 'lastStage' => $lastStage, 'kpis' => $kpis, 'id' => $id, 'assignStages' => $assignStages, 'objectiveAssignedToMeCount' => $objectiveAssignedToMeCount, 'subTaskAssignedToMeCount' => $subTaskAssignedToMeCount, 'reportsTo' => $isUnderName]);
    }

    /**
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Contracts\View\View
     */
    public function fetchTask(Request $request, FilterService $filterService, ColleagueFilterService $colleagueFilterService)
    {
        if (empty($request->start_dt) && empty($request->end_dt)) {
            $endDate = Carbon::now()->endOfDay(); // current date and time, end of day
            $startDate = $endDate->copy()->subMonth()->startOfDay(); // one month before, start of day
        } else {
            $startDate = Carbon::parse($request->start_dt)->startOfDay();
            $endDate = Carbon::parse($request->end_dt)->endOfDay();
        }

        // Collect month names between startDate and endDate
        $kpiMonths = [];
        $current = $startDate->copy()->startOfMonth();

        while ($current->lte($endDate)) {
            $kpiMonths[] = ['kpi_month' => $current->format('F'), 'kpi_year' => $current->format('Y')];
            $current->addMonth();
        }

        $stages = Stage::orderBy('stage_order')->get();
        $lastStage = Stage::orderBy('stage_order', 'desc')->first();
        $i = 0;
        foreach ($stages as $row) {
            $filter = Task::query();
            if (!empty($request->due_date_single_filter)) {
                $filter = $filterService->dueDateFilter($request, $row, $filter);
            } elseif (!empty($request->priority_filter)) {
                $filter = $filterService->priorityFilter($request, $row, $filter);
            } elseif (!empty($request->date_created_single_filter)) {
                $filter = $filterService->dateCreatedFilter($request, $row, $filter);
            } elseif (!empty($request->date_updated_single_filter)) {
                $filter = $filterService->dateUpdatedFilter($request, $row, $filter);
            } elseif (!empty($request->start_date_single_filter)) {
                $filter = $filterService->startDateFilter($request, $row, $filter);
            } else {
                $filter = $filter->where('stage_id', '=', $row->id)->where('created_by', '=', $request->id)->orderBy('id', 'DESC');
            }
            //kpi where condition which will kpi_month & kpi_year
            // $filter = $filter->where(function($query) use($kpiMonths){
            //     foreach($kpiMonths as $kpiMonth){
            //         $query->orWhere('kpi_month', $kpiMonth['kpi_month'])
            //         ->where('kpi_year', $kpiMonth['kpi_year']);
            //     }
            // });
            // $stages[$i]['tasks'] = $filter->whereBetween('created_at',[$startDate,$endDate])->get();
            $stages[$i]['tasks'] = $filter->withCount('subTasks')->where(function($query) use($startDate,$endDate,$kpiMonths){
                $query->whereBetween('created_at',[$startDate,$endDate])->orWhere(function($qry) use($kpiMonths){
                    foreach($kpiMonths as $kpiMonth){
                        $qry->orWhere('kpi_month', $kpiMonth['kpi_month'])
                        ->where('kpi_year', $kpiMonth['kpi_year']);
                    }
                });
            })->with(['createdBy:id,user_id,name','assignedBy:id,user_id,name'])->get();
            $stages[$i]['task_count'] = $filter->count();
            $j = 0;
            foreach ($row->tasks as $taskRow) {
                $userIds = explode(',', $taskRow->user_ids);
                $row->tasks[$j]['users'] = Employee::whereIn('user_id', $userIds)->get();
                $row->tasks[$j]['checklist_all'] = CheckList::where('task_id', '=', $taskRow->id)->count();
                $row->tasks[$j]['checklist_complete'] = CheckList::where('task_id', '=', $taskRow->id)->where('status', '=', 1)->count();
                if ($taskRow->created_by == Auth::id()) {
                    $row->tasks[$j]['isAuthorizedAssignee'] = 1;
                } else {
                    $row->tasks[$j]['isAuthorizedAssignee'] = 0;
                }
                $j++;
            }
            $i++;
        }

        $assignStages = Stage::orderBy('stage_order')->get();
        $as = 0;
        foreach ($assignStages as $row) {
            $assignFilter = Task::query();
            if (!empty($request->due_date_single_filter)) {
                $assignFilter = $colleagueFilterService->dueDateFilter($request, $row, $assignFilter);
            } elseif (!empty($request->priority_filter)) {
                $assignFilter = $colleagueFilterService->priorityFilter($request, $row, $assignFilter);
            } elseif (!empty($request->date_created_single_filter)) {
                $assignFilter = $colleagueFilterService->dateCreatedFilter($request, $row, $assignFilter);
            } elseif (!empty($request->date_updated_single_filter)) {
                $assignFilter = $colleagueFilterService->dateUpdatedFilter($request, $row, $assignFilter);
            } elseif (!empty($request->start_date_single_filter)) {
                $assignFilter = $colleagueFilterService->startDateFilter($request, $row, $assignFilter);
            } else {
                $assignFilter = $assignFilter->where('stage_id', '=', $row->id)->whereRaw("find_in_set('" . $request->id . "',user_ids)");
            }

            $assignStages[$as]['assignTasks'] = $assignFilter->withCount('subTasks')->orderBy('id', 'DESC')->whereBetween('created_at',[$startDate,$endDate])->get();
            $at = 0;
            foreach ($row->assignTasks as $assignTaskRow) {
                $user = User::find($assignTaskRow->created_by);
                if ($user->user_role == 0) {
                    $employeeName =  "Admin";
                } else {
                    $employeeName =  $user->employeeRole->name;
                }
                $row->assignTasks[$at]['created_name'] = $employeeName;
                $userIds = explode(',', $assignTaskRow->user_ids);
                $row->assignTasks[$at]['users'] = Employee::select("id","user_id","name","emp_id")->whereIn('user_id', $userIds)->get();
                $row->assignTasks[$at]['checklist_all'] = CheckList::where('task_id', '=', $assignTaskRow->id)->count();
                $row->assignTasks[$at]['checklist_complete'] = CheckList::where('task_id', '=', $assignTaskRow->id)->where('status', '=', 1)->count();
                if ($assignTaskRow->created_by == Auth::id()) {
                    $row->assignTasks[$at]['isAuthorizedAssignee'] = 1;
                } else {
                    $row->assignTasks[$at]['isAuthorizedAssignee'] = 0;
                }
                $at++;
            }
            $assignSubTaskFilter = SubTask::query();
            if (!empty($request->due_date_single_filter)) {
                $assignSubTaskFilter = $colleagueFilterService->dueDateFilter($request, $row, $assignSubTaskFilter);
            } elseif (!empty($request->priority_filter)) {
                $assignSubTaskFilter = $colleagueFilterService->priorityFilter($request, $row, $assignSubTaskFilter);
            } elseif (!empty($request->date_created_single_filter)) {
                $assignSubTaskFilter = $colleagueFilterService->dateCreatedFilter($request, $row, $assignSubTaskFilter);
            } elseif (!empty($request->date_updated_single_filter)) {
                $assignSubTaskFilter = $colleagueFilterService->dateUpdatedFilter($request, $row, $assignSubTaskFilter);
            } elseif (!empty($request->start_date_single_filter)) {
                $assignSubTaskFilter = $colleagueFilterService->startDateFilter($request, $row, $assignSubTaskFilter);
            } else {
                $assignSubTaskFilter = $assignSubTaskFilter->where('stage_id', '=', $row->id)->whereRaw("find_in_set('" . $request->id . "',user_ids)");
            }
            $assignStages[$as]['assignSubtasks'] = $assignSubTaskFilter->orderBy('id', 'DESC')->whereBetween('created_at',[$startDate,$endDate])->get();
            $ast = 0;
            foreach ($row->assignSubtasks as $assignSubTaskRow) {
                $user = User::find($assignSubTaskRow->created_by);
                if ($user->user_role == 0) {
                    $employeeName =  "Admin";
                } else {
                    $employeeName =  $user->employeeRole->name;
                }
                $row->assignSubtasks[$ast]['created_name'] = $employeeName;
                $userIds = explode(',', $assignSubTaskRow->user_ids);
                $row->assignSubtasks[$ast]['users'] = Employee::whereIn('user_id', $userIds)->get();
                $row->assignSubtasks[$ast]['checklist_all'] = CheckList::where('task_id', '=', $assignSubTaskRow->id)->count();
                $row->assignSubtasks[$ast]['checklist_complete'] = CheckList::where('task_id', '=', $assignSubTaskRow->id)->where('status', '=', 1)->count();
                $ast++;
            }
            $taskCount = $assignFilter->count();
            $subTaskCount = $assignSubTaskFilter->count();
            $assignStages[$as]['assignCount'] = $taskCount + $subTaskCount;
            $as++;
        }

        $kpis = [];
        // if ($request->isAdmin) {
        //     $kpis = Kpi::orderBy('id','desc')->get();
        // } else {
        //     $role = Employee::where('user_id', '=', $request->id)->first();
        //     $kpis = Kpi::whereRaw("find_in_set('" . $request->id . "',user_ids)")->orWhere('role_id', '=', $role->role_id)->orderBy('id')->get();
        // }
        if($reportingName = Employee::select('id','user_id','name','is_under_id')->where('user_id', '=', $request->id)->first()) {
            $isUnderName = Employee::select('id','user_id','name')->where('id', '=', $reportingName->is_under_id)->first();
        }
        $isUnderName = $isUnderName != null ? $isUnderName->name : 'Admin';

        return response()->json(['stages' => $stages, 'lastStage' => $lastStage, 'kpis' => $kpis, 'reportsTo' => $isUnderName, 'assignStages' => $assignStages ]);
    }

    public function getReportsToName(Request $request) {
        if($reportingName = Employee::select('id','user_id','name','is_under_id')->where('user_id', '=', $request->id)->first()) {
            $isUnderName = Employee::select('id','user_id','name')->where('id', '=', $reportingName->is_under_id)->first();
        }
        $isUnderName = $isUnderName != null ? $isUnderName->name : 'Admin';

        return response()->json(['reportsTo' => $isUnderName], 200);
    }


    /**
     * @param mixed $userid
     * @return \Illuminate\Http\Response|void
     */
    public function kpiListing(Request $request) {
        $this->validate($request,[
            'userId' => 'required|integer',
            'month' => 'required',
            'year' => 'required'
        ]);
        $userId = $request->userId;
        $isAdmin = $request->isAdmin;
        $month = $request->month;
        $year = $request->year;
        $date = Carbon::createFromDate($year, $month, 1);
        $currentMonth = $date->startOfMonth()->format('F');
        $lastmonth = $date->startOfMonth()->subMonth()->format('F');
        $lastYear = $date->format('Y');
        $secondLastMonth = $date->startOfMonth()->subMonth()->format('F');
        $secondLastYear = $date->format('Y');

        $kpi = new Kpi;
        $kpi = $kpi->select('id','kpi_name','role_id','user_ids','description','target_type','priority');
        $kpi = $kpi->with(['roles:id,name']);
        $kpi = $kpi->with([
            'assignedTarget'  => function ($query) use ($userId, $currentMonth, $year) {
                $query->select('id','title','kpi_id','task_type','kpi_year','kpi_month','target_type','target_value','assigned_by','created_by')
                ->where('task_type', 'kpi')
                ->where('assigned_by', $userId)
                ->where('kpi_month', $currentMonth)
                ->where('kpi_year', $year);
            },
            'assignedTarget.createdBy:id,user_id,name',
            'currentMonthTarget'  => function ($query) use ($userId, $currentMonth, $year, $isAdmin) {
                $query->select('id','title','kpi_id','task_type','kpi_year','kpi_month','target_type','target_value','assigned_by','created_by')
                ->where('task_type', 'kpi');
                if($isAdmin) {
                    $query->where('assigned_by', $userId);
                } else {
                    $query->where('created_by', $userId);
                }

                $query->where('kpi_month', $currentMonth)
                ->where('kpi_year', $year);
            },
            'currentMonthTarget.createdBy:id,user_id,name',
            'lastMonthTarget'  => function ($query) use ($userId, $lastmonth, $lastYear) {
                $query->select('id','title','kpi_id','task_type','kpi_year','kpi_month','target_type','target_value','assigned_by','created_by')
                ->where('task_type', 'kpi')
                ->where('assigned_by', $userId)
                ->where('kpi_month', $lastmonth)
                ->where('kpi_year', $lastYear);
            },
            'lastMonthTarget.createdBy:id,user_id,name',
            'secondLastMonthTarget'  => function ($query) use ($userId, $secondLastMonth, $secondLastYear) {
                $query->select('id','title','kpi_id','task_type','kpi_year','kpi_month','target_type','target_value','assigned_by','created_by')
                ->where('task_type', 'kpi')
                ->where('assigned_by', $userId)
                ->where('kpi_month', $secondLastMonth)
                ->where('kpi_year', $secondLastYear);
            },
            'secondLastMonthTarget.createdBy:id,user_id,name'
        ]);

        if($isAdmin != 1) {
            $role = Employee::where('user_id', $userId)->first();
            //pass employee ID to getImmediateHierarchy function and fetch their roles as well
            $isUnderListing = $this->hierarchyService->getImmediateHierarchy($role->id);
            $uniqueRoleIds = $this->parseJsonResponse($isUnderListing);

            $kpiRoles = [];
            if($role->ancillary_roles != null || $role->ancillary_roles != ''){
                $kpiRoles = array_map('intval', explode(',', $role->ancillary_roles));
            }

            //pass ancillary role to uniqueRoleIds
            $uniqueRoleIds[] = $role->leadershihp_kpi_id;

            $uniqueRoleIds = array_unique(array_merge($uniqueRoleIds, $kpiRoles));

            $kpi = $kpi->whereRaw("find_in_set('" . $userId . "',user_ids)")->orWhereIn('role_id', $uniqueRoleIds);
        }

        $kpi = $kpi->orderBy('id')->get();

        return response()->json($kpi, 200);
    }

    public function parseJsonResponse(JsonResponse $response)
    {
        // Get the JSON data as an array
        $data = $response->getData();

        // Extract unique role_id values from the children array
        $uniqueRoleIds = array_unique(array_column($data->children, 'role_id'));
        // include the role_id from the parent
        if (isset($data->role_id)) {
            $uniqueRoleIds[] = $data->role_id;
            $uniqueRoleIds = array_unique($uniqueRoleIds);
        }

        return $uniqueRoleIds;
    }


    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse|void
     */
    public function updateKanbanStatus(Request $request)
    {
        $this->validate($request, [
            'id' => 'required|integer',
            'status' => 'required|integer|between:2,8'
        ]);
        if ($request->status == 6) {
            $query = 'commented';
            $totalComment = TaskTimeLine::where('task_id', $request->id)->where('description', 'like', '%' . $query . '%')->count();
            if ($totalComment > 0) {
                $this->updateStageNextValidate($request);
                return response()->json(['success' => true, 'message' => 'Task updated successfully'], 200);
            } else {
                return response()->json(['message' => "Please add a comment on task itself, in order to move your task onto 'Review' column"], 400);
            }
        } else {
            if ($request->status == 8 || $request->status == 7) {
                // $checkIsUnder = Employee::where('user_id', '=', Auth::id())->first();
                $task = Task::find($request->id);
                $emp_id = Employee::where('user_id', Auth::id())->value('id');
                $emp_arr = Employee::select('id','user_id','name')->where('is_click_up_on', '=', '1')->where('is_under_id', $emp_id)->get()->toArray();

                if (Auth::user()->user_role == 0 || (count($emp_arr) > 0 && $task->created_by != Auth::id())) {
                    $this->updateStatusValidate($request);
                    return response()->json(['success' => true, 'message' => 'Task updated successfully'], 200);
                } else {
                    return response()->json(['message' => "You cannot move your own created task onto 'Complete' or 'False Report' column!"], 400);
                }

            } else {
                $this->updateStatusValidate($request);
                return response()->json(['success' => true, 'message' => 'Task updated successfully'], 200);
            }
        }
    }

    public function updateStatusValidate($request)
    {
        $formData = array(
            'stage_id' => $request->status,
        );
        $tasks = Task::find($request->id);
        $stage = Stage::find($tasks->stage_id);
        if ($tasks->stage_id != $request->status) {
            if (Task::find($request->id)->update($formData)) {
                $tasksNext = Task::find($request->id);
                $stageNext = Stage::find($tasksNext->stage_id);
                $description = 'changed status from <b>' . $stage->stage_name . '</b> to <b>' . $stageNext->stage_name . '</b>';
                return TaskTimeLine::create([
                    'description' => $description,
                    'task_id' => $request->id,
                    'created_by' => Auth::id()
                ]);
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createTask(TaskRequest $request)
    {
        if (!empty($request->user_ids)) {
            $userIds = [];
            for ($i = 0; $i < count($request->user_ids); $i++) {
                array_push($userIds, $request->user_ids[$i]);
            }
            $userIds = implode(",", $userIds);
        } else {
            $userIds = $request->user_ids;
        }
        $monthName = null;
        if($request->has('kpi_month')) {
            $kpi_month = (int)$request->kpi_month;
            $date = Carbon::create()->month($kpi_month)->startOfMonth();
            $monthName = $date->format('F');
        }
        $data = Task::create([
            'title' => $request->title,
            'description' => $request->description,
            'stage_id' => $request->stage_id,
            'user_ids' => $userIds,
            'priority' => $request->priority,
            'start_date' => $request->start_date,
            'due_date' => $request->due_date,
            'e_hours' => $request->e_hours,
            'e_minutes' => $request->e_minutes,
            'e_seconds' => $request->e_seconds,
            'task_type' => $request->task_type,
            'created_by' => $request->created_by,
            'assigned_by' => $request->assigned_by,
            'target_type' => $request->target_type,
            'target_value' => $request->target_value,
            'target_remaining' => $request->target_value,
            'target_completed' => '0',
            'kpi_id' => $request->kpi_id,
            'kpi_month' => $monthName,
            'kpi_year' => $request->kpi_year,
            'role_id' => $request->role_id,
            'role_type' => $request->role_type
        ]);
        TaskTimeLine::create([
            'description' => 'Created This Task',
            'task_id' => $data->id,
            'created_by' => ($request->task_type == 'kpi') ? $request->assigned_by : $request->created_by
        ]);
        $data['start_date_new'] = date('M d', strtotime($data->start_date));
        $data['due_date_new'] = date('M d', strtotime($data->due_date));
        $userIds = explode(',', $data->user_ids);
        $data['users'] = Employee::select('id','user_id','name','emp_id','is_under_id','role_id','designation_id','email')->whereIn('user_id', $userIds)->get();
        $j = 0;
        foreach ($data['users'] as $userDetail) {
            $data['users'][$j]['picture'] = mb_substr($userDetail->name, 0, 1) . '' . mb_substr($userDetail->name, strpos($userDetail->name, " ") + 1, 1);
            $j++;
        }
        return response()->json(['success' => true, "message" => "Task created successfully", 'data' => $data ], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addMultipleTask(Request $request)
    {
        foreach ($request->title as $title) {
            $data = Task::create([
                'title' => $title,
                'kpi_year' => $request->kpi_year,
                'kpi_month' => $request->kpi_month,
                'stage_id' => 2,
                'task_type' => 'kpi',
                'created_by' => $request->created_by
            ]);
            TaskTimeLine::create([
                'description' => 'Created This Task',
                'task_id' => $data->id,
                'created_by' => $request->created_by
            ]);
        }
        return response()->json([
            'status' => 200
        ]);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function editTask(Request $request)
    {
        $tasks = Task::with(['stages'])->find($request->id);
        $tasks['isAuthorizedAssignee'] = ($tasks->created_by == Auth::id()) ? 1 : 0;
        $tasks['created'] = date("M, d H:i a", strtotime($tasks->created_at));
        return response()->json($tasks);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateTask(Request $request)
    {
        $formData = array(
            $request->col_name => $request->col_val,
        );
        Task::find($request->id)->update($formData);
        TaskTimeLine::create([
            'description' => $request->description,
            'task_id' => $request->id,
            'created_by' => Auth::id()
        ]);
        $data = Task::where('id', $request->id)->first();
        $data['start_date_new'] = date('M d', strtotime($data->start_date));
        $data['due_date_new'] = date('M d', strtotime($data->due_date));
        $userIds = explode(',', $data->user_ids);
        $data['users'] = Employee::select('id','user_id','name','emp_id','is_under_id','role_id','designation_id','email')->whereIn('user_id', $userIds)->get();
        $j = 0;
        foreach ($data['users'] as $userDetail) {
            $data['users'][$j]['picture'] = mb_substr($userDetail->name, 0, 1) . '' . mb_substr($userDetail->name, strpos($userDetail->name, " ") + 1, 1);
            $j++;
        }
        return response()->json(['success' => true, "message" => "Task updated successfully", 'data' => $data ], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateAssigneeTask(Request $request)
    {
        $data = Task::where('id', $request->id)->first();
        if (!empty($request->user_ids)) {
            $user = Auth::user();
            if ($user->user_role == 0) {
                $employeeName =  "Admin";
            } else {
                $employeeName =  $user->employeeRole->name;
            }
            $taskData = [
                'body' => $data->title . ' Assign To You by ' . $employeeName,
            ];
            $userIds = [];
            for ($i = 0; $i < count($request->user_ids); $i++) {
                $userSchema = User::find($request->user_ids[$i]);
                // Notification::send($userSchema, new TaskNotification($taskData));
                array_push($userIds, $request->user_ids[$i]);
            }
            $userIds = implode(",", $userIds);
        } else {
            $userIds = $request->user_ids;
        }
        $formData = array(
            'user_ids' => $userIds,
        );
        Task::find($request->id)->update($formData);
        TaskTimeLine::create([
            'description' => 'Updated Assignee to This Task',
            'task_id' => $request->id,
            'created_by' => Auth::id()
        ]);
        $data['start_date_new'] = date('M d', strtotime($data->start_date));
        $data['due_date_new'] = date('M d', strtotime($data->due_date));
        $userIds = explode(',', $data->user_ids);
        $data['users'] = Employee::whereIn('user_id', $userIds)->get();
        $j = 0;
        foreach ($data['users'] as $userDetail) {
            $data['users'][$j]['picture'] = mb_substr($userDetail->name, 0, 1) . '' . mb_substr($userDetail->name, strpos($userDetail->name, " ") + 1, 1);
            $j++;
        }
        return response()->json(['success' => true, "message" => "Task Assignee updated successfully", 'data' => $data ], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse|void
     */
    public function updateStageNext(Request $request)
    {
        if ($request->status == 6) {
            $query = 'commented';
            $totalComment = TaskTimeLine::where('task_id', $request->id)->where('description', 'like', '%' . $query . '%')->count();
            if ($totalComment > 0) {
                $this->updateStageNextValidate($request);
                return response()->json(['success' => true, "message" => "Task Assignee updated successfully"], 200);
            } else {
                return response()->json(['success' => false, "message" => "Add a comment on task in order to change column"], 422);
            }
        } else {
            if ($request->status == 8 || $request->status == 7) {
                $checkIsUnder = Employee::where('user_id', '=', Auth::id())->first();
                if (Auth::user()->user_role == 0 || $checkIsUnder->is_under_user_ids != "") {
                    $this->updateStageNextValidate($request);
                    return response()->json(['success' => true, "message" => "Task Assignee updated successfully"], 200);
                }
            } else {
                $this->updateStageNextValidate($request);
                return response()->json(['success' => true, "message" => "Task Assignee updated successfully"], 200);
            }
        }
    }

    public function deleteTask(Request $request)
    {
        $this->validate($request,[
            'id' => 'required',
        ]);
        if(Auth::user()->user_role == 0) {
            $task = Task::find($request->id);
            if($task) {
                $task->delete();
            }
            return response()->json(['success' => true, "message" => "Task deleted successfully"], 200);
        }
        return response()->json(['success' => false, "message" => "Only admin can delete a task"], 422);
    }

    public function updateStageNextValidate($request)
    {
        $formData = array(
            'stage_id' => $request->status,
        );
        $tasksC = Task::with(['stages'])->find($request->id);
        $stageC = Stage::find($tasksC->stage_id);
        $stageUpdated = Stage::find($request->status);
        if (Task::find($request->id)->update($formData)) {
            $description = 'changed status from <b>' . $stageC->stage_name . '</b> to <b>' . $stageUpdated->stage_name . '</b>';
            TaskTimeLine::create([
                'description' => $description,
                'task_id' => $request->id,
                'created_by' => Auth::id()
            ]);
        } else {
            return 0;
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateSprintPoint(Request $request)
    {
        $formData = array(
            'sprint_point' => $request->sprint_point,
        );
        $tasksC = Task::find($request->id);
        if ($tasksC->sprint_point == null) {
            $taskSprintPoint = '-';
        } else {
            $taskSprintPoint = $tasksC->sprint_point;
        }

        $description = 'changed Sprint Point from <b>' . $taskSprintPoint . '</b> to <b>' . $request->sprint_point . '</b>';
        TaskTimeLine::create([
            'description' => $description,
            'task_id' => $request->id,
            'created_by' => Auth::id()
        ]);
        Task::find($request->id)->update($formData);
        return response()->json(['success' => true, "message" => "Sprint point updated successfully"], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function storeCommentTask(Request $request)
    {
        $this->validate($request, [
            'task_id' => 'required|integer',
            'comment_attachments.*' => 'max:5120',
        ], [
            'comment_attachments.*.max' => 'Maximum allowed file size is 5MB'
        ]);
        $description = 'commented <b>' . $request->task_comment . '</b>';
        $commentId = TaskTimeLine::create([
            'description' => $description,
            'task_id' => $request->task_id,
            'created_by' => Auth::id()
        ]);
        if ($request->hasfile('comment_attachments')) {
            foreach ($request->file('comment_attachments') as $image) {
                $imageName = date('YmdHis') . rand(10000, 99999) . "." . $image->getClientOriginalExtension();
                Storage::put('uploads/tasks/comment/' . $imageName, file_get_contents($image));
                $data = array(
                    'image' => $imageName,
                    'comment_id' => $commentId->id
                );
                CommentAttachment::create($data);
            }
        }
        return response()->json(['success' => true, "message" => "Comment added successfully"], 200);
    }

    /**
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function timelineTask(Request $request)
    {
        $taskTimeLines = TaskTimeLine::with(['attachments'])->where('task_id', '=', $request->task_id)->get();
        $i = 0;
        foreach ($taskTimeLines as $row) {
            if ($row->created_by == Auth::id()) {
                $taskTimeLines[$i]['name'] = 'You';
            } else {
                $user = User::find($row->created_by);
                if ($user->user_role == 0) {
                    $taskTimeLines[$i]['name'] =  "Admin";
                } else {
                    $taskTimeLines[$i]['name'] =  $user->employeeRole->name;
                }
            }
            $i++;
        }
        return response()->json($taskTimeLines, 200);
    }


    /**
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory|void
     */
    public function targetList(Request $request)
    {
        $this->validate($request,[
            'task_id' => 'required',
        ]);
        $targetReports = TargetReport::where('task_id', $request->task_id)->orderBy('id', 'desc')->get();
        $targetType = $request->target_type;
        if ($targetReports->count() > 0) {
            return response()->json(['targetReports' => $targetReports, 'targetType' => $targetType], 200);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateTarget(Request $request)
    {
        if ($request->target_type == 'Done / Not Done') {
            $targetValue = '0';
        } else {
            $targetValue = $request->target_value;
        }
        Task::find($request->task_id)->update([
            'target_type' => $request->target_type,
            'target_value' => $targetValue,
            'target_remaining' => $targetValue,
            'target_completed' => '0'
        ]);
        return response()->json(['success' => true, "message" => "Target updated successfully"], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addTargetReport(Request $request)
    {
        $this->validate($request,[
            'target_done' => 'required|numeric|gt:0',
        ]);
        $targetRemaining = $request->target_remaining - $request->target_done;
        TargetReport::create([
            'task_id' => $request->task_id,
            'target_done' => $request->target_done,
            'target_remaining' => $targetRemaining,
            'target_remaining_old' => $request->target_remaining,
            'reporting_date' => date('Y-m-d')
        ]);
        $targetCompleted = $request->target_done + $request->target_completed;
        Task::find($request->task_id)->update([
            'target_remaining' => $targetRemaining,
            'target_completed' => $targetCompleted
        ]);
        if ($targetRemaining == 0) {
            Task::find($request->task_id)->update(['stage_id' => 6]);
            $tasks = Task::with(['stages'])->find($request->task_id);
            $tasks['targetDone'] = '1';
        } else {
            $tasks = Task::with(['stages'])->find($request->task_id);
            $tasks['targetDone'] = '0';
        }
        return response()->json($tasks, 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function makeDoneReport(Request $request)
    {
        TargetReport::create([
            'task_id' => $request->id,
            'reporting_date' => date('Y-m-d'),
            'target_done' => '1'
        ]);
        Task::find($request->id)->update([
            'target_completed' => '1',
            'stage_id' => 6
        ]);
        $tasks = Task::with(['stages'])->find($request->id);
        return response()->json($tasks, 200);
    }
}
