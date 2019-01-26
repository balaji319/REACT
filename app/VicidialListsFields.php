<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\ErrorLog;
use Exception;

class VicidialListsFields extends Model {

    use ErrorLog;

    protected $connection = 'dyna';
    protected $table = 'vicidial_lists_fields';
    public $primaryKey = 'field_id';
    public $timestamps = false;
    protected $fillable = array('field_id', 'list_id', 'field_label', 'field_name', 'field_description', 'field_rank', 'field_help', 'field_type', 'field_options', 'field_size', 'field_max', 'field_default', 'field_cost', 'field_required', 'name_position', 'multi_position', 'field_order');
   /**
     * Get field list
     *
     * @param int $list_id
     * @param array $campaign_ids
     * @return \Illuminate\Support\Collection
     * @throws Exception
     */
    public static function listsFields($list_id, $campaign_ids) {
        try {
            return \App\VicidialListsFields::join('vicidial_lists', 'vicidial_lists.list_id', 'vicidial_lists_fields.list_id')
                            ->select('vicidial_lists_fields.field_label', 'vicidial_lists_fields.field_name')
                            ->where('vicidial_lists_fields.list_id', $list_id)
                            ->whereIn('vicidial_lists.campaign_id', $campaign_ids)
                            ->orderBy('vicidial_lists_fields.field_rank')
                            ->orderBy('vicidial_lists_fields.field_order')
                            ->orderBy('vicidial_lists_fields.field_label')
                            ->get();
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

}
