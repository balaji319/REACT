<?php

namespace App\Http\Controllers\Report;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\VicidialCampaign;
use App\UserCallLog;
use App\VicidialInboundGroup;
use App\VicidialLog;
use App\VicidialStatuses;
use App\VicidialCampaignStatuses;
use App\VicidialCloserLog;
use App\VicidialAgentLog;
use App\VicidialCampaigns;
use App\VicidialStatusCategories;
use App\VicidialUser;
use App\Traits\AccessControl;
use App\VicidialInboundDid;
use App\LiveInboundLog;
use App\VicidialUserGroup;
use App\VicidialCallTime;
use Response;
use Illuminate\Support\Facades\Hash;

class OutboundController extends Controller {

    use AccessControl;

    public function outboundCallingReport(Request $request) {
        try{

        	$startdate = $request['start_date'];
            $enddate1 = $request['end_date'];
            $shift = $request['shift'];
            $reportdisplaytype = $request['report_display_type'];
            
            $group = [];
            $group = $request['selected_groups'];
            // $user = $request->user();
            // if(isset($request['selected_groups']) && is_array($request['selected_groups'])){
            //     $group = array_intersect($group, $this->getListByAccess(ACCESS_TYPE_INGROUP, ACCESS_READ, $user));
            // }

//---------------------Getting wrong result after adding access control --------------------------
            
            $rollstatus = $request['include_rollover'];
            $carrier_stats = $request['carrier_stats'];
            $bottom_graph = $request['bottom_graph'];

            $time_array = $this->setTimeBegin($shift, $startdate, $enddate1);

            $startdate = $time_array['query_date_begin'];
            $enddate = $time_array['query_date_end'];

            $human_answered_list = array();
            if ($rollstatus == "YES") {

            	$human_answered_list = VicidialCampaign::whereIn('campaign_id',$group)
        									->whereNotIn('drop_inbound_group',array('NONE', 'NULL', ''))
        									->get(['drop_inbound_group'])->toArray();
            }

            $userlist = UserCallLog::whereIn('campaign_id',$group)
            								->where([['call_date','<=',$enddate],['call_date','>=',$startdate]])
        									->whereNotIn('preset_name',array('NONE', 'NULL', ''))
        									->select(DB::raw('preset_name, COUNT(*) AS `calls`'))
        									->groupBy('preset_name')
        									->get();
           
        	$rollover = VicidialInboundGroup::getAllInboundGroupData($human_answered_list);
			
            $total_calldetails = VicidialLog::whereIn('campaign_id',$group)
            								->where([['call_date','<=',$enddate],['call_date','>=',$startdate]])
        									->select(DB::raw('count(*) as calls, sum(length_in_sec) as total_length'))
        									->get();

			$campaignstatuslist = array();

			$status_all = VicidialStatuses::where('human_answered','Y')->select(DB::raw('status'))->get();
			$i=0;
			while ($i < count($status_all)) { array_push($campaignstatuslist, $status_all[$i]['status']); $i++; }


			$campaign_statuses = VicidialCampaignStatuses::where('human_answered','Y')->whereIn('campaign_id',$group)->select(DB::raw('status,status_name'))->get();

			$i = 0;
            while ($i < count($campaign_statuses)) { array_push($campaignstatuslist, $campaign_statuses[$i]['status']); $i++; }
            
            $rollover_calls = VicidialCloserLog::whereIn('campaign_id',$human_answered_list)->whereIn('status',$campaignstatuslist)
            									->where([['call_date','<=',$enddate],['call_date','>=',$startdate]])
            									->select(DB::raw('campaign_id,status,count(*) as calls,sum(length_in_sec) as total_length'))
            									->get();
            
            $human_answered1 = VicidialLog::whereIn('campaign_id',$group)
        										->whereIn('status',$campaignstatuslist)
            									->where([['call_date','<=',$enddate],['call_date','>=',$startdate]])
            									->select(DB::raw('count(*) as calls,sum(length_in_sec) as total_length'))
            									->get();
          
            $agent_time_details = VicidialAgentLog::whereIn('campaign_id',$group)
            									->where([['event_time','<=',$enddate],['event_time','>=',$startdate],['pause_sec','<','65000'],['wait_sec','<','65000'],['talk_sec','<','65000'],['dispo_sec','<','65000']])
            									->select(DB::raw('sum(pause_sec + wait_sec + talk_sec + dispo_sec) as total_length'))
            									->get();

            $agentsec = $agent_time_details[0]['total_length'];

            
            $totalrollover_calls = 0;
            $k = 0;
            for ($i = 0; $i < count($rollover_calls); $i++) {
                $totalrollover_calls+=$rollover_calls[$i]['calls'];
                $k++;
            }


            $total_calls_count = $total_calldetails[0]['calls'];
            $totalsec = $total_calldetails[0]['total_length'];
            $total_length = $total_calldetails[0]['total_length'];
            
            $total_calls_average = $this->getDivision($total_length, $total_calls_count);

            $total_callsinfo['total_calls'] = $total_calls_count;
            $total_callsinfo['total_calls_avg'] = number_format((float)$total_calls_average, 2, '.', '');

            $total_callsinfo['rollover'] = count($rollover_calls) > 1 ? count($rollover_calls) : 0;
            
            $human_answered['total_calls'] = $human_answered1[0]['calls'];
            $human_answeredtotal_length = $human_answered1[0]['total_length'];
            if ($rollstatus == 'YES') {
                $human_answered['total_calls']+=$totalrollover_calls;
            }
            $human_answered_calls_average = $this->getDivision($human_answeredtotal_length, $human_answered['total_calls']);
            $human_answered['total_calls_avg'] = $human_answered_calls_average;
            $human_answered['total_calls_time'] = $this->secConvert($human_answered1[0]['total_length'], 'H');

            $drop_calls = VicidialLog::whereIn('campaign_id',$group)
										->where([['call_date','<=',$enddate],['call_date','>=',$startdate],['length_in_sec','<=','6000']])
										->where('status','DROP')
										->select(DB::raw('count(*) as calls,sum(length_in_sec) as total_length'))
										->get();

			
            $answered_calls = VicidialLog::whereIn('campaign_id',$group)
            							->whereIn('status',$campaignstatuslist)
										->where([['call_date','<=',$enddate],['call_date','>=',$startdate]])
										->select(DB::raw('count(*) as calls, sum(length_in_sec) as total_length'))
										->get();
			
			$drop_details['dropcount'] = $drop_calls[0]['calls'];
            $drop_details['anscount'] = $answered_calls[0]['calls'];
            $drop_details['droptotpercent'] = round($this->MathZDC($drop_calls[0]['calls'], $total_calls_count) * 100, 2);
            $drop_details['dropanspercent'] = round($this->MathZDC($drop_calls[0]['calls'],$answered_calls[0]['calls']) * 100, 2);

            $drop_details['dropanscountwithroll'] = ($answered_calls[0]['calls'] + $totalrollover_calls);
            $drop_details['dropanspercentwithroll'] = round($this->MathZDC($drop_calls[0]['calls'], $drop_details['dropanscountwithroll']) * 100, 2);
            $drop_details['dropavglength'] = $this->getDivision($drop_calls[0]['total_length'], $drop_calls[0]['calls']);
            
            $closer_campaign_query = VicidialCampaign::whereIn('campaign_id',$group)->select(DB::raw('closer_campaigns'))->get();

           	$c = 0;
            $closer_campaigns_sql = [];
            while ($c < count($closer_campaign_query)) {
            	array_push($closer_campaigns_sql, $closer_campaign_query[$c]['closer_campaigns']);
            	$c++;
            }

            $total_answers_1 = VicidialCloserLog::whereIn('campaign_id',$closer_campaigns_sql)
        										->where([['call_date','<=',$enddate],['call_date','>=',$startdate],['status','<>',array('DROP', 'XDROP', 'HXFER', 'QVMAIL', 'HOLDTO', 'LIVE', 'QUEUE')]])
            									->select(DB::raw('COUNT(*) AS `count`'))->get();
           	
            $total_answers = ($total_answers_1[0]['count'] + $answered_calls[0]['calls']);
			
			$agent_non_pause_sec = VicidialAgentLog::whereIn('campaign_id',$group)
            									->where([['event_time','<=',$enddate],['event_time','>=',$startdate],['pause_sec','<','65000'],['wait_sec','<','65000'],['talk_sec','<','65000'],['dispo_sec','<','65000']])
            									->select(DB::raw('sum(wait_sec + talk_sec + dispo_sec) as total_length'))
            									->get();
            $agent_non_pause_sec = isset($agent_non_pause_sec[0]['total_length']) ? $agent_non_pause_sec[0]['total_length'] : "0";

            $avg_answer_agent_non_pause_sec = ($this->getDivision($total_answers, $agent_non_pause_sec) * 60);

            $drop_details['prodrating'] = round($avg_answer_agent_non_pause_sec, 2);
                       	
            $auto_na_calls = VicidialLog::whereIn('campaign_id',$group)
            							->whereIn('status',array('NA', 'ADC', 'AB', 'CPDB', 'CPDUK', 'CPDATB', 'CPDNA', 'CPDREJ', 'CPDINV', 'CPDSUA', 'CPDSI', 'CPDSNC', 'CPDSR', 'CPDSUK', 'CPDSV', 'CPDERR'))
            							->where([['call_date','<=',$enddate],['call_date','>=',$startdate],['length_in_sec','<=','60']])
										->select(DB::raw('count(*) as calls, sum(length_in_sec) as total_length'))
										->get();			 

			 $manual_na_calls = VicidialLog::whereIn('campaign_id',$group)
            							->whereIn('status', array('B', 'DC', 'N'))
            							->where([['call_date','<=',$enddate],['call_date','>=',$startdate],['length_in_sec','<=','60']])
										->select(DB::raw('count(*) as calls, sum(length_in_sec) as total_length'))
										->get();			

			$hangupstats = VicidialLog::whereIn('campaign_id',$group)
            							->where([['call_date','<=',$enddate],['call_date','>=',$startdate]])
										->select(DB::raw('count(*) as calls, term_reason'))
										->groupBy('term_reason')
										->get();
			
			$statusstats = VicidialLog::whereIn('campaign_id',$group)
            							->where([['call_date','<=',$enddate],['call_date','>=',$startdate]])
										->select(DB::raw('count(*) as calls, sum(length_in_sec) as total_length, status'))
										->groupBy('status')
										->get();

			$liststats = VicidialLog::whereIn('campaign_id',$group)
            							->where([['call_date','<=',$enddate],['call_date','>=',$startdate]])
										->select(DB::raw('count(*) as calls, list_id'))
										->groupBy('list_id')
										->get();
			
			$statuscatlist = VicidialStatusCategories::select(DB::raw('vsc_id, vsc_name'))
														->get();

			$agentstats = VicidialLog::join('vicidial_users', 'vicidial_log.user', '=','vicidial_users.user')
										->select(DB::raw('vicidial_log.user, vicidial_users.full_name, count(*) as calls, avg(vicidial_log.length_in_sec) as avg_length, sum(vicidial_log.length_in_sec) as total_length '))
										->where([['call_date','<=',$enddate],['call_date','>=',$startdate],['length_in_sec','>','0']])
										->whereIn('campaign_id',$group)
										->groupBy('user')
										->get();

			$get_avg_time_1 = VicidialAgentLog::whereIn('campaign_id',$group)
        									->where([['event_time','<=',$enddate],['event_time','>=',$startdate],['pause_sec','<','65000'],['wait_sec','<','65000'],['talk_sec','<','65000'],['dispo_sec','<','65000']])
        									->select(DB::raw('avg(wait_sec) as avgwait_time'))
        									->get();

        	$avgwait_time = isset($get_avg_time_1[0]['avgwait_time']) ? $this->secConvert($get_avg_time_1[0]['avgwait_time'], 'H') : "0";
            


            $hi_hour_count = 0;
            $last_full_record = 0;
            $i = 0;
            $h = 0;
            $hour_count = [];
            $drop_count = [];
            $timebottomstats = [];
            $bottom_tab_header_array = $bottom_tab_data_array = $bottom_tab_data_array_temp = [];

            if ($bottom_graph == "YES") {
                $startdate_array = explode(" ", $startdate);
                $query_date = $startdate_array[0];

                $hi_hour_count = 0;
                $last_full_record = 0;
                $i = 0;
                $h = 0;
                while ($i <= 96) {

                    $rslt = VicidialLog::where([['call_date','<=',$query_date.' '.$h.':14:59'],['call_date','>=',$query_date.' '.$h.':00:00']])
                                    ->whereIn('campaign_id',$group)
                                    ->select(DB::raw('count(*) as calls'))
                                    ->get()->toArray();

                    $hour_count[$i] = $rslt[0]['calls'];
                    if ($hour_count[$i] > $hi_hour_count) { $hi_hour_count = $hour_count[$i]; }
                    if ($hour_count[$i] > 0) { $last_full_record = $i; }

                    $rslt = VicidialLog::where([['call_date','<=',$query_date.' '.$h.':14:59'],['call_date','>=',$query_date.' '.$h.':00:00']])
                                    ->whereIn('campaign_id',$group)
                                    ->where('status','DROP')
                                    ->select(DB::raw('count(*) as calls'))
                                    ->get()->toArray();

                    $drop_count[$i] = $rslt[0]['calls'];
                    $i++;

                    $rslt = VicidialLog::where([['call_date','<=',$query_date.' '.$h.':29:59'],['call_date','>=',$query_date.' '.$h.':15:00']])
                                    ->whereIn('campaign_id',$group)
                                    ->select(DB::raw('count(*) as calls'))
                                    ->get()->toArray();

                    $hour_count[$i] = $rslt[0]['calls'];
                    if ($hour_count[$i] > $hi_hour_count) { $hi_hour_count = $hour_count[$i]; }
                    if ($hour_count[$i] > 0) { $last_full_record = $i; }

                    $rslt = VicidialLog::where([['call_date','<=',$query_date.' '.$h.':29:59'],['call_date','>=',$query_date.' '.$h.':15:00']])
                                    ->whereIn('campaign_id',$group)
                                    ->where('status','DROP')
                                    ->select(DB::raw('count(*) as calls'))
                                    ->get()->toArray();

                    $drop_count[$i] = $rslt[0]['calls'];
                    $i++;

                    $rslt = VicidialLog::where([['call_date','<=',$query_date.' '.$h.':44:59'],['call_date','>=',$query_date.' '.$h.':30:00']])
                                    ->whereIn('campaign_id',$request['selected_groups'])
                                    ->select(DB::raw('count(*) as calls'))
                                    ->get()->toArray();

                    
                    $hour_count[$i] = $rslt[0]['calls'];
                    if ($hour_count[$i] > $hi_hour_count) { $hi_hour_count = $hour_count[$i]; }
                    if ($hour_count[$i] > 0) { $last_full_record = $i; }

                    $rslt = VicidialLog::where([['call_date','<=',$query_date.' '.$h.':44:59'],['call_date','>=',$query_date.' '.$h.':30:00']])
                                    ->whereIn('campaign_id',$group)
                                    ->where('status','DROP')
                                    ->select(DB::raw('count(*) as calls'))
                                    ->get()->toArray();

                    $drop_count[$i] = $rslt[0]['calls'];
                    $i++;

                    $rslt = VicidialLog::where([['call_date','<=',$query_date.' '.$h.':59:59'],['call_date','>=',$query_date.' '.$h.':45:00']])
                                    ->whereIn('campaign_id',$group)
                                    ->select(DB::raw('count(*) as calls'))
                                    ->get()->toArray();
                    $hour_count[$i] = $rslt[0]['calls'];
                    if ($hour_count[$i] > $hi_hour_count) { $hi_hour_count = $hour_count[$i]; }
                    if ($hour_count[$i] > 0) { $last_full_record = $i; }

                    $rslt = VicidialLog::where([['call_date','<=',$query_date.' '.$h.':59:59'],['call_date','>=',$query_date.' '.$h.':45:00']])
                                    ->whereIn('campaign_id',$group)
                                    ->where('status','DROP')
                                    ->select(DB::raw('count(*) as calls'))
                                    ->get()->toArray();

                    $drop_count[$i] = $rslt[0]['calls'];

                    $i++;
                    $h++;

                }

                $hour_multiplier = $this->MathZDC(100, $hi_hour_count);

                $k = 1;
                $mk = 0;
                $call_scale = '0';

                while ($k <= 102) {
                    if ($mk >= 5) {
                        $mk = 0;
                        $scale_num = $this->MathZDC($k, $hour_multiplier, 100);
                        $scale_num = round($scale_num, 0);
                        $len_scale_num = (strlen($scale_num));
                        $k = ($k + $len_scale_num);
                        array_push($bottom_tab_header_array, $scale_num);
                        
                    } else {                        
                        $k++; $mk++;
                    }
                }
                
                $zz = '00';
                $i = 0;
                $h = 4;
                $hour = -1;
                $no_lines_yet = 1;

                while ($i <= 96) {

                    $bottom_tab_data_array_temp = [];

                    $char_counter = 0;
                    $time = '      ';
                    if ($h >= 4) {
                        $hour++;
                        $h = 0;
                        if ($hour < 10) { $hour = "0$hour"; }
                        $time = "+$hour$zz+";
                    }
                    if ($h == 1) { $time = "   15 "; }
                    if ($h == 2) { $time = "   30 "; }
                    if ($h == 3) { $time = "   45 "; }
                    $ghour_count = $hour_count[$i];
                    if ($ghour_count < 1) {
                        if (($no_lines_yet) or ( $i > $last_full_record)) {
                            $do_nothing = 1;
                        } else {
                            $hour_count[$i] = sprintf("%-5s", $hour_count[$i]);

                            array_push($bottom_tab_data_array, $time);
                            array_push($bottom_tab_data_array, '');

                            $k = 0; 
                            while ($k <= 102) {$k++;}

                            array_push($bottom_tab_data_array, $hour_count[$i]);
                            array_push($bottom_tab_data_array, '');

                        }
                    } else {

                        $no_lines_yet = 0;
                        $xhour_count = ($ghour_count * $hour_multiplier);
                        $yhour_count = (99 - $xhour_count);

                        $gdrop_count = $drop_count[$i];
                        if ($gdrop_count < 1) {
                            $hour_count[$i] = sprintf("%-5s", $hour_count[$i]);

                            array_push($bottom_tab_data_array, $time);

                            $tb_data ='';

                            $k = 0; 
                            while ($k <= $xhour_count) 
                            {
                                $tb_data .= '*';
                                $k++;
                                $char_counter++;
                            }
                            $tb_data .='*X';

                            array_push($bottom_tab_data_array, $tb_data);
                            $char_counter++;

                            $k = 0;
                            while ($k <= $yhour_count) {$k++; $char_counter++; }
                            while ($char_counter <= 101) { $char_counter++; }

                            array_push($bottom_tab_data_array, '0');
                            array_push($bottom_tab_data_array, $hour_count[$i]);

                        } else {
                            $xdrop_count = ($gdrop_count * $hour_multiplier);

                            $xxhour_count = ( ($xhour_count - $xdrop_count) - 1 );

                            $hour_count[$i] = sprintf("%-5s", $hour_count[$i]);
                            $drop_count[$i] = sprintf("%-5s", $drop_count[$i]);

                            array_push($bottom_tab_data_array, $time);

                            $tb_data ='';
                            $k = 0;
                            while ($k <= $xdrop_count)
                            {
                                $tb_data .= ">";
                                $k++;
                                $char_counter++;
                            }
                            $tb_data .= "D";
                            $char_counter++;

                            $k = 0;
                            while ($k <= $xxhour_count)
                            {
                                $tb_data .="*";
                                $k++;
                                $char_counter++;
                            }
                            $tb_data .= "X";

                            array_push($bottom_tab_data_array, $tb_data);

                            $char_counter++;

                            $k = 0; $tb_data = "";
                            while ($k <= $yhour_count)
                            {
                                $tb_data .= " ";
                                $k++;
                                $char_counter++;
                            }
                            while ($char_counter <= 102)
                            {
                                $tb_data .= " ";
                                $char_counter++;
                            }
                            
                            array_push($bottom_tab_data_array, $drop_count[$i]);
                            array_push($bottom_tab_data_array, $hour_count[$i]);
                        }
                    }
                    $i++;
                    $h++;

                    if (!empty($bottom_tab_data_array_temp)) {
                        array_push($bottom_tab_data_array, $bottom_tab_data_array_temp);
                    }
                    
                }
            }

            $agent_preset = [];
            $agent_preset_head = [];
            array_push($agent_preset_head, 'PRESET NAME');
            array_push($agent_preset_head, 'CALLS');
            $agent_preset['agent_preset_head'] = $agent_preset_head;
            $userlisttotalcalls = 0;

            $custom_stats = [];
            $custom_stats_head = [];
            array_push($custom_stats_head, 'CATEGORY');
            array_push($custom_stats_head, 'DESCRIPTION');
            array_push($custom_stats_head, 'CALLS');
            $custom_stats['custom_stats_head'] = $custom_stats_head;
            $statuscattotalcalls = 0;
            
            $agent_statastics = [];
            $agent_statastics_head = [];
            array_push($agent_statastics_head, 'AGENT');
            array_push($agent_statastics_head, 'CALLS');
            array_push($agent_statastics_head, 'TOTAL TIME');
            array_push($agent_statastics_head, 'AVG TIME');
            $agent_statastics['agent_statastics_head'] = $agent_statastics_head;

            $totalagents = 0;
            $totalagenttime = 0;
            $listtotalcalls = 0;
            $hanguptotalcalls = 0;

            $agent_preset_data = [];
            $custom_stats_data = [];
            $agent_statastics_data = [];
            $agent_statastics_total = [];
            $list_id_stats = [];
            $call_hangup_stats = [];

        	for ($i = 0; $i < count($userlist); $i++) {
                $userlisttotalcalls+=$userlist[$i]['calls'];
                $agent_preset_data[$i]['preset_name'] = $userlist[$i]['preset_name'];
                $agent_preset_data[$i]['calls'] = $userlist[$i]['calls'];
            }
			$agent_preset['agent_preset_data'] = $agent_preset_data;


            for ($i = 0; $i < count($statuscatlist); $i++) {
            	$custom_stats_data[$i]['vsc_id'] = $statuscatlist[$i]['vsc_id'];
            	$custom_stats_data[$i]['vsc_name'] = $statuscatlist[$i]['vsc_name'];
            	$custom_stats_data[$i]['statuscattotalcalls'] = $statuscattotalcalls;
            }
            $custom_stats['custom_stats_data'] = $custom_stats_data;


            for ($i = 0; $i < count($agentstats); $i++) {
                $totalagents += $agentstats[$i]['calls'];
                $totalagenttime += $agentstats[$i]['total_length'];

                $agent_statastics_data[$i]['user'] = $agentstats[$i]['user'];
                $agent_statastics_data[$i]['full_name'] = $agentstats[$i]['full_name'];
                $agent_statastics_data[$i]['calls'] = $agentstats[$i]['calls'];
                $agent_statastics_data[$i]['total_length'] = $this->secConvert($agentstats[$i]['total_length'], 'H');
                $agent_statastics_data[$i]['avg_length'] = $this->secConvert($agentstats[$i]['avg_length'], 'H');
            }
            $agent_statastics['agent_statastics_data'] = $agent_statastics_data;

            $totalagentavgtime = 0;
            if($totalagents>0){
            	$totalagentavgtime = $totalagenttime / $totalagents;
            }
            
            $agent_statastics_total['totalagents'] = $totalagents;
            $agent_statastics_total['totalagenttime'] = $this->secConvert($totalagenttime, 'H');
            $agent_statastics_total['totalagentavgtime'] = $this->secConvert($totalagentavgtime, 'H');
             
            $agent_statastics['agent_statastics_total'] = $agent_statastics_total;
            $agent_statastics['avgwait_time'] = $avgwait_time;

            for ($i = 0; $i < count($liststats); $i++) {
                $listtotalcalls += $liststats[$i]['calls'];
                $list_id_stats[$i]['list_id'] = $liststats[$i]['list_id'];
                $list_id_stats[$i]['calls'] = $liststats[$i]['calls'];
            }
            for ($i = 0; $i < count($hangupstats); $i++) {
                $hanguptotalcalls += $hangupstats[$i]['calls'];
                $call_hangup_stats[$i]['term_reason'] = $hangupstats[$i]['term_reason'];
                $call_hangup_stats[$i]['calls'] = $hangupstats[$i]['calls'];
            }

            $agent_preset['userlisttotalcalls'] = $userlisttotalcalls;
            $custom_stats['statuscattotalcalls'] = $statuscattotalcalls;
            $list_id_stats['listtotalcalls'] = $listtotalcalls;
            $call_hangup_stats['hanguptotalcalls'] = $hanguptotalcalls;


            $statusstatsarray = array();
            $statusstatsinfoarray = array();
            $statusstatstotalcalls = 0;
            $statustotaltime = 0;
            $totalstatusrate = 0;
            $totalagentrate = 0;
            $finalstatusdetails = array();

            for ($i = 0; $i < count($statusstats); $i++) {
                if (($statusstats[$i]['status'] == 'DROP') && ($rollstatus == "YES")) {
                    
                } else {
                    array_push($statusstatsinfoarray, $statusstats[$i]['status']);
                }
            }
            if ($rollstatus == "YES") {
                for ($i = 0; $i < count($rollover_calls); $i++) {
                    array_push($statusstatsinfoarray, $rollover_calls[$i]['status']);
                }
            }

            $statusdetails1 = VicidialCampaignStatuses::whereIn('status',$statusstatsinfoarray)
            									->select(DB::raw('status_name,category,status'))
            									->get();

            
            $statusdetails2 = VicidialStatuses::whereIn('status',$statusstatsinfoarray)
									 ->select(DB::raw('status_name,category,status'))
									 ->get();

           	$maxstatusstatsarray = array();
            $maxstatustotalavg = array();
            $maxstatustotalrate = array();
            $maxstatustotalstatusrate = array();

            $rescarr = [];
            foreach($statusdetails1 as $key => $rows){
            	array_push($rescarr, $rows['status']);
	        }

	        $ressarr = [];
            foreach($statusdetails2 as $key => $rows){
            	array_push($ressarr, $rows['status']);
	        }

	        $callsdesc = $statusstats->sortByDesc('calls');
	        $totaldesc = $statusstats->sortByDesc('total_length');


            $smax = 0;
            $armax = 0;
            $srmax = 0;
            $call_status_stat = [];
            $stat1 = ""; $stat2 = ""; $stat3 = ""; $stat4 = ""; $stat5 = "";

            for ($i = 0; $i < count($statusstats); $i++) 
            {
                $statusinfo = '';
                $key = "";
                $key = array_search($statusstats[$i]['status'], $rescarr);
                
                if ($key != "") {
                    $statusinfo = $statusdetails1[$key]['status_name']."-".$statusdetails1[$key]['category'];
                }
                if ($statusinfo == '') {
                    $key = array_search($statusstats[$i]['status'], $ressarr);
                    if ("$key" != "") {
                        $statusinfo = $statusdetails2[$key]['status_name']."-".$statusdetails2[$key]['category'];
                    }
                }
                if (($statusstats[$i]['status'] == 'DROP') && ($rollstatus == "YES")) {
                    
                } else {
                    
                    $statusstatstotalcalls += $statusstats[$i]['calls'];
                    $statustotaltime += $statusstats[$i]['total_length'];
                    $statusavg_sec = 0;
                    if($statusstats[$i]['calls']>0){
						$statusavg_sec = ($statusstats[$i]['total_length'] / $statusstats[$i]['calls']);
					}
                    
                    if ($agentsec < 1) { $agentsec = 1; }
                    $agentrate = $statusstats[$i]['calls'] / ($agentsec / 3600);
                    $agentrate = sprintf("%.2f", $agentrate);
                    if($totalsec>0){
                    	$statusrate = $statusstats[$i]['calls'] / ($totalsec / 3600);
                    }
                    $totalstatusrate+=$statusrate;
                    $totalagentrate+=$agentrate;

                    $singlearray = array('status' => $statusstats[$i]['status']."-".$statusinfo, 'calls' => $statusstats[$i]['calls'], 'status_hours' => $this->secConvert($statusstats[$i]['total_length'], 'H'), 'stats_avg_hours' => $this->secConvert($statusavg_sec, 'H'), 'statusrate' => number_format((float)$statusrate, 2, '.', ''), 'agentrate' => $agentrate);

		            array_push($maxstatustotalavg, $statusavg_sec);
		            array_push($maxstatustotalrate, $agentrate);
		            array_push($maxstatustotalstatusrate, $statusrate);
		            array_push($statusstatsarray, $singlearray);

                }
            }

            $maxstatustotalavgcount = '';
            if (count($maxstatustotalavg) > 0) { $maxstatustotalavgcount = max($maxstatustotalavg); } else { $maxstatustotalavgcount = 0; }

            $maxstatustotalavgcount = round($this->secConvert($maxstatustotalavgcount, 'S'));


            $maxstatustotalratecount = '';
            if (count($maxstatustotalrate) > 0) { $maxstatustotalratecount = max($maxstatustotalrate); } else { $maxstatustotalratecount = 0; }

            $maxstatustotalratecount = $maxstatustotalratecount;


            $maxstatustotalstatusratecount = '';
            if (count($maxstatustotalstatusrate) > 0) { $maxstatustotalstatusratecount = max($maxstatustotalstatusrate); } else { $maxstatustotalstatusratecount = 0; }

            $maxstatustotalstatusratecount = $maxstatustotalstatusratecount;

            if ($rollstatus == "YES") {
            	$callsdesc = $rollover_calls->sortByDesc('calls');
            	$totaldesc = $rollover_calls->sortByDesc('total_length');

                for ($i = 0; $i < count($rollover_calls); $i++) {
                    if ($rollover_calls[$i]['calls'] > 0) {
                        $key = "";
                        $key = array_search($rollover_calls[$i]['status'], $rescarr);
                        if ($key != "") {
                            $statusinfo = $statusdetails1[$key]['status_name']."-".$statusdetails1[$key]['category'];
                        }
                        if ($statusinfo == '') {
                            $key = array_search($rollover_calls[$i]['status'], $ressarr);
                            if ($key != "") {
                                $statusinfo = $statusdetails2[$key]['status_name']."-".$statusdetails2[$key]['category'];
                            }
                        }

                        $statusstatstotalcalls += $rollover_calls[$i]['calls'];
                        $statustotaltime += $rollover_calls[$i]['total_length'];
                        $statusavg_sec = 0;
                        if($rollover_calls[$i]['calls']>0){
							$statusavg_sec = ($rollover_calls[$i]['total_length'] / $rollover_calls[$i]['calls']);
						}

                        if($agentsec>0){
                        	$agentrate = ($rollover_calls[$i]['calls'] / ($agentsec / 3600) );
                        }
                        
                        $agentrate = sprintf("%.2f", $agentrate);

                        $statusrate = 0;
                        if($totalsec>0){
                        	$statusrate = ($rollover_calls[$i]['calls'] / ($totalsec / 3600) );
                        }
                        
                        $totalstatusrate+=$statusrate;
                        $totalagentrate+=$agentrate;

                        $call_status_stat[$i]['status'] = $statusstats[$i]['status'].'-'.$statusinfo;
                        $call_status_stat[$i]['calls'] = $statusstats[$i]['calls'];
                        $call_status_stat[$i]['total_length'] = $this->secConvert($statusstats[$i]['total_length'], 'H');
                        $call_status_stat[$i]['statusavg_sec'] = $this->secConvert($statusavg_sec, 'H');
                        $call_status_stat[$i]['statusrate'] = number_format($statusrate, 2);
                        $call_status_stat[$i]['agentrate'] = $agentrate;

                        $singlearray = array('status' => $rollover_calls[$i]['status']."-".$statusinfo, 'calls' => $rollover_calls[$i]['calls'], 'status_hours' => $this->secConvert($rollover_calls[$i]['total_length'], 'H'), 'stats_avg_hours' => $this->secConvert($statusavg_sec, 'H'), 'statusrate' => $statusrate, 'agentrate' => $agentrate);

                        array_push($statusstatsarray, $singlearray);
                    }
                }
            }

            $call_status_stat['statusstatsarray'] = $statusstatsarray;
            $call_status_stat['callsdesc'] = $callsdesc;
            $call_status_stat['totaldesc'] = $totaldesc;

            $statusavgsec = '';

            if ($statusstatstotalcalls > 0) { $statusavgsec = $statustotaltime / $statusstatstotalcalls; } else { $statusavgsec = 0; }

            if ($reportdisplaytype == "HTML") {

            	$call_status_stat['statusstatstotalcalls'] = $statusstatstotalcalls;
            	$call_status_stat['stat2'] = $stat2;
            	$call_status_stat['statustotaltime'] = $this->secConvert($statustotaltime, 'H');
            } else {

            	$call_status_stat['statusstatstotalcalls'] = $statusstatstotalcalls;
            	$call_status_stat['statustotaltime'] = $this->secConvert($statustotaltime, 'H');
            	$call_status_stat['statusavgsec'] = $this->secConvert($statusavgsec, 'H');
            	$call_status_stat['totalstatusrate'] = number_format($totalstatusrate, 2);
            	$call_status_stat['totalagentrate'] = $totalagentrate;
            }
            $singlearray = array('status' => 'TOTAL', 'calls' => $statusstatstotalcalls, 'status_hours' => $this->secConvert($statustotaltime, 'H'), 'stats_avg_hours' => $this->secConvert($statusavgsec, 'H'), 'statusrate' => $totalstatusrate, 'agentrate' => $totalagentrate);
            array_push($statusstatsarray, $singlearray);

            $total_na_calls = ($auto_na_calls[0]['calls'] + $manual_na_calls[0]['calls']);
            $total_na_callspercent = round($this->MathZDC($total_na_calls, $total_calls_count) * 100, 2);
            $auto_na_callscount = $auto_na_calls[0]['calls'];
            $manual_na_callscount = $manual_na_calls[0]['calls'];

            $tot_nacalllength = ($auto_na_calls[0]['total_length'] + $manual_na_calls[0]['total_length']);

            $avglength = round($this->getDivision($manual_na_calls[0]['total_length'], $manual_na_calls[0]['calls']), 2);
            $na_calls_info['total_na_calls'] = $total_na_calls;
            $na_calls_info['total_na_callspercent'] = $total_na_callspercent;
            $na_calls_info['auto_na_calls'] = $auto_na_callscount;
            $na_calls_info['manual_na_calls'] = $manual_na_callscount;
            $na_calls_info['tot_nacalllength'] = $tot_nacalllength;
            $na_calls_info['avglength'] = $avglength;

            $bottom_graph = ['header' => $bottom_tab_header_array, 'data' => array_chunk($bottom_tab_data_array, 4)];

            date_default_timezone_set('America/Los_Angeles');
            $hanguparray = $userlistarray = $statuscatarray = $agentsarray = $maxagentarraycount = $maxhanguparraycount = $maxliststatsarraycount = $maxstatusstatsarraycount = $maxuserlistarraycount = $maxtotagentarraycount = $maxavgagentarraycount = [];

        	return response()->json([
                'status'=>200,    
                'message' => 'Successfully.',
                'data'=>array("agent_preset" => $agent_preset, 'custom_stats' => $custom_stats, 'agent_statastics' => $agent_statastics, 'list_id_stats' => $list_id_stats, 'call_hangup_stats' => $call_hangup_stats, 'call_status_stat' => $call_status_stat, "total_callsinfo" => $total_callsinfo, "human_answered" => $human_answered, "drop_details" => $drop_details, 'na_calls_info' => $na_calls_info,
                "hangupstats" => $hanguparray, "statusstats" => $statusstatsarray, "userlist" => $userlistarray
                , "statuscatstats" => $statuscatarray, 'agentstats' => $agentsarray, 'timebottomstats' => $timebottomstats, 'maxagentarraycount' => $maxagentarraycount,
                'maxhanguparraycount' => $maxhanguparraycount, 'maxliststatsarraycount' => $maxliststatsarraycount, 'maxstatusstatsarray' => $maxstatusstatsarraycount,
                'maxstatustotalavgcount' => $maxstatustotalavgcount, 'maxuserlistarraycount' => $maxuserlistarraycount,
                'maxtotagentarraycount' => $maxtotagentarraycount, 'maxavgagentarraycount' => $maxavgagentarraycount, 'maxstatustotalratecount' => $maxstatustotalratecount, 'maxstatustotalstatusratecount' => $maxstatustotalstatusratecount,
                'startdate' => $startdate, 'enddate' => $enddate, 'bottom_graph' => $bottom_graph, 'nowtime' => date("Y-m-d H:i:s"))
            ]);
            
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.outbound_calling_report'), $e);
            throw $e;
        }
    }

    public function sortMultiArray($a, $b) {
	    if ($a['status'] == $b['status']) {
	        return $a['age'] - $b['age'];
	    }
	    return strcmp($a['status'], $b['status']);
	}

    public function MathZDC($dividend, $divisor, $quotient = 0)
    {
        if ($divisor == 0) {
            return $quotient;
        } else if ($dividend == 0) {
            return 0;
        } else {
            return ($dividend / $divisor);
        }
    }

    public function secConvert($sec, $precision)
        {
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
                    if (($sec < 3600) and ( $precision != 'S')) {
                        $precision = 'H';
                    }
                }
                if ($precision == 'H') {
                    $fhours_h = ($sec / 3600);
                    $fhours_h_int = floor($fhours_h);
                    $fhours_h_int = intval("$fhours_h_int");
                    $fhours_h_int = ($fhours_h_int < 10) ? "0$fhours_h_int" : $fhours_h_int;
                    $fhours_m = ($fhours_h - $fhours_h_int);
                    $fhours_m = ($fhours_m * 60);
                    $fhours_m_int = floor($fhours_m);
                    $fhours_m_int = intval("$fhours_m_int");
                    $fhours_s = ($fhours_m - $fhours_m_int);
                    $fhours_s = ($fhours_s * 60);
                    $fhours_s = round($fhours_s, 0);
                    if ($fhours_s < 10) {
                        $fhours_s = "0$fhours_s";
                    }
                    if ($fhours_m_int < 10) {
                        $fhours_m_int = "0$fhours_m_int";
                    }
                    $ftime = "$fhours_h_int:$fhours_m_int:$fhours_s";
                }
                if ($precision == 'M') {
                    $fminutes_m = ($sec / 60);
                    $fminutes_m_int = floor($fminutes_m);
                    $fminutes_m_int = intval("$fminutes_m_int");
                    $fminutes_s = ($fminutes_m - $fminutes_m_int);
                    $fminutes_s = ($fminutes_s * 60);
                    $fminutes_s = round($fminutes_s, 0);
                    if ($fminutes_s < 10) {
                        $fminutes_s = "0$fminutes_s";
                    }
                    $ftime = "$fminutes_m_int:$fminutes_s";
                }
                if ($precision == 'S') {
                    $ftime = $sec;
                }
                return "$ftime";
            }
        }

    public function getDivision($part, $whole)
    {
        if ($whole != 0) {
            if ($part != 0) {
                return ($part / $whole);
            } else return 0;
        } else return 0;
    }

    public function setTimeBegin($shift, $startdate, $enddate)
    {
    	$query_date_begin = $query_date_end = $time_begin = $time_end = $am_shift_begin = $am_shift_end = $pm_shift_begin = $pm_shift_end = '';
        if ($shift == 'AM') {
            $time_begin = $am_shift_begin;
            $time_end = $am_shift_end;
            if (strlen($time_begin) < 6) { $time_begin = "03:45:00"; }
            if (strlen($time_end) < 6) { $time_end = "17:45:00"; }
        }
        if ($shift == 'PM') {
            $time_begin = $pm_shift_begin;
            $time_end = $pm_shift_end;
            if (strlen($time_begin) < 6) { $time_begin = "17:45:01"; }
            if (strlen($time_end) < 6) { $time_end = "23:59:59"; }
        }
        if ($shift == 'ALL') {
            if (strlen($time_begin) < 6) { $time_begin = "00:00:00"; }
            if (strlen($time_end) < 6) { $time_end = "23:59:59"; }
        }
        $query_date_begin = $startdate." ".$time_begin;
        $query_date_end = $enddate." ".$time_end;

        return(array('query_date_begin' => $query_date_begin, 'query_date_end' => $query_date_end));
    }


    public function outboundSummaryIntervalReport(Request $request) {
        try{

            ini_set("memory_limit", "1000M");

            // if (isset($request['selected_groups'])) {
            //     $request['selected_groups'] = $this->getAcceptValue(ACCESS_TYPE_CAMPAIGN, $request['selected_groups'], ACCESS_READ, RETURN_ALL_SELECTOR, NOT_ALLOW_NULL);
            // }
//------------------------- Error --------------------------------
            // {
            //     "status": 500,
            //     "msg": "Class 'App\\Traits\\ClassRegistry' not found"
            // }


            $shift = $request['shift'];
            $startdate = date("Y-m-d", strtotime($request['startdate']));

            $enddate = date("Y-m-d", strtotime($request['enddate']));

            $selectedgroups = $request['selectedgroups'];
            $include_rollover = $request['include_rollover'];
            $timeinterval = $request['timeinterval'];

            $userlist = VicidialUser::get(['user_id','user_group']);
            
            $userlist = $userlist->unique('user_group');
            
            $viewablegrouplist = VicidialUserGroup::whereIn('user_group', $userlist)->get(['allowed_campaigns'])->toArray();

            array_push($viewablegrouplist, ['---ALL---']);
            $allowcampiagnarray = $list = $listy = $finalallow = array();


            foreach ($viewablegrouplist as $key => $value) {
                foreach ($value as $key_1 => $value1) {
                    if ($key_1 == 'allowed_campaigns') {
                        $allowcampaign = $value1;
                        array_push($allowcampiagnarray, $allowcampaign);
                    }
                }
            }


            $allowcampiagnarray = array_unique($allowcampiagnarray);

            $allowcampiagnarray = array_values($allowcampiagnarray);

            foreach ($allowcampiagnarray as $value) {
                $arra = explode(' ', $value);
                for ($j = 0; $j < count($arra); $j++) {
                    $allowarr = $arra[$j];
                    array_push($finalallow, $allowarr);
                }   
            }

            $finalallow = array_unique($finalallow);         

            $list = VicidialCampaign::get(['campaign_id'])->toArray();

            $allcam = array();
            foreach ($list as $row_key => $rows) {
                foreach ($rows as $key => $value) {
                    array_push($allcam, $value);
                }
            }

            if (in_array('--ALL--', $selectedgroups)) {
                $campaignslistingall = $allcam;
                $selectedgroups = $allcam;
            } else {
                $campaignslistingall = $selectedgroups;
            }

            $group_string = '|';
            $i = 0;
            $group_ct = count($campaignslistingall);
            while ($i < $group_ct) {
                $group_string .= "$campaignslistingall[$i]|";
                $i++;
            }

            $query_date_begin = "$startdate 00:00:00";
            $query_date_end = "$enddate 23:59:59";

            $gct_default_start = isset($gct_default_start) ? $gct_default_start:'';
            $gct_default_stop = isset($gct_default_stop) ? $gct_default_stop:'';

            $ctstart = $gct_default_start."00";
            $ctstop = $gct_default_stop."59";


            if ($shift == 'ALL') {
                $gct_default_start = "0";
                $gct_default_stop = "2400";
            } else {
                $shiftdata = VicidialCallTime::where('call_time_id',$shift)->get(['ct_default_start','ct_default_stop']);
                if ($shiftdata->count() > 0) {
                    $gct_default_start = $shiftdata[0]['ct_default_start'];
                    $gct_default_stop = $shiftdata[0]['ct_default_stop'];
                } else {
                    $gct_default_start = "0";
                    $gct_default_stop = "2400";
                }
            }

            $campaign_wise_details = $hcalltime_hhmm = []; 
            $hf = $interval_count = $h_test = '';
            for ($i = 0; $i < count($campaign_wise_details); $i++) {
                $campaign_wise_details[$i]['campaign_name'] = $groupnamearray[$i];
            }

            if ($timeinterval <= 900) {
                $interval_count = 96;
                $hf = 45;
            }
            if (($timeinterval > 900) and ( $timeinterval <= 1800)) {
                $interval_count = 48;
                $hf = 30;
            }
            if ($timeinterval > 1800) {
                $interval_count = 24;
            }


            $h = 0;
            $hh = 0;
            $hcalltime = [];
            while ($h < $interval_count) {
                if ($interval_count >= 96) {
                    if ($hf < 45) {
                        $hf = ($hf + 15);
                    } else {
                        $hf = "00";
                        if ($h > 0) {
                            $hh++;
                        }
                    }
                    $h_test = "$hh$hf";
                }
                if ($interval_count == 48) {
                    if ($hf < 30) {
                        $hf = ($hf + 30);
                    } else {
                        $hf = "00";
                        if ($h > 0) {
                            $hh++;
                        }
                    }
                    $h_test = "$hh$hf";
                }
                if ($interval_count <= 24) {
                    $h_test = $h."00";
                }
                if (($h_test >= $gct_default_start) and ( $h_test <= $gct_default_stop)) {
                    $hcalltime[$h] = isset($hcalltime[$h]) ? $hcalltime[$h] : '';
                    $hcalltime[$h] ++;
                    $hcalltime_hhmm[$h] = "$h_test";
                }
                $h++;
            }

            if ($selectedgroups) {
                if (count($selectedgroups) > 0) {
                    $campaign_wise_details = $this->getDetailsByCampaignId($selectedgroups, $startdate, $enddate, $gct_default_start, $gct_default_stop, $include_rollover, $timeinterval);

                    
                    $intervalcampaign_wise_details = $this->getDetailsByIntervalCampaignId($interval_count, $hcalltime_hhmm, $selectedgroups, $startdate, $enddate, $gct_default_start, $gct_default_stop, $include_rollover, $timeinterval);
                }
            }

            $allsubgraph = array();
            $i = $h = 0;
            $z = 0;
            while ($i < count($intervalcampaign_wise_details)) {
                $h = 0;
                $z = 0;
                while ($h < $interval_count) {
                    if (isset($hcalltime[$h]) && $hcalltime[$h] > 0) {

                        $intervalcampaign_wise_details[$i]['intervalcalls'][$h] = isset($intervalcampaign_wise_details[$i]['intervalcalls'][$h])?$intervalcampaign_wise_details[$i]['intervalcalls'][$h]:'';
                        if (strlen($intervalcampaign_wise_details[$i]['intervalcalls'][$h]) < 1) {
                            $hcalls_count[$h] = 0;
                        } else {
                            $hcalls_count[$h] = $intervalcampaign_wise_details[$i]['intervalcalls'][$h];
                        }

                        $intervalcampaign_wise_details[$i]['hsystem_count'][$h] = isset($intervalcampaign_wise_details[$i]['hsystem_count'][$h])?$intervalcampaign_wise_details[$i]['hsystem_count'][$h]:'';
                        if (strlen($intervalcampaign_wise_details[$i]['hsystem_count'][$h]) < 1) {
                            $hsystem_count[$h] = 0;
                        } else {
                            $hsystem_count[$h] = $intervalcampaign_wise_details[$i]['hsystem_count'][$h];
                        }


                        $intervalcampaign_wise_details[$i]['hagent_count'][$h] = isset($intervalcampaign_wise_details[$i]['hagent_count'][$h])?$intervalcampaign_wise_details[$i]['hagent_count'][$h]:'';
                        if (strlen($intervalcampaign_wise_details[$i]['hagent_count'][$h]) < 1) {
                            $hagent_count[$h] = 0;
                        } else {
                            $hagent_count[$h] = $intervalcampaign_wise_details[$i]['hagent_count'][$h];
                        }

                        $intervalcampaign_wise_details[$i]['hptp_count'][$h] = isset($intervalcampaign_wise_details[$i]['hptp_count'][$h])?$intervalcampaign_wise_details[$i]['hptp_count'][$h]:'';
                        if (strlen($intervalcampaign_wise_details[$i]['hptp_count'][$h]) < 1) {
                            $hptp_count[$h] = 0;
                        } else {
                            $hptp_count[$h] = $intervalcampaign_wise_details[$i]['hptp_count'][$h];
                        }

                        $intervalcampaign_wise_details[$i]['hrtp_count'][$h] = isset($intervalcampaign_wise_details[$i]['hrtp_count'][$h])?$intervalcampaign_wise_details[$i]['hrtp_count'][$h]:'';
                        if (strlen($intervalcampaign_wise_details[$i]['hrtp_count'][$h]) < 1) {
                            $hrtp_count[$h] = 0;
                        } else {
                            $hrtp_count[$h] = $intervalcampaign_wise_details[$i]['hrtp_count'][$h];
                        }


                        $intervalcampaign_wise_details[$i]['hna_count'][$h] = isset($intervalcampaign_wise_details[$i]['hna_count'][$h])?$intervalcampaign_wise_details[$i]['hna_count'][$h]:'';
                        if (strlen($intervalcampaign_wise_details[$i]['hna_count'][$h]) < 1) {
                            $hna_count[$h] = 0;
                        } else {
                            $hna_count[$h] = $intervalcampaign_wise_details[$i]['hna_count'][$h];
                        }


                        $intervalcampaign_wise_details[$i]['hdrop_count'][$h] = isset($intervalcampaign_wise_details[$i]['hdrop_count'][$h])?$intervalcampaign_wise_details[$i]['hdrop_count'][$h]:'';
                        if (strlen($intervalcampaign_wise_details[$i]['hdrop_count'][$h]) < 1) {
                            $hdrop_count[$h] = 0;
                        } else {
                            $hdrop_count[$h] = $intervalcampaign_wise_details[$i]['hdrop_count'][$h];
                        }


                        $intervalcampaign_wise_details[$i]['hagent_sec'][$h] = isset($intervalcampaign_wise_details[$i]['hagent_sec'][$h])?$intervalcampaign_wise_details[$i]['hagent_sec'][$h]:'';
                        if (strlen($intervalcampaign_wise_details[$i]['hagent_sec'][$h]) < 1) {
                            $hagent_sec[$h] = 0;
                        } else {
                            $hagent_sec[$h] = $intervalcampaign_wise_details[$i]['hagent_sec'][$h];
                        }

                        $intervalcampaign_wise_details[$i]['hpause_sec'][$h] = isset($intervalcampaign_wise_details[$i]['hpause_sec'][$h])?$intervalcampaign_wise_details[$i]['hpause_sec'][$h]:'';
                        if (strlen($intervalcampaign_wise_details[$i]['hpause_sec'][$h]) < 1) {
                            $hpause_sec[$h] = 0;
                        } else {
                            $hpause_sec[$h] = $intervalcampaign_wise_details[$i]['hpause_sec'][$h];
                        }


                        $hcalls_count[$h] = isset($hcalls_count[$h])?$hcalls_count[$h]:0;
                        $hna_count[$h] = isset($hna_count[$h])?$hna_count[$h]:0;

                        if (($hcalls_count[$h] < 1) || ($hna_count[$h] < 1)) {
                            $hna_percent = 0.00;
                        } else {
                            $hna_percent = $this->calculatePercentage($hna_count[$h], $hcalls_count[$h]);
                        }


                        $hdrop_count[$h] = isset($hdrop_count[$h])?$hdrop_count[$h]:0;
                        if (($hcalls_count[$h] < 1) || ($hdrop_count[$h] < 1)) {
                            $h_drop_percent = 0.00;
                        } else {
                            $h_drop_percent = $this->calculatePercentage($hdrop_count[$h], $hcalls_count[$h]);
                        }

                        $hagent_sec1[$h] = $this->secConvert($hagent_sec[$h], 'H');
                        $hpause_sec1[$h] = $this->secConvert($hpause_sec[$h], 'H');
                        $sub_graph_stats[$i][$z][0] = "$hcalltime_hhmm[$h]";
                        $sub_graph_stats[$i][$z][1] = $hcalls_count[$h];
                        $sub_graph_stats[$i][$z][2] = $hsystem_count[$h];
                        $sub_graph_stats[$i][$z][3] = $hagent_count[$h];
                        $sub_graph_stats[$i][$z][4] = $hptp_count[$h];
                        $sub_graph_stats[$i][$z][5] = $hrtp_count[$h];
                        $sub_graph_stats[$i][$z][6] = $hna_percent;
                        $sub_graph_stats[$i][$z][7] = $h_drop_percent;
                        $sub_graph_stats[$i][$z][8] = $hagent_sec[$h];
                        $sub_graph_stats[$i][$z][9] = $hpause_sec[$h];
                        $sub_graph_stats[$i][$z][10] = $hagent_sec1[$h];
                        $sub_graph_stats[$i][$z][11] = $hpause_sec1[$h];
                        $z++;
                    } else {
                        $hcalls_count[$h] = 0;
                        $hsystem_count[$h] = 0;
                        $hagent_count[$h] = 0;
                        $hptp_count[$h] = 0;
                        $hrtp_count[$h] = 0;
                    }

                    $h++;
                }
                $i++;
            }

            $totalcampaigns = count($campaign_wise_details);
            $loginagentt_secarray = array();
            $totalagentpausetime = 0;
            $loginagent_sectime = $loginagentt_sec = $pauselogin_sec = $naansarray = $totalcalls = $totalsystemcalls = $totalagentscalls = $totalsalecallsarray = $totaldnccallsarray = $gna_percent = $gdroppercent = $totaldrop = 0;
            for ($i = 0; $i < count($campaign_wise_details); $i++) {
                $totalcalls += $campaign_wise_details[$i]['totalcallevents'];
                $totalsystemcalls += $campaign_wise_details[$i]['totalsystemcalls'];
                $totaldrop += $campaign_wise_details[$i]['totaldrop'];
                $totalagentscalls += $campaign_wise_details[$i]['totalagentscalls'];
                $totalsalecallsarray += $campaign_wise_details[$i]['totalsalecallsarray'];
                $totaldnccallsarray += $campaign_wise_details[$i]['totaldnccallsarray'];
                $naansarray += $campaign_wise_details[$i]['naansarray'];
                $pauselogin_sec += $campaign_wise_details[$i]['pauselogin_sec'];
                $totalagentpausetime = $totalagentpausetime + $campaign_wise_details[$i]['pauselogin_sec'];
                $loginagentt_sec += $campaign_wise_details[$i]['loginagentt_sec'];
                $loginagent_sectime = $loginagent_sectime + $campaign_wise_details[$i]['loginagentt_sec'];
                array_push($loginagentt_secarray, $loginagentt_sec);
            }

            $max_level = max($loginagentt_secarray);
            // NA ANSWER %
            if (($totalcalls < 1 || $naansarray < 1)) {
                $gtotalnapercent = 0;
            } else {
                $gtotalnapercent1 = $this->getDivision($naansarray, $totalcalls);
                $gtotalnapercent = round(($gtotalnapercent1 * 100), 2);
            }
            // ANSWER END
            // DROP %
            if (($totalcalls < 1 || $totaldrop < 1)) {
                $gtotaldroppercent = 0;
            } else {
                $gtotaldroppercent1 = $this->getDivision($totaldrop, $totalcalls);
                $gtotaldroppercent = round(($gtotaldroppercent1 * 100), 2);
            }
            // DROP END
            //pause agent sec
            $totalpauseagent_sec = $this->secConvert($pauselogin_sec, 'H');
            $totalagentpausetimeall = $this->secConvert($totalagentpausetime, 'H');
            //login agent sec

            $totalloginagent_sec = $this->secConvert($loginagentt_sec, 'H');
            $loginagent_sectimeall = $this->secConvert($loginagent_sectime, 'H');

            // campaign name
            $campaign_wise_detailss = $groupnamearray = array();
            for ($i = 0; $i < count($campaign_wise_details); $i++) {
                
                $Grouplist = VicidialCampaigns::whereIn('campaign_id', [$campaign_wise_details[$i]['campaign_id']])->get(['campaign_name'])->toArray();
                array_push($campaign_wise_detailss, $Grouplist);
            }

            foreach ($campaign_wise_detailss as $key => $value) {
                foreach ($value as $key_1 => $value_1) {
                    $group_name = $value_1;
                }
                array_push($groupnamearray, $group_name);
            }

            for ($i = 0; $i < count($campaign_wise_details); $i++) {
                $campaign_wise_details[$i]['campaign_name'] = $groupnamearray[$i];
            }
            $ivrarrayall = $ivrarray = array();
            foreach ($campaign_wise_details as $key =>$value) {
                foreach ($value as $ke => $val) {
                    if ($ke == 'totalcallevents') {
                        $value = $val;
                        array_push($ivrarray, $value);
                    }
                }
            }

            $maxiver = max($ivrarray);
            $datetime = $startdate ." ". date('H:i:s');

            $sub_graph_stats = isset($sub_graph_stats)?$sub_graph_stats:[];
            
            $result = array(
                'maxiver' => $max_level,
                'group_string' => $group_string,
                "datetime" => $datetime,
                "sub_graph_stats" => $sub_graph_stats,
                "totalloginagent_sec" => $totalloginagent_sec,
                "totalpauseagent_sec" => $totalpauseagent_sec,
                "gtotaldroppercent" => $gtotaldroppercent,
                "gtotalnapercent" => $gtotalnapercent,
                "totaldnccallsarray" => $totaldnccallsarray,
                "totalsalecallsarray" => $totalsalecallsarray,
                "totalcalls" => $totalcalls,
                "totalsystemcalls" => $totalsystemcalls,
                "totalagentscalls" => $totalagentscalls,
                "campaign_wise_details" => $campaign_wise_details,
                "totalcampaigns" => $totalcampaigns,
                "totalagentlogintime" => $loginagent_sectimeall,
                "totalagentpausetime" => $totalagentpausetimeall
            );
            
            $download_csv = $request->input('download_csv');
            if($download_csv == 'yes'){   # for download csv file .
                return $result;
            }
            
            return response()->json([
                'status'=>200,    
                'message' => 'Successfully.',
                'maxiver' => $max_level,
                'group_string' => $group_string,
                "datetime" => $datetime,
                "sub_graph_stats" => $sub_graph_stats,
                "totalloginagent_sec" => $totalloginagent_sec,
                "totalpauseagent_sec" => $totalpauseagent_sec,
                "gtotaldroppercent" => $gtotaldroppercent,
                "gtotalnapercent" => $gtotalnapercent,
                "totaldnccallsarray" => $totaldnccallsarray,
                "totalsalecallsarray" => $totalsalecallsarray,
                "totalcalls" => $totalcalls,
                "totalsystemcalls" => $totalsystemcalls,
                "totalagentscalls" => $totalagentscalls,
                "campaign_wise_details" => $campaign_wise_details,
                "totalcampaigns" => $totalcampaigns,
                "totalagentlogintime" => $loginagent_sectimeall,
                "totalagentpausetime" => $totalagentpausetimeall
            ]);
            
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.outbound_summary_interval_report'), $e);
            throw $e;
        }
    }

    public function calculatePercentage($part, $whole)
    {
        if ($whole != 0) {
            if ($part != 0) {

                $percentage = $part * 100;
                $percentage = $percentage / $whole;
                return round($percentage);
            } else return 0;
        } else return 0;
    }

    public function getDetailsByIntervalCampaignId($interval_count, $hcalltime_hhmm, $campaignIdList, $startdate, $enddate, $gct_default_start, $gct_default_stop, $include_rollover, $timeinterval)
    {
        $mt = [];
        $returndetailsintervalcampaignwise = array();
        $query_date_begin = "$startdate 00:00:00";
        $query_date_end = "$enddate 23:59:59";
        $ctstart = $gct_default_start."00";
        $ctstop = $gct_default_stop."59";
        $hcalls_count = $mt;
        $hcalls_count_in = $mt;
        $hdrop_count = $mt;
        $hdrop_count_out = $mt;
        $hsystem_count = $mt;
        $hagent_count = $mt;
        $hptp_count = $mt;
        $hrtp_count = $mt;
        $hna_count = $mt;
        $hanswer_count = $mt;
        $statusarray = array(
            'NA',
            'NEW',
            'QUEUE',
            'INCALL',
            'DROP',
            'XDROP',
            'AA',
            'AM',
            'AL',
            'AFAX',
            'AB',
            'ADC',
            'DNCL',
            'DNCC',
            'PU',
            'PM',
            'SVYEXT',
            'SVYHU',
            'SVYVM',
            'SVYREC',
            'QVMAIL'
        );

        $userlist = VicidialUser::get(['user_group'])->unique('user_group');
        
        $viewablegrouplist = VicidialUserGroup::whereIn('user_group', $userlist)->get(['allowed_campaigns'])->toArray();

        array_push($viewablegrouplist, ['---ALL---']);
        $allowcampiagnarray = $list = $listy = $finalallow = array();


        foreach ($viewablegrouplist as $key => $value) {
            foreach ($value as $key_1 => $value1) {
                if ($key_1 == 'allowed_campaigns') {
                    $allowcampaign = $value1;
                    array_push($allowcampiagnarray, $allowcampaign);
                }
            }
        }

        $allowcampiagnarray = array_unique($allowcampiagnarray);
        $allowcampiagnarray = array_values($allowcampiagnarray);


        for ($i = 0; $i < count($allowcampiagnarray); $i++) {
            $arra = explode(' ', $allowcampiagnarray[$i]);
            for ($j = 0; $j < count($arra); $j++) {
                $allowarr = $arra[$j];
                array_push($finalallow, $allowarr);
            }
        }
        $finalallow = array_unique($finalallow);
        $finalallow = array_values($finalallow);

        $list = VicidialCampaign::whereIn('campaign_id', $finalallow)->orderBy('campaign_id')->get(['campaign_id'])->toArray();

        $allcam = array();
        foreach ($list as $key => $rows) {
            foreach ($rows as $ke => $value) {
                array_push($allcam, $value);
            }
        }

        if (in_array('--ALL--', $campaignIdList)) {
            $campaignslistingall = $allcam;
        } else {
            $campaignslistingall = $campaignIdList;
        }

        foreach ($campaignslistingall as $key => $campaign) {

            $totaloutboundlogdetails = VicidialLog::whereIn('campaign_id',[$campaign])
                                                    ->whereBetween('call_date',[$query_date_begin,$query_date_end])
                                                    ->get(['status', 'length_in_sec', 'call_date', 'call_date AS event_time', 'phone_number', 'campaign_id', 'uniqueid', 'lead_id'])->toArray();

            
            $totaloutboundcall = $hourarray = $testarray = array();
            $i = 0;

            foreach ($totaloutboundlogdetails as $key_11 => $li) {
                $testarray[$i] = 0;
                $call_date = [];
                foreach ($li as $key => $value) {
                    if ($key == 'call_date') {
                        $call_date = explode(" ", $value);
                    }
                }

                $time = $call_date[1];
                $time1 = explode(":", $time);
                $call_time = preg_replace('/[^0-9]/', '', $call_date[1]);
                if (($call_time > $ctstart) && ($call_time < $ctstop)) {
                    $time = $call_date[1];
                    $time1 = explode(":", $time);
                    array_push($hourarray, $time1[0]);
                    array_push($totaloutboundcall, $call_time);
                    $testarray[$i] = $time1[0];
                }
                $i++;
            }

            $hrarray = array();
            foreach ($hcalltime_hhmm as $key => $value) {
                $hour = $value;
                array_push($hrarray, $hour);
            }

            $finaltotalcallperhour = $finalehourarray1 = array();
            //total call per hour for group
            $totalhourlycalls = array_count_values($hourarray);
            
            $u = $p = 0;
            while ($p < count($totaloutboundlogdetails)) {

                $cpstatus[$p] = $totaloutboundlogdetails[$p]['status'];
                $cplength_in_sec[$p] = $totaloutboundlogdetails[$p]['length_in_sec'];
                $cpcall_date[$p] = $totaloutboundlogdetails[$p]['call_date'];
                $cpepoch[$p] = $totaloutboundlogdetails[$p]['event_time'];
                $cpphone_number[$p] = $totaloutboundlogdetails[$p]['phone_number'];
                $cpcampaign_id[$p] = $totaloutboundlogdetails[$p]['campaign_id'];
                $cpvicidial_id[$p] = $totaloutboundlogdetails[$p]['uniqueid'];
                $cplead_id[$p] = $totaloutboundlogdetails[$p]['lead_id'];
                $testlead_id[$p] = $totaloutboundlogdetails[$p]['lead_id'];
                $testuniqueid[$p] = $totaloutboundlogdetails[$p]['uniqueid'];
                $cpin_out[$p] = 'OUT';
                $p++;
                $u++;
            }

            //TOTAL SALE CALLS
            $totalsalecallsarray = array();
            $totalcamapignstatus = VicidialStatuses::where('sale','=','Y')->get(['status']);

            $sale_ct = 0;
            $i = 0;
            while ($i < count($totalcamapignstatus)) {
                $sale_statuseslist[$sale_ct] = $totalcamapignstatus[$i]['status'];
                $sale_ct++;
                $i++;
            }


            // TOTAL DNC CALLS
            $totaldnccallsarray = array();
            $totalcamapignstatus = VicidialStatuses::where('dnc','=','Y')->get(['status']);

            $dnc_ct = 0;
            $i = 0;
            while ($i < count($totalcamapignstatus)) {
                $dnc_statuseslist[$dnc_ct] = $totalcamapignstatus[$i]['status'];
                $dnc_ct++;
                $i++;
            }

            // end
            //AGENT LOGIN TIME, pause
            ##### Gather Agent time records

            $group_drop[$i] = isset($group_drop[$i])?$group_drop[$i]:'';

            $totalagentlogdetails = VicidialAgentLog::whereIn('campaign_id',[$campaign,$group_drop[$i]])
                                                    ->whereBetween('event_time',[$query_date_begin,$query_date_end])
                                                    ->get(['event_time', 'event_time as unix_event_time', 'campaign_id', 'pause_sec', 'wait_sec', 'talk_sec', 'dispo_sec'])->toArray();


            $atagentarray = $atpausearray = $atcall_date = array();
            for ($s = 0; $s < count($totalagentlogdetails); $s++) {

                $call_date1 = $totalagentlogdetails[$s]['event_time'];

                $call_date = explode(" ", $call_date1);
                $call_time = preg_replace('/[^0-9]/', '', $call_date[1]);

                if (($call_time > $ctstart) && ($call_time < $ctstop)) {
                    $in_total_sec = ($totalagentlogdetails[$s]['pause_sec'] + $totalagentlogdetails[$s]['wait_sec'] + $totalagentlogdetails[$s]['talk_sec'] + $totalagentlogdetails[$s]['dispo_sec']);
                    $atcall_date[$s] = $totalagentlogdetails[$s]['event_time'];
                    $atepoch[$s] = $totalagentlogdetails[$s]['unix_event_time'];

                    $atcampaign_id[$s] = $totalagentlogdetails[$s]['campaign_id'];
                    $atpause_sec[$s] = $totalagentlogdetails[$s]['pause_sec'];
                    $atagent_sec[$s] = $in_total_sec;
                    if ($atagent_sec[$s] != 0) {
                        array_push($atagentarray, $atagent_sec[$s]);
                    }
                    if ($atpause_sec[$s] != 0) {
                        array_push($atpausearray, $atpause_sec[$s]);
                    }
                }
            }

            // print_r($atcall_date);

            $agent_sec = $pause_sec = 0;
            for ($i = 0; $i < count($atagentarray); $i++) {
                $agent_sec = $agent_sec + $atagentarray[$i];
            }
            $loginagent_sec = $this->secConvert($agent_sec, 'H');
            for ($i = 0; $i < count($atpausearray); $i++) {
                $pause_sec = $pause_sec + $atpausearray[$i];
            }
            $pauseagent_sec = $this->secConvert($pause_sec, 'H');
            //end
            ##### Parse through the agent time records to tally the time

            $p = 0;
            $cwday = 0;
            $call_time1 = 0;
            $hagent_sec = $hpause_sec = [];
            while ($p < $s) 
            {
                if(!isset($atcall_date[$p])){
                    $chour = '0';
                    $cmin = '0';
                } else {
                    $call_date = explode(" ", $atcall_date[$p]);
                    $call_time1 = preg_replace('/[^0-9]/', '', $call_date[1]);
                    $time1 = explode(":", $call_date[1]);
                    $chour = $time1[0];
                    $cmin = $time1[1];
                }

                
                $ctstart = $gct_default_start."00";
                $ctstop = $gct_default_stop."59";

                $Gct_sunday_start = isset($Gct_sunday_start)?$Gct_sunday_start:'';
                $Gct_sunday_stop = isset($Gct_sunday_stop)?$Gct_sunday_stop:'';
                $Gct_monday_start = isset($Gct_monday_start)?$Gct_monday_start:'';
                $Gct_monday_stop = isset($Gct_monday_stop)?$Gct_monday_stop:'';

                $Gct_tuesday_start = isset($Gct_tuesday_start)?$Gct_tuesday_start:'';
                $Gct_tuesday_stop = isset($Gct_tuesday_stop)?$Gct_tuesday_stop:'';

                $Gct_wednesday_start = isset($Gct_wednesday_start)?$Gct_wednesday_start:'';
                $Gct_wednesday_stop = isset($Gct_wednesday_stop)?$Gct_wednesday_stop:'';
                
                $Gct_thursday_start = isset($Gct_thursday_start)?$Gct_thursday_start:'';
                $Gct_thursday_stop = isset($Gct_thursday_stop)?$Gct_thursday_stop:'';
                
                $Gct_friday_start = isset($Gct_friday_start)?$Gct_friday_start:'';
                $Gct_friday_stop = isset($Gct_friday_stop)?$Gct_friday_stop:'';
                
                $Gct_saturday_start = isset($Gct_saturday_start)?$Gct_saturday_start:'';
                $Gct_saturday_stop = isset($Gct_saturday_stop)?$Gct_saturday_stop:'';

                if (($cwday == 0) and ( ($Gct_sunday_start > 0) and ( $Gct_sunday_stop > 0))) {
                    $ctstart = $Gct_sunday_start."00";
                    $ctstop = $Gct_sunday_stop."59";
                }
                if (($cwday == 1) and ( ($Gct_monday_start > 0) and ( $Gct_monday_stop > 0))) {
                    $ctstart = $Gct_monday_start."00";
                    $ctstop = $Gct_monday_stop."59";
                }
                if (($cwday == 2) and ( ($Gct_tuesday_start > 0) and ( $Gct_tuesday_stop > 0))) {
                    $ctstart = $Gct_tuesday_start."00";
                    $ctstop = $Gct_tuesday_stop."59";
                }
                if (($cwday == 3) and ( ($Gct_wednesday_start > 0) and ( $Gct_wednesday_stop > 0))) {
                    $ctstart = $Gct_wednesday_start."00";
                    $ctstop = $Gct_wednesday_stop."59";
                }
                if (($cwday == 4) and ( ($Gct_thursday_start > 0) and ( $Gct_thursday_stop > 0))) {
                    $ctstart = $Gct_thursday_start."00";
                    $ctstop = $Gct_thursday_stop."59";
                }
                if (($cwday == 5) and ( ($Gct_friday_start > 0) and ( $Gct_friday_stop > 0))) {
                    $ctstart = $Gct_friday_start."00";
                    $ctstop = $Gct_friday_stop."59";
                }
                if (($cwday == 6) and ( ($Gct_saturday_start > 0) and ( $Gct_saturday_stop > 0))) {
                    $ctstart = $Gct_saturday_start."00";
                    $ctstop = $Gct_saturday_stop."59";
                }


                if ($interval_count == 96) {
                    $chourX = ($chour * 4);
                    if ($cmin < 15) {
                        $cmin = "00";
                        $cminx = 0;
                    }
                    if (($cmin >= 15) and ( $cmin < 30)) {
                        $cmin = "15";
                        $cminx = 1;
                    }
                    if (($cmin >= 30) and ( $cmin < 45)) {
                        $cmin = "30";
                        $cminx = 2;
                    }
                    if ($cmin >= 45) {
                        $cmin = "45";
                        $cminx = 3;
                    }
                    $chour = ($chourX + $cminx);
                }
                if ($interval_count == 48) {
                    $chourX = ($chour * 2);
                    if ($cmin < 30) {
                        $cmin = "00";
                        $cminx = 0;
                    }
                    if ($cmin >= 30) {
                        $cmin = "30";
                        $cminx = 1;
                    }
                    $chour = ($chourX + $cminx);
                }
                
                if (($call_time1 > $ctstart) && ($call_time1 < $ctstop)) {
                    if(!$chour == 0){
                        $atagent_sec[$p] = isset($atagent_sec[$p])?$atagent_sec[$p]:0;
                        $hagent_sec[$chour] = isset($hagent_sec[$chour])?$hagent_sec[$chour]:0;
                        $hagent_sec[$chour] = ($hagent_sec[$chour] + $atagent_sec[$p]);

                        $hpause_sec[$chour] = isset($hpause_sec[$chour])?$hpause_sec[$chour]:0;
                        $atpause_sec[$p] = isset($atpause_sec[$p])?$atpause_sec[$p]:0;
                        $hpause_sec[$chour] = ($hpause_sec[$chour] + $atpause_sec[$p]);
                    }                    
                }

                $p++;
            }

            $i = 0;
            while ($i < $u) {

                $call_date = explode(" ", $cpcall_date[$i]);
                $call_time = preg_replace('/[^0-9]/', '', $call_date[1]);
                $time1 = explode(":", $call_date[1]);
                $chour = $time1[0];
                $cmin = $time1[1];
                if ($interval_count == 96) {
                    $chourX = ($chour * 4);
                    if ($cmin < 15) {
                        $cmin = "00";
                        $cminx = 0;
                    }
                    if (($cmin >= 15) && ($cmin < 30)) {
                        $cmin = "15";
                        $cminx = 1;
                    }
                    if (($cmin >= 30) && ($cmin < 45)) {
                        $cmin = "30";
                        $cminx = 2;
                    }
                    if ($cmin >= 45) {
                        $cmin = "45";
                        $cminx = 3;
                    }
                    $chour = ($chourX + $cminx);
                }
                if ($interval_count == 48) {
                    $chourX = ($chour * 2);
                    if ($cmin < 30) {
                        $cmin = "00";
                        $cminx = 0;
                    }
                    if ($cmin >= 30) {
                        $cmin = "30";
                        $cminx = 1;
                    }
                    $chour = ($chourX + $cminx);
                }

                $answer_count = $agent_count = $system_count = $na_count = $rtp_count = $drop_count_out = $drop_count = [];
                if (($call_time > $ctstart) && ($call_time < $ctstop)) {

                    $hcalls_count[$chour] = isset($hcalls_count[$chour])?($hcalls_count[$chour]):0;
                    $hcalls_count[$chour] ++;

                    if (preg_match("/DROP/i", $cpstatus[$i])) {
                        if ($cpin_out[$i] == 'OUT') {

                            $drop_count_out[$i] = isset($drop_count_out[$i])?($drop_count_out[$i]):0;
                            $drop_count_out[$i] ++;

                            $hdrop_count_out[$chour] = isset($hdrop_count_out[$chour])?($hdrop_count_out[$chour]):0;
                            $hdrop_count_out[$chour] ++;
                        }
                        $drop_count[$i] = isset($drop_count[$i])?($drop_count[$i]):0;
                        $drop_count[$i] ++;

                        $hdrop_count[$chour] = isset($hdrop_count[$chour])?($hdrop_count[$chour]):0;
                        $hdrop_count[$chour] ++;
                    } else {
                        $answer_count[$i] = isset($answer_count[$i])?($answer_count[$i]):0;
                        $answer_count[$i] ++;
                        $hanswer_count[$chour] = isset($hanswer_count[$chour])?($hanswer_count[$chour]):0;
                        $hanswer_count[$chour] ++;
                    }
                    if (in_array($cpstatus[$i], $statusarray)) {
                        $system_count[$i] = isset($system_count[$i])?($system_count[$i]):0;
                        $system_count[$i] ++;

                        $hsystem_count[$chour] = isset($hsystem_count[$chour])?($hsystem_count[$chour]):0;
                        $hsystem_count[$chour] ++;
                    } else {

                        $agent_count[$i] = isset($agent_count[$i])?($agent_count[$i]):0;
                        $agent_count[$i] ++;

                        $hagent_count[$chour] = isset($hagent_count[$chour])?($hagent_count[$chour]):0;
                        $hagent_count[$chour] ++;
                    }

                    $k = 0;
                    while ($k < $sale_ct) {
                        if ($sale_statuseslist[$k] == $cpstatus[$i]) {
                            $ptp_count[$i] = isset($ptp_count[$i])?($ptp_count[$i]):0;
                            $ptp_count[$i] ++;

                            $hptp_count[$chour] = isset($hptp_count[$chour])?($hptp_count[$chour]):0;
                            $hptp_count[$chour] ++;
                        }
                        $k++;
                    }
                    $k = 0;
                    while ($k < $dnc_ct) {
                        if ($dnc_statuseslist[$k] == $cpstatus[$i]) {
                            $rtp_count[$i] = isset($rtp_count[$i])?($rtp_count[$i]):0;
                            $rtp_count[$i] ++;

                            $hrtp_count[$chour] = isset($hrtp_count[$chour])?($hrtp_count[$chour]):0;
                            $hrtp_count[$chour] ++;
                        }
                        $k++;
                    }
                    if ($cpstatus[$i] == 'NA') {
                        $na_count[$i] = isset($na_count[$i])?($na_count[$i]):0;
                        $na_count[$i] ++;

                        $hna_count[$chour] = isset($hna_count[$chour])?($hna_count[$chour]):0;
                        $hna_count[$chour] ++;
                    }
                }
                $i++;
            }

            $intervalcalls = array();
            if ($timeinterval == '3600') {
                $intervalcalls = $totalhourlycalls;
                //$intervalcalls=$hcalls_count;
                $hsystem_count1 = $hsystem_count;
                $hagent_count1 = $hagent_count;
                $hptp_count1 = $hptp_count;
                $hrtp_count1 = $hrtp_count;
                $hna_count1 = $hna_count;
                $hdrop_count1 = $hdrop_count;
                $hagent_sec1 = $hagent_sec;
                $hpause_sec1 = $hpause_sec;
            } else {
                $intervalcalls = $hcalls_count;
                $hsystem_count1 = $hsystem_count;
                $hagent_count1 = $hagent_count;
                $hptp_count1 = $hptp_count;
                $hrtp_count1 = $hrtp_count;
                $hna_count1 = $hna_count;
                $hdrop_count1 = $hdrop_count;
                $hagent_sec1 = $hagent_sec;
                $hpause_sec1 = $hpause_sec;
            }


            unset($hcalls_count);
            $hcalls_count = $mt;
            unset($hsystem_count);
            $hsystem_count = $mt;
            unset($hagent_count);
            $hagent_count = $mt;
            unset($hptp_count);
            $hptp_count = $mt;
            unset($hrtp_count);
            $hrtp_count = $mt;
            unset($hna_count);
            $hna_count = $mt;
            unset($hdrop_count);
            $hdrop_count = $mt;
            unset($hagent_sec);
            $hagent_sec = $mt;
            unset($hpause_sec);
            $hpause_sec = $mt;

            $singlecampaigncetails = array(
                'campaign_id' => $campaign,
                'intervalcalls' => $intervalcalls,
                'hsystem_count' => $hsystem_count1,
                'hagent_count' => $hagent_count1,
                'hptp_count' => $hptp_count1,
                'hrtp_count' => $hrtp_count1,
                'hna_count' => $hna_count1,
                'hdrop_count' => $hdrop_count1,
                'hpause_sec' => $hpause_sec1,
                'hagent_sec' => $hagent_sec1
            );
            array_push($returndetailsintervalcampaignwise, $singlecampaigncetails);
            unset($singlecampaigncetails);
            $singlecampaigncetails = array();
        }

        return $returndetailsintervalcampaignwise;

    }


    public function getDetailsByCampaignId($campaignIdList, $startdate, $enddate, $gct_default_start, $gct_default_stop, $include_rollover, $timeinterval)
    {

        $returndetailscampaignwise = array();
        $query_date_begin = "$startdate 00:00:00";
        $query_date_end = "$enddate 23:59:59";
        $ctstart = $gct_default_start."00";
        $ctstop = $gct_default_stop."59";

        $userlist = VicidialUser::get(['user_group'])->unique('user_group');

        $viewablegrouplist = VicidialUserGroup::whereIn('user_group', $userlist)->get(['allowed_campaigns'])->toArray();

        array_push($viewablegrouplist, ['---ALL---']);

        $allowcampiagnarray = $list = $listy = $finalallow = array();


        foreach ($viewablegrouplist as $key => $value) {
            foreach ($value as $key_1 => $value1) {
                if ($key_1 == 'allowed_campaigns') {
                    $allowcampaign = $value1;
                    array_push($allowcampiagnarray, $allowcampaign);
                }
            }
        }

        $allowcampiagnarray = array_unique($allowcampiagnarray);
        $allowcampiagnarray = array_values($allowcampiagnarray);

        
        foreach ($allowcampiagnarray as $value) {
            $arra = explode(' ', $value);
            for ($j = 0; $j < count($arra); $j++) {
                $allowarr = $arra[$j];
                array_push($finalallow, $allowarr);
            }   
        }

        $finalallow = array_unique($finalallow);
        $finalallow = array_values($finalallow);

        $list = VicidialCampaign::whereIn('campaign_id', $finalallow)->orderBy('campaign_id')->get(['campaign_id'])->toArray();


        $allcam = array();
        foreach ($list as $key) {
            foreach ($key as $ke => $value) {
                $val = $value;
                array_push($allcam, $val);
            }
        }

        if (in_array('--ALL--', $campaignIdList)) {
            $campaignslistingall = $allcam;
        } else {
            $campaignslistingall = $campaignIdList;
        }

        $i=0;$group_drop = [];
        foreach ($campaignslistingall as $key => $campaign) {
            
            $group_drop[$i] = isset($group_drop[$i])?$group_drop[$i]:'';
            if($group_drop[$i]==''){
                $group_drop[$i] =NULL;
            }

            $totaloutboundlogdetails = VicidialLog::whereIn('campaign_id',[$campaign, $group_drop[$i]])
                                ->whereBetween('call_date',[$query_date_begin,$query_date_end])
                                ->get(['status',
                                    'length_in_sec',
                                    'call_date',
                                    'call_date as event_time',
                                    'phone_number',
                                    'campaign_id',
                                    'uniqueid',
                                    'lead_id'])->toArray();
                        
            $totaloutboundcall = $hourarray = array();
           
            foreach ($totaloutboundlogdetails AS $li) {
                foreach ($li As $key => $value) {
                        if ($key == 'call_date') {
                            $call_date = explode(" ", $value);
                        }
                }

                $time = $call_date[1];
                $time1 = explode(":", $time);
                $call_time = preg_replace('/[^0-9]/', '', $call_date[1]);
                if (($call_time > $ctstart) && ($call_time < $ctstop)) {
                    $time = $call_date[1];
                    $time1 = explode(":", $time);
                    array_push($hourarray, $time1[0]);
                    array_push($totaloutboundcall, $call_time);
                }
            }

            $totalanswercalls = $totaldrop = array();
            for ($i = 0; $i < count($totaloutboundlogdetails); $i++) {
                if ($totaloutboundlogdetails[$i]['status'] == 'DROP' || $totaloutboundlogdetails[$i]['status'] == 'PDROP') {
                    $call_date1 = $totaloutboundlogdetails[$i]['call_date'];
                    ;
                    $call_date = explode(" ", $call_date1);
                    $call_time = preg_replace('/[^0-9]/', '', $call_date[1]);
                    if (($call_time > $ctstart) && ($call_time < $ctstop)) {
                        $length_in_sec = $totaloutboundlogdetails[$i]['length_in_sec'];
                        array_push($totaldrop, $call_time);
                    }
                } else {
                    $call_date1 = $totaloutboundlogdetails[$i]['call_date'];
                    ;
                    $call_date = explode(" ", $call_date1);
                    $call_time = preg_replace('/[^0-9]/', '', $call_date[1]);
                    if (($call_time > $ctstart) && ($call_time < $ctstop)) {
                        $length_in_sec = $totaloutboundlogdetails[$i]['length_in_sec'];
                        array_push($totalanswercalls, $call_time);
                    }
                }
            }

            $statusarray = array(
                'NA',
                'NEW',
                'QUEUE',
                'INCALL',
                'DROP',
                'XDROP',
                'AA',
                'AM',
                'AL',
                'AFAX',
                'AB',
                'ADC',
                'DNCL',
                'DNCC',
                'PU',
                'PM',
                'SVYEXT',
                'SVYHU',
                'SVYVM',
                'SVYREC',
                'QVMAIL'
            );

            $totalsystemcalls = $totalagentscalls = array();
            for ($i = 0; $i < count($totaloutboundlogdetails); $i++) {
                if (in_array($totaloutboundlogdetails[$i]['status'], $statusarray)) {
                    $call_date1 = $totaloutboundlogdetails[$i]['call_date'];
                    ;
                    $call_date = explode(" ", $call_date1);
                    $call_time = preg_replace('/[^0-9]/', '', $call_date[1]);
                    if (($call_time > $ctstart) && ($call_time < $ctstop)) {
                        $length_in_sec = $totaloutboundlogdetails[$i]['length_in_sec'];
                        array_push($totalsystemcalls, $call_time);
                    }
                } else {
                    $call_date1 = $totaloutboundlogdetails[$i]['call_date'];
                    ;
                    $call_date = explode(" ", $call_date1);
                    $call_time = preg_replace('/[^0-9]/', '', $call_date[1]);
                    if (($call_time > $ctstart) && ($call_time < $ctstop)) {
                        $length_in_sec = $totaloutboundlogdetails[$i]['length_in_sec'];
                        array_push($totalagentscalls, $call_time);
                    }
                }
            }

            //TOTAL SALE CALLS
            $totalsalecallsarray = array();

            $totalcamapignstatus =VicidialStatuses::where('sale','=','Y')->get(['status'])->toArray();

            $sale_ct = 0;
            $i = 0;
            while ($i < count($totalcamapignstatus)) {
                $sale_statuseslist[$sale_ct] = $totalcamapignstatus[$i]['status'];
                $sale_ct++;
                $i++;
            }

            for ($i = 0; $i < count($totaloutboundlogdetails); $i++) {
                $call_date1 = $totaloutboundlogdetails[$i]['call_date'];
                ;
                $call_date = explode(" ", $call_date1);
                $call_time = preg_replace('/[^0-9]/', '', $call_date[1]);
                if (($call_time > $ctstart) && ($call_time < $ctstop)) {
                    for ($j = 0; $j < count($sale_statuseslist); $j++) {
                        if ($totaloutboundlogdetails[$i]['status'] == $sale_statuseslist[$j]) {
                            $statuscall = $totaloutboundlogdetails[$i]['status'];
                            array_push($totalsalecallsarray, $statuscall);
                        }
                    }
                }
            }

            //end SALE CALLS
            // TOTAL DNC CALLS
            $totaldnccallsarray = array();
            $totalcamapignstatus =VicidialStatuses::where('dnc','=','Y')->get(['status'])->toArray();
            
            $dnc_ct = 0;
            $i = 0;
            while ($i < count($totalcamapignstatus)) {
                $dnc_statuseslist[$dnc_ct] = $totalcamapignstatus[$i]['status'];
                $dnc_ct++;
                $i++;
            }


            for ($i = 0; $i < count($totaloutboundlogdetails); $i++) {
                $call_date1 = $totaloutboundlogdetails[$i]['call_date'];
                ;
                $call_date = explode(" ", $call_date1);
                $call_time = preg_replace('/[^0-9]/', '', $call_date[1]);
                if (($call_time > $ctstart) && ($call_time < $ctstop)) {
                    for ($j = 0; $j < count($dnc_statuseslist); $j++) {
                        if ($totaloutboundlogdetails[$i]['status'] == $dnc_statuseslist[$j]) {
                            $statuscall = $totaloutboundlogdetails[$i]['status'];
                            array_push($totaldnccallsarray, $statuscall);
                        }
                    }
                }
            }

            //END DNC CALLS
            //NA ANSWER CALL %
            $naansarray = array();
            for ($i = 0; $i < count($totaloutboundlogdetails); $i++) {
                if ($totaloutboundlogdetails[$i]['status'] == 'NA') {
                    $NAstatus = $totaloutboundlogdetails[$i]['status'];
                    array_push($naansarray, $NAstatus);
                }
            }

            if ((count($totaloutboundcall) < 1) || (count($naansarray) < 1)) {
                $gna_percent = 0.00;
            } else {
                $gna_percent1 = $this->getDivision(count($naansarray), count($totaloutboundcall));
                $gna_percent = round(($gna_percent1 * 100), 2);
            }
            //END ANSWER CALL
            // DROP %
            if ((count($totaloutboundcall) < 1) || (count($totaldrop) < 1)) {
                $gdroppercent = 0.00;
            } else {
                $gdroppercent1 = $this->getDivision(count($totaldrop), count($totaloutboundcall));
                $gdroppercent = round(($gdroppercent1 * 100), 2);
            }
            // DROP END
            //AGENT LOGIN TIME, pause
            ##### Gather Agent time records
            
            $group_drop[$i] = isset($group_drop[$i])?$group_drop[$i]:null;
            $totalagentlogdetails = VicidialAgentLog::whereIn('campaign_id',[$campaign, $group_drop[$i]])
                                                ->whereBetween('event_time',[$query_date_begin,$query_date_end])
                                                ->get(['event_time',
                                                        'event_time as unix_event_time',
                                                        'campaign_id',
                                                        'pause_sec',
                                                        'wait_sec',
                                                        'talk_sec',
                                                        'dispo_sec']);

            $atagentarray = $atpausearray = array();
            for ($s = 0; $s < count($totalagentlogdetails); $s++) {
                $call_date1 = $totalagentlogdetails[$s]['event_time'];
                ;
                $call_date = explode(" ", $call_date1);
                $call_time = preg_replace('/[^0-9]/', '', $call_date[1]);
                if (($call_time > $ctstart) && ($call_time < $ctstop)) {
                    $in_total_sec = ($totalagentlogdetails[$s]['pause_sec'] + $totalagentlogdetails[$s]['wait_sec'] + $totalagentlogdetails[$s]['talk_sec'] + $totalagentlogdetails[$s]['dispo_sec']);
                    $atcall_date = $totalagentlogdetails[$s]['event_time'];
                    $atepoch = strtotime($totalagentlogdetails[$s]['unix_event_time']);
                    ;
                    $atcampaign_id = $totalagentlogdetails[$s]['campaign_id'];
                    $atpause_sec = $totalagentlogdetails[$s]['pause_sec'];
                    $atagent_sec = $in_total_sec;
                    if ($atagent_sec != 0) {
                        array_push($atagentarray, $atagent_sec);
                    }
                    if ($atpause_sec != 0) {
                        array_push($atpausearray, $atpause_sec);
                    }
                }
            }

            $agent_sec = $pause_sec = 0;
            for ($i = 0; $i < count($atagentarray); $i++) {
                $agent_sec = $agent_sec + $atagentarray[$i];
            }

            $loginagent_sec = $this->secConvert($agent_sec, 'H');           

            for ($i = 0; $i < count($atpausearray); $i++) {
                $pause_sec = $pause_sec + $atpausearray[$i];
            }
            $pauseagent_sec = $this->secConvert($pause_sec, 'H');

            // END LOGIN AGENT SEC, pause

            $p = 0;
            while ($p < count($totaloutboundlogdetails)) {

                $cpstatus = $totaloutboundlogdetails[$p]['status'];
                $cplength_in_sec = $totaloutboundlogdetails[$p]['length_in_sec'];
                $cpcall_date = $totaloutboundlogdetails[$p]['call_date'];
                $cpepoch = $totaloutboundlogdetails[$p]['event_time'];
                $cpphone_number = $totaloutboundlogdetails[$p]['phone_number'];
                $cpcampaign_id = $totaloutboundlogdetails[$p]['campaign_id'];
                $cpvicidial_id = $totaloutboundlogdetails[$p]['uniqueid'];
                $cplead_id = $totaloutboundlogdetails[$p]['lead_id'];
                $testlead_id = $totaloutboundlogdetails[$p]['lead_id'];
                $testuniqueid = $totaloutboundlogdetails[$p]['uniqueid'];
                $cpin_out = 'OUT';
                $p++;
            }

            ##### Parse through the agent time records to tally the time
            $p = $s = 0; $cwday = '';
            while ($p < $s) {
                $call_date = explode(" ", $atcall_date[$p]);
                $call_time = preg_replace('/[^0-9]/', '', $call_date[1]);
                $epoch = $atepoch[$p];
                $cwday = date("w", $epoch);
                $p++;
            }

            //end
            $group_drop[$i] = isset($group_drop[$i])?$group_drop[$i]:'';
            $rollover_groups_count = 0;
            if (preg_match("/YES/i", $include_rollover)) {
                ##### Gather inbound calls from drop inbound group if selected
                $dropinboundgroplist = VicidialUserGroup::Select('vicidial_campaigns.drop_inbound_group')
                                                            ->join('vicidial_campaigns',function($join){
                                                            $join->whereIn('vicidial_campaigns.campaign_id',['ViciUserGroupallowed_campaigns','1000']);
                                                            $join->whereNotIn('vicidial_campaigns.drop_inbound_group',['NONE', 'NULL', '']);
                                                            })->get();

                $in_groups_to_print = count($dropinboundgroplist);
                if ($in_groups_to_print > 0) {
                    $group_drop[$i] = $dropinboundgroplist[0]['drop_inbound_group'];
                    $rollover_groups_count++;
                }
            
                $length_in_secz = 0;
                $queue_secondsz = 0;
                $agent_alert_delayz = 0;

                $closerinboundgroplist = VicidialCloserLog::whereBetween('call_date',[$query_date_begin,$query_date_end])
                                                            ->whereIn('campaign_id',[$campaign, $group_drop[$i]])
                                                            ->select(DB::raw('status,length_in_sec,queue_seconds,call_date,call_date as unix_call_date,phone_number,campaign_id,closecallid,lead_id,uniqueid '))
                                                            ->get();
            }

            $singlecampaigncetails = array(
                'totaldrop' => count($totaldrop),
                'campaign_id' => $campaign,
                'loginagentt_sec' => $agent_sec,
                'pauselogin_sec' => $pause_sec,
                'naansarray' => count($naansarray),
                'totalcallevents' => count($totaloutboundcall),
                "totalsystemcalls" => count($totalsystemcalls),
                "totalagentscalls" => count($totalagentscalls),
                "totalsalecallsarray" => count($totalsalecallsarray),
                "totaldnccallsarray" => count($totaldnccallsarray),
                "gna_percent" => $gna_percent,
                "gdroppercent" => $gdroppercent,
                "loginagent_sec" => $loginagent_sec,
                "pauseagent_sec" => $pauseagent_sec
            );
            array_push($returndetailscampaignwise, $singlecampaigncetails);
            unset($singlecampaigncetails);
            $singlecampaigncetails = array();
        }
        return $returndetailscampaignwise;
    }

    /**
     * Outbound summary report interval report
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param Request $request
     * @return type
     * @throws \App\Http\Controllers\Report\Exception
     */
    public function csvOutboundSummaryIntervalReport(Request $request) {
        try {
            $result = $this->outboundSummaryIntervalReport($request);
            
            $null = [];
            $header = ['CAMPAIGN','TOTAL CALLS','SYSTEM RELEASE CALLS','AGENT RELEASE CALLS','SALE CALLS','DNC CALLS','NO ANSWER PERCENT','DROP PERCENT','AGENT LOGIN TIME(H:M:S)','AGENT PAUSE TIME(H:M:S)'];
            $header2 = ['INTERVAL','TOTAL CALLS','SYSTEM RELEASE CALLS','AGENT RELEASE CALLS','SALE CALLS','DNC CALLS','NO ANSWER PERCENT','DROP PERCENT','AGENT LOGIN TIME(H:M:S)','AGENT PAUSE TIME(H:M:S)'];
            
            $filename = "Outbound_Summary_Interval_Report".date('Y-m-dh:i:s').".csv";
            $handle = fopen($filename, 'w+');
            
            $row = ["Outbound Summary Interval Report:".$result['group_string'] . " " . $result['datetime'] ];
            fputcsv($handle, $row, ";", '"');
            
            $row = ["MULTI-CAMPAIGN BREAKDOWN" ];
            fputcsv($handle, $row, ";", '"');
            
            fputcsv($handle, $header, ";", '"');
            
            foreach ($result['campaign_wise_details'] as $key => $val) {
                $row = [$val['campaign_id']."-".$val['campaign_name']['campaign_name'],$val['totalcallevents'],$val['totalsystemcalls'],$val['totalagentscalls'],$val['totalsalecallsarray'],$val['totaldnccallsarray'],$val['naansarray']."%",$val['gdroppercent']."%",$val['loginagent_sec'],$val['pauseagent_sec']];
                fputcsv($handle, $row, ";", '"');                
            }
            fputcsv($handle, $null, ";", '"');
            $cnt_cmp = count($result['campaign_wise_details']);
            for ( $i= 0 ; $i < $cnt_cmp ; $i++) {
                if(isset($result['sub_graph_stats'][$i] ) && !empty($result['sub_graph_stats'][$i] )) {
                    $row = [$result['campaign_wise_details'][$i]['campaign_id'] ."".$result['campaign_wise_details'][$i]['campaign_name']['campaign_name'] . "    INTERVAL BREAKDOWN:"];
                    fputcsv($handle, $row, ";", '"');    
                    fputcsv($handle, $header2, ";", '"');
                    foreach ($result['sub_graph_stats'][$i] as $key => $val) {
                        $row = [$val[0],$val[1],$val[2],$val[3],$val[4],$val[5],$val[6]."%",$val[7]."%",$val[10],$val[11]];
                        fputcsv($handle, $row, ";", '"');   
                    }

                    $row = ["TOTAL:",$result['campaign_wise_details'][$i]['totalcallevents'],$result['campaign_wise_details'][$i]['totalsystemcalls'],$result['campaign_wise_details'][$i]['totalagentscalls'],$result['campaign_wise_details'][$i]['totalsalecallsarray'],$result['campaign_wise_details'][$i]['totaldnccallsarray'],$result['campaign_wise_details'][$i]['naansarray']."%",$result['campaign_wise_details'][$i]['gdroppercent']."%",$result['campaign_wise_details'][$i]['loginagent_sec'],$result['campaign_wise_details'][$i]['pauseagent_sec']];
                    fputcsv($handle, $row, ";", '"');    
                    fputcsv($handle, $null, ";", '"');
                }
            }
            
            fclose($handle);
            $headers = [
                    'Content-Type' => 'text/csv',
            ];
            return Response::download($filename, $filename, $headers)->deleteFileAfterSend(true);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.outbound_summary_interval_report'), $e);
            throw $e;
        }
    }
}