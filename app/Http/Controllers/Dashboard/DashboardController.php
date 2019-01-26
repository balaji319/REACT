<?php

namespace App\Http\Controllers\Dashboard;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\SystemSetting;
use App\VicidialUser;
use App\VicidialUserGroup;
use App\Traits\Helper;
use App\Traits\ErrorLog;
use App\Traits\AccessControl;
use App\VicidialCampaign;
use App\VicidialCarrierLog;
use App\VicidialCampaignStat;
use Exception;

class DashboardController extends Controller {

    use Helper,
        AccessControl,
        ErrorLog;

    /**
     * Get Dashboard details
     *
     * @return [json]
     */
    public function index(Request $request) {

        try {

            $result_array['agents_list'] = [];
            $result_array['agents_call_list'] = [];
            $result_array['stat_table'] = [];
            $user = $request->user();
            $request->validate([
                'rt_ajax' => 'present',
                'db' => 'present',
                'groups' => 'present|array',
                'user_group_filter' => 'present|array',
                'adastats' => 'present',
                'showhide' => 'present',
                'spi_monitor_link' => 'present',
                'iax_monitor_link' => 'present',
                'usergroup' => 'present',
                'ug_display' => 'present',
                'uid_or_name' => 'present',
                'order_by' => 'present',
                'serv_display' => 'present',
                'calls_display' => 'present',
                'phone_display' => 'present',
                'session_id_display' => 'present',
                'cust_phone_display' => 'present',
                'with_inbound' => 'present',
                'monitor_active' => 'present',
                'monitor_phone' => 'present',
                'all_ingroup_stats' => 'present',
                'rr' => 'present',
                'drop_ingroup_stats' => 'present',
                'no_leads_alert' => 'present',
                'carrier_stats' => 'present',
                'preset_stats' => 'present',
                'agent_time_stats' => 'present'
            ]);

            //check access
            $access_type = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $request->current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_DASHBOARD_REALTIME, $access_type)) {
                throw new Exception('Cannot access agents, you might not have permission to do this.');
            }
            $url = $this->getValidUrl($request->current_application_dns);
            //firebase stuff pending
            $allow_campaigns = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_CAMPAIGN, ACCESS_READ, $request->current_company_id, $user);
            $allowUsergroups = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_USERGROUP, ACCESS_READ, $request->current_company_id, $user);
            $level8user = VicidialUser::getUserDet(9);

            $query = SystemSetting::select('use_non_latin', 'outbound_autodial_active', 'slave_db_server', 'reports_use_slave_db')->first();
            if ($query instanceof SystemSetting) {
                $non_latin = $query->use_non_latin;
                $outbound_autodial_active = $query->outbound_autodial_active;
                $slave_db_server = $query->slave_db_server;
                $reports_use_slave_db = $query->reports_use_slave_db;
            }

            #params
            $php_auth_user = $level8user->user;
            $php_auth_pw = $level8user->pass;
            $php_self = $_SERVER['PHP_SELF'];
            $server_ip = $request->server_ip ?: '';
            $rr = $request->rr ?: 40;
            $inbound = $request->inbound ?: '';
            $group = $request->group ?: 'ALL-ACTIVE';
            $group = $request->group ?: '';
            $groups = $request->groups ?: $allow_campaigns;
            $groups = $groups ?: array_intersect($groups, $allow_campaigns);
            $usergroup = $request->usergroup ?: '';
            $user_group_filter = $request->user_group_filter ?: [];
            $user_group_filter = (!isset($user_group_filter) || in_array('ALL-GROUPS', $user_group_filter)) ? $allowUsergroups : array_intersect($user_group_filter, $allowUsergroups);
            $db = $request->db ?: 0;
            $adastats = $request->adastats ?: '';
            $showhide = $request->showhide ?: '';
            $submit = $request->submit ?: '';
            $spi_monitor_link = $request->spi_monitor_link ?: '';
            $iax_monitor_link = $request->iax_monitor_link ?: '';
            $ug_display = $request->ug_display ?: 0;
            $uid_or_name = $request->uid_or_name ?: 1;
            $order_by = $request->order_by ?: 'timeup';
            $serv_display = $request->serv_display ?: 0;
            $calls_display = $request->calls_display ?: 1;
            $phone_display = $request->phone_display ?: 0;
            $session_id_display = $request->session_id_display ?: '';
            $cust_phone_display = $request->cust_phone_display ?: 0;
            $no_leads_alert = $request->no_leads_alert ?: '';
            $drop_ingroup_stats = $request->drop_ingroup_stats ?: 0;
            $all_ingroup_stats = $request->all_ingroup_stats ?: '';
            $with_inbound = $request->with_inbound ?: ($outbound_autodial_active > 0 ? 'Y' : 0);
            $monitor_active = $request->monitor_active ?: '';
            $monitor_phone = $request->monitor_phone ?: '';
            $carrier_stats = $request->carrier_stats ?: '';
            $preset_stats = $request->preset_stats ?: '';
            $agent_time_stats = $request->agent_time_stats ?: '';
            $rt_ajax = $request->rt_ajax ?: '';
            $RTuser = $request->RTuser ?: '';
            $RTpass = $request->RTpass ?: '';
            $report_name = 'Real-Time Main Report';
            $db_source = 'M';
            $ingroup_detail = '';
            $multi_drop = 0;
            $status_category_1 = '';
            $status_category_2 = '';
            $status_category_3 = '';
            $status_category_4 = '';
            $status_category_count_1 = '';
            $status_category_count_2 = '';
            $status_category_count_3 = '';
            $status_category_count_4 = '';

            if ((strlen($group) > 1) && ( strlen($groups[0]) < 1)) {
                $groups[0] = $group;
                $rr = 40;
            } else {
                $group = $groups[0];
            }
            $load_ave = $this->getServerLoad(TRUE);

            $start_time = date('U');
            $time_one_minute_ago = date('Y-m-d H:i:s', ($start_time - 60));
            $time_five_minutes_ago = date('Y-m-d H:i:s', ($start_time - 300));
            $time_fifteen_minutes_ago = date('Y-m-d H:i:s', ($start_time - 900));
            $time_one_hour_ago = date('Y-m-d H:i:s', ($start_time - 3600));
            $time_six_hours_ago = date('Y-m-d H:i:s', ($start_time - 21600));
            $time_twenty_four_hours_ago = date('Y-m-d H:i:s', ($start_time - 86400));
            $php_auth_user = preg_replace('[^0-9a-zA-Z]', '', $php_auth_user);
            $office_no = strtoupper($php_auth_user);
            $password = strtoupper($php_auth_pw);

            $fields = ['user_id', ' user', ' pass', ' full_name', ' user_level', ' user_group', ' phone_login', ' phone_pass', ' delete_users', ' delete_user_groups', ' delete_lists', ' delete_campaigns', ' delete_ingroups', ' delete_remote_agents', ' load_leads', ' campaign_detail', ' ast_admin_access', ' ast_delete_phones', ' delete_scripts', ' modify_leads', ' hotkeys_active', ' change_agent_campaign', ' agent_choose_ingroups', ' closer_campaigns', ' scheduled_callbacks', ' agentonly_callbacks', ' agentcall_manual', ' vicidial_recording', ' vicidial_transfers', ' delete_filters', ' alter_agent_interface_options', ' closer_default_blended', ' delete_call_times', ' modify_call_times', ' modify_users', ' modify_campaigns', ' modify_lists', ' modify_scripts', ' modify_filters', ' modify_ingroups', ' modify_usergroups', ' modify_remoteagents', ' modify_servers', ' view_reports', ' vicidial_recording_override', ' alter_custdata_override', ' qc_enabled', ' qc_user_level', ' qc_pass', ' qc_finish', ' qc_commit', ' add_timeclock_log', ' modify_timeclock_log', ' delete_timeclock_log', ' alter_custphone_override', ' vdc_agent_api_access', ' modify_inbound_dids', ' delete_inbound_dids', ' active', ' alert_enabled', ' download_lists', ' agent_shift_enforcement_override', ' manager_shift_enforcement_override', ' shift_override_flag', ' export_reports', ' delete_from_dnc', ' email', ' user_code', ' territory', ' allow_alerts', ' callcard_admin', ' force_change_password', ' modify_shifts', ' modify_phones', ' modify_carriers', ' modify_labels', ' modify_statuses', ' modify_voicemail', ' modify_audiostore', ' modify_moh', ' modify_tts', ' modify_contacts', ' modify_same_user_level'];
            $vicidial_user = VicidialUser::findUser($fields, $php_auth_user, $php_auth_pw);
            $log_user_group = $vicidial_user->user_group;
            $vicidial_user_group = VicidialUserGroup::select('allowed_campaigns', 'allowed_reports', 'admin_viewable_groups', 'admin_viewable_call_times')
                    ->where('user_group', $vicidial_user->user_group)
                    ->first();
            $log_allowed_campaigns = $vicidial_user_group->allowed_campaigns;
            $log_allowed_reports = $vicidial_user_group->allowed_reports;
            $log_admin_viewable_groups = $vicidial_user_group->admin_viewable_groups;
            $LOGadmin_viewable_call_times = $vicidial_user_group->admin_viewable_call_times;
            $log_admin_viewable_groups_sql = '';
            $val_log_admin_viewable_groups_sql = '';
            $vm_log_admin_viewable_groups_sql = '';
            $where_log_admin_viewable_groups_sql = '';
            $raw_log_admin_viewable_groups_sql = '';
            if ((!preg_match("/--ALL--/", $log_admin_viewable_groups)) && ( strlen($log_admin_viewable_groups) > 3)) {
                $raw_log_admin_viewable_groups_sql = preg_replace("/ -/", '', $log_admin_viewable_groups);
                $raw_log_admin_viewable_groups_sql = preg_replace("/ /", "','", $raw_log_admin_viewable_groups_sql);
                $log_admin_viewable_groups_sql = "and user_group IN('---ALL---','$raw_log_admin_viewable_groups_sql')";
                $where_log_admin_viewable_groups_sql = "where user_group IN('---ALL---','$raw_log_admin_viewable_groups_sql')";
                $val_log_admin_viewable_groups_sql = "and val.user_group IN('---ALL---','$raw_log_admin_viewable_groups_sql')";
                $vm_log_admin_viewable_groups_sql = "and vm.user_group IN('---ALL---','$raw_log_admin_viewable_groups_sql')";
            } else {
                $admin_viewable_groups_all = 1;
            }

            if ((!isset($monitor_phone)) || ( strlen($monitor_phone) < 1)) {
                $monitor_phone = VicidialUser::select('phone_login')->where(['user' => $php_auth_user, 'pass' => $php_auth_pw, 'active' => 'Y'])->first();
            }

            $user_info = VicidialUser::select('realtime_block_user_info', 'user_group', 'admin_hide_lead_data', 'admin_hide_phone_data')
                    ->where('user', $php_auth_user)
                    ->where('pass', $php_auth_pw)
                    ->where('view_reports', '1')
                    ->where('active', 'Y')
                    ->where('user_level', '>', '6')
                    ->first();
            $realtime_block_user_info = $user_info->realtime_block_user_info;
            $log_user_group = $user_info->user_group;
            $log_admin_hide_lead_data = $user_info->admin_hide_lead_data; // not use
            $log_admin_hide_phone_data = $user_info->admin_hide_phone_data;

            $log_allowed_campaigns = implode(' ', $allow_campaigns);
            $log_allowed_reports = VicidialUserGroup::select('allowed_campaigns', 'allowed_reports')->where('user_group', $log_user_group)->first(); // not use

            $log_allowed_campaigns_sql = '';
            $where_log_allowed_campaigns_sql = '';
            if ((!preg_match("/ALL-/", $log_allowed_campaigns))) {
                $log_allowed_campaigns_sql = $allow_campaigns;
                $where_log_allowed_campaigns_sql = $allow_campaigns;
            }
            $regex_log_allowed_campaigns = " $log_allowed_campaigns ";

            $groups_list;
            $names_list;
            $campaigns = VicidialCampaign::select('campaign_id', 'campaign_name')->where('active', 'Y');
            if (!empty($log_allowed_campaigns_sql)) {
                $campaigns = $campaigns->whereIn('campaign_id', $log_allowed_campaigns_sql);
            }
            $campaigns = $campaigns->orderBy('campaign_id')->get()->toArray();

            array_unshift($campaigns, ['campaign_id' => 'ALL-ACTIVE', 'campaign_name' => 'ALL-ACTIVE']);

            $groups_list = array_column($campaigns, 'campaign_id');
            $names_list = array_column($campaigns, 'campaign_name'); // not use
            $campaigns = count($campaigns) + 1; // not use
            $all_active_campaigns = implode(',', $groups_list); // not use

            $group_string = '|';
            $group_sql = [];
            $group_qs = [];
            $group_ct = count($groups);
            foreach ($groups as $group) {
                if ((preg_match("/ $group /", $regex_log_allowed_campaigns)) || ( preg_match("/ALL-/", $log_allowed_campaigns))) {
                    $group_string .= "$group]|";
                    array_push($group_sql, $group);
                    array_push($group_qs, $group);
                }
            }

            $user_group_string = '|';
            $user_group_sql = [];
            $user_group_qs = [];
            $user_group_ct = count($user_group_filter);
            foreach ($user_group_filter as $user_filter_group) {
                $user_group_string .= "$user_filter_group|";
                array_push($user_group_sql, $user_filter_group);
                array_push($user_group_qs, $user_filter_group);
            }


            ### if no campaigns selected, display all
            if (($group_ct < 1) || ( strlen($group_string) < 2)) {
                $groups[0] = 'ALL-ACTIVE';
                $group_string = '|ALL-ACTIVE|';
                $group = 'ALL-ACTIVE';
                array_push($group_qs, 'ALL-ACTIVE');
            }

            ### if no user groups selected, display all
            if (($user_group_ct < 1) || ( strlen($user_group_string) < 2)) {
                $user_group_filter[0] = 'ALL-GROUPS';
                $user_group_string = '|ALL-GROUPS|';
                array_push($user_group_qs, 'ALL-GROUPS');
            }

            if ((preg_match('/--NONE--/', $group_string)) || ( $group_ct < 1)) {
                $all_active = 0;
                $group_sql = [];
                $group_sql_and = [];
                $group_sql_where = [];
            } elseif (preg_match('/ALL-ACTIVE/i', $group_string)) {
                $all_active = 1;
                $group_sql = $groups_list;
                $group_sql_and = $groups_list;
                $group_sql_where = $groups_list;
            } else {
                $all_active = 0;
                $group_sql_and = $group_sql;
                $group_sql_where = $group_sql;
            }

            ### USER GROUP STUFF
            if ((preg_match("/--NONE--/", $user_group_string)) || ( $user_group_ct < 1)) {
                $all_active_groups = 0;
                $user_group_sql = [];
            } elseif (preg_match('/ALL-GROUPS/i', $user_group_string)) {
                $all_active_groups = 1;
                array_push($user_group_sql, $raw_log_admin_viewable_groups_sql);
            } else {
                $all_active_groups = 0;
            }

            $user_groups = VicidialUserGroup::orderBy('user_group');
            if ($where_log_admin_viewable_groups_sql !== '') {
                $user_groups = $user_groups->whereRaw($where_log_admin_viewable_groups_sql);
            }
            $user_groups = $user_groups->pluck('user_group')->toArray();
            array_push($user_groups, 'ALL-GROUPS');
            $usergroupnames[0] = 'All user groups'; // not use
            ## find if any selected campaigns have presets enabled
            $presets_enabled_count = VicidialCampaign::where('enable_xfer_presets', 'ENABLED')->whereIn('campaign_id', $group_sql_and)->count();
            $presets_enabled = VicidialCampaign::where('enable_xfer_presets', 'ENABLED')->whereIn('campaign_id', $group_sql_and)->first();

            $inbound_groups = \App\VicidialInboundGroup::get(['group_id', 'group_color'])->toArray();
            $groups_ids = array_column($inbound_groups, 'group_id');
            $group_color = array_column($inbound_groups, 'group_color'); // not use

            $campaign_allow_inbound = VicidialCampaign::where('active', 'Y')->where('campaign_allow_inbound', 'Y')->whereIn('campaign_id', $group_sql_and)->count();
            $agent_pause_codes_active = VicidialCampaign::whereIn('campaign_id', $group_sql_where)->pluck('agent_pause_codes_active')[0];
            $agent_non_pause_sec = \App\VicidialCampaignStat::whereIn('campaign_id', $group_sql_where)->pluck('agent_non_pause_sec')[0];

            if (!$group) {
                throw new Exception('Please select a campaign from the pulldown above', 400);
            } else {

                ##### INBOUND #####
                $closer_campaigns_sql = [];
                if ((preg_match('/Y/', $with_inbound) || preg_match('/O/', $with_inbound)) && ( $campaign_allow_inbound > 0)) {
                    $closer_campaigns = VicidialCampaign::where('active', 'Y')->whereIn('campaign_id', $group_sql_and)->pluck('closer_campaigns');
                    foreach ($closer_campaigns as $closer_campaign) {
                        $closer_campaign_array = explode(' ', $closer_campaign);
                        foreach ($closer_campaign_array as $key => $value) {
                            if (!in_array($value, $closer_campaigns_sql) && $value != '' && $value != '-') {
                                array_push($closer_campaigns_sql, $value);
                            }
                        }
                    }
                }

                ##### SHOW IN-GROUP STATS OR INBOUND ONLY WITH VIEW-MORE ###
                if (($all_ingroup_stats > 0) || ( (preg_match('/O/', $with_inbound)) && ( $adastats > 1))) {
                    $fields = ['calls_today', 'drops_today', 'answers_today', 'status_category_1', 'status_category_count_1', 'status_category_2', 'status_category_count_2', 'status_category_3', 'status_category_count_3', 'status_category_4', 'status_category_count_4', 'hold_sec_stat_one', 'hold_sec_stat_two', 'hold_sec_answer_calls', 'hold_sec_drop_calls', 'hold_sec_queue_calls', 'campaign_id'];
                    $campaign_stats = \App\VicidialCampaignStat::whereIn('campaign_id', $closer_campaigns_sql)->orderBy('campaign_id')->get($fields);

                    foreach ($campaign_stats as $key => $campaign_stat) {

                        $result_array['stat_table'][$key]['color'] = preg_match("/0$|2$|4$|6$|8$/", $key) ? '#E6E6E6' : 'white';
                        $result_array['stat_table'][$key]['campaign_id'] = $campaign_stat->campaign_id;
                        $result_array['stat_table'][$key]['calls_today'] = $campaign_stat->calls_today;
                        $result_array['stat_table'][$key]['drops_today'] = $campaign_stat->drops_today;
                        $result_array['stat_table'][$key]['answers_today'] = $campaign_stat->answers_today;
                        $result_array['stat_table'][$key]['tma_1'] = '0%';
                        $result_array['stat_table'][$key]['tma_2'] = '0%';
                        $result_array['stat_table'][$key]['drop_percent'] = '0%';
                        $result_array['stat_table'][$key]['average_hold_sec_answer_calls'] = '0%';
                        $result_array['stat_table'][$key]['average_hold_sec_drop_calls'] = '0%';
                        $result_array['stat_table'][$key]['average_hold_sec_queue_calls'] = '0%';
                        $result_array['stat_table'][$key]['average_answer_agent_non_pause_sec'] = '0%';

                        if (($campaign_stat->drops_today > 0) && ( $campaign_stat->answers_today > 0)) {
                            $raw_drpct_today = (($campaign_stat->drops_today / $campaign_stat->answers_today) * 100);
                            $raw_drpct_today = round($raw_drpct_today, 2);
                            $result_array['stat_table'][$key]['drop_percent'] = sprintf('%01.2f', $raw_drpct_today) . '0%';
                        }

                        if ($campaign_stat->calls_today > 0) {
                            $average_hold_sec_queue_calls = ($campaign_stat->hold_sec_queue_calls / $campaign_stat->calls_today);
                            $result_array['stat_table'][$key]['average_hold_sec_queue_calls'] = round($average_hold_sec_queue_calls, 0) . '%';
                        }

                        if ($campaign_stat->drops_today > 0) {
                            $average_hold_sec_drop_calls = ($campaign_stat->hold_sec_drop_calls / $campaign_stat->drops_today);
                            $result_array['stat_table'][$key]['average_hold_sec_drop_calls'] = round($average_hold_sec_drop_calls, 0) . '%';
                        }

                        if ($campaign_stat->answers_today > 0) {
                            $pct_hold_sec_stat_one = (($campaign_stat->hold_sec_stat_one / $campaign_stat->answers_today) * 100);
                            $pct_hold_sec_stat_one = round($pct_hold_sec_stat_one, 2);
                            $pct_hold_sec_stat_one = sprintf('%01.2f', $pct_hold_sec_stat_one);
                            $result_array['stat_table'][$key]['tma_1'] = $pct_hold_sec_stat_one . '%';

                            $pct_hold_sec_stat_two = (($campaign_stat->hold_sec_stat_two / $campaign_stat->answers_today) * 100);
                            $pct_hold_sec_stat_two = round($pct_hold_sec_stat_two, 2);
                            $pct_hold_sec_stat_two = sprintf('%01.2f', $pct_hold_sec_stat_two);
                            $result_array['stat_table'][$key]['tma_2'] = $pct_hold_sec_stat_two . '%';

                            $avg_hold_sec_answer_calls = ($campaign_stat->hold_sec_answer_calls / $campaign_stat->answers_today);
                            $result_array['stat_table'][$key]['avg_hold_sec_answer_calls'] = round($avg_hold_sec_answer_calls, 0) . '%';

                            if ($agent_non_pause_sec > 0) {
                                $average_answer_agent_non_pause_sec = (($campaign_stat->answers_today / $agent_non_pause_sec) * 60);
                                $average_answer_agent_non_pause_sec = round($average_answer_agent_non_pause_sec, 2);
                                $average_answer_agent_non_pause_sec = sprintf("%01.2f", $average_answer_agent_non_pause_sec);
                                $result_array['stat_table'][$key]['average_answer_agent_non_pause_sec'] = $average_answer_agent_non_pause_sec . '%';
                            }
                        }
                    }
                }

                ##### DROP IN-GROUP ONLY TOTALS ROW ###
                if (($drop_ingroup_stats > 0) && (!preg_match('/ALL-ACTIVE/', $group_string))) {

                    $drop_inbound_group_id = VicidialCampaign::whereIn('campaign_id', $group_sql)->whereNotIn('drop_inbound_group', ['---NONE---', ''])->pluck('drop_inbound_group');
                    $calls_details = \App\VicidialCampaignStat::selectRaw('sum(calls_today) as calls_today')->selectRaw('sum(drops_today) as drops_today')->selectRaw('sum(answers_today) as answers_today')->whereIn('campaign_id', $drop_inbound_group_id)->first();
                    $result_array['campaign_statuses']['calls_today'] = $calls_details->calls_today;
                    $result_array['campaign_statuses']['drops_today'] = $calls_details->drops_today;
                    $result_array['campaign_statuses']['answers_today'] = $calls_details->answers_today;
                    $result_array['campaign_statuses']['drops_today'] = 0;
                    if (($calls_details->calls_today > 0) && ( $calls_details->drops_today > 0)) {
                        $drops_today = (($calls_details->drops_today / $calls_details->calls_today) * 100);
                        $drops_today = round($drops_today, 2);
                        $drops_today = sprintf('%01.2f', $drpct_today);
                        $result_array['campaign_statuses']['drops_today'] = $drpct_today;
                    }
                }

                ##### CARRIER STATS TOTALS ###
                if ($carrier_stats > 0) {

                    $dialstatuses = VicidialCarrierLog::selectRaw('dialstatus,count(*) as count')->where('call_date', '>=', $time_twenty_four_hours_ago)->groupBy('dialstatus')->get();

                    if ($dialstatuses->count() > 0) {

                        $time_six_hour_ago = VicidialCarrierLog::selectRaw('dialstatus,count(*) as count')->where('call_date', '>=', $time_six_hours_ago)->groupBy('dialstatus')->get();
                        $time_one_hour_ago = VicidialCarrierLog::selectRaw('dialstatus,count(*) as count')->where('call_date', '>=', $time_one_hour_ago)->groupBy('dialstatus')->get();
                        $time_fifteen_minutes_ago = VicidialCarrierLog::selectRaw('dialstatus,count(*) as count')->where('call_date', '>=', $time_fifteen_minutes_ago)->groupBy('dialstatus')->get();
                        $time_five_minutes_ago = VicidialCarrierLog::selectRaw('dialstatus,count(*) as count')->where('call_date', '>=', $time_five_minutes_ago)->groupBy('dialstatus')->get();
                        $time_one_minute_ago = VicidialCarrierLog::selectRaw('dialstatus,count(*) as count')->where('call_date', '>=', $time_one_minute_ago)->groupBy('dialstatus')->get();

                        foreach ($dialstatuses as $index => $dialstatus) {
                            $result_array['carrier_log'][$index]['hangup_status'] = $dialstatus->dialstatus;
                            $result_array['carrier_log'][$index]['24_count'] = $dialstatus->count;
                            $result_array['carrier_log'][$index]['6_hour_count'] = 0;
                            $result_array['carrier_log'][$index]['1_hour_count'] = 0;
                            $result_array['carrier_log'][$index]['15_minute_count'] = 0;
                            $result_array['carrier_log'][$index]['5_minute_count'] = 0;
                            $result_array['carrier_log'][$index]['1_minute_count'] = 0;
                            foreach ($time_six_hour_ago as $key => $six_hour) {
                                $result_array['carrier_log'][$index]['6_hour_count'] = ($dialstatus->dialstatus == $six_hour->dialstatus) ? $six_hour->count : 0;
                            }
                            foreach ($time_one_hour_ago as $key => $one_hour) {
                                $result_array['carrier_log'][$index]['1_hour_count'] = ($dialstatus->dialstatus == $one_hour->dialstatus) ? $one_hour->count : 0;
                            }
                            foreach ($time_fifteen_minutes_ago as $key => $fifteen_minutes) {
                                $result_array['carrier_log'][$index]['15_minute_count'] = ($dialstatus->dialstatus == $fifteen_minutes->dialstatus) ? $fifteen_minutes->count : 0;
                            }
                            foreach ($time_five_minutes_ago as $key => $five_minutes) {
                                $result_array['carrier_log'][$index]['5_minute_count'] = ($dialstatus->dialstatus == $five_minutes->dialstatus) ? $five_minutes->count : 0;
                            }
                            foreach ($time_one_minute_ago as $key => $one_minute) {
                                $result_array['carrier_log'][$index]['1_minute_count'] = ($dialstatus->dialstatus == $one_minute->dialstatus) ? $one_minute->count : 0;
                            }
                        }
                    } else {
                        $result_array['carrier_log'][$index] = [];
                    }
                }

                ##### PRESET STATS TOTALS ###
                if ($preset_stats > 0) {
                    $preset_stats_totals = \App\VicidialXferStat::where('preset_name', '!=', '')->whereNotNull('preset_name')->whereIn('campaign_id', $group_sql_and)->orderBy('preset_name')->get(['preset_name', 'xfer_count']);
                    $result_array['preset_stats_totals'] = $preset_stats_totals;
                    if ($preset_stats_totals->count() === 0) {
                        $result_array['preset_stats_totals'] = 'no log entries';
                    }
                }

                if (preg_match('/O/', $with_inbound)) {
                    $multi_drop++;
                    $campaign_statuses = \App\VicidialCampaignStat::whereIn('campaign_id', $closer_campaigns_sql)
                            ->selectRaw('sum(calls_today) as calls_today, sum(drops_today) as drops_today, sum(answers_today) as answers_today,
                            max(status_category_1) as status_category_1, sum(status_category_count_1) as status_category_count_1,
                            max(status_category_2) as status_category_2, sum(status_category_count_2) as status_category_count_2,
                            max(status_category_3) as status_category_3, sum(status_category_count_3) as status_category_count_3,
                            max(status_category_4) as status_category_4, sum(status_category_count_4) as status_category_count_4,
                            sum(hold_sec_stat_one) as hold_sec_stat_one, sum(hold_sec_stat_two) as hold_sec_stat_two,
                            sum(hold_sec_answer_calls) as hold_sec_answer_calls, sum(hold_sec_drop_calls) as hold_sec_drop_calls,
                            sum(hold_sec_queue_calls) as hold_sec_queue_calls')
                            ->first();

                    $status_category_1 = $campaign_statuses->status_category_1;
                    $status_category_2 = $campaign_statuses->status_category_2;
                    $status_category_3 = $campaign_statuses->status_category_3;
                    $status_category_4 = $campaign_statuses->status_category_4;
                    $status_category_count_1 = $campaign_statuses->status_category_count_1;
                    $status_category_count_2 = $campaign_statuses->status_category_count_2;
                    $status_category_count_3 = $campaign_statuses->status_category_count_3;
                    $status_category_count_4 = $campaign_statuses->status_category_count_4;
                    $drpct_today = 0;
                    $avg_hold_sec_queue_calls = 0;
                    $avg_hold_sec_drop_calls = 0;
                    $avg_answer_agent_non_pause_sec = 0;
                    $pct_hold_sec_answer_calls = '0%';
                    $pct_hold_sec_stat_two = '0%';
                    $avg_hold_sec_answer_calls = 0;
                    if (($campaign_statuses->drops_today > 0) and ( $campaign_statuses->answers_today > 0)) {
                        $drpct_today = (($campaign_statuses->drops_today / $campaign_statuses->answers_today) * 100);
                        $drpct_today = round($drpct_today, 2);
                        $drpct_today = sprintf('%01.2f', $drpct_today);
                    }

                    if ($campaign_statuses->calls_today > 0) {
                        $avg_hold_sec_queue_calls = ($campaign_statuses->hold_sec_queue_calls / $campaign_statuses->calls_today);
                        $avg_hold_sec_queue_calls = round($avg_hold_sec_queue_calls, 0);
                    }

                    if ($campaign_statuses->drops_today > 0) {
                        $avg_hold_sec_drop_calls = ($campaign_statuses->hold_sec_drop_calls / $campaign_statuses->drops_today);
                        $avg_hold_sec_drop_calls = round($avg_hold_sec_drop_calls, 0);
                    }

                    if ($campaign_statuses->answers_today > 0) {
                        $pct_hold_sec_stat_one = (($campaign_statuses->hold_sec_stat_one / $campaign_statuses->answers_today) * 100);
                        $pct_hold_sec_stat_one = round($pct_hold_sec_stat_one, 2);
                        $pct_hold_sec_stat_one = sprintf("%01.2f", $pct_hold_sec_stat_one);
                        $pct_hold_sec_answer_calls = $pct_hold_sec_stat_one . '%';

                        $pct_hold_sec_stat_two = (($campaign_statuses->hold_sec_stat_two / $campaign_statuses->answers_today) * 100);
                        $pct_hold_sec_stat_two = round($pct_hold_sec_stat_two, 2);
                        $pct_hold_sec_stat_two = sprintf("%01.2f", $pct_hold_sec_stat_two);
                        $pct_hold_sec_stat_two = $pct_hold_sec_stat_two . '%';

                        $avg_hold_sec_answer_calls = ($campaign_statuses->hold_sec_answer_calls / $campaign_statuses->answers_today);

                        if ($agent_non_pause_sec > 0) {
                            $avg_answer_agent_non_pause_sec = (($campaign_statuses->answers_today / $agent_non_pause_sec) * 60);
                            $avg_answer_agent_non_pause_sec = round($avg_answer_agent_non_pause_sec, 2);
                            $avg_answer_agent_non_pause_sec = sprintf("%01.2f", $avg_answer_agent_non_pause_sec);
                        }
                    }
                    if ($showhide == 1) {
                        $result_array['campaign_statuses']['calls_todays'] = $campaign_statuses->calls_today;
                        $result_array['campaign_statuses']['drops_today'] = $campaign_statuses->drops_today;
                        $result_array['campaign_statuses']['answers_today'] = $campaign_statuses->answers_today;
                        $result_array['campaign_statuses']['drpct_today'] = $drpct_today . '%';
                        $result_array['campaign_statuses']['avg_hold_sec_queue_calls'] = $avg_hold_sec_queue_calls;
                        $result_array['campaign_statuses']['avg_hold_sec_drop_calls'] = $avg_hold_sec_drop_calls;
                        $result_array['campaign_statuses']['avg_answer_agent_non_pause_sec'] = $avg_answer_agent_non_pause_sec;
                        $result_array['campaign_statuses']['pct_hold_sec_answer_calls'] = $pct_hold_sec_answer_calls;
                        $result_array['campaign_statuses']['pct_hold_sec_stat_two'] = $pct_hold_sec_stat_two;
                        $result_array['campaign_statuses']['avg_hold_sec_answer_calls'] = $avg_hold_sec_answer_calls;
                        $result_array['campaign_statuses']['now_time'] = $now_time;
                    }
                } else {

                    $non_inbound_sql = array_merge($group_sql, $closer_campaigns_sql);
                    if (preg_match('/ALL-ACTIVE/i', $group_string)) {
                        $multi_drop++;
                        $campaigns_total = VicidialCampaign::whereIn('campaign_id', $group_sql_and)->where('active', 'Y')
                                ->selectRaw('avg(auto_dial_level) as auto_dial_level, min(dial_status_a) as dial_status_a, min(dial_status_b) as dial_status_b, min(dial_status_c) as dial_status_c, min(dial_status_d) as dial_status_d, min(dial_status_e) as dial_status_e, min(lead_order) as lead_order, min(lead_filter_id) as lead_filter_id, sum(hopper_level) as hopper_level, min(dial_method) as dial_method, avg(adaptive_maximum_level) as adaptive_maximum_level, avg(adaptive_dropped_percentage) as adaptive_dropped_percentage, avg(adaptive_dl_diff_target) as adaptive_dl_diff_target, avg(adaptive_intensity) as adaptive_intensity, min(available_only_ratio_tally) as available_only_ratio_tally, min(adaptive_latest_server_time) as adaptive_latest_server_time, min(local_call_time) as local_call_time, avg(dial_timeout) as dial_timeout, min(dial_statuses) as dial_statuses, max(agent_pause_codes_active) as agent_pause_codes_active, max(list_order_mix) as list_order_mix, max(auto_hopper_level) as auto_hopper_level')
                                ->get()
                                ->first();
                        $campaign_statuses = VicidialCampaignStat::where('calls_today', '>', '-1');
                        if (preg_match('/N/', $with_inbound)) {
                            $campaign_statuses = $campaign_statuses->whereNotIn('campaign_id', $groups_ids);
                        } else {
                            $campaign_statuses = $campaign_statuses->whereIn('campaign_id', $non_inbound_sql);
                        }
                        $campaign_statuses = $campaign_statuses->selectRaw('sum(dialable_leads) as dialable_leads, sum(calls_today) as calls_today, sum(drops_today) as drops_today, avg(drops_answers_today_pct) as drops_answers_today_pct, avg(differential_onemin) as differential_onemin, avg(agents_average_onemin) as agents_average_onemin, sum(balance_trunk_fill) as balance_trunk_fill, sum(answers_today) as answers_today, max(status_category_1) as status_category_1, sum(status_category_count_1) as status_category_count_1, max(status_category_2) as status_category_2, sum(status_category_count_2) as status_category_count_2, max(status_category_3) as status_category_3, sum(status_category_count_3) as status_category_count_3, max(status_category_4) as status_category_4, sum(status_category_count_4) as status_category_count_4, sum(agent_calls_today) as agent_calls_today, sum(agent_wait_today) as agent_wait_today, sum(agent_custtalk_today) as agent_custtalk_today, sum(agent_acw_today) as agent_acw_today, sum(agent_pause_today) as agent_pause_today')
                                ->get()
                                ->first();
                    } else {

                        if ((preg_match('/Y/', $with_inbound)) && ( $campaign_allow_inbound > 0)) {
                            $multi_drop++;
                            $fields = ['auto_dial_level', 'dial_status_a', 'dial_status_b', 'dial_status_c', 'dial_status_d', 'dial_status_e', 'lead_order', 'lead_filter_id', 'hopper_level', 'dial_method', 'adaptive_maximum_level', 'adaptive_dropped_percentage', 'adaptive_dl_diff_target', 'adaptive_intensity', 'available_only_ratio_tally', 'adaptive_latest_server_time', 'local_call_time', 'dial_timeout', 'dial_statuses', 'agent_pause_codes_active', 'list_order_mix', 'auto_hopper_level', 'campaign_id'];
                            $campaigns_total = VicidialCampaign::whereIn('campaign_id', $non_inbound_sql)->get($fields)->first();
                            $campaign_statuses = VicidialCampaignStat::whereIn('campaign_id', $non_inbound_sql)
                                    ->selectRaw('sum(dialable_leads) as dialable_leads, sum(calls_today) as calls_today, sum(drops_today) as drops_today, avg(drops_answers_today_pct) as drops_answers_today_pct, avg(differential_onemin) as differential_onemin, avg(agents_average_onemin) as agents_average_onemin, sum(balance_trunk_fill) as balance_trunk_fill, sum(answers_today) as answers_today, max(status_category_1) as status_category_1, sum(status_category_count_1) as status_category_count_1, max(status_category_2) as status_category_2, sum(status_category_count_2) as status_category_count_2, max(status_category_3) as status_category_3, sum(status_category_count_3) as status_category_count_3, max(status_category_4) as status_category_4, sum(status_category_count_4) as status_category_count_4, sum(agent_calls_today) as agent_calls_today, sum(agent_wait_today) as agent_wait_today, sum(agent_custtalk_today) as agent_custtalk_today, sum(agent_acw_today) as agent_acw_today, sum(agent_pause_today) as agent_pause_today')
                                    ->get()
                                    ->first();
                        } else {
                            $campaigns_total = VicidialCampaign::whereIn('campaign_id', $group_sql)
                                    ->selectRaw('avg(auto_dial_level) as auto_dial_level, max(dial_status_a) as dial_status_a, max(dial_status_b) as dial_status_b, max(dial_status_c) as dial_status_c, max(dial_status_d) as dial_status_d, max(dial_status_e) as dial_status_e, max(lead_order) as lead_order, max(lead_filter_id) as lead_filter_id, max(hopper_level) as hopper_level, max(dial_method) as dial_method, max(adaptive_maximum_level) as adaptive_maximum_level, avg(adaptive_dropped_percentage) as adaptive_dropped_percentage, avg(adaptive_dl_diff_target) as adaptive_dl_diff_target, avg(adaptive_intensity) as adaptive_intensity, max(available_only_ratio_tally) as available_only_ratio_tally, max(adaptive_latest_server_time) as adaptive_latest_server_time, max(local_call_time) as local_call_time, max(dial_timeout) as dial_timeout, max(dial_statuses) as dial_statuses, max(agent_pause_codes_active) as agent_pause_codes_active, max(list_order_mix) as list_order_mix, max(auto_hopper_level) as auto_hopper_level')
                                    ->get()
                                    ->first();
                            $campaign_statuses = VicidialCampaignStat::whereIn('campaign_id', $group_sql)
                                    ->selectRaw('sum(dialable_leads) as dialable_leads, sum(calls_today) as calls_today, sum(drops_today) as drops_today, avg(drops_answers_today_pct) as drops_answers_today_pct, avg(differential_onemin) as differential_onemin, avg(agents_average_onemin) as agents_average_onemin, sum(balance_trunk_fill) as balance_trunk_fill, sum(answers_today) as answers_today, max(status_category_1) as status_category_1, sum(status_category_count_1) as status_category_count_1, max(status_category_2) status_category_2, sum(status_category_count_2) as status_category_count_2, max(status_category_3) as status_category_3, sum(status_category_count_3) as status_category_count_3, max(status_category_4) as status_category_4, sum(status_category_count_4) as status_category_count_4, sum(agent_calls_today) as agent_calls_today, sum(agent_wait_today) as agent_wait_today, sum(agent_custtalk_today) as agent_custtalk_today, sum(agent_acw_today) as agent_acw_today, sum(agent_pause_today) as agent_pause_today')
                                    ->get()
                                    ->first();
                        }
                    }

                    $leads_in_hopper = \App\VicidialHopper::whereIn('campaign_id', $group_sql_where)->count();
                    $lead_filter_id = $campaigns_total->lead_filter_id;
                    $dial_order = $campaigns_total->lead_order;
                    $drpct_today = $campaign_statuses->drops_answers_today_pct;
                    $dial_statuses = $campaign_statuses->agent_custtalk_today;
                    $agent_pause_today = 0;
                    $agent_wait_today = 0;
                    $agent_custtalk_today = 0;
                    $avg_acw_today = 0;
                    $status_category_1 = $campaign_statuses->status_category_1;
                    $status_category_2 = $campaign_statuses->status_category_2;
                    $status_category_3 = $campaign_statuses->status_category_3;
                    $status_category_4 = $campaign_statuses->status_category_4;
                    $status_category_count_1 = $campaign_statuses->status_category_count_1;
                    $status_category_count_2 = $campaign_statuses->status_category_count_2;
                    $status_category_count_3 = $campaign_statuses->status_category_count_3;
                    $status_category_count_4 = $campaign_statuses->status_category_count_4;

                    if ($multi_drop > 0) {
                        if (($campaign_statuses->drops_today > 0) && ( $campaign_statuses->answers_today > 0)) {
                            $drpct_today = (($campaign_statuses->drops_today / $campaign_statuses->answers_today) * 100);
                            $drpct_today = round($drpct_today, 2);
                            $drpct_today = sprintf("%01.2f", $drpct_today);
                        } else {
                            $drpct_today = 0;
                        }
                    }

                    if (preg_match('/DISABLED/', $campaigns_total->list_order_mix)) {
                        $dial_statuses = preg_replace('/ -$|^ /', '', $campaigns_total->dial_statuses);
                        $dial_statuses = preg_replace('/[\s_]/', ',', $dial_statuses);
                    } else {
                        $campaign_list_mix = \App\VicidialCampaignListMix::select('vcl_id')->whereIn('campaign_id', $group_sql_and)->where('status', 'ACTIVE')->first();
                        if ($campaign_list_mix->count() > 0) {
                            $dial_statuses = 'List Mix: ' . $campaign_list_mix->vcl_id;
                            $dial_order = 'List Mix: ' . $campaign_list_mix->vcl_id;
                        }
                    }
                    if ($showhide == 1) {
                        $result_array['campaign_statuses']['dial_level'] = sprintf("%01.3f", $campaigns_total->auto_dial_level);
                        $result_array['campaign_statuses']['dial_filter'] = $campaigns_total->lead_filter_id;
                        $result_array['campaign_statuses']['dial_order'] = $dial_order;
                        if ($adastats > 1) {
                            $result_array['campaign_statuses']['adaptive_maximum_level'] = $campaigns_total->adaptive_maximum_level;
                            $result_array['campaign_statuses']['adaptive_dropped_percentage'] = $campaigns_total->adaptive_dropped_percentage . '%';
                            $result_array['campaign_statuses']['adaptive_dl_diff_target'] = $campaigns_total->adaptive_dl_diff_target;
                            $result_array['campaign_statuses']['adaptive_intensity'] = $campaigns_total->adaptive_intensity;
                            $result_array['campaign_statuses']['dial_timeout'] = $campaigns_total->dial_timeout;
                            $result_array['campaign_statuses']['adaptive_latest_server_time'] = $campaigns_total->adaptive_latest_server_time;
                            $result_array['campaign_statuses']['local_call_time'] = $campaigns_total->local_call_time;
                            $result_array['campaign_statuses']['available_only_ratio_tally'] = $campaigns_total->available_only_ratio_tally;
                        }
                        $result_array['campaign_statuses']['dialable_leads'] = $campaign_statuses->dialable_leads ?: 0;
                        $result_array['campaign_statuses']['calls_today'] = $campaign_statuses->calls_today ?: 0;
                        $result_array['campaign_statuses']['dial_method'] = $campaigns_total->dial_method;
                        $result_array['campaign_statuses']['drops_today'] = $campaign_statuses->drops_today ?: 0;
                        $result_array['campaign_statuses']['answers_today'] = $campaign_statuses->answers_today ?: 0;
                        $result_array['campaign_statuses']['dial_statuses'] = $dial_statuses;
                        $result_array['campaign_statuses']['leads_in_hopper'] = $leads_in_hopper;
                        $result_array['campaign_statuses']['drops_answers_today_pct'] = $drpct_today . '%';
                        $result_array['campaign_statuses']['lable'] = 'label-info';
                        $result_array['campaign_statuses']['bar'] = 'progress-bar progress-bar-info';

                        if ($drpct_today >= $campaigns_total->adaptive_dropped_percentage) {
                            $result_array['campaign_statuses']['lable'] = 'label-danger';
                            $result_array['campaign_statuses']['bar'] = 'progress-bar progress-bar-danger';
                        }

                        if ($agent_time_stats > 0) {
                            if (($campaign_statuses->agent_calls_today > 0) && ( $campaign_statuses->agent_pause_today > 0)) {
                                $agent_pause_today = ($campaign_statuses->agent_pause_today / $campaign_statuses->agent_calls_today);
                                $agent_pause_today = round($agent_pause_today, 0);
                                $agent_pause_today = sprintf('%01.0f', $agent_pause_today);
                            }

                            if (($campaign_statuses->agent_calls_today > 0) && ( $campaign_statuses->agent_wait_today > 0)) {
                                $agent_wait_today = ($campaign_statuses->agent_wait_today / $campaign_statuses->agent_calls_today);
                                $agent_wait_today = round($agent_wait_today, 0);
                                $agent_wait_today = sprintf('%01.0f', $agent_wait_today);
                            }

                            if (($campaign_statuses->agent_calls_today > 0) && ( $campaign_statuses->agent_custtalk_today > 0)) {
                                $agent_custtalk_today = ($campaign_statuses->agent_custtalk_today / $campaign_statuses->agent_calls_today);
                                $agent_custtalk_today = round($agent_custtalk_today, 0);
                                $agent_custtalk_today = sprintf('%01.0f', $agent_custtalk_today);
                            }

                            if (($campaign_statuses->agent_calls_today > 0) && ( $campaign_statuses->agent_acw_today > 0)) {
                                $avg_acw_today = ($campaign_statuses->agent_acw_today / $campaign_statuses->agent_calls_today);
                                $avg_acw_today = round($avg_acw_today, 0);
                                $avg_acw_today = sprintf('%01.0f', $avg_acw_today);
                            }

                            $result_array['campaign_statuses']['agent_wait_today'] = $agent_wait_today;
                            $result_array['campaign_statuses']['agent_custtalk_today'] = $agent_custtalk_today;
                            $result_array['campaign_statuses']['avg_acw_today'] = $avg_acw_today;
                            $result_array['campaign_statuses']['agent_pause_today'] = $agent_pause_today;
                        }
                    }
                }

                if ($status_category_1 || $status_category_2 || $status_category_3 || $status_category_4) {
                    if ((!preg_match('/NULL/i', $status_category_1)) && ( strlen($status_category_1) > 0)) {
                        $result_array['campaign_statuses']['status_category_1'] = $status_category_count_1;
                    }
                    if ((!preg_match('/NULL/i', $status_category_2)) && ( strlen($status_category_2) > 0)) {
                        $result_array['campaign_statuses']['status_category_2'] = $status_category_count_2;
                    }
                    if ((!preg_match('/NULL/i', $status_category_3)) && ( strlen($status_category_3) > 0)) {
                        $result_array['campaign_statuses']['status_category_3'] = $status_category_count_3;
                    }
                    if ((!preg_match('/NULL/i', $status_category_4)) && ( strlen($status_category_4) > 0)) {
                        $result_array['campaign_statuses']['status_category_4'] = $status_category_count_4;
                    }
                }

                if ($rt_ajax < 1) {

                    if ($adastats < 2) {
                        $result_array['url1'] = "<a href=\"$php_self?$user_group_qs$group_qs&rr=$rr&db=$db&adastats=2&spi_monitor_link=$spi_monitor_link&iax_monitor_link=$iax_monitor_link&usergroup=$usergroup&ug_display=$ug_display&uid_or_name=$uid_or_name&order_by=$order_by&serv_display=$serv_display&calls_display=$calls_display&phone_display=$phone_display&cust_phone_display=$cust_phone_display&with_inbound=$with_inbound&monitor_active=$monitor_active&monitor_phone=$monitor_phone&all_ingroup_stats=$all_ingroup_stats&drop_ingroup_stats=$drop_ingroup_stats&no_leads_alert=$no_leads_alert&carrier_stats=$carrier_stats&preset_stats=$preset_stats&agent_time_stats=$agent_time_stats\"><font size=1>+ VIEW MORE</font></a>";
                    } else {
                        $result_array['url1'] = "<a href=\"$php_self?$user_group_qs$group_qs&rr=$rr&db=$db&adastats=1&spi_monitor_link=$spi_monitor_link&iax_monitor_link=$iax_monitor_link&usergroup=$usergroup&ug_display=$ug_display&uid_or_name=$uid_or_name&order_by=$order_by&serv_display=$serv_display&calls_display=$calls_display&phone_display=$phone_display&cust_phone_display=$cust_phone_display&with_inbound=$with_inbound&monitor_active=$monitor_active&monitor_phone=$monitor_phone&all_ingroup_stats=$all_ingroup_stats&drop_ingroup_stats=$drop_ingroup_stats&no_leads_alert=$no_leads_alert&carrier_stats=$carrier_stats&preset_stats=$preset_stats&agent_time_stats=$agent_time_stats\"><font size=1>+ VIEW LESS</font></a>";
                    }
                    if ($ug_display > 0) {
                        $result_array['url2'] = "<a href=\"$php_self?$user_group_qs$group_qs&rr=$rr&db=$db&adastats=$adastats&spi_monitor_link=$spi_monitor_link&iax_monitor_link=$iax_monitor_link&usergroup=$usergroup&ug_display=0&uid_or_name=$uid_or_name&order_by=$order_by&serv_display=$serv_display&calls_display=$calls_display&phone_display=$phone_display&cust_phone_display=$cust_phone_display&with_inbound=$with_inbound&monitor_active=$monitor_active&monitor_phone=$monitor_phone&all_ingroup_stats=$all_ingroup_stats&drop_ingroup_stats=$drop_ingroup_stats&no_leads_alert=$no_leads_alert&carrier_stats=$carrier_stats&preset_stats=$preset_stats&agent_time_stats=$agent_time_stats\"><font size=1>HIDE AGENT GROUP</font></a>";
                    } else {
                        $result_array['url2'] = "<a href=\"$php_self?$user_group_qs$group_qs&rr=$rr&db=$db&adastats=$adastats&spi_monitor_link=$spi_monitor_link&iax_monitor_link=$iax_monitor_link&usergroup=$usergroup&ug_display=1&uid_or_name=$uid_or_name&order_by=$order_by&serv_display=$serv_display&calls_display=$calls_display&phone_display=$phone_display&cust_phone_display=$cust_phone_display&with_inbound=$with_inbound&monitor_active=$monitor_active&monitor_phone=$monitor_phone&all_ingroup_stats=$all_ingroup_stats&drop_ingroup_stats=$drop_ingroup_stats&no_leads_alert=$no_leads_alert&carrier_stats=$carrier_stats&preset_stats=$preset_stats&agent_time_stats=$agent_time_stats\"><font size=1>VIEW AGENT GROUP</font></a>";
                    }
                    if ($serv_display > 0) {
                        $result_array['url3'] = "<a href=\"$php_self?$user_group_qs$group_qs&rr=$rr&db=$db&adastats=$adastats&spi_monitor_link=$spi_monitor_link&iax_monitor_link=$iax_monitor_link&usergroup=$usergroup&ug_display=$ug_display&uid_or_name=$uid_or_name&order_by=$order_by&serv_display=0&calls_display=$calls_display&phone_display=$phone_display&cust_phone_display=$cust_phone_display&with_inbound=$with_inbound&monitor_active=$monitor_active&monitor_phone=$monitor_phone&all_ingroup_stats=$all_ingroup_stats&drop_ingroup_stats=$drop_ingroup_stats&no_leads_alert=$no_leads_alert&carrier_stats=$carrier_stats&preset_stats=$preset_stats&agent_time_stats=$agent_time_stats\"><font size=1>HIDE SERVER INFO</font></a>";
                    } else {
                        $result_array['url3'] = "<a href=\"$php_self?$user_group_qs$group_qs&rr=$rr&db=$db&adastats=$adastats&spi_monitor_link=$spi_monitor_link&iax_monitor_link=$iax_monitor_link&usergroup=$usergroup&ug_display=$ug_display&uid_or_name=$uid_or_name&order_by=$order_by&serv_display=1&calls_display=$calls_display&phone_display=$phone_display&cust_phone_display=$cust_phone_display&with_inbound=$with_inbound&monitor_active=$monitor_active&monitor_phone=$monitor_phone&all_ingroup_stats=$all_ingroup_stats&drop_ingroup_stats=$drop_ingroup_stats&no_leads_alert=$no_leads_alert&carrier_stats=$carrier_stats&preset_stats=$preset_stats&agent_time_stats=$agent_time_stats\"><font size=1>SHOW SERVER INFO</font></a>";
                    }
                    if ($calls_display > 0) {
                        $result_array['url4'] = "<a href=\"$php_self?$user_group_qs$group_qs&rr=$rr&db=$db&adastats=$adastats&spi_monitor_link=$spi_monitor_link&iax_monitor_link=$iax_monitor_link&usergroup=$usergroup&ug_display=$ug_display&uid_or_name=$uid_or_name&order_by=$order_by&serv_display=$serv_display&calls_display=0&phone_display=$phone_display&cust_phone_display=$cust_phone_display&with_inbound=$with_inbound&monitor_active=$monitor_active&monitor_phone=$monitor_phone&all_ingroup_stats=$all_ingroup_stats&drop_ingroup_stats=$drop_ingroup_stats&no_leads_alert=$no_leads_alert&carrier_stats=$carrier_stats&preset_stats=$preset_stats&agent_time_stats=$agent_time_stats\"><font size=1>HIDE WAITING CALLS</font></a>";
                    } else {
                        $result_array['url4'] = "<a href=\"$php_self?$user_group_qs$group_qs&rr=$rr&db=$db&adastats=$adastats&spi_monitor_link=$spi_monitor_link&iax_monitor_link=$iax_monitor_link&usergroup=$usergroup&ug_display=$ug_display&uid_or_name=$uid_or_name&order_by=$order_by&serv_display=$serv_display&calls_display=1&phone_display=$phone_display&cust_phone_display=$cust_phone_display&with_inbound=$with_inbound&monitor_active=$monitor_active&monitor_phone=$monitor_phone&all_ingroup_stats=$all_ingroup_stats&drop_ingroup_stats=$drop_ingroup_stats&no_leads_alert=$no_leads_alert&carrier_stats=$carrier_stats&preset_stats=$preset_stats&agent_time_stats=$agent_time_stats\"><font size=1>SHOW WAITING CALLS</font></a>";
                    }

                    if ($all_ingroup_stats > 0) {
                        $result_array['url5'] = "<a href=\"$php_self?$user_group_qs$group_qs&rr=$rr&db=$db&adastats=$adastats&spi_monitor_link=$spi_monitor_link&iax_monitor_link=$iax_monitor_link&usergroup=$usergroup&ug_display=$ug_display&uid_or_name=$uid_or_name&order_by=$order_by&serv_display=$serv_display&calls_display=$calls_display&phone_display=$phone_display&cust_phone_display=$cust_phone_display&with_inbound=$with_inbound&monitor_active=$monitor_active&monitor_phone=$monitor_phone&$all_ingroup_stats=0&drop_ingroup_stats=$drop_ingroup_stats&no_leads_alert=$no_leads_alert&carrier_stats=$carrier_stats&preset_stats=$preset_stats&agent_time_stats=$agent_time_stats\"><font size=1>HIDE IN-GROUP STATS</font></a>";
                    } else {
                        $result_array['url5'] = "<a href=\"$php_self?$user_group_qs$group_qs&rr=$rr&db=$db&adastats=$adastats&spi_monitor_link=$spi_monitor_link&iax_monitor_link=$iax_monitor_link&usergroup=$usergroup&ug_display=$ug_display&uid_or_name=$uid_or_name&order_by=$order_by&serv_display=$serv_display&calls_display=$calls_display&phone_display=$phone_display&cust_phone_display=$cust_phone_display&with_inbound=$with_inbound&monitor_active=$monitor_active&monitor_phone=$monitor_phone&$all_ingroup_stats=1&drop_ingroup_stats=$drop_ingroup_stats&no_leads_alert=$no_leads_alert&carrier_stats=$carrier_stats&preset_stats=$preset_stats&agent_time_stats=$agent_time_stats\"><font size=1>SHOW IN-GROUP STATS</font></a>";
                    }
                    if ($phone_display > 0) {
                        $result_array['url6'] = "<a href=\"$php_self?$user_group_qs$group_qs&rr=$rr&db=$db&adastats=$adastats&spi_monitor_link=$spi_monitor_link&iax_monitor_link=$iax_monitor_link&usergroup=$usergroup&ug_display=$ug_display&uid_or_name=$uid_or_name&order_by=$order_by&serv_display=$serv_display&calls_display=$calls_display&phone_display=0&cust_phone_display=$cust_phone_display&with_inbound=$with_inbound&monitor_active=$monitor_active&monitor_phone=$monitor_phone&all_ingroup_stats=$all_ingroup_stats&drop_ingroup_stats=$drop_ingroup_stats&no_leads_alert=$no_leads_alert&carrier_stats=$carrier_stats&preset_stats=$preset_stats&agent_time_stats=$agent_time_stats\"><font size=1>HIDE PHONES</font></a>";
                    } else {
                        $result_array['url6'] = "<a href=\"$php_self?$user_group_qs$group_qs&rr=$rr&db=$db&adastats=$adastats&spi_monitor_link=$spi_monitor_link&iax_monitor_link=$iax_monitor_link&usergroup=$usergroup&ug_display=$ug_display&uid_or_name=$uid_or_name&order_by=$order_by&serv_display=$serv_display&calls_display=$calls_display&phone_display=1&cust_phone_display=$cust_phone_display&with_inbound=$with_inbound&monitor_active=$monitor_active&monitor_phone=$monitor_phone&all_ingroup_stats=$all_ingroup_stats&drop_ingroup_stats=$drop_ingroup_stats&no_leads_alert=$no_leads_alert&carrier_stats=$carrier_stats&preset_stats=$preset_stats&agent_time_stats=$agent_time_stats\"><font size=1>SHOW PHONES</font></a>";
                    }
                    if ($cust_phone_display > 0) {
                        $result_array['url7'] = "<a href=\"$php_self?$user_group_qs$group_qs&rr=$rr&db=$db&adastats=$adastats&spi_monitor_link=$spi_monitor_link&iax_monitor_link=$iax_monitor_link&usergroup=$usergroup&ug_display=$ug_display&uid_or_name=$uid_or_name&order_by=$order_by&serv_display=$serv_display&calls_display=$calls_display&phone_display=$phone_display&cust_phone_display=0&with_inbound=$with_inbound&monitor_active=$monitor_active&monitor_phone=$monitor_phone&all_ingroup_stats=$all_ingroup_stats&drop_ingroup_stats=$drop_ingroup_stats&no_leads_alert=$no_leads_alert&carrier_stats=$carrier_stats&preset_stats=$preset_stats&agent_time_stats=$agent_time_stats\"><font size=1>HIDE CUSTPHONES</font></a>";
                    } else {
                        $result_array['url7'] = "<a href=\"$php_self?$user_group_qs$group_qs&rr=$rr&db=$db&adastats=$adastats&spi_monitor_link=$spi_monitor_link&iax_monitor_link=$iax_monitor_link&usergroup=$usergroup&ug_display=$ug_display&uid_or_name=$uid_or_name&order_by=$order_by&serv_display=$serv_display&calls_display=$calls_display&phone_display=$phone_display&cust_phone_display=1&with_inbound=$with_inbound&monitor_active=$monitor_active&monitor_phone=$monitor_phone&all_ingroup_stats=$all_ingroup_stats&drop_ingroup_stats=$drop_ingroup_stats&no_leads_alert=$no_leads_alert&carrier_stats=$carrier_stats&preset_stats=$preset_stats&agent_time_stats=$agent_time_stats\"><font size=1>SHOW CUSTPHONES</font></a>";
                    }
                }

                ##### check for campaigns with no dialable leads if enabled #####
                if (($with_inbound != 'O') && ( $no_leads_alert == 'YES')) {
                    $result_array['campaign_with_no_leads'] = [];
                    $campaign_leads = VicidialCampaignStat::whereIn('campaign_id', $group_sql)->where('dialable_leads', '<', '1')->orderBy('campaign_id')->get(['campaign_id']);
                    foreach ($campaign_leads as $key => $campaign_with_no_lead) {
                        $result_array['campaign_with_no_leads'][$key] = $campaign_with_no_lead->campaign_id;
                    }
                }
            }

            ###### INBOUND/OUTBOUND CALLS
            $auto_calls = \App\VicidialAutoCall::whereNotIn('status', ['XFER'])->select('status');
            if ($calls_display > 0) {
                $auto_calls = $auto_calls->select('status', 'campaign_id', 'phone_number', 'server_ip', 'call_type', 'queue_priority', 'agent_only');
                $auto_calls = $auto_calls->selectRaw('UNIX_TIMESTAMP(call_time)');
            }
            if ($campaign_allow_inbound > 0) {
                $auto_calls = $auto_calls->where(function ($query) use($closer_campaigns_sql, $group_sql_and) {
                    $query->where('call_type', '=', 'IN')
                            ->whereIn('campaign_id', $closer_campaigns_sql)
                            ->orWhereIn('call_type', ['OUT', 'OUTBALANCE'])
                            ->whereIn('campaign_id', $group_sql_and);
                });
            } else {
                $auto_calls = $auto_calls->whereIn('campaign_id', $group_sql_and);
            }
            $auto_calls = $auto_calls->orderByRaw('queue_priority desc,campaign_id asc,call_time asc');
            $auto_calls = $auto_calls->get();
            $k = 0;
            $agent_only_count = 0;
            if ($auto_calls->count() > 0) {
                $i = 0;
                $out_total = 0;
                $out_ring = 0;
                $out_live = 0;
                $in_ivr = 0;
                foreach ($auto_calls as $key => $auto_call) {
                    if ($log_admin_hide_phone_data != '0') {
                        $phone_temp = $auto_call->phone_number;
                        if (strlen($phone_temp) > 0) {
                            if ($log_admin_hide_phone_data == '4_DIGITS') {
                                $auto_call->phone_number = str_repeat('X', (strlen($phone_temp) - 4)) . substr($phone_temp, -4, 4);
                            } elseif ($log_admin_hide_phone_data == '3_DIGITS') {
                                $auto_call->phone_number = str_repeat('X', (strlen($phone_temp) - 3)) . substr($phone_temp, -3, 3);
                            } elseif ($log_admin_hide_phone_data == '2_DIGITS') {
                                $auto_call->phone_number = str_repeat('X', (strlen($phone_temp) - 2)) . substr($phone_temp, -2, 2);
                            } else {
                                $auto_call->phone_number = preg_replace('/./', 'X', $phone_temp);
                            }
                        }
                    }

                    if (preg_match('/LIVE/i', $auto_call->status)) {
                        $out_live++;
                        if ($calls_display > 0) {
                            $cd_status[$k] = $auto_call->status;
                            $cd_campaign_id[$k] = $auto_call->campaign_id;
                            $cd_phone_number[$k] = $auto_call->phone_number;
                            $cd_server_ip[$k] = $auto_call->server_ip;
                            $cd_call_time[$k] = $auto_call->call_time;
                            $cd_call_type[$k] = $auto_call->call_type;
                            $cd_queue_priority[$k] = $auto_call->queue_priority;
                            $cd_agent_only[$k] = $auto_call->agent_only;
                            if (strlen($cd_agent_only[$k]) > 0) {
                                $agent_only_count++;
                            }
                            $k++;
                        }
                    } else {
                        if (preg_match('/IVR/i', $auto_call->status)) {
                            $in_ivr++;
                            if ($calls_display > 0) {
                                $cd_status[$k] = $auto_call->status;
                                $cd_campaign_id[$k] = $auto_call->campaign_id;
                                $cd_phone_number[$k] = $auto_call->phone_number;
                                $cd_server_ip[$k] = $auto_call->server_ip;
                                $cd_call_time[$k] = $auto_call->call_time;
                                $cd_call_type[$k] = $auto_call->call_type;
                                $cd_queue_priority[$k] = $auto_call->queue_priority;
                                $cd_agent_only[$k] = $auto_call->agent_only;
                                if (strlen($cd_agent_only[$k]) > 0) {
                                    $agent_only_count++;
                                }
                                $k++;
                            }
                        }
                        if (preg_match('/CLOSER/i', $auto_call->status)) {
                            $nothing = 1;
                        } else {
                            $out_ring++;
                        }
                    }
                    $out_total++;
                    $i++;
                }

                if ($campaign_allow_inbound > 0) {
                    $result_array['live_calls_list']['current_active']['class'] = ($out_total > 0) ? 'tile-green' : 'tile-gray';
                    $result_array['live_calls_list']['current_active']['calls'] = $out_total;
                    $result_array['live_calls_list']['current_active']['name'] = "Current Active";
                } else {
                    $result_array['live_calls_list']['current_active']['class'] = ($out_total > 0) ? 'tile-orange' : 'tile-gray';
                    $result_array['live_calls_list']['current_active']['calls'] = $out_total;
                    $result_array['live_calls_list']['current_active']['name'] = "Current Active";
                }
                $result_array['live_calls_list']['outbound']['class'] = ($out_ring > 0) ? 'outbounds-calls-class' : 'tile-gray';
                $result_array['live_calls_list']['outbound']['calls'] = $out_ring;
                $result_array['live_calls_list']['outbound']['name'] = "outbound";

                $result_array['live_calls_list']['inqueue']['class'] = ($out_live > 0) ? 'queue-class' : 'tile-gray';
                $result_array['live_calls_list']['inqueue']['calls'] = $out_live;
                $result_array['live_calls_list']['inqueue']['name'] = "inqueue";
            } else {
                $result_array['live_calls_list'] = [];
            }

            ###### CALLS WAITING

            $result_array['live_calls_table_header'] = ['STATUS', 'CAMPAIGN', 'PHONE NUMBER', 'SERVER IP', 'DIAL TIME', 'CALL TYPE', 'PRIORITY'];
            $result_array['live_calls_table_values'] = [];
            $p = 0;
            while ($p < $k) {

                $call_time_s = ($start_time - $cd_call_time[$p]);
                $call_time_ms = $this->convertToSec($call_time_s, 'M');

                if ($cd_call_type[$p] == 'IN') {
                    $live_call_table_row_color[$p] = 'csc' . $cd_campaign_id[$p];
                }

                $call_type_display = '';
                if (strlen($cd_agent_only[$p]) > 0) {
                    $call_type_display = sprintf('%8s', $cd_agent_only[$p]);
                }

                $live_call_table_row[$p][] = sprintf('%-6s', $cd_status[$p]);
                $live_call_table_row[$p][] = sprintf('%-20s', $cd_campaign_id[$p]);
                $live_call_table_row[$p][] = sprintf('%-12s', $cd_phone_number[$p]);
                $live_call_table_row[$p][] = sprintf('%-15s', $cd_server_ip[$p]);
                $live_call_table_row[$p][] = sprintf('%7s', $call_time_ms);
                $live_call_table_row[$p][] = sprintf('%-10s', $cd_call_type[$p]);
                $live_call_table_row[$p][] = sprintf('%8s', $cd_queue_priority[$p]);
                if (!empty($call_type_display))
                    $live_call_table_row[$p][] = $call_type_display;
                $p++;
                $result_array['live_calls_table_values'] = $live_call_table_row;
            }

            ###### AGENT TIME ON SYSTEM
            $agent_incall = $agent_ready = $agent_paused = $agent_dispo = $agent_dead = $agent_total = 0;
            $phoneord = $userord = $groupord = $timeord = $campaignord = $order_by;

            $phoneord = ($phoneord == 'phoneup') ? 'phonedown' : 'phoneup';
            $userord = ($userord == 'userup') ? 'userdown' : 'userup';
            $groupord = ($groupord == 'groupup') ? 'groupdown' : 'groupup';
            $timeord = ($timeord == 'timeup') ? 'timedown' : 'timeup';
            $campaignord = ($campaignord == 'campaignup') ? 'campaigndown' : 'campaignup';

            $order_sql = '';
            switch ($order_by) {
                case 'timeup':
                    $order_sql = 'vicidial_live_agents.status,last_call_time';
                    break;
                case 'timedown':
                    $order_sql = 'vicidial_live_agents.status desc,last_call_time desc';
                    break;
                case 'campaignup':
                    $order_sql = 'vicidial_live_agents.campaign_id,vicidial_live_agents.status,last_call_time';
                    break;
                case 'campaigndown':
                    $order_sql = 'vicidial_live_agents.campaign_id desc,vicidial_live_agents.status desc,last_call_time desc';
                    break;
                case 'groupup':
                    $order_sql = 'user_group,vicidial_live_agents.status,last_call_time';
                    break;
                case 'groupdown':
                    $order_sql = 'user_group desc,vicidial_live_agents.status desc,last_call_time desc';
                    break;
                case 'phoneup':
                    $order_sql = 'extension,server_ip';
                    break;
                case 'phonedown':
                    $order_sql = 'extension desc,server_ip desc';
                    break;
            }

            if ($uid_or_name > 0) {
                $order_sql = ($order_by == 'userup') ? 'full_name,status,last_call_time' : '';
                $order_sql = ($order_by == 'userdown') ? 'full_name desc,status desc,last_call_time desc' : '';
            } else {
                $order_sql = ($order_by == 'userup') ? 'vicidial_live_agents.user' : '';
                $order_sql = ($order_by == 'userdown') ? 'vicidial_live_agents.user desc' : '';
            }

            $campaign_sql = [];
            $user_group_filter_sql = [];
            $user_group_sql_1 = '';
            if ((preg_match('/ALL-ACTIVE/i', $group_string)) && (empty($group_sql))) {
                $campaign_sql = [];
            } else {
                $campaign_sql = $group_sql;
            }
            if (strlen($usergroup) > 1) {
                $user_group_sql_1 = $usergroup;
            }

            if ((preg_match('/ALL-GROUPS/i', $user_group_string)) && (empty($user_group_sql))) {
                $user_group_filter_sql = [];
            } else {
                $user_group_filter_sql = $user_group_sql;
            }

            $ring_agents = 0;
            $live_agents = \App\VicidialLiveAgent::join('vicidial_users', 'vicidial_users.user', 'vicidial_live_agents.user')
                    ->select('extension', 'call_server_ip', 'on_hook_agent', 'ring_callerid', 'agent_log_id', 'lead_id', 'conf_exten')
                    ->selectRaw('vicidial_live_agents.user, vicidial_live_agents.status, vicidial_live_agents.server_ip, vicidial_live_agents.campaign_id, vicidial_users.user_group, vicidial_users.full_name, vicidial_live_agents.comments, vicidial_live_agents.calls_today, vicidial_live_agents.callerid, vicidial_users.user, vicidial_live_agents.user, UNIX_TIMESTAMP(last_call_time) as last_call_time, UNIX_TIMESTAMP(last_call_finish) as last_call_finish, UNIX_TIMESTAMP(last_state_change) as last_state_change');
            if (!empty($campaign_sql)) {
                $live_agents = $live_agents->whereIn('vicidial_live_agents.campaign_id', $campaign_sql);
            }
            if ($user_group_sql_1 != '') {
                $live_agents = $live_agents->where('user_group', $user_group_sql_1);
            }
            if (!empty($user_group_filter_sql)) {
                $live_agents = $live_agents->whereIn('vicidial_users.user_group', $user_group_filter_sql);
            }
            if ($order_sql != '') {
                $live_agents = $live_agents->orderByRaw($order_sql);
            }
            $live_agents = $live_agents->get();
            $list_code_array = [];
            $list_id_array = [];
            if ($live_agents->count() > 0) {
                foreach ($live_agents as $key => $live_agent) {
                    $list = \App\VicidialList::select('vendor_lead_code', 'list_id')->where('user', $live_agent->user)->where('lead_id', $live_agent->lead_id)->first();
                    if ($list) {
                        $list_code_array[$key] = $list->vendor_lead_code;
                        $list_id_array[$key] = $list->list_id;
                    }

                    $extension_array[$key] = $live_agent->extension;
                    $user_array[$key] = $live_agent->user;
                    $session_id_array[$key] = $live_agent->conf_exten;
                    $status_array[$key] = $live_agent->status;
                    $server_ip_array[$key] = $live_agent->server_ip;
                    $call_time_array[$key] = $live_agent->last_call_time;
                    $call_finish_array[$key] = $live_agent->last_call_finish; // not use
                    $call_server_ip_array[$key] = $live_agent->call_server_ip;
                    $campaign_id_array[$key] = $live_agent->campaign_id;
                    $user_group_array[$key] = $live_agent->user_group;
                    $full_name_array[$key] = $live_agent->full_name;
                    $comments_array[$key] = $live_agent->comments;
                    $calls_today_array[$key] = $live_agent->calls_today;
                    $caller_id_array[$key] = $live_agent->callerid;
                    $lead_id_array[$key] = $live_agent->lead_id;
                    $state_change_array[$key] = $live_agent->last_state_change;
                    $on_hook_agent_array[$key] = $live_agent->on_hook_agent;
                    $ring_caller_id_array[$key] = $live_agent->ring_callerid;
                    $agent_log_id_array[$key] = $live_agent->agent_log_id;
                    $ring_note_array[$key] = ' ';

                    if ($on_hook_agent_array[$key] == 'Y') {
                        $ring_note_array[$key] = '*';
                        $ring_agents++;
                        if (strlen($ring_caller_id_array[$key]) > 18) {
                            $status_array[$key] = 'RING';
                        }
                    }


                    ### 3-WAY Check ###
                    if ($lead_id_array[$key] != 0) {
                        $live_agent_call_time = \App\VicidialLiveAgent::selectRaw('UNIX_TIMESTAMP(last_call_time) as last_call_time')
                                ->where('lead_id', $lead_id_array[$key])
                                ->where('status', 'INCALL')
                                ->orderByRaw('UNIX_TIMESTAMP(last_call_time) desc')
                                ->get();
                        if ($live_agent_call_time->count() > 1) {
                            $status_array[$key] = '3-WAY';
                            $call_most_recent[$key] = $live_agent_call_time->first()->last_call_time;
                        }
                    }
                    ### END 3-WAY Check ###
                }

                $callerids = '';
                $pausecode = '';
                $calls = \App\VicidialAutoCall::get(['callerid', 'lead_id', 'phone_number']);
                if ($calls->count() > 0) {
                    foreach ($calls as $key => $call) {
                        if ($log_admin_hide_phone_data != '0') {
                            $phone_temp = $call->phone_number;
                            if (strlen($phone_temp) > 0) {
                                if ($log_admin_hide_phone_data == '4_DIGITS') {
                                    $call->phone_number = str_repeat("X", (strlen($phone_temp) - 4)) . substr($phone_temp, -4, 4);
                                } elseif ($log_admin_hide_phone_data == '3_DIGITS') {
                                    $call->phone_number = str_repeat("X", (strlen($phone_temp) - 3)) . substr($phone_temp, -3, 3);
                                } elseif ($log_admin_hide_phone_data == '2_DIGITS') {
                                    $call->phone_number = str_repeat("X", (strlen($phone_temp) - 2)) . substr($phone_temp, -2, 2);
                                } else {
                                    $call->phone_number = preg_replace("/./", 'X', $phone_temp);
                                }
                            }
                        }
                        $callerids .= "$call->callerid|";
                        $vac_lead_ids[$key] = $call->lead_id;
                        $vac_phones[$key] = $call->phone_number;
                    }
                }

                ### Lookup phone logins
                foreach ($live_agents as $key => $live_agent) {
                    $phones = \App\Phone::where('server_ip', $server_ip_array[$key]);
                    $protocol = '';

                    if (preg_match('/R\//i', $extension_array[$key])) {
                        $protocol = 'EXTERNAL';
                        $dialplan = preg_replace('/R\//i', '', $extension_array[$key]);
                        $dialplan = preg_replace('/\@.*/', '', $dialplan);
                        $phones = $phones->where('dialplan_number', $dialplan);
                    }
                    if (preg_match('/Local\//i', $extension_array[$key])) {
                        $protocol = 'EXTERNAL';
                        $dialplan = preg_replace('/Local\//i', '', $extension_array[$key]);
                        $dialplan = preg_replace('/\@.*/', '', $dialplan);
                        $phones = $phones->where('dialplan_number', $dialplan);
                    }
                    if (preg_match('/SIP\//i', $extension_array[$key])) {
                        $protocol = 'SIP';
                        $dialplan = preg_replace('/SIP\//i', '', $extension_array[$key]);
                        $dialplan = preg_replace('/-.*/', '', $dialplan);
                        $phones = $phones->where('extension', $dialplan);
                    }
                    if (preg_match('/IAX2\//i', $extension_array[$key])) {
                        $protocol = 'IAX2';
                        $dialplan = preg_replace('/IAX2\//i', "", $extension_array[$key]);
                        $dialplan = preg_replace("/-.*/", '', $dialplan);
                        $phones = $phones->where('extension', $dialplan);
                    }
                    if (preg_match('/Zap\//i', $extension_array[$key])) {
                        $protocol = 'Zap';
                        $dialplan = preg_replace('/Zap\//i', "", $extension_array[$key]);
                        $phones = $phones->where('extension', $dialplan);
                    }
                    if (preg_match('/DAHDI\//i', $extension_array[$key])) {
                        $protocol = 'Zap';
                        $dialplan = preg_replace('/DAHDI\//i', "", $extension_array[$key]);
                        $phones = $phones->where('extension', $dialplan);
                    }
                    if ($protocol != '') {
                        $phones = $phones->where('protocol', $protocol);
                    }

                    $phones = $phones->select('login')->first();
                    if ($phones->count() > 0) {
                        $phone_login[$key] = "$phones->login-----$key";
                    } else {
                        $phone_login[$key] = "$extension_array[$key]-----$key";
                    }
                }

                ### Sort by phone if selected
                if ($order_by == 'phoneup') {
                    sort($phone_login);
                }
                if ($order_by == 'phonedown') {
                    rsort($phone_login);
                }

                $j = 0;
                $agent_count = 0;
                foreach ($live_agents as $key => $live_agent) {
                    $cust_phone = '';
                    foreach ($calls as $n => $call) {
                        if ((preg_match("/$vac_lead_ids[$n]/", $lead_id_array[$j])) and ( strlen($vac_lead_ids[$n]) == strlen($lead_id_array[$j]))) {
                            $cust_phone = $vac_phones[$n];
                        }
                    }

                    $phone_split = explode("-----", $phone_login[$j]);
                    $i = $phone_split[1];

                    if (preg_match('/(READY|PAUSED)/i', $status_array[$i])) {
                        $call_time_array[$i] = $state_change_array[$i];
                        if ($lead_id_array[$i] > 0) {
                            $status_array[$i] = 'DISPO';
                            $l_status = 'DISPO';
                            $status = ' DISPO';
                        }
                    }
                    if ($non_latin < 1) {
                        $extension = preg_replace('/Local\//i', '', $extension_array[$i]);
                        $extension = sprintf('%-14s', $extension);
                        while (strlen($extension) > 14) {
                            $extension = substr("$extension", 0, -1);
                        }
                    } else {
                        $extension = preg_replace('/Local\//i', '', $extension_array[$i]);
                        $extension = sprintf('%-48s', $extension);
                        while (mb_strlen($extension, 'utf-8') > 14) {
                            $extension = mb_substr("$extension", 0, -1, 'utf8');
                        }
                    }
                    #Show Campaign name
                    $campaignIDName = '';
                    $campaign = VicidialCampaign::select('campaign_id', 'campaign_name')->where('campaign_id', $campaign_id_array[$i])->first();
                    if ($campaign instanceof VicidialCampaign) {
                        $campaignIDName = $campaign->campaign_id . ' - ' . $campaign->campaign_name;
                    }

                    $phone = sprintf('%-12s', $phone_split[0]);
                    $cust_phone = sprintf('%-11s', $cust_phone);
                    $l_user = $user_array[$i];
                    $user = sprintf('%-20s', $user_array[$i]);
                    $l_session_id = $session_id_array[$i];
                    $sessionid = sprintf('%-9s', $session_id_array[$i]);
                    $l_status = $status_array[$i];
                    $status = sprintf('%-6s', $status_array[$i]);
                    $l_server_ip = $server_ip_array[$i];
                    $server_ip = sprintf('%-15s', $server_ip_array[$i]);
                    $call_server_ip = sprintf('%-15s', $call_server_ip_array[$i]);
                    $campaign_id = ($campaignIDName != '') ? sprintf('%-10s', $campaignIDName) : sprintf('%-10s', $campaign_id_array[$i]); //sprintf("%-10s", $campaign_id_array[$i]);
                    $comments = $comments_array[$i];
                    $calls_today = sprintf('%-5s', $calls_today_array[$i]);

                    $list_code = isset($list_code_array[$i]) ? $list_code_array[$i] : '';
                    $list_id = isset($list_id_array[$i]) ? $list_id_array[$i] : '';

                    $pausecode = '';
                    if (!preg_match('/N/', $agent_pause_codes_active)) {
                        $pausecode = '       ';
                    }

                    $cm = ' ';
                    if (preg_match('/INCALL/i', $l_status)) {
                        $parked_channel = \App\ParkedChannel::where('channel_group', $caller_id_array[$i])->count();
                        if ($parked_channel > 0) {
                            $status_array[$i] = 'PARK';
                            $l_status = 'PARK';
                            $status = ' PARK ';
                        } else {
                            if (!preg_match("/$caller_id_array[$i]|/", $callerids)) {
                                $call_time_array[$i] = $state_change_array[$i];
                                $status_array[$i] = 'DEAD';
                                $l_status = 'DEAD';
                                $status = ' DEAD ';
                            }
                        }
                        if ((preg_match('/AUTO/i', $comments)) || ( strlen($comments) < 1)) {
                            $cm = 'A';
                        } else {
                            if (preg_match('/INBOUND/i', $comments)) {
                                $cm = 'I';
                            } else {
                                $cm = 'M';
                            }
                        }
                    }

                    $user_group = '';
                    if ($ug_display > 0) {
                        if ($non_latin < 1) {
                            $user_group = sprintf("%-12s", $user_group_array[$i]);
                            while (strlen($user_group) > 12) {
                                $user_group = substr("$user_group", 0, -1);
                            }
                        } else {
                            $user_group = sprintf("%-40s", $user_group_array[$i]);
                            while (mb_strlen($user_group, 'utf-8') > 12) {
                                $user_group = mb_substr("$user_group", 0, -1, 'utf8');
                            }
                        }
                    }
                    $user = '';
                    if ($uid_or_name > 0) {
                        if ($non_latin < 1) {
                            $user = sprintf("%-20s", $full_name_array[$i]);
                            while (strlen($user) > 20) {
                                $user = substr("$user", 0, -1);
                            }
                        } else {
                            $user = sprintf("%-60s", $full_name_array[$i]);
                            while (mb_strlen($user, 'utf-8') > 20) {
                                $user = mb_substr("$user", 0, -1, 'utf8');
                            }
                        }
                    }
                    $call_time_s = '';
                    if (!preg_match("/(INCALL|QUEUE|PARK|3-WAY)/i", $status_array[$i])) {
                        $call_time_s = ($start_time - $state_change_array[$i]);
                    } else if (preg_match("/3-WAY/", $status_array[$i])) {
                        $call_time_s = ($start_time - $call_most_recent[$i]);
                    } else {
                        $call_time_s = ($start_time - $call_time_array[$i]);
                    }

                    $call_time_ms = $this->convertToSec($call_time_s, 'M');
                    $call_time_ms = sprintf("%7s", $call_time_ms);
                    $call_time_ms = " $call_time_ms";
                    $table_col_color = 'general';
                    if (($l_status == 'INCALL') || ( $l_status == 'PARK')) {
                        if ($call_time_s >= 10) {
                            $table_col_color = 'incall-10-s';
                        }
                        if ($call_time_s >= 60) {
                            $table_col_color = 'incall-1-min';
                        }
                        if ($call_time_s >= 300) {
                            $table_col_color = 'incall-5-min';
                        }
                    }
                    if ($l_status == '3-WAY') {
                        if ($call_time_s >= 10) {
                            $table_col_color = 'agent-in-3-way';
                        }
                    }
                    if ($l_status == 'DEAD') {
                        if ($call_time_s >= 21600) {
                            $j++;
                            continue;
                        } else {
                            $agent_dead++;
                            $agent_total++;
                            if ($call_time_s >= 10) {
                                $table_col_color = 'black';
                            }
                        }
                    }
                    if ($l_status == 'DISPO') {
                        if ($call_time_s >= 21600) {
                            $j++;
                            continue;
                        } else {
                            $agent_dispo++;
                            $agent_total++;
                            $table_col_color = 'agent-dispositioning-10-s';
                            if ($call_time_s >= 10) {
                                $table_col_color = 'agent-dispositioning-10-s';
                            }
                            if ($call_time_s >= 60) {
                                $table_col_color = 'agent-dispositioning-1-min';
                            }
                            if ($call_time_s >= 300) {
                                $table_col_color = 'agent-dispositioning-5-min';
                            }
                        }
                    }
                    $pausecode = '';
                    if (preg_match('/PAUSED/i', $status)) {
                        if (!preg_match('/N/', $agent_pause_codes_active)) {
                            $twentyfour_hours_ago = date('Y-m-d H:i:s', mktime(date('H') - 24, date('i'), date('s'), date('m'), date('d'), date('Y')));
                            $agent_log = \App\VicidialAgentLog::select('sub_status')->where('agent_log_id', $agent_log_id_array[$i])->where('user', $l_user)->orderBy('agent_log_id', 'desc')->first();
                            $pausecode = sprintf('%-6s', $agent_log->sub_status);
                            $pausecode = "$pausecode";
                        }

                        if ($call_time_s >= 21600) {
                            $j++;
                            continue;
                        } else {
                            $agent_paused++;
                            $agent_total++;
                            if ($call_time_s >= 10) {
                                $table_col_color = 'agent-paused-10-s';
                            }
                            if ($call_time_s >= 60) {
                                $table_col_color = 'agent-paused-1-min';
                            }
                            if ($call_time_s >= 300) {
                                $table_col_color = 'agent-paused-5-min';
                            }
                        }
                    }

                    if ((preg_match('/INCALL/i', $status)) || ( preg_match('/QUEUE/i', $status)) || ( preg_match('/3-WAY/i', $status)) || ( preg_match('/PARK/i', $status))) {
                        $agent_incall++;
                        $agent_total++;
                    }
                    if ((preg_match('/READY/i', $status)) || ( preg_match('/CLOSER/i', $status))) {
                        $agent_ready++;
                        $agent_total++;

                        $table_col_color = 'ready-general';
                        if ($call_time_s >= 60) {
                            $table_col_color = 'ready-60-s';
                        }
                        if ($call_time_s >= 300) {
                            $table_col_color = 'ready-5-min';
                        }
                    }

                    if ($status_array[$i] == 'RING') {
                        $agent_total++;
                        if ($call_time_s >= 0) {
                            $table_col_color = 'ringing';
                        }
                    }

                    $barge = '';
                    if ($spi_monitor_link > 0) {
                        $barge = "$l_session_id|$server_ip|LISTEN";
                    }
                    if ($iax_monitor_link > 0) {
                        $barge = "$l_session_id|$server_ip|LISTEN";
                    }
                    if ($spi_monitor_link > 1) {
                        $barge = "$l_session_id|$server_ip|BARGE";
                    }
                    if ($iax_monitor_link > 1) {
                        $barge = "$l_session_id|$server_ip|BARGE";
                    }
                    if ((strlen(trim($monitor_phone)) > 1) && ( preg_match('/MONITOR|BARGE/', $monitor_active))) {
                        $barge = "$l_session_id|$l_server_ip|MONITOR|$l_user|LISTEN";
                    }
                    if ((strlen($monitor_phone) > 1) && ( preg_match('/BARGE/', $monitor_active))) {
                        $barge = "$l_session_id|$l_server_ip|BARGE|$l_user|BARGE";
                    }

                    $cp = ($cust_phone_display > 0) ? $cust_phone : '';
                    $ugd = ($ug_display > 0) ? $user_group : '';

                    if ($serv_display > 0) {
                        $svd = " $server_ip | $call_server_ip |";
                    } else {
                        $svd = '';
                        $server_ip = '';
                        $call_server_ip = '';
                    }
                    $phone_d = ($phone_display > 0) ? $phone : '';

                    $vac_stage = '';
                    $vac_campaign = '';
                    if ($cm == 'I') {
                        $inbound_group = \App\VicidialInboundGroup::join('vicidial_auto_calls as vac', 'vac.campaign_id', 'vicidial_inbound_groups.group_id')
                                ->select('vac.campaign_id', 'vac.stage', 'vicidial_inbound_groups.group_name ')
                                ->where('vac.callerid', $caller_id_array[$i])
                                ->first();
                        if ($inbound_group->count() > 0) {
                            $vac_campaign = sprintf('%-20s', "$inbound_group->campaign_id - $inbound_group->group_name");
                            $inbound_group->stage = preg_replace('/.*-/i', '', $row[1]);
                            $vac_stage = sprintf('%-4s', $inbound_group->stage);
                        }
                    }
                    $agent_count++;

                    if ($realtime_block_user_info < 1) {
                        $row_array = [
                            'station' => $extension . $ring_note_array[$i] . '*',
                            'phone_number' => $phone_d,
                            'user' => $user . '+',
                            'user_group' => $user_group,
                            'barge' => $barge,
                            'status' => $status,
                            'pausecode' => $pausecode,
                            'cust_phone' => $cp,
                            'server_ip' => $server_ip,
                            'call_server_ip' => $call_server_ip,
                            'call_time_ms' => $call_time_ms,
                            'campaign' => $campaign_id,
                            'calls_today' => $calls_today,
                            'vac_campaign' => ($vac_campaign != '' ? $vac_campaign : ' '),
                            'list_code' => ($list_code) ? $list_code : 'N/A',
                            'list_id' => ($list_id) ? $list_id : 'N/A'
                        ];

                        $values['color'] = $table_col_color;
                        foreach ($row_array as $key => $item) {
                            if (!empty($item) && $item != '') {
                                if (ctype_space($item) && $item != '') {
                                    $item = ' ';
                                }
                                $values[$key] = $item;
                            }
                        }
                        array_push($result_array['agents_list'], $values);
                    }
                    $j++;
                }

                $result_array['agents_call_list']['agents_logged_in']['text'] = 'Agents Logged In';
                $result_array['agents_call_list']['agents_logged_in']['count'] = $agent_total;
                $result_array['agents_call_list']['agents_logged_in']['color'] = ($agent_total > 0) ? 'tile-gray' : 'tile-gray';

                $result_array['agents_call_list']['agents_in_calls']['text'] = 'Agents In Calls';
                $result_array['agents_call_list']['agents_in_calls']['count'] = $agent_incall;
                $result_array['agents_call_list']['agents_in_calls']['color'] = ($agent_incall > 0) ? 'tile-green' : 'tile-gray';

                $result_array['agents_call_list']['available_agents']['text'] = 'Available Agents';
                $result_array['agents_call_list']['available_agents']['count'] = $agent_ready;
                $result_array['agents_call_list']['available_agents']['color'] = ($agent_ready > 0) ? 'tile-blue' : 'tile-gray';

                $result_array['agents_call_list']['paused_agents']['text'] = 'Paused Agents';
                $result_array['agents_call_list']['paused_agents']['count'] = $agent_paused;
                $result_array['agents_call_list']['paused_agents']['color'] = ($agent_paused > 0) ? 'paused-agents-class' : 'tile-gray';

                $result_array['agents_call_list']['dead_agents']['text'] = 'Dead Agents';
                $result_array['agents_call_list']['dead_agents']['count'] = $agent_dead;
                $result_array['agents_call_list']['dead_agents']['color'] = ($agent_dead > 0) ? 'dead-agents-class' : 'tile-gray';

                $result_array['agents_call_list']['agents_in_dispo']['text'] = 'Dispo Agents';
                $result_array['agents_call_list']['agents_in_dispo']['count'] = $agent_dispo;
                $result_array['agents_call_list']['agents_in_dispo']['color'] = ($agent_dispo > 0) ? 'dispo-agents-class' : 'tile-gray';
            }

            //$result_array['calls'] = $calls;
            //$result_array['agent_login'] = $phone_login;

            $result_array['live_agents'] = $live_agents;


            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $result_array]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.dashboard'), $e);
            throw $e;
        }
    }

    /**
     * Convert to seconds
     *
     * @param float $sec
     * @param string $precision
     * @return string
     */
    protected function convertToSec($sec, $precision, $file_download = 0) {
        if ($file_download === 1) {
            $sec = round($sec, 0);
            if ($sec < 1) {
                return "00:00:00";
            } else {
                if ($precision == 'HF') {
                    $precision = 'H';
                } else if (($sec < 3600) && ( $precision != 'S')) {
                    $precision = 'M';
                }

                switch ($precision) {
                    case 'H':
                        $fhours_h = ($sec / 3600);
                        $fhours_h_int = floor($fhours_h);
                        $fhours_h_int = intval("$fhours_h_int");
                        $fhours_m = ($fhours_h - $fhours_h_int);
                        $fhours_m = ($fhours_m * 60);
                        $fhours_m_int = floor($fhours_m);
                        $fhours_m_int = intval("$fhours_m_int");
                        $fhours_s = ($fhours_m - $fhours_m_int);
                        $fhours_s = ($fhours_s * 60);
                        $fhours_s = round($fhours_s, 0);
                        $fhours_s = ($fhours_s < 10) ? "0$fhours_s" : $fhours_s;
                        $fhours_m_int = ($fhours_m_int < 10) ? "0$fhours_m_int" : $fhours_m_int;
                        $ftime = "$fhours_h_int:$fhours_m_int:$fhours_s";
                        break;
                    case 'M':
                        $fminutes_m = ($sec / 60);
                        $fminutes_m_int = floor($fminutes_m);
                        $fminutes_m_int = intval("$fminutes_m_int");
                        $fminutes_s = ($fminutes_m - $fminutes_m_int);
                        $fminutes_s = ($fminutes_s * 60);
                        $fminutes_s = round($fminutes_s, 0);
                        $fminutes_s = ($fminutes_s < 10) ? "0$fminutes_s" : $fminutes_s;
                        $ftime = "00:$fminutes_m_int:$fminutes_s";
                        break;
                    case 'S':
                        $ftime = "00:00:$sec";
                        break;
                }
                return "$ftime";
            }
        } else {
            $sec = round($sec, 0);
            if ($sec < 1) {
                $response = ($precision == 'HF') ? "00:00:00" : "0:00";
                return $response;
            } else {
                if ($precision == 'HF') {
                    $precision = 'H';
                } else if (($sec < 3600) and ( $precision != 'S')) {
                    $precision = 'M';
                }

                switch ($precision) {
                    case 'H':
                        $fhours_h = ($sec / 3600);
                        $fhours_h_int = floor($fhours_h);
                        $fhours_h_int = intval("$fhours_h_int");
                        $fhours_m = ($Fhours_H - $fhours_h_int);
                        $fhours_m = ($fhours_m * 60);
                        $fhours_m_int = floor($fhours_m);
                        $fhours_m_int = intval("$fhours_m_int");
                        $fhours_s = ($fhours_m - $fhours_m_int);
                        $fhours_s = ($fhours_s * 60);
                        $fhours_s = round($fhours_s, 0);
                        $fhours_s = ($fhours_s < 10) ? "0$fhours_s" : $fhours_s;
                        $fhours_m_int = ($fhours_m_int < 10) ? "0$fhours_m_int" : $fhours_m_int;
                        $ftime = "$fhours_h_int:$fhours_m_int:$fhours_s";
                        break;
                    case 'M':
                        $fminutes_m = ($sec / 60);
                        $fminutes_m_int = floor($fminutes_m);
                        $fminutes_m_int = intval("$fminutes_m_int");
                        $fminutes_s = ($fminutes_m - $fminutes_m_int);
                        $fminutes_s = ($fminutes_s * 60);
                        $fminutes_s = round($fminutes_s, 0);
                        $fminutes_s = ($fminutes_s < 10) ? "0$fminutes_s" : $fminutes_s;
                        $ftime = "$fminutes_m_int:$fminutes_s";
                        break;
                    case 'S':
                        $ftime = $sec;
                        break;
                }
                return "$ftime";
            }
        }
    }

    /**
     * Get server load
     *
     * @param boolean $windows
     * @return boolean
     */
    protected function getServerLoad($windows = FALSE) {
        $os = strtolower(PHP_OS);
        if (strpos($os, "win") === FALSE) {
            if (file_exists("/proc/loadavg")) {
                $load = file_get_contents("/proc/loadavg");
                $load = explode(' ', $load);
                return $load[0] . ' ' . $load[1] . ' ' . $load[2];
            } elseif (function_exists("shell_exec")) {
                $load = explode(' ', `uptime`);
                return $load[count($load) - 3] . ' ' . $load[count($load) - 2] . ' ' . $load[count($load) - 1];
            } else {
                return FALSE;
            }
        } elseif ($windows) {
            if (class_exists("COM")) {
                $wmi = new COM("WinMgmts:\\\\.");
                $cpus = $wmi->InstancesOf("Win32_Processor");

                $cpuload = 0;
                $i = 0;
                while ($cpu = $cpus->Next()) {
                    $cpuload += $cpu->LoadPercentage;
                    $i++;
                }
                $cpuload = round($cpuload / $i, 2);
                return "$cpuload%";
            } else {
                return FALSE;
            }
        }
    }

    /**
     *
     * @param Request $request
     * @return type
     */
    public function staticApi(Request $request) {
        $result = json_decode('{"status":200,"msg":"Success","data":{"campaign_statuses":{"dial_level":"1.569","dial_filter":"NONE","dial_order":"DOWN","dialable_leads":"1820","calls_today":"30","dial_method":"INBOUND_MAN","drops_today":"2","answers_today":"24","dial_statuses":"11,A,AA,AFAX","leads_in_hopper":16,"drops_answers_today_pct":"8.33%","lable":"label-danger","bar":"progress-bar progress-bar-danger"},"live_calls_list":[],"live_calls_table_title":["STATUS","CAMPAIGN","PHONE NUMBER","SERVER IP","DIAL TIME","CALL TYPE","PRIORITY"],"agents_list":[{"color":"agent-paused-1-min","station":"SIP/7864       *","user":"Pritee Test         +","barge":"8600051|208.74.137.113|MONITOR|7864|LISTEN","status":"PAUSED","pausecode":" ","call_time_ms":"    1:48","campaign":"LeadBeam - LeadBeam v2 Testing","calls_today":"18   ","vac_campaign":" ","list_code":"N/A","list_id":"N/A"}],"agents_call_list":{"agents_logged_in":{"count":1,"color":"tile-gray"},"agents_in_calls":{"count":0,"color":"tile-gray"},"available_agents":{"count":0,"color":"tile-gray"},"paused_agents":{"count":1,"color":"paused-agents-class"},"dead_agents":{"count":0,"color":"tile-gray"},"agents_in_dispo":{"count":0,"color":"tile-gray"}},"live_agents":[{"extension":"SIP/7864","call_server_ip":null,"on_hook_agent":"N","ring_callerid":"","agent_log_id":15581,"lead_id":0,"conf_exten":"8600051","user":"7864","status":"PAUSED","server_ip":"208.74.137.113","campaign_id":"LEADBEAM","full_name":"Pritee Test","comments":"","calls_today":18,"callerid":"","last_call_time":1535085366,"last_call_finish":1535085228,"last_state_change":1535085399}]}}');
        if ($request->all_ingroup_stats == 1) {
            $result->data->stat_table = json_decode('[{"color":"#E6E6E6","campaign_id":"111111","calls_today":0,"drops_today":0,"answers_today":0,"tma_1":"0%","tma_2":"0%","drop_percent":"0%","average_hold_sec_answer_calls":"0%","average_hold_sec_drop_calls":"0%","average_hold_sec_queue_calls":"0%","average_answer_agent_non_pause_sec":"0%"},{"color":"white","campaign_id":"1200","calls_today":0,"drops_today":0,"answers_today":0,"tma_1":"0%","tma_2":"0%","drop_percent":"0%","average_hold_sec_answer_calls":"0%","average_hold_sec_drop_calls":"0%","average_hold_sec_queue_calls":"0%","average_answer_agent_non_pause_sec":"0%"},{"color":"#E6E6E6","campaign_id":"1211","calls_today":0,"drops_today":0,"answers_today":0,"tma_1":"0%","tma_2":"0%","drop_percent":"0%","average_hold_sec_answer_calls":"0%","average_hold_sec_drop_calls":"0%","average_hold_sec_queue_calls":"0%","average_answer_agent_non_pause_sec":"0%"},{"color":"white","campaign_id":"12121212","calls_today":0,"drops_today":0,"answers_today":0,"tma_1":"0%","tma_2":"0%","drop_percent":"0%","average_hold_sec_answer_calls":"0%","average_hold_sec_drop_calls":"0%","average_hold_sec_queue_calls":"0%","average_answer_agent_non_pause_sec":"0%"},{"color":"#E6E6E6","campaign_id":"122","calls_today":0,"drops_today":0,"answers_today":0,"tma_1":"0%","tma_2":"0%","drop_percent":"0%","average_hold_sec_answer_calls":"0%","average_hold_sec_drop_calls":"0%","average_hold_sec_queue_calls":"0%","average_answer_agent_non_pause_sec":"0%"}]');
        }
        if ($request->preset_stats == 1) {
            $result->data->preset_stats_totals = json_decode('[{"preset_name":"ATest","xfer_count":0},{"preset_name":"ATest","xfer_count":0},{"preset_name":"BTest","xfer_count":0},{"preset_name":"BTest","xfer_count":0},{"preset_name":"crystaltest","xfer_count":0},{"preset_name":"D1","xfer_count":0},{"preset_name":"D1","xfer_count":0},{"preset_name":"D1","xfer_count":0},{"preset_name":"DTMF Test","xfer_count":0},{"preset_name":"Leadbeam","xfer_count":3},{"preset_name":"Leadbeam","xfer_count":0},{"preset_name":"test","xfer_count":0},{"preset_name":"undefined","xfer_count":0}]');
        }
        if ($request->agent_time_stats == 1) {
            $result->data->campaign_statuses = json_decode('{"dial_level":"1.569","dial_filter":"NONE","dial_order":"DOWN","dialable_leads":"1820","calls_today":"30","dial_method":"INBOUND_MAN","drops_today":"2","answers_today":"24","dial_statuses":"11,A,AA,AFAX","leads_in_hopper":16,"drops_answers_today_pct":"8.33%","lable":"label-danger","bar":"progress-bar progress-bar-danger","agent_wait_today":"10","agent_custtalk_today":"17","avg_acw_today":"89","agent_pause_today":"33"}');
        }
        if ($request->carrier_stats == 1) {
            $result->data->carrier_log = json_decode('[{"hangup_status":"ANSWER","24_count":9,"6_hour_count":0,"1_hour_count":0,"15_minute_count":0,"5_minute_count":0,"1_minute_count":0},{"hangup_status":"BUSY","24_count":4,"6_hour_count":0,"1_hour_count":0,"15_minute_count":0,"5_minute_count":0,"1_minute_count":0},{"hangup_status":"CANCEL","24_count":2,"6_hour_count":0,"1_hour_count":0,"15_minute_count":0,"5_minute_count":0,"1_minute_count":0},{"hangup_status":"CHANUNAVAIL","24_count":9,"6_hour_count":0,"1_hour_count":0,"15_minute_count":0,"5_minute_count":0,"1_minute_count":0}]');
        }
        if ($request->no_leads_alert == 'YES') {
            $result->data->campaign_with_no_leads = json_decode('["040588","1111","1231","12312","123124","12345","15812879","1988","2004","2005","34343","40004","4444","87292888","883478","888888","95959595","Alest1","ALEX","alexte","Aroma","Callbk","callbk2","DAN598","Garthok","Jornaya","KEVIN","LeadBeam","Newcar","nw1000","nw1001","nw1002","nwtest1","nwtest10","OnHook","Test123","testvide","VB_Test","www"]');
        }
        if ($request->showhide == 0 || $request->adastats < 1) {
            $result->data->campaign_statuses = json_decode('[]');
        }
        if ($request->adastats > 1) {
            $result->data->campaign_statuses = json_decode('{"dial_level":"1.569","dial_filter":"NONE","dial_order":"DOWN","adaptive_maximum_level":2.9047619047619047,"adaptive_dropped_percentage":"7.5714285714286%","adaptive_dl_diff_target":"0.0000","adaptive_intensity":0,"dial_timeout":"45.5714","adaptive_latest_server_time":"2100","local_call_time":"","available_only_ratio_tally":"N","dialable_leads":"1040","calls_today":"31","dial_method":"INBOUND_MAN","drops_today":"2","answers_today":"25","dial_statuses":"11,A,AA,AFAX","leads_in_hopper":15,"drops_answers_today_pct":"8.00%","lable":"label-danger","bar":"progress-bar progress-bar-danger"}');
        }
        if ($request->phone_display == 1) {
            $result->data->agents_list = json_decode('[{"color":"ready-5-min","station":"SIP/7864       *","phone_number":"7864a       ","user":"Pritee Test         +","barge":"8600051|208.74.137.113|MONITOR|7864|LISTEN","status":"READY ","call_time_ms":"   50:28","campaign":"LeadBeam - LeadBeam v2 Testing","calls_today":"19   ","vac_campaign":" ","list_code":"N/A","list_id":"N/A"},{"color":"general","station":"SIP/3232       *","phone_number":"3232a       ","user":"Mohini              +","barge":"8600053|208.74.137.113|MONITOR|3232|LISTEN","status":"PAUSED","pausecode":" ","call_time_ms":"    0:00","campaign":"moh_camp - Pritee Campaign","calls_today":"4    ","vac_campaign":" ","list_code":"N/A","list_id":"N/A"}]');
        }
        if ($request->serv_display == 1) {
            $result->data->agents_list = json_decode('[{"color":"ready-5-min","station":"SIP/7864*","server_ip":"208.74.137.113 ","user":"Pritee Test         +","barge":"8600051|208.74.137.113|MONITOR|7864|LISTEN","status":"READY ","cp":" ","call_server_ip":" ","call_time_ms":"   34:22","campaign":"LeadBeam - LeadBeam v2 Testing","calls_today":"19   ","vac_campaign":" ","list_code":"N/A","list_id":"N/A"}]');
        }
        if ($request->ug_display == 1) {
            $result->data->agents_list = json_decode('[{"color":"ready-5-min","station":"SIP/7864       *","user":"Pritee Test         +","user_group":"ADMIN       ","barge":"8600051|208.74.137.113|MONITOR|7864|LISTEN","status":"READY ","call_time_ms":"   53:00","campaign":"LeadBeam - LeadBeam v2 Testing","calls_today":"19   ","vac_campaign":" ","list_code":"N/A","list_id":"N/A"}]');
        }
        return response()->json($result);
    }

}
