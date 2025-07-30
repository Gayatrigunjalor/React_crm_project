<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConsigneeRequest extends FormRequest
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
            'name' => ['required', 'string'],
            'contact_person' => ['required', 'string'],
            'address' => ['required', 'string'],
            'city' => ['required', 'string'],
            'pin_code' => ['required', 'numeric'],
            'mobile' => ['required'],
            'email' => ['required', 'email'],
            'country' => ['required', 'integer'],
            'designation' => ['required', 'string'],
        ];
    }
}
