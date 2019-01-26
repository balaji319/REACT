<?php

namespace App\Http\Controllers\Recording;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Response;
use Exception;
use App\RecordingLog;
use DB;
use Config;
use App\Traits\AccessControl;
class RecordingLogController extends Controller
{
    use AccessControl;
     public function getRecordingLogs(Request $request)
    {
    	try{

          $user = $request->user();
          $array_allowed_group= $this->getListByAccess(ACCESS_TYPE_RECORDING, ACCESS_READ,$user);
          // return $array_allowed_group;
          $this->autoRender = false;
          // return $array_allowed_group;
      		$company_id = $request->user()->company_id;

      		// $extended_rec_setting_token= Config::get('configs.extended_rec_setting_token');
      		// return $extended_rec_setting_token;
  	        $extended_recording_plan = 0; //de-active
  	        //check if extended recording plan is active
  	        $extended_rec_setting = file_get_contents("https://my.ytel.com/api/getExtendedRecordingSetting.json?token=oR0qzNLkIkXZHYkiqFIyw0nw0WPhEShcI79gZ5tn&company_id=$company_id");
  	             // return $extended_rec_setting;

  	            $extended_rec_array = json_decode($extended_rec_setting, true);


                 // return $extended_rec_array;
  	            // return $extended_rec_array['ViciRecordingLog.ccc_recording'];

  	           if ($extended_rec_array['ccc_recording'] == 1) { //active
	               $extended_recording_plan = 1;
	            }
	            // return $request['start_date'];
	            $start_date = (($request['start_date'] != '') ? $request['start_date'] : date('Y-m-d', strtotime('yesterday')));
                $end_date = (($request['end_date'] != '') ? $request['end_date'] : date('Y-m-d'));

                $limit = $request->get('limit') ?: \Config::get("configs.pagination_limit");

                $lead_id = trim($request['lead_id']);
                $user = trim($request['user']);
                $phonenumber = trim($request['phonenumber']);
                $selectedcampaigns = $request['selectedcampaigns'];

                $order_by = $request['order'];




	            if (isset($start_date) && $start_date != '') {
                    $start_date = date('Y-m-d', strtotime($start_date))." 00:00:00";
                }
                if (isset($end_date) && $end_date != '') {
                    $end_date = date('Y-m-d', strtotime($end_date))." 23:59:59";
                }

                // $explode_id = json_decode($array_allowed_group, true);

                // if(isset($array_allowed_group)){
                //     // $allowed_group = json_decode($array_allowed_group, true);
                //     $array_str_allowed_group = array_map(function ($array) { return '"'."$array".'"'; }, $array_allowed_group);
                //     $str_allowed_group =  implode(",",$array_str_allowed_group);
                //     $query=$query->whereIn('vicidial_users.user_group',$array_allowed_group);
                //     }
              // return $asd;

                 $query = RecordingLog::join('vicidial_users', 'recording_log.user', '=','vicidial_users.user' )->select('recording_log.*', 'vicidial_users.user_group', 'vicidial_users.full_name');


                if ($extended_recording_plan == 1) { //indefinitely
		        	$query=$query->where('end_time', '<=' ,$end_date)->where('start_time', '>=', $start_date);
                } else { //last 1 year
		        	$query=$query->where('end_time', '<=' ,$end_date)->where('start_time', '>=', $start_date)->where('start_time', '>=','DATE_SUB(NOW(),INTERVAL 1 YEAR)');
                }

                 // return $query;
		     // return $user;
               if (isset($user) && $user != '')
               {
               		$query=$query->where('user',$user);
               }
               if (isset($lead_id) && $user != '') {
               	    $query=$query->where('lead_id',$lead_id);
               }
               if (isset($phonenumber) && $request['phonenumber']!='') {
               		$query=$query->where('location','LIKE','%\_'.$phonenumber.'%');
               }

                 if ($extended_recording_plan == 1) { //indefinitely
                        $conditions['and'] = array('end_time <= ' => $end_date, 'start_time >= ' => $start_date);

                    } else { //last 1 year
                        $conditions['and'] = array('end_time <= ' => $end_date, 'start_time >= ' => $start_date, 'start_time >= DATE_SUB(NOW(),INTERVAL 1 YEAR)');
                    }

                    if(isset($array_allowed_group)){
                        // $allowed_group = json_decode($array_allowed_group, true);
                        $array_str_allowed_group = array_map(function ($array) { return '"'."$array".'"'; }, $array_allowed_group);
                        $str_allowed_group =  implode(",",$array_str_allowed_group);
                        $query=$query->whereIn('vicidial_users.user_group',$array_allowed_group);
                        }

	            $recording_logs =$query->orderBy('recording_id','desc')->paginate($limit);

	           	//group by user
	            // $result = $recording_logs->groupBy(['user'], $preserveKeys = true);


               return response()->json(['status' => 200,'msg' => 'Success!','data'=>$recording_logs,'extended_recording_plan' => $extended_recording_plan],200);
	            // return json_encode(array('status'=>'200',"message"=>"Success",'response'=>$recording_logs,'extended_recording_plan' => $extended_recording_plan));

	        } catch(Exception $e) {
             return $e->getMessage();
	        }
    }
    public function downloadMP3($file)
    {

    	 $file = base64_decode($file);
        // return $file;
       return redirect($file);

    }
    public function downloadCSV(Request $request)
    {
    	try {
             ini_set('memory_limit', '2048M');

            $company_id = $request->user()->company_id;


	        $extended_recording_plan = 0; //de-active
	        //check if extended recording plan is active
	        $extended_rec_setting = file_get_contents("https://my.ytel.com/api/getExtendedRecordingSetting.json?token=oR0qzNLkIkXZHYkiqFIyw0nw0WPhEShcI79gZ5tn&company_id=$company_id");
	             // return $extended_rec_setting;
	            $extended_rec_array = json_decode($extended_rec_setting, true);
	            // return $extended_rec_array['ViciRecordingLog.ccc_recording'];

	           if ($extended_rec_array['ccc_recording'] == 1) { //active
	               $extended_recording_plan = 1;
	            }
	            // return $request['start_date'];
	            $start_date = (($request['start_date'] != '') ? $request['start_date'] : date('Y-m-d', strtotime('yesterday')));
                $end_date = (($request['end_date'] != '') ? $request['end_date'] : date('Y-m-d'));

                $page = $request['page'];
                $lead_id = trim($request['lead_id']);
                $user = trim($request['user']);
                $phonenumber = trim($request['phonenumber']);
                $selectedcampaigns = $request['selectedcampaigns'];

                $order_by = $request['order'];

	            if (isset($start_date) && $start_date != '') {
                    $start_date = date('Y-m-d', strtotime($start_date))." 00:00:00";
                }
                if (isset($end_date) && $end_date != '') {
                    $end_date = date('Y-m-d', strtotime($end_date))." 23:59:59";
                }

                 $query = RecordingLog::join('vicidial_users', 'recording_log.user', '=','vicidial_users.user' )->select('recording_log.*', 'vicidial_users.user_group', 'vicidial_users.full_name');


              if ($extended_recording_plan == 1) { //indefinitely
		        	    $query=$query->where('end_time', '<=' ,$end_date)->where('start_time', '>=', $start_date);
              } else { //last 1 year
		        	    $query=$query->where('end_time', '<=' ,$end_date)->where('start_time', '>=', $start_date)->where('start_time', '>=','DATE_SUB(NOW(),INTERVAL 1 YEAR)');
              }


		     // return $user;
               if (isset($user) && $user != '')
               {
               		$query=$query->where('user',$user);
               }
               if (isset($lead_id) && $user != '') {
               	    $query=$query->where('lead_id',$lead_id);
               }
               if (isset($phonenumber) && $request['phonenumber']!='') {
               		$query=$query->where('location','LIKE','%\_'.$phonenumber.'%');
               }



	            $recording_logs =$query->orderBy('recording_id','desc')->get();


              if (count($recording_logs) > EXPORT_DNC_REPORT_LIMIT) {
                  $recording_logs = ["You are not allowed to download this list: "];
              }else{

              }


            // dd($phone_data);

            #the file name of the download, change this if needed
            $filename = CSV_PATH ."RecordingLog_" . date("Ymd-His").".csv";
             // $filename =date('Y-m-d H:i:s').".csv";
            $handle = fopen($filename, 'w+');
            fputcsv($handle, array('Recording ID','Extension','Start Time','End Time','Length In Sec','length_in_min','Location','Lead ID'));

            foreach($recording_logs as $row) {
                fputcsv($handle, array($row['recording_id'],$row['extension'],$row['start_time'],$row['end_time'],$row['length_in_sec'],$row['length_in_min'],$row['location'],$row['lead_id']));

            }

            fclose($handle);

            $headers = array(
                'Content-Type' => 'text/csv',
            );

            return response()->download($filename);

        } catch (Exception $e) {
           return $e->getMessage();

        }
    }



    // public function shift()
    // {
    // 	 return "sdfs";
    // 	$shiftArray =VicidialShift::get();

    //         return json_encode(array('shiftArray' => $shiftArray));
    // }
}
