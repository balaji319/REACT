<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialCampaignHotkey extends Model {

    protected $connection = 'dyna';
    protected $table = 'vicidial_campaign_hotkeys';
    public $incrementing = false;
//    public $primaryKey = 'campaign_id';
    public $timestamps = false;
    protected $fillable = array('*');

}
