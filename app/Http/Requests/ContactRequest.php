<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ContactRequest extends FormRequest
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
            'vendor_id' => ['required', 'integer'],
            'contact_person' => ['required', 'string'],
            'phone' => ['required', 'string'],
            'mobile' => ['required', 'string'],
            'email' => ['required', 'email'],
            'designation' => ['required', 'string'],
        ];
    }

    // Set custom error messages for each rule
    public function messages()
    {
        return [
            'vendor_id.required' => 'The vendor ID is required.',
            'vendor_id.integer' => 'The vendor ID must be an integer.',
            'contact_person.required' => 'Please enter contact person name.',
            'phone.required' => 'Please enter phone.',
            'mobile.required' => 'Please enter mobile.',
            'email.required' => 'Please enter email.',
            'designation.required' => 'Please enter designation.'
        ];
    }
}

