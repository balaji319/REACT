<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use DB;

class VicidialShift extends Model
{
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
    public static function getAll($search, $limit) {


         $list= VicidialShifts::select('shift_id',
                    'shift_name',
                    'shift_start_time',
                    'shift_length',
                    'shift_weekdays','report_option','user_group','report_rank');
         if ($search != NULL) {
                $list = $list->where(function ($query) use ($search) {
                    $query->where("shift_name", "like", "%{$search}%")
                            ->orWhere("shift_start_time", "like", "%{$search}%");
                });
            }


         $list=$list->orderBy('shift_id')->paginate($limit);
         return $list;
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
    public static function weekdays()
    {
        $weekdays=array(array( "day" => "0",
                    "name" => "Sunday",
                    "checked" => false,
                ),
                array(
                     "day" => "1",
                    "name" => "Monday",
                    "checked" => false,
                ),
                array(
                    "day" => "2",
                    "name" => "Tuesday",
                    "checked" => false,
                ),
                 array(
                    "day" => "3",
                    "name" => "Wednesday",
                    "checked" => false,
                ),
                array(
                    "day" => "4",
                    "name" => "Thursday",
                    "checked" => false,
                ),
                array(
                    "day" => "5",
                    "name" => "Friday",
                    "checked" => false,
                ),
                array(
                    "day" => "6",
                    "name" => "Saturday",
                    "checked" => false,
                )
            );
        return $weekdays;
    }

}
