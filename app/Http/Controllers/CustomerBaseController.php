<?php

namespace App\Http\Controllers;

use App\Models\CustomerBase;
use Illuminate\Http\Request;
use App\Services\CustomerBaseService;
use App\Http\Requests\CustomerBaseRequest;
use Illuminate\Support\Facades\Validator;

class CustomerBaseController extends Controller
{
    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function index()
    {
        $this->authorize('customer_base_list');
        $rows = CustomerBase::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function customerBaseListing()
    {
        $rows = CustomerBase::orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @param \App\Http\Requests\CustomerBaseRequest $request
     * @param \App\Services\CustomerBaseService $customerBaseService
     * @return \Illuminate\Http\JsonResponse
     */
    public function addCustomerBase(CustomerBaseRequest $request, CustomerBaseService $customerBaseService)
    {
        $this->authorize('customer_base_create');
        return $customerBaseService->createCustomerBase($request);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @param \App\Services\CustomerBaseService $customerBaseService
     * @return \Illuminate\Http\JsonResponse
     */
    public function editCustomerBase(Request $request, CustomerBaseService $customerBaseService)
    {
        $this->authorize('customer_base_edit');
        $request->validate([
            'id' => 'required|integer'
        ]);
        return $customerBaseService->editCustomerBase($request);
    }

    /**
     * @param \App\Http\Requests\CustomerBaseRequest $request
     * @param \App\Services\CustomerBaseService $customerBaseService
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateCustomerBase(CustomerBaseRequest $request, CustomerBaseService $customerBaseService)
    {
        $this->authorize('customer_base_edit');
        $request->validate([
            'id' => 'required|integer'
        ]);
        return $customerBaseService->updateCustomerBase($request);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @param \App\Services\CustomerBaseService $customerBaseService
     * @return \Illuminate\Http\JsonResponse|void
     */
    public function deleteCustomerBase(Request $request, CustomerBaseService $customerBaseService)
    {
        $this->authorize('customer_base_delete');
        $request->validate([
            'id' => 'required|integer'
        ]);
        return $customerBaseService->deleteCustomerBase($request);
    }
}
