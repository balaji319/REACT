<?php

namespace App\Http\Controllers\Campaigns;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use \App\Traits\ErrorLog;
use \App\Traits\AccessControl;
use \App\Traits\Helper;
use App\VicidialAdminLog;
use App\Http\Requests\CampaignListMixRequest;
use App\X5ContactAccess;
use App\VicidialCampaignListMix;
use App\VicidialCampaign;
use Exception;

class CampaignListMixController extends Controller {

    use ErrorLog,
        AccessControl,
        Helper;

    /**
     * Campaign list mix list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function campaignListMix(Request $request) {
        try {

            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $campaign_id = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_CAMPAIGN, ACCESS_READ, $current_company_id, $user);
            $limit = $request->get('limit') ?: \Config::get("configs.pagination_limit");
            $search = $request->get('search') ?: NULL;

            $campaigns = VicidialCampaign::campaignsStatusList($campaign_id, $search, $limit);
            $list_mix = VicidialCampaignListMix::whereIn('campaign_id', $campaign_id)->select('vcl_id', 'campaign_id')->get();
            $list_mix = $list_mix->groupBy('campaign_id')->toArray();
            foreach ($campaigns as $campaign) {
                if (isset($list_mix[$campaign->campaign_id])) {
                    $campaign->list_mix = implode(' ', array_column($list_mix[$campaign->campaign_id], 'vcl_id'));
                } else {
                    $campaign->list_mix = 'NONE';
                }
            }

            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $campaigns]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Get campaign mix options lists
     *
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function getCampaignMixOptionLists(Request $request) {
        try {

            $campaign_id = $request->campaign_id;
            $with_list = isset($request->list) ? false : true;
            $statuses = \App\VicidialStatuses::select('status')->selectRaw("CONCAT(status, ' - ', status_name) as option_title")->orderBy('status', 'asc')->get();
            $campaign_statuses = \App\VicidialCampaignStatuses::select('status')->selectRaw("CONCAT(status, ' - ', status_name) as option_title")->where('campaign_id', $campaign_id)->orderBy('status', 'asc')->get();
            $result_array['dial_status'] = $statuses->merge($campaign_statuses);
            if ($with_list) {
                $result_array['campaign_id'] = $campaign_id;
                $result_array['lists'] = \App\VicidialLists::select('list_id', 'list_name')->where('campaign_id', $campaign_id)->orderBy('list_id')->get();
            }

            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $result_array]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Add campaign mix list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function addCampaignMixList(CampaignListMixRequest $request) {
        try {

            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $campaign_ids = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_CREATE, $current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_CAMPAIGN_CAMPAIGN_LIST_MIX, $campaign_ids)) {
                throw new Exception('Cannot create campaign mix list, you might not have permission to do this.', 400);
            }
            $data = $request->all();
            unset($data['current_company_id']);
            unset($data['current_application_dns']);
            unset($data['url']);
            VicidialCampaignListMix::insert($data);

            // Admin log
            $admin_log_data['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log_data['user'] = $user->x5_contact_id;
            $admin_log_data['ip_address'] = $this->clientIp();
            $admin_log_data['event_section'] = "CAMPAIGN_LISTMIX";
            $admin_log_data['event_type'] = "ADD";
            $admin_log_data['record_id'] = $data['vcl_id'];
            $admin_log_data['event_code'] = "ADMIN ADD CAMPAIGN LIST MIX";
            $admin_log_data['event_sql'] = 'INSERT INTO vicidial_campaigns_list_mix SET vcl_id=' . $data['vcl_id'] . ', vcl_name=' . $data['vcl_name'] . ',mix_method=' . $data['mix_method'] . ',list_mix_container=, campaign_id=' . $data['campaign_id'] . ';';
            $admin_log_data['event_notes'] = '';
            $admin_log_data['user_group'] = '';
            VicidialAdminLog::insert($admin_log_data);

            // Add full permission to user after create
            $x5_contact_access['model'] = ACCESS_MODEL_CONTACT;
            $x5_contact_access['foreign_key'] = $user->x5_contact_id;
            $x5_contact_access['type'] = ACCESS_TYPE_SYSTEM_COMPONENT;
            $x5_contact_access['link_id'] = $data['vcl_id'];
            $x5_contact_access['_create'] = 0;
            $x5_contact_access['_read'] = 1;
            $x5_contact_access['_update'] = 1;
            $x5_contact_access['_delete'] = 1;
            X5ContactAccess::insert($x5_contact_access);

            return response()->json(['status' => 200, 'msg' => 'Recored added successfully.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql  '), $e);
            throw $e;
        }
    }

}
