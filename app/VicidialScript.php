<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class VicidialScript extends Model {

    protected $connection = 'dyna';
    protected $table = 'vicidial_scripts';
    protected $primaryKey = 'script_id';
    public $incrementing = false;
    public $timestamps = false;


    #fillable fields
    protected $fillable = ['script_id'
        , 'script_name'
        , 'script_comments'
        , 'script_text'
        , 'active'
        , 'user_group'];

    /**
     * Get all the scripts
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param type $fields
     * @return type
     */
    public static function getAll($search, $limit) {

      
        $script= VicidialScript::select('script_id', 'script_name', 'active');
        if ($search != NULL) {
                $script = $script->where(function ($query) use ($search) {
                    $query->where("script_id", "like", "%{$search}%")
                            ->orWhere("script_name", "like", "%{$search}%");
                });
            }
            return $script->orderBy('script_id')->paginate($limit);
    }

    /**
     * Set script active
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param type $script_id, $value
     * @return type
     */
    public static function setScriptActive($value, $script_id) {
        return VicidialScript::where('script_id', $script_id)->update(['active' => $value]);
    }

    /**
     * Delete script permanently
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param type $script_id
     * @return type
     */
    public static function deleteScript($script_id) {
        return VicidialScript::where('script_id', $script_id)->delete();
    }

    /**
     * Find script by id
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param type $script_id
     * @return type
     */
    public static function findScript($script_id) {
        return VicidialScript::where('script_id', $script_id)->get();
    }

    /**
     * Make clone script
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param type $data
     * @return type
     */
    public static function cloneScript($from, $to) {

        $script = VicidialScript::find($from);

        $new_script = $script->replicate();
        $new_script->script_id = $to;
        return $new_script->save();
    }

    /**
     * To modify script
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param type $data
     * @return type
     */
    public static function makeScript($data) {
        return VicidialScript::create($data);
    }

    /**
     * To make script
     * @author Omprakash Pachkawade<om@ytel.com>
     * @param type $data
     * @return type
     */
    public static function updateScript($id, $data) {
        return VicidialScript::where('script_id', $id)->update($data);
    }

    public static function duplicateRecords($script_id) {
        $count1=VicidialScript::where('script_id',$script_id)->get();
          return count($count1);
    }

     public static function checkDuplicate($new_id)
    {
      $result=VicidialScript::find($new_id);
      return $result;
    }
    public static function checkIsExist($from_id)
    {
      $result=VicidialScript::find($from_id);
      return $result;

    }
     public static function getData($from_id)
    {
      $result=VicidialScript::find($from_id);

      $data['script_name']=$result->script_name;
      $data['script_comments']=$result->script_comments;
      $data['script_text']=$result->script_text;
      $data['active']=$result->active;
      $data['user_group']=$result->user_group;
     
      return $data;
    }

}
