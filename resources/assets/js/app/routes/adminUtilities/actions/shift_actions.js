import axios from "axios";

import {
  REQUEST_ADMINU_SHIFT,
  FETCH_ALL_ADMIN_SHIFT_SUCSESS,
  ADD_ADMIN_SHIFT_REQUEST,
  ADD_ADMIN_SHIFT_SUCSESS,
  GET_ADMIN_SHIFT_SUCSESS,
  EDIT_ADMIN_SHIFT_REQUEST,
  REQUEST_ADMINU_SHIFT_UPDATE_FAIL
} from "../constants/";

import { shiftService } from "../services/";

// call redusers action  agents

export const request_shift = res => {
  return { type: REQUEST_ADMINU_SHIFT };
};
export const fetchAddShiptUnSucsess = res => {
  return { type: REQUEST_ADMINU_SHIFT_UPDATE_FAIL, result: res.data };
};

export const fetchShiptsSucsess = res => {
  return { type: FETCH_ALL_ADMIN_SHIFT_SUCSESS, result: res.data };
};

export const request_addshift = res => {
  return { type: ADD_ADMIN_SHIFT_REQUEST };
};

export const fetchAddShiptSucsess = res => {
  return { type: ADD_ADMIN_SHIFT_SUCSESS, result: res.data };
};

export const fetchShiptSucsess = res => {
  return { type: GET_ADMIN_SHIFT_SUCSESS, result: res.data };
};

export const fetchAllShifts = res => {
  return (dispatch, getState) => {
    dispatch(request_shift(res));
    shiftService
      .getAllShifts()
      .then(res => {
        dispatch(fetchShiptsSucsess(res));
      })
      .catch(function(error) {
        console.log(error);
      });
  };
};

export const fetchShift = res => {
  return (dispatch, getState) => {
    dispatch(request_shift(res));
    shiftService
      .getShift(res)
      .then(res => {
        dispatch(fetchShiptSucsess(res));
      })
      .catch(function(error) {
        console.log(error);
      });
  };
};

export const addShift = res => {
  return (dispatch, getState) => {
    dispatch(request_addshift(res));
    shiftService
      .addShift(res)
      .then(res => {
        dispatch(fetchAddShiptSucsess(res));
      })
      .catch(function(error) {
        dispatch(fetchAddShiptUnSucsess(error.response));
      });
  };
};
