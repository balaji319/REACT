import {
  updateObject,
  updateRecordStatusScripts,
  updateRecordStatusScript
} from "../helpers/utility";

import {
  FETCH_ALL_SCRIPT,
  FETCH_ALL_SCRIPT_SUCSESS,
  UPDATE_RECORD,
  REQUEST,
  REQUEST_ADMINU,
  RESPONSE_MESSAGE,
  DELETE_RECORD_SUCSESS,
  CLONE_RECORD_SUCSESS,
  FETCH_ALL_ADMIN_SCRIPT_SUCSESS,
  REQUEST_ADMINU_SHIFT,
  FETCH_ALL_ADMIN_SHIFT_SUCSESS,
  ADD_ADMIN_SHIFT_REQUEST,
  EDIT_ADMIN_SHIFT_REQUEST,
  ADD_ADMIN_SHIFT_SUCSESS,
  GET_ADMIN_SHIFT_SUCSESS,
  REQUEST_ADMINU_CALL_TIME,
  FETCH_ALL_ADMIN_CALL_TIME_SUCSESS,
  ADD_ADMIN_CALL_TIME_REQUEST,
  ADD_ADMIN_CALL_TIME_SUCSESS,
  GET_ADMIN_CALL_TIME_SUCSESS,
  REQUEST_ADMINU_FILTER_LIST,
  FETCH_ALL_ADMIN_FILTER_LIST_SUCSESS,
  ADD_ADMIN_FILTER_LIST_REQUEST,
  ADD_ADMIN_FILTER_LIST_SUCSESS,
  GET_ADMIN_FILTER_LIST_SUCSESS,
  REQUEST_ADMINU_RECORDINGS,
  FETCH_ALL_ADMIN_RECORDINGS_SUCSESS,
  UPDATE_STATUS_SCRIPT_RECORD,
  REQUEST_ADMINU_SHIFT_UPDATE_FAIL
} from "../constants";

const initialState = {
  data: [],
  isLoading: false,
  Response: [],
  status: false,
  alertMessage: "",
  showMessage: false,
  showMessage: false,
  alertMessageTitle: "",
  addsucsess: false,
  record_data: "",
  extended_recording_plan: "0",
  total: ""
};

const adminUtilitieReducer = (state = initialState, action) => {
  switch (action.type) {
    case REQUEST:
      return updateObject(state, { isLoading: true, showMessage: false });

    case REQUEST_ADMINU:
      return updateObject(state, { isLoading: true, showMessage: false });

    case FETCH_ALL_ADMIN_SCRIPT_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        data: action.result.data.data,
        showMessage: false,
        total: action.result.data.total
      });

    case FETCH_ALL_SCRIPT_SUCSESS:
      return updateObject(state, { isLoading: false });

    case UPDATE_RECORD:
      return updateRecordStatusScripts(state, action);

    case UPDATE_STATUS_SCRIPT_RECORD:
      return updateObject(state, {
        isLoading: false,
        showMessage: true,
        status: true,
        alertMessage: action.result.msg,
        alertMessageTitle: action.result.status
      });

    case DELETE_RECORD_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        Response: action.result,
        data: action.result.data,
        showMessage: true,
        alertMessage: action.result.msg,
        status: action.result.status
      });

    case CLONE_RECORD_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        Response: action.result,
        data: action.result.data,
        showMessage: true,
        alertMessage: action.result.msg,
        status: action.result.status
      });

    // Shifts
    case REQUEST_ADMINU_SHIFT:
      return updateObject(state, {
        isLoading: true,
        showMessage: false,
        status: false
      });

    case ADD_ADMIN_SHIFT_REQUEST:
      return updateObject(state, {
        isLoading: true,
        showMessage: false,
        status: false
      });

    case EDIT_ADMIN_SHIFT_REQUEST:
      return updateObject(state, {
        isLoading: true,
        showMessage: false,
        status: false
      });

    case ADD_ADMIN_SHIFT_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        showMessage: true,
        alertMessage: action.result.msg,
        status: true,
        alertMessageTitle: action.result.status
      });

    case GET_ADMIN_SHIFT_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        record_data: action.result,
        sectionin: "Admin Shifts Update ",
        showMessage: false,
        status: false
      });
    // for inbound data
    case FETCH_ALL_ADMIN_SHIFT_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        data: action.result.data.data,
        sectionin: "Admin U Shifts ",
        showMessage: false,
        total: action.result.data.total,
        status: false
      });

    // calls
    case REQUEST_ADMINU_CALL_TIME:
      return updateObject(state, {
        isLoading: true
      });

    case ADD_ADMIN_CALL_TIME_REQUEST:
      return updateObject(state, {
        isLoading: true,
        showMessage: false,
        status: false
      });

    case ADD_ADMIN_CALL_TIME_SUCSESS:
      return updateObject(state, { isLoading: false, addsucsess: true });

    case GET_ADMIN_CALL_TIME_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        record_data: action.result,
        sectionin: "Admin Call  ",
        showMessage: false,
        status: false
      });
    // for inbound data
    case FETCH_ALL_ADMIN_CALL_TIME_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        data: action.result.data.data,
        sectionin: "Admin U Call ",
        showMessage: false,
        total: action.result.data.total,
        status: false
      });

    // filter
    case REQUEST_ADMINU_FILTER_LIST:
      return updateObject(state, {
        isLoading: true,
        showMessage: false,
        status: false
      });

    case ADD_ADMIN_FILTER_LIST_REQUEST:
      return updateObject(state, {
        isLoading: true,
        showMessage: false,
        status: false
      });

    case ADD_ADMIN_FILTER_LIST_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        showMessage: true,
        alertMessage: action.result.msg,
        status: true,
        alertMessageTitle: action.result.status
      });

    case GET_ADMIN_FILTER_LIST_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        record_data: action.result,
        sectionin: "Admin U Filter List Update",
        showMessage: false,
        status: false
      });
    // for inbound data
    case FETCH_ALL_ADMIN_FILTER_LIST_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        data: action.result.data.data,
        sectionin: "Admin U Filter ListShifts ",
        showMessage: false,
        total: action.result.data.total,
        status: false
      });

    case REQUEST_ADMINU_RECORDINGS:
      return updateObject(state, {
        isLoading: true,
        showMessage: false,
        data: [],
        status: false,
        extended_recording_plan: 0
      });

    case FETCH_ALL_ADMIN_RECORDINGS_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        data: action.result.data.data,
        sectionin: "Recording data",
        showMessage: false,
        status: false,
        extended_recording_plan: action.result.extended_recording_plan,
        total: action.result.data.total
      });

    case REQUEST_ADMINU_SHIFT_UPDATE_FAIL:
      return updateObject(state, {
        isLoading: false,
        sectionin: "Admin U Shift Section",
        alertMessageTitle: "ERROR",
        status: false,
        showMessage: true,
        alertMessage: action.result.msg
      });

    default:
      return state;
  }
};

export default adminUtilitieReducer;
