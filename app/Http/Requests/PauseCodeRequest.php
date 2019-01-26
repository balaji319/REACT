<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class PauseCodeRequest extends FormRequest {

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
            'pause_code' => 'required|alpha_num:/^(?! )[0-9a-zA-Z_]*$/|between:1,6',
            'pause_code_name' => 'required'
        ];
    }

    /**
     * Set custom validation messages
     *
     * @return array
     */
    public function messages() {
        return [
            'pause_code.required' => 'Pause Code is required.',
            'pause_code.alpha_num' => 'Pause Code must contain only letters and numbers without space.',
            'pause_code.between' => 'Pause Code must be between 1 and 6 characters in length.',
            'pause_code_name.required' => 'Pause Code Name is required.'
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
