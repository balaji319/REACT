import React from "react";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepButton from "@material-ui/core/StepButton";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import CardBox from "../../../../../../../../components/CardBox/index";
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
import TextError from "../../../../../../../../components/common/TextError";
import { fetchGlobal } from "../../../../../../../../actions/Global";
import axios from "axios";
import Switch from "@material-ui/core/Switch";
import CircularProgress from "@material-ui/core/CircularProgress";
const single_items_data = [
  {
    campaign_id: "",
    status: "",
    attempt_delay: "",
    attempt_maximum: "",
    active: "Y"
  }
];
class New extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  state = {
    source_agent: "",
    source_agentError: false,
    list_id: "",
    agents: [],
    agent_name: "",
    agentnameError: false,
    agent_id: "",
    agent_password: "",
    agentError: false,
    agentpasswordError: false,
    agent_password: "",
    error: false,
    error_msg: false,
    error_msg_user: "",
    error_msg_pass: "",
    sucsess_msg: "",
    single_items_data: single_items_data,
    success: false,
    error: false,
    agents_group: [],
    u_single_records: [],
    statusLlist: []
  };

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

  cloneAgent = () => {
    let $this = this;

    let agent_name = this.state.agent_name;
    let agent_id = this.state.agent_id;
    let agent_password = this.state.agent_password;
    let source_agent = this.state.source_agent;
    let error = this.state.error;

    agent_name == ""
      ? (this.setState({ agentnameError: true }), (error = true))
      : this.setState({ agentnameError: false });
    agent_id == ""
      ? (this.setState({ agentError: true }), (error = true))
      : this.setState({ agentError: false });
    agent_password == ""
      ? (this.setState({ agentpasswordError: true }), (error = true))
      : this.setState({ agentpasswordError: false });
    source_agent == ""
      ? (this.setState({ selectedListError: true }), (error = true))
      : this.setState({ selectedListError: false });

    if (!error) {
      let data = {
        from_agent: source_agent,
        full_name: agent_name,
        user: agent_id,
        pass: agent_password
      };

      axios
        .post("/api/clone-agent", data)
        .then(response => {
          // let group = response.data.group;
          this.setState({ sucsess_msg: response.data.message });
        })
        .catch(error => {
          //let flag = 0;
          this.setState({
            error_msg_user: error.response.data.msg.user,
            error_msg: true,
            error_msg_pass: error.response.data.msg.pass
          });
        });
    }
  };
  componentDidMount() {
    this.props.fetchGlobal(["cam"]);
    this.getAllStatus();
  }

  getAllStatus = () => {
    let _this = this;
    this.setState({ isLoading: true });
    axios
      .get("api/campaign-mix-options-lists?campaign_id=040588&&list=false")
      .then(response => {
        _this.setState({
          statusLlist: response.data.data.dial_status,
          isLoading: false
        });
      })
      .catch(function(error) {
        _this.setState({
          alertTitle: ERROR,
          alertContent: ERROR_MSG,
          showAlert: true,
          isLoading: false
        });
      });
  };

  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      agents_group: nextPropsFromRedux.Global.campaigns
        ? nextPropsFromRedux.Global.campaigns
        : ""
    });
  }
  handleChangerow(index, dataType, value, data) {
    let this_ = this;
    var datata = this_.state.u_single_records;
    var temp_array = [];
    if (dataType == "active") {
      console.log(value);
      value = value == "Y" ? "N" : "Y";
    }

    const newState = this.state.single_items_data.map((item, i) => {
      if (i == index) {
        temp_array = datata.filter(company => company.status != item.status);
        temp_array.push({ ...item, [dataType]: value });
        return { ...item, [dataType]: value };
      }
      return item;
    });

    this.setState({
      single_items_data: newState,
      u_single_records: temp_array,
      is_change: true
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

  addStatusHandler = () => {
    let _this = this;
    let u_single_records = this.state.u_single_records;
    this.setState({ isLoading: true });
    axios
      .post("/api/add-lead-recycle", u_single_records[0])
      .then(response => {
        //createNotification("Success", "Success", response.data.message);
        _this.setState({ isLoading: false });
        _this.setState({ success: true });
        //this.getAllData();
      })
      .catch(function(error) {
        //createNotification("Error", "Error", "Somthing Went Wrong !!!!");
        _this.setState({
          isLoading: false,
          statusNameError: true,
          error: true,
          error_msg: error.response.data.msg
        });
      });
  };
  addPauseCodes = () => {
    console.log("+++++++++++");
    console.log(this.state.single_items_data);
    let status = this.state.single_items_data[0].status;
    let status_name = this.state.single_items_data[0].status_name;
    let temp_error = false;

    status != ""
      ? this.setState({ statusError: false, error: false })
      : (this.setState({ statusError: true, error: true }),
        (temp_error = true));
    status_name != ""
      ? this.setState({ statusNameError: false, error: false })
      : (this.setState({ statusNameError: true, error: true }),
        (temp_error = true));

    if (!temp_error) {
      this.addStatusHandler();
    }
  };

  render() {
    const { statusLlist } = this.state;
    const divStyle = { padding: "4px 30px 4px 24px", textAlign: "center" };
    var data_style = { borderColor: "#ced4da" };
    console.log("+++++++++++");
    console.log(this.state.single_items_data);
    let listSItems = this.state.single_items_data.map((item, i) => {
      return (
        <div key={i}>
          <div className="form-group">
            <div className="col-sm-12">
              <FormControl className="w-100 mb-2">
                <InputLabel htmlFor="age-simple">From Campaign ID</InputLabel>
                <Select
                  onChange={e =>
                    this.handleChangerow(i, "campaign_id", e.target.value)
                  }
                  value={item.campaign_id}
                  input={<Input id="age-simple" />}
                >
                  {this.state.agents_group &&
                    this.state.agents_group.map(option => (
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
                <InputLabel htmlFor="age-simple">Status</InputLabel>
                <Select
                  onChange={e =>
                    this.handleChangerow(i, "status", e.target.value)
                  }
                  value={item.status}
                  input={<Input id="age-simple" />}
                >
                  {statusLlist &&
                    statusLlist.map((r, i) => {
                      return (
                        <option key={r.status} value={r.status}>
                          {r.option_title}
                        </option>
                      );
                    })}
                  ))}
                </Select>
                <FormHelperText />
              </FormControl>
            </div>
          </div>
          <div className="form-group">
            <div className="col-sm-12">
              <FormControl className="w-100 mb-2">
                <TextField
                  margin="dense"
                  id="user_group"
                  label="Attempt Delay"
                  type="text"
                  fullWidth
                  value={item.attempt_delay}
                  onChange={e =>
                    this.handleChangerow(i, "attempt_delay", e.target.value)
                  }
                  helperText="Your new list will be cloned from this Campaign."
                  error={false}
                />
              </FormControl>
            </div>
          </div>
          <div className="form-group">
            <div className="col-sm-12">
              <FormControl className="w-100 mb-2">
                <TextField
                  margin="dense"
                  id="user_group"
                  label="Attempt Maximum"
                  type="text"
                  fullWidth
                  value={item.attempt_maximum}
                  onChange={e =>
                    this.handleChangerow(i, "attempt_maximum", e.target.value)
                  }
                  helperText="Your new list will be cloned from this Campaign."
                  error={false}
                />
              </FormControl>
            </div>
          </div>
          <div className="form-group">
            <div className="col-sm-12">
              <FormControl className="w-100 mb-2">
                <Switch
                  value={item.active}
                  onChange={e =>
                    this.handleChangerow(i, "active", e.target.value)
                  }
                  defaultChecked={item.active == "Y"}
                  color="primary"
                />
              </FormControl>
            </div>
          </div>
        </div>
      );
    });

    const {
      agent_name,
      error_msg_user,
      error_msg_pass,
      error_msg,
      agentnameError,
      agent_id,
      sucsess_msg,
      agentError,
      agentpasswordError,
      agent_password,
      agents,
      source_agent,
      selectedListError,
      success,
      error
    } = this.state;

    return (
      <div className="w-100">
        <div>
          <div>
            {error && <TextError Type="alert-danger" msg={error_msg} />}
            {success && (
              <TextError Type="alert-success" msg="successfully added" />
            )}

            <CardBox styleName="col-lg-12">{listSItems}</CardBox>

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
                onClick={this.addPauseCodes}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
        {this.state.isLoading && (
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
    Global: state.globel
  };
}

const mapDispatchToProps = { fetchGlobal };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(New);
