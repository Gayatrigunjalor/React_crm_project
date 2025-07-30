<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssetsRequest extends FormRequest
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
            'asset_name' => 'required|string|max:255',
            'asset_type_id' => 'required|integer',
            'purchase_date' => 'required|date_format:Y-m-d',
            // 'warranty_exp_date' => 'date_format:Y-m-d',
            'vendor_id' => 'required|integer',
            'warranty_card' => 'max:2048',
            'invoice_file' => 'max:2048',
        ];
    }

    // Set custom error messages for each rule
    public function messages()
    {
        return [
            'asset_name.required' => 'Please enter asset name.',
            'asset_name.max' => 'Asset name cannot exceed 255 characters.',
            'vendor_id.integer' => 'The vendor ID must be an integer.',
            'warranty_card.max' => 'Warranty Card maximum file size is 2 MB.',
            'invoice_file.max' => 'Invoice copy maximum file size is 2 MB.'
        ];
    }
}
