<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BankDetails;

class BankDetailsController extends Controller
{
    /**
     * @param \App\Services\BankDetailsService $bankDetailsService
     * @return string
     */
    public function index()
    {
        $this->authorize('bank_details_list');
        return BankDetails::where("id", 1)->first();
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateBankDetails(Request $request)
    {
        $this->authorize('bank_details_edit');
        $this->validate($request, [
            'bank_name' => 'required|string|max:255',
            'account_holder_name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'branch' => 'required|string|max:255',
            'branch_code' => 'required|string|max:255',
            'account_no' => 'required|string|max:255',
            'ifsc' => 'required|string|max:255',
        ]);
        if (BankDetails::find(1)->update([
            'bank_name' => $request->bank_name,
            'account_holder_name' => $request->account_holder_name,
            'address' => $request->address,
            'branch' => $request->branch,
            'branch_code' => $request->branch_code,
            'account_no' => $request->account_no,
            'ifsc' => $request->ifsc
        ])) {
            return response()->json(['success' => true, 'message' => 'Bank details saved successfully'], 200);
        }
    }

}
