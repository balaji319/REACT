<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\ErrorLog;
use Exception;

class VicidialInboundDid extends Model {

    use ErrorLog;

    protected $connection = 'dyna';
    protected $table = 'vicidial_inbound_dids';
    protected $primaryKey = 'did_id';
    public $timestamps = false;
    public $fillable = [
        'did_id',
        'did_pattern',
        'did_description',
        'did_active',
        'did_route',
        'extension',
        'exten_context',
        'voicemail_ext',
        'phone',
        'server_ip',
        'user',
        'user_unavailable_action',
        'user_route_settings_ingroup',
        'group_id',
        'call_handle_method',
        'agent_search_method',
        'list_id',
        'campaign_id',
        'phone_code',
        'menu_id',
        'record_call',
        'filter_inbound_number',
        'filter_phone_group_id',
        'filter_url',
        'filter_action',
        'filter_extension',
        'filter_exten_context',
        'filter_voicemail_ext',
        'filter_phone',
        'filter_server_ip',
        'filter_user',
        'filter_user_unavailable_action',
        'filter_user_route_settings_ingroup',
        'filter_group_id',
        'filter_call_handle_method',
        'filter_agent_search_method',
        'filter_list_id',
        'filter_campaign_id',
        'filter_phone_code',
        'filter_menu_id',
        'filter_clean_cid_number',
        'custom_one',
        'custom_two',
        'custom_three',
        'custom_four',
        'custom_five',
        'user_group',
        'filter_dnc_campaign',
        'filter_url_did_redirect',
    ];

    /**
     * List of numbers
     *
     * @param array $campaign_id
     * @param string|int $search
     * @param int $limit
     * @return \Illuminate\Support\Collection
     * @throws Exception
     */
    public static function numbersList($campaign_id = [], $search, $limit) {
        try {
            $numbers = VicidialInboundDid::select("did_id", "did_pattern", "did_description", "did_active", "did_route", "user", "extension", "voicemail_ext", "phone", "group_id", "menu_id");
            if ($search != NULL) {
                $numbers = $numbers->where(function ($query) use ($search) {
                    $query->where("did_pattern", "like", "%{$search}%")
                            ->orWhere("did_description", "like", "%{$search}%")
                            ->orWhere("did_active", "like", "%{$search}%")
                            ->orWhere("did_route", "like", "%{$search}%")
                            ->orWhere("user", "like", "%{$search}%")
                            ->orWhere("extension", "like", "%{$search}%")
                            ->orWhere("voicemail_ext", "like", "%{$search}%")
                            ->orWhere("phone", "like", "%{$search}%")
                            ->orWhere("group_id", "like", "%{$search}%")
                            ->orWhere("menu_id", "like", "%{$search}%");
                });
            }
            $numbers = $numbers->where(function ($query) use ($campaign_id) {
                $query->whereIn('campaign_id', $campaign_id)
                        ->orWhereNull('campaign_id');
            });
            $numbers = $numbers->orderBy('did_pattern');
            return $numbers->paginate($limit);
        } catch (Exception $e) {
            
            throw $e;
        }
    }

    /**
     * Get numbers by group_id.
     *
     * @param string|int $group_id
     * @param int $limit
     * @return \Illuminate\Support\Collection
     */
    public static function numbersByGroupId($group_id, $search, $limit) {
        try {
            $numbers = VicidialInboundDid::select("did_id", "did_pattern", "did_description")
                    ->where("did_route", "IN_GROUP")
                    ->where("group_id", $group_id);
            if ($search != NULL) {
                $numbers = $numbers->where(function ($query) use ($search) {
                    $query->where("did_id", "like", "%{$search}%")
                            ->orWhere("did_pattern", "like", "%{$search}%")
                            ->orWhere("did_description", "like", "%{$search}%");
                });
            }
            $numbers = $numbers->paginate($limit);
            return $numbers;
        } catch (Exception $e) {
            
            throw $e;
        }
    }

    public static function vicidialInboundDids($selected_groups) {
        return VicidialInboundDid::orderBy('did_id')
                        ->whereIn('did_pattern', $selected_groups)
                        ->get(['did_id', 'did_description']);
    }

    public function getAll($filds, $group_id) {
        $list = VicidialInboundDid::where('group_id', $group_id)->where('did_route', 'IN_GROUP')->get($filds);
        return $list;
    }


    public function getData($from_id) {
     
         $result = VicidialInboundDid::where('did_pattern',$from_id)->first();

        $data['did_description'] = $result->did_description;
        $data['did_active'] = $result->did_active;
        $data['did_route'] = $result->did_route;
        $data['extension'] = $result->extension;
        $data['exten_context'] = $result->exten_context;
        $data['voicemail_ext'] = $result->voicemail_ext;
        $data['phone'] = $result->phone;
        $data['server_ip'] = $result->server_ip;
        $data['user'] = $result->user;
        $data['user_unavailable_action'] = $result->user_unavailable_action;
        $data['user_route_settings_ingroup'] = $result->user_route_settings_ingroup;
        $data['group_id'] = $result->group_id;
        $data['call_handle_method'] = $result->call_handle_method;
        $data['agent_search_method'] = $result->agent_search_method;
        $data['list_id'] = $result->list_id;
        $data['campaign_id'] = $result->campaign_id;
        $data['phone_code'] = $result->phone_code;
        $data['menu_id'] = $result->menu_id;
        $data['record_call'] = $result->record_call;
        $data['filter_inbound_number'] = $result->filter_inbound_number;
        $data['filter_phone_group_id'] = $result->filter_phone_group_id;
        $data['filter_url'] = $result->filter_url;
        $data['filter_action'] = $result->filter_action;
        $data['filter_extension'] = $result->filter_extension;
        $data['filter_exten_context'] = $result->filter_exten_context;
        $data['filter_voicemail_ext'] = $result->filter_voicemail_ext;
        $data['filter_phone'] = $result->filter_phone;
        $data['filter_server_ip'] = $result->filter_server_ip;
        $data['filter_user'] = $result->filter_user;
        $data['filter_user_unavailable_action'] = $result->filter_user_unavailable_action;
        $data['filter_user_route_settings_ingroup'] = $result->filter_user_route_settings_ingroup;
        $data['filter_group_id'] = $result->filter_group_id;
        $data['filter_call_handle_method'] = $result->filter_call_handle_method;
        $data['filter_agent_search_method'] = $result->filter_agent_search_method;
        $data['filter_list_id'] = $result->filter_list_id;
        $data['filter_campaign_id'] = $result->filter_campaign_id;
        $data['filter_phone_code'] = $result->filter_phone_code;
        $data['filter_menu_id'] = $result->filter_menu_id;
        $data['filter_clean_cid_number'] = $result->filter_clean_cid_number;
        $data['custom_one'] = $result->custom_one;
        $data['custom_two'] = $result->custom_two;
        $data['custom_three'] = $result->custom_three;
        $data['custom_four'] = $result->custom_four;
        $data['custom_five'] = $result->custom_five;
        $data['user_group'] = $result->user_group;
        $data['filter_dnc_campaign'] = $result->filter_dnc_campaign;
        $data['filter_url_did_redirect'] = $result->filter_url_did_redirect;

        return $data;

    }

    public function checkDuplicate($new_id) {
        $result = VicidialInboundDid::where('did_pattern',$new_id)->first();
        return $result;
    }

    public static function checkIsExist($from_id) {
         $result = VicidialInboundDid::where('did_pattern',$from_id)->first();
        return $result;
    }

    public static function getDidWithSelectedPattern($selected_groups) {
        return VicidialInboundDid::whereIn('did_pattern', $selected_groups)
                        ->get(['did_id']);
    }
    public static function getAllowedChangeFields()
    {
       $allowedChangeFields = [
                    'did_route',
                    'list_id',
                    'group_id',
                    'call_handle_method',
                    'filter_inbound_number',
                    'filter_phone_group_id',
                    'user',
                    'extension',
                    'voicemail_ext',
                    'phone',
                    'campaign_id',
                    'menu_id',
                    'filter_url',
                    'filter_url_did_redirect',
                    'filter_dnc_campaign'
                ];
                return $allowedChangeFields;
    }


    public static function getList($menu_id)
    {
        try {

            $list=VicidialInboundDid::where('menu_id',$menu_id)->where('did_route','CALLMENU')->get(['did_id','did_pattern','did_description']);
            return $list;
        } catch (Exception $e) {
            
            throw $e;
        }

    }


}
