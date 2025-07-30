<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;
use App\Models\LogisticsCompliance;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class LogisticsComplianceController extends Controller
{

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {dd($request->all());
        $this->authorize('compliance_create');
        $this->validate($request,[
            'pickup_proof' => 'required|max:2048',
            'e_way_bill' => 'required|max:2048',
            'delivery_challan' => 'required|max:2048',
            'id_card' => 'required|max:2048',
            'kyc' => 'required|max:2048',
            'delivery_boy_photo' => 'required|max:2048',
            'cargo_pickup_agent' => 'required|max:2048',
            'ffd_quotation' => 'required|max:2048',
        ]);
        $this->storeCompliance($request);
        $map = array(
            'logistics_id' => 1
        );
        Invoice::find($request->invoice_id)->update($map);
        return response()->json([
            'status' => 200,
        ]);
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
        if ($request->hasFile('e_way_bill')) {
            $this->validate($request,[
                'e_way_bill' => 'required|max:2048',
            ]);
            $attachment = $request->file('e_way_bill');
            $attachmentName = date('YmdHis') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/ewaybill/' . $attachmentName, file_get_contents($attachment));
            $eWayBillName = $attachmentName;
        }
        if ($request->file('delivery_challan')) {
            $this->validate($request,[
                'delivery_challan' => 'required|max:2048',
            ]);
            $attachment = $request->file('delivery_challan');
            $attachmentName = date('YmdHis') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/deliverychallan/' . $attachmentName, file_get_contents($attachment));
            $deliveryChallanName = $attachmentName;
        }
        if ($request->file('id_card')) {
            $this->validate($request,[
                'id_card' => 'required|max:2048',
            ]);
            $attachment = $request->file('id_card');
            $attachmentName = date('YmdHis') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/idcard/' . $attachmentName, file_get_contents($attachment));
            $idCardName = $attachmentName;
        }
        if ($request->file('delivery_boy_photo')) {
            $this->validate($request,[
                'delivery_boy_photo' => 'required|max:2048',
            ]);
            $attachment = $request->file('delivery_boy_photo');
            $attachmentName = date('Y_m_d_His') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/idcard/' . $attachmentName, file_get_contents($attachment));
            $delivery_boy_photoName = $attachmentName;
        }
        if ($request->file('kyc')) {
            $this->validate($request,[
                'kyc' => 'required|max:2048',
            ]);
            $attachment = $request->file('kyc');
            $attachmentName = date('YmdHis') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/kyc/' . $attachmentName, file_get_contents($attachment));
            $kycName = $attachmentName;
        }
        if ($request->file('cargo_pickup_agent')) {
            $this->validate($request,[
                'cargo_pickup_agent' => 'required|max:2048',
            ]);
            $attachment = $request->file('cargo_pickup_agent');
            $attachmentName = date('YmdHis') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/cargo_pickup/' . $attachmentName, file_get_contents($attachment));
            $cargo_pickup_Name = $attachmentName;
        }
        if ($request->file('ffd_quotation')) {
            $this->validate($request,[
                'ffd_quotation' => 'required|max:2048',
            ]);
            $attachment = $request->file('ffd_quotation');
            $attachmentName = date('YmdHis') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/ffd_quotation/' . $attachmentName, file_get_contents($attachment));
            $ffd_quotation_Name = $attachmentName;
        }
        if ($request->file('insurance_attachment')) {
            $this->validate($request,[
                'insurance_attachment' => 'max:2048',
            ]);
            $attachment = $request->file('insurance_attachment');
            $attachmentName = date('YmdHis') .rand(10000, 99999). "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/insurance_attachment/' . $attachmentName, file_get_contents($attachment));
            $insurance_attachment_Name = $attachmentName;
        }
        if ($request->file('other_attachment')) {
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
            'pickup_proof' => $pickupProofName,
            'e_way_bill' => $eWayBillName,
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
     * @param mixed $id
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function edit($id)
    {
        $this->authorize('compliance_edit');
        $compliance = LogisticsCompliance::where("id", $id)->first();
        $invoices = Invoice::where('logistics_id', 0)->orWhere('id', '=', $compliance->invoice_id)->orderBy('id', 'desc')->get();
        return view('admin.e-docs.logistics-compliance.edit', compact('compliance', 'invoices'));
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateCompliance(Request $request)
    {
        $this->validate($request,[
            'id' => 'required',
            'invoice_id' => 'required',
        ]);

        $this->authorize('compliance_edit');
        $lc = LogisticsCompliance::find($request->id);
        if($request->has('updateFromWMS') && $request->updateFromWMS == 1){
            if($lc->invoice_id != $request->invoice_id){
                return response()->json(["message" => "Logistics data not found for this invoice ID"], 422);
            }
        }
        $this->mapInvoice($request->id, $request->invoice_id);
        $this->saveCompliance($request);
        return response()->json([
            'status' => 200,
        ]);
    }

    /**
     * @param mixed $request
     * @return bool
     */
    public function saveCompliance($request)
    {
        $formArray = $request->all();
        $old_file = LogisticsCompliance::find($request->id);
        if ($request->hasFile('pickup_proof')) {
            $this->validate($request,[
                'pickup_proof' => 'required|max:2048',
            ]);
            if (!empty($old_file->pickup_proof)) {
                Storage::delete('uploads/compliance/pickupproof/' . $old_file->pickup_proof);
            }
            $attachment = $request->file('pickup_proof');
            $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/pickupproof/' . $attachmentName, file_get_contents($attachment));
            $formArray['pickup_proof'] = $attachmentName;
        } else {
            unset($formArray['pickup_proof']);
        }
        if ($request->hasFile('e_way_bill')) {
            $this->validate($request,[
                'e_way_bill' => 'required|max:2048',
            ]);
            if (!empty($old_file->e_way_bill)) {
                Storage::delete('uploads/compliance/ewaybill/' . $old_file->e_way_bill);
            }
            $attachment = $request->file('e_way_bill');
            $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/ewaybill/' . $attachmentName, file_get_contents($attachment));
            $formArray['e_way_bill'] = $attachmentName;
        } else {
            unset($formArray['e_way_bill']);
        }
        if ($request->hasFile('delivery_challan')) {
            $this->validate($request,[
                'delivery_challan' => 'required|max:2048',
            ]);
            if (!empty($old_file->delivery_challan)) {
                Storage::delete('uploads/compliance/deliverychallan/' . $old_file->delivery_challan);
            }
            $attachment = $request->file('delivery_challan');
            $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/deliverychallan/' . $attachmentName, file_get_contents($attachment));
            $formArray['delivery_challan'] = $attachmentName;
        } else {
            unset($formArray['delivery_challan']);
        }
        if ($request->hasFile('id_card')) {
            $this->validate($request,[
                'id_card' => 'required|max:2048',
            ]);
            if (!empty($old_file->id_card)) {
                Storage::delete('uploads/compliance/idcard/' . $old_file->id_card);
            }
            $attachment = $request->file('id_card');
            $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/idcard/' . $attachmentName, file_get_contents($attachment));
            $formArray['id_card'] = $attachmentName;
        } else {
            unset($formArray['id_card']);
        }
        if ($request->hasFile('delivery_boy_photo')) {
            $this->validate($request,[
                'delivery_boy_photo' => 'required|max:2048',
            ]);
            if (!empty($old_file->delivery_boy_photo)) {
                Storage::delete('uploads/compliance/idcard/' . $old_file->delivery_boy_photo);
            }
            $attachment = $request->file('delivery_boy_photo');
            $attachmentName = date('Y_m_d_His') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/idcard/' . $attachmentName, file_get_contents($attachment));
            $formArray['delivery_boy_photo'] = $attachmentName;
        } else {
            unset($formArray['delivery_boy_photo']);
        }
        if ($request->hasFile('kyc')) {
            $this->validate($request,[
                'kyc' => 'required|max:2048',
            ]);
            if (!empty($old_file->kyc)) {
                Storage::delete('uploads/compliance/kyc/' . $old_file->kyc);
            }
            $attachment = $request->file('kyc');
            $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/kyc/' . $attachmentName, file_get_contents($attachment));
            $formArray['kyc'] = $attachmentName;
        } else {
            unset($formArray['kyc']);
        }
        if ($request->hasFile('cargo_pickup_agent')) {
            $this->validate($request,[
                'cargo_pickup_agent' => 'required|max:2048',
            ]);
            if (!empty($old_file->kyc)) {
                Storage::delete('uploads/compliance/cargo_pickup/' . $old_file->kyc);
            }
            $attachment = $request->file('cargo_pickup_agent');
            $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/cargo_pickup/' . $attachmentName, file_get_contents($attachment));
            $formArray['cargo_pickup_agent'] = $attachmentName;
        } else {
            unset($formArray['cargo_pickup_agent']);
        }
        if ($request->hasFile('ffd_quotation')) {
            $this->validate($request,[
                'ffd_quotation' => 'required|max:2048',
            ]);
            if (!empty($old_file->kyc)) {
                Storage::delete('uploads/compliance/ffd_quotation/' . $old_file->kyc);
            }
            $attachment = $request->file('ffd_quotation');
            $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/ffd_quotation/' . $attachmentName, file_get_contents($attachment));
            $formArray['ffd_quotation'] = $attachmentName;
        } else {
            unset($formArray['insurance_attachment']);
        }
        if ($request->hasFile('insurance_attachment')) {
            $this->validate($request,[
                'insurance_attachment' => 'max:2048',
            ]);
            if (!empty($old_file->kyc)) {
                Storage::delete('uploads/compliance/insurance_attachment/' . $old_file->kyc);
            }
            $attachment = $request->file('insurance_attachment');
            $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/insurance_attachment/' . $attachmentName, file_get_contents($attachment));
            $formArray['insurance_attachment'] = $attachmentName;
        } else {
            unset($formArray['insurance_attachment']);
        }
        if ($request->hasFile('other_attachment')) {
            $this->validate($request,[
                'other_attachment' => 'max:2048',
            ]);
            if (!empty($old_file->kyc)) {
                Storage::delete('uploads/compliance/other_attachment/' . $old_file->kyc);
            }
            $attachment = $request->file('other_attachment');
            $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
            Storage::put('uploads/compliance/other_attachment/' . $attachmentName, file_get_contents($attachment));
            $formArray['other_attachment'] = $attachmentName;
        } else {
            unset($formArray['other_attachment']);
        }
        return LogisticsCompliance::find($request->id)->update($formArray);
    }

    /**
     * @param mixed $id
     * @param mixed $invoice_id
     * @return true
     */
    public function mapInvoice($id, $invoice_id)
    {
        $compliance = LogisticsCompliance::where("id", $id)->first();
        if ($compliance->invoice_id != $invoice_id) {
            $removeMap = array(
                'logistics_id' => 0
            );
            Invoice::find($compliance->invoice_id)->update($removeMap);
            $map = array(
                'logistics_id' => 1
            );
            Invoice::find($invoice_id)->update($map);
        }
        return true;
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getInvoice(Request $request)
    {
        return response()->json(Invoice::with('ffdInternational')->with('ffdDomestic')->find($request->invoice_id));
    }
}
