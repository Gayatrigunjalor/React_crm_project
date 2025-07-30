<?php

namespace App\Services;

use App\Models\BusinessTask;
use Illuminate\Http\Request;
use App\Models\PurchaseOrder;
use App\Models\BusinessTaskEdit;
use App\Models\BusinessTaskView;
use App\Models\PmWorksheetBt;
use App\Models\VendorPurchaseInvoice;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class PmWorksheetBtService
{
    private function returnBack(){
        Session::flash('incorrect_company_id','The Purchase Order you are trying to access is created from different company, to access it please switch company from the navbar.');
    }

    public function pmWorksheetEdit($id)
    {
        $businessTask = BusinessTask::with('proforma_invoice')->where("id", $id)->first();
        // if($businessTask->company_id != session('company_id')){
        //     $this->returnBack();
        //     return redirect('/business-task');
        // }
        // $editRole = BusinessTaskEdit::where('id', 1)->first();
        $pos = PurchaseOrder::get();
        $user = Auth::user();
        if ($user->user_role == 0) {
            $roleId =  0;
        } else {
            $roleId =  $user->employeeRole->role_id;
        }


        return view('admin.business-task.pm-worksheet.pm-worksheet-form', compact('businessTask', 'editRole', 'roleId', 'viewRole', 'pos', 'po_on_bt', 'po_numbers', 'vendor_invoices','vendor_no', 'supplier_names'));
    }

    public function updatePmWorksheet(Request $request, $id)
    {
        if (PmWorksheetBt::find($id)->update([
            'make1' => $request->make1,
            'model1' => $request->model1,
            'supplier_name2' => $request->supplier_name2,
            'warranty_extension' => $request->warranty_extension,
            'product_authenticity' => $request->product_authenticity,
            'physical_verification' => $request->physical_verification,
            'ready_stock_quantity' => $request->ready_stock_quantity,
            'lead_time' => $request->lead_time,
            'custvsvendcommitment' => $request->custvsvendcommitment,
            'expiry' => $request->expiry,
            'proformainvvsvendorqot' => $request->proformainvvsvendorqot,
            'quantity1' => $request->quantity1,
            'technicalspecipm' => $request->technicalspecipm,
            'productspecicrutiny' => $request->productspecicrutiny,
            'condition1' => $request->condition1,
            'product_type1' => $request->product_type1,
            'transportation_cost' => $request->transportation_cost,
            'warrenty' => $request->warrenty,
            'year_of_manufacturing1' => $request->year_of_manufacturing1,
            'packaging_cost' => $request->packaging_cost
        ])) {
            return response()->json(['success' => true, 'message' => 'Purchase Dept Scrutiny updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    public function addPmWorksheet(Request $request)
    {
        if (PmWorksheetBt::create([
            'make1' => $request->make1,
            'model1' => $request->model1,
            'supplier_name2' => $request->supplier_name2,
            'warranty_extension' => $request->warranty_extension,
            'product_authenticity' => $request->product_authenticity,
            'physical_verification' => $request->physical_verification,
            'ready_stock_quantity' => $request->ready_stock_quantity,
            'lead_time' => $request->lead_time,
            'custvsvendcommitment' => $request->custvsvendcommitment,
            'expiry' => $request->expiry,
            'proformainvvsvendorqot' => $request->proformainvvsvendorqot,
            'quantity1' => $request->quantity1,
            'technicalspecipm' => $request->technicalspecipm,
            'productspecicrutiny' => $request->productspecicrutiny,
            'condition1' => $request->condition1,
            'product_type1' => $request->product_type1,
            'transportation_cost' => $request->transportation_cost,
            'warrenty' => $request->warrenty,
            'year_of_manufacturing1' => $request->year_of_manufacturing1,
            'packaging_cost' => $request->packaging_cost,
            'business_task_id' => $request->business_task_id,
            'created_by' => Auth::id()
        ])) {
            return response()->json(['success' => true, 'message' => 'Purchase Dept Scrutiny saved successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }
    public function getPmWorksheetBt($id)
    {
        $pdsRows = PmWorksheetBt::where('business_task_id', $id)->get();
        if ($pdsRows->count() > 0) {
            return response()->json($pdsRows, 200);
        } else {
            return response()->json([], 200);
        }
    }
}
