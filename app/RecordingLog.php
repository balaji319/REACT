<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class RecordingLog extends Model
{
     protected $connection = 'dyna';
    protected $table = 'recording_log';
    protected $primaryKey = 'recording_id';

    public $timestamps = false;

    public static function getData($uniqueid)
    {
         try{
    	$recordings=RecordingLog::select(['recording_id','start_time','length_in_sec','filename','location','lead_id','user'])->whereIn('vicidial_id',$uniqueid)->get();
    	return $recordings;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            return collect([]);
        }
    }
    
    public static function recordingLogs($userid ,$end_date , $begin_date) {
        try{
            return RecordingLog::select('recording_id','channel','server_ip','extension','start_time','start_epoch','end_time','end_epoch','length_in_sec','length_in_min',
                    'filename','location','lead_id','user','vicidial_id')
                        ->whereBetween('start_time', [$begin_date." 00:00:01", $end_date." 23.59.59"])
                        ->where('user', $userid)
                        ->orderBy('recording_id','DESC')
                        ->limit(1000)
                        ->get();
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            return collect([]);
        }
    }
}
