<?php

namespace App\Http\Controllers;


use App\Models\User;
use App\Models\Customer;
use Illuminate\Http\Request;
use App\Models\CustomerAttachment;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Notifications\CheckerNotification;
use Illuminate\Support\Facades\Notification;

class CustomerAttachmentController extends Controller
{
    /**
     * @param mixed $id
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function attachments($id)
    {
        $this->authorize('customer_attachment_list');
        $customerRow = Customer::select('id','name')->find($id);
        $rows = CustomerAttachment::with(['attachment:id,name,form_name'])->where('customer_id', $id)->get();
        return response()->json(['customer' => $customerRow, 'attachments' => $rows], 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $this->authorize('customer_attachment_create');
        $this->validate($request, [
            'customer_id' => 'required|integer',
            'attachment_name' => 'required|integer',
            'details' => 'required|string|max:255',
            'name' => 'required|max:2048',
        ],[
            'name.required' => 'Attachment field is required',
            'name.max' => 'Max file size for attachment is 2 MB',
        ]);
        $formArray = $request->all();
        if ($request->hasFile('name')) {
            $attachment = $request->file('name');
            $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/customer/attachments/' . $attachmentName, file_get_contents($attachment));
            $formArray['name'] = "$attachmentName";
        }
        $formArray['created_by'] = Auth::id();
        $formId = CustomerAttachment::create($formArray);
        // if (Auth::user()->user_role == 0) {
            $data = array(
                'approved' => true
            );
            CustomerAttachment::find($formId->id)->update($data);
        // } else {
        //     $checker = User::find(Auth::id());
        //     $checkerData = [
        //         'subject' => 'New Customer Attachment Created',
        //         'body' => 'New Customer Attachment Is Created by ' . $checker->employeeDetail->name . ' Please Check It',
        //         'url' => '/customerAttachmentChecker',
        //         'form_id' => $formId->id
        //     ];
        //     if ($checker->checkers->customer_attachment_c1 != null) {
        //         $userSchema = User::find($checker->checkers->customer_attachment_c1);
        //         $checkerId = array(
        //             'checker_id' => 1
        //         );
        //         CustomerAttachment::find($formId->id)->update($checkerId);
        //         Notification::send($userSchema, new CheckerNotification($checkerData));
        //     } elseif ($checker->checkers->customer_attachment_admin_approve == 1) {
        //         $userSchema = User::find(1);
        //         $checkerId = array(
        //             'checker_id' => 0
        //         );
        //         CustomerAttachment::find($formId->id)->update($checkerId);
        //         Notification::send($userSchema, new CheckerNotification($checkerData));
        //     } else {
        //         $data = array(
        //             'approved' => true
        //         );
        //         CustomerAttachment::find($formId->id)->update($data);
        //     }
        // }
        return response()->json(['success' => true, 'message' => 'Customer Attachment created successfully'], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $this->authorize('customer_attachment_edit');
        $row = CustomerAttachment::select('*', 'name as name_attachments')->with('attachment:id,name,form_name')->find($id);
        return response()->json($row, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateCustomerAttachment(Request $request)
    {
        $this->authorize('customer_attachment_edit');
        $this->validate($request, [
            'customer_id' => 'required|integer',
            'attachment_name' => 'required|integer',
            'details' => 'required|string|max:255',
            'name' => 'required|max:2048',
        ],[
            'name.required' => 'Attachment field is required',
            'name.max' => 'Max file size for attachment is 2 MB',
        ]);
        $formArray = $request->all();
        if ($request->hasFile('name')) {
            $oldFile = CustomerAttachment::find($request->id);
            if (!empty($oldFile->name)) {
                Storage::delete('uploads/customer/attachments/' . $oldFile->name);
            }
            $attachment = $request->file('name');
            $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/customer/attachments/' . $attachmentName, file_get_contents($attachment));
            $formArray['name'] = "$attachmentName";
        } else {
            unset($formArray['name']);
        }
        CustomerAttachment::find($request->id)->update($formArray);
        return response()->json(['success' => true, 'message' => 'Customer Attachment updated successfully'], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $this->authorize('customer_attachment_delete');
        $row = CustomerAttachment::find($id);
        if (!empty($row->name)) {
            Storage::delete('uploads/customer/attachments/' . $row->name);
        }
        CustomerAttachment::where("id", $row->id)->delete();
        return response()->json(['success' => true, 'message' => 'Customer Attachment deleted successfully'], 200);
    }
}
