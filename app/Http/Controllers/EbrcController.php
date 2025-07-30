<?php

namespace App\Http\Controllers;

use App\Models\Ebrc;
use App\Models\User;
use App\Models\Irm;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class EbrcController extends Controller
{
    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function index()
    {
        $this->authorize('ebrc_list');
        $rows = Ebrc::select('id','invoice_id','e_brc_no','e_brc_date')->with(['invoiceDetails:id,invoice_number,ebrc_id'])->orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }
    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function ebrcPendingInvoiceListing()
    {
        $this->authorize('ebrc_create');
        $invoices = Invoice::select('id','invoice_number')->where('ebrc_id', 0)->orderBy('id', 'desc')->get();
        return response()->json($invoices, 200);
    }

    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function getEbrcInvoiceDetails(Request $request)
    {
        $invoice = Invoice::find($request->invoice_id);
        $irms = $invoice->invoice_irm_ids;
        $irm_ids = explode(",", $irms);

        $irmRows = [];
        $irmTotal = 0;
        foreach($irm_ids as $irm){
            $irmDetails = Irm::select('id', 'irm_sys_id', 'reference_no', 'currency_id', 'received_amount', 'buyer_id', 'consignee_ids')->with(['currency:id,name', 'buyer:id,name', 'consignee:id,name'])->where('id', $irm)->first();
            $irmTotal += $irmDetails->received_amount;
            $irmRows[] = $irmDetails;
        }
        return response()->json(['irmTotal' => $irmTotal, 'irmRows' => $irmRows], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $this->authorize('ebrc_create');
        $this->validate($request,[
            'invoice_id' => 'required|integer|gt:0',
            'e_brc_no' => 'required',
            'e_brc_date' => 'required|date_format:Y-m-d',
        ]);
        try {
            $this->storeEbrc($request);
            Invoice::find($request->invoice_id)->update(['ebrc_id' => 1]);
            return response()->json(['success' => true, 'message' => 'e-Brc data saved successfully'], 200);
        } catch (\Throwable $th) {
            //throw $th;
            Log::error(json_encode($th));
            return response()->json(['success' => true, 'message' => $th], 422);
        }

    }

    /**
     * @param mixed $request
     * @return \Illuminate\Database\Eloquent\Model
     */
    public function storeEbrc($request)
    {
        return Ebrc::create([
            'invoice_id' => $request->invoice_id,
            'e_brc_no' => $request->e_brc_no,
            'e_brc_date' => $request->e_brc_date,
            'approved' => true,
            'created_by' => Auth::id()
        ]);
    }

    /**
     * @param mixed $id
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function show($id)
    {
        $this->authorize('ebrc_edit');
        $ebrc = Ebrc::select('id','invoice_id','e_brc_no','e_brc_date')->with('invoiceDetails:id,invoice_number')->find($id);

        return response()->json($ebrc, 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        $this->authorize('ebrc_edit');
        $this->validate($request,[
            'invoice_id' => 'required|integer|gt:0',
            'e_brc_no' => 'required',
            'e_brc_date' => 'required|date_format:Y-m-d',
        ]);
        $this->mapInvoice($request->id, $request->invoice_id);
        $this->saveEbrc($request);
        return response()->json(['success' => true, 'message' => 'e-Brc data updated successfully'], 200);
    }

    /**
     * @param mixed $request
     * @return bool
     */
    public function saveEbrc($request)
    {
        $formArray = $request->all();
        // if ($request->hasFile('ebrc_certificate')) {
        //     $this->validate($request,[
        //         'ebrc_certificate' => 'required|max:2048',
        //     ]);
        //     $old_file = Ebrc::find($request->id);
        //     if (!empty($old_file->ebrc_certificate)) {
        //         Storage::delete('uploads/ebrc/ebrccertificate/' . $old_file->ebrc_certificate);
        //     }
        //     $attachment = $request->file('ebrc_certificate');
        //     $attachmentName = date('YmdHis') . "." . $attachment->getClientOriginalExtension();
        //     Storage::put('uploads/ebrc/ebrccertificate/' . $attachmentName, file_get_contents($attachment));
        //     $formArray['ebrc_certificate'] = $attachmentName;
        // } else {
        //     unset($formArray['ebrc_certificate']);
        // }

        return Ebrc::find($request->id)->update($formArray);
    }

    /**
     * @param mixed $id
     * @param mixed $invoice_id
     * @return true
     */
    public function mapInvoice($id, $invoice_id)
    {
        $ebrc = Ebrc::where("id", $id)->first();
        if ($ebrc->invoice_id != $invoice_id) {
            $removeMap = array(
                'ebrc_id' => 0
            );
            Invoice::find($ebrc->invoice_id)->update($removeMap);
            $map = array(
                'ebrc_id' => 1
            );
            Invoice::find($invoice_id)->update($map);
        }
        return true;
    }

}
