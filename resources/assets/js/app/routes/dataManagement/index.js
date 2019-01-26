import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import ERROR_404 from '../extraPages/routes/404';
import DataList from './components/datalist';

import DataSearch from './components/datasearch';
import CustomFields from './components/CustomFields';
import CopyCustomFields from './components/CopyCustomFields';
import BasicLeads from './components/basicLeads';
import AdvancedLeads from './components/advancedLeads';
import AdvancedListRule from './components/advancedListRule';
import DataLoader from './components/dataLoader';
const Pages = ({match}) => (
    <div >
        <Switch>
            <Redirect exact from={`${match.url}/`} to={`${match.url}/data-list`}/>
            <Route path={`${match.url}/data-list`} component={DataList}/>
            <Route path={`${match.url}/advanced-list-rule`} component={AdvancedListRule}/>
            <Route path={`${match.url}/data-search`} component={DataSearch}/>
            <Route path={`${match.url}/list-custom-fields`} component={CustomFields}/>
            <Route path={`${match.url}/copy-custom-fields`} component={CopyCustomFields}/>
            <Route path={`${match.url}/basic-leads`} component={BasicLeads}/>
            <Route path={`${match.url}/advanced-leads`} component={AdvancedLeads}/>
            <Route path={`${match.url}/data-loader`} component={DataLoader}/>

            
            <Route component={ERROR_404}/>
        </Switch>
    </div>
);

export default Pages;
