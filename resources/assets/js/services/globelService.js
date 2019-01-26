import axios from 'axios';

import {

    API_FETCH_ALL_CAMPAIN

    
} from '../constants/ActionTypes';


function getAllCampains(data){
  

 return axios.post(API_FETCH_ALL_CAMPAIN,{'case':data}); 

}

export const globleService = {

   getAllCampains

};
 
   
