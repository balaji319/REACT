<?php
namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialAdminLog extends Model {


    protected $connection = 'dyna';
    protected $table = 'vicidial_admin_log';
    protected $primaryKey = 'admin_log_id';
    public $timestamps = false;
    protected $fillable = ['*'];

    public static function createLog($data) {
        return VicidialAdminLog::create($data);
    }

    public static function selectCondition($condition, $orderBy) {
        return VicidialAdminLog::select(
                                'agent_log_id', 'user', 'server_ip', 'event_time', 'lead_id', 'campaign_id', 'pause_epoch', 'pause_sec', 'wait_epoch', 'wait_sec', 'talk_epoch', 'talk_sec', 'dispo_epoch', 'dispo_sec', 'status', 'user_group', 'comments', 'sub_status', 'dead_epoch', 'dead_sec'
                        )->where('user', $condition)
                        ->orderBy($orderBy, 'DESC')->first();
    }

    public static function addAdminLog($x5_contact_id, $ip, $event_section, $event_type, $record_id, $event_code, $event_sql, $user_group)
    {
        try {
            
             $admin_log = new VicidialAdminLog();
            $admin_log['event_date'] =\Carbon\Carbon::now()->toDateTimeString();
            $admin_log['user'] =$x5_contact_id;                  
            $admin_log['ip_address']=$ip;                  
            $admin_log['event_section']=$event_section;                  
            $admin_log['event_type'] =$event_type;                  
            $admin_log['record_id'] =$record_id;                  
            $admin_log['event_code'] =$event_code;                  
            $admin_log['event_sql'] =$event_sql;                  
            $admin_log['event_notes'] = "";   
            $admin_log['user_group'] =$user_group; 
            $admin_log->fill($admin_log)->save();                 
            return "success";
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function query1($x) {
        return parent::query($x);
    }
  

}

