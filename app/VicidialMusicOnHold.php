<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialMusicOnHold extends Model {


     #table name
	    protected $connection = 'dyna';
    protected $table = 'vicidial_music_on_hold';
    public $incrementing = false;
    public $primaryKey = 'moh_id';
    public $timestamps = false;
   

     protected $fillable = ['moh_id'
        , 'moh_name'
        , 'moh_context'
        , 'user_group'
        ,'remove'];

     public static function duplicateRecords($moh_id) {
     	try{
   				$count1=VicidialMusicOnHold::where('moh_id',$moh_id)->get();
          	return count($count1);
         } catch (Exception $e) {
             $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }


}
