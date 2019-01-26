<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class SystemSetting extends Model {


    protected $connection = 'dyna';
    public $incrementing = false;
    protected $table = 'system_settings';
    
 	public $timestamps = false;
 	public $primaryKey = 'version';

    public static function getAll($fields) {
       
        return $data = SystemSetting::select($fields)->get();
        


    }

    public static function showColumns($fields){
      
        return DB::select("SHOW COLUMNS FROM ". $table ." LIKE '".$fields."'" );
    }
    public static function getTableColumns() {
        return \Schema::connection('dyna')->getColumnListing('system_settings');
    }
    
    
    public static function getfieldInfo(){
        return SystemSetting::select('enable_queuemetrics_logging','queuemetrics_server_ip','queuemetrics_dbname','queuemetrics_login',
                'queuemetrics_pass','queuemetrics_log_id','queuemetrics_loginout','queuemetrics_addmember_enabled','queuemetrics_pe_phone_append' )
                            ->first();

    }
    public static function getData()
    {
         return SystemSetting::select('use_non_latin,sounds_central_control_active,sounds_web_server,sounds_web_directory,outbound_autodial_active')->first();
    }
}
