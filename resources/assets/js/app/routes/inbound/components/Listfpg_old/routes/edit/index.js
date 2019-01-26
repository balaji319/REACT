import React, { Component } from "react";
import { UncontrolledAlert, Alert } from "reactstrap";
import SweetAlert from "react-bootstrap-sweetalert";
import Paper from "@material-ui/core/Paper";
import Switch from "@material-ui/core/Switch";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import ButtonNav from "../../../../../../../components/navButton/";
import ContainerHeader from "../../../../../../../components/ContainerHeader/index";
import CardBox from "../../../../../../../components/CardBox/index";
import CustomPicker from "../../../../../../../components/pickers/routes/Color/customPicker";
import IntlMessages from "../../../../../../../util/IntlMessages";
import { API_FETCH_INBOUND_FPG_DATA } from "../../../../constants";
import { scriptTextFields } from "./data";
import axios from "axios";

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
      is_change:false
    };
  }

  componentDidMount() {
    //this.props.fetchGlobal(["cam", "inboundgroupoption", "callmenu"]);
    this.getData();
  }

  getData = e => {
    let _this = this;
    _this.setState({ isLoding: true });
    axios
      .get(API_FETCH_INBOUND_FPG_DATA + this.state.pageTitle)
      .then(response => {
        //let campaignData = response.data.data;
        let numberData = response.data.data;
        console.log("=============================");
        console.log(numberData);
        _this.setState({
          //data: campaignData
          isLoding: false
        });

        /*  if (response.data.status === "Error") {
          _this.setState({ pageError: true });
        }*/
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
      is_change:true
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
    let scriptId = this.state.scriptId;
    let scriptName = this.state.scriptName;
    let scriptComment = this.state.scriptComment;
    let user_group = this.state.user_group;
    let scriptActiveValue = this.state.scriptActiveValue;
    let pageTitle = this.state.pageTitle;
    let error = false;

    if (scriptId == "") {
      this.setState({ scriptIdError: true });
      error = true;
    } else {
      this.setState({ scriptIdError: false });
    }

    if (scriptName == "") {
      this.setState({ scriptNameError: true });
      error = true;
    } else {
      this.setState({ scriptNameError: false });
    }
    if (scriptComment == "") {
      this.setState({ scriptCommentError: true });
      error = true;
    } else {
      this.setState({ scriptCommentError: false });
    }
    if (user_group == "") {
      this.setState({ scriptTextError: true });
      error = true;
    } else {
      this.setState({ scriptTextError: false });
    }

    if (!error) {
      let postData = {
        script_id: scriptId,
        type: pageTitle,
        script_name: scriptName,
        script_comments: scriptComment,
        user_group: user_group,
        active: scriptActiveValue
      };
      let _this = this;
      axios
        .post("/api/admin-utilities/update-or-create-script/", postData)
        .then(response => {
          this.handleShowAlert(true);
          this.setState({
            alertTitle: response.data.status,
            alertContent: response.data.msg,
            showAlert: true
          });
        })
        .catch(function(error) {});
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
      is_change
    } = this.state;

    if (pageType == "edit" && pageError) {
      return (
        <div>
          <ContainerHeader
            match={this.props.match}
            title={pageTitle + " script"}
          />
          {this.state.is_change && <ButtonNav click={this.handleSubmit} />}

        </div>
      );
    } else {
      return (
        <div>
          <ContainerHeader
            match={this.props.match}
            title= {pageType == "add" ? "Filter Phone Group" : "Filter Phone Group: : "+pageTitle}
          />

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
                    error={scriptIdError}
                    label="Filter Phone Group ID *"
                    value={pageTitle}
                    disabled={pageType == "edit" ?  true : false}
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
                    error={scriptNameError}
                  />
                </div>

                <div
                  className="col-md-12 col-12"
                  data-info="This is the description of the Filter Phone Group, it is purely for notation purposes only and is not a required field.."
                  data-title="Filter Phone Group Descriptione"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="script-fields"
                    select
                    label="Filter Phone Group Description"
                    value={filter_phone_group_description}
                    onChange={this.handleChange(
                      "filter_phone_group_description"
                    )}
                    SelectProps={{}}
                    helperText="Please select field to add in script text"
                    margin="normal"
                    fullWidth
                  >
                    {scriptTextFields.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>

                <div
                  className="col-md-12 col-12"
                  data-info="This is the administrative user group for this record, this allows admin viewing of this recoird restricted by user group. Default is --ALL-- which allows any admin user to view this record.."
                  data-title="Admin User Group"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="script-text"
                    label="Admin User Group *"
                    onClick={this.handleScriptTextClick}
                    onChange={this.handleChange("user_group")}
                    helperText="This is where you place the content of an agent screen Script."
                    value={user_group}
                    margin="normal"
                    error={scriptTextError}
                    fullWidth
                  />
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
        </div>
      );
    }
  }
}

export default EditScript;
