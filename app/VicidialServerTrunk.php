<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialServerTrunk extends Model {

    protected $connection = 'dyna';
    protected $table = 'vicidial_server_trunks';
    public $incrementing = false;
    public $primaryKey = 'campaign_id';
    public $timestamps = false;
    protected $fillable = array('*');

}
