<?php

namespace App\Http\Controllers\DataManagement;

use Illuminate\Http\Request;
use App\VicidialLists;
use App\YtelAdvancedListRules;
use App\VicidialListsFields;
use App\VicidialList;
use App\VicidialCampaigns;
use App\VicidialLeadFilters;
use App\VicidialStatuses;
use App\VicidialCampaignStatuses;
use App\SystemSetting;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class DataManagementController extends Controller {

    /**
     * Get vcdial list
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $req
     * @return array
     */
    public function index(Request $req) {
        $list = VicidialLists::getAll(['list_id', 'list_name', 'list_description', 'active', 'list_changedate', 'list_lastcalldate', 'campaign_id']);
        return response()->json($list);
    }

    /**
     * Get data loader counts
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $req
     * @return array
     */
    public function getDataLoader(Request $req) {

        $list = VicidialLists::getActiveCount()->toArray();

        $result = [];

        foreach ($list as $value) {
            if ($value['active'] == 'Y')
                $result['active'] = $value['count'];
            elseif ($value['active'] == 'N')
                $result['nonactive'] = $value['count'];
        }

        return response()->json($result);
    }

    /**
     * Get advanced rule list 
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $req
     * @return array
     */
    public function getAdvancedListRules(Request $req) {
        $list = YtelAdvancedListRules::getAll();
        return response()->json($list);
    }

    /**
     * Get custom fields
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $req
     * @return array
     */
    public function getCustomFields(Request $req) {
        $list = VicidialLists::getAll(['list_id', 'list_name', 'active', 'campaign_id']);

        $list_count = 0;
        foreach ($list as $key => $row) {
            $list_count = VicidialListsFields::where('list_id', $row['list_id'])->count();
            $list[$key]['list_count'] = $list_count;
        }
        return response()->json($list);
    }

    /**
     * Get vcdial list
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $req
     * @return array
     */
    public function getSearchResult(Request $req) {

        $fields = [
            'lead_id',
            'status',
            'vendor_lead_code',
            'email',
            'user',
            'list_id',
            'phone_number',
            'first_name',
            'last_name',
            'city',
            'security_phrase',
            'last_local_call_time'
        ];
        $list = VicidialList::getAll($fields);
        return response()->json($list);
    }

    /**
     * Get list id & name for dropdown
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $req
     * @return array
     */
    public function getListIds(Request $req) {

        $list = VicidialLists::getAll(['list_id as key', 'list_id as value', 'list_name as name', DB::raw('CONCAT(list_id, " - ", list_name) AS text')]);

        return response()->json($list);
    }

    /**
     * Get copy fields from-to list
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $req
     * @return array
     */
    public function copyFieldsToList(Request $req) {

        $input = $req->all();

        $list_id = $input['to_list_id'];
        $source_list_id = $input['from_list_id'];
        $copy_option = $input['copy_option'];

        if ($list_id == $source_list_id) {

            return response()->json([
                        'status' => 'error',
                        'msg' => "You cannot copy fields to the same list: $list_id|$source_list_id"
            ]);
        } else {

            $msg = 'Something went wrong. Please try again later';
            $status = 'warning';

            ##### REPLACE option #####
            if ($copy_option == 'REPLACE') {
                $msg = 'Custom Field Added - $list_id';
                $status = 'success';
            }
            ##### APPEND option #####
            elseif ($copy_option == 'APPEND') {
                $msg = "Custom Field Added - $list_id";
                $status = 'success';
            }
            ##### UPDATE option #####
            elseif ($copy_option == 'UPDATE') {
                $msg = "Custom Field Modified - $list_id";
                $status = 'success';
            }

            return response()->json([
                        'status' => $status,
                        'msg' => $msg
            ]);
        }
    }

    /**
     * Set list status active/deactive
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $req
     * @return array
     */
    public function setListActive(Request $req) {
        $input = $req->all();

        #get inputs id & status
        $active = $input['active'];
        $list_id = $input['list_id'];

        if ($active !== '' && $list_id !== '') {

            $result = VicidialLists::setListActive($active, $list_id);

            if ($result) {

                $status = $active === 'Y' ? 'Activated' : 'Deactivated';
                return response()->json([
                            'status' => 'Success'
                            , 'msg' => "Data List $status Successfully!"
                ]);
            } else {

                return response()->json([
                            'status' => 'Error'
                            , 'msg' => 'Error occurred while updating list active. Please try agian!']);
            }
        } else {
            return response()->json([
                        'status' => 'Error'
                        , 'msg' => 'List id or status is missing. Please try again!']);
        }
    }

    /**
     * Get list report by id
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $req
     * @param $list_id 
     * @return array
     */
    public function getListReport(Request $req, $list_id) {

        $input = $req->all();

        $start_date = isset($input['start_date']) && $input['start_date'] !== '' ? str_replace('/', '-', $input['start_date']) : '';
        $end_date = isset($input['end_date']) && $input['end_date'] !== '' ? str_replace('/', '-', $input['end_date']) : '';
        $sqldate = "";


        if ($start_date !== '' && $end_date !== '') {

            $time_BEGIN = " 00:00:00";
            $time_END = " 23:59:59";

            $start_date = date("Y-m-d", strtotime($start_date)) . $time_BEGIN;
            $end_date = date("Y-m-d", strtotime($end_date)) . $time_END;

            $sqldate = " and modify_date between '$start_date' and '$end_date'";
        }

        $list_data = VicidialLists::getListById($list_id, ['campaign_id']);

        if (count($list_data)) {

            $campaign_id = $list_data[0]['campaign_id'];

            #grab names of global statuses and statuses in the selected campaign

            $statuses_data = VicidialStatuses::getAll(['status'
                        , 'status_name'
                        , 'completed'
            ]);

            $campaign_statuses_data = VicidialCampaignStatuses::getAllWhere('campaign_id', $campaign_id, ['status'
                        , 'status_name'
                        , 'completed'
            ]);

            $status_data = $statuses_data->union($campaign_statuses_data)->all();

            $statuses_list = $statuses_complete_list = [];
            if (count($status_data) > 0) {
                foreach ($status_data as $status) {
                    $statuses_list[$status['status']] = $status['status_name'];
                    $statuses_complete_list[$status['status']] = $status['completed'];
                }
            }

            $vicidial_list_data = VicidialList::getListReportData($list_id, $start_date, $end_date);

            #query for the dialable leads
            $dialable_collection = collect(DB::select("SELECT vicidial_list.`status`,COUNT(vicidial_list.lead_id) dialable
					FROM vicidial_list INNER JOIN vicidial_lists ON (vicidial_list.list_id = vicidial_lists.list_id)
					INNER JOIN vicidial_campaigns ON (vicidial_lists.campaign_id = vicidial_campaigns.campaign_id)
					WHERE vicidial_list.list_id = '$list_id' $sqldate AND called_since_last_reset = 'N' 
					AND vicidial_campaigns.dial_statuses LIKE concat('% ',vicidial_list.status,' %')
					AND (vicidial_list.called_count < vicidial_campaigns.call_count_limit OR vicidial_campaigns.call_count_limit= 0) GROUP BY vicidial_list.`status`"));
            $dialable_data = [];
            if (count($dialable_collection)) {
                $dialable_data = $dialable_collection->mapWithKeys(function ($item) {
                            return [$item->status => $item->dialable];
                        })->all();
            }

            #query for the the call count limit 
            $call_count_limit_collection = collect(DB::select("SELECT vicidial_list.`status`,COUNT(vicidial_list.lead_id) call_count_limit
						FROM vicidial_list INNER JOIN vicidial_lists ON (vicidial_list.list_id = vicidial_lists.list_id) 
						INNER JOIN vicidial_campaigns ON (vicidial_lists.campaign_id = vicidial_campaigns.campaign_id)
						WHERE vicidial_list.list_id = '$list_id' $sqldate  AND called_since_last_reset = 'N' 
						AND vicidial_campaigns.dial_statuses LIKE concat('% ',vicidial_list.status,' %')
						AND (vicidial_list.called_count >= vicidial_campaigns.call_count_limit AND vicidial_campaigns.call_count_limit <> 0) GROUP BY vicidial_list.`status`"));
            $call_count_limit_data = [];
            if (count($call_count_limit_collection)) {
                $call_count_limit_data = $call_count_limit_collection->mapWithKeys(function ($item) {
                            return [$item->status => $item->call_count_limit];
                        })->all();
            }

            $list_statuses = array();
            $total_leads = $total_called_since = $total_not_called_since = $total_dialable = $total_call_count = 0;

            foreach ($vicidial_list_data as $key => $vicidial_list_row) {
                $list_statuses[] = [
                    'status' => $vicidial_list_row['status']
                    , 'name' => $statuses_list[$vicidial_list_row['status']] ?? ''
                    , 'total_leads' => $vicidial_list_row['total_leads']
                    , 'called_since_last_reset' => $vicidial_list_row['called_since_last_reset'] === 'Y' ? $vicidial_list_row['total_leads'] : 0
                    , 'not_called_since_last_reset' => $vicidial_list_row['called_since_last_reset'] === 'N' ? $vicidial_list_row['total_leads'] : 0
                    , 'dilable_count' => $dialable_data[$vicidial_list_row['status']] ?? 0
                    , 'call_count_limit' => $call_count_limit_data[$vicidial_list_row['status']] ?? 0
                ];

                $total_leads += $list_statuses[$key]['total_leads'];
                $total_called_since += $list_statuses[$key]['called_since_last_reset'];
                $total_not_called_since += $list_statuses[$key]['not_called_since_last_reset'];
                $total_dialable += $list_statuses[$key]['dilable_count'];
                $total_call_count += $list_statuses[$key]['call_count_limit'];
            }

            #add final total row
            $list_statuses[] = [
                'status' => 'Total'
                , 'name' => ''
                , 'total_leads' => $total_leads
                , 'called_since_last_reset' => $total_called_since
                , 'not_called_since_last_reset' => $total_not_called_since
                , 'dilable_count' => $total_dialable
                , 'call_count_limit' => $total_call_count
            ];

            $gmt_offset_list_collection = VicidialList::getGmtOffsetForListReport($list_id, $start_date, $end_date, ['gmt_offset_now', DB::raw('count(lead_id) As count', 'list_id')]);
            $gmt_offset_list_data = [];

            $gmt_offset_collection = collect(DB::select("SELECT vicidial_list.`gmt_offset_now`, COUNT(vicidial_list.lead_id) gmt_offset_dial
                                                FROM
                                                `vicidial_list`
                                                INNER JOIN `vicidial_lists`
                                                ON (`vicidial_list`.`list_id` = `vicidial_lists`.`list_id`)
                                                INNER JOIN `vicidial_campaigns`
                                                ON (`vicidial_lists`.`campaign_id` = `vicidial_campaigns`.`campaign_id`)
                                                WHERE vicidial_list.list_id = '$list_id' $sqldate  AND called_since_last_reset = 'N' AND vicidial_campaigns.`dial_statuses` LIKE CONCAT('% ', vicidial_list.`status`, ' %') AND (vicidial_list.`called_count` < vicidial_campaigns.`call_count_limit` OR vicidial_campaigns.`call_count_limit` = 0) GROUP BY vicidial_list.`gmt_offset_now`"));
            if ($gmt_offset_collection != null) {
                $gmt_offset_list_data = $gmt_offset_collection->mapWithKeys(function ($item) {
                            return [$item->gmt_offset_now => $item->gmt_offset_dial];
                        })->all();
            }

            $gmt_offset_data = [];
            $total_gmt_offset_total = $total_gmt_offset_dial = 0;
            foreach ($gmt_offset_list_collection as $key => $gmt_offset_list_row) {
                $gmt_offset_data[] = [
                    'gmt_offset_now' => $gmt_offset_list_row['gmt_offset_now']
                    , 'gmt_offset_total' => $gmt_offset_list_row['count']
                    , 'gmt_offset_dial' => $gmt_offset_list_data[$gmt_offset_list_row['gmt_offset_now']] ?? 0
                ];

                $total_gmt_offset_total += $gmt_offset_data[$key]['gmt_offset_total'];
                $total_gmt_offset_dial += $gmt_offset_data[$key]['gmt_offset_dial'];
            }

            $gmt_offset_data[] = [
                'gmt_offset_now' => 'Total'
                , 'gmt_offset_total' => $total_gmt_offset_total
                , 'gmt_offset_dial' => $total_gmt_offset_dial
            ];

            $called_count_collection = DB::select("SELECT status, if(called_count >= 100, 100, called_count) as calledcount, count(*) as count from vicidial_list where list_id='$list_id' $sqldate  group by status, if(called_count >= 100, 100, called_count) order by status,called_count;");

            $called_count_rows = 0;
            $called_count_data = [];
            $total_called_count_row = [
                'status' => 'Total'
                , 'name' => ''
                , 'subtotal' => 0
            ];
            if ($called_count_collection != null) {
                foreach ($called_count_collection as $key => $value) {

                    if ($called_count_rows < $value->calledcount) {
                        $called_count_rows = $value->calledcount;
                    }

                    $called_count_data[] = [
                        'status' => $value->status
                        , 'name' => $statuses_list[$value->status] ?? ''
                        , "$value->calledcount" => $value->count
                        , 'subtotal' => $value->count
                    ];

                    $total_called_count_row['subtotal'] += $value->count;
                    if (!isset($total_called_count_row[$value->calledcount])) {
                        $total_called_count_row[$value->calledcount] = 0;
                    }

                    $total_called_count_row[$value->calledcount] += $value->count;
                }

                $called_count_rows++;
            }
            $called_count_data[] = $total_called_count_row;
            return response()->json([
                        'statuses' => $list_statuses
                        , 'timezones' => $gmt_offset_data
                        , 'called_counts' => $called_count_data
                        , 'called_count_rows' => $called_count_rows > 100 ? 101 : $called_count_rows
            ]);
        } else {

            return "You are not allowed to access this page, please contact your company administrator.";
        }
    }

    public function downloadList(Request $req, $list_id) {

        $start_date = isset($input['start_date']) && $input['start_date'] !== '' ? str_replace('/', '-', $input['start_date']) : '';
        $end_date = isset($input['end_date']) && $input['end_date'] !== '' ? str_replace('/', '-', $input['end_date']) : '';
        $sqldate = "";

        if ($list_id) {

            if ($start_date !== '' && $end_date !== '') {

                $time_BEGIN = " 00:00:00";
                $time_END = " 23:59:59";

                $start_date = date("Y-m-d", strtotime($start_date)) . $time_BEGIN;
                $end_date = date("Y-m-d", strtotime($end_date)) . $time_END;

                $sqldate = " and modify_date between '$start_date' and '$end_date'";
            }

            $valid_custom_table = false;

            $custom_fields = SystemSetting::getAll(['custom_fields_enabled'])->toArray();

            $custom_fields_enabled = $custom_fields[0]['custom_fields_enabled'] ?? 0;

            if ($custom_fields_enabled > 0) {

                $custom_tables = VicidialList::getEntryListIds($list_id, $start_date, $end_date, ['entry_list_id']);

                foreach ($custom_tables as $custom_table) {
                    $entry_list_id = $custom_table['entry_list_id'];

                    if ($entry_list_id == 0) {
                        continue;
                    }

                    $custom_describe = DB::select("describe custom_$entry_list_id");

                    if (count($custom_describe)) {

                        foreach ($custom_describe as $data) {
                            $custom_{$entry_list_id}[$data->Field] = "";
                        }

                        $custom_header_arr['custom_' . $entry_list_id] = $custom_{$entry_list_id};
                        $valid_custom_table = true;
                    }
                }
            }


            $count_download_time = 0;
            $header = false;

            $resultArr = array();

            $download_pre = 100000;
            $limit_from = $count_download_time++ * $download_pre;
            $firstArr = VicidialList::getListDownloadData($list_id, $start_date, $end_date, $limit_from, $download_pre);
            if ($valid_custom_table) {


                foreach ($firstArr as $row) {
                    $new_custom_header_arr = $custom_header_arr;
                    $entry_list_idA = $row['entry_list_id'];

                    $custom_arr = array();
                    if ($entry_list_idA != 0) {
                        $lead_idA = $row['lead_id'];
                        $customDataCollection = DB::select("select * from custom_$entry_list_idA WHERE lead_id='$lead_idA'");
                        $customData = $this->objectToArray($customDataCollection);
                        $new_custom_header_arr['custom_' . $entry_list_idA] = $customData;
                    }
                    foreach ($new_custom_header_arr as $cust_tble) {

                        $custom_arr = $custom_arr + (array) $cust_tble;
                    }

                    $resultArr[] = $row + $custom_arr;
                }
            } else {
                $resultArr = $firstArr;
            }
            dd($resultArr);
            #the file name of the download, change this if needed
            $public_name = "export_" . date("Y-m-d");
            
            #file type
            $type = 'csv';
            return \Excel::create($public_name, function($excel) use ($resultArr) {

                        $excel->sheet('sheet name', function($sheet) use ($resultArr) {

                            $sheet->fromArray($resultArr);
                        });
                    })->download($type);
        } else {
            
        }
    }

    /**
     * Convert an object to an array
     * @param $obj
     * @return array
     */
    public function objectToArray($obj) {
        $_arr = is_object($obj) ? get_object_vars($obj) : $obj;
        $arr = [];
        foreach ($_arr as $key => $val) {
            $val = (is_array($val) || is_object($val)) ? $this->objectToArray($val) : $val;
            $arr[$key] = $val;
        }
        return $arr;
    }

    public function list(Request $req) {
     
     $api_data= '[{"group_id":"AGENTDIRECT","group_name":"Single Agent Direct Queue","group_color":"#99ffcc","active":"Y","queue_priority":"99","call_time_id":"24hours"},{"group_id":"Closer","group_name":"Closer Que","group_color":"#99ffcc","active":"Y","queue_priority":"99","call_time_id":"24hours"},{"group_id":"CallerID","group_name":"TEST","group_color":"#917676","active":"Y","queue_priority":"0","call_time_id":"24hours"},{"group_id":"DNC_Alex_Test","group_name":"Not VIP","group_color":"#82cff5","active":"Y","queue_priority":"99","call_time_id":"24hours"},{"group_id":"KevInbound","group_name":"Kevin T DO NOT DELETE","group_color":"#82cff5","active":"Y","queue_priority":"99","call_time_id":"24hours"},{"group_id":"20012","group_name":"CustomerService Inbound","group_color":"#1005f0","active":"Y","queue_priority":"0","call_time_id":"7am-7pm"},{"group_id":"DCurl_Test","group_name":"Dispo Call URL Test","group_color":"#99ffcc","active":"Y","queue_priority":"99","call_time_id":"24hours"},{"group_id":"DNC_goodsell_hq","group_name":"DNC_goodsell_hq","group_color":"Red","active":"Y","queue_priority":"0","call_time_id":"24hours"},{"group_id":"Patrick_DNC1","group_name":"Patrick DNC 1","group_color":"#99ffcc","active":"Y","queue_priority":"99","call_time_id":"24hours"},{"group_id":"Patrick_DNC2","group_name":"Patrick DNC 2","group_color":"#99ffcc","active":"Y","queue_priority":"99","call_time_id":"24hours"},{"group_id":"KevVM","group_name":"Kevin Campaign VM","group_color":"#82cff5","active":"Y","queue_priority":"99","call_time_id":"24hours"},{"group_id":"NTI","group_name":"Nti_Beacon_transfer","group_color":"#917676","active":"Y","queue_priority":"0","call_time_id":"24hours"},{"group_id":"Garthok_Drop","group_name":"Garthok Drop","group_color":"#99ffcc","active":"Y","queue_priority":"99","call_time_id":"24hours"},{"group_id":"EndSurvey","group_name":"EndSurvey","group_color":"#000000","active":"Y","queue_priority":"0","call_time_id":"24hours"},{"group_id":"LBv2_Morning","group_name":"LeadBeam Test DONT DELETE","group_color":"#99ffcc","active":"Y","queue_priority":"99","call_time_id":"24hours"},{"group_id":"12121212","group_name":"LBPRETEST","group_color":"#99ffcc","active":"N","queue_priority":"99","call_time_id":"24hours"},{"group_id":"SurveyINB","group_name":"SurveyINB","group_color":"#000000","active":"Y","queue_priority":"0","call_time_id":"24hours"},{"group_id":"AlexINB","group_name":"Alex Inbound Queue","group_color":"#fca62d","active":"Y","queue_priority":"0","call_time_id":"24hours"},{"group_id":"3waycalllog","group_name":"3 way call log test","group_color":"#99ffcc","active":"Y","queue_priority":"99","call_time_id":"24hours"},{"group_id":"test12345","group_name":"Test Inbound queue","group_color":"#ff0000","active":"Y","queue_priority":"0","call_time_id":"24hours"},{"group_id":"1200","group_name":"test1","group_color":"#000000","active":"Y","queue_priority":"0","call_time_id":"24hours"},{"group_id":"BeaconMorningTest","group_name":"Beacon Transfer Morning Test","group_color":"RED","active":"Y","queue_priority":"0","call_time_id":"24hours"},{"group_id":"DANIELTEST","group_name":"DANIELTEST","group_color":"#82cff5","active":"Y","queue_priority":"97","call_time_id":"24hours"},{"group_id":"PatrickDROP","group_name":"Patrick DROP","group_color":"#99ffcc","active":"Y","queue_priority":"99","call_time_id":"24hours"},{"group_id":"AlexLBTest_1","group_name":"Alex LB Test INB","group_color":"#fca62d","active":"Y","queue_priority":"0","call_time_id":"24hours"},{"group_id":"96963636","group_name":"WellspostTest","group_color":"#e01212","active":"Y","queue_priority":"0","call_time_id":"24hours"},{"group_id":"88888","group_name":"Acurian Inbound","group_color":"#000000","active":"Y","queue_priority":"0","call_time_id":"24hours"},{"group_id":"Newcari3","group_name":"New Car IBQ","group_color":"#000000","active":"Y","queue_priority":"0","call_time_id":"24hours"},{"group_id":"S1_1","group_name":"Invalid Agent Extension dialed","group_color":"#99ffcc","active":"Y","queue_priority":"99","call_time_id":"24hours"},{"group_id":"CSTEST123","group_name":"CS TEST 123","group_color":"#99ffcc","active":"Y","queue_priority":"99","call_time_id":"24hours"},{"group_id":"lctest","group_name":"lctest","group_color":"#000000","active":"Y","queue_priority":"0","call_time_id":"24hours"},{"group_id":"1801","group_name":"Bs Test ","group_color":"#fcfc08","active":"Y","queue_priority":"0","call_time_id":"24hours"},{"group_id":"4444_44","group_name":"4444hd","group_color":"#e612d4","active":"Y","queue_priority":"3","call_time_id":"24hours"},{"group_id":"3000","group_name":"Hany test ACCID outbound","group_color":"#eb1e1e","active":"Y","queue_priority":"97","call_time_id":"24hours"},{"group_id":"3001","group_name":"Live transfer 1","group_color":"#000000","active":"Y","queue_priority":"97","call_time_id":"24hours"},{"group_id":"testVideo","group_name":"test video","group_color":"#fa0000","active":"Y","queue_priority":"0","call_time_id":"24hours"},{"group_id":"7000","group_name":"Inbound mort","group_color":"#d91111","active":"Y","queue_priority":"0","call_time_id":"24hours"},{"group_id":"8000","group_name":"Opener inbound group","group_color":"#e83333","active":"Y","queue_priority":"0","call_time_id":"24hours"},{"group_id":"9000","group_name":"Closer inbound queue","group_color":"#e83333","active":"Y","queue_priority":"0","call_time_id":"24hours"},{"group_id":"111111","group_name":"crystal test","group_color":"#ed0505","active":"Y","queue_priority":"0","call_time_id":"24hours"},{"group_id":"2234","group_name":"Softphone","group_color":"#000000","active":"Y","queue_priority":"0","call_time_id":"24hours"},{"group_id":"60001","group_name":"New Group for Video","group_color":"#99ffcc","active":"Y","queue_priority":"99","call_time_id":"24hours"},{"group_id":"23234","group_name":"Inbound closer","group_color":"#25b6cc","active":"Y","queue_priority":"0","call_time_id":"24hours"},{"group_id":"666666","group_name":"internal Transfer","group_color":"#000000","active":"Y","queue_priority":"0","call_time_id":"24hours"},{"group_id":"Verifier_test","group_name":"verifier test","group_color":"#99ffcc","active":"Y","queue_priority":"99","call_time_id":"24hours"}]';


    return $api_data;
    }


        public function callmenu(){

            $list='[{"menu_id":"defaultlog","menu_name":"logging of all outbound calls from agent phones","user_group":"---ALL---","menu_prompt":"sip-silence","menu_timeout":"20","count":"1"},{"menu_id":"test","menu_name":"test","user_group":"---ALL---","menu_prompt":"Ytel-Test","menu_timeout":"10","count":"3"},{"menu_id":"Garthok_Drop_Out","menu_name":"Garhtok Drop Out","user_group":"---ALL---","menu_prompt":"Voicemail_Prompt","menu_timeout":"5","count":"1"},{"menu_id":"9999","menu_name":"Beacon\/HQ\/GoodSell DNC","user_group":"ADMIN","menu_prompt":"Ytel-Test","menu_timeout":"10","count":"1"},{"menu_id":"606070","menu_name":"VoicemailTest","user_group":"---ALL---","menu_prompt":"teststrio","menu_timeout":"10","count":"1"},{"menu_id":"NTI","menu_name":"NTI Beacon to Call menu to Hang up","user_group":"---ALL---","menu_prompt":"","menu_timeout":"0","count":"1"},{"menu_id":"KevinCM","menu_name":"Kevin Call Menu","user_group":"---ALL---","menu_prompt":"teststrio","menu_timeout":"10","count":"1"},{"menu_id":"RyanTest","menu_name":"Ryan Test","user_group":"---ALL---","menu_prompt":"800_agent_alert1","menu_timeout":"10","count":"2"},{"menu_id":"6060606","menu_name":"AlexSecurityOneTest","user_group":"---ALL---","menu_prompt":"teststrio","menu_timeout":"1","count":"1"},{"menu_id":"505050","menu_name":"SecurityOneTest","user_group":"1000","menu_prompt":"ParkHoldMusic03","menu_timeout":"10","count":"1"},{"menu_id":"Question1","menu_name":"Question1","user_group":"---ALL---","menu_prompt":"teststrio","menu_timeout":"10","count":"9"},{"menu_id":"Question2","menu_name":"Question2","user_group":"---ALL---","menu_prompt":"teststrio","menu_timeout":"10","count":"9"},{"menu_id":"Question3","menu_name":"question3","user_group":"---ALL---","menu_prompt":"teststrio","menu_timeout":"10","count":"9"},{"menu_id":"IDTest","menu_name":"IDtest","user_group":"---ALL---","menu_prompt":"800_agent_alert1","menu_timeout":"10","count":"1"},{"menu_id":"Dial_Agent_exten","menu_name":"Dial Agent Extension","user_group":"---ALL---","menu_prompt":"VIPNoCommand","menu_timeout":"10","count":"0"},{"menu_id":"Direct_Agent_AGI","menu_name":"Direct Agent AGI","user_group":"---ALL---","menu_prompt":"teststrio","menu_timeout":"10","count":"0"},{"menu_id":"TEST1231231","menu_name":"TESTING FOR VIDEO","user_group":"ADMIN","menu_prompt":"","menu_timeout":"10","count":"0"},{"menu_id":"99099","menu_name":"TEST for Video","user_group":"ADMIN","menu_prompt":"","menu_timeout":"10","count":"0"},{"menu_id":"5999","menu_name":"Test for Video","user_group":"ADMIN","menu_prompt":"","menu_timeout":"10","count":"2"},{"menu_id":"56567","menu_name":"TestCallMenu","user_group":"ADMIN","menu_prompt":"","menu_timeout":"10","count":"0"},{"menu_id":"4000","menu_name":"my IVR","user_group":"Hanyytel","menu_prompt":"247-incoming-call-prompt","menu_timeout":"10","count":"1"},{"menu_id":"5000","menu_name":"HanyTest","user_group":"Hanyytel","menu_prompt":"1490965292_7acba1687b2ec5835fb2083ee7af7a38-2","menu_timeout":"10","count":"0"},{"menu_id":"test_krishna_ivr","menu_name":"IVR_SETUP","user_group":"---ALL---","menu_prompt":"","menu_timeout":"10","count":"0"}]';

            return  $list;
        }

       public function numbers(){

            $list='[{"menu_id":"defaultlog","menu_name":"logging of all outbound calls from agent phones","user_group":"---ALL---","menu_prompt":"sip-silence","menu_timeout":"20","count":"1"},{"menu_id":"test","menu_name":"test","user_group":"---ALL---","menu_prompt":"Ytel-Test","menu_timeout":"10","count":"3"},{"menu_id":"Garthok_Drop_Out","menu_name":"Garhtok Drop Out","user_group":"---ALL---","menu_prompt":"Voicemail_Prompt","menu_timeout":"5","count":"1"},{"menu_id":"9999","menu_name":"Beacon\/HQ\/GoodSell DNC","user_group":"ADMIN","menu_prompt":"Ytel-Test","menu_timeout":"10","count":"1"},{"menu_id":"606070","menu_name":"VoicemailTest","user_group":"---ALL---","menu_prompt":"teststrio","menu_timeout":"10","count":"1"},{"menu_id":"NTI","menu_name":"NTI Beacon to Call menu to Hang up","user_group":"---ALL---","menu_prompt":"","menu_timeout":"0","count":"1"},{"menu_id":"KevinCM","menu_name":"Kevin Call Menu","user_group":"---ALL---","menu_prompt":"teststrio","menu_timeout":"10","count":"1"},{"menu_id":"RyanTest","menu_name":"Ryan Test","user_group":"---ALL---","menu_prompt":"800_agent_alert1","menu_timeout":"10","count":"2"},{"menu_id":"6060606","menu_name":"AlexSecurityOneTest","user_group":"---ALL---","menu_prompt":"teststrio","menu_timeout":"1","count":"1"},{"menu_id":"505050","menu_name":"SecurityOneTest","user_group":"1000","menu_prompt":"ParkHoldMusic03","menu_timeout":"10","count":"1"},{"menu_id":"Question1","menu_name":"Question1","user_group":"---ALL---","menu_prompt":"teststrio","menu_timeout":"10","count":"9"},{"menu_id":"Question2","menu_name":"Question2","user_group":"---ALL---","menu_prompt":"teststrio","menu_timeout":"10","count":"9"},{"menu_id":"Question3","menu_name":"question3","user_group":"---ALL---","menu_prompt":"teststrio","menu_timeout":"10","count":"9"},{"menu_id":"IDTest","menu_name":"IDtest","user_group":"---ALL---","menu_prompt":"800_agent_alert1","menu_timeout":"10","count":"1"},{"menu_id":"Dial_Agent_exten","menu_name":"Dial Agent Extension","user_group":"---ALL---","menu_prompt":"VIPNoCommand","menu_timeout":"10","count":"0"},{"menu_id":"Direct_Agent_AGI","menu_name":"Direct Agent AGI","user_group":"---ALL---","menu_prompt":"teststrio","menu_timeout":"10","count":"0"},{"menu_id":"TEST1231231","menu_name":"TESTING FOR VIDEO","user_group":"ADMIN","menu_prompt":"","menu_timeout":"10","count":"0"},{"menu_id":"99099","menu_name":"TEST for Video","user_group":"ADMIN","menu_prompt":"","menu_timeout":"10","count":"0"},{"menu_id":"5999","menu_name":"Test for Video","user_group":"ADMIN","menu_prompt":"","menu_timeout":"10","count":"2"},{"menu_id":"56567","menu_name":"TestCallMenu","user_group":"ADMIN","menu_prompt":"","menu_timeout":"10","count":"0"},{"menu_id":"4000","menu_name":"my IVR","user_group":"Hanyytel","menu_prompt":"247-incoming-call-prompt","menu_timeout":"10","count":"1"},{"menu_id":"5000","menu_name":"HanyTest","user_group":"Hanyytel","menu_prompt":"1490965292_7acba1687b2ec5835fb2083ee7af7a38-2","menu_timeout":"10","count":"0"},{"menu_id":"test_krishna_ivr","menu_name":"IVR_SETUP","user_group":"---ALL---","menu_prompt":"","menu_timeout":"10","count":"0"}]    ';

            return  $list;
        }


    public function checkbox(){


            $list='[{"campaign_id":"","closer_campaigns":"","xfer_groups":"","options_title":null,"closer_campaigns_status":"","xfer_groups_status":"checked"},{"campaign_id":"0001","closer_campaigns":" 222 SUPPORT_VIP AGENTDIRECT -","xfer_groups":"AGENTDIRECT SALES_INBOUND -","options_title":"0001 - test12","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"0002","closer_campaigns":" 222 SUPPORT_VIP AGENTDIRECT -","xfer_groups":"AGENTDIRECT SALES_INBOUND -","options_title":"0002 - test12","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"0003","closer_campaigns":" 222 SUPPORT_VIP -","xfer_groups":"","options_title":"0003 - Ytel API Test1","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"0004","closer_campaigns":" 222 SUPPORT_VIP AGENTDIRECT -","xfer_groups":"AGENTDIRECT SALES_INBOUND -","options_title":"0004 - test121","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"0005","closer_campaigns":" 222 AGENTDIRECT -","xfer_groups":" AGENTDIRECT SALES_INBOUND -","options_title":"0005 - test123","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"040588","closer_campaigns":" 222 4444 AGENTDIRECT BILLING CEspecialist MGRCB MSG360_BILLING MSG360_SALES MSG360_SUPPORT MSG360_SUPPORT2 NOC OpsInbound PPC_SALES RVMcallerDIDcallback SALES_Comp SALES_INBOUND SALES_Senior SALES_five9 SIPPRO_BILLING SIPPRO_CALLBACK SIPPRO_SALES SIPPRO_SUPPORT SUPPORT SUPPORTS SUPPORT_VIP Sales_RVM_Callback YtelTest test2 test111 -","xfer_groups":" 4444 AGENTDIRECT BILLING CEspecialist MGRCB MSG360_BILLING MSG360_SALES MSG360_SUPPORT MSG360_SUPPORT2 NOC OpsInbound PPC_SALES RVMcallerDIDcallback SALES_Comp SALES_INBOUND SALES_Senior SALES_five9 SIPPRO_BILLING SIPPRO_CALLBACK SIPPRO_SALES SIPPRO_SUPPORT SUPPORT SUPPORTS SUPPORT_VIP Sales_RVM_Callback YtelTest test2 test111 -","options_title":"040588 - 040588 Campaign","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"0409","closer_campaigns":" 222 AGENTDIRECT -","xfer_groups":" AGENTDIRECT SALES_INBOUND -","options_title":"0409 - test12","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"0410","closer_campaigns":" 222 4444 SUPPORT_VIP -","xfer_groups":" 4444 -","options_title":"0410 - Ytel API Test","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"1000","closer_campaigns":" 222 SUPPORT_VIP -","xfer_groups":"","options_title":"1000 - Ytel API Test","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"2016","closer_campaigns":" 222 SUPPORT_VIP 4444 AGENTDIRECT BILLING NOC PPC_SALES SUPPORT SUPPORTS YtelTest -","xfer_groups":"4444 BILLING SUPPORT -","options_title":"2016 - Adwords","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"2017","closer_campaigns":" 222 SUPPORT_VIP AGENTDIRECT -","xfer_groups":"AGENTDIRECT SALES_INBOUND -","options_title":"2017 - test12","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"5971977","closer_campaigns":" 222 SUPPORT_VIP 5026 AGENTDIRECT BILLING CEspecialist MSG360_SALES NOC PPC_SALES SALES_Comp SALES_five9 SALES_INBOUND SALES_Senior SIPPRO_SALES -","xfer_groups":" AGENTDIRECT BILLING MSG360_BILLING MSG360_SUPPORT2 SimpleXfer SIPPRO_BILLING SIPPRO_SUPPORT SUPPORT -","options_title":"5971977 - Krishna Test Ignore","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"62683642","closer_campaigns":" 222 SUPPORT_VIP AGENTDIRECT OpsInbound YtelTest -","xfer_groups":" AGENTDIRECT OpsInbound YtelTest -","options_title":"62683642 - Sarfaraj","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"8858325","closer_campaigns":" 222 SUPPORT_VIP AGENTDIRECT MSG360_SALES NOC PPC_SALES SALES_INBOUND SIPPRO_SALES -","xfer_groups":"AGENTDIRECT BILLING MSG360_BILLING MSG360_SUPPORT2 SimpleXfer SIPPRO_BILLING SIPPRO_SUPPORT SUPPORT -","options_title":"8858325 - Debt Pay Pro Demo","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"8888","closer_campaigns":" 222 SUPPORT_VIP AGENTDIRECT -","xfer_groups":" AGENTDIRECT SALES_INBOUND -","options_title":"8888 - 8888 Campaign","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"898988","closer_campaigns":" 222 SUPPORT_VIP AGENTDIRECT -","xfer_groups":" AGENTDIRECT SALES_INBOUND -","options_title":"898988 - AS Test","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"909090","closer_campaigns":" 222 SUPPORT_VIP AGENTDIRECT -","xfer_groups":"AGENTDIRECT SALES_INBOUND -","options_title":"909090 - 8888 Campaign","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"93238190","closer_campaigns":" 222 SUPPORT_VIP AGENTDIRECT YtelTest -","xfer_groups":"AGENTDIRECT -","options_title":"93238190 - Sunny Test","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"9876","closer_campaigns":" 222 SUPPORT_VIP YtelTest -","xfer_groups":" YtelTest -","options_title":"9876 - Sales Demo","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"99899","closer_campaigns":" 222 SUPPORT_VIP AGENTDIRECT -","xfer_groups":" AGENTDIRECT SALES_INBOUND -","options_title":"99899 - LEAD PREVIEW TEST","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"9999","closer_campaigns":" 222 SUPPORT_VIP AGENTDIRECT YtelTest -","xfer_groups":" AGENTDIRECT YtelTest -","options_title":"9999 - Sunny Test","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"acct","closer_campaigns":" 222 SUPPORT_VIP AGENTDIRECT BILLING MSG360_BILLING SIPPRO_BILLING -","xfer_groups":" MSG360_SALES MSG360_SUPPORT2 SALES_INBOUND SIPPRO_SALES SIPPRO_SUPPORT SUPPORT -","options_title":"acct - Billing Department1","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"DPPDemo","closer_campaigns":" 222 SUPPORT_VIP AGENTDIRECT MSG360_SALES NOC PPC_SALES SALES_INBOUND SIPPRO_SALES -","xfer_groups":"AGENTDIRECT BILLING MSG360_BILLING MSG360_SUPPORT2 SimpleXfer SIPPRO_BILLING SIPPRO_SUPPORT SUPPORT -","options_title":"DPPDemo - Debt Pay Pro Demo","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"IanTest","closer_campaigns":" 222 SUPPORT_VIP -","xfer_groups":"","options_title":"IanTest - Ian Posting Test SMT","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"kk","closer_campaigns":" 222 SUPPORT_VIP 5026 AGENTDIRECT BILLING CEspecialist MSG360_SALES NOC PPC_SALES SALES_Comp SALES_five9 SALES_INBOUND SALES_Senior SIPPRO_SALES -","xfer_groups":" AGENTDIRECT BILLING MSG360_BILLING MSG360_SUPPORT2 SimpleXfer SIPPRO_BILLING SIPPRO_SUPPORT SUPPORT -","options_title":"kk - Krishna Test Ignore","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"ktest","closer_campaigns":" 222 SUPPORT_VIP AGENTDIRECT test111 -","xfer_groups":" AGENTDIRECT SALES_INBOUND test111 -","options_title":"ktest - test12","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"M360","closer_campaigns":" 222 SUPPORT_VIP AGENTDIRECT -","xfer_groups":"AGENTDIRECT SALES_INBOUND -","options_title":"M360 - Message360","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"Matrix","closer_campaigns":" 222 SUPPORT_VIP AGENTDIRECT PPC_SALES SALES_INBOUND -","xfer_groups":"BILLING SALES_INBOUND SUPPORT -","options_title":"Matrix - Competitor Matrix","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"MDialOly","closer_campaigns":" 222 SUPPORT_VIP AGENTDIRECT YtelTest -","xfer_groups":" AGENTDIRECT YtelTest -","options_title":"MDialOly - M Dial Only","closer_campaigns_status":"checked","xfer_groups_status":""},{"campaign_id":"sales","closer_campaigns":" PPC_SALES SALES_INBOUND -","xfer_groups":" BILLING SALES_INBOUND SUPPORT -","options_title":"sales - Sales Outbound DO NOT USE","closer_campaigns_status":"","xfer_groups_status":""},{"campaign_id":"sales2","closer_campaigns":" AGENTDIRECT BILLING CEspecialist MSG360_SALES NOC PPC_SALES RVMcallerDIDcallback SALES_Comp SALES_five9 SALES_INBOUND Sales_RVM_Callback SALES_Senior SIPPRO_SALES SUPPORT -","xfer_groups":" AGENTDIRECT BILLING MSG360_BILLING MSG360_SUPPORT2 RVMcallerDIDcallback SIPPRO_BILLING SIPPRO_SUPPORT SUPPORT -","options_title":"sales2 - Sales Team","closer_campaigns_status":"","xfer_groups_status":""},{"campaign_id":"sip_pro","closer_campaigns":" AGENTDIRECT SIPPRO_BILLING SIPPRO_CALLBACK SIPPRO_SALES SIPPRO_SUPPORT -","xfer_groups":"AGENTDIRECT -","options_title":"sip_pro - Sip Pro","closer_campaigns_status":"","xfer_groups_status":""},{"campaign_id":"SSupport","closer_campaigns":" AGENTDIRECT Hurricane_Hotline MGRCB MSG360_SUPPORT MSG360_SUPPORT2 NOC SIPPRO_SUPPORT SUPPORT SUPPORT_VIP SUPPORTS -","xfer_groups":" AGENTDIRECT BILLING MGRCB MSG360_BILLING MSG360_SALES MSG360_SUPPORT SALES_INBOUND SIPPRO_BILLING SUPPORT SUPPORTS -","options_title":"SSupport - Support","closer_campaigns_status":"","xfer_groups_status":""},{"campaign_id":"test","closer_campaigns":" AGENTDIRECT -","xfer_groups":" AGENTDIRECT SALES_INBOUND -","options_title":"test - test12","closer_campaigns_status":"","xfer_groups_status":""},{"campaign_id":"test1","closer_campaigns":" AGENTDIRECT SALES_INBOUND -","xfer_groups":" AGENTDIRECT SALES_INBOUND -","options_title":"test1 - test12","closer_campaigns_status":"","xfer_groups_status":""},{"campaign_id":"test33","closer_campaigns":" AGENTDIRECT -","xfer_groups":" AGENTDIRECT SALES_INBOUND -","options_title":"test33 - test334","closer_campaigns_status":"","xfer_groups_status":""},{"campaign_id":"TESTOM","closer_campaigns":" AGENTDIRECT SALES_INBOUND -","xfer_groups":" AGENTDIRECT SALES_INBOUND -","options_title":"TESTOM - test12","closer_campaigns_status":"","xfer_groups_status":""},{"campaign_id":"vpdemo","closer_campaigns":" AGENT_FO AGENTDIRECT BILLING MSG360_BILLING MSG360_SALES MSG360_SUPPORT MSG360_SUPPORT2 NOC PPC_SALES SALES_INBOUND SimpleXfer SIPPRO_BILLING SIPPRO_CALLBACK SIPPRO_SALES SIPPRO_SUPPORT SUPPORT SUPPORT_VIP SUPPORTS VIP_CM VIP_CSMARKETING VIP_L9 YtelTest -","xfer_groups":"AGENTDIRECT SALES_INBOUND -","options_title":"vpdemo - Voice Path Demo 1","closer_campaigns_status":"","xfer_groups_status":""}]';

            return  $list;


}


    public function agent_listing(){



            $list='[{"user_id":"4","user":"1001","user_group":"ADMIN","full_name":"User 1001","active":"Y","closer_default_blended":"0"},{"user_id":"5","user":"1002","user_group":"administrator","full_name":"User 1002","active":"Y","closer_default_blended":"1"},{"user_id":"6","user":"1003","user_group":"1000","full_name":"User 1003","active":"Y","closer_default_blended":"1"},{"user_id":"7","user":"1004","user_group":"1000","full_name":"User 1004","active":"Y","closer_default_blended":"1"},{"user_id":"8","user":"1005","user_group":"1000","full_name":"User 1005","active":"Y","closer_default_blended":"1"},{"user_id":"9","user":"99","user_group":"DANIELTEST","full_name":"ADMIN","active":"Y","closer_default_blended":"0"},{"user_id":"10","user":"1006","user_group":"1000","full_name":"Bwells Test","active":"Y","closer_default_blended":"0"},{"user_id":"11","user":"1007","user_group":"1000","full_name":"New User","active":"Y","closer_default_blended":"1"},{"user_id":"12","user":"1008","user_group":"1000","full_name":"New User","active":"Y","closer_default_blended":"1"},{"user_id":"13","user":"101","user_group":"ADMIN","full_name":"Test","active":"Y","closer_default_blended":"0"},{"user_id":"14","user":"1041","user_group":"1000","full_name":"User 1041","active":"Y","closer_default_blended":"0"},{"user_id":"15","user":"1042","user_group":"1000","full_name":"User 1042","active":"Y","closer_default_blended":"1"},{"user_id":"16","user":"test","user_group":null,"full_name":"test","active":"Y","closer_default_blended":"1"},{"user_id":"17","user":"1009","user_group":"ADMIN","full_name":"New User","active":"Y","closer_default_blended":"1"},{"user_id":"18","user":"flimflam","user_group":"1000","full_name":"Jimbo Bob Billyjack","active":"Y","closer_default_blended":"1"},{"user_id":"19","user":"9655","user_group":"1000","full_name":"Jack And Jill","active":"Y","closer_default_blended":"1"},{"user_id":"22","user":"5198","user_group":"1000","full_name":"Test User","active":"Y","closer_default_blended":"1"},{"user_id":"23","user":"102","user_group":"---ALL---","full_name":"API USER - HOMES.COM","active":"Y","closer_default_blended":"0"},{"user_id":"24","user":"2337","user_group":"1000","full_name":"New","active":"Y","closer_default_blended":"1"},{"user_id":"25","user":"5018","user_group":"VannyTest","full_name":"Vanny Test","active":"Y","closer_default_blended":"1"},{"user_id":"26","user":"2121","user_group":"C2C","full_name":"C2C Test User ","active":"Y","closer_default_blended":"1"},{"user_id":"27","user":"111","user_group":"---ALL---","full_name":"API Test User - Delete 112016","active":"Y","closer_default_blended":"0"},{"user_id":"28","user":"5050","user_group":"ADMIN","full_name":"Alex","active":"Y","closer_default_blended":"1"},{"user_id":"65","user":"2021","user_group":"ADMIN","full_name":"holly","active":"Y","closer_default_blended":"1"},{"user_id":"29","user":"2112","user_group":"1000","full_name":"Rush ","active":"Y","closer_default_blended":"0"},{"user_id":"30","user":"7777","user_group":"Acurian","full_name":"Acurian test","active":"Y","closer_default_blended":"1"},{"user_id":"32","user":"1272","user_group":"ADMIN","full_name":"test user","active":"Y","closer_default_blended":"1"},{"user_id":"34","user":"0162","user_group":"ADMIN","full_name":"Evan test","active":"N","closer_default_blended":"1"},{"user_id":"35","user":"5007","user_group":"ADMIN","full_name":"danieltest","active":"Y","closer_default_blended":"1"},{"user_id":"37","user":"606060","user_group":"ADMIN","full_name":"Betsy Gottesman","active":"Y","closer_default_blended":"1"},{"user_id":"39","user":"2540","user_group":"ADMIN","full_name":"Dustin Test","active":"Y","closer_default_blended":"0"},{"user_id":"40","user":"3000","user_group":"ADMIN","full_name":"crystal test","active":"Y","closer_default_blended":"1"},{"user_id":"42","user":"8080","user_group":"ADMIN","full_name":"Alex Treichler","active":"Y","closer_default_blended":"0"},{"user_id":"43","user":"7564738","user_group":"1000","full_name":"User","active":"Y","closer_default_blended":"1"},{"user_id":"44","user":"7564737","user_group":"1000","full_name":"User","active":"Y","closer_default_blended":"1"},{"user_id":"45","user":"1801","user_group":"ADMIN","full_name":"Winback1","active":"Y","closer_default_blended":"1"},{"user_id":"46","user":"1802","user_group":"WinBack","full_name":"Winback2","active":"Y","closer_default_blended":"1"},{"user_id":"47","user":"1803","user_group":"1000","full_name":"Winback1","active":"Y","closer_default_blended":"0"},{"user_id":"48","user":"1804","user_group":"1000","full_name":"Winback1","active":"Y","closer_default_blended":"0"},{"user_id":"49","user":"1805","user_group":"1000","full_name":"Winback1","active":"Y","closer_default_blended":"0"},{"user_id":"50","user":"8888","user_group":"ADMIN","full_name":"Taylor Inkster","active":"Y","closer_default_blended":"1"},{"user_id":"51","user":"77777","user_group":"1000","full_name":"Michael Truong","active":"Y","closer_default_blended":"1"},{"user_id":"52","user":"8989","user_group":"1000","full_name":"Bwells Test","active":"Y","closer_default_blended":"0"},{"user_id":"53","user":"989898","user_group":"ADMIN","full_name":"Bwells Test","active":"Y","closer_default_blended":"0"},{"user_id":"76","user":"9698","user_group":"KiranGroup2","full_name":"Pritee Test User","active":"Y","closer_default_blended":"1"},{"user_id":"55","user":"7070","user_group":"ADMIN","full_name":"XLite","active":"Y","closer_default_blended":"0"},{"user_id":"56","user":"4444","user_group":"ADMIN","full_name":"4444","active":"Y","closer_default_blended":"1"},{"user_id":"57","user":"2004","user_group":"Hanyytel","full_name":"hany test","active":"Y","closer_default_blended":"1"},{"user_id":"58","user":"5051","user_group":"ADMIN","full_name":"Test User","active":"Y","closer_default_blended":"0"},{"user_id":"59","user":"5052","user_group":"ADMIN","full_name":"Test User","active":"Y","closer_default_blended":"0"},{"user_id":"60","user":"5053","user_group":"ADMIN","full_name":"Test User","active":"Y","closer_default_blended":"0"},{"user_id":"61","user":"0405","user_group":"KiranGroup","full_name":"Kiran Gaikwad","active":"Y","closer_default_blended":"1"},{"user_id":"62","user":"1986","user_group":"ADMIN","full_name":"Patrick User","active":"Y","closer_default_blended":"1"},{"user_id":"63","user":"2234","user_group":"KevinYtel","full_name":"Holly Softphone","active":"Y","closer_default_blended":"1"},{"user_id":"66","user":"9898","user_group":"ADMIN","full_name":"Pritee Test","active":"Y","closer_default_blended":"1"},{"user_id":"67","user":"0406","user_group":"ADMIN","full_name":"Kiran Gaikwad2","active":"Y","closer_default_blended":"1"},{"user_id":"70","user":"2020","user_group":"ADMIN","full_name":"KevinT Phone  Do Not Delete","active":"Y","closer_default_blended":"1"},{"user_id":"72","user":"7864","user_group":"ADMIN","full_name":"Pritee Test","active":"Y","closer_default_blended":"1"},{"user_id":"81","user":"3030","user_group":"KiranGroup","full_name":"Sachin Test","active":"Y","closer_default_blended":"1"}]';

            return  $list;  


            }

        public function agent_group_listing(){



                $list='[{"user_group":"K3","group_name":"YTEL ADMINISTRATOR","forced_timeclock_login":"N"},{"user_group":"AGENTS","group_name":"AGENTS","forced_timeclock_login":"N"},{"user_group":"Goodsell","group_name":"Support","forced_timeclock_login":"Y"},{"user_group":"BILLING","group_name":"BILLING","forced_timeclock_login":"N"},{"user_group":"RMR","group_name":"Realtime main report","forced_timeclock_login":"Y"},{"user_group":"OPENER","group_name":"OPENERS","forced_timeclock_login":"N"},{"user_group":"K1","group_name":"YTEL ADMINISTRATORSA","forced_timeclock_login":"N"},{"user_group":"sip_pro","group_name":"Sip Pro","forced_timeclock_login":"N"},{"user_group":"DPPDemo","group_name":"DPP Demo","forced_timeclock_login":"N"},{"user_group":"Alex","group_name":"Alex Test Group","forced_timeclock_login":"Y"},{"user_group":"K2","group_name":"test1","forced_timeclock_login":"ADMIN_EXEMPT"},{"user_group":"test123","group_name":"sdjh","forced_timeclock_login":"N"},{"user_group":"test","group_name":"test1","forced_timeclock_login":"Y"},{"user_group":"kiran1","group_name":"test1","forced_timeclock_login":"Y"},{"user_group":"teste","group_name":"test1","forced_timeclock_login":"ADMIN_EXEMPT"},{"user_group":"testing321","group_name":"test1","forced_timeclock_login":"Y"},{"user_group":"test1002","group_name":"testtest","forced_timeclock_login":"N"},{"user_group":"testk","group_name":"test","forced_timeclock_login":"N"}]';

                return  $list;  


                }

            public function inboundgroup(){

              $list='[{"agent_id":"111","agent_name":"aaaaaa","rank":"4","grade":"7","calls":"0","web_var":"Test","status":false},{"agent_id":"222","agent_name":"aaaaaa","rank":"4","grade":"7","calls":"0","web_var":"Test","status":false},{"agent_id":"333","agent_name":"aaaaaa","rank":"4","grade":"7","calls":"0","web_var":"Test","status":true},{"agent_id":"444","agent_name":"aaaaaa","rank":"4","grade":"7","calls":"0","web_var":"Test","status":false},{"agent_id":"555","agent_name":"aaaaaa","rank":"4","grade":"7","calls":"0","web_var":"Test","status":true}]';

            return  $list;  
            }   
            public function campaignrank(){

              $list='[{"campaign_id":"111","campaign_name":"aaaaaa","rank":"4","grade":"7","calls":"0","web_var":"Test","status":false},{"campaign_id":"222","campaign_name":"aaaaaa","rank":"4","grade":"7","calls":"0","web_var":"Test","status":false},{"campaign_id":"333","campaign_name":"aaaaaa","rank":"4","grade":"7","calls":"0","web_var":"Test","status":true},{"campaign_id":"444","campaign_name":"aaaaaa","rank":"4","grade":"7","calls":"0","web_var":"Test","status":false},{"campaign_id":"555","campaign_name":"aaaaaa","rank":"4","grade":"7","calls":"0","web_var":"Test","status":true}]';

            return  $list;  
            } 


           public function getTestData(Request $req){
             $api_data= '[{"campaign_id":"","tot_area_codes":0,"campaign_name":"","active":"","auto_dial_level":"0","dial_method":"MANUAL","campaign_cid":"0000000000","use_custom_cid":"N","lead_order_randomize":"N"},{"campaign_id":"0001","tot_area_codes":0,"campaign_name":"test12","active":"Y","auto_dial_level":"0","dial_method":"RATIO","campaign_cid":"8009267007","use_custom_cid":"N","lead_order_randomize":"N"},{"campaign_id":"0002","tot_area_codes":0,"campaign_name":"test12","active":"N","auto_dial_level":"0","dial_method":"RATIO","campaign_cid":"8009260203","use_custom_cid":"N","lead_order_randomize":"N" 
             },{"campaign_id":"","tot_area_codes":0,"campaign_name":"","active":"","auto_dial_level":"0","dial_method":"MANUAL","campaign_cid":"0000000000","use_custom_cid":"N","lead_order_randomize":"N"},{"campaign_id":"0001","tot_area_codes":0,"campaign_name":"test12","active":"Y","auto_dial_level":"0","dial_method":"RATIO","campaign_cid":"8009267007","use_custom_cid":"N","lead_order_randomize":"N"},{"campaign_id":"0002","tot_area_codes":0,"campaign_name":"test12","active":"N","auto_dial_level":"0","dial_method":"RATIO","campaign_cid":"8009260203","use_custom_cid":"N","lead_order_randomize":"N" 
             }]';


             return $api_data;
         
             }            
           
               public function getStatusData(Request $req){
             $api_data= '[{"ViciCampaign":{"campaign_id":"","campaign_name":null,"0":"NONE"}},{"ViciCampaign":{"campaign_id":"0004","campaign_name":"test121","0":"testh ","1":["testh"]}},{"ViciCampaign":{"campaign_id":"0410","campaign_name":"Ytel API Test","0":"test32 ","1":["test32"]}},{"ViciCampaign":{"campaign_id":"1000","campaign_name":"Ytel API Test","0":"NONE"}},{"ViciCampaign":{"campaign_id":"2016","campaign_name":"Adwords","0":"test34 ","1":["test34"]}},{"ViciCampaign":{"campaign_id":"2017","campaign_name":"test12","0":"NONE"}},{"ViciCampaign":{"campaign_id":"5971977","campaign_name":"Krishna Test Ignore","0":"SIMPLE BAD WRONG Bill SUPPOR PPC sales ","1":["SIMPLE","BAD","WRONG","Bill","SUPPOR","PPC","sales"]}},{"ViciCampaign":{"campaign_id":"62683642","campaign_name":"Sarfaraj","0":"TEST1 TestSt ","1":["TEST1","TestSt"]}},{"ViciCampaign":{"campaign_id":"SSupport","campaign_name":"Support","0":"other BillTr resolv 911 SaleTR intxfr LM VIP911 pendng train JCTS AGD ","1":["other","BillTr","resolv","911","SaleTR","intxfr","LM","VIP911","pendng","train","JCTS","AGD"]}},{"ViciCampaign":{"campaign_id":"vpdemo","campaign_name":"Voice Path Demo 1","0":"prank ","1":["prank"]}}]';


             return $api_data;
         
             }  


             public function getcampaigns(Request $req){
                     $api_data= '[  {"0001":"test12","0002":"test12","0003":"Ytel API Test1","0004":"test121","0005":"test123","040588":"040588 Campaign","0409":"test12","0410":"Ytel API Test","1000":"Ytel API Test","2016":"Adwords","2017":"test12","2018":"0Campaign","5971977":"Krishna Test Ignore","62683642":"Sarfaraj","8858325":"Debt Pay Pro Demo","8888":"8888 Campaign","898988":"AS Test","909090":"8888 Campaign","93238190":"Sunny Test","9876":"Sales Demo","99899":"LEAD PREVIEW TEST","9999":"Sunny Test","acct":"Billing Department1","DPPDemo":"Debt Pay Pro Demo","IanTest":"Ian Posting Test SMT","kk":"Krishna Test Ignore","ktest":"test12","M360":"Message360","Matrix":"Competitor Matrix","MDialOly":"M Dial Only","sales":"Sales Outbound DO NOT USE","sales2":"Sales Team","sip_pro":"Sip Pro","SSupport":"Support","test":"test12","test1":"test12","test33":"test334","TESTOM":"test12","vpdemo":"Voice Path Demo 1"}]';

                return $api_data;

                 }
                public function getagentlist(Request $req){
                     $api_data= '{"AGENTS":"AGENTS","Alex":"Alex","BILLING":"BILLING","DPPDemo":"DPPDemo","Goodsell":"Goodsell","K1":"K1","K2":"K2","K3":"K3","kiran1":"kiran1","OPENER":"OPENER","RMR":"RMR","sip_pro":"sip_pro","test":"test","test1002":"test1002","test123":"test123","teste":"teste","testing321":"testing321","testk":"testk"}]';

                return $api_data;

                 }   

                public function X5Constactgroup(Request $req){
                     $api_data= '[ { "X5ContactGroup": { "x5_contact_group_id": "585", "super": true, "type": "1", "group_name": "Super Admin", "group_description": "Super Admin", "create_datetime": "2017-02-13 19:25:55" } }, { "X5ContactGroup": { "x5_contact_group_id": "668", "super": false, "type": "2", "group_name": "Users", "group_description": "Users Can only do some operations", "create_datetime": "2017-04-27 06:47:14" } }, { "X5ContactGroup": { "x5_contact_group_id": "900", "super": false, "type": "2", "group_name": "demo", "group_description": "temp", "create_datetime": "2017-12-15 08:39:42" } }, { "X5ContactGroup": { "x5_contact_group_id": "901", "super": false, "type": "2", "group_name": "temp", "group_description": "test", "create_datetime": "2017-12-15 08:58:04" } }, { "X5ContactGroup": { "x5_contact_group_id": "902", "super": false, "type": "2", "group_name": "Testdata", "group_description": "Test1212", "create_datetime": "2017-12-15 09:25:01" } }, { "X5ContactGroup": { "x5_contact_group_id": "906", "super": false, "type": "2", "group_name": "Demo123", "group_description": "test", "create_datetime": "2017-12-15 09:31:12" } }, { "X5ContactGroup": { "x5_contact_group_id": "909", "super": false, "type": "2", "group_name": "temp", "group_description": "hi", "create_datetime": "2017-12-15 09:54:29" } }, { "X5ContactGroup": { "x5_contact_group_id": "910", "super": false, "type": "2", "group_name": "ok", "group_description": "hi", "create_datetime": "2017-12-15 10:06:42" } }, { "X5ContactGroup": { "x5_contact_group_id": "911", "super": false, "type": "2", "group_name": "BALAJI TEST", "group_description": "ok ok", "create_datetime": "2017-12-15 12:19:09" } }, { "X5ContactGroup": { "x5_contact_group_id": "924", "super": false, "type": "2", "group_name": "Test", "group_description": "This is the Test Group", "create_datetime": "2018-01-05 10:50:06" } }, { "X5ContactGroup": { "x5_contact_group_id": "925", "super": false, "type": "2", "group_name": "Admin", "group_description": "Test", "create_datetime": "2018-01-05 10:50:50" } }, { "X5ContactGroup": { "x5_contact_group_id": "926", "super": false, "type": "2", "group_name": "Administrator", "group_description": "Administrator", "create_datetime": "2018-01-05 10:51:52" } }, { "X5ContactGroup": { "x5_contact_group_id": "927", "super": false, "type": "2", "group_name": "Admin", "group_description": "Admin", "create_datetime": "2018-01-05 10:52:20" } }, { "X5ContactGroup": { "x5_contact_group_id": "979", "super": false, "type": "2", "group_name": "test", "group_description": "test test", "create_datetime": "2018-03-15 10:03:56" } }, { "X5ContactGroup": { "x5_contact_group_id": "980", "super": false, "type": "2", "group_name": "TEST User", "group_description": "Test User", "create_datetime": "2018-03-15 10:23:56" } }, { "X5ContactGroup": { "x5_contact_group_id": "1081", "super": false, "type": "2", "group_name": "RTPMM", "group_description": "a", "create_datetime": "2018-05-26 11:53:35" } }, { "X5ContactGroup": { "x5_contact_group_id": "1084", "super": false, "type": "2", "group_name": "BAVP", "group_description": "aaa", "create_datetime": "2018-05-28 07:00:01" } }, { "X5ContactGroup": { "x5_contact_group_id": "1085", "super": false, "type": "2", "group_name": "YTEL_TEST", "group_description": "YTEL_TEST", "create_datetime": "2018-05-28 07:00:50" } }, { "X5ContactGroup": { "x5_contact_group_id": "1086", "super": false, "type": "2", "group_name": "YTEL_TEST", "group_description": "YTEL_TEST", "create_datetime": "2018-05-28 07:01:17" } } ]';

                return $api_data;

                 }   


                public function contactList(Request $req){
                     $api_data= '{ "x5Contacts": [ { "X5Contact": { "x5_contact_id": "345", "name": "sangeeth", "username": "sangeeth@xoyal.com", "enable": true, "group_ids": "585", "group_names": "Super Admin" } }, { "X5Contact": { "x5_contact_id": "1064", "name": "Krishna Belkune test", "username": "balaji@ytel.co.in", "enable": true, "group_ids": "585,924", "group_names": "Super Admin,Test" } }, { "X5Contact": { "x5_contact_id": "2315", "name": "Sharat", "username": "sharat@xoyal.com", "enable": true, "group_ids": "911,924,926,979", "group_names": "BALAJI TEST,Test,Administrator" } } ], "$allowContactGroup": [ "585", "668", "899", "900", "901", "902", "903", "904", "905", "906", "907", "908", "909", "910", "911", "912", "913", "914", "915", "924", "925", "926", "927", "979", "980", "998", "1036", "1059", "1060", "1066", "1081", "1082", "1084", "1085", "1086" ], "status": true }';

                return $api_data;

                 } 
                public function record(Request $req){
                     $api_data= '{ "userGroup": { "X5ContactGroup": { "x5_contact_group_id": "1139", "company_id": "102504", "super": false, "type": "2", "group_name": "aaaa", "group_description": "aaaaaa", "create_datetime": "2018-07-11 08:49:05", "update_datetime": "2018-07-11 08:49:05", "delete_datetime": null } }, "status": true }';

                return $api_data;

                 } 



}
