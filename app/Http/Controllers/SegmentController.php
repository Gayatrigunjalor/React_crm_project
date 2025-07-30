<?php

namespace App\Http\Controllers;

use App\Http\Requests\SegmentRequest;
use Illuminate\Http\Request;
use App\Services\SegmentService;
use App\Models\Segment;

class SegmentController extends Controller
{
    /**
     * @return \Illuminate\Contracts\View\View
     */
    public function index(SegmentService $segmentService)
    {
        $this->authorize('segment_list');
        return $segmentService->listSegment();
    }

    /**
     * @return \Illuminate\Contracts\View\View
     */
    public function segmentListing(SegmentService $segmentService)
    {
        return $segmentService->listSegment();
    }

    /**
     * @param \App\Http\Requests\SegmentRequest $request
     * @param \App\Services\SegmentService $segmentService
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(SegmentRequest $request, SegmentService $segmentService)
    {
        $this->authorize('segment_create');
        return $segmentService->createSegment($request);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @param \App\Services\SegmentService $segmentService
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id, SegmentService $segmentService)
    {
        $this->authorize('segment_edit');
        return $segmentService->editSegment($id);
    }

    /**
     * @param \App\Http\Requests\SegmentRequest $request
     * @param \App\Services\SegmentService $segmentService
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(SegmentRequest $request, $id)
    {
        $this->authorize('segment_edit');
        if (Segment::find($id)->update(['name' => $request->name])) {
            return response()->json(['success' => true, 'message' => 'Segment updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    /**
     * @param \App\Services\SegmentService $segmentService
     * @return \Illuminate\Http\JsonResponse|void
     */
    public function destroy($id, SegmentService $segmentService)
    {
        $this->authorize('segment_delete');
        return $segmentService->deleteSegment($id);
    }
}
