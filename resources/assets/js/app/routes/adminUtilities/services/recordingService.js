
import axios from 'axios';

import {

API_FETCH_ADMIN_RECORDING_LIST

} from '../constants/';



function getAllRecordingLists(data){

    var auth_token = localStorage.getItem("access_token");
	 const requestOptions = {
        method: 'POST',
        url:API_FETCH_ADMIN_RECORDING_LIST,
        params: data,
       // data:('current_page':current_page,'page_size':page_size)
        headers: {
        	'Content-Type': 'application/json' ,
        	'Authorization' : 'Bearer '+auth_token  ,

        }

    };

	return axios(requestOptions)
}


export const recordingService = {

 getAllRecordingLists

};
