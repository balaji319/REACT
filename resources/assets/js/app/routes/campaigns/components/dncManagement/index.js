import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import ERROR_404 from '../../../extraPages/routes/404';
import DncList from './routes/dncList';

const Pages = ({match}) => (
    
        <Switch>
            <Redirect exact from={`${match.url}/`} to={`${match.url}/list`}/>
            <Route path={`${match.url}/list`} component={DncList}/>
            <Route component={ERROR_404}/>
        </Switch>
  
);

export default Pages;
