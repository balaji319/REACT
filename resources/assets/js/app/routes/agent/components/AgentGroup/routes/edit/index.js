import React, { Component } from "react";
import { UncontrolledAlert, Alert } from "reactstrap";
import SweetAlert from "react-bootstrap-sweetalert";
import CircularProgress from "@material-ui/core/CircularProgress";
import UserGroupMultipeDropdown from "../../../../../../../components/common/UserGroupMultipeDropdown";
import Paper from "@material-ui/core/Paper";
import Switch from "@material-ui/core/Switch";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import ContainerHeader from "../../../../../../../components/ContainerHeader/index";
import CardBox from "../../../../../../../components/CardBox/index";
import CustomPicker from "../../../../../../../components/pickers/routes/Color/customPicker";
import IntlMessages from "../../../../../../../util/IntlMessages";
import { fetchAgentGroup, updateRecord } from "../../../../actions/";
import {
  fource_time_check_login,
  mail_data,
  shift_enforcement_var,
  campaigns
} from "./data";
import MultipeDropdownCampaigns from "../../../../../../../components/common/MultipeDropdownCampaigns";
import MultipeDropdownUsers from "../../../../../../../components/common/MultipeDropdownUsers";
import MultipeDropdown from "../../../../../../../components/common/MultipeDropdown";
import MultipleSelect from "../../../../../../../components/common/MultipleSelect";
import ButtonNav from "../../../../../../../components/navButton/";
import { fetchGlobal } from "../../../../../../../actions/Global";
import { createNotification } from "../../../../../../../Helpers";
import axios from "axios";
import { connect } from "react-redux";

class Edit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pageTitle: this.props.location.pathname.split("/")[4],
      agentGroupId:
        this.props.location.pathname.split("/")[4] == "add"
          ? ""
          : this.props.location.pathname.split("/").pop(),
      showinfo: "Hover to the input on left and help text will come up here :)",
      showinfotitle: "Help Block",
      agentGroupName: "",
      agentGroupDescription: "",
      agentGroupFTCL: "",
      agentAllowC: [],
      user_group_records: [],
      user_cam_records: [],
      agentStateViewG: "",
      userGroups: [],
      enableAgentStatusVT: true,
      enableAgentStatusVTValue: "Y",
      enableAgentStatusCLT: true,
      enableAgentStatusCLTValue: "Y",
      agentGroupDescriptionError: "",
      agentShiftE: "",
      pageError: "",
      is_change: false,
      showAlert: false,
      alertContent: "",
      agentnameError: false,
      alertTitle: "",
      group_info: [],
      campaignsGroups: ""
    };
  }

  componentDidMount() {
    this.props.fetchAgentGroup(this.state.agentGroupId);

    this.props.fetchGlobal(["cam", "agentgroup"]);
  }

  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      alertTitle: nextPropsFromRedux.Agent.alertMessageTitle,
      showAlert: nextPropsFromRedux.Agent.showMessage,
      alertContent: nextPropsFromRedux.Agent.alertMessage,
      group_info: nextPropsFromRedux.Agent.record_data.group_info,
      agentGroupDescription: nextPropsFromRedux.Agent.record_data.group_info
        ? nextPropsFromRedux.Agent.record_data.group_info.group_name
        : "",
      agentGroupFTCL: nextPropsFromRedux.Agent.record_data.group_info
        ? nextPropsFromRedux.Agent.record_data.group_info.forced_timeclock_login
        : "",
      enableAgentStatusVTValue: nextPropsFromRedux.Agent.record_data.group_info
        ? nextPropsFromRedux.Agent.record_data.group_info.agent_status_view_time
        : "",
      enableAgentStatusCLTValue: nextPropsFromRedux.Agent.record_data.group_info
        ? nextPropsFromRedux.Agent.record_data.group_info.agent_call_log_view
        : "",
      enableAgentStatusCLT:
        nextPropsFromRedux.Agent.record_data.group_info &&
        nextPropsFromRedux.Agent.record_data.group_info.agent_call_log_view ===
          "N"
          ? false
          : true,
      enableAgentStatusVT:
        nextPropsFromRedux.Agent.record_data.group_info &&
        nextPropsFromRedux.Agent.record_data.group_info
          .agent_status_view_time === "N"
          ? false
          : true,
      agentShiftE: nextPropsFromRedux.Agent.record_data.group_info
        ? nextPropsFromRedux.Agent.record_data.group_info.shift_enforcement
        : "",
      user_group_records: nextPropsFromRedux.Global.agentgroup
        ? nextPropsFromRedux.Global.agentgroup
        : [],
      user_cam_records: nextPropsFromRedux.Global.campaigns
        ? nextPropsFromRedux.Global.campaigns
        : [],
      agentStateViewG: nextPropsFromRedux.Agent.record_data.group_info
        ? nextPropsFromRedux.Agent.record_data.group_info
            .agent_status_viewable_groups
        : "",
      campaignsGroups: nextPropsFromRedux.Agent.record_data.group_info
        ? nextPropsFromRedux.Agent.record_data.group_info.allowed_campaigns
        : ""
    });

    //this.state.user_cam_records.unshift("-");

    //this.state.showMessage ?  this.setState({is_change:false})  : '' ;
  }

  setSelectOptions = (name, value) => {
    this.setState({
      [name]: value
    });
  };
  handleShowAlert = flag => {
    this.setState({ showAlert: flag });
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value, is_change: true });
  };

  handleRequestClose = value => {
    this.setState({ voicemail: value, open: false });
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

  handleActiveSVTChange = (event, checked) => {
    this.setState({ enableAgentStatusVT: checked });
    this.setState({
      enableAgentStatusVTValue: checked ? "Y" : "N",
      is_change: true
    });
  };

  handleActiveCLVChange = (event, checked) => {
    this.setState({ enableAgentStatusCLT: checked });
    this.setState({
      enableAgentStatusCLTValue: checked ? "Y" : "N",
      is_change: true
    });
  };

  onCancelAlert = () => {
    this.setState({ showAlert: false });
  };

  submitDataHandler = postData => {
    if (postData) {
      axios
        .post("/api/agentgroup-edit", postData)
        .then(response => {
          createNotification("Success", "Success", response.data.msg);
          this.props.history.goBack();
        })
        .catch(error => {
          //let flag = 0;
          createNotification("Error", "Error", error.response.data.msg);
          //this.setState({error_msg_user:error.response.data.msg.user_group,error_msg:true,error_msg_pass:error.response.data.msg.pass})
        });
    }
  };

  handleSubmit = () => {
    let agentGroupId = this.state.agentGroupId;
    let agentName = this.state.agentGroupDescription;
    let agentGroupFTCL = this.state.agentGroupFTCL;

    let agentAllowC = this.state.agentAllowC;
    let agentStateViewG = this.state.agentStateViewG;
    let voicemail = this.state.voicemail;
    let agentemail = this.state.agentemail;

    let error = false;
    agentName == ""
      ? (this.setState({ agentnameError: true }), (error = true))
      : this.setState({ agentnameError: false });
    //password=='' ? (this.setState({agentpasswordError: true}) ,error=true): this.setState({agentpasswordError: false});

    if (!error) {
      let postData = {
        user_group: agentGroupId,
        group_name: agentName,
        forced_timeclock_login: agentGroupFTCL,
        allowed_campaigns: agentAllowC,
        agent_status_viewable_groups: agentStateViewG,
        agent_status_view_time: this.state.enableAgentStatusVTValue,
        shift_enforcement: this.state.agentShiftE,
        agent_call_log_view: this.state.enableAgentStatusCLTValue,
        group_shifts: ""
        //'group_shifts':this.state.enableAgentmdActiveValue,
      };

      this.submitDataHandler(postData);
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
      userGroups,
      pageError,
      agentGroupId,
      agentGroupIdError,
      agentpasswordError,
      agentnameError,
      agentGroupName,
      agentGroupDescription,
      agentGroupFTCL,
      agentAllowC,
      agentStateViewG,
      enableAgentStatusVT,
      enableAgentStatusVTValue,
      enableAgentStatusCLT,
      enableAgentStatusCLTValue,
      agentGroupDescriptionError,
      agentShiftE,
      group_info,
      user_cam_records,
      user_group_records
    } = this.state;
    const campaignList = user_cam_records;
    const groupList = user_group_records;

    if (enableAgentStatusVT) {
      console.log("@@@@@@@@@@@@@@@@@@@@@@@@@");
      console.log(enableAgentStatusVTValue);
    } else {
      console.log("-@@@@@@@@@@@@@@@@@@@@@@@@@");
      console.log(enableAgentStatusVTValue);
    }
    const campaignsGroups =
      this.state.campaignsGroups != "" && campaignsGroups != null
        ? this.state.campaignsGroups.split(" ")
        : [];
    const userGroupsList =
      this.state.agentStateViewG != "" && agentStateViewG != null
        ? this.state.agentStateViewG.split(" ")
        : [];
    console.log("==============");
    console.log(campaignsGroups);

    console.log("==============");
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
            title={pageTitle + " Group"}
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
            <CardBox
              styleName="col-lg-8"
              heading={pageTitle == "add" ? "Add new Group" : agentGroupId}
            >
              <form className="row" noValidate autoComplete="off">
                <div className="col-md-6 col-6">
                  <TextField
                    id="agent-id"
                    onChange={this.handleChange("agentGroupId")}
                    label="Agent ID *"
                    value={agentGroupId}
                    disabled={pageTitle == "add" ? false : true}
                    margin="normal"
                    fullWidth
                  />
                </div>

                <div
                  className="col-md-12   col-6"
                  data-info=" This is the description of the User Group must be between 2-40 character in a length.. "
                  data-title="Description"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="agent-password-id"
                    label="Description "
                    margin="normal"
                    fullWidth
                    value={agentGroupDescription}
                    onChange={this.handleChange("agentGroupDescription")}
                  />
                </div>
                <div className="col-md-12">
                  <div
                    className="form-group"
                    data-info="This option allows you to not let an agent log in to the agent interface if they have not logged into the time clock."
                    data-title="Force Time Clock Login"
                    onMouseEnter={this.logMouseEnter}
                    onMouseLeave={this.logMouseLeave}
                  >
                    <TextField
                      id="agent-group-ftcl-native"
                      select
                      label="Force Time Clock Login"
                      helperText="Force Time Clock Login"
                      margin="normal"
                      tabIndex="-1"
                      value={agentGroupFTCL}
                      onChange={this.handleChange("agentGroupFTCL")}
                      fullWidth
                    >
                      {fource_time_check_login.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </TextField>
                  </div>
                </div>

                {/* <div className="col-md-12">

                                               <div className="form-group" data-info='This is a selectable list of User Groups and user functions to which members of this user group can view the status of as well as transfer calls to inside of the agent screen. The ALL-GROUPS option allows the users in this group to see and transfer calls to any user on the system. The CAMPAIGN-AGENTS option allows users in this group to see and transfer calls to any user in the campaign that they are logged into.The NOT-LOGGED-IN-AGENTS option allows all users in the system to be displayed, even if they are not logged-in curently.'  data-title='Agent Status Viewable Groups'   onMouseEnter={this.logMouseEnter} onMouseLeave={this.logMouseLeave}>
                                                  <MultipeDropdownUsers
                                                      label={"Agent Status Viewable Groups"}
                                                      options={groupList}
                                                      onChange={this.setSelectOptions}
                                                      name={'agentStateViewG'}
                                                      selectedValue={userGroupsList}
                                                  />

                                               </div>
                                               </div> */}

                {/* <div className="col-md-12">
                  <MultipeDropdownCampaigns
                    label={"Campaigns Groups"}
                    options={campaignList}
                    onChange={this.setSelectOptions}
                    name={"agentAllowC"}
                    selectedValue={campaignsGroups}
                  />
                </div> */}
                {/* <div className="col-md-12">
                  <div
                    className="form-group"
                    data-info="This option allows you to not let an agent log in to the agent interface if they have not logged into the time clock."
                    data-title="Campaigns Groups"
                    onMouseEnter={this.logMouseEnter}
                    onMouseLeave={this.logMouseLeave}
                  >
                    <TextField
                      id="agent-group-ftcl-nativeCampaigns Groups"
                      select
                      label="Campaigns Groups"
                      helperText="Campaigns Groups"
                      margin="normal"
                      tabIndex="-1"
                      value={campaignsGroups}
                      onChange={this.handleChange("campaignsGroups")}
                      fullWidth
                    >
                      {campaignList && campaignList.map((option,i) => (
                        <option key={i} value={option.campaign_id}>
                          {option.campaign_name}
                        </option>
                      ))}
                    </TextField>
                  </div>
                </div> */}
                <div className="col-md-12">
                  <p className="MuiFormHelperText-root-253">
                    {" "}
                    Agent Status View Time
                  </p>
                  <div
                    className="row"
                    data-info="This is a selectable list of Campaigns to which members of this user group can log in to."
                    data-title="Agent Status View Time"
                    onMouseEnter={this.logMouseEnter}
                    onMouseLeave={this.logMouseLeave}
                  >
                    <Switch
                      label="Agent Status View Time"
                      onChange={this.handleActiveSVTChange}
                      color="primary"
                      checked={enableAgentStatusVT}
                      value={enableAgentStatusVTValue}
                    />
                  </div>
                </div>

                <div className="col-md-12">
                  <p className="MuiFormHelperText-root-253">
                    {" "}
                    Agent Call Log View
                  </p>
                  <div
                    className="row"
                    data-info="This is a selectable list of Campaigns to which members of this user group can log in to."
                    data-title="Agent Call Log View"
                    onMouseEnter={this.logMouseEnter}
                    onMouseLeave={this.logMouseLeave}
                  >
                    <Switch
                      label="Agent Only Call Back  "
                      onChange={this.handleActiveCLVChange}
                      checked={enableAgentStatusCLT}
                      color="primary"
                      value={enableAgentStatusCLTValue}
                    />
                  </div>
                </div>

                <div
                  className="col-md-12"
                  data-info="This setting allows you to restrict agent logins based upon the shifts that are selected below. OFF will not enforce shifts at all. START will only enforce the login time but will not affect an agent that is running over their shift time if they are already logged in. ALL will enforce shift start time and will log an agent out after they run over the end of their shift time. Default is OFF."
                  data-title="Shift Enforcement"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <div className="form-group">
                    <TextField
                      id="agent-group-shift-enforcement-native"
                      select
                      label="Shift Enforcement"
                      helperText="Please select your Shift Enforcement"
                      margin="normal"
                      tabIndex="-1"
                      value={agentShiftE}
                      onChange={this.handleChange("agentShiftE")}
                      fullWidth
                    >
                      {shift_enforcement_var.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </TextField>
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
  console.log(state);

  return {
    Agent: state.agent,
    Global: state.globel
  };
}

const mapDispatchToProps = {
  fetchAgentGroup,
  updateRecord,
  fetchGlobal
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Edit);
