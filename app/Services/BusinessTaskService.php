<?php

namespace App\Services;

use App\Models\Vendor;
use App\Models\Segment;
use App\Models\Customer;
use App\Models\Quotation;
use App\Mail\FeedbackMail;
use App\Models\BankAccount;
use App\Models\BusinessTask;
use Illuminate\Http\Request;
use App\Models\PurchaseOrder;
use App\Models\BusinessTaskTeam;
use App\Models\SdeAttachmentBt;
// use App\Models\PaymentHistoryBt;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use App\Models\VendorPurchaseInvoice;

class BusinessTaskService
{
    private function returnBack(){
        Session::flash('incorrect_company_id','The Purchase Order you are trying to access is created from different company, to access it please switch company from the navbar.');
    }

    public function listBusinessTask()
    {
        if (Auth::user()->user_role == 0) {
            $businessTasks = BusinessTask::select('id','date','customer_name','opportunity_id','opportunity_date','segment','category','enquiry','task_status','lead_stage','sde_team','country','customer_type','priority','stock_position','shipping_liabelity','dimension_of_boxes','gross_wt','cold_chain','created_by')
            ->with(['segments:id,name', 'categories:id,name', 'userDetails:id,user_id,name'])->latest()->get();
        } else {
            $authId = Auth::id();
            $businessTaskTeams = BusinessTaskTeam::orWhere('sde', $authId)->orWhere('bpe', $authId)->orWhere('deo', $authId)->orWhere('pm', $authId)->orWhere('lm', $authId)->orWhere('cm', $authId)->get();
            $businessTaskOwnerId = [];
            foreach ($businessTaskTeams as $row) {
                array_push($businessTaskOwnerId, $row->id);
            }
            $businessTasks = BusinessTask::select('id','date','customer_name','opportunity_id','opportunity_date','segment','category','enquiry','task_status','lead_stage','sde_team','country','customer_type','priority','stock_position','shipping_liabelity','dimension_of_boxes','gross_wt','cold_chain','created_by')
            ->with(['segments:id,name', 'categories:id,name', 'userDetails:id,user_id,created_by,name'])->latest()->get();
            // $businessTasks = BusinessTask::whereIn('sde_team', $businessTaskOwnerId)->with(['segments', 'categories', 'userDetails'])->latest()->get();
        }

        return response()->json($businessTasks, 200);
    }

    public function btDropdownList()
    {
        $businessTasks = BusinessTask::select('id','customer_name')->get();
        return response()->json($businessTasks, 200);
    }

    // public function createForm()
    // {
    //     $customers = Customer::where('approved', '=', '1')->pluck('name');
    //     $segments = Segment::pluck('id', 'name');
    //     $businessTaskTeams = BusinessTaskTeam::with(['employeeSde'])->get();
    //     $businessTaskTeamId = BusinessTaskTeam::orWhere('sde', '=', auth()->id())->orWhere('bpe', '=', auth()->id())->orWhere('deo', '=', auth()->id())->orWhere('pm', '=', auth()->id())->orWhere('lm', '=', auth()->id())->orWhere('cm', '=', auth()->id())->first();
    //     return view('admin.business-task.create', compact('customers', 'segments', 'businessTaskTeams', 'businessTaskTeamId'));
    // }

    public function createBusinessTask(Request $request)
    {
        if (BusinessTask::create([
            'date' => $request->date,
            'customer_name' => $request->customer_name,
            'segment' => $request->segment_id,
            'category' => $request->category_id,
            'enquiry' => $request->enquiry,
            'task_status' => $request->task_status,
            'lead_stage' => $request->lead_stage,
            'sde_team' => $request->sde_team_id,
            'client_email' => $request->client_email,
            'enquiry_date_time' => $request->enquiry_date_time,
            'client_company' => $request->client_company,
            'mob' => $request->mob,
            'enq_msg' => $request->enq_msg,
            'enq_address' => $request->enq_address,
            'enq_city' => $request->enq_city,
            'enq_state' => $request->enq_state,
            'product_name' => $request->product_name,
            'country' => $request->country,
            'alt_email' => $request->alt_email,
            'alt_mobile' => $request->alt_mobile,
            'phone' => $request->phone,
            'alt_phone' => $request->alt_phone,
            'member_since' => $request->member_since,
            'created_by' => Auth::id(),
            'company_id' => session('company_id') ?? 1
        ])) {
            return response()->json(['success' => true, 'message' => 'Business Task created successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    public function createSalesBusinessTask(Request $request)
    {
        $shipmentMode = '';
        if(count($request->shipment_mode) > 0) {
            $modeString = [];
            foreach($request->shipment_mode as $mode) {
                $modeString[] = $mode['value'];
            }
            $shipmentMode = implode(",", $modeString);
        }
        if ($createBT = BusinessTask::create([
            'date' => $request->date,
            'opportunity_id' => $request->opportunity_id,
            'opportunity_date' => $request->opportunity_date,
            'customer_name' => $request->customer_name,
            'segment' => $request->segment_id,
            'category' => $request->category_id,
            'enquiry' => $request->enquiry,
            'task_status' => $request->task_status,
            'lead_stage' => $request->lead_stage,
            'sde_team' => $request->sde_team_id,
            'client_email' => $request->client_email,
            'enquiry_date_time' => $request->enquiry_date_time,
            'client_company' => $request->client_company,
            'mob' => $request->mob,
            'enq_msg' => $request->enq_msg,
            'enq_address' => $request->enq_address,
            'enq_city' => $request->enq_city,
            'enq_state' => $request->enq_state,
            'product_name' => $request->product_name,
            'country' => $request->country,
            'alt_email' => $request->alt_email,
            'alt_mobile' => $request->alt_mobile,
            'phone' => $request->phone,
            'alt_phone' => $request->alt_phone,
            'member_since' => $request->member_since,
            'shipping_liabelity' => $request->shipping_liabelity,
            'dimension_of_boxes' => $request->dimension_of_boxes,
            'volume_weight' => $request->volume_weight,
            'gross_wt' => $request->gross_wt,
            'cold_chain' => $request->cold_chain,
            'inco_term_id' => $request->inco_term_id,
            'port_of_unloading' => $request->port_of_unloading,
            'transportation' => $request->transportation,
            'final_destination' => $request->final_destination,
            'destination_code' => $request->destination_code,
            'shipment_mode' => $shipmentMode,
            'comments' => $request->comments,
            'freight_target_cost' => $request->freight_target_cost,
            'net_weight' => $request->net_weight,
            'created_by' => Auth::id(),
            'company_id' => session('company_id') ?? 1
        ])) {
            // $createBT->id
            $data = array(
                'business_task_id' => $createBT->id,
                'name' => '',
                'attachment_name' => 'Proforma Invoice',
                'attachment_details' => $request->proforma_invoice_id,
                'created_by' => Auth::id()
            );
            SdeAttachmentBt::create($data);
            foreach($request->proforma_invoice['files'] as $attachment) {
                $attachName = date('YmdHis_') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
                Storage::put('uploads/business-task/sde/' . $attachName, file_get_contents($attachment));
                $attachData = array(
                    'business_task_id' => $createBT->id,
                    'name' => $attachName,
                    'attachment_name' => "Payment receipt attachment",
                    'attachment_details' => '',
                    'created_by' => Auth::id(),
                );
                SdeAttachmentBt::create($attachData);
            }
            return response()->json(['success' => true, 'message' => 'Business Task created successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    public function editBusinessTask($id)
    {
        $businessTask = BusinessTask::select('id','date','customer_name','opportunity_id','opportunity_date','segment','category','enquiry','task_status','freight_target_cost','port_of_unloading','shipment_mode','inco_term_id','shipping_liabelity','cold_chain','final_destination','destination_code','comments')
            ->with(['segments:id,name', 'categories:id,name','inco_term:id,inco_term', 'proforma_invoice:id,name,attachment_name,attachment_details,business_task_id'])
            ->where("id", $id)
            ->first();
        $quotations = $businessTask->proforma_invoice;
        $q_nos = [];
        if($quotations->count() > 0){
            foreach ($quotations as $quote) {
                if($quote->attachment_name == "Proforma Invoice" && ($quote->name == "" || $quote->name == null)) {
                    $pi = Quotation::select('id', 'pi_number', 'pi_date')->where('id', $quote->attachment_details)->with('quotation_products:id,product_name,pi_order_id,quantity')->first();
                    if($pi != null) {
                        $q_nos[] = $pi;
                    }
                }
            }
        }

        $po_on_bt = PurchaseOrder::select('id','purchase_order_number','vendor_id', 'po_type')->where('business_task_id', $id)->with('vendor:id,name')->get()->toArray();

        $supplier_names = [];
        $po_numbers = [];
        $vendor_no = [];
        if(count($po_on_bt) > 0){
            foreach ($po_on_bt as $value) {
                $po_numbers[] = [ 'id' => $value['id'], 'po_number' => $value['purchase_order_number']];
                $supplier_names[] = $value['po_type'] != 'ffd' ? $value['vendor']['name'] : '';
            }
        }

        $vendor_invoices = VendorPurchaseInvoice::select('id','purchase_invoice_no','vendor_id')->where('business_task_id', $id)->with('vendor:id,name')->get();

        if($vendor_invoices->count() > 0){
            foreach ($vendor_invoices as $inv) {
                $vendor_no[] = $inv['purchase_invoice_no'];
                $supplier_names[] = $inv['vendor']['name'];
            }
        }

        $supplier_names = array_unique($supplier_names);

        return response()->json([
            'businessTask' => $businessTask,
            'quotations' => $q_nos,
            'po_numbers' => $po_numbers,
            'vendor_invoices' => $vendor_no,
            'supplier_names' => $supplier_names
        ], 200);
    }

    public function updateEnquiryDetails(Request $request)
    {
        if (BusinessTask::find($request->business_task_id)->update([
            'date' => $request->date,
            'customer_name' => $request->customer_name,
            'segment' => $request->segment,
            'category' => $request->category,
            'enquiry' => $request->enquiry,
            'task_status' => $request->task_status,
            'client_email' => $request->client_email,
            'enquiry_date_time' => $request->enquiry_date_time,
            'client_company' => $request->client_company,
            'mob' => $request->mob,
            'enq_msg' => $request->enq_msg,
            'enq_address' => $request->enq_address,
            'enq_city' => $request->enq_city,
            'enq_state' => $request->enq_state,
            'product_name' => $request->product_name,
            'country' => $request->country,
            'alt_email' => $request->alt_email,
            'alt_mobile' => $request->alt_mobile,
            'phone' => $request->phone,
            'alt_phone' => $request->alt_phone,
            'member_since' => $request->member_since
        ])) {
            return response()->json(['success' => true, 'message' => 'Enquiry details updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    public function updateSdeWorksheet(Request $request)
    {
        if (BusinessTask::find($request->business_task_id)->update([
            'lead_stage' => $request->lead_stage,
            'customerfeedbackform' => $request->customerfeedbackform,
            'customer_type' => $request->customer_type,
            'priority' => $request->priority,
            'stock_position' => $request->stock_position,
            'inorbvict_commitment' => $request->inorbvict_commitment,
            'sourcing_due_date' => $request->sourcing_due_date
        ])) {
            return response()->json(['success' => true, 'message' => 'Sde Worksheet saved successfully'], 200);
        }
    }


    public function updateLogisticsInstruction(Request $request)
    {
        $shipmentMode = '';
        if(count($request->shipment_mode) > 0) {
            $modeString = [];
            foreach($request->shipment_mode as $mode) {
                $modeString[] = $mode['value'];
            }
            $shipmentMode = implode(",", $modeString);
        }

        if (BusinessTask::find($request->business_task_id)->update([
            'shipping_liabelity' => $request->shipping_liabelity,
            'dimension_of_boxes' => $request->dimension_of_boxes,
            'volume_weight' => $request->volume_weight,
            'gross_wt' => $request->gross_wt,
            'cold_chain' => $request->cold_chain,
            'inco_term_id' => $request->inco_term_id,
            'port_of_unloading' => $request->port_of_unloading,
            'transportation' => $request->transportation,
            'final_destination' => $request->final_destination,
            'destination_code' => $request->destination_code,
            'shipment_mode' => $shipmentMode,
            'comments' => $request->comments,
            'freight_target_cost' => $request->freight_target_cost,
            'net_weight' => $request->net_weight
        ])) {
            return response()->json(['success' => true, 'message' => 'Logistics Instructions saved successfully'], 200);
        }
    }

    public function acWorksheetEdit($id)
    {
        $businessTask = BusinessTask::select('id','date','customer_name','freight_target_cost')
            ->with(['proforma_invoice:id,pi_number,pi_date'])
            ->where("id", $id)
            ->first();
        $quotations = $businessTask->proforma_invoice;
        $q_nos = [];
        if($quotations->count() > 0){
            foreach ($quotations as $quote) {
                if($quote->attachment_name == "Proforma Invoice" && ($quote->name == "" || $quote->name == null)) {
                    $pi = Quotation::select('id', 'pi_number', 'pi_date')->where('id', $quote->attachment_details)->with('quotation_products:id,product_name,pi_order_id,quantity')->first();
                    if($pi != null) {
                        $q_nos[] = $pi;
                    }
                }
            }
        }
        return response()->json([
            'businessTask' => $businessTask,
            'quotations' => $q_nos
        ], 200);

        // $payment_histories = PaymentHistoryBt::where('business_task_id', $id)->get();
        // $vendors = Vendor::where('approved', '=', '1')->get();
        // $po_on_bt = PurchaseOrder::select('id','purchase_order_number')->where('business_task_id', $id)->get()->toArray();
        // $po_numbers = [];
        // if(count($po_on_bt) > 0){
        //     foreach ($po_on_bt as $value) {
        //         $po_numbers[] = $value['purchase_order_number'];
        //     }
        // }
        // $purchase_orders = PurchaseOrder::select('id','purchase_order_number')->whereNull('business_task_id')->get();

        // $vendor_no = [];
        // if($vendor_invoices->count() > 0){
        //     foreach ($vendor_invoices as $inv) {
        //         $vendor_no[] = $inv['purchase_invoice_no'];
        //     }
        // }
        // return view('admin.business-task.account-worksheet.account-worksheet-form', compact('businessTask', 'po_numbers', 'purchase_orders', 'vendors', 'payment_histories', 'vendor_invoices', 'vendor_no', 'editRole', 'roleId', 'viewRole'));
    }

    public function vendorPurchaseHistory($id) {
        $vendor_invoices = VendorPurchaseInvoice::with(['vendor:id,name', 'purchase_order:id,purchase_order_number', 'attachments'])->where('business_task_id', $id)->get();
        return response()->json($vendor_invoices, 200);
    }

    public function lmWorksheetEdit($id)
    {
        $businessTask = BusinessTask::select('id','customer_name','freight_target_cost','port_of_unloading','shipment_mode','inco_term_id')
            ->with(['inco_term:id,inco_term', 'proforma_invoice'])
            ->where("id", $id)
            ->first();

        $quotations = $businessTask->proforma_invoice;
        $q_nos = [];
        if($quotations->count() > 0){
            foreach ($quotations as $quote) {
                if($quote->attachment_name == "Proforma Invoice" && ($quote->name == "" || $quote->name == null)) {
                    $pi = Quotation::select('id', 'pi_number', 'pi_date')->where('id', $quote->attachment_details)->with('quotation_products:id,product_name,pi_order_id,quantity')->first();
                    if($pi != null) {
                        $q_nos[] = $pi;
                    }
                }
            }
        }

        $po_on_bt = PurchaseOrder::select('id','purchase_order_number','vendor_id', 'po_type')->where('business_task_id', $id)->with('vendor:id,name')->get()->toArray();

        $supplier_names = [];
        $po_numbers = [];
        $vendor_no = [];
        if(count($po_on_bt) > 0){
            foreach ($po_on_bt as $value) {
                $po_numbers[] = [ 'id' => $value['id'], 'po_number' => $value['purchase_order_number']];
                $supplier_names[] = $value['po_type'] != 'ffd' ? $value['vendor']['name'] : '';
            }
        }

        $vendor_invoices = VendorPurchaseInvoice::select('id','purchase_invoice_no','vendor_id')->where('business_task_id', $id)->with('vendor:id,name')->get();
        if($vendor_invoices->count() > 0){
            foreach ($vendor_invoices as $inv) {
                $vendor_no[] = $inv['purchase_invoice_no'];
                $supplier_names[] = $inv['vendor']['name'];
            }
        }

        $supplier_names = array_unique($supplier_names);

        return response()->json([
            'businessTask' => $businessTask,
            'quotations' => $q_nos,
            'supplier_names' => $supplier_names,
            'po_numbers' => $po_numbers,
            'vendor_invoices' => $vendor_no
        ], 200);
    }

    public function fetchQuotation(Request $request)
    {
        $quotations = Quotation::with(['buyer', 'consignee'])->latest()->where('business_task_id', '=', $request->id)->get();
        if ($quotations->count() > 0) {
            return view('admin.business-task.sde-worksheet.quotation.list-rows', compact('quotations'));
        } else {
            return '<h4 class="my-5 text-center text-danger">No record present in the database!</h4>';
        }
    }

    // public function sendFeedBackMail(Request $request)
    // {
    //     $feedback = [
    //         'url' => 'https://www.inhpl.com/contact-us'
    //     ];
    //     if (Mail::to($request->id)->send(new FeedbackMail($feedback))) {
    //         return response()->json(['status' => 200]);
    //     }
    // }

    public function deleteBankAccount(Request $request)
    {
        if (BankAccount::find($request->id)->delete()) {
            return response()->json(['status' => 200]);
        }
    }

    public function getBankById(Request $request)
    {
        return response()->json(BankAccount::find($request->id));
    }
}
