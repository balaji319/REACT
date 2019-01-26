<?php

namespace App;

use DB;
use Illuminate\Database\Eloquent\Model;
use App\Traits\ErrorLog;

class VicidialUsers extends Model {

    use ErrorLog;
    #database connection with dynamic database.

    public $incrementing = false;
    protected $connection = 'dyna';
    protected $table = "vicidial_users";
    public $primaryKey = 'user_id';
    public $timestamps = false;

    /**
     * Get all Agents
     * @author Harshal Pawar.
     * @return type
     * unused for now.
     */
    public static function getAll($fields) {
        return VicidialUsers::orderBy('user_id')->get($fields);
    }

    public static function compainList($id) {
        $find_source_user = VicidialUsers::select(
                        'user_level', 'user_group', 'delete_users', 'delete_user_groups', 'delete_lists', 'delete_campaigns', 'delete_ingroups', 'delete_remote_agents', 'load_leads', 'campaign_detail', 'ast_admin_access', 'ast_delete_phones', 'delete_scripts', 'modify_leads', 'hotkeys_active', 'change_agent_campaign', 'closer_campaigns', 'scheduled_callbacks', 'agentonly_callbacks', 'agentcall_manual', 'agent_choose_ingroups', 'vicidial_recording', 'vicidial_transfers', 'delete_filters', 'alter_agent_interface_options', 'closer_default_blended', 'delete_call_times', 'modify_call_times', 'modify_users', 'modify_campaigns', 'modify_lists', 'modify_scripts', 'modify_filters', 'modify_ingroups', 'modify_usergroups', 'modify_remoteagents', 'modify_servers', 'view_reports', 'vicidial_recording_override', 'alter_custdata_override', 'qc_enabled', 'qc_user_level', 'qc_pass', 'qc_finish', 'qc_commit', 'add_timeclock_log', 'modify_timeclock_log', 'delete_timeclock_log', 'alter_custphone_override', 'vdc_agent_api_access', 'modify_inbound_dids', 'delete_inbound_dids', 'active', 'alert_enabled', 'download_lists', 'agent_shift_enforcement_override', 'manager_shift_enforcement_override', 'export_reports', 'delete_from_dnc', 'email', 'user_code', 'territory', 'allow_alerts', 'agent_choose_territories', 'custom_one', 'custom_two', 'custom_three', 'custom_four', 'custom_five', 'agent_call_log_view_override', 'callcard_admin', 'agent_choose_blended', 'realtime_block_user_info', 'custom_fields_modify', 'force_change_password', 'agent_lead_search_override', 'modify_shifts', 'modify_phones', 'modify_carriers', 'modify_labels', 'modify_statuses', 'modify_voicemail', 'modify_audiostore', 'modify_moh', 'modify_tts', 'preset_contact_search', 'modify_contacts', 'modify_same_user_level', 'admin_hide_lead_data', 'admin_hide_phone_data', 'agentcall_email', 'modify_email_accounts', 'alter_admin_interface_options', 'max_inbound_calls', 'modify_custom_dialplans'
                )->where('user', $id)->first();
        return $find_source_user;
    }

    /**
     * List of agents by group id
     *
     * @param string|int $user_id
     * @return \Illuminate\Support\Collection
     * @throws Exception
     */
    public static function users() {
        try {
            return VicidialUser::select("user", "full_name", "closer_campaigns", "user_group")
                            ->where("active", "Y")
                            ->whereNotIn('user', ['VDAD', 'VDCL', '6666'])
                            ->where("user_level", "<>", 9)
                            ->orderBy("user")
                            ->get();
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

}
