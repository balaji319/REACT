<?php

namespace App\Http\Controllers\Report;

use Response;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
Use App\VicidialUserGroup;
Use App\VicidialCampaign;
use App\VicidialUser;
use App\VicidialStatuses;
use App\VicidialCampaignStatuses;
use App\VicidialAgentLog;
use App\VicidialLog;
use App\VicidialCloserLog;
use App\VicidialUserLog;
use App\VicidialTimeclockLog;
use App\VicidialUsers;
use App\Traits\TimeConvert;
use App\Traits\ErrorLog;
use Carbon\Carbon;
use Config;
use Exception;
use App\Traits\AccessControl;
use App\RecordingLog;
use App\UserCallLog;
use App\VicidialLeadSearchlog;
use App\VicidialAgentSkipLog;

class AgentController extends Controller
{
    use TimeConvert, ErrorLog ,AccessControl;
   
   /**
	*	Agent User Group List
	*	@return [array] => $list
	*/

 	public function userGroupOptionList()
 	{
        # HAVE TO ADD WHERE CONDITION DEPENDING UPON ACCESS PERMISSION
        
 		try{

	 		$list = VicidialUserGroup::agentUserGroupList();
            return response()->json([
                'status' => 200,
                'message' => 'Success',
                'data' => $list,
            ],200);
 		}catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
 		}
 	} 



    /**
    *   Agent Statuses List
    *   @return [array] => $statuses
    */

    public function allowdedStatusList()
    {
        # HAVE TO ADD WHERE CONDITION DEPENDING UPON ACCESS PERMISSION

        try{
            $campaign_status = VicidialCampaignStatuses::allCampaignStatuses();
            $status = VicidialStatuses::viciStatuses();
            $statuses = $campaign_status->merge($status)->unique();
            return response()->json([
                'status' => 200,
                'message' => 'Success',
                'data' => $statuses,
            ],200);

        }catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    } 


    /**
    *   User List
    *   @return [array] => $user
    */

    public function userList($option = 1)
    {
        # HAVE TO ADD WHERE CONDITION DEPENDING UPON ACCESS PERMISSION

        try{
            $user = VicidialUser::userList();
            if($option == 1){
                return response()->json([
                    'status' => 200,
                    'message' => 'Success',
                    'data' => $user,
                ],200);
            }
            $user =$user->pluck('user');
            return response()->json([
                'status' => 200,
                'message' => 'Success',
                'data' => $user,
            ],200);
        }catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    } 


 	/**
	*	Agent Campaign List
	*	@return [array] => $list
	*/

 	public function campaignOptionList()
 	{
        # HAVE TO ADD WHERE CONDITION DEPENDING UPON ACCESS PERMISSION

 		try{
	 		$list = VicidialCampaign::agentCampaignList();
            return response()->json([
                'status' => 200,
                'message' => 'Success',
                'data' => $list,
            ],200);

 		}catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
 		}
 	}

 	/**
	*	Agent Time Detail
	*	@param [date] => start_date
    *	@param [date] => end_date
    *	@param [array] => group
    *	@param [array] => user_group
    *	@param [string] => shift
	*	@param [string] => reportdisplaytype
	*	@param [boolean] => show_parks
	*	@return [array] => data
	*
	*/

 	public function agentTimeDetail(Request $request)
 	{

 		# handle access control for permission 
 		# User access control for permission need to check
 		# user_group and group access control for permission need to check
 		#		  TODO to complete
 		# ytelindia.ytel.com

 		try{
            $data = [
                'query_date' => $request['start_date'],
                'end_date' => $request['end_date'],
                'group' => $request['group'],
                'user_group' => $request['user_group'],
                'shift' => $request['shift'],
                'stage' => 'NAME',
                'file_download' => 1
            ];
            if(!isset($request['url_address'])){
                return "URL variable required compulsary";
            }
            //  Fetch agent time details from dynamic URL with help of CURL
            $csv_data = $this->getCsv($request['url_address'], config('configs.agent_detail_file_path'), $data);
            $lines = explode(PHP_EOL, $csv_data['body']);
            $lines = collect($lines);
			$array = $lastRow = [];

			foreach ($lines as $line) {
                if(!empty($line)){
			        $array[] = str_getcsv($line);            // Convert data into array format so that can read easily
                }
			}

            $array = collect($array)->splice(2)->toArray();     //Remove un-necessary data

            $lastRowIndex = count($array) - 1;
            $lastRow[] = $array[$lastRowIndex][0];
            $lastRow[] = "Agent: {$array[$lastRowIndex][1]}";
            $lastRow[] = $array[$lastRowIndex][2];
            $lastRow[] = $array[$lastRowIndex][3];
            $lastRow[] = $array[$lastRowIndex][4];
            $lastRow[] = $array[$lastRowIndex][5];
            $lastRow[] = 'N/A';
            $lastRow[] = $array[$lastRowIndex][7];
            $lastRow[] = 'N/A';
            $lastRow[] = $array[$lastRowIndex][9];
            $lastRow[] = 'N/A';
            $lastRow[] = $array[$lastRowIndex][10];
            $lastRow[] = 'N/A';
            $lastRow[] = $array[$lastRowIndex][11];
            $lastRow[] = 'N/A';
            $lastRow[] = $array[$lastRowIndex][12];

            // make last row of fetchd data into proper size

            for ($i = 13, $c = count($array[$lastRowIndex - 1]) - 4; $i <= $c; $i++) {
                if (isset($array[$lastRowIndex][$i]) && $array[$lastRowIndex][$i]) {
                    $lastRow[] = $array[$lastRowIndex][$i];
                } else {
                    $lastRow[] = 'N/A';
                }
            }
            $array[$lastRowIndex] = $lastRow;

            array_walk_recursive($array, function (&$item) {
                if (substr_count($item, ":") == 1) {
                    $item = "00:{$item}";                   // Set time format
                }
            });


            //Pass extra param for CSV download : $request['file_download'];
            if(isset($request['file_download']) && $request['file_download'] == '1' ){

                return $this->csvDownloadAgentTimeDetail($array, $lines);
            } else {

                return response()->json([
                    'status' => 200,
                    'data' => $array,
                    'total_data' => $lines,
                ],200);
            }
 		}catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
 		}
 	}


    public function csvDownloadAgentTimeDetail($array, $lines)
    {
        $filename = "AgentTimeDetail_".date('Y-m-dh:i:s').".csv";
        $handle = fopen($filename, 'w+');

        foreach($array as $key => $rows){
            fputcsv( $handle, $rows, ";",'"');
        }

        fclose($handle);
        $headers = [
                'Content-Type' => 'text/csv',
        ];

        return Response::download($filename,  $filename, $headers)->deleteFileAfterSend(true);
    }
 	/**
	*	Agent Status Detail
	*	@param [date] => start_date
    *	@param [date] => end_date
    *	@param [array] => group
    *	@param [array] => user_group
    *	@param [string] => shift
	*	@return [array] => request_data
	*	@return [array] => time_array
    *   @return [array] => ags_name
    *   @return [array] => ags_user
    *   @return [array] => sub_statuses_array
    *   @return [array] => total_status
    *   @return [array] => sub_statuses_details_array
    *   @return [array] => graph_stats
    *   @return [array] => avg_display
    *   @return [array] => avg_value
    *   @return [array] => graph_stat_html
    *   @return [array] => graph_stat_display
    *   @return [array] => header_array
    *   @return [array] => totall_array
    *   @return [array] => max_array
	*	@return [array] => final_sub_array_max
	*
	*/

 	public function agentStatusDetail(Request $request)
 	{

 		# handle access control for permission 
 		# User access control for permission need to check
 		# user_group and group access control for permission need to check
 		#		  TODO to complete
 		try{
	 		(isset($request['shift'])) ? $shift = $request['shift'] : $shift = "ALL";
	        (isset($request['start_date'])) ? $start_date = $request['start_date'] : $start_date = " ";
	        (isset($request['end_date'])) ? $end_date = $request['end_date'] : $end_date = " ";
	        (isset($request['user_group'])) ? $user_group = $request['user_group'] : $user_group = "-ALL-";
	        (isset($request['group'])) ? $group = $request['group'] : $group = "-ALL-";

	        $request_data = [
	        	'start_date' => $start_date,
	        	'end_date' => $end_date,
	        	'shift' => $shift,
	        	'user_group' => $user_group,
	        	'group' => $group
	        ];

	        $time_array = $this->setTimeBegin($shift, $start_date, $end_date);
	        for ($i = 0; $i < count($user_group); $i++) {
	            if ($user_group[$i] == "-ALL-") {
	                $user_group = VicidialUserGroup::getAllUserGroup();
	                break;
	            }
	        }
	        for ($i = 0; $i < count($group); $i++) {
	            if ($group[$i] == "-ALL-") {
	                $group = VicidialCampaign::agentAllCampaignList();
	                break;
	            }
	        }

	        $customer_interactive_statuses = '';
	        $customer_interactive_statuses = "|".VicidialStatuses::getAllStatuses()->implode('|');
	        $customer_interactive_statuses .= "|".VicidialCampaignStatuses::getAllCampaignStatuses($group)->implode('|');
	       
	        $statuses = '-';
	        $statuses_txt = '';
	        $statuses_html = '';
	        $statuses_array[0] = '';
	        $sub_statuses_details_array = [];
	        $j = 0;
	        $users = '-';
	        $users_array[0] = '';
	        $user_names_array[0] = '';
	        $k = 0;
	        $list = VicidialAgentLog::agentLogDetails($group,$user_group,$time_array['query_date_end'],$time_array['query_date_begin']);

	        $rows_to_print = count($list);
	        $i = 0;
	        $sub_status_count = 0;
	        $statuses_file = '';
            $sub_statuses_array = [];

	        while ($i < $rows_to_print) {
	            $row[0] = $list[$i]->calls;
	            $row[1] = $list[$i]->full_name;
	            $row[2] = $list[$i]->user;
	            $row[3] = $list[$i]->status;


	            if (($row[0] > 0) and (strlen($row[3]) > 0) and (!preg_match("/NULL/i", $row[3]))) {
	                $calls[$i] = $row[0];
	                $full_name[$i] = $row[1];
	                $user[$i] = $row[2];
	                $status[$i] = $row[3];
	                if ((!preg_match("/-$status[$i]-/i", $statuses)) and (strlen($status[$i]) > 0)) {
	                    $statuses_txt = sprintf("%8s", $status[$i]);


	                    $statuses_html .= " $statuses_txt |";
	                    $statuses_file .= "$statuses_txt,";
	                    $statuses .= "$status[$i]-";
	                    $statuses_array[$j] = $status[$i];

	                    $sub_statuses_array[$sub_status_count] = $status[$i];
	                    $sub_status_count++;
	                    $max_varname = "max_" . $status[$i];
	                    $$max_varname = 1;
	                    $j++;
	                }
	                if (!preg_match("/\-$user[$i]\-/i", $users)) {
	                    $users .= "$user[$i]-";
	                    $users_array[$k] = $user[$i];
	                    $user_names_array[$k] = $full_name[$i];
	                    $k++;
	                }
	            }
	            $i++;
	        }

	        $m = 0;
	        $cis_count_tot = 0;
	        $dnc_count_tot = 0;
	        $graph_stats = [];
	        $max_calls = 1;
	        $max_cicalls = 1;
	        $max_dncci = 1;
	        $maincounter = 0;
	        $subcounter = 0;
	        $substatus_detail_array = [];
	        $ags_user = [];
	        $ags_name = [];
	        $total_calls = 0;
	        while ($m < $k) {
	        	$suser = $users_array[$m];
                $sfull_name = $user_names_array[$m];
                $scalls = 0;
                $sstatuses_html = '';
                $sstatuses_file = '';
                $cis_count = 0;
                $dnc_count = 0;
                $n = 0;
                while ($n < $j) {
                	$sstatus = $statuses_array[$n];
                    $sstatus_txt = '';
                    $varname = $sstatus . "_graph";
                    $max_varname = "max_" . $sstatus;
                    $i = 0;
                    $status_found = 0;
                    while ($i < $rows_to_print) {
                    	if ((isset($user[$i]) && $suser == "$user[$i]") and (isset($status[$i]) && $sstatus == "$status[$i]")) {

                            $scalls = ($scalls + $calls[$i]);
                            if (preg_match("/\|$status[$i]\|/i", $customer_interactive_statuses)) {

                                $cis_count = ($cis_count + $calls[$i]);
                                $cis_count_tot = ($cis_count_tot + $calls[$i]);
                            }
                            if (preg_match("/DNC/i", $status[$i])) {

                                $dnc_count = ($dnc_count + $calls[$i]);
                                $dnc_count_tot = ($dnc_count_tot + $calls[$i]);
                            }

                            if ($calls[$i] > $max_varname) {
                                $max_varname = $calls[$i];
                            }
                            $graph_stats[$m][(4 + $n)] = $calls[$i];

                            $sstatus_txt = sprintf("%8s", $calls[$i]);
                            $sub_statuses_details_array[$maincounter][$subcounter] = $sstatus_txt;
                            $sstatuses_html .= " $sstatus_txt |";
                            $sstatuses_file .= "$sstatus_txt,";
                            $status_found++;
                        }
                        $i++;
                    }

                    if ($status_found < 1) {
                        $graph_stats[$m][(4 + $n)] = 0;

                        $sub_statuses_details_array[$maincounter][$subcounter] = "        0";

                        $sstatuses_html .= "        0 |";
                        $sstatuses_file .= "0,";
                    }

                    $n++;
                    $subcounter++;
                }

                $total_calls = ($total_calls + $scalls);

                $raw_user = $suser;
                $raw_calls = $scalls;
                $raw_cis = $cis_count;
                $scalls = sprintf("%6s", $scalls);
                $cis_count = sprintf("%6s", $cis_count);
                $non_latin = 0;
                if ($non_latin < 1) {
                    $sfull_name = sprintf("%-15s", $sfull_name);
                    while (strlen($sfull_name) > 15) {
                        $sfull_name = substr("$sfull_name", 0, -1);
                    }
                    $suser = sprintf("%-8s", $suser);
                    while (strlen($suser) > 8) {
                        $suser = substr("$suser", 0, -1);
                    }
                } else {
                    $sfull_name = sprintf("%-45s", $sfull_name);
                    while (mb_strlen($sfull_name, 'utf-8') > 15) {
                        $sfull_name = mb_substr("$sfull_name", 0, -1, 'utf-8');
                    }

                    $suser = sprintf("%-24s", $suser);
                    while (mb_strlen($suser, 'utf-8') > 8) {
                        $suser = mb_substr("$suser", 0, -1, 'utf-8');
                    }
                }

                if (($dnc_count < 1) or ($cis_count < 1)) {
                    $dnc_count_pcts = 0;
                } else {

                    $dnc_count_pcts = (($dnc_count / $cis_count) * 100);
                }
                $raw_dnc_pct = $dnc_count_pcts;

                $dnc_count_pcts = round($dnc_count_pcts);
                $rawdnc_count_pcts = $dnc_count_pcts;


                $dnc_count_pcts = sprintf("%6s", $dnc_count_pcts);
                if (trim($scalls) > $max_calls) {
                    $max_calls = trim($scalls);
                }
                if (trim($cis_count) > $max_cicalls) {
                    $max_cicalls = trim($cis_count);
                }
                if (trim($dnc_count_pcts) > $max_dncci) {
                    $max_dncci = trim($dnc_count_pcts);
                }

                $graph_stats[$m][1] = trim("$scalls");
                $graph_stats[$m][2] = trim("$cis_count");
                $graph_stats[$m][3] = trim("$dnc_count_pcts" . "%");

                array_push($ags_name, $users_array[$m]);
                array_push($ags_user, $user_names_array[$m]);

                $m++;
                $maincounter++;
	        }

	        $total_agents = sprintf("%4s", $m);

            $sum_statuses_html = '';
            $sum_status_array = [];
            $n = 0;
            $counter = 0;
            while ($n < $j) {
                $scalls = 0;
                $sstatus = $statuses_array[$n];
                $sum_statustxt = '';
                $total_var = $sstatus . "_total";
                $i = 0;
                $status_found = 0;
                while ($i < $rows_to_print) {
                    if (isset($status[$i]) && $sstatus == "$status[$i]") {
                        $scalls = ($scalls + $calls[$i]);
                        $status_found++;
                    }
                    $i++;
                }
                if ($status_found < 1) {

                    $sum_statuses_html .= "        0 |";
                    $$total_var = "0";
                } else {

                    $sum_statustxt = sprintf("%8s", $scalls);
                    $sum_statuses_html .= " $sum_statustxt |";
                    $$total_var = $scalls;
                }

                $n++;
            }
            $string = trim($sum_statuses_html, "|");
            $total_status = explode('|', $string);
            $total_calls = sprintf("%7s", $total_calls);
            $cis_count_tot = sprintf("%7s", $cis_count_tot);
            if($cis_count_tot != 0){
                $dnc_count_pct = (($dnc_count_tot / $cis_count_tot) * 100);    
            }else{
                $dnc_count_pct = 0;
            }
            $dnc_count_pct = round($dnc_count_pct, 2);
            $dnc_count_pct = sprintf("%3.2f", $dnc_count_pct);
            if (($dnc_count_tot < 1) or ($cis_count_tot < 1)) {
                $dnc_count_pct = 0;
            } else {
                $dnc_count_pct = (($dnc_count_tot / $cis_count_tot) * 100);
            }

            $dnc_count_pct = round($dnc_count_pct);
            $dnc_count_pct = sprintf("%6s", $dnc_count_pct);
            $graph_stat_display = [];
            $graph_stat_html = [];
            $avg_value = [];
            $avg_display = [];
            $max_array = [];
            for ($d = 0; $d < count($graph_stats); $d++) {
                if ($d == 0) {
                    $class = " first";
                } else {
                    if (($d + 1) == count($graph_stats)) {
                        $class = " last";
                    } else {
                        $class = "";
                    }
                }
                $graph_stat_html[$d][0] = round(100 * $graph_stats[$d][1] / $max_calls);
                $graph_stat_display[$d][0] = $graph_stats[$d][1];
                $graph_stat_html[$d][1] = round(100 * $graph_stats[$d][2] / $max_cicalls);
                $graph_stat_display[$d][1] = $graph_stats[$d][2];
                $graph_stat_html[$d][2] = isset($graph_stats[$d][3])?round(100 * rtrim($graph_stats[$d][3],'%') / $max_dncci):0;
                $graph_stat_display[$d][2] = $graph_stats[$d][3];
                $max = 0;
                for ($e = 0; $e < count($sub_statuses_array); $e++) {
                    $max_varname = "max_" . $sstatus;
                    $avg_value[$d][$e] = round(10 * $graph_stats[$d][($e + 4)] / $$max_varname);
                    if ($graph_stats[$d][($e + 4)] > $max) {
                        $max = $graph_stats[$d][($e + 4)];
                    }
                    $avg_display[$d][$e] = $graph_stats[$d][($e + 4)];
                }
                $max_array[$d] = $max;
            }
            $test_array = [];
            $final_sub_array_max = [];
            foreach ($avg_display as $key => $value) {
                for ($j = 0; $j < count($value); $j++) {
                    for ($cnt = 0; $cnt < count($avg_display); $cnt++) {
                        $test_array[$cnt] = $avg_display[$cnt][$j];
                    }
                    $final_sub_array_max[$j] = max($test_array);
                }
            }

            $header_array = [
                'CALLS',
                'CIcalls',
                ' DNC/CI'
            ];
            $totall_array = [
                $total_calls,
                $cis_count_tot,
                $dnc_count_pct . "%"
            ];

            if(isset($request['file_download']) && $request['file_download'] == '1' ){
                return $this->csvDownloadAgentStatusDetail($request_data, $ags_user, $ags_name, $graph_stats, $header_array, $sub_statuses_array, $totall_array,$total_status);
            } else {
                    return response()->json([
                    'status' => 200,
                    'request_data' => $request_data,
                    'time_array' => $time_array,
                    'ags_name' => $ags_name,
                    'ags_user' => $ags_user,
                    'sub_statuses_array' => $sub_statuses_array,
                    'total_status' => $total_status,
                    'sub_statuses_details_array' => $sub_statuses_details_array,
                    'graph_stats' => $graph_stats,
                    'avg_display' => $avg_display,
                    'avg_value' => $avg_value,
                    'graph_stat_html' => $graph_stat_html,
                    'graph_stat_display' => $graph_stat_display,
                    'header_array' => $header_array,
                    'totall_array' => $totall_array,
                    'max_array' => $max_array,
                    'final_sub_array_max' => $final_sub_array_max
                ],200);

            }

    	}catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
 		}

 	}

    public function csvDownloadAgentStatusDetail($request_data, $ags_user, $ags_name, $graph_stats, $header_array, $sub_statuses_array, $totall_array, $total_status)
    {

        $filename = "AgentStatusDetail_".date('Y-m-dh:i:s').".csv";
        $handle = fopen($filename, 'w+');
        $agent_status_detail_header = [
            '1' => [
                'Agent Status Detail Report:          '.date('Y-m-d h:i:s')
            ],
            '2' => ['Time Range -'.$request_data['start_date'].' 00:00:00  To  '.$request_data['end_date'].' 23:59:59']
        ];

        foreach($agent_status_detail_header as $key => $rows){
            fputcsv( $handle, $rows, ";",'"');
        }

        $h = 0;
        $main_header = [];
        $main_header_1 = [];
        $combine_array = array_merge($header_array, $sub_statuses_array);
        foreach($combine_array as $header_array_val){
            $main_header_1[$h] = $header_array_val;
            $h++;
        }
        array_unshift($main_header_1, "User Name");
        array_push($main_header, $main_header_1);

        foreach($main_header as $key => $rows){
            fputcsv( $handle, $rows, ";",'"');
        }

        $data_array = [];
        $data_array_1 = [];
        $i=0;
        foreach($graph_stats as $value ){
            ksort($value);
            $j=0;
            $data_array_1[$j] = $ags_user[$i].' - '.$ags_name[$i];
            foreach($value as $value1 ){
               $j++;
                $data_array_1[$j] = $value1;
            }
            array_push($data_array, $data_array_1);
            $i++;
        }

        foreach($data_array as $key => $rows){
            fputcsv($handle, $rows, ",",'"');   
        }

        $f = 0;
        $main_footer = [];
        $main_footer_1 = [];
        $footer_combine_array = array_merge($totall_array, $total_status);
        foreach($footer_combine_array as $footer_array_val){
            $main_footer_1[$f] = $footer_array_val;
            $f++;
        }
        array_unshift($main_footer_1, "TOTAL");
        array_push($main_footer, $main_footer_1);
        
        foreach($main_footer as $key => $rows){
            fputcsv( $handle, $rows, ";",'"');
        }

        fclose($handle);
        $headers = [
                'Content-Type' => 'text/csv',
        ];

        return Response::download($filename,  $filename, $headers)->deleteFileAfterSend(true);
    }


    /**
    *   Agent performance Detail
    *   @param [date] => start_date
    *   @param [date] => end_date
    *   @param [array] => group
    *   @param [array] => user_group
    *   @param [array] => user
    *   @param [string] => shift
    *   @return [array] => request_data
    *   @return [array] => tot_calls
    *   @return [array] => graph_stat_htmltotal
    *   @return [array] => graph_total
    *   @return [array] => totalcount
    *   @return [array] => totalsecarray
    *   @return [array] => time_array
    *   @return [array] => agsname
    *   @return [array] => statuses_array
    *   @return [array] => sub_statuses_array
    *   @return [array] => tot_status
    *   @return [array] => tot_sub_status
    *   @return [array] => avg_display
    *   @return [array] => graph_stat_html
    *   @return [array] => graph_stat_display
    *   @return [array] => avg_sub_display
    *   @return [array] => avg_sub_value
    *   @return [array] => graph_sub_stat_html
    *   @return [array] => graph_sub_stat_display
    *   @return [array] => header_array
    *   @return [array] => totall_array
    *   @return [array] => sub_status_header_array
    *   @return [array] => sub_totall_array
    *
    */

    public function agentPerformanceDetail(Request $request)
    {

        # handle access control for permission 
        # User access control for permission need to check
        # user_group, user and group access control for permission need to check
        #         TODO to complete


        try{

            (isset($request['shift'])) ? $shift = $request['shift'] : $shift = "ALL";
            (isset($request['start_date'])) ? $start_date = $request['start_date'] : $start_date = " ";
            (isset($request['end_date'])) ? $end_date = $request['end_date'] : $end_date = " ";
            (isset($request['user_group'])) ? $user_group = $request['user_group'] : $user_group = " ";
            (isset($request['group'])) ? $group = $request['group'] : $group = " ";
            (isset($request['user'])) ? $user_array = $request['user'] : $user_array = ['-ALL-'];

            $request_data = [
                'start_date' => $start_date,
                'end_date' => $end_date,
                'shift' => $shift,
                'user_group' => $user_group,
                'group' => $group,
                'user_array' => $user_array
            ];

            $avg_sub_value =[];
            $avg_sub_display = [];
            $time_array = $this->setTimeBegin($shift, $start_date, $end_date);
            $avg_sub_display = [];
            $statuses_array[0] = '';
            $j = 0;
            $users = '-';
            $users_array[0] = '';
            $user_names_array[0] = '';
            $k = 0;
            $list = VicidialAgentLog::agentDetails($group, $user_array, $user_group, $time_array);
            $rows_to_print = count($list);
            $graph_stats = [];
            $max_calls = 1;
            $max_time = 1;
            $max_pause = 1;
            $max_pauseavg = 1;
            $max_wait = 1;
            $max_waitavg = 1;
            $max_talk = 1;
            $max_talkavg = 1;
            $max_dispo = 1;
            $max_dispoavg = 1;
            $max_dead = 1;
            $max_deadavg = 1;
            $max_customer = 1;
            $max_customeravg = 1;
            $userGroup = $list->map(function($item) { return $item->user_group; }, $list);
            $calls = $list->map(function($item) { return $item->calls; }, $list);
            $talk_sec = $list->map(function($item) { return $item->talk; }, $list);
            $pause_sec = $list->map(function($item) { return $item->pause_sec; }, $list);
            $wait_sec = $list->map(function($item) { return $item->wait_sec; }, $list);
            $dispo_sec = $list->map(function($item) { return $item->dispo_sec; }, $list);
            $dead_sec = $list->map(function($item) { return $item->dead_sec; }, $list);
            $customer_sec = $list->map(function($item) {
                $customer_sec_val = $item->talk - $item->dead_sec;
                return ($customer_sec_val < 1) ? 0 : $customer_sec_val;
            }, $list);
            $user = $list->map(function($item) { return $item->user; }, $list);
            $full_name = $list->map(function($item) { return $item->full_name; }, $list);
            $status = $list->map(function($item) { return strtoupper($item->status); }, $list);
            $statuses_array = $list->map(function($item) { return strtoupper($item->status); }, $list)->unique()->filter()->values();
            $users_array = $list->map(function($item) { return $item->user; }, $list)->unique()->values();
            $users_array1 = $list->map(function($item) { return trim($item->full_name)." - ".trim($item->user); }, $list)->unique()->values();
            $user_names_array = $list->map(function($item) { return $item->full_name; }, $list)->unique()->values();
            $j = count($statuses_array);
            $k = count($users_array);
            $m = 0;
            $total_pause_avg_array = $total_wait_avg_array = $total_talk_avg_array = $total_dispo_avg_array = $total_dead_avg_array = $total_cust_avg_array = [];
            $tot_status = [];
            $group_array = [];
            $l = 0;
            $i = 0;
            $tot_calls = 0;
            $tot_time = 0;
            $tot_tot_talk = 0;
            $tot_tot_wait = 0;
            $tot_tot_pause = 0;
            $tot_tot_dispo = 0;
            $tot_tot_dead = 0;
            $tot_tot_customer = 0;
            $user_group_value = '';
            while ($m < $k) {
                $suser = $users_array[$m];
                $sfull_name = $user_names_array[$m];
                $suser_sfull_name = $users_array1[$m];
                $stime = 0;
                $scalls = 0;
                $stalk_sec = 0;
                $spause_sec = 0;
                $swait_sec = 0;
                $sdispo_sec = 0;
                $sdead_sec = 0;
                $scustomer_sec = 0;
                $n = 0;
                $count = 0;

                while ($n < $j) {
                    $sstatus = $statuses_array[$n];
                    $varname = $sstatus."_graph";
                    $max_varname = "max_".$sstatus;
                    $i = 0;
                    $status_found = 0;
                    $scalls_totals = 0;
                    $status_found_total = 0;

                    while ($i < $rows_to_print) {
                        if (($suser == "$user[$i]") and ( $sstatus == "$status[$i]")) {
                            $user_group_value = $userGroup[$i];
                            $scalls = ($scalls + $calls[$i]);
                            $stalk_sec = ($stalk_sec + $talk_sec[$i]);
                            $spause_sec = ($spause_sec + $pause_sec[$i]);
                            $swait_sec = ($swait_sec + $wait_sec[$i]);
                            $sdispo_sec = ($sdispo_sec + $dispo_sec[$i]);
                            $sdead_sec = ($sdead_sec + $dead_sec[$i]);
                            $scustomer_sec = ($scustomer_sec + $customer_sec[$i]);  
                            if (isset($$max_varname) AND $calls[$i] > $$max_varname) {
                                $$max_varname = $calls[$i];
                            }
                            $graph_stats[$m][(15 + $n)] = ($calls[$i] + 0);
                            $status_found++;
                        }
                        if ($sstatus == "$status[$i]") {
                            $scalls_totals = ($scalls_totals + $calls[$i]);
                            $status_found_total++;
                        }
                        $i++;
                    }
                    $tot_status[$n] = ($status_found_total < 1) ? 0 : $scalls_totals;
                    if ($status_found < 1) {

                        $count++;

                        $graph_stats[$m][(15 + $n)] = 0;
                    }
                    $n++;
                }
                $stime = ($stalk_sec + $spause_sec + $swait_sec + $sdispo_sec);
                $tot_calls = ($tot_calls + $scalls);
                $tot_time = ($tot_time + $stime);
                $tot_tot_talk = ($tot_tot_talk + $stalk_sec);
                $tot_tot_wait = ($tot_tot_wait + $swait_sec);
                $tot_tot_pause = ($tot_tot_pause + $spause_sec);
                $tot_tot_dispo = ($tot_tot_dispo + $sdispo_sec);
                $tot_tot_dead = ($tot_tot_dead + $sdead_sec);
                $tot_tot_customer = ($tot_tot_customer + $scustomer_sec);
                $stime = ($stalk_sec + $spause_sec + $swait_sec + $sdispo_sec);

                $total_pause_avg_array[$m] = (($scalls > 0) && ($spause_sec > 0)) ? ($spause_sec / $scalls) : 0;
                $total_wait_avg_array[$m] = (($scalls > 0) && ($swait_sec > 0)) ? ($swait_sec / $scalls) : 0;
                $total_talk_avg_array[$m] = (($scalls > 0) && ($stalk_sec > 0)) ? ($stalk_sec / $scalls) : 0;
                $total_dispo_avg_array[$m] = (($scalls > 0) && ($sdispo_sec > 0)) ? ($sdispo_sec / $scalls) : 0;
                $total_dead_avg_array[$m] = (($scalls > 0) && ($sdead_sec > 0)) ? ($sdead_sec / $scalls) : 0;
                $total_cust_avg_array[$m] = (($scalls > 0) && ($scustomer_sec > 0)) ? ($scustomer_sec / $scalls) : 0;

                $max_calls = (trim($scalls) > $max_calls) ? trim($scalls) : $max_calls;
                $max_time = (trim($stime) > $max_time) ? trim($stime) : $max_time;
                $max_pause = (trim($spause_sec) > $max_pause) ? trim($spause_sec) : $max_pause;
                $max_wait = (trim($swait_sec) > $max_wait) ? trim($swait_sec) : $max_wait;
                $max_talk = (trim($stalk_sec) > $max_talk) ? trim($stalk_sec) : $max_talk;
                $max_dispo = (trim($sdispo_sec) > $max_dispo) ? trim($sdispo_sec) : $max_dispo;
                $max_dead = (trim($sdead_sec) > $max_dead) ? trim($sdead_sec) : $max_dead;
                $max_customer = (trim($scustomer_sec) > $max_customer) ? trim($scustomer_sec) : $max_customer;

                $max_pauseavg = (trim($total_pause_avg_array[$m]) > $max_pauseavg) ? trim($total_pause_avg_array[$m]) : $max_pauseavg;
                $max_waitavg = (trim($total_wait_avg_array[$m]) > $max_waitavg) ? trim($total_wait_avg_array[$m]) : $max_waitavg;
                $max_talkavg = (trim($total_talk_avg_array[$m]) > $max_talkavg) ? trim($total_talk_avg_array[$m]) : $max_talkavg;
                $max_dispoavg = (trim($total_dispo_avg_array[$m]) > $max_dispoavg) ? trim($total_dispo_avg_array[$m]) : $max_dispoavg;
                $max_deadavg = (trim($total_dead_avg_array[$m]) > $max_deadavg) ? trim($total_dead_avg_array[$m]) : $max_deadavg;
                $max_customeravg = (trim($total_cust_avg_array[$m]) > $max_customeravg) ? trim($total_cust_avg_array[$m]) : $max_customeravg;

                $graph_stats[$m][0] = $suser_sfull_name;
                $graph_stats[$m][1] = trim($scalls);
                $graph_stats[$m][2] = trim($stime);
                $graph_stats[$m][3] = trim($spause_sec);
                $graph_stats[$m][4] = trim($total_pause_avg_array[$m]);
                $graph_stats[$m][5] = trim($swait_sec);
                $graph_stats[$m][6] = trim($total_wait_avg_array[$m]);
                $graph_stats[$m][7] = trim($stalk_sec);
                $graph_stats[$m][8] = trim($total_talk_avg_array[$m]);
                $graph_stats[$m][9] = trim($sdispo_sec);
                $graph_stats[$m][10] = trim($total_dispo_avg_array[$m]);
                $graph_stats[$m][11] = trim($sdead_sec);
                $graph_stats[$m][12] = trim($total_dead_avg_array[$m]);
                $graph_stats[$m][13] = trim($scustomer_sec);
                $graph_stats[$m][14] = trim($total_cust_avg_array[$m]);
                $group_array[$m] = $user_group_value;
                $m++;
            }

            $tot_time_ms = $this->secConvert($tot_time, 'H');
            $tot_tot_talk_ms = $this->secConvert($tot_tot_talk, 'H');
            $tot_tot_dispo_ms = $this->secConvert($tot_tot_dispo, 'H');
            $tot_tot_dead_ms = $this->secConvert($tot_tot_dead, 'H');
            $tot_tot_pause_mss = $this->secConvert($tot_tot_pause, 'H');
            $tot_tot_wait_ms = $this->secConvert($tot_tot_wait, 'H');
            $tot_tot_customer_ms = $this->secConvert($tot_tot_customer, 'H');

            $tot_avg_talk_ms = $this->secConvert(($tot_tot_talk < 1) ? '0' : ($tot_tot_talk / $tot_calls), 'H');
            $tot_avg_dispo_ms = $this->secConvert(($tot_tot_dispo < 1) ? '0' : ($tot_tot_dispo / $tot_calls), 'H');
            $tot_avg_dead_ms = $this->secConvert(($tot_tot_dead < 1) ? '0' : ($tot_tot_dead / $tot_calls), 'H');
            $tot_avg_pause_ms = $this->secConvert(($tot_tot_pause < 1) ? '0' : ($tot_tot_pause / $tot_calls), 'H');
            $tot_avg_wait_ms = $this->secConvert(($tot_tot_wait < 1) ? '0' : ($tot_tot_wait / $tot_calls), 'H');
            $tot_avg_customer_ms = $this->secConvert(($tot_tot_customer < 1) ? '0' : ($tot_tot_customer / $tot_calls), 'H');

            $graph_stat_display = $graph_stat_htmltotal = [];
            $graph_stat_html = [];
            $avg_value = [];
            $avg_display = [];
            $agsname = [];

            for ($d = 0; $d < count($graph_stats); $d++) {
                $graph_stat_html[$d][0] = round(400 * $graph_stats[$d][2] / $max_time);
                $graph_stat_display[$d][0] = $this->secConvert($graph_stats[$d][2], 'H');
                $graph_stat_html[$d][1] = round(400 * $graph_stats[$d][3] / $max_pause);
                $graph_stat_display[$d][1] = $this->secConvert($graph_stats[$d][3], 'H');
                $graph_stat_html[$d][2] = round(400 * $graph_stats[$d][4] / $max_pauseavg);
                $graph_stat_display[$d][2] = $this->secConvert($graph_stats[$d][4], 'H');
                $graph_stat_html[$d][3] = round(400 * $graph_stats[$d][5] / $max_wait);
                $graph_stat_display[$d][3] = $this->secConvert($graph_stats[$d][5], 'H');
                $graph_stat_html[$d][4] = round(400 * $graph_stats[$d][6] / $max_waitavg);
                $graph_stat_display[$d][4] = $this->secConvert($graph_stats[$d][6], 'H');
                $graph_stat_html[$d][5] = round(400 * $graph_stats[$d][7] / $max_talk);
                $graph_stat_display[$d][5] = $this->secConvert($graph_stats[$d][7], 'H');
                $graph_stat_html[$d][6] = round(400 * $graph_stats[$d][8] / $max_talkavg);
                $graph_stat_display[$d][6] = $this->secConvert($graph_stats[$d][8], 'H');
                $graph_stat_html[$d][7] = round(400 * $graph_stats[$d][9] / $max_dispo);
                $graph_stat_display[$d][7] = $this->secConvert($graph_stats[$d][9], 'H');
                $graph_stat_html[$d][8] = round(400 * $graph_stats[$d][10] / $max_dispoavg);
                $graph_stat_display[$d][8] = $this->secConvert($graph_stats[$d][10], 'H');
                $graph_stat_html[$d][9] = round(400 * $graph_stats[$d][11] / $max_dead);
                $graph_stat_display[$d][9] = $this->secConvert($graph_stats[$d][11], 'H');
                $graph_stat_html[$d][10] = round(400 * $graph_stats[$d][12] / $max_deadavg);
                $graph_stat_display[$d][10] = $this->secConvert($graph_stats[$d][12], 'H');
                $graph_stat_html[$d][11] = round(400 * $graph_stats[$d][13] / $max_customer);
                $graph_stat_display[$d][11] = $this->secConvert($graph_stats[$d][13], 'H');
                $graph_stat_html[$d][12] = round(400 * $graph_stats[$d][14] / $max_customeravg);
                $graph_stat_display[$d][12] = $this->secConvert($graph_stats[$d][14], 'H');
                array_push($agsname, $graph_stats[$d][0]);
                $graph_stat_htmltotal[$d][0] = round(400 * $graph_stats[$d][1] / $max_calls);
                $graph_stat_htmltotal[$d][0] = $graph_stats[$d][1];
                for ($e = 0; $e < count($statuses_array); $e++) {
                    $sstatus = $statuses_array[$e];
                    $varname = $sstatus."_graph";
                    $max_varname = "max_".$sstatus;
                    $avg_display[$d][$e] = $graph_stats[$d][($e + 15)];
                }
            }
            $list = VicidialAgentLog::logDetails($group, $user_array, $user_group, $time_array);  

            $sub_statuses_array = [];
            $pc_users_array = [];
            $pc_user_names_array = [];
            $graph_stats = [];
            $max_total = 1;
            $max_nonpause = 1;
            $max_pause = 1;
            $subs_to_print = count($list);

            // $pc_full_name = $list->map(function($item) { return $item->full_name; }, $list);
            $pc_user = $list->map(function($item) { return $item->user; }, $list);
            $pc_pause_sec = $list->map(function($item) { return $item->pause_sec; }, $list);
            $sub_status = $list->map(function($item) { return $item->sub_status; }, $list);
            $pc_non_pause_sec = $list->map(function($item) { return $item->total; }, $list);
            $sub_statuses_array = $list->map(function($item) { return $item->sub_status; }, $list)->unique()->values();
            $pc_users_array = $list->map(function($item) { return $item->user; }, $list)->unique()->values();
            $pc_user_names_array = $list->map(function($item) { return $item->full_name; }, $list)->unique()->values();
            $j = count($sub_statuses_array);
            $k = count($pc_users_array);
            $i = 0;

            while ($i < $subs_to_print) {
                $max_varname = "max_".$sub_status[$i];
                $$max_varname = 1;
                $i++;
            }
            $m = 0;
            $tot_tot_pause = 0;
            $tot_tot_non_pause = 0;
            $tot_tot_total = 0;
            $tot_sub_status = [];
            while ($m < $k) {
                $suser = $pc_users_array[$m];
                $sfull_name = $pc_user_names_array[$m];
                $spause_sec = 0;
                $snon_pause_sec = 0;
                $stotal_sec = 0;
                $n = 0;
                while ($n < $j) {
                    $sstatus = $sub_statuses_array[$n];
                    $varname = $sstatus."_graph";
                    $max_varname = "max_".$sstatus;
                    $i = 0;
                    $status_found = 0;
                    $scalls_totals = 0;
                    $status_found_total = 0;
                    while ($i < $subs_to_print) {
                        if (($suser == "$pc_user[$i]") and ( $sstatus == "$sub_status[$i]")) {
                            $spause_sec = ($spause_sec + $pc_pause_sec[$i]);
                            $snon_pause_sec = ($snon_pause_sec + $pc_non_pause_sec[$i]);
                            $stotal_sec = ($stotal_sec + $pc_non_pause_sec[$i] + $pc_pause_sec[$i]);
                            $user_code_pause_ms = $this->secConvert($pc_pause_sec[$i], 'H');
                            $$max_varname = ($pc_pause_sec[$i] > $$max_varname) ? $pc_pause_sec[$i] : $$max_varname;
                            $graph_stats[$m][(4 + $n)] = $pc_pause_sec[$i];
                            $status_found++;
                        }
                        if ($sstatus == "$sub_status[$i]") {
                            $scalls_totals = ($scalls_totals + $pc_pause_sec[$i]);
                            $status_found_total++;
                        }
                        $i++;
                    }
                    if ($status_found < 1) { $graph_stats[$m][(4 + $n)] = 0; }
                    $tot_sub_status[$n] = ($status_found_total < 1) ? 0 : $this->secConvert($scalls_totals, 'H');
                    $n++;
                }
                $tot_tot_pause = ($tot_tot_pause + $spause_sec);
                $tot_tot_non_pause = ($tot_tot_non_pause + $snon_pause_sec);
                $tot_tot_total = ($tot_tot_total + $stotal_sec);
                $max_total = (trim($stotal_sec) > $max_total) ? trim($stotal_sec) : $max_total;
                $max_nonpause = (trim($snon_pause_sec) > $max_nonpause) ? trim($snon_pause_sec) : $max_nonpause;
                $max_pause = (trim($spause_sec) > $max_pause) ? trim($spause_sec) : $max_pause;
                $graph_stats[$m][0] = "$sfull_name - $suser";
                $graph_stats[$m][1] = "$stotal_sec";
                $graph_stats[$m][2] = "$snon_pause_sec";
                $graph_stats[$m][3] = "$spause_sec";
                $m++;
            }
            $tot_tot_pause_MS = $this->secConvert($tot_tot_pause, 'H');
            $tot_tot_non_pause_MS = $this->secConvert($tot_tot_non_pause, 'H');
            $tot_tot_total_MS = $this->secConvert($tot_tot_total, 'H');
            $graph_sub_stat_display = [];
            $graph_sub_stat_html = [];
            $avg_sub_status_value = [];
            $avg_sub_status_display = [];
            $graph_total = [];
            $totalsecarray = [];
            $totalcount = 0;
            for ($d = 0; $d < count($graph_stats); $d++) {
                $graph_sub_stat_html[$d][0] = round(400 * $graph_stats[$d][2] / $max_nonpause);
                $graph_sub_stat_display[$d][0] = $this->secConvert($graph_stats[$d][2], 'H');
                $graph_sub_stat_html[$d][1] = round(400 * $graph_stats[$d][3] / $max_pause);
                $graph_sub_stat_display[$d][1] = $this->secConvert($graph_stats[$d][3], 'H');
                $graph_total[$d][0] = $graph_stats[$d][2];
                $graph_total[$d][1] = $graph_stats[$d][3];
                $totalsecarray[$d] = $this->secConvert(($graph_stats[$d][2] + $graph_stats[$d][3]), 'H');
                $totalcount = $totalcount + ($graph_stats[$d][2] + $graph_stats[$d][3]);
                for ($e = 0; $e < count($sub_statuses_array); $e++) {
                    $sstatus = $sub_statuses_array[$e];
                    $varname = $sstatus."_graph";
                    $max_varname = "max_".$sstatus;
                    $avg_sub_value[$d][$e] = round(400 * $graph_stats[$d][($e + 4)] / $$max_varname);
                    $avg_sub_display[$d][$e] = $this->secConvert($graph_stats[$d][($e + 4)], 'H');
                }
            }
            $totalcount = $this->secConvert($totalcount, 'H');
            $header_array = ['TIME', 'PAUSE', 'PAUSE AVG', 'WAIT', 'WAITAVG', 'TALK', 'TALK AVG', 'DISPO', 'DISPO AVG', 'DEAD', 'DEAD AVG', 'CUSTOMER', 'CUST AVG'];
            $sub_status_header_array = ['NONPAUSE', ' PAUSE'];
            $totall_array = [$tot_time_ms, $tot_tot_pause_mss, $tot_avg_pause_ms, $tot_tot_wait_ms, $tot_avg_wait_ms, $tot_tot_talk_ms, $tot_avg_talk_ms, $tot_tot_dispo_ms, $tot_avg_dispo_ms, $tot_tot_dead_ms, $tot_avg_dead_ms, $tot_tot_customer_ms, $tot_avg_customer_ms];
            $sub_totall_array = [$tot_tot_non_pause_MS, $tot_tot_pause_MS];

            return response()->json([
                'status' => 200,
                'request_data' => $request_data,
                'group_array' => $group_array,
                'tot_calls' => $tot_calls,
                'graph_stat_htmltotal' => $graph_stat_htmltotal,
                'graph_total' => $graph_total,
                'totalcount' => $totalcount,
                'totalsecarray' => $totalsecarray,
                'time_array' => $time_array,
                'agsname' => $agsname,
                'statuses_array' => $statuses_array,
                'sub_statuses_array' => $sub_statuses_array,
                'tot_status' => $tot_status,
                'tot_sub_status' => $tot_sub_status,
                'avg_display' => $avg_display,
                'graph_stat_html' => $graph_stat_html,
                'graph_stat_display' => $graph_stat_display,
                'avg_sub_display' => $avg_sub_display,
                'avg_sub_value' => $avg_sub_value,
                'graph_sub_stat_html' => $graph_sub_stat_html,
                'graph_sub_stat_display' => $graph_sub_stat_display,
                'header_array' => $header_array,
                'totall_array' => $totall_array,
                'sub_status_header_array' => $sub_status_header_array,
                'sub_totall_array' => $sub_totall_array
            ],200);
            
        }catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    /**
    *   Team performance Detail
    *   @param [date] => start_date  Has to be in mentioned format 2018-05-11 00:00:00
    *   @param [date] => end_date    Has to be in mentioned format 2018-07-11 23:59:59
    *   @param [array] => group
    *   @param [array] => user_group
        *   @param [array] => call_status
    *   @return [array] => request_data
    *   @return [array] => tot_calls
    *   @return [array] => graph_stat_htmltotal
    *
    */

    public function teamPerformanceDetail(Request $request)
    {
        try{

            # handle access control for permission 
            # User access control for permission need to check
            # user_group and group access control for permission need to check
            #         TODO to complete  

            (isset($request['shift'])) ? $shift = $request['shift'] : $shift = "ALL";
            (isset($request['start_date'])) ? $query_date = date("Y-m-d H:i:s", strtotime($request['start_date'])) : $query_date = " ";
            (isset($request['end_date'])) ? $end_date = date("Y-m-d H:i:s", strtotime($request['end_date'])) : $end_date = " ";
            (isset($request['user_group'])) ? $user_group = $request['user_group'] : $user_group = [];
            (isset($request['group'])) ? $group = $request['group'] : $group = [];
            (isset($request['call_status'])) ? $call_status = $request->data['call_status'] : $call_status = [];
            
            $i = 0;
            $call_status_ct = count($call_status);
            while ($i < $call_status_ct) {
                $call_status_string .= "$call_status[$i]|";
                $call_status_sql .= "'$call_status[$i]',";
                $html_statusheader.= sprintf("%6s", $call_status[$i]);
                $call_status_qs .= "&call_status[]=$call_status[$i]";
                $i++;
            }
            
            $campaign_statuses_list = VicidialCampaignStatuses::getCampaignStatusesForTeamPerformance($group);
            $statuses_list = VicidialStatuses::getAllStatusesForTeamPerformance($group)->union($campaign_statuses_list);
            
            $stmt = VicidialAgentLog::userDetailsForTeamPerfomance($group, $query_date, $end_date, $statuses_list);dd($stmt);
            
        }catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }


    /**
    *   Team performance Detail
    *   @param [date] => start_date  
    *   @param [date] => end_date    
    *   @param [array] => group
    *   @param [string] => user
    *   @param [string] => shift
    *   @return [array] => request_data
    *   @return [array] => tot_calls
    *   @return [array] => graph_stat_htmltotal
    *
    */


    public function singleAgentDailyDetail(Request $request)
    {
        try{

            # handle access control for permission 
            # User access control for permission need to check
            # User and group access control for permission need to check
            #         TODO to complete  
            
            (isset($request['shift'])) ? $shift = $request['shift'] : $shift = "ALL";
            (isset($request['start_date'])) ? $start_date = $request['start_date'] : $start_date = " ";
            (isset($request['end_date'])) ? $end_date = $request['end_date'] : $end_date = " ";
            (isset($request['user'])) ? $user = $request['user'] : $user = " ";
            (isset($request['group'])) ? $group = $request['group'] : $group = ['-ALL-'];

            $time_array = $this->setTimeBegin($shift, $start_date, $end_date);
            for ($i = 0; $i < count($group); $i++) {
                if ($group[$i] == "-ALL-") {
                    $group = VicidialCampaign::agentAllCampaignList();
                    break;
                }
            }
            $customer_interactive_statuses = '';
            $customer_interactive_statuses = "|".VicidialStatuses::getAllStatuses()->implode('|');
            $list = "|".VicidialCampaignStatuses::campaignStatuses()->implode('|');
            $customer_interactive_statuses = $customer_interactive_statuses.$list;
            $statuses = '-';
            $statuses_ary[0] = '';
            $j = 0;
            $dates = '-';
            $dates_array[0] = '';
            $k = 0;

            $list = VicidialAgentLog::agentDailylog($group, $time_array, $user);  
//            $filtered_list = $list->filter(function ($list) {
//                return ($list->calls > 0) && (strlen($list->status) > 0);
//            });dd($filtered_list);
//            $date = $list->pluck('date');
//            $calls = $list->pluck('calls');
//            $status = $list->pluck('status');dd($date, $calls, $status);
            $rows_to_print = count($list);
            $i = 0;
            while ($i < $rows_to_print) {

                if (($list[$i]->calls > 0) and (strlen($list[$i]->status) > 0)) {
                    $date[$i] = $list[$i]->date;
                    $calls[$i] = $list[$i]->calls;
                    $status[$i] = $list[$i]->status;

                    if ((!preg_match("/\-$status[$i]\-/i", $statuses)) and (strlen($status[$i]) > 0)) {
                        $statuses .= "$status[$i]-";

                        $statuses_ary[$j] = $status[$i];
                        $j++;
                    }
                    if (!preg_match("/\-$date[$i]\-/i", $dates)) {
                        $dates .= "$date[$i]-";
                        $dates_array[$k] = $date[$i];
                        $k++;
                    }
                }
                $i++;
            }

            dd($list, $date, $calls, $status, $statuses, $statuses_ary, $dates, $dates_array, $k, $j);

            
            $m = 0;
            $cis_count_tot = 0;
            $dnc_count_tot = 0;

            $graph_stats = [];
            $max_calls = 1;
            $max_cicalls = 1;
            $max_dncci = 1;
            while ($m < $k) {
                $s_date = $dates_array[$m];
                $s_calls = $calls[$m];
                $cis_count = 0;
                $dnc_count = 0;
                $n = 0;
                while ($n < $j) {
                    $s_status = $statuses_ary[$n];
                    $varname = $s_status . "_graph";

                    $max_varname = "max_" . $s_status;
                    $graph_stats[$m][(4 + $n)] = 0;
                    $i = 0;
                    $status_found = 0;
                    while ($i < $rows_to_print) {
                        if (($s_date == "$date[$i]") and ($s_status == "$status[$i]")) {
                            $s_calls = ($s_calls + $calls[$i]);
                            if (preg_match("/\|$status[$i]\|/i", $customer_interactive_statuses)) {
                                $cis_count = ($cis_count + $calls[$i]);
                                $cis_count_tot = ($cis_count_tot + $calls[$i]);
                            }
                            if (preg_match("/DNC/i", $status[$i])) {
                                $dnc_count = ($dnc_count + $calls[$i]);
                                $dnc_count_tot = ($dnc_count_tot + $calls[$i]);
                            }

                            if ($calls[$i] > $$max_varname) {
                                $$max_varname = $calls[$i];
                            }
                            $graph_stats[$m][(4 + $n)] = $calls[$i];

                            $status_found++;
                        }
                        $i++;
                    }

                    $n++;
                }


                $tot_calls = ($tot_calls + $s_calls);
                $raw_date = $s_date;
                $raw_alls = $s_calls;
                $raw_cis = $cis_count;
                $s_calls = sprintf("%6s", $s_calls);
                $cis_count = sprintf("%6s", $cis_count);
                $s_date = sprintf("%-10s", $s_date);
                while (strlen($s_user) > 10) {
                    $s_user = substr("$s_date", 0, -1);
                }
                if (($dnc_count < 1) or ($cis_count < 1)) {
                    $dnc_count_pct_s = 0;
                } else {
                    $dnc_count_pct_s = (($dnc_count / $cis_count) * 100);
                }
                $raw_dnc_pct = $dnc_count_pct_s;
                $dnc_count_pct_s = round($dnc_count_pct_s);
                $raw_dnc_count_pct_s = $dnc_count_pct_s;
                $dnc_count_pct_s = sprintf("%6s", $dnc_count_pct_s);
                if (trim($s_calls) > $max_calls) {
                    $max_calls = trim($s_calls);
                }
                if (trim($cis_count) > $max_cicalls) {
                    $max_cicalls = trim($cis_count);
                }
                if (trim($dnc_count_pct_s) > $max_dncci) {
                    $max_dncci = trim($dnc_count_pct_s);
                }

                $graph_stats[$m][1] = trim("$s_calls");
                $graph_stats[$m][2] = trim("$cis_count");
                $graph_stats[$m][3] = trim("$dnc_count_pct_s");
                $graph_stats[$m][0] = trim("$s_date");

                $m++;
            }

        }catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }


    /**
    *   Agent Group Login 
    *   @param [string] => selected_groups
    *   @return [array] => $list
    *
    */
    public function userGroupLogin(Request $request)
    {
        try{

            # handle access control for permission 
            # User access control for permission need to check
            # selected groups access control for permission need to check
            #         TODO to complete  
            
            $group = $request['selected_groups'];
            $carbon = Carbon::now()->subMonth()->format('Y-m-d');
            $list = VicidialUserLog::userLogDetails($group, $carbon);
            return response()->json([
                'status' => 200,
                'list' => $list
            ],200);
        }catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }


    /**
    *   Agent Time Sheet
    *   @param [string] => query_date
    *   @param [string] => user_id
    *   @return [array] => $list
    *   @return [array] => $total_calls_taken
    *   @return [array] => $pf_talk_time_hms
    *   @return [array] => $pf_pause_time_hms
    *   @return [array] => $pf_wait_time_hms
    *   @return [array] => $pf_wrapup_time_hms
    *   @return [array] => $pf_talk_avg_ms
    *   @return [array] => $pf_pause_avg_ms
    *   @return [array] => $pf_wait_avg_ms
    *   @return [array] => $pf_wrapup_avg_ms
    *   @return [array] => $pf_total_time_hms
    *   @return [array] => $pf_login_time_hms
    *   @return [array] => $time_clock_log_info
    *   @return [array] => $total_timeclock_login_hours_minutes
    */

    /**
    *   Agent Time Sheet CSv Download
    *   @param [string] => query_date
    *   @param [string] => user_id
    *   @param [string] => file_download        agent_time_sheet_for_user / time_clock_login_logout_time    
    *   @return [file] => .csv file
    */

    public function agentTimeSheet(Request $request)
    {
        try{

            # handle access control for permission 
            # selected groups access control for permission need to check
            #         TODO to complete  
            
            date_default_timezone_set('Pacific/Pago_Pago');
            $now = carbon::now()->format('Y-m-d H:i:s');
            $user_id = $request['user_id'];
            $query_date = $request['query_date'];
            $query_date_begin = "$query_date 00:00:00";
            $query_date_end = "$query_date 23:59:59";
            $lists = VicidialUser::userNameList($user_id);
            $list = VicidialAgentLog::userNameLogDetails($user_id, $query_date_begin, $query_date_end);
            $rs = 0; $i = 0;
            $total_time = ((isset($list[0]->talk)?$list[0]->talk:0) + 
                            (isset($list[0]->pause)?$list[0]->pause:0) + 
                            (isset($list[0]->wait)?$list[0]->wait:0) + 
                            (isset($list[0]->dispo)?$list[0]->dispo:0)
                          );
            $pf_total_time_hms = sprintf("%8s", $this->secConvert($total_time, 'H'));
            $pf_talk_time_hms = sprintf("%8s", $this->secConvert(isset($list[0]->talk)?$list[0]->talk:'', 'H'));
            $pf_pause_time_hms = sprintf("%8s", $this->secConvert(isset($list[0]->pause)?$list[0]->pause:'', 'H'));
            $pf_wait_time_hms = sprintf("%8s", $this->secConvert(isset($list[0]->wait)?$list[0]->wait:'', 'H'));
            $pf_wrapup_time_hms = sprintf("%8s", $this->secConvert(isset($list[0]->dispo)?$list[0]->dispo:'', 'H'));
            $pf_talk_avg_ms = sprintf("%6s", $this->secConvert(isset($list[0]->talk_sec)?$list[0]->talk_sec:'', 'H'));
            $pf_pause_avg_ms = sprintf("%6s", $this->secConvert(isset($list[0]->pause_sec)?$list[0]->pause_sec:'', 'H'));
            $pf_wait_avg_ms = sprintf("%6s", $this->secConvert(isset($list[0]->wait_sec)?$list[0]->wait_sec:'', 'H'));
            $pf_wrapup_avg_ms = sprintf("%6s", $this->secConvert(isset($list[0]->dispo_sec)?$list[0]->dispo_sec:'', 'H'));
            $total_calls_taken = isset($list[0]->calls)?$list[0]->calls:0;
            $first_login = VicidialAgentLog::userFirstLogin($user_id, $query_date_begin, $query_date_end);
            $first_login_time = $first_login->pluck('event_time')->first();
            $last_login_time = $first_login->pluck('event_time')->last();
            $start = $first_login->pluck('time_stamp')->first();
            $end = $first_login->pluck('time_stamp')->last();
            $pf_login_time_hms = sprintf("%8s", $this->secConvert(($end - $start), 'H'));
            $s_epoch = Carbon::parse($query_date_begin)->format('U');
            $e_epoch = Carbon::parse($query_date_end)->format('U');
            $time_clock_log_info = VicidialTimeclockLog::agentTimeClockLog($user_id, $s_epoch, $e_epoch);
            $o = 0;
            $login_sec = '';
            $total_timeclock_login_time = 0;
            $manager_edit = '';
            while ($o < count($time_clock_log_info)) {
                $time_clock_log_info[$o]['dateval'] = date("Y-m-d H:i:s", $time_clock_log_info[$o]['event_epoch']);
                if (strlen($time_clock_log_info[$o]['manager_user']) > 0) {
                    $manager_edit = ' * ';
                }
                if ($time_clock_log_info[$o]['event'] == "LOGIN") {
                    $login_sec = '';
                    $time_clock_log_info[$o]['logoutTime'] = $login_sec;
                }
                if ($time_clock_log_info[$o]['event'] == "LOGOUT" || $time_clock_log_info[$o]['event'] == "AUTOLOGOUT") {
                    $login_sec = $time_clock_log_info[$o]['login_sec'];
                    $total_timeclock_login_time = ($total_timeclock_login_time + $login_sec);
                    $event_hours_minutes = $this->secConvert($login_sec, 'H');
                    $time_clock_log_info[$o]['logoutTime'] = $event_hours_minutes;
                }
                $o++;
            }
            if (strlen($login_sec) < 1) {
                $login_sec = (date("U") - $end);
                $total_timeclock_login_time = ($total_timeclock_login_time + $login_sec);
            }
            $total_timeclock_login_hours_minutes = $this->secConvert($total_timeclock_login_time, 'H');

            $download_csv_array = [
                'agent_time_sheet_for_user',
                'time_clock_login_logout_time'
            ];

            if(isset($request['file_download']) && in_array($request['file_download'], $download_csv_array) && strlen($request['file_download']) > 0 ){

                $res_data = ['request'=>$request,
                            'start_time_range' => $query_date_begin, 
                            'end_time_range' => $query_date_end, 
                            'lists' => $lists, 
                            'list' => $list, 
                            'total_calls_taken' => $total_calls_taken, 
                            'pf_talk_time_hms' => $pf_talk_time_hms,
                            'pf_pause_time_hms' => $pf_pause_time_hms, 
                            'pf_wait_time_hms' => $pf_wait_time_hms,
                            'pf_wrapup_time_hms' => $pf_wrapup_time_hms, 
                            'pf_talk_avg_ms' => $pf_talk_avg_ms,
                            'pf_pause_avg_ms' => $pf_pause_avg_ms, 
                            'pf_wait_avg_ms' => $pf_wait_avg_ms,
                            'pf_wrapup_avg_ms' => $pf_wrapup_avg_ms, 
                            'pf_total_time_hms' => $pf_total_time_hms,
                            'first_login_time' => $first_login_time,
                            'last_login_time' => $last_login_time,
                            'pf_login_time_hms' => $pf_login_time_hms, 
                            'time_clock_log_info' => $time_clock_log_info,
                            'total_timeclock_login_hours_minutes' => $total_timeclock_login_hours_minutes
                        ];

                switch ($request['file_download']) {
                    case "agent_time_sheet_for_user":
                        return $this->agentTimeSheetForUserCsvDownload($res_data);
                        break;
                    case "time_clock_login_logout_time":
                        return $this->timeClockLoginLogoutTimeCsvDownload($res_data);
                        break;
                    default:
                        echo "default";
                }

            } else {
                return response()->json([
                    'status' => 200,
                    'present_time' => $now, 
                    'start_time_range' => $query_date_begin, 
                    'end_time_range' => $query_date_end, 
                    'lists' => $lists, 
                    'list' => $list, 
                    'total_calls_taken' => $total_calls_taken, 
                    'pf_talk_time_hms' => $pf_talk_time_hms,
                    'pf_pause_time_hms' => $pf_pause_time_hms, 
                    'pf_wait_time_hms' => $pf_wait_time_hms,
                    'pf_wrapup_time_hms' => $pf_wrapup_time_hms, 
                    'pf_talk_avg_ms' => $pf_talk_avg_ms,
                    'pf_pause_avg_ms' => $pf_pause_avg_ms, 
                    'pf_wait_avg_ms' => $pf_wait_avg_ms,
                    'pf_wrapup_avg_ms' => $pf_wrapup_avg_ms, 
                    'pf_total_time_hms' => $pf_total_time_hms,
                    'first_login_time' => $first_login_time,
                    'last_login_time' => $last_login_time,
                    'pf_login_time_hms' => $pf_login_time_hms, 
                    'time_clock_log_info' => $time_clock_log_info,
                    'total_timeclock_login_hours_minutes' => $total_timeclock_login_hours_minutes,
                    'download_csv_array'=>$download_csv_array
                ],200); 
            }           



        }catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    public function agentTimeSheetForUserCsvDownload($res_data)
    {
        try{

                $filename = "agent_time_sheet_for_user".date('Y-m-dh:i:s').".csv";
                $handle = fopen($filename, 'w+');

                $top_tab_header = [
                    '1' => ["Agent Time Sheet:".date('Y-m-d h:i:s')],
                    '2' => ["Time range: ".$res_data['start_time_range']."To".$res_data['end_time_range']],
                    '3' => ["Agent Time Sheet for :".$res_data['request']['user_id']],
                    '4' => ["TOTAL CALLS TAKEN :".$res_data['total_calls_taken']],
                    '5' => ['']
                ];

                foreach ($top_tab_header as $key => $value) {
                    fputcsv($handle, $value, ";", '"');
                }

                $top_tab_header = [
                    '1' => ['TALK TIME', $res_data['pf_talk_time_hms'], 'Average', $res_data['pf_talk_avg_ms']],
                    '2' => ['PAUSE TIME', $res_data['pf_pause_time_hms'], 'Average', $res_data['pf_pause_avg_ms']],
                    '3' => ['WAIT TIME', $res_data['pf_wait_time_hms'], 'Average', $res_data['pf_wait_avg_ms']],
                    '4' => ['WRAPUP TIME', $res_data['pf_wrapup_time_hms'], 'Average', $res_data['pf_wrapup_avg_ms']],
                    '5' => ['TOTAL ACTIVE AGENT TIME', $res_data['pf_total_time_hms']],
                    '6' => [''],
                    '7' => ['FIRST LOGIN', $res_data['first_login_time']],
                    '8' => ['LAST LOG ACTIVITY', $res_data['last_login_time']],
                    '9' => ['TOTAL LOGGED-IN TIME', $res_data['pf_login_time_hms']]
                ];

                foreach ($top_tab_header as $key => $value) {
                    fputcsv($handle, $value, ";", '"');
                }

                fclose($handle);
                $headers = [
                        'Content-Type' => 'text/csv',
                ];
                return Response::download($filename, $filename, $headers)->deleteFileAfterSend(true);

            }catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent_time_sheet_for_user_csv'), $e);
            throw $e;
        }
    }


    public function timeClockLoginLogoutTimeCsvDownload($res_data)
    {
        try{
                $filename = "time_clock_login_logout_time".date('Y-m-dh:i:s').".csv";
                $handle = fopen($filename, 'w+');

                $top_tab_header = [
                    '1' => ["Agent Time Sheet:".date('Y-m-d h:i:s')],
                    '2' => ["Time range: ".$res_data['start_time_range']."To".$res_data['end_time_range']],
                    '3' => [''],
                    '4' => ['TIME CLOCK LOGIN/LOGOUT TIME:'],
                    '5' => ['ID','EVENT','DATE','IP ADDRESS','GROUP','HOURS:MINUTES']
                ];

                foreach ($top_tab_header as $key => $value) {
                    fputcsv($handle, $value, ";", '"');
                }

                $res_data_tab = [];
                for($i=0;$i<sizeof($res_data['time_clock_log_info']);$i++){

                    $res_data_tab[$i]['ID'] = $res_data['time_clock_log_info'][$i]['timeclock_id'];
                    $res_data_tab[$i]['EVENT'] = $res_data['time_clock_log_info'][$i]['event'];
                    $res_data_tab[$i]['DATE'] = $res_data['time_clock_log_info'][$i]['dateval'];
                    $res_data_tab[$i]['IP_ADDRESS'] = $res_data['time_clock_log_info'][$i]['ip_address'];
                    $res_data_tab[$i]['GROUP'] = $res_data['time_clock_log_info'][$i]['user_group'];
                    $res_data_tab[$i]['HOURS:MINUTES'] = $res_data['time_clock_log_info'][$i]['logoutTime'];
                }

                foreach ($res_data_tab as $key => $value) {
                    fputcsv($handle, $value, ";", '"');
                }

                $total_tab = [
                    '1' => ['Total','','','','',$res_data['total_timeclock_login_hours_minutes']]
                ];

                foreach ($total_tab as $key => $value) {
                    fputcsv($handle, $value, ";", '"');
                }

                fclose($handle);
                $headers = [
                        'Content-Type' => 'text/csv',
                ];
                return Response::download($filename, $filename, $headers)->deleteFileAfterSend(true);

            }catch (Exception $e) {
            $this->postLogs(config('errorcontants.time_clock_login_logout_time_csv'), $e);
            throw $e;
        }
    }

    /**
    *   Agent Login Details
    *   @param [date] => start_date
    *   @param [date] => end_date
    *   @return [array] => $final_result
    *
    */


    /**
    *   Agent Login Details CSV Download
    *   @param [date] => start_date
    *   @param [date] => end_date
    *   @param [string] => file_download            1
    *   @return [File] => .csv file
    *
    */


    public function agentLoginDetail(Request $request)
    {
        try{

            # handle access control for permission 
            # User access control for permission need to check
            # user_groups access control for permission need to check
            #         TODO to complete

            $end_date = $request['end_date']." 23:59:59";
            $start_date = $request['start_date']." 00:00:00";
            $user_list = VicidialUser::userList()->pluck('user');
            $userloginfo = VicidialUserLog::totalLoginDetails($user_list, $start_date, $end_date)->toArray();
            $event_start_seconds = $event_hours_minutes =$total_login_hours_minutes = '';
            
            $final_time_array = $final_result = [];
            for ($i = 0; $i< count($userloginfo); $i++) {
                $total_login_time = 0;
                if ($userloginfo[$i]->event == "LOGIN") {
                    if ($userloginfo[$i]->phone_ip == "LOOKUP") {
                        $userloginfo[$i]->phone_ip = "";
                    }
                    $event_start_seconds = $userloginfo[$i]->event_epoch;
                    $userloginfo[$i]->session_logout = "";
                }
                if ($userloginfo[$i]->event == "LOGOUT") {
                    if ($event_start_seconds) {
                        $event_stop_seconds = $userloginfo[$i]->event_epoch;
                        $event_seconds = ($event_stop_seconds - $event_start_seconds);
                        $total_login_time = ($total_login_time + $event_seconds);
                        $event_hours_minutes = $this->secConvert($event_seconds, 'H');
                        $userloginfo[$i]->session_logout = $event_hours_minutes;
                    } else {
                        $event_hours_minutes = '';
                        $event_start_seconds = '';
                    }
                }
                $final_time_array[$i] = $this->secConvert($total_login_time, 'H');
                $final_result[$i] = [
                    'event' => $userloginfo[$i]->event,
                    'event_epoch' => $userloginfo[$i]->event_epoch,
                    'event_date' => $userloginfo[$i]->event_date,
                    'campaign_id' => $userloginfo[$i]->campaign_id,
                    'user_group' => $userloginfo[$i]->user_group,
                    'session_id' => $userloginfo[$i]->session_id,
                    'server_ip' => $userloginfo[$i]->server_ip,
                    'session_logout' => isset($userloginfo[$i]->session_logout)?$userloginfo[$i]->session_logout:'',
                    'extension' => $userloginfo[$i]->extension,
                    'computer_ip' => $userloginfo[$i]->computer_ip,
                    'phone_login' => $userloginfo[$i]->phone_login,
                    'phone_ip' => $userloginfo[$i]->phone_ip,
                    'user' => $userloginfo[$i]->user,
                    'full_name' => $userloginfo[$i]->full_name,
                    'total_login_time' => $final_time_array[$i]
                ]; 
            }
           
            $final_result = collect($final_result)->groupBy('user')->toArray();
            
            foreach ($final_result as $key=> $value) {
               if(count($value)){
                    $seconds =   collect($value)->sum(function ($val) {
                        if (!empty($val['session_logout'])) {

                            sscanf($val['session_logout'], "%d:%d:%d", $hours, $minutes, $seconds);

                            $time_seconds = isset($seconds) ? $hours * 3600 + $minutes * 60 + $seconds : $hours * 60 + $minutes;

                            return $time_seconds;
                        }
                    });
                    $final_result[$key][0]['total_logout_time']=sprintf('%02d:%02d:%02d', ($seconds/3600),($seconds/60%60),$seconds%60);  
                }
            }

            if(isset($request['file_download']) && $request['file_download'] == '1'){
                return $this->agentLoginDetailCsvDownload($final_result);
            } else {
                return response()->json([
                    'status' => 200,
                    'list' => $final_result
                ],200);
            }

        }catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    public function agentLoginDetailCsvDownload($final_result)
    {
        try{
                $filename = "agent_login_detail".date('Y-m-dh:i:s').".csv";
                $handle = fopen($filename, 'w+');


                $i=0;
                foreach ($final_result as $key => $rows) {

                    $res_array=[];
                    $res_array[$i]['title'] = $rows[0]['user'].'-'.$rows[0]['full_name'];

                    foreach ($res_array as $key => $value) {
                        fputcsv($handle, $value, ";", '"');
                    }

                    $top_tab_header = [
                        '1' => ['EVENT', 'DATE', 'CAMPAIGN', 'GROUP', 'HOURS MM:SS', 'SESSION', 'SERVER', 'PHONE', 'COMPUTER', 'PHONE LOGIN', 'PHONE IP']
                    ];

                    foreach ($top_tab_header as $key => $value) {
                        fputcsv($handle, $value, ";", '"');
                    }


                    $res_data = [];
                    for($j=0;$j<sizeof($rows);$j++){

                        $res_data[$j]['EVENT'] = $rows[$j]['event'];
                        $res_data[$j]['DATE'] = $rows[$j]['event_date'];
                        $res_data[$j]['CAMPAIGN'] = $rows[$j]['campaign_id'];
                        $res_data[$j]['GROUP'] = $rows[$j]['user_group'];
                        $res_data[$j]['HOURS_MM_SS'] = $rows[$j]['total_login_time'];
                        $res_data[$j]['SESSION'] = $rows[$j]['session_id'];
                        $res_data[$j]['SERVER'] = $rows[$j]['server_ip'];
                        $res_data[$j]['PHONE'] = $rows[$j]['extension'];
                        $res_data[$j]['COMPUTER'] = $rows[$j]['computer_ip'];
                        $res_data[$j]['PHONE_LOGIN'] = $rows[$j]['phone_login'];
                        $res_data[$j]['PHONE_IP'] = $rows[$j]['phone_ip'];
                    }

                    foreach ($res_data as $key => $value) {
                        fputcsv($handle, $value, ";", '"');
                    }

                    $total_tab = [
                        '1' => ['Total', '', '', '', $rows[0]['total_logout_time']]
                    ];

                    foreach ($total_tab as $key => $value) {
                        fputcsv($handle, $value, ";", '"');
                    }

                    $i++;
                }

                fclose($handle);
                $headers = [
                        'Content-Type' => 'text/csv',
                ];
                return Response::download($filename, $filename, $headers)->deleteFileAfterSend(true);

            }catch (Exception $e) {
                $this->postLogs(config('errorcontants.agent_login_detail_csv'), $e);
                throw $e;
            }
    }


    /**
     * Agent Stats. 
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param [date] => start_date
     * @param [date] => end_date
     * @param [DID] => 
     * @param [id] => user_id
     * @return [array] => $list
     */

    public function agentStats(Request $request)
    {
        try{
            # handle access control for permission 
            # User access control for permission need to check
            # user_id access control for permission need to check
            #         TODO to complete
            date_default_timezone_set('Pacific/Midway');
            $start_time = date("U");
            $today = date("Y-m-d");

            $firstlastname_display_user_stats = 0;
            $totalcallsArray = [];
            $tc_log_date_array = [];
            $agent_seconds_array = [];
            $customer_sec_array = [];
            $event_hours_minutes_array = [];
            $event_start_secondsArray = [];
            $userid = $request->input('userid');
            $begin_date = $request->input('startdate');
            $end_date = $request->input('enddate');
            $usr = VicidialUser::userListForUserstats($userid);
            if(isset($userid) && !isset($usr)){
                $data = [
                    'status'=>400,
                    'msg' => "You might not have permission to complete this action. Please contact your system administrator. Thanks!"
                ];
                return response()->json($data);  
            }
            $rsltuser = VicidialLog::UserLogDetail($userid, $begin_date, $end_date);
            $call_sec = $status = $counts = [];
            $records_to_grab = 0;
            if(isset($rsltuser)) {
                $records_to_grab =  $rsltuser->count();
                $call_sec = $rsltuser->pluck('length_in_sec');
                $status = $rsltuser->pluck('status');
                $counts = $rsltuser->pluck('count');
            }
            
            $closerloglist = VicidialCloserLog::UserCloserLogDetail($userid, $begin_date, $end_date);
            if(isset($closerloglist)) {
                $records_to_grab_closer = $closerloglist->count();
                $o = 0;
                while ($o < $records_to_grab_closer) {
                    $status_match = 0;
                    $r = 0;
                    $row_count = $rsltuser->pluck('count');
                    $row_status = $rsltuser->pluck('status');
                    $row_sum = $rsltuser->pluck('sum');
                    while ($r < $records_to_grab) {
                        if ($status[$r] == $row_status[$o]) {

                            $counts[$r] = ($counts[$r] + $row_count[$o]);
                            $call_sec[$r] = ($call_sec[$r] + $row_sum[$o]);
                            $status_match++;
                        }
                        $r++;
                    }
                    if ($status_match < 1) {
                        $counts[$p] = $row_count[$o];
                        $status[$p] = $row_status[$o];
                        $call_sec[$p] = $row_sum[$o];
                        $p++;
                    }
                    $o++;
                }
            }
            $o = 0;
            $total_sec = 0;
            $call_hours_minutes = $agentactivity_ary= $recording_ary = $manualcalls_ary = [];
            $total_calls = $tc = 0;
            while ($tc < count($counts)) {
                $total_calls = ($total_calls + $counts[$tc]);
                $call_hours_minutes[$tc] = $this->sec_convert($call_sec[$tc], 'H');
                $total_sec = ($total_sec + $call_sec[$tc]);
                $call_seconds = 0;
                $tc++;
            }
            
            $total_call_hours_minutes = $this->sec_convert($total_sec, 'H');
            
            $userloginfo = VicidialUserLog::userLogDetailsForAgentStats($userid, $begin_date, $end_date);
            
            $o = 0; $i = 0;
            $event_start_seconds = '';
            $event_stop_seconds = '';
            $total_login_time = 0;
            $total_userlogininfo = 0;
            if(isset($userloginfo)){
            $total_userlogininfo = $userloginfo->count();
                while ($i < $total_userlogininfo) {
                    if ($userloginfo[$i]->event == "LOGIN") {
                        if ($userloginfo[$i]->phone_ip == "LOOKUP") {
                            $userloginfo[$i]->phone_ip = "";
                        }
                        $event_start_seconds = $userloginfo[$i]->event_epoch;
                    }
                    if ($userloginfo[$i]->event == "LOGOUT") {
                        if ($event_start_seconds) {
                            $event_stop_seconds = $userloginfo[$i]->event_epoch;
                            $event_seconds = ($event_stop_seconds - $event_start_seconds);
                            $total_login_time = ($total_login_time + $event_seconds);
                            $event_hours_minutes = $this->sec_convert($event_seconds, 'H');
                            $userloginfo[$i]->session_id = $event_hours_minutes;
                            array_push($event_hours_minutes_array, $event_hours_minutes);
                        } else {
                            $event_hours_minutes = '';
                            $event_start_seconds = '';
                        }

                        array_push($event_start_secondsArray, $event_start_seconds);
                    }
                    $call_seconds = 0;
                    $i++;
                }
                $i = 0;
                $userloginfo = $userloginfo->toArray();
                foreach ($userloginfo as $key => $subArr) {
                    unset($subArr['event_epoch']);
                    $userloginfo[$key] = $subArr;  
                }
            }
            
            $total_login_hours_minutes = $this->sec_convert($total_login_time, 'H');
            
            $total_timeclock_login_time = 0;
            
            $sq_epoch = carbon::parse($begin_date)->format('U');
            $eq_epoch = carbon::parse($end_date.' 23:59:59')->format('U');
            
            $timeclockloginfo = VicidialTimeclockLog::userTimeClockLogDetailsForAgentStats($userid, $sq_epoch, $eq_epoch);
            $total_timeclocklogininfo = $o =  $total_logs = 0;
            $login_sec = '';
            $manager_edit = '';
            $total_timeclocklogininfo = 0;
            if(isset($timeclockloginfo)) {
                $total_timeclocklogininfo = $timeclockloginfo->count();
                if($total_timeclocklogininfo > 0){
                    while ($o < $total_timeclocklogininfo) {
                        $TC_log_date = date("Y-m-d H:i:s", $timeclockloginfo[$o]->event_epoch);

                        array_push($tc_log_date_array, $TC_log_date);

                        if (strlen($timeclockloginfo[$o]->manager_user) > 0) {
                            $manager_edit = ' * ';
                        }
                        if ($timeclockloginfo[$o]->event == "LOGIN") {
                            $login_sec = '';
                            $timeclockloginfo[$o]->eventTime = '';
                        }
                        if (preg_match('/LOGOUT/', $timeclockloginfo[$o]->event)) {
                            $login_sec = $timeclockloginfo[$o]->login_sec;
                            $total_timeclock_login_time = ($total_timeclock_login_time + $login_sec);
                            $event_hours_minutes = $this->sec_convert($login_sec, 'H');
                            $timeclockloginfo[$o]->eventTime = $event_hours_minutes;
                        }
                        $o++;
                    }
                    $last_record = count($timeclockloginfo) - 1;
                    if ($last_record < 0) {
                        $last_record = 0;
                    }
                    if (strlen($login_sec) < 1) {
                        $login_sec = ($start_time - $timeclockloginfo[1]->event_epoch);
                        $total_timeclock_login_time = ($total_timeclock_login_time + $login_sec);
                    }
                }
            }
            $timeclckloginfo = [];
            if(isset($timeclockloginfo) && $total_timeclocklogininfo > 0) { 
                $o = 0;
                while ($o < $total_timeclocklogininfo) {
                    $timeclckloginfo[$o]['timeclock_id'] = $timeclockloginfo[$o]->timeclock_id;
                    $timeclckloginfo[$o]['event'] = $timeclockloginfo[$o]->event;
                    $timeclckloginfo[$o]['edit'] = '';
                    $timeclckloginfo[$o]['date'] = $tc_log_date_array[$o];
                    $timeclckloginfo[$o]['ip_address'] = $timeclockloginfo[$o]->ip_address;
                    $timeclckloginfo[$o]['user_group'] = $timeclockloginfo[$o]->user_group;
                    $timeclckloginfo[$o]['eventTime']= $timeclockloginfo[$o]->eventTime;
                    $o++;
                }
            }
            $total_timeclock_login_hours_minutes = $this->sec_convert($total_timeclock_login_time, 'H');
            
            $closeringrouplogs = \App\VicidialUserCloserLog::closerInGroupLogs($userid ,$end_date , $begin_date );
            
            
            $outboundcalls = VicidialLog::outboundCalls($userid ,$end_date , $begin_date);
            
            $inboundcalls = VicidialCloserLog::inboundCalls($userid ,$end_date , $begin_date);
            
            $u = 0;
            $total_in_seconds = 0;
            $total_agent_seconds = 0;
            if(isset($inboundcalls)){
                $total_inboundcalls = $inboundcalls->count();
                while ($u < $total_inboundcalls) {
                    $total_in_seconds = ($total_in_seconds + $inboundcalls[$u]->length_in_sec);
                    $AGENTseconds = ($inboundcalls[$u]->length_in_sec - $inboundcalls[$u]->queue_seconds);
                    if ($AGENTseconds < 0) {
                        $AGENTseconds = 0;
                    }
                    array_push($agent_seconds_array, $AGENTseconds);
                    $total_agent_seconds = ($total_agent_seconds + $AGENTseconds);
                    $u++;
                }
            }
            $agentactivity = VicidialAgentLog::agentActivity($userid ,$end_date , $begin_date);
            
            $u = 0;
            $total_pause_seconds = 0;
            $total_wait_seconds = 0;
            $total_talk_seconds = 0;
            $total_dispo_seconds = 0;
            $total_dead_seconds = 0;
            $total_customerseconds = 0;
            if(isset($agentactivity)) {
                $total_agentactivity = $agentactivity->count();
                while ($u < $total_agentactivity) {
                    $customer_sec = ($agentactivity[$u]->talk_sec - $agentactivity[$u]->dead_sec);
                    if ($customer_sec < 0) {
                        $customer_sec = 0;
                    }
                    array_push($customer_sec_array, $customer_sec);

                    $total_pause_seconds = ($total_pause_seconds + $agentactivity[$u]->pause_sec);
                    $total_wait_seconds = ($total_wait_seconds + $agentactivity[$u]->wait_sec);
                    $total_talk_seconds = ($total_talk_seconds + $agentactivity[$u]->talk_sec);
                    $total_dispo_seconds = ($total_dispo_seconds + $agentactivity[$u]->dispo_sec);
                    $total_dead_seconds = ($total_dead_seconds + $agentactivity[$u]->dead_sec);
                    $total_customerseconds = ($total_customerseconds + $customer_sec);

                    $u++;
                }
            }
            $u = 0;
            while ($u < $total_agentactivity) {
                $agentactivity_ary[] = array (
                    "serial_id"=>$u+1,
                    "event_time"=>$agentactivity[$u]->event_time,
                    "pause_sec"=>$agentactivity[$u]->pause_sec,
                    "wait_sec"=>$agentactivity[$u]->wait_sec,
                    "talk_sec"=>$agentactivity[$u]->talk_sec,
                    "dispo_sec"=>$agentactivity[$u]->dispo_sec,
                    "dead_sec"=>$agentactivity[$u]->dead_sec,
                    "customer"=>$customer_sec_array[$u],
                    "status"=>$agentactivity[$u]->status,
                    "lead_id"=>$agentactivity[$u]->lead_id,
                    "campaign_id"=>$agentactivity[$u]->campaign_id,
                    "sub_status"=>$agentactivity[$u]->sub_status,
                );
                $u++;
            }
            
            
            $total_pause_second_shh = $this->sec_convert($total_pause_seconds, 'H');
            $total_wait_second_shh = $this->sec_convert($total_wait_seconds, 'H');
            $total_talk_second_shh = $this->sec_convert($total_talk_seconds, 'H');
            $total_dispo_second_shh = $this->sec_convert($total_dispo_seconds, 'H');
            $total_dead_second_shh = $this->sec_convert($total_dead_seconds, 'H');
            $total_customer_second_shh = $this->sec_convert($total_customerseconds, 'H');
            
            $recording = RecordingLog::recordingLogs($userid ,$end_date , $begin_date);
            if(isset($recording)){
                $u= 0 ;
                $recording_cnt = $recording->count();
                while ($u < $recording_cnt) {
                    $recording_ary[] = array(
                        'serial'=>$u+1,
                        'lead_id'=>$recording[$u]['lead_id'],
                        'start_time'=>$recording[$u]['start_time'],
                        'length_in_sec'=>$recording[$u]['length_in_sec'],
                        'recording_id'=>$recording[$u]['recording_id'],
                        'filename'=>$recording[$u]['filename'],
                        'location'=>$recording[$u]['location'],
                    );
                    $u++;
                }
            }
            $manualcalls = UserCallLog::manualCalls($userid ,$end_date , $begin_date);
            if(isset($manualcalls)){
                $u= 0 ;
                $manualcalls_cnt = $manualcalls->count();
                while ($u < $manualcalls_cnt) {
                    $manualcalls_ary[] = array(
                        'serial'=>$u+1,
                        'call_date'=>$manualcalls[$u]['call_date'],
                        'call_type'=>$manualcalls[$u]['call_type'],
                        'server_ip'=>$manualcalls[$u]['server_ip'],
                        'phone_number'=>$manualcalls[$u]['phone_number'],
                        'number_dialed'=>$manualcalls[$u]['number_dialed'],
                        'lead_id'=>$manualcalls[$u]['lead_id'],
                        'callerid'=>$manualcalls[$u]['callerid'],
                        'group_alias_id'=>$manualcalls[$u]['group_alias_id'],
                        'preset_name'=>$manualcalls[$u]['preset_name'],
                        'customer_hungup'=>$manualcalls[$u]['customer_hungup']
                    );
                    $u++;
                }
            }
            
            $leadsearch = VicidialLeadSearchlog::leadSearch($userid ,$end_date , $begin_date);
            
            $leadskip = VicidialAgentSkipLog::leadSkip($userid ,$end_date , $begin_date);
            
            $data = array(
                'usr' => $usr,
                'counts' => $counts,
                'status' => $status,
                'call_hours_minutes' => $call_hours_minutes,
                'total_calls' => $total_calls,
                'total_call_hours_minutes' => $total_call_hours_minutes,
                'userloginfo' => $userloginfo,
                'total_login_hours_minutes' => $total_login_hours_minutes,
                'event_hours_minutes_array' => $event_hours_minutes_array,
                'event_start_secondsArray' => $event_start_secondsArray,
                'timeclockloginfo' => $timeclckloginfo,
                'manager_edit' => $manager_edit,
                'tc_log_date_array' => $tc_log_date_array,
                'total_timeclock_login_hours_minutes' => $total_timeclock_login_hours_minutes,
                'closeringrouplogs' => $closeringrouplogs,
                'outboundcalls' => $outboundcalls,
                'inboundcalls' => $inboundcalls,
                'total_in_seconds' => $total_in_seconds,
                'agent_seconds_array' => $agent_seconds_array,
                'total_agent_seconds' => $total_agent_seconds,
                'agentactivity' => $agentactivity_ary,
                'customer_sec_array' => $customer_sec_array,
                'total_pause_seconds' => $total_pause_seconds,
                'total_wait_seconds' => $total_wait_seconds,
                'total_talk_seconds' => $total_talk_seconds,
                'total_dispo_seconds' => $total_dispo_seconds,
                'total_dead_seconds' => $total_dead_seconds,
                'total_customerseconds' => $total_customerseconds,
                'total_pause_second_shh' => $total_pause_second_shh,
                'total_wait_second_shh' => $total_wait_second_shh,
                'total_talk_second_shh' => $total_talk_second_shh,
                'total_dispo_second_shh' => $total_dispo_second_shh,
                'total_dead_second_shh' => $total_dead_second_shh,
                'total_customer_second_shh' => $total_customer_second_shh,
                'recording' => $recording_ary,
                'manualcalls' => $manualcalls_ary,
                'leadsearch' => $leadsearch,
                'leadskip' => $leadskip);
            
            $data = [
                    'status'=>200,
                    'msg' => "Successfull",
                    'data'=> $data
                ];
            return response()->json($data);  
            
        }catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    } 

    
    
    /**
     * Get All Status
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @throws Exception
     */
    public function getAllowdedStatus(Request $request){
        try{
            $user  = $request->user();
            $condition = $this->getListByAccess(ACCESS_TYPE_CAMPAIGN, ACCESS_READ,$user);
            $campaignstatus = VicidialCampaignStatuses::whereIn('campaign_id',$condition)->distinct()->get(['status']);
            
            $statuses = VicidialStatuses::select('status')->get();
            if(isset($campaignstatus)){
                $campaignstatus = $campaignstatus->toArray();
            } else {
                $campaignstatus = [];
            }
            if(isset($statuses)){
                $statuses = $statuses->toArray();
            } else {
                $statuses = [];
            }
            $new_array = [];
            $statuses = array_merge($statuses, $campaignstatus);
            foreach ($statuses as $key1 => $value1) {
                foreach ($value1 as $key => $value) {
                    $single_array = $value;
                }
                array_push($new_array, $single_array);
            }
            return response()->json([
                'status'=>200,    
                'message' => 'Successfully !',
                'allowedstatus' => $statuses
            ]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }
    
    
    /**
     * Team Performance Detail
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param Request $request
     * @throws Exception
     */
    public function teamPerformanceDetails(Request $request){
        try{
            $group = $request->input('group');
            $user_group = $request->input('user_group');
            $file_download = $request->input('file_download');

            
            $shift = $request->input('shift');
            isset($shift) ? $shift : $shift = "ALL";
            $query_date = date("Y-m-d H:i:s", strtotime($request->input('startdate')));
            $query_date = isset($query_date) ? $query_date : " ";
            $end_date = date("Y-m-d H:i:s", strtotime($request->input('enddate')));
            isset($end_date) ? $end_date : $enddate = " ";
            $user_group = $request->input('user_group');
            isset($user_group ) ? $user_group  : $user_group = " ";
            $group = $request->input('group');
            isset($group) ? $group : $group = " ";
            $call_status = $request->input('call_status');
            isset($call_status) ? $call_status : $call_status = "";
            $display_type = $request->input('display_type');
            $AGSname = $team_array_details = array();
            if (in_array("-NONE-", $call_status)) {
                $call_status = array();
            }
            
            $i = 0;
            $call_status_ct = count($call_status);
            $call_status_string = $call_status_sql = $html_statusheader = $call_status_qs = $html_statusheader1 ='';
            while ($i < $call_status_ct) {
                $call_status_string .= "$call_status[$i]|";
                $call_status_sql .= "'$call_status[$i]',";
                $i++;
            }
            $html_statusheader=$call_status;
            $call_status_qs = $call_status;
            if ((preg_match('/\s\-\-NONE\-\-\s/', $call_status_string) ) or ( $call_status_ct < 1)) { $call_status_sql = ""; } else {
                $call_status_sql = preg_replace('/,$/i', '', $call_status_sql);
                $call_status_sql_str = $call_status_sql;
//                $call_status_sql = "and status IN($call_status_sql)";
            }
//            $group_sql_str = "'".implode("','", $group)."'";
//            $group_sql = "and campaign_id IN($group_sql_str)";
            $user_group_ct = count($user_group);
            $union_array1 = VicidialCampaignStatuses::select('status')->where('sale','Y')->whereIn('campaign_id',$group)->get();
            $union_array2 = VicidialStatuses::select('status')->where('sale','Y')->get();
            if(isset($union_array1)){
                $union_array1 = $union_array1->toArray();
            } else {
                $union_array1 = [];
            }
            if(isset($union_array2)){
                $union_array2 = $union_array2->toArray();
            } else {
                $union_array2 = [];
            }
            $new_array = $ascii_text =[];
            $union_array = array_merge($union_array1, $union_array2);
            foreach ($union_array as $key1 => $value1) {
                foreach ($value1 as $key => $value) {
                    $single_array = $value;
                }
                array_push($new_array, $single_array);
            }
            $stmt = VicidialAgentLog::maxUserLeadStatus($query_date,$end_date, $group, $new_array);
            $total = array();
            $max_total = array();
            $p=0;
            if(isset($stmt)){
                $group_ct = $stmt->count();
                $row = $stmt->toArray();
            }
            $sale_array = $sales_talk_time_array = [];
            while ($p < $group_ct) {
                $user = $row[$p]["user"];
                $sales_talk_time_array[$user] =  $sale_array[$user] = 0;
                $p++;
            }
            $p=0;
            while ($p < $group_ct) {
                $lead_id = $row[$p]["lead_id"];
                $user = $row[$p]["user"];
                $current_status = $row[$p]["current_status"];
                if (preg_match("/QCCANC/i", $current_status)) {
                    $cancel_array[$row[$p]["user"]] ++;
                } else if (preg_match("/QCFAIL/i", $current_status)) {
                    $incomplete_array[$row[$p]["user"]] ++;
                } else {
                    if(isset($user)){
                        $sale_array[$user] ++; 
                        $sale_time_rslt = VicidialAgentLog::sumForSaleTime($user,$lead_id, $group);
                        
//                        if ($DB) { $ascii_text['sale_time_stmt'] ="$sale_time_stmt\n"; }
                        $sales_talk_time_array[$user]+= $sale_time_rslt->sum;
                    }
                }
                $p++;
            }
            $total_average_sale_time = 0;
            $total_average_contact_time = 0;
            $total_talk_time = 0;
            $total_system_time = 0;
            $total_calls = 0;
            $total_leads = 0;
            $total_contacts = 0;
            $total_sales = 0;
            $total_inc_sales = 0;
            $total_cnc_sales = 0;
            $total_callbacks = 0;
            $total_stcall = 0;
            $call_status_totals_grand_total = $call_status_group_totals = [];
            for ($q = 0; $q < count($call_status); $q++) {
                $call_status_totals_grand_total[$q] = 0;
            }
            
            $total_graph_stats[] = "";
            $max_graph_stats[] = "";
            $max_totalcalls = 1;
            $max_totalleads = 1;
            $max_totalcontacts = 1;
            $max_totalcontactratio = 1;
            $max_totalsystemtime = 1;
            $max_totaltalktime = 1;
            $max_totalsales = 1;
            $max_totalsalesleadsratio = 1;
            $max_totalsalescontactsratio = 1;
            $max_totalsalesperhour = 1;
            $max_totalincsales = 1;
            $max_totalcancelledsales = 1;
            $max_totalcallbacks = 1;
            $max_totalfirstcall = 1;
            $max_totalavgsaletime = 1;
            $max_totalavgcontacttime = 1;
            $mainarray = array();
            $group_sales_talk_time = 0;
            $group_contact_talk_time = $group_avg_sale_time = $group_avg_contact_time = $total_nonpause_time = $total_contact_talk_time = $total_sales_talk_time= 0;
            $group_contact_ratio = "0.00";
            $group_sales_per_hour = $group_average_sale_time = $group_sales_ratio = $group_average_contact_time = $group_talk_time = $group_system_time = $group_nonpause_time = $group_calls = $group_leads = $group_contacts = $group_sales = $group_inc_sales = $group_cnc_sales = $group_callbacks = $group_stcall = $group_sale_contact_ratio = 0;
            for ($i = 0; $i < $user_group_ct; $i++) {
                $group_average_sale_time = 0;
                $group_average_contact_time = 0;
                $group_talk_time = 0;
                $group_system_time = 0;
                $group_nonpause_time = 0;
                $group_calls = 0;
                $group_leads = 0;
                $group_contacts = 0;
                $group_sales = 0;
                $group_inc_sales = 0;
                $group_cnc_sales = 0;
                $group_callbacks = 0;
                $group_stcall = 0;
                $name_rslt = VicidialUserGroup::select('group_name')->where('user_group',$user_group[$i])->first();
                if(isset($name_rslt)){
                    $group_name = $name_rslt->group_name;
                } else {
                    $group_name = '';
                }
                for ($q = 0; $q < count($call_status); $q++) {
                    $call_status_group_totals[$q] = 0;
                }
                $ascii_text[$i]['user_group'] =$user_group[$i];
                $ascii_text[$i]['group_name'] =$group_name;
                $team = "$user_group[$i] - $group_name";
                $teamid = $user_group[$i];

                #### USER COUNTS
                $user_stmt = VicidialAgentLog::agentDetailsForUserGroup($user_group[$i],$query_date, $end_date,$group);
                if(isset($user_stmt)){
                    $user_rslt_cnt = $user_stmt->count();
                    $user_rslt = $user_stmt->toArray();
                } else {
                    $user_rslt = [];
                }
                $p = 0;
                while ($p < $user_rslt_cnt) {
                    $user = $user_rslt[$p]["user"];
                    if(!isset($sales_talk_time_array[$user])) { $sales_talk_time_array[$user] = 0; }
                    if(!isset($sale_array[$user])) { $sale_array[$user] = 0; }
                    if(!isset($incomplete_array[$user])) { $incomplete_array[$user] = 0; }
                    if(!isset($cancel_array[$user])) { $cancel_array[$user] = 0; }
                    if(!isset($sale_array[$user])) { $sale_array[$user] = 0; }
                    $p++;
                }
                if ($user_rslt_cnt > 0) {
                    $graph_stats = array();
                    $max_calls = 1;
                    $max_leads = 1;
                    $max_contacts = 1;
                    $max_contactratio = 1;
                    $max_systemtime = 1;
                    $max_talktime = 1;
                    $max_sales = 1;
                    $max_salesleadsratio = 1;
                    $max_salescontactsratio = 1;
                    $max_salesperhour = 1;
                    $max_incsales = 1;
                    $max_cancelledsales = 1;
                    $max_callbacks = 1;
                    $max_firstcall = 1;
                    $max_avgsaletime = 1;
                    $max_avgcontacttime = 1;

                    $call_status_ct = count($call_status);
                    $team_array_details['call_status'] = $call_status;
                    $k = 0;
                    while ($k < $call_status_ct) {
//                        $call_status_string .= "$call_status[$i]|"; #comment for next execution
//                        $call_status_sql .= "'$call_status[$i]',";
                        $k++;
                    }
                    $j = $o = 0 ;
                    $group_contact_talk_time = $group_avg_sale_time = $group_avg_contact_time = $total_nonpause_time = $total_contact_talk_time = $total_sales_talk_time= 0; 
                    while ($o < $user_rslt_cnt) {
                        $j++;
                        $contacts = 0;
                        $callbacks = 0;
                        $stcall = 0;
                        $calls = 0;
                        $leads = 0;
                        $system_time = 0;
                        $talk_time = 0;
                        $nonpause_time = 0;
                        # For each user
                        $user = $user_rslt[$o]["user"];
                        $sale_array[$user] += 0;  # For agents with no sales logged
                        $incomplete_array[$user]+=0;  # For agents with no QCFAIL logged
                        $cancel_array[$user]+=0;  # For agents with no QCCANC logged
                        $contact_talk_time  = 0; 
                        # Leads
                        $lead_rslt = VicidialAgentLog::leadStatus($query_date , $end_date , $group , $user , $user_group[$i]);
                        $leads = $lead_rslt->lead_id;
                        # Callbacks
                        $callbacks = \App\VicidialCallback::whereIn('status',['ACTIVE', 'LIVE'])
                                ->whereIn('campaign_id',$group)
                                ->where([['user',$user],['user_group',$user_group[$i]]])
                                ->count();

                        $stat_stmt = VicidialAgentLog::statResult($user,$user_group[$i],$query_date,$end_date,$group);
                        if(isset($stat_stmt)){ 
                            $stat_count = $stat_stmt->count(); 
                            $stat_row = $stat_stmt->toArray(); 
                        }
                        $r = 0;
                        while ($r < $stat_count) {
                            if ($stat_row[$r]['customer_contact'] == "Y") {
                                $contacts+=$stat_row[$r]['count'];
                                $contact_talk_time+=($stat_row[$r]['talk_sec'] - $stat_row[$r]['dead_sec']);

                                $group_contact_talk_time+=($stat_row[$r]['talk_sec'] - $stat_row[$r]['dead_sec']);
                            }
                            $calls+=$stat_row[$r]['count'];
                            $talk_time+=($stat_row[$r]['talk_sec'] - $stat_row[$r]['dead_sec']);
                            $system_time+=($stat_row[$r]['talk_sec'] + $stat_row[$r]['wait_sec'] + $stat_row[$r]['dispo_sec']);
                            $nonpause_time+=($stat_row[$r]['talk_sec'] + $stat_row[$r]['wait_sec'] + $stat_row[$r]['dispo_sec']);
                            if ($stat_row[$r]['sub_status'] == "PRECAL") {
                                $nonpause_time+=$stat_row[$r]['pause_sec'];
                            }
                            $r++;
                        }
                        
                        $user_talk_time = $this->secConvert($talk_time, 'H');
                        $group_talk_time+=$talk_time;
                        $user_system_time = $this->secConvert($system_time, 'H');
                        $talk_hours = $talk_time / 3600;
                        $group_system_time+=$system_time;
                        $user_nonpause_time = $this->secConvert($nonpause_time, 'H');
                        $group_nonpause_time+=$nonpause_time;
                        
                        if ($sale_array[$user] > 0) { $average_sale_time = $this->secConvert(round($sales_talk_time_array[$user] / $sale_array[$user]), 'H'); } else { $average_sale_time = "00:00:00"; }
                        
                        $group_sales_talk_time += $sales_talk_time_array[$user];
                        
                        if ($contacts > 0) { $average_contact_time = $this->secConvert(round($contact_talk_time / $contacts), 'H'); } else { $average_contact_time = "00:00:00"; }
                        
                        $ascii_text[$i]['info'][$o]['full_name'] = $user_rslt[$o]["full_name"];
                        $ascii_text[$i]['info'][$o]['user'] = $user;
                        $ascii_text[$i]['info'][$o]['calls'] = $calls;
                        $ascii_text[$i]['info'][$o]['group_calls'] = $group_calls+=$calls;
                        $ascii_text[$i]['info'][$o]['leads'] = $leads;
                        $ascii_text[$i]['info'][$o]['group_leads'] = $group_leads+=$leads;
                        $ascii_text[$i]['info'][$o]['contacts'] = $contacts;
                        $ascii_text[$i]['info'][$o]['group_contacts'] = $group_contacts+=$contacts;
                        if ($leads > 0) {
                            $contact_ratio = (100 * $contacts / $leads);
                        } else {
                            $contact_ratio = "0.00";
                        }
                        $ascii_text[$i]['info'][$o]['contact_ratio'] = $contact_ratio;
                        $ascii_text[$i]['info'][$o]['user_nonpause_time'] = $user_nonpause_time;
                        $ascii_text[$i]['info'][$o]['user_system_time'] = $user_system_time;
                        $ascii_text[$i]['info'][$o]['user_talk_time'] = $user_talk_time;
                        $ascii_text[$i]['info'][$o]['sale_array'] = $sale_array[$user];
                        $ascii_text[$i]['info'][$o]['group_sales'] = $group_sales+=$sale_array[$user];
                        if ($nonpause_time > 0) {
                            $sales_per_working_hours = ($sale_array[$user] / ($nonpause_time / 3600));
                        } else {
                            $sales_per_working_hours = "0.00";
                        }
                        $ascii_text[$i]['info'][$o]['sales_per_working_hours'] = $sales_per_working_hours;
                        if ($leads > 0) {
                            $sales_ratio =  (100 * $sale_array[$user] / $leads);
                        } else {
                            $sales_ratio = "0.00";
                        }
                        $ascii_text[$i]['info'][$o]['sales_ratio'] =  $sales_ratio."%";
                        if ($contacts > 0) {
                            $sale_contact_ratio =  (100 * $sale_array[$user] / $contacts);
                        } else {
                            $sale_contact_ratio = 0;
                        }
                        $ascii_text[$i]['info'][$o]['sale_contact_ratio'] =$sale_contact_ratio."%";
                        if ($talk_hours > 0) {
                            $sales_per_hour =  ($sale_array[$user] / $talk_hours);
                        } else {
                            $sales_per_hour = "0.00";
                        }
                        if (($calls > 0) and ( $leads > 0)) {
                            $stcall = ($calls / $leads);
                        } else {
                            $stcall = "0.00";
                        }

                        if ($sale_array[$user] > 0) { $avg_sale_time = round($sales_talk_time_array[$user] / $sale_array[$user]); } else { $avg_sale_time = 0; }
                        if ($contacts > 0) { $avg_contact_time = round($contact_talk_time / $contacts); } else { $avg_contact_time = 0; }
                        $graph_stats[$j]['user'] = $user_rslt[$o]["full_name"]." - $user";
                        $graph_stats[$j]['calls'] = trim($calls);
                        $graph_stats[$j]['leads'] = trim($leads);
                        $graph_stats[$j]['contacts'] = trim($contacts);
                        $graph_stats[$j]['contact_ratio'] = trim($contact_ratio);
                        $graph_stats[$j]['system_time'] = trim($system_time);
                        $graph_stats[$j]['talk_time'] = trim($talk_time);
                        $graph_stats[$j]['sale_array'] = trim($sale_array[$user]);
                        $graph_stats[$j]['sales_ratio'] = trim($sales_ratio);
                        $graph_stats[$j]['sale_contact_ratio'] = trim($sale_contact_ratio);
                        $graph_stats[$j]['sales_per_hour'] = trim($sales_per_hour);
                        $graph_stats[$j]['incomplete_array'] = trim($incomplete_array[$user]);
                        $graph_stats[$j]['cancel_array'] = trim($cancel_array[$user]);
                        $graph_stats[$j]['callbacks'] = trim($callbacks);
                        $graph_stats[$j]['stcall'] = trim($stcall);
                        $graph_stats[$j]['avg_sale_time'] = trim($avg_sale_time);
                        $graph_stats[$j]['avg_contact_time'] = trim($avg_contact_time);
                        
                        

                        if (trim($calls) > $max_calls) { $max_calls = trim($calls); }
                        if (trim($leads) > $max_leads) { $max_leads = trim($leads); }
                        if (trim($contacts) > $max_contacts) { $max_contacts = trim($contacts); }
                        if (trim($contact_ratio) > $max_contactratio) { $max_contactratio = trim($contact_ratio); }
                        if (trim($system_time) > $max_systemtime) { $max_systemtime = trim($system_time); }
                        if (trim($talk_time) > $max_talktime) { $max_talktime = trim($talk_time); }
                        if (trim($sale_array[$user]) > $max_sales) { $max_sales = trim($sale_array[$user]); }
                        if (trim($sales_ratio) > $max_salesleadsratio) { $max_salesleadsratio = trim($sales_ratio); }
                        if (trim($sale_contact_ratio) > $max_salescontactsratio) { $max_salescontactsratio = trim($sale_contact_ratio); }
                        if (trim($sales_per_hour) > $max_salesperhour) { $max_salesperhour = trim($sales_per_hour); }
                        if (trim($incomplete_array[$user]) > $max_incsales) { $max_incsales = trim($incomplete_array[$user]); }
                        if (trim($cancel_array[$user]) > $max_cancelledsales) { $max_cancelledsales = trim($cancel_array[$user]); }
                        if (trim($callbacks) > $max_callbacks) { $max_callbacks = trim($callbacks); }
                        if (trim($stcall) > $max_firstcall) { $max_firstcall = trim($stcall); }
                        if (trim($avg_sale_time) > $max_avgsaletime) { $max_avgsaletime = trim($avg_sale_time); }
                        if (trim($avg_contact_time) > $max_avgcontacttime) { $max_avgcontacttime = trim($avg_contact_time); }

                        $ascii_text[$i]['info'][$o]['sales_per_hour'] = $sales_per_hour;
                        $ascii_text[$i]['info'][$o]['incomplete_array'] = $incomplete_array[$user]; 
                        $ascii_text[$i]['info'][$o]['group_inc_sales'] = $group_inc_sales+=$incomplete_array[$user];
                        $ascii_text[$i]['info'][$o]['cancel_array'] = $cancel_array[$user]; 
                        $ascii_text[$i]['info'][$o]['group_cnc_sales'] = $group_cnc_sales+=$cancel_array[$user];
                        $ascii_text[$i]['info'][$o]['callbacks'] = $callbacks;
                        $ascii_text[$i]['info'][$o]['group_callbacks'] =  $group_callbacks+=$callbacks;
                        $ascii_text[$i]['info'][$o]['stcall'] =  $stcall;  # first call resolution
                        $ascii_text[$i]['info'][$o]['average_sale_time'] =  $average_sale_time;
                        $ascii_text[$i]['info'][$o]['average_contact_time'] = $average_contact_time;

                        $graph_stats[$j]['user_nonpause_time'] = trim($user_nonpause_time);
                        $graph_stats[$j]['user_system_time'] = trim($user_system_time);
                        $graph_stats[$j]['sales_per_working_hours'] = trim($sales_per_working_hours);
                        $graph_stats[$j]['sales_per_hour'] = trim($sales_per_hour);
                        $graph_stats[$j]['average_sale_time'] = trim($average_sale_time);
                        $graph_stats[$j]['average_contact_time'] = trim($average_contact_time);
                        
                        $csv_status_text = [];
                        for ($q = 0; $q < count($call_status); $q++) {
                            $stat_rslt = VicidialAgentLog::statusInformtion($user_group[$i], $query_date, $end_date, $user, $call_status[$q], $group );
                            $ascii_text[$i]['info'][$o][$call_status[$q]] =  isset($stat_rslt) ? $stat_rslt :  0;
                            $csv_status_text['stats'] =$stat_rslt;
                            $call_status_group_totals[$q]+=$stat_rslt;
                            $graph_stats[$j][(17 + $q)] = $stat_rslt;

                            $max_varname = "max_".$call_status[$q];
                            if (isset($$max_varname) &&  $stat_rslt > $$max_varname) { $$max_varname = $stat_rslt; } else { $$max_varname = 0; }
                        }
                        $o++;
                    }
                    $max_graph_stats[$i][1] = $max_calls;
                    $max_graph_stats[$i][2] = $max_leads;
                    $max_graph_stats[$i][3] = $max_contacts;
                    $max_graph_stats[$i][4] = $max_contactratio;
                    $max_graph_stats[$i][5] = $max_systemtime;
                    $max_graph_stats[$i][6] = $max_talktime;
                    $max_graph_stats[$i][7] = $max_sales;
                    $max_graph_stats[$i][8] = $max_salesleadsratio;
                    $max_graph_stats[$i][9] = $max_salescontactsratio;
                    $max_graph_stats[$i][10] = $max_salesperhour;
                    $max_graph_stats[$i][11] = $max_incsales;
                    $max_graph_stats[$i][12] = $max_cancelledsales;
                    $max_graph_stats[$i][13] = $max_callbacks;
                    $max_graph_stats[$i][14] = $max_firstcall;
                    $max_graph_stats[$i][15] = $max_avgsaletime;
                    $max_graph_stats[$i][16] = $max_avgcontacttime;
                   
                    ##### GROUP TOTALS #############
                    if ($group_sales > 0) {
                        $group_average_sale_time = $this->secConvert(round($group_sales_talk_time / $group_sales), 'H');
                    } else {
                        $group_average_sale_time = "00:00:00";
                    }
                    if ($group_contacts > 0) {
                        $group_average_contact_time = $this->secConvert(round($group_contact_talk_time / $group_contacts), 'H');
                    } else {
                        $group_average_contact_time = "00:00:00";
                    }
                    $group_talk_hours = $group_talk_time / 3600;
                    $group_text[$i]['group_name'] =  "$group_name";
                    $group_text[$i]['user_group'] = "$user_group[$i]";

                    $total_graph_stats[$i][0] = "$user_group[$i] - $group_name";
                    $ascii_text[$i]['totals'] ="TOTALS:";
                    
                    $total_text['group_calls'] = $group_calls;
                    $total_text['group_leads'] = $group_leads;
                    $total_text['group_contacts'] = $group_contacts;
                    if ($group_leads > 0) {
                        $group_contact_ratio = (100 * $group_contacts / $group_leads);
                    } else {
                        $group_contact_ratio = "0.00";
                    }
                    $total_text['group_contact_ratio'] = $group_contact_ratio."%";
                    $total_text['group_nonpause_time'] = $this->secConvert($group_nonpause_time, 'H');
                    $total_text['group_talk_time'] = $this->secConvert($group_talk_time, 'H');
                    $total_text['group_system_time'] = $this->secConvert($group_system_time, 'H');
                    $total_text['group_sales'] = $group_sales;
                    if ($group_nonpause_time > 0) {
                        $sales_per_working_hours =  ($group_sales / ($group_nonpause_time / 3600));
                    } else {
                        $sales_per_working_hours = "0.00";
                    }
                    $total_text['sales_per_working_hours'] = $sales_per_working_hours;
                    if ($group_leads > 0) {
                        $group_sales_ratio =  (100 * $group_sales / $group_leads);
                    } else {
                        $group_sales_ratio = "0.00";
                    }
                    $total_text['group_sales_ratio'] =  $group_sales_ratio."%";
                    if ($group_contacts > 0) {
                        $group_sale_contact_ratio =  (100 * $group_sales / $group_contacts);
                    } else {
                        $group_sale_contact_ratio = 0;
                    }
                    $total_text['group_sale_contact_ratio'] =  $group_sale_contact_ratio."%";
                    if ($group_talk_hours > 0) {
                        $group_sales_per_hour =  ($group_sales / $group_talk_hours);
                    } else {
                        $group_sales_per_hour = "0.00";
                    }
                    if (($group_calls > 0) and ( $group_leads > 0)) {
                        $group_stcall = ($group_calls / $group_leads);
                    } else {
                        $group_stcall = "0.00";
                    }
                    $total_text['group_sales_per_hour'] =  $group_sales_per_hour;
                    $total_text['group_inc_sales'] =  $group_inc_sales;    
                    $total_text['group_cnc_sales'] =  $group_cnc_sales;
                    $total_text['group_callbacks'] =  $group_callbacks;
                    $total_text['group_stcall'] =  $group_stcall;  # first call resolution
                    $total_text['group_average_sale_time'] = $group_average_sale_time;
                    $total_text['group_average_contact_time'] = $group_average_contact_time;

//                    $csv_status_text = [];
                    for ($q = 0; $q < count($call_status_group_totals); $q++) {
                        $total_text['call_status_group_totals'][$call_status[$q]] =  $call_status_group_totals[$q];
                        $call_status_totals_grand_total[$q]+=$call_status_group_totals[$q];
                        $csv_status_text['call_status_group_totals'] =$call_status_group_totals[$q];
                        $total_var = $call_status[$q]."_total";
                        if (isset($call_status_group_totals[$q])) { $$total_var = $call_status_group_totals[$q]; } else { $call_status_group_totals[$q] = 0; }
                        $total_graph_stats[$i][(17 + $q)] = $call_status_group_totals[$q];
                        $max_varname = "max_total".$call_status[$q];
                        if (isset($$max_varname) && $call_status_group_totals[$q] > $$max_varname) { $$max_varname = $call_status_group_totals[$q]; }  else { $$max_varname = 0; }
                    }
                    
                    
                    if (trim($group_calls) > $max_totalcalls) { $max_totalcalls = trim($group_calls); }
                    if (trim($group_leads) > $max_totalleads) { $max_totalleads = trim($group_leads); }
                    if (trim($group_contacts) > $max_totalcontacts) { $max_totalcontacts = trim($group_contacts); }
                    if (trim($group_contact_ratio) > $max_totalcontactratio) { $max_totalcontactratio = trim($group_contact_ratio); }
                    if (trim($group_system_time) > $max_totalsystemtime) { $max_totalsystemtime = trim($group_system_time); }
                    if (trim($group_talk_time) > $max_totaltalktime) { $max_totaltalktime = trim($group_talk_time); }
                    if (trim($group_sales) > $max_totalsales) { $max_totalsales = trim($group_sales); }
                    if (trim($group_sales_ratio) > $max_totalsalesleadsratio) { $max_totalsalesleadsratio = trim($group_sales_ratio); }
                    if (trim($group_sale_contact_ratio) > $max_totalsalescontactsratio) { $max_totalsalescontactsratio = trim($group_sale_contact_ratio); }
                    if (trim($group_sales_per_hour) > $max_totalsalesperhour) { $max_totalsalesperhour = trim($group_sales_per_hour); }
                    if (trim($group_inc_sales) > $max_totalincsales) { $max_totalincsales = trim($group_inc_sales); }
                    if (trim($group_cnc_sales) > $max_totalcancelledsales) { $max_totalcancelledsales = trim($group_cnc_sales); }
                    if (trim($group_callbacks) > $max_totalcallbacks) { $max_totalcallbacks = trim($group_callbacks); }
                    if (trim($group_stcall) > $max_totalfirstcall) { $max_totalfirstcall = trim($group_stcall); }
                    
                    if (isset($group_avg_sale_time) &&  trim($group_avg_sale_time) > $max_totalavgsaletime) { $max_totalavgsaletime = trim($group_avg_sale_time); } else { $max_totalavgsaletime = 0;} 
                    if (isset($group_avg_contact_time) &&  trim($group_avg_contact_time) > $max_totalavgcontacttime) { $max_totalavgcontacttime = trim($group_avg_contact_time); } else { $max_totalavgcontacttime = 0;} 
                    
                    if (isset($group_avg_contact_time)  && trim($group_avg_contact_time) > $max_totalavgcontacttime) { $max_totalavgcontacttime = trim($group_avg_contact_time); } else { $max_totalavgcontacttime = 0;} 

                    $total_graph_stats[$i][1] = $group_calls;
                    $total_graph_stats[$i][2] = $group_leads;
                    $total_graph_stats[$i][3] = $group_contacts;
                    $total_graph_stats[$i][4] = $group_contact_ratio;
                    $total_graph_stats[$i][5] = $this->secConvert($group_system_time, 'H');
                    $total_graph_stats[$i][6] = $this->secConvert($group_talk_time, 'H');
                    $total_graph_stats[$i][7] = $group_sales;
                    $total_graph_stats[$i][8] = $group_sales_ratio;
                    $total_graph_stats[$i][9] = $group_sale_contact_ratio;
                    $total_graph_stats[$i][10] = $group_sales_per_hour;
                    $total_graph_stats[$i][11] = $group_inc_sales;
                    $total_graph_stats[$i][12] = $group_cnc_sales;
                    $total_graph_stats[$i][13] = $group_callbacks;
                    $total_graph_stats[$i][14] = $group_stcall;
                    $total_graph_stats[$i][15] = $group_avg_sale_time;
                    $total_graph_stats[$i][16] = $group_avg_contact_time;
                    
                    
                    $total_graph_stats[$i][17] = $this->secConvert($group_nonpause_time, 'H');
                    $ascii_text[$i]['total_text']= $total_text;
                    $group_text[$i]['total_text']= $total_text;
                    $total_calls+=$group_calls;
                    $total_leads+=$group_leads;
                    $total_contacts+=$group_contacts;
                    $total_system_time+=$group_system_time;
                    $total_nonpause_time+=$group_nonpause_time;
                    $total_talk_time+=$group_talk_time;
                    $total_sales+=$group_sales;
                    $total_inc_sales+=$group_inc_sales;
                    $total_cnc_sales+=$group_cnc_sales;
                    $total_callbacks+=$group_callbacks;
                    $total_stcall+=$group_stcall;  # first call resolution
                    $total_sales_talk_time+=$group_sales_talk_time;
                    $total_contact_talk_time+=$group_contact_talk_time;
                    $o++;
                } else {
                    $graph_stats = array();
                    $ascii_text[$i]['no_agent'] ="**** NO AGENTS FOUND UNDER THESE REPORT PARAMETERS ****";
                    $total_graph_stats[$i] = [];
                }
                
                $signle_array = array('team' => $team, 'teamid' => $teamid, 'graph' => $graph_stats, 'total' => $total_graph_stats[$i]);
                array_push($mainarray, $signle_array);
            }
            
            
            $total_ascii['group_text'] = isset($group_text) ? $group_text  :  []; 
            if ($total_sales > 0) {
                $total_average_sale_time = $this->secConvert(round($total_sales_talk_time / $total_sales), 'H');
            } else {
                $total_average_sale_time = "00:00:00";
            }
            if ($total_contacts > 0) {
                $total_average_contact_time = $this->secConvert(round($total_contact_talk_time / $total_contacts), 'H');
            } else {
                $total_average_contact_time = "00:00:00";
            }
            $total_talk_hours = $total_talk_time / 3600;
            $total_ascii['total_calls']=$total_calls;
            $total_ascii['total_leads']=$total_leads;
            $total_ascii['total_contacts']=$total_contacts;
            if ($total_leads > 0) {
                $total_contact_ratio =(100 * $total_contacts / $total_leads);
            } else {
                $total_contact_ratio = "0.00";
            }
            $total_ascii['total_contact_ratio']=$total_contact_ratio."%";
            $total_ascii['total_nonpause_time']=$this->secConvert($total_nonpause_time, 'H');
            $total_ascii['total_system_time']=$this->secConvert($total_system_time, 'H');
            $total_ascii['total_talk_time']=$this->secConvert($total_talk_time, 'H');
            $total_ascii['total_sales']=$total_sales;
            if ($total_nonpause_time > 0) {
                $sales_per_working_hours = ($total_sales / ($total_nonpause_time / 3600));
            } else {
                $sales_per_working_hours = "0.00";
            }
            $total_ascii['sales_per_working_hours']=$sales_per_working_hours;
            if ($total_leads > 0) {
                $total_sales_ratio = (100 * $total_sales / $total_leads);
            } else {
                $total_sales_ratio = "0.00";
            }
            $total_ascii['total_sales_ratio']=$total_sales_ratio."%";
            if ($total_contacts > 0) {
                $total_sale_contact_ratio = (100 * $total_sales / $total_contacts);
            } else {
                $total_sale_contact_ratio = 0;
            }
            $total_ascii['total_sale_contact_ratio']=$total_sale_contact_ratio."%";
            
            if ($total_talk_hours > 0) {
                $total_sales_per_hour = ($total_sales / $total_talk_hours);
            } else {
                $total_sales_per_hour = "0.00";
            }
            if (($total_calls > 0) and ( $total_leads > 0)) {
                $total_stcall = ($total_calls / $total_leads);
            } else {
                $total_stcall = "0.00";
            }
            $total_ascii['total_sales_per_hour']=$total_sales_per_hour;
            $total_ascii['total_inc_sales']=$total_inc_sales;
            $total_ascii['total_cnc_sales']=$total_cnc_sales;
            $total_ascii['total_callbacks']=$total_callbacks;
            $total_ascii['total_stcall']=$total_stcall; # first call resolution
            $total_ascii['total_average_sale_time']=$total_average_sale_time;
            $total_ascii['total_average_contact_time']=$total_average_contact_time;

            $total[1] = $total_calls;
            $total[2] = $total_leads;
            $total[3] = $total_contacts;
            $total[4] = $total_contact_ratio;
            //$total[4]=$this->secConvert($total_nonpause_time,'H');
            $total[5] = $this->secConvert($total_system_time, 'H');
            $total[6] = $this->secConvert($total_talk_time, 'H');
            $total[7] = $total_sales;
            $total[8] = $total_sales_ratio;
            $total[9] = $total_sale_contact_ratio;
            $total[10] = $total_sales_per_hour;
            $total[11] = $total_inc_sales;
            $total[12] = $total_cnc_sales;
            $total[13] = $total_callbacks;
            $total[14] = $total_stcall;
            $total[15] = $total_average_sale_time;
            $total[16] = $total_average_contact_time;

            
            if (trim($group_calls) > $max_totalcalls) { $max_totalcalls = trim($group_calls); }
            if (trim($group_leads) > $max_totalleads) { $max_totalleads = trim($group_leads); }
            if (trim($group_contacts) > $max_totalcontacts) { $max_totalcontacts = trim($group_contacts); }
            if (trim($group_contact_ratio) > $max_totalcontactratio) { $max_totalcontactratio = isset($group_contact_ratio) ? trim($group_contact_ratio) : 0 ; }
            if (trim($group_system_time) > $max_totalsystemtime) { $max_totalsystemtime = trim($group_system_time); }
            if (trim($group_talk_time) > $max_totaltalktime) { $max_totaltalktime = trim($group_talk_time); }
            if (trim($group_sales) > $max_totalsales) { $max_totalsales = trim($group_sales); }
            if (trim($group_sales_ratio) > $max_totalsalesleadsratio) { $max_totalsalesleadsratio = trim($group_sales_ratio); }
            if (trim($group_sale_contact_ratio) > $max_totalsalescontactsratio) { $max_totalsalescontactsratio = trim($group_sale_contact_ratio); }
            if (trim($group_sales_per_hour) > $max_totalsalesperhour) { $max_totalsalesperhour = trim($group_sales_per_hour); }
            if (trim($group_inc_sales) > $max_totalincsales) { $max_totalincsales = trim($group_inc_sales); }
            if (trim($group_cnc_sales) > $max_totalcancelledsales) { $max_totalcancelledsales = trim($group_cnc_sales); }
            if (trim($group_callbacks) > $max_totalcallbacks) { $max_totalcallbacks = trim($group_callbacks); }
            if (trim($group_stcall) > $max_totalfirstcall) { $max_totalfirstcall = trim($group_stcall); }
            if (trim($group_avg_sale_time) > $max_totalavgsaletime) { $max_totalavgsaletime = trim($group_avg_sale_time); }
            if (trim($group_avg_contact_time) > $max_totalavgcontacttime) { $max_totalavgcontacttime = trim($group_avg_contact_time); }


            $max_total['call'] = $max_totalcalls;
            $max_total['leads'] = $max_totalleads;
            $max_total['contact'] = $max_totalcontacts;
            $max_total['contact_ratio'] = $max_totalcontactratio;
            //$total[4]=$this->secConvert($total_nonpause_time,'H');
            $max_total['systime'] = $max_totalsystemtime;
            $max_total['talktime'] = $max_totaltalktime;
            $max_total['sales'] = $max_totalsales;
            $max_total['salesration'] = $max_totalsalesleadsratio;
            $max_total['sales_contact'] = $max_totalsalescontactsratio;
            $max_total['salesperhour'] = $max_totalsalesperhour;
            $max_total['inc_sales'] = $max_totalincsales;
            $max_total['cancelledsales'] = $max_totalcancelledsales;
            $max_total['callbacks'] = $max_totalcallbacks;
            $max_total['firstcall'] = $max_totalfirstcall;
            $max_total['avg_sales_time'] = $max_totalavgsaletime;
            $max_total['avg_contact_time'] = $max_totalavgcontacttime;

            $csv_status_text = [];
            for ($q = 0; $q < count($call_status_totals_grand_total); $q++) {
                $total_ascii['call_status_totals_grand_total'][$q]=$call_status_totals_grand_total[$q];
                $csv_status_text['call_status_totals_grand_total'][$q] = $call_status_totals_grand_total[$q];
            }
            
            $heading = array("Agent Name","Agent ID","Calls","Leads","Contacts","Contact Ratio","Nonpause Time","System Time","Talk Time","Sales","Sales per Working Hour",
                    "Sales to Leads Ratio","Sales to Contacts Ratio","Sales Per Hour","Incomplete Sales","Cancelled Sales","Callbacks","First Call Resolution","Average Sale Time",
                    "Average Contact Time");
            $heading = array_merge($heading,$call_status);
            if ($display_type == "html") { $data = array('agent_array' => $mainarray, 'total_array' => $total_graph_stats, 'max_value' => $max_graph_stats, 'total' => $total, 'max_total' => $max_total);}
            else { $data = array("ascii_text"=>$ascii_text, "total_ascii"=>$total_ascii,'heading'=>$heading , "call_status"=> $request->input('call_status'));} 
            if(isset($file_download) && $file_download == 1){
                return $data;
            }
                $data = [
                    'status'=>200,
                    'msg' => "Successfull",
                    'data'=> $data
                ];
                return response()->json($data);  
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }
    
    /**
     * Convert time to sec .
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param type $sec
     * @param type $precision
     * @return string
     * @throws Exception
     */
//    public function secConvert($sec, $precision) {
//        try{
//            $sec = round($sec, 0);
//
//            if ($sec < 1) {
//                if ($precision == 'HF') {
//                    return "00:00:00";
//                } else {
//                    return "00:00:00";
//                }
//            } else {
//                if ($precision == 'HF') {
//                    $precision = 'H';
//                } else {
//                    if (($sec < 3600) and ( $precision != 'S')) {
//                        $precision = 'H';
//                    }
//                }
//
//                if ($precision == 'H') {
//                    $fhours_h = ($sec / 3600);
//                    $fhours_h_int = floor($fhours_h);
//                    $fhours_h_int = intval("$fhours_h_int");
//                    $fhours_h_int = ($fhours_h_int < 10) ? "0$fhours_h_int" : $fhours_h_int;
//                    $fhours_m = ($fhours_h - $fhours_h_int);
//                    $fhours_m = ($fhours_m * 60);
//                    $fhours_m_int = floor($fhours_m);
//                    $fhours_m_int = intval("$fhours_m_int");
//                    $Fhours_S = ($fhours_m - $fhours_m_int);
//                    $Fhours_S = ($Fhours_S * 60);
//                    $Fhours_S = round($Fhours_S, 0);
//                    if ($Fhours_S < 10) {
//                        $Fhours_S = "0$Fhours_S";
//                    }
//                    if ($fhours_m_int < 10) {
//                        $fhours_m_int = "0$fhours_m_int";
//                    }
//
//                    $ftime = "$fhours_h_int:$fhours_m_int:$Fhours_S";
//                }
//                if ($precision == 'M') {
//                    $fminutes_m = ($sec / 60);
//                    $fminutes_m_int = floor($fminutes_m);
//                    $fminutes_m_int = intval("$fminutes_m_int");
//                    $fminutes_s = ($fminutes_m - $fminutes_m_int);
//                    $fminutes_s = ($fminutes_s * 60);
//                    $fminutes_s = round($fminutes_s, 0);
//                    if ($fminutes_s < 10) {
//                        $fminutes_s = "0$fminutes_s";
//                    }
//                    $ftime = "$fminutes_m_int:$fminutes_s";
//                }
//                if ($precision == 'S') {
//                    $ftime = $sec;
//                }
//                return "$ftime";
//            }
//        } catch (Exception $e) {
//            $this->postLogs(config('errorcontants.agent'), $e);
//            throw $e;
//        }
//    }
    
    /**
     * Download CSV file for team performance report.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param Request $request
     * @throws Exception
     */
    public function downloadCsvTeamPerReport(Request $request){
        try{
            $data = $this->teamPerformanceDetails($request) ;
            $ascii_text = $data['ascii_text'];
            $total_ascii = $data['total_ascii'];
            $call_status = $request->input('call_status');
            foreach ($ascii_text as $key => $value ){
                $title[] = '-- TEAM: '.$value['user_group'] ."-". $value['group_name']  ;
                
                if(isset($value['no_agent'])){
                    $heading = array('');
                    $agents[] = array($value['no_agent']);
                    $agents_total[] = array('');
                } else {
                    $heading = array("Agent Name","Agent ID","Calls","Leads","Contacts","Contact Ratio","Nonpause Time","System Time","Talk Time","Sales","Sales per Working Hour",
                    "Sales to Leads Ratio","Sales to Contacts Ratio","Sales Per Hour","Incomplete Sales","Cancelled Sales","Callbacks","First Call Resolution","Average Sale Time",
                    "Average Contact Time");
                    $heading = array_merge($heading,$call_status);
                    foreach ($value['info'] as $k => $v ){
                        if(is_numeric($k)){
                            foreach($call_status as $kl => $vl) {
                                $call_status_info[] = $v[$vl];
                            }
                            $agent_s = array(
                                $v["full_name"],
                                $v["user"],
                                $v["calls"],
                                $v["leads"],
                                $v["contacts"],
                                $v["contact_ratio"],
                                $v["user_nonpause_time"],
                                $v["user_system_time"],
                                $v["user_talk_time"],
                                $v["sale_array"],
                                $v["sales_per_working_hours"],
                                $v["sales_ratio"],
                                $v["sale_contact_ratio"],
                                $v["sales_per_hour"],
                                $v["incomplete_array"],
                                $v["cancel_array"],
                                $v["callbacks"],
                                $v["stcall"],
                                $v["average_sale_time"],
                                $v["average_contact_time"],
                            );
                            $agent = array_merge($agent_s,$call_status_info);
                            $agents[] = $agent;
                            $call_status_info = $agent_s = [];
                        }
                    }
                    foreach ($value as $k => $v ){
                        if(!is_numeric($k) && $k == "total_text"){
                            $agents_total[] = array(
                                "",
                                "TOTALS",
                                $v["group_calls"],
                                $v["group_leads"],
                                $v["group_contacts"],
                                $v["group_contact_ratio"],
                                $v["group_nonpause_time"],
                                $v["group_system_time"],
                                $v["group_talk_time"],
                                $v["group_sales"],
                                $v["sales_per_working_hours"],
                                $v["group_sales_ratio"],
                                $v["group_sale_contact_ratio"],
                                $v["group_sales_per_hour"],
                                $v["group_inc_sales"],
                                $v["group_cnc_sales"],
                                $v["group_callbacks"],
                                $v["group_stcall"],
                                $v["group_average_sale_time"],
                                $v["group_average_contact_time"],
                                $v["call_status_group_totals"]
                            );
                        }
                    }
                }
                    $final_array[] = array('title'=>$title,
                        "column"=>$heading,
                        "agent"=>$agents,
                        "total"=>$agents_total
                    );
                    $heading = $agents = $agents_total = $title = $call_status_info = $agent_s =$agent =[];   
                }
                
                $i = 0;

                $total_time = $total_ascii['group_text'] ;
                foreach ($total_time as $k => $v ){
                    $total_text = $v['total_text'] ;
                    $agents[$i] = array(
                        $v["group_name"],
                        "",
                        $total_text["group_calls"],
                        $total_text["group_leads"],
                        $total_text["group_contacts"],
                        $total_text["group_contact_ratio"],
                        $total_text["group_nonpause_time"],
                        $total_text["group_system_time"],
                        $total_text["group_talk_time"],
                        $total_text["group_sales"],
                        $total_text["sales_per_working_hours"],
                        $total_text["group_sales_ratio"],
                        $total_text["group_sale_contact_ratio"],
                        $total_text["group_sales_per_hour"],
                        $total_text["group_inc_sales"],
                        $total_text["group_cnc_sales"],
                        $total_text["group_callbacks"],
                        $total_text["group_stcall"],
                        $total_text["group_average_sale_time"],
                        $total_text["group_average_contact_time"]
                    );
                    $i++;
                }
                
                
                $agents[$i] = array(
                    "",
                    "Total",
                    $total_ascii["total_calls"],
                    $total_ascii["total_leads"],
                    $total_ascii["total_contacts"],
                    $total_ascii["total_contact_ratio"],
                    $total_ascii["total_nonpause_time"],
                    $total_ascii["total_system_time"],
                    $total_ascii["total_talk_time"],
                    $total_ascii["total_sales"],
                    $total_ascii["sales_per_working_hours"],
                    $total_ascii["total_sales_ratio"],
                    $total_ascii["total_sale_contact_ratio"],
                    $total_ascii["total_sales_per_hour"],
                    $total_ascii["total_inc_sales"],
                    $total_ascii["total_cnc_sales"],
                    $total_ascii["total_callbacks"],
                    $total_ascii["total_stcall"],
                    $total_ascii["total_average_sale_time"],
                    $total_ascii["total_average_contact_time"]
                );
                
            $startdate = $request->input('startdate');
            $filename = "dncn_number.csv";
            $handle = fopen($filename, 'w+');
            foreach ($final_array as $key => $rows) {
                fputcsv($handle, $rows['title'], ";", '"');
                fputcsv($handle, $rows['column'], ";", '"');
                foreach ($rows['agent'] as $ky => $rs) {
                    fputcsv($handle, $rs, ";", '"');
                }
                foreach ($rows['total'] as $ky => $rs) {
                    fputcsv($handle, $rs, ";", '"');
                }
            }
            
            #for CALL CENTER TOTAL CSV .
            $title = ['-- CALL CENTER TOTAL'];
            fputcsv($handle, $title, ";", '"');
            $heading[] = array("Team Name","Team ID","Calls","Leads","Contacts","Contact Ratio","Nonpause Time","System Time","Talk Time","Sales","Sales per Working Hour",
            "Sales to Leads Ratio","Sales to Contacts Ratio","Sales Per Hour","Incomplete Sales","Cancelled Sales","Callbacks","First Call Resolution","Average Sale Time",
            "Average Contact Time");
            foreach ($heading as $key => $rows) {
                fputcsv($handle, $rows, ";", '"');
            }
            foreach ($agents as $key => $rows) {
                fputcsv($handle, $rows, ";", '"');
            }
            fclose($handle);

            $headers = array(
                'Content-Type' => 'text/csv',
            );
            return Response::download($filename, $filename, $headers)->deleteFileAfterSend(true);
            
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }
    
    
    /**
     * Single Agent Daily Report.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param Request $request.
     * @return type.
     * @throws Exception.
     */
    public function singleAgentDaily(Request $request) {
        try {
            $user = $request->user();
            if (!in_array(SYSTEM_COMPONENT_REPORT_SINGLE_AGENT, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $user ))) {
                throw new ForbiddenException();
            }
            $shift = $request->input('shift');  
            (isset($shift)) ? $shift = $shift : $shift = "ALL";
            $startdate = $request->input('startdate');
            $enddate = $request->input('enddate');
            $user = $request->input('user');
            $group = $request->input('group');
            $file_download = $request->input('file_download');
            
                $time_array = $this->setTimeBegin($shift, $startdate, $enddate);
            
            for ($i = 0; $i < count($group); $i++) {
                if ($group[$i] == "-ALL-") {
                    $group = $this->getAllCampaigns();
                    break;
                }
            }
            
            $customer_interactive_statuses = '';
            $list = VicidialStatuses::select('status')->where('human_answered','Y')->get();
            if(isset($list)){
//                $list = $list->toArray();
                $i = 0;
                $statha_to_print = $list->count();
                while ($i < $statha_to_print) {
                    $customer_status = $list[$i]->status;
                    $customer_interactive_statuses .= "|$customer_status";
                    $i++;
                }
            }
            
            $list = VicidialCampaignStatuses::select('status')->where('human_answered','Y')->get();
            if(isset($list)){
                $i = 0;
                $statha_to_print = $list->count();
                while ($i < $statha_to_print) {
                    $customer_status = $list[$i]->status;
                    $customer_interactive_statuses .= "|$customer_status";
                    $i++;
                }
            }
            
            $statuses = '-';
            $statuses_ary[0] = '';
            $j = 0;
            $dates = '-';
            $dates_array[0] = '';
            $k = 0;
            $tot_calls = 0;
            $list = VicidialAgentLog::singleAgent($time_array['query_date_end'],$time_array['query_date_begin'],$user, $group);
            if(isset($list)){
                $rows_to_print = $list->count();
                $i = 0;
                while ($i < $rows_to_print) {
                    if (($list[$i]['calls'] > 0) and (strlen($list[$i]['status']) > 0)) {
                        $date[$i] = $list[$i]->date;
                        $calls[$i] = $list[$i]->calls;
                        $status[$i] = $list[$i]->status;

                        if ((!preg_match("/\-$status[$i]\-/i", $statuses)) and (strlen($status[$i]) > 0)) {
                            $statuses .= "$status[$i]-";

                            $statuses_ary[$j] = $status[$i];
                            $j++;
                        }
                        if (!preg_match("/\-$date[$i]\-/i", $dates)) {
                            $dates .= "$date[$i]-";
                            $dates_array[$k] = $date[$i];
                            $k++;
                        }
                    }
                    $i++;
                }
            }
            
            
            $m = 0;
            $cis_count_tot = 0;
            $dnc_count_tot = 0;

            $graph_stats = array();
            $max_calls = 1;
            $max_cicalls = 1;
            $max_dncci = 1;
            while ($m < $k) {
                $s_date = $dates_array[$m];
                $calls[$m] = isset($calls[$m])?$calls[$m]:0;
                $s_calls = $calls[$m];
                $cis_count = 0;
                $dnc_count = 0;
                $n = 0;
                while ($n < $j) {
                    $s_status = $statuses_ary[$n];
                    $varname = $s_status . "_graph";

                    $max_varname = "max_" . $s_status;
                    if(!isset($$max_varname)) { $$max_varname = 0;}
                    $graph_stats[$m][(4 + $n)] = 0;
                    $i = 0;
                    $status_found = 0;
                    while ($i < $rows_to_print) {
                        $status =  isset($status[$i]) ? $status[$i] : '';
                        $date =  isset($date[$i]) ? $date[$i] : '';
                        if (($s_date == "$date") and ($s_status == $status)) {
                            $s_calls = ($s_calls + $calls[$i]);
                            if (preg_match("/\|$status\|/i", $customer_interactive_statuses)) {
                                $cis_count = ($cis_count + $calls[$i]);
                                $cis_count_tot = ($cis_count_tot + $calls[$i]);
                            }
                            if (preg_match("/DNC/i", $status)) {
                                $dnc_count = ($dnc_count + $calls[$i]);
                                $dnc_count_tot = ($dnc_count_tot + $calls[$i]);
                            }

                            if ($calls[$i] > $$max_varname) {
                                $$max_varname = $calls[$i];
                            }
                            $graph_stats[$m][(4 + $n)] = $calls[$i];

                            $status_found++;
                        }
                        $i++;
                    }
                    
                    $n++;
                }

                $s_user = '';
                $tot_calls = ($tot_calls + $s_calls);
                $raw_date = $s_date;
                $raw_alls = $s_calls;
                $raw_cis = $cis_count;
                $s_calls = sprintf("%6s", $s_calls);
                $cis_count = sprintf("%6s", $cis_count);
                $s_date = sprintf("%-10s", $s_date);
                while (strlen($s_user) > 10) {
                    $s_user = substr("$s_date", 0, -1);
                }
                if (($dnc_count < 1) or ($cis_count < 1)) {
                    $dnc_count_pct_s = 0;
                } else {
                    $dnc_count_pct_s = (($dnc_count / $cis_count) * 100);
                }
                $raw_dnc_pct = $dnc_count_pct_s;
                $dnc_count_pct_s = round($dnc_count_pct_s);
                $raw_dnc_count_pct_s = $dnc_count_pct_s;
                $dnc_count_pct_s = sprintf("%6s", $dnc_count_pct_s);
                if (trim($s_calls) > $max_calls) {
                    $max_calls = trim($s_calls);
                }
                if (trim($cis_count) > $max_cicalls) {
                    $max_cicalls = trim($cis_count);
                }
                if (trim($dnc_count_pct_s) > $max_dncci) {
                    $max_dncci = trim($dnc_count_pct_s);
                }

                $graph_stats[$m][1] = trim("$s_calls");
                $graph_stats[$m][2] = trim("$cis_count");
                $graph_stats[$m][3] = trim("$dnc_count_pct_s");
                $graph_stats[$m][0] = trim("$s_date");

                $m++;
            }
            
            $sum_uses_html = '';
            $n = 0;
            while ($n < $j) {
                $s_calls = 0;
                $s_status = $statuses_ary[$n];
                $sum_status_txt = '';
                $total_var = $s_status . "_total";
                $i = 0;
                $status_found = 0;
                while ($i < $rows_to_print) {
                    $status =  isset($status[$i]) ? $status[$i] : '';
                    if ($s_status == "$status") {
                        $s_calls = ($s_calls + $calls[$i]);
                        $status_found++;
                    }
                    $i++;
                }
                if ($status_found < 1) {
                    $sum_uses_html .= "        0 |";
                    $$total_var = 0;
                } else {
                    $sum_status_txt = sprintf("%8s", $s_calls);
                    $sum_uses_html .= " $sum_status_txt |";
                    $sum_statuses_file .= "$sum_status_txt,";
                    $$total_var = $s_calls;
                }
                $n++;
            }
            $string = trim($sum_uses_html, "|");
            $tot_status = explode('|', $string);
            $tot_calls = isset($tot_calls) ? $tot_calls : 0;
            $cis_count_tot = isset($cis_count_tot) ? $cis_count_tot : 0;
            if (($dnc_count_tot < 1) or ($cis_count_tot < 1)) {
                $dnc_count_pct = 0;
            } else {
                $dnc_count_pct = (($dnc_count_tot / $cis_count_tot) * 100);
            }
            $dnc_count_pct = round($dnc_count_pct);
            $dnc_count_pct = $dnc_count_pct;

            $graph_stat_display = array();
            $graph_stat_html = array();
            $avg_value = array();
            $date_array = array();
            $secondbar = array();
            $maxni = 0;
            $max_calls = 0;
            $max_ci_calls = 0;
            $sum_calls = 0;
            $sumci_calls = 0;
            $sumdncci = 0;
            $maxdncci = 0;
            $avg_display = [];
            if(!empty($graph_stats)){
                for ($d = 0; $d < count($graph_stats); $d++) {
                    if($max_calls != 0 ) { $tot_v = round(100 * $graph_stats[$d][1] / $max_calls); } else {  $tot_v = 0 ;}
                    $graph_stat_html[$d][0] = $tot_v;
                    $graph_stat_display[$d][0] = $graph_stats[$d][1];
                    if ($max_calls < $graph_stats[$d][1]) {
                        $max_calls = $graph_stats[$d][1];
                    }
                    $sum_calls = $sum_calls + $graph_stat_display[$d][0];
                    
                    if($max_cicalls != 0 ) { $tot_v1 = round(100 * $graph_stats[$d][2] / $max_cicalls); } else {  $tot_v1 = 0 ;}
                    $graph_stat_html[$d][1] = $tot_v1;
                    $graph_stat_display[$d][1] = $graph_stats[$d][2];
                    $sumci_calls = $sumci_calls + $graph_stat_display[$d][1];

                    if ($max_ci_calls < $graph_stats[$d][2]) {
                        $max_ci_calls = $graph_stats[$d][2];
                    }
                    
                    if($max_dncci != 0 ) { $tot_v2 = round(100 * $graph_stats[$d][3] / $max_dncci);} else {  $tot_v2 = 0 ;}
                    $graph_stat_html[$d][2] = $tot_v2;
                    $graph_stat_display[$d][2] = $graph_stats[$d][3] ;
                    $sumdncci = $sumdncci + $graph_stat_display[$d][2];
                    if ($maxdncci < $graph_stats[$d][3]) {
                        $maxdncci = $graph_stats[$d][3];
                    }
                    $date_array[$d] = $graph_stats[$d][0];
                    
                    for ($e = 0; $e < count($statuses_ary); $e++) {
                        $max_varname = "max_" . $s_status;
                        if($$max_varname != 0 ) { $tot_v3 = round(100 * $graph_stats[$d][($e + 4)] / $$max_varname); } else {  $tot_v3 = 0 ;}
                        $avg_value[$d][$e] = $tot_v3;
                        $avg_display[$d][$e] = $graph_stats[$d][($e + 4)];
                        if(!isset($secondbar[$e])) { $secondbar[$e] = 0; }
                        if ($secondbar[$e] < $graph_stats[$d][($e + 4)]) {
                            $secondbar[$e] = $graph_stats[$d][($e + 4)];
                        }
                    }
                }
            }
            $totalresult = array(
                $sum_calls,
                $sumci_calls,
                $sumdncci
            );
            $maxvalue = array(
                "call" => $max_calls,
                "cicalls" => $max_ci_calls,
                "dncci" => $maxdncci
            );
            $header_array = array(
                'CALL',
                'CICallS',
                ' DNC/CI'
            );
            $totall_array = array(
                $tot_calls,
                $cis_count_tot,
                $dnc_count_pct . "%"
            );
            
            //$tot_status=intval($tot_status);
            
            $data = array(
                'request_data' => $request->input(),
                'time_array' => $time_array,
                'sub_statuses_ary' => $statuses_ary,
                'total_sum_status_array' => $tot_status,
                'graph_stats' => $graph_stats,
                'avg_display' => $avg_display,
                'header_array' => $header_array,
                'totall_array' => $totall_array,
                'date_array' => $date_array,
                'tot_status' => $tot_status,
                'graph_stat_display' => $graph_stat_display,
                'graph_stat_html' => $graph_stat_html,
                'avg_value' => $avg_value,
                'maxvalue' => $maxvalue,
                "totalresult" => $totalresult,
                "secondbar" => $secondbar
            );
            
            if(isset($file_download) && $file_download == 1){
                return $data;
            } else {
                $data = [
                    'status'=>200,
                    'msg' => "Successfull",
                    'data'=> $data
                ];
                return response()->json($data);  
            }
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }
    
    /**
     * List of all campaigns id .
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @return type
     * @throws Exception
     */
    public function getAllCampaigns() {
        try{
            $user_group = array();
            $list = VicidialCampaign::select('campaign_id')->orderBy('campaign_id')->get();
            if(isset($list)){
                $list_count = $list->count();
                $count = 0;
                while ($count < $list_count) {
                    $group[$count] = $list[$count]->campaign_id;
                    $count++;
                }
            }
            return $group;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    public function performanceComparisonReport(Request $request) {
        try{

            $user_group = [];
            $user = $request->user();
            
            # user_group access control for permission need to check
            # user access control for permission need to check
            # group access control for permission need to check

            $request_data = [];
            $user_group = $user = $group = $users = $user_list = [];
            
            if(isset($request['user_group']) && is_array($request['user_group'])){
                $user_group = $request['user_group'];
                array_push($request_data, $request['user_group']);
            }

            if(isset($request['user']) && is_array($request['user'])){
                $user = $request['user'];
                array_push($request_data, $request['user']);
            }

            if(isset($request['group']) && is_array($request['group'])){
                $group = $request['group'];
                array_push($request_data, $request['group']);
            }

            $shift = $request['shift'];
            if (strlen($shift) < 2) {
                $shift = 'ALL';
            }

            $shift = $request['shift'];
            $display_type = $request['display_type'];
            $query_date = $request['query_date'];
            $completeDate = $request['completeDate'];

            array_push($request_data, $request['shift']);
            array_push($request_data, $request['display_type']);
            array_push($request_data, $request['query_date']);
            array_push($request_data, $request['completeDate']);

            $mt[0] = '';
            $now_date = date("Y-m-d");
            $now_time = date("Y-m-d H:i:s");

            $start_time = date("U");

            if (!isset($user_group)) {
                $group = '';
            }
            if (!isset($query_date)) {
                $query_date = $now_date;
            }
            if (!isset($end_date)) {
                $end_date = $now_date;
            }

            $today = $query_date;
            $date_ary = explode("-", $today);
            $yesterday = date("Y-m-d", mktime(0, 0, 0, $date_ary[1], $date_ary[2] - 1, $date_ary[0]));
            $twodaysago = date("Y-m-d", mktime(0, 0, 0, $date_ary[1], $date_ary[2] - 2, $date_ary[0]));
            $threedaysago = date("Y-m-d", mktime(0, 0, 0, $date_ary[1], $date_ary[2] - 3, $date_ary[0]));
            $fivedaysago = date("Y-m-d", mktime(0, 0, 0, $date_ary[1], $date_ary[2] - 5, $date_ary[0]));
            $tendaysago = date("Y-m-d", mktime(0, 0, 0, $date_ary[1], $date_ary[2] - 10, $date_ary[0]));
            $thirtydaysago = date("Y-m-d", mktime(0, 0, 0, $date_ary[1], $date_ary[2] - 30, $date_ary[0]));

            $rpt_date_array = array();
            $rpt_subtitle_array = array();
            $class_array = array();
            array_push($rpt_date_array,$today,$yesterday, $twodaysago, $threedaysago, $fivedaysago, $tendaysago, $thirtydaysago);
            
            array_push($rpt_subtitle_array, "TODAY", "YESTERDAY", "2 DAYS AGO", "3 DAYS AGO", "5 DAYS AGO", "10 DAYS AGO", "30 DAYS AGO");
            
            array_push($class_array, "today", "yesterday", "twodayago", "threedayago", "fivedayago", "tendayago", "thirtydayago");

            $i = 0;
            $group_string = '|';
            $group_ct = count($group);
            while ($i < $group_ct) {
                $group_string .= $group[$i]."|";
                $i++;
            }

            $i = 0;
            $users_string = '|';
            $users_ct = count($users);
            while ($i < $users_ct) {
                $users_string .= $users[$i]."|";
                $i++;
            }

            $row = VicidialCampaign::orderBy('campaign_id','asc')->get(['campaign_id']);

            $campaigns_to_print = count($row);

            $i = 0;
            while ($i < $campaigns_to_print) {

                $groups[$i] = $row[$i]['campaign_id'];
                if (preg_match('/\-ALL/', $group_string)) {
                    $group[$i] = $groups[$i];
                }
                $i++;
            }

            for ($i = 0; $i < count($user_group); $i++) {
                if (preg_match('/\-\-ALL\-\-/', $user_group[$i])) {
                    $all_user_groups = 1;
                    $user_group = "";
                }
            }

            $row = VicidialUserGroup::orderBy('user_group','asc')->get(['user_group']);

            $user_groups_to_print = count($row);

            if (in_array('-ALL-', $user_group)) {

                $i = 0;
                while ($i < $user_groups_to_print) {
                    $user_group[$i] = $row[$i]['user_group'];
                    $i++;
                }
            }

            $row = VicidialUsers::orderBy('user','asc')->get(['user','full_name']);
            
            $users_to_print = count($row);

            $user_names = $all_users = [];
            $i = 0;
            while ($i < $users_to_print) {
                $user_list[$i] = $row[$i]['user'];
                $user_names[$i] = $row[$i]['full_name'];
                if ($all_users) {
                    $user_list[$i] = $row[$i]['user'];
                }
                $i++;
            }

            $i = 0;
            $group_sql = [];
            $group_string = '|';
            $group_qs = '';
            $group_sql_str = [];
            $group_ct = count($group);
            while ($i < $group_ct) {
                $group_string .= $group[$i]."|";
                array_push($group_sql, $group[$i]);
                $group_qs .= "&group[]=".$group[$i];

                $i++;
            }

            if ((preg_match('/\-\-ALL\-\-/', $group_string)) or ($group_ct < 1)) {
               
            } else {
                $group_sql_str = $group_sql;
            }

            $i = 0;
            $user_group_sql = [];
            $user_group_sql_str = [];
            $user_group_string = '|';
            $user_group_qs = '';
            $user_group_ct = count($user_group);
            while ($i < $user_group_ct) {
                $user_group_string .= $user_group[$i]."|";
                array_push($user_group_sql, $user_group[$i]);
                $user_group_qs .= "&user_group[]=".$user_group[$i];
                $i++;
            }

            if ((preg_match('/\-\-ALL\-\-/', $user_group_string)) or ($user_group_ct < 1)) {
                
            } else {
                $user_group_sql_str = $user_group_sql;
            }

            $i = 0;
            $user_sql = [];
            $user_sql_str = [];
            $user_string = '|';
            $user_qs = '';
            $user_ct = count($users);
            while ($i < $user_ct) {
                $user_string .= $users[$i]."|";
                array_push($user_sql, $users[$i]);
                $user_qs .= "&users[]=".$users[$i];
                $i++;
            }

            if ((preg_match('/\-\-ALL\-\-/', $user_string)) or ($user_ct < 1)) {
                
            } else {
                $user_sql_str = $user_sql;
            }

            $time_begin = '';
            $time_end = '';
            $am_shift_begin = '';
            $am_shift_end = '';
            $pm_shift_begin = '';
            $pm_shift_end = '';

            if ($shift == 'AM') {
                $time_begin = $am_shift_begin;
                $time_end = $am_shift_end;
                if (strlen($time_begin) < 6) {
                    $time_begin = "03:45:00";
                }
                if (strlen($time_end) < 6) {
                    $time_end = "15:14:59";
                }
            }
            if ($shift == 'PM') {
                $time_begin = $pm_shift_begin;
                $time_end = $pm_shift_end;
                if (strlen($time_begin) < 6) {
                    $time_begin = "15:15:00";
                }
                if (strlen($time_end) < 6) {
                    $time_end = "23:15:00";
                }
            }
            if ($shift == 'ALL') {
                if (strlen($time_begin) < 6) {
                    $time_begin = "00:00:00";
                }
                if (strlen($time_end) < 6) {
                    $time_end = "23:59:59";
                }
            }
            $query_date_begin = $query_date." ".$time_begin;
            $query_date_end = $end_date." ".$time_end;

            $agent_performance_array = [];

            $user_row = VicidialAgentLog::join('vicidial_users', 'vicidial_agent_log.user', '=','vicidial_users.user')
                                        ->select(DB::raw('vicidial_users.full_name, vicidial_agent_log.user'))
                                        ->where([['event_time','<=',$query_date.' '.$time_end],['event_time','>=',$thirtydaysago.' '.$time_begin]])
                                        ->whereIn('campaign_id', $group_sql_str)
                                        ->whereIn('vicidial_users.user_group', $user_group_sql_str)
                                        ->distinct('user')
                                        ->orderBy('full_name')
                                        ->get()->toArray();
        
            $i = 0;
            while ($i < count($user_row)) {
                $agent_performance_array[$user_row[$i]['user']][0] = $user_row[$i]['full_name'];
                $i++;
            }

            $sale_row = [];
            $statuses_data = VicidialStatuses::distinct('status')->where('sale', 'Y')->get(['status'])->toArray();
            $campaign_statuses_data = VicidialCampaignStatuses::distinct('status')
                                                    ->where('sale', 'Y')
                                                    ->whereIn('campaign_id', $group_sql_str)
                                                    ->get(['status'])->toArray();

            $sale_row = array_merge ($statuses_data, $campaign_statuses_data);

            $sale_status_str = '';                             
            $i = 0;
            while ($i < count($sale_row)) {
                $status = $sale_row[$i]['status'];

                $sale_status_str .= $status."|";

                $i++;
            }

            $totals_array = $graph_totals_array = [];
            $totals_array[0] = "TOTALS";
            $graph_totals_array[0] = "totals";

            $graph_header =[];
            $graph = [];

            for ($q = 0; $q < count($rpt_date_array); $q++) {
                $rpt_subtitle = $rpt_subtitle_array[$q];
                $rpt_date = $rpt_date_array[$q];

                $rpt_date_numeric = preg_replace('/[^0-9]/', '', $rpt_date_array[$q]);
                $array_offset = ($q * 5) + 1;

                $graph_stats = array();
                $max_stats = array();

                for ($k = 1; $k < 6; $k++) {
                    $max_stats[$k] = 0;
                }

                if ($q == 0) {
                    array_push($graph_header, 'USERNAME');
                    array_push($graph_header, 'ID');
                }

                if ($q == 0 || $q == 1 || $q == 2 || $q == 3 || $q == 4 || $q == 5 || $q == 6) {

                    array_push($graph_header, ($display_type == 'text' ? $rpt_subtitle ."SUMMARY" : '') . "(CALLS)");
                    array_push($graph_header, 'SALES');
                    array_push($graph_header, 'SALE CONV %');
                    array_push($graph_header, 'SALES PER HR');
                    array_push($graph_header, 'TIME');

                }

                $rslt = VicidialAgentLog::join('vicidial_users', 'vicidial_users.user', '=', 'vicidial_agent_log.user')
                                        ->select(DB::raw('count(*) as calls,sum(talk_sec) as talk,full_name,vicidial_users.user as user,sum(pause_sec),sum(wait_sec),sum(dispo_sec),status,sum(dead_sec), vicidial_users.user_group as user_group'))
                                        ->where([['event_time','<=',$query_date.' '.$time_end],['event_time','>=',$rpt_date.' '.$time_begin]])
                                        ->where('pause_sec','<','65000')
                                        ->where('wait_sec','<','65000')
                                        ->where('talk_sec','<','65000')
                                        ->where('dispo_sec','<','65000')
                                        ->whereIn('campaign_id', $group_sql_str)
                                        ->whereIn('vicidial_users.user_group', $user_group_sql_str)
                                        ->groupBy('user','full_name','user_group','status')
                                        ->orderBy('full_name','user','status')
                                        ->limit('500000')
                                        ->get()->toArray();
               
                $rows_to_print = count($rslt);

                $i = 0;

                while ($i < $rows_to_print) {
                    if(!isset($agent_performance_array[$rslt[$i]['user']][$array_offset])){
                        $agent_performance_array[$rslt[$i]['user']][$array_offset] = 0;
                    }
                    if ($rslt[$i]['status'] != "") {
                        $agent_performance_array[$rslt[$i]['user']][$array_offset] += $rslt[$i]['calls'];
                    } # CALLS FOR TIME RANGE, MUST HAVE DISPO TO COUNT AS A CALL

                    $row7 = $rslt[$i]['status'];

                    if(!isset($agent_performance_array[$rslt[$i]['user']][($array_offset + 1)])){
                        $agent_performance_array[$rslt[$i]['user']][($array_offset + 1)] = 0;
                    }
                    if (preg_match("/\|$row7\|/", $sale_status_str)) {
                        $agent_performance_array[$rslt[$i]['user']][($array_offset + 1)] += $rslt[$i]['calls']; # SALES FOR TIME RANGE
                    }

                    if(!isset($agent_performance_array[$rslt[$i]['user']][($array_offset + 4)])){
                        $agent_performance_array[$rslt[$i]['user']][($array_offset + 4)] = 0;
                    }
                    $agent_performance_array[$rslt[$i]['user']][($array_offset + 4)] += ($rslt[$i]['sum(pause_sec)'] + $rslt[$i]['talk'] + $rslt[$i]['sum(dispo_sec)'] + $rslt[$i]['sum(wait_sec)'] + $rslt[$i]['sum(dead_sec)']); # TIME - pause, talk, disp, wait, dead
                    $i++;
                }

                $j = 0;
                while (list($key, $val) = @each($agent_performance_array)) { # CYCLE THROUGH EACH USER

                    for ($k = 0; $k < 2; $k++) {
                        if(!isset($agent_performance_array[$key][($array_offset + $k)])){
                            $agent_performance_array[$key][($array_offset + $k)] = 0;
                        }
                        // $agent_performance_array[$key][($array_offset + $k)] += 0; # Add zero so there are no null values;
                    }

                    $agent_performance_array[$key][($array_offset + 2)] = sprintf("%0.2f", $this->MathZDC(100 * $agent_performance_array[$key][($array_offset + 1)], $agent_performance_array[$key][$array_offset]));

                    if(!isset($agent_performance_array[$key][($array_offset + 4)])){
                        $agent_performance_array[$key][($array_offset + 4)] = 0;
                    }
                    $agent_performance_array[$key][($array_offset + 3)] = sprintf("%0.2f", $this->MathZDC($agent_performance_array[$key][($array_offset + 1)], $this->MathZDC($agent_performance_array[$key][($array_offset + 4)], 3600)));
                    $agent_performance_array[$key][($array_offset + 4)] += 0;

                    for ($k = 0; $k < 5; $k++) {
                        $graph_stats[$j][($k + 1)] = $agent_performance_array[$key][($array_offset + $k)];
                    }
                    for ($k = 0; $k < 5; $k++) { #Cycle through and check for max values
                        if ($agent_performance_array[$key][($array_offset + $k)] > $max_stats[($k + 1)]) {
                            $max_stats[($k + 1)] = $agent_performance_array[$key][($array_offset + $k)];
                        }

                        if(!isset($graph_totals_array[($array_offset + $k)])){
                            $graph_totals_array[($array_offset + $k)] = 0;
                        }
                        $graph_totals_array[($array_offset + $k)] += $agent_performance_array[$key][($array_offset + $k)];
                    }
                    $j++;
                }
                @reset($agent_performance_array);
            }

            $graph['graph_header'] = $graph_header;

            $non_latin = '';

            $u = 0;
            while (list($key, $val) = @each($agent_performance_array)) {

                $user = $key;
                $full_name = $val[0];

                if ($non_latin < 1) {
                    while (strlen($full_name) > 15) {
                        $full_name = substr($full_name, 0, -1);
                    }
                    while (strlen($user) > 8) {
                        $user = substr($user, 0, -1);
                    }
                } else {
                    while (mb_strlen($full_name, 'utf-8') > 15) {
                        $full_name = mb_substr($full_name, 0, -1, 'utf-8');
                    }
                    while (mb_strlen($user, 'utf-8') > 8) {
                        $user = mb_substr($user, 0, -1, 'utf-8');
                    }
                }

                $graph[$u]['full_name'] = $full_name;
                $graph[$u]['user'] = $user;

                if ($display_type != "html") {
                    for ($q = 0; $q < count($rpt_date_array); $q++) {
                        $x = ($q * 5) + 1;

                        $graph[$u]['calls'][$q] = $val[$x];

                        if(isset($totals_array[$x])){
                            $totals_array[$x] += $val[$x];
                        } else {
                            $totals_array[$x] = $val[$x];
                        }

                        $x++;
                        $graph[$u]['sales'][$q] = $val[$x];

                        if(isset($totals_array[$x])){
                            $totals_array[$x] += $val[$x];
                        } else {
                            $totals_array[$x] = $val[$x];
                        }

                        $x++;
                        $graph[$u]['sale_conv'][$q] = $val[$x];

                        $totals_array[$x] = $this->MathZDC(100 * $totals_array[($x - 1)], $totals_array[($x - 2)]);

                        $x++;
                        $graph[$u]['sales_per_hr'][$q] = $val[$x];

                        $x++;
                        $graph[$u]['time'][$q] = $this->sec_convert($val[$x], 'H');

                        if(isset($totals_array[$x])){
                            $totals_array[$x] += $val[$x];
                        } else {
                            $totals_array[$x] = $val[$x];
                        }

                        $totals_array[$x - 1] = $this->MathZDC($totals_array[($x - 3)], $this->MathZDC($totals_array[$x], 3600));
                    }
                } 
                else 
                {
                    for ($q = 0; $q < count($rpt_date_array); $q++) {
                        $x = ($q * 5) + 1;

                        $graph[$u]['calls'][$q] = $this->valToStrip($val[$x], $val[$x], 2);

                        if(isset($totals_array[$x])){
                            $totals_array[$x] += $val[$x];
                        } else {
                            $totals_array[$x] = $val[$x];
                        }
                        

                        $x++;
                        $graph[$u]['sales'][$q] = $this->valToStrip($val[$x], $val[$x], 0);
                        
                        if(isset($totals_array[$x])){
                            $totals_array[$x] += $val[$x];
                        } else {
                            $totals_array[$x] = $val[$x];
                        }

                        $x++;
                        $graph[$u]['sale_conv'][$q] = $this->valToStrip($val[$x], $val[$x], 0);
                        $totals_array[$x] = $this->MathZDC(100 * $totals_array[($x - 1)], $totals_array[($x - 2)]);

                        $x++;
                        $graph[$u]['sales_per_hr'][$q] = $this->valToStrip($val[$x], $val[$x], 0);

                        $x++;
                        $graph[$u]['time'][$q] = $this->valToStrip($val[$x], $this->sec_convert($val[$x], 'H'), 1);
                        
                        if(isset($totals_array[$x])){
                            $totals_array[$x] += $val[$x];
                        } else {
                            $totals_array[$x] = $val[$x];
                        }

                        $totals_array[$x - 1] = $this->MathZDC($totals_array[($x - 3)], $this->MathZDC($totals_array[$x], 3600));
                    }
                }
                $u++;
            }

            $total_array = [];

            array_push($total_array, '#');
            array_push($total_array, $totals_array[0]);

            for ($i = 1; $i < count($totals_array); $i++) {

                switch ($i % 5) {
                    case "1":
                    case "2":
                        array_push($total_array, $totals_array[$i]);
                        break;
                    case "3":
                        array_push($total_array, $totals_array[$i]);
                        break;
                    case "4":
                        array_push($total_array, $totals_array[$i]);
                        break;
                    case "0":
                        array_push($total_array, $this->sec_convert($totals_array[$i], 'H'));
                        break;
                }
            }

            $graph['total_array'] = $total_array;
            
            $total_array_graph = $total_array;
            unset($total_array_graph[0]);
            unset($total_array_graph[1]);
            $total_array_graph = array_values($total_array_graph);
            $array_res = array_chunk($total_array_graph, 5, true);
            $array_final = [];
            foreach($array_res as $key => $value){
             array_push($array_final , array_values($value));
            }
            
            $graph['total_graph_array'] = $array_final;
            $graph['file_download'] = '1';


            if(isset($request['display_type']) && $request['display_type'] != "html" && isset($request['file_download']) && $request['file_download'] == '1'){

                return $this->performanceComparisonReportCsvDownload($graph);

            } else {

                return response()->json([
                    'status'=>200,    
                    'message' => 'Successfully.',
                    'data'=>$graph
                ]);
            }

        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.performance_comparison_report'), $e);
            throw $e;
        }
    }

    public function performanceComparisonReportCsvDownload($graph) {
        try{
                $filename = "performance_comparison_report_".date('Y-m-dh:i:s').".csv";
                $handle = fopen($filename, 'w+');

                $tab_header = $graph['graph_header'];
                fputcsv($handle, $tab_header, ";", '"');

                $tab_data = [];
                for($i = 0; $i <sizeof($graph)-3; $i++){
                    $tab_data[$i]['full_name'] = $graph[$i]['full_name'];
                    $tab_data[$i]['user'] = $graph[$i]['user'];

                    for($j = 0; $j <sizeof($graph[$i]['calls']); $j++){

                        $tab_data[$i]['calls'.$j] = $graph[$i]['calls'][$j];
                        $tab_data[$i]['sales'.$j] = $graph[$i]['sales'][$j];
                        $tab_data[$i]['sale_conv'.$j] = $graph[$i]['sale_conv'][$j];
                        $tab_data[$i]['sales_per_hr'.$j] = $graph[$i]['sales_per_hr'][$j];
                        $tab_data[$i]['time'.$j] = $graph[$i]['time'][$j];
                    }
                }
                foreach($tab_data as $graph_data){
                    fputcsv($handle, $graph_data, ";", '"');
                }

                $tab_total = $graph['total_array'];
                fputcsv($handle, $tab_total, ";", '"');

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
     * CSV for Single Agent Daily .
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param Request $request
     * @return type
     * @throws Exception
     */
    public function csvSingleAgentDaily(Request $request) {
        try{
            $data = $this->singleAgentDaily($request);
            
            $filename = "single_agent".date('Y-m-dh:i:s').".csv";
            $handle = fopen($filename, 'w+');
            
            $title = ['LEAD STATS BREAKDOWN:',$data['time_array']['now_time']];
            fputcsv($handle, $title, ";", '"');
            
            $agent_details = ['Agent Days Status Report:',$data['request_data']['user']];
            fputcsv($handle, $agent_details, ";", '"');
            
            $agent_details = ['Time Range:',$data['time_array']['query_date_begin'], 'To', $data['time_array']['query_date_end']];
            fputcsv($handle, $agent_details, ";", '"');
            
            $heading = ['Date'];
            $heading_array = $data['header_array'];
            $heading = array_merge($heading, $heading_array);
            $heading_ar = $data['sub_statuses_ary'];
            $heading = array_merge($heading, $heading_ar);
            fputcsv($handle, $heading, ";", '"');
            
            foreach($data['graph_stats'] as $key => $rows){
                ksort($rows);
                fputcsv( $handle, $rows, ";",'"');
            }
            
            $total = ['Total'];
            $total_array = $data['totall_array'];
            $total_array = array_merge($total, $total_array);
            $total_ay = $data['secondbar'];
            $total_array = array_merge($total_array, $total_ay);
            fputcsv($handle, $total_array, ";", '"');
            
            fclose($handle);
            $headers = [
                    'Content-Type' => 'text/csv',
            ];
            return Response::download($filename, $filename, $headers)->deleteFileAfterSend(true);
            
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    public function valToStrip($val, $actual, $divide) {

        $value = ''; $width = $val;
        if ($divide == 1) {
             $width = $val / 600;
        } else if ($divide == 2) {
            $width = $val / 10;
        }

        if ($val != 0) {
            $value = $actual;
        } else {
            $value = '0';
        }

        $res = [];
        $res['width'] = $width;
        $res['value'] = $value;
        return $res;
    }


    public function sec_convert($sec, $precision) {
        $sec = round($sec, 0);

        if ($sec < 1) {
            if ($precision == 'HF') {
                return "00:00:00";
            } else {
                return "00:00:00";
            }
        } else {
            if ($precision == 'HF') {
                $precision = 'H';
            } else {
                if (($sec < 3600) and ($precision != 'S')) {
                    $precision = 'H';
                }
            }

            if ($precision == 'H') {
                $Fhours_H = ($sec / 3600);
                $Fhours_H_int = floor($Fhours_H);
                $Fhours_H_int = intval("$Fhours_H_int");
                $Fhours_H_int = ($Fhours_H_int < 10) ? "0$Fhours_H_int" : $Fhours_H_int;
                $Fhours_M = ($Fhours_H - $Fhours_H_int);
                $Fhours_M = ($Fhours_M * 60);
                $Fhours_M_int = floor($Fhours_M);
                $Fhours_M_int = intval("$Fhours_M_int");
                $Fhours_S = ($Fhours_M - $Fhours_M_int);
                $Fhours_S = ($Fhours_S * 60);
                $Fhours_S = round($Fhours_S, 0);
                if ($Fhours_S < 10) {
                    $Fhours_S = "0$Fhours_S";
                }
                if ($Fhours_M_int < 10) {
                    $Fhours_M_int = "0$Fhours_M_int";
                }
                if ($Fhours_S == 60) {
                    $Fhours_M_int = $Fhours_M_int + 1;
                    if ($Fhours_M_int < 10) {
                        $Fhours_M_int = "0$Fhours_M_int";
                    }
                    $Fhours_S = "00";
                }
                $Ftime = "$Fhours_H_int:$Fhours_M_int:$Fhours_S";
            }
            if ($precision == 'M') {
                $Fminutes_M = ($sec / 60);
                $Fminutes_M_int = floor($Fminutes_M);
                $Fminutes_M_int = intval("$Fminutes_M_int");
                $Fminutes_S = ($Fminutes_M - $Fminutes_M_int);
                $Fminutes_S = ($Fminutes_S * 60);
                $Fminutes_S = round($Fminutes_S, 0);
                if ($Fminutes_S < 10) {
                    $Fminutes_S = "0$Fminutes_S";
                }
                $Ftime = "$Fminutes_M_int:$Fminutes_S";
            }
            if ($precision == 'S') {
                $Ftime = $sec;
            }

            return "$Ftime";
        }
    }


    public function MathZDC($dividend, $divisor, $quotient = 0) {
        if ($divisor == 0) {
            return $quotient;
        } else {
            if ($dividend == 0) {
                return 0;
            } else {
                return ($dividend / $divisor);
            }
        }
    }
    
    /**
     * Agent stats Csv file download.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param Request $request
     * @return type
     * @throws Exception
     */
    public function csvAgentStats(Request $request){
        try{
            $table_download = $request->input('table_download');
            switch ($table_download) {
                case "agent_talk_status":
                    $filename = $this->agentTalkStatus($request);
                    break;
                case "agent_login_logout":
                    $filename = $this->agentLoginLogout($request);
                    break;
                case "agent_login_logout_time":
                    $filename = $this->agentLoginLogoutTime($request);
                    break;
                case "closer_in_group_selection_logs":
                    $filename = $this->closerInGroupSelectionLogs($request);
                    break;
                case "outbound_calls_time_period":
                    $filename = $this->outboundCallsTimePeriod($request);
                    break;
                case "inbound_calls_time_period":
                    $filename = $this->inboundCallsTimePeriod($request);
                    break;
                case "agent_activity_for_this_time_period":
                    $filename = $this->agentActivityTimePeriod($request);
                    break;
                case "recording_for_this_time_period":
                    $filename = $this->recordingForThisTimePeriod($request);
                    break;
                case "manual_outbound_for_this_time_period":
                    $filename = $this->manualOutboundForThisTimePeriod($request);
                    break;
                case "lead_search_for_this_time_period":
                    $filename = $this->leadSearchForThisTimePeriod($request);
                    break;
                case "preview_lead_skips_for_this_time_period":
                    $filename = $this->previewLeadSkipsForThisTimePeriod($request);
                    break;


            }
            
            $headers = [
                    'Content-Type' => 'text/csv',
            ];
            return Response::download($filename, $filename, $headers)->deleteFileAfterSend(true);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }
    
    public function previewLeadSkipsForThisTimePeriod($request){
        try{
            $data = $request->input('data');
            
            $filename = "agent_stats_report_form".date('Y-m-dh:i:s').".csv";
            $handle = fopen($filename, 'w+');
            
            $row= ['PREVIEW LEAD SKIPS FOR THIS TIME PERIOD: (10000 record limit)'];
            fputcsv($handle, $row, ";", '"');
            
            $rows= ['DATE/TIME','LEAD ID','STATUS','COUNT','CAMPAIGN'];
            
            fputcsv($handle, $rows, ";", '"');
            
            foreach($data['leadskip'] as $key => $rows){
                fputcsv( $handle, $rows, ";",'"');
            }
            
            fclose($handle);
            $headers = [
                    'Content-Type' => 'text/csv',
            ];
            return $filename;
            
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }
    
    public function leadSearchForThisTimePeriod($request){
        try{
            $data = $request->input('data');
            
            $filename = "agent_stats_report_form".date('Y-m-dh:i:s').".csv";
            $handle = fopen($filename, 'w+');
            
            $row= ['LEAD SEARCHES FOR THIS TIME PERIOD: (10000 record limit)'];
            fputcsv($handle, $row, ";", '"');
            
            $rows= ['DATE/TIME','TYPE','RESULTS','SEC','QUERY'];
            
            fputcsv($handle, $rows, ";", '"');
            
            foreach($data['leadsearch'] as $key => $rows){
                fputcsv( $handle, $rows, ";",'"');
            }
            
            fclose($handle);
            $headers = [
                    'Content-Type' => 'text/csv',
            ];
            return $filename;
            
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }
    
    public function manualOutboundForThisTimePeriod($request){
        try{
            $data = $request->input('data');
            
            $filename = "agent_stats_report_form".date('Y-m-dh:i:s').".csv";
            $handle = fopen($filename, 'w+');
            
            $row= ['MANUAL OUTBOUND CALLS FOR THIS TIME PERIOD: (10000 record limit)'];
            fputcsv($handle, $row, ";", '"');
            
            $rows= ['#','DATE/TIME','CALL TYPE','SERVER','PHONE','DIALED','LEAD','CALLER ID','ALIAS','PRESET','C3HU'];
            
            fputcsv($handle, $rows, ";", '"');
            
            foreach($data['manualcalls'] as $key => $rows){
                fputcsv( $handle, $rows, ";",'"');
            }
            
            fclose($handle);
            $headers = [
                    'Content-Type' => 'text/csv',
            ];
            return $filename;
            
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }
    
    public function recordingForThisTimePeriod($request){
        try{
            $data = $request->input('data');
            
            $filename = "agent_stats_report_form".date('Y-m-dh:i:s').".csv";
            $handle = fopen($filename, 'w+');
            
            $row= ['RECORDINGS FOR THIS TIME PERIOD: (10000 record limit)'];
            fputcsv($handle, $row, ";", '"');
            
            $rows= ['#','LEAD','DATE/TIME','SECONDS',	'RECID','FILENAME','LOCATION'];
            
            fputcsv($handle, $rows, ";", '"');
            
            foreach($data['recording'] as $key => $rows){
                fputcsv( $handle, $rows, ";",'"');
            }
            
            fclose($handle);
            $headers = [
                    'Content-Type' => 'text/csv',
            ];
            return $filename;
            
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }
    
    public function agentActivityTimePeriod($request){
        try{
            $data = $request->input('data');
            
            $filename = "agent_stats_report_form".date('Y-m-dh:i:s').".csv";
            $handle = fopen($filename, 'w+');
            
            $row= ['AGENT ACTIVITY FOR THIS TIME PERIOD: (10000 record limit)'];
            fputcsv($handle, $row, ";", '"');
            
            $rows= ['#','DATE/TIME','PAUSE','WAIT',	'TALK','DISPO','DEAD',	'CUSTOMER','STATUS','LEAD','CAMPAIGN','PAUSE CODE'];
            
            fputcsv($handle, $rows, ";", '"');
            
            foreach($data['agentactivity'] as $key => $rows){
                fputcsv( $handle, $rows, ";",'"');
            }
            
            $total = ['','Total', $data['total_pause_seconds'], $data['total_wait_seconds'], $data['total_talk_seconds'],$data['total_dispo_seconds'], $data['total_dead_seconds'],$data['total_customerseconds']];
            fputcsv($handle, $total, ";", '"');
            
            $total = ['','(in HH:MM:SS)', $data['total_pause_second_shh'], $data['total_wait_second_shh'], $data['total_talk_second_shh'],$data['total_dispo_second_shh'], 
                $data['total_dead_second_shh'],$data['total_customer_second_shh']];
            fputcsv($handle, $total, ";", '"');
            
            fclose($handle);
            $headers = [
                    'Content-Type' => 'text/csv',
            ];
            return $filename;
            
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }
    
    public function inboundCallsTimePeriod($request){
        try{
            $data = $request->input('data');
            
            $filename = "agent_stats_report_form".date('Y-m-dh:i:s').".csv";
            $handle = fopen($filename, 'w+');
            
            $row= ['INBOUND / CLOSER CALLS FOR THIS TIME PERIOD: (10000 record limit)'];
            fputcsv($handle, $row, ";", '"');
            
            $rows= ['DATE/TIME','LENGTH','STATUS','PHONE','CAMPAIGN','WAIT (S)','AGENTS(S)','LIST','LEAD','HANGUP REASON','CALL NOTES'];
            fputcsv($handle, $rows, ";", '"');
            
            foreach($data['inboundcalls'] as $key => $rows){
                fputcsv( $handle, $rows, ";",'"');
            }
            
            $total = ['Total', $data['total_in_seconds'],'','','','',$data['total_agent_seconds']];
            fputcsv($handle, $total, ";", '"');
            
            fclose($handle);
            $headers = [
                    'Content-Type' => 'text/csv',
            ];
            return $filename;
            
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }
    
    public function outboundCallsTimePeriod($request){
        try{
            $data = $request->input('data');
            
            $filename = "agent_stats_report_form".date('Y-m-dh:i:s').".csv";
            $handle = fopen($filename, 'w+');
            
            $row= ['OUTBOUND CALLS FOR THIS TIME PERIOD: (10000 record limit)'];
            fputcsv($handle, $row, ";", '"');
            
            $rows= ['DATE/TIME','LENGTH','STATUS','PHONE','CAMPAIGN','GROUP','LIST','LEAD','HANGUP REASON','CALL NOTES'];
            fputcsv($handle, $rows, ";", '"');
            
            foreach($data['outboundcalls'] as $key => $rows){
                fputcsv( $handle, $rows, ";",'"');
            }
            
            fclose($handle);
            $headers = [
                    'Content-Type' => 'text/csv',
            ];
            return $filename;
            
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }
    
    public function closerInGroupSelectionLogs($request){
        try{
            $data = $request->input('data');
            
            $filename = "agent_stats_report_form".date('Y-m-dh:i:s').".csv";
            $handle = fopen($filename, 'w+');
            
            $row= ['CLOSER IN-GROUP SELECTION LOGS'];
            fputcsv($handle, $row, ";", '"');
            
            $rows= ['User','DATE/TIME','CAMPAIGN','BLEND','GROUPS','MANAGER'];
            fputcsv($handle, $rows, ";", '"');
            
            foreach($data['closeringrouplogs'] as $key => $rows){
                fputcsv( $handle, $rows, ";",'"');
            }
            
            fclose($handle);
            $headers = [
                    'Content-Type' => 'text/csv',
            ];
            return $filename;
            
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }
    
    public function agentLoginLogoutTime($request){
        try{
            $data = $request->input('data');
            
            $filename = "agent_stats_report_form".date('Y-m-dh:i:s').".csv";
            $handle = fopen($filename, 'w+');
            
            $row= ['TIME CLOCK LOGIN/LOGOUT TIME'];
            fputcsv($handle, $row, ";", '"');
            
            $rows= ['ID','EVENT','EDIT','DATE','IP ADDRESS','GROUP','HOURS MM:SS'];
            fputcsv($handle, $rows, ";", '"');
            
            foreach($data['timeclockloginfo'] as $key => $rows){
                fputcsv( $handle, $rows, ";",'"');
            }
            
            $array = ['Total','','','','','', $data['total_timeclock_login_hours_minutes']];
            fputcsv($handle, $array, ";", '"');
            
            fclose($handle);
            $headers = [
                    'Content-Type' => 'text/csv',
            ];
            return $filename;
            
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }
    
    public function agentLoginLogout($request){
        try{
            $data = $request->input('data');
            
            $filename = "agent_stats_report_form".date('Y-m-dh:i:s').".csv";
            $handle = fopen($filename, 'w+');
            
            $row= ['AGENT LOGIN/LOGOUT TIME'];
            fputcsv($handle, $row, ";", '"');
            
            $rows= ['EVENT','DATE','CAMPAIGN','GROUP','SESSIONHOURS  MM:SS','SERVER','PHONE','COMPUTER','PHONE LOGIN','PHONE IP'];
            fputcsv($handle, $rows, ";", '"');
            
            foreach($data['userloginfo'] as $key => $rows){
                fputcsv( $handle, $rows, ";",'"');
            }
            
            $array = ['Total','','','', $data['total_login_hours_minutes']];
            fputcsv($handle, $array, ";", '"');
            
            fclose($handle);
            $headers = [
                    'Content-Type' => 'text/csv',
            ];
            return $filename;
            
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }
    
    
    public function agentTalkStatus($request){
        try{
            $data = $request->input('data');
            $filename = "agent_stats_report_form".date('Y-m-dh:i:s').".csv";
            $handle = fopen($filename, 'w+');
            
            $row= ['AGENT TALK TIME AND STATUS'];
            fputcsv($handle, $row, ";", '"');
            
            $rows= ['STATUS','COUNT','HOURS:MM:SS'];
            fputcsv($handle, $rows, ";", '"');
            
            $status = $data['status'];
            $counts = $data['counts'];
            $counts = array_merge($status, $counts);
            $call_hours_minutes = $data['call_hours_minutes'];
            $counts = array_merge($counts, $call_hours_minutes);
            fputcsv($handle, $counts, ";", '"');
            
            $array = ['Total Calls',$data['total_calls'], $data['total_call_hours_minutes']];
            fputcsv($handle, $array, ";", '"');
            
            fclose($handle);
            
            return $filename;
            
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }
    
    
}
        
