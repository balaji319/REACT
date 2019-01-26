<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ViciRecordingLog extends Model {

    public $timestamps = false;

    #table name
    protected $table = "recording_log";


    /**
     * Get dnc by phone number
     * @author Balaji Pastapure<balaji@ytel.com>
     * @param type $phone
     * @param type $fields
     * @return type
     */
    public static function getAll($fields) {
       // return ViciRecordingLog::get();


        return DB::table('recording_log')->join('vicidial_users', 'recording_log.user.id', '=', 'vicidial_users.user')->get();
    }

 

}
