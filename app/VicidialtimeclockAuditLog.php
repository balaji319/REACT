<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialtimeclockAuditLog extends Model
{
    public $timestamps = false;
    protected $table = 'vicidial_timeclock_audit_log';
    protected $primaryKey = 'timeclock_id';
     
    protected $connection = 'dyna';

}
