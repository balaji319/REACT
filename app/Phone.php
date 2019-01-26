<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Phone extends Model
{
    protected $table = 'phones';
    protected $connection = 'dyna';
    public $timestamps = false;
    public $incrementing = false;
    protected $primaryKey = 'extension';


    public static function getAll()
    {
            $list=Phone::orderBy('dialplan_number')->get(['extension','server_ip','dialplan_number','voicemail_id','fullname','email']);
            return $list;

    }
}
