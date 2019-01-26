<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class VicidialLog extends Model
{
    protected $connection = 'dyna';
    protected $table = 'vicidial_log';
    public $timestamps = false;
    public $primaryKey = 'uniqueid';
    protected $casts = [
        'uniqueid' => 'float',
    ];
    public static function UserLogDetail($user_id, $begin_date, $end_date) {
        return VicidialLog::where('user', $user_id)
                        ->whereBetween('call_date', [$begin_date." 00:00:01", $end_date." 23.59.59"])
                        ->select(DB::raw('count(*) as count, status, sum(length_in_sec) as length_in_sec '))
                        ->groupBy('status')
                        ->orderBy('status')
                        ->get();
    }
    
    public static function outboundCalls($userid ,$end_date , $begin_date) {
        try{
            return VicidialLog::leftJoin('vicidial_call_notes','vicidial_call_notes.vicidial_id', 'vicidial_log.uniqueid')
                        ->select('vicidial_log.call_date','length_in_sec','status','phone_number','campaign_id','user_group','list_id','vicidial_log.lead_id','term_reason','vicidial_call_notes.call_notes')
                        ->whereBetween('vicidial_log.call_date', [$begin_date." 00:00:01", $end_date." 23.59.59"])
                        ->where('user', $userid)
                        ->orderBy('vicidial_log.call_date','DESC')
                        ->limit(1000)
                        ->get();
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            return collect([]);
        }
    }
    
    public static function campaignStatusList($list_id,$queryenddate , $querybegindate) {
        try {
            return VicidialLog::leftJoin('vicidial_agent_log', function($join){
                        $join->on('vicidial_agent_log.lead_id','=' ,'vicidial_log.lead_id');
                        $join->on('vicidial_agent_log.uniqueid','=' ,'vicidial_log.uniqueid');
                    })
                ->select(DB::raw( "vicidial_log.status , vicidial_log.uniqueid , vicidial_log.length_in_sec as duration ,CAST(vicidial_agent_log.talk_sec AS SIGNED) - CAST(vicidial_agent_log.dead_sec AS SIGNED) AS handletime"))
                ->where('list_id',$list_id)
                ->where([['call_date','<=', $queryenddate ],[ 'call_date','>=', $querybegindate]] )
                ->orderBy('vicidial_log.status')
                ->get();
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            return collect([]);
        }
    }
}
