<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Vendor;
use App\Models\Attachment;
use Illuminate\Http\Request;
use App\Models\VendorAttachment;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Notifications\CheckerNotification;
use Illuminate\Support\Facades\Notification;

class VendorAttachmentController extends Controller
{
    /**
     * @var string $urlChecker
     */
    protected $urlChecker = '/vendorAttachmentChecker';
    /**
     * @param mixed $id
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function attachments($id)
    {
        $this->authorize('vendor_attachment_list');
        $vendorRow = Vendor::select('id','name')->find($id);
        $rows = VendorAttachment::with(['attachment:id,name,form_name'])->where('vendor_id', $id)->get();
        return response()->json(['vendor' => $vendorRow, 'attachments' => $rows], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $this->authorize('vendor_attachment_create');
        $this->validate($request, [
            'vendor_id' => 'required|integer',
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
            Storage::put('uploads/vendor/attachments/' . $attachmentName, file_get_contents($attachment));
            $formArray['name'] = "$attachmentName";
        }
        $formArray['created_by'] = Auth::id();
        $form_id = VendorAttachment::create($formArray);
        // if (Auth::user()->user_role == 0) {
            VendorAttachment::find($form_id->id)->update(array('approved' => true));
        // } else {
        //     $checker = User::find(Auth::id());
        //     $checkerData = [
        //         'subject' => 'New Vendor Attachment Created',
        //         'body' => 'New Vendor Attachment Is Created by ' . $checker->employeeDetail->name . ' Please Check It',
        //         'url' => $this->urlChecker,
        //         'form_id' => $form_id->id
        //     ];
        //     if ($checker->checkers->vendor_attachment_c1 != null) {
        //         $userSchema = User::find($checker->checkers->vendor_attachment_c1);
        //         VendorAttachment::find($form_id->id)->update(array('checker_id' => 1));
        //         Notification::send($userSchema, new CheckerNotification($checkerData));
        //     } elseif ($checker->checkers->vendor_attachment_admin_approve == 1) {
        //         $userSchema = User::find(1);
        //         VendorAttachment::find($form_id->id)->update(array('checker_id' => 0));
        //         Notification::send($userSchema, new CheckerNotification($checkerData));
        //     } else {
        //         VendorAttachment::find($form_id->id)->update(array('approved' => true));
        //     }
        // }
        return response()->json(['success' => true, 'message' => 'Vendor Attachment created successfully'], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $this->authorize('vendor_attachment_edit');
        $row = VendorAttachment::select('*', 'name as name_attachments')->with('attachment:id,name,form_name')->find($id);
        return response()->json($row, 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateVendorAttachment(Request $request)
    {
        $this->authorize('vendor_attachment_edit');
        $this->validate($request, [
            'vendor_id' => 'required|integer',
            'attachment_name' => 'required|integer',
            'details' => 'required|string|max:255',
            'name' => 'required|max:2048',
        ],[
            'name.required' => 'Attachment field is required',
            'name.max' => 'Max file size for attachment is 2 MB',
        ]);
        $formArray = $request->all();
        if ($request->hasFile('name')) {
            $old_file = VendorAttachment::find($request->id);
            if (!empty($old_file->name)) {
                Storage::delete('uploads/vendor/attachments/' . $old_file->name);
            }
            $attachment = $request->file('name');
            $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/vendor/attachments/' . $attachmentName, file_get_contents($attachment));
            $formArray['name'] = "$attachmentName";
        } else {
            unset($formArray['name']);
        }
        VendorAttachment::find($request->id)->update($formArray);
        return response()->json(['success' => true, 'message' => 'Vendor Attachment updated successfully'], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $this->authorize('vendor_attachment_delete');
        $row = VendorAttachment::find($id);
        if (!empty($row->name)) {
            Storage::delete('uploads/vendor/attachments/' . $row->name);
        }
        $row->delete();
        return response()->json(['success' => true, 'message' => 'Vendor Attachment deleted successfully'], 200);
    }
}
