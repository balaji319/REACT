<?php

namespace App;
use DB;

use Illuminate\Database\Eloquent\Model;

class VicidialShifts extends Model {

    protected $connection = 'dyna';
    public $timestamps = false;
    public $incrementing = false;

    #table name
    protected $table = "vicidial_shifts";
    public $primaryKey = 'shift_id';


    #fillable fields
    protected $fillable = ['shift_id','shift_name','shift_start_time','shift_length','shift_weekdays','report_option','user_group'];

    /**
     * Get allshifts
     * @author Balaji Pastapure<balaji@ytel.com>
     * @return type
     */
    public static function getAll() {
        $limit =\Config::get("configs.pagination_limit");

         return VicidialShifts::select('shift_id',
                    'shift_name',
                    'shift_start_time',
                    'shift_length',
                    'shift_weekdays','report_option','user_group','report_rank')->orderBy('shift_id')->paginate($limit);
    }


    /**
     * Find script by id
     * @author Balaji Pastapure<balaji@ytel.com>
     * @param type $script_id
     * @return type
     */
    public static function findShift($shift_id,$type='') {

            if($type=='edit'){
                return VicidialShifts::where('shift_id', $shift_id)->orWhere('shift_id', !$shift_id)->get();
            }
             return VicidialShifts::where('shift_id', $shift_id)->get();

    }


    /**
     * To modify script
     * @author Balaji Pastapure<balaji@ytel.com>
     * @param type $data
     * @return type
     */
    public static function makeShift($data) {

    return  DB::table('vicidial_shifts')->insert(
                    [
                        'shift_id' => $data['shift_id'] ,
                        'shift_name' => $data['shift_name'],
                        'shift_start_time' => $data['shift_start_time'],
                        'shift_length' => $data['shift_length'],
                        'report_option' => $data['report_option'],
                        'user_group' => $data['user_group']
                    ]
                );


    }

    public static function c($id, $data) {



        return VicidialScript::where('shift_id', $id)
                                  ->update([
                                        'shift_name' => $data['shift_name'],
                                        'shift_start_time' => $data['shift_start_time'],
                                        'shift_length' => $data['shift_length'],
                                        'report_option' => $data['report_option'],
                                        'user_group' => $data['user_group']
                                        ]);


}



}
