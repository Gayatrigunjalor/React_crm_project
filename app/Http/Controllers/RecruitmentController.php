<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Recruitment;
use App\Models\RecruitmentCandidate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Notifications\CheckerNotification;
use Illuminate\Support\Facades\Notification;

class RecruitmentController extends Controller
{
    private $dateFormat = 'date_format:Y-m-d';
    /**
     * @return \Illuminate\Contracts\View\View
     */
    public function index()
    {
        $this->authorize('recruitment_list');
        $rows = Recruitment::with(['assigneeName:id,user_id,name','createdName:id,user_id,name'])->orderBy('id', 'DESC')->get();
        return response()->json($rows, 200);
    }


    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $this->authorize('recruitment_create');
        $this->validate($request,[
            'post_name' => 'required|string|max:255',
            'tat' => $this->dateFormat,
            'opening_date' => $this->dateFormat,
        ]);
        $formArray = $request->all();
        $formArray['created_by'] = Auth::id();
        $form_id = Recruitment::create($formArray);
        Recruitment::find($form_id->id)->update(array('approved' => true));
        // if (Auth::user()->user_role == 0) {
        // } else {
        //     $checker = User::find(Auth::id());
        //     $checkerData = [
        //         'subject' => 'New Recruitment Created',
        //         'body' => 'New Recruitment Is Created by ' . $checker->employeeDetail->name . ' Please Check It',
        //         'url' => '/recruitmentChecker',
        //         'form_id' => $form_id->id
        //     ];
        //     if ($checker->checkers->recruitment_c1 != null) {
        //         $userSchema = User::find($checker->checkers->recruitment_c1);
        //         Recruitment::find($form_id->id)->update(array('checker_id' => 1));
        //         Notification::send($userSchema, new CheckerNotification($checkerData));
        //     } elseif ($checker->checkers->recruitment_admin_approve == 1) {
        //         $userSchema = User::find(1);
        //         Recruitment::find($form_id->id)->update(array('checker_id' => 0));
        //         Notification::send($userSchema, new CheckerNotification($checkerData));
        //     } else {
        //         Recruitment::find($form_id->id)->update(array('approved' => true));
        //     }
        // }
        return response()->json(['success' => true, 'message' => 'Recruitment saved successfully'], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $this->authorize('recruitment_edit');
        $recruitment = Recruitment::with(['assigneeName:id,name'])->find($id);
        $selectedCandidates = RecruitmentCandidate::select('id', 'name', 'email')->where('post_id', $id)->where('candidate_status','Selected')->get();
        $recruitment['selected_candidates'] = $selectedCandidates;
        return response()->json($recruitment, 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $this->authorize('recruitment_edit');
        $this->validate($request,[
            'post_name' => 'required|string|max:255',
            'tat' => $this->dateFormat,
            'opening_date' => $this->dateFormat,
        ]);
        Recruitment::find($request->id)->update($request->all());
        return response()->json(['success' => true, 'message' => 'Recruitment saved successfully'], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    public function deleteRecruitment(Request $request)
    {
        $this->authorize('recruitment_delete');
        Recruitment::find($request->id)->delete();
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchRecruitmentCount()
    {
        $totalRecruitmentCount = Recruitment::count();

        return response()->json(['totalRecruitmentCount' => $totalRecruitmentCount]);
    }

    public function fetchRecruitmentDashboardData(Request $request)
    {
        $recruitments = new Recruitment;
        $recruitments = $recruitments->select('*');
        //check if start & end date is passed
        if($request['start_date'] != "" && $request['end_date'] != ""){
            $startDate = Carbon::parse($request['start_date'])->toDateTimeString();
            $endDate = Carbon::parse($request['end_date'])->addDays(1)->toDateTimeString();

            $recruitments = $recruitments->whereBetween('created_at', [$startDate,$endDate]);
        }
        //check if employee id is passed
        if($request['emp_id'] != ""){
            $userIds = [];
            for ($i = 0; $i < count($request['emp_id']); $i++) {
                array_push($userIds, $request['emp_id'][$i]);
            }

            $recruitments = $recruitments->whereIn('created_by', $userIds);
        }
        $recruitments = $recruitments->with(['assigneeName','createdName'])->orderBy('id', 'DESC')->get();
        $rows = $recruitments;
        if($rows->count() > 0){
            return view('admin.dashboard.recruitment.list-rows', compact('rows'));
        }
        else{
            return '<h4 class="my-5 text-center text-danger">No record present in the database!</h4>';
        }
    }

    /**
     * Fetch vendors against procurement_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchDashboardRecruitmentCandidates(Request $request)
    {
        $id = $request->id;
        $recruitment_name = Recruitment::select('post_name')->where('id',$id)->first();
        $name = $recruitment_name->post_name;

        $this->authorize('recruitment_candidate_list');
        $rows = RecruitmentCandidate::select('recruitment_candidates.*', 'recruitment_attachments.id as attachment_id', 'recruitment_attachments.name as attachment_title')
                ->with('createdName')
                ->leftJoin('recruitment_attachments', 'recruitment_attachments.id', '=', 'recruitment_candidates.attachment_id')
                ->where('recruitment_candidates.post_id', $request->id)
                ->get();
        if ($rows->count() > 0) {
            return view('admin.dashboard.recruitment.recruitment-candidate-list',compact('rows'))->with(['post_name' => $name]);
        }
        else {
            return view('admin.dashboard.recruitment.recruitment-candidate-list',compact('rows'))->with(['post_name' => $name]);
        }
    }

    /**
     * Fetch active employees for procurement dashboard filter
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchRecruitmentEmployeesDropdown()
    {
        $recruitmentDashboardEmployees = User::with('employeeDetail')->whereRelation('rolePermissions', 'procurement_create', 1)->whereRelation('rolePermissions', 'procurement_list', 1)->get();
        $i = 0;
        foreach ($recruitmentDashboardEmployees as $recruitmentEmployee) {
                $employeeName =  $recruitmentEmployee->employeeDetail->name ?? 'Admin';
                $recruitmentDashboardEmployees[$i]['employee_name'] = $employeeName;
            $i++;
        }
        return response()->json(['recruitmentDashboardEmployees' => $recruitmentDashboardEmployees]);
    }

}
