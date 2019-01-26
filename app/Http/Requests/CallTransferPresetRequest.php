<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class CallTransferPresetRequest extends FormRequest {

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
            'preset_name' => 'required|between:1,40|alpha_num:/^(?! )[0-9a-zA-Z_]*$/',
            'preset_number' => 'required|between:2,50|alpha_num:/^(?! )[0-9a-zA-Z_]*$/',
            'preset_dtmf' => 'nullable|alpha_num:/^(?! )[0-9a-zA-Z_]*$/'
        ];
    }

    /**
     * Set custom validation messages
     *
     * @return array
     */
    public function messages() {
        return [
            'preset_number.required' => 'Preset Number is required.',
            'preset_number.between' => 'Preset Number must be between 2 and 50 characters in length.',
            'preset_number.alpha_num' => 'Preset Number should not contain spaces or Special Characters.',
            'preset_name.required' => 'Preset Name is required.',
            'preset_name.between' => 'Preset name must be between 1 and 40 characters in length.',
            'preset_name.alpha_num' => 'Preset Name should not contain spaces or Special Characters.',
            'preset_dtmf.alpha_num' => 'Preset DTMF should not contain Special Characters.',
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
