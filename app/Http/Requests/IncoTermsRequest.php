<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IncoTermsRequest extends FormRequest
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
            'inco_term' => 'required|string|max:255'
        ];
    }

    // Set custom error messages for each rule
    public function messages()
    {
        return [
            'inco_term.required' => 'Please enter inco term.',
            'inco_term.max' => 'The inco term cannot exceed 255 characters.',
        ];
    }
}
