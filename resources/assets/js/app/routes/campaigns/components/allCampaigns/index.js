import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import ERROR_404 from "../../../extraPages/routes/404";
import List from "./routes/list";
import Edit from "./routes/edit";
import Hopper from "./routes/list/comman/hopper";
import Clist from "./routes/list/comman/list";
import Callback from "./routes/list/comman/CallbackHoldListing";
const Pages = ({ match }) => (
  <Switch>
    <Redirect exact from={`${match.url}/`} to={`${match.url}/list`} />
    <Route path={`${match.url}/list`} component={List} />
    <Route path={`${match.url}/edit/:id`} component={Edit} />
    <Route path={`${match.url}/add`} component={Edit} />
    <Route path={`${match.url}/hopper/:id`} component={Hopper} />
    <Route path={`${match.url}/clist/:id`} component={Clist} />
    <Route path={`${match.url}/callback/:id`} component={Callback} />
    <Route path={`${match.url}/hopper/`} component={Hopper} />
    <Route path={`${match.url}/clist`} component={List} />
    <Route path={`${match.url}/callback`} component={List} />
    <Route path={`${match.url}/edit`} component={List}/>
    <Route component={ERROR_404} />
  </Switch>
);

export default Pages;
