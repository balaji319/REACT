<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class VoicemailRequest extends FormRequest
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
            "voicemail_id" => "required|numeric|min:2",
            "pass" => "required|min:2|max:10",
            "fullname" => "required|min:2|max:100",
            "email" => "nullable|email",
        ];
    }
    /**
     * Set custom validation messages
     *
     * @return array
     */
    public function messages() {
        return [
            'voicemail_id.required' => 'Voicemail ID is required',
            'voicemail_id.numeric' => 'Voicemail ID must be in numbers only.',
            'pass.numeric' => 'password is required.',
            'fullname.in' => 'Fullname is required.',
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
