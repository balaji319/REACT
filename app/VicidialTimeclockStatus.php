<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialTimeclockStatus extends Model
{
    protected $connection = 'dyna';
    protected $table = 'vicidial_timeclock_status';
    public $timestamps = false;
    public $primaryKey = 'user';
    public $incrementing = false;


    public static function timeClockStatus($user_group, $eod) {
    	return VicidialTimeclockStatus::where('user', $user_group)
                                        ->where('event_epoch', '>=', $eod)
                                        ->get(['event_epoch','event_date','status','ip_address']);
    }
}
