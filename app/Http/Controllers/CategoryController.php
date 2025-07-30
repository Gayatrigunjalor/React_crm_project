<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Segment;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $this->authorize('category_list');
        $rows = Category::orderBy('id', 'desc')->with('segment:id,name')->get();
        return response()->json($rows, 200);
    }

    /**
     * @param \App\Http\Requests\CategoryRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(CategoryRequest $request)
    {
        $this->authorize('category_create');
        if (Category::create([
            'name' => $request->name,
            'segment_id' => $request->segment_id,
            'description' => $request->description
        ])) {
            return response()->json(['success' => true, 'message' => 'Category saved successfully'], 200);
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
        $this->authorize('category_edit');
        $category = Category::select('id', 'name', 'segment_id', 'description')->find($id);
        if($category) {
            return response()->json($category);
        } else {
            return response()->json(['success' => false, 'message' => 'Unable to find category'], 422);
        }
    }

    /**
     * @param \App\Http\Requests\CategoryRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(CategoryRequest $request, $id)
    {
        $this->authorize('category_edit');
        if (Category::find($id)->update([
            'name' => $request->name,
            'segment_id' => $request->segment_id,
            'description' => $request->description
        ])) {
            return response()->json(['success' => true, 'message' => 'Category updated successfully'], 200);
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
        $this->authorize('category_delete');
        $customerCount = Customer::where('category_id', $id)->count();
        $productCount = Product::where('category_id', $id)->count();
        if($customerCount > 0 || $productCount > 0) {
            if($customerCount > 0){
                $message = 'Category cannot be removed as it is used in Customer\'s record.';
            }
            if($productCount > 0) {
                $message .= ' Category cannot be removed as it is used in Product\'s record.';
            }
            return response()->json(['success' => false, 'message' => $message], 422);
        } else {
            if (Category::find($id)->delete()) {
                return response()->json(['success' => true, 'message' => 'Category deleted successfully'], 200);
            } else {
                return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
            }
        }
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse|void
     */
    public function getCategories(Request $request)
    {
        $segments = Category::where('segment_id', $request->segment_id)->get();
        return response()->json($segments);
    }

    public function getCategoriesSegmentName(Request $request)
    {
        $segment = Segment::find($request->segment_id);
        $categories = Category::where('segment_id', '=', $segment->name)->get();
        if (count($categories) > 0) {
            return response()->json($categories);
        }
    }
}
