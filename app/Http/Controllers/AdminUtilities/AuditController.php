<?php

/*
 * Controller for admin utilities dnc number module
 * @author om<om@ytel.com>
 * 
 */

namespace App\Http\Controllers\AdminUtilities;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Traits\AccessControl;
use App\Traits\ErrorLog;
use App\Traits\Helper;
use App\Http\Controllers\Controller;
use App\ViciAdminLog;
use App\X5ContactLoginLog;
use App\X5Contact;
use App\Http\Controllers\AdminUtilities\AdminUtilitiesConstants as AdminUtilities;
use App\Http\Controllers\AdminUtilities\AdminUtilitiesErrors;
use Illuminate\Support\Facades\Input;
use Exception;
use App\X5Log;

class AuditController extends Controller {

    use ErrorLog,
        AccessControl,
        Helper;
    /**
     * Get voice mail list
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param Request $request
     * @return array
     */
    public function accessList(Request $request) {


            $page_size = $request->input('page_size')??10;
            $list = ViciAdminLog::paginate($page_size); 
            return response()->json($list);
    }
     /**
     *Get system audit list
     * @author shital chavan<shital@ytel.com>
     * @param Request $request
     * @return array
     */
     public function adminList(Request $request)
     {
        try {
            $user = $request->user();

            $admin_list=X5Contact::select('x5_contact_id','username','name')->where('company_id',$user->company_id)->orderBy('username','desc')->get();
            return response()->json(['status' => 200,'data' => $admin_list,'msg' => "Success."],200);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
     }
     public function auditEvent(Request $request)
     {
        try {
            // return "DFsdf";
            $user = $request->user();
            // return $user;

                // For new ACL
                if (!in_array(SYSTEM_COMPONENT_ADMIN_SYSTEM_AUDIT, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ,$user))) {
                    throw new ForbiddenException();
                }

              
            $result = $this->getLog($user, $request->all());

             return response()->json(['status' => 200,'data' => $result,'msg' => "Success."],200);
           

           
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
     }

     // public function auditEventcheck(Request $request)
     // {

     //     $user = $request->user();
     //    if (!in_array(SYSTEM_COMPONENT_ADMIN_SYSTEM_AUDIT, $this->getListByAccess(ACCESS_TYPE_SYSTEM_COMPONENT, ACCESS_READ,$user))) {
     //                throw new ForbiddenException();
     //    }

     //    date_default_timezone_set('UTC');
        
     //    $X5Log =new X5Log;

     //    $X5Log->recursive = -1;
     //    $query='';                        

     //    $conditions = ['x5_logs.ytel_user_id'=>NULL,
     //        'x5_logs.db_id' => $user->db_last_used,
     //        'x5_logs.success' => TRUE,
     //    ];
       
     //    $options=X5Log::select(['x5_logs.*','x5_contacts.username','db_col_settings.vici_label','db_col_settings.alian'])->leftJoin('x5_contacts',function($join){
     //        $join->on('x5_logs.x5_contact_id','=','x5_contacts.x5_contact_id');
     //    })->leftJoin('db_col_settings',function($join){
     //        $join->on('x5_logs.field','=','db_col_settings.vici_db_field');
     //    })->orderBy('x5_logs.change_datetime','desc')->groupBy('x5_logs.id')->paginate(10);


     //    return $options;
     // }
     public function systemAuditAccess(Request $request)
     {
        try {
            $user = $request->user();

            $limit = $request->get('limit') ?: \Config::get("configs.pagination_limit");
            
              $query=X5ContactLoginLog::select('X5Contact.username','x5_contact_login_logs.id','x5_contact_login_logs.ip','x5_contact_login_logs.browser','x5_contact_login_logs.entry_datetime','x5_contact_login_logs.success','x5_contact_login_logs.ytel_user_id')
                ->join('x5_contacts AS X5Contact','x5_contact_login_logs.x5_contact_id','=','X5Contact.x5_contact_id')
                ->where('x5_contact_login_logs.entry_datetime','>',date('Y-m-d H:i:s', time() - 7776000))
                ->where('X5Contact.company_id', $user->company_id)
                ->where('sub_domain','!=','["x5admin"]')
                ->whereNull('ytel_user_id');
              

                if( isset($request['admin']) ) {
                    $query=$query->where('x5_contact_login_logs.x5_contact_id',filter_var($request['admin'], FILTER_SANITIZE_STRING));
                }

                if(isset($request['date'])) {
                    $jsDateTS = strtotime($request['date']);
                    if ($jsDateTS !== false) {
                        $d = gmdate('Y-m-d', $jsDateTS);

                      $query=$query->whereBetween('x5_contact_login_logs.entry_datetime', [$d . " 00:00:00", $d . " 23:59:59"]);
                    }
                }
                $system_audit_access_list=$query->orderBy('x5_contact_login_logs.entry_datetime','desc')->paginate($limit);



               
                return response()->json(['status' => 200,'data' => $system_audit_access_list,'msg' => "Success."],200);

            } catch (Exception $e) {
                $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
            }

     }

}
