<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialLeadRecycle extends Model {

    protected $connection = 'dyna';
    protected $table = 'vicidial_lead_recycle';
    public $primaryKey = 'recycle_id';
    public $timestamps = false;
    protected $fillable = array('*');

}
