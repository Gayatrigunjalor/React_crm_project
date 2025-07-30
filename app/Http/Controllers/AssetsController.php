<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\AssetsRequest;
use App\Services\AssetService;
use App\Models\Assets;
use App\Models\Employee;
use App\Models\User;
use App\Models\AssetHistory;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AssetsController extends Controller
{
    public function index()
    {
        $this->authorize('assets_list');
        $rows = Assets::with(['vendors:id,name','assetType:id,name'])->orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    public function getAssetID($internal=false)
    {
        $query = Assets::selectRaw('MAX(CAST(SUBSTRING(asset_id, 3, length(asset_id)-2) AS UNSIGNED)) AS asset_id')->first();
        if (!empty($query)) {
            $value2 = $query->asset_id;
            $value2 = intval($value2) + 1;
            $asset_id = "A-" . $value2;
        } else {
            $asset_id = "A-1";
        }

        if($internal){
            return $asset_id;
        }
        return response()->json($asset_id, 200);
    }

    /**
     * @param \App\Http\Requests\AssetsRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(AssetsRequest $request)
    {
        $this->authorize('assets_create');
        $asset_data = [];

        $warranty_card = '';
        if ($request->hasFile('warranty_card')) {
            $attachment = $request->file('warranty_card');
            $attachmentName = 'asset_warr_' . date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/master/assets/' . $attachmentName, file_get_contents($attachment));
            $warranty_card = $attachmentName;
        }

        $invoice_file = '';
        if ($request->hasFile('invoice_file')) {
            $inv_attachment = $request->file('invoice_file');
            $inv_attachmentName = 'asset_inv_' .date('YmdHis') . "." . $inv_attachment->getClientOriginalExtension();
            Storage::put('uploads/master/assets/' . $inv_attachmentName, file_get_contents($inv_attachment));
            $invoice_file = $inv_attachmentName;
        }

        $asset_data = [
            'asset_name' => $request['asset_name'],
            'asset_desc' => $request['asset_desc'],
            'asset_id' => $this->getAssetID(true),
            'asset_type_id' => $request['asset_type_id'],
            'purchase_date' => $request['purchase_date'],
            'warranty_exp_date' => $request['warranty_exp_date'],
            'warranty_card' => $warranty_card,
            'invoice' => $invoice_file,
            'vendor_id' => $request['vendor_id'],
            'created_by' => Auth::id()
        ];

        Assets::create($asset_data);
        return response()->json(['success' => true, 'message' => 'Asset saved successfully'], 200);
    }

    /**
     * @param \App\Http\Requests\AssetsRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateAssets(Request $request)
    {
        $this->authorize('assets_edit');
        $this->validate($request, [
            'asset_name' => 'required|string|max:255',
            'asset_type_id' => 'required|integer',
            'purchase_date' => 'required|date_format:Y-m-d',
            'vendor_id' => 'required|integer',
            'warranty_card' => 'max:2048',
            'invoice_file' => 'max:2048',
        ], [
            'warranty_card' => 'Warranty Card maximum file size is 2 MB.',
            'invoice_file' => 'Invoice copy maximum file size is 2 MB.'
        ]);

        $asset_data = [];

        $warranty_card = '';
        if ($request->hasFile('warranty_card')) {
            $attachment = $request->file('warranty_card');
            $attachmentName = 'asset_warr_' . date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/master/assets/' . $attachmentName, file_get_contents($attachment));
            $warranty_card = $attachmentName;
        }

        $invoice_file = '';
        if ($request->hasFile('invoice_file')) {
            $inv_attachment = $request->file('invoice_file');
            $inv_attachmentName = 'asset_inv_' .date('YmdHis') . "." . $inv_attachment->getClientOriginalExtension();
            Storage::put('uploads/master/assets/' . $inv_attachmentName, file_get_contents($inv_attachment));
            $invoice_file = $inv_attachmentName;
        }

        $asset_data = [
            'asset_name' => $request['asset_name'],
            'asset_desc' => $request['asset_desc'],
            'asset_id' => $this->getAssetID(true),
            'asset_type_id' => $request['asset_type_id'],
            'purchase_date' => $request['purchase_date'],
            'warranty_exp_date' => $request['warranty_exp_date'],
            'warranty_card' => $warranty_card,
            'invoice' => $invoice_file,
            'vendor_id' => $request['vendor_id'],
            'created_by' => Auth::id()
        ];

        Assets::find($request->id)->update($asset_data);
        return response()->json(['success' => true, 'message' => 'Asset updated successfully'], 200);
    }

    public function show($id)
    {
        $this->authorize('assets_edit');
        $rows = Assets::select('*', 'warranty_card as warranty_attachments', 'invoice as invoice_attachments')->with(['vendors:id,name','assetType:id,name'])->find($id);
        return response()->json($rows, 200);
    }
    /**
     * @param  \Illuminate\Http\Request  $request
     * @param \App\Services\AssetService $assetService
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $this->authorize('assets_delete');
        $vendorCount = AssetHistory::where('asset_id', $id)->count();
        if($vendorCount > 0) {
            return response()->json(['success' => false, 'message' => 'Asset cannot be removed as it is used in Asset History\'s record.'], 422);
        } else {
            $asset = Assets::find($id);
            if(!empty($asset->warranty_card)){
                Storage::delete('uploads/master/assets/' . $asset->warranty_card);
            }
            if(!empty($asset->invoice)){
                Storage::delete('uploads/master/assets/' . $asset->invoice);
            }
            if (Assets::find($id)->delete()) {
                return response()->json(['success' => true, 'message' => 'Asset deleted successfully'], 200);
            } else {
                return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
            }
        }
    }

    /**
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function listAssignedAssets($empId)
    {
        $this->authorize('assets_list');
        if(!empty($empId)){
            $employeeRow = Employee::select('id','name')->find($empId);
            return response()->json($employeeRow, 200);
        }
        else{
            return response()->json(['success' => false, 'message' => 'Employee ID not found'], 404);
        }
    }

    /**
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchAssignedAssetsToEmp(Request $request)
    {
        $emp_id = $request['emp_id'];
        $rows = Assets::whereIn('assigned_to_emp', [$emp_id])->get();
        return response()->json($rows, 200);
    }

    /**
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchUnassignedAssets()
    {
        //Fetch assets which are not assigned to any employee
        $rows = Assets::select('id', 'asset_id', 'asset_name', 'asset_desc')->whereNull('assigned_to_emp')->orderBy('asset_id','ASC')->get();
        return response()->json($rows);
    }

    /**
     * Set assigned_to_emp and assigned_date against asset and create history
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function assignAssetToEmployee(Request $request)
    {
        $this->validate($request, [
            'employee_id' => 'required|integer',
            'asset_id' => 'required|integer',
            'remarks' => 'required|string'
        ]);

        $emp_id = $request->employee_id;
        $remarks = $request->remarks;
        $data = array(
            'assigned_to_emp'   => $emp_id,
            'assigned_date'     => date('Y-m-d')
        );

        Assets::find($request->asset_id)->update($data);

        AssetHistory::create([
            'asset_id' => $request->asset_id,
            'employee_id' => $emp_id,
            'assigned_on' => date('Y-m-d'),
            'handover_date' => null,
            'remarks' => $remarks,
            'created_by' => Auth::id()
        ]);

        return response()->json(['success' => true, 'message' => 'Asset assigned successfully' ],200);
    }

    public function unAssignAsset(Request $request)
    {
        $this->validate($request, [
            'id' => 'required|integer',
        ]);
        $asset_id = $request['id'];
        $data = array(
            'assigned_to_emp'   => null,
            'assigned_date'     => null
        );

        $asset = Assets::find($asset_id);
        $emp_id = $asset->assigned_to_emp;
        $assigned_date = $asset->assigned_date;
        //Update assets entry
        $asset->update($data);

        $created_by = Auth::id();
        $user = User::with('employeeDetail')->where('id',$created_by)->first();
        $username = $user->employeeDetail->name ?? 'Admin';

        AssetHistory::create([
            'asset_id' => $asset_id,
            'employee_id' => $emp_id,
            'assigned_on' => $assigned_date,
            'handover_date' => date('Y-m-d'),
            'remarks' => 'Handover process done by '.$username,
            'created_by' => Auth::id()
        ]);
        return response()->json(['success' => true, 'message' => 'Asset unassigned successfully' ],200);
    }

    public function fetchAssetHistory(Request $request)
    {
        $asset_id = $request['id'];
        $rows = AssetHistory::with(['asset:id,asset_id,asset_name,asset_desc','employee:id,user_id,name'])->where('asset_id',$asset_id)->orderBy('assigned_on','DESC')->get();
        if($rows->count() > 0){
            return response()->json($rows,200);
        }
        else{
            return response()->json([],200);
        }
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchAssetsCount()
    {
        $totalAssetCount = Assets::all();
        $totalAssignedCount = $totalAssetCount->whereNotNull('assigned_to_emp')->count();
        $totalUnassignedCount = $totalAssetCount->whereNull('assigned_to_emp')->count();

        return response()->json(['totalAssetCount'=> $totalAssetCount->count(), 'totalAssignedCount'=> $totalAssignedCount, 'totalUnassignedCount'=> $totalUnassignedCount]);
    }

    public function fetchAssetsDashboardData()
    {
        $rows = Assets::with(['vendors:id,name','assetType:id,name','createdName:id,user_id,name','assigned_to_employee:id,user_id,name'])->get();
        if($rows->count() > 0){
            return view('admin.dashboard.assets-credentials.assets-list-rows', compact('rows'));
        }
        else{
            return '<h4 class="my-5 text-center text-danger">No record present in the database!</h4>';
        }
    }
}
