<?php

namespace App\Http\Controllers;

// use App\Exports\ExportProduct;
use App\Models\User;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use App\Notifications\CheckerNotification;
use Illuminate\Support\Facades\Notification;

class ProductController extends Controller
{
    /**
     * @return \Illuminate\Contracts\View\View
     */
    public function index()
    {
        $this->authorize('product_list');
        $rows = Product::select('id','product_code','employee_name','model_name','product_name','make','functional_name','product_type_id','created_by','created_at')->withCount(['vendorCount','attachmentCount'])->orderBy('id', 'DESC')->get();
        return response()->json($rows, 200);
    }

    /**
     * @return \Illuminate\Contracts\View\View
     */
    public function productList()
    {
        $rows = Product::select('id','product_code','product_name')->withCount(['vendorCount'])->orderBy('id', 'ASC')->get();
        return response()->json($rows, 200);
    }

    /**
     * @return \Illuminate\Contracts\View\View
     */
    public function productWithVendors()
    {
        $rows = Product::select('id','product_code','product_name')->has('vendorCount')->withCount(['vendorCount'])->orderBy('id', 'ASC')->get();
        return response()->json($rows, 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $this->authorize('product_create');
        $this->validate($request, [
            'product_name' => 'required',
            'model_name' => 'required',
            'make' => 'required',
            'functional_name' => 'required',
            'segment_id' => 'required',
            'category_id' => 'required|integer',
            'employee_name' => 'required',
            'hsn_code_id' => 'required',
            'unit_of_measurement_id' => 'required',
            'printable_description' => 'required',
            'product_base_price' => 'required|numeric|min:0',
            'gst_percent_id' => 'required|numeric',
            'selling_cost' => 'required|numeric',
            // 'bottom_price' => 'required',
        ]);
        $formArray = $request->all();
        $query = Product::orderBy('id', 'DESC')->first();
        if (!empty($query)) {
            $value2 = preg_replace('/\D/', '', $query->product_code);
            $value2 = intval($value2) + 1;
            $formArray['product_code'] = "P-" . $value2;
        } else {
            $formArray['product_code'] = "P-0001";
        }
        $created_by = Auth::id();
        $formArray['created_by'] = $created_by;
        $form_id = Product::create($formArray);
        if (Auth::user()->user_role == 0) {
            Product::find($form_id->id)->update(array('approved' => true));
        } else {
            // $checker = User::find($created_by);
            // $checkerData = [
            //     'subject' => 'New Product Created',
            //     'body' => 'New Product Is Created by ' . $checker->employeeDetail->name . ' Please Check It',
            //     'url' => '/productChecker',
            //     'form_id' => $form_id->id
            // ];
            // if ($checker->checkers->product_c1 != null) {
            //     $userSchema = User::find($checker->checkers->product_c1);
            //     Product::find($form_id->id)->update(array('checker_id' => 1));
            //     Notification::send($userSchema, new CheckerNotification($checkerData));
            // } elseif ($checker->checkers->product_admin_approve == 1) {
            //     $userSchema = User::find(1);
            //     Product::find($form_id->id)->update(array('checker_id' => 0));
            //     Notification::send($userSchema, new CheckerNotification($checkerData));
            // } else {
                Product::find($form_id->id)->update(array('approved' => true));
            // }
        }
        return response()->json(['success' => true, 'message' => 'Product added successfully'],200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function viewProduct(Request $request)
    {
        $this->authorize('product_list');
        return response()->json(Product::with(['gstPercent:id,percent'])->find($request->id));
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $this->authorize('product_edit');
        $product = Product::with(['gstPercent:id,percent'])->find($id);
        if($product) {
            return response()->json($product);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find product'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $this->authorize('product_edit');
        if(Product::find($id)->update($request->all())) {
            return response()->json(['success' => true, 'message' => 'Product updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProductById(Request $request)
    {
        return response()->json(Product::find($request->id));
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProductRate($id)
    {
        $product = Product::select('id','product_code','product_name', 'printable_description', 'hsn_code_id','product_base_price','gst_percent_id')->with('gstPercent:id,percent')->find($id);
        return response()->json($product, 200);
    }

    // public function exportProjects()
    // {
    //     return Excel::download(new ExportProduct, 'products.xlsx');
    // }
}
