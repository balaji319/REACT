<?php

namespace App\Http\Controllers\Report;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Model;
use App\ReportFile;
use App\Traits\AccessControl;
use Response;
use App\Traits\TimeConvert;
use App\X5ContactLink;
use App\ReportFileQueue;

class ProcessReportController extends Controller {

    use AccessControl, TimeConvert;
    
    /**
     * Process request file which requested by users..
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @return all file list which requested.
     * @throws \App\Http\Controllers\Report\Exception
     */
    public function index(Request $request) {
        try {
            
            $user_detail = $request->user();
            $db_id = $user_detail->db_last_used;
            $comp_id = X5ContactLink::select('link_id')->where([['x5_contact_id',$user_detail->x5_contact_id],['link_type','company_id']])->get();
            $company_id = [];
            if(isset($comp_id)) {
                foreach ($comp_id as $key => $val ) {
                    $company_id[] = $val->link_id;
                }
                $company_id[] = $user_detail->company_id;
            }
            $utc_offset=0;                                
            if(!is_null($user_detail->timezone)){
                date_default_timezone_set($user_detail->timezone);
            }else{
                date_default_timezone_set('America/Los_Angeles');
            }
            $utc_offset =  date('Z') / 3600;
            
            $result = ReportFile::processReport($request,$company_id,$db_id ,$utc_offset);
            
            return response()->json([
                'status' => '201',
                'msg' => "successfully.",
                'data'=> $result
            ]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }
    
    /**
     * Api for report file queue list.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param Request $request
     * @return type
     * @throws \App\Http\Controllers\Report\Exception
     */
    public function getReportFileQueueList(Request $request){
        try {
            $user_detail = $request->user();
            $db_id = $user_detail->db_last_used;
            $comp_id = X5ContactLink::select('link_id')->where([['x5_contact_id',$user_detail->x5_contact_id],['link_type','company_id']])->get();
            $company_id = [];
            if(isset($comp_id)) {
                foreach ($comp_id as $key => $val ) {
                    $company_id[] = $val->link_id;
                }
                $company_id[] = $user_detail->company_id;
            }
            
            $result = ReportFileQueue::getReportFileQueueList($request,$company_id,$db_id);
            
            return response()->json([
                'status' => '201',
                'msg' => "successfully.",
                'data'=> $result
            ]);
            
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
        
    }
}
