import React, { Component } from "react";
import { UncontrolledAlert, Alert } from "reactstrap";
import SweetAlert from "react-bootstrap-sweetalert";
import Paper from "@material-ui/core/Paper";
import Switch from "@material-ui/core/Switch";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import ContainerHeader from "../../../../../../../components/ContainerHeader/index";
import CardBox from "../../../../../../../components/CardBox/index";
import CustomPicker from "../../../../../../../components/pickers/routes/Color/customPicker";
import IntlMessages from "../../../../../../../util/IntlMessages";
import ButtonNav from "../../../../../../../components/navButton/";
import { createNotification } from "../../../../../../../Helpers";
import {
  scriptTextFieldsPrefix,
  scriptTextFieldsPostfix,
  listMixMethod,
  campaignList
} from "./data";
import axios from "axios";

class addCampaignListMix extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pageTitle: this.props.location.pathname.split("/")[4],
      pageTitleName: this.props.location.pathname.split("/")[5],
      scriptId:
        this.props.location.pathname.split("/")[4] == "add"
          ? ""
          : this.props.location.pathname.split("/").pop(),
      pageError: false,
      scriptField: "",
      groupName: "",
      lists: [],
      scriptComment: "",
      scriptActive: true,
      scriptActiveValue: "Y",
      scriptText: "",
      scriptTextSelectionStart: 0,
      showAlert: false,
      alertContent: "",
      alertTitle: "",
      showConfirm: false,
      showinfo: "",
      infoMsg: "",
      scriptTextFields: [],
      is_change: false,
      mix_id: "",
      mix_name: "",
      mix_status: "",
      mix_method: "",
      mix_list: "",
      mix_idError: false
    };
    this.handleHover = this.handleHover.bind(this);
  }

  componentDidMount() {
    this.getBascList();
  }

  getBascList = id => {
    this.setState({ isLoading: true });
    axios
      .get(
        "/api/campaign-mix-options-lists?campaign_id=" +
          this.state.pageTitleName
      )
      .then(response => {
        this.setState({
          scriptTextFields: response.data.data.dial_status,
          lists: response.data.data.lists
        });
        this.setState({ isLoading: false });
      })
      .catch(function(error) {
        console.log(error);
      });
  };
  handleHover() {
    this.setState({
      isHovered: !this.state.isHovered
    });
  }

  handleShowAlert = flag => {
    this.setState({
      showAlert: flag
    });
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
      is_change: true
    });
  };

  handleScriptTextClick = event => {
    this.setState({ scriptTextSelectionStart: event.target.selectionStart });
  };

  logMouseEnter = id => {
    console.log("click");
  };
  logMouseLeave = id => {
    console.log("&nbsp;&nbsp;&nbsp;onMouseLeave (react)" + id);
  };
  logNativeMouseLeave = () => {
    console.log("&nbsp;&nbsp;&nbsp;mouseleave (native)");
  };
  clearLog = () => {
    console.log();
  };

  handleActiveChange = (event, checked) => {
    this.setState({ scriptActive: checked });
    this.setState({ scriptActiveValue: checked ? "Y" : "N" });
  };

  handleSubmit = () => {
    let error = false;

    if (this.state.mix_id == "") {
      this.setState({ mix_idError: true });
      error = true;
    } else {
      this.setState({ mix_idError: false });
    }

    if (!error) {
      let postData = {
        vcl_id: this.state.mix_id,
        vcl_name: this.state.mix_name,
        status: this.state.mix_status,
        mix_method: this.state.mix_method,
        campaign_id: this.state.pageTitleName
      };

      let _this = this;
      axios
        .post("/api/add-campaign-mix-lists/", postData)
        .then(response => {
          createNotification("Success", "Success", "Record Added Sucessfully");

          setTimeout(function() {
            _this.props.history.push("/app/campaigns/campaign-list-mix/list");
          }, 1000);
        })
        .catch(function(error) {
          createNotification("Error", "Error", error.response.data.message);
        });
    }
  };

  render() {
    const {
      pageTitle,
      pageTitleName,
      pageError,
      showAlert,
      alertContent,
      scriptTextFields,
      alertTitle,
      scriptId,
      scriptName,
      campaignId,
      scriptIdError,
      scriptNameError,
      is_change,
      mix_id,
      mix_name,
      mix_status,
      mix_method,
      mix_list,
      mix_idError,
      lists
    } = this.state;
    const btnClass = this.state.isHovered ? "pulse animated" : "";

    return (
      <div>
        <ContainerHeader
          match={this.props.match}
          title={"Campaign List Mix:" + pageTitleName}
        />
        {this.state.is_change && <ButtonNav click={this.handleSubmit} />}
        <div className="row">
          <SweetAlert
            show={showAlert}
            success={alertTitle === "Success" ? true : false}
            error={alertTitle === "Error" ? true : false}
            title={alertTitle}
            onConfirm={() => this.handleShowAlert(false)}
            onCancel={() => this.handleShowAlert(false)}
          >
            {alertContent}
          </SweetAlert>

          <CardBox
            styleName="col-lg-8    "
            heading={pageTitle == "add" ? pageTitleName : pageTitleName}
          >
            <form className="row" noValidate autoComplete="off">
              <div
                className="col-md-8 col-md-offset-4"
                onMouseEnter={this.logMouseEnter("groupName")}
                onMouseLeave={this.logMouseLeave("groupName")}
              >
                <TextField
                  id="script-id"
                  onChange={this.handleChange("mix_id")}
                  error={mix_idError}
                  label="List Mix ID(Required) *"
                  value={campaignId}
                  margin="normal"
                  fullWidth
                />
              </div>
              <div
                className="col-md-8 col-md-offset-4"
                onMouseEnter={this.handleHover}
                onMouseLeave={this.handleHover}
              >
                <TextField
                  id="Group-Name"
                  label="List Mix Name(Required) *"
                  value={mix_name}
                  onChange={this.handleChange("mix_name")}
                  margin="normal"
                  fullWidth
                  error={scriptNameError}
                />
              </div>

              <div className="col-md-8 col-md-offset-4">
                <TextField
                  id="script-fields"
                  select
                  label="Select List Mix Method"
                  value={mix_method}
                  onChange={this.handleChange("mix_method")}
                  SelectProps={{}}
                  margin="normal"
                  fullWidth
                >
                  {listMixMethod.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              <div className="col-md-8 col-md-offset-4">
                <TextField
                  id="script-fields"
                  select
                  label="Select Dial Status"
                  value={mix_status}
                  onChange={this.handleChange("mix_status")}
                  SelectProps={{}}
                  margin="normal"
                  fullWidth
                >
                  {scriptTextFields &&
                    scriptTextFields.map(option => (
                      <MenuItem key={option.status} value={option.status}>
                        {option.option_title}
                      </MenuItem>
                    ))}
                </TextField>
              </div>

              <div className="col-md-8 col-md-offset-4">
                <TextField
                  id="script-fields"
                  select
                  label="List"
                  value={mix_list}
                  onChange={this.handleChange("mix_list")}
                  SelectProps={{}}
                  margin="normal"
                  fullWidth
                >
                  {lists &&
                    lists.map(option => (
                      <MenuItem key={option.list_id} value={option.list_id}>
                        {option.list_name}
                      </MenuItem>
                    ))}
                </TextField>
              </div>

              <div className="col-md-8 col-md-offset-4">
                <TextField
                  id="script-id"
                  onChange={this.handleChange("scriptId")}
                  error={scriptIdError}
                  label="Campaign Id *"
                  value={pageTitleName}
                  disabled={true}
                  margin="normal"
                  fullWidth
                />
              </div>

              <div className="col-md-12 col-12">
                <br /> <br />
              </div>
            </form>
          </CardBox>
          <div className="col-lg-4" style={{ display: "grid" }}>
            <div className="jr-card ">
              <div className="jr-card-body ">
                <div className="col-md-12 col-12 mt-12">
                  <div>
                    <div className="card-body">
                      <h3 className="card-title">Card Title</h3>
                      <p className="card-text">
                        Many desktop publishing packages and web page editors
                        now use Lorem Ipsum as their default model text, and a
                        search for 'lorem ipsum' will uncover many web sites
                        still in their infancy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default addCampaignListMix;
