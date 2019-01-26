<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class CallTimeRequest extends FormRequest
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
            "call_time_id" => "required|min:2|max:10|regex:^[0-9A-Za-z.\-_]+$^",
            "call_time_name"=>"nullable|min:2|max:30",
            "call_time_comment"=>"nullable|max:255",
        ];
    }
    /**
     * Set custom validation messages
     *
     * @return array
     */
    public function messages() {
        return [
            'call_time_id.required' => 'This field is required.',
            // 'call_time_id.alpha_num' =>'No spaces or punctuation allowed for Call Time ID',
            'call_time_comment.max'=>'Comment must not larger than 255 characters long.',
           
        ];
    }
     /**
     * [failedValidation [Overriding the event validater for custom error response]]
     * @param  Validator $validator [description]
     * @return [object][object of various validation errors]
     */
    public function failedValidation(Validator $validator) {
        throw new HttpResponseException(response()->json(['status' => 400, 'msg' => $validator->errors()->first()], 400));
    }
}