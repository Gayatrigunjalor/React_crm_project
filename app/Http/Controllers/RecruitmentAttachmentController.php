<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Attachment;
use App\Models\Recruitment;
use App\Models\RecruitmentCandidate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\RecruitmentAttachment;
use Illuminate\Support\Facades\Storage;
use App\Notifications\CheckerNotification;
use Illuminate\Support\Facades\Notification;

class RecruitmentAttachmentController extends Controller
{
    /**
     * @var string $urlChecker
     */
    protected $urlChecker = '/recruitmentAttachmentChecker';

    /**
     * @param mixed $id
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function attachments($id)
    {
        $this->authorize('recruitment_attachment_list');
        $postRow = Recruitment::find($id);
        $attachments = Attachment::all()->where('form_name', 'Recruitment');
        return view('admin.recruitment.attachments.view', compact('postRow', 'attachments'));
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    public function fetchAllRecruitmentAttachments(Request $request)
    {
        $this->authorize('recruitment_attachment_list');
        $rows = RecruitmentAttachment::all()->where('post_id', $request->id);
        if ($rows->count() > 0) {
            echo view('admin.recruitment.attachments.list-rows', compact('rows'));
        } else {
            echo '<h4 class="my-5 text-center text-danger">No record present in the database!</h4>';
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addRecruitmentAttachment(Request $request)
    {
        $this->authorize('recruitment_attachment_create');
        $formArray = $request->all();
        if ($request->hasFile('name')) {
            $attachment = $request->file('name');
            $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/recruitment/attachments/' . $attachmentName, file_get_contents($attachment));
            $formArray['name'] = "$attachmentName";
        }
        $formArray['created_by'] = auth()->id();
        $form_id = RecruitmentAttachment::create($formArray);
        if (Auth::user()->user_role == 0) {
            RecruitmentAttachment::find($form_id->id)->update(array('approved' => true));
        } else {
            $checker = User::find(auth()->id());
            $checkerData = [
                'subject' => 'New Recruitment Attachment Created',
                'body' => 'New Recruitment Attachment Is Created by ' . $checker->employeeDetail->name . ' Please Check It',
                'url' => $this->urlChecker,
                'form_id' => $form_id->id
            ];
            if ($checker->checkers->recruitment_attachment_c1 != null) {
                $userSchema = User::find($checker->checkers->recruitment_attachment_c1);
                RecruitmentAttachment::find($form_id->id)->update(array('checker_id' => 1));
                Notification::send($userSchema, new CheckerNotification($checkerData));
            } elseif ($checker->checkers->recruitment_attachment_admin_approve == 1) {
                $userSchema = User::find(1);
                RecruitmentAttachment::find($form_id->id)->update(array('checker_id' => 0));
                Notification::send($userSchema, new CheckerNotification($checkerData));
            } else {
                RecruitmentAttachment::find($form_id->id)->update(array('approved' => true));
            }
        }
        return response()->json([
            'status' => 200,
        ]);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function editRecruitmentAttachment(Request $request)
    {
        $this->authorize('recruitment_attachment_edit');
        return response()->json(RecruitmentAttachment::find($request->id));
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateRecruitmentAttachment(Request $request)
    {
        $this->authorize('recruitment_attachment_edit');
        $formArray = $request->all();
        if ($request->hasFile('name')) {
            $old_file = RecruitmentAttachment::find($request->id);
            if (!empty($old_file->name)) {
                Storage::delete('uploads/recruitment/attachments/' . $old_file->name);
            }
            $attachment = $request->file('name');
            $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/recruitment/attachments/' . $attachmentName, file_get_contents($attachment));
            $formArray['name'] = "$attachmentName";
        } else {
            unset($formArray['name']);
        }
        RecruitmentAttachment::find($request->id)->update($formArray);
        return response()->json([
            'status' => 200,
        ]);
    }

    /**
     * @param mixed $filename
     * @return \Illuminate\Http\Response
     */
    function getRecruitmentAttachment($filename)
    {
        $headers = [
            'Content-Type' => Storage::mimeType('uploads/recruitment/attachments/' . $filename),
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];
        return \Response::make(Storage::get('uploads/recruitment/attachments/' . $filename), 200, $headers);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteRecruitmentAttachment(Request $request)
    {
        $this->authorize('recruitment_attachment_delete');
        $row = RecruitmentAttachment::find($request->id);
        if (!empty($row->name)) {
            Storage::delete('uploads/recruitment/attachments/' . $row->name);
        }
        //Find candidate with same attachment and set attachment_id to null
        $rec_candidate = RecruitmentCandidate::where('attachment_id',$request->id)->first();
        RecruitmentCandidate::find($rec_candidate->id)->update(['attachment_id' => null]);
        //Delete attachment after setting attachment_id to null in recruitment table
        $row->delete();
        return response()->json([
            'status' => 200,
        ]);
    }
}
