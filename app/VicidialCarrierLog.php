<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialCarrierLog extends Model {

    protected $table = "vicidial_carrier_log";
    protected $connection = 'dyna';
    protected $primaryKey = 'uniqueid';
    public $incrementing = false;
    public $timestamps = false;

}
