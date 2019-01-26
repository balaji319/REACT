<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class LiveInboundLog extends Model
{
	protected $table = 'live_inbound_log';
	protected $connection = 'dyna';
    public $incrementing = false;
    public $timestamps = false;
    protected $primaryKey = 'uniqueid';


    public static function callCountLiveInboundLog($comment_a, $comment_b, $end_date, $start_date){
        return LiveInboundLog::whereBetween('start_time', [$end_date, $start_date])
                        ->select(DB::raw('COUNT(*) AS `count`'))
                        ->where('comment_a',$comment_a)
                        ->where('comment_b', $comment_b)
                        ->get();
    }

    public static function callCountLiveInboundLogWithUniqueId($unique_id, $end_date, $start_date){
       return LiveInboundLog::whereBetween('start_time', [$end_date, $start_date])
                        ->select(DB::raw('COUNT(*) AS `count`'))
                        ->whereIn('uniqueid',$unique_id)
                        ->get();
    }

    public static function callCountSelectedInbound($comment_a, $comment_b, $end_date, $start_date){
        return LiveInboundLog::whereBetween('start_time', [$end_date, $start_date])
                        ->select(DB::raw(' COUNT(*) AS `count` '))
                        ->whereIn('comment_a',$comment_a)
                        ->where('comment_b', $comment_b)
                        ->get();
    }
}
