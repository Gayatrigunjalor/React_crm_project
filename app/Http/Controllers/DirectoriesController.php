<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Directories;
use Illuminate\Http\Request;
use App\Http\Requests\DirectoriesRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Notifications\CheckerNotification;
use Illuminate\Support\Facades\Notification;

class DirectoriesController extends Controller
{
    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function index()
    {
        $this->authorize('directory_list');
        $rows = Directories::with(['createdName:id,user_id,name'])->orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @param \App\Http\Requests\DirectoriesRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(DirectoriesRequest $request)
    {
        $this->authorize('directory_create');
        $formArray = $request->all();
        if ($request->hasFile('business_card')) {
            $attachment = $request->file('business_card');
            $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/directories/business-card/' . $attachmentName, file_get_contents($attachment));
            $formArray['business_card'] = "$attachmentName";
        }
        $formArray['created_by'] = Auth::id();
        $formId = Directories::create($formArray);
        $data = [ 'approved' => true ];
        if (Auth::user()->user_role == 0) {
            Directories::find($formId->id)->update($data);
        } else {
            // $checker = Auth::user();
            // $checkerData = [
            //     'subject' => 'New Directories Created',
            //     'body' => 'New Directories Is Created by ' . $checker->employeeDetail->name . ' Please Check It',
            //     'url' => '/directoriesChecker',
            //     'form_id' => $formId->id
            // ];
            // if ($checker->checkers->directory_c1 != null) {
            //     $userSchema = User::find($checker->checkers->directory_c1);
            //     $checkerId = array(
            //         'checker_id' => 1
            //     );
            //     Directories::find($formId->id)->update($checkerId);
            //     Notification::send($userSchema, new CheckerNotification($checkerData));
            // } elseif ($checker->checkers->directory_admin_approve == 1) {
            //     $userSchema = User::find(1);
            //     Directories::find($formId->id)->update(array('checker_id' => 0));
            //     Notification::send($userSchema, new CheckerNotification($checkerData));
            // } else {
                Directories::find($formId->id)->update($data);
            // }
        }
        return response()->json(['success' => true, 'message' => 'Directory created successfully'], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $this->authorize('directory_edit');
        $dir = Directories::with(['createdName:id,user_id,name'])->find($id);
        return response()->json($dir, 200);
    }

    /**
     * @param \App\Http\Requests\DirectoriesRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateDirectories(DirectoriesRequest $request)
    {
        $this->authorize('directory_edit');
        $this->validate($request, [
            'id' => 'required|integer',
        ]);
        $formArray = $request->all();
        if ($request->hasFile('business_card')) {
            $oldFile = Directories::find($request->id);
            if (!empty($oldFile->business_card)) {
                Storage::delete('uploads/directories/business-card/' . $oldFile->business_card);
            }
            $attachment = $request->file('business_card');
            $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/directories/business-card/' . $attachmentName, file_get_contents($attachment));
            $formArray['business_card'] = $attachmentName;
        }
        if(Directories::find($request->id)->update($formArray)) {
            return response()->json(['success' => true, 'message' => 'Directory updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }
}
