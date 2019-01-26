<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class VicidialXferLog extends Model {

    protected $connection = 'dyna';
    protected $table = 'vicidial_xfer_log';
    public $primaryKey = 'xfercallid';
    public $timestamps = false;
    public $incrementing = false;


    public static function getXfrmData($selected_groups, $query_date_begin, $query_date_end){
        return VicidialXferLog::where('campaign_id', $selected_groups)
            							->whereBetween('call_date',[$query_date_begin,$query_date_end])
            							->select(DB::raw('user, count(distinct lead_id) count'))
            							->whereNotNull('user')
            							->groupBy('user')
            							->get()->toArray();
    }

}