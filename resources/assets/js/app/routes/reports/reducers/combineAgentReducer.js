import updateObject from '../helpers/utility';

import {
  REQUEST,
  RESPONSE_MESSAGE,  
  FETCH_COMBINE_AGENT_LIST,
} from '../constants';


const initialState = {
  data: [], 
  isLoading: false,
  Response :[],
  status :false,
  alertMessage: '',
  showMessage: false,
  camploads: false,
}

const combineAgentReducer = (state = initialState, action) => {
  switch (action.type) {

   case REQUEST: return updateObject(state, {camploads:true, isLoading: true,});

   case RESPONSE_MESSAGE: return updateObject(state, {isLoading: true, alertMessage: 'User Testing ......',});
   
   case FETCH_COMBINE_AGENT_LIST: return updateObject(state, {camploads:false, isLoading: false, data:action.result});

  
  default:
      return state;
  }
};

export default combineAgentReducer;