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
} from "./plugins";
import {
  fetchAllInbound,
  updateRecord,
  deleteRecord
} from "../../../../actions/";
import DataTableHead from "./DataTableHead";
import FullScreenDialog from "./../comman/addsection/FullScreenDialog.js";
import { createNotification } from "../../../../../../../Helpers";
import { GLOBAL_FAILURE_MEASSAGE } from "../../../../../../../constants/ActionTypes";
import ClonePopUp from "./../comman/Clone";

let counter = 0;

class List extends React.Component {
  //calss  constructor
  constructor(props, context) {
    super(props, context);
    this.state = {
      order: "asc",
      orderBy: "group_id",
      selected: [],
      data: [],
      page: 0,
      rowsPerPage: DEFAULT_PAGE_SIZE,
      showAlert: false,
      alertContent: "",
      alertTitle: "",
      showConfirm: false,
      deleteInboundId: "",
      fromScriptId: "",
      newScriptId: "",
      isLoading: false,
      total: "",
      error: false,
      search_value: "",
      openClone: false,
      ajaxData: []
    };
  }

  //table sort function
  handleRequestSort = (event, property) => {
    let temp_data = this.props.inbound.data;
    const orderBy = property;
    let order = "desc";
    if (this.state.orderBy === property && this.state.order === "desc") {
      order = "asc";
    }
    const data =
      order === "desc"
        ? temp_data.sort((a, b) => (b[orderBy] < a[orderBy] ? -1 : 1))
        : temp_data.sort((a, b) => (a[orderBy] < b[orderBy] ? -1 : 1));
    this.setState({ data, order, orderBy });
  };

  //active  switch changes
  statusChangeHandler = (event, data) => {
    var let_this = this;
    let formData = {
      group_id: event.target.value,
      active: data ? "Y" : "N"
    };
    setTimeout(function() {
      let_this.props.updateRecord(formData);
    }, 10);
  };

  DeleteConfirmHandler = () => {
    var let_this = this;
    this.onCancelDeleteHandler();
    let formData = {
      group_id: this.state.deleteInboundId
    };
    setTimeout(function() {
      let_this.props.deleteRecord(formData);
    }, 10);
  };

  DeleteInboundHandler = id => {
    this.setState({ showConfirm: true, deleteInboundId: id });
  };

  handleEditEventHandler = id => {
    this.props.history.push("edit/" + id);
  };

  DidEventHandler = id => {
    this.props.history.push("didInGroup/" + id);
  };

  campaignToGroupHandler = id => {
    this.props.history.push("AssignCampaignToGroup/" + id);
  };

  CallMenEventHandler = id => {
    this.props.history.push("callMenuInGroup/" + id);
  };

  DidEventAgentHandler = id => {
    this.props.history.push("InboundGroup/report/" + id);
  };

  onCancelDeleteHandler = () => {
    this.setState({ showConfirm: false });
  };

  //alert msg
  showAlert(status, msg) {
    this.setState({ alertTitle: status, alertContent: msg, showAlert: true });
  }

  onCancelAlert = () => {
    this.setState({ showAlert: false });
  };
  handleShowClonePopup = () => {
    this.setState({ openClone: true });
  };

  handleChangeHandler = name => event => {
    this.setState({ [name]: event.target.value });
  };

  onSearchChange = name => e => {
    let rowsPerPage = this.state.rowsPerPage;
    this.props.fetchAllInbound(0, rowsPerPage, this.state.search_value);
  };

  // life cycle section
  // when component will recive props
  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      alertTitle: nextPropsFromRedux.inbound.alertMessageTitle,
      showAlert: nextPropsFromRedux.inbound.showMessage,
      alertContent: nextPropsFromRedux.inbound.alertMessage,
      total: nextPropsFromRedux.inbound.total,
      ajaxData: nextPropsFromRedux.inbound.data,
      error: nextPropsFromRedux.inbound.error
    });
  }

  // befour component mount
  componentDidMount() {
    this.getInboundList(0, this.state.rowsPerPage);
  }
  getInboundList(page = 0, page_size = 10) {
    let $this = this;
    let rowsPerPage = $this.state.rowsPerPage;
    let current_page = page + 1;
    this.props.fetchAllInbound(current_page, page_size);
  }
  handleKeyPress = event => {
    if (event.key == "Enter") {
      this.setState({ showAlert: false });
      let rowsPerPage = this.state.rowsPerPage;
      this.props.fetchAllInbound(0, rowsPerPage, this.state.search_value);
    }
  };
  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
    this.getInboundList(this.state.page, event.target.value);
  };
  //handle  methods && custome Handler
  changePageHandler = (event, page) => {
    this.setState({ page });
    this.getInboundList(page, this.state.rowsPerPage);
  };

  changeRowsPerPageHandler = event => {
    this.setState({ rowsPerPage: event.target.value });
    this.getInboundList(this.state.page, event.target.value);
  };
  handleRequestClose = value => {
    this.setState({ openClone: false });
  };

  render() {
    const {
      data,
      order,
      error,
      orderBy,
      selected,
      search_value,
      rowsPerPage,
      page,
      showAlert,
      alertContent,
      alertTitle,
      showConfirm,
      ajaxData,
      showClonePopup,
      showCloneConfirm,
      fromScriptId,
      newScriptId,
      fromScriptIdError,
      newScriptIdError,
      total
    } = this.state;
    const { inbound } = this.props;
    error ? createNotification("Error", "Error", GLOBAL_FAILURE_MEASSAGE) : "";
    (showAlert && alertTitle== "Success") ?  createNotification("Success", "Success", alertContent) : "";

    //custom style const
    const divStyle = { padding: "4px 30px 4px 24px" };

    return (
      <div>
        <ContainerHeader
          match={this.props.match}
          title="Inbound Queues Listing"
        />
        <FullScreenDialog />
        <ClonePopUp
          open={this.state.openClone}
          onClose={this.handleRequestClose.bind(this)}
        />;
        <Paper>
          {/* Confirmation promat  */}
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

          <Toolbar className="table-header">
            <div className="title">
              {" "}
              <h3>
                <i className="zmdi zmdi-view-web mr-2" /> Listing
              </h3>
            </div>
            <div className="spacer" />
            <div className="actions" style={{ display: "inline-flex" }}>
              <div className="search-bar right-side-icon bg-transparent search-dropdown">
                <div className="form-group">
                  <input
                    className="form-control border-0"
                    type="search"
                    name="search_value"
                    value={search_value}
                    disabled={this.props.inbound.isLoading}
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
              {/* <Tooltip title="Clone a Campaign">
                <IconButton
                  className="btn-sm"
                  aria-label="Delete"
                  onClick={this.handleShowClonePopup}
                >
                  <i className="zmdi zmdi-copy font-20" />
                </IconButton>
              </Tooltip> */}
            </div>
          </Toolbar>
          <div className="flex-auto">
            <div className="table-responsive-material">
              <Table className="inbound_list" id="inbound_list">
                <DataTableHead
                  numSelected={selected.length}
                  order={order}
                  orderBy={orderBy}
                  onSelectAllClick={this.handleSelectAllClick}
                  onRequestSort={this.handleRequestSort}
                  rowCount={ajaxData && ajaxData.length}
                />
                <TableBody>
                  {ajaxData &&
                    ajaxData.map((n, i) => {
                      return (
                        <TableRow key={i}>
                          <TableCell style={divStyle}>{n.group_id}</TableCell>
                          <TableCell style={divStyle}>{n.group_name}</TableCell>
                          <TableCell style={divStyle}>
                            {n.queue_priority}
                          </TableCell>
                          <TableCell style={divStyle} className="text-center">
                            <Switch
                              value={n.active}
                              onChange={this.statusChangeHandler}
                              defaultChecked={n.active == "Y"}
                              ref={n.group_id}
                              color="primary"
                            />
                          </TableCell>
                          <TableCell style={divStyle}>
                            {n.call_time_id}
                          </TableCell>
                          <TableCell
                            style={{
                              backgroundColor: n.group_color,
                              padding: "4px 30px 4px 24px"
                            }}
                          >
                            {n.group_color}{" "}
                          </TableCell>
                          <TableCell style={divStyle}>
                            <img
                              src="https://png.icons8.com/material/50/000000/circled-a.png"
                              onClick={() =>
                                this.DidEventAgentHandler(n.group_id)
                              }
                              style={{
                                width: "25%",
                                marginLeft: "20px",
                                cursor: "pointer"
                              }}
                            />{" "}
                          </TableCell>
                          <TableCell style={divStyle}>
                            <img
                              src="https://png.icons8.com/material/50/000000/keypad.png"
                              onClick={() => this.DidEventHandler(n.group_id)}
                              style={{
                                width: "25%",
                                marginLeft: "20px",
                                cursor: "pointer"
                              }}
                            />
                          </TableCell>
                          <TableCell style={divStyle}>
                            <img
                              src="https://png.icons8.com/material/50/000000/xbox-menu"
                              onClick={() =>
                                this.CallMenEventHandler(n.group_id)
                              }
                              style={{
                                width: "25%",
                                marginLeft: "20px",
                                cursor: "pointer"
                              }}
                            />
                          </TableCell>
                          <TableCell style={divStyle}>
                            <img
                              src="https://png.icons8.com/ios/50/000000/sales-channels-filled.png"
                              onClick={() =>
                                this.campaignToGroupHandler(n.group_id)
                              }
                              style={{
                                width: "25%",
                                marginLeft: "24px",
                                cursor: "pointer"
                              }}
                            />
                          </TableCell>
                          <TableCell
                            style={divStyle}
                            className="text-center"
                            style={{ whiteSpace: "nowrap" }}
                          >
                            <Tooltip title="Modify Inbound">
                              <IconButton
                                onClick={() =>
                                  this.handleEditEventHandler(n.group_id)
                                }
                              >
                                <a className="teal-text">
                                  <i className="fa fa-pencil" />
                                </a>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Inbound">
                              <IconButton
                                onClick={() =>
                                  this.DeleteInboundHandler(n.group_id)
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
                  {ajaxData &&
                  ajaxData.length == 0 &&
                  this.props.inbound.isLoading ? (
                    <TableRow>
                      <TableCell colSpan="11">
                        <center>Loading ......... </center>
                      </TableCell>
                    </TableRow>
                  ) : ajaxData && ajaxData.length == 0 ? (
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
        {this.props.inbound.isLoading && (
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
    inbound: state.inbound
  };
}

const mapDispatchToProps = {
  fetchAllInbound,
  updateRecord,
  deleteRecord
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(List);
