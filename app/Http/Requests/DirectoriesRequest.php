<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DirectoriesRequest extends FormRequest
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
            'company_name' => ['required', 'string'],
            'address' => ['required', 'string'],
            'brand_name' => ['required', 'string'],
            'company_email' => ['required', 'email'],
            'contact_person' => ['required', 'string'],
            'contact_number' => ['required', 'string'],
            'designation' => ['required', 'string'],
            'email' => ['required', 'email'],
        ];
    }
}
