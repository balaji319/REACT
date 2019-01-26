import axios from 'axios';

import {

 REQUEST_AGENT ,
 FETCH_ALL_AGENT_SUCSESS ,
 DELETE_AGENT_SUCSESS  ,
 UPDATE_AGENT_SUCSESS  ,
 CLONE_AGENT_SUCSESS   ,
 CREATE_AGENT_SUCSESS  ,
 GET_AGENT_SUCSESS,
 FETCH_ALL_AGENT_GROUP_SUCSESS ,
 DELETE_AGENT_GROUP_SUCSESS ,
 UPDATE_AGENT_GROUP_SUCSESS ,
 CLONE_AGENT_GROUP_SUCSESS   ,
 CREATE_AGENT_GROUP_SUCSESS  ,
 UPDATE_AGENT_STATUS_SUCSESS ,
 FETCH_AGENT_CAMPAIN_RANK_SUCSESS
  
} from '../constants/';


import {agentService} from '../services/'




// call redusers action  agents 

export const updateRecordSucsess = ( res ) => { return { type: UPDATE_AGENT_SUCSESS,result: res}}

export const updateStatusRecordSucsess = ( res ) => { return { type: UPDATE_AGENT_STATUS_SUCSESS,result: res}}

export const deleteRecordSucsess = ( res ) => {return {type: DELETE_AGENT_SUCSESS,result: res};}

export const request_agent = ( res ) => { return { type: REQUEST_AGENT,}}

export const fetchAgentSucsess = ( res ) => {return {type: FETCH_ALL_AGENT_SUCSESS, result: res.data}}



// call redusers action  agents groups 

export const fetchGroupSucsess = ( res ) => {
    return {
        type: FETCH_ALL_AGENT_GROUP_SUCSESS,
        result: res.data
    };
}


export const fetchCampaignRankSucsess = ( res ) => {
    return {
        type: FETCH_AGENT_CAMPAIN_RANK_SUCSESS,
        result: res.data
    };
}


export const getAllAgentCampaignRank = ( res ) => {
    return (dispatch, getState) => {
       dispatch(request_agent(res));
       agentService.getAllAgentCampaignRank()
                    .then(res => {
                        dispatch(fetchCampaignRankSucsess(res));
                    })
                    .catch(function(error) {
                        console.log(error);
                    })
    }
};

// action  agents 
export const fetchAgents = ( res ) => {
    return (dispatch, getState) => {
       dispatch(request_agent(res));
       agentService.getAllfetchCampaignToGroup()
                    .then(res => {
                        dispatch(fetchAgentSucsess(res));
                    })
                    .catch(function(error) {
                        console.log(error);
                    })
    }
};



export const getAllAgentInboundGroups= ( res ) => {
    return (dispatch, getState) => {
       dispatch(request_agent(res));
       agentService.getAllAgentInboundGroups()
                    .then(res => {
                        dispatch(fetchAgentSucsess(res));
                    })
                    .catch(function(error) {
                        console.log(error);
                    })
    }
};


export const fetchAllAgent= ( res ) => {
    return (dispatch, getState) => {
       dispatch(request_agent(res));
       agentService.getAllagents()
                    .then(res => {
                        dispatch(fetchAgentSucsess(res));
                    })
                    .catch(function(error) {
                        console.log(error);
                    })
    }
};


export const fetchAgent = ( res ) => {
    return (dispatch, getState) => {
           console.log("baaj");
        console.log(res)
       dispatch(request_agent(res));

        setTimeout(function(){ 

         dispatch(fetchAgentSucsess(res))}, 1000);
     /*  agentService.getAgentData()
                    .then(res => {
                        dispatch(fetchAgentSucsess(res));
                    })
                    .catch(function(error) {
                        console.log(error);
                    })*/
    }
};

export const updateRecord = ( res ) => {

    return (dispatch, getState) => {

        console.log(res);
        dispatch(request_agent(res));
        setTimeout(function(){ 
         dispatch(updateRecordSucsess(res))}, 1000);
      /*   agentService.updateRecord(res)
                    .then(res => {
                        dispatch(updateRecordSucsess(res));
                    })
                    .catch(function(error) {
                        console.log(error);
                    })*/
   }

};

export const updateStatusRecord = ( res ) => {

    return (dispatch, getState) => {

        dispatch(request_agent(res));
        setTimeout(function(){ 
        dispatch(updateStatusRecordSucsess(res))}, 1000);

   }

};




export const deleteRecord = ( res ) => {
    return (dispatch, getState) => {
   dispatch(request_agent(res));
        setTimeout(function(){  dispatch(deleteRecordSucsess(res))}, 1000);
 /*        agentService.deleteRecord(res)
                    .then(res => {
                        dispatch(deleteRecordSucsess(res));
                    })
                    .catch(function(error) {
                        console.log(error);
                    })*/

   }/**/

};

export const cloneDataSucsess = ( res ) => {
    return {
        type: DELETE_RECORD_SUCSESS,
        result: res.data
    };
}

export const cloneRecord = ( res ) => {
    return (dispatch, getState) => {

         agentService.cloneRecord(res)
                    .then(res => {
                        dispatch(deleteRecordSucsess(res));
                    })
                    .catch(function(error) {
                        console.log(error);
                    })

    }

};

export const cloneRecordSucsess = ( res ) => {
    return {
        type: CLONE_RECORD_SUCSESS,
        result: res.data
    };
}


export const fetchAllAgentGroup= ( res ) => {
    return (dispatch, getState) => {
       dispatch(request_agent(res));
       agentService.getAllAgentGroups()
                    .then(res => {
                        dispatch(fetchGroupSucsess(res));
                    })
                    .catch(function(error) {
                        console.log(error);
                    })
    }
};








