import {
  React,
  connect,
  ContainerHeader,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Toolbar,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "../../../../../../../components/plugins.js";
import { GLOBAL_FAILURE_MEASSAGE } from "../../../../../../../constants/ActionTypes";
import { createNotification } from "../../../../../../../Helpers";
import { fetchAllListFpg } from "../../../../actions/";

import DataTableHead from "./DataTableHead";

let counter = 0;

class List extends React.Component {
  //table sort function
  handleRequestSort = (event, property) => {
    let temp_data = this.props.Campaign.data;
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
  //pagination functions
  handleChangePage = (event, page) => {
    this.setState({ page });
  };
  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };
  handleAddEventHandler = () => {
    this.props.history.push("add/");
  };
  //calss  constructor
  constructor(props, context) {
    super(props, context);
    this.state = {
      order: "asc",
      orderBy: "",
      selected: [],
      data: [],
      page: 0,
      rowsPerPage: DEFAULT_PAGE_SIZE,
      showAlert: false,
      error: false,
      alertContent: "",
      alertTitle: "",
      isLoading: false,
      search_value: "",
      ajaxdata: [],
      openClone: false
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
      "ViciCampaign.campaign_id": event.target.value,
      active: data ? "Y" : "N"
    };

    setTimeout(function() {
      // let_this.props.updateRecord(formData);
    }, 10);
  };

  downloadCsv = id => {
    let _this = this;
    _this.setState({ isLoding: true });
    axios
      .get("/api/download-filter-phone-numbers?filter_phone_group_id=" + id)
      .then(response => {
        _this.setState({ temp_data: response.data, isLoding: false });
        // Just for the demo
        var res = response.data;
        var data = new Blob([res], { type: "text/csv" }),
          csvURL = window.URL.createObjectURL(data),
          tempLink = document.createElement("a");
        tempLink.href = csvURL;
        tempLink.setAttribute("download", id + "CSVFile.csv");
        tempLink.click();
        createNotification("Success", "Success", "Record Download Sucessfully");
      })
      .catch(function(error) {
        _this.setState({ isLoding: false });
        createNotification("Error", "Error", "Somthing Went Wrong !!!!");
      });
  };

  handleAddEvent = id => {
    this.props.history.push("edit/" + id);
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      ajaxdata: nextPropsFromRedux.Campaign.data,
      // total: nextPropsFromRedux.Campaign.total,
      alertTitle: nextPropsFromRedux.Campaign.status,
      showAlert: nextPropsFromRedux.Campaign.showMessage,
      alertContent: nextPropsFromRedux.Campaign.showMessage,
      error: nextPropsFromRedux.Campaign.error
    });
  }

  componentDidMount() {
    this.getCampaignRecycleList(0, this.state.rowsPerPage);
  }
  onSearchChange = name => e => {
    this.setState({ showAlert: false });
    let rowsPerPage = this.state.rowsPerPage;
    this.props.fetchAllListFpg(0, rowsPerPage, this.state.search_value);
  };
  // Pagination section
  getCampaignRecycleList(page = 0, page_size = 10) {
    let $this = this;
    let rowsPerPage = $this.state.rowsPerPage;
    let current_page = page + 1;
    this.props.fetchAllListFpg(current_page, page_size);
  }
  handleKeyPress = event => {
    if (event.key == "Enter") {
      this.setState({ showAlert: false });
      let rowsPerPage = this.state.rowsPerPage;
      this.props.fetchAllListFpg(0, rowsPerPage, this.state.search_value);
    }
  };
  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
    this.getCampaignRecycleList(this.state.page, event.target.value);
  };
  //handle  methods && custome Handler
  changePageHandler = (event, page) => {
    this.setState({ page });
    this.getCampaignRecycleList(page, this.state.rowsPerPage);
  };
  openCloneDialog = () => {
    this.setState({ openClone: !this.state.openClone });
  };
  changeRowsPerPageHandler = event => {
    this.setState({ rowsPerPage: event.target.value });
    this.getCampaignRecycleList(this.state.page, event.target.value);
  };
  handleChangeHandler = name => event => {
    this.setState({ [name]: event.target.value, showAlert: false });
  };

  render() {
    const {
      data,
      order,
      orderBy,
      rowsPerPage,
      page,
      search_value,
      total,
      isLoading,
      ajaxdata,
      error
    } = this.state;

    const { campaign } = this.props;

    const divStyle = { padding: "4px 30px 4px 24px" };
    error ? createNotification(ERROR, ERROR, GLOBAL_FAILURE_MEASSAGE) : "";
    return (
      <div>
        <ContainerHeader
          match={this.props.match}
          title="Campaign Areacode CID Listing"
        />
        <Dialog
          maxWidth="md"
          fullWidth={true}
          open={this.state.openClone}
          onClose={this.handleCloneClose}
        >
          <DialogTitle>{"Add Lead Recycle "}</DialogTitle>
          <DialogContent />
          <DialogActions />
        </Dialog>
        ;
        <Paper>
          <Toolbar className="table-header">
            <div className="title">
              <h3>
                <i className="zmdi zmdi-view-web mr-2" /> List
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

            <Tooltip title="Add New FPG">
              <IconButton
                className="btn-sm"
                aria-label="Add"
                onClick={this.handleAddEventHandler}
              >
                <i className="fa fa-plus-circle" aria-hidden="true" />
              </IconButton>
            </Tooltip>
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
                  rowCount={parseInt("200")}
                />
                <TableBody>
                  {ajaxdata &&
                    ajaxdata.map((n, i) => {
                      return (
                        <TableRow key={i}>
                          <TableCell>{n.group_id}</TableCell>
                          <TableCell>{n.group_name}</TableCell>
                          <TableCell>{n.description}</TableCell>
                          <TableCell>{n.user_group}</TableCell>
                          <TableCell>{n.phone_count}</TableCell>
                          <TableCell>
                            <Tooltip title="Download">
                              <IconButton
                                onClick={() => this.downloadCsv(n.group_id)}
                              >
                                <i
                                  className="fa fa-download"
                                  aria-hidden="true"
                                />
                              </IconButton>
                            </Tooltip>
                          </TableCell>

                          <TableCell className="text-center">
                            <Tooltip title="Modify Campaign Status ">
                              <IconButton>
                                <a
                                  className="teal-text"
                                  onClick={() =>
                                    this.handleAddEvent(n.group_name)
                                  }
                                >
                                  <i className="fa fa-pencil" />
                                </a>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Campaign">
                              <IconButton
                                onClick={() =>
                                  this.DeleteInboundHandler(n.group_name)
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
                      count={parseInt("200")}
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
        {this.props.Campaign.isLoading ||
          (this.state.isLoding && (
            <div className="loader-view" id="loader-view">
              <CircularProgress />
            </div>
          ))}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  console.log(state);

  return {
    Campaign: state.inbound
  };
}

const mapDispatchToProps = {
  fetchAllListFpg
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(List);
