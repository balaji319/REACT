<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\ErrorLog;
use Exception;

class VicidialCampaign extends Model {

    use ErrorLog;

    const ALLOW_ACTION = true;

    protected $connection = 'dyna';
    protected $table = 'vicidial_campaigns';
    public $timestamps = false;
    protected $fillable = array('*');
    public $incrementing = false;
    public $primaryKey = 'campaign_id';

    /**
     * Get campaign related area codes
     *
     * @return \Illuminate\Database\Eloquent\Relations\Relation
     */
    public function campaignCidAreacodes() {
        return $this->hasMany(VicidialCampaignCidAreacode::class, 'campaign_id', 'campaign_id');
    }

    /**
     * Campaign list
     *
     * @param string|int $search
     * @return \Illuminate\Http\Response
     * @throws \App\Exception
     */
    public static function campaignsByGroupId($search) {
        try {
            $campaigns = VicidialCampaign::select("campaign_id", "closer_campaigns", "xfer_groups", "campaign_name");
            if ($search != NULL) {
                $campaigns = $campaigns->where(function ($query) use ($search) {
                    $query->where("campaign_id", "like", "%{$search}%")
                            ->orWhere("closer_campaigns", "like", "%{$search}%")
                            ->orWhere("xfer_groups", "like", "%{$search}%")
                            ->orWhere("campaign_name", "like", "%{$search}%");
                });
            }
            $campaigns = $campaigns->orderBy('campaign_id');
            $campaigns = $campaigns->get();
            return $campaigns;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * List of all campaigns
     *
     * @param string|int $campaign_id
     * @param string|int $search
     * @param int $limit
     * @return \Illuminate\Support\Collection
     * @throws \App\Exception
     */
    public static function campaignsList($campaign_id, $search, $limit) {
        try {
            $campaigns = VicidialCampaign::select('campaign_id', 'campaign_name', 'active', 'auto_dial_level', 'dial_method', 'campaign_cid', 'use_custom_cid', 'lead_order_randomize');
            if ($search != NULL) {
                $campaigns = $campaigns->where(function ($query) use ($search) {
                    $query->where("campaign_id", "like", "%{$search}%")
                            ->orWhere("campaign_name", "like", "%{$search}%")
                            ->orWhere("active", "like", "%{$search}%")
                            ->orWhere("auto_dial_level", "like", "%{$search}%")
                            ->orWhere("dial_method", "like", "%{$search}%")
                            ->orWhere("campaign_cid", "like", "%{$search}%")
                            ->orWhere("use_custom_cid", "like", "%{$search}%")
                            ->orWhere("lead_order_randomize", "like", "%{$search}%");
                });
            }
            $campaigns = $campaigns->whereIn('campaign_id', $campaign_id);
            $campaigns = $campaigns->withCount('campaignCidAreacodes as tot_area_codes');
            return $campaigns->paginate($limit);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    /**
     * Campaign status list
     *
     * @param string|int $campaign_id
     * @param string|int $search
     * @param int $limit
     * @return \Illuminate\Support\Collection
     * @throws \App\Exception
     */
    public static function campaignsStatusList($campaign_id, $search, $limit, $fields = ['campaign_id', 'campaign_name']) {
        try {

            $raw_fields = '`' . implode('`,`', $fields) . '`';
            $campaigns = VicidialCampaign::selectRaw($raw_fields);
            if ($search != NULL) {
                $campaigns = $campaigns->where(function ($query) use ($search, $fields) {
                    foreach ($fields as $field) {
                        $query = $query->orWhere($field, 'like', "%{$search}%");
                    }
                });
            }
            $campaigns = $campaigns->whereIn("campaign_id", $campaign_id);
            return $campaigns->paginate($limit);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    public static function agentCampaignList() {

        # TODO  =>  need to add where condition as per permission

        return VicidialCampaign::orderBy('campaign_id')
                        ->get(['campaign_id', 'campaign_name']);
    }

    public static function agentAllCampaignList() {
        return VicidialCampaign::orderBy('campaign_id')->pluck('campaign_id');
    }

}
