<?php

namespace App\Traits;

use \Helper\Constants;
use App\X5Contact;
use App\X5ContactAccess;
use App\X5ContactX5ContactGroup;
use App\Cluster;
use App\VicidialCampaign;
use App\VicidialUser;
use App\VicidialUserGroup;
use App\VicidialInboundGroup;
use App\X5ContactGroup;
use App\VicidialCallMenu;
use App\VicidialList;
use App\SystemComponent;
use App\X5Log;
use Exception;

/**
 * Access Control related helper methods
 */
trait AccessControl {

    /**
     * Access Type and their models and overwrite
     *
     * @var array
     */
    public $ids = array();
    private $action2Map = array(
        'VICILIST' => 'list',
        'VICIUSER' => 'user',
        'VICIUSERGROUP' => 'user group',
        'VICIINBOUNDGROUP' => 'inbound queue',
        'VICICAMPAIGN' => 'campaign',
        'VICIVOICEMAIL' => 'voicemail',
        'VICILEADFILTER' => 'lead filter',
        'VICICUSTOMLIST' => 'custom list',
        'VICICAMPAIGNLISTMIX' => 'campaign list mix'
    );
    private $customListShowMethods = [
        'ajaxUpdateRow',
        'ajaxCopyCustomFieldsList',
        'modify_field_function'
    ];

    /**
     * Select all options that the system uses.
     * @array string
     */
    private $selectAllOptions = [
        '-ALL-',
        '--ALL--',
        '---ALL---',
        'ALL',
        'All',
        'ALLCAMPAIGN',
        '-ALL-CAMPAIGNS-',
        '-ALL USERS-',
        '--ALL-GROUPS--'
    ];
    private $type_list = [
        ACCESS_TYPE_CAMPAIGN => [
            'model' => 'App\VicidialCampaign',
            'accessOverwrite' => [
                'SYSTEM_INTERNAL' => [
                    ACCESS_CREATE => true,
                    ACCESS_READ => false,
                    ACCESS_UPDATE => false,
                    ACCESS_DELETE => true
                ]
            ]
        ],
        ACCESS_TYPE_USER => [
            'model' => 'App\VicidialUser',
            'hide' => [
                '6666',
                '101'
            ],
            'accessOverwrite' => [
                '6666' => [
                    ACCESS_CREATE => false,
                    ACCESS_READ => false,
                    ACCESS_UPDATE => false,
                    ACCESS_DELETE => false
                ],
                '101' => [
                    ACCESS_CREATE => false,
                    ACCESS_READ => false,
                    ACCESS_UPDATE => false,
                    ACCESS_DELETE => false
                ]
            ]
        ],
        ACCESS_TYPE_USERGROUP => [
            'model' => 'App\VicidialUserGroup',
            'hide' => [
            ],
            'accessOverwrite' => [
                'ADMIN' => [
                    ACCESS_CREATE => false,
                    ACCESS_DELETE => false
                ],
                'AGENTS' => [
                    ACCESS_CREATE => false,
                    ACCESS_DELETE => false
                ]
            ]
        ],
        ACCESS_TYPE_RECORDING => [
            'model' => 'App\VicidialUserGroup',
            'hide' => [
            ],
            'accessOverwrite' => [
                '10' => [
                    ACCESS_CREATE => false,
                    ACCESS_READ => true,
                    ACCESS_UPDATE => false,
                    ACCESS_DELETE => false
                ],
            ]
        ],
        ACCESS_TYPE_INGROUP => [
            'model' => 'App\VicidialInboundGroup',
            'hide' => [
                'AGENTDIRECT',
                'NONE'
            ],
            'accessOverwrite' => [
                'AGENTDIRECT' => [
                    ACCESS_CREATE => false,
                    ACCESS_READ => true,
                    ACCESS_UPDATE => true,
                    ACCESS_DELETE => false
                ],
                'NONE' => [
                    ACCESS_CREATE => false,
                    ACCESS_READ => true,
                    ACCESS_UPDATE => false,
                    ACCESS_DELETE => false
                ],
                'CALLMENU' => [
                    ACCESS_CREATE => false,
                    ACCESS_READ => true,
                    ACCESS_UPDATE => true,
                    ACCESS_DELETE => false
                ],
                'XMLPULL' => [
                    ACCESS_CREATE => false,
                    ACCESS_READ => true,
                    ACCESS_UPDATE => true,
                    ACCESS_DELETE => false
                ]
            ]
        ],
        ACCESS_TYPE_X5_CONTACT_GROUP => [
            'model' => 'App\X5ContactGroup'
        ],
        ACCESS_TYPE_CALLMENU => [
            'model' => 'App\VicidialCallMenu',
            'accessOverwrite' => [
                'default---agent' => [
                    ACCESS_CREATE => false,
                    ACCESS_READ => true,
                    ACCESS_UPDATE => true,
                    ACCESS_DELETE => false
                ],
                'defaultlog' => [
                    ACCESS_CREATE => false,
                    ACCESS_READ => true,
                    ACCESS_UPDATE => true,
                    ACCESS_DELETE => false
                ]
            ]
        ],
        ACCESS_TYPE_LIST => [
            'model' => 'App\VicidialLists',
            'show' => [
                'SYSTEM_INTERNAL'
            ],
            'accessOverwrite' => [
                '999' => [
                    ACCESS_CREATE => false,
                    ACCESS_READ => true,
                    ACCESS_UPDATE => true,
                    ACCESS_DELETE => false
                ],
                '998' => [
                    ACCESS_CREATE => false,
                    ACCESS_READ => true,
                    ACCESS_UPDATE => true,
                    ACCESS_DELETE => false
                ],
                'SYSTEM_INTERNAL' => [
                    ACCESS_CREATE => false,
                    ACCESS_READ => true,
                    ACCESS_UPDATE => true,
                    ACCESS_DELETE => false
                ]
            ]
        ],
        ACCESS_TYPE_SYSTEM_COMPONENT => [
            'model' => 'App\SystemComponent',
        ]
    ];
    private $accesses = [
        ACCESS_CREATE,
        ACCESS_READ,
        ACCESS_UPDATE,
        ACCESS_DELETE
    ];
    private $additionalAllowedOptions = [
        '--NOT-LOGGED-IN-AGENTS--',
        '--CAMPAIGN-AGENTS--',
        'NONE',
    ];

    /**
         * Display permission list in the UI (Settings) #/admin/permission/user/edit/* and #/admin/permission/userGroup/edit/*
         * @var array
         */
        private $permission_list = [
            [
                'type' => ACCESS_TYPE_CAMPAIGN,
                'name' => 'Campaign',
                'order' => 25
            ],
            [
                'type' => ACCESS_TYPE_USERGROUP,
                'name' => 'Agent Group',
                'order' => 50
            ],
            [
                'type' => ACCESS_TYPE_INGROUP,
                'name' => 'Inbound Queue',
                'order' => 100
            ],
            [
                'type' => ACCESS_TYPE_RECORDING,
                'name' => 'Recordings',
                'order' => 125
            ]

        ];

    /**
     * Access List
     *
     * @param  [int] access_type
     * @param [sint] link_id
     * @param [int] $id x5_contact_id|x5_contact_group_id
     * @param [boolean] access_overwrite
     * @param [int] access_model
     * @param [string] contact_id
     * @param [string] company_id
     * @response [obj]
     */
    public function generateAccessList($access_type, $link_id, $id, $access_overwrite = false, $access_model = false, $company_id) {

        // Only do access overwrite to non selective access model
        if ((!$access_model || $access_model === config('constants.access_model_contact')) && !$id) {
            $id = $id;
        }

        //
        if (!$access_model || $access_model !== config('constants.access_model_contactgroup')) {

            //get superadmin count
            $is_super_admin_count = X5Contact::getIsSuperAdminCount($company_id, $id);

            $cntct_grp_id = X5ContactX5ContactGroup::where('x5_contact_id', $id)->pluck('x5_contact_group_id');

            $cntct_grp_id = end($cntct_grp_id);
            $cntct_grp_id = $cntct_grp_id[0];

            if ($is_super_admin_count > 0) {
                $access_overwrite = config('constants.access_overwrite');
            } else { //// User doesnt belong to any groups will give full access
                if ($cntct_grp_id->isEmpty()) {
                    $access_overwrite = config('constants.access_overwrite');
                }
            }
            //--need to work from here
            switch ($access_overwrite) {
                case config('constants.access_overwrite'):
                    $permission_list = array_keys($this->type_list);

                    foreach ($permission_list as $each_permission_key) {

                        $accesses_formatted[$each_permission_key][ACCESS_LINKID_ALL] = [
                            config('constants.access_create') => true,
                            config('constants.access_read') => true,
                            config('constants.access_update') => true,
                            config('constants.access_delete') => true
                        ];
                    }

                    break;
            }


            if (isset($accesses_formatted)) {
                return $accesses_formatted;
            }
        }

        if (!is_array($link_id) && $link_id) {
            $link_id = [$link_id];
        }

        $search_conditions = [];
        $search_conditions_opt = [];

        if ($link_id) {
            $search_conditions = ['link_id' => ACCESS_LINKID_ALL
            ];
            $search_conditions_opt = ['link_id' => $link_id
            ];
        } else {
            $search_conditions = [];
        }

        if ($access_type) {
            $access_type_condition = ['type' => $access_type];
        } else {
            $access_type_condition = [];
        }


        // Access Model
        $access_model_conditions = [];
        $access_model_conditions_opt = [];


        switch ($access_model) {
            case ACCESS_MODEL_CONTACT:
                $access_model_conditions = [
                    'model' => ACCESS_MODEL_CONTACT,
                    'foreign_key' => $id
                ];
                break;

            case ACCESS_MODEL_CONTACT_BY_CONTACTGROUP:
                // Get contact group...
                $contact_group = $cntct_grp_id;

                if (empty($contact_group)) {
                    return [];
                }

                $access_model_conditions = [
                    'model' => ACCESS_MODEL_CONTACTGROUP,
                    'foreign_key' => $contact_group
                ];
                break;

            case ACCESS_MODEL_CONTACTGROUP:
                $access_model_conditions = [
                    'model' => ACCESS_MODEL_CONTACTGROUP,
                    'foreign_key' => $id
                ];
                break;

            default:
                // Get contact group...
                $contact_group = $cntct_grp_id;

                $access_model_conditions = [
                    'model' => ACCESS_MODEL_CONTACT,
                    'foreign_key' => $id
                ];

                $access_model_conditions_opt = [
                    'model' => ACCESS_MODEL_CONTACTGROUP,
                    'foreign_key' => $contact_group
                ];
        }

        // Check for access...
        $accesses = X5ContactAccess::where($access_type_condition)
                ->where(function ($query) use($access_model_conditions, $access_model_conditions_opt) {
                    $query->where($access_model_conditions)
                    ->orWhere($access_model_conditions_opt);
                })
                ->where(function ($query) use($search_conditions, $search_conditions_opt) {
                    $query->where($search_conditions)
                    ->orWhere($search_conditions_opt);
                })
                ->get();


        $accesses_formatted = [];

        if (!$accesses->isEmpty()) {

            //conversion into type=>[x5_cntct_acess_id] => [] array
            $accesses = $accesses->groupBy([
                'type']);


            foreach ($this->type_list as $each_type => $each_type_list) {

                $access_eachtype = $accesses->get($each_type);

                if (!is_null($access_eachtype) && !$access_eachtype->isEmpty()) {

                    //conversion into type=>[x5_cntct_acess_id] => [] array
                    $each_type_accesses = $access_eachtype->groupBy([
                        'link_id',
                        function ($item) {
                            return $item['x5_contact_access_id'];
                        },
                            ], $preserveKeys = true);

                    $each_type_accesses = $each_type_accesses->toArray();

                    foreach ($each_type_accesses as $access) {
                        $access = end($access);
                        foreach ($access as $a) {

                            // Combine both x5 admin group and x5 admin permissions.
                            if (isset($accesses_formatted[$each_type][$a['link_id']])) {
                                $accesses_formatted[$each_type][$a['link_id']][ACCESS_CREATE] = $accesses_formatted[$each_type][$a['link_id']][ACCESS_CREATE] || $a[ACCESS_CREATE];
                                $accesses_formatted[$each_type][$a['link_id']][ACCESS_READ] = $accesses_formatted[$each_type][$a['link_id']][ACCESS_READ] || $a[ACCESS_READ];
                                $accesses_formatted[$each_type][$a['link_id']][ACCESS_UPDATE] = $accesses_formatted[$each_type][$a['link_id']][ACCESS_UPDATE] || $a[ACCESS_UPDATE];
                                $accesses_formatted[$each_type][$a['link_id']][ACCESS_DELETE] = $accesses_formatted[$each_type][$a['link_id']][ACCESS_DELETE] || $a[ACCESS_DELETE];
                            } else {
                                $accesses_formatted[$each_type][$a['link_id']] = [
                                    ACCESS_CREATE => $a[ACCESS_CREATE],
                                    ACCESS_READ => $a[ACCESS_READ],
                                    ACCESS_UPDATE => $a[ACCESS_UPDATE],
                                    ACCESS_DELETE => $a[ACCESS_DELETE]
                                ];
                            }
                        }
                    }


                    if (($each_type == 10 && isset($each_type_accesses) && count($each_type_accesses) <= 1)) {
                        $accesses_formatted[$each_type][ACCESS_LINKID_ALL] = [
                            ACCESS_CREATE => false,
                            ACCESS_READ => true,
                            ACCESS_UPDATE => false,
                            ACCESS_DELETE => false
                        ];
                    }
                } else {
                    $accesses_formatted[$each_type] = [];
                }

                if (isset($each_type_list['accessOverwrite'])) {
                    foreach ($each_type_list['accessOverwrite'] as $link_id => $each_access_overwrite) {
                        foreach ($this->accesses as $each_access) {
                            if (isset($each_access_overwrite[$each_access])) {
                                $accesses_formatted[$each_type][$link_id][$each_access] = $each_access_overwrite[$each_access];
                            }
                        }
                    }
                }

                if (!isset($accesses_formatted[$each_type]['_'])) {
                    $accesses_formatted[$each_type]['_'] = [
                        ACCESS_CREATE => false,
                        ACCESS_READ => false,
                        ACCESS_UPDATE => false,
                        ACCESS_DELETE => false,
                    ];
                }
            }
        } else {


            foreach ($this->type_list as $each_type => $each_type_list) {


                $accesses_formatted[$each_type]['_'] = [
                    ACCESS_CREATE => false,
                    ACCESS_READ => false,
                    ACCESS_UPDATE => false,
                    ACCESS_DELETE => false,
                ];

                if ($each_type == 10) {
                    $accesses_formatted[$each_type]['_'] = [
                        ACCESS_CREATE => false,
                        ACCESS_READ => true,
                        ACCESS_UPDATE => false,
                        ACCESS_DELETE => false
                    ];
                }
                if (isset($each_type_list['accessOverwrite'])) {
                    foreach ($each_type_list['accessOverwrite'] as $link_id => $each_access_overwrite) {
                        foreach ($this->accesses as $each_access) {
                            if (isset($each_access_overwrite[$each_access])) {
                                $accesses_formatted[$each_type][$link_id][$each_access] = $each_access_overwrite[$each_access];
                            }
                        }
                    }
                }
            }
        }

        return $accesses_formatted;
    }

    /**
     * Access List
     *
     * @param  [int] type
     * @param [string] permission
     * @param [array] $access
     * @response [obj]
     */
    public function generateListByAccess($type, $permission, $access, $current_company_id) {

        $access = isset($access[$type]) ? $access[$type] : [];

        if (empty($access) || !$access) {
            return [''];
        }

        $list = array_keys(array_filter($access, function($v) use($permission) {
                    return $v[$permission];
                }));

        if (empty($list)) {
            return [''];
        }

        // get the list of all IDs if ALL is in the list
        if (in_array(ACCESS_LINKID_ALL, $list, true)) {
            $model = trim($this->type_list[$type]['model']);
            $model = new $model();
            $prim_key = $model->getKeyName();

            if (in_array($type, [ACCESS_TYPE_X5_CONTACT_GROUP])) {
                $list = $model::where('company_id', $current_company_id)->pluck($prim_key);
                $list = $list->toArray();
            } else {
                $list = $model::pluck($prim_key);
                $list = $list->toArray();
            }

            if ($permission === ACCESS_CREATE) {
                $list[] = ACCESS_LINKID_ALL;
            }

            if (isset($this->type_list[$type]['accessOverwrite'])) {
                foreach ($this->type_list[$type]['accessOverwrite'] as $link_id => $each_access_overwrite) {
                    if (isset($each_access_overwrite[$permission]) && !$each_access_overwrite[$permission]) {
                        if (($key = array_search($link_id, $list)) !== false) {
                            unset($list[$key]);
                        }
                    }
                }
            }
        }
        return $list;
    }

    /**
     * Get Permission List via Access Type : Helper Method
     * @param $access_type (int)
     * @param $current_company_id(string) comapany id respective client db is selected
     * @param $user(object)
     * @return [json] permission list
     */
    public function getPermissionByAccessTypeHelper($access_type, $permission, $current_company_id, $user) {
        try {

            $access = $this->generateAccessList($access_type, [], $user->x5_contact_id, $access_overwrite = false, $access_model = false, $user->company_id);

            return $this->generateListByAccess($access_type, $permission, $access, $current_company_id);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.access_control'), $e);
            throw new Exception($e->getMessage(), 401);
        }
    }

    public function getListByAccess($access_type, $permission, $userinfo = null) {
        $access = $this->getAccessList($access_type, '', '', $userinfo);
        return $this->generateListByAccess($access_type, $permission, $access, $userinfo->company_id);
    }

    public function getAccessList($access_type, $id = [], $x5ContactId = null, $userinfo = null) {
        return $this->generateAccessList($access_type, $id, $userinfo->x5_contact_id, '', '', $userinfo->company_id);
    }

    public function load($array_of_ids) {
        foreach ($array_of_ids as $id) {
            $this->ids[$id] = true;
        }
    }

    public function convertToPhoneAudio($file) {

        $ffmpegbin = \Config::get("configs.ffmpegbin");
        $filebin = \Config::get("configs.filebin");
        $sox = \Config::get("configs.sox");



        if (file_exists($file) && file_exists($ffmpegbin)) {
            // test file type
            $cmd = $filebin . " -b " . $file;
            exec($cmd, $dumpout, $exittype);
            $dumpout = implode(" ", $dumpout);
            if ($exittype > 0) {

                $message = "Failed to determine file type " . $cmd . " " . $dumpout;
                return response()->json(['status' => 400, 'data' => $agents, 'msg' => $message], 400);
            } else { // try to convert file..
                //[5:40:11 PM] Brian @Ytel: Change from -acodec pcm_mulaw to -acodec pcm_s16le
                $cmd = $this->ffmpegbin . " -i " . $file . " -ar 8000 -ac 1 -ab 32 -acodec pcm_s16le " . $file . "X.wav 2>&1";
                exec($cmd, $dumpout, $exittype);
                if ($exittype > 0) {
                    $message = "Failed to convert audio file " . $cmd . " " . json_encode($dumpout);

                    die(json_encode(array('status' => 0, 'message' => $message)));
                }

                $cmd = $sox . " {$file}X.wav -e signed-integer {$file}XX.wav";
                exec($cmd, $dumpout, $exittype);
                if ($exittype > 0) {
                    $message = "Failed to convert update file type " . $cmd . " " . json_encode($dumpout);
                    die(json_encode(array('status' => 0, 'message' => $message)));
                } else {
                    unlink($file . "X.wav");
                }

                $newfilename = preg_replace('/\.\w+$/', '', $file);
                $newfilename = $newfilename . ".wav";
                unlink($file);
                if (!rename($file . "XX.wav", $newfilename)) {
                    $message = "Failed to rename file!";
                    die(json_encode(array('status' => 0, 'message' => $message)));
                }

                return($newfilename);
            }
        } else {
            return($file);
        }
    }

    public function getLog($user, $inputs) {

        date_default_timezone_set('UTC');

        $X5Log = new X5Log;

        $X5Log->recursive = -1;
        $query = '';
        $outputLogs = [];
        $limit = $request->get('limit') ?: \Config::get("configs.pagination_limit");

        $main = $options = array();
        $query = X5Log::select(['x5_logs.*', 'X5Contact.username', 'DbColSetting.vici_label', 'DbColSetting.alian'])
                ->leftJoin('x5_contacts AS X5Contact', 'x5_logs.x5_contact_id', '=', 'X5Contact.x5_contact_id')
                ->leftJoin('db_col_settings AS DbColSetting', 'x5_logs.field', '=', 'DbColSetting.vici_db_field')
                ->whereNull('x5_logs.ytel_user_id')
                ->where('x5_logs.db_id', $user->db_last_used)
                ->where('x5_logs.success', TRUE)
                ->where(function ($query) {
            $query->where('x5_logs.field', 'NOT LIKE', '%changedate%')
            ->orwhereNull('x5_logs.field');
        });


        if (!empty($inputs['event'])) {


            $event = explode('-', strtoupper(filter_var($inputs['event'], FILTER_SANITIZE_SPECIAL_CHARS)));

            $query = $query->where('x5_logs.action_1', $event[0]);

            $actionMap = array_search(strtolower(str_replace('_', ' ', $event[1])), $this->action2Map);

            if (!$actionMap) {
                $query = $query->where('x5_logs.action_2', $event[1]);
            } else {
                $query = $query->where('x5_logs.action_2', $actionMap);
            }

            if (!empty($event[2])) {
                $query = $query->where('x5_logs.action_3', $event[2]);
                $outputLogs['action_3'] = $event[2];
            }

            $outputLogs['action_1'] = $event[0];
            $outputLogs['action_2'] = $event[1];
        }
        if (!empty($inputs['date'])) {
            $jsDateTS = strtotime($inputs['date']);
            if ($jsDateTS !== false) {
                $d = date('Y-m-d', $jsDateTS);

                $query = $query->whereBetween('x5_logs.change_datetime', [$d . " 00:00:00", $d . " 23:59:59"]);
            }
        }

        if (isset($inputs['admin'])) {
            $query = $query->where('x5_logs.x5_contact_id', filter_var($inputs['admin'], FILTER_SANITIZE_STRING));
        }


        $options = $query->orderBy('x5_logs.change_datetime', 'desc')->groupBy('x5_logs.id')->paginate($limit);

        foreach ($options as $key => $option) {

            $event = '';
            $description = '';

            $eventAction = strtolower($option->action_1);
            if (array_key_exists($option->action_2, $this->action2Map)) {
                $eventSubAction = $this->action2Map[$option->action_2];
            } else {
                if (substr($option->action_2, 0, 4) == 'VICI')
                    $eventSubAction = strtolower(substr($option->action_2, 4));
                else
                    $eventSubAction = strtolower(str_replace('_', ' ', $option->action_2));
            }

            $event = ucwords($eventAction . $eventSubAction);



            switch ($option->action_1) {
                case 'MODIFY':
                    if (!is_null($option->alian) && trim($option->alian) != '') {
                        $field = $option->alian;
                    } else if (!is_null($option->vici_label) && trim($option->vici_label) != '') {
                        $field = $option->vici_label;
                    } else {
                        $field = $option->field;
                    }
                    if (is_null($option->from_data) && is_null($option->to_data) && !is_null($option->from_data_text) && !is_null($option->to_data_text)) {
                        $description = ucfirst($eventSubAction) . $option->id_1 . " field changed from  " . str_replace('"', "'", $option->from_data_text) . "to " . str_replace('"', "'", $option->to_data_text);
                    } else {
                        $description = ucfirst($eventSubAction) . $option->id_1 . " field " . $field . " changed from " . $option->from_data . "to " . $option->to_data;
                    }
                    break;

                case 'CLONE':
                    $description = "Cloned " . $eventSubAction . " from " . $option->id_1 . $option->id_2;
                    break;

                case 'CREATE':
                    $description = "Created " . $eventSubAction . $option->id_1;
                    break;

                case 'UPLOAD':
                    $description = "Uploaded " . $eventSubAction . (($option->from_data) ? $option->from_data : $option->id_1);
                    if ($option->action_3) {
                        $description .= "to " . ucwords(strtolower(str_replace('_', ' ', $option->action_3)));
                    }
                    break;

                case 'DELETE':
                    $description = "Deleted " . $eventSubAction . (($option->from_data) ? $option->from_data : $option->id_1);
                    if ($option->action_3) {
                        $description .= "from " . ucwords(strtolower(str_replace('_', ' ', $option->action_3)));
                    }
                    break;

                case 'PROCESS':
                    $description = "Requested to process file " . $option->from_data . " for list " . $option->id_2 . " from " . ucwords(strtolower(str_replace('_', ' ', $option->action_3)));
                    break;

                case 'DOWNLOAD':
                    $description = "Downloaded " . ucwords($eventSubAction) . " file " . $option->from_data . " from " . ucwords(strtolower(str_replace('_', ' ', $option->action_3)));
                    break;

                case 'EMERGENCY':
                    $description = ucfirst($eventSubAction) . $option->id_1;
                    break;

                case 'ADD':
                    if ($option->action_2 == 'CUSTOM_LIST') {
                        if (!in_array($option->method, $this->customListShowMethods)) {
                            continue 2;
                        }

                        $description = "Added " . $eventSubAction . strtolower(str_replace('_', ' ', $option->action_3)) . " - List ID: " . $option->id_1 . " Field Label: " . $option->id_2;
                    }
                    break;

                case 'COPY':
                    if ($option->action_2 == 'CUSTOM_LIST') {
                        if (!in_array($option->method, $this->customListShowMethods)) {
                            continue 2;
                        }

                        $description = "Copied " . $eventSubAction . strtolower(str_replace('_', ' ', $option->action_3)) . " - Data Text: " . str_replace('"', "'", $option->to_data_text);
                    }
                    break;

                case 'APPEND':
                    if ($option->action_2 == 'CUSTOM_LIST') {
                        if (!in_array($option->method, $this->customListShowMethods)) {
                            continue 2;
                        }

                        $description = "Append " . $eventSubAction . strtolower(str_replace('_', ' ', $option->acti_3)) . " - List ID: " . $option->id_1 . " Field Label: " . $option->id_2;
                    }
                    break;

                case 'MODIFY':
                    if ($option->action_2 == 'CUSTOM_LIST') {
                        if (!in_array($option->method, $this->customListShowMethods)) {
                            continue 2;
                        }

                        $description = "Modified {$eventSubAction} " . strtolower(str_replace('_', ' ', $option->action_3));
                    }
                    break;

                case 'CANCEL':
                    $description = "Cancelled " . $eventSubAction . " - Queue ID:" . $option->id_1;
                    break;

                default:
                    $description = "Not Available - Please contact Ytel Support if you want to know more. (Error Code: ER-X5A-AE-1) - " . $option->id;
            }


            $options[$key]['event'] = $event;
            $options[$key]['description'] = $description;
            $options[$key]['admin'] = $option->username;
            $options[$key]['changeDatetime'] = date('c', strtotime($option->change_datetime, time()));
            $options[$key]['ip'] = $option->user_ip;
        }

        return $options;
    }

    /**
     * update Group Access List
     * @param int x5ContactGroupId
     * @param  json $accesses
     * @return json
     */
    public function saveContactGroupAccessList($x5ContactGroupId, $accesses) {

        $accesses = json_decode($accesses, true);

        // delete existing details
        X5ContactAccess::where('model', ACCESS_MODEL_CONTACTGROUP)->where('foreign_key', $x5ContactGroupId)->delete();

        $accessData = [];
        $required_keys = [ACCESS_CREATE, ACCESS_READ, ACCESS_UPDATE, ACCESS_DELETE];

        foreach ($accesses as $type => $eachType) {
            if (is_null($eachType) || !$eachType) {
                continue;
            }

            if (isset($this->typeList[$type]['accessOverwrite'])) {
                foreach ($this->typeList[$type]['accessOverwrite'] as $linkId => $eachAccessOverwrite) {
                    foreach ($this->accesses as $eachAccess) {
                        if (isset($eachAccessOverwrite[$eachAccess]) && isset($eachType[$linkId])) {
                            $eachType[$linkId][$eachAccess] = $eachAccessOverwrite[$eachAccess];
                        }
                    }
                }
            }

            foreach ($eachType as $linkId => $eachItemPermission) {
                $present_keys = array_keys($eachItemPermission);
                $arr_diff = array_diff($required_keys, $present_keys);

                //all 4 keys not present - continue
                if (!empty($arr_diff)) {
                    continue;
                }

                $accessData[] = [
                    'model' => ACCESS_MODEL_CONTACTGROUP,
                    'foreign_key' => $x5ContactGroupId,
                    'type' => $type,
                    'link_id' => $linkId,
                    ACCESS_CREATE => (isset($eachItemPermission[ACCESS_CREATE])) ? (bool) $eachItemPermission[ACCESS_CREATE] : false,
                    ACCESS_READ => (isset($eachItemPermission[ACCESS_READ])) ? (bool) $eachItemPermission[ACCESS_READ] : false,
                    ACCESS_UPDATE => (isset($eachItemPermission[ACCESS_UPDATE])) ? (bool) $eachItemPermission[ACCESS_UPDATE] : false,
                    ACCESS_DELETE => (isset($eachItemPermission[ACCESS_DELETE])) ? (bool) $eachItemPermission[ACCESS_DELETE] : false,
                ];
            }
        }

        X5ContactAccess::insert($accessData);
    }

    public function getAcceptValue($access_type, $inputs, $user, $permission = ACCESS_READ, $return_all_selector = RETURN_ALL_SELECTOR, $null_allow = NOT_ALLOW_NULL) {
        // Get access overwrite list
        $filtered_access_overwrite = [];
        $list_filter = [];
        if (isset($this->type_list[$access_type]['accessOverwrite'])) {
            $filtered_access_overwrite = array_filter($this->type_list[$access_type]['accessOverwrite'], function($v) use($permission) {
                return $v[$permission];
            });
            $filtered_access_overwrite = array_keys($filtered_access_overwrite);
        }

        // Get the model for the current access type
        $self_model = new $this->type_list[$access_type]['model']();
        $access_control_parent_key = $self_model::ACCESS_CONTROL_PARENT_KEY;

        // Check if this model is controlled by a parent key
        if (isset($access_control_parent_key)) {
            // Get the parent access list
            $parent_list = $this->getListByAccess($self_model::ACCESS_CONTROL_TYPE, $permission, $user);
            $access_control_key = $self_model::ACCESS_CONTROL_KEY;
            $primary_key = $access_control_key ?: $self_model->primaryKey;
            if (!$null_allow) {
                $list = $self_model::whereIn($access_control_parent_key, $parent_list)->pluck($primary_key);
            } else {
                $list = $self_model::where(function ($query) use ($access_control_parent_key, $parent_list) {
                            $query->whereIn($access_control_parent_key, $parent_list)
                                    ->orWhereNull($access_control_parent_key);
                        })->pluck($primary_key);
            }

            $list = $list->toArray();
            $list = array_merge($list, $filtered_access_overwrite);
            $list_filter = array_merge($list, $this->additionalAllowedOptions);
        } else {
            $list = array_merge($this->getListByAccess($access_type, $permission, $user), $filtered_access_overwrite);
            $list_filter = array_merge($list, $this->additionalAllowedOptions);
        }

        // Check if select all ID key exists
        if (empty($inputs) || (is_array($inputs) && array_intersect($this->selectAllOptions, $inputs)) || (!is_array($inputs) && in_array($inputs, $this->selectAllOptions))) {
            if (!$list) {
                throw new Exception('No Value Available 1 - ' . $access_type, 400);
            }
            if ($this->hasAllAccessToAccessType($access_type)) {
                $list = $inputs;
                if ($return_all_selector && is_array($inputs)) {
                    $list = array_values(array_intersect($this->selectAllOptions, $inputs));
                } else if (is_array($inputs)) {
                    $list = array_values($list_filter);
                }
            }
            return $list;
        }

        if (is_array($inputs)) {
            $inputs = array_intersect($inputs, $list_filter);
        } else {
            $inputs = (in_array($inputs, $list_filter)) ? $inputs : '';
        }
        if (!$inputs) {
            throw new Exception('No Value Available 3 - ' . $access_type, 400);
        }

        return $inputs;
    }

    /**
     * Getter PermissionList
     * @return array
     */
    public function getPermissionList()
        {
            return [
                'list' => $this->permission_list,
                'model' => $this->type_list
            ];
        }

}
