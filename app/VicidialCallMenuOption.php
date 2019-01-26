<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialCallMenuOption extends Model {

    protected $connection = 'dyna';
    protected $table = 'vicidial_call_menu_options';
    public $timestamps = false;
    public $incrementing = false;
    protected $primaryKey = 'menu_id';
    protected $fillable = ['menu_id', 'option_value', 'option_description', 'option_route', 'option_route_value', 'option_route_value_context'];

}
