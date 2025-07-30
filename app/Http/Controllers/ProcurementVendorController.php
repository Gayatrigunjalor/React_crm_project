<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Procurement;
use App\Models\ProcurementAttachment;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use App\Models\ProcurementVendor;
use Illuminate\Support\Facades\Auth;
use App\Notifications\CheckerNotification;
use Illuminate\Support\Facades\Notification;

class ProcurementVendorController extends Controller
{

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    public function index($id) {
        $this->authorize('procurement_vendor_list');
        $procurement = Procurement::select('id','proc_number','product_service_name','tat','status','assignee_name','created_by')
            ->with([
                'assignee:id,name',
                'createdName:id,user_id,name',
            ])
            ->with('products', function($query) {
                $query->select('id','procurement_id','product_service_name','quantity')
                ->withCount('procurementProductVendors');
            })
            ->find($id);
        if(!empty($procurement)){
            $rows = ProcurementVendor::select('id','vendor_id','procurement_id','warranty','attachment_id')
                    ->with(['vendors:id,name','procurement_attachments:id,name,procurement_id'])
                    ->where('procurement_id', $procurement->id)
                    ->get();
            return response()->json([
                'procurement' => $procurement,
                'vendors' => ($rows->count() > 0) ? $rows : []
            ],200);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request) {
        $this->authorize('procurement_vendor_create');
        try {

            $formArray = $request->all();
            $formArray['created_by'] = Auth::id();
            $this->validate($request,[
                'attachment' => 'max:2048',
            ]);
            $attachmentArray = array(
                'attachment_name' => $request->attachment_name,
                'details' => $request->details,
                'procurement_id' => $request->procurement_id,
            );
            if ($request->hasFile('attachment')) {
                $attachment = $request->file('attachment');
                $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
                Storage::put('uploads/procurement/attachments/' . $attachmentName, file_get_contents($attachment));
                $attachmentArray['name'] = "$attachmentName";
            }

            //create attachment in procurement_attachments table
            $attachment_id = ProcurementAttachment::create($attachmentArray);
            $formArray['attachment_id'] = $attachment_id->id;
            //create attachment in procurement_vendors table with attachment_id
            $form_id = ProcurementVendor::create($formArray);
            if(Auth::user()->user_role == 0){
                ProcurementVendor::find($form_id->id)->update(array('approved' => true));
                ProcurementAttachment::find($attachment_id->id)->update(['approved' => true]);
            }
            else{
                // $checker = User::find(Auth::id());
                // $checkerData = [
                //     'subject' => 'New Procurement Vendor Created',
                //     'body' => 'New Procurement Vendor Is Created by '. $checker->employeeDetail->name .' Please Check It',
                //     'url' => '/procurementVendorChecker',
                //     'form_id' => $form_id->id
                // ];
                // if($checker->checkers->procurement_vendor_c1 != null){
                //     $userSchema = User::find($checker->checkers->procurement_vendor_c1);
                //     ProcurementVendor::find($form_id->id)->update(array('checker_id' => 1));
                //     Notification::send($userSchema, new CheckerNotification($checkerData));
                // }
                // elseif($checker->checkers->procurement_vendor_admin_approve == 1){
                //     $userSchema = User::find(1);
                //     ProcurementVendor::find($form_id->id)->update(array('checker_id' => 0));
                //     Notification::send($userSchema, new CheckerNotification($checkerData));
                // }
                // else{
                //     ProcurementVendor::find($form_id->id)->update(array('approved' => true));
                // }
            }
            return response()->json(['success' => true, 'message' => 'Procurement Vendor saved successfully'], 200);
        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'message' => $th], 422);
        }
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id) {
        $this->authorize('procurement_vendor_delete');
        if($vendor = ProcurementVendor::where("id", $id)->first()) {
            if($vendor->attachment_id != null){
                $row = ProcurementAttachment::find($vendor->attachment_id);
                if (!empty($row->name)) {
                    Storage::delete('uploads/product/attachments/' . $row->name);
                    $row->delete();
                }
            }
            $vendor->delete();
            return response()->json(['success' => true, 'message' => 'Procurement Vendor type deleted successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id) {
        $this->authorize('procurement_vendor_edit');
        $proDetail = ProcurementVendor::with([
            'vendors:id,name',
            'gst_percent:id,percent',
            'product_type:id,name',
            'product_condition:id,name',
            'procurement_product:id,product_service_name',
            'procurement_attachments:id,name,attachment_name,details,procurement_id'
        ])->find($id);
		return response()->json($proDetail);
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
	public function updateProcurementVendor(Request $request) {
        $this->authorize('procurement_vendor_edit');
        $this->validate($request,[
            'attachment' => 'max:2048',
        ]);
		ProcurementVendor::find($request->id)->update($request->all());
        $vendor = ProcurementVendor::find($request->id);

        if($vendor->attachment_id != null){
            $formArray = array(
                'attachment_name' => $request->attachment_name,
                'details' => $request->details,
                'procurement_id' => $vendor->id
            );

            $old_file = ProcurementAttachment::find($vendor->attachment_id);
            if ($request->hasFile('attachment')) {
                if (!empty($old_file->name)) {
                    Storage::delete('uploads/procurement/attachments/' . $old_file->name);
                }
                $attachment = $request->file('attachment');
                $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
                Storage::put('uploads/procurement/attachments/' . $attachmentName, file_get_contents($attachment));
                $formArray['name'] = "$attachmentName";
            }

            ProcurementAttachment::find($vendor->attachment_id)->update($formArray);
        }
        else{
            $formArray = array(
                'attachment_name' => $request->attachment_name,
                'details' => $request->details,
                'procurement_id' => $vendor->id
            );

            if ($request->hasFile('attachment')) {
                $attachment = $request->file('attachment');
                $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
                Storage::put('uploads/procurement/attachments/' . $attachmentName, file_get_contents($attachment));
                $formArray['name'] = "$attachmentName";
                $insert = ProcurementAttachment::create($formArray);
                ProcurementVendor::find($vendor->id)->update(['attachment_id' => $insert->id]);
            }
        }
		return response()->json(['success' => true, 'message' => 'Procurement Vendor updated successfully'], 200);
	}
}
