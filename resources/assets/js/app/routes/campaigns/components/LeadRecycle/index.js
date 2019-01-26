import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import ERROR_404 from '../../../extraPages/routes/404';
import List from './routes/list';
import Edit from './routes/edit';

const Pages = ({match}) => (

        <Switch>
            <Redirect exact from={`${match.url}/`} to={`${match.url}/list`}/>
            <Route path={`${match.url}/list`} component={List}/>
            <Route path={`${match.url}/edit/:id`} component={Edit}/>
            <Route path={`${match.url}/edit/`} component={Edit}/>
            <Route component={ERROR_404}/>
        </Switch>

);

export default Pages;
