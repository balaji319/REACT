<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class VicidialCampaigns extends Model {


    public $timestamps = false;
    protected $connection = 'dyna';
    protected $table = 'vicidial_campaigns';



    public static function getAll($fields) {
        return VicidialCampaigns::
                get($fields);
    }

    public static function getCampaignById($id, $fields) {
        return VicidialCampaigns::
                        where('campaign_id', $id)
                        ->get($fields);
    }

    /**
     * Get id & name for dropdown list
     * @author Omprakash Pachkawade<om@ytel.com>
     * @return array 
     */
    public static function getCampaignsIdDropdown() {

           
         return VicidialCampaigns::get(['campaign_id as value', DB::raw('CONCAT(campaign_id, " - ", campaign_name) as label')]);

                                                     
    }


    public static function getCampaignsId() {
        return VicidialCampaigns::
                            where('campaign_id', '<>', '');
    }

    public static function campaignAllowInbound($group) {
        return VicidialCampaigns::where('campaign_id', $group)
                            ->where('campaign_allow_inbound', 'Y')
                            ->count();
    }

    public static function getColumnRecord($group) {
        return VicidialCampaigns::
                            where('campaign_id', $group)
                            ->get([
                                    'auto_dial_level', 
                                    'dial_status_a', 
                                    'dial_status_b', 
                                    'dial_status_c', 
                                    'dial_status_d', 
                                    'dial_status_e', 
                                    'lead_order', 
                                    'lead_filter_id', 
                                    'hopper_level', 
                                    'dial_method', 
                                    'adaptive_maximum_level', 
                                    'adaptive_dropped_percentage', 
                                    'adaptive_dl_diff_target', 
                                    'adaptive_intensity', 
                                    'available_only_ratio_tally', 
                                    'adaptive_latest_server_time', 
                                    'local_call_time', 
                                    'dial_timeout', 
                                    'dial_statuses'
                                ]);
    }

    public static function getCloserCampaigns($group){
        return VicidialCampaigns::
                            where('campaign_id', $group)
                            ->pluck('closer_campaigns');
    }

    public static function getStatement($all_campaigns, $types) {
        $query = VicidialCampaigns::query();
        if ($types == 'AUTO-DIAL') {
            $query = $query->whereIn('dial_method',['RATIO','ADAPT_HARD_LIMIT','ADAPT_TAPERED','ADAPT_AVERAGE']);
        }
        if ($types == 'MANUAL') {
            $query = $query->whereIn('dial_method',['MANUAL','INBOUND_MAN']);   
        }
        if ($types == 'INBOUND') {
            $query = $query->where('campaign_allow_inbound', 'Y');
        }
        return $query->where('active', '=', 'Y')->whereIn('campaign_id', $all_campaigns)->pluck('campaign_id');
    }

    public static function getSelectStatus($selected_groups){
        return VicidialCampaigns::where('closer_campaigns', 'LIKE', '%'.$selected_groups.'%')
                                                ->orderBy('campaign_id', 'DESC')
                                                ->get(['campaign_id'])->toArray();
    }

    public static function getCampaignId(){
        return VicidialCampaigns::select(DB::raw('campaign_id'))
                                            ->orderBy('campaign_id')
                                            ->get()->toArray();
    }

    public static function getCampaignSelectedId($selectedgroups){
        return VicidialCampaigns::select(DB::raw('campaign_id'))
                                        ->where('campaign_id',$selectedgroups)
                                        ->orderBy('campaign_id')
                                        ->get()->toArray();
    }

}
