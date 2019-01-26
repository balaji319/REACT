/*
 * Created on Thu Aug 16 2018
 *
 * Copyright (c) 2018 Your Company
 */

import React, { Component, Fragment } from "react";
import { UncontrolledAlert, Alert } from "reactstrap";
import SweetAlert from "react-bootstrap-sweetalert";
import Paper from "@material-ui/core/Paper";
import Switch from "@material-ui/core/Switch";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import ContainerHeader from "../../../../../../../components/ContainerHeader/index";
import CardBox from "../../../../../../../components/CardBox/index";
import { style_header, listPause } from "./data";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import CircularProgress from "@material-ui/core/CircularProgress";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import IntlMessages from "../../../../../../../util/IntlMessages";
import ButtonNav from "../../../../../../../components/navButton/";
import VoicemailPopUp from "./VoicemailPopUp";
import { createNotification } from "../../../../../../../Helpers";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Divider from "@material-ui/core/Divider";
import AUDIO_MANAGER from "./audio_manager";
import { API_FETCH_CAMPAIGN_EDIT_DATA } from "../../../../constants";

import {
  list_order_data,
  list_minimum_hopper,
  list_next_agent_call,
  list_dialed,
  drop_action_list,
  mailList,
  list_campaign_recording,
  list_per_call_notes,
  list_agent_pause_codes_active,
  list_agent_lead_search,
  list_agent_lead_search_method,
  list_get_call_launch,
  list_enable_xfer_presets,
  list_quick_transfer_button,
  list_custom_3way_button_transfer,
  list_prepopulate_transfer_preset,
  list_scheduled_callbacks_alert,
  list_scheduled_callbacks_count,
  list_use_internal_dnc,
  list_use_campaign_dnc,
  list_view_calls_in_queue,
  list_view_calls_in_queue_launch,
  list_manual_preview_dial,
  list_three_way_call_cid,
  list_screen_labels,
  AUDIO_FILE
} from "./data";
import axios from "axios";

class EditCampaign extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pageTitle: this.props.location.pathname.split("/")[4],
      campaign_id:
        this.props.location.pathname.split("/")[4] == "add"
          ? ""
          : this.props.location.pathname.split("/").pop(),
      pageError: false,
      isLoding: false,
      showinfo: "Hover to the input on left and help text will come up here :)",
      showinfotitle: "Help Block",
      scriptField: "",
      campaign_description: "",
      campaign_name: "",
      park_music_onhold: "",
      lead_order: "",
      call_count_limit: "",
      campaign_changedate: "",
      active: "",
      park_file_name: "",
      web_form_address: "",
      web_form_address_two: "",
      lead_order_randomize: "",
      list_order_mix: "",
      lead_filter_id: "",
      hopper_level: "",
      dial_method: "",
      default_lead_preview: "",
      auto_dial_level: "",
      next_agent_call: "",
      local_call_time: "",
      dial_timeout: "",
      campaign_cid: "",
      use_custom_cid: "",
      manual_dial_cid: "",
      drop_call_seconds: "",
      drop_action: "",
      safe_harbor_audio: "",
      campaign_vdad_exten: "",
      campaign_recording: "",
      campaign_rec_filename: "",
      per_call_notes: "",
      agent_pause_codes_active: "",
      agent_lead_search: "",
      agent_lead_search_method: "",
      campaign_script: "",
      get_call_launch: "",
      enable_xfer_presets: "",
      quick_transfer_button: "",
      xferconf_a_number: "",
      custom_3way_button_transfer: "",
      prepopulate_transfer_preset: "",
      scheduled_callbacks: "",
      scheduled_callbacks_alert: "",
      scheduled_callbacks_count: "",
      use_internal_dnc: "",
      use_campaign_dnc: "",
      screen_labels: "",
      display_queue_count: "",
      view_calls_in_queue: "",
      grab_calls_in_queue: "",
      view_calls_in_queue_launch: "",
      three_way_call_cid: "",
      manual_preview_dial: "",
      crm_login_address: "",
      start_call_url: "",
      dispo_call_url: "",
      na_call_url: "",
      music_list_data: [],
      lead_filter_array: [],
      is_change: false,
      audio_dialog: false,
      selectedValue: mailList[1].mailboxes,
      voicemail_ext: mailList[1].mailboxes,
      inbound_group_array: [],
      call_menu_array: []
    };
  }

  componentDidMount() {
    let _this = this;
    if (this.state.pageTitle == "edit") {
      setTimeout(function() {
        _this.getData();
      }, 100);
    }
  }
  handleRequestClose = value => {
    this.setState({ voicemail_ext: value, open: false });
  };
  handleRequestCloseAudio = value => {
    alert(value);
    this.setState({ audio_dialog: false });
  };

  getData = e => {
    let _this = this;
    _this.setState({ isLoding: true });
    axios
      .get(API_FETCH_CAMPAIGN_EDIT_DATA + this.state.campaign_id)
      .then(response => {
        let campaignData = response.data.data;
        _this.setState({
          //data: campaignData
          isLoding: false,
          campaignName: campaignData.campaign.campaign_name,
          campaign_name: campaignData.campaign.campaign_name,
          campaign_description: campaignData.campaign.campaign_description,
          park_music_onhold: campaignData.campaign.park_file_name,
          lead_order: campaignData.campaign.lead_order,
          call_count_limit: campaignData.campaign.call_count_limit,
          campaign_changedate: campaignData.campaign.campaign_changedate,
          active: campaignData.campaign.active,
          park_file_name: campaignData.campaign.park_file_name,
          web_form_address: campaignData.campaign.web_form_address,
          web_form_address_two: campaignData.campaign.web_form_address_two,
          lead_order_randomize: campaignData.campaign.lead_order_randomize,
          list_order_mix: campaignData.campaign.list_order_mix,
          lead_filter_id: campaignData.campaign.lead_filter_id,
          hopper_level: campaignData.campaign.hopper_level,
          dial_method: campaignData.campaign.dial_method,
          default_lead_preview: campaignData.campaign.default_lead_preview,
          auto_dial_level: campaignData.campaign.auto_dial_level,
          next_agent_call: campaignData.campaign.next_agent_call,
          local_call_time: campaignData.campaign.local_call_time,
          dial_timeout: campaignData.campaign.dial_timeout,
          campaign_cid: campaignData.campaign.campaign_cid,
          use_custom_cid: campaignData.campaign.use_custom_cid,
          manual_dial_cid: campaignData.campaign.manual_dial_cid,
          drop_call_seconds: campaignData.campaign.drop_call_seconds,
          drop_action: campaignData.campaign.drop_action,
          safe_harbor_audio: campaignData.campaign.safe_harbor_audio,
          campaign_vdad_exten: campaignData.campaign.campaign_vdad_exten,
          campaign_recording: campaignData.campaign.campaign_recording,
          campaign_rec_filename: campaignData.campaign.campaign_rec_filename,
          per_call_notes: campaignData.campaign.per_call_notes,
          agent_pause_codes_active:
            campaignData.campaign.agent_pause_codes_active,
          agent_lead_search: campaignData.campaign.agent_lead_search,
          agent_lead_search_method:
            campaignData.campaign.agent_lead_search_method,
          campaign_script: campaignData.campaign.campaign_script,
          get_call_launch: campaignData.campaign.get_call_launch,
          enable_xfer_presets: campaignData.campaign.enable_xfer_presets,
          quick_transfer_button: campaignData.campaign.quick_transfer_button,
          xferconf_a_number: campaignData.campaign.xferconf_a_number,
          custom_3way_button_transfer:
            campaignData.campaign.custom_3way_button_transfer,
          prepopulate_transfer_preset:
            campaignData.campaign.prepopulate_transfer_preset,
          scheduled_callbacks: campaignData.campaign.scheduled_callbacks,
          scheduled_callbacks_alert:
            campaignData.campaign.scheduled_callbacks_alert,
          scheduled_callbacks_count:
            campaignData.campaign.scheduled_callbacks_count,
          use_internal_dnc: campaignData.campaign.use_internal_dnc,
          use_campaign_dnc: campaignData.campaign.use_campaign_dnc,
          screen_labels: campaignData.campaign.screen_labels,
          display_queue_count: campaignData.campaign.display_queue_count,
          view_calls_in_queue: campaignData.campaign.view_calls_in_queue,
          grab_calls_in_queue: campaignData.campaign.grab_calls_in_queue,
          view_calls_in_queue_launch:
            campaignData.campaign.view_calls_in_queue_launch,
          three_way_call_cid: campaignData.campaign.three_way_call_cid,
          manual_preview_dial: campaignData.campaign.manual_preview_dial,
          crm_login_address: campaignData.campaign.crm_login_address,
          start_call_url: campaignData.campaign.start_call_url,
          dispo_call_url: campaignData.campaign.dispo_call_url,
          na_call_url: campaignData.campaign.na_call_url,
          music_list_data: campaignData.music,
          lead_filter_array: campaignData.lead_filter_array,
          inbound_group_array: campaignData.inbound_group,
          call_menu_array: campaignData.call_menu

          /*   scriptComment: campaignData.script_comments,
                    scriptActive: campaignData.active==='Y'?true:false,
                    scriptActiveValue: campaignData.active,
                    scriptText: campaignData.script_text,
                    campaignNameError :false,
                    scriptCommentError:false,
                    scriptTextError:false,
                    campaign_idError:false,*/
        });

        if (response.data.status === "Error") {
          _this.setState({ pageError: true });
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  logMouseEnter = e => {
    if (e.target.getAttribute("data-info")) {
      this.setState({ showinfo: e.target.getAttribute("data-info") }),
        this.setState({ showinfotitle: e.target.getAttribute("data-title") });
    }
  };
  handleListItemClick = value => {
    this.setState({ safe_harbor_audio: value });
  };
  logMouseLeave = e => {
    if (e) {
    }
  };
  handledOpenAudioManagerDialog = () => {
    this.setState({ audio_dialog: !this.state.audio_dialog });
  };
  getDynamicDrop = Index => {
    if (Index) {
      switch (Index) {
        case "HANGUP":
          return this.getHangInformation();
        case "AUDIO":
          return this.getAudioInformation();
        case "MESSAGE":
          return this.getMESSAGEInformation();
        case "VOICEMAIL":
          return this.getVOICEMAILInformation();
        case "VMAIL_NO_INST":
          return this.getVOICEMAILInformation();
        case "IN_GROUP":
          return this.getIN_GROUP();
        case "CALLMENU":
          return this.getCALLMENU();
        default:
          return "Uknown stepIndex";
      }
    }
  };
  getHangInformation = () => {
    return <div className="container-fluid" style={{ display: "flex" }} />;
  };

  getMESSAGEInformation = () => {
    return (
      <Fragment>
        <div
          className="col-md-12 col-12"
          data-title="Voicemail Detection"
          data-info="This field allows for a custom outbound routing extension. This allows you to use different call handling methods depending upon how you want to route calls through your outbound campaign. Formerly called Campaign VDAD extension.- 8368 - DEFAULT - Will send the call to the next available agent no matter what server they are on- 8369 - Used for Answering Machine Detection after that, same behavior as 8368."
          onMouseEnter={this.logMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <TextField
            id="dropActiondropext_safe_harbor_exten"
            label="Safe Harbor Exten*"
            margin="normal"
            onChange={this.handleChange("safe_harbor_exten")}
            fullWidth
            value={this.state.safe_harbor_exten}
          />
        </div>
      </Fragment>
    );
  };
  getAudioInformation = () => {
    return (
      <Fragment>
        <div
          className="col-md-12 col-12"
          data-title="Voicemail Detection"
          data-info="This field allows for a custom outbound routing extension. This allows you to use different call handling methods depending upon how you want to route calls through your outbound campaign. Formerly called Campaign VDAD extension.- 8368 - DEFAULT - Will send the call to the next available agent no matter what server they are on- 8369 - Used for Answering Machine Detection after that, same behavior as 8368."
          onMouseEnter={this.logMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <p />

          <div className="">
            <TextField
              id="Audio "
              label="Safe Harbor Audio "
              margin="normal"
              onChange={this.handleChange("safe_harbor_audio")}
              fullWidth
              value={this.state.safe_harbor_audio}
            />{" "}
            <Button
              color="primary"
              className="jr-btn bg-primary text-white"
              onClick={this.handledOpenAudioManagerDialog}
            >
              Select/Manage Audio
            </Button>
          </div>
        </div>
      </Fragment>
    );
  };
  getVOICEMAILInformation = () => {
    return (
      <Fragment>
        <div
          className="col-md-12 col-12"
          data-title="Voicemail Detection"
          data-info="This field allows for a custom outbound routing extension. This allows you to use different call handling methods depending upon how you want to route calls through your outbound campaign. Formerly called Campaign VDAD extension.- 8368 - DEFAULT - Will send the call to the next available agent no matter what server they are on- 8369 - Used for Answering Machine Detection after that, same behavior as 8368."
          onMouseEnter={this.logMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <p />

          <div className="">
            <TextField
              id="voicemail"
              label="Voice mail*"
              margin="normal"
              onChange={this.handleChange("voicemail_ext")}
              fullWidth
              value={this.state.voicemail_ext}
            />{" "}
            <a
              data-controls-modal="showVoicemail_list"
              data-backdrop="static"
              data-keyboard="false"
              href="javascript:void(0)"
              className="btn btn-info showVoicemail"
              onClick={() => this.setState({ open: true })}
            >
              Voicemail Chooser
            </a>
            <VoicemailPopUp
              users={mailList}
              selectedValue={this.state.selectedValue}
              open={this.state.open}
              onClose={this.handleRequestClose}
            />
          </div>
        </div>
      </Fragment>
    );
  };

  getIN_GROUP = () => {
    const { call_menu_array, drop_inbound_group } = this.state;
    return (
      <Fragment>
        <div
          className="col-md-12 col-12"
          data-title="Inbound Queue"
          data-info="This determines which agent receives the next call that is available: - Random: orders by the random update value in the live_agents table - Oldest Call Start: orders by the last time an agent was sent a call. Results in agents receiving about the same number of calls overall. - Oldest Call Finish: orders by the last time an agent finished a call. AKA agent waiting longest receives first call. - Overall User Level: orders by the user_level of the agent as defined in the users table a higher user_level will receive more calls. - Campaign Rank: orders by the rank given to the agent for the campaign. Highest to Lowest. - Campaign Grade Random: gives a higher probability of getting a call to the higher graded agents. - Fewest Calls: orders by the number of calls received by an agent for that specific inbound group. Least calls first. - Longest Wait Time: orders by the amount of time agent has been actively waiting for a call."
          onMouseEnter={this.logMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <FormControl className="w-100 mb-2">
            <InputLabel htmlFor="age-simple">Inbound Queue </InputLabel>
            <Select
              value={drop_inbound_group}
              onChange={this.handleChange("drop_inbound_group")}
              input={<Input id="age-simple" />}
            >
              {call_menu_array &&
                call_menu_array.map(option => (
                  <MenuItem key={option.menu_id} value={option.menu_id}>
                    {" "}
                    {option.menu_id}{" "}
                  </MenuItem>
                ))}{" "}
            </Select>

            <FormHelperText />
          </FormControl>
        </div>
      </Fragment>
    );
  };
  getCALLMENU = () => {
    const { inbound_group_array, safe_harbor_menu_id } = this.state;
    return (
      <Fragment>
        <div
          className="col-md-12 col-12"
          data-title=" Safe Harbor Call Menu"
          data-info="This determines which agent receives the next call that is available: - Random: orders by the random update value in the live_agents table - Oldest Call Start: orders by the last time an agent was sent a call. Results in agents receiving about the same number of calls overall. - Oldest Call Finish: orders by the last time an agent finished a call. AKA agent waiting longest receives first call. - Overall User Level: orders by the user_level of the agent as defined in the users table a higher user_level will receive more calls. - Campaign Rank: orders by the rank given to the agent for the campaign. Highest to Lowest. - Campaign Grade Random: gives a higher probability of getting a call to the higher graded agents. - Fewest Calls: orders by the number of calls received by an agent for that specific inbound group. Least calls first. - Longest Wait Time: orders by the amount of time agent has been actively waiting for a call."
          onMouseEnter={this.logMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <FormControl className="w-100 mb-2">
            <InputLabel htmlFor="age-simple">
              {" "}
              Safe Harbor Call Menu{" "}
            </InputLabel>
            <Select
              value={safe_harbor_menu_id}
              onChange={this.handleChange("safe_harbor_menu_id")}
              input={<Input id="age-safe_harbor_menu_id" />}
            >
              {inbound_group_array &&
                inbound_group_array.map(option => (
                  <MenuItem key={option.group_id} value={option.group_id}>
                    {" "}
                    {option.group_id}{" "}
                  </MenuItem>
                ))}{" "}
            </Select>
            <FormHelperText />
          </FormControl>
        </div>
      </Fragment>
    );
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
      is_change: true
    });
  };

  handleActiveChange = (event, checked) => {
    this.setState({ active: checked ? "Y" : "N" });
  };
  leadOrderActiveChange = (event, checked) => {
    this.setState({ lead_order_randomize: checked ? "Y" : "N" });
  };
  scheduledcallbacksActiveChange = (event, checked) => {
    this.setState({ scheduled_callbacks: checked ? "Y" : "N" });
  };
  campaignvdadextenActiveChange = (event, checked) => {
    this.setState({ campaign_vdad_exten: checked ? "Y" : "N" });
  };
  displayqueuecountActiveChange = (event, checked) => {
    this.setState({ display_queue_count: checked ? "Y" : "N" });
  };
  grabcallsinqueueActiveChange = (event, checked) => {
    this.setState({ grab_calls_in_queue: checked ? "Y" : "N" });
  };

  handleSubmit = () => {
    let campaign_id = this.state.campaign_id;
    let campaignName = this.state.campaign_name;
    let scriptComment = this.state.scriptComment;
    let scriptText = this.state.scriptText;
    let scriptActiveValue = this.state.scriptActiveValue;
    let pageTitle = this.state.pageTitle;
    let error = false;

    if (!error) {
      let postData = {
        campaign_id: this.state.campaign_id,
        campaign_name: this.state.campaign_name,
        campaign_description: this.state.campaign_description,
        campaign_changedate: this.state.campaign_changedate,
        active: this.state.active,
        park_file_name: this.state.park_file_name,
        web_form_address: this.state.web_form_address,
        web_form_address_two: this.state.web_form_address_two,
        lead_order: this.state.lead_order,
        lead_order_randomize: this.state.lead_order_randomize,
        list_order_mix: this.state.list_order_mix,
        list_order_mix_hidden: this.state.list_order_mix_hidden,
        lead_filter_id: this.state.lead_filter_id,
        call_count_limit: this.state.call_count_limit,
        hopper_level: this.state.web_form_address_two,
        dial_method: this.state.dial_method,
        default_lead_preview: this.state.default_lead_preview,
        auto_dial_level: this.state.auto_dial_level,
        next_agent_call: this.state.next_agent_call,
        local_call_time: this.state.local_call_time,
        dial_timeout: this.state.dial_timeout,
        campaign_cid: this.state.campaign_cid,
        use_custom_cid: this.state.use_custom_cid,
        manual_dial_cid: this.state.manual_dial_cid,
        drop_call_seconds: this.state.drop_call_seconds,
        drop_action: this.state.drop_action,
        safe_harbor_exten: this.state.safe_harbor_exten,
        safe_harbor_audio: this.state.safe_harbor_audio,
        drop_inbound_group: this.state.drop_inbound_group,
        voicemail_ext: this.state.voicemail_ext,
        safe_harbor_menu_id: this.state.safe_harbor_menu_id,
        campaign_vdad_exten: this.state.campaign_vdad_exten,
        campaign_recording: this.state.campaign_recording,
        campaign_rec_filename: this.state.campaign_rec_filename,
        per_call_notes: this.state.per_call_notes,
        agent_pause_codes_active: this.state.agent_pause_codes_active,
        agent_lead_search: this.state.agent_lead_search,
        agent_lead_search_method: this.state.agent_lead_search_method,
        campaign_script: this.state.campaign_script,
        get_call_launch: this.state.get_call_launch,
        enable_xfer_presets: this.state.enable_xfer_presets,
        quick_transfer_button: this.state.quick_transfer_button,
        xferconf_a_number: this.state.xferconf_a_number,
        custom_3way_button_transfer: this.state.custom_3way_button_transfer,
        prepopulate_transfer_preset: this.state.prepopulate_transfer_preset,
        scheduled_callbacks: this.state.scheduled_callbacks,
        scheduled_callbacks_alert: this.state.scheduled_callbacks_alert,
        scheduled_callbacks_count: this.state.scheduled_callbacks_count,
        use_internal_dnc: this.state.use_internal_dnc,
        use_campaign_dnc: this.state.use_campaign_dnc,
        display_queue_count: this.state.display_queue_count,
        view_calls_in_queue: this.state.view_calls_in_queue,
        view_calls_in_queue_launch: this.state.view_calls_in_queue_launch,
        grab_calls_in_queue: this.state.grab_calls_in_queue,
        manual_preview_dial: this.state.manual_preview_dial,
        three_way_call_cid: this.state.three_way_call_cid,
        crm_login_address: this.state.crm_login_address,
        start_call_url: this.state.start_call_url,
        dispo_call_url: this.state.dispo_call_url,
        na_call_url: this.state.na_call_url
      };

      let _this = this;
      axios
        .put("/api/campaign-update", postData)
        .then(response => {
          //this.handleShowAlert(true);
          this.setState({
            alertTitle: response.data.status,
            alertContent: response.data.msg
            //showAlert:true
          });
          createNotification(
            "Success",
            "Success",
            "Record Updated Sucessfully"
          );
        })
        .catch(function(error) {
          createNotification("Error", "Error", error.response.data.msg);
        });
    }
  };

  render() {
    const {
      pageTitle,
      pageError,
      showAlert,
      alertContent,
      alertTitle,
      campaign_id,
      campaignName,
      campaign_name,
      scriptComment,
      scriptActive,
      scriptActiveValue,
      scriptText,
      scriptField,
      campaign_idError,
      campaignNameError,
      scriptCommentError,
      scriptTextError,
      campaign_description,
      park_music_onhold,
      lead_order,
      dispo_call_url,
      na_call_url,
      call_count_limit,
      view_calls_in_queue_launch,
      three_way_call_cid,
      manual_preview_dial,
      crm_login_address,
      start_call_url,
      campaign_changedate,
      use_campaign_dnc,
      screen_labels,
      display_queue_count,
      view_calls_in_queue,
      grab_calls_in_queue,
      active,
      prepopulate_transfer_preset,
      scheduled_callbacks,
      scheduled_callbacks_alert,
      scheduled_callbacks_count,
      use_internal_dnc,
      park_file_name,
      get_call_launch,
      enable_xfer_presets,
      quick_transfer_button,
      xferconf_a_number,
      custom_3way_button_transfer,
      web_form_address,
      agent_pause_codes_active,
      agent_lead_search,
      agent_lead_search_method,
      campaign_script,
      web_form_address_two,
      campaign_vdad_exten,
      campaign_recording,
      campaign_rec_filename,
      per_call_notes,
      lead_order_randomize,
      dial_timeout,
      campaign_cid,
      use_custom_cid,
      manual_dial_cid,
      drop_call_seconds,
      drop_action,
      safe_harbor_audio,
      list_order_mix,
      lead_filter_id,
      hopper_level,
      dial_method,
      default_lead_preview,
      auto_dial_level,
      next_agent_call,
      local_call_time,
      music_list_data,
      isLoding,
      lead_filter_array,
      inbound_group_array,
      call_menu_array
    } = this.state;
    const Heading = "h" + 1;

    if (pageTitle == "edit" && pageError) {
      return (
        <div>
          <ContainerHeader
            match={this.props.match}
            title={pageTitle + " script"}
          />
          <Alert className="shadow-lg" color="danger">
            <h3 className="alert-heading">Script Not Found</h3>
            <p>We can not locate your Script, please check your script id.</p>
          </Alert>
        </div>
      );
    } else {
      return (
        <div>
          <ContainerHeader
            match={this.props.match}
            title={pageTitle + " Campaign : " + campaign_id}
            style={{ marginBottom: "8px" }}
          />{" "}
          {this.state.is_change && <ButtonNav click={this.handleSubmit} />}
          <div className="row">
            <Dialog
              maxWidth="md"
              fullWidth={true}
              open={this.state.audio_dialog}
              onClose={this.handleRequestClose}
            >
              <DialogTitle>Audio Manager</DialogTitle>
              <Divider />
              <DialogContent>
                <AUDIO_MANAGER
                  onClose={this.handleRequestCloseAudio}
                  onSelectLanguage={this.handleListItemClick}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={this.handledOpenAudioManagerDialog}
                  color="secondary"
                  className="jr-btn bg-grey text-white"
                >
                  Close
                </Button>
              </DialogActions>
            </Dialog>
            <CardBox
              styleName="col-lg-8"
              heading={pageTitle == "add" ? "Add new script" : campaign_id}
            >
              <form className="row" noValidate autoComplete="off">
                <div className="sub_menu_div" style={style_header}>
                  <i className="fa fa-bars" style={{ marginRight: "10px" }} />
                  Campaign
                </div>

                <div
                  className="col-md-12 col-12"
                  data-info="This is the short name of the campaign, it is not editable after initial submission, cannot contain spaces and must be between 2 and 8 characters in length."
                  data-title="Campaign ID"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="campaign-campaign_id"
                    onChange={this.handleChange("campaign_id")}
                    error={campaign_idError}
                    label="Campaign Id "
                    value={campaign_id}
                    disabled={pageTitle == "add" ? false : true}
                    margin="normal"
                    fullWidth
                    helpertext="This is the title of a Script, it must be between 2 to 50 characters."
                  />
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Campaign Name"
                  data-info="This is a memo field for the campaign, it is optional and can be a maximum of 255 characters in length."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <TextField
                    id="campaign_campaign_name"
                    label="Campaign name"
                    value={campaign_name}
                    onChange={this.handleChange("campaign_name")}
                    margin="normal"
                    name="campaign_name"
                    fullWidth
                    helpertext="This is where you can place Campaign name"
                  />
                </div>
                <div
                  className="col-md-12 col-12"
                  data-title="Campaign Description"
                  data-info="This is a memo field for the campaign, it is optional and can be a maximum of 255 characters in length."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <TextField
                    id="campaign_description"
                    label="Campaign Description "
                    value={campaign_description}
                    onChange={this.handleChange("campaign_description")}
                    margin="normal"
                    fullWidth
                    helpertext="This is where you can place comments for an agent screen Script."
                  />
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Campaign Change Date"
                  data-info="This is the last time that the settings for this campaign were modified in any way."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <TextField
                    id="campaign_changedate"
                    label="Campaign Change Date"
                    value={campaign_changedate}
                    onChange={this.handleChange("campaign_changedate")}
                    margin="normal"
                    fullWidth
                  />
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Active"
                  data-info="This is where you set the campaign to Active or Inactive. If Inactive, noone can log into it."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <p />
                  <p className="MuiFormhelpertext-root-253">Active *</p>
                  <div className="row">
                    <Switch
                      value={active}
                      onChange={this.handleActiveChange}
                      label="Script Active"
                      checked={active == "Y" ? true : false}
                      color="primary"
                    />
                  </div>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Park Music-on-Hold"
                  data-info="This is where you can define the on-hold music context for this campaign. Make sure you select a valid music on hold context from the select list and that the context that you have selected has valid files in it. Default is default."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple"> </InputLabel>
                    <Select
                      value={park_file_name}
                      onChange={this.handleChange("park_file_name")}
                      input={<Input id="age-simple" />}
                    >
                      {music_list_data &&
                        music_list_data.map(option => (
                          <MenuItem key={option.moh_id} value={option.moh_id}>
                            {" "}
                            {option.moh_id} - {option.moh_name}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Web Form"
                  data-info="This is where you can set the custom web page that will be opened when the user clicks on the WEB FORM button. To customize the query string after the web form, simply begin the web form with VAR and then the URL that you want to use, replacing the variables with the variable names that you want to use --A--phone_number--B-- just like in the SCRIPTS tab section. If you want to use custom fields in a web form address, you need to add &CF_uses_custom_fields=Y as part of your URL.."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <TextField
                    id="web_form_address"
                    label="Web Form"
                    value={web_form_address}
                    onChange={this.handleChange("web_form_address")}
                    margin="normal"
                    fullWidth
                  />
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Web Form Two"
                  data-info="This is where you can set the custom web page that will be opened when the user clicks on the WEB FORM button. To customize the query string after the web form, simply begin the web form with VAR and then the URL that you want to use, replacing the variables with the variable names that you want to use --A--phone_number--B-- just like in the SCRIPTS tab section. If you want to use custom fields in a web form address, you need to add &CF_uses_custom_fields=Y as part of your URL."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <TextField
                    id="web_form_address_two"
                    label="Web Form Two"
                    value={web_form_address_two}
                    onChange={this.handleChange("web_form_address_two")}
                    margin="normal"
                    fullWidth
                  />
                </div>

                <div className="col-md-12 col-12">
                  <div className="sub_menu_div" style={style_header}>
                    {" "}
                    <i className="fa fa-bars" style={{ marginRight: "10px" }} />
                    List
                  </div>
                </div>
                <div
                  className="col-md-12 col-12"
                  data-title="List Order"
                  data-info="This is the description of the campaign, it must be between 6 and 40 characters in length."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple"> List Order </InputLabel>
                    <Select
                      value={lead_order}
                      onChange={this.handleChange("lead_order")}
                      input={<Input id="age-simple" />}
                    >
                      {list_order_data &&
                        list_order_data.map(option => (
                          <MenuItem key={option} value={option}>
                            {" "}
                            {option}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="List Order Randomise"
                  data-info="This is where you set the campaign to List order randomise."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <p />
                  <p className="MuiFormhelpertext-root-253">
                    List Order Randomize
                  </p>
                  <div className="row">
                    <Switch
                      value={lead_order_randomize}
                      onChange={this.leadOrderActiveChange}
                      label="Script Active"
                      checked={lead_order_randomize == "Y" ? true : false}
                      color="primary"
                    />
                  </div>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="List Mix"
                  data-info="Overrides the Lead Order and Dial Status fields. Will use the List and status parameters for the selected List Mix entry in the List Mix sub section instead. Default is DISABLED"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple"> List Mix </InputLabel>
                    <Select
                      value={list_order_mix}
                      onChange={this.handleChange("list_order_mix")}
                      input={<Input id="age-simple" />}
                    >
                      {lead_filter_array &&
                        lead_filter_array.map(option => (
                          <MenuItem
                            key={option.lead_filter_id}
                            value={option.lead_filter_id}
                          >
                            {" "}
                            {option.option_title}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Lead Filter"
                  data-info="This is a method of filtering your leads using a fragment of a SQL query. Use this feature with caution, it is easy to stop dialing accidentally with the slightest alteration to the SQL statement. Default is NONE."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple"> Lead Filter </InputLabel>
                    <Select
                      value={lead_filter_id}
                      onChange={this.handleChange("lead_filter_id")}
                      input={<Input id="age-simple" />}
                    >
                      {listPause &&
                        listPause.map(option => (
                          <MenuItem key={option.id} value={option.id}>
                            {" "}
                            {option.name}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>
                <div
                  className="col-md-12 col-12"
                  data-title="Campaign Description"
                  data-info="This is a memo field for the campaign, it is optional and can be a maximum of 255 characters in length."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <TextField
                    id="campaign_CallCountLimit"
                    label="Call Count Limit "
                    value={call_count_limit}
                    onChange={this.handleChange("call_count_limit")}
                    margin="normal"
                    fullWidth
                  />
                </div>

                <div className="col-md-12 col-12">
                  <div className="sub_menu_div" style={style_header}>
                    {" "}
                    <i className="fa fa-bars" style={{ marginRight: "10px" }} />
                    Dialing Rules
                  </div>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Minimum Hopper Level"
                  data-info="This is the minimum number of leads the hopper loading script tries to keep in the hopper table for this campaign. If running VDhopper script every minute, make this slightly greater than the number of leads you go through in a minute."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      Minimum Hopper Level{" "}
                    </InputLabel>
                    <Select
                      value={hopper_level}
                      onChange={this.handleChange("hopper_level")}
                      input={<Input id="age-simple" />}
                    >
                      {list_minimum_hopper &&
                        list_minimum_hopper.map(option => (
                          <MenuItem key={option} value={option}>
                            {" "}
                            {option}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Dial Method"
                  data-info="This field is the way to define how dialing is to take place. If MANUAL then the auto_dial_level will be locked at 0 unless Dial Method is changed. If RATIO then the normal dialing a number of lines for Active agents. ADAPT_HARD_LIMIT will dial predictively up to the dropped percentage and then not allow aggressive dialing once the drop limit is reached until the percentage goes down again. ADAPT_TAPERED allows for running over the dropped percentage in the first half of the shift -as defined by call_time selected for campaign- and gets more strict as the shift goes on. ADAPT_AVERAGE tries to maintain an average or the dropped percentage not imposing hard limits as aggressively as the other two methods. You cannot change the Auto Dial Level if you are in any of the ADAPT dial methods. Only the Dialer can change the dial level when in predictive dialing mode. INBOUND_MAN allows the agent to place manual dial calls from a campaign list while being able to take inbound calls between manual dial calls."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple"> Dial Method </InputLabel>
                    <Select
                      value={dial_method}
                      onChange={this.handleChange("dial_method")}
                      input={<Input id="age-simple" />}
                    >
                      {list_dialed &&
                        list_dialed.map(option => (
                          <MenuItem key={option} value={option}>
                            {" "}
                            {option}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title=" Default Preview Dial"
                  data-info=" When enable is set, system will enable dial preview by default for all the agents login to this campaign."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      Default Preview Dial{" "}
                    </InputLabel>
                    <Select
                      value={default_lead_preview}
                      onChange={this.handleChange("default_lead_preview")}
                      input={<Input id="age-simple" />}
                    >
                      {listPause &&
                        listPause.map(option => (
                          <MenuItem key={option.id} value={option.id}>
                            {" "}
                            {option.name}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title=" Auto Dial Level"
                  data-info="This is where you set how many lines the system should use per active agent. zero 0 means auto dialing is off and the agents will click to dial each number. Otherwise the system will keep dialing lines equal to active agents multiplied by the dial level to arrive at how many lines this campaign on each server should allow. The ADAPT OVERRIDE checkbox allows you to force a new dial level even though the dial method is in an ADAPT mode. This is useful if there is a dramatic shift in the quality of leads and you want to drastically change the dial_level manually."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      Auto Dial Level{" "}
                    </InputLabel>
                    <Select
                      value={auto_dial_level}
                      onChange={this.handleChange("auto_dial_level")}
                      input={<Input id="age-simple" />}
                    >
                      {listPause &&
                        listPause.map(option => (
                          <MenuItem key={option.id} value={option.id}>
                            {" "}
                            {option.name}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>
                <div
                  className="col-md-12 col-12"
                  data-title=" Next Agent Call"
                  data-info="This determines which agent receives the next call that is available: - Random: orders by the random update value in the live_agents table - Oldest Call Start: orders by the last time an agent was sent a call. Results in agents receiving about the same number of calls overall. - Oldest Call Finish: orders by the last time an agent finished a call. AKA agent waiting longest receives first call. - Overall User Level: orders by the user_level of the agent as defined in the users table a higher user_level will receive more calls. - Campaign Rank: orders by the rank given to the agent for the campaign. Highest to Lowest. - Campaign Grade Random: gives a higher probability of getting a call to the higher graded agents. - Fewest Calls: orders by the number of calls received by an agent for that specific inbound group. Least calls first. - Longest Wait Time: orders by the amount of time agent has been actively waiting for a call."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      Next Agent Call{" "}
                    </InputLabel>
                    <Select
                      value={next_agent_call}
                      onChange={this.handleChange("next_agent_call")}
                      input={<Input id="age-simple" />}
                    >
                      {list_next_agent_call &&
                        list_next_agent_call.map(option => (
                          <MenuItem key={option.id} value={option.id}>
                            {" "}
                            {option.name}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title=" Local Call Time"
                  data-info="This is where you set during which hours you would like to dial, as determined by the local time in the are in which you are calling. This is controlled by area code and is adjusted for Daylight Savings time if applicable. General Guidelines in the USA for Business to Business is 9am to 5pm and Business to Consumer calls is 9am to 9pm."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      Local Call Time{" "}
                    </InputLabel>
                    <Select
                      value={local_call_time}
                      onChange={this.handleChange("local_call_time")}
                      input={<Input id="age-simple" />}
                    >
                      {listPause &&
                        listPause.map(option => (
                          <MenuItem key={option.id} value={option.id}>
                            {" "}
                            {option.name}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Dial Timeout"
                  data-info="Dial Timeout - This allows for quickly changing dial timeouts from server to server and limiting the effects to a single campaign. If you are having a lot of Answering Machine or Voicemail calls you may want to try changing this value between 36-42 and see if results improve."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple"> Dial Timeout </InputLabel>
                    <Select
                      value={dial_timeout}
                      onChange={this.handleChange("dial_timeout")}
                      input={<Input id="age-simple" />}
                    >
                      {listPause &&
                        listPause.map(option => (
                          <MenuItem key={option.id} value={option.id}>
                            {" "}
                            {option.name}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div className="col-md-12 col-12">
                  <div className="sub_menu_div" style={style_header}>
                    {" "}
                    <i className="fa fa-bars" style={{ marginRight: "10px" }} />
                    Caller ID
                  </div>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Campaign CallerID"
                  data-info="This field allows for the sending of a custom callerid number on the outbound calls. This is the number that would show up on the callerid of the person you are calling. The default is UNKNOWN. If you are using T1 or E1s to dial out this option is only available if you are using PRIs - ISDN T1s or E1s - that have the custom callerid feature turned on, this will not work with Robbed-bit service -RBS- circuits. This will also work through most VOIP -SIP or IAX trunks- providers that allow dynamic outbound callerID. The custom callerID only applies to calls placed for the campaign directly, any 3rd party calls or transfers will not send the custom callerID. NOTE: Sometimes putting UNKNOWN or PRIVATE in the field will yield the sending of your default callerID number by your carrier with the calls. You may want to test this and put 0000000000 in the callerid field instead if you do not want to send you CallerID."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      Campaign CallerID{" "}
                    </InputLabel>
                    <Select
                      value={campaign_cid}
                      onChange={this.handleChange("campaign_cid")}
                      input={<Input id="age-simple" />}
                    >
                      {listPause &&
                        listPause.map(option => (
                          <MenuItem key={option.id} value={option.id}>
                            {" "}
                            {option.name}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Custom CallerID"
                  data-info="When set to Y, this option allows you to use the security_phrase field in the list table as the CallerID to send out when placing for each specific lead. If this field has no CID in it then the Campaign CallerID defined above will be used instead. This option will disable the list CallerID Override if there is a CID present in the security_phrase field. Default is N. When set to AREACODE you have the ability to go into the AC-CID submenu and define multiple callerids to be used per areacode."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      Custom CallerID{" "}
                    </InputLabel>
                    <Select
                      value={use_custom_cid}
                      onChange={this.handleChange("use_custom_cid")}
                      input={<Input id="age-simple" />}
                    >
                      {listPause &&
                        listPause.map(option => (
                          <MenuItem key={option.id} value={option.id}>
                            {" "}
                            {option.name}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title=" Manual Dial CID"
                  data-info="This defines whether an agent making manual dial calls will have the campaign callerID settings used, or their agent phone callerID settings used. Default is CAMPAIGN. If the Use Custom CID campaign option is enabled or the list Campaign CID Override setting is used, this setting will be ignored."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      Manual Dial CID{" "}
                    </InputLabel>
                    <Select
                      value={manual_dial_cid}
                      onChange={this.handleChange("manual_dial_cid")}
                      input={<Input id="age-simple" />}
                    >
                      {listPause &&
                        listPause.map(option => (
                          <MenuItem key={option.id} value={option.id}>
                            {" "}
                            {option.name}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>
                <div className="col-md-12 col-12">
                  <div className="sub_menu_div" style={style_header}>
                    {" "}
                    <i className="fa fa-bars" style={{ marginRight: "10px" }} />
                    Safe Harbor Settings
                  </div>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Drop Call Seconds"
                  data-info="The number of seconds from the time the customer line is picked up until the call is considered a DROP, only applies to outbound calls."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <TextField
                      id="campaign_CallCountLimit"
                      label="Call drop_call_seconds "
                      value={drop_call_seconds}
                      onChange={this.handleChange("drop_call_seconds")}
                      margin="normal"
                      fullWidth
                    />
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Drop Action"
                  data-info="This menu allows you to choose what happens to a call when it has been waiting for longer than what is set in the Drop Call Seconds field."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple"> Drop Action </InputLabel>
                    <Select
                      value={drop_action}
                      onChange={this.handleChange("drop_action")}
                      input={<Input id="age-simple" />}
                    >
                      {drop_action_list &&
                        drop_action_list.map(option => (
                          <MenuItem key={option.id} value={option.id}>
                            {" "}
                            {option.name}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>
                {this.getDynamicDrop(drop_action)}
                {/* <div
                  className="col-md-12 col-12"
                  data-title="Safe Harbor Audio"
                  data-info="This is the audio prompt file that is played if the Drop Action is set to AUDIO. Default is buzz."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <TextField
                    id="safe_harbor_audio"
                    label="Safe Harbor Audio"
                    value={safe_harbor_audio}
                    onChange={this.handleChange("safe_harbor_audio")}
                    margin="normal"
                    fullWidth
                  />
                </div> */}

                <div className="col-md-12 col-12" />

                <div className="col-md-12 col-12">
                  <div className="sub_menu_div" style={style_header}>
                    {" "}
                    <i className="fa fa-bars" style={{ marginRight: "10px" }} />
                    General Settings
                  </div>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Voicemail Detection"
                  data-info="This field allows for a custom outbound routing extension. This allows you to use different call handling methods depending upon how you want to route calls through your outbound campaign. Formerly called Campaign VDAD extension.- 8368 - DEFAULT - Will send the call to the next available agent no matter what server they are on- 8369 - Used for Answering Machine Detection after that, same behavior as 8368."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <p />
                  <p className="MuiFormhelpertext-root-253">
                    Voicemail Detection *
                  </p>
                  <div className="row">
                    <Switch
                      value={campaign_vdad_exten}
                      onChange={this.campaignvdadextenActiveChange}
                      label="Script Active"
                      checked={campaign_vdad_exten == "Y" ? true : false}
                      color="primary"
                    />
                  </div>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Campaign Recording"
                  data-info="This menu allows you to choose what level of recording is allowed on this campaign. NEVER will disable recording on the client. ONDEMAND is the default and allows the agent to start and stop recording as needed. ALLCALLS will start recording on the client whenever a call is sent to an agent. ALLFORCE will start recording on the client whenever a call is sent to an agent giving the agent no option to stop recording. For ALLCALLS and ALLFORCE there is an option to use the Recording Delay to cut down on very short recordings and reduce system load."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      Campaign Recordingt{" "}
                    </InputLabel>
                    <Select
                      value={campaign_recording}
                      onChange={this.handleChange("campaign_recording")}
                      input={<Input id="age-simple" />}
                    >
                      {list_campaign_recording &&
                        list_campaign_recording.map(option => (
                          <MenuItem key={option} value={option}>
                            {" "}
                            {option}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Campaign Rec Filename"
                  data-info="This field allows you to customize the name of the recording when Campaign recording is ONDEMAND or ALLCALLS. The allowed variables are CAMPAIGN INGROUP CUSTPHONE FULLDATE TINYDATE EPOCH AGENT VENDORLEADCODE LEADID. The default is FULLDATE_AGENT and would look like this 20051020-103108_6666. Another example is CAMPAIGN_TINYDATE_CUSTPHONE which would look like this TESTCAMP_51020103108_3125551212. Te resulting filename must be less than 90 characters in length."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <TextField
                    id="campaign_rec_filename"
                    label="Campaign Rec Filename"
                    value={campaign_rec_filename}
                    onChange={this.handleChange("campaign_rec_filename")}
                    margin="normal"
                    fullWidth
                  />
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Agent Lead Search"
                  data-info="Setting this option to ENABLED will allow agents to search for leads and view lead information while paused in the agent interface. Also, if the Agent User Group is allowed to view Call Logs then the agent will be able to view past call notes for any lead that they are viewing information on. Default is DISABLED. LIVE_CALL_INBOUND will allow search for a lead while on an inbound call only. LIVE_CALL_INBOUND_AND_MANUAL will allow search for a lead while on an inbound call or while paused. When Lead Search is used on a live inbound call, the lead of the call when it went to the agent will be changed to a status of LSMERG, and the logs for the call will be modified to link to the agent selected lead instead.."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      Call Notes Per Call{" "}
                    </InputLabel>
                    <Select
                      value={per_call_notes}
                      onChange={this.handleChange("per_call_notes")}
                      input={<Input id="age-simple" />}
                    >
                      {list_per_call_notes &&
                        list_per_call_notes.map(option => (
                          <MenuItem key={option} value={option}>
                            {" "}
                            {option}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Agent Pause Codes Active"
                  data-info="Allows agents to select a pause code when they click on the PAUSE button in the agent screen. Pause codes are definable per campaign at the bottom of the campaign view detail screen and they are stored in the agent_log table. Default is N. FORCE will force the agents to choose a PAUSE code if they click on the PAUSE button."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      Agent Pause Codes Active{" "}
                    </InputLabel>
                    <Select
                      value={agent_pause_codes_active}
                      onChange={this.handleChange("agent_pause_codes_active")}
                      input={<Input id="age-simple" />}
                    >
                      {list_agent_pause_codes_active &&
                        list_agent_pause_codes_active.map(option => (
                          <MenuItem key={option} value={option}>
                            {" "}
                            {option}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Agent Lead Search"
                  data-info="Setting this option to ENABLED will allow agents to search for leads and view lead information while paused in the agent interface. Also, if the Agent User Group is allowed to view Call Logs then the agent will be able to view past call notes for any lead that they are viewing information on. Default is DISABLED. LIVE_CALL_INBOUND will allow search for a lead while on an inbound call only. LIVE_CALL_INBOUND_AND_MANUAL will allow search for a lead while on an inbound call or while paused. When Lead Search is used on a live inbound call, the lead of the call when it went to the agent will be changed to a status of LSMERG, and the logs for the call will be modified to link to the agent selected lead instead."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      Agent Lead Search{" "}
                    </InputLabel>
                    <Select
                      value={agent_lead_search}
                      onChange={this.handleChange("agent_lead_search")}
                      input={<Input id="age-simple" />}
                    >
                      {list_agent_lead_search &&
                        list_agent_lead_search.map(option => (
                          <MenuItem key={option} value={option}>
                            {" "}
                            {option}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Agent Lead Search Method"
                  data-info="Setting this option to ENABLED will allow agents to search for leads and view lead information while paused in the agent interface. Also, if the Agent User Group is allowed to view Call Logs then the agent will be able to view past call notes for any lead that they are viewing information on. Default is DISABLED. LIVE_CALL_INBOUND will allow search for a lead while on an inbound call only. LIVE_CALL_INBOUND_AND_MANUAL will allow search for a lead while on an inbound call or while paused. When Lead Search is used on a live inbound call, the lead of the call when it went to the agent will be changed to a status of LSMERG, and the logs for the call will be modified to link to the agent selected lead instead."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      Agent Lead Search Method{" "}
                    </InputLabel>
                    <Select
                      value={agent_lead_search_method}
                      onChange={this.handleChange("agent_lead_search_method")}
                      input={<Input id="age-simple" />}
                    >
                      {list_agent_lead_search_method &&
                        list_agent_lead_search_method.map(option => (
                          <MenuItem key={option} value={option}>
                            {" "}
                            {option}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Script"
                  data-info="This menu allows you to choose the script that will appear on the agents screen for this campaign. Select NONE to show no script for this campaign"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple"> Script </InputLabel>
                    <Select
                      value={campaign_script}
                      onChange={this.handleChange("campaign_script")}
                      input={<Input id="age-simple" />}
                    >
                      {listPause &&
                        listPause.map(option => (
                          <MenuItem key={option.id} value={option.id}>
                            {" "}
                            {option.name}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Get Call Launch"
                  data-info="This menu allows you to choose whether you want to auto-launch the web-form page in a separate window, auto-switch to the SCRIPT tab or do nothing when a call is sent to the agent for this campaign. If custom list fields are enabled on your system, FORM will open the FORM tab upon connection of a call to an agent."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      Get Call Launch{" "}
                    </InputLabel>
                    <Select
                      value={get_call_launch}
                      onChange={this.handleChange("get_call_launch")}
                      input={<Input id="age-simple" />}
                    >
                      {list_get_call_launch &&
                        list_get_call_launch.map(option => (
                          <MenuItem key={option} value={option}>
                            {" "}
                            {option}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Enable Transfer Presets"
                  data-info="This option will enable the Presets sub menu to appear at the top of the Campaign Modification page, and also you will have the ability to specify Preset dialing numbers for Agents to use in the Transfer-Conference frame of the agent interface. Default is DISABLED. CONTACTS is an option only if contact_information is enabled on your system, that is a custom feature."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      Enable Transfer Presets{" "}
                    </InputLabel>
                    <Select
                      value={enable_xfer_presets}
                      onChange={this.handleChange("enable_xfer_presets")}
                      input={<Input id="age-simple" />}
                    >
                      {list_enable_xfer_presets &&
                        list_enable_xfer_presets.map(option => (
                          <MenuItem key={option} value={option}>
                            {" "}
                            {option}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Quick Transfer Button"
                  data-info="This option will enable the Presets sub menu to appear at the top of the Campaign Modification page, and also you will have the ability to specify Preset dialing numbers for Agents to use in the Transfer-Conference frame of the agent interface. Default is DISABLED. CONTACTS is an option only if contact_information is enabled on your system, that is a custom feature."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      Quick Transfer Button{" "}
                    </InputLabel>
                    <Select
                      value={quick_transfer_button}
                      onChange={this.handleChange("quick_transfer_button")}
                      input={<Input id="age-simple" />}
                    >
                      {list_quick_transfer_button &&
                        list_quick_transfer_button.map(option => (
                          <MenuItem key={option} value={option}>
                            {" "}
                            {option}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Quick & 3-way Transfer"
                  data-info="These fields allow for you to have two sets of Transfer Conference and DTMF presets. When the call or campaign is loaded, the agent screen will show two buttons on the transfer-conference frame and auto-populate the number-to-dial and the send-dtmf fields when pressed. If you want to allow Consultative Transfers, a fronter to a closer, have the agent use the CONSULTATIVE checkbox, which does not work for third party non-agent consultative calls. For those just have the agent click the Dial With Customer button. Then the agent can just LEAVE-3WAY-CALL and move on to their next call. If you want to allow Blind transfers of customers to an AGI script for logging or an IVR, then place AXFER in the number-to-dial field. You can also specify an custom extension after the AXFER, for instance if you want to do a call to a special IVR you have set to extension 83900 you would put AXFER83900 in the number-to-dial field."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <TextField
                    id="xferconf_a_number"
                    label="Quick & 3-way Transfer"
                    value={xferconf_a_number}
                    onChange={this.handleChange("xferconf_a_number")}
                    margin="normal"
                    fullWidth
                  />
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Custom 3-Way Button Transfer"
                  data-info="This option will add a Custom Transfer button to the agent screen below the Transfer-Conf button that will allow one click three way calls using the selected preset or field. The PRESET_ options will place calls using the defined preset value. The FIELD_ options will place calls using the number in the selected field from the lead. DISABLED will not show the button on the agent screen. The PARK_ options will park the customer before dialing. Default is DISABLED. The VIEW_PRESET option will simply open the transfer frame and the preset frame. The VIEW_CONTACTS option will open a contacts search window, this will only work if Enable Presets is set to CONTACTS.."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      custom 3way button transfer{" "}
                    </InputLabel>
                    <Select
                      value={custom_3way_button_transfer}
                      onChange={this.handleChange(
                        "custom_3way_button_transfer"
                      )}
                      input={<Input id="age-simple" />}
                    >
                      {list_custom_3way_button_transfer &&
                        list_custom_3way_button_transfer.map(option => (
                          <MenuItem key={option} value={option}>
                            {" "}
                            {option}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>
                <div
                  className="col-md-12 col-12"
                  data-title="PrePopulate Transfer Preset"
                  data-info="This option will fill in the Number to Dial field in the Transfer Conference frame of the agent screen if defined. Default is N for disabled."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      PrePopulate Transfer Preset{" "}
                    </InputLabel>
                    <Select
                      value={prepopulate_transfer_preset}
                      onChange={this.handleChange(
                        "prepopulate_transfer_preset"
                      )}
                      input={<Input id="age-simple" />}
                    >
                      {list_prepopulate_transfer_preset &&
                        list_prepopulate_transfer_preset.map(option => (
                          <MenuItem key={option} value={option}>
                            {" "}
                            {option}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Scheduled Callbacks"
                  data-info="This option allows an agent to disposition a call as CALLBK and choose the data and time at which the lead will be re-activated."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <p />
                  <p className="MuiFormhelpertext-root-253">Active *</p>
                  <div className="row">
                    <Switch
                      value={scheduled_callbacks}
                      onChange={this.scheduledcallbacksActiveChange}
                      label="Scheduled Callbacks"
                      checked={scheduled_callbacks == "Y" ? true : false}
                      color="primary"
                    />
                  </div>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Scheduled Callbacks Alert"
                  data-info="This option allows the callbacks status line in the agent interface to be red, blink or blink red when there are AGENTONLY scheduled callbacks that have hit their trigger time and date. Default is NONE for standard status line."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      Scheduled Callbacks Alert{" "}
                    </InputLabel>
                    <Select
                      value={scheduled_callbacks_alert}
                      onChange={this.handleChange("scheduled_callbacks_alert")}
                      input={<Input id="age-simple" />}
                    >
                      {list_scheduled_callbacks_alert &&
                        list_scheduled_callbacks_alert.map(option => (
                          <MenuItem key={option} value={option}>
                            {" "}
                            {option}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Scheduled Callbacks Count"
                  data-info="These options allows you to limit the viewable callbacks in the agent callback alert section on the agent screen, to only LIVE callbacks."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      Scheduled Callbacks Count{" "}
                    </InputLabel>
                    <Select
                      value={scheduled_callbacks_count}
                      onChange={this.handleChange("scheduled_callbacks_count")}
                      input={<Input id="age-simple" />}
                    >
                      {list_scheduled_callbacks_count &&
                        list_scheduled_callbacks_count.map(option => (
                          <MenuItem key={option} value={option}>
                            {" "}
                            {option}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Use Internal DNC List"
                  data-info="This defines whether this campaign is to filter leads against the Internal DNC list."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      Use Internal DNC List{" "}
                    </InputLabel>
                    <Select
                      value={use_internal_dnc}
                      onChange={this.handleChange("use_internal_dnc")}
                      input={<Input id="age-simple" />}
                    >
                      {list_use_internal_dnc &&
                        list_use_internal_dnc.map(option => (
                          <MenuItem key={option} value={option}>
                            {" "}
                            {option}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Use Campaign DNC List"
                  data-info="This defines whether this campaign is to filter leads against a DNC list that is specific to that campaign only."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      Use Campaign dnc{" "}
                    </InputLabel>
                    <Select
                      value={use_campaign_dnc}
                      onChange={this.handleChange("use_campaign_dnc")}
                      input={<Input id="age-simple" />}
                    >
                      {list_use_campaign_dnc &&
                        list_use_campaign_dnc.map(option => (
                          <MenuItem key={option} value={option}>
                            {" "}
                            {option}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>
                <div
                  className="col-md-12 col-12"
                  data-title="Agent Screen Labels"
                  data-info="You can select a set of agent screen labels to use with this option. Default is --SYSTEM-SETTINGS-- for the default labels.."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      Agent Screen Labels{" "}
                    </InputLabel>
                    <Select
                      value={screen_labels}
                      onChange={this.handleChange("screen_labels")}
                      input={<Input id="age-simple" />}
                    >
                      {list_screen_labels &&
                        list_screen_labels.map(option => (
                          <MenuItem key={option.id} value={option.id}>
                            {" "}
                            {option.name}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Agent Display Queue Count"
                  data-info="If set to Y, when a customer is waiting for an agent, the Queue Calls display at the top of the agent screen will turn red and show the number of waiting calls. Default is Y."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <p />
                  <p className="MuiFormhelpertext-root-253">Active *</p>
                  <div className="row">
                    <Switch
                      value={display_queue_count}
                      onChange={this.displayqueuecountActiveChange}
                      label="Scheduled Callbacks"
                      checked={display_queue_count == "Y" ? true : false}
                      color="primary"
                    />
                  </div>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Agent View Calls in Queue"
                  data-info="If set to anything but NONE, agents will be able to see details about the calls that are waiting in queue in their agent screen. If set to a number value, the calls displayed will be limited to the number selected. Default is NONE."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      Agent View Calls in Queue{" "}
                    </InputLabel>
                    <Select
                      value={view_calls_in_queue}
                      onChange={this.handleChange("view_calls_in_queue")}
                      input={<Input id="age-simple" />}
                    >
                      {list_view_calls_in_queue &&
                        list_view_calls_in_queue.map(option => (
                          <MenuItem key={option} value={option}>
                            {" "}
                            {option}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="View Calls in Queue Launch"
                  data-info="This setting if set to AUTO will have the Calls in Queue frame show up upon login by the agent into the agent screen. Default is MANUAL."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      View Calls in Queue Launch{" "}
                    </InputLabel>
                    <Select
                      value={view_calls_in_queue_launch}
                      onChange={this.handleChange("view_calls_in_queue_launch")}
                      input={<Input id="age-simple" />}
                    >
                      {list_view_calls_in_queue_launch &&
                        list_view_calls_in_queue_launch.map(option => (
                          <MenuItem key={option} value={option}>
                            {" "}
                            {option}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Agent Grab Calls in Queue"
                  data-info="This option if set to Y will allow the agent to select the call that they want to take from the Calls in Queue display by clicking on it while paused."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <p />
                  <p className="MuiFormhelpertext-root-253">Active *</p>
                  <div className="row">
                    <Switch
                      value={grab_calls_in_queue}
                      onChange={this.grabcallsinqueueActiveChange}
                      label="Scheduled Callbacks"
                      checked={grab_calls_in_queue == "Y" ? true : false}
                      color="primary"
                    />
                  </div>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Manual Preview Dial"
                  data-info="You can select a set of agent screen labels to use with this option. Default is --SYSTEM-SETTINGS-- for the default labels.."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      Manual Preview Dial{" "}
                    </InputLabel>
                    <Select
                      value={manual_preview_dial}
                      onChange={this.handleChange("manual_preview_dial")}
                      input={<Input id="age-simple" />}
                    >
                      {list_manual_preview_dial &&
                        list_manual_preview_dial.map(option => (
                          <MenuItem key={option} value={option}>
                            {" "}
                            {option}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="3-Way Call Outbound CallerIDl"
                  data-info="THIS FEATURE IS CURRENTLY ONLY ENABLED FOR INTERNET EXPLORER."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      3-Way Call Outbound CallerID{" "}
                    </InputLabel>
                    <Select
                      value={three_way_call_cid}
                      onChange={this.handleChange("three_way_call_cid")}
                      input={<Input id="age-simple" />}
                    >
                      {list_three_way_call_cid &&
                        list_three_way_call_cid.map(option => (
                          <MenuItem key={option} value={option}>
                            {" "}
                            {option}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div className="col-md-12 col-12">
                  <div className="sub_menu_div" style={style_header}>
                    {" "}
                    <i className="fa fa-bars" style={{ marginRight: "10px" }} />
                    Outbound Web Pops
                  </div>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="CRM Popup Address"
                  data-info="The web address of a CRM login page, it can have variables populated just like the web form address, with the VAR in the front and using --A--user_custom_one--B-- to define variables."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <TextField
                    id="crm_login_address"
                    label="CRM Popup Address"
                    value={crm_login_address}
                    onChange={this.handleChange("crm_login_address")}
                    margin="normal"
                    fullWidth
                  />
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="CRM Popup Address"
                  data-info="The web address of a CRM login page, it can have variables populated just like the web form address, with the VAR in the front and using --A--user_custom_one--B-- to define variables."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <TextField
                    id="crm_login_address"
                    label="CRM Popup Address"
                    value={crm_login_address}
                    onChange={this.handleChange("crm_login_address")}
                    margin="normal"
                    fullWidth
                  />
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Start call URL"
                  data-info="This web URL address is not seen by the agent, but it is called every time a call is sent to an agent if it is populated. Uses the same variables as the web form fields and scripts. This URL can NOT be a relative path. The Start URL does not work for Manual dial calls. Default is blank."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <TextField
                    id="start_call_url"
                    label="Start call URL"
                    value={start_call_url}
                    onChange={this.handleChange("start_call_url")}
                    margin="normal"
                    fullWidth
                  />
                </div>

                <div
                  className="col-md-12 col-12"
                  data-title="Dispo Call URL"
                  data-info="This web URL address is not seen by the agent, but it is called every time a call is dispositioned by an agent if it is populated. Uses the same variables as the web form fields and scripts. dispo and talk_time are the variables you can use to retrieve the agent-defined disposition for the call and the actual talk time in seconds of the call. This URL can NOT be a relative path. Default is blank."
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.onMouseLeave}
                >
                  <TextField
                    id="dispo_call_url"
                    label="Dispo Call URL"
                    value={dispo_call_url}
                    onChange={this.handleChange("dispo_call_url")}
                    margin="normal"
                    fullWidth
                  />
                </div>

                {/* <div className="col-md-12 col-12">
                  <br /> <br />
                  <Button
                    variant="raised"
                    className="jr-btn bg-purple text-white"
                    onClick={this.handleSubmit}
                    value="submit"
                  >
                    <i className="zmdi zmdi-mail-send zmdi-hc-fw" />
                    <span>Submit</span>
                  </Button>
                </div> */}
              </form>
            </CardBox>
            <div className="col-lg-4" style={{ display: "grid" }}>
              <div className="jr-card " style={{ position: "fixed" }}>
                <div className="jr-card-body ">
                  <div className="col-md-12 col-12 mt-12">
                    <div>
                      <div className="card-body" style={{ padding: "0px" }}>
                        <h3 style={{ padding: "3px", fontSize: "23px" }}>
                          {this.state.showinfotitle != ""
                            ? this.state.showinfotitle
                            : "title"}
                        </h3>
                        <hr />
                        <p className="card-text">{this.state.showinfo} </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {isLoding && (
            <div className="loader-view" id="loader-view">
              <CircularProgress />
            </div>
          )}
        </div>
      );
    }
  }
}

export default EditCampaign;
