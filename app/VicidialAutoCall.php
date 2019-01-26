<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialAutoCall extends Model
{
	public $timestamps = false;
	protected $connection = 'dyna';
	
    public static function getStatus($group, $closer_campaigns) {

		return VicidialAutoCall::whereNotIn('status', ['XFER'])
								->where(function ($q) use($closer_campaigns,$group){
									$q->where(function ($q)  use($closer_campaigns){
										    $q->where('call_type', 'IN')
										        ->whereIn('campaign_id', $closer_campaigns);
										})
									->orWhere(function($q) use($group){
										    $q->where('campaign_id', $group)
										        ->where('call_type', 'OUT');	
										});
								})	
								->pluck('status');
    }

    public static function getStatusIfNot($group) {
    	return VicidialAutoCall::whereNotIn('status', ['XFER',$group])
    							->pluck('status');
    }
}
