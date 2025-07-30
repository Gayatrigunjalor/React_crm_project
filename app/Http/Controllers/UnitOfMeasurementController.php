<?php

namespace App\Http\Controllers;

use App\Http\Requests\UnitOfMeasurementRequest;
use App\Models\Product;
use App\Models\UnitOfMeasurement;
use Illuminate\Http\Request;

class UnitOfMeasurementController extends Controller
{
    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $this->authorize('unit_of_measurement_list');
        $rows = UnitOfMeasurement::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function unitOfMeasurementListing()
    {
        $rows = UnitOfMeasurement::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @param \App\Http\Requests\UnitOfMeasurementRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(UnitOfMeasurementRequest $request)
    {
        $this->authorize('unit_of_measurement_create');
        if (UnitOfMeasurement::create(['name' => $request->name])) {
            return response()->json(['success' => true, 'message' => 'Unit Of Measurement saved successfully'], 200);
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
        $this->authorize('unit_of_measurement_edit');
        $unitOfMeasurement = UnitOfMeasurement::select('id', 'name')->find($id);
        if($unitOfMeasurement) {
            return response()->json($unitOfMeasurement);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find unit Of Measurement'], 422);
        }
    }

    /**
     * @param \App\Http\Requests\UnitOfMeasurementRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(UnitOfMeasurementRequest $request, $id)
    {
        $this->authorize('unit_of_measurement_edit');
        if (UnitOfMeasurement::find($id)->update(['name' => $request->name])) {
            return response()->json(['success' => true, 'message' => 'Unit Of Measurement updated successfully'], 200);
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
        $this->authorize('unit_of_measurement_delete');
        $productCount = Product::where('unit_of_measurement_id', $id)->count();
        if($productCount > 0) {
            if($productCount > 0) {
                $message = ' Unit Of Measurement cannot be removed as it is used in Product\'s record.';
            }
            return response()->json(['success' => false, 'message' => $message], 422);
        } else {
            if (UnitOfMeasurement::find($id)->delete()) {
                return response()->json(['success' => true, 'message' => 'Unit Of Measurement deleted successfully'], 200);
            } else {
                return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
            }
        }
    }
}
