<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attachment;
use App\Models\VendorAttachment;
use App\Models\CustomerAttachment;
use App\Models\ProductAttachment;

class AttachmentController extends Controller
{
    /**
     * @return \Illuminate\Contracts\View\View
     */
    public function index()
    {
        $this->authorize('attachment_list');
        $rows = Attachment::select('id','name','form_name')->orderBy('id', 'desc')->get();
        if ($rows->count() > 0) {
            return response()->json($rows, 200);
        } else {
            return response()->json([], 200);
        }
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $this->authorize('attachment_create');
        $this->validate($request, [
            'name' => 'required',
            'form_name' => 'required'
        ]);
        if (Attachment::create(['name' => $request->name, 'form_name' => $request->form_name])) {
            return response()->json(['success' => true, 'message' => 'Attachment saved successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $this->authorize('attachment_edit');
        return response()->json(Attachment::find($id), 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $this->authorize('attachment_edit');
        $this->validate($request, [
            'name' => 'required',
            'form_name' => 'required'
        ]);
        if (Attachment::find($id)->update(['name' => $request->name, 'form_name' => $request->form_name])) {
            return response()->json(['success' => true, 'message' => 'Attachment updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $this->authorize('attachment_delete');
        $form_name = Attachment::where('id', $id)->value('form_name');
        $vendorCount = VendorAttachment::where('attachment_name', $id)->count();
        $customerCount = CustomerAttachment::where('attachment_name', $id)->count();
        $productCount = ProductAttachment::where('attachment_name', $id)->count();
        if($vendorCount > 0 || $customerCount > 0 || $productCount > 0) {
            return response()->json(['success' => false, 'message' => "Attachment cannot be removed as it is used in ".$form_name."Attachment record."], 422);
        } else {
            if (Attachment::find($id)->delete()) {
                return response()->json(['success' => true, 'message' => 'Attachment deleted successfully'], 200);
            } else {
                return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
            }
        }
    }

    /**
     * @param mixed $name
     */
    public function getAttachmentByName($name)
    {
        $attachments = Attachment::select('id','name','form_name')->where('form_name', $name)->get();
        return response()->json($attachments, 200);
    }
}
