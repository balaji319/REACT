<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class VicidialAgentLog extends Model
{
    protected $table = 'vicidial_agent_log';
    protected $connection = 'dyna';
    public $timestamps = false;

    public static function agentLog($user_group, $epoc_date) {
    	return VicidialAgentLog::where('user', $user_group)
    						->where('event_time', '>=', $epoc_date)
    						->select(DB::raw('event_time,UNIX_TIMESTAMP(event_time) as unix,campaign_id'))
    						->orderBy('agent_log_id', 'DESC')
    						->limit(1)
    						->get();
    }


    public static function agentLogDetails($group,$user_group,$query_date_end,$query_date_begin) {
        return DB::connection('dyna')->table('vicidial_agent_log')
                ->join('vicidial_users','vicidial_users.user','=','vicidial_agent_log.user')
                ->whereIn('vicidial_agent_log.campaign_id', $group)
                ->whereIn('vicidial_agent_log.user_group', $user_group)
                ->whereBetween('vicidial_agent_log.event_time',[$query_date_begin,$query_date_end])
                ->select(DB::raw('count(*) as calls, vicidial_agent_log.user, vicidial_users.full_name, vicidial_agent_log.status'))
                ->groupBy('vicidial_users.full_name')
                ->groupBy('vicidial_agent_log.user')
                ->groupBy('vicidial_agent_log.status')
                ->orderBy('vicidial_users.full_name', 'ASC')
                ->orderBy('vicidial_agent_log.user', 'ASC')
                ->orderBy('vicidial_agent_log.status', 'DESC')
                ->limit(500000)
                ->get();
    }


    public static function agentDetails($group, $user_array, $user_group, $time_array) {
        return DB::connection('dyna')->table('vicidial_agent_log')
                ->join('vicidial_users','vicidial_users.user','=','vicidial_agent_log.user')
                ->whereIn('campaign_id', $group)
                ->whereIn('vicidial_agent_log.user_group', $user_group)
                ->whereIn('vicidial_agent_log.user', $user_array)
                ->whereBetween('vicidial_agent_log.event_time',[$time_array['query_date_begin'],$time_array['query_date_end']])
                ->where(function ($q) {
                    $q->where('pause_sec', '<', 65000)
                      ->where('wait_sec', '<', 65000)
                      ->where('talk_sec', '<', 65000)
                      ->where('dispo_sec', '<', 65000);
                })
                ->select(DB::raw('count(*) as calls, vicidial_users.user_group, sum(talk_sec) as talk, vicidial_users.user, vicidial_users.full_name, status, sum(pause_sec) as pause_sec, sum(wait_sec) as wait_sec, sum(dispo_sec) as dispo_sec, sum(dead_sec) as dead_sec'))
                ->groupBy('user')
                ->groupBy('full_name')
                ->groupBy('status')
                ->groupBy('user_group')
                ->orderBy('full_name', 'ASC')
                ->limit(500000)
                ->get();
    }

    public static function logDetails($group, $user_array, $user_group, $time_array) {
        return DB::connection('dyna')->table('vicidial_agent_log')
                ->join('vicidial_users','vicidial_users.user','=','vicidial_agent_log.user')
                ->whereIn('campaign_id', $group)
                ->whereIn('vicidial_agent_log.user_group', $user_group)
                ->whereIn('vicidial_agent_log.user', $user_array)
                ->where(function ($q) use ($time_array) {
                    $q->whereBetween('vicidial_agent_log.event_time',[$time_array['query_date_begin'],$time_array['query_date_end']])
                      ->where('pause_sec', '<', 65000);
                      
                })
                ->select(DB::raw('vicidial_users.user_group, vicidial_users.user, vicidial_users.full_name, sum(pause_sec) as pause_sec, sum(wait_sec + talk_sec + dispo_sec) as total, sub_status'))
                ->groupBy('user')
                ->groupBy('full_name')
                ->groupBy('sub_status')
                ->groupBy('user_group')
                ->orderBy('full_name', 'ASC')
                ->limit(100000)
                ->get();
    }

    public static function agentDailylog($group, $time_array, $user) {
        
        $query = DB::connection('dyna')->table('vicidial_agent_log')
                    ->join('vicidial_users','vicidial_users.user','=','vicidial_agent_log.user')
                    ->whereIn('campaign_id', $group);
        if(!empty($user)){
            $query = $query->whereBetween('vicidial_agent_log.event_time',[$time_array['query_date_begin'],$time_array['query_date_end']])
                          ->where('vicidial_agent_log.user', $user);
        }else{
            $query = $query->whereBetween('vicidial_agent_log.event_time',[$time_array['query_date_begin'],$time_array['query_date_end']]);
        }
        
        return $query->select(DB::raw('date_format(event_time, "%Y-%m-%d") as date, count(*) as calls, status'))
                    ->groupBy('date')
                    ->groupBy('status')
                    ->orderBy('date', 'ASC')
                    ->orderBy('status', 'DESC')
                    ->get();
    }


    public static function userNameLogDetails($user_id, $query_date_begin, $query_date_end) {
        return VicidialAgentLog::where('user', $user_id)
                ->where('pause_sec', '<', 48800)
                ->where('wait_sec', '<', 48800)
                ->where('talk_sec', '<', 48800)
                ->where('dispo_sec', '<', 48800)
                ->whereBetween('event_time', [$query_date_begin, $query_date_end])
                ->orderBy('agent_log_id')
                ->limit(1)
                ->select(DB::Raw('agent_log_id,count(*) as calls,sum(talk_sec) as talk,avg(talk_sec) as talk_sec,sum(pause_sec) as pause,avg(pause_sec) as pause_sec,sum(wait_sec) as wait,avg(wait_sec) as wait_sec,sum(dispo_sec) as dispo,avg(dispo_sec) as dispo_sec'))
                ->get();
    }


    public static function userFirstLogin($user_id, $query_date_begin, $query_date_end) {
        return VicidialAgentLog::where('user', $user_id)
                ->whereBetween('event_time', [$query_date_begin, $query_date_end])
                ->orderBy('event_time')
                ->select(DB::Raw('event_time, UNIX_TIMESTAMP(event_time) as time_stamp'))
                ->get();
    }
    
    public static function userDetailsForTeamPerfomance($group, $query_date, $end_date, $statuses_list) {
        return DB::connection('dyna')->table('vicidial_agent_log')
                ->join('vicidial_list','vicidial_agent_log.lead_id', '=', 'vicidial_list.lead_id')
                ->select(DB::Raw('max(event_time), vicidial_agent_log.user, vicidial_agent_log.lead_id, vicidial_list.status as current_status'))
                ->whereBetween('event_time', [$query_date, $end_date])
                ->whereIn('campaign_id', $group)
                ->whereIn('vicidial_agent_log.status', $statuses_list)
                ->groupBy('vicidial_agent_log.user')
                ->groupBy('vicidial_agent_log.lead_id')
                ->groupBy('vicidial_list.status')
                ->get();
    }
    
    /**
     * Agent Controller, for find max user leads status.
     * @param type $query_date
     * @param type $end_date
     * @param type $group_SQL_str
     */
    public static function maxUserLeadStatus($query_date,$end_date, $group_str, $new_array){
        try{
            return VicidialAgentLog::join('vicidial_list', 'vicidial_list.lead_id', 'vicidial_agent_log.lead_id')
                    ->select(DB::raw('max(event_time), vicidial_agent_log.user, vicidial_agent_log.lead_id, vicidial_list.status as current_status '))
                    ->where([['vicidial_agent_log.event_time','>=',$query_date],['vicidial_agent_log.event_time','<=',$end_date]])
                    ->whereIn('vicidial_agent_log.campaign_id',$group_str)
                    ->whereIn('vicidial_agent_log.status',$new_array)
                    ->get();
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.vicidial agent log'), $e);
            throw $e;
        }
    }
    
    public static function sumForSaleTime($user,$lead_id, $group){
        try{
            return VicidialAgentLog::select(DB::raw('sum(talk_sec)-sum(dead_sec) AS sum'))
                    ->where([['user',$user],['lead_id',$lead_id]])
                    ->whereIn('campaign_id',$group)
                    ->first();
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.vicidial agent log'), $e);
            throw $e;
        }
    }
    
    public static function agentDetailsForUserGroup($user_group,$query_date, $end_date,$group) {
        try{
            return VicidialAgentLog::join('vicidial_users', 'vicidial_users.user', 'vicidial_agent_log.user')
                    ->select(DB::raw('distinct vicidial_users.full_name, vicidial_users.user'))
                    ->where([['vicidial_agent_log.event_time','>=',$query_date],['vicidial_agent_log.event_time','<=',$end_date],
                        [ 'vicidial_users.user_group',$user_group],['vicidial_agent_log.user_group',$user_group]])
                    ->whereIn('vicidial_agent_log.campaign_id',$group)
                    ->orderBy('full_name')
                    ->orderBy('user')
                    ->get();
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.vicidial agent log'), $e);
            throw $e;
        }
    }
    
    public static function leadStatus($query_date , $end_date , $group , $user , $user_group){
        try{
            return VicidialAgentLog::select(DB::raw('count(distinct lead_id) AS lead_id'))
                    ->where('user_group', $user_group)
                    ->whereBetween('event_time',[$query_date ,$end_date ])
                    ->where('user',$user)
                    ->whereNotNull('lead_id')
                    ->whereIn('campaign_id',$group)
                    ->first();
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.vicidial agent log'), $e);
            throw $e;
        }
    }
    
    public static function statResult($user,$user_group,$query_date,$end_date,$group) {
        try{
            $query_vici1 = VicidialStatuses::select('status')->get();
            $query_vici2 = VicidialCampaignStatuses::select(DB::raw('distinct status as status '))->whereIn('campaign_id',$group)->get();
            foreach($query_vici1 as $key =>$values) {
                $array1[] = $values->status;
            }
            foreach($query_vici2 as $key =>$values) {
                $array2[] = $values->status;
            }
            $query =  VicidialAgentLog::join('vicidial_statuses', 'vicidial_statuses.status', 'vicidial_agent_log.status')
                    ->select(DB::raw('vicidial_agent_log.status AS status , vicidial_agent_log.sub_status AS  sub_status, vicidial_statuses.customer_contact AS customer_contact, 
                        sum(vicidial_agent_log.talk_sec)  AS talk_sec, sum(vicidial_agent_log.pause_sec)  AS pause_sec,
                        sum(vicidial_agent_log.wait_sec)  AS wait_sec  , sum(vicidial_agent_log.dispo_sec)  AS dispo_sec, sum(vicidial_agent_log.dead_sec)  AS dead_sec, count(*) AS count '))
                    ->where('vicidial_agent_log.user_group',$user_group)
                    ->where('vicidial_agent_log.user',$user)
                    ->whereBetween('vicidial_agent_log.event_time',[$query_date ,$end_date ])
                    ->whereIn('vicidial_agent_log.campaign_id',$group)
                    ->whereIn('vicidial_statuses.status',$array1 )
                    ->groupBy('status')
                    ->groupBy('customer_contact');

            
            
            $query2 = VicidialAgentLog::join('vicidial_campaign_statuses', 'vicidial_campaign_statuses.status', 'vicidial_agent_log.status')
                    ->select(DB::raw('vicidial_agent_log.status AS status , vicidial_agent_log.sub_status AS  sub_status, vicidial_campaign_statuses.customer_contact AS customer_contact, 
                        sum(vicidial_agent_log.talk_sec)  AS talk_sec, sum(vicidial_agent_log.pause_sec)  AS pause_sec,
                        sum(vicidial_agent_log.wait_sec)  AS wait_sec  , sum(vicidial_agent_log.dispo_sec)  AS dispo_sec, sum(vicidial_agent_log.dead_sec)  AS dead_sec, count(*) AS count '))
                    ->where('vicidial_agent_log.user_group',$user_group)
                    ->where('vicidial_agent_log.user',$user)
                    ->whereBetween('vicidial_agent_log.event_time',[$query_date ,$end_date ])
                    ->whereIn('vicidial_agent_log.campaign_id',$group)
                    ->whereIn('vicidial_campaign_statuses.status',$array2)
                    ->groupBy('status')
                    ->groupBy('customer_contact');
            
            $result = $query->unionAll($query2);  # union both query .
            $result1 = $result->get();            #get information from query.  
            return $result1;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.vicidial agent log'), $e);
            throw $e;
        }
    }
    
    public static function statusInformtion($user_group, $query_date, $end_date, $user, $call_status, $group ) {
        try{
            $query =  VicidialAgentLog::join('vicidial_statuses', 'vicidial_statuses.status', 'vicidial_agent_log.status')
                    ->select(DB::raw('count(distinct uniqueid) as stat_ct'))
                    ->where([['vicidial_agent_log.event_time','>=',$query_date],['vicidial_agent_log.event_time','<=',$end_date],
                        ['vicidial_agent_log.user_group',$user_group],['vicidial_statuses.status', $call_status],['vicidial_agent_log.user',$user]])
                    ->whereIn('vicidial_agent_log.campaign_id',$group);
            
            $query2 =  VicidialAgentLog::join('vicidial_campaign_statuses', 'vicidial_campaign_statuses.status', 'vicidial_agent_log.status')
                    ->select(DB::raw('count(distinct uniqueid) as stat_ct'))
                    ->where([['vicidial_agent_log.event_time','>=',$query_date],['vicidial_agent_log.event_time','<=',$end_date],
                        ['vicidial_agent_log.user_group',$user_group],['vicidial_campaign_statuses.status', $call_status],['vicidial_agent_log.user',$user]])
                    ->whereIn('vicidial_agent_log.campaign_id',$group);
            
            $result = $query->unionAll($query2);  # union both query .
            $result1 = $result->get();            #get information from query.  
            $resl = 0 ;
            if(isset($result1)){
                $result1= $result1->toArray();
                foreach ($result1 as $k => $v){
                    $resl =+ $v['stat_ct'];
                }
            }
            return $resl;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.vicidial agent log'), $e);
            throw $e;
        }
    }
    
    
    public static function singleAgent($query_date_end,$query_date_begin,$user, $group) {
        try{
            return $lsit = VicidialAgentLog::join('vicidial_users', 'vicidial_users.user', 'vicidial_agent_log.user')
                    ->select(DB::raw('date_format(event_time, "%Y-%m-%d") as date,count(*) as calls,vicidial_agent_log.status'))
                    ->where('vicidial_agent_log.user',$user)
                    ->whereBetween('event_time', [$query_date_begin, $query_date_end])
                    ->wherein('campaign_id',$group)
                    ->groupBy('date')
                    ->groupBy('status')
                    ->orderBy('date')
                    ->orderBy('status','DESC')
                    ->get();
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.vicidial agent log'), $e);
            throw $e;
        }
    }

    public static function agentActivity($userid ,$end_date , $begin_date) {
        try{
            return VicidialAgentLog::where('user', $userid)
                        ->whereBetween('event_time', [$begin_date." 00:00:01", $end_date." 23.59.59"])
                        ->where(function($q) {
                            $q->orWhere('pause_sec', '>',0)
                            ->orWhere('wait_sec', '>', 0)
                            ->orWhere('talk_sec','>',0)
                            ->orWhere('dispo_sec', '>',0);
                        })
                        ->select('event_time','lead_id','campaign_id','pause_sec','wait_sec','talk_sec','dispo_sec','dead_sec','status','sub_status','user_group')
                        ->orderBy('event_time','DESC')
                        ->limit(1000)
                        ->get();
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.vicidial agent log'), $e);
            throw $e;
        }
    }
}
