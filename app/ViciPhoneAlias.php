<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ViciPhoneAlias extends Model
{
    protected $table = 'phones_alias';
    protected $connection = 'dyna';
    public $timestamps = false;
}
