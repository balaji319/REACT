import React, { Component } from "react";
import { UncontrolledAlert, Alert } from "reactstrap";
import SweetAlert from "react-bootstrap-sweetalert";
import Paper from "@material-ui/core/Paper";
import Switch from "@material-ui/core/Switch";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import ContainerHeader from "../../../../../../../components/ContainerHeader/index";
import CardBox from "../../../../../../../components/CardBox/index";
import MyPicker from "./customPicker/MyPicker";
import IntlMessages from "../../../../../../../util/IntlMessages";
import VoicemailPopUp from "./VoicemailPopUp";
import AudioPopUp from "./AudioPopUp";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import Divider from "@material-ui/core/Divider";
import DialogContent from "@material-ui/core/DialogContent";
import AudioManager from "../../../../../../../components/common/AudioManager";
import { fetchGlobal } from "../../../../../../../actions/Global";
import DialogActions from "@material-ui/core/DialogActions";
import { Route, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { createNotification } from "../../../../../../../Helpers";
import ButtonNav from "../../../../../../../components/navButton/";
import {
  list_next_agent_call,
  priority_data,
  script_data,
  call_lunch_data,
  call_time_id_data,
  after_hours_action_data,
  style_header,
  play_welcome_message_data
} from "./data";
import { Values } from "redux-form-website-template";
import { API_FETCH_INBOUND_EDIT_DATA } from "../../../../constants";

const drop_action_data = [
  {
    value: "HANGUP",
    label: "HANGUP"
  },
  {
    value: "MESSAGE",
    label: "MESSAGE"
  },
  {
    value: "VOICEMAIL ",
    label: "VOICEMAIL"
  },
  {
    value: "IN_GROUP",
    label: "IN_GROUP"
  },
  {
    value: "CALLMENU",
    label: "CALLMENU"
  }
];

const users = [
  {
    id: 1,
    mailboxes: "1000",
    name: "balasasAsAji VP ",
    email: "jhonasassmith@example.com"
  },
  {
    id: 2,
    mailboxes: "102",
    name: "balaji V1qqqqqP ",
    email: "jhonsmasassdith@example.com"
  },
  {
    id: 3,
    mailboxes: "888",
    name: "qqwqwqwbalaji VP ",
    email: "jhonsmith@example.com"
  },
  {
    id: 4,
    mailboxes: "999",
    name: "qwqwbalaji VP ",
    email: "jhonsmitsdh@example.com"
  },
  {
    id: 5,
    mailboxes: "777",
    name: "bsasaasalaji VP ",
    email: "jhonsasassmith@example.com"
  },
  {
    id: 6,
    mailboxes: "1111",
    name: "sasabasasalaji VP ",
    email: "jhonsmitsdsdsdh@example.com"
  },
  {
    id: 7,
    mailboxes: "10121",
    name: "balaji VP ",
    email: "jhonsmitsdsh@example.com"
  },
  {
    id: 8,
    mailboxes: "102100",
    name: "balaji VP ",
    email: "jhonsmitdsdh@example.com"
  },
  {
    id: 9,
    mailboxes: "101212",
    name: "balaji VP ",
    email: "jhonsmitsdsh@example.com"
  },
  {
    id: 10,
    mailboxes: "55",
    name: "bsasalaji VP ",
    email: "jhonsmdsdsith@example.com"
  },
  {
    id: 11,
    mailboxes: "44",
    name: "balaji VP ",
    email: "jhonssdsdsdmithdsdsdsds@example.com"
  },
  {
    id: 12,
    mailboxes: "888",
    name: "balaji VP ",
    email: "jhonsmsdsdith@example.com"
  },
  {
    id: 13,
    mailboxes: "999",
    name: "basasalaji VP ",
    email: "jhonaaasasamith@example.com"
  },
  {
    id: 14,
    mailboxes: "222",
    name: "balaji VP ",
    email: "jhonsmith@example.com"
  },
  {
    id: 15,
    mailboxes: "232",
    name: "qw VP ",
    email: "jhoasasasasassnsmith@example.com"
  },
  {
    id: 16,
    mailboxes: "10232300",
    name: "bsasalaji VP ",
    email: "jhonsmith@example.com"
  },
  {
    id: 17,
    mailboxes: "1020230",
    name: "qw VP ",
    email: "jhonsasasasassmith@example.com"
  },
  {
    id: 18,
    mailboxes: "10010",
    name: "wqw VP ",
    email: "jhonsmith@example.com"
  },
  {
    id: 19,
    mailboxes: "102300",
    name: "bswqwqwasaalaji VP ",
    email: "jhonsmith@example.com"
  },
  {
    id: 20,
    mailboxes: "10100",
    name: "wq VP ",
    email: "jhonsmith@example.com"
  },
  {
    id: 21,
    mailboxes: "88",
    name: "balaji VP ",
    email: "jhonsmith@example.com"
  },
  {
    id: 22,
    mailboxes: "105500",
    name: "wqw VP ",
    email: "jhonsmith@example.com"
  },
  {
    id: 23,
    mailboxes: "10900",
    name: "bsasasaalaji VP ",
    email: "jhonasassasassmith@example.com"
  },
  {
    id: 24,
    mailboxes: "00",
    name: "baasasalaji VP ",
    email: "jhonsmith@example.com"
  },
  {
    id: 25,
    mailboxes: "10ee00",
    name: "basasasalaji VP ",
    email: "jhonsmith@example.com"
  },
  {
    id: 26,
    mailboxes: "10errer00",
    name: "balaji VP ",
    email: "jhonsasassmith@example.com"
  },
  {
    id: 27,
    mailboxes: "10er00",
    name: "bsasalaji VP ",
    email: "jhonsasasmith@example.com"
  },
  {
    id: 28,
    mailboxes: "1er000",
    name: "bsasaalaji VP ",
    email: "sas@example.com"
  },
  {
    id: 29,
    mailboxes: "100er0",
    name: "basslaji VP ",
    email: "jhasasasonsmith@example.com"
  },
  {
    id: 30,
    mailboxes: "10er00",
    name: "bsasasasalaji VP ",
    email: "jhonsmith@example.com"
  },
  {
    id: 31,
    mailboxes: "10006",
    name: "bsalaji VP ",
    email: "jhoasasasnsmith@example.com"
  },
  {
    id: 32,
    mailboxes: "103900",
    name: "saq VP ",
    email: "jhonsasasasasmith@example.com"
  }
];

import {
  scriptTextFields,
  scriptTextFieldsPrefix,
  scriptTextFieldsPostfix
} from "./data";
import axios from "axios";

class EditScript extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pageTitle: this.props.location.pathname.split("/")[5],
      groupId:
        this.props.location.pathname.split("/")[4] == "add"
          ? ""
          : this.props.location.pathname.split("/").pop(),
      pageError: false,
      scriptField: "",
      group_name: "",
      groupActive: true,
      groupActiveValue: "Y",
      scriptTextSelectionStart: 0,
      showAlert: false,
      alertContent: "",
      alertTitle: "",
      showConfirm: false,
      showinfo: "Hover to the input on left and help text will come up here :)",
      showinfotitle: "Help Block",
      web_form_address: "",
      web_form_address_two: "",
      group_color: "#FFA500",
      queue_priority: "",
      ingroup_script: ["121"],
      groupscriptActiveValue: "Y",
      groupscriptActive: true,
      getcalllanunch: "NONE",
      drop_call_seconds: "360",
      drop_action: "",
      drop_exten: "",
      no_agent_no_queue: "",
      dropext: "",
      voicemail: "",
      ingroup: "",
      dropcallmenu: "",
      open: false,
      open1: false,
      audiofile: "",
      selectedValue: users[1].mailboxes,
      selectedMValue: "",
      next_agent_call: ["longest_wait_time"],
      list_next_agent_call: [],
      priority_data: [],
      ignore_list_script_override: "",
      extension_appended_cidname: "",
      get_call_launch: "",
      call_time_id: [],
      action_xfer_cid: "",
      after_hours_action: ["MESSAGE"],
      audio_dialog: false,
      after_hours_message_filename: "",
      welcome_message_filename: "",
      play_welcome_message: ["ALWAYS"],
      moh_context: "",
      prompt_interval: "",
      agent_alert_delay: "",
      agent_alert_exten: "",
      start_call_url: "",
      dispo_call_url: "",
      na_call_url: "",
      inbound_scriptlist: [],
      calltimelist: [],
      welcome_audio_dialog: false,
      onhold_filename_dialog: false,
      agent_alert_filename_dialog: false,
      after_hour_filename_dialog: false,
      is_change: false,
      handleActiveScriptChange: ""
    };
  }

  handledwelcomeOpenAudioManagerDialog = () => {
    this.setState({ welcome_audio_dialog: !this.state.welcome_audio_dialog });
  };

  //welcome audio
  handledOpenWelcomeAudioManagerDialog = () => {
    this.setState({ welcome_message_filename: !this.state.audio_dialog });
  };
  handlewelcomemessageListItemClick = value => {
    this.setState({ welcome_message_filename: value });
    this.handledwelcomeOpenAudioManagerDialog();
  };

  //onhold audio
  // handledOpenWelcomeAudioManagerDialog = () => {
  //   this.setState({ welcome_message_filename: !this.state.audio_dialog });
  // };
  // handlewelcomemessageListItemClick = value => {
  //   this.setState({ welcome_message_filename: value });
  //   this.handledwelcomeOpenAudioManagerDialog();
  // };

  handledOpenonholdAudioManagerDialog = () => {
    this.setState({ onhold_prompt_filename: !this.state.audio_dialog });
  };

  handleRequestClose = value => {
    this.setState({ voicemail: value, open: false });
  };

  handleRequestClose1 = value => {
    this.setState({ audiofile: value, open1: false });
  };
  handleRequestClose1Moh = value => {
    this.setState({ moh_context: value, open1: false });
  };
  handleRequestClose1Exe = value => {
    this.setState({ agent_alert_exten: value, open1: false });
  };

  getDynamicDrop = Index => {
    if (Index) {
      switch (Index) {
        case "HANGUP":
          return this.getHangInformation();
        case "MESSAGE":
          return this.getMESSAGEInformation();
        case "VOICEMAIL ":
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
    return "";
  };

  getMESSAGEInformation = () => {
    return (
      <TextField
        id="dropActiondropext"
        label="Drop Action*"
        margin="normal"
        onChange={this.handleChange("dropext")}
        fullWidth
        value={this.state.dropext}
      />
    );
  };

  getVOICEMAILInformation = () => {
    return (
      <div>
        <TextField
          id="voicemail"
          label="Voice mail*"
          margin="normal"
          onChange={this.handleChange("voicemail")}
          fullWidth
          value={this.state.voicemail}
        />{" "}
        <div>
          <a
            data-controls-modal="audio_list"
            data-backdrop="static"
            data-keyboard="false"
            href="javascript:void(0)"
            className="btn btn-info showVoicemail"
            onClick={() => this.setState({ open: true })}
          >
            Voicemail Chooser
          </a>
          <VoicemailPopUp
            users={users}
            selectedValue={this.state.selectedValue}
            open={this.state.open}
            onClose={this.handleRequestClose.bind(this)}
          />
        </div>{" "}
      </div>
    );
  };

  getIN_GROUP = () => {
    return (
      <TextField
        id="select-get-call-launch-native"
        onChange={this.handleChange("ingroup")}
        select
        label="Drop Transfer Group"
        margin="normal"
        tabIndex="-1"
        fullWidth
        value={this.state.ingroup}
      >
        {call_lunch_data.map(option => (
          <option key={option.value} value={option.value}>
            {" "}
            {option.label}{" "}
          </option>
        ))}{" "}
      </TextField>
    );
  };
  getCALLMENU = () => {
    return (
      <TextField
        id="select-get-call-launch-native"
        select
        onChange={this.handleChange("dropcallmenu")}
        label="Drop Call Menu"
        margin="normal"
        tabIndex="-1"
        fullWidth
        value={this.state.dropcallmenu}
      >
        {call_lunch_data.map(option => (
          <option key={option.value} value={option.value}>
            {" "}
            {option.label}{" "}
          </option>
        ))}
      </TextField>
    );
  };

  componentDidMount() {
    this.props.fetchGlobal(["scriptlist", "calltime"]);
    this.getData();
  }
  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      inbound_scriptlist: nextPropsFromRedux.Global.scriptlist
        ? nextPropsFromRedux.Global.scriptlist
        : "",
      calltimelist: nextPropsFromRedux.Global.calltimelist
        ? nextPropsFromRedux.Global.calltimelist
        : ""
    });
  }

  getData = e => {
    let _this = this;
    _this.setState({ isLoding: true });
    axios
      .get(API_FETCH_INBOUND_EDIT_DATA + this.state.pageTitle)
      .then(response => {
        let inboundData = response.data.data;
        console.log("========inbound data======");
        console.log(inboundData);

        _this.setState({
          web_form_address: inboundData.web_form_address,
          group_name: inboundData.group_name,
          web_form_address_two: inboundData.web_form_address_two,
          group_color: inboundData.group_color,
          next_agent_call: inboundData.next_agent_call,
          queue_priority: inboundData.queue_priority,
          ingroup_script: inboundData.ingroup_script,
          ignore_list_script_override: inboundData.ignore_list_script_override,
          get_call_launch: inboundData.get_call_launch,
          drop_call_seconds: inboundData.drop_call_seconds,
          call_time_id: inboundData.call_time_id,
          action_xfer_cid: inboundData.action_xfer_cid,
          after_hours_action: inboundData.after_hours_action,
          after_hours_message_filename:
            inboundData.after_hours_message_filename,
          drop_action: inboundData.drop_action,
          drop_exten: inboundData.drop_exten,
          no_agent_no_queue: inboundData.no_agent_no_queue,
          welcome_message_filename: inboundData.welcome_message_filename,
          play_welcome_message: inboundData.play_welcome_message,
          moh_context: inboundData.moh_context,
          prompt_interval: inboundData.prompt_interval,
          agent_alert_exten: inboundData.agent_alert_exten,
          agent_alert_delay: inboundData.agent_alert_delay,
          start_call_url: inboundData.start_call_url,
          dispo_call_url: inboundData.dispo_call_url,
          na_call_url: inboundData.na_call_url,
          extension_appended_cidname: inboundData.extension_appended_cidname,
          active: inboundData.active,
          ignore_list_script_override: inboundData.ignore_list_script_override,
          handleActiveScriptChange: inboundData.handleActiveScriptChange
        });
      })
      .catch(function(error) {
        _this.setState({ isLoding: true });
      });
  };

  handleShowAlert = flag => {
    this.setState({ showAlert: flag });
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value, is_change: true });
  };

  handleScriptTextClick = event => {
    this.setState({ scriptTextSelectionStart: event.target.selectionStart });
  };

  logMouseEnter = e => {
    this.setState({ showinfo: e.target.getAttribute("data-info") }),
      this.setState({ showinfotitle: e.target.getAttribute("data-title") });
  };

  logMouseLeave = e => {
    if (e) {
      this.setState({
        showinfotitle: "Help Block",
        showinfo:
          "Hover to the input on left and help text will come up here :)"
      });
    }
  };

  logNativeMouseLeave = () => {
    console.log("&nbsp;&nbsp;&nbsp;mouseleave (native)");
  };
  clearLog = () => {
    console.log();
  };

  handleActiveChange = (event, checked) => {
    //this.setState({ groupActive: checked });
    this.setState({ active: checked ? "Y" : "N" });
    // this.setState({ ignore_list_script_override: checked ? "Y" : "N" });
    // this.setState({ extension_appended_cidname: checked ? "Y" : "N" });
  };
  handleActiveScriptChange = (event, checked) => {
    this.setState({ ignore_list_script_override: checked ? "Y" : "N" });
  };

  handleActiveextensionChange = (event, checked) => {
    this.setState({ extension_appended_cidname: checked ? "Y" : "N" });
  };

  handlescriptChange = (event, checked) => {
    this.setState({ groupscriptActive: checked });
    this.setState({ groupscriptActiveValue: checked ? "Y" : "N" });
  };

  handleColorChange = ({ hex }) => {
    this.setState({ group_color: hex });
  };

  handleSubmit = () => {
    let _this = this;

    let campaign_id = this.state.campaign_id;
    let campaignName = this.state.campaign_name;
    let scriptComment = this.state.scriptComment;
    let scriptText = this.state.scriptText;
    let scriptActiveValue = this.state.scriptActiveValue;
    let pageTitle = this.state.pageTitle;
    _this.setState({ isLoding: true });
    let error = false;

    if (!error) {
      let postData = {
        group_id: this.state.pageTitle,
        group_name: this.state.group_name,
        group_color: this.state.group_color,
        active: this.state.active,
        web_form_address: this.state.web_form_address,
        web_form_address_two: this.state.web_form_address_two,
        next_agent_call: this.state.next_agent_call,
        queue_priority: this.state.queue_priority,
        ingroup_script: this.state.ingroup_script,
        ignore_list_script_override: this.state.ignore_list_script_override,
        get_call_launch: this.state.get_call_launch,
        drop_call_seconds: this.state.drop_call_seconds,
        drop_action: this.state.after_hours_action,
        drop_exten: this.state.drop_exten,
        voicemail_ext: "",
        drop_callmenu: "",
        call_time_id: this.state.call_time_id,
        action_xfer_cid: this.state.action_xfer_cid,
        after_hours_action: this.state.after_hours_action,
        after_hours_message_filename: this.state.after_hours_message_filename,
        after_hours_exten: this.state.after_hours_exten,
        after_hours_voicemail: this.state.after_hours_voicemail,
        after_hours_callmenu: this.state.after_hours_callmenu,
        no_agent_no_queue: this.state.no_agent_no_queue,
        no_agent_action: this.state.no_agent_action,
        no_agent_action_value: this.state.no_agent_action_value,
        welcome_message_filename: this.state.welcome_message_filename,
        play_welcome_message: this.state.play_welcome_message,
        moh_context: this.state.moh_context,
        onhold_prompt_filename: this.state.onhold_prompt_filename,
        prompt_interval: this.state.prompt_interval,
        agent_alert_exten: this.state.agent_alert_exten,
        agent_alert_delay: this.state.agent_alert_delay,
        start_call_url: this.state.start_call_url,
        dispo_call_url: this.state.dispo_call_url,
        na_call_url: this.state.na_call_url,
        extension_appended_cidname: this.state.extension_appended_cidname
      };

      let _this = this;
      axios
        .post("/api/inbound-queue-update", postData)
        .then(response => {
          //this.handleShowAlert(true);
          // this.setState({
          //   alertTitle: response.data.status,
          //   alertContent: response.data.msg
          //   //showAlert:true
          // });
          _this.setState({ isLoding: false });
          createNotification(
            "Success",
            "Success",
            "Record Updated Sucessfully"
          );
        })
        .catch(function(error) {
          _this.setState({ isLoding: false });
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
      scriptId,
      groupId,
      group_name,
      groupActive,
      groupActiveValue,
      scriptText,
      scriptField,
      scriptIdError,
      scriptNameError,
      scriptCommentError,
      scriptTextError,
      groupNameError,
      web_form_address_two,
      web_form_address,
      group_color,
      next_agent_call,
      queue_priority,
      ingroup_script,
      groupscriptActiveValue,
      groupscriptActive,
      getcalllanunch,
      drop_call_seconds,
      drop_action,
      no_agent_no_queue,
      drop_exten,
      dropext,
      voicemail,
      ingroup,
      dropcallmenu,
      action_xfer_cid,
      ignore_list_script_override,
      after_hours_action,
      get_call_launch,
      call_time_id,
      after_hours_message_filename,
      welcome_message_filename,
      play_welcome_message,
      moh_context,
      prompt_interval,
      agent_alert_exten,
      agent_alert_delay,
      start_call_url,
      dispo_call_url,
      na_call_url,
      extension_appended_cidname,
      inbound_scriptlist,
      calltimelist,
      active,
      handleActiveScriptChange,
      is_change
    } = this.state;
    console.log(
      "****************************************priority_data ************************"
    );
    console.log(this.state.extension_appended_cidname);
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
            title={pageTitle + " Group"}
          />
          {this.state.is_change && <ButtonNav click={this.handleSubmit} />}
          <div className="row">
            <SweetAlert
              show={showAlert}
              success={alertTitle === "Success" ? true : false}
              error={alertTitle === "Error" ? true : false}
              title={alertTitle}
              onConfirm={() => this.handleShowAlert(false)}
              onCancel={() => this.handleShowAlert(false)}
            >
              {alertContent}
            </SweetAlert>
            <CardBox
              styleName="col-lg-8    "
              heading={pageTitle == "add" ? "Add new Group" : scriptId}
            >
              <form className="row" noValidate autoComplete="off">
                <div
                  className="col-md-12 col-6"
                  data-info="Your Inbound Group ID
                                     This is name of Inbound Group, must be between 2 and 20 characters in length."
                  data-title="Group ID "
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="script-id"
                    onChange={this.handleChange("groupId")}
                    error={scriptIdError}
                    label="Group ID *"
                    value={groupId}
                    disabled={pageTitle == "add" ? false : true}
                    margin="normal"
                    fullWidth
                  />
                </div>
                <div
                  className="col-md-12 col-6"
                  data-info=" Your Inbound Group ID
                                 This is name of Inbound Group, must be between 2 and 20 characters in length. "
                  data-title="Group Name "
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="Group-Name"
                    label="Group Name *"
                    value={group_name}
                    onChange={this.handleChange("group_name")}
                    margin="normal"
                    fullWidth
                    error={groupNameError}
                  />
                </div>

                <div
                  className="col-md-12"
                  data-info=" This is the color that displays in the agent client app when a call comes in on this group. It must be between 2 and 7 characters long. If this is a hex color definition you must remember to put a # at the beginning of the string."
                  data-title="Group Color "
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <div className="form-group">
                    <label>Group Color </label>
                    <MyPicker
                      id="group_color"
                      name="group_color"
                      color={this.state.group_color}
                      onChangeComplete={this.handleColorChange}
                    />
                  </div>
                </div>
                <div
                  className="col-md-12"
                  data-info=" This determines whether this inbound group is available to take calls."
                  data-title="Active "
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <p className="MuiFormHelperText-root-253">
                    {" "}
                    ActiveTTTT *{active}
                  </p>
                  <div className="row">
                    <Switch
                      value={active}
                      label="Active"
                      onChange={this.handleActiveChange}
                      checked={active == "Y" ? true : false}
                      color="primary"
                    />
                  </div>
                </div>
                <div
                  className="col-md-12 col-6"
                  data-info="This is the custom address that clicking on the WEB FORM button in the agent screen will take you to for calls that come in on this group."
                  data-title="Web Form"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="web_form_address"
                    label="Web Form*"
                    margin="normal"
                    fullWidth
                    value={web_form_address}
                    onChange={this.handleChange("web_form_address")}
                  />
                </div>
                <div
                  className="col-md-12 col-6"
                  data-info="This is the custom address that clicking on the WEB FORM button in the agent screen will take you to for calls that come in on this group"
                  data-title="Web Form Two"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="web_form_address_two"
                    label="Web Form Two *"
                    margin="normal"
                    fullWidth
                    value={web_form_address_two}
                    onChange={this.handleChange("web_form_address_two")}
                    error={scriptNameError}
                  />
                </div>

                <div
                  className="col-md-12"
                  data-info="This determines which agent receives the next call that is available."
                  data-title="Next Agent Call"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      Next Agent Call{" "}
                    </InputLabel>
                    <Select
                      value={next_agent_call}
                      onChange={this.handleChange("next_agent_call")}
                      input={<Input id="age-simple" />}
                    >
                      {list_next_agent_call.map((option, i) => (
                        <MenuItem key={i} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12"
                  data-info="This setting is used to define the order in which the calls from this inbound group should be answered in relation to calls from other inbound groups."
                  data-title="Queue Priority"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      Queue Priority {queue_priority}
                    </InputLabel>
                    <Select
                      value={queue_priority}
                      onChange={this.handleChange("queue_priority")}
                      input={<Input id="age-simple" />}
                    >
                      {priority_data &&
                        priority_data.map((option, i) => (
                          <MenuItem key={i} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12"
                  data-info="This menu allows you to choose the script that will appear on the agents screen for this campaign."
                  data-title="Script"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple"> Script </InputLabel>
                    <Select
                      value={ingroup_script}
                      onChange={this.handleChange("ingroup_script")}
                      input={<Input id="age-simple" />}
                    >
                      {inbound_scriptlist &&
                        inbound_scriptlist.map((option, i) => (
                          <MenuItem key={i} value={option.script_id}>
                            {" "}
                            {option.script_id}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12"
                  data-info="This option allows you to ignore the list ID Script Override option for calls coming into this In-Group."
                  data-title="Ignore List Script Override"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <p className="MuiFormHelperText-root-253">
                    {" "}
                    Ignore List Script Override{" "}
                  </p>
                  <div className="row">
                    <Switch
                      label="Ignore List Script Override"
                      value={ignore_list_script_override}
                      onChange={this.handleActiveScriptChange}
                      checked={
                        ignore_list_script_override == "Y" ? true : false
                      }
                      label="Ignore List Script Override"
                      color="primary"
                    />
                  </div>
                </div>

                <div
                  className="col-md-12"
                  data-info="This menu allows you to choose whether you want to auto-launch the web-form page in a separate window."
                  data-title="Get Call Launch"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
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
                      {call_lunch_data &&
                        call_lunch_data.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {" "}
                            {option.label}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div className="col-md-12">
                  <TextField
                    id="drop_call_seconds"
                    onChange={this.handleChange("drop_call_seconds")}
                    label="Drop Call Seconds"
                    value={drop_call_seconds}
                    margin="normal"
                    fullWidth
                  />
                </div>

                <div className="row col-md-12">
                  <div className="col-md-12">
                    <div className="form-group">
                      <TextField
                        id="select-drop-action-native"
                        select
                        label="Drop Action"
                        margin="normal"
                        tabIndex="-1"
                        value={drop_action}
                        onChange={this.handleChange("drop_action")}
                        fullWidth
                      >
                        {drop_action_data.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </TextField>
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="form-group">
                      {this.getDynamicDrop(drop_action)}
                    </div>
                  </div>
                </div>

                <div
                  className="col-md-12"
                  data-info="This is the call time scheme to use for this inbound group. It Should be based on the server time."
                  data-title="Call Time"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      Call Time {call_time_id}{" "}
                    </InputLabel>
                    <Select
                      value={call_time_id}
                      onChange={this.handleChange("call_time_id")}
                      input={<Input id="age-simple" />}
                    >
                      {calltimelist &&
                        calltimelist.map(option => (
                          <MenuItem
                            key={option.call_time_id}
                            value={option.call_time_id}
                          >
                            {" "}
                            {option.call_time_id}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12"
                  data-info="This is the caller ID number that the call uses before it is transferred to extensions, messages, voicemail or call menus.."
                  data-title="Action Transfer CID"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="action_xfer_cid"
                    onChange={this.handleChange("action_xfer_cid")}
                    label="Action Transfer CID"
                    value={action_xfer_cid}
                    margin="normal"
                    fullWidth
                  />
                </div>

                <div
                  className="col-md-12"
                  data-info="The action to perform if it is after hours as defined in the call time for this inbound group.."
                  data-title="After Hours Action"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      After Hours Action{" "}
                    </InputLabel>
                    <Select
                      value={after_hours_action}
                      onChange={this.handleChange("after_hours_action")}
                      input={<Input id="age-simple" />}
                    >
                      {after_hours_action_data &&
                        after_hours_action_data.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {" "}
                            {option.label}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                {/* <div
                  className="col-md-12"
                  data-info="The audio file located on the server to be played if the Action is set to MESSAGE. Default is vm-goodbye."
                  data-title="After Hours Message Filename"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="after_hours_message_filename"
                    onChange={this.handleChange("after_hours_message_filename")}
                    label="After Hours Message Filename"
                    value={after_hours_message_filename}
                    margin="normal"
                    fullWidth
                  />
                  <Button
                    color="primary"
                    className="jr-btn bg-primary text-white"
                    onClick={this.handledOpenAudioManagerDialog}
                  >
                    Select/Manage Audio
                  </Button>
                </div> */}
                <Dialog
                  maxWidth="md"
                  fullWidth={true}
                  open={this.state.audio_dialog}
                >
                  <DialogTitle>Audio Manager</DialogTitle>
                  <Divider />
                  <DialogContent>
                    <AudioManager
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

                <div className="col-md-12">
                  <TextField
                    id="audio"
                    label="Audio *"
                    margin="normal"
                    onChange={this.handleChange("audiofile")}
                    fullWidth
                    value={this.state.audiofile}
                  />
                  <div>
                    <a
                      data-controls-modal="  _list"
                      data-backdrop="static"
                      data-keyboard="false"
                      href="javascript:void(0)"
                      className="btn btn-info showVoicemail"
                      onClick={() => this.setState({ open1: true })}
                    >
                      Audio Chooser
                    </a>
                    <AudioPopUp
                      users={users}
                      selectedValue={this.state.selectedMValue}
                      open={this.state.open1}
                      onClose={this.handleRequestClose1.bind(this)}
                    />
                  </div>
                </div>
                <div className="col-md-12 col-12">
                  <div className="sub_menu_div" style={style_header}>
                    {" "}
                    <i className="fa fa-bars" style={{ marginRight: "10px" }} />
                    Prompts and Music on Hold
                  </div>
                </div>
                <div
                  className="col-md-12"
                  data-info="The audio file located on the server to be played when the call comes in.."
                  data-title="Welcome Message Filename"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="welcome_message_filename"
                    onChange={this.handleChange("welcome_message_filename")}
                    label="Welcome Message Filename"
                    value={welcome_message_filename}
                    margin="normal"
                    fullWidth
                  />
                  <Button
                    color="primary"
                    className="jr-btn bg-primary text-white"
                    onClick={this.handledwelcomeOpenAudioManagerDialog}
                  >
                    Select/Manage Audio
                  </Button>
                </div>
                <Dialog
                  maxWidth="md"
                  fullWidth={true}
                  open={this.state.welcome_audio_dialog}
                >
                  <DialogTitle>Audio Manager</DialogTitle>
                  <Divider />
                  <DialogContent>
                    <AudioManager
                      onClose={this.handleRequestCloseAudio}
                      onSelectLanguage={this.handlewelcomemessageListItemClick}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={this.handledwelcomeOpenAudioManagerDialog}
                      color="secondary"
                      className="jr-btn bg-grey text-white"
                    >
                      Close
                    </Button>
                  </DialogActions>
                </Dialog>

                <div
                  className="col-md-12"
                  data-info="These settings select when to play the defined welcome message."
                  data-title="Play Welcome Message"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="age-simple">
                      {" "}
                      Play Welcome Message{" "}
                    </InputLabel>
                    <Select
                      value={play_welcome_message}
                      onChange={this.handleChange("play_welcome_message")}
                      input={<Input id="age-simple" />}
                    >
                      {play_welcome_message_data &&
                        play_welcome_message_data.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {" "}
                            {option.label}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText />
                  </FormControl>
                </div>

                <div
                  className="col-md-12"
                  data-info="The audio file located on the server to be played at a regular interval when the customer is on hold.."
                  data-title="On Hold Prompt Filename"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="audio_moh"
                    label="On Hold Prompt Filename *"
                    margin="normal"
                    onChange={this.handleChange("moh_context")}
                    fullWidth
                    value={moh_context}
                  />
                  <div>
                    <Button
                      color="primary"
                      className="jr-btn bg-primary text-white showVoicemail"
                      onClick={() => this.setState({ open1: true })}
                    >
                      Select/Manage Audio
                    </Button>
                    <AudioPopUp
                      users={users}
                      selectedValue={this.state.selectedMValue}
                      open={this.state.open1}
                      onClose={this.handleRequestClose1Moh.bind(this)}
                    />
                  </div>
                </div>
                <Dialog
                  maxWidth="md"
                  fullWidth={true}
                  open={this.state.audio_dialog}
                >
                  <DialogTitle>Audio Manager</DialogTitle>
                  <Divider />
                  <DialogContent>
                    <AudioManager
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

                <div
                  className="col-md-12"
                  data-info="The length of time in seconds to wait before playing the on hold prompt. Default is 60.."
                  data-title="On Hold Prompt Interval"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="prompt_interval"
                    onChange={this.handleChange("prompt_interval")}
                    label="On Hold Prompt Interval"
                    value={prompt_interval}
                    margin="normal"
                    fullWidth
                  />
                </div>

                <div
                  className="col-md-12"
                  data-info="The audio file located on the server to be played when the call comes in.."
                  data-title="Agent Alert Filename"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="agent_alert_exten"
                    onChange={this.handleChange("agent_alert_exten")}
                    label="Agent Alert Filename"
                    value={agent_alert_exten}
                    margin="normal"
                    fullWidth
                  />
                  <div>
                    <Button
                      color="primary"
                      className="jr-btn bg-primary text-white showVoicemail"
                      onClick={() => this.setState({ open1: true })}
                    >
                      Select/Manage Audio
                    </Button>
                    <AudioPopUp
                      users={users}
                      selectedValue={this.state.selectedMValue}
                      open={this.state.open1}
                      onClose={this.handleRequestClose1Exe.bind(this)}
                    />
                  </div>
                </div>
                <Dialog
                  maxWidth="md"
                  fullWidth={true}
                  open={this.state.audio_dialog}
                >
                  <DialogTitle>Audio Manager</DialogTitle>
                  <Divider />
                  <DialogContent>
                    <AudioManager
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

                <div
                  className="col-md-12"
                  data-info="The length of time in milliseconds to wait before sending the call to the agent after playing the on Agent Alert Extension. Default is 1000.."
                  data-title="Agent Alert Delay"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="agent_alert_delay"
                    onChange={this.handleChange("agent_alert_delay")}
                    label="Agent Alert Delay"
                    value={agent_alert_delay}
                    margin="normal"
                    fullWidth
                  />
                </div>

                <div
                  className="col-md-12"
                  data-info="The length of time in milliseconds to wait before sending the call to the agent after playing the on Agent Alert Extension. Default is 1000.."
                  data-title="Start Call URL"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="start_call_url"
                    onChange={this.handleChange("start_call_url")}
                    label="Start Call URL"
                    value={start_call_url}
                    margin="normal"
                    fullWidth
                  />
                </div>

                <div
                  className="col-md-12"
                  data-info="This web URL address is not seen by the agent, but it is called every time a call is dispositioned by an agent if it is populated."
                  data-title="Dispo Call URL"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="dispo_call_url"
                    onChange={this.handleChange("dispo_call_url")}
                    label="Dispo Call URL"
                    value={dispo_call_url}
                    margin="normal"
                    fullWidth
                  />
                </div>

                <div
                  className="col-md-12"
                  data-info="This web URL address is not seen by the agent, but if it is populated it is called every time a call that is not handled by an agent is hung up or transferred."
                  data-title="No Agent Call URLL"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="na_call_url"
                    onChange={this.handleChange("na_call_url")}
                    label="No Agent Call URL"
                    value={na_call_url}
                    margin="normal"
                    fullWidth
                  />
                </div>

                <div
                  className="col-md-12"
                  data-info="If enabled, the calls coming in from this in-group will have a space and the phone extension of the agent appended to the end of the CallerID name for the call before it is sent to the agent.."
                  data-title="Extension Append CID"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <p className="MuiFormHelperText-root-253">
                    {" "}
                    Extension Append CID {extension_appended_cidname}
                  </p>
                  <div className="row">
                    <Switch
                      label="Extension Append CID"
                      value={extension_appended_cidname}
                      onChange={this.handleActiveextensionChange}
                      checked={extension_appended_cidname == "Y" ? true : false}
                      label="Ignore List Script Override"
                      color="primary"
                    />
                  </div>
                </div>
              </form>
            </CardBox>
            <div className="col-lg-4" style={{ display: "grid" }}>
              <div className="jr-card ">
                <div className="jr-card-body ">
                  <div className="col-md-12 col-12 mt-12">
                    <div>
                      <div className="card-body">
                        <h3 className="card-title">
                          {this.state.showinfotitle != ""
                            ? this.state.showinfotitle
                            : "title"}
                        </h3>
                        <p className="card-text">{this.state.showinfo} </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {this.props.Global.isLoading && (
            <div className="loader-view" id="loader-view">
              <CircularProgress />
            </div>
          )}
        </div>
      );
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    Global: state.globel
  };
}

const mapDispatchToProps = {
  fetchGlobal
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(EditScript)
);
