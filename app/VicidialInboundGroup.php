<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\Traits\ErrorLog;
use Exception;

class VicidialInboundGroup extends Model {

    use ErrorLog;

    protected $connection = 'dyna';
    protected $table = 'vicidial_inbound_groups';
    public $primaryKey = 'group_id';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = ['group_id','group_name','group_color','web_form_address','web_form_address_two','next_agent_call','queue_priority','ingroup_script','ignore_list_script_override','get_call_launch','drop_call_seconds','drop_action','drop_exten','voicemail_ext','drop_callmenu','call_time_id','action_xfer_cid','after_hours_action','after_hours_message_filename','no_agent_no_queue','welcome_message_filename','play_welcome_message','moh_context','prompt_interval','agent_alert_exten','agent_alert_delay','start_call_url','dispo_call_url','na_call_url','extension_appended_cidname'];

    /**
     * List of inbound queues
     *
     * @param string $search
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function inboundGroupList($group_id, $search, $limit) {
        try {
            $inbound_queues = VicidialInboundGroup::select("group_id", "group_name", "group_color", "active", "queue_priority", "call_time_id");
            if ($search != NULL) {
                $inbound_queues = $inbound_queues->where(function ($query) use ($search) {
                    $query->where("group_id", "like", "%{$search}%")
                            ->orWhere("group_name", "like", "%{$search}%")
                            ->orWhere("active", "like", "%{$search}%")
                            ->orWhere("queue_priority", "like", "%{$search}%")
                            ->orWhere("call_time_id", "like", "%{$search}%");
                });
            }
            $inbound_queues = $inbound_queues->whereIn("group_id", $group_id);
            return $inbound_queues->paginate($limit);
        } catch (Exception $e) {
            
            throw $e;
        }
    }

    /**
     * Change inbound status
     *
     * @param int $group_id
     * @param boolean $status
     * @return boolean
     */
    public function activeOrInActiveInbound($group_id, $status) {
        try {
            $inbound = VicidialInboundGroup::select('active')->where('group_id', $group_id)->first();
            $inbound->active = $status;
            // return $inbound->save();
            return $inbound; // Todo: remove
        } catch (Exception $e) {
            
            throw new Exception($e->getMessage(), 401);
        }
    }

    //TODO :  ACCESS CONTROL NEEDS TO ADD IN WHERE CONDITION
    public static function inboundGroups() {
        //TODO :  ACCESS CONTROL NEEDS TO ADD IN WHERE CONDITION

        return VicidialInboundGroup::orderBy('group_id')
                        ->get(['group_id', 'group_name']);
    }

    public static function answerSecPctRtStat($group_id, $limit) {
        return VicidialInboundGroup::orderBy('answer_sec_pct_rt_stat_one')
                        ->whereIn('group_id', $group_id)
                        ->limit($limit)
                        ->get(['answer_sec_pct_rt_stat_one', 'answer_sec_pct_rt_stat_two']);
    }

    public function duplicateRecords($field) {
        $count1 = VicidialInboundGroup::where('group_id', $field)->get();
        return count($count1);
    }

    public function createlog($data) {
        return VicidialInboundGroup::create($data);
    }

    public function getquery($data, $type) {
        if ($type == "ADD") {
            $query = "INSERT INTO vicidial_inbound_groups set group_name='" . $data['group_name'] . "', group_color='" . $data['group_color'] . "', active='" . $data['active'] . "', web_form_address='" . $data['web_form_address'] . "', voicemail_ext='" . $data['voicemail_ext'] . "', next_agent_call='" . $data['next_agent_call'] . "', fronter_display='" . $data['fronter_display'] . "', ingroup_script='" . $data['ingroup_script'] . "', get_call_launch='" . $data['get_call_launch'] . "', xferconf_a_dtmf='',xferconf_a_number='', xferconf_b_dtmf='',xferconf_b_number='',drop_action='',drop_call_seconds='',drop_exten='',call_time_id='',after_hours_action='',after_hours_message_filename='',after_hours_exten='',after_hours_voicemail='',welcome_message_filename='',moh_context='',onhold_prompt_filename='',prompt_interval='',agent_alert_exten='',agent_alert_delay='',default_xfer_group='',queue_priority='',drop_inbound_group='',ingroup_recording_override='',ingroup_rec_filename='',afterhours_xfer_group='',qc_enabled='',qc_statuses='',qc_shift_id='',qc_get_record_launch='',qc_show_recording='',qc_web_form_address='',qc_script='',play_place_in_line='',play_estimate_hold_time='',hold_time_option='',hold_time_option_seconds='',hold_time_option_exten='',hold_time_option_voicemail='',hold_time_option_xfer_group='',hold_time_option_callback_filename='',hold_time_option_callback_list_id='',hold_recall_xfer_group='',no_delay_call_route='',play_welcome_message='',answer_sec_pct_rt_stat_one='',answer_sec_pct_rt_stat_two='',default_group_alias='',no_agent_no_queue='',no_agent_action='',no_agent_action_value='',web_form_address_two='',timer_action='',timer_action_message='',timer_action_seconds='',start_call_url='',dispo_call_url='',xferconf_c_number='',xferconf_d_number='',xferconf_e_number='',ignore_list_script_override='',extension_appended_cidname='',uniqueid_status_display='',uniqueid_status_prefix='',hold_time_option_minimum='',hold_time_option_press_filename='',hold_time_option_callmenu='',onhold_prompt_no_block='',onhold_prompt_seconds='',hold_time_option_no_block='',hold_time_option_prompt_seconds='',hold_time_second_option='',hold_time_third_option='',wait_hold_option_priority='',wait_time_option='',wait_time_second_option='',wait_time_third_option='',wait_time_option_seconds='',wait_time_option_exten='',wait_time_option_voicemail='',wait_time_option_xfer_group='',wait_time_option_callmenu='',wait_time_option_callback_filename='',wait_time_option_callback_list_id='',wait_time_option_press_filename='',wait_time_option_no_block='',wait_time_option_prompt_seconds='',timer_action_destination='',calculate_estimated_hold_seconds='',add_lead_url='',eht_minimum_prompt_filename='',eht_minimum_prompt_no_block='',eht_minimum_prompt_seconds='',on_hook_ring_time='',na_call_url='',on_hook_cid='',action_xfer_cid='',drop_callmenu='',after_hours_callmenu='',user_group='" . $data['user_group'] . "',max_calls_method='',max_calls_count='',max_calls_action='',dial_ingroup_cid=''";
        } else {
            $query = "UPDATE vicidial_inbound_groups set group_name='asd', group_color='#cc4646', active='Y', web_form_address='', voicemail_ext='', next_agent_call='random', fronter_display='', ingroup_script='', get_call_launch='NONE', xferconf_a_dtmf='',xferconf_a_number='', xferconf_b_dtmf='',xferconf_b_number='',drop_action='MESSAGE',drop_call_seconds='360',drop_exten='8307',call_time_id='24hours',after_hours_action='MESSAGE',after_hours_message_filename='vm-goodbye',after_hours_exten='8300',after_hours_voicemail='',welcome_message_filename='---NONE---',moh_context='default',onhold_prompt_filename='generic_hold',prompt_interval='60',agent_alert_exten='ding',agent_alert_delay='1000',default_xfer_group='',queue_priority='0',drop_inbound_group='',ingroup_recording_override='',ingroup_rec_filename='',afterhours_xfer_group='',qc_enabled='',qc_statuses='',qc_shift_id='',qc_get_record_launch='',qc_show_recording='',qc_web_form_address='',qc_script='',play_place_in_line='',play_estimate_hold_time='',hold_time_option='',hold_time_option_seconds='',hold_time_option_exten='',hold_time_option_voicemail='',hold_time_option_xfer_group='',hold_time_option_callback_filename='',hold_time_option_callback_list_id='',hold_recall_xfer_group='',no_delay_call_route='',play_welcome_message='ALWAYS',answer_sec_pct_rt_stat_one='',answer_sec_pct_rt_stat_two='',default_group_alias='',no_agent_no_queue='N',no_agent_action='MESSAGE',no_agent_action_value=' ',web_form_address_two='',timer_action='',timer_action_message='',timer_action_seconds='',start_call_url='',dispo_call_url='',xferconf_c_number='',xferconf_d_number='',xferconf_e_number='',ignore_list_script_override='N',extension_appended_cidname='N',uniqueid_status_display='',uniqueid_status_prefix='',hold_time_option_minimum='',hold_time_option_press_filename='',hold_time_option_callmenu='',onhold_prompt_no_block='',onhold_prompt_seconds='',hold_time_option_no_block='',hold_time_option_prompt_seconds='',hold_time_second_option='',hold_time_third_option='',wait_hold_option_priority='',wait_time_option='',wait_time_second_option='',wait_time_third_option='',wait_time_option_seconds='',wait_time_option_exten='',wait_time_option_voicemail='',wait_time_option_xfer_group='',wait_time_option_callmenu='',wait_time_option_callback_filename='',wait_time_option_callback_list_id='',wait_time_option_press_filename='',wait_time_option_no_block='',wait_time_option_prompt_seconds='',timer_action_destination='',calculate_estimated_hold_seconds='',add_lead_url='',eht_minimum_prompt_filename='',eht_minimum_prompt_no_block='',eht_minimum_prompt_seconds='',on_hook_ring_time='',na_call_url='',on_hook_cid='',action_xfer_cid='CUSTOMER',drop_callmenu='',after_hours_callmenu='',user_group='',max_calls_method='',max_calls_count='',max_calls_action='',dial_ingroup_cid='' WHERE group_id='asd'";
        }


        return $query;
    }

    public static function getAllInboundGroupData($humanAnsweredList)
    {
        return VicidialInboundGroup::whereIn('group_id', $humanAnsweredList)
                        ->select(DB::raw('`vicidial_inbound_groups`.`group_id`, `vicidial_inbound_groups`.`group_name`, `vicidial_inbound_groups`.`group_color`, `vicidial_inbound_groups`.`active`, `vicidial_inbound_groups`.`web_form_address`, `vicidial_inbound_groups`.`voicemail_ext`, `vicidial_inbound_groups`.`next_agent_call`, `vicidial_inbound_groups`.`fronter_display`, `vicidial_inbound_groups`.`ingroup_script`, `vicidial_inbound_groups`.`get_call_launch`, `vicidial_inbound_groups`.`xferconf_a_dtmf`, `vicidial_inbound_groups`.`xferconf_a_number`, `vicidial_inbound_groups`.`xferconf_b_dtmf`, `vicidial_inbound_groups`.`xferconf_b_number`, `vicidial_inbound_groups`.`drop_call_seconds`, `vicidial_inbound_groups`.`drop_action`, `vicidial_inbound_groups`.`drop_exten`, `vicidial_inbound_groups`.`call_time_id`, `vicidial_inbound_groups`.`after_hours_action`, `vicidial_inbound_groups`.`after_hours_message_filename`, `vicidial_inbound_groups`.`after_hours_exten`, `vicidial_inbound_groups`.`after_hours_voicemail`, `vicidial_inbound_groups`.`welcome_message_filename`, `vicidial_inbound_groups`.`moh_context`, `vicidial_inbound_groups`.`onhold_prompt_filename`, `vicidial_inbound_groups`.`prompt_interval`, `vicidial_inbound_groups`.`agent_alert_exten`, `vicidial_inbound_groups`.`agent_alert_delay`, `vicidial_inbound_groups`.`default_xfer_group`, `vicidial_inbound_groups`.`queue_priority`, `vicidial_inbound_groups`.`drop_inbound_group`, `vicidial_inbound_groups`.`ingroup_recording_override`, `vicidial_inbound_groups`.`ingroup_rec_filename`, `vicidial_inbound_groups`.`afterhours_xfer_group`, `vicidial_inbound_groups`.`qc_enabled`, `vicidial_inbound_groups`.`qc_statuses`, `vicidial_inbound_groups`.`qc_shift_id`, `vicidial_inbound_groups`.`qc_get_record_launch`, `vicidial_inbound_groups`.`qc_show_recording`, `vicidial_inbound_groups`.`qc_web_form_address`, `vicidial_inbound_groups`.`qc_script`, `vicidial_inbound_groups`.`play_place_in_line`, `vicidial_inbound_groups`.`play_estimate_hold_time`, `vicidial_inbound_groups`.`hold_time_option`, `vicidial_inbound_groups`.`hold_time_option_seconds`, `vicidial_inbound_groups`.`hold_time_option_exten`, `vicidial_inbound_groups`.`hold_time_option_voicemail`, `vicidial_inbound_groups`.`hold_time_option_xfer_group`, `vicidial_inbound_groups`.`hold_time_option_callback_filename`, `vicidial_inbound_groups`.`hold_time_option_callback_list_id`, `vicidial_inbound_groups`.`hold_recall_xfer_group`, `vicidial_inbound_groups`.`no_delay_call_route`, `vicidial_inbound_groups`.`play_welcome_message`, `vicidial_inbound_groups`.`answer_sec_pct_rt_stat_one`, `vicidial_inbound_groups`.`answer_sec_pct_rt_stat_two`, `vicidial_inbound_groups`.`default_group_alias`, `vicidial_inbound_groups`.`no_agent_no_queue`, `vicidial_inbound_groups`.`no_agent_action`, `vicidial_inbound_groups`.`no_agent_action_value`, `vicidial_inbound_groups`.`web_form_address_two`, `vicidial_inbound_groups`.`timer_action`, `vicidial_inbound_groups`.`timer_action_message`, `vicidial_inbound_groups`.`timer_action_seconds`, `vicidial_inbound_groups`.`start_call_url`, `vicidial_inbound_groups`.`dispo_call_url`, `vicidial_inbound_groups`.`xferconf_c_number`, `vicidial_inbound_groups`.`xferconf_d_number`, `vicidial_inbound_groups`.`xferconf_e_number`, `vicidial_inbound_groups`.`ignore_list_script_override`, `vicidial_inbound_groups`.`extension_appended_cidname`, `vicidial_inbound_groups`.`uniqueid_status_display`, `vicidial_inbound_groups`.`uniqueid_status_prefix`, `vicidial_inbound_groups`.`hold_time_option_minimum`, `vicidial_inbound_groups`.`hold_time_option_press_filename`, `vicidial_inbound_groups`.`hold_time_option_callmenu`, `vicidial_inbound_groups`.`hold_time_option_no_block`, `vicidial_inbound_groups`.`hold_time_option_prompt_seconds`, `vicidial_inbound_groups`.`onhold_prompt_no_block`, `vicidial_inbound_groups`.`onhold_prompt_seconds`, `vicidial_inbound_groups`.`hold_time_second_option`, `vicidial_inbound_groups`.`hold_time_third_option`, `vicidial_inbound_groups`.`wait_hold_option_priority`, `vicidial_inbound_groups`.`wait_time_option`, `vicidial_inbound_groups`.`wait_time_second_option`, `vicidial_inbound_groups`.`wait_time_third_option`, `vicidial_inbound_groups`.`wait_time_option_seconds`, `vicidial_inbound_groups`.`wait_time_option_exten`, `vicidial_inbound_groups`.`wait_time_option_voicemail`, `vicidial_inbound_groups`.`wait_time_option_xfer_group`, `vicidial_inbound_groups`.`wait_time_option_callmenu`, `vicidial_inbound_groups`.`wait_time_option_callback_filename`, `vicidial_inbound_groups`.`wait_time_option_callback_list_id`, `vicidial_inbound_groups`.`wait_time_option_press_filename`, `vicidial_inbound_groups`.`wait_time_option_no_block`, `vicidial_inbound_groups`.`wait_time_option_prompt_seconds`, `vicidial_inbound_groups`.`timer_action_destination`, `vicidial_inbound_groups`.`calculate_estimated_hold_seconds`, `vicidial_inbound_groups`.`add_lead_url`, `vicidial_inbound_groups`.`eht_minimum_prompt_filename`, `vicidial_inbound_groups`.`eht_minimum_prompt_no_block`, `vicidial_inbound_groups`.`eht_minimum_prompt_seconds`, `vicidial_inbound_groups`.`on_hook_ring_time`, `vicidial_inbound_groups`.`na_call_url`, `vicidial_inbound_groups`.`on_hook_cid`, `vicidial_inbound_groups`.`group_calldate`, `vicidial_inbound_groups`.`action_xfer_cid`, `vicidial_inbound_groups`.`drop_callmenu`, `vicidial_inbound_groups`.`after_hours_callmenu`, `vicidial_inbound_groups`.`user_group`, `vicidial_inbound_groups`.`max_calls_method`, `vicidial_inbound_groups`.`max_calls_count`, `vicidial_inbound_groups`.`max_calls_action`, `vicidial_inbound_groups`.`dial_ingroup_cid`, `vicidial_inbound_groups`.`group_handling`, (CONCAT(`vicidial_inbound_groups`.`group_id`, " - ", `vicidial_inbound_groups`.`group_name`)) AS `ViciInboundGroup__options_title`'))
                        ->get();

    }

}
