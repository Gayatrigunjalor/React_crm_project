<?php

namespace App\Http\Controllers;

use App\Models\Ffd;
use App\Models\FfdContact;
use App\Services\FfdContactService;
use Illuminate\Http\Request;

class FfdContactController extends Controller
{
    /**
     * @param mixed $ffdId
     * @return \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
     */
    public function index($ffdId)
    {
        $this->authorize('ffd_contact_list');
        $ffdRow = Ffd::select('ffd_name')->find($ffdId);
        $ffdContacts = FfdContact::all()->where('ffd_id', $ffdId);
        return response()->json(['ffd' => $ffdRow, 'ffdContact' => $ffdContacts], 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, FfdContactService $ffdContactService)
    {
        $this->authorize('ffd_contact_create');
        return $ffdContactService->createFfdContact($request);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id, FfdContactService $ffdContactService)
    {
        $this->authorize('ffd_contact_edit');
        return $ffdContactService->editFfdContact($id);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id, FfdContactService $ffdContactService)
    {
        $this->authorize('ffd_contact_edit');
        return $ffdContactService->updateFfdContact($request, $id);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id, FfdContactService $ffdContactService)
    {
        $this->authorize('ffd_contact_delete');
        return $ffdContactService->deleteFfdContact($id);
    }
}
