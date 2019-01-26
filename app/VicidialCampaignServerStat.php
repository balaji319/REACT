<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class VicidialCampaignServerStat extends Model {

    protected $connection = 'dyna';
    protected $table = 'vicidial_campaign_server_stats';
    public $incrementing = false;
    public $primaryKey = 'campaign_id';
    public $timestamps = false;
    protected $fillable = array('*');

    public static function getLocalTrunkShortageCount($group) {
        return VicidialCampaignServerStat::where('campaign_id', $group)->sum('local_trunk_shortage');
    }

}
