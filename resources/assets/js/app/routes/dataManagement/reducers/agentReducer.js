import {updateObject, updateRecordStatus, deleteInboundRecord ,updateRecordcloser}  from '../helpers/utility';

import {

 REQUEST_AGENT ,FETCH_ALL_AGENT_SUCSESS ,DELETE_AGENT_SUCSESS ,UPDATE_AGENT_SUCSESS ,CLONE_AGENT_SUCSESS ,CREATE_AGENT_SUCSESS ,FETCH_AGENT_CAMPAIN_RANK_SUCSESS,
 FETCH_ALL_AGENT_GROUP_SUCSESS,UPDATE_AGENT_STATUS_SUCSESS


} from '../constants';


const initialState = {
  data: [], 
  isLoading: false,
  Response :[],
  sectionin:'', 
  status :false,
  alertMessage: '',
  alertMessageTitle: '',
  showMessage: false,
}


const agentReducer = (state = initialState, action) => {

  switch (action.type) {

      case REQUEST_AGENT : return updateObject(state, {isLoading: true,showMessage: false,status:false});
      // for inbound data 
      case FETCH_ALL_AGENT_SUCSESS : return updateObject(state, {isLoading: false, data:action.result,sectionin: 'Agent',showMessage: false,status:false});
      
      case UPDATE_AGENT_SUCSESS    : return updateObject(state, {isLoading: false,sectionin: 'Agent',showMessage: true,alertMessage: 'Record Updated Susessfully' ,status : true,alertMessageTitle:'Success'});

      case DELETE_AGENT_SUCSESS    : return deleteInboundRecord(state, action);

      case UPDATE_AGENT_STATUS_SUCSESS    : return  action.result.active ?  updateRecordStatus(state, action): updateRecordcloser(state, action);

      case FETCH_ALL_AGENT_GROUP_SUCSESS : return updateObject(state, {isLoading: false, data:action.result,sectionin: 'Agent Group',showMessage: false,status:false});

      case FETCH_AGENT_CAMPAIN_RANK_SUCSESS : return updateObject(state, {isLoading: false, data:action.result,sectionin: 'Agent Campain Ranking ',showMessage: false,status:false});
  
      case CLONE_AGENT_SUCSESS     : return updateObject(state, {isLoading: true, Response:action.result,data:action.result.data, showMessage: true,alertMessage: action.result.msg,status : action.result.status});
    
  default:
      return state;
  }

};

export default agentReducer;