<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ContactPersonRequest extends FormRequest
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
            'customer_id' => ['required', 'integer'],
            'contact_person' => ['required', 'string'],
            'phone' => ['required', 'string'],
            'mobile' => ['required', 'string'],
            'email' => ['required', 'email'],
            'designation' => ['required', 'string'],
        ];
    }
}
