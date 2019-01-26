import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import ERROR_404 from '../../../extraPages/routes/404';
import List from './routes/list';
import Edit from './routes/edit';
import campaignRank from './../comman/campaignRank/';
import inboundGroups from './../comman/inboundGroups/';
import userCallbackHoldListing from './../comman/userCallbackHoldListing/';
import userStatus from './../comman/userStatus/';

const Pages = ({match}) => (

        <Switch>
            <Redirect exact from={`${match.url}/`} to={`${match.url}/list`}/>
            <Route path={`${match.url}/list`} component={List}/>
            <Route path={`${match.url}/edit/:id`} component={Edit}/>
            <Route path={`${match.url}/campaignrank/`} component={campaignRank}/>
            <Route path={`${match.url}/inboundgroup/`} component={inboundGroups}/>
            <Route path={`${match.url}/usercallback/`} component={userCallbackHoldListing}/>
            <Route path={`${match.url}/userstatus/`} component={userStatus}/>
            <Route path={`${match.url}/edit`} component={List}/>
            <Route component={ERROR_404}/>
        </Switch>

);

export default Pages;
