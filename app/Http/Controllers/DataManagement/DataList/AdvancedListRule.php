<?php

namespace App\Http\Controllers\DataManagement\DataList;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Traits\Helper;
use App\Traits\ErrorLog;
use App\Traits\AccessControl;
use Exception;
use Validator;
use App\YtelAdvancedListRules;
use App\Http\Requests\AdvancedListRuleUpdateRequest;
use App\Http\Requests\AdvancedListRuleAddRequest;
use App\X5Log;

class AdvancedListRule extends Controller {

    use Helper,
        AccessControl,
        ErrorLog;

    /**
     * Advanced list rules
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function advancedListRule(Request $request) {
        try {

            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $limit = $request->limit ?: \Config::get('configs.pagination_limit');
            $search = $request->search ?: NULL;

            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_DATA_MANAGEMENT_ADVANCED_LIST_RULE, $access_permissions)) {
                throw new Exception('Cannot access advanced list rules, you might not have permission to do this.', 400);
            }

            $advance_list_rules = YtelAdvancedListRules::findAll($limit, $search);

            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $advance_list_rules]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.AdvancedListRuleController  '), $e);
            throw $e;
        }
    }

    /**
     * Show list rule
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function showListRule(Request $request) {
        try {

            Validator::make($request->all(), [
                'advanced_list_rule_id' => 'required|exists:dyna.YTEL_advanced_list_rules',
                    ], [
                'advanced_list_rule_id.required' => 'Advanced list rule id is required.',
                'advanced_list_rule_id.exists' => 'We cannot find this :input list rule',
            ])->validate();
            $advanced_list_rule_id = $request->advanced_list_rule_id;
            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_DATA_MANAGEMENT_ADVANCED_LIST_RULE, $access_permissions)) {
                throw new Exception('Cannot access advanced list rule, you might not have permission to do this.', 400);
            }

            $list_rule = YtelAdvancedListRules::where('advanced_list_rule_id', $advanced_list_rule_id)->first();

            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $list_rule]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.AdvancedListRuleController  '), $e);
            throw $e;
        }
    }

    /**
     * Add list rule
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function addListRule(AdvancedListRuleAddRequest $request) {
        try {

            $advanced_list_rule_id = $request->advanced_list_rule_id;
            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $current_company_id, $user);
            $access_permissions_temp = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE, $current_company_id, $user);
            $access_permissions = array_merge($access_permissions, $access_permissions_temp);
            if (!in_array(SYSTEM_COMPONENT_DATA_MANAGEMENT_ADVANCED_LIST_RULE, $access_permissions)) {
                throw new Exception('Cannot create advanced list rule, you might not have permission to do this.', 400);
            }

            $advanced_list_rule = new YtelAdvancedListRules();
            $advanced_list_rule->from_list_id = implode(',', $request->from_list_id);
            $advanced_list_rule->from_campaign_id = implode(',', $request->from_campaign_id);
            $advanced_list_rule->from_list_status = implode(',', $request->from_list_status);
            $advanced_list_rule->from_entry_datetime = \Carbon\Carbon::parse($request->from_entry_datetime)->format('Y-m-d H:i:s');
            $advanced_list_rule->from_entry_datetime_until = $request->from_entry_datetime_until;
            $advanced_list_rule->from_entry_datetime_condition = $request->from_entry_datetime_condition;
            $advanced_list_rule->from_last_local_call_time = \Carbon\Carbon::parse($request->from_last_local_call_time)->format('Y-m-d H:i:s');
            $advanced_list_rule->from_last_local_call_time_until = $request->from_last_local_call_time_until;
            $advanced_list_rule->from_days_since_entry_datetime = $request->from_days_since_entry_datetime;
            $advanced_list_rule->from_days_since_last_local_call_time = $request->from_days_since_last_local_call_time;
            $advanced_list_rule->from_last_local_call_time_condition = $request->from_last_local_call_time_condition;
            $advanced_list_rule->called_count = $request->called_count;
            $advanced_list_rule->from_called_count_condition = $request->from_called_count_condition;
            $advanced_list_rule->called_since_last_reset = $request->called_since_last_reset;
            $advanced_list_rule->to_list_id = $request->to_list_id;
            $advanced_list_rule->to_list_status = $request->to_list_status;
            $advanced_list_rule->reset_called_since_last_reset = $request->reset_called_since_last_reset;
            $advanced_list_rule->interval = $request->interval;
            $advanced_list_rule->active = $request->active;
            $advanced_list_rule->last_run = $request->last_run;
            $advanced_list_rule->last_update_count = $request->last_update_count;
            $advanced_list_rule->next_run = \Carbon\Carbon::parse($request->next_run)->format('Y-m-d H:i:s');
            $advanced_list_rule->entry_date = \Carbon\Carbon::now()->toDateTimeString();
            $advanced_list_rule->save();

            // X5 log
            $x5_log_data['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
            $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
            $x5_log_data['company_id'] = $user->company_id;
            $x5_log_data['user_ip'] = $this->clientIp();
            $x5_log_data['class'] = 'AdvancedListRule';
            $x5_log_data['method'] = __FUNCTION__;
            $x5_log_data['model'] = YtelAdvancedListRules::class;
            $x5_log_data['action_1'] = 'SAVE';
            X5Log::insert($x5_log_data);

            return response()->json(['status' => 200, 'msg' => 'Rule Created.', 'data' => $advanced_list_rule]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.AdvancedListRuleController  '), $e);
            throw $e;
        }
    }

    /**
     * Update list rule
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function updateListRule(AdvancedListRuleUpdateRequest $request) {
        try {


            $advanced_list_rule_id = $request->advanced_list_rule_id;
            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $current_company_id, $user);
            $access_permissions_temp = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE, $current_company_id, $user);
            $access_permissions = array_merge($access_permissions, $access_permissions_temp);
            if (!in_array(SYSTEM_COMPONENT_DATA_MANAGEMENT_ADVANCED_LIST_RULE, $access_permissions)) {
                throw new Exception('Cannot update advanced list rule, you might not have permission to do this.', 400);
            }

            $data_to_update['from_list_id'] = implode(',', $request->from_list_id);
            $data_to_update['from_campaign_id'] = implode(',', $request->from_campaign_id);
            $data_to_update['from_list_status'] = implode(',', $request->from_list_status);
            $data_to_update['from_entry_datetime'] = \Carbon\Carbon::parse($request->from_entry_datetime)->format('Y-m-d H:i:s');
            $data_to_update['from_entry_datetime_until'] = $request->from_entry_datetime_until;
            $data_to_update['from_entry_datetime_condition'] = $request->from_entry_datetime_condition;
            $data_to_update['from_last_local_call_time'] = \Carbon\Carbon::parse($request->from_last_local_call_time)->format('Y-m-d H:i:s');
            $data_to_update['from_last_local_call_time_until'] = $request->from_last_local_call_time_until;
            $data_to_update['from_days_since_entry_datetime'] = $request->from_days_since_entry_datetime;
            $data_to_update['from_days_since_last_local_call_time'] = $request->from_days_since_last_local_call_time;
            $data_to_update['from_last_local_call_time_condition'] = $request->from_last_local_call_time_condition;
            $data_to_update['called_count'] = $request->called_count;
            $data_to_update['from_called_count_condition'] = $request->from_called_count_condition;
            $data_to_update['called_since_last_reset'] = $request->called_since_last_reset;
            $data_to_update['to_list_id'] = $request->to_list_id;
            $data_to_update['to_list_status'] = $request->to_list_status;
            $data_to_update['reset_called_since_last_reset'] = $request->reset_called_since_last_reset;
            $data_to_update['interval'] = $request->interval;
            $data_to_update['active'] = $request->active;
            $data_to_update['last_run'] = $request->last_run;
            $data_to_update['last_update_count'] = $request->last_update_count;
            $data_to_update['next_run'] = \Carbon\Carbon::parse($request->next_run)->format('Y-m-d H:i:s');
            $data_to_update['entry_date'] = \Carbon\Carbon::now()->toDateTimeString();

            YtelAdvancedListRules::where('advanced_list_rule_id', $advanced_list_rule_id)->update($data_to_update);

            // X5 log
            $x5_log_data['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
            $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
            $x5_log_data['company_id'] = $user->company_id;
            $x5_log_data['user_ip'] = $this->clientIp();
            $x5_log_data['class'] = 'AdvancedListRule';
            $x5_log_data['method'] = __FUNCTION__;
            $x5_log_data['model'] = YtelAdvancedListRules::class;
            $x5_log_data['action_1'] = 'SAVE';
            X5Log::insert($x5_log_data);

            return response()->json(['status' => 200, 'msg' => 'Rule Saved.', 'data' => $data_to_update]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.AdvancedListRuleController  '), $e);
            throw $e;
        }
    }

    /**
     * Delete list rule
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function deleteListRule(Request $request) {
        try {

            Validator::make($request->all(), [
                'advanced_list_rule_id' => 'required|exists:dyna.YTEL_advanced_list_rules',
                    ], [
                'advanced_list_rule_id.required' => 'Advanced list rule id is required.',
                'advanced_list_rule_id.exists' => 'We cannot find this :input list rule',
            ])->validate();
            $advanced_list_rule_id = $request->advanced_list_rule_id;
            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_DELETE, $current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_DATA_MANAGEMENT_ADVANCED_LIST_RULE, $access_permissions)) {
                throw new Exception('Cannot delete advanced list rule, you might not have permission to do this.', 400);
            }

            $list_rule = YtelAdvancedListRules::where('advanced_list_rule_id', $advanced_list_rule_id)->delete();
            if ($list_rule) {
                // X5 log
                $x5_log_data['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
                $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
                $x5_log_data['company_id'] = $user->company_id;
                $x5_log_data['user_ip'] = $this->clientIp();
                $x5_log_data['class'] = 'AdvancedListRule';
                $x5_log_data['method'] = __FUNCTION__;
                $x5_log_data['model'] = YtelAdvancedListRules::class;
                $x5_log_data['action_1'] = 'DELETE';
                X5Log::insert($x5_log_data);
            }

            return response()->json(['status' => 200, 'msg' => 'Record deleted successfully.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.AdvancedListRuleController  '), $e);
            throw $e;
        }
    }

}
