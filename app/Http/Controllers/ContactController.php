<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContactRequest;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\Request;
use App\Models\VendorContact;
use Illuminate\Support\Facades\Auth;
use App\Notifications\CheckerNotification;
use Illuminate\Support\Facades\Notification;

class ContactController extends Controller
{
    /**
     * @param mixed $id
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function contacts($id)
    {
        $this->authorize('vendor_contact_list');
        $vendorRow = Vendor::select('id', 'name')->find($id);
        if($vendorRow) {
            $contact = VendorContact::where('vendor_id', $vendorRow->id)->orderBy('id', 'desc')->get();
            return response()->json(['vendor' => $vendorRow, 'contacts' => $contact ]);
        } else {
            return response()->json(['success' => false, 'message' => 'Incorrect vendor ID'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $this->authorize('vendor_contact_list');
        $vendorContact = VendorContact::find($id);
        if($vendorContact) {
            return response()->json($vendorContact);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find vendor contact'], 422);
        }
    }

    /**
     * @param \App\Http\Requests\ContactRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(ContactRequest $request)
    {
        $this->authorize('vendor_contact_create');
        $formArray = $request->all();
        $formArray['created_by'] = Auth::id();
        $formId = VendorContact::create($formArray);
        if (Auth::user()->user_role == 0) {
            $data = array(
                'approved' => true
            );
            VendorContact::find($formId->id)->update($data);
        } else {
            // $checker = User::find(Auth::id());
            // $checkerData = [
            //     'subject' => 'New Vendor Contact Created',
            //     'body' => 'New Vendor Contact Is Created by ' . $checker->employeeDetail->name . ' Please Check It',
            //     'url' => '/vendorContactChecker',
            //     'form_id' => $formId->id
            // ];
            // if ($checker->checkers->vendor_contact_c1 != null) {
            //     $userSchema = User::find($checker->checkers->vendor_contact_c1);
            //     $checkerId = array(
            //         'checker_id' => 1
            //     );
            //     VendorContact::find($formId->id)->update($checkerId);
            //     Notification::send($userSchema, new CheckerNotification($checkerData));
            // } elseif ($checker->checkers->vendor_contact_admin_approve == 1) {
            //     $userSchema = User::find(1);
            //     $checkerId = array(
            //         'checker_id' => 0
            //     );
            //     VendorContact::find($formId->id)->update($checkerId);
            //     Notification::send($userSchema, new CheckerNotification($checkerData));
            // } else {
            //     $data = array(
            //         'approved' => true
            //     );
            //     VendorContact::find($formId->id)->update($data);
            // }
        }
        return response()->json(['success' => true, 'message' => 'Vendor contact saved successfully'], 200);
    }

    /**
     * @param \App\Http\Requests\ContactRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(ContactRequest $request, $id)
    {
        $this->authorize('vendor_contact_edit');
        if(VendorContact::find($id)->update($request->all())) {
            return response()->json(['success' => true, 'message' => 'Vendor contact updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $this->authorize('vendor_contact_delete');
        if (VendorContact::find($id)->delete()) {
            return response()->json(['success' => true, 'message' => 'Vendor contact deleted successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }
}
