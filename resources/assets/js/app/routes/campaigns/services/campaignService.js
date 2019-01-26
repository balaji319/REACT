import axios from "axios";

export const campaignService = {
  getAllCampaign,
  updateRecord,
  deleteRecord,
  cloneRecord,
  getCampaignStatusData,
  updateCampaignStatusData,
  resetHopperData,
  deleteCampaignData,
  getCampaignListMixData,
  getLeadRecycleListData,
  getAreaCodesListData,
  getCampaignPauseCodeData,
  getCallTransferPresetsListData
};

import {
  API_ALL_CAMPAIGNS,
  API_CAMPAIGN_STATUS_CHANGE,
  API_CAMPAIGN_RESET_HOPPER,
  API_CAMPAIGN_DELETE_RECORD,
  API_CAMPAIGN_CUSTOM_STATUS_RECORD,
  API_CAMPAIGN_LIST_MIX_RECORD,
  API_CAMPAIGN_RECYCLE_RECORD,
  API_CAMPAIGN_PAUSE_CODE_LIST,
  API_AREA_CODE_LIST,
  API_CAMPAIGN_CALL_TRANSER_PRESET_LIST
} from "../constants/";

function getAllCampaign(current_page = 1, page, search = "") {
  const requestOptions = {
    method: "GET",
    url: API_ALL_CAMPAIGNS,
    params: {
      search: search,
      limit: page,
      page: current_page
    }
  };

  return axios(requestOptions);
}

function updateCampaignStatusData(data) {
  const requestOptions = {
    method: "PUT",
    url: API_CAMPAIGN_STATUS_CHANGE,
    params: data
  };

  return axios(requestOptions);
}

function resetHopperData(data) {
  const requestOptions = {
    method: "GET",
    url: API_CAMPAIGN_RESET_HOPPER,
    params: data
  };
  return axios(requestOptions);
}
function deleteCampaignData(data) {
  const requestOptions = {
    method: "GET",
    url: API_CAMPAIGN_DELETE_RECORD,
    params: data
  };
  return axios(requestOptions);
}

function getCampaignStatusData(current_page = 1, page, search = "") {
  const requestOptions = {
    method: "GET",
    url: API_CAMPAIGN_CUSTOM_STATUS_RECORD,
    params: {
      search: search,
      limit: page,
      page: current_page
    }
  };

  return axios(requestOptions);
}

function getCampaignListMixData(current_page = 1, page, search = "") {
  const requestOptions = {
    method: "GET",
    url: API_CAMPAIGN_LIST_MIX_RECORD,
    params: {
      search: search,
      limit: page,
      page: current_page
    }
  };

  return axios(requestOptions);
}

function getLeadRecycleListData(current_page = 1, page, search = "") {
  const requestOptions = {
    method: "GET",
    url: API_CAMPAIGN_RECYCLE_RECORD,
    params: {
      search: search,
      limit: page,
      page: current_page
    }
  };

  return axios(requestOptions);
}

function getAreaCodesListData(current_page = 1, page, search = "") {
  const requestOptions = {
    method: "GET",
    url: API_AREA_CODE_LIST,
    params: {
      search: search,
      limit: page,
      page: current_page
    }
  };

  return axios(requestOptions);
}
function getCampaignPauseCodeData(current_page = 1, page, search = "") {
  const requestOptions = {
    method: "GET",
    url: API_CAMPAIGN_PAUSE_CODE_LIST,
    params: {
      search: search,
      limit: page,
      page: current_page
    }
  };

  return axios(requestOptions);
}
function getCallTransferPresetsListData(current_page = 1, page, search = "") {
  const requestOptions = {
    method: "GET",
    url: API_CAMPAIGN_CALL_TRANSER_PRESET_LIST,
    params: {
      search: search,
      limit: page,
      page: current_page
    }
  };

  return axios(requestOptions);
}

function updateRecord(res) {
  return axios.get("api/admin-utilities/script-lists");
}
function deleteRecord(res) {
  return axios.get("api/admin-utilities/script-lists");
}
function cloneRecord(res) {
  return axios.get("api/admin-utilities/script-lists");
}
