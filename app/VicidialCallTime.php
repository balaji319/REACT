<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\ErrorLog;
use Exception;
    

class VicidialCallTime extends Model {
    use ErrorLog;
    protected $connection = 'dyna';
    protected $table = 'vicidial_call_times';
    protected $primaryKey = 'call_time_id';
    public $incrementing = false;
    public $timestamps = false;
    protected $fillable = array('call_time_name','call_time_comments','ct_default_start','ct_default_stop100','ct_sunday_start', 'ct_sunday_stop','ct_monday_start','ct_monday_stop','ct_tuesday_start','ct_tuesday_stop','ct_wednesday_start','ct_wednesday_stop','ct_thursday_start','ct_thursday_stop','ct_friday_start','ct_friday_stop','ct_saturday_start','ct_saturday_stop','default_afterhours_filename_override','sunday_afterhours_filename_override','monday_afterhours_filename_override','tuesday_afterhours_filename_override','wednesday_afterhours_filename_override','thursday_afterhours_filename_override','friday_afterhours_filename_override','saturday_afterhours_filename_override','user_group','ct_state_call_times');

    /**
     * Get data of shift .
     * @param type $shift
     * @return type
     * @throws \App\Exception
     */
    public static function shiftdata($shift) {
        try {
            return VicidialCallTime::select('ct_default_start', 'ct_default_stop', 'ct_sunday_start', 'ct_sunday_stop', 'ct_monday_start', 'ct_monday_stop', 'ct_tuesday_start', 'ct_tuesday_stop', 'ct_wednesday_start', 'ct_wednesday_stop', 'ct_thursday_start', 'ct_thursday_stop', 'ct_friday_start', 'ct_friday_stop', 'ct_saturday_start', 'ct_saturday_stop')
                            ->where('call_time_id', $shift)
                            ->first();
        } catch (Exception $e) {
            throw $e;
        }
    }
    /**
     * check data present or not
     * @author shital<shital@ytel.com>
     * @param id $call_time_id
     * @return count
     */
    public static function checkExist($call_time_id)
    {
        try {
            $record=VicidialCallTime::find($call_time_id);
            return $record;
        } catch (Exception $e) {
            throw $e;   
        } 
       
    }

    /**
     * get call time list with pagination
     * @author shital<shital@ytel.com>
     * @param type $script_id
     * @return type
     */

    public static function getAll($search, $limit) {
        try {
          $list=VicidialCallTimes::select('call_time_id',
                        'call_time_name',
                        'call_time_comments',
                        'ct_default_start',
                        'ct_default_stop');

            if ($search != NULL) {
                $list = $list->where(function ($query) use ($search) {
                    $query->where("call_time_id", "like", "%{$search}%")
                            ->orWhere("call_time_name", "like", "%{$search}%")
                            ->orWhere("call_time_comments", "like", "%{$search}%");
                });
            }

          $list=$list->orderBy('call_time_id')->paginate($limit);
          return $list;
        } catch (Exception $e) {
            throw $e;   
        } 
    }
    
    public static function getCallTimeById($id,$fields) {
        try {
            return VicidialCallTime::
                where('lead_filter_id',$id)
                ->get($fields);
        } catch (Exception $e) {
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
            return VicidialCallTime::where('call_time_id', $callTimeId)->get();
        } catch (Exception $e) {
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
    public static function getData($data)
    {
        $getdata['call_time_name']=$data['call_time_name'];
        $getdata['call_time_comments']=$data['call_time_comments'];
        $getdata['ct_default_start']=$data['ct_default_start'];
        $getdata['ct_default_stop']=$data['ct_default_stop'];
        $getdata['ct_sunday_start']=$data['ct_sunday_start'];
        $getdata['ct_sunday_stop']=$data['ct_sunday_stop'];
        $getdata['ct_monday_start']=$data['ct_monday_start'];
        $getdata['ct_monday_stop']=$data['ct_monday_stop'];
        $getdata['ct_tuesday_start']=$data['ct_tuesday_start'];
        $getdata['ct_tuesday_stop']=$data['ct_tuesday_stop'];
        $getdata['ct_wednesday_start']=$data['ct_wednesday_start'];
        $getdata['ct_wednesday_stop']=$data['ct_wednesday_stop'];
        $getdata['ct_thursday_start']=$data['ct_thursday_start'];
        $getdata['ct_thursday_stop']=$data['ct_thursday_stop'];
        $getdata['ct_friday_start']=$data['ct_friday_start'];
        $getdata['ct_friday_stop']=$data['ct_friday_stop'];
        $getdata['ct_saturday_start']=$data['ct_saturday_start'];
        $getdata['ct_saturday_stop']=$data['ct_saturday_stop'];
        $getdata['default_afterhours_filename_override']=$data['default_afterhours_filename_override'];
        $getdata['sunday_afterhours_filename_override']=$data['sunday_afterhours_filename_override'];
        $getdata['monday_afterhours_filename_override']=$data['monday_afterhours_filename_override'];
        $getdata['tuesday_afterhours_filename_override']=$data['tuesday_afterhours_filename_override'];
        $getdata['wednesday_afterhours_filename_override']=$data['wednesday_afterhours_filename_override'];
        $getdata['thursday_afterhours_filename_override']=$data['thursday_afterhours_filename_override'];
        $getdata['friday_afterhours_filename_override']=$data['friday_afterhours_filename_override'];
        $getdata['saturday_afterhours_filename_override']=$data['saturday_afterhours_filename_override'];
        $getdata['user_group']=$data['user_group'];
        $getdata['call_time_id']=$data['call_time_id'];






        return $getdata;
    }

    public static function getSelect($local_call_time)
    {
        $result=VicidialCallTime::select('call_time_id','call_time_name','call_time_comments','ct_default_start','ct_default_stop','ct_sunday_start','ct_sunday_stop','ct_monday_start','ct_monday_stop','ct_tuesday_start','ct_tuesday_stop','ct_wednesday_start','ct_wednesday_stop','ct_thursday_start','ct_thursday_stop','ct_friday_start','ct_friday_stop','ct_saturday_start','ct_saturday_stop','ct_state_call_times')->where('call_time_id',$local_call_time)->first();
        return $result;
    }
}
