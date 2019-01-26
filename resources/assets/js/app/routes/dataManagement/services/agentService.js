import axios from 'axios';

import {

    API_ALL_AGENT,
    API_AGENT_DATA,
    API_AGENT_GROUP_DATA,
    API_AGENT_INBOUND_GROUP_DATA,
    API_AGENT_CAMPAIN_RANK_DATA

    
    
} from '../constants/';


function getAllagents(){ return axios.get(API_ALL_AGENT); }

function getAgentData(id){return axios.post(API_AGENT_DATA,id); }

function getAllAgentGroups(){ return axios.get(API_AGENT_GROUP_DATA); }

function getAllAgentInboundGroups(){ return axios.get(API_AGENT_INBOUND_GROUP_DATA); }

function getAllAgentCampaignRank(){ return axios.get(API_AGENT_CAMPAIN_RANK_DATA); }

export const agentService = {
   getAllagents,
   getAllAgentGroups,
   getAllAgentInboundGroups,
   getAllAgentCampaignRank

};
 
   
