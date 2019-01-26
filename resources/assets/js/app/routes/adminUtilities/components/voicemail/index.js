import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import ERROR_404 from '../../../extraPages/routes/404';
import VoicemailList from './routes/voicemailList';
import EditVoicemail from './routes/voicemailEdit';

const Pages = ({match}) => (
    
        <Switch>
            <Redirect exact from={`${match.url}/`} to={`${match.url}/list`}/>
            <Route path={`${match.url}/list`} component={VoicemailList}/>
            <Route path={`${match.url}/edit/:id`} component={EditVoicemail}/>
            <Route path={`${match.url}/add`} component={EditVoicemail}/>
            <Route component={ERROR_404}/>
        </Switch>
  
);

export default Pages;
