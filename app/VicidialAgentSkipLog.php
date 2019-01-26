<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialAgentSkipLog extends Model
{
    protected $connection = 'dyna';
    protected $table = 'vicidial_agent_skip_log';
    public $incrementing = false;
    public $timestamps = false;
    
    public static function leadSkip($userid ,$end_date , $begin_date) {
        try{
            return VicidialAgentSkipLog::select('user','event_date','lead_id','campaign_id','previous_status','previous_called_count')
                        ->whereBetween('event_date', [$begin_date." 00:00:01", $end_date." 23.59.59"])
                        ->where('user', $userid)
                        ->orderBy('event_date','DESC')
                        ->limit(1000)
                        ->get();
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            return collect([]);
        }
    }
    
}
