<?php

namespace App\Http\Controllers\Numbers;

use Illuminate\Http\Request;
use App\Http\Requests\NumberCallRecordingRequest;
use App\Http\Requests\NumberUpdateRequest;
use App\Http\Requests\NumberRequest;
use App\Http\Controllers\Controller;
use App\VicidialInboundDid;
use App\Traits\AccessControl;
use App\Traits\ErrorLog;
use App\Traits\Helper;
use App\VicidialFilterPhoneGroup;
use App\Http\Resources\Number as NumberResource;
use App\VicidialAdminLog;
use App\X5Log;
use App\VicidialCloserLog;
use App\RecordingLog;
use App\VicidialUsers;
use Exception;
use Rap2hpoutre\FastExcel\FastExcel;

class NumbersController extends Controller {

    use ErrorLog,
        AccessControl,
        Helper;

    /**
     * Instantiate a new controller instance.
     *
     * @return void
     */
    public function __construct() {
        $this->middleware('is_superadmin');
    }

    /**
     * List of all numbers
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws \App\Http\Controllers\Numbers\Exception
     */
    public function index(Request $request) {
        try {
            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $limit = $request->get('limit') ?: \Config::get("configs.pagination_limit");
            $search = $request->get('search') ?: NULL;
            $campaign_id = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_CAMPAIGN, ACCESS_READ, $current_company_id, $user);
            $numbers = VicidialInboundDid::numbersList($campaign_id, $search, $limit);
            return NumberResource::collection($numbers)->additional(['status' => 200, 'message' => 'Success']);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * edit number
     * @author shital
     * @param type $data_id
     * @param type $fields
     * @return \Illuminate\Http\Response
     */
    public function numberEdit($data_id) {
        try {

            $vicidial_inbound_dids = VicidialInboundDid::where('did_pattern', $data_id)->first();

            if (!$vicidial_inbound_dids) {

                throw new Exception('This record is not present.',404);
            }
           return response()->json(['status' => 200,'data' => $vicidial_inbound_dids,'msg' => "Success"],200);

        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;

        }
    }

    /**

    * update number
    * @author shital
    * @param Request $request
    * @return  \Illuminate\Http\Response
    */
    public function numberUpdate(NumberUpdateRequest $request)
    {
        try{
                $did_pattern=$request['did_pattern'];
                $user = $request->user();
                $current_company_id = $request->current_company_id;
                        // $permissions_list = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_INGROUP,ACCESS_READ,$current_company_id, $user);

                $access_type_list=$this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE,$user);

                if (!empty((SYSTEM_COMPONENT_INBOUND_NUMBER) && !in_array(SYSTEM_COMPONENT_INBOUND_NUMBER, $access_type_list))) {
                    throw new Exception('Cannot update inbound Queue.',404);
                }

                     $originData =VicidialInboundDid::where('did_pattern',$did_pattern)->first();
                     if (!$originData) {
                        throw new Exception('Record not found.',404);
                     }
                     $originData=$originData->fill($request->all());
                     $originData->save();


                      // $reset_list = trim($request['reset_list']);

                       $list_order_randomize = $request['list_order_randomize'];
                        if ($list_order_randomize != "") {

                            $campaign_id1 = $request['campaign_id'];
                            $campaign=VicidialCampaign::find($campaign_id1);
                            $data['lead_order_randomize']=$list_order_randomize;
                            $campaign->fill($data)->save();
                        }

                            $admin_log = new VicidialAdminLog();

                            $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                            $admin_log['user'] = $user->x5_contact_id;
                            $admin_log['ip_address'] = $this->clientIp();
                            $admin_log['event_section'] = "DIDS";
                            $admin_log['event_type'] = "MODIFY";
                            $admin_log['record_id'] = $request['did_pattern'];
                            $admin_log['event_code'] = "ADMIN MODIFY DID";
                            $admin_log['event_sql'] ="UPDATE vicidial_inbound_dids SET did_description='".$request['did_description']."',did_active='".$request['did_active']."',did_route='".$request['did_route']."',extension='".$request['extension']."',voicemail_ext='".$request['voicemail_ext']."',filter_inbound_number='".$request['filter_inbound_number']."' WHERE did_pattern='".$request['did_pattern']."'";
                            $admin_log['event_notes'] = "";
                            $admin_log['user_group'] = $originData->user_group;
                            $admin_log->save();

                            $x5_log_data=new X5Log;
                            $x5_log_data['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
                            $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
                            $x5_log_data['company_id'] = $user->company_id;
                            $x5_log_data['user_ip'] = $this->clientIp();
                            $x5_log_data['class'] = "NumberController";
                            $x5_log_data['method'] = __FUNCTION__;
                            $x5_log_data['model'] = User::class;
                            $x5_log_data['action_1'] = "MODIFY";
                            $x5_log_data->save();

           return response()->json(['status' => 200,'msg' => "Successfully modified"],200);


        } catch(Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Number Clone
     * @author shital
     * @param Request $request
     * @return  \Illuminate\Http\Response
     */
    public function numberClone(NumberRequest $request) {
        try {

            $data = [];

            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $permissions_list=$this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_CREATE,$user);

            if (!empty(SYSTEM_COMPONENT_INBOUND_NUMBER) && !in_array(SYSTEM_COMPONENT_INBOUND_NUMBER, $permissions_list)) {
                throw new ForbiddenException('Forbidden - SC');
            }


            $vicidial_inbound_did = new VicidialInboundDid;


                $duplicate_id=$vicidial_inbound_did->checkDuplicate($request['new_id']);

                if ($duplicate_id) {
                    throw new Exception('Your account do not have any system associated. Please contact Ytel support. (Error Code: ER-X5A-L-1)',401);
                }

                $from_model=$vicidial_inbound_did->checkIsExist($request['from_id']);

                if (!$from_model) {
                    throw new Exception('We can not locate your DID, please check your input.', 400);
                }

            unset($from_model['did_id']);
            $data = $vicidial_inbound_did->getData($request['from_id']);

            $data['did_pattern'] = $request['new_id'];



            $done=$vicidial_inbound_did->create($data);

            $que = str_replace(array('{', '}'), ' ', $done);
            $que = str_replace(':', '=', $que);

                if (!$done) {
                    throw new Exception('Data could not save properly', 400);
                }

                    $admin_log = new VicidialAdminLog();

                    $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
                    $admin_log['user'] = $user->username;
                    $admin_log['ip_address'] = $this->clientIp();
                    $admin_log['event_section'] = "DIDS";
                    $admin_log['event_type'] = "COPY";
                    $admin_log['record_id'] = $request['new_id'];
                    $admin_log['event_code'] = "ADMIN COPY DID";
                    $admin_log['event_sql'] ="INSERT into vicidial_inbound_dids SET ".$que;
                    $admin_log['event_notes'] = "";
                    $admin_log['user_group'] = $vicidial_inbound_did->user_group;
                    $admin_log->save();

                    $x5_log_data=new X5Log;
                    $x5_log_data['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
                    $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
                    $x5_log_data['company_id'] = $user->company_id;
                    $x5_log_data['user_ip'] = $this->clientIp();
                    $x5_log_data['class'] = "NumberController";
                    $x5_log_data['method'] = __FUNCTION__;
                    $x5_log_data['model'] = User::class;
                    $x5_log_data['action_1'] = "MODIFY";
                    $x5_log_data->save();

           return response()->json(['status' => 200,'new_id' =>$request['new_id'],'msg' => "Successfully updated"],200);

        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
             throw $e;
        }

     }
      /**
    * Delete DID
    * @author shital
    * @param $type
    * @return \Illuminate\Http\Response
    */
    public function deleteDid(Request $request) {
        try {
            $did_pattern= $request->did_pattern;
            $result =VicidialInboundDid::where('did_pattern',$did_pattern)->first();
            if ($result) {
                $result->delete();
            } else {
                throw new Exception('Record not found', 400);
            }

            return response()->json(['status' => 200,'msg' => "Successfully Deleted"],200);

        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * number option list
     * @author shital
     * @param Request $request
     * @return  \Illuminate\Http\Response
     */
    public function numberOptionList(Request $request) {
        try {
            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $list = VicidialInboundDid::orderBy('did_pattern', 'desc')->get(['did_pattern']);

                    return response()->json([
                            'status' => 200,
                           'data' => $list,
                            'msg' => "Success"
                        ],200);

        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * filter Phone Group Option List
     * @author shital
     * @return  json Response
     */
    public function filterPhoneGroupOptionList() {
        try {

             $list=VicidialFilterPhoneGroup::orderBy('filter_phone_group_id','desc')->pluck('filter_phone_group_id')->toArray();

            return response()->json(['status' => 200,'data' => $list,'msg' => "Success"],200);

        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

   /**
    * number Call Recording List
    * @author shital
    * @param Request $request
    * @return  \Illuminate\Http\Response
    */
    public function numberCallRecording(NumberCallRecordingRequest $request)
        {
            try {


                    $STARTtime = date("U");
                    $TODAY = date("Y-m-d");


                    if (!empty($request['enddate']) && !empty($request['startdate'])) {
                        $end_date = $request['enddate'];
                        $begin_date = $request['startdate'];
                    } else {
                        $end_date=date('Y-m-d H:i:s');
                        $begin_date=date('Y-m-d H:i:s');
                    }
                    $did = $request['did'];


                    // $inboundcalls=VicidialCloserLog::
                    $inboundcalls=VicidialCloserLog::getAll($did,$end_date,$begin_date);



                       $u = 0;
                        $TOTALinSECONDS = 0;
                        $TOTALagentSECONDS = 0;
                        $total_inboundcalls = count($inboundcalls);
                        $AGENTsecondsArray=array();
                        $recordings=array();
                        while ($u < $total_inboundcalls) {

                            $TOTALinSECONDS = ($TOTALinSECONDS + $inboundcalls[$u]['length_in_sec']);
                            $AGENTseconds = ($inboundcalls[$u]['length_in_sec'] - $inboundcalls[$u]['queue_seconds']);
                            if ($AGENTseconds < 0) {
                                $AGENTseconds = 0;
                            }

                            array_push($AGENTsecondsArray, $AGENTseconds);
                            $TOTALagentSECONDS = ($TOTALagentSECONDS + $AGENTseconds);

                            $recordings=RecordingLog::getData($inboundcalls[$u]['uniqueid']);


                            if(count($recording)>0){
                                $recordings[]=$recording;
                            }
                            $u++;
                        }

                        return response()->json(['status' => 200,'inboundcalls' => $inboundcalls,'TOTALinSECONDS' => $TOTALinSECONDS,'AGENTsecondsArray' => $AGENTsecondsArray,'TOTALagentSECONDS' => $TOTALagentSECONDS,'recording' => $recordings,'msg' => "Success"],200);


            } catch (Exception $e) {
               $this->postLogs(config('errorcontants.mysql'), $e);
                throw $e;

            }
    }

    /**
     * download csv for call and recording
     * @author Shital chavan
     * @param Request $request
     * @return type
     */
    public function inboundExportCsv(NumberCallRecordingRequest $request)
    {
        try {

                $STARTtime = date("U");
                $TODAY = date("Y-m-d");


                if (!empty($request['enddate']) && !empty($request['startdate'])) {
                    $end_date = $request['enddate'];
                    $begin_date = $request['startdate'];
                } else {
                    $end_date=date('Y-m-d H:i:s');
                    $begin_date=date('Y-m-d H:i:s');
                }
                if (empty($request['type'])) {
                   throw new Exception('please check your input',400);
                }
                $did = $request['did'];
                $type=$request['type'];

                $builder=VicidialCloserLog::getAll($did,$end_date,$begin_date);


               if($builder->isEmpty()){
                throw new Exception('No data found',400);
               }


                if ($type=='Closer_Calls') {
                    $u = 0;

                    $total_inboundcalls = count($builder);

                    $uniqueid=array();
                    while ($u < $total_inboundcalls) {

                       $uniqueid[]=$builder[$u]['uniqueid'];

                        $u++;
                    }
                    $recordings=RecordingLog::getData($uniqueid);

                   // return response()->json($recordings, 200);

                    echo (new FastExcel($recordings))->download('file.csv');

                } else {
                  //  return response()->json($builder, 200);
                    echo  (new FastExcel($builder))->download('file.csv');

                }
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

     /**
     * Mass update phone numbers
     * @author Shital chavan
     * @param Request $request
     * @return type
     */
    public function numberMassUpdate(Request $request)
    {
         try {
                $updateFields = [];
                $updateIn=array();
                $updateIn = [];

                $allowedChangeFields=VicidialInboundDid::getAllowedChangeFields();

                for ($i = 0, $c = count($allowedChangeFields); $i < $c; $i++) {
                    $result['k'][] = $allowedChangeFields[$i];
                    if (!empty($request['did'][$allowedChangeFields[$i]])) {
                      $updateFields[$allowedChangeFields[$i]] =$request['did'][$allowedChangeFields[$i]];
                    }
                }

                if (count($updateFields) == 0) {
                    throw new Exception('No fields need to update.');
                }

                $updateIn =explode(',', $request['did']['list']);


                $result['$updateFields'] = $updateFields;

                 // exit();
                $updateDids=VicidialInboundDid::whereIn('did_pattern',$updateIn)->update($updateFields);

                return response()->json(['status' => 200,'data' =>$updateFields,'msg' => "Success"],200);
                // $result['status'] = 1;
            } catch (Exception $e) {
               $this->postLogs(config('errorcontants.mysql'), $e);
               throw $e;
            }

    }

}
