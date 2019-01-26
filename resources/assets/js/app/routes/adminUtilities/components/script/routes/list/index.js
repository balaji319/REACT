import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import ContainerHeader from "../../../../../../../components/ContainerHeader/index";
import axios from "axios";
import { connect } from "react-redux";
import classNames from "classnames";
import PropTypes from "prop-types";
import keycode from "keycode";
import Table from "@material-ui/core/Table";
import MenuItem from "@material-ui/core/MenuItem";
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
import Switch from "@material-ui/core/Switch";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import SweetAlert from "react-bootstrap-sweetalert";
import CircularProgress from "@material-ui/core/CircularProgress";
import { createNotification } from "../../../../../../../Helpers";

import {
  fetchAllScript,
  updateRecord,
  deleteRecord,
  cloneRecord
} from "../../../../actions/";

let counter = 0;

const columnData = [
  { id: "script_id", label: "Script Id" },
  { id: "script_name", label: "Script Name" },
  { id: "active", textAlign: " text-center", label: "Active" },
  { id: "modify", textAlign: " text-center", label: "Modify" }
];

class DataTableHead extends React.Component {
  static propTypes = {
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired
  };

  createSortHandler = property => event => {
    this.props.onRequestSort(event, property);
  };
  render() {
    const {
      onSelectAllClick,
      order,
      orderBy,
      numSelected,
      rowCount
    } = this.props;

    return (
      <TableHead>
        <TableRow>
          {columnData.map(column => {
            return (
              <TableCell
                className={column.textAlign}
                key={column.id}
                numeric={column.numeric}
                padding={column.disablePadding ? "none" : "default"}
              >
                <Tooltip
                  title={column.label}
                  placement={column.numeric ? "bottom-end" : "bottom-start"}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={order}
                    onClick={this.createSortHandler(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            );
          }, this)}
        </TableRow>
      </TableHead>
    );
  }
}

class List extends React.Component {
  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = "desc";

    if (this.state.orderBy === property && this.state.order === "desc") {
      order = "asc";
    }

    const data =
      order === "desc"
        ? this.state.data.sort((a, b) => (b[orderBy] < a[orderBy] ? -1 : 1))
        : this.state.data.sort((a, b) => (a[orderBy] < b[orderBy] ? -1 : 1));

    this.setState({
      data,
      order,
      orderBy
    });
  };

  handleSelectAllClick = (event, checked) => {
    if (checked) {
      this.setState({
        selected: this.state.data.map(n => n.id)
      });
      return;
    }
    this.setState({
      selected: []
    });
  };

  handleKeyDown = (event, id) => {
    if (keycode(event) === "space") {
      this.handleClick(event, id);
    }
  };

  handleClick = (event, id) => {
    const { selected } = this.state;
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    this.setState({
      selected: newSelected
    });
  };

  handleChangePage = (event, page) => {
    this.setState({
      page
    });
  };

  handleChangeRowsPerPage = event => {
    this.setState({
      rowsPerPage: event.target.value
    });
  };

  onCancelAlert = () => {
    this.setState({
      showAlert: false
    });
  };

  onCancelDelete = () => {
    this.setState({
      showConfirm: false
    });
  };

  onCloneCancel = () => {
    this.setState({
      showCloneConfirm: false
    });
  };
  handleChangeHandler = name => event => {
    this.setState({ [name]: event.target.value });
  };

  onSearchChange = name => e => {
    this.props.fetchAllDids(0, this.state.rowsPerPage, this.state.search_value);
  };

  isSelected = id => this.state.selected.indexOf(id) !== -1;

  constructor(props, context) {
    super(props, context);

    this.state = {
      order: "asc",
      orderBy: "script_id",
      selected: [],
      data: [],
      page: 0,
      rowsPerPage: 25,
      showAlert: false,
      alertContent: "",
      alertTitle: "",
      showConfirm: false,
      showCloneConfirm: false,
      deleteScriptId: "",
      fromScriptId: "",
      newScriptId: "",
      fromScriptIdError: false,
      newScriptIdError: false,
      showClonePopup: false,
      isLoading: false,
      search_value: ""
    };
  }

  showAlert(status, msg) {
    this.setState({
      alertTitle: status,
      alertContent: msg,
      showAlert: true
    });
  }

  handleActiveChange = (event, data) => {
    var let_this = this;

    let formData = {
      script_id: event.target.value,
      active: data ? "Y" : "N"
    };

    setTimeout(function() {
      let_this.props.updateRecord(formData);
    }, 10);
  };

  handleDeleteScript = id => {
    this.setState({
      showConfirm: true,
      deleteScriptId: id
    });
  };

  handleEditScript = id => {
    this.props.history.push("edit/" + id);
  };

  handleDeleteConfirm = () => {
    var let_this = this;
    this.onCancelDelete();
    let formData = {
      id: this.state.deleteScriptId
    };

    setTimeout(function() {
      let_this.props.deleteRecord(formData);
    }, 10);
  };

  handleCloneClose = () => {
    this.setState({ showClonePopup: false });
    this.setState({
      fromScriptId: "",
      newScriptId: ""
    });
  };

  handleStartCloning = () => {
    var isError = false;
    if (this.state.fromScriptId == "") {
      this.setState({ fromScriptIdError: true });
      isError = true;
    } else {
      this.setState({ fromScriptIdError: false });
    }

    if (this.state.newScriptId == "") {
      this.setState({ newScriptIdError: true });
      isError = true;
    } else {
      this.setState({ newScriptIdError: false });
    }

    if (!isError) this.setState({ showCloneConfirm: true });
  };

  handleShowClonePopup = () => {
    this.setState({
      fromScriptId: "",
      newScriptId: "",
      newScriptIdError: false,
      fromScriptIdError: false
    });

    this.setState({ showClonePopup: true });
  };

  handleCloneConfirm = () => {
    this.setState({ showCloneConfirm: false });
    let _this = this;
    axios
      .post("/api/admin-utilities/clone-script", {
        new_script_id: this.state.newScriptId,
        from_script_id: this.state.fromScriptId
      })
      .then(response => {
        _this.setState({
          alertTitle: response.data.status,
          alertContent: response.data.msg,
          showAlert: true
        });

        if (response.data.status == "Success") {
          this.props.history.push("edit/" + this.state.newScriptId);
        }
      })
      .catch(function(error) {
        _this.setState({
          alertTitle: ERROR,
          alertContent: ERROR_MSG,
          showAlert: true
        });
      });
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });

    if (name == "fromScriptId" && event.target.value != "") {
      this.setState({ fromScriptIdError: false });
    } else if (name == "newScriptId" && event.target.value != "") {
      this.setState({ newScriptIdError: false });
    }
  };

  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      data: nextPropsFromRedux.admin_utilites.data,
      alertTitle: nextPropsFromRedux.admin_utilites.status,
      showAlert: nextPropsFromRedux.admin_utilites.showMessage,
      alertContent: nextPropsFromRedux.admin_utilites.alertMessage
    });
  }

  componentDidMount() {
    this.fetchList(0, this.state.rowsPerPage);
  }
  // Pagination section
  fetchList(page = 0, page_size = 10) {
    let $this = this;
    let rowsPerPage = $this.state.rowsPerPage;
    let current_page = page + 1;
    this.props.fetchAllScript(current_page, page_size);
  }

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
    this.fetchList(this.state.page, event.target.value);
  };
  //handle  methods && custome Handler
  changePageHandler = (event, page) => {
    this.setState({ page });
    this.fetchList(page, this.state.rowsPerPage);
  };

  changeRowsPerPageHandler = event => {
    this.setState({ rowsPerPage: event.target.value });
    this.fetchList(this.state.page, event.target.value);
  };

  render() {
    const {
      data,
      order,
      orderBy,
      selected,
      rowsPerPage,
      page,
      showAlert,
      alertContent,
      alertTitle,
      showConfirm,
      showClonePopup,
      showCloneConfirm,
      fromScriptId,
      newScriptId,
      fromScriptIdError,
      newScriptIdError,
      search_value
    } = this.state;

    showAlert ? createNotification(alertTitle, alertTitle, alertContent) : "";
    showAlert ? createNotification(alertTitle, alertTitle, alertContent) : "";

    return (
      <div>
        <ContainerHeader match={this.props.match} title="Scripts" />

        <Paper>
          <SweetAlert
            show={showConfirm}
            warning
            showCancel
            confirmBtnText="Yes Delete It"
            confirmBtnBsStyle="danger"
            cancelBtnBsStyle="default"
            title=""
            onConfirm={this.handleDeleteConfirm}
            onCancel={this.onCancelDelete}
          >
            Are you sure to delete this Script permanently?
          </SweetAlert>

          <SweetAlert
            show={showCloneConfirm}
            warning
            showCancel
            confirmBtnText="Yes Clone It"
            confirmBtnBsStyle="danger"
            cancelBtnBsStyle="default"
            title=""
            onConfirm={this.handleCloneConfirm}
            onCancel={this.onCloneCancel}
          >
            Are you sure that you want to clone script from{" "}
            <strong>{this.state.fromScriptId} </strong> to{" "}
            <strong>{this.state.newScriptId} </strong>?
          </SweetAlert>

          <Dialog
            maxWidth="md"
            fullWidth={true}
            open={showClonePopup}
            onClose={this.handleCloneClose}
          >
            <DialogTitle>Clone a Script</DialogTitle>
            <DialogContent>
              <TextField
                id="from-script-id"
                select
                tabIndex="-1"
                error={fromScriptIdError}
                value={fromScriptId}
                onChange={this.handleChange("fromScriptId")}
                label="From script id *"
                SelectProps={{}}
                helperText="Your new script will be cloned from this script."
                margin="normal"
                fullWidth
              >
                {data.map(option => (
                  <MenuItem key={option.script_id} value={option.script_id}>
                    {option.script_id}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                autoFocus
                tabIndex="1"
                error={newScriptIdError}
                value={newScriptId}
                onChange={this.handleChange("newScriptId")}
                margin="dense"
                id="new-script-id"
                label="New script id *"
                type="email"
                helperText="This is your new Script ID."
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleCloneClose} color="secondary">
                Cancel
              </Button>
              <Button onClick={this.handleStartCloning} color="primary">
                Start Cloning
              </Button>
            </DialogActions>
          </Dialog>

          <Toolbar className="table-header">
            <div className="title">
              <h3>
                <i className="zmdi zmdi-view-web mr-2" />
                Script Listing
              </h3>
            </div>
            <div className="spacer" />
            <div className="search-bar right-side-icon bg-transparent search-dropdown">
              <div className="form-group">
                <input
                  className="form-control border-0"
                  type="search"
                  name="search_value"
                  value={search_value}
                  //disabled={this.props.inbound.isLoading}
                  onChange={this.handleChangeHandler("search_value")}
                />
                <button className="search-icon">
                  <i
                    className="zmdi zmdi-search zmdi-hc-lg"
                    onClick={this.onSearchChange("search_value")}
                  />
                </button>
              </div>
            </div>
            <div className="actions">
              <Tooltip title="Clone for Script">
                <IconButton
                  className="btn-sm"
                  aria-label="Delete"
                  onClick={this.handleShowClonePopup}
                >
                  <i className="zmdi zmdi-copy font-20" />
                </IconButton>
              </Tooltip>
            </div>
          </Toolbar>
          <div className="flex-auto">
            <div className="table-responsive-material">
              <Table className="">
                <DataTableHead
                  numSelected={selected.length}
                  order={order}
                  orderBy={orderBy}
                  onSelectAllClick={this.handleSelectAllClick}
                  onRequestSort={this.handleRequestSort}
                  rowCount={data.length}
                />
                <TableBody>
                  {data &&
                    data.map(n => {
                      const isSelected = this.isSelected(n.id);
                      return (
                        <TableRow key={++counter}>
                          <TableCell>{n.script_id}</TableCell>
                          <TableCell>{n.script_name}</TableCell>
                          <TableCell className="text-center">
                            <Switch
                              value={n.script_id}
                              onChange={this.handleActiveChange}
                              defaultChecked={n.active == "Y"}
                              ref={n.script_id}
                              color="primary"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Tooltip title="Modify Script">
                              <IconButton
                                onClick={() =>
                                  this.handleEditScript(n.script_id)
                                }
                              >
                                <a className="teal-text">
                                  <i className="fa fa-pencil" />
                                </a>
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Delete Script">
                              <IconButton
                                onClick={() =>
                                  this.handleDeleteScript(n.script_id)
                                }
                              >
                                <a className="red-text">
                                  <i className="fa fa-times" />
                                </a>
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  {data &&
                  data.length == 0 &&
                  this.props.admin_utilites.isLoading ? (
                    <TableRow>
                      <TableCell colSpan="11">
                        <center>Loading ......... </center>
                      </TableCell>
                    </TableRow>
                  ) : data && data.length == 0 ? (
                    <TableRow>
                      <TableCell colSpan="11">
                        <center>No Records Found </center>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell colSpan="11">
                        <center> </center>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      count={data.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onChangePage={this.handleChangePage}
                      onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        </Paper>
        {this.state.isLoading && (
          <div className="loader-view">
            <CircularProgress />
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  console.log(state);

  return {
    admin_utilites: state.admin_utilites
  };
}

const mapDispatchToProps = {
  fetchAllScript,
  updateRecord,
  deleteRecord,
  cloneRecord
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(List);
