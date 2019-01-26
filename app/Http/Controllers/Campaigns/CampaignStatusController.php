<?php

namespace App\Http\Controllers\Campaigns;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use \App\Traits\ErrorLog;
use \App\Traits\AccessControl;
use \App\Traits\Helper;
use Exception;
use App\VicidialAdminLog;
use Validator;
use App\VicidialCampaignStatuses;
use App\VicidialCampaign;
use App\VicidialStatuses;

class CampaignStatusController extends Controller {

    use ErrorLog,
        AccessControl,
        Helper;

    /**
     * Custom campaign statuses list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function customCampaignStatusesList(Request $request) {
        try {

            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $campaign_id = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_CAMPAIGN, ACCESS_READ, $current_company_id, $user);
            $limit = $request->get('limit') ?: \Config::get("configs.pagination_limit");
            $search = $request->get('search') ?: NULL;

            $campaigns = VicidialCampaign::campaignsStatusList($campaign_id, $search, $limit);
            $statuses = VicidialCampaignStatuses::whereIn('campaign_id', $campaign_id)->select('status', 'campaign_id')->get();
            $statuses = $statuses->groupBy('campaign_id')->toArray();
            foreach ($campaigns as $campaign) {
                if (isset($statuses[$campaign->campaign_id])) {
                    $status_array = array_column($statuses[$campaign->campaign_id], 'status');
                    $campaign[0] = implode(' ', $status_array);
                    $campaign[1] = $status_array;
                } else {
                    $campaign[0] = 'NONE';
                }
            }

            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $campaigns]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Systemwide statuses list
     *
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function systemWideStatusesList() {
        try {

            $result_list = [];
            $string = file_get_contents(public_path() . '/json/js/campaign_statuses.json');
            $status_array = json_decode($string, true);

            $total_statuses = count($status_array['statuslist']);
            $statuses = VicidialStatuses::systemWideStatusesList();
            foreach ($statuses as $key => $value) {
                array_push($result_list, $statuses[$key]->toArray());
                for ($i = 0; $i < $total_statuses; $i++) {
                    if ($status_array['statuslist'][$i]['min_title'] == $value->status) {
                        array_push($result_list[$key], $status_array['statuslist'][$i]['title']);
                        array_push($result_list[$key], $status_array['statuslist'][$i]['description']);
                    }
                }
            }

            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $result_list]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Systemwide statuses list update
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function systemWideStatusesListUpdate(Request $request) {
        try {

            $user = $request->user();
            $statuses = $request->statuses;
            $admin_log_data = [];
            $campaign_id = isset($request->campaign_id) ? $request->campaign_id : NULL;
            $res = false;

            if (is_array($statuses) && !empty($statuses)) {
                foreach ($statuses as $key => $status) {
                    Validator::make($status, [
                        'status' => 'required|alpha_num:/^(?! )[0-9a-zA-Z_]*$|between:1,6',
                        'status_name' => 'required|regex:/^[a-z\d\-_\s]+$/i|between:2,30'
                            ], [
                        'status.required' => 'Status ID is required.',
                        'status.alpha_num' => 'Status ID must contain only letters and numbers without space.',
                        'status.between' => 'Status ID should be between 1 to 6 characters.',
                        'status_name.required' => 'Status Name is required.',
                        'status_name.regex' => 'Status Name should contain alphabets and numbers only (hyphen and underscore are allowed)',
                        'status_name.between' => 'Status Name should be between 2 to 30 characters.',
                    ])->validate();
                    unset($status['0']);
                    unset($status['1']);
                    unset($status['options_title']);
                    if ($campaign_id === NULL) {
                        $res = VicidialStatuses::where('status', $status['status'])->update($status);
                    } else {
                        $res = VicidialCampaignStatuses::where('status', $status['status'])->where('campaign_id', $campaign_id)->update($status);
                    }
                    if ($res) {
                        $admin_log_data[$key]['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                        $admin_log_data[$key]['user'] = $user->x5_contact_id;
                        $admin_log_data[$key]['ip_address'] = $this->clientIp();
                        $admin_log_data[$key]['event_section'] = "SYSTEMSTATUSES";
                        $admin_log_data[$key]['event_type'] = "MODIFY";
                        $admin_log_data[$key]['record_id'] = $status['status'];
                        $admin_log_data[$key]['event_code'] = "ADMIN MODIFY SYSTEM STATUS";
                        $admin_log_data[$key]['event_sql'] = 'UPDATE vicidial_statuses SET status_name=' . $status['status_name'] . ',selectable=' . $status['selectable'] . ',human_answered=' . $status['human_answered'] . ',category=' . $status['category'] . ',sale=' . $status['sale'] . ',dnc=' . $status['dnc'] . ',customer_contact=' . $status['customer_contact'] . ',not_interested=' . $status['not_interested'] . ',unworkable=' . $status['unworkable'] . ',scheduled_callback=' . $status['scheduled_callback'] . ',completed=' . $status['completed'] . ' where status=' . $status['status'];
                        $admin_log_data[$key]['event_notes'] = "";
                        $admin_log_data[$key]['user_group'] = "";
                    }
                }

                if (count($admin_log_data) > 0) {
                    VicidialAdminLog::insert($admin_log_data);
                }

                return response()->json(['status' => 200, 'msg' => 'System status updated successfully.']);
            }
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Add new system status
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function addNewSystemStatus(Request $request) {
        try {

            $user = $request->user();
            $data = $request->all();

            Validator::make($data, [
                'status' => 'required|alpha_num:/^(?! )[0-9a-zA-Z_]*$|between:1,6|unique:dyna.vicidial_statuses',
                'status_name' => 'required|regex:/^[a-z\d\-_\s]+$/i|between:2,30'
                    ], [
                'status.required' => 'Status ID is required.',
                'status.alpha_num' => 'Status ID must contain only letters and numbers without space.',
                'status.between' => 'Status ID should be between 1 to 6 characters.',
                'status.unique' => 'System status is already exists.',
                'status_name.required' => 'Status Name is required.',
                'status_name.regex' => 'Status Name should contain alphabets and numbers only (hyphen and underscore are allowed)',
                'status_name.between' => 'Status Name should be between 2 to 30 characters.',
            ])->validate();

            unset($data['current_company_id']);
            unset($data['current_application_dns']);
            unset($data['options_title']);
            unset($data['url']);
            $status = VicidialStatuses::insert($data);
            if ($status) {
                $admin_log_data['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                $admin_log_data['user'] = $user->x5_contact_id;
                $admin_log_data['ip_address'] = $this->clientIp();
                $admin_log_data['event_section'] = "SYSTEMSTATUSES";
                $admin_log_data['event_type'] = "ADD";
                $admin_log_data['record_id'] = $data['status'];
                $admin_log_data['event_code'] = "ADMIN ADD SYSTEM STATUS";
                $admin_log_data['event_sql'] = 'INSERT INTO vicidial_statuses SET status_name=' . $data['status_name'] . ',selectable=' . $data['selectable'] . ',human_answered=' . $data['human_answered'] . ',category=' . $data['category'] . ',sale=' . $data['sale'] . ',dnc=' . $data['dnc'] . ',customer_contact=' . $data['customer_contact'] . ',not_interested=' . $data['not_interested'] . ',unworkable=' . $data['unworkable'] . ',scheduled_callback=' . $data['scheduled_callback'] . ',completed=' . $data['completed'] . ', status=' . $data['status'] . ';';
                $admin_log_data['event_notes'] = "";
                $admin_log_data['user_group'] = "";
                VicidialAdminLog::insert($admin_log_data);
            }

            return response()->json(['status' => 200, 'msg' => 'System status save successfully.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Clone campaign status
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function cloneCampaignStatus(Request $request) {
        try {

            $from_campaign = $request->from_campaign;
            $to_campaigns = $request->to_campaigns;
            $user = $request->user();

            $campaign_statuses = VicidialCampaignStatuses::select('campaign_id', 'status', 'status_name', 'selectable', 'human_answered', 'category', 'sale', 'dnc', 'customer_contact', 'not_interested', 'unworkable', 'scheduled_callback', 'completed')->where('campaign_id', '=', $from_campaign)->get();
            if (count($campaign_statuses) === 0) {
                throw new Exception('No Campaign Stautses Found into (' . $from_campaign . ') Campaign.', 400);
            }

            if (in_array($from_campaign, $to_campaigns)) {
                throw new Exception('Not allowed to copy Campaign Status into same(' . $from_campaign . ') campaign.', 400);
            }

            $arr_key = 0;
            $message = '';
            $new_campaign_status = [];
            $admin_log_data = [];

            if (!is_array($to_campaigns) || empty($to_campaigns)) {
                throw new Exception('Request parameter `to_campaigns` is empty.', 400);
            } else {
                foreach ($to_campaigns as $key => $value) {
                    foreach ($campaign_statuses as $key_child => $campaign_status) {
                        $total_count = VicidialCampaignStatuses::where('campaign_id', $value)->where('status', $campaign_status->status)->count();
                        if ($total_count === 0) {
                            $new_campaign_status[$arr_key]['campaign_id'] = $value;
                            $new_campaign_status[$arr_key]['status'] = $campaign_status->status;
                            $new_campaign_status[$arr_key]['status_name'] = $campaign_status->status_name;
                            $new_campaign_status[$arr_key]['selectable'] = $campaign_status->selectable;
                            $new_campaign_status[$arr_key]['human_answered'] = $campaign_status->human_answered;
                            $new_campaign_status[$arr_key]['category'] = $campaign_status->category;
                            $new_campaign_status[$arr_key]['sale'] = $campaign_status->sale;
                            $new_campaign_status[$arr_key]['dnc'] = $campaign_status->dnc;
                            $new_campaign_status[$arr_key]['customer_contact'] = $campaign_status->customer_contact;
                            $new_campaign_status[$arr_key]['not_interested'] = $campaign_status->not_interested;
                            $new_campaign_status[$arr_key]['unworkable'] = $campaign_status->unworkable;
                            $new_campaign_status[$arr_key]['scheduled_callback'] = $campaign_status->scheduled_callback;
                            $new_campaign_status[$arr_key]['completed'] = $campaign_status->completed;

                            $admin_log_data[$arr_key]['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                            $admin_log_data[$arr_key]['user'] = $user->x5_contact_id;
                            $admin_log_data[$arr_key]['ip_address'] = $this->clientIp();
                            $admin_log_data[$arr_key]['event_section'] = "CAMPAIGN_STATUS";
                            $admin_log_data[$arr_key]['event_type'] = "COPY";
                            $admin_log_data[$arr_key]['record_id'] = $value;
                            $admin_log_data[$arr_key]['event_code'] = "ADMIN COPY CAMPAIGN STATUS";
                            $admin_log_data[$arr_key]['event_sql'] = 'INSERT INTO vicidial_campaign_statuses (campaign_id,status,status_name,selectable,human_answered,category,sale,dnc,customer_contact,not_interested,unworkable,scheduled_callback,completed) VALUES (' . $campaign_status->campaign_id . ',' . $campaign_status->status . ',' . $campaign_status->status_name . ',' . $campaign_status->selectable . ',' . $campaign_status->human_answered . ',' . $campaign_status->category . ',' . $campaign_status->sale . ',' . $campaign_status->dnc . ',' . $campaign_status->customer_contact . ',' . $campaign_status->not_interested . ',' . $campaign_status->unworkable . ',' . $campaign_status->scheduled_callback . ',' . $campaign_status->completed . ');';
                            $admin_log_data[$arr_key]['event_notes'] = "";
                            $admin_log_data[$arr_key]['user_group'] = "";

                            $arr_key++;
                        }
                        if ($key_child === 0) {
                            $message .= 'Campaign Status are append sucessfully into (' . $value . ') campaign.</br>';
                        }
                    }
                }
            }

            if (count($new_campaign_status)) {
                VicidialCampaignStatuses::insert($new_campaign_status);
            }
            if (count($admin_log_data)) {
                VicidialAdminLog::insert($admin_log_data);
            }

            return response()->json(['status' => 200, 'msg' => $message]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Add/Update custom campaign status
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function updateCampaignStatus(Request $request) {
        try {

            $user = $request->user();

            $data = $request->only('campaign_id', 'status', 'status_name', 'selectable', 'human_answered', 'category', 'sale', 'dnc', 'customer_contact', 'not_interested', 'unworkable', 'scheduled_callback', 'completed', 'campaign_id');

            $is_exists = VicidialCampaignStatuses::where('campaign_id', $data['campaign_id'])->where('status', $data['status'])->count();
            if ($is_exists === 0) {
                throw new Exception("We can not locate your campaign, please check your input.", 400);
            }

            Validator::make($data, [
                'campaign_id' => 'required',
                'status' => 'required|alpha_num:/^(?! )[0-9a-zA-Z_]*$|between:1,6',
                'status_name' => 'required|regex:/^[a-z\d\-_\s]+$/i|between:2,30'
                    ], [
                'campaign_id.required' => 'Campaign ID is required.',
                'status.required' => 'Status ID is required.',
                'status.alpha_num' => 'Status ID must contain only letters and numbers without space.',
                'status.between' => 'Status ID should be between 1 to 6 characters.',
                'status_name.required' => 'Status Name is required.',
                'status_name.regex' => 'Status Name should contain alphabets and numbers only (hyphen and underscore are allowed)',
                'status_name.between' => 'Status Name should be between 2 to 30 characters.',
            ])->validate();

            VicidialCampaignStatuses::where('campaign_id', $data['campaign_id'])->where('status', $data['status'])->update($data);
            $admin_log_data['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log_data['user'] = $user->x5_contact_id;
            $admin_log_data['ip_address'] = $this->clientIp();
            $admin_log_data['event_section'] = 'CAMPAIGN_STATUS';
            $admin_log_data['event_type'] = 'MODIFY';
            $admin_log_data['record_id'] = $data['status'];
            $admin_log_data['event_code'] = 'ADMIN MODIFY CAMPAIGN STATUS';
            $admin_log_data['event_sql'] = 'UPDATE vicidial_campaign_statuses SET status_name=' . $data['status_name'] . ',selectable=' . $data['selectable'] . ',human_answered=' . $data['human_answered'] . ',category=' . $data['category'] . ',sale=' . $data['sale'] . ',dnc=' . $data['dnc'] . ',customer_contact=' . $data['customer_contact'] . ',not_interested=' . $data['not_interested'] . ',unworkable=' . $data['unworkable'] . ',scheduled_callback=' . $data['scheduled_callback'] . ',completed=' . $data['completed'] . ' where status=' . $data['status'];
            $admin_log_data['event_notes'] = '';
            $admin_log_data['user_group'] = '';
            VicidialAdminLog::insert($admin_log_data);

            return response()->json(['status' => 200, 'msg' => 'Campaign Status Updated Successfully.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Add custom campaign status
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function addCampaignStatus(Request $request) {
        try {

            $user = $request->user();
            $data = $request->only('campaign_id', 'status', 'status_name', 'selectable', 'human_answered', 'category', 'sale', 'dnc', 'customer_contact', 'not_interested', 'unworkable', 'scheduled_callback', 'completed', 'campaign_id');

            Validator::make($data, [
                'campaign_id' => 'required',
                'status' => 'required|alpha_num:/^(?! )[0-9a-zA-Z_]*$|between:1,6|unique:dyna.vicidial_campaign_statuses',
                'status_name' => 'required|regex:/^[a-z\d\-_\s]+$/i|between:2,30'
                    ], [
                'campaign_id.required' => 'Campaign ID is required.',
                'status.required' => 'Status ID is required.',
                'status.unique' => 'Status already Exist.',
                'status.alpha_num' => 'Status ID must contain only letters and numbers without space.',
                'status.between' => 'Status ID should be between 1 to 6 characters.',
                'status_name.required' => 'Status Name is required.',
                'status_name.regex' => 'Status Name should contain alphabets and numbers only (hyphen and underscore are allowed)',
                'status_name.between' => 'Status Name should be between 2 to 30 characters.',
            ])->validate();

            VicidialCampaignStatuses::insert($data);
            $admin_log_data['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log_data['user'] = $user->x5_contact_id;
            $admin_log_data['ip_address'] = $this->clientIp();
            $admin_log_data['event_section'] = 'CAMPAIGN_STATUS';
            $admin_log_data['event_type'] = 'ADD';
            $admin_log_data['record_id'] = $data['status'];
            $admin_log_data['event_code'] = "ADMIN ADD CAMPAIGN STATUS";
            $admin_log_data['event_sql'] = 'INSERT INTO vicidial_campaign_statuses (campaign_id,status,status_name,selectable,human_answered,category,sale,dnc,customer_contact,not_interested,unworkable,scheduled_callback,completed) VALUES (' . $data['campaign_id'] . ',' . $data['status'] . ',' . $data['status_name'] . ',' . $data['selectable'] . ',' . $data['human_answered'] . ',' . $data['category'] . ',' . $data['sale'] . ',' . $data['dnc'] . ',' . $data['customer_contact'] . ',' . $data['not_interested'] . ',' . $data['unworkable'] . ',' . $data['scheduled_callback'] . ',' . $data['completed'] . ');';
            $admin_log_data['event_notes'] = '';
            $admin_log_data['user_group'] = '';
            VicidialAdminLog::insert($admin_log_data);

            return response()->json(['status' => 200, 'msg' => 'Campaign Status Added Successfully.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Edit campaign status
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function editCampaignStatus(Request $request) {
        try {

            Validator::make($request->all(), [
                'campaign_id' => 'required',
            ])->validate();
            $campaign_id = $request->campaign_id;

            $statuses = VicidialCampaignStatuses::where('campaign_id', $campaign_id)->orderBy('y_status_order', 'ASC')->orderByRaw('ISNULL(y_status_order)', 'ASC')->get();
            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $statuses]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Delete campaign status
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function deleteCampaignStatus(Request $request) {
        try {

            Validator::make($request->all(), [
                'campaign_id' => 'required',
                'status' => 'required',
            ])->validate();
            $campaign_id = $request->campaign_id;
            $status = $request->status;
            $user = $request->user();

            VicidialCampaignStatuses::where('campaign_id', $campaign_id)->where('status', $status)->delete();

            $admin_log_data['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log_data['user'] = $user->x5_contact_id;
            $admin_log_data['ip_address'] = $this->clientIp();
            $admin_log_data['event_section'] = "CAMPAIGN_STATUS";
            $admin_log_data['event_type'] = "DELETE";
            $admin_log_data['record_id'] = $status;
            $admin_log_data['event_code'] = "ADMIN DELETE CAMPAIGN STATUS";
            $admin_log_data['event_sql'] = 'DELETE FROM vicidial_campaign_statuses where status=' . $status . ' AND campaign_id=' . $campaign_id;
            $admin_log_data['event_notes'] = "";
            $admin_log_data['user_group'] = "";
            VicidialAdminLog::insert($admin_log_data);

            return response()->json(['status' => 200, 'msg' => 'Campaign status deleted successfully.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

}
