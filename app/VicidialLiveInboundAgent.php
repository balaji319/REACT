<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\ErrorLog;

class VicidialLiveInboundAgent extends Model {

    use ErrorLog;

    protected $connection = 'dyna';
    protected $table = 'vicidial_live_inbound_agents';
    //public $primaryKey = '';
    public $incrementing = false;
    public $timestamps = false;

}
