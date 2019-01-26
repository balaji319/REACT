<?php

namespace App\Http\Controllers\Report;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Model;
use App\VicidialUser;
use App\VicidialUserGroup;
use App\VicidialInboundGroup;
use App\InboundDid;
use App\VicidialDidLog;
use App\VicidialCloserLog;
use App\Traits\AccessControl;
use App\VicidialInboundDid;
use App\LiveInboundLog;
use App\VicidialOutboundIvrLog;
use Response;
use App\VicidialCallTime;
use App\Traits\TimeConvert;
use Illuminate\Support\Facades\DB;
use App\VicidialCampaignStatuses;
use App\VicidialStatuses;
use App\VicidialLists;

class InboundController extends Controller {

    use AccessControl, TimeConvert;

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index() {
        $userlist = VicidialUser::distinct()->pluck('user_group')->toArray();
        $viewablegrouplist = VicidialUserGroup::whereIn('user_group', $userlist)->whereNotNull('admin_viewable_groups')->distinct()->get(['admin_viewable_groups'])->toArray();

        $finalallow = [];
        for ($i = 0; $i < count($viewablegrouplist); $i++) {
            $arra = explode(' ', $viewablegrouplist[$i]['admin_viewable_groups']);
            for ($j = 0; $j < count($arra); $j++) {
                $allowarr = $arra[$j];
                if ($allowarr) {
                    array_push($finalallow, $allowarr);
                }
            }
        }
        array_push($finalallow, '---ALL---');
        $finalallow = array_unique($finalallow);

        $list = VicidialInboundGroup::orderBy('group_id')->get(['group_id', 'group_name'])->toArray();
        # Have to provide access condition
        # TODO

        $datetime = date('H:i:s');
        $date = date('Y-m-d');

        return json_encode(array(
            'list' => $list,
            'datetime' => $datetime,
            'date' => $date
        ));
    }

    /**
     * Create function for inbound group By DID.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param Request $request
     * @return type
     * @throws \App\Http\Controllers\Report\Exception
     * @throws ForbiddenException
     */
    public function inboundByDid(Request $request) {
        try {
            date_default_timezone_set('America/Los_Angeles');
            $text_arr = array();
            $did = $request->input('did');
            $user = $request->user();
            $selectedgroups = $request->input('selectedgroups');
            if ($did !== 'Y') {
                if (!in_array(SYSTEM_COMPONENT_REPORT_INBOUND, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $user))) {
                    throw new ForbiddenException();
                }
                if (isset($selectedgroups) && is_array($selectedgroups)) {
                    $selectedgroups = array_intersect($selectedgroups, $this->getListByAccess(ACCESS_TYPE_INGROUP, ACCESS_READ, $user));
                }
            } else {
                if (!in_array(SYSTEM_COMPONENT_REPORT_INBOUND_BY_DID, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $user))) {
                    throw new ForbiddenException();
                }
            }
            $startdate = $request->input('startdate');
            $enddate = $request->input('enddate');
            $enddate1 = $request->input('enddate');
            $shift = $request->input('shift');
            $selectedgroups = $request->input('selectedgroups');
            $reportdisplaytype = $request->input('reportdisplaytype');
            if ($shift == 'AM') {
                $time_begin = "03:45:00";
                $time_end = "15:14:59";
            }
            if ($shift == 'PM') {
                $time_begin = "15:15:00";
                $time_end = "23:15:00";
            }
            if ($shift == 'ALL') {
                $time_begin = "00:00:00";
                $time_end = "23:59:59";
            }
            $startdate = "$startdate $time_begin";
            $enddate = "$enddate $time_end";
            $alldrop_call_details = $total_call_log = array();
            $dropstatus = array(
                'DROP',
                'XDROP'
            );
            $answerstatus = array(
                'FER',
                'XFER'
            );
            $ansStatusNotIn = array(
                'DROP',
                'XDROP',
                'HXFER',
                'QVMAIL',
                'HOLDTO',
                'LIVE',
                'QUEUE',
                'TIMEOT',
                'AFTHRS',
                'NANQUE',
                'INBND',
                'MAXCAL'
            );
            $campaign_wise_details = null;
            $group_string = '|';
            $i = 0;
            $group_ct = count($selectedgroups);
            if ($group_ct >= 1) {
                $group_string = implode('|', $selectedgroups);
            }
            if ($did == 'Y') {

                $selectedid = VicidialInboundDid::select("did_id", "did_description")
                                ->whereIn('did_pattern', $selectedgroups)->orderBy('did_id', 'DESC')->get();
                $looparray = array();
                if (isset($selectedid)) {
                    $selectedid = $selectedid->toArray();
                    $cntsltdid = count($selectedid);
                }
                for ($i = 0; $i < $cntsltdid; $i++) {
                    $singleArray = $selectedid[$i]['did_id'];
                    array_push($looparray, $singleArray);
                }
                $uniqusql = array();
                $k = 0;
                while ($k < count($looparray)) {
                    $selecteuniquid = VicidialDidLog::select('uniqueid')->where('did_id', $looparray[$k])->orderBy('uniqueid', 'DESC')->get();
                    if (isset($selecteuniquid)) {
                        $selecteuniquid = $selecteuniquid->toArray();
                    }
                    for ($i = 0; $i < count($selecteuniquid); $i++) {
                        $singleArray = $selecteuniquid[$i]['uniqueid'];
                        array_push($uniqusql, $singleArray);
                    }
                    $k++;
                }
            }
            if ($selectedgroups) {
                if ($selectedgroups[0] != "---NONE---" && count($selectedgroups) > 0) {
                    $campaign_wise_details = $this->getDetailsByCampaignId($selectedgroups, $startdate, $enddate, $did);
                }
            }

            if ($did == 'Y') {

                $list = VicidialCloserLog::where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate]])->whereIn('uniqueid', $uniqusql)->get();

                $ivr_Call = LiveInboundLog::where([['start_time', '<=', $enddate], ['start_time', '>=', $startdate]])->whereIn('uniqueid', $uniqusql)->count();

                $avg_all_call = VicidialCloserLog::where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate]])
                                ->whereIn('uniqueid', $uniqusql)->avg('length_in_sec');

                $avg_all_call1 = VicidialCloserLog::where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate]])
                                ->whereIn('uniqueid', $uniqusql)->sum('length_in_sec');

                $totalanswered_call_details = VicidialCloserLog::where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate]])
                                ->whereIn('uniqueid', $uniqusql)->whereNotIn('status', $ansStatusNotIn)->count();

                $answered_call_details = VicidialCloserLog::where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate]])
                                ->whereIn('uniqueid', $uniqusql)->whereNotIn('status', $ansStatusNotIn)->avg('queue_seconds');

                $totaldrop_call_details = VicidialCloserLog::where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate]])
                                ->whereIn('uniqueid', $uniqusql)->whereIn('status', $dropstatus)->get();

                $drop_call_details = VicidialCloserLog::where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate]])
                                ->whereIn('uniqueid', $uniqusql)->whereIn('status', $dropstatus)->avg('length_in_sec');       //Average_drop_hold

                $drop_call_details1 = VicidialCloserLog::where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate]])
                                ->whereIn('uniqueid', $uniqusql)->whereIn('status', $dropstatus)->sum('length_in_sec');       //Average_drop_hold1

                $queue_call_details = VicidialCloserLog::where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate], ['queue_seconds', '>', 0]])
                                ->whereIn('uniqueid', $uniqusql)->get();

                $queue_seconds = VicidialCloserLog::where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate], ['queue_seconds', '>', 0]])
                                ->whereIn('uniqueid', $uniqusql)->sum('queue_seconds');              //TotalQueueSeconds
            } else {
                $list = VicidialCloserLog::where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate]])->whereIn('campaign_id', $selectedgroups)->get();

                $ivr_Call = LiveInboundLog::where([['start_time', '<=', $enddate], ['start_time', '>=', $startdate], ['comment_b', 'START']])->whereIn('comment_a', $selectedgroups)->count();

                $avg_all_call = VicidialCloserLog::where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate]])
                                ->whereIn('campaign_id', $selectedgroups)->avg('length_in_sec');

                $totalanswered_call_details = VicidialCloserLog::where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate]])
                                ->whereIn('campaign_id', $selectedgroups)->whereNotIn('status', $ansStatusNotIn)->count();

                $answered_call_details = VicidialCloserLog::where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate]])
                                ->whereIn('campaign_id', $selectedgroups)->whereNotIn('status', $ansStatusNotIn)->avg('queue_seconds');

                $totaldrop_call_details = VicidialCloserLog::where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate]])
                                ->whereIn('campaign_id', $selectedgroups)->whereIn('status', $dropstatus)->get();

                $drop_call_details = VicidialCloserLog::where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate]])
                                ->whereIn('campaign_id', $selectedgroups)->whereIn('status', $dropstatus)->avg('length_in_sec');       //Average_drop_hold

                $queue_call_details = VicidialCloserLog::where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate], ['queue_seconds', '>', 0]])
                                ->whereIn('campaign_id', $selectedgroups)->get();

                $queue_seconds = VicidialCloserLog::where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate], ['queue_seconds', '>', 0]])
                                ->whereIn('campaign_id', $selectedgroups)->sum('queue_seconds');              //TotalQueueSeconds
            }


            $answer_sec_pct_rt_stat_one = VicidialInboundGroup::select('answer_sec_pct_rt_stat_one', 'answer_sec_pct_rt_stat_two')
                            ->whereIn('group_id', $selectedgroups)->orderBy('answer_sec_pct_rt_stat_one', 'DESC')->first();

            if (isset($list)) {
                $list_count = $list->count();
            } else {
                $list_count = 0;
            }
            $total_call_log['totalcalls'] = $list_count;
            $total_call_log['totalanswercall'] = $totalanswered_call_details;

            if ($avg_all_call) {
                $total_call_log['AvgAllCall'] = $avg_all_call;
            } else {
                $total_call_log['AvgAllCall'] = 0;
            }

            if ($did == 'Y') {
                if ($avg_all_call1) {
                    $total_call_log['AvgAllCall'] = $avg_all_call1 / $total_call_log['totalcalls'];
                    $total_call_log['AvgAllCall'] = $total_call_log['AvgAllCall'];
                    $total_call_log['AvgAllCall'] = round($total_call_log['AvgAllCall'], 0);
                    $total_call_log['AvgAllCall'] = sprintf("%10s", $total_call_log['AvgAllCall']);
                } else {
                    $total_call_log['AvgAllCall'] = 0;
                }
            }
            //call cumulative
            $answered_call_details1 = VicidialCloserLog::select('queue_seconds')->where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate]])
                            ->whereIn('campaign_id', $selectedgroups)->whereNotIn('status', $ansStatusNotIn)->get();

            if (isset($answered_call_details1)) {
                $answeredCalldetails1Count = $answered_call_details1->count();
            }
            //did query
            if ($did == 'Y') {
                $answered_call_details1 = VicidialCloserLog::select(DB::raw('count(*) as count,queue_seconds'))->where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate]])
                                ->whereIn('uniqueid', $uniqusql)->whereNotIn('status', $ansStatusNotIn)->groupBy('queue_seconds')->get();
            }

            # GET LIST OF ALL STATUSES and create SQL from human_answered statuses
            $q = 0;
            $rslt = \App\VicidialStatuses::select('status', 'status_name', 'human_answered', 'category')->get();
            if (isset($rslt)) {
                $statuses_to_print = $rslt->count();
                $p = 0;
                $row = $rslt->toArray();
                while ($p < $statuses_to_print) {
                    $status = $row[$p]['status'];
                    $status_name[$status] = $row[$p]['status_name'];
                    $human_answered[$status] = $row[$p]['human_answered'];
                    $category[$status] = $row[$p]['category'];
                    $q++;
                    $p++;
                }
            }
            $rslt = \App\VicidialCampaignStatuses::select('status', 'status_name', 'human_answered', 'category')->get();
            if (isset($rslt)) {
                $statuses_to_print = $rslt->count();
                $p = 0;
                $row = $rslt->toArray();
                while ($p < $statuses_to_print) {
                    $status = $row[$p]['status'];
                    $status_name[$status] = $row[$p]['status_name'];
                    $human_answered[$status] = $row[$p]['human_answered'];
                    $category[$status] = $row[$p]['category'];
                    $q++;
                    $p++;
                }
            }
            $status_name1 = array_unique($status_name);
            $category1 = $category;
            if ($answered_call_details) {
                $total_call_log['Averageanswer'] = round($answered_call_details, 2);
            } else {
                $total_call_log['Averageanswer'] = 0;
            }

            $total_call_log['answer_percentage'] = $this->calculatePercentage($totalanswered_call_details, $list_count);
            $total_call_log['totalIVR'] = $ivr_Call;

            if (isset($totaldrop_call_details)) {
                $total_drop_call_details_count = $totaldrop_call_details->count();
            } else {
                $total_drop_call_details_count = 0;
            }
            $alldrop_call_details['totaldropcalls'] = $total_drop_call_details_count;
            if ($drop_call_details) {
                $alldrop_call_details['average_hold_time'] = $drop_call_details;
            } else {
                $alldrop_call_details['average_hold_time'] = 0;
            }

            if ($did == 'Y') {
                if ($drop_call_details1) {
                    $alldrop_call_details['average_hold_time'] = $drop_call_details1;
                    $alldrop_call_details['average_hold_time'] = ($drop_call_details1 / $alldrop_call_details['totaldropcalls']);
                    $alldrop_call_details['average_hold_time'] = round($alldrop_call_details['average_hold_time'], 0);
                } else {
                    $alldrop_call_details['average_hold_time'] = 0;
                }
            }

            if (isset($queue_call_details)) {
                $queueCallDetails_count = $queue_call_details->count();
            } else {
                $queueCallDetails_count = 0;
            }
            $alldrop_call_details['Droppercentage'] = $this->calculatePercentage($total_drop_call_details_count, $list_count);
            $totalqueueCalls = $queueCallDetails_count;
            $totalqueuecallspercent = $this->calculatePercentage($queueCallDetails_count, $list_count);

            $drop_answered_percent = $this->calculatePercentage($total_drop_call_details_count, $totalanswered_call_details);

            $totalqueueSeconds = $queue_seconds;
            $avg_queue_length_for_queued = $this->getDivision($totalqueueSeconds, $queueCallDetails_count);
            $avg_queue_length_for_queued = round($avg_queue_length_for_queued, 2);
            $avg_queue_length_for_all = $this->getDivision($totalqueueSeconds, $list_count);
            $avg_queue_length_for_all = round($avg_queue_length_for_all, 2);
            $queue_calls_data = array(
                'totalqueued' => $totalqueueCalls,
                'queueCallPercent' => $totalqueuecallspercent,
                'avgsecondforqueued' => $avg_queue_length_for_queued,
                'avgsecondforall' => $avg_queue_length_for_all
            );

            $indicators = array();
            $answerone = $answertwo = $pct_answer_sec_pct_rt_stat_one = $pct_answer_sec_pct_rt_stat_two = 0;
            if ($answer_sec_pct_rt_stat_one) {
                $answerone = $answer_sec_pct_rt_stat_one->answer_sec_pct_rt_stat_one;
                $answertwo = $answer_sec_pct_rt_stat_one->answer_sec_pct_rt_stat_two;


                $answered_call_details_min1 = VicidialCloserLog::where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate], ['queue_seconds', '<=', $answerone]])
                                ->whereIn('campaign_id', $selectedgroups)->whereNotIn('status', $ansStatusNotIn)->count();

                $answer_sec_pct_rt_stat_one = $answered_call_details_min1;

                $answered_call_details_max1 = VicidialCloserLog::where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate], ['queue_seconds', '<=', $answertwo]])
                                ->whereIn('campaign_id', $selectedgroups)->whereNotIn('status', $ansStatusNotIn)->count();

                $answer_sec_pct_rt_stat_two = $answered_call_details_max1;
                $pct_answer_sec_pct_rt_stat_one = ($this->getDivision($answer_sec_pct_rt_stat_one, $totalanswered_call_details) * 100);
                $pct_answer_sec_pct_rt_stat_one = round($pct_answer_sec_pct_rt_stat_one, 0);
                $pct_answer_sec_pct_rt_stat_two = ($this->getDivision($answer_sec_pct_rt_stat_two, $totalanswered_call_details) * 100);
                $pct_answer_sec_pct_rt_stat_two = round($pct_answer_sec_pct_rt_stat_two, 0);
            }

            $category_status_call_detail = \App\VicidialStatusCategories::select("vsc_id", "vsc_name")->get();

            $indicators['answerone'] = $answerone;
            $indicators['answertwo'] = $answertwo;
            $indicators['answer_percentage'] = $this->calculatePercentage($totalanswered_call_details, $list_count);

            $indicators['pct_answer_sec_pct_rt_stat_one'] = $pct_answer_sec_pct_rt_stat_one;
            $indicators['pct_answer_sec_pct_rt_stat_two'] = $pct_answer_sec_pct_rt_stat_two;
            $indicators['drop_answered_percent'] = $drop_answered_percent;

            $hold_time_breakdown = $this->getHoldTimeBreakDownInSeconds($list);
            $drop_time_break_down = $this->getDropTimeBreakDownInSeconds($totaldrop_call_details);
            $answerpercent_break_down = $this->getCumulativeAndTotalPercent($totalanswered_call_details, $answered_call_details1, $list_count);
            $hangup_stats = $this->getCallHangupStats($list);

            if ($did == 'Y') {
                $statu_stats = $this->getCallStatusStats($uniqusql, $startdate, $enddate, $status_name1, $category1, $did);
            } else {
                $statu_stats = $this->getCallStatusStats($selectedgroups, $startdate, $enddate, $status_name1, $category1, $did);
            }
            
            $initial_break_down = $this->getinitialBreakdown($list);
            if ($did == 'Y') {
                $agent_stat_detail = $this->getAgentStats($list, $uniqusql, $startdate, $enddate, $did);
            } else {
                $agent_stat_detail = $this->getAgentStats($list, $selectedgroups, $startdate, $enddate, $did);
            }

            if ($did == 'Y') {
                $incrementalcalls = $this->getIncrementTotalCalls($startdate, $enddate, $shift, $uniqusql, $did);
            } else {
                $incrementalcalls = $this->getIncrementTotalCalls($startdate, $enddate, $shift, $selectedgroups, $did);
            }
            if ($did == 'Y') {
                $commonarray15min = $this->getAnsBreakdowndetails($uniqusql, $startdate, $enddate, $shift, $did);
            } else {
                $commonarray15min = $this->getAnsBreakdowndetails($selectedgroups, $startdate, $enddate, $shift, $did);
            }

            // My arrays from afzal
            $values_array = array(
                "total_call_log" => $total_call_log,
                "all_drop_call_details" => $alldrop_call_details,
                "campaign_wise_details" => $campaign_wise_details,
                "queue_call_details" => $queue_calls_data,
                "indicators" => $indicators,
                "data" => $request->input()
            );

            $hold_time_break = $hold_time_breakdown;
            array_unshift($hold_time_break, " ");
            $drop_time_break = $drop_time_break_down;
            array_unshift($drop_time_break, " ");
            $all_values = array(
                "values_array" => $values_array,
                "campaing" => $campaign_wise_details,
                "hold_time_break" => $hold_time_break,
                "drop_time_break" => $drop_time_break,
                "answerpercentBreak" => $answerpercent_break_down,
                "hangup" => $hangup_stats,
                "statu_stats" => $statu_stats,
                "category_status" => $category_status_call_detail,
                "initial_break_down" => $initial_break_down,
                "agent_stat_detail" => $agent_stat_detail,
                "commonarray15min" => $commonarray15min
            );

            $datetime = date('H:i:s');
            $maxcamptotalarray = array();
            $maxcampaignivrcallsarray = array();
            $maxcampaigndropcallsarray = array();
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
            if(!isset($campaign_wise_details)){$campaign_wise_details = [];}

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
            $maxcampaignivrcalls = (empty($maxcampaignivrcallsarray)) ? [] : max($maxcampaignivrcallsarray);
            $maxcampaigndropcalls = (empty($maxcampaigndropcallsarray)) ? [] : max($maxcampaigndropcallsarray);

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

            $countAgent = count($agent_stat_detail['agentdata']);
            if (count($agent_stat_detail) > 0) {
                $maxiveragentstatdetails = $agent_stat_detail[0]['total']['calls'];
            } else {
                $maxiveragentstatdetails = 0;
            }

            $groupStr = "'" . @implode("','", array_map(function ($el) {
                                return $el;
                            }, $selectedgroups)) . "'";
            $uniqueArrSQL = $didArrSQL = [];
            if ($did == 'Y') {
                $didArr = VicidialInboundDid::select('did_id')->whereIn('did_pattern', $selectedgroups)->get();
                if (isset($didArr)) {
                    $didArr_count = $didArr->count();
                    $didArr = $didArr->toArray();
                }
                $c1 = $didArr_count;
                for ($i = 0; $i < $c1; $i++) {
                    $didArrSQL[] = $didArr[$i]['did_id'];
                }
                $uniqueArr = VicidialDidLog::select('uniqueid')->whereIn('did_id', $didArrSQL)->get();
                for ($i = 0; $i < count($uniqueArr); $i++) {
                    $uniqueArrSQL[] = $uniqueArr[$i]['uniqueid'];
                }
            }

            $bdswered_calls = 0;
            $gmt_conf_ctArr = \App\Servers::select('local_gmt')->where('active', 'Y')->first();
            $dst = date("I");
            if (isset($gmt_conf_ctArr)) {
                $gmt_conf_ctArr_count = $gmt_conf_ctArr->count();
            } else {
                $gmt_conf_ctArr_count = 0;
            }
            if ($gmt_conf_ctArr_count > 0) {
                $local_gmt = $gmt_conf_ctArr->local_gmt;
                $epoch_offset = (($local_gmt + $dst) * 3600);
            }

            if ($did == 'Y') {
                $stmt = VicidialCloserLog::select('status', 'queue_seconds', 'call_date')
                        ->where([['vicidial_closer_log.call_date', '<=', $enddate], ['vicidial_closer_log.call_date', '>=', $startdate]])
                        ->whereIn('uniqueid', $uniqusql)
                        ->get();
            } else {
                $stmt = VicidialCloserLog::select('status', 'queue_seconds', 'call_date')
                        ->where([['vicidial_closer_log.call_date', '<=', $enddate], ['vicidial_closer_log.call_date', '>=', $startdate]])
                        ->whereIn('campaign_id', $selectedgroups)
                        ->get();
            }
            if (isset($stmt)) {
                $fifteen_min_arr_count = $stmt->count();
                $fifteen_min_arr = $stmt->toArray();
            }
            $j = 0;
            $ad_b0 = $ad_b5 = $ad_b10 = $ad_b15 = $ad_b20 = $ad_b25 = $ad_b30 = $ad_b35 = $ad_b40 = $ad_b45 = $ad_b50 = $ad_b55 = $ad_b60 = $ad_b90 = $ad_b99 = $f_drop = $f_total = $f_answer = $c_status = $c_queue = $c_epoch = $c_date = $c_rem = array();
            $ad_b_0 = $ad_b_5 = $ad_b10 = $ad_b15 = $ad_b20 = $ad_b25 = $ad_b30 = $ad_b35 = $ad_b40 = $ad_b45 = $ad_b50 = $ad_b55 = $ad_b60 = $ad_b90 = $ad_b99 = array();
            while ($j < $fifteen_min_arr_count) {
                $c_status[$j] = $fifteen_min_arr[$j]['status'];
                $c_queue[$j] = $fifteen_min_arr[$j]['queue_seconds'];
                $c_epoch[$j] = strtotime($fifteen_min_arr[$j]['call_date']);
                $c_date[$j] = $fifteen_min_arr[$j]['call_date'];
                $c_rem[$j] = (($c_epoch[$j] + $epoch_offset) % 86400);

                $i = 0;
                $sec = 0;
                $sec_end = 900;

                while ($i <= 96) {
                    if (($c_rem[$j] >= $sec) and ( $c_rem[$j] < $sec_end)) {
                        $f_total[$i] = isset($f_total[$i]) ? $f_total[$i]+1 : 1;
                        if (preg_match('/DROP/', $c_status[$j])) {
                            $f_drop[$i] = isset($f_drop[$i]) ? $f_drop[$i]+1 : 1;
                        }
                        if (!preg_match('/DROP|XDROP|HXFER|QVMAIL|HOLDTO|LIVE|QUEUE|TIMEOT|AFTHRS|NANQUE|INBND|MAXCAL/', $c_status[$j])) {
                            $bdswered_calls++;
                            $f_answer[$i] = isset($f_answer[$i]) ? $f_answer[$i]+1 : 1;
                            if ($c_queue[$j] == 0) {
                                $ad_b_0[$i] = isset($ad_b_0[$i]) ? $ad_b_0[$i]+1 : 1;
                            }
                            if (($c_queue[$j] > 0) and ( $c_queue[$j] <= 5)) {
                                $ad_b_5[$i] = isset($ad_b_5[$i]) ? $ad_b_5[$i]+1 : 1;
                            }
                            if (($c_queue[$j] > 5) and ( $c_queue[$j] <= 10)) {
                                $ad_b10[$i] = isset($ad_b10[$i]) ? $ad_b10[$i]+1 : 1;
                            }
                            if (($c_queue[$j] > 10) and ( $c_queue[$j] <= 15)) {
                                $ad_b15[$i] = isset($ad_b15[$i]) ? $ad_b15[$i]+1 : 1;
                            }
                            if (($c_queue[$j] > 15) and ( $c_queue[$j] <= 20)) {
                                $ad_b20[$i] = isset($ad_b20[$i]) ? $ad_b20[$i]+1 : 1;
                            }
                            if (($c_queue[$j] > 20) and ( $c_queue[$j] <= 25)) {
                                $ad_b25[$i] = isset($ad_b25[$i]) ? $ad_b25[$i]+1 : 1;
                            }
                            if (($c_queue[$j] > 25) and ( $c_queue[$j] <= 30)) {
                                $ad_b30[$i] = isset($ad_b30[$i]) ? $ad_b30[$i]+1 : 1;
                            }
                            if (($c_queue[$j] > 30) and ( $c_queue[$j] <= 35)) {
                                $ad_b35[$i] = isset($ad_b35[$i]) ? $ad_b35[$i]+1 : 1;
                            }
                            if (($c_queue[$j] > 35) and ( $c_queue[$j] <= 40)) {
                                $ad_b40[$i] = isset($ad_b40[$i]) ? $ad_b40[$i]+1 : 1;
                            }
                            if (($c_queue[$j] > 40) and ( $c_queue[$j] <= 45)) {
                                $ad_b45[$i] = isset($ad_b45[$i]) ? $ad_b45[$i]+1 : 1;
                            }
                            if (($c_queue[$j] > 45) and ( $c_queue[$j] <= 50)) {
                                $ad_b50[$i] = isset($ad_b50[$i]) ? $ad_b50[$i]+1 : 1;
                            }
                            if (($c_queue[$j] > 50) and ( $c_queue[$j] <= 55)) {
                                $ad_b55[$i] = isset($ad_b55[$i]) ? $ad_b55[$i]+1 : 1;
                            }
                            if (($c_queue[$j] > 55) and ( $c_queue[$j] <= 60)) {
                                $ad_b60[$i] = isset($ad_b60[$i]) ? $ad_b60[$i]+1 : 1;
                            }
                            if (($c_queue[$j] > 60) and ( $c_queue[$j] <= 90)) {
                                $ad_b90[$i] = isset($ad_b90[$i]) ? $ad_b90[$i]+1 : 1;
                            }
                            if ($c_queue[$j] > 90) {
                                $ad_b99[$i] = isset($ad_b99[$i]) ? $ad_b99[$i]+1 : 1;
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
                $hour_count[$i] = isset($f_total[$i]) ? $f_total[$i] : 0;
                if ($hour_count[$i] > $hi_hour_count) {
                    $hi_hour_count = $hour_count[$i];
                }
                if ($hour_count[$i] > 0) {
                    $last_full_record = $i;
                }
                $drop_count[$i] = isset($f_drop[$i]) ? $f_drop[$i] : 0;
                $i++;
            }
            $hour_multiplier = $this->MathZDC(100, $hi_hour_count);
            $k = 1;
            $mk = 0;
            $call_scale = '0';
            $call_scale_arr = array();
            array_push($call_scale_arr, 0);
            while ($k <= 102) {
                if ($mk >= 5) {
                    $mk = 0;
                    $scale_num = $this->MathZDC($k, $hour_multiplier);
                    $scale_num = round($scale_num, 0);
                    $len_ENscale_num = (strlen($scale_num));
                    $k = ($k + $len_ENscale_num);
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
                $Ghour_count = $hour_count[$i];

                if ($Ghour_count < 1) {
                    if (($no_lines_yet) or ( $i > $last_full_record)) {
                        $do_nothing = 1;
                    } else {
                        $hour_count[$i] = sprintf("%-5s", $hour_count[$i]);
                        $text_arr[$i]['time'] = $time;
                        $text_arr[$i]['color_R'] = '';
                        $text_arr[$i]['arrow'] = '';
                        $text_arr[$i]['color_G'] = 'green';
                        $text_arr[$i]['calls'] = 0;
                        $text_arr[$i]['drops'] = 0;
                        $k = 0;
                        while ($k <= 102) {/* $text_arr['time'] = " "; */
                            $k++;
                        }
                    }
                } else {
                    $no_lines_yet = 0;
                    $x_hour_count = ($Ghour_count * $hour_multiplier);
                    $y_hour_count = (99 - $x_hour_count);
                    $g_drop_count = $drop_count[$i];
                    $text_arr[$i]['time'] = $time;
                    $text_arr[$i]['color_R'] = '';
                    $text_arr[$i]['arrow'] = '';
                    $text_arr[$i]['color_G'] = 'green';
                    if ($g_drop_count < 1) {
                        $hour_count[$i] = sprintf("%-5s", $hour_count[$i]);
                        //$ascii_text.="|$time|<SPAN class=\"green\">";
                        $k = 0;
                        $ascii_text = '';
                        while ($k <= $x_hour_count) {
                            $ascii_text .= "*";
                            $k++;
                            $char_counter++;
                        }
                        $text_arr[$i]['stars'] = $ascii_text;
                        $text_arr[$i]['stars'] .= '*X';
                        $char_counter++;
                        $k = 0;
                        while ($k <= $y_hour_count) {/* $text_arr[$i]['stars']  .= ' '; /*$ascii_text.=" "; */
                            $k++;
                            $char_counter++;
                        }
                        while ($char_counter <= 101) {/* $text_arr[$i]['stars']  .= ' '; /*$ascii_text.=" "; */
                            $char_counter++;
                        }
                        $text_arr[$i]['calls'] = $hour_count[$i];
                        $text_arr[$i]['drops'] = 0;
                    } else {
                        $Xdrop_count = ($g_drop_count * $hour_multiplier);
                        $XXhour_count = (($x_hour_count - $Xdrop_count) - 1);

                        $hour_count[$i] += 0;
                        $drop_count[$i] += 0;

                        $hour_count[$i] = sprintf("%-5s", $hour_count[$i]);
                        $drop_count[$i] = sprintf("%-5s", $drop_count[$i]);

                        $text_arr[$i]['time'] = $time;
                        $text_arr[$i]['color_R'] = 'red';
                        $k = 0;
                        $ascii_text = ' ';
                        while ($k <= $Xdrop_count) {
                            $ascii_text .= ">";
                            $k++;
                            $char_counter++;
                        }
                        $text_arr[$i]['arrow'] = $ascii_text;
                        $text_arr[$i]['arrow'] .= 'D'; /* $ascii_text.="D</SPAN><SPAN class=\"green\">"; */
                        $text_arr[$i]['color_G'] = 'green';
                        $char_counter++;
                        $k = 0;
                        $ascii_text = ' ';
                        while ($k <= $XXhour_count) {
                            $ascii_text .= "*";
                            $k++;
                            $char_counter++;
                        }
                        $text_arr[$i]['stars'] = $ascii_text;
                        $text_arr[$i]['stars'] .= 'X'; /* $ascii_text.="X</SPAN>"; */
                        $char_counter++;
                        $k = 0;
                        while ($k <= $y_hour_count) {
                            $k++;
                            $char_counter++;
                        }
                        while ($char_counter <= 102) {/* $text_arr[$i]['stars'] = ' ';/*$ascii_text.=" "; */
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
                    $sql_time = "$hour:$zz:00";
                    $sql_time_end = "$hour:15:00";
                }
                if ($h == 1) {
                    $time = "   15 ";
                    $sql_time = "$hour:15:00";
                    $sql_time_end = "$hour:30:00";
                }
                if ($h == 2) {
                    $time = "   30 ";
                    $sql_time = "$hour:30:00";
                    $sql_time_end = "$hour:45:00";
                }
                if ($h == 3) {
                    $time = "   45 ";
                    $sql_time = "$hour:45:00";
                    $hour_end = ($hour + 1);
                    if ($hour_end < 10) {
                        $hour_end = "0$hour_end";
                    }
                    if ($hour_end > 23) {
                        $sql_time_end = "23:59:59";
                    } else {
                        $sql_time_end = "$hour_end:00:00";
                    }
                }
                if (isset($ad_b_0[$i]) && strlen($ad_b_0[$i]) < 1) {
                    $ad_b_0[$i] = '-';
                }
                if (isset($ad_b_5[$i]) && strlen($ad_b_5[$i]) < 1) {
                    $ad_b_5[$i] = '-';
                }
                if (isset($ad_b10[$i]) && strlen($ad_b10[$i]) < 1) {
                    $ad_b10[$i] = '-';
                }
                if (isset($ad_b15[$i]) && strlen($ad_b15[$i]) < 1) {
                    $ad_b15[$i] = '-';
                }
                if (isset($ad_b20[$i]) && strlen($ad_b20[$i]) < 1) {
                    $ad_b20[$i] = '-';
                }
                if (isset($ad_b25[$i]) && strlen($ad_b25[$i]) < 1) {
                    $ad_b25[$i] = '-';
                }
                if (isset($ad_b30[$i]) && strlen($ad_b30[$i]) < 1) {
                    $ad_b30[$i] = '-';
                }
                if (isset($ad_b35[$i]) && strlen($ad_b35[$i]) < 1) {
                    $ad_b35[$i] = '-';
                }
                if (isset($ad_b40[$i]) && strlen($ad_b40[$i]) < 1) {
                    $ad_b40[$i] = '-';
                }
                if (isset($ad_b45[$i]) && strlen($ad_b45[$i]) < 1) {
                    $ad_b45[$i] = '-';
                }
                if (isset($ad_b50[$i]) && strlen($ad_b50[$i]) < 1) {
                    $ad_b50[$i] = '-';
                }
                if (isset($ad_b50[$i]) && strlen($ad_b55[$i]) < 1) {
                    $ad_b55[$i] = '-';
                }
                if (isset($ad_b60[$i]) && strlen($ad_b60[$i]) < 1) {
                    $ad_b60[$i] = '-';
                }
                if (isset($ad_b90[$i]) && strlen($ad_b90[$i]) < 1) {
                    $ad_b90[$i] = '-';
                }
                if (isset($ad_b99[$i]) && strlen($ad_b99[$i]) < 1) {
                    $ad_b99[$i] = '-';
                }
                if (isset($f_answer[$i]) && strlen($f_answer[$i]) < 1) {
                    $f_answer[$i] = '0';
                }
                $f_answer[$i] = sprintf("%10s", isset($f_answer[$i]) ? $f_answer[$i] : '-');
                $callans_break_down[$i]['time'] = str_replace(" ", "", $time);
                $callans_break_down[$i][0] = str_replace(" ", "", isset($ad_b_0[$i]) ? $ad_b_0[$i] : '-');
                $callans_break_down[$i][5] = str_replace(" ", "", isset($ad_b_5[$i]) ? $ad_b_5[$i] : '-');
                $callans_break_down[$i][10] = str_replace(" ", "", isset($ad_b10[$i]) ? $ad_b10[$i] : '-');
                $callans_break_down[$i][15] = str_replace(" ", "", isset($ad_b15[$i]) ? $ad_b15[$i] : '-');
                $callans_break_down[$i][20] = str_replace(" ", "", isset($ad_b20[$i]) ? $ad_b20[$i] : '-');
                $callans_break_down[$i][25] = str_replace(" ", "", isset($ad_b25[$i]) ? $ad_b25[$i] : '-');
                $callans_break_down[$i][30] = str_replace(" ", "", isset($ad_b30[$i]) ? $ad_b30[$i] : '-');
                $callans_break_down[$i][35] = str_replace(" ", "", isset($ad_b35[$i]) ? $ad_b35[$i] : '-');
                $callans_break_down[$i][40] = str_replace(" ", "", isset($ad_b40[$i]) ? $ad_b40[$i] : '-');
                $callans_break_down[$i][45] = str_replace(" ", "", isset($ad_b45[$i]) ? $ad_b45[$i] : '-');
                $callans_break_down[$i][50] = str_replace(" ", "", isset($ad_b50[$i]) ? $ad_b50[$i] : '-');
                $callans_break_down[$i][55] = str_replace(" ", "", isset($ad_b55[$i]) ? $ad_b55[$i] : '-');
                $callans_break_down[$i][60] = str_replace(" ", "", isset($ad_b60[$i]) ? $ad_b60[$i] : '-');
                $callans_break_down[$i][90] = str_replace(" ", "", isset($ad_b90[$i]) ? $ad_b90[$i] : '-');
                $callans_break_down[$i][99] = str_replace(" ", "", isset($ad_b99[$i]) ? $ad_b99[$i] : '-');
                $callans_break_down[$i]['total'] = str_replace(" ", "", isset($f_answer[$i]) ? $f_answer[$i] : '-');
                $i++;
                $h++;
            }


            $seventh_tables = [];
            $seventh_tables['downloadfile'] = 'Inbound Report By Group.csv';

            $seventh_tables['title'] = 'GRAPH IN 15 MINUTE INCREMENTS OF TOTAL CALLS  TAKEN INTO THIS IN-GROUP';
            if ($reportdisplaytype == 'TEXT') {
                $spacesbulid = '';
                $seventh_tables['hour'] = 'HOUR';
                $spaces = 103 / count($call_scale_arr);
                for ($i = 0; $i <= (round($spaces)); $i++) {
                    $spacesbulid .= '&nbsp;';
                }
                $tdVal = '';
                foreach ($call_scale_arr as $key => $val) {
                    $tdVal .= $val . $spacesbulid;
                }
                $seventh_tables['values'] = substr($tdVal, 0, -($spaces + 1)) ;
                $seventh_tables['drop'] = 'DROPS';
                $seventh_tables['total'] = 'TOTAL';
            } else {
                $seventh_tables['hour'] = 'HOUR';
                $seventh_tables['drop'] = 'DROPS';
                $seventh_tables['total'] = 'TOTAL';
            }
            ///echo $seventh_tables; exit;
            $fifteen_minute_table = @array_values($text_arr);
            $fifteen_minutes_graph = $graph_stats;
            
            if ($reportdisplaytype == 'TEXT') {
                $tbl_download['fifteen_min_table'] = $fifteen_minute_table;
                $seventh_tables['fifteen_min_table'] = $fifteen_minute_table;
            } else {
                $maxGraph = $max_calls + $max_drops;
                $seventh_tables['max_graph'] = $maxGraph;
                $seventh_tables['fifteen_min_table'] = $fifteen_minutes_graph;
                $tbl_download['fifteen_min_table'] = $fifteen_minutes_graph;
            }
            $seventh_tables['download_callansbreakdown'] = 'Inbound Report By Group.csv';
            $seventh_tables['call_breakdown_title'] = 'CALL ANSWERED TIME BREAKDOWN IN SECONDS';
            $callans_break_downsum = array_sum(array_map(function ($el) {
                        return $el['total'];
                    }, $callans_break_down));
            $call_ans_time_break_down = $callans_break_down;
            $seventh_tables['call_ans_time_break_down'] = $call_ans_time_break_down;
            $seventh_tables['finaltotal'] = $callans_break_downsum;

            $result_array = array(
                'maxiveragentstatdetails' => $maxiveragentstatdetails,
                'maxiverstatusstats' => $maxiverstatusstats,
                'maxiverhangup' => $maxiverhangup,
                'maxiver' => $maxiver,
                'datetime' => $datetime,
                'group_string' => $group_string,
                "total_call_log" => $total_call_log,
                "all_drop_call_details" => $alldrop_call_details,
                "campaign_wise_details" => $campaign_wise_details,
                "queue_call_details" => $queue_calls_data,
                "indicators" => $indicators,
                "HoldTimeBreakDown" => $hold_time_breakdown,
                "dropTimeBreakDown" => $drop_time_break_down,
                "answerpercentBreakDown" => $answerpercent_break_down,
                "HangupStats" => $hangup_stats,
                "StatusStats" => $statu_stats,
                "CategorystatusCalldetail" => $category_status_call_detail,
                "initial_break_down" => $initial_break_down,
                "agent_stat_detail" => $agent_stat_detail,
                "commonarray15min" => $commonarray15min,
                "incrementalcalls" => $incrementalcalls,
                "countAgent" => $countAgent,
                "maxcampaignivrcalls" => $maxcampaignivrcalls,
                "maxcampaigndropcalls" => $maxcampaigndropcalls,
                'agentmax' => $max,
                'maxstatusstate' => $maxstate,
                'startdate' => $startdate,
                'enddate' => $enddate,
                'seventhTable' => $seventh_tables,
                'tblDownload' => $tbl_download,
                'all_values' => $all_values
            );
            return response()->json([
                        'status' => 200,
                        'message' => 'Successfully.',
                        'data' => $result_array
            ]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound_by_did'), $e);
            throw $e;
        }
    }

    /**
     * start campaing function
     * @param type $campaign_id_list
     * @param type $startdate
     * @param type $enddate
     * @param type $did
     * @return array
     */
    public function getDetailsByCampaignId($campaign_id_list, $startdate, $enddate, $did) {
        $uniqusql = array();
        $returndetails_campaign_wise = array();
        $i = 0;
        foreach ($campaign_id_list as $key => $campaign) {
            $did_id[$i] = '0';
            $did_unid_sql = [];
            $campaign_to_print = '';

            $rslt = VicidialInboundDid::select("did_id", "did_description")->where("did_pattern", $campaign)->first();
            if (isset($rslt)) {
                $campaign_to_print = $campaign . " - " . $rslt->did_description;
                $s_dids_to_print = $rslt->count();
                if ($s_dids_to_print > 0) {
                    $did_id[$i] = $rslt->did_id;
                }
            }
            $rslt = VicidialDidLog::select('uniqueid')->where('did_id', $did_id[$i])->get();
            $k = 0;
            if (isset($rslt)) {
                $did_unids_to_print = $rslt->count();
                $rslt = $rslt->toArray();
                while ($k < $did_unids_to_print) {
                    $row[0] = $rslt[$k]['uniqueid'];
                    $did_unid_sql[] = $row[0];
                    $k++;
                }
            }

//            $did_unid_sql = preg_replace('/,$/i', '', $did_unid_sql);
//            if (strlen($did_unid_sql) < 3) {
//                $did_unid_sql = "''";
//            }
            //}
            $drop_call_status = array(
                'DROP',
                'XDROP'
            );
            $answerstatus = array(
                'FER',
                'XFER'
            );
            $total_call_details = VicidialCloserLog::where([['campaign_id', $campaign], ['call_date', '>=', $startdate], ['call_date', '<=', $enddate]])->get();
            //did query
            if ($did == 'Y') {
//                $total_call_details1 = VicidialCloserLog::whereBetween('call_date', [$enddate ,$startdate])->whereIn('uniqueid', $did_unid_sql)->count();
                $total_call_details_1 = VicidialCloserLog::
                        select (DB::raw('count(*) AS totalcalls , sum(length_in_sec) AS len'))            //sum("length_in_sec")  //need to check depedency.
                  ->where([['call_date','<=',$enddate],['call_date','>=',$startdate]])->whereIn('uniqueid',$did_unid_sql)->get(); 
                $total_call_details1 = $total_call_details_1[0]->totalcalls;
            }
            
            $drop_call_details = VicidialCloserLog::where([['campaign_id', $campaign], ['call_date', '<=', $enddate], ['call_date', '>=', $startdate]])->whereIn('status', $drop_call_status)->get();
            //did query
            if ($did == 'Y') {
                $status_arr = array(
                    "DROP",
                    "XDROP"
                );
//                $drop_call_details1 = VicidialCloserLog::where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate]])->whereIn('status', $status_arr)->whereIn('uniqueid', $did_unid_sql)->count();
                 $drop_call_details_1 = VicidialCloserLog:: // sum('length_in_sec')-> //need to check depedency.
                   select (DB::raw('count(*) AS totalcalls , sum(length_in_sec) AS len'))    
                  ->where([['call_date','<=',$enddate],['call_date','>=',$startdate]])->whereIn('status',$status_arr)->whereIn('uniqueid',$did_unid_sql)->get(); 
                 $drop_call_details1 = $drop_call_details_1[0]->totalcalls;
            }

            $answer_call = VicidialCloserLog::where([['campaign_id', $campaign], ['call_date', '<=', $enddate], ['call_date', '>=', $startdate]])
                            ->whereIn('status', $answerstatus)->count();
            //did query
            if ($did == 'Y') {
                $answer_call = VicidialCloserLog::where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate]])
                                ->whereIn('status', $answerstatus)->whereIn('uniqueid', $did_unid_sql)->count();
            }
            $ivr_call = LiveInboundLog::where([['comment_a', $campaign], ['start_time', '<=', $enddate],
                            ['start_time', '>=', $startdate], ['comment_b', 'START']])->count();
            //did query
            if ($did == 'Y') {
                $ivr_call = LiveInboundLog::where([['start_time', '<=', $enddate], ['start_time', '>=', $startdate]])
                                ->whereIn('uniqueid', $did_unid_sql)->count();
            }
            if ($did == 'Y') {
                $droppercent = $this->calculatePercentage($drop_call_details1, $total_call_details1);
                $campaigndropcalls = $drop_call_details1;
                $campaigntotalcalls = $total_call_details1;
            }
            $singleCampaignDetails = array(
                'campaignId' => $campaign_to_print,
                'campaigntotalcalls' => $campaigntotalcalls,
                'campaigndropcalls' => $campaigndropcalls,
                'campaigndroppersent' => $droppercent,
                'campaignivrcalls' => $ivr_call,
                'campaignAnsweredCalls' => $answer_call
            );
            array_push($returndetails_campaign_wise, $singleCampaignDetails);
        }
        return $returndetails_campaign_wise;
    }

    /**
     * Calculate percentage.
     * @param type $part
     * @param type $whole
     * @return int
     */
    public function calculatePercentage($part, $whole) {
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

    /**
     * GEt hold time breakdown in secords.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param type $list
     * @return type
     */
    public function getHoldTimeBreakDownInSeconds($list) {

        $hd_0 = 0;
        $total = 0;
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
        if (isset($list)) {
            $total = $list->count();
            $HoldtimeCalldetails = $list->toArray();
        } else {
            $HoldtimeCalldetails = $list;
        }
        if ($HoldtimeCalldetails) {
            foreach ($HoldtimeCalldetails as $key => $value) {
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

        return (array(
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
        ));
    }

    /**
     * Get all drop time breakdown in secords.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param type $totaldrop_call_details
     * @return type
     */
    public function getDropTimeBreakDownInSeconds($totaldrop_call_details) {
        try {
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

            if (isset($totaldrop_call_details)) {
                $total = $totaldrop_call_details->count();
                $DroptimeCalldetails = $totaldrop_call_details->toArray();
            } else {
                $DroptimeCalldetails = $totaldrop_call_details;
            }
            if ($DroptimeCalldetails) {
                foreach ($DroptimeCalldetails as $key => $value) {
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

            return (array(
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
            ));
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    /**
     * GEt cumulative and total percent in list.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param type $answered_call_details
     * @param type $totalCallDetails
     * @param type $list
     * @return int
     */
    public function getCumulativeAndTotalPercent($answered_call_details, $totalCallDetails, $list) {
        try {
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
            if (isset($totalCallDetails)) {
                $totalCallDetails = $totalCallDetails->toArray();
            } else {
                $totalCallDetails = $totalCallDetails;
            }
            if ($totalCallDetails) {
                $total = $answered_call_details;
                foreach ($totalCallDetails as $key => $value) {
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

                $interval = array(
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
                );

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

                $cumulative = array(
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
                );

                $total_calls = $total_calls;
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

                $intpercentage = array(
                    "INT%",
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
                );

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

                $cumulativepercentage = array(
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
                );
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

                $cumulativeanswerpercentage = array(
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
                );
                $anspercentbreakdown = array(
                    'interval' => $interval,
                    'cumulative' => $cumulative,
                    'intpercentage' => $intpercentage,
                    'cumulativepercentage' => $cumulativepercentage,
                    'cumulativeanswerpercentage' => $cumulativeanswerpercentage
                );

                return $anspercentbreakdown;
            } else {
                $interval = array(
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
                );

                $cumulative = array(
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
                );

                $intpercentage = array(
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
                );

                $cumulativepercentage = array(
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
                );

                $cumulativeanswerpercentage = array(
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
                );

                $anspercentbreakdown = array(
                    'interval' => $interval,
                    'cumulative' => $cumulative,
                    'intpercentage' => $intpercentage,
                    'cumulativepercentage' => $cumulativepercentage,
                    'cumulativeanswerpercentage' => $cumulativeanswerpercentage
                );

                return $anspercentbreakdown;
            }
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }

    public function getDivision($part, $whole) {
        try {
            if ($whole != 0) {
                if ($part != 0) {
                    return ($part / $whole);
                } else {
                    return 0;
                }
            } else {
                return 0;
            }
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    /**
     * Get all hangups stats list .
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param type $list
     * @return type
     */
    public function getCallHangupStats($list) {
        try {
            $valueArray = array(
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
            );
            if (isset($list)) {
                $total = $list->count();
                $list = $list->toArray();
            } else {
                $list = $list;
            }
            if ($list) {
                foreach ($list as $key => $value) {

                    $term = $value['term_reason'];
                    switch ($term) {
                        case 'CALLER': {
                                $valueArray[0] = $valueArray[0] + 1;
                                break;
                            }
                        case 'AGENT': {
                                $valueArray[1] = $valueArray[1] + 1;
                                break;
                            }
                        case 'QUEUETIMEOUT': {
                                $valueArray[2] = $valueArray[2] + 1;
                                break;
                            }
                        case 'ABANDON': {
                                $valueArray[3] = $valueArray[3] + 1;
                                break;
                            }
                        case 'AFTERHOURS': {
                                $valueArray[4] = $valueArray[4] + 1;
                                break;
                            }
                        case 'HOLDRECALLXFER': {
                                $valueArray[5] = $valueArray[5] + 1;
                                break;
                            }
                        case 'HOLDTIME': {
                                $valueArray[6] = $valueArray[6] + 1;
                                break;
                            }
                        case 'NOAGENT': {
                                $valueArray[7] = $valueArray[7] + 1;
                                break;
                            }
                        case 'NONE': {
                                $valueArray[8] = $valueArray[8] + 1;
                                break;
                            }
                        case 'MAXCALLS': {
                                $valueArray[9] = $valueArray[9] + 1;
                                break;
                            }
                    }
                }
                $fieldArray = array();
                for ($i = 0; $i < 10; $i++) {
                    if ($valueArray[$i] > 0) {
                        if ($i == 0) {
                            $fieldArray['CALLER'] = $valueArray[$i];
                        }
                        if ($i == 1) {
                            $fieldArray['AGENT'] = $valueArray[$i];
                        }
                        if ($i == 2) {
                            $fieldArray['QUEUETIMEOUT'] = $valueArray[$i];
                        }
                        if ($i == 3) {
                            $fieldArray['ABANDON'] = $valueArray[$i];
                        }
                        if ($i == 4) {
                            $fieldArray['AFTERHOURS'] = $valueArray[$i];
                        }
                        if ($i == 5) {
                            $fieldArray['HOLDRECALLXFER'] = $valueArray[$i];
                        }
                        if ($i == 6) {
                            $fieldArray['HOLDTIME'] = $valueArray[$i];
                        }
                        if ($i == 7) {
                            $fieldArray['NOAGENT'] = $valueArray[$i];
                        }
                        if ($i == 8) {
                            $fieldArray['NONE'] = $valueArray[$i];
                        }
                        if ($i == 9) {
                            $fieldArray['MAXCALLS'] = $valueArray[$i];
                        }
                    }
                }
                $fieldArray['TOTAL'] = $total;
            } else {
                $fieldArray['TOTAL'] = 0;
            }

            return ($fieldArray);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    /**
     * Get call status stats in selected user groups.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param type $selectedgroups
     * @param type $startdate
     * @param type $enddate
     * @param type $status_name1
     * @param type $category1
     * @param type $did
     * @return array
     */
    public function getCallStatusStats($selectedgroups, $startdate, $enddate, $status_name1, $category1, $did) {
        try {
            $list = VicidialCloserLog::select('status')->whereIn('campaign_id', $selectedgroups)
                            ->where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate]])
                            ->groupBy('status')->get();
            $list_sum = VicidialCloserLog::where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate]])
                            ->whereIn('campaign_id', $selectedgroups)
                            ->groupBy('status')->sum('length_in_sec');
            if ($did == 'Y') {
                $list = VicidialCloserLog::select(DB::raw( "COUNT(status) AS countrecords , status , SUM(length_in_sec) AS sum") )
                                ->whereIn('uniqueid', $selectedgroups)
                                ->where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate]])
                                ->groupBy('status')->get();
                $list_sum = VicidialCloserLog::where([['call_date', '<=', $enddate], ['call_date', '>=', $startdate]])
                                ->whereIn('uniqueid', $selectedgroups)->groupBy('status')->sum('length_in_sec');
            }
            $totaltime = 0;
            $totalcalls = 0;
            $totalhourcalls = 0;
            $totalhours = 0;
            $totalavg_sec = 0;

            $returnarray = array();
            $looparray = array();
            if (isset($list)) {
                $list_count = $list->count();
                $list = $list->toArray();
            } else {
                $list_count = 0;
            }
            for ($i = 0; $i < $list_count; $i++) {
                $totaltime = $totaltime + $list[$i]['sum'];
                $totalcalls = $totalcalls + $list[$i]['countrecords'];
            }

            for ($i = 0; $i < $list_count; $i++) {
                $hourcalls = $this->getDivision($list[$i]['countrecords'], $this->getDivision($totaltime, 3600));
                $hourcalls = round($hourcalls, 3);
                $totalhourcalls = $totalhourcalls + $hourcalls;
                $hours = $this->sec_convert($list[$i]['sum'], 'H');
                $avg_sec = $this->sec_convert($this->getDivision($list[$i]['sum'], $list[$i]['countrecords']), 'H');
                $status1 = $list[$i]['status'];
                $singlearray = array(
                    'status' => $list[$i]['status'],
                    'description' => isset($status_name1[$status1]) ? $status_name1[$status1] : '',
                    'category' => isset($category1[$status1]) ? $category1[$status1] : '',
                    'calls' => $list[$i]['countrecords'],
                    'totTime' => $hours,
                    'avg_sec' => $avg_sec,
                    'callperhour' => $hourcalls
                );
                array_push($looparray, $singlearray);
            }

            $returnarray['statsdata'] = $looparray;
            $totalhours = $this->sec_convert($totaltime, 'H');
            $totalavg_sec = $this->sec_convert($this->getDivision($totaltime, $totalcalls), 'H');
            $totalarray = array(
                'calls' => $totalcalls,
                'totTime' => $totalhours,
                'avg_sec' => $totalavg_sec,
                'callperhour' => $totalhourcalls
            );
            $lastarray = array('total' => $totalarray);
            array_push($returnarray, $lastarray);
            
            return $returnarray;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    /**
     * function use for convert the time.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param type $sec
     * @param type $precision
     * @return string
     */
    public function sec_convert($sec, $precision) {
        try {
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
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    /**
     * Get initial breakdown in list .
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param type $list
     * @return type
     */
    public function getinitialBreakdown($list) {
        try {
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
            if (isset($list)) {
                $total = $list->count();
                $breakdown_call_details = $list->toArray();
            } else {
                $breakdown_call_details = $list;
            }
            if ($breakdown_call_details) {
                foreach ($breakdown_call_details as $key => $value) {
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

            return (array(
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
            ));
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    //end

    /**
     * Get agent stats list.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param type $list
     * @param type $selectedgroups
     * @param type $startdate
     * @param type $enddate
     * @param type $did
     * @return array
     */
    public function getAgentStats($list, $selectedgroups, $startdate, $enddate, $did) {
        try {
            $returnarray = array();

            $agent_stat_detail = VicidialCloserLog::agentStateDetailsC($selectedgroups, $enddate, $startdate);
            if ($did == 'Y') {
                $agent_stat_detail = VicidialCloserLog::agentStateDetailsU($selectedgroups, $enddate, $startdate);
            }
            if (isset($agent_stat_detail)) {
                $agent_stat_detail_cnt = $agent_stat_detail->count();
                $agent_stat_detail = $agent_stat_detail->toArray();
            } else {
                $agent_stat_detail = [];
            }
            $totalavglength = 0;
            $totalsumlength = 0;
            $totalusers = 0;
            $looparray = array();
            if ($agent_stat_detail) {
                for ($i = 0; $i < $agent_stat_detail_cnt; $i++) {
                    $totalusers = $totalusers + $agent_stat_detail[$i]->countusers;
                    $totalavglength = $totalavglength + $agent_stat_detail[$i]->average_lenght;
                    $totalsumlength = $totalsumlength + $agent_stat_detail[$i]->sum_lenght;
                    $avg_len = $this->sec_convert($agent_stat_detail[$i]->average_lenght, 'H');
                    $sum_len = $this->sec_convert($agent_stat_detail[$i]->sum_lenght, 'H');
                    $usergroup = $agent_stat_detail[$i]->user . "-" . $agent_stat_detail[$i]->full_name;
                    $countuser = $agent_stat_detail[$i]->countusers;
                    $singlearray = array(
                        'usergroup' => $usergroup,
                        'countusers' => $countuser,
                        'avg_len' => $avg_len,
                        'sum_len' => $sum_len
                    );
                    array_push($looparray, $singlearray);
                }
            }
            $returnarray['agentdata'] = $looparray;
            $average = $this->getDivision($totalsumlength, $totalusers);
            $totavg_len = $this->sec_convert($average, 'H');
            $totsum_len = $this->sec_convert($totalsumlength, 'H');
            if (isset($list)) {
                $lcount = $list->count();
            } else {
                $lcount = 0;
            }
            $totalarray = array(
                'calls' => $lcount,
                'agentcalls' => $totalusers,
                'avg_len' => $totavg_len,
                'sum_len' => $totsum_len
            );
            $lastarray = array('total' => $totalarray);
            array_push($returnarray, $lastarray);
            return $returnarray;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    /**
     * Get incremental total calls.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param type $startdate
     * @param type $enddate
     * @param type $shift
     * @param type $selectedgroups
     * @param type $did
     * @return type
     */
    public function getIncrementTotalCalls($startdate, $enddate, $shift, $selectedgroups, $did) {
        try {
            $server_gmt_time = \App\Servers::select('local_gmt')->where('active', 'Y')->first();

            $bdswered_calls = 0;
            $dst = date("I");
            if (isset($server_gmt_time)) {
                $count_servicse = $server_gmt_time->count();
                if ($count_servicse > 0) {
                    $local_gmt = $server_gmt_time->local_gmt;
                    $epoch_offset = (($local_gmt + $dst) * 3600);
                }
            } else {
                $local_gmt = 0;
                $epoch_offset = 0;
            }

            $answerd_breakdown_seconds = VicidialCloserLog::select('status', 'queue_seconds', 'call_date')
                    ->where([['vicidial_closer_log.call_date', '<=', $enddate], ['vicidial_closer_log.call_date', '>=', $startdate]])
                    ->whereIn('campaign_id', $selectedgroups)
                    ->get();

            if ($did == "Y") {
                $answerd_breakdown_seconds = VicidialCloserLog::select('status', 'queue_seconds', 'call_date')
                        ->where([['vicidial_closer_log.call_date', '<=', $enddate], ['vicidial_closer_log.call_date', '>=', $startdate]])
                        ->whereIn('uniqueid', $selectedgroups)
                        ->get();
            }
            $j = 0;
            $f_total = $f_answer = $c_status = $c_queue = $c_epoch = $c_date = $c_rem = $f_drop = array();
            $ad_b_0 = $ad_b_5 = $ad_b10 = $ad_b15 = $ad_b20 = $ad_b25 = $ad_b30 = $ad_b35 = $ad_b40 = $ad_b45 = $ad_b50 = $ad_b55 = $ad_b60 = $ad_b90 = $ad_b99 = array();
            $rowsarray = array();
            if (isset($answerd_breakdown_seconds)) {
                $answerd_breakdown_seconds_count = $answerd_breakdown_seconds->count();
                $answerd_breakdown_seconds = $answerd_breakdown_seconds->toArray();
            } else {
                $answerd_breakdown_seconds_count = 0;
            }
            while ($j < $answerd_breakdown_seconds_count) {
                $c_status[$j] = $answerd_breakdown_seconds[$j]['status'];
                $c_queue[$j] = $answerd_breakdown_seconds[$j]['queue_seconds'];
                $c_epoch[$j] = strtotime($answerd_breakdown_seconds[$j]['call_date']);
                $c_date[$j] = $answerd_breakdown_seconds[$j]['call_date'];
                $c_rem[$j] = (($c_epoch[$j] + $epoch_offset) % 86400);
                $j++;
            }
            $j = 0;
            $max_calls = 1;
            while ($j < $answerd_breakdown_seconds_count) {
                $i = 1;
                $sec = 0;
                $sec_end = 900;
                while ($i <= 96) {
                    if (($c_rem[$j] >= $sec) and ( $c_rem[$j] < $sec_end)) {

                        $f_total = $this->setArrayValue($f_total, $i);
                        if (preg_match('/DROP/', $c_status[$j])) {
                            $f_drop = $this->setArrayValue($f_drop, $i);
                        }
                        if (!preg_match('/DROP|XDROP|HXFER|QVMAIL|HOLDTO|LIVE|QUEUE|TIMEOT|AFTHRS|NANQUE|INBND|MAXCAL/', $c_status[$j])) {
                            $bdswered_calls++;
                            $f_answer = $this->setArrayValue($f_answer, $i);
                            if ($c_queue[$j] == 0) {
                                $ad_b_0 = $this->setArrayValue($ad_b_0, $i);
                            }
                            if (($c_queue[$j] > 0) and ( $c_queue[$j] <= 5)) {
                                $ad_b_5 = $this->setArrayValue($ad_b_5, $i);
                            }
                            if (($c_queue[$j] > 5) and ( $c_queue[$j] <= 10)) {
                                $ad_b10 = $this->setArrayValue($ad_b10, $i);
                            }
                            if (($c_queue[$j] > 10) and ( $c_queue[$j] <= 15)) {
                                $ad_b15 = $this->setArrayValue($ad_b15, $i);
                            }
                            if (($c_queue[$j] > 15) and ( $c_queue[$j] <= 20)) {
                                $ad_b20 = $this->setArrayValue($ad_b20, $i);
                            }
                            if (($c_queue[$j] > 20) and ( $c_queue[$j] <= 25)) {
                                $ad_b25 = $this->setArrayValue($ad_b25, $i);
                            }
                            if (($c_queue[$j] > 25) and ( $c_queue[$j] <= 30)) {
                                $ad_b30 = $this->setArrayValue($ad_b30, $i);
                            }
                            if (($c_queue[$j] > 30) and ( $c_queue[$j] <= 35)) {
                                $ad_b35 = $this->setArrayValue($ad_b35, $i);
                            }
                            if (($c_queue[$j] > 35) and ( $c_queue[$j] <= 40)) {
                                $ad_b40 = $this->setArrayValue($ad_b40, $i);
                            }
                            if (($c_queue[$j] > 40) and ( $c_queue[$j] <= 45)) {
                                $ad_b45 = $this->setArrayValue($ad_b45, $i);
                            }
                            if (($c_queue[$j] > 45) and ( $c_queue[$j] <= 50)) {
                                $ad_b50 = $this->setArrayValue($ad_b50, $i);
                            }
                            if (($c_queue[$j] > 50) and ( $c_queue[$j] <= 55)) {
                                $ad_b55 = $this->setArrayValue($ad_b55, $i);
                            }
                            if (($c_queue[$j] > 55) and ( $c_queue[$j] <= 60)) {
                                $ad_b60 = $this->setArrayValue($ad_b60, $i);
                            }
                            if (($c_queue[$j] > 60) and ( $c_queue[$j] <= 90)) {
                                $ad_b90 = $this->setArrayValue($ad_b90, $i);
                            }
                            if ($c_queue[$j] > 90) {
                                $ad_b99 = $this->setArrayValue($ad_b99, $i);
                            }
                        }
                    }
                    $sec = ($sec + 900);
                    $sec_end = ($sec_end + 900);
                    $i++;
                }
                $j++;
            }

            $hour_count = $drop_count = array();
            $hi_hour_count = 0;
            $last_full_record = 0;
            $i = 0;
            $h = 0;
            while ($i <= 96) {
                if (!isset($f_total[$i])) {
                    $f_total[$i] = 0;
                }
                if (!isset($f_drop[$i])) {
                    $f_drop[$i] = 0;
                }
                $hour_count = $this->setArrayGivenValue($hour_count, $i, $f_total[$i]);
                if ($hour_count[$i] > $hi_hour_count) {
                    $hi_hour_count = $hour_count[$i];
                }
                if ($hour_count[$i] > 0) {
                    $last_full_record = $i;
                }
                $drop_count = $this->setArrayGivenValue($drop_count, $i, $f_drop[$i]);
                $i++;
            }
            if ($hi_hour_count < 1) {
                $hour_multiplier = 0;
            } else {
                $hour_multiplier = (100 / $hi_hour_count);
                #$hour_multiplier = round($hour_multiplier, 0);
            }
            $k = 1;
            $mk = 0;
            $call_scale = '0';
            $y_hour_count = 0;
            $toparray = array();
            $no_lines_yet = 0;
            while ($k <= 102) {
                if ($mk >= 5) {
                    $mk = 0;
                    if (($k < 1) or ( $hour_multiplier <= 0)) {
                        $scale_num = 100;
                    } else {
                        $scale_num = ($k / $hour_multiplier);
                        $scale_num = round($scale_num, 0);
                    }
                    $len_ENscale_num = (strlen($scale_num));
                    $k = ($k + $len_ENscale_num);
                    array_push($toparray, $scale_num);
                    $call_scale .= $scale_num;
                } else {
                    $call_scale .= " ";
                    //array_push($toparray,"&nbsp;");
                    $k++;
                    $mk++;
                }
            }
            if (isset($hour_count[$i])) {
                $hour_count[$i] = $hour_count[$i];
            } else {
                $hour_count[$i] = 0;
            }
            $g_hour_count = $hour_count[$i];
            if ($g_hour_count < 1) {
                if (($no_lines_yet) or ( $i > $last_full_record)) {
                    $do_nothing = 1;
                } else {
                    $hour_count[$i] = sprintf("%-5s", $hour_count[$i]);
                    //$ascii_text.="|$time|";
                    //$CSV_text9.="\"$time\",";
                    $k = 0;
                    while ($k <= 102) {
                        echo $k;
                        echo "fsf";
                        $k++;
                    }
                    $ascii_text .= "| $hour_count[$i] |\n";
                    $CSV_text9 .= "\"0\",\"0\"\n";
                }
            } else {
                $no_lines_yet = 0;
                $x_hour_count = ($g_hour_count * $hour_multiplier);
                $y_hour_count = (99 - $x_hour_count);

                $g_drop_count = $drop_count[$i];
                if ($g_drop_count < 1) {
                    $hour_count[$i] = sprintf("%-5s", $hour_count[$i]);

                    //$ascii_text.="|$time|<SPAN class=\"green\">";
                    //$CSV_text9.="\"$time\",";
                    $k = 0;
                    while ($k <= $x_hour_count) {
                        $ascii_text .= "*";
                        echo $k;
                        echo "fsf";
                        $k++;
                        $char_counter++;
                    }
                    //$ascii_text.="*X</SPAN>";   $char_counter++;
                    $k = 0;
                    while ($k <= $y_hour_count) {
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
                    //$ascii_text.="| 0     | $hour_count[$i] |\n";
                    //$CSV_text9.="\"0\",\"$hour_count[$i]\"\n";
                } else {
                    $Xdrop_count = ($g_drop_count * $hour_multiplier);

                    #   if ($Xdrop_count >= $x_hour_count) {$Xdrop_count = ($Xdrop_count - 1);}

                    $XXhour_count = (($x_hour_count - $Xdrop_count) - 1);

                    $hour_count[$i] += 0;
                    $drop_count[$i] += 0;

                    $hour_count[$i] = sprintf("%-5s", $hour_count[$i]);
                    $drop_count[$i] = sprintf("%-5s", $drop_count[$i]);

                    //ascii_text.="|$time|<SPAN class=\"red\">";
                    //$CSV_text9.="\"$time\",\"\"";
                    $k = 0;
                    while ($k <= $Xdrop_count) {
                        $ascii_text .= ">";
                        echo $k;
                        $k++;
                        $char_counter++;
                    }
                    $ascii_text .= "D</SPAN><SPAN class=\"green\">";
                    $char_counter++;
                    $k = 0;
                    while ($k <= $XXhour_count) {
                        $ascii_text .= "*";
                        echo $k;
                        $k++;
                        $char_counter++;
                    }
                    $ascii_text .= "X</SPAN>";
                    $char_counter++;
                    $k = 0;
                    while ($k <= $y_hour_count) {
                        $ascii_text .= " ";
                        echo $k;
                        $k++;
                        $char_counter++;
                    }
                    while ($char_counter <= 102) {
                        $ascii_text .= " ";
                        $char_counter++;
                    }
                    //$ascii_text.="| $drop_count[$i] | $hour_count[$i] |\n";
                    //$CSV_text9.="\"$drop_count[$i]\",\"$hour_count[$i]\"\n";\
                    echo "Yhour_count";
                    echo $y_hour_count;

                    //return array("DS"=>"fds");
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

            return array(
                "Yhour_count" => $y_hour_count,
                "toparray" => $toparray,
                "ftotal" => $f_total,
                "fdrop" => $f_drop
            );
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    public function setArrayValue($array, $offset) {
        if (isset($array[$offset])) {
            $array[$offset]++;
        } else {
            $array[$offset] = 1;
        }

        return $array;
    }
        
    public function setArrayGivenValue($array, $offset, $value) {
        try {
            if (isset($array[$offset])) {
                $array[$offset] = $value;
            } else {

                $array[$offset] = 1;
                $array[$offset] = $value;
            }

            return $array;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    /**
     * Get the breakdown details .
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param type $selectedgroups
     * @param type $startdate
     * @param type $enddate
     * @param type $shift
     * @param type $did
     * @return type
     */
    public function getAnsBreakdowndetails($selectedgroups, $startdate, $enddate, $shift, $did) {
        try {
            $server_gmt_time = \App\Servers::select('local_gmt')->where('active', 'Y')->first();

            $answerd_breakdown_seconds = VicidialCloserLog::select('status', 'queue_seconds', 'call_date')
                    ->where([['vicidial_closer_log.call_date', '<=', $enddate], ['vicidial_closer_log.call_date', '>=', $startdate]])
                    ->whereIn('campaign_id', $selectedgroups)
                    ->get();

            if ($did == "Y") {
                $answerd_breakdown_seconds = VicidialCloserLog::select('status', 'queue_seconds', 'call_date')
                        ->where([['vicidial_closer_log.call_date', '<=', $enddate], ['vicidial_closer_log.call_date', '>=', $startdate]])
                        ->whereIn('uniqueid', $selectedgroups)
                        ->get();
            }

            $dst = date("I");
            if (isset($server_gmt_time)) {
                $count_servicse = $server_gmt_time->count();
                if ($count_servicse > 0) {
                    $local_gmt = $server_gmt_time->local_gmt;
                    $epoch_offset = (($local_gmt + $dst) * 3600);
                }
            } else {
                $local_gmt = 0;
                $epoch_offset = 0;
            }


            $answerd_breakdown_seconds = VicidialCloserLog::select('status', 'queue_seconds', 'call_date')
                    ->where([['vicidial_closer_log.call_date', '<=', $enddate], ['vicidial_closer_log.call_date', '>=', $startdate]])
                    ->whereIn('campaign_id', $selectedgroups)
                    ->get();

            if ($did == "Y") {
                $answerd_breakdown_seconds = VicidialCloserLog::select('status', 'queue_seconds', 'call_date')
                        ->where([['vicidial_closer_log.call_date', '<=', $enddate], ['vicidial_closer_log.call_date', '>=', $startdate]])
                        ->whereIn('uniqueid', $selectedgroups)
                        ->get();
            }
            $j = 0;
            $ad_b0 = $ad_b5 = $ad_b10 = $ad_b15 = $ad_b20 = $ad_b25 = $ad_b30 = $ad_b35 = $ad_b40 = $ad_b45 = $ad_b50 = $ad_b55 = $ad_b60 = $ad_b90 = $ad_b99 = $f_drop = $f_total = $f_answer = $c_status = $c_queue = $c_epoch = $c_date = $c_rem = array();
            $bdswered_calls = 0;
            if (isset($answerd_breakdown_seconds)) {
                $answerd_breakdown_seconds_count = $answerd_breakdown_seconds->count();
                $answerd_breakdown_seconds = $answerd_breakdown_seconds->toArray();
            } else {
                $answerd_breakdown_seconds_count = 0;
            }
            while ($j < $answerd_breakdown_seconds_count) {

                $c_status[$j] = $answerd_breakdown_seconds[$j]['status'];
                $c_queue[$j] = $answerd_breakdown_seconds[$j]['queue_seconds'];
                $c_epoch[$j] = strtotime($answerd_breakdown_seconds[$j]['call_date']);
                $c_date[$j] = $answerd_breakdown_seconds[$j]['call_date'];
                $c_rem[$j] = (($c_epoch[$j] + $epoch_offset) % 86400);
                $j++;
            }
            ### Loop through all call records and gather stats for total call/drop report and answered report
            $j = 0;
            while ($j < $answerd_breakdown_seconds_count) {
                $i = 0;
                $sec = 0;
                $sec_end = 900;
                while ($i <= 96) {
                    if (($c_rem[$j] >= $sec) and ( $c_rem[$j] < $sec_end)) {
                        $f_total[$i] = isset($f_total[$i]) ? $f_total[$i]+1 : 1;
                        if (preg_match('/DROP/', $c_status[$j])) {
                            $f_drop[$i] = isset($f_drop[$i]) ? $f_drop[$i]+1 : 1;
                        }
                        if (!preg_match('/DROP|XDROP|HXFER|QVMAIL|HOLDTO|LIVE|QUEUE|TIMEOT|AFTHRS|NANQUE|INBND|MAXCAL/', $c_status[$j])) {
                            $bdswered_calls++;
                            $f_answer[$i] = isset($f_answer[$i]) ? $f_answer[$i]+1 : 1;
                            if ($c_queue[$j] == 0) {
                                $ad_b_0 = $this->setArrayValue($ad_b0, $i);
                            }
                            if (($c_queue[$j] > 0) and ( $c_queue[$j] <= 5)) {
                                $ad_b_5 = $this->setArrayValue($ad_b5, $i);
                            }
                            if (($c_queue[$j] > 5) and ( $c_queue[$j] <= 10)) {
                                $ad_b10 = $this->setArrayValue($ad_b10, $i);
                            }
                            if (($c_queue[$j] > 10) and ( $c_queue[$j] <= 15)) {
                                $ad_b15 = $this->setArrayValue($ad_b15, $i);
                            }
                            if (($c_queue[$j] > 15) and ( $c_queue[$j] <= 20)) {
                                $ad_b20 = $this->setArrayValue($ad_b20, $i);
                            }
                            if (($c_queue[$j] > 20) and ( $c_queue[$j] <= 25)) {
                                $ad_b25 = $this->setArrayValue($ad_b25, $i);
                            }
                            if (($c_queue[$j] > 25) and ( $c_queue[$j] <= 30)) {
                                $ad_b30 = $this->setArrayValue($ad_b30, $i);
                            }
                            if (($c_queue[$j] > 30) and ( $c_queue[$j] <= 35)) {
                                $ad_b35 = $this->setArrayValue($ad_b35, $i);
                            }
                            if (($c_queue[$j] > 35) and ( $c_queue[$j] <= 40)) {
                                $ad_b40 = $this->setArrayValue($ad_b40, $i);
                            }
                            if (($c_queue[$j] > 40) and ( $c_queue[$j] <= 45)) {
                                $ad_b45 = $this->setArrayValue($ad_b45, $i);
                            }
                            if (($c_queue[$j] > 45) and ( $c_queue[$j] <= 50)) {
                                $ad_b50 = $this->setArrayValue($ad_b50, $i);
                            }
                            if (($c_queue[$j] > 50) and ( $c_queue[$j] <= 55)) {
                                $ad_b55 = $this->setArrayValue($ad_b55, $i);
                            }
                            if (($c_queue[$j] > 55) and ( $c_queue[$j] <= 60)) {
                                $ad_b60 = $this->setArrayValue($ad_b60, $i);
                            }
                            if (($c_queue[$j] > 60) and ( $c_queue[$j] <= 90)) {
                                $ad_b90 = $this->setArrayValue($ad_b90, $i);
                            }
                            if ($c_queue[$j] > 90) {
                                $ad_b99 = $this->setArrayValue($ad_b99, $i);
                            }
                        }
                    }
                    $sec = ($sec + 900);
                    $sec_end = ($sec_end + 900);
                    $i++;
                }
                $j++;
            }   ##### END going through all records

            $timearray = array();
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

            $commonarray15min = array(
                "adb0" => $ad_b0,
                "adb5" => $ad_b5,
                "adb10" => $ad_b10,
                "adb15" => $ad_b15,
                "adb20" => $ad_b20,
                "adb25" => $ad_b25,
                "adb30" => $ad_b30,
                "adb35" => $ad_b35,
                "adb40" => $ad_b40,
                "adb45" => $ad_b45,
                "adb50" => $ad_b50,
                "adb55" => $ad_b55,
                "adb60" => $ad_b60,
                "adb90" => $ad_b90,
                "adb99" => $ad_b99,
                "Fanswer" => $f_answer,
                "timearray" => $timearray
            );

            return $commonarray15min;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    function MathZDC($dividend, $divisor, $quotient = 0) {
        try {
            if ($divisor == 0) {
                return $quotient;
            } else {
                if ($dividend == 0) {
                    return 0;
                } else {
                    return ($dividend / $divisor);
                }
            }
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    /**
     * Download csv file for MULTI-GROUP BREAKDOWN
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param Request $request
     * @return type
     * @throws ForbiddenException
     */
    public function download(Request $request) {
        try {
            $user = $request->user();
            $format = $request->input('format');
            if ($format !== 'Y') {
                if (!in_array(SYSTEM_COMPONENT_REPORT_INBOUND, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $user))) {
                    throw new ForbiddenException();
                }
            } else {
                if (!in_array(SYSTEM_COMPONENT_REPORT_INBOUND_BY_DID, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $user))) {
                    throw new ForbiddenException();
                }
            }
            $data = $request->input("values_array");
            $campaing = $request->input("campaing");
            $campaing[0]['campaigndroppersent'] = $campaing[0]['campaigndroppersent'] . "%";
            $campaing[0]['campaignAnsweredCalls'] = "";

            $selectedgroup = '';
            $date = '';
            $totalques = '';
            if (!empty($campaing)) {
                $selectedgroup = implode('|', $data['data']['selectedgroups']);
                $date = $data['data']['startdate'] . " " . $data['data']['enddate'];
                $totalques = $data['queue_call_details']['totalqueued'];


                $data_array = array(
                    'inbound' => array(
                        'Inbound Call Stats:',
                        $selectedgroup,
                        $date
                    ),
                    'space1' => array(''),
                    'inbound1' => array('MULTI-GROUP BREAKDOWN:'),
                    'inbound2' => array(
                        'IN-GROUP',
                        'CALLS',
                        'DROPS',
                        'DROP %',
                        'IVR'
                    )
                );
                $i = 0;
                foreach ($campaing AS $key => $value) {
                    $data_array2[$i] = [];
                    foreach ($value AS $k => $v) {
                        $data_array2[$i][] = $v;
                    }
                    $i++;
                }
                $data_array1 = array(
                    'space5' => array(""),
                    'inbound3' => array(
                        'Time range:',
                        $data['data']['startdate'],
                        'to',
                        $data['data']['enddate']
                    ),
                    'inbound4' => array(
                        'Total calls taken in to this In-Group:',
                        $data['total_call_log']['totalcalls']
                    ),
                    'inbound5' => array(
                        'Average Call Length for all Calls:',
                        $data['total_call_log']['AvgAllCall'] . " seconds"
                    ),
                    'inbound6' => array(
                        'Answered Calls:',
                        $data['total_call_log']['totalanswercall'] . "  " . $data['total_call_log']['answer_percentage'] . "%"
                    ),
                    'inbound7' => array(
                        'Average queue time for Answered Calls:',
                        $data['total_call_log']['Averageanswer'] . " seconds"
                    ),
                    'inbound8' => array(
                        'Calls taken into the IVR for this In-Group:',
                        $data['total_call_log']['totalIVR']
                    ),
                    'space2' => array(''),
                    'inbound9' => array('DROPS'),
                    'inbound10' => array(
                        'Total DROP Calls:',
                        $data['all_drop_call_details']['totaldropcalls'] . "  " . $data['all_drop_call_details']['Droppercentage'] . "%",
                        "drop/answered:",
                        $data['indicators']['drop_answered_percent'] . "%"
                    ),
                    'inbound11' => array(
                        'Average hold time for DROP Calls:',
                        $data['all_drop_call_details']['average_hold_time'] . " seconds"
                    ),
                    'space3' => array(''),
                    'inbound12' => array('CUSTOM indicators'),
                    'inbound13' => array(
                        'GDE (Answered/Total calls taken in to this In-Group):',
                        $data['indicators']['answer_percentage'] . "%"
                    ),
                    'inbound14' => array(
                        'ACR (Dropped/Answered):',
                        $data['indicators']['drop_answered_percent'] . "%"
                    ),
                    'inbound15' => array(
                        'TMR1 (Answered within ' . $data['indicators']['answerone'] . ' seconds/Answered):',
                        $data['indicators']['pct_answer_sec_pct_rt_stat_one'] . "%"
                    ),
                    'inbound16' => array(
                        'TMR2 (Answered within ' . $data['indicators']['answertwo'] . ' seconds/Answered):',
                        $data['indicators']['pct_answer_sec_pct_rt_stat_two'] . "%"
                    ),
                    'space4' => array(''),
                    'inbound17' => array('QUEUE STATS'),
                    'inbound18' => array(
                        'Total Calls That entered Queue:',
                        $totalques,
                        $data['queue_call_details']['queueCallPercent'] . "%"
                    ),
                    'inbound19' => array(
                        'Average QUEUE Length for queue calls:',
                        $data['queue_call_details']['avgsecondforqueued'] . " Seconds"
                    ),
                    'inbound20' => array(
                        'Average QUEUE Length across all calls:',
                        $data['queue_call_details']['avgsecondforall'] . " " . "seconds"
                    ),
                );
            } else {
                $data_array = array(
                    'inbound' => array('Inbound Call Stats:'),
                    'space1' => array(''),
                    'inbound1' => array('MULTI-GROUP BREAKDOWN:'),
                    'inbound2' => array(
                        'IN-GROUP',
                        'CALLS',
                        'DROPS',
                        'DROP %',
                        'IVR'
                    )
                );
                $data_array1 = array(
                    'space5' => array(""),
                    'inbound3' => array('Time range:'),
                    'inbound4' => array('Total calls taken in to this In-Group:'),
                    'inbound5' => array('Average Call Length for all Calls:'),
                    'inbound6' => array('Answered Calls:'),
                    'inbound7' => array('Average queue time for Answered Calls:'),
                    'inbound8' => array('Calls taken into the IVR for this In-Group:'),
                    'space2' => array(''),
                    'inbound9' => array('DROPS'),
                    'inbound10' => array('Total DROP Calls:'),
                    'inbound11' => array('Average hold time for DROP Calls:',),
                    'space3' => array(''),
                    'inbound12' => array('CUSTOM indicators'),
                    'inbound13' => array('GDE (Answered/Total calls taken in to this In-Group):'),
                    'inbound14' => array('ACR (Dropped/Answered):'),
                    'inbound15' => array('TMR1 (Answered within'),
                    'inbound16' => array('TMR2 (Answered within .'),
                    'space4' => array(''),
                    'inbound17' => array('QUEUE STATS'),
                    'inbound18' => array('Total Calls That entered Queue:'),
                    'inbound19' => array('Average QUEUE Length for queue calls:'),
                    'inbound20' => array('Average QUEUE Length across all calls:'),
                );


                $campaing = array();
            }
            $_serialize = array(
                'data_array',
                'data_array2',
                'campaing',
                'data_array1'
            );
            $startdate = $request->input('startdate');
            $enddate = $request->input('enddate');
            $file_time = "$startdate _To_ $enddate";

            if ($format == 'Y') {
                $filename = "Inbound_Report_By_Did_From_$file_time.csv";
            } else {
                $filename = "Inbound_Report_From_$file_time.csv";
            }

            $handle = fopen($filename, 'w+');
            foreach ($data_array as $key => $rows) {
                fputcsv($handle, $rows, ";", '"');
            }
            foreach ($data_array2 as $key => $rows) {
                fputcsv($handle, $rows, ";", '"');
            }
            foreach ($data_array1 as $key => $rows) {
                fputcsv($handle, $rows, ";", '"');
            }
            fclose($handle);

            $headers = array(
                'Content-Type' => 'text/csv',
            );
            return Response::download($filename, 'file ' . date("d-m-Y H:i") . '.csv', $headers)->deleteFileAfterSend(true);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    /**
     * CALL  HANGUP REASON STATS.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param Request $request
     * @return type
     * @throws ForbiddenException
     */
    public function downloadHangUp(Request $request) {
        try {
            $user = $request->user();
            $format = $request->input('format');
            if ($format !== 'Y') {
                if (!in_array(SYSTEM_COMPONENT_REPORT_INBOUND, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $user))) {
                    throw new ForbiddenException();
                }
            } else {
                if (!in_array(SYSTEM_COMPONENT_REPORT_INBOUND_BY_DID, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $user))) {
                    throw new ForbiddenException();
                }
            }

            $hangup = $request->input("hangup");

            $array_keys = array_keys($hangup);
            $array_values = array_values($hangup);
            $newarray = $this->array_interlace($array_keys, $array_values);
            $count = count($newarray);
            $chunk_array = array_chunk($newarray, 2);
            $data = array(
                '7' => array('CALL  HANGUP REASON STATS'),
                '8' => array(
                    'HANGUP REASON',
                    'CALLS'
                )
            );
            $data1 = $chunk_array;
            $_serialize = array(
                'data',
                'data1'
            );
            $startdate = $request->input('startdate');
            $enddate = $request->input('enddate');
            $file_time = "$startdate _To_ $enddate";
            if ($format == 'Y') {
                $filename = "Inbound_Report_By_Did_From_$file_time.csv";
            } else {
                $filename = "Inbound_Report_From_$file_time.csv";
            }

            $handle = fopen($filename, 'w+');

            foreach ($data as $key => $rows) {
                fputcsv($handle, $rows, ";", '"');
            }
            foreach ($data1 as $key => $rows) {
                fputcsv($handle, $rows, ";", '"');
            }

            fclose($handle);

            $headers = array(
                'Content-Type' => 'text/csv',
            );
            return Response::download($filename, 'file ' . date("d-m-Y H:i") . '.csv', $headers)->deleteFileAfterSend(true);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    function array_interlace() {
        try {
            $args = func_get_args();
            $total = count($args);

            if ($total < 2) {
                return false;
            }

            $i = 0;
            $j = 0;
            $arr = array();

            foreach ($args as $arg) {
                foreach ($arg as $v) {
                    $arr[$j] = $v;
                    $j += $total;
                }

                $i++;
                $j = $i;
            }

            ksort($arr);

            return array_values($arr);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    /**
     * CUSTOM STATUS stats
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param Request $request
     * @return type
     * @throws ForbiddenException
     */
    public function downloadCallStatusStats(Request $request) {
        try {
            $user = $request->user();
            $format = $request->input('format');
            if ($format !== 'Y') {
                if (!in_array(SYSTEM_COMPONENT_REPORT_INBOUND, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $user))) {
                    throw new ForbiddenException();
                }
            } else {
                if (!in_array(SYSTEM_COMPONENT_REPORT_INBOUND_BY_DID, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $user))) {
                    throw new ForbiddenException();
                }
            }

            $statu_stats = $request->input("statu_stats");
            $total_array = $statu_stats[0]['total'];
            //debug($total_array);die;
            $data = array(
                '7' => array('CALL STATUS STATS'),
                '8' => array(
                    'STATUS',
                    'DESCRIPTION',
                    'CATEGORY',
                    'CALLS',
                    'TOTAL TIME',
                    'AVG TIME',
                    'CALL /HOUR'
                )
            );
            $data1 = $statu_stats['statsdata'];
            $data2 = array(
                'total' => array(
                    'Total',
                    '',
                    '',
                    $total_array['calls'],
                    $total_array['totTime'],
                    $total_array['avg_sec'],
                    $total_array['callperhour']
                )
            );
            $_serialize = array(
                'data',
                'data1',
                'data2'
            );
            $startdate = $request->input('startdate');
            $enddate = $request->input('enddate');
            $file_time = "$startdate _To_ $enddate";
            if ($format == 'Y') {
                $filename = "Inbound_Report_By_Did_From_$file_time.csv";
            } else {
                $filename = "Inbound_Report_From_$file_time.csv";
            }

            $handle = fopen($filename, 'w+');

            foreach ($data as $key => $rows) {
                fputcsv($handle, $rows, ";", '"');
            }
            foreach ($data1 as $key => $rows) {
                fputcsv($handle, $rows, ";", '"');
            }
            foreach ($data2 as $key => $rows) {
                fputcsv($handle, $rows, ";", '"');
            }

            fclose($handle);

            $headers = array(
                'Content-Type' => 'text/csv',
            );
            return Response::download($filename, 'file ' . date("d-m-Y H:i") . '.csv', $headers)->deleteFileAfterSend(true);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    /**
     * CUSTOM STATUS CATEGORY STATS
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param Request $request
     * @return type
     * @throws ForbiddenException
     */
    public function downloadCategoryStats(Request $request) {
        try {
            $user = $request->user();
            $format = $request->input('format');
            if ($format !== 'Y') {
                if (!in_array(SYSTEM_COMPONENT_REPORT_INBOUND, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $user))) {
                    throw new ForbiddenException();
                }
            } else {
                if (!in_array(SYSTEM_COMPONENT_REPORT_INBOUND_BY_DID, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $user))) {
                    throw new ForbiddenException();
                }
            }
            $category_status = $request->input("category_status");
            $category = array();
            for ($i = 0; $i < count($category_status); $i++) {
                $category[$i] = $category_status[$i];
            }

            $data = array(
                '7' => array('CUSTOM STATUS CATEGORY STATS'),
                '8' => array(
                    'CATEGORY',
                    'DESCRIPTION',
                    'CALLS'
                )
            );
            $data1 = $category;
            $_serialize = array(
                'data',
                'data1'
            );
            $startdate = $request->input('startdate');
            $enddate = $request->input('enddate');
            $file_time = "$startdate _To_ $enddate";
            if ($format == 'Y') {
                $filename = "Inbound_Report_By_Did_From_$file_time.csv";
            } else {
                $filename = "Inbound_Report_From_$file_time.csv";
            }
            $handle = fopen($filename, 'w+');

            foreach ($data as $key => $rows) {
                fputcsv($handle, $rows, ";", '"');
            }
            foreach ($data1 as $key => $rows) {
                fputcsv($handle, $rows, ";", '"');
            }
            fclose($handle);
            $headers = array(
                'Content-Type' => 'text/csv',
            );
            return Response::download($filename, 'file ' . date("d-m-Y H:i") . '.csv', $headers)->deleteFileAfterSend(true);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    /**
     * call intial status
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param Request $request
     * @return type
     * @throws ForbiddenException
     */
    public function downloadInitialStatus(Request $request) {
        try {
            $user = $request->user();
            $format = $request->input('format');
            if ($format !== 'Y') {
                if (!in_array(SYSTEM_COMPONENT_REPORT_INBOUND, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $user))) {
                    throw new ForbiddenException();
                }
            } else {
                if (!in_array(SYSTEM_COMPONENT_REPORT_INBOUND_BY_DID, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $user))) {
                    throw new ForbiddenException();
                }
            }
            $initialBreak = $request->input("initial_break_down");
            foreach ($initialBreak as $key => $value) {
                if ($value == 0) {
                    $new_array[] = '';
                } else {

                    $new_array[] = $value;
                }
            }

            $data = array(
                '7' => array('CALL  INITIAL QUEUE POSITION BREAKDOWN'),
                '8' => array(
                    '',
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
                    '25',
                    'TOTAL'
                )
            );
            $data1 = array(
                $new_array
            );
            $_serialize = array(
                'data',
                'data1'
            );
            $startdate = $request->input('startdate');
            $enddate = $request->input('enddate');
            $file_time = "$startdate _To_ $enddate";
            if ($format == 'Y') {
                $filename = "Inbound_Report_By_Did_From_$file_time.csv";
            } else {
                $filename = "Inbound_Report_From_$file_time.csv";
            }
            $handle = fopen($filename, 'w+');

            foreach ($data as $key => $rows) {
                fputcsv($handle, $rows, ";", '"');
            }
            foreach ($data1 as $key => $rows) {
                fputcsv($handle, $rows, ";", '"');
            }
            fclose($handle);
            $headers = array(
                'Content-Type' => 'text/csv',
            );
            return Response::download($filename, 'file ' . date("d-m-Y H:i") . '.csv', $headers)->deleteFileAfterSend(true);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    /**
     * Agent stats csv download.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param Request $request
     * @return type
     * @throws ForbiddenException
     */
    public function downloadAgentStats(Request $request) {
        try {
            $user = $request->user();
            $format = $request->input('format');
            if ($format !== 'Y') {
                if (!in_array(SYSTEM_COMPONENT_REPORT_INBOUND, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $user))) {
                    throw new ForbiddenException();
                }
            } else {
                if (!in_array(SYSTEM_COMPONENT_REPORT_INBOUND_BY_DID, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $user))) {
                    throw new ForbiddenException();
                }
            }

            $agent_stat_detail = $request->input("agent_stat_detail");
            $agentdata = $agent_stat_detail['agentdata'];
            $total_array = $agent_stat_detail[0]['total'];
            $data = array(
                '7' => array('AGENT STATS'),
                '8' => array(
                    'AGENT',
                    'CALLS',
                    'AVERAGE',
                    'TIME H:M:S'
                )
            );
            $data1 = $agent_stat_detail['agentdata'];
            $data2 = array(
                'total' => array(
                    'Total' . " " . $total_array['calls'],
                    $total_array['agentcalls'],
                    $total_array['avg_len'],
                    $total_array['sum_len']
                )
            );
            $_serialize = array(
                'data',
                'data1',
                'data2'
            );
            $startdate = $request->input('startdate');
            $enddate = $request->input('enddate');
            $file_time = "$startdate _To_ $enddate";
            if ($format == 'Y') {
                $filename = "Inbound_Report_By_Did_From_$file_time.csv";
            } else {
                $filename = "Inbound_Report_From_$file_time.csv";
            }
            $handle = fopen($filename, 'w+');

            foreach ($data as $key => $rows) {
                fputcsv($handle, $rows, ";", '"');
            }
            foreach ($data1 as $key => $rows) {
                fputcsv($handle, $rows, ";", '"');
            }
            foreach ($data2 as $key => $rows) {
                fputcsv($handle, $rows, ";", '"');
            }
            fclose($handle);
            $headers = array(
                'Content-Type' => 'text/csv',
            );
            return Response::download($filename, 'file ' . date("d-m-Y H:i") . '.csv', $headers)->deleteFileAfterSend(true);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    /**
     * Final Table download CSV file.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param Request $request
     * @return type
     * @throws ForbiddenException
     */
    public function downloadFinalCsv(Request $request) {
        try {
            $user = $request->user();
            $format = $request->input('format');
            if ($format !== 'Y') {
                if (!in_array(SYSTEM_COMPONENT_REPORT_INBOUND, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $user))) {
                    throw new ForbiddenException();
                }
            } else {
                if (!in_array(SYSTEM_COMPONENT_REPORT_INBOUND_BY_DID, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ, $user))) {
                    throw new ForbiddenException();
                }
            }
            $data = array(
                '1' => array('CALL ANSWERED TIME BREAKDOWN IN SECONDS'),
                '2' => array(
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
                    '+90',
                    'Total'
                )
            );

            $call_ans_time_break_down = $request->input("call_ans_time_break_down");
            $_serialize = null;
            $startdate = $request->input('startdate');
            $enddate = $request->input('enddate');
            $file_time = "$startdate _To_ $enddate";
            if ($format == 'Y') {
                $filename = "Inbound_Report_By_Did_From_$file_time.csv";
            } else {
                $filename = "Inbound_Report_From_$file_time.csv";
            }
            $handle = fopen($filename, 'w+');

            foreach ($data as $key => $rows) {
                fputcsv($handle, $rows, ";", '"');
            }
            foreach ($call_ans_time_break_down as $key => $rows) {
                if ($rows == 'time') {
                    fputcsv($handle, $rows, ";", '"');
                }
                if ($rows != 'time') {
                    fputcsv($handle, $rows, ";", '"');
                }
            }
            fclose($handle);
            $headers = array(
                'Content-Type' => 'text/csv',
            );
            return Response::download($filename, 'file ' . date("d-m-Y H:i") . '.csv', $headers)->deleteFileAfterSend(true);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    /**
     * Inbound Service Level Report.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param Request $request
     * @return type
     * @throws \App\Http\Controllers\Report\Exception
     */
    public function inboundServiceLevelReport(Request $request) {
        try {
//            date_default_timezone_set('America/Los_Angeles');
            $selectedgroups = $request->input('selectedgroups');

            $shift = $request->input('shift');
            $startdate = $request->input('startdate');
            $enddate = $request->input('enddate');
            $group = $request->input('selectedgroups');

            $time_array = $this->setTimeBegin($shift, $startdate, $enddate);
            $list = VicidialCloserLog::select(DB::raw('queue_seconds,unix_timestamp(call_date) as call_date,length_in_sec,status'))
                            ->where([['campaign_id', $group], ['call_date', '<=', $time_array['query_date_end']], ['call_date', '>=', $time_array['query_date_begin']]])->get();
            if (isset($list)) {
                $list_array = $list->toArray();
            }
            $rslt = $this->getFormattedDataArray($list_array);

            $records_to_grab = count($rslt);
            $i = 0;
//            $time_array['sq_epoch_day'] = 1533121200;
            while ($i < $records_to_grab) {
                $row = $rslt[$i];
                $qs[$i] = $row[0];
                $dt[$i] = 0;
                $ut[$i] = ($row[1] - $time_array['sq_epoch_day']);
                while ($ut[$i] >= 86400) {
                    $ut[$i] = ($ut[$i] - 86400);
                    $dt[$i] ++;
                }
                if (($ut[$i] <= $time_array['eq_sec']) and ( $time_array['eq_sec'] < $time_array['sq_sec'])) {
                    $dt[$i] = ($dt[$i] - 1);
                }
                $ls[$i] = $row[2];
                $st[$i] = $row[3];
                $i++;
            }
            
            $mt[0] = '0';
            $tot_calls = 0;
            $tot_drops = 0;
            $tot_queue = 0;
            $tot_calls_sec = 0;
            $tot_drops_sec = 0;
            $tot_queue_sec = 0;
            $tot_calls_max = 0;
            $tot_drops_max = 0;
            $tot_queue_max = 0;
            $qrt_calls = $mt;
            $qrt_drops = $mt;
            $qrt_queue = $mt;
            $qrt_calls_sec = $mt;
            $qrt_drops_sec = $mt;
            $qrt_queue_sec = $mt;
            $qrt_calls_avg = $mt;
            $qrt_drops_avg = $mt;
            $qrt_queue_avg = $mt;
            $qrt_calls_max = $mt;
            $qrt_drops_max = $mt;
            $qrt_queue_max = $mt;

            $j = 0;
            while ($j < $time_array['tot_intervals']) {
                $jd__0[$j] = 0;
                $jd_20[$j] = 0;
                $jd_40[$j] = 0;
                $jd_60[$j] = 0;
                $jd_80[$j] = 0;
                $jd100[$j] = 0;
                $jd120[$j] = 0;
                $jd121[$j] = 0;
                $phd__0[$j] = 0;
                $phd_20[$j] = 0;
                $phd_40[$j] = 0;
                $phd_60[$j] = 0;
                $phd_80[$j] = 0;
                $phd100[$j] = 0;
                $phd120[$j] = 0;
                $phd121[$j] = 0;
                $qrt_calls[$j] = 0;
                $qrt_calls_sec[$j] = 0;
                $qrt_calls_max[$j] = 0;
                $qrt_drops[$j] = 0;
                $qrt_drops_sec[$j] = 0;
                $qrt_drops_max[$j] = 0;
                $qrt_queue[$j] = 0;
                $qrt_queue_sec[$j] = 0;
                $qrt_queue_max[$j] = 0;
                $dtt = 0;
                $hd__0[$j] = 0;
                $hd_20[$j] = 0;
                $hd_40[$j] = 0;
                $hd_60[$j] = 0;
                $hd_80[$j] = 0;
                $hd100[$j] = 0;
                $hd120[$j] = 0;
                $hd121[$j] = 0;
                $i = 0;
                while ($i < $records_to_grab) {

                    if (($ut[$i] >= $time_array['hms_epoch'][$j]) and ( $ut[$i] <= $time_array['hme_epoch'][$j])) {
                        $tot_calls++;
                        $tot_calls_sec = ($tot_calls_sec + $ls[$i]);
                        $dtt = $dt[$i];
                        $tot_calls_sec_date[$dtt] = (isset($tot_calls_sec_date[$dtt]) ? $tot_calls_sec_date[$dtt] : 0)  + (isset($ls[$i]) ?$ls[$i] : 0);
                        $qrt_calls[$j] = isset($qrt_calls[$j]) ? $qrt_calls[$j]+1 : 1;
                        $qrt_calls_sec[$j] = ($qrt_calls_sec[$j] + $ls[$i]);
                        $tot_calls_date[$dtt] = ((isset($tot_calls_date[$dtt]) ? $tot_calls_date[$dtt] : 0 ) + 1);

                        if ($tot_calls_max < $ls[$i]) {
                            $tot_calls_max = $ls[$i];
                        }
                        if ($qrt_calls_max[$j] < $ls[$i]) {
                            $qrt_calls_max[$j] = $ls[$i];
                        }
                        if ($tot_calls_max < $ls[$i]) {
                            $tot_calls_max = $ls[$i];
                        }
                        if ($qrt_calls_max[$j] < $ls[$i]) {
                            $qrt_calls_max[$j] = $ls[$i];
                        }

                        if (preg_match('/DROP/', $st[$i])) {
                            $tot_drops++;
                            $tot_drops_sec = ($tot_drops_sec + $ls[$i]);
                            $tot_drops_sec_date[$dtt] = ((isset($tot_drops_sec_date[$dtt]) ? $tot_drops_sec_date[$dtt] : 0 ) + $ls[$i]);
                            $qrt_drops[$j] = isset($qrt_drops[$j]) ? $qrt_drops[$j]+1 : 1;
                            $qrt_drops_sec[$j] = ($qrt_drops_sec[$j] + $ls[$i]);
                            $tot_drops_date[$dtt] = (isset($tot_drops_date[$dtt]) ? $tot_drops_date[$dtt] : 0 ) + 1;
                            if ($tot_drops_max < $ls[$i]) {
                                $tot_drops_max = $ls[$i];
                            }
                            if ($qrt_drops_max[$j] < $ls[$i]) {
                                $qrt_drops_max[$j] = $ls[$i];
                            }
                        }

                        if ($qs[$i] > 0) {
                            $tot_queue++;
                            $tot_queue_sec = ($tot_queue_sec + $qs[$i]);
                            $tot_queue_sec_date[$dtt] = ((isset($tot_queue_sec_date[$dtt]) ? $tot_queue_sec_date[$dtt] : 0 ) + $qs[$i]);
                            $qrt_queue[$j] = isset($qrt_queue[$j]) ? $qrt_queue[$j]+1 : 1 ;
                            $qrt_queue_sec[$j] = ($qrt_queue_sec[$j] + $qs[$i]);
                            $tot_queue_date[$dtt] = isset($tot_queue_date[$dtt]) ? $tot_queue_date[$dtt]+1 : 1;
                            if ($tot_queue_max < $qs[$i]) {
                                $tot_queue_max = $qs[$i];
                            }
                            if ($qrt_queue_max[$j] < $qs[$i]) {
                                $qrt_queue_max[$j] = $qs[$i];
                            }
                        }

                        if ($qs[$i] == 0) {
                            $hd__0[$j] ++;
                        }
                        if (($qs[$i] > 0) and ( $qs[$i] <= 20)) {
                            $hd_20[$j] ++;
                        }
                        if (($qs[$i] > 20) and ( $qs[$i] <= 40)) {
                            $hd_40[$j] ++;
                        }
                        if (($qs[$i] > 40) and ( $qs[$i] <= 60)) {
                            $hd_60[$j] ++;
                        }
                        if (($qs[$i] > 60) and ( $qs[$i] <= 80)) {
                            $hd_80[$j] ++;
                        }
                        if (($qs[$i] > 80) and ( $qs[$i] <= 100)) {
                            $hd100[$j] ++;
                        }
                        if (($qs[$i] > 100) and ( $qs[$i] <= 120)) {
                            $hd120[$j] ++;
                        }
                        if ($qs[$i] > 120) {
                            $hd121[$j] ++;
                        }
                    }
                    $i++;
                }

                $j++;
            }
            $max_drops = 1;
            $max_droppct = 1;
            $max_avgdrops = 1;
            $max_hold = 1;
            $max_holdpct = 1;
            $max_avgholds = 1;
            $max_avgholdstotal = 1;
            $max_calls = 1;
            $max_totalcalltime = 1;
            $max_avgcalltime = 1;
            $d = 0;
            while ($d < $time_array['duration_day']) {
                if (isset($tot_drops_date[$d]) && ($tot_drops_date[$d] < 1)) {
                    $tot_drops_date[$d] = 0;
                }
                if (isset($tot_queue_date[$d]) && ($tot_queue_date[$d] < 1)) {
                    $tot_queue_date[$d] = 0;
                }
                if (isset($tot_calls_date[$d]) && ($tot_calls_date[$d] < 1)) {
                    $tot_calls_date[$d] = 0;
                }

                if (isset($tot_drops_date[$d]) && ($tot_drops_date[$d] > 0)) {
                    $tot_drops_pct_date[$d] = $this->calculatePercentage($tot_drops_date[$d], $tot_calls_date[$d]);
                } else {
                    $tot_drops_pct_date[$d] = 0;
                }
                $tot_drops_pct_date[$d] = round($tot_drops_pct_date[$d], 2);
                if (isset($tot_queue_date[$d]) && ($tot_queue_date[$d] > 0)) {
                    $tot_queuepct_date[$d] = $this->calculatePercentage($tot_queue_date[$d], $tot_queue_date[$d]);
                } else {
                    $tot_queuepct_date[$d] = 0;
                }
                $tot_queuepct_date[$d] = round($tot_queuepct_date[$d], 2);

                if (isset($tot_drops_sec_date[$d]) && ($tot_drops_sec_date[$d] > 0)) {
                    $tot_drops_avg_date[$d] = $this->getDivision($tot_drops_sec_date[$d], $tot_drops_date[$d]);
                } else {
                    $tot_drops_avg_date[$d] = 0;
                }
                if (isset($tot_queue_sec_date[$d]) && ($tot_queue_sec_date[$d] > 0)) {
                    $tot_queue_avg_date[$d] = $this->getDivision($tot_queue_sec_date[$d], $tot_queue_date[$d]);
                } else {
                    $tot_queue_avg_date[$d] = 0;
                }
                if (isset($tot_queue_sec_date[$d]) && ($tot_queue_sec_date[$d] > 0)) {
                    $tot_queue_tot_date[$d] = $this->getDivision($tot_queue_sec_date[$d], $tot_calls_date[$d]);
                } else {
                    $tot_queue_tot_date[$d] = 0;
                }
                if (isset($tot_calls_sec_date[$d]) && ($tot_calls_sec_date[$d] > 0)) {
                    $tot_calls_avg_date[$d] = ($tot_calls_sec_date[$d] / $tot_calls_date[$d]);
                    $tot_calls_avg_date[$d] = round($tot_calls_avg_date[$d]);
                    $tot_time_ms = $this->sec_convert($tot_calls_sec_date[$d], 'H');
                    $tot_time_ms_report[$d] = $tot_time_ms;
                } else {
                    $tot_calls_avg_date[$d] = 0;
                    $tot_time_ms = '    00:00:00';
                    $tot_time_ms_report[$d] = $tot_time_ms;
                }
                if (!isset($tot_drops_date[$d]))
                    $tot_drops_date[$d] = 0;
                if (!isset($tot_drops_pct_date[$d]))
                    $tot_drops_pct_date[$d] = 0;
                if (!isset($tot_drops_avg_date[$d]))
                    $tot_drops_avg_date[$d] = 0;
                if (!isset($tot_queue_date[$d]))
                    $tot_queue_date[$d] = 0;
                if (!isset($tot_calls_date[$d]))
                    $tot_calls_date[$d] = 0;
                $d++;
            }
            if ($tot_drops > 0) {
                $tot_drops_pct = ( ($tot_drops / $tot_calls) * 100);
            } else {
                $tot_drops_pct = 0;
            }
            $tot_drops_pct = round($tot_drops_pct, 2);
            if ($tot_queue > 0) {
                $tot_queue_pct = ( ($tot_queue / $tot_calls) * 100);
            } else {
                $tot_queue_pct = 0;
            }
            $tot_queue_pct = round($tot_queue_pct, 2);

            if ($tot_drops_sec > 0) {
                $tot_drops_avg = ($tot_drops_sec / $tot_drops);
            } else {
                $tot_drops_avg = 0;
            }
            if ($tot_queue_sec > 0) {
                $tot_queue_avg = ($tot_queue_sec / $tot_queue);
            } else {
                $tot_queue_avg = 0;
            }
            if ($tot_queue_sec > 0) {
                $tot_queue_tot = ($tot_queue_sec / $tot_calls);
            } else {
                $tot_queue_tot = 0;
            }

            if ($tot_calls_sec > 0) {
                $tot_calls_avg = ($tot_calls_sec / $tot_calls);
                $tot_calls_avg = round($tot_calls_avg);
                $tot_time_ms = $this->sec_convert($tot_calls_sec, 'H');
                $tot_time_ms = sprintf("%9s", $tot_time_ms);
            } else {
                $tot_calls_avg = 0;
                $tot_time_ms = '00:00:00';
            }
            $ftot_calls_avg = sprintf("%6.0f", $tot_calls_avg);
            $ftot_drops_avg = sprintf("%7.2f", $tot_drops_avg);
            $ftot_queue_avg = sprintf("%7.2f", $tot_queue_avg);
            $ftot_queue_tot = sprintf("%7.2f", $tot_queue_tot);
            $ftot_drops_pct = sprintf("%6.2f", $tot_drops_pct);
            $ftot_queue_pct = sprintf("%6.2f", $tot_queue_pct);
            $ftot_drops = sprintf("%6s", $tot_drops);
            $ftot_queue = sprintf("%6s", $tot_queue);
            $ftot_calls = sprintf("%6s", $tot_calls);
            $i = 0;
            $hi_hour_count = 0;
            $hi_hold_count = 0;

            while ($i < $time_array['tot_intervals']) {

                if ($qrt_calls[$i] > 0) {
                    $qrt_calls_avg[$i] = $this->getDivision($qrt_calls_sec[$i], $qrt_calls[$i]);
                } else {
                    $qrt_calls_avg[$i] = 0;
                }
                if ($qrt_drops[$i] > 0) {
                    $qrt_drops_avg[$i] = $this->getDivision($qrt_drops_sec[$i], $qrt_drops[$i]);
                } else {
                    $qrt_drops_avg[$i] = 0;
                }
                if ($qrt_queue[$i] > 0) {
                    $qrt_queue_avg[$i] = $this->getDivision($qrt_queue_sec[$i], $qrt_queue[$i]);
                } else {
                    $qrt_queue_avg[$i] = 0;
                }

                if ($qrt_calls[$i] > $hi_hour_count) {
                    $hi_hour_count = $qrt_calls[$i];
                }
                if ($qrt_queue_avg[$i] > $hi_hold_count) {
                    $hi_hold_count = $qrt_queue_avg[$i];
                }

                $qrt_queue_avg[$i] = round($qrt_queue_avg[$i], 0);
                if (strlen($qrt_queue_avg[$i]) < 1) {
                    $qrt_queue_avg[$i] = 0;
                }
                $qrt_queue_max[$i] = round($qrt_queue_max[$i], 0);
                if (strlen($qrt_queue_max[$i]) < 1) {
                    $qrt_queue_max[$i] = 0;
                }

                $i++;
            }
            if ($hi_hour_count < 1) {
                $hour_multiplier = 0;
            } else {
                $hour_multiplier = (20 / $hi_hour_count);
            }
            if ($hi_hold_count < 1) {
                $hold_multiplier = 0;
            } else {
                $hold_multiplier = (20 / $hi_hold_count);
            }

            $k = 1;
            $mk = $tmp_scale_num = 0;
            $holdscale_array = Array();
            $call_scale_array = Array();
            $call_scale = '0';
            array_push($call_scale_array, $call_scale);
            while ($k <= 22) {
                if (($k < 1) or ( $hour_multiplier <= 0)) {
                    $scale_num = 20;
                } else {
                    $tmp_scale_num = (23 / $hour_multiplier);
                    $tmp_scale_num = round($tmp_scale_num, 0);
                    $scale_num = ($k / $hour_multiplier);
                    $scale_num = round($scale_num, 0);
                }
                $tmpscl = $call_scale . $tmp_scale_num;

                if (($mk >= 4) or ( strlen($tmpscl) == 23)) {
                    $mk = 0;
                    $len_ENscale_num = (strlen($scale_num));
                    $k = ($k + $len_ENscale_num);
                    array_push($call_scale_array, $scale_num);
                } else {
                    $call_scale .= " ";
                    $k++;
                    $mk++;
                }
            }

            $k = 1;
            $mk = 0;
            $hold_scale = '0';
            array_push($holdscale_array, $hold_scale);
            while ($k <= 22) {
                if (($k < 1) or ( $hold_multiplier <= 0)) {
                    $scale_num = 20;
                } else {
                    $tmp_scale_num = (23 / $hold_multiplier);
                    $tmp_scale_num = round($tmp_scale_num, 0);
                    $scale_num = ($k / $hold_multiplier);
                    $scale_num = round($scale_num, 0);
                }
                $tmpscl = $hold_scale . $tmp_scale_num;

                if (($mk >= 4) or ( strlen($tmpscl) == 23)) {
                    $mk = 0;
                    $len_ENscale_num = (strlen($scale_num));
                    $k = ($k + $len_ENscale_num);
                    array_push($holdscale_array, $scale_num);
                } else {
                    $hold_scale .= " ";
                    $k++;
                    $mk++;
                }
            }
            $max_avg_hold_time = 1;
            $max_calls = 1;
            $graph_stats = array();
            $hm_display = $time_array['hm_display'];
            $i = 0;
            $all_calls = $all_hd__0 = $all_hd_20 = $all_hd_40 = $all_hd_60 = $all_hd_80 = $all_hd100 = $all_hd120 = $all_hd121 = 0;
            $tot_queue_avg_raw = 0;
            if ($tot_queue_sec > 0) {
                $tot_queue_avgraw = $this->getDivision($tot_calls, $tot_queue_sec);
            } else {
                $tot_queue_avgraw = 0;
            }
            $tot_queue_avg = sprintf("%5s", $tot_queue_avg);
            while (strlen($tot_queue_avg) > 5) {
                $tot_queue_avg = preg_replace('/.$/', '', $tot_queue_avg);
            }
            $tot_queue_max = sprintf("%5s", $tot_queue_max);
            while (strlen($tot_queue_max) > 5) {
                $tot_queue_max = preg_replace('/.$/', '', $tot_queue_max);
            }
            $tot_drops = sprintf("%5s", $tot_drops);
            $tot_calls = sprintf("%5s", $tot_calls);
            $a_phd__0 = 0;
            $a_phd_20 = 0;
            $a_phd_40 = 0;
            $a_phd_60 = 0;
            $a_phd_80 = 0;
            $a_phd100 = 0;
            $a_phd120 = 0;
            $a_phd121 = 0;
            $h = 0;
            while ($h < $time_array['tot_intervals']) {
                $Aavg_hold[$h] = $qrt_queue_avg[$h];
                if ($hd__0[$h] > 0) {
                    $phd__0[$h] = round($this->calculatePercentage($hd__0[$h], $qrt_calls[$h]));
                } else {
                    $phd__0[$h] = 0;
                }
                if ($hd_20[$h] > 0) {
                    $phd_20[$h] = round($this->calculatePercentage($hd_20[$h], $qrt_calls[$h]));
                } else {
                    $phd_20[$h] = 0;
                }
                if ($hd_40[$h] > 0) {
                    $phd_40[$h] = round($this->calculatePercentage($hd_40[$h], $qrt_calls[$h]));
                } else {
                    $phd_40[$h] = 0;
                }
                if ($hd_60[$h] > 0) {
                    $phd_60[$h] = round($this->calculatePercentage($hd_60[$h], $qrt_calls[$h]));
                } else {
                    $phd_60[$h] = 0;
                }
                if ($hd_80[$h] > 0) {
                    $phd_80[$h] = round($this->calculatePercentage($hd_80[$h], $qrt_calls[$h]));
                } else {
                    $phd_80[$h] = 0;
                }
                if ($hd100[$h] > 0) {
                    $phd100[$h] = round($this->calculatePercentage($hd100[$h], $qrt_calls[$h]));
                } else {
                    $phd100[$h] = 0;
                }
                if ($hd120[$h] > 0) {
                    $phd120[$h] = round($this->calculatePercentage($hd120[$h], $qrt_calls[$h]));
                } else {
                    $phd120[$h] = 0;
                }
                if ($hd121[$h] > 0) {
                    $phd121[$h] = round($this->calculatePercentage($hd121[$h], $qrt_calls[$h]));
                } else {
                    $phd121[$h] = 0;
                }
                $all_calls = ($all_calls + $qrt_calls[$h]);
                $all_hd__0 = ($all_hd__0 + $hd__0[$h]);
                $all_hd_20 = ($all_hd_20 + $hd_20[$h]);
                $all_hd_40 = ($all_hd_40 + $hd_40[$h]);
                $all_hd_60 = ($all_hd_60 + $hd_60[$h]);
                $all_hd_80 = ($all_hd_80 + $hd_80[$h]);
                $all_hd100 = ($all_hd100 + $hd100[$h]);
                $all_hd120 = ($all_hd120 + $hd120[$h]);
                $all_hd121 = ($all_hd121 + $hd121[$h]);
                $h++;
            }
            if ($all_hd__0 > 0) {
                $a_phd__0 = round($this->calculatePercentage($all_hd__0, $all_calls));
            }
            if ($all_hd_20 > 0) {
                $a_phd_20 = round($this->calculatePercentage($all_hd_20, $all_calls));
            }
            if ($all_hd_40 > 0) {
                $a_phd_40 = round($this->calculatePercentage($all_hd_40, $all_calls));
            }
            if ($all_hd_60 > 0) {
                $a_phd_60 = round($this->calculatePercentage($all_hd_60, $all_calls));
            }
            if ($all_hd_80 > 0) {
                $a_phd_80 = round($this->calculatePercentage($all_hd_80, $all_calls));
            }
            if ($all_hd100 > 0) {
                $a_phd100 = round($this->calculatePercentage($all_hd100, $all_calls));
            }
            if ($all_hd120 > 0) {
                $a_phd120 = round($this->calculatePercentage($all_hd120, $all_calls));
            }
            if ($all_hd121 > 0) {
                $a_phd121 = round($this->calculatePercentage($all_hd121, $all_calls));
            }

            $hold_percentage = array('phd__0' => $phd__0, 'phd_20' => $phd_20, 'phd_40' => $phd_40, 'phd_60' => $phd_60, 'phd_80' => $phd_80, 'phd100' => $phd100, 'phd120' => $phd120, 'phd121' => $phd121);
            $holdtotal_percentage = array('a_phd__0' => $a_phd__0, 'a_phd_20' => $a_phd_20, 'a_phd_40' => $a_phd_40, 'a_phd_60' => $a_phd_60, 'a_phd_80' => $a_phd_80, 'a_phd100' => $a_phd100, 'a_phd120' => $a_phd120, 'a_phd121' => $a_phd121);

            $csv_array = array('request_data' => $request->input(), 'time_array' => $time_array, 'tot_drops_date' => $tot_drops_date, 'tot_drops_pct_date' => $tot_drops_pct_date,
                'tot_drops_avg_date' => $tot_drops_avg_date, 'tot_queue_date' => $tot_queue_date, 'tot_queuepct_date' => $tot_queuepct_date,
                'tot_queue_avg_date' => $tot_queue_avg_date, 'tot_queue_tot_date' => $tot_queue_tot_date, 'tot_calls_date' => $tot_calls_date,
                'tot_time_ms' => $tot_time_ms_report, 'tot_calls_avg_date' => $tot_calls_avg_date, 'ftot_calls_avg' => $ftot_calls_avg,
                'ftot_drops_avg' => $ftot_drops_avg, 'ftot_queue_avg' => $ftot_queue_avg, 'ftot_queue_tot' => $ftot_queue_tot, 'ftot_drops_pct' =>
                $ftot_drops_pct, 'ftot_queue_pct' => $ftot_queue_pct, 'ftot_drops' => $ftot_drops, 'ftot_queue' => $ftot_queue, 'ftot_calls' => $ftot_calls,
                'ftot_time_ms' => $tot_time_ms, 'ftot_calls_avg' => $tot_calls_avg, 'holdscale_array' => $holdscale_array, 'call_scale_array' => $call_scale_array,
                'qrt_queue_avg' => $qrt_queue_avg, 'qrt_queue_max' => $qrt_queue_max, 'qrt_calls' => $qrt_calls, 'qrt_drops' => $qrt_drops, 'tot_queue_avg_raw' => $tot_queue_avg_raw,
                'tot_queue_avg' => $tot_queue_avg, 'tot_queue_max' => $tot_queue_max, 'tot_drops' => $tot_drops, 'tot_calls' => $tot_calls, 'hold_percentage' => $hold_percentage,
                'holdtotal_percentage' => $holdtotal_percentage
            );

            $tot_drops_date = array_values($tot_drops_date);
            $tot_queue_date = array_values($tot_queue_date);
            $tot_calls_date = array_values($tot_calls_date);
            //$tot_time_ms=array_values ($tot_time_ms);   

            $infor = array('request_data' => $request->input(), 'time_array' => $time_array, 'tot_drops_date' => $tot_drops_date, 'tot_drops_pct_date' => $tot_drops_pct_date,
                'tot_drops_avg_date' => $tot_drops_avg_date, 'tot_queue_date' => $tot_queue_date, 'tot_queuepct_date' => $tot_queuepct_date,
                'tot_queue_avg_date' => $tot_queue_avg_date, 'tot_queue_tot_date' => $tot_queue_tot_date, 'tot_calls_date' => $tot_calls_date,
                'tot_time_ms' => $tot_time_ms_report, 'tot_calls_avg_date' => $tot_calls_avg_date, 'ftot_calls_avg' => $ftot_calls_avg,
                'ftot_drops_avg' => $ftot_drops_avg, 'ftot_queue_avg' => $ftot_queue_avg, 'ftot_queue_tot' => $ftot_queue_tot, 'ftot_drops_pct' =>
                $ftot_drops_pct, 'ftot_queue_pct' => $ftot_queue_pct, 'ftot_drops' => $ftot_drops, 'ftot_queue' => $ftot_queue, 'ftot_calls' => $ftot_calls,
                'ftot_time_ms' => $tot_time_ms, 'ftot_calls_avg' => $tot_calls_avg, 'holdscale_array' => $holdscale_array, 'call_scale_array' => $call_scale_array,
                'qrt_queue_avg' => $qrt_queue_avg, 'qrt_queue_max' => $qrt_queue_max, 'qrt_calls' => $qrt_calls, 'qrt_drops' => $qrt_drops, 'tot_queue_avg_raw' => $tot_queue_avg_raw,
                'tot_queue_avg' => $tot_queue_avg, 'tot_queue_max' => $tot_queue_max, 'tot_drops' => $tot_drops, 'tot_calls' => $tot_calls, 'hold_percentage' => $hold_percentage,
                'holdtotal_percentage' => $holdtotal_percentage, 'csv_array' => $csv_array
            );

            return response()->json([
                        'status' => 200,
                        'message' => 'Successfully.',
                        'data' => $infor
            ]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    /**
     * Set time begin array.
     * @author Harshal Pawar.
     * @param type $shift
     * @param type $startdate
     * @param type $enddate
     * @return type
     */
    public function setTimeBegin($shift, $startdate, $enddate) {
        try {
            $time_begin = '';
            $time_end = '';
            date_default_timezone_set('Pacific/Midway');  
            $now_time = date("Y-m-d H:i:s");
            $start_time = date("U");
            if ($shift == 'AM') {
                if (strlen($time_begin) < 6) {
                    $time_begin = "00:00:00";
                }
                if (strlen($time_end) < 6) {
                    $time_end = "11:59:59";
                }
            }
            if ($shift == 'PM') {
                if (strlen($time_begin) < 6) {
                    $time_begin = "12:00:00";
                }
                if (strlen($time_end) < 6) {
                    $time_end = "23:59:59";
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
            if ($shift == 'DAYTIME') {
                if (strlen($time_begin) < 6) {
                    $time_begin = "08:45:00";
                }
                if (strlen($time_end) < 6) {
                    $time_end = "00:59:59";
                }
            }
            if ($shift == '10AM-6PM') {
                if (strlen($time_begin) < 6) {
                    $time_begin = "10:00:00";
                }
                if (strlen($time_end) < 6) {
                    $time_end = "17:59:59";
                }
            }
            if ($shift == '9AM-1AM') {
                if (strlen($time_begin) < 6) {
                    $time_begin = "09:00:00";
                }
                if (strlen($time_end) < 6) {
                    $time_end = "00:59:59";
                }
            }
            if ($shift == '845-1745') {
                if (strlen($time_begin) < 6) {
                    $time_begin = "08:45:00";
                }
                if (strlen($time_end) < 6) {
                    $time_end = "17:44:59";
                }
            }
            if ($shift == '1745-100') {
                if (strlen($time_begin) < 6) {
                    $time_begin = "17:45:00";
                }
                if (strlen($time_end) < 6) {
                    $time_end = "00:59:59";
                }
            }

            
            $query_date_begin = "$startdate $time_begin";
            $query_date_end = "$enddate $time_end";
            $sq_date_ary = explode(' ', $query_date_begin);
            $sq_day_ary = explode('-', $sq_date_ary[0]);
            $sq_time_ary = explode(':', $sq_date_ary[1]);
            $eq_date_ary = explode(' ', $query_date_end);
            $eq_day_ary = explode('-', $eq_date_ary[0]);
            $eq_time_ary = explode(':', $eq_date_ary[1]);
            $sq_epoch_day = mktime(0, 0, 0, $sq_day_ary[1], $sq_day_ary[2], $sq_day_ary[0]);
            $sq_epoch = mktime($sq_time_ary[0], $sq_time_ary[1], $sq_time_ary[2], $sq_day_ary[1], $sq_day_ary[2], $sq_day_ary[0]);
            $eq_epoch = mktime($eq_time_ary[0], $eq_time_ary[1], $eq_time_ary[2], $eq_day_ary[1], $eq_day_ary[2], $eq_day_ary[0]);
            $sq_sec = ( ($sq_time_ary[0] * 3600) + ($sq_time_ary[1] * 60) + ($sq_time_ary[2] * 1) );
            $eq_sec = ( ($eq_time_ary[0] * 3600) + ($eq_time_ary[1] * 60) + ($eq_time_ary[2] * 1) );

            $duration_sec = ($eq_epoch - $sq_epoch);
            $duration_day = intval(($duration_sec / 86400) + 1);

            if (($eq_sec < $sq_sec) and ( $duration_day < 1)) {
                $eq_epoch = ($sq_epoch_day + ($eq_sec + 86400) );
                $query_date_end = date("Y-m-d H:i:s", $eq_epoch);
                $duration_day++;
            }

            $d = 0;
            while ($d < $duration_day) {
                $d_sq_epoch = ($sq_epoch + ($d * 86400) );
                $d_eq_epoch = ($sq_epoch_day + ($eq_sec + ($d * 86400) ) );

                if ($eq_sec < $sq_sec) {
                    $d_eq_epoch = ($d_eq_epoch + 86400);
                }

                $day_start[$d] = date("Y-m-d H:i:s", $d_sq_epoch);
                $day_end[$d] = date("Y-m-d H:i:s", $d_eq_epoch);

                $d++;
            }

            $i = 0;
            $h = 4;
            $j = 0;
            $z_hour = 1;
            $active_time = 0;
            $hour = ($sq_time_ary[0] - 1);
            $start_sec = ($sq_sec - 900);
            $end_sec = ($sq_sec - 1);
            if ($sq_time_ary[1] > 14) {
                $h = 1;
                $hour++;
                if ($hour < 10) {
                    $hour = "0$hour";
                }
            }
            if ($sq_time_ary[1] > 29) {
                $h = 2;
            }
            if ($sq_time_ary[1] > 44) {
                $h = 3;
            }
            while ($i < 96) {
                $start_sec = ($start_sec + 900);
                $end_sec = ($end_sec + 900);
                $time = '      ';
                if ($h >= 4) {
                    $hour++;
                    if ($z_hour == '00') {
                        $start_sec = 0;
                        $end_sec = 899;
                    }
                    $h = 0;
                    if ($hour < 10) {
                        $hour = "0$hour";
                    }
                    $s_time = "$hour:00";
                    $e_time = "$hour:15";
                    $time = "+$s_time-$e_time+";
                }
                if ($h == 1) {
                    $s_time = "$hour:15";
                    $e_time = "$hour:30";
                    $time = " $s_time-$e_time ";
                }
                if ($h == 2) {
                    $s_time = "$hour:30";
                    $e_time = "$hour:45";
                    $time = " $s_time-$e_time ";
                }
                if ($h == 3) {
                    $z_hour = $hour;
                    $z_hour++;
                    if ($z_hour < 10) {
                        $z_hour = "0$z_hour";
                    }
                    if ($z_hour == 24) {
                        $z_hour = "00";
                    }
                    $s_time = "$hour:45";
                    $e_time = "$z_hour:00";
                    $time = " $s_time-$e_time ";
                    if ($z_hour == '00') {
                        $hour = ($z_hour - 1);
                    }
                }

                if (( ($start_sec >= $sq_sec) and ( $end_sec <= $eq_sec) and ( $eq_sec > $sq_sec) ) or ( ($start_sec >= $sq_sec) and ( $eq_sec < $sq_sec) ) or ( ($end_sec <= $eq_sec) and ( $eq_sec < $sq_sec) )) {
                    $hm_display[$j] = $time;
                    $hm_start[$j] = $s_time;
                    $hm_end[$j] = $e_time;
                    $hms_epoch[$j] = $start_sec;
                    $hme_epoch[$j] = $end_sec;

                    $j++;
                }

                $h++;
                $i++;
            }

            $tot_intervals = $j;
            return (array('duration_day' => $duration_day, 'query_date_begin' => $query_date_begin, 'query_date_end' => $query_date_end, 'now_time' => $now_time, 'sq_epoch_day' => $sq_epoch_day, 'eq_sec' => $eq_sec, 'sq_sec' => $sq_sec, 'tot_intervals' => $tot_intervals, 'hms_epoch' => $hms_epoch, 'hme_epoch' => $hme_epoch, 'day_start' => $day_start, 'day_end' => $day_end, 'hm_display' => $hm_display));
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    /**
     * Get formated data array.
     * @param type $list
     * @return array
     */
    public function getFormattedDataArray($list) {
        try {
            $resultarray = array();
            for ($i = 0; $i < count($list); $i++) {
                $singlearray = array();
                array_push($singlearray, $list[$i]['queue_seconds']);
//                date_default_timezone_set('America/Anguilla');                      #should be check on different servers.
                array_push($singlearray, $list[$i]['call_date']);
                array_push($singlearray, $list[$i]['length_in_sec']);
                array_push($singlearray, $list[$i]['status']);
                array_push($resultarray, $singlearray);
            }
            return $resultarray;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    /**
     * Inbound Api for list of DID Inbound Groups.
     * @return type
     * @throws \App\Http\Controllers\Report\Exception
     */
    public function getInboundDidList() {
        try {
            $list = VicidialInboundDid::select('did_pattern', 'did_description')->orderBy('did_pattern')->get();
            $datetime = date('H:i:s');
            $date = date('Y-m-d');

            $result_array = array(
                'list' => $list,
                'datetime' => $datetime,
                'date' => $date
            );
            return response()->json([
                        'status' => 200,
                        'message' => 'Successfully.',
                        'data' => $result_array
            ]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    /**
     * Get list of  service report group in inbound.
     * @param Request $request
     * @return type
     * @throws \App\Http\Controllers\Report\Exception
     * @author Harshal Pawar.
     */
    public function getListServiceReport(Request $request) {
        try {
            $user = $request->user();
            $condition_group_id = $this->getListByAccess(ACCESS_TYPE_INGROUP, ACCESS_READ, $user);
            $list = VicidialInboundGroup::select('group_id', 'group_name')->whereIn('group_id', $condition_group_id)->orderBy('group_name')->get();
            return response()->json([
                        'status' => 200,
                        'message' => 'Successfully.',
                        'data' => $list
            ]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    /**
     * File download for CSV.
     * @author Harshal Pawar.
     * @param $request.
     * @return Csv Download File.
     */
    public function csvDownloadForServiceApi(Request $request) {
        try {
            $csv_array = $request->input('csv_array');
            $data = array(
                '1' => array('Inbound Service Level Report', $csv_array['time_array']['NOW_TIME']),
                '2' => array(
                    'Time Range' . $csv_array['time_array']['duration_day'] . 'days',
                    $csv_array['time_array']['query_date_begin'] . " to  " . $csv_array['time_array']['query_date_end'],
                ),
                '3' => array(
                    "SHIFT DATE-TIME RANGE", "DROPS", "DROP %", "AVG DROP(s)", "HOLD", "HOLD %", "AVG HOLD(s) HOLD", "AVG HOLD(s) TOTAL", "CALLS", "TOTAL CALLTIME MIN:SEC", "AVG CALLTIME SECONDS"
                ),
            );
            $i = 0;
            while ($i < $csv_array['time_array']['duration_day']) {
                $info[$i] = [$csv_array['time_array']['day_start'][$i] . '' . $csv_array['time_array']['day_end'][$i],
                    $csv_array['tot_drops_date'][$i],
                    $csv_array['tot_drops_pct_date'][$i],
                    $csv_array['tot_drops_avg_date'][$i],
                    $csv_array['tot_queue_date'][$i],
                    $csv_array['tot_queuepct_date'][$i],
                    $csv_array['tot_queue_avg_date'][$i],
                    $csv_array['tot_queue_tot_date'][$i],
                    $csv_array['tot_calls_date'][$i],
                    $csv_array['tot_time_ms'][$i],
                    $csv_array['tot_calls_avg_date'][$i]];
                $i++;
            }
            $total[] = ["TOTALS ", $csv_array['ftot_drops'], $csv_array['ftot_drops_pct'], $csv_array['ftot_drops_avg']
                , $csv_array['ftot_queue'], $csv_array['ftot_queue_pct'], $csv_array['ftot_queue_avg']
                , $csv_array['ftot_queue_tot'], $csv_array['ftot_calls'], $csv_array['ftot_time_ms']
                , $csv_array['ftot_calls_avg']];

            $array_info = [[], ["HOLD TIME ", "CALL AND DROP STATS"],
                    ["GRAPH IN 15 MINUTE INCREMENTS"],
                    ["OF AVERAGE HOLD TIME FOR CALLS"],
                    ["TAKEN INTO THIS IN-GROUP"]];
            $time_title = [[], ["TIME - 15 MIN INT", "AVG SECS", "MAX SECS", "DROPS", "TOTAL"]];

            if (isset($csv_array['time_array']['hm_display'])) {
                $i = 0;
                while ($i < count($csv_array['time_array']['hm_display'])) {
                    $hm_array[$i] = [$csv_array['time_array']['hm_display'][$i], $csv_array['qrt_queue_avg'][$i], $csv_array['qrt_queue_max'][$i], $csv_array['qrt_drops'][$i], $csv_array['qrt_calls'][$i]];
                    $i++;
                }
            }
            $hm_total[] = ["TOTAL", $csv_array['tot_queue_avg'], $csv_array['tot_queue_max'], $csv_array['tot_drops'], $csv_array['tot_calls']];

            $tit_array = [["CALL HOLD TIME BREAKDOWN IN SECONDS"],
                    ["TIME 15-MIN INT", "CALLS", "0 (seconds) ", "20", "40", "80", "100", " 120 ", " 120+ ", "AVG TIME BEFORE ANSWER(SEC)"]];

            if (isset($csv_array['time_array']['hm_display'])) {
                $i = 0;
                while ($i < count($csv_array['time_array']['hm_display'])) {
                    $hold_array[$i] = [$csv_array['time_array']['hm_display'][$i], $csv_array['qrt_calls'][$i], $csv_array['hold_percentage']['phd__0'][$i]
                        , $csv_array['hold_percentage']['phd_20'][$i], $csv_array['hold_percentage']['phd_40'][$i]
                        , $csv_array['hold_percentage']['phd_60'][$i], $csv_array['hold_percentage']['phd_80'][$i]
                        , $csv_array['hold_percentage']['phd100'][$i], $csv_array['hold_percentage']['phd120'][$i]
                        , $csv_array['hold_percentage']['phd121'][$i], $csv_array['qrt_queue_avg'][$i]];
                    $i++;
                }
            }
            $hold_final[] = ["TOTAL", $csv_array['ftot_calls'], $csv_array['holdtotal_percentage']['a_phd__0']
                , $csv_array['holdtotal_percentage']['a_phd_20'], $csv_array['holdtotal_percentage']['a_phd_40']
                , $csv_array['holdtotal_percentage']['a_phd_60'], $csv_array['holdtotal_percentage']['a_phd_80']
                , $csv_array['holdtotal_percentage']['a_phd100'], $csv_array['holdtotal_percentage']['a_phd120']
                , $csv_array['holdtotal_percentage']['a_phd121'], $csv_array['ftot_queue_avg']];


            $startdate = $request->input('startdate');
            $enddate = $request->input('enddate');
            $file_time = "$startdate _To_ $enddate";
            $filename = "Inbound_Service_Level_Report_From_$file_time.csv";
            $handle = fopen($filename, 'w+');
            $data = $this->fileContent($filename, $data, $handle);
            $info = $this->fileContent($filename, $info, $handle);
            $total = $this->fileContent($filename, $total, $handle);
            $array_info = $this->fileContent($filename, $array_info, $handle);
            $time_title = $this->fileContent($filename, $time_title, $handle);
            $hm_array = $this->fileContent($filename, $hm_array, $handle);
            $hm_total = $this->fileContent($filename, $hm_total, $handle);
            $tit_array = $this->fileContent($filename, $tit_array, $handle);
            $hold_array = $this->fileContent($filename, $hold_array, $handle);
            $hold_final = $this->fileContent($filename, $hold_final, $handle);

            fclose($handle);

            $headers = array(
                'Content-Type' => 'text/csv',
            );
            return Response::download($filename, 'file ' . date("d-m-Y H:i") . '.csv', $headers)->deleteFileAfterSend(true);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    /*
     * Write file in file content.
     * @author Harshal Pawar.
     * @param filename, array, handle.
     * @return array.
     */

    public function fileContent($filename, $array, $handle) {
        try {
            foreach ($array as $key => $rows) {
                fputcsv($handle, $rows, ";", '"');
            }
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    /**
     * Inboound Summery report .
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param Request $request
     * @throws \App\Http\Controllers\Report\Exception
     */
    public function summeryReport(Request $request) {
        try {
            
            $startdate = $request->input('startdate');
            $enddate = $request->input('enddate');
            $shift = $request->input('shift');
            $selectedgroups = $request->input('selectedgroups');
            $returnType = $request->input('returnType');
            $fields = array(
                'startdate' => $startdate, 'enddate' => $enddate, 'shift' => $shift, 'selectedgroups' => $selectedgroups
            );
            $result = json_decode($this->inBoundSummaryHourlyReportTest($fields));
            
            $key_table_name = array("tot_calls" => "TOTAL CALLS", "tot_ans" => "TOTAL ANSWER", "tot_talk" => "TOTAL TALK", "avg_talk" => "AVERAGE TALK", 
                "tot_que_time" => "TOTAL QUEUE TIME", "avg_que_time" => "AVERAGE QUEUE TIME", "max_que_time" => "MAXIMUM QUEUE TIME", "tot_abandoned_call" => "TOTAL ABANDON CALLS");
            $notInKey = array('hour', 'tot_calls', 'tot_ans', 'tot_abandoned_call');
            $dynamicKey = array_keys((array) $result->total_each_in_bound_break_down);
            $html_each_first = [];
            for ($i = 0; $i < count((array) $result->hourly_break_down_result); $i++) { //total No of table
                $array_keyinfo = $dynamicKey[$i];
                for ($j = 0; $j < count($result->hourly_break_down_result->$array_keyinfo); $j++) { //Each Table data
                    $searcg_inbound_array = $result->hourly_break_down_result->$array_keyinfo;
                    foreach ($key_table_name as $key => $val) {
                        $text_value = (in_array($key, $notInKey)) ? $searcg_inbound_array[$j]->$key : $this->sec_convert($searcg_inbound_array[$j]->$key, 'H');
                        $max = ($result->max_values->$array_keyinfo->$key < 1) ? 1 : $result->max_values->$array_keyinfo->$key;
                        $width = (($searcg_inbound_array[$j]->$key / $max) * 100);
                        $html_each_first[$array_keyinfo][$key][$j]['widhth'] =  $width;
                        $html_each_first[$array_keyinfo][$key][$j]['hour'] =  $searcg_inbound_array[$j]->hour;
                        $html_each_first[$array_keyinfo][$key][$j]['textValue'] = $text_value;
                    }
                }
            }
            
            $total_html = [];
            for ($i = 0; $i < count((array) $result->total_each_in_bound_break_down); $i++) {
                $multiHtml1  = $result->InBoundGroup[$i];
                foreach ($key_table_name as $key => $val) {
                    $array_keyinfo = $dynamicKey[$i];
                    $useValue = $result->total_each_in_bound_break_down->$array_keyinfo->$key;
                    $multiHtml = (in_array($key, $notInKey)) ? $useValue : $this->sec_convert($useValue, 'H');
                    $max = ($result->max_inbound_break_down->$key < 1) ? 1 : $result->max_inbound_break_down->$key;
                    $width = (($useValue / $max) * 100).'%';
                    $total_html[$array_keyinfo][$key]['widhth'] =  $width;
                    $total_html[$array_keyinfo][$key]['textValue'] = $multiHtml;
                }
            }
            
            $hourly_break_down_result = $result->hourly_break_down_result;
            foreach ($hourly_break_down_result as $key => $value ) {
                foreach ($value as $ky => $vl ) {
                $vl->tot_talk = $this->secConvert($vl->tot_talk, 'H');
                $vl->avg_talk = $this->secConvert($vl->avg_talk, 'H');
                $vl->tot_que_time = $this->secConvert($vl->tot_que_time, 'H');
                $vl->avg_que_time = $this->secConvert($vl->avg_que_time, 'H');
                $vl->max_que_time = $this->secConvert($vl->max_que_time, 'H');
            }
            }
            
            foreach ($result->total_each_in_bound_break_down as $ky => $vl ) {
                    $vl->tot_talk = $this->secConvert($vl->tot_talk, 'H');
                    $vl->avg_talk = $this->secConvert($vl->avg_talk, 'H');
                    $vl->tot_que_time = $this->secConvert($vl->tot_que_time, 'H');
                    $vl->avg_que_time = $this->secConvert($vl->avg_que_time, 'H');
                    $vl->max_que_time = $this->secConvert($vl->max_que_time, 'H');
                }
            
            foreach ($result->max_values as $ky => $vl ) {
                $vl->tot_talk = $this->secConvert($vl->tot_talk, 'H');
                $vl->avg_talk = $this->secConvert($vl->avg_talk, 'H');
                $vl->tot_que_time = $this->secConvert($vl->tot_que_time, 'H');
                $vl->avg_que_time = $this->secConvert($vl->avg_que_time, 'H');
                $vl->max_que_time = $this->secConvert($vl->max_que_time, 'H');
            }
            
            $max_inbound_break_down = $result->max_inbound_break_down;
            $max_inbound_break_down->tot_talk = $this->secConvert($max_inbound_break_down->tot_talk, 'H');
            $max_inbound_break_down->avg_talk = $this->secConvert($max_inbound_break_down->avg_talk, 'H');
            $max_inbound_break_down->tot_que_time = $this->secConvert($max_inbound_break_down->tot_que_time, 'H');
            $max_inbound_break_down->avg_que_time = $this->secConvert($max_inbound_break_down->avg_que_time, 'H');
            $max_inbound_break_down->max_que_time = $this->secConvert($max_inbound_break_down->max_que_time, 'H');
            
            $total_inbound_break_down = $result->total_inbound_break_down;
            $total_inbound_break_down->tot_talk = $this->secConvert($total_inbound_break_down->tot_talk, 'H');
            $total_inbound_break_down->avg_talk = $this->secConvert($total_inbound_break_down->avg_talk, 'H');
            $total_inbound_break_down->tot_que_time = $this->secConvert($total_inbound_break_down->tot_que_time, 'H');
            $total_inbound_break_down->avg_que_time = $this->secConvert($total_inbound_break_down->avg_que_time, 'H');
            $total_inbound_break_down->max_que_time = $this->secConvert($total_inbound_break_down->max_que_time, 'H');
            
            $download_csv = $request->input('download_csv');
            if($download_csv == 'yes'){   # for download csv file .
                return $result;
            }
            
            $result->html_each_first =  $html_each_first;
            $result->total_html =  $total_html;
            
            return response()->json([
            'status'=>200,    
            'message' => 'Successfully Recieve Data.',
             'data'=>   $result
            ]);
            
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }

    
    /**
     * Inboound Summery hourly report test .
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param type $params
     * @return type
     * @throws \App\Http\Controllers\Report\Exception
     */
    public function inBoundSummaryHourlyReportTest($params) {
        try {
            $startdate = $params['startdate'];
            $enddate = $params['enddate'];
            $shift = $params['shift'];
            $selectedgroups = $params['selectedgroups'];
            $dropstatus = array('DROP', 'XDROP');
            $answerstatus = array('FER', 'XFER');
            $campaign_wise_details = null;
            $timeinterval = '3600';
            $i = $gct_default_start = $gct_default_stop = 0;
            $gct_sunday_start = $gct_sunday_stop = $gct_monday_start = $gct_monday_stop = $gct_tuesday_start = $gct_tuesday_stop = $gct_wednesday_start = $gct_wednesday_stop = $gct_thursday_start = $gct_thursday_stop = 0;
            $gct_friday_start = $gct_friday_stop = $gct_saturday_start = $gct_saturday_stop = 0;
            $group_ct = count($selectedgroups);
            $group_string = '|';
            $group_string = ($group_ct > 0) ? $group_string.implode("|", $selectedgroups)."|" : $group_string;
            if ($shift == 'ALL') {
                $gct_default_start = "0";
                $gct_default_stop = "2400";
            }//if end
            else {
                $shiftdata = VicidialCallTime::shiftdata($shift);
                if(isset($shiftdata)) {
                    $shiftdata_cnt= $shiftdata->count();
                    if ($shiftdata_cnt > 0) {
                        $gct_default_start = $shiftdata->ct_default_start ;
                        $gct_default_stop = $shiftdata->ct_default_stop ;
                        $gct_sunday_start = $shiftdata->ct_sunday_start ;
                        $gct_sunday_stop = $shiftdata->ct_sunday_stop ;
                        $gct_monday_start = $shiftdata->ct_monday_start ;
                        $gct_monday_stop = $shiftdata->ct_monday_stop ;
                        $gct_tuesday_start = $shiftdata->ct_tuesday_start ;
                        $gct_tuesday_stop = $shiftdata->ct_tuesday_stop ;
                        $gct_wednesday_start = $shiftdata->ct_wednesday_start ;
                        $gct_wednesday_stop = $shiftdata->ct_wednesday_stop ;
                        $gct_thursday_start = $shiftdata->ct_thursday_start ;
                        $gct_thursday_stop = $shiftdata->ct_thursday_stop ;
                        $gct_friday_start = $shiftdata->ct_friday_start ;
                        $gct_friday_stop = $shiftdata->ct_friday_stop ;
                        $gct_saturday_start = $shiftdata->ct_saturday_start ;
                        $gct_saturday_stop = $shiftdata->ct_saturday_stop ;
                    }
                }
            }
            $h = 0;
            $h_calltime = [];
            while ($h < 24) {
                $h__test = $h."00";
                if (($h__test >= $gct_default_start) and ( $h__test <= $gct_default_stop)) {
                    $h_calltime[$h] = isset($h_calltime[$h]) ? $h_calltime[$h]++ : 1;
                }
                $h++;
            }
            
            $hourly_campaign_wise_details  = [];
            if (count($selectedgroups) > 0) {
                $hourly_campaign_wise_details = $this->getHourlyDetailsByCampaignId($selectedgroups, $startdate, $enddate, $gct_default_start, $gct_default_stop, $gct_sunday_start, $gct_sunday_stop, $gct_monday_start, $gct_monday_stop, $gct_tuesday_start, $gct_tuesday_stop, $gct_wednesday_start, $gct_wednesday_stop, $gct_thursday_start, $gct_thursday_stop, $gct_friday_start, $gct_friday_stop, $gct_saturday_start, $gct_saturday_stop, $h_calltime);
            }
            return $hourly_campaign_wise_details;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }
    
    /**
     * Get hourly details by campaign id .
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param type $campaign_id_list
     * @param type $startdate
     * @param type $enddate
     * @param type $gct_default_start
     * @param type $gct_default_stop
     * @param type $gct_sunday_start
     * @param type $gct_sunday_stop
     * @param type $gct_monday_start
     * @param type $gct_monday_stop
     * @param type $gct_tuesday_start
     * @param type $gct_tuesday_stop
     * @param type $gct_wednesday_start
     * @param type $gct_wednesday_stop
     * @param type $gct_thursday_start
     * @param type $gct_thursday_stop
     * @param type $gct_friday_start
     * @param type $gct_friday_stop
     * @param type $gct_saturday_start
     * @param type $gct_saturday_stop
     * @param type $h_calltime
     * @return string
     * @throws \App\Http\Controllers\Report\Exception
     */
    public function getHourlyDetailsByCampaignId($campaign_id_list, $startdate, $enddate, $gct_default_start, $gct_default_stop, $gct_sunday_start, $gct_sunday_stop, $gct_monday_start, $gct_monday_stop, $gct_tuesday_start, $gct_tuesday_stop, $gct_wednesday_start, $gct_wednesday_stop, $gct_thursday_start, $gct_thursday_stop, $gct_friday_start, $gct_friday_stop, $gct_saturday_start, $gct_saturday_stop, $h_calltime) {
        try {
        $ct_start = $gct_default_start."00";
        $ct_stop = $gct_default_stop."59";
        $hourly_break_down_result = array();
        $mt = array();
        $group_id = "'".implode("','", $campaign_id_list)."'";
        $group_list = VicidialInboundGroup::select('group_name', 'agent_alert_delay', 'group_id')->whereIn('group_id',$campaign_id_list)->get();
        $temp_array = $groupnamearray = $agent_alert_delay =array();
        if(isset($group_list)) {
            $group_list = $group_list->toArray();
            foreach ($group_list as $key => $val) {
                $temp_array[$val['group_id']] = $val['group_name'];
            }
            $groupnamearray = array_map(function($item) { return $item['group_name']; }, $group_list);
            $agent_alert_delay = array_map(function($item) { return ($item['agent_alert_delay'] / 1000); }, $group_list);
        }
        $total_each_inbound_array = $inbound_group = $total_each_inbound = array();
        $keyVal = array("tot_calls", "tot_ans", "tot_talk", "avg_talk", "tot_que_time", "avg_que_time", "max_que_time", "tot_abandoned_call");
        $i = 0;
        foreach ($campaign_id_list as $key => $campaign) {
            $out_of_call_time = $length_in_sec[$i] = $queue_seconds[$i] = $talk_sec[$i] = $calls_count[$i] = $drop_count[$i] = $answer_count[$i] = $max_queue_seconds[$i] = 0;
            $h_length_in_sec = $h_queue_seconds = $h_talk_sec = $h_calls_count = $h_drop_count = $h_answer_count = $h_max_queue_seconds = $mt;
            $total_call_details = VicidialCloserLog::select('status', 'length_in_sec', 'queue_seconds', 'call_date', 'phone_number', 'campaign_id')
                    ->where('campaign_id',$campaign)
                    ->whereBetween('call_date', [$startdate.' 00:00:00', $enddate.' 23:59:59'])
                    ->get();
            $p = 0;
            
            if(isset($total_call_details)) {
                $total_call_details_cnt = $total_call_details->count();
                while ($p < $total_call_details_cnt) {
                    $call_date = explode(" ", $total_call_details[$p]->call_date);
                    $call_time = preg_replace('/[^0-9]/', '', $call_date[1]);
                    date_default_timezone_set('America/Anguilla');                      #should be check on different servers.
                    $epoch = strtotime($total_call_details[$p]->call_date);
                    $c_wday = date("w", $epoch);
                    $ct_start = $gct_default_start."00";
                    $ct_stop = $gct_default_stop."59";
                    if (($c_wday == 0) and ( ($gct_sunday_start > 0) and ( $gct_sunday_stop > 0) )) { $ct_start = $gct_sunday_start."00"; $ct_stop = $gct_sunday_stop."59"; }
                    if (($c_wday == 1) and ( ($gct_monday_start > 0) and ( $gct_monday_stop > 0) )) { $ct_start = $gct_monday_start."00"; $ct_stop = $gct_monday_stop."59"; }
                    if (($c_wday == 2) and ( ($gct_tuesday_start > 0) and ( $gct_tuesday_stop > 0) )) { $ct_start = $gct_tuesday_start."00"; $ct_stop = $gct_tuesday_stop."59"; }
                    if (($c_wday == 3) and ( ($gct_wednesday_start > 0) and ( $gct_wednesday_stop > 0) )) { $ct_start = $gct_wednesday_start."00"; $ct_stop = $gct_wednesday_stop."59"; }
                    if (($c_wday == 4) and ( ($gct_thursday_start > 0) and ( $gct_thursday_stop > 0) )) { $ct_start = $gct_thursday_start."00"; $ct_stop = $gct_thursday_stop."59"; }
                    if (($c_wday == 5) and ( ($gct_friday_start > 0) and ( $gct_friday_stop > 0) )) { $ct_start = $gct_friday_start."00"; $ct_stop = $gct_friday_stop."59"; }
                    if (($c_wday == 6) and ( ($gct_saturday_start > 0) and ( $gct_saturday_stop > 0) )) { $ct_start = $gct_saturday_start."00"; $ct_stop = $gct_saturday_stop."59"; }
                    $c_hour = date("G", $epoch);
                    if (($call_time > $ct_start) and ( $call_time < $ct_stop)) {
                        $calls_count[$i] ++;
                        $length_in_sec[$i] = ($length_in_sec[$i] + $total_call_details[$p]->length_in_sec);
                        $queue_seconds[$i] = ($queue_seconds[$i] + $total_call_details[$p]->queue_seconds);
                        $temp_talk = ( ($total_call_details[$p]->length_in_sec - $total_call_details[$p]->queue_seconds) - (isset($agent_alert_delay[$i]) ? $agent_alert_delay[$i] : 0));
                        if ($temp_talk < 0) { $temp_talk = 0; }
                        $talk_sec[$i] = ($talk_sec[$i] + $temp_talk);
                        if ($max_queue_seconds[$i] < $total_call_details[$p]->queue_seconds) { $max_queue_seconds[$i] = $total_call_details[$p]->queue_seconds; }
                        (preg_match("/DROP/i", $total_call_details[$p]->status)) ? $drop_count[$i] ++ : $answer_count[$i] ++;
                        $h_calls_count[$c_hour] = isset($h_calls_count[$c_hour]) ? $h_calls_count[$c_hour]+1 : 1;
                        $h_length_in_sec[$c_hour] =  isset($h_length_in_sec[$c_hour]) ? $h_length_in_sec[$c_hour] : 0;
                        $h_length_in_sec[$c_hour] = ($h_length_in_sec[$c_hour] + $total_call_details[$p]->length_in_sec);
                        $h_queue_seconds[$c_hour] =  isset($h_queue_seconds[$c_hour]) ? $h_queue_seconds[$c_hour] : 0;
                        $h_queue_seconds[$c_hour] = ($h_queue_seconds[$c_hour] + $total_call_details[$p]->queue_seconds);
                        $h_talk_sec[$c_hour] =  isset($h_talk_sec[$c_hour]) ? $h_talk_sec[$c_hour] : 0;
                        $h_talk_sec[$c_hour] = ($h_talk_sec[$c_hour] + $temp_talk);
                        $h_max_queue_seconds[$c_hour] =  isset($h_max_queue_seconds[$c_hour]) ? $h_max_queue_seconds[$c_hour] : 0;
                        if ($h_max_queue_seconds[$c_hour] < $total_call_details[$p]->queue_seconds) { $h_max_queue_seconds[$c_hour] = $total_call_details[$p]->queue_seconds; }
                        if (preg_match("/DROP/i", $total_call_details[$p]->status)) { 
                            $h_drop_count[$c_hour] = isset($h_drop_count[$c_hour]) ? $h_drop_count[$c_hour]+ 1 : 1; 
                        } else {   
                            $h_answer_count[$c_hour] = isset($h_answer_count[$c_hour]) ? $h_answer_count[$c_hour]+ 1 : 1 ;
                        } 
                        $h_calltime[$c_hour] = isset($h_calltime[$c_hour]) ? $h_calltime[$c_hour] + 1 : 1;
                        
                    } else { $out_of_call_time++; }
                    $p++;
                }
            }
            $talk_avg[$i] = (($answer_count[$i] > 0) and ( $talk_sec[$i] > 0)) ? ($talk_sec[$i] / $answer_count[$i]) : 0;
            $queue_avg[$i] = (($calls_count[$i] > 0) and ( $queue_seconds[$i] > 0)) ? ($queue_seconds[$i] / $calls_count[$i]) : 0;
            $info = isset($temp_array[$campaign]) ? $temp_array[$campaign] : '';
            $inbound_group[$i] = "$campaign_id_list[$i] - $info";
            $hourly_break_down_group = array();
            $hourly_break_down = array();
            $h = 0; $q = 0;
 
            while ($h < 24) {
                if(isset($h_calltime[$h])) {
                    if ($h_calltime[$h] > 0) {
                        $hourly_break_down_group[$q]['hour'] = $h;
                        $hourly_break_down_group[$q]['tot_calls'] = isset($h_calls_count[$h]) ? (( strlen($h_calls_count[$h]) < 1) ? 0 : $h_calls_count[$h]) : 0;
                        $hourly_break_down_group[$q]['tot_ans'] = isset($h_answer_count[$h]) ? ((strlen($h_answer_count[$h]) < 1) ? 0 : $h_answer_count[$h] ) : 0;
                        $hourly_break_down_group[$q]['tot_talk'] = isset($h_talk_sec[$h]) ? ((strlen($h_talk_sec[$h]) < 1) ? 0 : $h_talk_sec[$h]) : 0;
                        $hourly_break_down_group[$q]['avg_talk'] = isset($h_answer_count[$h]) ? ((($h_answer_count[$h] > 0) and ( $h_talk_sec[$h] > 0)) ? ($h_talk_sec[$h] / $h_answer_count[$h]) : 0)  : 0 ;
                        $hourly_break_down_group[$q]['tot_que_time'] = isset($h_queue_seconds[$h]) ? ((strlen($h_queue_seconds[$h]) < 1) ? 0 : $h_queue_seconds[$h]) : 0;
                        $hourly_break_down_group[$q]['avg_que_time'] = isset($h_calls_count[$h]) ? (( ($h_calls_count[$h] > 0) and ( $h_queue_seconds[$h] > 0)) ? ($h_queue_seconds[$h] / $h_calls_count[$h]) : 0 ) : 0;
                        $hourly_break_down_group[$q]['max_que_time'] = isset($h_max_queue_seconds[$h]) ? (( strlen($h_max_queue_seconds[$h]) < 1) ? 0 : $h_max_queue_seconds[$h]) : 0;
                        $hourly_break_down_group[$q]['tot_abandoned_call'] = isset($h_drop_count[$h]) ? ((strlen($h_drop_count[$h]) < 1) ? 0 : $h_drop_count[$h]) : 0;
                        $q++;
                    }
                }
                $h++;
            }
            $hourly_break_down_result[$campaign] = $hourly_break_down_group;
            foreach ($keyVal as $key => $val) {
                $max_array[$campaign][$val] = !empty(array_map(function($item)use($val) { return $item["$val"]; }, $hourly_break_down_group)) ? max(array_map(function($item)use($val) { return $item["$val"]; }, $hourly_break_down_group)) :  0;
                if ($val == 'avg_talk') { $total = (($total_each_inbound_array[$i]['tot_talk'] > 0) and ( $total_each_inbound_array[$i]['tot_ans'] > 0)) ? ($total_each_inbound_array[$i]['tot_talk'] / $total_each_inbound_array[$i]['tot_ans']) : 0; } elseif ($val == 'avg_que_time') { $total = (($total_each_inbound_array[$i]['tot_que_time'] > 0) and ( $total_each_inbound_array[$i]['tot_calls'] > 0)) ? ($total_each_inbound_array[$i]['tot_que_time'] / $total_each_inbound_array[$i]['tot_calls']) : 0; } elseif ($val == 'max_que_time') { $total = !empty(array_map(function($item)use($val) { return $item["$val"]; }, $hourly_break_down_group)) ? max(array_map(function($item)use($val) { return $item["$val"]; }, $hourly_break_down_group)) : 0; } else { $total = array_sum(array_map(function($item)use($val) { return $item["$val"]; }, $hourly_break_down_group)); }
                $total_each_inbound_array[$i][$val] = $total; //$member->sec_convert($total,'H');
                $total_each_inbound[$campaign][$val] = $total;
            }
            $i++;
        }
        $max_array_total_inbound = $all_group_total = array();
        foreach ($keyVal as $key => $val) {
            $max_array_total_inbound[$val] = !empty(array_map(function($item)use($val) { return $item["$val"]; }, $total_each_inbound_array)) ? max(array_map(function($item)use($val) { return $item["$val"]; }, $total_each_inbound_array)) : 0;
            if ($val == 'avg_talk') { $total = (($all_group_total['tot_talk'] > 0) and ( $all_group_total['tot_ans'] > 0)) ? ($all_group_total['tot_talk'] / $all_group_total['tot_ans']) : 0; } elseif ($val == 'avg_que_time') { $total = (($all_group_total['tot_que_time'] > 0) and ( $all_group_total['tot_calls'] > 0)) ? ($all_group_total['tot_que_time'] / $all_group_total['tot_calls']) : 0; } elseif ($val == 'max_que_time') { $total = !empty(array_map(function($item)use($val) { return $item["$val"]; }, $total_each_inbound_array)) ?  max(array_map(function($item)use($val) { return $item["$val"]; }, $total_each_inbound_array)) : 0 ; } else { $total = array_sum(array_map(function($item)use($val) { return $item["$val"]; }, $total_each_inbound_array)); }
            $all_group_total[$val] = $total;
        }
        $report_name = " Inbound Summary Hourly Report: ".$enddate." ".date('H:i:s');
        $string_return = '{"InBoundGroup":'.json_encode($inbound_group).',"hourly_break_down_result":'.json_encode($hourly_break_down_result).',
                                    "total_each_in_bound_break_down":'.json_encode($total_each_inbound).',"total_inbound_break_down":'.json_encode($all_group_total).',"max_values":'.json_encode($max_array).',"max_inbound_break_down":'.json_encode($max_array_total_inbound).',"report_name":'.json_encode(array($report_name)).'}';
        return $string_return;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }
    
    /**
     * Inbound summery report csv fild download.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param Request $request
     * @return type
     * @throws \App\Http\Controllers\Report\Exception
     */
    public function csvSummeryReport(Request $request) {
        try {
            $result = $this->summeryReport($request);
            $null = [];
            $filename = "Inbound Summary Hourly Report".date('Y-m-dh:i:s').".csv";
            $handle = fopen($filename, 'w+');
            
            $row= ['Inbound Summary Hourly Report:'.date('Y-m-dh:i:s')];
            fputcsv($handle, $row, ";", '"');
            
            $row= ['MULTI-GROUP BREAKDOWN:'];
            fputcsv($handle, $row, ";", '"');
            fputcsv($handle, $null, ";", '"');
            $rows= ['IN-GROUP','TOTAL CALLS','TOTAL ANSWER','TOTAL TALK','AVERAGE TALK','TOTAL QUEUE TIME','AVERAGE QUEUE TIME','MAXIMUM QUEUE TIME','TOTAL ABANDON CALLS'];
            fputcsv($handle, $rows, ";", '"');
            
            $v = 0;
            foreach ($result->total_each_in_bound_break_down as $key => $val) { 
                $val_group = $datas = [];
                $val_group[] = $result->InBoundGroup[$v];
                $datas = (array)$val;
                $datas = array_merge($val_group, $datas);
                fputcsv($handle, $datas, ";", '"');
                $v++;
            }
            
            $val = ['TOTAL     In-Groups: '.$v];
            $data = (array)$result->total_inbound_break_down;
            $cts = array_merge($val, $data);
            fputcsv($handle, $cts, ";", '"');
            fputcsv($handle, $null, ";", '"');
            $v = 0;
            foreach ($result->hourly_break_down_result as $key => $val) { 
                $filee = [$result->InBoundGroup[$v]];
                fputcsv($handle, $filee, ";", '"');

                $row= ['Hourly Breakdown'];
                fputcsv($handle, $row, ";", '"');
                fputcsv($handle, $null, ";", '"');
                $rows= ['HOUR','TOTAL CALLS','TOTAL ANSWER','TOTAL TALK','AVERAGE TALK','TOTAL QUEUE TIME','AVERAGE QUEUE TIME','MAXIMUM QUEUE TIME','TOTAL ABANDON CALLS'];
                fputcsv($handle, $rows, ";", '"');
                
                foreach ($val as $ky => $vl) { 
                    fputcsv($handle, (array)$vl, ";", '"');
                }
                
                $val_group = ['TOTAL'];
                $data = (array)$result->total_each_in_bound_break_down->$key;
                $data = array_merge($val_group, $data);
                fputcsv($handle, $data, ";", '"');
                fputcsv($handle, $null, ";", '"');
                $v++;
            }
            
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
    
    
    public function inboundDailyReport(Request $request) {
        try {
            $startdate = $request->input('startdate');
            $enddate = $request->input('enddate');
            $hourlybreakdown = $request->input('hourlybreakdown');
            $selectedgroups = $request->input('selectedgroups');
            $showdispositionstatus = $request->input('showdispositionstatus');
            $ignoreafterhours = $request->input('ignoreafterhours');
            $display_type = $request->input('display_type');
            $groupText = $request->input('group_text');
            
            if (in_array('-ALL-', $selectedgroups)) {
                $group_val = VicidialInboundGroup::orderBy('group_id')->select('group_id')->get();
                if(isset($group_val)) {
                    $selectedgroups =[];
                    $group_cnt = $group_val->count();
                    $i = 0;
                    while($i < $group_cnt) {
                        $selectedgroups[] = $group_val[$i]->group_id;
                        $i++;
                    }
                }
            }
            
            $group = $selectedgroups;
            $ag = [];
            $hourly_breakdown = ($hourlybreakdown != "") ? $hourlybreakdown : "0";
            $show_disposition_statuses = ($showdispositionstatus != "") ? $showdispositionstatus : "0";
            $ignore_afterhours = ($ignoreafterhours != "") ? $ignoreafterhours : "0";

            $time_array = $this->setTimeBeginInbound($startdate, $enddate, $hourly_breakdown, $show_disposition_statuses, $ignore_afterhours);
            $status_array = $dispostion_status_array = [];
            if ($show_disposition_statuses) {
                $dispo_rslt = VicidialCloserLog::dispoReslt($group , $time_array['query_date_begin'],$time_array['query_date_end']);
                if(isset($dispo_rslt)) {
                    $dispo_cnt = $dispo_rslt->count();
                    $s = 0;
                    while ($s < $dispo_cnt) {
                        $status_array[$s][0] = "'".$dispo_rslt[$s]->status."'";
                        $status_array[$s][1] = "";
                        $dispo_stmt = \App\VicidialStatuses::getDispoStat($dispo_rslt[$s]->status);
                        if (!empty($dispo_stmt)) {
                            $status_array[$s][1] = $dispo_stmt[0]->status_name;
                        }
                        $s++;
                    }
                }
            }
            $tot_intervals = $time_array['tot_intervals']; //elaborate
            
            $list = VicidialCloserLog::select('queue_seconds','call_date','length_in_sec','status','term_reason','call_date','user')
                    ->whereIn('campaign_id',$group) 
                    ->whereBetween('call_date', [$time_array['query_date_begin'],$time_array['query_date_end']])
                    ->get();
            
            $i = 0;
            $f_total_agents = array();
            if ($hourly_breakdown == "1") { $epoch_interval = 3600; } else { $epoch_interval = 86400; }
            if(isset($list)) {
                $list_cnt= $list->count();
                while ($i < $list_cnt) {
                    $qs[$i] = $list[$i]->queue_seconds;
                    $dt[$i] = 0;
                    $Time = strtotime($list[$i]->call_date);
                    $ut[$i] = ($Time - $time_array['sq_epoch_day']);
                    while ($ut[$i] >= $epoch_interval) {
                        $ut[$i] = ($ut[$i] - $epoch_interval);
                        $dt[$i] ++;
                    }
                    if (($ut[$i] <= $time_array['eq_sec']) and ( $time_array['eq_sec'] < $time_array['sq_sec'])) {
                        $dt[$i] = ($dt[$i] - 1);
                    }
                    $ls[$i] = $list[$i]->length_in_sec;
                    $st[$i] = $list[$i]->status;
                    $tr[$i] = $list[$i]->term_reason;
                    $at[$i] = $list[$i]->call_date; # Actual time
                    if ($list[$i]->user != "VDCL" && $list[$i]->user != "") { $ag[$i] = $list[$i]->user; } # User
                    $i++;
                }
            }
            $mt[0] = '0';
            $tot_calls = 0;
            $tot_drops = 0;
            $tot_queue = 0;
            $tot_calls_ses = 0;
            $tot_drops_ses = 0;
            $tot_queue_ses = 0;
            $tot_calls_ses = 0;
            $tot_calls_max = 0;
            $tot_queue_max = 0;
            $tot_calls_max = $mt;
            $tot_drops_date = $mt;
            $tot_queue_date = $mt;
            $qrt_calls = $mt;
            $t_imeqrt_drops = $mt;
            $qrt_queue = $mt;
            $qrt_calls_sec = $mt;
            $qrt_drops_sec = $mt;
            $qrt_queue_sec = $mt;
            $qrt_calls_avg = $mt;
            $qrt_drops_avg = $mt;
            $qrt_queue_avg = $mt;
            $qrt_calls_max = $mt;
            $qrt_drops_max = $mt;
            $qrt_queue_max = $mt;
            $tot_abandons_date = $mt;
            $tot_answers_date = $mt;
            $tot_answers = 0;
            $tot_agents = 0;
            $tot_abandons = 0;
            $tot_answers_sec = 0;
            $tot_abandons_sec = 0;
            $tot_answers_speed = 0;
            $tot_statuses = array();
            $f_tot_answers = 0;
            if(!isset($ag) && !$ag) {
                $ag = [];
            }
            $f_tot_agents = count(array_count_values($ag));
            $f_tot_abandons = 0;
            $f_tot_answers_sec = 0;
            $f_tot_abandons_sec = 0;
            $f_tot_answers_sec = 0;
            $j = 0;
            //not get result//
            $tot_calls_sec_date = $tot_agents_date = $tot_drops_sec_date = $tot_queue_sec_date = [];
            while ($j < $tot_intervals) {
                $tot_abandons_date[$j] = 0;
                $tot_abandons_sec_date[$j] = 0;
                $tot_answers_date[$j] = 0;
                $tot_answers_sec_date[$j] = 0;
                $tot_answers_speed_date[$j] = 0;
                $i = 0;
                $agents_array = array();
                if(isset($list)) {
                    while ($i < $list_cnt) {
                        if (($at[$i] >= $time_array['day_start'][$j]) and ( $at[$i] <= $time_array['dayend'][$j])) {
                            $tot_calls++;
                            $tot_calls_ses = ($tot_calls_ses + $ls[$i]);
                            $tot_calls_sec_date[$j] = ((isset($tot_calls_sec_date[$j]) ? $tot_calls_sec_date[$j] : 0 ) + $ls[$i]);
                            $tot_calls_max[$j] = isset($tot_calls_max[$j]) ? $tot_calls_max[$j]+1 : 1;
                            if (isset($ag[$i]) &&  $ag[$i] != "VDCL" && $ag[$i] != "") { $tot_agents_date[$j][$ag[$i]] = isset($tot_agents_date[$j][$ag[$i]]) ? $tot_agents_date[$j][$ag[$i]] +1 : 1; }
                            
                            $tot_statuses[$st[$i]] = isset( $tot_statuses[$st[$i]]) ? $tot_statuses[$st[$i]]+1 : 1;
                            $tot_statuses_date[$j][$st[$i]] = isset( $tot_statuses_date[$j][$st[$i]] ) ? $tot_statuses_date[$j][$st[$i]] +1 : 1;

                            if ($tot_calls_ses < $ls[$i]) { $tot_calls_ses = $ls[$i]; }
                            if ((isset($qrt_calls_max[$j]) ? $qrt_calls_max[$j] : 0 ) < $ls[$i]) { isset($qrt_calls_max[$j]) ? $qrt_calls_max[$j] : $qrt_calls_max[$j]  = $ls[$i]; }
                            if (preg_match('/ABANDON|NOAGENT|QUEUETIMEOUT|AFTERHOURS|MAXCALLS/', $tr[$i])) {
                                $tot_abandons_date[$j] ++;
                                $tot_abandons_sec_date[$j]+=$ls[$i];
                                $f_tot_abandons++;
                                $f_tot_abandons_sec+=$ls[$i];
                            } else {
                                $tot_answers_date[$j] ++;
                                if (($ls[$i] - $qs[$i] - 15) > 0) {
                                    $tot_answers_sec_date[$j]+=($ls[$i] - $qs[$i] - 15);
                                    $f_tot_answers_sec+=($ls[$i] - $qs[$i] - 15);
                                }
                                $tot_answers_speed_date[$j]+=$qs[$i];
                                $f_tot_answers++;
                                $f_tot_answers_sec+=$qs[$i];
                            }
                            if (preg_match('/DROP/', $st[$i])) {
                                $tot_drops++;
                                $tot_drops_ses = ($tot_drops_ses + $ls[$i]);
                                $tot_drops_sec_date[$j] = ((isset($tot_drops_sec_date[$j]) ? $tot_drops_sec_date[$j] : 0) + $ls[$i]);
                                $tot_drops_date[$j] = isset($tot_drops_date[$j] ) ? $tot_drops_date[$j]+1 : 1 ;
                            }
                            if ($qs[$i] > 0) {
                                $tot_queue++;
                                $tot_queue_ses = ($tot_queue_ses + $qs[$i]);
                                $tot_queue_sec_date[$j] = ((isset($tot_queue_sec_date[$j] ) ? $tot_queue_sec_date[$j] : 0) + $qs[$i]);
                                $tot_queue_date[$j] = isset($tot_queue_date[$j] ) ? $tot_queue_date[$j]+1 : 1 ;
                            }
                        }

                        $i++;
                    }
                    $j++;
                }
            }
            
            //till here
            $graph_stats = array();
            $mtd_graph_stats = array();
            $wtd_graph_stats = array();
            $qtd_graph_stats = array();
            $da = 0; $wa = 0; $ma = 0; $qa = 0;
            $tot_calss_wtd = 0;
            $tot_answers_wtd = 0;
            $tot_agents_wtd = 0; $agents_wtd_array = array();
            $tot_answers_sec_wtd = 0;
            $tot_answers_speed_wtd = 0;
            $tot_abandons_wtd = 0;
            $tot_abandons_sec_wtd = 0;
            $tot_statuses_wtd = array();

            $tot_calss_mtd = 0;
            $tot_answers_mtd = 0;
            $tot_agents_mtd = 0; $agents_mtd_array = array();
            $tot_answers_sec_mtd = 0;
            $tot_answers_speed_mtd = 0;
            $tot_abandons_mtd = 0;
            $tot_abandons_sec_mtd = 0;
            $tot_statuses_mtd = array();

            $tot_calls_qtd = 0;
            $tot_answers_qtd = 0;
            $tot_agents_qtd = 0; $agents_qtd_array = array();
            $tot_answers_sec_qtd = 0;
            $tot_answers_speed_qtd = 0;
            $tot_abandons_qtd = 0;
            $tot_abandons_sec_qtd = 0;
            $tot_statuses_qtd = array();
                
            $d = 0;
            while ($d < $tot_intervals) {
                if (isset($tot_drops_date[$d]) && $tot_drops_date[$d] < 1) { $tot_drops_date[$d] = 0; }
                if (isset($tot_queue_date[$d]) && $tot_queue_date[$d] < 1) { $tot_queue_date[$d] = 0; }
                if (isset($tot_calls_max[$d]) && $tot_calls_max[$d] < 1) { $tot_calls_max[$d] = 0; }
                
                if(!isset($tot_calls_max[$d])) { $tot_calls_max[$d] = 0 ; }
                if(!isset($tot_drops_date[$d])) { $tot_drops_date[$d] = 0 ; }
                if(!isset($tot_queue_date[$d])) { $tot_queue_date[$d] = 0 ; }
                if(!isset($tot_drops_sec_date[$d])) { $tot_drops_sec_date[$d] = 0 ; }
                if(!isset($tot_queue_sec_date[$d])) { $tot_queue_sec_date[$d] = 0 ; }
                if(!isset($tot_calls_sec_date[$d])) { $tot_calls_sec_date[$d] = 0 ; }
                
                $tot_drops_pct_date[$d] = round(( $this->MathZDC($tot_drops_date[$d], $tot_calls_max[$d]) * 100), 2);
                $tot_queue_pct_date[$d] = round(( $this->MathZDC($tot_queue_date[$d], $tot_calls_max[$d]) * 100), 2);
                $tot_drops_pct_date[$d] = $this->MathZDC($tot_drops_sec_date[$d], $tot_drops_date[$d]);
                $tot_queue_avg_date[$d] = $this->MathZDC($tot_queue_sec_date[$d], $tot_queue_date[$d]);
                $tot_queue_tot_date[$d] = $this->MathZDC($tot_queue_sec_date[$d], $tot_calls_max[$d]);
                $tot_calls_avg_date[$d] = $this->MathZDC($tot_calls_sec_date[$d], $tot_calls_max[$d]);

                $tot_time_m = $this->MathZDC($tot_calls_sec_date[$d], 60);
                $tot_time_m_int = round($tot_time_m, 2);
                $tot_time_m_int = intval("$tot_time_m");
                $tot_time_s = ($tot_time_m - $tot_time_m_int);
                $tot_time_s = ($tot_time_s * 60);
                $tot_time_s = round($tot_time_s, 0);
                if ($tot_time_s < 10) { $tot_time_s = "0$tot_time_s"; }

                $tot_abandons_pct_date[$d] = $this->MathZDC(100 * $tot_abandons_date[$d], $tot_calls_max[$d]);
                $tot_abandons_avg_time[$d] = round($this->MathZDC($tot_abandons_sec_date[$d], $tot_abandons_date[$d]));
                $tot_answers_avgspeed_time[$d] = round($this->MathZDC($tot_answers_speed_date[$d], $tot_answers_date[$d]));
                $tot_answers_avg_time[$d] = round($this->MathZDC($tot_answers_sec_date[$d], $tot_answers_date[$d]));
                $tot_answers_talk_time[$d] = $tot_answers_sec_date[$d];
                $tot_answers_wrap_time[$d] = $tot_answers_date[$d] * 15;
                $tot_answers_tot_time[$d] = $tot_answers_sec_date[$d] + ($tot_answers_date[$d] * 15);
                if (date("w", strtotime($time_array['day_start'][$d])) == 0 && date("w", strtotime($time_array['day_start'][$d - 1])) != 0 && $d > 0) {  # 2nd date/"w" check is for DST
                    $tot_agents_wtd = count(array_count_values($agents_wtd_array));
                    $tot_abandons_pctwtd = ($tot_calss_wtd > 0) ? round((100 * $tot_abandons_wtd / $tot_calss_wtd), 2) : round(0.0, 2);
                    $tot_abandons_avg_time_wtd = ($tot_abandons_wtd > 0) ? round($tot_abandons_sec_wtd / $tot_abandons_wtd) : 0;
                    $tot_answers_avgspeed_time_wtd = ($tot_answers_wtd > 0) ? round($tot_answers_speed_wtd / $tot_answers_wtd) : 0;
                    $tot_answers_avg_time_wtd = ($tot_answers_wtd > 0) ? round($tot_answers_sec_wtd / $tot_answers_wtd) : 0;
                    $tot_answers_talk_time_wtd = $tot_answers_sec_wtd;
                    $tot_answers_wrap_time_wtd = ($tot_answers_wtd * 15);
                    $tot_answers_tot_time_wtd = ($tot_answers_sec_wtd + ($tot_answers_wtd * 15));

                    $week = date("W", strtotime($time_array['dayend'][$d - 1]));
                    $year = substr($time_array['dayend'][$d - 1], 0, 4);
                    $wtd_graph_stats[$wa]['date_time_range'] = "Week $week, $year";
                    $wtd_graph_stats[$wa]['t_calls_offer'] = trim($tot_calss_wtd);
                    $wtd_graph_stats[$wa]['t_calls_answer'] = trim($tot_answers_wtd);
                    $wtd_graph_stats[$wa]['t_agents_answer'] = trim($tot_agents_wtd);
                    $wtd_graph_stats[$wa]['t_calls_abondon'] = trim($tot_abandons_wtd);
                    $wtd_graph_stats[$wa]['t_abondon_per'] = trim($tot_abandons_pctwtd);
                    $wtd_graph_stats[$wa]['t_abondon_time'] = trim($tot_abandons_avg_time_wtd); // convert it into i:s
                    $wtd_graph_stats[$wa]['a_answer_speed'] = trim($tot_answers_avgspeed_time_wtd); // convert it into i:s
                    $wtd_graph_stats[$wa]['a_talk_time'] = trim($tot_answers_avg_time_wtd); // convert it into i:s
                    $wtd_graph_stats[$wa]['t_talk_time'] = trim($tot_answers_talk_time_wtd); // convert it into H:i:s
                    $wtd_graph_stats[$wa]['t_wrap_time'] = trim($tot_answers_wrap_time_wtd); // convert it into H:i:s
                    $wtd_graph_stats[$wa]['t_call_time'] = trim($tot_answers_tot_time_wtd); // convert it into H:i:s
                    for ($s = 0; $s < count($status_array); $s++) {
                        $key = strtoupper(substr($status_array[$s][0], 1, -1));
                        $wtd_graph_stats[$wa][$key] = $tot_statuses_wtd[$status_array[$s][0]];
                    }
                    $wa++;
                    $tot_calss_wtd = 0;
                    $tot_answers_wtd = 0;
                    $agents_wtd_array = array();
                    $tot_answers_sec_wtd = 0;
                    $tot_answers_speed_wtd = 0;
                    $tot_abandons_wtd = 0;
                    $tot_abandons_sec_wtd = 0;
                    $tot_statuses_wtd = array();
                }
                if (date("d", strtotime($time_array['day_start'][$d])) == 1 && $d > 0 && date("d", strtotime($time_array['day_start'][$d - 1])) != 1) {

                    $tot_agents_mtd = count(array_count_values($agents_mtd_array));
                    $tot_abandons_pctmtd = ($tot_calss_mtd > 0) ? round((100 * $tot_abandons_mtd / $tot_calss_mtd), 2) : 0.0;
                    $tot_abandons_avg_time_mtd = ($tot_abandons_mtd > 0) ? round($tot_abandons_sec_mtd / $tot_abandons_mtd) : 0;
                    $tot_answers_avgspeed_time_mtd = ($tot_answers_mtd > 0) ? round($tot_answers_speed_mtd / $tot_answers_mtd) : 0;
                    $tot_answers_avg_time_mtd = ($tot_answers_mtd > 0) ? round($tot_answers_sec_mtd / $tot_answers_mtd) : 0;
                    $tot_answers_talk_time_mtd = $tot_answers_sec_mtd;
                    $tot_answers_wrap_time_mtd = ($tot_answers_mtd * 15);
                    $tot_answers_tot_time_mtd = ($tot_answers_sec_mtd + ($tot_answers_mtd * 15));
                    $month = date("F", strtotime($time_array['dayend'][$d - 1]));
                    $year = substr($time_array['dayend'][$d - 1], 0, 4);
                    $mtd_graph_stats[$ma]['date_time_range'] = "$month $year";
                    $mtd_graph_stats[$ma]['t_calls_offer'] = trim($tot_calss_mtd);
                    $mtd_graph_stats[$ma]['t_calls_answer'] = trim($tot_answers_mtd);
                    $mtd_graph_stats[$ma]['t_agents_answer'] = trim($tot_agents_mtd);
                    $mtd_graph_stats[$ma]['t_calls_abondon'] = trim($tot_abandons_mtd);
                    $mtd_graph_stats[$ma]['t_abondon_per'] = trim($tot_abandons_pctmtd);
                    $mtd_graph_stats[$ma]['t_abondon_time'] = trim($tot_abandons_avg_time_mtd); // convert it into i:s
                    $mtd_graph_stats[$ma]['a_answer_speed'] = trim($tot_answers_avgspeed_time_mtd); // convert it into i:s
                    $mtd_graph_stats[$ma]['a_talk_time'] = trim($tot_answers_avg_time_mtd); // convert it into i:s
                    $mtd_graph_stats[$ma]['t_talk_time'] = trim($tot_answers_talk_time_mtd); // convert it into H:i:s
                    $mtd_graph_stats[$ma]['t_wrap_time'] = trim($tot_answers_wrap_time_mtd); // convert it into H:i:s
                    $mtd_graph_stats[$ma]['t_call_time'] = trim($tot_answers_tot_time_mtd); // convert it into H:i:s
                    for ($s = 0; $s < count($status_array); $s++) {
                        $key = strtoupper(substr($status_array[$s][0], 1, -1));
                        $mtd_graph_stats[$ma][$key] = $tot_statuses_mtd[$status_array[$s][0]];
                    }

                    $ma++;
                    $tot_calss_mtd = 0;
                    $tot_answers_mtd = 0;
                    $agents_mtd_array = array();
                    $tot_answers_sec_mtd = 0;
                    $tot_answers_speed_mtd = 0;
                    $tot_abandons_mtd = 0;
                    $tot_abandons_sec_mtd = 0;
                    $tot_statuses_mtd = array();
                    if (date("m", strtotime($time_array['day_start'][$d])) == 1 || date("m", strtotime($time_array['day_start'][$d])) == 4 || date("m", strtotime($time_array['day_start'][$d])) == 7 || date("m", strtotime($time_array['day_start'][$d])) == 10) { # Quarterly line
                        $tot_agents_qtd = count(array_count_values($agents_qtd_array));
                        $tot_abandons_pctqtd = ($tot_calls_qtd > 0) ? round((100 * $tot_abandons_qtd / $tot_calls_qtd), 2) : round(0.0, 2);
                        $tot_abandons_avg_time_qtd = ($tot_abandons_qtd > 0) ? round($tot_abandons_sec_qtd / $tot_abandons_qtd) : 0;
                        $tot_answers_avgspeed_time_qtd = ($tot_answers_qtd > 0) ? round($tot_answers_speed_qtd / $tot_answers_qtd) : 0;
                        $tot_answers_avg_time_qtd = ($tot_answers_qtd > 0) ? round($tot_answers_sec_qtd / $tot_answers_qtd) : 0;
                        $tot_answers_talk_time_qtd = $tot_answers_sec_qtd;
                        $tot_answers_wrap_time_qtd = ($tot_answers_qtd * 15);
                        $tot_answers_tot_time_qtd = ($tot_answers_sec_qtd + ($tot_answers_qtd * 15));

                        $month = date("m", strtotime($time_array['dayend'][$d]));
                        $year = substr($time_array['dayend'][$d], 0, 4);
                        $qtr4 = array('01', '02', '03');
                        $qtr1 = array('04', '05', '06');
                        $qtr2 = array('07', '08', '09');
                        $qtr3 = array('10', '11', '12');
                        if (in_array($month, $qtr1)) { $qtr = "1st"; } else if (in_array($month, $qtr2)) { $qtr = "2nd"; } else if (in_array($month, $qtr3)) { $qtr = "3rd"; } else if (in_array($month, $qtr4)) { $qtr = "4th"; }

                        $qtd_graph_stats[$qa]['date_time_range'] = "$qtr quarter, $year";
                        $qtd_graph_stats[$qa]['t_calls_offer'] = trim($tot_calls_qtd);
                        $qtd_graph_stats[$qa]['t_calls_answer'] = trim($tot_answers_qtd);
                        $qtd_graph_stats[$qa]['t_agents_answer'] = trim($tot_agents_qtd);
                        $qtd_graph_stats[$qa]['t_calls_abondon'] = trim($tot_abandons_qtd);
                        $qtd_graph_stats[$qa]['t_abondon_per'] = trim($tot_abandons_pctqtd);
                        $qtd_graph_stats[$qa]['t_abondon_time'] = trim($tot_abandons_avg_time_qtd); // convert it into i:s
                        $qtd_graph_stats[$qa]['a_answer_speed'] = trim($tot_answers_avgspeed_time_qtd); // convert it into i:s
                        $qtd_graph_stats[$qa]['a_talk_time'] = trim($tot_answers_avg_time_qtd); // convert it into i:s
                        $qtd_graph_stats[$qa]['t_talk_time'] = trim($tot_answers_talk_time_qtd); // convert it into H:i:s
                        $qtd_graph_stats[$qa]['t_wrap_time'] = trim($tot_answers_wrap_time_qtd); // convert it into H:i:s
                        $qtd_graph_stats[$qa]['t_call_time'] = trim($tot_answers_tot_time_qtd); // convert it into H:i:s
                        for ($s = 0; $s < count($status_array); $s++) {
                            $key = strtoupper(substr($status_array[$s][0], 1, -1));
                            $qtd_graph_stats[$qa][$key] = $tot_statuses_qtd[$status_array[$s][0]];
                        }
                        $qa++;
                        $tot_calls_qtd = 0;
                        $tot_answers_qtd = 0;
                        $agents_qtd_array = array();
                        $tot_answers_sec_qtd = 0;
                        $tot_answers_speed_qtd = 0;
                        $tot_abandons_qtd = 0;
                        $tot_abandons_sec_qtd = 0;
                        $tot_statuses_qtd = array();
                    }
                }

                $tot_agents_day_count = isset($tot_agents_date[$d]) ? count($tot_agents_date[$d]) : 0;
                $tot_agents_day = isset($tot_agents_date[$d]) ? count($tot_agents_date[$d]) : 0;

                if ($tot_agents_day_count > 0) {
                    $temp_agent_array = array_keys($tot_agents_date[$d]);
                    for ($x = 0; $x < count($temp_agent_array); $x++) {
                        if ($temp_agent_array[$x] != "") {
                            array_push($agents_wtd_array, $temp_agent_array[$x]);
                            array_push($agents_mtd_array, $temp_agent_array[$x]);
                            array_push($agents_qtd_array, $temp_agent_array[$x]);
                        }
                    }
                }

                $tot_calss_wtd+=$tot_calls_max[$d];
                $tot_answers_wtd+=$tot_answers_date[$d];
                $tot_answers_sec_wtd+=$tot_answers_sec_date[$d];
                $tot_answers_speed_wtd+=$tot_answers_speed_date[$d];
                $tot_abandons_wtd+=$tot_abandons_date[$d];
                $tot_abandons_sec_wtd+=$tot_abandons_sec_date[$d];
                $tot_calss_mtd+=$tot_calls_max[$d];
                $tot_answers_mtd+=$tot_answers_date[$d];
                $tot_answers_sec_mtd+=$tot_answers_sec_date[$d];
                $tot_answers_speed_mtd+=$tot_answers_speed_date[$d];
                $tot_abandons_mtd+=$tot_abandons_date[$d];
                $tot_abandons_sec_mtd+=$tot_abandons_sec_date[$d];
                $tot_calls_qtd+=$tot_calls_max[$d];
                $tot_answers_qtd+=$tot_answers_date[$d];
                $tot_answers_sec_qtd+=$tot_answers_sec_date[$d];
                $tot_answers_speed_qtd+=$tot_answers_speed_date[$d];
                $tot_abandons_qtd+=$tot_abandons_date[$d];
                $tot_abandons_sec_qtd+=$tot_abandons_sec_date[$d];


                $graph_stats[$d]['date_time_range'] = $time_array['day_start'][$d]." - ".$time_array['dayend'][$d];
                $graph_stats[$d]['t_calls_offer'] = trim($tot_calls_max[$d]);
                $graph_stats[$d]['t_calls_answer'] = trim($tot_answers_date[$d]);
                $graph_stats[$d]['t_agents_answer'] = trim($tot_agents_day);
                $graph_stats[$d]['t_calls_abondon'] = trim($tot_abandons_date[$d]);
                $graph_stats[$d]['t_abondon_per'] = trim($tot_abandons_pct_date[$d]);
                $graph_stats[$d]['t_abondon_time'] = trim($tot_abandons_avg_time[$d]); // convert it into i:s
                $graph_stats[$d]['a_answer_speed'] = trim($tot_answers_avgspeed_time[$d]); // convert it into i:s
                $graph_stats[$d]['a_talk_time'] = trim($tot_answers_avg_time[$d]); // convert it into i:s
                $graph_stats[$d]['t_talk_time'] = trim($tot_answers_talk_time[$d]); // convert it into H:i:s
                $graph_stats[$d]['t_wrap_time'] = trim($tot_answers_wrap_time[$d]); // convert it into H:i:s
                $graph_stats[$d]['t_call_time'] = trim($tot_answers_tot_time[$d]); // convert it into H:i:s
                for ($s = 0; $s < count($status_array); $s++) {
                    $tot_statuses_wtd[$status_array[$s][0]] = isset($tot_statuses_wtd[$status_array[$s][0]]) ? $tot_statuses_wtd[$status_array[$s][0]] + ( isset($tot_statuses_date[$d][substr($status_array[$s][0], 1, -1)]) ? $tot_statuses_date[$d][substr($status_array[$s][0], 1, -1)] : 0 ) : 0; 
                    $tot_statuses_mtd[$status_array[$s][0]] = isset($tot_statuses_mtd[$status_array[$s][0]]) ? $tot_statuses_mtd[$status_array[$s][0]] + ( isset($tot_statuses_date[$d][substr($status_array[$s][0], 1, -1)]) ? $tot_statuses_date[$d][substr($status_array[$s][0], 1, -1)] : 0 ) : 0; 
                    $tot_statuses_qtd[$status_array[$s][0]] = isset($tot_statuses_qtd[$status_array[$s][0]]) ? $tot_statuses_qtd[$status_array[$s][0]] + ( isset($tot_statuses_date[$d][substr($status_array[$s][0], 1, -1)]) ? $tot_statuses_date[$d][substr($status_array[$s][0], 1, -1)] : 0 ) : 0; 
                    $graph_stats[$d]['t_call_time'] = trim($tot_answers_tot_time[$d]);
                    $key = strtoupper(substr($status_array[$s][0], 1, -1));
                    $disposition_key[$key] = $status_array[$s][1];
                    $graph_stats[$d][$key] = isset($tot_statuses_date[$d][substr($status_array[$s][0], 1, -1)]) ? $tot_statuses_date[$d][substr($status_array[$s][0], 1, -1)] : 0 ;
                }
                $d++;
            }
            
            $tot_drops_pct = round(($this->MathZDC($tot_drops, $tot_calls) * 100), 2);
            $tot_queue_pct = round(( $this->MathZDC($tot_queue, $tot_calls) * 100), 2);
            $tot_drops_avg = $this->MathZDC($tot_drops_ses, $tot_drops);
            $tot_queue_avg = $this->MathZDC($tot_queue_ses, $tot_queue);
            $tot_queue_tot = $this->MathZDC($tot_queue_ses, $tot_calls);
            $tot_calls_avg = $this->MathZDC($tot_calls_ses, $tot_calls);

            $tot_time_m = $this->MathZDC($tot_calls_ses, 60);
            $tot_time_m_int = round($tot_time_m, 2);
            $tot_time_m_int = intval("$tot_time_m");
            $tot_time_s = ($tot_time_m - $tot_time_m_int);
            $tot_time_s = ($tot_time_s * 60);
            $tot_time_s = round($tot_time_s, 0);
            if ($tot_time_s < 10) { $tot_time_s = "0$tot_time_s"; }
            if (date("w", strtotime($time_array['day_start'][$d - 1])) > 0) {
                $tot_agents_wtd = count(array_count_values($agents_wtd_array));
                $tot_abandons_pctwtd = ($tot_calss_wtd > 0) ? round((100 * $tot_abandons_wtd / $tot_calss_wtd), 2) : round(0.0, 2);
                $tot_abandons_avg_time_wtd = ($tot_abandons_wtd > 0) ? round($tot_abandons_sec_wtd / $tot_abandons_wtd) : 0;
                $tot_answers_avgspeed_time_wtd = ($tot_answers_wtd > 0) ? round($tot_answers_speed_wtd / $tot_answers_wtd) : 0;
                $tot_answers_avg_time_wtd = ($tot_answers_wtd > 0) ? round($tot_answers_sec_wtd / $tot_answers_wtd) : 0;
                $tot_answers_talk_time_wtd = $tot_answers_sec_wtd;
                $tot_answers_wrap_time_wtd = ($tot_answers_wtd * 15);
                $tot_answers_tot_time_wtd = ($tot_answers_sec_wtd + ($tot_answers_wtd * 15));

                $week = date("W", strtotime($time_array['dayend'][$d - 1]));
                    $year = substr($time_array['dayend'][$d - 1], 0, 4);

                $wtd_graph_stats[$wa]['date_time_range'] = "Week $week, $year";
                $wtd_graph_stats[$wa]['t_calls_offer'] = trim($tot_calss_wtd);
                $wtd_graph_stats[$wa]['t_calls_answer'] = trim($tot_answers_wtd);
                $wtd_graph_stats[$wa]['t_agents_answer'] = trim($tot_agents_wtd);
                $wtd_graph_stats[$wa]['t_calls_abondon'] = trim($tot_abandons_wtd);
                $wtd_graph_stats[$wa]['t_abondon_per'] = trim($tot_abandons_pctwtd);
                $wtd_graph_stats[$wa]['t_abondon_time'] = trim($tot_abandons_avg_time_wtd); // convert it into i:s
                $wtd_graph_stats[$wa]['a_answer_speed'] = trim($tot_answers_avgspeed_time_wtd); // convert it into i:s
                $wtd_graph_stats[$wa]['a_talk_time'] = trim($tot_answers_avg_time_wtd); // convert it into i:s
                $wtd_graph_stats[$wa]['t_talk_time'] = trim($tot_answers_talk_time_wtd); // convert it into H:i:s
                $wtd_graph_stats[$wa]['t_wrap_time'] = trim($tot_answers_wrap_time_wtd); // convert it into H:i:s
                $wtd_graph_stats[$wa]['t_call_time'] = trim($tot_answers_tot_time_wtd); // convert it into H:i:s
                for ($s = 0; $s < count($status_array); $s++) {
                    $key = strtoupper(substr($status_array[$s][0], 1, -1));
                    $wtd_graph_stats[$wa][$key] = $tot_statuses_wtd[$status_array[$s][0]];
                }
                $wa++;
                $tot_calss_wtd = 0;
                $tot_answers_wtd = 0;
                $agents_wtd_array = array();
                $tot_answers_sec_wtd = 0;
                $tot_answers_speed_wtd = 0;
                $tot_abandons_wtd = 0;
                $tot_abandons_sec_wtd = 0;
            }
            
            if (date("d", strtotime($time_array['day_start'][$d - 1])) !== 1) {
                $tot_agents_mtd = count(array_count_values($agents_mtd_array));
                $tot_abandons_pctmtd = ($tot_calss_mtd > 0) ? round((100 * $tot_abandons_mtd / $tot_calss_mtd), 2) : 0.0;
                $tot_abandons_avg_time_mtd = ($tot_abandons_mtd > 0) ? round($tot_abandons_sec_mtd / $tot_abandons_mtd) : 0;
                $tot_answers_avgspeed_time_mtd = ($tot_answers_mtd > 0) ? round($tot_answers_speed_mtd / $tot_answers_mtd) : 0;
                $tot_answers_avg_time_mtd = ($tot_answers_mtd > 0) ? round($tot_answers_sec_mtd / $tot_answers_mtd) : 0;
                $tot_answers_talk_time_mtd = $tot_answers_sec_mtd;
                $tot_answers_wrap_time_mtd = ($tot_answers_mtd * 15);
                $tot_answers_tot_time_mtd = ($tot_answers_sec_mtd + ($tot_answers_mtd * 15));
                $month = date("F", strtotime($time_array['dayend'][$d - 1]));
                $year = substr($time_array['dayend'][$d - 1], 0, 4);
                $mtd_graph_stats[$ma]['date_time_range'] = "$month $year";
                $mtd_graph_stats[$ma]['t_calls_offer'] = trim($tot_calss_mtd);
                $mtd_graph_stats[$ma]['t_calls_answer'] = trim($tot_answers_mtd);
                $mtd_graph_stats[$ma]['t_agents_answer'] = trim($tot_agents_mtd);
                $mtd_graph_stats[$ma]['t_calls_abondon'] = trim($tot_abandons_mtd);
                $mtd_graph_stats[$ma]['t_abondon_per'] = trim($tot_abandons_pctmtd);
                $mtd_graph_stats[$ma]['t_abondon_time'] = trim($tot_abandons_avg_time_mtd); // convert it into i:s
                $mtd_graph_stats[$ma]['a_answer_speed'] = trim($tot_answers_avgspeed_time_mtd); // convert it into i:s
                $mtd_graph_stats[$ma]['a_talk_time'] = trim($tot_answers_avg_time_mtd); // convert it into i:s
                $mtd_graph_stats[$ma]['t_talk_time'] = trim($tot_answers_talk_time_mtd); // convert it into H:i:s
                $mtd_graph_stats[$ma]['t_wrap_time'] = trim($tot_answers_wrap_time_mtd); // convert it into H:i:s
                $mtd_graph_stats[$ma]['t_call_time'] = trim($tot_answers_tot_time_mtd); // convert it into H:i:s
                for ($s = 0; $s < count($status_array); $s++) {
                    $key = strtoupper(substr($status_array[$s][0], 1, -1));
                    $mtd_graph_stats[$ma][$key] = $tot_statuses_mtd[$status_array[$s][0]];
                }
                $tot_calss_mtd = 0;
                $tot_answers_mtd = 0;
                $agents_mtd_array = array();
                $tot_answers_sec_mtd = 0;
                $tot_answers_speed_mtd = 0;
                $tot_abandons_mtd = 0;
                $tot_abandons_sec_mtd = 0;

                $tot_agents_qtd = count(array_count_values($agents_qtd_array));
                $tot_abandons_pctqtd = ($tot_calls_qtd > 0) ? round((100 * $tot_abandons_qtd / $tot_calls_qtd), 2) : round(0.0, 2);
                $tot_abandons_avg_time_qtd = ($tot_abandons_qtd > 0) ? round($tot_abandons_sec_qtd / $tot_abandons_qtd) : 0;
                $tot_answers_avgspeed_time_qtd = ($tot_answers_qtd > 0) ? round($tot_answers_speed_qtd / $tot_answers_qtd) : 0;
                $tot_answers_avg_time_qtd = ($tot_answers_qtd > 0) ? round($tot_answers_sec_qtd / $tot_answers_qtd) : 0;
                $tot_answers_talk_time_qtd = $tot_answers_sec_qtd;
                $tot_answers_wrap_time_qtd = ($tot_answers_qtd * 15);
                $tot_answers_tot_time_qtd = ($tot_answers_sec_qtd + ($tot_answers_qtd * 15));

                $month = date("m", strtotime($time_array['dayend'][$d - 1]));
                $year = substr($time_array['dayend'][$d - 1], 0, 4);
                $qtr1 = array('01', '02', '03');
                $qtr2 = array('04', '05', '06');
                $qtr3 = array('07', '08', '09');
                $qtr4 = array('10', '11', '12');
                if (in_array($month, $qtr1)) {
                    $qtr = "1st";
                } else if (in_array($month, $qtr2)) {
                    $qtr = "2nd";
                } else if (in_array($month, $qtr3)) {
                    $qtr = "3rd";
                } else if (in_array($month, $qtr4)) {
                    $qtr = "4th";
                }
                $qtd_graph_stats[$qa]['date_time_range'] = "$qtr quarter, $year";
                $qtd_graph_stats[$qa]['t_calls_offer'] = trim($tot_calls_qtd);
                $qtd_graph_stats[$qa]['t_calls_answer'] = trim($tot_answers_qtd);
                $qtd_graph_stats[$qa]['t_agents_answer'] = trim($tot_agents_qtd);
                $qtd_graph_stats[$qa]['t_calls_abondon'] = trim($tot_abandons_qtd);
                $qtd_graph_stats[$qa]['t_abondon_per'] = trim($tot_abandons_pctqtd);
                $qtd_graph_stats[$qa]['t_abondon_time'] = trim($tot_abandons_avg_time_qtd); // convert it into i:s
                $qtd_graph_stats[$qa]['a_answer_speed'] = trim($tot_answers_avgspeed_time_qtd); // convert it into i:s
                $qtd_graph_stats[$qa]['a_talk_time'] = trim($tot_answers_avg_time_qtd); // convert it into i:s
                $qtd_graph_stats[$qa]['t_talk_time'] = trim($tot_answers_talk_time_qtd); // convert it into H:i:s
                $qtd_graph_stats[$qa]['t_wrap_time'] = trim($tot_answers_wrap_time_qtd); // convert it into H:i:s
                $qtd_graph_stats[$qa]['t_call_time'] = trim($tot_answers_tot_time_qtd); // convert it into H:i:s
                for ($s = 0; $s < count($status_array); $s++) {
                    $key = strtoupper(substr($status_array[$s][0], 1, -1));
                    $qtd_graph_stats[$qa][$key] = $tot_statuses_qtd[$status_array[$s][0]];
                }
                $tot_calls_qtd = 0;
                $tot_answers_qtd = 0;
                $agents_qtd_array = array();
                $tot_answers_sec_qtd = 0;
                $tot_answers_speed_qtd = 0;
                $tot_abandons_qtd = 0;
                $tot_abandons_sec_qtd = 0;
            }
            $dynamic_key = array_keys($wtd_graph_stats[0]);
            array_shift($dynamic_key);
            $dynamic_key_max = array_chunk($dynamic_key, 11);

            $max_graph_array = $max_wtd_array = $max_mtd_array = $max_qtd_array = array();
            foreach ($dynamic_key_max[0] as $key => $val) {
                if (count($graph_stats) > 0) {
                    $max_graph_array[$val] = max(array_map(function($item)use($val) { return $item["$val"]; }, $graph_stats));
                }
                if (count($wtd_graph_stats) > 0) {
                    $max_wtd_array[$val] = max(array_map(function($item)use($val) { return $item["$val"]; }, $wtd_graph_stats));
                }
                if (count($mtd_graph_stats) > 0) {
                    $max_mtd_array[$val] = max(array_map(function($item)use($val) { return $item["$val"]; }, $mtd_graph_stats));
                }
                if (count($qtd_graph_stats) > 0) {
                    $max_qtd_array[$val] = max(array_map(function($item)use($val) { return $item["$val"]; }, $qtd_graph_stats));
                }
            }
            $check_temp_array = array("a_answer_speed", "a_talk_time");
            $cnt = 0;
            foreach ($dynamic_key as $key => $val) {
                if ($val == "t_abondon_per") { $tot_graph_array[$val] = !empty($tot_graph_array['t_calls_abondon'] && $tot_graph_array['t_calls_offer']) ? (round((($tot_graph_array['t_calls_abondon'] / $tot_graph_array['t_calls_offer']) * 100), 2)) : 0; } 
                elseif ($val == "t_agents_answer") { $tot_graph_array[$val] = $f_tot_agents; } 
                elseif ($val == "t_abondon_time") { $tot_graph_array[$val] = !empty ($tot_abandons_sec_date && $tot_graph_array['t_calls_abondon']) ? (round((array_sum($tot_abandons_sec_date) / $tot_graph_array['t_calls_abondon']))) : 0; } 
                elseif ($val == "a_talk_time") { $tot_graph_array[$val] = !empty($tot_graph_array['t_calls_answer'] && $graph_stats) ? round(array_sum(array_map(function($item) { return $item['t_talk_time']; }, $graph_stats)) / $tot_graph_array['t_calls_answer']) : 0; }
                elseif ($val == "a_answer_speed") { $tot_graph_array[$val] = !empty($tot_answers_speed_date && $tot_graph_array['t_calls_answer']) ? (round(array_sum($tot_answers_speed_date) / $tot_graph_array['t_calls_answer'])) : 0; } 
                else { $tot_graph_array[$val] = array_sum(array_map(function($item)use($val) { return $item["$val"]; }, $graph_stats)); }
                if (!in_array($val, $dynamic_key_max[0])) {
                    $dispostion_status_array[$cnt]['status'] = $val;
                    $dispostion_status_array[$cnt]['description'] = $disposition_key[$val];
                    $dispostion_status_array[$cnt]['total'] = $tot_graph_array[$val];
                    $cnt++;
                }
            }
            
            $headerArray = array("dateTimeRange" => "DATE/TIME RANGE", "t_calls_offer" => "TOTAL CALLS OFFERED", "t_calls_answer" => "TOTAL CALLS ANSWERED",
                "t_agents_answer" => "TOTAL AGENTS ANSWERED", "t_calls_abondon" => "TOTAL CALLS ABANDONED", "t_abondon_per" => "TOTAL ABANDON PERCENT", "t_abondon_time" => "AVG ABANDON TIME",
                "a_answer_speed" => "AVG ANSWER SPEED", "a_talk_time" => "AVG TALK TIME", "t_talk_time" => "TOTAL TALK TIME", "t_wrap_time" => "TOTAL WRAP TIME", "t_call_time" => "TOTAL CALL TIME");
            
            $dyn_cnt = count($dynamic_key);
            $i = 0;
            while($i < $dyn_cnt){
                $dynamic_key[$i] = isset($headerArray[$dynamic_key[$i]]) ? $headerArray[$dynamic_key[$i]] :  $dynamic_key[$i];
                $i++;
            }
            $arr[] = 'SHIFT DATE/TIME RANGE';
            $dynamic_key = array_merge($arr, $dynamic_key);
            
            $result_arr = array(
                "hour_array" => $graph_stats, "weekly_array" => $wtd_graph_stats, "mnthly_array" => $mtd_graph_stats, "qutrly_array" => $qtd_graph_stats,
                "max_hour" => $max_graph_array , "max_weekly" => $max_wtd_array, "max_mnthly" => $max_mtd_array, "max_qutrly" => $max_qtd_array,
                'total_arry' => $tot_graph_array, "dispostion_status_array" => $dispostion_status_array, 'header_array' => $dynamic_key
            );
            
//            print_r($result_arr);die;
            $check_temp_array = array("t_calls_offer", "t_calls_answer", "t_agents_answer", "t_calls_abondon", "t_abondon_per", "t_abondon_time", "a_answer_speed", "a_talk_time", "t_talk_time", "t_wrap_time", "t_call_time");
            $convert_to_hour_array = array('t_abondon_time', 'a_answer_speed', 'a_abondon_time', 't_call_time', 't_wrap_time', 't_talk_time');
            $multihrlyhtml = [];
            if (count($graph_stats) > 0) {
                for ($i = 0; $i < count($graph_stats); $i++) {
                    foreach ($check_temp_array as $key => $val) {
                        $val_text = $graph_stats[$i][$val];
                        if (in_array($val, $convert_to_hour_array)) {
                            $hour = floor($this->MathZDC($val_text, 3600));
                            $val_text = (($hour <= 9) ? "0$hour" : $hour).date(":i:s", mktime(00, 00, $val_text));
                        }
                        $max = ($max_graph_array[$val] < 1) ? 1 : $max_graph_array[$val];
                        $width = (($graph_stats[$i][$val] / $max) * 100).'%';
                        if (in_array(trim($val), $check_temp_array)) {
                            $multihrlyhtml[$val][$i]['date'] = $graph_stats[$i]['date_time_range'];
                            $multihrlyhtml[$val][$i]['width'] = $width;
                            $multihrlyhtml[$val][$i]['value'] = (($val == 't_abondon_per') ? number_format($val_text, 2).'%' : $val_text);
                        } else { 
                            $multihrlyhtml[$val][$i]['date'] = $graph_stats[$i]['date_time_range'];
                            $multihrlyhtml[$val][$i]['width'] = $width;
                            $multihrlyhtml[$val][$i]['value'] = $val_text; }
                    }
                }
            }
            
            foreach ($multihrlyhtml as $key => $value ) {
                $i = 0;
                foreach ($value as $ky => $vle ) {
                    $res_hrly_html[$i][$key] =  $vle['width'];
                    $i++;
                }
            }

            $multiweeklyhtml = [];
            if (count($wtd_graph_stats) > 0) {
                for ($i = 0; $i < count($wtd_graph_stats); $i++) {
                    foreach ($check_temp_array as $key => $val) {
                        $val_text = $wtd_graph_stats[$i][$val];
                        if (in_array($val, $convert_to_hour_array)) {
                            $hour = floor($this->MathZDC($val_text, 3600));
                            $val_text = (($hour <= 9) ? "0$hour" : $hour).date(":i:s", mktime(00, 00, $val_text));
                        }
                        $max = ($max_wtd_array[$val] < 1) ? 1 : $max_wtd_array[$val];
                        $width = (($wtd_graph_stats[$i][$val] / $max) * 100).'%';
                        if (in_array(trim($val), $check_temp_array)) {
                            $multiweeklyhtml[$val][$i]['date'] = $wtd_graph_stats[$i]['date_time_range'];
                            $multiweeklyhtml[$val][$i]['width'] = $width;
                            $multiweeklyhtml[$val][$i]['value'] = (($val == 't_abondon_per') ? number_format($val_text, 2).'%' : $val_text);
                        } else { 
                            $multiweeklyhtml[$val][$i]['date'] = $wtd_graph_stats[$i]['date_time_range'];
                            $multiweeklyhtml[$val][$i]['width'] = $width;
                            $multiweeklyhtml[$val][$i]['value'] = $val_text; }
                    }
                }
            }
            
            foreach ($multiweeklyhtml as $key => $value ) {
                $i = 0;
                foreach ($value as $ky => $vle ) {
                    $res_weekly_html[$i][$key] =  $vle['width'];
                    $i++;
                }
            }
            $multimtdhtml = [];
            if (count($mtd_graph_stats) > 0) {
                for ($i = 0; $i < count($mtd_graph_stats); $i++) {
                    foreach ($check_temp_array as $key => $val) {
                        $val_text = $mtd_graph_stats[$i][$val];
                        if (in_array($val, $convert_to_hour_array)) {
                            $hour = floor($this->MathZDC($val_text, 3600));
                            $val_text = (($hour <= 9) ? "0$hour" : $hour).date(":i:s", mktime(00, 00, $val_text));
                        }
                        $max = ($max_mtd_array[$val] < 1) ? 1 : $max_mtd_array[$val];
                        $width = (($mtd_graph_stats[$i][$val] / $max) * 100).'%';
                        if (in_array(trim($val), $check_temp_array)) {
                            $multimtdhtml[$val][$i]['date'] = $mtd_graph_stats[$i]['date_time_range'];
                            $multimtdhtml[$val][$i]['width'] = $width;
                            $multimtdhtml[$val][$i]['value'] = (($val == 't_abondon_per') ? number_format($val_text, 2).'%' : $val_text);
                        } else { 
                            $multimtdhtml[$val][$i]['date'] = $mtd_graph_stats[$i]['date_time_range'];
                            $multimtdhtml[$val][$i]['width'] = $width;
                            $multimtdhtml[$val][$i]['value'] = $val_text; }
                    }
                }
            }
            foreach ($multimtdhtml as $key => $value ) {
                $i = 0;
                foreach ($value as $ky => $vle ) {
                    $res_mtd_html[$i][$key] =  $vle['width'];
                    $i++;
                }
            }
            
            $multiqtdhtml = [];
            if (count($qtd_graph_stats) > 0) {
                for ($i = 0; $i < count($qtd_graph_stats); $i++) {
                    foreach ($check_temp_array as $key => $val) {
                        $val_text = $qtd_graph_stats[$i][$val];
                        if (in_array($val, $convert_to_hour_array)) {
                            $hour = floor($this->MathZDC($val_text, 3600));
                            $val_text = (($hour <= 9) ? "0$hour" : $hour).date(":i:s", mktime(00, 00, $val_text));
                        }
                        $max = ($max_qtd_array[$val] < 1) ? 1 : $max_qtd_array[$val];
                        $width = (($qtd_graph_stats[$i][$val] / $max) * 100).'%';
                        if (in_array(trim($val), $check_temp_array)) {
                            $multiqtdhtml[$val][$i]['date'] = $qtd_graph_stats[$i]['date_time_range'];
                            $multiqtdhtml[$val][$i]['width'] = $width;
                            $multiqtdhtml[$val][$i]['value'] = (($val == 't_abondon_per') ? number_format($val_text, 2).'%' : $val_text);
                        } else { 
                            $multiqtdhtml[$val][$i]['date'] = $qtd_graph_stats[$i]['date_time_range'];
                            $multiqtdhtml[$val][$i]['width'] = $width;
                            $multiqtdhtml[$val][$i]['value'] = $val_text; }
                    }
                }
            }
            foreach ($multiqtdhtml as $key => $value ) {
                $i = 0;
                foreach ($value as $ky => $vle ) {
                    $res_qtd_html[$i][$key] =  $vle['width'];
                    $i++;
                }
            }
            
            $new_graph_stats = $this->arrayToTime($graph_stats,'1');

            $new_wtd_graph_stats = $this->arrayToTime($wtd_graph_stats,'1');
            
            $new_mtd_graph_stats = $this->arrayToTime($mtd_graph_stats,'1');
           
            $new_qtd_graph_stats = $this->arrayToTime($qtd_graph_stats,'1');
            
            $new_max_graph_array = $this->arrayToTime($max_graph_array,'2');
            
            $new_max_wtd_array = $this->arrayToTime($max_wtd_array,'2');
            $new_max_mtd_array = $this->arrayToTime($max_mtd_array,'2');
            $new_max_qtd_array = $this->arrayToTime($max_qtd_array,'2');
            $new_tot_graph_array = $this->arrayToTime($tot_graph_array,'2');

            $date1 = date_create($startdate);
            $date2 = date_create($enddate);
            $diff = date_diff($date1, $date2);
            $diff = $diff->format("%a");
            $date_details = ["startdate"=>$startdate, "enddate"=>$enddate, "diff_date"=>$diff, "startdate"=>$startdate, "select_group"=>$groupText ]; 
            $result_array = array(
                "hour_array" => $new_graph_stats, "weekly_array" => $new_wtd_graph_stats, "mnthly_array" => $new_mtd_graph_stats, "qutrly_array" => $new_qtd_graph_stats,
                "max_hour" => $new_max_graph_array , "max_weekly" => $new_max_wtd_array, "max_mnthly" => $new_max_mtd_array, "max_qutrly" => $new_max_qtd_array,
                'total_arry' => $new_tot_graph_array, "dispostion_status_array" => $dispostion_status_array, 'header_array' => $dynamic_key, "date_details"=>$date_details,
                "multiqtdhtml"=>$res_qtd_html,"multimtdhtml"=>$res_mtd_html,"multiweeklyhtml"=>$res_weekly_html,"multihrlyhtml"=>$res_hrly_html
            );
            $download_csv = $request->input('download_csv');
            if($download_csv == "yes") {
                return $result_array;
            }
            return response()->json([
                    'status'=>200,    
                    'message' => 'Successfully.',
                    'data'=>$result_array
                ]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }
    
    /**
     * convert time array.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param type $array
     * @return $new_array
     * @throws \App\Http\Controllers\Report\Exception
     */
    public function arrayToTime($array,$int) {
        try {
            $new_array = []; 
            if($int == '1') {
                foreach ($array as $k => $v) {
                    $v['t_abondon_per'] = $v['t_abondon_per']."%";
                    $v['t_abondon_time'] = $this->secConvert($v['t_abondon_time'], 'H');
                    $v['a_answer_speed'] = $this->secConvert($v['a_answer_speed'], 'H');
                    $v['a_talk_time'] = $this->secConvert($v['a_talk_time'], 'H');
                    $v['t_talk_time'] = $this->secConvert($v['t_talk_time'], 'H');
                    $v['t_wrap_time'] = $this->secConvert($v['t_wrap_time'], 'H');
                    $v['t_call_time'] = $this->secConvert($v['t_call_time'], 'H');
                    $new_array[] = $v;
                }   
            } else {
                $v = $array;
                $v['t_abondon_per'] = $v['t_abondon_per']."%";
                $v['t_abondon_time'] = $this->secConvert($v['t_abondon_time'], 'H');
                $v['a_answer_speed'] = $this->secConvert($v['a_answer_speed'], 'H');
                $v['a_talk_time'] = $this->secConvert($v['a_talk_time'], 'H');
                $v['t_talk_time'] = $this->secConvert($v['t_talk_time'], 'H');
                $v['t_wrap_time'] = $this->secConvert($v['t_wrap_time'], 'H');
                $v['t_call_time'] = $this->secConvert($v['t_call_time'], 'H');
                $new_array[] = $v;
            }
            return $new_array;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }
    
    /**
     * CSV download for inbound daily report.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param Request $request
     * @return type
     * @throws \App\Http\Controllers\Report\Exception
     */
    public function csvInboundDailyReport(Request $request) {
        try {
            $data = $this->inboundDailyReport($request);
            $null = [];
            $filename = "Inbound Daily Report".date('Y-m-dh:i:s').".csv";
            $handle = fopen($filename, 'w+');
            $row= ['Time Range '.($data["date_details"]["diff_date"] + 1).' days-'.$data["date_details"]["startdate"].' 00:00:00 to '.$data["date_details"]["enddate"].' 23:59:59'];
            fputcsv($handle, $row, ";", '"');
            
            $row= ['DAILY RPT- '.$data["date_details"]["startdate"].' 00:00:00 to '.$data["date_details"]["enddate"].' 23:59:59'];
            fputcsv($handle, $row, ";", '"');
            fputcsv($handle, $null, ";", '"');
            fputcsv($handle, $data["header_array"], ";", '"');
            foreach ($data["hour_array"] as $key => $val) { 
                fputcsv($handle, $val, ";", '"');
            }
            $array = ["Total"];
            $final_result_arr= array_merge($array,$data["total_arry"][0]);
            fputcsv($handle, $final_result_arr, ";", '"');
            fputcsv($handle, $null, ";", '"');
            
            $row= ['WEEK-TO-DATE RPT '.$data["date_details"]["startdate"].' 00:00:00 to '.$data["date_details"]["enddate"].' 23:59:59'];
            fputcsv($handle, $row, ";", '"');
            fputcsv($handle, $data["header_array"], ";", '"');
            foreach ($data["weekly_array"] as $key => $val) { 
                fputcsv($handle, $val, ";", '"');
            }
            fputcsv($handle, $final_result_arr, ";", '"');
            fputcsv($handle, $null, ";", '"');
            
            $row= ['MONTH-TO-DATE RPT '.$data["date_details"]["startdate"].' 00:00:00 to '.$data["date_details"]["enddate"].' 23:59:59'];
            fputcsv($handle, $row, ";", '"');
            fputcsv($handle, $data["header_array"], ";", '"');
            foreach ($data["mnthly_array"] as $key => $val) { 
                fputcsv($handle, $val, ";", '"');
            }
            fputcsv($handle, $final_result_arr, ";", '"');
            fputcsv($handle, $null, ";", '"');
            
            $row= ['QUARTER-TO-DATE RPT- '.$data["date_details"]["startdate"].' 00:00:00 to '.$data["date_details"]["enddate"].' 23:59:59'];
            fputcsv($handle, $row, ";", '"');
            fputcsv($handle, $data["header_array"], ";", '"');
            foreach ($data["qutrly_array"] as $key => $val) { 
                fputcsv($handle, $val, ";", '"');
            }
            fputcsv($handle, $final_result_arr, ";", '"');
            fputcsv($handle, $null, ";", '"');
            
            $row= ['STATUS','DESCRIPTION','CALLS'];
            fputcsv($handle, $row, ";", '"');
            $total = 0;
            foreach ($data["dispostion_status_array"] as $key => $val) { 
                fputcsv($handle, $val, ";", '"');
                $total = $total + $val["total"];
            }
            $row= ['Total','',$total];
            fputcsv($handle, $row, ";", '"');
            
            fputcsv($handle, $null, ";", '"');
            
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
    
    
    /**
     * Inbound did report 
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param Request $request
     * @return type
     * @throws \App\Http\Controllers\Report\Exception
     */
    public function inboundDidReport(Request $request) {
        try {
            date_default_timezone_set('America/Los_Angeles');
            $now_date = date("Y-m-d");
            $now_time = date("Y-m-d H:i:s");
            $startdate = $request->input('startdate');
            $enddate = $request->input('enddate');
            $shift = $request->input('shift');
            $reportdisplaytype = $request->input('reportdisplaytype');
            $selectedgroups = $request->input('selectedgroups');
            
            
            $time_begin = "00:00:00";
            $time_end = "23:59:59";
            if ($shift == 'AM') {
                $time_begin = "00:00:00";
                $time_end = "11:59:59";
            }
            if ($shift == 'PM') {

                $time_begin = "12:00:00";
                $time_end = "23:59:59";
            }
            if ($shift == 'ALL') {
                $time_begin = "00:00:00";
                $time_end = "23:59:59";
            }
            if ($shift == 'DAYTIME') {
                $time_begin = "08:45:00";
                $time_end = "00:59:59";
            }
            if ($shift == '10AM-6PM') {
                $time_begin = "10:00:00";
                $time_end = "17:59:59";
            }
            if ($shift == '9AM-1AM') {
                $time_begin = "09:00:00";
                $time_end = "00:59:59";
            }
            if ($shift == '845-1745') {
                $time_begin = "08:45:00";
                $time_end = "17:44:59";
            }
            if ($shift == '1745-100') {
                $time_begin = "17:45:00";
                $time_end = "00:59:59";
            }
            $query_date_begin = "$startdate $time_begin";
            $query_date_end = "$enddate $time_end";
            
            $sq_date_ary = explode(' ', $query_date_begin);
            $sq_day_ary = explode('-', $sq_date_ary[0]);
            $sq_time_ary = explode(':', $sq_date_ary[1]);
            $eq_date_ary = explode(' ', $query_date_end);
            $eq_day_ary = explode('-', $eq_date_ary[0]);
            $eq_time_ary = explode(':', $eq_date_ary[1]);

            $sq_epoch_day = mktime(0, 0, 0, $sq_day_ary[1], $sq_day_ary[2], $sq_day_ary[0]);
            $sq_epoch = mktime($sq_time_ary[0], $sq_time_ary[1], $sq_time_ary[2], $sq_day_ary[1], $sq_day_ary[2], $sq_day_ary[0]);
            $eq_epoch = mktime($eq_time_ary[0], $eq_time_ary[1], $eq_time_ary[2], $eq_day_ary[1], $eq_day_ary[2], $eq_day_ary[0]);

            $sq_sec = ( ($sq_time_ary[0] * 3600) + ($sq_time_ary[1] * 60) + ($sq_time_ary[2] * 1) );
            $eq_sec = ( ($eq_time_ary[0] * 3600) + ($eq_time_ary[1] * 60) + ($eq_time_ary[2] * 1) );

            $duration_sec = ($eq_epoch - $sq_epoch);
            $duration_day = intval(($duration_sec / 86400) + 1);

            if (($eq_sec < $sq_sec) and ( $duration_day < 1)) {
                $eq_epoch = ($sq_epoch_day + ($eq_sec + 86400) );
                $query_date_end = date("Y-m-d H:i:s", $eq_epoch);
                $duration_day++;
            }
            $top_line = "Time range $duration_day days: $query_date_begin to $query_date_end";
            $basic_array = array("topline" => $top_line, "now_time" => $now_time, "Now_date" => $now_date);
            $d = 0;
            while ($d < $duration_day) {
                $dsq_epoch = ($sq_epoch + ($d * 86400) );
                $d_eq_epoch = ($sq_epoch_day + ($eq_sec + ($d * 86400) ) );

                if ($eq_sec < $sq_sec) {
                    $d_eq_epoch = ($d_eq_epoch + 86400);
                }

                $day_start[$d] = date("Y-m-d H:i:s", $dsq_epoch);
                $day_end[$d] = date("Y-m-d H:i:s", $d_eq_epoch);

                $d++;
            }

            ##########################################################################
            #########  CALCULATE ALL OF THE 15-MINUTE PERIODS NEEDED FOR ALL DAYS ####
            ### BUILD HOUR:MIN DISPLAY ARRAY ###
            $i = 0;
            $h = 4;
            $j = 0;
            $z_hour = 1;
            $active_time = 0;
            $hour = ($sq_time_ary[0] - 1);
            $start_sec = ($sq_sec - 900);
            $end_sec = ($sq_sec - 1);
            if ($sq_time_ary[1] > 14) {
                $h = 1;
                $hour++;
                if ($hour < 10) { $hour = "0$hour"; }
            }
            if ($sq_time_ary[1] > 29) { $h = 2; }
            if ($sq_time_ary[1] > 44) { $h = 3; }
            while ($i < 96) {
                $start_sec = ($start_sec + 900);
                $end_sec = ($end_sec + 900);
                $time = '      ';
                if ($h >= 4) {
                    $hour++;
                    if ($z_hour == '00') {
                        $start_sec = 0;
                        $end_sec = 899;
                    }
                    $h = 0;
                    if ($hour < 10) { $hour = "0$hour"; }
                    $s_time = "$hour:00";
                    $e_time = "$hour:15";
                    $time = "+$s_time-$e_time+";
                }
                if ($h == 1) {
                    $s_time = "$hour:15";
                    $e_time = "$hour:30";
                    $time = " $s_time-$e_time ";
                }
                if ($h == 2) {
                    $s_time = "$hour:30";
                    $e_time = "$hour:45";
                    $time = " $s_time-$e_time ";
                }
                if ($h == 3) {
                    $z_hour = $hour;
                    $z_hour++;
                    if ($z_hour < 10) { $z_hour = "0$z_hour"; }
                    if ($z_hour == 24) { $z_hour = "00"; }
                    $s_time = "$hour:45";
                    $e_time = "$z_hour:00";
                    $time = " $s_time-$e_time ";
                    if ($z_hour == '00') { $hour = ($z_hour - 1); }
                }

                if (( ($start_sec >= $sq_sec) and ( $end_sec <= $eq_sec) and ( $eq_sec > $sq_sec) ) or ( ($start_sec >= $sq_sec) and ( $eq_sec < $sq_sec) ) or ( ($end_sec <= $eq_sec) and ( $eq_sec < $sq_sec) )) {
                    $hm_display[$j] = $time;
                    $hm_start[$j] = $s_time;
                    $hm_end[$j] = $e_time;
                    $hm_sepoch[$j] = $start_sec;
                    $hm_eepoch[$j] = $end_sec;

                    $j++;
                }

                $h++;
                $i++;
            }
            $tot_intervals = $j;
            ### GRAB ALL RECORDS WITHIN RANGE FROM THE DATABASE ###
            $selectedid = VicidialInboundDid::select('did_id')->whereIn('did_pattern', $selectedgroups)->orderBy('did_id','DESC')->get();
            $looparray = [];
            if(isset($selectedid)){
                $selectedid_cnt =$selectedid->count();
                for ($i = 0; $i < $selectedid_cnt; $i++) {
                    $single_array = $selectedid[$i]->did_id;
                    array_push($looparray, $single_array);
                }
            }
            ### GRAB ALL RECORDS WITHIN RANGE FROM THE DATABASE ###
            $list = VicidialDidLog::select(DB::raw('extension,unix_timestamp(call_date) As call_date'))->whereIn('did_id',$looparray)->whereBetween('call_date',[$query_date_begin,$query_date_end])->get();
            
            $looparray = $dt = [];
            $extension[0] = '';
            $list_cnt = 0;
            if(isset($list)){
                $list_cnt = $list->count();
                for ($i = 0; $i < $list_cnt; $i++) {
                    $dt[$i] = 0;
                    $call_date = $list[$i]->call_date;
                    $ut[$i] = ($call_date - $sq_epoch_day);
                    $extension[$i] = $list[$i]->extension;
                    while ($ut[$i] >= 86400) {
                        $ut[$i] = ($ut[$i] - 86400);
                        $dt[$i] ++;
                    }
                    if (($ut[$i] <= $eq_sec) and ( $eq_sec < $sq_sec)) {
                        $dt[$i] = ($dt[$i] - 1);
                    }
                }
            }   
            ##############################First Table ##################################
            $first_table_max_calls = $first_table_total_calls = 0;
            $defaultroute = VicidialInboundDid::select("did_route")->where('did_pattern', 'default')->orderBy('did_id','DESC')->get();
            if(isset($defaultroute)){
                $default_route = $defaultroute[0]->did_route;
            }
            
            if (strlen($extension[0]) > 0) {
                $stats_array = $this->array_group_count($extension, 'desc');
                $stats_array_ct = count($stats_array);

                $d = 0;
                $max_calls = 1; $total_calls = 0;
                while ($d < $stats_array_ct) {
                    $stat_description = ' *** default *** ';
                    $stat_route = $default_route;

                    $stat_record_array = explode(' ', $stats_array[$d]);
                    $stat_count = ($stat_record_array[0] + 0);
                    $stat_pattern = $stat_record_array[1];

                    if ($stat_count > $max_calls) { $max_calls = $stat_count; }

                    //$stmt = $dbCon->selectQuery("did_description,did_route",VICIDIALINBOUNDDIDS,"did_pattern IN($stat_pattern)");
                    $stmt = VicidialInboundDid::select("did_description","did_route")->where('did_pattern', $stat_pattern)->get();
                    
                    if(isset($stmt)) {
                        $stat_description = $stmt[0]->did_description;
                        $stat_route = $stmt[0]->did_route;
                    }

                    $first_table[$d]['did_id'] = $stat_pattern;
                    $first_table[$d]['did_description'] = $stat_description;
                    $first_table[$d]['did_route'] = $stat_route;
                    $first_table[$d]['calls'] = $stat_count;
                    $total_calls = $total_calls + $stat_count;
                    $d++;
                }
                $first_table_max_calls = $max_calls;
                $first_table_total_calls = $total_calls;
            }
            
            ### PARSE THROUGH ALL RECORDS AND GENERATE STATS ###
            //$mt=array();
            $mt[0] = '0';
            $tot_calls = 0;
            $tot_calls_max = 0;
            $tot_calls_date = $mt;
            $qrt_calls = $mt;
            $qrt_calls_avg = $mt;
            $qrt_calls_max = $mt;
            $tot_calls_sec_date = $mt;
            $j = 0;
            while ($j < $tot_intervals) {
                $jd__0[$j] = 0; $jd_20[$j] = 0; $jd_40[$j] = 0; $jd_60[$j] = 0; $jd_80[$j] = 0; $jd100[$j] = 0; $jd120[$j] = 0; $jd121[$j] = 0;
                $Phd__0[$j] = 0; $Phd_20[$j] = 0; $Phd_40[$j] = 0; $Phd_60[$j] = 0; $Phd_80[$j] = 0; $Phd100[$j] = 0; $Phd120[$j] = 0; $Phd121[$j] = 0;
                $qrt_calls[$j] = 0; $qrt_calls_max[$j] = 0;
                $i = 0;
                
                while ($i < $list_cnt) {
                    if (($ut[$i] >= $hm_sepoch[$j]) and ( $ut[$i] <= $hm_eepoch[$j])) {
                        $tot_calls = isset($tot_calls) ? $tot_calls+1 : 1;
                        $qrt_calls[$j] = isset($qrt_calls[$j]) ? $qrt_calls[$j]+1 : 1;
                        $dtt = $dt[$i];
                        $tot_calls_date[$dtt] = isset($tot_calls_date[$dtt]) ? $tot_calls_date[$dtt]+1 : 1;
                        if(!isset($ls[$i])) { $ls[$i]=0; } 
                        if ($tot_calls_max < $ls[$i]) { $tot_calls_max = $ls[$i]; }
                        if ($qrt_calls_max[$j] < $ls[$i]) { $qrt_calls_max[$j] = $ls[$i]; }
                        
                        if(!isset($qs[$i])) { $qs[$i]=0; } 
                        if ($qs[$i] == 0) { isset($hd__0[$j]) ? $hd__0[$j]+ 1 : 1; }
                        if (($qs[$i] > 0) and ( $qs[$i] <= 20)) { isset($hd_20[$j]) ? $hd_20[$j]+ 1 : 1;}
                        if (($qs[$i] > 20) and ( $qs[$i] <= 40)) { isset($hd_40[$j]) ? $hd_40[$j]+ 1 : 1; }
                        if (($qs[$i] > 40) and ( $qs[$i] <= 60)) { isset($hd_60[$j]) ? $hd_60[$j]+ 1 : 1;}
                        if (($qs[$i] > 60) and ( $qs[$i] <= 80)) { isset($hd_80[$j]) ? $hd_80[$j]+ 1 : 1;}
                        if (($qs[$i] > 80) and ( $qs[$i] <= 100)) { isset($hd100[$j]) ? $hd100[$j]+ 1 : 1;}
                        if (($qs[$i] > 100) and ( $qs[$i] <= 120)) { isset($hd120[$j]) ? $hd120[$j]+ 1 : 1;}
                        if ($qs[$i] > 120) { isset($hd121[$j]) ? $hd121[$j]+ 1 : 1; }
                    }

                    $i++;
                }

                $j++;
            }
            
            $d = 0;
            $max_calls = 1;
            $max_calls1 = 0;
            $graph_stats = array();
            $data_summery = array();
            while ($d < $duration_day) {
                //echo $tot_calls_date;die;
                if(!isset($tot_calls_date[$d])) { $tot_calls_date[$d] = 0;} 
                if ($tot_calls_date[$d] < 1) { $tot_calls_date[$d] = 0; }
                
                if(!isset($tot_calls_sec_date[$d])) { $tot_calls_sec_date[$d] = 0;}
                if ($tot_calls_sec_date[$d] > 0) {
                    $tot_calls_avg_date[$d] = ($tot_calls_sec_date[$d] / $tot_calls_date[$d]);

                    $tot_time_m = ($tot_calls_sec_date[$d] / 60);
                    $tot_time_m_int = round($tot_time_m, 2);
                    $tot_time_m_int = intval("$tot_time_m");
                    $tot_time_s = ($tot_time_m - $tot_time_m_int);
                    $tot_time_s = ($tot_time_s * 60);
                    $tot_time_s = round($tot_time_s, 0);
                    if ($tot_time_s < 10) { $tot_time_s = "0$tot_time_s"; }
                    $tot_time_ms = "$tot_time_m_int:$tot_time_s";
                    $tot_time_ms = sprintf("%8s", $tot_time_ms);
                } else {
                    $tot_calls_avg_date[$d] = 0;
                    $tot_time_ms = '        ';
                }

                if ($tot_calls_date[$d] < 1) { $tot_calls_date[$d] = ''; }
                $tot_calls_date[$d] = $tot_calls_date[$d];

                if ($tot_calls_date[$d] > $max_calls1) { $max_calls1 = $tot_calls_date[$d]; }
                $graph_stats[$d][0] = isset($tot_calls_date[$d]) ? $tot_calls_date[$d] : 0  + 0;
                $graph_stats[$d][1] = substr($day_start[$d], 0, 10);
                //print_r($graph_stats);die;
                $single_array = array('start_date' => $graph_stats[$d][1], 'end_date' => $day_end[$d], 'total_call' => $tot_calls_date[$d]);
                array_push($data_summery, $single_array);
                $d++;
            }
            for ($d = 0; $d < count($graph_stats); $d++) {
                $f_tot_calls = isset($tot_calls) ? $tot_calls : 0;
            }//end frist
            array_push($looparray, $f_tot_calls);
            #########  HOLD TIME, CALL AND DROP STATS 15-MINUTE INCREMENTS ####
            $i = 0;
            $hi_hour_count = 0;
            $hi_hold_count = 0;

            while ($i < $tot_intervals) {
                if(!isset($qrt_calls_sec[$i])) {$qrt_calls_sec[$i]= 0;}
                if(!isset($qrt_calls[$i])) {$qrt_calls[$i]= 0;}
                
                if ($qrt_calls[$i] > 0) { $qrt_calls_avg[$i] = ($qrt_calls_sec[$i] / $qrt_calls[$i]); }

                if ($qrt_calls[$i] > $hi_hour_count) { $hi_hour_count = $qrt_calls[$i]; }

                $i++;
            }

            if ($hi_hour_count < 1) { $hour_multiplier = 0; } else { $hour_multiplier = (70 / $hi_hour_count); }
            if ($hi_hold_count < 1) { $hold_multiplier = 0; } else { $hold_multiplier = (70 / $hi_hold_count); }

            

            $k = 1;
            $mk = 0;
            $call_scale = '0';
            $tmp_scale_num = 0;
            while ($k <= 72) {
                if (($k < 1) or ( $hour_multiplier <= 0)) { $scale_num = 70; } else {
                    $tmp_scale_num = (73 / $hour_multiplier);
                    $tmp_scale_num = round($tmp_scale_num, 0);
                    $scale_num = ($k / $hour_multiplier);
                    $scale_num = round($scale_num, 0);
                }
                $tmpscl = "$call_scale$tmp_scale_num";

                if (($mk >= 4) or ( strlen($tmpscl) == 73)) {
                    $mk = 0;
                    $len_scale_num = (strlen($scale_num));
                    $k = ($k + $len_scale_num);
                    $call_scale .= "$scale_num";
                } else {
                    $call_scale .= " ";
                    $k++; $mk++;
                }
            }
            $k = 1;
            $mk = 0;
            $hold_scale = '0';
            while ($k <= 72) {
                if (($k < 1) or ( $hold_multiplier <= 0)) { $scale_num = 70; } else {
                    $tmp_scale_num = (73 / $hold_multiplier);
                    $tmp_scale_num = round($tmp_scale_num, 0);
                    $scale_num = ($k / $hold_multiplier);
                    $scale_num = round($scale_num, 0);
                }
                $tmpscl = "$hold_scale$tmp_scale_num";

                if (($mk >= 4) or ( strlen($tmpscl) == 73)) {
                    $mk = 0;
                    $len_scale_num = (strlen($scale_num));
                    $k = ($k + $len_scale_num);
                    $hold_scale .= "$scale_num";
                } else {
                    $hold_scale .= " ";
                    $k++; $mk++;
                }
            }
            $call_scale = explode(' ', $call_scale);
            $intervals = array();
            $qrtot_calls = array();
            $qrtot_drops = array();
            $i = 0;
            $qrt_queue_avg = $qrt_queue_max = $qrt_drops = [];
            while ($i < $tot_intervals) {
                $char_counter = 0;
                ### BEGIN HOLD TIME TOTALS GRAPH ###
                $g_hour_count = $qrt_calls[$i];
                if ($g_hour_count > 0) { $no_lines_yet = 0; }
                if(!isset($qrt_queue_avg[$i])) { $qrt_queue_avg[$i] = 0 ;} 
                if(!isset($qrt_queue_max[$i])) { $qrt_queue_max[$i] = 0 ;} 
                $Gavg_hold = isset($qrt_queue_avg[$i]) ? $qrt_queue_avg[$i] : 0 ; 
                if ($Gavg_hold < 1) {
                    if ($i < 0) {
                        $do_nothing = 1;
                    } else {
                        $tot_lines = isset($tot_lines) ? $tot_lines+1 : 1;
                        $qrt_queue_avg[$i] = $qrt_queue_avg[$i];
                        $qrt_queue_max[$i] = $qrt_queue_max[$i];
                    }
                } else {
                    $tot_lines++;
                    $no_lines_yet = 0;
                    $x_avg_hold = ($Gavg_hold * $hold_multiplier);
                    $x_avg_hold = (19 - $x_avg_hold);

                    $qrt_queue_avg[$i] =  $qrt_queue_avg[$i];
                    $qrt_queue_max[$i] =  $qrt_queue_max[$i];
                }
                ### END HOLD TIME TOTALS GRAPH ###
                
                $char_counter = 0;
                ### BEGIN CALLS TOTALS GRAPH ###
                $g_hour_count = $qrt_calls[$i];
                if ($g_hour_count < 1) {
                    if ($i < 0) {
                        $do_nothing = 1;
                    } else {
                        if ($qrt_calls[$i] < 1) { $qrt_calls[$i] = ''; }
                        $qrt_calls[$i] = $qrt_calls[$i];

//                        $k = 0; while ($k <= 72) { $ASCII_text.=" "; $k++; }
                    }
                } else {
                    $no_lines_yet = 0;
                    $x_hour_count = ($g_hour_count * $hour_multiplier);
                    $y_hour_count = (69 - $x_hour_count);

                    $g_drop_count = isset($qrt_drops[$i]) ? $qrt_drops[$i] : 0;
                    if ($g_drop_count < 1) {
                        if ($qrt_calls[$i] < 1) { $qrt_calls[$i] = ''; }
                        $qrt_calls[$i] = $qrt_calls[$i];
                    } else {
                        $x_drop_count = ($g_drop_count * $hour_multiplier);
                        $xx_drop_count = ( ($x_hour_count - $x_drop_count) - 1 );
                        if ($qrt_calls[$i] < 1) { $qrt_calls[$i] = ''; }
                        $qrt_calls[$i] = $qrt_calls[$i];
                        $qrt_drops[$i] = $qrt_drops[$i];
                    }
                }
                ### END CALLS TOTALS GRAPH ###
                $graph_stats[$i][0] = $hm_display[$i];
                $graph_stats[$i][1] = trim($qrt_calls[$i]);
                $graph_stats[$i][2] = trim(isset($qrt_drops[$i]) ? $qrt_drops[$i] : null);
                $single_array1 = array("hm_display" => $graph_stats[$i][0], "qrt_calls" => $graph_stats[$i][1], "qrt_drops" => $graph_stats[$i][2]);

                array_push($intervals, $single_array1);

                if (trim($qrt_calls[$i]) > $max_calls) { $max_calls = $qrt_calls[$i]; }
                $i++;
            }
            
            if(!isset($tot_queue_sec)) { $tot_queue_sec = 0;}
            if(!isset($tot_queue_avg)) { $tot_queue_avg = 0;}
            if(!isset($tot_queue_max)) { $tot_queue_max = 0;}
            if(!isset($tot_drops)) { $tot_drops = 0;}
            if(!isset($tot_calls)) { $tot_calls = 0;}
            if(!isset($tot_calls)) { $tot_calls = 0;}
            if(!isset($first_table)) { $first_table = [];}
            if ($tot_queue_sec > 0) { $tot_queue_avg_raw = ($tot_calls / $tot_queue_sec); } else { $tot_queue_avg_raw = 0; }
            $tot_queue_avg = $tot_queue_avg;
            while (strlen($tot_queue_avg) > 5) { $tot_queue_avg = preg_replace('/.$/', '', $tot_queue_avg); }
            $tot_queue_max = $tot_queue_max;
            while (strlen($tot_queue_max) > 5) { $tot_queue_max = preg_replace('/.$/', '', $tot_queue_max); }
            $tot_drops = $tot_drops;
            $tot_calls = $tot_calls;

            //This section for csv
            $csv_array = array('basic_info' => $basic_array, 'data_summery' => $data_summery, 'call_scale' => $call_scale, 'tot_calls' => $tot_calls, 'hold_time_array' => $intervals, 
                'first_table' => $first_table, 'total_calls' => $first_table_total_calls);
            $result = array('basic_info' => $basic_array, 'first_table' => $first_table, 'data_summery' => $data_summery, 'call_scale' => $call_scale, 'tot_calls' => $tot_calls, 'hold_time_array' => $intervals, 'max_calls' => $max_calls, 'max_calls1' => $max_calls1);
            
            $download_csv = $request->input('download_csv');
            if($download_csv == 'yes'){   # for download csv file .
                return $result;
            }
            
            return response()->json([
                'status' => '200',
                'msg' => "successfully.",
                'data'=> $result
                    ]);
           
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
        
    }
    
    /**
     * Array group count report.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param type $array
     * @param type $sort
     * @return type
     * @throws \App\Http\Controllers\Report\Exception
     */
    function array_group_count($array, $sort = false) {
        try {
            $tally_array = array();

            $i = 0;
            foreach (array_unique($array) as $value) {
                $count = 0;
                foreach ($array as $element) {
                    if ($element == "$value") { $count++; }
                }

                $count = sprintf("%010s", $count);
                $tally_array[$i] = "$count $value";
                $i++;
            }

            if ($sort == 'desc') { rsort($tally_array); } elseif ($sort == 'asc') { sort($tally_array); }

            return $tally_array;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }
    
    
    /**
     * Csv download for inbound did report .
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param Request $request
     * @return type
     * @throws \App\Http\Controllers\Report\Exception
     */
    public function csvInboundDidReport(Request $request) {
        try {
            $result = $this->inboundDidReport($request);
            $null = [];
            $filename = "Inbound_DID_Report".date('Y-m-dh:i:s').".csv";
            $handle = fopen($filename, 'w+');
            $row = ['Inbound DID Report ', $result['basic_info']['now_time']];
            fputcsv($handle, $row, ";", '"');
            
            $row = [$result['basic_info']['topline']];
            fputcsv($handle, $row, ";", '"');
            fputcsv($handle, $null, ";", '"');
            
            $row = ['DID Summary : '];
            fputcsv($handle, $row, ";", '"');
            
            $row = ['DID','DESCRIPTION','ROUTE','CALLS'];
            fputcsv($handle, $row, ";", '"');   
            
            foreach ($result["first_table"] as $key => $val) { 
                fputcsv($handle, $val, ";", '"');
            }
            
            $row = ['Total','','',$result['tot_calls']];
            fputcsv($handle, $row, ";", '"');   
            fputcsv($handle, $null, ";", '"');
            
            $row = [' Date Summary : '];
            fputcsv($handle, $row, ";", '"');   
            
            $row = [' SHIFT','DATE-TIME RANGE','CALLS'];
            fputcsv($handle, $row, ";", '"');   
            
            foreach ($result["data_summery"] as $key => $val) { 
                fputcsv($handle, $val, ";", '"');
            }
            
            $row = ['Total','',$result['tot_calls']];
            fputcsv($handle, $row, ";", '"');   
            fputcsv($handle, $null, ";", '"');
            
            $row = ['HOLD TIME','CALL AND DROP STATS'];
            fputcsv($handle, $row, ";", '"');   
            
            $row = ['TIME 15-MIN INT','TOTAL'];
            fputcsv($handle, $row, ";", '"');   
            
            foreach ($result["hold_time_array"] as $key => $val) { 
                fputcsv($handle, $val, ";", '"');
            }
            
            $row = ['Total',$result['tot_calls']];
            fputcsv($handle, $row, ";", '"');   
            
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
    
    /**
     * Inbound summery report , call details dropdown value .
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @return type
     * @throws \App\Http\Controllers\Report\Exception
     */
    public function inboundCallTime() {
        try {
            $list = VicidialCallTime::select('call_time_id', 'call_time_name')->orderBy('call_time_id')->get();
            return response()->json([
                'status' => '200',
                'msg' => "successfully.",
                'data'=> $list
                    ]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }



    public function inboundIVRReport(Request $request) {
        try {
            
            // if($this->request->data['outbound'] != 'Y') {
            //     if (!in_array(SYSTEM_COMPONENT_REPORT_INBOUND_IVR, $this->AccessControl->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ))) {
            //         throw new ForbiddenException();
            //     }
                
            //     if (isset($this->request->data['selectedgroups'])) {
            //         $this->request->data['selectedgroups'] = $this->AccessControl->getAcceptValue(ACCESS_TYPE_INGROUP, $this->request->data['selectedgroups']);
            //     }
            // } else {
            //     if (!in_array(SYSTEM_COMPONENT_REPORT_OUTBOUND_IVR, $this->AccessControl->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ))) {
            //         throw new ForbiddenException();
            //     }

            //     if (isset($this->request->data['selectedgroups'])) {
            //         $this->request->data['selectedgroups'] = $this->AccessControl->getAcceptValue(ACCESS_TYPE_CAMPAIGN, $this->request->data['selectedgroups']);
            //     }
            // }

            # handle access control for permission 
            # User access control for permission need to check
            # selectedgroups access control for permission need to check
            #         TODO to complete  


            $shift = $request['shift'];
            $query_date = $request['startdate'];
            $query_date = explode(" ", $query_date);
            $query_date = explode("/", $query_date[0]);

            $starttime = $request['starttime'];
            $endtime = $request['endtime'];

            if ((count($query_date)) > 1) $query_date = $query_date[2]."-".$query_date[0]."-".$query_date[1];
            else $query_date = $query_date[0];

            $end_date = $request['enddate'];
            $end_date = explode(" ", $end_date);
            $end_date = explode("/", $end_date[0]);

            if ((count($end_date)) > 1) $end_date = $end_date[2]."-".$end_date[0]."-".$end_date[1];
            else $end_date = $end_date[0];

            $selectedgroups = $request['selectedgroups'];
            $outbound = $request['outbound'];

            $type = $time_end = $time_begin = '';

            if ($outbound != 'Y') 
            $type = 'inbound';

            $group_string = '|';
            $i = 0;
            $group_ct = count($selectedgroups);
            while ($i < $group_ct) {
                $group_string .= "$selectedgroups[$i]|";
                $i++;
            }
            if ($shift == 'RANGE') {
                $query_date_begin = "$query_date";
                $query_date_end = "$end_date";
            } else {
                $shift_array = array(
                    'AM' => array(
                        '03:45:00',
                        '15:14:59'
                    ),
                    'PM' => array(
                        '15:15:00',
                        '23:15:00'
                    ),
                    'ALL' => array(
                        '00:00:00',
                        '23:59:59'
                    )
                );
                foreach ($shift_array as $key => $value) {
                    if ($shift == $key) {
                        $time_begin = $value[0];
                        $time_end = $value[1];
                    }
                }
                $query_date_begin = "$query_date $time_begin";
                $query_date_end = "$end_date $time_end";
            }

            $tot_flow_total_time = $tot_flow_ivr_time = $unique_callers = $no_caller_id_calls = $total_calls = 0;
            
            $selectedgroups_in = $this->stwc(implode(",", $selectedgroups));


            if ($type == 'inbound') {
                $rslt = LiveInboundLog::whereIn('comment_a', $selectedgroups)
                                    ->whereBetween('start_time', [$query_date_begin, $query_date_end])
                                    ->select(DB::raw('uniqueid, extension, start_time, comment_a, comment_b, comment_d, start_time as ustimex, phone_ext'))
                                    ->orderBy('uniqueid', 'asc')
                                    ->orderBy('start_time', 'asc')
                                    ->get()->toArray();
            } else {

                $rslt = VicidialOutboundIvrLog::whereIn('campaign_id', $selectedgroups)
                                                ->whereBetween('event_date', [$query_date_begin, $query_date_end])
                                                ->select(DB::raw('uniqueid, caller_code, event_date, campaign_id, menu_id, menu_action, event_date as ustimex'))
                                                ->orderBy('uniqueid', 'asc')
                                                ->orderBy('event_date', 'asc')
                                                ->orderBy('menu_action', 'desc')
                                                ->get()->toArray();
            }


            $logs_to_print = count($rslt);
            $p = 0;
            $last_uniqueid = $first_epoch = $last_epoch = [];
            $r = -1;
            $uniqueid = $extension = $start_time = $comment_a = $comment_b = $comment_d = $epoch = $phone_ext = array();
            $result_arr = array(
                'uniqueid' => array(
                    'uniqueid',
                    'uniqueid'
                ),
                'extension' => array(
                    'extension',
                    'caller_code'
                ),
                'start_time' => array(
                    'start_time',
                    'event_date'
                ),
                'comment_a' => array(
                    'comment_a',
                    'campaign_id'
                ),
                'comment_b' => array(
                    'comment_b',
                    'menu_id'
                ),
                'comment_d' => array(
                    'comment_d',
                    'menu_action'
                ),
                'epoch' => array(
                    'ustimex',
                    'ustimex'
                ),
                'phone_ext' => array(
                    'phone_ext',
                    'caller_code'
                )
            );

            $key_array = $unique_calls = []; $unique_caller_ids = '';
            while ($p < $logs_to_print) {
                if ($type == 'inbound') $che = 0;
                else $che = 1;
                foreach ($result_arr as $key => $value) {
                    if ($key == 'epoch') $key1 = strtotime($rslt[$p][$value[$che]]);
                    else $key1 = $rslt[$p][$value[$che]];
                    array_push($$key, $key1);
                }

                $uniqueid[$p] = isset($uniqueid[$p])?$uniqueid[$p]:0;
                $comment_b[$p] = isset($comment_b[$p])?$comment_b[$p]:0;
                $epoch[$p] = isset($epoch[$p])?$epoch[$p]:0;

                if ($last_uniqueid === "$uniqueid[$p]") {
                    $unique_calls[$r] .= "----------$comment_b[$p]";
                    $last_epoch[$r] = $epoch[$p];
                } else {
                    $r++;
                    $caller_id[$r] = $phone_ext[$p];
                    if (strlen($phone_ext[$p]) < 2) {
                        $no_caller_id_calls++;
                    } else {
                        if (!preg_match("/_$phone_ext[$p]_/", $unique_caller_ids)) {
                            $unique_caller_ids .= "_$phone_ext[$p]_";
                            $unique_callers++;
                        }
                    }

                    $first_epoch[$r] = $last_epoch[$r] = $epoch[$p];

                    $unique_calls[$r] = $comment_b[$p];
                    $flow_uniqueid[$r] = $last_uniqueid = "$uniqueid[$p]";
                }
                $p++;
            }

            $raw_unique_calls = $unique_calls;
            if ($logs_to_print > 0) {
                sort($unique_calls);
            }
            ### count each unique call flow
            $last_suniqueid = '';
            $p = -1;
            $s = 0;
            while ($s <= $r) {
                
                if ($last_suniqueid === "$unique_calls[$s]") {
                    $st_unique_calls_count[$p] = isset($st_unique_calls_count[$p])?$st_unique_calls_count[$p]:0;
                    $st_unique_calls_count[$p] ++;
                } else {
                    $p++;
                    $st_unique_calls[$p] = $unique_calls[$s];
                    $last_suniqueid = "$unique_calls[$s]";
                    $st_unique_calls_count[$p] = 1;
                }
                $s++;
            }

            $s = $total_calls = 0;
            $flow_unique_calls_list = array();
            while ($s <= $p) {
                $total_calls = ($total_calls + $st_unique_calls_count[$s]);
                $st_unique_calls_count[$s] = sprintf("%07s", $st_unique_calls_count[$s]);
                $flow_unique_calls[$s] = "$st_unique_calls_count[$s]__________$st_unique_calls[$s]";
                $s++;
            }

            if ($p > 0) {
                rsort($flow_unique_calls);
            }
            ### put call flows and counts together for sorting again
            $ruc_ruc_ct = count($raw_unique_calls);
            $s = 0;
            $total_ivr = array();
            $max_total_avg = $max_ivr_avg = $max_queue_drops_percent = $max_queue_drops = $max_queue_calls = $max_ivr_calls = 1;
            $ivrarray = $queuecallarray = $queuedroparray = $dropcallpercentarray = $ivravgtimearray = $totalavgtimearray = array();

            
            $tot_flow_total = $tot_flow_drop = 0;
            while ($s <= $p) {
                $flow_summary = explode('__________', $flow_unique_calls[$s]);
                $flow_summary[0] = ($flow_summary[0] + 0);
                $flow_unique_calls_list1 = $_flow_ivr_time = $flow_close_time = array();
                $t = 0;
                while ($t < $ruc_ruc_ct) {
                    if ($flow_summary[1] === "$raw_unique_calls[$t]") {
                        array_push($flow_unique_calls_list1, $flow_uniqueid[$t]);
                        if ($last_epoch[$t] <= $first_epoch[$t]) {
                            $last_epoch[$t] = ($first_epoch[$t] + 5);
                        } else {
                            $last_epoch[$t] = ($last_epoch[$t] + 10);
                        }
                        $_flow_ivr_time[$s] = isset($_flow_ivr_time[$s])?$_flow_ivr_time[$s]:0;

                        $_flow_ivr_time[$s] = ($_flow_ivr_time[$s] + ($last_epoch[$t] - $first_epoch[$t]));
                    }
                    $t++;
                }
                array_push($flow_unique_calls_list, $flow_unique_calls_list1);
                $vcl_statuses = $mt = [];
                $flow_drop_pct[$s] = $flow_total[$s] = $flow_drop[$s] = 0;
                $flow_summary = explode('__________', $flow_unique_calls[$s]);
                $flow_summary[0] = ($flow_summary[0] + 0);
                if ($type == 'inbound') {
                    ##### Grab all records for the IVR for the specified time period
                    $rslt = VicidialCloserLog::whereIn('campaign_id', $selectedgroups)
                                                ->whereIn('uniqueid', $flow_unique_calls_list[$s])
                                                ->whereBetween('call_date', [$query_date_begin, $query_date_end])
                                                ->select(DB::raw('status, length_in_sec'))
                                                ->get()->toArray();

                    $vcl_statuses_to_print = count($rslt);
                    $w = 0;
                    while ($w < $vcl_statuses_to_print) {
                        $vcl_statuses[$w] = $rslt[$w]['status'];
                        if ((preg_match('/DROP/', $vcl_statuses[$w])) or ( preg_match('/XDROP/', $vcl_statuses[$w]))) {
                            $flow_drop[$s] ++;
                        }
                        
                        $flow_close_time[$s] = isset($flow_close_time[$s])?$flow_close_time[$s]:0;
                        $flow_close_time[$s] = ($flow_close_time[$s] + $rslt[$w]['length_in_sec']);
                        $flow_total[$s] ++;
                        $w++;
                    }
                }
                $flow_drop_pct[$s] = (($this->MathZDC($flow_drop[$s], $flow_total[$s])) * 100);
                $flow_drop_pct[$s] = round($flow_drop_pct[$s], 2);

                if ($flow_summary[0] > $max_ivr_calls) {
                    $max_ivr_calls = $flow_summary[0];
                }
                if ($flow_total[$s] > $max_queue_calls) {
                    $max_queue_calls = $flow_total[$s];
                }
                if ($flow_drop[$s] > $max_queue_drops) {
                    $max_queue_drops = $flow_drop[$s];
                }
                if ($flow_drop_pct[$s] > $max_queue_drops_percent) {
                    $max_queue_drops_percent = $flow_drop_pct[$s];
                }
                $flow_summary[0] = sprintf("%6s", $flow_summary[0]);
                $flow_total[$s] = sprintf("%6s", $flow_total[$s]);
                $flow_drop[$s] = sprintf("%6s", $flow_drop[$s]);
                $flow_drop_pct[$s] = sprintf("%6s", $flow_drop_pct[$s]);
                $flow_summary[1] = preg_replace('/\-\-\-\-\-\-\-\-\-\-/', ' / ', $flow_summary[1]);

                $flow_total_time[$s]=isset($flow_total_time[$s])?$flow_total_time[$s]:0;

                $flow_close_time[$s]=isset($flow_close_time[$s])?$flow_close_time[$s]:0;

                $flow_total_time[$s] = ($_flow_ivr_time[$s] + $flow_close_time[$s]);

                $avg_flow_ivr_time[$s] = ($_flow_ivr_time[$s] / $flow_summary[0]);
                $avg_flow_ivr_time[$s] = round($avg_flow_ivr_time[$s], 0);
                $avg_flow_ivr_time[$s] = sprintf("%4s", $avg_flow_ivr_time[$s]);
                $avgflow_total_time[$s] = $this->MathZDC($flow_total_time[$s], $flow_summary[0]);
                $avgflow_total_time[$s] = round($avgflow_total_time[$s], 0);
                $avgflow_total_time[$s] = sprintf("%4s", $avgflow_total_time[$s]);

                if (trim($avg_flow_ivr_time[$s]) > $max_ivr_avg) {
                    $max_ivr_avg = trim($avg_flow_ivr_time[$s]);
                }
                if (trim($avgflow_total_time[$s]) > $max_total_avg) {
                    $max_total_avg = trim($avgflow_total_time[$s]);
                }

                $tot_flow_total_time = ($tot_flow_total_time + $flow_total_time[$s]);
                $tot_flow_ivr_time = ($tot_flow_ivr_time + $_flow_ivr_time[$s]);

                $tot_flow_total = isset($tot_flow_total)?$tot_flow_total:0;
                $tot_flow_total = ($tot_flow_total + $flow_total[$s]);

                $tot_flow_drop = isset($tot_flow_drop)?$tot_flow_drop:0;
                $tot_flow_drop = ($tot_flow_drop + $flow_drop[$s]);
                array_push($total_ivr, array(
                    'ivrcalls' => $flow_summary[0],
                    'callstat' => $flow_summary[1],
                    'queuecalls' => $flow_total[$s],
                    'queuedrop' => $flow_drop[$s],
                    'dropcallpercent' => $flow_drop_pct[$s],
                    'ivravgtime' => $avg_flow_ivr_time[$s],
                    'totalavgtime' => $avgflow_total_time[$s]
                ));
                array_push($ivrarray, $flow_summary[0]);
                array_push($queuecallarray, $flow_total[$s]);
                array_push($queuedroparray, $flow_drop[$s]);
                array_push($dropcallpercentarray, $flow_drop_pct[$s]);
                array_push($ivravgtimearray, $avg_flow_ivr_time[$s]);
                array_push($totalavgtimearray, $avgflow_total_time[$s]);
                $s++;
            }

            $total_calls = sprintf("%6s", $total_calls);
            $tot_flow_total = sprintf("%6s", $tot_flow_total);
            $tot_flow_drop = sprintf("%6s", $tot_flow_drop);
            $tavg_flow_ivr_time = $this->MathZDC($tot_flow_ivr_time, $total_calls);
            $tavg_flow_ivr_time = round($tavg_flow_ivr_time, 0);
            $tavg_flow_ivr_time = sprintf("%4s", $tavg_flow_ivr_time);
            $tavgflow_total_time = $this->MathZDC($tot_flow_total_time, $total_calls);
            $tavgflow_total_time = round($tavgflow_total_time, 0);
            $tavgflow_total_time = sprintf("%4s", $tavgflow_total_time);
            $tot_flow_dropPCT = ($this->MathZDC($tot_flow_drop, $tot_flow_total) * 100);
            $tot_flow_dropPCT = round($tot_flow_dropPCT, 0);
            $tot_flow_dropPCT = sprintf("%5s", $tot_flow_dropPCT);
            $maxarray = array(
                "ivrcallmax" => $max_ivr_calls,
                "queuecallmax" => $max_queue_calls,
                "queuedropmax" => $max_queue_drops,
                "queuedroppermax" => $max_queue_drops_percent,
                "avgtimemax" => $max_ivr_avg,
                "totalavgtimemax" => $max_total_avg
            );
            $maxlevel = 0;
            $maxiver = [];

            if(sizeof($ivrarray)>0)
            $maxiver[0] = max($ivrarray);

            if(sizeof($queuecallarray)>0)
            $maxiver[1] = max($queuecallarray);

            if(sizeof($queuedroparray)>0)
            $maxiver[2] = max($queuedroparray);

            if(sizeof($dropcallpercentarray)>0)
            $maxiver[3] = max($dropcallpercentarray);

            if(sizeof($ivravgtimearray)>0)
            $maxiver[4] = max($ivravgtimearray);

            if(sizeof($totalavgtimearray)>0)
            $maxiver[5] = max($totalavgtimearray);

            if(sizeof($maxiver)>0)
            $maxlevel = max($maxiver);


            if ($type == 'inbound') {
                $rslt = LiveInboundLog::whereIn('comment_a', $selectedgroups)
                                        ->whereBetween('start_time', [$query_date_begin, $query_date_end])
                                        ->select(DB::raw('uniqueid, SEC_TO_TIME((TIME_TO_SEC(min(start_time)) DIV 900) * 900) as stime'))
                                        ->groupBy('uniqueid')
                                        ->get()->toArray();

            } else {
                $rslt = VicidialOutboundIvrLog::whereIn('campaign_id', $selectedgroups)
                                                ->whereBetween('event_date', [$query_date_begin, $query_date_end])
                                                ->where('menu_action','')
                                                ->select(DB::raw('uniqueid, SEC_TO_TIME((TIME_TO_SEC(min(event_date)) DIV 900) * 900) as stime'))
                                                ->groupBy('uniqueid')
                                                ->get()->toArray();

            }

            $inb_15min_array = array();
            $co = 0;
            $row_count = count($rslt);

            while ($co < $row_count) {
                $time_index = substr($rslt[$co]['stime'], 0, -2);
                $time_index = preg_replace('/[^0-9]/', '', $time_index);
                $inb_15min_array["$time_index"] = isset($inb_15min_array["$time_index"])?$inb_15min_array["$time_index"]:0;
                $inb_15min_array["$time_index"]++;
                $co++;
            }
            $total_calls = $h = $j = $i = $last_full_record = $hi_hour_count = 0;
            while ($i <= 96) {
                for ($j = 0; $j <= 45; $j += 15) {
                    if ($j == 0) $j = "00";
                    $time_index = substr("0$h", -2)."$j";
                    $inb_15min_array["$time_index"] = isset($inb_15min_array["$time_index"])?$inb_15min_array["$time_index"]:0;
                    $hour_count[$i] = $inb_15min_array["$time_index"] + 0;
                    if ($hour_count[$i] > $hi_hour_count) {
                        $hi_hour_count = $hour_count[$i];
                    }
                    if ($hour_count[$i] > 0) {
                        $last_full_record = $i;
                    }
                    $i++;
                }
                $h++;
            }

            $hour_multiplier = $this->MathZDC(100, $hi_hour_count);
            $k = 1;
            $mk = 0;
            $call_scale = '0';
            while ($k <= 102) {
                if ($mk >= 5) {
                    $mk = 0;
                    $scale_num = $this->MathZDC($k, $hour_multiplier);
                    $scale_num = round($scale_num, 0);
                    $len_scale_num = (strlen($scale_num));
                    $k = ($k + $len_scale_num);
                    $call_scale .= "$scale_num";
                } else if ($mk == 1 || $mk == 2) {
                    $call_scale .= " ";
                    $k++;
                    $mk++;
                } else {
                    $k++;
                    $mk++;
                }
            }

            $zz = '00';
            $i = 0;
            $h = 4;
            $hour = -1;
            $no_lines_yet = 1;
            $timestat = array();
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
                    if (($no_lines_yet) or ( $i > $last_full_record)) {
                        $do_nothing = 1;
                    } else {
                        $total_calls = isset($total_calls)?$total_calls:0;
                        $total_calls += $hour_count[$i];
                        $hour_count[$i] = sprintf("%-5s", $hour_count[$i]);
                    }
                    array_push($timestat, [$time,$hour_count[$i]]);
                } else {
                    $no_lines_yet = 0;
                    $xhour_count = ($ghour_count * $hour_multiplier);
                    $yhour_count = (99 - $xhour_count);
                    $total_calls = isset($total_calls)?$total_calls:0;
                    $total_calls += $hour_count[$i];
                    $hour_count[$i] = sprintf("%-5s", $hour_count[$i]);
                    array_push($timestat, [$time,$hour_count[$i]]);
                }
                $i++;
                $h++;
            }

            $datetime = date('Y-m-d H:i:s');
            // if(isset($request['file_download']) && strlen($request['file_download']) > 0 ){
                $res_data = [
                                'time_end' => $time_end,
                                'outbound'=>$outbound,
                                'time_begin' => $time_begin,
                                'totalavgeragetime' => $tavgflow_total_time,
                                'totivravgtime' => $tavg_flow_ivr_time,
                                'totdroppercen' => $tot_flow_dropPCT,
                                'totaldropcalls' => $tot_flow_drop,
                                'totalqueuecalls' => $tot_flow_total,
                                'group_string' => $group_string,
                                'datetime' => $datetime,
                                'maxiver' => $maxlevel,
                                'timestat' => $timestat,
                                'callscale' => $call_scale,
                                'hour_multiplier' => $hour_multiplier,
                                'hour_count' => $hour_count,
                                'last_full_record' => $last_full_record,
                                'total_ivr' => $total_ivr,
                                'total_calls' => $total_calls,
                                'no_caller_id_calls' => $no_caller_id_calls,
                                'unique_callers' => $unique_callers,
                                'maxarray' => $maxarray,
                                'startdate' => $query_date_begin,
                                'enddate' => $query_date_end
                            ];




                $top_tab_header = [
                    ["IVR Stats Report      ".$res_data['startdate']."   To   ".$res_data['enddate']."       ".date('Y-m-d h:i:s')."  "],
                    ["Selected Groups:   ".$res_data['group_string']],
                    [""],
                    ["Calls taken into this IVR:", $res_data['total_calls']],
                    ['Calls with no CallerID:', $res_data['no_caller_id_calls']],
                    ['Unique Callers:', $res_data['unique_callers']],
                    [""],
                    ["IVR CALLS", "QUEUE CALLS", "QUEUE DROP CALLS", "QUEUE DROP PERCENTAGE", "IVR AVG TIME", "TOTAL AVG TIME", "CALL PATH"]
                ];

                foreach ($res_data['total_ivr'] as $key => $value) {
                    $total_ivr_tab = [
                        $value['ivrcalls'], $value['queuecalls'], $value['queuedrop'], $value['dropcallpercent'], $value['ivravgtime'], $value['totalavgtime'], $value['callstat']
                    ];
                    array_push($top_tab_header,$total_ivr_tab);
                }

                $top_tab_bottom = [
                    [$res_data['total_calls'],$res_data['totalqueuecalls'],$res_data['totaldropcalls'],$res_data['totdroppercen'],$res_data['totivravgtime'],$res_data['totalavgeragetime']],
                    [""],
                    [""],
                    ["GRAPH IN 15 MINUTE INCREMENTS OF TOTAL CALLS TAKEN INTO THIS IVR"],
                    ["HOUR", "TOTAL"],
                    [""],
                    [""],
                    [$res_data['total_calls']]
                ];
                array_push($top_tab_header,[$res_data['total_calls'],$res_data['totalqueuecalls'],$res_data['totaldropcalls'],$res_data['totdroppercen'],$res_data['totivravgtime'],$res_data['totalavgeragetime']]);
                array_push($top_tab_header,[""]);
                array_push($top_tab_header,[""]);
                array_push($top_tab_header,["GRAPH IN 15 MINUTE INCREMENTS OF TOTAL CALLS TAKEN INTO THIS IVR"]);
                array_push($top_tab_header,["HOUR", "TOTAL"]);
                array_push($top_tab_header,[""]);
                array_push($top_tab_header,[""]);
                array_push($top_tab_header,[$res_data['total_calls']]);

                // return $top_tab_header;
                // return $this->inboundIVRReportCsvDownload($res_data);

            // } else {
                return response()->json([
                    'status'=>200,    
                    'message' => 'successfully',
                    'time_end' => $time_end,
                    'time_begin' => $time_begin,
                    'totalavgeragetime' => $tavgflow_total_time,
                    'totivravgtime' => $tavg_flow_ivr_time,
                    'totdroppercen' => $tot_flow_dropPCT,
                    'totaldropcalls' => $tot_flow_drop,
                    'totalqueuecalls' => $tot_flow_total,
                    'group_string' => $group_string,
                    'datetime' => $datetime,
                    'maxiver' => $maxlevel,
                    'timestat' => $timestat,
                    'callscale' => $call_scale,
                    'hour_multiplier' => $hour_multiplier,
                    'hour_count' => $hour_count,
                    'last_full_record' => $last_full_record,
                    'total_ivr' => $total_ivr,
                    'total_calls' => $total_calls,
                    'no_caller_id_calls' => $no_caller_id_calls,
                    'unique_callers' => $unique_callers,
                    'maxarray' => $maxarray,
                    'startdate' => $query_date_begin,
                    'enddate' => $query_date_end
                    , 'top_tab_header' =>$top_tab_header
                ]);
            // }
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound_ivr_report'), $e);
            throw $e;
        }
    }

    public function inboundIVRReportCsvDownload($res_data)
    {
        try{
            // $top_tab_header = [];

            // $top_tab_header = [
            //     ["IVR Stats Report      ".$res_data['startdate']."   To   ".$res_data['enddate']."       ".date('Y-m-d h:i:s')."  "],
            //     ["Selected Groups:   ".$res_data['group_string']],
            //     [""],
            //     ["Calls taken into this IVR:", $res_data['total_calls']],
            //     ['Calls with no CallerID:', $res_data['no_caller_id_calls']],
            //     ['Unique Callers:', $res_data['unique_callers']],
            //     [""],
            //     ["IVR CALLS", "QUEUE CALLS", "QUEUE DROP CALLS", "QUEUE DROP PERCENTAGE", "IVR AVG TIME", "TOTAL AVG TIME", "CALL PATH"]
            // ];

            // foreach ($res_data['total_ivr'] as $key => $value) {
            //     $total_ivr_tab = [
            //         $value['ivrcalls'], $value['queuecalls'], $value['queuedrop'], $value['dropcallpercent'], $value['ivravgtime'], $value['totalavgtime'], $value['callstat']
            //     ];
            //     array_push($top_tab_header,$total_ivr_tab);
            // }

            // $top_tab_header = [
            //         [$res_data['total_calls'],$res_data['totalqueuecalls'],$res_data['totaldropcalls'],$res_data['totdroppercen'],$res_data['totivravgtime'],$res_data['totalavgeragetime']],
            //         [""],
            //         [""],
            //         ["GRAPH IN 15 MINUTE INCREMENTS OF TOTAL CALLS TAKEN INTO THIS IVR"],
            //         ["HOUR", "TOTAL"],
            //         [""],
            //         [""],
            //         [$res_data['total_calls']]
            //     ];

            // return $top_tab_header;

                if($res_data['outbound']!='Y'){
                    $filename = "inbound_ivr_report".date('Y-m-dh:i:s').".csv";
                } else{
                    $filename = "outbound_ivr_report_export".date('Y-m-dh:i:s').".csv";
                }
                
                $handle = fopen($filename, 'w+');

                $top_tab_header = [
                    '1' => ["IVR Stats Report      ".$res_data['startdate']."   To   ".$res_data['enddate']."       ".date('Y-m-d h:i:s')."  "],
                    '2' => ["Selected Groups:   ".$res_data['group_string']],
                    '3' => [""],
                    '4' => ["Calls taken into this IVR:", $res_data['total_calls']],
                    '5' => ['Calls with no CallerID:', $res_data['no_caller_id_calls']],
                    '6' => ['Unique Callers:', $res_data['unique_callers']],
                    '7' => [""],
                    '8' => ["IVR CALLS", "QUEUE CALLS", "QUEUE DROP CALLS", "QUEUE DROP PERCENTAGE", "IVR AVG TIME", "TOTAL AVG TIME", "CALL PATH"]
                ];

                foreach ($top_tab_header as $key => $value) {
                    fputcsv($handle, $value, ";", '"');
                }

                foreach ($res_data['total_ivr'] as $key => $value) {
                    $total_ivr_tab = [
                        '1' => [$value['ivrcalls'], $value['queuecalls'], $value['queuedrop'], $value['dropcallpercent'], $value['ivravgtime'], $value['totalavgtime'], $value['callstat']]
                    ];

                    foreach ($total_ivr_tab as $key => $value) {
                        fputcsv($handle, $value, ";", '"');
                    }
                }

                $middle_tab_header = [
                    '1' => [$res_data['total_calls'],$res_data['totalqueuecalls'],$res_data['totaldropcalls'],$res_data['totdroppercen'],$res_data['totivravgtime'],$res_data['totalavgeragetime']],
                    '2' => [""],
                    '3' => [""],
                    '4' => ["GRAPH IN 15 MINUTE INCREMENTS OF TOTAL CALLS TAKEN INTO THIS IVR"],
                    '5' => ["HOUR", "TOTAL"]
                ];

                foreach ($middle_tab_header as $key => $value) {
                    fputcsv($handle, $value, ";", '"');
                }

                foreach ($res_data['timestat'] as $key => $value) {
                    fputcsv($handle, $value, ";", '"');
                }

                fputcsv($handle, ['',$res_data['total_calls']], ";", '"');

                fclose($handle);
                $headers = [
                        'Content-Type' => 'text/csv',
                ];
                
                return Response::download($filename, $filename, $headers)->deleteFileAfterSend(true);

            }catch (Exception $e) {
            $this->postLogs(config('errorcontants.ivr_report_csv_download'), $e);
            throw $e;
        }
    }

    public function stwc($stri = null)
    {
        $strir = '';
        $stri = explode(",", $stri);
        foreach ($stri as $key) {
            if ($key != "") $strir .= "'".$key."',";
        }
        $strir = rtrim($strir, ",");
        return $strir;
    }


}
