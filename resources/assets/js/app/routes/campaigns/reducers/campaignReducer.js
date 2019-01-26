import { updateObject, deleteInboundRecord } from "../helpers/utility";

import {
  FETCH_ALL_SCRIPT,
  FETCH_ALL_SCRIPT_SUCSESS,
  UPDATE_RECORD,
  REQUEST,
  RESPONSE_MESSAGE,
  DELETE_RECORD_SUCSESS,
  CLONE_RECORD_SUCSESS,
  UPDATE_CAMPAIGNS_STATUS_SUCSESS,
  FETCH_ALL_CAMPAIGNS_SUCSESS,
  REQUEST_CAMPAIGNS_CLEAR,
  REQUEST_CAMPAIGNS,
  COMMON_API_CAMPAIGNS_ERROR,
  FETCH_ALL_CUSTOM_CAMPAIGNS_STATUS_SUCSESS,
  RESET_CAMPAIGN_HOPPER_SUCSESS,
  DELETE_CAMPAIGN_DATA_SUCSESS,
  FETCH_ALL_CAMPAIGN_MIX_SUCSESS,
  FETCH_ALL_RECYCLE_DATA_SUCSESS,
  FETCH_ALL_AREA_CODE_LIST_DATA_SUCSESS,
  FETCH_ALL_PAUSE_CODE_LIST_DATA_SUCSESS,
  FETCH_ALL_CALL_TRANSFER_LIST_DATA_SUCSESS
} from "../constants";

const initialState = {
  data: [],
  isLoading: false,
  Response: [],
  sectionin: "",
  status: false,
  alertMessage: "",
  alertMessageTitle: "",
  record_data: [],
  showMessage: false,
  total: ""
};

const campaignReducer = (state = initialState, action) => {
  switch (action.type) {
    case REQUEST_CAMPAIGNS:
      return updateObject(state, {
        isLoading: true,
        showMessage: false,
        status: false
      });

    case RESPONSE_MESSAGE:
      return updateObject(state, {
        isLoading: true,
        alertMessage: "Grest !!!!"
      });

    case FETCH_ALL_SCRIPT:
      return updateObject(state, { isLoading: true, data: action.result });

    case FETCH_ALL_SCRIPT_SUCSESS:
      return updateObject(state, { isLoading: true, isLoading: false });

    case UPDATE_RECORD:
      return updateObject(state, {
        isLoading: true,
        Response: action.result,
        data: action.result.data,
        showMessage: true,
        alertMessage: action.result.msg,
        status: action.result.status
      });

    case DELETE_RECORD_SUCSESS:
      return updateObject(state, {
        isLoading: true,
        Response: action.result,
        data: action.result.data,
        showMessage: true,
        alertMessage: action.result.msg,
        status: action.result.status
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

    case REQUEST_CAMPAIGNS:
      return updateObject(state, {
        isLoading: true,
        showMessage: false,
        status: false
      });

    case REQUEST_CAMPAIGNS_CLEAR:
      return updateObject(state, {
        isLoading: true,
        showMessage: false,
        data: [],
        status: false
      });

    case FETCH_ALL_CAMPAIGNS_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        total: action.result.data.data.total,
        data: action.result.data.data,
        sectionin: "Campaign list  Success",
        showMessage: false,
        status: false
      });
    case FETCH_ALL_CUSTOM_CAMPAIGNS_STATUS_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        total: action.result.data.data.total,
        data: action.result.data.data.data,
        sectionin: "Campaign Status list Success",
        showMessage: false,
        status: false
      });
    case FETCH_ALL_CAMPAIGN_MIX_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        total: action.result.data.total,
        data: action.result.data.data,
        sectionin: "Campaign List Mix Success",
        showMessage: false,
        status: false
      });
    case FETCH_ALL_AREA_CODE_LIST_DATA_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        total: action.result.data.total,
        data: action.result.data.data,
        sectionin: "Campaign Area Code Records Success",
        showMessage: false,
        status: false
      });
    case FETCH_ALL_CALL_TRANSFER_LIST_DATA_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        total: action.result.data.total,
        data: action.result.data.data,
        sectionin: "Campaign call tranfer Success",
        showMessage: false,
        status: false
      });

    case FETCH_ALL_RECYCLE_DATA_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        total: action.result.data.total,
        data: action.result.data.data,
        sectionin: "Campaign Recycle List Success",
        showMessage: false,
        status: false
      });

    case FETCH_ALL_PAUSE_CODE_LIST_DATA_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        total: action.result.data.total,
        data: action.result.data.data,
        sectionin: "Campaign Pause Code List Success",
        showMessage: false,
        status: false
      });

    case UPDATE_CAMPAIGNS_STATUS_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        showMessage: true,
        status: true,
        alertMessage: "Record Updated Susessfully",
        alertMessageTitle: "Success"
      });

    case COMMON_API_CAMPAIGNS_ERROR:
      return updateObject(state, {
        isLoading: false,
        showMessage: true,
        status: false,
        alertMessage: "Somthing Went Wrong !!! ",
        alertMessageTitle: "Error"
      });

    case RESET_CAMPAIGN_HOPPER_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        showMessage: true,
        status: true,
        alertMessage: action.result.msg,
        alertMessageTitle: "Success"
      });
    case DELETE_CAMPAIGN_DATA_SUCSESS:
      return deleteInboundRecord(state, action);

    default:
      return state;
  }
};

export default campaignReducer;
