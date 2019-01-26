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
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import SortableList from "./comman/status";
import Clone from "./../../../comman/clone";
import {
  fetchAllCampaign,
  updateRecord,
  deleteRecord,
  cloneRecord,
  getCampaignStatus
} from "../../../../actions/";
import { DEFAULT_PAGINATION } from "../../../../../../../constants/ActionTypes";
let counter = 0;

const columnData = [
  { id: "Campaign", label: "Campaign" },
  { id: "Name", label: "Name" },
  { id: "Status", label: "Status" },
  { id: "Modify", textAlign: " text-center", label: "Modify" }
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

  isSelected = id => this.state.selected.indexOf(id) !== -1;

  constructor(props, context) {
    super(props, context);

    this.state = {
      order: "asc",
      orderBy: "script_id",
      selected: [],
      data: [],
      page: 0,
      ajaxdata: [],
      rowsPerPage: DEFAULT_PAGE_SIZE,
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
      search_value: "",
      total: "",
      ajaxdata: []
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

  handleEditStatus = id => {
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

  handleChangeHandler = name => event => {
    this.setState({ [name]: event.target.value, showAlert: false });
  };

  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      //data: nextPropsFromRedux.campaign.data,
      ajaxdata: nextPropsFromRedux.Campaign.data,
      total: nextPropsFromRedux.Campaign.total,
      alertTitle: nextPropsFromRedux.Campaign.status,
      showAlert: nextPropsFromRedux.Campaign.showMessage,
      alertContent: nextPropsFromRedux.Campaign.showMessage
    });
  }
  handleEditEventHandler = id => {
    this.props.history.push("edit/" + id);
  };
  componentDidMount() {
    this.getCampaignStatusList(0, this.state.rowsPerPage);
  }
  onSearchChange = name => e => {
    this.setState({ showAlert: false });
    let rowsPerPage = this.state.rowsPerPage;
    this.props.getCampaignStatus(0, rowsPerPage, this.state.search_value);
  };
  // Pagination section
  getCampaignStatusList(page = 0, page_size = 10) {
    let $this = this;
    let rowsPerPage = $this.state.rowsPerPage;
    let current_page = page + 1;
    this.props.getCampaignStatus(current_page, page_size);
  }
  handleKeyPress = event => {
    if (event.key == "Enter") {
      this.setState({ showAlert: false });
      let rowsPerPage = this.state.rowsPerPage;
      this.props.getCampaignStatus(0, rowsPerPage, this.state.search_value);
    }
  };
  openCloneDialog = () => {
    this.setState({ openClone: !this.state.openClone, showAlert: false });
  };
  handleCloneClose = () => {
    this.setState({ showClonePopup: false });
  };
  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
    this.getCampaignStatusList(this.state.page, event.target.value);
  };
  //handle  methods && custome Handler
  changePageHandler = (event, page) => {
    this.setState({ page });
    this.getCampaignStatusList(page, this.state.rowsPerPage);
  };

  changeRowsPerPageHandler = event => {
    this.setState({ rowsPerPage: event.target.value });
    this.getCampaignStatusList(this.state.page, event.target.value);
  };

  render() {
    const {
      data,
      order,
      orderBy,
      selected,
      rowsPerPage,
      page,

      search_value,
      total,
      ajaxdata
    } = this.state;

    console.log("++++++++++");
    console.log(data);
    return (
      <div>
        <ContainerHeader match={this.props.match} title="Statuses" />

        <Paper>
          <Toolbar className="table-header">
            <div className="title">
              <h3>
                <i className="zmdi zmdi-view-web mr-2" /> Custom Campaign
                Statuses
              </h3>
            </div>
            <div className="spacer" />
            <div className="actions" />
            <div className="search-bar right-side-icon bg-transparent search-dropdown">
              <div className="form-group">
                <input
                  className="form-control border-0"
                  type="search"
                  name="search_value"
                  disabled={this.props.Campaign.isLoading}
                  value={search_value}
                  onChange={this.handleChangeHandler("search_value")}
                  onKeyPress={this.handleKeyPress}
                />
                <button className="search-icon">
                  <i
                    className="zmdi zmdi-search zmdi-hc-lg"
                    onClick={this.onSearchChange("search_value")}
                  />
                </button>
              </div>
            </div>
            <Tooltip title="Clone ">
              <IconButton
                className="btn-sm"
                aria-label="Delete"
                onClick={this.openCloneDialog}
              >
                <i className="zmdi zmdi-copy font-20" />
              </IconButton>
            </Tooltip>
            <Dialog
              maxWidth="md"
              fullWidth={true}
              open={this.state.openClone}
              onClose={this.handleCloneClose}
            >
              <DialogTitle>{"Clone a Status "}</DialogTitle>
              <DialogContent>
                <Clone
                  closeClone={this.handleSaveCloneClose}
                  close={this.openCloneDialog}
                  type="Status"
                />
              </DialogContent>
              <DialogActions />
            </Dialog>
          </Toolbar>
          <div className="flex-auto">
            <div className="table-responsive-material">
              <Table
                className="Agent-table"
                id="agent-table"
                style={{ wordBreak: "break-word" }}
              >
                <DataTableHead
                  numSelected={1}
                  order={order}
                  orderBy={orderBy}
                  onSelectAllClick={this.handleSelectAllClick}
                  onRequestSort={this.handleRequestSort}
                  rowCount={parseInt(total)}
                />
                <TableBody>
                  {ajaxdata &&
                    this.props.Campaign.sectionin ==
                      "Campaign Status list Success" &&
                    ajaxdata.map((n, i) => {
                      return (
                        <TableRow key={i}>
                          <TableCell>{n.campaign_id}</TableCell>
                          <TableCell>{n.campaign_name}</TableCell>
                          <TableCell>{n[0]}</TableCell>
                          <TableCell className="text-center">
                            <Tooltip title="Modify Campaign Status ">
                              <IconButton>
                                <a
                                  className="teal-text"
                                  onClick={() =>
                                    this.handleEditEventHandler(n.campaign_id)
                                  }
                                >
                                  <i
                                    className={
                                      n[0] == "NONE"
                                        ? "fa fa-plus"
                                        : "fa fa-pencil"
                                    }
                                  />
                                </a>
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                  {ajaxdata.length == 0 && this.props.Campaign.isLoading ? (
                    <TableRow>
                      <TableCell colSpan="11">
                        <center>Loading ......... </center>
                      </TableCell>
                    </TableRow>
                  ) : ajaxdata.length == 0 ? (
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
                      count={parseInt(total)}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onChangePage={this.changePageHandler}
                      onChangeRowsPerPage={this.changeRowsPerPageHandler}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        </Paper>
        <div style={{ height: "30px" }} />
        <Paper>
          <SortableList />
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
  return {
    Campaign: state.campaign
  };
}

const mapDispatchToProps = {
  fetchAllCampaign,
  updateRecord,
  deleteRecord,
  cloneRecord,
  getCampaignStatus
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(List);
