<?php

namespace App\Http\Controllers;

use App\Models\Kpi;
use App\Models\Employee;
use Illuminate\Http\Request;

class KpiController extends Controller
{
    /**
     * @param \App\Services\KpiService $kpiService
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function index()
    {
        $this->authorize('kpi_list');
        $rows = Kpi::with(['roles:id,name'])->orderBy('id', 'desc')->get();
        $i = 0;
        foreach ($rows as $row) {
            $userIds = explode(',', $row->user_ids);
            $rows[$i]['users'] = Employee::select('id', 'name', 'user_id')->whereIn('user_id', $userIds)->get();
            $i++;
        }
        if ($rows->count() > 0) {
            return response()->json($rows, 200);
        } else {
            return response()->json([], 200);
        }

    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @param \App\Services\KpiService $kpiService
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $this->authorize('kpi_create');
        $this->validate($request, [
            'kpi_name' => 'required|string|max:255',
            'role_id' => 'required',
            'description' => 'required|string',
            'target_type' => 'required|string',
            'priority' => 'required|string',
        ]);

        if (is_array($request->user_ids) && count($request->user_ids) > 0) {
            $userIds = [];
            for ($i = 0; $i < count($request->user_ids); $i++) {
                array_push($userIds, $request->user_ids[$i]);
            }
            $userIds = implode(",", $userIds);
        } else {
            $userIds = null;
        }
        if (Kpi::create([
            'kpi_name' => $request->kpi_name,
            'role_id' => $request->role_id,
            'user_ids' => $userIds,
            'description' => $request->description,
            'target_type' => $request->target_type,
            'priority' => $request->priority,
        ])) {
            return response()->json(['success' => true, 'message' => 'KPI saved successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }

    }
    /**
     * @param  \Illuminate\Http\Request  $request
     * @param \App\Services\KpiService $kpiService
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $this->authorize('kpi_edit');
        $rows = Kpi::with(['roles:id,name'])->find($id);
        $userIds = explode(',', $rows->user_ids);
        $rows['user_ids'] = $userIds;
        $rows['users'] = Employee::select('id', 'name', 'user_id')->whereIn('user_id', $userIds)->get();

        return response()->json($rows, 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @param \App\Services\KpiService $kpiService
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $this->authorize('kpi_edit');
        if (is_array($request->user_ids) && count($request->user_ids) > 0) {
            $userIds = [];
            for ($i = 0; $i < count($request->user_ids); $i++) {
                array_push($userIds, $request->user_ids[$i]);
            }
            $userIds = implode(",", $userIds);
        } else {
            $userIds = null;
        }
        if (Kpi::find($request->id)->update([
            'kpi_name' => $request->kpi_name,
            'role_id' => $request->role_id,
            'user_ids' => $userIds,
            'description' => $request->description,
            'target_type' => $request->target_type,
            'priority' => $request->priority,
        ])) {
            return response()->json(['success' => true, 'message' => 'KPI updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse|void
     */
    public function destroy($id)
    {
        $this->authorize('kpi_delete');
        if (Kpi::find($id)->delete()) {
            return response()->json(['success' => true, 'message' => 'KPI deleted successfully'], 200);
        } else {
            return response()->json(['success' => true, 'message' => 'Something went wrong'], 422);
        }
    }
}
