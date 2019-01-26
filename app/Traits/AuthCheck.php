<?php 
namespace App\Traits;

use File;
use Cache;

use App\Db;
use App\Cluster;
use App\CompanyDb;
use App\X5ContactLink;

/**
* Auth related Helper methods
*/

trait AuthCheck
{
	/**
     * Check BlockList
     *
     * @param  [string] company_id
     * @return [string] access_token
     * @return [string] token_type
     * @return [string] expires_at
     */
    public static function checkBlocklist($company_id='104860'){
    	 
    	$return = Cache::get('blocklist_check_' . $company_id) ?? [];

    	if(!$return) {    	

	    	//url formation get current balance info
	    	$filepath = sprintf(config('configs.get_balance_url').'?token='.config('configs.get_balance_token').'&company_id=%s',$company_id);

	    	$file_content = @file_get_contents($filepath);

	    	$check = json_decode($file_content);

	    	
	    	/*return false incorrect response*/
	    	if(!$check ){
	    		$return['next_billing_date'] = 'N/A';
	           	$return['available_funds'] = '-';
	           	$return['active'] = true;

	           	return $return;
	    	}

	    	$return['active'] = $check->active;
	        $return['available_funds'] = $check->available_funds;

	        /*if blocked*/
	        if($check->block){
	        	$return['entry_datetime'] = $check->block->entry_datetime;
	        	$return['turn_off_in_min'] = floor((strtotime($check->block->entry_datetime) + $check->block->scheduled_turn_off_minute * 60 - time()) / 60);
	        	$return['turned_off'] = $check->block->turned_off;
                $return['pending_restore'] = $check->block->pending_restore;                
	        }

	        $return['next_billing_date'] = $check->next_billing_date;
            $return['days_till_billing'] = $check->days_till_billing;
            $return['alart'] = $check->alart;

            $expiresAt = now()->addMinutes(10);
            //need ot convert to redis
            Cache::put('blocklist_check_' . $company_id, $return, $expiresAt);
	    }
	    
	    return $return;
    }

    /**
     *  process Company DB Settings
     * @param [int] x5_contact_id
     * @param [int] company_id
     *
     * @return [object] DB details of Users
    */
    public function processCompanyDbSetting($x5_contact_id, $company_id){

    	/*Get DB's*/
    	if (false && config('configs.development_servernames') && in_array($_SERVER['SERVER_NAME'], config('configs.development_servernames'))) {
    		$cluster = new Cluster;
    		return $cluster->getDbDetails();

    	} else{
    		/*Prod domains lists*/
    		$x5_contact_link = new X5ContactLink;
    		/*get extra links*/
    		$company_ids = [];
    		$company_ids = $x5_contact_link->getCntctLinks($x5_contact_id,'company_id');
    		$company_ids[] = $company_id;

    		$cluster = new Cluster;
    		return $cluster->getDbDetailsCompIdLogin($company_ids);
    	}

    }

}

