<?php

/*
 * Controller for admin utilities dnc number module
 * @author om<om@ytel.com>
 * 
 */
namespace App\Http\Controllers\AdminUtilities;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Http\Requests\LeadFilterRequest;
use App\Http\Requests\LeadFilterCloneRequset;
use App\Http\Controllers\Controller;
use App\Traits\AccessControl;
use App\Traits\ErrorLog;
use App\Traits\Helper;
use App\VicidialVoicemail;
use App\VicidialAdminLog;
use App\VicidialUserGroup;
use App\VicidialShifts;
use App\SystemSetting;
use App\VicidialLeadFilter;
use App\X5Log;
use App\VicidialLists;
use App\VicidialCampaign;
use App\VicidialCallTime;
use App\VicidialList;
use App\Http\Controllers\AdminUtilities\AdminUtilitiesConstants as AdminUtilities;
use App\Http\Controllers\AdminUtilities\AdminUtilitiesErrors;
use Illuminate\Support\Facades\Input;
use Exception;

class LeadsfilterController extends Controller {

    use ErrorLog,
        AccessControl,
        Helper;
    /**
     * Get voice mail list
     * @author shital chavan<shital@ytel.com>
     * @param Request $request
     * @return array
     */
    public function leadLists(Request $request) {
        try {

            $limit = $request->get('limit') ?: \Config::get("configs.pagination_limit");
            $search = $request->get('search') ?: NULL;

            $list = VicidialLeadFilter::getAll($search, $limit);

            return response()->json(['status' => 200,'data' => $list,'msg' => "Success."],200);

          
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }
      /**
     * To add new lead filter
     * @author Shital cavan<shital@xoyal.com>
     * @param Request $request
     * @return json
     */
    public function store(LeadFilterRequest $request)
    {
        try {

            $user = $request->user();
            $current_company_id = $request->current_company_id;
          
            $access_type_list = $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_CREATE, $user);

            if (!empty((SYSTEM_COMPONENT_ADMIN_LEAD_FILTER_LIST) && !in_array(SYSTEM_COMPONENT_ADMIN_LEAD_FILTER_LIST, $access_type_list))) {
                throw new Exception('Cannot store Lead filter.',404);
            }
        
             if (VicidialLeadFilter::duplicateRecords($request['lead_filter_id'])== 0) {
                $add_leadfilter=VicidialLeadFilter::create($request->all());

                 $lastInsertId=$add_leadfilter->lead_filter_id;
            
                if ($add_leadfilter) {

                    $admin_log = new VicidialAdminLog();

                    $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                    $admin_log['user'] = $user->x5_contact_id;
                    $admin_log['ip_address'] = $this->clientIp();
                    $admin_log['event_section'] = "FILTERS";
                    $admin_log['event_type'] = "ADD";
                    $admin_log['record_id'] = $request['lead_filter_id'];
                    $admin_log['event_code'] = "ADMIN ADD FILTERS";
                    $admin_log['event_sql'] ="INSERT INTO vicidial_lead_filters SET lead_filter_id='".$request['lead_filter_id']."',lead_filter_name='".$request['lead_filter_name']."',lead_filter_comments='".$request['lead_filter_comments']."',lead_filter_sql='".$request['lead_filter_sql']."'";
                    $admin_log['event_notes'] = "";
                    
                    $admin_log->save();


                    $x5_log_data=new X5Log;
                    $x5_log_data['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
                    $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
                    $x5_log_data['company_id'] = $user->company_id;
                    $x5_log_data['user_ip'] = $this->clientIp();
                    $x5_log_data['class'] = "LeadsfilterController";
                    $x5_log_data['method'] = __FUNCTION__;
                    $x5_log_data['model'] = User::class;
                    $x5_log_data['action_1'] = "ADD";
                    $x5_log_data->save();

                    # Add code for server setting
                    return response()->json(['status' => 200,'msg' => "Success"],200);
                    
                } else {
                    throw new Exception('validation error', 400);
                }
            } else {
                
                    throw new Exception('This record is already present.', 400);
            }
            
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }
     /**
     * To edit lead filter
     * @author Shital<shital@ytel.com>
     * @param $lead_filter_id
     * @return json
     */
     public function edit($lead_filter_id)
     {
         try {
            if (!isset($lead_filter_id) || $lead_filter_id == '') {
                throw new Exception('Request parameter `lead_filter_id` is empty', 400);
            }
             $leadfilter_data = VicidialLeadFilter::find($lead_filter_id);

                if (!$leadfilter_data) {
                     throw new Exception('This record is not present.', 404);
                }
                return response()->json(['status' => 200,'data' => $leadfilter_data,'msg' => "Success."],200);
        } catch (Exception $e) {
             $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
     }
      /**
     * To update lead filter
     * @author Shital<shital@ytel.com>
     * @param Request $request
     * @return json
     */
    public function update(LeadFilterRequest $request)
    {
         try {

            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $access_type_list = $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE, $user);
            if (!empty((SYSTEM_COMPONENT_ADMIN_LEAD_FILTER_LIST) && !in_array(SYSTEM_COMPONENT_ADMIN_LEAD_FILTER_LIST, $access_type_list))) {
                throw new Exception('Cannot update lead filter.',400);
            }

            $originData = VicidialLeadFilter::find($request['lead_filter_id']);
            $modify_script = $originData->fill($request->all());
            $modify_script->save();

            $que = str_replace(array('{', '}'), ' ', $modify_script);
            $que = str_replace(array(':'), '=', $que);

           
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
            $admin_log['event_section'] = "FILTERS";
            $admin_log['event_type'] = "MODIFY";
            $admin_log['record_id'] = $request['lead_filter_id'];
            $admin_log['event_code'] = "ADMIN MODIFY FILTERS";
            $admin_log['event_sql'] = "UPDATE vicidial_lead_filters SET " . $que." where lead_filter_id='".$request['lead_filter_id']."'";
            $admin_log['event_notes'] = "";
            $admin_log->save();

                    $x5_log_data=new X5Log;
                    $x5_log_data['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
                    $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
                    $x5_log_data['company_id'] = $user->company_id;
                    $x5_log_data['user_ip'] = $this->clientIp();
                    $x5_log_data['class'] = "LeadsfilterController";
                    $x5_log_data['method'] = __FUNCTION__;
                    $x5_log_data['model'] = User::class;
                    $x5_log_data['action_1'] = "MODIFY";
                    $x5_log_data->save();


              return response()->json(['status' => 200,'msg' => "Successfully Updated"],200);
            
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

     /**
     * To clone lead filter
     * @author Shital cavan<shital@xoyal.com>
     * @param Request $request
     * @return json
     */
     public function clone(LeadFilterCloneRequset $request)
     {
        try {
             $user = $request->user();
            $current_company_id = $request->current_company_id;
          
           $access_type_list = $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE, $user);
            if (!empty((SYSTEM_COMPONENT_ADMIN_LEAD_FILTER_LIST) && !in_array(SYSTEM_COMPONENT_ADMIN_LEAD_FILTER_LIST, $access_type_list))) {
                throw new Exception('Error.',400);
            }
            
            $duplicate_id=VicidialLeadFilter::checkIsExist($request['new_id']);
              
            if ($duplicate_id) {
                throw new Exception('Your account do not have any system associated. Please contact Ytel support. (Error Code: ER-X5A-L-1)',401);
            }

            $leadfilter_data=VicidialLeadFilter::checkIsExist($request['from_id']);

            
            if (!$leadfilter_data) {
                throw new Exception('We can not locate your lead filter, please check your input.', 400);
            }

             $data=VicidialLeadFilter::getData($request['from_id']);

            unset($data['lead_filter_id']);

            

            $data['lead_filter_id']=$request['new_id'];
      

            $done=VicidialLeadFilter::create($data);

            if (!$done) {
                throw new Exception('Data could not save properly', 400);
            }
                $admin_log = new VicidialAdminLog();

                    $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                    $admin_log['user'] = $user->x5_contact_id;
                    $admin_log['ip_address'] = $this->clientIp();
                    $admin_log['event_section'] = "FILTERS";
                    $admin_log['event_type'] = "COPY";
                    $admin_log['record_id'] = $request['new_id'];
                    $admin_log['event_code'] = "ADMIN COPY FILTERS";
                    $admin_log['event_sql'] ="INSERT INTO vicidial_lead_filters SET lead_filter_id='".$done->lead_filter_id."',lead_filter_name='".$done->lead_filter_name."',lead_filter_comments='".$done->lead_filter_comments."',lead_filter_sql='".$done->lead_filter_sql."'";
                    $admin_log['event_notes'] = "";
                    
                    $admin_log->save();


                    $x5_log_data=new X5Log;
                    $x5_log_data['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
                    $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
                    $x5_log_data['company_id'] = $user->company_id;
                    $x5_log_data['user_ip'] = $this->clientIp();
                    $x5_log_data['class'] = "LeadsfilterController";
                    $x5_log_data['method'] = __FUNCTION__;
                    $x5_log_data['model'] = User::class;
                    $x5_log_data['action_1'] = "COPY";
                    $x5_log_data->save();

           return response()->json(['status' => 200,'msg' => "Success"],200); 

             
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
     }
      /**
     * To delete lead_filter
     * @author Shital<shital@ytel.com>
     * @param $lead_filter_id
     * @return json
     */
    public function destroy(Request $request)
    {
        try {
             $user = $request->user();
            if ($request['lead_filter_id']!='') {
                $lead_filter = VicidialLeadFilter::find($request['lead_filter_id']);
                if ($lead_filter) {
                    $lead_filter->delete();

                     $admin_log = new VicidialAdminLog();

                    $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                    $admin_log['user'] = $user->x5_contact_id;
                    $admin_log['ip_address'] = $this->clientIp();
                    $admin_log['event_section'] = "FILTERS";
                    $admin_log['event_type'] = "DELETE";
                    $admin_log['record_id'] = $request['lead_filter_id'];
                    $admin_log['event_code'] = "ADMIN DELETE FILTERS";
                    $admin_log['event_sql'] ="DELETE from vicidial_lead_filters where lead_filter_id='".$request['lead_filter_id']."'";
                    $admin_log['event_notes'] = "";
                    $admin_log['user_group'] = "---ALL---";
                    return response()->json(['status' => 200,'msg' => "Lead filter deleted successfully! "],200);
                } else {
                     throw new Exception('Record not found', 400);
                }
            }
           
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
                
    }

    public function testOnCampaign(Request $request)
    {

        try {
            ini_set('max_execution_time', 300);
            $campaign_id = $request['campaign'];

            $lead_filter_id = $request['lead_filter_id'];
            $filters_to_print=VicidialLeadFilter::select('lead_filter_id','lead_filter_name','lead_filter_sql')->orderBy('lead_filter_id')->get();
            $lp=0;
            foreach ($filters_to_print as $value) {
               
                 $filtersql_list[$value->lead_filter_id] = $value->lead_filter_sql;
            }


                $campaign_id = $request['campaign'];
                $lead_filter_id = $request['lead_filter_id'];
                if (isset($lead_filter_id)) 
                {
                 $lead_filter_id = strtoupper($lead_filter_id);
                 $lead_filter_id = preg_replace('/[^-_0-9a-zA-Z]/','',$lead_filter_id);
                }
        $query2=VicidialCampaign::select('dial_statuses','local_call_time','lead_filter_id','drop_lockout_time','call_count_limit')->find($campaign_id);

            $dial_statuses =        $query2->dial_statuses;
            $local_call_time =      $query2->local_call_time;
            $drop_lockout_time =    $query2->drop_lockout_time;
            $call_count_limit =     $query2->call_count_limit;
            if ($lead_filter_id=='')
            {
                $lead_filter_id =   $query2->lead_filter_id;
                if ($lead_filter_id=='') 
                {
                    $lead_filter_id='NONE';
                }
            }

            $query3=VicidialLists::select('list_id','active','list_name')->where('campaign_id',$campaign_id)->get();
          
            $camp_lists='';
            $camp_list_arr=[];
            $o=0;
           
            foreach ($query3 as $value) {
                if (preg_match('/Y/', $value->active))
                    {
                        $camp_lists .= "'$value->list_id',";
                        $camp_list_arr[]= $value->list_id;
                        
                    }
            }

             $camp_lists = preg_replace('/.$/i','',$camp_lists);
     
            $filterSQL = $filtersql_list[$lead_filter_id];//remove

         
            $filterSQL = preg_replace("/\\\\/","",$filterSQL);

            // return $filterSQL;         

            $filterSQL = preg_replace('/^and|and$|^or|or$/i', '',$filterSQL);
          
            if (strlen($filterSQL)>4)
                {$fSQL = $filterSQL;}
            else
                {$fSQL = '';}
            // return $fSQL;

            $data['campaign_id']=$campaign_id;
            $data['camp_lists']=$camp_lists;
            $data['lead_filter_id']=$lead_filter_id;
            $data['dial_statuses']=$dial_statuses;
            $data['local_call_time']=$local_call_time;
            $data['drop_lockout_time']=$drop_lockout_time;
            $data['call_count_limit']=$call_count_limit;

            $single_status=0;

            // $data['withfilter']=$this->dialable_leads($local_call_time,$dial_statuses,$camp_list_arr,$drop_lockout_time,$call_count_limit,$single_status,$fSQL);
             $data['withfilter']=$this->dialable_leads($local_call_time,$dial_statuses,$camp_list_arr,$drop_lockout_time,$call_count_limit,$single_status,$fSQL);
            $data['withoutfilter']=$this->dialable_leads($local_call_time,$dial_statuses,$camp_list_arr,$drop_lockout_time,$call_count_limit,$single_status,'');
 
         return response()->json(['status' => 200,'data'=>$data,'msg' =>"success! "],200);

        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }
public function dialable_leads($local_call_time,$dial_statuses,$camp_list_arr,$drop_lockout_time,$call_count_limit,$single_status,$fSQL)
{
    

        if (!empty($camp_list_arr))
        {
           
            if (count($camp_list_arr)>1)
            {
                 
                if (strlen($dial_statuses)>2)
                {

                
                    $g=0;
                    $p='13';
                    $GMT_gmt[0] = '';
                    $GMT_hour[0] = '';
                    $GMT_day[0] = '';
                    $query='';

                 $query=VicidialList::where('called_since_last_reset','N');
                  

                    while ($p > -13)
                    {
                        $pzone=3600 * $p;
                        $pmin=(gmdate("i", time() + $pzone));
                        $phour=( (gmdate("G", time() + $pzone)) * 100);
                        $pday=gmdate("w", time() + $pzone);
                        $tz = sprintf("%.2f", $p);  
                        $GMT_gmt[$g] = $tz;
                        $GMT_day[$g] = $pday;
                        $GMT_hour[$g] = ($phour + $pmin);
                        $p = ($p - 0.25);
                        $g++;
                    }

                        $stmt=VicidialCallTime::getSelect($local_call_time);

                  

                        $Gct_default_start =$stmt->ct_default_start;
                        $Gct_default_stop = $stmt->ct_default_stop;
                        $Gct_sunday_start = $stmt->ct_sunday_start;
                        $Gct_sunday_stop =   $stmt->ct_sunday_stop;
                        $Gct_monday_start =  $stmt->ct_monday_start;
                        $Gct_monday_stop =  $stmt->ct_monday_stop;
                        $Gct_tuesday_start = $stmt->ct_tuesday_start;
                        $Gct_tuesday_stop =   $stmt->ct_tuesday_stop;
                        $Gct_wednesday_start = $stmt->ct_wednesday_start;
                        $Gct_wednesday_stop =  $stmt->ct_wednesday_stop;
                        $Gct_thursday_start =  $stmt->ct_thursday_start;
                        $Gct_thursday_stop =  $stmt->ct_thursday_stop;
                        $Gct_friday_start =  $stmt->ct_friday_start;
                        $Gct_friday_stop =   $stmt->ct_friday_stop;
                        $Gct_saturday_start = $stmt->ct_saturday_start;
                        $Gct_saturday_stop =  $stmt->ct_saturday_stop;
                        $Gct_state_call_times = $stmt->ct_state_call_times;

                        $ct_states = '';
                        $ct_state_gmt_SQL = '';
                        $ct_srs=0;
                        $b=0;
                        $state_rules=array();

                    if (strlen($Gct_state_call_times)>2)
                    {
                            $state_rules = explode('|',$Gct_state_call_times);
                            $ct_srs = ((count($state_rules)) - 2);
                    }
                    while($ct_srs >= $b)
                    {
                        if (!empty($state_rules) && strlen($state_rules[$b])>1)
                        {

                                    $stmt=VicidialStateCallTime::getSelect($state_rules[$b]);

                              
                                $Gstate_call_time_id =    $stmt->state_call_time_id;
                                $Gstate_call_time_state = $stmt->state_call_time_state;
                                $Gsct_default_start =     $stmt->sct_default_start;
                                $Gsct_default_stop =      $stmt->sct_default_stop;
                                $Gsct_sunday_start =      $stmt->sct_sunday_start;
                                $Gsct_sunday_stop =       $stmt->sct_sunday_stop;
                                $Gsct_monday_start =      $stmt->sct_monday_start;
                                $Gsct_monday_stop =       $stmt->sct_monday_stop;
                                $Gsct_tuesday_start =     $stmt->sct_tuesday_start;
                                $Gsct_tuesday_stop =      $stmt->sct_tuesday_stop;
                                $Gsct_wednesday_start =   $stmt->sct_wednesday_start;
                                $Gsct_wednesday_stop =    $stmt->sct_wednesday_stop;
                                $Gsct_thursday_start =    $stmt->sct_thursday_start;
                                $Gsct_thursday_stop =     $stmt->sct_thursday_stop;
                                $Gsct_friday_start =      $stmt->sct_friday_start;
                                $Gsct_friday_stop =       $stmt->sct_friday_stop;
                                $Gsct_saturday_start =    $stmt->sct_saturday_start;
                                $Gsct_saturday_stop =     $stmt->sct_saturday_stop;

                                $ct_states .="'$Gstate_call_time_state',";


                                $r=0;
                                $state_gmt=['99'];
                            while($r < $g)
                            {
                                if ($GMT_day[$r]==0)    #### Sunday local time
                                {
                                    if (($Gsct_sunday_start==0) and ($Gsct_sunday_stop==0))
                                    {
                                        if ( ($GMT_hour[$r]>=$Gsct_default_start) and ($GMT_hour[$r]<$Gsct_default_stop) )
                                                {$state_gmt[]=$GMT_gmt[$r];}
                                    } else {
                                        if ( ($GMT_hour[$r]>=$Gsct_sunday_start) and ($GMT_hour[$r]<$Gsct_sunday_stop) )
                                                {$state_gmt[]=$GMT_gmt[$r];}
                                    }
                                }
                                if ($GMT_day[$r]==1)    #### Monday local time
                                {
                                    if (($Gsct_monday_start==0) and ($Gsct_monday_stop==0))
                                    {
                                            if ( ($GMT_hour[$r]>=$Gsct_default_start) and ($GMT_hour[$r]<$Gsct_default_stop) )
                                                {$state_gmt[]=$GMT_gmt[$r];}
                                    } else {
                                            if ( ($GMT_hour[$r]>=$Gsct_monday_start) and ($GMT_hour[$r]<$Gsct_monday_stop) )
                                                {$state_gmt[]=$GMT_gmt[$r];}
                                    }
                                }
                                if ($GMT_day[$r]==2)    #### Tuesday local time
                                {
                                    if (($Gsct_tuesday_start==0) and ($Gsct_tuesday_stop==0))
                                    {
                                            if ( ($GMT_hour[$r]>=$Gsct_default_start) and ($GMT_hour[$r]<$Gsct_default_stop) )
                                                {$state_gmt[]=$GMT_gmt[$r];}
                                    } else {
                                            if ( ($GMT_hour[$r]>=$Gsct_tuesday_start) and ($GMT_hour[$r]<$Gsct_tuesday_stop) )
                                                {$state_gmt[]=$GMT_gmt[$r];}
                                    }
                                }
                                if ($GMT_day[$r]==3)    #### Wednesday local time
                                {
                                    if (($Gsct_wednesday_start==0) and ($Gsct_wednesday_stop==0))
                                    {
                                            if ( ($GMT_hour[$r]>=$Gsct_default_start) and ($GMT_hour[$r]<$Gsct_default_stop) )
                                                {$state_gmt[]=$GMT_gmt[$r];}
                                    } else {
                                            if ( ($GMT_hour[$r]>=$Gsct_wednesday_start) and ($GMT_hour[$r]<$Gsct_wednesday_stop) )
                                                {$state_gmt[]=$GMT_gmt[$r];}
                                    }
                                }
                                if ($GMT_day[$r]==4)    #### Thursday local time
                                {
                                    if (($Gsct_thursday_start==0) and ($Gsct_thursday_stop==0))
                                    {
                                            if ( ($GMT_hour[$r]>=$Gsct_default_start) and ($GMT_hour[$r]<$Gsct_default_stop) )
                                                {$state_gmt[]=$GMT_gmt[$r];}
                                    } else {
                                            if ( ($GMT_hour[$r]>=$Gsct_thursday_start) and ($GMT_hour[$r]<$Gsct_thursday_stop) )
                                                {$state_gmt[]=$GMT_gmt[$r];}
                                    }
                                }
                                if ($GMT_day[$r]==5)    #### Friday local time
                                {
                                    if (($Gsct_friday_start==0) and ($Gsct_friday_stop==0))
                                    {
                                            if ( ($GMT_hour[$r]>=$Gsct_default_start) and ($GMT_hour[$r]<$Gsct_default_stop) )
                                                {$state_gmt[]=$GMT_gmt[$r];}
                                    } else {
                                            if ( ($GMT_hour[$r]>=$Gsct_friday_start) and ($GMT_hour[$r]<$Gsct_friday_stop) )
                                                {$state_gmt[]=$GMT_gmt[$r];}
                                    }
                                }
                                if ($GMT_day[$r]==6)    #### Saturday local time
                                {
                                    if (($Gsct_saturday_start==0) and ($Gsct_saturday_stop==0))
                                    {
                                            if ( ($GMT_hour[$r]>=$Gsct_default_start) and ($GMT_hour[$r]<$Gsct_default_stop) )
                                                {$state_gmt[]=$GMT_gmt[$r];}
                                    } else {                                            if ( ($GMT_hour[$r]>=$Gsct_saturday_start) and ($GMT_hour[$r]<$Gsct_saturday_stop) )
                                                {$state_gmt[]=$GMT_gmt[$r];}
                                    }
                                }
                                    $r++;
                            }
                                $state_gmt = $state_gmt;
                                 // return $state_gmt;

                                  $query=$query->orWhere(function ($query) {
                                       $query->where('state',$Gstate_call_time_state)
                                             ->whereIn('gmt_offset_now',$state_gmt);
                                     });
                                 //   $ct_state_gmt_SQL=orWhere('state',$Gstate_call_time_state)->whereIn('gmt_offset_now',$state_gmt); 
                                 // $ct_state_gmt_SQL .="or (state='$Gstate_call_time_state' and gmt_offset_now IN($state_gmt)) ";
                        }


                              $b++;
                    }
                    if (strlen($ct_states)>2)
                    {
                        $ct_states = preg_replace('/,$/i', '',$ct_states);

                        // $ct_statesSQL = "and state NOT IN($ct_states)";
                        $query =$query->whereNotIn('state',$ct_states);
                    } else {
                        $ct_statesSQL = "";
                    }

                    $r=0;
                    $default_gmt=['99'];
                    while($r < $g)
                        {
                        if ($GMT_day[$r]==0)    #### Sunday local time
                            {
                            if (($Gct_sunday_start==0) and ($Gct_sunday_stop==0))
                                {
                                if ( ($GMT_hour[$r]>=$Gct_default_start) and ($GMT_hour[$r]<$Gct_default_stop) )
                                    {$default_gmt[]=$GMT_gmt[$r];}
                                }
                            else
                                {
                                if ( ($GMT_hour[$r]>=$Gct_sunday_start) and ($GMT_hour[$r]<$Gct_sunday_stop) )
                                    {$default_gmt[]=$GMT_gmt[$r];}
                                }
                            }
                        if ($GMT_day[$r]==1)    #### Monday local time
                            {
                            if (($Gct_monday_start==0) and ($Gct_monday_stop==0))
                                {
                                if ( ($GMT_hour[$r]>=$Gct_default_start) and ($GMT_hour[$r]<$Gct_default_stop) )
                                    {$default_gmt[]=$GMT_gmt[$r];}
                                }
                            else
                                {
                                if ( ($GMT_hour[$r]>=$Gct_monday_start) and ($GMT_hour[$r]<$Gct_monday_stop) )
                                    {$default_gmt[]=$GMT_gmt[$r];}
                                }
                            }
                        if ($GMT_day[$r]==2)    #### Tuesday local time
                            {
                            if (($Gct_tuesday_start==0) and ($Gct_tuesday_stop==0))
                                {
                                if ( ($GMT_hour[$r]>=$Gct_default_start) and ($GMT_hour[$r]<$Gct_default_stop) )
                                    {$default_gmt[]=$GMT_gmt[$r];}
                                }
                            else
                                {
                                if ( ($GMT_hour[$r]>=$Gct_tuesday_start) and ($GMT_hour[$r]<$Gct_tuesday_stop) )
                                    {$default_gmt[]=$GMT_gmt[$r];}
                                }
                            }
                        if ($GMT_day[$r]==3)    #### Wednesday local time
                            {
                            if (($Gct_wednesday_start==0) and ($Gct_wednesday_stop==0))
                                {
                                if ( ($GMT_hour[$r]>=$Gct_default_start) and ($GMT_hour[$r]<$Gct_default_stop) )
                                    {$default_gmt[]=$GMT_gmt[$r];}
                                }
                            else
                                {
                                if ( ($GMT_hour[$r]>=$Gct_wednesday_start) and ($GMT_hour[$r]<$Gct_wednesday_stop) )
                                    {$default_gmt[]=$GMT_gmt[$r];}
                                }
                            }
                        if ($GMT_day[$r]==4)    #### Thursday local time
                            {
                            if (($Gct_thursday_start==0) and ($Gct_thursday_stop==0))
                                {
                                if ( ($GMT_hour[$r]>=$Gct_default_start) and ($GMT_hour[$r]<$Gct_default_stop) )
                                    {$default_gmt[]=$GMT_gmt[$r];}
                                }
                            else
                                {
                                if ( ($GMT_hour[$r]>=$Gct_thursday_start) and ($GMT_hour[$r]<$Gct_thursday_stop) )
                                    {$default_gmt[]=$GMT_gmt[$r];}
                                }
                            }
                        if ($GMT_day[$r]==5)    #### Friday local time
                            {
                            if (($Gct_friday_start==0) and ($Gct_friday_stop==0))
                                {
                                if ( ($GMT_hour[$r]>=$Gct_default_start) and ($GMT_hour[$r]<$Gct_default_stop) )
                                    {$default_gmt[]=$GMT_gmt[$r];}
                                }
                            else
                                {
                                if ( ($GMT_hour[$r]>=$Gct_friday_start) and ($GMT_hour[$r]<$Gct_friday_stop) )
                                    {$default_gmt[]=$GMT_gmt[$r];}
                                }
                            }
                        if ($GMT_day[$r]==6)    #### Saturday local time
                            {
                            if (($Gct_saturday_start==0) and ($Gct_saturday_stop==0))
                                {
                                if ( ($GMT_hour[$r]>=$Gct_default_start) and ($GMT_hour[$r]<$Gct_default_stop) )
                                    {$default_gmt[]=$GMT_gmt[$r];}
                                }
                            else
                                {
                                if ( ($GMT_hour[$r]>=$Gct_saturday_start) and ($GMT_hour[$r]<$Gct_saturday_stop) )
                                    {$default_gmt[]=$GMT_gmt[$r];}
                                }
                            }
                        $r++;
                        }

                    $default_gmt = $default_gmt;
                     // return $default_gmt[3];

                     // $all_gmtSQL = "(gmt_offset_now IN($default_gmt) $ct_statesSQL) $ct_state_gmt_SQL";
                     $query=$query->whereNotIn('gmt_offset_now',$default_gmt);
                    // return $all_gmtSQL;

                    $dial_statuses = preg_replace("/ -$/","",$dial_statuses);
                    $Dstatuses = explode(" ", $dial_statuses);
                    $Ds_to_print = (count($Dstatuses) - 0);

                    $Dsql = '';
                    $o=1;
                    while ($Ds_to_print > $o) 
                    {
                        
                        $Dsql .= "'$Dstatuses[$o]',";
                        $Dsql_arr[]= $Dstatuses[$o];
                        $o++;
                    }

                        
                    $Dsql = preg_replace("/,$/","",$Dsql);
                    if (strlen($Dsql) < 2) {$Dsql = "''";
                            $Dsql_arr="''";}

                    $DLTsql='';
                    $DLseconds="1 Day";
                    // $local_call_time_get=(DATE_ADD(NOW(), 'INTERVAL 1 SECOND'));
                    //     return $local_call_time_get;
                    if ($drop_lockout_time > 0)
                        {
                        $DLseconds = ($drop_lockout_time * 3600);
                        $DLseconds = floor($DLseconds);
                        $DLseconds = intval($DLseconds);
                        
                         $query=$query->where(function ($query) {
                                       $query->whereIn('status',['DROP','XDROP'])
                                             ->where('last_local_call_time','<',CONCAT(DATE_ADD(NOW(), "INTERVAL -".$DLseconds." SECOND"),CURTIME()))
                                             ->orWhereNotIn('status',['DROP','XDROP']);
                                     });

                        // $DLTsql = "and ( ( (status IN('DROP','XDROP')) and (last_local_call_time < CONCAT(DATE_ADD(NOW(), INTERVAL -$DLseconds SECOND),' ',CURTIME()) ) ) or (status NOT IN('DROP','XDROP')) )";
                        //  $DLTsql=whereIn('status',['DROP','XDROP'])->where('last_local_call_time','<',CONCAT(DATE_ADD(NOW(), "INTERVAL -".$DLseconds." SECOND"),CURTIME()));
                        }
                        // return "asda";

                    $CCLsql='';
                    if ($call_count_limit > 0)
                        {
                            $query=$query->where('called_count','<',$call_count_limit);

                        // $CCLsql = "and (called_count < $call_count_limit)";
                        }

                    $EXPsql='';
                    $expired_lists=[];
                    $REPORTdate = date("Y-m-d");
                  
                    $variable=VicidialLists::whereIn('list_id',$camp_list_arr)->where('active','Y')->where('expiration_date','<',$REPORTdate)->get();

                    foreach ($variable as $value) {
                      
                        $expired_lists[]= $value->list_id;
                        
                    }
                  
                    $expired_lists = preg_replace("/,$/",'',$expired_lists);
                    if (count($expired_lists) < 2) {$expired_lists = [];}
                
                    $query=$query->whereNotIn('list_id',$expired_lists);
              
                    // return "ada";
                    // return $Dsql_arr;
                      if ($fSQL) {
                        $rslt_rows=$query->whereIn('status',$Dsql_arr)->whereIn('list_id',$camp_list_arr)->count();
                      } else {
                        $rslt_rows=$query->whereIn('status',$Dsql_arr)->whereIn('list_id',$camp_list_arr)->count();
                      }
                    
                  
                      // $rslt_rows = DB::statement("SELECT count(*) FROM vicidial_list where called_since_last_reset='N' and status IN('".$Dsql_arr."') and list_id IN('".$camp_list_arr."') and ('".$all_gmtSQL."') '".$CCLsql."' '".$DLTsql."' '".$fSQL."' '".$EXPsql."'");


                   // return $rslt_rows;
                    if ($rslt_rows)
                        {
                        $active_leads = $rslt_rows;
                        }
                    else {$active_leads = '0';}

                    
                    if ($single_status > 0)
                    {
                        return $active_leads;
                    } else {
                        return "This campaign has $active_leads leads to be dialed in those lists\n";
                    }
                } else {
                        return "No dial statuses selected for this campaign\n";
                }
            } else {  
                return "No active lists selected for this campaign\n";
            }
        } else {
                    
            return "No active lists selected for this campaign\n";
        }
        ##### END calculate what gmt_offset_now values are within the allowed local_call_time setting ###
}

    /**
     * Get voice mail by id
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $request
     * @return array
     */
    public function getLead(Request $request, $id) {
        #required field validation
        if ($id == '') {
            #build error response
            return AdminUtilitiesCommon::buildResponse(
                            AdminUtilities::ERROR
                            , AdminUtilitiesErrors::REQ_VOICEMAIL_ID);
        }

        #check for duplicate script
        $Lists_info =  VicidialLeadFilter::getLeadFiltersById($id)->toArray();

        if (count($Lists_info)) {

            #build success response
            return AdminUtilitiesCommon::buildResponse(
                            AdminUtilities::SUCCESS
                            , ''
                            , $Lists_info[0]);
        } else {
            #build error response
            return AdminUtilitiesCommon::buildResponse(
                            AdminUtilities::ERROR
                            , AdminUtilitiesErrors::SHIFT_NOT_FOUND);
        }
    }


    /**
     * To edit or add new script
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $req
     * @return json
     */
    public function updateOrCreateLead(Request $request) {

        
        #get inputs
        $shiftId = $request->input('shift_id');
        $shiftstime = $request->input('shift_name');
        $type = $request->input('type');
        $PHP_AUTH_USER = "krishna@ytel.co.in";
        $ip = $request->ip();
        $inputs = $request->all();

        unset($inputs['type']);

        #check for duplicate script
        $shift_info = VicidialShifts::findShift($shiftId)->toArray();

        if (count($shift_info)) {
                 return AdminUtilitiesCommon::buildResponse(
                                AdminUtilities::ERROR
                                , AdminUtilitiesErrors::SHIFT_RECORD_CREATED_ERROR);
        }


        if ($type == 'edit') {
            #update script
            $result = VicidialScript::updateScript($script_id, $inputs);

            if ($result >= 0) {

                #build success response
                return AdminUtilitiesCommon::buildResponse(
                                AdminUtilities::SUCCESS
                                , AdminUtilitiesErrors::RECORD_MODIFIED);
            } else {
                #build error response
                return AdminUtilitiesCommon::buildResponse(
                                AdminUtilities::ERROR
                                , AdminUtilitiesErrors::RECORD_MODIFIED_ERROR);
            }
        } else {

            $result = VicidialShifts::makeShift($inputs);
            if ($result) {
                #add entry in admin log
  
                #build success response
                return AdminUtilitiesCommon::buildResponse(
                                AdminUtilities::SUCCESS
                                , AdminUtilitiesErrors::RECORD_CREATED);
            } else {
                #build error response
                return AdminUtilitiesCommon::buildResponse(
                                AdminUtilities::ERROR
                                , AdminUtilitiesErrors::RECORD_CREATED_ERROR);
            }
        }
    }



}
