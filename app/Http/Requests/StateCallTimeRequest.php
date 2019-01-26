<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StateCallTimeRequest extends FormRequest
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
     * @return array
     */
    public function rules()
    {
        return [
            "state_call_time_id" => 'required|min:2|max:10|alpha_num:/^(?! )[0-9a-zA-Z_]*$/',
            "state_call_time_state" => "required|max:2|alpha_num:/^(?! )[0-9a-zA-Z_]*$/",
            "state_call_time_name" => "required|min:2|max:30",
            "state_call_time_comments"=>"nullable|max:255",
        ];
    }
}
