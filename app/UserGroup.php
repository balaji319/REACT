<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserGroup extends Model {

    protected $connection = 'dyna';
    protected $table = 'vicidial_user_groups';
    protected $primaryKey = 'user_group';
    public $incrementing = false;
    public $timestamps = false;

}
