import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import ERROR_404 from "../../../extraPages/routes/404";
import List from "./routes/list";
import Edit from "./routes/edit";
import didInGroup from "./../comman/didInGroup/";
import callMenuInGroup from "./../comman/CallMenu/";
import AssignCampaignToGroup from "./../comman/AssignCampaignToGroup/";
import didInGroupNumber from "./../comman/Did/";

const Pages = ({ match }) => (
  <Switch>
    <Redirect exact from={`${match.url}/`} to={`${match.url}/list`} />
    <Route path={`${match.url}/list`} component={List} />
    <Route path={`${match.url}/edit/:id`} component={Edit} />
    <Route path={`${match.url}/add`} component={Edit} />
    <Route path={`${match.url}/InboundGroup/`} component={didInGroup} />
    <Route path={`${match.url}/didInGroup/`} component={didInGroupNumber} />
    <Route path={`${match.url}/callMenuInGroup/`} component={callMenuInGroup} />
    <Route
      path={`${match.url}/assignCampaignToGroup/`}
      component={AssignCampaignToGroup}
    />
    <Route path={`${match.url}/edit`} component={List} />
    <Route component={ERROR_404} />
  </Switch>
);

export default Pages;
