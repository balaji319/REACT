import { Tooltip, IconButton } from "../list/plugins";
import React, { Component } from "react";
import { UncontrolledAlert, Alert } from "reactstrap";
import CircularProgress from "@material-ui/core/CircularProgress";
import ContainerHeader from "../../../../../../../components/ContainerHeader/index";
import CardBox from "../../../../../../../components/CardBox/index";
//import { fetchAgent,updateRecord } from '../../../../actions/';
//import { getAllCampaign } from '../../../../../../../actions/Global';
import TableCell from "@material-ui/core/TableCell";
import { StickyContainer, Sticky } from "react-sticky";
import { createNotification } from "../../../../../../../Helpers";
import { style_header, single_items_data, headerData } from "./data";
import axios from "axios";
import Switch from "@material-ui/core/Switch";
import { connect } from "react-redux";
import ButtonNav from "../../../../../../../components/navButton/";
import TextError from "../../../../../../../components/common/TextError";

import { sortable } from "react-sortable";

class Item extends React.Component {
  render() {
    return <tr {...this.props}> {this.props.children}</tr>;
  }
}

var SortableItem = sortable(Item);

class Edit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pageTitle: this.props.location.pathname.split("/")[5],
      pausecode: "",
      pause_code_name: "",
      billable: "",
      pausecodeError: false,
      pausecodeNameError: false,
      billableError: false,
      error: false,
      success: false,
      isLoading: false,
      items: [],
      single_items_data: single_items_data,
      u_records: [],
      u_single_records: [],
      status_list: []
    };
  }

  onSortItems = items => {
    console.log(items);
    this.setState({
      items: items
    });
    this.saveDrogDropHandler();
  };

  addPauseCodes = () => {
    let status = this.state.single_items_data[0].attempt_delay;
    let status_name = this.state.single_items_data[0].attempt_maximum;
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

  saveHandler = (type = "", id = "") => {
    this.setState({ isLoading: true });
    let Records = this.state.items;
    let pageTitle = this.state.pageTitle;
    const tempt_data = this.state.items.map((item, i) => {
      return { ...item, ["y_status_order"]: i };
      return item;
    });
    let records =
      type == "all"
        ? tempt_data
        : type == "edit"
          ? Records.filter(row => row.recycle_id == id)
          : this.state.u_records;

    axios
      .put("/api/update-lead-recycle", records[0])
      .then(response => {
        createNotification("Success", "Success", response.data.msg);
        this.setState({ isLoading: false });
      })
      .catch(function(error) {
        createNotification("Error", "Error", "Somthing Went Wrong !!!!");
        this.setState({ isLoading: false });
      });
  };

  saveDrogDropHandler = (id = "") => {
    this.setState({ isLoading: true });
    let pageTitle = this.state.pageTitle;
    const tempt_data = this.state.items.map((item, i) => {
      return { ...item, ["y_status_order"]: i };
      return item;
    });
    let formData = {
      statuses: tempt_data,
      campaign_id: pageTitle
    };
    axios
      .put("/api/systemwide-campaign-statuses-list-update", formData)
      .then(response => {
        createNotification("Success", "Success", response.data.msg);
        this.setState({ isLoading: false });
      })
      .catch(function(error) {
        createNotification("Error", "Error", "Somthing Went Wrong !!!!");
        this.setState({ isLoading: false });
      });
  };

  DeleteStatusHandler = name => {
    let campaign_id = this.state.pageTitle;
    this.setState({ isLoading: true });
    axios
      .delete(
        "/api/delete-lead-recycle?campaign_id=" +
          campaign_id +
          "&&recycle_id=" +
          name
      )
      .then(response => {
        createNotification("Success", "Success", response.data.msg);
        this.setState({ isLoading: false });
        this.getAllData();
      })
      .catch(function(error) {
        createNotification("Error", "Error", "Somthing Went Wrong !!!!");
        this.setState({ isLoading: false });
      });
  };

  addStatusHandler = () => {
    let campaign_id = this.state.pageTitle;
    let dial_status = this.state.status_list;
    let single_items_data = this.state.single_items_data;

    single_items_data[0]["campaign_id"] = this.state.pageTitle;
   // u_single_records[0]["status"] =
   single_items_data[0]["status"] == "" && dial_status[0].status;
    this.setState({ isLoading: true });
    axios
      .post("/api/add-lead-recycle", single_items_data[0])
      .then(response => {
        createNotification("Success", "Success", response.data.msg);
        this.setState({ isLoading: false });
        this.setState({ success: true });
        this.getAllData();
      })
      .catch(function(error) {
        createNotification("Error", "Error", error.response.data.msg);
        this.setState({ isLoading: false });
      });
  };
  EditSaveHandler = id => {
    this.saveHandler("edit", id);
  };

  handleChange(index, dataType, value, data) {
    let this_ = this;
    var datata = this_.state.u_records;
    if (dataType == "active") {
      value = value ? "Y" : "N";
    }
    var temp_array = [];
    const newState = this.state.items.map((item, i) => {
      if (i == index) {
        temp_array = datata.filter(company => company.status != item.status);
        temp_array.push({ ...item, [dataType]: value });
        return { ...item, [dataType]: value };
      }
      return item;
    });

    this.setState({
      items: newState,
      u_records: temp_array,
      is_change: true
    });
  }
  handleChangerow(index, dataType, value, data) {
    let this_ = this;
    var datata = this_.state.single_items_data;
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

  componentDidMount() {
    //this.props.getAllCampaign(['camp','agentgroup']);
    this.fetchStatus();
    this.getAllData();
  }

  componentWillReceiveProps(nextPropsFromRedux) {}

  handleRequestClose = value => {
    this.setState({ voicemail: value, open: false });
  };

  getAllData = id => {
    this.setState({ isLoading: true });
    axios
      .get("/api/edit-lead-recycle-list?campaign_id=" + this.state.pageTitle)
      .then(response => {
        this.setState({ items: response.data.data });
        this.setState({ isLoading: false });
      })
      .catch(function(error) {
        this.setState({ isLoading: false });
      });
  };

  fetchStatus = () => {
    let _this = this;
    this.setState({ isLoading: true });
    axios
      .get(
        "/api/campaign-mix-options-lists?list=false&&campaign_id=" +
          _this.state.pageTitle
      )
      .then(response => {
        _this.setState({ status_list: response.data.data.dial_status });
        _this.setState({ isLoading: false });
      })
      .catch(function(error) {
        this.setState({ isLoading: false });
      });
  };

  //handleSubmit1 = () => { alert('work')}

  handleSubmit = () => {
    let agentId = this.state.agentId;
    let agentName = this.state.agenttName;
    let user = this.state.user;
    let agentfullname = this.state.agentfullname;
    let password = this.state.password;
    let usergroup = this.state.usergroup;
    let voicemail = this.state.voicemail;
    let agentemail = this.state.agentemail;
    let manual_dial_cid = this.state.manual_dial_cid;

    let error = false;
    agentfullname == ""
      ? (this.setState({ agentnameError: true }), (error = true))
      : this.setState({ agentnameError: false });
    password == ""
      ? (this.setState({ agentpasswordError: true }), (error = true))
      : this.setState({ agentpasswordError: false });

    if (!error) {
      let postData = {
        user_id: agentId,
        full_name: agentfullname,
        name: user,
        user_group: usergroup,
        pass: password,
        agentName: agentfullname,
        voicemail_id: voicemail,
        email: agentemail,
        manual_dial_cid: manual_dial_cid,
        active: this.state.enableAgentActiveValue,
        agent_choose_ingroups: this.state.enableAgentqueueActiveValue,
        agentcall_manual: this.state.enableAgentmdActiveValue,
        agentonly_callbacks: this.state.enableAgentcbActiveValue,
        closer_default_blended: this.state.enableAgentobActiveValue
      };

      //this.props.updateRecord(postData);
      //console.log("GOOD")
      console.log(postData);
      let _this = this;
    }
  };

  render() {
    const {
      pageTitle,

      enableAgentqueueActiveValue,
      enableAgentmdActive,
      enableAgentmdActiveValue,
      enableAgentcbActive,
      enableAgentcbActiveValue,
      pausecode,
      error,
      success,
      status_list,
      items
    } = this.state;

    console.log(this.state.single_items_data);
    const divStyle = { padding: "4px 30px 4px 24px", textAlign: "center" };
    var data_style = { borderColor: "#ced4da" };

    var listSItems = this.state.single_items_data.map((item, i) => {
      return (
        <tr key={i}>
          <td>
            <div className="input text">
              <select
                name="status"
                id={"status_a" + i}
                className="form-control"
                value={item.status}
                onChange={e =>
                  this.handleChangerow(i, "status", e.target.value)
                }
              >
                {status_list &&
                  status_list.map((r, i) => {
                    return <option value={r.status}>{r.option_title}</option>;
                  })}
              </select>
            </div>
          </td>
          <td>
            <input
              type="text"
              name="attempt_delay"
              id={"attempt_delay_a" + i}
              className="form-control"
              value={item.attempt_delay}
              onChange={e =>
                this.handleChangerow(i, "attempt_delay", e.target.value)
              }
              placeholder="attempt delay"
            />
          </td>
          <td>
            <input
              type="text"
              name="attempt_maximum"
              id={"attempt_maximum_a" + i}
              className="form-control"
              value={item.attempt_maximum}
              onChange={e =>
                this.handleChangerow(i, "attempt_maximum", e.target.value)
              }
              placeholder="attempt maximum"
            />
          </td>
          <td style={{ textAlign: "center" }}>
            <a
              style={divStyle}
              className="text-center"
              style={{ whiteSpace: "nowrap" }}
              onClick={this.addPauseCodes}
            >
              <Tooltip title="Add Status">
                <IconButton>
                  <i className="fa fa-plus" style={{ cursor: "pointer" }} />
                </IconButton>
              </Tooltip>
            </a>
          </td>
        </tr>
      );
    });

    var listItems = items.map((item, i) => {
      return (
        <tr key={i}>
          <td style={{ verticalAlign: "middle", cursor: "pointer" }}>
            {item.recycle_id}
          </td>
          <td style={{ verticalAlign: "middle" }}>{item.status}</td>
          <td>
            <input
              type="text"
              name="attempt_delay"
              id={"attempt_delay" + i}
              className="form-control"
              value={item.attempt_delay}
              onChange={e =>
                this.handleChange(i, "attempt_delay", e.target.value)
              }
            />
          </td>
          <td>
            <input
              type="text"
              name="attempt_maximum"
              id={"attempt_maximum" + i}
              className="form-control"
              value={item.attempt_maximum}
              onChange={e =>
                this.handleChange(i, "attempt_maximum", e.target.value)
              }
            />
          </td>

          <td>
            <Switch
              value={item.campaign_id.toString()}
              // onChange={this.statusChangeHandler}
              onChange={e => this.handleChange(i, "active", e.target.checked)}
              defaultChecked={item.active == "Y"}
              ref={item.recycle_id}
              color="primary"
            />
          </td>

          <td align="center" style={{ whiteSpace: "nowrap" }}>
            <Tooltip title="Modify Campaign Status ">
              <IconButton>
                <a
                  className="teal-text"
                  onClick={() => this.EditSaveHandler(item.recycle_id)}
                >
                  <i className="fa fa-edit" />
                </a>
              </IconButton>
            </Tooltip>
          </td>
          <td align="center" style={{ whiteSpace: "nowrap" }}>
            <Tooltip title="Delete Agent">
              <IconButton
                onClick={() => this.DeleteStatusHandler(item.recycle_id)}
              >
                <a className="red-text">
                  <i className="fa fa-times" />
                </a>
              </IconButton>
            </Tooltip>
          </td>
        </tr>
      );
    });

    if (pageTitle == "edit" && pageError) {
      return (
        <div>
          <ContainerHeader
            match={this.props.match}
            title={pageTitle + " agent"}
          />

          <Alert className="shadow-lg" color="danger">
            <h3 className="alert-heading">Agent Not Found</h3>
            <p>We can not locate your Agent, please check your id.</p>
          </Alert>
        </div>
      );
    } else {
      return (
        <div>
          <ContainerHeader
            match={this.props.match}
            title={" Campaign Status"}
            style={{ marginBottom: "8px" }}
          />

          <div className="row">
            <CardBox styleName="col-lg-12">
              <form className="row" noValidate autoComplete="off">
                <div className="sub_menu_div" style={style_header}>
                  {" "}
                  <i className="fa fa-bars" style={{ marginRight: "10px" }} />
                  Lead Recycle List: {pageTitle}
                </div>

                <table className="table table-hover">
                  <thead>
                    <tr>
                      {headerData.map((item, i) => {
                        return (
                          <th
                            className="sorting_disabled"
                            rowSpan={1}
                            colSpan={1}
                            style={{ width: 113, textAlign: item.align }}
                          >
                            {item.label}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>{listItems}</tbody>
                </table>

                <div className="sub_menu_div" style={style_header}>
                  {" "}
                  <i className="fa fa-bars" style={{ marginRight: "10px" }} />
                  Add New Lead Recycle
                </div>
                <div className="col-md-12">
                  <table
                    className="table table-hover"
                    style={{ width: "100%" }}
                  >
                    <tbody>{listSItems}</tbody>
                  </table>
                  {error && (
                    <TextError Type="alert-danger" msg="field required" />
                  )}
                  {success && (
                    <TextError Type="alert-success" msg="successfully added" />
                  )}
                </div>
              </form>
            </CardBox>

            {this.state.isLoading && (
              <div className="loader-view" id="loader-view">
                <CircularProgress />
              </div>
            )}
          </div>
        </div>
      );
    }
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
)(Edit);
