<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MOHRequest extends FormRequest
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
            'moh_id' => 'required|min:2',
            'moh_name' => 'required|min:2|max:100',
        ];
    }

}
