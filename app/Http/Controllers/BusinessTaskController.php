<?php

namespace App\Http\Controllers;

use App\Http\Requests\BusinessTaskRequest;
use Illuminate\Http\Request;
use App\Models\BusinessTask;
use App\Services\BusinessTaskService;
use Illuminate\Support\Facades\Storage;


class BusinessTaskController extends Controller
{
    /**
     * @param \App\Services\BusinessTaskService $businessTaskService
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function index(BusinessTaskService $businessTaskService)
    {
        $this->authorize('business_task_list');
        return $businessTaskService->listBusinessTask();
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchBusinessTaskCount()
    {
        $businessTasks = BusinessTask::select('id', 'customer_name')->get();
        return response()->json([
            'businessTasksCount' => $businessTasks->count()
        ]);
    }

    /**
     * @param \App\Services\BusinessTaskService $businessTaskService
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function btDropdownListing(BusinessTaskService $businessTaskService)
    {
        return $businessTaskService->btDropdownList();
    }

    public function checkBTcreated(Request $request) {
        $this->validate($request, [
            'opportunity_id' => 'required',
        ]);

        if(BusinessTask::where('opportunity_id', $request->opportunity_id)->count()) {
            return response()->json([
                'success' => true,
                'message' => 'Business Task already created'
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Business Task not created'
            ]);
        }
    }

    /**
     * @param \App\Services\BusinessTaskService $businessTaskService
     * @param \App\Services\BusinessTaskService $businessTaskService
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(BusinessTaskRequest $request, BusinessTaskService $businessTaskService)
    {
        $this->authorize('business_task_create');
        $this->validate($request, [
            'customer_name' => 'required',
        ]);
        return $businessTaskService->createBusinessTask($request);
    }

    public function createBTfromSalesMatrix(BusinessTaskRequest $request, BusinessTaskService $businessTaskService)
    {

        $this->authorize('business_task_create');
        $this->validate($request, [
            'opportunity_id' => 'required|integer',
            'customer_name' => 'required',
            'proforma_invoice' => 'max:4096',
        ],['proforma_invoice.max' => 'Maximum file upload size is 4MB' ]);

        return $businessTaskService->createSalesBusinessTask($request);
    }

    /**
     * @param mixed $id
     * @param \App\Services\BusinessTaskService $businessTaskService
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function show($id, BusinessTaskService $businessTaskService)
    {
        $this->authorize('business_task_edit');
        return $businessTaskService->editBusinessTask($id);
    }

    /**
     * @param mixed $id
     * @param \App\Services\BusinessTaskService $businessTaskService
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function edit($id, BusinessTaskService $businessTaskService)
    {
        $this->authorize('business_task_edit');
        return $businessTaskService->editBusinessTask($id);
    }

    /**
     * @param \App\Http\Requests\BusinessTaskRequest $request
     * @param \App\Services\BusinessTaskService $businessTaskService
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateEnquiryDetailsBt(BusinessTaskRequest $request, BusinessTaskService $businessTaskService)
    {
        $this->authorize('business_task_edit');
        return $businessTaskService->updateEnquiryDetails($request);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @param \App\Services\BusinessTaskService $businessTaskService
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateSdeWorksheetBt(Request $request, BusinessTaskService $businessTaskService)
    {
        $this->authorize('business_task_edit');
        return $businessTaskService->updateSdeWorksheet($request);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @param \App\Services\BusinessTaskService $businessTaskService
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateLogisticsInstructionBt(Request $request, BusinessTaskService $businessTaskService)
    {
        $this->authorize('business_task_edit');
        $this->validate($request, [
            'inco_term_id' => 'required',
            'port_of_unloading' => 'required',
            'final_destination' => 'required',
            'destination_code' => 'required',
            'freight_target_cost' => 'required|numeric',
        ]);
        return $businessTaskService->updateLogisticsInstruction($request);
    }

    /**
     * @param mixed $id
     * @param \App\Services\BusinessTaskService $businessTaskService
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function acWorksheetEdit($id, BusinessTaskService $businessTaskService)
    {
        $this->authorize('business_task_edit');
        return $businessTaskService->acWorksheetEdit($id);
    }

    /**
     * @param mixed $id
     * @param \App\Services\BusinessTaskService $businessTaskService
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function vendorPurchaseHistory($id, BusinessTaskService $businessTaskService)
    {
        $this->authorize('business_task_edit');
        return $businessTaskService->vendorPurchaseHistory($id);
    }

    /**
     * @param mixed $id
     * @param \App\Services\BusinessTaskService $businessTaskService
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function lmWorksheetEdit($id, BusinessTaskService $businessTaskService)
    {
        $this->authorize('business_task_edit');
        return $businessTaskService->lmWorksheetEdit($id);
    }

    /**
     * @param \Illuminate\Http\Request $request
     * @param \App\Services\BusinessTaskService $businessTaskService
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory|string
     */
    public function fetchQuotationBt(Request $request, BusinessTaskService $businessTaskService)
    {
        return $businessTaskService->fetchQuotation($request);
    }

    // /**
    //  * @param  \Illuminate\Http\Request  $request
    //  * @param \App\Services\BusinessTaskService $businessTaskService
    //  * @return \Illuminate\Http\JsonResponse
    //  */
    // public function sendFeedBackMail(Request $request, BusinessTaskService $businessTaskService)
    // {
    //     return $businessTaskService->sendFeedBackMail($request);
    // }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @param \App\Services\BusinessTaskService $businessTaskService
     * @return \Illuminate\Http\Response
     */
    public function getFileDownload(Request $request)
    {
        $path = $request->filepath;
        $filename = basename($path);
        $headers = [
            'Content-Type' => Storage::mimeType($request->filepath),
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];
        return \Response::make(Storage::get($request->filepath), 200, $headers);
    }
}
