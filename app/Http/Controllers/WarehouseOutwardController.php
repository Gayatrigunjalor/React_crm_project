<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\CompanyDetails;
use App\Models\Consignee;
use App\Models\Customer;
use App\Models\Employee;
use App\Models\Invoice;
use App\Models\LocationDetail;
use App\Models\LogisticsCompliance;
use App\Models\PurchaseOrder;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\WarehouseOutward;
use App\Models\WarehouseBoxDetails;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;


class WarehouseOutwardController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $this->authorize('warehouse_list');
        $outwards = WarehouseOutward::with(['inward:id,inward_sys_id,inward_date,proforma_invoice_id,business_task_id,port_of_loading,port_of_discharge,inco_term_id',
                'inward.grns:id,inward_id,grn_number',
                'inward.business_task:id,customer_name',
                'inward.proforma_invoice:id,pi_number',
                'inward.inco_term:id,inco_term',
                'invoice:id,invoice_number'
            ])
            ->has('inward')
            ->orderBy('id', 'DESC')
            ->get();

        return response()->json($outwards, 200);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function createOutward()
    {
        $this->authorize('warehouse_list');

        $inwards = Warehouse::select('id', 'inward_sys_id', 'inward_date')
        ->where('packaging_done', 1)->orderBy('id', 'desc')->get();

        $invoices = Invoice::select('id', 'invoice_number')->where('outward_id', 0)->orderBy('id', 'desc')->get();
        return response()->json(['inwards' => $inwards, 'invoices' => $invoices]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $this->authorize('warehouse_create');
        //get latest ids
        $next_out_id = (new WarehouseOutward)->getLatestId();

        $this->validate($request,[
            'inward_id' => 'required',
            'invoice_id' => 'required',
            'eway_bill_number' => 'required',
            'eway_bill_date' => 'required',
            'e_way_bill' => 'max:2048',
            'pickup_proof' => 'required|max:2048',
            'e_way_bill' => 'required|max:2048',
            'delivery_challan' => 'required|max:2048',
            'id_card' => 'required|max:2048',
            'kyc' => 'required|max:2048',
            'delivery_boy_photo' => 'required|max:2048',
            'cargo_pickup_agent' => 'required|max:2048',
            'ffd_quotation' => 'required|max:2048',
        ]);

        $e_way_bill_attachment = null;
        //e_way_bill upload file and add filename in db
        if ($request->hasfile('e_way_bill')) {
            $attachment = $request->file('e_way_bill');
            $name = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            try{
                Storage::put('uploads/wms/outward/' . $name, file_get_contents($attachment));
                $e_way_bill_attachment = $name;
            } catch(Exception $e){
            }
        }

        $data = [
            'outward_sys_id' => "O-". $next_out_id,
            'inward_id' => $request->inward_id,
            'outward_date' => date('Y-m-d'),
            'eway_bill_date' => date('Y-m-d', strtotime($request->eway_bill_date)),
            'invoice_id' => $request->invoice_id,
            'eway_bill_number' => $request->eway_bill_number,
            'eway_bill_attachment' => $e_way_bill_attachment,
            'created_by' => Auth::id(),
        ];

        $this->storeCompliance($request);
        $map = [
            'logistics_id' => 1,
            'outward_id' => true
        ];

        if(WarehouseOutward::create($data)){
            //empty the location details
            $this->setLocationDetailEmpty($request->inward_id);
            Invoice::find($request->invoice_id)->update($map);
            return response()->json(['success' => true, 'message' => "Outward data submitted successfully"], 200);
        } else {
            return response()->json(['success' => false, "message" => "Something went wrong"], 422);
        }
    }

    /**
     * @param mixed $request
     * @return \Illuminate\Database\Eloquent\Model
     */
    public function storeCompliance($request)
    {
        if ($request->hasFile('pickup_proof')) {
            $this->validate($request,[
                'pickup_proof' => 'required|max:2048',
            ]);
            $attachment = $request->file('pickup_proof');
            $attachmentName = date('YmdHis') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/pickupproof/' . $attachmentName, file_get_contents($attachment));
            $pickupProofName = $attachmentName;
        }
        if ($request->hasFile('delivery_challan')) {
            $this->validate($request,[
                'delivery_challan' => 'required|max:2048',
            ]);
            $attachment = $request->file('delivery_challan');
            $attachmentName = date('YmdHis') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/deliverychallan/' . $attachmentName, file_get_contents($attachment));
            $deliveryChallanName = $attachmentName;
        }
        if ($request->hasFile('id_card')) {
            $this->validate($request,[
                'id_card' => 'required|max:2048',
            ]);
            $attachment = $request->file('id_card');
            $attachmentName = date('YmdHis') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/idcard/' . $attachmentName, file_get_contents($attachment));
            $idCardName = $attachmentName;
        }
        if ($request->hasFile('delivery_boy_photo')) {
            $this->validate($request,[
                'delivery_boy_photo' => 'required|max:2048',
            ]);
            $attachment = $request->file('delivery_boy_photo');
            $attachmentName = date('Y_m_d_His') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/idcard/' . $attachmentName, file_get_contents($attachment));
            $delivery_boy_photoName = $attachmentName;
        }
        if ($request->hasFile('kyc')) {
            $this->validate($request,[
                'kyc' => 'required|max:2048',
            ]);
            $attachment = $request->file('kyc');
            $attachmentName = date('YmdHis') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/kyc/' . $attachmentName, file_get_contents($attachment));
            $kycName = $attachmentName;
        }
        if ($request->hasFile('cargo_pickup_agent')) {
            $this->validate($request,[
                'cargo_pickup_agent' => 'required|max:2048',
            ]);
            $attachment = $request->file('cargo_pickup_agent');
            $attachmentName = date('YmdHis') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/cargo_pickup/' . $attachmentName, file_get_contents($attachment));
            $cargo_pickup_Name = $attachmentName;
        }
        if ($request->hasFile('ffd_quotation')) {
            $this->validate($request,[
                'ffd_quotation' => 'required|max:2048',
            ]);
            $attachment = $request->file('ffd_quotation');
            $attachmentName = date('YmdHis') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/ffd_quotation/' . $attachmentName, file_get_contents($attachment));
            $ffd_quotation_Name = $attachmentName;
        }
        if ($request->hasFile('insurance_attachment')) {
            $this->validate($request,[
                'insurance_attachment' => 'max:2048',
            ]);
            $attachment = $request->file('insurance_attachment');
            $attachmentName = date('YmdHis') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/insurance_attachment/' . $attachmentName, file_get_contents($attachment));
            $insurance_attachment_Name = $attachmentName;
        }
        if ($request->hasFile('other_attachment')) {
            $this->validate($request,[
                'other_attachment' => 'max:2048',
            ]);
            $attachment = $request->file('other_attachment');
            $attachmentName = date('YmdHis') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/other_attachment/' . $attachmentName, file_get_contents($attachment));
            $other_attachment_Name = $attachmentName;
        }
        return LogisticsCompliance::create([
            'invoice_id' => $request->invoice_id,
            'ffd_id' => 0,
            'pickup_proof' => $pickupProofName,
            'e_way_bill' => '',
            'delivery_challan' => $deliveryChallanName,
            'id_card' => $idCardName,
            'kyc' => $kycName,
            'cargo_pickup_agent' => $cargo_pickup_Name,
            'ffd_quotation' => $ffd_quotation_Name,
            'insurance_attachment' => $insurance_attachment_Name ?? null,
            'other_attachment' => $other_attachment_Name ?? null,
            'delivery_boy_photo' => $delivery_boy_photoName,
            'approved' => true,
            'created_by' => Auth::id()
        ]);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\WarehouseOutward  $warehouseOutward
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $this->authorize('warehouse_edit');
        $outward = WarehouseOutward::with(['inward:id,inward_sys_id', 'invoice:id,invoice_number'])->find($id);
        return response()->json($outward, 200);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\WarehouseOutward  $warehouseOutward
     * @return \Illuminate\Http\Response
     */
    public function edit(WarehouseOutward $warehouseOutward)
    {
        $this->authorize('warehouse_edit');
        $invoices = Invoice::select('id', 'invoice_number')->where('outward_id', 0)->get()->toArray();
        $inwards = Warehouse::select('id', 'inward_sys_id')
        ->where('packaging_done', 1)->orderBy('id', 'desc')->get();

        $invoice_details = $warehouseOutward->invoice;

        $invoices[] = array('id' => $warehouseOutward->invoice->id, 'invoice_number' => $warehouseOutward->invoice->invoice_number);

        $logistics_details = "";
        if($warehouseOutward->invoice->logistics_id){
            $logistics_details = LogisticsCompliance::where('invoice_id', $warehouseOutward->invoice->id)->first();
        }

        return view('admin.warehouse.outward.edit-outward-details')->with(['outward'=> $warehouseOutward, 'inwards' => $inwards, 'invoices' => array_reverse($invoices), 'invoice_details' => $invoice_details, 'logistics_details' => $logistics_details]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\WarehouseOutward  $warehouseOutward
     * @return \Illuminate\Http\Response
     */
    public function updateOutward(Request $request)
    {
        $this->authorize('warehouse_edit');

        if(empty($request->fetchedLogisticsData)){
            $this->validate($request,[
                'inward_id' => 'required',
                'invoice_id' => 'required',
                'eway_bill_number' => 'required',
                'eway_bill_date' => 'required',
                'e_way_bill' => 'max:2048',
                'pickup_proof' => 'required|max:2048',
                'delivery_challan' => 'required|max:2048',
                'id_card' => 'required|max:2048',
                'kyc' => 'required|max:2048',
                'delivery_boy_photo' => 'required|max:2048',
                'cargo_pickup_agent' => 'required|max:2048',
                'ffd_quotation' => 'required|max:2048',
            ]);
            $this->storeCompliance($request); // if new invoice ID where logistics data not present
            Invoice::find($request->invoice_id)->update([
                'logistics_id' => 1,
                'outward_id' => true
            ]);
        } else {
            $this->updateCompliance($request);
        }
        $warehouseOutward = WarehouseOutward::find($request->id);

        $updateArray = [
            'inward_id' => $request->inward_id,
            'invoice_id' => $request->invoice_id,
            'eway_bill_number' => $request->eway_bill_number,
            'eway_bill_date' => $request->eway_bill_date,
        ];

        if ($request->hasfile('e_way_bill')) {
            $attachment = $request->file('e_way_bill');
            $name = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            try{
                Storage::put('uploads/wms/outward/' . $name, file_get_contents($attachment));
                $e_way_bill_attachment = $name;
            } catch(Exception $e){
            }
            $updateArray['e_way_bill'] = $e_way_bill_attachment;
        }
        //update outward details
        WarehouseOutward::find($request->id)->update($updateArray);

        //if Invoice ID from request and outward invoice_id not same then make outward_id : false
        if($request->invoice_id != $warehouseOutward->invoice_id){
            Invoice::find($warehouseOutward->invoice_id)->update(['outward_id' => false]);
        }
        if($warehouseOutward->save()) {
            return response()->json(['success' => true, 'message' => "Outward data updated successfully"], 200);
        } else {
            return response()->json(['success' => true, 'message' => "Something went wrong"], 422);
        }

    }

        /**
     * @param mixed $request
     * @return \Illuminate\Database\Eloquent\Model
     */
    public function updateCompliance($request)
    {
        $updateData = [
            'invoice_id' => $request->invoice_id,
            'ffd_id' => 0,
            'e_way_bill' => ''
        ];
        if ($request->hasFile('pickup_proof')) {
            $this->validate($request,[
                'pickup_proof' => 'required|max:2048',
            ]);
            $attachment = $request->file('pickup_proof');
            $attachmentName = date('YmdHis') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/pickupproof/' . $attachmentName, file_get_contents($attachment));
            $updateData['pickup_proof'] = $attachmentName;
        }
        if ($request->hasFile('delivery_challan')) {
            $this->validate($request,[
                'delivery_challan' => 'required|max:2048',
            ]);
            $attachment = $request->file('delivery_challan');
            $attachmentName = date('YmdHis') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/deliverychallan/' . $attachmentName, file_get_contents($attachment));
            $updateData['delivery_challan'] = $attachmentName;
        }
        if ($request->hasFile('id_card')) {
            $this->validate($request,[
                'id_card' => 'required|max:2048',
            ]);
            $attachment = $request->file('id_card');
            $attachmentName = date('YmdHis') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/idcard/' . $attachmentName, file_get_contents($attachment));
            $updateData['id_card'] = $attachmentName;
        }
        if ($request->hasFile('delivery_boy_photo')) {
            $this->validate($request,[
                'delivery_boy_photo' => 'required|max:2048',
            ]);
            $attachment = $request->file('delivery_boy_photo');
            $attachmentName = date('Y_m_d_His') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/idcard/' . $attachmentName, file_get_contents($attachment));
            $updateData['delivery_boy_photo'] = $attachmentName;
        }
        if ($request->hasFile('kyc')) {
            $this->validate($request,[
                'kyc' => 'required|max:2048',
            ]);
            $attachment = $request->file('kyc');
            $attachmentName = date('YmdHis') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/kyc/' . $attachmentName, file_get_contents($attachment));
            $updateData['kyc'] = $attachmentName;
        }
        if ($request->hasFile('cargo_pickup_agent')) {
            $this->validate($request,[
                'cargo_pickup_agent' => 'required|max:2048',
            ]);
            $attachment = $request->file('cargo_pickup_agent');
            $attachmentName = date('YmdHis') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/cargo_pickup/' . $attachmentName, file_get_contents($attachment));
            $updateData['cargo_pickup_agent'] = $attachmentName;
        }
        if ($request->hasFile('ffd_quotation')) {
            $this->validate($request,[
                'ffd_quotation' => 'required|max:2048',
            ]);
            $attachment = $request->file('ffd_quotation');
            $attachmentName = date('YmdHis') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/ffd_quotation/' . $attachmentName, file_get_contents($attachment));
            $updateData['ffd_quotation'] = $attachmentName;
        }
        if ($request->hasFile('insurance_attachment')) {
            $this->validate($request,[
                'insurance_attachment' => 'max:2048',
            ]);
            $attachment = $request->file('insurance_attachment');
            $attachmentName = date('YmdHis') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/insurance_attachment/' . $attachmentName, file_get_contents($attachment));
            $updateData['insurance_attachment'] = $attachmentName;
        }
        if ($request->hasFile('other_attachment')) {
            $this->validate($request,[
                'other_attachment' => 'max:2048',
            ]);
            $attachment = $request->file('other_attachment');
            $attachmentName = date('YmdHis') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/other_attachment/' . $attachmentName, file_get_contents($attachment));
            $updateData['other_attachment'] = $attachmentName;
        }
        return LogisticsCompliance::find($request->fetchedLogisticsData['id'])->update($updateData);
    }


    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\WarehouseOutward  $warehouseOutward
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $this->authorize('warehouse_delete');
        $warehouseOutward = WarehouseOutward::find($id);
        if($warehouseOutward) {
            $inv_id = $warehouseOutward->invoice_id;
            $inward_id = $warehouseOutward->inward_id;
            if($warehouseOutward->delete()) {
                Invoice::find($inv_id)->update(['outward_id' => false]);
                $this->setLocationDetailUsed($inward_id);
                return response()->json(["success" => true, "message" => "Outward deleted successfully!"], 200);
            } else {
                return response()->json(["success" => false, "message" => "Something went wrong"], 422);
            }
        } else {
            return response()->json(["success" => false, "message" => "Outward not found"], 404);
        }
    }

    private function setLocationDetailEmpty($inward_id) {
        $boxes = WarehouseBoxDetails::select('id','inward_id','location_detail_id')->where('inward_id', $inward_id)->get();
        foreach($boxes as $box) {
            $box_loc = $box->location_detail_id;
            LocationDetail::find($box_loc)->update(['is_empty' => true]);
        }
    }

    private function setLocationDetailUsed($inward_id) {
        $boxes = WarehouseBoxDetails::select('id','inward_id','location_detail_id')->where('inward_id', $inward_id)->get();
        foreach($boxes as $box) {
            $box_loc = $box->location_detail_id;
            LocationDetail::find($box_loc)->update(['is_empty' => false]);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getInvoiceDetailsOnOutward(Request $request) {
        $this->authorize('warehouse_list');
        $outward = null;
        if($request->outward_id != null){
            $outward = WarehouseOutward::find($request->outward_id);
        }
        $invoice = Invoice::select('id', 'invoice_number', 'invoice_date', 'total_net_weight', 'total_gross_weight', 'total_value_weight', 'no_of_packages', 'international_ffd_id', 'domestic_ffd_id', 'volum_range', 'logistics_id')
        ->with(['ffdInternational', 'ffdDomestic'])
        ->find($request->invoice_id);

        $logistics_details = "";
        if(!empty($invoice->logistics_id)){
            $logistics_details = LogisticsCompliance::where('invoice_id', $invoice->id)->first();
        }

        return response()->json(['outward' => $outward, 'invoice_details' => $invoice, 'logistics_details' => $logistics_details ],200);
    }

    public function createOutwardSticker($id) {
        $outward = WarehouseOutward::find($id);
        // $wms = Warehouse::with(['boxes', 'business_task:id,customer_name', 'proforma_invoice:id,pi_number,buyer_id,consignee_id', 'inco_term:id,inco_term'])->withCount('boxes')->find($id);

            $buyer_details = Customer::where('id', $outward->inward->proforma_invoice->buyer_id)->first();
            $consignee_details = Consignee::where('id', $outward->inward->proforma_invoice->consignee_id)->first();

            $companyDetails = CompanyDetails::where('id', '1')->first();

            $box_details = [];
            foreach($outward->inward->boxes as $box) {

                $product_code = Product::where('id', $box->product_code_id)->value('product_code');
                $purchase_order = PurchaseOrder::find($box->purchase_order_id);
                $idsArr = explode(',', $box->box_inspection_by);
                $employees = Employee::select('name')->whereIn('user_id', $idsArr)->get();
                $employee_names = [];
                foreach($employees as $emp){
                    $employee_names[] = $emp->name;
                }

                $bx['product_code'] = $product_code;
                $bx['product_quantity'] = $box->product_quantity;
                // $bx['po_number'] = $purchase_order->purchase_order_number;
                // $bx['vendor_id'] = $purchase_order->vendor_id;
                // $bx['location'] = $location->warehouse_name. ' - '. $location->rack_number . ' - ' . $location->floor;
                // $bx['length'] = $box->length;
                // $bx['width'] = $box->width;
                // $bx['height'] = $box->height;
                // $bx['net_weight'] = $box->net_weight;
                // $bx['gross_weight'] = $box->gross_weight;
                // $bx['hazardous_symbol'] = $box->hazardous_symbol == "Hazardous" ? "HZ" : "NZ";
                $bx['box_content'] = $box->box_content;
                $bx['box_sys_id'] = $box->box_sys_id;
                $bx['grn_sys_id'] = $box->grn_sys_id;
                $bx['pl_id'] = Str::replace('B-', 'PL-', $box->box_sys_id);
                $bx['pl_date'] = date('d M Y', strtotime($box->box_packaging_date));
                $bx['employee_names'] = implode(", ", $employee_names);

                $box_details[] = $bx;
            }

            $data = [
                'inward_id'         => $outward->inward->inward_sys_id,
                'outward_id'        => Str::replace('I-', 'OUT-', $outward->inward->inward_sys_id),
                'outward_date'      => $outward->outward_date,
                'buyer_details'     => $buyer_details,
                'bt_id'             => $outward->inward->business_task_id,
                'invoice_number'    => $outward->invoice->invoice_number,
                'invoice_date'      => $outward->invoice->invoice_date,
                'no_of_packages'    => $outward->invoice->no_of_packages,
                'consignee_details' => $consignee_details,
                'companyDetails'    => $companyDetails,
                'eway_bill_number'  => $outward->eway_bill_number,
                'box_details'       => $box_details
            ];

            $view = 'admin.warehouse.pdf.outward-sticker-new';
            $pdfName = 'outward-sticker';
            $customPaper = array(0,0,425.20,283.80);
            $pdf = Pdf::setOptions(['isHtml5ParserEnabled' => true])
                ->loadView($view, $data)->setPaper($customPaper, 'landscape');
            return $pdf->download($id . '-' . $pdfName . '.pdf');
            // return view($view)->with($data);

    }
}
