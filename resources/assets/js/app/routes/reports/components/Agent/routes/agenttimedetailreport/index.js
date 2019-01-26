import React from "react";
import { connect } from "react-redux";
import { cloneElement, Component } from "react";
import "react-day-picker/lib/style.css";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import ContainerHeader from "../../../../../../../components/ContainerHeader/index";
import CardBox from "../../../../../../../components/CardBox/index";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import moment from "moment";
import momentTimezone from "moment-timezone";
import Button from "@material-ui/core/Button";
import { formatDate, parseDate } from "react-day-picker/moment";
import UserGroupMultipeDropdown from "../../../common/UserGroupMultipeDropdown";
import MultipeDropdownCampaigns from "../../../common/MultipeDropdownCampaigns";
import Dropdown from "../../../common/Dropdown";
import DateRange from "../../../common/DateRange";
import { dateValidation } from "../../../common/DateDiff";
import CircularProgress from "@material-ui/core/CircularProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import Helmet from "react-helmet";
import CsvDownload from "../../../../../../../components/common/CsvDownload";

const SHIFT = ["ALL", "AM", "PM"];
const DISPLAYAS = ["TEXT"];

function generate(element) {
  return [0, 1, 2].map(value =>
    cloneElement(element, {
      key: value
    })
  );
}

class AgentTimeDetailReport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      from: momentTimezone.tz(moment(new Date()), "America/Los_Angeles").format("YYYY-MM-DD"),
      to: momentTimezone.tz(moment(new Date()), "America/Los_Angeles").format("YYYY-MM-DD"),
      parksholds: false,
      shift: "ALL",
      displayAs: "TEXT",
      tableshow: false,
      userGroups: ["-ALL-"],
      UserGroupList: [],
      campaignsGroups: ["-ALL-"],
      campaignList: [],
      mydata: [],
      total_data: [],
      requestType: "api",
      isLoading: false,
      timeval: false,
    };

  }

  setSelectOptions = (name, value) => {
    this.setState({
      [name]: value
    });

    console.log(this.state.campaignsGroups);
  };

  handleFromChange = fromDate => {
    this.setState({ from: moment(fromDate).format("YYYY-MM-DD") });
  };

  handleToChange = toDate => {
    this.setState({ to: moment(toDate).format("YYYY-MM-DD") });
  };

  handleChangeParksHolds = name => (event, checked) => {
    this.setState({ [name]: checked });
  };
  

  componentDidMount() 
    {      
        this.setState({isLoading:true});
        const {UserGroupList, campaignList} = this.state;
        var token = localStorage.getItem("access_token");
        
        const requestOptions = {headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+token ,}};
         
        axios.get('api/agent_campaign_option_list/',requestOptions).then(response=>{  
            this.setState({
                campaignList: response.data.data,
            })
            axios.get('api/agent_user_group_option_list/',requestOptions).then(response=>{  
                this.setState({
                    UserGroupList: response.data.data,
                    isLoading: false
                })
                this.handleSubmit();
            }).catch(error =>{
                console.log(error);
            })
            
            
        }).catch(error =>{
            console.log(error);
        })
    }

  handleSubmit = () => {
    let local_db = JSON.parse(localStorage.getItem("selected_db"));
    let url_address = local_db.application_dns;

    const { from, to, UserGroupList, campaignList, userGroups, campaignsGroups, shift, parksholds} = this.state;

    const UGL = UserGroupList.map((item, i) => item.user_group).filter(Boolean); //Add .filter(Boolean) if remove "" value from array
    const CL = campaignList.map((item, i) => item.campaign_id).filter(Boolean);

    var auth_token = localStorage.getItem("access_token");

    this.setState({ isLoading: true, });

    const date = moment(new Date()).format("YYYY-MM-DD");

    if (dateValidation(from, to, date, 2) == false) {
      this.setState({
        isLoading: false,
        timeval: true
      });
    } else {
      axios
        .post(
          "api/agent_time_detail/",
          {
            start_date: from,
            end_date: to,
            group:
            campaignsGroups.indexOf("-ALL-") == -1 ? campaignsGroups : CL,
            user_group: userGroups.indexOf("-ALL-") == -1 ? userGroups : UGL,
            shift: shift,
            reportdisplaytype: "",
            show_parks: parksholds,
            request_type: "api",
            url_address: url_address
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + auth_token
            }
          }
        )
        .then(response => {
          this.setState({
            mydata: response.data,
            total_data: response.data.total_data,
            tableshow: true,
            isLoading: false,
            timeval: false
          });
          console.log(this.state.mydata);
        })
        .catch(error => {
          console.log(error);
          this.setState({
            isLoading: false,
          });
        });
    }
  };

  render() {
    const {camploads, UserGroupList, userGroups, campaignList, campaignsGroups, shift, displayAs, from, to, tableshow, mydata, total_data, isLoading, timeval} = this.state;
    return (
      <div>
        <Helmet>
          <title>AgentTimeDetailReport | Ytel</title>
        </Helmet>
        <ContainerHeader
          match={this.props.match}
          title="Server Stats and Reports"
        />
        <div className="row">
          <CardBox styleName="col-lg-12" heading="Agent Time Detail Report">
            <form className="row" autoComplete="off">
              <div className="col-lg-6 col-sm-6 col-12">
                <FormControl className="w-100 mb-2">
                  <UserGroupMultipeDropdown
                    label={"User Groups"}
                    options={UserGroupList}
                    onChange={this.setSelectOptions}
                    name={"userGroups"}
                    default={"-ALL-"}
                    selectedValue={userGroups}
                  />
                </FormControl>
              </div>

              <div className="col-lg-6 col-sm-6 col-12">
                <FormControl className="w-100 mb-2">
                  <MultipeDropdownCampaigns
                    label={"Campaigns Groups"}
                    options={campaignList}
                    onChange={this.setSelectOptions}
                    name={"campaignsGroups"}
                    default={"-ALL-"}
                    selectedValue={campaignsGroups}
                  />
                </FormControl>
              </div>
              <div>
                {" "}
                <br />
                <br /> <br />
                <br />
                <br />{" "}
              </div>
              <div className="col-lg-6 col-sm-6 col-12">
                <FormControl className="w-100 mb-2">
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="primary"
                        checked={this.state.parksholds}
                        onChange={this.handleChangeParksHolds("parksholds")}
                        value="parksholds"
                      />
                    }
                    label="Show parks-holds"
                  />
                </FormControl>
              </div>

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
                    {timeval ? (
                      <p style={{ color: "red" }}>
                        The date range for this report is limited to 60 days
                        from today.
                      </p>
                    ) : (
                      <p>
                        The date range for this report is limited to 60 days
                        from today.
                      </p>
                    )}
                  </div>
                </FormControl>
              </div>

              <div className="col-lg-6 col-sm-6 col-12">
                <FormControl className="w-100 mb-2">
                  <Dropdown
                    label={"Shift"}
                    onChange={this.setSelectOptions}
                    name={"shift"}
                    selectedValue={shift}
                    data={SHIFT}
                  />
                </FormControl>
              </div>

              <div className="col-lg-6 col-sm-6 col-12">
                <FormControl className="w-100 mb-2">
                  <Dropdown
                    label={"Display As"}
                    onChange={this.setSelectOptions}
                    name={"displayAs"}
                    selectedValue={displayAs}
                    data={DISPLAYAS}
                  />
                </FormControl>
              </div>
              <div className="col-lg-12">
                <Button
                  variant="raised"
                  onClick={this.handleSubmit}
                  className="jr-btn bg-green text-white"
                >
                  Submit
                </Button>
               
                <CsvDownload filename="agentTimeDetailReport.csv" headerdata = 'Inbound Daily Report : 2018-10-13 01:20:35 , Time Range 43 days-2018-09-01 00:00:00 to 2018-10-13 23:59:59, DAILY RPT -2018-09-01 00:00:00 to 2018-10-13 23:59:59'/>
              </div>
            </form>
            {isLoading && (
              <Dialog open={this.state.isLoading} onClose={this.handleRequestClose}>
                <DialogContent>
                  <div className="loader-view">
                    <CircularProgress />
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardBox>

          {tableshow == true ? (
            <CardBox styleName="col-12" cardStyle="p-0">
              <div className="table-responsive-material">
                <Table>
                  <TableHead>
                    {mydata.data.slice(0, 1).map((item, i) => (
                      <TableRow key={i}>
                        {item.map((n, j) => (
                          <TableCell key={j}>{n}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableHead>
                  <TableBody>
                    {mydata.data.slice(1).map((item, i) => (
                      <TableRow key={i}>
                        {item.map((n, j) => (
                          <TableCell key={j}>{n}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardBox>
          ) : (
            ""
          )}
        </div>
      </div>
    );
  }
}

export default AgentTimeDetailReport;
