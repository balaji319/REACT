<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialStatusCategories extends Model {

    protected $table = "vicidial_status_categories";
    
    protected $connection = 'dyna';

    protected $primaryKey = 'vsc_id';
    
    public $incrementing = false;

    public $timestamps = false;

    public static function getVscDetails() {
        return VicidialStatusCategories::get(['vsc_id','vsc_name']);
    }

}