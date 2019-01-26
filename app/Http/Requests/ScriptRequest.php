<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ScriptRequest extends FormRequest
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
            "script_id" => 'required|alpha_num:/^(?! )[0-9a-zA-Z_]*$/|between:2,10',
            "script_name" => "required|min:2|max:50",
            "script_comments" => "required|min:2|max:255",
            "script_text"=>"required",
        ];
    }
}