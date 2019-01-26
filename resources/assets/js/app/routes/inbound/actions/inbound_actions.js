import axios from "axios";

import {
  REQUEST_INBOUND,
  FETCH_ALL_RECORD_SUCSESS,
  DELETE_RECORD_SUCSESS,
  CLONE_RECORD_SUCSESS,
  UPDATE_RECORD_SUCSESS,
  FETCH_ALL_CAMAIGNTOGROUP_SUCSESS,
  FETCH_ALL_RECORD_FAILURE,
  REQUEST_INBOUND_UNCLEAR,
  INBOUND_DELETE_RECORD_SUCSESS
} from "../constants/";

import { inboundService } from "../services/";

export const fetchSucsess = res => {
  return {
    type: FETCH_ALL_RECORD_SUCSESS,
    result: res.data
  };
};

export const commanFailure = res => {
  return {
    type: FETCH_ALL_RECORD_FAILURE,
    result: res.data
  };
};

export const updateRecordSucsess = res => {
  return {
    type: UPDATE_RECORD_SUCSESS,
    result: res
  };
};

export const deleteRecordSucsess = res => {
  return {
    type: INBOUND_DELETE_RECORD_SUCSESS,
    result: res.data
  };
};

export const request_inbound = res => {
  return {
    type: REQUEST_INBOUND
  };
};

export const request_inbound_unclear = res => {
  return {
    type: REQUEST_INBOUND_UNCLEAR
  };
};

export const fetchCampaignToGroupSucsess = res => {
  return {
    type: FETCH_ALL_CAMAIGNTOGROUP_SUCSESS,
    result: res.data
  };
};

export const fetchCampaignToGroup = res => {
  return (dispatch, getState) => {
    dispatch(request_inbound(res));
    inboundService
      .getAllfetchCampaignToGroup()
      .then(res => {
        dispatch(fetchCampaignToGroupSucsess(res));
      })
      .catch(function(error) {
        console.log(error);
      });
  };
};

export const fetchAllInbound = (current_page, page, search = "") => {
  return (dispatch, getState) => {
    dispatch(request_inbound());
    inboundService
      .getAllInbound(current_page, page, search)
      .then(res => {
        dispatch(fetchSucsess(res));
      })
      .catch(function(error) {
        dispatch(commanFailure(res));
      });
  };
};

export const fetchCallMenusByGroup = (
  group_id,
  current_page = "",
  page = "",
  search = ""
) => {
  return (dispatch, getState) => {
    dispatch(request_inbound());
    inboundService
      .getCallMenusData(group_id, current_page, page, search)
      .then(res => {
        dispatch(fetchSucsess(res));
      })
      .catch(function(error) {
        dispatch(commanFailure(res));
      });
  };
};

export const updateRecord = res => {
  return (dispatch, getState) => {
    dispatch(request_inbound_unclear(res));

    console.log(res);
    setTimeout(function() {
      dispatch(updateRecordSucsess(res));
    }, 5000);
    /*   inboundService.updateRecord(res)
                    .then(res => {
                        dispatch(updateRecordSucsess(res));
                    })
                    .catch(function(error) {
                        console.log(error);
                    })*/
  };
};

export const deleteRecord = res => {
  return (dispatch, getState) => {
    dispatch(request_inbound_unclear(res));

            inboundService.deleteRecord(res)
                    .then(res => {
                        dispatch(deleteRecordSucsess(res));
                    })
                    .catch(function(error) {
                        console.log(error);
                    })
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
