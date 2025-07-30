<?php

namespace App\Http\Controllers;

use App\Models\WarehouseBoxProducts;
use Illuminate\Http\Request;

class WarehouseProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('warehouse_edit');
        $this->validate($request,[
            'warehouse_box_id' => 'required',
            'product_id' => 'required',
            'product_quantity' => 'required',
            'box_content' => 'required'
        ]);

        $box_details = WarehouseBoxProducts::where('warehouse_box_id', $request->warehouse_box_id)->get();
        if($box_details->count() < 1){
            return response()->json(['message' => 'Unable to find product'], 404);
        }
        try {
            WarehouseBoxProducts::create([
                'warehouse_box_id' => $request->warehouse_box_id,
                'product_code_id' => $request->product_id,
                'product_quantity' => $request->product_quantity,
                'product_hsn' => $request->product_hsn,
                'hazardous_symbol' => $request->hazardous_symbol,
                'box_content' => $request->box_content,
                'manufacture_year' => $request->manufacture_year
            ]);
            return response()->json(['success' => true, "message" => 'Product details added successfully!'], 200);
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json(['success' => true, "message" => 'Something went wrong! Unable to save Product'], 422);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        if($box_product = WarehouseBoxProducts::select('*', 'product_code_id as product_id')->with('product_details:id,product_name')->find($id)) {
            return response()->json($box_product, 200);
        } else {
            return response()->json(['message' => 'Unable to find product'], 404);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $this->authorize('warehouse_edit');
        $this->validate($request,[
            'warehouse_box_id' => 'required',
            'product_id' => 'required',
            'product_quantity' => 'required',
            'box_content' => 'required'
        ]);

        $box_details = WarehouseBoxProducts::where('warehouse_box_id', $request->warehouse_box_id)->get();
        if($box_details->count() < 1){
            return response()->json(['message' => 'Unable to find product'], 404);
        }

        try {
            WarehouseBoxProducts::find($id)->update([
                'warehouse_box_id' => $request->warehouse_box_id,
                'product_code_id' => $request->product_id,
                'product_quantity' => $request->product_quantity,
                'product_hsn' => $request->product_hsn,
                'hazardous_symbol' => $request->hazardous_symbol,
                'box_content' => $request->box_content,
                'manufacture_year' => $request->manufacture_year
            ]);
            return response()->json(['success' => true, "message" => 'Product details updated successfully!'], 200);
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json(['success' => true, "message" => 'Something went wrong!'], 422);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function deleteBoxProduct(Request $request)
    {
        $this->authorize('warehouse_edit');
        $wms_product = WarehouseBoxProducts::find($request->id);
        if($wms_product) {
            $products_count = WarehouseBoxProducts::where('warehouse_box_id', $wms_product->warehouse_box_id)->count();
            if($products_count > 1){
                $wms_product->delete();
                return response()->json(['success' => true, 'message' => 'Box deleted successfully!'], 200);
            } else {
                return response()->json(['success' => false, 'message' => 'This is the only product in the box. Add a new product first then delete this.'], 422);
            }
        }
        return response()->json(['success' => false, 'message' => 'Product not found in the box'], 422);
    }
}
