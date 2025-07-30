<?php

namespace App\Http\Controllers;

use App\Models\Victory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VictoryController extends Controller
{
    public function deal_won(Request $request)
    {
        $validated = $request->validate([
            'deal_won' => 'required|boolean',
            'lead_id' => 'required|exists:leads,id',
            'customer_id' => 'required|exists:lead_customers,id',
            'status' => 'required|boolean',
        ]);

        $victory = Victory::create($validated);

        if ($request->status == '1') {
            DB::table('follow_up_details')
                ->where('lead_id', $request->lead_id)
                ->where('customer_id', $request->customer_id)
                ->update(['status' => '0']);
        }

        return response()->json(['message' => 'Victory stored successfully', 'victory' => $victory], 201);
    }

    public function isDealWon(Request $request)
    {
        try {
            $victory = Victory::where('lead_id', $request->lead_id)
                ->where('customer_id', $request->customer_id)
                ->where('status', '1')
                ->first();

            return response()->json([
                'isDealWon' => !is_null($victory),
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error checking deal status: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to check deal status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function showAcceptedVictories(Request $request)
    {
        try {
            $victory = Victory::join('leads', 'victories.lead_id', '=', 'leads.id')
                ->select('leads.*')
                ->where('victories.customer_id', $request->customer_id)
                ->where('victories.status', '1')
                ->get();
          

            if ($victory->isEmpty()) {
                return response()->json([
                    'message' => 'No accepted victory found',
                    'data' => []
                ], 200);
            }

            return response()->json([
                'message' => 'Accepted victory retrieved successfully',
                'data' => $victory
            ], 200);

        } catch (\Exception $e) {
             Log::error('Error retrieving victory: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to retrieve victory',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}

