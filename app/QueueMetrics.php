<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class QueueMetrics extends Model
{
    
    
    public static function index(Request $request)
    {
        $user_detail = $request->user()->toArray(); 
     // USER IS AUTHENTICATED GET LAST DB USED AND SET INTO db CONFIG
        if(!empty($user_detail)){
            $rslt= SystemSetting::getfieldInfo();
            $qm_conf_ct = $rslt->count();
            if ($qm_conf_ct > 0){
                $queuemetrics_server_ip=$rslt->queuemetrics_server_ip;
                $queuemetrics_dbname =  $rslt->queuemetrics_dbname;
                $queuemetrics_login =   $rslt->queuemetrics_login;
                $queuemetrics_pass =    $rslt->queuemetrics_pass;

                \Config::set("database.connections.queuematrics", [
                    "driver" => "mysql",
                    "host" => "$queuemetrics_server_ip",
                    "database" => "$queuemetrics_dbname",
                    "username" => "$queuemetrics_login",
                    "password" => "$queuemetrics_pass",
                    "unix_socket" => env("DB_SOCKET", ""),
                    "charset" => "utf8mb4",
                    "collation" => "utf8mb4_unicode_ci",
                    "prefix" => "",
                    "strict" => false,
                    "engine" => null,
                ]);            
            print_r(Config());
            }
        }
        return $next($request);
    }
    
    /*
     * Insert into queue matrics .
     */
    
    public static function insertQueueLog(){
        
    }
    
    
    
    
    
    
}
