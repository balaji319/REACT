<?php

/*
 * Controller for admin utilities dnc number module
 * @author om<om@ytel.com>
 * 
 */

namespace App\Http\Controllers\AdminUtilities;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\CallTimeRequest;
use App\Http\Requests\StateCallTimeRequest;
use App\Traits\AccessControl;
use App\Traits\ErrorLog;
use App\Traits\Helper;
use App\VicidialVoicemail;
use App\VicidialAdminLog;
use App\VicidialUserGroup;
use App\VicidialShifts;
use App\SystemSetting;
use App\VicidialCallTime;
use App\VicidialStateCallTime;
use App\VicidialCallTimeHoliday;
use App\VicidialCampaign;
use App\VicidialInboundGroup;
use App\Http\Controllers\AdminUtilities\AdminUtilitiesConstants as AdminUtilities;
use App\Http\Controllers\AdminUtilities\AdminUtilitiesErrors;
use Illuminate\Support\Facades\Input;
use Exception;

class CalltimeController extends Controller {

    use ErrorLog,
        AccessControl,
        Helper;

    /**
     * Get call time list
     * @author Shital Shital<shital@ytel.com>
     * @param Request $request
     * @return array
     */
    public function CallTimeLists(Request $request) {
        try {
            $limit = $request->get('limit') ?: \Config::get("configs.pagination_limit");
            $search = $request->get('search') ?: NULL;
            
             $list = VicidialCallTime::getAll($search, $limit);
         return response()->json(['status' => 200, 'data' => $list, 'msg' => "Success."], 200);
        } catch (Exception $e) {
             $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
            
       
    }

      /**
     * Add new Call Time entry
     * @author Shital<shital@ytel.com>
     * @param Request $request
     * @return array
     */
    public function addCallTime(CallTimeRequest $request)
    {
        try {
             $user = $request->user();

             $permission=$this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_CREATE,$user);
            if (!in_array(SYSTEM_COMPONENT_ADMIN_CALL_TIME, $permission)) {
                throw new ForbiddenException();
            }
            $call_time_check=VicidialCallTime::find($request['call_time_id']);

            if (!$call_time_check) {
                 $call_time=new VicidialCallTime;
                 $call_time['call_time_id']=$request['call_time_id'];
                 $call_time['call_time_name']=$request['call_time_name'];
                 $call_time->save();

                if ($call_time) {
                        //Generate Logs Add CallTime
                   
                    $admin_log = new VicidialAdminLog();

                    $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                    $admin_log['user'] = $user->x5_contact_id;
                    $admin_log['ip_address'] = $this->clientIp();
                    $admin_log['event_section'] = "CALLTIME";
                    $admin_log['event_type'] = "ADD";
                    $admin_log['record_id'] = $request['call_time_id'];
                    $admin_log['event_code'] = "ADD CALLTIME";
                    $admin_log['event_sql'] = "INSERT INTO vicidial_call_times SET call_time_id='".$request['call_time_id']."', call_time_name='".$request['call_time_name']."', call_time_comments='".$request['call_time_comments']."', user_group='".$request['user_group']."', ct_state_call_times='',ct_holidays='';";
                    $admin_log['event_notes'] = "";
                    $admin_log['user_group'] ="";
                    $admin_log->save();   
                
                    return response()->json(['status' => 200,'msg' => "Successfully Added"],200); 
                }
            } else {
                throw new Exception('This record is alredy present.',400);
            }
           
        } catch (Exception $e) {
             $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
        
    }
      /**
     * update Call Time
     * @author Shital<shital@ytel.com>
     * @param Request $request
     * @return array
     */
      public function editCallTime(Request $request)
      {
        try {

            $user = $request->user();
           if (!in_array(SYSTEM_COMPONENT_ADMIN_CALL_TIME, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE,$user))) {
                throw new ForbiddenException();
            }
            $call_time=VicidialCallTime::find($request['call_time_id']);
            if (!$call_time) {
               throw new Exception('This record is not present.', 404);
            }


            //*****************state call time **********************
            $ct_state_call_times=$call_time->ct_state_call_times;

            $ct_srs = 1;
            $b = 0;
            $srs_SQL =array( );
            $srs_state_SQL=array();
            $sct_list = '';

            if (strlen($ct_state_call_times) > 2) {
                $state_rules = explode('|', $ct_state_call_times);
                $ct_srs = ((count($state_rules)) - 1);
            }
         

            while ($ct_srs >= $b) {
                
                if (strlen($state_rules[$b]) > 0) {
                    $result =VicidialStateCallTime::select('state_call_time_state','state_call_time_name')->where('state_call_time_id',$state_rules[$b])->first();

                     $active_state_call_time_rule[]=$result;
                 
                    $srs_SQL[]= $state_rules[$b];
                    $srs_state_SQL[]=$result->state_call_time_state;
                }
                $b++;
            }
        
                $state_call_time_rule_list=VicidialStateCallTime::select('state_call_time_id','state_call_time_name')->whereNotIn('state_call_time_id',$srs_SQL)->whereNotIn('state_call_time_state',$srs_state_SQL)->orderBy('state_call_time_id','desc')->get();

            //*****************holidays call time **********************


            $call_time_holiday=$call_time->ct_holidays;
            $ct_hrs = 1;
            $b = 0;
            $hrs_SQL=$hrs_holiday_SQL=$holiday_rules=$active_holidays=array();

            if (strlen($call_time_holiday) > 2) {
                $holiday_rules = explode('|', $call_time_holiday);
                $ct_hrs = ((count($holiday_rules)) - 1);
            }
              while ($ct_hrs >= $b) {
                if ($holiday_rules && strlen($holiday_rules[$b]) > 0) {
                    $result=VicidialCallTimeHoliday::select('holiday_date,holiday_name')->where('holiday_id',$holiday_rules[$b])->first();

                     $active_holidays[]=$result;
                   
                    $hrs_SQL[]=$holiday_rules[$b];
                    $hrs_holiday_SQL[]= $result->holiday_date;
                }
                $b++;
            }

            $holiday_list=VicidialCallTimeHoliday::select('holiday_id','holiday_date')->whereNotIn('holiday_id',$hrs_SQL)->whereNotIn('holiday_date',$hrs_holiday_SQL)->orderBy('holiday_date','desc')->get();

             //*****************campaign call time **********************
            $campaign_to_print=VicidialCampaign::select('campaign_id','campaign_name')->where('local_call_time',$request['call_time_id'])->get();

            //*****************inbound group **********************
            $inbounds_to_print=VicidialInboundGroup::select('group_id','group_name')->where('call_time_id',$request['call_time_id'])->get();

            //*******************user group****************************
           $user_group=VicidialUserGroup::select('user_group','group_name')->get();


            $result_array['call_time']=$call_time;
            $result_array['active_state_call_time_rule']=$active_state_call_time_rule;
            $result_array['state_call_time_rule_list']=$state_call_time_rule_list;

            $result_array['active_holidays']=$active_holidays;
            $result_array['holiday_list']=$holiday_list;

            $result_array['campaign_to_print']=$campaign_to_print;

            $result_array['inbounds_to_print']=$inbounds_to_print;

            $result_array['user_group']=$user_group;

             return response()->json(['status' => 200, 'data' => $result_array, 'msg' => "Success."], 200);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
      }
     /**
     * update Call Time
     * @author Shital<shital@ytel.com>
     * @param Request $request
     * @return array
     */
    public function updateCallTime(CallTimeRequest $request)
    {
        try {
             $user = $request->user();
            if (!in_array(SYSTEM_COMPONENT_ADMIN_CALL_TIME, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_CREATE,$user))) {
                throw new ForbiddenException();
            }
            $call_time=VicidialCallTime::find($request['call_time_id']);


            if ($call_time) {
                $data=$call_time->getData($request->all());
              
                    $call_time_update=$call_time->update($data);
                    

                if ($call_time_update) {
                        //Generate Logs Add CallTime
                   
                    $admin_log = new VicidialAdminLog();

                    $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                    $admin_log['user'] = $user->x5_contact_id;
                    $admin_log['ip_address'] = $this->clientIp();
                    $admin_log['event_section'] = "CALLTIME";
                    $admin_log['event_type'] = "MODIFY";
                    $admin_log['record_id'] = $request['call_time_id'];
                    $admin_log['event_code'] = "MODIFY CALLTIME";
                    $admin_log['event_sql'] = "UPDATE vicidial_call_times set call_time_name='".$request['call_time_name']."', call_time_comments='".$request['call_time_comments']."', ct_default_start='".$request['ct_default_start']."', ct_default_stop='".$request['ct_default_stop']."', ct_sunday_start='".$request['ct_sunday_start']."', ct_sunday_stop='".$request['ct_sunday_stop']."', ct_monday_start='".$request['ct_monday_start']."', ct_monday_stop='".$request['ct_monday_stop']."', ct_tuesday_start='".$request['ct_tuesday_start']."', ct_tuesday_stop='".$request['ct_tuesday_stop']."', ct_wednesday_start='".$request['ct_wednesday_start']."', ct_wednesday_stop='".$request['ct_wednesday_stop']."', ct_thursday_start='".$request['ct_thursday_start']."', ct_thursday_stop='".$request['ct_thursday_stop']."', ct_friday_start='".$request['ct_friday_start']."', ct_friday_stop='".$request['ct_friday_stop']."', ct_saturday_start='".$request['ct_saturday_start']."', ct_saturday_stop='".$request['ct_saturday_stop']."', default_afterhours_filename_override='".$request['default_afterhours_filename_override']."', sunday_afterhours_filename_override='".$request['sunday_afterhours_filename_override']."', monday_afterhours_filename_override='".$request['monday_afterhours_filename_override']."', tuesday_afterhours_filename_override='".$request['tuesday_afterhours_filename_override']."', wednesday_afterhours_filename_override='".$request['wednesday_afterhours_filename_override']."', thursday_afterhours_filename_override='".$request['thursday_afterhours_filename_override']."', friday_afterhours_filename_override='".$request['friday_afterhours_filename_override']."', saturday_afterhours_filename_override='".$request['saturday_afterhours_filename_override']."',user_group='".$request['user_group']."' where call_time_id='".$request['call_time_id']."'";
                    $admin_log['event_notes'] = "";
                    $admin_log['user_group'] ="";
                    $admin_log->save();   
                
                    return response()->json(['status' => 200,'msg' => "Successfully Updated"],200); 
                }
            } else {
                throw new Exception('This record is alredy present.',400);
            }
           
        } catch (Exception $e) {
             $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
        
    }
    /**
     * Add State Call Time
     * @author Shital<shital@ytel.com>
     * @param Request $request
     * @return array
     */
    public function addStateCallTime(StateCallTimeRequest $request)
    {
            try {
                // For new ACL
                $user=$request->user();
                if (!in_array(SYSTEM_COMPONENT_ADMIN_CALL_TIME, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_CREATE,$user))) {
                    throw new ForbiddenException();
                }

                // Create Call Time
                $state_call_time=VicidialStateCallTime::find($request['state_call_time_id']);
                if (!$state_call_time) {
                    
                    $add_state_call_time=VicidialStateCallTime::create($request->all());
                    if ($add_state_call_time) {
                         $admin_log = new VicidialAdminLog();

                        $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                        $admin_log['user'] = $user->x5_contact_id;
                        $admin_log['ip_address'] = $this->clientIp();
                        $admin_log['event_section'] = "CALLTIMES_STATE";
                        $admin_log['event_type'] = "ADD";
                        $admin_log['record_id'] = $request['state_call_time_id'];
                        $admin_log['event_code'] = "ADMIN ADD STATE CALL TIME";
                        $admin_log['event_sql'] = "INSERT INTO vicidial_state_call_times SET state_call_time_id='".$request['state_call_time_id']."',state_call_time_state='".$request['state_call_time_state']."',state_call_time_name='".$request['state_call_time_name']."',state_call_time_comments='".$request['state_call_time_comments']."',user_group='".$request['user_group']."'";
                        $admin_log['event_notes'] = "";
                        $admin_log['user_group'] =$request['user_group'];
                        $admin_log->save();   

                        return response()->json(['status' => 200,'msg' => "State Call Time Successfully Added"],200); 
                    
                    }
                } else {
                    throw new Exception('This State Call Time ID has already been taken.',400);
                }
            } catch (Exception $e) {
                $this->postLogs(config('errorcontants.mysql'), $e);
                throw $e;
            }
          
        }
     /**
     * Add State Rule
     * @author Shital<shital@ytel.com>
     * @param Request $request
     * @return array
     */

    public function addStateRules(Request $request)
    {
        try {
            
            // For new ACL
           $user=$request->user();
            if (!in_array(SYSTEM_COMPONENT_ADMIN_CALL_TIME, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE,$user))) {
                throw new ForbiddenException();
            }

            $call_time_id = $request['call_time_id'];
            $state_rule = $request['state_rule'];

            $state_call_times=VicidialCallTime::find($call_time_id);
           
            $ct_state_call_times = $state_call_times->ct_state_call_times;

            if (preg_match('/\|$/i', $ct_state_call_times)) 
            { 
                $data['ct_state_call_times'] = "$ct_state_call_times$state_rule|"; 
            } else {
                 $data['ct_state_call_times'] = "$ct_state_call_times\|$state_rule|"; 
            }

            $state_call_times=$state_call_times->fill($data)->save();


            $admin_log = new VicidialAdminLog();

            $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log['user'] = $user->x5_contact_id;
            $admin_log['ip_address'] = $this->clientIp();
            $admin_log['event_section'] = "CALLTIMES";
            $admin_log['event_type'] = "MODIFY";
            $admin_log['record_id'] = $request['call_time_id'];
            $admin_log['event_code'] = "ADMIN MODIFY CALL TIME ADD STATE RULE";
            $admin_log['event_sql'] = "UPDATE vicidial_call_times set ct_state_call_times='|".$state_rule."|' where call_time_id='".$call_time_id."';";
            $admin_log['event_notes'] = 'State Rule Added:'.$state_rule;
           
            $admin_log->save(); 

            return response()->json(['status' => 200,'msg' => "Call Time Updated Successfully"],200);   

        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
                throw $e;
        }
    }
     /**
     * Delete State Rule
     * @author Shital<shital@ytel.com>
     * @param Request $request
     * @return array
     */

    public function deleteState(Request $request)
    {
        try {
            
       
            // For new ACL
            $user=$request->user();
            if (!in_array(SYSTEM_COMPONENT_ADMIN_CALL_TIME, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_DELETE,$user))) {
                throw new ForbiddenException();
            }

            $call_time_id = $request['call_time_id'];
            $state_rule = $request['state_rule'];

            $state_call_times=VicidialCallTime::find($call_time_id);
           
            $ct_state_call_times = $state_call_times->ct_state_call_times;


            $ct_state_call_time = preg_replace("/\|$state_rule\|/i", '|', $ct_state_call_times);
           
             $state_call_times=$state_call_times->fill($data)->save();

            $admin_log = new VicidialAdminLog();

            $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log['user'] = $user->x5_contact_id;
            $admin_log['ip_address'] = $this->clientIp();
            $admin_log['event_section'] = "CALLTIMES";
            $admin_log['event_type'] = "MODIFY";
            $admin_log['record_id'] = $request['call_time_id'];
            $admin_log['event_code'] = "ADMIN MODIFY CALL TIME REMOVE STATE RULE";
            $admin_log['event_sql'] = "UPDATE vicidial_call_times set ct_state_call_times='|".$state_rule."|' where call_time_id='".$call_time_id."';";
            $admin_log['event_notes'] = 'State Rule Removed:'.$state_rule;
           
            $admin_log->save(); 

            return response()->json(['status' => 200,'msg' => "State Rule Deleted Successfully"],200);   

        } catch (Exception $e) {
             $this->postLogs(config('errorcontants.mysql'), $e);
                throw $e;
        }
    }
     /**
     * Add Holiday
     * @author Shital<shital@ytel.com>
     * @param Request $request
     * @return array
     */
    public function addHoliday()
    {
        try {
            // For new ACL
            $user=$request->user();
            if (!in_array(SYSTEM_COMPONENT_ADMIN_CALL_TIME, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE,$user))) {
                throw new ForbiddenException();
            }

            $call_time_id = $request['call_time_id'];
            $holiday_rule = $request['holiday_rule'];

            $holidays=VicidialCallTime::find($call_time_id);

       
            $ct_holidays = $holidays->ct_holidays;

            if (preg_match('/\|$/i', $ct_holidays)) 
            { 
                $data['ct_holidays'] = "$ct_holidays$holiday_rule|"; 
            } else { 
                $data['ct_holidays'] = "$ct_holidays\|$holiday_rule|"; 
            }

            $result=$holidays->fill($data)->save();

            $admin_log = new VicidialAdminLog();

            $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log['user'] = $user->x5_contact_id;
            $admin_log['ip_address'] = $this->clientIp();
            $admin_log['event_section'] = "CALLTIMES";
            $admin_log['event_type'] = "MODIFY";
            $admin_log['record_id'] = $request['call_time_id'];
            $admin_log['event_code'] = "ADMIN MODIFY STATE CALL TIME ADD HOLIDAY RULE";
            $admin_log['event_sql'] = "UPDATE vicidial_call_times set ct_holidays='|".$holiday_rule."|' where call_time_id='".$call_time_id."';";
            $admin_log['event_notes'] = 'Holiday Rule Added:'.$holiday_rule;
           
            $admin_log->save(); 
              return response()->json(['status' => 200,'msg' => "Holiday Rule Updated Successfully"],200);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
                throw $e;
        }

          
    }
       /**
     * Delete Holiday rule
     * @author Shital<shital@ytel.com>
     * @param Request $request
     * @return array
     */
    public function deleteHoliday(Request $request)
    {
        try {
            
            // For new ACL
            $user=$request->user();
            if (!in_array(SYSTEM_COMPONENT_ADMIN_CALL_TIME, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_DELETE,$user))) {
                throw new ForbiddenException();
            }

            $call_time_id = $request['call_time_id'];
            $holiday_rule = $request['id'];

            $holidays=VicidialCallTime::find($call_time_id);

            $ct_holidays = $holidays->ct_holidays;

            $data['ct_holidays'] = preg_replace("/\|$holiday_rule\|/i", '|', $ct_holidays);

            // return $ct_holidays;

            $result=$holidays->fill($data)->save();

            $admin_log = new VicidialAdminLog();

            $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log['user'] = $user->x5_contact_id;
            $admin_log['ip_address'] = $this->clientIp();
            $admin_log['event_section'] = "CALLTIMES";
            $admin_log['event_type'] = "MODIFY";
            $admin_log['record_id'] = $request['call_time_id'];
            $admin_log['event_code'] = "ADMIN MODIFY STATE CALL TIME REMOVE HOLIDAY RULE";
            $admin_log['event_sql'] = "UPDATE vicidial_call_times set ct_holidays='|".$holiday_rule."|' where call_time_id='".$call_time_id."';";
            $admin_log['event_notes'] = 'Holiday Rule Removed:'.$holiday_rule;
           
            $admin_log->save(); 
              return response()->json(['status' => 200,'msg' => "Holiday Rule Deleted Successfully"],200);

        } catch (Exception $e) {
             $this->postLogs(config('errorcontants.mysql'), $e);
                throw $e;
        }
    }


      /**
     * delete Call Time
     * @author Shital<shital@ytel.com>
     * @param Request $request
     * @return array
     */
      public function deleteCallTime(Request $request)
      {
        try {
            $user=$request->user();

             if (!in_array(SYSTEM_COMPONENT_ADMIN_CALL_TIME, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_DELETE,$user))) {
                throw new ForbiddenException();
            }

            $call_time_id = $request['call_time_id'];

            $call_time=VicidialCallTime::find($call_time_id);
            if (!$call_time) {
               throw new Exception('This record is not present.', 404);
            }
            $call_time->delete();

             $admin_log = new VicidialAdminLog();

            $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log['user'] = $user->x5_contact_id;
            $admin_log['ip_address'] = $this->clientIp();
            $admin_log['event_section'] = "CALLTIME";
            $admin_log['event_type'] = "DELETE";
            $admin_log['record_id'] = $request['call_time_id'];
            $admin_log['event_code'] = "DELETE CALLTIME";
            $admin_log['event_sql'] = "DELETE from vicidial_call_times where call_time_id='".$call_time_id."' limit 1;";
            $admin_log['event_notes'] = '';
           
            $admin_log->save(); 
            return response()->json(['status' => 200, 'msg' => "Successfully Deleted."], 200);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
      }

    /**
     * Get voice mail by id
     * @author Shital<shital@ytel.com>
     * @param Request $request
     * @return array
     */
    public function getCallTime(Request $request, $id) {
        #required field validation
        if ($id == '') {
            #build error response
            return AdminUtilitiesCommon::buildResponse(
                            AdminUtilities::ERROR
                            , AdminUtilitiesErrors::REQ_VOICEMAIL_ID);
        }

        #check for duplicate script
        $calltime_info = VicidialCallTime::findCallTime($id)->toArray();

        if (count($calltime_info)) {

            #build success response
            return AdminUtilitiesCommon::buildResponse(
                            AdminUtilities::SUCCESS
                            , ''
                            , $calltime_info[0]);
        } else {
            #build error response
            return AdminUtilitiesCommon::buildResponse(
                            AdminUtilities::ERROR
                            , AdminUtilitiesErrors::SHIFT_NOT_FOUND);
        }
    }


    /**
     * To edit or add new script
     * @author Shital<shital@ytel.com>
     * @param Request $req
     * @return json
     */
    public function updateOrCreateCall(Request $request) {

        #get inputs
        $calltimeId = $request->input('call_time_id');
        $calltimename = $request->input('call_time_name');
        $type = $request->input('type');
        $PHP_AUTH_USER = "krishna@ytel.co.in";
        $ip = $request->ip();
        $inputs = $request->all();

        unset($inputs['type']);

        #check for duplicate calltime
        $calltime_info = VicidialCallTime::findCallTime($calltimeId,$type)->toArray();

        if (count($calltime_info)) {

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

            $result = VicidialCallTime::makeCallTime($inputs);
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
