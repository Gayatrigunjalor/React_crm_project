<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use App\Models\Complaint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FeedbackController extends Controller
{
   

public function store(Request $request)
{
    $feedbackId = DB::table('feedbacks')->insertGetId([
        'lead_id'             => $request->lead_id,
        'customer_id'         => $request->customer_id,
        'service_satisfaction'=> $request->service_satisfaction,
        'overall_experience'  => $request->overall_experience,
        'recommend_services'  => $request->recommend_services,
        'met_expectations'    => $request->met_expectations,
        'service_quality'     => $request->service_quality,
        'timely_address'      => $request->timely_address,
        'support_satisfaction'=> $request->support_satisfaction,
        'team_friendliness'   => $request->team_friendliness,
        'felt_heard'          => $request->felt_heard,
        'speed_of_delivery'   => $request->speed_of_delivery,
        'worth_price'         => $request->worth_price,
        'compare_competitors' => $request->compare_competitors,
        'delay_description'   => $request->delay_description,
        'created_at'          => now(),
        'updated_at'          => now(),
    ]);

    // Fetch the newly inserted feedback record
    $feedback = DB::table('feedbacks')->find($feedbackId);

    return response()->json([
        'message' => 'Feedback submitted successfully',
        'data' => $feedback,
    ], 201);
}


public function index(Request $request) {
    // Validate required parameters
    $request->validate([
        'lead_id' => 'required',
        'customer_id' => 'required',
    ]);

    // Retrieve the feedback record by lead_id and customer_id
    $feedback = DB::table('feedbacks')
        ->where('lead_id', $request->lead_id)
        ->where('customer_id', $request->customer_id)
        ->get();

    // Check if feedback exists
    if ($feedback->isEmpty()) {
        return response()->json([
            'message' => 'Feedback not found',
        ], 404);
    }

    return response()->json([
        'message' => 'Feedback retrieved successfully',
        'data' => $feedback,
    ], 200);
} 



    public function complaint(Request $request)
{
    $request->validate([
        'issue_description'   => 'required|string|max:1000',
        'occurred_at'         => 'required|date_format:Y-m-d H:i:s',
        'interaction_point'   => 'required|string|max:255',
        'customer_id'         => 'required|integer|exists:lead_customers,id',
        'lead_id'             => 'required|integer|exists:leads,id',
    ]);

    $complaint = Complaint::create([
        'issue_description' => $request->issue_description,
        'occurred_at'       => $request->occurred_at,
        'interaction_point' => $request->interaction_point,
        'customer_id'       => $request->customer_id,
        'lead_id'           => $request->lead_id,
    ]);

    return response()->json([
        'message' => 'Complaint submitted successfully',
        'data'    => $complaint,
    ], 201);
}

public function complaint_index(Request $request) {
    // Validate required parameters
    $request->validate([
        'lead_id' => 'required',
        'customer_id' => 'required',
    ]);

    // Retrieve the feedback record by lead_id and customer_id
    $feedback = DB::table('complaints')
        ->where('lead_id', $request->lead_id)
        ->where('customer_id', $request->customer_id)
        ->get();

    // Check if feedback exists
    if ($feedback->isEmpty()) {
        return response()->json([
            'message' => 'Complaint not found',
        ], 404);
    }

    return response()->json([
        'message' => 'Complaint  retrieved successfully',
        'data' => $feedback,
    ], 200);
} 

}
