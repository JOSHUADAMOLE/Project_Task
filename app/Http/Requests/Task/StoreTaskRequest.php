<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'group_id' => ['required', 'exists:task_groups,id'],
            'assigned_to_user_id' => ['nullable', 'exists:users,id'], // ✅ single assignee
            'description' => ['nullable', 'string'],
            'due_on' => ['nullable', 'date'],
            'subscribed_users' => ['array'],
            'labels' => ['array'],
            'attachments' => ['array'],
        ];
    }
}
