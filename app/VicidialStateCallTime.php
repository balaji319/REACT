<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialStateCallTime extends Model {

    protected $connection = 'dyna';
    protected $table = 'vicidial_state_call_times';
    public $incrementing = false;
    public $primaryKey = 'state_call_time_id';
    public $timestamps = false;
    protected $fillable = array('state_call_time_id','state_call_time_state','state_call_time_name','state_call_time_comments','user_group');


    public static function getSelect($state_rules)
    {
    	$result=VicidialStateCallTime::select('state_call_time_id,state_call_time_state,state_call_time_name,state_call_time_comments,sct_default_start,sct_default_stop,sct_sunday_start,sct_sunday_stop,sct_monday_start,sct_monday_stop,sct_tuesday_start,sct_tuesday_stop,sct_wednesday_start,sct_wednesday_stop,sct_thursday_start,sct_thursday_stop,sct_friday_start,sct_friday_stop,sct_saturday_start,sct_saturday_stop')->where('state_call_time_id',$state_rules)->first();
    	return $result;
    }
}
