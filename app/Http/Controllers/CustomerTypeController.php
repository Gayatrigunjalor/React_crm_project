<?php

namespace App\Http\Controllers;

use App\Http\Requests\CustomerTypeRequest;
use Illuminate\Http\Request;
use App\Services\CustomerTypeService;
use App\Models\CustomerType;

class CustomerTypeController extends Controller
{
    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function index(CustomerTypeService $customerTypeService)
    {
        $this->authorize('customer_type_list');
        return $customerTypeService->listCustomerType();
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function customerTypeListing(CustomerTypeService $customerTypeService)
    {
        return $customerTypeService->listCustomerType();
    }

    /**
     * @param \App\Services\CustomerTypeService $customerTypeService
     * @param \App\Http\Requests\CustomerTypeRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(CustomerTypeRequest $request, CustomerTypeService $customerTypeService)
    {
        $this->authorize('customer_type_create');
        return $customerTypeService->createCustomerType($request);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @param \App\Services\CustomerTypeService $customerTypeService
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id, CustomerTypeService $customerTypeService)
    {
        $this->authorize('customer_type_edit');
        return $customerTypeService->editCustomerType($id);
    }

    /**
     * @param \App\Http\Requests\CustomerTypeRequest $request
     * @param \App\Services\CustomerTypeService $customerTypeService
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(CustomerTypeRequest $request, $id)
    {
        $this->authorize('customer_type_edit');
        if (CustomerType::find($id)->update(['name' => $request->name])) {
            return response()->json(['success' => true, 'message' => 'Customer type updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @param \App\Services\CustomerTypeService $customerTypeService
     * @return \Illuminate\Http\JsonResponse|void
     */
    public function destroy($id, CustomerTypeService $customerTypeService)
    {
        $this->authorize('customer_type_delete');
        return $customerTypeService->deleteCustomerType($id);
    }
}
