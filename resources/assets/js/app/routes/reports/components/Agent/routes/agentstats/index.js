import React from "react";
import { cloneElement, Component } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import ContainerHeader from "../../../../../../../components/ContainerHeader/index";
import CardBox from "../../../../../../../components/CardBox/index";
import Paper from "@material-ui/core/Paper";
import FormControl from "@material-ui/core/FormControl";
import { Card, CardBody } from "reactstrap";
import moment from "moment";
import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";
import TextField from "@material-ui/core/TextField";
import { formatDate, parseDate } from "react-day-picker/moment";
import DayPickerInput from "react-day-picker/DayPickerInput";
import axios from "axios";
import "react-day-picker/lib/style.css";
import DateRange from "../../../common/DateRange";
import { CSVLink } from "react-csv";
import { dateValidation } from "../../../common/DateDiff";


import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import Helmet from "react-helmet";
import CircularProgress from "@material-ui/core/CircularProgress";

const headers = [
  { label: "First Name", key: "firstname" },
  { label: "Last Name", key: "lastname" },
  { label: "Email", key: "email" }
];

class AgentStats extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pageTitle: this.props.location.pathname.split("/")[5],
      from: moment(new Date()).format("YYYY-MM-DD"),
      to: moment(new Date()).format("YYYY-MM-DD"),
      userId: "",
      tableshow: false,
      temp_data: "",
      data: [],
      isLoading: false,
      DateError: ""
    };
  }

  handleSubmit = () => {
    this.setState({
      flag: false
    });
    console.log("Dat", this.state);
    const date = moment(new Date()).format("YYYY-MM-DD");
    const { from, to, userId, DateError, isLoading, data } = this.state;

    let status = false;

    if (dateValidation(from, to, date, 2) == false) {
      this.setState({
        DateError:
          "The date range for this report is limited to 60 days from today."
      });
      status = true;
    } else {
      this.setState({
        DateError: ""
      });
      status = false;
    }

    if (status == false) {
      this.setState({
        isLoading: true
        //tableshow: true,
      });

      var token = localStorage.getItem("access_token");
      const requestOptions = {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        }
      };

      axios
        .post(
          "api/agent-stats/",
          {
            startdate: from,
            enddate: to,
            userid: userId,
            did: ""
          },
          requestOptions
        )
        .then(response => {
          //console.log("Agent Stats"+response);
          if (response.status == 200) {
            this.setState({
              data: response.data.data,
              isLoading: false,
              tableshow: true
            });
          }
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  handleFromChange = fromDate => {
    this.setState({ from: moment(fromDate).format("YYYY-MM-DD") });
  };

  handleToChange = toDate => {
    this.setState({ to: moment(toDate).format("YYYY-MM-DD") });
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  componentDidMount() {
    this.setState({ userId: this.state.pageTitle });
  }

  handleCsvDownload() {
    let _this = this;
    let formData = {
      userid: "",
      startdate: "2018-06-03",
      enddate: "2018-08-03",
      did: "19492294059",
      type: "Closer_Calls"
    };

    axios
      .get(
        "/api/download-csv?startdate=2018-06-03&enddate=2018-08-03&did=19492294059&type=Closer_Calls"
      )
      .then(response => {
        this.setState({ temp_data: response.data });
      })
      .catch(function(error) {
        //  createNotification("Error","Error","Somthing Went Wrong !!!!")
      });
  }

  render() {
    const {
      from,
      to,
      tableshow,
      temp_data,
      data,
      isLoading,
      DateError
    } = this.state;

    return (
      <div>
        <ContainerHeader
          match={this.props.match}
          title="Server Stats and Reports"
        />
        <div className="row">
          <CardBox styleName="col-lg-12" heading="Agent Stats Report">
            <form className="row" autoComplete="off">
              <div className="col-lg-6 col-sm-6 col-12 .col-lg-offset-6">
                <FormControl className="w-100 mb-2">
                  <div key="basic_day" className="picker">
                    <h3>Date Range</h3>
                    <DateRange
                      onFromChange={this.handleFromChange}
                      onToChange={this.handleToChange}
                      from={from}
                      to={to}
                    />
                    {DateError ? (
                      <p style={{ color: "red", fontSize: "14px" }}>
                        The date range for this report is limited to 60 days
                        from today.
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                </FormControl>
              </div>

              <div className="col-lg-6 col-sm-6 col-12">
                <br />
                <TextField
                  id="userId"
                  label="Agent ID"
                  onChange={this.handleChange("userId")}
                  margin="normal"
                  value={this.state.userId}
                  fullWidth
                />
              </div>

              <div className="col-lg-12">
                <Button
                  variant="raised"
                  onClick={this.handleSubmit}
                  className="jr-btn bg-green text-white"
                >
                  Submit
                </Button>
              </div>
            </form>
          </CardBox>

          {isLoading && (
            <Dialog
              open={this.state.isLoading}
              onClose={this.handleRequestClose}
            >
              <DialogContent>
                <div className="loader-view">
                  <CircularProgress />
                </div>
              </DialogContent>
            </Dialog>
          )}

          <div className="col-lg-12">
            {tableshow == true ? (
              <Card className="shadow border-0 bg-default text-black">
                <CardBody>
                  <h3 className="card-title">
                    {/* Agent Stats for :{" "}
                    {data  ? data.usr.user + "-( " + data.usr.full_name + ")" : ""} */}
                  </h3>

                  <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12">
                      <label>AGENT TALK TIME AND STATUS:</label>
                      <button
                        type="button"
                        onClick={this.handleCsvDownload}
                        className="btn btn-raised btn-sm pull-right btn-success"
                      >
                        CSV Download
                      </button>
                    </div>
                  </div>
                  <Paper>
                    <div className="table-responsive-material">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>STATUS</TableCell>
                            <TableCell>COUNT</TableCell>
                            <TableCell>HOURS:MM:SS</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data ? (
                            [...Array(data.counts.length).keys()].map(key => (
                              <TableRow key={key}>
                                <TableCell>{data.status[key]}</TableCell>
                                <TableCell>{data.counts[key]}</TableCell>
                                <TableCell>
                                  {data.call_hours_minutes[key]}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3}>Data Not Found</TableCell>
                            </TableRow>
                          )}

                          <TableRow key={1}>
                            <TableCell>Total Calls</TableCell>
                            <TableCell>{data ? data.total_calls : 0}</TableCell>
                            <TableCell>
                              {data ? data.total_call_hours_minutes : 0}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </Paper>
                </CardBody>

                <CardBody>
                  <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12">
                      <label>AGENT LOGIN/LOGOUT TIME:</label>
                      <button
                        type="button"
                        onClick={this.handleCsvDownload}
                        className="btn btn-raised btn-sm pull-right btn-success"
                      >
                        CSV Download
                      </button>
                    </div>
                  </div>
                  <Paper>
                    <div className="table-responsive-material">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>EVENT</TableCell>
                            <TableCell>DATE</TableCell>
                            <TableCell>CAMPAIGN</TableCell>
                            <TableCell>GROUP</TableCell>
                            <TableCell>SESSION HOURS MM:SS</TableCell>
                            <TableCell>SERVER</TableCell>
                            <TableCell>PHONE</TableCell>
                            <TableCell>COMPUTER</TableCell>
                            <TableCell>PHONE LOGIN</TableCell>
                            <TableCell>PHONE IP</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data ? (
                            [...Array(data.userloginfo.length).keys()].map(
                              key => (
                                <TableRow key={key}>
                                  <TableCell>
                                    {data.userloginfo[key].event == null
                                      ? ""
                                      : data.userloginfo[key].event}
                                  </TableCell>
                                  <TableCell>
                                    {data.userloginfo[key].event_date == null
                                      ? ""
                                      : data.userloginfo[key].event_date}
                                  </TableCell>
                                  <TableCell>
                                    {data.userloginfo[key].campaign_id == null
                                      ? ""
                                      : data.userloginfo[key].campaign_id}
                                  </TableCell>
                                  <TableCell>
                                    {data.userloginfo[key].user_group == null
                                      ? ""
                                      : data.userloginfo[key].user_group}
                                  </TableCell>
                                  <TableCell>
                                    {data.userloginfo[key].session_id == null
                                      ? ""
                                      : data.userloginfo[key].session_id}
                                  </TableCell>
                                  <TableCell>
                                    {data.userloginfo[key].server_ip == null
                                      ? ""
                                      : data.userloginfo[key].server_ip}
                                  </TableCell>
                                  <TableCell>
                                    {data.userloginfo[key].extension == null
                                      ? ""
                                      : data.userloginfo[key].extension}
                                  </TableCell>
                                  <TableCell>
                                    {data.userloginfo[key].computer_ip == null
                                      ? ""
                                      : data.userloginfo[key].computer_ip}
                                  </TableCell>
                                  <TableCell>
                                    {data.userloginfo[key].phone_login == null
                                      ? ""
                                      : data.userloginfo[key].phone_login}
                                  </TableCell>
                                  <TableCell>
                                    {data.userloginfo[key].phone_ip == null
                                      ? ""
                                      : data.userloginfo[key].phone_ip}
                                  </TableCell>
                                  <TableCell />
                                </TableRow>
                              )
                            )
                          ) : (
                            <TableRow>
                              <TableCell colSpan={10}>Data Not Found</TableCell>
                            </TableRow>
                          )}
                          <TableRow>
                            <TableCell>Total</TableCell>
                            <TableCell />
                            <TableCell />
                            <TableCell />
                            <TableCell>
                              {data ? data.total_login_hours_minutes : 0}
                            </TableCell>
                            <TableCell />
                            <TableCell />
                            <TableCell />
                            <TableCell />
                            <TableCell />
                            <TableCell />
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </Paper>
                </CardBody>

                <CardBody>
                  <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12">
                      <label>TIME CLOCK LOGIN/LOGOUT TIME:</label>
                      <button
                        type="button"
                        onClick={this.handleCsvDownload}
                        className="btn btn-raised btn-sm pull-right btn-success"
                      >
                        CSV Download
                      </button>
                    </div>
                  </div>
                  <Paper>
                    <div className="table-responsive-material">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>EVENT</TableCell>
                            <TableCell>EDIT</TableCell>
                            <TableCell>DATE</TableCell>
                            <TableCell>IP ADDRESS</TableCell>
                            <TableCell>GROUP</TableCell>
                            <TableCell>HOURS MM:SS</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data ? (
                            [...Array(data.timeclockloginfo.length).keys()].map(
                              key => (
                                <TableRow key={key}>
                                  <TableCell>
                                    {data.timeclockloginfo[key].timeclock_id}
                                  </TableCell>
                                  <TableCell>
                                    {data.timeclockloginfo[key].event}
                                  </TableCell>
                                  <TableCell />
                                  <TableCell>
                                    {data.tc_log_date_array[key]}
                                  </TableCell>
                                  <TableCell>
                                    {data.timeclockloginfo[key].ip_address ==
                                    null
                                      ? ""
                                      : data.timeclockloginfo[key].ip_address}
                                  </TableCell>
                                  <TableCell>
                                    {data.timeclockloginfo[key].user_group}
                                  </TableCell>
                                  <TableCell>
                                    {data.timeclockloginfo[key].eventTime}
                                  </TableCell>
                                </TableRow>
                              )
                            )
                          ) : (
                            <TableRow>
                              <TableCell colSpan={7}>Data Not Found</TableCell>
                            </TableRow>
                          )}

                          <TableRow key={8}>
                            <TableCell>Total</TableCell>
                            <TableCell />
                            <TableCell />
                            <TableCell />
                            <TableCell />
                            <TableCell>
                              {data
                                ? data.total_timeclock_login_hours_minutes
                                : 0}
                            </TableCell>
                            <TableCell />
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </Paper>
                </CardBody>

                <CardBody>
                  <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12">
                      <label>CLOSER IN-GROUP SELECTION LOGS:</label>
                      <button
                        type="button"
                        onClick={this.handleCsvDownload}
                        className="btn btn-raised btn-sm pull-right btn-success"
                      >
                        CSV Download
                      </button>
                    </div>
                  </div>
                  <Paper>
                    <div className="table-responsive-material">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>DATE/TIME</TableCell>
                            <TableCell>CAMPAIGN</TableCell>
                            <TableCell>BLEND</TableCell>
                            <TableCell>GROUPS</TableCell>
                            <TableCell>MANAGER</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data ? (
                            [
                              ...Array(data.closeringrouplogs.length).keys()
                            ].map(key => (
                              <TableRow key={key}>
                                <TableCell>{key + 1}</TableCell>
                                <TableCell>
                                  {data.closeringrouplogs[key].event_date}
                                </TableCell>
                                <TableCell>
                                  {data.closeringrouplogs[key].campaign_id}
                                </TableCell>
                                <TableCell>
                                  {data.closeringrouplogs[key].blended}
                                </TableCell>
                                <TableCell>
                                  {data.closeringrouplogs[key].closer_campaigns}
                                </TableCell>
                                <TableCell>
                                  {data.closeringrouplogs[key].manager_change}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6}>Data Not Found</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </Paper>
                </CardBody>

                <CardBody>
                  <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12">
                      <label>
                        OUTBOUND CALLS FOR THIS TIME PERIOD: (10000 record
                        limit)
                      </label>
                      <button
                        type="button"
                        onClick={this.handleCsvDownload}
                        className="btn btn-raised btn-sm pull-right btn-success"
                      >
                        CSV Download
                      </button>
                    </div>
                  </div>
                  <Paper>
                    <div className="table-responsive-material">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>DATE/TIME</TableCell>
                            <TableCell>LENGTH</TableCell>
                            <TableCell>STATUS</TableCell>
                            <TableCell>PHONE</TableCell>
                            <TableCell>CAMPAIGN</TableCell>
                            <TableCell>GROUP</TableCell>
                            <TableCell>LIST</TableCell>
                            <TableCell>LEAD</TableCell>
                            <TableCell>HANGUP REASON</TableCell>
                            <TableCell>CALL NOTES</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data ? (
                            [...Array(data.outboundcalls.length).keys()].map(
                              key => (
                                <TableRow key={key}>
                                  <TableCell>{key + 1}</TableCell>
                                  <TableCell>
                                    {data.outboundcalls[key].call_date}
                                  </TableCell>
                                  <TableCell>
                                    {data.outboundcalls[key].length_in_sec ==
                                    null
                                      ? ""
                                      : data.outboundcalls[key].length_in_sec}
                                  </TableCell>
                                  <TableCell>
                                    {data.outboundcalls[key].status}
                                  </TableCell>
                                  <TableCell>
                                    {data.outboundcalls[key].phone_number}
                                  </TableCell>
                                  <TableCell>
                                    {data.outboundcalls[key].campaign_id}
                                  </TableCell>
                                  <TableCell>
                                    {data.outboundcalls[key].user_group == null
                                      ? ""
                                      : data.userloginfo[key].user_group}
                                  </TableCell>
                                  <TableCell>
                                    {data.outboundcalls[key].list_id}
                                  </TableCell>
                                  <TableCell>
                                    {data.outboundcalls[key].lead_id}
                                  </TableCell>
                                  <TableCell>
                                    {data.outboundcalls[key].term_reason}
                                  </TableCell>
                                  <TableCell>
                                    {data.outboundcalls[key].call_notes == null
                                      ? ""
                                      : data.userloginfo[key].call_notes}
                                  </TableCell>
                                </TableRow>
                              )
                            )
                          ) : (
                            <TableRow>
                              <TableCell colSpan={11}>Data Not Found</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </Paper>
                </CardBody>

                <CardBody>
                  <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12">
                      <label>
                        INBOUND / CLOSER CALLS FOR THIS TIME PERIOD: (10000
                        record limit)
                      </label>
                      <button
                        type="button"
                        onClick={this.handleCsvDownload}
                        className="btn btn-raised btn-sm pull-right btn-success"
                      >
                        CSV Download
                      </button>
                    </div>
                  </div>
                  <Paper>
                    <div className="table-responsive-material">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>DATE/TIME</TableCell>
                            <TableCell>LENGTH</TableCell>
                            <TableCell>STATUS</TableCell>
                            <TableCell>PHONE</TableCell>
                            <TableCell>CAMPAIGN</TableCell>
                            <TableCell>WAIT (S)</TableCell>
                            <TableCell>AGENTS (S)</TableCell>
                            <TableCell>LIST</TableCell>
                            <TableCell>LEAD</TableCell>
                            <TableCell>HANGUP REASON</TableCell>
                            <TableCell>CALL NOTES</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data ? (
                            [...Array(data.inboundcalls.length).keys()].map(
                              key => (
                                <TableRow key={key}>
                                  <TableCell>{key + 1}</TableCell>
                                  <TableCell>
                                    {data.inboundcalls[key].call_date}
                                  </TableCell>
                                  <TableCell>
                                    {data.inboundcalls[key].length_in_sec}
                                  </TableCell>
                                  <TableCell>
                                    {data.inboundcalls[key].status == null
                                      ? ""
                                      : data.inboundcalls[key].status}
                                  </TableCell>
                                  <TableCell>
                                    {data.inboundcalls[key].phone_number == null
                                      ? ""
                                      : data.inboundcalls[key].phone_number}
                                  </TableCell>
                                  <TableCell>
                                    {data.inboundcalls[key].campaign_id}
                                  </TableCell>
                                  <TableCell>
                                    {data.inboundcalls[key].queue_seconds}
                                  </TableCell>
                                  <TableCell>
                                    {data.agent_seconds_array[key]}
                                  </TableCell>
                                  <TableCell>
                                    {data.inboundcalls[key].list_id}
                                  </TableCell>
                                  <TableCell>
                                    {data.inboundcalls[key].lead_id}
                                  </TableCell>
                                  <TableCell>
                                    {data.inboundcalls[key].term_reason}
                                  </TableCell>
                                  <TableCell>
                                    {data.inboundcalls[key].call_notes == null
                                      ? ""
                                      : data.inboundcalls[key].call_notes}
                                  </TableCell>
                                </TableRow>
                              )
                            )
                          ) : (
                            <TableRow>
                              <TableCell colSpan={12}>Data Not Found</TableCell>
                            </TableRow>
                          )}
                          <TableRow>
                            <TableCell />
                            <TableCell>Total</TableCell>
                            <TableCell>
                              {data ? data.total_in_seconds : 0}
                            </TableCell>
                            <TableCell />
                            <TableCell />
                            <TableCell />
                            <TableCell />
                            <TableCell>
                              {data ? data.total_agent_seconds : 0}
                            </TableCell>
                            <TableCell />
                            <TableCell />
                            <TableCell />
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </Paper>
                </CardBody>

                <CardBody>
                  <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12">
                      <label>
                        AGENT ACTIVITY FOR THIS TIME PERIOD: (10000 record
                        limit) <small>these fields are in seconds</small>
                      </label>
                      <button
                        type="button"
                        onClick={this.handleCsvDownload}
                        className="btn btn-raised btn-sm pull-right btn-success"
                      >
                        CSV Download
                      </button>
                    </div>
                  </div>
                  <Paper>
                    <div className="table-responsive-material">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>DATE/TIME</TableCell>
                            <TableCell>PAUSE</TableCell>
                            <TableCell>WAIT</TableCell>
                            <TableCell>TALK</TableCell>
                            <TableCell>DISPO</TableCell>
                            <TableCell>DEAD</TableCell>
                            <TableCell>CUSTOMER</TableCell>
                            <TableCell>STATUS</TableCell>
                            <TableCell>LEAD</TableCell>
                            <TableCell>CAMPAIGN</TableCell>
                            <TableCell>PAUSE CODE</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data ? (
                            [...Array(data.agentactivity.length).keys()].map(
                              key => (
                                <TableRow key={key}>
                                  <TableCell>{key + 1}</TableCell>
                                  <TableCell>
                                    {data.agentactivity[key].event_time}
                                  </TableCell>
                                  <TableCell>
                                    {data.agentactivity[key].pause_sec}
                                  </TableCell>
                                  <TableCell>
                                    {data.agentactivity[key].wait_sec}
                                  </TableCell>
                                  <TableCell>
                                    {data.agentactivity[key].talk_sec}
                                  </TableCell>
                                  <TableCell>
                                    {data.agentactivity[key].dispo_sec}
                                  </TableCell>
                                  <TableCell>
                                    {data.agentactivity[key].dead_sec}
                                  </TableCell>
                                  <TableCell>
                                    {data.customer_sec_array[key]}
                                  </TableCell>
                                  <TableCell>
                                    {data.agentactivity[key].status == null
                                      ? ""
                                      : data.agentactivity[key].status}
                                  </TableCell>
                                  <TableCell>
                                    {data.agentactivity[key].lead_id == null
                                      ? ""
                                      : data.agentactivity[key].lead_id}
                                  </TableCell>
                                  <TableCell>
                                    {data.agentactivity[key].campaign_id}
                                  </TableCell>
                                  <TableCell>
                                    {data.agentactivity[key].sub_status == null
                                      ? ""
                                      : data.agentactivity[key].sub_status}
                                  </TableCell>
                                </TableRow>
                              )
                            )
                          ) : (
                            <TableRow>
                              <TableCell colSpan={12}>Data Not Found</TableCell>
                            </TableRow>
                          )}
                          <TableRow>
                            <TableCell />
                            <TableCell>Total</TableCell>
                            <TableCell>
                              {data ? data.total_pause_seconds : ""}
                            </TableCell>
                            <TableCell>
                              {data ? data.total_wait_seconds : ""}
                            </TableCell>
                            <TableCell>
                              {data ? data.total_talk_seconds : ""}
                            </TableCell>
                            <TableCell>
                              {data ? data.total_dispo_seconds : ""}
                            </TableCell>
                            <TableCell>
                              {data ? data.total_dead_seconds : ""}
                            </TableCell>
                            <TableCell>
                              {data ? data.total_customerseconds : ""}
                            </TableCell>
                            <TableCell />
                            <TableCell />
                            <TableCell />
                            <TableCell />
                          </TableRow>
                          <TableRow>
                            <TableCell />
                            <TableCell>(in HH:MM:SS)</TableCell>
                            <TableCell>
                              {data ? data.total_pause_second_shh : ""}
                            </TableCell>
                            <TableCell>
                              {data ? data.total_wait_second_shh : ""}
                            </TableCell>
                            <TableCell>
                              {data ? data.total_talk_second_shh : ""}
                            </TableCell>
                            <TableCell>
                              {data ? data.total_dispo_second_shh : ""}
                            </TableCell>
                            <TableCell>
                              {data ? data.total_dead_second_shh : ""}
                            </TableCell>
                            <TableCell>
                              {data ? data.total_customer_second_shh : ""}
                            </TableCell>
                            <TableCell />
                            <TableCell />
                            <TableCell />
                            <TableCell />
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </Paper>
                </CardBody>

                <CardBody>
                  <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12">
                      <label>
                        RECORDINGS FOR THIS TIME PERIOD: (10000 record limit)
                      </label>
                      <button
                        type="button"
                        onClick={this.handleCsvDownload}
                        className="btn btn-raised btn-sm pull-right btn-success"
                      >
                        CSV Download
                      </button>
                    </div>
                  </div>
                  <Paper>
                    <div className="table-responsive-material">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>LEAD</TableCell>
                            <TableCell>DATE/TIME</TableCell>
                            <TableCell>SECONDS</TableCell>
                            <TableCell>RECID</TableCell>
                            <TableCell>FILENAME</TableCell>
                            <TableCell>LOCATION</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data ? (
                            [...Array(data.recording.length).keys()].map(
                              key => (
                                <TableRow key={key}>
                                  <TableCell>{key + 1}</TableCell>
                                  <TableCell>
                                    {data.recording[key].lead_id}
                                  </TableCell>
                                  <TableCell>
                                    {data.recording[key].start_time}
                                  </TableCell>
                                  <TableCell>
                                    {data.recording[key].length_in_sec}
                                  </TableCell>
                                  <TableCell>
                                    {data.recording[key].recording_id}
                                  </TableCell>
                                  <TableCell>
                                    {data.recording[key].filename}
                                  </TableCell>
                                  <TableCell>
                                    <a href="#">
                                      {data.recording[key].location}
                                    </a>
                                  </TableCell>
                                </TableRow>
                              )
                            )
                          ) : (
                            <TableRow>
                              <TableCell colSpan={7}>Data Not Found</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </Paper>
                </CardBody>

                <CardBody>
                  <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12">
                      <label>
                        MANUAL OUTBOUND CALLS FOR THIS TIME PERIOD: (10000
                        record limit)
                      </label>
                      <button
                        type="button"
                        onClick={this.handleCsvDownload}
                        className="btn btn-raised btn-sm pull-right btn-success"
                      >
                        CSV Download
                      </button>
                    </div>
                  </div>
                  <Paper>
                    <div className="table-responsive-material">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>DATE/TIME</TableCell>
                            <TableCell>CALL TYPE</TableCell>
                            <TableCell>SERVER</TableCell>
                            <TableCell>PHONE</TableCell>
                            <TableCell>DIALED</TableCell>
                            <TableCell>LEAD</TableCell>
                            <TableCell>CALLER ID</TableCell>
                            <TableCell>ALIAS</TableCell>
                            <TableCell>PRESET</TableCell>
                            <TableCell>C3HU</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data ? (
                            [...Array(data.manualcalls.length).keys()].map(
                              key => (
                                <TableRow key={key}>
                                  <TableCell>{key + 1}</TableCell>
                                  <TableCell>
                                    {data.manualcalls[key].call_date}
                                  </TableCell>
                                  <TableCell>
                                    {data.manualcalls[key].call_type}
                                  </TableCell>
                                  <TableCell>
                                    {data.manualcalls[key].server_ip}
                                  </TableCell>
                                  <TableCell>
                                    {data.manualcalls[key].phone_number}
                                  </TableCell>
                                  <TableCell>
                                    {data.manualcalls[key].number_dialed}
                                  </TableCell>
                                  <TableCell>
                                    <a href="#">
                                      {data.manualcalls[key].lead_id}
                                    </a>
                                  </TableCell>
                                  <TableCell>
                                    {data.manualcalls[key].callerid}
                                  </TableCell>
                                  <TableCell>
                                    {data.manualcalls[key].group_alias_id ==
                                    null
                                      ? ""
                                      : data.manualcalls[key].group_alias_id}
                                  </TableCell>
                                  <TableCell>
                                    {data.manualcalls[key].preset_name == null
                                      ? ""
                                      : data.manualcalls[key].preset_name}
                                  </TableCell>
                                  <TableCell>
                                    {data.manualcalls[key].customer_hungup ==
                                    "BEFORE_CALL"
                                      ? "BC 0"
                                      : data.manualcalls[key].customer_hungup}
                                  </TableCell>
                                </TableRow>
                              )
                            )
                          ) : (
                            <TableRow>
                              <TableCell colSpan={11}>Data Not Found</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </Paper>
                </CardBody>

                <CardBody>
                  <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12">
                      <label>
                        LEAD SEARCHES FOR THIS TIME PERIOD: (10000 record limit)
                      </label>
                      <button
                        type="button"
                        onClick={this.handleCsvDownload}
                        className="btn btn-raised btn-sm pull-right btn-success"
                      >
                        CSV Download
                      </button>
                    </div>
                  </div>
                  <Paper>
                    <div className="table-responsive-material">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>DATE/TIME</TableCell>
                            <TableCell>TYPE</TableCell>
                            <TableCell>RESULTS</TableCell>
                            <TableCell>SEC</TableCell>
                            <TableCell>QUERY</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data ? (
                            [...Array(data.leadsearch.length).keys()].map(
                              key => (
                                <TableRow key={key}>
                                  <TableCell>{key + 1}</TableCell>
                                  <TableCell>
                                    {data.leadsearch[key].event_date}
                                  </TableCell>
                                  <TableCell>
                                    {data.leadsearch[key].source}
                                  </TableCell>
                                  <TableCell>
                                    {data.leadsearch[key].results}
                                  </TableCell>
                                  <TableCell>
                                    {data.leadsearch[key].seconds}
                                  </TableCell>
                                  <TableCell>
                                    {data.leadsearch[key].search_query}
                                  </TableCell>
                                </TableRow>
                              )
                            )
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6}>Data Not Found</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </Paper>
                </CardBody>

                <CardBody>
                  <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12">
                      <label>
                        PREVIEW LEAD SKIPS FOR THIS TIME PERIOD: (10000 record
                        limit)
                      </label>
                      <button
                        type="button"
                        onClick={this.handleCsvDownload}
                        className="btn btn-raised btn-sm pull-right btn-success"
                      >
                        CSV Download
                      </button>
                    </div>
                  </div>
                  <Paper>
                    <div className="table-responsive-material">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>DATE/TIME</TableCell>
                            <TableCell>LEAD ID</TableCell>
                            <TableCell>STATUS</TableCell>
                            <TableCell>COUNT</TableCell>
                            <TableCell>CAMPAIGN</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data ? (
                            [...Array(data.leadsearch.length).keys()].map(
                              key => (
                                <TableRow key={key}>
                                  <TableCell>{key + 1}</TableCell>
                                  <TableCell>
                                    {data.leadskip[key].event_date}
                                  </TableCell>
                                  <TableCell>
                                    {data.leadskip[key].lead_id}
                                  </TableCell>
                                  <TableCell>
                                    {data.leadskip[key].previous_status}
                                  </TableCell>
                                  <TableCell>
                                    {data.leadskip[key].previous_called_count}
                                  </TableCell>
                                  <TableCell>
                                    {data.leadskip[key].campaign_id}
                                  </TableCell>
                                </TableRow>
                              )
                            )
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6}>Data Not Found</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </Paper>
                </CardBody>
              </Card>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default AgentStats;
