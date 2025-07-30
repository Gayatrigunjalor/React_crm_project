<?php

namespace App\Services;

use App\Models\CustomerType;
use Illuminate\Http\Request;

class CustomerTypeService
{
    public function listCustomerType()
    {
        $rows = CustomerType::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    public function createCustomerType(Request $request)
    {
        if (CustomerType::create(['name' => $request->name])) {
            return response()->json(['success' => true, 'message' => 'Customer type saved successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    public function editCustomerType($id)
    {
        return response()->json(CustomerType::select('id', 'name')->find($id));
    }

    public function deleteCustomerType($id)
    {
        if (CustomerType::find($id)->delete()) {
            return response()->json(['success' => true, 'message' => 'Customer type deleted successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }
}
