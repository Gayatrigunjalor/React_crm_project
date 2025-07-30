<?php

namespace App\Http\Controllers;

use App\Http\Requests\GstPercentRequest;
use App\Models\GstPercent;
use App\Models\Product;

class GstPercentController extends Controller
{
/**
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $this->authorize('gst_percent_list');
        $rows = GstPercent::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function gstPercentListing()
    {
        $rows = GstPercent::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @param \App\Http\Requests\GstPercentRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(GstPercentRequest $request)
    {
        $this->authorize('gst_percent_create');
        if (GstPercent::create(['percent' => $request->percent])) {
            return response()->json(['success' => true, 'message' => 'Gst percent saved successfully'], 200);
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
        $this->authorize('gst_percent_edit');
        $gstPercent = GstPercent::select('id', 'percent')->find($id);
        if($gstPercent) {
            return response()->json($gstPercent);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find Gst percent'], 422);
        }
    }

    /**
     * @param \App\Http\Requests\GstPercentRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(GstPercentRequest $request, $id)
    {
        $this->authorize('gst_percent_edit');
        if (GstPercent::find($id)->update(['percent' => $request->percent])) {
            return response()->json(['success' => true, 'message' => 'Gst percent updated successfully'], 200);
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
        $this->authorize('gst_percent_delete');
        $productCount = Product::where('gst_percent_id', $id)->count();
        if( $productCount > 0) {
            if($productCount > 0) {
                $message = 'Gst percent cannot be removed as it is used in Product\'s record.';
            }
            return response()->json(['success' => false, 'message' => $message], 422);
        } else {
            if (GstPercent::find($id)->delete()) {
                return response()->json(['success' => true, 'message' => 'Gst percent deleted successfully'], 200);
            } else {
                return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
            }
        }
    }
}
