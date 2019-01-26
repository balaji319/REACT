import {
  React,
  Component,
  SearchBox,
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
//import { fetchAllAgent, updateStatusRecord ,updateOutboundStatusRecord,deleteRecord} from '../../../../actions/';
import DataTableHead from "./DataTableHead";
import { createNotification } from "../../../../../../../Helpers";
import Clone from "./comman/clone/Clone";
import Header from "./comman/live_agents";
import { pausecodelist } from "./comman/data";

import Helmet from "react-helmet";

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
      isLoading: false,
      alertTitle: "",
      search_value: "",
      ajaxdata: pausecodelist,
      openClone: false,
      total: ""
    };
  }
  //table sort function
  handleRequestSort = (event, property) => {
    let temp_data = this.props.Agent.data;
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
      id: event.target.value,
      active: data ? "Y" : "N"
    };
    // setTimeout(function(){  let_this.props.updateStatusRecord(formData); }, 10);
  };

  statusChangeoutboundHandler = (event, data) => {
    var let_this = this;
    let formData = {
      id: event.target.value,
      closer_default_blended: data ? "1" : "0"
    };
    //setTimeout(function(){  let_this.props.updateOutboundStatusRecord(formData); }, 10);
  };

  DeleteConfirmHandler = () => {
    var let_this = this;
    this.onCancelDeleteHandler();
    let formData = {
      user_id: this.state.deleteInboundId
    };
    //setTimeout(function(){ let_this.props.deleteRecord(formData); }, 10);
  };
  handleKeyPress = event => {
    if (event.key == "Enter") {
      //  this.setState({showAlert:false}); let rowsPerPage = this.state.rowsPerPage;this.props.fetchAllAgent(0,rowsPerPage,this.state.search_value);
    }
  };

  //handle  methods && custome Handler
  changePageHandler = (event, page) => {
    this.setState({ page });
  };

  openCloneDialog = () => {
    this.setState({ openClone: !this.state.openClone, showAlert: false });
  };

  changeRowsPerPageHandler = event => {
    this.setState({ rowsPerPage: event.target.value, showAlert: false });
  };

  DeleteInboundHandler = id => {
    this.setState({ showConfirm: true, deleteInboundId: id, showAlert: false });
  };

  handleEditEventHandler = id => {
    this.props.history.push("edit/" + id);
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

  statsHandler = id => {
    this.props.history.push("/app/reports/agent-reports/AgentStats/" + id);
  };

  timesheetHandler = id => {
    this.props.history.push("/app/reports/agent-reports/AgentTimeSheet/" + id);
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

  onSearchChange = name => e => {
    this.setState({ showAlert: false });
    let rowsPerPage = this.state.rowsPerPage;
    this.props.fetchAllAgent(0, rowsPerPage, this.state.search_value);
  };

  onSearchChange = name => e => {};
  handleChangeHandler = name => event => {
    this.setState({ [name]: event.target.value, showAlert: false });
  };

  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      alertTitle: nextPropsFromRedux.Agent.alertMessageTitle,
      showAlert: nextPropsFromRedux.Agent.showMessage,
      alertContent: nextPropsFromRedux.Agent.alertMessage
      //ajaxdata:nextPropsFromRedux.Agent.data,
      //  total:nextPropsFromRedux.Agent.total,
    });
  }

  componentDidMount() {
    //this.getAgentList(0,this.state.rowsPerPage);
    this.getCampaignPausecodeData();
  }

  getCampaignPausecodeData() {
    axios
      .get("https://x5adminw.ytel.com/PauseCodes/ajaxGetPauseCodes.json")
      .then(response => {
        console.log("------------------from server ---------------");
        console.log(response.data);
        //this.setState({categories:response.data.data});
        //url:response.data.next_page_url;
        //this.onPaginationData(response.data);
      });
  }

  // Pagination section
  //getAgentList(page = 0, page_size = 10) { let $this = this; let rowsPerPage = $this.state.rowsPerPage;let current_page = page + 1;this.props.fetchAllAgent(current_page,page_size);}

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
    this.getAgentList(this.state.page, event.target.value);
  };
  //handle  methods && custome Handler
  changePageHandler = (event, page) => {
    this.setState({ page });
    this.getAgentList(page, this.state.rowsPerPage);
  };

  changeRowsPerPageHandler = event => {
    this.setState({ rowsPerPage: event.target.value });
    this.getAgentList(this.state.page, event.target.value);
  };

  render() {
    const {
      data,
      order,
      ajaxdata,
      total,
      search_value,
      orderBy,
      openClone,
      selected,
      rowsPerPage,
      page,
      showAlert,
      alertContent,
      alertTitle,
      showConfirm
    } = this.state;
    const { Agent } = this.props;
    showAlert ? createNotification(alertTitle, alertTitle, alertContent) : "";
    const divStyle = { padding: "4px 30px 4px 24px", textAlign: "center" };

    console.log("----------------------");
    console.log(ajaxdata);

    return (
      <div>
        <Helmet>
          <title>Agent List </title>
        </Helmet>

        <ContainerHeader
          match={this.props.match}
          title="pause codes  Listing "
        />

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

          <Dialog
            maxWidth="md"
            fullWidth={true}
            open={this.state.openClone}
            onClose={this.handleCloneClose}
          >
            <DialogTitle>{"Clone A Agent"}</DialogTitle>
            <DialogContent>
              <Clone
                closeClone={this.handleSaveCloneClose}
                close={this.openCloneDialog}
              />
            </DialogContent>
            <DialogActions />
          </Dialog>
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
                  disabled={this.props.Agent.isLoading}
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
            <div className="actions">
              <Tooltip title="Clone a Agent">
                <IconButton
                  className="btn-sm"
                  aria-label="Delete"
                  onClick={this.openCloneDialog}
                >
                  <i className="zmdi zmdi-copy font-20" />
                </IconButton>
              </Tooltip>
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
                  numSelected={selected.length}
                  order={order}
                  orderBy={orderBy}
                  onSelectAllClick={this.handleSelectAllClick}
                  onRequestSort={this.handleRequestSort}
                  rowCount={parseInt(total)}
                />
                <TableBody>
                  {ajaxdata &&
                    ajaxdata.map((n, index) => {
                      return (
                        <TableRow key={index}>
                          <TableCell style={divStyle}>
                            {n.ViciCampaign.campaign_id}
                          </TableCell>
                          <TableCell style={divStyle}>
                            {n.ViciCampaign.campaign_name}
                          </TableCell>
                          <TableCell style={divStyle}>
                            {n.ViciCampaign[0] != "NONE"
                              ? n.ViciCampaign[0]
                              : " None"}
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
                                    n.ViciCampaign.campaign_id
                                  )
                                }
                              >
                                <a className="teal-text">
                                  <i
                                    className={
                                      n.ViciCampaign[0] != "NONE"
                                        ? "zmdi zmdi-edit "
                                        : "fa fa-plus"
                                    }
                                  />
                                </a>{" "}
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                  {ajaxdata.length == 0 && this.props.Agent.isLoading ? (
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
        {this.props.Agent.isLoading && (
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
    Agent: state.agent
  };
}

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(List);
