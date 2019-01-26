import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import ERROR_404 from "../../../extraPages/routes/404";
import Agent from "./routes/list";
import agentTimeDetailReport from "./routes/agenttimedetailreport";
import agentStatusDetail from "./routes/agentstatusdetail";
import agentPerformanceDetail from "./routes/agentperformancedetail";
import TeamPerformanceDetail from "./routes/teamperformancedetail";
import PerformanceComparisonReport from "./routes/performancecomparisonreport";
import SingleAgentDaily from "./routes/singleagentdaily";
import AgentGroupLoginReport from "./routes/agentgrouploginreport";
import AgentStats from "./routes/agentstats";
import AgentTimeSheet from "./routes/agenttimesheet";
import AgentLoginDetail from "./routes/agentlogindetail";

const Pages = ({ match }) => (
  <Switch>
    <Redirect exact from={`${match.url}/`} to={`${match.url}/list`} />
    <Route path={`${match.url}/list`} component={Agent} />
    <Route
      path={`${match.url}/agentTimeDetailReport`}
      component={agentTimeDetailReport}
    />
    <Route
      path={`${match.url}/agentStatusDetail`}
      component={agentStatusDetail}
    />

    <Route
      path={`${match.url}/TeamPerformanceDetail`}
      component={TeamPerformanceDetail}
    />
    <Route
      path={`${match.url}/PerformanceComparisonReport`}
      component={PerformanceComparisonReport}
    />
    <Route
      path={`${match.url}/SingleAgentDaily`}
      component={SingleAgentDaily}
    />
    <Route
      path={`${match.url}/AgentGroupLoginReport`}
      component={AgentGroupLoginReport}
    />
    <Route path={`${match.url}/AgentStats`} component={AgentStats} />
    <Route path={`${match.url}/AgentStats/:id`} component={AgentStats} />
    <Route path={`${match.url}/AgentTimeSheet`} component={AgentTimeSheet} />
    <Route
      path={`${match.url}/AgentLoginDetail`}
      component={AgentLoginDetail}
    />
    <Route component={ERROR_404} />
  </Switch>
);

export default Pages;
