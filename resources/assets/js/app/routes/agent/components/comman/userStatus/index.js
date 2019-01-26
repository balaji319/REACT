import {
  React,
  ContainerHeader,
  axios,
  Toolbar,
  Paper,
  CircularProgress
} from "../../../../../../components/plugins.js";
import { createNotification } from "../../../../../../Helpers";
import DataTableHead from "./DataTableHead";
import { rank_Count, grad_Count } from "./data";
let counter = 0;

class List extends React.Component {
  //calss  constructor
  constructor(props, context) {
    super(props, context);
    this.state = {
      order: "asc",
      pageTitle: this.props.location.pathname.split("/")[5],
      orderBy: "group_id",
      selected: [],
      data: [],
      page: 0,
      showAlert: false,
      alertContent: "",
      alertTitle: "",
      showConfirm: false,
      isLoading: false,
      records: [],
      u_records: [],
      report_log_id: "",
      user_id: "",
      campaign_id: ""
    };
  }

  //handle  methods && custome Handler
  handleSubmit = () => {
    let formData = {
      user: this.state.pageTitle,
      inbound_array: this.state.u_records
    };
    axios
      .post("/api/inbound-group-update", formData)
      .then(response => {
        createNotification("Success", "Success", response.data.message);
        this.setState({ isLoading: false });
      })
      .catch(function(error) {
        createNotification("Error", "Error", "Somthing Went Wrong !!!!");
      });
  };
  //alert msg
  showAlert(status, msg) {
    this.setState({ alertTitle: status, alertContent: msg, showAlert: true });
  }

  onCancelAlert = () => {
    this.setState({ showAlert: false });
  };

  elogOut = name => {
    let _this = this;
    let report_log_id = this.state.report_log_id;
    let user_id = this.state.user_id;
    let campaign_id = this.state.campaign_id;

    let type = name == "logout" ? "log_agent_out" : "tc_log_user_IN";
    let form_data = {
      user: user_id,
      stage: type,
      modify_timeclock_log: 1,
      campaign_id: campaign_id,
      report_log_id: report_log_id
    };
    axios
      .post("api/user-status-update-form", form_data)
      .then(res => {
        createNotification(
          "Success",
          "Success",
          response.data.data.vc_display_message
        );
        _this.fetchAll();
      })
      .catch(function(error) {
        createNotification("Success", "Success", "Agent Logout Successfully ");
        _this.fetchAll();
      });
  };
  changePageHandler = (event, page) => {
    this.setState({ page });
  };
  // befour component mount
  componentDidMount() {
    this.fetchAll();
  }

  //temp fetch all
  fetchAll() {
    let userId = this.state.pageTitle;
    let formData = {
      user: this.state.pageTitle
    };
    this.setState({ isLoading: true });
    axios
      .get("/api/user-status-form?user_id=" + userId)
      .then(response => {
        this.setState({
          records: response.data.data,
          user_id: response.data.data.user,
          report_log_id: response.data.data.report_log_id,
          campaign_id: response.data.data.agent_campaign
        });
        this.setState({ isLoading: false });
      })
      .catch(function(error) {
        this.setState({ records: response.data.data });
      });
  }

  render() {
    const { pageTitle, records } = this.state;
    //console.clear();
    //custom style const
    const divStyle = { padding: "4px 30px 4px 24px" };
    const pageTitleTEXT = "User Status : " + pageTitle;

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
            <div
              id="table-1_wrapper"
              className="dataTables_wrapper form-inline"
              role="grid"
            >
              <table className="table">
                {/*<TR><TD><B> &nbsp; </TD><TD><B> &nbsp; </TD></TR>*/}
                <tbody>
                  <tr>
                    <td align="LEFT" colSpan={2}>
                      <font face="ARIAL,HELVETICA" size={3}>
                        {" "}
                        <br />
                        {records.user} -{records.full_name}
                        KiranGroup <br />
                        {records.from_phone ? (
                          <React.Fragment>
                            <table className="table table-bordered">
                              {records && (
                                <tbody>
                                  <tr>
                                    <td>Agent Logged in at server:</td>
                                    <td> {records.login_time}</td>
                                  </tr>
                                  <tr>
                                    <td>in session:</td>
                                    <td>{records.in_session}</td>
                                  </tr>
                                  <tr>
                                    <td>from phone:</td>
                                    <td> {records.from_phone}</td>
                                  </tr>
                                  <tr>
                                    <td>Agent is in campaign:</td>
                                    <td> {records.agent_campaign}</td>
                                  </tr>
                                  <tr>
                                    <td>status:</td>
                                    <td> {records.status}</td>
                                  </tr>
                                  <tr>
                                    <td>hungup last call at:</td>
                                    <td> {records.hungup_last_call_at}</td>
                                  </tr>
                                  <tr>
                                    <td>Closer groups:</td>
                                    <td> {records.closer_groups}</td>
                                  </tr>
                                </tbody>
                              )}
                            </table>
                            <br />
                            <input type="hidden" name="DB" defaultValue />
                            <input
                              type="hidden"
                              name="user"
                              defaultValue={405}
                            />
                            <input
                              type="hidden"
                              name="stage"
                              defaultValue="log_agent_out"
                            />
                            <input
                              type="submit"
                              name="submit"
                              onClick={() => {
                                this.elogOut("logout");
                              }}
                              defaultValue="EMERGENCY LOG AGENT OUT"
                              className="btn btn-success"
                              align="center"
                            />
                            <br />
                          </React.Fragment>
                        ) : (
                          " Agent is not logged in "
                        )}
                        <br />
                        <br /> {records.user} -{records.full_name} - is NOT
                        logged in to the Time Clock. <br />Last logout time:{" "}
                        {records.login_time}
                        from {records.login_from}
                        <br />
                        <br />
                        <br />
                        <input type="hidden" name="DB" defaultValue />
                        <input type="hidden" name="user" defaultValue={405} />
                        <input
                          type="hidden"
                          name="stage"
                          defaultValue="tc_log_user_IN"
                        />
                        <input
                          type="hidden"
                          name="hidediv"
                          defaultValue="hidediv"
                        />
                        <input
                          type="submit"
                          name="submit"
                          onClick={() => {
                            this.elogOut("clock");
                          }}
                          defaultValue="TIMECLOCK LOG THIS USER IN"
                          className="btn btn-success"
                          disabled
                        />
                        <br />
                        <br />
                        <div className="alert alert-warning">
                          <strong>Note : </strong> Time Clock Feature Is
                          disabled For Now
                        </div>
                        <br />
                      </font>
                    </td>
                  </tr>
                  <tr>
                    <td align="LEFT" colSpan={2}>
                      <br />
                      <br />
                      <br />
                    </td>
                  </tr>
                </tbody>
              </table>
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
