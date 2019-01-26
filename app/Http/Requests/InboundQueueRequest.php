<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class InboundQueueRequest extends FormRequest
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
            'group_id' => 'required|min:2|max:20|alpha_num:/^(?! )[0-9a-zA-Z_]*$/',
            'group_name' => 'required|min:3|max:30',
            'group_color' => 'required|min:2|max:7',
            'timer_action_seconds' => 'nullable|numeric',
            'drop_call_seconds' => 'nullable|numeric',
            'prompt_interval' => 'nullable|numeric',
            'onhold_prompt_seconds' => 'nullable|numeric',
            'calculate_estimated_hold_seconds' => 'nullable|numeric',
            'eht_minimum_prompt_seconds' => 'nullable|numeric',
            'wait_time_option_seconds' => 'nullable|numeric',
            'wait_time_option_prompt_seconds' => 'nullable|numeric',
            'hold_time_option_seconds' => 'nullable|numeric',
            'hold_time_option_minimum' => 'nullable|numeric',
            'hold_time_option_prompt_seconds' => 'nullable|numeric',
            'agent_alert_delay' => 'nullable|numeric',
            'agent_alert_delay' => 'nullable|numeric',
            'answer_sec_pct_rt_stat_one' => 'nullable|numeric',
            'answer_sec_pct_rt_stat_two' => 'nullable|numeric',
            'add_lead_url' => 'sometimes|url',
        ];
    }

      /**
     * Set custom validation messages
     *
     * @return array
     */
    public function messages() {
        return [
            'group_id.alpha_num' =>'group ID must contain only letters and numbers without space.',
            'group_name.alpha_num' => 'group name must contain only letters or numbers..',
            
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