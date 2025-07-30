<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CredentialsRequest extends FormRequest
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
            'website_name' => 'required|string|max:255',
        ];
    }

    // Set custom error messages for each rule
    public function messages()
    {
        return [
            'website_name.required' => 'Please enter website name.',
            'website_name.max' => 'Website name cannot exceed 255 characters.',
        ];
    }
}
