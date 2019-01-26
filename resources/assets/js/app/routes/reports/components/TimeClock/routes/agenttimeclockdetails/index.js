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
  Card,
  CardBody,
  CardSubtitle,
  CardText,
  cloneElement,
  Component,
  Button,
  moment
} from "./plugins";

const BREAKDOWN_COL = 3;
import DateFnsUtils from "material-ui-pickers/utils/date-fns-utils";
import UserGroupMultipeDropdown from "../../../common/UserGroupMultipeDropdown";
import MuiPickersUtilsProvider from "material-ui-pickers/utils/MuiPickersUtilsProvider";
import LinearProgress from "@material-ui/core/LinearProgress";
import MultipeDropdown from "../../../common/MultipeDropdown";
import Dropdown from "../../../common/Dropdown";
import DateRange from "../../../common/DateRange";
import TextFields from "../../../common/TextFields";
import TableFooter from "@material-ui/core/TableFooter";
import TablePagination from "@material-ui/core/TablePagination";
import { DateTimePicker } from "material-ui-pickers";
110100;
import CircularProgress from "@material-ui/core/CircularProgress";
import { connect } from "react-redux";
import { fetchAllUserGroup } from "../../../../actions/";

import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";

import { Progress } from "react-sweet-progress";
import "react-sweet-progress/lib/style.css";

import Helmet from "react-helmet";

const ORDER = [
  "hours_up",
  "hours_down",
  "user_up",
  "user_down",
  "name_up",
  "name_down",
  "group_up",
  "group_down"
];
const DISPLAYAS = ["TEXT", "HTML"];
const SHIFT = ["ALL", "AM", "PM"];

class AgentTimeClockDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeCol: 0,
      colName: "",
      displayAs: "TEXT",
      shift: "ALL",
      from: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
      to: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
      userGroups: ["-ALL-"],
      user: "",
      order: "",
      UserGroupList: [],
      data: [],
      total_hour: "",
      flag: false,
      page: 0,
      rowsPerPage: 25,
      isLoading: false,
      total_agent: 0,
      max_value: "",
      user: [],
      currant_date: moment(new Date()).format("YYYY-MM-DD HH:MM:SS")
    };
  }

  handleChange = (name, value) => {
    this.setState({
      [name]: value
    });
  };

  handleSubmit = () => {
    const { from, to, userGroups, shift, displayAs, max_value } = this.state;
    this.setState({
      isLoading: true,
      currant_date: moment(new Date()).format("YYYY-MM-DD HH:MM:SS")
    });
    if (displayAs == "html") {
      this.setState({ activeCol: 0 });
    }

    var token = localStorage.getItem("access_token");
    const requestOptions = {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      }
    };

    axios
      .post(
        "api/user_time_clock_detail_report/",
        {
          start_date: from,
          end_date: to,
          shift: shift,
          user_group: userGroups
        },
        requestOptions
      )
      .then(response => {
        this.setState({
          data: response.data.graph_stat_html,
          total_hour: response.data.total_time_tc,
          total_agent: response.data.total_agents,
          max_value: response.data.maxValue,
          flag: true,
          isLoading: false
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  handleFromDateChange = date => {
    this.setState({ from: moment(date).format("YYYY-MM-DD HH:mm:ss") });
  };

  handleToDateChange = date => {
    this.setState({ to: moment(date).format("YYYY-MM-DD HH:mm:ss") });
  };

  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      alertTitle: nextPropsFromRedux.UserGroup.alertMessageTitle,
      showAlert: nextPropsFromRedux.UserGroup.showMessage,
      alertContent: nextPropsFromRedux.UserGroup.alertMessage,
      UserGroupList: nextPropsFromRedux.UserGroup.data
      //isLoading: nextPropsFromRedux.UserGroup.isLoading ,
    });
    this.state.UserGroupList.unshift("-ALL-");
  }

  componentDidMount() {
    this.props.fetchAllUserGroup();

    const { from, to, userGroups, shift, displayAs, max_value } = this.state;
    this.setState({ isLoading: true });

    var token = localStorage.getItem("access_token");
    const requestOptions = {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      }
    };

    axios
      .post(
        "api/user_time_clock_detail_report/",
        {
          start_date: from,
          end_date: to,
          shift: shift,
          user_group: userGroups
        },
        requestOptions
      )
      .then(response => {
        this.setState({
          data: response.data.graph_stat_html,
          total_hour: response.data.total_time_tc,
          total_agent: response.data.total_agents,
          max_value: response.data.maxValue,
          flag: true,
          isLoading: false
        });
      })
      .catch(error => {
        console.log(error);
      });
  }

  handleChangePage = (event, page) => {
    this.setState({ page });
  };
  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  render() {
    const {
      currant_date,
      max_value,
      from,
      to,
      displayAs,
      shift,
      userGroups,
      activeCol,
      colName,
      order,
      flag,
      rowsPerPage,
      page,
      isLoading,
      UserGroupList,
      total_hour,
      total_agent,
      data,
      user
    } = this.state;
    const test = [];
    return (
      <div>
        <Helmet>
          <title>UserTimeClockDetailReport | Ytel</title>
        </Helmet>
        <ContainerHeader
          match={this.props.match}
          title="User Time Clock Detail Report"
        />

        <div className="row">
          <CardBox styleName="col-lg-12" heading={""}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <form className="row" autoComplete="off">
                <div className="col-lg-6 col-sm-6 col-12">
                  <FormControl className="w-100 mb-2">
                    <p>Dates</p>

                    <DateTimePicker
                      fullWidth
                      format="YYYY-MM-DD HH:mm:ss"
                      value={from}
                      showTabs={false}
                      onChange={this.handleFromDateChange}
                      leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                      rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                    />

                    <FormHelperText>
                      The date range for this report is limited to 60 days from
                      today.
                    </FormHelperText>
                  </FormControl>

                  <FormControl className="w-100 mb-2">
                    <p>To</p>
                    <DateTimePicker
                      fullWidth
                      format="YYYY-MM-DD HH:mm:ss"
                      value={to}
                      showTabs={false}
                      onChange={this.handleToDateChange}
                      leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                      rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                    />
                    <FormHelperText>
                      The date range for this report is limited to 60 days from
                      today.
                    </FormHelperText>
                  </FormControl>

                  <Dropdown
                    label={"Shift"}
                    onChange={this.handleChange}
                    name={"shift"}
                    selectedValue={shift}
                    data={SHIFT}
                  />

                  <Button
                    color="primary"
                    className="jr-btn bg-success text-white"
                    onClick={this.handleSubmit}
                  >
                    Submit
                  </Button>

                  <Button
                    color="primary"
                    className="jr-btn bg-success text-white"
                    onClick={this.handleSubmit}
                  >
                    Download CSV
                  </Button>
                </div>
                <div className="col-lg-6 col-sm-6 col-12">
                  <UserGroupMultipeDropdown
                    label={"User Groups"}
                    options={UserGroupList}
                    onChange={this.handleChange}
                    name={"userGroups"}
                    selectedValue={userGroups}
                    default={"-ALL-"}
                  />

                  <Dropdown
                    label={"Display As"}
                    onChange={this.handleChange}
                    name={"displayAs"}
                    selectedValue={displayAs}
                    data={DISPLAYAS}
                  />
                </div>
              </form>
            </MuiPickersUtilsProvider>
          </CardBox>
        </div>
        {isLoading && (
          <Dialog open={this.state.isLoading} onClose={this.handleRequestClose}>
            <DialogContent>
              <div className="loader-view">
                <CircularProgress />
              </div>
            </DialogContent>
          </Dialog>
        )}
        {/* {
                isLoading &&
                <div className="loader-view" style={{left:'0',  bottom: '0',right: '0',top: '0',position: 'fixed'}}>
                    <CircularProgress/>
                </div>
            } */}

        {flag ? (
          <Card className="shadow border-0 bg-default text-black">
            <CardBody>
              <span>
                <label className="card-title">User Time-Clock Detail:</label>
                &nbsp;&nbsp;
                {userGroups} &nbsp;&nbsp;|&nbsp;&nbsp; {currant_date}
              </span>
              <h3 className="card-title">
                Time range: {moment(from).format("YYYY-MM-DD HH:mm:ss")}{" "}
                00:00:00 TO {moment(to).format("YYYY-MM-DD HH:mm:ss")} 23:59:59
              </h3>

              <div className="row">
                <div
                  className="col-lg-12 col-sm-12 col-12"
                  style={{ textAlign: "center" }}
                >
                  <h2 style={{ color: "#036" }}>Agent Time-Clock Detail</h2>
                  <label>* denotes AUTOLOGOUT from Time Clock</label>
                </div>
              </div>
              <Paper>
                <div className="table-responsive-material">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell
                          className={displayAs == "HTML" ? "hide-td" : ""}
                        >
                          ID
                        </TableCell>
                        <TableCell
                          className={displayAs == "HTML" ? "hide-td" : ""}
                        >
                          USER GROUP
                        </TableCell>
                        <TableCell
                          colSpan={displayAs == "HTML" ? BREAKDOWN_COL : 1}
                        >
                          Time Clock
                        </TableCell>
                        <TableCell>Time Clock Punches</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.map((n, i) => {
                        var arr = new Array();
                        arr = n[0].split(/[-/]+/);
                        return (
                          <TableRow key={i}>
                            <TableCell>
                              {displayAs == "HTML" ? n[0] : arr[0]}
                            </TableCell>
                            <TableCell
                              className={displayAs == "HTML" ? "hide-td" : ""}
                            >
                              {arr[1]}
                            </TableCell>
                            <TableCell
                              className={displayAs == "HTML" ? "hide-td" : ""}
                            >
                              {arr[2]}
                            </TableCell>
                            <TableCell
                              colSpan={displayAs == "HTML" ? BREAKDOWN_COL : 1}
                            >
                              {displayAs == "HTML" ? (
                                <div>
                                  <LinearProgress
                                    color="primary"
                                    variant="determinate"
                                    value={(100 * n[1]) / max_value}
                                    className="progressbar-height"
                                  />
                                  {/* <span color="primary" className="badge badge-secondary progressbar-indicator">{n[2]}</span> */}
                                  <span
                                    color="primary"
                                    className="badge badge-secondary"
                                  >
                                    {n[2]}
                                  </span>
                                </div>
                              ) : (
                                n[2]
                              )}
                            </TableCell>
                            <TableCell>{n[3]}</TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow key={398755}>
                        <TableCell>TOTAL AGENTS : {total_agent}</TableCell>
                        <TableCell
                          className={displayAs == "HTML" ? "hide-td" : ""}
                        >
                          {" "}
                        </TableCell>
                        <TableCell
                          className={displayAs == "HTML" ? "hide-td" : ""}
                        >
                          {" "}
                        </TableCell>
                        <TableCell
                          colSpan={displayAs == "HTML" ? BREAKDOWN_COL : 1}
                        >
                          {total_hour}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TablePagination
                          count={data.length}
                          rowsPerPage={rowsPerPage}
                          page={page}
                          onChangePage={this.handleChangePage}
                          onChangeRowsPerPage={this.handleChangeRowsPerPage}
                        />
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </Paper>
              <br />
              <br />

              <br />
              <br />
            </CardBody>
          </Card>
        ) : (
          ""
        )}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    UserGroup: state.usergrouplist
  };
}

const mapDispatchToProps = {
  fetchAllUserGroup
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AgentTimeClockDetails);
