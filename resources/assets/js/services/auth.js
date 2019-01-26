/*
 * auth section servises 
 * @author Balaji Pastapure<balaji@ytel.co.in>
 * 
 */

import axios from 'axios';

import {
    USER_AUTH_API,
    USER_RESET_API,
    USER_LOGOUT_API
} from '../constants/ActionTypes';

/**
* auth_login 
*
* @param  [string] username 
* @param  [string] password
* @return [string] message
*/
function auth_login(res){

    return axios.post(USER_AUTH_API, res);

}

/**
* reset_password
*
* @param  [string] username
* @return [string] message
*/
function reset_password(res){

    return axios.post(USER_RESET_API, res);

}

/**
* signOut
*
* @param  [string] username
* @return [string] message
*/
function signOut(res){

	var auth_token = localStorage.getItem("access_token");

	 const requestOptions = {
        method: 'GET',
        url:USER_LOGOUT_API,
        headers: { 
        	'Content-Type': 'application/json' ,
        	'Authorization' : 'Bearer '+auth_token  ,

        }
        
    };
    
	return axios(requestOptions)

}



export const authService = {

   auth_login,
   reset_password,
   signOut

};
 
   
