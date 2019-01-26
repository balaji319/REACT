<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialCallback extends Model {

    protected $connection = 'dyna';
    protected $table = 'vicidial_callbacks';
    public $primaryKey = 'callback_id';
    public $timestamps = false;
    protected $fillable = array('*');

    /**
     * Get callback list
     *
     * @param int|string $agent
     * @param string $agent_type
     * @param int|string $search
     * @param int $limit
     * @return \Illuminate\Support\Collection
     */
    public static function findAll($data, $search = NULL, $limit) {

        $call_back = VicidialCallBack::whereIn('status', ['ACTIVE', 'LIVE']);
        $call_back = $call_back->where($data['agent_type'], $data['agent']);
        if ($search != NULL) {
            $call_back = $call_back->where(function ($query) use ($search) {
                $query->where("lead_id", "like", "%{$search}%")
                        ->orWhere("list_id", "like", "%{$search}%")
                        ->orWhere("campaign_id", "like", "%{$search}%")
                        ->orWhere("entry_time", "like", "%{$search}%")
                        ->orWhere("callback_time", "like", "%{$search}%")
                        ->orWhere("user", "like", "%{$search}%")
                        ->orWhere("recipient", "like", "%{$search}%")
                        ->orWhere("status", "like", "%{$search}%")
                        ->orWhere("user_group", "like", "%{$search}%");
            });
        }
        $call_back = $call_back->orderBy('callback_time', 'desc');
        $call_back = $call_back->paginate($limit);
        return $call_back;
    }

    /**
     * Get all call back for agents
     * @author Harshal Pawar.
     * @return type
     * unused for now.
     */
    public static function getAll($fields = '', $agent = '', $search = '', $page_size = '') {

        return VicidialCallback::whereIn('status', ['ACTIVE', 'LIVE'])
                        ->where('user', $agent)
                        ->where(function($query) use ($search) {
                            $query->where('lead_id', 'like', $search)
                            ->orWhere('list_id', 'like', $search)
                            ->orWhere('campaign_id', 'like', $search)
                            ->orWhere('entry_time', 'like', $search)
                            ->orWhere('callback_time', 'like', $search)
                            ->orWhere('user', 'like', $search)
                            ->orWhere('recipient', 'like', $search)
                            ->orWhere('status', 'like', $search)
                            ->orWhere('user_group', 'like', $search);
                        })->orderBy('callback_time', 'desc')
                        ->Paginate($page_size);
    }

    /*
     * function to find data with call back id with primary key override.
     */

    public static function getCallBack($call_back_id) {
        return VicidialCallback::where('call_back_id', $call_back_id)->get();
    }

}
