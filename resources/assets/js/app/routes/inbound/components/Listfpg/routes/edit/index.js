import React, { Component } from "react";
import SweetAlert from "react-bootstrap-sweetalert";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import ButtonNav from "../../../../../../../components/navButton/";
import ContainerHeader from "../../../../../../../components/ContainerHeader/index";
import CardBox from "../../../../../../../components/CardBox/index";
import { Route, withRouter } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
  API_FETCH_INBOUND_FPG_DATA,
  API_UPDATE_INBOUND_FPG_DATA,
  API_CREATE_INBOUND_FPG_DATA
} from "../../../../constants";
//import { scriptTextFields } from "./data";
import { connect } from "react-redux";
import axios from "axios";
import { fetchGlobal } from "../../../../../../../actions/Global";
import { createNotification } from "../../../../../../../Helpers";

class EditScript extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pageTitle: this.props.location.pathname.split("/")[5],
      pageType: this.props.location.pathname.split("/")[4],
      type:
        this.props.location.pathname.split("/")[4] == "edit"
          ? ""
          : this.props.location.pathname.split("/").pop(),
      pageError: false,
      filter_phone_group_id: "",
      filter_phone_group_description: "",
      filter_phone_group_name: "",
      scriptComment: "",
      scriptActive: true,
      scriptActiveValue: "Y",
      user_group: "",
      scriptTextSelectionStart: 0,
      showAlert: false,
      alertContent: "",
      alertTitle: "",
      showConfirm: false,
      showinfo: "",
      is_change: false,
      scriptTextFields: []
    };
  }

  componentDidMount() {
    this.props.fetchGlobal(["agentgroup"]);
    this.state.pageType == "edit" ? this.getData() : null;
  }
  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      scriptTextFields: nextPropsFromRedux.Global.agentgroup
        ? nextPropsFromRedux.Global.agentgroup
        : []
    });
  }
  getData = e => {
    let _this = this;
    _this.setState({ isLoding: true });
    axios
      .get(API_FETCH_INBOUND_FPG_DATA + this.state.pageTitle)
      .then(response => {
        //let campaignData = response.data.data;
        let fpg_data = response.data.data;
        console.log("==============fpgData===============");
        console.log(fpg_data);
        _this.setState({
          //data: campaignData
          isLoding: false,
          filter_phone_group_id: fpg_data.filter_phone_group_id,
          filter_phone_group_name: fpg_data.filter_phone_group_name,
          filter_phone_group_description:
            fpg_data.filter_phone_group_description,
          user_group: fpg_data.user_group
        });

        if (response.data.status === "Error") {
          _this.setState({ pageError: true });
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  handleShowAlert = flag => {
    this.setState({
      showAlert: flag
    });
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
      is_change: true
    });
  };

  handleScriptTextClick = event => {
    this.setState({ scriptTextSelectionStart: event.target.selectionStart });
  };

  logMouseEnter = e => {
    this.setState({ showinfo: e.target.getAttribute("data-info") });
    this.setState({ showinfotitle: e.target.getAttribute("data-title") });
  };
  logMouseLeave = e => {
    if (e) {
      this.setState({ showinfotitle: "" });
    }
  };
  logNativeMouseLeave = () => {
    console.log("&nbsp;&nbsp;&nbsp;mouseleave (native)");
  };
  clearLog = () => {
    console.log();
  };

  handleActiveChange = (event, checked) => {
    this.setState({ scriptActive: checked });
    this.setState({ scriptActiveValue: checked ? "Y" : "N" });
  };

  handleSubmit = () => {
    let filter_phone_group_id =
      this.state.pageType == "edit"
        ? this.state.pageTitle
        : this.state.filter_phone_group_id;
    let filter_phone_group_name = this.state.filter_phone_group_name;
    let filter_phone_group_description = this.state
      .filter_phone_group_description;
    let user_group = this.state.user_group;
    let error = false;

    if (filter_phone_group_name == "") {
      this.setState({ scriptNameError: true });
      error = true;
    } else {
      this.setState({ scriptNameError: false });
    }

    if (filter_phone_group_description == "") {
      this.setState({ scriptTextError: true });
      error = true;
    } else {
      this.setState({ scriptTextError: false });
    }
    if (user_group == "") {
      this.setState({ scriptNameError: true });
      error = true;
    } else {
      this.setState({ scriptNameError: false });
    }

    if (!error) {
      let postData = {
        filter_phone_group_id: filter_phone_group_id,
        type: this.state.pageTitle,
        filter_phone_group_name: filter_phone_group_name,
        filter_phone_group_description: filter_phone_group_description,
        user_group: user_group
      };
      let _this = this;
      URL =
        this.state.pageType == "edit"
          ? API_UPDATE_INBOUND_FPG_DATA
          : API_CREATE_INBOUND_FPG_DATA;
      axios
        .post(URL, postData)
        .then(response => {
          /*this.handleShowAlert(true);
          this.setState({
            alertTitle: response.data.status,
            alertContent: response.data.msg,
            showAlert: true
          });*/
          createNotification("success", "success", response.data.msg);
          this.props.history.push("/app/inbound/list-fpg/list");
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
      scriptId,
      scriptName,
      filter_phone_group_id,
      filter_phone_group_name,
      scriptComment,
      scriptActive,
      scriptActiveValue,
      user_group,
      filter_phone_group_description,
      scriptIdError,
      scriptNameError,
      scriptCommentError,
      scriptTextError,
      pageType,
      is_change,
      scriptTextFields
    } = this.state;

    if (pageType == "edit" && pageError) {
      return (
        <div>
          <ContainerHeader
            match={this.props.match}
            title={pageTitle + " script"}
          />
        </div>
      );
    } else {
      return (
        <div>
          <ContainerHeader
            match={this.props.match}
            title={
              pageType == "add"
                ? "Filter Phone Group"
                : "Filter Phone Group: : " + pageTitle
            }
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
              heading={pageType == "add" ? "New " : "Edit "}
            >
              <form className="row" noValidate autoComplete="off">
                <div
                  className="col-md-12 col-12"
                  data-info="This is the ID of the Filter Phone Group that is the container for a group of phone numbers that you can have automatically searched through when a call comes into a DID and send to an alternate route if there is a match. This field should be between 2 and 20 characters and have no punctuation except for underscore."
                  data-title="Filter Phone Group ID"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="filter_phone_group_id"
                    name="filter_phone_group_id"
                    onChange={this.handleChange("filter_phone_group_id")}
                    label="Filter Phone Group ID *"
                    value={
                      pageType == "edit" ? pageTitle : filter_phone_group_id
                    }
                    disabled={pageType == "edit" ? true : false}
                    margin="normal"
                    fullWidth
                  />
                </div>

                <div
                  className="col-md-12 col-12"
                  data-info="This is the name of the Filter Phone Group and is displayed with the ID in select lists where this feature is used. This field should be between 2 and 40 characters.."
                  data-title="Filter Phone Group Name"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="filter_phone_group_name"
                    label="Filter Phone Group Name *"
                    value={filter_phone_group_name}
                    onChange={this.handleChange("filter_phone_group_name")}
                    margin="normal"
                    fullWidth
                    error={scriptTextError}
                  />
                </div>

                <div
                  className="col-md-12 col-12"
                  data-info="This is the description of the Filter Phone Group, it is purely for notation purposes only and is not a required field."
                  data-title="Filter Phone Group Description"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="script-text"
                    label="Filter Phone Group Description *"
                    onClick={this.handleScriptTextClick}
                    onChange={this.handleChange(
                      "filter_phone_group_description"
                    )}
                    helperText="This is where you place the content of an agent screen Script."
                    value={filter_phone_group_description}
                    margin="normal"
                    error={scriptTextError}
                    fullWidth
                  />
                </div>

                <div
                  className="col-md-12 col-12"
                  data-info="This is the administrative user group for this record, this allows admin viewing of this recoird restricted by user group. Default is --ALL-- which allows any admin user to view this record.."
                  data-title="Admin User Group"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="script-fields"
                    select
                    label="Admin User Group *"
                    value={user_group}
                    onClick={this.handleScriptTextClick}
                    onChange={this.handleChange("user_group")}
                    SelectProps={{}}
                    helperText="Please select field to add in script text"
                    margin="normal"
                    fullWidth
                  >
                    <MenuItem key="--ALL---" value="---ALL---">
                      --ALL---
                    </MenuItem>
                    {scriptTextFields.map(option => (
                      <MenuItem
                        key={option.user_group}
                        value={option.user_group}
                      >
                        {option.group_name}
                      </MenuItem>
                    ))}
                  </TextField>
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
