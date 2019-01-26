<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    //
    public $timestamps = false;

    #table name
    protected $table = "apps_countries";
}

