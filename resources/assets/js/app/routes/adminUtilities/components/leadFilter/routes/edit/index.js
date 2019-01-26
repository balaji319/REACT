import React, { Component } from "react";
import { UncontrolledAlert, Alert } from "reactstrap";
import SweetAlert from "react-bootstrap-sweetalert";
import CircularProgress from "@material-ui/core/CircularProgress";
import Paper from "@material-ui/core/Paper";
import Switch from "@material-ui/core/Switch";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import ContainerHeader from "../../../../../../../components/ContainerHeader/index";
import CardBox from "../../../../../../../components/CardBox/index";
import CustomPicker from "../../../../../../../components/pickers/routes/Color/customPicker";
import IntlMessages from "../../../../../../../util/IntlMessages";
import VoicemailPopUp from "../../../../../../../components/VoicemailPopUp/VoicemailPopUp";
import { addfilterlist, fetchfilterlist } from "../../../../actions/";
import { agents_group, mail_data, style_header, week_days } from "./data";
import axios from "axios";
import { connect } from "react-redux";
import Demo from "./demo.js";

class Edit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pageTitle: this.props.location.pathname.split("/")[4],
      filterId:
        this.props.location.pathname.split("/")[4] == "add"
          ? ""
          : this.props.location.pathname.split("/").pop(),
      showinfo: "Hover to the input on left and help text will come up here :)",
      showinfotitle: "Help Block",
      pageError: "",
      is_change: false,
      showAlert: false,
      alertContent: "",
      alertTitle: "",
      filtername: "",
      filtercomment: "",
      filtersql: "",
      filterIdError: false,
      filternameError: false,
      filtercommnetError: false,
      filtersqlError: false
    };
  }

  componentDidMount() {
    if (this.state.pageTitle == "edit") {
      this.props.fetchfilterlist(this.state.filterId);
    }

    //console.log("BALAJI"+this.props.Agent.data.filter(x => x.shift_id === '24HRMIDNIGHT'))
  }

  componentWillReceiveProps(nextPropsFromRedux) {
    if (nextPropsFromRedux.Agent.record_data) {
      this.setState({
        filtername: nextPropsFromRedux.Agent.record_data.data.lead_filter_name,
        filtercomment:
          nextPropsFromRedux.Agent.record_data.data.lead_filter_comments,
        filtersql: nextPropsFromRedux.Agent.record_data.data.lead_filter_sql
      });
    }
    this.setState({
      alertTitle: nextPropsFromRedux.Agent.alertMessageTitle,
      showAlert: nextPropsFromRedux.Agent.showMessage,
      alertContent: nextPropsFromRedux.Agent.alertMessage,
      is_change: false
    });

    if (
      nextPropsFromRedux.Agent.alertMessageTitle &&
      this.state.alertTitle !== "Error"
    ) {
      //   return this.props.history.push('edit/'+this.state.shiftId);
    } //
  }

  handleShowAlert = flag => {
    this.setState({ showAlert: flag });
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value, is_change: true });
  };

  logMouseEnter = e => {
    if (e.target.getAttribute("data-info")) {
      this.setState({ showinfo: e.target.getAttribute("data-info") }),
        this.setState({ showinfotitle: e.target.getAttribute("data-title") });
    }
  };

  logMouseLeave = e => {
    if (e) {
    }
  };

  onCancelAlert = () => {
    this.setState({ showAlert: false });
  };

  handleSubmit = () => {
    let lead_filter_id = this.state.filterId;
    let lead_filter_name = this.state.filtername;
    let lead_filter_comments = this.state.filtercomment;
    let lead_filter_sql = this.state.filtersql;

    let type = this.state.pageTitle == "add" ? "add" : "edit";
    let error = false;

    lead_filter_id == ""
      ? (this.setState({ filterIdError: true }), (error = true))
      : this.setState({ filterIdError: false });
    lead_filter_name == ""
      ? (this.setState({ filternameError: true }), (error = true))
      : this.setState({ filternameError: false });
    lead_filter_comments == ""
      ? (this.setState({ filtercommnetError: true }), (error = true))
      : this.setState({ filtercommnetError: false });
    //lead_filter_sql   =='' ? (this.setState({filtersqlError: true}) ,error=true) :this.setState({filtersqlError: false})

    if (!error) {
      let postData = {
        lead_filter_id: lead_filter_id,
        lead_filter_name: lead_filter_name,
        lead_filter_comments: lead_filter_comments,
        lead_filter_sql: lead_filter_sql
      };
      console.log(postData);
      this.props.addfilterlist(postData);

      /*      this.props.updateRecord(postData);
             console.log(postData)
            let _this=this;*/
    }
  };

  render() {
    const {
      showAlert,
      alertTitle,
      alertContent,
      pageTitle,
      pageError,
      filterId,
      filtername,
      filtercomment,
      filtersql,
      filterIdError,
      filtercommnetError,
      filternameError,
      filtersqlError
    } = this.state;

    console.log(JSON.stringify(this.state.week_checked));

    if (pageTitle == "edit" && pageError) {
      return (
        <div>
          <ContainerHeader
            match={this.props.match}
            title={pageTitle + " agent"}
          />

          <Alert className="shadow-lg" color="danger">
            <h3 className="alert-heading">Agent Not Found</h3>
            <p>We can not locate your Agent, please check your id.</p>
          </Alert>
        </div>
      );
    } else {
      return (
        <div>
          <ContainerHeader
            match={this.props.match}
            title={pageTitle + " Lead Filter"}
            style={{ marginBottom: "8px" }}
          />
          {this.state.is_change ? (
            <div className="col-lg-12" style={{ padding: "0px" }}>
              <div
                className="jr-card "
                style={{
                  padding: "2px",
                  textAlign: "right",
                  marginBottom: "14px"
                }}
              >
                <div className="jr-card-body ">
                  <div className="cardPanel teal">
                    <span className="whiteText">
                      <Button
                        color="primary"
                        className="jr-btn bg-success text-white"
                        style={{ marginBottom: "4px", marginRight: "26px" }}
                        onClick={this.handleSubmit}
                      >
                        <span> {pageTitle == "add" ? "Add" : "Update"} </span>
                      </Button>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
          <SweetAlert
            show={showAlert}
            success={alertTitle === "Success" ? true : false}
            error={alertTitle === "Error" ? true : false}
            title={alertTitle}
            onConfirm={this.onCancelAlert}
            onCancel={this.onCancelAlert}
          >
            {" "}
            {alertContent}{" "}
          </SweetAlert>
          <div className="row">
            <CardBox styleName="col-lg-8">
              <form className="row" noValidate autoComplete="off">
                <div
                  className="col-md-6 col-6"
                  data-info="Your agent's login.This field is where you put the Agent ID number, can be up to 8 digits in length, Must be at least 2 characters in length."
                  data-title="Shift ID"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="filterlist-filterId-id"
                    onChange={this.handleChange("filterId")}
                    label="Filter ID *"
                    value={filterId}
                    disabled={pageTitle == "add" ? false : true}
                    margin="normal"
                    error={filterIdError}
                    fullWidth
                  />
                </div>

                <div
                  className="col-md-12 col-6"
                  data-info="The password agent uses to login to Ytel.This field is where you put the users password. Must be at least 2 characters in length. A strong user password should be at least 8 characters in length and have lower case and upper case letters as well as at least one number."
                  data-title="Password"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="filter-filter-name"
                    label="Filter Name *"
                    margin="normal"
                    fullWidth
                    value={filtername}
                    onChange={this.handleChange("filtername")}
                    error={filternameError}
                  />
                </div>
                <div
                  className="col-md-12 col-6"
                  data-info="The password agent uses to login to Ytel.This field is where you put the users password. Must be at least 2 characters in length. A strong user password should be at least 8 characters in length and have lower case and upper case letters as well as at least one number."
                  data-title="Password"
                  onMouseEnter={this.logMouseEnter}
                  onMouseLeave={this.logMouseLeave}
                >
                  <TextField
                    id="filter-filter-comment"
                    label="Filter Comment *"
                    margin="normal"
                    fullWidth
                    value={filtercomment}
                    onChange={this.handleChange("filtercomment")}
                    error={filtercommnetError}
                  />
                </div>
                <div className="col-md-12">
                  <div className="form-group">
                    <div className="form-group">
                      <label>Filter SQL</label>
                      <textarea
                        id="lead_filter_sql"
                        className="form-control"
                        name="lead_filter_sql"
                        rows="10"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        value={filtersql}
                        style={{
                          marginRight: "0",
                          width: "100%",
                          maxWidth: "none"
                        }}
                      />
                      <div id="builder-import_export" />
                      <button
                        type="button"
                        className="btn-primary"
                        id="btn-get-sql"
                      >
                        Generate SQL
                      </button>

                      <div className="hide help">
                        <h3>Filter SQL</h3>
                        <hr />
                        <div>
                          This is where you place the SQL query fragment that
                          you want to filter by. do not begin or end with an
                          AND, that will be added by the hopper cron script
                          automatically.
                        </div>
                      </div>
                    </div>
                    <Demo />
                  </div>
                </div>
              </form>
            </CardBox>
            <div className="col-lg-4" style={{ display: "grid" }}>
              <div className="jr-card ">
                <div className="jr-card-body ">
                  <div className="col-md-12 col-12 mt-12">
                    <div>
                      <div className="card-body" style={{ padding: "0px" }}>
                        <h3 style={{ padding: "3px", fontSize: "23px" }}>
                          {this.state.showinfotitle != ""
                            ? this.state.showinfotitle
                            : "title"}
                        </h3>
                        <hr />
                        <p className="card-text">{this.state.showinfo} </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {this.props.Agent.isLoading && (
              <div
                className="loader-view"
                style={{
                  left: "0",
                  bottom: "0",
                  right: "0",
                  top: "0",
                  position: "fixed"
                }}
              >
                <CircularProgress />
              </div>
            )}
          </div>
        </div>
      );
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    Agent: state.admin_utilites
  };
}

const mapDispatchToProps = {
  addfilterlist,
  fetchfilterlist
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Edit);
