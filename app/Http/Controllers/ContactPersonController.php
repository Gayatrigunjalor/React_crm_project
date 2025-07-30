<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContactPersonRequest;
use App\Models\User;
use App\Models\Customer;
use Illuminate\Http\Request;
use App\Models\ContactPerson;
use App\Notifications\CheckerNotification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;

class ContactPersonController extends Controller
{
    /**
     * @param mixed $id
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function contactPersons($id)
    {
        $this->authorize('contact_person_list');
        $customerRow = Customer::select('id', 'name', 'cust_id')->find($id);
        if($customerRow) {
            $contact = ContactPerson::where('customer_id', $customerRow->id)->orderBy('id', 'desc')->get();
            return response()->json(['customer' => $customerRow, 'contacts' => $contact ]);
        } else {
            return response()->json(['success' => false, 'message' => 'Incorrect Customer ID'], 422);
        }
    }

    /**
     * @param \App\Http\Requests\ContactPersonRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(ContactPersonRequest $request)
    {
        $this->authorize('contact_person_create');
        $formArray = $request->all();
        $formArray['created_by'] = Auth::id();
        $formId = ContactPerson::create($formArray);
        if (Auth::user()->user_role == 0) {
            $data = array(
                'approved' => true
            );
            ContactPerson::find($formId->id)->update($data);
        } else {
            // $checker = User::find(auth()->id());
            // $checkerData = [
            //     'subject' => 'New Contact Person Crated  Created',
            //     'body' => 'New Contact Person Is Created by ' . $checker->employeeDetail->name . ' Please Check It',
            //     'url' => '/contactPersonChecker',
            //     'form_id' => $formId->id
            // ];
            // if ($checker->checkers->contact_person_c1 != null) {
            //     $userSchema = User::find($checker->checkers->contact_person_c1);
            //     $checkerId = array(
            //         'checker_id' => 1
            //     );
            //     ContactPerson::find($formId->id)->update($checkerId);
            //     Notification::send($userSchema, new CheckerNotification($checkerData));
            // } elseif ($checker->checkers->contact_person_admin_approve == 1) {
            //     $userSchema = User::find(1);
            //     $checkerId = array(
            //         'checker_id' => 0
            //     );
            //     ContactPerson::find($formId->id)->update($checkerId);
            //     Notification::send($userSchema, new CheckerNotification($checkerData));
            // } else {
            //     ContactPerson::find($formId->id)->update(array('approved' => true));
            // }
        }
        return response()->json(['success' => true, 'message' => 'Contact saved successfully'], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $this->authorize('contact_person_edit');
        $contact = ContactPerson::find($id);
        if($contact) {
            return response()->json($contact);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find contact'], 422);
        }
    }

    /**
     * @param \App\Http\Requests\ContactPersonRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(ContactPersonRequest $request, $id)
    {
        $this->authorize('contact_person_edit');
        if(ContactPerson::find($id)->update($request->all())) {
            return response()->json(['success' => true, 'message' => 'Contact updated successfully'], 200);
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
        $this->authorize('contact_person_delete');
        if(ContactPerson::find($id)->delete()) {
            return response()->json(['success' => true, 'message' => 'Contact deleted successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

}
