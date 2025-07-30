<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Followup;
use App\Models\Leadfollowup;
use Illuminate\Http\Request;
use App\Jobs\SendFollowupJob;
use App\Models\FollowUpDetail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Employee;

class LeadfollowupController extends Controller
{
    public function sendFollowup(Request $request)
    {
        $validatedData = $request->validate([
            'lead_id' => 'required|exists:leads,id',
            'customer_id' => 'required|exists:lead_customer,id',
            'message' => 'required|string',
            'attempt' => 'required|integer',
        ]);

        // Store the follow-up in the database
        $followup = Leadfollowup::create([
            'lead_id' => $validatedData['lead_id'],
            'customer_id' => $validatedData['customer_id'],
            'message' => $validatedData['message'],
            'attempt' => $validatedData['attempt'],
        ]);

        return response()->json(['message' => 'Follow-up saved successfully', 'data' => $followup]);
    }


    public function testQueue()
{
    $lead = Lead::first();
    if ($lead) {
        SendFollowupJob::dispatch($lead, 1);
        return response()->json(['message' => 'Follow-up job dispatched successfully!']);
    }
    return response()->json(['message' => 'No lead found!'], 404);
}


public function index()
{
    $followUps = FollowUp::all();
    return response()->json($followUps);
}

// Add a new follow-up
public function store(Request $request)
{
    $request->validate([
        'status' => 'required',
    ]);

    $followUp = FollowUp::create([
        'status' => $request->status,
    ]);

    return response()->json(['message' => 'Follow-up added successfully', 'followUp' => $followUp]);
}


public function store_followup_details (Request $request)
    {
        $request->validate([
            'lead_id' => 'required|integer',
            'customer_id' => 'required|integer',
            'status' => '',
            'details' => 'required|array',
            'details.*.type' => 'required|string',
            'details.*.data' => 'required|string',

        ]);

        foreach ($request->details as $detail) {
            FollowUpDetail::create([
                'lead_id' => $request->lead_id,
                'customer_id' => $request->customer_id,
                'status' => $request->status,
                'type' => $detail['type'],
                'data' => $detail['data'],
            ]);
        }
        
        if ($request->status == '1') {
            DB::table('quotation_sents')
                ->where('lead_id', $request->lead_id)
                ->where('customer_id', $request->customer_id)
                ->update(['status' => '0']);
        }

        return response()->json(['message' => 'Follow-up details added successfully']);
    }

    public function getFollowupDetails(Request $request)
    {
        $request->validate([
            'lead_id' => 'required',
            'customer_id' => 'required',
        ]);

        $details = FollowUpDetail::where('lead_id', $request->lead_id)
            ->where('customer_id', $request->customer_id)
            ->get();

        return response()->json(['details' => $details]);
    }


    public function getTodayTasks()
    {
        \Log::info('Starting getTodayTasks function');
        
        $user = Auth::user();
        \Log::debug('User retrieved', ['user_id' => $user ? $user->id : null]);
        
        if (!$user) {
            \Log::warning('User not found');
            return response()->json(['message' => 'User not found'], 404);
        }

        // Fetch employee linked to the user
        $employee = Employee::with('role')
            ->where('user_id', $user->id)
            ->select('id', 'role_id')
            ->first();

        \Log::debug('Employee retrieved', ['employee_id' => $employee ? $employee->id : null]);

        if (!$employee) {
            \Log::warning('Employee not found for user', ['user_id' => $user->id]);
            return response()->json(['message' => 'Employee not found for this user'], 404);
        }

        \Log::info('Building query for today\'s tasks', ['employee_id' => $employee->id]);
        
        $query = FollowUpDetail::where('type', 'Re-Engage the Lead')
            ->where('data', 'LIKE', '%Schedule next follow-up%')
            ->where('is_today_status', 'progress')
            ->join('leads', 'follow_up_details.lead_id', '=', 'leads.id');

        // If not admin, filter by salesperson_id
        if (!($employee->role && $employee->role->name == 'ADMIN')) {
            $query->where('leads.salesperson_id', $employee->id);
        }

        $todayTasks = $query->select(
                'follow_up_details.id as id',
                'leads.unique_query_id as opportunity_id',
                'leads.sender_name as customer_name',
                'query_product_name as product_name',
                'follow_up_details.type as lead_stage',
                'follow_up_details.data as task',
                DB::raw("STR_TO_DATE(REGEXP_SUBSTR(SUBSTRING_INDEX(follow_up_details.data, 'Schedule next follow-up', -1), '[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}'), '%m/%d/%Y') as tat")

            )
            ->get();

        \Log::debug('Tasks retrieved', ['count' => $todayTasks->count()]);

        if ($todayTasks->isEmpty()) {
            \Log::info('No tasks found for today');
            return response()->json(['message' => 'No tasks for today'], 404);
        }

        \Log::info('Successfully retrieved today\'s tasks');
        return response()->json($todayTasks);
    }
    
    
    public function getTodayTasks_update(Request $request)
    {
        $validated = $request->validate([
           'id' => 'required|exists:follow_up_details,id',
            'is_today_status' => 'required|in:progress,done',
            'status' => 'required|string'
        ]);
    
        $followUp = FollowUpDetail::findOrFail($request->id);
        $followUp->is_today_status = $request->is_today_status;
        $followUp->status = $request->status;
        $followUp->save();
    
        return response()->json(['message' => 'Follow-up detail updated successfully', 'data' => $followUp]);  
    }


    public function todays_task_done(Request $request)
    {
        \Log::info('Starting getTodayTasks function');
        
        $user = Auth::user();
        \Log::debug('User retrieved', ['user_id' => $user ? $user->id : null]);
        
        if (!$user) {
            \Log::warning('User not found');
            return response()->json(['message' => 'User not found'], 404);
        }

        // Fetch employee linked to the user
        $employee = Employee::with('role')
            ->where('user_id', $user->id)
            ->select('id', 'role_id')
            ->first();

        \Log::debug('Employee retrieved', ['employee_id' => $employee ? $employee->id : null]);

        if (!$employee) {
            \Log::warning('Employee not found for user', ['user_id' => $user->id]);
            return response()->json(['message' => 'Employee not found for this user'], 404);
        }

        \Log::info('Building query for today\'s tasks', ['employee_id' => $employee->id]);
        
        $query = FollowUpDetail::where('type', 'Re-Engage the Lead')
            ->where('data', 'LIKE', '%Schedule next follow-up%')
            ->where('is_today_status', 'done')
            ->join('leads', 'follow_up_details.lead_id', '=', 'leads.id');

        // If not admin, filter by salesperson_id
        if (!($employee->role && $employee->role->name == 'ADMIN')) {
            $query->where('leads.salesperson_id', $employee->id);
        }

        $todayTasks = $query->select(
                'follow_up_details.id as id',
                'leads.unique_query_id as opportunity_id',
                'leads.sender_name as customer_name',
                'query_product_name as product_name',
                'follow_up_details.type as lead_stage',
                'follow_up_details.data as task',
                DB::raw("STR_TO_DATE(REGEXP_SUBSTR(SUBSTRING_INDEX(follow_up_details.data, 'Schedule next follow-up', -1), '[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}'), '%m/%d/%Y') as tat")

            )
            ->get();

        \Log::debug('Tasks retrieved', ['count' => $todayTasks->count()]);

        if ($todayTasks->isEmpty()) {
            \Log::info('No tasks found for today');
            return response()->json(['message' => 'No tasks for today'], 404);
        }

        \Log::info('Successfully retrieved today\'s tasks');
        return response()->json($todayTasks);
    }

    public function getTodayTasksWeekly(Request $request)
    {
        // Validate the input parameters
        $validated = $request->validate([
            'year' => 'required|integer',
            'month' => 'required|integer|between:1,12',
            'week' => 'required|integer|between:1,53'
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $employee = Employee::with('role')
            ->where('user_id', $user->id)
            ->select('id', 'role_id')
            ->first();

        if (!$employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        // Calculate the start and end dates for the specified week
        $firstDayOfMonth = \Carbon\Carbon::create($validated['year'], $validated['month'], 1);
        $date = $firstDayOfMonth->copy()->startOfMonth()->startOfWeek()->addWeeks($validated['week'] - 1);
        $startDate = $date->startOfWeek()->format('Y-m-d');
        $endDate = $date->endOfWeek()->format('Y-m-d');

        $query = FollowUpDetail::where('type', 'Re-Engage the Lead')
            ->where('data', 'LIKE', '%Schedule next follow-up%')
            ->whereIn('is_today_status', ['progress', 'done'])
            ->join('leads', 'follow_up_details.lead_id', '=', 'leads.id')
            ->whereRaw("STR_TO_DATE(
        REGEXP_SUBSTR(
            SUBSTRING_INDEX(follow_up_details.data, 'Schedule next follow-up', -1),
            '[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}'
        ),
        '%m/%d/%Y'
    ) BETWEEN ? AND ?", 
                [$startDate, $endDate]);

        if (!($employee->role && $employee->role->name == 'ADMIN')) {
            $query->where('leads.salesperson_id', $employee->id);
        }

        $tasks = $query->select(
            'follow_up_details.id',
            'leads.unique_query_id as opportunity_id',
            'leads.sender_name as customer_name',
            'query_product_name as product_name',
            'follow_up_details.type as lead_stage',
            'follow_up_details.data as task',
            'follow_up_details.is_today_status as status',
            DB::raw("STR_TO_DATE(REGEXP_SUBSTR(SUBSTRING_INDEX(follow_up_details.data, 'Schedule next follow-up', -1), '[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}'), '%m/%d/%Y') as tat")

        )->get();

        // Group tasks by date
        $groupedTasks = $tasks->groupBy('tat');

        return response()->json($groupedTasks);
    }

    public function getTodayTasksMonthly(Request $request)
    {
        // Validate the input to ensure month and year are provided and are valid.
        $validated = $request->validate([
            'month' => 'required|integer|between:1,12',  // Validates that month is between 1 and 12
            'year' => 'required|integer',      // Validates that year is a 4-digit integer
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $employee = Employee::with('role')
            ->where('user_id', $user->id)
            ->select('id', 'role_id')
            ->first();

        if (!$employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        // Get the start and end date for the given month and year
        $startDate = \Carbon\Carbon::create($validated['year'], $validated['month'], 1)->startOfMonth();
        $endDate = \Carbon\Carbon::create($validated['year'], $validated['month'], 1)->endOfMonth();

        $query = FollowUpDetail::where('type', 'Re-Engage the Lead')
            ->where('data', 'LIKE', '%Schedule next follow-up%')
            ->whereIn('is_today_status', ['progress', 'done'])
            ->join('leads', 'follow_up_details.lead_id', '=', 'leads.id')
            ->whereRaw("STR_TO_DATE(
        REGEXP_SUBSTR(
            SUBSTRING_INDEX(follow_up_details.data, 'Schedule next follow-up', -1),
            '[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}'
        ),
        '%m/%d/%Y'
    ) BETWEEN ? AND ?", 
                [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')]);

        if (!($employee->role && $employee->role->name == 'ADMIN')) {
            $query->where('leads.salesperson_id', $employee->id);
        }

        $tasks = $query->select(
            'follow_up_details.id',
            'leads.unique_query_id as opportunity_id',
            'leads.sender_name as customer_name',
            'query_product_name as product_name',
            'follow_up_details.type as lead_stage',
            'follow_up_details.data as task',
            'follow_up_details.is_today_status as status',
            DB::raw("STR_TO_DATE(REGEXP_SUBSTR(SUBSTRING_INDEX(follow_up_details.data, 'Schedule next follow-up', -1), '[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}'), '%m/%d/%Y') as tat")

        )->get();

        // Group tasks by tat date
        $groupedTasks = [];
        foreach ($tasks as $task) {
            $groupedTasks[$task->tat][] = $task;
        }

        return response()->json($groupedTasks);
    }
    
// Update an existing follow-up
public function update(Request $request, $id)
{
    $request->validate([
        'status' => 'required',
    ]);

    $followUp = FollowUp::findOrFail($id);
    $followUp->update([
        'status' => $request->status,
    ]);

    return response()->json(['message' => 'Follow-up updated successfully', 'followUp' => $followUp]);
}

// Delete a follow-up
public function destroy($id)
{
    $followUp = FollowUp::findOrFail($id);
    $followUp->delete();

    return response()->json(['message' => 'Follow-up deleted successfully']);
}

// Show a specific follow-up
public function show($id)
{
    $followUp = FollowUp::findOrFail($id);
    return response()->json($followUp);
}

public function showAcceptedFollowups(Request $request)
    {
        try {
            $followUp = FollowUpDetail::join('leads', 'follow_up_details.lead_id', '=', 'leads.id')
                ->select('leads.*')
                ->where('follow_up_details.customer_id', $request->customer_id)
                ->where('follow_up_details.status', '1')
                ->get();
          

            if ($followUp->isEmpty()) {
                return response()->json([
                    'message' => 'No accepted followUp found',
                    'data' => []
                ], 200);
            }

            return response()->json([
                'message' => 'Accepted followUp retrieved successfully',
                'data' => $followUp
            ], 200);

        } catch (\Exception $e) {
             Log::error('Error retrieving followUp: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to retrieve followUp',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}

