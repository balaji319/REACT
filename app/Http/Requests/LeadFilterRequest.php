<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class LeadFilterRequest extends FormRequest
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
            'lead_filter_id' => 'required|between:2,8|alpha_num:/^(?! )[0-9a-zA-Z_]*$/',
            'lead_filter_name' => 'required|between:2,30',
            'lead_filter_comments' => 'required|between:2,255',
            'lead_filter_sql' => 'required|min:2',
        ];
    }
        /**
     * Set custom validation messages
     *
     * @return array
     */
    public function messages() {
        return [
            'lead_filter_id.alpha_num' =>'Lead Filter ID must contain only letters and numbers.',
            'lead_filter_name.between' => 'Lead Filter name must contain only letters or numbers..',
           
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