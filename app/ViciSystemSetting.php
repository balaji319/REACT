<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ViciSystemSetting extends Model
{
    protected $table = 'system_settings';
    public $timestamps = false;
    protected $connection = 'dyna';
        
 	public $primaryKey = 'version';

    public static function userGroupSystemSetting() {
    	return ViciSystemSetting::get(['timeclock_end_of_day',]);
    }
}


