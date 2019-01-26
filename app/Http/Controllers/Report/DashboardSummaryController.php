<?php

namespace App\Http\Controllers\Report;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Exception;
use App\VicidialCampaigns;
use App\VicidialHopper;
use App\VicidialCampaignStat;
use App\VicidialCampaignServerStat;
use App\VicidialAutoCall;
use App\VicidialLiveAgent;
use App\Traits\ErrorLog;
use Carbon\Carbon;

class DashboardSummaryController extends Controller
{
    use ErrorLog;

	/**
     * Create user
     *
     * @param  [string] filter
     * @param  [string] groups
     * @return [Array] user_data
     */

    public function index(Request $request)
    {
        try{
            $real_time_campaign_summary = [];
            $campaign_id = [];
            $campaign_stats = [];
            $campaign_live_calls_waiting = [];
            $campaign_agents_on_calls = [];

            $types = $request['filter'];
            $groups = $request['groups']; // Need to verify groups in future for temporary we using null or ALL-ACTIVE

            $now_time = Carbon::now();
            $start_time = Carbon::now()->timestamp;
            if($request->groups == "ALL-ACTIVE" || $request->groups == ""){
                $all_campaigns = VicidialCampaigns::getCampaignsId()->pluck('campaign_id');
            }
            $stmt = VicidialCampaigns::getStatement($all_campaigns, $types);
            $k = 0;
            while ($k < count($stmt)) {
                $group = $stmt[$k];
                $campaign_allow_inbound = VicidialCampaigns::campaignAllowInbound($group);
                $stmt1 = VicidialCampaigns::getColumnRecord($group);
                $hopper = VicidialHopper::getStatementCount($group);
                $stmt2 = VicidialCampaignStat::getStatement($group);
                $stmt3 = VicidialCampaignServerStat::getLocalTrunkShortageCount($group);

                $dial_level = $stmt1[0]['auto_dial_level'];
                
                $dial_order = $stmt1[0]['dial_status_e'];
                $dial_filter = $stmt1[0]['lead_filter_id'];
                $hopper_level = $stmt1[0]['lead_filter_id'];
                $dial_method = $stmt1[0]['dial_method'];
                
                $dial_statuses = $stmt1[0]['auto_dial_level'];
                $dial_statuses = (preg_replace("/ -$|^ /", "", $stmt1[0]['dial_timeout']));
                $dial_statuses = (preg_replace('/\s/', ', ', $stmt1[0]['dial_statuses']));


                $dial_leads = $stmt2[0]['dialable_leads'];
                $calls_today = $stmt2[0]['calls_today'];
                $drops_today = $stmt2[0]['drops_today'];
                $drops_answers_today_pct = $stmt2[0]['drops_answers_today_pct'];
                
                $agents_average_onemin = $stmt2[0]['agents_average_onemin'];
                $differential_onemin = $stmt2[0]['differential_onemin'];
                $balance_trunk_fill = $stmt2[0]['balance_trunk_fill'];
                $answers_today = $stmt2[0]['answers_today'];
                $status_category_1 = $stmt2[0]['status_category_1'];
                $status_category_count_1 = $stmt2[0]['status_category_count_1'];
                $status_category_2 = $stmt2[0]['status_category_2'];
                $status_category_count_2 = $stmt2[0]['status_category_count_2'];
                $agent_calls_today = $stmt2[0]['agent_calls_today'];
                $status_category_3 = $stmt2[0]['status_category_3'];
                $status_category_count_3 = $stmt2[0]['status_category_count_3'];
                $status_category_4 = $stmt2[0]['status_category_4'];
                $status_category_count_4 = $stmt2[0]['status_category_count_4'];
                $agent_pause_today = $stmt2[0]['agent_pause_today'];
                $agent_wait_today = $stmt2[0]['agent_wait_today'];
                $agent_custtalk_today = $stmt2[0]['agent_custtalk_today'];
                $agent_acw_today = $stmt2[0]['agent_acw_today'];
               
                $diff_pct_one_min = ($this->mathZdc($differential_onemin, $agents_average_onemin) * 100);
                $diff_pct_one_min = sprintf("%01.2f", $diff_pct_one_min);


                $balance_short = $stmt3[0]['sum'];
                if ($balance_short == "") {
                    $balance_short = 0;
                }
                if ($balance_trunk_fill == "") {
                    $balance_trunk_fill = 0;
                }

                $campaign_id[$k] = $group;
                $campaign_stats[$k]['dial_level'] = $dial_level;
                $campaign_stats[$k]['balance_short'] = $balance_short;
                $campaign_stats[$k]['balance_trunk_fill'] = $balance_trunk_fill;
                $campaign_stats[$k]['dial_filter'] = $dial_filter;
                $campaign_stats[$k]['now_time'] = $now_time;
                $campaign_stats[$k]['hopper_level'] = $hopper_level;
                $campaign_stats[$k]['drops_today'] = $drops_today;
                $campaign_stats[$k]['answers_today'] = $answers_today;
                $campaign_stats[$k]['differential_onemin'] = $differential_onemin;
                $campaign_stats[$k]['dial_statuses'] = $dial_statuses;
                $campaign_stats[$k]['dial_leads'] = $dial_leads;
                $campaign_stats[$k]['calls_today'] = $calls_today;
                $campaign_stats[$k]['agents_average_onemin'] = $agents_average_onemin;
                $campaign_stats[$k]['dial_method'] = $dial_method;
                $campaign_stats[$k]['hopper'] = $hopper;
                $campaign_stats[$k]['drops_answers_today_pct'] = $drops_answers_today_pct;
                $campaign_stats[$k]['diff_pct_one_min'] = $diff_pct_one_min;
                $campaign_stats[$k]['dial_order'] = $dial_order;

                if ($agent_calls_today > 0) {

                    $avg_pause_today = $this->mathZdc($agent_pause_today, $agent_calls_today);
                    $avg_pause_today = round($avg_pause_today, 0);
                    $avg_pause_today = sprintf("%01.0f", $avg_pause_today);

                    $avg_wait_today = $this->mathZdc($agent_wait_today, $agent_calls_today);
                    $avg_wait_today = round($avg_wait_today, 0);
                    $avg_wait_today = sprintf("%01.0f", $avg_wait_today);

                    $avg_cust_today = $this->mathZdc($agent_custtalk_today, $agent_calls_today);
                    $avg_cust_today = round($avg_cust_today, 0);
                    $avg_cust_today = sprintf("%01.0f", $avg_cust_today);

                    $avg_acw_today = $this->mathZdc($agent_acw_today, $agent_calls_today);
                    $avg_acw_today = round($avg_acw_today, 0);
                    $avg_acw_today = sprintf("%01.0f", $avg_acw_today);

                    $campaign_stats[$k]['avg_wait_today'] = $avg_wait_today;
                    $campaign_stats[$k]['avg_cust_today'] = $avg_cust_today;
                    $campaign_stats[$k]['avg_acw_today'] = $avg_acw_today;
                    $campaign_stats[$k]['avg_pause_today'] = $avg_pause_today;
                }
                if ($campaign_allow_inbound > 0) {
                    $stmt5 = VicidialCampaigns::getCloserCampaigns($group);
                    $closer_campaigns = preg_replace("/^ | -$/", "", $stmt5[0]);
                    $closer_campaigns = "'".preg_replace("/ /", "','", $closer_campaigns). "'";
                    $closer_campaigns = explode(',', $closer_campaigns);
                    $smt6 = VicidialAutoCall::getStatus($group,$closer_campaigns); 
                }else{
                    if ($group == 'XXXX-ALL-ACTIVE-XXXX') {
                        $group_sql = '';
                    } else {
                        $group_sql = "and  campaign_id='".$group."'";
                    }
                    $smt6 = VicidialAutoCall::getStatusIfNot($group_sql);
                } 
                $parked_to_print = count($smt6);
                if ($parked_to_print > 0) {
                    $i = 0;
                    $out_total = 0;
                    $out_ring = 0;
                    $out_live = 0;
                    $in_ivr = 0;
                    while ($i < $parked_to_print) {
                        $status = $smt6[0]['status'];
                        if (preg_match("/LIVE/i", $status)) {
                            $out_live++;
                        } else {
                            if (preg_match("/IVR/i", $status)) {
                                $in_ivr++;
                            }
                            if (preg_match("/CLOSER/i", $status)) {
                                $nothing = 1;
                            } else {
                                $out_ring++;
                            }
                        }
                        $out_total++;
                        $i++;
                    }
                    $campaign_live_calls_waiting[$k]['out_total'] = $out_total;
                    $campaign_live_calls_waiting[$k]['out_ring'] = $out_ring;
                    $campaign_live_calls_waiting[$k]['out_live'] = $out_live;
                    $campaign_live_calls_waiting[$k]['in_ivr'] = $in_ivr;
                }  
                $agent_incall = 0;
                $agent_ready = 0;
                $agent_paused = 0;
                $agent_total = 0;
                
                $smt6 = VicidialLiveAgent::getStatus($group);
                $talking_to_print = count($smt6);             
                if ($talking_to_print > 0) {
                    $i = 0;
                    $agentcount = 0;
                    while ($i < $talking_to_print) {
                        $last_call_time = $smt6[$i]['last_call_time'];
                        $last_call_finish = $smt6[$i]['last_call_finish'];
                        if (preg_match("/READY|PAUSED/i", $smt6[$i]['status'])) {
                            $last_call_time = $last_call_finish;
                        }
                        $lstatus = $smt6[$i]['status'];
                        $status = sprintf("%-6s", $lstatus);
                        
                        if (!preg_match("/INCALL|QUEUE/i", $lstatus)) {
                            $call_time_S = ($start_time - $last_call_finish);
                        } else {
                            $call_time_S = ($start_time - $last_call_time);
                        }
                        $call_time_m = $this->mathZdc($call_time_S, 60);
                        $call_time_m = round($call_time_m, 2);
                        $call_time_m_int = intval("$call_time_m");
                        $call_time_sec = ($call_time_m - $call_time_m_int);
                        $call_time_sec = ($call_time_sec * 60);
                        $call_time_sec = round($call_time_sec, 0);
                        if ($call_time_sec < 10) {
                            $call_time_sec = "0$call_time_sec";
                        }
                        $call_time_ms = "$call_time_m_int:$call_time_sec";
                        $call_time_ms = sprintf("%7s", $call_time_ms);
                        $G = '';
                        $EG = '';
                        if (preg_match("/PAUSED/i", $lstatus)) {
                            if ($call_time_m_int >= 30) {
                                $i++;
                                continue;
                            } else {
                                $agent_paused++;
                                $agent_total++;
                            }
                        }

                        if ((preg_match("/INCALL/i", $status)) or ( preg_match("/QUEUE/i", $status))) {
                            $agent_incall++;
                            $agent_total++;
                        }
                        if ((preg_match("/READY/i", $status)) or ( preg_match("/CLOSER/i", $status))) {
                            $agent_ready++;
                            $agent_total++;
                        }
                        $agentcount++;
                        $i++;
                    }
                    $campaign_agents_on_calls[$k]['agent_total'] = $agent_total;
                    $campaign_agents_on_calls[$k]['agent_incall'] = $agent_incall;
                    $campaign_agents_on_calls[$k]['agent_ready'] = $agent_ready;
                    $campaign_agents_on_calls[$k]['agent_paused'] = $agent_paused;
                }
                $k++;
                
            }
            foreach ($campaign_stats as $key => $campaign_stat) {
                $real_time_campaign_summary[] = [
                    'campaign_id'=>$campaign_id[$key],
                    'campaign_stat'=>$campaign_stat,
                    'campaign_live_calls_waiting'=>$campaign_live_calls_waiting[$key]??[],
                    'campaign_agents_on_calls'=>$campaign_agents_on_calls[$key]??[]

                ];
            }
           
            return response()->json([
                'status' => 200,
                'user_data' => $real_time_campaign_summary
            ],200); 

        }catch (Exception $e) {
            $this->postLogs(config('errorcontants.dashboard_summary'), $e);
            throw $e;
        }
    }





    public function mathZdc($dividend, $divisor, $quotient = 0)
    {
        if ($divisor == 0) {
            return $quotient;
        } else if ($dividend == 0) {
            return 0;
        } else {
            return ($dividend / $divisor);
        }
    }
}
