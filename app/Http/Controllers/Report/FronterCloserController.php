<?php

namespace App\Http\Controllers\Report;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\VicidialCampaigns;
use App\VicidialCampaignStatuses;
use App\VicidialStatuses;
use App\VicidialCloserLog;
use App\VicidialXferLog;
use App\VicidialUsers;
use App\Traits\AccessControl;
use Response;
use Illuminate\Support\Facades\Hash;

class FronterCloserController extends Controller {

    use AccessControl;

    public function fcStates(Request $request) {

    	try{
    		$selected_groups = $request['selected_groups'];
      //       $selected_groups = [];
    		// if (isset($selected_groups) && is_array($selected_groups)) {
      //           $selected_groups = array_intersect($selected_groups, $this->getListByAccess(ACCESS_TYPE_INGROUP, ACCESS_READ, $request->user()));
      //       }

            $selected_groups[0] = isset($selected_groups[0])?$selected_groups[0]:'';
            # handle access control for permission 
            # User access control for permission need to check
            # user_group access control for permission need to check
            #         TODO to complete	

            $now_date = date("Y-m-d");
            $now_time = date("Y-m-d H:i:s");
            $start_time = date("U");

            $start_date = $request['start_date'];
            $end_date = $request['end_date'];

            $shift = $request['shift'];
            $report_display_type = $request['report_display_type'];


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

            $query_date_begin = "$start_date $time_begin";
            $query_date_end = "$end_date $time_end";

            $basicinfo = array();
            $basicinfo['nowtime'] = "$now_time";
            $basicinfo['date'] = "$query_date_begin to $query_date_end";

            $selectstatus = VicidialCampaigns::getSelectStatus($selected_groups[0]);
    		
    		$looparray = array();

    		for ($i = 0; $i < count($selectstatus); $i++) {

                $single_array = $selectstatus[$i]['campaign_id'];

                array_push($looparray, $single_array);
            }

            $selectstatus = implode(",", $looparray);

            $list = VicidialCampaignStatuses::getCampaignStatusesList($looparray);

            $list1 = VicidialStatuses::where('sale', 'Y')->distinct('status')->get(['status'])->toArray();

           	if (count($list) > 0) {
                $list = array_map(function($item) {
                    return $item['status'];
                }, $list);
            }
            if (count($list1) > 0) {
                $list1 = array_map(function($item) {
                    return $item['status'];
                }, $list1);
            }
            $merge_array = array_merge($list, $list1);          

            $looparray = array();

            for ($i = 0; $i < count($merge_array); $i++) {

                $single_array = $merge_array[$i];
                $singlestring = "'$single_array'";

                array_push($looparray, $single_array);
            }
            $sale_dispo_str = "|SALE|";
            $sale_dispo_str .= implode('|', $looparray);
            $sale_dispo_str .= "|";
         
            // $closorcount = VicidialCloserLog::getClosorCount($selected_groups[0], $query_date_begin, $query_date_end, $looparray);
            $closorcount = VicidialCloserLog::where('campaign_id', $selected_groups[0])
                                ->whereBetween('call_date',[$query_date_begin,$query_date_end])
                                ->whereIn('status',$looparray)
                                ->select(DB::raw('COUNT(*) AS count'))
                                ->get()->toArray();
            
            // dd($selected_groups[0],$query_date_begin,$query_date_end, $looparray, $closorcount);

            $basicinfo['salescount'] = $closorcount;
            
            $tot_agents = $tot_calls = $tot_sales = $tot_a1 = $tot_a2 = $tot_a3 = $tot_a4 = $tot_a5 = $tot_a6 = $tot_a7 = $tot_a8 = $tot_a9 = $tot_drop = $tot_other = 0;

            $graph_stats = array();
            $max_success = $max_xfers = $max_success_pct = $max_sales = $max_drops = $max_other = 1;

            #counting total calls in day
            $xfrmdata = VicidialXferLog::getXfrmData($selected_groups[0], $query_date_begin, $query_date_end);

            $row = array();

            for ($i = 0; $i < count($xfrmdata); $i++) {

                $single_array = array(
                    $xfrmdata[$i]['user'],
                    $xfrmdata[$i]['count']
                );
                array_push($row, $single_array);
            }

            $i = 0;
            $user_raw = array();
            $user_calls_raw = array();
            $user_calls = array();

            while ($i < count($row)) {

                $tot_calls = ($tot_calls + $row[$i][1]);

                $user_raw[$i] = $row[$i][0];
                $user[$i] = $row[$i][0];
                while (strlen($user[$i]) > 6) {
                    $user[$i] = substr("$user[$i]", 0, -1);
                }
                $user_calls_raw[$i] = $row[$i][1];
                $user_calls[$i] = $row[$i][1];
                $i++;
            }
            $count_user = count($row);
            $i = 0;

            while ($i < $count_user) 
            {
                $stmt = VicidialUsers::where('user',$user_raw[$i])->first(['full_name']);

                $full_name = $stmt['full_name'];

                $a1 = $a2 = $a3 = $a4 = $a5 = $a6 = $a7 = $a8 = $a9 = $drop = $other = $sales = 0;

                $data_fromclosor = VicidialCloserLog::getDataFromClosor($query_date_begin, $query_date_end, $selected_groups[0], $user_raw[$i]);
                $row = array();

                for ($k = 0; $k < count($data_fromclosor); $k++) {

                    $single_array = array(
                        $data_fromclosor[$k]['status'],
                        $data_fromclosor[$k]['count']
                    );
                    array_push($row, $single_array);
                }

                $j = 0;
                while ($j < count($row)) {
                    $recL = 0;
                    if ((in_array($row[$j][0], $looparray)) and ( $recL < 1)) {

                        $a1 = $row[$j][1];
                        $recL++;
                        $sales = ($sales + $row[$j][1]);
                    }
                    if (($row[$j][0] == 'DROP') and ( $recL < 1)) {

                        $drop = $row[$j][1];
                        $recL++;
                    }
                    if ($recL < 1) {
                        $other = ($row[$j][1] + $other);
                        $recL++;
                    }
                    $j++;
                }

                $tot_a1 = ($tot_a1 + $a1);
                $tot_a2 = ($tot_a2 + $a2);
                $tot_a3 = ($tot_a3 + $a3);
                $tot_a4 = ($tot_a4 + $a4);
                $tot_a5 = ($tot_a5 + $a5);
                $tot_a6 = ($tot_a6 + $a6);
                $tot_a7 = ($tot_a7 + $a7);
                $tot_a8 = ($tot_a8 + $a8);
                $tot_a9 = ($tot_a9 + $a9);
                $tot_drop = ($tot_drop + $drop);
                $tot_other = ($tot_other + $other);
                $tot_sales = ($tot_sales + $sales);

                if (($user_calls_raw[$i] > 0) and ( $sales > 0)) {
                    $spct = (($sales / $user_calls_raw[$i]) * 100);
                } else {
                    $spct = 0;
                }
                
                $spct = number_format((float)$spct, 2, '.', '');

                if ($sales > $max_success) {
                    $max_success = $sales;
                }
                if ($user_calls[$i] > $max_xfers) {
                    $max_xfers = $user_calls[$i];
                }
                if ($spct > $max_success_pct) {
                    $max_success_pct = $spct;
                }
                if ($a1 > $max_sales) {
                    $max_sales = $a1;
                }
                if ($drop > $max_drops) {
                    $max_drops = $drop;
                }
                if ($other > $max_other) {
                    $max_other = $other;
                }
                $graph_stats[$i]['user'] = $user[$i];
                $graph_stats[$i]['full_name'] = $full_name;
                $graph_stats[$i]['sales'] = $sales;
                $graph_stats[$i]['calls'] = $user_calls[$i];
                $graph_stats[$i]['salespercentage'] = $spct;
                $graph_stats[$i]['a1'] = $a1;
                $graph_stats[$i]['drop'] = $drop;
                $graph_stats[$i]['other'] = $other;

                $i++;
            }

            if (($tot_calls > 0) and ( $tot_sales > 0)) {
                $totspct = (($tot_sales / $tot_calls) * 100);
            } else {
                $totspct = 0;
            }
            $totspct = number_format((float)$totspct, 2, '.', '');

            $tot_agents = $i;

            $avg_que = VicidialCloserLog::getAvgQue($selected_groups[0], $query_date_begin, $query_date_end);
            
            $avg_wait = $avg_que['0']['AVG'];
            $avg_wait = $this->secConvert($avg_wait, 'H');

            $total_xfremcall = array(
                'totagents' => $tot_agents,
                'totsales' => $tot_sales,
                'totcalls' => $tot_calls,
                'totspct' => $totspct,
                'tot_a1' => $tot_a1,
                'tot_drop' => $tot_drop,
                'tot_other' => $tot_other,
                'avg_wait' => $avg_wait
            );

            $tot_agents = $tot_calls = $tot_a1 = $tot_a2 = $tot_a3 = $tot_a4 = $tot_a5 = $tot_a6 = $tot_a7 = $tot_a8 = $tot_a9 = $tot_drop = $tot_other = $tot_sales = 0;

            ######## GRAPHING #########
            $max_calls = $max_sales = $max_drops = $max_other = $max_sales2 = $max_conv_pct = 1;


            $closordata = VicidialCloserLog::getClosorData($selected_groups[0], $query_date_begin, $query_date_end);

            $row = array();

            for ($i = 0; $i < count($closordata); $i++) {

                $single_array = array(
                    $closordata[$i]['user'],
                    $closordata[$i]['count']
                );
                array_push($row, $single_array);
            }

            $i = 0;
            $user_raw = array();
            $user_calls_raw = array();
            $user_calls = array();
            $main_array = array();
            while ($i < count($row)) {

                $tot_calls = ($tot_calls + $row[$i][1]);
                $user_raw[$i] = $row[$i][0];
                $user[$i] = $row[$i][0];
                while (strlen($user[$i]) > 6) {
                    $user[$i] = substr("$user[$i]", 0, -1);
                }
                $user_calls_raw[$i] = $row[$i][1];
                $user_calls[$i] = $row[$i][1];

                $i++;
            }

            $count_row = count($row);
            $i = 0;

            $graph_stats1 = [];
            
            while ($i < $count_row) {

            	$stmt = VicidialUsers::where('user',$user_raw[$i])->first(['full_name']);
                
                $full_name = $stmt['full_name'];
                $a1 = $a2 = $a3 = $a4 = $a5 = $a6 = $a7 = $a8 = $a9 = 0;
                $drop = $other = $sales = $utop = $ubot = $points = $tot_top = $tot_bot = $tot_points=0;

                $data_fromclosor = VicidialCloserLog::getDataFromClosorWithUser($selected_groups[0], $user_raw[$i], $query_date_begin, $query_date_end);
                
                $row = array();
                for ($k = 0; $k < count($data_fromclosor); $k++) {

                    $single_array = array(
                        $data_fromclosor[$k]['status'],
                        $data_fromclosor[$k]['count']
                    );

                    array_push($row, $single_array);
                }

                $j = 0;
                while ($j < count($row)) {
                    $recL = 0;
                    if ((in_array($row[$j][0], $looparray)) and ( $recL < 1)) {

                        $a1 = $row[$j][1];
                        $recL++;
                        $sales = ($sales + $row[$j][1]);
                        $points = ($points + ($row[$j][1] * 1));
                    }
                    if (($row[$j][0] == 'DROP') and ( $recL < 1)) {
                        $drop = $row[$j][1];
                        $recL++;
                    }
                    if ($recL < 1) {
                        $other = ($row[$j][1] + $other);
                        $recL++;
                    }
                    $j++;
                }

                $tot_a1 = ($tot_a1 + $a1);
                $tot_sales = ($tot_sales + $a1);
                $tot_a2 = ($tot_a2 + $a2);
                $tot_sales = ($tot_sales + $a2);
                $tot_top = ($tot_top + $a2);
                $tot_a3 = ($tot_a3 + $a3);
                $tot_sales = ($tot_sales + $a3);
                $tot_bot = ($tot_bot + $a3);
                $tot_a4 = ($tot_a4 + $a4);
                $tot_sales = ($tot_sales + $a4);
                $tot_top = ($tot_top + $a4);
                $tot_bot = ($tot_bot + $a4);
                $tot_a5 = ($tot_a5 + $a5);
                $tot_a6 = ($tot_a6 + $a6);
                $tot_a7 = ($tot_a7 + $a7);
                $tot_a8 = ($tot_a8 + $a8);
                $tot_a9 = ($tot_a9 + $a9);
                $tot_drop = ($tot_drop + $drop);
                $tot_other = ($tot_other + $other);
                $tot_points = ($tot_points + $points);

                if (($user_calls_raw[$i] > 0) and ( $sales > 0)) {
                    $cpct = (($sales / (($user_calls_raw[$i] - 0) - $drop)) * 100);
                } else {
                    $cpct = 0;
                }
                $cpct = round($cpct, 2);

                if (($sales > 0) and ( $utop > 0)) {
                    $top = (($utop / $sales) * 100);
                } else {
                    $top = 0;
                }
                $top = round($top, 0);

                if (($sales > 0) and ( $ubot > 0)) {
                    $bot = (($ubot / $sales) * 100);
                } else {
                    $bot = 0;
                }
                $bot = round($bot, 0);

                if (($user_calls_raw[$i] > 0) and ( $points > 0)) {
                    $ppc = ($points / (($user_calls_raw[$i] - 0) - $drop));
                } else {
                    $ppc = 0;
                }
                $ppc = round($ppc, 2);

                if ($user_calls[$i] > $max_calls) {
                    $max_calls = $user_calls[$i];
                }
                if ($a1 > $max_sales) {
                    $max_sales = $a1;
                }
                if ($drop > $max_drops) {
                    $max_drops = $drop;
                }
                if ($other > $max_other) {
                    $max_other = $other;
                }
                if ($sales > $max_sales2) {
                    $max_sales2 = $sales;
                }
                if ($cpct > $max_conv_pct) {
                    $max_conv_pct = $cpct;
                }

                $graph_stats1[$i]['user'] = $user[$i];
                $graph_stats1[$i]['full_name'] = $full_name;
                $graph_stats1[$i]['calls'] = $user_calls[$i];
                $graph_stats1[$i]['a1'] = $a1;
                $graph_stats1[$i]['drop'] = $drop;
                $graph_stats1[$i]['other'] = $other;
                $graph_stats1[$i]['sales'] = $sales;
                $graph_stats1[$i]['cpt'] = number_format((float)$cpct, 2, '.', '').'%';

                $i++;
            }


            if (($tot_calls > 0) and ( $tot_sales > 0)) {
                $totcpct = (($tot_sales / (($tot_calls - 0) - $tot_drop)) * 100);
            } else {
                $totcpct = 0;
            }
            $totcpct = round($totcpct, 2);

            if (($tot_calls > 0) and ( $tot_points > 0)) {
                $ppc = ($tot_points / (($tot_calls - $tot_other) - $tot_drop));
            } else {
                $ppc = 0;
            }
            $ppc = round($ppc, 2);

            if (($tot_sales > 0) and ( $tot_top > 0)) {
                $top = (($tot_top / $tot_sales) * 100);
            } else {
                $top = 0;
            }
            $top = round($top, 0);

            if (($tot_sales > 0) and ( $tot_bot > 0)) {
                $bot = (($tot_bot / $tot_sales) * 100);
            } else {
                $bot = 0;
            }
            $bot = round($bot, 0);

            $tot_agents = $i;

            $coloser_total = array(
                "totagent" => $tot_agents,
                "totcalls" => $tot_calls,
                "tot_a1" => $tot_a1,
                "totdrop" => $tot_drop,
                "totother" => $tot_other,
                "totsale" => $tot_sales,
                "totctp" => $totcpct.'%'
            );

    		return response()->json([
                'status'=>200,    
                'message' => 'successfully.',
                'basicinfo' => $basicinfo,
                'xfremInfo' => $graph_stats,
                'totalXfrem' => $total_xfremcall,
                'closorInfo' => $graph_stats1,
                'totalCloser' => $coloser_total,
                'max_calls' => $max_calls,
                'max_xfers' => $max_xfers
                ]);


        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.fronter_closer_controller'), $e);
            throw $e;
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

}