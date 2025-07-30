<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ClarityPending;
use Illuminate\Http\JsonResponse;
use App\Models\LeadAcknowledgment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\QualifiedOpportunity;
use App\Models\Disqualifiedopportunity;

class LeadAcknowledgmentController extends Controller
{
    public function Lead_Acknowledgment(Request $request)
    {
        // Validation rules
        $validated = $request->validate([
            'customer_id' => 'required|exists:lead_customers,id',
            'lead_id' => 'required|exists:leads,id',
            'qualified' => 'nullable|string',
            'disqualified' => 'nullable|string',
            'clarity_pending' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        // Store the data
        $leadAcknowledgment = LeadAcknowledgment::create($validated);

        // Update inquiry_receive status if status is 1
        if ($request->status == '1') {
            DB::table('inquiry_receives')
                ->where('lead_id', $request->lead_id)
                ->where('customer_id', $request->customer_id)
                ->update(['status' => '0']);
        }

        // Return response
        return response()->json([
            'success' => true,
            'message' => 'Lead acknowledgment created successfully',
            'data' => $leadAcknowledgment,
        ], 201);
    }

    public function leadAcknowledgment_show(Request $request): JsonResponse
    {
        try {
            // Validate incoming request parameters
            $request->validate([
                'lead_id' => 'required|exists:leads,id',
                'customer_id' => 'required|exists:lead_customers,id',
            ]);
    
            // Fetch Lead Acknowledgments filtered by lead_id and customer_id
            $data = LeadAcknowledgment::where('lead_id', $request->lead_id)
                ->where('customer_id', $request->customer_id)
                ->get();
    
            // Transform each acknowledgment and load related data conditionally
            $data->transform(function ($item) {
                // Load qualified data if 'qualified' is not empty
                $item->qualified_data = !empty($item->qualified)
                    ? QualifiedOpportunity::whereIn('id', $item->qualified_ids)->get()
                    : [];
    
                // Load clarity pending data if 'clarity_pending' is not empty
                $item->clarity_pending_data = !empty($item->clarity_pending)
                    ? ClarityPending::whereIn('id', $item->clarity_pending_ids)->get()
                    : [];
    
                // Load disqualified data if 'disqualified' is not empty
                $item->disqualified_data = !empty($item->disqualified)
                    ? DisqualifiedOpportunity::whereIn('id', $item->disqualified_ids)->get()
                    : [];
    
                return $item;
            });
    
            // Return success response
            return response()->json([
                'success' => true,
                'message' => 'Lead acknowledgments retrieved successfully.',
                'data' => $data
            ], 200);
    
        } catch (\Exception $e) {
            // Log error and return error response
            \Log::error('Error in leadAcknowledgment_show: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while retrieving lead acknowledgments.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    

    public function showAcceptedLeadAcknowledgment(Request $request)
    {
        try {
            $leadAcknowledgment = LeadAcknowledgment::join('leads', 'lead_acknowledgments.lead_id', '=', 'leads.id')
                ->select('leads.*')
                ->where('lead_acknowledgments.customer_id', $request->customer_id)
                ->where('lead_acknowledgments.status', '1')
                ->get();
          

            if ($leadAcknowledgment->isEmpty()) {
                return response()->json([
                    'message' => 'No accepted inquiries found',
                    'data' => []
                ], 200);
            }

            return response()->json([
                'message' => 'Accepted lead_acknowledgments retrieved successfully',
                'data' => $leadAcknowledgment
            ], 200);

        } catch (\Exception $e) {
             Log::error('Error retrieving lead_acknowledgments: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to retrieve lead_acknowledgments',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
