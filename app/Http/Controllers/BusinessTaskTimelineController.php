<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\BusinessTask;
use App\Models\ExportAgentBt;
use App\Models\FreightCostSourcingBt;
use App\Models\ImportPickupBt;
use App\Models\OwnpickupBt;
use App\Models\PoDetailsBt;
use App\Models\VendorPurchaseInvoice;
use App\Models\TaxInvoiceDetailsBt;
use App\Models\PmWorksheetBt;
use App\Models\PortOfLandingBt;
use App\Models\Quotation;
use App\Models\Invoice;
use App\Models\Irm;
use App\Models\IrmPaymentHistory;
use App\Models\ServeBySuppliersBt;
use App\Models\SupplierScrutinyBt;
use App\Models\PaymentHistoryBt;

class BusinessTaskTimelineController extends Controller
{
    /**
     * @param \App\Services\BusinessTaskService $businessTaskService
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function index()
    {
        $this->authorize('bt_timeline');
        $business_tasks = BusinessTask::select('id', 'customer_name')->where('company_id', session('company_id'))->get();
        return view('admin.business-task.timeline.index')->with(['business_tasks' => $business_tasks]);
    }

    /**
     * @param \App\Services\BusinessTaskService $businessTaskService
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function getBusinessTaskById(Request $request)
    {
        // $this->authorize('bt_timeline');
        $this->validate($request, [
            'business_task_id' => 'required|integer'
        ]);
        if(BusinessTask::find($request->business_task_id) == null) {
            return response()->json(['success' => false, 'message' => 'Business Task not found'], 404);
        }
        $businessTaskId = $request->business_task_id;
        $row = BusinessTask::with(['incoTermDetails', 'categories', 'proforma_invoice'])->find($businessTaskId);
        $quotations = $row->proforma_invoice;
        $q_nos = [];
        $q_products = [];
        if($quotations->count() > 0){
            foreach ($quotations as $quote) {
                if($quote->attachment_name == "Proforma Invoice" && ($quote->name == "" || $quote->name == null)) {
                    $pi_number = '';
                    $pi = Quotation::select('id', 'pi_number', 'pi_date')->where('id', $quote->attachment_details)->with('quotation_products')->first();
                    if($pi != null) {
                        $q_nos[] = $pi;
                        $q_products[] = $pi->quotation_products;
                    }
                }
            }
        }
        $scrutinyRows = SupplierScrutinyBt::where('business_task_id', $businessTaskId)->get();
        $paymenthistories = PaymentHistoryBt::where('business_task_id', $businessTaskId)->get();
        /** PM Worksheet data starts from here */
            $pmRows = PoDetailsBt::where('business_task_id', $businessTaskId)->get();
            $pmTaxInvoiceRows = TaxInvoiceDetailsBt::where('business_task_id', $businessTaskId)->get();
            $pmDeptScrutinyRows = PmWorksheetBt::where('business_task_id', $businessTaskId)->get();
        /** PM Worksheet data ends here */
        /** LM Worksheet data starts from here */
            $payment_histories = PaymentHistoryBt::with(['po_details', 'po_details.vendor:id,name', 'po_details.po_products:id,purchase_order_id,product_name,quantity'])->where('business_task_id', $businessTaskId)->whereNotNull('po_id')->get();

            $vendor_invoices = VendorPurchaseInvoice::with(['vendor:id,name', 'purchase_order:id,purchase_order_number', 'attachments'])->where('business_task_id', $businessTaskId)->get();

            $freightCostRows = FreightCostSourcingBt::with(['ffd_name:id,ffd_name'])->where('business_task_id', $businessTaskId)->get();
            $ownPickupRows = OwnpickupBt::with(['ffd_name:id,ffd_name', 'purchase_order:id,purchase_order_number'])->where('business_task_id', $businessTaskId)->get();
            $servedByRows = ServeBySuppliersBt::with(['ffd_name:id,ffd_name'])->where('business_task_id', $businessTaskId)->get();
            $importerRows = ImportPickupBt::with(['ffd_name:id,ffd_name'])->where('business_task_id', $businessTaskId)->get();
            $exportAgentRows = ExportAgentBt::with(['ffd_name:id,ffd_name'])->where('business_task_id', $businessTaskId)->get();
            $portOfLoadingRows = PortOfLandingBt::with(['ffd_name:id,ffd_name', 'purchase_order:id,purchase_order_number'])->where('business_task_id', $businessTaskId)->get();
        /** LM Worksheet data ends here */

        $business_tasks = BusinessTask::select('id', 'customer_name')->get();
        $invoices = Invoice::with(['buyer'])->where('business_task_id', $businessTaskId)->get();
        $irms = Irm::where('business_task_id', $businessTaskId)->get();
        $irm_payment_histories = [];

        if($invoices && count($irms) > 0){
            foreach($irms as $irm){
                $payment = IrmPaymentHistory::with('invoiceDetails:id,invoice_number')->where('irm_id', $irm->id)->get();
                $irm_payment_histories[] = $payment;
            }
        }

        // return view('admin.business-task.timeline.index', compact('row', 'q_nos', 'q_products', 'invoices', 'irms', 'irm_payment_histories', 'payment_histories', 'scrutinyRows', 'paymenthistories', 'vendor_invoices', 'pmRows', 'pmDeptScrutinyRows', 'pmTaxInvoiceRows', 'freightCostRows', 'ownPickupRows', 'servedByRows', 'importerRows', 'exportAgentRows', 'portOfLoadingRows'))->with(['business_tasks'=> $business_tasks, 'selected_bt'=>$businessTaskId]);

        // 1. Sales Department
        // 2. Purchase Department
        // 3. Accounts Department
        // 4. Logistics Department - Ongoing Export
        // 5. Logistics Department - Pre Export
        // 6. Inward Remittance Management (IRM)
        // 7. IRM Payment History
        // 8. Invoices
        $pi_nos = '';
        if(count($q_nos) > 0){
            foreach ($q_nos as $q){
                // $pi_nos .= '<Button variant="link" onClick={() => handleProformaDownload('.$q->id.', "pdfWithSignatureQuotation")}>{'.$q->pi_number.'}</Button>';
                $pi_nos .= '<a class="link" data-toggle="tooltip" data-placement="bottom" title="PDF with signature" href="'.env('VARIABLE_NAME').'/pdfWithSignatureQuotation/'.$q->id.'"> <i class="fa-sm fa-solid fa-link"></i> '. $q->pi_number .' </a>';
            }
        }
        $pi_products = '';
        if(count($q_products) > 0){
            foreach ($q_products as $qp){
                foreach ($qp as $prod){
                    $pi_products .= '<strong> '. $prod->product_name .' </strong> &nbsp;&nbsp; Qty: <strong>'.$prod->quantity .'</strong> <br>';
                }
            }
        }
        $incoTermDetails = ($row->incoTermDetails != null) ? $row->incoTermDetails->inco_term : "";
        $sales_dept = [
            'id' => 1,
            'date' => 'Sales Department',
            'items' => [
                [
                    'id' => 1,
                    'time' => date('d-M-Y', strtotime($row->created_at)),
                    'icon' => 'faClipboard',
                    'iconColor' => 'success',
                    'title' => 'Customer',
                    'content' => $row->customer_name,
                    'tasker' => ''
                ],
                [
                    'id' => 2,
                    'time' => date('d-M-Y', strtotime($row->created_at)),
                    'icon' => `faClipboard`,
                    'iconColor' => 'success',
                    'title' => 'Enquiry detail',
                    'content' => '<span class="fw-semibold">Date </span> : '.date('d-M-Y', strtotime($row->created_at)) .'<br />
                        <span class="fw-semibold">Enquiry</span> : '. $row->enquiry .'<br />
                        <span class="fw-semibold">Task Status</span> : '. $row->task_status .' <br />
                        <span class="fw-semibold">PI No</span> : '. $pi_nos .' <br />
                        <span class="fw-semibold">PI Products & QTY</span> : '. $pi_products .' <br /> ',
                    'tasker' => 'John N. Ward'
                ],
                [
                    'id' => 3,
                    'time' => date('d-M-Y', strtotime($row->created_at)),
                    'icon' => `faClipboard`,
                    'iconColor' => 'success',
                    'title' => 'Logistic Instructions',
                    'content' => '
                        <span class="fw-semibold">Inco Term</span> : '. $incoTermDetails .'<br />
                        <span class="fw-semibold">Freight Target Cost</span> : '. $row->freight_target_cost .'<br />
                        <span class="fw-semibold">Port Of Unloading</span> : '. $row->port_of_unloading .'<br />
                        <span class="fw-semibold">Shipment Mode</span> : '. $row->shipment_mode .'<br />
                        <span class="fw-semibold">Shipping Liability</span> : '. $row->shipping_liabelity .'<br />
                        <span class="fw-semibold">Cold Chain</span> : '. $row->cold_chain .'<br />
                        <span class="fw-semibold">Final Destination</span> : '. $row->final_destination .'<br />
                    '
                ]
            ]
        ];

        if($pmDeptScrutinyRows->count() == 0) {
            $pmDeptData = '<span class="fw-semibold">Make</span> : <br />
            <span class="fw-semibold">Model</span> : <br />
            <span class="fw-semibold">Supplier Name</span> : <br />
            <span class="fw-semibold">Ready Stock Qty</span> : <br />
            <span class="fw-semibold">Lead time</span> : <br />
            <span class="fw-semibold">Expiry</span> : <br />
            <span class="fw-semibold">Phy Verification</span> : <br />
            <span class="fw-semibold">Condition</span> : <br />
            <span class="fw-semibold">Product type</span> : <br />
            <span class="fw-semibold">Transport cost</span> : <br />
            <span class="fw-semibold">Year of manufacturing</span> : <br />
            <span class="fw-semibold">Packaging cost</span> :  ';
        } else {
            $pmDeptData = '';
            foreach ($pmDeptScrutinyRows as $pmdept){
                $pmDeptData .= '
                    <span class="fw-semibold">Make</span> : '. $pmdept->make1 ?? '' .' <br />
                    <span class="fw-semibold">Model</span> : '. $pmdept->model1 ?? '' .' <br />
                    <span class="fw-semibold">Supplier Name</span> : '. $pmdept->supplier_name2 ?? '' .' <br />
                    <span class="fw-semibold">Ready Stock Qty</span> : '. $pmdept->ready_stock_quantity ?? '' .' <br />
                    <span class="fw-semibold">Lead time</span> : '. $pmdept->lead_time ?? '' .' <br />
                    <span class="fw-semibold">Expiry</span> : '. $pmdept->expiry ?? '' .' <br />
                    <span class="fw-semibold">Phy Verification</span> : '. $pmdept->physical_verification ?? '' .' <br />
                    <span class="fw-semibold">Condition</span> : '. $pmdept->supplier_name2 ?? '' .' <br />
                    <span class="fw-semibold">Product type</span> : '. $pmdept->condition1 ?? '' .' <br />
                    <span class="fw-semibold">Transport cost</span> : '. $pmdept->transportation_cost ?? '' .' <br />
                    <span class="fw-semibold">Year of manufacturing</span> : '. $pmdept->year_of_manufacturing1 ?? '' .' <br />
                    <span class="fw-semibold">Packaging cost</span> : '. $pmdept->packaging_cost ?? '' .'  <br/><br/>
                ';
            }
        }

        $purchase_department = [
            'id' => 2,
            'date' => 'Purchase Department',
            'items' => [
                [
                    'id' => 3,
                    'time' => date('d-M-Y', strtotime($row->created_at)),
                    'icon' => `faClipboard`,
                    'iconColor' => 'success',
                    'title' => 'Logistic Instructions',
                    'content' => $pmDeptData
                ]
            ]
        ];




        // $sales_dept = array_merge($sales_dept, $purchase_department);
        $timeline[] = $sales_dept;
        $timeline[] = $purchase_department;

        return response()->json($timeline, 200);

    }
}
