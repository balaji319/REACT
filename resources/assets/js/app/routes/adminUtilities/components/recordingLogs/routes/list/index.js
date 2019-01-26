import {
  React,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  InfoCard,
  ContainerHeader,
  CardBox,
  Paper,
  Input,
  InputLabel,
  MenuItem,
  FormControl,
  FormHelperText,
  Select,
  Toolbar,
  Card,
  CardBody,
  Tooltip,
  IconButton,
  connect,
  TablePagination,
  TableFooter,
  CardSubtitle,
  CardText,
  TextField,
  cloneElement,
  Component,
  Button,
  moment,
  DayPickerInput,
  formatDate,
  parseDate,
  Helmet,
  DateRange
} from "./plugins";

import DataTableHead from "./DataTableHead";

import { fetchRecordingLists } from "../../../../actions/";
import NoRecords from "../../../../../../../components/common/NoRecords";
import { CircularProgress } from "@material-ui/core";

class List extends React.Component {
  constructor(props) {
    super(props);
    var ts = new Date();
    this.state = {
      type: "show_all_campaign",
      campaigns: [],
      order: "asc",
      orderBy: "group_id",
      selected: [],
      data: [],
      page: 0,
      rowsPerPage: 25,
      search_value: "",
      display_as: "text",
      inbound_group: "",
      from: moment(new Date()).format("YYYY-MM-DD"),
      to: moment(new Date()).format("YYYY-MM-DD"),
      fromSelectedDate: moment(ts).format("MM/DD/YYYY HH:MM:SS"),
      toSelectedDate: moment(ts).format("MM/DD/YYYY HH:MM:SS"),
      userGroups: [],
      user: "",
      lead_id: "",
      phone_number: "",
      total: ""
    };
  }

  handleDateChange = date => {
    this.setState({ selectedDate: date });
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  handleSubmit = () => {
    this.getRecordingLists();
  };

  //table sort function
  handleRequestSort = (event, property) => {
    let temp_data = this.props.leadfilterlist.data;
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

  handleChangePage = (event, page) => {
    this.setState({ page });
  };
  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  handleFromChange = fromDate => {
    let _this = this;
    this.setState({ from: moment(fromDate).format("YYYY-MM-DD") });
    setTimeout(function() {
      _this.state.from;
    }, 1000);
  };
  DownloadMp3 = location => {
    if (location != "Not Ready") {
      window.open(location, "_self");
    }
  };

  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      alertTitle: nextPropsFromRedux.Agent.alertMessageTitle,
      showAlert: nextPropsFromRedux.Agent.showMessage,
      alertContent: nextPropsFromRedux.Agent.alertMessage,
      ajaxdata: nextPropsFromRedux.Agent ? nextPropsFromRedux.Agent.data : [],
      total: nextPropsFromRedux.Agent.total,
      sectionin: nextPropsFromRedux.Agent
        ? nextPropsFromRedux.Agent.sectionin
        : "",
      isLoading: nextPropsFromRedux.Agent
        ? nextPropsFromRedux.Agent.isLoading
        : false
    });
    console.log(nextPropsFromRedux);
  }
  handleToChange = toDate => {
    this.setState({ to: moment(toDate).format("YYYY-MM-DD") });
  };
  componentDidMount() {
    this.getRecordingLists(0, this.state.rowsPerPage);
  }

  getRecordingLists(page = 0, page_size = 10) {
    let from_date = moment(this.state.fromSelectedDate).format("MM/DD/YYYY ");
    let to_date = moment(this.state.toSelectedDate).format("MM/DD/YYYY ");
    const { from, to, user, lead_id, phone_number } = this.state;
    let rowsPerPage = this.state.rowsPerPage;
    let search_value = this.state.search_value;
    let current_page = page + 1;
    const search_data = {
      start_date: from,
      end_date: to,
      user: user,
      lead_id: lead_id,
      phone_number: phone_number,
      page: current_page,
      limit: rowsPerPage,
      search: search_value
    };

    this.props.fetchRecordingLists(search_data);
  }

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
    this.getRecordingLists(this.state.page, event.target.value);
  };
  //handle  methods && custome Handler
  changePageHandler = (event, page) => {
    this.setState({ page });
    this.getRecordingLists(page, this.state.rowsPerPage);
  };

  changeRowsPerPageHandler = event => {
    this.setState({ rowsPerPage: event.target.value });
    this.getRecordingLists(this.state.page, event.target.value);
  };

  render() {
    const {
      fromSelectedDate,
      toSelectedDate,
      user,
      lead_id,
      phone_number
    } = this.state;
    const {
      data,
      order,
      orderBy,
      selected,
      sectionin,
      rowsPerPage,
      page,
      ajaxdata,
      total,
      isLoading
    } = this.state;
    const { from, to } = this.state;
    const modifiers = { start: from, end: to };
    const divStyle = { padding: "4px 30px 4px 24px", textAlign: "left" };

    const Base64 = {
      _keyStr:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
      encode: function(e) {
        var t = "";
        var n, r, i, s, o, u, a;
        var f = 0;
        e = Base64._utf8_encode(e);
        while (f < e.length) {
          n = e.charCodeAt(f++);
          r = e.charCodeAt(f++);
          i = e.charCodeAt(f++);
          s = n >> 2;
          o = ((n & 3) << 4) | (r >> 4);
          u = ((r & 15) << 2) | (i >> 6);
          a = i & 63;
          if (isNaN(r)) {
            u = a = 64;
          } else if (isNaN(i)) {
            a = 64;
          }
          t =
            t +
            this._keyStr.charAt(s) +
            this._keyStr.charAt(o) +
            this._keyStr.charAt(u) +
            this._keyStr.charAt(a);
        }
        return t;
      },
      decode: function(e) {
        var t = "";
        var n, r, i;
        var s, o, u, a;
        var f = 0;
        e = e.replace(/[^A-Za-z0-9+/=]/g, "");
        while (f < e.length) {
          s = this._keyStr.indexOf(e.charAt(f++));
          o = this._keyStr.indexOf(e.charAt(f++));
          u = this._keyStr.indexOf(e.charAt(f++));
          a = this._keyStr.indexOf(e.charAt(f++));
          n = (s << 2) | (o >> 4);
          r = ((o & 15) << 4) | (u >> 2);
          i = ((u & 3) << 6) | a;
          t = t + String.fromCharCode(n);
          if (u != 64) {
            t = t + String.fromCharCode(r);
          }
          if (a != 64) {
            t = t + String.fromCharCode(i);
          }
        }
        t = Base64._utf8_decode(t);
        return t;
      },
      _utf8_encode: function(e) {
        e = e.replace(/rn/g, "n");
        var t = "";
        for (var n = 0; n < e.length; n++) {
          var r = e.charCodeAt(n);
          if (r < 128) {
            t += String.fromCharCode(r);
          } else if (r > 127 && r < 2048) {
            t += String.fromCharCode((r >> 6) | 192);
            t += String.fromCharCode((r & 63) | 128);
          } else {
            t += String.fromCharCode((r >> 12) | 224);
            t += String.fromCharCode(((r >> 6) & 63) | 128);
            t += String.fromCharCode((r & 63) | 128);
          }
        }
        return t;
      },
      _utf8_decode: function(e) {
        var t = "";
        var n = 0;
        var r = (c1 = c2 = 0);
        while (n < e.length) {
          r = e.charCodeAt(n);
          if (r < 128) {
            t += String.fromCharCode(r);
            n++;
          } else if (r > 191 && r < 224) {
            c2 = e.charCodeAt(n + 1);
            t += String.fromCharCode(((r & 31) << 6) | (c2 & 63));
            n += 2;
          } else {
            c2 = e.charCodeAt(n + 1);
            c3 = e.charCodeAt(n + 2);
            t += String.fromCharCode(
              ((r & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
            );
            n += 3;
          }
        }
        return t;
      }
    };
    return (
      <div>
        <ContainerHeader match={this.props.match} title="Recording Log" />

        <div className="row">
          <CardBox styleName="col-lg-12" heading="">
            <form className="row" autoComplete="off">
              <div
                className="col-lg-6 col-sm-6 col-12"
                style={{ paddingTop: "17px" }}
              >
                <div class="red_box_inactivess" />
              </div>
              <div class="red_box_inactive">
                Recording Plan : Not Active (1 year only)
              </div>
              <div
                className="col-lg-6 col-sm-6 col-12"
                style={{ paddingTop: "17px" }}
              >
                <FormControl className="w-100 mb-2">
                  <div key="basic_day" className="picker">
                    <div className="InputFromTo">
                      <DateRange
                        onFromChange={this.handleFromChange}
                        onToChange={this.handleToChange}
                        from={from}
                        to={to}
                      />
                      <FormHelperText color="Red">
                        The date range for this log report is limited to 1 year
                        from today
                      </FormHelperText>
                      <Helmet>
                        <style>
                          {`
                                                      .InputFromTo .DayPicker-Day--selected:not(.DayPicker-Day--start):not(.DayPicker-Day--end):not(.DayPicker-Day--outside) {
                                                        background-color: #f0f8ff !important;
                                                        color: #4a90e2;
                                                      }
                                                      .InputFromTo .DayPicker-Day {
                                                        border-radius: 0 !important;
                                                      }
                                                      .InputFromTo .DayPicker-Day--start {
                                                        border-top-left-radius: 50% !important;
                                                        border-bottom-left-radius: 50% !important;
                                                      }
                                                      .InputFromTo .DayPicker-Day--end {
                                                        border-top-right-radius: 50% !important;
                                                        border-bottom-right-radius: 50% !important;
                                                      }
                                                      .InputFromTo .DayPickerInput-Overlay {
                                                        width: 550px;
                                                      }
                                                      .InputFromTo-to .DayPickerInput-Overlay {
                                                        margin-left: -198px;
                                                      }
                                                `}
                        </style>
                      </Helmet>
                    </div>
                    <FormHelperText error={true} />
                  </div>
                </FormControl>

                <FormControl className="w-100 mb-2">
                  <TextField
                    margin="normal"
                    id="notifySms"
                    label="User "
                    fullWidth
                    value={this.state.user || ""}
                    onChange={this.handleChange("user")}
                  />
                </FormControl>
              </div>
              <div className="col-lg-6 col-sm-6 col-12">
                <FormControl className="w-100 mb-2">
                  <TextField
                    margin="normal"
                    id="notifySms"
                    label="Lead Id "
                    fullWidth
                    value={this.state.lead_id || ""}
                    onChange={this.handleChange("lead_id")}
                  />
                  <FormHelperText />
                </FormControl>

                <FormControl className="w-100 mb-2">
                  <TextField
                    margin="normal"
                    id="notifySms"
                    label="Phone Number"
                    fullWidth
                    value={this.state.phone_number || ""}
                    onChange={this.handleChange("phone_number")}
                  />
                  <FormHelperText />
                </FormControl>
              </div>
              <Button
                color="primary"
                className="jr-btn bg-success text-white"
                onClick={this.handleSubmit}
              >
                Submit
              </Button>
            </form>
          </CardBox>
        </div>

        <div className="col-lg-12" style={{ padding: "0px" }}>
          <div className="jr-card " style={{ padding: "0px" }}>
            <div className="jr-card-body ">
              <div className="col-md-12 col-12 mt-12">
                <Toolbar className="table-header">
                  <div className="title">
                    <h3>
                      <i className="zmdi zmdi-view-web mr-2" /> Listing
                    </h3>
                  </div>
                  <div className="spacer" />
                  <div className="actions" />
                </Toolbar>

                <div className="card-body" style={{ padding: "0px" }}>
                  <Paper>
                    <div className="flex-auto">
                      <div className="table-responsive-material">
                        <Table className="">
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
                              sectionin == "Recording data" &&
                              ajaxdata.map(n => {
                                var encoded_url = "";
                                if (n.location) {
                                  encoded_url = Base64.encode(n.location);
                                } else {
                                  n.location = "Not Ready";
                                }

                                return (
                                  <TableRow key={n.shift_id}>
                                    <TableCell style={divStyle}>
                                      {n.start_time}
                                    </TableCell>
                                    <TableCell style={divStyle}>
                                      {n.end_time}
                                    </TableCell>
                                    <TableCell style={divStyle}>
                                      {n.length_in_sec}
                                    </TableCell>
                                    <TableCell style={divStyle}>
                                      {n.length_in_min}
                                    </TableCell>
                                    <TableCell style={divStyle}>
                                      <a> {n.location}</a>
                                    </TableCell>
                                    <TableCell style={divStyle}>
                                      {n.lead_id}
                                    </TableCell>
                                    <TableCell style={divStyle}>
                                      {n.user}
                                    </TableCell>

                                    <TableCell style={divStyle}>
                                      {" "}
                                      <i
                                        className="fa fa-download"
                                        aria-hidden="true"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => {
                                          this.DownloadMp3(n.location);
                                        }}
                                      />{" "}
                                    </TableCell>

                                    <TableCell
                                      style={divStyle}
                                      className="text-center"
                                      style={{ whiteSpace: "nowrap" }}
                                    >
                                      <audio controls>
                                        <source
                                          src={n.location}
                                          type="audio/ogg"
                                        />
                                        <source
                                          src={n.location}
                                          type="audio/mpeg"
                                        />
                                        Your browser does not support the audio
                                        element.
                                      </audio>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            <NoRecords
                              Records={ajaxdata}
                              isLoading={isLoading}
                            />
                          </TableBody>
                          <TableFooter>
                            <TableRow>
                              <TablePagination
                                count={parseInt(total)}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onChangePage={this.changePageHandler}
                                onChangeRowsPerPage={
                                  this.changeRowsPerPageHandler
                                }
                              />
                            </TableRow>
                          </TableFooter>
                        </Table>
                      </div>
                    </div>
                  </Paper>
                </div>
              </div>
            </div>
          </div>
        </div>
        {this.props.Agent.isLoading && (
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
    Agent: state.admin_utilites
  };
}

const mapDispatchToProps = {
  fetchRecordingLists
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(List);
