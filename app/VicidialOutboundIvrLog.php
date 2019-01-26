<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\ErrorLog;

class VicidialOutboundIvrLog extends Model {

    use ErrorLog;

    protected $connection = 'dyna';
    protected $table = 'vicidial_outbound_ivr_log';
    protected $primaryKey = 'uniqueid';
    public $incrementing = false;
    public $timestamps = false;
}