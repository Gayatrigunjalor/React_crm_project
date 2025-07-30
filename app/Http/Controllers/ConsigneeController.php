<?php

namespace App\Http\Controllers;

use App\Http\Requests\ConsigneeRequest;
use App\Models\Consignee;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Notifications\CheckerNotification;
use Illuminate\Support\Facades\Notification;

class ConsigneeController extends Controller
{
    /**
     * @param  mixed $id
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function consignees($id)
    {
        $this->authorize('consignee_list');
        $customerRow = Customer::select('id', 'name', 'cust_id')->find($id);
        if($customerRow) {
            $consignee = Consignee::where('customer_id', $customerRow->id)->orderBy('id', 'desc')->get();
            return response()->json(['customer' => $customerRow, 'consignees' => $consignee ]);
        } else {
            return response()->json(['success' => false, 'message' => 'Incorrect Customer ID'], 422);
        }
    }

    /**
     * @param \App\Http\Requests\ConsigneeRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(ConsigneeRequest $request)
    {
        $this->authorize('consignee_create');
        $formArray = $request->all();
        $formArray['created_by'] = Auth::id();
        $formId = Consignee::create($formArray);
        if (Auth::user()->user_role == 0) {
            $data = array(
                'approved' => true
            );
            Consignee::find($formId->id)->update($data);
        } else {
            // $checker = Auth::user();
            // $checkerData = [
            //     'subject' => 'New Consignee Created',
            //     'body' => 'New Consignee Is Created by ' . $checker->employeeDetail->name . ' Please Check It',
            //     'url' => '/consigneeChecker',
            //     'form_id' => $formId->id
            // ];
            // if ($checker->checkers->consignee_c1 != null) {
            //     $userSchema = User::find($checker->checkers->consignee_c1);
            //     $checkerId = array(
            //         'checker_id' => 1
            //     );
            //     Consignee::find($formId->id)->update($checkerId);
            //     Notification::send($userSchema, new CheckerNotification($checkerData));
            // } elseif ($checker->checkers->consignee_admin_approve == 1) {
            //     $userSchema = User::find(1);
            //     $checkerId = array(
            //         'checker_id' => 0
            //     );
            //     Consignee::find($formId->id)->update($checkerId);
            //     Notification::send($userSchema, new CheckerNotification($checkerData));
            // } else {
            //     $data = array(
            //         'approved' => true
            //     );
            //     Consignee::find($formId->id)->update($data);
            // }
        }
        return response()->json(['success' => true, 'message' => 'Consignee saved successfully'], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $this->authorize('consignee_edit');
        $consignee = Consignee::with(['country_name:id,name','state_name:id,name'])->find($id);
        if($consignee) {
            return response()->json($consignee);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find consignee'], 422);
        }
    }

    /**
     * @param \App\Http\Requests\ConsigneeRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(ConsigneeRequest $request, $id)
    {
        $this->authorize('consignee_edit');
        if (Consignee::find($id)->update($request->all())) {
            return response()->json(['success' => true, 'message' => 'Consignee updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse|void
     */
    public function getConsignees($customer_id)
    {
        $consignees = Consignee::select('id','name','contact_person')->where('customer_id', $customer_id)->get();
        if (count($consignees) > 0) {
            return response()->json($consignees, 200);
        } else {
            return response()->json([], 200);
        }

    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $this->authorize('consignee_delete');
        if(Consignee::find($id)->delete()) {
            return response()->json(['success' => true, 'message' => 'Consignee deleted successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }

    }
}
