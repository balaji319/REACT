<?php

/*
 * Controller for admin utilities dnc number module
 * @author Balaji<balaji@ytel.com>
 *
 */

namespace App\Http\Controllers\Globals;

use Illuminate\Support\Facades\DB;
use App\Traits\AccessControl;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\VicidialCampaigns;
use App\VicidialUserGroup;
use Illuminate\Support\Facades\Input;
use Exception;
use App\Traits\ErrorLog;
use App\VicidialUsers;
use App\VicidialCampaign;
use App\VicidialScript;
use App\VicidialInboundGroup;
use App\VicidialCallTime;
use App\VicidialMusicOnHold;
use App\VicidialCallMenu;
use App\VicidialFilterPhoneGroup;
use App\VicidialInboundDid;
use App\VicidialCampaignCidAreacode;
use App\VicidialLeadFilter;
use App\Phone;
use App\VicidialLists;
use App\VicidialVoicemail;
use App\X5Contact;



class GlobalController extends Controller {


    use ErrorLog,
    AccessControl;

    /**
     * Get voice mail list
     * @author Balaji Pastapure<
     * @param Request $request
     * @return array
     */
    public function getall(Request $request) {

        $result_array = [];

        $array_camp_data = VicidialCampaigns::getCampaignsIdDropdown();
        $array_user_data = VicidialUserGroup::getUserGroupList();

        $result_array['camp_data'] = $array_camp_data;
        $result_array['agent_data'] = $array_user_data;

        return $result_array;
    }

    /**
     * Get reusable list
     * @param Request $request
     * @return array
     */

    public function globalApi(Request $request,X5Contact $x5contact_obj){
        try{
            $request->validate(['case' => 'required | array']);

        $case = $request->input('case');
        $return_array = [];
        if(in_array("cam", $case)){     //For all campaign list.
            $return_array["campaign"]= VicidialCampaigns::select('campaign_id', 'campaign_name')->get();
        }

        if(in_array("camp_only", $case)){     //For all campaign list.
            $option_title =  VicidialCampaigns::selectRaw('CONCAT(campaign_id," - ",campaign_name) as name')->get()->toArray();
            $return_array["camp_only"] = array_column($option_title, 'name');
            array_unshift($return_array["camp_only"], 'ALL-ACTIVE');
        }
        if(in_array("agent_c", $case)){    //agent with condition
            $return_array["agent_c"]= VicidialUsers::select('user_id', 'user','full_name')
            ->where([
                ['user', '!=', 'VDAD'],
                ['user', '!=', 'VDCL'],
                ['user_level', '<>' , 9]
            ])->get();
        }

        if(in_array("agent", $case)){       //All agent without condition.
            $return_array["agent"]= VicidialUsers::select('user_id','user','full_name')->get();
        }
         //**********user group*******

        if(in_array("agentgroup", $case)){              //agent group information .
            $return_array["agentgroup"]= VicidialUserGroup::select('user_group','group_name')->get();
        }

        if(in_array("agentgroup_custom", $case)){              //agent group information .
            $return_array["agentgroup_custom"]= VicidialUserGroup::select('user_group as id','group_name as label')->get();
        }
        if(in_array("voicemail", $case)){              //agent group information
            $return_array["phoneListData"]=  Phone::select('voicemail_id', 'fullname', 'email')->orderBy('dialplan_number')->get();
            $return_array["voicemail"]=  VicidialVoicemail::select('voicemail_id', 'fullname', 'email')->orderBy('voicemail_id')->get();
        }

        //***********inbound queue update api******************
        if(in_array("scriptlist", $case)){
            $return_array["scriptlist"]= VicidialScript::select('script_id')->get();

        }
        if(in_array("inboundgroupoption", $case)){
            $return_array["inboundgroupoption"]=VicidialInboundGroup::select('group_id')->get();

        }
        if(in_array("calltime", $case)){
            $return_array["calltimelist"]=VicidialCallTime::select('call_time_id','call_time_name')->get();

        }
        if(in_array("musiconhold", $case)){
            $return_array["musiconhold"]=VicidialMusicOnHold::where('active','Y')->orderBy('moh_id')->select('moh_id')->get();

        }
        if(in_array("callmenu", $case)){
            $return_array["callmenu"]=VicidialCallMenu::orderBy('menu_id')->select('menu_id')->get();

        }

        if(in_array("phongroup", $case)){
            $return_array["phongroup"]=VicidialFilterPhoneGroup::orderBy('filter_phone_group_id')->select('filter_phone_group_id','filter_phone_group_name')->get();

        }
        //*************script*************
        if(in_array("script", $case)){
            $return_array["script"]=VicidialScript::orderBy('script_id')->select('script_id')->get();

        }

        if (in_array('did_pattern_list', $case)) {
            $return_array['did_pattern_list'] = VicidialInboundDid::orderBy('did_pattern', 'desc')->select('did_pattern')->get();
        }


        if (in_array('clone_did_ids', $case)) {
            $user = $request->user();
            $per=$this->getListByAccess(ACCESS_TYPE_CAMPAIGN, ACCESS_READ,$user);

            $return_array['clone_did_ids'] = VicidialInboundDid::whereIn('campaign_id',$per)->orderBy('did_pattern', 'desc')->select('did_pattern')->get();
        }

        if (in_array('did_ids', $case)) {
            $user = $request->user();
            $per=$this->getListByAccess(ACCESS_TYPE_CAMPAIGN, ACCESS_READ,$user);
            $return_array['did_ids'] = VicidialInboundDid::whereIn('campaign_id',$per)->orderBy('did_pattern', 'desc')->select('did_pattern')->get();
        }
        if (in_array('dids', $case)) {
              $list_listing=VicidialInboundDid::orderBy('did_pattern')->get();

            $list = $main = array();
            foreach ($list_listing as $key => $value) {

                if ($value == null) {
                    $main[$key] = '';
                } else {
                    $main[$key] = $value;
                }
                $areacodelist=VicidialCampaignCidAreacode::where('campaign_id',$value->campaign_id)->get();
                $main[$key]['tot_area_codes'] = count($areacodelist);
            }
                array_push($list, $main);
                unset($main);
                $main = array();

                $return_array["dids"]=$list;
        }
        if (in_array('phoneList', $case)) {
            $list = Phone::getAll();
            $return_array['phoneList'] =  $list;
        }

        if (in_array('campaignlist', $case)) {

            $user = $request->user();

            $per=$this->getListByAccess(ACCESS_TYPE_CAMPAIGN, ACCESS_READ,$user);

            $return_array['campaignlist']=VicidialCampaigns::whereIn('use_campaign_dnc', ['Y','AREACODE'])->whereIn('campaign_id',$per)->orderBy('campaign_id', 'desc')->select('campaign_id','campaign_name')->get();

        }

        if (in_array('lead_filter_list', $case)) {

            $return_array['lead_filter_list'] = VicidialLeadFilter::orderBy('lead_filter_name', 'desc')->select('lead_filter_id','lead_filter_name')->get();
        }
        if (in_array('custom_fields_list', $case)) {

            $return_array['custom_fields_list'] = VicidialLists::orderBy('list_id', 'desc')->select('list_id','list_name')->get();
        }

        /*Ytel user List*/
        if (in_array('ytel_user', $case)) {
            $current_company_id = $request->current_company_id;
            $user = $request->user();

            $allowed_cntct_grp = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_X5_CONTACT_GROUP, ACCESS_READ, $current_company_id, $user);
            $return_array['ytel_user'] = $x5contact_obj->getYccGrpListAll($allowed_cntct_grp,$current_company_id);
        }

        return response()->json([
                'status'=>200,
                'message' => 'Global Data !',
                'data'=> $return_array
            ]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.global'), $e);
            throw $e;
        }
    }

}