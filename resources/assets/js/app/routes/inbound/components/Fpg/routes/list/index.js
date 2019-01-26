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
import { createNotification } from "../../../../../../../Helpers";
import CardBox from "../../../../../../../components/CardBox/index";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
const dncActionType = [
  { label: "Add", value: "add" },
  { label: "Delete", value: "delete" }
];

const defaultCampaign = {
  label: "SELECT OPTION ",
  value: "OPTION"
};

const ERROR = "Error";
const ERROR_MSG = "Something went wrong. Please try agin later!";

class DncList extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      showAlert: false,
      campaignData: [],
      campaignId: "-Default_fpg",
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
      errorMsg: "",
      isLoding:false
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
let URl = (this.state.actionType =='add') ? "/api/add-filter-phone-group-number" : "/api/delete-filter-phone-group-number";
let POST_TYPE  = (this.state.actionType =='add') ?  axios
.post(URl, {
  phone_number: this.state.phoneNumbers,
  filter_phone_group_id: this.state.campaignId,
  type: this.state.actionType
})
.then(response => {
  createNotification(
    "Success",
    "Success",
    "Record Updated Sucessfully"
  );
})
.catch(function(error) {
  createNotification("Error", "Error", error.response.data.msg);
}) :  axios
.post(URl+"?phone_number="+this.state.phoneNumbers+"&filter_phone_group_id="+this.state.campaignId)
.then(response => {
  createNotification(
    "Success",
    "Success",
    "Record Updated Sucessfully"
  )
})
.catch(function(error) {
  createNotification("Error", "Error", error.response.data.msg);
});

    }
  };

  handleDownload = () => {

if(this.state.campaignIdDownload!=" "){
  let _this = this;
  let id = this.state.campaignIdDownload;
  _this.setState({ isLoding: true });
  axios
    .get("/api/download-filter-phone-numbers?filter_phone_group_id=" + id)
    .then(response => {
      _this.setState({ temp_data: response.data, isLoding: false });
      // Just for the demo
      var res = response.data;
      var data = new Blob([res], { type: "text/csv" }),
        csvURL = window.URL.createObjectURL(data),
        tempLink = document.createElement("a");
      tempLink.href = csvURL;
      tempLink.setAttribute("download", id + "CSVFile.csv");
      tempLink.click();
      createNotification("Success", "Success", "Record Download Sucessfully");
    })
    .catch(function(error) {
      _this.setState({ isLoding: false });
      createNotification("Error", "Error", error.response.data.msg);
    });
}else{
  createNotification("Error", "Error", "Please Select Phone Group ");
}

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
    let _this =this;
    this.setState({ isLoding: true });
    axios
      .get("/api/filter-phone-group-option-list")
      .then(response => {

        _this.setState({
          campaignData: response.data.data,
          isLoding:false
        });
      })
      .catch(function(error) {
        console.log(error);
        _this.setState({ isLoding: true });
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
        <ContainerHeader
          match={this.props.match}
          title="Add-Delete FPG Numbers"
        />

        <div className="row">
          <CardBox
            styleName="col-lg-12"
            heading="Add-Delete Numbers From The Filter Phone Group List"
          >
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
                      <label style={{ marginTop: "20px" }}>
                        Filter Phone Group:
                      </label>
                    </td>
                    <td align="left" width="60%">
                      <TextField
                        id="campaign-id"
                        select
                        value={campaignId}
                        error={campaignIdError}
                        onChange={this.handleChange("campaignId")}
                        SelectProps={{}}
                        helperText="Please select Filter Phone Group"
                        margin="normal"
                        fullwidth={true}
                      >

                        {campaignData.map((option, i) => (
                          <MenuItem key={i} value={option}>
                            {option}
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
                        fullwidth={true}
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
                        fullwidth={true}
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
                        helperText="Please select Filter Phone Group to download list"
                        margin="normal"
                        fullwidth={true}
                      >
                        {campaignData.map((option, i) => (
                          <MenuItem key={i} value={option}>
                            {option}
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
        {
          (this.state.isLoding && (
            <div className="loader-view" id="loader-view">
              <CircularProgress />
            </div>
          ))}
      </div>
    );
  }
}

export default DncList;
