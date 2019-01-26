<?php

/*
 * Controller for admin utilities
 * @author Harshal Pawar.
 *
  P */

namespace App\Http\Controllers\Agents;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\VicidialUsers;
use App\VicidialUserGroup;
use App\Phone;
use App\VicidialAdminLog;
use App\Servers;
use App\ViciPhoneAlias;
use App\VicidialVoicemail;
use App\Http\Controllers\Agents\AgentsCommon;
use App\Http\Controllers\Agents\AgentsConstants as Agents;
use App\Http\Controllers\Agents\AgentsErrors;
use App\Traits\AuthCheck;
use App\Traits\Helper;
use App\Traits\ErrorLog;
use Exception;
use App\Traits\AccessControl;
use DB;
use Log;
use App\ViciAdminLog;
use App\VicidialInboundGroupAgent;
use App\VicidialCampaignAgent;
use App\VicidialCallback;
use App\SystemSetting;
use App\VicidialReportLog;
use App\VicidialLiveAgent;
use App\VicidialUserLog;
use App\VicidialTimeclockStatus;
use App\VicidialTimeclockLog;
use App\VicidialtimeclockAuditLog;
use App\QueueLog;

class AgentsController extends Controller {

    use AuthCheck,
        Helper,
        ErrorLog,
        AccessControl;

    /**
     * Get Agents list
     * @author Harshal Pawar
     * @return json
     */
    public function index(Request $request) {
        #get all admin
        try {
            $page_size = $request->input('limit') ?? 25;
            $search = '%' . $request->input('search') . '%';
            $user = $request->user();

            $list = VicidialUsers::select('user_id', 'user', 'user_group', 'full_name', 'active', 'closer_default_blended')
                    ->where('full_name', 'like', $search)
//                    ->wherein('user_group',$condition)
                    ->orWhere('user', 'like', $search)
                    ->orWhere('user_group', 'like', $search)
                    ->orderBy('user','desc')
                    ->Paginate($page_size);
            $data = [
                'status' => 200,
                'data' => $list
            ];
            return response()->json($data);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    /**
     * Set User profile status
     * @author Harshal Pawar
     */
    public function activeUser(Request $request) {
        try {
            $id = $request->input('id');
            $status = $request->input('active');
            $users = VicidialUsers::find($id);
            $users->active = $status;
            $users->save();
            if ($status == 'N') {
                $msg = 'Agent Deactivated Successfully.';
            } else {
                $msg = 'Agent Activated Successfully.';
            }
            $data = [
                'status' => 200,
                'msg' => $msg
            ];
            return response()->json($data);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    /**
     * Set User outbound status
     * @author Harshal Pawar
     */
    public function activeOutbound(Request $request) {
        try {
            $id = $request->input('id');
            $closer_default_blended = $request->input('closer_default_blended');
            $users = VicidialUsers::find($id);
            $users->closer_default_blended = $closer_default_blended;
            $users->save();
            if ($closer_default_blended == '0') {
                $msg = 'Agent Outbound Deactivated Successfully.';
            } else {
                $msg = 'Agent Outbound Activated Successfully.';
            }
            $data = [
                'status' => 200,
                'msg' => $msg
            ];
            return response()->json($data);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    /**
     * Edit user details.
     * @author Harshal Pawar
     */
    public function edit(Request $request) {
        try {
            $id = $request->input('id');
            $users = VicidialUsers::find($id);
            $admin_user_group_list = VicidialUserGroup::select('user_group', 'group_name')->get();
            $manual_dial_cid = Phone::select('outbound_cid')->find($users->user);
            $voicemail = VicidialVoicemail::select('voicemail_id', 'fullname', 'email')->orderBy('voicemail_id')->get();
            $vici_phone_list = Phone::select('voicemail_id', 'fullname', 'email')->orderBy('dialplan_number')->get();
            $data = [
                'status' => 200,
                'msg' => ".",
                'data' => [
                    'user_info' => $users,
                    'manual_dial_cid' => $manual_dial_cid,
                    'admin_user_group_list' => $admin_user_group_list,
                    'voicemail' => $voicemail,
                    'viciPhoneList' => $vici_phone_list,
                ]
            ];
            return response()->json($data);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    /**
     * Update record after save in edit case.
     * @author Harshal Pawar.
     */
    public function updateAgent(Request $request) {
        try {
            $id = $request->input('user_id');
            $users = VicidialUsers::find($id);
            $users->user = $request->input('name');
            $users->pass = $request->input('pass');
            $users->full_name = $request->input('full_name');
            $users->user_group = $request->input('user_group');
            $users->active = $request->input('active');
            $users->closer_default_blended = $request->input('closer_default_blended');
            $users->agentonly_callbacks = $request->input('agentonly_callbacks');
            $users->agent_choose_ingroups = $request->input('agent_choose_ingroups');
            $users->agentcall_manual = $request->input('agentcall_manual');
            $users->voicemail_id = $request->input('voicemail_id');
            $users->email = $request->input('email');
            $users->save();

            if ($users) {
                $user = $request->user();
                $SQLdate = date("Y-m-d H:i:s");
                $ip = $request->ip();
                $admin_log = New VicidialAdminLog();
                $admin_log->event_date = $SQLdate;
                $admin_log->user = $user->username;
                $admin_log->ip_address = $ip;
                $admin_log->event_section = 'USERS';
                $admin_log->event_type = 'MODIFY';
                $admin_log->record_id = $id;
                $admin_log->event_code = 'ADMIN MODIFY USER';
                $admin_log->event_sql = '';
                $admin_log->event_notes = '';
                $admin_log->save();
            }
            $data = [
                'status' => 200,
                'msg' => "Record Successfully Updated."
            ];
            return response()->json($data);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    /**
     * Agent list for clone agent.
     * @author Harshal Pawar.
     */
    public function getAgentList(Request $request) {
        try {
            $list = VicidialUsers::select('user', 'full_name')
                            ->where([
                                ['user', '!=', 'VDAD'],
                                ['user', '!=', 'VDCL'],
                                ['user_level', '<>', 9]
                            ])->orderBy('user')->get();
            $data = [
                'status' => 200,
                'data' => $list
            ];
            return response()->json($data);
        } catch (Exception $ex) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    /*
     * get option list .
     * @author Harshal Pawar.
     */

    public function getOptionList(Request $request) {
        try {
            $list = VicidialUsers::select('user_id', 'user', 'user_group', 'full_name')
                    ->where([
                        ['user', '!=', 'VDAD'],
                        ['user', '!=', 'VDCL'],
                        ['user_level', '<>', 9]
                    ])
                    ->get();
            $data = [
                'status' => 200,
                'data' => $list
            ];
            return response()->json($data);
        } catch (Exception $ex) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    public function cloneAgent(Request $request) {

        try {
            $rules = [
                'user' => 'required|validate_userid|unique_id', //custome messages.
                'pass' => 'required|max:20|min:2', 'full_name' => 'required|min:2'];
            $custom_msg = [
                'user.unique_id' => ':attribute already taken.', //for custome validation messages.
                'user.validate_userid' => ':attribute must be at least 4 digits in length and a maximum of 7 digits in length.'
            ];
            $data = $this->validate($request, $rules, $custom_msg);
            $from_agent = $request->input('from_agent');
            $find_source_user = VicidialUsers::compainList($from_agent);
            if (isset($find_source_user)) {
                $find_source_user = $find_source_user->toArray();
                $error_array = $success_array = [];
                $multiple_user = explode(',', $request->input('user'));
                for ($i = 0; $i < count($multiple_user); $i++) {
                    $user = array();
                    $user['user'] = $multiple_user[$i];
                    $user['pass'] = $request->input('pass');
                    $user['full_name'] = $request->input('full_name');
                    $user['phone_login'] = $multiple_user[$i];
                    $user['phone_pass'] = $request->input('pass');
                    $user['voicemail_id'] = $multiple_user[$i];
                    $data = array_merge($user, $find_source_user); //merge both array.
                    $result = VicidialUsers::insert($data);         //insert into vicidial_user table.
                    if ($result) {
                        $id = VicidialUsers::select('user_id')->where('user', $multiple_user[$i])->first();
                        if (isset($id)) {
                            $id = $id->toArray();
                            $id = $id['user_id'];
                        }
                        $user = $request->user();
                        $SQLdate = date("Y-m-d H:i:s");
                        $ip = $request->ip();
                        $admin_log = New VicidialAdminLog();
                        $admin_log->event_date = $SQLdate;
                        $admin_log->user = $user->username;
                        $admin_log->ip_address = $ip;
                        $admin_log->event_section = 'USERS';
                        $admin_log->event_type = 'MODIFY';
                        $admin_log->record_id = $id;
                        $admin_log->event_code = 'ADMIN COPY USER';
                        $admin_log->event_sql = '';
                        $admin_log->event_notes = '';
                        $admin_log->save();

                        # Add Entry in Phone
                        $servers = Servers::select('server_ip')->get();
                        $userNumber = trim($multiple_user[$i]);
                        $phones_inserted = $s = 0;
                        $phone_alias_entry = "";
                        $protocol = "SIP";
                        $phone_server_details = array();
                        while ($s < count($servers)) {
                            $result_phone = "";
                            if (isset($servers[$s]))
                                $servers[$s] = $servers[$s]->toArray();

                            $phone_server_details[$s] = Phone::where('extension', '=', $from_agent)->first();
                            $phone_exists = Phone::where([
                                        ['server_ip', $servers[$s]['server_ip']],
                                        ['extension', $multiple_user[$i]]
                                    ])->count();
                            if ($phone_exists == 0) {
                                if ($s < 1) {
                                    $dialplan_prefix = '';
                                    $login_suffix = 'a';
                                } else {
                                    $dialplan_prefix = $s;
                                }
                                if ($s == '1') {
                                    $login_suffix = 'b';
                                }
                                if ($s == '2') {
                                    $login_suffix = 'c';
                                }
                                if ($s == '3') {
                                    $login_suffix = 'd';
                                }
                                if ($s == '4') {
                                    $login_suffix = 'e';
                                }
                                if ($s == '5') {
                                    $login_suffix = 'f';
                                }
                                if ($s == '6') {
                                    $login_suffix = 'g';
                                }
                                if ($s == '7') {
                                    $login_suffix = 'h';
                                }
                                if ($s == '8') {
                                    $login_suffix = 'i';
                                }
                                if ($s == '9') {
                                    $login_suffix = 'j';
                                }
                                if ($s == '10') {
                                    $login_suffix = 'k';
                                }
                                if ($s == '11') {
                                    $login_suffix = 'l';
                                }
                                if ($s == '12') {
                                    $login_suffix = 'm';
                                }
                                if ($s == '13') {
                                    $login_suffix = 'n';
                                }
                                if ($s == '14') {
                                    $login_suffix = 'o';
                                }
                                if ($s == '15') {
                                    $login_suffix = 'p';
                                }
                                if ($s == '16') {
                                    $login_suffix = 'q';
                                }
                                if ($s == '17') {
                                    $login_suffix = 'r';
                                }
                                if ($s == '18') {
                                    $login_suffix = 's';
                                }
                                if ($s == '19') {
                                    $login_suffix = 't';
                                }
                                if ($s == '20') {
                                    $login_suffix = 'u';
                                }
                                if ($s == '21') {
                                    $login_suffix = 'v';
                                }
                                if ($s == '22') {
                                    $login_suffix = 'w';
                                }
                                if ($s == '23') {
                                    $login_suffix = 'x';
                                }
                                if ($s == '24') {
                                    $login_suffix = 'y';
                                }
                                if ($s == '25') {
                                    $login_suffix = 'z';
                                }
                                if ($s == '26') {
                                    $login_suffix = 'aa';
                                }
                                if ($s == '27') {
                                    $login_suffix = 'ab';
                                }
                                if ($s == '28') {
                                    $login_suffix = 'ac';
                                }
                                if ($s == '29') {
                                    $login_suffix = 'ad';
                                }
                                if ($s == '30') {
                                    $login_suffix = 'ae';
                                }
                                if ($s == '31') {
                                    $login_suffix = 'af';
                                }
                                if ($s == '32') {
                                    $login_suffix = 'ag';
                                }
                                if ($s == '33') {
                                    $login_suffix = 'ah';
                                }
                                if ($s == '34') {
                                    $login_suffix = 'ai';
                                }
                                if ($s == '35') {
                                    $login_suffix = 'aj';
                                }
                                if ($s == '36') {
                                    $login_suffix = 'ak';
                                }
                                if ($s == '37') {
                                    $login_suffix = 'al';
                                }
                                if ($s == '38') {
                                    $login_suffix = 'am';
                                }
                                if ($s == '39') {
                                    $login_suffix = 'an';
                                }
                                if ($s == '40') {
                                    $login_suffix = 'ao';
                                }
                                if ($s == '41') {
                                    $login_suffix = 'ap';
                                }
                                if ($s == '42') {
                                    $login_suffix = 'aq';
                                }
                                if ($s == '43') {
                                    $login_suffix = 'ar';
                                }
                                if ($s == '44') {
                                    $login_suffix = 'as';
                                }
                                if ($s == '45') {
                                    $login_suffix = 'at';
                                }
                                if ($s == '46') {
                                    $login_suffix = 'au';
                                }
                                if ($s == '47') {
                                    $login_suffix = 'av';
                                }
                                if ($s == '48') {
                                    $login_suffix = 'aw';
                                }
                                if ($s >= 49) {
                                    $login_suffix = 'ax';
                                }
                                if (($protocol == 'SIP')) {
                                    $dialplan_number = "$dialplan_prefix$userNumber";
                                } else {
                                    $dialplan_number = $userNumber;
                                }
                                $login = "$userNumber$login_suffix";


                                # Add Entry into phone table
                                if (isset($phone_server_details[$s])) {
                                    $phone_server_details[$s] = $phone_server_details[$s]->toArray();
                                }
                                $phone_server_details[$s]['extension'] = $userNumber;
                                $phone_server_details[$s]['dialplan_number'] = $dialplan_number;
                                $phone_server_details[$s]['voicemail_id'] = $userNumber . "x";
                                $phone_server_details[$s]['server_ip'] = $servers[$s]['server_ip'];
                                $phone_server_details[$s]['login'] = $login;
                                $phone_server_details[$s]['pass'] = $request->input('pass');
                                $phone_server_details[$s]['fullname'] = $request->input('full_name');
                                $phone_server_details[$s]['protocol'] = $protocol;
                                $phone_server_details[$s]['phone_context'] = "blocked";
                                $phone_server_details[$s]['is_webphone'] = 'Y';
                                $phone_server_details[$s]['webphone_dialpad'] = 'Y';
                                $phone_server_details[$s]['webphone_auto_answer'] = 'Y';
                                $phone_server_details[$s]['use_external_server_ip'] = 'N';
                                $phone_server_details[$s]['phone_ip'] = '';
                                $phone_server_details[$s]['computer_ip'] = '';

                                $result_phone = Phone::insert($phone_server_details);
                                if ($result_phone) {
                                    $phone_alias_entry .= "$login,";
                                    $phones_inserted++;
                                }
                                unset($phone_server_details);

                                $server_update = Servers::where([
                                            ['generate_vicidial_conf', 'Y'],
                                            ['active_asterisk_server', 'Y'],
                                            ['server_ip', $servers[$s]['server_ip']]
                                        ])->update(['rebuild_conf_files' => 'Y']);
                            }
                            $s++;
                        }

                        #Add Entry Phone Alias table Check Phone alias is exist,if not exists  then add entry in phone alias table
                        if ($phones_inserted > 0) {
                            #Check already exists alias entry
                            $check_already_alias = ViciPhoneAlias::where('alias_id', '=', $userNumber)->count();
                            if ($check_already_alias == 0) {
                                $phoneAlias['alias_id'] = $userNumber;
                                $phoneAlias['alias_name'] = $userNumber;
                                $phoneAlias['logins_list'] = preg_replace('/,$/', '', $phone_alias_entry);

                                $result_phone = ViciPhoneAlias::insert($phoneAlias);
                            }
                        }
                        $success_array[$i] = array("agent" => $multiple_user[$i], "success" => "Copy Agent Successfully Your new Agent Number is :$multiple_user[$i]", 'id' => $id);
                    } else {
                        $error_array[$i] = array("agent" => $multiple_user[$i], "error" => $error);
                    }
                    unset($user);
                }

                return response()->json([
                            'status' => 200,
                            'message' => 'Copy Agent Successfully !',
                            'data' => array('success' => $success_array, 'noOfSuccess' => count($success_array), 'error' => $error_array, 'noOfFail' => count($error_array), 'validationPassName' => "")
                ]);
            } else {
                return response()->json([
                            'status' => 400,
                            'message' => 'User not found for clone !',
                ]);
            }
        } catch (Exception $e) {

            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    /**
     * Delete Agent List .
     * @author Harshal Pawar.
     */
    public function deleteAgent(Request $request) {
        try {
            $user_id = $request->input('user_id');
            $user = VicidialUsers::select('user')->find($user_id);
            if (isset($user)) {
                $user_info = $user->user;
                # For Delete Agent from vicidial user.
                $result = VicidialUsers::find($user_id)->delete();
                $resl = VicidialCampaignAgent::where('user', $user_info)->delete();
                $res = VicidialInboundGroupAgent::where('user', $user_info)->delete();
                # For Delete Phone
                $phone_server_details = Phone::where('extension', '=', $user_info)->first();
                if (isset($phone_server_details))
                    $phone_server_ip = $phone_server_details->server_ip;
                $phone_server_details = Phone::where('extension', '=', $user_info)->delete();
                $server_update = Servers::where([
                            ['generate_vicidial_conf', 'Y'],
                            ['active_asterisk_server', 'Y'],
                            ['server_ip', $phone_server_ip]
                        ])->update(['rebuild_conf_files' => 'Y']);
                # For Delete Phone alias
                $rel = ViciPhoneAlias::where('alias_id', $user_info)->delete();

                $users = $request->user();
                $admin_log = New VicidialAdminLog();
                $admin_log->event_date = date("Y-m-d H:i:s");
                $admin_log->user = $users->username;
                $admin_log->ip_address = $request->ip();
                $admin_log->event_section = 'USERS';
                $admin_log->event_type = 'MODIFY';
                $admin_log->record_id = $user_info;
                $admin_log->event_code = 'ADMIN DELETE USER';
                $admin_log->event_sql = '';
                $admin_log->event_notes = '';
                $admin_log->save();
            }
            return response()->json([
                        'status' => 200,
                        'message' => 'Agent Deleted Successfully !',
            ]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    /*
     * Inbound Group list.
     * @author Harshal Pawar.
     */

    public function inboundGroup(Request $request) {
        try {
//                $method = '1'; //for testing
            $user = $request->input('user');
            $stml = VicidialUsers::select('closer_campaigns')->where('user', $user)->first();
            $closer_campaigns = $stml->closer_campaigns;
            $groups = explode(" ", $closer_campaigns);

            $groups_to_print = array();
            $rsltx = \App\VicidialInboundGroup::select('group_id', 'group_name')->orderBy('group_id')->get();
            if (isset($rsltx))
                $groups_to_print = $rsltx->toArray();
            $groups_value = '';
            $o = 0;
            while (count($groups_to_print) > $o) {
                $rowx = $groups_to_print[$o];
                $group_id_values[$o] = $rowx['group_id'];
                $group_name_values[$o] = $rowx['group_name'];
                $o++;
            }
            $o = 0;
            $rank_groups_list = [];
            while (count($groups_to_print) > $o) {
                $group_web_vars = '';
                $group_web = '';
                $rslt = VicidialInboundGroupAgent::select('group_rank', 'calls_today', 'group_web_vars', 'group_grade')->where([
                            ['user', $user],
                            ['group_id', $group_id_values[$o]]
                        ])->get();

                if (isset($rslt))
                    $ranks_to_print = count($rslt->toArray());

                if ($ranks_to_print > 0) {
                    $row = $rslt->toArray();
                    $row = $row['0'];
                    $select_group_rank = $row['group_rank'];
                    $calls_today = $row['calls_today'];
                    $group_web_vars = $row['group_web_vars'];
                    $select_group_grade = $row['group_grade'];
                } else {
                    $calls_today = 0;
                    $select_group_rank = 0;
                    $select_group_grade = 1;
                }

                $group_rank = $select_group_rank;
                $group_grade = $select_group_grade;

                $p = 0;
                $group_ct = count($groups);
                while ($p < $group_ct) {
                    if ($group_id_values[$o] == $groups[$p]) {
                        $rank_groups_list[$o]['checkbox'] = "1";
                        $rank_groups_list[$o]['groups_value'] = " $group_id_values[$o]";
                    }
//
                    $p++;
                }
//                    $rslt = \App\VicidialInboundGroup::select('queue_priority')->where(['group_id',$group_id_values[$o]])->get();
              $rank_groups_list[$o]['group_name_values'] = $group_name_values[$o];
                    $rank_groups_list[$o]['group_id_values'] = $group_id_values[$o];
                    $rank_groups_list[$o]['group_rank'] = isset($group_rank) ? $group_rank : 0 ;
                    $rank_groups_list[$o]['group_grade'] = isset($group_grade) ? $group_grade : 0 ;
                    $rank_groups_list[$o]['calls_today'] = isset($calls_today) ? $calls_today : 0 ;
                    $rank_groups_list[$o]['group_web_vars'] = isset($group_web_vars) ? $group_web_vars : 0 ;
                    $rank_groups_list[$o]['status'] = isset($rank_groups_list[$o]['checkbox']) ? $rank_groups_list[$o]['checkbox'] : 0 ;
                    $rank_groups_list[$o]['UpdateRow'] = 0 ;

                $o++;
            }

            return response()->json([
                        'status' => 200,
                        'message' => 'Inbound List !',
                        'data' => $rank_groups_list
            ]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    /*
     * Inbound Group list update.
     * @author Harshal Pawar.
     */

    public function inboundGroupupdate(Request $request) {
        try {
            $user = $request->input('user');
            $inbound_array = $request->input('inbound_array');
            $users = $request->user(); //to fetch which user update for logs.
            $array_groups = [];
            foreach ($inbound_array as $key => $value) {
                if ($value['UpdateRow'] == '1') {
                    #Already user is added in agent group list or not.
                    $ranks_to_print = VicidialInboundGroupAgent::select('group_rank', 'calls_today', 'group_web_vars', 'group_grade')
                            ->where('user', $user)
                            ->where('group_id', $value['group_id_values'])
                            ->count();
                    if ($ranks_to_print > 0) {
                        $v_inbound_update = VicidialInboundGroupAgent::where('user', $user)
                                ->where('group_id', $value['group_id_values'])
                                ->first();
                        $v_inbound_update->group_rank = $value['group_rank'];
                        $v_inbound_update->group_weight = $value['group_rank'];
                        $v_inbound_update->group_web_vars = $value['group_web_vars'];
                        $v_inbound_update->group_grade = $value['group_grade'];
                        $v_inbound_update->save();
                        #query to store in logs file
                        $stmtC = "UPDATE vicidial_inbound_group_agents set group_rank=" . $value['group_rank'] . ",group_weight=" . $value['group_rank'] . ",group_web_vars=" . $value['group_web_vars'] . ",group_grade=" . $value['group_grade'] . " where user=" . $user . " and group_id= " . $value['group_id_values'];
                        $admin_log = New VicidialAdminLog();
                        $admin_log->event_date = date("Y-m-d H:i:s");
                        $admin_log->user = $users->username;
                        $admin_log->ip_address = $request->ip();
                        $admin_log->event_section = 'INGROUPS';
                        $admin_log->event_type = 'MODIFY';
                        $admin_log->record_id = $value['group_id_values'];
                        $admin_log->event_code = 'USER INGROUP VIGA ADD ';
                        $admin_log->event_sql = $stmtC;
                        $admin_log->event_notes = '';
                        $admin_log->save();
                    } else {
                        $v_inbound_insert = new VicidialInboundGroupAgent;
                        $v_inbound_insert->group_rank = $value['group_rank'];
                        $v_inbound_insert->group_weight = $value['group_rank'];
                        $v_inbound_insert->group_web_vars = $value['group_web_vars'];
                        $v_inbound_insert->group_grade = $value['group_grade'];
                        $v_inbound_insert->group_id = $value['group_id_values'];
                        $v_inbound_insert->user = $user;
                        $v_inbound_insert->save();
                        #query to store in logs file
                        $stmtC = "INSERT INTO vicidial_inbound_group_agents set group_rank='" . $value['group_rank'] . "', group_weight='" . $value['group_rank'] . "', group_id=" . $value['group_id_values'] . ", user=" . $value['user'] . ", group_web_vars=" . $value['group_web_vars'] . ", group_grade=" . $value['group_grade'] . ";";
                        $admin_log = New VicidialAdminLog();
                        $admin_log->event_date = date("Y-m-d H:i:s");
                        $admin_log->user = $users->username;
                        $admin_log->ip_address = $request->ip();
                        $admin_log->event_section = 'INGROUPS';
                        $admin_log->event_type = 'ADD';
                        $admin_log->record_id = $value['group_id_values'];
                        $admin_log->event_code = 'USER INGROUP VIGA ADD ';
                        $admin_log->event_sql = $stmtC;
                        $admin_log->event_notes = '';
                        $admin_log->save();
                    }
                }
                if ($value['status'] == true) {
                    $array_groups[] = $value['group_id_values'];
                }
            }
            if (count($array_groups) > 0) {
                $existing_inbound_groups = array_unique(array_filter($array_groups, function($var) {
                            return $var != '' && $var != '-';
                        }));
                $closre_campaign = " " . implode(" ", $existing_inbound_groups) . " -";
                #Update user informatiion when it check on checkbox for new group.
                $result = VicidialUsers::where('user', $user)->update(['closer_campaigns' => $closre_campaign]);
            }
            return response()->json([
                        'status' => 200,
                        'message' => 'Inbound Group Updates Successfully !',
            ]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    /*
     * Campaign Rank for Agent.
     * @author Harshal Pawar.
     */

    public function compaignRank(Request $request) {
        try {
            $user = $request->input('user');
            $stml = VicidialUsers::select('closer_campaigns', 'user_group')->where('user', $user)->first();
            if (isset($stml))
                $closer_campaigns = $stml->closer_campaigns;
            $closer_campaigns = preg_replace("/ -$/", "", $closer_campaigns);
            $groups = explode(" ", $closer_campaigns);
            $groups_to_print = array();
            $rsltx = \App\VicidialCampaign::select('campaign_id', 'campaign_name')->orderBy('campaign_id')->get();
            if (isset($rsltx))
                $campaigns_to_print = $rsltx->toArray();
            $campaigns_value = '';
            $o = 0;
            while (count($campaigns_to_print) > $o) {
                $rowx = $campaigns_to_print[$o];
                $campaign_id_values[$o] = $rowx['campaign_id'];
                $campaign_name_values[$o] = $rowx['campaign_name'];
                $o++;
            }
            $o = 0;
            $rank_camp_list = [];
            while (count($campaigns_to_print) > $o) {
                $group_web_vars = '';
                $campaign_web = '';
                $rslt = VicidialCampaignAgent::select('campaign_rank', 'calls_today', 'group_web_vars', 'campaign_grade')->where([
                            ['user', $user],
                            ['campaign_id', $campaign_id_values[$o]]
                        ])->get();
                if (isset($rsltx))
                    $ranks_to_print = count($rslt->toArray());
                if ($ranks_to_print > 0) {
                    $row = $rslt->toArray();
                    $row = $row['0'];
                    $select_campaign_rank = $row['campaign_rank'];
                    $calls_today = $row['calls_today'];
                    $group_web_vars = $row['group_web_vars'];
                    $select_campaign_grade = $row['campaign_grade'];
                } else {
                    $calls_today = 0;
                    $select_campaign_rank = 0;
                    $select_campaign_grade = 1;
                }

                $campaign_rank = $select_campaign_rank;
                $campaign_grade = $select_campaign_grade;

                $allowed_campaigns = VicidialUserGroup::select('allowed_campaigns')->where('user_group', '=', $stml->user_group)->first();

                $allowed_campaigns = preg_replace("/ -$/", "", $allowed_campaigns->allowed_campaigns);
                $ug_campaigns = explode(" ", $allowed_campaigns);

                $p = 0;
                $rank_camp_active = 0;
                $grade_camp_active = 0;
                $cr_disabled = '';

                if (preg_match('/\-ALL\-CAMPAIGNS\-/i', $allowed_campaigns)) {
                    $rank_camp_active++;
                    $grade_camp_active++;
                } else {
                    $ug_campaign_ct = count($ug_campaigns);
                    while ($p < $ug_campaign_ct) {
                        if ($campaign_id_values[$o] == $ug_campaigns[$p]) {
                            $rank_camp_active++;
                            $grade_camp_active++;
                        }
                        $p++;
                    }
                }
                if ($rank_camp_active < 1) {
                    $cr_disabled = '';
                }

                if ((strlen($campaign_web) < 1) and ( strlen($group_web_vars) > 0)) {
                    $campaign_web = $group_web_vars;
                }

                $rank_camp_list[$o]['campaign_id_values'] = $campaign_id_values[$o];
                $rank_camp_list[$o]['campaign_name_values'] = $campaign_name_values[$o];
                $rank_camp_list[$o]['CR_disabled'] = $cr_disabled;
                $rank_camp_list[$o]['campaign_rank'] = isset($campaign_rank) ? $campaign_rank : 0;
                $rank_camp_list[$o]['campaign_web'] = isset($campaign_web) ? $campaign_web : 0;
                $rank_camp_list[$o]['campaign_grade'] = isset($campaign_grade) ? $campaign_grade : 0;
                $rank_camp_list[$o]['calls_today'] = isset($calls_today) ? $calls_today : 0;
                $rank_camp_list[$o]['update_row'] = 0; //to check user update anything in array for update query.
                $o++;
            }
            return response()->json([
                        'status' => 200,
                        'message' => 'Compaigns List !',
                        'data' => $rank_camp_list
            ]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    /*
     * Campaign list update .
     * @author Harshal Pawar.
     */

    public function compaignRankUpdate(Request $request) {
        try {
            $user = $request->input('user');
            $compaign_array = $request->input('compaign_array');

            $users = $request->user(); //to fetch which user update for logs.
            $array_groups = [];
            foreach ($compaign_array as $key => $value) {
                if ($value['update_row'] == '1') {
                    #Already user is added in agent group list or not.
                    $ranks_to_print = VicidialCampaignAgent::select('campaign_rank', 'calls_today', 'group_web_vars', 'campaign_grade')
                            ->where('campaign_id', $value['campaign_id_values'])
                            ->where('user', $user)
                            ->count();
                    if ($ranks_to_print > 0) {
                        $data_to_update['campaign_rank'] = $value['campaign_rank'];
                        $data_to_update['campaign_weight'] = $value['campaign_rank'];
                        $data_to_update['group_web_vars'] = $value['campaign_web'];
                        $data_to_update['campaign_grade'] = $value['campaign_grade'];
                        $a_compaign_update = VicidialCampaignAgent::where('campaign_id', $value['campaign_id_values'])
                                ->where('user', $user)
                                ->update($data_to_update);

                        #query to store in logs file
                        $stmtC = "UPDATE vicidial_campaign_agents set campaign_rank=" . $value['campaign_rank'] . ",campaign_weight=" . $value['campaign_rank'] . ",group_web_vars=" . $value['campaign_web'] . ",campaign_grade=" . $value['campaign_grade'] . " where user=" . $user . " and campaign_id= " . $value['campaign_id_values'];
                        $admin_log = New VicidialAdminLog();
                        $admin_log->event_date = date("Y-m-d H:i:s");
                        $admin_log->user = $users->username;
                        $admin_log->ip_address = $request->ip();
                        $admin_log->event_section = 'CAMPAIGNS';
                        $admin_log->event_type = 'MODIFY';
                        $admin_log->record_id = $value['campaign_id_values'];
                        $admin_log->event_code = 'USER CAMPAIGN VIGA MODIFY ';
                        $admin_log->event_sql = $stmtC;
                        $admin_log->event_notes = '';
                        $admin_log->save();
                    } else {
                        $data_to_insert['campaign_rank'] = $value['campaign_rank'];
                        $data_to_insert['campaign_weight'] = $value['campaign_rank'];
                        $data_to_insert['group_web_vars'] = $value['campaign_web'];
                        $data_to_insert['campaign_grade'] = $value['campaign_grade'];
                        $data_to_insert['campaign_id'] = $value['campaign_grade'];
                        $data_to_insert['user'] = $value['campaign_grade'];
                        $a_compaign_insert = VicidialCampaignAgent::insert($data_to_insert);

                        #query to store in logs file
                        $stmtC = "INSERT INTO vicidial_campaign_agents set set campaign_rank=" . $value['campaign_rank'] . ",campaign_weight=" . $value['campaign_rank'] . ",group_web_vars=" . $value['campaign_web'] . ",campaign_grade=" . $value['campaign_grade'] . ", user=" . $user . " and campaign_id= " . $value['campaign_id_values'];
                        $admin_log = New VicidialAdminLog();
                        $admin_log->event_date = date("Y-m-d H:i:s");
                        $admin_log->user = $users->username;
                        $admin_log->ip_address = $request->ip();
                        $admin_log->event_section = 'CAMPAIGNS';
                        $admin_log->event_type = 'ADD';
                        $admin_log->record_id = $value['campaign_id_values'];
                        $admin_log->event_code = 'USER CAMPAIGN VIGA MODIFY ';
                        $admin_log->event_sql = $stmtC;
                        $admin_log->event_notes = '';
                        $admin_log->save();
                    }
                }
            }
            return response()->json([
                        'status' => 200,
                        'message' => 'Campaign Rank Update Succesfully !',
            ]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    /*
     * Class Back list.
     * @author Harshal Pawar.
     */

    public function callBacklist(Request $request) {
        try {
            DB::enableQueryLog();
            $user = $request->input('user');
            $search = '%' . $request->input('search') . '%';
            $page_size = $request->input('limit') ?? 25;
            $data = VicidialCallback::getAll('', $user, $search, $page_size);
            //dd(DB::getQueryLog());
            return response()->json([
                        'status' => 200,
                        'message' => 'Call Back List !',
                        'data' => $data
            ]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    /*
     *  Delete Call Backs.
     * @author Harshal Pawar.
     */

    public function deleteCallBack(Request $request) {
        try {
            $id = $request->input('call_back_id');
            foreach ($id as $value) {
                $lead_id = VicidialCallback::select('list_id')->find($value);
                $calls = VicidialCallback::find($value);
                $calls->status = "INACTIVE";
                $calls->save();
                $sql = "UPDATE vicidial_callbacks SET status='INACTIVE' where callback_id='$value'";
                $admin_log = New VicidialAdminLog();
                $users = $request->user(); //to fetch which user update for logs.
                $admin_log->event_date = date("Y-m-d H:i:s");
                $admin_log->user = $users->username;
                $admin_log->ip_address = $request->ip();
                $admin_log->event_section = 'USER';
                $admin_log->event_type = 'DELETE';
                $admin_log->record_id = $lead_id;
                $admin_log->event_code = 'USER DELETE CALLBACK ';
                $admin_log->event_sql = $sql;
                $admin_log->event_notes = '';
                $admin_log->save();
            }
            return response()->json([
                        'status' => 200,
                        'message' => 'Record has been deleted successfully.'
            ]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    /*
     * move call back to other user or same user.
     * @author Harshal Pawar.
     */

    public function movecallBack(Request $request) {
        try {
            $id = $request->input('call_back_id');
            if (!isset($id)) {
                return response()->json([
                            'status' => 200,
                            'message' => 'Please select check box to move a record.'
                ]);
            }
            $user = $request->input('user');
            $move_to_user = $request->input('move_to_user');
            $lead_id = VicidialCallback::select('list_id')->whereIn('callback_id', $id)->first();
            if (isset($lead_id)) {
                $lead_id = $lead_id->list_id;
                if (isset($move_to_user) && !empty($move_to_user)) {
                    $calls = VicidialCallback::whereIn('callback_id', $id)->update(array('user' => $move_to_user));
                } else {
                    $calls = VicidialCallback::whereIn('callback_id', $id)->update(array('recipient' => "ANYONE"));
                }
                $sql = "UPDATE vicidial_callbacks SET recipient=$user where callback_id IN";
                $admin_log = New VicidialAdminLog();
                $users = $request->user(); //to fetch which user update for logs.
                $admin_log->event_date = date("Y-m-d H:i:s");
                $admin_log->user = $users->username;
                $admin_log->ip_address = $request->ip();
                $admin_log->event_section = 'USER';
                $admin_log->event_type = 'MODIFY';
                $admin_log->record_id = $lead_id;
                $admin_log->event_code = 'USER MOVE CALLBACK ';
                $admin_log->event_sql = $sql;
                $admin_log->event_notes = '';
                $admin_log->save();
            }
            return response()->json([
                        'status' => 200,
                        'message' => 'Record has been Move to ANYONE successfully.'
            ]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    /*
     * Remove multiple record according to month or week.
     *  @author Harshal Pawar.
     */

    public function deleteMonthCallBacks(Request $request) {
        try {
            $delete_record = $request->input('delete_record');
            $user = $request->input('user');
            if ($delete_record == 'last_month') {
                $month_old = mktime(0, 0, 0, date("m") - 1, date("d"), date("Y"));
                $past_date = date("Y-m-d H:i:s", $month_old);
            } else {
                $week_old = mktime(0, 0, 0, date("m"), date("d") - 7, date("Y"));
                $past_date = date("Y-m-d H:i:s", $week_old);
            }

            $calls = VicidialCallback::whereIn('status', ['ACTIVE', 'LIVE'])
                    ->where([['user', '=', $user],
                        ['callback_time', '<', $past_date]])
                    ->update(['status' => 'INACTIVE']);
            if ($calls > 0) {
                $lead_id = VicidialCallback::select('list_id')->whereIn('status', ['ACTIVE', 'LIVE'])
                                ->where([['user', '=', $user], ['callback_time', '<', $past_date]])->first();
                $sql = "UPDATE vicidial_callbacks SET status='INACTIVE' where campaign_id='$user' AND status IN('LIVE', 'ACTIVE') AND callback_time<'$past_date'";
                $admin_log = New VicidialAdminLog();
                $users = $request->user(); //to fetch which user update for logs.
                $admin_log->event_date = date("Y-m-d H:i:s");
                $admin_log->user = $users->username;
                $admin_log->ip_address = $request->ip();
                $admin_log->event_section = 'USER';
                $admin_log->event_type = 'UPDATE';
                $admin_log->record_id = $lead_id->list_id;
                $admin_log->event_code = 'USER UPDATE CALLBACK';
                $admin_log->event_sql = $sql;
                $admin_log->event_notes = '';
                $admin_log->save();
            }
            return response()->json([
                        'status' => 200,
                        'message' => 'Records has been deleted successfully.'
            ]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    /*
     * Live Agent Group .
     */

    public function liveAgent(Request $request) {
        try {
            $max_user_enabled = false;
            $get_column_names = SystemSetting::getTableColumns();
            $max_user_version_enabled = in_array('max_allowed_login_user_outbound', $get_column_names);
            if (!$max_user_version_enabled) {
                $max_user_enabled = in_array('max_allowed_login_user', $get_column_names);
            }

            if ($max_user_enabled || $max_user_version_enabled) {
                $users = $request->user(); //to fetch which user update for logs.
                $post_data = http_build_query(
                        array(
                            'token' => 'Yt65NPlBmLQREaDKiMVr',
                            'company_id' => $users->company_id
                        )
                );
                $opts = array(
                    'http' => array(
                        'method' => "POST",
                        'header' => "Content-type: application/x-www-form-urlencoded",
                        'content' => $post_data
                    )
                );
                $context = stream_context_create($opts);
                $i = 0;
                do {
                    $data = @file_get_contents('https://my.ytel.com/Api/getMaxAllowedLoginUserSetting.json', false, $context);
                    $i++;

                    if ($i == 5 && $data == '') {
                        $fail = TRUE;
                        break;
                    }
                } while ($data == '');

                if (!isset($fail)) {
                    $status = 1;
                    $output_from_myytel = json_decode($data);

                    $max_allowed_login_user = $output_from_myytel->max_user;
                    if ($max_allowed_login_user == '')
                        $max_allowed_login_user = 0;

                    $max_allowed_login_user_outbound = $output_from_myytel->max_outbound;
                    if ($max_allowed_login_user_outbound == '')
                        $max_allowed_login_user_outbound = 0;

                    $max_allowed_login_user_closer = $output_from_myytel->max_closer;
                    if ($max_allowed_login_user_closer == '')
                        $max_allowed_login_user_closer = 0;

                    $return['max_allowed_login_user'] = $max_allowed_login_user;
                    $return['max_allowed_login_user_outbound'] = $max_allowed_login_user_outbound;
                    $return['max_allowed_login_user_closer'] = $max_allowed_login_user_closer;

                    $user_login = VicidialLiveAgent::getLiveAgents();

                    $return['user_login'] = $user_login;
                }
            }
            $return['max_user_enabled'] = $max_user_enabled;
            $return['max_user_version_enabled'] = $max_user_version_enabled;
            return response()->json([
                        'status' => 200,
                        'message' => 'Successfully.',
                        'data' => $return
            ]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    /*
     *  User status  form group.
     */

    public function userStatusForm(Request $request) {
        try {

            $user = $request->input('user_id');
//            $users = $request->user();
            $level_user = VicidialUsers::select('user')
                    ->where('user',$user)
                    ->first();
            if(!isset($level_user)) {
                return response()->json([
                        'status' => 400,
                        'msg' => 'Agent Id not found.'
                ]);
            }

            ##### START SYSTEM_SETTINGS LOOKUP #####
            $qm_conf_ct = SystemSetting::select('user_territories_active')->first();
            if (isset($qm_conf_ct)) {
                $user_territories_active = $qm_conf_ct->user_territories_active;
            }
            ##### END SETTINGS LOOKUP #####
            $full_name = $user_group = $group = '';
            $rslt = VicidialUsers::select('full_name', 'user_group', 'campaign_detail')->where('user', '=', filter_var($user))->first();

            if (isset($rslt)) {
                $full_name = $rslt->full_name;
                $user_group = $rslt->user_group;
                $group = $rslt->campaign_detail;
            }
            ###########################################
            if (!isset($begin_date)) {
                $begin_date = date("Y-m-d");
            }
            if (!isset($end_date)) {
                $end_date = date("Y-m-d");
            }
            $PHP_AUTH_USER = isset($user) ? $user : '';
            $PHP_AUTH_PW = isset($level_user->pass) ? $level_user->pass : '';
            $PHP_AUTH_USER = preg_replace('/[^0-9a-zA-Z]/', '', $PHP_AUTH_USER);
            $PHP_AUTH_PW = preg_replace('/[^0-9a-zA-Z]/', '', $PHP_AUTH_PW);
            $user = preg_replace("/'|\"|\\\\|;/", "", $user);
            $group = preg_replace("/'|\"|\\\\|;/", "", $group);
            $stage = "";
            $begin_date = preg_replace("/'|\"|\\\\|;/", "", $begin_date);
            $end_date = preg_replace("/'|\"|\\\\|;/", "", $end_date);

            $auth = 0;
            $reports_auth = 0;
            $admin_auth = 0;
            ##### BEGIN log visit to the vicidial_report_log table #####
            $log_script_name = basename(__FILE__, '.php');
            $log_http_host = $request->getHttpHost();
            $log_server_port = $_SERVER["SERVER_PORT"];
            $log_request_uri = $_SERVER['REQUEST_URI'];
            $log_http_referer = getenv("HTTP_REFERER");
            if (preg_match("/443/i", $log_server_port)) {
                $HTTPprotocol = 'https://';
            } else {
                $HTTPprotocol = 'http://';
            }
            $log_full_url = "$HTTPprotocol$log_http_host$log_request_uri";

            $report_log_id = new VicidialReportLog();
            $report_log_id->event_date = NOW();
            $report_log_id->user = $PHP_AUTH_USER;
            $report_log_id->ip_address = $request->ip();
            $report_log_id->report_name = 'report_name';
            $report_log_id->browser = $request->header('User-Agent');
            $report_log_id->referer = $log_http_referer;
            $report_log_id->notes = "$log_http_host | $log_script_name |$user, $stage, $group|";
            $report_log_id->url = $log_full_url;
            $report_log_id->save();
            $report_log_id = $report_log_id->report_log_id;
            ##### END log visit to the vicidial_report_log table #####
            $rslt = VicidialUsers::select('full_name', 'change_agent_campaign', 'modify_timeclock_log')->where('user', '=', $PHP_AUTH_USER)->first();
            if (isset($rslt)) {
                $LOGfullname = $rslt->full_name;
                $change_agent_campaign = 1; //$rslt->change_agent_campaign
                $modify_timeclock_log = 1; //$rslt->modify_timeclock_log
            }
            $a_status = '';
            $rslt = VicidialLiveAgent::getAgentWithCondition($user);
            if (isset($rslt)) {
                $agents_to_print = $rslt->count();
                $i = 0;
                while ($i < $agents_to_print) {
                    $row = $rslt->toArray();
                    $Aserver_ip = $row[$i]['server_ip'];
                    $Asession_id = $row[$i]['conf_exten'];
                    $Aextension = $row[$i]['extension'];
                    $a_status = $row[$i]['status'];
                    $Acampaign = $row[$i]['campaign_id'];
                    $Acallerid = $row[$i]['callerid'];
                    $Alast_call = $row[$i]['last_call_time'];
                    $Acl_campaigns = $row[$i]['closer_campaigns'];
                    $agent_territories = $row[$i]['agent_territories'];
                    $outbound_autodial = $row[$i]['outbound_autodial'];
                    $manager_ingroup_set = $row[$i]['manager_ingroup_set'];
                    $external_igb_set_user = $row[$i]['external_igb_set_user'];
                    $i++;
                }
            }

            $rslt = VicidialTimeclockStatus::select('event_date', 'status', 'ip_address')->where('user', $user)->first();

            if (isset($rslt)) {
                $row = $rslt->toArray();
                $Tevent_date = $row['event_date'];
                $t_status = $row['status'];
                $Tip_address = $row['ip_address'];
            }

            if ($a_status == 'INCALL') {
                $rslt_p = \App\ParkedChannel::where('channel_group', $Acallerid)->get();
                if (isset($rslt_p)) {
                    $parked_channel = $rslt_p->count();
                    if ($parked_channel > 0) {
                        $a_status = 'PARK';
                    } else {
                        $row_p = \App\VicidialAutoCall::where('callerid', '=', $Acallerid)->get();
                        if (isset($row_p)) {
                            $live_channel = $row_p->count();
                            if ($live_channel < 1) {
                                $a_status = 'DEAD';
                            }
                        }
                    }
                }
            }

            $rslt = \App\VicidialCampaign::select('campaign_id')->get();
            if (isset($rslt)) {
                $groups_to_print = $rslt->count();
                $i = 0;
                while ($i < $groups_to_print) {
                    $row = $rslt->toArray();
                    $groups[$i] = $row[$i]['campaign_id'];
                    $i++;
                }
            }
            $vicidial_agent_status['user'] = $user;
            $vicidial_agent_status['modify_timeclock_log'] = isset($modify_timeclock_log) ? $modify_timeclock_log : 1;
            $vicidial_agent_status['full_name'] = $full_name;
            $vicidial_agent_status['user_group'] = $user_group;
            $vicidial_agent_status['report_log_id'] = $report_log_id;
            #user status if it is loggin.
            if ($agents_to_print > 0) {
                $vicidial_agent_status['agent_logged_server'] = $Aserver_ip;
                $vicidial_agent_status['in_session'] = $Asession_id;
                $vicidial_agent_status['from_phone'] = $Aextension;
                $vicidial_agent_status['agent_campaign'] = $Acampaign;
                $vicidial_agent_status['status'] = $a_status;
                $vicidial_agent_status['hungup_last_call_at'] = $Alast_call;
                $vicidial_agent_status['closer_groups'] = $Acl_campaigns;
                $vicidial_agent_status['stage'] = $stage;

                if ($manager_ingroup_set != 'N') {
                    $vicidial_agent_status['Manager_in_group_select'] = $external_igb_set_user;
                }
                if ($outbound_autodial == 'Y') {
                    $vicidial_agent_status['outbound_auto_dial'] = 'YES';
                }
                if ($user_territories_active > 0) {
                    $vicidial_agent_status['selected_territories'] = $agent_territories;
                }
            }


            if ($stage == "" && isset($t_status)) {
                if (($t_status == "LOGIN") || ($t_status == "START")) {
                    $vicidial_agent_status['login_time'] = $Tevent_date;
                    $vicidial_agent_status['login_from'] = $Tip_address;
                    $vicidial_agent_status['stage'] = 'tc_log_user_OUT';
                    $TC_log_change_stage = 'tc_log_user_OUT';
                } else {
                    $vicidial_agent_status['login_time'] = $Tevent_date;
                    $vicidial_agent_status['login_from'] = $Tip_address;
                    $vicidial_agent_status['stage'] = 'tc_log_user_IN';
                }
            }
            $vicidial_agent_status['emergency_log_agent_out'] = 'log_agent_out'; // FOR EMERGENCY LOG AGENT OUT.
            return response()->json([
                        'status' => 200,
                        'msg' => 'Successfully.',
                        'data' => $vicidial_agent_status
            ]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    public function userStatusUpdateForm(Request $request) {
        try {
            $start_ms = microtime();
            $user = $request->input('user');
            $stage = $request->input('stage');
            $campaign_id = $request->input('campaign_id');
            $report_log_id = $request->input('report_log_id');
            $vicidial_status = [];
            $user_ip = $request->ip();
            $start_time = date("U");
            $modify_timeclock_log = $request->input('campaign_id');
            ##### EMERGENCY CAMPAIGN CHANGE FOR AN AGENT #####
            $rslt = VicidialUsers::select('full_name', 'user_group', 'campaign_detail')->where('user', '=', filter_var($user))->first();
            if (isset($rslt)) {
                $full_name = $rslt->full_name;
                $user_group = $rslt->user_group;
                $group = $rslt->campaign_detail;
            }
            if ($stage == "live_campaign_change") {
                $rslt = VicidialLiveAgent::where(['user', filter_var($user)])
                        ->update(['campaign_id' => filter_var($campaign_id)]);
                $vicidial_agent_status['agent_name'] = "$group campaign";
                $vicidial_agent_status['after_change_campaign'] = "$group campaign";
            }
            ##### EMERGENCY LOGOUT OF AN AGENT #####
            if ($stage == "log_agent_out") {
                $now_date_epoch = date('U');
                $inactive_epoch = ($now_date_epoch - 60);
                $vla_ct = \App\VicidialLiveAgent::select('user', 'campaign_id', 'last_update_time')
                                ->where('user', filter_var($user))->first();
                if (isset($vla_ct)) {
                    $VLA_user = $vla_ct->user;
                    $vla_campaign_id = $vla_ct->campaign_id;
                    $VLA_update_time = strtotime($vla_ct->last_update_time);

                    if ($VLA_update_time > $inactive_epoch) {
                        $lead_active = 0;
                        $val_ct = VicidialAdminLog::selectCondition($VLA_user, 'agent_log_id');
                        if (isset($val_ct)) {
                            $row = $val_ct->toArray();
                            $VAL_agent_log_id = $row['agent_log_id'];
                            $VAL_lead_id = $row['lead_id'];
                            $VAL_pause_epoch = $row['pause_epoch'];
                            $VAL_pause_sec = $row['pause_sec'];
                            $VAL_wait_epoch = $row['wait_epoch'];
                            $VAL_wait_sec = $row['wait_sec'];
                            $VAL_talk_epoch = $row['talk_epoch'];
                            $VAL_talk_sec = $row['talk_sec'];
                            $VAL_dispo_epoch = $row['dispo_epoch'];
                            $VAL_dispo_sec = $row['dispo_sec'];
                            $VAL_status = $row['status'];
                            $val_user_group = $row['user_group'];
                        }
                        if (($VAL_wait_epoch < 1) or ( ($VAL_status == 'PAUSE') and ( $VAL_dispo_epoch < 1) )) {
                            $VAL_pause_sec = ( ($now_date_epoch - $VAL_pause_epoch) + $VAL_pause_sec);
                            $stmt = "UPDATE vicidial_agent_log SET wait_epoch='$now_date_epoch', pause_sec='$VAL_pause_sec' where agent_log_id='$VAL_agent_log_id';";
                        } else {
                            if ($VAL_talk_epoch < 1) {
                                $VAL_wait_sec = ( ($now_date_epoch - $VAL_wait_epoch) + $VAL_wait_sec);
                                $rslt = VicidialAdminLog::where('agent_log_id', '=', $VAL_agent_log_id)
                                        ->update(
                                        ['talk_epoch' => $now_date_epoch,
                                            'wait_sec' => $VAL_wait_sec
                                ]);
                            } else {
                                $lead_active++;
                                $status_update_SQL = [];
                                if (( (strlen($VAL_status) < 1) or ( $VAL_status == 'NULL') ) and ( $VAL_lead_id > 0)) {
                                    $status_update_SQL = ['status', 'PU'];
                                    $rslt = \App\VicidialList::where('lead_id', '=', $VAL_lead_id)->update(['status', 'PU']);
                                }
                                if ($VAL_dispo_epoch < 1) {
                                    $VAL_talk_sec = ($now_date_epoch - $VAL_talk_epoch);
                                    $rslt = VicidialAdminLog::where('agent_log_id', '=', $VAL_agent_log_id)
                                            ->update([['dispo_epoch', $now_date_epoch], ['talk_sec', $VAL_talk_sec], $status_update_SQL]);
                                } else {
                                    if ($VAL_dispo_sec < 1) {
                                        $VAL_dispo_sec = ($now_date_epoch - $VAL_dispo_epoch);
                                        $rslt = VicidialAdminLog::where('agent_log_id', '=', $VAL_agent_log_id)
                                                ->update(['dispo_sec', $VAL_dispo_sec]);
                                    }
                                }
                            }
                        }
                    }
                    if (!isset($val_user_group)) {
                        $val_user_group = '';
                    }

                    $rslt = VicidialLiveAgent::where('user', filter_var($user))->delete();
                    if (strlen($val_user_group) < 1) {
                        $stmt = VicidialUsers::select('user_group')->where('user', '=', $VLA_user)->first();
                        if (isset($stmt)) {
                            $val_user_group = $stmt->user_group;
                        }
                    }
                    //vicidial_user_log
                    $vici_user = new VicidialUserLog();
                    $vici_user->user = $VLA_user;
                    $vici_user->event = 'LOGOUT';
                    $vici_user->campaign_id = $vla_campaign_id;
                    $vici_user->event_date = date("Y-m-d H:i:s");
                    $vici_user->event_epoch = $now_date_epoch;
                    $vici_user->user_group = $val_user_group;
                    $vici_user->save();

                    ##### START QUEUEMETRICS LOGGING LOOKUP #####
                    $rslt = SystemSetting::getfieldInfo();
                    if (isset($rslt)) {
                        $enable_queuemetrics_logging = $rslt->enable_queuemetrics_logging;
                        $queuemetrics_server_ip = $rslt->queuemetrics_server_ip;
                        $queuemetrics_dbname = $rslt->queuemetrics_dbname;
                        $queuemetrics_login = $rslt->queuemetrics_login;
                        $queuemetrics_pass = $rslt->queuemetrics_pass;
                        $queuemetrics_log_id = $rslt->queuemetrics_log_id;
                        $queuemetrics_loginout = $rslt->queuemetrics_loginout;
                        $queuemetrics_addmember_enabled = $rslt->queuemetrics_addmember_enabled;
                        $queuemetrics_pe_phone_append = $rslt->queuemetrics_pe_phone_append;
                    }
                    ##### END QUEUEMETRICS LOGGING LOOKUP #####
                    ###########################################
                    if ($enable_queuemetrics_logging > 0) {
                        $qm_logoff = 'AGENTLOGOFF';
                        if ($queuemetrics_loginout == 'CALLBACK') {
                            $qm_logoff = 'AGENTCALLBACKLOGOFF';
                        }
                        $connection = \App\QueueMetrics::index(); //for testing database connection with queue matrix table.
                        if ($connection) {
//                            $linkB=mysql_connect("$queuemetrics_server_ip", "$queuemetrics_login", "$queuemetrics_pass");
//                            mysql_select_db("$queuemetrics_dbname", $linkB);
                            $agents = '@agents';
                            $agent_logged_in = '';
                            $time_logged_in = '0';

                            if ($queuemetrics_loginout == 'NONE') {
                                $queue_log = new QueueLog();
                                $queue_log->partition = 'P01';
                                $queue_log->time_id = $now_date_epoch;
                                $queue_log->call_id = 'NONE';
                                $queue_log->queue = 'NONE';
                                $queue_log->agent = "'Agent/" . filter_var($user) . "'";
                                $queue_log->verb = 'PAUSEREASON';
                                $queue_log->serverid = $queuemetrics_log_id;
                                $queue_log->data1 = 'LOGOFF';
                                $queue_log->save();
                            }

                            $queue_log = QueueLog::select('agent', 'time_id', 'data1')
                                            ->where(['agent', filter_var($user)], ['time_id', '>', $check_time])
                                            ->whereIn('verb', ['AGENTLOGIN', 'AGENTCALLBACKLOGIN'])
                                            ->orderBy('time_id')->first();
                            if (isset($queue_log)) {
                                $agent_logged_in = $queue_log->agent;
                                $time_logged_in = $queue_log->time_id;
                                $raw_time_logged_in = $queue_log->time_id;
                                $phone_logged_in = $queue_log->data1;
                            }

                            $time_logged_in = ($now_date_epoch - $time_logged_in);
                            if ($time_logged_in > 1000000) {
                                $time_logged_in = 1;
                            }

                            if ($queuemetrics_addmember_enabled > 0) {
                                $queuemetrics_phone_environment = '';
                                $rslt = \App\VicidialCampaign::select('queuemetrics_phone_environment')->where(['campaign_id', $vla_campaign_id])->first();
                                if (isset($rslt)) {
                                    $queuemetrics_phone_environment = $rslt->queuemetrics_phone_environment;
                                }

                                $stmt = "SELECT distinct queue FROM queue_log where time_id >= "
                                        . "$raw_time_logged_in and agent='$agent_logged_in' and verb IN('ADDMEMBER','ADDMEMBER2') and queue != '$vla_campaign_id' order by time_id desc;";
                                $rslt = mysql_query($stmt, $linkB);
                                $dis_que_log = QueueLog::select('queue')->distinct()
                                        ->where(['time_id', '>=', $raw_time_logged_in], ['agent', $agent_logged_in], ['queue', $vla_campaign_id])
                                        ->whereIn('verb', ['ADDMEMBER', 'ADDMEMBER2'])
                                        ->orderBy('time_id', 'DESC');
                                if (isset($dis_que_log)) {
                                    $i = 0;
                                    $amq_conf_ct = $amq_conf_ct->count();
                                    $row = $amq_conf_ct->toArray();
                                    while ($i < $amq_conf_ct) {
                                        $a_m_queue[$i] = $amq_conf_ct[$i]['queue'];
                                        $i++;
                                    }
                                }
                                ### add the logged-in campaign as well
                                $a_m_queue[$i] = $vla_campaign_id;
                                $i++;
                                $amq_conf_ct++;

                                $i = 0;
                                while ($i < $amq_conf_ct) {
                                    $pe_append = '';
                                    if (($queuemetrics_pe_phone_append > 0) and ( strlen($queuemetrics_phone_environment) > 0)) {
                                        $qm_extension = explode('/', $phone_logged_in);
                                        $pe_append = "-$qm_extension[1]";
                                    }
                                    $queue_log = new QueueLog();
                                    $queue_log->partition = 'P01';
                                    $queue_log->time_id = $now_date_epoch;
                                    $queue_log->call_id = 'NONE';
                                    $queue_log->agent = $agent_logged_in;
                                    $queue_log->verb = 'REMOVEMEMBER';
                                    $queue_log->serverid = $queuemetrics_log_id;
                                    $queue_log->data1 = $phone_logged_in;
                                    $queue_log->data4 = $queuemetrics_phone_environment . $pe_append;
                                    $queue_log->save();
                                    $affected_rows = mysql_affected_rows($queue_log);
                                    $i++;
                                }
                            }

                            if ($queuemetrics_loginout != 'NONE') {
                                $queue_log = new QueueLog();
                                $queue_log->partition = 'P01';
                                $queue_log->time_id = $now_date_epoch;
                                $queue_log->call_id = 'NONE';
                                $queue_log->agent = $agent_logged_in;
                                $queue_log->verb = $qm_logoff;
                                $queue_log->serverid = $queuemetrics_log_id;
                                $queue_log->data1 = $phone_logged_in;
                                $queue_log->data2 = $time_logged_in;
                                $queue_log->save();
                            }
                        }
                    }
                }
                $vicidial_status['vc_display_message'] = "Agent $user - $full_name has been emergency logged out, make sure they close their web browser";
            } else {
                $vicidial_status['vc_display_message'] = "Agent $user is not logged in";
            }
            ###########################################
            ##### BEGIN TIME CLOCK LOGOUT OF A USER #####
            if (( ($stage == "tc_log_user_OUT") or ( $stage == "tc_log_user_IN") ) and ( $modify_timeclock_log > 0)) {
                $stmt = \App\VicidialTimeclockLog::where('user', $user)->get();
                $LOG_run = 0;
                $last_action_sec = 99;
                if (isset($stmt)) {
                    $vts_count = $stmt->count();
                    if ($vts_count > 0) {
                        ### vicidial_timeclock_status record found, grab status and date of last activity
                        $stmt = VicidialTimeclockStatus::select('status', 'event_epoch')->where('user', $user)->first();
                        if (isset($stmt)) {
                            $status = $stmt->status;
                            $event_epoch = $stmt->event_epoch;
                            $last_action_date = date("Y-m-d H:i:s", $event_epoch);
                            $last_action_sec = ($start_time - $event_epoch);
                            if ($last_action_sec > 0) {
                                $totTIME_H = ($last_action_sec / 3600);
                                $totTIME_H_int = round($totTIME_H, 2);
                                $totTIME_H_int = intval("$totTIME_H");
                                $totTIME_M = ($totTIME_H - $totTIME_H_int);
                                $totTIME_M = ($totTIME_M * 60);
                                $totTIME_M_int = round($totTIME_M, 2);
                                $totTIME_M_int = intval("$totTIME_M");
                                $totTIME_S = ($totTIME_M - $totTIME_M_int);
                                $totTIME_S = ($totTIME_S * 60);
                                $totTIME_S = round($totTIME_S, 0);
                                if (strlen($totTIME_H_int) < 1) {
                                    $totTIME_H_int = "0";
                                }
                                if ($totTIME_M_int < 10) {
                                    $totTIME_M_int = "0$totTIME_M_int";
                                }
                                if ($totTIME_S < 10) {
                                    $totTIME_S = "0$totTIME_S";
                                }
                                $totTIME_HMS = "$totTIME_H_int:$totTIME_M_int:$totTIME_S";
                            } else {
                                $totTIME_HMS = '0:00:00';
                            }
                        }
                    } else {
                        ### No vicidial_timeclock_status record found, insert one
                        $vidi_time_status = new VicidialTimeclockStatus();
                        $vidi_time_status->status = 'START';
                        $vidi_time_status->user = $user;
                        $vidi_time_status->user_group = $user_group;
                        $vidi_time_status->event_epoch = $start_time;
                        $vidi_time_status->ip_address = $user_ip;
//                                $vidi_time_status->save(); //save function commented for no testing.
                        $vicidial_status['success_for_new_record'] = "NEW vicidial_timeclock_status record inserted for $user";
                    }
                }

                ##### Run timeclock login queries #####
                if (( ($status == 'AUTOLOGOUT') or ( $status == 'START') or ( $status == 'LOGOUT') ) and ( $stage == "tc_log_user_IN")) {
                    ### Add a record to the timeclock log
                    $vc_time_clock_log = new VicidialTimeclockLog();
                    $vc_time_clock_log->event = 'LOGIN';
                    $vc_time_clock_log->user = $user;
                    $vc_time_clock_log->user_group = $user_group;
                    $vc_time_clock_log->event_epoch = $start_time;
                    $vc_time_clock_log->ip_address = $user_ip;
                    $vc_time_clock_log->event_date = date("Y-m-d H:i:s");
                    $vc_time_clock_log->manager_user = $user;
                    $vc_time_clock_log->manager_ip = $user_ip;
                    $vc_time_clock_log->notes = "Manager LOGIN of user from user status page";
                    $vc_time_clock_log->save(); //save records in Vicidial time clock log.
                    $timeclock_id = $vc_time_clock_log->timeclock_id;
                    $vicidial_status['success_vc_time_clock_log'] = "NEW vicidial_timeclock_log record inserted for $user | $timeclock_id  ";

                    ### Update the user's timeclock status record.
                    $vc_timeclock_status = VicidialTimeclockStatus::where('user', $user)
                            ->update(['status' => 'LOGIN',
                        'user_group' => $user_group,
                        'event_epoch' => $start_time,
                        'ip_address' => $user_ip
                    ]);
                    $vicidial_status['success_vc_time_clock_log'] = " Vicidial_timeclock_status record updated for $user:  |$vc_timeclock_status ";

                    ### Add a record to the timeclock audit log
                    $vc_timeclock_audit_log = new VicidialtimeclockAuditLog();
                    $vc_timeclock_audit_log->timeclock_id = $timeclock_id;
                    $vc_timeclock_audit_log->event = 'LOGIN';
                    $vc_timeclock_audit_log->user = $user;
                    $vc_timeclock_audit_log->user_group = $user_group;
                    $vc_timeclock_audit_log->event_epoch = $start_time;
                    $vc_timeclock_audit_log->ip_address = $user_ip;
                    $vc_timeclock_audit_log->event_date = date("Y-m-d H:i:s");
                    $vc_timeclock_audit_log->save();
                    $vicidial_status['success_vc_time_clock_log'] = " NEW vicidial_timeclock_audit_log record inserted for $user  ";
                    ### Add a record to the vicidial_admin_log
//                    $SQL_log = "$stmtA|$stmtB|$stmtC|";
//                    $SQL_log = preg_replace('/;/', '', $SQL_log);
//                    $SQL_log = addslashes($SQL_log);
                    $vc_admin_log = new VicidialAdminLog();
                    $vc_admin_log->event_date = $start_time;
                    $vc_admin_log->user = $user;
                    $vc_admin_log->ip_address = $user_ip;
                    $vc_admin_log->event_section = 'TIMECLOCK';
                    $vc_admin_log->event_type = 'LOGIN';
                    $vc_admin_log->record_id = $user;
                    $vc_admin_log->event_code = 'USER FORCED LOGIN FROM STATUS PAGE';
                    $vc_admin_log->event_sql = '$SQL_log';
                    $vc_admin_log->event_notes = "Timeclock ID: $timeclock_id|";
                    $vc_admin_log->save();
                    $vicidial_status['vicidiallogs'][] = " NEW vicidial_admin_log record inserted for $user ";

                    $LOG_run++;
                    $vicidial_status['vc_display_message'] = "You have now logged-in the user: $user - $full_name";
                }

                ##### Run timeclock logout queries #####
                if (( ($status == 'LOGIN') or ( $status == 'START') ) and ( $stage == "tc_log_user_OUT")) {
                    ### Add a record to the timeclock log
                    $vc_timeclock_log = new VicidialTimeclockLog();
                    $vc_timeclock_log->event = 'LOGOUT';
                    $vc_timeclock_log->user = $user;
                    $vc_timeclock_log->user_group = $user_group;
                    $vc_timeclock_log->event_epoch = $start_time;
                    $vc_timeclock_log->ip_address = $user_ip;
                    $vc_timeclock_log->login_sec = $last_action_sec;
                    $vc_timeclock_log->event_date = $last_action_sec;
                    $vc_timeclock_log->event_date = date("Y-m-d H:i:s");
                    $vc_timeclock_log->manager_user = $user;
                    $vc_timeclock_log->manager_ip = $user_ip;
                    $vc_timeclock_log->notes = 'Manager LOGOUT of user from user status page';

                    $vc_timeclock_log->save();
                    $timeclock_id = $vc_timeclock_log->timeclock_id;
                    $vicidial_status['n_vc_display_message'][] = "NEW vicidial_timeclock_log record inserted for $user: $timeclock_id| ";
                    ### Update last login record in the timeclock log
                    $vc_timeclock_log = VicidialTimeclockLog::where(['user' => $user], ['event' => 'LOGIN'])
                            ->update([
                        'login_sec' => $last_action_sec,
                        'tcid_link' => $timeclock_id
                    ]);
                    $affected_rows = $vc_timeclock_log;
                    $vicidial_status['n_vc_display_message'][] = "vicidial_timeclock_log record updated for $user   |$affected_rows ";
                    ### Update the user's timeclock status record
                    $vc_timeclock_status = VicidialTimeclockStatus::where('user_group', $user_group)
                            ->update([
                        'status' => 'LOGOUT',
                        'user_group' => $user_group,
                        'event_epoch' => $start_time,
                        'ip_address' => $user_ip
                    ]);
                    $affected_rows = $vc_timeclock_status;
                    $vicidial_status['n_vc_display_message'][] = "vicidial_timeclock_status record updated for $user | $affected_rows ";
                    ### Add a record to the timeclock audit log
                    $vc_timeclock_audit_log = new VicidialtimeclockAuditLog();
                    $vc_timeclock_audit_log->timeclock_id = $timeclock_id;
                    $vc_timeclock_audit_log->event = 'LOGOUT';
                    $vc_timeclock_audit_log->user = $user;
                    $vc_timeclock_audit_log->event_epoch = $start_time;
                    $vc_timeclock_audit_log->ip_address = $user_ip;
                    $vc_timeclock_audit_log->login_sec = $last_action_sec;
                    $vc_timeclock_audit_log->event_date = date("Y-m-d H:i:s");
                    $affected_rows = $vc_timeclock_audit_log;
                    $timeclock_id = $vc_timeclock_audit_log->timeclock_id;
                    $vicidial_status['n_vc_display_message'][] = "NEW vicidial_timeclock_audit_log record inserted for $user  $affected_rows";

                    ### Update last login record in the timeclock audit log

                    $vc_timeclock_audit_log_nw = VicidialtimeclockAuditLog::where(['user' => $user])
                                    ->orderBy('timeclock_id', 'DESC')->first();
                    $vc_timeclock_audit_log_nw->login_sec = $last_action_sec;
                    $vc_timeclock_audit_log_nw->tcid_link = $timeclock_id;
                    $vc_timeclock_audit_log_nw->save();

                    $affected_rows = $vc_timeclock_audit_log;

                    ### Add a record to the vicidial_admin_log
                    ### Add a record to the vicidial_admin_log
                    $SQL_log = ''; //"$stmtA|$stmtB|$stmtC|";
                    $SQL_log = preg_replace('/;/', '', $SQL_log);
                    $SQL_log = addslashes($SQL_log);
                    $vc_admin_log = new VicidialAdminLog();
                    $vc_admin_log->event_date = $start_time;
                    $vc_admin_log->user = $user;
                    $vc_admin_log->ip_address = $user_ip;
                    $vc_admin_log->event_section = 'TIMECLOCK';
                    $vc_admin_log->event_type = 'LOGOUT';
                    $vc_admin_log->record_id = $user;
                    $vc_admin_log->event_code = 'USER FORCED LOGIN FROM STATUS PAGE';
                    $vc_admin_log->event_sql = '$SQL_log';
                    $vc_admin_log->event_notes = "Timeclock ID: $timeclock_id";
                    $vc_admin_log->save();
                    $vicidial_status['vicidiallogs'][] = " NEW vicidial_admin_log record inserted for $user ";
                    $LOG_run++;
                    $vicidial_status['vc_display_message'] = "You have now logged-out the user: $user - $full_name . Amount of time user was logged-in: $totTIME_HMS";
                }

                if ($LOG_run < 1)
                    $vicidial_status['vc_display_message'] = "ERROR: timeclock log problem, could not process: $status|$stage";

                $end_ms = microtime();
                $start_ms_ary = explode(" ", $start_ms);
                $end_ms_ary = explode(" ", $end_ms);
                $run_s = ($end_ms_ary[0] - $start_ms_ary[0]);
                $run_m = ($end_ms_ary[1] - $start_ms_ary[1]);
                $total_run = ($run_s + $run_m);
                $vc_r_log = VicidialReportLog::where('report_log_id', $report_log_id)
                        ->update(['run_time' => $total_run]);
            }

            return response()->json([
                        'status' => 200,
                        'message' => 'Successfully.',
                        'data' => $vicidial_status
            ]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

}
