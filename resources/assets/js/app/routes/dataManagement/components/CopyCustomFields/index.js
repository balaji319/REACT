import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import ERROR_404 from '../../../extraPages/routes/404';


import CopyField from './routes/copyfield';


const Pages = ({match}) => (
    
        <Switch>
            <Redirect exact from={`${match.url}/`} to={`${match.url}/copycustom`}/>
            <Route path={`${match.url}/copycustom`} component={CopyField}/>
            <Route component={ERROR_404}/>
        </Switch>
  
);

export default Pages;
