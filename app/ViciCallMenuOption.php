<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ViciCallMenuOption extends Model
{
    protected $connection = 'dyna';    
    
    protected $table = 'vicidial_call_menu_options';
    
    public $timestamps = false;
    
    public $incrementing = false;
    
    protected $primaryKey = 'menu_id';
    
    protected $fillable = ['group_id', 'group_name', 'group_color', 'active', 'queue_priority', 'call_time_id'];
    
    /**
     * Get the call menu associated with the call menu option.          
     */
    public function callMenu()
    {
        return $this->hasOne(ViciCallMenu::class, 'menu_id', 'menu_id');
    }
}
