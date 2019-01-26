import React, { Component, Fragment } from "react";
import { UncontrolledAlert, Alert } from "reactstrap";
import SweetAlert from "react-bootstrap-sweetalert";
import Paper from "@material-ui/core/Paper";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import ContainerHeader from "../../../../../../../components/ContainerHeader/index";
import CardBox from "../../../../../../../components/CardBox/index";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Divider from "@material-ui/core/Divider";
import { fetchGlobal } from "../../../../../../../actions/Global";
import { Route, withRouter } from "react-router-dom";
import AudioManager from "../../../../../../../components/common/AudioManager";
import { connect } from "react-redux";
import { createNotification } from "../../../../../../../Helpers";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import ButtonNav from "../../../../../../../components/navButton/";
import VoicemailPopUp from "../../../../../../../components/VoicemailPopUp/VoicemailPopUp";
import {
  API_FETCH_CALL_MENU_DATA,
  API_CREATE_CALL_MENU_DATA,
  API_UPDATE_CALL_MENU_DATA,
  API_UPDATE_SELECTED_CALL_MENU_DATA
} from "../../../../constants";

import {
  style_header,
  list_didRoute,
  option_callmenu_dtf,
  option_track_realtime_report,
  option_menu_time_check,
  option_logfields,
  options_callmenu,
  glabalCallMenuObj,
  option_searchMethod,
  option_handleOptions
} from "./data";

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
      pageTitle: this.props.location.pathname.split("/")[5],
      pageType: this.props.location.pathname.split("/")[4],
      groupId:
        this.props.location.pathname.split("/")[4] == "add"
          ? ""
          : this.props.location.pathname.split("/").pop(),
      pageError: false,
      user_group: "",
      menu_id: "",
      scriptComment: "",
      scriptActive: true,
      scriptActiveValue: "Y",
      menu_prompt: "",
      scriptTextSelectionStart: 0,
      showAlert: false,
      alertContent: "",
      alertTitle: "",
      showConfirm: false,
      showinfo: "",
      menu_timeout: "",
      menu_timeout_prompt: "",
      menu_invalid_prompt: "",
      menu_repeat: "",
      menu_time_check: [],
      call_time_id: "",
      track_in_vdac: "",
      tracking_group: "",
      dtmf_log: "",
      scriptTextFields: [],
      dtmf_field: "",
      is_change: false,
      menu_name: "",
      option_value_0: [],
      option_description_0: "",
      option_route_0: [],
      option_route_value_0: "",
      option_route_value_context_0: "",
      audio_dialog_menu: false,
      audio_dialog_timeout: false,
      audio_dialog_menu_invalid: false,
      inboundgroupoption: [],
      calltimeOptions: [],
      menu_nameError: false,
      callmenuOptions: [],
      phoneListOptions: [],
      glabalCallMenuObj: glabalCallMenuObj,
      u_records: [],
      campaigns: [],
      audio_dialog_call: false,
      selectIndex: "",
      voicemailData: [],
      phoneListData: [],
      selectedValue: "",
      open:false,
      csvIndex: "",
      audio_dialog_call_group: "",
      csvData: "",
      csvDataContext: ""
    };
  }

  componentDidMount() {
    this.props.fetchGlobal([
      "agentgroup",
      "calltime",
      "inboundgroupoption",
      "callmenu",
      "voicemail",
      "phoneList",
      "cam"
    ]);
    this.state.pageType == "edit" ? this.getData() : null;
    let pageTitle = this.state.pageTitle;
    this.state.glabalCallMenuObj.forEach((element, index) => {
      element["menu_id"] = pageTitle;
    });
  }
  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      scriptTextFields: nextPropsFromRedux.Global.agentgroup
        ? nextPropsFromRedux.Global.agentgroup
        : [],
      calltimeOptions: nextPropsFromRedux.Global.calltimelist
        ? nextPropsFromRedux.Global.calltimelist
        : [],
      inboundgroupoption: nextPropsFromRedux.Global.inboundgroupoption
        ? nextPropsFromRedux.Global.inboundgroupoption
        : [],
      callmenuOptions: nextPropsFromRedux.Global.callMenuList
        ? nextPropsFromRedux.Global.callMenuList
        : [],
      phoneListOptions: nextPropsFromRedux.Global.phoneList
        ? nextPropsFromRedux.Global.phoneList
        : [],
      campaigns: nextPropsFromRedux.Global.campaigns
        ? nextPropsFromRedux.Global.campaigns
        : [],
      voicemailData: nextPropsFromRedux.Global.voicemail
        ? nextPropsFromRedux.Global.voicemail
        : [],
      phoneListData: nextPropsFromRedux.Global.phoneListData
        ? nextPropsFromRedux.Global.phoneListData
        : []
    });
  }

  getData = e => {
    let _this = this;
    _this.setState({ isLoding: true });
    axios
      .get(API_FETCH_CALL_MENU_DATA + this.state.pageTitle)
      .then(response => {
        //let campaignData = response.data.data;
        let call_menu_data = response.data.data.callmenu_list;
        let callmenu_list = response.data.data.callMenuOptions;
        if (callmenu_list.length > 0) {
          let optioncount = callmenu_list.map(option => option.option_value);
          var resultarray = [];
          const newState = this.state.glabalCallMenuObj.map((item, i) => {
            if (optioncount.indexOf(item.option_value) > -1) {
              let temp_index = optioncount.indexOf(item.option_value);
              return {
                ...item,
                ["option_route"]: callmenu_list[temp_index].option_route,
                ["option_route_value"]:
                  callmenu_list[temp_index].option_route_value,
                ["option_route_value_context"]:
                  callmenu_list[temp_index].option_route_value_context,
                ["option_description"]:
                  callmenu_list[temp_index].option_description
              };
            }
            return item;
          });
          console.log("==============call_Menu===============");
          console.log(newState);
          setTimeout(function() {
            _this.setState({ glabalCallMenuObj: newState });
          }, 10);
        }

        console.log("==============call_Menu===============");
        console.log(call_menu_data);
        _this.setState({
          //data: campaignData
          isLoding: false,
          menu_id: call_menu_data.menu_id,
          menu_name: call_menu_data.menu_name,
          user_group: call_menu_data.user_group,
          menu_prompt: call_menu_data.menu_prompt,
          menu_timeout: call_menu_data.menu_timeout,
          menu_timeout_prompt: call_menu_data.menu_timeout_prompt,
          menu_invalid_prompt: call_menu_data.menu_invalid_prompt,
          menu_repeat: call_menu_data.menu_repeat,
          menu_time_check: call_menu_data.menu_time_check,
          call_time_id: call_menu_data.call_time_id,
          tracking_group: call_menu_data.tracking_group,
          track_in_vdac: call_menu_data.track_in_vdac,
          dtmf_field: call_menu_data.dtmf_field,
          dtmf_log: call_menu_data.dtmf_log
        });

        if (response.data.status === "Error") {
          _this.setState({ pageError: true });
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  };
  getDynamicDrop = (Index, options, i) => {
    if (Index) {
      switch (Index) {
        case "AGI":
          return this.getAgiInformation(options, i);
        case "EXTENSION":
          return this.getExtenInformation(options, i);
        case "VOICEMAIL":
          return this.getVoiceInformation(options, i);
        case "PHONE":
          return this.getPhoneInformation(options, i);
        case "INGROUP":
          return this.getInGroupInformation(options, i);
        case "CALLMENU":
          return this.getCallMenuInformation(options, i);
        case "DID":
          return this.getDidInformation(options, i);
        case "HANGUP":
          return this.getHangupInformation(options, i);
        default:
          return "";
      }
    }
  };

  getDidInformation = (options, i) => {
    const { inboundgroupoption } = this.state;
    return (
      <Fragment>
        <div
          className="col-md-12 col-12"
          data-info="This is the ID that you can use to track calls to this Call Menu when looking at the IVR Report. The list includes CALLMENU as the default as well as all of the In-Groups.."
          data-title="DID"
          onMouseEnter={this.logMouseEnter}
          onMouseLeave={this.logMouseLeave}
        >
          <TextField
            id="option_route_value"
            select
            label="DID"
            value={this.state.glabalCallMenuObj[i].option_route_value}
            onChange={e =>
              this.handleChangeArray(i, "option_route_value", e.target.value)
            }
            SelectProps={{}}
            margin="normal"
            fullWidth
          >
            <MenuItem key="--ALL---" value="---ALL---">
              default-Deault DID
            </MenuItem>
            {inboundgroupoption &&
              inboundgroupoption.map((option, i) => (
                <MenuItem key={i} value={option.group_id}>
                  {option.group_id}
                </MenuItem>
              ))}
          </TextField>
        </div>
      </Fragment>
    );
  };

  getAgiInformation = (options, i) => {
    return (
      <Fragment>
        <div
          className="col-md-12 col-12"
          data-title="AGI"
          data-info="This field allows for a custom outbound routing extension. This allows you to use different call handling methods depending upon how you want to route calls through your outbound campaign. Formerly called Campaign VDAD extension.- 8368 - DEFAULT - Will send the call to the next available agent no matter what server they are on- 8369 - Used for Answering Machine Detection after that, same behavior as 8368."
          onMouseEnter={this.logMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <TextField
            id="option_route_value_0"
            label="AGI "
            margin="normal"
            fullWidth
            value={this.state.glabalCallMenuObj[i].option_route_value}
            onChange={e =>
              this.handleChangeArray(i, "option_route_value", e.target.value)
            }
          />
        </div>
      </Fragment>
    );
  };

  getExtenInformation = (options, i) => {
    let extentionValue = options.option_route_value_context.split(",");
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
            id="option_route_value_0"
            label="Extension"
            margin="normal"
            onChange={this.handleChange("option_route_value_0")}
            fullWidth
            onChange={e =>
              this.handleChangeArray(i, "option_route_value", e.target.value)
            }
            fullWidth
            value={options.option_route_value}
          />
        </div>

        <div
          className="col-md-12 col-12"
          data-title="Context"
          data-info="This field allows for a custom outbound routing extension. This allows you to use different call handling methods depending upon how you want to route calls through your outbound campaign. Formerly called Campaign VDAD extension.- 8368 - DEFAULT - Will send the call to the next available agent no matter what server they are on- 8369 - Used for Answering Machine Detection after that, same behavior as 8368."
          onMouseEnter={this.logMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <TextField
            id="option_route_value_context_0"
            label="Context"
            margin="normal"
            onChange={e =>
              this.handleChangeArray(
                i,
                "option_route_value_context",
                e.target.value
              )
            }
            fullWidth
            value={options.option_route_value_context}
          />
        </div>
      </Fragment>
    );
  };

  getVoiceInformation = (options, i) => {
    return (
      <Fragment>
        <div
          className="col-md-12 col-12"
          data-title="Voicemail"
          data-info="This field allows for a custom outbound routing extension. This allows you to use different call handling methods depending upon how you want to route calls through your outbound campaign. Formerly called Campaign VDAD extension.- 8368 - DEFAULT - Will send the call to the next available agent no matter what server they are on- 8369 - Used for Answering Machine Detection after that, same behavior as 8368."
          onMouseEnter={this.logMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <TextField
            id="option_route_value_0"
            label="Voicemail Box"
            margin="normal"
            value={this.state.glabalCallMenuObj[i].option_route_value}
            onChange={e =>
              this.handleChangeArray(i, "option_route_value", e.target.value)
            }
          />
          <a
            data-controls-modal="audio_list"
            data-backdrop="static"
            data-keyboard="false"
            href="javascript:void(0)"
            className="btn btn-info showVoicemail"
            onClick={() => this.setState({ open: true, selectIndex: i })}
          >
            Voicemail Chooser
          </a>
          <VoicemailPopUp
            users={this.state.voicemailData}
            listdata={this.state.phoneListData}
            selectedValue={this.state.selectedValue}
            open={this.state.open}
            onClose={this.handleRequestCloseVoicemail.bind(this)}
          />
        </div>
      </Fragment>
    );
  };

  getInGroupInformation = (options, i) => {
    const {
      phoneListOptions,
      menu_prompt,
      inboundgroupoption,
      campaigns
    } = this.state;
    let extentionValue = options.option_route_value_context.split(",");
    return (
      <Fragment>
        <div
          className="col-md-12 col-12"
          data-info="This is the ID that you can use to track calls to this Call Menu when looking at the IVR Report. The list includes CALLMENU as the default as well as all of the In-Groups.."
          data-title="Phone"
          onMouseEnter={this.logMouseEnter}
          onMouseLeave={this.logMouseLeave}
        >
          <div className="Row">
            <TextField
              className="col-md-6 col-6"
              id="option_route_value_0"
              select
              label="INGROUP"
              value={options.option_route_value}
              onChange={e =>
                this.handleChangeArray(i, "option_route_value", e.target.value)
              }
              SelectProps={{}}
              margin="normal"
              fullWidth
            >
              {inboundgroupoption &&
                inboundgroupoption.map((option, i) => (
                  <MenuItem key={i} value={option.group_id}>
                    {option.group_id}
                  </MenuItem>
                ))}
            </TextField>
            <TextField
              className="col-md-6 col-6"
              id="option_route_value_0"
              select
              label="Handle Method"
              value={extentionValue[0]}
              onChange={e =>
                this.handleChangeContextArray(
                  i,
                  "option_route_value_context",
                  e.target.value,
                  options.option_route_value_context,
                  0
                )
              }
              SelectProps={{}}
              margin="normal"
              fullWidth
            >
              {option_handleOptions &&
                option_handleOptions.map((option, i) => (
                  <MenuItem key={i} value={option}>
                    {option}
                  </MenuItem>
                ))}
            </TextField>
          </div>
          <div className="Row">
            <TextField
              className="col-md-6 col-6"
              id="option_route_value_0"
              select
              label="Search Method"
              value={extentionValue[1]}
              onChange={e =>
                this.handleChangeContextArray(
                  i,
                  "option_route_value_context",
                  e.target.value,
                  options.option_route_value_context,
                  1
                )
              }
              SelectProps={{}}
              margin="normal"
              fullWidth
            >
              {option_searchMethod &&
                option_searchMethod.map((option, i) => (
                  <MenuItem key={i} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
            </TextField>
            <TextField
              className="col-md-6 col-6"
              id="option_route_value_0"
              label="List"
              value={extentionValue[2]}
              onChange={e =>
                this.handleChangeContextArray(
                  i,
                  "option_route_value_context",
                  e.target.value,
                  options.option_route_value_context,
                  2
                )
              }
              margin="normal"
              fullWidth
            />
          </div>
          <div className="Row">
            <TextField
              className="col-md-6 col-6"
              id="option_route_value_0"
              select
              label="Campaign ID"
              onChange={e =>
                this.handleChangeContextArray(
                  i,
                  "option_route_value_context",
                  e.target.value,
                  options.option_route_value_context,
                  3
                )
              }
              value={extentionValue[3]}
              margin="normal"
              fullWidth
            >
              <MenuItem key="--ALL---" value="---ALL---">
                --ALL---
              </MenuItem>
              {campaigns &&
                campaigns.map((option, i) => (
                  <MenuItem key={i} value={option.campaign_id}>
                    {option.campaign_id} - {option.campaign_name}
                  </MenuItem>
                ))}
            </TextField>
            <TextField
              className="col-md-6 col-6"
              id="option_route_value_0"
              label="Phone Code"
              value={extentionValue[4]}
              onChange={e =>
                this.handleChangeContextArray(
                  i,
                  "option_route_value_context",
                  e.target.value,
                  options.option_route_value_context,
                  4
                )
              }
              margin="normal"
              fullWidth
            />
          </div>
          <div className="Row">
            <TextField
              id="script-text"
              label="Menu Prompt *"
              onChange={this.handleChange("menu_prompt")}
              helperText="This is where you place the content of an agent screen Script."
              value={extentionValue[5]}
              margin="normal"
              fullWidth
            />
            <Button
              color="primary"
              className="jr-btn bg-primary text-white"
              onClick={() => {
                this.handledOpenAudioManagerDialogMenuCallGroup(
                  i,
                  5,
                  options.option_route_value_context
                );
              }}
            >
              Select/Manage Audio
            </Button>
          </div>
          <div className="Row">
            <TextField
              id="script-text"
              label="Menu Prompt *"
              onChange={this.handleChange("menu_prompt")}
              helperText="This is where you place the content of an agent screen Script."
              value={extentionValue[6]}
              margin="normal"
              fullWidth
            />
            <Button
              color="primary"
              className="jr-btn bg-primary text-white"
              onClick={() => {
                this.handledOpenAudioManagerDialogMenuCallGroup(
                  i,
                  6,
                  options.option_route_value_context
                );
              }}
            >
              Select/Manage Audio
            </Button>
          </div>
          <div className="Row">
            <TextField
              id="script-text"
              label="Menu Prompt *"
              onChange={this.handleChange("menu_prompt")}
              helperText="This is where you place the content of an agent screen Script."
              value={extentionValue[7]}
              margin="normal"
              fullWidth
            />
            <Button
              color="primary"
              className="jr-btn bg-primary text-white"
              onClick={() => {
                this.handledOpenAudioManagerDialogMenuCallGroup(
                  i,
                  7,
                  options.option_route_value_context
                );
              }}
            >
              Select/Manage Audio
            </Button>

            <Dialog
              maxWidth="md"
              fullWidth={true}
              open={this.state.audio_dialog_call_group}
            >
              <DialogTitle>Audio Manager Custom </DialogTitle>
              <Divider />
              <DialogContent>
                <AudioManager
                  onClose={this.handledOpenAudioManagerDialogMenuCallGroup}
                  onSelectLanguage={this.handleListItemClickCallGroup}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={this.handledOpenAudioManagerDialogMenuCallGroup}
                  color="secondary"
                  className="jr-btn bg-grey text-white"
                >
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          </div>
          <div className="Row">
            <TextField
              className="col-md-6 col-6"
              id="option_route_value_0"
              label="VID digits"
              value={extentionValue[8]}
              onChange={e =>
                this.handleChangeContextArray(
                  i,
                  "option_route_value_context",
                  e.target.value,
                  options.option_route_value_context,
                  8
                )
              }
              margin="normal"
              fullWidth
            />
          </div>
        </div>
      </Fragment>
    );
  };

  getHangupInformation = (options, i) => {
    return (
      <Fragment>
        <div
          className="col-md-12 col-12"
          data-title="Audoi FIle"
          data-info="This field allows for a custom outbound routing extension. This allows you to use different call handling methods depending upon how you want to route calls through your outbound campaign. Formerly called Campaign VDAD extension.- 8368 - DEFAULT - Will send the call to the next available agent no matter what server they are on- 8369 - Used for Answering Machine Detection after that, same behavior as 8368."
          onMouseEnter={this.logMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <TextField
            id="option_route_value_0"
            label="Audio File"
            margin="normal"
            fullWidth
            value={this.state.glabalCallMenuObj[i].option_route_value}
            onChange={e =>
              this.handleChangeArray(i, "option_route_value", e.target.value)
            }
          />
          <Button
            color="primary"
            className="jr-btn bg-primary text-white"
            onClick={() => {
              this.handledOpenAudioManagerDialogMenuCall(i);
            }}
          >
            Select/Manager Audio
          </Button>
          <Dialog
            maxWidth="md"
            fullWidth={true}
            open={this.state.audio_dialog_call}
          >
            <DialogTitle>Audio Manager </DialogTitle>
            <Divider />
            <DialogContent>
              <AudioManager
                onClose={this.handledOpenAudioManagerDialogMenuCall}
                onSelectLanguage={this.handleListItemClickCall}
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={this.handledOpenAudioManagerDialogMenuCall}
                color="secondary"
                className="jr-btn bg-grey text-white"
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </Fragment>
    );
  };

  getPhoneInformation = (options, i) => {
    const { phoneListOptions } = this.state;
    return (
      <Fragment>
        <div
          className="col-md-12 col-12"
          data-info="This is the ID that you can use to track calls to this Call Menu when looking at the IVR Report. The list includes CALLMENU as the default as well as all of the In-Groups.."
          data-title="Phone"
          onMouseEnter={this.logMouseEnter}
          onMouseLeave={this.logMouseLeave}
        >
          <TextField
            id="option_route_value_0"
            select
            label="Phone"
            value={this.state.glabalCallMenuObj[i].option_route_value}
            onChange={e =>
              this.handleChangeArray(i, "option_route_value", e.target.value)
            }
            SelectProps={{}}
            margin="normal"
            fullWidth
          >
            <MenuItem key="--ALL---" value="---ALL---">
              --ALL---
            </MenuItem>
            {phoneListOptions &&
              phoneListOptions.map((option, i) => (
                <MenuItem key={i} value={option.extension}>
                  {option.extension +
                    "-" +
                    option.server_ip +
                    "-" +
                    option.extension +
                    "" +
                    option.dialplan_number}
                </MenuItem>
              ))}
          </TextField>
        </div>
      </Fragment>
    );
  };

  getCallMenuInformation = (options, i) => {
    const { callmenuOptions } = this.state;
    return (
      <Fragment>
        <div
          className="col-md-12 col-12"
          data-info="This is the ID that you can use to track calls to this Call Menu when looking at the IVR Report. The list includes CALLMENU as the default as well as all of the In-Groups.."
          data-title="Call Menu"
          onMouseEnter={this.logMouseEnter}
          onMouseLeave={this.logMouseLeave}
        >
          <TextField
            id="option_route_value_0"
            select
            label="Call Menu"
            value={this.state.glabalCallMenuObj[i].option_route_value}
            onChange={e =>
              this.handleChangeArray(i, "option_route_value", e.target.value)
            }
            SelectProps={{}}
            margin="normal"
            fullWidth
          >
            <MenuItem key="--ALL---" value="---ALL---">
              --ALL---
            </MenuItem>
            {callmenuOptions &&
              callmenuOptions.map((option, i) => (
                <MenuItem key={i} value={option.menu_id}>
                  {option.menu_id}
                </MenuItem>
              ))}
          </TextField>
        </div>
      </Fragment>
    );
  };
  handleShowAlert = flag => {
    this.setState({
      showAlert: flag
    });
  };

  handleChange = name => event => {
    console.log("key types...");
    this.setState({
      [name]: event.target.value,
      is_change: true
    });

    // if (name == "menu_prompt") {
    //   this.setState({ scriptTextSelectionStart: event.target.selectionStart });
    // } else if (name == "user_group") {
    //   let newField =
    //     scriptTextFieldsPrefix + event.target.value + scriptTextFieldsPostfix;
    //   this.setState({
    //     menu_prompt:
    //       this.state.menu_prompt.slice(0, this.state.scriptTextSelectionStart) +
    //       newField +
    //       this.state.menu_prompt.slice(this.state.scriptTextSelectionStart + 1)
    //   });
    // }
  };

  handleChangeContextArray(index, dataType, value, data, position) {
    let this_ = this;
    let arrayData = data.split(",");
    arrayData[position] = value;
    let result = arrayData.join(",");
    var datata = this_.state.u_records;
    var resultarray = [];
    const newState = this.state.glabalCallMenuObj.map((item, i) => {
      if (i == index) {
        resultarray.push({ ...item, [dataType]: result, ["UpdateRow"]: 1 });
        return { ...item, [dataType]: result, ["UpdateRow"]: 1 };
      }
      return item;
    });

    this.setState({
      glabalCallMenuObj: newState,
      u_records: resultarray,
      is_change: true
    });
  }

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

  handledOpenAudioManagerDialog = () => {
    this.setState({ audio_dialog: !this.state.audio_dialog });
  };
  handledOpenAudioManagerDialogMenu = () => {
    this.setState({ audio_dialog_menu: !this.state.audio_dialog_menu });
  };
  handledOpenAudioManagerDialogTimeout = () => {
    this.setState({ audio_dialog_timeout: !this.state.audio_dialog_timeout });
  };
  handledOpenAudioManagerDialogMenuInvalid = () => {
    this.setState({
      audio_dialog_menu_invalid: !this.state.audio_dialog_menu_invalid
    });
  };

  handledOpenAudioManagerDialogMenuCall = i => {
    this.setState({
      audio_dialog_call: !this.state.audio_dialog_call,
      selectIndex: i
    });
  };

  handledOpenAudioManagerDialogMenuCallGroup = (i, index, csvData) => {
    this.setState({
      audio_dialog_call_group: !this.state.audio_dialog_call_group,
      selectIndex: i,
      csvIndex: index,
      csvDataContext: csvData
    });
  };

  handleChangeArray(index, dataType, value, data) {
    let this_ = this;
    var datata = this_.state.u_records;
    var resultarray = [];
    const newState = this.state.glabalCallMenuObj.map((item, i) => {
      if (i == index) {
        resultarray.push({ ...item, [dataType]: value, ["UpdateRow"]: 1 });
        return { ...item, [dataType]: value, ["UpdateRow"]: 1 };
      }
      return item;
    });

    this.setState({
      glabalCallMenuObj: newState,
      u_records: resultarray,
      is_change: true
    });
  }

  handleListItemClickInvalid = value => {
    this.setState({ menu_invalid_prompt: value });
  };

  handleListItemClickTimeout = value => {
    this.setState({ menu_timeout_prompt: value });
  };

  handleListItemClickCall = value => {
    let index = this.state.selectIndex;
    let dataType = "option_route_value";

    let this_ = this;
    var datata = this_.state.u_records;
    var resultarray = [];
    const newState = this.state.glabalCallMenuObj.map((item, i) => {
      if (i == index) {
        resultarray.push({ ...item, [dataType]: value, ["UpdateRow"]: 1 });
        return { ...item, [dataType]: value, ["UpdateRow"]: 1 };
      }
      return item;
    });

    this.setState({
      glabalCallMenuObj: newState,
      u_records: resultarray,
      is_change: true
    });
    //this.setState({menu_timeout_prompt:value})
  };

  handleListItemClickCallGroup = value => {
    let index = this.state.selectIndex;
    let csvIndex = this.state.csvIndex;
    let csvData = this.state.csvDataContext;
    let dataType = "option_route_value_context";
    let arrayData = csvData.split(",");
    console.log("_-----------------------------");
    console.log(arrayData);
    console.log("_-----------------------------");
    arrayData[csvIndex] = value;
    console.log(arrayData);
    console.log("_-ABOVE------");
    let resultarrayData = arrayData.join(",");
    console.log(resultarrayData);
    let this_ = this;
    var datata = this_.state.u_records;
    var resultarray = [];
    const newState = this.state.glabalCallMenuObj.map((item, i) => {
      if (i == index) {
        resultarray.push({
          ...item,
          [dataType]: resultarrayData,
          ["UpdateRow"]: 1
        });
        return { ...item, [dataType]: resultarrayData, ["UpdateRow"]: 1 };
      }
      return item;
    });

    this.setState({
      glabalCallMenuObj: newState,
      u_records: resultarray,
      is_change: true
    });
    //this.setState({menu_timeout_prompt:value})
  };

  handleRequestCloseVoicemail = value => {
    let index = this.state.selectIndex;
    let dataType = "option_route_value";
    let this_ = this;
    var datata = this_.state.u_records;
    var resultarray = [];
    const newState = this.state.glabalCallMenuObj.map((item, i) => {
      if (i == index) {
        resultarray.push({ ...item, [dataType]: value, ["UpdateRow"]: 1 });
        return { ...item, [dataType]: value, ["UpdateRow"]: 1 };
      }
      return item;
      //this.setState({ voicemail: value, open: false });
    });

    this.setState({
      glabalCallMenuObj: newState,
      u_records: resultarray,
      is_change: true,
      open: false
    });
  };
  handleListItemClickMenu = value => {
    this.setState({ menu_prompt: value });
  };

  handleActiveChange = (event, checked) => {
    this.setState({ scriptActive: checked });
    this.setState({ scriptActiveValue: checked ? "Y" : "N" });
  };

  handleSubmit = () => {
    let call_time_id = this.state.call_time_id;
    let dtmf_field = this.state.dtmf_field;
    let dtmf_log = this.state.dtmf_log;
    let menu_id = this.state.menu_id;
    let menu_invalid_prompt = this.state.menu_invalid_prompt;
    let menu_name = this.state.menu_name;
    let menu_prompt = this.state.menu_prompt;
    let menu_repeat = this.state.menu_repeat;
    let menu_time_check = this.state.menu_time_check;
    let menu_timeout = this.state.menu_timeout;
    let menu_timeout_prompt = this.state.menu_timeout_prompt;
    let track_in_vdac = this.state.track_in_vdac;
    let tracking_group = this.state.tracking_group;
    let user_group = this.state.user_group;
    let error = false;

    menu_name == ""? (this.setState({ menu_nameError: true }),error = true) :  this.setState({ menu_nameError: false });
    menu_id == ""? (this.setState({ menu_idError: true }),error = true) :  this.setState({ menu_idError: false });


    if (!error) {
      let postData = {
        call_time_id: call_time_id,
        type: this.state.pageTitle,
        dtmf_field: dtmf_field,
        dtmf_log: dtmf_log,
        menu_prompt: menu_prompt,
        menu_id: menu_id,
        menu_invalid_prompt: menu_invalid_prompt,
        menu_name: menu_name,
        menu_repeat: menu_repeat,
        menu_prompt: menu_prompt,
        menu_time_check: menu_time_check,
        menu_timeout: menu_timeout,
        menu_timeout_prompt: menu_timeout_prompt,
        track_in_vdac: track_in_vdac,
        tracking_group: tracking_group,
        user_group: user_group
      };
      let postDataAdd = {
        menu_id: menu_id,
        menu_name: menu_name,
        user_group: user_group
      };

      let _this = this;

      let currentArray = this.state.glabalCallMenuObj;

      let checkChangeArray = currentArray.filter(row => row.UpdateRow == 1);
      if (checkChangeArray.length > 0) {
        this.handleCallMenu(currentArray);
      }
      let URL =
        this.state.pageType == "edit"
          ? API_UPDATE_CALL_MENU_DATA
          : API_CREATE_CALL_MENU_DATA;

      let DATA_ACTION = this.state.pageType == "edit" ? postData : postDataAdd;

      axios
        .post(URL, DATA_ACTION)
        .then(response => {
          if( this.state.pageType !== "edit"){
            this.props.history.push("/app/inbound/callmenu/list");
          };

          createNotification("Success", "Success", response.data.msg);
        })
        .catch(function(error) {
          createNotification("Error", "Error", error.response.data.msg);
        });
    }
  };

  handleCallMenu = currentArray => {
    let $this = this;
    let menu_id = this.state.pageTitle;
    this.setState({ isLoading: true });
    let formData = { menu_id: menu_id, callMenuOptions: currentArray };
    axios
      .post(API_UPDATE_SELECTED_CALL_MENU_DATA, formData)
      .then(response => {
        createNotification("Success", "Success", response.data.msg);
      })
      .catch(function(error) {
        createNotification("Error", "Error", error.response.data.msg);
      });
  };

  render() {
    console.log("BB=========================");
    console.log(this.state.glabalCallMenuObj);
    console.log("=========================");
    const {
      pageTitle,
      pageError,
      showAlert,
      alertContent,
      scriptTextFields,
      alertTitle,
      scriptId,
      scriptName,
      menu_prompt,
      menu_timeout_prompt,
      menu_invalid_prompt,
      menu_id,
      menu_name,
      menu_repeat,
      menu_timeout,
      menu_time_check,
      call_time_id,
      track_in_vdac,
      dtmf_field,
      dtmf_log,
      tracking_group,
      scriptComment,
      pageType,
      scriptActive,
      scriptActiveValue,
      user_group,
      scriptField,
      scriptIdError,
      scriptNameError,
      scriptCommentError,
      is_change,
      scriptTextError,
      option_value_0,
      option_route_0,
      option_description_0,
      option_route_value_0,
      option_route_value_context_0,
      inboundgroupoption,
      calltimeOptions
    } = this.state;

    var add_call_menu_data = (
      <Fragment>
        <form className="row" noValidate autoComplete="off">
          <div
            className="col-md-12 col-12"
            data-info="This is Id for call menu. Please Do not use words general, globals, default, trunkinbound, loopback-no-log, monitor_exit, monitor as menu id."
            data-title="Menu ID(Required) "
            onMouseEnter={this.logMouseEnter}
            onMouseLeave={this.logMouseLeave}
          >
            <TextField
              id="menu_id"
              onChange={this.handleChange("menu_id")}
              //error={scriptIdError}
              label="Menu ID(Required) *"
              value={pageType == "edit" ? pageTitle : menu_id}
              disabled={pageType == "edit" ? true : false}
              margin="normal"
              error={this.state.menu_idError}
              fullWidth
            />
          </div>

          <div
            className="col-md-12 col-12"
            data-info="This is descriptive field for call menu.."
            data-title="Menu Name(Required) "
            onMouseEnter={this.logMouseEnter}
            onMouseLeave={this.logMouseLeave}
          >
            <TextField
              id="menu_name"
              label="Menu Name(Required) *"
              value={menu_name}
              onChange={this.handleChange("menu_name")}
              margin="normal"
              error={this.state.menu_nameError}
              fullWidth
              //error={scriptNameError}
            />
          </div>

          <div
            className="col-md-12 col-12"
            data-info="This is administrative user group for this call menu.."
            data-title="Admin User Group "
            onMouseEnter={this.logMouseEnter}
            onMouseLeave={this.logMouseLeave}
          >
            <TextField
              id="script-fields"
              select
              label="Admin User Group"
              value={user_group}
              onChange={this.handleChange("user_group")}
              SelectProps={{}}
              helperText="Please select field to add in script text"
              margin="normal"
              fullWidth
            >
              <MenuItem key="--ALL---" value="---ALL---">
                --ALL---
              </MenuItem>
              {scriptTextFields.map((option, i) => (
                <MenuItem key={i} value={option.user_group}>
                  {option.group_name}
                </MenuItem>
              ))}
            </TextField>
          </div>
        </form>
      </Fragment>
    );
    if (pageTitle == "edit" && pageError) {
      return (
        <div>
          <ContainerHeader
            match={this.props.match}
            title={
              pageType == "edit" ? "Call Menu" : "Call Menu: : " + pageTitle
            }
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
            title={this.state.pageType + " Call Menu "}
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
              heading={pageTitle == "add" ? "Add new Group" : scriptId}
            >
              {this.state.pageType == "add" ? (
                add_call_menu_data
              ) : (
                <Fragment>
                  <form className="row" noValidate autoComplete="off">
                    <div
                      className="col-md-12 col-12"
                      data-info="This is Id for call menu. Please Do not use words general, globals, default, trunkinbound, loopback-no-log, monitor_exit, monitor as menu id."
                      data-title="Menu ID(Required) "
                      onMouseEnter={this.logMouseEnter}
                      onMouseLeave={this.logMouseLeave}
                    >
                      <TextField
                        id="menu_id"
                        onChange={this.handleChange("menu_id")}
                        error={scriptIdError}
                        label="Menu ID(Required) *"
                        value={pageType == "edit" ? pageTitle : menu_id}
                        disabled={pageType == "edit" ? true : false}
                        margin="normal"
                        fullWidth
                      />
                    </div>

                    <div
                      className="col-md-12 col-12"
                      data-info="This is descriptive field for call menu.."
                      data-title="Menu Name(Required) "
                      onMouseEnter={this.logMouseEnter}
                      onMouseLeave={this.logMouseLeave}
                    >
                      <TextField
                        id="menu_name"
                        label="Menu Name(Required) *"
                        value={menu_name}
                        onChange={this.handleChange("menu_name")}
                        margin="normal"
                        fullWidth
                        error={scriptNameError}
                      />
                    </div>

                    <div
                      className="col-md-12 col-12"
                      data-info="This is administrative user group for this call menu.."
                      data-title="Admin User Group "
                      onMouseEnter={this.logMouseEnter}
                      onMouseLeave={this.logMouseLeave}
                    >
                      <TextField
                        id="script-fields"
                        select
                        label="Admin User Group"
                        value={user_group}
                        onChange={this.handleChange("user_group")}
                        SelectProps={{}}
                        helperText="Please select field to add in script text"
                        margin="normal"
                        fullWidth
                      >
                        <MenuItem key="--ALL---" value="---ALL---">
                          --ALL---
                        </MenuItem>
                        {scriptTextFields.map((option, i) => (
                          <MenuItem key={i} value={option.user_group}>
                            {option.group_name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </div>

                    <div
                      className="col-md-12 col-12"
                      data-info="This field contains the file name of the audio prompt to play at the beginning of this menu..."
                      data-title="Menu Promptu "
                      onMouseEnter={this.logMouseEnter}
                      onMouseLeave={this.logMouseLeave}
                    >
                      <TextField
                        id="script-text"
                        label="Menu Prompt *"
                        onChange={this.handleChange("menu_prompt")}
                        helperText="This is where you place the content of an agent screen Script."
                        value={menu_prompt}
                        margin="normal"
                        fullWidth
                      />
                      <Button
                        color="primary"
                        className="jr-btn bg-primary text-white"
                        onClick={this.handledOpenAudioManagerDialogMenu}
                      >
                        Select/Manage Audio
                      </Button>
                    </div>
                    <Dialog
                      maxWidth="md"
                      fullWidth={true}
                      open={this.state.audio_dialog_menu}
                      onClose={this.handleRequestClose}
                    >
                      <DialogTitle>Audio Manager</DialogTitle>
                      <Divider />
                      <DialogContent>
                        <AudioManager
                          onClose={this.handleRequestCloseAudio}
                          onSelectLanguage={this.handleListItemClickMenu}
                        />
                      </DialogContent>
                      <DialogActions>
                        <Button
                          onClick={this.handledOpenAudioManagerDialogMenu}
                          color="secondary"
                          className="jr-btn bg-grey text-white"
                        >
                          Close
                        </Button>
                      </DialogActions>
                    </Dialog>

                    <div
                      className="col-md-12 col-12"
                      data-info="This field is where you set the timeout in seconds that the menu will wait for the caller to enter in a DTMF choice..."
                      data-title="Menu Timeout "
                      onMouseEnter={this.logMouseEnter}
                      onMouseLeave={this.logMouseLeave}
                    >
                      <TextField
                        id="menu_timeout"
                        label="Menu Timeout *"
                        value={menu_timeout}
                        onChange={this.handleChange("menu_timeout")}
                        margin="normal"
                        fullWidth
                        error={scriptNameError}
                      />
                    </div>

                    <div
                      className="col-md-12 col-12"
                      data-info="This field contains the file name of the audio prompt to play when the timeout has been reached.."
                      data-title="Menu Timeout Prompt "
                      onMouseEnter={this.logMouseEnter}
                      onMouseLeave={this.logMouseLeave}
                    >
                      <TextField
                        id="menu_timeout_prompt"
                        label="Menu Timeout Prompt *"
                        onChange={this.handleChange("menu_timeout_prompt")}
                        helperText="This is where you place the content of an agent screen Script."
                        value={menu_timeout_prompt}
                        margin="normal"
                        fullWidth
                      />
                      <Button
                        color="primary"
                        className="jr-btn bg-primary text-white"
                        onClick={this.handledOpenAudioManagerDialogTimeout}
                      >
                        Select/Manage Audio
                      </Button>
                    </div>

                    <Dialog
                      maxWidth="md"
                      fullWidth={true}
                      open={this.state.audio_dialog_timeout}
                      onClose={this.handleRequestClose}
                    >
                      <DialogTitle>Audio Manager</DialogTitle>
                      <Divider />
                      <DialogContent>
                        <AudioManager
                          onClose={this.handleRequestCloseAudio}
                          onSelectLanguage={this.handleListItemClickTimeout}
                        />
                      </DialogContent>
                      <DialogActions>
                        <Button
                          onClick={this.handledOpenAudioManagerDialogTimeout}
                          color="secondary"
                          className="jr-btn bg-grey text-white"
                        >
                          Close
                        </Button>
                      </DialogActions>
                    </Dialog>

                    <div
                      className="col-md-12 col-12"
                      data-info="This field is where you define the number of times that the menu will play after the first time if no valid choice is made by the caller.."
                      data-title="Menu Invalid Prompt "
                      onMouseEnter={this.logMouseEnter}
                      onMouseLeave={this.logMouseLeave}
                    >
                      <TextField
                        id="menu_invalid_prompt"
                        label="Menu Invalid Promptt *"
                        onChange={this.handleChange("menu_invalid_prompt")}
                        helperText="This is where you place the content of an agent screen Script."
                        value={menu_invalid_prompt}
                        margin="normal"
                        fullWidth
                      />
                      <Button
                        color="primary"
                        className="jr-btn bg-primary text-white"
                        onClick={this.handledOpenAudioManagerDialogMenuInvalid}
                      >
                        Select/Manage Audio
                      </Button>
                    </div>
                    <Dialog
                      maxWidth="md"
                      fullWidth={true}
                      open={this.state.audio_dialog_menu_invalid}
                      onClose={this.handleRequestClose}
                    >
                      <DialogTitle>Audio Manager QQQ</DialogTitle>
                      <Divider />
                      <DialogContent>
                        <AudioManager
                          onClose={this.handleRequestCloseAudio}
                          onSelectLanguage={this.handleListItemClickInvalid}
                        />
                      </DialogContent>
                      <DialogActions>
                        <Button
                          onClick={
                            this.handledOpenAudioManagerDialogMenuInvalid
                          }
                          color="secondary"
                          className="jr-btn bg-grey text-white"
                        >
                          Close
                        </Button>
                      </DialogActions>
                    </Dialog>

                    <div
                      className="col-md-12 col-12"
                      data-info="This field is where you define the number of times that the menu will play after the first time if no valid choice is made by the caller."
                      data-title="Menu Repeat "
                      onMouseEnter={this.logMouseEnter}
                      onMouseLeave={this.logMouseLeave}
                    >
                      <TextField
                        id="menu_repeat"
                        label="Menu Repeat *"
                        value={menu_repeat}
                        onChange={this.handleChange("menu_repeat")}
                        margin="normal"
                        fullWidth
                        error={scriptNameError}
                      />
                    </div>

                    <div
                      className="col-md-12 col-12"
                      data-info="This field is where you can select whether to restrict the Call Menu access to the specific hours set up in the selected Call Time.."
                      data-title="Menu Time Check"
                      onMouseEnter={this.logMouseEnter}
                      onMouseLeave={this.logMouseLeave}
                    >
                      <TextField
                        id="menu_time_check"
                        select
                        label="Menu Time Checkn"
                        value={menu_time_check}
                        onChange={this.handleChange("menu_time_check")}
                        SelectProps={{}}
                        helperText="Please select field to add in script text"
                        margin="normal"
                        fullWidth
                      >
                        {option_menu_time_check.map((option, i) => (
                          <MenuItem key={i} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </div>

                    <div
                      className="col-md-12 col-12"
                      data-info="This field is where you can select whether to restrict the Call Menu access to the specific hours set up in the selected Call Time.."
                      data-title="Call Time"
                      onMouseEnter={this.logMouseEnter}
                      onMouseLeave={this.logMouseLeave}
                    >
                      <TextField
                        id="call_time_id"
                        select
                        label="Call Time"
                        value={call_time_id}
                        onChange={this.handleChange("call_time_id")}
                        SelectProps={{}}
                        margin="normal"
                        fullWidth
                      >
                        <MenuItem key="--ALL---" value="" >NONE</MenuItem>
                        {calltimeOptions &&
                          calltimeOptions.map((option, i) => (
                            <MenuItem key={i} value={option.call_time_id}>
                              {option.call_time_name}
                            </MenuItem>
                          ))}
                      </TextField>
                    </div>

                    <div
                      className="col-md-12 col-12"
                      data-info="This field is where you can select whether you want the call to be tracked in the Real-time screen as an incoming IVR type call.."
                      data-title="Track Calls In Real-Time Report"
                      onMouseEnter={this.logMouseEnter}
                      onMouseLeave={this.logMouseLeave}
                    >
                      <TextField
                        id="track_in_vdac"
                        select
                        label="Track Calls In Real-Time Reporte"
                        value={track_in_vdac}
                        onChange={this.handleChange("track_in_vdac")}
                        SelectProps={{}}
                        margin="normal"
                        fullWidth
                      >
                        {option_track_realtime_report.map((option, i) => (
                          <MenuItem key={i} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </div>

                    <div
                      className="col-md-12 col-12"
                      data-info="This field is where you can select whether you want the call to be tracked in the Real-time screen as an incoming IVR type call.."
                      data-title="Log Key Press"
                      onMouseEnter={this.logMouseEnter}
                      onMouseLeave={this.logMouseLeave}
                    >
                      <TextField
                        id="dtmf_log"
                        select
                        label="Log Key Press"
                        value={dtmf_log}
                        onChange={this.handleChange("dtmf_log")}
                        SelectProps={{}}
                        margin="normal"
                        fullWidth
                      >
                        {option_callmenu_dtf.map((option, i) => (
                          <MenuItem key={i} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </div>

                    <div
                      className="col-md-12 col-12"
                      data-info="This is the ID that you can use to track calls to this Call Menu when looking at the IVR Report. The list includes CALLMENU as the default as well as all of the In-Groups.."
                      data-title="Tracking Group"
                      onMouseEnter={this.logMouseEnter}
                      onMouseLeave={this.logMouseLeave}
                    >
                      <TextField
                        id="tracking_group"
                        select
                        label="Tracking Group"
                        value={tracking_group}
                        onChange={this.handleChange("tracking_group")}
                        SelectProps={{}}
                        margin="normal"
                        fullWidth
                      >
                        <MenuItem key="--ALL---" value="CALLMENU">
                          CALLMENU - Default
                        </MenuItem>
                        {inboundgroupoption &&
                          inboundgroupoption.map((option, i) => (
                            <MenuItem key={i} value={option.group_id}>
                              {option.group_id}
                            </MenuItem>
                          ))}
                      </TextField>
                    </div>

                    <div
                      className="col-md-12 col-12"
                      data-info="This field is where you can select whether you want the call to be tracked in the Real-time screen as an incoming IVR type call.."
                      data-title="Log Field"
                      onMouseEnter={this.logMouseEnter}
                      onMouseLeave={this.logMouseLeave}
                    >
                      <TextField
                        id="dtmf_field"
                        select
                        label="Log Field"
                        value={dtmf_field}
                        onChange={this.handleChange("dtmf_field")}
                        SelectProps={{}}
                        margin="normal"
                        fullWidth
                      >
                        <MenuItem key="--ALL---" value="---ALL---">
                          NONE
                        </MenuItem>
                        {option_logfields &&
                          option_logfields.map((option, i) => (
                            <MenuItem key={i} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                      </TextField>
                    </div>

                    <div className="col-md-12 col-12">
                      <div className="sub_menu_div" style={style_header}>
                        {" "}
                        <i
                          className="fa fa-bars"
                          style={{ marginRight: "10px" }}
                        />
                        Call Menu options
                      </div>
                    </div>

                    {this.state.glabalCallMenuObj.map((option, i) => (
                      <React.Fragment key={i}>
                        <div
                          key={i}
                          className="col-md-4 col-4"
                          data-info="This field is where you can select whether you want the call to be tracked in the Real-time screen as an incoming IVR type call.."
                          data-title="Option"
                          onMouseEnter={this.logMouseEnter}
                          onMouseLeave={this.logMouseLeave}
                        >
                          <TextField
                            id="option_value_0"
                            select
                            label="Option"
                            value={this.state.glabalCallMenuObj[i].option_value}
                            SelectProps={{}}
                            margin="normal"
                            fullWidth
                            onChange={e =>
                              this.handleChangeArray(
                                i,
                                "option_value",
                                e.target.value
                              )
                            }
                          >
                            {options_callmenu &&
                              options_callmenu.map((option, i) => (
                                <MenuItem key={i} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                          </TextField>
                        </div>

                        <div
                          className="col-md-4 col-4"
                          data-info="This field contains the file name of the audio prompt to play when the timeout has been reached.."
                          data-title="Description "
                          onMouseEnter={this.logMouseEnter}
                          onMouseLeave={this.logMouseLeave}
                        >
                          <TextField
                            id="option_description_0"
                            label="Description*"
                            onChange={e =>
                              this.handleChangeArray(
                                i,
                                "option_description",
                                e.target.value
                              )
                            }
                            value={
                              this.state.glabalCallMenuObj[i].option_description
                            }
                            margin="normal"
                            fullWidth
                          />
                        </div>

                        <div
                          className="col-md-4 col-4"
                          data-info="This field is where you can select whether you want the call to be tracked in the Real-time screen as an incoming IVR type call.."
                          data-title="Route"
                          onMouseEnter={this.logMouseEnter}
                          onMouseLeave={this.logMouseLeave}
                          style={{ marginTop: "13px" }}
                        >
                          <FormControl className="w-100 mb-2">
                            <InputLabel htmlFor="age-simple">
                              DID Route
                            </InputLabel>
                            <Select
                              value={
                                this.state.glabalCallMenuObj[i].option_route
                              }
                              input={<Input id="age-simple" />}
                              onChange={e =>
                                this.handleChangeArray(
                                  i,
                                  "option_route",
                                  e.target.value
                                )
                              }
                            >
                              {list_didRoute &&
                                list_didRoute.map((option, i) => (
                                  <MenuItem key={i} value={option.value}>
                                    {" "}
                                    {option.label}
                                  </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText />
                          </FormControl>
                        </div>
                        {this.getDynamicDrop(
                          this.state.glabalCallMenuObj[i].option_route,
                          option,
                          i
                        )}
                      </React.Fragment>
                    ))}
                  </form>
                </Fragment>
              )}
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
