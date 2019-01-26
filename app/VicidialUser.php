<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Exception;
use App\Traits\ErrorLog;

class VicidialUser extends Model {

    use ErrorLog;

    protected $connection = 'dyna';
    protected $table = 'vicidial_users';
    public $timestamps = false;
    public $primaryKey = 'user_id';
    public $listFields = [
        'user_id',
        'user',
        'user_group',
        'full_name',
        'active',
        'closer_default_blended',
    ];

    public static function userDetailsIfNotUser($user_group, $query_date_begin, $query_date_end, $order_sql, $order_by) {

        return DB::connection('dyna')->table('vicidial_users')
                        ->join('vicidial_timeclock_log', 'vicidial_users.user', '=', 'vicidial_timeclock_log.user')
                        ->whereIn('vicidial_timeclock_log.user_group', $user_group)
                        ->whereIn('vicidial_timeclock_log.event', ['LOGIN', 'START'])
                        ->whereBetween('vicidial_timeclock_log.event_date', [$query_date_begin, $query_date_end])
                        ->select(DB::raw('vicidial_users.user,vicidial_users.full_name,SUM(vicidial_timeclock_log.login_sec) as login,vicidial_timeclock_log.user_group'))
                        ->groupBy('vicidial_users.user')
                        ->groupBy('vicidial_timeclock_log.user_group')
                        ->orderBy($order_sql, $order_by)
                        ->limit(10000000)
                        ->get();
    }

    public static function userDetails($user_group) {
        return VicidialUser::where('user_group', $user_group)
                        ->orderBy('full_name')
                        ->get(['user', 'full_name']);
    }

    public static function userDetailList() {
        return VicidialUser::orderBy('user')
                        ->limit(100000)
                        ->get(['full_name', 'user', 'user_group']);
    }

    public static function csvDetail() {
        return VicidialUser::where('user_level', '>=', 8)
                        ->where('user', 6666)
                        ->orderBy('user_level', 'ASC')
                        ->limit(1)
                        ->get(['user', 'pass']);
    }

    public static function userList() {

        # HAVE TO ADD WHERE CONDITION DEPENDING UPON ACCESS PERMISSION

        return VicidialUser::orderBy('user', 'ASC')
                        ->get(['user', 'full_name']);
    }

    public static function userNameList($user_id) {
        return VicidialUser::where('user', $user_id)
                        ->pluck('full_name');
    }

    public static function userListForUserstats($user_id) {
        return VicidialUser::select('user', 'full_name')->where("user","=", $user_id)->first();
    }

    /**
     * get user info
     * @author Aarti<aarti@ytel.com>
     * @param int $user_level
     * @param string $ytel
     * @return type
     */
    public static function getUserDet($user_level) {
        try {
            return VicidialUser::select('user', 'pass')
                            ->where('user_level', $user_level)
                            ->first();
        } catch (Exception $e) {
            $_this = new self;

            $_this->postLogs(config('errorcontants.mysql'), $e);
            return collect([]);
        }
    }

    /**
     * get user info wrt user and pass
     * @author Aarti<aarti@ytel.com>
     * @param string $user
     * @param string $pass
     * @return type
     */
    public static function getUserDetByCred($user, $pass) {
        try {
            return VicidialUser::select('user_id', 'user', 'pass', 'full_name', 'user_level', 'user_group', 'phone_login', 'phone_pass', 'delete_users', 'delete_user_groups', 'delete_lists', 'delete_campaigns', 'delete_ingroups', 'delete_remote_agents', 'load_leads', 'campaign_detail', 'ast_admin_access', 'ast_delete_phones', 'delete_scripts', 'modify_leads', 'hotkeys_active', 'change_agent_campaign', 'agent_choose_ingroups', 'closer_campaigns', 'scheduled_callbacks', 'agentonly_callbacks', 'agentcall_manual', 'vicidial_recording', 'vicidial_transfers', 'delete_filters', 'alter_agent_interface_options', 'closer_default_blended', 'delete_call_times', 'modify_call_times', 'modify_users', 'modify_campaigns', 'modify_lists', 'modify_scripts', 'modify_filters', 'modify_ingroups', 'modify_usergroups', 'modify_remoteagents', 'modify_servers', 'view_reports', 'vicidial_recording_override', 'alter_custdata_override', 'qc_enabled', 'qc_user_level', 'qc_pass', 'qc_finish', 'qc_commit', 'add_timeclock_log', 'modify_timeclock_log', 'delete_timeclock_log', 'alter_custphone_override', 'vdc_agent_api_access', 'modify_inbound_dids', 'delete_inbound_dids', 'active', 'alert_enabled', 'download_lists', 'agent_shift_enforcement_override', 'manager_shift_enforcement_override', 'shift_override_flag', 'export_reports', 'delete_from_dnc', 'email', 'user_code', 'territory', 'allow_alerts', 'callcard_admin', 'force_change_password', 'modify_shifts', 'modify_phones', 'modify_carriers', 'modify_labels', 'modify_statuses', 'modify_voicemail', 'modify_audiostore', 'modify_moh', 'modify_tts', 'modify_contacts', 'modify_same_user_leve')
                            ->where('user', $user)
                            ->where('pass', $pass)
                            ->get();
        } catch (Exception $e) {
            $_this = new self;

            $_this->postLogs(config('errorcontants.mysql'), $e);
            return collect([]);
        }
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

    /**
     * Find user
     *
     * @param array $fields
     * @param string $username
     * @param string $password
     * @return \Illuminate\Support\Collection
     * @throws \App\Exception
     */
    public static function findUser($fields, $username, $password) {
        try {
            $fields = implode(',', $fields);
            return VicidialUser::selectRaw($fields)
                            ->where(['user' => $username, 'pass' => $password])
                            ->first();
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

}
