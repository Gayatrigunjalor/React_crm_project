<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductConditionsRequest;
use App\Models\Product;
use App\Models\ProductCondition;
use App\Models\ProcurementVendor;

class ProductConditionController extends Controller
{
    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $this->authorize('product_condition_list');
        $rows = ProductCondition::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function productConditionListing()
    {
        $rows = ProductCondition::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @param \App\Http\Requests\ProductConditionsRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(ProductConditionsRequest $request)
    {
        $this->authorize('product_condition_create');
        if (ProductCondition::create(['name' => $request->name])) {
            return response()->json(['success' => true, 'message' => 'Product condition saved successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $this->authorize('product_condition_edit');
        $productType = ProductCondition::select('id', 'name')->find($id);
        if($productType) {
            return response()->json($productType);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find product condition'], 422);
        }
    }

    /**
     * @param \App\Http\Requests\ProductConditionsRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(ProductConditionsRequest $request, $id)
    {
        $this->authorize('product_condition_edit');
        if (ProductCondition::find($id)->update(['name' => $request->name])) {
            return response()->json(['success' => true, 'message' => 'Product condition updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse|void
     */
    public function destroy($id)
    {
        $this->authorize('product_condition_delete');
        $procurementVendorCount = 0;
        // $procurementVendorCount = ProcurementVendor::where('product_condition_id', $id)->count();
        $productCount = Product::where('product_condition_id', $id)->count();
        if($procurementVendorCount > 0 || $productCount > 0) {
                if($procurementVendorCount > 0){
                    $message = 'Product condition cannot be removed as it is used in Procurement Vendor\'s record.';
                }
                if($productCount > 0) {
                    $message .= ' Product condition cannot be removed as it is used in Product\'s record.';
                }
            return response()->json(['success' => false, 'message' => $message], 422);
        } else {
            if (ProductCondition::find($id)->delete()) {
                return response()->json(['success' => true, 'message' => 'Product condition deleted successfully'], 200);
            } else {
                return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
            }
        }
    }
}
