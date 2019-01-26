/*
 * Contians all the global method
 */

import React from "react";
import { NotificationManager } from "react-notifications";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
/*
 * Global constats
 */
global.DEFAULT_PAGE_SIZE = 25;
global.ERROR = "Error";
global.SUCCESS = "Success";
global.ERROR_MSG = "Something went wrong. Please try agin later!!!";
//global.GENRAL_MSG = 'Something went wrong. Please try agin later!';
global.VALIDATION_ERROR_MSG =
  "Please correct the validation error and try again.";

/**
 * Show react notification
 * @param {string} type Type of notification
 * @param {string} title Title for notification
 * @param {string} msg Message for notification
 */
export function createNotification(type, title, msg) {
  switch (type) {
    case "Info":
    case "info":
      return NotificationManager.info(msg, title);
      break;
    case "Success":
    case "success":
      return NotificationManager.success(msg, title);
      break;
    case "Warning":
    case "warning":
      return NotificationManager.warning(msg, title);
      break;
    case "Error":
    case "error":
      return NotificationManager.error(msg, title);
      break;
  }
}

export function getPageName(path) {
  return path.split("/")[4];
}

export function getPageParam(path) {
  return path.split("/").pop();
}
