<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialMusicOnHoldFile extends Model
{
     #table name
	protected $connection = 'dyna';
    protected $table = 'vicidial_music_on_hold_files';
    public $incrementing = false;
    public $primaryKey = 'moh_id';
    public $timestamps = false;
    protected $fillable = ['*'];
}
