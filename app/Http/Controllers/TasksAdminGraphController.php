<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Employee;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;

class TasksAdminGraphController extends Controller
{
    private $users_array = array();
    public function __construct()
    {
        $clickUpOn = Employee::select('user_id')->where('is_click_up_on', '1')->get()->toArray();


        // array_push($this->users_array, "1");

        foreach($clickUpOn as $users){
            $this->users_array[] = $users['user_id'];
        }
    }

    public function adminGraphDashboard(Request $request) {
        return view('admin.tasks.adminView');
    }

    public function fetchAdminObjectiveGraphData(Request $request) {
        if(empty($this->users_array) || empty($request['start_dt']) || empty($request['end_dt'])) {
            return '<h4 class="my-5 text-center text-danger">No record present in the database!</h4>';
        }

        $startDate = Carbon::parse($request['start_dt'])->toDateTimeString();
        $endDate = Carbon::parse($request['end_dt'])->endOfDay()->toDateTimeString();

        $selected_dates = $this->getDatesFromRange($startDate, $endDate);

        $employeeDetails = User::select('id', 'email', 'user_role')
            ->with(['employeeRole:id,user_id,name'])
            ->whereIn('id', $this->users_array)
            ->get();

        $employee_names = [];
        foreach ($employeeDetails as $key => $employee) {
            $employee_names[$key] = ($employee->user_role == 0) ? "Admin" : ($employee->employeeRole->name ?? "null");

            $tasks = Task::where('created_by', $employee->id)
                ->where('task_type', 'objective')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->get();
            $userId = $employee->id;
            $employeeDetails[$key]->totalObjectives = $tasks->count();
            $currentMonthObjectives = $tasks->count();
            $dayNum = Carbon::parse($endDate)->diffInDays(Carbon::parse($startDate));
            $employeeDetails[$key]->objectiveAverageCount = round($currentMonthObjectives / $dayNum, 2);
            $created_tasks = Task::where('task_type', 'objective')->where(function($query) use($userId){
                                return $query->whereRaw("find_in_set('" . $userId . "', user_ids) AND user_ids = '" . $userId . "'")
                                    ->orWhere('created_by', $userId);
                                })->whereBetween('created_at', [$startDate,$endDate])->get();
            $objAssignedByMe = Task::where('created_by', $userId)->where('task_type', 'objective')->whereNotNull('user_ids')->whereRaw("find_in_set('" . $userId . "', user_ids) AND user_ids != '" . $userId . "'")->whereBetween('created_at', [$startDate,$endDate])->get();
            $objAssignedToMe = Task::where('task_type', 'objective')->whereRaw("find_in_set('" . $userId . "',user_ids)")->whereBetween('created_at', [$startDate,$endDate])->get();
            //Created By Me titles start
            $task_titles_created = $created_tasks->map(function ($task) {
                return $task->title;
            });
            $employeeDetails[$key]->objectiveIndividual = [
                'y' => $created_tasks->count(),
                'titles' => $task_titles_created
            ];
            //Created By Me titles end
            //Assigned By Me titles start
            $task_titles_by_me = $objAssignedByMe->map(function ($task) {
                return $task->title;
            });
            $employeeDetails[$key]->objectiveAssignedByMe = [
                'y' => $objAssignedByMe->count(),
                'titles' => $task_titles_by_me
            ];
            //Assigned By Me titles end
            //Assigned To Me titles start
            $task_titles_to_me = $objAssignedToMe->map(function ($task) {
                return $task->title;
            });
            $employeeDetails[$key]->objectiveAssignedToMe = [
                'y' => $objAssignedToMe->count(),
                'titles' => $task_titles_to_me
            ];
            //Assigned To Me titles end
            //total titles start
            $task_titles_total = $tasks->map(function ($task) {
                return $task->title;
            });
            $employeeDetails[$key]->totalObjectives = [
                'y' => $tasks->count(),
                'titles' => $task_titles_total
            ];
            //urgent titles end
            //urgent titles start
            $task_titles_urgent = $tasks->where('priority', 'Urgent')->map(function ($task) {
                return $task->title;
            });
            $employeeDetails[$key]->flagCountUrgent = [
                'y' => $tasks->where('priority', 'Urgent')->count(),
                'titles' => $task_titles_urgent
            ];
            //urgent titles end
            //high titles start
            $task_titles_high = $tasks->where('priority', 'High')->map(function ($task) {
                return $task->title;
            });
            $employeeDetails[$key]->flagCountHigh = [
                'y' => $tasks->where('priority', 'High')->count(),
                'titles' => $task_titles_high
            ];
            //high titles end
            //medium titles start
            $task_titles_medium = $tasks->where('priority', 'Medium')->map(function ($task) {
                return $task->title;
            });
            $employeeDetails[$key]->flagCountMedium = [
                'y' => $tasks->where('priority', 'Medium')->count(),
                'titles' => $task_titles_medium
            ];
            //medium titles end
            //low titles start
            $task_titles_low = $tasks->where('priority', 'Low')->map(function ($task) {
                return $task->title;
            });
            $employeeDetails[$key]->flagCountLow = [
                'y' => $tasks->where('priority', 'Low')->count(),
                'titles' => $task_titles_low
            ];
            //low titles end
            //no flag titles start
            $task_titles_low = $tasks->whereNull('priority')->map(function ($task) {
                return $task->title;
            });
            $employeeDetails[$key]->flagCountLow = [
                'y' => $tasks->whereNull('priority')->count(),
                'titles' => $task_titles_low
            ];

            $task_titles_no_flag = [];
            $task_titles_no_flag[] = $tasks->whereNull('priority')->map(function ($task) {
                return $task->title;
            });
            $employeeDetails[$key]->flagCountNoFlagTitles = $task_titles_no_flag;
            $task_titles_urgent = [];

            $employeeDetails[$key]->objectiveTatMissCount = $tasks->whereNotIn('stage_id', ['6', '7'])->where('due_date', '<', Carbon::tomorrow())->count();
            $employeeDetails[$key]->objectiveFalseReportCount = $tasks->where('stage_id', '8')->count();
            $employeeDetails[$key]->objectiveUnderReviewCount = $tasks->where('stage_id', '6')->count();
            $employeeDetails[$key]->objectiveTargetNumberTotal = $tasks->where('target_type', 'Number')->sum('target_value');
            $employeeDetails[$key]->objectiveTargetNumberCompleted = $tasks->where('target_type', 'Number')->sum('target_completed');
            $employeeDetails[$key]->objectiveTargetCurrencyTotal = $tasks->where('target_type', 'Currency')->sum('target_value');
            $employeeDetails[$key]->objectiveTargetCurrencyCompleted = $tasks->where('target_type', 'Currency')->sum('target_completed');
            $employeeDetails[$key]->objectiveTargetDNDTotal = $tasks->where('target_type', 'Done / Not Done')->count();
            $employeeDetails[$key]->objectiveTargetDNDCompleted = $tasks->where('target_type', 'Done / Not Done')->where('target_completed', '1')->count();
            $employeeDetails[$key]->withoutTarget = $tasks->whereNull('target_type')->count();

            $zero_counts = 0;
            $less_3_counts = 0;
            foreach($selected_dates as $date) {
                $tasks = Task::where('task_type', 'objective')->where('created_by', $userId)->whereDate('created_at', $date)->count();
                if($tasks == 0){
                    $zero_counts++;
                } elseif($tasks > 0 && $tasks < 3) {
                    $less_3_counts++;
                }
            }
            $employeeDetails[$key]->zeroCounts = $zero_counts;
            $employeeDetails[$key]->less_3_counts = $less_3_counts;

        }

        return response()->json(['counts' => $employeeDetails, 'employee_names' => $employee_names]);
    }

    public function fetchAdminKPIGraphData(Request $request) {
        if(empty($this->users_array) || empty($request['start_dt']) || empty($request['end_dt'])) {
            return '<h4 class="my-5 text-center text-danger">No record present in the database!</h4>';
        }

        $startDate = Carbon::parse($request['start_dt'])->toDateTimeString();
        $endDate = Carbon::parse($request['end_dt'])->endOfDay()->toDateTimeString();

        $employeeDetails = User::select('id', 'email', 'user_role')
            ->with(['employeeRole:id,user_id,name'])
            ->whereIn('id', $this->users_array)
            ->get();

        $employee_names = [];
        foreach ($employeeDetails as $key => $employee) {
            $employee_names[$key] = ($employee->user_role == 0) ? "Admin" : ($employee->employeeRole->name ?? "null");

            $tasks = Task::where('created_by', $employee->id)
                ->where('task_type', 'kpi')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->get();
            $employeeDetails[$key]->totalKpis = $tasks->count();

            $employeeDetails[$key]->flagCountUrgent = $tasks->where('priority', 'Urgent')->count();
            $employeeDetails[$key]->flagCountHigh = $tasks->where('priority', 'High')->count();
            $employeeDetails[$key]->flagCountMedium = $tasks->where('priority', 'Medium')->count();
            $employeeDetails[$key]->flagCountLow = $tasks->where('priority', 'Low')->count();
            $employeeDetails[$key]->flagCountNoFlag = $tasks->whereNull('priority')->count();

            $employeeDetails[$key]->kpiTatMissCount = $tasks->whereNotIn('stage_id', ['6', '7'])->where('due_date', '<', Carbon::tomorrow())->count();
            $employeeDetails[$key]->kpiFalseReportCount = $tasks->where('stage_id', '8')->count();
            $employeeDetails[$key]->kpiUnderReviewCount = $tasks->where('stage_id', '6')->count();
            $employeeDetails[$key]->kpiCompleteCount = $tasks->where('stage_id', '7')->count();

            $employeeDetails[$key]->kpiTargetNumberTotal = $tasks->where('target_type', 'Number')->sum('target_value');
            $employeeDetails[$key]->kpiTargetNumberCompleted = $tasks->where('target_type', 'Number')->sum('target_completed');
            $employeeDetails[$key]->kpiTargetCurrencyTotal = $tasks->where('target_type', 'Currency')->sum('target_value');
            $employeeDetails[$key]->kpiTargetCurrencyCompleted = $tasks->where('target_type', 'Currency')->sum('target_completed');
            $employeeDetails[$key]->kpiTargetDNDTotal = $tasks->where('target_type', 'Done / Not Done')->count();
            $employeeDetails[$key]->kpiTargetDNDCompleted = $tasks->where('target_type', 'Done / Not Done')->where('target_completed', '1')->count();
            $employeeDetails[$key]->kpiWithoutTarget = $tasks->whereNull('target_type')->count();
        }

        return response()->json(['counts' => $employeeDetails, 'employee_names' => $employee_names]);
    }

    private function getDatesFromRange($startDate, $endDate) {
        $dates = [];
        $currentDate = strtotime($startDate);
        $endDate = strtotime($endDate);

        while($currentDate <= $endDate) {
            $dates[] = date('Y-m-d', $currentDate);
            $currentDate += 86400; // add 1 day
        }

        return $dates;
    }



}
