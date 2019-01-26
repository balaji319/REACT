import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import ERROR_404 from '../extraPages/routes/404';
import CampaignSummary from './components/CampaignSummary';
import Calls from './components/Call';

import DownloadReports from './components/DownloadReports';
import Agent from './components/Agent';
import TimeClock from './components/TimeClock';

const Pages = ({match}) => (
    <div >
        <Switch>
            <Redirect exact from={`${match.url}/`} to={`${match.url}/dashboard`}/>
            <Route path={`${match.url}/dashboard`} component={CampaignSummary}/>
            <Route path={`${match.url}/calls`} component={Calls}/>
            <Route path={`${match.url}/download-reports`} component={DownloadReports}/>
            <Route path={`${match.url}/agent-reports`} component={Agent}/>
            <Route path={`${match.url}/time-clock`} component={TimeClock}/>
            <Route component={ERROR_404}/>
        </Switch>
    </div>
);

    export default Pages;

