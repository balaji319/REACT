<?php

namespace App\Http\Controllers\Campaigns;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use \App\Traits\ErrorLog;
use \App\Traits\AccessControl;
use \App\Traits\Helper;
use Exception;
use App\Http\Requests\LeadRecycleRequest;
use App\VicidialAdminLog;
use App\X5ContactAccess;
use App\VicidialLeadRecycle;
use App\VicidialCampaign;
use Validator;

class LeadRecycleController extends Controller {

    use ErrorLog,
        AccessControl,
        Helper;

    /**
     * Lead recycle list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function leadRecycleList(Request $request) {
        try {

            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $campaign_id = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_CAMPAIGN, ACCESS_READ, $current_company_id, $user);
            $limit = $request->get('limit') ?: \Config::get("configs.pagination_limit");
            $search = $request->get('search') ?: NULL;

            $campaigns = VicidialCampaign::campaignsStatusList($campaign_id, $search, $limit);
            $lead_recycle = VicidialLeadRecycle::whereIn('campaign_id', $campaign_id)->select('recycle_id', 'campaign_id')->get();
            $lead_recycle = $lead_recycle->groupBy('campaign_id')->toArray();
            foreach ($campaigns as $campaign) {
                if (isset($lead_recycle[$campaign->campaign_id])) {
                    $campaign->modify = true;
                } else {
                    $campaign->modify = false;
                }
            }

            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $campaigns]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Add campaign lead recycle
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function addCampaignLeadRecycle(LeadRecycleRequest $request) {
        try {

            Validator::make($request->all(), [
                'campaign_id' => 'required',
                'status' => 'required',
            ])->validate();
            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $campaign_ids = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_CREATE, $current_company_id, $user);
            if (!in_array(SYSTEM_COMPONENT_CAMPAIGN_LEAD_RECYCLE, $campaign_ids)) {
                throw new Exception('Cannot create campaign lead recycle, you might not have permission to do this.', 400);
            }

            $is_exists = VicidialLeadRecycle::where('campaign_id', $request->campaign_id)->where('status', $request->status)->count();
            if ($is_exists > 0) {
                throw new Exception('There is already a lead-recycle for this campaign with this status.', 400);
            }

            $lead_recycle = new VicidialLeadRecycle();
            $lead_recycle->campaign_id = $request->campaign_id;
            $lead_recycle->status = $request->status;
            $lead_recycle->attempt_delay = $request->attempt_delay;
            $lead_recycle->attempt_maximum = $request->attempt_maximum;
            $lead_recycle->active = $request->active;
            $lead_recycle->save();

            // Admin log
            $admin_log_data['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log_data['user'] = $user->x5_contact_id;
            $admin_log_data['ip_address'] = $this->clientIp();
            $admin_log_data['event_section'] = "CAMPAIGN_RECYCLE";
            $admin_log_data['event_type'] = "ADD";
            $admin_log_data['record_id'] = $lead_recycle->recycle_id;
            $admin_log_data['event_code'] = "ADMIN ADD CAMPAIGN LEAD RECYCLE";
            $admin_log_data['event_sql'] = 'INSERT INTO vicidial_lead_recycle SET recycle_id=' . $request->recycle_id . ',campaign_id=' . $request->campaign_id . ',status=' . $request->status . ',attempt_delay=' . $request->attempt_delay . ',attempt_maximum=' . $request->attempt_maximum . ',active=' . $request->active;
            $admin_log_data['event_notes'] = '';
            $admin_log_data['user_group'] = '';
            VicidialAdminLog::insert($admin_log_data);

            // Add full permission to user after create
            $x5_contact_access['model'] = ACCESS_MODEL_CONTACT;
            $x5_contact_access['foreign_key'] = $user->x5_contact_id;
            $x5_contact_access['type'] = ACCESS_TYPE_SYSTEM_COMPONENT;
            $x5_contact_access['link_id'] = $lead_recycle->recycle_id;
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

    /**
     * Edit lead recycle list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function editLeadRecycleList(Request $request) {
        try {

            Validator::make($request->all(), [
                'campaign_id' => 'required',
            ])->validate();

            $lead_recycle_list = VicidialLeadRecycle::select('recycle_id', 'campaign_id', 'status', 'attempt_delay', 'attempt_maximum', 'active')->where('campaign_id', $request->campaign_id)->get();
            return response()->json(['status' => 200, 'msg' => 'Success', 'data' => $lead_recycle_list]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql  '), $e);
            throw $e;
        }
    }

    /**
     * Update lead recycle
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function updateLeadRecycle(LeadRecycleRequest $request) {
        try {

            Validator::make($request->all(), [
                'recycle_id' => 'required|exists:dyna.vicidial_lead_recycle,recycle_id',
                    ], [
                'recycle_id.exists' => 'No Lead Recycles for this Campaign'
            ])->validate();
            $user = $request->user();
            $recycle_id = $request->recycle_id;

            $lead_recycle = VicidialLeadRecycle::find($recycle_id);
            $lead_recycle->attempt_delay = $request->attempt_delay;
            $lead_recycle->attempt_maximum = $request->attempt_maximum;
            $lead_recycle->active = $request->active;
            $lead_recycle->update();

            // Admin log
            $admin_log_data['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log_data['user'] = $user->x5_contact_id;
            $admin_log_data['ip_address'] = $this->clientIp();
            $admin_log_data['event_section'] = 'CAMPAIGN_RECYCLE';
            $admin_log_data['event_type'] = 'MODIFY';
            $admin_log_data['record_id'] = $recycle_id;
            $admin_log_data['event_code'] = 'ADMIN MODIFY CAMPAIGN LEAD RECYCLE';
            $admin_log_data['event_sql'] = 'UPDATE vicidial_lead_recycle SET attempt_delay=' . $lead_recycle->attempt_delay . ',attempt_maximum=' . $lead_recycle->attempt_maximum . ',active=' . $lead_recycle->active . ' where recycle_id=' . $recycle_id . ';';
            $admin_log_data['event_notes'] = '';
            $admin_log_data['user_group'] = '---ALL---';

            VicidialAdminLog::insert($admin_log_data);

            return response()->json(['status' => 200, 'msg' => 'Recored updated successfully.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql  '), $e);
            throw $e;
        }
    }

    /**
     * Delete lead recycle
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function deleteLeadRecycle(Request $request) {
        try {

            Validator::make($request->all(), [
                'recycle_id' => 'required|exists:dyna.vicidial_lead_recycle,recycle_id',
                    ], [
                'recycle_id.exists' => 'No Lead Recycles for this Campaign'
            ])->validate();
            $user = $request->user();
            $recycle_id = $request->recycle_id;

            $lead_recycle = VicidialLeadRecycle::where('recycle_id', $recycle_id)->delete();

            // Admin log
            $admin_log_data['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log_data['user'] = $user->x5_contact_id;
            $admin_log_data['ip_address'] = $this->clientIp();
            $admin_log_data['event_section'] = 'CAMPAIGN_RECYCLE';
            $admin_log_data['event_type'] = 'DELETE';
            $admin_log_data['record_id'] = $recycle_id;
            $admin_log_data['event_code'] = 'ADMIN DELETE CAMPAIGN LEAD RECYCLE';
            $admin_log_data['event_sql'] = 'DELETE FROM vicidial_lead_recycle where recycle_id=' . $recycle_id . ';';
            $admin_log_data['event_notes'] = '';
            $admin_log_data['user_group'] = '---ALL---';

            VicidialAdminLog::insert($admin_log_data);

            return response()->json(['status' => 200, 'msg' => 'Recored deleted successfully.']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql  '), $e);
            throw $e;
        }
    }

}
