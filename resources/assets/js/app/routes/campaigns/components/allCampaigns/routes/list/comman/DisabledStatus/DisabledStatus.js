import { Checkbox } from "../../plugins";
import React from "react";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepButton from "@material-ui/core/StepButton";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import CardBox from "../../../../../../../../../components/CardBox/index";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import TextField from "@material-ui/core/TextField";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Input from "@material-ui/core/Input";
import { fetchGlobal } from "../../../../../../../../../actions/Global";
import TextError from "../../../../../../../../../components/common/TextError";
import axios from "axios";
import { connect } from "react-redux";
import { Route, withRouter } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";
import DATA from "./data";

class DisabledStatus extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      ajxaData: [],
      u_records: [],
      sucsess_msg: "",
      inprocess: false,
      error_msg: ""
    };
  }

  state = {};

  handleSubmit = () => {
    let array_data = this.state.ajxaData
      .filter(row => row.is_check == true)
      .map(option => option.status);
    let $this = this;

    this.setState({ isLoading: true });
    let formData = {
      campaign_id: this.props.id,
      dial_statuses: array_data
    };
    axios
      .put("api/campaign-disabled-statuses-update", formData)
      .then(response => {
        // createNotification("Success","Success",response.data.message)
        $this.setState({
          sucsess_msg: response.data.msg,
          isLoading: false
        });
      })
      .catch(function(error) {
        // createNotification("Error","Error","Somthing Went Wrong !!!!")
        this.setState({
          error_msg: "Somthing Went Wrong !!!!",
          isLoading: false
        });
      });
  };

  componentDidMount() {
    //console.log(this.props.id)
    this.getAllData();
  }

  getAllData = id => {
    this.setState({ isLoading: true });
    axios
      .get("/api/campaign-disabled-statuses?campaign_id=" + this.props.id)
      .then(response => {
        console.log(response);
        this.setState({ ajxaData: response.data.data, isLoading: false });
      })
      .catch(function(error) {
        this.setState({
          error_msg: "Somthing Went Wrong !!!!",
          isLoading: false
        });
      });
  };

  handleTextChange = name => event => {
    // this.setState({
    // [name]: event.target.value
  };

  handleChange(index, dataType, value, data) {
    let this_ = this;
    var datata = this_.state.u_records;
    var array_data = [];
    const newState = this.state.ajxaData.map((item, i) => {
      if (i == index) {
        array_data = datata.filter(row => row.status != item.status);
        array_data.push({ ...item, [dataType]: value });
        return { ...item, [dataType]: value };
      }
      return item;
    });

    this.setState({ ajxaData: newState, u_records: array_data });
  }

  render() {
    //const steps = getSteps();
    const { ajxaData, error_msg, sucsess_msg } = this.state;

    console.log("*********** selected check boxes ********************");
    console.log(ajxaData);
    return (
      <div>
        {error_msg &&
          sucsess_msg == "" && (
            <TextError Type="alert-danger" msg={error_msg} />
          )}
        {sucsess_msg != "" &&
          !error_msg && <TextError Type="alert-success" msg={sucsess_msg} />}
        <div style={{ height: "501px", overflowY: "scroll" }}>
          <table className="table table-hover">
            <tbody>
              {this.state.ajxaData.map((data, index) => {
                return (
                  <tr key={index}>
                    <td>
                      <Checkbox
                        color="primary"
                        onChange={e =>
                          this.handleChange(index, "is_check", e.target.checked)
                        }
                        checked={this.state.ajxaData[index].is_check}
                      />
                    </td>

                    <td style={{ textAlign: "center", fontSize: "18px" }}>
                      {data.options_title}
                    </td>
                  </tr>
                );
              })}
              {this.state.ajxaData.length == 0 && (
                <tr>
                  <td colSpan="11">
                    <center>No Records Found </center>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {this.state.isLoading && (
            <div className="loader-view" id="loader-view">
              <CircularProgress />
            </div>
          )}
        </div>
        <Button
          onClick={this.props.close}
          variant="raised"
          style={{ float: "right", marginLeft: "10px" }}
          className="jr-btn bg-grey text-white"
        >
          Close
        </Button>
        <Button
          onClick={this.handleSubmit}
          variant="raised"
          style={{ float: "right", marginLeft: "10px" }}
          className="jr-btn bg-green text-white"
        >
          Save Changes
        </Button>
      </div>
    );
  }
}
function mapStateToProps(state, ownProps) {
  return {
    Global: state.globel
  };
}

const mapDispatchToProps = {
  fetchGlobal
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(DisabledStatus)
);
