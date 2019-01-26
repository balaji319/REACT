import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import ERROR_404 from '../../../extraPages/routes/404';

import DataSearch from './routes/search';
import SearchResult from './routes/search/list';

const Pages = ({match}) => (
    
        <Switch>
            <Redirect exact from={`${match.url}/`} to={`${match.url}/searchlead`}/>
            <Route path={`${match.url}/searchlead`} component={DataSearch}/>
            <Route path={`${match.url}/searchresult`} component={SearchResult}/>
            
            <Route component={ERROR_404}/>
        </Switch>
  
);

export default Pages;
