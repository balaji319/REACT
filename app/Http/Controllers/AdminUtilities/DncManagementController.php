<?php

/*
 * Controller for admin utilities dnc number module
 * @author
 *
 */

namespace App\Http\Controllers\AdminUtilities;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Traits\AccessControl;
use App\Traits\ErrorLog;
use App\Traits\Helper;
use App\VicidialDnc;
use App\X5ContactAccess;
use App\VicidialCampaignDnc;
use App\VicidialCampaigns;
use App\Http\Controllers\AdminUtilities\AdminUtilitiesErrors;
use Exception;
use Rap2hpoutre\FastExcel\FastExcel;

class DncManagementController extends Controller {
    use ErrorLog,
        AccessControl,
        Helper;

    /**
     * Get campaign dropdown list
     * @param Request $request
     * @return array
     */
    public function getCampaigns(Request $request) {

        $list = VicidialCampaigns::getCampaignsIdDropdown();


        return response()->json($list);
    }

    /**
     * Add dnc number
     * @param Request $request
     * @return type
     */
    public function addDncNumber(Request $request) {

        try {
            $phone_numbers = $request->input('phone_number');
            $campaign_id = $request->input('campaign_id');
            $type = $request->input('type');
            $phone_numbers = preg_replace('/[^X\n0-9]/', '', $phone_numbers);
            $success = $invalid = $already_in_dnc = [];

            if (strlen($phone_numbers) >= 1) {
                $phone_arr = explode("\n", $phone_numbers);

                foreach ($phone_arr as $phone) {

                    if (trim($phone) != '') {

                        if (strlen(trim($phone)) > 18) {
                            $invalid[] = $phone;
                            continue;
                        }

                        if ($campaign_id == 'SYSTEM_INTERNAL') {

                            $phone_data = VicidialDnc::getByPhoneNumber($phone, ['phone_number']);

                            if ($type == 'add') {
                                if (count($phone_data)) {
                                    $already_in_dnc[] = $phone;
                                } else {
                                    $result = VicidialDnc::makeDnc(['phone_number' => $phone]);
                                    if ($result) {
                                        $success[] = $phone;
                                    }
                                }
                            } elseif ($type == 'delete') {
                                if (count($phone_data)) {
                                    $result = VicidialDnc::deleteDnc($phone);
                                    if ($result) {
                                        $success[] = $phone;
                                    }
                                } else {
                                    $already_in_dnc[] = $phone;
                                }
                            }
                        } else {
                            $phone_data = VicidialCampaignDnc::getByIdPhoneNumber($phone, $campaign_id, ['phone_number', 'campaign_id']);

                            if ($type == 'add') {
                                if (count($phone_data)) {
                                    $already_in_dnc[] = $phone;
                                } else {
                                    $result = VicidialCampaignDnc::makeDnc(['phone_number' => $phone, 'campaign_id' => $campaign_id]);
                                    if ($result) {
                                        $success[] = $phone;
                                    }
                                }
                            } elseif ($type == 'delete') {
                                if (count($phone_data)) {
                                    $result = VicidialCampaignDnc::deleteDnc($phone, $campaign_id);
                                    if ($result) {
                                        $success[] = $phone;
                                    }
                                } else {
                                    $already_in_dnc[] = $phone;
                                }
                            }
                        }
                    }
                }

                $success_count = count($success);
                $duplicate_count = count($already_in_dnc);
                $invalid_count = count($invalid);

                $success_msg = "";
                if ($type == 'add') {
                    $success_msg = $success_count ? $success_count . AdminUtilitiesErrors::DNC_ADD_SUCCESS : '';
                } elseif ($type == 'delete') {
                    $success_msg = $success_count ? $success_count . AdminUtilitiesErrors::DNC_DELETE_SUCCESS : '';
                }

                $error_msg = "";

                $duplicate_count ? $error_msg .= $duplicate_count . AdminUtilitiesErrors::DNC_ADD_DUPLICATE : '';
                $invalid_count ? $error_msg .= $invalid_count . AdminUtilitiesErrors::DNC_ADD_INVALID : '';

                return response()->json([
                            'success_numbers' => $success
                            , 'invalid_numbers' => $invalid
                            , 'duplicate_numbers' => $already_in_dnc
                            , 'success_msg' => $success_msg
                            , 'error_msg' => $error_msg
                ]);
            }
        } catch (Exception $ex) {
            return response()->json([
                        'success_numbers' => []
                        , 'invalid_numbers' => []
                        , 'duplicate_numbers' => []
                        , 'success_msg' => ''
                        , 'error_msg' => 'Error occurred. Please try again !'
            ]);
        }
    }

    /**
     * Add download dnc number
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $request
     * @return type
     */
     /**
     * Add download dnc number
     * @author shital <shital@ytel.com>
     * @param Request $request
     * @return type
     */
    public function downloadDncList(Request $request) {

        try {

            if (isset($request['campaign_id']) && $request['campaign_id']!="SYSTEM_INTERNAL") {
                $campaign_id=$request['campaign_id'];
                $record=VicidialCampaignDnc::where('campaign_id',$campaign_id)->get(['phone_number']);

                $total_records =count($record);


            } else {
                $campaign_id = 'SYSTEM_INTERNAL';
                $record=VicidialDnc::get();
                $total_records =count($record);


            }
            if($total_records<EXPORT_DNC_REPORT_LIMIT){
               $return['status'] = "limited";
               $return['total_records'] =$total_records;

               return (new FastExcel($record))->download('dncfile.csv');
             // return response()->json(['status' => 200,'data' =>$return,'msg' => "Success"],200);
            }else{
                throw new Exception('Error.',404);
                // $this->export($request['campaign_id'],$total_records);
            }

        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }



}
