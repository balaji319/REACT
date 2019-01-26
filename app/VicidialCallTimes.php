<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\Traits\ErrorLog;
use Exception;


class VicidialCallTimes extends Model {
     use ErrorLog;
    public $timestamps = false;
    protected $connection = 'dyna';
     #table name
    protected $table = "vicidial_call_times";
     public $primaryKey = 'call_time_id';
     


    public static function getAll($fields) {
        try {
            $limit =\Config::get("configs.pagination_limit");
          return VicidialCallTimes::select($fields)->orderBy('call_time_id')->paginate($limit);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;   
        } 
    }
    
    public static function getCallTimeById($id,$fields) {
        try {
            return VicidialCallTimes::
                where('lead_filter_id',$id)
                ->get($fields);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;   
        }
        
    }


    /**
     * Find script by id
     * @author Pastapure<om@ytel.com>
     * @param type $script_id
     * @return type
     */

    public static function findCallTime($callTimeId,$type='') {
        try {
            return VicidialCallTimes::where('call_time_id', $callTimeId)->get();
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;   
        }  
    }


    /**
     * create CallTime
     * @author Pastapure<om@ytel.com>
     * @param  $data
     * @return type
     */

    public static function makeCallTime($data) {
        try {
            return  DB::table('vicidial_call_times')->insert(
                            [
                                'call_time_id' => $data['call_time_id'] ,
                                'call_time_name' => $data['call_time_name'],
                                'call_time_comments' => $data['call_time_comments'],
                                'ct_default_start' => $data['ct_default_start'],
                                'ct_default_stop' => $data['ct_default_stop'],
                                'user_group' => $data['usergroup']
                            ]
                        );
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;   
        }
  
    }

}
