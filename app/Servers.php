<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Servers extends Model {

    protected $connection = 'dyna';
    public $table = 'servers';
    protected $primaryKey = 'server_id';
    public $timestamps = false;
    protected $fillable = ['rebuild_conf_files','sounds_update','generate_vicidial_conf','active_asterisk_server','server_ip'];

    public static function getServerDetails($active) {
        return Servers::where('active', $active)
                        ->limit(1)
                        ->get(['local_gmt']);
    }

}
