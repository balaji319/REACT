import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import ERROR_404 from '../../../extraPages/routes/404';

import AdvancedLead from './routes/advanced';

const Pages = ({match}) => (
    
        <Switch>
            <Redirect exact from={`${match.url}/`} to={`${match.url}/advanced`}/>
            <Route path={`${match.url}/advanced`} component={AdvancedLead}/>
            <Route component={ERROR_404}/>
        </Switch>
);

export default Pages;
