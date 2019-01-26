<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\ErrorLog;

class VicidialFilterPhoneNumber extends Model
{
	use ErrorLog;
	
    protected $connection = 'dyna';
    protected $table = 'vicidial_filter_phone_numbers';
    protected $primaryKey = 'phone_number';
    public $incrementing = false;
    public $timestamps = false;

     protected $fillable = [
        'filter_phone_group_id','phone_number'
    ];
    
    public static function getCount($filter_phone_group_id)
    {
    	$result=VicidialFilterPhoneNumber::where('filter_phone_group_id',$filter_phone_group_id)->count();
    	return $result;
    }
}
