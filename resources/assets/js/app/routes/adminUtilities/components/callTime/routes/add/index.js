import React, { Component } from "react";
import { UncontrolledAlert, Alert } from "reactstrap";
import SweetAlert from "react-bootstrap-sweetalert";
import CircularProgress from "@material-ui/core/CircularProgress";
import Paper from "@material-ui/core/Paper";
import Switch from "@material-ui/core/Switch";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import ContainerHeader from "../../../../../../../components/ContainerHeader/index";
import CardBox from "../../../../../../../components/CardBox/index";
import CustomPicker from "../../../../../../../components/pickers/routes/Color/customPicker";
import IntlMessages from "../../../../../../../util/IntlMessages";
import VoicemailPopUp from "../../../../../../../components/VoicemailPopUp/VoicemailPopUp";
import { addcalltime } from "../../../../actions/";
import { agents_group } from "./data";
import axios from "axios";
import { connect } from "react-redux";

class ADD extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pageTitle: this.props.location.pathname.split("/")[4],
      callId:
        this.props.location.pathname.split("/")[4] == "add"
          ? ""
          : this.props.location.pathname.split("/").pop(),
      showinfo: "Hover to the input on left and help text will come up here :)",
      showinfotitle: "Help Block",
      pageError: "",
      is_change: false,
      showAlert: false,
      alertContent: "",
      alertTitle: "",
      calltimename: "",
      calltimecomment: "",
      usergroup: "",
      callIdError: false,
      calltimenameError: false
    };
  }

  componentDidMount() {}

  componentWillReceiveProps(nextPropsFromRedux) {
    let call_time_id = this.state.callId;
    if (nextPropsFromRedux.Agent.addsucsess && call_time_id != "") {
      this.props.history.push("edit/" + call_time_id);
    }
  }

  handleShowAlert = flag => {
    this.setState({ showAlert: flag });
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value, is_change: true });
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

  handleSubmit = () => {
    let call_time_id = this.state.callId;
    let call_time_name = this.state.calltimename;
    let call_time_comments = this.state.calltimecomment;
    let usergroup = this.state.usergroup;
    let ct_default_start = "900";
    let ct_default_stop = "2100";

    let type = this.state.pageTitle == "add" ? "add" : "edit";

    let error = false;

    call_time_id == ""
      ? (this.setState({ callIdError: true }), (error = true))
      : this.setState({ callIdError: false });
    call_time_name == ""
      ? (this.setState({ calltimenameError: true }), (error = true))
      : this.setState({ calltimenameError: false });

    if (!error) {
      let postData = {
        call_time_id: call_time_id,
        call_time_name: call_time_name,
        call_time_comments: call_time_comments,
        usergroup: usergroup,
        ct_default_start: ct_default_start,
        ct_default_stop: ct_default_stop,
        type: type
      };

      this.props.addcalltime(postData);

      /*      this.props.updateRecord(postData);
             console.log(postData)
            let _this=this;*/
    }
  };

  render() {
    const {
      showAlert,
      alertTitle,
      alertContent,
      pageTitle,
      pageError,
      callId,
      calltimename,
      calltimecomment,
      usergroup,
      callIdError,
      calltimenameError
    } = this.state;
    //console.log(JSON.stringify(this.state.week_checked));

    if (pageTitle == "edit" && pageError) {
      return (
        <div>
          <ContainerHeader
            match={this.props.match}
            title={"Add New Call Time"}
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
            title={"Add New Call Time"}
            style={{ marginBottom: "8px" }}
          />
          {this.state.is_change ? (
            <div className="col-lg-12" style={{ padding: "0px" }}>
              <div
                className="jr-card "
                style={{
                  padding: "2px",
                  textAlign: "right",
                  marginBottom: "14px"
                }}
              >
                <div className="jr-card-body ">
                  <div className="cardPanel teal">
                    <span className="whiteText">
                      <Button
                        color="primary"
                        className="jr-btn bg-success text-white"
                        style={{ marginBottom: "4px", marginRight: "26px" }}
                        onClick={this.handleSubmit}
                      >
                        <span> {pageTitle == "add" ? "Add" : "Update"} </span>
                      </Button>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
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
                <div
                  className="col-md-6 col-6"
                  data-info="Your agent's login.This field is where you put the Agent ID number, can be up to 8 digits in length, Must be at least 2 characters in length."
                  data-title="Shift ID"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="call-callId-id"
                    onChange={this.handleChange("callId")}
                    label="Call Time ID *"
                    value={callId}
                    disabled={pageTitle == "add" ? false : true}
                    margin="normal"
                    error={callIdError}
                    fullWidth
                  />
                </div>

                <div
                  className="col-md-12 col-6"
                  data-info="The password agent uses to login to Ytel.This field is where you put the users password. Must be at least 2 characters in length. A strong user password should be at least 8 characters in length and have lower case and upper case letters as well as at least one number."
                  data-title="Password"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="call-callId-name"
                    label="Call Time Name *"
                    margin="normal"
                    fullWidth
                    value={calltimename}
                    onChange={this.handleChange("calltimename")}
                    error={calltimenameError}
                  />
                </div>
                <div
                  className="col-md-12 col-6"
                  data-info="The password agent uses to login to Ytel.This field is where you put the users password. Must be at least 2 characters in length. A strong user password should be at least 8 characters in length and have lower case and upper case letters as well as at least one number."
                  data-title="Password"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="call-calltimecomment-comment"
                    label="Filter Comment *"
                    margin="normal"
                    fullWidth
                    value={calltimecomment}
                    onChange={this.handleChange("calltimecomment")}
                  />
                </div>
                <div className="col-md-12">
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
                      {agents_group.map(option => (
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
    Agent: state.admin_utilites
  };
}

const mapDispatchToProps = {
  addcalltime
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ADD);
