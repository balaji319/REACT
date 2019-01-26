<?php

namespace App\Http\Controllers\Campaigns;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use \App\Traits\ErrorLog;
use \App\Traits\AccessControl;
use \App\Traits\Helper;
use App\VicidialAdminLog;
use App\X5ContactAccess;
use App\VicidialPauseCode;
use App\VicidialCampaign;
use App\Http\Requests\PauseCodeRequest;
use Exception;
use Validator;

class PauseCodeController extends Controller {

    use ErrorLog,
        AccessControl,
        Helper;

    /**
     * Pause code list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function pauseCodeList(Request $request) {
        try {

            $limit = $request->limit ?: \Config::get('configs.pagination_limit');
            $search = $request->search ?: NULL;
            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $campaign_id = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_CAMPAIGN, ACCESS_READ, $current_company_id, $user);
            $campaigns = VicidialCampaign::campaignsStatusList($campaign_id, $search, $limit);
            $pause_codes = VicidialPauseCode::whereIn('campaign_id', $campaign_id)->select('pause_code', 'campaign_id')->get();
            $pause_codes = $pause_codes->groupBy('campaign_id')->toArray();
            foreach ($campaigns as $campaign) {
                if (isset($pause_codes[$campaign->campaign_id])) {
                    $campaign->pause_codes = implode(' ', array_column($pause_codes[$campaign->campaign_id], 'pause_code'));
                    $campaign->modify = true;
                } else {
                    $campaign->pause_codes = 'NONE';
                    $campaign->modify = false;
                }
            }

            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $campaigns]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql  '), $e);
            throw $e;
        }
    }

    /**
     * Campaign wise pause code
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function campaignWisePauseCodeList() {
        try {

            $result_array['pause_codes'] = VicidialPauseCode::findAll();
            $pause_code_id = array_column($result_array['pause_codes']->toArray(), 'pause_code');
            $result_array['campaigns'] = VicidialCampaign::where('campaign_id', '!=', '')->distinct()->get(['campaign_id', 'campaign_name']);
            $result_array['pause_code_display'] = VicidialPauseCode::select('pause_code', 'campaign_id')->whereIn('pause_code', $pause_code_id)->get();

            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $result_array]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql  '), $e);
            throw $e;
        }
    }

    /**
     * Clone pause code
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function clonePauseCode(Request $request) {
        try {

            Validator::make($request->all(), [
                'from_campaign' => 'required',
                'to_campaigns' => 'required|array',
            ])->validate();

            $from_campaign = $request->from_campaign;
            $to_campaigns = $request->to_campaigns;
            $user = $request->user();

            $pause_codes = VicidialPauseCode::select('campaign_id', 'pause_code', 'pause_code_name', 'billable')->where('campaign_id', '=', $from_campaign)->get();
            if (count($pause_codes) === 0) {
                throw new Exception('No Pause Code Found into (' . $from_campaign . ') Campaign.', 400);
            }

            if (in_array($from_campaign, $to_campaigns)) {
                throw new Exception('Not allowed to copy Pause Code into same(' . $from_campaign . ') campaign.', 400);
            }

            $arr_key = 0;
            $message = '';
            $new_pause_code = [];
            $admin_log_data = [];

            foreach ($to_campaigns as $key => $value) {
                foreach ($pause_codes as $key_child => $pause_code) {
                    $total_count = VicidialPauseCode::where('campaign_id', $value)->where('pause_code', $pause_code->pause_code)->count();
                    if ($total_count === 0) {
                        $new_pause_code[$arr_key]['campaign_id'] = $value;
                        $new_pause_code[$arr_key]['pause_code'] = $pause_code->pause_code;
                        $new_pause_code[$arr_key]['pause_code_name'] = $pause_code->pause_code_name;
                        $new_pause_code[$arr_key]['billable'] = $pause_code->billable;

                        $admin_log_data[$arr_key]['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                        $admin_log_data[$arr_key]['user'] = $user->x5_contact_id;
                        $admin_log_data[$arr_key]['ip_address'] = $this->clientIp();
                        $admin_log_data[$arr_key]['event_section'] = 'CAMPAIGN_PAUSECODE';
                        $admin_log_data[$arr_key]['event_type'] = 'COPY';
                        $admin_log_data[$arr_key]['record_id'] = $value;
                        $admin_log_data[$arr_key]['event_code'] = 'ADMIN ADD CAMPAIGN PAUSE CODE';
                        $admin_log_data[$arr_key]['event_sql'] = 'INSERT INTO vicidial_pause_codes (campaign_id,pause_code,pause_code_name,billable) VALUES (' . $pause_code->campaign_id . ',' . $pause_code->pause_code . ',' . $pause_code->pause_code_name . ',' . $pause_code->billable . ');';
                        $admin_log_data[$arr_key]['event_notes'] = '';
                        $admin_log_data[$arr_key]['user_group'] = '';

                        $arr_key++;
                    }
                    if ($key_child === 0) {
                        $message .= 'Pause Code are append sucessfully into (' . $value . ') campaign.</br>';
                    }
                }
            }

            if (count($new_pause_code)) {
                VicidialPauseCode::insert($new_pause_code);
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
     * Edit campaign pause code
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function editCampaignPauseCodeList(Request $request) {
        try {

            Validator::make($request->all(), [
                'campaign_id' => 'required',
            ])->validate();
            $campaign_id = $request->campaign_id;
            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $campaign_ids = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_CAMPAIGN, ACCESS_READ, $current_company_id, $user);

            if (!in_array($campaign_id, $campaign_ids)) {
                throw new Exception('Cannot access campaign, you might not have permission to do this.', 400);
            }

            $pause_codes = VicidialPauseCode::where('campaign_id', $campaign_id)->get();

            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $pause_codes]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Edit pause code
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function editPauseCode(PauseCodeRequest $request) {
        try {

            $campaign_id = $request->campaign_id;
            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $campaign_ids = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_CAMPAIGN, ACCESS_READ, $current_company_id, $user);
            if (!in_array($campaign_id, $campaign_ids)) {
                throw new Exception('Cannot access campaign, you might not have permission to do this.', 400);
            }

            $pause_code = VicidialPauseCode::where('pause_code', $request->pause_code)->where('campaign_id', $campaign_id)->first();
            if (!$pause_code instanceof VicidialPauseCode) {
                throw new Exception('Pause Code is Wrong or black please try again.', 400);
            }
            $pause_code->pause_code_name = $request->pause_code_name;
            $pause_code->billable = $request->billable;
            $pause_code->save();

            $admin_log_data['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log_data['user'] = $user->x5_contact_id;
            $admin_log_data['ip_address'] = $this->clientIp();
            $admin_log_data['event_section'] = 'CAMPAIGN_PAUSECODE';
            $admin_log_data['event_type'] = 'MODIFY';
            $admin_log_data['record_id'] = $request->pause_code;
            $admin_log_data['event_code'] = 'ADMIN MODIFY CAMPAIGN PAUSE CODE';
            $admin_log_data['event_sql'] = 'UPDATE vicidial_pause_codes SET pause_code_name=' . $request->pause_code_name . ',billable=' . $request->billable . ' where campaign_id=' . $request->campaign_id . ' and pause_code=' . $request->pause_code . ';';
            $admin_log_data['event_notes'] = '';
            $admin_log_data['user_group'] = '';

            VicidialAdminLog::insert($admin_log_data);

            return response()->json(['status' => 200, 'msg' => 'Pause Code Modified Successfully.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Add new pause code
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function addPauseCode(PauseCodeRequest $request) {
        try {

            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $data = $request->only('pause_code', 'campaign_id', 'pause_code_name', 'billable');

            $campaign_ids = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_CREATE, $current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_CAMPAIGN_PAUSE_CODE, $campaign_ids)) {
                throw new Exception('Cannot create pause code, you might not have permission to do this.', 400);
            }

            $is_exists = VicidialPauseCode::where('pause_code', $data['pause_code'])->where('campaign_id', $data['campaign_id'])->count();
            if ($is_exists > 0) {
                throw new Exception('This record is already present.', 400);
            }

            VicidialPauseCode::insert($data);

            // Admin log
            $admin_log_data['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log_data['user'] = $user->x5_contact_id;
            $admin_log_data['ip_address'] = $this->clientIp();
            $admin_log_data['event_section'] = "CAMPAIGN_PAUSECODE";
            $admin_log_data['event_type'] = "ADD";
            $admin_log_data['record_id'] = $data['pause_code'];
            $admin_log_data['event_code'] = "ADMIN ADD CAMPAIGN PAUSECODE";
            $admin_log_data['event_sql'] = 'INSERT INTO vicidial_pause_codes (campaign_id,pause_code,pause_code_name,billable) VALUES (' . $data['campaign_id'] . ',' . $data['pause_code'] . ',' . $data['pause_code_name'] . ',' . $data['billable'] . ');';
            $admin_log_data['event_notes'] = '';
            $admin_log_data['user_group'] = '';

            VicidialAdminLog::insert($admin_log_data);

            // Add full permission to user after create
            $x5_contact_access['model'] = ACCESS_MODEL_CONTACT;
            $x5_contact_access['foreign_key'] = $user->x5_contact_id;
            $x5_contact_access['type'] = ACCESS_TYPE_SYSTEM_COMPONENT;
            $x5_contact_access['link_id'] = $data['pause_code'];
            $x5_contact_access['_create'] = 0;
            $x5_contact_access['_read'] = 1;
            $x5_contact_access['_update'] = 1;
            $x5_contact_access['_delete'] = 1;
            X5ContactAccess::insert($x5_contact_access);

            return response()->json(['status' => 200, 'msg' => 'Pause Code successfully added.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Delete pause code
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function deletePauseCode(Request $request) {
        try {

            Validator::make($request->all(), [
                'campaign_id' => 'required',
                'pause_code' => 'required',
            ])->validate();
            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $campaign_ids = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_CREATE, $current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_CAMPAIGN_PAUSE_CODE, $campaign_ids)) {
                throw new Exception('Cannot delete pause code, you might not have permission to do this.', 400);
            }

            VicidialPauseCode::where('pause_code', $request->pause_code)->where('campaign_id', $request->campaign_id)->delete();

            // Admin log
            $admin_log_data['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log_data['user'] = $user->x5_contact_id;
            $admin_log_data['ip_address'] = $this->clientIp();
            $admin_log_data['event_section'] = "CAMPAIGN_PAUSECODE";
            $admin_log_data['event_type'] = "DELETE";
            $admin_log_data['record_id'] = $request->pause_code;
            $admin_log_data['event_code'] = "ADMIN DELETE CAMPAIGN PAUSE CODE";
            $admin_log_data['event_sql'] = 'DELETE FROM vicidial_pause_codes where campaign_id=' . $request->campaign_id . ' and pause_code=' . $request->pause_code . ';';
            $admin_log_data['event_notes'] = '';
            $admin_log_data['user_group'] = '';

            VicidialAdminLog::insert($admin_log_data);

            return response()->json(['status' => 200, 'msg' => 'Pause Code deleted successfully.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

}
