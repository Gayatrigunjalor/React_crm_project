<?php

namespace App\Http\Controllers;

use App\Models\Assets;
use App\Models\AssetType;
use App\Http\Requests\AssetTypeRequest;
use Illuminate\Support\Facades\Auth;

class AssetTypeController extends Controller
{
    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $this->authorize('asset_type_list');
        $rows = AssetType::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @param \App\Http\Requests\AssetTypeRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(AssetTypeRequest $request)
    {
        $this->authorize('asset_type_create');
        if (AssetType::create(['name' => $request->name, 'created_by' => Auth::id()])) {
            return response()->json(['success' => true, 'message' => 'Asset type saved successfully'], 200);
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
        $this->authorize('asset_type_edit');
        $department = AssetType::select('id', 'name')->find($id);
        if($department) {
            return response()->json($department);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find asset type'], 422);
        }
    }

    /**
     * @param \App\Http\Requests\AssetTypeRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(AssetTypeRequest $request, $id)
    {
        $this->authorize('asset_type_edit');
        if (AssetType::find($id)->update(['name' => $request->name])) {
            return response()->json(['success' => true, 'message' => 'Asset type updated successfully'], 200);
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
        $this->authorize('asset_type_delete');

        $employeeCount = Assets::where('asset_type_id', $id)->count();
        if( $employeeCount > 0) {
            if($employeeCount > 0) {
                $message = 'Asset type cannot be removed as it is used in Asset\'s record.';
            }

            return response()->json(['success' => false, 'message' => $message], 422);
        } else {
            if (AssetType::find($id)->delete()) {
                return response()->json(['success' => true, 'message' => 'Asset type deleted successfully'], 200);
            } else {
                return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
            }
        }
    }
}
