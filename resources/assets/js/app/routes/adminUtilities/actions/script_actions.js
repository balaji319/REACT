import axios from "axios";

import {
  FETCH_ALL_SCRIPT,
  FETCH_ALL_ADMIN_SCRIPT_SUCSESS,
  UPDATE_RECORD,
  REQUEST,
  DELETE_RECORD_SUCSESS,
  CLONE_RECORD_SUCSESS,
  UPDATE_STATUS_SCRIPT_RECORD,
  REQUEST_ADMINU
} from "../constants/";

import { scriptService } from "../services/";

export const fetchSucsess = res => {
  return {
    type: FETCH_ALL_ADMIN_SCRIPT_SUCSESS,
    result: res.data
  };
};

export const updateRecordSucsess = res => {
  return {
    type: UPDATE_RECORD,
    result: res.data
  };
};

export const updateRecordStatusSucsess = res => {
  return {
    type: UPDATE_STATUS_SCRIPT_RECORD,
    result: res.data
  };
};

export const request = res => {
  return {
    type: REQUEST
  };
};
export const request_utilites = res => {
  return {
    type: REQUEST_ADMINU
  };
};
export const fetchAllScript = (current_page, page, search = "") => {
  return (dispatch, getState) => {
    dispatch(request_utilites());
    scriptService
      .getAllScript(current_page, page, search)
      .then(res => {
        dispatch(fetchSucsess(res));
      })
      .catch(function(error) {
        console.log(error);
      });
  };
};

export const updateRecord = res => {
  return (dispatch, getState) => {
    //dispatch(request(res));
    scriptService
      .updateRecord(res)
      .then(res => {
        dispatch(updateRecordStatusSucsess(res));
      })
      .catch(function(error) {
        console.log(error);
      });
  };
};

export const deleteRecord = res => {
  return (dispatch, getState) => {
    scriptService
      .deleteRecord(res)
      .then(res => {
        dispatch(deleteRecordSucsess(res));
      })
      .catch(function(error) {
        console.log(error);
      });
  };
};

export const cloneDataSucsess = res => {
  return {
    type: DELETE_RECORD_SUCSESS,
    result: res.data
  };
};

export const cloneRecord = res => {
  return (dispatch, getState) => {
    scriptService
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
