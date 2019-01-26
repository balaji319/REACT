<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class CampaignListMixRequest extends FormRequest {

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize() {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules() {
        return [
            'vcl_id' => 'required|between:2,8|alpha_num:/^(?! )[0-9a-zA-Z_]*$/|unique:dyna.vicidial_campaigns_list_mix',
            'vcl_name' => 'required|between:2,50'
        ];
    }

    /**
     * Set custom validation messages
     *
     * @return array
     */
    public function messages() {
        return [
            'vcl_id.required' => 'List Mix ID must be between 2-8 characters in length',
            'vcl_id.between' => 'List Mix ID must be between 2-8 characters in length',
            'vcl_id.alpha_num' => 'Only letters, or numbers are allowed for Campaign List Mix.',
            'vcl_id.unique' => 'This record is already present.',
            'vcl_name.required' => 'List Mix Name must be between 2-50 characters in length.',
            'vcl_name.between' => 'List Mix Name must be between 2-50 characters in length.',
        ];
    }

    /**
     * [failedValidation [Overriding the event validator for custom error response]]
     * @param  Validator $validator [description]
     * @return [object][object of various validation errors]
     */
    public function failedValidation(Validator $validator) {
        throw new HttpResponseException(response()->json(['status' => 400, 'msg' => $validator->errors()->first()], 400));
    }

}
