import axios from 'axios';

import {

    API_ALL_AGENT,
    API_AGENT_DATA,
    API_AGENT_GROUP_DATA,
    API_AGENT_INBOUND_GROUP_DATA,
    API_AGENT_CAMPAIN_RANK_DATA,
    API_CHANGE_STATUS_AGENT ,
	  API_CHANGE_STATUS_OUTBOUND_AGENT ,
    API_UPDATE_RECORD_AGENT,
    API_CLONE_RECORD_AGENT ,
    API_DELETE_RECORD_AGENT,
    API_AGENT_GROUP_EDIT_DATA,
    API_DELETE_RECORD_AGENT_GROUP
    
    
} from '../constants/';


function getAllagents(current_page=1 ,page ,search=''){

	 const requestOptions = {
        method: 'GET',
        url:API_ALL_AGENT,
        params: {
        	search:search,
        	limit:page,
            page: current_page,
           
          }

    };
    
	return axios(requestOptions)
}


function getAllAgentGroups(current_page=1 ,page ,search=''){

	 const requestOptions = {
        method: 'GET',
        url:API_AGENT_GROUP_DATA,
        params: {
        	search:search,
        	limit:page,
            page: current_page,
           
          }
        
    };
    
	return axios(requestOptions)
}


function getAgentData(id){

	 const requestOptions = {
        method: 'GET',
        url:API_AGENT_DATA,
        params: {
        	id:id
        }
    };
    
	return axios(requestOptions)
}

function getAgentGroupData(id){

   const requestOptions = {
        method: 'GET',
        url:API_AGENT_GROUP_EDIT_DATA,
        params: {
          user_group:id
        }
    };
    
  return axios(requestOptions)
}


function changeAgentStatus(data){

	 const requestOptions = {
        method: 'POST',
        url:API_CHANGE_STATUS_AGENT,
        params: data,
     
    };
    
	return axios(requestOptions)
}

function changeOutboundAgentStatus(data){

	 const requestOptions = {
        method: 'POST',
        url:API_CHANGE_STATUS_OUTBOUND_AGENT,
        params: data
    };
    
	return axios(requestOptions)
}


function updateAgent(data){

     const requestOptions = {
        method: 'POST',
        url:API_UPDATE_RECORD_AGENT,
        params: data
    };
    
    return axios(requestOptions)
}

function cloneRecord(data){

     const requestOptions = {
        method: 'POST',
        url:API_CLONE_RECORD_AGENT,
        params: data
    };
    
    return axios(requestOptions)
}

function deleteRecord(data){

     const requestOptions = {
        method: 'POST',
        url:API_DELETE_RECORD_AGENT,
        params: data
    };
    
    return axios(requestOptions)
}

function deleteRecordGroup(data){

     const requestOptions = {
        method: 'POST',
        url:API_DELETE_RECORD_AGENT_GROUP,
        params: data
    };
    
    return axios(requestOptions)
}



function getAllAgentInboundGroups(){ return axios.get(API_AGENT_INBOUND_GROUP_DATA); }

function getAllAgentCampaignRank(){ return axios.get(API_AGENT_CAMPAIN_RANK_DATA); }

export const agentService = {
  
       getAllagents,
       getAllAgentGroups,
       getAllAgentInboundGroups,
       getAllAgentCampaignRank,
       getAgentData,
       changeAgentStatus,
       changeOutboundAgentStatus,
       updateAgent,
       cloneRecord,
       deleteRecord,
       getAgentGroupData,
       deleteRecordGroup

};
 
   
