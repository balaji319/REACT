<?php

namespace App\Http\Controllers\Report;

use Response;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\VicidialStatuses;
use App\VicidialInboundGroup;
use App\VicidialInboundDid;
use App\VicidialDidLog;
use App\VicidialCloserLog;
use App\LiveInboundLog;
use App\VicidialCampaignStatuses;
use App\VicidialStatusCategories;
use App\Servers;
use App\Traits\AccessControl;
use App\Traits\ErrorLog;
use Carbon\Carbon;
use Config;
use Exception;

class InboundCallsReportController extends Controller
{

    use AccessControl;

    public function inboundGroupsList()
    {
        try{
            $list = VicidialInboundGroup::inboundGroups();

            return response()->json([
                'status' => 200,
                'message' => 'Success',
                'list' => $list
            ],200);
        }catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound_group_list'), $e);
            throw $e;
        }
    }

    public function inboundReportByGroup(Request $request)
    {
        try{
          
            $text_arr = []; 
            $did = $request['did'];
            $start_date = $request['start_date'];
            $end_date = $request['end_date'];
            $shift = $request['shift'];
            
            $selected_groups = [];
            if(isset($request['selected_groups']) && is_array($request['selected_groups'])){
                $selected_groups = $request['selected_groups'];
            }

            // $user = $request->user();
            // if ($did !== 'Y') {
            //     if (!in_array(SYSTEM_COMPONENT_REPORT_INBOUND, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $user))) {
            //         throw new ForbiddenException();
            //     }
            //     if (isset($selected_groups) && is_array($selected_groups)) {
            //         $selected_groups = array_intersect($selected_groups, $this->getListByAccess(ACCESS_TYPE_INGROUP, ACCESS_READ, $user));
            //     }
            // } else {
            //     if (!in_array(SYSTEM_COMPONENT_REPORT_INBOUND_BY_DID, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $user))) {
            //         throw new ForbiddenException();
            //     }
            // }

            $report_display_type = $request['report_display_type'];

            if ($shift == 'AM') {
                $start_date .= " 03:45:00";
                $end_date .= " 15:14:59";
            }
            if ($shift == 'PM') {
                $start_date .= " 15:15:00";
                $end_date .= " 23:15:00";
            }
            if ($shift == 'ALL') {
                $start_date .= " 00:00:00";
                $end_date .= " 23:59:59";
            }

            $all_drop_call_details = $total_call_log = [];

            $drop_status = ['DROP', 'XDROP'];
            $answer_status = ['FER', 'XFER'];
            $ans_status_not_in = ['DROP', 'XDROP', 'HXFER', 'QVMAIL', 'HOLDTO', 'LIVE', 'QUEUE', 'TIMEOT', 'AFTHRS', 'NANQUE',   'INBND', 'MAXCAL'];

            $campaign_wise_details = [];
            $group_string = '|';
            $i = 0;
            $group_count = count($selected_groups);

            $selected_groups = array_values($selected_groups);


            if ($group_count > 0) {
                while ($i < $group_count) {
                    $group_string .= $selected_groups[$i]."|";
                    $i++;
                }
            }

            $unique_sql = [];
            if ($did == 'Y') {

                $selected_id = VicidialInboundDid::vicidialInboundDids($selected_groups);

                $loop_array = [];

                for ($i = 0; $i < count($selected_id); $i++) {

                    $single_array = $selected_id[$i]['did_id'];

                    array_push($loop_array, $single_array);
                }

                $k = 0;
                while ($k < count($loop_array)) {
                    $sql_loop_array = [];
                    array_push($sql_loop_array, $single_array);

                    $selected_unique_id = VicidialDidLog::vicidialInboundLogByDidId($sql_loop_array);

                    for ($i = 0; $i < count($selected_unique_id); $i++) {

                        $single_array = $selected_unique_id[$i]['uniqueid'];

                        array_push($unique_sql, $single_array);
                    }

                    $k++;
                }

            }

            $campaign_wise_details = [];

            if ($selected_groups) {
                if ($selected_groups[0] != "---NONE---" && count($selected_groups) > 0) {
                    $campaign_wise_details = $this->getDetailsByCampaignId($selected_groups, $start_date, $end_date, $did);
                }
            }


            $closer_log_list = [];
            $ivr_call = [];
            $avg_all_call = [];
            $total_answered_call_details = [];
            $answered_call_details = [];
            $total_drop_call_details = [];
            $drop_call_details = [];
            $queue_call_details = [];
            $queue_seconds = [];

            if ($did == 'Y') {

                $closer_log_list = VicidialCloserLog::getAllUniqueData($unique_sql, $start_date, $end_date);

                $ivr_call = LiveInboundLog::callCountLiveInboundLogWithUniqueId($unique_sql, $end_date,$start_date);

                $avg_all_call = VicidialCloserLog::getAllAvgSumLog($unique_sql, $end_date, $start_date);

                $total_answered_call_details = VicidialCloserLog::getTotalAnsCallCount($unique_sql, $ans_status_not_in,$start_date, $end_date);

                $answered_call_details = VicidialCloserLog::getTotalAnsCallAvg($unique_sql, $ans_status_not_in, $start_date, $end_date);

                $total_drop_call_details = VicidialCloserLog::getTotalCallDropDetails($unique_sql, $drop_status, $start_date, $end_date);

                $drop_call_details = VicidialCloserLog::getCallDropDetails($unique_sql, $drop_status, $start_date, $end_date);

                $queue_call_details = VicidialCloserLog::getCallQueueDetails($unique_sql, '0', $start_date, $end_date);

                $queue_seconds = VicidialCloserLog::getCallQueueSeconds($unique_sql, '0', $start_date, $end_date);

            } else {

                $closer_log_list = VicidialCloserLog::getCloserLogWithCampaign($selected_groups, $start_date, $end_date);

                $ivr_call = LiveInboundLog::callCountSelectedInbound($selected_groups, 'START', $start_date, $end_date);

                $avg_all_call = VicidialCloserLog::getCloserLogAvgCall($selected_groups, $start_date, $end_date);

                $total_answered_call_details = VicidialCloserLog::getSelectedAnsCallCount($selected_groups, $ans_status_not_in, $start_date, $end_date);

                $answered_call_details = VicidialCloserLog::getSelectedAnsCallAvg($selected_groups,$ans_status_not_in, $start_date, $end_date);

                $total_drop_call_details = VicidialCloserLog::getSelectedTotalCallDropDetails($selected_groups, $drop_status, $start_date, $end_date);

                $drop_call_details = VicidialCloserLog::getSelectedCallDropDetails($selected_groups, $drop_status, $start_date, $end_date);

                $queue_call_details = VicidialCloserLog::getSelectedCallQueueDetails($selected_groups, '0', $start_date, $end_date);

                $queue_seconds = VicidialCloserLog::getSelectedCallQueueSeconds($selected_groups, '0', $start_date, $end_date);
            }

            $answer_sec_pct_rt_stat_one = VicidialInboundGroup::answerSecPctRtStat($selected_groups, '1');

            $total_call_log['total_calls'] = count($closer_log_list);
            $total_call_log['total_answer_call'] = $total_answered_call_details[0]['count'];

            $total_call_log['avg_all_call'] = ($avg_all_call[0]['average_all'] ? $avg_all_call[0]['average_all'] : 0);

            $answered_call_details1 = VicidialCloserLog::getSelectedAnsCallDetails($selected_groups, $ans_status_not_in, $start_date, $end_date);

            if ($did == 'Y') {

                $answered_call_details1 = VicidialCloserLog::getSelectedAnsCallDetailsWithY($unique_sql, $ans_status_not_in, $start_date, $end_date);
            }

            $q = 0; $p = 0;
            $rslt = VicidialStatuses::getAllStatusDetails();
            $statuses_to_print = count($rslt);
            
            while ($p < $statuses_to_print) {
                $row = $rslt[$p];
                $status =  $row['status'];
                $status_name[$status] = $row['status_name'];
                $human_answered[$status] = $row['human_answered'];
                $category[$status] = $row['category'];
                $q++;
                $p++;                
            }

            $rslt = VicidialCampaignStatuses::getAllCampaignStatus();
            $statuses_to_print = count($rslt);
            $p = 0;

            while ($p < $statuses_to_print) {
                $row = $rslt[$p];
                $status = $row['status'];
                $status_name[$status] = $row['status_name'];
                $human_answered[$status] = $row['human_answered'];
                $category[$status] = $row['category'];
                $q++;
                $p++;
            }

            $status_name1 = array_unique($status_name);

            $category1 = $category;

            $total_call_log['average_answer'] = ($answered_call_details[0]['average_answer'] ? round($answered_call_details[0]['average_answer'], 2) : 0);
            $total_call_log['answer_percentage'] = $this->calculatePercentage($total_answered_call_details[0]['count'], count($closer_log_list));


            $total_call_log['total_ivr'] = $ivr_call[0]['count'];
            $all_drop_call_details['total_drop_calls'] = count($total_drop_call_details);
            $all_drop_call_details['average_hold_time'] = ($drop_call_details[0]['average_drop_hold'] ? $drop_call_details[0]['average_drop_hold'] : 0);

            if ($did == 'Y') {
                if ($drop_call_details[0]['sum_drop_hold']) {
                    $all_drop_call_details['average_hold_time'] = $drop_call_details[0]['average_drop_hold'];
                    $all_drop_call_details['average_hold_time'] = ($drop_call_details[0]['sum_drop_hold'] / $all_drop_call_details['total_drop_calls']);
                    $all_drop_call_details['average_hold_time'] = round($all_drop_call_details['average_hold_time'], 0);
                } else {
                    $all_drop_call_details['average_hold_time'] = 0;
                }
            }

            $all_drop_call_details['drop_percentage'] = $this->calculatePercentage(count($total_drop_call_details), count($closer_log_list));
     
            $total_queue_calls = count($queue_call_details);
            $total_queue_calls_percent = $this->calculatePercentage(count($queue_call_details), count($closer_log_list));
            $drop_answered_percent = $this->calculatePercentage(count($total_drop_call_details), $total_answered_call_details[0]['count']);
            $total_queue_seconds = $queue_seconds[0]['total_queue_seconds'];
            $avg_queue_length_for_queued = $this->getDivision($total_queue_seconds, count($queue_call_details));
            
            $avg_queue_length_for_queued = round($avg_queue_length_for_queued, 2);

            $avg_queue_length_for_all = $this->getDivision($total_queue_seconds, count($closer_log_list));
            $avg_queue_length_for_all = round($avg_queue_length_for_all, 2);
            $queue_calls_data = [
                'total_queued' => $total_queue_calls,
                'queue_call_percent' => $total_queue_calls_percent,
                'avg_second_for_queued' => $avg_queue_length_for_queued,
                'avg_second_for_all' => $avg_queue_length_for_all
            ];

            $indicators = [];
            $answer_one = ''; $answer_two = '';
            $pct_answer_sec_pct_rt_stat_one = $pct_answer_sec_pct_rt_stat_two = [];
            if (!$answer_sec_pct_rt_stat_one->isEmpty()) {

                $answer_one = $answer_sec_pct_rt_stat_one[0]['answer_sec_pct_rt_stat_one'];
                $answer_two = $answer_sec_pct_rt_stat_one[0]['answer_sec_pct_rt_stat_two'];
                
                $answered_call_details_min_1 = VicidialCloserLog::getSelectedAnsCallDetailsMin($selected_groups, $ans_status_not_in, $answer_one, $start_date, $end_date);

                $answer_sec_pct_rt_stat_one = $answered_call_details_min_1;
                $answered_call_details_max_1 = VicidialCloserLog::getSelectedAnsCallDetailsMax($selected_groups, $ans_status_not_in, $answer_two, $start_date, $end_date);

                $answer_sec_pct_rt_stat_two = $answered_call_details_min_1;
                $pct_answer_sec_pct_rt_stat_one = ($this->getDivision($answer_sec_pct_rt_stat_one[0]['count'], $total_answered_call_details[0]['count']) * 100);
                $pct_answer_sec_pct_rt_stat_one = round($pct_answer_sec_pct_rt_stat_one, 0);
                $pct_answer_sec_pct_rt_stat_two = ($this->getDivision($answer_sec_pct_rt_stat_two[0]['count'], $total_answered_call_details[0]['count']) * 100);
                $pct_answer_sec_pct_rt_stat_two = round($pct_answer_sec_pct_rt_stat_two, 0);
            }

            $category_status_call_detail['vicidial_status_category'] = VicidialStatusCategories::getVscDetails();
            
            $indicators['answer_one'] = $answer_one;
            $indicators['answer_two'] = $answer_two;
            $indicators['answer_percentage'] = $this->calculatePercentage(count($total_answered_call_details), count($closer_log_list));
            $indicators['pct_answer_sec_pct_rt_stat_one'] = $pct_answer_sec_pct_rt_stat_one;
            $indicators['pct_answer_sec_pct_rt_stat_two'] = $pct_answer_sec_pct_rt_stat_two;
            $indicators['drop_answered_percent'] = $drop_answered_percent;

            $hold_time_breakdown = $this->getHoldTimeBreakDownInSeconds($closer_log_list);
            $drop_time_breakdown = $this->getDropTimeBreakDownInSeconds($total_drop_call_details);
            $answer_percent_breakdown = $this->getCumulativeAndTotalPercent($total_answered_call_details[0]['count'], $answered_call_details1, count($closer_log_list));

            $hangup_stats = $this->getCallHangupStats($closer_log_list);
            
            $statu_stats = [];
            if ($did == 'Y') {
                $statu_stats = $this->getCallStatusStats($unique_sql, $start_date, $end_date, $status_name1, $category1, $did);
            } else {
                $statu_stats = $this->getCallStatusStats($selected_groups, $start_date, $end_date, $status_name1, $category1, $did);
            }

            $initial_break_down = $this->getinitialBreakdown($closer_log_list);

            if ($did == 'Y') {
                $agent_stat_detail = $this->getAgentStats($closer_log_list, $unique_sql, $start_date, $end_date, $did);
            } else {
                $agent_stat_detail = $this->getAgentStats($closer_log_list, $selected_groups, $start_date, $end_date, $did);
            }


            if ($did == 'Y') {
                $incrementalcalls = $this->getIncrementTotalCalls($start_date, $end_date, $shift, $unique_sql, $did);
            } else {
                $incrementalcalls = $this->getIncrementTotalCalls($start_date, $end_date, $shift, $selected_groups, $did);
            }
            
            
            if ($did == 'Y') {
                $commonarray15min = $this->getAnsBreakdowndetails($unique_sql, $start_date, $end_date, $shift, $did);
            } else {
                $commonarray15min = $this->getAnsBreakdowndetails($selected_groups, $start_date, $end_date, $shift, $did);
            }

            $values_array = [
                "total_call_log" => $total_call_log,
                "all_drop_call_details" => $all_drop_call_details,
                "campaign_wise_details" => $campaign_wise_details,
                "queue_call_details" => $queue_calls_data,
                "indicators" => $indicators,
                "data" => $request
            ];

            $hold_time_break = $hold_time_breakdown;
            array_unshift($hold_time_break, " ");
            $drop_time_break = $drop_time_breakdown;
            array_unshift($drop_time_break, " ");

            $session_values = ["values_array" => $values_array,
                                "campaing"=> $campaign_wise_details,
                                "hold_time_break" => $hold_time_break,
                                "drop_time_break" =>  $drop_time_break,
                                "answer_percent_break" => $answer_percent_breakdown,
                                "hangup" => $hangup_stats,
                                "statu_stats"=> $statu_stats,
                                "category_status" => $category_status_call_detail,
                                "initial_breakdown"=> $initial_break_down,
                                "agent_statdetail"=> $agent_stat_detail,
                                "commonarray15min"=> $commonarray15min
                                ];

            $datetime = date('H:i:s');
            $maxcamptotalarray = [];
            $maxcampaignivrcallsarray = [];
            $maxcampaigndropcallsarray = [];

            $array = $agent_stat_detail['agentdata'];

            $numbers = array_map(function ($details) {
                return $details['countusers'];
            }, $array);
            $max = (empty($numbers)) ? [] : max($numbers);

            $array = $statu_stats['statsdata'];
            $numbers = array_map(function ($details) {
                return $details['calls'];
            }, $array);
            $maxstate = (empty($numbers)) ? [] : max($numbers);

            if (count($campaign_wise_details) > 1) {
                
                foreach ($campaign_wise_details as $key) {

                    foreach ($key as $ke => $value) {
                        if ($ke == 'campaigntotalcalls') {
                            $val = $value;
                            array_push($maxcamptotalarray, $val);
                        }
                        if ($ke == 'campaignivrcalls') {
                            $val = $value;
                            array_push($maxcampaignivrcallsarray, $val);
                        }
                        if ($ke == 'campaigndropcalls') {
                            $val = $value;
                            array_push($maxcampaigndropcallsarray, $val);
                        }
                    }
                }
            }

            $maxcampaignivrcalls = (empty($maxcampaignivrcallsarray)) ? 0 : max($maxcampaignivrcallsarray);
            $maxcampaigndropcalls = (empty($maxcampaigndropcallsarray)) ? 0 : max($maxcampaigndropcallsarray);

            if (count($maxcamptotalarray) > 0) {
                $maxiver = (empty($maxcamptotalarray)) ? [] : max($maxcamptotalarray);
            } else {
                $maxiver = 0;
            }
            if (count($hangup_stats) > 0) {
                $maxiverhangup = (empty($hangup_stats)) ? [] : max($hangup_stats);
            } else {
                $maxiverhangup = 0;
            }

            if (count($statu_stats) > 0) {
                $maxiverstatusstats = $statu_stats[0]['total']['calls'];
            } else {
                $maxiverstatusstats = 0;
            }

            $count_agent = count($agent_stat_detail['agentdata']);

            if (count($agent_stat_detail) > 0) {
                $maxiveragentstatdetails = $agent_stat_detail[0]['total']['calls'];
            } else {
                $maxiveragentstatdetails = 0;
            }

            $did_arr_sql = $selected_groups;
            $unique_arr_sql = [];
            if ($did == 'Y') {
                $did_arr = VicidialInboundDid::getDidWithSelectedPattern($selected_groups);
                
                $c1 = count($did_arr);

                for ($i = 0; $i < $c1; $i++) {
                    array_push($did_arr_sql, $did_arr[$i]['did_id']);
                }

                $unique_arr = VicidialDidLog::vicidialInboundLogByDidId($did_arr_sql);

                for ($i = 0; $i < count($unique_arr); $i++) {
                    array_push($unique_arr_sql,  $unique_arr[$i]['uniqueid']);
                }
            }

            $bd_answered_calls = 0;
            $gmt_conf_ct_arr = Servers::getServerDetails('Y');

            $dst = date("I");

            if (count($gmt_conf_ct_arr) > 0) {
                $local_gmt = $gmt_conf_ct_arr[0]['local_gmt'];
                $epoch_offset = (($local_gmt + $dst) * 3600);
            }  

            date_default_timezone_set('America/New_York');
            
            $fifteen_min_arr = [];
            if ($did == 'Y') {
                $fifteen_min_arr = VicidialCloserLog::getUniqueAnsweredBreakdownSec($unique_arr_sql, $start_date, $end_date);
            } else {
                $fifteen_min_arr = VicidialCloserLog::getSelectedAnsweredBreakdownSec($did_arr_sql, $start_date, $end_date);
            }
            
            $j = 0;
            $ftotal = $fdrop = [];
            if(isset($fifteen_min_arr)){
                $fifteen_min_arr = $fifteen_min_arr->toArray();
            } else {
                $fifteen_min_arr = [];
            }

            while ($j < count($fifteen_min_arr)) 
            {
                $cstatus[$j] = $fifteen_min_arr[$j]['status'];
                $cqueue[$j] = $fifteen_min_arr[$j]['queue_seconds'];
                $cepoch[$j] = Carbon::parse($fifteen_min_arr[$j]['uncalldate'])->format('U');

                $cdate[$j] = $fifteen_min_arr[$j]['call_date'];
                $crem[$j] = ((int)((int)$cepoch[$j] + (int)$epoch_offset) % 86400);    

                $i = 0;
                $sec = 0;
                $sec_end = 900;
                while ($i <= 96) {
                    if (($crem[$j] >= $sec) and ($crem[$j] < $sec_end)) {

                        $ftotal[$i] = isset($ftotal[$i]) ? $ftotal[$i] : 0 ;
                        $ftotal[$i]++;

                        if (preg_match('/DROP/', $cstatus[$j])) {
                            $fdrop[$i] = isset($fdrop[$i]) ? $fdrop[$i] : 0 ;
                            $fdrop[$i]++;
                        }
                        if (!preg_match('/DROP|XDROP|HXFER|QVMAIL|HOLDTO|LIVE|QUEUE|TIMEOT|AFTHRS|NANQUE|INBND|MAXCAL/', $cstatus[$j])) {
                            $bd_answered_calls++;
                            $fanswer[$i] = isset($fanswer[$i])?$fanswer[$i]:'';
                            $fanswer[$i]++;
                            if ($cqueue[$j] == 0) {

                                $adb_0[$i] = isset($adb_0[$i])?$adb_0[$i]:0;
                                $adb_0[$i]++;
                            }
                            if (($cqueue[$j] > 0) and ($cqueue[$j] <= 5)) {
                                $adb_5[$i] = isset($adb_5[$i])?$adb_5[$i]:0;
                                $adb_5[$i]++;
                            }
                            if (($cqueue[$j] > 5) and ($cqueue[$j] <= 10)) {
                                $adb10[$i] = isset($adb10[$i])?$adb10[$i]:0;
                                $adb10[$i]++;
                            }
                            if (($cqueue[$j] > 10) and ($cqueue[$j] <= 15)) {
                                $adb15[$i] = isset($adb15[$i])?$adb15[$i]:0;
                                $adb15[$i]++;
                            }
                            if (($cqueue[$j] > 15) and ($cqueue[$j] <= 20)) {
                                $adb20[$i] = isset($adb20[$i])?$adb20[$i]:0;
                                $adb20[$i]++;
                            }
                            if (($cqueue[$j] > 20) and ($cqueue[$j] <= 25)) {
                                $adb25[$i] = isset($adb25[$i])?$adb25[$i]:0;
                                $adb25[$i]++;
                            }
                            if (($cqueue[$j] > 25) and ($cqueue[$j] <= 30)) {
                                $adb30[$i] = isset($adb30[$i])?$adb30[$i]:0;
                                $adb30[$i]++;
                            }
                            if (($cqueue[$j] > 30) and ($cqueue[$j] <= 35)) {
                                $adb35[$i] = isset($adb35[$i])?$adb35[$i]:0;
                                $adb35[$i]++;
                            }
                            if (($cqueue[$j] > 35) and ($cqueue[$j] <= 40)) {
                                $adb40[$i] = isset($adb40[$i])?$adb40[$i]:0;
                                $adb40[$i]++;
                            }
                            if (($cqueue[$j] > 40) and ($cqueue[$j] <= 45)) {
                                $adb45[$i] = isset($adb45[$i])?$adb45[$i]:0;
                                $adb45[$i]++;
                            }
                            if (($cqueue[$j] > 45) and ($cqueue[$j] <= 50)) {
                                $adb50[$i] = isset($adb50[$i])?$adb50[$i]:0;
                                $adb50[$i]++;
                            }
                            if (($cqueue[$j] > 50) and ($cqueue[$j] <= 55)) {
                                $adb55[$i] = isset($adb55[$i])?$adb55[$i]:0;
                                $adb55[$i]++;
                            }
                            if (($cqueue[$j] > 55) and ($cqueue[$j] <= 60)) {
                                $adb60[$i] = isset($adb60[$i])?$adb60[$i]:0;
                                $adb60[$i]++;
                            }
                            if (($cqueue[$j] > 60) and ($cqueue[$j] <= 90)) {
                                $adb90[$i] = isset($adb90[$i])?$adb90[$i]:0;
                                $adb90[$i]++;
                            }
                            if ($cqueue[$j] > 90) {
                                $adb99[$i] = isset($adb99[$i])?$adb99[$i]:0;
                                $adb99[$i]++;
                            }
                        }
                    }
                    $sec = ($sec + 900);
                    $sec_end = ($sec_end + 900);
                    $i++;
                }

                $j++;
            }

            ##### 15-minute total and drops graph
            $hi_hour_count = 0;
            $last_full_record = 0;
            $i = 0;
            $h = 0;
            while ($i <= 96) {
                $hour_count[$i] = isset($ftotal[$i]) ? $ftotal[$i] : 0 ; 
                if ($hour_count[$i] > $hi_hour_count) {
                    $hi_hour_count = $hour_count[$i];
                }
                if ($hour_count[$i] > 0) {
                    $last_full_record = $i;
                }
                $drop_count[$i] = isset($fdrop[$i]) ? $fdrop[$i] : 0 ; 
                $i++;
            }

            $hour_multiplier = $this->MathZDC(100, $hi_hour_count);
            $k = 1;
            $mk = 0;
            $call_scale = '0';
            $call_scale_arr = [];
            array_push($call_scale_arr, 0);
            while ($k <= 102) {
                if ($mk >= 5) {
                    $mk = 0;
                    $scale_num = $this->MathZDC($k, $hour_multiplier);
                    $scale_num = round($scale_num, 0);
                    $len_scale_num = (strlen($scale_num));
                    $k = ($k + $len_scale_num);
                    $call_scales = "$scale_num";
                    array_push($call_scale_arr, $scale_num);
                } else {
                    $call_scale .= " ";
                    $k++;
                    $mk++;
                }
            }

            $zz = '00';
            $i = 0;
            $h = 4;
            $hour = -1;
            $no_lines_yet = 1;
            $max_calls = $max_drops = 0;

            while ($i <= 96) {
                $char_counter = 0;
                $time = '      ';
                if ($h >= 4) {
                    $hour++;
                    $h = 0;
                    if ($hour < 10) {
                        $hour = "0$hour";
                    }
                    $time = "+$hour$zz+";

                }
                if ($h == 1) {
                    $time = "   15 ";
                }
                if ($h == 2) {
                    $time = "   30 ";
                }
                if ($h == 3) {
                    $time = "   45 ";
                }
                $ghour_count = $hour_count[$i];

                if ($ghour_count < 1) {
                    if (($no_lines_yet) or ($i > $last_full_record)) {
                        $do_nothing = 1;
                    } else {
                        $hour_count[$i] = sprintf("%-5s", $hour_count[$i]);
                        $text_arr[$i]['time'] = $time;
                        $text_arr[$i]['color_r'] = '';
                        $text_arr[$i]['arrow'] = '';
                        $text_arr[$i]['color_g'] = 'green';
                        $text_arr[$i]['calls'] = 0;
                        $text_arr[$i]['drops'] = 0;

                        $k = 0;
                        while ($k <= 102) {
                            $k++;
                        }
                    }
                } else {
                    $no_lines_yet = 0;
                    $xhour_count = ($ghour_count * $hour_multiplier);
                    $yhour_count = (99 - $xhour_count);
                    $gdrop_count = $drop_count[$i];
                    $text_arr[$i]['time'] = $time;
                    $text_arr[$i]['color_r'] = '';
                    $text_arr[$i]['arrow'] = '';
                    $text_arr[$i]['color_g'] = 'green';
                    if ($gdrop_count < 1) {
                        $hour_count[$i] = sprintf("%-5s", $hour_count[$i]);
                        $k = 0;
                        $ascii_text = '';
                        while ($k <= $xhour_count) {
                            $ascii_text .= "*";
                            $k++;
                            $char_counter++;
                        }
                        $text_arr[$i]['stars'] = $ascii_text;
                        $text_arr[$i]['stars'] .= '*X';
                        $char_counter++;
                        $k = 0;
                        while ($k <= $yhour_count) {
                            $k++;
                            $char_counter++;
                        }
                        while ($char_counter <= 101) {
                            $char_counter++;
                        }
                        $text_arr[$i]['calls'] = $hour_count[$i];
                        $text_arr[$i]['drops'] = 0;
                    } else {
                        $xdrop_count = ($gdrop_count * $hour_multiplier);
                        $xxhour_count = (($xhour_count - $xdrop_count) - 1);

                        $hour_count[$i] += 0;
                        $drop_count[$i] += 0;

                        $hour_count[$i] = sprintf("%-5s", $hour_count[$i]);
                        $drop_count[$i] = sprintf("%-5s", $drop_count[$i]);

                        $text_arr[$i]['time'] = $time;
                        $text_arr[$i]['color_r'] = 'red';
                        $k = 0;
                        $ascii_text = ' ';
                        while ($k <= $xdrop_count) {
                            $ascii_text .= ">";
                            $k++;
                            $char_counter++;
                        }
                        $text_arr[$i]['arrow'] = $ascii_text;
                        $text_arr[$i]['arrow'] .= 'D';
                        $text_arr[$i]['color_g'] = 'green';
                        $char_counter++;
                        $k = 0;
                        $ascii_text = ' ';
                        while ($k <= $xxhour_count) {
                            $ascii_text .= "*";
                            $k++;
                            $char_counter++;
                        }
                        $text_arr[$i]['stars'] = $ascii_text;
                        $text_arr[$i]['stars'] .= 'X';
                        $char_counter++;
                        $k = 0;
                        while ($k <= $yhour_count) {
                            $k++;
                            $char_counter++;
                        }
                        while ($char_counter <= 102) {
                            $char_counter++;
                        }
                        $text_arr[$i]['calls'] = $hour_count[$i];
                        $text_arr[$i]['drops'] = $drop_count[$i];
                    }
                }
                $graph_stats[$i][0] = "$time";
                $graph_stats[$i][1] = trim($hour_count[$i]);
                $graph_stats[$i][2] = trim($drop_count[$i]);
                if (trim($hour_count[$i]) > $max_calls) {
                    $max_calls = trim($hour_count[$i]);
                }
                if (trim($drop_count[$i]) > $max_drops) {
                    $max_drops = trim($drop_count[$i]);
                }
                $i++;
                $h++;
            }

            #CALL ANSWERED TIME BREAKDOWN IN SECONDS
            $zz = '00';
            $i = 0;
            $h = 4;
            $hour = -1;
            $no_lines_yet = 1;
            while ($i <= 96) {
                $char_counter = 0;
                $time = '      ';
                if ($h >= 4) {
                    $hour++;
                    $h = 0;
                    if ($hour < 10) {
                        $hour = "0$hour";
                    }
                    $time = "+$hour$zz+";
                    $sql_time = "".$hour.":".$zz.":00";
                    $sql_time_end = "".$hour.":15:00";
                }
                if ($h == 1) {
                    $time = "   15 ";
                    $sql_time = "".$hour.":15:00";
                    $sql_time_end = "".$hour.":30:00";
                }
                if ($h == 2) {
                    $time = "   30 ";
                    $sql_time = "".$hour.":30:00";
                    $sql_time_end = "".$hour.":45:00";
                }
                if ($h == 3) {
                    $time = "   45 ";
                    $sql_time = "".$hour.":45:00";
                    $hour_end = ($hour + 1);
                    if ($hour_end < 10) {
                        $hour_end = "0".$hour_end."";
                    }
                    if ($hour_end > 23) {
                        $sql_time_end = "23:59:59";
                    } else {
                        $sql_time_end = "".$hour_end.":00:00";
                    }
                }
                $adb_0[$i] = isset($adb_0[$i])?$adb_0[$i]:'-';

                $adb_5[$i] = isset($adb_5[$i])?$adb_5[$i]:'-';

                $adb10[$i] = isset($adb10[$i])?$adb10[$i]:'-';

                $adb15[$i] = isset($adb15[$i])?$adb15[$i]:'-';

                $adb20[$i] = isset($adb20[$i])?$adb20[$i]:'-';

                $adb25[$i] = isset($adb25[$i])?$adb25[$i]:'-';

                $adb30[$i] = isset($adb30[$i])?$adb30[$i]:'-';

                $adb35[$i] = isset($adb35[$i])?$adb35[$i]:'-';

                $adb40[$i] = isset($adb40[$i])?$adb40[$i]:'-';

                $adb45[$i] = isset($adb45[$i])?$adb45[$i]:'-';

                $adb50[$i] = isset($adb50[$i])?$adb50[$i]:'-';

                $adb55[$i] = isset($adb55[$i])?$adb55[$i]:'-';

                $adb60[$i] = isset($adb60[$i])?$adb60[$i]:'-';

                $adb90[$i] = isset($adb90[$i])?$adb90[$i]:'-';

                $adb99[$i] = isset($adb99[$i])?$adb99[$i]:'-';

                $fanswer[$i] = isset($fanswer[$i])?$fanswer[$i]:0;

                $fanswer[$i] = sprintf("%10s", $fanswer[$i]);
                $callans_breakdown[$i]['time'] = str_replace(" ", "", $time);
                $callans_breakdown[$i][0] = str_replace(" ", "", $adb_0[$i]);
                $callans_breakdown[$i][5] = str_replace(" ", "", $adb_5[$i]);
                $callans_breakdown[$i][10] = str_replace(" ", "", $adb10[$i]);
                $callans_breakdown[$i][15] = str_replace(" ", "", $adb15[$i]);
                $callans_breakdown[$i][20] = str_replace(" ", "", $adb20[$i]);
                $callans_breakdown[$i][25] = str_replace(" ", "", $adb25[$i]);
                $callans_breakdown[$i][30] = str_replace(" ", "", $adb30[$i]);
                $callans_breakdown[$i][35] = str_replace(" ", "", $adb35[$i]);
                $callans_breakdown[$i][40] = str_replace(" ", "", $adb40[$i]);
                $callans_breakdown[$i][45] = str_replace(" ", "", $adb45[$i]);
                $callans_breakdown[$i][50] = str_replace(" ", "", $adb50[$i]);
                $callans_breakdown[$i][55] = str_replace(" ", "", $adb55[$i]);
                $callans_breakdown[$i][60] = str_replace(" ", "", $adb60[$i]);
                $callans_breakdown[$i][90] = str_replace(" ", "", $adb90[$i]);
                $callans_breakdown[$i][99] = str_replace(" ", "", $adb99[$i]);
                $callans_breakdown[$i]['total'] = str_replace(" ", "", $fanswer[$i]);

                $i++;
                $h++;
            }

            $seventh_tables = [];
            if ($report_display_type == 'TEXT') {

                $spacesbulid = '';
                $spaces = 103 / count($call_scale_arr);
                for ($i = 0; $i <= (round($spaces)); $i++) {
                    $spacesbulid .= '&nbsp;';
                }
                $td_val = '';
                
                foreach ($call_scale_arr as $key => $val) {
                    
                    $td_val .= $val . $spacesbulid;
                }
                $seventh_tables['graph_in_15_min'] = substr($td_val, 0, -($spaces + 1));
            }

            $fifteen_minute_table = @array_values($text_arr);

            $tbl_download = [];
            $seventh_tables['fifteen_minute_table'] = $fifteen_minute_table;
            for ($i = 0; $i < count($fifteen_minute_table); $i++) {
                $tbl_download['time'][$i] = $fifteen_minute_table[$i]['time'];
                $tbl_download['drops'][$i] = $fifteen_minute_table[$i]['drops'];
                $tbl_download['calls'][$i] = $fifteen_minute_table[$i]['calls'];
            }


            $callans_breakdown_sum = array_sum(array_map(function ($el) {
                return $el['total'];
            }, $callans_breakdown));

            $seventh_tables['callans_breakdown_sum'] = $callans_breakdown_sum;

            $callans_time_breakdown_arr = [];
            $callans_time_breakdown = $callans_breakdown;
            for ($i = 0; $i < count($callans_time_breakdown); $i++) {
                $callans_time_breakdown_arr[$i] = $callans_time_breakdown[$i];
            }
            $seventh_tables['callans_time_breakdown'] = $callans_time_breakdown_arr;

            $download_csv_array = [
                'multi_group_breakdown',
                'call_breakdown',
                'call_hangup_reason_stats',
                'call_status_stat',
                'custom_status_category_stats',
                'call_initial_queue_position_breakdown',
                'agent_stats',
                'graph_in_15_minute',
                'call_answered_time_breakdown_in_seconds'
            ];
            $download_data = '';

            if(isset($request['download_csv']) && in_array($request['download_csv'], $download_csv_array) && strlen($request['download_csv']) > 0 ){
                switch ($request['download_csv']) {
                    case "multi_group_breakdown":
                        return $this->multiGroupBreakdown($group_string, $request['start_date'], $request['end_date'], $campaign_wise_details, $total_call_log, $all_drop_call_details, $indicators, $queue_calls_data);
                        break;
                    case "call_breakdown":
                        return $this->callBreakdownDownload($hold_time_breakdown, $drop_time_breakdown,$answer_percent_breakdown);
                        break;
                    case "call_hangup_reason_stats":
                        return $this->hangupCallsDownload($hangup_stats);
                        break;
                    case "call_status_stat":
                        return $this->callStatusStat($statu_stats);
                        break;
                    case "custom_status_category_stats":
                        return $this->customStatusCategoryStats($category_status_call_detail);
                        break;
                    case "call_initial_queue_position_breakdown":
                        return $this->callInitialQueuePositionBreakdown($initial_break_down);
                        break;
                    case "agent_stats":
                        return $this->agentStats($agent_stat_detail);
                        break;
                    case "graph_in_15_minute":
                        return $this->graphIn15MinuteIncrementsOfTotalCallsTakenIntoThisInGroup($seventh_tables, $report_display_type);
                        break;
                    case "call_answered_time_breakdown_in_seconds":
                        return $this->callAnsweredTimeBreakdownInSeconds($seventh_tables);
                        break;
                    default:
                        echo "default";
                }
            } else {

                return response()->json([
                'status' => 200,
                'message' => 'Success',
                'data' => [
                    'maxiveragentstatdetails' => $maxiveragentstatdetails,
                    'maxiverstatusstats' => $maxiverstatusstats,
                    'maxiverhangup' => $maxiverhangup,
                    'maxiver' => $maxiver,
                    'datetime' => $datetime,
                    'group_string' => $group_string,
                    "total_call_log" => $total_call_log,
                    "all_drop_call_details" => $all_drop_call_details,
                    "campaign_wise_details" => $campaign_wise_details,
                    "queue_calls_data" => $queue_calls_data,
                    "indicators" => $indicators,
                    "hold_time_breakdown" => $hold_time_breakdown,
                    "drop_time_breakdown" => $drop_time_breakdown,
                    "answer_percent_breakdown" => $answer_percent_breakdown,
                    "hangup_stats" => $hangup_stats,
                    "status_stats" => $statu_stats,
                    "category_status_call_detail" => $category_status_call_detail,
                    "initialBreakDown" => $initial_break_down,
                    "agent_stat_detail" => $agent_stat_detail,
                    "commonarray15min" => $commonarray15min,
                    "incrementalcalls" => $incrementalcalls,
                    "count_agent" => $count_agent,
                    "maxcampaignivrcalls" => $maxcampaignivrcalls,
                    "maxcampaigndropcalls" => $maxcampaigndropcalls,
                    'agentmax' => $max,
                    'maxstatusstate' => $maxstate,
                    'startdate' => $start_date,
                    'enddate' => $end_date,
                    'seventhtable' => $seventh_tables,
                    'tblDownload' => $tbl_download,
                    'download_csv_array'=> $download_csv_array
                ],
            ],200);

            }

        }catch (Exception $e) {
            throw $e;
        }
    }

    public function graphIn15MinuteIncrementsOfTotalCallsTakenIntoThisInGroup($seventh_tables, $report_display_type){
        
        $filename = "graphIn15MinuteIncrementsOfTotalCallsTakenIntoThisInGroup.csv";
        $handle = fopen($filename, 'w+');

        $seventh_tables_final_data = [
            '1' => [
                'HOUR',
                'DROPS',
                'TOTAL'
            ]
        ];

        foreach($seventh_tables_final_data as $key => $rows){
            fputcsv($handle, $rows, ";",'"');
        }

        $seventh_tables_array = [];
        if($report_display_type == 'TEXT'){
            
            foreach($seventh_tables['fifteen_minute_table'] as $rows){
                $seventh_tables_array_1['time'] = $rows['time'];
                $seventh_tables_array_1['drops'] = $rows['drops'];
                $seventh_tables_array_1['calls'] = $rows['calls'];
                array_push($seventh_tables_array, $seventh_tables_array_1);
            }
        } else {
            foreach($seventh_tables['fifteen_minute_table'] as $rows){
                $seventh_tables_array_1['time'] = $rows[0];
                $seventh_tables_array_1['drops'] = $rows[1];
                $seventh_tables_array_1['calls'] = $rows[2];
                array_push($seventh_tables_array, $seventh_tables_array_1);
            }
        }

        foreach($seventh_tables_array as $key => $rows){
            fputcsv($handle, $rows, ",",'"');   
        }

        fclose($handle);
        $headers = [
                'Content-Type' => 'text/csv',
        ];

        return Response::download($filename,  'graphIn15MinuteIncrementsOfTotalCallsTakenIntoThisInGroup.csv', $headers)->deleteFileAfterSend(true);
    }


    public function callAnsweredTimeBreakdownInSeconds($seventh_tables){
        
        $filename = "callAnsweredTimeBreakdownInSeconds.csv";
        $handle = fopen($filename, 'w+');

        $seventh_tables_final_data = [
            '1' => ['CALL ANSWERED TIME BREAKDOWN IN SECONDS'],
            '2' => [
                'HOUR',
                '0',
                '5',
                '10',
                '15',
                '20',
                '25',
                '30',
                '35',
                '40',
                '45',
                '50',
                '55',
                '60',
                '90',
                '90+',
                'Total'
            ]
        ];

        foreach($seventh_tables_final_data as $key => $rows){
            fputcsv($handle, $rows, ";",'"');
        }

        $total_of = 0;
        foreach($seventh_tables['callans_time_breakdown'] as $key => $rows){
            fputcsv($handle, $rows, ",",'"');
            $total_of += $rows['total'];
        }

        $seventh_tables_footer_data = [
            '1' => [
                'Total',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                $total_of
            ]
        ];

        foreach($seventh_tables_footer_data as $key => $rows){
            fputcsv($handle, $rows, ";",'"');
        }

        fclose($handle);
        $headers = [
                'Content-Type' => 'text/csv',
        ];

        return Response::download($filename,  'callAnsweredTimeBreakdownInSeconds.csv', $headers)->deleteFileAfterSend(true);
    }

    //download csv data from db
    public function multiGroupBreakdown($group_string,$start_date, $end_date, $campaign_wise_details, $total_call_log, $all_drop_call_details, $indicators, $queue_calls_data){

        $filename = "multiGroupBreakdown.csv";
        $handle = fopen($filename, 'w+');

        $group_string_data = [
            '1' => ['Inbound Call Stats:', $group_string, $start_date.' '.$end_date]
        ];

        foreach($group_string_data as $key => $rows){
            fputcsv($handle, $rows, ";",'"');
        }

        fputcsv($handle, [""=>""], ";",'"');


        $campaign_wise_details_data = [
            '1' => ['MULTI-GROUP BREAKDOWN:'],
            '2' => ['IN-GROUP', 'CALLS', 'DROPS', 'DROP %', 'IVR']
        ];

        foreach($campaign_wise_details_data as $key => $rows){
            fputcsv($handle, $rows, ";",'"');
        }

        // fputcsv($handle, [""=>""], ";",'"');

        $i=0;
        $campaign_wise_details_array = [];
        foreach($campaign_wise_details as $rows){

            $campaign_wise_details_array_1['campaign_id'] = $rows['campaign_id'];
            $campaign_wise_details_array_1['campaign_total_calls'] = $rows['campaign_total_calls'];
            $campaign_wise_details_array_1['campaign_drop_calls'] = $rows['campaign_drop_calls'];
            $campaign_wise_details_array_1['campaign_drop_persent'] = $rows['campaign_drop_persent'];
            $campaign_wise_details_array_1['campaign_ivr_calls'] = $rows['campaign_ivr_calls'];
            array_push($campaign_wise_details_array, $campaign_wise_details_array_1);
        }

        foreach($campaign_wise_details_array as $key => $rows){
            fputcsv($handle, $rows, ",",'"');   
        }

        fputcsv($handle, [""=>""], ";",'"');

        $total_call_log_header = [
            '1' => ['Time range:','2018-08-06', 'to', '2018-08-06'],
            '2' => ['Total calls taken in to this In-Group:', $total_call_log['total_calls']],
            '3' => ['Average Call Length for all Calls:', $total_call_log['avg_all_call']. " seconds"],
            '4' => ['Answered Calls:', $total_call_log['total_answer_call'].' '.$total_call_log['answer_percentage']. "%" ],
            '5' => ['Average queue time for Answered Calls:', $total_call_log['average_answer']. " seconds" ],
            '6  ' => ['Calls taken into the IVR for this In-Group:', $total_call_log['total_ivr']]
        ];

        foreach($total_call_log_header as $key => $rows){
            fputcsv($handle, $rows, ";",'"');
        }

        fputcsv($handle, [""=>""], ";",'"');

        $all_drop_call_details_header = [
            '1' => ['DROPS'],
            '2' => ['Total DROP Calls:', $all_drop_call_details['total_drop_calls']. "  " .$all_drop_call_details['drop_percentage']. "%", 'drop/answered:', $all_drop_call_details['drop_percentage']. "%"],
            '3' => ['Average hold time for DROP Calls:', $all_drop_call_details['average_hold_time']. " seconds"]
        ];

        foreach($all_drop_call_details_header as $key => $rows){
            fputcsv($handle, $rows, ";",'"');
        }

        fputcsv($handle, [""=>""], ";",'"');

        $indicators_header = [
            '1' => ['CUSTOM INDICATORS'],
            '2' => ['GDE (Answered/Total calls taken in to this In-Group):', $indicators['answer_percentage']. "%"],
            '3' => ['ACR (Dropped/Answered):', $indicators['drop_answered_percent']. "%"],
            '4' => ['TMR1 (Answered within 20 seconds/Answered):', $indicators['pct_answer_sec_pct_rt_stat_one']. "%"],
            '5' => ['TMR2 (Answered within 30 seconds/Answered):', $indicators['pct_answer_sec_pct_rt_stat_two']. "%"]
        ];

        foreach($indicators_header as $key => $rows){
            fputcsv($handle, $rows, ";",'"');
        }

        fputcsv($handle, [""=>""], ";",'"');

        $queue_calls_data_header = [
            '1' => ['QUEUE STATS'],
            '2' => ['Total Calls That entered Queue:', $queue_calls_data['total_queued'], $queue_calls_data['queue_call_percent']. "%"],
            '3' => ['Average QUEUE Length for queue calls:', $queue_calls_data['avg_second_for_queued']. "seconds"],
            '4' => ['Average QUEUE Length across all calls:', $queue_calls_data['avg_second_for_all']. "seconds"]
        ];

        foreach($queue_calls_data_header as $key => $rows){
            fputcsv($handle, $rows, ";",'"');
        }

        fclose($handle);
        $headers = [
                'Content-Type' => 'text/csv',
        ];

        return Response::download($filename,  'multiGroupBreakdown.csv', $headers)->deleteFileAfterSend(true);
    }

    public function agentStats($agent_stat_detail){

        $filename = "agentStats.csv";
        $handle = fopen($filename, 'w+');

        $agent_stat_detail_data = [
            '1' => ['AGENT STATS'],
            '2' => [
                'AGENT',
                'CALLS',
                'AVERAGE',
                'TIME H:M:S'
            ]
        ];

        foreach($agent_stat_detail_data as $key => $rows){
            fputcsv($handle, $rows, ";",'"');
        }

        foreach($agent_stat_detail['agentdata'] as $key => $rows){
            fputcsv($handle, $rows, ",",'"');   
        }

        $agent_stat_detail_total_data = [
            '1' => [
                'Total '.$agent_stat_detail[0]['total']['calls'],
                $agent_stat_detail[0]['total']['agentcalls'],
                $agent_stat_detail[0]['total']['avg_len'],
                $agent_stat_detail[0]['total']['sum_len']
            ]
        ];

        foreach($agent_stat_detail_total_data as $key => $rows){
            fputcsv($handle, $rows, ";",'"');
        }

        fclose($handle);
        $headers = [
                'Content-Type' => 'text/csv',
        ];

        return Response::download($filename,  'agentStats.csv', $headers)->deleteFileAfterSend(true);
    }


    public function callInitialQueuePositionBreakdown($initial_break_down){

        $filename = "callInitialQueuePositionBreakdown.csv";
        $handle = fopen($filename, 'w+');

        $initial_break_down_data = [
            '1' => ['CALL  INITIAL QUEUE POSITION BREAKDOWN'],
            '2' => [
                '0',
                '1',
                '2',
                '3',
                '4',
                '5',
                '6',
                '7',
                '8',
                '9',
                '10',
                '15',
                '20',
                '25',
                '25+',
                'TOTAL'
            ]
        ];

        foreach($initial_break_down_data as $key => $rows){
            fputcsv($handle, $rows, ";",'"');
        }  

        fputcsv($handle, $initial_break_down, ";",'"');

        fclose($handle);
        $headers = [
                'Content-Type' => 'text/csv',
        ];

        return Response::download($filename,  'callInitialQueuePositionBreakdown.csv', $headers)->deleteFileAfterSend(true);
    }

    public function customStatusCategoryStats($category_status_call_detail){

        $filename = "customStatusCategoryStats.csv";
        $handle = fopen($filename, 'w+');

        $category_status_call_detail_data = [
            '1' => ['CUSTOM STATUS CATEGORY STATS'],
            '2' => [
                'CATEGORY',
                'DESCRIPTION',
                'CALLS'
            ]
        ];

        foreach($category_status_call_detail_data as $key => $rows){
            fputcsv($handle, $rows, ";",'"');
        }

        //call data is not set here so created new array and set call to null.
        $i=0;
        $category_status_call_detail_array = [];
        foreach($category_status_call_detail['vicidial_status_category'] as $rows){

            $category_status_call_detail_array_1['vsc_id'] = $rows['vsc_id'];
            $category_status_call_detail_array_1['vsc_name'] = $rows['vsc_name'];
            $category_status_call_detail_array_1['call'] = '';
            array_push($category_status_call_detail_array, $category_status_call_detail_array_1);
        }

        foreach($category_status_call_detail_array as $key => $rows){
            fputcsv($handle, $rows, ",",'"');   
        }

        fclose($handle);
        $headers = [
                'Content-Type' => 'text/csv',
        ];

        return Response::download($filename,  'customStatusCategoryStats.csv', $headers)->deleteFileAfterSend(true);
    }

    public function callStatusStat($statu_stats){

        $filename = "callStatusStat.csv";
        $handle = fopen($filename, 'w+');

        $statu_stats_data = [
            '1' => ['CALL STATUS STATS'],
            '2' => [
                'STATUS',
                'DESCRIPTION',
                'CATEGORY',
                'CALLS',
                'TOTAL TIME',
                'AVG TIME',
                'CALL /HOUR'
            ]
        ];

        foreach($statu_stats_data as $key => $rows){
            fputcsv($handle, $rows, ";",'"');
        }

        foreach($statu_stats['statsdata'] as $key => $rows){
            fputcsv($handle, $rows, ",",'"');   
        }

        $hangup_stats_total_data = [
            '1' => [
                'Total',
                '',
                '',
                $statu_stats[0]['total']['calls'],
                $statu_stats[0]['total']['totTime'],
                $statu_stats[0]['total']['avg_sec'],
                $statu_stats[0]['total']['callperhour']
            ]
        ];

        foreach($hangup_stats_total_data as $key => $rows){
            fputcsv($handle, $rows, ";",'"');
        }

        fclose($handle);
        $headers = [
                'Content-Type' => 'text/csv',
        ];

        return Response::download($filename,  'callStatusStat.csv', $headers)->deleteFileAfterSend(true);
    }

    
    public function hangupCallsDownload($hangup_stats){
        
        $filename = "hangupCallsDownload.csv";
        $handle = fopen($filename, 'w+');

        //$hold_time_breakdown operation
        $hangup_stats_data = [
            '1' => ['CALL  HANGUP REASON STATS'],
            '2' => [
                'HANGUP REASON',
                'CALLS'
            ]
        ];

        $new_array = [];
        foreach($hangup_stats as $key => $value){
            $i=0;
            $new_array_1 = [];
            $new_array_1[$i] = $key;
            $i++;
            $new_array_1[$i] = $value;
            array_push($new_array, $new_array_1);
        }

        foreach($hangup_stats_data as $key => $rows){
            fputcsv($handle, $rows, ";",'"');
        }

        foreach($new_array as $key => $rows){
            fputcsv($handle, $rows, ",",'"');   
        }

        fclose($handle);
        $headers = [
                'Content-Type' => 'text/csv',
        ];

        return Response::download($filename,  'hangupCallsDownload.csv', $headers)->deleteFileAfterSend(true);
    }


    //download csv data from db
    public function callBreakdownDownload($hold_time_breakdown, $drop_time_breakdown,$answer_percent_breakdown){
        
        //$hold_time_breakdown operation
        $hold_time_breakdown_data = [
            '1' => ['CALL ANSWERED TIME BREAKDOWN IN SECONDS'],
            '2' => [
                '',
                '0',
                '5',
                '10',
                '15',
                '20',
                '25',
                '30',
                '35',
                '40',
                '45',
                '50',
                '55',
                '60',
                '90',
                '+90',
                'TOTAL'
            ]
        ];

        $filename = "callBreakdownDownload.csv";
        $handle = fopen($filename, 'w+');
        
        foreach($hold_time_breakdown_data as $key => $rows){
                fputcsv($handle, $rows, ";",'"');
        }
        array_unshift($hold_time_breakdown,"");
        if($rows == 'time'){
            fputcsv($handle, $hold_time_breakdown, ";",'"');
        }
        if($rows != 'time'){
            fputcsv($handle, $hold_time_breakdown, ";",'"');
        }
        

        fputcsv($handle, [""=>""], ";",'"');


        //$hold_time_breakdown operation
        $drop_time_breakdown_data = [
            '1' => ['CALL DROP TIME BREAKDOWN IN SECONDS'],
            '2' => [
                '',
                '0',
                '5',
                '10',
                '15',
                '20',
                '25',
                '30',
                '35',
                '40',
                '45',
                '50',
                '55',
                '60',
                '90',
                '+90',
                'TOTAL'
            ]
        ];

        foreach($drop_time_breakdown_data as $key => $rows){
            fputcsv($handle, $rows, ";",'"');
        }
        array_unshift($drop_time_breakdown,"");
        if($rows == 'time'){
            fputcsv($handle, $drop_time_breakdown, ";",'"');
        }
        if($rows != 'time'){
            fputcsv($handle, $drop_time_breakdown, ";",'"');
        }


        fputcsv($handle, [""=>""], ";",'"');


        //$hold_time_breakdown operation
        $answer_percent_breakdown_data = [
            '1' => ['CALL ANSWERED TIME AND PERCENT BREAKDOWN IN SECONDS'],
            '2' => [
                '',
                '0',
                '5',
                '10',
                '15',
                '20',
                '25',
                '30',
                '35',
                '40',
                '45',
                '50',
                '55',
                '60',
                '90',
                '+90',
                'TOTAL Agents'
            ]
        ];

        foreach($answer_percent_breakdown_data as $key => $rows){
            fputcsv($handle, $rows, ";",'"');
        }
        foreach($answer_percent_breakdown as $key => $rows){

            $new_array = [];
            foreach ($rows as $key => $value) {
                $new_key = $key;
                // $new_array[$new_key] = str_replace("%","",$value);
                $new_array[$new_key] = $value;
            }

            array_unshift($drop_time_breakdown,'');

            if($new_array == 'time'){
                fputcsv($handle, $new_array, ",",'"');
            }
            if($new_array != 'time'){
                fputcsv($handle, $new_array, ";",'"');
            }
        }

        fclose($handle);
        $headers = [
                'Content-Type' => 'text/csv',
        ];

        return Response::download($filename,  'callBreakdownDownload.csv', $headers)->deleteFileAfterSend(true);
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

    public function getAnsBreakdowndetails($selected_groups, $start_date, $end_date, $shift, $did) {
        
        $server_gmt_time = Servers::getServerDetails('Y');

        $dst = date("I");
        if (count($server_gmt_time) > 0) {
            $local_gmt = $server_gmt_time[0]['local_gmt'];
            $epoch_offset = (($local_gmt + $dst) * 3600);
        }

        $answerd_breakdown_seconds = VicidialCloserLog::getSelectedAnsweredBreakdownSec($selected_groups, $start_date, $end_date);
        if ($did == "Y") {
            $answerd_breakdown_seconds = VicidialCloserLog::getUniqueAnsweredBreakdownSec($selected_groups, $start_date, $end_date);
        }

        $j = 0;
        $adb0 = $adb5 = $adb10 = $adb15 = $adb20 = $adb25 = $adb30 = $adb35 = $adb40 = $adb45 = $adb50 = $adb55 = $adb60 = $adb90 = $adb99 = $fdrop = $ftotal = $fanswer = $cstatus = $cqueue = $cepoch = $cdate = $crem = [];
        $bd_answered_calls = 0;
        while ($j < count($answerd_breakdown_seconds)) {

            $cstatus[$j] = $answerd_breakdown_seconds[$j]['status'];
            $cqueue[$j] = $answerd_breakdown_seconds[$j]['queue_seconds'];
            $cepoch[$j] = strtotime($answerd_breakdown_seconds[$j]['uncalldate']);
            $cdate[$j] = $answerd_breakdown_seconds[$j]['call_date'];
            // echo $cepoch[$j].' : '.$epoch_offset."   ::   ";
            $crem[$j] = (($cepoch[$j] + $epoch_offset) % 86400);
            $j++;
        }

        $j = 0;
        while ($j < count($answerd_breakdown_seconds)) {
            $i = 0;
            $sec = 0;
            $sec_end = 900;
            while ($i <= 96) {

                if (($crem[$j] >= $sec) and ($crem[$j] < $sec_end)) {
                    $ftotal[$i] = isset($ftotal[$i]) ? $ftotal[$i] : 0 ;
                    $ftotal[$i]++;

                    if (preg_match('/DROP/', $cstatus[$j])) {
                        $fdrop[$i] = isset($fdrop[$i]) ? $fdrop[$i] : 0 ;
                        $fdrop[$i]++;
                    }
                    if (!preg_match('/DROP|XDROP|HXFER|QVMAIL|HOLDTO|LIVE|QUEUE|TIMEOT|AFTHRS|NANQUE|INBND|MAXCAL/', $cstatus[$j])) {
                        $bd_answered_calls++;
                        $fanswer[$i] = isset($fanswer[$i])?$fanswer[$i]:0;
                        $fanswer[$i]++;
                        
                        if ($cqueue[$j] == 0) {
                            $adb_0 = $this->setArrayValue($adb0, $i);
                        }
                        if (($cqueue[$j] > 0) and ($cqueue[$j] <= 5)) {
                            $adb_5 = $this->setArrayValue($adb5, $i);
                        }
                        if (($cqueue[$j] > 5) and ($cqueue[$j] <= 10)) {
                            $adb10 = $this->setArrayValue($adb10, $i);
                        }
                        if (($cqueue[$j] > 10) and ($cqueue[$j] <= 15)) {
                            $adb15 = $this->setArrayValue($adb15, $i);
                        }
                        if (($cqueue[$j] > 15) and ($cqueue[$j] <= 20)) {
                            $adb20 = $this->setArrayValue($adb20, $i);
                        }
                        if (($cqueue[$j] > 20) and ($cqueue[$j] <= 25)) {
                            $adb25 = $this->setArrayValue($adb25, $i);
                        }
                        if (($cqueue[$j] > 25) and ($cqueue[$j] <= 30)) {
                            $adb30 = $this->setArrayValue($adb30, $i);
                        }
                        if (($cqueue[$j] > 30) and ($cqueue[$j] <= 35)) {
                            $adb35 = $this->setArrayValue($adb35, $i);
                        }
                        if (($cqueue[$j] > 35) and ($cqueue[$j] <= 40)) {
                            $adb40 = $this->setArrayValue($adb40, $i);
                        }
                        if (($cqueue[$j] > 40) and ($cqueue[$j] <= 45)) {
                            $adb45 = $this->setArrayValue($adb45, $i);
                        }
                        if (($cqueue[$j] > 45) and ($cqueue[$j] <= 50)) {
                            $adb50 = $this->setArrayValue($adb50, $i);
                        }
                        if (($cqueue[$j] > 50) and ($cqueue[$j] <= 55)) {
                            $adb55 = $this->setArrayValue($adb55, $i);
                        }
                        if (($cqueue[$j] > 55) and ($cqueue[$j] <= 60)) {
                            $adb60 = $this->setArrayValue($adb60, $i);
                        }
                        if (($cqueue[$j] > 60) and ($cqueue[$j] <= 90)) {
                            $adb90 = $this->setArrayValue($adb90, $i);
                        }
                        if ($cqueue[$j] > 90) {
                            $adb99 = $this->setArrayValue($adb99, $i);
                        }
                    }
                }
                $sec = ($sec + 900);
                $sec_end = ($sec_end + 900);
                $i++;
            }
            $j++;
        }

        $timearray = [];
        $zz = '00';
        $i = 0;
        $h = 4;
        $hour = -1;
        $no_lines_yet = 1;
        while ($i <= 96) {
            $char_counter = 0;
            $time = '      ';
            if ($h >= 4) {
                $hour++;
                $h = 0;
                if ($hour < 10) {
                    $hour = "0" . $hour;
                }
                $time = $hour . $zz;
            }
            if ($h == 1) {
                $time = "   15 ";
            }
            if ($h == 2) {
                $time = "   30 ";
            }
            if ($h == 3) {
                $time = "   45 ";
            }
            array_push($timearray, $time);
            $i++;
            $h++;
        }

        $commonarray15min = [
            "adb0" => $adb0,
            "adb5" => $adb5,
            "adb10" => $adb10,
            "adb15" => $adb15,
            "adb20" => $adb20,
            "adb25" => $adb25,
            "adb30" => $adb30,
            "adb35" => $adb35,
            "adb40" => $adb40,
            "adb45" => $adb45,
            "adb50" => $adb50,
            "adb55" => $adb55,
            "adb60" => $adb60,
            "adb90" => $adb90,
            "adb99" => $adb99,
            "fanswer" => $fanswer,
            "timearray" => $timearray
        ];

        return $commonarray15min;
    }

    public function getIncrementTotalCalls($start_date, $end_date, $shift, $selected_groups, $did) {
         
        $server_gmt_time = Servers::getServerDetails('Y');
        $bd_answered_calls = 0;
        $dst = date("I");
        $epoch_offset = 0;
        if (count($server_gmt_time) > 0) {
            $local_gmt = $server_gmt_time[0]['local_gmt'];
            $epoch_offset = round(($local_gmt + $dst) * 3600);
        }

        $answerd_breakdown_seconds = VicidialCloserLog::getSelectedAnsweredBreakdownSec($selected_groups,$start_date,$end_date);
        if ($did == "Y") {
            $answerd_breakdown_seconds = VicidialCloserLog::getUniqueAnsweredBreakdownSec($selected_groups, $start_date, $end_date);
        }

        $j = 0;
        $ftotal = $fanswer = $cstatus = $cqueue = $cepoch = $cdate = $crem = $fdrop = [];
        $adb_0 = $adb_5 = $adb10 = $adb15 = $adb20 = $adb25 = $adb30 = $adb35 = $adb40 = $adb45 = $adb50 = $adb55 = $adb60 = $adb90 = $adb99 = [];
        $rowsarray = [];
       

        while ($j < count($answerd_breakdown_seconds)) {
            
            $cstatus[$j] = $answerd_breakdown_seconds[$j]['status'];
            $cqueue[$j] = $answerd_breakdown_seconds[$j]['queue_seconds'];
            $cepoch[$j] = strtotime($answerd_breakdown_seconds[$j]['uncalldate']);
            $cdate[$j] = $answerd_breakdown_seconds[$j]['call_date'];
            $crem[$j] = (($cepoch[$j] + $epoch_offset) % 86400);
            $j++;
        }
        
        $j = 0;
        $max_calls = 1;
        while ($j < count($answerd_breakdown_seconds)) {
            $i = 1;
            $sec = 0;
            $sec_end = 900;
            while ($i <= 96) {
                if (($crem[$j] >= $sec) and ($crem[$j] < $sec_end)) {


                    $ftotal = $this->setArrayValue($ftotal, $i);
                    if (preg_match('/DROP/', $cstatus[$j])) {
                        $fdrop = $this->setArrayValue($fdrop, $i);
                    }
                    if (!preg_match('/DROP|XDROP|HXFER|QVMAIL|HOLDTO|LIVE|QUEUE|TIMEOT|AFTHRS|NANQUE|INBND|MAXCAL/', $cstatus[$j])) {
                        $bd_answered_calls++;
                        $fanswer = $this->setArrayValue($fanswer, $i);
                        if ($cqueue[$j] == 0) {
                            $adb_0 = $this->setArrayValue($adb_0, $i);
                        }
                        if (($cqueue[$j] > 0) and ($cqueue[$j] <= 5)) {
                            $adb_5 = $this->setArrayValue($adb_5, $i);
                        }
                        if (($cqueue[$j] > 5) and ($cqueue[$j] <= 10)) {
                            $adb10 = $this->setArrayValue($adb10, $i);
                        }
                        if (($cqueue[$j] > 10) and ($cqueue[$j] <= 15)) {
                            $adb15 = $this->setArrayValue($adb15, $i);
                        }
                        if (($cqueue[$j] > 15) and ($cqueue[$j] <= 20)) {
                            $adb20 = $this->setArrayValue($adb20, $i);
                        }
                        if (($cqueue[$j] > 20) and ($cqueue[$j] <= 25)) {
                            $adb25 = $this->setArrayValue($adb25, $i);
                        }
                        if (($cqueue[$j] > 25) and ($cqueue[$j] <= 30)) {
                            $adb30 = $this->setArrayValue($adb30, $i);
                        }
                        if (($cqueue[$j] > 30) and ($cqueue[$j] <= 35)) {
                            $adb35 = $this->setArrayValue($adb35, $i);
                        }
                        if (($cqueue[$j] > 35) and ($cqueue[$j] <= 40)) {
                            $adb40 = $this->setArrayValue($adb40, $i);
                        }
                        if (($cqueue[$j] > 40) and ($cqueue[$j] <= 45)) {
                            $adb45 = $this->setArrayValue($adb45, $i);
                        }
                        if (($cqueue[$j] > 45) and ($cqueue[$j] <= 50)) {
                            $adb50 = $this->setArrayValue($adb50, $i);
                        }
                        if (($cqueue[$j] > 50) and ($cqueue[$j] <= 55)) {
                            $adb55 = $this->setArrayValue($adb55, $i);
                        }
                        if (($cqueue[$j] > 55) and ($cqueue[$j] <= 60)) {
                            $adb60 = $this->setArrayValue($adb60, $i);
                        }
                        if (($cqueue[$j] > 60) and ($cqueue[$j] <= 90)) {
                            $adb90 = $this->setArrayValue($adb90, $i);
                        }
                        if ($cqueue[$j] > 90) {
                            $adb99 = $this->setArrayValue($adb99, $i);
                        }
                    }
                }
                $sec = ($sec + 900);
                $sec_end = ($sec_end + 900);
                $i++;
            }
            $j++;
        }

        $hour_count = $drop_count = [];
        $hi_hour_count = 0;
        $last_full_record = 0;
        $i = 0;
        $h = 0;
        while ($i <= 96) {
            $ftotal[$i] = isset($ftotal[$i])?$ftotal[$i]:0;

            $fdrop[$i] = isset($fdrop[$i])?$fdrop[$i]:0;
            
            $hour_count = $this->setArrayGivenValue($hour_count, $i, $ftotal[$i]);
            if ($hour_count[$i] > $hi_hour_count) {
                $hi_hour_count = $hour_count[$i];
            }
            if ($hour_count[$i] > 0) {
                $last_full_record = $i;
            }
            $drop_count = $this->setArrayGivenValue($drop_count, $i, $fdrop[$i]);
            $i++;
        }

        if ($hi_hour_count < 1) {
            $hour_multiplier = 0;
        } else {
            $hour_multiplier = (100 / $hi_hour_count);
        }
        $k = 1;
        $mk = 0;
        $call_scale = '0';
        $yhour_count = 0;
        $toparray = [];
        $no_lines_yet = 0;

        while ($k <= 102) {
            if ($mk >= 5) {
                $mk = 0;
                if (($k < 1) or ($hour_multiplier <= 0)) {
                    $scale_num = 100;
                } else {
                    $scale_num = ($k / $hour_multiplier);
                    $scale_num = round($scale_num, 0);
                }
                $len_scale_num = (strlen($scale_num));
                $k = ($k + $len_scale_num);
                array_push($toparray, $scale_num);
                $call_scale .= $scale_num;
            } else {
                $call_scale .= " ";
                $k++;
                $mk++;
            }
        }
        if (isset($hour_count[$i])) {
            $hour_count[$i] = $hour_count[$i];
        } else {
            $hour_count[$i] = 0;
        }
        $ghour_count = $hour_count[$i];
        if ($ghour_count < 1) {
            if (($no_lines_yet) or ($i > $last_full_record)) {
                $do_nothing = 1;
            } else {
                $hour_count[$i] = sprintf("%-5s", $hour_count[$i]);

                $k = 0;
                while ($k <= 102) {
                    echo $k;
                    echo "fsf";
                    $k++;
                }
                $ascii_text .= "| ".$hour_count[$i]." |\n";
                $csv_text9 .= "\"0\",\"0\"\n";
            }
        } else {
            $no_lines_yet = 0;
            $xhour_count = ($ghour_count * $hour_multiplier);
            $yhour_count = (99 - $xhour_count);

            $gdrop_count = $drop_count[$i];
            if ($gdrop_count < 1) {
                $hour_count[$i] = sprintf("%-5s", $hour_count[$i]);

                $k = 0;
                while ($k <= $xhour_count) {
                    $ascii_text .= "*";
                    echo $k;
                    echo "fsf";
                    $k++;
                    $char_counter++;
                }

                $k = 0;
                while ($k <= $yhour_count) {
                    $ascii_text .= " ";
                    echo $k;
                    echo "fsf";
                    $k++;
                    $char_counter++;
                }
                while ($char_counter <= 101) {
                    $ascii_text .= " ";
                    $char_counter++;
                }

            } else { 
                $xdrop_count = ($gdrop_count * $hour_multiplier);

                $xxhour_count = (($xhour_count - $xdrop_count) - 1);

                $hour_count[$i] += 0;
                $drop_count[$i] += 0;

                $hour_count[$i] = sprintf("%-5s", $hour_count[$i]);
                $drop_count[$i] = sprintf("%-5s", $drop_count[$i]);

                $k = 0;
                while ($k <= $xdrop_count) {
                    $ascii_text .= ">";
                    echo $k;
                    $k++;
                    $char_counter++;
                }
                $ascii_text .= "D</SPAN><SPAN class=\"green\">";
                $char_counter++;
                $k = 0;
                while ($k <= $xxhour_count) {
                    $ascii_text .= "*";
                    echo $k;
                    $k++;
                    $char_counter++;
                }
                $ascii_text .= "X</SPAN>";
                $char_counter++;
                $k = 0;
                while ($k <= $yhour_count) {
                    $ascii_text .= " ";
                    echo $k;
                    $k++;
                    $char_counter++;
                }
                while ($char_counter <= 102) {
                    $ascii_text .= " ";
                    $char_counter++;
                }
            }
        }

        $graph_stats[$i][0] = "fdsf";
        if (isset($hour_count[$i])) {
            $hour_count[$i] = $hour_count[$i];
        } else {
            $hour_count[$i] = 0;
        }
        $graph_stats[$i][1] = trim($hour_count[$i]);
        if (isset($drop_count[$i])) {
            $drop_count[$i] = $drop_count[$i];
        } else {
            $drop_count[$i] = 0;
        }
        $graph_stats[$i][2] = trim($drop_count[$i]);
        if (trim($hour_count[$i]) > $max_calls) {
            $max_calls = trim($hour_count[$i]);
        }

        $i++;
        $h++;

        return [
            "yhour_count" => $yhour_count,
            "toparray" => $toparray,
            "ftotal" => $ftotal,
            "fdrop" => $fdrop
        ];
    }

    public function setArrayGivenValue($array, $offset, $value) {
        if (isset($array[$offset])) {
            $array[$offset] = $value;
        } else {

            $array[$offset] = 1;
            $array[$offset] = $value;
        }

        return $array;
    }

    public function setArrayValue($array, $offset) {
        if (isset($array[$offset])) {
            $array[$offset]++;
        } else {
            $array[$offset] = 1;
        }

        return $array;
    }

    public function getAgentStats($list, $selected_groups, $start_date, $end_date, $did) {

        $agent_stat_detail = VicidialCloserLog::getSelectedAgentStatDetailsWithCampaign($selected_groups, $start_date, $end_date);

        if ($did == 'Y') {
            $agent_stat_detail = VicidialCloserLog::getSelectedAgentStatDetailsWithUnique($selected_groups, $start_date, $end_date);
        }

        $total_agents = 0;
        $totalavglength = 0;
        $totalsumlength = 0;
        $totalusers = 0;
        $looparray = [];
        if ($agent_stat_detail) {
            for ($i = 0; $i < count($agent_stat_detail); $i++) {
                $total_agents++;
                $totalusers = $totalusers + $agent_stat_detail[$i]['countusers'];
                $totalavglength = $totalavglength + $agent_stat_detail[$i]['average_lenght'];
                $totalsumlength = $totalsumlength + $agent_stat_detail[$i]['sum_lenght'];
                $avg_len = $this->secConvert($agent_stat_detail[$i]['average_lenght'], 'H');
                $sum_len = $this->secConvert($agent_stat_detail[$i]['sum_lenght'], 'H');
                $usergroup = $agent_stat_detail[$i]['user'] . "-" . $agent_stat_detail[$i]['full_name'];
                $countuser = $agent_stat_detail[$i]['countusers'];
                $singlearray = [
                    'usergroup' => $usergroup,
                    'countusers' => $countuser,
                    'avg_len' => $avg_len,
                    'sum_len' => $sum_len
                ];
                array_push($looparray, $singlearray);
            }
        }

        $returnarray['agentdata'] = $looparray;
        $average = $this->getDivision($totalsumlength, $totalusers);
        $totavg_len = $this->secConvert($average, 'H');
        $totsum_len = $this->secConvert($totalsumlength, 'H');
        $totalarray = [
            'calls' => $totalusers,
            'agentcalls' => $total_agents,
            'avg_len' => $totavg_len,
            'sum_len' => $totsum_len
        ];
        $lastarray = ['total' => $totalarray];
        array_push($returnarray, $lastarray);

        return $returnarray;
    }


    public function getinitialBreakdown($list) {
        $breakdown_call_details = $list;
        $bd_0 = 0;
        $bd_1 = 0;
        $bd_2 = 0;
        $bd_3 = 0;
        $bd_4 = 0;
        $bd_5 = 0;
        $bd_6 = 0;
        $bd_7 = 0;
        $bd_8 = 0;
        $bd_9 = 0;
        $bd_10 = 0;
        $bd_15 = 0;
        $bd_20 = 0;
        $bd_25 = 0;
        $bd_26 = 0;
        $total = 0;

        if ($breakdown_call_details) {
            $total = count($breakdown_call_details);

            foreach ($breakdown_call_details as $value) {
                $position = $value['queue_position'];
                if ($position == 0) {
                    $bd_0 = $bd_0 + 1;
                }
                if ($position == 1) {
                    $bd_1 = $bd_1 + 1;
                }
                if ($position == 2) {
                    $bd_2 = $bd_2 + 1;
                }
                if ($position == 3) {
                    $bd_3 = $bd_3 + 1;
                }
                if ($position == 4) {
                    $bd_4 = $bd_4 + 1;
                }
                if ($position == 5) {
                    $bd_5 = $bd_5 + 1;
                }
                if ($position == 6) {
                    $bd_6 = $bd_6 + 1;
                }
                if ($position == 7) {
                    $bd_7 = $bd_7 + 1;
                }
                if ($position == 8) {
                    $bd_8 = $bd_8 + 1;
                }
                if ($position == 9) {
                    $bd_9 = $bd_9 + 1;
                }
                if ($position == 10) {
                    $bd_10 = $bd_10 + 1;
                }
                if (($position > 10) && ($position <= 15)) {
                    $bd_15 = $bd_15 + 1;
                }
                if (($position > 15) && ($position <= 20)) {
                    $bd_20 = $bd_20 + 1;
                }
                if (($position > 20) && ($position <= 25)) {
                    $bd_25 = $bd_25 + 1;
                }
                if ($position > 25) {
                    $bd_26 = $bd_26 + 1;
                }
            }
        }

        return ([
            "bd_0" => $bd_0,
            "bd_1" => $bd_1,
            "bd_2" => $bd_2,
            "bd_3" => $bd_3,
            "bd_4" => $bd_4,
            "bd_5" => $bd_5,
            "bd_6" => $bd_6,
            "bd_7" => $bd_7,
            "bd_8" => $bd_8,
            "bd_9" => $bd_9,
            "bd_10" => $bd_10,
            "bd_15" => $bd_15,
            "bd_20" => $bd_20,
            "bd_25" => $bd_25,
            "bd_26" => $bd_26,
            "total" => $total
        ]);
    }

    public function getCallStatusStats($selected_groups, $start_date, $end_date, $status_name1, $category1, $did) {
        
        $list = VicidialCloserLog::getSelectedStatus($selected_groups, $start_date, $end_date);
       
        if ($did == 'Y') {
            $list = VicidialCloserLog::getAllStatus($selected_groups, $start_date, $end_date);
        }        

        $totaltime = 0;
        $totalcalls = 0;
        $totalhourcalls = 0;
        $totalhours = 0;
        $totalavg_sec = 0;

        $returnarray = [];
        $looparray = [];

        for ($i = 0; $i < count($list); $i++) {
            $totaltime = $totaltime + $list[$i]['sum'];
            $totalcalls = $totalcalls + $list[$i]['countrecords'];
        }

        for ($i = 0; $i < count($list); $i++) {

            $hourcalls = $this->getDivision($list[$i]['countrecords'], $this->getDivision($totaltime, 3600));
            $hourcalls = round($hourcalls, 3);
            $totalhourcalls = $totalhourcalls + $hourcalls;
            $hours = $this->secConvert($list[$i]['sum'], 'H');
            $avg_sec = $this->secConvert($this->getDivision($list[$i]['sum'], $list[$i]['countrecords']), 'H');
            $status1 = $list[$i]['status'];

            $status_name1[$status1] = isset($status_name1[$status1])?$status_name1[$status1]:'';
            $category1[$status1] = isset($category1[$status1])?$category1[$status1]:'';
            $list[$i]['countrecords'] = isset($list[$i]['countrecords'])?$list[$i]['countrecords']:'';
            $singlearray = [
                'status' => $list[$i]['status'],
                'description' => $status_name1[$status1],
                'category' => $category1[$status1],
                'calls' => $list[$i]['countrecords'],
                'totTime' => $hours,
                'avg_sec' => $avg_sec,
                'callperhour' => $hourcalls
            ];
            array_push($looparray, $singlearray);
        }

        $returnarray['statsdata'] = $looparray;
        $totalhours = $this->secConvert($totaltime, 'H');
        $totalavg_sec = $this->secConvert($this->getDivision($totaltime, $totalcalls), 'H');
        $totalarray = [
            'calls' => $totalcalls,
            'totTime' => $totalhours,
            'avg_sec' => $totalavg_sec,
            'callperhour' => $totalhourcalls
        ];
        $lastarray = ['total' => $totalarray];
        array_push($returnarray, $lastarray);

        return $returnarray;
    }

    public function secConvert($sec, $precision) {
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

                $fhours_h = ($sec / 3600);
                $fhours_h_int = floor($fhours_h);
                $fhours_h_int = intval($fhours_h_int);
                $fhours_h_int = ($fhours_h_int < 10) ? "0".$fhours_h_int : $fhours_h_int;
                
                $fhours_m = ($fhours_h - $fhours_h_int);
                $fhours_m = ($fhours_m * 60);
                $fhours_m_int = floor($fhours_m);
                $fhours_m_int = intval($fhours_m_int);
                $fhours_s = ($fhours_m - $fhours_m_int);
                $fhours_s = ($fhours_s * 60);
                $fhours_s = round($fhours_s, 0);
                if ($fhours_s < 10) {
                    $fhours_s = "0".$fhours_s;
                }
                if ($fhours_m_int < 10) {
                    $fhours_m_int = "0".$fhours_m_int;
                }

                $ftime = $fhours_h_int.":".$fhours_m_int.":".$fhours_s;
            }
            if ($precision == 'M') {
                $fminutes_m = ($sec / 60); 
                $fminutes_m_int = floor($fminutes_m);
                $fminutes_m_int = intval($fminutes_m_int);
                $fminutes_s = ($fminutes_m - $fminutes_m_int);
                $fminutes_s = ($fminutes_s * 60);
                $fminutes_s = round($fminutes_s, 0);
                if ($fminutes_s < 10) {
                    $fminutes_s = "0".$fminutes_s;
                }
                $ftime = $fminutes_m_int.":".$fminutes_s;
            }
            if ($precision == 'S') {
                $ftime = $sec;
            }

            return $ftime;
        }
    }

    public function getDivision($part, $whole) {
        if ($whole != 0) {
            if ($part != 0) {
                return ($part / $whole);
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }


    public function getCallHangupStats($list) {
        $value_array = [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
        ];
        $field_array = [];
        if ($list) {
            $total = count($list);

            foreach ($list as $value) {

                $term = $value['term_reason'];
                switch ($term) {
                    case 'CALLER': {
                        $value_array[0] = $value_array[0] + 1;
                        break;
                    }
                    case 'AGENT': {
                        $value_array[1] = $value_array[1] + 1;
                        break;
                    }
                    case 'QUEUETIMEOUT': {
                        $value_array[2] = $value_array[2] + 1;
                        break;
                    }
                    case 'ABANDON': {
                        $value_array[3] = $value_array[3] + 1;
                        break;
                    }
                    case 'AFTERHOURS': {
                        $value_array[4] = $value_array[4] + 1;
                        break;
                    }
                    case 'HOLDRECALLXFER': {
                        $value_array[5] = $value_array[5] + 1;
                        break;
                    }
                    case 'HOLDTIME': {
                        $value_array[6] = $value_array[6] + 1;
                        break;
                    }
                    case 'NOAGENT': {
                        $value_array[7] = $value_array[7] + 1;
                        break;
                    }
                    case 'NONE': {
                        $value_array[8] = $value_array[8] + 1;
                        break;
                    }
                    case 'MAXCALLS': {
                        $value_array[9] = $value_array[9] + 1;
                        break;
                    }
                }
            }
            
            for ($i = 0; $i < 10; $i++) {
                if ($value_array[$i] > 0) {
                    if ($i == 0) {
                        $field_array['CALLER'] = $value_array[$i];
                    }
                    if ($i == 1) {
                        $field_array['AGENT'] = $value_array[$i];
                    }
                    if ($i == 2) {
                        $field_array['QUEUETIMEOUT'] = $value_array[$i];
                    }
                    if ($i == 3) {
                        $field_array['ABANDON'] = $value_array[$i];
                    }
                    if ($i == 4) {
                        $field_array['AFTERHOURS'] = $value_array[$i];
                    }
                    if ($i == 5) {
                        $field_array['HOLDRECALLXFER'] = $value_array[$i];
                    }
                    if ($i == 6) {
                        $field_array['HOLDTIME'] = $value_array[$i];
                    }
                    if ($i == 7) {
                        $field_array['NOAGENT'] = $value_array[$i];
                    }
                    if ($i == 8) {
                        $field_array['NONE'] = $value_array[$i];
                    }
                    if ($i == 9) {
                        $field_array['MAXCALLS'] = $value_array[$i];
                    }
                }
            }
            $field_array['TOTAL'] = $total;
        } else {
            $field_array['TOTAL'] = 0;
        }

        return $field_array;
    }

    public function getCumulativeAndTotalPercent($answered_call_details, $total_call_details, $list) {
        
        $total_calls = 0;
        $ad_0 = 0;
        $total = 0;
        $ad_5 = 0;
        $ad_10 = 0;
        $ad_15 = 0;
        $ad_20 = 0;
        $ad_25 = 0;
        $ad_30 = 0;
        $ad_35 = 0;
        $ad_40 = 0;
        $ad_45 = 0;
        $ad_50 = 0;
        $ad_55 = 0;
        $ad_60 = 0;
        $ad_90 = 0;
        $ad_99 = 0;

        $interval = [];
        $cumulative = [];
        $int_percentage = [];
        $cumulative_percentage = [];
        $cumulative_answer_percentage = [];

        if ($total_call_details) {
            $total = $answered_call_details;
            foreach ($total_call_details as $value) {

                $seconds = $value['queue_seconds'];

                $count = $value['count'];
                $total_calls = ($total_calls + $count);
                if ($seconds == 0) {
                    $ad_0 = $ad_0 + $count;
                }
                if (($seconds > 0) && ($seconds <= 5)) {
                    $ad_5 = $ad_5 + $count;
                }
                if (($seconds > 5) && ($seconds <= 10)) {
                    $ad_10 = $ad_10 + $count;
                }
                if (($seconds > 10) && ($seconds <= 15)) {
                    $ad_15 = $ad_15 + $count;
                }
                if (($seconds > 15) && ($seconds <= 20)) {
                    $ad_20 = $ad_20 + $count;
                }
                if (($seconds > 20) && ($seconds <= 25)) {
                    $ad_25 = $ad_25 + $count;
                }
                if (($seconds > 25) && ($seconds <= 30)) {
                    $ad_30 = $ad_30 + $count;
                }
                if (($seconds > 30) && ($seconds <= 35)) {
                    $ad_35 = $ad_35 + $count;
                }
                if (($seconds > 35) && ($seconds <= 40)) {
                    $ad_40 = $ad_40 + $count;
                }
                if (($seconds > 40) && ($seconds <= 45)) {
                    $ad_45 = $ad_45 + $count;
                }
                if (($seconds > 45) && ($seconds <= 50)) {
                    $ad_50 = $ad_50 + $count;
                }
                if (($seconds > 50) && ($seconds <= 55)) {
                    $ad_55 = $ad_55 + $count;
                }
                if (($seconds > 55) && ($seconds <= 60)) {
                    $ad_60 = $ad_60 + $count;
                }
                if (($seconds > 60) && ($seconds <= 90)) {
                    $ad_90 = $ad_90 + $count;
                }
                if ($seconds > 90) {
                    $ad_99 = $ad_99 + $count;
                }
            }

            $interval = [
                "INTERVAL",
                "ad_0" => $ad_0,
                "ad_5" => $ad_5,
                "ad_10" => $ad_10,
                "ad_15" => $ad_15,
                "ad_20" => $ad_20,
                "ad_25" => $ad_25,
                "ad_30" => $ad_30,
                "ad_35" => $ad_35,
                "ad_40" => $ad_40,
                "ad_45" => $ad_45,
                "ad_50" => $ad_50,
                "ad_55" => $ad_55,
                "ad_60" => $ad_60,
                "ad_90" => $ad_90,
                "ad_99" => $ad_99,
                "total" => $total
            ];

            $cad_0 = 0;
            $cad_5 = 0;
            $cad_10 = 0;
            $cad_15 = 0;
            $cad_20 = 0;
            $cad_25 = 0;
            $cad_30 = 0;
            $cad_35 = 0;
            $cad_40 = 0;
            $cad_45 = 0;
            $cad_50 = 0;
            $cad_55 = 0;
            $cad_60 = 0;
            $cad_90 = 0;
            $cad_99 = 0;

            $cad_0 = $ad_0;
            $cad_5 = ($cad_0 + $ad_5);
            $cad_10 = ($cad_5 + $ad_10);
            $cad_15 = ($cad_10 + $ad_15);
            $cad_20 = ($cad_15 + $ad_20);
            $cad_25 = ($cad_20 + $ad_25);
            $cad_30 = ($cad_25 + $ad_30);
            $cad_35 = ($cad_30 + $ad_35);
            $cad_40 = ($cad_35 + $ad_40);
            $cad_45 = ($cad_40 + $ad_45);
            $cad_50 = ($cad_45 + $ad_50);
            $cad_55 = ($cad_50 + $ad_55);
            $cad_60 = ($cad_55 + $ad_60);
            $cad_90 = ($cad_60 + $ad_90);
            $cad_99 = ($cad_90 + $ad_99);

            $cumulative = [
                "CUMULATIVE",
                "cad_0" => $cad_0,
                "cad_5" => $cad_5,
                "cad_10" => $cad_10,
                "cad_15" => $cad_15,
                "cad_20" => $cad_20,
                "cad_25" => $cad_25,
                "cad_30" => $cad_30,
                "cad_35" => $cad_35,
                "cad_40" => $cad_40,
                "cad_45" => $cad_45,
                "cad_50" => $cad_50,
                "cad_55" => $cad_55,
                "cad_60" => $cad_60,
                "cad_90" => $cad_90,
                "cad_99" => $cad_99,
                "total" => $total
            ];

            $total_call = $total_calls;
            $pad_0 = 0;
            $pad_5 = 0;
            $pad_10 = 0;
            $pad_15 = 0;
            $pad_20 = 0;
            $pad_25 = 0;
            $pad_30 = 0;
            $pad_35 = 0;
            $pad_40 = 0;
            $pad_45 = 0;
            $pad_50 = 0;
            $pad_55 = 0;
            $pad_60 = 0;
            $pad_90 = 0;
            $pad_99 = 0;
            $pad_0 = $this->calculatePercentage($ad_0, $list);
            $pad_5 = $this->calculatePercentage($ad_5, $list);
            $pad_10 = $this->calculatePercentage($ad_10, $list);
            $pad_15 = $this->calculatePercentage($ad_15, $list);
            $pad_20 = $this->calculatePercentage($ad_20, $list);
            $pad_25 = $this->calculatePercentage($ad_25, $list);
            $pad_30 = $this->calculatePercentage($ad_30, $list);
            $pad_35 = $this->calculatePercentage($ad_35, $list);
            $pad_40 = $this->calculatePercentage($ad_40, $list);
            $pad_45 = $this->calculatePercentage($ad_45, $list);
            $pad_50 = $this->calculatePercentage($ad_50, $list);
            $pad_55 = $this->calculatePercentage($ad_55, $list);
            $pad_60 = $this->calculatePercentage($ad_60, $list);
            $pad_90 = $this->calculatePercentage($ad_90, $list);
            $pad_99 = $this->calculatePercentage($ad_99, $list);

            $int_percentage = [
                "INT %",
                "pad_0" => $pad_0 . "%",
                "pad_5" => $pad_5 . "%",
                "pad_10" => $pad_10 . "%",
                "pad_15" => $pad_15 . "%",
                "pad_20" => $pad_20 . "%",
                "pad_25" => $pad_25 . "%",
                "pad_30" => $pad_30 . "%",
                "pad_35" => $pad_35 . "%",
                "pad_40" => $pad_40 . "%",
                "pad_45" => $pad_45 . "%",
                "pad_50" => $pad_50 . "%",
                "pad_55" => $pad_55 . "%",
                "pad_60" => $pad_60 . "%",
                "pad_90" => $pad_90 . "%",
                "pad_99" => $pad_99 . "%",
                "total" => " "
            ];

            $pcad_0 = 0;
            $pcad_5 = 0;
            $pcad_10 = 0;
            $pcad_15 = 0;
            $pcad_20 = 0;
            $pcad_25 = 0;
            $pcad_30 = 0;
            $pcad_35 = 0;
            $pcad_40 = 0;
            $pcad_45 = 0;
            $pcad_50 = 0;
            $pcad_55 = 0;
            $pcad_60 = 0;
            $pcad_90 = 0;
            $pcad_99 = 0;
            $pcad_0 = $this->calculatePercentage($cad_0, $list);
            $pcad_5 = $this->calculatePercentage($cad_5, $list);
            $pcad_10 = $this->calculatePercentage($cad_10, $list);
            $pcad_15 = $this->calculatePercentage($cad_15, $list);
            $pcad_20 = $this->calculatePercentage($cad_20, $list);
            $pcad_25 = $this->calculatePercentage($cad_25, $list);
            $pcad_30 = $this->calculatePercentage($cad_30, $list);
            $pcad_35 = $this->calculatePercentage($cad_35, $list);
            $pcad_40 = $this->calculatePercentage($cad_40, $list);
            $pcad_45 = $this->calculatePercentage($cad_45, $list);
            $pcad_50 = $this->calculatePercentage($cad_50, $list);
            $pcad_55 = $this->calculatePercentage($cad_55, $list);
            $pcad_60 = $this->calculatePercentage($cad_60, $list);
            $pcad_90 = $this->calculatePercentage($cad_90, $list);
            $pcad_99 = $this->calculatePercentage($cad_99, $list);

            $cumulative_percentage = [
                "CUM %",
                "pcad_0" => $pcad_0 . "%",
                "pcad_5" => $pcad_5 . "%",
                "pcad_10" => $pcad_10 . "%",
                "pcad_15" => $pcad_15 . "%",
                "pcad_20" => $pcad_20 . "%",
                "pcad_25" => $pcad_25 . "%",
                "pcad_30" => $pcad_30 . "%",
                "pcad_35" => $pcad_35 . "%",
                "pcad_40" => $pcad_40 . "%",
                "pcad_45" => $pcad_45 . "%",
                "pcad_50" => $pcad_50 . "%",
                "pcad_55" => $pcad_55 . "%",
                "pcad_60" => $pcad_60 . "%",
                "pcad_90" => $pcad_90 . "%",
                "pcad_99" => $pcad_99 . "%",
                "total" => " "
            ];
            $apcad_0 = 0;
            $apcad_5 = 0;
            $apcad_10 = 0;
            $apcad_15 = 0;
            $apcad_20 = 0;
            $apcad_25 = 0;
            $apcad_30 = 0;
            $apcad_35 = 0;
            $apcad_40 = 0;
            $apcad_45 = 0;
            $apcad_50 = 0;
            $apcad_55 = 0;
            $apcad_60 = 0;
            $apcad_90 = 0;
            $apcad_99 = 0;
            $apcad_0 = $this->calculatePercentage($cad_0, $total);
            $apcad_5 = $this->calculatePercentage($cad_5, $total);
            $apcad_10 = $this->calculatePercentage($cad_10, $total);
            $apcad_15 = $this->calculatePercentage($cad_15, $total);
            $apcad_20 = $this->calculatePercentage($cad_20, $total);
            $apcad_25 = $this->calculatePercentage($cad_25, $total);
            $apcad_30 = $this->calculatePercentage($cad_30, $total);
            $apcad_35 = $this->calculatePercentage($cad_35, $total);
            $apcad_40 = $this->calculatePercentage($cad_40, $total);
            $apcad_45 = $this->calculatePercentage($cad_45, $total);
            $apcad_50 = $this->calculatePercentage($cad_50, $total);
            $apcad_55 = $this->calculatePercentage($cad_55, $total);
            $apcad_60 = $this->calculatePercentage($cad_60, $total);
            $apcad_90 = $this->calculatePercentage($cad_90, $total);
            $apcad_99 = $this->calculatePercentage($cad_99, $total);

            $cumulative_answer_percentage = [
                "CUM ANS % ",
                "apcad_0" => $apcad_0 . "%",
                "apcad_5" => $apcad_5 . "%",
                "apcad_10" => $apcad_10 . "%",
                "apcad_15" => $apcad_15 . "%",
                "apcad_20" => $apcad_20 . "%",
                "apcad_25" => $apcad_25 . "%",
                "apcad_30" => $apcad_30 . "%",
                "apcad_35" => $apcad_35 . "%",
                "apcad_40" => $apcad_40 . "%",
                "apcad_45" => $apcad_45 . "%",
                "apcad_50" => $apcad_50 . "%",
                "apcad_55" => $apcad_55 . "%",
                "apcad_60" => $apcad_60 . "%",
                "apcad_90" => $apcad_90 . "%",
                "apcad_99" => $apcad_99 . "%",
                "total" => " "
            ];

        } else {
            $interval = [
                "INTERVAL",
                "ad_0" => 0,
                "ad_5" => 0,
                "ad_10" => 0,
                "ad_15" => 0,
                "ad_20" => 0,
                "ad_25" => 0,
                "ad_30" => 0,
                "ad_35" => 0,
                "ad_40" => 0,
                "ad_45" => 0,
                "ad_50" => 0,
                "ad_55" => 0,
                "ad_60" => 0,
                "ad_90" => 0,
                "ad_99" => 0,
                "total" => 0
            ];

            $cumulative = [
                "CUMULATIVE",
                "cad_0" => 0,
                "cad_5" => 0,
                "cad_10" => 0,
                "cad_15" => 0,
                "cad_20" => 0,
                "cad_25" => 0,
                "cad_30" => 0,
                "cad_35" => 0,
                "cad_40" => 0,
                "cad_45" => 0,
                "cad_50" => 0,
                "cad_55" => 0,
                "cad_60" => 0,
                "cad_90" => 0,
                "cad_99" => 0,
                "total" => 0
            ];

            $int_percentage = [
                "INT %",
                "pad_0" => 0,
                "pad_5" => 0,
                "pad_10" => 0,
                "pad_15" => 0,
                "pad_20" => 0,
                "pad_25" => 0,
                "pad_30" => 0,
                "pad_35" => 0,
                "pad_40" => 0,
                "pad_45" => 0,
                "pad_50" => 0,
                "pad_55" => 0,
                "pad_60" => 0,
                "pad_90" => 0,
                "pad_99" => 0,
                "total" => " "
            ];

            $cumulative_percentage = [
                "CUM %",
                "pcad_0" => 0,
                "pcad_5" => 0,
                "pcad_10" => 0,
                "pcad_15" => 0,
                "pcad_20" => 0,
                "pcad_25" => 0,
                "pcad_30" => 0,
                "pcad_35" => 0,
                "pcad_40" => 0,
                "pcad_45" => 0,
                "pcad_50" => 0,
                "pcad_55" => 0,
                "pcad_60" => 0,
                "pcad_90" => 0,
                "pcad_99" => 0,
                "total" => " "
            ];

            $cumulative_answer_percentage = [
                "CUM ANS % ",
                "apcad_0" => 0,
                "apcad_5" => 0,
                "apcad_10" => 0,
                "apcad_15" => 0,
                "apcad_20" => 0,
                "apcad_25" => 0,
                "apcad_30" => 0,
                "apcad_35" => 0,
                "apcad_40" => 0,
                "apcad_45" => 0,
                "apcad_50" => 0,
                "apcad_55" => 0,
                "apcad_60" => 0,
                "apcad_90" => 0,
                "apcad_99" => 0,
                "total" => " "
            ];
        }

        return $ans_percent_breakdown = [
            'interval' => $interval,
            'cumulative' => $cumulative,
            'int_percentage' => $int_percentage,
            'cumulative_percentage' => $cumulative_percentage,
            'cumulative_answer_percentage' => $cumulative_answer_percentage
        ];
    }


    public function getDropTimeBreakDownInSeconds($total_drop_call_details) {

        $droptime_call_details = $total_drop_call_details;
        $dd_0 = 0;
        $total = 0;
        $dd_5 = 0;
        $dd_10 = 0;
        $dd_15 = 0;
        $dd_20 = 0;
        $dd_25 = 0;
        $dd_30 = 0;
        $dd_35 = 0;
        $dd_40 = 0;
        $dd_45 = 0;
        $dd_50 = 0;
        $dd_55 = 0;
        $dd_60 = 0;
        $dd_90 = 0;
        $dd_99 = 0;

        if ($droptime_call_details) {
            $total = count($droptime_call_details);
            foreach ($droptime_call_details as $value) {
                $seconds = $value['queue_seconds'];
                if ($seconds == 0) {
                    $dd_0 = $dd_0 + 1;
                }
                if (($seconds > 0) && ($seconds <= 5)) {
                    $dd_5 = $dd_5 + 1;
                }
                if (($seconds > 5) && ($seconds <= 10)) {
                    $dd_10 = $dd_10 + 1;
                }
                if (($seconds > 10) && ($seconds <= 15)) {
                    $dd_15 = $dd_15 + 1;
                }
                if (($seconds > 15) && ($seconds <= 20)) {
                    $dd_20 = $dd_20 + 1;
                }
                if (($seconds > 20) && ($seconds <= 25)) {
                    $dd_25 = $dd_25 + 1;
                }
                if (($seconds > 25) && ($seconds <= 30)) {
                    $dd_30 = $dd_30 + 1;
                }
                if (($seconds > 30) && ($seconds <= 35)) {
                    $dd_35 = $dd_35 + 1;
                }
                if (($seconds > 35) && ($seconds <= 40)) {
                    $dd_40 = $dd_40 + 1;
                }
                if (($seconds > 40) && ($seconds <= 45)) {
                    $dd_45 = $dd_45 + 1;
                }
                if (($seconds > 45) && ($seconds <= 50)) {
                    $dd_50 = $dd_50 + 1;
                }
                if (($seconds > 50) && ($seconds <= 55)) {
                    $dd_55 = $dd_55 + 1;
                }
                if (($seconds > 55) && ($seconds <= 60)) {
                    $dd_60 = $dd_60 + 1;
                }
                if (($seconds > 60) && ($seconds <= 90)) {
                    $dd_90 = $dd_90 + 1;
                }
                if ($seconds > 90) {
                    $dd_99 = $dd_99 + 1;
                }
            }
        }

        return ([
            "dd_0" => $dd_0,
            "dd_5" => $dd_5,
            "dd_10" => $dd_10,
            "dd_15" => $dd_15,
            "dd_20" => $dd_20,
            "dd_25" => $dd_25,
            "dd_30" => $dd_30,
            "dd_35" => $dd_35,
            "dd_40" => $dd_40,
            "dd_45" => $dd_45,
            "dd_50" => $dd_50,
            "dd_55" => $dd_55,
            "dd_60" => $dd_60,
            "dd_90" => $dd_90,
            "dd_99" => $dd_99,
            "total" => $total
        ]);
    }

    public function getHoldTimeBreakDownInSeconds($list) {

        $holdtime_call_details = $list;
        $hd_0 = 0;
        $hd_5 = 0;
        $hd_10 = 0;
        $hd_15 = 0;
        $hd_20 = 0;
        $hd_25 = 0;
        $hd_30 = 0;
        $hd_35 = 0;
        $hd_40 = 0;
        $hd_45 = 0;
        $hd_50 = 0;
        $hd_55 = 0;
        $hd_60 = 0;
        $hd_90 = 0;
        $hd_99 = 0;
        $total = 0;

        if ($holdtime_call_details) {
            $total = count($holdtime_call_details);
            foreach ($holdtime_call_details as $value) {
                $seconds = $value['queue_seconds'];
                if ($seconds == 0) {
                    $hd_0 = $hd_0 + 1;
                }
                if (($seconds > 0) && ($seconds <= 5)) {
                    $hd_5 = $hd_5 + 1;
                }
                if (($seconds > 5) && ($seconds <= 10)) {
                    $hd_10 = $hd_10 + 1;
                }
                if (($seconds > 10) && ($seconds <= 15)) {
                    $hd_15 = $hd_15 + 1;
                }
                if (($seconds > 15) && ($seconds <= 20)) {
                    $hd_20 = $hd_20 + 1;
                }
                if (($seconds > 20) && ($seconds <= 25)) {
                    $hd_25 = $hd_25 + 1;
                }
                if (($seconds > 25) && ($seconds <= 30)) {
                    $hd_30 = $hd_30 + 1;
                }
                if (($seconds > 30) && ($seconds <= 35)) {
                    $hd_35 = $hd_35 + 1;
                }
                if (($seconds > 35) && ($seconds <= 40)) {
                    $hd_40 = $hd_40 + 1;
                }
                if (($seconds > 40) && ($seconds <= 45)) {
                    $hd_45 = $hd_45 + 1;
                }
                if (($seconds > 45) && ($seconds <= 50)) {
                    $hd_50 = $hd_50 + 1;
                }
                if (($seconds > 50) && ($seconds <= 55)) {
                    $hd_55 = $hd_55 + 1;
                }
                if (($seconds > 55) && ($seconds <= 60)) {
                    $hd_60 = $hd_60 + 1;
                }
                if (($seconds > 60) && ($seconds <= 90)) {
                    $hd_90 = $hd_90 + 1;
                }
                if ($seconds > 90) {
                    $hd_99 = $hd_99 + 1;
                }
            }
        }

        return ([
            "hd_0" => $hd_0,
            "hd_5" => $hd_5,
            "hd_10" => $hd_10,
            "hd_15" => $hd_15,
            "hd_20" => $hd_20,
            "hd_25" => $hd_25,
            "hd_30" => $hd_30,
            "hd_35" => $hd_35,
            "hd_40" => $hd_40,
            "hd_45" => $hd_45,
            "hd_50" => $hd_50,
            "hd_55" => $hd_55,
            "hd_60" => $hd_60,
            "hd_90" => $hd_90,
            "hd_99" => $hd_99,
            "total" => $total
        ]);
    }


    public function getDetailsByCampaignId($campaign_id_list, $start_date, $end_date, $did){

        $unique_sql = [];
        $did_unid_sql = '';
        $return_details_campaign_wise = [];
        $i=0;

        if (is_array($campaign_id_list) || is_object($campaign_id_list))
        {
            $single_campaign_details = [];
            foreach ($campaign_id_list as $campaign) {

                $did_id[$i] = '0';
                $did_unid_sql = '';
                $did_unid_sql_array = [];
                $campaign_array = [];
                array_push($campaign_array, $campaign);
                
                $rslt = VicidialInboundDid::vicidialInboundDids($campaign_array);

                $campaign_to_print = $campaign . " - ";
                if(count($rslt)>0){
                    $campaign_to_print .= $rslt[0]['did_description']; 
                    $did_id[$i] = $rslt[0]['did_id'];
                }
                
                $did_id_array = [];
                if(strlen($did_id[$i])>0){
                    array_push($did_id_array, $did_id[$i]);
                }

                $rslt = VicidialDidLog::vicidialInboundLogByDidId($did_id_array);
               

                $k = 0;
                while ($k < count($rslt)) {
                    // $row[0] = $rslt[$k]['uniqueid'];
                    array_push($did_unid_sql_array, $rslt[$k]['uniqueid']);
                    // $did_unid_sql .= "'".$row[0]."',";
                    $k++;
                }

                $did_unid_sql = preg_replace('/,$/i', '', $did_unid_sql);
                if (strlen($did_unid_sql) < 3) {
                    $did_unid_sql = "''";
                }

                $drop_call_status =[
                    'DROP',
                    'XDROP'
                ];
                $answer_status = [
                    'FER',
                    'XFER'
                ];
                $total_call_details = VicidialCloserLog::callDetailsBetweenDate($campaign, $start_date, $end_date);
                
                $total_call_details1_with_y = '';
                if ($did == 'Y') {
                    $total_call_details1 = VicidialCloserLog::callDetailsBetweenDateUnique($did_unid_sql_array, $start_date, $end_date);

                    $total_call_details1_with_y = $total_call_details1[0]['totalcalls'];
                }
                
                $drop_call_details = VicidialCloserLog::callDetailsBetweenDateWithStatus($campaign, $drop_call_status, $start_date, $end_date);



                $drop_call_details_with_y = '';
                if ($did == 'Y') {
                    $status_arr = [
                        "DROP",
                        "XDROP"
                    ];

                    $drop_call_details1 = VicidialCloserLog::dropCallDetails($did_unid_sql_array, $status_arr, $start_date, $end_date);
                
                    $drop_call_details_with_y = $drop_call_details1[0]['drop_calls'];
                
                }

                $answer_call = VicidialCloserLog::callDetailsBetweenDateWithCount($campaign, $answer_status, $start_date, $end_date);
                if ($did == 'Y') {

                    $answer_call = VicidialCloserLog::callDetailsBetweenDateWithUniqueIdAnsState($unique_sql, $answer_status, $start_date, $end_date);
                }

                $ivr_call = LiveInboundLog::callCountLiveInboundLog($campaign, 'START', $start_date, $end_date);

                if ($did == 'Y') {

                    $ivr_call = LiveInboundLog::callCountLiveInboundLogWithUniqueId($unique_sql, $start_date, $end_date);
                
                }

                $drop_percent = '';
                $campaign_total_calls = '';
                $campaign_drop_calls = '';

                if ($did == 'Y') {
                    $drop_percent = $this->calculatePercentage($drop_call_details_with_y, $total_call_details1_with_y);
                    $campaign_drop_calls = $drop_call_details_with_y;
                    $campaign_total_calls = $total_call_details1_with_y;
                } else {
                    $campaign_drop_calls = count($drop_call_details);
                    $campaign_total_calls = count($total_call_details);
                    $drop_percent = $this->calculatePercentage(count($drop_call_details), count($total_call_details));
                }

                 $single_campaign_details = [
                    'campaign_id' => $campaign_to_print,
                    'campaign_total_calls' => $campaign_total_calls,
                    'campaign_drop_calls' => $campaign_drop_calls,
                    'campaign_drop_persent' => $drop_percent,
                    'campaign_ivr_calls' => $ivr_call[0]['count'],
                    'campaign_answered_calls' => $answer_call[0]['count']
                ];
                $i++;

                array_push($return_details_campaign_wise, $single_campaign_details);
            }
            
        }

        return $return_details_campaign_wise;
    }

    public function calculatePercentage($part, $whole) 
    {
        if ($whole != 0) {
            if ($part != 0) {

                $percentage = $part * 100;
                $percentage = $percentage / $whole;

                return round($percentage);
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }

}
