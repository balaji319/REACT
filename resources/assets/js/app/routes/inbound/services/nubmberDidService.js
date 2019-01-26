
import axios from 'axios';

import {
	
    API_ALL_DID,

} from '../constants/';




function fetchAllDids(current_page=1 ,page,search=''){

    var auth_token = localStorage.getItem("access_token");
	 const requestOptions = {
        method: 'GET',
        url:API_ALL_DID,
        params: {
        	search:search,
        	limit:page,
            page: current_page,

           
          },
       // data:('current_page':current_page,'page_size':page_size)
        headers: { 
        	'Content-Type': 'application/json' ,
        	'Authorization' : 'Bearer '+auth_token  ,

        }
        
    };
    
	return axios(requestOptions)
}



export const inboundDidService = {
   fetchAllDids

};
 
