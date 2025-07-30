<?php

namespace App\Http\Controllers;

use App\Models\Stage;
use Illuminate\Http\Request;

class StageController extends Controller
{
    /**
     * @return string
     */
    public function index()
    {
        $this->authorize('stages_list');
        $rows = Stage::orderBy('stage_order')->get();
        return response()->json($rows, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function stagesListing()
    {
        $stages = Stage::orderBy('stage_order')->get();
        return response()->json($stages, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $this->authorize('stages_edit');
        $stage = Stage::find($id);
        return response()->json($stage, 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $this->authorize('stages_edit');
        if (Stage::find($id)->update([
            'stage_bg_color' => $request->stage_bg_color,
        ])) {
            return response()->json(['success'=> true, 'message' => "Stage updated successfully!"], 200);
        }
    }
}

