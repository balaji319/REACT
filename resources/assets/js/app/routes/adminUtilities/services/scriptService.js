import axios from "axios";

import {
  API_ALL_SCRIPT,
  API_UPDATE_STATUS_SCRIPT,
  API_DELETE_SCRIPT,
  API_CLONE_SCRIPT
} from "../constants/";

function getAllScript(current_page , page, search = "") {

  const requestOptions = {
    method: "GET",
    url: API_ALL_SCRIPT,
    params: {
      search: search,
      limit: page,
      page: current_page
    }
  };

  return axios(requestOptions);
}

function updateRecord(res) {
  return axios.post(API_UPDATE_STATUS_SCRIPT, res);
}
function deleteRecord(res) {
  return axios.post(API_DELETE_SCRIPT, res);
}
function cloneRecord(res) {
  return axios.post(API_CLONE_SCRIPT, res);
}

export const scriptService = {
  getAllScript,
  updateRecord,
  deleteRecord,
  cloneRecord
};
