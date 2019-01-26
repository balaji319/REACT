import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import ERROR_404 from '../../../extraPages/routes/404';
import List from './routes/list';
import Dashboard from './routes/list/Dashboard';
import UploadFiles from './routes/list/UploadFiles';
import DataLoaderQueue from './routes/list/DataLoaderQueue';
import UploadedFiles from './routes/list/UploadedFiles';

const Pages = ({match}) => (
    
        <Switch>
            <Redirect exact from={`${match.url}/`} to={`${match.url}/dashboard`}/>
            <Route path={`${match.url}/dashboard`} component={Dashboard}/>
            <Route path={`${match.url}/upload-files`} component={UploadFiles}/>
            <Route path={`${match.url}/data-loader-queue`} component={DataLoaderQueue}/>
            <Route path={`${match.url}/uploaded-files`} component={UploadedFiles}/>
            <Route component={ERROR_404}/>
        </Switch>
  
);

export default Pages;
