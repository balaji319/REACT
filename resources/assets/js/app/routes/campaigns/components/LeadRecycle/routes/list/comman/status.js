import React, { Component } from "react";
import ContainerHeader from "../../../../../../../../components/ContainerHeader/index";
import classNames from "classnames";
import PropTypes from "prop-types";
import keycode from "keycode";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableFooter from "@material-ui/core/TableFooter";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import DeleteIcon from "@material-ui/icons/Delete";
import CircularProgress from "@material-ui/core/CircularProgress";
import { createNotification } from "../../../../../../../../Helpers";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import New from "./newStatus";

import { sortable } from "react-sortable";

class Item extends React.Component {
  render() {
    return <TableCell {...this.props}> {this.props.children}</TableCell>;
  }
}

var SortableItem = sortable(Item);

class SortableList extends React.Component {
  state = {
    items: [],
    ajax_data: [],
    u_records: [],
    openClone: false
  };
  openCloneDialog = () => {
    this.setState({ openClone: !this.state.openClone });
  };
  onSortItems = items => {
    this.setState({
      items: items
    });
    this.saveHandler("all");
  };

  saveHandler = (type = "", id) => {
    let Records = this.state.items;
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
    let formData = {
      statuses: records
    };
    axios
      .put("/api/systemwide-campaign-statuses-list-update", formData)
      .then(response => {
        createNotification("Success", "Success", response.data.message);
        this.setState({ isLoading: false });
      })
      .catch(function(error) {
        createNotification("Error", "Error", "Somthing Went Wrong !!!!");
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
  componentDidMount() {
    this.getSystemStatusList();
  }

  getSystemStatusList = id => {
    this.setState({ isLoading: true });
    axios
      .get("/api/systemwide-campaign-statuses-list")
      .then(response => {
        this.setState({ items: response.data.data });
        this.setState({ isLoading: false });
      })
      .catch(function(error) {
        console.log(error);
      });
  };
  render() {
    const { items, u_records } = this.state;

    var listItems = items.map((item, i) => {
      return (
        <tr className="even" key={i}>
          <td>
            <span style={{ cursor: "pointer" }} /> <i class="icon-move" />{" "}
            <SortableItem
              key={i}
              onSortItems={this.onSortItems}
              items={items}
              sortId={i}
              className="main_header_drag_system"
            >
              <span style={{ cursor: "pointer" }} />{" "}
              <i className="fa fa-arrows" style={{ marginRight: "5px" }} />
              {item.status}
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
          <td align="center">
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
          </td>
        </tr>
      );
    });

    return (
      <div>
        <div>
          <Dialog
            maxWidth="md"
            fullWidth={true}
            open={this.state.openClone}
            onClose={this.handleCloneClose}
          >
            <DialogTitle>{"Add New Status "}</DialogTitle>
            <DialogContent>
              <New
                closeClone={this.handleSaveCloneClose}
                close={this.openCloneDialog}
              />
            </DialogContent>
            <DialogActions />
          </Dialog>;
          <Toolbar className="table-header">
            <div className="title">
              <h3>
                <i className="zmdi zmdi-view-web mr-2" />Systemwide Statuses
              </h3>
            </div>
            <div className="spacer" />
            <div className="actions">
              <Tooltip title="Add New List">
                <IconButton
                  className="btn-sm"
                  aria-label="Delete"
                  onClick={this.openCloneDialog}
                >
                  <i className="fa fa-plus-circle" aria-hidden="true" />
                </IconButton>
              </Tooltip>
            </div>
            <div className="actions">
              <Tooltip title="Save All ">
                <IconButton
                  className="btn-sm"
                  aria-label="Save"
                  onClick={this.saveHandler}
                >
                  <i className="fa fa-save" aria-hidden="true" />
                </IconButton>
              </Tooltip>
            </div>
          </Toolbar>
          <div className="flex-auto">
            <div className="table-responsive-material">
              <table
                className="list_listings table table-striped table-bordered sortable table-sortable dataTable no-footer"
                id="table-1"
                aria-describedby="table-1_info"
                role="grid"
              >
                <thead>
                  <tr role="row">
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
                <tbody className="ui-sortable">{listItems}</tbody>
              </table>
            </div>
          </div>
        </div>

        {listItems.length == 0 && this.state.isLoading ? (
          <tr>
            <td colSpan="11">
              <center>Loading ......... </center>
            </td>
          </tr>
        ) : items.length == 0 ? (
          <tr>
            <td colSpan="11">
              <center>No Records Found </center>
            </td>
          </tr>
        ) : (
          <tr>
            <td colSpan="3">
              <center> </center>
            </td>
          </tr>
        )}
        {this.state.isLoading && (
          <div className="loader-view" id="loader-view">
            <CircularProgress />
          </div>
        )}
      </div>
    );
  }
}

export default SortableList;
