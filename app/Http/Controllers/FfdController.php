<?php

namespace App\Http\Controllers;

use App\Models\ExportAgentBt;
use App\Models\Ffd;
use App\Models\FfdContact;
use App\Models\FreightCostSourcingBt;
use App\Models\ImportPickupBt;
use App\Models\Invoice;
use App\Models\LogisticsCompliance;
use App\Models\OwnpickupBt;
use App\Models\PortOfLandingBt;
use App\Models\PurchaseOrder;
use App\Models\ServeBySuppliersBt;
use Illuminate\Http\Request;

class FfdController extends Controller
{
    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function index()
    {
        $this->authorize('ffd_list');
        $rows = Ffd::select('id','ffd_name','ffd_type')->orderBy('id', 'desc')->get();
        return response()->json($rows, 200);
    }

    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function ffdListing()
    {
        $internationalFfds = Ffd::select('id','ffd_name')->whereIn('ffd_type', ['International', 'Both'])->get();
        $domesticFfds = Ffd::select('id','ffd_name')->whereIn('ffd_type', ['Domestic', 'Both'])->get();
        return response()->json(['internationalFfds' => $internationalFfds, 'domesticFfds' => $domesticFfds], 200);
    }

    /**
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function ffdListingAll()
    {
        $ffds = Ffd::select('id','ffd_name')->get();
        return response()->json($ffds, 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $this->authorize('ffd_create');
        $this->validate($request,[
            'ffd_name' => 'required|string',
            'ffd_type' => 'required',
            'ffd_relation' => 'required'
        ]);
        if (Ffd::create([
            'ffd_name' => $request->ffd_name,
            'ffd_type' => $request->ffd_type,
            'ffd_relation' => $request->ffd_relation,
            'address' => $request->address,
            'country_id' => $request->country_id,
            'state_id' => $request->state_id,
            'city' => $request->city,
            'pin_code' => $request->pin_code,
            'website' => $request->website
        ])) {
            return response()->json(['success' => true, 'message' => 'FFD saved successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $this->authorize('ffd_edit');
        $ffd = Ffd::find($id);
        if($ffd) {
            return response()->json($ffd);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find ffd'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $this->authorize('ffd_edit');
        if (Ffd::find($id)->update([
            'ffd_name' => $request->ffd_name,
            'ffd_type' => $request->ffd_type,
            'ffd_relation' => $request->ffd_relation,
            'address' => $request->address,
            'country_id' => $request->country_id,
            'state_id' => $request->state_id,
            'city' => $request->city,
            'pin_code' => $request->pin_code,
            'website' => $request->website
        ])) {
            return response()->json(['success' => true, 'message' => 'Ffd updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse|void
     */
    public function destroy($id)
    {
        $this->authorize('ffd_delete');

        $ffdContactCount = FfdContact::where('ffd_id', $id)->count();
        $logisticsCompliancesCount = LogisticsCompliance::where('ffd_id', $id)->count();
        $poCount = PurchaseOrder::where('ffd_id', $id)->count();
        $ffdSourcingCount = FreightCostSourcingBt::where('ffd_id', $id)->count();
        $ownPickupBtCount = OwnpickupBt::where('ffd_id', $id)->count();
        $serveBySuppliersBtCount = ServeBySuppliersBt::where('ffd_id', $id)->count();
        $importPickupBtCount = ImportPickupBt::where('ffd_id', $id)->count();
        $exportAgentBtCount = ExportAgentBt::where('ffd_id', $id)->count();
        $portOfLandingBtCount = PortOfLandingBt::where('ffd_id', $id)->count();
        $invoiceIntlCount = Invoice::where('international_ffd_id', $id)->count();
        $invoiceDomesticCount = Invoice::where('domestic_ffd_id', $id)->count();
        $message = '';
        $message = 'FFD detail cannot be removed as it is used in ';
        if($ffdContactCount > 0 || $logisticsCompliancesCount > 0 || $poCount > 0 || $ffdSourcingCount > 0 || $ownPickupBtCount > 0 || $serveBySuppliersBtCount > 0|| $importPickupBtCount > 0 || $exportAgentBtCount > 0 || $portOfLandingBtCount > 0 || $invoiceIntlCount > 0 || $invoiceDomesticCount > 0){
            if($ffdContactCount > 0) {
                $message .= ' | FFD Contact | ';
            }
            if($logisticsCompliancesCount > 0) {
                $message .= ' | WMS Outward | ';
            }
            if($poCount > 0) {
                $message .= ' | Purchase Order | ';
            }
            if($ffdSourcingCount > 0) {
                $message .= ' | Pre Ongoing Shipment (BT) | ';
            }
            if($ownPickupBtCount > 0) {
                $message .= ' | Inorbvict Paid Pickup (BT) | ';
            }
            if($serveBySuppliersBtCount > 0) {
                $message .= ' | Supplier Paid Dispatch (BT) | ';
            }
            if($importPickupBtCount > 0) {
                $message .= ' | ExW Shipment (BT) | ';
            }
            if($exportAgentBtCount > 0) {
                $message .= ' | C&F CIF Shipment (BT) | ';
            }
            if($portOfLandingBtCount > 0) {
                $message .= ' | FOB Shipment (BT) | ';
            }
            if($invoiceIntlCount > 0) {
                $message .= ' | Invoice Internationational FFD | ';
            }
            if($invoiceDomesticCount > 0) {
                $message .= ' | Invoice Domestic FFD | ';
            }
            return response()->json(['success' => false, 'message' => $message], 422);
        } else {
            if (Ffd::find($id)->delete()) {
                return response()->json(['success' => true, 'message' => 'FFD deleted successfully'], 200);
            } else {
                return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
            }
        }

    }
}
