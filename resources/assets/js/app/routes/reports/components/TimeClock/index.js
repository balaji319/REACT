import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import ERROR_404 from '../../../extraPages/routes/404';
import TimeClock from './routes/list';
import AgentTimeClock from './routes/agenttimeclock';
import GroupTimeClock from './routes/grouptimeclock';
import AgentTimeClockDetails from './routes/agenttimeclockdetails';

const Pages = ({match}) => (
        <Switch>
            <Redirect exact from={`${match.url}/`} to={`${match.url}/list`}/>
            <Route path={`${match.url}/list`} component={TimeClock}/>
            <Route path={`${match.url}/agenttimeclock`} component={AgentTimeClock}/>
            <Route path={`${match.url}/grouptimeclock`} component={GroupTimeClock}/>
            <Route path={`${match.url}/agenttimeclockdetails`} component={AgentTimeClockDetails}/>
            <Route component={ERROR_404}/>
        </Switch>
);

export default Pages;
