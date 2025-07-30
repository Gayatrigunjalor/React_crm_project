<?php

namespace App\Http\Controllers;


use App\Models\BankAccount;
use App\Models\Irm;
use App\Http\Requests\BankAccountRequest;
use App\Models\Invoice;
use App\Models\Quotation;
use Illuminate\Http\Request;

class BankAccountController extends Controller
{
    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $this->authorize('bank_account_list');
        $rows = BankAccount::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function bankAccountList()
    {
        $rows = BankAccount::select('id', 'bank_name')->orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @param \App\Http\Requests\BankAccountRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(BankAccountRequest $request)
    {
        $this->authorize('bank_account_create');
        if (BankAccount::create([
            'bank_name' => $request->bank_name,
            'account_holder_name' => $request->account_holder_name,
            'branch' => $request->branch,
            'branch_code' => $request->branch_code,
            'address' => $request->address,
            'city' => $request->city,
            'pin_code' => $request->pin_code,
            'account_no' => $request->account_no,
            'ifsc' => $request->ifsc,
            'swift_code' => $request->swift_code,
            'ad_code' => $request->ad_code
        ])) {
            return response()->json(['success' => true, 'message' => 'Bank account saved successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $this->authorize('bank_account_edit');
        $bankAccount = BankAccount::find($id);
        if($bankAccount) {
            return response()->json($bankAccount);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find vendor type'], 422);
        }
    }

    /**
     * @param \App\Http\Requests\BankAccountRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(BankAccountRequest $request, $id)
    {
        $this->authorize('bank_account_edit');
        if (BankAccount::find($id)->update([
            'bank_name' => $request->bank_name,
            'account_holder_name' => $request->account_holder_name,
            'branch' => $request->branch,
            'branch_code' => $request->branch_code,
            'address' => $request->address,
            'city' => $request->city,
            'pin_code' => $request->pin_code,
            'account_no' => $request->account_no,
            'ifsc' => $request->ifsc,
            'swift_code' => $request->swift_code,
            'ad_code' => $request->ad_code
        ])) {
            return response()->json(['success' => true, 'message' => 'Bank account updated successfully'], 200);
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
        $this->authorize('bank_account_delete');
        $irmCount = Irm::where('bank_id', $id)->count();
        $invoiceCount = Invoice::where('bank_id', $id)->count();
        $quotationCount = Quotation::where('bank_id', $id)->count();
        $message = '';
        $message = 'Bank ID cannot be removed as it is used in ';
        if($irmCount > 0 || $invoiceCount > 0 || $quotationCount > 0){
            if($irmCount > 0) {
                $message .= ' | IRM record(s) | ';
            }
            if($invoiceCount > 0) {
                $message .= ' | Invoice record(s) | ';
            }
            if($quotationCount > 0) {
                $message .= ' | Proforma Invoice record(s) | ';
            }
            return response()->json(['success' => false, 'message' => $message], 422);
        } else {
            if (BankAccount::find($id)->delete()) {
                return response()->json(['success' => true, 'message' => 'Bank account deleted successfully'], 200);
            } else {
                return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
            }
        }
        return $bankAccountsService->deleteBankAccount($request);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getBankById(Request $request)
    {
        return response()->json(BankAccount::select('id', 'bank_name', 'ad_code')->find($request->id), 200);
    }
}
