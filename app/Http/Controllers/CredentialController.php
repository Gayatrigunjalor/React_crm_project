<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\CredentialsRequest;
use App\Models\Credentials;
use App\Models\Employee;
use App\Models\User;
use App\Models\CredentialsHistory;
use Illuminate\Support\Facades\Auth;

class CredentialController extends Controller
{
    public function index()
    {
        $this->authorize('credentials_list');
        $rows = Credentials::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    public function getCredentialID()
    {
        $query = Credentials::selectRaw('MAX(CAST(SUBSTRING(cred_id, 3, length(cred_id)-2) AS UNSIGNED)) AS cred_id')->first();
        if (!empty($query)) {
            $value2 = $query->cred_id;
            $value2 = intval($value2) + 1;
            $cred_id = "C-" . $value2;
        } else {
            $cred_id = "C-1";
        }

        return $cred_id;
    }

    /**
     * @param \App\Http\Requests\CredentialsRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(CredentialsRequest $request)
    {
        $this->authorize('credentials_create');
        $this->validate($request,[
            'website_name'  => 'required',
            'username'      => 'required',
            'email_regd'    => 'email',
            'phone_regd'    => 'max:20',
            'purchase_date' => 'date_format:Y-m-d',
            'renew_date'    => 'date_format:Y-m-d',
        ]);

        if( Credentials::create([
                'cred_id'           => $this->getCredentialID(),
                'website_name'      => $request['website_name'],
                'website_fxn'       => $request['website_fxn'],
                'username'          => $request['username'],
                'email_regd'        => $request['email_regd'],
                'phone_regd'        => $request['phone_regd'],
                'mfa_by'            => $request['mfa_by'],
                'subscription_type' => $request['subscription_type'],
                'purchase_date'     => $request['purchase_date'],
                'renew_date'        => $request['renew_date'],
                'created_by'        => Auth::id()
            ])
        ) {
            return response()->json(['success' => true, 'message' => 'Credential saved successfully'], 200);
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
        $this->authorize('credentials_edit');
        $credential = Credentials::find($id);
        if($credential) {
            return response()->json($credential);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find credential'], 422);
        }
    }

        /**
     * @param \App\Http\Requests\CredentialsRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(CredentialsRequest $request, $id)
    {
        $this->authorize('credentials_edit');
        if (Credentials::find($id)->update([
            'website_name'      => $request['website_name'],
            'website_fxn'       => $request['website_fxn'],
            'username'          => $request['username'],
            'email_regd'        => $request['email_regd'],
            'phone_regd'        => $request['phone_regd'],
            'mfa_by'            => $request['mfa_by'],
            'subscription_type' => $request['subscription_type'],
            'purchase_date'     => $request['purchase_date'],
            'renew_date'        => $request['renew_date']
        ])) {
            return response()->json(['success' => true, 'message' => 'Credential updated successfully'], 200);
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
        $this->authorize('credentials_delete');
        $historyCount = CredentialsHistory::where('credential_id', $id)->count();
        if( $historyCount > 0) {
            if($historyCount > 0) {
                $message = 'Credential cannot be removed as it is used in Credential history\'s record.';
            }

            return response()->json(['success' => false, 'message' => $message], 422);
        } else {
            if (Credentials::find($id)->delete()) {
                return response()->json(['success' => true, 'message' => 'Credential deleted successfully'], 200);
            } else {
                return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
            }
        }
        return $credentialService->deleteCredentials($request);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     *
     */
    public function listAssignedCredential($emp_id)
    {
        $this->authorize('credentials_list');
        if(!empty($emp_id)){
            $employeeRow = Employee::select('id','name')->find($emp_id);
            return response()->json($employeeRow, 200);
        }
        else{
            return response()->json(['success' => false, 'message' => 'Employee ID not found'], 404);
        }
    }

    /**
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchAssignedCredentialToEmp(Request $request)
    {
        $emp_id = $request['emp_id'];
        $rows = Credentials::whereIn('assigned_to_emp', [$emp_id])->get();
        return response()->json($rows, 200);
    }

    /**
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchUnassignedCredential()
    {
        //Fetch Credentials which are not assigned to any employee
        $rows = Credentials::select('id', 'cred_id', 'website_name', 'website_fxn', 'username', 'mfa_by')->whereNull('assigned_to_emp')->orderBy('cred_id','ASC')->get();
        return response()->json($rows);
    }

    /**
     * Set assigned_to_emp and assigned_date against asset and create history
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function assignCredentialsToEmployee(Request $request)
    {
        $this->validate($request, [
            'employee_id' => 'required|integer',
            'credential_id' => 'required|integer',
            'remarks' => 'required|string'
        ]);

        $emp_id = $request->employee_id;
        $remarks = $request->remarks;
        $data = array(
            'assigned_to_emp'   => $emp_id,
            'assigned_date'     => date('Y-m-d')
        );

        Credentials::find($request->credential_id)->update($data);

        CredentialsHistory::create([
            'credential_id' => $request->credential_id,
            'employee_id' => $emp_id,
            'assigned_on' => date('Y-m-d'),
            'handover_date' => null,
            'remarks' => $remarks,
            'created_by' => Auth::id()
        ]);

        return response()->json(['success' => true, 'message' => 'Credential assigned successfully' ],200);
    }

    public function unAssignCredential(Request $request)
    {
        $this->validate($request, [
            'id' => 'required|integer',
        ]);
        $cred_id = $request['id'];
        $data = array(
            'assigned_to_emp'   => null,
            'assigned_date'     => null
        );
        $credential = Credentials::find($cred_id);
        $emp_id = $credential->assigned_to_emp;
        $assigned_date = $credential->assigned_date;
        //Update credentials entry
        $credential->update($data);

        $created_by = Auth::id();
        $user = User::with('employeeDetail')->where('id',$created_by)->first();
        $username = $user->employeeDetail->name ?? 'Admin' ;
        //Create credential history
        CredentialsHistory::create([
            'credential_id' => $cred_id,
            'employee_id' => $emp_id,
            'assigned_on' => $assigned_date,
            'handover_date' => date('Y-m-d'),
            'remarks' => 'Handover process done by '.$username,
            'created_by' => $created_by
        ]);

        return response()->json(['success' => true, 'message' => 'Credential unassigned successfully' ],200);
    }

    public function fetchCredentialHistory(Request $request)
    {
        $this->authorize('credentials_list');
        $rows = CredentialsHistory::with(['credential:id,cred_id,website_name,website_fxn','employee:id,user_id,name'])->where('credential_id', $request['id'])->orderBy('assigned_on','DESC')->get();
        return response()->json($rows, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchCredentialsCount()
    {
        $totalCredCount = Credentials::all();
        $totalAssignedCount = $totalCredCount->whereNotNull('assigned_to_emp')->count();
        $totalUnassignedCount = $totalCredCount->whereNull('assigned_to_emp')->count();

        return response()->json(['totalCredentialCount'=> $totalCredCount->count(), 'totalAssignedCount'=> $totalAssignedCount, 'totalUnassignedCount'=> $totalUnassignedCount]);
    }


    public function fetchCredentialsDashboardData()
    {
        $rows = Credentials::with(['createdName:id,user_id,name','assigned_to_employee:id,user_id,name'])->get();
        if($rows->count() > 0){
            return view('admin.dashboard.assets-credentials.credentials-list-rows', compact('rows'));
        }
        else{
            return '<h4 class="my-5 text-center text-danger">No record present in the database!</h4>';
        }
    }
}
