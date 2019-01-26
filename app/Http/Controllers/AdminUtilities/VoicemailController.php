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
use App\Traits\AccessControl;
use App\Traits\ErrorLog;
use App\Traits\Helper;
use App\VicidialVoicemail;
use App\VicidialAdminLog;
use App\VicidialUserGroup;
use App\SystemSetting;
use App\Servers;
use App\X5Log;
use App\Http\Controllers\AdminUtilities\AdminUtilitiesConstants as AdminUtilities;
use App\Http\Controllers\AdminUtilities\AdminUtilitiesErrors;
use Exception;

class VoicemailController extends Controller {
    use ErrorLog,
        AccessControl,
        Helper;


    /**
     * Get voice mail list
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $request
     * @return array
     */
    public function voicemailLists(Request $request) {
        try {
              $limit = $request->get('limit') ?: \Config::get("configs.pagination_limit");

               $search = $request->get('search') ?: NULL;
            $list = VicidialVoicemail::getAll($search, $limit);

         return response()->json(['status' => 200,'data'=>$list,'msg' => "Success"],200);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

     /**
     * To active or deactive voicemail
     * @author Shital<shital@ytel.com>
     * @param $active Y/N
     * @return Response $response
     */
    public function voicemailActiveDeactive(Request $request)
    {
        try {
            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $voicemail = VicidialVoicemail::find($request['voicemail_id']);
            if ($voicemail) {
                $data['active']=$request['active'];
                $modify_voicemail = $voicemail->update($data);

                $admin_log = new VicidialAdminLog();
                    $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                    $admin_log['user'] = $user->x5_contact_id;
                    $admin_log['ip_address'] = $this->clientIp();
                    $admin_log['event_section'] = "VOICEMAIL";
                    $admin_log['event_type'] = "UPDATE";
                    $admin_log['record_id'] = $request['voicemail_id'];
                    $admin_log['event_code'] = "ADMIN UPDATE VOICEMAIL";
                    $admin_log['event_sql'] ="UPDATE vicidial_voicemail SET active='".$request['active']."' WHERE voicemail_id='".$request['voicemail_id']."'";
                    $admin_log['event_notes'] = "";

                    $admin_log->save();


                if ($data['active']=='Y') {
                     return response()->json(['status' => 200,'msg' => "Voicemail Active Successfully! "],200);
                } else {
                     return response()->json(['status' => 200,'msg' => "Voicemail De-Active Successfully!"],200);
                }
            } else {
                 throw new Exception('Record not found', 400);
            }

        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }
    public function store(Request $request)
    {
        try {
            // return $request->all();
            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $access_type_list = $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_CREATE, $user);

            if (!empty((SYSTEM_COMPONENT_ADMIN_VOICEMAIL) && !in_array(SYSTEM_COMPONENT_ADMIN_VOICEMAIL, $access_type_list))) {
                throw new Exception('Cannot store script.',404);
            }

             if (VicidialVoicemail::duplicateRecords($request['voicemail_id'])== 0) {
                $add_voicemail=VicidialVoicemail::create($request->all());

                 $lastInsertId=$add_voicemail->voicemail_id;

                if ($add_voicemail) {

                    $admin_log = new VicidialAdminLog();

                    $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                    $admin_log['user'] = $user->x5_contact_id;
                    $admin_log['ip_address'] = $this->clientIp();
                    $admin_log['event_section'] = "VOICEMAIL";
                    $admin_log['event_type'] = "ADD";
                    $admin_log['record_id'] = $request['voicemail_id'];
                    $admin_log['event_code'] = "ADMIN ADD VOICEMAIL";
                    $admin_log['event_sql'] ="INSERT INTO vicidial_voicemail set voicemail_id='".$request['voicemail_id']."', pass='".$request['pass']."', fullname='".$request['fullname']."', active='".$request['active']."', email='".$request['email']."', delete_vm_after_email='".$request['delete_vm_after_email']."', voicemail_greeting='".$request['voicemail_greeting']."',voicemail_options='".$request['voicemail_options']."'";
                    $admin_log['event_notes'] = "";

                    $admin_log->save();

                    $x5_log_data=new X5Log;
                    $x5_log_data['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
                    $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
                    $x5_log_data['company_id'] = $user->company_id;
                    $x5_log_data['user_ip'] = $this->clientIp();
                    $x5_log_data['class'] = "ScriptController";
                    $x5_log_data['method'] = __FUNCTION__;
                    $x5_log_data['model'] = User::class;
                    $x5_log_data['action_1'] = "ADD";
                    $x5_log_data->save();


                        $system_setting=SystemSetting::select('active_voicemail_server')->get();

                         $active_voicemail_server = "";
                        if (count($system_setting) > 0) {
                            $active_voicemail_server = $system_setting[0]['active_voicemail_server'];
                        }

                        $server=Servers::first();
                        // return $servers;
                        $data['rebuild_conf_files']='Y';
                        $data['sounds_update']='Y';
                        $data['generate_vicidial_conf']='Y';
                        $data['active_asterisk_server']='Y';
                        $data['server_ip']=$active_voicemail_server;

                        $server->update($data);
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
     * To edit voicemail
     * @author Shital<shital@ytel.com>
     * @param $voicemail_id
     * @return json
     */
    public function voicemailEdit($voicemail_id)
    {
        try {
            if (!isset($voicemail_id) || $voicemail_id == '') {
                throw new Exception('Request parameter `voicemail_id` is empty', 400);
            }
            $voicemail = VicidialVoicemail::find($voicemail_id);
            if (!$voicemail) {
                throw new Exception('This record is not present.', 404);
            }

            return response()->json(['status' => 200,'data'=>$voicemail,'msg' => "Success"],200);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }

    }
      /**
     * To update Voicemail
     * @author Shital<shital@ytel.com>
     * @param Request $request
     * @return json
     */
    public function update(Request $request)
    {
         try {
            // return $request->all();
            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $access_type_list = $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE, $user);
            //return $access_type_list;

            if (!empty((SYSTEM_COMPONENT_ADMIN_VOICEMAIL) && !in_array(SYSTEM_COMPONENT_ADMIN_VOICEMAIL, $access_type_list))) {
                throw new Exception('Cannot store voicemail.',404);
            }

            $originData = VicidialVoicemail::find($request['voicemail_id']);

            if (!$originData) {
                throw new Exception('This record is not present.', 404);
            }
            $modify_voicemail = $originData->fill($request->all());
            $modify_voicemail->save();



              $admin_log = new VicidialAdminLog();

            $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log['user'] = $user->x5_contact_id;
            $admin_log['ip_address'] = $this->clientIp();
            $admin_log['event_section'] = "VOICEMAIL";
            $admin_log['event_type'] = "MODIFY";
            $admin_log['record_id'] = $request['voicemail_id'];
            $admin_log['event_code'] = "ADMIN MODIFY VOICEMAIL";
            $admin_log['event_sql'] = "UPDATE vicidial_voicemail SET voicemail_id='".$request['voicemail_id']."',pass='".$request['pass']."',full_name='".$request['fullname']."',active='".$request['active']."',email='".$request['email']."',user_group='' WHERE voicemail_id='".$request['voicemail_id']."' ";
            $admin_log['event_notes'] = "";
            $admin_log->save();

                    $x5_log_data=new X5Log;
                    $x5_log_data['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
                    $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
                    $x5_log_data['company_id'] = $user->company_id;
                    $x5_log_data['user_ip'] = $this->clientIp();
                    $x5_log_data['class'] = "ScriptController";
                    $x5_log_data['method'] = __FUNCTION__;
                    $x5_log_data['model'] = User::class;
                    $x5_log_data['action_1'] = "MODIFY";
                    $x5_log_data->save();


                    $system_setting=SystemSetting::select('active_voicemail_server')->get();

                         $active_voicemail_server = "";
                        if (count($system_setting) > 0) {
                            $active_voicemail_server = $system_setting[0]['active_voicemail_server'];
                        }

                        $server=Servers::first();
                        // return $servers;
                        $data['rebuild_conf_files']='Y';
                        $data['sounds_update']='Y';
                        $data['generate_vicidial_conf']='Y';
                        $data['active_asterisk_server']='Y';
                        $data['server_ip']=$active_voicemail_server;

                        $server->update($data);
             return response()->json(['status' => 200,'msg' => "Successfully Updated"],200);

        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }
    /**
     * To edit voicemail
     * @author Shital<shital@ytel.com>
     * @param $voicemail_id
     * @return json
     */
    public function voicemailDelete(Request $request)
    {

        try {
             $user = $request->user();
            $current_company_id = $request->current_company_id;
            if (!isset($request['voicemail_id']) || $request['voicemail_id'] == '') {
                throw new Exception('Request parameter `voicemail_id` is empty', 400);
            }
            $voicemail = VicidialVoicemail::find($request['voicemail_id']);
            if ($voicemail) {
                $voicemail->delete();

                 $admin_log = new VicidialAdminLog();
                    $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                    $admin_log['user'] = $user->x5_contact_id;
                    $admin_log['ip_address'] = $this->clientIp();
                    $admin_log['event_section'] = "VOICEMAIL";
                    $admin_log['event_type'] = "DELETE";
                    $admin_log['record_id'] = $request['voicemail_id'];
                    $admin_log['event_code'] = "ADMIN DELETE VOICEMAIL";
                    $admin_log['event_sql'] ="DELETE from vicidial_voicemail where voicemail_id='".$request['voicemail_id']."'";
                    $admin_log['event_notes'] = "";

                    $admin_log->save();

                return response()->json(['status' => 200,'msg' => "Voicemail deleted successfully! "],200);
            } else {
                 throw new Exception('Record not found', 400);
            }
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
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
     * Delete voice mail
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $request
     * @return array
     */
    public function deleteVoicemail(Request $request) {
        try {

            #get inputs id & status
            $voicemail_id = $request->input('voicemail_id');

            if ($voicemail_id) {
                #get all inputs

                $result = VicidialVoicemail::deleteVoicemail($voicemail_id);

                if ($result) {

                    #get all scripts
                    $list = VicidialVoicemail::getAll(['voicemail_id',
                                'fullname',
                                'active',
                                'messages',
                                'old_messages',
                                'delete_vm_after_email',
                                'user_group'])->toArray();

                    #add entry in admin log
                    $PHP_AUTH_USER = "krishna@ytel.co.in";
                    $SQL_log = "DELETE from vicidial_voicemail WHERE voicemail_id='$voicemail_id'";

                    VicidialAdminLog::createLog([
                        'event_date' => date('Y-m-d H:i:s'),
                        'user' => $PHP_AUTH_USER,
                        'ip_address' => $request->ip(),
                        'event_section' => 'VOICEMAIL',
                        'event_type' => 'DELETE',
                        'record_id' => $voicemail_id,
                        'event_code' => 'ADMIN DELETE VOICEMAIL',
                        'event_sql' => $SQL_log,
                        'event_note' => '',
                        'user_group' => '---ALL---']);

                    #build success response
                    return AdminUtilitiesCommon::buildResponse(
                                    AdminUtilities::SUCCESS
                                    , AdminUtilitiesErrors::RECORD_DELETED, $list);
                } else {
                    #build error response
                    return AdminUtilitiesCommon::buildResponse(
                                    AdminUtilities::ERROR
                                    , AdminUtilitiesErrors::VOICEMAIL_DELETE_ERROR);
                }
            } else {

                #build error response
                return AdminUtilitiesCommon::buildResponse(
                                AdminUtilities::ERROR
                                , AdminUtilitiesErrors::REQ_VOICEMAIL_ID);
            }
        } catch (Exception $ex) {

            #build error response
            return AdminUtilitiesCommon::buildResponse(
                            AdminUtilities::ERROR
                            , AdminUtilitiesErrors::VOICEMAIL_DELETE_ERROR);
        }
    }

    /**
     * Get voice mail by id
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $request
     * @return array
     */
    public function getVoicemail(Request $request, $id) {
        #required field validation
        if ($id == '') {
            #build error response
            return AdminUtilitiesCommon::buildResponse(
                            AdminUtilities::ERROR
                            , AdminUtilitiesErrors::REQ_VOICEMAIL_ID);
        }

        #check for duplicate script
        $voicemail_info = VicidialVoicemail::findVoicemail($id)->toArray();

        if (count($voicemail_info)) {

            #build success response
            return AdminUtilitiesCommon::buildResponse(
                            AdminUtilities::SUCCESS
                            , ''
                            , $voicemail_info[0]);
        } else {
            #build error response
            return AdminUtilitiesCommon::buildResponse(
                            AdminUtilities::ERROR
                            , AdminUtilitiesErrors::VOICEMAIL_NOT_FOUND);
        }
    }

    /**
     * Make or update voice mail
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $request
     * @return array
     */
    public function updateOrCreateVoicemail(Request $request) {

    }

    /**
     * Get timezones list
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $request
     * @return array
     */
    public function getVoicemailTimezones() {

        #get timezones
        $VoicemailTimezones = SystemSetting::getAll(['voicemail_timezones'])->toArray();

        #split by \n
        $zones = explode("\n", $VoicemailTimezones[0]['voicemail_timezones']);

        $zone_lists = [];
        foreach ($zones as $zone) {

            if (strlen($zone) > 5) {
                $temp_zone = explode("=", $zone);
                $zone_lists [] = [
                    'value' => $temp_zone[0],
                    'label' => $temp_zone[1]
                ];
            }
        }

        return response()->json($zone_lists);
    }

    /**
     * Get admin user groups list
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $request
     * @return array
     */
    public function getAdminUserGroupLists() {

        $groups = VicidialUserGroup::getAll(['group_name as value', DB::raw('CONCAT(user_group," - ",group_name) as label')]);
        return response()->json($groups);
    }

}
