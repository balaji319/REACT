<?php

/*
 * Controller for admin utilities 
 * @author shital<shital@ytel.com>
 * 
 */

namespace App\Http\Controllers\AdminUtilities;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\ScriptRequest;
use App\Http\Requests\ScriptCloneRequest;
use App\Traits\AccessControl;
use App\Traits\ErrorLog;
use App\Traits\Helper;
use App\VicidialScript;
use App\VicidialAdminLog;
use App\X5Log;
use App\Http\Controllers\AdminUtilities\AdminUtilitiesCommon;
use App\Http\Controllers\AdminUtilities\AdminUtilitiesConstants as AdminUtilities;
use App\Http\Controllers\AdminUtilities\AdminUtilitiesErrors;
use Exception;

class AdminUtilitiesController extends Controller {

    use ErrorLog,
        AccessControl,
        Helper;

    /**
     * Get script list
     * @author shital<shital@ytel.com>
     * @param 
     * @return \Illuminate\Http\Response
     */
    public function scriptLists(Request $request) {
        try {
             #get all scripts

           $limit = $request->get('limit') ?: \Config::get("configs.pagination_limit");
            $search = $request->get('search') ?: NULL;

            $list = VicidialScript::getAll($search, $limit);
            return response()->json(['status' => 200,'data' =>$list,'msg' => "Success"],200); 
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
       
    }
    /**
     * To create script
     * @author Shital<shital@ytel.com>
     * @param Request $request
     * @return json
     */
    public function store(ScriptRequest $request)
    {
        try {
            $user = $request->user();
            $current_company_id = $request->current_company_id;
          
            $access_type_list = $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_CREATE, $user);

            if (!empty((SYSTEM_COMPONENT_ADMIN_SCRIPT) && !in_array(SYSTEM_COMPONENT_ADMIN_SCRIPT, $access_type_list))) {
                throw new Exception('Cannot store script.',404);
            }
           
             if (VicidialScript::duplicateRecords($request['script_id'])== 0) {
                $add_script=VicidialScript::create($request->all());

                 $lastInsertId=$add_script->script_id;
            
                if ($add_script) {

                    $admin_log = new VicidialAdminLog();

                    $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                    $admin_log['user'] = $user->x5_contact_id;
                    $admin_log['ip_address'] = $this->clientIp();
                    $admin_log['event_section'] = "SCRIPTS";
                    $admin_log['event_type'] = "ADD";
                    $admin_log['record_id'] = $request['script_id'];
                    $admin_log['event_code'] = "ADMIN ADD SCRIPTS";
                    $admin_log['event_sql'] ="INSERT INTO vicidial_scripts set script_id='".$request['script_id']."', script_name='".$request['script_name']."', script_comments='".$request['script_comments']."', active='".$request['active']."', script_text='".$request['script_text']."'";
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
     * To edit script
     * @author Shital<shital@ytel.com>
     * @param $script_id
     * @return json
     */
     public function edit($script_id)
     {
         try {
            if (!isset($script_id) || $script_id == '') {
                throw new Exception('Request parameter `script_id` is empty', 400);
            }
             $vicidial_script = VicidialScript::find($script_id);

                if (!$vicidial_script) {
                     throw new Exception('This record is not present.', 404);
                }
                return response()->json(['status' => 200,'data' => $vicidial_script,'msg' => "Success."],200);
        } catch (Exception $e) {
             $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
     }

    /**
     * To update script
     * @author Shital<shital@ytel.com>
     * @param Request $request
     * @return json
     */
    public function update(ScriptRequest $request)
    {
         try {

            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $access_type_list = $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE, $user);
            if (!empty((SYSTEM_COMPONENT_ADMIN_SCRIPT) && !in_array(SYSTEM_COMPONENT_ADMIN_SCRIPT, $access_type_list))) {
                throw new Exception('Cannot update script.',400);
            }

            $originData = VicidialScript::find($request['script_id']);
            $modify_script = $originData->fill($request->all());
            $modify_script->save();

            $que = str_replace(array('{', '}'), ' ', $modify_script);
           
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
            $admin_log['event_section'] = "SCRIPTS";
            $admin_log['event_type'] = "MODIFY";
            $admin_log['record_id'] = $request['script_id'];
            $admin_log['event_code'] = "ADMIN MODIFY SCRIPTS";
            $admin_log['event_sql'] = "UPDATE vicidial_scripts SET " . $que." where script_id='".$request['script_id']."'";
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


              return response()->json(['status' => 200,'data' => $modify_script,'msg' => "Success"],200);
            
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

     /**
     * To active or deactive script
     * @author Shital<shital@ytel.com>
     * @param $staus Y/N
     * @return json
     */
    public function scriptActiveDeactive(Request $request)
    { 
        try {
            $script = VicidialScript::find($request['script_id']);
            if ($script) {
                $data['active']=$request['active'];
                $modify_script = $script->update($data);
                if ($data['active']=='Y') {
                     return response()->json(['status' => 200,'msg' => "Script Active Successfully! "],200);
                } else {
                     return response()->json(['status' => 200,'msg' => "Script De-Active Successfully!"],200);
                }
            } else {
                 throw new Exception('Record not found', 400);
            }
           
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
       
    }
    /**
     * To delete script
     * @author Shital<shital@ytel.com>
     * @param $script_id
     * @return json
     */
    public function destroy($script_id)
    {
        try {
            $script = VicidialScript::find($script_id);
            if ($script) {
                $script->delete();
                return response()->json(['status' => 200,'msg' => "Script deleted successfully! "],200);
            } else {
                 throw new Exception('Record not found', 400);
            }
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
        
                
    }
    public function scriptClone(ScriptCloneRequest $request)
    {
        try {
             $user = $request->user();
            $current_company_id = $request->current_company_id;

          
           $access_type_list = $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE, $user);
            if (!empty((SYSTEM_COMPONENT_ADMIN_SCRIPT) && !in_array(SYSTEM_COMPONENT_ADMIN_SCRIPT, $access_type_list))) {
                throw new Exception('Error.',400);
            }
            
            $duplicate_id=VicidialScript::checkDuplicate($request['new_id']);
              
            if ($duplicate_id) {
                throw new Exception('Your account do not have any system associated. Please contact Ytel support. (Error Code: ER-X5A-L-1)',401);
            }

            $script_data=VicidialScript::checkIsExist($request['from_id']);
            
            if (!$script_data) {
                throw new Exception('We can not locate your DID, please check your input.', 400);
            }

             $data=VicidialScript::getData($request['from_id']);

            unset($data['script_id']);

            

            $data['script_id']=$request['new_id'];
      

            $done=VicidialScript::create($data);

            if (!$done) {
                throw new Exception('Data could not save properly', 400);
            }
                $admin_log = new VicidialAdminLog();

                    $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                    $admin_log['user'] = $user->username;
                    $admin_log['ip_address'] = $this->clientIp();
                    $admin_log['event_section'] = "SCRIPTS";
                    $admin_log['event_type'] = "COPY";
                    $admin_log['record_id'] = $request['new_id'];
                    $admin_log['event_code'] = "ADMIN COPY SCRIPTS";
                    $admin_log['event_sql'] ="INSERT INTO vicidial_scripts set script_id='".$done->script_id."', script_name='".$done->script_name."', script_comments='".$done->script_comments."', active='".$done->active."', script_text='".$done->script_text."'";
                    $admin_log['event_notes'] = "";
                    $admin_log['user_group'] = $done->user_group;
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

           return response()->json(['status' => 200,'data' =>$request['new_id'],'msg' => "Success"],200); 

             
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
        // we have clone your script
    }


    /**
     * Set script status active/inactive
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $req
     * @return array
     */
    public function setScriptActive(Request $request) {

        try {

            #get inputs id & status
            $active = $request->input('active');
            $script_id = $request->input('script_id');

            #required field validation
            if ($active !== '' && $script_id !== '') {

                $result = VicidialScript::setScriptActive($active, $script_id);
                 $list = VicidialScript::getAll(['script_id', 'script_name', 'active']);
                if ($result >= 0) {

                    #build success response
                    return AdminUtilitiesCommon::buildResponse(
                                    AdminUtilities::SUCCESS
                                    , $active === 'Y' ? AdminUtilitiesErrors::SCRIPT_ACTIVATED : AdminUtilitiesErrors::SCRIPT_DEACTIVATED,$list);
                } else {

                    #build update error response
                    return AdminUtilitiesCommon::buildResponse(
                                    AdminUtilities::ERROR
                                    , AdminUtilitiesErrors::SCRIPT_UPDATE_ERROR,$list);
                }
            } else {
                #build update error response
                return AdminUtilitiesCommon::buildResponse(
                                AdminUtilities::ERROR
                                , AdminUtilitiesErrors::REQ_SCRIPT_ID_STATUS);
            }
        } catch (Exception $ex) {

            #build update error response
            return AdminUtilitiesCommon::buildResponse(
                            AdminUtilities::ERROR
                            , AdminUtilitiesErrors::SCRIPT_UPDATE_ERROR);
        }
    }

    /**
     * To permanently delete script
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $req
     * @return json
     */
    public function deleteScript(Request $request) {

        try {

            #get inputs id & status
            $script_id = $request->input('id');

            if ($script_id) {
                #get all inputs

                $result = VicidialScript::deleteScript($script_id);

                if ($result) {

                    #get all scripts
                    $list = VicidialScript::getAll(['script_id', 'script_name', 'active'])->toArray();

                    #add entry in admin log
                    $PHP_AUTH_USER = "krishna@ytel.co.in";
                    $SQL_log = "DELETE from vicidial_scripts WHERE script_id='$script_id'";

                    VicidialAdminLog::createLog([
                        'event_date' => date('Y-m-d H:i:s'),
                        'user' => $PHP_AUTH_USER,
                        'ip_address' => $request->ip(),
                        'event_section' => 'SCRIPTS',
                        'event_type' => 'DELETE',
                        'record_id' => $script_id,
                        'event_code' => 'ADMIN DELETE SCRIPT',
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
                                    , AdminUtilitiesErrors::SCRIPT_DELETE_ERROR);
                }
            } else {

                #build error response
                return AdminUtilitiesCommon::buildResponse(
                                AdminUtilities::ERROR
                                , AdminUtilitiesErrors::REQ_SCRIPT_ID);
            }
        } catch (Exception $ex) {
            #build error response
            return AdminUtilitiesCommon::buildResponse(
                            AdminUtilities::ERROR
                            , AdminUtilitiesErrors::SCRIPT_DELETE_ERROR);
        }
    }

    /**
     * To clone script
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $req
     * @return json
     */
    public function cloneScript(Request $request) {

        #get inputs
        $new_script_id = $request->input('new_script_id');
        $from_script_id = $request->input('from_script_id');

        #required field validation
        if ($new_script_id == '' || $from_script_id == '') {
            #build error response
            return AdminUtilitiesCommon::buildResponse(
                            AdminUtilities::ERROR
                            , AdminUtilitiesErrors::REQ_FROM_NEW_SCRIPT_ID);
        }

        #check for duplicate script
        $script_info = VicidialScript::findScript($new_script_id);

        if (count($script_info)) {
            #build error response
            return AdminUtilitiesCommon::buildResponse(
                            AdminUtilities::ERROR
                            , "Script id $new_script_id is taken, please choose another one.");
        }

        #check from script is exist
        $from_script_info = VicidialScript::findScript($from_script_id)->toArray();

        if (!count($from_script_info)) {
            #build error response
            return AdminUtilitiesCommon::buildResponse(
                            AdminUtilities::ERROR
                            , AdminUtilitiesErrors::SCRIPT_NOT_FOUND);
        } else {

            $result = VicidialScript::cloneScript($from_script_id, $new_script_id);

            if ($result) {

                #build success response
                return AdminUtilitiesCommon::buildResponse(
                                AdminUtilities::SUCCESS
                                , "We have cloned your script! Your new script id is $new_script_id"
                                , $new_script_id);
            } else {

                #build error response
                return AdminUtilitiesCommon::buildResponse(
                                AdminUtilities::ERROR
                                , AdminUtilitiesErrors::SCRIPT_CLONE_ERROR);
            }
        }
    }

    /**
     * To get script data
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $req, $id
     * @return json
     */
    public function getScript(Request $request, $id) {

        #required field validation
        if ($id == '') {
            #build error response
            return AdminUtilitiesCommon::buildResponse(
                            AdminUtilities::ERROR
                            , AdminUtilitiesErrors::REQ_SCRIPT_ID);
        }

        #check for duplicate script
        $script_info = VicidialScript::findScript($id)->toArray();

        if (count($script_info)) {

            #build success response
            return AdminUtilitiesCommon::buildResponse(
                            AdminUtilities::SUCCESS
                            , ''
                            , $script_info[0]);
        } else {
            #build error response
            return AdminUtilitiesCommon::buildResponse(
                            AdminUtilities::ERROR
                            , AdminUtilitiesErrors::SCRIPT_NOT_FOUND);
        }
    }
     
    /**
     * To edit or add new script
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $req
     * @return json
     */
    public function updateOrCreateScript(Request $request) {

        #get inputs
        $script_id = $request->input('script_id');
        $type = $request->input('type');
        $script_name = $request->input('script_name');
        $script_comments = $request->input('script_comments');
        $active = $request->input('active') == 'Y' ? 1 : 0;
        $script_text = $request->input('script_text');
        $PHP_AUTH_USER = "krishna@ytel.co.in";
        $ip = $request->ip();
        $inputs = $request->all();

        unset($inputs['type']);
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
            $result = VicidialScript::makeScript($inputs);
            if ($result) {

                #add entry in admin log
                $SQL_log = "INSERT INTO vicidial_scripts SET script_id='$script_id',script_name='$script_name',script_comments='$script_comments',active='$active',script_text='$script_text' ";

                VicidialAdminLog::createLog([
                    'event_date' => date('Y-m-d H:i:s'),
                    'user' => $PHP_AUTH_USER,
                    'ip_address' => $ip,
                    'event_section' => 'SCRIPTS',
                    'event_type' => 'ADD',
                    'record_id' => $script_id,
                    'event_code' => 'ADMIN ADD SCRIPT',
                    'event_sql' => $SQL_log,
                    'event_note' => '',
                    'user_group' => '---ALL---']);

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
