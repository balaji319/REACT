<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialLeadSearchlog extends Model
{
    protected $connection = 'dyna';
    protected $table = 'vicidial_lead_search_log';
    public $incrementing = false;
    public $timestamps = false;
    
    public static function leadSearch($userid ,$end_date , $begin_date)  {
        try{
            return VicidialLeadSearchlog::select('event_date','source','results','seconds','search_query')
                        ->whereBetween('event_date', [$begin_date." 00:00:01", $end_date." 23.59.59"])
                        ->where('user', $userid)
                        ->orderBy('event_date','DESC')
                        ->limit(1000)
                        ->get();
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            return collect([]);
        }
    }
    
}