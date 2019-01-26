import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import ERROR_404 from '../../../extraPages/routes/404';
import Inbound from './routes/list';
import InboundGroup from './routes/inboundgroup';
import InboundGroupDid from './routes/inboundgroupdid';
import ServiceLevel from './routes/servicelevel';
import SummaryHourly from './routes/summaryhourly';
import InboundDaily from './routes/inbounddaily';
import InboundDid from './routes/inbounddid';
import InboundIvr from './routes/inboundivr';
import OutboundCalling from './routes/outboundcalling';
import OutboundSummaryInterval from './routes/outboundsummaryinterval';
import OutboundIvr from './routes/outboundivr';
import FronterCloser from './routes/frontercloser';
import ListsCampaignStatuses from './routes/listscampaignstatuses';
import CampaignStatus from './routes/campaignstatus';
import ExportCall from './routes/exportcall';
import ExportLeads from './routes/exportleads';


const Pages = ({match}) => (
        <Switch>
            <Redirect exact from={`${match.url}/`} to={`${match.url}/list`}/>
            <Route path={`${match.url}/list`} component={Inbound}/>
            <Route path={`${match.url}/inboundgroup`} component={InboundGroup}/>
            <Route path={`${match.url}/inboundgroupdid`} component={InboundGroupDid}/>
            <Route path={`${match.url}/inboundgroupdid`} component={InboundGroupDid}/>
            <Route path={`${match.url}/servicelevel`} component={ServiceLevel}/>
            <Route path={`${match.url}/summaryhourly`} component={SummaryHourly}/>
            <Route path={`${match.url}/inbounddaily`} component={InboundDaily}/>
            <Route path={`${match.url}/inbounddid`} component={InboundDid}/>
            { <Route path={`${match.url}/inboundivr`} component={InboundIvr}/>}
            <Route path={`${match.url}/outboundcalling`} component={OutboundCalling}/>
            <Route path={`${match.url}/outboundsummaryinterval`} component={OutboundSummaryInterval}/>
            <Route path={`${match.url}/outboundivr`} component={OutboundIvr}/>
            <Route path={`${match.url}/frontercloser`} component={FronterCloser}/>
            <Route path={`${match.url}/listscampaignstatuses`} component={ListsCampaignStatuses}/>
            <Route path={`${match.url}/campaignstatus`} component={CampaignStatus}/>
            <Route path={`${match.url}/exportcall`} component={ExportCall}/>
            <Route path={`${match.url}/exportleads`} component={ExportLeads}/>
            
            <Route component={ERROR_404}/>
        </Switch>
);

export default Pages;
