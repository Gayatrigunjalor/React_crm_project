<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VendorTypeRequest extends FormRequest
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
        // If the request is PATCH or PUT, apply 'sometimes' to make fields optional
        if ($this->isMethod('patch') || $this->isMethod('put')) {
            return [
                'name' => 'required|string|max:255',
            ];
        }

        // For POST requests, make fields required
        return [
            'name' => 'required|string|max:255'
        ];
    }

     // Set custom error messages for each rule
    public function messages()
    {
        return [
            'name.required' => 'Please enter vendor-type.',
            'name.max' => 'The vendor-type cannot exceed 255 characters.',
        ];
    }
}
