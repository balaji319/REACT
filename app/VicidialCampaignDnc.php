<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VicidialCampaignDnc extends Model {

    protected $connection = 'dyna';
    public $timestamps = false;

    #table name
    protected $table = "vicidial_campaign_dnc";

    #fillable fields
    protected $fillable = ['phone_number'
        , 'campaign_id'];

    /**
     * Get dnc by phone number
     * @param type $phone
     * @param type $fields
     * @return type
     */
    public static function getAllByCampaign($campaign_id, $fields) {
        return VicidialCampaignDnc::where('campaign_id', $campaign_id)->get($fields);
    }

    /**
     * Get count of dnc 
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param type $campaign_id 
     * @return type
     */
    public static function getCount($campaign_id) {
        return VicidialCampaignDnc::where('campaign_id', $campaign_id)->count();
    }

    /**
     * Get dnc by phone & id
     * @param type $phone
     * @param type $campaign_id
     * @param type $fields
     * @return type
     */
    public static function getByIdPhoneNumber($phone, $campaign_id, $fields) {
        return VicidialCampaignDnc::
                        where(['phone_number' => $phone, 'campaign_id' => $campaign_id])
                        ->get($fields);
    }

    /**
     * Create new dnc
     * @param type $phone
     * @param type $fields
     * @return type
     */
    public static function makeDnc($data) {
        return VicidialCampaignDnc::create($data);
    }

    /**
     * Delete dnc permanently
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param type $campaign_id
     * @param type $phone
     * @return type
     */
    public static function deleteDnc($phone, $campaign_id) {
        return VicidialCampaignDnc:: where(['phone_number' => $phone, 'campaign_id' => $campaign_id])
                        ->delete();
    }
    public static function checkIsExist($phone,$campaign_id)
    {
        return VicidialCampaignDnc::where(['phone_number' => $phone, 'campaign_id' => $campaign_id])->count();
    }

}
