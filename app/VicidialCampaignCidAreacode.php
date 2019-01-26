<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\ErrorLog;

class VicidialCampaignCidAreacode extends Model {

    use ErrorLog;

    protected $connection = 'dyna';
    protected $table = 'vicidial_campaign_cid_areacodes';
    public $primaryKey = 'campaign_id';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = array('*');

}
