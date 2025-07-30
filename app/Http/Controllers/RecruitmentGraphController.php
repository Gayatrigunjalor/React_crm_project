<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Recruitment;
use Illuminate\Http\Request;
use Carbon\Carbon;


class RecruitmentGraphController extends Controller
{
    public function getHRList() {
        $emps = Employee::select('id','user_id','name','is_under_id','role_id')->where('department_id', 4)->where('is_click_up_on', 1)->get();
        return response()->json($emps);
    }

    public function fetchIndividualGraphData(Request $request) {
        $this->validate($request,[
            'user_id' => 'required'
        ]);

        $posts = Recruitment::where(function($query) use($request) {
            $query->where('created_by', $request->user_id)
            ->orWhere('assignee_name', $request->user_id);
        })->get();

        $series = [];
        if(!$posts->isEmpty()) {
            foreach($posts as $post) {
                $x_axis[] = $post->post_name;
                $opening = Carbon::parse($post->opening_date);
                $tat = Carbon::parse($post->tat);
                $diff = $opening->diffInDays($tat);
                $tats[] = $diff;
                $delays[] = $post->deviation ?? 0;
            }

            $series[] = [
                'name' => 'TAT (Days)',
                'data' => $tats,
                'color'=> '#f57200',
            ];

            $series[] = [
                'name' => 'Delays (Days)',
                'data' => $delays,
                'color'=> 'purple',
            ];
        }

        return response()->json(['x_axis' => $x_axis, 'series' => $series]);
    }

    public function fetchSelfCreatedGraphData(Request $request) {
        $this->validate($request,[
            'user_id' => 'required'
        ]);

        $posts = Recruitment::where('created_by', $request->user_id)->get();
        $post_count = $posts->count();
        $delay = 0;
        $complete = 0;
        $emp_name = Employee::where('user_id', $request->user_id)->value('name') ?? 'Admin';
        if(!$posts->isEmpty()) {
            foreach($posts as $post) {

                $tat = Carbon::parse($post->tat);
                $closer_date = Carbon::parse($post->closer_date);
                $now = Carbon::now();

                if ($tat->lessThan($now)) {
                    $delay++;
                }
                if ($closer_date->lessThanOrEqualTo($tat) && $post->opening_status == 'Done') {
                    $complete++;
                }
            }
        }

        return response()->json(['post_count' => $post_count, 'delay' => $delay, 'complete' => $complete, 'emp_name' => [$emp_name]]);
    }

    public function fetchAssignedGraphData(Request $request) {
        $this->validate($request,[
            'user_id' => 'required'
        ]);

        $posts = Recruitment::where('assignee_name', $request->user_id)->get();
        $post_count = $posts->count();
        $delay = 0;
        $complete = 0;
        $emp_name = Employee::where('user_id', $request->user_id)->value('name') ?? 'Admin';
        if(!$posts->isEmpty()) {
            foreach($posts as $post) {

                $tat = Carbon::parse($post->tat);
                $closer_date = Carbon::parse($post->closer_date);
                $now = Carbon::now();

                if ($tat->lessThan($now)) {
                    $delay++;
                }
                if ($closer_date->lessThanOrEqualTo($tat) && $post->opening_status == 'Done') {
                    $complete++;
                }
            }
        }

        return response()->json(['post_count' => $post_count, 'delay' => $delay, 'complete' => $complete, 'emp_name' => [$emp_name]]);
    }
}
