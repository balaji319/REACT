import React from "react";
import ContainerHeader from "../../../../../../../components/ContainerHeader/index";
import CardBox from "../../../../../../../components/CardBox/index";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import Select from "@material-ui/core/Select";
import Button from "@material-ui/core/Button";
import "react-day-picker/lib/style.css";
import { formatDate, parseDate } from "react-day-picker/moment";
import Switch from "@material-ui/core/Switch";
import { DATA, AGENT_SCRIPT, TIME_ZONE } from "./data";
import Dropdown from "../../../comman/Dropdown";
import TextFields from "../../../comman/TextFields";
import moment from "moment";
import { DatePicker } from "material-ui-pickers";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Divider from "@material-ui/core/Divider";

import AUDIO_MANAGER from "./audio_manager";

class Edit extends React.Component {
  constructor(props) {
    super(props);
    var ts = new Date();
    this.state = {
      list_id: this.props.location.pathname.split("/").pop(),
      list_name: "",
      list_desc: "",
      campaign: "",
      active: "N",
      campaigns: DATA,
      reset_lead_status: false,
      reset_time: "",
      expiration_date: moment(new Date()).format("YYYY-MM-DD"),
      audit_comments: "",
      list_change_date: moment(new Date()).format("YYYY-MM-DD"),
      list_last_call_date: moment(new Date()).format("YYYY-MM-DD"),
      agent_script_override: "",
      campaign_cid: "",
      answering_machine_msg: "",
      drop_inbound_group: "",
      web_push_pop: "",
      web_push_pop2: "",
      transfer_conf_no1: "",
      transfer_conf_no2: "",
      transfer_conf_no3: "",
      transfer_conf_no4: "",
      transfer_conf_no5: "",
      inventory_report: false,
      time_zone: "",
      audio_dialog: false
    };
  }

  handleChange = (name, value) => {
    this.setState({
      [name]: value
    });
    console.log(this.state);
  };

  handleSubmit = () => {
    const { list_id, list_name, list_desc, campaign, active } = this.state;
    const data = {
      listId: list_id,
      listName: list_name,
      listDesc: list_desc,
      campaigns: campaign
    };
    console.log(data);
  };

  statusChangeHandler = (event, data) => {
    var let_this = this;
    this.setState({
      active: event.target.value
    });
  };

  handleDateChange = date => {
    this.setState({ expiration_date: moment(date).format("YYYY-MM-DD") });
  };
  handleListChangeDate = date => {
    this.setState({ list_change_date: moment(date).format("YYYY-MM-DD") });
  };
  handleListLastCallDate = date => {
    this.setState({ list_last_call_date: moment(date).format("YYYY-MM-DD") });
  };

  handledOpenAudioManagerDialog = () => {
    this.setState({ audio_dialog: !this.state.audio_dialog });
  };

  render() {
    const {
      list_id,
      list_name,
      list_desc,
      campaign,
      active,
      campaigns,
      reset_lead_status,
      reset_time,
      expiration_date,
      audit_comments,
      list_change_date,
      list_last_call_date,
      agent_script_override,
      campaign_cid,
      answering_machine_msg,
      drop_inbound_group,
      web_push_pop,
      web_push_pop2,
      transfer_conf_no1,
      transfer_conf_no2,
      transfer_conf_no3,
      transfer_conf_no4,
      transfer_conf_no5,
      inventory_report,
      time_zone,
      audio_dialog
    } = this.state;
    return (
      <div>
        <ContainerHeader match={this.props.match} title={"List : " + list_id} />

        <Dialog
          maxWidth="md"
          fullWidth={true}
          open={audio_dialog}
          onClose={this.handleRequestClose}
        >
          <DialogTitle>Audio Manager</DialogTitle>
          <Divider />
          <DialogContent>
            <AUDIO_MANAGER />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.handledOpenAudioManagerDialog}
              color="secondary"
              className="jr-btn bg-grey text-white"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <div className="row">
          <CardBox styleName="col-lg-12" heading={""}>
            <form className="row" autoComplete="off">
              <div className="col-lg-6 col-sm-6 col-12">
                <FormControl className="w-100 mb-2">
                  <label htmlFor="">List ID</label>
                  <label htmlFor="">
                    <b>{list_id}</b>
                  </label>
                </FormControl>

                <TextFields
                  id={"list_name"}
                  label={"List Name (Required)"}
                  value={list_name}
                  name={"list_name"}
                  onChange={this.handleChange}
                />

                <TextFields
                  id={"list_desc"}
                  label={"List Description"}
                  value={list_desc}
                  name={"list_desc"}
                  onChange={this.handleChange}
                />

                <Dropdown
                  label={"Campaign"}
                  name={"campaign"}
                  selectedValue={campaign}
                  data={campaigns}
                  onChange={this.handleChange}
                />

                <FormControl className="w-100 mb-2">
                  <label htmlFor="age-simple">Active</label>
                  <Switch
                    value={`${active}`}
                    onChange={this.statusChangeHandler}
                    defaultChecked={active == "Y"}
                    ref={active}
                    color="primary"
                  />
                </FormControl>

                <FormControl className="w-100 mb-2">
                  <label htmlFor="age-simple">
                    Reset Lead-Called-Status for this list
                  </label>
                  <Switch
                    value={`${reset_lead_status}`}
                    onChange={this.statusChangeHandler}
                    defaultChecked={active == "Y"}
                    ref={active}
                    color="primary"
                  />
                </FormControl>

                <TextFields
                  id={"reset_time"}
                  label={"Reset Times"}
                  value={reset_time}
                  name={"reset_time"}
                  onChange={this.handleChange}
                />

                <FormControl className="w-100 mb-2">
                  <FormHelperText>Expiration Date</FormHelperText>
                  <DatePicker
                    fullWidth
                    value={expiration_date}
                    format="YYYY-MM-DD"
                    onChange={this.handleDateChange}
                    animateYearScrolling={false}
                    leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                    rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                  />
                </FormControl>

                <FormControl className="w-100 mb-2">
                  <label>Audit Comments</label>
                  <Switch
                    value={`${audit_comments}`}
                    onChange={this.statusChangeHandler}
                    defaultChecked={audit_comments == "Y"}
                    ref={audit_comments}
                    color="primary"
                  />
                </FormControl>

                <FormControl className="w-100 mb-2">
                  <FormHelperText>List Change Date</FormHelperText>
                  <DatePicker
                    fullWidth
                    value={list_change_date}
                    format="YYYY-MM-DD"
                    onChange={this.handleListChangeDate}
                    animateYearScrolling={false}
                    leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                    rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                  />
                </FormControl>

                <FormControl className="w-100 mb-2">
                  <FormHelperText>List Change Date</FormHelperText>
                  <DatePicker
                    fullWidth
                    value={list_last_call_date}
                    format="YYYY-MM-DD"
                    onChange={this.handleListLastCallDate}
                    animateYearScrolling={false}
                    leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                    rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                  />
                </FormControl>

                <Dropdown
                  label={"Agent Script Oberride"}
                  name={"agent_script_override"}
                  selectedValue={agent_script_override}
                  data={AGENT_SCRIPT}
                  onChange={this.handleChange}
                />

                <Dropdown
                  label={"Campaign CID Override"}
                  name={"campaign_cid"}
                  selectedValue={campaign_cid}
                  data={AGENT_SCRIPT}
                  onChange={this.handleChange}
                />

                <TextFields
                  id={"answering_machine_msg"}
                  label={"Answering Machine Message Override"}
                  value={answering_machine_msg}
                  name={"answering_machine_msg"}
                  onChange={this.handleChange}
                />
                <Button
                  color="primary"
                  className="jr-btn bg-primary text-white"
                  onClick={this.handledOpenAudioManagerDialog}
                >
                  Select/Manage Audio
                </Button>

                <Dropdown
                  label={"Drop Inbound Group Override"}
                  name={"drop_inbound_group"}
                  selectedValue={drop_inbound_group}
                  data={AGENT_SCRIPT}
                  onChange={this.handleChange}
                />

                <TextFields
                  id={"web_push_pop"}
                  label={"Web Pop/Push Override"}
                  value={web_push_pop}
                  name={"web_push_pop"}
                  onChange={this.handleChange}
                />

                <TextFields
                  id={"web_push_pop2"}
                  label={"Web Pop/Push2    Override"}
                  value={web_push_pop2}
                  name={"web_push_pop"}
                  onChange={this.handleChange}
                />

                <TextFields
                  id={"transfer_conf_no1"}
                  label={"Transfer-Conf Number 1 Override"}
                  value={transfer_conf_no1}
                  name={"transfer_conf_no1"}
                  onChange={this.handleChange}
                />

                <TextFields
                  id={"transfer_conf_no2"}
                  label={"Transfer-Conf Number 2 Override"}
                  value={transfer_conf_no2}
                  name={"transfer_conf_no2"}
                  onChange={this.handleChange}
                />

                <TextFields
                  id={"transfer_conf_no3"}
                  label={"Transfer-Conf Number 3 Override"}
                  value={transfer_conf_no3}
                  name={"transfer_conf_no3"}
                  onChange={this.handleChange}
                />

                <TextFields
                  id={"transfer_conf_no4"}
                  label={"Transfer-Conf Number 4 Override"}
                  value={transfer_conf_no4}
                  name={"transfer_conf_no4"}
                  onChange={this.handleChange}
                />

                <TextFields
                  id={"transfer_conf_no5"}
                  label={"Transfer-Conf Number 5 Override"}
                  value={transfer_conf_no5}
                  name={"transfer_conf_no5"}
                  onChange={this.handleChange}
                />

                <FormControl className="w-100 mb-2">
                  <label>Inventory Report</label>
                  <Switch
                    value={`${inventory_report}`}
                    onChange={this.statusChangeHandler}
                    defaultChecked={inventory_report == "Y"}
                    ref={inventory_report}
                    color="primary"
                  />
                </FormControl>

                <Dropdown
                  label={"Time Zone Setting"}
                  name={"time_zone"}
                  selectedValue={time_zone}
                  data={TIME_ZONE}
                  onChange={this.handleChange}
                />

                <Button
                  color="primary"
                  className="jr-btn bg-success text-white"
                  onClick={this.handleSubmit}
                >
                  Submit
                </Button>
              </div>
              <div className="col-lg-6 col-sm-6 col-12" />
            </form>
          </CardBox>
        </div>
      </div>
    );
  }
}

export default Edit;
