<?php

namespace App\Http\Controllers;

use App\Http\Requests\CompanyDetailsRequest;
use App\Services\CompanyDetailsService;
use Illuminate\Http\Request;

class CompanyDetailsController extends Controller
{
    /**
     * @param \App\Services\CompanyDetailsService $companyDetailsService
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function index(CompanyDetailsService $companyDetailsService)
    {
        $this->authorize('company_details_edit');
        $companies = $companyDetailsService->getCompanies();
        return response()->json($companies, 200);
    }

    public function getCompanies(CompanyDetailsService $companyDetailsService)
    {
        $this->authorize('company_details_edit');
        $companies = $companyDetailsService->getCompanies();
        return view('admin.master.company-details.company-tbl', compact('companies'));
    }

    public function companyDropdown(CompanyDetailsService $companyDetailsService)
    {
        $this->authorize('company_details_edit');
        $companies = $companyDetailsService->getCompanies();
        return response()->json($companies);
    }

    public function fetchCompanyDetails(Request $request, CompanyDetailsService $companyDetailsService)
    {
        $this->authorize('company_details_edit');
        return $companyDetailsService->fetchCompanyDetails($request->id);
    }

    /**
     * @param \App\Services\CompanyDetailsService $companyDetailsService
     * @param \App\Http\Requests\CompanyDetailsRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateCompanyDetails(CompanyDetailsRequest $request, CompanyDetailsService $companyDetailsService)
    {
        $this->authorize('company_details_edit');
        return $companyDetailsService->updateCompanyDetails($request);
    }
}
