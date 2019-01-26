<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace App\Helper;


use Illuminate\Validation\Validator;
use Illuminate\Support\MessageBag;
use Exception;

class CustomValidate {
    
    public function isUserIdValid($attribute, $value, $parameters, $validator){
        $exp_userid = explode(",", $value);
        if(count($exp_userid) <= 0){
            return false;
        }
        foreach($exp_userid as $id){
            #check length
            $numb_length = strlen((string)$id);
            if($numb_length < 4 || $numb_length > 7){
               return false;               
            }
        }
        return true;
    }
    
    public function uniqueId($attribute, $value, $parameters, $validator){
        $exp_userid = explode(",", $value);
        foreach($exp_userid as $id){
            $use_count  = \App\VicidialUsers::compainList($id);
            if(isset($use_count)){
                return false;
            }
        }
        return true;
    }

    /**
     * Delete Ytel group List validation
     * @param object Request
     * @param  int x5_contact_id
     * @return json
     */
    public function validateSuperDel($attribute, $value, $parameters, $validator)
    {
        try {
           
           $count = \App\X5Contact::where('x5_contact_id',$value)
            ->whereNull('delete_datetime')
            ->where('company_id',$parameters[0])
            ->count();

            if($count > 0){
                return true;
            }

            return false;
                   
        } catch (Exception $e) {
           return false;
        }
    }

     /**
     * Validate Access To Conatct Group
     * @param object Request
     * @param  int x5_contact_id
     * @return json
     */
    public function validateAccessContactGrp($attribute, $value, $parameters, $validator)
    {
        try {
           
           $count = \App\X5ContactGroup::where('x5_contact_group_id',$value)
            ->whereNull('delete_datetime')
            ->where('company_id',$parameters[0])
            ->count();

            if($count > 0){
                return true;
            }

            return false;
                   
        } catch (Exception $e) {
           return false;
        }
    }

    /**
     * Validate Access To Conatct Group Edit access
     * @param object Request
     * @param  int x5_contact_id
     * @return json
     */
    public function validateAccessContactGrpEdit($attribute, $value, $parameters, $validator)
    {
        try {
           
            $count = \App\X5ContactGroup::where('x5_contact_group_id',$value)
            ->where(function ($query) {
                $query->where('super',1)
                      ->orwhere('type',1);
              })
            ->count();

            if($count == 0){
                return true;
            }

            return false;
                   
        } catch (Exception $e) {
           return false;
        }
    }
    
}