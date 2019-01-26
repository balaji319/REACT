<?php

namespace App;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ViciAdminLog extends Model
{
    
	protected $table = 'vicidial_admin_log';
  	public $timestamps = false;


  	public function addLog($x5_contact_id, $ip, $event_section, $event_type, $record_id, $event_code, $event_sql, $event_note, $user_group) {
 
            DB::table('vicidial_admin_log')
        	->insert([
        		'event_date' => date('Y-m-d H:i:s'),
                'user' => "$x5_contact_id",
                'ip_address' => $ip,
                'event_section' => $event_section,
                'event_type' => $event_type,
                'record_id' => "$record_id",
                'event_code' => $event_code,
                'event_sql' => $event_sql,
                'event_notes' => $event_note,
                'user_group' => '---ALL---'
        	]);

        }	


        

}
