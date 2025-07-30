<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class TaskRequest extends FormRequest
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
        // For POST requests, make fields required
        return [
            'title' => 'required|string|max:255',
            'stage_id' => 'required|integer|between:2,7',
            'task_type' => 'required|string|in:objective,kpi',
            'priority' => 'string|in:Directors priority,Salary Hold,Urgent,High,Medium,Low',
            'created_by' => 'required|integer',
            'start_date' => 'date_format:Y-m-d',
            'due_date' => 'date_format:Y-m-d'
        ];
    }

     // Set custom error messages for each rule
    public function messages()
    {
        return [
            'title.required' => 'Please enter task title.',
            'title.max' => 'The title cannot exceed 255 characters.',
            'stage_id.required' => 'The stage ID field is required.',
            'stage_id.integer' => 'The stage ID must be an integer.',
            'stage_id.between' => 'The stage ID must be between 2 and 7.',
            'task_type.required' => 'The task type field is required.',
            'task_type.string' => 'The task type must be a string.',
            'task_type.in' => 'The task type must be either objective or kpi.',
            'created_by.required' => 'Please enter created_by ID.',
            'created_by.integer' => 'The created_by ID must be an integer.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'errors' => $validator->errors(),
        ], 422));
    }
}
