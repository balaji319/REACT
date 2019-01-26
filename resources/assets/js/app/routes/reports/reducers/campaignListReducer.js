import updateObject from '../helpers/utility';

import {
  REQUEST,
  RESPONSE_MESSAGE,  
  FETCH_CAMPAIGN_LIST, 
} from '../constants';


const initialState = {
  data: [], 
  isLoading: false,
  Response :[],
  status :false,
  alertMessage: '',
  showMessage: false,
}

const campaignListReducer = (state = initialState, action) => {
  switch (action.type) {

   case REQUEST: return updateObject(state, {isLoading: true,});

   case RESPONSE_MESSAGE: return updateObject(state, {isLoading: true, alertMessage: 'Testing ......',});
   
   case FETCH_CAMPAIGN_LIST: return updateObject(state, {isLoading: false, data:action.result});
   
  default:
      return state;
  }
};


export default campaignListReducer;