import {
  REQUEST_INBOUND,
  FETCH_ALL_FPG_DATA_SUCSESS,
  FETCH_ALL_RECORD_FAILURE
} from "../constants/";
import { inboundService } from "../services/";
export const request_inbound = res => {
  return {
    type: REQUEST_INBOUND
  };
};

export const fetchFPGSucsess = res => {
  return {
    type: FETCH_ALL_FPG_DATA_SUCSESS,
    result: res.data
  };
};

export const commanFpgFailure = res => {
  return {
    type: FETCH_ALL_RECORD_FAILURE,
    result: res.data
  };
};
export const fetchAllListFpg = (current_page, page, search = "") => {
  return (dispatch, getState) => {
    dispatch(request_inbound());
    inboundService
      .getAllFpg(current_page, page, search)
      .then(res => {
        dispatch(fetchFPGSucsess(res));
      })
      .catch(function(error) {
        dispatch(commanFpgFailure(error));
      });
  };
};
