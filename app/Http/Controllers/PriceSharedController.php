<?php

namespace App\Http\Controllers;

use App\Models\PriceShared;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PriceSharedController extends Controller
{
    public function store(Request $request)
    {
        try {
            // Validation rules
            $validated = $request->validate([
                'customer_id' => 'required|exists:lead_customers,id',
                'lead_id' => 'required|exists:leads,id',
                'status' => 'nullable|string',
                'product' => 'nullable|string',
                'model' => 'nullable|string',
                'make' => 'nullable|string',
                'quantity' => 'nullable|integer',
                'target_price' => 'nullable',
                'quoted_price' => 'nullable|integer',
                'currency' => 'nullable',
            ]);

            // Store the data
            $priceShared = PriceShared::create($validated);

            // Log the successful creation
            Log::info('Price shared record created successfully', [
                'data' => $priceShared,
             
            ]);

            if ($request->status == '1') {
                DB::table('product_sourcings')
                    ->where('lead_id', $request->lead_id)
                    ->where('customer_id', $request->customer_id)
                    ->update(['status' => '0']);
            }
            // Return success response
            return response()->json([
                'success' => true,
                'message' => 'Price shared record created successfully',
                'data' => $priceShared,
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Log validation errors
            Log::warning('Validation failed for creating price shared record', [
                'errors' => $e->errors(),
                'request_data' => $request->all(),
            ]);

            // Return validation error response
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            // Log the unexpected error
            Log::error('An error occurred while creating price shared record', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
            ]);

            // Return general error response
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating the price shared record',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

   public function price_shared_show(Request $request)
{
    try {
        // Validate the required fields (Remove 'id' validation)
        $validated = $request->validate([
            'customer_id' => 'required|exists:lead_customers,id',
            'lead_id' => 'required|exists:leads,id',
        ]);

        // Retrieve the price shared record using customer_id and lead_id
        $priceShared = PriceShared::where('customer_id', $request->input('customer_id'))
            ->where('lead_id', $request->input('lead_id'))
            ->get(); // This will throw an exception if no record is found

        // Log the successful retrieval
        Log::info('Price shared record retrieved successfully', [
            'data' => $priceShared,
        ]);

        // Return success response with the data
        return response()->json([
            'success' => true,
            'message' => 'Price shared record retrieved successfully',
            'data' => $priceShared,
        ], 200);

    } catch (\Illuminate\Validation\ValidationException $e) {
        // Log validation errors
        Log::warning('Validation failed for retrieving price shared record', [
            'errors' => $e->errors(),
            'request_data' => $request->all(),
        ]);

        // Return validation error response
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $e->errors(),
        ], 422);

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        // Log the not found error
        Log::warning('Price shared record not found', [
            'request_data' => $request->all(),
            'error' => $e->getMessage(),
        ]);

        // Return record not found response
        return response()->json([
            'success' => false,
            'message' => 'Price shared record not found',
        ], 404);

    } catch (\Exception $e) {
        // Log the unexpected error
        Log::error('An error occurred while retrieving price shared record', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        // Return general error response
        return response()->json([
            'success' => false,
            'message' => 'An error occurred while retrieving the price shared record',
            'error' => $e->getMessage(),
        ], 500);
    }
}



public function showAcceptedPriceShareds(Request $request)
    {
        try {
            $priceShared = PriceShared::join('leads', 'price_shareds.lead_id', '=', 'leads.id')
                ->select('leads.*')
                ->where('price_shareds.customer_id', $request->customer_id)
                ->where('price_shareds.status', '1')
                ->get();
          

            if ($priceShared->isEmpty()) {
                return response()->json([
                    'message' => 'No accepted priceShared found',
                    'data' => []
                ], 200);
            }

            return response()->json([
                'message' => 'Accepted priceShared retrieved successfully',
                'data' => $priceShared
            ], 200);

        } catch (\Exception $e) {
             Log::error('Error retrieving ppriceShared: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to retrieve ppriceShared',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    

    public function destroy(Request $request)
    {
        try {
            $validated = $request->validate([
                'id' => 'required|exists:price_shareds,id'
            ]);

            $priceShared = PriceShared::findOrFail($request->id);
            $priceShared->delete();

            Log::info('Price shared record deleted successfully', ['id' => $request->id]);

            return response()->json([
                'success' => true,
                'message' => 'Price shared record deleted successfully'
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Validation failed for deleting price shared record', [
                'errors' => $e->errors()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Price shared record not found for deletion', ['id' => $request->id]);
            
            return response()->json([
                'success' => false,
                'message' => 'Price shared record not found'
            ], 404);

        } catch (\Exception $e) {
            Log::error('Error deleting price shared record', [
                'id' => $request->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting the price shared record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}


