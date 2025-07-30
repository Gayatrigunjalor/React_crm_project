<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductTypeRequest;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProcurementVendor;

class ProductTypeController extends Controller
{
    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $this->authorize('product_type_list');
        $rows = ProductType::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function productTypeListing()
    {
        $rows = ProductType::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @param \App\Http\Requests\ProductTypeRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(ProductTypeRequest $request)
    {
        $this->authorize('product_type_create');
        if (ProductType::create(['name' => $request->name])) {
            return response()->json(['success' => true, 'message' => 'Product type saved successfully'], 200);
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
        $this->authorize('product_type_edit');
        $productType = ProductType::select('id', 'name')->find($id);
        if($productType) {
            return response()->json($productType);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find product type'], 422);
        }
    }

    /**
     * @param \App\Http\Requests\ProductTypeRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(ProductTypeRequest $request, $id)
    {
        $this->authorize('product_type_edit');
        if (ProductType::find($id)->update(['name' => $request->name])) {
            return response()->json(['success' => true, 'message' => 'Product type updated successfully'], 200);
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
        $this->authorize('product_type_delete');
        $procurementVendorCount = 0;
        // $procurementVendorCount = ProcurementVendor::where('product_type_id', $id)->count();
        $productCount = Product::where('product_type_id', $id)->count();
        if($procurementVendorCount > 0 || $productCount > 0) {
                if($procurementVendorCount > 0){
                    $message = 'Product type cannot be removed as it is used in Procurement Vendor\'s record.';
                }
                if($productCount > 0) {
                    $message .= ' Product type cannot be removed as it is used in Product\'s record.';
                }
            return response()->json(['success' => false, 'message' => $message], 422);
        } else {
            if (ProductType::find($id)->delete()) {
                return response()->json(['success' => true, 'message' => 'Product type deleted successfully'], 200);
            } else {
                return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
            }
        }
    }
}
