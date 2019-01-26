<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class AdvancedListRuleAddRequest extends FormRequest {

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
            'from_list_id' => 'array',
            'from_list_id.*' => ['regex:/^([0-9]{3,})*((,)[0-9]{3,})*$/i'],
            'from_list_status' => 'array',
            'from_list_status.*' => ['regex:/^[0-9A-Za-z]*((,)[0-9A-Za-z]+)*$/i'],
            'to_list_id' => ['regex:/^([0-9]{3,}){0,1}$/i'],
            'to_list_status' => ['regex:/^([0-9A-Za-z]+){0,1}$/i'],
            'from_campaign_id' => '',
            'interval' => ['regex:/^[1-9][0-9]*$/i'],
            'active' => 'boolean',
            'last_run' => 'nullable|date_format:Y-m-d H:i:s',
            'next_run' => 'nullable|date_format:Y-m-d H:i:s',
            'entry_date' => 'nullable|date_format:Y-m-d H:i:s',
            'called_count' => ['regex:/^[0-9]*|(null)$/i'],
            'called_since_last_reset' => ['regex:/^[0-2]$/'],
            'reset_called_since_last_reset' => 'boolean',
        ];
    }

    /**
     * Set custom validation messages
     *
     * @return array
     */
    public function messages() {
        return [
            'from_list_id.*.regex' => 'From list ID :input is not correctly formatted, please confirm the input. (Example: 8888,9999 or 8888)',
            'from_list_status.*.regex' => 'From list ID :input is not correctly formatted, please confirm the input. (Example: xxxx,xxxx or xxxx)',
            'to_list_id.regex' => 'To list ID is not correctly formatted, please confirm the input. (Example: 8888)',
            'to_list_status.regex' => 'To list status is not correctly formatted, please confirm the input. (Example: xxxx)',
            'interval.regex' => 'Interval is not correctly formatted, please confirm the input. (Example: 1)',
            'active.boolean' => 'Actrive is not correctly formatted, please confirm the input. (Example: 0 or 1)',
            'last_run.date_format' => 'Please enter a valid date and time for last run.',
            'next_run.date_format' => 'Please enter a valid date and time for next run.',
            'entry_date.date_format' => 'Please enter a valid date and time for entry date.',
            'called_count.regex' => 'Called count is not correctly formatted, please confirm the input.',
            'called_since_last_reset.regex' => 'Called since last reset is not correctly formatted, please confirm the input.',
            'reset_called_since_last_reset.boolean' => 'Reset called since last reset is not correctly formatted, please confirm the input.',
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
