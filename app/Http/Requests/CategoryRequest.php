<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategoryRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'segment_id' => 'required|string|max:255',
            'description' => 'required'
        ];
    }

    // Set custom error messages for each rule
    public function messages()
    {
        return [
            'name.required' => 'Please enter category.',
            'name.max' => 'The category cannot exceed 255 characters.',
            'segment_id.required' => 'Please enter category.',
            'segment_id.max' => 'The category cannot exceed 255 characters.',
            'description.required' => 'Please enter category.'
        ];
    }
}
