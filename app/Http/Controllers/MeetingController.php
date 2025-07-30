<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use Illuminate\Http\Request;

class MeetingController extends Controller
{
    public function meeting_store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string',
            'lead_stage' => 'required|string',
            'meeting_agenda' => 'required|string',
            'link' => 'nullable|string',
            'date_time' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'description' => 'nullable|string',
            'status' => 'required|in:progress,done'
        ]);

        $meeting = Meeting::create($validated);

        return response()->json([
            'message' => 'Meeting added successfully',
            'data' => $meeting
        ], 201);
    }

    // public function meeting_done(Request $request)
    // {
    //     $meeting = Meeting::query();
        
    //     // Always filter for status 'done'
    //     $meeting->where('status', 'done');
    
    //     return response()->json($meeting->get());
    // }
    public function meeting_done(Request $request)
    {
        $meeting = Meeting::query();
        
        // Filter for done, postponed, and cancelled status
        $meeting->whereIn('status', ['done', 'postponed', 'cancelled']);
    
        return response()->json($meeting->get());
    }

    public function meeting_progress(Request $request)
    {
        $meeting = Meeting::query();
        
        $meeting->where('status', 'progress');
        return response()->json($meeting->get());
    }


    public function meeting_update(Request $request)
    {
        
           $validated = $request->validate([
            'id' => 'required|exists:meetings,id',
            'customer_name' => 'required|string',
            'lead_stage' => 'required|string',
            'meeting_agenda' => 'required|string',
            'link' => 'nullable|string',
            'date_time' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'description' => 'nullable|string',
            'status' => 'required|in:progress,done'
        ]);
    
        $meeting = Meeting::findOrFail($request->id);
        $meeting->update($validated);
    
        return response()->json(['message' => 'meetings updated successfully', 'data' => $meeting]);
    
    }

    public function meeting_status_update(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|exists:meetings,id',
            'status' => 'required|in:done,cancelled,postponed',
            'reason' => 'required|string'
        ]);

        $meeting = Meeting::findOrFail($request->id);
        $meeting->update([
            'status' => $request->status,
            'reason' => $request->reason
        ]);

        // Map status values for response
        $statusMapping = [
            'done' => 'done',
            'cancelled' => 'cancelled',
            'postponed' => 'postponed'
        ];

        $meeting->status = $statusMapping[$meeting->status];

        return response()->json([
            'message' => 'Meeting status updated successfully',
            'data' => $meeting
        ]);
    }

    public function meeting_delete($id)
    {
        $meeting = Meeting::findOrFail($id);
        $meeting->delete();

        return response()->json([
            'message' => 'Meeting deleted successfully'
        ]);
    }

    public function meeting_monthly(Request $request)
{
    $validated = $request->validate([
        'year' => 'required|integer',
        'month' => 'required|integer|between:1,12'
    ]);

    $meetings = Meeting::whereYear('date_time', $validated['year'])
        ->whereMonth('date_time', $validated['month'])
        ->orderBy('date_time')
        ->get()
        ->groupBy(function($meeting) {
            return date('Y-m-d', strtotime($meeting->date_time));
        });

    return response()->json($meetings);
}

public function meeting_weekly(Request $request)
{
    $validated = $request->validate([
        'year' => 'required|integer',
        'month' => 'required|integer|between:1,12',
        'week' => 'required|integer|between:1,5' // Week number in the month
    ]);

    $date = \Carbon\Carbon::create($validated['year'], $validated['month'], 1);
    $startOfWeek = $date->addWeeks($validated['week'] - 1)->startOfWeek();
    $endOfWeek = $startOfWeek->copy()->endOfWeek();

    $meetings = Meeting::whereBetween('date_time', [$startOfWeek, $endOfWeek])
        ->orderBy('date_time')
        ->get()
        ->groupBy(function($meeting) {
            return date('Y-m-d', strtotime($meeting->date_time));
        });

    return response()->json($meetings);
}
}
