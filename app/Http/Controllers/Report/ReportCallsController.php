<?php

namespace App\Http\Controllers\Report;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Model;
use App\VicidialCloserLog;
use App\Traits\AccessControl;
use Response;
use App\Traits\TimeConvert;
use Illuminate\Support\Facades\DB;
use App\VicidialCampaignStatuses;
use App\VicidialStatuses;
use App\VicidialLists;
use App\VicidialLog;
use App\ReportFile;
use App\GoogleStorageFile;
use Illuminate\Support\Facades\URL;
use App\ReportFileQueue;

class ReportCallsController extends Controller {

    use AccessControl, TimeConvert;
    
    /**
     * Campaign Status Report .
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param Request $request
     * @return type
     * @throws \App\Http\Controllers\Report\Exception
     */
    public function campaignStatusListReport(Request $request) {
        try {
            $startdate = $request->input('startdate');
            $enddate = $request->input('enddate');
            $starttime = $request->input('starttime');
            $endtime = $request->input('endtime');
            $group = $request->input('selectedgroups');
            $i = 0;
            $querybegindate = $startdate." ".$starttime;
            $queryenddate = $enddate." ".$endtime;

            $campaignlistarray = array();
            $total_calls_array = array();
            $campaignlistnames = array();
            $max_calls1 = 0;
            $max_duration1 = 0;
            $max_handing_time1 = 0;
            $total_calls1 = 0; $total_handle_time1 = 0; $total_duration1 = 0;
            $listactive_array = $total_callsarray1 =[];
            
            while ($i < count($group)) {
                $mainArray = array();
                $statuslist1 = VicidialCampaignStatuses::getCampaignStatuslistReport($group[$i]);
                
                $statuslist2 = VicidialStatuses::getCampaignStatuslistReport($group[$i]);
                
                $status1 = $this->getFormattedStatusArray1($statuslist1);
                $status2 = $this->getFormattedStatusArray1($statuslist2);
                
                $statusunionarray = array_merge($status1, $status2);
                $statusarray = array_unique($statusunionarray, SORT_REGULAR);
                $finalstatusarray = array();
                foreach ($statusarray as $k => $v) {
                    array_push($finalstatusarray, $v);
                }
                
                $statuscount = 0;
                while ($statuscount < count($finalstatusarray)) {

                    $status_ary[$finalstatusarray[$statuscount][0]] = $finalstatusarray[$statuscount][1];
                    $ha_ary[$finalstatusarray[$statuscount][0]] = $finalstatusarray[$statuscount][2];
                    $sale_ary[$finalstatusarray[$statuscount][0]] = $finalstatusarray[$statuscount][3];
                    $dnc_ary[$finalstatusarray[$statuscount][0]] = $finalstatusarray[$statuscount][4];
                    $cc_ary[$finalstatusarray[$statuscount][0]] = $finalstatusarray[$statuscount][5];
                    $ni_ary[$finalstatusarray[$statuscount][0]] = $finalstatusarray[$statuscount][6];
                    $uw_ary[$finalstatusarray[$statuscount][0]] = $finalstatusarray[$statuscount][8];
                    $sc_ary[$finalstatusarray[$statuscount][0]] = $finalstatusarray[$statuscount][7];
                    $comp_ary[$finalstatusarray[$statuscount][0]] = $finalstatusarray[$statuscount][9];
                    $statuscount++;
                }
                
                $uarray[$i] = array();
                $campaignlists = VicidialLists::getCampaignStatuslist($group[$i]);
                
                if(isset($campaignlists)) {
                        $campaignlists = $campaignlists->toArray();
                        if(!empty($campaignlists)){
                            array_push($listactive_array, $campaignlists[0]['active']);
                        }
                } else {
                    $campaignlists = [];
                }
                $j = 0;
                $campaignlistnames[$i]['campaignid'] = $group[$i];
                
                ########LIST WHILE###############
                $total_callsarray1 = array();
                $statusflags1 = array();
                
                while ($j < count($campaignlists)) {
                    $ha_count = 0;
                    $sale_count = 0;
                    $dnc_count = 0;
                    $cc_count = 0;
                    $ni_count = 0;
                    $uw_count = 0;
                    $sc_count = 0;
                    $comp_count = 0;
                    $result1 = VicidialLog::campaignStatusList($campaignlists[$j]['list_id'],$queryenddate , $querybegindate);
                    $result2 = VicidialCloserLog::campaignStatusList($campaignlists[$j]['list_id'],$queryenddate , $querybegindate);
                    
                    $rs1 = $this->getFormattedResult($result1);
                    $rs2 = $this->getFormattedResult($result2);
                    
                    $unionarray = array_merge($rs1, $rs2);

                    $uarray = array_unique($unionarray, SORT_REGULAR);
                    $result_array = array();
                    foreach ($uarray as $k => $v) {
                        array_push($result_array, $v);
                    }
                    $listid = $campaignlists[$j]['list_id'];
                    $maxcalls_array = array();
                    $dispo_ary[$j] = array();
                    $total_calls = 0; $total_handle_time = 0; $total_duration = 0;
                    
                    #CONDITION
                    if (count($result_array) > 0) {
                        $total_calls_array[$j]['list_id'] = $campaignlists[$j]['list_id'];
                        $total_calls_array[$j]['campaign_id'] = $group[$i];
                        $graph_stats = array();
                        $max_calls = 1;
                        $max_duration = 1;
                        $max_handletime = 1;

                        $cnt = 0;
                        $max_calls = 0;
                        $max_duration = 0;
                        $max_handing_time = 0;

                        
                        while ($cnt < count($result_array)) {
                            if(!isset(  $dispo_ary[$j][$result_array[$cnt][0]][0] )) { $dispo_ary[$j][$result_array[$cnt][0]][0]= 0;}
                            if(!isset(  $dispo_ary[$j][$result_array[$cnt][0]][1] )) { $dispo_ary[$j][$result_array[$cnt][0]][0]= 0;}
                            if(!isset(  $dispo_ary[$j][$result_array[$cnt][0]][2] )) { $dispo_ary[$j][$result_array[$cnt][0]][0]= 0;}
                            if(!isset(  $dispo_ary[$j][$result_array[$cnt][0]][3] )) { $dispo_ary[$j][$result_array[$cnt][0]][0]= 0;}
                            if(!isset(  $dispo_ary[$j][$result_array[$cnt][0]][4] )) { $dispo_ary[$j][$result_array[$cnt][0]][0]= 0;}
                            if(!isset(  $dispo_ary[$j][$result_array[$cnt][0]][5] )) { $dispo_ary[$j][$result_array[$cnt][0]][0]= 0;}
                            $dispo_ary[$j][$result_array[$cnt][0]][0] ++;
                            if ($dispo_ary[$j][$result_array[$cnt][0]][0] > $max_calls) { $max_calls = $dispo_ary[$j][$result_array[$cnt][0]][0]; }
                            
                            $dispo_ary[$j][$result_array[$cnt][0]][1] = (isset($dispo_ary[$j][$result_array[$cnt][0]][1] ) ? $dispo_ary[$j][$result_array[$cnt][0]][1]  : 0 ) +  $result_array[$cnt][2];
                            if ($dispo_ary[$j][$result_array[$cnt][0]][1] > $max_duration) { $max_duration = $dispo_ary[$j][$result_array[$cnt][0]][1]; }
                            $dispo_ary[$j][$result_array[$cnt][0]][2]= (isset($dispo_ary[$j][$result_array[$cnt][0]][2] ) ? $dispo_ary[$j][$result_array[$cnt][0]][2]  : 0 ) +  $result_array[$cnt][3];
                            if ($dispo_ary[$j][$result_array[$cnt][0]][2] > $max_handing_time) { $max_handing_time = $dispo_ary[$j][$result_array[$cnt][0]][2]; }
                            $dispo_ary[$j][$result_array[$cnt][0]][3] = $this->secConvert($dispo_ary[$j][$result_array[$cnt][0]][1], 'H');
                            $dispo_ary[$j][$result_array[$cnt][0]][4] = $this->secConvert($dispo_ary[$j][$result_array[$cnt][0]][2], 'H');
                            $total_calls++;
                            $total_duration+=$result_array[$cnt][2];
                            $total_handle_time+=$result_array[$cnt][3];

                            $dispo_ary[$j][$result_array[$cnt][0]][5] = isset($status_ary[$result_array[$cnt][0]]) ? $status_ary[$result_array[$cnt][0]] : 0; 
                            
                            if (isset($ha_ary[$result_array[$cnt][0]] ) &&  $ha_ary[$result_array[$cnt][0]] == "Y") { $ha_count++; }
                            if (isset($sale_ary[$result_array[$cnt][0]] ) && $sale_ary[$result_array[$cnt][0]] == "Y") { $sale_count++; }
                            if (isset($dnc_ary[$result_array[$cnt][0]] ) && $dnc_ary[$result_array[$cnt][0]] == "Y") { $dnc_count++; }
                            if (isset($cc_ary[$result_array[$cnt][0]] ) && $cc_ary[$result_array[$cnt][0]] == "Y") { $cc_count++; }
                            if (isset($ni_ary[$result_array[$cnt][0]] ) && $ni_ary[$result_array[$cnt][0]] == "Y") { $ni_count++; }
                            if (isset($uw_ary[$result_array[$cnt][0]] ) && $uw_ary[$result_array[$cnt][0]] == "Y") { $uw_count++; }
                            if (isset($sc_ary[$result_array[$cnt][0]] ) && $sc_ary[$result_array[$cnt][0]] == "Y") { $sc_count++; }
                            if (isset($comp_ary[$result_array[$cnt][0]] ) && $comp_ary[$result_array[$cnt][0]] == "Y") { $comp_count++; }
                            $cnt++;
                        }
                        $total_calls_array[$j]['maxValue']['calls'] = $max_calls;
                        if ($total_calls_array[$j]['maxValue']['calls'] > $max_calls1) { $max_calls1 = $total_calls_array[$j]['maxValue']['calls']; }

                        $total_calls_array[$j]['maxValue']['duration'] = $max_duration;
                        if ($total_calls_array[$j]['maxValue']['duration'] > $max_duration1) { $max_duration1 = $total_calls_array[$j]['maxValue']['duration']; }
                        $total_calls_array[$j]['maxValue']['handling'] = $max_handing_time;
                        if ($total_calls_array[$j]['maxValue']['handling'] > $max_handing_time1) { $max_handing_time1 = $total_calls_array[$j]['maxValue']['handling']; }
                        $total_calls1 = $total_calls;
                        $total_duration1 = $total_duration;
                        $total_handle_time1 = $total_handle_time;
                        #max value
                        $total_callsarray1['calls'] = $max_calls1;
                        $total_callsarray1['duration'] = $max_duration1;
                        $total_callsarray1['handling'] = $max_handing_time1;
                        #total value
                        $total_callsarray1['total_calls'] = $total_calls1;
                        $total_callsarray1['total_duration'] = $this->secConvert($total_duration1, 'H');
                        $total_callsarray1['total_handle_time'] = $this->secConvert($total_handle_time1, 'H');

                        $ha_percent = sprintf(100 * ($ha_count / $total_calls)); while (strlen($ha_percent) > 6) { $ha_percent = substr("$ha_percent", 0, -1); }
                        $sale_percent = sprintf(100 * ($sale_count / $total_calls)); while (strlen($sale_percent) > 6) { $sale_percent = substr("$sale_percent", 0, -1); }
                        $dnc_percent = sprintf(100 * ($dnc_count / $total_calls)); while (strlen($dnc_percent) > 6) { $dnc_percent = substr("$dnc_percent", 0, -1); }
                        $cc_percent = sprintf(100 * ($cc_count / $total_calls)); while (strlen($cc_percent) > 6) { $cc_percent = substr("$cc_percent", 0, -1); }
                        $ni_percent = sprintf(100 * ($ni_count / $total_calls)); while (strlen($ni_percent) > 6) { $ni_percent = substr("$ni_percent", 0, -1); }
                        $uw_percent = sprintf(100 * ($uw_count / $total_calls)); while (strlen($uw_percent) > 6) { $uw_percent = substr("$uw_percent", 0, -1); }
                        $sc_percent = sprintf(100 * ($sc_count / $total_calls)); while (strlen($sc_percent) > 6) { $sc_percent = substr("$sc_percent", 0, -1); }
                        $comp_percent = sprintf(100 * ($comp_count / $total_calls)); while (strlen($comp_percent) > 6) { $comp_percent = substr("$comp_percent", 0, -1); }

                        $ha_count = sprintf("$ha_count"); while (strlen($ha_count) > 9) { $ha_count = substr("$ha_count", 0, -1); }
                        $sale_count = sprintf("$sale_count"); while (strlen($sale_count) > 9) { $sale_count = substr("$sale_count", 0, -1); }
                        $dnc_count = sprintf("$dnc_count"); while (strlen($dnc_count) > 9) { $dnc_count = substr("$dnc_count", 0, -1); }
                        $cc_count = sprintf("$cc_count"); while (strlen($cc_count) > 9) { $cc_count = substr("$cc_count", 0, -1); }
                        $ni_count = sprintf("$ni_count"); while (strlen($ni_count) > 9) { $ni_count = substr("$ni_count", 0, -1); }
                        $uw_count = sprintf("$uw_count"); while (strlen($uw_count) > 9) { $uw_count = substr("$uw_count", 0, -1); }
                        $sc_count = sprintf("$sc_count"); while (strlen($sc_count) > 9) { $sc_count = substr("$sc_count", 0, -1); }
                        $comp_count = sprintf("$comp_count"); while (strlen($comp_count) > 9) { $comp_count = substr("$comp_count", 0, -1); }


                        $statusflags1 = array('ha_count' => $ha_count, 'sale_count' => $sale_count, 'dnc_count' => $dnc_count,
                            'cc_count' => $cc_count, 'ni_count' => $ni_count, 'uw_count' => $uw_count, 'sc_count' => $sc_count, 'comp_count' => $comp_count,
                            'ha_percent' => $ha_percent, 'sale_percent' => $sale_percent, 'dnc_percent' => $dnc_percent, 'cc_percent' => $cc_percent,
                            'ni_percent' => $ni_percent, 'uw_percent' => $uw_percent, 'cc_percent' => $cc_percent, 'sc_percent' => $sc_percent, 'comp_percent' => $comp_percent
                        );
                    }
                    if(!isset($total_callsarray1)) { $total_callsarray1 = [];}
                    if(!isset($statusflags1)) { $statusflags1 = [];}
                    $singleArray = array('list' => $campaignlists[$j], 'dispo' => $dispo_ary[$j], 'totalmax' => $total_callsarray1, 'statusflags' => $statusflags1);
                    unset($total_callsarray1);
                    unset($statusflags1);
                    array_push($mainArray, $singleArray);

                    $j++;
                }

                $campaignlistnames[$i]['listed'] = $mainArray;
                $i++;
            }
            
            $result = array('requestdate' => $request->input(), 'campaignlistnames' => $campaignlistnames);
            
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
     * To convert array into formate as given.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param type $array
     * @return array
     * @throws \App\Http\Controllers\Report\Exception
     */
    public function getFormattedStatusArray1($array) {
        try {
            $returnarray = array();
            for ($i = 0; $i < count($array); $i++) {
                $singlearray = array($array[$i]['status'],
                    $array[$i]['status_name'],
                    $array[$i]['human_answered'],
                    $array[$i]['sale'],
                    $array[$i]['dnc'],
                    $array[$i]['customer_contact'],
                    $array[$i]['not_interested'],                    
                    $array[$i]['unworkable'],
                    $array[$i]['scheduled_callback'],
                    $array[$i]['completed']
                );
                array_push($returnarray, $singlearray);
            }
            return $returnarray;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }
    /**
     * Array formate as per requirement.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param type $array
     * @return array
     * @throws \App\Http\Controllers\Report\Exception
     */
    public function getFormattedResult($array){
        try {
            if(isset($array)) {$array_cnt = $array->count(); } else { $array_cnt = 0; }
            $returnarray = array();
            for ($i = 0; $i < $array_cnt; $i++) {
                $singlearray = array($array[$i]->status, floatval($array[$i]->uniqueid), $array[$i]->duration, $array[$i]->handletime);
                array_push($returnarray, $singlearray);
            }
            return $returnarray;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.inbound'), $e);
            throw $e;
        }
    }
    
    /**
     * Csv file download for campaign status list report.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param Request $request
     * @return Download CSV file
     * @throws \App\Http\Controllers\Report\Exception
     */
    public function csvCampaignStatusListReport(Request $request) {
        try {
            $result = $this->campaignStatusListReport($request);
            $null = [];
            $header = ['DISPOSITION','CALLS','DURATION','HANDLE TIME'];
            $header2 = ['STATUS FLAGS BREAKDOWN:','(and % of total leads in the list)'];
            
            $filename = "Campaign_Status_List_Report".date('Y-m-dh:i:s').".csv";
            $handle = fopen($filename, 'w+');
            foreach( $result['campaignlistnames'] as $key => $val) {
                foreach( $val['listed'] as $ky => $vl) {
                    if((isset($vl['dispo']) && !empty($vl['dispo'])) || (isset($vl['statusflags']) && !empty($vl['statusflags']))) {
                        $row = [$vl['list']['list_id']."-".$vl['list']['list_name']];
                        fputcsv($handle, $row, ";", '"');

                        fputcsv($handle, $header, ";", '"');

                        foreach( $vl['dispo'] as $k => $v) {
                            $row = [$k."-".$v[5],$v[0],$v[3],$v[4]];
                            fputcsv($handle, $row, ";", '"');
                        }

                        $row = ['Total',$vl['totalmax']['total_calls'],$vl['totalmax']['total_duration'],$vl['totalmax']['total_handle_time']];
                        fputcsv($handle, $row, ";", '"');

                        if($vl['list']['active'] == 'Y') {
                            $active = 'Active';
                        }
                        $row = [$vl['list']['list_id']."-".$vl['list']['list_name'] ."-". $active ];
                        fputcsv($handle, $row, ";", '"');

                        $row = ['Total Calls: ',$vl['totalmax']['total_calls'] ];
                        fputcsv($handle, $row, ";", '"');
                        fputcsv($handle, $null, ";", '"');
                        
                        fputcsv($handle, $header2, ";", '"');
                        $row = [['Human Answer:',$vl['statusflags']['ha_count'], number_format($vl['statusflags']['ha_percent'], 2)."%" ],
                                ['Sale:',$vl['statusflags']['sale_count'],number_format($vl['statusflags']['sale_percent'], 2)."%" ],
                                ['DNC:',$vl['statusflags']['dnc_count'],number_format($vl['statusflags']['dnc_percent'], 2)."%" ],
                                ['Customer Contact:',$vl['statusflags']['cc_count'],number_format($vl['statusflags']['cc_percent'], 2)."%" ],
                                ['Not Interested:',$vl['statusflags']['ni_count'],number_format($vl['statusflags']['ni_percent'], 2)."%" ],
                                ['Unworkable:',$vl['statusflags']['uw_count'],number_format($vl['statusflags']['uw_percent'], 2)."%" ],
                                ['Scheduled callbk:',$vl['statusflags']['sc_count'],number_format($vl['statusflags']['sc_percent'], 2)."%" ],
                                ['Completed:',$vl['statusflags']['comp_count'],number_format($vl['statusflags']['comp_percent'], 2)."%" ]
                            ];
                        foreach( $row as $k1 => $v1) {
                            fputcsv($handle, $v1, ";", '"');
                        }
                        fputcsv($handle, $null, ";", '"');
                    }
                }
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
    
    
    # for api_url for export function.
    public $api_url = null;
    public $admin_login = null;
    public $admin_password = null; 
    
    /**
     * Export calls report of call section in report.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param Request $request
     * @return type
     * @throws \App\Http\Controllers\Report\Exception
     */
    public function exportCallsReport(Request $request) {
        try {
            
            $report_unique_id = $this->getExportInfo(EXPORT_CALL_REPORT_ID, $request->input('query_date'), $request->input('end_date'), $request, null, true);

            if(REPORT_CRON_ADDED == $report_unique_id) {
                $return['status'] = 2;
                $return['link'] = 'Report is being generated...';
            } else {
                $return['status'] = 1;
                $return['link'] = Router::url([
                    'controller' => 'Download',
                    'action' => 'report',
                    $report_unique_id
                ], true);
            }
            return response()->json([
                'status' => '200',
                'msg' => "successfully.",
                'data'=> $return
            ]);
            
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.report'), $e);
            throw $e;
        }
    }
    
    /**
     * Export call report call to cron or google files execution 
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param type $report_type_id
     * @param type $query_from_date
     * @param type $query_to_date
     * @param type $request
     * @param type $init
     * @param type $extened
     * @return boolean
     * @throws \App\Http\Controllers\Report\Exception
     * @throws Exception
     */
    public function getExportInfo($report_type_id, $query_from_date, $query_to_date, $request, $init = null, $extened = false) {
        try {
            $request_date_time = date('Y-m-d H:i:s');
            $options = $request->input();
            $user_details = $request->user();
            
            
            if(!$init) {
                $this->init();
            } else {
                $required_init_inputs = [
                    'api_url',
                    'db_id',
                    'company_id',
                    'x5_contact_id'
                ];

                foreach($required_init_inputs as $require_input) {
                    if(!isset($init[$require_input])) {
                        throw new Exception('Missing ' . $require_input);
                    }
                }
                $this->api_url = $init['api_url'];
                $this->db_id = $init['db_id'];
                $this->company_id = $init['company_id'];
                $this->x5_contact_id = $init['x5_contact_id'];
                $this->admin_login = 'xx';
                $this->admin_password = 'xx';
            }
            
            switch ($report_type_id) {
                case EXPORT_CALL_REPORT_ID:
                    
                    $file_name_template = EXPORT_CALL_REPORT_FILE_NAME;
                    
                    if (count($options['campaign']) == 1) {
                        if (in_array('---NONE---', $options['campaign'])) {
                            unset($options['campaign']);
                        }
                    }
                    
                    $secure_key = isset($options['token']) ? $options['token'] : '';
                    
                    $query_string_array = array_merge($options, array(
                        "run_export" => 1,
                        "DB" => "",
                        "SUBMIT" => "SUBMIT",
                        "ytel_api" => "export_call_report_ytel"//"export_call_report"
                    ));

                    unset($query_string_array['include_rollover']);

                    ksort($query_string_array);
                    
                    $postdata = http_build_query($query_string_array);
                    // For saving report cache
                    $query_string_json = json_encode($query_string_array);
                    $query_string_hash = md5($query_string_json);
                    // Cleanup Report
                    $this->cleanupReport($query_string_hash, $query_from_date, $query_to_date, $request);
                    // Check if report exists
                    $existing_report_unique_id = $this->checkExistingReport($query_string_hash, $request);

                    if ($existing_report_unique_id) {
                        return $existing_report_unique_id;
                    }
                    
                    //
                    if(!$extened) {
                        $report = $this->queryReport($this->api_url, $query_string_array, $user_details);       #need to check app_url .

                        if ((strpos($report, "There are no inbound calls during this time period for these parameters") !== FALSE) ||
                            (strpos($report, "There are no outbound calls during this time period for these parameters") !== FALSE) ||
                            $report == "") {
                            throw new Exception($report);
                        }
                    } else {
                        
                        $file_name = sprintf($file_name_template, $query_from_date, $query_to_date, $query_string_hash);
                        
                        $report_name = "Export Call Report from {$query_from_date} to {$query_to_date}";

                        $has_campaign = false;
                        if(isset($query_string_array['campaign']) && !empty($query_string_array['campaign'])) {
                            $report_name .= " with Campaign: " . implode(', ', $query_string_array['campaign']);

                            $has_campaign = true;
                        }

                        if(isset($query_string_array['group']) && !empty($query_string_array['group'])) {
                            if($has_campaign) {
                                $report_name .= " and";
                            }
                            $report_name .= " with Inbound Group: " . implode(', ', $query_string_array['group']);
                        }

                        $report_name .= ".";
                        $this->api_url = "https://ie.ytel.com/x5/api/";#for testing add hardcoded url.
                        $cronAdded = $this->queryReportCron($this->api_url, $query_string_array, $report_type_id, $file_name, $report_name, $request);

                        if(!$cronAdded) {
                            throw new Exception('Cannot generate report');
                        }
                    }
                    break;
                    
                    default:
                    throw new Exception('Report Type ID not found.');
            }
            

            if($cronAdded) {
                return REPORT_CRON_ADDED;
            }

            // Upload to Google Storage
            $file_name = sprintf($file_name_template, $query_from_date, $query_to_date, $query_string_hash);

            // Convert csv to json
            if ( $options['reportFormat'] == 'json') {
                // Report data has been created in csv - now convert this data into Json format

                $temp_file = tmpfile();
                fwrite($temp_file, $report);
                rewind($temp_file);
                $headers = fgetcsv($temp_file, 1024, ',');
                $complete = array();

                while ($row = fgetcsv($temp_file, 1024, ',')) {
                    $complete[] = array_combine($headers, $row);
                }
                $report = json_encode($complete);
            }

            $temp_file = tmpfile();
            fwrite($temp_file, $report);
            $meta_datas = stream_get_meta_data($temp_file);
            $temp_file_path = $meta_datas['uri'];

            $google_storage_file_id = $this->uploadToGoogleStorage($report_type_id, $file_name, $temp_file_path);

            if($google_storage_file_id ==  false) {
                return false;
            }
            
            $unique_id = hexdec(uniqid());       ##CakeText::uuid(); need to check alternet method.
            
            $report_file = New ReportFile();
            $report_file->unique_id = $unique_id;
            $report_file->db_id = $user_details['db_last_used'];
            $report_file->company_id = $user_details['company_id'];
            $report_file->requester_x5_contact_id = $user_details['x5_contact_id'];
            $report_file->request_datetime = gmdate('Y-m-d H:i:s');
            $report_file->finish_datetime = gmdate('Y-m-d H:i:s');
            $report_file->report_type_id = gmdate('Y-m-d H:i:s');
            $report_file->query_from_date = $query_from_date;
            $report_file->query_to_date = $query_to_date;
            $report_file->options = $query_string_json;
            $report_file->options_hash = $query_string_hash;
            $report_file->google_storage_file_id = $google_storage_file_id;
            $report_file->save();

            fclose($temp_file);

            return $unique_id;
            
            print_r("die at end");die;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.report'), $e);
            throw $e;
        }
    }
    
    /**
     * upload to google storage file.
     * @param type $report_type_id
     * @param type $file_name
     * @param type $file_location
     * @param type $ext
     * @return boolean
     * @throws \App\Http\Controllers\Report\Exception
     */
    public function uploadToGoogleStorage($report_type_id, $file_name, $file_location, $ext = false) {
        try {
            if($ext == false ){
                return false;
            }
            $this->GoogleStorage->initialize(new Controller);
            $return = $this->GoogleStorage->upload($this->company_id, $this->x5_contact_id, "reports/$report_type_id/", $file_name, $file_location);

            return $return;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.report'), $e);
            throw $e;
        }
    }
    
    /**
     * Set cron for export call report.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param type $url
     * @param type $data
     * @param type $report_type_id
     * @param type $file_name
     * @param type $report_name
     * @param type $request
     * @return boolean
     * @throws \App\Http\Controllers\Report\Exception
     */
    public function queryReportCron($url, $data, $report_type_id, $file_name, $report_name,$request) {
        try {
            $user_details = $request->user();
            $report_file = New ReportFileQueue();
            $report_file->report_type_id = $report_type_id;
            $report_file->db_id = $user_details['db_last_used'];
            $report_file->company_id = $user_details['company_id'];
            $report_file->requester_x5_contact_id = $user_details['x5_contact_id'];
            $report_file->status = STATUS_NOT_READY;
            $report_file->request_datetime = gmdate('Y-m-d H:i:s');
            $report_file->request_url = $url;
            $report_file->admin_login_password = gmdate('Y-m-d H:i:s');
            $report_file->request_data = json_encode($data);
            $report_file->file_name = $file_name;
            $report_file->report_name = $report_name;
            $report_file->notify =  json_encode(['email' => $data['email'],'sms' => $data['sms']]);
            $report_file->save();
            if(!isset($report_file)) {
                return false;
            }
            return true;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.report'), $e);
            throw $e;
        }
    }
    
    /**
     * Check existing report is available.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param type $options_hash
     * @param type $request
     * @return boolean
     * @throws \App\Http\Controllers\Report\Exception
     */
    public function checkExistingReport($options_hash, $request) {
        try {
            $user_details = $request->user();
            // Check if report exists
            $existing_report = ReportFile::select('unique_id')
                    ->where([['db_id',$user_details['db_last_used']],['company_id', $user_details['company_id']],['options_hash', $options_hash]])
                    ->first();

            if (isset($existing_report)) {
                if(isset($existing_report->unique_id)) {
                    return $existing_report->unique_id;
                } 
            }
            return false;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.report'), $e);
            throw $e;
        }    
    }
    
    /**
     * Clear up report if it already available in before report.
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param type $query_string_hash
     * @param type $query_from_date
     * @param type $query_to_date
     * @param type $request
     * @return boolean
     * @throws \App\Http\Controllers\Report\Exception
     */
    public function cleanupReport($query_string_hash, $query_from_date, $query_to_date, $request) {
        try {
            $user_details = $request->user();
            
            $existingReports = ReportFile::select('report_file_id','google_storage_file_id','request_datetime')
                    ->where([['db_id',$user_details['db_last_used']],['company_id', $user_details['company_id']],['options_hash', $query_string_hash]])
                    ->get();
            // Clean up Report File record
            $clean_up_report = false;

            foreach($existingReports as $report) {
                if( !$this->checkWithinToday($query_from_date, $query_to_date, $report->request_datetime) ) {
                    continue;
                }
                try {
                    $this->deleteGoogleStorageFile($report->google_storage_file_id, $user_details);
                    $clean_up_report = true;
                } catch( Exception $ex ) {
                    continue;
                }
                
                ReportFile::where('report_file_id',$report->report_file_id)->delete();
            }
            return $clean_up_report;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.report'), $e);
            throw $e;
        }
    }
    
    
    
    /**
     * Check if date range is within today
     *
     * @param date $from_date
     * @param date $to_date
     * @return bool
     */
    public function checkWithinToday($from_date, $to_date, $request_date = null) {
        try {
            // If request date is provided, we will check the request date too
            if($request_date) {
                $request_date_ts = strtotime($request_date);
            }

            $today_ts = time();
            $from_date_ts = strtotime($from_date . "00:00:00");
            $to_date_ts = strtotime($to_date . "23:59:59");

            return (($today_ts >= $from_date_ts) && ($today_ts <= $to_date_ts)) || ($request_date && ($request_date_ts <= $to_date_ts));
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.report'), $e);
            throw $e;
        }
    }
    
    /**
     * Delete fgoogle file if is already available .
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param type $gsf_id
     * @param type $user_details
     * @return boolean
     * @throws \App\Http\Controllers\Report\Exception
     * @throws Exception
     */
    public function deleteGoogleStorageFile($gsf_id, $user_details) {
        try {
            
            $google_storage_file = GoogleStorageFile::select('google_storage_file_id','company_id','owner_id','object_folder','object_name','bucket_type')
                    ->where([['google_storage_file_id',$gsf_id],['company_id' , $user_details['company_id']]])
                    ->first();
            
            if (!isset($google_storage_file) && empty($google_storage_file)) {
                throw new Exception('Cannot locate file ID');
            } else {

                $company_id = $google_storage_file->company_id;
                $object_folder = $google_storage_file->object_folder;
                $object_name = $google_storage_file->object_name;
                $bucket_type = $google_storage_file->bucket_type;
                $bucket_name = $this->getBucketName($company_id, $bucket_type);

                try {
                    $gs_return = '';
//                    $googleServiceStorage = new Google_Service_Storage($this->client);    ##need to check dependancy.
//                    $gs_return = $googleServiceStorage->objects->delete(
//                        $bucket_name, $object_folder . $object_name
//                    );

                    // Log to google storage log table
                    \App\GoogleStorageLog::saveLog($company_id, $google_storage_file['GoogleStorageFile']['owner_id'], $gs_return);
                    
                    $result = GoogleStorageFile::where('google_storage_file_id',$gsf_id)->delete();
                    
                } catch (Exception $ex) {
                    \App\GoogleStorageLog::saveLog($company_id, $google_storage_file->owner_id, $gs_return, $ex->getMessage(), $ex->getTraceAsString(), true);

                    return false;
                }

                return true;
            }
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.report'), $e);
            throw $e;
        }
    }
    
    
    /**
     * To get the correct bucket name
     * @param $companyId
     * @param int $bucket_type
     */
    public function getBucketName($company_id, $bucket_type = self::BUCKET_TYPE_YTEL) {
        try {
            if ($bucket_type == self::BUCKET_TYPE_YTEL) {
                $bucket_name = self::BUCKET_YTEL_X5;
            } else {
                if ($bucket_type == self::BUCKET_TYPE_COMPANY_ID) {
                    $bucket_name = "ytel-{$company_id}";
                }
            }
            return $bucket_name;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.report'), $e);
            throw $e;
        }
    }
    
    /**
     * curl report for export call report
     * @author Harshal Pawar. <harshal.pawar@ytel.co.in>
     * @param type $url
     * @param type $data
     * @return type
     * @throws \App\Http\Controllers\Report\Exception
     */
    private function queryReport($url, $data) {
        try {
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
            curl_setopt($ch, CURLOPT_HEADER, 1);
            curl_setopt($ch, CURLOPT_USERPWD, "{$this->admin_login}:{$this->admin_password}");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_VERBOSE, 0);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 0);
            curl_setopt($ch, CURLOPT_TIMEOUT, 600);
            $response = curl_exec($ch);
            $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
            $report = substr($response, $header_size);
            curl_close($ch);

            // Format it to fit Excel
            $report = str_replace(",", " ", $report);
            $report = str_replace("\t", ",", $report);

            return $report;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.report'), $e);
            throw $e;
        }  
    }
    
    /**
     * Setup everything before pulling report from X5 Agent Server
     * 
     * @return boolean
     * @throws Exception
     */
    public function init() {
        try {
            // Grab the current Application DNS API URL
            $admin_aser = \App\VicidialUser::select('user','pass')->orWhere([['user','=','6666'],['user_level','>=','8']])->first();
            
            if (!$admin_aser || !$admin_aser->user || !$admin_aser->pass) {
                throw new Exception('Cannot generate report.');
            }

            $this->admin_login = $admin_aser->user;
            $this->admin_password = $admin_aser->pass;

            return true;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.report'), $e);
            throw $e;
        }  
    }
}

