<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialCampaignStatuses extends Model {

    protected $connection = 'dyna';
    protected $table = 'vicidial_campaign_statuses';
    public $timestamps = false;
    public $incrementing = false;
    public $primaryKey = 'campaign_id';
    protected $fillable = array('*');

    public static function getAll($fields) {
        return VicidialCampaignStatuses::
                get($fields);
    }

    public static function getAllWhere($column, $value, $fields) {
        return VicidialCampaignStatuses::
                        where($column, $value)
                        ->get($fields);
    }

    public static function getAllCampaignStatuses($group) {
        return VicidialCampaignStatuses::where('human_answered', 'Y')
                        ->whereIn('campaign_id', $group)
                        ->pluck('status');
    }

    public static function getAllCampaignStatus() {
        return VicidialCampaignStatuses::get(['status', 'status_name', 'human_answered', 'category']);
    }

    public static function allCampaignStatuses() {

        # NEED TO ADD WHERE CONDITION DEPENDING UPON ACCESS PERMISSION

        return VicidialCampaignStatuses::distinct('status')->pluck('status');
    }

    public static function campaignStatuses() {
        return VicidialCampaignStatuses::where('human_answered', 'Y')
                        ->pluck('status');
    }

    public static function getCampaignStatusesForTeamPerformance($group) {
        return VicidialCampaignStatuses::where('sale', 'Y')
                        ->whereIn('campaign_id', $group)
                        ->pluck('status');
    }

    public static function getCampaignStatusesList($looparray) {
        return VicidialCampaignStatuses::where('sale', 'Y')
                                        ->whereIn('campaign_id', $looparray)
                                        ->distinct('status')->get(['status'])->toArray();
    }

    public static function getCampaignStatuslistReport($group){
        try {
            return VicidialCampaignStatuses::select("status","status_name","human_answered","sale","dnc","customer_contact","not_interested","unworkable",
                        "scheduled_callback","completed")->where('campaign_id', $group)->orderBy('status')->orderBy('status_name')->get();
        } catch (Exception $ex) {

        }
    }
}
