
import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux';
import Settings from './Settings';


import adminUtilitieReducer from '../app/routes/adminUtilities/reducers/adminUtilitieReducer';
import inboundReducer from '../app/routes/inbound/reducers/inboundReducer';


import agentReducer from '../app/routes/agent/reducers/agentReducer';
import campaignReducer from '../app/routes/campaigns/reducers/campaignReducer';
//import scriptReducer from '../app/routes/campaigns/reducers/scriptReducer';

import UserGroupList from '../app/routes/reports/reducers/UsergroupReducer';
import StatusesList from '../app/routes/reports/reducers/StatusesReducer';
import Globel from './Globel';

import Auth from './Auth';
import campaignListReducer from '../app/routes/reports/reducers/campaignListReducer';
import usersReducer from '../app/routes/reports/reducers/usersReducer';
import combineAgentReducer from '../app/routes/reports/reducers/combineAgentReducer';
import inboundDidListReducer from '../app/routes/reports/reducers/inboundDidListReducer';


const reducers = combineReducers({

    routing: routerReducer,
    settings: Settings,
    auth: Auth,
    inbound:inboundReducer,
    agentGroupList:agentReducer,
    agent:agentReducer,
    campaign:campaignReducer,
    globel:Globel,
    campaign_list: campaignListReducer,
    users_list: usersReducer,
    usergrouplist : UserGroupList,
    statusesList : StatusesList,
    combine_agent_list : combineAgentReducer,
    inbound_did_list : inboundDidListReducer,
    admin_utilites:adminUtilitieReducer,


});


export default reducers;
