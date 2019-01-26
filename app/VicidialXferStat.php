<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialXferStat extends Model {

    protected $connection = 'dyna';
    protected $table = 'vicidial_xfer_stats';
    public $incrementing = false;
    public $primaryKey = 'campaign_id';
    public $timestamps = false;
    protected $fillable = array('*');

}
