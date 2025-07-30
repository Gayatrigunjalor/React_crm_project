<?php

namespace App\Http\Controllers;
use App\Models\Customer;
use App\Models\PurchaseOrder;
use App\Models\BusinessTask;
use App\Models\Consignee;
use App\Models\Employee;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\LocationDetail;
use App\Models\LogisticsCompliance;
use App\Models\RegulatoryDashboard;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\WarehouseAttachments;
use App\Models\WarehouseBoxAttachments;
use App\Models\WarehouseBoxDetails;
use App\Models\WarehouseBoxProducts;
use App\Models\WarehouseGRN;
use App\Models\SupplierScrutinyBt;
use App\Models\PoDetailsBt;
use App\Models\TaxInvoiceDetailsBt;
use App\Models\PmWorksheetBt;
use App\Models\PaymentHistoryBt;
use App\Models\VendorPurchaseInvoice;
use App\Models\FreightCostSourcingBt;
use App\Models\OwnpickupBt;
use App\Models\ServeBySuppliersBt;
use App\Models\ImportPickupBt;
use App\Models\ExportAgentBt;
use App\Models\PortOfLandingBt;
use App\Models\Irm;
use App\Models\IrmPaymentHistory;
use Exception;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Exports\ExportWMSDashboard;
use Barryvdh\DomPDF\Facade\Pdf;

use App\Models\WarehouseOutward;
use Maatwebsite\Excel\Facades\Excel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WarehouseController extends Controller
{
    protected $business_filter_date;

    public function __construct()
    {
        $dt = Carbon::create(2024, 01, 01, 00, 00, 00); //fetch bt for only current year
        $this->business_filter_date = $dt->format('Y-m-d H:i:s');
    }

    public function inwardListing() {
        $this->authorize('warehouse_list');
        $inward_details = Warehouse::with(['grns:id,inward_id,grn_number', 'business_task:id,customer_name', 'proforma_invoice:id,pi_number', 'inco_term:id,inco_term'])->withCount('boxes')->orderBy('id', 'DESC')->get();
        return response()->json($inward_details, 200);
    }

    public function createInward() {
        $this->authorize('warehouse_create');
        $inw = new Warehouse;
        return response()->json($inw->getLatestId(), 200);
    }

    public function storeInward(Request $request) {
        // dd($request->all());
        $this->authorize('warehouse_create');
        $this->validate($request,[
            'quotation_id' => 'required | integer',
            'business_task_id' => 'required | integer',
            'port_of_loading' => 'required',
            'port_of_discharge' => 'required',
            'pickup_location' => 'required',
            'mode_of_shipment' => 'required',
            'terms_of_shipment' => 'required',
            'grn_data.*.purchase_order_id' => 'required | integer',
            'grn_data.*.vendor_tax_invoice_number' => 'required',
            'grn_data.*.vendor_tax_invoice_date' => 'required',
            'grn_data.*.vendor_tax_invoice_attachment' => 'required| max:5128',
            'grn_data.*.box_data.*.location_detail_id' => 'required | integer',
            'grn_data.*.box_data.*.net_weight' => 'required | numeric',
            'grn_data.*.box_data.*.gross_weight' => 'required | numeric',
            'grn_data.*.box_data.*.length' => 'required | numeric',
            'grn_data.*.box_data.*.width' => 'required | numeric',
            'grn_data.*.box_data.*.height' => 'required | numeric',
            'grn_data.*.box_data.*.haz_symbol_attachment' => 'max:2048',
            'grn_data.*.box_data.*.box_sr_no_attachment' => 'max:2048',
            'grn_data.*.box_data.*.product_attachment' => 'max:2048',
            'grn_data.*.box_data.*.box_products.*.product_id' => 'required | integer',
            'grn_data.*.box_data.*.box_products.*.manufacture_year' => 'required | string',
            'grn_data.*.box_data.*.box_products.*.product_quantity' => 'required | numeric',
            'grn_data.*.box_data.*.box_products.*.product_hsn' => 'required | integer',
        ],[
            'grn_data.*.vendor_tax_invoice_attachment.max' => 'Maximum allowed file size for Vendor Tax Invoice is 5MB',
            'grn_data.*.box_data.*.haz_symbol_attachment.max' => 'Maximum allowed file size of HZ/NZ symbol is 2MB',
            'grn_data.*.box_data.*.box_sr_no_attachment.max' => 'Maximum allowed file size of Box Serial Number is 2MB',
            'grn_data.*.box_data.*.product_attachment.max' => 'Maximum allowed file size of Product Attachment is 2MB',
        ]);

        DB::beginTransaction();
        try {
            $inw = new Warehouse;
            $inw_latest_id = $inw->getLatestId();

            $inward_create = Warehouse::create([
                'inward_sys_id' => 'I-'.$inw_latest_id,
                'inward_date' => date('Y-m-d'),
                'proforma_invoice_id' => $request->quotation_id,
                'business_task_id' => $request->business_task_id,
                'port_of_loading' => $request->port_of_loading,
                'port_of_discharge' => $request->port_of_discharge,
                'inco_term_id' => $request->inco_term_id,
                'pickup_location' => $request->pickup_location,
                'mode_of_shipment' => $request->mode_of_shipment,
                'terms_of_shipment' => $request->terms_of_shipment,
            ]);

            $inward_create_id = $inward_create->id;

            //add shipment attachments
            if ($request->has('shipment_file')) {
                foreach ($request->shipment_file as $ship_file) {
                    $ship_fileName = date('YmdHis_') .rand(10000, 99999). "." . $ship_file->getClientOriginalExtension();
                    Storage::put('uploads/wms/inward/shipment_images/' . $ship_fileName, file_get_contents($ship_file));

                    WarehouseAttachments::create([
                        'inward_id' => $inward_create_id,
                        'name' => $ship_fileName,
                        'attachment_type' => "shipment_image",
                        'attachment_details' => null,
                        'created_by' => Auth::id()
                    ]);
                }
            }

            $w_grn = new WarehouseGRN; //initialize to get latest grn id
            $wms_box = new WarehouseBoxDetails;

            foreach($request->grn_data as $grn) {
                //upload vendor_tax_invoice_attachment (1 each GRN)
                $inv_name = null;
                if (!empty($grn['vendor_tax_invoice_attachment'])) {
                    $vti_attachment = $grn['vendor_tax_invoice_attachment'];
                    $inv_name = date('Ymd_His_') .rand(10000, 99999). "." . $vti_attachment->getClientOriginalExtension();
                    try {
                        Storage::put('uploads/wms/vendor_tax_invoice/' . $inv_name, file_get_contents($vti_attachment));
                    } catch(Exception $e){
                        $inv_name = null;
                        Log::error("Unable to upload vendor tax invoice attachment. ".json_encode($e->getMessage())."");
                    }
                }
                $grn_create = WarehouseGRN::create([
                    'inward_id' => $inward_create_id,
                    'grn_number' => 'G-'.$w_grn->getLatestGrnId(),
                    'purchase_order_id' => $grn['purchase_order_id'],
                    'vendor_tax_invoice_number' => $grn['vendor_tax_invoice_number'],
                    'vendor_tax_invoice_date' => $grn['vendor_tax_invoice_date'],
                    'vendor_tax_invoice_attachment' => $inv_name,
                ]);

                $grn_system_id = $grn_create->id;  //grn last created ID

                //iterate on box_data to store GRN's boxes data
                foreach($grn['box_data'] as $box) {

                    //insert box details with last inserted inward id
                    $wms_box_create = WarehouseBoxDetails::create([
                        'inward_id'                     => $inward_create_id,
                        'grn_sys_id'                    => $grn_system_id,
                        'box_sys_id'                    => 'B-'.$wms_box->getLatestId(),
                        'purchase_order_id'             => $grn['purchase_order_id'],
                        'location_detail_id'            => $box['location_detail_id'],
                        'net_weight'                    => $box['net_weight'],
                        'gross_weight'                  => $box['gross_weight'],
                        'length'                        => $box['length'],
                        'width'                         => $box['width'],
                        'height'                        => $box['height'],
                    ]);

                    //get uploaded files from request
                    //box_serial_attachment upload file and add filename in db
                    if (!empty($box['box_sr_no_attachment'])) {
                        $box_serial_attachment = $box['box_sr_no_attachment'];
                        $box_serial_name = date('YmdHis_') .rand(10000, 99999). "_bx." . $box_serial_attachment->getClientOriginalExtension();
                        Storage::put('uploads/wms/inward/' . $box_serial_name, file_get_contents($box_serial_attachment));
                        $box_serial_attachment = $box_serial_name;
                        //insert or update new attachment for box_serial
                        WarehouseBoxAttachments::updateOrCreate([
                            'warehouse_box_id' => $wms_box_create->id,
                            'attachment_type' => "box_serial"
                            ],[
                                'name' => $box_serial_attachment,
                                'attachment_details' => null,
                                'created_by' => Auth::id()
                        ]);
                    }

                    //haz_symbol_attachment upload file and add filename in db
                    if (!empty($box['haz_symbol_attachment'])) {
                        $haz_symbol_attachment = $box['haz_symbol_attachment'];

                        $haz_symbol_name = date('YmdHis_') .rand(10000, 99999). "_haz." . $haz_symbol_attachment->getClientOriginalExtension();
                        Storage::put('uploads/wms/inward/' . $haz_symbol_name, file_get_contents($haz_symbol_attachment));
                        $haz_symbol_attachment = $haz_symbol_name;
                        //insert or update new attachment for haz_symbol
                        WarehouseBoxAttachments::updateOrCreate([
                            'warehouse_box_id' => $wms_box_create->id,
                            'attachment_type' => "haz_symbol"
                            ],[
                                'name' => $haz_symbol_attachment,
                                'attachment_details' => null,
                                'created_by' => Auth::id()
                        ]);
                    }
                    //product_attachment upload file and add filename in db
                    if (!empty($box['product_attachment'])) {
                        $product_attachment = $box['product_attachment'];
                        $product_image_name = date('YmdHis_') .rand(10000, 99999). "_prod." . $product_attachment->getClientOriginalExtension();
                        Storage::put('uploads/wms/inward/product_images/' . $product_image_name, file_get_contents($product_attachment));

                        //insert or update new attachment for product_image
                        WarehouseBoxAttachments::create([
                            'warehouse_box_id' => $wms_box_create->id ,
                            'name' => $product_image_name,
                            'attachment_type' => "product_image",
                            'attachment_details' => null,
                            'created_by' => Auth::id()
                        ]);
                    }

                    //location mark as not empty
                    LocationDetail::find($box['location_detail_id'])->update(['is_empty' => false]);

                    $warehouse_box_id = $wms_box_create->id;

                    foreach($box['box_products'] as $product)
                    {
                        WarehouseBoxProducts::create([
                            'warehouse_box_id'              => $warehouse_box_id,
                            'product_code_id'               => $product['product_id'],
                            'product_quantity'              => $product['product_quantity'],
                            'product_hsn'                   => $product['product_hsn'],
                            'hazardous_symbol'              => $product['hazardous_symbol'],
                            'manufacture_year'              => $product['manufacture_year'],
                            'box_content'                   => $product['box_content'],
                        ]);
                    }
                }
            }

            DB::commit();
            return response()->json(['success' => true, 'message' => 'Inward created successfully'], 200);
        } catch (\Throwable $th) {
            //throw $th;
            DB::rollBack();
            return response()->json(['success' => true, 'message' => 'Something went wrong while creating inward'], 422);
        }

    }

    public function editInward($id) {
        $this->authorize('warehouse_edit');

        $inward = Warehouse::with([
            'grns:id,inward_id,grn_number,purchase_order_id,vendor_tax_invoice_number,vendor_tax_invoice_date,vendor_tax_invoice_attachment',
            'grns.purchase_order:id,purchase_order_number,vendor_id',
            'grns.purchase_order.vendor:id,name',
            'grns.boxes',
            'grns.boxes.products.product_details:id,product_code,product_name',
            'grns.boxes.location_details:id,warehouse_name,rack_number,floor',
            'business_task:id,customer_name',
            'proforma_invoice:id,pi_number',
            'inco_term:id,inco_term',
            'inward_attachments'])
        ->find($id);
        // $boxes = $inward->boxes->toArray();
        // $boxes_by_grn = [];
        // foreach($boxes as $box) {
        //     $boxes_by_grn[$box['grn_sys_id']][] = $box;
        // }
        return response()->json($inward, 200);
    }

    // public function getFreightEnquiryPDF($id, $volume_range, $cc=null, $temp=null, $ins=null, $ins_val=null) {
    public function getFreightEnquiryPDF(Request $request) {
        $this->authorize('warehouse_list');

        $inward = Warehouse::with([
            'boxes.grn_number:id,grn_number',
            'business_task:id,customer_name',
            'proforma_invoice:id,pi_number,consignee_id',
            'inco_term:id,inco_term'])
        ->find($request->id);
        $consignee = Consignee::where('id', $inward->proforma_invoice->consignee_id)->first();
        $importer_address = $consignee->address . ', ' . $consignee->city .', '. $consignee->pin_code;
        // ' '. State::where('id', $consignee->state)->value('name') .' ' .Country::where('id', $consignee->country)->value('name')
        $boxes = $inward->boxes->toArray();
        $box_count = count($boxes);
        $dimensions_arr = [];
        $hsn_arr = [];
        $total_net_weight = 0;
        $total_gross_weight = 0;
        $total_volume = 0;
        foreach($boxes as $box) {
            $dimensions_arr[] = '('.$box['length'] .' x '. $box['width'] .' x '. $box['height'] .') ';
            $hsn_arr[] = $box['product_hsn'];
            $total_gross_weight += $box['gross_weight'];
            $total_net_weight += $box['net_weight'];

            $total_volume += ($box['length'] * $box['width'] * $box['height']);
        }
        $total_volume_weight = $total_volume / $request->volume_range;
        $hsn_arr = array_unique($hsn_arr);
        $dimensions = array_count_values($dimensions_arr); //get all occurrences of each values
        arsort($dimensions);

        $boxes_by_grn = [];
        $exporter_address = "Inorbvict Healthcare India Pvt ltd 311, 3rd FLR, Xion mall, Hinjewadi, Pune - 411 057 M/S, INDIA, PUNE, Maharashtra India 411057";

        $data = [
            'exporter_address' => $exporter_address,
            'inward' => $inward,
            'boxes_by_grn' => $boxes_by_grn,
            'importer_address' => $importer_address,
            'dimensions' => $dimensions,
            'hsn_arr' => $hsn_arr,
            'box_count' => $box_count,
            'total_net_weight' => $total_net_weight,
            'total_gross_weight' => $total_gross_weight,
            'total_volume_weight' => $total_volume_weight,
            'volume_range' => $request->volume_range,
            'cc' => $request->cc,
            'temp' => $request->temp,
            'ins' => $request->ins,
            'ins_val' => $request->ins_val,
        ];
        $view = "admin.warehouse.inward.freight-enquiry";
        $pdf = Pdf::setOptions(['isHtml5ParserEnabled' => true])
            ->loadView($view, $data);
        return $pdf->download($request->id . '_freight_enquiry.pdf')->header('Content-Type','application/pdf');
        // return view($view, $data);
    }

    public function updateInwardDetails(Request $request) {
        $this->authorize('warehouse_edit');
        $this->validate($request,[
            'inward_id' => 'required|integer',
            'quotation_id' => 'required|integer',
            'business_task_id' => 'required|integer',
            'pickup_location' => 'required|string|max:255',
            'mode_of_shipment' => 'required|string',
            'terms_of_shipment' => 'required|string'
        ]);

        $data = array(
            'proforma_invoice_id' => $request->quotation_id,
            'business_task_id' => $request->business_task_id,
            'port_of_loading' => $request->port_of_loading,
            'port_of_discharge' => $request->port_of_discharge,
            'inco_term_id' => $request->inco_term_id,
            'pickup_location' => $request->pickup_location,
            'mode_of_shipment' => $request->mode_of_shipment,
            'terms_of_shipment' => $request->terms_of_shipment
        );

        if(Warehouse::find($request->inward_id)->update($data)){
            return response()->json([ 'success' => true, "message" => "Inward details updated successfully!"], 200);
        } else {
            return response()->json([ 'success' => false, "message" => "Something went wrong"], 422);
        }

    }

    public function getGrnDetails(Request $request) {
        $this->authorize('warehouse_edit');
        $this->validate($request,[
            'id' => 'required|integer',
        ]);

        $grn_details = WarehouseGRN::select('*', 'vendor_tax_invoice_attachment as inv_attachment')->with('purchase_order:id,purchase_order_number,po_type,vendor_id')->find($request->id);
        if(!$grn_details) {
            return response()->json(['success' => false, "message" => "GRN details not found"], 404);
        }

        return response()->json($grn_details, 200);
    }

    public function editPODetailsWMS(Request $request) {
        $this->authorize('warehouse_edit');
        $this->validate($request,[
            'inward_id' => 'required',
            'grn_id' => 'required',
        ]);
        $grn_details = WarehouseGRN::find($request->grn_id);
        //get uploaded files from request
        if ($request->hasfile('vendor_tax_invoice_attachment')) {
            $uploaded = true;
            $vendor_tax_invoice_attachment = $request->file('vendor_tax_invoice_attachment');
            $inv_name = date('Ymd_His') . "." . $vendor_tax_invoice_attachment->getClientOriginalExtension();
            $attachment_name = $inv_name;
            try{
                Storage::put('uploads/wms/vendor_tax_invoice/' . $inv_name, file_get_contents($vendor_tax_invoice_attachment));
            } catch(Exception $e){
                $uploaded = false;
                $attachment_name = $grn_details->vendor_tax_invoice_attachment;
            }
            if($uploaded) {
                if (Storage::exists('uploads/wms/vendor_tax_invoice/' . $grn_details->vendor_tax_invoice_attachment)) {
                    Storage::delete('uploads/wms/vendor_tax_invoice/' . $grn_details->vendor_tax_invoice_attachment);
                }
            }
        } else {
            $attachment_name = $grn_details->vendor_tax_invoice_attachment;
        }

        $data = array(
            'vendor_tax_invoice_number' => $request->vendor_tax_invoice_number,
            'vendor_tax_invoice_date' => $request->vendor_tax_invoice_date,
            'vendor_tax_invoice_attachment' => $attachment_name,
            'purchase_order_id' => $request->purchase_order_id
        );
        $data_po = array(
            'purchase_order_id' => $request->purchase_order_id
        );

        WarehouseBoxDetails::where('inward_id', $request->inward_id)->where('grn_sys_id', $request->grn_id)->update($data_po);
        WarehouseGRN::find($request->grn_id)->update($data);

        return response()->json(["success" => true, "message" => "PO details updated successfully!"], 200);
    }

    public function updateBoxDetails(Request $request) {
        $this->authorize('warehouse_edit');
        $this->validate($request,[
            'box_id' => 'required',
            'haz_symbol_attachment' => 'max:2048',
            'box_sr_no_attachment' => 'max:2048',
            'product_img_file.*' => 'max:2048',
        ]);

        $box_details = WarehouseBoxDetails::find($request->box_id);

        if ($request->hasFile('haz_symbol_attachment')) {
            $haz_attachmentName = null;
            if (Storage::exists('uploads/wms/inward/' . $box_details->haz_symbol_attachment)) {
                Storage::delete('uploads/wms/inward/' . $box_details->haz_symbol_attachment);
            }
            $haz_attachment = $request->file('haz_symbol_attachment');
            $haz_attachmentName = date('YmdHis_') . rand(10000, 99999) . "_hz." . $haz_attachment->getClientOriginalExtension();
            try{
                Storage::put('uploads/wms/inward/' . $haz_attachmentName, file_get_contents($haz_attachment));
                $haz_attachmentName = $haz_attachmentName;
                //insert or update new attachment
                WarehouseBoxAttachments::updateOrCreate([
                    'warehouse_box_id' => $request->box_id ,
                    'attachment_type' => "haz_symbol"
                ],[
                    'name' => $haz_attachmentName,
                    'attachment_details' => null,
                    'created_by' => Auth::id()
                ]);
            } catch(\Exception $e) {
                $haz_attachmentName = null;
            }

        }
        if ($request->hasFile('box_sr_no_attachment')) {
            $box_sr_attachmentName = null;
            if (Storage::exists('uploads/wms/inward/' . $box_details->box_serial_number_attachment)) {
                Storage::delete('uploads/wms/inward/' . $box_details->box_serial_number_attachment);
            }
            $box_sr_attachment = $request->file('box_sr_no_attachment');
            $box_sr_attachmentName = date('YmdHis_') . rand(10000, 99999) . "_bx." . $box_sr_attachment->getClientOriginalExtension();
            try{
                Storage::put('uploads/wms/inward/' . $box_sr_attachmentName, file_get_contents($box_sr_attachment));
                $box_sr_attachmentName = $box_sr_attachmentName;
                //insert or update new attachment
                WarehouseBoxAttachments::updateOrCreate([
                    'warehouse_box_id' => $request->box_id ,
                    'attachment_type' => "box_serial"
                ],[
                    'name' => $box_sr_attachmentName,
                    'attachment_details' => null,
                    'created_by' => Auth::id()
                ]);
            } catch(\Exception $e) {
                $box_sr_attachmentName = null;
            }
        }

        if($request->hasFile('product_img_file')){
            $prod_files = request()->file('product_img_file');
            foreach ($prod_files as $file) {
                $prod_file_name = null;

                $prod_file_name = date('YmdHis_') . rand(10000, 99999) .".". $file->getClientOriginalExtension();
                try{
                    Storage::put('uploads/wms/inward/product_images/' . $prod_file_name, file_get_contents($file));
                    //only insert new attachment for product image
                    WarehouseBoxAttachments::create([
                        'warehouse_box_id' => $request->box_id ,
                        'name' => $prod_file_name,
                        'attachment_type' => "product_image",
                        'attachment_details' => null,
                        'created_by' => Auth::id()
                    ]);
                } catch(\Exception $e) {
                    $prod_file_name = null;
                }
            }
        }

        $formArray = array(
            'purchase_order_id' => $request->purchase_order,
            'location_detail_id' => $request->location_detail,
            'product_code_id' => $request->product_code,
            'product_quantity' => $request->product_quantity,
            'product_hsn' => $request->product_hsn,
            'hazardous_symbol' => $request->hazardous,
            'box_content' => $request->box_content,
            'net_weight' => $request->net_weight,
            'gross_weight' => $request->gross_weight,
            'length' => $request->length,
            'width' => $request->width,
            'height' => $request->height,
            'manufacture_year' => $request->manufacture_year,

        );

        //location mark as not empty
        LocationDetail::find($request->location_detail)->update(['is_empty' => false]);


        if(WarehouseBoxDetails::find($request->box_id)->update($formArray)){
            return response()->json(["status" => 'box details updated!'], 200);
        } else {
            return response()->json(["status" => 'something went wrong!'], 422);
        }

    }

    public function addShipmentAttachments(Request $request) {
        $this->authorize('warehouse_edit');
        $this->validate($request,[
            'inward_id' => 'required',
            'shipment_file.*' => 'max:2048',
        ],['shipment_file.*.max' => 'Maximum allowed file size is 2MB']);

        if($request->hasFile('shipment_file')){
            $shipment_files = request()->file('shipment_file');
            foreach ($shipment_files as $file) {
                $ship_file_name = null;

                $ship_file_name = date('YmdHis_') . rand(10000, 99999) .".". $file->getClientOriginalExtension();
                try{
                    Storage::put('uploads/wms/inward/shipment_images/' . $ship_file_name, file_get_contents($file));
                    //only insert new attachment for product image
                    WarehouseAttachments::create([
                        'inward_id' => $request->inward_id ,
                        'name' => $ship_file_name,
                        'attachment_type' => "shipment_image",
                        'attachment_details' => null,
                        'created_by' => Auth::id()
                    ]);
                } catch(\Exception $e) {
                    $ship_file_name = null;
                }
            }
        }

        return response()->json(["success" => true, "message" => 'Shipment image added successfully'], 200);
    }

    public function deleteInward(Request $request) {
        $this->authorize('warehouse_delete');
        $inward = Warehouse::findOrFail($request->id);

        $data = array(
            'outward_id' => 0,
        );
        if($inward->invoice_id != 0){
            Invoice::find($inward->invoice_id)->update($data);
        }

        if(!WarehouseBoxDetails::where('inward_id', $inward->id)->delete()){
            return response()->json(['success' => false, 'message' => 'Something went wrong when trying to delete box data. Please try again!'], 422);
        }
        if(!$inward->delete()){
            return response()->json(['success' => false, 'message' => 'Something went wrong. Please try again!'], 422);
        }

        return response()->json(['success' => true, 'message' => 'Inward deleted successfully!'], 200);
    }

    public function deletePackagingLabeling(Request $request) {
        $this->authorize('warehouse_delete');
        $inward = Warehouse::find($request->id);
        $inw_data = array(
            'packaging_date' => null,
            'packaging_done' => null,
        );
        $inward->update($inw_data);

        $boxes = WarehouseBoxDetails::where('inward_id', $inward->id)->get();

        $data = array(
            'box_packaging_date' => null,
            'box_packaging_done' => null,
            'box_inspection_done' => null,
            'box_inspection_by' => null,
        );
        foreach($boxes as $box) {
            WarehouseBoxDetails::find($box->id)->update($data);
        }

        return response()->json(['success' => true, 'message' => 'Inspection details deleted successfully!'], 200);
    }

    public function deleteInspectionFromBox(Request $request) {
        $this->authorize('warehouse_delete');
        $box = WarehouseBoxDetails::find($request->id);

        $data = array(
            'box_packaging_date' => null,
            'box_packaging_done' => null,
            'box_inspection_done' => null,
            'box_inspection_by' => null,
        );

        WarehouseBoxDetails::find($request->id)->update($data);

        $inward = Warehouse::find($box->inward_id);
        $inw_data = array(
            'packaging_date' => null,
            'packaging_done' => null,
        );

        Warehouse::find($inward->id)->update($inw_data);

        return response()->json(['status' => 'Inspection data deleted successfully!'], 200);
    }

    public function deleteBoxDetails(Request $request) {
        $this->authorize('warehouse_delete');
        $box = WarehouseBoxDetails::find($request->id);
        if(!$box) {
            return response()->json(['success' => false, 'message' => 'Box not found'], 404);
        }
        $grnBoxCount = WarehouseGRN::select('id')->withCount('boxes')->find($box->grn_sys_id);

        if($grnBoxCount->boxes_count <= 1) {
            return response()->json(['success' => false, 'message' => 'You cannot delete all boxes from GRN. Try adding new box first and then delete this one.'], 422);
        } else {
            //delete all products of the box
            WarehouseBoxProducts::where('warehouse_box_id', $box->warehouse_box_id)->delete();
            //delete all attachments of the box
            WarehouseBoxAttachments::where('warehouse_box_id', $box->warehouse_box_id)->delete();
            //location mark as empty
            LocationDetail::find($box->location_detail_id)->update(['is_empty' => true]);

            //delete the box
            $box->delete();
            return response()->json(['success' => true, 'message' => 'Box deleted successfully!'], 200);
        }
    }

    public function deleteBoxAttachment(Request $request) {
        $this->authorize('warehouse_delete');
        $attachment = WarehouseBoxAttachments::find($request->id);
        if($request->attach_type == "product_image"){
            if (Storage::exists('uploads/wms/inward/product_images/' . $attachment->name)) {
                Storage::delete('uploads/wms/inward/product_images/' . $attachment->name);
            }
        } else {
            if (Storage::exists('uploads/wms/inward/' . $attachment->name)) {
                Storage::delete('uploads/wms/inward/' . $attachment->name);
            }
        }
        $attachment->delete();

        return response()->json(['status' => 'Attachment deleted successfully!'], 200);
    }

    public function deleteInwardAttachment(Request $request) {
        $this->authorize('warehouse_delete');
        $attachment = WarehouseAttachments::find($request->id);
        // if($request->attach_type == "shipment_image"){
            if (Storage::exists('uploads/wms/inward/shipment_images/' . $attachment->name)) {
                Storage::delete('uploads/wms/inward/shipment_images/' . $attachment->name);
            }
        // } else {
        //     if (Storage::exists('uploads/wms/inward/' . $attachment->name)) {
        //         Storage::delete('uploads/wms/inward/' . $attachment->name);
        //     }
        // }
        $attachment->delete();

        return response()->json(['success' => true, 'message' => 'Attachment deleted successfully!'], 200);
    }

    public function getInwardGRNs(Request $request) {
        $this->authorize('warehouse_list');
        $grns = WarehouseGRN::where('inward_id', $request->id)->get();

        return response()->json($grns, 200);
    }

    public function packagingListing() {

        $this->authorize('warehouse_list');
        $inward_details = Warehouse::with([
            'grns:id,inward_id,grn_number',
            'business_task:id,customer_name',
            'proforma_invoice:id,pi_number',
            'inco_term:id,inco_term'])
            ->withCount('boxes')
            ->whereHas('boxes', function($query) {
                $query->where('box_packaging_done', 1);
            })
            ->orderBy('id', 'DESC')->get();

        return response()->json($inward_details, 200);
    }

    public function createPackaging() {
        $this->authorize('warehouse_create');
        $inwards = Warehouse::select('id','inward_sys_id')->whereNull('packaging_done')->orderBy('id', 'ASC')->get();
        $inspectionEmployees = User::select('id','email')->with('showActiveEmployees:id,user_id,name,is_click_up_on')->has('showActiveEmployees')->get();

        return response()->json(['inwards' => $inwards, 'inspectionEmployees' => $inspectionEmployees]);
    }

    /**
     * @param mixed $id
     * @return \Illuminate\Http\Response
     */
    public function pdfInward($id, $box_id=null)
    {
        $view = 'admin.warehouse.pdf.inward-boxes-v2';
        $pdfName = 'inward-box';
        return $this->getPdf($id, $box_id, $view, $pdfName);
    }

    /**
     * @param mixed $id
     * @param mixed $view
     * @param mixed $pdfName
     * @return \Illuminate\Http\Response
     */
    public function getPdf($id, $box_id, $view, $pdfName)
    {
        if($box_id){
            $wms = Warehouse::with(['boxes' => function ($query) use ($box_id) {
                $query->where('id', '=', $box_id)
                ->with('grn_number:id,inward_id,grn_number');
            }])->with(['business_task:id,customer_name', 'proforma_invoice:id,pi_number,buyer_id,consignee_id,pi_date', 'inco_term:id,inco_term'])->withCount('boxes')->where("id", $id)->first();
        } else {
            $wms = Warehouse::with(['boxes', 'boxes.grn_number:id,grn_number', 'business_task:id,customer_name', 'proforma_invoice:id,pi_number,buyer_id,consignee_id,pi_date', 'inco_term:id,inco_term'])->withCount('boxes')->where("id", $id)->first();
        }
        $pi = $wms->proforma_invoice->pi_number;
        $pi_date = $wms->proforma_invoice->pi_date;
        $bt = $wms->business_task->id;
        $port_of_loading = $wms->port_of_loading;
        $port_of_discharge = $wms->port_of_discharge;
        $incoTerm = $wms->inco_term->inco_term;
        $buyer_name = Customer::where('id', $wms->proforma_invoice->buyer_id)->value('name');
        $consignee_name = Consignee::where('id', $wms->proforma_invoice->consignee_id)->value('name');

        $box_details = [];
        foreach($wms->boxes as $box) {

            $product_code = Product::where('id', $box->product_code_id)->value('product_code');
            $location = LocationDetail::find($box->location_detail_id);
            $purchase_order = PurchaseOrder::find($box->purchase_order_id);

            $bx['product_code'] = $product_code;
            $bx['product_quantity'] = $box->product_quantity;
            $bx['po_number'] = $purchase_order->purchase_order_number;
            $bx['vendor_id'] = $purchase_order->vendor_id;
            $bx['location'] = $location->warehouse_name. ' - '. $location->rack_number . ' - ' . $location->floor;
            $bx['length'] = $box->length;
            $bx['width'] = $box->width;
            $bx['height'] = $box->height;
            $bx['net_weight'] = $box->net_weight;
            $bx['gross_weight'] = $box->gross_weight;
            $bx['hazardous_symbol'] = $box->hazardous_symbol == "Hazardous" ? "HZ" : "NZ";
            $bx['box_content'] = $box->box_content;
            $bx['grn_sys_id'] = $box->grn_number->grn_number;
            $bx['box_sys_id'] = $box->box_sys_id;

            $box_details[] = $bx;
        }

        $data = [
            'inward'            => $wms->inward_sys_id,
            'inward_date'       => $wms->inward_date,
            'buyer_name'        => $buyer_name,
            'pi'                => $pi,
            'pi_date'           => $pi_date,
            'bt_id'             => "BT-".$bt,
            'port_of_loading'   => $port_of_loading,
            'port_of_discharge' => $port_of_discharge,
            'incoTerm'          => $incoTerm,
            'consignee_name'    => $consignee_name,
            'boxes_count'       => $wms->boxes_count,
            'box_details'       => $box_details
        ];

        $customPaper = array(0,0,425.20,283.80);
        $pdf = PDF::setOptions(['isHtml5ParserEnabled' => true])
            ->loadView($view, $data)->setPaper($customPaper, 'landscape');
        return $pdf->download($id . '-' . $pdfName . '.pdf');
        // return view('admin.warehouse.pdf.inward-boxes-new')->with(['inward'=>$data['inward'], 'inward_date'=> $data['inward_date'], 'box_details' => $box_details, 'buyer_name' => $data['buyer_name'], 'pi' => $data['pi'], 'pi_date' => $data['pi_date'], 'bt_id' => $data['bt_id'], 'port_of_loading' => $data['port_of_loading'], 'port_of_discharge' => $data['port_of_discharge'], 'incoTerm' => $data['incoTerm'], 'consignee_name' => $data['consignee_name']]);
    }

    public function completePackaging($id) {
        $this->authorize('warehouse_edit');
        $inward = Warehouse::select('id','inward_sys_id')->where('id', $id)->first();
        $boxes_by_grn = WarehouseGRN::select('id','grn_number')->where('inward_id', $id)->get();

        return response()->json(['inward'=> $inward, 'grns'=> $boxes_by_grn]);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getBoxById(Request $request) {
        $data = WarehouseBoxDetails::select('id','inward_id','grn_sys_id','box_sys_id','purchase_order_id','location_detail_id','net_weight','gross_weight','length','width','height')
            ->with([
                'purchase_order_details:id,purchase_order_number',
                'location_details:id,warehouse_name,rack_number,floor',
                'products.product_details:id,product_code,product_name',
                'box_attachments',
                'box_attachments_product'
            ])->find($request->id);
        return response()->json($data);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addGrnToInward(Request $request) {
        $this->authorize('warehouse_edit');

        $this->validate($request,[
            'purchase_order_id' => 'required | integer',
            'vendor_tax_invoice_number' => 'required',
            'vendor_tax_invoice_date' => 'required',
            'vendor_tax_invoice_attachment' => 'required| max:5128',
            'box_data.*.location_detail_id' => 'required | integer',
            'box_data.*.box_products.*.product_id' => 'required | integer',
            'box_data.*.box_products.*.manufacture_year' => 'required | string',
            'box_data.*.box_products.*.product_quantity' => 'required | numeric',
            'box_data.*.box_products.*.product_hsn' => 'required | integer',
            'box_data.*.box_products.*.box_content' => 'required | string',
            'box_data.*.net_weight' => 'required | numeric',
            'box_data.*.gross_weight' => 'required | numeric',
            'box_data.*.length' => 'required | numeric',
            'box_data.*.width' => 'required | numeric',
            'box_data.*.height' => 'required | numeric',
            'box_data.*.haz_symbol_attachment' => 'max:2048',
            'box_data.*.box_sr_no_attachment' => 'max:2048',
            'box_data.*.product_attachment' => 'max:2048',
        ], [
            'vendor_tax_invoice_attachment.max' => 'Vendor Tax Invoice file exceeding its limit of 5MB',
            'box_data.*.haz_symbol_attachment.max' => 'Hazardous Symbol attachment file exceeding its limit of 2MB',
            'box_data.*.box_sr_no_attachment.max' => 'Box Serial Number Sticker attachment file exceeding its limit of 2MB',
            'box_data.*.product_attachment.max' => 'Product Image attachment file exceeding its limit of 2MB'
        ]);


        $newGrn = new WarehouseGRN;

        $inv_name = null;
        if (!empty($request['vendor_tax_invoice_attachment'])) {
            $vti_attachment = $request['vendor_tax_invoice_attachment'];
            $inv_name = date('Ymd_His_') .rand(10000, 99999). "." . $vti_attachment->getClientOriginalExtension();
            try {
                Storage::put('uploads/wms/vendor_tax_invoice/' . $inv_name, file_get_contents($vti_attachment));
            } catch(Exception $e){
                $inv_name = null;
                Log::error("Unable to upload vendor tax invoice attachment. ".json_encode($e->getMessage())."");
            }
        }

        $grn = WarehouseGRN::create([
            'inward_id' => $request->inward_id,
            'grn_number' => 'G-'.$newGrn->getLatestGrnId(),
            'purchase_order_id' => $request->purchase_order_id,
            'vendor_tax_invoice_number' => $request->vendor_tax_invoice_number,
            'vendor_tax_invoice_date' => $request->vendor_tax_invoice_date,
            'vendor_tax_invoice_attachment' => $inv_name
        ]);

        if($grn->id){
            $grn_id = $grn->id;
            $wms_box = new WarehouseBoxDetails;
            //iterate on box_data to store GRN's boxes data
            foreach($request['box_data'] as $box) {

                //insert box details with last inserted inward id
                $wms_box_create = WarehouseBoxDetails::create([
                    'inward_id'          => $request->inward_id,
                    'grn_sys_id'         => $grn_id,
                    'box_sys_id'         => 'B-'.$wms_box->getLatestId(),
                    'purchase_order_id'  => $grn['purchase_order_id'],
                    'location_detail_id' => $box['location_detail_id'],
                    'net_weight'         => $box['net_weight'],
                    'gross_weight'       => $box['gross_weight'],
                    'length'             => $box['length'],
                    'width'              => $box['width'],
                    'height'             => $box['height'],
                ]);

                //get uploaded files from request
                //box_serial_attachment upload file and add filename in db
                if (!empty($box['box_sr_no_attachment'])) {
                    $box_serial_attachment = $box['box_sr_no_attachment'];
                    $box_serial_name = date('YmdHis_') .rand(10000, 99999). "_bx." . $box_serial_attachment->getClientOriginalExtension();
                    Storage::put('uploads/wms/inward/' . $box_serial_name, file_get_contents($box_serial_attachment));
                    $box_serial_attachment = $box_serial_name;
                    //insert or update new attachment for box_serial
                    WarehouseBoxAttachments::updateOrCreate([
                        'warehouse_box_id' => $wms_box_create->id,
                        'attachment_type' => "box_serial"
                        ],[
                            'name' => $box_serial_attachment,
                            'attachment_details' => null,
                            'created_by' => Auth::id()
                    ]);
                }

                //haz_symbol_attachment upload file and add filename in db
                if (!empty($box['haz_symbol_attachment'])) {
                    $haz_symbol_attachment = $box['haz_symbol_attachment'];

                    $haz_symbol_name = date('YmdHis_') .rand(10000, 99999). "_haz." . $haz_symbol_attachment->getClientOriginalExtension();
                    Storage::put('uploads/wms/inward/' . $haz_symbol_name, file_get_contents($haz_symbol_attachment));
                    $haz_symbol_attachment = $haz_symbol_name;
                    //insert or update new attachment for haz_symbol
                    WarehouseBoxAttachments::updateOrCreate([
                        'warehouse_box_id' => $wms_box_create->id,
                        'attachment_type' => "haz_symbol"
                        ],[
                            'name' => $haz_symbol_attachment,
                            'attachment_details' => null,
                            'created_by' => Auth::id()
                    ]);
                }
                //product_attachment upload file and add filename in db
                if (!empty($box['product_attachment'])) {
                    $product_attachment = $box['product_attachment'];
                    $product_image_name = date('YmdHis_') .rand(10000, 99999). "_prod." . $product_attachment->getClientOriginalExtension();
                    Storage::put('uploads/wms/inward/product_images/' . $product_image_name, file_get_contents($product_attachment));

                    //insert or update new attachment for product_image
                    WarehouseBoxAttachments::create([
                        'warehouse_box_id' => $wms_box_create->id ,
                        'name' => $product_image_name,
                        'attachment_type' => "product_image",
                        'attachment_details' => null,
                        'created_by' => Auth::id()
                    ]);
                }

                //location mark as not empty
                LocationDetail::find($box['location_detail_id'])->update(['is_empty' => false]);

                $warehouse_box_id = $wms_box_create->id;

                foreach($box['box_products'] as $product)
                {
                    WarehouseBoxProducts::create([
                        'warehouse_box_id'  => $warehouse_box_id,
                        'product_code_id'   => $product['product_id'],
                        'product_quantity'  => $product['product_quantity'],
                        'product_hsn'       => $product['product_hsn'],
                        'hazardous_symbol'  => $product['hazardous_symbol'],
                        'manufacture_year'  => $product['manufacture_year'],
                        'box_content'       => $product['box_content'],
                    ]);
                }
            }

            return response()->json([ 'success' => true, 'message' => 'GRN added successfully!' ], 200);
        }

        return response()->json([ 'success' => false, 'message' => 'Something went wrong, unable to add GRN' ], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addBoxToGrn(Request $request) {
        $this->authorize('warehouse_edit');

        $this->validate($request,[
            'grn_id' => 'required|integer',
            'haz_symbol_attachment' => 'max:2048',
            'box_sr_no_attachment' => 'max:2048',
            'productAttachments.files.*' => 'max:4000',
            'product_attachment' => 'max:2048',
            'box_products.*.product_id' => 'required | integer',
            'box_products.*.manufacture_year' => 'required | string',
            'box_products.*.product_quantity' => 'required | numeric',
            'box_products.*.product_hsn' => 'required | integer',
        ], [
            'haz_symbol_attachment.max' => 'Hazardous Symbol attachment file exceeding its limit of 2MB',
            'box_sr_no_attachment.max' => 'Box Serial Number Sticker attachment file exceeding its limit of 2MB',
            'productAttachments.files.*.max' => 'Product Image attachment file exceeding its limit of 2MB'
        ]);

        DB::beginTransaction();
        try {
            $grn = WarehouseGRN::select('id', 'inward_id', 'grn_number')->find($request->grn_id);

            if($grn){
                $grn_id = $request->grn_id;
                $wms_box = new WarehouseBoxDetails;

                if ($request->wms_box_id == 0) {
                    $wms_box_create = WarehouseBoxDetails::create([
                        'inward_id'          => $grn->inward_id,
                        'grn_sys_id'         => $grn_id,
                        'box_sys_id'         => 'B-'.$wms_box->getLatestId(),
                        'purchase_order_id'  => $request->purchase_order_id,
                        'location_detail_id' => $request->location_detail_id,
                        'net_weight'         => $request->net_weight,
                        'gross_weight'       => $request->gross_weight,
                        'length'             => $request->length,
                        'width'              => $request->width,
                        'height'             => $request->height,
                    ]);
                    //location mark as not empty
                    LocationDetail::find($request->location_detail_id)->update(['is_empty' => false]);
                } else {
                    $wms_box_create = WarehouseBoxDetails::find($request->wms_box_id);
                    if($wms_box_create->location_detail_id != $request->location_detail_id){
                        //location detail change empty previous one and occupy one from request
                        LocationDetail::find($wms_box_create->location_detail_id)->update(['is_empty' => true]);
                        //occupy location of request one
                        LocationDetail::find($request->location_detail_id)->update(['is_empty' => false]);
                    }
                    $wms_box_create->update([
                        'location_detail_id' => $request->location_detail_id,
                        'net_weight'         => $request->net_weight,
                        'gross_weight'       => $request->gross_weight,
                        'length'             => $request->length,
                        'width'              => $request->width,
                        'height'             => $request->height,
                    ]);
                }

                //get uploaded files from request
                //box_serial_attachment upload file and add filename in db
                if (!empty($request->box_sr_no_attachment)) {
                    $box_serial_attachment = $request->box_sr_no_attachment;
                    $box_serial_name = date('YmdHis_') .rand(10000, 99999). "_bx." . $box_serial_attachment->getClientOriginalExtension();
                    Storage::put('uploads/wms/inward/' . $box_serial_name, file_get_contents($box_serial_attachment));
                    $box_serial_attachment = $box_serial_name;
                    //insert or update new attachment for box_serial
                    WarehouseBoxAttachments::updateOrCreate([
                        'warehouse_box_id' => $wms_box_create->id,
                        'attachment_type' => "box_serial"
                        ],[
                            'name' => $box_serial_attachment,
                            'attachment_details' => null,
                            'created_by' => Auth::id()
                    ]);
                }

                //haz_symbol_attachment upload file and add filename in db
                if (!empty($request->haz_symbol_attachment)) {
                    $haz_symbol_attachment = $request->haz_symbol_attachment;

                    $haz_symbol_name = date('YmdHis_') .rand(10000, 99999). "_haz." . $haz_symbol_attachment->getClientOriginalExtension();
                    Storage::put('uploads/wms/inward/' . $haz_symbol_name, file_get_contents($haz_symbol_attachment));

                    //insert or update new attachment for haz_symbol
                    WarehouseBoxAttachments::updateOrCreate([
                        'warehouse_box_id' => $wms_box_create->id,
                        'attachment_type' => "haz_symbol"
                        ],[
                            'name' => $haz_symbol_name,
                            'attachment_details' => null,
                            'created_by' => Auth::id()
                    ]);
                }
                //product_attachment upload file and add filename in db
                if ($request->has('productAttachments')) {
                    foreach($request->productAttachments['files'] as $product_attachment) {
                        $product_image_name = date('YmdHis_') .rand(10000, 99999). "_prod." . $product_attachment->getClientOriginalExtension();
                        Storage::put('uploads/wms/inward/product_images/' . $product_image_name, file_get_contents($product_attachment));

                        //insert or update new attachment for product_image
                        WarehouseBoxAttachments::create([
                            'warehouse_box_id' => $wms_box_create->id ,
                            'name' => $product_image_name,
                            'attachment_type' => "product_image",
                            'attachment_details' => null,
                            'created_by' => Auth::id()
                        ]);
                    }
                }

                $warehouse_box_id = $wms_box_create->id;

                foreach($request->box_products as $product)
                {
                    if($product['wms_product_id'] == 0){
                        WarehouseBoxProducts::create([
                            'warehouse_box_id'              => $warehouse_box_id,
                            'product_code_id'               => $product['product_id'],
                            'product_quantity'              => $product['product_quantity'],
                            'product_hsn'                   => $product['product_hsn'],
                            'hazardous_symbol'              => $product['hazardous_symbol'],
                            'manufacture_year'              => $product['manufacture_year'],
                            'box_content'                   => $product['box_content'],
                        ]);
                    }
                }

                DB::commit();
                return response()->json([ 'success' => true, 'message' => 'Box details action completed successfully!' ], 200);
            }

            DB::commit();
            return response()->json([ 'success' => false, 'message' => 'GRN not found for box addition' ], 200);
        } catch (\Throwable $th) {
            //throw $th;
            DB::rollBack();
            Log::error("Error while creating inward box " . json_encode($e->getMessage()));
            return response()->json([ 'success' => false, 'message' => 'Something went wrong while adding box' ], 422);
        }
    }

    public function addPackagingDetails(Request $request) {
        $this->validate($request,[
            'inspection_date' => 'required|date_format:Y-m-d',
            'inspection_employee_ids' => 'required',
            'box_id' => 'required',
            'inspection_done' => 'required'
        ]);
        $data = array(
            'box_inspection_done' => $request->inspection_done ? true : false,
            'box_inspection_by' => implode(",", $request->inspection_employee_ids),
            'box_packaging_date' => date('Y-m-d', strtotime($request->inspection_date)),
            'box_packaging_done' => true,
            'box_packaging_remark' => null,
        );

        for($i=0; $i<count($request->box_id); $i++) {
            WarehouseBoxDetails::find($request->box_id[$i])->update($data);
        }

        $inward_id = $request->inward_id;
        $boxes = WarehouseBoxDetails::where('inward_id', $inward_id)->get();
        $inward_packed = false;
        if($boxes){
            foreach($boxes as $box){
                if($box->box_packaging_done){
                    $inward_packed = true;
                } else {
                    $inward_packed = false;
                    break;
                }
            }
        }
        if($inward_packed){
            Warehouse::find($inward_id)->update(['packaging_date'=>date('Y-m-d'), 'packaging_done'=>true, 'packaging_remark'=>$request->inspection_remark]);
        }
        return response()->json(['success' => true, 'message' => 'Packaging details for selected boxes added successfully'], 200);
    }

    public function createPackingSticker($id, $box_id=null) {
        if($box_id){
            $wms = Warehouse::with(['boxes' => function ($query) use ($box_id) {
                $query->where('id', '=', $box_id)
                ->with('grn_number:id,inward_id,grn_number');
            }])->with(['business_task:id,date,customer_name', 'proforma_invoice:id,pi_number,buyer_id,consignee_id,pi_date', 'inco_term:id,inco_term'])->withCount('boxes')->where("id", $id)->first();
        } else {
            $wms = Warehouse::with(['boxes', 'boxes.grn_number:id,grn_number', 'business_task:id,date,customer_name', 'proforma_invoice:id,pi_number,buyer_id,consignee_id,pi_date', 'inco_term:id,inco_term'])->withCount('boxes')->where("id", $id)->first();
        }
        if($wms){
            $view = 'admin.warehouse.pdf.packaging-label-v2';
            $pdfName = 'packaging-labeling';

            $pi = $wms->proforma_invoice->pi_number;
            $bt_id = $wms->business_task->id;
            $bt_date = $wms->business_task->date;
            $port_of_loading = $wms->port_of_loading;
            $port_of_discharge = $wms->port_of_discharge;
            $incoTerm = $wms->inco_term->inco_term;
            $buyer_name = Customer::where('id', $wms->proforma_invoice->buyer_id)->value('name');
            $consignee_name = Consignee::where('id', $wms->proforma_invoice->consignee_id)->value('name');

            $box_details = [];
            foreach($wms->boxes as $box) {

                $product_code = Product::where('id', $box->product_code_id)->value('product_code');
                $location = LocationDetail::find($box->location_detail_id);
                $purchase_order = PurchaseOrder::find($box->purchase_order_id);
                $idsArr = explode(',', $box->box_inspection_by);
                $employees = Employee::select('name')->whereIn('user_id', $idsArr)->get();
                $employee_names = [];
                foreach($employees as $emp){
                    $employee_names[] = $emp->name;
                }

                $bx['product_code'] = $product_code;
                $bx['product_quantity'] = $box->product_quantity;
                $bx['po_number'] = $purchase_order->purchase_order_number;
                $bx['po_date'] = $purchase_order->order_date;
                $bx['vendor_id'] = $purchase_order->vendor_id;
                $bx['location'] = $location->warehouse_name. ' - '. $location->rack_number . ' - ' . $location->floor;
                $bx['length'] = $box->length;
                $bx['width'] = $box->width;
                $bx['height'] = $box->height;
                $bx['net_weight'] = $box->net_weight;
                $bx['gross_weight'] = $box->gross_weight;
                $bx['hazardous_symbol'] = $box->hazardous_symbol == "Hazardous" ? "HZ" : "NZ";
                $bx['box_content'] = $box->box_content;
                $bx['box_sys_id'] = $box->box_sys_id;
                $bx['grn_sys_id'] = $box->grn_number->grn_number;
                $bx['grn_date'] = date('d M Y', strtotime($box->created_at));
                $bx['pl_id'] = 'PL-'.$box->inward_id;
                $bx['pl_date'] = date('d M Y', strtotime($box->box_packaging_date));
                $bx['employee_names'] = (count($employee_names) < 1) ? "Admin" : implode(", ", $employee_names);

                $box_details[] = $bx;
            }

            $data = [
                'inward'            => $wms->inward_sys_id,
                'inward_date'       => $wms->inward_date,
                'buyer_name'        => $buyer_name,
                'pi'                => $pi,
                'bt_id'             => $bt_id,
                'bt_date'           => $bt_date,
                'port_of_loading'   => $port_of_loading,
                'port_of_discharge' => $port_of_discharge,
                'incoTerm'          => $incoTerm,
                'consignee_name'    => $consignee_name,
                'boxes_count'       => $wms->boxes_count,
                'box_details'       => $box_details
            ];

            $customPaper = array(0,0,425.20,283.80);
            $pdf = PDF::setOptions(['isHtml5ParserEnabled' => true])
                ->loadView($view, $data)->setPaper($customPaper, 'landscape');
            return $pdf->download($id . '-' . $pdfName . '.pdf');
            // return view($view)->with(['inward'=>$data['inward'],
            //     'inward_date'=> $data['inward_date'],
            //     'box_details' => $box_details,
            //     'buyer_name' => $data['buyer_name'],
            //     'pi' => $data['pi'],
            //     'bt_id' => $data['bt_id'],
            //     'bt_date' => $data['bt_date'],
            //     'port_of_loading' => $data['port_of_loading'],
            //     'port_of_discharge' => $data['port_of_discharge'],
            //     'incoTerm' => $data['incoTerm'],
            //     'consignee_name' => $data['consignee_name']]);

        } else {
            return redirect()->back()->with('error', 'Inward not packed yet. Go to packaging & labeling section and mark the package as done.');
        }
    }

    public function outwardListing() {

        $this->authorize('warehouse_list');
        $inward_details = Warehouse::where('mark_as_outward', 1)
            ->with([
                'boxes',
                'business_task:id,customer_name',
                'proforma_invoice:id,pi_number',
                'inco_term:id,inco_term',
                'invoice:id,invoice_number'])
            ->withCount('boxes')
            ->orderBy('id', 'DESC')
            ->get();

        return view('admin.warehouse.outward.outward-list')->with(['inward_details' => $inward_details]);
    }

    public function createOutward() {

        $this->authorize('warehouse_list');

        $inwards = Warehouse::select('id', 'inward_sys_id', 'inward_date')
        ->where('packaging_done', 1)->where('mark_as_outward', 0)->get();

        $invoices = Invoice::where('outward_id', 0)->orderBy('id', 'desc')->get();

        return view('admin.warehouse.outward.create-outward')->with(['inwards' => $inwards, 'invoices' => $invoices]);
    }

    public function mapInvoiceOutward($id) {

        $this->authorize('warehouse_list');
        $invoices = Invoice::where('outward_id', 0)->orderBy('id', 'desc')->get();
        $inward = Warehouse::find($id);
        $mapped_invoice = Invoice::with(['ffdInternational', 'ffdDomestic'])->find($inward->invoice_id);

        $logistics_details = "";
        if($mapped_invoice->logistics_id){
            $logistics_details = LogisticsCompliance::where('invoice_id', $mapped_invoice->id)->first();
        }

        return view('admin.warehouse.outward.map-invoice-number')->with(['inward_details' => $inward, 'invoices' => $invoices, 'mapped_invoice' => $mapped_invoice, 'logistics_details' => $logistics_details]);
    }

    public function getBoxesCountByGrnId(Request $request) {
        $this->authorize('warehouse_list');
        $boxes = WarehouseBoxDetails::where('inward_id', $request->inward_id)->where('grn_sys_id', $request->grn_id)->get();
        $boxes_count = $boxes->count();

        $all_grns = WarehouseBoxDetails::where('inward_id', $request->inward_id)->groupBy('grn_sys_id')->get();
        $grn_count = $all_grns->count();
        return response()->json(['box_count' => $boxes_count, 'grn_count' => $grn_count]);
    }

    public function getBoxesByGrnId(Request $request) {
        $this->authorize('warehouse_list');
        $grn_id = $request->id;
        $boxes = WarehouseBoxDetails::where('grn_sys_id', $grn_id)->with('products')->get();

        if($boxes->count() < 1) {
            return response()->json(["success" => false, "message" => "No boxes found for selected GRN"], 404);
        }
        $box_details = [];
        foreach($boxes as $box) {
            $location = LocationDetail::find($box->location_detail_id);
            $purchase_order = PurchaseOrder::find($box->purchase_order_id);
            $insp_emp_names = null;
            if($box->box_inspection_by != null) {
                $inspArr = explode(",", $box->box_inspection_by);
                $emps = Employee::select('name')->whereIn('user_id', $inspArr)->get()->toArray();
                $employees_name = [];
                foreach($emps as $emp){
                    $employees_name[] = $emp['name'];
                }

                $insp_emp_names = implode(", ", $employees_name);
            }

            $bx['box_id'] = $box->id;
            $bx['box_sys_id'] = $box->box_sys_id;
            $bx['inward_id'] = $box->inward_id;

            $bx['po_number'] = $purchase_order->purchase_order_number;

            $bx['location'] = $location->warehouse_name. ' - '. $location->rack_number . ' - ' . $location->floor;
            $bx['length'] = $box->length;
            $bx['width'] = $box->width;
            $bx['height'] = $box->height;
            $bx['net_weight'] = $box->net_weight;
            $bx['gross_weight'] = $box->gross_weight;
            $bx['products'] = $box->products;

            $bx['pl_id'] = Str::replace('I-'.$box->inward_id.'/BX-', 'PL-', $box->box_sys_id);
            $bx['pl_date'] = ($box->box_packaging_date != null) ? date('d M Y', strtotime($box->box_packaging_date)) : null;
            $bx['pl_done'] = $box->box_packaging_done;
            $bx['employee_names'] = $insp_emp_names;

            $box_details[] = $bx;
        }

        return response()->json($box_details, 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getInvoiceDetailsForOutward(Request $request) {
        $invoice = Invoice::with(['ffdInternational', 'ffdDomestic'])->find($request->invoice_id);

        $logistics_details = "";
        if($invoice->logistics_id){
            $logistics_details = LogisticsCompliance::where('invoice_id', $invoice->id)->first();
        }

        return response()->json(['invoice' => $invoice, 'logistics_details' => $logistics_details ]);
    }

    public function wmsReporting()
    {
        // $this->authorize('wms_reporting');
        $business_task = BusinessTask::select('id','customer_name')->has('inwards')->get();
        $invoices = Invoice::select('id','invoice_number','outward_id')->where('outward_id', 1)->get()->toArray();
        $inwards = Warehouse::select('id','inward_sys_id')->orderBy('id', 'DESC')->get();

        return response()->json(['inwards' => $inwards, 'business_task' => $business_task, 'invoices' => $invoices]);
    }

    public function getReportingDetails(Request $request)
    {
        $this->authorize('wms_reporting');
        // $business_task = BusinessTask::select('id','customer_name')->has('inwards')->get();
        // $invoices = Invoice::select('id','invoice_number','outward_id')->where('outward_id', 1)->get()->toArray();
        // $inwards = Warehouse::select('id','inward_sys_id')->orderBy('id', 'DESC')->get();

        if(($request->has('inward_id') && $request->inward_id != "") || ($request->has('bt_id') && $request->bt_id != "") || ($request->has('invoice_id') && $request->invoice_id != "")){
            $inward_id = $request->inward_id;
            $bt_id = $request->bt_id;
            $invoice_id = $request->invoice_id;

            if(count(Warehouse::select('id','inward_sys_id')->where('business_task_id', $bt_id)->get()) > 1) {

                return response()->json(['success' => false, 'message' => 'Selected Business Task ID ('.$bt_id.') is linked with more than 1 inward. Please select inward id or invoice to generate report.'], 422);
            }

            if(($invoice_id == null || $invoice_id == "") || (($inward_id != null || $inward_id != "") || ($bt_id != null || $bt_id != "")) ) {
                $wms = new Warehouse;
                $wms = $wms->select('id','inward_sys_id','inward_date','mode_of_shipment','terms_of_shipment','proforma_invoice_id','business_task_id','port_of_loading','port_of_discharge','inco_term_id','pickup_location')->with([
                    'boxes:id,inward_id,grn_sys_id,box_sys_id,purchase_order_id,location_detail_id,box_packaging_done,box_sys_id,net_weight,gross_weight,length,width,height',
                    'boxes.grn_number:id,grn_number,vendor_tax_invoice_number,vendor_tax_invoice_date,vendor_tax_invoice_attachment',
                    'boxes.purchase_order_details:id,purchase_order_number,vendor_id,order_date',
                    'boxes.purchase_order_details.vendor:id,name',
                    'boxes.products.product_details:id,product_code,product_name',
                    'boxes.location_details:id,warehouse_name,rack_number,floor',
                    'business_task:id,customer_name',
                    'proforma_invoice:id,pi_number',
                    'inco_term:id,inco_term',
                    'outwards','outwards.invoice:id,invoice_number,invoice_date,no_of_packages,total_net_weight,total_gross_weight,total_value_weight,international_ffd_id,domestic_ffd_id',
                    'outwards.invoice.ffdInternational', 'outwards.invoice.ffdDomestic',
                    'psds','psds.invoice:id,invoice_number,invoice_date,no_of_packages,total_net_weight,total_gross_weight,total_value_weight,international_ffd_id,domestic_ffd_id',
                    'psds.invoice.ffdInternational', 'psds.invoice.ffdDomestic',
                ]);
                if($inward_id != ""){
                    $wms = $wms->where('id', $inward_id);
                }
                if($bt_id != ""){
                    $wms = $wms->where('business_task_id', $bt_id);
                }

                $wms = $wms->first();
            } else {
                $wmsOutward = WarehouseOutward::where('invoice_id', $invoice_id)->first();

                $wms = Warehouse::select('id','inward_sys_id','inward_date','mode_of_shipment','terms_of_shipment','proforma_invoice_id','business_task_id','port_of_loading','port_of_discharge','inco_term_id','pickup_location')->with([
                    'boxes.id,inward_id,grn_sys_id,box_sys_id,purchase_order_id,location_detail_id,box_packaging_done,box_sys_id,net_weight,gross_weight,length,width,height',
                    'boxes.grn_number:id,grn_number,vendor_tax_invoice_number,vendor_tax_invoice_date,vendor_tax_invoice_attachment',
                    'boxes.purchase_order_details:id,purchase_order_number,vendor_id,order_date',
                    'boxes.purchase_order_details.vendor:id,name',
                    'boxes.products.product_details:id,product_code,product_name',
                    'boxes.location_details:id,warehouse_name,rack_number,floor',
                    'business_task:id,customer_name',
                    'proforma_invoice:id,pi_number',
                    'inco_term:id,inco_term',
                    'outwards','outwards.invoice:id,invoice_number,invoice_date,no_of_packages,total_net_weight,total_gross_weight,total_value_weight,international_ffd_id,domestic_ffd_id',
                    'outwards.invoice.ffdInternational', 'outwards.invoice.ffdDomestic',
                    'psds','psds.invoice:id,invoice_number,invoice_date,no_of_packages,total_net_weight,total_gross_weight,total_value_weight,international_ffd_id,domestic_ffd_id',
                    'psds.invoice.ffdInternational', 'psds.invoice.ffdDomestic',
                ]);

                $wms = $wms->where('id', $wmsOutward->inward_id);
                $wms = $wms->first();

            }

            if($wms){
                $show_report = true;

                $businessTaskId = $wms->business_task_id;
                $row = BusinessTask::select('id','customer_name','created_at','enquiry','category','task_status','inco_term_id','freight_target_cost','port_of_unloading','shipment_mode','shipping_liabelity','cold_chain','final_destination')->with(['incoTermDetails', 'categories', 'proforma_invoice'])->find($businessTaskId);
                $quotations = $row->proforma_invoice;
                $q_nos = [];
                $q_products = [];
                if($quotations->count() > 0){
                    foreach ($quotations as $quote) {
                        if($quote->attachment_name == "Proforma Invoice" && ($quote->name == "" || $quote->name == null)) {
                            $pi_number = '';
                            $pi = \App\Models\Quotation::select('id', 'pi_number', 'pi_date')->where('id', $quote->attachment_details)->with('quotation_products')->first();
                            if($pi != null) {
                                $q_nos[] = $pi;
                                $q_products[] = $pi->quotation_products;
                            }
                        }
                    }
                }

                $scrutinyRows = SupplierScrutinyBt::with('vendor_details:id,name')->where('business_task_id', $businessTaskId)->get();
                $paymenthistories = PaymentHistoryBt::where('business_task_id', $businessTaskId)->get();
                /** PM Worksheet data starts from here */
                $pmRows = PoDetailsBt::where('business_task_id', $businessTaskId)->get();
                $pmTaxInvoiceRows = TaxInvoiceDetailsBt::where('business_task_id', $businessTaskId)->get();
                $pmDeptScrutinyRows = PmWorksheetBt::select('id','make1','model1','supplier_name2','ready_stock_quantity','lead_time','expiry','physical_verification','supplier_name2','condition1','transportation_cost','year_of_manufacturing1','packaging_cost')->where('business_task_id', $businessTaskId)->get();
                /** PM Worksheet data ends here */
                /** LM Worksheet data starts from here */
                $payment_histories = PaymentHistoryBt::with(['po_details:id,vendor_id,total', 'po_details.vendor:id,name', 'po_details.po_products:id,purchase_order_id,product_name,quantity'])->where('business_task_id', $businessTaskId)->whereNotNull('po_id')->get();

                $vendor_invoices = VendorPurchaseInvoice::with(['vendor:id,name', 'purchase_order:id,purchase_order_number', 'attachments'])->where('business_task_id', $businessTaskId)->with('vendor:id,name')->get();

                $freightCostRows = FreightCostSourcingBt::with(['ffd_name:id,ffd_name'])->where('business_task_id', $businessTaskId)->get();
                $ownPickupRows = OwnpickupBt::with(['ffd_name:id,ffd_name', 'purchase_order:id,purchase_order_number'])->where('business_task_id', $businessTaskId)->get();
                $servedByRows = ServeBySuppliersBt::with(['ffd_name:id,ffd_name'])->where('business_task_id', $businessTaskId)->get();
                $importerRows = ImportPickupBt::with(['ffd_name:id,ffd_name'])->where('business_task_id', $businessTaskId)->get();
                $exportAgentRows = ExportAgentBt::with(['ffd_name:id,ffd_name'])->where('business_task_id', $businessTaskId)->get();
                $portOfLoadingRows = PortOfLandingBt::with(['ffd_name:id,ffd_name', 'purchase_order:id,purchase_order_number'])->where('business_task_id', $businessTaskId)->get();
                /** LM Worksheet data ends here */

                $invoices = Invoice::select('id','invoice_number','invoice_date','shipment_type','exchange_rate','currency','received_amount','grand_total','buyer_id')->with(['buyer:id,name', 'ebrc'])->where('business_task_id', $businessTaskId)->get();
                $irms = Irm::where('business_task_id', $businessTaskId)->with(['buyer:id,name'])->get();
                $irm_payment_histories = [];

                if($invoices && count($irms) > 0){
                    foreach($irms as $irm){
                        $payment = IrmPaymentHistory::with('invoiceDetails:id,invoice_number')->where('irm_id', $irm->id)->get();
                        $irm_payment_histories[] = $payment;
                    }
                }

                $boxes = $wms->boxes->toArray();
                $boxes_by_grn = [];
                foreach($boxes as $box) {
                    if(array_key_exists($box['grn_sys_id'], $box)){
                        $boxes_by_grn[$box['grn_sys_id']][] = $box;
                    }
                    else{
                        $boxes_by_grn[$box['grn_sys_id']][] = $box;
                    }
                }

                $logistics_array = [];
                if($wms->outwards->count() > 0) {
                    foreach($wms->outwards as $outward) {
                        $outward['invoice_number']              = $outward->invoice->invoice_number;
                        $outward['invoice_date']                = $outward->invoice->invoice_date;
                        $outward['no_of_packages']              = $outward->invoice->no_of_packages;
                        $outward['ffdInternational_ffd_name']   = $outward->invoice->ffdInternational->ffd_name;
                        $outward['ffdInternational_address']    = $outward->invoice->ffdInternational->address;
                        $outward['ffdInternational_city']       = $outward->invoice->ffdInternational->city;
                        $outward['ffdInternational_pin_code']   = $outward->invoice->ffdInternational->pin_code;
                        $outward['total_net_weight']            = $outward->invoice->total_net_weight;
                        $outward['total_gross_weight']          = $outward->invoice->total_gross_weight;
                        $outward['total_value_weight']          = $outward->invoice->total_value_weight;
                        $outward['ffdDomestic_ffd_name']        = $outward->invoice->ffdDomestic->ffd_name;
                        $outward['ffdDomestic_address']         = $outward->invoice->ffdDomestic->address;
                        $outward['ffdDomestic_city']            = $outward->invoice->ffdDomestic->city;
                        $outward['ffdDomestic_pin_code']        = $outward->invoice->ffdDomestic->pin_code;
                        $outward['logistics']                   = false;

                        $logistics_details = LogisticsCompliance::where('invoice_id', $outward->invoice->id)->first();
                        if($logistics_details != null) {
                            $outward['logistics']           = true;
                            $outward['pickup_proof']        = $logistics_details->pickup_proof;
                            $outward['e_way_bill']          = $logistics_details->e_way_bill;
                            $outward['delivery_challan']    = $logistics_details->delivery_challan;
                            $outward['id_card']             = $logistics_details->id_card;
                            $outward['delivery_boy_photo']  = $logistics_details->delivery_boy_photo;
                            $outward['kyc']                 = $logistics_details->kyc;
                        }

                        $logistics_array[] = $outward;
                    }
                }
                $regulatory_array = [];
                if($wms->psds->count() > 0) {
                    foreach ($wms->psds as $psd) {
                        $psd['regulation'] = false;
                        $regulatory = RegulatoryDashboard::where('invoice_id', $psd->invoice->id)->first();
                        if($regulatory != null) {
                            $psd['regulation'] = true;
                            $psd['awb_no']              = $regulatory->awb_no;
                            $psd['shipping_bill_no']    = $regulatory->shipping_bill_no;
                            $psd['egm_no']              = $regulatory->egm_no;
                            $psd['awb_date']            = $regulatory->awb_date;
                            $psd['shipping_bill_date']  = $regulatory->shipping_bill_date;
                            $psd['egm_date']            = $regulatory->egm_date;
                            $psd['invoice']             = $regulatory->invoice;
                            $psd['awb']                 = $regulatory->awb;
                            $psd['shipping_bill']       = $regulatory->shipping_bill;
                            $psd['packing_list']        = $regulatory->packing_list;
                            $psd['other']               = $regulatory->other;
                        }

                        $regulatory_array[] = $psd;
                    }
                }

                return response()->json([
                    // 'inwards'=>$inwards,
                    // 'business_task' => $business_task,
                    'invoices' => $invoices,
                    'selected_id' => $inward_id,
                    'inward' => $wms,
                    'show_report' => $show_report,
                    'boxes_by_grn' => $boxes_by_grn,
                    'logistics_array' => $logistics_array,
                    'regulatory_array' => $regulatory_array,
                    'row' => $row,
                    'q_nos' => $q_nos,
                    'q_products' => $q_products,
                    'invoices' => $invoices,
                    'irms' => $irms,
                    'irm_payment_histories' => $irm_payment_histories,
                    'payment_histories' => $payment_histories,
                    'scrutinyRows' => $scrutinyRows,
                    'paymenthistories' => $paymenthistories,
                    'vendor_invoices' => $vendor_invoices,
                    'pmRows' => $pmRows,
                    'pmDeptScrutinyRows' => $pmDeptScrutinyRows,
                    'pmTaxInvoiceRows' => $pmTaxInvoiceRows,
                    'freightCostRows' => $freightCostRows,
                    'ownPickupRows' => $ownPickupRows,
                    'servedByRows' => $servedByRows,
                    'importerRows' => $importerRows,
                    'exportAgentRows' => $exportAgentRows,
                    'portOfLoadingRows' => $portOfLoadingRows
                ]);
            } else {
                $err_msg = 'No record found for selected data.';

                if($inward_id != ""){
                    $err_msg .= ' Inward ID : '. $inward_id;
                }
                if($bt_id != ""){
                    $err_msg .= ' Business Task ID : '. $bt_id;
                }
                if($invoice_id != ""){
                    $err_msg .= ' Invoice ID : '. $invoice_id;
                }

                return response()->json(['success' => false, 'message' => $err_msg], 422);
            }
        }

        return response()->json(['success' => false, 'message' => "No input selected"], 422);
    }

    public function getUsedLocationDetails() {
        // $locations = LocationDetail::with('box_details:id,inward_id,location_detail_id')->whereRelation('box_details.inward_details:id,mark_as_outward', function ($query) {
        //     $query->where('box_details.inward_details.mark_as_outward', 0); // semicolon
        // })->where('is_empty', 0)->get();
        $inwards = Warehouse::select('id', 'inward_sys_id', 'proforma_invoice_id', 'business_task_id', 'mark_as_outward', 'packaging_done')
            ->with('business_task:id,customer_name', 'proforma_invoice:id,pi_number,consignee_id', 'boxes:id,inward_id,location_detail_id', 'boxes.location_details')
            ->where('mark_as_outward', 0)
            ->get();

        $racks = [];
        if(count($inwards) > 0) {
            foreach($inwards as $inw){

                $used_rack = [];
                // BT, Inward No, Pl, Buyer, Consignee (Once click the no.)
                $used_rack['inward_id'] = $inw->inward_sys_id;
                $used_rack['buyer'] = "(". $inw->business_task->id .")" . $inw->business_task->customer_name;
                $used_rack['proforma_invoice'] = $inw->proforma_invoice->pi_number;
                $used_rack['consignee'] = Consignee::where('id', $inw->proforma_invoice->consignee_id)->value('name');
                foreach($inw->boxes as $box){
                    $used_rack['loc_id'] = $box->location_detail_id;
                    $used_rack['location_name'] = $box->location_details->warehouse_name . " - " . $box->location_details->rack_number . " - " . $box->location_details->floor;

                    $racks[] = $used_rack;
                }
            }
        }

        return response()->json(['racks' => $racks]);
    }

    public function getBusinessDashboardData(Request $request) {
        $bts = BusinessTask::select('id','customer_name')->where('task_status', 'Won')->where('created_at', '>', $this->business_filter_date)->with(['invoices:id,invoice_number,shipment_type,business_task_id'])->orderBy('id', 'DESC')->get();

        $bts_arr = [];
        if($request->category == 'pending'){
            if(count($bts) > 0) {
                foreach ($bts as $bt) {
                    $shipment_full = false;
                    if(count($bt->invoices) > 0){
                        foreach($bt->invoices as $bt_inv) {
                            if($bt_inv->shipment_type == "Full") {
                                $shipment_full = true;
                            }
                        }
                        if(!$shipment_full) {
                            $bts_arr[] = $bt;
                        }
                    } else {
                        $bts_arr[] = $bt;
                    }
                }
            }
        } elseif ($request->category == 'closed') {
            if(count($bts) > 0) {
                foreach ($bts as $bt) {
                    $shipment_partial = false;
                    if(count($bt->invoices) > 0){
                        foreach($bt->invoices as $bt_inv) {
                            if($bt_inv->shipment_type == "Full") {
                                $shipment_partial = true;
                            }
                        }
                        if($shipment_partial) {
                            $bts_arr[] = $bt;
                        }
                    }
                }
            }
        } else {
            foreach ($bts as $bt) {
                // if(count($bt->invoices) > 0){
                //     $bts_arr[] = $bt;
                // } else {
                    $bts_arr[] = $bt;
                // }
            }
        }

        return response()->json($bts_arr);
    }

    public function getBtIrmDashboardData(Request $request) {

        $bts = BusinessTask::select('id','customer_name')->where('task_status', 'Won')->where('created_at', '>', $this->business_filter_date)->with(['irms:id,business_task_id,reference_no,currency_id,received_amount', 'irms.currency'])->orderBy('id', 'DESC')->get();

        $bts_arr = [];
        if($request->category == 'pending'){
            if(count($bts) > 0) {
                foreach ($bts as $bt) {
                    if(count($bt->irms) == 0){
                        $bts_arr[] = $bt;
                    }
                }
            }
        } elseif ($request->category == 'closed') {
            if(count($bts) > 0) {
                foreach ($bts as $bt) {
                    if(count($bt->irms) > 0){
                        $bts_arr[] = $bt;
                    }
                }
            }
        } else {
            foreach ($bts as $bt) {
                $bts_arr[] = $bt;
            }
        }

        return response()->json($bts_arr);
    }

    public function getBtPoDashboardData(Request $request) {
        $bts = BusinessTask::select('id','customer_name')->where('task_status', 'Won')->where('created_at', '>', $this->business_filter_date)->with(['purchase_orders:id,vendor_name_po,po_number,business_task_id'])->orderBy('id', 'DESC')->get();

        $bts_arr = [];
        if($request->category == 'pending'){
            if(count($bts) > 0) {
                foreach ($bts as $bt) {
                    if(count($bt->purchase_orders) == 0){
                        $bts_arr[] = $bt;
                    }
                }
            }
        } elseif ($request->category == 'closed') {
            if(count($bts) > 0) {
                foreach ($bts as $bt) {
                    if(count($bt->purchase_orders) > 0){
                        $bts_arr[] = $bt;
                    }
                }
            }
        } else {
            foreach ($bts as $bt) {
                $bts_arr[] = $bt;
            }
        }

        return response()->json($bts_arr);
    }

    public function getBtInwDashboardData(Request $request) {
        $bts = BusinessTask::select('id','customer_name')->where('task_status', 'Won')->where('created_at', '>', $this->business_filter_date)->with(['inwards:id,inward_sys_id,business_task_id'])->orderBy('id', 'DESC')->get();

        $bts_arr = [];
        if($request->category == 'pending'){
            if(count($bts) > 0) {
                foreach ($bts as $bt) {
                    if($bt->inwards == null){
                        $bts_arr[] = $bt;
                    }
                }
            }
        } elseif ($request->category == 'closed') {
            if(count($bts) > 0) {
                foreach ($bts as $bt) {
                    if($bt->inwards != null){
                        $bts_arr[] = $bt;
                    }
                }
            }
        } else {
            foreach ($bts as $bt) {
                $bts_arr[] = $bt;
            }
        }

        return response()->json($bts_arr);
    }

    public function exportWMSDashboard()
    {
        return Excel::download(new ExportWMSDashboard, 'WMS-Dashboard.xlsx');
    }
}
