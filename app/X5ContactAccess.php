<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class X5ContactAccess extends Model {

    protected $table = 'x5_contact_accesses';
    public $primaryKey = 'x5_contact_access_id';
    public $timestamps = false;
    protected $fillable = array('*');

}
