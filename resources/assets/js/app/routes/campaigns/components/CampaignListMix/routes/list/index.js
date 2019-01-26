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
import { getCampaignListMix } from "../../../../actions/";
import DataTableHead from "./DataTableHead";
let counter = 0;

class List extends React.Component {
  //table sort function
  handleRequestSort = (event, property) => {
    let temp_data = this.props.campaign.data;
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

  //calss  constructor
  constructor(props, context) {
    super(props, context);
    this.state = {
      order: "asc",
      orderBy: "",
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
      search_value: "",
      ajaxdata: []
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

  handleAddEvent = id => {
    this.props.history.push("add/" + id);
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      ajaxdata: nextPropsFromRedux.Campaign.data,
      total: nextPropsFromRedux.Campaign.total,
      alertTitle: nextPropsFromRedux.Campaign.status,
      showAlert: nextPropsFromRedux.Campaign.showMessage,
      alertContent: nextPropsFromRedux.Campaign.showMessage
    });
  }

  componentDidMount() {
    this.getCampaignListMixList(0, this.state.rowsPerPage);
  }
  onSearchChange = name => e => {
    this.setState({ showAlert: false });
    let rowsPerPage = this.state.rowsPerPage;
    this.props.getCampaignListMix(0, rowsPerPage, this.state.search_value);
  };
  // Pagination section
  getCampaignListMixList(page = 0, page_size = 10) {
    let $this = this;
    let rowsPerPage = $this.state.rowsPerPage;
    let current_page = page + 1;
    this.props.getCampaignListMix(current_page, page_size);
  }
  handleKeyPress = event => {
    if (event.key == "Enter") {
      this.setState({ showAlert: false });
      let rowsPerPage = this.state.rowsPerPage;
      this.props.getCampaignListMix(0, rowsPerPage, this.state.search_value);
    }
  };
  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
    this.getCampaignListMixList(this.state.page, event.target.value);
  };
  //handle  methods && custome Handler
  changePageHandler = (event, page) => {
    this.setState({ page });
    this.getCampaignListMixList(page, this.state.rowsPerPage);
  };

  changeRowsPerPageHandler = event => {
    this.setState({ rowsPerPage: event.target.value });
    this.getCampaignListMixList(this.state.page, event.target.value);
  };
  handleChangeHandler = name => event => {
    this.setState({ [name]: event.target.value, showAlert: false });
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
      search_value,
      total,
      isLoading,
      ajaxdata
    } = this.state;

    const { campaign } = this.props;

    const divStyle = { padding: "4px 30px 4px 24px" };
    return (
      <div>
        <ContainerHeader
          match={this.props.match}
          title="Campaign List Mix Listings"
        />

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
                      "Campaign List Mix Success" &&
                    ajaxdata.map((n, i) => {
                      return (
                        <TableRow key={i}>
                          <TableCell>{n.campaign_id}</TableCell>
                          <TableCell>{n.campaign_name}</TableCell>
                          <TableCell>{n.list_mix}</TableCell>
                          <TableCell className="text-center">
                            <Tooltip title="Modify Campaign Status ">
                              <IconButton>
                                <a
                                  className="teal-text"
                                  onClick={() =>
                                    this.handleAddEvent(n.campaign_id)
                                  }
                                >
                                  <i className="fa fa-plus" />
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
        {this.props.Campaign.isLoading && (
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
    Campaign: state.campaign
  };
}

const mapDispatchToProps = {
  getCampaignListMix
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(List);
