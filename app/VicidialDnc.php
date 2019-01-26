<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialDnc extends Model {

    protected $connection = 'dyna';
    
    public $timestamps = false;

    #table name
    protected $table = "vicidial_dnc";

    #fillable fields
    protected $fillable = ['phone_number'];

    /**
     * Get dnc by phone number
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param type $phone
     * @param type $fields
     * @return type
     */
    public static function getAll($fields) {
        return VicidialDnc::where('phone_number', '<>', '', 'AND')->get($fields);
    }

    /**
     * Get count of dnc 
     * @author Omprakash Pachkawade<om@ytel.com>
     * @return type
     */
    public static function getCount() {
        return VicidialDnc::count();
    }

    /**
     * Get dnc by phone number
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param type $phone
     * @param type $fields
     * @return type
     */
    public static function getByPhoneNumber($phone, $fields) {
        return VicidialDnc::
                        where('phone_number', $phone)
                        ->get($fields)
                        ->toArray();
    }

    /**
     * Create new dnc
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param type $phone
     * @param type $fields
     * @return type
     */
    public static function makeDnc($data) {
        return VicidialDnc::create($data);
    }

    /**
     * Delete dnc permanently
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param type $phone
     * @return type
     */
    public static function deleteDnc($phone) {
        return VicidialDnc::where('phone_number', $phone)->delete();
    }
    public static function isExist($phone)
    {
        return VicidialDnc::where('phone_number', $phone)->count();
    }

}
