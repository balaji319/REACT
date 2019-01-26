<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class ScriptCloneRequest extends FormRequest
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
            "new_id" => "required|min:2|max:20|alpha_num:/^(?! )[0-9a-zA-Z_]*$/",
            "from_id" => "required",
        ];
    }
     /**
     * Set custom validation messages
     *
     * @return array
     */
    public function messages() {
        return [
            'new_id.required' => 'This field is required.',
            'new_id.alpha_num' =>'Only letters, or numbers are allowed for Script ID.',
            'new_id.unique' => 'Script ID already exists.',
            'from_id.required' => 'This field is required.',

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
