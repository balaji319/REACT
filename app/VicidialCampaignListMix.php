<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialCampaignListMix extends Model {

    protected $connection = 'dyna';
    protected $table = 'vicidial_campaigns_list_mix';
    public $incrementing = false;
    public $primaryKey = 'vcl_id';
    public $timestamps = false;
    protected $fillable = array('*');

}
