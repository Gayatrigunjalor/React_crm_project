<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Carbon\Carbon;
use App\Models\Task;
use App\Models\Employee;
use App\Models\Role;
use App\Models\Stage;
use App\Services\ImmediateHierarchyService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TasksGraphController extends Controller
{

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function objectiveStageGraph(Request $request)
    {
        $startDate = Carbon::parse($request->start_dt)->toDateTimeString();
        $endDate = Carbon::parse($request->end_dt)->endOfDay()->toDateTimeString();
        $userId = $request->user_id;

        $totalObjectives = Task::where('task_type', 'objective')->where(function($query) use($userId){
            return $query->where('created_by', $userId);
        })->whereDate('due_date', '>=', Carbon::today()->format('Y-m-d'))->whereBetween('created_at', [$startDate,$endDate])->count();
        $totalObjectivesTatCount = Task::where('task_type', 'objective')->where('stage_id', '!=', '6')->where('stage_id', '!=', '7')->whereDate('due_date', '<', Carbon::today()->format('Y-m-d'))->where('created_by',$userId)->whereBetween('created_at', [$startDate, $endDate])->count();

        $stages = Stage::orderBy('stage_order', 'ASC')->get();
        $stageCountXAxisPoints = [];
        $stageWithinTATCount = [];
        $stageTATExpiredCount = [];

        $stageCountXAxisPoints[] = 'Total Objectives';
        $stageWithinTATCount[] = $totalObjectives;
        $stageTATExpiredCount[] = $totalObjectivesTatCount;
        foreach ($stages as $stage) {
            $stage_count = Task::where('task_type', 'objective')->where('stage_id', '=', $stage->id)->where('created_by', $userId)->whereDate('due_date', '>=', Carbon::today()->format('Y-m-d'))->whereBetween('created_at', [$startDate, $endDate])->count();

            $stage_tat_count = 0;
            if($stage->id != 6 || $stage->id != 7) {
                $stage_tat_count = Task::where('task_type', 'objective')->where('stage_id', '=', $stage->id)->where('stage_id', '!=', '6')->where('stage_id', '!=', '7')->whereDate('due_date', '<', Carbon::today()->format('Y-m-d'))->where('created_by',$userId)->whereBetween('created_at', [$startDate, $endDate])->count();
            }
            $stageCountXAxisPoints[] = $stage->stage_name;

            $stageWithinTATCount[] = $stage_count;
            $stageTATExpiredCount[] = $stage_tat_count;

        }

        return response()->json([
            'stageWithinTATCount' => $stageWithinTATCount,
            'stageTATExpiredCount' => $stageTATExpiredCount,
            'stageCountXAxisPoints' => $stageCountXAxisPoints
        ]);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function objectiveStageColleagueGraph(Request $request)
    {
        $startDate = Carbon::parse($request->start_dt)->toDateTimeString();
        $endDate = Carbon::parse($request->end_dt)->endOfDay()->toDateTimeString();

        $userId = $request->user_id;

        $totalObjectives = Task::where('task_type', 'objective')->where(function($query) use($userId){
            return $query
                ->whereRaw("find_in_set('" . $userId . "', user_ids) AND user_ids = '" . $userId . "'");
        })->whereBetween('created_at', [$startDate,$endDate])->count();
        $totalObjectivesTatCount = Task::where('task_type', 'objective')->where('stage_id', '!=', '6')->where('stage_id', '!=', '7')->whereDate('due_date', '<', Carbon::tomorrow())->whereRaw("find_in_set('" . $userId . "', user_ids) AND user_ids = '" . $userId . "'")->whereBetween('created_at', [$startDate, $endDate])->count();

        $stages = Stage::orderBy('stage_order', 'ASC')->get();
        $stageCountXAxisPoints = [];
        $stageWithinTATCount = [];
        $stageTATExpiredCount = [];

        $stageCountXAxisPoints[] = 'Total Colleague Obj.';
        $stageWithinTATCount[] = $totalObjectives;
        $stageTATExpiredCount[] = $totalObjectivesTatCount;
        foreach ($stages as $stage) {
            $stage_count = Task::where('task_type', 'objective')->where('stage_id', '=', $stage->id)->whereRaw("find_in_set('" . $userId . "', user_ids) AND user_ids = '" . $userId . "'")->whereBetween('created_at', [$startDate, $endDate])->count();

            $stage_tat_count = 0;
            if($stage->id != 6 || $stage->id != 7) {
                $stage_tat_count = Task::where('task_type', 'objective')->where('stage_id', '=', $stage->id)->where('stage_id', '!=', '6')->where('stage_id', '!=', '7')->whereDate('due_date', '<', Carbon::tomorrow())->whereRaw("find_in_set('" . $userId . "', user_ids) AND user_ids = '" . $userId . "'")->whereBetween('created_at', [$startDate, $endDate])->count();
            }
            $stageCountXAxisPoints[] = $stage->stage_name;

            $stageWithinTATCount[] = $stage_count;
            $stageTATExpiredCount[] = $stage_tat_count;

        }

        return response()->json([
            'stageWithinTATCount' => $stageWithinTATCount,
            'stageTATExpiredCount' => $stageTATExpiredCount,
            'stageCountXAxisPoints' => $stageCountXAxisPoints
        ]);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function objectivePriorityGraph(Request $request)
    {
        $startDate = Carbon::parse($request->start_dt)->toDateTimeString();
        $endDate = Carbon::parse($request->end_dt)->endOfDay()->toDateTimeString();

        $user_id = $request->user_id;

        $totalObjectives = Task::where('task_type', 'objective')->where('created_by', $user_id)->whereBetween('created_at', [$startDate, $endDate])->count();
        $flags = Task::select('priority')->groupBy('priority')->get();
        $flagCountXAxisPoints = [];
        $flagCountPoints = [];
        $i = 0;
        $flagCountXAxisPoints[] = 'Total Tasks';
        $flagCountPoints[] = [
            'name' => 'Total Tasks',
            'y' => $totalObjectives
        ];
        foreach ($flags as $flag) {
            $flags[$i]['flag_count'] = Task::where('task_type', 'objective')->where('priority', '=', $flag->priority)->where('created_by', $user_id)->whereBetween('created_at', [$startDate, $endDate])->count();
            if (!empty($flag->priority)) {
                $flagPriority = $flag->priority;
            } else {
                $flagPriority = 'No Priority';
            }
            $flagCountXAxisPoints[] = [$flagPriority];
            $flagCountPoints[] = [
                "name" => $flagPriority,
                "y" => $flag->flag_count
            ];
            $i++;
        }

        return response()->json([
            'flagCountXAxisPoints' => $flagCountXAxisPoints,
            'flagCountPoints' => $flagCountPoints
        ]);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function objectiveCreatedByMeGraph(Request $request)
    {
        $startDate = Carbon::parse($request->start_dt)->toDateTimeString();
        $endDate = Carbon::parse($request->end_dt)->endOfDay()->toDateTimeString();

        $user_id = $request->user_id;
        $user_name = Employee::where('user_id', $user_id)->first();

        $selected_dates = $this->getDatesFromRange($startDate, $endDate);

        $created_counts = [];
        foreach($selected_dates as $date) {
            $created_counts[] = Task::where('task_type', 'objective')->where('created_by', $user_id)->whereDate('created_at', $date)->count();
        }

        return response()->json([
            'user_name' => $user_name->name ?? 'Admin',
            'selected_dates' => $selected_dates,
            'counts' => $created_counts
        ]);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function objectiveAssignedByMeGraph(Request $request)
    {
        $startDate = Carbon::parse($request->start_dt)->toDateTimeString();
        $endDate = Carbon::parse($request->end_dt)->endOfDay()->toDateTimeString();

        $user_id = $request->user_id;

        $selected_dates = $this->getDatesFromRange($startDate, $endDate);

        $created_counts = [];
        foreach($selected_dates as $date) {
            $created_counts[] = Task::where('task_type', 'objective')->where('created_by', $user_id)->whereNotNull('user_ids')->whereDate('created_at', $date)->count();
        }

        return response()->json([
            'selected_dates' => $selected_dates,
            'counts' => $created_counts
        ]);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function objectiveAssignedToMeGraph(Request $request)
    {
        $startDate = Carbon::parse($request->start_dt)->toDateTimeString();
        $endDate = Carbon::parse($request->end_dt)->endOfDay()->toDateTimeString();

        $user_id = $request->user_id;

        $selected_dates = $this->getDatesFromRange($startDate, $endDate);

        $created_counts = [];
        foreach($selected_dates as $date) {
            $created_counts[] = Task::where('task_type', 'objective')->whereRaw("find_in_set('" . $user_id . "',user_ids)")->whereDate('created_at', $date)->count();
        }

        return response()->json([
            'selected_dates' => $selected_dates,
            'counts' => $created_counts
        ]);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function objectiveTargetTrackerGraph(Request $request)
    {
        $startDate = Carbon::parse($request->start_dt)->toDateTimeString();
        $endDate = Carbon::parse($request->end_dt)->endOfDay()->toDateTimeString();

        $userId = $request->user_id;

        $targetNumberTotal = Task::where('created_by', $userId)->where('task_type', 'objective')->where('target_type', 'number')->whereBetween('created_at', [$startDate, $endDate])->sum('target_value');
        $targetNumberCompleted = Task::where('created_by', $userId)->where('task_type', 'objective')->where('target_type', 'number')->whereBetween('created_at', [$startDate, $endDate])->sum('target_completed');
        $targetCurrencyTotal = Task::where('created_by', $userId)->where('task_type', 'objective')->where('target_type', 'currency')->whereBetween('created_at', [$startDate, $endDate])->sum('target_value');
        $targetCurrencyCompleted = Task::where('created_by', $userId)->where('task_type', 'objective')->where('target_type', 'currency')->whereBetween('created_at', [$startDate, $endDate])->sum('target_completed');
        $targetDNDTotal = Task::where('created_by', $userId)->where('task_type', 'objective')->where('target_type', 'Done/Not Done')->whereBetween('created_at', [$startDate, $endDate])->count();
        $targetDNDCompleted = Task::where('created_by', $userId)->where('task_type', 'objective')->where('target_type', 'Done/Not Done')->where('target_completed', '1')->whereBetween('created_at', [$startDate, $endDate])->count();
        $targetWithout = Task::where('created_by', $userId)->where('task_type', 'objective')->whereNull('target_type')->whereBetween('created_at', [$startDate, $endDate])->count();

        return response()->json([
            'targetNumberTotal'         => $targetNumberTotal,
            'targetNumberCompleted'     => $targetNumberCompleted,
            'targetCurrencyTotal'       => $targetCurrencyTotal,
            'targetCurrencyCompleted'   => $targetCurrencyCompleted,
            'targetDNDTotal'            => $targetDNDTotal,
            'targetDNDCompleted'        => $targetDNDCompleted,
            'targetWithout'             => $targetWithout
        ]);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function objectiveCautionListGraph(Request $request)
    {
        $startDate = Carbon::parse($request->start_dt)->toDateTimeString();
        $endDate = Carbon::parse($request->end_dt)->endOfDay()->toDateTimeString();

        $userId = $request->user_id;
        $counts = [];

        $total_tasks = Task::where('task_type', 'objective')->where('created_by', $userId)->whereBetween('created_at', [$startDate, $endDate])->count();
        $counts['total_tasks'] =  $total_tasks;
        $selected_dates = $this->getDatesFromRange($startDate, $endDate);

        $zero_counts = 0;
        $less_3_counts = 0;
        $less_5_counts = 0;
        $more_5_counts = 0;
        $false_counts = 0;
        $miss_counts = 0;
        foreach($selected_dates as $date) {
            $tasks = Task::where('task_type', 'objective')->where('created_by', $userId)->whereDate('created_at', $date)->count();
            if($tasks == 0){
                $zero_counts++;
            } elseif($tasks > 0 && $tasks < 3) {
                $less_3_counts++;
            } elseif($tasks >= 3 && $tasks < 5) {
                $less_5_counts++;
            } else {
                $more_5_counts++;
            }
            $false_counts += Task::where('task_type', 'objective')->where('created_by', $userId)->where('stage_id', 8)->whereDate('due_date', '<', Carbon::tomorrow())->whereDate('created_at', $date)->count();
            $miss_counts += Task::where('task_type', 'objective')->where('created_by', $userId)->where('stage_id', '!=', '6')->where('stage_id', '!=', '7')->whereDate('due_date', '<', Carbon::tomorrow())->whereDate('created_at', $date)->count();
        }

        $counts = [$total_tasks, $zero_counts, $less_3_counts, $less_5_counts, $more_5_counts, $false_counts, $miss_counts];

        return response()->json([
            'counts' => $counts,
        ]);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function objectiveCalendarView(Request $request)
    {
        $startDate = Carbon::create('2024', '5', 1)->startOfDay()->toDateTimeString();
        $endDate = Carbon::create('2024', '5', 1)->endOfMonth()->endOfDay()->toDateTimeString();

        $userId = $request->user_id;

        $tasks = Task::where('task_type', 'objective')->where('created_by', $userId)->whereBetween('created_at', [$startDate, $endDate])->get()
        ->map(function ($event) {
            return [
                'title' => $event->title,
                'start' => $event->start_date,
                'end' => $event->end_date,
            ];
        });

        return response()->json($tasks);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function kpiStageGraph(Request $request)
    {
        $startDate = Carbon::parse($request->start_dt)->toDateTimeString();
        $endDate = Carbon::parse($request->end_dt)->endOfDay()->toDateTimeString();
        $user_id = $request->user_id;

        $totalKpis = Task::where('task_type', 'kpi')->where('created_by', $user_id)->whereBetween('created_at', [$startDate, $endDate])->count();
        $totalKpisTatCount = Task::where('task_type', 'kpi')->where('stage_id', '!=', '6')->where('stage_id', '!=', '7')->whereDate('due_date', '<', Carbon::tomorrow())->where('created_by',$user_id)->whereBetween('created_at', [$startDate, $endDate])->count();

        $stages = Stage::orderBy('stage_order', 'ASC')->get();
        $stageCountXAxisPoints = [];
        $stageWithinTATCount = [];
        $stageTATExpiredCount = [];

        $stageCountXAxisPoints[] = 'Total Kpis';
        $stageWithinTATCount[] = $totalKpis;
        $stageTATExpiredCount[] = $totalKpisTatCount;
        foreach ($stages as $stage) {
            $stage_count = Task::where('task_type', 'kpi')->where('stage_id', '=', $stage->id)->where('created_by', $user_id)->whereBetween('created_at', [$startDate, $endDate])->count();

            $stage_tat_count = 0;
            if($stage->id != 6 || $stage->id != 7) {
                $stage_tat_count = Task::where('task_type', 'kpi')->where('stage_id', '=', $stage->id)->where('stage_id', '!=', '6')->where('stage_id', '!=', '7')->whereDate('due_date', '<', Carbon::tomorrow())->where('created_by',$user_id)->whereBetween('created_at', [$startDate, $endDate])->count();
            }
            $stageCountXAxisPoints[] = $stage->stage_name;

            $stageWithinTATCount[] = $stage_count;
            $stageTATExpiredCount[] = $stage_tat_count;

        }

        return response()->json([
            'stageWithinTATCount' => $stageWithinTATCount,
            'stageTATExpiredCount' => $stageTATExpiredCount,
            'stageCountXAxisPoints' => $stageCountXAxisPoints
        ]);
    }
    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function kpiPriorityGraph(Request $request)
    {
        $startDate = Carbon::parse($request->start_dt)->toDateTimeString();
        $endDate = Carbon::parse($request->end_dt)->endOfDay()->toDateTimeString();

        $user_id = $request->user_id;

        $totalKpis = Task::where('task_type', 'kpi')->where('created_by', $user_id)->whereBetween('created_at', [$startDate, $endDate])->count();

        $flags = Task::select('priority')->groupBy('priority')->get();
        $flagCountXAxisPoints = [];
        $flagCountPoints = [];
        $i = 0;
        $flagCountXAxisPoints[] = 'Total Tasks';
        $flagCountPoints[] = [
            'name' => 'Total Tasks',
            'y' => $totalKpis
        ];
        foreach ($flags as $flag) {
            $flags[$i]['flag_count'] = Task::where('task_type', 'kpi')->where('priority', '=', $flag->priority)->where('created_by', $user_id)->whereBetween('created_at', [$startDate, $endDate])->count();
            if (!empty($flag->priority)) {
                $flagPriority = $flag->priority;
            } else {
                $flagPriority = 'No Priority';
            }
            $flagCountXAxisPoints[] = [$flagPriority];
            $flagCountPoints[] = [
                "name" => $flagPriority,
                "y" => $flag->flag_count
            ];
            $i++;
        }

        return response()->json([
            'kpiFlagCountXAxisPoints' => $flagCountXAxisPoints,
            'kpiFlagCountPoints' => $flagCountPoints
        ]);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function kpiTargetGraph(Request $request)
    {
        $startDate = Carbon::parse($request->start_dt)->toDateTimeString();
        $endDate = Carbon::parse($request->end_dt)->endOfDay()->toDateTimeString();

        $userId = $request->user_id;

        $targetNumberTotal = Task::where('created_by', $userId)->where('task_type', 'kpi')->where('target_type', 'Number')->whereBetween('created_at', [$startDate, $endDate])->sum('target_value');
        $targetNumberCompleted = Task::where('created_by', $userId)->where('task_type', 'kpi')->where('target_type', 'Number')->whereBetween('created_at', [$startDate, $endDate])->sum('target_completed');
        $targetCurrencyTotal = Task::where('created_by', $userId)->where('task_type', 'kpi')->where('target_type', 'Currency')->whereBetween('created_at', [$startDate, $endDate])->sum('target_value');
        $targetCurrencyCompleted = Task::where('created_by', $userId)->where('task_type', 'kpi')->where('target_type', 'Currency')->whereBetween('created_at', [$startDate, $endDate])->sum('target_completed');
        $targetDNDTotal = Task::where('created_by', $userId)->where('task_type', 'kpi')->where('target_type', 'Done/Not Done')->whereBetween('created_at', [$startDate, $endDate])->count();
        $targetDNDCompleted = Task::where('created_by', $userId)->where('task_type', 'kpi')->where('target_type', 'Done/Not Done')->where('target_completed', '1')->whereBetween('created_at', [$startDate, $endDate])->count();
        $targetWithout = Task::where('created_by', $userId)->where('task_type', 'kpi')->whereNull('target_type')->whereBetween('created_at', [$startDate, $endDate])->count();

        return response()->json([
            'targetNumberTotal'         => $targetNumberTotal,
            'targetNumberCompleted'     => $targetNumberCompleted,
            'targetCurrencyTotal'       => $targetCurrencyTotal,
            'targetCurrencyCompleted'   => $targetCurrencyCompleted,
            'targetDNDTotal'            => $targetDNDTotal,
            'targetDNDCompleted'        => $targetDNDCompleted,
            'targetWithout'             => $targetWithout
        ]);
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

    public function allTeamSummary(Request $request) {

        $validator = Validator::make($request->query(), [
            'role_id' => 'integer',
            'kpi_year' => 'integer|digits:4',
            'kpi_month' => 'string|in:January,February,March,April,May,June,July,August,September,October,November,December',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $kpiTasks = $this->getKpisDistributionData($request);

        return response()->json($kpiTasks, 200);
    }

    protected function getKpisDistributionData($request) {
        $tasks = Task::select('tasks.role_id', DB::raw('count(*) as total'), 'roles.name as role_name',
            DB::raw("SUM(CASE WHEN role_type = 'primary' THEN 1 ELSE 0 END) as primary_total"),
            DB::raw("SUM(CASE WHEN role_type = 'ancillary' THEN 1 ELSE 0 END) as ancillary_total"));

        $tasks = $tasks->whereNotNull('tasks.role_id');
        $tasks = $tasks->where('task_type', 'kpi');
        if($request->has('role_id') && !empty($request->role_id)){
            $tasks = $tasks->where('tasks.role_id', $request->role_id);
        }
        $tasks = $tasks->groupBy('tasks.role_id', 'roles.name');
        $tasks = $tasks->join('roles', 'tasks.role_id', '=', 'roles.id');
        $tasks = $tasks->join('employees', 'tasks.created_by', '=', 'employees.user_id');
        $tasks = $tasks->where('employees.is_under_id', $request->isAdmin == 1 ? 1 : $request->employee_id);
        // if($request->has('kpi_year')){
        //     $tasks = $tasks->where('kpi_year', $request->kpi_year);
        // }
        // if($request->has('kpi_month')){
        //     $tasks = $tasks->whereIn('kpi_month', $request->kpi_month);
        // }
        $tasks = $tasks->get();

        return $tasks;
    }

    public function kpiDistributionAcrossDept(Request $request) {
        $totalKpis = Task::where('task_type', 'kpi')->whereNotNull('role_id')->where('assigned_by', Auth::id())->count();

        $roleWiseKpis = $this->getKpisDistributionData($request);

        return response()->json([
            'totalKpis' =>$totalKpis,
            'roleWiseKpis' => $roleWiseKpis
        ], 200);
    }

    public function roleBasedKpiDistribution() {
        $kpis = Task::select('role_type')->where('task_type', 'kpi')->whereNotNull('role_id')->where('assigned_by', Auth::id())->get();

        return response()->json([
            'primaryCount' =>$kpis->where('role_type','primary')->count(),
            'ancillaryCount' => $kpis->where('role_type','ancillary')->count()
        ], 200);
    }

    public function kpiDistributionDetails(Request $request) {
        $validator = Validator::make($request->query(), [
            'role_id' => 'integer',
            'role_type' => 'string|in:primary,ancillary',
            'kpi_year' => 'integer|digits:4',
            'kpi_month' => 'string|in:January,February,March,April,May,June,July,August,September,October,November,December',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $kpis = Task::select('id',
            'stage_id',
            'kpi_id',
            'role_id',
            'role_type',
            'priority',
            'task_type',
            'kpi_month',
            'kpi_year',
            'target_type',
            'target_value',
            'target_completed',
            'assigned_by',
            'created_by'
        );
        $kpis = $kpis->where('task_type', 'kpi');
        $kpis = $kpis->whereNotNull('role_id');
        if(!empty($request->role_id)){
            $kpis = $kpis->where('role_id', $request->role_id);
        }
        if(!empty($request->role_type)){
            $kpis = $kpis->where('role_type', $request->role_type);
        }
        $kpis = $kpis->where('assigned_by', Auth::id())->get();

        $totalKpisCount = $kpis->count();
        $totalDndCount = $kpis->where('target_type', 'Done/Not Done')->count();
        $targetNumberTotal = $kpis->where('target_type', 'number')->sum('target_value');
        $targetNumberCompleted = $kpis->where('target_type', 'number')->sum('target_completed');
        $targetCurrencyTotal = $kpis->where('target_type', 'currency')->sum('target_value');
        $targetCurrencyCompleted = $kpis->where('target_type', 'currency')->sum('target_completed');

        return response()->json([
            'totalKpisCount' => $totalKpisCount,
            'totalDndCount' => $totalDndCount,
            'targetNumberTotal' => round($targetNumberTotal, 2),
            'targetNumberCompleted' => round($targetNumberCompleted, 2),
            'targetCurrencyTotal' => round($targetCurrencyTotal, 2),
            'targetCurrencyCompleted' => round($targetCurrencyCompleted, 2),
        ]);
    }

    public function roleWiseAndCompletionRateGraph(Request $request) {
        $validator = Validator::make($request->query(), [
            'role_id' => 'integer',
            'role_type' => 'string|in:primary,ancillary',
            'kpi_year' => 'integer|digits:4',
            'kpi_month' => 'string|in:January,February,March,April,May,June,July,August,September,October,November,December',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $validator->errors(),
            ], 422);
        }
        $kpis = Task::select('id','role_type','target_type', 'target_value', 'target_completed', 'target_remaining', 'assigned_by')->where('task_type', 'kpi')->where('assigned_by', Auth::id());
        if(!empty($request->role_id)){
            $kpis = $kpis->where('role_id', $request->role_id);
        }
        if(!empty($request->role_type)){
            $kpis = $kpis->where('role_type', $request->role_type);
        }
        $results = $kpis->get();
        $counts = [
            'total' => $results->count(),
            'primaryCount' => $results->where('role_type','primary')->count(),
            'ancillaryCount' => $results->where('role_type','ancillary')->count(),
            'completed' => $results->filter(function ($item) {
                return ($item->target_type === 'Done/Not Done' && $item->target_completed == '1')
                    || ($item->target_type !== 'Done/Not Done' && $item->target_remaining == 0);
            })->count(),

            // Not completed count (using your specified condition)
            'not_completed' => $results->filter(function ($item) {
                return ($item->target_type === 'Done/Not Done' && $item->target_remaining == 0)
                    || ($item->target_remaining != 0 && $item->target_type !== 'Done/Not Done');
            })->count()
        ];

        return response()->json($counts, 200);
    }

    public function kpiPerformanceSummary(Request $request) {
        $validator = Validator::make($request->query(), [
            'role_id' => 'integer',
            'role_type' => 'string|in:primary,ancillary',
            'kpi_year' => 'integer|digits:4',
            'kpi_month' => 'string|in:January,February,March,April,May,June,July,August,September,October,November,December',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $kpis = Task::select('tasks.created_by', DB::raw('SUM(CASE WHEN tasks.role_id = '.$request->role_id.' THEN 1 ELSE 0 END) as totalAssigned'), 'employees.name as employee_name',
            DB::raw("SUM(CASE WHEN target_completed = '1' OR (target_remaining = '0' AND target_type != 'Done/Not Done') THEN 1 ELSE 0 END) as completed_total"))
            ->where('tasks.task_type', 'kpi');

        if(!empty($request->role_id)){
            $kpis = $kpis->where('tasks.role_id', $request->role_id);
        }
        if(!empty($request->role_type)){
            $kpis = $kpis->where('tasks.role_type', $request->role_type);
        }
        $kpis = $kpis->groupBy('tasks.created_by', 'employees.name');
        $kpis = $kpis->join('employees', 'tasks.created_by', '=', 'employees.user_id');
        $kpis = $kpis->where('employees.is_under_id', $request->isAdmin == 1 ? 1 : $request->employee_id);
        $kpis = $kpis->where('employees.is_click_up_on', 1);
        $kpis = $kpis->get();

        return response()->json($kpis, 200);
    }

    public function kpiTargetWiseDistribution(Request $request) {
        $validator = Validator::make($request->query(), [
            'role_id' => 'integer',
            'role_type' => 'string|in:primary,ancillary',
            'kpi_year' => 'integer|digits:4',
            'kpi_month' => 'string|in:January,February,March,April,May,June,July,August,September,October,November,December',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $kpis = Task::select('tasks.created_by', DB::raw('count(*) as totalAssigned'), 'employees.name as employee_name',
            DB::raw("SUM(CASE WHEN target_type = 'Currency' THEN 1 ELSE 0 END) as currencyCount"),
            DB::raw("SUM(CASE WHEN target_type = 'Number' THEN 1 ELSE 0 END) as numberCount"),
            DB::raw("SUM(CASE WHEN target_type = 'Done/Not Done' THEN 1 ELSE 0 END) as dndCount"),
        )->where('tasks.task_type', 'kpi');

        if(!empty($request->role_id)){
            $kpis = $kpis->where('tasks.role_id', $request->role_id);
        }
        if(!empty($request->role_type)){
            $kpis = $kpis->where('tasks.role_type', $request->role_type);
        }
        $kpis = $kpis->groupBy('tasks.created_by', 'employees.name');
        $kpis = $kpis->join('employees', 'tasks.created_by', '=', 'employees.user_id');
        $kpis = $kpis->where('employees.is_under_id', $request->isAdmin == 1 ? 1 : $request->employee_id);
        $kpis = $kpis->where('employees.is_click_up_on', 1);

        $kpis = $kpis->get();

        return response()->json($kpis, 200);
    }

    public function firstLineTeamDashboard(Request $request) {
        $validator = Validator::make($request->query(), [
            'role_id' => 'integer',
            'role_type' => 'string|in:primary,ancillary',
            'kpi_year' => 'integer|digits:4',
            'kpi_month' => 'string|in:January,February,March,April,May,June,July,August,September,October,November,December',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $employee = Employee::where('user_id', Auth::id())->with(['role', 'leadershipKpi', 'aceAndGoalPreference'])->first();

        $ancillaryRoles = [];
        $kpis = [];
        if(!empty($employee->ancillary_roles)) {
            $ids = explode(",", $employee->ancillary_roles);
            $ancillaryRoles = Role::select('id','name')->whereIn('id', $ids)->get();
        }
        if($employee) {

            $kpis = Task::select("id", "title", "kpi_id", "role_id", "role_type", "task_type", "kpi_year", "kpi_month", "target_type", "target_value", "target_completed", "target_remaining", "assigned_by", "created_by")
                ->where('task_type', 'kpi')
                ->whereNotNull('role_id');
            if($request->role_id) {
                $kpis = $kpis->where('role_id', $request->role_id);
            }
            $kpis = $kpis->where('assigned_by', $employee->user_id)->get()->toArray();

            //-----------------------------------------------------------------------------------------------------------
            $roleWiseCounts = [];
            foreach ($kpis as $item) {
                $roleId = $item['role_id'];
                $role_name = Role::where('id', $roleId)->value('name');
                if (!isset($roleWiseCounts[$role_name])) {
                    $roleWiseCounts[$role_name] = 0;
                }
                $roleWiseCounts[$role_name]++;
            }

            //-----------------------------------------------------------------------------------------------------------
            $results = [];
            foreach ($kpis as $item) {
                $createdBy = $item['created_by'];
                if (!isset($results[$createdBy])) {
                    $results[$createdBy] = [
                        'total_assigned' => 0,
                        'target_completed' => 0,
                    ];
                }
                $results[$createdBy]['total_assigned']++;
                if ($item['target_completed'] == 1) {
                    $results[$createdBy]['target_completed']++;
                }
            }

            $totalAssignedCounts = [];
            // Output
            foreach ($results as $createdBy => $counts) {
                $totalAssignedCounts[] = [
                    'user_id' => $createdBy,
                    'employee_name' => Employee::select()->where('user_id', $createdBy)->value('name'),
                    'total_assigned' => $counts['total_assigned'],
                    'target_completed' => $counts['target_completed'],
                ];
            }
            //-----------------------------------------------------------------------------------------------------------
            // //target type
            $targetTypeArray = [];

            foreach ($kpis as $qry) {
                $userCreated = $qry['created_by'];
                $targetType = ($qry['target_type'] == 'Done/Not Done') ? 'dnd' : $qry['target_type'];

                if (!isset($targetTypeArray[$userCreated])) {
                    $targetTypeArray[$userCreated] = [
                        'number' => 0,
                        'currency' => 0,
                        'dnd' => 0,
                    ];
                }
                $targetTypeArray[$userCreated][$targetType]++;
            }

            $totalTargetTypeCounts = []; // Output
            foreach ($targetTypeArray as $userCreated => $counts) {
                $totalTargetTypeCounts[] = [
                    'user_id' => $userCreated,
                    'employee_name' => Employee::select()->where('user_id', $userCreated)->value('name'),
                    'total_number' => $counts['number'],
                    'total_currency' => $counts['currency'],
                    'target_dnd' => $counts['dnd'],
                ];
            }
            //-----------------------------------------------------------------------------------------------------------
            $collection = collect($kpis);
            $grouped = $collection->groupBy('created_by')->map(function ($items) {
                $targetTypes = ['number', 'currency', 'Done/Not Done'];
                $result = [];

                foreach ($targetTypes as $type) {
                    $filtered = $items->where('target_type', $type);
                    $result[$type] = [
                        'total' => $filtered->count(),
                        'completed' => $filtered->where('target_completed', 1)->count(),
                    ];
                }

                return $result;
            });

            // kpi completed target summary
            $kpiTargetCompleteSummary = [];

            foreach ($grouped as $createdBy => $counts) {
                $kpiTargetCompleteSummary[] = [
                    'user_id' => $createdBy,
                    'employee_name' => Employee::select()->where('user_id', $createdBy)->value('name'),
                    'targets' => $this->getCountsByTargetType($counts)
                ];
            }

            //-----------------------------------------------------------------------------------------------------------

            $apiData = [
                'employee' => [
                    'id' => $employee->id,
                    'user_id' => $employee->user_id,
                    'name' => $employee->name,
                    'role_id' => $employee->role_id,
                    'role_name' => $employee->role->name,
                    'leadership_kpi_id' => $employee->leadership_kpi_id,
                    'leadership_kpi_name' => ($employee->leadership_kpi_id != null) ? $employee->leadershipKpi->name : null,
                    'aceAndGoalPreference' => $employee->aceAndGoalPreference
                ],
                'ancillary_roles' => $ancillaryRoles,
                'kpiDistributionSummary' => $totalTargetTypeCounts,
                'kpiPerformanceSummary' => $totalAssignedCounts,
                'deptWiseKpiDistribution' => $roleWiseCounts,
                'kpiPerformanceCompletedSummary' => $kpiTargetCompleteSummary,
            ];

            return response()->json($apiData, 200);
        }

        return response()->json(['message' => 'Employee not found']);

    }

    private function getCountsByTargetType($counts) {
        $results = [];
        foreach ($counts as $type => $count) {
            $results[] = [
                'target_type' => $type,
                'total_assigned' => $count['total'],
                'total_completed' => $count['completed']
            ];
        }
        return $results;
    }

    public function kpiGraphsLevelZero(Request $request) {
        $validator = Validator::make($request->query(), [
            'role_id' => 'integer',
            'role_type' => 'string|in:primary,ancillary',
            'kpi_year' => 'integer|digits:4',
            'kpi_month' => 'string|in:January,February,March,April,May,June,July,August,September,October,November,December',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $validator->errors(),
            ], 422);
        }
        $stages = (new ImmediateHierarchyService)->getStages();

        $priorities = ["Directors priority","Salary Hold","Urgent","High","Medium","Low"];

        $employee = Employee::where('user_id', Auth::id())->with(['role', 'leadershipKpi', 'aceAndGoalPreference'])->first();

        $ancillaryRoles = [];
        if(!empty($employee->ancillary_roles)) {
            $ids = explode(",", $employee->ancillary_roles);
            $ancillaryRoles = Role::select('id','name')->whereIn('id', $ids)->get();
        }
        $data = [];
        if($employee) {
            $kpis = Task::where('task_type', 'kpi')->where('created_by', $employee->user_id);
            if(empty($request->role_id)) {
                $kpis = $kpis->where('role_id', $employee->role_id);
            } else {
                $kpis = $kpis->where('role_id', $request->role_id);
            }
            $kpis = $kpis->get();

            $kpisTotalCount = $kpis->count();
            $kpisTotalNumberCount = $kpis->where('target_type', 'number')->count();
            $kpisTotalCurrencyCount = $kpis->where('target_type', 'currency')->count();
            $kpisTotalValueNumberCount = $kpis->where('target_type', 'number')->sum('target_value');
            $kpisTotalValueCurrencyCount = $kpis->where('target_type', 'currency')->sum('target_value');
            $kpisTotalDndCount = $kpis->where('target_type', 'Done/Not Done')->count();
            $kpisCompletedNumberCount = $kpis->where('target_type', 'number')->sum('target_completed');
            $kpisCompletedCurrencyCount = $kpis->where('target_type', 'currency')->sum('target_completed');
            $kpisCompletedDndCount = $kpis->where('target_type', 'Done/Not Done')->sum('target_completed');

            $numberPercent = $kpisTotalCount ? (($kpisTotalNumberCount / $kpisTotalCount) * 100) : 0;
            $currencyPercent = $kpisTotalCount ? (($kpisTotalCurrencyCount / $kpisTotalCount) * 100) : 0;
            $dndPercent = $kpisTotalCount ? (($kpisTotalDndCount / $kpisTotalCount) * 100) : 0;

            $kpiStatus = [];
            $kpiTargetWise = [];
            $kpiTargetWise[] = [
                'kpisTotalNumberCount' => $kpisTotalNumberCount,
                'kpisTotalDndCount' => $kpisTotalDndCount,
                'kpisTotalCurrencyCount' => $kpisTotalCurrencyCount
            ];
            foreach($stages as $stage) {
                $kpiStatus[] = [
                    strtolower(str_replace(" ", "_", $stage->stage_name)). '_count' => $kpis->where('stage_id', $stage->id)->count()
                ];

                $kpiTargetWise[] = [
                    strtolower(str_replace(" ", "_", $stage->stage_name)). '_number_count' => $kpis->where('stage_id', $stage->id)->where('target_type', 'currency')->count(),
                    strtolower(str_replace(" ", "_", $stage->stage_name)). '_currency_count' => $kpis->where('stage_id', $stage->id)->where('target_type', 'number')->count(),
                    strtolower(str_replace(" ", "_", $stage->stage_name)). '_dnd_count' => $kpis->where('stage_id', $stage->id)->where('target_type', 'Done/Not Done')->count(),
                ];
            }
            $kpiPriority = [];
            foreach($priorities as $priority) {
                $kpiPriority[] = [
                    strtolower(str_replace(" ", "_", $priority)). '_count' => $kpis->where('priority', '=', $priority)->count()
                ];
            }
            $data['employee'] = [
                'id' => $employee->id,
                'user_id' => $employee->user_id,
                'name' => $employee->name,
                'role_id' => $employee->role_id,
                'role_name' => $employee->role->name,
                'leadership_kpi_id' => $employee->leadership_kpi_id,
                'leadership_kpi_name' => ($employee->leadership_kpi_id != null) ? $employee->leadershipKpi->name : null,
                'position' => 'L-0',
                'aceAndGoalPreference' => $employee->aceAndGoalPreference
            ];
            $data['ancillary_roles'] = $ancillaryRoles;
            $data['totalKpiCount'] = $kpisTotalCount;
            $data['kpiStatusGraph'] = $kpiStatus;
            $data['kpiPriorityGraph'] = $kpiPriority;
            $data['kpiTargetWiseProgressGraph'] = $kpiTargetWise;
            $data['targetDistributionGraph'] = [
                'targetNumberPercent' => round($numberPercent, 2),
                'targetCurrencyPercent' => round($currencyPercent, 2),
                'targetDndPercent' => round($dndPercent, 2),
            ];
            $data['performanceMatrixCounts'] = [
                'kpisTotalCount' => $kpisTotalCount,
                'kpisTotalNumberCount' => $kpisTotalValueNumberCount,
                'kpisTotalDndCount' => $kpisTotalDndCount,
                'kpisTotalCurrencyCount' => $kpisTotalValueCurrencyCount,
                'kpisCompletedNumberCount' => round($kpisCompletedNumberCount, 2),
                'kpisCompletedDndCount' => round($kpisCompletedDndCount, 2),
                'kpisCompletedCurrencyCount' => round($kpisCompletedCurrencyCount, 2),
            ];
        }
        return response()->json($data, 200);
    }
}
