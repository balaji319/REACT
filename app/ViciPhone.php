<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ViciPhone extends Model
{
   	protected $table = 'phones';
        protected $connection = 'dyna';
 	public $timestamps = false;
 	public $primaryKey = 'extension';

}
