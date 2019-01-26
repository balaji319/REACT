<?php

namespace App\Http\Controllers\Inbound;

use Illuminate\Http\Request;
use App\Http\Requests\InboundQueueRequest;
use App\Http\Controllers\Controller;
use App\Traits\AccessControl;
use App\Traits\ErrorLog;
use App\Traits\Helper;
use App\VicidialCampaign;
use App\VicidialInboundGroupAgent;
use App\VicidialUser;
use App\VicidialAdminLog;
use App\X5Log;
use App\VicidialLiveInboundAgent;
use App\VicidialCampaignStat;
use App\VicidialCampaignStatDebug;
use App\VicidialUserGroup;
use App\VicidialScript;
use App\VicidialInboundDid;
use App\VicidialCallMenu;
use App\X5ContactAccess;
use App\VicidialInboundGroup;
use App\Http\Resources\Number as NumberResource;
use Exception;
use Validator;

class InboundController extends Controller {

    use ErrorLog,
        AccessControl,
        Helper;

    /**
     * InboundController construct
     *
     * @return void
     */
    public function __construct() {
        $this->middleware('is_superadmin');
    }

    /**
     * Display a listing of the inbound queue resource.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws \App\Http\Controllers\Inbound\Exception
     */
    public function index(Request $request) {
        try {

            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $limit = $request->get('limit') ?: \Config::get("configs.pagination_limit");
            $search = $request->get('search') ?: NULL;

            $group_id = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_INGROUP, ACCESS_READ, $current_company_id, $user);
            $inbound_queues = VicidialInboundGroup::inboundGroupList($group_id, $search, $limit);
            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $inbound_queues]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Inbound queue active|in-active
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws \App\Http\Controllers\Inbound\Exception
     */
    public function activeOrInActiveInbound(Request $request) {
        try {
            $group_id = $request->group_id;

            Validator::make($request->all(), [
                'group_id' => 'required',
                'status' => 'required'
            ])->validate();
            $inbound = VicidialInboundGroup::where('group_id', $group_id)->first();
            $inbound->active = $request->status;
            $inbound->save();
            $message = ($request->status == 'Y') ? 'Inbound queue actived successfully.' : 'Inbound queue deactived successfully.';
            return response()->json(['status' => 200, 'msg' => $message]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Get inbound queue agent list by group id
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function agentsByGroupId(Request $request) {
        try {

            $group_id = $request->group_id;
            $user = $request->user();
            $current_company_id = $request->current_company_id;
            Validator::make($request->all(), [
                'group_id' => 'required'
            ])->validate();
            $permissions_list = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_INBOUND_AGENT, $permissions_list)) {
                throw new Exception('Cannot access agents, you might not have permission to do this.');
            }

            $users = VicidialUser::users();
            $agents = VicidialInboundGroupAgent::agentsByGroupId($group_id);
            if ($agents->isEmpty()) {
                if ($users->isEmpty()) {
                    throw new Exception('Something wents wrong!', 400);
                }
                $agent_data = [];
                $key = 0;
                foreach ($users as $user) {
                    $is_not_exists = (VicidialInboundGroupAgent::isUserExists($user->user, $group_id) == 0) ? true : false;
                    if ($is_not_exists) {
                        $agent_data[$key]["user"] = $user->user;
                        $agent_data[$key]["group_id"] = $group_id;
                        $agent_data[$key]["group_rank"] = 0;
                        $agent_data[$key]["group_weight"] = 0;
                        $agent_data[$key]["calls_today"] = 0;
                        $agent_data[$key]["group_web_vars"] = "";
                        $agent_data[$key]["group_grade"] = 1;
                        $agent_data[$key]["group_type"] = "C";
                        $key++;
                    }
                }
                if (!empty($agent_data)) {
                    VicidialInboundGroupAgent::insert($agent_data);
                    $agents = VicidialInboundGroupAgent::agentsByGroupId($group_id);
                }
            }
            foreach ($agents as $agent) {
                $check_value = explode(" ", $agent->closer_campaigns);
                if (in_array($group_id, $check_value)) {
                    $agent->status = true;
                } else {
                    $agent->status = false;
                }
            }
            return response()->json(['status' => 200, 'data' => $agents, 'msg' => "Success"], 200);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Update inbound queue agents list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function agentsByGroupIdUpdate(Request $request) {
        try {

            $group_id = $request->group_id;
            Validator::make($request->all(), [
                'group_id' => 'required'
            ])->validate();
            $agents_data = $request->agent_data;
            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $permissions_list = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE, $current_company_id, $user);

            if (!in_array(SYSTEM_COMPONENT_INBOUND_AGENT, $permissions_list)) {
                throw new Exception('Cannot update agents, you might not have permission to do this.');
            }

            $key = 0;
            $agent_new_data = [];
            $admin_log_data = [];
            $x5_log_data = [];
            $users = array_column($agents_data, 'user');

            foreach ($agents_data as $agent_data) {

                $update_obj = VicidialInboundGroupAgent::where("user", $agent_data['user'])->where("group_id", $group_id)->first();
                if ($update_obj instanceof VicidialInboundGroupAgent) {
                    $update_obj = VicidialInboundGroupAgent::where("user", $agent_data['user'])->where("group_id", $group_id)->update(['group_grade' => $agent_data['group_grade'], 'group_rank' => $agent_data['group_rank'], 'group_weight' => $agent_data['group_rank']]);
                    // Admin log
                    $admin_log_data[$key]['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                    $admin_log_data[$key]['user'] = $user->x5_contact_id;
                    $admin_log_data[$key]['ip_address'] = $this->clientIp();
                    $admin_log_data[$key]['event_section'] = "InboundController";
                    $admin_log_data[$key]['event_type'] = "MODIFY";
                    $admin_log_data[$key]['record_id'] = $agent_data['user'];
                    $admin_log_data[$key]['event_code'] = "USER INGROUP SETTINGS";
                    $admin_log_data[$key]['event_sql'] = "UPDATE vicidial_inbound_group_agents SET group_rank = " . $agent_data['group_rank'] . ", group_grade = " . $agent_data['group_grade'] . ", group_weight = " . $agent_data['group_grade'] . " WHERE group_id = " . $group_id . " AND user = " . $agent_data['user'];
                    $admin_log_data[$key]['event_notes'] = "";
                    $admin_log_data[$key]['user_group'] = "";
                    $key++;
                } else {
                    $agent_new_data[$key]['user'] = $agent_data['user'];
                    $agent_new_data[$key]['group_id'] = $group_id;
                    $agent_new_data[$key]['group_rank'] = 0;
                    $agent_new_data[$key]['group_weight'] = 0;
                    $agent_new_data[$key]['calls_today'] = 0;
                    $agent_new_data[$key]['group_web_vars'] = "";
                    $agent_new_data[$key]['group_type'] = "C";
                    $agent_new_data[$key]['group_grade'] = 1;
                    $key++;

                    // Admin log
                    $admin_log_data[$key]['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                    $admin_log_data[$key]['user'] = $user->x5_contact_id;
                    $admin_log_data[$key]['ip_address'] = $this->clientIp();
                    $admin_log_data[$key]['event_section'] = "InboundController";
                    $admin_log_data[$key]['event_type'] = "INGROUPS";
                    $admin_log_data[$key]['record_id'] = $group_id;
                    $admin_log_data[$key]['event_code'] = "ADMIN MODIFY FILTER PHONE GROUP";
                    $admin_log_data[$key]['event_sql'] = "INSERT INTO vicidial_inbound_group_agents (" . implode(',', array_keys($agent_new_data[$key - 1])) . ") VALUES (" . implode(',', array_values($agent_new_data[$key - 1])) . ")";
                    $admin_log_data[$key]['event_notes'] = "";
                    $admin_log_data[$key]['user_group'] = "";
                    $key++;
                }

                $vici_user = VicidialUser::where("user", $agent_data["user"])->first();

                if ($vici_user instanceof VicidialUser) {

                    $check_value = array_unique(array_filter(explode(" ", $vici_user->closer_campaigns), function($var) {
                                return $var != "" && $var != "-";
                            }));

                    if ($agent_data['status'] == true) {

                        if (is_array($check_value) && !in_array($group_id, $check_value)) {
                            array_push($check_value, $group_id);
                            $check_value = " " . implode(" ", $check_value) . " -";
                        } else {
                            $check_value = "";
                        }
                        $vici_user->closer_campaigns = $check_value;
                        $vici_user->save();

                        // Admin log
                        $admin_log_data[$key]['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                        $admin_log_data[$key]['user'] = $user->x5_contact_id;
                        $admin_log_data[$key]['ip_address'] = $this->clientIp();
                        $admin_log_data[$key]['event_section'] = "InboundController";
                        $admin_log_data[$key]['event_type'] = "MODIFY";
                        $admin_log_data[$key]['record_id'] = $vici_user->user_id;
                        $admin_log_data[$key]['event_code'] = "USER INGROUP SETTINGS";
                        $admin_log_data[$key]['event_sql'] = "UPDATE vicidial_users SET closer_compaigns = " . $check_value . " WHERE user = " . $agent_data['user'];
                        $admin_log_data[$key]['event_notes'] = "";
                        $admin_log_data[$key]['user_group'] = "";
                        $key++;

                        // X5 log
                        $x5_log_data[$key]['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
                        $x5_log_data[$key]['x5_contact_id'] = $user->x5_contact_id;
                        $x5_log_data[$key]['company_id'] = $user->company_id;
                        $x5_log_data[$key]['user_ip'] = $this->clientIp();
                        $x5_log_data[$key]['class'] = "InboundController";
                        $x5_log_data[$key]['method'] = __FUNCTION__;
                        $x5_log_data[$key]['model'] = VicidialUser::class;
                        $x5_log_data[$key]['action_1'] = "MODIFY";
                        $key++;
                    }

                    if ($agent_data['status'] == false) {

                        if (is_array($check_value) && in_array($group_id, $check_value)) {
                            $check_value = array_diff($check_value, [$group_id]);
                            $check_value = " " . implode(" ", $check_value) . " -";
                        } else {
                            $check_value = "";
                        }
                        $vici_user->closer_campaigns = $check_value;
                        $vici_user->save();
                    }

                    if (!in_array($vici_user->user, $users)) {
                        $existingInboundGroups = array_values(array_unique(array_filter(explode(' ', $user->closer_campaigns), function($var) {
                                            return $var != '' && $var != '-';
                                        })));

                        if (array_search($group_id, $existingInboundGroups) !== false) {
                            array_splice($existingInboundGroups, array_search($group_id, $existingInboundGroups), 1);
                        }

                        if (!empty($existingInboundGroups)) {
                            $newInboundGroups = ' ' . implode(' ', $existingInboundGroups) . ' -';
                        } else {
                            $newInboundGroups = '';
                        }

                        $vici_user->closer_campaigns = $newInboundGroups;
                        $vici_user->save();

                        // Admin log
                        $admin_log_data[$key]['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                        $admin_log_data[$key]['user'] = $user->x5_contact_id;
                        $admin_log_data[$key]['ip_address'] = $this->clientIp();
                        $admin_log_data[$key]['event_section'] = "InboundController";
                        $admin_log_data[$key]['event_type'] = "MODIFY";
                        $admin_log_data[$key]['record_id'] = $vici_user->user_id;
                        $admin_log_data[$key]['event_code'] = "USER INGROUP SETTINGS";
                        $admin_log_data[$key]['event_sql'] = "UPDATE vicidial_users SET closer_compaigns = " . $newInboundGroups . " WHERE user = " . $agent_data['user'];
                        $admin_log_data[$key]['event_notes'] = "";
                        $admin_log_data[$key]['user_group'] = "";
                        $key++;

                        // X5 log
                        $x5_log_data[$key]['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
                        $x5_log_data[$key]['x5_contact_id'] = $user->x5_contact_id;
                        $x5_log_data[$key]['company_id'] = $user->company_id;
                        $x5_log_data[$key]['user_ip'] = $this->clientIp();
                        $x5_log_data[$key]['class'] = "InboundController";
                        $x5_log_data[$key]['method'] = __FUNCTION__;
                        $x5_log_data[$key]['model'] = VicidialUser::class;
                        $x5_log_data[$key]['action_1'] = "MODIFY";
                        $key++;
                    }
                }
            }

            if (!empty($admin_log_data)) {
                $admin_log_data = array_values($admin_log_data);
                VicidialAdminLog::insert($admin_log_data);
            }

            if (!empty($agent_new_data)) {
                $agent_new_data = array_values($agent_new_data);
                VicidialInboundGroupAgent::insert($agent_new_data);
            }

            if (!empty($x5_log_data)) {
                $x5_log_data = array_values($x5_log_data);
                X5Log::insert($x5_log_data);
            }
            return response()->json(['status' => 200, 'msg' => "Agent For Inbound Group Updated Succesfully."], 200);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.InboundController'), $e);
            throw $e;
        }
    }

    /**
     * Get numbers by group id
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws \App\Http\Controllers\Numbers\Exception
     */
    public function numbersByGroupId(Request $request) {
        try {

            $group_id = $request->group_id;
            Validator::make($request->all(), [
                'group_id' => 'required'
            ])->validate();
            $limit = $request->get('limit') ?: \Config::get("configs.pagination_limit");
            $search = $request->get('search') ?: NULL;
            $numbers = VicidialInboundDid::numbersByGroupId($group_id, $search, $limit);
            return NumberResource::collection($numbers)->additional(['status' => 200, 'msg' => 'Success']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Get call menus by group_id
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws \App\Http\Controllers\CallMenu\Exception
     */
    public function callMenuByGroupId(Request $request) {
        try {

            $group_id = $request->group_id;
            Validator::make($request->all(), [
                'group_id' => 'required'
            ])->validate();
            $limit = $request->get('limit') ?: \Config::get("configs.pagination_limit");
            $search = $request->get('search') ?: NULL;
            $call_menus = VicidialCallMenu::callMenuByGroupId($group_id, $search, $limit);



            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $call_menus]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Get inbound campaigns list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws \App\Http\Controllers\Campaigns\Exception
     */
    public function campaignsByGroupId(Request $request) {

        try {

            $group_id = $request->group_id;
            Validator::make($request->all(), [
                'group_id' => 'required'
            ])->validate();
            $search = $request->search ?: NULL;
            $campaigns = VicidialCampaign::campaignsByGroupId($search);
            foreach ($campaigns as $key => $campaign) {
                foreach ($campaign as $value) {
                    if ($value == "closer_campaigns") {
                        $closer_campaigns_arr = explode(" ", $campaign->closer_campaigns);
                        if (in_array($group_id, $closer_campaigns_arr)) {
                            $campaign->closer_campaigns_status = true;
                        } else {
                            $campaign->closer_campaigns_status = false;
                        }
                    }
                    if ($value == "xfer_groups") {
                        $xfer_groups_arr = explode(" ", $campaign->xfer_groups);
                        if (in_array($group_id, $xfer_groups_arr)) {
                            $campaign->xfer_groups_status = true;
                        } else {
                            $campaign->xfer_groups_status = false;
                        }
                    }
                }
                $campaign->options_title = $campaign->campaign_id . " - " . $campaign->campaign_name;
                unset($campaign->campaign_name);
            }
            return response()->json(['status' => 200, 'data' => $campaigns, 'msg' => "Success"], 200);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Update inbound campaigns list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws \App\Http\Controllers\Campaigns\Exception
     */
    public function campaignsByGroupIdUpdate(Request $request) {
        try {
            $group_id = $request->group_id;
            Validator::make($request->all(), [
                'group_id' => 'required'
            ])->validate();
            $closer_campaigns_array = $request->closer_campaigns_array;
            $xfer_groups_array = $request->xfer_groups_array;
            $search = $request->search ?: NULL;
            $campaigns = VicidialCampaign::campaignsByGroupId($search);
            foreach ($campaigns as $key => $campaign) {
                $closer_campaigns = array_unique(array_filter(explode(" ", $campaign->closer_campaigns), function($var) {
                            return $var != "" && $var != "-";
                        }));
                $xfer_groups = array_unique(array_filter(explode(" ", $campaign->xfer_groups), function($var) {
                            return $var != "" && $var != "-";
                        }));
                if (in_array($campaign->campaign_id, $closer_campaigns_array)) {
                    if (is_array($closer_campaigns) && !in_array($group_id, $closer_campaigns)) {
                        array_push($closer_campaigns, $group_id);
                    }
                } else {
                    $closer_campaigns = array_diff($closer_campaigns, [$group_id]);
                }
                if (in_array($campaign->campaign_id, $xfer_groups_array)) {
                    if (is_array($xfer_groups) && !in_array($group_id, $xfer_groups)) {
                        array_push($xfer_groups, $group_id);
                    }
                } else {
                    $xfer_groups = array_diff($xfer_groups, [$group_id]);
                }
                $xfer_groups = " " . implode(" ", $xfer_groups) . " -";
                $closer_campaigns = " " . implode(" ", $closer_campaigns) . " -";
                $campaign->xfer_groups = $xfer_groups;
                $campaign->closer_campaigns = $closer_campaigns;
                $campaign->save();
            }

            return response()->json(['status' => 200, 'msg' => 'Record Saved Successfully.'], 200);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Delete Inbound queue
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws \App\Http\Controllers\Campaigns\Exception
     */
    public function deleteInboundQueue(Request $request) {
        try {

            $group_id = $request->group_id;
            Validator::make($request->all(), [
                'group_id' => 'required'
            ])->validate();


            ViciDialInboundGroup::where('group_id', $group_id)->whereNotIn('group_id', ['AGENTDIRECT'])->delete();
            VicidialInboundGroupAgent::where('group_id', $group_id)->delete();
            VicidialLiveInboundAgent::where('group_id', $group_id)->delete();
            VicidialCampaignStat::where('campaign_id', $group_id)->delete();
            \App\VicidialCampaignStatsDebug::where('campaign_id', $group_id)->delete();

            $users = VicidialUser::users();
            foreach ($users as $user) {
                $user->closer_campaigns = str_replace("$group_id ", "", $user->closer_campaigns);
                $user->save();
            }

            $campaigns = VicidialCampaign::select('campaign_id', 'xfer_groups', 'closer_campaigns')->get();
            foreach ($campaigns as $campaign) {
                $campaign->closer_campaigns = str_replace("$group_id ", "", $campaign->closer_campaigns);
                $campaign->xfer_groups = str_replace("$group_id ", "", $campaign->xfer_groups);
                $campaign->save();
            }

            $user = $request->user();
            // Admin log
            $admin_log_data['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log_data['user'] = $user->x5_contact_id;
            $admin_log_data['ip_address'] = $this->clientIp();
            $admin_log_data['event_section'] = "INGROUPS";
            $admin_log_data['event_type'] = "DELETE";
            $admin_log_data['record_id'] = $group_id;
            $admin_log_data['event_code'] = "ADMIN DELETE INGROUP";
            $admin_log_data['event_sql'] = "DELETE from vicidial_inbound_groups where group_id='$group_id' and group_id NOT IN('AGENTDIRECT') limit 1;";
            $admin_log_data['event_notes'] = "";
            $admin_log_data['user_group'] = "";
            VicidialAdminLog::insert($admin_log_data);

            return response()->json(['status' => 200, 'msg' => "Record successfully deleted."], 200);
        } catch (Exception $ex) {
            $this->postLogs(config('errorcontants.mysql'), $ex);
            throw $ex;
        }
    }

    public function addInboundQueue(InboundQueueRequest $request) {

        try {

            $user = $request->user();
            $current_company_id = $request->current_company_id;



            $access_type_list = $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_CREATE, $user);


            if (!empty((SYSTEM_COMPONENT_INBOUND_INBOUND_QUEUE) && !in_array(SYSTEM_COMPONENT_INBOUND_INBOUND_QUEUE, $access_type_list))) {
                throw new Exception('Cannot update inbound Queue.', 404);
            }

            // return "helo";
            $vicidial_inbound_group = new VicidialInboundGroup;
            // $vicidial_inbound_group['group_id']=$request
            // $this->{$this->db_model}->id = $this->request->data[$this->{$this->db_model}->primaryKey];
            // We need duplicate validation in case of add -- Primay Key -- //
            if ($vicidial_inbound_group->duplicateRecords($request['group_id']) == 0) {
                $add_inbound_group = $vicidial_inbound_group->create($request->all());

                $lastInsertId = $add_inbound_group->group_id;
                // print_r($add_inbound_group);
                // return $lastInsertId;
                // return $new;

                if ($add_inbound_group) {

                    $admin_log = new VicidialAdminLog();

                    $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                    $admin_log['user'] = $user->x5_contact_id;
                    $admin_log['ip_address'] = $this->clientIp();
                    $admin_log['event_section'] = "INGROUPS";
                    $admin_log['event_type'] = "ADD";
                    // $admin_log['recycle_id'] = $request['group_id'];
                    $admin_log['record_id'] = $request['group_id'];
                    $admin_log['event_code'] = "ADMIN ADD INGROUP";
                    $admin_log['event_sql'] = $vicidial_inbound_group->getquery($request->all(), "ADD");
                    $admin_log['event_notes'] = "";
                    $admin_log['user_group'] = $request['user_group'];


                    $admin_log->save();

                    # Add code for server setting


                    if (!empty(ACCESS_TYPE_INGROUP)) {
                        if (!array_key_exists(ACCESS_TYPE_INGROUP, $access_type_list)) {
                            return false;
                        }

                        $X5ContactAccess = new X5ContactAccess;

                        $accessData = [
                            'model' => ACCESS_MODEL_CONTACT,
                            'foreign_key' => $user->x5_contact_id,
                            'type' => ACCESS_TYPE_INGROUP,
                            'link_id' => $lastInsertId,
                            ACCESS_CREATE => false,
                            ACCESS_READ => true,
                            ACCESS_UPDATE => true,
                            ACCESS_DELETE => true,
                        ];

                        $X5ContactAccess->create();
                        $X5ContactAccess->save($accessData);
                    }




                    if ($request['inboundgroup'] == "inboundgroup") {

                        return $this->getInboundQueueAgent($request);
                        return response()->json(['status' => 200, 'data' => $request['group_id'], 'msg' => "Success"], 200);
                    } else {

                        return $this->getInboundQueueAgent($request);
                        return response()->json(['status' => 200, 'msg' => "Success"], 200);
                    }
                } else {
// return json_encode($this->{$this->db_model}->validationErrors);

                    throw new Exception('validation error', 400);
                    // return json_encode(array('validationErrors' => 'validation error.'));
                }
            } else {

                if ($request['inboundgroup'] == "inboundgroup") {


                    return response()->json(['status' => 400, 'data' => $request['group_id'], 'msg' => 'This record is already present.'], 400);
                } else {
                    throw new Exception('This record is already present.', 400);
                }
            }
        } catch (Exception $ex) {
            $this->postLogs(config('errorcontants.mysql'), $ex);
            throw $ex;
        }
    }

    public function getInboundQueueAgent(Request $request) {

        try {
            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $group_id = $request->group_id;


            $users = VicidialUser::users();

            $agents = VicidialInboundGroupAgent::agentsByGroupId($group_id);


            if (count($agents) == 0) {

                if (empty($users)) {
                    throw new Exception('Something wents wrong!', 401);
                }

                $agent_data = [];
                $key = 0;
                foreach ($users as $user) {

                    $is_not_exists = VicidialInboundGroupAgent::where("user", $user->user)->where("group_id", $group_id)->count();


                    if ($is_not_exists == 0) {


                        $agent_data[$key]["user"] = $user->user;
                        $agent_data[$key]["group_id"] = $group_id;
                        $agent_data[$key]["group_rank"] = 0;
                        $agent_data[$key]["group_weight"] = 0;
                        $agent_data[$key]["calls_today"] = 0;
                        $agent_data[$key]["group_web_vars"] = "";
                        $agent_data[$key]["group_grade"] = 1;
                        $agent_data[$key]["group_type"] = "C";
                        $key++;
                    }
                }

                if (!empty($agent_data)) {
                    VicidialInboundGroupAgent::insert($agent_data);
                    $agents = VicidialInboundGroupAgent::agentsByGroupId($group_id);
                }
            }

            foreach ($agents as $agent) {
                $check_value = explode(" ", $agent->closer_campaigns);

                if (in_array($group_id, $check_value)) {
                    $agent->status = true;
                } else {
                    $agent->status = false;
                }
            }
// return $agent_data;
            return response()->json(['status' => 200, 'data' => $agents, 'msg' => "Success"], 200);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    public function addInboundQueueAgent(Request $request) {
        try {
            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $permissions_list = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE, $current_company_id, $user);

            if (!$permissions_list->has(SYSTEM_COMPONENT_INBOUND_AGENT)) {
                throw new Exception('Cannot store agents, you might not have permission to do this.');
            }

            $key = 0;
            $agent_new_data = [];
            $admin_log_data = [];
            $x5_log_data = [];
            $group_id = $request->get('group_id');
            $agents_data = $request->get('agent_data');
            $users = array_column($agents_data, 'user');

            foreach ($agents_data as $agent_data) {


                $update_obj = VicidialInboundGroupAgent::where("user", $agent_data['user'])->where("group_id", $group_id)->first();

                if ($update_obj instanceof VicidialInboundGroupAgent) {
                    $update_obj = VicidialInboundGroupAgent::where("user", $agent_data['user'])->where("group_id", $group_id)->update(['group_grade' => $agent_data['group_grade'], 'group_rank' => $agent_data['group_rank'], 'group_weight' => $agent_data['group_rank']]);


                    // Admin log
                    $admin_log_data[$key]['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                    $admin_log_data[$key]['user'] = $user->x5_contact_id;
                    $admin_log_data[$key]['ip_address'] = $this->clientIp();
                    $admin_log_data[$key]['event_section'] = "InboundController";
                    $admin_log_data[$key]['event_type'] = "MODIFY";
                    $admin_log_data[$key]['record_id'] = $agent_data['user'];
                    $admin_log_data[$key]['event_code'] = "USER INGROUP SETTINGS";
                    $admin_log_data[$key]['event_sql'] = "UPDATE vicidial_inbound_group_agents SET group_rank = " . $agent_data['group_rank'] . ", group_grade = " . $agent_data['group_grade'] . ", group_weight = " . $agent_data['group_grade'] . " WHERE group_id = " . $group_id . " AND user = " . $agent_data['user'];
                    $admin_log_data[$key]['event_notes'] = "";
                    $admin_log_data[$key]['user_group'] = "";
                    $key++;
                } else {
                    $agent_new_data[$key]['user'] = $agent_data['user'];
                    $agent_new_data[$key]['group_id'] = $group_id;
                    $agent_new_data[$key]['group_rank'] = 0;
                    $agent_new_data[$key]['group_weight'] = 0;
                    $agent_new_data[$key]['calls_today'] = 0;
                    $agent_new_data[$key]['group_web_vars'] = "";
                    $agent_new_data[$key]['group_type'] = "C";
                    $agent_new_data[$key]['group_grade'] = 1;
                    $key++;

                    // Admin log
                    $admin_log_data[$key]['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                    $admin_log_data[$key]['user'] = $user->x5_contact_id;
                    $admin_log_data[$key]['ip_address'] = $this->clientIp();
                    $admin_log_data[$key]['event_section'] = "InboundController";
                    $admin_log_data[$key]['event_type'] = "INGROUPS";
                    $admin_log_data[$key]['record_id'] = $group_id;
                    $admin_log_data[$key]['event_code'] = "ADMIN MODIFY FILTER PHONE GROUP";
                    $admin_log_data[$key]['event_sql'] = "INSERT INTO vicidial_inbound_group_agents (" . implode(',', array_keys($agent_new_data[$key - 1])) . ") VALUES (" . implode(',', array_values($agent_new_data[$key - 1])) . ")";
                    $admin_log_data[$key]['event_notes'] = "";
                    $admin_log_data[$key]['user_group'] = "";
                    $key++;
                }

                $vici_user = VicidialUser::where("user", $agent_data["user"])->first();


                if ($vici_user instanceof User) {

                    $check_value = array_unique(array_filter(explode(" ", $vici_user->closer_campaigns), function($var) {
                                return $var != "" && $var != "-";
                            }));


                    if ($agent_data['status'] == 'YES') {


                        if (is_array($check_value) && !in_array($group_id, $check_value)) {
                            array_push($check_value, $group_id);
                            $check_value = " " . implode(" ", $check_value) . " -";
                        } else {
                            $check_value = "";
                        }

                        $vici_user->closer_campaigns = $check_value;
                        $vici_user->save();
                        // return $check_value;
                        // Admin log

                        $admin_log_data[$key]['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                        $admin_log_data[$key]['user'] = $user->x5_contact_id;
                        $admin_log_data[$key]['ip_address'] = $this->clientIp();
                        $admin_log_data[$key]['event_section'] = "InboundController";
                        $admin_log_data[$key]['event_type'] = "MODIFY";
                        $admin_log_data[$key]['record_id'] = $vici_user->user_id;
                        $admin_log_data[$key]['event_code'] = "USER INGROUP SETTINGS";
                        $admin_log_data[$key]['event_sql'] = "UPDATE vicidial_users SET closer_compaigns = " . $check_value . " WHERE user = " . $agent_data['user'];
                        $admin_log_data[$key]['event_notes'] = "";
                        $admin_log_data[$key]['user_group'] = "";

                        $key++;

                        // X5 log
                        $x5_log_data[$key]['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
                        $x5_log_data[$key]['x5_contact_id'] = $user->x5_contact_id;
                        $x5_log_data[$key]['company_id'] = $user->company_id;
                        $x5_log_data[$key]['user_ip'] = $this->clientIp();
                        $x5_log_data[$key]['class'] = "InboundController";
                        $x5_log_data[$key]['method'] = __FUNCTION__;
                        $x5_log_data[$key]['model'] = VicidialUser::class;
                        $x5_log_data[$key]['action_1'] = "MODIFY";
                        $key++;
                    }

                    if ($agent_data['status'] == 'NO') {

                        if (is_array($check_value) && in_array($group_id, $check_value)) {
                            $check_value = array_diff($check_value, [$group_id]);
                            $check_value = " " . implode(" ", $check_value) . " -";
                        } else {
                            $check_value = "";
                        }
                        $vici_user->closer_campaigns = $check_value;
                        $vici_user->save();
                    }

                    if (!in_array($vici_user->user, $users)) {
                        $existingInboundGroups = array_values(array_unique(array_filter(explode(' ', $user->closer_campaigns), function($var) {
                                            return $var != '' && $var != '-';
                                        })));


                        if (array_search($group_id, $existingInboundGroups) !== false) {
                            array_splice($existingInboundGroups, array_search($group_id, $existingInboundGroups), 1);
                        }

                        if (!empty($existingInboundGroups)) {
                            $newInboundGroups = ' ' . implode(' ', $existingInboundGroups) . ' -';
                        } else {
                            $newInboundGroups = '';
                        }

                        $vici_user->closer_campaigns = $newInboundGroups;
                        $vici_user->save();

                        // Admin log
                        $admin_log_data[$key]['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                        $admin_log_data[$key]['user'] = $user->x5_contact_id;
                        $admin_log_data[$key]['ip_address'] = $this->clientIp();
                        $admin_log_data[$key]['event_section'] = "InboundController";
                        $admin_log_data[$key]['event_type'] = "MODIFY";
                        $admin_log_data[$key]['record_id'] = $vici_user->user_id;
                        $admin_log_data[$key]['event_code'] = "USER INGROUP SETTINGS";
                        $admin_log_data[$key]['event_sql'] = "UPDATE vicidial_users SET closer_compaigns = " . $newInboundGroups . " WHERE user = " . $agent_data['user'];
                        $admin_log_data[$key]['event_notes'] = "";
                        $admin_log_data[$key]['user_group'] = "";
                        $key++;

                        // X5 log
                        $x5_log_data[$key]['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
                        $x5_log_data[$key]['x5_contact_id'] = $user->x5_contact_id;
                        $x5_log_data[$key]['company_id'] = $user->company_id;
                        $x5_log_data[$key]['user_ip'] = $this->clientIp();
                        $x5_log_data[$key]['class'] = "InboundController";
                        $x5_log_data[$key]['method'] = __FUNCTION__;
                        $x5_log_data[$key]['model'] = VicidialUser::class;
                        $x5_log_data[$key]['action_1'] = "MODIFY";
                        $key++;
                    }
                }
            }
            if (!empty($admin_log_data)) {
                $admin_log_data = array_values($admin_log_data);

                VicidialAdminLog::insert($admin_log_data);
            }

            if (!empty($agent_new_data)) {
                $agent_new_data = array_values($agent_new_data);
                VicidialInboundGroupAgent::insert($agent_new_data);
            }

            if (!empty($x5_log_data)) {
                $x5_log_data = array_values($x5_log_data);
                X5Log::insert($x5_log_data);
            }
            return response()->json(['status' => 200, 'msg' => "Agent For Inbound Group Added Succesfully."], 200);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    public function editInboundQueue($data_id) {
        try {
            $vicidial_inbound_group = VicidialInboundGroup::find($data_id);


            if (!$vicidial_inbound_group) {
                throw new Exception('This record is not present.', 404);
            }
            return response()->json(['status' => 200, 'data' => $vicidial_inbound_group, 'msg' => "Success."], 200);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    public function updateInboundQueue(InboundQueueRequest $request) {

        try {

            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $permissions_list = $this->getListByAccess(ACCESS_TYPE_INGROUP, ACCESS_READ, $user);

            $access_type_list = $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE, $user);

            if (!empty(ACCESS_TYPE_INGROUP && !in_array($request['group_id'], $permissions_list))) {
                throw new Exception('Cannot update inbound Queue.', 400);
            }
            if (!empty((SYSTEM_COMPONENT_INBOUND_INBOUND_QUEUE) && !in_array(SYSTEM_COMPONENT_INBOUND_INBOUND_QUEUE, $access_type_list))) {
                throw new Exception('Cannot update inbound Queue.', 400);
            }

            $originData = VicidialInboundGroup::find($request['group_id']);

            $modify_inbound = $originData->fill($request->all());
            $modify_inbound->save();

            $que = str_replace(array('{', '}'), ' ', $modify_inbound);

            $list_order_randomize = $request['list_order_randomize'];
            if ($list_order_randomize != "") {

                $campaign_id1 = $request['campaign_id'];
                $campaign = VicidialCampaign::find($campaign_id1);
                $data['lead_order_randomize'] = $list_order_randomize;
                $campaign->fill($data)->save();
            }

            $admin_log = new VicidialAdminLog();
            $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log['user'] = $user->x5_contact_id;
            $admin_log['ip_address'] = $this->clientIp();
            $admin_log['event_section'] = "INGROUPS";
            $admin_log['event_type'] = "MODIFY";
            $admin_log['record_id'] = $request['group_id'];
            $admin_log['event_code'] = "ADMIN MODIFY INGROUP";
            $admin_log['event_sql'] = "UPDATE vicidial_inbound_groups SET " . $que . "where group_id='" . $request['group_id'] . "'";
            $admin_log['event_notes'] = "";
            $admin_log['user_group'] = $request['user_group'];
            $admin_log->save();


                    $x5_log_data=new X5Log;
                    $x5_log_data['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
                    $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
                    $x5_log_data['company_id'] = $user->company_id;
                    $x5_log_data['user_ip'] = $this->clientIp();
                    $x5_log_data['class'] = "InboundController";
                    $x5_log_data['method'] = __FUNCTION__;
                    $x5_log_data['model'] = User::class;
                    $x5_log_data['action_1'] = "MODIFY";
                    $x5_log_data->save();




              return response()->json(['status' => 200,'data' => $originData,'msg' => "Inbound Queue Successfully Updated"],200);
        } catch (Exception $ex) {
            $this->postLogs(config('errorcontants.mysql'), $ex);

            throw $ex;
        }
    }

    public function cloneInboundQueue(Request $request) {

        try {

            $users = VicidialUser::users();

            $this->autoRender = false;
            $group_id = $request['group_id'];

            $count = VicidialInboundGroup::find($group_id);


            if (!$count) { //not exists
                $fromInboundGroups = VicidialInboundGroup::find($request['from_inbound_id']);


                $savedata = array(
                    'group_id' => $request['group_id'],
                    'group_name' => $request['group_name'],
                    'group_color' => $fromInboundGroups['group_color'],
                    'active' => $fromInboundGroups['active'],
                    'web_form_address' => $fromInboundGroups['web_form_address'],
                    'voicemail_ext' => $fromInboundGroups['voicemail_ext'],
                    'next_agent_call' => $fromInboundGroups['next_agent_call'],
                    'fronter_display' => $fromInboundGroups['fronter_display'],
                    'ingroup_script' => $fromInboundGroups['ingroup_script'],
                    'get_call_launch' => $fromInboundGroups['get_call_launch'],
                    'xferconf_a_dtmf' => $fromInboundGroups['xferconf_a_dtmf'],
                    'xferconf_a_number' => $fromInboundGroups['xferconf_a_number'],
                    'xferconf_b_dtmf' => $fromInboundGroups['xferconf_b_dtmf'],
                    'xferconf_b_number' => $fromInboundGroups['xferconf_b_number'],
                    'drop_call_seconds' => $fromInboundGroups['drop_call_seconds'],
                    'drop_action' => $fromInboundGroups['drop_action'],
                    'drop_exten' => $fromInboundGroups['drop_exten'],
                    'call_time_id' => $fromInboundGroups['call_time_id'],
                    'after_hours_action' => $fromInboundGroups['after_hours_action'],
                    'after_hours_message_filename' => $fromInboundGroups['after_hours_message_filename'],
                    'after_hours_exten' => $fromInboundGroups['after_hours_exten'],
                    'after_hours_voicemail' => $fromInboundGroups['after_hours_voicemail'],
                    'welcome_message_filename' => $fromInboundGroups['welcome_message_filename'],
                    'moh_context' => $fromInboundGroups['moh_context'],
                    'onhold_prompt_filename' => $fromInboundGroups['onhold_prompt_filename'],
                    'prompt_interval' => $fromInboundGroups['prompt_interval'],
                    'agent_alert_exten' => $fromInboundGroups['agent_alert_exten'],
                    'agent_alert_delay' => $fromInboundGroups['agent_alert_delay'],
                    'default_xfer_group' => $fromInboundGroups['default_xfer_group'],
                    'queue_priority' => $fromInboundGroups['queue_priority'],
                    'drop_inbound_group' => $fromInboundGroups['drop_inbound_group'],
                    'ingroup_recording_override' => $fromInboundGroups['ingroup_recording_override'],
                    'ingroup_rec_filename' => $fromInboundGroups['ingroup_rec_filename'],
                    'afterhours_xfer_group' => $fromInboundGroups['afterhours_xfer_group'],
                    'qc_enabled' => $fromInboundGroups['qc_enabled'],
                    'qc_statuses' => $fromInboundGroups['qc_statuses'],
                    'qc_shift_id' => $fromInboundGroups['qc_shift_id'],
                    'qc_get_record_launch' => $fromInboundGroups['qc_get_record_launch'],
                    'qc_show_recording' => $fromInboundGroups['qc_show_recording'],
                    'qc_web_form_address' => $fromInboundGroups['qc_web_form_address'],
                    'qc_script' => $fromInboundGroups['qc_script'],
                    'play_place_in_line' => $fromInboundGroups['play_place_in_line'],
                    'play_estimate_hold_time' => $fromInboundGroups['play_estimate_hold_time'],
                    'hold_time_option' => $fromInboundGroups['hold_time_option'],
                    'hold_time_option_seconds' => $fromInboundGroups['hold_time_option_seconds'],
                    'hold_time_option_exten' => $fromInboundGroups['hold_time_option_exten'],
                    'hold_time_option_voicemail' => $fromInboundGroups['hold_time_option_voicemail'],
                    'hold_time_option_xfer_group' => $fromInboundGroups['hold_time_option_xfer_group'],
                    'hold_time_option_callback_filename' => $fromInboundGroups['hold_time_option_callback_filename'],
                    'hold_time_option_callback_list_id' => $fromInboundGroups['hold_time_option_callback_list_id'],
                    'hold_recall_xfer_group' => $fromInboundGroups['hold_recall_xfer_group'],
                    'no_delay_call_route' => $fromInboundGroups['no_delay_call_route'],
                    'play_welcome_message' => $fromInboundGroups['play_welcome_message'],
                    'answer_sec_pct_rt_stat_one' => $fromInboundGroups['answer_sec_pct_rt_stat_one'],
                    'answer_sec_pct_rt_stat_two' => $fromInboundGroups['answer_sec_pct_rt_stat_two'],
                    'default_group_alias' => $fromInboundGroups['default_group_alias'],
                    'no_agent_no_queue' => $fromInboundGroups['no_agent_no_queue'],
                    'no_agent_action' => $fromInboundGroups['no_agent_action'],
                    'no_agent_action_value' => $fromInboundGroups['no_agent_action_value'],
                    'web_form_address_two' => $fromInboundGroups['web_form_address_two'],
                    'timer_action' => $fromInboundGroups['timer_action'],
                    'timer_action_message' => $fromInboundGroups['timer_action_message'],
                    'timer_action_seconds' => $fromInboundGroups['timer_action_seconds'],
                    'start_call_url' => $fromInboundGroups['start_call_url'],
                    'dispo_call_url' => $fromInboundGroups['dispo_call_url'],
                    'xferconf_c_number' => $fromInboundGroups['xferconf_c_number'],
                    'xferconf_d_number' => $fromInboundGroups['xferconf_d_number'],
                    'xferconf_e_number' => $fromInboundGroups['xferconf_e_number'],
                    'ignore_list_script_override' => $fromInboundGroups['ignore_list_script_override'],
                    'extension_appended_cidname' => $fromInboundGroups['extension_appended_cidname'],
                    'uniqueid_status_display' => $fromInboundGroups['uniqueid_status_display'],
                    'uniqueid_status_prefix' => $fromInboundGroups['uniqueid_status_prefix'],
                    'hold_time_option_minimum' => $fromInboundGroups['hold_time_option_minimum'],
                    'hold_time_option_press_filename' => $fromInboundGroups['hold_time_option_press_filename'],
                    'hold_time_option_callmenu' => $fromInboundGroups['hold_time_option_callmenu'],
                    'hold_time_option_no_block' => $fromInboundGroups['hold_time_option_no_block'],
                    'hold_time_option_prompt_seconds' => $fromInboundGroups['hold_time_option_prompt_seconds'],
                    'onhold_prompt_no_block' => $fromInboundGroups['onhold_prompt_no_block'],
                    'onhold_prompt_seconds' => $fromInboundGroups['onhold_prompt_seconds'],
                    'hold_time_second_option' => $fromInboundGroups['hold_time_second_option'],
                    'hold_time_third_option' => $fromInboundGroups['hold_time_third_option'],
                    'wait_hold_option_priority' => $fromInboundGroups['wait_hold_option_priority'],
                    'wait_time_option' => $fromInboundGroups['wait_time_option'],
                    'wait_time_second_option' => $fromInboundGroups['wait_time_second_option'],
                    'wait_time_third_option' => $fromInboundGroups['wait_time_third_option'],
                    'wait_time_option_seconds' => $fromInboundGroups['wait_time_option_seconds'],
                    'wait_time_option_exten' => $fromInboundGroups['wait_time_option_exten'],
                    'wait_time_option_voicemail' => $fromInboundGroups['wait_time_option_voicemail'],
                    'wait_time_option_xfer_group' => $fromInboundGroups['wait_time_option_xfer_group'],
                    'wait_time_option_callmenu' => $fromInboundGroups['wait_time_option_callmenu'],
                    'wait_time_option_callback_filename' => $fromInboundGroups['wait_time_option_callback_filename'],
                    'wait_time_option_callback_list_id' => $fromInboundGroups['wait_time_option_callback_list_id'],
                    'wait_time_option_press_filename' => $fromInboundGroups['wait_time_option_press_filename'],
                    'wait_time_option_no_block' => $fromInboundGroups['wait_time_option_no_block'],
                    'wait_time_option_prompt_seconds' => $fromInboundGroups['wait_time_option_prompt_seconds'],
                    'timer_action_destination' => $fromInboundGroups['timer_action_destination'],
                    'calculate_estimated_hold_seconds' => $fromInboundGroups['calculate_estimated_hold_seconds'],
                    'add_lead_url' => $fromInboundGroups['add_lead_url'],
                    'eht_minimum_prompt_filename' => $fromInboundGroups['eht_minimum_prompt_filename'],
                    'eht_minimum_prompt_no_block' => $fromInboundGroups['eht_minimum_prompt_no_block'],
                    'eht_minimum_prompt_seconds' => $fromInboundGroups['eht_minimum_prompt_seconds'],
                    'on_hook_ring_time' => $fromInboundGroups['on_hook_ring_time'],
                    'na_call_url' => $fromInboundGroups['na_call_url'],
                    'on_hook_cid' => $fromInboundGroups['on_hook_cid'],
                    'group_calldate' => $fromInboundGroups['group_calldate'],
                    'action_xfer_cid' => $fromInboundGroups['action_xfer_cid'],
                    'drop_callmenu' => $fromInboundGroups['drop_callmenu'],
                    'after_hours_callmenu' => $fromInboundGroups['after_hours_callmenu'],
                    'user_group' => $fromInboundGroups['user_group'],
                    'max_calls_method' => $fromInboundGroups['max_calls_method'],
                    'max_calls_count' => $fromInboundGroups['max_calls_count'],
                    'max_calls_action' => $fromInboundGroups['max_calls_action'],
                    'dial_ingroup_cid' => $fromInboundGroups['dial_ingroup_cid'],
                    'group_handling' => $fromInboundGroups['group_handling'],
                    'options_title' => $fromInboundGroups['options_title']
                );


                $vicidial_inbound_clone = VicidialInboundGroup::create($savedata);

                $users = VicidialUser::users();

                $agents = VicidialInboundGroupAgent::agentsByGroupId($group_id);

                if (count($agents) == 0) {

                    if (empty($users)) {
                        throw new Exception('Something wents wrong!', 401);
                    }
                    $agent_data = [];
                    $key = 0;
                    foreach ($users as $user) {
                        $is_not_exists = (VicidialInboundGroupAgent::isUserExists($user->user, $group_id) == 0) ? true : false;


                        if ($is_not_exists) {

                            $agent_data[$key]["user"] = $user->user;
                            $agent_data[$key]["group_id"] = $group_id;
                            $agent_data[$key]["group_rank"] = 0;
                            $agent_data[$key]["group_weight"] = 0;
                            $agent_data[$key]["calls_today"] = 0;
                            $agent_data[$key]["group_web_vars"] = "";
                            $agent_data[$key]["group_grade"] = 1;
                            $agent_data[$key]["group_type"] = "C";
                            $key++;
                        }
                    }
                }
                if (!empty($agent_data)) {
                    VicidialInboundGroupAgent::insert($agent_data);
                    $agents = VicidialInboundGroupAgent::agentsByGroupId($group_id);
                }
                foreach ($agents as $agent) {
                    $check_value = explode(" ", $agent->closer_campaigns);


                    if (in_array($group_id, $check_value)) {
                        $agent->status = true;
                    } else {
                        $agent->status = false;
                    }
                }


                return response()->json(['status' => 200, 'data' => $agents, 'msg' => "Success"], 200);
            } else {
                throw new Exception('This record is already present', 400);
            }
        } catch (Exception $ex) {
            $this->postLogs(config('errorcontants.mysql'), $ex);
            throw $ex;
        }
    }

    public function checkDuplicate(Request $request) {
        try {

            $group_id = $request['group_id'];
            $count = VicidialInboundGroup::find($group_id);

            if (!$count) { //not exists
                return json_encode(array("status" => 1));
            } else {
                return json_encode(array("status" => 0));
            }
        } catch (Exception $ex) {
            $this->postLogs(config('errorcontants.mysql'), $ex);
            throw $ex;
        }
    }

    public function getdidInGroup($group_id) {
        try {

            $list = VicidialInboundDid::where('group_id', $group_id)->where('did_route', 'IN_GROUP')->get(['did_id', 'did_pattern', 'did_description']);
            return response()->json(['status' => 200, 'data' => $list, 'msg' => "Success"], 200);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $ex);
            throw $ex;
        }
    }

    public function getCallInGroup($group_id) {
        try {

            $list = VicidialCallMenu::getData($group_id);

            return response()->json(['status' => 200, 'data' => $list, 'msg' => "Success"], 200);
        } catch (Exception $ex) {
            $this->postLogs(config('errorcontants.mysql'), $ex);
            throw $ex;
        }
    }

}
