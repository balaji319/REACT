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
  CircularProgress
} from "./plugins";
import { getAreaCodesList } from "../../../../actions/";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import DataTableHead from "./DataTableHead";
import Clone from "./../../../comman/clone";
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
      total: nextPropsFromRedux.Campaign.total,
      alertTitle: nextPropsFromRedux.Campaign.status,
      showAlert: nextPropsFromRedux.Campaign.showMessage,
      alertContent: nextPropsFromRedux.Campaign.showMessage
    });
  }

  componentDidMount() {
    this.getCampaignRecycleList(0, this.state.rowsPerPage);
  }
  onSearchChange = name => e => {
    this.setState({ showAlert: false });
    let rowsPerPage = this.state.rowsPerPage;
    this.props.getAreaCodesList(0, rowsPerPage, this.state.search_value);
  };
  // Pagination section
  getCampaignRecycleList(page = 0, page_size = 10) {
    let $this = this;
    let rowsPerPage = $this.state.rowsPerPage;
    let current_page = page + 1;
    this.props.getAreaCodesList(current_page, page_size);
  }
  handleKeyPress = event => {
    if (event.key == "Enter") {
      this.setState({ showAlert: false });
      let rowsPerPage = this.state.rowsPerPage;
      this.props.getAreaCodesList(0, rowsPerPage, this.state.search_value);
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
      ajaxdata
    } = this.state;

    const { campaign } = this.props;

    const divStyle = { padding: "4px 30px 4px 24px" };
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
          <DialogContent>
            <Clone
              closeClone={this.handleSaveCloneClose}
              close={this.openCloneDialog}
            />
          </DialogContent>
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
              <DialogTitle>{"Clone a AC-CIDs "}</DialogTitle>
              <DialogContent>
                <Clone
                  closeClone={this.handleSaveCloneClose}
                  close={this.openCloneDialog}
                  type="AreaCode"
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
                      "Campaign Area Code Records Success" &&
                    ajaxdata.map((n, i) => {
                      return (
                        <TableRow key={i}>
                          <TableCell>{n.campaign_id}</TableCell>
                          <TableCell>{n.campaign_name}</TableCell>
                          <TableCell>{n.use_custom_cid}</TableCell>
                          <TableCell>{n.areacode}</TableCell>

                          <TableCell className="text-center">
                            <Tooltip title="Modify Campaign Status ">
                              <IconButton>
                                <a
                                  className="teal-text"
                                  onClick={() =>
                                    this.handleAddEvent(n.campaign_id)
                                  }
                                >
                                  <i className="fa fa-pencil" />
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
  getAreaCodesList
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(List);
