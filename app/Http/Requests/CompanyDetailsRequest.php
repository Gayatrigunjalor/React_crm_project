<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CompanyDetailsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'name' => ['required', 'string'],
            'address' => ['required', 'string'],
            'city' => ['required', 'string'],
            'state' => ['required', 'string'],
            'country' => ['required', 'string'],
            'pin_code' => ['required', 'numeric'],
            'gst_no' => ['required', 'string'],
            'pan_no' => ['required', 'string'],
            'pcpndt_no' => ['required', 'string'],
            'drug_lic_no' => ['required', 'string'],
            'iec' => ['required', 'string'],
            'cin' => ['required', 'string'],
            'tds' => ['required', 'string'],
            'iso' => ['required', 'string'],
            'arn' => ['required', 'string'],
            'website' => ['required', 'string'],
            'optional_website' => ['nullable', 'string'],
            'mobile' => ['required', 'string'],
            'optional_mobile' => ['nullable', 'string'],
        ];
    }
}
