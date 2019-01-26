import axios from 'axios';

import {
   API_CAMPAIGN_LIST,
   API_USERS_LIST,
   API_ALL_AGENTS_GROUPS,
  API_ALL_STATUSES_LIST,
  API_COMBINE_AGENT_LIST,
  API_INBOUND_DID_LIST,
} from '../constants/';




//Reports

function getAllUserGroup(){

   var auth_token = localStorage.getItem("access_token");
    const requestOptions = {
       method: 'GET',
       url:API_ALL_AGENTS_GROUPS,
       headers: {
           'Content-Type': 'application/json' ,
           'Authorization' : 'Bearer '+auth_token  ,

       }
       
   };
   
    return axios(requestOptions)
}

function getCampaignList(){

   var auth_token = localStorage.getItem("access_token");
    const requestOptions = {
       method: 'GET',
       url:API_CAMPAIGN_LIST,
       headers: {
           'Content-Type': 'application/json' ,
           'Authorization' : 'Bearer '+auth_token  ,

       }
       
   };
   
    return axios(requestOptions)
}

function getAllStatuses(){

   var auth_token = localStorage.getItem("access_token");
    const requestOptions = {
       method: 'GET',
       url:API_ALL_STATUSES_LIST,
       headers: {
           'Content-Type': 'application/json' ,
           'Authorization' : 'Bearer '+auth_token  ,

       }
       
   };
   
    return axios(requestOptions)
}

function getCombineAgentList(){

   var auth_token = localStorage.getItem("access_token");
    const requestOptions = {
       method: 'GET',
       url:API_COMBINE_AGENT_LIST,
       headers: {
           'Content-Type': 'application/json' ,
           'Authorization' : 'Bearer '+auth_token  ,

       }
       
   };
   
    return axios(requestOptions)
}

function getUsersList(){

   var auth_token = localStorage.getItem("access_token");
    const requestOptions = {
       method: 'GET',
       url:API_USERS_LIST,
       headers: {
           'Content-Type': 'application/json' ,
           'Authorization' : 'Bearer '+auth_token  ,

       }
       
   };
   
    return axios(requestOptions)
}

function getInboundDidList(){

   var auth_token = localStorage.getItem("access_token");
    const requestOptions = {
       method: 'GET',
       url:API_INBOUND_DID_LIST,
       headers: {
           'Content-Type': 'application/json' ,
           'Authorization' : 'Bearer '+auth_token  ,

       }
       
   };
   
    return axios(requestOptions)
}



export const reportsService = {
   getAllUserGroup,
   getAllStatuses,
   getCampaignList,
   getUsersList,
   getCombineAgentList,
   getInboundDidList
};