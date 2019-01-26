<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class VicidialTimeclockLog extends Model
{
    public $timestamps = false;
    protected $connection = 'dyna';
    protected $table = 'vicidial_timeclock_log';
    protected $primaryKey = 'timeclock_id';

    public static function userDetails($user_group, $query_date_begin, $query_date_end, $user, $order_sql, $order_by) {
    	
    	return DB::connection('dyna')->table('vicidial_users')
	            ->join('vicidial_timeclock_log','vicidial_users.user','=','vicidial_timeclock_log.user')
	            ->whereIn('vicidial_timeclock_log.user_group',$user_group)
	            ->whereIn('vicidial_timeclock_log.event',['LOGIN', 'START'])
	            ->whereBetween('vicidial_timeclock_log.event_date',[$query_date_begin, $query_date_end])
	            ->where('vicidial_timeclock_log.user',$user)
	            ->select( DB::raw('vicidial_users.user,vicidial_users.full_name,SUM(vicidial_timeclock_log.login_sec) as login,vicidial_timeclock_log.user_group'))
	            ->groupBy('vicidial_users.user')
	            ->groupBy('vicidial_timeclock_log.user_group')
	            ->groupBy('vicidial_users.full_name')
	            ->orderBy($order_sql, $order_by)
	            ->limit(10000000)
                ->get();
    }


    public static function timeClockLog($user_group, $eod) {
    	return VicidialTimeclockLog::where('user', $user_group)
    							->where('event_epoch', '>=', $eod)
    							->get(['event','event_epoch','login_sec',]);
    }

    public static function timeClockList($user_group,$startdate,$enddate) {

        if($user_group=='')  {
            return VicidialTimeclockLog::whereIn('event',['LOGIN','START'])
                                ->whereBetween('event_date',[$startdate, $enddate])
                                ->select(DB::raw('user,SUM(login_sec) as login_sec'))
                                ->groupBy('user')
                                ->limit(10000000)
                                ->get();
        }else{
            return VicidialTimeclockLog::whereIn('user_group', $user_group)
                                ->whereIn('event',['LOGIN','START'])
                                ->whereBetween('event_date',[$startdate, $enddate])
                                ->select(DB::raw('user,SUM(login_sec) as login_sec'))
                                ->groupBy('user')
                                ->limit(10000000)
                                ->get();
        }
    }

    public static function timeClockDetails($user_group,$startdate,$enddate,$TCuser) {
        if($user_group=='')  {
            return VicidialTimeclockLog::whereBetween('event_date',[$startdate, $enddate])
                                ->where('user', $TCuser)
                                ->orderBy('event_date')
                                ->limit(10000000)
                                ->get(['event_epoch','event_date','login_sec','event','user_group']);
        }else{
            return VicidialTimeclockLog::whereIn('user_group',$user_group)
                                ->whereBetween('event_date',[$startdate, $enddate])
                                ->where('user', $TCuser)
                                ->orderBy('event_date')
                                ->limit(10000000)
                                ->get(['event_epoch','event_date','login_sec','event','user_group']);
        }
    }

    public static function agentTimeClockLog($user_id, $start_epoch, $end_epoch) {
        return VicidialTimeclockLog::where('user', $user_id)
                                ->whereBetween('event_epoch', [$start_epoch, $end_epoch])
                                ->get(['event','event_epoch', 'user_group', 'login_sec', 'ip_address', 'timeclock_id', 'manager_user']);
    }
    
    public static function userTimeClockLogDetailsForAgentStats($user_id, $begin_date, $end_date) {
        return VicidialTimeclockLog::select('event','event_epoch','user_group','login_sec','ip_address','timeclock_id','manager_user')
                ->where('user', $user_id)
                ->whereBetween('event_epoch', [$begin_date, $end_date])
                ->get();
    }
}
