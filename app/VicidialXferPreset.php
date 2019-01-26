<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialXferPreset extends Model {

    protected $connection = 'dyna';
    protected $table = 'vicidial_xfer_presets';
    public $primaryKey = 'campaign_id';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = array('*');

}
