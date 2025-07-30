<?php

namespace App\Http\Controllers;

use App\Http\Requests\VendorBehaviorRequest;
use App\Models\VendorBehavior;

class VendorBehaviorController extends Controller
{
    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $this->authorize('vendor_behavior_list');
        $rows = VendorBehavior::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function vendorBehaviorListing()
    {
        $rows = VendorBehavior::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @param \App\Http\Requests\VendorBehaviorRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(VendorBehaviorRequest $request)
    {
        $this->authorize('vendor_behavior_create');
        if (VendorBehavior::create(['name' => $request->name])) {
            return response()->json(['success' => true, 'message' => 'Vendor behavior saved successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @param \App\Services\VendorBehaviorService $vendorBehaviorService
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $this->authorize('vendor_behavior_edit');
        $vendorBehavior = VendorBehavior::select('id', 'name')->find($id);
        if($vendorBehavior) {
            return response()->json($vendorBehavior);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find vendor behavior'], 422);
        }
    }

    /**
     * @param \App\Http\Requests\VendorBehaviorRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(VendorBehaviorRequest $request, $id)
    {
        $this->authorize('vendor_behavior_edit');
        if (VendorBehavior::find($id)->update(['name' => $request->name])) {
            return response()->json(['success' => true, 'message' => 'Vendor behavior updated successfully'], 200);
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
        $this->authorize('vendor_behavior_delete');
        // $vendorCount = Vendor::where('vendor_behavior_id', $id)->count();
        // if($vendorCount > 0) {
        //     return response()->json(['success' => false, 'message' => 'Vendor behavior cannot be removed as it is used in Vendor\'s record.'], 422);
        // } else {
            if (VendorBehavior::find($id)->delete()) {
                return response()->json(['success' => true, 'message' => 'Vendor behavior deleted successfully'], 200);
            } else {
                return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
            }
        // }
    }
}
