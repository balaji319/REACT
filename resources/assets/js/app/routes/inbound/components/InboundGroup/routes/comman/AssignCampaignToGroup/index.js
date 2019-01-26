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
import { Route, withRouter } from "react-router-dom";
//import  API_INBOUND_AGENT_GROUP_COMMON   from '../../../../../../constants';
//import  API_INBOUND_AGENT_GROUP_LIST_COMMON   from '../../../../../constants';

let counter = 0;

class CampList extends React.Component {
  //calss  constructor
  constructor(props, context) {
    super(props, context);
    this.state = {
      order: "asc",
      pageTitle: this.props.group_id,
      orderBy: "group_id",
      selected: [],
      selected1: [],
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
    let temp_data = this.state.records;
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
    let $this = this;
    let closer_campaigns_status_data = this.state.records
      .filter(row => row.closer_campaigns_status == true)
      .map(option => option.campaign_id);
    let xfer_groups_status_data = this.state.records
      .filter(row => row.xfer_groups_status == true)
      .map(option => option.campaign_id);

    let formData = {
      group_id: this.state.pageTitle,
      xfer_groups_array: xfer_groups_status_data,
      closer_campaigns_array: closer_campaigns_status_data
    };
    this.setState({ isLoading: true });
    axios
      .put("/api/inbound-lists/campaigns/update", formData)
      .then(response => {
        createNotification("Success", "Success", response.data.message);
        $this.setState({ isLoading: false });
      })
      .catch(function(error) {
        $this.setState({ is_change: false, send_all: false });
        createNotification("Error", error.response.data.msg);
      });
  };

  handleSelectAllClick = (event, checked) => {
    this.setState({ is_change: true, send_all: true });
    let _this = this;
    let all_records = _this.state.records;
    if (checked) {
      //let new_array=this.state.records.map(n => n.user);
      this.setState({ selected: this.state.records.map(n => n.campaign_id) });
      all_records.forEach(function(part, index) {
        part.closer_campaigns_status = true;
      });
      return;
    } else {
      all_records.forEach(function(part, index) {
        part.closer_campaigns_status = false;
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

  handleSelectAllClick1 = (event, checked) => {
    this.setState({ is_change: true, send_all: true });
    let _this = this;
    let all_records = _this.state.records;
    if (checked) {
      //let new_array=this.state.records.map(n => n.user);
      this.setState({ selected1: this.state.records.map(n => n.campaign_id) });
      all_records.forEach(function(part, index) {
        part.xfer_groups_status = true;
      });
      return;
    } else {
      all_records.forEach(function(part, index) {
        part.xfer_groups_status = false;
      });
    }
    setTimeout(function() {
      _this.setState({
        selected1: [],
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
        retailCompanies = datata.filter(
          company => company.campaign_id != item.campaign_id
        );
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
      .get("/api/inbound-lists/campaigns?group_id=" + this.state.pageTitle)
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
      selected1,
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
    const pageTitleTEXT = "Campaign Groups : " + pageTitle;

    console.log("+++++++++++++");
    console.log(this.state.records);

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
                  numSelected1={selected1.length}
                  order={order}
                  orderBy={orderBy}
                  onSelectAllClick={this.handleSelectAllClick}
                  onSelectAllClick1={this.handleSelectAllClick1}
                  onRequestSort={this.handleRequestSort}
                  rowCount={this.state.records.length}
                />
                <TableBody>
                  {this.state.records &&
                    this.state.records.map((row, index) => {
                      return (
                        <TableRow key={index}>
                          <TableCell style={divStyle}>
                            {this.state.records[index].campaign_id}
                          </TableCell>
                          <TableCell style={divStyle}>
                            <Checkbox
                              color="primary"
                              onChange={e =>
                                this.handleChange(
                                  index,
                                  "closer_campaigns_status",
                                  e.target.checked
                                )
                              }
                              checked={
                                this.state.records[index]
                                  .closer_campaigns_status
                              }
                            />
                          </TableCell>
                          <TableCell style={divStyle}>
                            <Checkbox
                              color="primary"
                              onChange={e =>
                                this.handleChange(
                                  index,
                                  "xfer_groups_status",
                                  e.target.checked
                                )
                              }
                              checked={
                                this.state.records[index].xfer_groups_status
                              }
                            />
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

export default withRouter(CampList);
