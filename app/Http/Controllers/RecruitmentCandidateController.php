<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Recruitment;
use Illuminate\Http\Request;
use App\Models\RecruitmentCandidate;
use Illuminate\Support\Facades\Auth;
use App\Models\RecruitmentAttachment;
use Illuminate\Support\Facades\Storage;
use App\Notifications\CheckerNotification;
use Illuminate\Support\Facades\Notification;

class RecruitmentCandidateController extends Controller
{
    /**
     * @param mixed $id
     * @return \Illuminate\Contracts\View\View
     */
    public function recruitmentCandidates($id)
    {
        $this->authorize('recruitment_candidate_list');
        $postRow = Recruitment::find($id);
        $rows = RecruitmentCandidate::leftJoin('recruitment_attachments', 'recruitment_candidates.attachment_id', '=', 'recruitment_attachments.id')
            ->where('recruitment_candidates.post_id',$id)
            ->get(['recruitment_candidates.*', 'recruitment_attachments.id as attachment_id', 'recruitment_attachments.name as attachment_title']);
        return response()->json(['postDetails' => $postRow, 'rows' => $rows], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    public function fetchAllCandidates(Request $request) {
        $this->authorize('recruitment_candidate_list');
        $rows = RecruitmentCandidate::leftJoin('recruitment_attachments', 'recruitment_candidates.attachment_id', '=', 'recruitment_attachments.id')
            ->where('recruitment_candidates.post_id',$request->id)
            ->get(['recruitment_candidates.*', 'recruitment_attachments.id as attachment_id', 'recruitment_attachments.name as attachment_title']);
        if ($rows->count() > 0) {
			return response()->json($rows, 200);
		}
        else {
			return response()->json([], 200);
		}
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request) {
        $this->authorize('recruitment_candidate_create');
		$formArray = $request->all();
        $formArray['created_by'] = Auth::id();
        $this->validate($request,[
            'fileName' => 'max:2048',
        ]);
        $attachmentArray = array(
            'attachment_name' => $request->attachment_name,
            'details' => $request->details,
            'post_id' => $request->post_id,
        );
        if ($request->hasFile('fileName')) {
            $attachment = $request->file('fileName');
            $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/recruitment/attachments/' . $attachmentName, file_get_contents($attachment));
            $attachmentArray['name'] = "$attachmentName";
        }
        //create attachment in procurement_attachments table
        $attachment_id = RecruitmentAttachment::create($attachmentArray);
        $formArray['attachment_id'] = $attachment_id->id;
        $formArray['approved'] = true;
        //Now create new recruitment candidate record
        $form_id = RecruitmentCandidate::create($formArray);
        // if(Auth::user()->user_role == 0){
            // RecruitmentCandidate::find($form_id->id)->update(array('approved' => true));
        // } else{
        //     $checker = User::find(Auth::id());
        //     $checkerData = [
        //         'subject' => 'New Recruitment Candidate Created',
        //         'body' => 'New Recruitment Candidate Is Created by '. $checker->employeeDetail->name .' Please Check It',
        //         'url' => '/candidateChecker',
        //         'form_id' => $form_id->id
        //     ];
        //     if($checker->checkers->recruitment_candidate_c1 != null){
        //         $userSchema = User::find($checker->checkers->recruitment_candidate_c1);
        //         RecruitmentCandidate::find($form_id->id)->update(array('checker_id' => 1));
        //         Notification::send($userSchema, new CheckerNotification($checkerData));
        //     }
        //     elseif($checker->checkers->recruitment_candidate_admin_approve == 1){
        //         $userSchema = User::find(1);
        //         RecruitmentCandidate::find($form_id->id)->update(array('checker_id' => 0));
        //         Notification::send($userSchema, new CheckerNotification($checkerData));
        //     }
        //     else{
        //         RecruitmentCandidate::find($form_id->id)->update(array('approved' => true));
        //     }
        // }
        return response()->json(['success' => true, 'message' => 'Recruitment Candidate saved successfully'], 200);
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id) {
        $this->authorize('recruitment_candidate_delete');
        $row = RecruitmentCandidate::find($id);
        if($row){
            $row->delete();
        }
        return response()->json(['success' => true, 'message' => 'Recruitment Candidate deleted successfully'], 200);
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id) {
        $this->authorize('recruitment_candidate_edit');
        $data = RecruitmentCandidate::leftJoin('recruitment_attachments', 'recruitment_candidates.attachment_id', '=', 'recruitment_attachments.id')
        ->where('recruitment_candidates.id', $id)
        ->first(['recruitment_candidates.*', 'recruitment_attachments.id as attachment_id', 'recruitment_attachments.name as attachment_title', 'recruitment_attachments.attachment_name', 'recruitment_attachments.details']);
		return response()->json($data);
	}

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
	public function updateCandidate(Request $request) {
        $this->authorize('recruitment_candidate_edit');

        $this->validate($request,[
            'fileName' => 'max:5128',
        ],[
            'fileName.max' => 'Attachment maximum size can be upto 5MB'
        ]);
		RecruitmentCandidate::find($request->id)->update($request->all());
        $rec_candidate = RecruitmentCandidate::find($request->id);
        if($rec_candidate->attachment_id != null){
            $formArray = array(
                'attachment_name' => $request->attachment_name,
                'details' => $request->details,
                'post_id' => $rec_candidate->post_id
            );

            $old_file = RecruitmentAttachment::find($rec_candidate->attachment_id);
            if ($request->hasFile('fileName')) {
                if (!empty($old_file->name)) {
                    Storage::delete('uploads/recruitment/attachments/' . $old_file->name);
                }
                $attachment = $request->file('fileName');
                $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
                Storage::put('uploads/recruitment/attachments/' . $attachmentName, file_get_contents($attachment));
                $formArray['name'] = "$attachmentName";
            }

            RecruitmentAttachment::find($rec_candidate->attachment_id)->update($formArray);
        } else {
            $formArray = array(
                'attachment_name' => $request->attachment_name,
                'details' => $request->details,
                'post_id' => $rec_candidate->post_id
            );

            if ($request->hasFile('fileName')) {
                $attachment = $request->file('fileName');
                $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
                Storage::put('uploads/recruitment/attachments/' . $attachmentName, file_get_contents($attachment));
                $formArray['name'] = "$attachmentName";
            }
            $insert = RecruitmentAttachment::create($formArray);
            RecruitmentCandidate::find($rec_candidate->id)->update(['attachment_id' => $insert->id]);
        }
		return response()->json(['success' => true, 'message' => 'Recruitment Candidate updated successfully'], 200);
	}
}
