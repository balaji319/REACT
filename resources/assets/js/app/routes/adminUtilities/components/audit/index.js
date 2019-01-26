import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import ERROR_404 from '../../../extraPages/routes/404';
import Event from './routes/event';
import Access from './routes/access';
import List from './routes/list';


const Pages = ({match}) => (

        <Switch>
            <Redirect exact from={`${match.url}/`} to={`${match.url}/list`}/>
            <Route path={`${match.url}/event`} component={Event}/>	
            <Route path={`${match.url}/access`} component={Access}/>
             <Route path={`${match.url}/list`} component={List}/>
            <Route component={ERROR_404}/>
        </Switch>
  
);	

export default Pages;
