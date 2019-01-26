<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class CampaignCloneRequest extends FormRequest {

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
            'from_id' => 'required',
            'campaign_id' => 'required|min:2|max:8|alpha_num:/^(?! )[0-9a-zA-Z_]*$/|unique:dyna.vicidial_campaigns'
        ];
    }

    /**
     * Set custom validation messages
     *
     * @return array
     */
    public function messages() {
        return [
            'from_id.required' => 'Something wrong with or missing from your inputs, please fix them and try again, thanks.',
            'campaign_id.required' => 'Campaign ID is required',
            'campaign_id.min' => 'Campaign ID must be between 2 and 8 characters in length.',
            'campaign_id.max' => 'Campaign ID must be between 2 and 8 characters in length.',
            'campaign_id.alpha_num' => 'Only letters, or numbers are allowed for Campaign ID.',
            'campaign_id.unique' => 'Campaign ID :input is taken, please choose another one.',
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
