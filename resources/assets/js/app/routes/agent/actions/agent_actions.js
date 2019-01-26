import axios from "axios";

import {
  REQUEST_AGENT,
  FETCH_ALL_AGENT_SUCSESS,
  DELETE_AGENT_SUCSESS,
  UPDATE_AGENT_SUCSESS,
  CLONE_AGENT_SUCSESS,
  CREATE_AGENT_SUCSESS,
  GET_AGENT_SUCSESS,
  FETCH_ALL_AGENT_GROUP_SUCSESS,
  DELETE_AGENT_GROUP_SUCSESS,
  UPDATE_AGENT_GROUP_SUCSESS,
  CLONE_AGENT_GROUP_SUCSESS,
  CREATE_AGENT_GROUP_SUCSESS,
  UPDATE_AGENT_STATUS_SUCSESS,
  FETCH_AGENT_CAMPAIN_RANK_SUCSESS,
  REQUEST_AGENT_CLEAR,
  UPDATE_AGENT_STATUS_INBOUND_SUCSESS,
  FETCH_AGENT_GROUP_SUCSESS,
  FETCH_AGENT_GROUP_DATA_SUCSESS,
  COMMON_API_ERROR
} from "../constants/";

import { agentService } from "../services/";

import { api_middleware } from "../../../../actions/Auth";

// call redusers action  agents

export const updateRecordSucsess = res => {
  return { type: UPDATE_AGENT_SUCSESS, result: res };
};

export const updateStatusRecordSucsess = res => {
  return { type: UPDATE_AGENT_STATUS_SUCSESS, result: res };
};

export const updateStatusInboundRecordSucsess = res => {
  return { type: UPDATE_AGENT_STATUS_INBOUND_SUCSESS, result: res };
};

export const deleteRecordSucsess = (res, id) => {
  return { type: DELETE_AGENT_SUCSESS, result: id };
};

export const request_agent = res => {
  return { type: REQUEST_AGENT };
};

export const request_agent_clear = res => {
  return { type: REQUEST_AGENT_CLEAR };
};

export const fetchAgentSucsess = res => {
  return { type: FETCH_ALL_AGENT_SUCSESS, result: res };
};

export const fetchAgentGroupSucsess = res => {
  return { type: FETCH_AGENT_GROUP_DATA_SUCSESS, result: res };
};

export const fetchAgentDataSucsess = res => {
  return { type: FETCH_ALL_AGENT_SUCSESS, result: res.data };
};

export const fetchAgentInboundSucsess = res => {
  return { type: FETCH_AGENT_GROUP_SUCSESS, result: res.data };
};

export const errorMsg = res => {
  return { type: COMMON_API_ERROR, result: res.data };
};

//export const clonetoggel = ( res ) => {return {type: TOOGGLE_POPUP}}

// call redusers action  agents groups

export const fetchGroupSucsess = res => {
  return {
    type: FETCH_ALL_AGENT_GROUP_SUCSESS,
    result: res.data
  };
};

export const fetchCampaignRankSucsess = res => {
  return {
    type: FETCH_AGENT_CAMPAIN_RANK_SUCSESS,
    result: res.data
  };
};

export const getAllAgentCampaignRank = res => {
  return (dispatch, getState) => {
    dispatch(request_agent(res));
    agentService
      .getAllAgentCampaignRank()
      .then(res => {
        dispatch(fetchCampaignRankSucsess(res));
      })
      .catch(function(error) {
        console.log(error);
      });
  };
};

// action  agents
export const fetchAgents = res => {
  return (dispatch, getState) => {
    dispatch(request_agent(res));
    agentService
      .getAllfetchCampaignToGroup()
      .then(res => {
        dispatch(fetchAgentSucsess(res));
      })
      .catch(function(error) {
        console.log(error);
      });
  };
};

export const getAllAgentInboundGroups = res => {
  return (dispatch, getState) => {
    dispatch(request_agent(res));
    agentService
      .getAllAgentInboundGroups()
      .then(res => {
        dispatch(fetchAgentInboundSucsess(res));
      })
      .catch(function(error) {
        console.log(error);
      });
  };
};

export const fetchAllAgent = (current_page, page, search = "") => {
  return (dispatch, getState) => {
    dispatch(request_agent_clear());
    agentService
      .getAllagents(current_page, page, search)
      .then(res => {
        dispatch(fetchAgentDataSucsess(res));
      })
      .catch(function(error) {
        console.log(error);
      });
  };
};

export const fetchAgent = id => {
  return (dispatch, getState) => {
    dispatch(request_agent(id));
    agentService
      .getAgentData(id)
      .then(res => {
        dispatch(fetchAgentSucsess(res));
      })
      .catch(function(error) {
        console.log(error);
      });
  };
};

export const updateRecord = res => {
  return (dispatch, getState) => {
    console.log(res);
    dispatch(request_agent(res));
    agentService
      .updateAgent(res)
      .then(res => {
        dispatch(updateRecordSucsess(res));
      })
      .catch(function(error) {
        console.log(error);
      });
  };
};

export const updateStatusRecord = data => {
  return (dispatch, getState) => {
    dispatch(request_agent());
    agentService
      .changeAgentStatus(data)
      .then(res => {
        dispatch(updateStatusRecordSucsess(res));
      })
      .catch(function(error) {
        console.log(error);
      });
  };
};

export const updateOutboundStatusRecord = data => {
  return (dispatch, getState) => {
    dispatch(request_agent());
    agentService
      .changeOutboundAgentStatus(data)
      .then(res => {
        dispatch(updateStatusInboundRecordSucsess(res));
      })
      .catch(function(error) {
        console.log(error);
      });
  };
};

export const deleteRecord = id => {
  return (dispatch, getState) => {
    dispatch(request_agent(id));
    agentService
      .deleteRecord(id)
      .then(res => {
        dispatch(deleteRecordSucsess(res, id));
      })
      .catch(function(error) {
        console.log(error);
      });
  }; /**/
};

export const deleteRecordGroup = id => {
  return (dispatch, getState) => {
    dispatch(request_agent(id));
    agentService
      .deleteRecordGroup(id)
      .then(res => {
        dispatch(deleteRecordSucsess(res, id));
      })
      .catch(function(error) {
        console.log(error);
      });
  }; /**/
};

export const cloneDataSucsess = res => {
  return {
    type: DELETE_RECORD_SUCSESS,
    result: res.data
  };
};

export const cloneRecord = res => {
  return (dispatch, getState) => {
    agentService
      .cloneRecord(res)
      .then(res => {
        dispatch(deleteRecordSucsess(res));
      })
      .catch(function(error) {
        console.log(error);
      });
  };
};

export const cloneRecordSucsess = res => {
  return {
    type: CLONE_RECORD_SUCSESS,
    result: res.data
  };
};

export const cloneAgent = res => {
  return (dispatch, getState) => {
    agentService
      .cloneRecord(res)
      .then(res => {
        dispatch(cloneRecordSucsess(res));
      })
      .catch(function(error) {
        console.log(error);
      });
  };
};

export const fetchAgentGroup = id => {
  return (dispatch, getState) => {
    dispatch(request_agent(id));
    agentService
      .getAgentGroupData(id)
      .then(res => {
        dispatch(fetchAgentGroupSucsess(res));
      })
      .catch(function(error) {
        console.log(error);
      });
  };
};

export const fetchAllAgentGroup = (current_page, page, search = "") => {
  return (dispatch, getState) => {
    dispatch(request_agent_clear());
    agentService
      .getAllAgentGroups(current_page, page, search)
      .then(res => {
        dispatch(fetchGroupSucsess(res));
      })
      .catch(function(error) {
        console.log(error);
      });
  };
};
