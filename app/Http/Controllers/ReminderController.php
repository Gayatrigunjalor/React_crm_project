<?php

namespace App\Http\Controllers;

use App\Models\Reminder;
use Illuminate\Http\Request;

class ReminderController extends Controller
{

    public function reminder_done(Request $request)
    {
        $reminders = Reminder::query();
        
        // Always filter for status 'done'
        $reminders->where('status', 'done');
    
        return response()->json($reminders->get());
    }


    public function reminder_progress(Request $request)
    {
        $reminders = Reminder::query();
        
        $reminders->where('status', 'progress');
        return response()->json($reminders->get());
    }

    public function reminder_store(Request $request)
{
    $validated = $request->validate([
        'subject' => 'required|string|max:255',
        'description' => 'nullable|string',
        'tat_date' => 'required|date',
        'status' => 'nullable|string|in:progress,done',
    ]);

    $reminder = Reminder::create($validated);

    return response()->json(['message' => 'Reminder created successfully', 'data' => $reminder]);
}


public function reminder_destroy(Request $request)
{
    $validated = $request->validate([
        'id' => 'required|exists:reminders,id'
    ]);

    $reminder = Reminder::findOrFail($request->id);
    $reminder->delete();
    
    return response()->json(['message' => 'Reminder deleted successfully']);
}

public function reminder_update(Request $request)
{
    $validated = $request->validate([
        'id' => 'required|exists:reminders,id',
        'subject' => 'required|string|max:255',
        'description' => 'nullable|string',
        'tat_date' => 'required|date',
        'status' => 'nullable|string|in:progress,done',
    ]);

    $reminder = Reminder::findOrFail($request->id);
    $reminder->update($validated);

    return response()->json(['message' => 'Reminder updated successfully', 'data' => $reminder]);
}

public function reminder_monthly(Request $request)
{
    $validated = $request->validate([
        'year' => 'required|integer',
        'month' => 'required|integer|between:1,12'
    ]);

    $reminders = Reminder::whereYear('tat_date', $validated['year'])
        ->whereMonth('tat_date', $validated['month'])
        ->orderBy('tat_date')
        ->get()
        ->groupBy(function($reminder) {
            return date('Y-m-d', strtotime($reminder->tat_date));
        });

    return response()->json($reminders);
}

public function reminder_weekly(Request $request)
{
    $validated = $request->validate([
        'year' => 'required|integer',
        'month' => 'required|integer|between:1,12',
        'week' => 'required|integer|between:1,5' // Week number in the month
    ]);

    $date = \Carbon\Carbon::create($validated['year'], $validated['month'], 1);
    $startOfWeek = $date->addWeeks($validated['week'] - 1)->startOfWeek();
    $endOfWeek = $startOfWeek->copy()->endOfWeek();

    $reminders = Reminder::whereBetween('tat_date', [$startOfWeek, $endOfWeek])
        ->orderBy('tat_date')
        ->get()
        ->groupBy(function($reminder) {
            return date('Y-m-d', strtotime($reminder->tat_date));
        });

    return response()->json($reminders);
}


}
