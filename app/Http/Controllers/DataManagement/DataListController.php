<?php

namespace App\Http\Controllers\DataManagement;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Traits\Helper;
use App\Traits\ErrorLog;
use App\Traits\AccessControl;
use Exception;
use Validator;
use App\VicidialLists;
use App\VicidialList;
use App\X5Contact;
use App\VicidialAdminLog;
use App\VicidialOverrideId;
use App\X5ContactAccess;
use Illuminate\Support\Facades\Schema;
use App\VicidialListsFields;
use App\X5Log;
use Illuminate\Support\Facades\DB;
use Rap2hpoutre\FastExcel\FastExcel;

class DataListController extends Controller {

    use Helper,
        AccessControl,
        ErrorLog;

    /**
     * Data list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function dataList(Request $request) {
        try {

            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $data['limit'] = $request->limit ?: \Config::get('configs.pagination_limit');
            $data['search'] = $request->search ?: NULL;

            $response['allow_delete'] = in_array(SYSTEM_COMPONENT_DATA_MANAGEMENT_DATA_LIST, $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_DELETE, $current_company_id, $user));
            $response['max_list'] = X5Contact::select('max_list')->where('x5_contact_id', $user->x5_contact_id)->first();
            $response['data_list'] = VicidialLists::dataList($data);

            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $response]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.DataListController'), $e);
            throw $e;
        }
    }

    /**
     * Add new list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function addNewList(Request $request) {
        try {

            Validator::make($request->all(), [
                'list_id' => 'required|between:3,8|gt:100|unique:dyna.vicidial_lists',
                'list_name' => 'required|between:2,20',
                'campaign_id' => 'required',
                'active' => 'required|in:Y,N',
                    ], [
                'list_id.required' => 'List ID is required.',
                'list_id.between' => 'List ID must be between 3 and 8 characters in length.',
                'list_id.gt' => 'Number should be greater than 100.',
                'list_id.unique' => 'Duplicate List ID.',
                'list_name.required' => 'List Name is required.',
                'list_name.between' => 'List Name must be at least 2-20 characters in length.',
            ])->validate();
            $user = $request->user();
            $active = strtoupper($request->active);
            $active = strtoupper($request->active);
            $list_id = $request->list_id;
            $current_company_id = $request->current_company_id;

            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_CREATE, $current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_DATA_MANAGEMENT_DATA_LIST, $access_permissions)) {
                throw new Exception('Cannot create list, you might not have permission to do this.', 400);
            }

            do {

                $override_id = VicidialOverrideId::where('id_table', 'vicidial_lists')->where('active', 1)->first();
                if ($override_id != null && $override_id->active != 0) {
                    $override_list_id = $override_id->value++;
                    VicidialOverrideId::where('id_table', 'vicidial_lists')->update(['value' => $override_id->value]);
                    $list_count = VicidialLists::where('list_id', $override_list_id)->count();
                    if ($list_count)
                        continue;
                    $list_id = $override_list_id;
                    break;
                }
                break;
            } while (TRUE);

            $list_obj = new VicidialLists();
            $list_obj->list_id = $list_id;
            $list_obj->list_name = $request->list_name;
            $list_obj->list_description = $request->list_description;
            $list_obj->campaign_id = $request->campaign_id;
            $list_obj->active = $active;
            $list_obj->save();

            $admin_log_data['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log_data['user'] = $user->x5_contact_id;
            $admin_log_data['ip_address'] = $this->clientIp();
            $admin_log_data['event_section'] = 'LISTS';
            $admin_log_data['event_type'] = 'ADD';
            $admin_log_data['record_id'] = $list_obj->list_id;
            $admin_log_data['event_code'] = 'ADMIN ADD LIST';
            $admin_log_data['event_sql'] = 'INSERT INTO vicidial_lists SET list_id=' . $list_obj->list_id . ',list_name=' . $list_obj->list_name . ',list_description=' . $list_obj->list_description . ',campaign_id=' . $list_obj->campaign_id . 'active = ' . $active;
            $admin_log_data['event_notes'] = '';
            $admin_log_data['user_group'] = '';
            VicidialAdminLog::insert($admin_log_data);

            return response()->json(['status' => 200, 'msg' => 'Record successfully added.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.DataListController'), $e);
            throw $e;
        }
    }

    /**
     * Clone list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function cloneList(Request $request) {
        try {

            Validator::make($request->all(), [
                'list_id' => 'required|between:3,8|gt:100|unique:dyna.vicidial_lists',
                'from_list_id' => 'required',
                    ], [
                'list_id.required' => 'List ID is required.',
                'list_id.between' => 'List ID must be between 3 and 8 characters in length.',
                'list_id.gt' => 'Number should be greater than 100.',
                'list_id.unique' => 'List ID :input is taken, please choose another one..',
            ])->validate();
            $user = $request->user();
            $from_list_id = $request->from_list_id;
            $list_id = $request->list_id;
            $current_company_id = $request->current_company_id;
            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_CREATE, $current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_DATA_MANAGEMENT_DATA_LIST, $access_permissions)) {
                throw new Exception('Cannot create list, you might not have permission to do this.', 400);
            }

            $list = VicidialLists::select('list_id', 'list_name', 'campaign_id', 'active', 'list_description', 'list_changedate', 'list_lastcalldate', 'reset_time', 'agent_script_override', 'campaign_cid_override', 'am_message_exten_override', 'drop_inbound_group_override', 'xferconf_a_number', 'xferconf_b_number', 'xferconf_c_number', 'xferconf_d_number', 'xferconf_e_number', 'web_form_address', 'web_form_address_two', 'time_zone_setting', 'inventory_report', 'expiration_date')
                    ->where('list_id', $from_list_id)
                    ->first();
            if ($list === null) {
                throw new Exception('We can not locate your list, please check your input.', 400);
            }

            $new_list = $list->replicate();
            $new_list->list_id = $list_id;
            $new_list->save();

            // Add full permission to user after create
            $x5_contact_access['model'] = SYSTEM_COMPONENT_DATA_MANAGEMENT_DATA_LIST;
            $x5_contact_access['foreign_key'] = $user->x5_contact_id;
            $x5_contact_access['type'] = ACCESS_TYPE_SYSTEM_COMPONENT;
            $x5_contact_access['link_id'] = $list_id;
            $x5_contact_access['_create'] = 0;
            $x5_contact_access['_read'] = 1;
            $x5_contact_access['_update'] = 1;
            $x5_contact_access['_delete'] = 1;
            X5ContactAccess::insert($x5_contact_access);

            $check_from_table = Schema::connection('dyna')->hasTable('custom_' . $from_list_id);
            if (!$check_from_table) {
                Schema::connection('dyna')->create('custom_' . $from_list_id, function($table) {
                    $table->increments('lead_id');
                });
                DB::connection('dyna')->statement('Alter TABLE custom_' . $from_list_id . ' add unique index ix_lead_id (`lead_id`)');
            }

            $check_new_table = Schema::connection('dyna')->hasTable('custom_' . $list_id);
            if (!$check_new_table) {
                DB::connection('dyna')->statement('CREATE TABLE custom_' . $list_id . ' AS SELECT * FROM custom_' . $from_list_id . ' LIMIT 0');
            }

            VicidialListsFields::where('list_id', $list_id)->delete();
            $list_fields = VicidialListsFields::where('list_id', $from_list_id)->get();
            if ($list_fields->count() > 0) {
                $new_list_fields = [];
                foreach ($list_fields as $key => $list_field) {
                    $new_list_fields[$key]['list_id'] = $list_id;
                    $new_list_fields[$key]['field_label'] = $list_field->field_label;
                    $new_list_fields[$key]['field_name'] = $list_field->field_name;
                    $new_list_fields[$key]['field_description'] = $list_field->field_description;
                    $new_list_fields[$key]['field_rank'] = $list_field->field_rank;
                    $new_list_fields[$key]['field_help'] = $list_field->field_help;
                    $new_list_fields[$key]['field_type'] = $list_field->field_type;
                    $new_list_fields[$key]['field_options'] = $list_field->field_options;
                    $new_list_fields[$key]['field_size'] = $list_field->field_size;
                    $new_list_fields[$key]['field_max'] = $list_field->field_max;
                    $new_list_fields[$key]['field_default'] = $list_field->field_default;
                    $new_list_fields[$key]['field_cost'] = $list_field->field_cost;
                    $new_list_fields[$key]['field_required'] = $list_field->field_required;
                    $new_list_fields[$key]['name_position'] = $list_field->name_position;
                    $new_list_fields[$key]['multi_position'] = $list_field->multi_position;
                    $new_list_fields[$key]['field_order'] = $list_field->field_order;
                }
                VicidialListsFields::insert($new_list_fields);
            }

            $event_sql = 'INSERT INTO vicidial_lists SET list_id=' . $new_list->list_id . ',list_name=' . $new_list->list_name . ',campaign_id=' . $new_list->campaign_id . ',active=' . $new_list->active . ',list_description=' . $new_list->list_description . ',list_changedate=' . \Carbon\Carbon::now()->toDateTimeString() . ',reset_time=' . $new_list->reset_time . ',agent_script_override=' . $new_list->agent_script_override . ',campaign_cid_override=' . $new_list->campaign_cid_override . ',am_message_exten_override=' . $new_list->am_message_exten_override . ',drop_inbound_group_override=' . $new_list->drop_inbound_group_override . ',xferconf_a_number=' . $new_list->xferconf_a_number . ',xferconf_b_number=' . $new_list->xferconf_b_number . ',xferconf_c_number=' . $new_list->xferconf_c_number . ',xferconf_d_number=' . $new_list->xferconf_d_number . ',xferconf_e_number=' . $new_list->xferconf_e_number . ',web_form_address=' . $new_list->web_form_address . ',web_form_address_two=' . $new_list->web_form_address_two . ',time_zone_setting=' . $new_list->time_zone_setting . ',inventory_report=' . $new_list->inventory_report . ',expiration_date=' . $new_list->expiration_date;

            // Admin log
            $admin_log_data['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log_data['user'] = $user->x5_contact_id;
            $admin_log_data['ip_address'] = $this->clientIp();
            $admin_log_data['event_section'] = 'LISTS';
            $admin_log_data['event_type'] = 'COPY';
            $admin_log_data['record_id'] = $list_id;
            $admin_log_data['event_code'] = 'ADMIN COPY LIST';
            $admin_log_data['event_sql'] = $event_sql;
            $admin_log_data['event_notes'] = '';
            $admin_log_data['user_group'] = '';
            VicidialAdminLog::insert($admin_log_data);

            // X5 log
            $x5_log_data['change_datetime'] = $admin_log_data['event_date'];
            $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
            $x5_log_data['company_id'] = $user->company_id;
            $x5_log_data['user_ip'] = $this->clientIp();
            $x5_log_data['class'] = "DataListController";
            $x5_log_data['method'] = __FUNCTION__;
            $x5_log_data['model'] = VicidialLists::class;
            $x5_log_data['action_1'] = "CLONE";
            X5Log::insert($x5_log_data);

            return response()->json(['status' => 200, 'msg' => 'Record successfully added.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.DataListController'), $e);
            throw $e;
        }
    }

    /**
     * Edit list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function showList(Request $request) {
        try {

            Validator::make($request->all(), [
                'list_id' => 'required|exists:dyna.vicidial_lists',
                    ], [
                'list_id.required' => 'List ID is required.',
                'list_id.exists' => 'We cannot find this :input List',
            ])->validate();
            $user = $request->user();
            $list_id = $request->list_id;
            $current_company_id = $request->current_company_id;
            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_DATA_MANAGEMENT_DATA_LIST, $access_permissions)) {
                throw new Exception('Cannot access list, you might not have permission to do this.', 400);
            }

            $list = VicidialLists::where('list_id', $list_id)->first();

            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $list]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.DataListController   '), $e);
            throw $e;
        }
    }

    /**
     * Update list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function updateList(Request $request) {
        try {

            Validator::make($request->all(), [
                'list_id' => 'required|exists:dyna.vicidial_lists',
                'list_name' => 'required|between:2,20',
                'campaign_id' => 'required',
                'active' => 'required|in:Y,N',
                    ], [
                'list_id.required' => 'List ID is required.',
                'list_id.exists' => 'We cannot find this :input List',
                'list_name.required' => 'List Name is required.',
                'list_name.between' => 'List Name must be at least 2-20 characters in length.',
            ])->validate();
            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $list_id = $request->list_id;
            $request->active = strtoupper($request->active);

            $data_list_ids = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_LIST, ACCESS_UPDATE, $current_company_id, $user);
            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE, $current_company_id, $user);

            if ((!in_array($list_id, $data_list_ids)) || (!in_array(SYSTEM_COMPONENT_DATA_MANAGEMENT_DATA_LIST, $access_permissions))) {
                throw new Exception('Cannot modify list, you might not have permission to do this.', 400);
            }

            $list_data = [
                'list_id' => $list_id,
                'active' => $request->active,
                'list_name' => $request->list_name,
                'campaign_id' => $request->campaign_id,
                'list_description' => $request->list_description,
                'list_changedate' => $request->list_changedate,
                'list_lastcalldate' => $request->list_lastcalldate,
                'reset_time' => $request->reset_time,
                'agent_script_override' => $request->agent_script_override,
                'campaign_cid_override' => $request->campaign_cid_override,
                'am_message_exten_override' => $request->am_message_exten_override,
                'drop_inbound_group_override' => $request->drop_inbound_group_override,
                'xferconf_a_number' => $request->xferconf_a_number,
                'xferconf_b_number' => $request->xferconf_b_number,
                'xferconf_c_number' => $request->xferconf_c_number,
                'xferconf_d_number' => $request->xferconf_d_number,
                'xferconf_e_number' => $request->xferconf_e_number,
                'web_form_address' => $request->web_form_address,
                'web_form_address_two' => $request->web_form_address_two,
                'time_zone_setting' => $request->time_zone_setting,
                'inventory_report' => $request->inventory_report,
                'expiration_date' => $request->expiration_date,
                'list_changedate' => \Carbon\Carbon::now()->toDateTimeString(),
            ];

            VicidialLists::where('list_id', $list_id)->update($list_data);
            VicidialAdminLog::insert([
                'event_date' => \Carbon\Carbon::now()->toDateTimeString(),
                'user' => $user->x5_contact_id,
                'ip_address' => $this->clientIp(),
                'user' => $user->x5_contact_id,
                'event_section' => 'LISTS',
                'event_type' => 'UPDATE',
                'record_id' => $list_id,
                'event_code' => 'ADMIN UPDATE LIST',
                'event_sql' => 'UPDATE vicidial_lists SET ' . implode(',', array_keys($list_data)) . ' DATA (' . implode(',', array_values($list_data)) . ')',
                'event_notes' => '',
                'user_group' => '',
            ]);

            return response()->json(['status' => 200, 'msg' => 'Record successfully modified.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.DataListController   '), $e);
            throw $e;
        }
    }

    /**
     * Delete list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function deleteList(Request $request) {
        try {

            Validator::make($request->all(), [
                'list_id' => 'required|exists:dyna.vicidial_lists',
                    ], [
                'list_id.required' => 'List ID is required.',
                'list_id.exists' => 'We cannot find this :input List',
            ])->validate();
            $user = $request->user();
            $list_id = $request->list_id;
            $current_company_id = $request->current_company_id;
            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_DELETE, $current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_DATA_MANAGEMENT_DATA_LIST, $access_permissions)) {
                throw new Exception('Cannot delete list, you might not have permission to do this.', 400);
            }

            $list_id = $this->getAcceptValue(ACCESS_TYPE_LIST, $list_id, $user, ACCESS_DELETE);

            VicidialList::where('list_id', $list_id)->delete();
            VicidialLists::where('list_id', $list_id)->delete();

            VicidialAdminLog::insert([
                'event_date' => \Carbon\Carbon::now()->toDateTimeString(),
                'user' => $user->x5_contact_id,
                'ip_address' => $this->clientIp(),
                'user' => $user->x5_contact_id,
                'event_section' => 'LISTS',
                'event_type' => 'DELETE',
                'record_id' => $list_id,
                'event_code' => 'ADMIN DELETE LIST',
                'event_sql' => 'DELETE from vicidial_lists where list_id=' . $list_id,
                'event_notes' => '',
                'user_group' => '',
            ]);

            return response()->json(['status' => 200, 'msg' => 'Record successfully deleted.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.DataListController   '), $e);
            throw $e;
        }
    }

    /**
     * Active/In-active list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function activeInactiveList(Request $request) {
        try {

            Validator::make($request->all(), [
                'list_id ' => 'required',
                'active' => 'required|in:Y, N',
            ])->validate();
            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $list_id = $request->list_id;
            $active = strtoupper($request->active);
            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE, $current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_DATA_MANAGEMENT_DATA_LIST, $access_permissions)) {
                throw new Exception('Cannot update list, you might not have permission to do this.', 400);
            }

            $list_id = $this->getAcceptValue(ACCESS_TYPE_LIST, $list_id, $user, ACCESS_UPDATE, RETURN_ALL_SELECTOR, ALLOW_NULL);

            VicidialLists::where('list_id', $list_id)->update(['active' => $active]);

            $admin_log_data['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log_data['user'] = $user->x5_contact_id;
            $admin_log_data['ip_address'] = $this->clientIp();
            $admin_log_data['event_section'] = 'LISTS';
            $admin_log_data['event_type'] = 'MODIFY';
            $admin_log_data['record_id'] = $list_id;
            $admin_log_data['event_code'] = 'ADMIN MODIFY LIST';
            $admin_log_data['event_sql'] = 'UPDATE vicidial_list SET active = ' . $active . 'where list_id = ' . $list_id;
            $admin_log_data['event_notes'] = '';
            $admin_log_data['user_group'] = '';
            VicidialAdminLog::insert($admin_log_data);

            return response()->json(['status' => 200, 'msg' => ($active === 'Y') ? 'Data List Activated Successfully!' : 'Data List Deactivated Successfully!']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.DataListController   '), $e);
            throw $e;
        }
    }

    /**
     * Download list CSV file
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function downloadListCSV(Request $request) {
        try {

            Validator::make($request->all(), [
                'list_id' => 'required',
            ])->validate();
            $user = $request->user();
            $list_id = $request->list_id;
            $current_company_id = $request->current_company_id;
            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_DATA_MANAGEMENT_DATA_LIST, $access_permissions)) {
                throw new Exception('Cannot access list, you might not have permission to do this.', 400);
            }

            $start_and_end_date = [];
            $sqldate = '';
            $valid_custom_table = false;
            $custom_header_arr = [];
            if (isset($request->start_date)) {
                $from_date = date('Y-m-d', $request->start_date);
                $to_date = date('Y-m-d', $request->end_date);
                $time_begin = '00:00:00';
                $time_end = '23:59:59';
                //Adding date and time
                $from_date = "$from_date $time_begin";
                $to_date = "$to_date $time_end";
                $from_date = date('Y-m-d H:i:s', strtotime(str_replace('/', '-', $from_date)));
                $to_date = date('Y-m-d H:i:s', strtotime(str_replace('/', '-', $to_date)));
                $start_and_end_date = [$from_date, $to_date];
            }


            $custom_fields_enabled = \App\SystemSetting::pluck('custom_fields_enabled')[0];
            if ($custom_fields_enabled > 0) {
                $custom_tables = \App\VicidialList::select('entry_list_id')->distinct();
                if (!empty($start_and_end_date)) {
                    $custom_tables = $custom_tables->whereBetween('modify_date', $start_and_end_date);
                }
                $custom_tables = $custom_tables->where('list_id', $list_id)->get();
                foreach ($custom_tables as $custom_table) {
                    $entry_list_id = $custom_table->entry_list_id;
                    if ($entry_list_id == 0) {
                        continue;
                    }
                    $custom_describe = DB::connection('dyna')->select('show columns from custom_' . $entry_list_id);
                    if ($custom_describe) {
                        $cust_{$entry_list_id} = array_column($custom_describe, 'Field');
                        foreach ($cust_{$entry_list_id} as $data) {
                            $custom_{$entry_list_id}[$data] = "";
                        }
                        $custom_header_arr['custom_' . $entry_list_id] = $custom_{$entry_list_id};
                        $valid_custom_table = true;
                    }
                }
            }

            $count_download_time = 0;
            $total_count = 0;
            $start_count = 0;
            $csv_data = [];
            do {
                $vicidial_lists = [];
                $limit = 100000;
                $offset = $count_download_time++ * $limit;
                $start_count = $offset ?: $limit;
                if ($valid_custom_table) {
                    $vicidial_lists = \App\VicidialList::where('list_id', $list_id);
                    if (!empty($start_and_end_date)) {
                        $vicidial_lists = $vicidial_lists->whereBetween('modify_date', $start_and_end_date);
                    }
                    if ($total_count === 0) {
                        $total_count = $vicidial_lists->count();
                    }
                    $vicidial_lists = $vicidial_lists->limit($limit)->offset($offset)->get()->toArray();
                    if ($vicidial_lists) {
                        foreach ($vicidial_lists as $vicidial_list) {
                            $new_custom_header_arr = $custom_header_arr;
                            $entry_list_idA = $vicidial_list['entry_list_id'];
                            $custom_arr = [];
                            if ($entry_list_idA != 0) {
                                $new_custom_header_arr['custom_' . $entry_list_idA] = DB::connection('dyna')->table('custom_' . $entry_list_idA)->where('lead_id', $vicidial_list['lead_id'])->first();
                            }
                            foreach ($new_custom_header_arr as $key => $cust_tble) {
                                $custom_arr = $custom_arr + (array) $cust_tble;
                            }
                            $vicidial_list = array_merge($vicidial_list, (array) $custom_arr);
                        }
                        $csv_data = array_merge($csv_data, $vicidial_lists);
                    }
                } else {
                    $vicidial_lists = \App\VicidialList::where('list_id', $list_id);
                    if (!empty($start_and_end_date)) {
                        $vicidial_lists = $vicidial_lists->whereBetween('modify_date', $start_and_end_date);
                    }
                    if ($total_count === 0) {
                        $total_count = $vicidial_lists->count();
                    }
                    $vicidial_lists = $vicidial_lists->limit($limit)->offset($offset)->get()->toArray();
                    $csv_data = array_merge($csv_data, $vicidial_lists);
                }
                if (empty($vicidial_lists)) {
                    break;
                }
            } while ($start_count < $total_count);
            $public_name = "export_" . date("Y-m-d") . ".csv";

            return (new FastExcel($csv_data))->download($public_name);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.DataListController  '), $e);
            throw $e;
        }
    }

    /**
     * Reset list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function resetDataList(Request $request) {
        try {

            Validator::make($request->all(), [
                'list_id' => 'required',
            ])->validate();

            $list_id = $request->list_id;
            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE, $current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_DATA_MANAGEMENT_DATA_LIST, $access_permissions)) {
                throw new Exception('Cannot access list, you might not have permission to do this.', 400);
            }

            $list_id = $this->getAcceptValue(ACCESS_TYPE_LIST, $list_id, $user, ACCESS_UPDATE);

            $current_date = \Carbon\Carbon::now()->toDateTimeString();

            VicidialList::where('list_id', $list_id)->update(['called_since_last_reset' => 'N']);
            VicidialLists::where('list_id', $list_id)->update(['list_changedate' => $current_date]);

            $admin_log_data['event_date'] = $current_date;
            $admin_log_data['user'] = $user->x5_contact_id;
            $admin_log_data['ip_address'] = $this->clientIp();
            $admin_log_data['event_section'] = 'LISTS';
            $admin_log_data['event_type'] = 'RESET';
            $admin_log_data['record_id'] = $list_id;
            $admin_log_data['event_code'] = 'ADMIN RESET LIST';
            $admin_log_data['event_sql'] = 'UPDATE vicidial_lists set list_changedate = ' . $current_date . ' where list_id=' . $list_id;
            $admin_log_data['event_notes'] = '';
            $admin_log_data['user_group'] = '';
            VicidialAdminLog::insert($admin_log_data);

            return response()->json(['status' => 200, 'msg' => 'Lead-Called-Status for List ' . $list_id . ' has been reset.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.DataListController  '), $e);
            throw $e;
        }
    }

    /**
     * Data list reports
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function dataListReport(Request $request) {
        try {

            $result_array = [];
            Validator::make($request->all(), [
                'list_id' => 'required',
            ])->validate();

            $list_id = $request->list_id;
            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $access_permissions = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE, $current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_DATA_MANAGEMENT_DATA_LIST, $access_permissions)) {
                throw new Exception('Cannot access list, you might not have permission to do this.', 400);
            }

            $list_id = $this->getAcceptValue(ACCESS_TYPE_LIST, $list_id, $user, ACCESS_READ);

            $start_and_end_date = [];
            if (isset($request->start_date) && isset($request->end_date)) {
                $from_date = date('Y-m-d', strtotime($request->start_date));
                $to_date = date('Y-m-d', strtotime($request->end_date));
                $time_begin = '00:00:00';
                $time_end = '23:59:59';
                //Adding date and time
                $from_date = "$from_date $time_begin";
                $to_date = "$to_date $time_end";
                $from_date = date('Y-m-d H:i:s', strtotime(str_replace('/', '-', $from_date)));
                $to_date = date('Y-m-d H:i:s', strtotime(str_replace('/', '-', $to_date)));
                $start_and_end_date = [$from_date, $to_date];
            }

            $expanded_list_stats = 0;
            $system_setting = \App\SystemSetting::select('expanded_list_stats')->first();
            if ($system_setting != null) {
                $expanded_list_stats = $system_setting->expanded_list_stats;
            }

            if ($expanded_list_stats > 0) {
                $campaign_id = VicidialLists::where('list_id', $list_id)->pluck('campaign_id')->first();
                $campaign = \App\VicidialCampaign::select('dial_statuses', 'local_call_time', 'lead_filter_id', 'drop_lockout_time', 'call_count_limit')->where('campaign_id', $campaign_id)->first();
                $dial_statuses = $campaign->dial_statuses;
            }

            $vicidial_statuses = \App\VicidialStatuses::select('status', 'status_name', 'completed');
            $vicidial_campaign_statuses = \App\VicidialCampaignStatuses::select('status', 'status_name', 'completed');
            $statuses = $vicidial_campaign_statuses->union($vicidial_statuses)->where('campaign_id', $campaign_id)->orderBy('status')->get();
            $statuses_list = $statuses->pluck('status_name', 'status');

            $vicidiallist = VicidialList::select('status', 'called_since_last_reset')->selectRaw('count(*) as total')->where('list_id', $list_id);
            if (!empty($start_and_end_date)) {
                $vicidiallist = $vicidiallist->whereBetween('modify_date', $start_and_end_date);
            }
            $vicidiallist = $vicidiallist->groupBy('status', 'called_since_last_reset')
                    ->orderBy('status')->orderBy('called_since_last_reset')
                    ->get();
            $vicidial_lists = $vicidiallist->map(function ($item) {
                return [$item['status'], $item['called_since_last_reset'], $item['total']];
            });

            $lead_list['count'] = 0;
            $lead_list['Y_count'] = 0;
            $lead_list['N_count'] = 0;

            $complete_total = 0;
            $dialable_total = 0;
            foreach ($vicidial_lists as $key => $vicidial_list) {
                $lead_list['count'] = ($lead_list['count'] + $vicidial_lists[$key][2]);
                if ($vicidial_lists[$key][1] == 'N') {
                    $since_reset = 'N';
                    $since_reset_x = 'Y';
                } else {
                    $since_reset = 'Y';
                    $since_reset_x = 'N';
                }
                $no_count = isset($lead_list[$since_reset][$vicidial_lists[$key][0]]) ? $lead_list[$since_reset][$vicidial_lists[$key][0]] : 0;
                $lead_list[$since_reset][$vicidial_lists[$key][0]] = ($no_count + $vicidial_lists[$key][2]);
                $lead_list[$since_reset . '_count'] = ($lead_list[$since_reset . '_count'] + $vicidial_lists[$key][2]);
                #If opposite side is not set, it may not in the future so give it a value of zero
                if (!isset($lead_list[$since_reset_x][$vicidial_lists[$key][0]])) {
                    $lead_list[$since_reset_x][$vicidial_lists[$key][0]] = 0;
                }
            }

            $statuses_array = [];
            $dialable_leads = VicidialList::join('vicidial_lists', 'vicidial_lists.list_id', 'vicidial_list.list_id')
                    ->join('vicidial_campaigns', 'vicidial_campaigns.campaign_id', 'vicidial_lists.campaign_id')
                    ->selectRaw('vicidial_list.status, COUNT(vicidial_list.lead_id) total_leads_with_status');
            if (!empty($start_and_end_date)) {
                $dialable_leads = $dialable_leads->whereBetween('modify_date', $start_and_end_date);
            }
            $dialable_leads = $dialable_leads->where('called_since_last_reset', 'N')
                    ->whereRaw('vicidial_list.list_id = ' . $list_id)
                    ->whereRaw('vicidial_campaigns.dial_statuses LIKE concat("% ", vicidial_list.status, " %")')
                    ->whereRaw('(vicidial_list.called_count < vicidial_campaigns.call_count_limit OR vicidial_campaigns.call_count_limit = 0)')
                    ->orderBy('vicidial_list.status')
                    ->get();
            $status_dial = $dialable_leads->pluck('total_leads_with_status', 'status')->toArray();
            $dial_status = $dialable_leads->groupBy('status')->toArray();

            $dialable_leads_result = VicidialList::join('vicidial_lists', 'vicidial_lists.list_id', 'vicidial_list.list_id')
                    ->join('vicidial_campaigns', 'vicidial_campaigns.campaign_id', 'vicidial_lists.campaign_id')
                    ->selectRaw('vicidial_list.status, COUNT(vicidial_list.lead_id) total_leads_with_status');
            if (!empty($start_and_end_date)) {
                $dialable_leads_result = $dialable_leads_result->whereBetween('modify_date', $start_and_end_date);
            }
            $dialable_leads_result = $dialable_leads_result->where('called_since_last_reset', 'N')
                    ->whereRaw('vicidial_list.list_id = ' . $list_id)
                    ->whereRaw('vicidial_campaigns.dial_statuses LIKE concat("% ", vicidial_list.status, " %")')
                    ->whereRaw('(vicidial_list.called_count >= vicidial_campaigns.call_count_limit AND vicidial_campaigns.call_count_limit <> 0)')
                    ->orderBy('vicidial_list.status')
                    ->get();
            $total_leads_with_status = $dialable_leads_result->pluck('total_leads_with_status', 'status')->toArray();
            $status_array = $dialable_leads->groupBy('status')->toArray();
            $total_leads_count = 0;
            $call_count_total = 0;
            if ($lead_list['count'] > 0) {
                foreach ($lead_list[$since_reset] as $key => $value) {
                    $total_leads = VicidialList::where('list_id', $list_id)->where('status', $key);
                    if (!empty($start_and_end_date)) {
                        $total_leads = $total_leads->whereBetween('modify_date', $start_and_end_date);
                    }
                    $total_leads = $total_leads->count();
                    $total_leads_count += $total_leads;
                    if ($expanded_list_stats > 0) {
                        $single_status = 1;
                        $dial_statuses = " $key -";
                        $camp_lists = $list_id;
                        $dialable_count = 0;
                        if (in_array($key, $dial_status)) {
                            $dialable_count = $status_dial[$key];
                        }
                        $dialable_total += $dialable_count;
                        $total_call_count = 0;
                        if (in_array($key, $status_array)) {
                            $total_call_count = $total_leads_with_status[$key];
                        }
                        $call_count_total += $total_call_count;
                        $single_array = ['status' => $key, 'status_name' => $statuses_list[$key], 'total_leads' => $total_leads, 'dialable_count' => $dialable_count, 'total_call_count' => $total_call_count];
                        array_push($statuses_array, $single_array);
                    } else {
                        $single_array = ['status' => $key, 'status_name' => $lead_list['Y'][$key], 'total_leads' => $total_leads];
                        array_push($statuses_array, $single_array);
                    }
                }
            }
            $status_last_call_count = $this->statusLastCallCount($list_id);
            foreach ($statuses_array as &$statuses_arr) {
                $call_reset = isset($status_last_call_count['call_reset'][$statuses_arr["status"]]) ? $status_last_call_count['call_reset'][$statuses_arr["status"]] : 0;
                $not_call_reset = isset($status_last_call_count['not_call_reset'][$statuses_arr["status"]]) ? $status_last_call_count['not_call_reset'][$statuses_arr["status"]] : 0;
                $statuses_arr['call_reset'] = $call_reset;
                $statuses_arr['not_call_reset'] = $not_call_reset;
            }
            $result_array['first_table']['table'] = $statuses_array;
            $total = [];
            if ($expanded_list_stats > 0) {
                if (($complete_total < 1) || ( $lead_list['count'] < 1)) {
                    $total_complete_pct = "0";
                } else {
                    $total_complete_pct = intval(($complete_total / $lead_list['count']) * 100);
                }
                $total = ['total' => $total_leads_count, 'disable' => $dialable_total, 'completed' => $call_count_total];
            } else {
                $total = ['total' => $total_leads_count];
            }
            $total['call_reset'] = $status_last_call_count['call_reset']['total'];
            $total['not_call_reset'] = $status_last_call_count['not_call_reset']['total'];
            $result_array['first_table']['total'] = $total;

            // first table end
            $gmt_offset_now_with_count = VicidialList::selectRaw('gmt_offset_now, count(lead_id) as count')->where('list_id', $list_id);
            if (!empty($start_and_end_date)) {
                $gmt_offset_now_with_count = $gmt_offset_now_with_count->whereBetween('modify_date', $start_and_end_date);
            }
            $gmt_offset_now_with_count = $gmt_offset_now_with_count->groupBy('gmt_offset_now')->orderBy('gmt_offset_now')->get();
            $gmt_count_array = $gmt_offset_now_with_count->pluck('count', 'gmt_offset_now');

            $res = VicidialList::join('vicidial_lists', 'vicidial_lists.list_id', 'vicidial_list.list_id')
                    ->join('vicidial_campaigns', 'vicidial_campaigns.campaign_id', 'vicidial_lists.campaign_id')
                    ->selectRaw('vicidial_list.gmt_offset_now, COUNT(vicidial_list.lead_id) as dialable_leads_in_timezone')
                    ->whereRaw('vicidial_list.list_id = ' . $list_id)
                    ->where('called_since_last_reset', 'N')
                    ->whereRaw('vicidial_campaigns.dial_statuses LIKE CONCAT("% ", vicidial_list.status, " %")')
                    ->whereRaw('(vicidial_list.called_count < vicidial_campaigns.call_count_limit OR vicidial_campaigns.call_count_limit = 0)')
                    ->groupBy('vicidial_list.gmt_offset_now')
                    ->get();

            $gmt_offset_now1 = $res->pluck('gmt_offset_now')->toArray();
            $gmt_dial_count_array = $res->pluck('dialable_leads_in_timezone', 'gmt_offset_now')->toArray();

            $gmt_array = [];
            $i = 0;
            $gmt_offset_total_count = 0;
            $gmt_offset_total_dial = 0;
            $plus = '+';
            foreach ($gmt_count_array as $key => $value) {
                $local_zone = 3600 * $key;
                $local_date = gmdate("D j M Y H:i", time() + $local_zone);
                $disp_time_zone = ($key >= 0) ? $plus . $key : $key;
                $gmt_array[$i]['gmt_offset_now'] = $disp_time_zone . ' (' . $local_date . ')';
                $gmt_array[$i]['gmt_offset_total'] = $value;
                $gmt_offset_total_count += $value;
                $gmt_offset_dial = isset($gmt_dial_count_array[$key]) ? $gmt_dial_count_array[$key] : 0;
                $gmt_array[$i]['gmt_offset_dial'] = $gmt_offset_dial;
                $gmt_offset_total_dial += $gmt_offset_dial;
                $i++;
            }

            $result_array['second_table']['table'] = $gmt_array;
            $result_array['second_table']['total']['gmt_offset_total_count'] = $gmt_offset_total_count;
            $result_array['second_table']['total']['gmt_offset_total_dial'] = $gmt_offset_total_dial;

            // second table end
            $leads_in_list = 0;
            $called_count = VicidialList::selectRaw('status, if(called_count >= 100, 100, called_count) as calledcount, count(*) as count')
                    ->where('list_id', $list_id);
            if (!empty($start_and_end_date)) {
                $called_count = $called_count->whereBetween('modify_date', $start_and_end_date);
            }
            $called_count = $called_count->groupBy('status')
                    ->groupBy(DB::raw('if(called_count >= 100, 100, called_count)'))
                    ->orderBy('status')
                    ->orderBy('called_count')
                    ->get();
            $result_called = $called_count->map(function ($item) {
                return [$item['status'], $item['calledcount'], $item['count']];
            });

            $o = 0;
            $status_index = 0;
            $first_row = 1;
            $all_called_first = 1000;
            $all_called_last = 0;
            $all_called_count = [];
            $leads_in_sts = [];
            $status_called_last = [];
            $count_statuses = [];
            $count_called = [];
            $count_count = [];
            $status = [];
            $result_called_count = count($result_called);
            while ($result_called_count > $o) {
                $rowx = $result_called[$o];
                $leads_in_list += $rowx[2];
                $count_statuses[$o] = $rowx[0];
                $count_called[$o] = $rowx[1];
                $count_count[$o] = $rowx[2];
                $all_called_count[$rowx[1]] = isset($all_called_count[$rowx[1]]) ? $all_called_count[$rowx[1]] : 0;
                $all_called_count[$rowx[1]] += $rowx[2];
                $status[$status_index] = isset($status[$status_index]) ? $status[$status_index] : $rowx[0];
                if ((strlen($status[$status_index]) < 1) || ( $status[$status_index] != "$rowx[0]")) {
                    $first_row = ($first_row) ?: 0;
                    $status_index++;
                    $status[$status_index] = "$rowx[0]";
                    $status_called_first[$status_index] = "$rowx[1]";
                    if ($status_called_first[$status_index] < $all_called_first) {
                        $all_called_first = $status_called_first[$status_index];
                    }
                }
                $leads_in_sts[$status_index] = isset($leads_in_sts[$status_index]) ? $leads_in_sts[$status_index] : 0;
                $leads_in_sts[$status_index] += $rowx[2];
                $status_called_last[$status_index] = "$rowx[1]";
                if ($status_called_last[$status_index] > $all_called_last) {
                    $all_called_last = $status_called_last[$status_index];
                }
                $o++;
            }

            $called_count = VicidialLists::select('vicidial_lists.list_id', 'list_name', 'campaign_id', 'active', 'list_description', 'list_changedate', 'list_lastcalldate', 'reset_time', 'agent_script_override', 'campaign_cid_override', 'am_message_exten_override', 'drop_inbound_group_override', 'xferconf_a_number', 'xferconf_b_number', 'xferconf_c_number', 'xferconf_d_number', 'xferconf_e_number', 'web_form_address', 'web_form_address_two', 'time_zone_setting', 'inventory_report', 'expiration_date')
                    ->leftJoin('vicidial_lists_custom', 'vicidial_lists.list_id', 'vicidial_lists_custom.list_id')
                    ->selectRaw('IFNULL(audit_comments, 0) as audit_comments, DATE_FORMAT(expiration_date, "%Y%m%d") as expiration_date_formated')
                    ->where('vicidial_lists.list_id', $list_id)
                    ->get();

            $campaign_id = $called_count->first()->campaign_id;
            $sts = 0;
            $statuses_called_to_print = count($status);
            while ($statuses_called_to_print > $sts) {
                $Pstatus = $status[$sts];
                $query_result_1 = \App\VicidialStatuses::orderBy('status')->pluck('status_name', 'status');
                $query_result_2 = \App\VicidialCampaignStatuses::where('campaign_id', $campaign_id)->orderBy('status')->pluck('status_name', 'status');
                $query_result_3 = $query_result_1->merge($query_result_2)->toArray();

                $value = ' ';
                if (array_key_exists($Pstatus, $query_result_3)) {
                    $value = $query_result_3["$Pstatus"];
                }
                $bgcolor = '#EAEAEA';
                if (preg_match('/1$|3$|5$|7$|9$/i', $sts)) {
                    $bgcolor = '#F9FAFB';
                }
                $result_array['third_table']['table'][$sts]['calor'] = $bgcolor;
                $result_array['third_table']['table'][$sts]['status'] = $Pstatus;
                $result_array['third_table']['table'][$sts]['status_name'] = $value;

                $k = $all_called_first;
                $color_code = '#F9FAFB';
                while ($k <= $all_called_last) {
                    if (preg_match("/1$|3$|5$|7$|9$/i", $sts)) {
                        if (preg_match('/1$|3$|5$|7$|9$/i', $k)) {
                            $color_code = '#EAEAEA';
                        } else {
                            $color_code = '#F9FAFB';
                        }
                    } else {
                        if (preg_match("/0$|2$|4$|6$|8$/i", $k)) {
                            $color_code = '#EAEAEA';
                        } else {
                            $color_code = '#F9FAFB';
                        }
                    }
                    $called_printed = 0;
                    $o = 0;
                    $temp_count = count($result_called);
                    while ($temp_count > $o) {
                        if (($count_statuses[$o] == "$Pstatus") && ( $count_called[$o] == $k)) {
                            $called_printed++;
                            $result_array['third_table']['table'][$sts]['color_' . $k] = $color_code;
                            $result_array['third_table']['table'][$sts]['count_' . $k] = $count_count[$o];
                        }
                        $o++;
                    }
                    if (!$called_printed) {
                        $result_array['third_table']['table'][$sts]['color_' . $k] = $color_code;
                        $result_array['third_table']['table'][$sts]['count_' . $k] = '&nbsp;';
                    }
                    $k++;
                }
                $result_array['third_table']['table'][$sts]['leads_in_sts'] = $leads_in_sts[$sts];
                $sts++;
            }

            $k = $all_called_first;
            while ($k <= $all_called_last) {
                $result_array['third_table']['total']['color_' . $k] = $color_code;
                $result_array['third_table']['total']['total_' . $k] = isset($all_called_count[$k]) ? $all_called_count[$k] : '&nbsp;';
                $k++;
            }
            $result_array['third_table']['total']['leads_in_list'] = $leads_in_list;
            //Third table end

            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $result_array]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.DataListController  '), $e);
            throw $e;
        }
    }

    /**
     * Called/Not Called since last reset
     * @param int $list_id
     * @return array
     */
    protected function statusLastCallCount($list_id) {
        $call_since_last_reset = VicidialList::join('vicidial_lists', 'vicidial_list.list_id', 'vicidial_lists.list_id')
                ->selectRaw('vicidial_list.status, COUNT(vicidial_list.lead_id) as count')
                ->where('vicidial_list.list_id', $list_id)
                ->where('called_since_last_reset', 'Y')
                ->groupBy('vicidial_list.status')
                ->get();
        $result_array['call_reset'] = $call_since_last_reset->pluck('count', 'status')->toArray();
        $result_array['call_reset']['total'] = $call_since_last_reset->sum('count');
        $not_call_since_last_reset = VicidialList::join('vicidial_lists', 'vicidial_list.list_id', 'vicidial_lists.list_id')
                ->selectRaw('vicidial_list.status, COUNT(vicidial_list.lead_id) as count')
                ->where('vicidial_list.list_id', $list_id)
                ->where('called_since_last_reset', 'N')
                ->groupBy('vicidial_list.status')
                ->get();
        $result_array['not_call_reset'] = $not_call_since_last_reset->pluck('count', 'status')->toArray();
        $result_array['not_call_reset']['total'] = $not_call_since_last_reset->sum('count');
        return $result_array;
    }

}
