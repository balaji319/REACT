import React from "react";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepButton from "@material-ui/core/StepButton";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import CardBox from "../../../../../../components/CardBox/index";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import TextField from "@material-ui/core/TextField";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Input from "@material-ui/core/Input";
import Tooltip from "@material-ui/core/Tooltip";
import { connect } from "react-redux";
import IconButton from "@material-ui/core/IconButton";
import TextError from "../../../../../../components/common/TextError";
import { fetchGlobal } from "../../../../../../actions/Global";
import { fetchCampaignList } from "../../../../reports/actions/";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
  API_CLONE_PAUSE_CODE,
  API_CLONE_AREA_CODE,
  API_CLONE_STATUS_CODE,
  API_CLONE_PRESET_CODE
} from "./../../../constants/";

import MultipeDropdownCampaigns from "./MultipeDropdownCampaigns";
import axios from "axios";

class Clone extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  state = {
    sucsess_msg: "",
    success: false,
    error: false,
    u_single_records: [],
    campaigns_group: [],
    src_campaign_id: "",
    dest_campaign_ids: [],
    campaignList: [],
    src_campaign_idError: false,
    campaignsGroups: ["-"],
    error_msg: "",
    success_msg: "",
    is_Loding: false
  };

  componentDidMount() {
    this.props.fetchGlobal(["cam"]);
    this.props.fetchCampaignList();
  }

  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      campaigns_group: nextPropsFromRedux.Global.campaigns
        ? nextPropsFromRedux.Global.campaigns
        : "",
      campaignList: nextPropsFromRedux.campaignList.data
    });
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  handleTextChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };
  setSelectOptions = (name, value) => {
    this.setState({
      [name]: value
    });

    console.log(this.state.campaignsGroups);
  };

  cloneRecord = () => {
    let $this = this;
    let src_campaign_id = this.state.src_campaign_id;
    let campaignsGroups = this.state.campaignsGroups;
    let error = this.state.error;

    src_campaign_id == ""
      ? (this.setState({
          src_campaign_idError: true,
          error_msg: "all Filelds are required",
          error: true
        }),
        (error = true))
      : this.setState({ src_campaign_idError: false, error: false });
    campaignsGroups == "-"
      ? (this.setState({
          error_msg: "all Filelds are required",
          error: true
        }),
        (error = true))
      : this.setState({ error: false });

    if (!error) {
      this.setState({ success: false, error: false, is_Loding: true });
      let data = {
        from_campaign: src_campaign_id,
        to_campaigns: campaignsGroups
      };

      let URL = this.getType();
      axios
        .post(URL, data)
        .then(response => {
          // let group = response.data.group;
          this.setState({
            success: true,
            success_msg: response.data.msg,
            is_Loding: false
          });
        })
        .catch(error => {
          //let flag = 0;
          this.setState({
            error: true,
            error_msg: error.response.data.msg,
            is_Loding: false
          });
        });
    }
  };

  getType = () => {
    let url_type = "";
    switch (this.props.type) {
      case "PauseCode":
        url_type = API_CLONE_PAUSE_CODE;
        break;
      case "AreaCode":
        url_type = API_CLONE_AREA_CODE;
        break;
      case "Status":
        url_type = API_CLONE_STATUS_CODE;
        break;
      case "Presets":
        url_type = API_CLONE_PRESET_CODE;
        break;

      default:
        url_type = "";
    }
    return url_type;
  };

  render() {
    const {
      success,
      error,
      error_msg,
      success_msg,
      campaigns_group,
      src_campaign_id,
      dest_campaign_ids,
      campaignsGroups,
      campaignList,
      src_campaign_idError
    } = this.state;

    return (
      <div className="w-100">
        <div>
          <div>
            {error && <TextError Type="alert-danger" msg={error_msg} />}
            {success && <TextError Type="alert-success" msg={success_msg} />}
            <div>
              <CardBox styleName="col-lg-12" heading=" ">
                <div className="form-group">
                  <div className="col-sm-12">
                    <FormControl className="w-100 mb-2">
                      <InputLabel htmlFor="age-simple">
                        From Campaign ID *
                      </InputLabel>
                      <Select
                        onChange={this.handleChange("src_campaign_id")}
                        value={src_campaign_id}
                        error={src_campaign_idError}
                        input={<Input id="age-simple" />}
                      >
                        {campaigns_group &&
                          campaigns_group.map(option => (
                            <MenuItem
                              key={option.campaign_id}
                              value={option.campaign_id}
                            >
                              {" "}
                              {option.campaign_id} - {option.campaign_name}
                            </MenuItem>
                          ))}
                      </Select>
                      <FormHelperText />
                    </FormControl>
                  </div>
                </div>
                <div className="form-group">
                  <div className="col-sm-12">
                    <FormControl className="w-100 mb-2">
                      <MultipeDropdownCampaigns
                        label={"Campaigns Groups"}
                        options={campaignList}
                        onChange={this.setSelectOptions}
                        name={"campaignsGroups"}
                        default={"-"}
                        selectedValue={campaignsGroups}
                      />
                    </FormControl>
                  </div>
                </div>
              </CardBox>
            </div>
            <div>
              <Button
                onClick={this.props.close}
                variant="raised"
                style={{ float: "right", marginLeft: "10px" }}
                className="jr-btn bg-grey text-white"
              >
                Close
              </Button>
              <Button
                className="jr-btn"
                variant="raised"
                color="primary"
                style={{ float: "right" }}
                onClick={this.cloneRecord}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
        {(this.props.Global.isLoading || this.state.is_Loding) && (
          <div className="loader-view" id="loader-view">
            <CircularProgress />
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    Agent: state.agent,
    Global: state.globel,
    campaignList: state.campaign_list
  };
}

const mapDispatchToProps = { fetchGlobal, fetchCampaignList };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Clone);
