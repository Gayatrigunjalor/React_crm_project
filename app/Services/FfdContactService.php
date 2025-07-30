<?php

namespace App\Services;

use App\Models\FfdContact;
use Illuminate\Http\Request;

class FfdContactService
{
    public function listFfdContact(Request $request)
    {
        $rows = FfdContact::all()->where('ffd_id', $request->id);
        if ($rows->count() > 0) {
            return view('admin.master.ffd.contact.list-rows', compact('rows'));
        } else {
            return '<h4 class="my-5 text-center text-danger">No record present in the database!</h4>';
        }
    }

    public function createFfdContact(Request $request)
    {
        if (FfdContact::create([
            'ffd_id' => $request->ffd_id,
            'contact_person' => $request->contact_person,
            'designation' => $request->designation,
            'phone' => $request->phone,
            'email' => $request->email
        ]))  {
            return response()->json(['success' => true, 'message' => 'FFD Contact saved successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    public function editFfdContact($id)
    {
        return response()->json(FfdContact::find($id));
    }

    public function updateFfdContact(Request $request, $id)
    {
        if (FfdContact::find($id)->update([
            'ffd_id' => $request->ffd_id,
            'contact_person' => $request->contact_person,
            'designation' => $request->designation,
            'phone' => $request->phone,
            'email' => $request->email
        ]))  {
            return response()->json(['success' => true, 'message' => 'FFD Contact updated successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }

    public function deleteFfdContact($id)
    {
        if (FfdContact::find($id)->delete()) {
            return response()->json(['success' => true, 'message' => 'FFD Contact deleted successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'Something went wrong'], 422);
        }
    }
}
