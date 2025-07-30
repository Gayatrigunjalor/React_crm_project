<?php

namespace App\Http\Controllers;

use App\Models\Procurement;
use Illuminate\Http\Request;
use App\Models\ProductSourcing;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProductSourcingController extends Controller
{
    public function store(Request $request)
    {
        try {
            // Validation rules
            $validated = $request->validate([
                'prodId' => 'nullable|integer',
                'customer_id' => 'required|exists:lead_customers,id',
                'lead_id' => 'required|exists:leads,id',
                'product_sourcing' => 'nullable|in:yes,no',
                'product_name' => 'nullable|string',
                'make' => 'nullable|string', 
                'model' => 'nullable|string',
                'quantity' => 'nullable|integer',
                'target_price' => 'nullable',
                'product_code' => 'nullable',
                'procurement_id' => 'nullable',
                'no_of_product_vendor'=> 'nullable',
                'status' => 'nullable|string',
            ]);

            // Store the data
            $productSourcing = ProductSourcing::create($validated);

            // Log the successful creation
            Log::info('Product sourcing created successfully', ['data' => $productSourcing]);

            // Update lead_acknowledgments if status is 1
            if ($request->status == '1') {
                DB::table('lead_acknowledgments')
                    ->where('lead_id', $request->lead_id)
                    ->where('customer_id', $request->customer_id)
                    ->update(['status' => '0']);
            }

            // Update inquiry_receives table with status
            DB::table('inquiry_receives')
                ->where('id', $request->prodId)
                ->update(['isRequired' => $request->status]);

            // Return success response
            return response()->json([
                'success' => true,
                'message' => 'Product sourcing created successfully',
                'data' => $productSourcing,
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Log validation errors
            Log::warning('Validation failed for creating product sourcing', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            // Log unexpected errors
            Log::error('An error occurred while creating product sourcing', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating product sourcing',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show_product_sourcing(Request $request)
    {
        try {
            // Validate the input parameters
            $validated = $request->validate([
                'customer_id' => 'required|exists:lead_customers,id',
                'lead_id' => 'required|exists:leads,id',
            ]);

            // Retrieve the ProductSourcing record with procurement data
            $productSourcing = ProductSourcing::select(
                    'product_sourcings.*', 
                    'procurements.proc_number', 
                    'procurements.product_service_name as proc_product_service_name', 
                    'procurements.description as proc_description', 
                    'procurements.target_cost as proc_target_cost', 
                    'procurements.tat', 
                    'procurements.status as procurement_status',
                    'procurement_products.product_service_name as pp_product_service_name',
                    'procurement_products.description as pp_description',
                    'procurement_products.target_cost as pp_target_cost',
                    'procurement_products.quantity as pp_quantity'
                )
                ->leftJoin('procurement_products', function($join) {
                    $join->on('procurement_products.proc_prod_id', '=', DB::raw('CAST(product_sourcings.id as CHAR)'));
                })
                ->leftJoin('procurements', function($join) {
                    $join->on('procurements.id', '=', 'procurement_products.procurement_id')
                        ->on('procurements.lead_id', '=', 'product_sourcings.lead_id')
                        ->on('procurements.lead_customer_id', '=', 'product_sourcings.customer_id');
                })
                ->where('product_sourcings.customer_id', $validated['customer_id'])
                ->where('product_sourcings.lead_id', $validated['lead_id'])
                ->get();

            // Log the successful retrieval
            Log::info('Product sourcing with procurement data retrieved successfully', [
                'customer_id' => $validated['customer_id'], 
                'lead_id' => $validated['lead_id']
            ]);

            // Return success response
            return response()->json([
                'success' => true,
                'message' => 'Product sourcing retrieved successfully',
                'data' => $productSourcing,
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Log validation errors
            Log::warning('Validation failed for retrieving product sourcing', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            // Log unexpected errors
            Log::error('An error occurred while retrieving product sourcing', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while retrieving product sourcing',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    public function updateProductCode(Request $request)
    {
        try {
            // Validate the input parameters
            $validated = $request->validate([
                'id' => 'required|exists:product_sourcings,id',
                'lead_id' => 'required|exists:leads,id', 
                'customer_id' => 'required|exists:lead_customers,id',
                'product_code' => 'required|string',
                'no_of_product_vendor' => 'required|integer',
            ]);

            // Check if product sourcing exists with given ID
            $exists = ProductSourcing::where('id', $validated['id'])->exists();
            
            if (!$exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please select valid product',
                ], 404);
            }

            // Update the product code
            $productSourcing = ProductSourcing::where('id', $validated['id'])
                ->where('lead_id', $validated['lead_id'])
                ->where('customer_id', $validated['customer_id'])
                ->update([
                    'product_code' => $validated['product_code'],
                    'no_of_product_vendor' => $validated['no_of_product_vendor']
                ]);

            if (!$productSourcing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product sourcing record not found',
                ], 404);
            }

            // Log the successful update
            Log::info('Product code updated successfully', [
                'id' => $validated['id'],
                'lead_id' => $validated['lead_id'],
                'customer_id' => $validated['customer_id']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Product code updated successfully'
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Validation failed for updating product code', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Error updating product code', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating product code',
                'error' => $e->getMessage()
            ], 500);
        }
    }

public function procurement_show(Request $request)
{
   
    // Validate request parameters
    $request->validate([
        'lead_id' => 'required|exists:leads,id',
        'lead_customer_id' => 'required|exists:lead_customers,id',
    ]);

    // Fetch the procurement record with additional filters
    $procurement = Procurement::select('id', 'proc_number', 'product_service_name', 'description', 'target_cost', 'tat', 'status', 'assignee_name')
        ->with(['assignee:id,name', 'uploads:id,procurement_id,name'])
        ->where('lead_id', $request->lead_id)
        ->where('lead_customer_id', $request->lead_customer_id)
        ->get();

    // Check if the procurement record exists
    if (!$procurement) {
        return response()->json([
            'message' => 'Procurement not found with the specified parameters.'
        ], 404);
    }

    // Return the procurement details
    return response()->json($procurement, 200);
}

public function getProductPriceDetails(Request $request)
{
    try {
        // Validate request parameters
        $validated = $request->validate([
            'customer_id' => 'required|exists:lead_customers,id',
            'lead_id' => 'required|exists:leads,id',
        ]);

        $results = DB::table('product_sourcings as ps')
            ->select(
                'ps.product_name',
                'ps.product_code',
                'ps.no_of_product_vendor',
                'ps.customer_id',
                'ps.lead_id',
                'psh.quoted_price',
                'psh.currency',
                'psh.updated_at as price_shared_date'
            )
            ->leftJoin('price_shareds as psh', function($join) {
                $join->on('ps.customer_id', '=', 'psh.customer_id')
                     ->on('ps.lead_id', '=', 'psh.lead_id');
            })
            ->where('ps.customer_id', $validated['customer_id'])
            ->where('ps.lead_id', $validated['lead_id'])
            ->get();

        if ($results->isEmpty()) {
            Log::info('No product price details found', [
                'customer_id' => $validated['customer_id'],
                'lead_id' => $validated['lead_id']
            ]);

            return response()->json([
                'success' => false,
                'message' => 'No records found',
                'data' => []
            ], 404);
        }

        Log::info('Product price details fetched successfully', [
            'customer_id' => $validated['customer_id'],
            'lead_id' => $validated['lead_id'],
            'count' => $results->count()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product price details fetched successfully',
            'data' => $results
        ], 200);

    } catch (\Illuminate\Validation\ValidationException $e) {
        Log::warning('Validation failed for product price details', [
            'errors' => $e->errors(),
            'request_data' => $request->all()
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $e->errors()
        ], 422);

    } catch (\Exception $e) {
        Log::error('Error fetching product price details', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'request_data' => $request->all()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Error fetching product price details',
            'error' => $e->getMessage()
        ], 500);
    }
}

public function showAcceptedProductSourcings(Request $request)
    {
        try {
            $productSourcing = ProductSourcing::join('leads', 'product_sourcings.lead_id', '=', 'leads.id')
                ->select('leads.*')
                ->where('product_sourcings.customer_id', $request->customer_id)
                ->where('product_sourcings.status', '1')
                ->get();
          

            if ($productSourcing->isEmpty()) {
                return response()->json([
                    'message' => 'No accepted Product Sourcings found',
                    'data' => []
                ], 200);
            }

            return response()->json([
                'message' => 'Accepted productSourcing retrieved successfully',
                'data' => $productSourcing
            ], 200);

        } catch (\Exception $e) {
             Log::error('Error retrieving productSourcing: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to retrieve productSourcing',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
