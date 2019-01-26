import axios from "axios";

import {
  API_ALL_ADMIN_SHIFT,
  API_ADD_ADMIN_SHIFT,
  API_GET_ADMIN_SHIFT,
  API_ADMIN_U_EDIT_SHIFT
} from "../constants/";

function getAllShifts() {
  return axios.get(API_ALL_ADMIN_SHIFT);
}

function addShift(res) {
  if (res.type == "edit") {
    return axios.post(API_ADMIN_U_EDIT_SHIFT, res);
  } else {
    return axios.post(API_ADD_ADMIN_SHIFT, res);
  }
}

function getShift(id) {
  return axios.get(API_GET_ADMIN_SHIFT + id);
}

export const shiftService = {
  getAllShifts,
  addShift,
  getShift
};
