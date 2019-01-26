<?php

namespace App\Http\Controllers\Campaigns;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use \App\Traits\ErrorLog;
use \App\Traits\AccessControl;
use \App\Traits\Helper;
use Exception;
use App\VicidialCampaign;
use App\VicidialXferPreset;
use App\Http\Requests\CallTransferPresetRequest;
use App\VicidialAdminLog;
use Validator;

class CallTransferPresetController extends Controller {

    use ErrorLog,
        AccessControl,
        Helper;

    /**
     * Call transfer preset list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function callTransferPresetList(Request $request) {
        try {

            $limit = $request->limit ?: \Config::get('configs.pagination_limit');
            $search = $request->search ?: NULL;
            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $campaign_id = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_CAMPAIGN, ACCESS_READ, $current_company_id, $user);
            $campaigns = VicidialCampaign::campaignsStatusList($campaign_id, $search, $limit);

            $call_transfer_presets = VicidialXferPreset::whereIn('campaign_id', $campaign_id)->select('preset_name', 'campaign_id')->get();
            $call_transfer_presets = $call_transfer_presets->groupBy('campaign_id')->toArray();
            foreach ($campaigns as $campaign) {
                if (isset($call_transfer_presets[$campaign->campaign_id])) {
                    $campaign->preset_name = implode(' ', array_column($call_transfer_presets[$campaign->campaign_id], 'preset_name'));
                } else {
                    $campaign->preset_name = 'NONE';
                }
            }

            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $campaigns]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.CallTransferPresetController'), $e);
            throw $e;
        }
    }

    /**
     * Edit call transfer preset list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function editCallTransferPresetList(Request $request) {
        try {

            Validator::make($request->all(), [
                'campaign_id' => 'required',
            ])->validate();
            $campaign_id = $request->campaign_id;
            $lists = VicidialXferPreset::where('campaign_id', $campaign_id)->orderByRaw('ISNULL(preset_order) asc')->orderBy('preset_order', 'asc')->get();

            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $lists]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.CallTransferPresetController'), $e);
            throw $e;
        }
    }

    /**
     * Clone call transfer preset
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function cloneCallTransferPreset(Request $request) {
        try {

            Validator::make($request->all(), [
                'from_campaign' => 'required|exists:dyna.vicidial_xfer_presets,campaign_id',
                'to_campaigns' => 'required|array',
                    ], [
                'from_campaign.exists' => 'No Call Transfer Preset Found into (:input) Campaign.'
            ])->validate();
            $from_campaign = $request->from_campaign;
            $to_campaigns = $request->to_campaigns;
            $user = $request->user();
            $current_company_id = $request->current_company_id;
            if (in_array($from_campaign, $to_campaigns)) {
                throw new Exception('Not allowed to copy Call Transfer Presets into same(' . $from_campaign . ') campaign.', 400);
            }

            $campaign_ids = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_CREATE, $current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_CAMPAIGN_CALL_TRANSFER_PRESENT, $campaign_ids)) {
                throw new Exception('Cannot create campaign call transfer preset, you might not have permission to do this.', 400);
            }

            $call_transfer_presets = VicidialXferPreset::where('campaign_id', '=', $from_campaign)->get();

            $arr_key = 0;
            $message = '';
            $new_call_transfer_preset = [];
            $admin_log_data = [];

            foreach ($to_campaigns as $key => $value) {
                foreach ($call_transfer_presets as $key_child => $call_transfer_preset) {
                    $total_count = VicidialXferPreset::where('campaign_id', $value)->where('preset_name', $call_transfer_preset->preset_name)->count();
                    if ($total_count === 0) {
                        $new_call_transfer_preset[$arr_key]['campaign_id'] = $value;
                        $new_call_transfer_preset[$arr_key]['preset_name'] = $call_transfer_preset->preset_name;
                        $new_call_transfer_preset[$arr_key]['preset_number'] = $call_transfer_preset->preset_number;
                        $new_call_transfer_preset[$arr_key]['preset_dtmf'] = $call_transfer_preset->preset_dtmf;
                        $new_call_transfer_preset[$arr_key]['preset_hide_number'] = $call_transfer_preset->preset_hide_number;

                        $admin_log_data[$arr_key]['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                        $admin_log_data[$arr_key]['user'] = $user->x5_contact_id;
                        $admin_log_data[$arr_key]['ip_address'] = $this->clientIp();
                        $admin_log_data[$arr_key]['event_section'] = 'CAMPAIGN_PAUSECODE';
                        $admin_log_data[$arr_key]['event_type'] = 'COPY';
                        $admin_log_data[$arr_key]['record_id'] = $value;
                        $admin_log_data[$arr_key]['event_code'] = 'ADMIN COPY CAMPAIGN PRESET';
                        $admin_log_data[$arr_key]['event_sql'] = 'INSERT INTO vicidial_xfer_presets (preset_name, preset_number, preset_dtmf,preset_hide_number,campaign_id) VALUES (' . $call_transfer_preset->preset_name . ',' . $call_transfer_preset->preset_number . ',' . $call_transfer_preset->preset_dtmf . ',' . $call_transfer_preset->preset_hide_number . ',' . $call_transfer_preset->campaign_id . ');';
                        $admin_log_data[$arr_key]['event_notes'] = '';
                        $admin_log_data[$arr_key]['user_group'] = '';

                        $arr_key++;
                    }
                    if ($key_child === 0) {
                        $message .= 'Call Transfer Presets are append sucessfully into (' . $value . ') campaign.</br>';
                    }
                }
            }

            if (count($new_call_transfer_preset)) {
                VicidialXferPreset::insert($new_call_transfer_preset);
            }
            if (count($admin_log_data)) {
                VicidialAdminLog::insert($admin_log_data);
            }

            return response()->json(['status' => 200, 'msg' => $message]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.CallTransferPresetController'), $e);
            throw $e;
        }
    }

    /**
     * Add call transfer preset
     *
     * @param CallTransferPresetRequest $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function addCallTransferPreset(CallTransferPresetRequest $request) {
        try {

            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $campaign_ids = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_CREATE, $current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_CAMPAIGN_CALL_TRANSFER_PRESENT, $campaign_ids)) {
                throw new Exception('Cannot create campaign call transfer preset, you might not have permission to do this.', 400);
            }
            $data = $request->only('preset_name', 'preset_number', 'preset_dtmf', 'preset_hide_number', 'campaign_id');

            $is_exists = VicidialXferPreset::where('campaign_id', $data['campaign_id'])->where('preset_name', $data['preset_name'])->count();
            if ($is_exists > 0) {
                throw new Exception('Preset name already Exists', 400);
            }

            VicidialXferPreset::insert($data);

            // Admin log
            $admin_log_data['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log_data['user'] = $user->x5_contact_id;
            $admin_log_data['ip_address'] = $this->clientIp();
            $admin_log_data['event_section'] = 'CAMPAIGN_PRESET';
            $admin_log_data['event_type'] = 'ADD';
            $admin_log_data['record_id'] = $data['campaign_id'];
            $admin_log_data['event_code'] = 'ADMIN ADD CAMPAIGN PRESET';
            $admin_log_data['event_sql'] = 'INSERT INTO vicidial_xfer_presets (preset_name, preset_number, preset_dtmf,preset_hide_number,campaign_id) VALUES (' . $data['preset_name'] . ',' . $data['preset_number'] . ',' . $data['preset_dtmf'] . ',' . $data['preset_hide_number'] . ',' . $data['campaign_id'] . ');';
            $admin_log_data['event_notes'] = 'Preset:';
            $admin_log_data['user_group'] = '';
            VicidialAdminLog::insert($admin_log_data);

            return response()->json(['status' => 200, 'msg' => 'Call Transfer Preset added Successfully.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.CallTransferPresetController'), $e);
            throw $e;
        }
    }

    /**
     * Update call transfer preset
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function updateCallTransferPreset(Request $request) {
        try {

            Validator::make($request->all(), [
                'campaign_id' => 'required',
                'presets' => 'required|array',
            ])->validate();

            $campaign_id = $request->campaign_id;
            $presets = $request->presets;
            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $campaign_ids = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE, $current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_CAMPAIGN_CALL_TRANSFER_PRESENT, $campaign_ids)) {
                throw new Exception('Cannot update campaign call transfer preset, you might not have permission to do this.', 400);
            }

            foreach ($presets as $key => $preset) {

                $update_preset['preset_number'] = $preset['preset_number'] ?: '';
                $update_preset['preset_dtmf'] = $preset['preset_dtmf'] ?: '';
                $update_preset['preset_hide_number'] = $preset['preset_hide_number'] ?: '';
                $update_preset['preset_order'] = $preset['preset_order'] ?: '';
                VicidialXferPreset::where('campaign_id', $campaign_id)->where('preset_name', $preset['preset_name'])->update($update_preset);

                // Admin log
                $admin_log_data['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                $admin_log_data['user'] = $user->x5_contact_id;
                $admin_log_data['ip_address'] = $this->clientIp();
                $admin_log_data['event_section'] = 'CAMPAIGN_PRESET';
                $admin_log_data['event_type'] = 'MODIFY';
                $admin_log_data['record_id'] = $campaign_id;
                $admin_log_data['event_code'] = 'ADMIN MODIFY CAMPAIGN PRESET';
                $admin_log_data['event_sql'] = 'UPDATE vicidial_xfer_presets SET preset_dtmf=' . $preset['preset_dtmf'] . ',preset_number=' . $preset['preset_number'] . ',preset_hide_number=' . $preset['preset_hide_number'] . ' where campaign_id=' . $campaign_id . ' and preset_name=' . $preset['preset_name'] . ';';
                $admin_log_data['event_notes'] = '';
                $admin_log_data['user_group'] = '';
                VicidialAdminLog::insert($admin_log_data);
            }

            return response()->json(['status' => 200, 'msg' => (count($presets) === 1) ? 'Call Transfer Preset updated Successfully.' : 'Call Transfer Order updated Successfully.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.CallTransferPresetController'), $e);
            throw $e;
        }
    }

    /**
     * Delete call transfer preset
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function deleteCallTransferPreset(Request $request) {
        try {

            $data = $request->only('campaign_id', 'preset_name');

            Validator::make($data, [
                'campaign_id' => 'required',
                'preset_name' => 'required',
            ])->validate();

            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $campaign_ids = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_DELETE, $current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_CAMPAIGN_CALL_TRANSFER_PRESENT, $campaign_ids)) {
                throw new Exception('Cannot delete campaign call transfer preset, you might not have permission to do this.', 400);
            }

            $total_count = VicidialXferPreset::where('campaign_id', $data['campaign_id'])->where('preset_name', $data['preset_name'])->count();
            if ($total_count === 0) {
                throw new Exception('We can not locate your campaign, please check your input.', 400);
            }

            VicidialXferPreset::where('campaign_id', $data['campaign_id'])->where('preset_name', $data['preset_name'])->delete();

            // Admin log
            $admin_log_data['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log_data['user'] = $user->x5_contact_id;
            $admin_log_data['ip_address'] = $this->clientIp();
            $admin_log_data['event_section'] = 'CAMPAIGN_PRESET';
            $admin_log_data['event_type'] = 'DELETE';
            $admin_log_data['record_id'] = $data['campaign_id'];
            $admin_log_data['event_code'] = 'ADMIN DELETE CAMPAIGN PRESET';
            $admin_log_data['event_sql'] = 'DELETE FROM vicidial_xfer_presets where campaign_id=' . $data['campaign_id'] . ' and preset_name=' . $data['preset_name'] . ';';
            $admin_log_data['event_notes'] = '';
            $admin_log_data['user_group'] = '';
            VicidialAdminLog::insert($admin_log_data);

            return response()->json(['status' => 200, 'msg' => 'Call Transfer Preset delete Successfully.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.CallTransferPresetController'), $e);
            throw $e;
        }
    }

}
