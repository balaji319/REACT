<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class CampaignUpdateRequest extends FormRequest {

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
            'campaign_id' => 'required|min:2|max:8|alpha_num:/^(?! )[0-9a-zA-Z_]*$/',
            'campaign_name' => 'required|min:6|max:40',
            'campaign_description' => 'nullable|max:255',
            'call_count_limit' => 'required|numeric|gte:0',
            'dial_timeout' => 'nullable|numeric|gt:0',
            'campaign_cid' => 'nullable|numeric',
            "campaign_vdad_exten" => "nullable|in:8368,8369,8366,8373",
            "drop_call_seconds" => "nullable|numeric",
            "xferconf_a_number" => "nullable|numeric",
            "dial_method" => "in:MANUAL,RATIO,ADAPT_HARD_LIMIT,ADAPT_TAPERED,ADAPT_AVERAGE,INBOUND_MAN",
            "dial_level_threshold" => "in:DISABLED,LOGGED-IN_AGENTS,NON-PAUSED_AGENTS,WAITING_AGENTS",
            "dial_level_threshold_agents" => "between:0,50|numeric",
            "available_only_ratio_tally" => "in:Y,N",
            "available_only_tally_threshold" => "in:DISABLED,LOGGED-IN_AGENTS,NON-PAUSED_AGENTS,WAITING_AGENTS",
            "available_only_tally_threshold_agents" => "between:0,50|numeric",
            "adaptive_dropped_percentage" => "between:0,100",
            "adaptive_maximum_level" => "gt:1",
            "adaptive_latest_server_time" => ["regex:/([01][0-9]|2[0-3])[0-5][0-9]/"],
            "adaptive_intensity" => "between:-41,41|integer",
            "adaptive_dl_diff_target" => "between:-41,41|integer",
            "dl_diff_target_method" => "in:ADAPT_CALC_ONLY,CALLS_PLACED",
            "concurrent_transfers" => "in:AUTO,1,2,3,4,5,6,7,8,9,10,15,20,25,30,40,50,60,80,100",
            "queue_priority" => "between:-100,100|integer",
            "inbound_queue_no_dial" => "in:DISABLED,ENABLED,ALL_SERVERS",
            "next_agent_call" => "in:random,oldest_call_start,oldest_call_finish,overall_user_level,campaign_rank,campaign_grade_random,fewest_calls,longest_wait_time",
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
            'campaign_name.required' => 'Campaign Name must be between 6 and 40 characters in length.',
            'campaign_name.min' => 'Campaign Name must be between 6 and 40 characters in length.',
            'campaign_name.max' => 'Campaign Name must be between 6 and 40 characters in length.',
            'campaign_description.max' => 'Campaign Description must be no larger than 255 characters long.',
            'call_count_limit.numeric' => 'Call Count Limit must be in numbers only.',
            'call_count_limit.gte' => 'Call Count Limit must be in numbers only.',
            'dial_timeout.numeric' => 'Dial Timeout must be in numbers only.',
            'dial_timeout.gt' => 'Dial Timeout must be in numbers only.',
            'campaign_cid.numeric' => 'Campaign Caller id must be in numbers only.',
            'campaign_vdad_exten.in' => 'Invalid input for Voicemail Detection.',
            'drop_call_seconds.numeric' => 'Drop Call Seconds must be in numbers only.',
            'xferconf_a_number.numeric' => 'Transfer Numbers must contain only numbers without any space.',
            'dial_method.in' => 'Option not available.',
            'dial_level_threshold.in' => 'Option not available.',
            'dial_level_threshold_agents.between' => 'Value must be between 0 and 50.',
            'dial_level_threshold_agents.numeric' => 'Value must be a position integer.',
            'available_only_ratio_tally.in' => 'Option not available.',
            'available_only_tally_threshold.in' => 'Option not available.',
            'available_only_tally_threshold_agents.between' => 'Value must be between 0 and 50.',
            'available_only_tally_threshold_agents.numeric' => 'Value must be a position integer.',
            'adaptive_dropped_percentage.between' => 'Value must be between 0 and 100.',
            'adaptive_maximum_level.gt' => 'Value must be greater than 1.',
            'adaptive_latest_server_time.regex' => 'Value must be in 24 hour time format. Example: 2100',
            'adaptive_intensity.between' => 'Value must be between -40 and 40.',
            'adaptive_intensity.integer' => 'Value must be an integer.',
            'adaptive_dl_diff_target.between' => 'Value must be between -40 and 40.',
            'adaptive_dl_diff_target.integer' => 'Value must be an integer.',
            'dl_diff_target_method.in' => 'Option not available.',
            'concurrent_transfers.in' => 'Option not available.',
            'queue_priority.between' => 'Value must be between -99 and 99.',
            'queue_priority.integer' => 'Value must be an integer.',
            'inbound_queue_no_dial.in' => 'Option not available.',
            'next_agent_call.in' => 'Next Agent :input Option not available.',
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
