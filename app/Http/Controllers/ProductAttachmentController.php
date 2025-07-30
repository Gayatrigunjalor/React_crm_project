<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Models\ProductAttachment;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Notifications\CheckerNotification;
use Illuminate\Support\Facades\Notification;

class ProductAttachmentController extends Controller
{
    /**
     * @param mixed $id
     * @return \Illuminate\Contracts\View\View
     */
    public function attachments($id)
    {
        $this->authorize('product_attachment_list');
        $productRow = Product::select('id','product_name','product_code')->find($id);
        $rows = ProductAttachment::with(['attachment:id,name,form_name'])->where('product_id', $id)->get();
        return response()->json(['product' => $productRow, 'attachments' => $rows], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $this->authorize('product_attachment_create');
        $this->validate($request, [
            'product_id' => 'required|integer',
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
            Storage::put('uploads/product/attachments/' . $attachmentName, file_get_contents($attachment));
            $formArray['name'] = "$attachmentName";
        }
        $formArray['created_by'] = Auth::id();
        $form_id = ProductAttachment::create($formArray);
        // if (Auth::user()->user_role == 0) {
            ProductAttachment::find($form_id->id)->update(array('approved' => true));
        // } else {
        //     $checker = User::find(Auth::id());
        //     $checkerData = [
        //         'subject' => 'New Product Attachment Created',
        //         'body' => 'New Product Attachment Is Created by ' . $checker->employeeDetail->name . ' Please Check It',
        //         'url' => '/productAttachmentChecker',
        //         'form_id' => $form_id->id
        //     ];
        //     if ($checker->checkers->product_attachment_c1 != null) {
        //         $userSchema = User::find($checker->checkers->product_attachment_c1);
        //         ProductAttachment::find($form_id->id)->update(array('checker_id' => 1));
        //         Notification::send($userSchema, new CheckerNotification($checkerData));
        //     } elseif ($checker->checkers->product_attachment_admin_approve == 1) {
        //         $userSchema = User::find(1);
        //         ProductAttachment::find($form_id->id)->update(array('checker_id' => 0));
        //         Notification::send($userSchema, new CheckerNotification($checkerData));
        //     } else {
        //         ProductAttachment::find($form_id->id)->update(array('approved' => true));
        //     }
        // }
        return response()->json(['success' => true, 'message' => 'Product Attachment created successfully'], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $this->authorize('product_attachment_edit');
        $row = ProductAttachment::select('*', 'name as name_attachments')->with('attachment:id,name,form_name')->find($id);
        return response()->json($row, 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProductAttachment(Request $request)
    {
        $this->authorize('product_attachment_edit');
        $this->validate($request, [
            'product_id' => 'required|integer',
            'attachment_name' => 'required|integer',
            'details' => 'required|string|max:255',
            'name' => 'required|max:2048',
        ],[
            'name.required' => 'Attachment field is required',
            'name.max' => 'Max file size for attachment is 2 MB',
        ]);
        $formArray = $request->all();
        if ($request->hasFile('name')) {
            $this->validate($request,[
                'name' => 'required|max:2048',
            ]);
            $old_file = ProductAttachment::find($request->id);
            if (!empty($old_file->name)) {
                Storage::delete('uploads/product/attachments/' . $old_file->name);
            }
            $attachment = $request->file('name');
            $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/product/attachments/' . $attachmentName, file_get_contents($attachment));
            $formArray['name'] = "$attachmentName";
        } else {
            unset($formArray['name']);
        }
        ProductAttachment::find($request->id)->update($formArray);
        return response()->json(['success' => true, 'message' => 'Product Attachment updated successfully'], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $this->authorize('product_attachment_delete');
        $row = ProductAttachment::find($id);
        if (!empty($row->name)) {
            Storage::delete('uploads/product/attachments/' . $row->name);
        }
        $row->delete();
        return response()->json(['success' => true, 'message' => 'Product Attachment deleted successfully'], 200);
    }
}
