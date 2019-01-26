<?php

namespace App\Http\Controllers\CallMenu;

use Illuminate\Http\Request;
use App\Http\Requests\CallMenuRequest;
use App\Http\Controllers\Controller;
use App\VicidialCallMenu;
use App\VicidialUserGroup;
use Exception;
use App\Traits\AccessControl;
use App\Traits\ErrorLog;
use App\Traits\Helper;
use App\VicidialOverrideId;
use App\Servers;
use App\VicidialAdminLog;
use App\VicidialCallMenuOption;
use App\VicidialInboundDid;
use App\VicidialCampaignCidAreacode;
use App\Phone;
use App\X5Log;

class CallMenuController extends Controller {

    use ErrorLog,
        AccessControl,
        Helper;

    /**
     * Listing of all call menus.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws \App\Http\Controllers\CallMenu\Exception
     */
    public function index(Request $request) {
        try {

            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $limit = $request->get('limit') ?: \Config::get("configs.pagination_limit");
            $search = $request->get('search') ?: NULL;
            $userGroup = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_USERGROUP, ACCESS_READ, $current_company_id, $user);
            array_push($userGroup, '---ALL---');
            $call_menus = VicidialCallMenu::callMenuList($userGroup, $search, $limit);


            return response()->json(['status' => 200, 'message' => 'Success', 'data' => $call_menus]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(CallMenuRequest $request) {

        try {
            $user = $request->user();
            $current_company_id = $request->current_company_id;
            $validation = new VicidialCallMenu;


            $validation = $validation->reservedWords($request['menu_id']);


            if ($validation) {
                throw new Exception('Reserved word cannot be used as Call Menu ID.', 400);
            }
            // Check for id override
            // $overrideId=new VicidialOverrideId;
            // $overrideId = $overrideId->getOverrideId();

            $override_id = VicidialOverrideId::where('id_table', 'vicidial_call_menu')->where('active', '1')->first();

            if (!empty($override_id)) {
                $new_id = $override_id->value + 1;
                $data['value'] = $new_id;
                $override_id->fill($data)->save();
            }

            if ($override_id) {
                $menuId = $new_id;
            } else {
                $menuId = $request['menu_id'];
            }

            $checkDuplicate = VicidialCallMenu::find($menuId);

            if ($checkDuplicate) {
                throw new Exception('Call Menu ID is taken, please try another ID.');
            } else {
                $request['menu_id'] = $menuId;

                VicidialCallMenu::create($request->all());

            }



            $query = Servers::where('generate_vicidial_conf', 'Y')->where('active_asterisk_server', 'Y')->first();

            $serverdata['rebuild_conf_files'] = 'Y';
            $query->fill($serverdata)->save();

            $admin_log = new VicidialAdminLog();

            $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log['user'] = $user->username;
            $admin_log['ip_address'] = $this->clientIp();
            $admin_log['event_section'] = "CALLMENUS";
            $admin_log['event_type'] = "ADD";
            $admin_log['record_id'] = $menuId;
            $admin_log['event_code'] = "ADMIN ADD CALL MENU";
            $admin_log['event_sql'] = "INSERT INTO vicidial_call_menu (menu_id,menu_name,user_group) values('".$menuId ."','".$request['menu_name']."','".$request['user_group'] . "')";
            $admin_log['event_notes'] = "";
            $admin_log['user_group'] = $request['user_group'];
            $admin_log->save();



            return response()->json(['status' => 200,'msg' => "successfully Added"], 200);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($menu_id) {
        try {

            $callmenu_list = VicidialCallMenu::find($menu_id);

            $callMenuOptions = VicidialCallMenuOption::where('menu_id', $menu_id)->get();

            $data['callmenu_list']=$callmenu_list;

            $data['callMenuOptions']=$callMenuOptions;

            if (!$callmenu_list) {
                throw new Exception('This record is not present.', 400);
            }
            return response()->json(['status' => 200, 'data' => $data, 'msg' => "Success"], 200);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(CallMenuRequest $request) {
        try {
            $menu_id = $request['menu_id'];

            $user = $request->user();
            $current_company_id = $request->current_company_id;
            // $permissions_list = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_INGROUP,ACCESS_READ,$current_company_id, $user);

            $access_type_list = $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_UPDATE, $user);

            if (!empty((SYSTEM_COMPONENT_INBOUND_CALL_MENU) && !in_array(SYSTEM_COMPONENT_INBOUND_CALL_MENU, $access_type_list))) {
                throw new Exception('Cannot update inbound Queue.',400);
            }



            $originData = VicidialCallMenu::where('menu_id', $menu_id)->first();
            // return $originData;
            $originData = $originData->fill($request->all());
            $originData->save();


            // $reset_list = trim($request['reset_list']);

            $list_order_randomize = $request['list_order_randomize'];
            if ($list_order_randomize != "") {

                $campaign_id1 = $request['campaign_id'];
                $campaign = VicidialCampaign::find($campaign_id1);
                $data['lead_order_randomize'] = $list_order_randomize;
                $campaign->fill($data)->save();
            }


            $query = Servers::where('generate_vicidial_conf', 'Y')->where('active_asterisk_server', 'Y')->first();

            $serverdata['rebuild_conf_files'] = 'Y';
            $query->fill($serverdata)->save();



            $admin_log = new VicidialAdminLog();

            $admin_log['event_date'] = \Carbon\Carbon::now()->toDateTimeString();
            $admin_log['user'] = $user->x5_contact_id;
            $admin_log['ip_address'] = $this->clientIp();
            $admin_log['event_section'] = "CALLMENUS";
            $admin_log['event_type'] = "MODIFY";
            $admin_log['record_id'] = $request['menu_id'];
            $admin_log['event_code'] = "ADMIN MODIFY CALL MENU";
            $admin_log['event_sql'] = "UPDATE vicidial_call_menu SET menu_name='" . $request['menu_name'] . "',user_group='" . $request['user_group'] . "',menu_prompt='" . $request['menu_prompt'] . "',menu_timeout='" . $request['menu_timeout'] . "',menu_timeout_prompt='" . $request['menu_timeout_prompt'] . "',menu_invalid_prompt='" . $request['menu_invalid_prompt'] . "',menu_repeat='" . $request['menu_repeat'] . "',menu_time_check='" . $request['menu_time_check'] . "',call_time_id='" . $request['call_time_id'] . "',track_in_vdac='" . $request['track_in_vdac'] . "',tracking_group='" . $request['tracking_group'] . "',dtmf_log='" . $request['dtmf_log'] . "',dtmf_field='" . $request['dtmf_field'] . "' WHERE menu_id='" . $request['menu_id'] . "'";
            $admin_log['event_notes'] = "";
            $admin_log['user_group'] = $originData->user_group;
            $admin_log->save();

            $x5_log_data = new X5Log;
            $x5_log_data['change_datetime'] = \Carbon\Carbon::now()->toDateTimeString();
            $x5_log_data['x5_contact_id'] = $user->x5_contact_id;
            $x5_log_data['company_id'] = $user->company_id;
            $x5_log_data['user_ip'] = $this->clientIp();
            $x5_log_data['class'] = "CallMenuController";
            $x5_log_data['method'] = __FUNCTION__;
            $x5_log_data['model'] = User::class;
            $x5_log_data['action_1'] = "MODIFY";
            $x5_log_data->save();

            return response()->json(['status' => 200, 'data' => $originData, 'msg' => "successfully Updated"], 200);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param    $menu_id
     * @return \Illuminate\Http\Response
     */
    public function destroy($menu_id) {
        try {


            if (empty($menu_id) || $menu_id == '') {
                throw new Exception('Request parameter `menu_id` is empty', 400);
            } else {
                $call_menu = VicidialCallMenu::find($menu_id);
                if (!empty($call_menu)) {
                    $call_menu->delete();
                    return response()->json(['status' => 200, 'msg' => "Success"], 200);
                } else
                    throw new Exception('Record not found.', 400);
            }
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * add call menu options.
     *
     * @param   Request $request
     * @return \Illuminate\Http\Response
     */
    public function addCallMenuOptions(Request $request) {
        try {
            // return $request['callMenuOptions'];
            // return $request['menu_id'];
            $optionvalue = $request['callMenuOptions'];

            $cnt_array = array();

            if (!empty($optionvalue)) {

                foreach ($optionvalue as $key1 => $value1) {
                    foreach ($value1 as $key => $value) {

                        if ($key == 'option_value') {
                            array_push($cnt_array, $value);
                        }
                    }
                }
            }

            $countArray = array_count_values($cnt_array);

            foreach ($countArray as $key => $val) {
                if ($val != 1) {
                    throw new Exception('duplicate option value selected', 400);
                }
            }
            if (empty($request['menu_id']) || $request['menu_id'] == '') {
                throw new Exception('Request parameter `menu_id` is empty', 400);
            }

            $result = $this->removeCallMenuOptions($request['menu_id']);


            if (!empty($request['callMenuOptions'])) {

                foreach ($optionvalue as $key => $value) {

                    VicidialCallMenuOption::create($value);
                }
            }

            return response()->json(['status' => 200, 'msg' => "Success"], 200);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Delete call menu options.
     *
     * @param   $menu_id
     * @return \Illuminate\Http\Response
     */
    public function removeCallMenuOptions($menu_id) {
        try {
            $result = VicidialCallMenuOption::where('menu_id', $menu_id)->get();

            foreach ($result as $res) {
                $res->delete();
            }
            return response()->json(['status' => 200, 'msg' => "Success"], 200);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * List of Admin user group.
     *
     * @param  Request $request
     * @return \Illuminate\Http\Response
     */
    public function adminUserGroupList(Request $request) {
        try {

            $user = $request->user();
            $current_company_id = $request->current_company_id;

            $permission = $this->getListByAccess(ACCESS_TYPE_USERGROUP, ACCESS_READ, $user);

            $list = VicidialUserGroup::whereIn('user_group', $permission)->orderBy('user_group', 'desc')->get(['user_group']);
            return response()->json(['status' => 200, 'data' => $list, 'msg' => "Success"], 200);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * List of did InGroup (numbers) for perticular menu_id.
     *
     * @param   $menu_id
     * @return \Illuminate\Http\Response
     */
    public function getdidInGroupForCallMenu($menu_id) {
        try {
            $list = VicidialInboundDid::getList($menu_id);

            return response()->json(['status' => 200, 'data' => $list, 'msg' => "Success"], 200);

            return json_encode(array('did_list' => $list));
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * List of call Menu Options.
     *
     * @param   $menu_id
     * @return \Illuminate\Http\Response
     */
    public function callMenuOption($menu_id) {
        try {
            $callMenuOptions = VicidialCallMenuOption::where('menu_id', $menu_id)->get();
            return response()->json(['status' => 200, 'data' => $callMenuOptions, 'msg' => "Success"], 200);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * List of DIDs .
     *
     * @param
     * @return \Illuminate\Http\Response
     */
    public function getDids() {
        try {
            $list_listing = VicidialInboundDid::orderBy('did_pattern')->get();


            $list = $main = array();

            foreach ($list_listing as $key => $value) {

                if ($value == null) {
                    $main[$key] = '';
                } else {
                    $main[$key] = $value;
                }

                $areacodelist=VicidialCampaignCidAreacode::where('campaign_id',$value->campaign_id)->get();
                $main[$key]['tot_area_codes'] = count($areacodelist);
            }
            array_push($list, $main);
            unset($main);
            $main = array();

            return response()->json(['status' => 200, 'data' => $list, 'msg' => "Success"], 200);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * List of extention.
     *
     * @param
     * @return \Illuminate\Http\Response
     */
    public function phone() {
        try {

            $list = Phone::getAll();
            return response()->json(['status' => 200, 'data' => $list, 'msg' => "Success"], 200);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

}
