import React from "react";
import { ConnectedRouter } from "react-router-redux";
import { Provider } from "react-redux";
import { Route, Switch } from "react-router-dom";
import configureStore, { history } from "./store";

import App from "./containers/App";
var { registerObserver } = require("react-perf-devtool");

// Simple, no?
registerObserver();
export const store = configureStore();

// set auth token
let auth_token = localStorage.getItem("access_token");
if (auth_token) {
  axios.defaults.headers.common["Content-Type"] = "application/json";
  axios.defaults.headers.common["Authorization"] = "Bearer " + auth_token;
  //axios.defaults.baseURL = "https://ccx-dev5.ytel.com";
}

window.axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // let errorResponse = error.response;
    //    if (error.response.status === 405 ) {
    //     localStorage.removeItem('user_id');
    //     localStorage.removeItem('access_token');
    //     localStorage.removeItem('db_details');
    //     localStorage.removeItem('selected_db');
    //     localStorage.removeItem('x5_contact_id');
    //     localStorage.removeItem('company_id');
    //     location.reload();
    //  }

    //alert(error.response.status)
    return Promise.reject(error);
  }
);

const MainApp = () => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Switch>
        <Route path="/" component={App} />
      </Switch>
    </ConnectedRouter>
  </Provider>
);

export default MainApp;