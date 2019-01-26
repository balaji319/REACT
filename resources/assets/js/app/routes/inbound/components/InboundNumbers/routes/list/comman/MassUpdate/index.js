import React, { Fragment } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import Slide from "@material-ui/core/Slide";
import TextField from "@material-ui/core/TextField";
import Tooltip from "@material-ui/core/Tooltip";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import TextError from "../../../../../../../../../components/common/TextError";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { Route, withRouter } from "react-router-dom";
import { fetchGlobal } from "../../../../../../../../../actions/Global";
import { connect } from "react-redux";
import ButtonNav from "../../../../../../../../../components/navButton";
import { createNotification } from "../../../../../../../../../Helpers";
function Transition(props) {
  return <Slide direction="up" {...props} />;
}

const list_didRoute = [
  { value: "", label: "Do Not Change" },
  { value: "AGENT", label: "Agent" },
  { value: "EXTEN", label: "Exten" },
  { value: "VOICEMAIL", label: "Voicemail" },
  { value: "PHONE", label: "Phone" },
  { value: "IN_GROUP", label: "In Group" },
  { value: "CALLMENU", label: "Call Menu" }
];

const list_filter_inbound_number = [
  { value: "", label: "Do Not Change" },
  { value: "DISABLED", label: "Disabled" },
  { value: "GROUP", label: "Group" },
  { value: "URL", label: "Url" },
  { value: "DNC_INTERNAL", label: "DNC Internal" },
  { value: "DNC_CAMPAIGN", label: "DNC Campaign" }
];

const list_callHandelMethod = [
  { value: "CID", label: "CID" },
  { value: "CID Lookup", label: " CIDLOOKUP" },
  { value: "CID Lookup RL", label: "CIDLOOKUPRL" },
  { value: "CID Lookup RC", label: "CIDLOOKUPRC" },
  { value: "CID Lookup ALT", label: "CIDLOOKUPALT" },
  { value: "CID Lookup RLALT", label: "CIDLOOKUPRLALT" },
  { value: "CID Lookup RCALT", label: "CIDLOOKUPRCALT" }
];

const list_group_id = ["aaa", "VVVV", "PPP"];
class MassUpdate extends React.Component {
  state = {
    open: false,
    showinfotitle: "",
    showinfo: "",
    did_route: "",
    filter_inbound_number: "",
    agentUser: "",
    exteninfo: "",
    voiceValue: "",
    phoneValue: "",
    groupValue: "",
    callmValue: "",
    campaign_id: "",
    call_handle_method: "",
    group_id: "",
    callmValue: "",
    filter_phone_group_id: "",
    filter_dnc_campaign: "",
    filter_url: "",
    filter_url_did_redirect: "",
    ingroup_list_id: "",
    campList: [],
    inboundList: [],
    callMenuList: [],
    phongroupList: [],
    is_change: false
  };

  handleSubmit = () => {
    let group_id = this.state.group_id;
    let call_handle_method = this.state.call_handle_method;
    let filter_inbound_number = this.state.filter_inbound_number;
    let did_route = this.state.did_route;
    let filter_phone_group_id = this.state.filter_phone_group_id;
    let user = this.state.agentUser;
    let extension = this.state.exteninfo;
    let voiceValue = this.state.voiceValue;
    let phone = this.state.phoneValue;
    let list_id = this.state.ingroup_list_id;
    let campaign_id = this.state.campaign_id;
    let menu_id = this.state.menu_id;
    let filter_url = this.state.filter_url;
    let filter_url_did_redirect = this.state.filter_url_did_redirect;
    let filter_dnc_campaign = this.state.filter_dnc_campaign;

    let error = false;

    if (!error) {
      let postData = {
        did: {
          list: this.props.listData.join(","),
          group_id: group_id,
          call_handle_method: call_handle_method,
          filter_inbound_number: filter_inbound_number,
          did_route: did_route,
          filter_phone_group_id: filter_phone_group_id,
          user: user,
          extension: extension,
          voicemail_ext: voiceValue,
          phone: phone,
          campaign_id: campaign_id,
          menu_id: menu_id,
          filter_url: filter_url,
          filter_url_did_redirect: filter_url_did_redirect,
          filter_dnc_campaign: filter_dnc_campaign,
          list_id: list_id
        }
      };

      let _this = this;
      axios
        .post("/api/number-mass-update", postData)
        .then(response => {
          //this.handleShowAlert(true);
          this.setState({
            alertTitle: response.data.status,
            alertContent: response.data.msg
            //showAlert:true
          });
          createNotification(
            "Success",
            "Success",
            "Record Updated Sucessfully"
          );
          _this.setState({ is_change: false });
        })
        .catch(function(error) {
          _this.setState({ is_change: false });
          createNotification("Error", "Error", error.response.data.msg);
        });
    }
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
      is_change: true
    });
  };
  handleClickOpen = () => {
    console.log(this.props.listData);
    this.setState({ open: true });
  };

  handleRequestClose = () => {
    this.setState({ open: false });
  };
  componentDidMount() {
    this.props.fetchGlobal(["cam", "inboundgroupoption", "callmenu"]);
  }
  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      campList: nextPropsFromRedux.Global.campaigns
        ? nextPropsFromRedux.Global.campaigns
        : [],
      inboundList: nextPropsFromRedux.Global.inboundgroupoption
        ? nextPropsFromRedux.Global.inboundgroupoption
        : [],
      callMenuList: nextPropsFromRedux.Global.callMenuList
        ? nextPropsFromRedux.Global.callMenuList
        : [],
      phongroupList: nextPropsFromRedux.Global.phongroup
        ? nextPropsFromRedux.Global.phongroup
        : []
    });
  }
  getDynamicDrop = Index => {
    if (Index) {
      switch (Index) {
        case "AGENT":
          return this.getAgentInformation();
        case "EXTEN":
          return this.getExtenInformation();
        case "VOICEMAIL":
          return this.getVoiceInformation();
        case "PHONE":
          return this.getPhoneInformation();
        case "IN_GROUP":
          return this.getInGroupInformation();
        case "CALLMENU":
          return this.getCallMenuInformation();
        default:
          return "";
      }
    }
  };

  getDynamicNumberDrop = Index => {
    if (Index) {
      switch (Index) {
        case "GROUP":
          return this.getInGroupNumberInformation();
        case "URL":
          return this.getInUrlInformation();
        case "DNC_CAMPAIGN":
          return this.getInGroupfilterCampaignInformation();
        default:
          return "";
      }
    }
  };

  getAgentInformation = () => {
    return (
      <Fragment>
        <div
          className="col-md-12 col-12"
          data-title="User Agent"
          data-info="This field allows for a custom outbound routing extension. This allows you to use different call handling methods depending upon how you want to route calls through your outbound campaign. Formerly called Campaign VDAD extension.- 8368 - DEFAULT - Will send the call to the next available agent no matter what server they are on- 8369 - Used for Answering Machine Detection after that, same behavior as 8368."
          onMouseEnter={this.logMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <TextField
            id="dropActiondropext_safe_harbor_exten"
            label="User Agent "
            margin="normal"
            onChange={this.handleChange("agentUser")}
            fullWidth
            value={this.state.agentUser}
          />
        </div>
      </Fragment>
    );
  };

  getExtenInformation = () => {
    return (
      <Fragment>
        <div
          className="col-md-12 col-12"
          data-title="Extension"
          data-info="This field allows for a custom outbound routing extension. This allows you to use different call handling methods depending upon how you want to route calls through your outbound campaign. Formerly called Campaign VDAD extension.- 8368 - DEFAULT - Will send the call to the next available agent no matter what server they are on- 8369 - Used for Answering Machine Detection after that, same behavior as 8368."
          onMouseEnter={this.logMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <TextField
            id="dropActiondropext_safe_harbor_exten"
            label="Extension"
            margin="normal"
            onChange={this.handleChange("exteninfo")}
            fullWidth
            value={this.state.exteninfo}
          />
        </div>
      </Fragment>
    );
  };

  getVoiceInformation = () => {
    return (
      <Fragment>
        <div
          className="col-md-12 col-12"
          data-title="User Agent"
          data-info="This field allows for a custom outbound routing extension. This allows you to use different call handling methods depending upon how you want to route calls through your outbound campaign. Formerly called Campaign VDAD extension.- 8368 - DEFAULT - Will send the call to the next available agent no matter what server they are on- 8369 - Used for Answering Machine Detection after that, same behavior as 8368."
          onMouseEnter={this.logMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <TextField
            id="dropActiondropext_safe_harbor_exten"
            label="Voicemail "
            margin="normal"
            onChange={this.handleChange("voiceValue")}
            fullWidth
            value={this.state.voiceValue}
          />
        </div>
      </Fragment>
    );
  };

  getPhoneInformation = () => {
    return (
      <Fragment>
        <div
          className="col-md-12 col-12"
          data-title="Phone Extension"
          data-info="This field allows for a custom outbound routing extension. This allows you to use different call handling methods depending upon how you want to route calls through your outbound campaign. Formerly called Campaign VDAD extension.- 8368 - DEFAULT - Will send the call to the next available agent no matter what server they are on- 8369 - Used for Answering Machine Detection after that, same behavior as 8368."
          onMouseEnter={this.logMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <TextField
            id="dropActiondropext_safe_harbor_exten"
            label="Phone Extension "
            margin="normal"
            onChange={this.handleChange("phoneValue")}
            fullWidth
            value={this.state.phoneValue}
          />
        </div>
      </Fragment>
    );
  };

  getInGroupInformation = () => {
    const {
      campaign_id,
      call_handle_method,
      ingroup_list_id,
      group_id,
      campList,
      inboundList
    } = this.state;
    return (
      <Fragment>
        <div
          className="col-md-12 col-12"
          data-title="Phone Extension"
          data-info="This field allows for a custom outbound routing extension. This allows you to use different call handling methods depending upon how you want to route calls through your outbound campaign. Formerly called Campaign VDAD extension.- 8368 - DEFAULT - Will send the call to the next available agent no matter what server they are on- 8369 - Used for Answering Machine Detection after that, same behavior as 8368."
          onMouseEnter={this.logMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <TextField
            id="dropActiondropext_singroup_list_id"
            label="In-Group List ID"
            margin="normal"
            onChange={this.handleChange("ingroup_list_id")}
            fullWidth
            value={this.state.ingroup_list_id}
          />
        </div>
        <div
          className="col-md-12 col-12"
          data-title="User Agent"
          data-info="This field allows for a custom outbound routing extension. This allows you to use different call handling methods depending upon how you want to route calls through your outbound campaign. Formerly called Campaign VDAD extension.- 8368 - DEFAULT - Will send the call to the next available agent no matter what server they are on- 8369 - Used for Answering Machine Detection after that, same behavior as 8368."
          onMouseEnter={this.logMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <FormControl className="w-100 mb-2">
            <InputLabel htmlFor="age-simple">In-Group ID </InputLabel>
            <Select
              value={group_id}
              onChange={this.handleChange("group_id")}
              input={<Input id="age-simple" />}
            >
              {" "}
              <MenuItem key="NON-C" value="">
                DO Not Change
              </MenuItem>
              {inboundList &&
                inboundList.map((option, i) => (
                  <MenuItem key={i} value={option.group_id}>
                    {option.group_id}
                  </MenuItem>
                ))}
            </Select>
            <FormHelperText />
          </FormControl>
        </div>

        <div
          className="col-md-12 col-12"
          data-title="User Agent"
          data-info="This field allows for a custom outbound routing extension. This allows you to use different call handling methods depending upon how you want to route calls through your outbound campaign. Formerly called Campaign VDAD extension.- 8368 - DEFAULT - Will send the call to the next available agent no matter what server they are on- 8369 - Used for Answering Machine Detection after that, same behavior as 8368."
          onMouseEnter={this.logMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <FormControl className="w-100 mb-2">
            <InputLabel htmlFor="age-simple">
              In-Group Call Handle Method{" "}
            </InputLabel>
            <Select
              value={call_handle_method}
              onChange={this.handleChange("call_handle_method")}
              input={<Input id="age-simple" />}
            >
              {" "}
              <MenuItem key="NON-C" value="">
                DO Not Change
              </MenuItem>
              {list_callHandelMethod &&
                list_callHandelMethod.map((option, i) => (
                  <MenuItem key={i} value={option.label}>
                    {option.value}
                  </MenuItem>
                ))}
            </Select>
            <FormHelperText />
          </FormControl>
        </div>
        <div
          className="col-md-12 col-12"
          data-title="User Agent"
          data-info="This field allows for a custom outbound routing extension. This allows you to use different call handling methods depending upon how you want to route calls through your outbound campaign. Formerly called Campaign VDAD extension.- 8368 - DEFAULT - Will send the call to the next available agent no matter what server they are on- 8369 - Used for Answering Machine Detection after that, same behavior as 8368."
          onMouseEnter={this.logMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <FormControl className="w-100 mb-2">
            <InputLabel htmlFor="age-simple">In-Group Campaign ID</InputLabel>
            <Select
              value={campaign_id}
              onChange={this.handleChange("campaign_id")}
              input={<Input id="age-simple" />}
            >
              <MenuItem key="NON-C" value="">
                DO Not Change
              </MenuItem>
              {campList &&
                campList.map((option, i) => (
                  <MenuItem key={i} value={option.campaign_id}>
                    {option.campaign_id} -{option.campaign_name}
                  </MenuItem>
                ))}
            </Select>
            <FormHelperText />
          </FormControl>
        </div>
      </Fragment>
    );
  };

  getCallMenuInformation = () => {
    const { callmValue, callMenuList } = this.state;
    return (
      <Fragment>
        <div
          className="col-md-12 col-12"
          data-title="User Agent"
          data-info="This field allows for a custom outbound routing extension. This allows you to use different call handling methods depending upon how you want to route calls through your outbound campaign. Formerly called Campaign VDAD extension.- 8368 - DEFAULT - Will send the call to the next available agent no matter what server they are on- 8369 - Used for Answering Machine Detection after that, same behavior as 8368."
          onMouseEnter={this.logMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <FormControl className="w-100 mb-2">
            <InputLabel htmlFor="age-simple">
              In-Group Call Handle Method{" "}
            </InputLabel>
            <Select
              value={callmValue}
              onChange={this.handleChange("callmValue")}
              input={<Input id="age-simple" />}
            >
              {" "}
              <MenuItem key="NON-C" value="">
                DO Not Change
              </MenuItem>
              {callMenuList &&
                callMenuList.map((option, i) => (
                  <MenuItem key={i} value={option.menu_id}>
                    {option.menu_id}
                  </MenuItem>
                ))}
            </Select>
            <FormHelperText />
          </FormControl>
        </div>
      </Fragment>
    );
  };

  getInGroupNumberInformation = () => {
    const { filter_phone_group_id, phongroupList } = this.state;
    return (
      <Fragment>
        <div
          className="col-md-12 col-12"
          data-title="User Agent"
          data-info="This field allows for a custom outbound routing extension. This allows you to use different call handling methods depending upon how you want to route calls through your outbound campaign. Formerly called Campaign VDAD extension.- 8368 - DEFAULT - Will send the call to the next available agent no matter what server they are on- 8369 - Used for Answering Machine Detection after that, same behavior as 8368."
          onMouseEnter={this.logMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <FormControl className="w-100 mb-2">
            <InputLabel htmlFor="age-simple">Filter Phone Group ID </InputLabel>
            <Select
              value={filter_phone_group_id}
              onChange={this.handleChange("filter_phone_group_id")}
              input={<Input id="age-simple" />}
            >
              {" "}
              <MenuItem key="NON-C" value="">
                DO Not Change
              </MenuItem>
              {phongroupList &&
                phongroupList.map((option, i) => (
                  <MenuItem key={i} value={option.filter_phone_group_id}>
                    {option.filter_phone_group_id} -{" "}
                    {option.filter_phone_group_name}
                  </MenuItem>
                ))}
            </Select>
            <FormHelperText />
          </FormControl>
        </div>
      </Fragment>
    );
  };
  getInUrlInformation = () => {
    const { filter_url, filter_url_did_redirect } = this.state;
    return (
      <Fragment>
        <div
          className="col-md-12 col-12"
          data-title="User Agent"
          data-info="This field allows for a custom outbound routing extension. This allows you to use different call handling methods depending upon how you want to route calls through your outbound campaign. Formerly called Campaign VDAD extension.- 8368 - DEFAULT - Will send the call to the next available agent no matter what server they are on- 8369 - Used for Answering Machine Detection after that, same behavior as 8368."
          onMouseEnter={this.logMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <TextField
            id="dropActiondropext_filter_url"
            label="FILTER URL "
            margin="normal"
            onChange={this.handleChange("filter_url")}
            fullWidth
            value={filter_url}
            helperText="Leave empty if you do not want to change it"
          />
        </div>
        <div
          className="col-md-12 col-12"
          data-title="User Agent"
          data-info="This field allows for a custom outbound routing extension. This allows you to use different call handling methods depending upon how you want to route calls through your outbound campaign. Formerly called Campaign VDAD extension.- 8368 - DEFAULT - Will send the call to the next available agent no matter what server they are on- 8369 - Used for Answering Machine Detection after that, same behavior as 8368."
          onMouseEnter={this.logMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <FormControl className="w-100 mb-2">
            <InputLabel htmlFor="age-simple">
              Filter URL DID Redirect
            </InputLabel>
            <Select
              value={filter_url_did_redirect}
              onChange={this.handleChange("filter_url_did_redirect")}
              input={<Input id="age-simple" />}
            >
              {" "}
              <MenuItem key="NON-C" value="">
                DO Not Change
              </MenuItem>
              <MenuItem key="0" value="Yes">
                Yes
              </MenuItem>
              <MenuItem key="1" value="No">
                No
              </MenuItem>
            </Select>
            <FormHelperText />
          </FormControl>
        </div>
      </Fragment>
    );
  };

  getInGroupfilterCampaignInformation = () => {
    const { filter_dnc_campaign } = this.state;
    return (
      <Fragment>
        <div
          className="col-md-12 col-12"
          data-title="User Agent"
          data-info="This field allows for a custom outbound routing extension. This allows you to use different call handling methods depending upon how you want to route calls through your outbound campaign. Formerly called Campaign VDAD extension.- 8368 - DEFAULT - Will send the call to the next available agent no matter what server they are on- 8369 - Used for Answering Machine Detection after that, same behavior as 8368."
          onMouseEnter={this.logMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <TextField
            id="dropActiondropext_filter_dnc_campaign"
            label="Filter DNC Campaign"
            margin="normal"
            onChange={this.handleChange("filter_dnc_campaign")}
            fullWidth
            value={filter_dnc_campaign}
            helperText="Leave empty if you do not want to change it"
          />
        </div>
      </Fragment>
    );
  };
  render() {
    const style_header = {
      backgroundColor: "#15bcd4",
      color: "#FFFFFF",
      fontSize: "20px",
      marginTop: "3px",
      padding: "10px",
      width: "100%"
    };
    const { did_route, filter_inbound_number } = this.state;
    return (
      <div style={{ overflow: "hidden" }}>
        <Tooltip title="Mass Update">
          <IconButton
            className="btn-sm"
            aria-label="Delete"
            onClick={this.handleClickOpen}
            style={{ float: "right" }}
          >
            <i className="fa fa-list-alt" />
          </IconButton>
        </Tooltip>
        <Dialog
          fullScreen
          open={this.state.open}
          onClose={this.handleRequestClose}
          TransitionComponent={Transition}
        >
          <AppBar className="position-relative">
            <div
              className="header"
              style={{
                float: "left",
                position: "absolute",
                marginLeft: "20px"
              }}
            >
              <img className="header-icon" src="images/ytel-logo.svg" />
            </div>

            <Toolbar>
              <Typography
                type="title"
                color="inherit"
                style={{
                  flex: 1
                }}
              />
              <Button onClick={this.handleRequestClose}>
                <CloseIcon />
              </Button>
            </Toolbar>
          </AppBar>
          {this.state.is_change && <ButtonNav click={this.handleSubmit} />}
          <List>
            <center>
              {" "}
              <h1> </h1>
            </center>
          </List>
          {this.props.listData == "" ? (
            <Fragment>
              {" "}
              <TextError
                Type="alert-danger"
                msg="Please Select at least one DID "
              />
            </Fragment>
          ) : (
            <Fragment>
              <div className="container-fluid" style={{ display: "flex" }}>
                <div className="col-md-8">
                  <div className="sub_menu_div" style={style_header}>
                    {" "}
                    <i className="fa fa-bars" style={{ marginRight: "10px" }} />
                    Mass Update Phone Number
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="col-md-12">
                        <div className="form-group">
                          <br />
                          <label>DID</label>
                          <h3>
                            {this.props.listData &&
                              this.props.listData.join(",")}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="sub_menu_div" style={style_header}>
                    {" "}
                    <i className="fa fa-bars" style={{ marginRight: "10px" }} />
                    DID Route Additional Setting : {did_route}
                  </div>
                  <div className="col-xs-12" style={{ height: "30px" }} />
                  <div className="row">
                    <div className="col-md-12">
                      <div className="col-md-12">
                        <div className="form-group">
                          <FormControl className="w-100 mb-2">
                            <InputLabel htmlFor="age-simple">
                              DID Route
                            </InputLabel>
                            <Select
                              value={did_route}
                              onChange={this.handleChange("did_route")}
                              input={<Input id="age-simple" />}
                            >
                              {list_didRoute &&
                                list_didRoute.map(option => (
                                  <MenuItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {" "}
                                    {option.label}
                                  </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText />
                          </FormControl>
                        </div>
                      </div>
                    </div>
                  </div>

                  {this.getDynamicDrop(did_route)}
                  <div className="sub_menu_div" style={style_header}>
                    {" "}
                    <i className="fa fa-bars" style={{ marginRight: "10px" }} />
                    Filter Inbound Number Additional Settings
                  </div>
                  <div className="col-xs-12" style={{ height: "30px" }} />
                  <div className="row">
                    <div className="col-md-12">
                      <div className="col-md-12">
                        <div className="form-group">
                          <FormControl className="w-100 mb-2">
                            <InputLabel htmlFor="age-simple">
                              Filter Inbound Number
                            </InputLabel>
                            <Select
                              value={filter_inbound_number}
                              onChange={this.handleChange(
                                "filter_inbound_number"
                              )}
                              input={<Input id="age-simple" />}
                            >
                              {list_filter_inbound_number &&
                                list_filter_inbound_number.map(option => (
                                  <MenuItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {" "}
                                    {option.label}
                                  </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText />
                          </FormControl>
                        </div>
                      </div>
                    </div>
                  </div>
                  {this.getDynamicNumberDrop(filter_inbound_number)}
                </div>

                <div className="col-lg-4" style={{ display: "grid" }}>
                  <div className="jr-card ">
                    <div className="jr-card-body ">
                      <div className="col-md-12 col-12 mt-12">
                        <div>
                          <div className="card-body">
                            <h5
                              className="card-title"
                              style={{ fontSize: "20px" }}
                            >
                              {this.state.showinfotitle != ""
                                ? this.state.showinfotitle
                                : "title"}
                            </h5>
                            <p className="card-text">{this.state.showinfo} </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Fragment>
          )}
        </Dialog>
      </div>
    );
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
  )(MassUpdate)
);
