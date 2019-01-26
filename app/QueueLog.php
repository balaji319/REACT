<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class QueueLog extends Model
{
    public $incrementing = false;
    protected $table = 'queue_log';
    protected $connection = 'queuematrics';
    public $timestamps = false;
    
}
