import { updateObject } from "../util/utility";

import {
  REQUEST_ALL_CAMPAIN_GLOBEL,
  FETCH_ALL_CAMPAIN_GLOBEL_SUCSESS,
  FETCH_ALL_CAMPAIN_GLOBEL_FAIL
} from "../constants/ActionTypes";

const initialState = {
  campaigns: [],
  isLoading: false,
  sectionin: "",
  status: false,
  showMessage: false,
  status_error: false,
  agents: [],
  agent_c: [],
  agentgroup: [],
  inboundgroupoption: [],
  scriptlist: [],
  callMenuList: [],
  phongroup: [],
  calltimelist: [],
  dids: [],
  did_pattern_list: [],
  clone_did_ids: [],
  agentgroup_custom: [],
  camp_only: [],
  phoneList:[],
  phoneListData:[],
  voicemail:[]

};

const Globel = (state = initialState, action) => {
  switch (action.type) {
    case REQUEST_ALL_CAMPAIN_GLOBEL:
      return updateObject(state, { isLoading: true, status_error: false });
    // for inbound data
    case FETCH_ALL_CAMPAIN_GLOBEL_SUCSESS:
      return updateObject(state, {
        isLoading: false,
        campaigns: action.result.data.campaign,
        agents: action.result.data.agent,
        agent_c: action.result.data.agent_c,
        agentgroup: action.result.data.agentgroup,
        inboundgroupoption: action.result.data.inboundgroupoption,
        scriptlist: action.result.data.scriptlist,
        callMenuList: action.result.data.callmenu,
        phongroup: action.result.data.phongroup,
        dids: action.result.data.dids,
        calltimelist: action.result.data.calltimelist,
        did_pattern_list: action.result.data.did_pattern_list,
        clone_did_ids: action.result.data.clone_did_ids,
        agentgroup_custom: action.result.data.agentgroup_custom,
        camp_only: action.result.data.camp_only,
        phoneList: action.result.data.phoneList,
        voicemail: action.result.data.voicemail,
        phoneListData: action.result.data.phoneListData,
        sectionin: "Globel "
      });

    case FETCH_ALL_CAMPAIN_GLOBEL_FAIL:
      return updateObject(state, {
        isLoading: false,
        sectionin: "Globel",
        status: false,
        showMessage: true,
        status_error: true
      });

    default:
      return state;
  }
};

export default Globel;
