import { Tooltip, IconButton } from "../list/plugins";

import React, { Component } from "react";
import { UncontrolledAlert, Alert } from "reactstrap";
import SweetAlert from "react-bootstrap-sweetalert";
import CircularProgress from "@material-ui/core/CircularProgress";
import Paper from "@material-ui/core/Paper";
import Switch from "@material-ui/core/Switch";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import ContainerHeader from "../../../../../../../components/ContainerHeader/index";
import CardBox from "../../../../../../../components/CardBox/index";
import CustomPicker from "../../../../../../../components/pickers/routes/Color/customPicker";
import IntlMessages from "../../../../../../../util/IntlMessages";
import VoicemailPopUp from "../../../../../../../components/VoicemailPopUp/VoicemailPopUp";
//import { fetchAgent,updateRecord } from '../../../../actions/';
//import { getAllCampaign } from '../../../../../../../actions/Global';
import TableCell from "@material-ui/core/TableCell";
import { StickyContainer, Sticky } from "react-sticky";
import { createNotification } from "../../../../../../../Helpers";
import {
  mail_data,
  style_header,
  billable_options,
  single_items_data
} from "./data";
import axios from "axios";
import { connect } from "react-redux";
import ButtonNav from "../../../../../../../components/navButton/";
import TextError from "../../../../../../../components/common/TextError";

import { sortable } from "react-sortable";

class Item extends React.Component {
  render() {
    return <TableCell {...this.props}> {this.props.children}</TableCell>;
  }
}

var SortableItem = sortable(Item);

class Edit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pageTitle: this.props.location.pathname.split("/")[5],
      billable_options: billable_options,
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
      showConfirm: false,
      deleteId: ""
    };
  }

  onSortItems = items => {
    console.log(items);
    this.setState({
      items: items
    });
    this.saveDrogDropHandler();
  };
  DeleteInboundHandler = id => {
    this.setState({ showConfirm: true, deleteId: id });
  };
  addPauseCodes = () => {
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

  saveHandler = (type = "", id = "") => {
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
          ? Records.filter(row => row.status == id)
          : this.state.u_records;

    axios
      .put("/api/update-campaign-status", records[0])
      .then(response => {
        createNotification("Success", "Success", response.data.msg);
        this.setState({ isLoading: false });
      })
      .catch(function(error) {
        createNotification("Error", "Error", "Somthing Went Wrong !!!!");
      });
  };

  saveDrogDropHandler = (id = "") => {
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
      });
  };

  DeleteStatusHandler = name => {
    let campaign_id = this.state.pageTitle;

    axios
      .delete(
        "/api/delete-campaign-status?campaign_id=" +
          campaign_id +
          "&&status=" +
          name
      )
      .then(response => {
        createNotification("Success", "Success", response.data.msg);
        this.setState({ isLoading: false });
        this.getAllData();
      })
      .catch(function(error) {
        createNotification("Error", "Error", "Somthing Went Wrong !!!!");
      });
  };
  DeleteConfirmHandler = () => {
    let let_this = this;
    let deleteId = this.state.deleteId;

    this.onCancelDeleteHandler();
    setTimeout(function() {
      let_this.DeleteStatusHandler(deleteId);
    }, 10);
  };

  onCancelDeleteHandler = () => {
    this.setState({ showConfirm: false });
  };

  addStatusHandler = () => {
    let campaign_id = this.state.pageTitle;
    let u_single_records = this.state.u_single_records;
    u_single_records[0]["campaign_id"] = this.state.pageTitle;

    axios
      .post("/api/add-campaign-status", u_single_records[0])
      .then(response => {
        createNotification("Success", "Success", response.data.msg);
        this.setState({ isLoading: false });
        this.setState({ success: true });
        this.getAllData();
      })
      .catch(function(error) {
        createNotification("Error", "Error", error.response.data.msg);
      });
  };
  EditSaveHandler = id => {
    this.saveHandler("edit", id);
  };

  handleChange(index, dataType, value, data) {
    let this_ = this;
    var datata = this_.state.u_records;
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

  componentDidMount() {
    //this.props.getAllCampaign(['camp','agentgroup']);
    // this.props.fetchAgent(this.state.agentId);
    this.getAllData();
  }

  componentWillReceiveProps(nextPropsFromRedux) {}

  handleRequestClose = value => {
    this.setState({ voicemail: value, open: false });
  };

  getAllData = id => {
    this.setState({ isLoading: true });
    axios
      .get("/api/edit-campaign-status?campaign_id=" + this.state.pageTitle)
      .then(response => {
        this.setState({ items: response.data.data });
        this.setState({ isLoading: false });
      })
      .catch(function(error) {
        console.log(error);
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
      items
    } = this.state;

    const divStyle = { padding: "4px 30px 4px 24px", textAlign: "center" };
    var data_style = { borderColor: "#ced4da" };

    var listSItems = single_items_data.map((item, i) => {
      return (
        <tr key={i}>
          <td>
            <div className="input text">
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
            </div>
          </td>
          <td>
            <div className="input text">
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
            </div>
          </td>

          <td>
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
          </td>
          <td>
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
          </td>
          <td>
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
          </td>
          <td>
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
          </td>
          <td>
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
          </td>
          <td>
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
          </td>
          <td>
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
          </td>
          <td>
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
          </td>
          <td>
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
          </td>
          <td>
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
            <SortableItem
              key={i}
              onSortItems={this.onSortItems}
              items={items}
              sortId={i}
              className="main_header_drag"
            >
              <span style={{ cursor: "pointer" }} />{" "}
              <i className="fa fa-arrows" /> {item.status}
            </SortableItem>
          </td>
          <td>
            <input
              type="text"
              name="status_name_TestIG"
              id={"status_name_TestIG_" + i}
              className="form-control"
              value={item.status_name}
              onChange={e =>
                this.handleChange(i, "status_name", e.target.value)
              }
            />
          </td>
          <td>
            <select
              name="category_TestIG"
              id={"category_TestIG_" + i}
              className="form-control"
              value={item.category}
              onChange={e => this.handleChange(i, "category", e.target.value)}
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
          </td>
          <td>
            <select
              name="selectable"
              id={"selectable_" + i}
              className="form-control"
              value={item.selectable}
              onChange={e => this.handleChange(i, "selectable", e.target.value)}
            >
              <option>N</option>
              <option>Y</option>
              <option selected>{item.selectable}</option>
            </select>
          </td>
          <td>
            <select
              name="human_answered"
              id="human_answered_TestIG"
              className="form-control"
              onChange={e =>
                this.handleChange(i, "human_answered", e.target.value)
              }
            >
              <option>N</option>
              <option>Y</option>
              <option selected>{item.human_answered}</option>
            </select>
          </td>
          <td>
            <select
              name="sale_N"
              id="sale_TestIG"
              className="form-control"
              onChange={e => this.handleChange(i, "sale", e.target.value)}
            >
              <option>N</option>
              <option>Y</option>
              <option selected>{item.sale}</option>
            </select>
          </td>
          <td>
            <select
              name="dnc_TestIG"
              id="dnc_TestIG"
              className="form-control"
              onChange={e => this.handleChange(i, "dnc", e.target.value)}
            >
              <option>N</option>
              <option>Y</option>
              <option selected>{item.dnc}</option>
            </select>
          </td>
          <td>
            <select
              name="customer_contact"
              id="customer_contact_TestIG"
              className="form-control"
              onChange={e =>
                this.handleChange(i, "customer_contact", e.target.value)
              }
            >
              <option>N</option>
              <option>Y</option>
              <option selected>{item.customer_contact}</option>
            </select>
          </td>
          <td>
            <select
              name="not_interested_TestIG"
              id="not_interested_TestIG"
              className="form-control"
              onChange={e =>
                this.handleChange(i, "not_interested", e.target.value)
              }
            >
              <option>N</option>
              <option>Y</option>
              <option selected>{item.not_interested}</option>
            </select>
          </td>
          <td>
            <select
              name="unworkable_TestIG"
              id="unworkable_TestIG"
              className="form-control"
              onChange={e => this.handleChange(i, "unworkable", e.target.value)}
            >
              <option>N</option>
              <option>Y</option>
              <option selected>{item.unworkable}</option>
            </select>
          </td>
          <td>
            <select
              name="scheduled_callbacks_TestIG"
              id="scheduled_callback_TestIG"
              className="form-control"
              onChange={e =>
                this.handleChange(i, "scheduled_callback", e.target.value)
              }
            >
              <option>N</option>
              <option>Y</option>
              <option selected>{item.scheduled_callback}</option>
            </select>
          </td>
          <td>
            <select
              name="completed_TestIG"
              id="completed_TestIG"
              className="form-control"
              onChange={e => this.handleChange(i, "completed", e.target.value)}
            >
              <option>N</option>
              <option>Y</option>
              <option selected>{item.completed}</option>
            </select>
          </td>
          <td align="center" style={{ whiteSpace: "nowrap" }}>
            <Tooltip title="Modify Campaign Status ">
              <IconButton>
                <a
                  className="teal-text"
                  onClick={() => this.EditSaveHandler(item.status)}
                >
                  <i className="fa fa-edit" />
                </a>
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Agent">
              <IconButton
                onClick={() => this.DeleteInboundHandler(item.status)}
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
          <SweetAlert
            show={this.state.showConfirm}
            warning
            showCancel
            confirmBtnText="Yes Delete It"
            confirmBtnBsStyle="danger"
            cancelBtnBsStyle="default"
            title=""
            onConfirm={this.DeleteConfirmHandler}
            onCancel={this.onCancelDeleteHandler}
          >
            {" "}
            Are you sure to delete this Record ?
          </SweetAlert>
          <div className="row">
            <CardBox styleName="col-lg-12">
              <form className="row" noValidate autoComplete="off">
                <div className="sub_menu_div" style={style_header}>
                  {" "}
                  <i className="fa fa-bars" style={{ marginRight: "10px" }} />
                  Campaign : {pageTitle}
                </div>

                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th
                        className="sorting_disabled"
                        rowSpan={1}
                        colSpan={1}
                        style={{ width: 113 }}
                      >
                        Status
                      </th>
                      <th
                        className="sorting_disabled"
                        rowSpan={1}
                        colSpan={1}
                        style={{ width: 110 }}
                      >
                        Description
                      </th>
                      <th
                        className="sorting_disabled"
                        rowSpan={1}
                        colSpan={1}
                        style={{ width: 105 }}
                      >
                        Category
                      </th>
                      <th
                        className="sorting_disabled"
                        rowSpan={1}
                        colSpan={1}
                        style={{ width: 105 }}
                      >
                        Selectable
                      </th>
                      <th
                        className="sorting_disabled"
                        rowSpan={1}
                        colSpan={1}
                        style={{ width: 143 }}
                      >
                        Human Answer
                      </th>
                      <th
                        className="sorting_disabled"
                        rowSpan={1}
                        colSpan={1}
                        style={{ width: 105 }}
                      >
                        Sale
                      </th>
                      <th
                        className="sorting_disabled"
                        rowSpan={1}
                        colSpan={1}
                        style={{ width: 105 }}
                      >
                        DNC
                      </th>
                      <th
                        className="sorting_disabled"
                        rowSpan={1}
                        colSpan={1}
                        style={{ width: 167 }}
                      >
                        Customer Contact
                      </th>
                      <th
                        className="sorting_disabled"
                        rowSpan={1}
                        colSpan={1}
                        style={{ width: 129 }}
                      >
                        Not Intrested
                      </th>
                      <th
                        className="sorting_disabled"
                        rowSpan={1}
                        colSpan={1}
                        style={{ width: 117 }}
                      >
                        Unworkable
                      </th>
                      <th
                        className="sorting_disabled"
                        rowSpan={1}
                        colSpan={1}
                        style={{ width: 169 }}
                      >
                        Schedule Callback
                      </th>
                      <th
                        className="sorting_disabled"
                        rowSpan={1}
                        colSpan={1}
                        style={{ width: 106 }}
                      >
                        Completed
                      </th>
                      <th
                        className="sorting_disabled"
                        rowSpan={1}
                        colSpan={1}
                        style={{ width: 71 }}
                      >
                        <center>Modify</center>
                      </th>
                    </tr>
                  </thead>
                  <tbody>{listItems}</tbody>
                </table>

                <div className="sub_menu_div" style={style_header}>
                  {" "}
                  <i
                    className="fa fa-bars"
                    style={{ marginRight: "10px" }}
                  />Add New Custom Campaign Status
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
