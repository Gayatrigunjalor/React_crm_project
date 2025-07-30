<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\CustomerConsignee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\CustomerRequest;

class CustomerController extends Controller
{
    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function index()
    {
        // $this->authorize('customer_list');

        $rows = Customer::with([
            'customerType:id,name',
            'segment:id,name',
            'category:id,name',
            'customerBase:id,name',
            'country:id,name'
        ])->orderBy('id', 'DESC')
        ->get();
        return response()->json($rows, 200);
    }

    public function customerList() {
        $rows = Customer::select('id', 'name')->orderBy('id', 'DESC')
        ->get();
        return response()->json($rows, 200);
    }

    /**
     * @param \App\Http\Requests\CustomerRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(CustomerRequest $request)
    {
        $this->authorize('customer_create');
        $formArray = $request->all();
        $query = Customer::orderBy('id', 'DESC')->first();
        if (!empty($query)) {
            $value2 = preg_replace('/\D/', '', $query->cust_id);
            $value2 = intval($value2) + 1;
            $formArray['cust_id'] = "C-" . $value2;
        } else {
            $formArray['cust_id'] = "C-1";
        }
        $formArray['created_by'] = Auth::id();
        $formArray['approved'] = true;
        $customer = Customer::create($formArray);
        if ($customer) {
            return response()->json(['success' => true, 'message' => 'Customer created successfully','id' => $customer->id], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    public function getContactPerson(Request $request) {
        $contact = CustomerConsignee::where('cust_id', $request->cust_id)
            ->select('id', 'contact_person_name')
            ->first();
            
        if ($contact) {
            return response()->json([[
                'id' => $contact->id,
                'contact_person' => $contact->contact_person_name
            ]], 200);
        }
        return response()->json([[]], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $this->authorize('customer_list');
        $customer = Customer::with([
            'customerType:id,name',
            'segment:id,name',
            'category:id,name',
            'customerBase:id,name',
            'country:id,name',
            'timezone:id,name,offset'
        ])->find($id);

        if($customer) {
            return response()->json($customer);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find customer data'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function editCustomer(Request $request)
    {
        $this->authorize('customer_edit');
        return response()->json(Customer::find($request->id));
    }

    /**
     * @param \App\Http\Requests\CustomerRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(CustomerRequest $request, $id)
    {
        $this->authorize('customer_edit');
        if(Customer::find($id)->update($request->all())) {
            return response()->json(['success' => true, 'message' => 'Customer details updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }
}
