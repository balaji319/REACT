<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialReportLog extends Model
{
    protected $table = 'vicidial_report_log';
    protected $connection = 'dyna';
    public $timestamps = false;
    public $primaryKey = 'report_log_id';
}
