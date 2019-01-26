<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialCallNote extends Model
{
    
    protected $connection = 'dyna';
    protected $table = 'vicidial_call_notes';
     public $primaryKey = 'notesid';
    public $timestamps = false;

}
