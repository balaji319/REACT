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
  CircularProgress,
  Tooltip,
  IconButton
} from "../../../../../../../../components/plugins.js";
import { createNotification } from "../../../../../../../../Helpers";
import ButtonNav from "../../../../../../../../components/navButton/";
import DataTableHead from "./DataTableHead";
import { rank_Count, grad_Count } from "./data";
//import  API_INBOUND_AGENT_GROUP_COMMON   from '../../../../../../constants';
//import  API_INBOUND_AGENT_GROUP_LIST_COMMON   from '../../../../../constants';

let counter = 0;

class DIDS extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      order: "asc",
      pageTitle: this.props.location.pathname.split("/")[5],
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

  handleEditEventHandler = id => {
    this.props.history.push("/app/inbound/number/edit/" + id);
  };

  // befour component mount
  componentDidMount() {
    this.getAllData();
  }

  getAllData = e => {
    this.setState({ isLoading: true });
    axios
      .get("/api/call-menu-number-list/" + this.state.pageTitle)

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
      page
    } = this.state;
    //console.clear();
    //custom style const
    const divStyle = { padding: "4px 30px 4px 24px" };
    const pageTitleTEXT = "Numbers Using This Call Menu: " + pageTitle;

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
                          {row.did_pattern}
                        </TableCell>
                        <TableCell style={divStyle}>
                          {row.did_description}
                        </TableCell>

                        <TableCell style={divStyle}>
                          <Tooltip title="Edit DID">
                            <IconButton
                              onClick={() =>
                                this.handleEditEventHandler(row.did_pattern)
                              }
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

export default DIDS;
