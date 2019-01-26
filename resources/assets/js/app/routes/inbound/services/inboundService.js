import axios from "axios";

import {
  API_ALL_INBOUND,
  API_ALL_CAMAIGNTOGROUP,
  API_INBOUND_ALL_CALLMENU_INBOUND,
  API_ALL_FPG,
  API_INBOUND_DELETE_RECORD
} from "../constants/";

function getAllInbound(current_page = 1, page, search = "") {
  const requestOptions = {
    method: "GET",
    url: API_ALL_INBOUND,
    params: {
      search: search,
      limit: page,
      page: current_page
    }
  };

  return axios(requestOptions);
}
function getCallMenusData(group_id, current_page = 1, page = "", search = "") {
  const requestOptions = {
    method: "GET",
    url: API_INBOUND_ALL_CALLMENU_INBOUND,
    params: {
      search: search,
      limit: page,
      page: current_page,
      group_id: group_id
    }
  };

  return axios(requestOptions);
}
function getAllFpg(current_page = 1, page, search = "") {
  const requestOptions = {
    method: "GET",
    url: API_ALL_FPG,
    params: {
      search: search,
      limit: page,
      page: current_page
    }
  };

  return axios(requestOptions);
}
function deleteRecord(data) {
  const requestOptions = {
    method: "GET",
    url: API_INBOUND_DELETE_RECORD,
    params: data
  };
  return axios(requestOptions);
}


function updateRecord(res) {
  return axios.get(API_UPDATE_STATUS_SCRIPT, res);
}



function cloneRecord(res) {
  return axios.post(API_CLONE_SCRIPT, res);
}

function getAllfetchCampaignToGroup() {
  return axios.get(API_ALL_CAMAIGNTOGROUP);
}

export const inboundService = {
  getAllInbound,
  getAllfetchCampaignToGroup,
  getCallMenusData,
  getAllFpg,
  deleteRecord
};
