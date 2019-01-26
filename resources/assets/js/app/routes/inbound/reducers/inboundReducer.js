import {
  updateObject,
  updateInboundRecord,
  deleteInboundRecord
} from "../helpers/utility";

import {
  REQUEST_INBOUND,
  UPDATE_RECORD,
  RESPONSE_MESSAGE,
  FETCH_ALL_CAMAIGNTOGROUP_SUCSESS,
  REQUEST_INBOUND_UNCLEAR,
  FETCH_ALL_RECORD_SUCSESS,
  DELETE_RECORD_SUCSESS,
  INBOUND_DELETE_RECORD_SUCSESS,
  UPDATE_RECORD_SUCSESS,
  CLONE_RECORD_SUCSESS,
  FETCH_ALL_CALLMENU_SUCSESS,
  UPDATE_CALLMENU_RECORD_SUCSESS,
  DELETE_CALLMENU_RECORD_SUCSESS,
  CLONE_CALLMENU_RECORD_SUCSESS,
  FETCH_ALL_DID_SUCSESS,
  UPDATE_DID_RECORD_SUCSESS,
  DELETE_DID_RECORD_SUCSESS,
  CLONE_DID_RECORD_SUCSESS,
  FETCH_ALL_RECORD_FAILURE,
  FETCH_ALL_FPG_DATA_SUCSESS
} from "../constants";

const initialState = {
  data: [],
  isLoading: false,
  Response: [],
  sectionin: "",
  status: false,
  alertMessage: "",
  alertMessageTitle: "",
  showMessage: false,
  error: false,
  total: ""
};

const inboundReducer = (state = initialState, action) => {
  switch (action.type) {
    case REQUEST_INBOUND_UNCLEAR:
      return updateObject(state, {
        isLoading: true,
        showMessage: false,
        status: false,
        error: false
      });

    case REQUEST_INBOUND:
      return updateObject(state, {
        isLoading: true,
        showMessage: false,
        status: false,
        error: false,
        data: []
      });
    // for inbound data
    case FETCH_ALL_RECORD_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        data: action.result.data.data,
        total: action.result.data.total,
        sectionin: "inbound Queue Success",
        showMessage: false,
        status: false
      });

    case FETCH_ALL_RECORD_FAILURE:
      return updateObject(state, { isLoading: false, error: true });

    case UPDATE_RECORD_SUCSESS:
      return updateInboundRecord(state, action);

    case INBOUND_DELETE_RECORD_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        alertMessageTitle:'Success',
        showMessage: true,
        alertMessage: 'Record Deleted Susessfully' ,
        status : true
      });

    case CLONE_RECORD_SUCSESS:
      return updateObject(state, {
        isLoading: true,
        Response: action.result,
        data: action.result.data,
        showMessage: true,
        alertMessage: action.result.msg,
        status: action.result.status
      });

    case UPDATE_RECORD:
      return deleteInboundRecord(state, action);

    case FETCH_ALL_CAMAIGNTOGROUP_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        data: action.result,
        sectionin: "Assign Campaign To Group ",
        showMessage: false,
        status: false
      });

    // for call menu
    case FETCH_ALL_CALLMENU_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        data: action.result.data.data,
        total: action.result.data.total,
        sectionin: "Call Menu"
      });

    case UPDATE_CALLMENU_RECORD_SUCSESS:
      return updateObject(state, {
        isLoading: true,
        Response: action.result,
        showMessage: true,
        alertMessage: action.result.msg,
        status: action.result.status
      });

    case DELETE_CALLMENU_RECORD_SUCSESS:
      return updateObject(state, {
        isLoading: true,
        Response: action.result,
        showMessage: true,
        alertMessage: action.result.msg,
        status: action.result.status
      });

    case CLONE_CALLMENU_RECORD_SUCSESS:
      return updateObject(state, {
        isLoading: true,
        Response: action.result,
        data: action.result.data,
        showMessage: true,
        alertMessage: action.result.msg,
        status: action.result.status
      });

    // for DID
    case FETCH_ALL_DID_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        data: action.result.data,
        total: action.result.meta.total,
        sectionin: "DID Numbers"
      });
    case FETCH_ALL_FPG_DATA_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        data: action.result.data.data,
        total: action.result.data.total,
        sectionin: "DID Numbers"
      });

    case UPDATE_DID_RECORD_SUCSESS:
      return updateObject(state, {
        isLoading: true,
        Response: action.result,
        showMessage: true,
        alertMessage: action.result.msg,
        status: action.result.status
      });

    case DELETE_DID_RECORD_SUCSESS:
      return updateObject(state, {
        isLoading: true,
        Response: action.result,
        showMessage: true,
        alertMessage: action.result.msg,
        status: action.result.status
      });

    case CLONE_DID_RECORD_SUCSESS:
      return updateObject(state, {
        isLoading: true,
        Response: action.result,
        data: action.result.data,
        showMessage: true,
        alertMessage: action.result.msg,
        status: action.result.status
      });

    //     // add 'deleting:true' property to user being deleted

    /*   case DELETE_DID_RECORD_SUCSESS_DEMO:

      return {
        ...state,
        isLoading: true
         //Response:action.result

      };
*/

    //case FETCH_ALL_CALLMENU  : return updateObject(state, {isLoading: false, data:action.result,sectionin: 'Call Menu'});

    //case FETCH_ALL_DID  : return updateObject(state, {isLoading: false, data:action.result,sectionin: 'DID Numbers'});

    default:
      return state;
  }
};

export default inboundReducer;
