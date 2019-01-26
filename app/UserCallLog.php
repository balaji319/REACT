<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserCallLog extends Model {

    protected $connection = 'dyna';
    protected $table = 'user_call_log';
    public $incrementing = false;
    public $timestamps = false;

    
    public static function manualCalls($userid ,$end_date , $begin_date)  {
        try{
            return UserCallLog::select('call_date','call_type','server_ip','phone_number','number_dialed','lead_id','callerid','group_alias_id',
                    'preset_name','customer_hungup','customer_hungup_seconds')
                        ->whereBetween('call_date', [$begin_date." 00:00:01", $end_date." 23.59.59"])
                        ->where('user', $userid)
                        ->orderBy('call_date','DESC')
                        ->limit(1000)
                        ->get();
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            return collect([]);
        }
    }
}
