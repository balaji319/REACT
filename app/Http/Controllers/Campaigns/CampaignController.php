<?php

namespace App\Http\Controllers\Campaigns;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Traits\AccessControl;
use App\Traits\ErrorLog;
use App\Traits\Helper;
use App\VicidialCampaign;
use App\VicidialCampaignStat;
use App\VicidialCampaignStatsDebug;
use App\VicidialCampaignStatuses;
use App\VicidialXferPreset;
use App\VicidialPauseCode;
use App\VicidialLeadRecycle;
use App\VicidialCampaignCidAreacode;
use App\VicidialAdminLog;
use App\VicidialInboundDid;
use App\X5ContactAccess;
use App\VicidialCallTime;
use App\VicidialScript;
use App\SystemSetting;
use App\VicidialStatuses;
use App\YtelExtraSetting;
use App\X5Log;
use App\VicidialInboundGroup;
use App\VicidialHopper;
use App\VicidialCampaignListMix;
use App\VicidialLeadFilter;
use App\VicidialList;
use App\VicidialLists;
use Exception;
use Validator;
use App\Http\Requests\CampaignCloneRequest;
use App\Http\Requests\CampaignWizardRequest;
use App\Http\Requests\CampaignUpdateRequest;

class CampaignController extends Controller {

    use ErrorLog,
        AccessControl,
        Helper;

    private $inbound = array('campaign_id' => 'Inbound', 'campaign_name' => 'Inbound Campaign', 'active' => 'N', 'dial_status_a' => '', 'dial_status_b' => '', 'dial_status_c' => '', 'dial_status_d' => '', 'dial_status_e' => '', 'lead_order' => 'RANDOM', 'park_ext' => '', 'park_file_name' => '', 'web_form_address' => '', 'allow_closers' => 'Y', 'hopper_level' => '100', 'auto_dial_level' => '1.0', 'next_agent_call' => 'longest_wait_time', 'local_call_time' => '9am-9pm', 'voicemail_ext' => '', 'dial_timeout' => '45', 'dial_prefix' => '9', 'campaign_cid' => '8003824913', 'campaign_vdad_exten' => '8369', 'campaign_rec_exten' => '8309', 'campaign_recording' => 'ALLFORCE', 'campaign_rec_filename' => 'FULLDATE_CUSTPHONE', 'campaign_script' => '', 'get_call_launch' => 'NONE', 'am_message_exten' => 'vm-goodbye', 'amd_send_to_vmx' => 'N', 'xferconf_a_dtmf' => '', 'xferconf_a_number' => '', 'xferconf_b_dtmf' => '', 'xferconf_b_number' => '', 'alt_number_dialing' => 'Y', 'scheduled_callbacks' => 'Y', 'lead_filter_id' => 'NONE', 'drop_call_seconds' => '5', 'drop_action' => 'AUDIO', 'safe_harbor_exten' => '8307', 'display_dialable_count' => 'Y', 'wrapup_seconds' => '0', 'wrapup_message' => 'Wrapup Call', 'closer_campaigns' => ' AGENTDIRECT SALES_INBOUND -', 'use_internal_dnc' => 'Y', 'allcalls_delay' => '0', 'omit_phone_code' => 'N', 'dial_method' => 'INBOUND_MAN', 'available_only_ratio_tally' => 'Y', 'adaptive_dropped_percentage' => '3', 'adaptive_maximum_level' => '3.0', 'adaptive_latest_server_time' => '2100', 'adaptive_intensity' => '0', 'adaptive_dl_diff_target' => '0', 'concurrent_transfers' => 'AUTO', 'auto_alt_dial' => 'NONE', 'auto_alt_dial_statuses' => 'B N NA DC -', 'agent_pause_codes_active' => 'N', 'campaign_description' => 'Inbound Template Campaign', 'campaign_changedate' => '2014-03-27 12:40:27', 'campaign_stats_refresh' => 'N', 'campaign_logindate' => '2014-03-27 10:04:30', 'dial_statuses' => 'PDROP XDROP NA N DROP B AFTHRS AB AA A NEW -', 'disable_alter_custdata' => 'N', 'no_hopper_leads_logins' => 'Y', 'list_order_mix' => 'DISABLED', 'campaign_allow_inbound' => 'Y', 'manual_dial_list_id' => '998', 'default_xfer_group' => '---NONE---', 'xfer_groups' => ' AGENTDIRECT SALES_INBOUND -', 'queue_priority' => '50', 'drop_inbound_group' => '---NONE---', 'qc_enabled' => 'N', 'qc_statuses' => '', 'qc_lists' => '', 'qc_shift_id' => '24HRMIDNIGHT', 'qc_get_record_launch' => 'NONE', 'qc_show_recording' => 'Y', 'qc_web_form_address' => '', 'qc_script' => '', 'survey_first_audio_file' => 'US_pol_survey_hello', 'survey_dtmf_digits' => '1238', 'survey_ni_digit' => '8', 'survey_opt_in_audio_file' => 'US_pol_survey_transfer', 'survey_ni_audio_file' => 'US_thanks_no_contact', 'survey_method' => 'AGENT_XFER', 'survey_no_response_action' => 'OPTIN', 'survey_ni_status' => 'NI', 'survey_response_digit_map' => '1-DEMOCRAT|2-REPUBLICAN|3-INDEPENDANT|8-OPTOUT|X-NO RESPONSE|', 'survey_xfer_exten' => '8300', 'survey_camp_record_dir' => '/home/survey', 'disable_alter_custphone' => 'Y', 'display_queue_count' => 'Y', 'manual_dial_filter' => 'NONE', 'agent_clipboard_copy' => 'NONE', 'agent_extended_alt_dial' => 'N', 'use_campaign_dnc' => 'Y', 'three_way_call_cid' => 'CUSTOMER', 'three_way_dial_prefix' => '87', 'web_form_target' => 'vdcwebform', 'vtiger_search_category' => 'LEAD', 'vtiger_create_call_record' => 'Y', 'vtiger_create_lead_record' => 'Y', 'vtiger_screen_login' => 'Y', 'cpd_amd_action' => 'DISABLED', 'agent_allow_group_alias' => 'N', 'default_group_alias' => '', 'vtiger_search_dead' => 'ASK', 'vtiger_status_call' => 'N', 'survey_third_digit' => '', 'survey_third_audio_file' => 'US_thanks_no_contact', 'survey_third_status' => 'NI', 'survey_third_exten' => '8300', 'survey_fourth_digit' => '', 'survey_fourth_audio_file' => 'US_thanks_no_contact', 'survey_fourth_status' => 'NI', 'survey_fourth_exten' => '8300', 'drop_lockout_time' => '0', 'quick_transfer_button' => 'N', 'prepopulate_transfer_preset' => 'N', 'drop_rate_group' => 'DISABLED', 'view_calls_in_queue' => 'ALL', 'view_calls_in_queue_launch' => 'MANUAL', 'grab_calls_in_queue' => 'Y', 'call_requeue_button' => 'N', 'pause_after_each_call' => 'N', 'no_hopper_dialing' => 'N', 'agent_dial_owner_only' => 'NONE', 'agent_display_dialable_leads' => 'N', 'web_form_address_two' => '', 'waitforsilence_options' => '', 'agent_select_territories' => '', 'campaign_calldate' => '', 'crm_popup_login' => 'N', 'crm_login_address' => '', 'timer_action' => 'NONE', 'timer_action_message' => '', 'timer_action_seconds' => '1', 'start_call_url' => '', 'dispo_call_url' => '', 'xferconf_c_number' => '', 'xferconf_d_number' => '', 'xferconf_e_number' => '', 'use_custom_cid' => 'N', 'scheduled_callbacks_alert' => 'BLINK_RED_DEFER', 'queuemetrics_callstatus_override' => 'DISABLED', 'extension_appended_cidname' => 'N', 'scheduled_callbacks_count' => 'ALL_ACTIVE', 'manual_dial_override' => 'NONE', 'blind_monitor_warning' => 'DISABLED', 'blind_monitor_message' => 'Someone is blind monitoring your session', 'blind_monitor_filename' => '', 'inbound_queue_no_dial' => 'DISABLED', 'timer_action_destination' => '', 'enable_xfer_presets' => 'ENABLED', 'hide_xfer_number_to_dial' => 'DISABLED', 'manual_dial_prefix' => '88', 'customer_3way_hangup_logging' => 'ENABLED', 'customer_3way_hangup_seconds' => '5', 'customer_3way_hangup_action' => 'NONE', 'ivr_park_call' => 'DISABLED', 'ivr_park_call_agi' => '', 'manual_preview_dial' => 'PREVIEW_AND_SKIP', 'realtime_agent_time_stats' => 'CALLS_WAIT_CUST_ACW_PAUSE', 'use_auto_hopper' => 'Y', 'auto_hopper_multi' => '1', 'auto_hopper_level' => '0', 'auto_trim_hopper' => 'Y', 'api_manual_dial' => 'STANDARD', 'manual_dial_call_time_check' => 'DISABLED', 'display_leads_count' => 'Y', 'lead_order_randomize' => 'N', 'lead_order_secondary' => 'LEAD_ASCEND', 'per_call_notes' => 'DISABLED', 'my_callback_option' => 'CHECKED', 'agent_lead_search' => 'DISABLED', 'agent_lead_search_method' => 'CAMPLISTS_ALL', 'queuemetrics_phone_environment' => '', 'auto_pause_precall' => 'Y', 'auto_pause_precall_code' => 'PRECAL', 'auto_resume_precall' => 'N', 'manual_dial_cid' => 'CAMPAIGN', 'post_phone_time_diff_alert' => 'DISABLED', 'custom_3way_button_transfer' => 'PARK_PRESET_1', 'available_only_tally_threshold' => 'DISABLED', 'available_only_tally_threshold_agents' => '0', 'dial_level_threshold' => 'DISABLED', 'dial_level_threshold_agents' => '0', 'safe_harbor_audio' => 'buzz', 'safe_harbor_menu_id' => '', 'survey_menu_id' => '', 'callback_days_limit' => '0', 'dl_diff_target_method' => 'ADAPT_CALC_ONLY', 'disable_dispo_screen' => 'DISPO_ENABLED', 'disable_dispo_status' => '', 'screen_labels' => '--SYSTEM-SETTINGS--', 'status_display_fields' => 'CALLID', 'na_call_url' => '', 'survey_recording' => 'N', 'pllb_grouping' => 'DISABLED', 'pllb_grouping_limit' => '50', 'call_count_limit' => '0', 'call_count_target' => '3', 'callback_hours_block' => '0', 'callback_list_calltime' => 'DISABLED', 'user_group' => '---ALL---', 'hopper_vlc_dup_check' => 'N', 'in_group_dial' => 'DISABLED', 'in_group_dial_select' => 'CAMPAIGN_SELECTED', 'safe_harbor_audio_field' => 'DISABLED', 'pause_after_next_call' => 'DISABLED', 'owner_populate' => 'DISABLED', 'use_other_campaign_dnc' => '', 'allow_emails' => 'N', 'amd_inbound_group' => '---NONE---', 'amd_callmenu' => '---NONE---', 'survey_wait_sec' => '10', 'manual_dial_lead_id' => 'N', 'dead_max' => '0', 'dead_max_dispo' => 'DCMX', 'dispo_max' => '0', 'dispo_max_dispo' => 'DISMX', 'pause_max' => '0', 'max_inbound_calls' => '0', 'manual_dial_search_checkbox' => 'SELECTED', 'hide_call_log_info' => 'N', 'timer_alt_seconds' => '0', 'options_title' => 'Inbound - Inbound Campaign', 'list_order_mix' => 'DISABLED');
    private $outbound = array('campaign_id' => 'Outbound', 'campaign_name' => 'Outbound Campaign', 'active' => 'N', 'dial_status_a' => '', 'dial_status_b' => '', 'dial_status_c' => '', 'dial_status_d' => '', 'dial_status_e' => '', 'lead_order' => 'RANDOM', 'park_ext' => '', 'park_file_name' => '', 'web_form_address' => '', 'allow_closers' => 'Y', 'hopper_level' => '100', 'auto_dial_level' => '3.5', 'next_agent_call' => 'longest_wait_time', 'local_call_time' => '9am-9pm', 'voicemail_ext' => '', 'dial_timeout' => '45', 'dial_prefix' => '9', 'campaign_cid' => '8003824913', 'campaign_vdad_exten' => '8369', 'campaign_rec_exten' => '8309', 'campaign_recording' => 'ALLFORCE', 'campaign_rec_filename' => 'FULLDATE_CUSTPHONE', 'campaign_script' => '', 'get_call_launch' => 'NONE', 'am_message_exten' => 'vm-goodbye', 'amd_send_to_vmx' => 'N', 'xferconf_a_dtmf' => '', 'xferconf_a_number' => '', 'xferconf_b_dtmf' => '', 'xferconf_b_number' => '', 'alt_number_dialing' => 'Y', 'scheduled_callbacks' => 'Y', 'lead_filter_id' => 'NONE', 'drop_call_seconds' => '5', 'drop_action' => 'AUDIO', 'safe_harbor_exten' => '8307', 'display_dialable_count' => 'Y', 'wrapup_seconds' => '0', 'wrapup_message' => 'Wrapup Call', 'closer_campaigns' => ' AGENTDIRECT -', 'use_internal_dnc' => 'Y', 'allcalls_delay' => '0', 'omit_phone_code' => 'N', 'dial_method' => 'RATIO', 'available_only_ratio_tally' => 'Y', 'adaptive_dropped_percentage' => '3', 'adaptive_maximum_level' => '3.0', 'adaptive_latest_server_time' => '2100', 'adaptive_intensity' => '0', 'adaptive_dl_diff_target' => '0', 'concurrent_transfers' => 'AUTO', 'auto_alt_dial' => 'NONE', 'auto_alt_dial_statuses' => 'B N NA DC -', 'agent_pause_codes_active' => 'N', 'campaign_description' => 'Outbound Template Campaign', 'campaign_changedate' => '2014-07-10 12:17:32', 'campaign_stats_refresh' => 'N', 'campaign_logindate' => '2014-03-21 11:55:58', 'dial_statuses' => 'PDROP XDROP NA N DROP B AFTHRS AB AA A NEW -', 'disable_alter_custdata' => 'N', 'no_hopper_leads_logins' => 'Y', 'list_order_mix' => 'DISABLED', 'campaign_allow_inbound' => 'Y', 'manual_dial_list_id' => '998', 'default_xfer_group' => 'SALES_INBOUND', 'xfer_groups' => ' AGENTDIRECT SALES_INBOUND -', 'queue_priority' => '50', 'drop_inbound_group' => '---NONE---', 'qc_enabled' => 'N', 'qc_statuses' => '', 'qc_lists' => '', 'qc_shift_id' => '24HRMIDNIGHT', 'qc_get_record_launch' => 'NONE', 'qc_show_recording' => 'Y', 'qc_web_form_address' => '', 'qc_script' => '', 'survey_first_audio_file' => 'US_pol_survey_hello', 'survey_dtmf_digits' => '1238', 'survey_ni_digit' => '8', 'survey_opt_in_audio_file' => 'US_pol_survey_transfer', 'survey_ni_audio_file' => 'US_thanks_no_contact', 'survey_method' => 'AGENT_XFER', 'survey_no_response_action' => 'OPTIN', 'survey_ni_status' => 'NI', 'survey_response_digit_map' => '1-DEMOCRAT|2-REPUBLICAN|3-INDEPENDANT|8-OPTOUT|X-NO RESPONSE|', 'survey_xfer_exten' => '8300', 'survey_camp_record_dir' => '/home/survey', 'disable_alter_custphone' => 'Y', 'display_queue_count' => 'Y', 'manual_dial_filter' => 'NONE', 'agent_clipboard_copy' => 'NONE', 'agent_extended_alt_dial' => 'N', 'use_campaign_dnc' => 'Y', 'three_way_call_cid' => 'CUSTOMER', 'three_way_dial_prefix' => '87', 'web_form_target' => 'vdcwebform', 'vtiger_search_category' => 'LEAD', 'vtiger_create_call_record' => 'Y', 'vtiger_create_lead_record' => 'Y', 'vtiger_screen_login' => 'Y', 'cpd_amd_action' => 'DISABLED', 'agent_allow_group_alias' => 'N', 'default_group_alias' => '', 'vtiger_search_dead' => 'ASK', 'vtiger_status_call' => 'N', 'survey_third_digit' => '', 'survey_third_audio_file' => 'US_thanks_no_contact', 'survey_third_status' => 'NI', 'survey_third_exten' => '8300', 'survey_fourth_digit' => '', 'survey_fourth_audio_file' => 'US_thanks_no_contact', 'survey_fourth_status' => 'NI', 'survey_fourth_exten' => '8300', 'drop_lockout_time' => '0', 'quick_transfer_button' => 'N', 'prepopulate_transfer_preset' => 'N', 'drop_rate_group' => 'DISABLED', 'view_calls_in_queue' => 'ALL', 'view_calls_in_queue_launch' => 'MANUAL', 'grab_calls_in_queue' => 'Y', 'call_requeue_button' => 'N', 'pause_after_each_call' => 'N', 'no_hopper_dialing' => 'N', 'agent_dial_owner_only' => 'NONE', 'agent_display_dialable_leads' => 'N', 'web_form_address_two' => '', 'waitforsilence_options' => '', 'agent_select_territories' => '', 'caldate' => '', 'crm_popup_login' => 'N', 'crm_login_address' => '', 'timer_action' => 'NONE', 'timer_action_message' => '', 'timer_action_seconds' => '1', 'start_call_url' => '', 'dispo_call_url' => '', 'xferconf_c_number' => '', 'xferconf_d_number' => '', 'xferconf_e_number' => '', 'use_custom_cid' => 'N', 'scheduled_callbacks_alert' => 'BLINK_RED_DEFER', 'queuemetrics_callstatus_override' => 'DISABLED', 'extension_appended_cidname' => 'N', 'scheduled_callbacks_count' => 'ALL_ACTIVE', 'manual_dial_override' => 'NONE', 'blind_monitor_warning' => 'DISABLED', 'blind_monitor_message' => 'Someone is blind monitoring your session', 'blind_monitor_filename' => '', 'inbound_queue_no_dial' => 'DISABLED', 'timer_action_destination' => '', 'enable_xfer_presets' => 'ENABLED', 'hide_xfer_number_to_dial' => 'DISABLED', 'manual_dial_prefix' => '88', 'customer_3way_hangup_logging' => 'ENABLED', 'customer_3way_hangup_seconds' => '5', 'customer_3way_hangup_action' => 'NONE', 'ivr_park_call' => 'DISABLED', 'ivr_park_call_agi' => '', 'manual_preview_dial' => 'PREVIEW_AND_SKIP', 'realtime_agent_time_stats' => 'CALLS_WAIT_CUST_ACW_PAUSE', 'use_auto_hopper' => 'Y', 'auto_hopper_multi' => '1', 'auto_hopper_level' => '0', 'auto_trim_hopper' => 'Y', 'api_manual_dial' => 'STANDARD', 'manual_dial_call_time_check' => 'DISABLED', 'display_leads_count' => 'Y', 'lead_order_randomize' => 'N', 'lead_order_secondary' => 'LEAD_ASCEND', 'per_call_notes' => 'DISABLED', 'my_callback_option' => 'CHECKED', 'agent_lead_search' => 'DISABLED', 'agent_lead_search_method' => 'CAMPLISTS_ALL', 'queuemetrics_phone_environment' => '', 'auto_pause_precall' => 'Y', 'auto_pause_precall_code' => 'PRECAL', 'auto_resume_precall' => 'N', 'manual_dial_cid' => 'CAMPAIGN', 'post_phone_time_diff_alert' => 'DISABLED', 'custom_3way_button_transfer' => 'PARK_PRESET_1', 'available_only_tally_threshold' => 'DISABLED', 'available_only_tally_threshold_agents' => '0', 'dial_level_threshold' => 'DISABLED', 'dial_level_threshold_agents' => '0', 'safe_harbor_audio' => 'buzz', 'safe_harbor_menu_id' => '', 'survey_menu_id' => '', 'callback_days_limit' => '0', 'dl_diff_target_method' => 'ADAPT_CALC_ONLY', 'disable_dispo_screen' => 'DISPO_ENABLED', 'disable_dispo_status' => '', 'screen_labels' => '--SYSTEM-SETTINGS--', 'status_display_fields' => 'CALLID', 'na_call_url' => '', 'survey_recording' => 'N', 'pllb_grouping' => 'DISABLED', 'pllb_grouping_limit' => '50', 'call_count_limit' => '0', 'call_count_target' => '3', 'callback_hours_block' => '0', 'callback_list_calltime' => 'DISABLED', 'user_group' => '---ALL---', 'hopper_vlc_dup_check' => 'N', 'in_group_dial' => 'DISABLED', 'in_group_dial_select' => 'CAMPAIGN_SELECTED', 'safe_harbor_audio_field' => 'DISABLED', 'pause_after_next_call' => 'DISABLED', 'owner_populate' => 'DISABLED', 'use_other_campaign_dnc' => '', 'allow_emails' => 'N', 'amd_inbound_group' => '---NONE---', 'amd_callmenu' => '---NONE---', 'survey_wait_sec' => '10', 'manual_dial_lead_id' => 'N', 'dead_max' => '0', 'dead_max_dispo' => 'DCMX', 'dispo_max' => '0', 'dispo_max_dispo' => 'DISMX', 'pause_max' => '0', 'max_inbound_calls' => '0', 'manual_dial_search_checkbox' => 'SELECTED', 'hide_call_log_info' => 'N', 'timer_alt_seconds' => '0', 'options_title' => 'Outbound - Outbound Campaign', 'list_order_mix' => 'DISABLED');

    /**
     * CampaignController construct
     *
     * @return void
     */
    public function __construct() {
        $this->middleware('is_superadmin');
    }

    /**
     * List of all campaigns
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws \App\Http\Controllers\Inbound\Exception
     */
    public function index(Request $request) {
        try {

            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $campaign_id = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_CAMPAIGN, ACCESS_READ, $current_company_id, $user);
            $limit = $request->get('limit') ?: \Config::get("configs.pagination_limit");
            $search = $request->get('search') ?: NULL;

            $campaigns = VicidialCampaign::campaignsList($campaign_id, $search, $limit);
            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $campaigns]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Active | De-active campaign
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function activeOrDeactive(Request $request) {
        try {

            Validator::make($request->all(), [
                'campaign_id' => 'required'
            ])->validate();
            $campaign_id = $request->campaign_id;
            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $campaign_id_arr = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_CAMPAIGN, ACCESS_UPDATE, $current_company_id, $user);
            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE, $current_company_id, $user);

            if ((!in_array($campaign_id, $campaign_id_arr)) || (!in_array(SYSTEM_COMPONENT_CAMPAIGN_CAMPAIGN, $access_permissions))) {
                throw new Exception('Cannot update campaigns, you might not have permission to do this.', 400);
            }

            $campaign = VicidialCampaign::find($campaign_id);
            if ($campaign instanceof VicidialCampaign) {
                $campaign->active = $request->get('status');
                $campaign->save();
            }

            $message = ($request->get('status') == "Y" ) ? "Campaign Activated Successfully." : "Campaign Deactivated Successfully.";
            return response()->json(['status' => 200, 'msg' => $message]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Generate campaign new id
     *
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function generateCampaignId(Request $request) {
        try {

            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_CAMPAIGN, ACCESS_CREATE, $current_company_id, $user);
            if ((!in_array(ACCESS_LINKID_ALL, $access_permissions))) {
                throw new Exception('Cannot create campaigns, you might not have permission to do this.', 400);
            }

            $is_exists = true;
            while ($is_exists) {
                $campaign_id = rand(1000, 10000000);
                $is_campaign_exists = VicidialCampaign::where('campaign_id', $campaign_id)->count();
                if ($is_campaign_exists === 0) {
                    $is_exists = false;
                    return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $campaign_id]);
                }
            }
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Campaign clone
     *
     * @param Request $request
     * @throws Exception
     */
    public function campaignClone(CampaignCloneRequest $request) {
        try {

            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $prev_campaign_id = $request->from_id;
            $campaign_id = $request->campaign_id;
            Validator::make($request->all(), [
                'campaign_id' => 'required'
            ])->validate();

            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_CREATE, $current_company_id, $user);

            if (!in_array(SYSTEM_COMPONENT_CAMPAIGN_CAMPAIGN, $access_permissions)) {
                throw new Exception('Cannot clone campaign, you might not have permission to do this.', 400);
            }

            if (!VicidialCampaign::ALLOW_ACTION) {
                throw new Exception('Cloning for this table is not allowed', 400);
            }

            $from_campaign = VicidialCampaign::find($prev_campaign_id);
            if (!$from_campaign instanceof VicidialCampaign) {
                throw new Exception('We can not locate your campaign, please check your input.', 400);
            }

            VicidialCampaignStat::create(['campaign_id' => $campaign_id]);
            VicidialCampaignStatsDebug::create(['campaign_id' => $campaign_id]);

            $new_xfer_preset = VicidialXferPreset::find($prev_campaign_id);
            if ($new_xfer_preset instanceof VicidialXferPreset) {
                $new_xfer_preset = $new_xfer_preset->replicate();
                $new_xfer_preset->campaign_id = $campaign_id;
                $new_xfer_preset->save();
            }

            $new_pause_code = VicidialPauseCode::find($prev_campaign_id);
            if ($new_pause_code instanceof VicidialPauseCode) {
                $new_pause_code = $new_pause_code->replicate();
                $new_pause_code->campaign_id = $campaign_id;
                $new_pause_code->save();
            }

            $new_lead_recycle = VicidialLeadRecycle::where('campaign_id', $prev_campaign_id)->first();
            if ($new_lead_recycle instanceof VicidialLeadRecycle) {
                $new_lead_recycle = $new_lead_recycle->replicate();
                $new_lead_recycle->campaign_id = $campaign_id;
                $new_lead_recycle->save();
            }

            $new_campaign_cid_areacode = VicidialCampaignCidAreacode::find($prev_campaign_id);
            if ($new_campaign_cid_areacode instanceof VicidialCampaignCidAreacode) {
                $new_campaign_cid_areacode = $new_campaign_cid_areacode->replicate();
                $new_campaign_cid_areacode->campaign_id = $campaign_id;
                $new_campaign_cid_areacode->save();
            }

            $new_campaign_status = VicidialCampaignStatuses::find($prev_campaign_id);
            if ($new_campaign_status instanceof VicidialCampaignStatuses) {
                $new_campaign_status = $new_campaign_status->replicate();
                $new_campaign_status->campaign_id = $campaign_id;
                $new_campaign_status->save();
            }

            $new_campaign = $from_campaign->replicate();
            $new_campaign->campaign_id = $campaign_id;
            $new_campaign->save();

            // Add full permission to user after create
            $x5_contact_access['model'] = ACCESS_MODEL_CONTACT;
            $x5_contact_access['foreign_key'] = $user->x5_contact_id;
            $x5_contact_access['type'] = ACCESS_TYPE_SYSTEM_COMPONENT;
            $x5_contact_access['link_id'] = $new_campaign->campaign_id;
            $x5_contact_access['_create'] = 0;
            $x5_contact_access['_read'] = 1;
            $x5_contact_access['_update'] = 1;
            $x5_contact_access['_delete'] = 1;
            X5ContactAccess::insert($x5_contact_access);

            // Admin log
            $admin_log_data['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log_data['user'] = $user->x5_contact_id;
            $admin_log_data['ip_address'] = $this->clientIp();
            $admin_log_data['event_section'] = "CAMPAIGNS";
            $admin_log_data['event_type'] = "COPY";
            $admin_log_data['record_id'] = $campaign_id;
            $admin_log_data['event_code'] = "ADMIN COPY CAMPAIGN";
            $admin_log_data['event_sql'] = "INSERT INTO vicidial_campaigns SET campaign_name = $new_campaign->campaign_name, campaign_description = $new_campaign->campaign_description, active = $new_campaign->active, park_file_name = $new_campaign->park_file_name, web_form_address = $new_campaign->web_form_address, web_form_address_two = $new_campaign->web_form_address_two, dial_statuses = $new_campaign->dial_statuses";
            $admin_log_data['event_notes'] = "";
            $admin_log_data['user_group'] = "";

            VicidialAdminLog::insert($admin_log_data);

            return response()->json(['status' => 200, 'msg' => 'Success']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Check campaign exists
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function isExistsCampaign(Request $request) {
        try {

            $campaign_id = $request->campaign_id;
            Validator::make($request->all(), [
                'campaign_id' => 'required'
            ])->validate();
            $is_exists = VicidialCampaign::find($campaign_id);
            if ($is_exists instanceof VicidialCampaign) {
                throw new Exception('Campaign ID already exists.', 400);
            }
            return response()->json(['status' => 200, 'msg' => 'Success']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Campaign wizard
     *
     * @param Request $request
     * @return type
     * @throws Exception
     */
    public function campaignWizard(CampaignWizardRequest $request) {
        try {

            $data = $request->all();
            Validator::make($request->all(), [
                'campaign_id' => 'required'
            ])->validate();
            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_CAMPAIGN, ACCESS_CREATE, $current_company_id, $user);
            if (!in_array(ACCESS_LINKID_ALL, $access_permissions)) {
                throw new Exception('Cannot create campaign, you might not have permission to do this.', 400);
            }

            $campaign_wizard_data['campaign_allow_inbound'] = $data['campaign_allow_inbound'];
            $campaign_wizard_data['campaign_id'] = $data['campaign_id'];
            $campaign_wizard_data['campaign_name'] = $data['campaign_name'];
            $campaign_wizard_data['campaign_cid'] = isset($data['campaign_cid']) ? $data['campaign_cid'] : "";
            $campaign_wizard_data['auto_dial_level'] = isset($data['auto_dial_level']) ? $data['auto_dial_level'] : "";
            $campaign_wizard_data['local_call_time'] = isset($data['local_call_time']) ? $data['local_call_time'] : "";
            $campaign_wizard_data['campaign_vdad_exten'] = isset($data['campaign_vdad_exten']) ? $data['campaign_vdad_exten'] : "";
            $campaign_wizard_data['campaign_recording'] = isset($data['campaign_recording']) ? $data['campaign_recording'] : "";
            $campaign_wizard_data['campaign_script'] = isset($data['campaign_script']) ? $data['campaign_script'] : "";
            $campaign_wizard_data['agent_pause_codes_active'] = isset($data['agent_pause_codes_active']) ? $data['agent_pause_codes_active'] : "";
            $campaign_wizard_data['active'] = 'Y';
            $campaign_wizard_data['use_internal_dnc'] = 'Y';
            $campaign_wizard_data['use_campaign_dnc'] = 'Y';
            $campaign_wizard_data['lead_order'] = 'DOWN';

            if ($campaign_wizard_data['campaign_allow_inbound'] == 'Y') {
                unset($campaign_wizard_data['auto_dial_level']);
                $save_data = array_merge($this->inbound, $campaign_wizard_data);
            } else {
                $save_data = array_merge($this->outbound, $campaign_wizard_data);
            }

            // Admin log
            $admin_log_data['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log_data['user'] = $user->x5_contact_id;
            $admin_log_data['ip_address'] = $this->clientIp();
            $admin_log_data['event_section'] = "CAMPAIGNS";
            $admin_log_data['event_type'] = "ADD";
            $admin_log_data['record_id'] = $save_data['campaign_id'];
            $admin_log_data['event_code'] = "ADMIN CAMPAIGN ADD";
            $admin_log_data['event_sql'] = "INSERT INTO vicidial_campaigns (campaign_id,campaign_name,campaign_description,active,dial_status_a,lead_order,park_ext,park_file_name,web_form_address,allow_closers,hopper_level,auto_dial_level,next_agent_call,local_call_time,voicemail_ext,campaign_script,get_call_launch,campaign_changedate,campaign_stats_refresh,list_order_mix,web_form_address_two,start_call_url,dispo_call_url,na_call_url,user_group) values('" . $save_data['campaign_id'] . "','" . $save_data['campaign_name'] . "','" . $save_data['campaign_description'] . "','" . $save_data['active'] . "','NEW','DOWN','" . $save_data['park_ext'] . "','" . $save_data['park_file_name'] . "','" . $save_data['web_form_address'] . "','" . $save_data['allow_closers'] . "','" . $save_data['hopper_level'] . "','" . $save_data['auto_dial_level'] . "','" . $save_data['next_agent_call'] . "','" . $save_data['local_call_time'] . "','" . $save_data['voicemail_ext'] . "','" . $save_data['campaign_script'] . "','" . $save_data['get_call_launch'] . "','" . $admin_log_data['event_date'] . "','Y','DISABLED','','','','','" . $save_data['user_group'] . "'";
            $admin_log_data['event_notes'] = "";
            $admin_log_data['user_group'] = "";

            unset($save_data['options_title']);
            unset($save_data['caldate']);
            VicidialCampaign::insert($save_data);
            VicidialAdminLog::insert($admin_log_data);

            return response()->json(["status" => 200, "msg" => "We have created your new campaign! Your new Campaign ID is : " . $data['campaign_id']]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Campaign wizard options list
     *
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function campaignWizardOptionsLists() {
        try {

            $lists['alldids'] = VicidialInboundDid::select('did_pattern')->selectRaw("CONCAT(did_pattern, ' - ', did_description) as option_title")->whereRaw('LENGTH(did_pattern) > 9')->get();
            $lists['allscript'] = VicidialScript::orderBy('script_name')->get(['script_id', 'script_name']);
            $lists['allshifts'] = VicidialCallTime::orderBy('call_time_name')->get(['call_time_id', 'call_time_name']);
            $auto_dial_limit = SystemSetting::pluck('auto_dial_limit')->first();
            $lists['auto_dial_limit'] = $this->autoDialLimit($auto_dial_limit);

            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $lists]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Get disabled statuses
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function disabledStatusesList(Request $request) {
        try {

            $campaign_id = $request->campaign_id;
            Validator::make($request->all(), [
                'campaign_id' => 'required'
            ])->validate();
            $disabled_statuses = VicidialCampaign::select('dial_statuses')->where('campaign_id', $campaign_id)->first();
            if (!$disabled_statuses instanceof VicidialCampaign) {
                throw new Exception("We can not locate your campaign, please check your input.", 400);
            }
            $data = explode(" ", $disabled_statuses->dial_statuses);
            $statuses = VicidialStatuses::select('status')->selectRaw('CONCAT(status, " - ", status_name) as options_title')->orderBy('status')->get();
            $campaign_statuses = VicidialCampaignStatuses::select('status', 'status_name')->orderBy('status')->get();

            if ($statuses) {
                foreach ($statuses as $key => $status) {
                    if (in_array($status->status, $data)) {
                        $status->is_check = true;
                    } else {
                        $status->is_check = false;
                    }
                }
            }

            if ($campaign_statuses) {
                foreach ($campaign_statuses as $key => $campaign_status) {
                    if (in_array($campaign_status->status, $data)) {
                        $campaign_status->is_check = true;
                    } else {
                        $campaign_status->is_check = false;
                    }
                }
            }
            $statuses = $statuses->merge($campaign_statuses);

            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $statuses]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Update disabled statuses list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function disabledStatusesListUpdate(Request $request) {
        try {

            $campaign_id = $request->campaign_id;
            Validator::make($request->all(), [
                'campaign_id' => 'required'
            ])->validate();
            $dial_statuses = $request->dial_statuses;
            $dial_statuses = (count($dial_statuses) > 0) ? implode(" ", $dial_statuses) : "";
            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $campaign_id_arr = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_CAMPAIGN, ACCESS_UPDATE, $current_company_id, $user);
            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE, $current_company_id, $user);

            if ((!in_array($campaign_id, $campaign_id_arr)) || (!in_array(SYSTEM_COMPONENT_CAMPAIGN_CAMPAIGN, $access_permissions))) {
                throw new Exception('Cannot update campaigns, you might not have permission to do this.', 400);
            }

            $campaign = VicidialCampaign::find($campaign_id);
            $campaign->dial_statuses = " " . $dial_statuses . " -";
            $campaign->save();

            $this->ytelExtraSettings($campaign_id, $request);

            // Admin log
            $admin_log_data['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log_data['user'] = $user->x5_contact_id;
            $admin_log_data['ip_address'] = $this->clientIp();
            $admin_log_data['event_section'] = "CAMPAIGNS";
            $admin_log_data['event_type'] = "MODIFY";
            $admin_log_data['record_id'] = $campaign_id;
            $admin_log_data['event_code'] = "MODIFY";
            $admin_log_data['event_sql'] = "UPDATE vicidial_campaigns SET campaign_name='',campaign_description='',active='',park_file_name='',web_form_address='',web_form_address_two='',dial_statuses='$campaign->dial_statuses' ,lead_order='',list_order_mix='',call_count_limit='',dial_method='' ,auto_dial_level='',next_agent_call='',local_call_time='',dial_timeout='' ,campaign_cid='',use_custom_cid='',campaign_vdad_exten='',voicemail_ext='' ,campaign_recording='',campaign_rec_filename='',per_call_notes='',call_count_limit='' ,agent_lead_search='',agent_lead_search_method='',campaign_script='',get_call_launch='' ,am_message_exten='',enable_xfer_presets='',quick_transfer_button='',custom_3way_button_transfer='' ,prepopulate_transfer_preset='',scheduled_callbacks='',scheduled_callbacks_alert='',scheduled_callbacks_count='' ,drop_call_seconds='',drop_action='',safe_harbor_audio='',use_internal_dnc='' ,lead_order='',list_order_mix='',call_count_limit='',call_count_limit='' ,use_campaign_dnc='',screen_labels='',display_queue_count='',view_calls_in_queue='' ,view_calls_in_queue_launch='',grab_calls_in_queue='',three_way_call_cid='',closer_campaigns='' ,default_xfer_group='',xfer_groups='',xferconf_a_number='' WHERE campaign_id='$campaign_id'";
            $admin_log_data['event_notes'] = "";
            $admin_log_data['user_group'] = "";

            VicidialAdminLog::insert($admin_log_data);

            // X5 log
            $x5_log_data['change_datetime'] = $admin_log_data['event_date'];
            $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
            $x5_log_data['company_id'] = $user->company_id;
            $x5_log_data['user_ip'] = $this->clientIp();
            $x5_log_data['class'] = "CampaignsController";
            $x5_log_data['method'] = __FUNCTION__;
            $x5_log_data['model'] = VicidialCampaign::class;
            $x5_log_data['action_1'] = "MODIFY";

            X5Log::insert($x5_log_data);

            return response()->json(['status' => 200, 'msg' => 'Record successfully modified.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Inbound list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function inboundList(Request $request) {
        try {

            $campaign_id = $request->campaign_id;
            Validator::make($request->all(), [
                'campaign_id' => 'required'
            ])->validate();
            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $campaign_id_arr = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_CAMPAIGN, ACCESS_READ, $current_company_id, $user);

            if (!in_array($campaign_id, $campaign_id_arr)) {
                throw new Exception('Cannot access campaign, you might not have permission to do this.', 400);
            }

            $inbound_list = VicidialInboundGroup::get(['group_id', 'group_name']);
            $campaign = VicidialCampaign::where('campaign_id', $campaign_id)->select('closer_campaigns', 'xfer_groups', 'default_xfer_group')->first();
            $default_xfer_group = $campaign->default_xfer_group ?: "";
            $closer_campaigns = $campaign->closer_campaigns ? explode(" ", $campaign->closer_campaigns) : [];
            $xfer_groups = $campaign->xfer_groups ? explode(" ", $campaign->xfer_groups) : [];
            if ($inbound_list) {
                foreach ($inbound_list as $inbound) {
                    $inbound->default_xfer_group = false;
                    $inbound->closer_campaigns = false;
                    $inbound->xfer_groups = false;
                    if ($inbound->group_id === $default_xfer_group) {
                        $inbound->default_xfer_group = true;
                    }
                    if (in_array($inbound->group_id, $closer_campaigns)) {
                        $inbound->closer_campaigns = true;
                    }
                    if (in_array($inbound->group_id, $xfer_groups)) {
                        $inbound->xfer_groups = true;
                    }
                }
            }

            $result_array['default_xfer_group'] = $default_xfer_group;
            $result_array['inbound_list'] = $inbound_list;

            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $result_array]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Update inbound list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function inboundListUpdate(Request $request) {
        try {

            $campaign_id = $request->campaign_id;
            Validator::make($request->all(), [
                'campaign_id' => 'required'
            ])->validate();
            $default_xfer_group = $request->default_xfer_group;
            $xfer_groups = $request->xfer_groups ? implode(" ", $request->xfer_groups) : "";
            $closer_campaigns = $request->closer_campaigns ? implode(" ", $request->closer_campaigns) : "";
            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $campaign_id_arr = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_CAMPAIGN, ACCESS_UPDATE, $current_company_id, $user);
            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE, $current_company_id, $user);

            if ((!in_array($campaign_id, $campaign_id_arr)) || (!in_array(SYSTEM_COMPONENT_CAMPAIGN_CAMPAIGN, $access_permissions))) {
                throw new Exception('Cannot update campaigns, you might not have permission to do this.', 400);
            }

            $campaign = VicidialCampaign::find($campaign_id);
            $campaign->closer_campaigns = " " . $closer_campaigns . " -";
            $campaign->xfer_groups = " " . $xfer_groups . " -";
            $campaign->default_xfer_group = $default_xfer_group;
            $campaign->save();

            $this->ytelExtraSettings($campaign_id, $request);

            // Admin log
            $admin_log_data['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log_data['user'] = $user->x5_contact_id;
            $admin_log_data['ip_address'] = $this->clientIp();
            $admin_log_data['event_section'] = "CAMPAIGNS";
            $admin_log_data['event_type'] = "MODIFY";
            $admin_log_data['record_id'] = $campaign_id;
            $admin_log_data['event_code'] = "MODIFY";
            $admin_log_data['event_sql'] = "UPDATE vicidial_campaigns SET campaign_name='',campaign_description='',active='',park_file_name='',web_form_address='',web_form_address_two='',dial_statuses='' ,lead_order='',list_order_mix='',call_count_limit='',dial_method='' ,auto_dial_level='',next_agent_call='',local_call_time='',dial_timeout='' ,campaign_cid='',use_custom_cid='',campaign_vdad_exten='',voicemail_ext='' ,campaign_recording='',campaign_rec_filename='',per_call_notes='',call_count_limit='' ,agent_lead_search='',agent_lead_search_method='',campaign_script='',get_call_launch='' ,am_message_exten='',enable_xfer_presets='',quick_transfer_button='',custom_3way_button_transfer='' ,prepopulate_transfer_preset='',scheduled_callbacks='',scheduled_callbacks_alert='',scheduled_callbacks_count='' ,drop_call_seconds='',drop_action='',safe_harbor_audio='',use_internal_dnc='' ,lead_order='',list_order_mix='',call_count_limit='',call_count_limit='' ,use_campaign_dnc='',screen_labels='',display_queue_count='',view_calls_in_queue='' ,view_calls_in_queue_launch='',grab_calls_in_queue='',three_way_call_cid='',closer_campaigns='$campaign->closer_campaigns' ,default_xfer_group='$campaign->default_xfer_group',xfer_groups='$campaign->$campaign->closer_campaigns',xferconf_a_number='' WHERE campaign_id='$campaign_id'";
            $admin_log_data['event_notes'] = "";
            $admin_log_data['user_group'] = "";

            VicidialAdminLog::insert($admin_log_data);

            // X5 log
            $x5_log_data['change_datetime'] = $admin_log_data['event_date'];
            $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
            $x5_log_data['company_id'] = $user->company_id;
            $x5_log_data['user_ip'] = $this->clientIp();
            $x5_log_data['class'] = "CampaignsController";
            $x5_log_data['method'] = __FUNCTION__;
            $x5_log_data['model'] = VicidialCampaign::class;
            $x5_log_data['action_1'] = "MODIFY";

            X5Log::insert($x5_log_data);

            return response()->json(['status' => 200, 'msg' => 'Record Updated Successfully.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Get hopper list
     *
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function hopperList(Request $request) {
        try {

            $campaign_id = $request->campaign_id;
            Validator::make($request->all(), [
                'campaign_id' => 'required'
            ])->validate();
            $hoppers = VicidialHopper::findAll($campaign_id);

            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $hoppers]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Reset hopper list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function resetHopperList(Request $request) {
        try {

            $user = $request->user();
            $campaign_id = $request->campaign_id;
            Validator::make($request->all(), [
                'campaign_id' => 'required'
            ])->validate();

            $hopper = VicidialHopper::where('campaign_id', $campaign_id)->first();
            if ($hopper instanceof VicidialHopper) {
                $hopper->delete();

                // Admin log
                $admin_log = new VicidialAdminLog();
                $admin_log->event_date = \Carbon\Carbon::now()->toDateTimeString();
                $admin_log->user = $user->x5_contact_id;
                $admin_log->ip_address = $this->clientIp();
                $admin_log->event_section = "CAMPAIGNS";
                $admin_log->event_type = "RESET";
                $admin_log->record_id = $campaign_id;
                $admin_log->event_code = "ADMIN RESET CAMPAIGN LEAD HOPPER";
                $admin_log->event_sql = "DELETE FROM vicidial_hopper where campaign_id='" . $campaign_id . "'";
                $admin_log->event_notes = "";
                $admin_log->user_group = "";
                $admin_log->save();
            }

            return response()->json(["status" => 200, "msg" => "Hopper List for Campaign $campaign_id has been reset."]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Callback list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function callBacklist(Request $request) {
        try {

            Validator::make($request->all(), [
                'campaign_id' => 'required'
            ])->validate();
            $limit = $request->get('limit') ?: \Config::get("configs.pagination_limit");
            $search = $request->get('search') ?: NULL;
            $data['agent_type'] = 'campaign_id';
            $data['agent'] = $request->input('campaign_id');
            $data['message'] = 'Campaign Callback list';
            if ($request->has('user')) {
                $data['agent_type'] = 'user';
                $data['agent'] = $request->input('user');
                $data['message'] = 'User Callback list';
            }
            $result_data['callbacks'] = \App\VicidialCallback::findAll($data, $search, $limit);
            $user_not_in = ['VDAD', 'VDCL', '6666'];
            $result_data['users'] = \App\VicidialUsers::whereNotIn('user', $user_not_in)->where('user_level', '<>', 9)->orderBy('user')->get(['user']);

            return response()->json(['status' => 200, 'msg' => $data['message'], 'data' => $result_data]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    /**
     * Delete campaign callback
     *
     * @param Request $request
     * @throws type
     */
    public function callBackDelete(Request $request) {
        try {

            $user = $request->user();
            $callback_id_array = $request->callback_ids;
            if (count($callback_id_array) === 0) {
                throw new Exception('Please select check box to delete a record.', 400);
            }
            \App\VicidialCallback::whereIn('callback_id', $callback_id_array)->update(['status' => 'INACTIVE']);

            // Admin log
            $admin_log = new VicidialAdminLog();
            $admin_log->event_date = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log->user = $user->x5_contact_id;
            $admin_log->ip_address = $this->clientIp();
            $admin_log->event_section = "USER";
            $admin_log->event_type = "DELETE";
            $admin_log->record_id = $callback_id_array[0];
            $admin_log->event_code = "USER DELETE CALLBACK";
            $admin_log->event_sql = "UPDATE vicidial_callbacks SET status='INACTIVE' where callback_id='$callback_id_array[0]'";
            $admin_log->event_notes = "";
            $admin_log->user_group = "";
            $admin_log->save();

            return response()->json(['status' => 200, 'msg' => 'Record Deleted Successfully']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    /**
     * Move callback
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function callBackMove(Request $request) {
        try {

            $user = $request->user();
            $callback_id_array = $request->callback_ids;
            $agent = $request->agent;
            $movetouser = $request->movetouser;
            $event_sql = "";

            Validator::make($request->all(), [
                'agent' => 'required',
                'callback_ids' => 'required'
                    ], [
                'agent.required' => 'Please select agent for move the callbacks.',
                'callback_ids.required' => 'Please select check box to Move a record.',
            ])->validate();

            if (isset($movetouser) && $movetouser) {
                \App\VicidialCallback::whereIn('callback_id', $callback_id_array)->update(['user' => $movetouser]);
                $event_sql = "UPDATE vicidial_callbacks SET user='$movetouser' where callback_id IN($callback_id_array[0])";
            } else {
                \App\VicidialCallback::whereIn('callback_id', $callback_id_array)->update(['recipient' => $agent]);
                $event_sql = "UPDATE vicidial_callbacks SET recipient='$agent' where callback_id IN($callback_id_array[0])";
            }

            // Admin log
            $admin_log = new VicidialAdminLog();
            $admin_log->event_date = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log->user = $user->x5_contact_id;
            $admin_log->ip_address = $this->clientIp();
            $admin_log->event_section = "USER";
            $admin_log->event_type = "MODIFY";
            $admin_log->record_id = $callback_id_array[0];
            $admin_log->event_code = "USER MOVE CALLBACK";
            $admin_log->event_sql = $event_sql;
            $admin_log->event_notes = "";
            $admin_log->user_group = "";
            $admin_log->save();

            return response()->json(['status' => 200, 'msg' => 'Record has been Move to ' . $agent . ' successfully.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    /**
     * Find campaign by campaign_id
     *
     * @param Request $request
     * @throws Exception
     */
    public function edit(Request $request) {
        try {

            $campaign_id = $request->campaign_id;
            Validator::make($request->all(), [
                'campaign_id' => 'required',
            ])->validate();
            $campaign = VicidialCampaign::find($campaign_id);
            $status = ['ACTIVE', 'active'];
            if (!$campaign instanceof VicidialCampaign) {
                throw new Exception('Campaign doesn\'t exist.', 400);
            }

            $data['campaign'] = $campaign;

            $list_mix = VicidialCampaignListMix::select('vcl_id', 'vcl_name')->where('campaign_id', $campaign_id)->whereIn('status', $status)->first();
            if ($list_mix instanceof VicidialCampaignListMix) {
                $data['list_mix'] = ["ACTIVE" => "ACTIVE($list_mix->vcl_id - $list_mix->vcl_name)"];
            } else {
                $data['list_mix'] = ["DISABLED" => "DISABLED"];
            }

            $data['lead_filter'] = VicidialLeadFilter::select("lead_filter_id")->selectRaw("CONCAT(lead_filter_id, ' - ', lead_filter_name) as option_title")->orderBy("lead_filter_name")->get();
            $auto_dial_limit = SystemSetting::pluck('auto_dial_limit')->first();
            $data['auto_dial_limit'] = $this->autoDialLimit($auto_dial_limit);
            $data['dids'] = VicidialInboundDid::select('did_pattern')->selectRaw("CONCAT(did_pattern, ' - ', did_description) as option_title")->whereRaw('LENGTH(did_pattern) > 9')->get();

            $data['call_time'] = VicidialCallTime::select("call_time_id")->orderBy("call_time_id", "ASC")->get();
            $data['inbound_group'] = VicidialInboundGroup::orderBy("group_id")->where('group_id', '!=', 'AGENTDIRECT')->get(["group_id"]);
            $data['call_menu'] = \App\VicidialCallMenu::orderBy("menu_id")->get(["menu_id"]);
            $data['script'] = VicidialScript::orderBy("script_id")->get(["script_id"]);
            $data['music'] = \App\VicidialMusicOnHold::select("moh_id", "moh_name", "active", "random", "user_group")->where("remove", "N")->get();


            return response()->json(['status' => 200, 'msg' => 'Record Updated Successfully', 'data' => $data]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    /**
     * Update campaign
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function update(CampaignUpdateRequest $request) {
        try {

            $campaign_id = $request->campaign_id;
            Validator::make($request->all(), [
                'campaign_id' => 'required|exists:dyna.vicidial_campaigns,campaign_id',
                    ], [
                'campaign_id.exists' => 'We can not locate your campaign, please check your input.'
            ])->validate();
            $vm_digit = [8373, 8366];
            $non_vm_digit = [8368, 8369];
            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $campaign_id_arr = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_CAMPAIGN, ACCESS_UPDATE, $current_company_id, $user);
            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE, $current_company_id, $user);

            if ((!in_array($campaign_id, $campaign_id_arr)) || (!in_array(SYSTEM_COMPONENT_CAMPAIGN_CAMPAIGN, $access_permissions))) {
                throw new Exception('Cannot update campaigns, you might not have permission to do this.', 400);
            }

            $campaign = VicidialCampaign::find($campaign_id);
            $campaign_vdad_exten = $campaign->campaign_vdad_exten;
            if (isset($request->campaign_vdad_exten) && in_array($campaign_vdad_exten, $vm_digit) && !in_array($request->campaign_vdad_exten, $vm_digit)) {
                $request->campaign_vdad_exten = 8373;
            } else if (isset($request->campaign_vdad_exten) && in_array($campaign_vdad_exten, $non_vm_digit) && !in_array($request->campaign_vdad_exten, $non_vm_digit)) {
                $request->campaign_vdad_exten = 8368;
            }

            $campaign_data = $request->all();
            unset($campaign_data['current_company_id']);
            unset($campaign_data['current_application_dns']);
            unset($campaign_data['url']);
            VicidialCampaign::where('campaign_id', $campaign_id)->update($campaign_data);

            $this->ytelExtraSettings($campaign_id, $request);

            // Admin log
            $admin_log_data['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log_data['user'] = $user->x5_contact_id;
            $admin_log_data['ip_address'] = $this->clientIp();
            $admin_log_data['event_section'] = "CAMPAIGNS";
            $admin_log_data['event_type'] = "MODIFY";
            $admin_log_data['record_id'] = $campaign_id;
            $admin_log_data['event_code'] = "MODIFY";
            $admin_log_data['event_sql'] = "UPDATE vicidial_campaigns SET campaign_name='',campaign_description='',active='',park_file_name='',web_form_address='',web_form_address_two='',dial_statuses='' ,lead_order='',list_order_mix='',call_count_limit='',dial_method='' ,auto_dial_level='',next_agent_call='',local_call_time='',dial_timeout='' ,campaign_cid='',use_custom_cid='',campaign_vdad_exten='',voicemail_ext='' ,campaign_recording='',campaign_rec_filename='',per_call_notes='',call_count_limit='' ,agent_lead_search='',agent_lead_search_method='',campaign_script='',get_call_launch='' ,am_message_exten='',enable_xfer_presets='',quick_transfer_button='',custom_3way_button_transfer='' ,prepopulate_transfer_preset='',scheduled_callbacks='',scheduled_callbacks_alert='',scheduled_callbacks_count='' ,drop_call_seconds='',drop_action='',safe_harbor_audio='',use_internal_dnc='' ,lead_order='',list_order_mix='',call_count_limit='',call_count_limit='' ,use_campaign_dnc='',screen_labels='',display_queue_count='',view_calls_in_queue='' ,view_calls_in_queue_launch='',grab_calls_in_queue='',three_way_call_cid='',closer_campaigns='$campaign->closer_campaigns' ,default_xfer_group='$campaign->default_xfer_group',xfer_groups='$campaign->$campaign->closer_campaigns',xferconf_a_number='' WHERE campaign_id='$campaign_id'";
            $admin_log_data['event_notes'] = "";
            $admin_log_data['user_group'] = "";

            VicidialAdminLog::insert($admin_log_data);

            // X5 log
            $x5_log_data['change_datetime'] = $admin_log_data['event_date'];
            $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
            $x5_log_data['company_id'] = $user->company_id;
            $x5_log_data['user_ip'] = $this->clientIp();
            $x5_log_data['class'] = "CampaignsController";
            $x5_log_data['method'] = __FUNCTION__;
            $x5_log_data['model'] = VicidialCampaign::class;
            $x5_log_data['action_1'] = "MODIFY";

            X5Log::insert($x5_log_data);

            return response()->json(['status' => 200, 'msg' => 'Record successfully modified.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Delete campaign
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function delete(Request $request) {
        try {

            $user = $request->user();
            $campaign_id = $request->campaign_id;
            Validator::make($request->all(), [
                'campaign_id' => 'required|exists:dyna.vicidial_campaigns,campaign_id',
                    ], [
                'campaign_id.exists' => 'Campaign doesn\'t exist.'
            ])->validate();

            $campaign = VicidialCampaign::find($campaign_id);

            \App\VicidialCampaignAgent::where('campaign_id', $campaign_id)->delete();
            \App\VicidialLiveAgent::where('campaign_id', $campaign_id)->delete();
            VicidialCampaignStatuses::where('campaign_id', $campaign_id)->delete();
            \App\VicidialCampaignHotkey::where('campaign_id', $campaign_id)->delete();
            \App\VicidialCallback::where('campaign_id', $campaign_id)->delete();
            VicidialCampaignStat::where('campaign_id', $campaign_id)->delete();
            VicidialCampaignStatsDebug::where('campaign_id', $campaign_id)->delete();
            VicidialLeadRecycle::where('campaign_id', $campaign_id)->delete();
            \App\VicidialCampaignServerStat::where('campaign_id', $campaign_id)->delete();
            \App\VicidialServerTrunk::where('campaign_id', $campaign_id)->delete();
            VicidialPauseCode::where('campaign_id', $campaign_id)->delete();
            VicidialCampaignListMix::where('campaign_id', $campaign_id)->delete();
            VicidialXferPreset::where('campaign_id', $campaign_id)->delete();
            \App\VicidialXferStat::where('campaign_id', $campaign_id)->delete();
            VicidialCampaignCidAreacode::where('campaign_id', $campaign_id)->delete();
            VicidialHopper::where('campaign_id', $campaign_id)->delete();
            VicidialCampaign::where('campaign_id', $campaign_id)->delete();

            // Admin log
            $admin_log_data['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log_data['user'] = $user->x5_contact_id;
            $admin_log_data['ip_address'] = $this->clientIp();
            $admin_log_data['event_section'] = "CAMPAIGNS";
            $admin_log_data['event_type'] = "DELETE";
            $admin_log_data['record_id'] = $campaign_id;
            $admin_log_data['event_code'] = "ADMIN DELETE CAMPAIGN";
            $admin_log_data['event_sql'] = "DELETE from vicidial_campaigns where campaign_id=$campaign_id";
            $admin_log_data['event_notes'] = "";
            $admin_log_data['user_group'] = "";

            VicidialAdminLog::insert($admin_log_data);

            // X5 log
            $x5_log_data['change_datetime'] = $admin_log_data['event_date'];
            $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
            $x5_log_data['company_id'] = $user->company_id;
            $x5_log_data['user_ip'] = $this->clientIp();
            $x5_log_data['class'] = "CampaignsController";
            $x5_log_data['method'] = __FUNCTION__;
            $x5_log_data['model'] = VicidialCampaign::class;
            $x5_log_data['action_1'] = "DELETE";

            X5Log::insert($x5_log_data);

            return response()->json(['status' => 200, 'msg' => 'Record successfully deleted.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Campaign data list
     *
     * @param Request $request
     * @throws Exception
     */
    public function campaignDataList(Request $request) {
        try {

            $campaign_id = $request->campaign_id;
            Validator::make($request->all(), [
                'campaign_id' => 'required',
            ])->validate();
            $data['campaign_id'] = $campaign_id;
            $data['order_by'] = $request->order_by ?: NULL;
            $data['count'] = true;
            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_CAMPAIGN, ACCESS_READ, $current_company_id, $user);
            if (!in_array($data['campaign_id'], $access_permissions)) {
                throw new Exception('Cannot read campaign, you might not have permission to do this.', 400);
            }

            $lead_filter_sql = '';
            $admin_setting = SystemSetting::first();
            if ($admin_setting instanceof SystemSetting && $admin_setting->admin_list_counts < 1) {
                $data['count'] = false;
            }
            $list_id = VicidialLists::where('campaign_id', $data['campaign_id'])->where('active', 'Y')->pluck('list_id');
            $campaign = VicidialCampaign::select('dial_statuses', 'local_call_time', 'lead_filter_id', 'drop_lockout_time', 'call_count_limit')->where('campaign_id', $campaign_id)->first();
            if ($admin_setting->expanded_list_stats > 0) {
                $lead_filter = VicidialLeadFilter::select('lead_filter_sql')->where('lead_filter_id', $campaign->lead_filter_id)->first();
                if ($lead_filter instanceof VicidialLeadFilter) {
                    $filter_sql = preg_replace("/\\\\/", "", $lead_filter->lead_filter_sql);
                    $lead_filter_sql = preg_replace('/^and|and$|^or|or$/i', '', $filter_sql);
                    if (strlen($lead_filter_sql) > 4) {
                        $lead_filter_sql = "and ($lead_filter_sql)";
                    } else {
                        $lead_filter_sql = '';
                    }
                }
            }

            $dial_statuses1 = explode(' ', $campaign->dial_statuses);
            $statuses = VicidialStatuses::select('status', 'status_name', 'completed');
            $campaign_statuses = VicidialCampaignStatuses::select('status', 'status_name', 'completed')
                    ->where('campaign_id', $campaign_id)
                    ->union($statuses)
                    ->orderBy('status')
                    ->get();
            $statuses_list = $campaign_statuses->pluck('status_name', 'status')->toArray();
            $statuses_complete_list = $campaign_statuses->pluck('completed', 'status')->toArray();
            $result_data['status_array'] = $this->disabledAndNotDisabledStatuses($campaign, 'disabled', $admin_setting, $list_id, $lead_filter_sql, $dial_statuses1, $statuses_list, $statuses_complete_list, $access_permissions);
            $result_data['notDialed_satus'] = $this->disabledAndNotDisabledStatuses($campaign, 'not_disabled', $admin_setting, $list_id, $lead_filter_sql, $dial_statuses1, $statuses_list, $statuses_complete_list, $access_permissions);
            $result_data['notDialed_satus']['list'] = array_merge($result_data['status_array']['list'], $result_data['notDialed_satus']['list']);
            $result_data['lists'] = VicidialLists::findByCampaignId($data);
            $admin_user = \App\VicidialUsers::select('user', 'pass')->where(function ($query) {
                        $query->where('user', '=', '6666')
                                ->orWhere('user_level', '>=', 8);
                    })->first();

            $target_url = "https://" . $request->current_application_dns . "/vicidial/admin.php?ADD=34&campaign_id=" . $data['campaign_id'] . "&stage=show_dialable";
            $client = new \GuzzleHttp\Client();
            $res = $client->get($target_url, ['auth' => ['6666', 'Gooxuqui126']]);
            // $res = $client->get($target_url, ['auth' => [$admin_user->user, $admin_user->pass]]);
            $status = $res->getStatusCode();
            $body = $res->getBody();

            // Get xpath for the return HTML doc
            $doc = new \DOMDocument();
            @$doc->loadHTML($body, LIBXML_NOWARNING);
            $xpath = new \DOMXpath($doc);
            $ytelsettingsXPath = $xpath->query('//table/tr/td/center');
            $pattern = '/This campaign has (\d+) leads to be dialed in those lists.+This campaign has (\d+) leads in the dial hopper/s';
            preg_match($pattern, $body, $matches);

            $result_data['campaignStatus'] = $matches ?: [];

            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $result_data]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Update campaign data list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function campaignDataListUpdate(Request $request) {
        try {

            $campaign_id = $request->campaign_id;
            Validator::make($request->all(), [
                'campaign_id' => 'required',
            ])->validate();
            $list_ids = $request->list_ids ?: [];
            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_CAMPAIGN, ACCESS_READ, $current_company_id, $user);

            if (!in_array($campaign_id, $access_permissions)) {
                throw new Exception('Cannot read campaign, you might not have permission to do this.', 400);
            }

            VicidialLists::where('campaign_id', $campaign_id)->whereIn('list_id', $list_ids)->update(['active' => 'Y']);
            VicidialLists::where('campaign_id', $campaign_id)->whereNotIn('list_id', $list_ids)->update(['active' => 'N']);

            // Admin log
            $admin_log_data['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log_data['user'] = $user->x5_contact_id;
            $admin_log_data['ip_address'] = $this->clientIp();
            $admin_log_data['event_section'] = "CAMPAIGNS";
            $admin_log_data['event_type'] = "MODIFY";
            $admin_log_data['record_id'] = $campaign_id;
            $admin_log_data['event_code'] = "ADMIN MODIFY CAMPAIGN ACTIVE LISTS";
            $admin_log_data['event_sql'] = "UPDATE vicidial_lists SET active='Y' where list_id IN(" . implode(', ', $list_ids) . ") and campaign_id='$campaign_id'";
            $admin_log_data['event_notes'] = "";
            $admin_log_data['user_group'] = "";

            VicidialAdminLog::insert($admin_log_data);

            return response()->json(['status' => 200, 'msg' => 'List updated Successfully.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Completed leads
     *
     * @param type $dial_statuses
     * @param type $camp_lists
     * @param type $call_count_limit
     * @param type $single_status
     * @param type $campaign_id
     * @return string
     */
    protected function completeLeads($dial_statuses, $camp_lists, $call_count_limit, $single_status, $campaign_id, $access_permissions) {
        if (isset($camp_lists)) {
            if (count($camp_lists) > 0) {
                if (strlen($dial_statuses) > 2) {
                    $dial_statuses = preg_replace("/ -$/", "", $dial_statuses);
                    $Dstatuses = explode(" ", $dial_statuses);
                    $CCLsql = "(called_count < 0)";
                    if ($call_count_limit > 0) {
                        $CCLsql = "(called_count >= $call_count_limit)";
                    }
                    $statuses_to_print = VicidialStatuses::where('completed', 'Y')->pluck('status');
                    $statuses_to_print1 = VicidialCampaignStatuses::where('completed', 'Y')->whereIn('campaign_id', $access_permissions)->pluck('status');
                    $complete_statuses = $statuses_to_print->merge($statuses_to_print1);
                    $statuses_to_print = VicidialList::whereIn('status', $Dstatuses);
                    $statuses_to_print = $statuses_to_print->whereIn('list_id', $camp_lists);
                    $statuses_to_print = $statuses_to_print->where(function($q) use ($CCLsql, $complete_statuses) {
                        $q->whereRaw($CCLsql)
                                ->orWhereIn('status', $complete_statuses);
                    });
                    $statuses_to_print = $statuses_to_print->count();
                    if ($statuses_to_print) {
                        $complete_leads = $statuses_to_print;
                    } else {
                        $complete_leads = '0';
                    }
                    if ($single_status > 0) {
                        return $complete_leads;
                    } else {
                        echo "There are $complete_leads completed leads in those lists\n";
                    }
                } else {
                    echo "no dial statuses selected for this campaign\n";
                }
            } else {
                //echo "no active lists selected for this campaign\n";
            }
        } else {
            // echo "no active lists selected for this campaign\n";
        }
    }

    /**
     * Disabled and not disabled statuses
     *
     * @param \Illuminate\Database\Eloquent\Collection $campaign
     * @param \Illuminate\Database\Eloquent\Collection $lists
     * @param \Illuminate\Database\Eloquent\Collection $admin_setting
     * @param array $list_id
     * @param array $lead_filter_sql
     * @param array $dial_statuses1
     * @param array $statuses_list
     * @param array $statuses_complete_list
     * @param array $access_permissions
     * @return array
     */
    protected function disabledAndNotDisabledStatuses($campaign, $type, $admin_setting, $list_id, $lead_filter_sql, $dial_statuses1, $statuses_list, $statuses_complete_list, $access_permissions) {

        if ($type == 'not_disabled') {
            $lists = VicidialList::select('status', 'called_since_last_reset')
                    ->selectRaw('count(*) as total ')
                    ->whereIn('list_id', $list_id)
                    ->whereNotIn('status', $dial_statuses1)
                    ->groupBy('status', 'called_since_last_reset')
                    ->orderBy('status', 'ASC')
                    ->orderBy('called_since_last_reset', 'ASC')
                    ->get();
        } else {
            $lists = VicidialList::select('status', 'called_since_last_reset')
                    ->selectRaw('count(*) as total ')
                    ->whereIn('list_id', $list_id)
                    ->whereIn('status', $dial_statuses1)
                    ->groupBy('status', 'called_since_last_reset')
                    ->orderBy('status', 'ASC')
                    ->orderBy('called_since_last_reset', 'ASC')
                    ->get();
        }

        $lead_list = [];
        $lead_list['count'] = 0;
        $lead_list['Y_count'] = 0;
        $lead_list['N_count'] = 0;
        $lead_list['Y'] = [];
        $lead_list['N'] = [];
        $complete_total = 0;
        $dialable_total = 0;
        $key = 0;
        $total_count = count($lists);
        $lists = $this->getFormattedArray($lists->toArray(), $total_count);
        while ($total_count > $key) {
            $lead_list['count'] = ($lead_list['count'] + $lists[$key][2]);
            if ($lists[$key][1] == 'N') {
                $since_reset = 'N';
                $since_resetX = 'Y';
            } else {
                $since_reset = 'Y';
                $since_resetX = 'N';
            }
            $a = isset($lead_list[$since_reset][$lists[$key][0]]) ? $lead_list[$since_reset][$lists[$key][0]] : 0;
            $b = isset($lead_list[$since_reset . '_count']) ? $lead_list[$since_reset . '_count'] : 0;
            $lead_list[$since_reset][$lists[$key][0]] = ($a + $lists[$key][2]);
            $lead_list[$since_reset . '_count'] = ($b + $lists[$key][2]);
            #If opposite side is not set, it may not in the future so give it a value of zero
            if (!isset($lead_list[$since_resetX][$lists[$key][0]])) {
                $lead_list[$since_resetX][$lists[$key][0]] = 0;
            }
            $key++;
        }

        $o = 0;
        $status_array = array();
        if ($lead_list['count'] > 0) {
            foreach ($lead_list[$since_reset] as $key => $value) {
                if ($admin_setting->expanded_list_stats > 0) {
                    ### call function to calculate dialable leads
                    $single_status = 1;
                    $dial_statuses = " $key -";
                    $camp_lists = $list_id;

                    if (in_array($key, $dial_statuses1)) {
                        if ($statuses_complete_list[$key] == 'Y') {
                            $Xdialable_count = 0;
                        } else {
                            $Xdialable_count = $this->dialableLeads($campaign->local_call_time, $dial_statuses, $camp_lists, $campaign->drop_lockout_time, $campaign->call_count_limit, $single_status, $lead_filter_sql);
                        }
                    } else {
                        $Xdialable_count = 0;
                    }
                    $dialable_total = ($dialable_total + $Xdialable_count);

                    ### get number of complete calls of this status for penetration calculations

                    $Xcomplete_count = $this->completeLeads($dial_statuses, $camp_lists, $campaign->call_count_limit, $single_status, $campaign->campaign_id, $access_permissions);
                    $complete_total = ($complete_total + $Xcomplete_count);
                    $dispo_total = ($lead_list['Y'][$key] + $lead_list['N'][$key]);
                    if (($Xcomplete_count < 1) or ( $dispo_total < 1)) {
                        $complete_pct = "0 %";
                    } else {
                        $complete_pct = intval(($Xcomplete_count / $dispo_total) * 100);
                        $complete_pct = "$complete_pct %";
                    }
                    if ($Xdialable_count == '') {
                        $Xdialable_count = 0;
                    }
                    $signleArray = array('status' => $key, 'statusnm' => key_exists($key, $statuses_list) ? $statuses_list[$key] : '', 'statusName' => $lead_list['Y'][$key], 'called' => $lead_list['N'][$key], 'Dilablecount' => $Xdialable_count, 'completed' => $complete_pct);
                    array_push($status_array, $signleArray);
                } else {
                    $signleArray = array('status' => $key, 'statusName' => $lead_list['Y'][$key], 'called' => $lead_list['N'][$key]);

                    array_push($status_array, $signleArray);
                }
                $o++;
            }
        }

        $subtotal = array();
        $total = array();
        if ($admin_setting->expanded_list_stats > 0) {
            if (($complete_total < 1) or ( $lead_list['count'] < 1)) {
                $total_complete_pct = "0";
            } else {
                $total_complete_pct = intval(($complete_total / $lead_list['count']) * 100);
            }
            $subtotal = array('ycount' => $lead_list['Y_count'], 'Ncount' => $lead_list['N_count']);
            $total = array('total1' => $lead_list['count'], 'disable' => $dialable_total, 'completed' => $total_complete_pct . "%");
        } else {
            $subtotal = array('ycount' => $lead_list['Y_count'], 'Ncount' => $lead_list['N_count']);
            $total = array('total1' => $lead_list['count']);
        }

        $result_data['total'] = $total;
        $result_data['sub_total'] = $subtotal;
        $result_data['list'] = $status_array;
        return $result_data;
    }

    /**
     * Build array
     *
     * @param array $list
     * @param int $list
     * @return array
     */
    protected function getFormattedArray($list, $total_count) {
        $resultarray = array();
        for ($i = 0; $i < $total_count; $i++) {
            $singlearray = array();
            array_push($singlearray, $list[$i]['status']);
            array_push($singlearray, $list[$i]['called_since_last_reset']);
            array_push($singlearray, $list[$i]['total']);
            array_push($resultarray, $singlearray);
        }
        return $resultarray;
    }

    /**
     * Dialable leads
     *
     * @param type $local_call_time
     * @param type $dial_statuses
     * @param type $camp_lists
     * @param type $drop_lockout_time
     * @param type $call_count_limit
     * @param type $single_status
     * @param type $fSQL
     * @return string
     */
    protected function dialableLeads($local_call_time, $dial_statuses, $camp_lists, $drop_lockout_time, $call_count_limit, $single_status, $fSQL) {
        $k = 0;
        $camp_str = '';
        while (count($camp_lists) > $k) {
            $camp_str .= $camp_lists[$k] . ',';
            $k++;
        }
        $camp_lists = substr($camp_str, 0, -1);

##### BEGIN calculate what gmt_offset_now values are within the allowed local_call_time setting ###
        if (isset($camp_lists)) {
            if (strlen($camp_lists) > 1) {
                if (strlen($dial_statuses) > 2) {
                    $g = 0;
                    $p = '13';
                    $GMT_gmt[0] = '';
                    $GMT_hour[0] = '';
                    $GMT_day[0] = '';
                    $YMD = date("Y-m-d");
                    while ($p > -13) {
                        $pzone = 3600 * $p;
                        $pmin = (gmdate("i", time() + $pzone));
                        $phour = ( (gmdate("G", time() + $pzone)) * 100);
                        $pday = gmdate("w", time() + $pzone);
                        $tz = sprintf("%.2f", $p);
                        $GMT_gmt[$g] = "$tz";
                        $GMT_day[$g] = "$pday";
                        $GMT_hour[$g] = ($phour + $pmin);
                        $p = ($p - 0.25);
                        $g++;
                    }

                    $call_time = VicidialCallTime::select('call_time_id', 'call_time_name', 'call_time_comments', 'ct_default_start', 'ct_default_stop', 'ct_sunday_start', 'ct_sunday_stop', 'ct_monday_start', 'ct_monday_stop', 'ct_tuesday_start', 'ct_tuesday_stop', 'ct_wednesday_start', 'ct_wednesday_stop', 'ct_thursday_start', 'ct_thursday_stop', 'ct_friday_start', 'ct_friday_stop', 'ct_saturday_start', 'ct_saturday_stop', 'ct_state_call_times', 'ct_holidays')
                            ->where('call_time_id', $local_call_time)
                            ->first();
                    $Gct_default_start = 0;
                    $Gct_default_stop = 0;
                    $Gct_sunday_start = 0;
                    $Gct_sunday_stop = 0;
                    $Gct_monday_start = 0;
                    $Gct_monday_stop = 0;
                    $Gct_tuesday_start = 0;
                    $Gct_tuesday_stop = 0;
                    $Gct_wednesday_start = 0;
                    $Gct_wednesday_stop = 0;
                    $Gct_thursday_start = 0;
                    $Gct_thursday_stop = 0;
                    $Gct_friday_start = 0;
                    $Gct_friday_stop = 0;
                    $Gct_saturday_start = 0;
                    $Gct_saturday_stop = 0;
                    $Gct_state_call_times = 0;
                    $Gct_holidays = '';
                    if ($call_time instanceof VicidialCallTime) {
                        $Gct_default_start = $call_time->ct_default_start;
                        $Gct_default_stop = $call_time->ct_default_stop;
                        $Gct_sunday_start = $call_time->ct_sunday_start;
                        $Gct_sunday_stop = $call_time->ct_sunday_stop;
                        $Gct_monday_start = $call_time->ct_monday_start;
                        $Gct_monday_stop = $call_time->ct_monday_stop;
                        $Gct_tuesday_start = $call_time->ct_tuesday_start;
                        $Gct_tuesday_stop = $call_time->ct_tuesday_stop;
                        $Gct_wednesday_start = $call_time->ct_wednesday_start;
                        $Gct_wednesday_stop = $call_time->ct_wednesday_stop;
                        $Gct_thursday_start = $call_time->ct_thursday_start;
                        $Gct_thursday_stop = $call_time->ct_thursday_stop;
                        $Gct_friday_start = $call_time->ct_friday_start;
                        $Gct_friday_stop = $call_time->ct_friday_stop;
                        $Gct_saturday_start = $call_time->ct_saturday_start;
                        $Gct_saturday_stop = $call_time->ct_saturday_stop;
                        $Gct_state_call_times = $call_time->ct_state_call_times;
                        $Gct_holidays = $call_time->ct_holidays;
                    }

                    ### BEGIN Check for outbound holiday ###
                    $holiday_id = '';
                    if (strlen($Gct_holidays) > 2) {
                        $Gct_holidaysSQL = preg_replace("/\|/", "','", "$Gct_holidays");
                        $Gct_holidaysSQL = "'" . $Gct_holidaysSQL . "'";

                        $calltime_holyday = \App\VicidialCallTimeHoliday::select('holiday_id', 'holiday_date', 'holiday_name', 'ct_default_start', 'ct_default_stop')
                                ->whereIn('holiday_id', $Gct_holidaysSQL)
                                ->where('holiday_status', 'ACTIVE')
                                ->where('holiday_date', $YMD)
                                ->orderBy('holiday_id')
                                ->get()
                                ->toArray();

                        if (count($calltime_holyday) > 0) {
                            $aryC = array_values($calltime_holyday);

                            $holiday_id = $aryC[0];
                            $holiday_date = $aryC[1];
                            $holiday_name = $aryC[2];
                            if (($Gct_default_start < $aryC[3]) && ($Gct_default_stop > 0)) {
                                $Gct_default_start = $aryC[3];
                            }
                            if (($Gct_default_stop > $aryC[4]) && ($Gct_default_stop > 0)) {
                                $Gct_default_stop = $aryC[4];
                            }
                            if (($Gct_sunday_start < $aryC[3]) && ($Gct_sunday_stop > 0)) {
                                $Gct_sunday_start = $aryC[3];
                            }
                            if (($Gct_sunday_stop > $aryC[4]) && ($Gct_sunday_stop > 0)) {
                                $Gct_sunday_stop = $aryC[4];
                            }
                            if (($Gct_monday_start < $aryC[3]) && ($Gct_monday_stop > 0)) {
                                $Gct_monday_start = $aryC[3];
                            }
                            if (($Gct_monday_stop > $aryC[4]) && ($Gct_monday_stop > 0)) {
                                $Gct_monday_stop = $aryC[4];
                            }
                            if (($Gct_tuesday_start < $aryC[3]) && ($Gct_tuesday_stop > 0)) {
                                $Gct_tuesday_start = $aryC[3];
                            }
                            if (($Gct_tuesday_stop > $aryC[4]) && ($Gct_tuesday_stop > 0)) {
                                $Gct_tuesday_stop = $aryC[4];
                            }
                            if (($Gct_wednesday_start < $aryC[3]) && ($Gct_wednesday_stop > 0)) {
                                $Gct_wednesday_start = $aryC[3];
                            }
                            if (($Gct_wednesday_stop > $aryC[4]) && ($Gct_wednesday_stop > 0)) {
                                $Gct_wednesday_stop = $aryC[4];
                            }
                            if (($Gct_thursday_start < $aryC[3]) && ($Gct_thursday_stop > 0)) {
                                $Gct_thursday_start = $aryC[3];
                            }
                            if (($Gct_thursday_stop > $aryC[4]) && ($Gct_thursday_stop > 0)) {
                                $Gct_thursday_stop = $aryC[4];
                            }
                            if (($Gct_friday_start < $aryC[3]) && ($Gct_friday_stop > 0)) {
                                $Gct_friday_start = $aryC[3];
                            }
                            if (($Gct_friday_stop > $aryC[4]) && ($Gct_friday_stop > 0)) {
                                $Gct_friday_stop = $aryC[4];
                            }
                            if (($Gct_saturday_start < $aryC[3]) && ($Gct_saturday_stop > 0)) {
                                $Gct_saturday_start = $aryC[3];
                            }
                            if (($Gct_saturday_stop > $aryC[4]) && ($Gct_saturday_stop > 0)) {
                                $Gct_saturday_stop = $aryC[4];
                            }
                            if ($DB) {
                                echo "LIST CALL TIME HOLIDAY FOUND!   $local_call_time|$holiday_id|$holiday_date|$holiday_name|$Gct_default_start|$Gct_default_stop|\n";
                            }
                        }
                    }
                    ### END Check for outbound holiday ###

                    $ct_states = '';
                    $ct_state_gmt_SQL = '';
                    $state_rules = '';
                    $ct_srs = 0;
                    $b = 0;
                    if (strlen($Gct_state_call_times) > 2) {
                        $state_rules = explode('|', $Gct_state_call_times);
                        $ct_srs = ((count($state_rules)) - 2);
                    }
                    while ($ct_srs >= $b) {
                        if (strlen($state_rules) > 0 && strlen($state_rules[$b]) > 1) {
                            $state_call_times = \App\VicidialStateCallTime::select('state_call_time_id', 'state_call_time_state', 'state_call_time_name', 'state_call_time_comments', 'sct_default_start', 'sct_default_stop', 'sct_sunday_start', 'sct_sunday_stop', 'sct_monday_start', 'sct_tuesday_start', 'sct_tuesday_stop', 'sct_wednesday_start', 'sct_wednesday_stop', 'sct_thursday_start', 'sct_thursday_stop', 'sct_friday_start', 'sct_friday_stop', 'sct_saturday_start', 'sct_saturday_stop', 'ct_holidays')
                                    ->where('state_call_time_id', $state_rules[$b])
                                    ->first();
                            $Gstate_call_time_id = $state_call_times->state_call_time_id;
                            $Gstate_call_time_state = $state_call_times->state_call_time_state;
                            $Gsct_default_start = $state_call_times->sct_default_start;
                            $Gsct_default_stop = $state_call_times->sct_default_stop;
                            $Gsct_sunday_start = $state_call_times->sct_sunday_start;
                            $Gsct_sunday_stop = $state_call_times->sct_sunday_stop;
                            $Gsct_monday_start = $state_call_times->sct_monday_start;
                            $Gsct_monday_stop = $state_call_times->sct_monday_stop;
                            $Gsct_tuesday_start = $state_call_times->sct_tuesday_start;
                            $Gsct_tuesday_stop = $state_call_times->sct_tuesday_stop;
                            $Gsct_wednesday_start = $state_call_times->sct_wednesday_start;
                            $Gsct_wednesday_stop = $state_call_times->sct_wednesday_stop;
                            $Gsct_thursday_start = $state_call_times->sct_thursday_start;
                            $Gsct_thursday_stop = $state_call_times->sct_thursday_stop;
                            $Gsct_friday_start = $state_call_times->sct_friday_start;
                            $Gsct_friday_stop = $state_call_times->sct_friday_stop;
                            $Gsct_saturday_start = $state_call_times->sct_saturday_start;
                            $Gsct_saturday_stop = $state_call_times->sct_saturday_stop;
                            $Sct_holidays = $state_call_times->ct_holidays;
                            $ct_states .= "'$Gstate_call_time_state',";

                            ### BEGIN Check for outbound state holiday ###
                            $Sholiday_id = '';
                            if ((strlen($Sct_holidays) > 2) or ( (strlen($holiday_id) > 2) and ( strlen($Sholiday_id) < 2))) {
                                # Apply state holiday
                                if (strlen($Sct_holidays) > 2) {
                                    $Sct_holidaysSQL = preg_replace("/\|/", "','", "$Sct_holidays");
                                    $Sct_holidaysSQL = "'" . $Sct_holidaysSQL . "'";
                                    $call_time_holiday = \App\VicidialCallTimeHoliday::select('holiday_id', 'holiday_date', 'ct_default_start', 'ct_default_stop')
                                            ->whereIn('holiday_id', $Sct_holidaysSQL)
                                            ->where('holiday_status', 'ACTIVE')
                                            ->where('holiday_date', $YMD)
                                            ->orderBy('holiday_id')
                                            ->get()
                                            ->toArray();
                                    $holidaytype = "STATE CALL TIME HOLIDAY FOUND!";
                                }
                                # Apply call time wide holiday
                                elseif ((strlen($holiday_id) > 2) and ( strlen($Sholiday_id) < 2)) {
                                    $call_time_holiday = \App\VicidialCallTimeHoliday::select('holiday_id', 'holiday_name', 'holiday_date', 'ct_default_start', 'ct_default_stop')
                                            ->where('holiday_id', $holiday_id)
                                            ->where('holiday_status', 'ACTIVE')
                                            ->where('holiday_date', $YMD)
                                            ->orderBy('holiday_id')
                                            ->get()
                                            ->toArray();
                                    $holidaytype = "NO STATE HOLIDAY APPLYING CALL TIME HOLIDAY!   ";
                                }

                                if (count($call_time_holiday) > 0) {
                                    $aryC = array_values($call_time_holiday);
                                    $Sholiday_id = $aryC[0];
                                    $Sholiday_date = $aryC[1];
                                    $Sholiday_name = $aryC[2];
                                    if (($Gsct_default_start < $aryC[3]) && ($Gsct_default_stop > 0)) {
                                        $Gsct_default_start = $aryC[3];
                                    }
                                    if (($Gsct_default_stop > $aryC[4]) && ($Gsct_default_stop > 0)) {
                                        $Gsct_default_stop = $aryC[4];
                                    }
                                    if (($Gsct_sunday_start < $aryC[3]) && ($Gsct_sunday_stop > 0)) {
                                        $Gsct_sunday_start = $aryC[3];
                                    }
                                    if (($Gsct_sunday_stop > $aryC[4]) && ($Gsct_sunday_stop > 0)) {
                                        $Gsct_sunday_stop = $aryC[4];
                                    }
                                    if (($Gsct_monday_start < $aryC[3]) && ($Gsct_monday_stop > 0)) {
                                        $Gsct_monday_start = $aryC[3];
                                    }
                                    if (($Gsct_monday_stop > $aryC[4]) && ($Gsct_monday_stop > 0)) {
                                        $Gsct_monday_stop = $aryC[4];
                                    }
                                    if (($Gsct_tuesday_start < $aryC[3]) && ($Gsct_tuesday_stop > 0)) {
                                        $Gsct_tuesday_start = $aryC[3];
                                    }
                                    if (($Gsct_tuesday_stop > $aryC[4]) && ($Gsct_tuesday_stop > 0)) {
                                        $Gsct_tuesday_stop = $aryC[4];
                                    }
                                    if (($Gsct_wednesday_start < $aryC[3]) && ($Gsct_wednesday_stop > 0)) {
                                        $Gsct_wednesday_start = $aryC[3];
                                    }
                                    if (($Gsct_wednesday_stop > $aryC[4]) && ($Gsct_wednesday_stop > 0)) {
                                        $Gsct_wednesday_stop = $aryC[4];
                                    }
                                    if (($Gsct_thursday_start < $aryC[3]) && ($Gsct_thursday_stop > 0)) {
                                        $Gsct_thursday_start = $aryC[3];
                                    }
                                    if (($Gsct_thursday_stop > $aryC[4]) && ($Gsct_thursday_stop > 0)) {
                                        $Gsct_thursday_stop = $aryC[4];
                                    }
                                    if (($Gsct_friday_start < $aryC[3]) && ($Gsct_friday_stop > 0)) {
                                        $Gsct_friday_start = $aryC[3];
                                    }
                                    if (($Gsct_friday_stop > $aryC[4]) && ($Gsct_friday_stop > 0)) {
                                        $Gsct_friday_stop = $aryC[4];
                                    }
                                    if (($Gsct_saturday_start < $aryC[3]) && ($Gsct_saturday_stop > 0)) {
                                        $Gsct_saturday_start = $aryC[3];
                                    }
                                    if (($Gsct_saturday_stop > $aryC[4]) && ($Gsct_saturday_stop > 0)) {
                                        $Gsct_saturday_stop = $aryC[4];
                                    }
                                    if ($DB) {
                                        echo "$holidaytype   |$Gstate_call_time_id|$Gstate_call_time_state|$Sholiday_id|$Sholiday_date|$Sholiday_name|$Gsct_default_start|$Gsct_default_stop|\n";
                                    }
                                }
                            }

                            $r = 0;
                            $state_gmt = '';
                            while ($r < $g) {
                                if ($GMT_day[$r] == 0) { #### Sunday local time
                                    if (($Gsct_sunday_start == 0) and ( $Gsct_sunday_stop == 0)) {
                                        if (($GMT_hour[$r] >= $Gsct_default_start) and ( $GMT_hour[$r] < $Gsct_default_stop)) {
                                            $state_gmt .= "'$GMT_gmt[$r]',";
                                        }
                                    } else {
                                        if (($GMT_hour[$r] >= $Gsct_sunday_start) and ( $GMT_hour[$r] < $Gsct_sunday_stop)) {
                                            $state_gmt .= "'$GMT_gmt[$r]',";
                                        }
                                    }
                                }
                                if ($GMT_day[$r] == 1) { #### Monday local time
                                    if (($Gsct_monday_start == 0) and ( $Gsct_monday_stop == 0)) {
                                        if (($GMT_hour[$r] >= $Gsct_default_start) and ( $GMT_hour[$r] < $Gsct_default_stop)) {
                                            $state_gmt .= "'$GMT_gmt[$r]',";
                                        }
                                    } else {
                                        if (($GMT_hour[$r] >= $Gsct_monday_start) and ( $GMT_hour[$r] < $Gsct_monday_stop)) {
                                            $state_gmt .= "'$GMT_gmt[$r]',";
                                        }
                                    }
                                }
                                if ($GMT_day[$r] == 2) { #### Tuesday local time
                                    if (($Gsct_tuesday_start == 0) and ( $Gsct_tuesday_stop == 0)) {
                                        if (($GMT_hour[$r] >= $Gsct_default_start) and ( $GMT_hour[$r] < $Gsct_default_stop)) {
                                            $state_gmt .= "'$GMT_gmt[$r]',";
                                        }
                                    } else {
                                        if (($GMT_hour[$r] >= $Gsct_tuesday_start) and ( $GMT_hour[$r] < $Gsct_tuesday_stop)) {
                                            $state_gmt .= "'$GMT_gmt[$r]',";
                                        }
                                    }
                                }
                                if ($GMT_day[$r] == 3) { #### Wednesday local time
                                    if (($Gsct_wednesday_start == 0) and ( $Gsct_wednesday_stop == 0)) {
                                        if (($GMT_hour[$r] >= $Gsct_default_start) and ( $GMT_hour[$r] < $Gsct_default_stop)) {
                                            $state_gmt .= "'$GMT_gmt[$r]',";
                                        }
                                    } else {
                                        if (($GMT_hour[$r] >= $Gsct_wednesday_start) and ( $GMT_hour[$r] < $Gsct_wednesday_stop)) {
                                            $state_gmt .= "'$GMT_gmt[$r]',";
                                        }
                                    }
                                }
                                if ($GMT_day[$r] == 4) { #### Thursday local time
                                    if (($Gsct_thursday_start == 0) and ( $Gsct_thursday_stop == 0)) {
                                        if (($GMT_hour[$r] >= $Gsct_default_start) and ( $GMT_hour[$r] < $Gsct_default_stop)) {
                                            $state_gmt .= "'$GMT_gmt[$r]',";
                                        }
                                    } else {
                                        if (($GMT_hour[$r] >= $Gsct_thursday_start) and ( $GMT_hour[$r] < $Gsct_thursday_stop)) {
                                            $state_gmt .= "'$GMT_gmt[$r]',";
                                        }
                                    }
                                }
                                if ($GMT_day[$r] == 5) { #### Friday local time
                                    if (($Gsct_friday_start == 0) and ( $Gsct_friday_stop == 0)) {
                                        if (($GMT_hour[$r] >= $Gsct_default_start) and ( $GMT_hour[$r] < $Gsct_default_stop)) {
                                            $state_gmt .= "'$GMT_gmt[$r]',";
                                        }
                                    } else {
                                        if (($GMT_hour[$r] >= $Gsct_friday_start) and ( $GMT_hour[$r] < $Gsct_friday_stop)) {
                                            $state_gmt .= "'$GMT_gmt[$r]',";
                                        }
                                    }
                                }
                                if ($GMT_day[$r] == 6) { #### Saturday local time
                                    if (($Gsct_saturday_start == 0) and ( $Gsct_saturday_stop == 0)) {
                                        if (($GMT_hour[$r] >= $Gsct_default_start) and ( $GMT_hour[$r] < $Gsct_default_stop)) {
                                            $state_gmt .= "'$GMT_gmt[$r]',";
                                        }
                                    } else {
                                        if (($GMT_hour[$r] >= $Gsct_saturday_start) and ( $GMT_hour[$r] < $Gsct_saturday_stop)) {
                                            $state_gmt .= "'$GMT_gmt[$r]',";
                                        }
                                    }
                                }
                                $r++;
                            }
                            $state_gmt = "$state_gmt'99'";
                            $ct_state_gmt_SQL .= "or (state='$Gstate_call_time_state' and gmt_offset_now IN($state_gmt)) ";
                        }

                        $b++;
                    }

                    if (strlen($ct_states) > 2) {
                        $ct_states = preg_replace('/, $/i', '', $ct_states);
                        $ct_statesSQL = "and state NOT IN($ct_states)";
                    } else {
                        $ct_statesSQL = "";
                    }

                    $r = 0;
                    $default_gmt = '';
                    while ($r < $g) {
                        if ($GMT_day[$r] == 0) { #### Sunday local time
                            if (($Gct_sunday_start == 0) and ( $Gct_sunday_stop == 0)) {
                                if (($GMT_hour[$r] >= $Gct_default_start) and ( $GMT_hour[$r] < $Gct_default_stop)) {
                                    $default_gmt .= "'$GMT_gmt[$r]',";
                                }
                            } else {
                                if (($GMT_hour[$r] >= $Gct_sunday_start) and ( $GMT_hour[$r] < $Gct_sunday_stop)) {
                                    $default_gmt .= "'$GMT_gmt[$r]',";
                                }
                            }
                        }
                        if ($GMT_day[$r] == 1) { #### Monday local time
                            if (($Gct_monday_start == 0) and ( $Gct_monday_stop == 0)) {
                                if (($GMT_hour[$r] >= $Gct_default_start) and ( $GMT_hour[$r] < $Gct_default_stop)) {
                                    $default_gmt .= "'$GMT_gmt[$r]',";
                                }
                            } else {
                                if (($GMT_hour[$r] >= $Gct_monday_start) and ( $GMT_hour[$r] < $Gct_monday_stop)) {
                                    $default_gmt .= "'$GMT_gmt[$r]',";
                                }
                            }
                        }
                        if ($GMT_day[$r] == 2) { #### Tuesday local time
                            if (($Gct_tuesday_start == 0) and ( $Gct_tuesday_stop == 0)) {
                                if (($GMT_hour[$r] >= $Gct_default_start) and ( $GMT_hour[$r] < $Gct_default_stop)) {
                                    $default_gmt .= "'$GMT_gmt[$r]',";
                                }
                            } else {
                                if (($GMT_hour[$r] >= $Gct_tuesday_start) and ( $GMT_hour[$r] < $Gct_tuesday_stop)) {
                                    $default_gmt .= "'$GMT_gmt[$r]',";
                                }
                            }
                        }
                        if ($GMT_day[$r] == 3) { #### Wednesday local time
                            if (($Gct_wednesday_start == 0) and ( $Gct_wednesday_stop == 0)) {
                                if (($GMT_hour[$r] >= $Gct_default_start) and ( $GMT_hour[$r] < $Gct_default_stop)) {
                                    $default_gmt .= "'$GMT_gmt[$r]',";
                                }
                            } else {
                                if (($GMT_hour[$r] >= $Gct_wednesday_start) and ( $GMT_hour[$r] < $Gct_wednesday_stop)) {
                                    $default_gmt .= "'$GMT_gmt[$r]',";
                                }
                            }
                        }
                        if ($GMT_day[$r] == 4) { #### Thursday local time
                            if (($Gct_thursday_start == 0) and ( $Gct_thursday_stop == 0)) {
                                if (($GMT_hour[$r] >= $Gct_default_start) and ( $GMT_hour[$r] < $Gct_default_stop)) {
                                    $default_gmt .= "'$GMT_gmt[$r]',";
                                }
                            } else {
                                if (($GMT_hour[$r] >= $Gct_thursday_start) and ( $GMT_hour[$r] < $Gct_thursday_stop)) {
                                    $default_gmt .= "'$GMT_gmt[$r]',";
                                }
                            }
                        }
                        if ($GMT_day[$r] == 5) { #### Friday local time
                            if (($Gct_friday_start == 0) and ( $Gct_friday_stop == 0)) {
                                if (($GMT_hour[$r] >= $Gct_default_start) and ( $GMT_hour[$r] < $Gct_default_stop)) {
                                    $default_gmt .= "'$GMT_gmt[$r]',";
                                }
                            } else {
                                if (($GMT_hour[$r] >= $Gct_friday_start) and ( $GMT_hour[$r] < $Gct_friday_stop)) {
                                    $default_gmt .= "'$GMT_gmt[$r]',";
                                }
                            }
                        }
                        if ($GMT_day[$r] == 6) { #### Saturday local time
                            if (($Gct_saturday_start == 0) and ( $Gct_saturday_stop == 0)) {
                                if (($GMT_hour[$r] >= $Gct_default_start) and ( $GMT_hour[$r] < $Gct_default_stop)) {
                                    $default_gmt .= "'$GMT_gmt[$r]',";
                                }
                            } else {
                                if (($GMT_hour[$r] >= $Gct_saturday_start) and ( $GMT_hour[$r] < $Gct_saturday_stop)) {
                                    $default_gmt .= "'$GMT_gmt[$r]',";
                                }
                            }
                        }
                        $r++;
                    }
                    $default_gmt = "$default_gmt'99'";
                    $all_gmtSQL = "(gmt_offset_now IN($default_gmt) $ct_statesSQL) $ct_state_gmt_SQL";

                    $dial_statuses = preg_replace("/ -$/", "", $dial_statuses);
                    $Dstatuses = explode(" ", $dial_statuses);
                    $Ds_to_print = (count($Dstatuses) - 1);
                    $Dsql = '';
                    $o = 0;

                    while ($Ds_to_print > $o) {
                        $o++;
                        $Dsql .= "'$Dstatuses[$o]',";
                    }

                    $Dsql = preg_replace("/,$/", "", $Dsql);
                    if (strlen($Dsql) < 2) {
                        $Dsql = "''";
                    }

                    $DLTsql = '';
                    if ($drop_lockout_time > 0) {
                        $DLseconds = ($drop_lockout_time * 3600);
                        $DLseconds = floor($DLseconds);
                        $DLseconds = intval("$DLseconds");
                        $DLTsql = "and ( ( (status IN('DROP','XDROP')) and (last_local_call_time < CONCAT(DATE_ADD(NOW(), INTERVAL -$DLseconds SECOND),' ',CURTIME()) ) ) or (status NOT IN('DROP','XDROP')) )";
                    }

                    $CCLsql = '';
                    if ($call_count_limit > 0) {
                        $CCLsql = "and (called_count < $call_count_limit)";
                    }

                    $EXPsql = '';
                    $expired_lists = '';
                    $REPORTdate = date("Y-m-d");
                    $list_id_arr = explode(',', $camp_lists);
                    $lists = VicidialLists::select('list_id')
                            ->whereIn('list_id', $list_id_arr)
                            ->where('active', 'Y')
                            ->where('expiration_date', '<', $REPORTdate)
                            ->get();

                    $rslt_rows = $lists->toArray();

                    $resultarray = array();
                    for ($i = 0; $i < count($rslt_rows); $i++) {
                        $singlearray = $rslt_rows[$i]['list_id'];
                        array_push($resultarray, $singlearray);
                    }

                    $f = 0;
                    while (count($resultarray) > $f) {
                        $rowx = $resultarray;
                        $expired_lists .= "'$rowx[0]',";
                        $f++;
                    }
                    $expired_lists = preg_replace("/,$/", '', $expired_lists);
                    if (strlen($expired_lists) < 2) {
                        $expired_lists = "''";
                    }
                    $EXPsql = "list_id NOT IN($expired_lists)";
                    $Dsql = explode(',', $Dsql);
                    $lists = VicidialList::selectRaw('count(*) as count')->where('called_since_last_reset', 'N');
                    $lists = $lists->whereIn('status', $Dsql);
                    $lists = $lists->whereIn('list_id', $list_id_arr);
                    if ($all_gmtSQL)
                        $lists = $lists->whereRaw($all_gmtSQL);
                    if ($CCLsql)
                        $lists = $lists->whereRaw($CCLsql);
                    if ($DLTsql)
                        $lists = $lists->whereRaw($DLTsql);
                    if ($fSQL)
                        $lists = $lists->whereRaw($fSQL);
                    if ($EXPsql)
                        $lists = $lists->whereRaw($EXPsql);
                    $lists = $lists->first();
                    $rslt_rows1 = $lists->toArray();
                    if ($rslt_rows1) {
                        $active_leads = $rslt_rows1['count'];
                    } else {
                        $active_leads = '0';
                    }

                    if ($single_status > 0) {
                        return $active_leads;
                    } else {
                        echo "This campaign has $active_leads leads to be dialed in those lists\n";
                    }
                } else {
                    echo "no dial statuses selected for this campaign\n";
                }
            } else {
                //   echo "no active lists selected for this campaign\n";
            }
        } else {
            //   echo "no active lists selected for this campaign\n";
        }
    }

    /**
     * Build auto dial array
     *
     * @param int $auto_dial_limit
     * @return array
     */
    private function autoDialLimit($auto_dial_limit) {
        $adl = 0;
        $result_array = [];
        while ($adl <= $auto_dial_limit) {
            $formated_value = floatval(number_format($adl, 1));
            array_push($result_array, $formated_value);
            if ($adl < 1) {
                $adl = ($adl + 1);
            } else {
                if ($adl < 3) {
                    $adl = ($adl + 0.1);
                } else {
                    if ($adl < 4) {
                        $adl = ($adl + 0.25);
                    } else {
                        if ($adl < 5) {
                            $adl = ($adl + 0.5);
                        } else {
                            if ($adl < 10) {
                                $adl = ($adl + 1);
                            } else {
                                if ($adl < 20) {
                                    $adl = ($adl + 2);
                                } else {
                                    if ($adl < 40) {
                                        $adl = ($adl + 5);
                                    } else {
                                        if ($adl < 200) {
                                            $adl = ($adl + 10);
                                        } else {
                                            if ($adl < 400) {
                                                $adl = ($adl + 50);
                                            } else {
                                                if ($adl < 1000) {
                                                    $adl = ($adl + 100);
                                                } else {
                                                    $adl = ($adl + 1);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        $formated_value = floatval(number_format($adl, 1));
        array_push($result_array, $formated_value);
        return $result_array;
    }

    /**
     * Ytel extra settings
     *
     * @param string|int $campaign_id
     * @param array $request
     */
    protected function ytelExtraSettings($campaign_id, $request) {
        $ytel_extra_setting = YtelExtraSetting::where('setting_key', implode(':', ['campaign', $campaign_id, YTEL_EXTRA_SETTING_DEFAULT_LEAD_PREVIEW]))->where('value', 1)->first();
        if ($ytel_extra_setting instanceof YtelExtraSetting && !$request->has(YTEL_EXTRA_SETTING_DEFAULT_LEAD_PREVIEW)) {
            $ytel_extra_setting->delete();
        } else if (!$ytel_extra_setting instanceof YtelExtraSetting && $request->has(YTEL_EXTRA_SETTING_DEFAULT_LEAD_PREVIEW)) {
            $ytel_extra_setting_data['setting_key'] = implode(':', ['campaign', $campaign_id, YTEL_EXTRA_SETTING_DEFAULT_LEAD_PREVIEW]);
            $ytel_extra_setting_data['value'] = 1;
            YtelExtraSetting::insert($ytel_extra_setting_data);
        }
    }

}
