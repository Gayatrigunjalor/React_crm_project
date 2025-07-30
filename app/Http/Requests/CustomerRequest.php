<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CustomerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string'],
            'employee_name' => ['required', 'string'],
            'customer_type_id' => ['required', 'integer'],
            'segment_id' => ['required', 'integer'],
            'category_id' => ['required', 'integer'],
            'customer_base_id' => ['required', 'integer'],
            'country_id' => ['required', 'integer'],
            'city' => ['required', 'string'],
            'pin_code' => ['string'],
            'country_code' => ['required', 'string'],
            'area_code' => ['required', 'string'],
            'contact_no' => ['required'],
            'contact_person' => ['required', 'string'],
            'designation' => ['required', 'string'],
            'email' => ['required', 'email'],
        ];
    }
}
