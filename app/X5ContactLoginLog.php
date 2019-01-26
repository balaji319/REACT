<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Exception;
use App\Traits\ErrorLog;

class X5ContactLoginLog extends Model
{
	use ErrorLog;


    protected $table = 'x5_contact_login_logs';
    public $timestamps = false;
   protected $fillable = ['id', 'ip', 'browser', 'entry_datetime', 'success', 'ytel_user_id'];
    /**
	 * Add logs
	 * @param  [string] username
     * @param  [string] contact_id
     * @param  [boolean] boolean
     * @param [string] sub-domain
     * @param [string] domain
     * @param [string] IP
     * @param [string] Browser
     * @param [string] ytel_user_id
     * @return [boolean] boolean
	 */

    public function addLoggingLogs($username,$contact_id,$success,$sub_domain,$domain,$ip,$browser,$ytel_user_id=null){

    	try {
    		$contact_logging = new X5ContactLoginLog;
	    	$contact_logging->login = $username;
	    	$contact_logging->x5_contact_id = $contact_id;
	    	$contact_logging->ytel_user_id = $ytel_user_id;
	    	$contact_logging->success = $success;
	    	$contact_logging->sub_domain = $sub_domain;
	    	$contact_logging->domain = $domain;
	    	$contact_logging->ip = $ip;
	    	$contact_logging->browser = $browser;
	    	$contact_logging->entry_datetime = date('Y-m-d H:i:s');
	    	return $contact_logging->save();
    		
    	} catch (Exception $e) {
    		$this->postLogs(config('errorcontants.mysql'), $e);
    		return 0;
    		
    	}
    	
    }
}
