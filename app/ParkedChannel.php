<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ParkedChannel extends Model
{
    protected $connection = 'dyna';
    protected $table = 'parked_channels';
    public $incrementing = false;
    public $timestamps = false;
    public $primaryKey = 'channel';
}
