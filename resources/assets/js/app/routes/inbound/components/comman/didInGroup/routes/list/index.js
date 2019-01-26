import {
  React,
  Component,
  connect,
  Redirect,
  ContainerHeader,
  ButtonNav,
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
import { createNotification } from "../../../../../../../../Helpers";
import DataTableHead from "./DataTableHead";
import { rank_Count, grad_Count } from "./data";
//import  API_INBOUND_AGENT_GROUP_COMMON   from '../../../../../../constants';
//import  API_INBOUND_AGENT_GROUP_LIST_COMMON   from '../../../../../constants';

let counter = 0;

class List extends React.Component {
  //calss  constructor
  constructor(props, context) {
    super(props, context);
    this.state = {
      order: "asc",
      pageTitle: this.props.location.pathname.split("/")[6],
      orderBy: "group_id",
      selected: [],
      data: [],
      page: 0,
      rowsPerPage: 150,
      showAlert: false,
      alertContent: "",
      alertTitle: "",
      showConfirm: false,
      isLoading: false,
      is_change: false,
      send_all: false,
      rankcount: "",
      gradcount: "",
      records: [],
      u_records: []
    };
  }

  //table sort function
  handleRequestSort = (event, property) => {
    let temp_data = this.state.data;
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
  //handle  methods && custome Handler
  handleSubmit = () => {
    let _this = this;
    let records_array = this.state.send_all
      ? this.state.records
      : this.state.u_records;
    let formData = {
      group_id: this.state.pageTitle,
      agent_data: records_array
    };
    this.setState({ isLoading: true });
    axios
      .put("/api/inbound-lists/agents/update", formData)
      .then(response => {
        createNotification("Success", "Success", response.data.message);
        _this.setState({ isLoading: false });
      })
      .catch(function(error) {
        _this.setState({ is_change: false, send_all: false });
        createNotification("Error", "Error", "Somthing Went Wrong !!!!");
      });
  };

  handleSelectAllClick = (event, checked) => {
    this.setState({ is_change: true, send_all: true });
    let _this = this;
    let all_records = _this.state.records;
    if (checked) {
      //let new_array=this.state.records.map(n => n.user);
      this.setState({ selected: this.state.records.map(n => n.user) });
      all_records.forEach(function(part, index) {
        part.status = true;
      });
      return;
    } else {
      all_records.forEach(function(part, index) {
        part.status = false;
      });
    }
    setTimeout(function() {
      _this.setState({
        selected: [],
        records: all_records,
        is_change: true,
        send_all: true
      });
    }, 10);
  };

  handleChange(index, dataType, value, data) {
    let this_ = this;
    var datata = this_.state.u_records;
    var retailCompanies = [];
    const newState = this.state.records.map((item, i) => {
      if (i == index) {
        retailCompanies = datata.filter(
          company => company.group_id_values != item.group_id_values
        );
        retailCompanies.push({ ...item, [dataType]: value, ["UpdateRow"]: 1 });
        return { ...item, [dataType]: value, ["UpdateRow"]: 1 };
      }
      return item;
    });

    this.setState({
      records: newState,
      u_records: retailCompanies,
      is_change: true
    });
  }

  //alert msg
  showAlert(status, msg) {
    this.setState({ alertTitle: status, alertContent: msg, showAlert: true });
  }

  onCancelAlert = () => {
    this.setState({ showAlert: false });
  };

  changePageHandler = (event, page) => {
    this.setState({ page });
  };

  handleChangeHandler = name => event => {
    this.setState({ [name]: event.target.value });
  };

  handleChange(index, dataType, value, data) {
    let this_ = this;
    var datata = this_.state.u_records;
    var retailCompanies = [];
    const newState = this.state.records.map((item, i) => {
      if (i == index) {
        retailCompanies = datata.filter(company => company.user != item.user);
        retailCompanies.push({ ...item, [dataType]: value });
        return { ...item, [dataType]: value };
      }
      return item;
    });

    this.setState({
      records: newState,
      u_records: retailCompanies,
      is_change: true
    });
  }

  // befour component mount
  componentDidMount() {
    this.getAllData();
  }

  getAllData = e => {
    this.setState({ isLoading: true });
    axios
      .get("/api/inbound-lists/agents?group_id=" + this.state.pageTitle)
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
      pageTitle,
      data,
      order,
      orderBy,
      selected,
      u_records,
      rowsPerPage,
      page,
      showAlert,
      alertContent,
      rankcount,
      gradcountalertTitle,
      showConfirm,
      showClonePopup,
      showCloneConfirm,
      fromScriptId,
      newScriptId,
      fromScriptIdError,
      newScriptIdError
    } = this.state;
    //console.clear();
    //custom style const
    const divStyle = { padding: "4px 30px 4px 24px" };
    const pageTitleTEXT = "Inbound Groups : " + pageTitle;

    console.log("+++++++++++++");
    console.log(selected);

    return (
      <div>
        <ContainerHeader match={this.props.match} title={pageTitleTEXT} />{" "}
        {this.state.is_change && <ButtonNav click={this.handleSubmit} />}
        <Paper>
          {/* Confirmation promat */}

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
                  rowCount={this.state.records.length}
                />
                <TableBody>
                  {this.state.records.map((row, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell style={divStyle}>
                          {this.state.records[index].user}
                        </TableCell>
                        <TableCell style={divStyle}>
                          {this.state.records[index].user_group}
                        </TableCell>
                        <TableCell style={divStyle}>
                          <Checkbox
                            color="primary"
                            onChange={e =>
                              this.handleChange(
                                index,
                                "status",
                                e.target.checked
                              )
                            }
                            checked={this.state.records[index].status}
                          />{" "}
                          {this.state.records[index].group_id_values} -{" "}
                          {this.state.records[index].group_name_values}
                        </TableCell>
                        <TableCell style={divStyle}>
                          <select
                            autoComplete="off"
                            size="1"
                            value={this.state.records[index].group_rank}
                            onChange={e =>
                              this.handleChange(
                                index,
                                "group_rank",
                                e.target.value
                              )
                            }
                            className="form-control"
                            name="RANK_121"
                          >
                            {" "}
                            {rank_Count.map((option, index) => (
                              <option key={index} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell style={divStyle}>
                          <select
                            autoComplete="off"
                            size="1"
                            value={this.state.records[index].group_grade}
                            onChange={e =>
                              this.handleChange(
                                index,
                                "group_grade",
                                e.target.value
                              )
                            }
                            className="form-control"
                            name="GRADE_121"
                          >
                            {" "}
                            {grad_Count.map((option, index) => (
                              <option key={index} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell style={divStyle}>
                          {this.state.records[index].calls_today}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {this.state.records.length == 0 && this.state.isLoading ? (
                    <TableRow>
                      <TableCell colSpan="11">
                        <center>Loading ......... </center>
                      </TableCell>
                    </TableRow>
                  ) : this.state.records.length == 0 ? (
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
              </Table>
            </div>
          </div>
        </Paper>
        {this.state.isLoading && (
          <div className="loader-view" id="loader-view">
            <CircularProgress />
          </div>
        )}
      </div>
    );
  }
}

export default List;
