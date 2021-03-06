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
import { fetchAllFilterLists } from "../../../../actions/";
import DataTableHead from "./DataTableHead";
let counter = 0;

class List extends React.Component {
  //pagination functions
  handleChangePage = (event, page) => {
    this.setState({ page });
  };
  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
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
      rowsPerPage: 25,
      showAlert: false,
      alertContent: "",
      alertTitle: "",
      showConfirm: false,
      deleteScriptId: "",
      fromScriptId: "",
      newScriptId: "",
      isLoading: false,
      alertTitle: ""
    };
  }
  //table sort function
  handleRequestSort = (event, property) => {
    let temp_data = this.props.leadfilterlist.data;
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
      user_id: event.target.value,
      active: data ? "Y" : "N"
    };
    setTimeout(function() {
      let_this.props.updateStatusRecord(formData);
    }, 10);
  };

  statusChangeoutboundHandler = (event, data) => {
    var let_this = this;
    let formData = {
      user_id: event.target.value,
      closer_default_blended: data ? "1" : "0"
    };
    setTimeout(function() {
      let_this.props.updateStatusRecord(formData);
    }, 10);
  };

  DeleteConfirmHandler = () => {
    var let_this = this;
    this.onCancelDeleteHandler();
    let formData = {
      id: this.state.deleteInboundId
    };
    setTimeout(function() {
      let_this.props.deleteRecord(formData);
    }, 10);
  };

  //handle  methods && custome Handler
  changePageHandler = (event, page) => {
    this.setState({ page });
  };

  changeRowsPerPageHandler = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  DeleteInboundHandler = id => {
    this.setState({ showConfirm: true, deleteInboundId: id });
  };

  handleEditEventHandler = id => {
    id == "add"
      ? this.props.history.push("add")
      : this.props.history.push("edit/" + id);
  };

  inboundgroupsHandler = id => {
    this.props.history.push("inboundgroup/" + id);
  };

  campaignrankHandler = id => {
    this.props.history.push("campaignrank/" + id);
  };

  sercallbacHandler = id => {
    this.props.history.push("usercallback/" + id);
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

  handleChangeHandler = name => event => {
    this.setState({ [name]: event.target.value });
    if (name == "fromScriptId" && event.target.value != "") {
      this.setState({ fromScriptIdError: false });
    } else if (name == "newScriptId" && event.target.value != "") {
      this.setState({ newScriptIdError: false });
    }
  };

  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      alertTitle: nextPropsFromRedux.leadfilterlist
        ? nextPropsFromRedux.leadfilterlist.alertMessageTitle
        : "",
      showAlert: nextPropsFromRedux.leadfilterlist
        ? nextPropsFromRedux.leadfilterlist.showMessage
        : "",
      alertContent: nextPropsFromRedux.leadfilterlist
        ? nextPropsFromRedux.leadfilterlist.alertMessage
        : ""
    });
  }

  componentDidMount() {
    this.props.fetchAllFilterLists();
  }

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
      newScriptIdError
    } = this.state;

    const { leadfilterlist } = this.props;

    const divStyle = { padding: "4px 30px 4px 24px", textAlign: "left" };
    return (
      <div>
        <ContainerHeader
          match={this.props.match}
          title="Lead Filter Listing "
        />
        <Tooltip title="Add New Lead Filter">
          <Button
            variant="raised"
            className="bg-primary text-white"
            style={{ float: "right" }}
            onClick={() => this.handleEditEventHandler("add")}
          >
            Add New Lead Filter
          </Button>
        </Tooltip>
        <Paper>
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
          <SweetAlert
            show={showAlert}
            success={alertTitle === "Success" ? true : false}
            error={alertTitle === "Error" ? true : false}
            title=""
            onConfirm={this.onCancelAlert}
            onCancel={this.onCancelAlert}
          >
            {" "}
            {alertContent}{" "}
          </SweetAlert>

          <Toolbar className="table-header">
            <div className="title">
              <h3>
                <i className="zmdi zmdi-view-web mr-2" /> Listing
              </h3>
            </div>
            <div className="spacer" />
            <div className="actions" />
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
                  rowCount={leadfilterlist ? leadfilterlist.data.length : 1}
                />
                <TableBody>
                  {leadfilterlist ? (
                    leadfilterlist.data
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map(n => {
                        return (
                          <TableRow key={n.shift_id}>
                            <TableCell style={divStyle}>
                              {n.lead_filter_id}
                            </TableCell>
                            <TableCell style={divStyle}>
                              {n.lead_filter_name}
                            </TableCell>
                            <TableCell
                              style={divStyle}
                              className="text-center"
                              style={{ whiteSpace: "nowrap" }}
                            >
                              <Tooltip title="Modify Script">
                                <IconButton
                                  onClick={() =>
                                    this.handleEditEventHandler(
                                      n.lead_filter_id
                                    )
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
                                    this.DeleteInboundHandler(n.lead_filter_id)
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
                      })
                  ) : (
                    <TableRow>
                      <TableCell style={divStyle} />
                      <TableCell style={divStyle}> </TableCell>
                      <TableCell style={divStyle}> </TableCell>
                      <TableCell style={divStyle}> </TableCell>
                      <TableCell style={divStyle}>
                        {" "}
                        Loading ..........{" "}
                      </TableCell>
                      <TableCell style={divStyle}> </TableCell>
                      <TableCell style={divStyle}> </TableCell>
                      <TableCell style={divStyle}> </TableCell>
                      <TableCell style={divStyle}> </TableCell>
                      <TableCell
                        style={divStyle}
                        className="text-center"
                        style={{ whiteSpace: "nowrap" }}
                      />
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      count={leadfilterlist ? leadfilterlist.data.length : 1}
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
        {this.props.leadfilterlist &&
          this.props.leadfilterlist.isLoading && (
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
    leadfilterlist: state.admin_utilites
  };
}

const mapDispatchToProps = {
  fetchAllFilterLists
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(List);
