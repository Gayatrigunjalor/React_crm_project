<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BankAccountRequest extends FormRequest
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
            'bank_name' => ['required', 'string'],
            'account_holder_name' => ['required', 'string'],
            'branch' => ['required', 'string'],
            'branch_code' => ['required', 'string'],
            'address' => ['required', 'string'],
            'city' => ['required', 'string'],
            'pin_code' => ['required', 'numeric'],
            'account_no' => ['required', 'string'],
            'ifsc' => ['required', 'string'],
            'swift_code' => ['required', 'string'],
            'ad_code' => ['required', 'string']
        ];
    }
}
