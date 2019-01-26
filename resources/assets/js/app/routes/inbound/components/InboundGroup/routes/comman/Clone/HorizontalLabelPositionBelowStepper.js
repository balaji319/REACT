import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";

import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import { Card, CardBody, CardSubtitle, CardText } from "reactstrap";
import { Fragment } from "react";
import {
  React,
  Component,
  connect,
  Redirect,
  ContainerHeader,
  axios,
  classNames,
  PropTypes,
  keycode,
  Table,
  MenuItem,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  Paper,
  Checkbox,
  IconButton,
  Tooltip,
  DeleteIcon,
  Switch,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  SweetAlert,
  CircularProgress
} from "../../../../../../../../components/plugins.js";
import { next_agent_call_array, get_call_launch_array } from "./data";
import TextError from "../../../../../../../../components/common/TextError";
import { createNotification } from "../../../../../../../../Helpers";
import List from "./../InboundGroup";
import CampList from "./../AssignCampaignToGroup";
import { fetchGlobal } from "../../../../../../../../actions/Global";

class HorizontalLabelPositionBelowStepper extends React.Component {
  state = {
    activeStep: 0,
    group_id: "",
    group_name: "",
    showinfo: "Hover to the input on left and help text will come up here :)",
    showinfotitle: "Help Block",
    webForm: "",
    webForm1: "",
    groupColor: "#FFA500",
    nextAgentCall: "random",
    queuePriority: "99",
    groupScript: "NONE",
    groupscriptActiveValue: "Y",
    groupscriptActive: true,
    getcalllanunch: "NONE",
    calldrop: "",
    dropAction: "",
    dropext: "",
    voicemail: "",
    ingroup: "",
    dropcallmenu: "",
    open: false,
    groupnameError: false,
    groupidError: false,
    steperror: false,
    active_value: "Y",
    active: false,
    usergroupvalue: "",
    webformvalue: "",
    webmailvalue: "",
    nagentcall: "",
    fronterdValue: "Y",
    fronter_display: false,
    script: "",
    next_agent_call: "",
    get_call_lanuch: "",
    agents_group: [],
    script_list: [],
    queueId: "",
    global_error: false,
    global_scucess: false,
    message: "",
    inbound_data: [],
    new_group_name: "",
    new_group_nameError: false
  };

  handleNext = () => {
    let $this = this;
    const { activeStep } = this.state;
    let group_id = this.state.group_id;
    let group_name = this.state.group_name;
    let steperrorr = false;

    if (activeStep === 0) {
      group_id == ""
        ? (this.setState({ groupidError: true }), (steperrorr = true))
        : this.setState({ groupidError: false });
      group_name == ""
        ? (this.setState({ groupnameError: true }), (steperrorr = true))
        : this.setState({ groupnameError: false });
    }

    if (!steperrorr && activeStep === 0) {
      let postData = {
        group_id: this.state.new_group_name,
        group_name: this.state.group_name,
        from_inbound_id: this.state.group_id
      };

      axios
        .post("/api/inbound-queue-clone", postData)
        .then(response => {
          console.log("VVVVVVVVV++++++++");
          console.log(response);
          // createNotification("Success","Success",response.data.message)

          $this.setState({
            isLoading: false,
            inbound_data: response.data.data
          });

          this.setState({ activeStep: activeStep + 1 });
        })
        .catch(function(error) {
          createNotification("Error", "Error", error.response.data.msg);
          //  $this.setState({global_error:true,message:error.response.msg})
        });
    }
    if (!steperrorr && activeStep === 1) {
      this.setState({ activeStep: activeStep + 1 });
    }
  };

  handeluniqueId = id => e => {
    let postData = { group_id: id };
    axios.post("/api/inbound/uniqueId", postData).then(response => {});
  };
  componentDidMount() {
    this.props.fetchGlobal(["agentgroup", "inboundgroupoption"]);
  }
  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      agents_group: nextPropsFromRedux.Global.inboundgroupoption
        ? nextPropsFromRedux.Global.inboundgroupoption
        : []
    });
  }

  saveFirstStep = () => e => {
    alert("aaaa");

    /* axios.post('/api/add-inbound-queue',postData)
                .then(response => {


                })*/
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  handleBack = () => {
    const { activeStep } = this.state;
    this.setState({
      activeStep: activeStep - 1
    });
  };

  handleReset = () => {
    this.setState({
      activeStep: 0
    });
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  handleColorChange = ({ hex }) => {
    this.setState({ groupColor: hex });
  };

  handleActiveChange = (event, checked) => {
    this.setState({ active: checked });
    this.setState({ active_value: checked ? "Y" : "N" });
  };

  handlefronterActiveChange = (event, checked) => {
    this.setState({ fronter_display: checked });
    this.setState({ fronterdValue: checked ? "Y" : "N" });
  };

  getSteps = () => {
    return [
      "Inbound Queues Listing",
      "Agent Ranks For Inbound Group",
      "Campaign Queues"
    ];
  };

  getStepContent = stepIndex => {
    switch (stepIndex) {
      case 0:
        return this.getAccountInformation();
      case 1:
        return this.getPersonalInformation();
      case 2:
        return this.getPaymentInformation();
      case 3:
        return this.getConfirmation();

      default:
        return "Uknown stepIndex";
    }
  };

  getAccountInformation = () => {
    const {
      group_id,
      group_name,
      groupnameError,
      groupidError,
      active_value,
      active,
      usergroupvalue,
      webformvalue,
      webmailvalue,
      nagentcall,
      fronterdValue,
      fronter_display,
      next_agent_call,
      script,
      get_call_lanuch,
      Voicemail,
      agents_group,
      script_list,
      new_group_name,
      new_group_nameError
    } = this.state;

    console.log(agents_group);
    return (
      <div className="container-fluid" style={{ display: "flex" }}>
        <div className="col-md-12">
          <div className="row">
            <div className="col-md-12">
              <div className="form-group">
                <FormControl className="w-100 mb-2">
                  <InputLabel htmlFor="age-helper">
                    {" "}
                    From Inbound Group ID
                  </InputLabel>
                  <Select
                    value={group_id}
                    onChange={this.handleChange("group_id")}
                    input={<Input id="age-helper" />}
                  >
                    {agents_group &&
                      agents_group.map((n, index) => (
                        <MenuItem key={index} value={n.group_id}>
                          {n.group_id}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </div>
            </div>
            <div className="col-md-12">
              <div className="form-group">
                <TextField
                  id="new_group_name"
                  label="New Inbound Group ID"
                  type="text"
                  onChange={this.handleChange("new_group_name")}
                  margin="normal"
                  value={new_group_name}
                  error={new_group_nameError}
                  fullWidth
                />
              </div>
            </div>
            <div className="col-md-12">
              <div className="form-group">
                <TextField
                  id="group_name"
                  label="Group Name"
                  type="text"
                  onChange={this.handleChange("group_name")}
                  margin="normal"
                  value={group_name}
                  error={groupnameError}
                  fullWidth
                />
              </div>
            </div>
          </div>
          <div className="row" />
        </div>
      </div>
    );
  };

  getPersonalInformation = () => {
    return (
      <Fragment>
        <div className="col-md-12" style={{ width: "100%" }}>
          <List
            group_id={this.state.new_group_name}
            inbound_data={this.state.inbound_data}
          />
        </div>
      </Fragment>
    );
  };
  getPaymentInformation = () => {
    return (
      <div className="tab-pane" id="tab2-3">
        <div className="col-md-12">
          <CampList group_id={this.state.new_group_name} />
        </div>
      </div>
    );
  };

  getConfirmation = () => {
    return (
      <div className="tab-pane" id="tab2-4">
        <h3 className="title text-primary">Terms and Conditions</h3>
        <p>
          <strong>Lorem</strong> Ipsum is simply dummy text of the printing and
          typesetting industry. Lorem Ipsum has been the industry's standard
          dummy text ever since the 1500s, when an unknown printer took a galley
          of type and scrambled it to make a type specimen book. It has survived
          not only five centuries, but also the leap into electronic
          typesetting, remaining essentially unchanged.
        </p>
        <div className="d-flex align-items-center">
          <Checkbox color="primary" />{" "}
          <span>I agree with the Terms and Conditions.</span>
        </div>
      </div>
    );
  };

  render() {
    const steps = this.getSteps();
    const { activeStep, global_error, global_scucess, message } = this.state;

    return (
      <div className="w-100">
        {(global_error || global_scucess) && (
          <TextError
            Type={global_error ? "alert-danger" : "alert-success"}
            msg={message}
          />
        )}

        <Stepper
          activeStep={activeStep}
          alternativeLabel
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
                <StepLabel className="stepperlabel">{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        <Fragment>
          {this.state.activeStep === steps.length ? (
            <div>
              <Typography className="my-2">
                All steps completed - you&quot;re finished
              </Typography>
              <Button onClick={this.handleReset}>Reset</Button>
            </div>
          ) : (
            <Fragment>
              {this.getStepContent(activeStep)}
              <div className="col-sm-12 col-lg-12 col-md-12">
                <Button
                  disabled={activeStep === 0}
                  onClick={this.handleBack}
                  className="mr-2"
                >
                  Back
                </Button>
                <Button
                  style={{ float: "right" }}
                  variant="raised"
                  color="primary"
                  onClick={this.handleNext}
                >
                  {activeStep === steps.length - 1 ? "Finish" : "Next"}
                </Button>
                {this.state.name}
              </div>
            </Fragment>
          )}
        </Fragment>
        {(this.state.isLoading || this.props.Global.isLoading) && (
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
    Global: state.globel
  };
}

const mapDispatchToProps = {
  fetchGlobal
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HorizontalLabelPositionBelowStepper);
