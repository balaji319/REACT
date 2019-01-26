<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialUserGroup extends Model {

    
    protected $connection = 'dyna';
    protected $table = 'vicidial_user_groups';
    public $incrementing = false;
    public $timestamps = false;
    public $primaryKey = 'user_group';

    public static function getAll($fields) {

        return VicidialUserGroup::
                        orderBy('user_group')
                        ->get($fields);
    }

    public static function getUserGroupList() {
        return VicidialUserGroup::orderBy('user_group')
                        ->get(['user_group', 'group_name']);
    }

    public static function getAllUserGroup() {
        return VicidialUserGroup::orderBy('user_group')->pluck('user_group');
    }

    public static function agentUserGroupList() {
        return VicidialUserGroup::orderBy('user_group')->get(['user_group']);     # TODO  =>  need to add where condition as per permission
    }

    public static function getUserGroup($user_group) {

        return VicidialUserGroup::select(
                        "group_name", "allowed_campaigns", "qc_allowed_campaigns", "qc_allowed_inbound_groups", "group_shifts", "forced_timeclock_login", "shift_enforcement", "agent_status_viewable_groups", "agent_status_view_time", "agent_call_log_view", "agent_xfer_consultative", "agent_xfer_dial_override", "agent_xfer_vm_transfer", "agent_xfer_blind_transfer", "agent_xfer_dial_with_customer", "agent_xfer_park_customer_dial", "agent_fullscreen", "allowed_reports", "webphone_url_override", "webphone_systemkey_override", "webphone_dialpad_override", "admin_viewable_groups", "admin_viewable_call_times"
                )->where('user_group', $user_group)->first();
    }

}
