<?php

/*
 * Controller for admin utilities dnc number module
 * @author om<om@ytel.com>
 * 
 */

namespace App\Http\Controllers\AdminUtilities;

// use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\ShiftRequest;
use App\Traits\AccessControl;
use App\Traits\ErrorLog;
use App\Traits\Helper;
use App\VicidialVoicemail;
use App\VicidialAdminLog;
use App\VicidialUserGroup;
use App\VicidialShift;
use App\SystemSetting;
use App\Http\Controllers\AdminUtilities\AdminUtilitiesConstants as AdminUtilities;
use App\Http\Controllers\AdminUtilities\AdminUtilitiesErrors;
use Illuminate\Support\Facades\Input;
use Exception;
use DB;


class ShiftsController extends Controller {

     use ErrorLog,
        AccessControl,
        Helper;

    /**
     * Get voice mail list
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $request
     * @return array
     */
    public function shiftLists(Request $request) {

        try {

            $limit = $request->get('limit') ?: \Config::get("configs.pagination_limit");
            $search = $request->get('search') ?: NULL;
            $list = VicidialShift::getAll($search, $limit);

              return response()->json(['status' => 200,'data' => $list,'msg' => "Success."],200);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }
       /**
     * To add new shift
     * @author Shital cavan<shital@xoyal.com>
     * @param Request $request
     * @return json
     */

    public function store(ShiftRequest $request)
    {
        try {
            // return $request->shift_weekdays[0]['day'];
            $user = $request->user();
            if (!in_array(SYSTEM_COMPONENT_ADMIN_SHIFT, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_CREATE, $user))) {
                throw new ForbiddenException();
            }
            $checkduplicate=VicidialShift::find($request['shift_id']);

            if ($checkduplicate) {
                throw new Exception('Shift Id is already exist', 400);
            }


            $data=$request->all();
            $shift_weekdays = "";
            foreach ($request['shift_weekdays'] as $value) {
                $weekdays[]=$value['day'];
            }

            if (isset($request['shift_weekdays']) && $request['shift_weekdays'] !== "") {
                $shift_weekdays = implode("", $weekdays);
            }

            $data['shift_weekdays']=$shift_weekdays;



            VicidialShift::create($data);

             $admin_log = new VicidialAdminLog();

                    $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                    $admin_log['user'] = $user->x5_contact_id;
                    $admin_log['ip_address'] = $this->clientIp();
                    $admin_log['event_section'] = "SHIFTS";
                    $admin_log['event_type'] = "ADD";
                    $admin_log['record_id'] = $request['shift_id'];
                    $admin_log['event_code'] = "ADMIN ADD SHIFTS";
                    $admin_log['event_sql'] = "INSERT into vicidial_shifts (shift_id,shift_name,shift_start_time,shift_length,shift_weekdays,report_option,user_group) VALUES ('".$data['shift_id']."','".$data['shift_name']."','".$data['shift_start_time']."','".$data['shift_length']."','".$data['shift_weekdays']."','".$data['report_option']."','".$data['user_group']."');";
                    $admin_log['event_notes'] = "";
                    
                    $admin_log->save();

                return response()->json(['status' => 200,'msg' => "Shift added successfully! "],200);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }
       /**
     * To delete shift
     * @author Shital cavan<shital@xoyal.com>
     * @param Request $request
     * @return json
     */

    public function destroy(Request $request)
    {
        try {
             $user = $request->user();
             // For new ACL
            if (!in_array(SYSTEM_COMPONENT_ADMIN_SHIFT, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_DELETE,$user))) {
                throw new ForbiddenException();
            }
            $result=VicidialShift::find($request['shift_id']);

              if ($result) {
                    $result->delete();

                     $admin_log = new VicidialAdminLog();

                    $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                    $admin_log['user'] = $user->x5_contact_id;
                    $admin_log['ip_address'] = $this->clientIp();
                    $admin_log['event_section'] = "SHIFTS";
                    $admin_log['event_type'] = "DELETE";
                    $admin_log['record_id'] = $request['shift_id'];
                    $admin_log['event_code'] = "ADMIN DELETE SHIFTS";
                    $admin_log['event_sql'] ="DELETE from vicidial_shifts where shift_id='".$request['shift_id']."'";
                    $admin_log['event_notes'] = "";
                    $admin_log['user_group'] = "---ALL---";
                    return response()->json(['status' => 200,'msg' => "Shift deleted successfully! "],200);
                } else {
                     throw new Exception('Record not found', 400);
                }
        } catch (Exception $e) {
              $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
        
    }
        /**
     * To edit shift
     * @author Shital cavan<shital@xoyal.com>
     * @param Request $request
     * @return json
     */
    public function edit(Request $request)
    { 
        try {
         $user = $request->user();
         if (!in_array(SYSTEM_COMPONENT_ADMIN_SHIFT, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE,$user))) {
                throw new ForbiddenException();
            }

            $edit_list=VicidialShift::find($request['shift_id']);

        $weekdays=$edit_list->weekdays();
       
            $array  = array_map('intval', str_split($edit_list->shift_weekdays));

            foreach ($weekdays as $key => $value) {

               if (in_array($value['day'], $array)) {
                    $shift_weekdays[$key]['day']=$value['day'];
                    $shift_weekdays[$key]['checked']=true;
               } else {
                    $shift_weekdays[$key]['day']=$value['day'];
                    $shift_weekdays[$key]['checked']=false;
               }
            }
           
            $edit_list->shift_weekdays=$shift_weekdays;

           
            $shift_start_time = $edit_list->shift_start_time;
            $shift_length = $edit_list->shift_length;

            $shift_start_hour = substr($shift_start_time, 0, 2);
            $shift_start_min = substr($shift_start_time, 2, 2);
            $shift_length_hour = substr($shift_length, 0, 2);
            $shift_length_min = substr($shift_length, 3, 2);

            $shift_end_hour = ($shift_start_hour + $shift_length_hour);
            $shift_end_min = ($shift_start_min + $shift_length_min);
            if ($shift_end_min >= 60) {
                $shift_end_min = ($shift_end_min - 60);
                $shift_end_hour++;
            }
            if ($shift_end_hour >= 24) {
                $shift_end_hour = ($shift_end_hour - 24);
            }
            $shift_end_hour = sprintf("%02s", $shift_end_hour);
            $shift_end_min = sprintf("%02s", $shift_end_min);
            $shift_end = $shift_end_hour.$shift_end_min;

            $edit_list->shift_end_time = $shift_end;

            return response()->json(['status' => 200,'data' => $edit_list,'msg' => "Success."],200);

        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
         
    }
        /**
     * To update shift
     * @author Shital cavan<shital@xoyal.com>
     * @param Request $request
     * @return json
     */
    public function update(ShiftRequest $request)
    {
        try {
             $user = $request->user();
             // For new ACL
            if (!in_array(SYSTEM_COMPONENT_ADMIN_SHIFT, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE,$user))) {
                throw new ForbiddenException();
            }
             $shift=VicidialShift::find($request['shift_id']);
             if (!$shift) {
                throw new Exception('This record is not present.', 404);
             }

            $weekdays[]='';

             $shift_weekdays = "";
            foreach ($request['shift_weekdays'] as $value) {
                $weekdays[]=$value['day'];
            }
           
           
            if (isset($request['shift_weekdays']) && $request['shift_weekdays'] !== "") {
                $shift_weekdays = implode("", $weekdays);
                $request['shift_weekdays'] = $shift_weekdays;
            }
            // return $request->all();
         
             unset($request['shift_id']);
            $shift->fill($request->all())->save();

            $admin_log = new VicidialAdminLog();

                $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                $admin_log['user'] = $user->x5_contact_id;
                $admin_log['ip_address'] = $this->clientIp();
                $admin_log['event_section'] = "SHIFTS";
                $admin_log['event_type'] = "MODIFY";
                $admin_log['record_id'] = $request['shift_id'];
                $admin_log['event_code'] = "ADMIN MODIFY SHIFTS";
                $admin_log['event_sql'] ="UPDATE vicidial_shifts SET shift_name='".$request['shift_name']."', shift_start_time='".$request['shift_start_time']."', shift_length='".$request['shift_length']."', shift_weekdays='".$request['shift_weekdays']."', report_option='".$request['report_option']."', user_group='".$request['user_group']."',report_rank='".$request['report_rank']."'  WHERE shift_id='".$request['shift_id']."'";
                $admin_log['event_notes'] = "";
                $admin_log['user_group'] = "---ALL---";
            return response()->json(['status' => 200,'msg' => "Shift updated successfully! "],200);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }
    /**
     * Get voice mail by id
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $request
     * @return array
     */
    public function getShift(Request $request, $id) {
        #required field validation
        if ($id == '') {
            #build error response
            return AdminUtilitiesCommon::buildResponse(
                            AdminUtilities::ERROR
                            , AdminUtilitiesErrors::REQ_VOICEMAIL_ID);
        }

        #check for duplicate script
        $shift_info =  VicidialShift::findShift($id)->toArray();

            $contacts = array(
                array(
                    "day" => "1",
                    "name" => "Sunday",
                    "checked" => false,
                ),
                array(
                         "day" => "2",
                    "name" => "Monday",
                    "checked" => false,
                ),
                array(
                          "day" => "3",
                    "name" => "Tuesday",
                    "checked" => true,
                ),  
                 array(
                    "day" => "4",
                    "name" => "Wednesday",
                    "checked" => false,
                ),
                array(
                         "day" => "5",
                    "name" => "Thursday",
                    "checked" => false,
                ),
                array(
                          "day" => "6",
                    "name" => "Friday",
                    "checked" => false,
                ),
                array(
                          "day" => "7",
                    "name" => "Saturday",
                    "checked" => false,
                )
            );


        // $shift_info[0]['shift_array']= json_encode($contacts);

        if (count($shift_info)) {

            #build success response
            return AdminUtilitiesCommon::buildResponse(
                            AdminUtilities::SUCCESS
                            , ''
                            , $shift_info[0]);
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
    public function updateOrCreateShift(Request $request) {

        #get inputs
        $shiftId = $request->input('shift_id');
        $shiftstime = $request->input('shift_name');
        $type = $request->input('type');
        $PHP_AUTH_USER = "krishna@ytel.co.in";
        $ip = $request->ip();
        $inputs = $request->all();

        unset($inputs['type']);

        #check for duplicate script
        
        $shift_info = VicidialShift::findShift($shiftId,$type)->toArray();

        if (count($shift_info)) {
                 return AdminUtilitiesCommon::buildResponse(
                                AdminUtilities::ERROR
                                , AdminUtilitiesErrors::SHIFT_RECORD_CREATED_ERROR);
        }


        if ($type == 'edit') {
            #update script
            $result = VicidialScript::updateShift($shiftId, $inputs);

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

            $result = VicidialShift::makeShift($inputs);
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


    /**
     * Set voice mail active
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $request
     * @return array
     */
    public function setVoicemailActive(Request $request) {
        try {

            #get inputs id & status
            $active = $request->input('active');
            $voicemail_id = $request->input('voicemail_id');

            #required field validation
            if ($active != '' && $voicemail_id != '') {


                $result = VicidialVoicemail::setVoicemailActive($active, $voicemail_id);

                if ($result >= 0) {

                    #add entry in admin log
                    $PHP_AUTH_USER = "krishna@ytel.co.in";
                    $SQL_log = "UPDATE vicidial_voicemail SET active='$active' WHERE voicemail_id='$voicemail_id'";

                    VicidialAdminLog::createLog([
                        'event_date' => date('Y-m-d H:i:s'),
                        'user' => $PHP_AUTH_USER,
                        'ip_address' => $request->ip(),
                        'event_section' => 'VOICEMAIL',
                        'event_type' => 'DELETE',
                        'record_id' => $voicemail_id,
                        'event_code' => 'ADMIN UPDATE VOICEMAIL',
                        'event_sql' => $SQL_log,
                        'event_note' => '',
                        'user_group' => '---ALL---']);

                    #build success response
                    return AdminUtilitiesCommon::buildResponse(
                                    AdminUtilities::SUCCESS
                                    , $active == 'Y' ? AdminUtilitiesErrors::VOICEMAIL_ACTIVATED : AdminUtilitiesErrors::VOICEMAIL_DEACTIVATED);
                } else {

                    #build update error response
                    return AdminUtilitiesCommon::buildResponse(
                                    AdminUtilities::ERROR
                                    , AdminUtilitiesErrors::VOICEMAIL_UPDATE_ERROR);
                }
            } else {
                #build update error response
                return AdminUtilitiesCommon::buildResponse(
                                AdminUtilities::ERROR
                                , AdminUtilitiesErrors::REQ_VOICEMAIL_ID_STATUS);
            }
        } catch (Exception $ex) {

            #build update error response
            return AdminUtilitiesCommon::buildResponse(
                            AdminUtilities::ERROR
                            , AdminUtilitiesErrors::VOICEMAIL_UPDATE_ERROR);
        }
    }




    /**
     * Get admin user groups list
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $request
     * @return array
     */
    // public function getAdminUserGroupLists() {

    //     $groups = VicidialUserGroup::getAll(['group_name as value', DB::raw('CONCAT(user_group," - ",group_name) as label')]);
    //     return response()->json($groups);
    // }

}
