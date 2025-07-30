<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Employee;
use App\Models\Procurement;
use Illuminate\Http\Request;

class ProcurementGraphController extends Controller
{
    public function procurementProductIndividual(Request $request)
    {
        $this->authorize('procurement_list');
        $procurements = Procurement::orderBy('id', 'DESC')->where('created_by', $request->user_id)->get();

        $graphData = [];

        foreach($procurements as $proc){

            //sum of tat (tat - creation date)
            $creationDate = Carbon::parse($proc->created_at);
            $tatDate = Carbon::parse($proc->tat);

            $diff = $tatDate->diffInDays($creationDate);

            $delayDiff = 0;
            if($proc->completion_date != null) {
                $delayDiff = $tatDate->diffInDays($proc->completion_date);
            }
            $x_axis[] = $proc->product_service_name;
            $tats[] = $diff;
            $delays[] = ($delayDiff <= 0) ? 0 : $delayDiff;

        }
        $graphData[] = [
            'name' => 'Delays (Days)',
            'data' => $delays,
            'color'=> '#dc3545',
        ];

        $graphData[] = [
            'name' => 'TAT (Days)',
            'data' => $tats,
            'color'=> '#a3edba',
        ];

        return response()->json(['x_axis' => $x_axis, 'graphData' => $graphData], 200);
    }

    public function procurementPieChart() {
        $this->authorize('procurement_list');
        $procurements = Procurement::orderBy('id', 'DESC')->get();

        $graphData = [];

        $openSum = 0;
        $closedSum = 0;

        foreach($procurements as $proc){
            if($proc->status == 'In progress'){
                $openSum++;
            } else {
                $closedSum++;
            }
        }
        $total = $procurements->count();

        return response()->json(['total' => $total, 'openSum' => $openSum , 'closedSum' => $closedSum], 200);
    }

    public function procurementClosedIndividualChart(Request $request) {
        $this->authorize('procurement_list');
        $procurements = Procurement::where('status', 'Complete')->where('created_by', $request->user_id)->orderBy('id', 'DESC')->get();
        $emp_name = Employee::select('name')->where('user_id', $request->user_id)->first();
        $x_axis[] = ($emp_name != null) ? $emp_name->name : 'Admin';
        $count = $procurements->count();
        $delaySum = 0;
        $underTatSum = 0;
        if($count){
            foreach($procurements as $proc){
                if($proc->completion_date != null){
                    $tat_dt = Carbon::parse($proc->tat);
                    $completion_dt = Carbon::parse($proc->completion_date);
                    if($completion_dt->lessThanOrEqualTo($tat_dt)) {
                        $underTatSum++;
                    } else {
                        $delaySum++;
                    }
                } else {
                    $delaySum++;
                }
            }
        }

        $series[] = [
            'name' => 'Delayed',
            'data' => [$delaySum],
            'color'=> 'lightblue',
        ];

        $series[] = [
            'name' => 'Under TAT',
            'data' => [$underTatSum],
            'color'=> 'yellow',
        ];

        $series[] = [
            'name' => 'Total closed',
            'data' => [$count],
            'color'=> '#a3edba',
        ];
        return response()->json(['x_axis' => $x_axis, 'series' => $series], 200);
    }

    public function procurementOpenedIndividualChart(Request $request) {
        $this->authorize('procurement_list');
        $procurements = Procurement::where('status', 'In progress')->where('created_by', $request->user_id)->orderBy('id', 'DESC')->get();
        $emp_name = Employee::select('name')->where('user_id', $request->user_id)->first();
        $x_axis[] = ($emp_name != null) ? $emp_name->name : 'Admin';
        $count = $procurements->count();
        $delaySum = 0;
        $underTatSum = 0;
        if($count){
            foreach($procurements as $proc){
                $tat_dt = Carbon::parse($proc->tat);
                $now = Carbon::now();
                if($now->lessThanOrEqualTo($tat_dt)) {
                    $underTatSum++;
                } else {
                    $delaySum++;
                }
            }
        }

        $series[] = [
            'name' => 'Delayed',
            'data' => [$delaySum],
            'color'=> 'lightblue',
        ];

        $series[] = [
            'name' => 'Under TAT',
            'data' => [$underTatSum],
            'color'=> 'yellow',
        ];

        $series[] = [
            'name' => 'Total open',
            'data' => [$count],
            'color'=> '#a3edba',
        ];
        return response()->json(['x_axis' => $x_axis, 'series' => $series], 200);
    }

    public function procurementTotalSourcing() {
        $this->authorize('procurement_list');
        $users = Procurement::distinct()->pluck('created_by');

        $openCounts = [];
        $closedCounts = [];
        $x_axis = [];

        foreach($users as $usr) {
            $procurements = new Procurement;

            $openCounts[] = $procurements->where('created_by', $usr)->where('status', 'In Progress')->count();
            $closedCounts[] = $procurements->where('created_by', $usr)->where('status', 'Complete')->count();

            $emp_name = Employee::select('name')->where('user_id', $usr)->first();
            $x_axis[] = ($emp_name != null) ? $emp_name->name : 'Admin';
        }

        $series[] = [
            'name' => 'Closed',
            'data' => $closedCounts,
            'color'=> 'gold',
        ];

        $series[] = [
            'name' => 'Open',
            'data' => $openCounts,
            'color'=> 'crimson',
        ];

        return response()->json(['x_axis' => $x_axis, 'series' => $series], 200);
    }

    public function procurementClosedAdminGraph() {
        $this->authorize('procurement_list');
        $users = Procurement::distinct()->pluck('created_by');

        $underTat = [];
        $delayed = [];
        $x_axis = [];

        foreach($users as $usr) {
            $emp_name = Employee::select('name')->where('user_id', $usr)->first();
            $x_axis[] = ($emp_name != null) ? $emp_name->name : 'Admin';

            //fetch list of complete procurements by individual users
            $procurements = Procurement::where('created_by', $usr)->where('status', 'Complete')->get();

            $underTatSum = 0;
            $delaySum = 0;
            foreach($procurements as $proc){
                if($proc->completion_date != null){
                    $tat_dt = Carbon::parse($proc->tat);
                    $completion_dt = Carbon::parse($proc->completion_date);
                    if($completion_dt->lessThanOrEqualTo($tat_dt)) {
                        $underTatSum++;
                    } else {
                        $delaySum++;
                    }
                } else {
                    $delaySum++;
                }
            }
            $underTat[] = $underTatSum;
            $delayed[] = $delaySum;
        }
        $series[] = [
            'name' => 'Under TAT',
            'data' => $underTat,
            'color'=> 'gold',
        ];
        $series[] = [
            'name' => 'Delayed',
            'data' => $delayed,
            'color'=> 'crimson',
        ];

        return response()->json(['x_axis' => $x_axis, 'series' => $series], 200);
    }

    public function procurementOpenAdminGraph() {
        $this->authorize('procurement_list');
        $users = Procurement::distinct()->pluck('created_by');

        $totalCounts = [];
        $underTat = [];
        $delayed = [];
        $x_axis = [];

        foreach($users as $usr) {
            $emp_name = Employee::select('name')->where('user_id', $usr)->first();
            $x_axis[] = ($emp_name != null) ? $emp_name->name : 'Admin';

            //fetch list of complete procurements by individual users
            $procurements = Procurement::where('created_by', $usr)->where('status', 'In Progress')->get();

            $totalCounts[] = $procurements->count();
            $underTatSum = 0;
            $delaySum = 0;

            foreach($procurements as $proc){
                $tat_dt = Carbon::parse($proc->tat);
                $completion_dt = Carbon::now();
                if($completion_dt->lessThanOrEqualTo($tat_dt)) {
                    $underTatSum++;
                } else {
                    $delaySum++;
                }
            }
            $underTat[] = $underTatSum;
            $delayed[] = $delaySum;
        }
        $series[] = [
            'name' => 'Under TAT',
            'data' => $underTat,
            'color'=> 'gold',
        ];
        $series[] = [
            'name' => 'Delayed',
            'data' => $delayed,
            'color'=> 'crimson',
        ];

        return response()->json(['x_axis' => $x_axis, 'series' => $series], 200);
    }

}
