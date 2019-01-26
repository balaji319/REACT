<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use App\Traits\ErrorLog;
use App\Traits\AccessControl;
use Exception;
use \Helper\Constants;
use App\Traits\Helper;

use App\X5ContactX5ContactGroup;
use App\X5Contact;
use App\X5ContactGroup;
use App\SystemComponent;


class AccessControlController extends Controller
{
    use ErrorLog,AccessControl,Helper;

	/**
     * Instantiate a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('is_superadmin');        
    }


    
    /**
     * Get Permission List via Access Type
     * @param int $access_type
     * @param object Request
     * @return json
     */
    public function getPermissionByAccessType($access_type, Request $request)
    {
        try {
            $current_company_id = $request->current_company_id;
            $user = $request->user();
            $access = $this->generateAccessList($access_type,[],$user->x5_contact_id, $access_overwrite = false, $access_model = false,$user->company_id);
            $list = $this->generateListByAccess($access_type, ACCESS_READ, $access,$current_company_id);
            return response()->json([
                'status' => 200,
                'list' => $list,                
            ],200);           
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.access_control'), $e);
            throw $e;
        }
    }

    /**
     * Get Ytel List
     * @param object Request
     * @return json
     */
    public function getYccList(Request $request,X5Contact $x5contact_obj)
    {
        try {
            $current_company_id = $request->current_company_id;
            $user = $request->user();

            $allowed_cntct_grp = $this->getPermissionByAccessTypeHelper(ACCESS_TYPE_X5_CONTACT_GROUP, ACCESS_READ, $current_company_id, $user);

            $limit = $request->limit ?: \Config::get("configs.pagination_limit");
            $search = $request->search ?: '';
            $data = $x5contact_obj->getYccGrpList($allowed_cntct_grp,$current_company_id,$limit,$search);
        
            return response()->json([
                'status' => 200,
                'list' => $data, 
                'allowedContactGrp'=>$allowed_cntct_grp
            ],200);           
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.access_control'), $e);
            throw $e;
        }
    }

    /**
     * Delete Ytel List
     * @param object Request
     * @param  int x5_contact_id
     * @return json
     */
    public function yccDel(Request $request,X5Contact $x5contact_obj)
    {
        try {

            $rules = [
                'x5_contact_id' => "required|validate_superuser_del:{$request->current_company_id}"
                ];

            $err_message = [
                'x5_contact_id.validate_superuser_del' => "You are not allowed to delete this Ytel User."
                ];

            $this->validate($request,$rules,$err_message);

            $current_company_id = $request->current_company_id;
            $flag = $x5contact_obj->delYccGrp($request->x5_contact_id,$request->current_company_id);
        
            return response()->json([
                'status' => 200,
                'msg' => 'Deleted Successfuuly : Contact Id - '.$request->x5_contact_id, 
            ],200);    


        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.access_control'), $e);
            throw $e;
        }
    }

    /**
     *  Ytel Grp Persmission list
     * @param object Request
     * @param  int x5_contact_group_id
     * @return json
     */
    public function getYtelEditGrpPermission(Request $request)
    {
        try {


             $rules = [
                'x5_contact_group_id' => "required|validate_access_cntct_grp:{$request->current_company_id}"
                ];

            $err_message = [
                'x5_contact_group_id.validate_access_cntct_grp' => "Does not allow to access this contact group."
                ];

            $this->validate($request,$rules,$err_message);

            $user = $request->user();
            
          
          // X5 permissions : get access list
            $permission = $this->generateAccessList([], [], $request->x5_contact_group_id, false, ACCESS_MODEL_CONTACTGROUP, $user->company_id);

                
            return response()->json([
                'status' => 200,
                'permissions' => $permission,
            ],200);


        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.access_control'), $e);
            throw $e;
        }
    }

    /**
     * Edit Ytel Edit Grp Persmission
     * @param object Request
     * @param  int x5_contact_id
     * @return json
     */
    public function updateYtelEditGrpPermission(Request $request)
    {
        try {


             $rules = [
                'x5_contact_group_id' => "required|validate_access_cntct_grp:{$request->current_company_id}",
                'permissions' => 'required|json'
                ];

            $err_message = [
                'x5_contact_group_id.validate_access_cntct_grp' => "Does not allow to access this contact group."
                ];

            $this->validate($request,$rules,$err_message);

            $user = $request->user();
            
          
          //save access grp
           $this->saveContactGroupAccessList($request->x5_contact_group_id, $request->permissions);

                
            return response()->json([
                'status' => 200,
                'msg' => 'Permissions updated Successfully!',
            ],200);


        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.access_control'), $e);
            throw $e;
        }
    }

     /**
     * Get Ytel Group List
     * @param object Request
     * @return json
     */
    public function getYccGrpList(Request $request,X5ContactGroup $x5contact_grp_obj)
    {
        try {
            $current_company_id = $request->current_company_id;

            $limit = $request->limit ?: \Config::get("configs.pagination_limit");
            $search = $request->search ?: '';
            $data = $x5contact_grp_obj->getYccGrpList($current_company_id,$limit,$search);
        
            return response()->json([
                'status' => 200,
                'list' => $data
            ],200);           
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.access_control'), $e);
            throw $e;
        }
    }

     /**
     * Edit Ytel Group
     * @param object Request
     * @return json
     */
    public function updateYtelEditGrp(Request $request,X5ContactGroup $x5contact_grp_obj)
    {
        try {
            $user = $request->user();

            $data = json_decode($request->data,true);

            $x5_contact_group_id = $data['x5_contact_group_id'] ?? '';

            $request->merge(['x5_contact_group_id'=>$x5_contact_group_id]);           

            $rules = [
                'data' => 'required | json',
                'x5_contact_group_id' => "required| validate_access_cntct_grp:{$request->current_company_id} | validate_access_cntct_grp_edit:{$request->current_company_id}"                
                ];

            $err_message = [
                'x5_contact_group_id.validate_access_cntct_grp_edit' => "Does not allow to access this contact group - Super Admin.",
                'x5_contact_group_id.validate_access_cntct_grp' => "Does not allow to access this contact group."
                ];

            $this->validate($request,$rules,$err_message);

            //update
            $list = $x5contact_grp_obj->find($x5_contact_group_id);

            $list->x5_contact_group_id = $x5_contact_group_id;
            $list->group_name = $data['group_name'];
            $list->group_description = $data['group_description'];
            $list->update_datetime = gmdate('Y-m-d H:i:s');
            $list->super = 0;
            $list->type = 2;
            $list->save();
         
        
            return response()->json([
                'status' => 200,
                'msg' => "$x5_contact_group_id group Id updated Successfully!"
            ],200);           
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.access_control'), $e);
            throw $e;
        }
    }

    /**
     * Delete Ytel group List
     * @param object Request
     * @param  int x5_contact_id
     * @return json
     */
    public function yccGrpDel(Request $request,X5ContactGroup $x5contact_grp_obj, X5ContactX5ContactGroup $cntct_x5_cntct_grp_obj)
    {
        try {
            $rules = [
                'x5_contact_group_id' => "required| validate_access_cntct_grp:{$request->current_company_id} | validate_access_cntct_grp_edit:{$request->current_company_id}"                
                ];

            $err_message = [
                'x5_contact_group_id.validate_access_cntct_grp_edit' => "Does not allow to access this contact group - Super Admin.",
                'x5_contact_group_id.validate_access_cntct_grp' => "Does not allow to access this contact group."
                ];

            $this->validate($request,$rules,$err_message);

             //update
            $list = $x5contact_grp_obj->find($request->x5_contact_group_id);
            $list->delete_datetime = gmdate('Y-m-d H:i:s');
            $list->save();

            //delete from X5ContactX5ContactGroup
            $cntct_x5_cntct_grp_obj->where('x5_contact_group_id',$request->x5_contact_group_id)->delete();
           

        
            return response()->json([
                'status' => 200,
                'msg' => 'Deleted Successfuuly : Contact Group Id - '.$request->x5_contact_group_id, 
            ],200);    


        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.access_control'), $e);
            throw $e;
        }
    }

    /**
     * Store Ytel group
     * @param object Request
     * @param  int x5_contact_id
     * @return json
     */
    public function storeYtelGrp(Request $request)
    {
        try {
            $rules = [
                'group_description' => "required",
                "group_name" => "required"
                ];

            $this->validate($request,$rules);

            $cntct_grp_obj = new X5ContactGroup;

            $cntct_grp_obj->group_name = $request->group_name;
            $cntct_grp_obj->group_description = $request->group_description;
            $cntct_grp_obj->update_datetime = gmdate('Y-m-d H:i:s');
            $cntct_grp_obj->company_id = $request->current_company_id;
            $cntct_grp_obj->super = 0;
            $cntct_grp_obj->type = 2;
            $cntct_grp_obj->save();


        
            return response()->json([
                'status' => 200,
                'msg' => 'Added Successfully : Contact Group Id - '.$cntct_grp_obj->x5_contact_group_id, 
            ],200);    


        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.access_control'), $e);
            throw $e;
        }
    }

    /**
     * Store Ytel
     * @param object Request
     * @param  json data
     * @return json
     */
    public function storeYtel(Request $request)
    {
        try{

        $user = $request->user();

        $data = json_decode($request->data,true);

        $x5_contact_id = $data['x5_contact_id'] ?? '';

        $request->merge(['x5_contact_id'=>$x5_contact_id]);    

       $rules = [
            'data' => 'required | json',
            'x5_contact_id' => "required| validate_superuser_del:{$request->current_company_id}"                
            ];

        $err_message = [
            'x5_contact_id.validate_superuser_del' => "Does not allow to access this contact group."
            ];

        $this->validate($request,$rules,$err_message);

        

        //update x5 contact
           $x5_cntct = X5Contact::find($x5_contact_id);

           if (isset($data['password'])) {
                $x5_cntct->password = $data['password'];
            }

           
           $x5_cntct->username = $data['username'];
           $x5_cntct->name = $data['name'];
           $x5_cntct->company_id = $request->current_company_id;
           $x5_cntct->create_datetime = gmdate('Y-m-d H:i:s');
           $x5_cntct->enable = $data['enable'];

           $x5_cntct->save();

           X5ContactX5ContactGroup::where('x5_contact_id',$x5_contact_id)->delete();
           
           $group_list = [];
            foreach ($data['group'] as $group_id => $allow) {
                if (!$allow) {
                    continue;
                }
                $group_list[] = [
                    'x5_contact_id' => $x5_contact_id,
                    'x5_contact_group_id' => $group_id
                ];
            }


            X5ContactX5ContactGroup::insert($group_list);

        
            return response()->json([
                'status' => 200,
                'msg' => "{$data['name']} updated Successfully",
            ],200);    


        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.access_control'), $e);
            throw $e;
        }
    }

    /**
     * Get Permission List
     * @param object Request
     * @return json
     */
    public function getYccPermissionList(Request $request,SystemComponent $sys_compo_obj)
    {
        try {
            $current_company_id = $request->current_company_id;
            $user = $request->user();

            $permissionSettings = $this->getPermissionList();
            
            foreach ($permissionSettings['list'] as $i => $eachPermissionGroup) {

               // echo $permissionSettings['model'][$eachPermissionGroup['type']]['model']."<br>";
                /*App\VicidialCampaign
                App\VicidialUserGroup
                App\VicidialInboundGroup
                App\VicidialUserGroup*/
               

                   $EachModel = new $permissionSettings['model'][$eachPermissionGroup['type']]['model'];  

                   //select query
                    $query = $EachModel->select(isset($EachModel->primaryKeyLabel) ? $EachModel->primaryKeyLabel : $EachModel->primaryKey.' AS label',$EachModel->primaryKey.' AS key')              ;


                    if(isset($permissionSettings['model'][$eachPermissionGroup['type']]['hide'])) {
                        $query = $query->whereNotIn($EachModel->getKeyName() , $permissionSettings['model'][$eachPermissionGroup['type']]['hide']);
                    } 

                    $permissionSettings['list'][$i]['items'] = $query->get()->toArray();

                    if(isset($permissionSettings['model'][$eachPermissionGroup['type']]['show'])) {
                        $additionalItems = [];
                        foreach($permissionSettings['model'][$eachPermissionGroup['type']]['show'] as $item) {
                            $additionalItems[] = [
                                'lable' => $item,
                                'key' => $item
                            ];
                        }

                        $permissionSettings['list'][$i]['items'] = array_merge($permissionSettings['list'][$i]['items'], $additionalItems);
                    }

                }

                $return['permissionList'] = $permissionSettings['list'];

                $sys_compo = $sys_compo_obj->getPermissionList();

                $result = $sys_compo->groupBy([
                    'name',
                    function ($item) {
                        return $item['system_component_id'];
                    },
                ]);

                $return['systemComponents'] = $result->toArray();

                foreach ($return['systemComponents'] as $k => $v) {
                    foreach ($v as $key => $val) {
                        $val = end($val);
                        $return['systemComponents'][$k][$key] = [];
                        $return['systemComponents'][$k][$key]['SystemComponent'] = $val;

                         $return['systemComponents'][$k][$key]['SystemComponentGroup'] = ['system_component_group_id'=>$val['system_component_group_id'],'name'=>$val['name'],'order'=>$val['order']];
                    }
                }             
           
        
            return response()->json([
                'status' => 200,
                'data' => $return,                
            ],200);      

        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.access_control'), $e);
            throw $e;
        }
    }
}
