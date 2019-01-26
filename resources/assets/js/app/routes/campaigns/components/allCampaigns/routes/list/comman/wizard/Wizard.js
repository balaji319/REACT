import React from "react";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepButton from "@material-ui/core/StepButton";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import CardBox from "../../../../../../../../../components/CardBox/index";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import TextField from "@material-ui/core/TextField";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Input from "@material-ui/core/Input";
import { fetchGlobal } from "../../../../../../../../../actions/Global";
import TextError from "../../../../../../../../../components/common/TextError";
import {
  API_CAMPAIGN_WIZARD,
  API_CAMPAIGN_WIZARD_DATA_LIST
} from "../../../../../../constants/";
import axios from "axios";
import { connect } from "react-redux";
import { Route, withRouter } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";
import { listAmd, listCampRecor, listCallback, listPause } from "./data";

function getSteps() {
  return ["Step 1", "Step 2", "Step 3"];
}

class Clone extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  state = {
    activeStep: 0,
    completed: {},
    selected_list_id: "",
    list_id: "",
    listError: false,
    selectListError: false,
    agents_group: [],
    sucsess_msg: "",
    error_msg_user: "",
    inprocess: false,
    error_msg: "",
    camp_id: "",
    camp_type: "",
    camp_typeError: false,
    camp_idError: false,
    camp_name: "",
    camp_nameError: false,
    camp_cid_list: [],
    auto_dial_limit: [],
    allshifts: [],
    camp_cid: "",
    camp_cidError: false,
    autodail: "",
    camp_lst: "",
    camp_amd: "",
    camp_callr: "",
    camp_script: "",
    camp_mycallback: "",
    camp_pause: "",
    camp_caller_cid: "",
    camp_caller_cidError: false,
    allshifts: [],
    shift_id: "",
    amd_id: "",
    camp_record_id: "NEVER",
    listscript: [],
    script_id: "",
    my_callback_id: "",
    agent_pause_id: "",
    cloneError: false
  };
  totalSteps = () => {
    return getSteps().length;
  };
  handleNext = () => {
    let activeStep;

    let isError = false;
    //this.state.list_id =='' ? (this.setState({listError:true }),isError =true) :this.setState({listError:false });

    this.state.camp_type == ""
      ? (this.setState({ camp_typeError: true }), (isError = true))
      : this.setState({ camp_typeError: false });
    this.state.camp_id == ""
      ? (this.setState({ camp_idError: true }), (isError = true))
      : this.setState({ camp_idError: false });
    this.state.camp_name == ""
      ? (this.setState({ camp_nameError: true }), (isError = true))
      : this.setState({ camp_nameError: false });
    this.state.camp_caller_cid == ""
      ? (this.setState({ camp_caller_cidError: true }), (isError = true))
      : this.setState({ camp_caller_cidError: false });

    if (!isError) {
      alert("ok");

      if (this.isLastStep() && !this.allStepsCompleted()) {
        const steps = getSteps();
        activeStep = steps.findIndex((step, i) => !(i in this.state.completed));
      } else {
        activeStep = this.state.activeStep + 1;
      }
      this.setState({
        activeStep
      });
    }
  };
  handleBack = () => {
    const { activeStep } = this.state;
    this.setState({
      activeStep: activeStep - 1
    });
  };
  handleStep = step => () => {
    let isError = false;
    this.state.list_id == ""
      ? (this.setState({ listError: true }), (isError = true))
      : this.setState({ listError: false });

    this.state.selected_list_id == ""
      ? (this.setState({ selectListError: true }), (isError = true))
      : this.setState({ selectListError: false });

    if (!isError) {
      this.setState({ activeStep: step });
    }
  };
  handleComplete = () => {
    const { completed } = this.state;
    completed[this.state.activeStep] = true;
    this.setState({
      completed
    });
    this.handleNext();
  };
  handleReset = () => {
    this.setState({
      activeStep: 0,
      completed: {}
    });
  };

  completedSteps() {
    return Object.keys(this.state.completed).length;
  }

  isLastStep() {
    return this.state.activeStep === this.totalSteps() - 1;
  }

  allStepsCompleted() {
    return this.completedSteps() === this.totalSteps();
  }

  // componentWillMount(){

  //     let $this = this;
  //     axios.get('/api/get-agentgroup-list').then(response=>{
  //         let group = response.data.group;
  //         $this.setState({
  //             groups:response.data.groups,
  //         })
  //         console.log(response);
  //     }).catch(error =>{
  //         console.log(error);
  //     })
  // }

  cloneAgentGroup = () => {
    let $this = this;

    $this.setState({ sucsess_msg: "", error_msg: "", inprocess: true });

    let formdata = {
      campaign_id: this.state.camp_id,
      campaign_name: this.state.camp_name,
      campaign_cid: this.state.camp_caller_cid,
      auto_dial_level: this.state.autodail,
      local_call_time: this.state.shift_id,
      campaign_vdad_exten: this.state.amd_id,
      campaign_recording: this.state.camp_record_id,
      campaign_script: this.state.script_id,
      agent_pause_codes_active: this.state.agent_pause_id,
      campaign_allow_inbound: this.state.camp_type
    };

    if (this.checkvalidation()) {
      axios
        .post(API_CAMPAIGN_WIZARD, formdata)
        .then(response => {
          $this.setState({
            sucsess_msg: response.data.message,
            inprocess: false
          });
        })
        .catch(function(error) {
          $this.setState({ inprocess: false });
          if (error.response.status == 400) {
            console.log(error.response);
            $this.setState({ error_msg: error.response.data.message });
          }
        });
    } else {
      $this.setState({
        error_msg: "Somthing Went Wrong !!!!! All filds are required"
      });
      $this.setState({ inprocess: false });
    }
  };

  checkvalidation = () => {
    this.state.camp_type == ""
      ? this.setState({ cloneError: true })
      : this.setState({ cloneError: false });
    this.state.camp_id == ""
      ? this.setState({ cloneError: true })
      : this.setState({ cloneError: false });
    this.state.camp_name == ""
      ? this.setState({ cloneError: true })
      : this.setState({ cloneError: false });
    this.state.camp_caller_cid == ""
      ? this.setState({ cloneError: true })
      : this.setState({ cloneError: false });
    this.state.autodail == ""
      ? this.setState({ cloneError: true })
      : this.setState({ cloneError: false });
    this.state.shift_id == ""
      ? this.setState({ cloneError: true })
      : this.setState({ cloneError: false });
    this.state.amd_id == ""
      ? this.setState({ cloneError: true })
      : this.setState({ cloneError: false });
    this.state.camp_record_id == ""
      ? this.setState({ cloneError: true })
      : this.setState({ cloneError: false });
    this.state.script_id == ""
      ? this.setState({ cloneError: true })
      : this.setState({ cloneError: false });
    this.state.agent_pause_id == ""
      ? this.setState({ cloneError: true })
      : this.setState({ cloneError: false });

    if (this.state.cloneError) {
      return false;
    } else {
      return true;
    }
  };

  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      agents_group: nextPropsFromRedux.Global.campaigns
        ? nextPropsFromRedux.Global.campaigns
        : ""
    });
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  componentDidMount() {
    this.props.fetchGlobal(["cam"]);

    this.setState({ list_id: Math.floor(10000000 + Math.random() * 90000000) });
    this.getWizardData();
  }

  getWizardData = () => {
    axios
      .get(API_CAMPAIGN_WIZARD_DATA_LIST)
      .then(response => {
        console.log("----------------");
        console.log(response);
        let camp_cid_list = response.data.data.alldids;
        let auto_dial_limit = response.data.data.auto_dial_limit;
        let allshifts = response.data.data.allshifts;
        let allscript = response.data.data.allscript;

        this.setState({
          camp_cid_list: camp_cid_list,
          allshifts: allshifts,
          auto_dial_limit: auto_dial_limit,
          listscript: allscript
        });
        // $this.setState({sucsess_msg:'Campaign cloned successfully',inprocess:false})
      })
      .catch(function(error) {
        //  $this.setState({error_msg_user:error.response.data.msg.campaign_id,error_msg:'true',inprocess:false})
      });
  };

  handleTextChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  render() {
    const steps = getSteps();
    const {
      activeStep,
      selected_list_id,
      inprocess,
      error_msg,
      error_msg_user,
      selectListError,
      sucsess_msg,
      list_id,
      selectedListError,
      listError,
      agents_group,
      camp_id,
      camp_type,
      camp_idError,
      camp_name,
      camp_nameError,
      camp_cid,
      camp_cidError,
      autodail,
      camp_lst,
      camp_amd,
      camp_callr,
      camp_cid_list,
      auto_dial_limit,
      allshifts,
      amd_id,
      shift_id,
      camp_script,
      camp_mycallback,
      camp_pause,
      camp_typeError,
      camp_caller_cid,
      camp_caller_cidError,
      camp_record_id,
      listscript,
      script_id,
      my_callback_id,
      agent_pause_id
    } = this.state;

    console.log("{}}}}}}}}}}}}");
    console.log(error_msg);

    return (
      <div className="w-100">
        {error_msg &&
          sucsess_msg == "" && (
            <TextError Type="alert-danger" msg={error_msg} />
          )}
        {sucsess_msg != "" &&
          !error_msg && <TextError Type="alert-success" msg={sucsess_msg} />}
        <Stepper
          nonLinear
          activeStep={activeStep}
          className="horizontal-stepper-linear"
        >
          {steps.map((label, index) => {
            return (
              <Step
                key={label}
                className={`horizontal-stepper ${
                  index === activeStep ? "active" : ""
                }`}
              >
                <StepButton
                  className="stepperbutton"
                  onClick={this.handleStep(index)}
                  completed={this.state.completed[index]}
                >
                  {label}
                </StepButton>
              </Step>
            );
          })}
        </Stepper>
        <div>
          {this.allStepsCompleted() ? (
            <div>
              <Typography className="my-2">
                All steps completed - you&quot;re finished
              </Typography>
              <Button className="jr-btn" onClick={this.handleReset}>
                Reset
              </Button>
            </div>
          ) : (
            <div>
              {activeStep == 0 ? (
                <CardBox styleName="col-lg-12" heading="Campaign ">
                  <form className="row" noValidate autoComplete="off">
                    <div className="col-lg-12 col-sm-12 col-12">
                      <FormControl className="w-100 mb-2">
                        <InputLabel htmlFor="age-simple">
                          Campaign Type
                        </InputLabel>
                        <Select
                          value={camp_type}
                          onChange={this.handleTextChange("camp_type")}
                          input={<Input id="age-simple" />}
                          defaultValue="outbound"
                          error={camp_typeError}
                        >
                          <MenuItem key="outbound" value="outbound">
                            {" "}
                            Outbound
                          </MenuItem>
                          <MenuItem key="inbound" value="inbound">
                            {" "}
                            Inbound
                          </MenuItem>
                        </Select>
                        <FormHelperText>Campaign Type.</FormHelperText>
                      </FormControl>
                    </div>
                    <div className="col-lg-12 col-sm-12 col-12">
                      <FormControl className="w-100 mb-2" error>
                        <TextField
                          margin="dense"
                          id="list_id"
                          label="Campaign ID*"
                          type="text"
                          fullWidth
                          value={camp_id}
                          onChange={this.handleTextChange("camp_id")}
                          helperText="This is your new Campaign ID."
                          error={camp_idError}
                        />
                      </FormControl>
                    </div>
                    <div className="col-lg-12 col-sm-12 col-12">
                      <FormControl className="w-100 mb-2" error>
                        <TextField
                          margin="dense"
                          id="list_id"
                          label="Campaign Name*"
                          type="text"
                          fullWidth
                          value={camp_name}
                          onChange={this.handleTextChange("camp_name")}
                          helperText="This is your new Campaign Name."
                          error={camp_nameError}
                        />
                      </FormControl>
                    </div>
                    <div className="col-lg-12 col-sm-12 col-12">
                      <FormControl className="w-100 mb-2">
                        <InputLabel htmlFor="age-simple">
                          Campaign Caller ID*
                        </InputLabel>
                        <Select
                          value={camp_caller_cid}
                          onChange={this.handleTextChange("camp_caller_cid")}
                          input={<Input id="age-simple" />}
                          error={camp_caller_cidError}
                        >
                          {camp_cid_list &&
                            camp_cid_list.map(option => (
                              <MenuItem
                                key={option.did_pattern}
                                value={option.did_pattern}
                              >
                                {" "}
                                {option.did_pattern} - {option.option_title}
                              </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>Campaign Caller ID*.</FormHelperText>
                      </FormControl>
                    </div>
                  </form>
                </CardBox>
              ) : activeStep == 1 ? (
                <CardBox styleName="col-lg-12" heading=" Campaign">
                  <form className="row" noValidate autoComplete="off">
                    <div className="col-md-12 col-12">
                      <FormControl className="w-100 mb-2">
                        <InputLabel htmlFor="age-simple">
                          Auto Dial Level *{" "}
                        </InputLabel>
                        <Select
                          value={autodail}
                          onChange={this.handleTextChange("autodail")}
                          input={<Input id="age-simple" />}
                        >
                          {auto_dial_limit &&
                            auto_dial_limit.map(option => (
                              <MenuItem key={option} value={option}>
                                {" "}
                                {option}
                              </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>Campaign Caller ID*.</FormHelperText>
                      </FormControl>
                    </div>
                    <div className="col-md-12 col-12">
                      <FormControl className="w-100 mb-2">
                        <InputLabel htmlFor="age-simple">
                          Local Call Time *{" "}
                        </InputLabel>
                        <Select
                          value={shift_id}
                          onChange={this.handleTextChange("shift_id")}
                          input={<Input id="age-simple" />}
                        >
                          {allshifts &&
                            allshifts.map(option => (
                              <MenuItem
                                key={option.call_time_id}
                                value={option.call_time_id}
                              >
                                {" "}
                                {option.call_time_name}
                              </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>Campaign Caller ID*.</FormHelperText>
                      </FormControl>
                    </div>
                    <div className="col-md-12 col-12">
                      <FormControl className="w-100 mb-2">
                        <InputLabel htmlFor="age-simple">
                          {" "}
                          Answering Machine Detection{" "}
                        </InputLabel>
                        <Select
                          value={amd_id}
                          onChange={this.handleTextChange("amd_id")}
                          input={<Input id="age-simple" />}
                          error={camp_caller_cidError}
                        >
                          {listAmd &&
                            listAmd.map(option => (
                              <MenuItem key={option.id} value={option.id}>
                                {" "}
                                {option.name}
                              </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>Campaign Caller ID*.</FormHelperText>
                      </FormControl>
                    </div>
                  </form>
                </CardBox>
              ) : (
                <CardBox styleName="col-lg-12" heading=" Campaign">
                  <form className="row" noValidate autoComplete="off">
                    <div className="col-md-12 col-12">
                      <FormControl className="w-100 mb-2">
                        <InputLabel htmlFor="age-simple">
                          Campaign Recording *{" "}
                        </InputLabel>
                        <Select
                          value={camp_record_id}
                          onChange={this.handleTextChange("camp_record_id")}
                          input={<Input id="age-simple" />}
                        >
                          {listCampRecor &&
                            listCampRecor.map(option => (
                              <MenuItem key={option} value={option}>
                                {" "}
                                {option}
                              </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>Campaign Caller ID*.</FormHelperText>
                      </FormControl>
                    </div>
                    <div className="col-md-12 col-12">
                      <FormControl className="w-100 mb-2">
                        <InputLabel htmlFor="age-simple">Script * </InputLabel>
                        <Select
                          value={script_id}
                          onChange={this.handleTextChange("script_id")}
                          input={<Input id="age-simple" />}
                        >
                          {listscript &&
                            listscript.map(option => (
                              <MenuItem
                                key={option.script_id}
                                value={option.script_id}
                              >
                                {" "}
                                {option.script_name}
                              </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>Campaign Caller ID*.</FormHelperText>
                      </FormControl>
                    </div>
                    <div className="col-md-12 col-12">
                      <FormControl className="w-100 mb-2">
                        <InputLabel htmlFor="age-simple">
                          {" "}
                          My Callback
                        </InputLabel>
                        <Select
                          value={my_callback_id}
                          onChange={this.handleTextChange("my_callback_id")}
                          input={<Input id="age-simple" />}
                          error={camp_caller_cidError}
                        >
                          {listCallback &&
                            listCallback.map(option => (
                              <MenuItem key={option.id} value={option.id}>
                                {" "}
                                {option.name}
                              </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>Campaign Caller ID*.</FormHelperText>
                      </FormControl>
                    </div>
                    <div className="col-md-12 col-12">
                      <FormControl className="w-100 mb-2">
                        <InputLabel htmlFor="age-simple">
                          {" "}
                          Agent Pause Code{" "}
                        </InputLabel>
                        <Select
                          value={agent_pause_id}
                          onChange={this.handleTextChange("agent_pause_id")}
                          input={<Input id="age-simple" />}
                          error={camp_caller_cidError}
                        >
                          {listPause &&
                            listPause.map(option => (
                              <MenuItem key={option.id} value={option.id}>
                                {" "}
                                {option.name}
                              </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>Campaign Caller ID*.</FormHelperText>
                      </FormControl>
                    </div>
                  </form>
                </CardBox>
              )}
              {this.state.agents_group == "" && (
                <div className="loader-view" id="loader-view">
                  <CircularProgress />
                </div>
              )}

              <div>
                <Button
                  variant="raised"
                  color="primary"
                  onClick={activeStep === 0 ? this.handleNext : this.handleBack}
                  className="jr-btn"
                  disabled={
                    this.state.agents_group == "" || inprocess ? true : false
                  }
                >
                  {activeStep == 0 ? "Next" : "Previous"}
                </Button>

                {activeStep === 1 && (
                  <Button
                    variant="raised"
                    color="primary"
                    onClick={this.handleNext}
                    className="jr-btn"
                    disabled={
                      this.state.agents_group == "" || inprocess ? true : false
                    }
                  >
                    {"Next"}
                  </Button>
                )}

                <Button
                  onClick={this.props.close}
                  variant="raised"
                  style={{ float: "right", marginLeft: "10px" }}
                  className="jr-btn bg-grey text-white"
                >
                  Close
                </Button>
                {activeStep == 2 ? (
                  <Button
                    className="jr-btn"
                    variant="raised"
                    color="primary"
                    onClick={this.cloneAgentGroup}
                    disabled={
                      this.state.user_group == "" ||
                      this.state.selected_user_group == "" ||
                      inprocess
                        ? true
                        : false
                    }
                  >
                    {inprocess ? "Cloning ....... " : "Start Cloning"}
                  </Button>
                ) : (
                  ""
                )}
              </div>
            </div>
          )}
        </div>
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
  )(Clone)
);
