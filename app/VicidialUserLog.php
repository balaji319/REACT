<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class VicidialUserLog extends Model
{

        protected $table = 'vicidial_user_log';
        protected $connection = 'dyna';
        public $timestamps = false;

	public static function userLogDetails($group, $carbon) {
        return DB::connection('dyna')->table('vicidial_user_log')
                ->join('vicidial_users','vicidial_users.user','=','vicidial_user_log.user')
                ->whereIn('vicidial_user_log.user_group', $group)
                ->where('event', 'LOGIN')
                ->where('event_date', '>=', $carbon)
                ->select(DB::raw('vicidial_user_log.user, vicidial_user_log.campaign_id, vicidial_user_log.server_ip, vicidial_user_log.computer_ip, vicidial_user_log.user_group, vicidial_user_log.extension, vicidial_user_log.browser, vicidial_user_log.phone_login, vicidial_user_log.server_phone, vicidial_user_log.phone_ip, vicidial_users.full_name, vicidial_user_log.event_date'))
                ->get();
    }

    
    public static function totalLoginDetails($user, $start_date, $end_date) 
    {
        return DB::connection('dyna')->table('vicidial_user_log')
                ->join('vicidial_users','vicidial_users.user','=','vicidial_user_log.user')
                ->whereIn('vicidial_user_log.user', $user)
                ->whereBetween('vicidial_user_log.event_date', [$start_date, $end_date])
                ->orderBy('vicidial_user_log.event_date')
                ->select('vicidial_user_log.event', 'vicidial_user_log.event_epoch', 'vicidial_user_log.event_date', 'vicidial_user_log.campaign_id', 'vicidial_user_log.user_group', 'vicidial_user_log.session_id', 'vicidial_user_log.server_ip', 'vicidial_user_log.extension', 'vicidial_user_log.computer_ip', 'vicidial_user_log.phone_login', 'vicidial_user_log.phone_ip', 'vicidial_user_log.user','vicidial_users.user', 'vicidial_users.full_name')
                ->get();
    }
    
    public static function userLogDetailsForAgentStats($user_id, $begin_date, $end_date) {
        return VicidialUserLog::where('user', $user_id)
                        ->whereBetween('event_date', [$begin_date." 00:00:01", $end_date." 23.59.59"])
                        ->orderBy('event_date')
                        ->get(['event','event_epoch','event_date','campaign_id','user_group','session_id','server_ip','extension','computer_ip','phone_login','phone_ip']);
    }

}
