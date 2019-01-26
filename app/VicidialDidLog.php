<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\ErrorLog;

class VicidialDidLog extends Model
{
    use ErrorLog; 
    
	protected $table = "vicidial_did_log";
    protected $connection = 'dyna';
    public $timestamps = false;
    protected $primaryKey = 'uniqueid';
    public $incrementing = false;

    public static function 	vicidialInboundLogByDidId($did_id){
	    return VicidialDidLog::orderBy('uniqueid')
	                            ->whereIn('did_id', $did_id)
	                            ->get(['uniqueid']);
    }

}
