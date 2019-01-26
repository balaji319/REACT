import axios from "axios";

import {
  FETCH_ALL_SCRIPT,
  UPDATE_RECORD,
  REQUEST,
  DELETE_RECORD_SUCSESS,
  CLONE_RECORD_SUCSESS,
  FETCH_ALL_CAMPAIGNS_SUCSESS,
  FETCH_ALL_CUSTOM_CAMPAIGNS_STATUS_SUCSESS,
  REQUEST_CAMPAIGNS_CLEAR,
  REQUEST_CAMPAIGNS,
  COMMON_API_CAMPAIGNS_ERROR,
  UPDATE_CAMPAIGNS_STATUS_SUCSESS,
  RESET_CAMPAIGN_HOPPER_SUCSESS,
  DELETE_CAMPAIGN_DATA_SUCSESS,
  FETCH_ALL_CAMPAIGN_MIX_SUCSESS,
  FETCH_ALL_RECYCLE_DATA_SUCSESS,
  FETCH_ALL_AREA_CODE_LIST_DATA_SUCSESS,
  FETCH_ALL_PAUSE_CODE_LIST_DATA_SUCSESS,
  FETCH_ALL_CALL_TRANSFER_LIST_DATA_SUCSESS
} from "../constants/";

import { campaignService } from "../services/";

export const fetchSucsess = res => {
  return {
    type: FETCH_ALL_SCRIPT,
    result: res.data
  };
};

export const request_campaign = res => {
  return { type: REQUEST_CAMPAIGNS };
};
export const request_campaign_clear = res => {
  return { type: REQUEST_CAMPAIGNS_CLEAR };
};

export const updateRecordSucsess = res => {
  return {
    type: UPDATE_RECORD,
    result: res.data
  };
};

export const fetchCampaignStatusSucsess = res => {
  return {
    type: FETCH_ALL_CUSTOM_CAMPAIGNS_STATUS_SUCSESS,
    result: res
  };
};
export const request = res => {
  return {
    type: REQUEST
  };
};

export const fetchAllCampaign = res => {
  return (dispatch, getState) => {
    dispatch(request(res));
    campaignService
      .getAllCampaign()
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
    axios
      .post("api/admin-utilities/set-script-active", res)
      .then(res => {
        dispatch(updateRecordSucsess(res));
      })
      .catch(function(error) {
        console.log(error);
      });
  };
};

export const deleteRecord = res => {
  return (dispatch, getState) => {
    axios
      .post("api/admin-utilities/delete-script", res)
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
    axios
      .post("/api/admin-utilities/clone-script", res)
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

export const getCampaignStatus = (current_page, page, search = "") => {
  return (dispatch, getState) => {
    dispatch(request_campaign_clear());
    campaignService
      .getCampaignStatusData(current_page, page, search)
      .then(res => {
        dispatch(fetchCampaignStatusSucsess(res));
      })
      .catch(function(error) {
        console.log(error);
      });
  };
};

export const updateCampaignStatus = data => {
  return (dispatch, getState) => {
    dispatch(request_campaign());
    campaignService
      .updateCampaignStatusData(data)
      .then(res => {
        dispatch(updateCampaignStatusSucsess(res));
      })
      .catch(function(error) {
        dispatch(updateCampaignStatusFailure(error));
      });
  };
};

export const resetHopper = data => {
  return (dispatch, getState) => {
    dispatch(request_campaign());
    campaignService
      .resetHopperData(data)
      .then(res => {
        dispatch(updateCampaignResetHopperSucsess(res));
      })
      .catch(function(error) {
        dispatch(updateCampaignStatusFailure(error));
      });
  };
};

export const deleteCampaign = data => {
  return (dispatch, getState) => {
    dispatch(request_campaign());
    campaignService
      .deleteCampaignData(data)
      .then(res => {
        dispatch(deleteCampaignDataSucsess(res, data));
      })
      .catch(function(error) {
        dispatch(deleteCampaignDataFailure(error));
      });
  };
};

export const getCampaignListMix = res => {
  return (dispatch, getState) => {
    dispatch(request_campaign_clear());
    campaignService
      .getCampaignListMixData()
      .then(res => {
        dispatch(fetchCampaignListMixSucsess(res));
      })
      .catch(function(errro) {
        console.log(error);
      });
  };
};

export const fetchLeadRecycleListSucsess = res => {
  return {
    type: FETCH_ALL_RECYCLE_DATA_SUCSESS,
    result: res.data
  };
};
export const getLeadRecycleList = (current_page, page, search = "") => {
  return (dispatch, getState) => {
    dispatch(request_campaign_clear());
    campaignService
      .getLeadRecycleListData(current_page, page, search)
      .then(res => {
        dispatch(fetchLeadRecycleListSucsess(res));
      })
      .catch(function(errro) {
        console.log(error);
      });
  };
};
export const getAreaCodesList = (current_page, page, search = "") => {
  return (dispatch, getState) => {
    dispatch(request_campaign_clear());
    campaignService
      .getAreaCodesListData(current_page, page, search)
      .then(res => {
        dispatch(getAreaCodesListSucsess(res));
      })
      .catch(function(errro) {
        console.log(error);
      });
  };
};
export const getAreaCodesListSucsess = res => {
  return {
    type: FETCH_ALL_AREA_CODE_LIST_DATA_SUCSESS,
    result: res.data
  };
};

export const getCallTransferPresetsList = (current_page, page, search = "") => {
  return (dispatch, getState) => {
    dispatch(request_campaign_clear());
    campaignService
      .getCallTransferPresetsListData(current_page, page, search)
      .then(res => {
        dispatch(getCallTransferPresetsListSucsess(res));
      })
      .catch(function(errro) {
        console.log(error);
      });
  };
};
export const getCallTransferPresetsListSucsess = res => {
  return {
    type: FETCH_ALL_CALL_TRANSFER_LIST_DATA_SUCSESS,
    result: res.data
  };
};

export const getCampaignPauseCodes = (current_page, page, search = "") => {
  return (dispatch, getState) => {
    dispatch(request_campaign_clear());
    campaignService
      .getCampaignPauseCodeData(current_page, page, search)
      .then(res => {
        dispatch(getCampaignPauseCodeSucsess(res));
      })
      .catch(function(errro) {
        console.log(error);
      });
  };
};

export const getCampaignPauseCodeSucsess = res => {
  return {
    type: FETCH_ALL_PAUSE_CODE_LIST_DATA_SUCSESS,
    result: res.data
  };
};

export const fetchSucsessData = res => {
  return {
    type: FETCH_ALL_CAMPAIGNS_SUCSESS,
    result: res
  };
};
export const fetchCampaignListMixSucsess = res => {
  return {
    type: FETCH_ALL_CAMPAIGN_MIX_SUCSESS,
    result: res.data
  };
};

export const updateCampaignStatusSucsess = res => {
  return {
    type: UPDATE_CAMPAIGNS_STATUS_SUCSESS,
    result: res
  };
};
export const updateCampaignStatusFailure = res => {
  return {
    type: COMMON_API_CAMPAIGNS_ERROR,
    result: res
  };
};
export const deleteCampaignDataFailurere = res => {
  return {
    type: COMMON_API_CAMPAIGNS_ERROR,
    result: res
  };
};
export const updateCampaignResetHopperSucsess = res => {
  return {
    type: RESET_CAMPAIGN_HOPPER_SUCSESS,
    result: res.data
  };
};

export const deleteCampaignDataSucsess = (res, id) => {
  return {
    type: DELETE_CAMPAIGN_DATA_SUCSESS,
    result: id
  };
};

export const fetchAllCampaignData = (current_page, page, search = "") => {
  return (dispatch, getState) => {
    dispatch(request_campaign_clear());
    campaignService
      .getAllCampaign(current_page, page, search)
      .then(res => {
        dispatch(fetchSucsessData(res));
      })
      .catch(function(error) {
        console.log(error);
      });
  };
};
