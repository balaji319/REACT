<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialHopper extends Model {

    protected $connection = 'dyna';
    protected $table = 'vicidial_hopper';
    public $primaryKey = 'hopper_id';
    public $timestamps = false;
    protected $fillable = array('*');

    /**
     * Get all hoppers
     *
     * @param string|int $campaign_id
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function findAll($campaign_id) {
        return VicidialHopper::join('vicidial_list', 'vicidial_list.lead_id', 'vicidial_hopper.lead_id')
                        ->select('vicidial_hopper.lead_id', 'vicidial_hopper.hopper_id', 'vicidial_hopper.state', 'vicidial_hopper.gmt_offset_now', 'vicidial_hopper.alt_dial', 'vicidial_hopper.list_id', 'vicidial_hopper.priority', 'vicidial_hopper.source', 'vicidial_hopper.vendor_lead_code', 'vicidial_list.status', 'vicidial_list.called_count', 'vicidial_list.phone_number')
                        ->where('vicidial_hopper.campaign_id', $campaign_id)
                        ->where('vicidial_hopper.status', 'READY')
                        ->orderBy('vicidial_hopper.priority', 'desc')
                        ->orderBy('vicidial_hopper.hopper_id', 'asc')
                        ->get();
    }

    public static function getStatementCount($group) {
        return VicidialHopper::where('campaign_id', $group)->count();
    }

}
