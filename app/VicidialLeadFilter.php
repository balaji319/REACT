<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialLeadFilter extends Model {

   
    protected $connection = 'dyna';
    public $timestamps = false;
    protected $table = "vicidial_lead_filters";
    public $incrementing = false;
    public $primaryKey = 'lead_filter_id';
    protected $fillable = array('lead_filter_id','lead_filter_name','lead_filter_comments','lead_filter_sql');

   
    public static function getAll($search, $limit) {
    
    	 $list= VicidialLeadFilter::select('lead_filter_id',
                    'lead_filter_name',
                    'lead_filter_comments',
                    'lead_filter_sql',
                    'user_group');

         if ($search != NULL) {
                $list = $list->where(function ($query) use ($search) {
                    $query->where("lead_filter_id", "like", "%{$search}%")
                            ->orWhere("lead_filter_name", "like", "%{$search}%")
                            ->orWhere("lead_filter_comments", "like", "%{$search}%");
                });
            }

       $list=$list->orderBy('lead_filter_id')->paginate($limit);
       return $list;
     
    }
    
    public static function getLeadFiltersById($id) {
        return VicidialLeadFilter::
                where('lead_filter_id',$id)->get();
    }
    public static function duplicateRecords($lead_filter_id)
    {
          $count1 = VicidialLeadFilter::where('lead_filter_id', $lead_filter_id)->get();
        return count($count1);
    }
  
     public static function checkIsExist($id)
    {
      $result=VicidialLeadFilter::find($id);
      return $result;

    }
    public static function getData($from_id)
    {
      $result=VicidialLeadFilter::find($from_id);

      $data['lead_filter_id']=$result->lead_filter_id;
      $data['lead_filter_name']=$result->lead_filter_name;
      $data['lead_filter_comments']=$result->lead_filter_comments;
      $data['lead_filter_sql']=$result->lead_filter_sql;
  
      return $data;
    }

}
