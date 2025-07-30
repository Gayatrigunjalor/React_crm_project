<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Procurement;
use App\Models\ProcurementProducts;
use App\Models\ProcurementVendor;
use App\Models\ProcurementUploads;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
// use App\Notifications\CheckerNotification;
// use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProcurementController extends Controller
{
    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function index()
    {
        $this->authorize('procurement_list');
        $rows = Procurement::select('id','proc_number','product_service_name','description','target_cost','tat','status','assignee_name')
            ->with('uploads:id,procurement_id,name')
            // ->with('products:id,procurement_id,product_service_name,description,target_cost,quantity')
            ->withCount(['products'])
            ->orderBy('id', 'DESC')
            ->get();
        return response()->json($rows, 200);
    }


    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $this->authorize('procurement_create');
        $this->validate($request,[
            'status' => 'required | in:In progress',
            'assignee_name' => 'required',
            'procurementAttachments.files.*' => 'max:5120',
            'proc_products' => 'required | array',
            'proc_products.*.proc_prod_id' => 'required | integer',
            'proc_products.*.product_service_name' => 'required | string | max:255',
        ], [
            'proc_products.*.product_service_name.max' => 'Product name can be 250 characters long'
        ]);

        try {
            $formArray = $request->all();
            $formArray['product_service_name'] = '';
            $formArray['description'] = '';
            $formArray['tat'] = date('Y-m-d');
            $formArray['created_by'] = Auth::id();

            // Get proc_prod_id from first product
            if (!empty($request['proc_products'])) {
                $formArray['proc_prod_id'] = $request['proc_products'][0]['proc_prod_id'];
            }

            $form_id = Procurement::create($formArray);
            Procurement::find($form_id->id)->update(['proc_number' => 'PROC_'.$form_id->id]);

            if ($request->has('procurementAttachments')) {
                foreach($request->procurementAttachments['files'] as $attach) {
                    $attachment = $attach;
                    $attachName = date('YmdHis_') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
                    Storage::put('uploads/procurement/attachments/' . $attachName, file_get_contents($attachment));
                    $data = array(
                        'name' => $attachName,
                        'procurement_id' => $form_id->id,
                        'attachment_type' => "Procurement attachment",
                        'created_by' => Auth::id(),
                    );
                    ProcurementUploads::create($data);
                }
            }

            foreach($request['proc_products'] as $product)
            {
                ProcurementProducts::create([
                    'procurement_id'        => $form_id->id,
                    'product_service_name'  => $product['product_service_name'],
                    'description'           => $product['description'],
                    'target_cost'           => $product['target_cost'],
                    'quantity'              => $product['quantity'],
                    'proc_prod_id'          => $product['proc_prod_id'],
                ]);
            }

            Procurement::find($form_id->id)->update(array('approved' => true));

            return response()->json(['success' => true, 'message' => 'Procurement saved successfully'], 200);
        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $this->authorize('procurement_edit');
        $procurement = Procurement::select('id','proc_number','product_service_name','description','target_cost','tat','status','assignee_name')
        ->with(['assignee:id,name','uploads:id,procurement_id,name', 'products'])
        ->find($id);
        return response()->json($procurement, 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $this->authorize('procurement_edit');
        $this->validate($request,[
            'procurement_attach.*' => 'max:2048',
        ]);
        Procurement::find($id)->update($request->all());

        if ($request->hasfile('procurement_attach')) {
            foreach ($request->file('procurement_attach') as $lc) {
                $lcName = date('YmdHis_') .rand(10000, 99999). "." . $lc->getClientOriginalExtension();
                Storage::put('uploads/procurement/attachments/' . $lcName, file_get_contents($lc));
                $data = array(
                    'name' => $lcName,
                    'procurement_id' => $id,
                    'attachment_type' => "Procurement attachment",
                    'created_by' => Auth::id(),
                );
                ProcurementUploads::create($data);
            }
        }
        if($request->status == 'Complete') {
            Procurement::find($id)->update(['completion_date' => date('Y-m-d')]);
        } else {
            Procurement::find($id)->update(['completion_date' => null]);
        }
        return response()->json(['success' => true, 'message' => 'Procurement updated successfully'], 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchProcurementProducts($id)
    {
        $totalProcurementCount = Procurement::with('products')->find($id);

        return response()->json($totalProcurementCount, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchProcurementCount()
    {
        $totalProcurementCount = Procurement::count();

        return response()->json(['totalProcurementCount' => $totalProcurementCount]);
    }

    public function fetchProcurementDashboardData(Request $request)
    {
        $procurements = new Procurement;
        $procurements = $procurements->select('*');
        //check if start & end date is passed
        if($request['start_date'] != "" && $request['end_date'] != ""){
            $startDate = Carbon::parse($request['start_date'])->toDateTimeString();
            $endDate = Carbon::parse($request['end_date'])->addDays(1)->toDateTimeString();

            $procurements = $procurements->whereBetween('created_at', [$startDate,$endDate]);
        }
        //check if employee id is passed
        if($request['emp_id'] != ""){
            $userIds = [];
            for ($i = 0; $i < count($request['emp_id']); $i++) {
                array_push($userIds, $request['emp_id'][$i]);
            }

            $procurements = $procurements->whereIn('created_by', $userIds);
        }
        $procurements = $procurements->with(['assigneeName','createdName'])->orderBy('id', 'DESC')->get();
        $rows = $procurements;
        if($rows->count() > 0){
            return view('admin.dashboard.procurement.list-rows', compact('rows'));
        }
        else{
            return '<h4 class="my-5 text-center text-danger">No record present in the database!</h4>';
        }
    }

    /**
     * Fetch vendors against procurement_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchDashboardProcVendor(Request $request)
    {
        $id = $request->id;
        $procurement_name = Procurement::select('product_service_name')->where('id',$id)->first();
        $name = $procurement_name->product_service_name;

        $this->authorize('procurement_vendor_list');
        $rows = ProcurementVendor::with('createdName')->leftJoin('vendors', 'vendors.id', '=', 'procurement_vendors.vendor_id')
        ->leftJoin('procurement_attachments', 'procurement_attachments.id', '=', 'procurement_vendors.attachment_id')
        ->get(['procurement_vendors.*', 'vendors.name as vendor_name', 'procurement_attachments.id as attachment_id', 'procurement_attachments.name as attachment_title'])
        ->where('procurement_id',$request->id);
		if ($rows->count() > 0) {
			return view('admin.dashboard.procurement.procurement-vendors-list',compact('rows'))->with(['service_name' => $name]);
		}
        else {
			// return view('<h4 class="my-5 text-center text-danger">No record present in the database!</h4>')->with(['service_name' => $name]);
			return view('admin.dashboard.procurement.procurement-vendors-list',compact('rows'))->with(['service_name' => $name]);
		}
    }

    /**
     * Fetch active employees for procurement dashboard filter
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchProcurementEmployeesDropdown()
    {
        $procurementDashboardEmployees = User::with('employeeDetail')->whereRelation('rolePermissions', 'procurement_create', 1)->whereRelation('rolePermissions', 'procurement_list', 1)->get();
        $i = 0;
        foreach ($procurementDashboardEmployees as $procurementDashboardEmployee) {
                $employeeName =  $procurementDashboardEmployee->employeeDetail->name ?? 'Admin';
                $procurementDashboardEmployees[$i]['employee_name'] = $employeeName;
            $i++;
        }
        // dd($procurementDashboardEmployees);
        return response()->json(['procurementDashboardEmployees' => $procurementDashboardEmployees]);
    }

    /**
     * Fetch procurements performance count data created_by wise
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchDashboardProcurementCounts(Request $request)
    {
        if($request['emp_id'] != ""){
            $userIds = [];
            for ($i = 0; $i < count($request['emp_id']); $i++) {
                array_push($userIds, $request['emp_id'][$i]);
            }
            $procurementEmployees = User::with(['employeeDetail'])->whereIn('id',$userIds)->whereRelation('rolePermissions', 'procurement_create', 1)->whereRelation('rolePermissions', 'procurement_list', 1)->get();
        }
        else{
            $procurementEmployees = User::with(['employeeDetail'])->whereRelation('rolePermissions', 'procurement_create', 1)->whereRelation('rolePermissions', 'procurement_list', 1)->get();
        }

        $i = 0;
        foreach ($procurementEmployees as $procurementEmp) {
            $employeeName =  $procurementEmp->employeeDetail->name ?? 'Admin';
            $procurementEmployees[$i]['employee_name'] = $employeeName;
            $i++;
        }
        // dd($procurementEmployees);
        $j = 0;
        foreach($procurementEmployees as $row)
        {

            if($request['start_date'] != "" && $request['end_date'] != ""){
                $startDate = Carbon::parse($request['start_date'])->toDateTimeString();
                $endDate = Carbon::parse($request['end_date'])->addDays(1)->toDateTimeString();

                // $directory = $directory->whereBetween('created_at', [$startDate,$endDate]);
                // $procurementEmployees[$j]['totalDirectives'] = Procurement::where('created_by', $row->id)->whereBetween('created_at', [$startDate,$endDate])->count();
                $procurementEmployees[$j]['totalProcurements'] = Procurement::where('created_by', $row->id)->whereBetween('created_at', [$startDate,$endDate])->count();
                $procurementEmployees[$j]['total_completed_count'] = Procurement::where('created_by', $row->id)->where('status', 'Complete')->whereBetween('created_at', [$startDate,$endDate])->count();
                $procurementEmployees[$j]['total_inprogress_count'] = Procurement::where('created_by', $row->id)->where('status', 'In progress')->whereBetween('created_at', [$startDate,$endDate])->count();
                $procurements = Procurement::select('id','status','tat','target_cost')->where('created_by', $row->id)->whereBetween('created_at', [$startDate,$endDate])->get();
                $poorCount = 0;
                $fairCount = 0;
                $good = 0;
                $veryGood = 0;
                $excellent = 0;
                $total_vendors_count = 0;
                if($procurements->count() > 0){
                    foreach($procurements as $procurement){
                       $vendorCount = ProcurementVendor::where('procurement_id', $procurement->id)->count();

                       //    $vendorCount = $procs->vendors_count;
                        if($vendorCount > 0){
                            if($vendorCount < 3){
                                $poorCount++;
                            }
                            elseif($vendorCount >=3 && $vendorCount <=4){
                                $fairCount++;
                            }
                            elseif($vendorCount >=5 && $vendorCount <=6){
                                $good++;
                            }
                            elseif($vendorCount >=7 && $vendorCount <=9){
                                $veryGood++;
                            }
                            elseif($vendorCount > 10){
                                $excellent++;
                            }
                            $total_vendors_count += $vendorCount;
                        }
                    }
                }
                $procurementEmployees[$j]['poorCount'] = $poorCount;
                $procurementEmployees[$j]['fairCount'] = $fairCount;
                $procurementEmployees[$j]['good'] = $good;
                $procurementEmployees[$j]['veryGood'] = $veryGood;
                $procurementEmployees[$j]['excellent'] = $excellent;
                $procurementEmployees[$j]['total_vendors_count'] = $total_vendors_count;

                $under_target_cost = 0;
                $no_target_cost = 0;
                $target_cost_exceeded = 0;
                $under_TAT = 0;
                $tat_expired = 0;
                if($procurements->count() > 0){
                    foreach($procurements as $procurement){
                        if($procurement->status == 'Complete')
                        {
                            if(!empty($procurement->target_cost)){
                                $target_cost = $procurement->target_cost;
                                $procurement_vendors = ProcurementVendor::where('procurement_id', $procurement->id)->get();
                                if($procurement_vendors->count() > 0){
                                    foreach($procurement_vendors as $procVendor){
                                        $grand_total = $procVendor->grand_total;
                                        if($target_cost > $grand_total){
                                            $under_target_cost++;
                                        }else{
                                            $target_cost_exceeded++;
                                        }
                                    }
                                }
                            }else{
                                $no_target_cost++;
                            }
                        }
                        else{
                            $vendorAddedBeforeTat = ProcurementVendor::where('procurement_id', $procurement->id)->where(DB::raw('DATE_FORMAT(`created_at`, "%Y-%m-%d")'), '<', $procurement->tat)->count();
                            if($vendorAddedBeforeTat > 0){
                                $under_TAT += $vendorAddedBeforeTat;
                            }

                            $vendorAddedAfterTat = ProcurementVendor::where('procurement_id', $procurement->id)->where(DB::raw('DATE_FORMAT(`created_at`, "%Y-%m-%d")'), '>=', $procurement->tat)->count();
                            if($vendorAddedAfterTat > 0){
                                $tat_expired += $vendorAddedAfterTat;
                            }
                        }
                    }
                }
                $procurementEmployees[$j]['under_target_cost_count'] = $under_target_cost;
                $procurementEmployees[$j]['no_target_cost_count'] = $no_target_cost;
                $procurementEmployees[$j]['target_cost_exceeded_count'] = $target_cost_exceeded;
                $procurementEmployees[$j]['under_TAT_count'] = $under_TAT;
                $procurementEmployees[$j]['tat_expired_count'] = $tat_expired;

                $j++;
            }
            else{
                $procurementEmployees[$j]['totalProcurements'] = Procurement::where('created_by', $row->id)->count();
                $procurementEmployees[$j]['total_completed_count'] = Procurement::where('created_by', $row->id)->where('status', 'Complete')->count();
                $procurementEmployees[$j]['total_inprogress_count'] = Procurement::where('created_by', $row->id)->where('status', 'In progress')->count();
                $procurements = Procurement::select('id','status','tat','target_cost')->where('created_by', $row->id)->get();
                $poorCount = 0;
                $fairCount = 0;
                $good = 0;
                $veryGood = 0;
                $excellent = 0;
                $total_vendors_count = 0;
                if($procurements->count() > 0){
                    foreach($procurements as $procurement){
                       $vendorCount = ProcurementVendor::where('procurement_id', $procurement->id)->count();

                       //    $vendorCount = $procs->vendors_count;
                        if($vendorCount > 0){
                            if($vendorCount < 3){
                                $poorCount++;
                            }
                            elseif($vendorCount >=3 && $vendorCount <=4){
                                $fairCount++;
                            }
                            elseif($vendorCount >=5 && $vendorCount <=6){
                                $good++;
                            }
                            elseif($vendorCount >=7 && $vendorCount <=9){
                                $veryGood++;
                            }
                            elseif($vendorCount > 10){
                                $excellent++;
                            }
                            $total_vendors_count += $vendorCount;
                        }
                    }
                }
                $procurementEmployees[$j]['poorCount'] = $poorCount;
                $procurementEmployees[$j]['fairCount'] = $fairCount;
                $procurementEmployees[$j]['good'] = $good;
                $procurementEmployees[$j]['veryGood'] = $veryGood;
                $procurementEmployees[$j]['excellent'] = $excellent;
                $procurementEmployees[$j]['total_vendors_count'] = $total_vendors_count;

                $under_target_cost = 0;
                $no_target_cost = 0;
                $target_cost_exceeded = 0;
                $under_TAT = 0;
                $tat_expired = 0;
                if($procurements->count() > 0){
                    foreach($procurements as $procurement){
                        if($procurement->status == 'Complete')
                        {
                            if(!empty($procurement->target_cost)){
                                $target_cost = $procurement->target_cost;
                                $procurement_vendors = ProcurementVendor::where('procurement_id', $procurement->id)->get();
                                if($procurement_vendors->count() > 0){
                                    foreach($procurement_vendors as $procVendor){
                                        $grand_total = $procVendor->grand_total;
                                        if($target_cost >= $grand_total){
                                            $under_target_cost++;
                                        }else{
                                            $target_cost_exceeded++;
                                        }
                                    }
                                }
                            }else{
                                $no_target_cost++;
                            }
                        }
                        else{
                            $vendorAddedBeforeTat = ProcurementVendor::where('procurement_id', $procurement->id)->where(DB::raw('DATE_FORMAT(`created_at`, "%Y-%m-%d")'), '<', $procurement->tat)->count();
                            if($vendorAddedBeforeTat > 0){
                                $under_TAT += $vendorAddedBeforeTat;
                            }

                            $vendorAddedAfterTat = ProcurementVendor::where('procurement_id', $procurement->id)->where(DB::raw('DATE_FORMAT(`created_at`, "%Y-%m-%d")'), '>=', $procurement->tat)->count();
                            if($vendorAddedAfterTat > 0){
                                $tat_expired += $vendorAddedAfterTat;
                            }
                        }
                    }
                }
                $procurementEmployees[$j]['under_target_cost_count'] = $under_target_cost;
                $procurementEmployees[$j]['no_target_cost_count'] = $no_target_cost;
                $procurementEmployees[$j]['target_cost_exceeded_count'] = $target_cost_exceeded;
                $procurementEmployees[$j]['under_TAT_count'] = $under_TAT;
                $procurementEmployees[$j]['tat_expired_count'] = $tat_expired;

                $j++;
            }

        }

        if ($procurementEmployees->count() > 0) {
            return view('admin.dashboard.procurement.procurement-performance-count', compact('procurementEmployees'));
        } else {
            return '<h4 class="my-5 text-center text-danger">No record present in the database!</h4>';
        }
    }


    /**
     * Fetch titles on procurements count click
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchProcurementComparisonData(Request $request)
    {
        $user_id = $request->user_id;
        $fetch_title = $request->fetch_title;
        $titles = array();
        if($fetch_title == "totalProcurements"){
            $titles = Procurement::select('id','product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')->with('assigneeName:id,user_id,name')->where('created_by', $user_id)->get();
        }
        //
        if($fetch_title == "total_vendors_count"){
            $vendors = Procurement::select('id', 'product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')->with('assigneeName:id,user_id,name')->where('created_by', $user_id)->withCount('vendors')->having('vendors_count','>',0)->get();

            $titles = $vendors;
        }
        if($fetch_title == "poorCount"){
            $titles = Procurement::select('id', 'product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')->with('assigneeName:id,user_id,name')->where('created_by', $user_id)->withCount('vendors')->having('vendors_count','>',0)->having('vendors_count','<=',3)->get();
        }
        if($fetch_title == "fairCount"){
            $titles = Procurement::select('id', 'product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')->with('assigneeName:id,user_id,name')->where('created_by', $user_id)->withCount('vendors')->having('vendors_count','>',3)->having('vendors_count','<=',4)->get();
        }
        if($fetch_title == "good"){
            $titles = Procurement::select('id', 'product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')->with('assigneeName:id,user_id,name')->where('created_by', $user_id)->withCount('vendors')->having('vendors_count','>',5)->having('vendors_count','<=',6)->get();
        }
        if($fetch_title == "veryGood"){
            $titles = Procurement::select('id', 'product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')->with('assigneeName:id,user_id,name')->where('created_by', $user_id)->withCount('vendors')->having('vendors_count','>',7)->having('vendors_count','<=',9)->get();
        }
        if($fetch_title == "excellent"){
            $titles = Procurement::select('id', 'product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')->with('assigneeName:id,user_id,name')->where('created_by', $user_id)->withCount('vendors')->having('vendors_count','>',10)->get();
        }
        if($fetch_title == "total_completed_count"){
            $titles = Procurement::select('product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')->with('assigneeName:id,user_id,name')->where('created_by', $user_id)->where('status','Complete')->get();
        }
        if($fetch_title == "no_target_cost_count"){
            $titles = Procurement::select('product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')->with('assigneeName:id,user_id,name')->where('created_by', $user_id)->where(
                function($query) {
                        return $query
                            ->whereNull('target_cost')
                            ->orWhere('target_cost','=',"");
                    }
            )->get();
        }
        if($fetch_title == "under_target_cost_count"){
            $records = array();
            $procurements = Procurement::select('id', 'product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')->with('assigneeName:id,user_id,name')->where('created_by', $user_id)->get();
            if($procurements->count() > 0){
                foreach($procurements as $procurement){
                    if($procurement['status'] == "Complete"){
                        if(!empty($procurement->target_cost)){
                            $target_cost = $procurement->target_cost;
                            $procurement_vendors = ProcurementVendor::where('procurement_id', $procurement->id)->get();
                            if($procurement_vendors->count() > 0){
                                foreach($procurement_vendors as $procVendor){
                                    $grand_total = $procVendor->grand_total;
                                    if($grand_total < $target_cost){
                                        $records[] = $procurement;
                                    }else{
                                        continue;
                                    }
                                }
                            }
                        }
                    }
                    else{
                        continue;
                    }
                }
            }
            $titles = array_unique($records);
        }
        if($fetch_title == "target_cost_exceeded_count"){
            $records = array();
            $procurements = Procurement::select('id', 'product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')->with('assigneeName:id,user_id,name')->where('created_by', $user_id)->get();
            if($procurements->count() > 0){
                foreach($procurements as $procurement){
                    if($procurement['status'] == "Complete"){
                        if(!empty($procurement->target_cost)){
                            $target_cost = $procurement->target_cost;
                            $procurement_vendors = ProcurementVendor::where('procurement_id', $procurement->id)->get();
                            if($procurement_vendors->count() > 0){
                                foreach($procurement_vendors as $procVendor){
                                    $grand_total = $procVendor->grand_total;
                                    if($grand_total > $target_cost){
                                        $records[] = $procurement;
                                    }else{
                                        continue;
                                    }
                                }
                            }
                        }
                    }
                    else{
                        continue;
                    }
                }
            }

            $titles = array_unique($records);
        }
        if($fetch_title == "total_inprogress_count"){
            $titles = Procurement::select('product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')->with('assigneeName:id,user_id,name')->where('created_by', $user_id)->where('status','In progress')->get();
        }
        if($fetch_title == "under_TAT_count"){
            $procurements = Procurement::select('procurements.id', 'product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')
                            ->leftJoin('procurement_vendors', 'procurements.id', '=', 'procurement_vendors.procurement_id')
                            ->where(DB::raw('DATE_FORMAT(`procurement_vendors.created_at`, "%Y-%m-%d")'), '<', 'procurements.tat')
                            ->with('assigneeName:id,user_id,name')->where('procurements.created_by', $user_id)->get();

            $titles = array_unique($procurements);
        }
        if($fetch_title == "tat_expired_count"){
            $procurements = Procurement::select('procurements.id', 'product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')
            ->leftJoin('procurement_vendors', 'procurements.id', '=', 'procurement_vendors.procurement_id')
            ->where(DB::raw('DATE_FORMAT(`procurement_vendors.created_at`, "%Y-%m-%d")'), '>', 'procurements.tat')
            ->with('assigneeName:id,user_id,name')->where('procurements.created_by', $user_id)->get();

            $titles = array_unique($procurements);
        }
        return response()->json($titles);
    }

    /**
     * Fetch procurements performance count data created_by wise
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchAssigneePerformanceCounts(Request $request)
    {
        if($request['emp_id'] != ""){
            $userIds = [];
            for ($i = 0; $i < count($request['emp_id']); $i++) {
                array_push($userIds, $request['emp_id'][$i]);
            }
            $procurementEmployees = User::with(['employeeDetail'])->where('id', '!=', 1)->whereIn('id',$userIds)->whereRelation('rolePermissions', 'procurement_create', 1)->whereRelation('rolePermissions', 'procurement_list', 1)->get();
        }
        else{
            $procurementEmployees = User::with(['employeeDetail'])->where('id', '!=', 1)->whereRelation('rolePermissions', 'procurement_create', 1)->whereRelation('rolePermissions', 'procurement_list', 1)->get();
        }

        $i = 0;
        foreach ($procurementEmployees as $procurementEmp) {
            $employeeName =  $procurementEmp->employeeDetail->name ?? 'Admin';
            $procurementEmployees[$i]['employee_name'] = $employeeName;
            $i++;
        }
        // dd($procurementEmployees);
        $j = 0;
        foreach($procurementEmployees as $row)
        {
            if($row->employeeDetail == null)
            {
                $employee_id = 1;
            }
            else{
                $employee_id = $row->employeeDetail->id;
            }

            if($request['start_date'] != "" && $request['end_date'] != ""){
                $startDate = Carbon::parse($request['start_date'])->toDateTimeString();
                $endDate = Carbon::parse($request['end_date'])->addDays(1)->toDateTimeString();

                // $directory = $directory->whereBetween('created_at', [$startDate,$endDate]);
                $procurementEmployees[$j]['totalProcurements'] = Procurement::where('assignee_name', $employee_id)->whereBetween('created_at', [$startDate,$endDate])->count();
                $procurementEmployees[$j]['total_completed_count'] = Procurement::where('assignee_name', $employee_id)->where('status', 'Complete')->whereBetween('created_at', [$startDate,$endDate])->count();
                $procurementEmployees[$j]['total_inprogress_count'] = Procurement::where('assignee_name', $employee_id)->where('status', 'In progress')->whereBetween('created_at', [$startDate,$endDate])->count();
                $procurements = Procurement::select('id','status','tat','target_cost')->where('assignee_name', $employee_id)->whereBetween('created_at', [$startDate,$endDate])->get();
                $poorCount = 0;
                $fairCount = 0;
                $good = 0;
                $veryGood = 0;
                $excellent = 0;
                $total_vendors_count = 0;
                if($procurements->count() > 0){
                    foreach($procurements as $procurement){
                       $vendorCount = ProcurementVendor::where('procurement_id', $procurement->id)->count();

                       //    $vendorCount = $procs->vendors_count;
                        if($vendorCount > 0){
                            if($vendorCount < 3){
                                $poorCount++;
                            }
                            elseif($vendorCount >=3 && $vendorCount <=4){
                                $fairCount++;
                            }
                            elseif($vendorCount >=5 && $vendorCount <=6){
                                $good++;
                            }
                            elseif($vendorCount >=7 && $vendorCount <=9){
                                $veryGood++;
                            }
                            elseif($vendorCount > 10){
                                $excellent++;
                            }
                            $total_vendors_count += $vendorCount;
                        }
                    }
                }
                $procurementEmployees[$j]['poorCount'] = $poorCount;
                $procurementEmployees[$j]['fairCount'] = $fairCount;
                $procurementEmployees[$j]['good'] = $good;
                $procurementEmployees[$j]['veryGood'] = $veryGood;
                $procurementEmployees[$j]['excellent'] = $excellent;
                $procurementEmployees[$j]['total_vendors_count'] = $total_vendors_count;

                $under_target_cost = 0;
                $no_target_cost = 0;
                $target_cost_exceeded = 0;
                $under_TAT = 0;
                $tat_expired = 0;
                if($procurements->count() > 0){
                    foreach($procurements as $procurement){
                        if($procurement->status == 'Complete')
                        {
                            if(!empty($procurement->target_cost)){
                                $target_cost = $procurement->target_cost;
                                $procurement_vendors = ProcurementVendor::where('procurement_id', $procurement->id)->get();
                                if($procurement_vendors->count() > 0){
                                    foreach($procurement_vendors as $procVendor){
                                        $grand_total = $procVendor->grand_total;
                                        if($target_cost > $grand_total){
                                            $under_target_cost++;
                                        }else{
                                            $target_cost_exceeded++;
                                        }
                                    }
                                }
                            }else{
                                $no_target_cost++;
                            }
                        }
                        else{
                            $vendorAddedBeforeTat = ProcurementVendor::where('procurement_id', $procurement->id)->where(DB::raw('DATE_FORMAT(`created_at`, "%Y-%m-%d")'), '<', $procurement->tat)->count();
                            if($vendorAddedBeforeTat > 0){
                                $under_TAT += $vendorAddedBeforeTat;
                            }

                            $vendorAddedAfterTat = ProcurementVendor::where('procurement_id', $procurement->id)->where(DB::raw('DATE_FORMAT(`created_at`, "%Y-%m-%d")'), '>=', $procurement->tat)->count();
                            if($vendorAddedAfterTat > 0){
                                $tat_expired += $vendorAddedAfterTat;
                            }
                        }
                    }
                }
                $procurementEmployees[$j]['under_target_cost_count'] = $under_target_cost;
                $procurementEmployees[$j]['no_target_cost_count'] = $no_target_cost;
                $procurementEmployees[$j]['target_cost_exceeded_count'] = $target_cost_exceeded;
                $procurementEmployees[$j]['under_TAT_count'] = $under_TAT;
                $procurementEmployees[$j]['tat_expired_count'] = $tat_expired;

                $j++;
            }
            else{
                $procurementEmployees[$j]['totalProcurements'] = Procurement::where('assignee_name', $employee_id)->count();
                $procurementEmployees[$j]['total_completed_count'] = Procurement::where('assignee_name', $employee_id)->where('status', 'Complete')->count();
                $procurementEmployees[$j]['total_inprogress_count'] = Procurement::where('assignee_name', $employee_id)->where('status', 'In progress')->count();
                $procurements = Procurement::select('id','status','tat','target_cost')->where('assignee_name', $employee_id)->get();
                $poorCount = 0;
                $fairCount = 0;
                $good = 0;
                $veryGood = 0;
                $excellent = 0;
                $total_vendors_count = 0;
                if($procurements->count() > 0){
                    foreach($procurements as $procurement){
                       $vendorCount = ProcurementVendor::where('procurement_id', $procurement->id)->count();

                       //    $vendorCount = $procs->vendors_count;
                        if($vendorCount > 0){
                            if($vendorCount < 3){
                                $poorCount++;
                            }
                            elseif($vendorCount >=3 && $vendorCount <=4){
                                $fairCount++;
                            }
                            elseif($vendorCount >=5 && $vendorCount <=6){
                                $good++;
                            }
                            elseif($vendorCount >=7 && $vendorCount <=9){
                                $veryGood++;
                            }
                            elseif($vendorCount > 10){
                                $excellent++;
                            }
                            $total_vendors_count += $vendorCount;
                        }
                    }
                }
                $procurementEmployees[$j]['poorCount'] = $poorCount;
                $procurementEmployees[$j]['fairCount'] = $fairCount;
                $procurementEmployees[$j]['good'] = $good;
                $procurementEmployees[$j]['veryGood'] = $veryGood;
                $procurementEmployees[$j]['excellent'] = $excellent;
                $procurementEmployees[$j]['total_vendors_count'] = $total_vendors_count;

                $under_target_cost = 0;
                $no_target_cost = 0;
                $target_cost_exceeded = 0;
                $under_TAT = 0;
                $tat_expired = 0;
                if($procurements->count() > 0){
                    foreach($procurements as $procurement){
                        if($procurement->status == 'Complete')
                        {
                            if(!empty($procurement->target_cost)){
                                $target_cost = $procurement->target_cost;
                                $procurement_vendors = ProcurementVendor::where('procurement_id', $procurement->id)->get();
                                if($procurement_vendors->count() > 0){
                                    foreach($procurement_vendors as $procVendor){
                                        $grand_total = $procVendor->grand_total;
                                        if($target_cost >= $grand_total){
                                            $under_target_cost++;
                                        }else{
                                            $target_cost_exceeded++;
                                        }
                                    }
                                }
                            }else{
                                $no_target_cost++;
                            }
                        }
                        else{
                            $vendorAddedBeforeTat = ProcurementVendor::where('procurement_id', $procurement->id)->where(DB::raw('DATE_FORMAT(`created_at`, "%Y-%m-%d")'), '<', $procurement->tat)->count();
                            if($vendorAddedBeforeTat > 0){
                                $under_TAT += $vendorAddedBeforeTat;
                            }

                            $vendorAddedAfterTat = ProcurementVendor::where('procurement_id', $procurement->id)->where(DB::raw('DATE_FORMAT(`created_at`, "%Y-%m-%d")'), '>=', $procurement->tat)->count();
                            if($vendorAddedAfterTat > 0){
                                $tat_expired += $vendorAddedAfterTat;
                            }
                        }
                    }
                }
                $procurementEmployees[$j]['under_target_cost_count'] = $under_target_cost;
                $procurementEmployees[$j]['no_target_cost_count'] = $no_target_cost;
                $procurementEmployees[$j]['target_cost_exceeded_count'] = $target_cost_exceeded;
                $procurementEmployees[$j]['under_TAT_count'] = $under_TAT;
                $procurementEmployees[$j]['tat_expired_count'] = $tat_expired;

                $j++;
            }

        }

        if ($procurementEmployees->count() > 0) {
            return view('admin.dashboard.procurement.procurement-assignee-performance', compact('procurementEmployees'));
        } else {
            return '<h4 class="my-5 text-center text-danger">No record present in the database!</h4>';
        }
    }

    /**
     * Fetch titles on procurements count click
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchProcurementAssigneeTitles(Request $request)
    {
        $user_id = $request->user_id;
        $fetch_title = $request->fetch_title;
        $titles = array();
        if($fetch_title == "totalProcurements"){
            $titles = Procurement::select('id','product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')->with('assigneeName:id,user_id,name')->where('assignee_name', $user_id)->get();
        }
        //
        if($fetch_title == "total_vendors_count"){
            $vendors = Procurement::select('id', 'product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')->with('assigneeName:id,user_id,name')->where('assignee_name', $user_id)->withCount('vendors')->having('vendors_count','>',0)->get();

            $titles = $vendors;
        }
        if($fetch_title == "poorCount"){
            $titles = Procurement::select('id', 'product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')->with('assigneeName:id,user_id,name')->where('assignee_name', $user_id)->withCount('vendors')->having('vendors_count','>',0)->having('vendors_count','<=',3)->get();
        }
        if($fetch_title == "fairCount"){
            $titles = Procurement::select('id', 'product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')->with('assigneeName:id,user_id,name')->where('assignee_name', $user_id)->withCount('vendors')->having('vendors_count','>',3)->having('vendors_count','<=',4)->get();
        }
        if($fetch_title == "good"){
            $titles = Procurement::select('id', 'product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')->with('assigneeName:id,user_id,name')->where('assignee_name', $user_id)->withCount('vendors')->having('vendors_count','>',5)->having('vendors_count','<=',6)->get();
        }
        if($fetch_title == "veryGood"){
            $titles = Procurement::select('id', 'product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')->with('assigneeName:id,user_id,name')->where('assignee_name', $user_id)->withCount('vendors')->having('vendors_count','>',7)->having('vendors_count','<=',9)->get();
        }
        if($fetch_title == "excellent"){
            $titles = Procurement::select('id', 'product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')->with('assigneeName:id,user_id,name')->where('assignee_name', $user_id)->withCount('vendors')->having('vendors_count','>',10)->get();
        }
        if($fetch_title == "total_completed_count"){
            $titles = Procurement::select('product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')->with('assigneeName:id,user_id,name')->where('assignee_name', $user_id)->where('status','Complete')->get();
        }
        if($fetch_title == "no_target_cost_count"){
            $titles = Procurement::select('product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')->with('assigneeName:id,user_id,name')->where('assignee_name', $user_id)->where(
                function($query) {
                        return $query
                            ->whereNull('target_cost')
                            ->orWhere('target_cost','=',"");
                    }
            )->get();
        }
        if($fetch_title == "under_target_cost_count"){
            $records = array();
            $procurements = Procurement::select('id', 'product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')->with('assigneeName:id,user_id,name')->where('assignee_name', $user_id)->get();
            if($procurements->count() > 0){
                foreach($procurements as $procurement){
                    if($procurement['status'] == "Complete"){
                        if(!empty($procurement->target_cost)){
                            $target_cost = $procurement->target_cost;
                            $procurement_vendors = ProcurementVendor::where('procurement_id', $procurement->id)->get();
                            if($procurement_vendors->count() > 0){
                                foreach($procurement_vendors as $procVendor){
                                    $grand_total = $procVendor->grand_total;
                                    if($grand_total < $target_cost){
                                        $records[] = $procurement;
                                    }else{
                                        continue;
                                    }
                                }
                            }
                        }
                    }
                    else{
                        continue;
                    }
                }
            }
            $titles = array_unique($records);
        }
        if($fetch_title == "target_cost_exceeded_count"){
            $records = array();
            $procurements = Procurement::select('id', 'product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')->with('assigneeName:id,user_id,name')->where('assignee_name', $user_id)->get();
            if($procurements->count() > 0){
                foreach($procurements as $procurement){
                    if($procurement['status'] == "Complete"){
                        if(!empty($procurement->target_cost)){
                            $target_cost = $procurement->target_cost;
                            $procurement_vendors = ProcurementVendor::where('procurement_id', $procurement->id)->get();
                            if($procurement_vendors->count() > 0){
                                foreach($procurement_vendors as $procVendor){
                                    $grand_total = $procVendor->grand_total;
                                    if($grand_total > $target_cost){
                                        $records[] = $procurement;
                                    }else{
                                        continue;
                                    }
                                }
                            }
                        }
                    }
                    else{
                        continue;
                    }
                }
            }

            $titles = array_unique($records);
        }
        if($fetch_title == "total_inprogress_count"){
            $titles = Procurement::select('product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')->with('assigneeName:id,user_id,name')->where('assignee_name', $user_id)->where('status','In progress')->get();
        }
        if($fetch_title == "under_TAT_count"){
            $procurements = Procurement::select('procurements.id', 'product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')
                            ->leftJoin('procurement_vendors', 'procurements.id', '=', 'procurement_vendors.procurement_id')
                            ->where(DB::raw('DATE_FORMAT(`procurement_vendors.created_at`, "%Y-%m-%d")'), '<', 'procurements.tat')
                            ->with('assigneeName:id,user_id,name')->where('procurements.assignee_name', $user_id)->get();

            $titles = array_unique($procurements);
        }
        if($fetch_title == "tat_expired_count"){
            $procurements = Procurement::select('procurements.id', 'product_service_name', 'tat', 'target_cost', 'status', 'assignee_name')
            ->leftJoin('procurement_vendors', 'procurements.id', '=', 'procurement_vendors.procurement_id')
            ->where(DB::raw('DATE_FORMAT(`procurement_vendors.created_at`, "%Y-%m-%d")'), '>', 'procurements.tat')
            ->with('assigneeName:id,user_id,name')->where('procurements.assignee_name', $user_id)->get();

            $titles = array_unique($procurements);
        }
        return response()->json($titles);
    }
}
