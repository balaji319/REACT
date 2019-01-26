<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialCallTimeHoliday extends Model {

    protected $connection = 'dyna';
    protected $table = 'vicidial_call_time_holidays';
//    public $incrementing = false;
    public $primaryKey = 'holiday_id';
    public $timestamps = false;
    protected $fillable = array('*');

}
