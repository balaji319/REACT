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
import { fetchAllCallMenu, updateRecord } from "../../../../actions/";
import DataTableHead from "./DataTableHead";
import { createNotification } from "../../../../../../../Helpers";
let counter = 0;

class List extends React.Component {
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
      deleteScriptId: "",
      fromScriptId: "",
      newScriptId: "",
      isLoading: false,
      total: "",
      search_value: "",
      deleteID: ""
    };
  }

  //alert msg
  showAlert(status, msg) {
    this.setState({
      alertTitle: status,
      alertContent: msg,
      showAlert: true
    });
  }

  //active  switch changes
  handleActiveChange = (event, data) => {
    var let_this = this;
    let formData = {
      group_id: event.target.value,
      active: data ? "Y" : "N"
    };

    setTimeout(function() {
      let_this.props.updateRecord(formData);
    }, 10);
  };

  handleEditEvent = id => {
    this.props.history.push("edit/" + id);
  };

  handleDidEvent = id => {
    this.props.history.push("InboundGroup/" + id);
  };

  handleChangeHandler = name => event => {
    this.setState({ [name]: event.target.value });
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      alertTitle: nextPropsFromRedux.inbound.status,
      showAlert: nextPropsFromRedux.inbound.showMessage,
      alertContent: nextPropsFromRedux.inbound.showMessage,
      total: nextPropsFromRedux.inbound.total
    });
  }

  componentDidMount() {
    this.getDidList(0, this.state.rowsPerPage);
  }
  getDidList(page = 0, page_size = 10) {
    let $this = this;
    let rowsPerPage = $this.state.rowsPerPage;
    let current_page = page + 1;
    this.props.fetchAllCallMenu(current_page, page_size);
  }
  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
    this.getDidList(this.state.page, event.target.value);
  };
  //handle  methods && custome Handler
  changePageHandler = (event, page) => {
    this.setState({ page });
    this.getDidList(page, this.state.rowsPerPage);
  };
  onSearchChange = name => e => {
    let rowsPerPage = this.state.rowsPerPage;
    this.props.fetchAllCallMenu(0, rowsPerPage, this.state.search_value);
  };
  changeRowsPerPageHandler = event => {
    this.setState({ rowsPerPage: event.target.value });
    this.getDidList(this.state.page, event.target.value);
  };
  handleKeyPress = event => {
    if (event.key == "Enter") {
      this.setState({ showAlert: false });
      let rowsPerPage = this.state.rowsPerPage;
      this.props.fetchAllCallMenu(0, rowsPerPage, this.state.search_value);
    }
  };
  DeleteConfirmHandler = () => {
    let _this = this;
    this.onCancelDeleteHandler();
    let URl = "/api/callmenu/delete";
    _this.setState({ isLoding: true });
    axios
      .get(URl + "/" + this.state.deleteID)
      .then(response => {
        createNotification("Success", "Success", "Record Deleted Sucessfully");
        _this.setState({ isLoding: false });
        this.getDidList(0, this.state.rowsPerPage);
      })
      .catch(function(error) {
        createNotification("Error", "Error", error.response.data.msg);

        _this.setState({ isLoding: false });
      });
  };
  handleAddEventHandler = () => {
    this.props.history.push("add/");
  };
  onCancelDeleteHandler = () => {
    this.setState({ showConfirm: false });
  };
  DeleteEventHandler = id => {
    this.setState({ showConfirm: true, deleteID: id });
  };
  render() {
    const {
      data,
      order,
      orderBy,
      selected,
      total,
      rowsPerPage,
      search_value,
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
      newScriptIdError
    } = this.state;

    const { inbound } = this.props;

    const divStyle = { padding: "4px 30px 4px 24px" };

    return (
      <div>
        <ContainerHeader match={this.props.match} title="Call Menu Listing" />
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
        <Paper>
          <Toolbar className="table-header">
            <div className="title">
              <h3>
                <i className="zmdi zmdi-view-web mr-2" /> Listing
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
            <div className="actions">
              <Tooltip title="Add New FPG">
                <IconButton
                  className="btn-sm"
                  aria-label="Add"
                  onClick={this.handleAddEventHandler}
                >
                  <i className="fa fa-plus-circle" aria-hidden="true" />
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
                  rowCount={parseInt(total)}
                />
                <TableBody>
                  {inbound.data.map(n => {
                    return (
                      <TableRow key={n.menu_id}>
                        <TableCell style={divStyle}>{n.menu_id}</TableCell>
                        <TableCell style={divStyle}>{n.menu_name}</TableCell>
                        <TableCell style={divStyle}>{n.user_group}</TableCell>
                        <TableCell style={divStyle}>{n.menu_prompt}</TableCell>
                        <TableCell style={divStyle}>
                          {n.menu_timeout}{" "}
                        </TableCell>
                        <TableCell style={divStyle}>{n.count} </TableCell>
                        <TableCell style={divStyle}>
                          <img
                            src="https://png.icons8.com/material/50/000000/keypad.png"
                            onClick={() => this.handleDidEvent(n.menu_id)}
                            style={{
                              width: "33%",
                              marginLeft: "12px",
                              cursor: "pointer"
                            }}
                          />
                        </TableCell>
                        <TableCell
                          style={divStyle}
                          className="text-center"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          <Tooltip title="Modify Call Menu ">
                            <IconButton
                              onClick={() => this.handleEditEvent(n.menu_id)}
                            >
                              <a className="teal-text">
                                <i className="fa fa-pencil" />
                              </a>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Call Menu">
                            <IconButton
                              onClick={() => this.DeleteEventHandler(n.menu_id)}
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
    inbound: state.inbound
  };
}

const mapDispatchToProps = {
  fetchAllCallMenu,
  updateRecord
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(List);
