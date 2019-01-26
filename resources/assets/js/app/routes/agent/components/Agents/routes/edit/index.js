import React, { Component } from "react";
import { UncontrolledAlert, Alert } from "reactstrap";
import SweetAlert from "react-bootstrap-sweetalert";
import CircularProgress from "@material-ui/core/CircularProgress";
import Paper from "@material-ui/core/Paper";
import Switch from "@material-ui/core/Switch";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import ContainerHeader from "../../../../../../../components/ContainerHeader/index";
import CardBox from "../../../../../../../components/CardBox/index";
import CustomPicker from "../../../../../../../components/pickers/routes/Color/customPicker";
import IntlMessages from "../../../../../../../util/IntlMessages";
import VoicemailPopUp from "../../../../../../../components/VoicemailPopUp/VoicemailPopUp";
import { fetchAgent, updateRecord } from "../../../../actions/";
import { fetchGlobal } from "../../../../../../../actions/Global";
import { StickyContainer, Sticky } from "react-sticky";
import { mail_data, style_header } from "./data";
import axios from "axios";
import { connect } from "react-redux";
import ButtonNav from "../../../../../../../components/navButton/";

class Edit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pageTitle: this.props.location.pathname.split("/")[4],
      agentId:
        this.props.location.pathname.split("/")[4] == "add"
          ? ""
          : this.props.location.pathname.split("/").pop(),
      showinfo: "Hover to the input on left and help text will come up here :)",
      showinfotitle: "Help Block",
      agent: this.props.location.pathname.split("/")[4],
      agentIdError: "",
      pageError: "",
      user: "",
      agentfullname: "",
      password: "",
      usergroup: "",
      selectedValue: mail_data[1].mailboxes,
      voicemail: "",
      data: [],
      voicemailData: [],
      viciPhoneList: [],
      open: false,
      is_change: false,
      agentemail: "",
      showAlert: false,
      alertContent: "",
      agentnameError: false,
      alertTitle: "",
      manual_dial_cid: "",
      agents_group: [],
      agentpasswordError: false,
      enableAgentActive: true,
      enableAgentActiveValue: "Y",
      enableAgentqueueActive: true,
      enableAgentqueueActiveValue: "Y",
      enableAgentmdActive: true,
      enableAgentmdActiveValue: "Y",
      enableAgentcbActive: true,
      enableAgentcbActiveValue: "Y",
      enableAgentobActive: true,
      enableAgentobActiveValue: "Y"
    };
  }

  componentDidMount() {
    this.props.fetchGlobal(["camp", "agentgroup"]);
    this.props.fetchAgent(this.state.agentId);
  }

  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      alertTitle: nextPropsFromRedux.Agent.alertMessageTitle,
      showAlert: nextPropsFromRedux.Agent.showMessage,
      alertContent: nextPropsFromRedux.Agent.alertMessage,
      data: nextPropsFromRedux.Agent.data,
      enableAgentActive:
        nextPropsFromRedux.Agent.data.user_info &&
        nextPropsFromRedux.Agent.data.user_info.active == "N"
          ? false
          : true,
      enableAgentActiveValue: nextPropsFromRedux.Agent.data.user_info
        ? nextPropsFromRedux.Agent.data.user_info.active
        : "Y",
      enableAgentobActive:
        nextPropsFromRedux.Agent.data.user_info &&
        nextPropsFromRedux.Agent.data.user_info.closer_default_blended === "0"
          ? false
          : true,
      enableAgentobActiveValue:
        nextPropsFromRedux.Agent.data.user_info &&
        nextPropsFromRedux.Agent.data.user_info.closer_default_blended === "0"
          ? "N"
          : "Y",
      enableAgentqueueActive:
        nextPropsFromRedux.Agent.data.user_info &&
        nextPropsFromRedux.Agent.data.user_info.agent_choose_ingroups === "0"
          ? false
          : true,
      enableAgentqueueActiveValue:
        nextPropsFromRedux.Agent.data.user_info &&
        nextPropsFromRedux.Agent.data.user_info.agent_choose_ingroups === "0"
          ? "N"
          : "Y",
      enableAgentmdActive:
        nextPropsFromRedux.Agent.data.user_info &&
        nextPropsFromRedux.Agent.data.user_info.agentcall_manual === "0"
          ? false
          : true,
      enableAgentmdActiveValue:
        nextPropsFromRedux.Agent.data.user_info &&
        nextPropsFromRedux.Agent.data.user_info.agentcall_manual === "0"
          ? "N"
          : "Y",
      enableAgentcbActive:
        nextPropsFromRedux.Agent.data.user_info &&
        nextPropsFromRedux.Agent.data.user_info.agentonly_callbacks === "0"
          ? false
          : true,
      enableAgentcbActiveValue:
        nextPropsFromRedux.Agent.data.user_info &&
        nextPropsFromRedux.Agent.data.user_info.agentonly_callbacks === "0"
          ? "N"
          : "Y",
      voicemailData:
        nextPropsFromRedux.Agent.data.voicemail &&
        nextPropsFromRedux.Agent.data.voicemail != ""
          ? nextPropsFromRedux.Agent.data.voicemail
          : [],
      viciPhoneListData:
        nextPropsFromRedux.Agent.data.viciPhoneList &&
        nextPropsFromRedux.Agent.data.viciPhoneList != ""
          ? nextPropsFromRedux.Agent.data.viciPhoneList
          : [],
      agentemail:
        nextPropsFromRedux.Agent.data.user_info &&
        nextPropsFromRedux.Agent.data.user_info.email != ""
          ? nextPropsFromRedux.Agent.data.user_info.email
          : "",
      user:
        nextPropsFromRedux.Agent.data.user_info &&
        nextPropsFromRedux.Agent.data.user_info.user != ""
          ? nextPropsFromRedux.Agent.data.user_info.user
          : "",
      agentfullname:
        nextPropsFromRedux.Agent.data.user_info &&
        nextPropsFromRedux.Agent.data.user_info.full_name != ""
          ? nextPropsFromRedux.Agent.data.user_info.full_name
          : "",
      password:
        nextPropsFromRedux.Agent.data.user_info &&
        nextPropsFromRedux.Agent.data.user_info.pass != ""
          ? nextPropsFromRedux.Agent.data.user_info.pass
          : "",
      manual_dial_cid:
        nextPropsFromRedux.Agent.data.manual_dial_cid &&
        nextPropsFromRedux.Agent.data.user_info.manual_dial_cid != ""
          ? nextPropsFromRedux.Agent.data.user_info.manual_dial_cid
          : "",
      voicemail:
        nextPropsFromRedux.Agent.data.user_info &&
        nextPropsFromRedux.Agent.data.user_info.voicemail_id != ""
          ? nextPropsFromRedux.Agent.data.user_info.voicemail_id
          : "",
      usergroup:
        nextPropsFromRedux.Agent.data.user_info &&
        nextPropsFromRedux.Agent.data.user_info.user_group != ""
          ? nextPropsFromRedux.Agent.data.user_info.user_group
          : "",
      agents_group: nextPropsFromRedux.Global.agentgroup
        ? nextPropsFromRedux.Global.agentgroup
        : ""
    });
  }

  handleShowAlert = flag => {
    this.setState({ showAlert: flag });
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value, is_change: true });
  };

  handleRequestClose = value => {
    this.setState({ voicemail: value, open: false });
  };

  handleActiveChange = (event, checked) => {
    this.setState({ enableAgentActive: checked });
    this.setState({
      enableAgentActiveValue: checked ? "Y" : "N",
      is_change: true
    });
  };

  handleActivequeueChange = (event, checked) => {
    this.setState({ enableAgentqueueActive: checked });
    this.setState({
      enableAgentqueueActiveValue: checked ? "Y" : "N",
      is_change: true
    });
  };

  handleActivecbChange = (event, checked) => {
    this.setState({ enableAgentcbActive: checked });
    this.setState({
      enableAgentcbActiveValue: checked ? "Y" : "N",
      is_change: true
    });
  };

  handleActiveobChange = (event, checked) => {
    this.setState({ enableAgentobActive: checked });
    this.setState({
      enableAgentobActiveValue: checked ? "Y" : "N",
      is_change: true
    });
  };

  handleActivemdChange = (event, checked) => {
    this.setState({ enableAgentmdActive: checked });
    this.setState({
      enableAgentmdActiveValue: checked ? "Y" : "N",
      is_change: true
    });
  };

  logMouseEnter = e => {
    if (e.target.getAttribute("data-info")) {
      this.setState({ showinfo: e.target.getAttribute("data-info") }),
        this.setState({ showinfotitle: e.target.getAttribute("data-title") });
    }
  };

  logMouseLeave = e => {
    if (e) {
    }
  };

  onCancelAlert = () => {
    this.setState({ showAlert: false });
  };

  //handleSubmit1 = () => { alert('work')}

  handleSubmit = () => {
    let agentId = this.state.agentId;
    let agentName = this.state.agenttName;
    let user = this.state.user;
    let agentfullname = this.state.agentfullname;
    let password = this.state.password;
    let usergroup = this.state.usergroup;
    let voicemail = this.state.voicemail;
    let agentemail = this.state.agentemail;
    let manual_dial_cid = this.state.manual_dial_cid;

    let error = false;
    agentfullname == ""
      ? (this.setState({ agentnameError: true }), (error = true))
      : this.setState({ agentnameError: false });
    password == ""
      ? (this.setState({ agentpasswordError: true }), (error = true))
      : this.setState({ agentpasswordError: false });

    if (!error) {
      let postData = {
        user_id: agentId,
        full_name: agentfullname,
        name: user,
        user_group: usergroup,
        pass: password,
        agentName: agentfullname,
        voicemail_id: voicemail,
        email: agentemail,
        manual_dial_cid: manual_dial_cid,
        active: this.state.enableAgentActiveValue,
        agent_choose_ingroups: this.state.enableAgentqueueActiveValue,
        agentcall_manual: this.state.enableAgentmdActiveValue,
        agentonly_callbacks: this.state.enableAgentcbActiveValue,
        closer_default_blended: this.state.enableAgentobActiveValue
      };

      this.props.updateRecord(postData);
      //console.log("GOOD")
      console.log(postData);
      let _this = this;
    }
  };

  render() {
    const {
      showAlert,
      alertTitle,
      alertContent,
      pageTitle,
      voicemailData,
      viciPhoneListData,
      pageError,
      agentId,
      agentName,
      password,
      agentfullname,
      usergroup,
      agentemail,
      agentIdError,
      agentpasswordError,
      agentnameError,
      enableAgentobActive,
      enableAgentobActiveValue,
      enableAgentActive,
      enableAgentActiveValue,
      data,
      manual_dial_cid,
      agents_group,
      enableAgentqueueActive,
      user,
      enableAgentqueueActiveValue,
      enableAgentmdActive,
      enableAgentmdActiveValue,
      enableAgentcbActive,
      enableAgentcbActiveValue
    } = this.state;

    const { user_info, admin_user_group_list, viciPhoneList, voicemail } = data;

    if (enableAgentobActive) {
      console.log("++++++++++++++++++++++++");
      console.log(voicemailData);
    } else {
      console.log("----------------------------");
      console.log(voicemailData);
    }

    if (pageTitle == "edit" && pageError) {
      return (
        <div>
          <ContainerHeader
            match={this.props.match}
            title={pageTitle + " agent"}
          />

          <Alert className="shadow-lg" color="danger">
            <h3 className="alert-heading">Agent Not Found</h3>
            <p>We can not locate your Agent, please check your id.</p>
          </Alert>
        </div>
      );
    } else {
      return (
        <div>
          <ContainerHeader
            match={this.props.match}
            title={pageTitle + " Agent : " + user}
            style={{ marginBottom: "8px" }}
          />

          {this.state.is_change && <ButtonNav click={this.handleSubmit} />}

          <SweetAlert
            show={showAlert}
            success={alertTitle === "Success" ? true : false}
            error={alertTitle === "Error" ? true : false}
            title={alertTitle}
            onConfirm={this.onCancelAlert}
            onCancel={this.onCancelAlert}
          >
            {" "}
            {alertContent}{" "}
          </SweetAlert>
          <div className="row">
            <CardBox styleName="col-lg-8">
              <form className="row" noValidate autoComplete="off">
                <div className="sub_menu_div" style={style_header}>
                  {" "}
                  <i className="fa fa-bars" style={{ marginRight: "10px" }} />
                  Agent
                </div>
                <div
                  className="col-md-6 col-6"
                  data-info="Your agent's login.This field is where you put the Agent ID number, can be up to 8 digits in length, Must be at least 2 characters in length."
                  data-title="Agent ID"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="agent-id"
                    onChange={this.handleChange("agentId")}
                    label="Agent ID *"
                    value={user}
                    disabled={pageTitle == "add" ? false : true}
                    margin="normal"
                    fullWidth
                  />
                </div>
                <div className="col-md-12">
                  <p className="MuiFormHelperText-root-253"> Enable </p>
                  <div
                    className="row"
                    data-info="To enable or disable the agent."
                    data-title="Enable"
                    onMouseEnter={this.logMouseEnter}
                    onMouseLeave={this.logMouseLeave}
                  >
                    <Switch
                      label="Enable"
                      onChange={this.handleActiveChange}
                      color="primary"
                      checked={enableAgentActive}
                      value={enableAgentActiveValue}
                    />{" "}
                  </div>
                </div>

                <div
                  className="col-md-12 col-6"
                  data-info="The password agent uses to login to Ytel.This field is where you put the users password. Must be at least 2 characters in length. A strong user password should be at least 8 characters in length and have lower case and upper case letters as well as at least one number."
                  data-title="Password"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="agent-password-id"
                    label="Password *"
                    margin="normal"
                    fullWidth
                    value={password}
                    onChange={this.handleChange("password")}
                    error={agentpasswordError}
                  />
                </div>
                <div
                  className="col-md-12 col-6"
                  data-info=" Your Inbound Group ID
                                                  This is name of Inbound Group, must be between 2 and 20 characters in length. "
                  data-title="Agent Name "
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="agent-fullname-id"
                    label="Agent name *"
                    margin="normal"
                    fullWidth
                    value={agentfullname}
                    error={agentnameError}
                    onChange={this.handleChange("agentfullname")}
                  />


                </div>

                <div
                  className="col-md-12"
                  data-info=" This menu is where you select the users group that this user will belong to."
                  data-title="User Group"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <div className="form-group">
                    <TextField
                      id="agent-user-group-native"
                      select
                      label="User Group"
                      helperText="Please select your User Group"
                      margin="normal"
                      tabIndex="-1"
                      value={usergroup}
                      onChange={this.handleChange("usergroup")}
                      fullWidth
                    >
                      {agents_group &&
                        agents_group.map(option => (
                          <option
                            key={option.user_group}
                            value={option.user_group}
                          >
                            {option.group_name}
                          </option>
                        ))}
                    </TextField>
                  </div>
                </div>

                <div className="col-md-12">
                  <p className="MuiFormHelperText-root-253"> Outbound </p>
                  <div
                    className="row"
                    data-info="This option simply allows an agent to take part in a campaigns outbound auto-dialing efforts. If ON it allows the agent to be included in the outbound auto-dialing algorithms for applicable campaigns and receive outbound calls from the campaigns calling efforts.If OFF it simply removes the outbound auto-dialing portion of the agents feature set. They will still be able to log into outbound auto-dialing campaigns but will not receive any outbound auto-dialing calls.This does not effect the ability to take inbound or place manual dial calls from a campaign.."
                    data-title="Outbound"
                    onMouseEnter={this.logMouseEnter}
                    onMouseLeave={this.logMouseLeave}
                  >
                    <Switch
                      label="Outbound "
                      onChange={this.handleActiveChange}
                      color="primary"
                      onChange={this.handleActiveobChange}
                      checked={enableAgentobActive}
                      value={enableAgentobActiveValue}
                    />
                  </div>
                </div>

                <div className="sub_menu_div" style={style_header}>
                  {" "}
                  <i className="fa fa-bars" style={{ marginRight: "10px" }} />
                  Other Settings
                </div>
                <div className="col-md-12">
                  <p className="MuiFormHelperText-root-253">
                    {" "}
                    Agent Choose Queues{" "}
                  </p>
                  <div
                    className="row"
                    data-info="Default is &quot;Off&quot; for manager assignments to be in effect.If this is set to &quot;ON&quot; the agents will have the ability on Log in to choose the queues they wish to take calls from."
                    data-title="Agent Choose Queues"
                    onMouseEnter={this.logMouseEnter}
                    onMouseLeave={this.logMouseLeave}
                  >
                    <Switch
                      label="Agent Choose Queues "
                      onChange={this.handleActivequeueChange}
                      color="primary"
                      checked={enableAgentqueueActive}
                      value={enableAgentqueueActiveValue}
                    />
                  </div>
                </div>
                <div className="col-md-12">
                  <p className="MuiFormHelperText-root-253"> Manual Dial </p>
                  <div className="row">
                    <Switch
                      label="Manual Dial"
                      onChange={this.handleActivemdChange}
                      color="primary"
                      checked={enableAgentmdActive}
                      value={enableAgentmdActiveValue}
                    />
                  </div>
                </div>

                <div
                  className="col-md-12 col-6"
                  data-info="The password agent uses to login to Ytel.This field is where you put the users password. Must be at least 2 characters in length. A strong user password should be at least 8 characters in length and have lower case and upper case letters as well as at least one number."
                  data-title="Password"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="agent-manual_dial_cid-id"
                    label="manual dial cid *"
                    margin="normal"
                    fullWidth
                    value={manual_dial_cid}
                    onChange={this.handleChange("manual_dial_cid")}
                  />
                </div>
                <div className="col-md-12">
                  <p className="MuiFormHelperText-root-253">
                    {" "}
                    Agent Only Call Back{" "}
                  </p>
                  <div
                    className="row"
                    data-info="This option allows an agent to set a callback so that they are the only Agent that can call the customer back."
                    data-title="Agent Only Call Back"
                    onMouseEnter={this.logMouseEnter}
                    onMouseLeave={this.logMouseLeave}
                  >
                    <Switch
                      label="Agent Only Call Back  "
                      onChange={this.handleActivecbChange}
                      checked={enableAgentcbActive}
                      color="primary"
                      value={enableAgentcbActiveValue}
                    />
                  </div>
                </div>

                <div
                  className="col-md-12"
                  data-info="If defined, calls that would normally DROP would instead be directed to this voicemail box to hear and leave a message."
                  data-title="Voicemail"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
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
                      users={voicemailData}
                      listdata={viciPhoneListData}
                      selectedValue={this.state.selectedValue}
                      open={this.state.open}
                      onClose={this.handleRequestClose.bind(this)}
                    />
                  </div>
                </div>

                <div
                  className="col-md-12   col-6"
                  data-info="These are optional fields."
                  data-title="Email"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="email-agentemail-id"
                    label="Email "
                    margin="normal"
                    fullWidth
                    value={agentemail}
                    onChange={this.handleChange("agentemail")}
                  />
                </div>
              </form>
            </CardBox>
            <div className="col-lg-4" style={{ display: "grid" }}>
              <div className="jr-card ">
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
            {this.props.Agent.isLoading && (
              <div
                className="loader-view"
                style={{
                  left: "0",
                  bottom: "0",
                  right: "0",
                  top: "0",
                  position: "fixed"
                }}
              >
                <CircularProgress />
              </div>
            )}
          </div>
        </div>
      );
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    Agent: state.agent,
    Global: state.globel
  };
}

const mapDispatchToProps = {
  fetchAgent,
  updateRecord,
  fetchGlobal
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Edit);
