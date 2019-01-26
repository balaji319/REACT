<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class VicidialLeadFilters extends Model {
    

     protected $connection = 'dyna';
    public $timestamps = false;
      protected $table = "vicidial_lead_filters";
    public $primaryKey = 'lead_filter_id';
    protected $fillable = array('lead_filter_id','lead_filter_name','lead_filter_comments','lead_filter_sql');

     public $virtualFields = array(
            'options_title' => 'CONCAT(VicidialLeadFilters.lead_filter_id, " - ", VicidialLeadFilters.lead_filter_name)'
        );

       
    public static function getAll($fields) {
    	$limit =\Config::get("configs.pagination_limit");

    	 return VicidialLeadFilters::select($fields)->orderBy('lead_filter_id')->paginate($limit);
     
    }
    
    public static function getLeadFiltersById($id) {
        return VicidialLeadFilters::
                where('lead_filter_id',$id)->get();
    }
    public static function duplicateRecords($lead_filter_id)
    {
          $count1 = VicidialLeadFilters::where('lead_filter_id', $lead_filter_id)->get();
        return count($count1);
    }




}
