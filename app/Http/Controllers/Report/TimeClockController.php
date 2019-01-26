<?php

namespace App\Http\Controllers\Report;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
Use App\VicidialUserGroup;
Use App\VicidialTimeclockLog;
use App\VicidialUser;
use App\ViciSystemSetting;
use App\VicidialTimeclockStatus;
use App\VicidialAgentLog;
use App\Traits\TimeConvert;
use App\Traits\ErrorLog;
use Carbon\Carbon;
use Response;

class TimeClockController extends Controller
{
    use TimeConvert, ErrorLog;

	/**
	*	User Group List
	*	@return [array] => $list
	*	@return [date] => $date
	*/

 	public function userGroupOptionList()
 	{
 		try{

	 		$list = VicidialUserGroup::getUserGroupList();
	 		$date = date('Y-m-d');
	 		return response()->json([
                'status' => 200,
                'message' => 'Success',
                'user_list' => $list,
                'date' => $date
            ],200);

 		}catch (Exception $e) {
            $this->postLogs(config('errorcontants.timeClock'), $e);
            throw $e;
 		}
 	}  

 	/**
	*	User Time Clock Report
	*	@param [date] => start_date
    *	@param [date] => end_date 
    *	@param [string] => order
    *	@param [array] => user_group
    *	@param [number] => user
	*	@return [array] => request_data
    *   @return [string] => query_date_begin
	*	@return [string] => query_date_end
	*	@return [integer] => total_hours
	*	@return [array] => graph_stat_html
	*	@return [integer] => max_value
	*
	*/

 	public function userTimeClockData(Request $request)
 	{
            # handle access control for permission 
            # User access control for permission need to check
            # user_group access control for permission need to check
            #		  TODO to complete

            try{

                    (isset($request['order'])) ? $order = $request['order'] : $order = "";
                    (isset($request['start_date'])) ? $start_date = $request['start_date'] : $start_date = "";
                    (isset($request['end_date'])) ? $end_date = $request['end_date'] : $end_date = "";
                    (isset($request['user_group'])) ? $user_group = $request['user_group'] : $user_group = "-ALL-";
                    (isset($request['user'])) ? $user = $request['user'] : $user = "";

                    $request_data = [
                    "start_date" => $start_date,
                            "end_date" => $end_date,
                            "order" => $order,
                            "user_group" => $user_group,
                            "user" => $user,
                    ];

                    $query_date_begin = "$start_date 00:00:00";
                    $query_date_end = "$end_date 23:59:59";

                        for ($i = 0; $i < count($user_group); $i++) {
                        if ($user_group[$i] == "-ALL-") {
                            $user_group = VicidialUserGroup::getAllUserGroup();
                            break;
                        }
                    }

                    $order_sql = '';
                    if ($order == 'hours_up') {
                        $order_sql = "vicidial_timeclock_log.login_sec";
                        $order_by = "asc";
                    }
                    if ($order == 'hours_down') {
                        $order_sql = "vicidial_timeclock_log.login_sec";
                        $order_by = "desc";
                    }
                    if ($order == 'user_up') {
                        $order_sql = "vicidial_users.user";
                        $order_by = "asc";
                    }
                    if ($order == 'user_down') {
                        $order_sql = "vicidial_users.user";
                        $order_by = "desc";
                    }
                    if ($order == 'name_up') {
                        $order_sql = "vicidial_users.full_name";
                        $order_by = "asc";
                    }
                    if ($order == 'name_down') {
                        $order_sql = "vicidial_users.full_name";
                        $order_by = "desc";
                    }
                    if ($order == 'group_up') {
                        $order_sql = "vicidial_timeclock_log.user_group";
                        $order_by = "asc";
                    }
                    if ($order == 'group_down') {
                        $order_sql = "vicidial_timeclock_log.user_group";
                        $order_by = "desc";
                    }

                    if ($user) {
                            $list = VicidialTimeclockLog::userDetails($user_group, $query_date_begin, $query_date_end, $user, $order_sql, $order_by);
                    }else{
                            $list =VicidialUser::userDetailsIfNotUser($user_group, $query_date_begin, $query_date_end, $order_sql, $order_by);
                    }

                    $high_ct = 0;
                    $i = 0;
                    $graph_stat_html = [];
                    $maxw = 0;
                    $total_hours = 0;
                    while ($i < count($list)) {
                        if ($list[$i]->login > 0) {
                            $db_hours = ($list[$i]->login / 3600);
                            $db_hours = round($db_hours, 2);
                            $db_hours = sprintf("%01.2f", $db_hours);
                        } else {
                            $db_hours = '0.00';
                        }

                        if ($db_hours > $high_ct) {
                            $high_ct = $db_hours;
                        }
                        if ($high_ct < 1) {
                            $high_ct*=10;
                        }

                        $graph_stat_html[$i][0] = $list[$i]->user." ( ".$list[$i]->full_name.")  -".$list[$i]->user_group.")";
                        $graph_stat_html[$i][1] = $db_hours;
                        $graph_stat_html[$i][2] = $list[$i]->user;
                        $graph_stat_html[$i][3] = $list[$i]->full_name;
                        $graph_stat_html[$i][4] = $list[$i]->user_group;
                        $total_hours+=$db_hours;

                        if ($db_hours > $maxw) {
                            $maxw = $db_hours;
                        }
                        $i++;
                    }
                    $total_hours = round($total_hours, 0);

                    if(isset($request['file_download']) && $request['file_download'] == '1'){

                        return $this->userTimeClockDataCsvDownload($total_hours, $graph_stat_html, $query_date_begin, $query_date_end);

                    } else {

                        return response()->json([
                            'status' => 200,
                            'request_data' => $request_data,
                            'query_date_begin' => $query_date_begin,
                            'query_date_end' => $query_date_end,
                            'total_hours' => $total_hours,
                            'graph_stat_html' => $graph_stat_html,
                            'max_value' => $maxw
                        ],200);
                    }

            }catch (Exception $e) {
                    $this->postLogs(config('errorcontants.timeClock'), $e);
                throw $e;
            }

 	}

    public function userTimeClockDataCsvDownload($total_hours, $graph_stat_html, $query_date_begin, $query_date_end) {
        try{
                $filename = "user_time_clock_data_".date('Y-m-dh:i:s').".csv";
                $handle = fopen($filename, 'w+');

                 $top_tab_header = [
                    '1' => ["User Time Clock Report - ".date('Y-m-d h:i:s')],
                    '2' => ["Time Range - ".$query_date_begin.' To '.$query_date_end],
                    '3' => ["----------USER TIME CLOCK DETAILS----------"],
                    '4' => ["These totals do NOT include any active sessions"]
                ];

                foreach ($top_tab_header as $key => $value) {
                    fputcsv($handle, $value, ";", '"');
                }
                

                $middle_tab_header = [
                    '1' => ['User', 'Name', 'Group', 'Hours']
                ];

                foreach ($middle_tab_header as $key => $value) {
                    fputcsv($handle, $value, ";", '"');
                }

                $res_data = [];
                for($i=0;$i<sizeof($graph_stat_html);$i++){

                    $res_data[$i]['user'] = $graph_stat_html[$i][2];
                    $res_data[$i]['name'] = $graph_stat_html[$i][3];
                    $res_data[$i]['group'] = $graph_stat_html[$i][4];
                    $res_data[$i]['hours'] = $graph_stat_html[$i][1];
                }

                foreach ($res_data as $key => $value) {
                    fputcsv($handle, $value, ";", '"');
                }

                $bottom_tab_header = [
                    '1' => ['Total', '', '', $total_hours]
                ];
                foreach ($bottom_tab_header as $key => $value) {
                    fputcsv($handle, $value, ";", '"');
                }


                fclose($handle);
                $headers = [
                        'Content-Type' => 'text/csv',
                ];
                return Response::download($filename, $filename, $headers)->deleteFileAfterSend(true);

            } catch (Exception $e) {
            $this->postLogs(config('errorcontants.performance_comparison_report_csv'), $e);
            throw $e;
        }
    }


 	/**
    *   User Group Time Clock Status Data
    *   @param [string] => user_group
    *   @return [string] => request_data
    *   @return [number string] => total_hr
    *   @return [array] => graph_stat_html
    *
    */

    /**
    *   User Group Time Clock Status Data csv download
    *   @param [string] => user_group
    *   @param [integer] => file_download
    *   @return [file] => .csv file
    *
    */

 	public function userGroupTimeClockStatusData(Request $request)
 	{
 		# handle access control for permission 
 		# User access control for permission need to check
 		# user_group access control for permission need to check
 		#		  TODO to complete

        try{
            date_default_timezone_set('Pacific/Midway');
     		(isset($request['user_group'])) ? $user_group = $request['user_group'] : $user_group = " ";

     		$list = ViciSystemSetting::userGroupSystemSetting()->first();
     		if($list){
                $timeclock_end_of_day = $list['timeclock_end_of_day'];
     		}

     		$start_time = Carbon::now()->timestamp;
                $today = Carbon::today()->toDateString();
                $hhmm =  Carbon::now()->format('Hi');
                $hh_teod = substr($timeclock_end_of_day, 0, 2);
                $mm_teod = substr($timeclock_end_of_day, 2, 2);

                if ($hhmm < $timeclock_end_of_day) {
                    $eod = mktime($hh_teod, $mm_teod, 10, date("m"), date("d") - 1, date("Y"));
                } else {
                    $eod = mktime($hh_teod, $mm_teod, 10, date("m"), date("d"), date("Y"));
                }

                $eoddate = date("Y-m-d H:i:s", $eod);

                $list = VicidialUser::userDetails($user_group);

                $i = 0;
                $users_to_print = $list->count();
                while($users_to_print > $i){

                    $users[$i] = $list[$i]['user'];
                    $full_name[$i] = $list[$i]['full_name'];
                    $vevent_time[$i] = '';
                    $vcampaign[$i] = '';
                    $tstatus[$i] = '';
                    $tip_address[$i] = '';
                    $tlogin_time[$i] = '';
                    $tlogin_sec[$i] = 0;
                    $tevent_epoch[$i] = '';
                    $tevent_date[$i] = '';
                    $vevent_epoch[$i] = '';
                    $i++;
                }
                $o = 0;
                $login_sec = '';
                while($users_to_print > $o){
                    $total_login_time = 0;
                    $list = VicidialTimeclockStatus::timeClockStatus($users[$o], $eod);                                                   
                    $stats_to_print = $list->count();
                    if($stats_to_print > 0){
                        $status_count = 0;
                        while ($status_count < $stats_to_print) {
                            $tevent_epoch[$o] = $list[$status_count]['event_epoch'];
                            $tevent_date[$o] = $list[$status_count]['event_date'];
                            $tstatus[$o] = $list[$status_count]['status'];
                            $tip_address[$o] = $list[$status_count]['ip_address'];
                            $status_count++;
                        }
                    }
                   
                    $list = VicidialTimeclockLog::timeClockLog($users[$o], $eod);
                    $logs_to_parse = $list->count();
                    $p = 0;
                    while ($logs_to_parse > $p) {
                        if ((preg_match('/LOGIN/', $list[$p]['event'])) or ( preg_match('/START/', $list[$p]['event']))) {
                            $login_sec = '';
                            $calculation_time = $list[$p]['event_epoch'];
                            $tevent_time[$o] = date("Y-m-d H:i:s", $list[$p]['event_epoch']);
                        }
                        if (preg_match('/LOGOUT/', $list[$p]['event'])) {
                            $login_sec = $list[$p]['login_sec'];
                            $total_login_time = ($total_login_time + $login_sec);
                        }
                        $p++;
                    }
                    
                    if ((strlen($login_sec) < 1) and ( $logs_to_parse > 0)) {
                        $login_sec = ($start_time - $calculation_time);
                        $total_login_time = ($total_login_time + $login_sec);
                    }
                    if ($logs_to_parse > 0) {
                        $total_login_hours = ($total_login_time / 3600);
                        $total_login_hours_int = round($total_login_hours, 2);
                        $total_login_hours_int = intval("$total_login_hours");
                        $total_login_minutes = ($total_login_hours - $total_login_hours_int);
                        $total_login_minutes = ($total_login_minutes * 60);
                        $total_login_minutes_int = round($total_login_minutes, 0);
                        if ($total_login_minutes_int < 10) {
                            $total_login_minutes_int = "0$total_login_minutes_int";
                        }

                        $tlogin_time[$o] = $this->secConvert($total_login_time, 'H'); 
                        $tlogin_sec[$o] = $total_login_time;
                    } else {
                        $total_login_time = 0;
                        $tlogin_time[$i] = "00:00:00";
                        $tlogin_sec[$i] = $total_login_time;
                    }
                    
                    $list = VicidialAgentLog::agentLog($users[$o], $eoddate);                    
                    $vals_to_print = $list->count();
                    if ($vals_to_print > 0) {
                        $vevent_time[$o] = $list[0]['event_time'];
                        $vevent_epoch[$o] = $list[0]['unix'];
                        $vcampaign[$o] = $list[0]['campaign_id'];
                    }
                    $o++;
                }
                $o = 0;
                $s = 0;
                $graph_stat_html = [];
                $tot_login_sec = 0;
                while ($users_to_print > $o) {

                    if (($tlogin_sec[$o] > 0) or ( strlen($vevent_time[$o]) > 0)) {
                        $graph_stat_html[$s][0] = $vcampaign[$o];
                        $graph_stat_html[$s][1] = $users[$o];
                        $graph_stat_html[$s][2] = $full_name[$o];
                        $graph_stat_html[$s][3] = $tip_address[$o];
                        $graph_stat_html[$s][4] = $tlogin_time[$o];
                        $graph_stat_html[$s][5] = isset($tevent_time[$o])?$tevent_time[$o]:'';
                        $graph_stat_html[$s][6] = $vevent_time[$o];
                        $s++;
                        if (strlen($tstatus[$o]) > 0) {
                            $tot_login_sec = ($tot_login_sec + $tlogin_sec[$o]);
                        }
                    }
                    $o++;
                }

                isset($total_login_minutes_int) ? $total_login_minutes_int=$total_login_minutes_int:$total_login_minutes_int = "";
                if ($total_login_minutes_int < 10) {
                    $total_login_minutes_int = "0$total_login_minutes_int";
                }
                $total_login_hours = ($tot_login_sec / 3600);
                $total_login_hours_int = round($total_login_hours, 2);
                $total_login_hours_int = intval("$total_login_hours");
                $total_login_minutes = ($total_login_hours - $total_login_hours_int);
                $total_login_minutes = ($total_login_minutes * 60);
                $total_login_minutes_int = round($total_login_minutes, 0);
                $total_hr = $this->secConvert($tot_login_sec, 'H');
                $total_array = [];


                if(isset($request['file_download']) && $request['file_download'] == '1' ){

                    return $this->userGroupTimeClockStatusDataCsvDownload($user_group, $total_hr, $graph_stat_html);
                } else {
                    return response()->json([
                        'status' => 200,
                        'request_data' => $user_group,
                        'total_hr' => $total_hr,
                        'graph_stat_html' => $graph_stat_html
                    ],200);
                }
                
            }catch(Exception $e){
                $this->postLogs(config('errorcontants.timeClock'), $e);
                throw $e;
            }
 	}



    public function userGroupTimeClockStatusDataCsvDownload($user_group, $total_hr, $graph_stat_html){

        $filename = "user_group_time_clock_status_data".date('Y-m-dh:i:s').".csv";
        $handle = fopen($filename, 'w+');

        $header_data = [
            '1' => ['USER STATUS FOR USER GROUP:'.$user_group],
            '2' => ['USER', 'NAME', 'IP ADDRESS', 'TC TIME', 'TC LOGIN', 'VICI LAST LOG', 'VICI CAMPAIGN']
        ];

        foreach($header_data as $key => $rows){
            fputcsv( $handle, $rows, ";",'"');
        }
        
        $res_data = [];
        for($i=0;$i<sizeof($graph_stat_html);$i++){

            $res_data[$i]['USER'] = $graph_stat_html[$i][1];
            $res_data[$i]['NAME'] = $graph_stat_html[$i][2];
            $res_data[$i]['IP_ADDRESS'] = $graph_stat_html[$i][3];
            $res_data[$i]['TC_TIME'] = $graph_stat_html[$i][4];
            $res_data[$i]['TC_LOGIN'] = $graph_stat_html[$i][5];
            $res_data[$i]['VICI_LAST_LOG'] = $graph_stat_html[$i][6];
            $res_data[$i]['VICI_CAMPAIGN'] = $graph_stat_html[$i][0];
        }

        foreach ($res_data as $key => $value) {
            fputcsv($handle, $value, ";", '"');
        }

        $total_data = [
            '1' => ['TOTAL','','',$total_hr]
        ];

        foreach($total_data as $key => $rows){
            fputcsv( $handle, $rows, ";",'"');
        }

        fclose($handle);
        $headers = [
                'Content-Type' => 'text/csv',
        ];

        return Response::download($filename,  $filename, $headers)->deleteFileAfterSend(true);
    }


    /**
    *   User Group Time Clock Status Data
    *   @param [date and time] => start_date     2018/05/01 2:00:01
    *   @param [date and time] => end_date       2018/07/02 23:59:59
    *   @param [string] => shift
    *   @param [array] => user_group
    *   @return [array] => request_data
    *   @return [array] => TimeArray
    *   @return [array] => TOThours
    *   @return [array] => graph_stat_html
    *   @return [array] => maxw
    *
    */

    /**
    *   User Group Time Clock Status Data CSV Download
    *   @param [date and time] => start_date     2018/05/01 2:00:01
    *   @param [date and time] => end_date       2018/07/02 23:59:59
    *   @param [string] => shift
    *   @param [array] => user_group
    *   @param [string] => file_download        1
    *   @return [file] => .csv file
    *
    */


    public function userTimeClockDetailData(Request $request)
    {
        # handle access control for permission 
        # User access control for permission need to check
        # user_group access control for permission need to check
        #         TODO to complete

        try{
            
            (isset($request['user_group'])) ? $user_group = $request['user_group'] : $user_group = '';
            $shift = $request['shift'];
            $start_date = $request['start_date'];
            $start_date = Carbon::parse($start_date)->format('Y/m/d');
            $end_date = $request['end_date'];
            $end_date = Carbon::parse($end_date)->format('Y/m/d');
            $time_array = $this->setTimeBegin($shift, $start_date, $end_date);
            $start_date = $time_array['query_date_begin'];
            $end_date = $time_array['query_date_end'];
            $total_array = [];

            $request_data = [
                "start_date" => $request['start_date'],
                "end_date" => $request['end_date'],
                "shift" => $request['shift'],
                "user_group" => $request['user_group'],
            ];

            for ($i = 0; $i < count($user_group); $i++) {
                if ($user_group[$i] == "-ALL-") {
                    $user_group = VicidialUserGroup::getAllUserGroup();
                    break;
                }
            }
            $list = VicidialUser::userDetailList();
            $i = 0;
            $users_to_print = count($list);
            while ($i < $users_to_print) {
                $ul_name[$i] = $list[$i]['full_name'];
                $ul_user[$i] = $list[$i]['user'];
                $ul_group[$i] = $list[$i]['user_group'];
                $i++;
            }
            $list = VicidialTimeclockLog::timeClockList($user_group,$start_date,$end_date);
            $punches_to_print = count($list);
            $i = 0;$jc = 0;
            while ($i < $punches_to_print) {
                $tc_user[$i] = $list[$i]['user'];
                $tc_time[$i] = $list[$i]['login_sec'];
                $i++;
                $jc++;
            }
            $auto_logout_flag = 0;
            $m = 0;
            $max_time = 1;
            $graph_stats = [];
            $q = 0;
            $graph_stat_html = [];
            $total_time_tc = 0;
            $non_latin = 0;
            while (($m < $jc) and ( $m < 50000)) {
                $tc_detail = '';
                $raw_tc_detail = '';
                $n = 0;
                $user_name_found = 0;
                $rawuser = $tc_user[$m];
                while ($n < $users_to_print) {
                    if ($tc_user[$m] == "$ul_user[$n]") {
                        $user_name_found++;
                        $raw_name = $ul_name[$n];
                        $raw_group = $ul_group[$n];
                        $sname[$m] = $ul_name[$n];
                        $sgroup[$m] = $ul_group[$n];
                    }
                    $n++;
                }
                if ($user_name_found < 1) {
                    $raw_name = "NOT IN SYSTEM";
                    $raw_group = "GROUP NOT IN SYSTEM";
                    $sname[$m] = $raw_name;
                }
                $n = 0;
                $punches_found = 0;
                while ($n < $punches_to_print) {
                    if ($rawuser == "$tc_user[$n]") {
                        $punches_found++;
                        $rawtime_tc_sec = $tc_time[$n];
                        $total_time_tc = ($total_time_tc + $tc_time[$n]);
                        $stimetc[$m] = $this->secConvert($tc_time[$n], 'H');
                        $rawtime_tc = $stimetc[$m];
                        if ($rawtime_tc_sec > $max_time) {
                            $max_time = $rawtime_tc_sec;
                        }
                        $stimetc[$m] = sprintf("%10s", $stimetc[$m]);
                    }
                    $n++;
                }
                if ($punches_found < 1) {
                    $rawtime_tc_sec = "0";
                    $stimetc[$m] = "0:00";
                    $rawtime_tc = $stimetc[$m];
                    $stimetc[$m] = sprintf("%10s", $stimetc[$m]);
                }
                $tc_user_auto_logout = ' ';
                $list = VicidialTimeclockLog::timeClockDetails($user_group,$start_date,$end_date,$tc_user[$m]);
                $tc_results = count($list);
                $i = 0;
                $tcentry_auto_logout = '';
                while ($tc_results > $i) {
                    $event_date = $list[$i]['event_date'];
                    $event = $list[$i]['event'];
                    $date_detail = explode(' ', $event_date);
                    
                    if ($event == 'AUTOLOGOUT') {
                        $tcentry_auto_logout = '*';
                        $tc_user_auto_logout = '*';
                        $auto_logout_flag++;
                    }
                    $tc_detail .= "$date_detail[1]$tcentry_auto_logout ";
                    $raw_tc_detail .= "$date_detail[1],";
                    $i++;
                }

                if ($tc_results > 0) {
                    $raw_tc_detail = preg_replace('/,$/', '', $raw_tc_detail);
                }
                $sgroup[$m] = sprintf("%-20s", $sgroup[$m]);

                if ($non_latin < 1) {
                    $sname[$m] = sprintf("%-15s", $sname[$m]);
                    while (strlen($sname[$m]) > 15) {
                        $sname[$m] = substr("$sname[$m]", 0, -1);
                    }
                    $suser[$m] = sprintf("%-8s", $tc_user[$m]);
                    while (strlen($suser[$m]) > 8) {
                        $suser[$m] = substr("$suser[$m]", 0, -1);
                    }
                } else {
                    $sname[$m] = sprintf("%-45s", $sname[$m]);
                    while (mb_strlen($sname[$m], 'utf-8') > 15) {
                        $sname[$m] = mb_substr("$sname[$m]", 0, -1, 'utf-8');
                    }
                    $suser[$m] = sprintf("%-24s", $tc_user[$m]);
                    while (mb_strlen($suser[$m], 'utf-8') > 8) {
                        $suser[$m] = mb_substr("$suser[$m]", 0, -1, 'utf-8');
                    }
                }
                $graph_stats[$q][0] = "$sname[$m] - $suser[$m] / $sgroup[$m]";
                $graph_stats[$q][1] = "$rawtime_tc_sec";
                $graph_stats[$q][2] = "$tc_user_auto_logout";
                $graph_stats[$q][3] = "$tc_detail";

                $graph_stat_html[$q][0] = $graph_stats[$q][0];
                $graph_stat_html[$q][1] = $graph_stats[$q][1];
                $graph_stat_html[$q][2] = $this->secConvert($graph_stats[$q][1], 'H').$graph_stats[$q][2];
                $graph_stat_html[$q][3] = $graph_stats[$q][3];
                $graph_stat_html[$q][4] = $sname[$m];
                $graph_stat_html[$q][5] = $suser[$m];
                $graph_stat_html[$q][6] = $sgroup[$m];
                $q++;
                $m++;
            }
            $total_agents = sprintf("%4s", $m);
            $total_time_tc = $this->secConvert($total_time_tc, 'H');


            if(isset($request['file_download']) && $request['file_download'] == '1'){

                return $this->userTimeClockDetailDataCsvDownload($request_data, $total_agents, $graph_stat_html, $total_time_tc);

            } else {

                return response()->json([
                    'status' => 200,
                    'requestData' => $request_data,
                    'time_array' => $time_array,
                    'total_time_tc' => $total_time_tc,
                    'total_agents' => $total_agents,
                    'graph_stat_html' => $graph_stat_html,
                    'maxValue' => $max_time
                ],200);
            }

        }catch(Exception $e){
            dd($e);
            $this->postLogs(config('errorcontants.timeClock'), $e);
            throw $e;
        }

    }

    public function userTimeClockDetailDataCsvDownload($request_data, $total_agents, $graph_stat_html, $total_time_tc)
    {
        try{
                $filename = "user_time_clock_detail_data".date('Y-m-dh:i:s').".csv";
                $handle = fopen($filename, 'w+');

                $top_tab_header = [
                    '1' => ["User Time-Clock Detail:".date('Y-m-d h:i:s')],
                    '2' => ["Time range:", $request_data['start_date'], "To", $request_data['end_date']],
                    '3' => [""],
                    '4' => ["USER", "ID", "USER GROUP", "Time Clock", "Time Clock Punches"]
                ];

                foreach ($top_tab_header as $key => $value) {
                    fputcsv($handle, $value, ";", '"');
                }

                $res_data = [];
                for($i=0;$i<sizeof($graph_stat_html);$i++){

                    $res_data[$i]['USER'] = $graph_stat_html[$i][4];
                    $res_data[$i]['ID'] = $graph_stat_html[$i][5];
                    $res_data[$i]['USER_GROUP'] = $graph_stat_html[$i][6];
                    $res_data[$i]['Time_Clock'] = $graph_stat_html[$i][2];
                    $res_data[$i]['Time_Clock_Punches'] = $graph_stat_html[$i][3];
                }

                foreach ($res_data as $key => $value) {
                    fputcsv($handle, $value, ";", '"');
                }

                $bottom_tab_header = [
                    '1' => ['TOTAL AGENTS :   '.$total_agents, '', '', $total_time_tc]
                ];
                foreach ($bottom_tab_header as $key => $value) {
                    fputcsv($handle, $value, ";", '"');
                }


                fclose($handle);
                $headers = [
                        'Content-Type' => 'text/csv',
                ];
                return Response::download($filename, $filename, $headers)->deleteFileAfterSend(true);

            } catch (Exception $e) {
            $this->postLogs(config('errorcontants.user_time_clock_detail_data_csv'), $e);
            throw $e;
        }
    }


}
