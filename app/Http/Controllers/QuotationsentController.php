<?php

namespace App\Http\Controllers;

use App\Models\Quotation;
use Illuminate\Http\Request;
use App\Models\QuotationSent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class QuotationsentController extends Controller
{
    
        // Store a new quotation
        public function quotation_sent_store(Request $request)
        {
            // Validate and store the new quotation
            $validated = $request->validate([
                'customer_id' => 'required|exists:customers,id',
                'lead_id' => 'required|exists:leads,id',
                'product_name' => 'nullable|',
                'make' => 'nullable|string|max:255',
                'model' => 'nullable|string|max:255',
                'qty' => 'nullable|integer',
                'target_price' => 'nullable|numeric',
                'quoted_price' => 'nullable|numeric',
                'date' => 'nullable|date',
                'status' => 'nullable|string|max:50',
                'pi_number' => 'nullable|string|max:100',
            ]);
    
            // Create the quotation
            $quotation = QuotationSent::create($validated);
            
            if ($request->status == '1') {
                DB::table('price_shareds')
                    ->where('lead_id', $request->lead_id)
                    ->where('customer_id', $request->customer_id)
                    ->update(['status' => '0']);
            }
            // Return a JSON response
            return response()->json([
                'success' => true,
                'message' => 'Quotation created successfully.',
                'data' => $quotation
            ], 201); // Status code 201
        }
    
        // Show a specific quotation
        public function quotation_sent_show(Request $request)
        {
            try {
                // Validate the required fields: customer_id, lead_id, and id
                $validated = $request->validate([
                    'customer_id' => 'required|exists:lead_customers,id',
                    'lead_id' => 'required|exists:leads,id',
                   
                ]);
        
                // Retrieve the quotation based on customer_id, lead_id, and id
                $quotation = QuotationSent::where('customer_id', $request->input('customer_id'))
                    ->where('lead_id', $request->input('lead_id'))
                    ->get(); // Throws ModelNotFoundException if no record is found
        
                // Log the successful retrieval
                Log::info('Quotation retrieved successfully', [
                    'data' => $quotation,
                ]);
        
                // Return success response with the quotation data
                return response()->json([
                    'success' => true,
                    'data' => $quotation
                ], 200); // Status code 200 for success
        
            } catch (\Illuminate\Validation\ValidationException $e) {
                // Log validation errors
                Log::warning('Validation failed for retrieving quotation', [
                    'errors' => $e->errors(),
                    'request_data' => $request->all(),
                ]);
        
                // Return validation error response
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $e->errors(),
                ], 422); // Status code 422 for validation errors
        
            } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
                // Log the not found error
                Log::warning('Quotation not found', [
                    'request_data' => $request->all(),
                    'error' => $e->getMessage(),
                ]);
        
                // Return not found response
                return response()->json([
                    'success' => false,
                    'message' => 'Quotation not found',
                ], 404); // Status code 404 for not found
        
            } catch (\Exception $e) {
                // Log the unexpected error
                Log::error('An error occurred while retrieving the quotation', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
        
                // Return general error response
                return response()->json([
                    'success' => false,
                    'message' => 'An error occurred while retrieving the quotation',
                    'error' => $e->getMessage(),
                ], 500); // Status code 500 for internal server error
            }
        }
        // Get PI number by lead_id and customer_id
        public function get_pi_number(Request $request)
        {
            try {
                // Validate the required fields: customer_id and lead_id
                $validated = $request->validate([
                    'lead_customer_id' => 'required|exists:lead_customers,id',
                    'lead_id' => 'required|exists:leads,id',
                    // 'id' => 'required|exists:quotations,id',
                ]);
        
                // Retrieve the PI number and PI date based on customer_id and lead_id
                $piDetails = Quotation::where('lead_customer_id', $request->input('lead_customer_id'))
                    ->where('lead_id', $request->input('lead_id'))
                    // ->where('id', $request->input('id'))
                    ->select('pi_number', 'pi_date','id')
                    ->first(); // Get the first matching record
        
                if (!$piDetails) {
                    // Log the not found error
                    Log::warning('PI details not found', [
                        'request_data' => $request->all(),
                    ]);
        
                    // Return not found response
                    return response()->json([
                        'success' => false,
                        'message' => 'PI details not found',
                    ], 404); // Status code 404 for not found
                }
        
                // Log the successful retrieval
                Log::info('PI details retrieved successfully', [
                    'pi_details' => $piDetails,
                ]);
        
                // Return success response with the PI details
                return response()->json([
                    'success' => true,
                    'pi_number' => $piDetails->pi_number,
                    'pi_date' => $piDetails->pi_date,
                    'id' => $piDetails->id,
                ], 200); // Status code 200 for success
        
            } catch (\Illuminate\Validation\ValidationException $e) {
                // Log validation errors
                Log::warning('Validation failed for retrieving PI details', [
                    'errors' => $e->errors(),
                    'request_data' => $request->all(),
                ]);
        
                // Return validation error response
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $e->errors(),
                ], 422); // Status code 422 for validation errors
        
            } catch (\Exception $e) {
                // Log the unexpected error
                Log::error('An error occurred while retrieving the PI details', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
        
                // Return general error response
                return response()->json([
                    'success' => false,
                    'message' => 'An error occurred while retrieving the PI details',
                    'error' => $e->getMessage(),
                ], 500); // Status code 500 for internal server error
            }
        }


        public function get_pi_number_all(Request $request)
        {
            try {
                // Retrieve PI number and PI date
                $piDetails = Quotation::select('pi_number', 'pi_date')->get();
        
                // Log the successful retrieval
                Log::info('PI details retrieved successfully', ['pi_details' => $piDetails]);
        
                // Return success response with the PI details
                return response()->json([
                    'success' => true,
                    'data' => $piDetails, // Return all records as an array
                ], 200);
        
            } catch (\Exception $e) {
                // Log unexpected errors
                Log::error('Error retrieving PI details', ['error' => $e->getMessage()]);
        
                return response()->json([
                    'success' => false,
                    'message' => 'Something went wrong, please try again later.',
                ], 500);
            }
        }
        

        public function showAcceptedQuotationSents(Request $request)
    {
        try {
            $quotation = QuotationSent::join('leads', 'quotation_sents.lead_id', '=', 'leads.id')
                ->select('leads.*')
                ->where('quotation_sents.customer_id', $request->customer_id)
                ->where('quotation_sents.status', '1')
                ->get();
          

            if ($quotation->isEmpty()) {
                return response()->json([
                    'message' => 'No accepted quotation found',
                    'data' => []
                ], 200);
            }

            return response()->json([
                'message' => 'Accepted quotation retrieved successfully',
                'data' => $quotation
            ], 200);

        } catch (\Exception $e) {
             Log::error('Error retrieving quotation: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to retrieve quotation',
                'error' => $e->getMessage()
            ], 500);
        }
    }
        
    }
    

