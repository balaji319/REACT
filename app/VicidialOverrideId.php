<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialOverrideId extends Model {

    protected $connection = 'dyna';
    protected $table = 'vicidial_override_ids';
    protected $primaryKey = 'id_table';
    public $incrementing = false;
    public $timestamps = false;
    protected $fillable = ['value'];

    public function getOverrideId() {

        $override_id = VicidialOverrideId::where('id_table', 'vicidial_call_menu')->where('active', 1)->first();

        if (!empty($override_id)) {
            $new_id = $override_id->value++;
            $data['value'] = $new_id;
            $override_id->fill($data)->save();

            return $new_id;
        } else {
            return false;
        }
    }

}
