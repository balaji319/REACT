import axios from 'axios';

import {    
    REQUEST,
    FETCH_CAMPAIGN_LIST,
    FETCH_USERS_LIST,
    FETCH_ALL_USER_GROUP_LIST,
    FETCH_ALL_STATUSES_LIST,
    FETCH_COMBINE_AGENT_LIST,
    FETCH_INBOUND_DID_LIST,
} from '../constants/';


import {reportsService} from '../services/'

export const fetchSucsess = ( res ) => { return { type: FETCH_ALL_USER_GROUP_LIST,result: res.data.data}}

export const fetchStatusesSuccess = ( res ) => { return { type: FETCH_ALL_STATUSES_LIST,result: res.data.data}}

export const request = ( res ) => { return {type: REQUEST}}


export const fetchAllUserGroup = ( res ) => {
   return (dispatch, getState) => {
      dispatch(request(res));
      reportsService.getAllUserGroup().then(res => {
//            console.log("User Group List"+res.data.data);   
            dispatch(fetchSucsess(res));
        })
        .catch(function(error) {
            console.log(error);
        })
   }
};


export const fetchAllStatuses = ( res ) => {
   return (dispatch, getState) => {
      dispatch(request(res));
      reportsService.getAllStatuses().then(res => {
            dispatch(fetchStatusesSuccess(res));
        })
        .catch(function(error) {
            console.log(error);
        })
   }
};

//Fetch Reports list
export const fetchCampaignListSucsess = ( res ) => { return { type: FETCH_CAMPAIGN_LIST, result: res.data.data } }

export const fetchUsersListSucsess = ( res ) => { return { type: FETCH_USERS_LIST, result: res.data.data } }

export const fetchCombineAgentListSucsess = ( res ) => { return { type: FETCH_COMBINE_AGENT_LIST, result: res.data.user_list } }

export const fetchInboundDidListSucsess = ( res ) => { return { type: FETCH_INBOUND_DID_LIST, result: res.data.data } }




//Reports fetch

export const fetchCampaignList = ( res ) => {
    return (dispatch, getState) => {
       dispatch(request(res));
      reportsService.getCampaignList()
                    .then(res => { 
                        dispatch(fetchCampaignListSucsess(res));
                    })
                    .catch(function(error) {
                        console.log(error);
                    })
    }
};

export const fetchUsersList = ( res ) => {
    return (dispatch, getState) => {
       dispatch(request(res));
      reportsService.getUsersList()
                    .then(res => {     
                        
                        dispatch(fetchUsersListSucsess(res));
                        
                    })
                    .catch(function(error) {
                        console.log(error);
                    })
    }
};

export const fetchCombineAgentList = ( res ) => {
    return (dispatch, getState) => {
       dispatch(request(res));
      reportsService.getCombineAgentList()
                    .then(res => { 
                        console.log("CombineAgentGroup"+res.data);
                        dispatch(fetchCombineAgentListSucsess(res));
                    })
                    .catch(function(error) {
                        console.log(error);
                    })
    }
};

export const fetchhInboundDidList = ( res ) => {
    return (dispatch, getState) => {
       dispatch(request(res));
      reportsService.getInboundDidList()
                    .then(res => { 
                        console.log("InboundDidList"+res.data);
                        dispatch(fetchInboundDidListSucsess(res));
                    })
                    .catch(function(error) {
                        console.log(error);
                    })
    }
};

