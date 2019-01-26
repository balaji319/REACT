<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Support\Facades\DB;


class VicidialCloserLog extends Model
{
    protected $table = "vicidial_closer_log";
    protected $connection = 'dyna';
    protected $primaryKey = 'closecallid';
    public $incrementing = false;
    public $timestamps = false;
    protected $casts = [
        'uniqueid' => 'float',
    ];
    
   	public static function callDetailsBetweenDate($campaign, $start_date, $end_date){
        return VicidialCloserLog::where('campaign_id', $campaign)
                                ->whereBetween('call_date',[$start_date,$end_date])
                                ->select(DB::raw('closecallid, lead_id, list_id, campaign_id, call_date, start_epoch, end_epoch, length_in_sec, status, phone_code, phone_number, user, comments, processed, queue_seconds, user_group, xfercallid, term_reason, uniqueid, agent_only, queue_position, called_count'))
                                ->get();
    }

    public static function callDetailsBetweenDateUnique($uniqueid, $start_date, $end_date){
        return VicidialCloserLog::whereBetween('call_date', [$start_date, $end_date])
                                ->select(DB::raw('count(*) AS totalcalls, sum(length_in_sec) AS len'))
                                ->whereIn('uniqueid', $uniqueid)
                                ->get();
    }

    public static function callDetailsBetweenDateWithStatus($campaign, $status, $start_date, $end_date){
        return VicidialCloserLog::where('campaign_id', $campaign)
                                ->whereBetween('call_date',[$start_date,$end_date])
                                ->whereIn('status', $status)
                                ->select(DB::raw('closecallid, lead_id, list_id, campaign_id, call_date, start_epoch, end_epoch, length_in_sec, status, phone_code, phone_number, user, comments, processed, queue_seconds, user_group, xfercallid, term_reason, uniqueid, agent_only, queue_position, called_count'))
                                ->get();
    }

    public static function callDetailsBetweenDateWithCount($campaign_id, $status, $start_date, $end_date){
        return VicidialCloserLog::whereBetween('call_date', [$start_date, $end_date])
                                ->select(DB::raw('count(*) AS count'))
                                ->where('campaign_id', $campaign_id)
                                ->whereIn('status', $status)
                                ->get();
    }

    public static function callDetailsBetweenDateWithUniqueIdAnsState($unique_id, $answer_status, $start_date, $end_date){
        return VicidialCloserLog::select(DB::raw('count(*) AS count'))
                                ->whereIn('uniqueid', $unique_id)
                                ->whereBetween('call_date', [$start_date, $end_date])
                                ->whereIn('status', $answer_status)
                                ->get();
    }

    public static function dropCallDetails($did_unid_sql, $status_arr, $start_date, $end_date){
        return VicidialCloserLog::whereBetween('call_date', [$start_date, $end_date])
                                ->select(DB::raw('count(*) AS drop_calls, sum(length_in_sec) AS sumlen'))
                                ->whereIn('uniqueid', $did_unid_sql)
                                ->whereIn('status', $status_arr)
                                ->get();
    }

    public static function getAllUniqueData($unique_id, $start_date, $end_date){
        return VicidialCloserLog::whereBetween('call_date', [$start_date, $end_date])
                                    ->whereIn('uniqueid', $unique_id)
                                    ->get();
    }


    public static function getAllAvgSumLog($unique_id, $start_date, $end_date){
        return VicidialCloserLog::whereBetween('call_date', [$start_date, $end_date])
                                ->select(DB::raw('AVG(`length_in_sec`) AS average_all, sum(`length_in_sec`) AS sum_all'))
                                ->whereIn('uniqueid',$unique_id)
                                ->get();
    }

    public static function getTotalAnsCallCount($unique_id, $ans_status_not_in, $start_date, $end_date){
        return VicidialCloserLog::whereBetween('call_date', [$start_date, $end_date])
                                ->select(DB::raw(' COUNT(*) AS `count` '))
                                ->whereIn('uniqueid', $unique_id)
                                ->whereNotIn('status', $ans_status_not_in)
                                ->get();
    }

    public static function getTotalAnsCallAvg($unique_id, $ans_status_not_in, $start_date, $end_date){
        return VicidialCloserLog::whereBetween('call_date', [$start_date, $end_date])
                                ->select(DB::raw(' AVG(`queue_seconds`) AS average_answer '))
                                ->whereIn('uniqueid', $unique_id)
                                ->whereNotIn('status', $ans_status_not_in)
                                ->get();
    }

    public static function getTotalCallDropDetails($unique_id, $drop_status, $start_date, $end_date){
        return VicidialCloserLog::whereBetween('call_date', [$start_date, $end_date])
                                ->whereIn('uniqueid', $unique_id)
                                ->whereIn('status', $drop_status)
                                ->get();
    }

    public static function getCallDropDetails($unique_id, $drop_status, $start_date, $end_date){
        return VicidialCloserLog::whereBetween('call_date', [$start_date, $end_date])
                                ->select(DB::raw(' AVG(`length_in_sec`) AS average_drop_hold, sum(`length_in_sec`) AS sum_drop_hold '))
                                ->whereIn('uniqueid', $unique_id)
                                ->whereIn('status', $drop_status)
                                ->get();
    }

    public static function getCallQueueDetails($unique_id, $queue_seconds, $start_date, $end_date){
        return VicidialCloserLog::whereBetween('call_date', [$start_date, $end_date])
                                    ->whereIn('uniqueid', $unique_id)
                                    ->where('queue_seconds', '>', $queue_seconds)
                                    ->get();
    }

    public static function getCallQueueSeconds($unique_id, $queue_seconds, $start_date, $end_date){
        return VicidialCloserLog::whereBetween('call_date', [$start_date, $end_date])
                                    ->select(DB::raw(' SUM(`queue_seconds`) AS total_queue_seconds '))
                                    ->whereIn('uniqueid', $unique_id)
                                    ->where('queue_seconds', '>', $queue_seconds)
                                    ->get();
    }

    public static function getCloserLogWithCampaign($campaign_id, $start_date, $end_date){
        return VicidialCloserLog::whereBetween('call_date', [$start_date,$end_date])
                                ->whereIn('campaign_id', $campaign_id)
                                ->get();
    }

    public static function getCloserLogAvgCall($campaign_id, $start_date, $end_date){
        return VicidialCloserLog::whereBetween('call_date', [$start_date, $end_date])
                                ->select(DB::raw(' AVG(`length_in_sec`) AS average_all '))
                                ->whereIn('campaign_id', $campaign_id)
                                ->get();
    }

    public static function getSelectedAnsCallCount($campaign_id, $status, $start_date, $end_date){
        return VicidialCloserLog::whereBetween('call_date', [$start_date, $end_date])
                                ->select(DB::raw(' COUNT(*) AS `count` '))
                                ->whereIn('campaign_id', $campaign_id)
                                ->whereNotIn('status', $status)
                                ->get();
    }

    public static function getSelectedAnsCallAvg($campaign_id, $status, $start_date, $end_date){
        return VicidialCloserLog::whereBetween('call_date', [$start_date, $end_date])
                                ->select(DB::raw(' AVG(`queue_seconds`) AS average_answer '))
                                ->whereIn('campaign_id', $campaign_id)
                                ->whereNotIn('status', $status)
                                ->get();
    }

    public static function getSelectedTotalCallDropDetails($campaign_id, $status, $start_date, $end_date){
        return VicidialCloserLog::whereBetween('call_date', [$start_date, $end_date])
                                ->whereIn('campaign_id', $campaign_id)
                                ->whereIn('status', $status)
                                ->get();
    }

    public static function getSelectedCallDropDetails($campaign_id, $status, $start_date, $end_date){
        return VicidialCloserLog::whereBetween('call_date', [$start_date, $end_date])
                                ->select(DB::raw(' AVG(`length_in_sec`) AS average_drop_hold '))
                                ->whereIn('campaign_id', $campaign_id)
                                ->whereIn('status', $status)
                                ->get();
    }

    public static function getSelectedCallQueueDetails($campaign_id, $queue_seconds, $start_date, $end_date){
        return VicidialCloserLog::whereBetween('call_date', [$start_date, $end_date])
                                ->whereIn('campaign_id', $campaign_id)
                                ->where('queue_seconds', '>', $queue_seconds)
                                ->get();
    }

    public static function getSelectedCallQueueSeconds($campaign_id, $queue_seconds, $start_date, $end_date){
        return VicidialCloserLog::whereBetween('call_date', [$start_date, $end_date])
                                ->select(DB::raw(' SUM(`queue_seconds`) AS total_queue_seconds '))
                                ->whereIn('campaign_id', $campaign_id)
                                ->where('queue_seconds', '>', $queue_seconds)
                                ->get();
    }

    public static function getSelectedAnsCallDetails($campaign_id, $status, $start_date, $end_date){
        return VicidialCloserLog::whereBetween('call_date', [$start_date, $end_date])
                                ->select(DB::raw(' count(*) as count, queue_seconds '))
                                ->whereIn('campaign_id', $campaign_id)
                                ->whereNotIn('status', $status)
                                ->groupBy('queue_seconds')
                                ->get();
    }

    public static function getSelectedAnsCallDetailsWithY($unique_id, $status, $start_date, $end_date){
        return VicidialCloserLog::whereBetween('call_date', [$start_date, $end_date])
                                ->select(DB::raw(' count(*) as count, queue_seconds '))
                                ->whereIn('uniqueid', $unique_id)
                                ->whereNotIn('status', $status)
                                ->groupBy('queue_seconds')
                                ->get();
    }

    public static function getSelectedAnsCallDetailsMin($campaign_id, $status, $queue_seconds, $start_date, $end_date){
        return VicidialCloserLog::whereBetween('call_date', [$start_date, $end_date])
                                ->select(DB::raw(' COUNT(*) AS `count` '))
                                ->whereIn('campaign_id', $campaign_id)
                                ->where('queue_seconds', '<=', $queue_seconds)
                                ->whereNotIn('status', $status)
                                ->get();
    }

    public static function getSelectedAnsCallDetailsMax($campaign_id, $status, $queue_seconds, $start_date, $end_date){
        return VicidialCloserLog::whereBetween('call_date', [$start_date, $end_date])
                                ->select(DB::raw(' COUNT(*) AS `count` '))
                                ->whereIn('campaign_id', $campaign_id)
                                ->where('queue_seconds', '<=', $queue_seconds)
                                ->whereNotIn('status', $status)
                                ->get();
    }

    public static function getSelectedStatus($campaign_id, $start_date, $end_date){
        return VicidialCloserLog::whereBetween('call_date', [$start_date, $end_date])
                                ->select(DB::raw(' COUNT(`status`) AS countrecords, `status`, SUM(`length_in_sec`) AS sum '))
                                ->whereIn('campaign_id', $campaign_id)
                                ->groupBy('status')
                                ->get();
    }

    public static function getAllStatus($unique_id, $start_date, $end_date){
        return VicidialCloserLog::whereBetween('call_date', [$start_date, $end_date])
                                ->select(DB::raw(' COUNT(`status`) AS countrecords, `status`, SUM(`length_in_sec`) AS sum '))
                                ->whereIn('uniqueid', $unique_id)
                                ->groupBy('status')
                                ->get();
    }

    public static function getSelectedAgentStatDetailsWithCampaign($campaign_id, $start_date, $end_date){
        return VicidialCloserLog::join('vicidial_users', 'vicidial_users.user', 'vicidial_closer_log.user')
                                    ->select(DB::raw('COUNT(vicidial_closer_log.user) AS countusers, AVG(vicidial_closer_log.length_in_sec) AS average_lenght, SUM(vicidial_closer_log.length_in_sec) AS sum_lenght, vicidial_closer_log.user, vicidial_users.full_name'))
                                    ->whereBetween('vicidial_closer_log.call_date', [$start_date, $end_date])
                                    ->whereNotNull('vicidial_closer_log.user')
                                    ->whereNotNull('vicidial_closer_log.length_in_sec')
                                    ->whereIn('vicidial_closer_log.campaign_id', $campaign_id)
                                    ->where('vicidial_closer_log.length_in_sec', '>', '0')
                                    ->groupBy('vicidial_closer_log.user')
                                    ->get();
    }

    public static function getSelectedAgentStatDetailsWithUnique($unique_id, $start_date, $end_date){
        return VicidialCloserLog::join('vicidial_users', 'vicidial_users.user', 'vicidial_closer_log.user')
                                    ->select(DB::raw('COUNT(vicidial_closer_log.user) AS countusers, AVG(vicidial_closer_log.length_in_sec) AS average_lenght, SUM(vicidial_closer_log.length_in_sec) AS sum_lenght, vicidial_closer_log.user, vicidial_users.full_name'))
                                    ->whereBetween('vicidial_closer_log.call_date', [$start_date, $end_date])
                                    ->whereNotNull('vicidial_closer_log.user')
                                    ->whereNotNull('vicidial_closer_log.length_in_sec')
                                    ->whereIn('vicidial_closer_log.uniqueid', $unique_id)
                                    ->where('vicidial_closer_log.length_in_sec', '>', '0')
                                    ->groupBy('vicidial_closer_log.user')
                                    ->get();
    }

    // public static function getSelectedAnsweredBreakdownSec($selected_groups, $start_date, $end_date){
    //     return VicidialCloserLog::whereBetween('call_date', [$start_date, $end_date])
    //                             ->whereIn('campaign_id', $selected_groups)
    //                             ->get(['status','queue_seconds','call_date As uncalldate','call_date']);
    // }

    public static function getSelectedAnsweredBreakdownSec($selected_groups, $start_date, $end_date){
        return VicidialCloserLog::whereIn('campaign_id',$selected_groups)
                                ->whereBetween('call_date',[$start_date,$end_date])
                                ->select(DB::raw('status,queue_seconds,call_date as uncalldate,call_date'))
                                ->get();
    }

    public static function getUniqueAnsweredBreakdownSec($selected_groups, $start_date, $end_date){
        return VicidialCloserLog::whereBetween('call_date', [$start_date, $end_date])
                                ->select(DB::raw('status,queue_seconds,call_date As uncalldate,call_date'))
                                ->whereIn('uniqueid', $selected_groups)
                                ->get();
    }

    public static function UserCloserLogDetail($user_id, $begin_date, $end_date) {
        return VicidialCloserLog::where('user', $user_id)
                        ->whereBetween('call_date', [$begin_date." 00:00:01", $end_date." 23.59.59"])
                        ->select(DB::raw('count(*) as count, status, sum(length_in_sec) as sum'))
                        ->groupBy('status')
                        ->orderBy('status')
                        ->get();
    }

    public static function agentStateDetailsC($selectedgroups,$enddate,$startdate){
        $inform = DB::connection('dyna')->table('vicidial_closer_log')
            ->join('vicidial_users', 'vicidial_users.user', '=', 'vicidial_closer_log.user')
            ->select('vicidial_closer_log.user', 'vicidial_users.full_name',
                    DB::raw('COUNT(vicidial_closer_log.user) AS countusers'),
                    DB::raw('AVG(vicidial_closer_log.length_in_sec) AS Average_lenght'),
                    DB::raw('SUM(vicidial_closer_log.length_in_sec) AS Sum_lenght') )
            ->where([['vicidial_closer_log.user','!=', null],['vicidial_closer_log.length_in_sec','!=', null],['vicidial_closer_log.call_date','<=',$enddate],
                ['vicidial_closer_log.call_date','>=',$startdate],['vicidial_closer_log.length_in_sec','>', 0]])
            ->whereIn('campaign_id',$selectedgroups)
            ->groupBy('vicidial_closer_log.user')
            ->get();
        return $inform;
    }

    public static function agentStateDetailsU($selectedgroups,$enddate,$startdate){
        $inform = DB::connection('dyna')->table('vicidial_closer_log')
            ->join('vicidial_users', 'vicidial_users.user', '=', 'vicidial_closer_log.user')
            ->select('vicidial_closer_log.user', 'vicidial_users.full_name',
                    DB::raw('COUNT(vicidial_closer_log.user) AS countusers'),
                    DB::raw('AVG(vicidial_closer_log.length_in_sec) AS average_lenght'),
                    DB::raw('SUM(vicidial_closer_log.length_in_sec) AS sum_lenght') )
            ->where([['vicidial_closer_log.user','!=', null],['vicidial_closer_log.length_in_sec','!=', null],['vicidial_closer_log.call_date','<=',$enddate],
                ['vicidial_closer_log.call_date','>=',$startdate],['vicidial_closer_log.length_in_sec','>', 0]])
            ->whereIn('uniqueid',$selectedgroups)
            ->groupBy('vicidial_closer_log.user')
            ->get();
        return $inform;

    }
     public function getCsvBuilderData($begin_date,$end_date,$did){
        try {

            $db_ext = DB::connection($this->connection);

            return $db_ext->table($this->table)
                    ->select('vicidial_closer_log.call_date', 'vicidial_closer_log.uniqueid','vicidial_closer_log.length_in_sec','vicidial_closer_log.status','vicidial_closer_log.phone_number','vicidial_closer_log.campaign_id','vicidial_closer_log.queue_seconds','vicidial_closer_log.list_id','vicidial_closer_log.lead_id','vicidial_call_notes.call_notes')->leftjoin('vicidial_call_notes', 'vicidial_closer_log.closecallid', '=','vicidial_call_notes.vicidial_id')
                      ->join('call_log', 'vicidial_closer_log.uniqueid', '=','call_log.uniqueid')
                      ->where('call_log.channel_group','DID_INBOUND')
                      ->where('call_log.number_dialed',$did)
                      ->where('vicidial_closer_log.call_date', '<=' ,$end_date." 23.59.59")
                      ->where('vicidial_closer_log.call_date', '>=', $begin_date." 0:00:01")
                      ->paginate(10)
                      ;


        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            return collect([]);
        }
    }


    public static function closerInGroupLogs($userid ,$end_date , $begin_date ){
        try{
            return VicidialCloserLog::where('user', $userid)
                        ->whereBetween('event_date', [$begin_date." 00:00:01", $end_date." 23.59.59"])
                        ->select('user','campaign_id','event_date','blended','closer_campaigns','manager_change')
                        ->orderBy('event_date','DESC')
                        ->get();
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            return collect([]);
        }
    }

    public static function inboundCalls($userid ,$end_date , $begin_date ){
        try{
            return VicidialCloserLog::leftJoin('vicidial_call_notes','vicidial_call_notes.vicidial_id', 'vicidial_closer_log.closecallid')
                        ->select('vicidial_closer_log.call_date','length_in_sec','status','phone_number','campaign_id','queue_seconds','list_id','vicidial_closer_log.lead_id',
                            'term_reason','vicidial_call_notes.call_notes')
                        ->whereBetween('vicidial_closer_log.call_date', [$begin_date." 00:00:01", $end_date." 23.59.59"])
                        ->where('user', $userid)
                        ->orderBy('vicidial_closer_log.call_date','DESC')
                        ->limit(1000)
                        ->get();
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            return collect([]);
        }
    }

    public static function getClosorCount($selected_groups, $query_date_begin, $query_date_end, $looparray){
        return VicidialCloserLog::where('campaign_id', $selected_groups)
                                ->whereBetween('call_date',[$query_date_begin,$query_date_end])
                                ->whereIn('status', $looparray)
                                ->select(DB::raw('COUNT(*) AS count'))
                                ->get()->toArray();
    }

    public static function getDataFromClosor($query_date_begin, $query_date_end, $selected_groups, $user_raw){
        return VicidialCloserLog::select(DB::raw('vicidial_closer_log.status,COUNT( distinct vicidial_closer_log.lead_id) AS count'))
                                                    ->join("vicidial_xfer_log",function($join){
                                                        $join->on("vicidial_xfer_log.xfercallid","=","vicidial_closer_log.xfercallid")
                                                            ->on("vicidial_xfer_log.lead_id","=","vicidial_closer_log.lead_id");
                                                    })
                                                    ->whereBetween('vicidial_closer_log.call_date',[$query_date_begin,$query_date_end])
                                                    ->whereBetween('vicidial_xfer_log.call_date',[$query_date_begin,$query_date_end])
                                                    ->where('vicidial_closer_log.campaign_id', $selected_groups)
                                                    ->where('vicidial_xfer_log.campaign_id', $selected_groups)
                                                    ->where('vicidial_xfer_log.user', $user_raw)
                                                    ->groupBy('vicidial_closer_log.user')
                                                    ->get();
    }


    public static function getAvgQue($selected_groups, $query_date_begin, $query_date_end){
        return VicidialCloserLog::whereBetween('call_date',[$query_date_begin,$query_date_end])
                                        ->where('campaign_id', $selected_groups)
                                        ->select(DB::raw('avg(queue_seconds) as AVG'))->get();
    }

    public static function getClosorData($selected_groups, $query_date_begin, $query_date_end){
        return VicidialCloserLog::where('campaign_id', $selected_groups)
                                        ->whereBetween('call_date',[$query_date_begin, $query_date_end])
                                        ->select(DB::raw('user, count(*) as count'))
                                        ->whereNotNull('user')
                                        ->groupBy('user')
                                        ->get()->toArray();
    }

    public static function getDataFromClosorWithUser($selected_groups, $user_raw, $query_date_begin, $query_date_end){
        return VicidialCloserLog::where('campaign_id', $selected_groups)
                                ->where('user', $user_raw)
                                ->whereBetween('call_date',[$query_date_begin, $query_date_end])
                                ->select(DB::raw('status, COUNT(*) AS count'))
                                ->groupBy('status')->get()->toArray();
    }

    public static function dispoReslt($group ,$begin_date, $end_date  ){
        try {
            return VicidialCloserLog::select(DB::raw('DISTINCT status AS status'))
                    ->whereIn('campaign_id', $group)
                    ->whereBetween('call_date', [$begin_date, $end_date])
                    ->orderBy('status')
                    ->get();
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            return collect([]);
        }
    }
    
    public static function campaignStatusList($list_id,$queryenddate , $querybegindate) {
        try {
            return VicidialCloserLog::leftJoin('vicidial_agent_log', function($join){
                        $join->on('vicidial_agent_log.lead_id','=' ,'vicidial_closer_log.lead_id');
                        $join->on('vicidial_agent_log.uniqueid','=' ,'vicidial_closer_log.uniqueid');
                    })
                ->select(DB::raw( "vicidial_closer_log.status , vicidial_closer_log.uniqueid , vicidial_closer_log.length_in_sec as duration ,CAST(vicidial_agent_log.talk_sec AS SIGNED) - CAST(vicidial_agent_log.dead_sec AS SIGNED) AS handletime"))
                ->where('list_id',$list_id)
                ->where([['call_date','<=', $queryenddate ],[ 'call_date','>=', $querybegindate]] )
                ->orderBy('vicidial_closer_log.status')
                ->get();
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            return collect([]);
        }
    }
}