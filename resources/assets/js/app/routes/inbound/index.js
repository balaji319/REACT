import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import ERROR_404 from "../extraPages/routes/404";
import InboundGroup from "./components/InboundGroup";
import InboundNumbers from "./components/InboundNumbers";
import CallMenu from "./components/CallMenu";
import Listfpg from "./components/Listfpg";
import Fpg from "./components/Fpg";

const Pages = ({ match }) => (
  <div>
    <Switch>
      <Redirect exact from={`${match.url}/`} to={`${match.url}/group`} />
      <Route path={`${match.url}/group`} component={InboundGroup} />
      <Route path={`${match.url}/number`} component={InboundNumbers} />
      <Route path={`${match.url}/callmenu`} component={CallMenu} />
      <Route path={`${match.url}/list-fpg`} component={Listfpg} />
      <Route path={`${match.url}/fpg`} component={Fpg} />

      <Route component={ERROR_404} />
    </Switch>
  </div>
);

export default Pages;
