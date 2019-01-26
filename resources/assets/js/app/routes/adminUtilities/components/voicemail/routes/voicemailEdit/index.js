import React, { Component } from "react";
import { UncontrolledAlert, Alert } from "reactstrap";
import SweetAlert from "react-bootstrap-sweetalert";
import Paper from "@material-ui/core/Paper";
import Switch from "@material-ui/core/Switch";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import ContainerHeader from "../../../../../../../components/ContainerHeader/index";
import CardBox from "../../../../../../../components/CardBox/index";
import {
  getPageName,
  getPageParam,
  createNotification
} from "../../../../../../../Helpers";
import { helperText } from "./data";
import axios from "axios";
import AudioManager from "../../../../../../../components/AudioManager";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import CustomScrollbars from "../../../../../../../util/CustomScrollbars";
import { SIGNIN_USER_SUCCESS } from "../../../../../../../constants/ActionTypes";
import ButtonNav from "../../../../../../../components/navButton";
class EditVoicemail extends React.Component {
  componentDidMount() {
    if (this.state.pageTitle == "edit") {
      axios
        .get("/api/admin-utilities/get-voicemail/" + this.state.voicemailId)
        .then(response => {
          let voicemailData = response.data.data;
          this.setState({
            voicemailPass: voicemailData.pass,
            voicemailName: voicemailData.fullname,
            voicemailActive: voicemailData.active === "Y" ? true : false,
            voicemailActiveValue: voicemailData.active,
            voicemailEmail: voicemailData.email,
            voicemailAdminGroup: voicemailData.user_group,
            voicemailDelete:
              voicemailData.delete_vm_after_email === "Y" ? true : false,
            voicemailDeleteValue: voicemailData.delete_vm_after_email,
            voicemailGreeting: voicemailData.voicemail_greeting,
            voicemailZone: voicemailData.voicemail_timezone,
            voicemailOptions: voicemailData.voicemail_options,
            voicemailNewMsg: voicemailData.messages,
            voicemailOldMsg: voicemailData.old_messages,
            showinfo:
              "Hover to the input on left and help text will come up here :)",
            showinfotitle: "Help Block"
          });

          if (response.data.status === "Error") {
            this.setState({ pageError: true });
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    }

    axios
      .get("api/admin-utilities/get-voicemail-timezones")
      .then(response => {
        this.setState({
          voicemailZoneData: response.data
        });
      })
      .catch(function(error) {
        console.log(error);
      });

    axios
      .get("api/admin-utilities/get-admin-user-group-lists")
      .then(response => {
        this.setState({
          voicemailAdminGroupData: response.data
        });
      })
      .catch(function(error) {
        console.log(error);
      });

    let _this = this;
    axios
      .get("api/admin-utilities/audio-lists")
      .then(response => {
        _this.setState({
          audioData: response.data
        });
      })
      .catch(function(error) {
        console.log(error);
      });
  }
  handleListItemClick = value => {
    this.setState({ voicemailGreeting: value });
  };
  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
      is_change: true
    });

    if (
      name == "voicemailId" ||
      name == "voicemailName" ||
      name == "voicemailPass"
    ) {
      if (event.target.value == "") {
        this.setState({
          [name + "Error"]: true
        });
      } else {
        this.setState({
          [name + "Error"]: false
        });
      }
    }
  };

  handleActiveChange = (event, checked) => {
    this.setState({ voicemailActive: checked, is_change: true });
    this.setState({ voicemailActiveValue: checked ? "Y" : "N" });
  };

  handleDeleteChange = (event, checked) => {
    this.setState({ voicemailDelete: checked, is_change: true });
    this.setState({ voicemailDeleteValue: checked ? "Y" : "N" });
  };

  doValidation() {
    let voicemailId = this.state.voicemailId.trim();
    let voicemailName = this.state.voicemailName.trim();
    let voicemailPass = this.state.voicemailPass.trim();

    let error = false;

    if (voicemailId == "") {
      this.setState({ voicemailIdError: true });
      error = true;
    } else if (voicemailId.length < 2) {
      this.setState({ voicemailIdError: true });
      error = true;
    } else {
      this.setState({ voicemailIdError: false });
    }

    if (voicemailPass == "") {
      this.setState({ voicemailPassError: true });
      error = true;
    } else if (voicemailPass.length < 2 || voicemailPass.length > 10) {
      this.setState({ voicemailPassError: true });
      error = true;
    } else {
      this.setState({ voicemailPassError: false });
    }

    if (voicemailName == "") {
      this.setState({ voicemailNameError: true });
      error = true;
    } else if (voicemailName.length < 2 || voicemailName.length > 100) {
      this.setState({ voicemailNameError: true });
      error = true;
    } else {
      this.setState({ voicemailNameError: false });
    }
    return error;
  }

  handleSubmit = () => {
    let voicemailId = this.state.voicemailId;
    let voicemailName = this.state.voicemailName;
    let voicemailComment = this.state.voicemailComment;
    let voicemailText = this.state.voicemailText;
    let voicemailActiveValue = this.state.voicemailActiveValue;

    if (!this.doValidation()) {
      let postData = {
        voicemail_id: voicemailId,
        type: this.state.pageTitle,
        pass: this.state.voicemailPass,
        fullname: voicemailName,
        voicemail_greeting: voicemailComment,
        email: voicemailText,
        active: voicemailActiveValue,
        delete_vm_after_email: this.state.voicemailDeleteValue,
        voicemail_options: this.state.voicemailOptions
      };

      let URL =
        this.state.pageTitle != "add"
          ? "/api/admin-utilities/update-voicemail/"
          : "/api/admin-utilities/add-new-voicemail";
      console.log(postData);
      let _this = this;
      axios
        .post(URL, postData)
        .then(response => {
          createNotification(SUCCESS, SUCCESS, response.data.msg);
        })
        .catch(function(error) {
          createNotification(ERROR, ERROR, error.response.data.msg);
        });
    } else {
      createNotification(ERROR, ERROR, VALIDATION_ERROR_MSG);
    }
  };

  handleCloseAudioManager = () => {
    this.setState({
      openAudioManager: false,
      is_change: true
    });
  };

  openAudioManagerPopup = () => {
    this.setState({
      openAudioManager: true
    });
  };

  constructor(props) {
    super(props);
    this.state = {
      pageTitle: getPageName(this.props.location.pathname),
      pageError: false,
      voicemailId:
        getPageName(this.props.location.pathname) == "add"
          ? ""
          : getPageParam(this.props.location.pathname),
      voicemailPass: "",
      voicemailName: "",
      voicemailActive: true,
      voicemailActiveValue: "Y",
      voicemailEmail: "",
      voicemailAdminGroup: "",
      voicemailAdminGroupData: [],
      voicemailDelete: true,
      voicemailDeleteValue: "Y",
      voicemailGreeting: "",
      voicemailZone: "",
      voicemailZoneData: [],
      voicemailOptions: "",
      voicemailNewMsg: "",
      voicemailOldMsg: "",
      voicemailIdError: false,
      voicemailPassError: false,
      voicemailNameError: false,
      openAudioManager: false,
      is_change: false,
      audioData: { audio_list: [], audioDirUrl: "" }
    };
  }

  render() {
    const {
      pageTitle,
      pageError,
      audioData,
      openAudioManager,
      voicemailId,
      voicemailPass,
      voicemailName,
      voicemailActive,
      voicemailActiveValue,
      voicemailEmail,
      voicemailAdminGroup,
      voicemailAdminGroupData,
      voicemailDelete,
      voicemailDeleteValue,
      voicemailGreeting,
      voicemailZone,
      voicemailZoneData,
      voicemailOptions,
      voicemailNewMsg,
      voicemailOldMsg,
      voicemailIdError,
      voicemailPassError,
      voicemailNameError
    } = this.state;

    if (pageTitle == "edit" && pageError) {
      return (
        <div>
          <ContainerHeader
            match={this.props.match}
            title={pageTitle + " voicemail"}
          />

          <Alert className="shadow-lg" color="danger">
            <h3 className="alert-heading">Voicemail Not Found</h3>
            <p>We can not locate your Voicemail, please check your input.</p>
          </Alert>
        </div>
      );
    } else {
      return (
        <div>
          <ContainerHeader
            match={this.props.match}
            title={pageTitle + " voicemail"}
          />
          {this.state.is_change && <ButtonNav click={this.handleSubmit} />}

          <Dialog
            maxWidth="md"
            fullWidth={true}
            open={openAudioManager}
            onClose={this.handleCloseAudioManager}
          >
            <DialogTitle>Audio Manager</DialogTitle>
            <DialogContent>
              <AudioManager
                data={audioData}
                onSelectLanguage={this.handleListItemClick}
              />
            </DialogContent>
          </Dialog>

          <div className="row">
            <CardBox
              styleName="col-lg-8"
              heading={
                pageTitle == "add" ? "Add new voicemail" : "Edit voicemail"
              }
            >
              <form className="row" noValidate autoComplete="off">
                <div className="col-md-12 col-12">
                  <TextField
                    onChange={this.handleChange("voicemailId")}
                    error={voicemailIdError}
                    label="Voicemail Id *"
                    value={voicemailId}
                    disabled={pageTitle == "add" ? false : true}
                    margin="normal"
                    fullWidth
                    helperText={helperText.voicemail_id}
                  />
                </div>

                <div className="col-md-12 col-12">
                  <TextField
                    label="Pass *"
                    fullWidth
                    value={voicemailPass}
                    onChange={this.handleChange("voicemailPass")}
                    error={voicemailPassError}
                    helperText={helperText.voicemail_pass}
                  />
                </div>

                <div className="col-md-12 col-12">
                  <TextField
                    label="Name *"
                    fullWidth
                    margin="normal"
                    value={voicemailName}
                    onChange={this.handleChange("voicemailName")}
                    error={voicemailNameError}
                    helperText={helperText.voicemail_name}
                  />
                </div>

                <div className="col-md-12 col-12">
                  <p />
                  <p className="helper-text">Voicemail Active</p>
                  <div className="row">
                    <Switch
                      value={
                        voicemailActiveValue != null
                          ? voicemailActiveValue
                          : "Y"
                      }
                      onChange={this.handleActiveChange}
                      label="Voicemail Active"
                      checked={voicemailActive}
                      color="primary"
                    />
                  </div>
                  <p className="helper-text">{helperText.voicemail_active}</p>
                </div>

                <div className="col-md-12 col-12">
                  <TextField
                    label="Email"
                    fullWidth
                    margin="normal"
                    value={voicemailEmail}
                    onChange={this.handleChange("voicemailEmail")}
                    helperText={helperText.voicemail_email}
                  />
                </div>

                <div className="col-md-12 col-12">
                  <TextField
                    select
                    margin="normal"
                    fullWidth
                    label="Admin User Group"
                    value={voicemailAdminGroup}
                    onChange={this.handleChange("voicemailAdminGroup")}
                    SelectProps={{}}
                    helperText={helperText.voicemail_admin_group}
                  >
                    {voicemailAdminGroupData.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>

                <div className="col-md-12 col-12">
                  <p />
                  <p className="helper-text">Delete Voice after Email</p>
                  <div className="row">
                    <Switch
                      value={
                        voicemailDeleteValue != null
                          ? voicemailDeleteValue
                          : "Y"
                      }
                      onChange={this.handleDeleteChange}
                      label="Voicemail Active"
                      checked={voicemailDelete}
                      color="primary"
                    />
                  </div>
                  <p className="helper-text">{helperText.voicemail_delete}</p>
                </div>

                <div className="col-md-10 col-10">
                  <TextField
                    label="Voicemail Greeting"
                    fullWidth
                    margin="normal"
                    value={voicemailGreeting}
                    onChange={this.handleChange("voicemailGreeting")}
                    helperText={helperText.voicemail_greeting}
                  />
                </div>
                <div className="col-md-2 col-2">
                  <Button
                    onClick={this.openAudioManagerPopup}
                    style={{ marginTop: "25px" }}
                    fullWidth
                    variant="raised"
                    color="primary"
                    className="jr-btn"
                  >
                    <i className="zmdi zmdi-collection-music zmdi-hc-fw" />
                    <span>Select/Manage Audio</span>
                  </Button>
                </div>

                <div className="col-md-12 col-12">
                  <TextField
                    select
                    margin="normal"
                    fullWidth
                    label="Voicemail Zone"
                    value={voicemailZone}
                    onChange={this.handleChange("voicemailZone")}
                    SelectProps={{}}
                    helperText={helperText.voicemail_zone}
                  >
                    {voicemailZoneData.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>

                <div className="col-md-12 col-12">
                  <TextField
                    label="Voicemail Options"
                    fullWidth
                    margin="normal"
                    value={voicemailOptions}
                    onChange={this.handleChange("voicemailOptions")}
                    helperText={helperText.voicemail_options}
                  />
                </div>

                {pageTitle == "edit" ? (
                  <div className="col-md-12 col-12">
                    <TextField
                      label="New Messages"
                      value={voicemailNewMsg}
                      disabled
                      margin="normal"
                      fullWidth
                      InputLabelProps={{
                        shrink: true
                      }}
                    />
                    <TextField
                      label="Old Messages"
                      value={voicemailOldMsg}
                      disabled
                      margin="normal"
                      fullWidth
                      InputLabelProps={{
                        shrink: true
                      }}
                    />
                  </div>
                ) : (
                  ""
                )}

                <div className="col-md-12 col-12">
                  <br /> <br />
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

export default EditVoicemail;
