<?php

namespace App\Http\Controllers;

use App\Models\State;
use App\Models\Country;
use App\Models\Customer;
use App\Models\Directories;
use App\Models\Invoice;
use App\Models\Irm;
use App\Models\Product;
use App\Models\Timezone;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class MasterController extends Controller
{
    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function countryListing()
    {
        $countries = Country::select('id', 'name', 'sortname', 'phonecode')->get();
        return response()->json($countries, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProductsCount()
    {
        $product = Product::all()->count();
        return response()->json($product, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCustomersCount()
    {
        $customer = Customer::all()->count();
        return response()->json($customer, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function getVendorsCount()
    {
        $vendor = Vendor::all()->count();
        return response()->json($vendor, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDirectoriesCount()
    {
        $directory = Directories::all()->count();
        return response()->json($directory, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function getLogisticsCount()
    {
        $invoice = Invoice::all()->count();
        $irm = Irm::all()->count();
        return response()->json(['invoiceCount' => $invoice, 'irmCount' => $irm], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse|void
     */
    public function getStates(Request $request)
    {
        $states = State::where('country_id', $request->country_id)->get();
        if (count($states) > 0) {
            return response()->json($states);
        } else {
            return response()->json([], 200);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse|void
     */
    public function getStatesByName(Request $request)
    {
        $country = Country::where('name', $request->country_id)->first();
        $states = State::where('country_id', $country->id)->get();
        if (count($states) > 0) {
            return response()->json($states,200);
        } else {
            return response()->json([],200);
        }
    }

    public function getTimezoneList()
    {
        $timezones = Timezone::Orderby('offset')->get(['id', 'name', 'offset']);
        return response()->json($timezones, 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function getFileDownload(Request $request)
    {
        $path = $request->filepath;
        // Ensure the file exists
        if (!Storage::exists($path)) {
            return response()->json(['error' => 'File not found'], 404);
        }

        // Get the filename
        $filename = basename($path);
        $headers = [
            'Content-Type' => Storage::mimeType($path),
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];
        // Return the file as a download response
        return Storage::download($path, $filename, $headers);
    }
}
