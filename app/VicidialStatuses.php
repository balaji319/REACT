<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\ErrorLog;
use Exception;
use Illuminate\Support\Facades\DB;

class VicidialStatuses extends Model {

    use ErrorLog;

    protected $connection = 'dyna';
    protected $table = 'vicidial_statuses';
    public $timestamps = false;
    public $incrementing = false;
    protected $primaryKey = 'status';

    /**
     * System statuses list
     *
     * @param type $search
     * @param type $limit
     */
    public static function systemWideStatusesList() {
        try {
            return VicidialStatuses::select('*')
                            ->selectRaw('CONCAT(status, " - ", status_name) as options_title')
                            ->orderBy('y_status_order', 'ASC')
                            ->orderByRaw('ISNULL(y_status_order)', 'ASC')
                            ->get();
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

    public static function getAll($fields) {
        return VicidialStatuses::
                get($fields);
    }

    public static function getAllStatuses() {
        return VicidialStatuses::where('human_answered', 'Y')
                        ->pluck('status');
    }

    public static function viciStatuses() {
        return VicidialStatuses::pluck('status');
    }

    public static function getAllStatusDetails() {
        return VicidialStatuses::get(['status', 'status_name', 'human_answered', 'category']);
    }

    public static function getAllStatusesForTeamPerformance() {
        return VicidialStatuses::where('sale', 'Y')->pluck('status');
    }
    
    public static function getDispoStat($status) {
        try {
            $statuses_data = \App\VicidialStatuses::select(DB::raw('distinct status AS status, status_name'))->where('status', $status)->get();
            $campaign_statuses_data = \App\VicidialCampaignStatuses::select(DB::raw('distinct status AS status, status_name'))
                                        ->where('status', $status)
                                        ->get();
            return $statuses_data->union($campaign_statuses_data)->sortBy('status');
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            return collect([]);
        }
    }

    public static function getCampaignStatuslistReport($group){
        try {
            return VicidialStatuses::select("status","status_name","human_answered","sale","dnc","customer_contact","not_interested","unworkable",
                        "scheduled_callback","completed")->orderBy('status')->orderBy('status_name')->get();
        } catch (Exception $e) {
        }
    }
}
