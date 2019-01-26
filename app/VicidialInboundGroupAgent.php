<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\ErrorLog;

class VicidialInboundGroupAgent extends Model {

    use ErrorLog;

    protected $connection = 'dyna';
    protected $table = 'vicidial_inbound_group_agents';
    protected $primaryKey = 'group_id';
    public $incrementing = false;
    public $timestamps = false;

    /**
     * List of agents by group id
     *
     * @param string|int $group_id
     * @param int $limit
     * @return \Illuminate\Support\Collection
     * @throws Exception
     */
    public static function agentsByGroupId($group_id) {
        try {
            return VicidialInboundGroupAgent::select("vu.user", "vu.full_name", "vu.closer_campaigns", "vu.user_group", "vu.agent_choose_ingroups", "vicidial_inbound_group_agents.group_grade", "vicidial_inbound_group_agents.group_rank", "vicidial_inbound_group_agents.calls_today")
                            ->join("vicidial_users as vu", "vu.user", '=', "vicidial_inbound_group_agents.user")
                            ->where("vicidial_inbound_group_agents.group_id", $group_id)
                            ->where("vu.active", "Y")
                            ->orderBy("vu.user")
                            ->get();
        } catch (Exception $e) {
            
            throw $e;
        }
    }

    /**
     * check user exists
     *
     * @param string|int $user
     * @param string|int $group_id
     * @return boolean
     */
    public static function isUserExists($user, $group_id) {
        return VicidialInboundGroupAgent::where("user", $user)->where("group_id", $group_id)->count();
    }

}
