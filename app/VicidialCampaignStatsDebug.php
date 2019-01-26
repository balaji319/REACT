<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialCampaignStatsDebug extends Model {

    protected $connection = 'dyna';
    protected $table = 'vicidial_campaign_stats_debug';
    public $primaryKey = 'campaign_id';
    public $incrementing = false;
    public $timestamps = false;
    protected $fillable = array('*');

}
