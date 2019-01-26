import { Tooltip, IconButton } from "../list/plugins";

import React, { Component } from "react";
import { UncontrolledAlert, Alert } from "reactstrap";
import SweetAlert from "react-bootstrap-sweetalert";
import CircularProgress from "@material-ui/core/CircularProgress";
import ContainerHeader from "../../../../../../../components/ContainerHeader/index";
import CardBox from "../../../../../../../components/CardBox/index";
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

  addPauseCodes = () => {
    let status = this.state.single_items_data[0].preset_name;
    let status_name = this.state.single_items_data[0].preset_number;
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
          ? Records.filter(row => row.pause_code == id)
          : this.state.u_records;

    axios
      .put("/api/edit-pause-code", records[0])
      .then(response => {
        createNotification("Success", "Success", response.data.message);
        this.setState({ isLoading: false });
      })
      .catch(function(error) {
        createNotification("Error", "Error", error.response.data.msg);
        this.setState({ isLoading: false });
      });
  };

  onSortItems = items => {
    this.setState({
      items: items
    });
    this.saveHandler("all");
  };
  DeleteInboundHandler = id => {
    this.setState({ showConfirm: true, deleteId: id });
  };
  saveHandler = (type = "", id) => {
    let Records = this.state.items;
    const tempt_data = this.state.items.map((item, i) => {
      return { ...item, ["preset_order"]: i };
    });
    this.setState({ isLoading: true });
    let records =
      type == "all"
        ? tempt_data
        : type == "edit"
          ? Records.filter(row => row.preset_name == id)
          : this.state.u_records;
    let form_data = {
      campaign_id: this.state.pageTitle,
      presets: records
    };
    axios
      .put("/api/update-call-transfer-preset", form_data)
      .then(response => {
        createNotification("Success", "Success", response.data.msg);
        this.setState({ isLoading: false });
      })
      .catch(function(error) {
        createNotification("Error", "Error", error.response.data.msg);
        this.setState({ isLoading: false });
      });
  };
  EditSaveHandler = id => {
    this.saveHandler("edit", id);
  };

  DeleteStatusHandler = name => {
    let campaign_id = this.state.pageTitle;
    this.setState({ isLoading: true });
    axios
      .delete(
        "/api/delete-call-transfer-preset?campaign_id=" +
          campaign_id +
          "&&preset_name=" +
          name
      )
      .then(response => {
        createNotification("Success", "Success", response.data.msg);
        this.setState({ isLoading: false });
        this.getAllData();
      })
      .catch(function(error) {
        createNotification("Error", "Error", error.response.data.msg);
        this.setState({ isLoading: false });
      });
  };

  addStatusHandler = () => {
    let campaign_id = this.state.pageTitle;
    let u_single_records = this.state.u_single_records;
    let single_records = this.state.single_records;
    u_single_records[0]["campaign_id"] = this.state.pageTitle;
    this.setState({ isLoading: true });
    axios
      .post("/api/add-call-transfer-preset", u_single_records[0])
      .then(response => {
        createNotification(SUCCESS, SUCCESS, response.data.msg);
        this.setState({ isLoading: false });
        this.setState({ success: true });
        this.getAllData();
      })
      .catch(function(error) {
        createNotification(ERROR, ERROR, error.response.data.msg);
        this.setState({ isLoading: false });
      });
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

    setTimeout(function() {
      this_.setState({
        items: newState,
        u_records: temp_array,
        is_change: true
      });
    }, 10);
  }
  handleChangerow(index, dataType, value, data) {
    let this_ = this;
    var datata = this_.state.u_single_records;
    var temp_array = [];
    const newState = this.state.single_items_data.map((item, i) => {
      if (i == index) {
        temp_array = datata.filter(
          company => company.pause_code != item.pause_code
        );
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
      .get(
        "/api/edit-call-transfer-preset-list?campaign_id=" +
          this.state.pageTitle
      )
      .then(response => {
        this.setState({ items: response.data.data });
        this.setState({ isLoading: false });
      })
      .catch(function(error) {
        this.setState({ isLoading: false });
        createNotification("Error", "Error", error.response.data.msg);
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
      showConfirm,
      success,
      items
    } = this.state;

    const divStyle = { padding: "4px 30px 4px 24px", textAlign: "center" };
    var data_style = { borderColor: "#ced4da" };

    var listSItems = this.state.single_items_data.map((item, i) => {
      return (
        <tr key={i}>
          <td>
            <div className="input text">
              <input
                name="preset_name"
                id="preset_name"
                style={data_style}
                className="form-control tooltip-primary"
                data-toggle="tooltip"
                onChange={e =>
                  this.handleChangerow(i, "preset_name", e.target.value)
                }
                data-placement="top"
                title=""
                maxLength="6"
                placeholder="preset name * "
                required="required"
                type="text"
              />
            </div>
          </td>
          <td>
            <div className="input text">
              <input
                name="preset_number"
                style={data_style}
                id="preset_number"
                className="form-control tooltip-primary"
                onChange={e =>
                  this.handleChangerow(i, "preset_number", e.target.value)
                }
                data-toggle="tooltip"
                data-placement="top"
                title=""
                placeholder="preset number * "
                required="required"
                type="text"
              />
            </div>
          </td>
          <td>
            <div className="input text">
              <input
                name="preset_dtmf"
                style={data_style}
                id="preset_dtmf"
                className="form-control tooltip-primary"
                onChange={e =>
                  this.handleChangerow(i, "preset_dtmf", e.target.value)
                }
                data-toggle="tooltip"
                data-placement="top"
                title=""
                placeholder="preset dtmf"
                required="required"
                type="text"
              />
            </div>
          </td>
          <td>
            <select
              name="preset_hide_number"
              id={"preset_hide_number" + i}
              className="form-control"
              value={item.preset_hide_number}
              onChange={e =>
                this.handleChangerow(i, "preset_hide_number", e.target.value)
              }
            >
              <option value="Y">Y</option>
              <option value="N">N</option>
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
              <i className="fa fa-arrows" /> {item.preset_name}
            </SortableItem>
          </td>
          <td>
            <input
              type="text"
              name="preset_number"
              id={"preset_number" + i}
              className="form-control"
              value={item.preset_number}
              onChange={e =>
                this.handleChange(i, "preset_number", e.target.value)
              }
            />
          </td>

          <td>
            <input
              type="text"
              name="preset_dtmf"
              id={"preset_dtmf" + i}
              className="form-control"
              value={item.preset_dtmf}
              onChange={e =>
                this.handleChange(i, "preset_dtmf", e.target.value)
              }
            />
          </td>
          <td>
            <select
              name="preset_hide_number"
              id={"preset_hide_number" + i}
              className="form-control"
              value={item.preset_hide_number}
              onChange={e =>
                this.handleChange(i, "preset_hide_number", e.target.value)
              }
            >
              <option value="Y">Y</option>
              <option value="N">N</option>
            </select>
          </td>

          <td align="center" style={{ whiteSpace: "nowrap" }}>
            <Tooltip title="Modify Pause Code  ">
              <IconButton>
                <a
                  className="teal-text"
                  onClick={() => this.EditSaveHandler(item.preset_name)}
                >
                  <i className="fa fa-edit" />
                </a>
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Pause Code">
              <IconButton
                onClick={() => this.DeleteInboundHandler(item.preset_name)}
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
            title={" Pause Code "}
            style={{ marginBottom: "8px" }}
          />
          <SweetAlert
            show={showConfirm}
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
                  Call Transfer Presets: {pageTitle}
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
                        Preset Name
                      </th>
                      <th
                        className="sorting_disabled"
                        rowSpan={1}
                        colSpan={1}
                        style={{ width: 110 }}
                      >
                        Number
                      </th>
                      <th
                        className="sorting_disabled"
                        rowSpan={1}
                        colSpan={1}
                        style={{ width: 105 }}
                      >
                        DTMF
                      </th>
                      <th
                        className="sorting_disabled"
                        rowSpan={1}
                        colSpan={1}
                        style={{ width: 105 }}
                      >
                        Hide
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
                  />Add New Call Transfer Presets
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
