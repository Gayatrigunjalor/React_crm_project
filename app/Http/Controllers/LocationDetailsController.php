<?php

namespace App\Http\Controllers;

use App\Models\LocationDetail;
use App\Models\WarehouseBoxDetails;
use Illuminate\Http\Request;

class LocationDetailsController extends Controller
{
    public function index() {
        $this->authorize('location_detail_list');
        $rows = LocationDetail::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    public function locationDetailListing() {
        $rows = LocationDetail::select('id','warehouse_name','rack_number','floor')->where('is_active', 1)->orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $this->authorize('location_detail_create');
        $this->validate($request, [
            'warehouse_name' => 'required|max:255',
            'rack_number' => 'required|max:255',
            'floor' => 'required|max:255'
        ]);
        if (LocationDetail::create([
            'warehouse_name' => $request->warehouse_name,
            'rack_number' => $request->rack_number,
            'floor' => $request->floor]))
        {
            return response()->json(['success' => true, 'message' => 'Location Detail added successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    public function update(Request $request, $id)
    {
        $this->authorize('location_detail_edit');
        $this->validate($request, [
            'id' => 'required',
            'warehouse_name' => 'required|max:255',
            'rack_number' => 'required|max:255',
            'floor' => 'required|max:255'
        ]);
        if (LocationDetail::find($id)->update([
            'warehouse_name' => $request->warehouse_name,
            'rack_number' => $request->rack_number,
            'floor' => $request->floor])) {
            return response()->json(['success' => true, 'message' => 'Location Detail updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    public function show($id) {
        $this->authorize('location_detail_edit');
        return response()->json(LocationDetail::find($id));
    }

    /**
     * @return \Illuminate\Http\JsonResponse|void
     */
    public function destroy($id)
    {
        $this->authorize('location_detail_delete');
        $rows = WarehouseBoxDetails::where('location_detail_id', $id)->get();
        if($rows->count() > 0) {
            return response()->json(['success' => true, 'message'=> 'Location detail cannot be deleted as it is used inward mapping'], 422);
        } else {
            $loc_details = LocationDetail::find($id);
            if ($loc_details->delete()) {
                return response()->json(['success' => true, 'message' => 'Location Detail deleted successfully'], 200);
            } else {
                return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
            }
        }

    }

}
