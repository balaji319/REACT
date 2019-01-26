<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialLogArchive extends Model
{
    protected $table = "vicidial_log_archive";
    
    protected $connection = 'dyna';

    protected $primaryKey = 'uniqueid';
    
    public $incrementing = false;

    public $timestamps = false;
}
