<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Exception;

use App\X5Contact;
use App\X5ContactLoginLog;
use App\Cluster;

use App\Traits\AuthCheck;
use App\Traits\Helper;
use App\Traits\ErrorLog;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use AuthCheck,Helper,ErrorLog;



    /**
     * Create user
     *
     * @param  [string] name
     * @param  [string] email
     * @param  [string] password
     * @param  [string] password_confirmation
     * @return [string] message
     */
    public function signup(Request $request)
    {   	 

       /*$validatedData =  $request->validate([
            'username' => 'required|string',
            'password' => 'required|string|confirmed'
        ]);*/



  
        $user = new X5Contact([
            'username' => $request->username,
            'company_id' => '123',
            'password' => bcrypt($request->password),
            'create_datetime' => '2018-10-10',
            'udid' => '111',
            'sms_otp' => '111'
        ]);

        $user->save();
        return response()->json([
            'message' => 'Successfully created user!'
        ], 201);
    }
  
    /**
     * Login user and create token
     *
     * @param  [string] email
     * @param  [string] password
     * @param  [boolean] remember_me
     * @return [string] access_token
     * @return [string] token_type
     * @return [string] expires_at
     */
    public function login(Request $request)
    {

        try {
                $request->validate([
                'username' => 'required|string',
                'password' => 'required|string',
                'remember_me' => 'boolean'
            ]);

            $credentials = request(['username', 'password']);

            $sub_domain = $this->getSubdomains(request()->root());
            $domain = $this->getDomain(request()->root());
            $ip = $this->clientIp();
            $user_agent = $request->server('HTTP_USER_AGENT');
            $contact_logging = new X5ContactLoginLog;

            /*authentication Faillure*/
            if(!Auth::attempt($credentials)){                       
                $contact_logging->addLoggingLogs($request['username'],NULL,FALSE,$sub_domain,$domain,$ip,$user_agent,NULL);

                throw new Exception('Username or Password you entered is incorrect. (Error Code: ER-X5A-L-3)',401);
            }

            /*Auth Success*/
            $user = $request->user();


            /*add logging*/            
           $contact_logging->addLoggingLogs($request['username'],$user->x5_contact_id,TRUE,$sub_domain,$domain,$ip,$user_agent,NULL);

            /*Check company details*/
            if(config('configs.billing_check')){
                /*get company details*/
                $check = AuthCheck::checkBlocklist($user->company_id);

                /*if company is inactive*/
                if (!$check['active']) {
                    throw new Exception('Your company has been disabled, please contact your system administrators, or Ytel Support for more information.',401);
                }

                if ($check['alart']) {
                    $return['warning'] = 1;
                    $return['warning_message'] = 'YOUR ACCOUNT IS AT RISK OF SERVICE INTERRUPTION. TO AVOID POSSIBLE SERVICE INTERRUPTIONS, LOGIN TO MAKE A PAYMENT.';
                }

            }

            /*check leadbeam user*/   
            if($user->leadbeam_user){
                throw new Exception('Leadbeam Users Cannot Use The Admin Interface.(Error Code: ER-X5A-L-2)',401);
            }


            /*DB company setting*/
            $get_dbs_details = $this->processCompanyDbSetting($user->x5_contact_id,$user->company_id);

            if($get_dbs_details->isEmpty()){
                throw new Exception('Your account do not have any system associated. Please contact Ytel support. (Error Code: ER-X5A-L-1)',401);
            }

            /*added DB details into collection of user*/
            $user->db_details = $get_dbs_details;
                                                        
            /*Token Creations*/
            $tokenResult = $user->createToken('Personal Access Token');
            $token = $tokenResult->token;
            if ($request->remember_me)
                $token->expires_at = Carbon::now()->addWeeks(1);
            $token->save();

            return response()->json([
                'status' => 200,
                'access_token' => $tokenResult->accessToken,
                'token_type' => 'Bearer',
                'expires_at' => Carbon::parse(
                    $tokenResult->token->expires_at
                )->toDateTimeString(),
                'user_data' => $user
            ],200);         

        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.auth'), $e);
            throw $e;
        }
        
    }
  
    /**
     * Logout user (Revoke the token)
     *
     * @return [string] message
     */
    public function logout(Request $request)
    {
        $request->user()->token()->revoke();
         return response()->json([
            'status' => 200,
            'msg' => 'Successfully logged out'
        ],200);
    }


    /**
     * change DB
     * @param [integer] db_id
     * @param [integer] company_id
     * @return [json] message
     */
    public function switchDb(Request $request)
    {
        try {
            // validation
            $rules = [
                'db_id' => 'required|integer',
                'company_id' => 'required|integer',
            ];

        $this->validate($request, $rules);

        $cluster_obj = new Cluster;
        $cluster_count = $cluster_obj->getDbDetailsCompIdCount($request->company_id,$request->db_id);

        if($cluster_count <= 0){
            throw new Exception('Bad Request.',400);
        }

         /*DB company setting*/
        $get_dbs_details = $this->processCompanyDbSetting($request->user()->x5_contact_id,$request->user()->company_id);


        // check request belongs to valid user
        if(!$get_dbs_details->contains('db_id',$request->db_id)){
            throw new Exception('Invalid DB id.',400);
        }


        #update
        $user_obj = X5Contact::find($request->user()->x5_contact_id);
        $user_obj->db_last_used = $request->db_id;
        $user_obj->save();
    

         return response()->json([
            'status' => 200,
            'msg' => 'DB set successfully',
            'db_id' => $user_obj->db_last_used,
            'contact_id' => $request->user()->x5_contact_id
        ],200);
        } catch (Exception $e) {
            throw $e;           
        }
    }
  
    /**
     * Get the authenticated User
     *
     * @return [json] user object
     */
    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
