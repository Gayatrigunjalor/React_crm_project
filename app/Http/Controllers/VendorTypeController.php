<?php

namespace App\Http\Controllers;

use App\Http\Requests\VendorTypeRequest;
use App\Models\VendorType;

class VendorTypeController extends Controller
{
    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function index()
    {
        $this->authorize('vendor_type_list');
        $rows = VendorType::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function vendorTypeListing()
    {
        $rows = VendorType::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @param \App\Http\Requests\VendorTypeRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(VendorTypeRequest $request)
    {
        $this->authorize('vendor_type_create');
        if (VendorType::create(['name' => $request->name])) {
            return response()->json(['success' => true, 'message' => 'Vendor type saved successfully'], 200);
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
        $this->authorize('vendor_type_edit');
        $vendorType = VendorType::select('id', 'name')->find($id);
        if($vendorType) {
            return response()->json($vendorType);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find vendor type'], 422);
        }
    }

    /**
     * @param \App\Http\Requests\VendorTypeRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(VendorTypeRequest $request, $id)
    {
        $this->authorize('vendor_type_edit');
        if (VendorType::find($id)->update(['name' => $request->name])) {
            return response()->json(['success' => true, 'message' => 'Vendor type updated successfully'], 200);
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
        $this->authorize('vendor_type_delete');
        // $vendorCount = Vendor::where('vender_type_id', $id)->count();
        // if($vendorCount > 0) {
        //     return response()->json(['success' => false, 'message' => 'Vendor type cannot be removed as it is used in Vendor\'s record.'], 422);
        // } else {
            if (VendorType::find($id)->delete()) {
                return response()->json(['success' => true, 'message' => 'Vendor type deleted successfully'], 200);
            } else {
                return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
            }
        // }
    }
}
