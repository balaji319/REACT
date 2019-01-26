import React from "react";
import ReactDOM from "react-dom";

window.axios = require("axios");

const rootEl = document.getElementById("app");

let auth_token = localStorage.getItem("access_token");
if (auth_token) {
  axios.defaults.headers.common["Content-Type"] = "application/json";
  axios.defaults.headers.common["Authorization"] = "Bearer " + auth_token;
  //axios.defaults.baseURL = "https://ccx-dev5.ytel.com";
}
var { registerObserver } = require("react-perf-devtool");

// Simple, no?
registerObserver();
var length = document.querySelectorAll(".app-login-container").length;
var el = document.getElementById("app");
length > 0
  ? (el.className += "Ycc-login-bg")
  : el.classList.remove("Ycc-login-bg");

// Create a reusable render method that we can call more than once
let render = () => {
  // Dynamically import our main App component, and render it
  const MainApp = require("./MainApp").default;
  ReactDOM.render(<MainApp />, rootEl);
};

if (module.hot) {
  module.hot.accept("./MainApp", () => {
    const NextApp = require("./MainApp").default;
    render(<NextApp />, rootEl);
  });
}

render();