<?php

namespace App;

use Illuminate\Database\Eloquent\Model;


class VicidialCampaignStat extends Model
{

    protected $connection = 'dyna';
    protected $table = 'vicidial_campaign_stats';
    public $primaryKey = 'campaign_id';
    public $incrementing = false;
    public $timestamps = false;
    protected $fillable = array('*');

    public static function getStatement($group) {
        return VicidialCampaignStat::
                        where('campaign_id', $group)
                        ->get([
                            'dialable_leads',
                            'calls_today',
                            'drops_today',
                            'drops_answers_today_pct',
                            'differential_onemin',
                            'agents_average_onemin',
                            'balance_trunk_fill',
                            'answers_today',
                            'status_category_1',
                            'status_category_count_1',
                            'status_category_2',
                            'status_category_count_2',
                            'status_category_3',
                            'status_category_count_3',
                            'status_category_4',
                            'status_category_count_4',
                            'agent_calls_today',
                            'agent_wait_today',
                            'agent_custtalk_today',
                            'agent_acw_today',
                            'agent_pause_today'
        ]);
    }

}
