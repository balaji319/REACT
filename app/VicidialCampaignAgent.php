<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialCampaignAgent extends Model {

    protected $connection = 'dyna';
    protected $table = 'vicidial_campaign_agents';
    public $incrementing = false;
//    public $primaryKey = 'campaign_id';
    public $timestamps = false;
    protected $fillable = array('*');

}
