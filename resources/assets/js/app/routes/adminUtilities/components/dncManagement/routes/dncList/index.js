import React, { Component } from "react";
import { Alert, UncontrolledAlert } from "reactstrap";
import { Redirect } from "react-router-dom";
import CustomScrollbars from "../../../../../../../util/CustomScrollbars";
import ContainerHeader from "../../../../../../../components/ContainerHeader/index";
import axios from "axios";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItemText from "@material-ui/core/ListItemText";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import SweetAlert from "react-bootstrap-sweetalert";

import CardBox from "../../../../../../../components/CardBox/index";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import { createNotification } from "../../../../../../../Helpers";
const dncActionType = [
  { label: "Add", value: "add" },
  { label: "Delete", value: "delete" }
];

const defaultCampaign = {
  label: "SYSTEM_INTERNAL - INTERNAL DNC LIST",
  value: "SYSTEM_INTERNAL"
};

const ERROR = "Error";
const ERROR_MSG = "Something went wrong. Please try agin later!";

class DncList extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      showAlert: false,
      campaignData: [],
      campaignId: defaultCampaign.value,
      phoneNumbers: "",
      campaignIdDownload: defaultCampaign.value,
      actionType: "add",
      phoneNumbersError: false,
      campaignIdError: false,
      actionTypeError: false,
      campaignIdDownloadError: false,
      successNumbers: [],
      duplicateNumbers: [],
      invalidNumbers: [],
      successMsg: "",
      errorMsg: ""
    };
  }

  handleShowAlert = flag => {
    this.setState({
      showAlert: flag
    });
  };

  handleChange = name => event => {
    if (name == "phoneNumbers") {
      //allow only intergers for phone number
      if (/^[0-9\n]+$/.test(event.target.value) || event.target.value === "") {
        this.setState({
          [name]: event.target.value
        });
      } else {
        this.setState({
          [name]: this.state.phoneNumbers
        });
      }
    } else {
      this.setState({
        [name]: event.target.value
      });
    }

    //remove/add error
    if (event.target.value === "") {
      this.setState({
        [name + "Error"]: true
      });
    } else {
      this.setState({
        [name + "Error"]: false
      });
    }
  };

  handleReset = () => {
    this.setState({
      phoneNumbers: "",
      phoneNumbersError: false,
      campaignIdError: false,
      actionTypeError: false,
      campaignId: defaultCampaign.value,
      actionType: "add"
    });
  };

  addDncNumberValidation = () => {
    let error = false;

    if (
      this.state.phoneNumbers == "" ||
      this.state.phoneNumbers.replace(/(?:\r\n|\r|\n)/g, "") === ""
    ) {
      error = true;
      this.setState({
        phoneNumbersError: true
      });
    } else {
      this.setState({
        phoneNumbersError: false
      });
    }

    if (this.state.campaignId == "") {
      error = true;
      this.setState({
        campaignIdError: true
      });
    } else {
      this.setState({
        campaignIdError: false
      });
    }

    if (this.state.actionType == "") {
      error = true;
      this.setState({
        actionTypeError: true
      });
    } else {
      this.setState({
        actionTypeError: false
      });
    }

    return error;
  };

  handleSubmit = () => {
    if (!this.addDncNumberValidation()) {
      axios
        .post("/api/admin-utilities/add-dnc-number", {
          phone_number: this.state.phoneNumbers,
          campaign_id: this.state.campaignId,
          type: this.state.actionType
        })
        .then(response => {
          console.log(response.data.duplicateNumbers);
          this.setState({
            showAlert: true,
            successNumbers: response.data.success_numbers,
            duplicateNumbers: response.data.duplicate_numbers,
            invalidNumbers: response.data.invalid_numbers,
            successMsg: response.data.success_msg,
            errorMsg: response.data.error_msg
          });
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  };

  handleDownload = () => {
    let _this = this;
    let id = this.state.campaignIdDownload;
    _this.setState({ isLoding: true });
    axios
      .get("/api/admin-utilities/download-dnc-list?campaign_id=" + id)
      .then(response => {
        _this.setState({ temp_data: response.data, isLoding: false });
        let res = response.data;
        console.log(res);
        let data = new Blob([res], { type: "text/csv" }),
          csvURL = window.URL.createObjectURL(data),
          tempLink = document.createElement("a");

        tempLink.href = csvURL;
        tempLink.setAttribute("download", id + "CSVFile.csv");
        window.open(csvURL, "_self");
        tempLink.click();

        createNotification("Success", "Success", "Record Download Sucessfully");
      })
      .catch(function(error) {
        _this.setState({ isLoding: false });
        createNotification("Error", "Error", error.response.data.msg);
      });
  };

  handleAlertClose = () => {
    this.setState({
      showAlert: false,
      successNumbers: [],
      duplicateNumbers: [],
      invalidNumbers: []
    });
  };

  componentDidMount() {
    axios
      .get("/api/admin-utilities/get-campaigns")
      .then(response => {
        this.setState({
          campaignData: response.data
        });
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  render() {
    const {
      successMsg,
      errorMsg,
      successNumbers,
      duplicateNumbers,
      invalidNumbers,
      showAlert,
      campaignData,
      campaignId,
      phoneNumbers,
      phoneNumbersError,
      campaignIdError,
      actionTypeError,
      campaignIdDownloadError,
      campaignIdDownload,
      actionType
    } = this.state;

    return (
      <div>
        <ContainerHeader match={this.props.match} title="DNC Management" />

        <Dialog
          maxWidth="md"
          fullWidth={true}
          open={showAlert}
          onClose={this.handleAlertClose}
        >
          <DialogTitle>DNC Number</DialogTitle>
          <DialogContent>
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-12">
                {successMsg ? (
                  <Alert className="alert-success">{successMsg}</Alert>
                ) : (
                  ""
                )}

                {errorMsg ? (
                  <Alert className="alert-danger">{errorMsg}</Alert>
                ) : (
                  ""
                )}
              </div>
              <div className="col-lg-4 col-sm-6 col-12">
                <Paper>
                  <List
                    subheader={
                      <ListSubheader className="position-static">
                        Success Numbers List ({successNumbers.length})
                      </ListSubheader>
                    }
                  >
                    <CustomScrollbars
                      className="scrollbar"
                      style={{ height: "150px" }}
                    >
                      {successNumbers ? (
                        successNumbers.map((successNumber, i) => {
                          return (
                            <ListItem key={i}>
                              <ListItemText primary={successNumber} />
                            </ListItem>
                          );
                        })
                      ) : (
                        <ListItem>
                          <ListItemText primary="No Numbers" />
                        </ListItem>
                      )}
                    </CustomScrollbars>
                  </List>
                </Paper>
              </div>
              <div className="col-lg-4 col-sm-6 col-12">
                <Paper>
                  <List
                    subheader={
                      <ListSubheader className="position-static">
                        {" "}
                        {actionType == "add"
                          ? "Already in DNC Numbers List"
                          : "Not in DNC Numbers List"}{" "}
                        ({duplicateNumbers.length})
                      </ListSubheader>
                    }
                  >
                    <CustomScrollbars
                      className="scrollbar"
                      style={{ height: "150px" }}
                    >
                      {duplicateNumbers ? (
                        duplicateNumbers.map((duplicateNumber, i) => {
                          return (
                            <ListItem key={i}>
                              <ListItemText primary={duplicateNumber} />
                            </ListItem>
                          );
                        })
                      ) : (
                        <ListItem>
                          <ListItemText primary="No Numbers" />
                        </ListItem>
                      )}
                    </CustomScrollbars>
                  </List>
                </Paper>
              </div>
              <div className="col-lg-4 col-sm-6 col-12">
                <Paper>
                  <List
                    subheader={
                      <ListSubheader className="position-static">
                        Invalid Numbers List ({invalidNumbers.length})
                      </ListSubheader>
                    }
                  >
                    <CustomScrollbars
                      className="scrollbar"
                      style={{ height: "150px" }}
                    >
                      {invalidNumbers ? (
                        invalidNumbers.map((invalidNumber, i) => {
                          return (
                            <ListItem key={i}>
                              <ListItemText primary={invalidNumber} />
                            </ListItem>
                          );
                        })
                      ) : (
                        <ListItem>
                          <ListItemText primary="No Numbers" />
                        </ListItem>
                      )}
                    </CustomScrollbars>
                  </List>
                </Paper>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleAlertClose} color="primary">
              Ok
            </Button>
          </DialogActions>
        </Dialog>

        <div className="row">
          <CardBox styleName="col-lg-12" heading="Add-Delete DNC Number">
            <form
              name="dncNumber"
              id="dncNumber"
              className="ng-pristine ng-valid ng-submitted"
              style={{}}
            >
              <table
                cellSpacing={3}
                cellPadding={3}
                style={{ width: "100%" }}
                className="table"
              >
                <tbody>
                  <tr style={{ border: "none" }} />
                  <tr>
                    <td align="right" width="40%">
                      <label style={{ marginTop: "20px" }}>Campaign:</label>
                    </td>
                    <td align="left" width="60%">
                      <TextField
                        id="campaign-id"
                        select
                        value={campaignId}
                        error={campaignIdError}
                        onChange={this.handleChange("campaignId")}
                        SelectProps={{}}
                        helperText="Please select campaign"
                        margin="normal"
                        fullWidth
                      >
                        <MenuItem value={defaultCampaign.value}>
                          {defaultCampaign.label}
                        </MenuItem>
                        {campaignData.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </td>
                  </tr>

                  <tr>
                    <td align="center">
                      <p align="right">Phone Numbers</p>
                      <br />
                      <br />
                      <br />
                      <br />
                      <Alert className="alert-info">
                        <h3 className="alert-heading">
                          <strong className="text-danger">IMPORTANT</strong>:
                          When adding numbers to the DNC list, the number(s){" "}
                        </h3>
                        <p>
                          <strong>MUST NOT</strong> include the country code
                          otherwise the system will potentially call the phone
                          number.
                          <br />
                          If you are using the DNC list to also block inbound
                          calls then it is recommended to include the 10 digit
                          phone number as well as adding the country code along
                          with the 10 digit number.' (For example 18005551212
                          and 8005551212)
                          <br />
                          You can also add numbers to campaign specific DNC
                          lists or system-wide internal DNC list.
                        </p>
                      </Alert>
                    </td>
                    <td align="left">
                      <textarea
                        cols={10}
                        rows={20}
                        name="phone_number"
                        id="phone_number"
                        className="form-control"
                        style={{ width: "60%", float: "left" }}
                        onkeypress="return IsNumeric(event);"
                        ondrop="return false;"
                        defaultValue={""}
                        onChange={this.handleChange("phoneNumbers")}
                        value={phoneNumbers}
                        margin="normal"
                        error={phoneNumbersError}
                        fullWidth
                      />
                      <span
                        id="error"
                        style={{ color: "Red", display: "none" }}
                      >
                        * Input digits (0 - 9)
                      </span>

                      <div id="right-help" style={{ display: "none" }}>
                        <h3>Phone Numbers</h3>
                        <hr />
                        <div>Enter one number on each line.</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td align="right">Add or Delete:</td>
                    <td align="left">
                      <TextField
                        id="action-type"
                        select
                        error={actionTypeError}
                        value={actionType}
                        onChange={this.handleChange("actionType")}
                        SelectProps={{}}
                        helperText="Please select action"
                        margin="normal"
                        fullWidth
                      >
                        {dncActionType.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </td>
                  </tr>

                  <tr>
                    <td align="right" />
                    <td align="left">
                      <div className="col-md-12 col-12">
                        <br /> <br />
                        <Button
                          variant="raised"
                          className="jr-btn bg-white "
                          onClick={this.handleReset}
                        >
                          <i className="zmdi zmdi-refresh-alt zmdi-hc-fw" />
                          <span>Reset</span>
                        </Button>
                        <Button
                          variant="raised"
                          className="jr-btn bg-success text-white"
                          onClick={this.handleSubmit}
                        >
                          <i className="zmdi zmdi-mail-send zmdi-hc-fw" />
                          <span>Submit</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                  <div style={{ marginBottom: "10px" }} />
                  <tr>
                    <td align="right">
                      <TextField
                        id="campaign-id"
                        select
                        value={campaignIdDownload}
                        error={campaignIdDownloadError}
                        onChange={this.handleChange("campaignIdDownload")}
                        SelectProps={{}}
                        helperText="Please select campaign to download list"
                        margin="normal"
                        fullWidth
                      >
                        <MenuItem value={defaultCampaign.value}>
                          {defaultCampaign.label}
                        </MenuItem>
                        {campaignData.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </td>
                    <td align="left">
                      {/* <div id="downloadbtn" onclick="download">Download</a></div> */}

                      <Button
                        variant="raised"
                        className="jr-btn bg-success text-white"
                        onClick={this.handleDownload}
                      >
                        <i className="zmdi zmdi-download zmdi-hc-fw" />
                        <span>Download</span>
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </form>
          </CardBox>
        </div>
      </div>
    );
  }
}

export default DncList;
