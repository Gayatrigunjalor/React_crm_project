<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use App\Models\ClarityPending;
use App\Models\InquiryReceive;
use App\Models\OpportunityDetail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\QualifiedOpportunity;
use App\Models\Disqualifiedopportunity;


class InquiryReceiveController extends Controller
{
    // Store a new inquiry
    // public function inquiry_recive(Request $request)
    // {
    //     try {
    //         // Validate the incoming request data
    //         $validated = $request->validate([
    //             'customer_id' => 'required|exists:lead_customers,id',
    //             'lead_id' => 'required|exists:leads,id',
    //             'status' => 'nullable|string',
    //             'product' => 'nullable|string',
    //             'model' => 'nullable|string',
    //             'make' => 'nullable|string',
    //             'quantity' => 'nullable|integer',
    //             'target_price' => 'nullable|numeric',
    //             'buying_plan' => 'nullable|string',
    //             'purchase_decision_maker' => 'nullable|string',
    //             'customer_specific_need' => 'nullable|string',
    //             'inorbvict_commitment' => 'nullable|string',
    //             'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:10240', // Validate file upload (JPG, JPEG, PNG, PDF) with max size of 10MB
    //             'message' => 'nullable|string',
    //         ]);
        
    //         // Handle file upload if the attachment is provided
    //         $attachmentPath = null;
    //         if ($request->hasFile('attachment')) {
    //             $file = $request->file('attachment');
    //             // Store the file in the 'attachments' folder in the public disk
    //             $attachmentPath = $file->store('attachments', 'public');
    //         }
        
    //         // Add the file path to the validated data if there's an attachment
    //         $validated['attachment'] = $attachmentPath;
        
    //         // Create a new InquiryReceive record
    //         $inquiry = InquiryReceive::create($validated);
        
    //         // Return response
    //         return response()->json([
    //             'message' => 'Inquiry received successfully',
    //             'inquiry' => $inquiry,
    //         ], 201);
    //     } catch (\Exception $e) {
    //         // Log the exception error message
    //         Log::error('Inquiry receive error: ' . $e->getMessage());
            
    //         // Return a failure response with the error message
    //         return response()->json([
    //             'message' => 'An error occurred while receiving the inquiry.',
    //             'error' => $e->getMessage(),
    //         ], 500);
    //     }
    // }
    
public function inquiry_recive(Request $request)
{
    $request->validate([
        'customer_id' => 'required|exists:lead_customers,id',
        'lead_id' => 'required|exists:leads,id',
        'status' => 'nullable|string|max:255',
        'product' => 'required|array',
        'product.*.product' => 'nullable|string|max:255',
        'product.*.model' => 'nullable|string|max:255',
        'product.*.make' => 'nullable|string|max:255',
        'product.*.quantity' => 'nullable|integer|min:1',
        'product.*.target_price' => 'nullable|string|max:255',
    ]);

    // Create the main InquiryReceive record
   

    // Save each product detail linked to the inquiry
    foreach ($request->product as $product) {
        InquiryReceive::create([
            'customer_id' => $request->customer_id,
            'lead_id' => $request->lead_id,
            'status' => $request->status ?? null,
            'product' => $product['product'] ?? null,
            'model' => $product['model'] ?? null,
            'make' => $product['make'] ?? null,
            'quantity' => $product['quantity'] ?? null,
            'target_price' => $product['target_price'] ?? null,
            'no_of_product_vendor' => $product['no_of_product_vendor'] ?? null,
            'product_code' => $product['product_code'] ?? null,
        ]);
    }

    return response()->json([
        'message' => 'Inquiry received successfully.',
    ], 201);
}


public function updateproduct_directory(Request $request)
{
    try {
        $request->validate([
            'customer_id' => 'required|exists:lead_customers,id',
            'lead_id' => 'required|exists:leads,id',
            'status' => 'nullable|string|max:255',
            'product' => 'required|array',
            'product.*.id' => 'required|exists:inquiry_receives,id', // 'id' is now required for updating
            'product.*.product' => 'nullable|string|max:255',
            'product.*.model' => 'nullable|string|max:255',
            'product.*.make' => 'nullable|string|max:255',
            'product.*.quantity' => 'nullable|integer|min:1',
            'product.*.target_price' => 'nullable|numeric|min:0',
        ]);

        foreach ($request->product as $product) {
            // Update the existing product details if 'id' is provided
            $existingProduct = InquiryReceive::where('customer_id', $request->customer_id)
                ->where('lead_id', $request->lead_id)
                ->find($product['id']);

            if ($existingProduct) {
                $existingProduct->update([
                    'status' => $request->status ?? $existingProduct->status,
                    'product' => $product['product'] ?? $existingProduct->product,
                    'model' => $product['model'] ?? $existingProduct->model,
                    'make' => $product['make'] ?? $existingProduct->make,
                    'quantity' => $product['quantity'] ?? $existingProduct->quantity,
                    'target_price' => $product['target_price'] ?? $existingProduct->target_price,
                ]);
            }
        }

        return response()->json([
            'message' => 'Product details successfully updated.',
        ], 200);
    } catch (\Throwable $e) {
        // Log the error details
        Log::error('Error updating product directory:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'request' => $request->all()
        ]);

        return response()->json([
            'message' => 'An error occurred while updating product details.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

public function updateproduct_directory_id(Request $request)
{
    try {
        // Validate input for a single product
        $request->validate([
            'customer_id' => 'required|exists:lead_customers,id',
            'lead_id' => 'required|exists:leads,id',
            'id' => 'required|exists:inquiry_receives,id', // ID for the specific product
            'status' => 'nullable|string|max:255',
            'product' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'make' => 'nullable|string|max:255',
            'quantity' => 'nullable|integer|min:1',
            'target_price' => 'nullable|string|max:255',
        ]);

        // Find the product by ID
        $existingProduct = InquiryReceive::where('customer_id', $request->customer_id)
            ->where('lead_id', $request->lead_id)
            ->findOrFail($request->id);

        // Update the product details
        $existingProduct->update([
            'status' => $request->status ?? $existingProduct->status,
            'product' => $request->product ?? $existingProduct->product,
            'model' => $request->model ?? $existingProduct->model,
            'make' => $request->make ?? $existingProduct->make,
            'quantity' => $request->quantity ?? $existingProduct->quantity,
            'target_price' => $request->target_price ?? $existingProduct->target_price,
        ]);

        return response()->json([
            'message' => 'Product details successfully updated.',
            'updated_product' => $existingProduct,
        ], 200);
    } catch (\Throwable $e) {
        // Log the error details
        Log::error('Error updating product directory:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'request' => $request->all(),
        ]);

        return response()->json([
            'message' => 'An error occurred while updating the product details.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

public function deleteProduct_directory_id(Request $request)
{
    try {
        // Validate input to ensure required fields are present
        $request->validate([
            'customer_id' => 'required|exists:lead_customers,id',
            'lead_id' => 'required|exists:leads,id',
            'id' => 'required|exists:inquiry_receives,id', // ID for the specific product to delete
        ]);

        // Find the product by ID
        $existingProduct = InquiryReceive::where('customer_id', $request->customer_id)
            ->where('lead_id', $request->lead_id)
            ->findOrFail($request->id);

        // Delete the product
        $existingProduct->delete();

        return response()->json([
            'message' => 'Product successfully deleted.',
        ], 200);
    } catch (\Throwable $e) {
        // Log the error details
        Log::error('Error deleting product from directory:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'request' => $request->all(),
        ]);

        return response()->json([
            'message' => 'An error occurred while deleting the product.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

public function showProductsDirectory(Request $request)
{
    $request->validate([
        'customer_id' => 'required|exists:lead_customers,id',
        'lead_id' => 'required|exists:leads,id',
    ]);

    // Fetch products based on customer_id and lead_id
    $products = InquiryReceive::where('customer_id', $request->customer_id)
        ->where('lead_id', $request->lead_id)
        ->get();

    return response()->json([
        'message' => 'Products fetched successfully.',
        'products' => $products,
    ], 200);
}


// public function storeOpportunityDetails(Request $request)
// {
//     $request->validate([
//         'lead_id' => 'required|exists:leads,id',
//         'cust_id' => 'required|exists:lead_customers,id',
//         'buying_plan' => 'nullable|string|max:255',
//         'attachments' => 'nullable|array',
//         'attachments.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:10240', // Max 10MB per file
//         'name' => 'nullable|string|max:255',
//         'mo_no' => 'nullable|string|max:20',
//         'email' => 'nullable|email|max:255',
//         'customer_specific_need' => 'nullable|string|max:1000',
//         'inorbvict_commitment' => 'nullable|string|max:255',
//         'remark' => 'nullable|string|max:1000',
//         'key_opportunity' => 'nullable|boolean',
//         'extra_chatboat_notes' => 'nullable|string|max:1000',
//         'lead_ack_status' => 'nullable|string|max:255',
//     ]);

//     // Create OpportunityDetail record
//     $opportunity = OpportunityDetail::create([
//         'lead_id' => $request->lead_id,
//         'cust_id' => $request->cust_id,
//         'buying_plan' => $request->buying_plan,
//         'name' => $request->name,
//         'mo_no' => $request->mo_no,
//         'email' => $request->email,
//         'customer_specific_need' => $request->customer_specific_need,
//         'inorbvict_commitment' => $request->inorbvict_commitment,
//         'remark' => $request->remark,
//         'key_opportunity' => $request->key_opportunity ?? 0,
//         'extra_chatboat_notes' => $request->extra_chatboat_notes,
//         'lead_ack_status' => $request->lead_ack_status,
//     ]);

//     // Save attachments
//     if ($request->has('attachments')) {
//         foreach ($request->file('attachments') as $file) {
//             $filePath = $file->store('attachments', 'public'); // Store on public disk
//             $opportunity->attachments()->create([
//                 'file_path' => $filePath,
//             ]);
//         }
//     }

//     return response()->json([
//         'message' => 'Opportunity details successfully added with attachments.',
//         'opportunity' => $opportunity->load('attachments'),
//     ], 201);
// }


public function storeOpportunityDetails(Request $request)
{
    $request->validate([
        'lead_id' => 'required|exists:leads,id',
        'cust_id' => 'required|exists:lead_customers,id',
        'buying_plan' => 'nullable|string|max:255',
        'attachments' => 'nullable|array',
        'attachments.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:10240', // Max 10MB per file
        'name' => 'nullable|string|max:255',
        'mo_no' => 'nullable|string|max:20',
        'email' => 'nullable|email|max:255',
        'customer_specific_need' => 'nullable|string|max:1000',
        'inorbvict_commitment' => 'nullable|string|max:255',
        'remark' => 'nullable|string|max:1000',
        'key_opportunity' => 'nullable|boolean',
        'extra_chatboat_notes' => 'nullable|string|max:1000',
        'lead_ack_status' => 'nullable|string|max:255',
    ]);

    // Check if the record already exists
    $opportunity = OpportunityDetail::where('lead_id', $request->lead_id)
        ->where('cust_id', $request->cust_id)
        ->first();

    if ($opportunity) {
        // Update existing opportunity
        $opportunity->update($request->except(['attachments']));
        $message = 'Opportunity details successfully updated.';
    } else {
        // Create new opportunity
        $opportunity = OpportunityDetail::create($request->except(['attachments']));
        $message = 'Opportunity details successfully added.';
    }

    // Save new attachments
    if ($request->hasFile('attachments')) {
        foreach ($request->file('attachments') as $file) {
            $filePath = $file->store('attachments', 'public');
            $opportunity->attachments()->create([
                'file_path' => $filePath,
            ]);
        }
    }

    return response()->json([
        'message' => $message,
        'opportunity' => $opportunity->load('attachments'),
    ], $opportunity->wasRecentlyCreated ? 201 : 200);
}



public function showOpportunityDetails(Request $request)
{
    // Validate request parameters
    $request->validate([
        'lead_id' => 'required|exists:leads,id',
        'cust_id' => 'required|exists:lead_customers,id',
       
    ]);

    // Fetch the opportunity with the provided parameters
    $opportunity = OpportunityDetail::with('attachments')
        ->where('lead_id', $request->lead_id)
        ->where('cust_id', $request->cust_id)
        ->first();

    // Check if the opportunity exists
    if (!$opportunity) {
        return response()->json([
            'message' => 'Opportunity not found with the specified parameters.',
        ], 404);
    }

    // Return the opportunity details
    return response()->json([
        'message' => 'Opportunity details retrieved successfully.',
        'opportunity' => $opportunity,
    ], 200);
}

public function updateKeyOpportunity(Request $request)
{
    // Validate the incoming request
    $request->validate([
        'id' => 'required|exists:opportunity_details,id',  // Validate if id exists in the opportunity_details table
        'lead_id' => 'required|exists:leads,id',  // Validate if lead_id exists in the leads table
        'cust_id' => 'required|exists:lead_customers,id',  // Validate if cust_id exists in the lead_customers table
        'key_opportunity' => 'nullable|boolean',  // Validate the key_opportunity field
    ]);

    // Find the OpportunityDetail record by id and check if lead_id and cust_id match
    $opportunity = OpportunityDetail::where('id', $request->id)
        ->where('lead_id', $request->lead_id)
        ->where('cust_id', $request->cust_id)
        ->firstOrFail();  // This will throw an exception if no matching record is found

    // Update the key_opportunity field
    $opportunity->update([
        'key_opportunity' => $request->key_opportunity ?? 0,  // Default to 0 if not provided
    ]);

    return response()->json([
        'message' => 'Key opportunity updated successfully.',
        'opportunity' => $opportunity,
    ], 200);
}


public function getKeyOpportunities()
{
    // Get all key opportunities where there is NO deal_won record for the same lead_id and customer_id in victories table
    $opportunities = DB::table('opportunity_details as od')
        ->join('lead_customers as lc', 'od.cust_id', '=', 'lc.id')
        ->join('leads as l', 'l.customer_id', '=', 'lc.id')
        ->leftJoin('victories as v', function($join) {
            $join->on('v.customer_id', '=', 'lc.id')
                 ->on('v.lead_id', '=', 'l.id')
                 ->where('v.deal_won', 1);
        })
        ->select(
            'od.id as opportunity_id',
            'od.cust_id as customer_id',
            'lc.sender_name as customer_name',
            'od.order_value',
            'od.created_at as opportunity_date',
            'od.buying_plan',
            'l.sender_country_iso as country'
        )
        ->where('od.key_opportunity', 1)
        ->whereNull('v.id') // Exclude if deal_won exists
        ->get();

    $data = $opportunities->map(function ($item, $index) {
        return [
            'sr_no' => $index + 1,
            'customer_id' => $item->customer_id,
            'customer_name' => $item->customer_name,
            'opportunity_id' => $item->opportunity_id,
            'order_value' => $item->order_value,
            'opportunity_date' => $item->opportunity_date,
            'buying_plan' => $item->buying_plan,
            'country' => $item->country,
        ];
    });

    return response()->json([
        'status' => true,
        'data' => $data,
    ]);
}



    public function get_deal_won()
    {
        $opportunities = DB::table('opportunity_details as od')
            ->join('lead_customers as lc', 'od.cust_id', '=', 'lc.id')
            ->join('leads as l', 'l.customer_id', '=', 'lc.id')
            ->join('victories as v', function($join) {
                $join->on('v.customer_id', '=', 'lc.id')
                     ->on('v.lead_id', '=', 'l.id');
            })
            ->select(
                'od.id as opportunity_id',
                'od.cust_id as customer_id', 
                'lc.sender_name as customer_name',
                'od.order_value',
                'od.created_at as opportunity_date',
                'od.buying_plan',
                'l.sender_country_iso as country',
                'v.deal_won'
            )
            ->where('od.key_opportunity', 1)
            ->where('v.deal_won', 1)
            ->get();

        $data = $opportunities->map(function ($item, $index) {
            return [
                'sr_no' => $index + 1,
                'customer_id' => $item->customer_id,
                'customer_name' => $item->customer_name, 
                'opportunity_id' => $item->opportunity_id,
                'order_value' => $item->order_value, 
                'opportunity_date' => $item->opportunity_date,
                'buying_plan' => $item->buying_plan,
                'country' => $item->country,
            ];
        });

        return response()->json([
            'status' => true,
            'data' => $data,
        ]);
    }

    public function update_order_value(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'id' => 'required|exists:opportunity_details,id',
                'lead_id' => 'required|exists:leads,id',
                'cust_id' => 'required|exists:lead_customers,id',
                'order_value' => 'required|string|max:255'
            ]);

            // Find and verify the opportunity belongs to the correct lead and customer
            $opportunity = OpportunityDetail::where('id', $request->id)
                ->where('lead_id', $request->lead_id)
                ->where('cust_id', $request->cust_id)
                ->firstOrFail();

            // Update the order value
            $opportunity->update([
                'order_value' => $validated['order_value']
            ]);

            return response()->json([
                'message' => 'Order value updated successfully',
                'data' => $opportunity->fresh()
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Opportunity not found or does not belong to the specified lead and customer',
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update order value',
                'error' => $e->getMessage()
            ], 500);
        }
    }


public function storeCustomerSpecificNeed(Request $request)
{
    $request->validate([
        'customer_specific_need' => 'required',
    ]);

    // Assuming you have the opportunity details record and need to update `customer_specific_need`
    $opportunity = OpportunityDetail::findOrFail($request->id);

    // Update the customer_specific_need field
    $opportunity->update([
        'customer_specific_need' => $request->customer_specific_need,
    ]);

    return response()->json([
        'message' => 'Customer specific need updated successfully.',
        'opportunity' => $opportunity,
    ], 200);
}

public function showCustomerSpecificNeed(Request $request)
{
    $request->validate([
        'opportunity_details_id' => 'required|exists:opportunity_details,id',
    ]);

    // Retrieve the opportunity detail by ID
    $opportunity = OpportunityDetail::findOrFail($request->opportunity_details_id);

    return response()->json([
        'message' => 'Customer specific need fetched successfully.',
        'customer_specific_need' => $opportunity->customer_specific_need,
    ], 200);
}


public function showInorbvictCommitment(Request $request)
{
    $request->validate([
        'opportunity_details_id' => 'required|exists:opportunity_details,id',
    ]);

    // Retrieve the opportunity detail by ID
    $opportunity = OpportunityDetail::findOrFail($request->opportunity_details_id);

    return response()->json([
        'message' => 'Inorbvict Commitment fetched successfully.',
        'inorbvict_commitment' => $opportunity->inorbvict_commitment,
    ], 200);
}

public function showRemark(Request $request)
{
    $request->validate([
        'opportunity_details_id' => 'required|exists:opportunity_details,id',
    ]);

    // Retrieve the opportunity detail by ID
    $opportunity = OpportunityDetail::findOrFail($request->opportunity_details_id);

    return response()->json([
        'message' => 'Remark fetched successfully.',
        'remark' => $opportunity->remark,
    ], 200);
}

public function storeInorbvictCommitment(Request $request)
{
    $request->validate([
        'inorbvict_commitment' => 'required',
    ]);

    // Assuming you have the opportunity details record and need to update `customer_specific_need`
    $opportunity = OpportunityDetail::findOrFail($request->id);

    // Update the customer_specific_need field
    $opportunity->update([
        'inorbvict_commitment' => $request->inorbvict_commitment,
    ]);

    return response()->json([
        'message' => 'Inorbvict_commitment updated successfully.',
        'opportunity' => $opportunity,
    ], 200);
}


public function storeRemark(Request $request)
{
    $request->validate([
        'remark' => 'required',
    ]);

    // Assuming you have the opportunity details record and need to update `customer_specific_need`
    $opportunity = OpportunityDetail::findOrFail($request->id);

    // Update the customer_specific_need field
    $opportunity->update([
        'remark' => $request->remark,
    ]);

    return response()->json([
        'message' => 'Remark updated successfully.',
        'opportunity' => $opportunity,
    ], 200);
}


    public function getClarityPendingGroupedByStatusMode()
    {
        try {
            // Retrieve clarity_pending records grouped by status_mode, include id in the group
            $clarityPendingGrouped = ClarityPending::select('status_mode', \DB::raw('GROUP_CONCAT(id, \':\', clarity_pending SEPARATOR "|") as clarity_list'))
                ->groupBy('status_mode')
                ->get()
                ->map(function ($item) {
                    // Split clarity_list into an array and separate id and clarity_pending
                    $item->clarity_list = array_map(function ($value) {
                        // Split each entry by ':' to separate id and clarity_pending
                        list($id, $clarity_pending) = explode(':', $value);
                        return ['id' => $id, 'clarity_pending' => $clarity_pending];
                    }, explode('|', $item->clarity_list));
                    return $item;
                });
    
            return response()->json([
                'message' => 'Clarity pending records grouped by status_mode retrieved successfully.',
                'data' => $clarityPendingGrouped,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve clarity pending records.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    
    
    


    public function getQualifiedOpportunities()
    {
        try {
            // Fetch only the 'qualified_opportunity' column
            $opportunities = QualifiedOpportunity::select('id','qualified_opportunity')->get();
    
            // Return response in JSON format
            return response()->json([
                'message' => 'Qualified opportunities retrieved successfully.',
                'data' => $opportunities,
            ], 200);
        } catch (\Exception $e) {
            // Handle any exceptions
            return response()->json([
                'message' => 'Failed to retrieve qualified opportunities.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function disqualifiedopportunities()
    {
        try {
            // Fetch only the 'qualified_opportunity' column
            $opportunities = Disqualifiedopportunity::select('id','disqualified_opportunity')->get();
    
            // Return response in JSON format
            return response()->json([
                'message' => 'Diqualified opportunities retrieved successfully.',
                'data' => $opportunities,
            ], 200);
        } catch (\Exception $e) {
            // Handle any exceptions
            return response()->json([
                'message' => 'Failed to retrieve qualified opportunities.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
   
    public function storeQualifiedOpportunity(Request $request)
    {
        try {
            // Validate the request
            $request->validate([
                'qualified_opportunity' => 'required|string',
            ]);
    
            // Create a new record
            $opportunity = QualifiedOpportunity::create([
                'qualified_opportunity' => $request->qualified_opportunity,
            ]);
    
            // Return success response
            return response()->json([
                'message' => 'Qualified opportunity created successfully.',
                'data' => $opportunity,
            ], 201);
        } catch (\Exception $e) {
            // Handle errors
            return response()->json([
                'message' => 'Failed to create qualified opportunity.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function storeDisqualifiedOpportunity(Request $request)
{
    try {
        // Validate the request
        $request->validate([
            'disqualified_opportunity' => 'required|string',
        ]);

        // Create a new record
        $opportunity = Disqualifiedopportunity::create([
            'disqualified_opportunity' => $request->disqualified_opportunity,
        ]);

        // Return success response
        return response()->json([
            'message' => 'Disqualified opportunity created successfully.',
            'data' => $opportunity,
        ], 201);
    } catch (\Exception $e) {
        // Handle errors
        return response()->json([
            'message' => 'Failed to create disqualified opportunity.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

public function storeClarityPending(Request $request)
{
    try {
        // Validate the request
        $request->validate([
            'status_mode' => 'required|string',
            'clarity_pending' => 'required|string',
        ]);

        // Create a new clarity pending record
        $clarityPending = ClarityPending::create([
            'status_mode' => $request->status_mode,
            'clarity_pending' => $request->clarity_pending,
        ]);

        // Return success response
        return response()->json([
            'message' => 'Clarity pending record created successfully.',
            'data' => $clarityPending,
        ], 201);
    } catch (\Exception $e) {
        // Handle errors
        return response()->json([
            'message' => 'Failed to create clarity pending record.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

public function updateQualifiedOpportunity(Request $request)
{
    try {
        // Validate request
        $request->validate([
            'id' => 'required|integer|exists:qualified_opportunities,id',
            'qualified_opportunity' => 'required|string',
        ]);

        // Find the record
        $opportunity = QualifiedOpportunity::findOrFail($request->id);

        // Update the record
        $opportunity->update([
            'qualified_opportunity' => $request->qualified_opportunity,
        ]);

        return response()->json([
            'message' => 'Qualified opportunity updated successfully.',
            'data' => $opportunity,
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to update qualified opportunity.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

public function updateDisqualifiedOpportunity(Request $request)
{
    try {
        $request->validate([
            'id' => 'required|integer|exists:disqualified_opportunities,id',
            'disqualified_opportunity' => 'required|string',
        ]);

        $opportunity = DisqualifiedOpportunity::findOrFail($request->id);

        $opportunity->update([
            'disqualified_opportunity' => $request->disqualified_opportunity,
        ]);

        return response()->json([
            'message' => 'Disqualified opportunity updated successfully.',
            'data' => $opportunity,
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to update disqualified opportunity.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

public function updateClarityPending(Request $request)
{
    try {
        $request->validate([
            'id' => 'required|integer|exists:clarity_pending,id',
            'status_mode' => 'required|string',
            'clarity_pending' => 'required|string',
        ]);

        $clarityPending = ClarityPending::findOrFail($request->id);

        $clarityPending->update([
            'status_mode' => $request->status_mode,
            'clarity_pending' => $request->clarity_pending,
        ]);

        return response()->json([
            'message' => 'Clarity pending record updated successfully.',
            'data' => $clarityPending,
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to update clarity pending record.',
            'error' => $e->getMessage(),
        ], 500);
    }
}


public function deleteQualifiedOpportunity(Request $request)
{
    try {
        $request->validate([
            'id' => 'required|integer|exists:qualified_opportunities,id',
        ]);

        $opportunity = QualifiedOpportunity::findOrFail($request->id);
        $opportunity->delete();

        return response()->json([
            'message' => 'Qualified opportunity deleted successfully.',
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to delete qualified opportunity.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

public function deleteDisqualifiedOpportunity(Request $request)
{
    try {
        $request->validate([
            'id' => 'required|integer|exists:disqualified_opportunities,id',
        ]);

        $opportunity = DisqualifiedOpportunity::findOrFail($request->id);
        $opportunity->delete();

        return response()->json([
            'message' => 'Disqualified opportunity deleted successfully.',
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to delete disqualified opportunity.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

public function deleteClarityPending(Request $request)
{
    try {
        $request->validate([
            'id' => 'required|integer|exists:clarity_pending,id',
        ]);

        $clarityPending = ClarityPending::findOrFail($request->id);
        $clarityPending->delete();

        return response()->json([
            'message' => 'Clarity pending record deleted successfully.',
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to delete clarity pending record.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

   
    // Get all inquiries
    public function index()
    {
        $inquiries = InquiryReceive::all();
        return response()->json($inquiries);
    }

   
    public function show($id)
    {
        $inquiry = InquiryReceive::find($id);

        if (!$inquiry) {
            return response()->json(['message' => 'Inquiry not found'], 404);
        }

        return response()->json($inquiry);
    }

   
    public function update(Request $request, $id)
    {
        $inquiry = InquiryReceive::find($id);

        if (!$inquiry) {
            return response()->json(['message' => 'Inquiry not found'], 404);
        }

       
        $validated = $request->validate([
            'status' => 'nullable|string',
            'product' => 'nullable|string',
            'model' => 'nullable|string',
            'make' => 'nullable|string',
            'quantity' => 'nullable|integer',
            'target_price' => 'nullable|numeric',
            'buying_plan' => 'nullable|string',
            'purchase_decision_maker' => 'nullable|string',
            'customer_specific_need' => 'nullable|string',
            'inorbvict_commitment' => 'nullable|string',
            'attachment' => 'nullable|string',
            'message' => 'nullable|string',
        ]);

        
        $inquiry->update($validated);

        return response()->json([
            'message' => 'Inquiry updated successfully',
            'inquiry' => $inquiry,
        ]);
    }

   
    public function destroy($id)
    {
        $inquiry = InquiryReceive::find($id);

        if (!$inquiry) {
            return response()->json(['message' => 'Inquiry not found'], 404);
        }

       
        $inquiry->delete();

        return response()->json(['message' => 'Inquiry deleted successfully']);
    }


    public function showAcceptedInquiries(Request $request)
    {
        try {
            $inquiries = InquiryReceive::join('leads', 'inquiry_receives.lead_id', '=', 'leads.id')
                ->select('leads.*')
                ->where('inquiry_receives.customer_id', $request->customer_id)
                ->where('inquiry_receives.status', '1')
                ->get();
          

            if ($inquiries->isEmpty()) {
                return response()->json([
                    'message' => 'No accepted inquiries found',
                    'data' => []
                ], 200);
            }

            return response()->json([
                'message' => 'Accepted inquiries retrieved successfully',
                'data' => $inquiries
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error retrieving accepted inquiries: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to retrieve accepted inquiries',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
