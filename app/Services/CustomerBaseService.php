<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\CustomerBase;
use Illuminate\Http\Request;

class CustomerBaseService
{
    public function listCustomerBase()
    {
        $rows = CustomerBase::orderBy('id', 'desc')->get();
        if ($rows->count() > 0) {
            return view('admin.master.customer-base.list-rows', compact('rows'));
        } else {
            return '<h4 class="my-5 text-center text-danger">No record present in the database!</h4>';
        }
    }

    public function createCustomerBase(Request $request)
    {
        if (CustomerBase::create(['name' => $request->name])) {
            return response()->json(['message' => 'Customer base saved successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    public function editCustomerBase(Request $request)
    {
        return response()->json(CustomerBase::select('id', 'name')->find($request->id));
    }

    public function updateCustomerBase(Request $request)
    {
        if (CustomerBase::find($request->id)->update(['name' => $request->name])) {
            return response()->json(['message' => 'Customer base updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    public function deleteCustomerBase(Request $request)
    {
        $customerBaseCount = Customer::where('customer_base_id', $request->id)->count();
        if($customerBaseCount > 0) {
            return response()->json(['success' => false, 'message' => 'Customer base cannot be removed as it is used in Customer\'s record.'], 422);
        } else {
            if (CustomerBase::find($request->id)->delete()) {
                return response()->json(['message' => 'Customer base deleted successfully'], 200);
            } else {
                return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
            }
        }
    }
}
