<?php

namespace App\Http\Controllers\Report;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\VicidialCampaigns;
use App\VicidialLists;
use App\VicidialList;
use App\VicidialStatusCategories;
use App\VicidialCampaignStatuses;
use App\VicidialStatuses;
use App\VicidialCloserLog;
use App\VicidialXferLog;
use App\VicidialUsers;
use App\Traits\AccessControl;
use Response;
use Illuminate\Support\Facades\Hash;

class ListCampaignStatesController extends Controller {

    use AccessControl;

    public function listCampaignStates(Request $request) {
    try{

    	# handle access control for permission 
        # User access control for permission need to check
        # user_group access control for permission need to check
        #         TODO to complete

        // $selected_groups = $request['selected_groups'];

	        $now_date = date("Y-m-d");
	        $now_time = date("Y-m-d H:i:s");
	        $start_time = date("U");

	        $selectedgroups = $request['selected_groups'];
	        $display_type = $request['display_type'];


	        $list = VicidialCampaigns::getCampaignId();

	        $active = array('Y', 'N');
	        
	        if ($selectedgroups[0] == "ALL") {
	            $lists_id_str = VicidialLists::getCampaignListId($active,$list);
	            $campaignlist = VicidialCampaigns::getCampaignId();

	        } else {
	            $lists_id_str = VicidialLists::getCampaignListSelectedId($active, $selectedgroups[0]);
	            $campaignlist = VicidialCampaigns::getCampaignSelectedId($selectedgroups[0]);
	        }

            $stmt_res = VicidialStatusCategories::getVscDetails()->toArray();
            for($i=0;$i<count($stmt_res);$i++){
            	$categroy_stmt[$stmt_res[$i]['vsc_id']] = $stmt_res[$i]['vsc_name'];
            }

            $categroy_stmt1 = VicidialStatusCategories::getVscDetails()->toArray();

            $vsc_id = array();
            $vsc_name = array();
            $loop_array = array();
            $i = 0;


            foreach ($categroy_stmt as $key => $value) {
                $vsc_id[$i] = $key;
                $vsc_name[$i] = $value;
                $status = VicidialStatuses::where('category', $key)
                                            ->select(DB::raw('status'))->distinct('status')->get()->toArray();

                $loop_array_check = array();
                for ($i = 0; $i < count($status); $i++) {

                    $single_array = $status[$i]['status'];

                    array_push($loop_array_check, $single_array);
                }
                
                $campaignstatus = VicidialCampaignStatuses::where('category', $key)
                                                            ->whereIn('campaign_id',$campaignlist)
                                                            ->select(DB::raw('status'))
                                                            ->distinct('status')
                                                            ->get()->toArray();

                $loop_array1 = array();
                for ($i = 0; $i < count($campaignstatus); $i++) {

                    $single_array1 = $campaignstatus[$i]['status'];

                    array_push($loop_array1, $single_array1);
                }
                $category_status = array_unique(array_merge($loop_array_check, $loop_array1));

                $list_count = VicidialList::whereIn('status', $category_status)
                                            ->whereIn('list_id',$lists_id_str)
                                            ->select(DB::raw('COUNT(*) AS count'))
                                            ->get()->toArray();

                array_push($loop_array, $list_count[0]['count']);
                $i++;
            }
            
            $human_answered_statuses = [];
            $sale_statuses = [];
            $dnc_statuses = [];
            $customer_contact_statuses = [];
            $not_interested_statuses = [];
            $unworkable_statuses = [];
            $scheduled_callback_statuses = [];
            $completed_statuses = [];
            $list_id_sql = [];

            $status_stmt = VicidialStatuses::select(DB::raw('status,human_answered,sale,dnc, customer_contact, not_interested,unworkable, scheduled_callback, completed, status_name'))->get()->toArray();            

            $i = 0;
            $jj = 0;
            while ($i < count($status_stmt)) {
                $row = $status_stmt[$i];
                $temp_status = $row['status'];
                $statname_list['$temp_status'] = $row['status_name'];

                if ($row['human_answered'] == 'Y') { $human_answered_statuses[$jj] = "$temp_status"; }
                if ($row['sale'] == 'Y') { $sale_statuses[$jj] = "$temp_status"; }
                if ($row['dnc'] == 'Y') { $dnc_statuses[$jj] = "$temp_status"; }
                if ($row['customer_contact'] == 'Y') { $customer_contact_statuses[$jj] = "$temp_status"; }
                if ($row['not_interested'] == 'Y') { $not_interested_statuses[$jj] = "$temp_status"; }
                if ($row['unworkable'] == 'Y') { $unworkable_statuses[$jj] = "$temp_status"; }
                if ($row['scheduled_callback'] == 'Y') { $scheduled_callback_statuses[$jj] = "$temp_status"; }
                if ($row['completed'] == 'Y') { $completed_statuses[$jj] = "$temp_status"; }
                $i++;
                $jj++;
            }


            
            $campaign_status_stmt = VicidialCampaignStatuses::whereIn('selectable', $active)->whereIn('campaign_id',$campaignlist)->select(DB::raw('status, human_answered, sale, dnc, customer_contact, not_interested, unworkable, scheduled_callback, completed, status_name'))->get()->toArray();

            $i = 0;
            $percentage_array = array();
            $count_array = array();
            $graph_array = array();
            $total_array = array();
            $max_flags = 1;
            $max_status = 1;
            $graph_stats = array();
            $graph_statss = array();

            while ($i < count($campaign_status_stmt)) {
                $row = $campaign_status_stmt[$i];
                $temp_status = $row['status'];
                $statname_list['$temp_status'] = $row['status_name'];
                if ($row['human_answered'] == 'Y') { $human_answered_statuses[$jj] = "$temp_status"; }
                if ($row['sale'] == 'Y') { $sale_statuses[$jj] = "$temp_status"; }
                if ($row['dnc'] == 'Y') { $dnc_statuses[$jj] = "$temp_status"; }
                if ($row['customer_contact'] == 'Y') { $customer_contact_statuses[$jj] = "$temp_status"; }
                if ($row['not_interested'] == 'Y') { $not_interested_statuses[$jj] = "$temp_status"; }
                if ($row['unworkable'] == 'Y') { $unworkable_statuses[$jj] = "$temp_status"; }
                if ($row['scheduled_callback'] == 'Y') { $scheduled_callback_statuses[$jj] = "$temp_status"; }
                if ($row['completed'] == 'Y') { $completed_statuses[$jj] = "$temp_status"; }
                $i++;
                $jj++;
            }

            $human_answered_statuses_array = array_values($human_answered_statuses);

            $sale_statuses_array = array_values($sale_statuses);
            $dnc_statuses_array = array_values($dnc_statuses);
            $customer_contact_statuses_array = array_values($customer_contact_statuses);
            $not_interested_statuses_array = array_values($not_interested_statuses);
            $unworkable_statuses_array = array_values($unworkable_statuses);
            $scheduled_callback_statuses_array = array_values($scheduled_callback_statuses);
            $completed_statuses_array = array_values($completed_statuses);

            $max_calls = 1; $graph_stats = array();

            $listids_to_print = VicidialList::whereIn('list_id', $lists_id_str)->select(DB::raw('count(*) count, list_id'))->groupBy('list_id')->get()->toArray();

            $result = [];
            for($i=0;$i<count($listids_to_print);$i++){
            	$result[$i]= $listids_to_print[$i]['count'];
            }
            
            $i = 0;
            $list_id_lists = array();
            $list_id_calls = array();
            $total_leads = [];

            if(count($result)>0)
            $max_calls = max($result);

            $seperate_list_graph = [];
            $list_id_sql = [];
            $list_id_summery_graph = $header_list_id = $header_list_count = [];

            $ha_percent = $ha_count = $sale_count = $sale_percent = $dnc_count = $dnc_percent = $cc_count = $cc_percent = $ni_count = $ni_percent = $uw_count = $uw_percent = $sc_count = $sc_percent = $comp_count = $comp_percent = [];

            while ($i < count($listids_to_print)) {

                $row[0] = $listids_to_print[$i]['count'];
                $row[1] = $listids_to_print[$i]['list_id'];

                $list_id_calls[$i] = $row[0];
                $list_id_lists[$i] = $row[1];
                array_push($list_id_sql, $row[1]);


                $graph_stats[$i]['lead'] = $row[1];
                $graph_stats[$i]['list'] = $row[0];
                            	
                $list_name_to_print = VicidialLists::where('list_id', $list_id_lists[$i])
                									->select(DB::raw('list_name, active'))
                									->limit(1)
                									->get()->toArray();
                
                if (count($list_name_to_print) > 0) {
                    $row = $list_name_to_print[0];

                    $list_id_list_names[$i] = $row['list_name'];
                    $concat_str = $listids_to_print[$i]['list_id']." - ".$row['list_name'];
                    $concat_str_name = $row['list_name'];
                    if ($row['active'] == 'Y') {
                        $graph_stats[$i]['lead'] = $concat_str." (ACTIVE)";
                        $list_id_list_names[$i] = $concat_str_name." (ACTIVE)";
                    } else {
                        $graph_stats[$i]['lead'] = $concat_str." (INACTIVE)";
                        $list_id_list_names[$i] = $concat_str_name." (INACTIVE)";
                    }
                }

                $total_leads[$i] = isset($total_leads[$i])?$total_leads[$i]:0;
                $total_leads[$i] = ($total_leads[$i] + $list_id_calls[$i]);

                $list_id_summery_graph[$i]['lead'] = $graph_stats[$i]['lead'];
                $list_id_summery_graph[$i]['list'] = $graph_stats[$i]['list'];



                $header_list_id_temp = "$list_id_lists[$i] - $list_id_list_names[$i]";
                $header_list_id[$i] = $header_list_id_temp; 

                while (strlen($header_list_id_temp) > 51) {
                	$header_list_id_temp = substr("$header_list_id_temp", 0, -1);
                }

                $header_list_count[$i] = $list_id_calls[$i]; 

                while (strlen($header_list_count[$i]) > 10) {
                	$header_list_count[$i] = substr($header_list_count[$i], 0, -1);
                }

                $ha_results = VicidialList::whereIn('status', $human_answered_statuses_array)
                							->where('list_id',$list_id_lists[$i])
        									->select(DB::raw('COUNT(*) AS count'))
        									->get()->toArray();
        		
        		if ($ha_results[0]['count'] > 0 ) {
                    $ha_count[$i] = $ha_results[0]['count'];
                    
                    if ($ha_count[$i] > 0) {
                        $ha_percent[$i] = ( ($ha_count[$i] / $list_id_calls[$i]) * 100);
                    }
                }
                $ha_count[$i] = isset($ha_count[$i])?$ha_count[$i]:0;
                if ($ha_count[$i] > $max_flags) { $max_flags = $ha_count[$i]; }

                $sale_results = VicidialList::whereIn('status', $sale_statuses_array)
                							->where('list_id',$list_id_lists[$i])
        									->select(DB::raw('COUNT(*) AS count'))
        									->get()->toArray();

                if ($sale_results[0]['count'] > 0) {
                    $sale_count[$i] = $sale_results[0]['count'];
                    if ($sale_count[$i] > 0) {
                        $sale_percent[$i] = (($sale_count[$i] / $list_id_calls[$i]) * 100);
                    }
                }
                $sale_count[$i] = isset($sale_count[$i])?$sale_count[$i]:0;
                if ($sale_count[$i] > $max_flags) { $max_flags = $sale_count[$i]; }

                $dnc_results = VicidialList::whereIn('status', $dnc_statuses_array)
                							->where('list_id',$list_id_lists[$i])
        									->select(DB::raw('COUNT(*) AS count'))
        									->get()->toArray();

                if ($dnc_results[0]['count'] > 0) {
                    $dnc_count[$i] = $dnc_results[0]['count'];
                    if ($dnc_count[$i] > 0) {
                        $dnc_percent[$i] = ( ($dnc_count[$i] / $list_id_calls[$i]) * 100);
                    }
                }
                $dnc_count[$i] = isset($dnc_count[$i])?$dnc_count[$i]:0;
                if ($dnc_count[$i] > $max_flags) { $max_flags = $dnc_count[$i]; }


                $cc_results = VicidialList::whereIn('status', $customer_contact_statuses_array)
                							->where('list_id',$list_id_lists[$i])
        									->select(DB::raw('COUNT(*) AS count'))
        									->get()->toArray();

                if ($cc_results[0]['count'] > 0 ) {
                    $cc_count[$i] = $cc_results[0]['count'];
                    if ($cc_count[$i] > 0) {
                        $cc_percent[$i] = ( ($cc_count[$i] / $list_id_calls[$i]) * 100);
                    }
                }
                $cc_count[$i] = isset($cc_count[$i])?$cc_count[$i]:0;
                if ($cc_count[$i] > $max_flags) { $max_flags = $cc_count[$i]; }
                $list_id_sql_array = array_values($list_id_sql);


                $ni_results = VicidialList::whereIn('status', $not_interested_statuses_array)
                							->where('list_id',$list_id_lists[$i])
        									->select(DB::raw('COUNT(*) AS count'))
        									->get()->toArray();

                if ($ni_results[0]['count'] > 0) {
                    $ni_count[$i] = $ni_results[0]['count'];
                    if ($ni_count[$i] > 0) {
                        $ni_percent[$i] = ( ($ni_count[$i] / $list_id_calls[$i]) * 100);
                    }
                }
                $ni_count[$i] = isset($ni_count[$i])?$ni_count[$i]:0;
                if ($ni_count[$i] > $max_flags) { $max_flags = $ni_count[$i]; }


                $uw_results = VicidialList::whereIn('status', $unworkable_statuses_array)
                							->where('list_id',$list_id_lists[$i])
        									->select(DB::raw('COUNT(*) AS count'))
        									->get()->toArray();

        		if ($uw_results[0]['count'] > 0) {
                    $uw_count[$i] = $uw_results[0]['count'];
                    if ($uw_count[$i] > 0) {
                        $uw_percent[$i] = ( ($uw_count[$i] / $list_id_calls[$i]) * 100);
                    }
                }
                $uw_count[$i] = isset($uw_count[$i])?$uw_count[$i]:0;
                if ($uw_count[$i] > $max_flags) { $max_flags = $uw_count[$i]; }

                $sc_results = VicidialList::whereIn('status', $scheduled_callback_statuses_array)
                							->where('list_id',$list_id_lists[$i])
        									->select(DB::raw('COUNT(*) AS count'))
        									->get()->toArray();
        		
                if ($sc_results[0]['count'] > 0) {
                    $sc_count[$i] = $sc_results[0]['count'];
                    if ($sc_count[$i] > 0) {
                        $sc_percent[$i] = ( ($sc_count[$i] / $list_id_calls[$i]) * 100);
                    }
                }
                $sc_count[$i] = isset($sc_count[$i])?$sc_count[$i]:0;
                if ($sc_count[$i] > $max_flags) { $max_flags = $sc_count[$i]; }

                $list_id_sql_array = array_values($list_id_sql);


                $comp_results = VicidialList::whereIn('status', $completed_statuses_array)
                							->where('list_id',$list_id_lists[$i])
        									->select(DB::raw('COUNT(*) AS count'))
        									->get()->toArray();

                if ($comp_results[0]['count'] > 0) {
                    $comp_count[$i] = $comp_results[0]['count'];
                    if ($comp_count[$i] > 0) {
                        $comp_percent[$i] = ( ($comp_count[$i] / $list_id_calls[$i]) * 100);
                    }
                }
                $comp_count[$i] = isset($comp_count[$i])?$comp_count[$i]:0;
                if ($comp_count[$i] > $max_flags) { $max_flags = $comp_count[$i]; }

                $ha_percent[$i] = isset($ha_percent[$i])?$ha_percent[$i]:0;
                while (strlen($ha_percent[$i]) > 6) {
                	$ha_percent[$i] = substr($ha_percent[$i], 0, -1);
                }

                $sale_percent[$i] = isset($sale_percent[$i])?$sale_percent[$i]:0;
                while (strlen($sale_percent[$i]) > 6) {
                	$sale_percent[$i] = substr($sale_percent[$i], 0, -1);
                }

                $dnc_percent[$i] = isset($dnc_percent[$i])?$dnc_percent[$i]:0;
                while (strlen($dnc_percent[$i]) > 6) {
                	$dnc_percent[$i] = substr($dnc_percent[$i], 0, -1);
                }

                $cc_percent[$i] = isset($cc_percent[$i])?$cc_percent[$i]:0;
                while (strlen($cc_percent[$i]) > 6) {
                	$cc_percent[$i] = substr($cc_percent[$i], 0, -1);
                }

                $ni_percent[$i] = isset($ni_percent[$i])?$ni_percent[$i]:0;
                while (strlen($ni_percent[$i]) > 6) {
                	$ni_percent[$i] = substr($ni_percent[$i], 0, -1);
                }

                $uw_percent[$i] = isset($uw_percent[$i])?$uw_percent[$i]:0;
                while (strlen($uw_percent[$i]) > 6) {
                	$uw_percent[$i] = substr($uw_percent[$i], 0, -1);
                }

                $sc_percent[$i] = isset($sc_percent[$i])?$sc_percent[$i]:0;
                while (strlen($sc_percent[$i]) > 6) {
                	$sc_percent[$i] = substr($sc_percent[$i], 0, -1);
                }

                $comp_percent[$i] = isset($comp_percent[$i])?$comp_percent[$i]:0;
                while (strlen($comp_percent[$i]) > 6) {
                	$comp_percent[$i] = substr($comp_percent[$i], 0, -1);
                }

                $ha_count[$i] = isset($ha_count[$i])?$ha_count[$i]:0;
                while (strlen($ha_count[$i]) > 9) {
                	$ha_count[$i] = substr($ha_count[$i], 0, -1);
                }

                $sale_count[$i] = isset($sale_count[$i])?$sale_count[$i]:0;
                while (strlen($sale_count[$i]) > 9) {
                	$sale_count[$i] = substr($sale_count[$i], 0, -1);
                }

                $dnc_count[$i] = isset($dnc_count[$i])?$dnc_count[$i]:0;
                while (strlen($dnc_count[$i]) > 9) {
                	$dnc_count[$i] = substr($dnc_count[$i], 0, -1);
                }

                $cc_count[$i] = isset($cc_count[$i])?$cc_count[$i]:0;
                while (strlen($cc_count[$i]) > 9) {
                	$cc_count[$i] = substr($cc_count[$i], 0, -1);
                }

                $ni_count[$i] = isset($ni_count[$i])?$ni_count[$i]:0;
                while (strlen($ni_count[$i]) > 9) {
                	$ni_count[$i] = substr($ni_count[$i], 0, -1); 
                }

                $uw_count[$i] = isset($uw_count[$i])?$uw_count[$i]:0;
                while (strlen($uw_count[$i]) > 9) {
                	$uw_count[$i] = substr($uw_count[$i], 0, -1);
                }

                $sc_count[$i] = isset($sc_count[$i])?$sc_count[$i]:0;
                while (strlen($sc_count[$i]) > 9) {
                	$sc_count[$i] = substr($sc_count[$i], 0, -1);
                }

                $comp_count[$i] = isset($comp_count[$i])?$comp_count[$i]:0;
                while (strlen($comp_count[$i]) > 9) {
                	$comp_count[$i] = substr($comp_count[$i], 0, -1);
                }

                $liststatussum_to_print = VicidialList::where('list_id',$list_id_lists[$i])
        									->select(DB::raw('status, count(*) count'))
        									->groupBy('status')
        									->orderBy('status', 'asc')
        									->get()->toArray();

                $final_total = 0;
                $graph_statss = array();
                $seperate_list_graphExtra = [];

                $resultss = [];
	            for($j=0;$j<count($liststatussum_to_print);$j++){
	            	$resultss[$j]= $liststatussum_to_print[$j]['count'];
	            }
                $max_statuss = max($resultss);
                $final_total = array_sum($resultss);

                $r = 0;
                while ($r < count($liststatussum_to_print)) {
                    $row[0] = $liststatussum_to_print[$r]['status'];
                    $row[1] = $liststatussum_to_print[$r]['count'];
                    $list_id_status[$r] = $row[0];
                    $list_id_counts[$r] = $row[1];
                    $graph_statss[$r]['category'] = $row[0];
                    $graph_statss[$r]['count'] = $row[1];


                    $seperate_list_graphExtra[$r][0] = $row[0];
                    $seperate_list_graphExtra[$r][1] = $row[1];

                    if ($row[1] > $max_status) { $max_status = $row[1]; }
                    $graph_statss[$r]['max_status'] = $max_status;
                    $r++;
                }

                $status_flage_count_total[$i] = max(array($ha_count[$i], $sale_count[$i], $dnc_count[$i], $cc_count[$i], $ni_count[$i], $uw_count[$i], $sc_count[$i], $comp_count[$i]));


                $status_flage_count1[$i] = array('listheading' => $header_list_id[$i], 'totallist' => $header_list_count[$i],
                    'human_answer' => $ha_count[$i]." (".str_replace(' ', '', $ha_percent[$i])."%)", 'ha' => $ha_count[$i],
                    'sale' => $sale_count[$i]." (".str_replace(' ', '', $sale_percent[$i])."%)", 'sa' => $sale_count[$i],
                    'dnc' => $dnc_count[$i]." (".str_replace(' ', '', $dnc_percent[$i])."%)", 'dn' => $dnc_count[$i],
                    'customer_contact' => $cc_count[$i]." (".str_replace(' ', '', $cc_percent[$i])."%)", 'cc' => $cc_count[$i],
                    'not_interested' => $ni_count[$i]." (".str_replace(' ', '', $ni_percent[$i])."%)", 'ni' => $ni_count[$i],
                    'unworkable' => $uw_count[$i]." (".str_replace(' ', '', $uw_percent[$i])."%)", 'uw' => $uw_count[$i],
                    'scheduled_callbacks' => $sc_count[$i]." (".str_replace(' ', '', $sc_percent[$i])."%)", 'sc' => $sc_count[$i],
                    'completed' => $comp_count[$i]." (".str_replace(' ', '', $comp_percent[$i])."%)",
                    'com' => $comp_count[$i],
                    'max_flag' => $max_flags[$i],
                    'graph_array' => $graph_statss);


                $seperate_list_graph[$i]['listheading'] = $status_flage_count1[$i]['listheading'];
                $seperate_list_graph[$i]['totallist'] = $status_flage_count1[$i]['totallist'];
                $seperate_list_graph[$i]['totallist'] = $status_flage_count1[$i]['totallist'];
                $header_1_array = ['FLAG', 'COUNT %'];
                $seperate_list_graph[$i]['header_1_array'] = $header_1_array;

                $human_answer_array = ['Human Answer', $status_flage_count1[$i]['human_answer']];
                $seperate_list_graph[$i]['human_answer'] = $human_answer_array;

                $sale_array = ['Sale', $status_flage_count1[$i]['sale']];
                $seperate_list_graph[$i]['sale'] = $sale_array;
                
                $dnc_array = ['DNC', $status_flage_count1[$i]['dnc']];
                $seperate_list_graph[$i]['dnc'] = $dnc_array;
                
                $customer_contact_array = ['Customer Contact', $status_flage_count1[$i]['customer_contact']];
                $seperate_list_graph[$i]['customer_contact'] = $customer_contact_array;
                
                $not_interested_array = ['Not Interested', $status_flage_count1[$i]['not_interested']];
                $seperate_list_graph[$i]['not_interested'] = $not_interested_array;
                
                $unworkable_array = ['Unworkable', $status_flage_count1[$i]['unworkable']];
                $seperate_list_graph[$i]['unworkable'] = $unworkable_array;
                
                $scheduled_callbacks_array = ['Scheduled Callbacks', $status_flage_count1[$i]['scheduled_callbacks']];
                $seperate_list_graph[$i]['scheduled_callbacks'] = $scheduled_callbacks_array;
                
                $completed_array = ['Completed', $status_flage_count1[$i]['completed']];
                $seperate_list_graph[$i]['completed'] = $completed_array;

                $header_2_array = ['CATEGORY', 'CALL COUNT'];
                $seperate_list_graph[$i]['header_2_array'] = $header_2_array;
                

                $seperate_list_graph[$i]['header_2_data'] = $seperate_list_graphExtra;


                $total_array = ['Total', $final_total];
                $seperate_list_graph[$i]['final_total'] = $total_array;

                $i++;
            }
            
            $total_leads = array_sum($total_leads);

            $total_leadss = $total_leads;

            $total = $total_leads;
            $list_id_summery = $graph_stats;

            $frist_maxcall = $max_calls;

            $ha_count = $ha_percent = $sale_count = $sale_percent = $dnc_count = $dnc_percent = $cc_count = $cc_percent = $ni_count = $ni_percent = $uw_count = $uw_percent = $sc_count = $sc_percent = $comp_count = $comp_percent = $flag_count = 0;

            $max_calls = 1; $graph_stats = array();
            if(count($list_id_sql)>0){
				$list_id_sql_array = array_values($list_id_sql);
            } else {
            	$list_id_sql_array = [''];
            }
            
            for($l=0;$l<count($lists_id_str);$l++){
            	array_push($list_id_sql_array, $lists_id_str[$l]['list_id']);
            }
            
            $ha_results = VicidialList::whereIn('status', $human_answered_statuses_array)
            							->whereIn('list_id',$list_id_sql_array)
    									->select(DB::raw('COUNT(*) AS count'))
    									->get()->toArray();

			if ($ha_results[0]['count'] > 0) {
                $row = $ha_results[0]['count'];
                $ha_count = $row;
                $flag_count+=$row;
                if ($ha_count > 0) {
                    if ($ha_count > $max_calls) { $max_calls = $ha_count; }
                    if($total_leads>0)
                    $ha_percent = (($ha_count / $total_leads) * 100);
                }
            }

            $sale_results = VicidialList::whereIn('status', $sale_statuses_array)
            							->whereIn('list_id',$list_id_sql_array)
    									->select(DB::raw('COUNT(*) AS count'))
    									->get()->toArray();

            if ($sale_results[0]['count'] > 0) {
                $row = $sale_results[0]['count'];
                $sale_count = $row;
                $flag_count+=$row;
                if ($sale_count > 0) {
                    if ($sale_count > $max_calls) { $max_calls = $sale_count; }
                    if($total_leads>0)
                    $sale_percent = (($sale_count / $total_leads) * 100);
                }
            }

            $dnc_results = VicidialList::whereIn('status', $dnc_statuses_array)
            							->whereIn('list_id',$list_id_sql_array)
    									->select(DB::raw('COUNT(*) AS count'))
    									->get()->toArray();

            if ($dnc_results[0]['count'] > 0) {
                $dnc_count = $dnc_results[0]['count'];
                $flag_count+=$dnc_results[0]['count'];
                if ($dnc_count > 0) {
                    if ($dnc_count > $max_calls) { $max_calls = $dnc_count; }
                    if($total_leads>0)
                    $dnc_percent = (($dnc_count / $total_leads) * 100);
                }
            }

            $cc_results = VicidialList::whereIn('status', $customer_contact_statuses_array)
            							->whereIn('list_id',$list_id_sql_array)
    									->select(DB::raw('COUNT(*) AS count'))
    									->get()->toArray();

            if ($cc_results[0]['count'] > 0 ) {
                $cc_count = $cc_results[0]['count'];
                $flag_count+=$cc_results[0]['count'];
                if ($cc_count > 0) {
                    if ($cc_count > $max_calls) { $max_calls = $cc_count; }
                    if($total_leads>0)
                    $cc_percent = ( ($cc_count / $total_leads) * 100);
                }
            }

            $ni_results = VicidialList::whereIn('status', $not_interested_statuses_array)
            							->whereIn('list_id',$list_id_sql_array)
    									->select(DB::raw('COUNT(*) AS count'))
    									->get()->toArray();

            if ($ni_results[0]['count'] > 0) {
                $ni_count = $ni_results[0]['count'];
                $flag_count+=$ni_results[0]['count'];
                if ($ni_count > 0) {
                    if ($ni_count > $max_calls) { $max_calls = $ni_count; }
                    if($total_leads>0)
                    $ni_percent = ( ($ni_count / $total_leads) * 100);
                }
            }

            $uw_results = VicidialList::whereIn('status', $unworkable_statuses_array)
            							->whereIn('list_id',$list_id_sql_array)
    									->select(DB::raw('COUNT(*) AS count'))
    									->get()->toArray();

            if ($uw_results[0]['count'] > 0) {
                $uw_count = $uw_results[0]['count'];
                $flag_count+=$uw_results[0]['count'];
                if ($uw_count > 0) {
                    if ($uw_count > $max_calls) { $max_calls = $uw_count; }
                    if($total_leads>0)
                    $uw_percent = ( ($uw_count / $total_leads) * 100);
                }
            }

            $sc_results = VicidialList::whereIn('status', $scheduled_callback_statuses_array)
            							->whereIn('list_id',$list_id_sql_array)
    									->select(DB::raw('COUNT(*) AS count'))
    									->get()->toArray();

            if ($sc_results[0]['count'] > 0) {
                $sc_count = $sc_results[0]['count'];
                $flag_count+=$sc_results[0]['count'];
                if ($sc_count > 0) {
                    if ($sc_count > $max_calls) { $max_calls = $sc_count; }
                    if($total_leads>0)
                    $sc_percent = ( ($sc_count / $total_leads) * 100);
                }
            }

            $comp_results = VicidialList::whereIn('status', $completed_statuses_array)
            							->whereIn('list_id',$list_id_sql_array)
    									->select(DB::raw('COUNT(*) AS count'))
    									->get()->toArray();

            if ($comp_results[0]['count'] > 0) {
                $comp_count = $comp_results[0]['count'];
                $flag_count+=$comp_results[0]['count'];
                if ($comp_count > 0) {
                    if ($comp_count > $max_calls) { $max_calls = $comp_count; }
                    if($total_leads>0)
                    $comp_percent = ( ($comp_count / $total_leads) * 100);
                }
            }

            while (strlen($ha_percent) > 6) { $ha_percent = substr("$ha_percent", 0, -1); }

            while (strlen($sale_percent) > 6) { $sale_percent = substr("$sale_percent", 0, -1); }

            while (strlen($dnc_percent) > 6) { $dnc_percent = substr("$dnc_percent", 0, -1); }

            while (strlen($cc_percent) > 6) { $cc_percent = substr("$cc_percent", 0, -1); }

            while (strlen($ni_percent) > 6) { $ni_percent = substr("$ni_percent", 0, -1); }

            while (strlen($uw_percent) > 6) { $uw_percent = substr("$uw_percent", 0, -1); }

            while (strlen($sc_percent) > 6) { $sc_percent = substr("$sc_percent", 0, -1); }

            while (strlen($comp_percent) > 6) { $comp_percent = substr("$comp_percent", 0, -1); }

            while (strlen($ha_count) > 10) { $ha_count = substr("$ha_count", 0, -1); }

            while (strlen($sale_count) > 10) { $sale_count = substr("$sale_count", 0, -1); }

            while (strlen($dnc_count) > 10) { $dnc_count = substr("$dnc_count", 0, -1); }

            while (strlen($cc_count) > 10) { $cc_count = substr("$cc_count", 0, -1); }

            while (strlen($ni_count) > 10) { $ni_count = substr("$ni_count", 0, -1); }

            while (strlen($uw_count) > 10) { $uw_count = substr("$uw_count", 0, -1); }

            while (strlen($sc_count) > 10) { $sc_count = substr("$sc_count", 0, -1); }

            while (strlen($comp_count) > 10) { $comp_count = substr("$comp_count", 0, -1); }
            
            $total_status = $ha_count + $sale_count + $dnc_count + $cc_count + $ni_count + $uw_count + $sc_count + $comp_count;
            $status_flage_count = array('HumanAnswer' => $ha_count." (".$ha_percent."%)", 'Sale' => str_replace(' ', '', $sale_count."  (".$sale_percent."%)"),
                'DNC' => $dnc_count." (".str_replace(' ', '', $dnc_percent)."%)",
                'Customer Contact' => $cc_count." (".str_replace(' ', '', $cc_percent)."%)", 'Not Interested' => $ni_count." (".str_replace(' ', '', $ni_percent)."%)", 'Unworkable' => $uw_count." (".str_replace(' ', '', $uw_percent)."%)",
                'Scheduled Callbacks' => $sc_count." (".str_replace(' ', '', $sc_percent)."%)",
                'Completed' => $comp_count." (".str_replace(' ', '', $comp_percent)."%)");

            $status_max_calls = $max_calls;


            $status_flage_count_graph = [];
            $k=0;
            foreach ($status_flage_count as $key => $value) {
            	$status_flage_count_graph[$k]['key'] = $key;
            	$status_flage_count_graph[$k]['value'] = $value;
            	$k++;
            }

            $max_calls = 1; $graph_stats = array();
            $tot_cat_calls = 0;
            $r = 0; $i = 0;

            $categroy_stmt = array_values($categroy_stmt);
            $vsc_id = array_values($vsc_id);
            $vsc_name = array_values($vsc_name);
            
            while ($r < count($categroy_stmt)) {

                if ($vsc_id[$r] != 'UNDEFINED') {

                	$tot_cat_calls = ($tot_cat_calls + $loop_array[$r]);
	               
                    $category = $vsc_id[$r];
                    while (strlen($category) > 20) { $category = substr("$category", 0, -1); }

                    $cat_count = $loop_array[$r]; 
	                while (strlen($cat_count) > 10) { $cat_count = substr("$cat_count", 0, -1); }
                    
                    $cat_name = $vsc_name[$r]; 
                    while (strlen($cat_name) > 30) { $cat_name = substr("$cat_name", 0, -1); }

                    if ($loop_array[$r] > $max_calls) { $max_calls = $loop_array[$r]; }
                    $graph_stats[$i]['category'] = $vsc_id[$r];
	                $graph_stats[$i]['count'] = $loop_array[$r];
                    $i++;
                }

                $r++;
            }

            $category_state = $graph_stats;
            $category_max_call = $max_calls;

            $download_csv_array = [
                'list_id_summary',
                'status_flag_summery',
                'custom_status_category_stats',
                'per_list_detail_stats'
            ];

            if(isset($request['download_csv']) && in_array($request['download_csv'], $download_csv_array) && strlen($request['download_csv']) > 0 ){
                switch ($request['download_csv']) {
                    case "list_id_summary":
                        return $this->listIdSummaryCsv($list_id_summery, $total_leadss);
                        break;
                    case "status_flag_summery":
                        return $this->statusFlagSummeryCsv($status_flage_count_graph, $total_status);
                        break;
                    case "custom_status_category_stats":
                        return $this->customStatusCategoryStatsCsv($category_state, $tot_cat_calls);
                        break;
                    case "per_list_detail_stats":
                        return $this->perListDetailStatsCsv($seperate_list_graph);
                        break;
                    default:
                        echo "default";
                }
            } else {

	    		return response()->json([
	                'status'=>200,    
	                'message' => 'successfully.',
	                'list_id_summery' => $list_id_summery,
	                'list_id_summery_graph' => $list_id_summery_graph,
	                'total_leadss' => $total_leadss,
	                'status_flage_count_graph' => $status_flage_count_graph,
	                'total_status' => $total_status,
	                'seperate_list_graph' => $seperate_list_graph,
	                'category_state' => $category_state,
	                'category_state_total' => $tot_cat_calls,
	                'category_max_call' => $category_max_call,
	                'nowdate' => $now_time,
	                'download_csv_array' => $download_csv_array
	                ]);
    		}

        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.list_campaign_states_controller'), $e);
            throw $e;
        }
    }


    public function listIdSummaryCsv($list_id_summery, $total_leadss){

    	$filename = 'listIdSummary'.date("d-m-Y H:i").".csv";
        $handle = fopen($filename, 'w+');

        foreach($list_id_summery as $key => $rows){
            fputcsv($handle, $rows, ",",'"');   
        }

        $total_leadss_array = [
            '1' => ['Total', $total_leadss]
        ];

        foreach($total_leadss_array as $key => $rows){
            fputcsv($handle, $rows, ",",'"');   
        }

    	$headers = array(
            'Content-Type' => 'text/csv',
        );
        return Response::download($filename, $filename, $headers)->deleteFileAfterSend(true);
    }

    public function statusFlagSummeryCsv($status_flage_count_graph, $total_status){

    	$filename = 'statusFlagSummery'.date("d-m-Y H:i").".csv";
        $handle = fopen($filename, 'w+');

        foreach($status_flage_count_graph as $key => $rows){
            fputcsv($handle, $rows, ",",'"');   
        }

        $total_flag_summery_array = [
            '1' => ['Total', $total_status]
        ];
        foreach($total_flag_summery_array as $key => $rows){
            fputcsv($handle, $rows, ",",'"');   
        }

    	$headers = array(
            'Content-Type' => 'text/csv',
        );
        return Response::download($filename, $filename, $headers)->deleteFileAfterSend(true);
    }

    public function customStatusCategoryStatsCsv($category_state, $tot_cat_calls){

    	$filename = 'statusFlagSummery'.date("d-m-Y H:i").".csv";
        $handle = fopen($filename, 'w+');

        $header_category_stats_array = [
            '1' => ['CUSTOM STATUS CATEGORY STATS'],
            '2' => ['CATEGORY', 'CALLS']
        ];
        foreach($header_category_stats_array as $key => $rows){
            fputcsv($handle, $rows, ",",'"');   
        }

        foreach($category_state as $key => $rows){
            fputcsv($handle, $rows, ",",'"');   
        }

        $total_category_stats_array = [
            '1' => ['Total', $tot_cat_calls]
        ];
        foreach($total_category_stats_array as $key => $rows){
            fputcsv($handle, $rows, ",",'"');   
        }

    	$headers = array(
            'Content-Type' => 'text/csv',
        );
        return Response::download($filename, $filename, $headers)->deleteFileAfterSend(true);
    }

    public function perListDetailStatsCsv($seperate_list_graph){

    	$filename = 'perListDetailStats'.date("d-m-Y H:i").".csv";
        $handle = fopen($filename, 'w+');

        $header_category_stats_array = [
            '1' => ['PER LIST DETAIL STATS']
        ];
        foreach($header_category_stats_array as $key => $rows){
            fputcsv($handle, $rows, ",",'"');   
        }

        foreach($seperate_list_graph as $key => $rows){
            
            $data_array = [
            	1 => [$rows['listheading'].'                      Total Leads:         '.$rows['totallist']],
            	2 => [$rows['header_1_array'][0], $rows['header_1_array'][1]],
            	3 => [$rows['human_answer'][0], $rows['human_answer'][1]],
            	4 => [$rows['sale'][0], $rows['sale'][1]],
            	5 => [$rows['dnc'][0], $rows['dnc'][1]],
            	6 => [$rows['customer_contact'][0], $rows['customer_contact'][1]],
            	7 => [$rows['not_interested'][0], $rows['not_interested'][1]],
            	8 => [$rows['unworkable'][0], $rows['unworkable'][1]],
            	9 => [$rows['scheduled_callbacks'][0], $rows['scheduled_callbacks'][1]],
            	10 => [$rows['completed'][0], $rows['completed'][1]],
            	11 => [$rows['header_2_array'][0], $rows['header_2_array'][1]]
            ];

            foreach($data_array as $data_key => $data_rows){
	            fputcsv($handle, $data_rows, ",",'"');   
	        }

            foreach($rows['header_2_data'] as $header_key => $header_rows){
	            fputcsv($handle, $header_rows, ",",'"');   
	        }

	        $final_array = [1=>[$rows['final_total'][0], $rows['final_total'][1]] ];
	        foreach($final_array as $final_key => $final_rows){
	            fputcsv($handle, $final_rows, ",",'"');   
	        }

	        fputcsv($handle, [], ",",'"'); 
        }

    	$headers = array(
            'Content-Type' => 'text/csv',
        );
        return Response::download($filename, $filename, $headers)->deleteFileAfterSend(true);
    }

}