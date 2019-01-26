import axios from "axios";

import {
  FETCH_ALL_DID,
  UPDATE_RECORD,
  REQUEST_INBOUND,
  DELETE_RECORD_SUCSESS,
  CLONE_RECORD_SUCSESS,
  FETCH_ALL_DID_SUCSESS
} from "../constants/";

import { inboundDidService } from "../services/";

export const fetchDidSucsess = res => {
  return {
    type: FETCH_ALL_DID_SUCSESS,
    result: res.data
  };
};

export const updateRecordSucsess = res => {
  return {
    type: UPDATE_RECORD,
    result: res.data
  };
};

export const request = res => {
  return {
    type: REQUEST_INBOUND
  };
};

export const fetchAllDids = (current_page, page, search = "") => {
  return (dispatch, getState) => {
    dispatch(request());
    inboundDidService
      .fetchAllDids(current_page, page, search)
      .then(res => {
        dispatch(fetchDidSucsess(res));
      })
      .catch(function(error) {
        console.log(error);
      });
  };
};

export const updateRecord = res => {
  return dispatch(updateRecordSucsess(res));
  /*   return (dispatch, getState) => {
         inboundService.updateRecord(res)
                    .then(res => {
                        dispatch(updateRecordSucsess(res));
                    })
                    .catch(function(error) {
                        console.log(error);
                    })
*/
  //}
};

export const deleteRecord = res => {
  return (dispatch, getState) => {
    inboundService
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
    inboundService
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
