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
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
//import { updateRecord } from "../../../../../actions/";
import { fetchGlobal } from "../../../../../../../actions/Global";
import { createNotification } from "../../../../../../../Helpers";
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
      move_to_user: false,
      typeValue: "NONE",
      changeDesc: false
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
    array_selected != "" && select_type != "" && array_selected.length > 0
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
        createNotification("Error", "Error",error.response.data.msg);
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
        createNotification("Error", "Error",error.response.data.msg);
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

  changeEventHandler = name => event => {
    let _this = this;
    let array_selected = this.state.selected;
    let length = array_selected.length;
    let select_type = event.target.value;
    let agent_selected = this.state.agent_selected;
    console.log(select_type);
    console.log(length);
    setTimeout(function() {
      select_type != "NONE" && length != 0
        ? _this.updatData(array_selected, select_type, agent_selected)
        : createNotification(
            "Error",
            "Error",
            "Please select check box to delete a record."
          );
    }, 10);
    this.setState({ [name]: event.target.value });
  };

  updatData = (ids, select_type, agent_selected) => {
    let current_page = this.state.page;
    let rowsPerPage = this.state.rowsPerPage;
    let search = "";
    let data = this.state.records.filter(
      row => ids.indexOf(row.areacode) != -1
    );
    let formData = {
      select_type: select_type == "N" ? "Y" : "N",
      area_codes: data
    };

    this.setState({ isLoading: true });
    axios
      .put("/api/active-deactive-area-code", formData)
      .then(response => {
        createNotification("Success", "Success", response.data.msg);
        this.getAllData();
        this.setState({ isLoading: false });
      })
      .catch(function(error) {
        createNotification("Error", "Error", "Somthing Went Wrong !!!!");
      });
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
        this.setState({ isLoading: false });
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
      this.setState({ selected: this.state.records.map(n => n.areacode) });
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
  changegeDescription = () => {
    this.setState({ changeDesc: true });
  };
  EditSaveHandler = id => {
    let data = this.state.records.filter(row => row.areacode == id);
    this.setState({ isLoading: true });
    axios
      .put("/api/update-area-code", data[0])
      .then(response => {
        createNotification("Success", "Success", response.data.message);
        this.setState({ isLoading: false });
      })
      .catch(function(error) {
        createNotification("Error", "Error", error.response.data.msg);
        this.setState({ isLoading: false });
      });
  };

  handleChangeArray(index, dataType, value, data) {
    let this_ = this;
    if (dataType == "active") {
      value = value ? "Y" : "N";
    }

    const newState = this.state.records.map((item, i) => {
      if (i == index) {
        return { ...item, [dataType]: value };
      }
      return item;
    });

    this.setState({
      records: newState,
      is_change: true
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
        "/api/edit-area-code-list?page=" +
          current_page +
          "&page_size=" +
          rowsPerPage +
          "&search=" +
          search +
          "&campaign_id=" +
          this.state.pageTitle
      )
      .then(response => {
        this.setState({ records: response.data.data });
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
      alertTitle,
      pageTitle,
      typeValue,
      changeDesc
    } = this.state;

    const { inbound } = this.props;

    const divStyle = { padding: "4px 30px 4px 24px" };
    console.log("CHANGRESSSSSSSSSSSSSSSss");
    console.log(records);
    return (
      <div>
        <ContainerHeader
          match={this.props.match}
          title={"Campaign Areacode CID Listing :" + pageTitle}
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
                <div className="col-lg-12">
                  <select
                    name="typeValue"
                    id="selecttype"
                    onChange={this.changeEventHandler("typeValue")}
                    className="form-control"
                    value={typeValue}
                  >
                    <option value="NONE" selected>
                      Select Active/Deactive
                    </option>
                    <option value="Y">Active Selected</option>
                    <option value="N">Deactive Selected</option>
                  </select>
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
                  {records.map((n, i) => {
                    const isSelected = this.isSelected(n.areacode);
                    return (
                      <TableRow
                        hover
                        onKeyDown={event =>
                          this.handleKeyDown(event, n.areacode)
                        }
                        role="checkbox"
                        aria-checked={isSelected}
                        tabIndex={-1}
                        key={i}
                        selected={isSelected}
                      >
                        <TableCell
                          style={divStyle}
                          onClick={event => this.handleClick(event, n.areacode)}
                        >
                          <Checkbox color="primary" checked={isSelected} />
                        </TableCell>
                        <TableCell style={divStyle}>{i}</TableCell>
                        <TableCell style={divStyle}>{n.areacode}</TableCell>
                        <TableCell style={divStyle}>{n.outbound_cid}</TableCell>
                        <TableCell
                          style={divStyle}
                          onClick={this.changegeDescription}
                        >
                          {changeDesc ? (
                            <input
                              name="cid_description"
                              id="cid_description"
                              className="form-control tooltip-primary"
                              onChange={e =>
                                this.handleChangeArray(
                                  i,
                                  "cid_description",
                                  e.target.value
                                )
                              }
                              value={this.state.records[i].cid_description}
                              title=""
                              maxLength="6"
                              placeholder="cid description"
                              type="text"
                            />
                          ) : (
                            n.cid_description
                          )}
                        </TableCell>
                        <TableCell style={divStyle}>
                          <Checkbox
                            color="primary"
                            onChange={e =>
                              this.handleChangeArray(
                                i,
                                "active",
                                e.target.checked
                              )
                            }
                            value={this.state.records[i].active}
                            defaultChecked={
                              this.state.records[i].active == "Y" ? true : false
                            }
                          />{" "}
                        </TableCell>
                        <TableCell style={divStyle}>
                          {n.call_count_today}
                        </TableCell>
                        <TableCell
                          className="text-center"
                          style={{ display: "inline-flex" }}
                        >
                          <Tooltip title="Modify Campaign">
                            <IconButton
                              onClick={() => this.EditSaveHandler(n.areacode)}
                            >
                              <a className="teal-text">
                                <i className="fa fa-pencil" />
                              </a>
                            </IconButton>
                          </Tooltip>
                        </TableCell>
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

        <div />
        {this.state.isLoading && (
          <div className="loader-view" id="loader-view">
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
