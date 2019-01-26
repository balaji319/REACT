<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialUserCloserLog extends Model
{
    protected $table = "vicidial_user_closer_log";
    protected $connection = 'dyna';
    protected $primaryKey = 'user';
    public $incrementing = false;
    public $timestamps = false;
    
    
    public static function closerInGroupLogs($userid ,$end_date , $begin_date ){
        try{
            return VicidialUserCloserLog::select('user','event_date','campaign_id','blended','closer_campaigns','manager_change')
                        ->whereBetween('event_date', [$begin_date." 00:00:01", $end_date." 23.59.59"])
                        ->where('user', $userid)
                        ->orderBy('event_date','DESC')
                        ->get();
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            return collect([]);
        }
    }
}
