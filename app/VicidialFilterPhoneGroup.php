<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\ErrorLog;

class VicidialFilterPhoneGroup extends Model
{
	use ErrorLog;
	
    protected $connection = 'dyna';
    protected $table = 'vicidial_filter_phone_groups';
    protected $primaryKey = 'filter_phone_group_id';
    public $incrementing = false;
    public $timestamps = false;

     protected $fillable = [
        'filter_phone_group_id','filter_phone_group_name', 'filter_phone_group_description', 'user_group',
    ];



   
}
