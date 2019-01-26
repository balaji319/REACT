
import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import ERROR_404 from '../extraPages/routes/404';
import AgentGroup from './components/AgentGroup';
import Agents from './components/Agents';

const Pages = ({match}) => (
    <div >
        <Switch>
            <Redirect exact from={`${match.url}/`} to={`${match.url}/agents`}/>
            <Route path={`${match.url}/agents`} component={Agents}/>
            <Route path={`${match.url}/groups`} component={AgentGroup}/>
            <Route component={ERROR_404}/>
        </Switch>
    </div>
);

export default Pages;

