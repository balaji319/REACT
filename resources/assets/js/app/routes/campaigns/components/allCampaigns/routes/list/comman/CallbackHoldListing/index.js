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
  CircularProgress
} from "./plugins";
//import { updateRecord } from "../../../../../actions/";
import { fetchGlobal } from "../../../../../../../../../actions/Global";
import { createNotification } from "../../../../../../../../../Helpers";
import DataTableHead from "./DataTableHead";
let counter = 0;
class List1 extends React.Component {
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
      pageTitle: this.props.location.pathname.split("/")[5],
      selected: [],
      data: [],
      page: 0,
      agent_selected: "",
      rowsPerPage: DEFAULT_PAGE_SIZE,
      showAlert: false,
      alertContent: "",
      alertTitle: "",
      isLoading: false,
      array_selected: [],
      agents: [],
      records: [],
      select_type: "",
      move_to_user: false
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
      // let_this.props.updateRecord(formData);
    }, 10);
  };
  moveEventHandler = () => {
    let array_selected = this.state.selected;
    let select_type = this.state.select_type;
    let agent_selected = this.state.agent_selected;
    array_selected != "" && select_type != ""
      ? this.moveData(array_selected, select_type, agent_selected)
      : createNotification(
          "Error",
          "Error",
          "Please select check box to delete a record."
        );
  };
  moveData = (ids, select_type, agent_selected) => {
    let current_page = this.state.page;
    let rowsPerPage = this.state.rowsPerPage;
    let search = "";

    let formData = {
      call_back_id: ids,
      movetouser: "",
      agent: agent_selected
    };
    this.setState({ isLoading: true });
    axios
      .post("/api/campaign-callback-move", formData)
      .then(response => {
        createNotification("Success", "Success", response.data.message);
        this.getAllData();
        this.setState({ isLoading: false });
      })
      .catch(function(error) {
        createNotification("Error", "Error", "Somthing Went Wrong !!!!");
      });
  };
  deleteEventHandler = () => {
    let array_selected = this.state.selected;
    array_selected != ""
      ? this.deleteData(array_selected)
      : createNotification(
          "Error",
          "Error",
          "Please select check box to delete a record."
        );
  };

  deleteData = ids => {
    let formData = {
      call_back_id: ids
    };
    this.setState({ isLoading: true });
    axios
      .post("/api/campaign-callback-delete", formData)
      .then(response => {
        createNotification("Success", "Success", response.data.message);
        this.getAllData();
        this.setState({ isLoading: false });
      })
      .catch(function(error) {
        createNotification("Error", "Error", "Somthing Went Wrong !!!!");
      });
  };

  filterState = () => {
    const newState = this.state.records.map((item, i) => {
      if (i == index) {
        retailCompanies = datata.filter(
          company => company.campaign_id_values != item.campaign_id_values
        );
        retailCompanies.push({ ...item, [dataType]: value, ["update_row"]: 1 });
        return { ...item, [dataType]: value, ["update_row"]: 1 };
      }
      return item;
    });

    this.setState({ records: newState });

    // retailCompanies = datata.filter(company => company.campaign_id_values != item.campaign_id_values);
  };
  changeEventHandler = e => {
    e.target.value == "USERONLY"
      ? this.setState({ move_to_user: true, select_type: e.target.value })
      : this.setState({ move_to_user: false, select_type: e.target.value });
  };

  changeAgentEventHandler = e => {
    this.setState({ agent_selected: e.target.value });
  };

  handleEditEvent = id => {
    this.props.history.push("edit/" + id);
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
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

  removecallbacWeekkHandler = e => {
    let formData = {
      delete_record: "last_week",
      user: this.state.pageTitle
    };
    this.deleteDataByType(formData);
  };
  removecallbacmonthHandler = e => {
    let formData = {
      delete_record: "last_month",
      user: this.state.pageTitle
    };
    this.deleteDataByType(formData);
  };

  deleteDataByType = formData => {
    this.setState({ isLoading: true });
    axios
      .post("/api/delete-month-call-backs", formData)
      .then(response => {
        createNotification("Success", "Success", response.data.message);
        this.getAllData();
        this.setState({ isLoading: false });
      })
      .catch(function(error) {
        createNotification("Error", "Error", "Somthing Went Wrong !!!!");
      });
  };
  handleKeyDown = (event, id) => {
    if (keycode(event) === "space") {
      this.handleClick(event, id);
    }
  };
  handleSelectAllClick = (event, checked) => {
    if (checked) {
      this.setState({ selected: this.state.records.map(n => n.callback_id) });
      return;
    }
    this.setState({ selected: [] });
  };
  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      alertTitle: nextPropsFromRedux.inbound.status,
      showAlert: nextPropsFromRedux.inbound.showMessage,
      alertContent: nextPropsFromRedux.inbound.showMessage,
      agents: nextPropsFromRedux.Global.agent_c
        ? nextPropsFromRedux.Global.agent_c
        : ""
    });
  }

  componentDidMount() {
    this.props.fetchGlobal(["agent_c"]);

    this.getAllData();
  }
  isSelected = id => this.state.selected.indexOf(id) !== -1;

  getAllData = id => {
    let current_page = this.state.page;
    let rowsPerPage = this.state.rowsPerPage;
    let search = "";
    this.setState({ isLoading: true });
    axios
      .get(
        "/api/campaign-callback?page=" +
          current_page +
          "&page_size=" +
          rowsPerPage +
          "&search=" +
          search +
          "&campaign_id=" +
          this.state.pageTitle
      )
      .then(response => {
        this.setState({ records: response.data.data.callbacks.data });
        this.setState({ isLoading: false });
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  render() {
    const {
      data,
      order,
      orderBy,
      selected,
      select_type,
      rowsPerPage,
      records,
      agents,
      page,
      move_to_user,
      showAlert,
      alertContent,
      alertTitle
    } = this.state;

    const { inbound } = this.props;

    const divStyle = { padding: "4px 30px 4px 24px" };
    return (
      <div>
        <ContainerHeader
          match={this.props.match}
          title="Call Menus Using This Campaign :"
        />

        <Paper>
          <Toolbar className="table-header">
            <div className="title">
              <h3>
                <i className="zmdi zmdi-view-web mr-2" /> Listing
              </h3>
            </div>
            <div className="col-lg-12   col-left">
              <div
                className="dataTables_length"
                id="table-1_length"
                style={{ display: "inline-flex" }}
              >
                <div className="col-lg-4">
                  <a
                    href="#"
                    href="javascript:void(0)"
                    onClick={this.deleteEventHandler}
                    id="deletebutton"
                    className="btn btn-success"
                  >
                    Delete Callbacks
                  </a>
                </div>
                <div className="col-lg-4">
                  <select
                    name="selectdelete"
                    id="selectdelete"
                    onChange={this.changeEventHandler}
                    className="form-control"
                  >
                    <option value>Select</option>
                    <option value="ANYONE">
                      Move Selected Callbacks to Anyone
                    </option>
                    <option value="USERONLY">
                      Move Selected Callbacks to User Only
                    </option>
                  </select>
                </div>
                {move_to_user && (
                  <div className="col-lg-4">
                    <select
                      name="user"
                      id="user"
                      onChange={this.changeAgentEventHandler}
                      className="form-control"
                    >
                      <option key="" value="">
                        {" "}
                        Select Agent{" "}
                      </option>
                      {agents.map(option => (
                        <option key={option.user} value={option.user}>
                          {" "}
                          {option.user} - {option.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="col-lg-4">
                  <a
                    href="javascript:void(0)"
                    id="deletebutton"
                    onClick={this.moveEventHandler}
                    className="btn btn-success"
                  >
                    {" "}
                    Move Callbacks
                  </a>
                </div>
              </div>
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
                  rowCount={records.length}
                />
                <TableBody>
                  {records.map(n => {
                    const isSelected = this.isSelected(n.callback_id);
                    return (
                      <TableRow
                        hover
                        onClick={event =>
                          this.handleClick(event, n.callback_id)
                        }
                        onKeyDown={event =>
                          this.handleKeyDown(event, n.callback_id)
                        }
                        role="checkbox"
                        aria-checked={isSelected}
                        tabIndex={-1}
                        key={n.callback_id}
                        selected={isSelected}
                      >
                        <TableCell style={divStyle}>
                          <Checkbox color="primary" checked={isSelected} />
                        </TableCell>
                        <TableCell style={divStyle}>{n.lead_id}</TableCell>
                        <TableCell style={divStyle}>{n.list_id}</TableCell>
                        <TableCell style={divStyle}>{n.campaign_id}</TableCell>
                        <TableCell style={divStyle}>{n.entry_time}</TableCell>
                        <TableCell style={divStyle}>
                          {n.callback_time}
                        </TableCell>
                        <TableCell style={divStyle}>{n.user}</TableCell>
                        <TableCell style={divStyle}>{n.recipient}</TableCell>
                        <TableCell style={divStyle}>{n.status}</TableCell>
                        <TableCell style={divStyle}>{n.user_group}</TableCell>
                      </TableRow>
                    );
                  })}
                  {records.length == 0 && this.state.isLoading ? (
                    <TableRow>
                      <TableCell colSpan="11">
                        <center>Loading ......... </center>
                      </TableCell>
                    </TableRow>
                  ) : records.length == 0 ? (
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
                      count={inbound.data.length}
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

        <div>
          <a
            className="link-hand"
            href="javascript:void(0);"
            onClick={this.removecallbacWeekkHandler}
          >
            <font size={3}>
              Remove Live Callbacks older than one month for this User.
            </font>
          </a>
          <br />
          <a
            className="link-hand"
            href="javascript:void(0);"
            onClick={this.removecallbacmonthHandler}
          >
            <font size={3}>
              Remove Live Callbacks older than one week for this User.
            </font>
          </a>
        </div>
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
  console.log(state);

  return {
    inbound: state.inbound,
    Global: state.globel
  };
}

const mapDispatchToProps = {
  fetchGlobal
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(List1);
