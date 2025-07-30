<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Companies;
use App\Models\CompanyDetails;
use App\Models\UserCompaniesPermissions;

class CompanyDetailsService
{
    public function getCompanies()
    {
        return Companies::select("id", 'name', 'short_code')->get();
    }

    public function fetchCompanyDetails($id)
    {
        $companyDetails = CompanyDetails::where("id", $id)->first();
        return response()->json($companyDetails, 200);
    }

    public function updateCompanyDetails(Request $request)
    {
        $formArray = [
            'name' => $request->name,
            'short_code' => $request->short_code,
            'address' => $request->address,
            'city' => $request->city,
            'state' => $request->state,
            'country' => $request->country,
            'pin_code' => $request->pin_code,
            'gst_no' => $request->gst_no,
            'pan_no' => $request->pan_no,
            'pcpndt_no' => $request->pcpndt_no,
            'drug_lic_no' => $request->drug_lic_no,
            'iec' => $request->iec,
            'cin' => $request->cin,
            'tds' => $request->tds,
            'iso' => $request->iso,
            'arn' => $request->arn,
            'website' => $request->website,
            'optional_website' => $request->optional_website,
            'mobile' => $request->mobile,
            'optional_mobile' => $request->optional_mobile
        ];
        if($request->id != 0){
            if (CompanyDetails::find($request->id)->update($formArray)) {
                Companies::find($request->id)->update(['name' => $request->name, 'short_code' => $request->short_code]);
                return response()->json(['message' => 'Company details updated successfully!']);
            }
        } else {
            $company = Companies::create([
                'name' => $request->name,
                'short_code' => $request->short_code
            ]);

            $formArray['company_id'] = $company->id;
            UserCompaniesPermissions::create(['user_id' => Auth::id(), 'company_id' => $company->id]);
            CompanyDetails::create($formArray);

            return response()->json(['message' => 'Company created successfully!']);
        }
    }
}
