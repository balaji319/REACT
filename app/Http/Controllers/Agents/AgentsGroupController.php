<?php

namespace App\Http\Controllers\Agents;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\VicidialUserGroup;
use App\Http\Controllers\Agents\AgentsCommon;
use App\Http\Controllers\Agents\AgentsConstants as Agents;
use App\Http\Controllers\Agents\AgentsErrors;
use App\Traits\AuthCheck;
use App\Traits\Helper;
use App\Traits\ErrorLog;
use Exception;
use App\VicidialAdminLog;

class AgentsGroupController extends Controller
{
    
    use AuthCheck,Helper,ErrorLog;
       
    /**
     * Get Agents list
     * @author Harshal Pawar
     * @return json
     */
    public function index(Request $request) {
        #get all admin      
        try{
            $search = '%'.$request->input('search').'%';
            $limit = $request->get('limit') ?: \Config::get("configs.pagination_limit");
            $list = VicidialUserGroup::select('user_group','group_name','forced_timeclock_login')
                     ->where('user_group', 'like', $search)
                    ->orWhere('group_name', 'like', $search)
                    ->orWhere('forced_timeclock_login', 'like', $search)
                    ->Paginate($limit);
            $data = [
                'status'=>200,
                'data' => $list
            ];
            return response()->json($data);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
        
    }
    
    
    public function getAdminUserGroupOptionList()
    {
        $list = $this->ViciUserGroup->find('list', array(
            'fields' => array(
                'user_group',
                'options_title'
            //'group_name'
            ),
            'conditions' => [
                'user_group' => $this->AccessControl->getListByAccess(ACCESS_TYPE_USERGROUP, ACCESS_READ)
            ],
            'order' => array(
                "user_group"
            )
        ));

    //            if (isset($this->request->query['show_all']) && $this->request->query['show_all']) {
    //                $list = array_merge(array(
    //                    '---ALL---' => 'All Admin User Groups'
    //                    ), $list);
    //            }

        return json_encode($list);
    }

    /*
     * Delete user group .
     * @Author Harshal Pawar.
     */
    public function delete(Request $request){
        try{
            $user_group = $request->input('user_id');
            if(isset($user_group)){
                $group = VicidialUserGroup::find($user_group);
                if(isset($group)){
                    $result = VicidialUserGroup::find($user_group)->delete();
                    if($result > 0 ){
                        $stmt = "DELETE from vicidial_user_groups where user_group=\'$user_group\'";
                        $users = $request->user();
                        $admin_log = New VicidialAdminLog();
                        $admin_log->event_date = date("Y-m-d H:i:s");
                        $admin_log->user =  $users->username;
                        $admin_log->ip_address = $request->ip();
                        $admin_log->event_section = 'USERGROUPS';
                        $admin_log->event_type = 'DELETE';
                        $admin_log->record_id = $stmt;
                        $admin_log->event_code = 'ADMIN DELETE USER GROUP';
                        $admin_log->event_sql = '';
                        $admin_log->event_notes = '';
                        $admin_log->save();
                    }
                    return response()->json([
                        'status'=>200,    
                        'message' => 'Agent group deleted Successfully !',
                    ]);
                } else {
                return response()->json([
                    'status'=>500,    
                    'message' => 'User group not found.',
                ]);
                }
            } else {
                return response()->json([
                    'status'=>500,    
                    'message' => 'user group required.',
                ]);
            }
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }
    
    
    /*
     * Creatte neww user group .
     * @Author Harshal Pawar.
     */
    public function create(Request $request){
        try{
            $request->validate([
                'group_name' => 'required||max:20|min:2',
                'user_group' => 'required|max:20|min:2|unique:dyna.vicidial_user_groups',
            ]);
            $result = new VicidialUserGroup;
            $result->user_group = $request->input('user_group');
            $result->group_name = $request->input('group_name');
            $result->save();
                $sql = "INSERT INTO vicidial_user_groups SET group_name='".$request->input('group_name').",'user_id='$request->input('user_group')'";
                $users = $request->user();
                $admin_log = New VicidialAdminLog();
                $admin_log->event_date = date("Y-m-d H:i:s");
                $admin_log->user =  $users->username;
                $admin_log->ip_address = $request->ip();
                $admin_log->event_section = 'USERGROUPS';
                $admin_log->event_type = 'CREATE';
                $admin_log->record_id = $sql;
                $admin_log->event_code = 'ADMIN';
                $admin_log->event_sql = $sql;
                $admin_log->event_notes = '';
                $admin_log->save();
            return response()->json([
                'status'=>200,    
                'message' => 'user group created successfully.',
            ]);
    } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }
    
    
    /*
     * Edit user group .
     * @Author Harshal Pawar.
     */
    public function edit(Request $request){
        try{
            $request->validate([
                'group_name' => 'required||max:20|min:2',
            ]);
            $str_cam= " " . implode(" ", $request->input('allowed_campaigns')) . " -";
            $allowed_campaigns = is_array($request->input('allowed_campaigns')) ? $str_cam : '';
            $agent_status_viewable_groups =is_array($request->input('agent_status_viewable_groups')) ?  "-" . implode(" ", $request->input('agent_status_viewable_groups')) . "-" :'';
            $user_group = $request->input('user_group');
            if(isset($user_group)){
                $result = VicidialUserGroup::find($user_group);
                if(isset($result)){
                    $result->agent_call_log_view = $request->input('agent_call_log_view');
                    $result->agent_status_view_time = $request->input('agent_status_view_time');
                    $result->agent_status_viewable_groups = $agent_status_viewable_groups;
                    $result->allowed_campaigns = $allowed_campaigns;
                    $result->forced_timeclock_login = $request->input('forced_timeclock_login');
                    $result->group_name = $request->input('group_name');
                    $result->group_shifts = $request->input('group_shifts');
                    $result->shift_enforcement = $request->input('shift_enforcement');
                    $result->save();
                    $sql = "UPDATE vicidial_user_groups SET agent_status_viewable_groups='".$agent_status_viewable_groups."',group_name='".$request->input('group_name')."',forced_timeclock_login='".$request->input('forced_timeclock_login')."',allowed_campaigns='".$allowed_campaigns."',agent_status_view_time='".$request->input('agent_status_view_time')."',agent_call_log_view='".$request->input('agent_call_log_view')."',reset_list='".$request->input('reset_list'). "WHERE user_id='$user_group'";
                        $users = $request->user();
                        $admin_log = New VicidialAdminLog();
                        $admin_log->event_date = date("Y-m-d H:i:s");
                        $admin_log->user =  $users->username;
                        $admin_log->ip_address = $request->ip();
                        $admin_log->event_section = 'USERGROUPS';
                        $admin_log->event_type = 'EDIT';
                        $admin_log->record_id = $sql;
                        $admin_log->event_code = 'ADMIN';
                        $admin_log->event_sql = '';
                        $admin_log->event_notes = '';
                        $admin_log->save();
                    return response()->json([
                        'status'=>200,    
                        'message' => 'Record successfully modified.',
                    ]);
                } else {
                return response()->json([
                    'status'=>500,    
                    'message' => 'User group not found.',
                ]);
                }
            } else {
                return response()->json([
                    'status'=>500,    
                    'message' => 'user group required.',
                ]);
            }
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }
    
    

    /*
     * Clone user group .
     * @Author Harshal Pawar.
     */
    public function cloneAgentGroup(Request $request){
        try{
            $request->validate([
                'user_group' => 'required|max:20|min:2|unique:dyna.vicidial_user_groups',
            ]);
            $from_user_group = $request->input('from_user_group');
            $clone_from = VicidialUserGroup::getUserGroup($from_user_group);
            if(isset($clone_from)){
                $clone_from = $clone_from->toArray();
                $user['user_group'] = $request->input('user_group');
                $data = array_merge($user,$clone_from); //merge both array.
                $result = VicidialUserGroup::insert($data);   
                    $sql = "INSERT INTO vicidial_user_grops SET  WHERE user_id='".$request->input('user_group')."' agent_status_viewable_groups='".$clone_from['agent_status_viewable_groups']."',group_name='".$clone_from['group_name']."',forced_timeclock_login='".$clone_from['forced_timeclock_login']."',allowed_campaigns='".$clone_from['allowed_campaigns']."',agent_status_view_time='".$clone_from['agent_status_view_time']."',agent_call_log_view='".$clone_from['agent_call_log_view'];
                    $users = $request->user();
                    $admin_log = New VicidialAdminLog();
                    $admin_log->event_date = date("Y-m-d H:i:s");
                    $admin_log->user =  $users->username;
                    $admin_log->ip_address = $request->ip();
                    $admin_log->event_section = 'USERGROUPS';
                    $admin_log->event_type = 'ADD';
                    $admin_log->record_id = $sql;
                    $admin_log->event_code = 'ADMIN';
                    $admin_log->event_sql = $sql;
                    $admin_log->event_notes = '';
                    $admin_log->save();
                    return response()->json([
                        'status'=>200,    
                        'message' => 'user group created successfully.',
                    ]);
            } else  {
                return response()->json([
                    'status'=>500,    
                    'message' => 'user group donenot exits.',
                ]);
            }
    } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }
 
    /*
     * Edit user group .
     * @Author Harshal Pawar.
     */
    public function editGroup(Request $request){
        try{
            $user_group = $request->input('user_group');
            if(isset($user_group)){
                $group = VicidialUserGroup::find($user_group);
                $campaign = \App\VicidialCampaign::agentCampaignList();
                
                return response()->json([
                    'status'=>200,    
                    'message' => 'User group information.',
                    'data'=>["group_info"=>$group,"campaign"=>$campaign]
                ]);
            } else {
                return response()->json([
                    'status'=>400,    
                    'message' => 'user group required.',
                ]);
            }
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.agent'), $e);
            throw $e;
        }
    }
    
}
