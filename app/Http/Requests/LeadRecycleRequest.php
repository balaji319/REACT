<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class LeadRecycleRequest extends FormRequest {

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
            'attempt_delay' => 'required|integer|between:120,43200',
            'attempt_maximum' => 'required|integer|between:1,10',
            'status' => 'required'
        ];
    }

    /**
     * Set custom validation messages
     *
     * @return array
     */
    public function messages() {
        return [
            'attempt_delay.required' => 'Attempt delay is required.',
            'attempt_delay.between' => 'Attempt delay Must be between 120 to 43200.',
            'attempt_maximum.required' => 'Attempt Maximum is required.',
            'attempt_maximum.between' => 'Attempt Maximum Must be between 1 to 10.',
            'status.required' => 'Status is required.'
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
