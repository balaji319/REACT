<?php

namespace App\Http\Controllers\Campaigns;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use \App\Traits\ErrorLog;
use \App\Traits\AccessControl;
use \App\Traits\Helper;
use Exception;
use App\VicidialCampaignCidAreacode;
use App\VicidialCampaign;
use App\VicidialAdminLog;
use Validator;

class AreaCodeController extends Controller {

    use ErrorLog,
        AccessControl,
        Helper;

    /**
     * Area code CID list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function areaCodeList(Request $request) {
        try {

            $limit = $request->limit ?: \Config::get('configs.pagination_limit');
            $search = $request->search ?: NULL;
            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $fields = ['campaign_id', 'campaign_name', 'use_custom_cid'];

            $campaign_id = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_CAMPAIGN, ACCESS_READ, $current_company_id, $user);
            $campaigns = VicidialCampaign::campaignsStatusList($campaign_id, $search, $limit, $fields);
            $area_codes = VicidialCampaignCidAreacode::whereIn('campaign_id', $campaign_id)->select('areacode', 'campaign_id')->get();
            $area_codes = $area_codes->groupBy('campaign_id')->toArray();
            foreach ($campaigns as $campaign) {
                if (isset($area_codes[$campaign->campaign_id])) {
                    $campaign->areacode = count($area_codes[$campaign->campaign_id]);
                } else {
                    $campaign->areacode = 0;
                }
            }

            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $campaigns]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql  '), $e);
            throw $e;
        }
    }

    /**
     * Clone area code
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function cloneAreaCode(Request $request) {
        try {

            Validator::make($request->all(), [
                'from_campaign' => 'required',
                'to_campaigns' => 'required',
            ])->validate();
            $from_campaign = $request->from_campaign;
            $to_campaigns = $request->to_campaigns;
            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $campaign_id = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_CREATE, $current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_CAMPAIGN_AC_CID, $campaign_id)) {
                throw new Exception('Cannot clone area code, you might not have permission to do this.', 400);
            }

            $area_codes = VicidialCampaignCidAreacode::select('campaign_id', 'areacode', 'outbound_cid', 'cid_description', 'active')->where('campaign_id', $from_campaign)->get();
            if (count($area_codes) === 0) {
                throw new Exception('No Area Code Found into (' . $from_campaign . ') Campaign.', 400);
            }

            if (in_array($from_campaign, $to_campaigns)) {
                throw new Exception('Not allowed to copy Area Code into same(' . $from_campaign . ') campaign.', 400);
            }

            $arr_key = 0;
            $message = '';
            $new_area_code = [];
            $admin_log_data = [];

            foreach ($to_campaigns as $key => $value) {
                foreach ($area_codes as $key_child => $area_code) {
                    $total_count = VicidialCampaignCidAreacode::where('campaign_id', $value)->where('areacode', $area_code->areacode)->where('outbound_cid', $area_code->outbound_cid)->count();
                    if ($total_count === 0) {
                        $new_area_code[$arr_key]['campaign_id'] = $value;
                        $new_area_code[$arr_key]['areacode'] = $area_code->areacode;
                        $new_area_code[$arr_key]['outbound_cid'] = $area_code->pause_code_name;
                        $new_area_code[$arr_key]['cid_description'] = $area_code->cid_description;
                        $new_area_code[$arr_key]['active'] = $area_code->active;

                        $admin_log_data[$arr_key]['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                        $admin_log_data[$arr_key]['user'] = $user->x5_contact_id;
                        $admin_log_data[$arr_key]['ip_address'] = $this->clientIp();
                        $admin_log_data[$arr_key]['event_section'] = 'CAMPAIGN_AC-CID';
                        $admin_log_data[$arr_key]['event_type'] = 'COPY';
                        $admin_log_data[$arr_key]['record_id'] = $value;
                        $admin_log_data[$arr_key]['event_code'] = 'ADMIN COPY CAMPAIGN AC-CID';
                        $admin_log_data[$arr_key]['event_sql'] = 'INSERT INTO vicidial_campaign_cid_areacodes (campaign_id,areacode,outbound_cid,cid_description,active) VALUES (' . $area_code->campaign_id . ',' . $area_code->areacode . ',' . $area_code->outbound_cid . ',' . $area_code->cid_description . ',' . $area_code->active . ');';
                        $admin_log_data[$arr_key]['event_notes'] = '';
                        $admin_log_data[$arr_key]['user_group'] = '';

                        $arr_key++;
                    }
                    if ($key_child === 0) {
                        $message .= 'AC-CIDs are append sucessfully into (' . $value . ') campaign.</br>';
                    }
                }
            }


            if (count($new_area_code)) {
                VicidialCampaignCidAreacode::insert($new_area_code);
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
     * Edit area code list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function editAreaCodeList(Request $request) {
        try {

            Validator::make($request->all(), [
                'campaign_id' => 'required',
            ])->validate();
            $area_code_list = VicidialCampaignCidAreacode::where('campaign_id', $request->campaign_id)->orderBy('areacode')->get();
            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $area_code_list]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Active/De-active area code
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function activeOrDeactiveAreaCode(Request $request) {
        try {

            Validator::make($request->all(), [
                'select_type' => 'required|in:Y,N',
                'area_codes' => 'required|array',
            ])->validate();
            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $select_type = $request->select_type;
            $area_codes = $request->area_codes;

            $campaign_id = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE, $current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_CAMPAIGN_AC_CID, $campaign_id)) {
                throw new Exception('Cannot update area code, you might not have permission to do this.', 400);
            }

            foreach ($area_codes as $area_code) {
                VicidialCampaignCidAreacode::where('campaign_id', $area_code['campaign_id'])->where('areacode', $area_code['areacode'])->where('outbound_cid', $area_code['outbound_cid'])->update(['active' => $select_type]);
            }

            return response()->json(['status' => 200, 'msg' => 'AC-CID ' . ($select_type == 'Y' ? 'Activated' : 'Deactivated') . ' Successfully.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Update area code
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function updateAreaCode(Request $request) {
        try {

            Validator::make($request->all(), [
                'campaign_id' => 'required',
                'areacode' => 'required',
                'outbound_cid' => 'required',
                'active' => 'required|in:Y,N',
            ])->validate();
            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $area_code = $request->only('campaign_id', 'areacode', 'outbound_cid', 'cid_description', 'active');

            $campaign_id = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE, $current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_CAMPAIGN_AC_CID, $campaign_id)) {
                throw new Exception('Cannot update area code, you might not have permission to do this.', 400);
            }

            VicidialCampaignCidAreacode::where('campaign_id', $area_code['campaign_id'])->where('areacode', $area_code['areacode'])->where('outbound_cid', $area_code['outbound_cid'])->update(['active' => $area_code['active'], 'cid_description' => $area_code['cid_description']]);

            return response()->json(['status' => 200, 'msg' => 'Number Modified Successfully.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

}
