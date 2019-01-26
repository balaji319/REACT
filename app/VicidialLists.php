<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\Traits\ErrorLog;
use Exception;

class VicidialLists extends Model {

    use ErrorLog;

    const ACCESS_CONTROL_TYPE = ACCESS_TYPE_CAMPAIGN;
    const ACCESS_CONTROL_PARENT_KEY = 'campaign_id';
    const ACCESS_CONTROL_KEY = 0;

    protected $connection = 'dyna';
    protected $table = 'vicidial_lists';
    public $primaryKey = 'list_id';
    public $timestamps = false;
    protected $fillable = array('*');
    public $incrementing = false;

    /**
     * Find list by campaign
     *
     * @param array $data
     * @return \Illuminate\Http\Response
     */
    public static function findByCampaignId($data) {
        try {
            $lists = VicidialLists::rightJoin('vicidial_list as ls', 'ls.list_id', 'vicidial_lists.list_id');
            $lists = $lists->select("ls.list_id", "list_name", "list_description", "active", "list_lastcalldate", "campaign_id");
            if ((boolean) $data['count']) {
                $lists = $lists->selectRaw("COUNT(*) as tally");
            } else {
                $lists = $lists->selectRaw(" 'X' as tally");
            }
            $lists = $lists->selectRaw("CASE active WHEN 'Y' THEN true ELSE false END as is_check");
            $lists = $lists->selectRaw("DATE_FORMAT(expiration_date,'%Y%m%d') as date");
            $lists = $lists->where('campaign_id', $data['campaign_id']);
            if (isset($data['order_by']) && $data['order_by']) {
                $lists = $lists->orderBy($data['order_by']);
            }
            $lists = $lists->groupBy('ls.list_id')->distinct();
            $lists = $lists->get();
            return $lists;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.VicidialListsModel'), $e);
            throw $e;
        }
    }

    /**
     * Data list
     *
     * @param array $data
     * @return \Illuminate\Support\Collection
     * @throws \App\Exception
     */
    public static function dataList($data) {
        try {
            $search = $data['search'];
            $lists = VicidialLists::select('list_id', 'list_name', 'list_description', 'list_changedate', 'list_lastcalldate', 'campaign_id', 'active');
            if ($search != null) {
                $lists = $lists->where(function ($query) use ($search) {
                    $query->where('list_id', 'like', "%{$search}%")
                            ->orWhere('list_name', 'like', "%{$search}%")
                            ->orWhere('list_description', 'like', "%{$search}%")
                            ->orWhere('list_changedate', 'like', "%{$search}%")
                            ->orWhere('list_lastcalldate', 'like', "%{$search}%")
                            ->orWhere('campaign_id', 'like', "%{$search}%")
                            ->orWhere('active', 'like', "%{$search}%");
                });
            }
            $lists = $lists->paginate($data['limit']);
            return $lists;
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.VicidialListsModel'), $e);
            throw $e;
        }
    }

    public static function getAll($fields) {
        return VicidialLists::
                        orderBy('list_id')
                        ->get($fields);
    }

    public static function getActiveCount() {
        return VicidialLists::
                        select(DB::raw("count(active) as count"), 'active')
                        ->groupBy('active')
                        ->get();
    }

    public static function getCustomFiels() {
        return VicidialLists::leftJoin('vicidial_lists_fields', 'vicidial_lists.list_id', 'vicidial_lists_fields.list_id')
                        ->groupBy('vicidial_lists.list_id', 'vicidial_lists.list_name')
                        ->select('*')
                        ->get();
    }

    public static function setListActive($value, $list_id) {
        return VicidialLists::where('list_id', $list_id)->update(['active' => $value]);
    }

    public static function getListById($id, $fields) {
        return VicidialLists::
                        where('list_id', $id)
                        ->get($fields);
    }

    public static function getGmtOffsetForListReport($id, $fields) {
        return VicidialLists::
                        groupBy('gmt_offset_now')
                        ->where('list_id', $id)
                        ->orderBy('gmt_offset_now')
                        ->get($fields);
    }

    public static function getCampaignStatuslist($group) {
        try {
            return VicidialLists::select(DB::raw("DISTINCT list_id AS list_id ,list_name , active"))->where('campaign_id', $group)->orderBy('list_id')->get();
        } catch (Exception $e) {

        }
    }

    public static function getCampaignListId($active, $list) {
        return VicidialLists::select(DB::raw('list_id'))
                        ->whereIn('active', $active)
                        ->whereIn('campaign_id', $list)
                        ->get()->toArray();
    }

    public static function getCampaignListSelectedId($active, $selectedgroups) {
        return VicidialLists::select(DB::raw('list_id'))
                        ->whereIn('active', $active)
                        ->where('campaign_id', $selectedgroups)
                        ->get()->toArray();
    }
    public static function getDate($limit,$search)
    {
         $list= VicidialLists::select('list_id','list_name','active','campaign_id');

         if ($search != NULL) {
                $list = $list->where(function ($query) use ($search) {
                    $query->where("list_id", "like", "%{$search}%")
                            ->orWhere("list_name", "like", "%{$search}%");
                });
            }

       $list=$list->orderBy('list_id')->paginate($limit);
       return $list;

    }

}
