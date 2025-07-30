<?php

namespace App\Http\Controllers;

use App\Models\PmWorksheetBt;
use Illuminate\Http\Request;
use App\Services\PmWorksheetBtService;

class PmWorksheetBtController extends Controller
{
    /**
     * @param mixed $id
     * @param \App\Services\PmWorksheetBtService $pmWorksheetBtService
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function pmWorksheetEdit($id)
    {
        $this->authorize('business_task_edit');
        $pmWorksheetRow = PmWorksheetBt::find($id);
        if($pmWorksheetRow){
            return response()->json($pmWorksheetRow, 200);
        } else {
            return response()->json(['success' => false, 'message' => "Unable to find purchase dept scrutiny"], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @param \App\Services\PmWorksheetBtService $pmWorksheetBtService
     * @return \Illuminate\Http\JsonResponse
     */
    public function addPmWorksheetBt(Request $request, PmWorksheetBtService $pmWorksheetBtService)
    {
        $this->authorize('business_task_edit');
        $this->validate($request, [
            'business_task_id' => 'required',
            'make1' => 'required',
            'model1' => 'required',
            'supplier_name2' => 'required',
            'warranty_extension' => 'required',
            'product_authenticity' => 'required',
            'physical_verification' => 'required',
            'ready_stock_quantity' => 'required',
            'lead_time' => 'required',
            'custvsvendcommitment' => 'required',
            'expiry' => 'required',
            'proformainvvsvendorqot' => 'required',
            'quantity1' => 'required',
            'technicalspecipm' => 'required',
            'productspecicrutiny' => 'required',
            'condition1' => 'required',
            'product_type1' => 'required',
            'transportation_cost' => 'required|numeric',
            'warrenty' => 'required',
            'year_of_manufacturing1' => 'required',
            'packaging_cost' => 'required|numeric'
        ]);
        return $pmWorksheetBtService->addPmWorksheet($request);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @param \App\Services\PmWorksheetBtService $pmWorksheetBtService
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePmWorksheetBt(Request $request, $id, PmWorksheetBtService $pmWorksheetBtService)
    {
        $this->authorize('business_task_edit');
        $this->validate($request, [
            'business_task_id' => 'required',
            'make1' => 'required',
            'model1' => 'required',
            'supplier_name2' => 'required',
            'warranty_extension' => 'required',
            'product_authenticity' => 'required',
            'physical_verification' => 'required',
            'ready_stock_quantity' => 'required',
            'lead_time' => 'required',
            'custvsvendcommitment' => 'required',
            'expiry' => 'required',
            'proformainvvsvendorqot' => 'required',
            'quantity1' => 'required',
            'technicalspecipm' => 'required',
            'productspecicrutiny' => 'required',
            'condition1' => 'required',
            'product_type1' => 'required',
            'transportation_cost' => 'required|numeric',
            'warrenty' => 'required',
            'year_of_manufacturing1' => 'required',
            'packaging_cost' => 'required|numeric'
        ]);
        return $pmWorksheetBtService->updatePmWorksheet($request, $id);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @param \App\Services\PmWorksheetBtService $pmWorksheetBtService
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory|string
     */
    public function getPmWorksheetBt($id, PmWorksheetBtService $pmWorksheetBtService)
    {
        return $pmWorksheetBtService->getPmWorksheetBt($id);
    }

}
