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
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
//import {MDCFormField} from '@material/form-field';
import { MDCRadio } from "@material/radio";

class Inbound extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      anchorOriginVertical: "",
      ajxaData: [],
      u_records: [],
      sucsess_msg: "",
      inprocess: false,
      error_msg: ""
    };
  }

  state = {};

  handleSubmit = () => {
    let closer_campaigns = this.state.ajxaData
      .filter(row => row.closer_campaigns == true)
      .map(option => option.group_id);
    let xfer_groups = this.state.ajxaData
      .filter(row => row.xfer_groups == true)
      .map(option => option.group_id);
    let $this = this;

    this.setState({ isLoading: true });
    let formData = {
      campaign_id: this.props.id,
      default_xfer_group: this.state.anchorOriginVertical,
      closer_campaigns: closer_campaigns,
      xfer_groups: xfer_groups
    };
    axios
      .put("api/campaign-inbound-update", formData)
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

  /* handleNext = () => {
        let activeStep;

        let isError = false;
        this.state.list_id =='' ? (this.setState({listError:true }),isError =true) :this.setState({listError:false });

        this.state.source_agent_group=='' ? (this.setState({selectListError:true }),isError =true) : this.setState({selectListError:false });

        if(!isError){

            if (this.isLastStep() && !this.allStepsCompleted()) {
                const steps = getSteps();
                activeStep = steps.findIndex((step, i) => !(i in this.state.completed));
            } else {
                activeStep = this.state.activeStep + 1;
            }
            this.setState({
                activeStep,
            });
        }
    };*/

  componentWillReceiveProps(nextPropsFromRedux) {}

  handleChange = name => event => {
    {
      this.setState({ [name]: event.target.value });
    }
  };

  handleChangeValue(index, dataType, value, data) {
    let this_ = this;
    var datata = this_.state.u_records;
    var array_data = [];
    const newState = this.state.ajxaData.map((item, i) => {
      if (i == index) {
        array_data = datata.filter(row => row.group_id != item.group_id);
        array_data.push({ ...item, [dataType]: value });
        return { ...item, [dataType]: value };
      }
      return item;
    });
    // console.log(u_records);
    this.setState({ ajxaData: newState, u_records: array_data });
  }

  componentDidMount() {
    this.getAllData();
  }

  getAllData = id => {
    this.setState({ isLoading: true });
    axios
      .get("/api/campaign-inbound?campaign_id=" + this.props.id)
      .then(response => {
        console.log(response);

        this.setState({
          ajxaData: response.data.data.inbound_list,
          isLoading: false,
          anchorOriginVertical: response.data.data.default_xfer_group
        });
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  render() {
    //const steps = getSteps();
    const {
      ajxaData,
      anchorOriginVertical,
      error_msg,
      sucsess_msg
    } = this.state;

    console.log("*********** selected Inbound boxes ********************");
    console.log(anchorOriginVertical);
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
            <thead>
              <tr>
                <th scope="col">Inbound Queues</th>
                <th scope="col">Name</th>
                <th scope="col">Default Transfer Group</th>
                <th scope="col">Allowed Inbound Queues</th>
                <th scope="col">Allowed Transfer Queues</th>
              </tr>
            </thead>
            <tbody>
              {this.state.ajxaData.map((data, index) => {
                return (
                  <tr key={index}>
                    <td>{data.group_id}</td>
                    <td>{data.group_name}</td>
                    <td>
                      <RadioGroup
                        aria-label="inboundName"
                        name={data.group_id}
                        value={anchorOriginVertical}
                        onChange={this.handleChange("anchorOriginVertical")}
                      >
                        <FormControlLabel
                          value={data.group_id}
                          control={<Radio />}
                        />
                      </RadioGroup>
                    </td>
                    <td>
                      <Checkbox
                        color="primary"
                        onChange={e =>
                          this.handleChangeValue(
                            index,
                            "closer_campaigns",
                            e.target.checked
                          )
                        }
                        checked={this.state.ajxaData[index].closer_campaigns}
                      />
                    </td>
                    <td>
                      <Checkbox
                        color="primary"
                        onChange={e =>
                          this.handleChangeValue(
                            index,
                            "xfer_groups",
                            e.target.checked
                          )
                        }
                        checked={this.state.ajxaData[index].xfer_groups}
                      />
                    </td>
                    <td style={{ textAlign: "center", fontSize: "18px" }}>
                      {data.label}
                    </td>
                  </tr>
                );
              })}
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
  )(Inbound)
);
