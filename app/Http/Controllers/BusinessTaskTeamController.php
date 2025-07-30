<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BusinessTaskTeam;
use App\Models\Employee;
use App\Models\Role;

class BusinessTaskTeamController extends Controller
{
    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function index()
    {
        $this->authorize('business_task_team_list');
        $businessTaskTeams = BusinessTaskTeam::with(['employeeSde:id,user_id,name', 'employeeBpe:id,user_id,name', 'employeeDeo:id,user_id,name', 'employeePm:id,user_id,name', 'employeeLm:id,user_id,name', 'employeeCm:id,user_id,name'])->get();
        return response()->json($businessTaskTeams, 200);
    }

    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function bTteamcreate()
    {
        $this->authorize('business_task_team_create');

        $sdeteams = [];
        $bpeteams = [];
        $deoteams = [];
        $pmteams = [];
        $lmteams = [];
        $cmteams = [];

        $sdeId = Role::where('name', '=', 'SDE')->first();
        if($sdeId){
            $sdeteams = Employee::select('id','user_id','name','role_id')->where('approved', '=', '1')->where('role_id', '=', $sdeId->id)->get();
        }
        $bpeId = Role::where('name', '=', 'BPE')->first();
        if($bpeId){
            $bpeteams = Employee::select('id','user_id','name','role_id')->where('approved', '=', '1')->where('role_id', '=', $bpeId->id)->get();
        }
        $deoId = Role::where('name', '=', 'DEO')->first();
        if($deoId){
            $deoteams = Employee::select('id','user_id','name','role_id')->where('approved', '=', '1')->where('role_id', '=', $deoId->id)->get();
        }
        $pmId = Role::where('name', '=', 'PM')->first();
        if($pmId){
            $pmteams = Employee::select('id','user_id','name','role_id')->where('approved', '=', '1')->where('role_id', '=', $pmId->id)->get();
        }
        $lmId = Role::where('name', '=', 'LM')->first();
        if($lmId){
            $lmteams = Employee::select('id','user_id','name','role_id')->where('approved', '=', '1')->where('role_id', '=', $lmId->id)->get();
        }
        $cmId = Role::where('name', '=', 'CM')->first();
        if($cmId){
            $cmteams = Employee::select('id','user_id','name','role_id')->where('approved', '=', '1')->where('role_id', '=', $cmId->id)->get();
        }
        return response()->json(['sdeteams' => $sdeteams, 'bpeteams' => $bpeteams, 'deoteams' => $deoteams, 'pmteams' => $pmteams, 'lmteams' => $lmteams, 'cmteams' => $cmteams ]);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $this->authorize('business_task_team_create');
        if (BusinessTaskTeam::create([
            'sde' => $request->sde,
            'bpe' => $request->bpe,
            'deo' => $request->deo,
            'pm' => $request->pm,
            'lm' => $request->lm,
            'cm' => $request->cm
        ])) {
            return response()->json(['message' => 'Business Task Team saved successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param mixed $id
     */
    public function show($id)
    {
        $this->authorize('business_task_team_edit');
        $businessTaskTeam = BusinessTaskTeam::where("id", $id)->first();
        
        return response()->json([
            'id' => $businessTaskTeam->id,
            'sde' => $businessTaskTeam->sde,
            'bpe' => $businessTaskTeam->bpe,
            'deo' => $businessTaskTeam->deo,
            'pm' => $businessTaskTeam->pm,
            'lm' => $businessTaskTeam->lm,
            'cm' => $businessTaskTeam->cm,
            'sde_data' => Employee::select('id','user_id','name','role_id')->where('user_id', $businessTaskTeam->sde)->first(),
            'bpe_data' => Employee::select('id','user_id','name','role_id')->where('user_id', $businessTaskTeam->bpe)->first(),
            'deo_data' => Employee::select('id','user_id','name','role_id')->where('user_id', $businessTaskTeam->deo)->first(),
            'pm_data'  => Employee::select('id','user_id','name','role_id')->where('user_id', $businessTaskTeam->pm)->first(),
            'lm_data'  => Employee::select('id','user_id','name','role_id')->where('user_id', $businessTaskTeam->lm)->first(),
            'cm_data'  => Employee::select('id','user_id','name','role_id')->where('user_id', $businessTaskTeam->cm)->first(),
        ], 200);
    }

    /**
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $this->authorize('business_task_team_edit');
        if (BusinessTaskTeam::find($id)->update([
            'sde' => $request->sde,
            'bpe' => $request->bpe,
            'deo' => $request->deo,
            'pm' => $request->pm,
            'lm' => $request->lm,
            'cm' => $request->cm
        ])) {
            return response()->json(['message' => 'Business Task Team updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    public function getBTteamByName($name){
        $businessTaskTeam = BusinessTaskTeam::select('id');
        if(!empty($name)){
            $businessTaskTeam = $businessTaskTeam->select(strtolower($name))->with('employee'.$name.':id,user_id,name')->get();
            return response()->json($businessTaskTeam, 200);
        }
        return response()->json([], 200);
    }
}
