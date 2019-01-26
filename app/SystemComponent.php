<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\ErrorLog;
use Exception;

class SystemComponent extends Model
{
	 use ErrorLog;

    protected $primaryKey = 'system_component_id';
    public $timestamps = false;


    /**
     * Get System component - YCC Permission List
     *
     * @return object
     */
    public function getPermissionList() {
        try {
        	return SystemComponent::leftJoin('system_component_groups AS SystemComponentGroup','system_components.system_component_group_id','SystemComponentGroup.system_component_group_id') 
	        ->orderBy('SystemComponentGroup.order','asc')
	        ->orderBy('system_components.order','asc')
	        ->get();
        } catch (Exception $e) {
        	$this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }


}
