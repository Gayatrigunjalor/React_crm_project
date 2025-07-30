<?php

namespace App\Http\Controllers;

use App\Models\Irm;
use App\Models\Customer;
use App\Models\Consignee;
use App\Models\BusinessTask;
use App\Models\Invoice;
use App\Models\IrmAttachments;
use App\Models\IrmPaymentHistory;
use App\Models\Quotation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class IrmController extends Controller
{
    protected $irmAttachmentPath = 'uploads/irm/attachments/';
    protected $session_id = null;

    public function __construct()
    {
        $this->session_id = session('company_id') ?? 1;
    }

    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function index()
    {
        $this->authorize('irm_list');

        $rows = Irm::select('id','irm_sys_id','reference_no','remittance_date','currency_id','received_amount','outstanding_amount','bank_id','buyer_id','consignee_ids','business_task_id','shipment_type')->with([
            'currency:id,name,symbol',
            'buyer:id,name',
            'consignee:id,contact_person',
            'bank:id,bank_name,ad_code',
            'business_task:id,customer_name',
            'business_task.proforma_invoice:id,business_task_id,attachment_name,attachment_details',
            'irm_attachments:id,irm_id,name,attachment_type'
        ])->where('company_id', $this->session_id)
        ->orderBy('id', 'desc')
        ->get();
        $i = 0;
        foreach ($rows as $row) {
            $pi_number = [];
            if($row->business_task != null && $row->business_task->proforma_invoice != null)
            {
                foreach ($row->business_task->proforma_invoice as $pi_value) {
                    $pi = Quotation::select('id','pi_number')->where('id', $pi_value->attachment_details)->first();
                    if($pi != null) $pi_number[] = $pi;
                }
            }

            $rows[$i]['quotations'] = $pi_number;
            $rows[$i]['invoiceNumbers'] = Invoice::select('id','invoice_number')->whereRaw("find_in_set('" . $row->id . "',invoice_irm_ids)")->get();
            $i++;
        }
        if ($rows->count() > 0) {
            return response()->json($rows, 200);
        } else {
            return response()->json([], 200);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addIrm(Request $request)
    {
        $this->authorize('irm_create');
        $this->validate($request, [
            'reference_no' => 'required',
            'remittance_date' => 'required',
            'currency_id' => 'required',
            'buyer_id' => 'required',
            'bank_id' => 'required',
            'firc_attachments.files.*' => 'max:5120',
            'swift_attachments.files.*' => 'max:5120'
        ]);
        $irm = Irm::create([
            'reference_no' => $request->reference_no,
            'remittance_date' => $request->remittance_date,
            'currency_id' => $request->currency_id,
            'received_amount' => $request->received_amount,
            'outstanding_amount' => $request->received_amount,
            'buyer_id' => $request->buyer_id,
            'consignee_ids' => $request->consignee_ids,
            'invoice_amount' => 0,
            'bank_id' => $request->bank_id,
            'business_task_id' => $request->business_task_id,
            'shipment_type' => $request->shipment_type,
            'company_id' => session('company_id') ?? 1
        ]);
        $irm_id = $irm->id;
        Irm::find($irm_id)->update(['irm_sys_id' => 'Irm_'.$irm_id]);
        if ($request->has('firc_attachments')) {
            foreach ($request->firc_attachments['files'] as $firc) {
                $firc_name = 'firc_'.date('YmdHis_') .rand(10000, 99999). "." . $firc->getClientOriginalExtension();
                Storage::put($this->irmAttachmentPath . $firc_name, file_get_contents($firc));
                $data = array(
                        'irm_id' => $irm_id,
                        'name' => $firc_name,
                        'attachment_type' => 'FIRC',
                        'attachment_details' => '',
                    'created_by' => Auth::id(),
                );
                IrmAttachments::create($data);
            }
        }

        if ($request->has('swift_attachments')) {
            foreach ($request->swift_attachments['files'] as $swift) {
                $swift_name = 'swift_'.date('YmdHis_') .rand(10000, 99999). "." . $swift->getClientOriginalExtension();
                Storage::put($this->irmAttachmentPath . $swift_name, file_get_contents($swift));
                $data = array(
                    'irm_id' => $irm_id,
                    'name' => $swift_name,
                    'attachment_type' => 'SWIFT COPY',
                    'attachment_details' => '',
                    'created_by' => Auth::id(),
                );
                IrmAttachments::create($data);
            }
        }


        return response()->json(['success' => true, 'message' => 'IRM created successfully'], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function editIrm($irmId)
    {
        $this->authorize('irm_edit');
        $rows = Irm::select('id','irm_sys_id','reference_no','remittance_date','currency_id','received_amount','outstanding_amount','bank_id','buyer_id','consignee_ids','business_task_id','shipment_type')->with([
            'currency:id,name,symbol',
            'buyer:id,name',
            'consignee:id,contact_person',
            'bank:id,bank_name',
            'business_task:id,customer_name',
        ])->where('company_id', $this->session_id)
        ->where('id', $irmId)
        ->first();
        return response()->json($rows, 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateIrm(Request $request)
    {
        $this->authorize('irm_edit');

        $this->validate($request, [
            'id' => 'required|integer',
            'reference_no' => 'required',
            'remittance_date' => 'required',
            'currency_id' => 'required',
            'buyer_id' => 'required',
            'bank_id' => 'required',
            'firc_attachments.files.*' => 'max:5120',
            'swift_attachments.files.*' => 'max:5120'
        ]);
        try {
            Irm::find($request->id)->update([
                'reference_no' => $request->reference_no,
                'remittance_date' => $request->remittance_date,
                'currency_id' => $request->currency_id,
                'received_amount' => $request->received_amount,
                'buyer_id' => $request->buyer_id,
                'consignee_ids' => $request->consignee_ids,
                'bank_id' => $request->bank_id,
                'business_task_id' => $request->business_task_id,
                'shipment_type' => $request->shipment_type
            ]);

            if ($request->has('firc_attachments')) {
                foreach ($request->firc_attachments['files'] as $firc) {
                    $firc_name = 'firc_'.date('YmdHis_') .rand(10000, 99999). "." . $firc->getClientOriginalExtension();
                    Storage::put($this->irmAttachmentPath . $firc_name, file_get_contents($firc));
                    $data = array(
                        'irm_id' => $request->id,
                        'name' => $firc_name,
                        'attachment_type' => 'FIRC',
                        'attachment_details' => '',
                        'created_by' => Auth::id(),
                    );
                    IrmAttachments::create($data);
                }
            }
            if ($request->has('swift_attachments')) {
                foreach ($request->swift_attachments['files'] as $swift) {
                    $swift_name = 'swift_'.date('YmdHis_') .rand(10000, 99999). "." . $swift->getClientOriginalExtension();
                    Storage::put($this->irmAttachmentPath . $swift_name, file_get_contents($swift));
                    $data = array(
                        'irm_id' => $request->id,
                        'name' => $swift_name,
                        'attachment_type' => 'SWIFT COPY',
                        'attachment_details' => '',
                        'created_by' => Auth::id(),
                    );
                    IrmAttachments::create($data);
                }
            }
            return response()->json(['success' => true, 'message' => 'IRM updated successfully'], 200);
        } catch (\Throwable $th) {
            return response()->json($th);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteIrmAttachment(Request $request)
    {
        $this->validate($request, [
            'id' => 'required',
            'irm_id' => 'required'
        ]);
        $attachment = IrmAttachments::find($request->id);
        if($attachment != null && Storage::exists($this->irmAttachmentPath . $attachment->name)){
            Storage::delete($this->irmAttachmentPath . $attachment->name);
        }
        if($attachment->delete()) {
            return response()->json(['success' => true, 'message' => 'Attachment deleted successfully!'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }

    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getIrmById($id)
    {
        $data = Irm::with('currency:id,name,symbol')->with('buyer:id,name')->with('bank:id,bank_name,ad_code')->find($id);
        $data['consignees'] = Consignee::select("id", "name", "customer_id")->where('customer_id', '=', $data->buyer_id)->get();
        return response()->json($data);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function irmHavingOutstandingAmount()
    {
        $irms = Irm::select('id','irm_sys_id','reference_no','remittance_date','currency_id','received_amount','outstanding_amount','buyer_id','bank_id')
            ->with(['currency:id,name,symbol', 'buyer:id,name', 'bank:id,bank_name'])
            ->where('outstanding_amount', '!=', '0')
            ->where('company_id', $this->session_id)
            ->orderBy('outstanding_amount', 'asc')
            ->get();
        return response()->json($irms, 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeIrmById(Request $request)
    {
        Irm::find($request->id)->update(array('map_to_trade' => $request->map_to_trade, 'invoice_id' => null));
        return response()->json(Irm::with('currency')->with('buyer')->with('bank')->find($request->id));
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function getIrmSelectedById()
    {
        return response()->json(Irm::with('currency')->with('buyer')->with('bank')->get()->whereNull('invoice_id'));
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateIrmConsignee(Request $request)
    {
        $data = array(
            'consignee_ids' => $request->consignee_ids
        );
        Irm::find($request->id)->update($data);
        $histories = IrmPaymentHistory::where('irm_id', $request->id)->count();
        if($histories > 0){
            IrmPaymentHistory::where('id', $request->hist_id)->update(array('consignee_id' => $request->consignee_ids));
        }
        return response()->json([
            'status' => 200,
        ]);
    }

    /**
     * @param \Illuminate\Http\Request $request
     * @return void
     */
    public function historyIrm(Request $request)
    {
        $this->authorize('irm_list');
        $rows = Invoice::select('id', 'invoice_number', 'invoice_irm_ids', 'grand_total')->whereRaw("find_in_set('" . $request->id . "',invoice_irm_ids)")->get();
        if ($rows->count() > 0) {
            $i = 0;
            foreach ($rows as $row) {
                $rows[$i]['irms'] = IrmPaymentHistory::with(['invoiceDetails'])->where('invoice_id', '=', $row->id)->orderBy('id', 'asc')->get();
                $i++;
            }
            return response()->json($rows, 200);
        } else {
            return response()->json([], 200);
        }
    }

    /**
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTaskIdBuyer($id)
    {
        $row = BusinessTask::find($id);
        if(!empty($row)){
            $customer = Customer::where('name', $row->customer_name)->first();
            if($customer){
                return response()->json($customer, 200);
            } else {
                return response()->json(['success' => false, 'message' => 'Customer\'s name in BT does not match with Customers master data'], 404);
            }
        } else {
            return response()->json(['success' => false, 'message' => 'Business Task not found'], 404);
        }
    }


}
