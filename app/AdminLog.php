<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class AdminLog extends Model {

    protected $connection = 'dyna';
    protected $table = 'vicidial_admin_log';
    protected $primaryKey = 'admin_log_id';
    public $timestamps = false;
    protected $fillable = array('*');




}
