<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class X5ContactX5ContactGroup extends Model
{
    protected $table = 'x5_contact_x5_contact_groups';
    public $primaryKey = 'id';
    public $timestamps = false;
     protected $fillable = ['x5_contact_id','x5_contact_group_id'];
}
