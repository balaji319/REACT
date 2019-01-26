<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\ErrorLog;

class VicidialCallMenu extends Model {

    use ErrorLog;

    protected $connection = 'dyna';
    protected $table = 'vicidial_call_menu';

    protected $primaryKey = 'menu_id';
    public $incrementing = false;
    public $timestamps = false;

    
     protected $fillable = ['menu_id','menu_name','user_group','menu_prompt','menu_timeout','menu_timeout_prompt','menu_invalid_prompt','menu_repeat','menu_time_check','call_time_id','track_in_vdac','tracking_group','dtmf_log','dtmf_field'];

   
    /**
     * Get the call menu options associated with the call menu.
     */
    public function options() {
        return $this->hasMany(VicidialCallMenuOption::class, "menu_id", "menu_id");
    }

    /**
     * Get call menus by group_id.
     *
     * @param string|int $group_id
     * @param int $limit
     * @return \Illuminate\Support\Collection
     */
    public static function callMenuByGroupId($group_id, $search, $limit) {
        try {

            $call_menus = VicidialCallMenu::select('vicidial_call_menu.menu_id', 'menu_name')
                    ->join('vicidial_call_menu_options', 'vicidial_call_menu.menu_id', 'vicidial_call_menu_options.menu_id')
                    ->where('option_route', 'INGROUP')
                    ->where('option_route_value', $group_id);
            if ($search != NULL) {
                $call_menus = $call_menus->where(function ($query) use ($search) {
                    $query->where("vicidial_call_menu.menu_id", "like", "%{$search}%")
                            ->orWhere("menu_name", "like", "%{$search}%");
                });
            }
            $call_menus = $call_menus->distinct();
            $call_menus = $call_menus->paginate($limit);
            return $call_menus;
        } catch (Exception $e) {

            throw $e;
        }
    }

    /**
     * Get all call menus
     *
     * @param array $userGroup
     * @param string|int $search
     * @param int $limit
     * @return \Illuminate\Support\Collection
     */
    public static function callMenuList($userGroup, $search, $limit) {

        try {

            $call_menus = VicidialCallMenu::select('menu_id', 'menu_name', 'user_group', 'menu_prompt', 'menu_timeout');

            if ($search != NULL) {
                $call_menus = $call_menus->where(function ($query) use ($search) {
                    $query->where("menu_id", "like", "%{$search}%")
                            ->orWhere("menu_name", "like", "%{$search}%")
                            ->orWhere("user_group", "like", "%{$search}%")
                            ->orWhere("menu_prompt", "like", "%{$search}%")
                            ->orWhere("menu_timeout", "like", "%{$search}%");
                });
            }
            $call_menus = $call_menus->whereIn("user_group", $userGroup);
            $call_menus = $call_menus->orderBy("menu_id");

            $call_menus = $call_menus->withCount('options as count');

            $call_menus = $call_menus->paginate($limit);
            return $call_menus;
        } catch (Exception $e) {

            throw $e;
        }
    }
     /**
     * Set reserved Words for add call menu Id.
     *
     * @param $field

     */
     public function reservedWords($field) {
        try {

            $keywords = array(
                "vicidial",
                "vicidial-auto",
                "general",
                "globals",
                "default",
                "trunkinbound",
                "loopback-no-log",
                "monitor_exit",
                "monitor"
            );

            return in_array($field, $keywords);
        } catch (Exception $e) {

            throw $e;
        }
    }

    public static function getData($group_id)
    {
        try{

             $list = VicidialCallMenu::join('vicidial_call_menu_options', 'vicidial_call_menu.menu_id', '=', 'vicidial_call_menu_options.menu_id')->select('vicidial_call_menu.menu_id', 'vicidial_call_menu.menu_name')->where('vicidial_call_menu_options.option_route_value', $group_id)->where('option_route', 'INGROUP')->get();
             return $list;
        } catch (Exception $e) {

            throw $e;
        }
    }

}
