import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import ERROR_404 from '../extraPages/routes/404';
import allCampaigns from './components/allCampaigns';
import campaignStatus from './components/campaignStatus';
import DNCManagement from './components/dncManagement';
import Voicemail from './components/voicemail';
import Audio from './components/audio';
import campaignListMix from './components/CampaignListMix';
import PauseCodes from './components/pauseCodes';
import AreaCodes from './components/AreaCodes';
import LeadRecycle from './components/LeadRecycle';
import CallTransferPresets from './components/CallTransferPresets';

const Pages = ({match}) => (
    <div >
        <Switch>
            <Redirect exact from={`${match.url}/`} to={`${match.url}/allCampaigns`}/>
            <Route path={`${match.url}/allCampaigns`} component={allCampaigns}/>
            <Route path={`${match.url}/campaign-status`} component={campaignStatus}/>
            <Route path={`${match.url}/campaign-list-mix`} component={campaignListMix}/>
            <Route path={`${match.url}/dnc-number`} component={DNCManagement}/>
            <Route path={`${match.url}/voicemail`} component={Voicemail}/>
            <Route path={`${match.url}/audios`} component={Audio}/>
            <Route path={`${match.url}/pausecodes`} component={PauseCodes}/>
            <Route path={`${match.url}/areacodes`} component={AreaCodes}/>
            <Route path={`${match.url}/leadrecycle`} component={LeadRecycle}/>
            <Route path={`${match.url}/calltransferpresets`} component={CallTransferPresets}/>
            <Route component={ERROR_404}/>
        </Switch>
    </div>
);

export default Pages;