
import axios from 'axios';

import {
	
    API_ALL_CALLMENU,

} from '../constants/';



function fetchAllCallMenu(current_page=1 ,page,search=''){

	 const requestOptions = {
	        method: 'GET',
	        url:API_ALL_CALLMENU,
	        params: {
	        	search:search,
	        	limit:page,
	          	page: current_page,
	        }
    };
    
	return axios(requestOptions)
}




export const inboundCallMenuService = {
   fetchAllCallMenu

};
 
