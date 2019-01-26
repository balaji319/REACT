<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class CampaignWizardRequest extends FormRequest {

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
            "campaign_id" => "required|min:2|max:8|alpha_num:/^(?! )[0-9a-zA-Z_]*$/|unique:dyna.vicidial_campaigns",
            "campaign_cid" => "nullable|numeric",
            "campaign_name" => "required|min:6|max:40",
            "campaign_vdad_exten" => "nullable|in:8368,8369,8366,8373",
        ];
    }

    /**
     * Set custom validation messages
     *
     * @return array
     */
    public function messages() {
        return [
            'campaign_id.required' => 'Campaign ID is required',
            'campaign_id.min' => 'Campaign ID must be between 2 and 8 characters in length.',
            'campaign_id.max' => 'Campaign ID must be between 2 and 8 characters in length.',
            'campaign_id.alpha_num' => 'Only letters, or numbers are allowed for Campaign ID.',
            'campaign_id.unique' => 'Campaign ID already exists.',
            'campaign_cid.numeric' => 'Campaign Caller id must be in numbers only.',
            'campaign_name.min' => 'Campaign Name must be between 6 and 40 characters in length.',
            'campaign_name.max' => 'Campaign Name must be between 6 and 40 characters in length.',
            'campaign_vdad_exten.in' => 'Invalid input for Voicemail Detection.',
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
