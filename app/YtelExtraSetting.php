<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class YtelExtraSetting extends Model {

    protected $connection = 'dyna';
    protected $table = 'YTEL_extra_settings';
    public $incrementing = false;
    public $primaryKey = 'setting_key';
    public $timestamps = false;
    protected $fillable = array('*');

}
