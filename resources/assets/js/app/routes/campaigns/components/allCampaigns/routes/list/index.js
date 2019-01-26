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
  Typography,
  Paper,
  IconButton,
  Tooltip,
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
} from "../../../../../../../components/plugins.js";
import {
  fetchAllCampaignData,
  updateCampaignStatus,
  resetHopper,
  deleteCampaign
} from "../../../../actions/";
import DataTableHead from "./DataTableHead";
import { createNotification } from "../../../../../../../Helpers";
import Clone from "./comman/clone/Clone";
import Wizard from "./comman/wizard/Wizard";
import DisabledStatus from "./comman/DisabledStatus/DisabledStatus";
import Inbound from "./comman/Inbound/Inbound";
import Slide from "@material-ui/core/Slide";

function Transition(props) {
  return <Slide direction="down" {...props} />;
}

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
      ajaxdata: [],
      openWizard: false,
      openClone: false,
      total: "",
      dialableStatus: false,
      inbound: false,
      selected_id: ""
    };
  }
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

  //active  switch changes
  statusChangeHandler = (event, data) => {
    var let_this = this;
    let formData = {
      campaign_id: event.target.value,
      active: data ? "Y" : "N"
    };
    console.log("+++++++++++++++");
    console.log(formData);
    setTimeout(function() {
      let_this.props.updateCampaignStatus(formData);
    }, 10);
  };

  statusChangeoutboundHandler = (event, data) => {
    var let_this = this;
    let formData = {
      id: event.target.value,
      closer_default_blended: data ? "1" : "0"
    };
    //setTimeout(function(){  let_this.props.updateOutboundStatusRecord(formData); }, 10);
  };
  resetHopperHandler = id => {
    var let_this = this;
    let formData = {
      campaign_id: id
    };
    setTimeout(function() {
      let_this.props.resetHopper(formData);
    }, 10);
  };

  DeleteConfirmHandler = () => {
    var let_this = this;
    this.onCancelDeleteHandler();
    let formData = {
      campaign_id: this.state.deleteInboundId
    };
    setTimeout(function() {
      let_this.props.deleteCampaign(formData);
    }, 10);
  };
  handleKeyPress = event => {
    if (event.key == "Enter") {
      this.setState({ showAlert: false });
      let rowsPerPage = this.state.rowsPerPage;
      this.props.fetchAllCampaignData(0, rowsPerPage, this.state.search_value);
    }
  };

  openCloneDialog = () => {
    this.setState({ openClone: !this.state.openClone, showAlert: false });
  };

  openWizardDialog = () => {
    this.setState({ openWizard: !this.state.openWizard, showAlert: false });
  };

  dialableStatusDialog = name => e => {
    this.setState({
      selected_id: e.target.getAttribute("data-cid"),
      dialableStatus: !this.state.dialableStatus,
      showAlert: false
    });
  };

  inboundDialog = name => e => {
    this.setState({
      selected_id: e.target.getAttribute("data-cid"),
      inbound: !this.state.inbound,
      showAlert: false
    });
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

  campaigncallbacHandler = id => {
    this.props.history.push("callback/" + id);
  };

  hopperHandler = id => {
    if (id) {
      this.props.history.push("hopper/" + id);
    }
  };
  listHandler = id => {
    if (id) {
      this.props.history.push("clist/" + id);
    }
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
    this.props.fetchAllCampaignData(0, rowsPerPage, this.state.search_value);
  };

  handleChangeHandler = name => event => {
    this.setState({ [name]: event.target.value, showAlert: false });
  };

  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      alertTitle: nextPropsFromRedux.Campaign.alertMessageTitle,
      showAlert: nextPropsFromRedux.Campaign.showMessage,
      alertContent: nextPropsFromRedux.Campaign.alertMessage,
      ajaxdata: nextPropsFromRedux.Campaign
        ? nextPropsFromRedux.Campaign.data.data
        : [],
      total: nextPropsFromRedux.Campaign.total
    });
    console.log(nextPropsFromRedux);
  }

  componentDidMount() {
    this.getAgentList(0, this.state.rowsPerPage);
  }
  // Pagination section
  getAgentList(page = 0, page_size = 10) {
    let $this = this;
    let rowsPerPage = $this.state.rowsPerPage;
    let current_page = page + 1;
    this.props.fetchAllCampaignData(
      current_page,
      page_size,
      this.state.search_value
    );
  }

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
      dialableStatus,
      inbound,
      search_value,
      orderBy,
      openClone,
      openWizard,
      selected,
      rowsPerPage,
      page,
      showAlert,
      alertContent,
      alertTitle,
      showConfirm
    } = this.state;
    const { Campaign } = this.props;
    console.log(ajaxdata);
    console.log("=-------------");
    showAlert ? createNotification(alertTitle, alertTitle, alertContent) : "";
    const divStyle = { padding: "4px 30px 4px 24px", textAlign: "center" };

    return (
      <div>
        <ContainerHeader match={this.props.match} title="Campaigns Listing " />

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
            onClose={this.handleCloneClos}
            TransitionComponent={Transition}
          >
            <DialogTitle>{"Clone  Campaign"}</DialogTitle>
            <DialogContent>
              <Clone close={this.openCloneDialog} />
            </DialogContent>
            <DialogActions />
          </Dialog>
          <Dialog
            maxWidth="md"
            fullWidth={true}
            open={this.state.openWizard}
            onClose={this.handleWizardClose}
            TransitionComponent={Transition}
          >
            <DialogTitle>{"Campaign Wizard"}</DialogTitle>
            <DialogContent>
              <Wizard close={this.openWizardDialog} />
            </DialogContent>
            <DialogActions />
          </Dialog>

          <Dialog
            maxWidth="md"
            fullWidth={true}
            open={this.state.dialableStatus}
            onClose={this.handleWizardClose}
            TransitionComponent={Transition}
          >
            <DialogTitle>{"Add Dialable Statuses To Call"}</DialogTitle>
            <DialogContent>
              <DisabledStatus
                close={this.dialableStatusDialog("")}
                id={this.state.selected_id}
              />
            </DialogContent>

            <DialogActions />
          </Dialog>

          <Dialog
            maxWidth="md"
            fullWidth={true}
            open={this.state.inbound}
            onClose={this.handleInboundClose}
            TransitionComponent={Transition}
          >
            <DialogTitle>
              {"Inbound and Transfer Queues:"}
              {this.state.selected_id}
            </DialogTitle>
            <DialogContent>
              <Inbound
                close={this.inboundDialog("")}
                id={this.state.selected_id}
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
            <div className="actions" style={{ display: "inline-flex" }}>
              <Tooltip title="Clone a Campaign">
                <IconButton
                  className="btn-sm"
                  aria-label="Delete"
                  onClick={this.openCloneDialog}
                >
                  <i className="zmdi zmdi-copy font-20" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Wizard Campaign">
                <IconButton
                  className="btn-sm"
                  aria-label="Delete"
                  onClick={this.openWizardDialog}
                >
                  <i className="fa fa-object-ungroup" />
                </IconButton>
              </Tooltip>
            </div>
          </Toolbar>
          <div className="flex-auto">
            <div className="table-responsive-material" id="custom_style_camp">
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
                    Campaign.sectionin == "Campaign list  Success" &&
                    ajaxdata.map((n, i) => {
                      return (
                        <TableRow key={i}>
                          <TableCell>{n.campaign_id}</TableCell>
                          <TableCell>{n.campaign_name}</TableCell>
                          <TableCell className="text-center">
                            <Switch
                              value={n.campaign_id.toString()}
                              onChange={this.statusChangeHandler}
                              defaultChecked={n.active == "Y"}
                              ref={n.campaign_id}
                              color="primary"
                            />
                          </TableCell>
                          <TableCell>{n.auto_dial_level}</TableCell>
                          <TableCell>
                            <img
                              src="https://png.icons8.com/material/50/000000/xbox-menu"
                              onClick={this.dialableStatusDialog(n.campaign_id)}
                              data-cid={n.campaign_id}
                              style={{ width: "33%", cursor: "pointer" }}
                            />
                          </TableCell>
                          <TableCell>{n.dial_method}</TableCell>
                          <TableCell>{n.campaign_cid}</TableCell>
                          <TableCell>
                            <img
                              src="https://png.icons8.com/material/50/000000/xbox-menu"
                              onClick={this.inboundDialog(n.campaign_id)}
                              data-cid={n.campaign_id}
                              style={{ width: "58%", cursor: "pointer" }}
                            />
                          </TableCell>
                          <TableCell>
                            <img
                              src="https://png.icons8.com/material/50/000000/xbox-menu"
                              onClick={() => this.hopperHandler(n.campaign_id)}
                              style={{ width: "58%", cursor: "pointer" }}
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Reset Hopper">
                              <IconButton>
                                <i
                                  onClick={() =>
                                    this.resetHopperHandler(n.campaign_id)
                                  }
                                  className="fa fa-undo fa-stack-1x"
                                />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                          <TableCell style={{ whiteSpace: "nowrap" }}>
                            <Tooltip title="Modify list">
                              <IconButton>
                                <i
                                  onClick={() =>
                                    this.listHandler(n.campaign_id)
                                  }
                                  className="fa fa-list"
                                  aria-hidden="true"
                                />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="callback Campaign">
                              <IconButton>
                                <i
                                  onClick={() =>
                                    this.campaigncallbacHandler(n.campaign_id)
                                  }
                                  className="fa fa-phone"
                                  aria-hidden="true"
                                />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                          <TableCell
                            className="text-center"
                            style={{ display: "inline-flex" }}
                          >
                            <Tooltip title="Modify Campaign">
                              <IconButton
                                onClick={() =>
                                  this.handleEditEventHandler(n.campaign_id)
                                }
                              >
                                <a className="teal-text">
                                  <i className="fa fa-pencil" />
                                </a>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Campaign">
                              <IconButton
                                onClick={() =>
                                  this.DeleteInboundHandler(n.campaign_id)
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

                  {ajaxdata &&
                  ajaxdata.length == 0 &&
                  this.props.Campaign.isLoading ? (
                    <TableRow>
                      <TableCell colSpan="11">
                        <center>Loading ......... </center>
                      </TableCell>
                    </TableRow>
                  ) : ajaxdata && ajaxdata.length == 0 ? (
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
    Campaign: state.campaign
  };
}

const mapDispatchToProps = {
  fetchAllCampaignData,
  updateCampaignStatus,
  resetHopper,
  deleteCampaign
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(List);
