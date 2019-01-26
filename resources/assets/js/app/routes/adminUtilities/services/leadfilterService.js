
import axios from 'axios';

import {

        API_ALL_ADMIN_FILTER_LIST,
        API_ADD_ADMIN_FILTER_LIST,
        API_UPDATE_ADMIN_FILTER_LIST,
        API_GET_ADMIN_FILTER_LIST,
  
} from '../constants/';



function getAllFilterLists(){

    return axios.get(API_ALL_ADMIN_FILTER_LIST); 

}

function addFilterList(res){

    return axios.post(API_ADD_ADMIN_FILTER_LIST,res); 
}

function getFilterList(id){
 
    return axios.get(API_GET_ADMIN_FILTER_LIST + id); 
}

export const filterlistService = {

   getAllFilterLists,
   addFilterList,
   getFilterList

};
 