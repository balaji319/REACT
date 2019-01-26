<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FPGRequest extends FormRequest
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
            "filter_phone_group_id" => "required|min:2|max:20|alpha_num:/^[0-9a-zA-Z_]+$/i",
            "filter_phone_group_name"=>"required|min:2|max:40",
        ];
    }
}
 