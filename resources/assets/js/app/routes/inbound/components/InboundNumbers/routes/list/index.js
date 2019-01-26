import {
  React,
  connect,
  ContainerHeader,
  axios,
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
  CircularProgress,
  Slide
} from "../../../../../../../components/plugins.js";
import { fetchAllDids, updateRecord } from "../../../../actions/";
import DataTableHead from "./DataTableHead";
import Clone from "./comman/Clone";
import MassUpdate from "./comman/MassUpdate/";
import { createNotification } from "../../../../../../../Helpers";
function Transition(props) {
  return <Slide direction="down" {...props} />;
}
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
  //pagination functions
  //handleChangePage = (event, page) => {this.setState({page});};

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
      isLoading: false,
      total: "",
      error: false,
      search_value: "",
      openClone: false,
      openMassNumber: false
    };
  }

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

    this.setState({ data, order, orderBy });
  };
  handleSelectAllClick = (event, checked) => {
    let ajaxdata = this.props.inbound.data;
    if (checked) {
      this.setState({ selected: ajaxdata.map(n => n.did_pattern) });
      return;
    }
    this.setState({ selected: [] });
  };
  handleEditEvent = id => {
    this.props.history.push("edit/" + id);
  };

  handleDidEvent = id => {
    this.props.history.push("InboundGroup/" + id);
  };

  handleCallMenEvent = id => {
    this.props.history.push("callMenuInGroup/" + id);
  };
  DidEventAgentHandler = id => {
    this.props.history.push("/app/reports/agent-reports/agentStatusDetail/" + id);
  };

  isSelected = id => this.state.selected.indexOf(id) !== -1;

  handleChangeHandler = name => event => {
    this.setState({ [name]: event.target.value });
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

    this.setState({ selected: newSelected });
  };
  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      alertTitle: nextPropsFromRedux.inbound.status,
      showAlert: nextPropsFromRedux.inbound.showMessage,
      alertContent: nextPropsFromRedux.inbound.showMessage,
      total: nextPropsFromRedux.inbound.total
    });
  }
  DeleteConfirmHandler = () => {
    var let_this = this;
    this.onCancelDeleteHandler();
    let deleteInboundId = this.state.deleteInboundId ;
    axios
    .get("/api/number-delete?did_pattern="+deleteInboundId)
    .then(response => {
      createNotification("Success","Success",response.data.msg)
      let_this.getDidList(0, this.state.rowsPerPage);
    })
    .catch(function(error) {
      createNotification("Error", "Error", error.response.data.msg);

    });

  };

  deleteNumber = ()=>{

  }

  onCancelDeleteHandler = () => {
    this.setState({ showConfirm: false });
  };
  DeleteInboundHandler = id => {
    this.setState({ showConfirm: true, deleteInboundId: id });
  };
  componentDidMount() {
    this.getDidList(0, this.state.rowsPerPage);
  }
  getDidList(page = 0, page_size = 10) {
    let $this = this;
    let rowsPerPage = $this.state.rowsPerPage;
    let current_page = page + 1;
    this.props.fetchAllDids(current_page, page_size);
  }
  openCloneDialog = () => {
    this.setState({ openClone: !this.state.openClone });
  };
  openMassNumberDialog = () => {
    this.setState({ openMassNumber: !this.state.openMassNumber });
  };

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
    this.props.fetchAllDids(0, this.state.rowsPerPage, this.state.search_value);
  };
  changeRowsPerPageHandler = event => {
    this.setState({ rowsPerPage: event.target.value });
    this.getDidList(this.state.page, event.target.value);
  };

  render() {
    const {
      data,
      order,
      orderBy,
      selected,
      rowsPerPage,
      page,
      total,
      showAlert,
      alertContent,
      search_value,
      alertTitle,
      showConfirm,
      showClonePopup,
      showCloneConfirm,
      openMassNumber
    } = this.state;
    const { inbound } = this.props;
    const divStyle = { padding: "4px 30px 4px 24px" };

    return (
      <div>
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
          TransitionComponent={Transition}
        >
          <DialogTitle>{"Clone DID"}</DialogTitle>
          <DialogContent>
            <Clone close={this.openCloneDialog} />
          </DialogContent>
          <DialogActions />
        </Dialog>
        <Dialog
          maxWidth="md"
          fullWidth={true}
          open={this.state.openMassNumber}
          TransitionComponent={Transition}
        >
          <DialogTitle>{"Clone DID"}</DialogTitle>
          <DialogContent>
            <Clone close={this.openMassNumberDialog} />
          </DialogContent>
          <DialogActions />
        </Dialog>
        <ContainerHeader match={this.props.match} title="Numbers Listing" />
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
              <div className="actions" style={{ display: "inline-flex" }}>
                <Tooltip title="Clone a Number">
                  <IconButton
                    className="btn-sm"
                    aria-label="Delete"
                    onClick={this.openCloneDialog}
                  >
                    <i className="zmdi zmdi-copy font-20" />
                  </IconButton>
                </Tooltip>
                <MassUpdate listData={this.state.selected} />
              </div>
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
                  rowCount={inbound.data.length}
                />
                <TableBody>
                  {inbound.data.map(n => {
                    const isSelected = this.isSelected(n.did_pattern);
                    return (
                      <TableRow
                        hover
                        onKeyDown={event =>
                          this.handleKeyDown(event, n.did_pattern)
                        }
                        role="checkbox"
                        aria-checked={isSelected}
                        tabIndex={-1}
                        selected={isSelected}
                        key={n.did_id}
                      >
                        <TableCell
                          onClick={event =>
                            this.handleClick(event, n.did_pattern)
                          }
                          padding="checkbox"
                        >
                          <Checkbox color="primary" checked={isSelected} />
                        </TableCell>
                        <TableCell style={divStyle}>{n.did_pattern}</TableCell>
                        <TableCell style={divStyle}>
                          {n.did_description}
                        </TableCell>
                        <TableCell style={divStyle}>{n.did_active}</TableCell>

                        <TableCell style={divStyle}>{n.did_route}</TableCell>
                        <TableCell style={divStyle}>{n.destination}</TableCell>
                        <TableCell style={divStyle}>
                          <img
                            src="./images/icons/number.png"
                            onClick={() =>
                              this.DidEventAgentHandler(n.did_pattern)
                            }
                            style={{
                              width: "10%",
                              marginLeft: "30px",
                              cursor: "pointer"
                            }}
                          />{" "}
                        </TableCell>

                        <TableCell
                          style={divStyle}
                          className="text-center"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          <Tooltip title="Modify Number">
                            <IconButton
                              onClick={() =>
                                this.handleEditEvent(n.did_pattern)
                              }
                              style={{ float: "left" }}
                            >
                              <a className="teal-text">
                                <i className="fa fa-pencil" />
                              </a>
                            </IconButton>
                          </Tooltip>
                          {n.is_delete && (
                            <Tooltip title="Delete Number">
                              <IconButton
                                onClick={() =>
                                  this.DeleteInboundHandler(n.did_pattern)
                                }
                                style={{ float: "left" }}
                              >
                                <a className="red-text">
                                  <i className="fa fa-times" />
                                </a>
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      count={total}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onChangePage={this.changePageHandler}
                      onChangeRowsPerPage={this.handleChangeRowsPerPage}
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
  fetchAllDids,
  updateRecord,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(List);
