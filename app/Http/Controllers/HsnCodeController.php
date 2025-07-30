<?php

namespace App\Http\Controllers;

use App\Http\Requests\HsnCodeRequest;
use App\Models\HsnCode;
use App\Models\Product;
use Illuminate\Http\Request;

class HsnCodeController extends Controller
{
    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $this->authorize('hsn_code_list');
        $rows = HsnCode::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function hsnCodeTypeListing()
    {
        $rows = HsnCode::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @param \App\Http\Requests\HsnCodeRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(HsnCodeRequest $request)
    {
        $this->authorize('hsn_code_create');
        if (HsnCode::create(['hsn_code' => $request->hsn_code])) {
            return response()->json(['success' => true, 'message' => 'HSN code saved successfully'], 200);
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
        $this->authorize('hsn_code_edit');
        $hsnCode = HsnCode::select('id', 'hsn_code')->find($id);
        if($hsnCode) {
            return response()->json($hsnCode);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find hSN code'], 422);
        }
    }

    /**
     * @param \App\Http\Requests\HsnCodeRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(HsnCodeRequest $request, $id)
    {
        $this->authorize('hsn_code_edit');
        if (HsnCode::find($id)->update(['hsn_code' => $request->hsn_code])) {
            return response()->json(['success' => true, 'message' => 'HSN code updated successfully'], 200);
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
        $this->authorize('hsn_code_delete');
        $productCount = Product::where('hsn_code_id', $id)->count();
        if($productCount > 0) {
            if($productCount > 0) {
                $message = ' HSN code cannot be removed as it is used in Product\'s record.';
            }
            return response()->json(['success' => false, 'message' => $message], 422);
        } else {
            if (HsnCode::find($id)->delete()) {
                return response()->json(['success' => true, 'message' => 'HSN code deleted successfully'], 200);
            } else {
                return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
            }
        }
    }
}
