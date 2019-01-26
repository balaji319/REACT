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

import axios from "axios";
const single_items_data = [
  {
    status: "",
    status_name: "",
    selectable: "N",
    human_answered: "Y",
    category: "UNDEFINED - Default",
    sale: "N",
    dnc: "N",
    customer_contact: "N",
    not_interested: "N",
    unworkable: "N",
    scheduled_callback: "N",
    completed: "N",
    status_order: "6",
    y_status_order: "1",
    options_title: "IVRXFR - Outbound drop to Call Menu"
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
    u_single_records: []
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
          this.setState({ sucsess_msg: response.data.msg });
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
    //this.props.fetchGlobal(["agent_c"]);
  }

  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      agents: nextPropsFromRedux.Global.agent_c
        ? nextPropsFromRedux.Global.agent_c
        : ""
    });
  }
  handleChangerow(index, dataType, value, data) {
    let this_ = this;
    var datata = this_.state.u_single_records;
    var temp_array = [];
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
    let u_single_records = this.state.u_single_records;
    this.setState({ isLoading: true });
    axios
      .post("/api/add-system-status", u_single_records[0])
      .then(response => {
        //createNotification("Success", "Success", response.data.message);
        this.setState({ isLoading: false });
        this.setState({ success: true });
        //this.getAllData();
      })
      .catch(function(error) {
        //createNotification("Error", "Error", "Somthing Went Wrong !!!!");
        this.setState({
          statusNameError: true,
          error: true,
          error_msg: error.response.msg
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
    const divStyle = { padding: "4px 30px 4px 24px", textAlign: "center" };
    var data_style = { borderColor: "#ced4da" };
    console.log("+++++++++++");
    console.log(this.state.single_items_data);
    let listSItems = single_items_data.map((item, i) => {
      return (
        <div key={i}>
          <div className="form-group">
            <label className="col-sm-3 control-label" htmlFor="new_id">
              Status
            </label>
            <div className="col-sm-12">
              <input
                name="status"
                id="status"
                style={data_style}
                className="form-control tooltip-primary"
                data-toggle="tooltip"
                onChange={e =>
                  this.handleChangerow(i, "status", e.target.value)
                }
                data-placement="top"
                title=""
                maxLength="6"
                placeholder="status"
                data-original-title="This is Status ID Field and It is required"
                required="required"
                type="text"
              />
              <span className="help-block" />
            </div>
          </div>
          <div className="form-group">
            <label className="col-sm-3 control-label" htmlFor="new_id">
              Status Name
            </label>
            <div className="col-sm-12">
              <input
                name="status_code_name"
                style={data_style}
                id="status_code_name"
                className="form-control tooltip-primary"
                onChange={e =>
                  this.handleChangerow(i, "status_name", e.target.value)
                }
                data-toggle="tooltip"
                data-placement="top"
                title=""
                placeholder="Status Description"
                data-original-title="This is Descriptive name of status code name Field and It is required"
                required="required"
                type="text"
              />
              <span className="help-block" />
            </div>
          </div>
          <div className="form-group">
            <label className="col-sm-3 control-label" htmlFor="from_id">
              Catagory
            </label>
            <div className="col-sm-12">
              <select
                name="category_TestIG"
                id={"category_TestIG_" + i}
                className="form-control"
                value={item.category}
                onChange={e =>
                  this.handleChangerow(i, "category", e.target.value)
                }
              >
                <option value="UNDEFINED - Default Category">
                  UNDEFINED - Default Category
                </option>
                <option value="SALE_Statuses - SALE">
                  SALE_Statuses - SALE TEST
                </option>
                <option value="POST_Statuses - POST">
                  POST_Statuses - POST TEST
                </option>
                <option value="Test_Sale">POST_Statuses - POST</option>
              </select>
              <span className="help-block" />
            </div>
          </div>
          <div className="form-group">
            <label className="col-sm-3 control-label" htmlFor="from_id">
              Selectable
            </label>
            <div className="col-sm-12">
              <select
                name="selectable"
                id={"selectable_" + i}
                className="form-control"
                value={item.selectable}
                onChange={e =>
                  this.handleChangerow(i, "selectable", e.target.value)
                }
              >
                <option>N</option>
                <option>Y</option>
                <option selected>{item.selectable}</option>
              </select>
              <span className="help-block" />
            </div>
          </div>
          <div className="form-group">
            <label className="col-sm-3 control-label" htmlFor="from_id">
              Human Answered
            </label>
            <div className="col-sm-12">
              <select
                name="human_answered"
                id="human_answered_TestIG"
                className="form-control"
                onChange={e =>
                  this.handleChangerow(i, "human_answered", e.target.value)
                }
              >
                <option>N</option>
                <option>Y</option>
                <option selected>{item.human_answered}</option>
              </select>
              <span className="help-block" />
            </div>
          </div>
          <div className="form-group">
            <label className="col-sm-3 control-label" htmlFor="from_id">
              Sale
            </label>
            <div className="col-sm-12">
              <select
                name="sale_N"
                id="sale_TestIG"
                className="form-control"
                onChange={e => this.handleChangerow(i, "sale", e.target.value)}
              >
                <option>N</option>
                <option>Y</option>
                <option selected>{item.sale}</option>
              </select>
              <span className="help-block" />
            </div>
          </div>
          <div className="form-group">
            <label className="col-sm-3 control-label" htmlFor="from_id">
              DNC
            </label>
            <div className="col-sm-12">
              <select
                name="dnc_TestIG"
                id="dnc_TestIG"
                className="form-control"
                onChange={e => this.handleChangerow(i, "dnc", e.target.value)}
              >
                <option>N</option>
                <option>Y</option>
                <option selected>{item.dnc}</option>
              </select>
              <span className="help-block" />
            </div>
          </div>
          <div className="form-group">
            <label className="col-sm-3 control-label" htmlFor="from_id">
              Customer Contact
            </label>
            <div className="col-sm-12">
              <select
                name="customer_contact"
                id="customer_contact_TestIG"
                className="form-control"
                onChange={e =>
                  this.handleChangerow(i, "customer_contact", e.target.value)
                }
              >
                <option>N</option>
                <option>Y</option>
                <option selected>{item.customer_contact}</option>
              </select>
              <span className="help-block" />
            </div>
          </div>
          <div className="form-group">
            <label className="col-sm-3 control-label" htmlFor="from_id">
              Not Interested
            </label>
            <div className="col-sm-12">
              <select
                name="not_interested_TestIG"
                id="not_interested_TestIG"
                className="form-control"
                onChange={e =>
                  this.handleChangerow(i, "not_interested", e.target.value)
                }
              >
                <option>N</option>
                <option>Y</option>
                <option selected>{item.not_interested}</option>
              </select>
              <span className="help-block" />
            </div>
          </div>
          <div className="form-group">
            <label className="col-sm-3 control-label" htmlFor="from_id">
              Unworkable
            </label>
            <div className="col-sm-12">
              <select
                name="unworkable_TestIG"
                id="unworkable_TestIG"
                className="form-control"
                onChange={e =>
                  this.handleChangerow(i, "unworkable", e.target.value)
                }
              >
                <option>N</option>
                <option>Y</option>
                <option selected>{item.unworkable}</option>
              </select>
              <span className="help-block" />
            </div>
          </div>
          <div className="form-group">
            <label className="col-sm-3 control-label" htmlFor="from_id">
              Callbacks
            </label>
            <div className="col-sm-12">
              <select
                name="scheduled_callbacks_TestIG"
                id="scheduled_callback_TestIG"
                className="form-control"
                onChange={e =>
                  this.handleChangerow(i, "scheduled_callback", e.target.value)
                }
              >
                <option>N</option>
                <option>Y</option>
                <option selected>{item.scheduled_callback}</option>
              </select>
              <span className="help-block" />
            </div>
          </div>
          <div className="form-group">
            <label className="col-sm-3 control-label" htmlFor="from_id">
              Completed
            </label>
            <div className="col-sm-12">
              <select
                name="completed_TestIG"
                id="completed_TestIG"
                className="form-control"
                onChange={e =>
                  this.handleChangerow(i, "completed", e.target.value)
                }
              >
                <option>N</option>
                <option>Y</option>
                <option selected>{item.completed}</option>
              </select>
              <span className="help-block" />
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
            {error && <TextError Type="alert-danger" msg="field required" />}
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

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(New);
