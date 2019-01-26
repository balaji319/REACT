
import axios from 'axios';

import {

        API_ALL_ADMIN_CALL_TIME,
        API_ADD_ADMIN_CALL_TIME,
        API_UPDATE_ADMIN_CALL_TIME,
        API_GET_ADMIN_CALL_TIME
  
} from '../constants/';



function getAllCallTimes(){

    return axios.get(API_ALL_ADMIN_CALL_TIME); 

}

function addCallTime(res){

    return axios.post(API_ADD_ADMIN_CALL_TIME,res); 
}

function getCallTime(id){
 
    return axios.get(API_GET_ADMIN_CALL_TIME + id); 
}

export const calltimeService = {

   getAllCallTimes,
   addCallTime,
   getCallTime

};
