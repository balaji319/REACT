<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $table = "reports";
    public $primaryKey = 'report_id';
    public $incrementing = false;
    public $timestamps = false;
}
