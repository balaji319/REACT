import React, { Component } from "react";
import { UncontrolledAlert, Alert } from "reactstrap";
import SweetAlert from "react-bootstrap-sweetalert";
import Paper from "@material-ui/core/Paper";
import Switch from "@material-ui/core/Switch";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import ContainerHeader from "../../../../../../../components/ContainerHeader/index";
import CardBox from "../../../../../../../components/CardBox/index";

import IntlMessages from "../../../../../../../util/IntlMessages";
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
      pageTitle: this.props.location.pathname.split("/")[4],
      scriptId:
        this.props.location.pathname.split("/")[4] == "add"
          ? ""
          : this.props.location.pathname.split("/").pop(),
      pageError: false,
      scriptField: "",
      scriptName: "",
      scriptComment: "",
      scriptActive: true,
      scriptActiveValue: "Y",
      scriptText: "",
      scriptTextSelectionStart: 0,
      showAlert: false,
      alertContent: "",
      alertTitle: "",
      showConfirm: false
    };
  }

  componentDidMount() {
    if (this.state.pageTitle == "edit") {
      axios
        .get("/api/admin-utilities/get-script/" + this.state.scriptId)
        .then(response => {
          let scriptData = response.data.data;
          this.setState({
            data: scriptData,
            scriptName: scriptData.script_name,
            scriptComment: scriptData.script_comments,
            scriptActive: scriptData.active === "Y" ? true : false,
            scriptActiveValue: scriptData.active,
            scriptText: scriptData.script_text,
            scriptNameError: false,
            scriptCommentError: false,
            scriptTextError: false,
            scriptIdError: false
          });

          if (response.data.status === "Error") {
            this.setState({ pageError: true });
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  }

  handleShowAlert = flag => {
    this.setState({
      showAlert: flag
    });
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });

    if (name == "scriptText") {
      this.setState({ scriptTextSelectionStart: event.target.selectionStart });
    } else if (name == "scriptField") {
      let newField =
        scriptTextFieldsPrefix + event.target.value + scriptTextFieldsPostfix;
      this.setState({
        scriptText:
          this.state.scriptText.slice(0, this.state.scriptTextSelectionStart) +
          newField +
          this.state.scriptText.slice(this.state.scriptTextSelectionStart + 1)
      });
    }
  };

  handleScriptTextClick = event => {
    this.setState({ scriptTextSelectionStart: event.target.selectionStart });
  };

  handleActiveChange = (event, checked) => {
    this.setState({ scriptActive: checked });
    this.setState({ scriptActiveValue: checked ? "Y" : "N" });
  };

  handleSubmit = () => {
    let scriptId = this.state.scriptId;
    let scriptName = this.state.scriptName;
    let scriptComment = this.state.scriptComment;
    let scriptText = this.state.scriptText;
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
    if (scriptText == "") {
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
        script_text: scriptText,
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

  handlePreview = () => {
    alert("work for me");
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
      scriptComment,
      scriptActive,
      scriptActiveValue,
      scriptText,
      scriptField,
      scriptIdError,
      scriptNameError,
      scriptCommentError,
      scriptTextError
    } = this.state;

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
            title={pageTitle + " script"}
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
              styleName="col-lg-12"
              heading={pageTitle == "add" ? "Add new script" : scriptId}
            >
              <form className="row" noValidate autoComplete="off">
                <div className="col-md-12 col-12">
                  <TextField
                    id="script-id"
                    onChange={this.handleChange("scriptId")}
                    error={scriptIdError}
                    label="Script Id *"
                    value={scriptId}
                    disabled={pageTitle == "add" ? false : true}
                    margin="normal"
                    fullWidth
                    helperText="This is the title of a Script, it must be between 2 to 50 characters."
                  />
                </div>

                <div className="col-md-12 col-12">
                  <TextField
                    id="script-name"
                    label="Script Name *"
                    value={scriptName}
                    onChange={this.handleChange("scriptName")}
                    margin="normal"
                    fullWidth
                    error={scriptNameError}
                    helperText="This is where you can place comments for an agent screen Script."
                  />
                </div>

                <div className="col-md-12 col-12">
                  <TextField
                    id="script-comment"
                    label="Script Comment *"
                    value={scriptComment}
                    onChange={this.handleChange("scriptComment")}
                    margin="normal"
                    fullWidth
                    error={scriptCommentError}
                    helperText="This is where you can place comments for an agent screen Script."
                  />
                </div>

                <div className="col-md-12 col-12">
                  <p />
                  <p className="MuiFormHelperText-root-253">Script Active *</p>
                  <div className="row">
                    <Switch
                      value={scriptActiveValue}
                      onChange={this.handleActiveChange}
                      label="Script Active"
                      checked={scriptActive}
                      color="primary"
                    />
                  </div>
                </div>

                <div className="col-md-12 col-12">
                  <TextField
                    id="script-fields"
                    select
                    label="Select field"
                    value={scriptField}
                    onChange={this.handleChange("scriptField")}
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

                <div className="col-md-12 col-12">
                  <TextField
                    id="script-text"
                    label="Script Text *"
                    multiline
                    rows="4"
                    onClick={this.handleScriptTextClick}
                    onChange={this.handleChange("scriptText")}
                    helperText="This is where you place the content of an agent screen Script."
                    value={scriptText}
                    margin="normal"
                    error={scriptTextError}
                    fullWidth
                  />
                </div>

                <div className="col-md-12 col-12">
                  <br /> <br />
                  <Button
                    variant="raised"
                    className="jr-btn bg-purple text-white"
                    onClick={this.handleSubmit}
                  >
                    <i className="zmdi zmdi-mail-send zmdi-hc-fw" />
                    <span>Submit</span>
                  </Button>
                  <Button
                    variant="raised"
                    className="jr-btn bg-purple text-white"
                    onClick={this.handlePreview}
                  >
                    <i className="zmdi zmdi-mail-send zmdi-hc-fw" />
                    <span>Priview</span>
                  </Button>
                </div>
              </form>
            </CardBox>
          </div>
        </div>
      );
    }
  }
}

export default EditScript;
