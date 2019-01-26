<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class X5ContactGroup extends Model
{
    public $primaryKey = 'x5_contact_group_id';
    public $timestamps = false;

    /**
     * Get ycc grp list
     *
     * @param  [string] company_id
     * @param  [string] contact_id
     * @return [int] count
     */

    public function getYccGrpList($current_company_id,$limit,$search){

        try {
           return X5ContactGroup::select('x5_contact_group_id', 'super', 'type', 'group_name', 'group_description', 'create_datetime')
                  ->where('company_id',$current_company_id)                                      
                  ->whereNull('delete_datetime')
                  ->when($search,function ($query,$search) {
                    $query->where('group_name', "like", "%{$search}%");                         
                  })
                  ->paginate($limit);
            
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            return 0;
            
        }
    }
}
