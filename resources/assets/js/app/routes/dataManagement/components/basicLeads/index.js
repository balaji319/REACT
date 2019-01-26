import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import ERROR_404 from '../../../extraPages/routes/404';


import BasicLead from './routes/basic';


const Pages = ({match}) => (
    
        <Switch>
            <Redirect exact from={`${match.url}/`} to={`${match.url}/basic`}/>
            <Route path={`${match.url}/basic`} component={BasicLead}/>
            <Route component={ERROR_404}/>
        </Switch>
  
);

export default Pages;
