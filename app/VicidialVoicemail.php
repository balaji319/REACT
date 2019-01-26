<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\ErrorLog;
use Exception;


class VicidialVoicemail extends Model {

   use ErrorLog;
    public $timestamps = false;
    protected $connection = 'dyna';
    #table name
    protected $table = "vicidial_voicemail";
    public $primaryKey = 'voicemail_id';
    public $incrementing = false;

    #fillable fields
    protected $fillable = ['voicemail_id','pass','fullname', 'active', 'email', 'delete_vm_after_email', 'voicemail_greeting','voicemail_options'];

    /**
     * Get all voicemail
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param type $phone
     * @param type $fields
     * @return type
     */
    public static function getAll($search, $limit) {
        try {
           $list= VicidialVoicemail::select('voicemail_id',
                    'fullname',
                    'active',
                    'messages',
                    'old_messages',
                    'delete_vm_after_email',
                    'user_group');

          if ($search != NULL) {
                $list = $list->where(function ($query) use ($search) {
                    $query->where("voicemail_id", "like", "%{$search}%")
                            ->orWhere("fullname", "like", "%{$search}%");
                });
            }


        $list=$list->orderBy('voicemail_id')->paginate($limit);
        return $list;
        } catch (Exception $e) {

            throw $e;
        }

    }

    /**
     * Set script active
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param type $voicemail_id, $value
     * @return type
     */
    public static function setVoicemailActive($value, $voicemail_id) {
        try {
            return VicidialVoicemail::where('voicemail_id', $voicemail_id)->update(['active' => $value]);
        } catch (Exception $e) {

            throw $e;
        }

    }

    /**
     * Delete script permanently
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param type $voicemail_id
     * @return type
     */
    public static function deleteVoicemail($voicemail_id) {
        try {
            return VicidialVoicemail::where('voicemail_id', $voicemail_id)->delete();
        } catch (Exception $e) {

            throw $e;
        }

    }

    /**
     * Find script by id
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param type $voicemail_id
     * @return type
     */
    public static function findVoicemail($voicemail_id) {
        try {
            return VicidialVoicemail::where('voicemail_id', $voicemail_id)->get();
        } catch (Exception $e) {

            throw $e;
        }

    }

    /**
     * Create new dnc
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param type $phone
     * @param type $fields
     * @return type
     */
    public static function makeDnc($data) {
        try {
            return VicidialVoicemail::create($data);
        } catch (Exception $e) {

            throw $e;
        }

    }

    /**
     * To make script
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param type $data
     * @return type
     */
    public static function updateVoicemail($id, $data) {
        try {
            return VicidialVoicemail::where('voicemail_id', $id)->update($data);
        } catch (Exception $e) {

            throw $e;
        }

    }


      public static function duplicateRecords($voicemail_id) {
        try {
            $count1 = VicidialVoicemail::where('voicemail_id', $voicemail_id)->get();
        return count($count1);
        } catch (Exception $e) {

            throw $e;
        }

    }
}
