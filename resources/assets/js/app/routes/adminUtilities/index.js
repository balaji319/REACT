import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import ERROR_404 from '../extraPages/routes/404';
import Script from './components/script';
import DNCManagement from './components/dncManagement';
import Voicemail from './components/voicemail';
import Audio from './components/audio';
import Shifts from './components/shifts';
import CallTime from './components/callTime';
import YtelManagement from './components/ytelManagement';
import LeadFilter from './components/leadFilter';
import RecordingLogs from './components/recordingLogs';
import Audit from './components/audit';


const Pages = ({match}) => (
    <div >
        <Switch>
            <Redirect exact from={`${match.url}/`} to={`${match.url}/script`}/>
            <Route path={`${match.url}/script`} component={Script}/>
            <Route path={`${match.url}/dnc-list`} component={DNCManagement}/>
            <Route path={`${match.url}/audio-list`}component={Audio}/>
             <Route path={`${match.url}/voicemail-list`} component={Voicemail}/>
             <Route path={`${match.url}/lead-filter-list`} component={LeadFilter}/> 
             <Route path={`${match.url}/call-time`} component={CallTime}/>
             <Route path={`${match.url}/shifts`} component={Shifts}/>
             <Route path={`${match.url}/recordings`} component={RecordingLogs}/>
             <Route path={`${match.url}/ytel-management`} component={YtelManagement}/>
             <Route path={`${match.url}/system-audit`} component={Audit}/>
            
            <Route component={ERROR_404}/>
        </Switch>
    </div>
);

export default Pages;