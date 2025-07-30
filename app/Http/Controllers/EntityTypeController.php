<?php

namespace App\Http\Controllers;

use App\Models\EntityType;
use App\Http\Requests\EntityTypeRequest;

class EntityTypeController extends Controller
{
    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function index()
    {
        $this->authorize('entity_type_list');
        $rows = EntityType::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function entityTypeListing()
    {
        $rows = EntityType::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @param \App\Http\Requests\EntityTypeRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(EntityTypeRequest $request)
    {
        $this->authorize('entity_type_create');
        if (EntityType::create(['name' => $request->name])) {
            return response()->json(['success' => true, 'message' => 'Entity type saved successfully'], 200);
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
        $this->authorize('entity_type_edit');
        $entityType = EntityType::select('id', 'name')->find($id);
        if($entityType) {
            return response()->json($entityType);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find entity type'], 422);
        }
    }

    /**
     * @param \App\Http\Requests\EntityTypeRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(EntityTypeRequest $request, $id)
    {
        $this->authorize('entity_type_edit');
        if (EntityType::find($id)->update(['name' => $request->name])) {
            return response()->json(['success' => true, 'message' => 'Entity type updated successfully'], 200);
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
        $this->authorize('entity_type_delete');
        // $vendorCount = Vendor::where('entity_type_id', $id)->count();
        // if($vendorCount > 0) {
        //     return response()->json(['success' => false, 'message' => 'Entity type cannot be removed as it is used in Vendor\'s record.'], 422);
        // } else {
            if (EntityType::find($id)->delete()) {
                return response()->json(['success' => true, 'message' => 'Entity type deleted successfully'], 200);
            } else {
                return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
            }
        // }
    }
}
