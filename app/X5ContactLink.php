<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Exception;
use DB;
use collection;

use App\Traits\ErrorLog;

class X5ContactLink extends Model
{
    protected $table = 'x5_contact_links';
    public $timestamps = false;
    public $primaryKey = 'x5_contact_link_id';

    /**
     * Get LinkId = Company ID respective contact id
     * @param [int] x5_contact_id
     * @param [string] link_type = company_id
     * @return [Object] db's details
     */
    public function getCntctLinks($x5_contact_id, $link_type){
    	try {
    		
			return X5ContactLink::where('x5_contact_id',$x5_contact_id)
					->where('link_type',$link_type)
					->pluck('link_id');

	    		
    	} catch (Exception $e) {
    		$this->postLogs(config('errorcontants.mysql'), $e);
    		return collect([]);
    	}
    }
}
