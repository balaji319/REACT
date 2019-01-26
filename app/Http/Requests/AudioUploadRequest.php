<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class AudioUploadRequest extends FormRequest
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
            'audiofilename'=>'required|mimes:mp3,wav,gsm,x-wav,octet-stream,x-gsm,mpeg,x-mpeg,x-mp3,mpeg3,x-mpeg3,mpg,x-mpg,x-mpegaudio,octet/stream,ogg',
        ];  
    }
      /**
     * Set custom validation messages
     *
     * @return array
     */
    public function messages() {
        return [
            'audiofilename.mimes' => 'Please Upload Audio file with extenstion as .wav or .gsm. Audio provided',
       
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
