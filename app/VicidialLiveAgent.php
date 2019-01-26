<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class VicidialLiveAgent extends Model {

    protected $connection = 'dyna';
    protected $table = 'vicidial_live_agents';
    public $primaryKey = 'live_agent_id';
    public $timestamps = false;
    protected $fillable = array('*');

    public static function getStatus($group) {
        return VicidialLiveAgent::where('campaign_id', $group)
                        ->select(DB::raw('extension, user, conf_exten, status, server_ip, UNIX_TIMESTAMP(last_call_time) as last_call_time, UNIX_TIMESTAMP(last_call_finish) as last_call_finish, call_server_ip, campaign_id'))
                        ->get();
    }

    /*
     * Fetch live agent.
     */

    public static function getLiveAgents($info = '') {
        return VicidialLiveAgent::leftJoin('vicidial_users', 'vicidial_live_agents.user', '=', 'vicidial_users.user')
                        ->select('vicidial_users.closer_default_blended', 'vicidial_live_agents.live_agent_id')
                        ->orderBy('vicidial_users.closer_default_blended')->toSql();
    }

    //Get all agent with condition.
    public static function getAgentWithCondition($condition = '') {
        return VicidialLiveAgent::select(
                        'live_agent_id', 'user', 'server_ip', 'conf_exten', 'extension', 'status', 'lead_id', 'campaign_id', 'uniqueid', 'callerid', 'channel', 'random_id', 'last_call_time', 'last_update_time', 'last_call_finish', 'closer_campaigns', 'call_server_ip', 'user_level', 'comments', 'campaign_weight', 'calls_today', 'external_hangup', 'external_status', 'external_pause', 'external_dial', 'agent_log_id', 'last_state_change', 'agent_territories', 'outbound_autodial', 'manager_ingroup_set', 'external_igb_set_user'
                )->where('user', '=', $condition)->get();
    }

}
