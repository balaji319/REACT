<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\ErrorLog;
use Exception;

class YtelAdvancedListRules extends Model {

    use ErrorLog;

    protected $connection = 'dyna';
    protected $table = 'YTEL_advanced_list_rules';
    public $primaryKey = 'advanced_list_rule_id';
    public $timestamps = false;
    protected $fillable = array('*');

//    public $incrementing = false;

    public static function getAll() {
        return YtelAdvancedListRules::
                all(['from_list_id', 'from_campaign_id', 'from_list_status', 'to_list_id', 'to_list_status', 'interval', 'active', 'last_run', 'next_run', 'last_update_count']);
    }

    /**
     * Find all list rules
     *
     * @param int $limit
     * @param string $search
     * @return \Illuminate\Support\Collection
     * @throws Exception
     */
    public static function findAll($limit, $search) {
        try {
            $list_rules = YtelAdvancedListRules::select('advanced_list_rule_id', 'from_list_id', 'from_campaign_id', 'from_list_status', 'from_entry_datetime', 'to_list_id', 'to_list_status', 'interval', 'active', 'last_run', 'next_run', 'last_update_count');
            if ($search != null) {
                $list_rules = $list_rules->where(function ($query) use ($search) {
                    $query->where('advanced_list_rule_id', 'like', "%{$search}%")
                            ->orWhere('from_list_id', 'like', "%{$search}%")
                            ->orWhere('from_campaign_id', 'like', "%{$search}%")
                            ->orWhere('from_list_status', 'like', "%{$search}%")
                            ->orWhere('from_entry_datetime', 'like', "%{$search}%")
                            ->orWhere('to_list_id', 'like', "%{$search}%")
                            ->orWhere('to_list_status', 'like', "%{$search}%")
                            ->orWhere('interval', 'like', "%{$search}%")
                            ->orWhere('active', 'like', "%{$search}%")
                            ->orWhere('last_run', 'like', "%{$search}%")
                            ->orWhere('next_run', 'like', "%{$search}%")
                            ->orWhere('last_update_count', 'like', "%{$search}%");
                });
            }
            $list_rules = $list_rules->paginate($limit);
            return $list_rules;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.YtelAdvancedListRulesModel'), $e);
            throw $e;
        }
    }

}
