import {
  InfoCard,
  CardBox,
  Input,
  InputLabel,
  FormControl,
  Select
} from "./plugins";
import {
  React,
  connect,
  ContainerHeader,
  axios,
  Table,
  MenuItem,
  TableBody,
  TableCell,
  TableRow,
  Toolbar,
  Paper,
  Button,
  CircularProgress
} from "../../../../../../../../../components/plugins.js";
import { time } from "./time";
import { fetchGlobal } from "../../../../../../../../../actions/Global";
import { Route, withRouter } from "react-router-dom";
import DataTableHead from "./DataTableHead";

class List extends React.Component {
  state = {
    type: "ALL",
    pageTitle: this.props.location.pathname.split("/")[5],
    setTime: 10000,
    data: [],
    flag: false,
    isLoading: false,
    order: "asc",
    orderBy: "group_id",
    selected: [],
    data: [],
    page: 0,
    rowsPerPage: DEFAULT_PAGE_SIZE,
    showAlert: false,
    alertContent: "",
    alertTitle: "",
    showConfirm: false,
    alertTitle: "",
    search_value: "",
    openWizard: false,
    openClone: false,
    total: "",
    dialableStatus: false,
    inbound: false,
    selected_id: "",
    ajaxData: [],
    campaign_list: []
  };

  componentDidMount() {
    let pageTitle = this.state.pageTitle;
    this.setState({ source_campaign: pageTitle });
    this.props.fetchGlobal(["cam"]);
    //console.log(this.props.id)
    this.getAllData();
  }

  getAllData = id => {
    let _this = this;
    this.setState({ isLoading: true });
    let int_capmId = id ? id : this.state.pageTitle;
    axios
      .get("/api/campaign-hopper?campaign_id=" + int_capmId)
      .then(response => {
        console.log(response.data);
        _this.setState({ ajaxData: response.data.data, isLoading: false });
      })
      .catch(function(error) {
        _this.setState({
          error_msg: "Somthing Went Wrong !!!!",
          isLoading: false
        });
      });
  };

  handleChangeHandler = name => event => {
    this.setState({ [name]: event.target.value, showAlert: false });
  };
  onSearchChange = name => e => {
    this.setState({ showAlert: false });
    let rowsPerPage = this.state.rowsPerPage;
    this.props.fetchAllCampaignData(0, rowsPerPage, this.state.search_value);
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  filterCamp = event => {
    let source_campaign = this.state.source_campaign;
    this.getAllData(source_campaign);
  };
  editcam = event => {
    let source_campaign = this.state.source_campaign;
    if(source_campaign!=""){
      this.props.history.push("/app/campaigns/allCampaigns/edit/" + id);
    }

    //this.getAllData(source_campaign);
  };

  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      campaign_list: nextPropsFromRedux.Global.campaigns
        ? nextPropsFromRedux.Global.campaigns
        : ""
    });
  }

  render() {
    const {
      order,
      ajaxData,
      total,
      search_value,
      orderBy,
      source_campaign,
      campaign_list,
      data,
      isLoading
    } = this.state;

    console.log("++++++++++++");
    console.log(ajaxData);
    return (
      <div>
        <ContainerHeader
          match={this.props.match}
          title="Campaigns Live Hopper Listing"
        />
        <div className="row">
          <CardBox styleName="col-lg-12" heading="">
            <form className="row" autoComplete="off">
              <div className="col-lg-3 col-sm-6 col-12">
                <FormControl className="w-100 mb-2">
                  <InputLabel htmlFor="age-simple" />
                  <Select
                    value={source_campaign}
                    onChange={this.handleChange("source_campaign")}
                    input={<Input id="age-simple" />}
                  >
                    {campaign_list &&
                      campaign_list.map(option => (
                        <MenuItem
                          key={option.campaign_id}
                          value={option.campaign_id}
                        >
                          {" "}
                          {option.campaign_id} - {option.campaign_name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </div>

              <div className="col-lg-3 col-sm-6 col-12">
                <div style={{ display: "inline-block", marginTop: "18px" }}>
                  <Button
                    color="primary"
                    className="jr-btn bg-success text-white"
                    onClick={this.filterCamp}
                  >
                    Submit
                  </Button>
                  <Button
                    color="primary"
                    className="jr-btn bg-success text-white"
                    onClick={this.editcam}
                  >
                    MODIFY
                  </Button>
                </div>
              </div>
            </form>
          </CardBox>
        </div>

        <div>
          <Paper>
            <Toolbar className="table-header">
              <div className="title">
                <h3>
                  <i className="zmdi zmdi-view-web mr-2" /> Live Current Hopper
                  List
                </h3>
              </div>
              <div className="spacer" />
              <div>
                <span
                  style={{ float: "right", marginRight: 20, width: "200px" }}
                >
                  <h4>2018-08-05 02:35:27</h4>
                </span>
              </div>
              <div className="search-bar right-side-icon bg-transparent search-dropdown" />
              <div className="actions" style={{ display: "inline-flex" }} />
            </Toolbar>
            <div className="flex-auto">
              <div className="table-responsive-material">
                <Table
                  className="Agent-table"
                  id="agent-table"
                  style={{ wordBreak: "break-word" }}
                >
                  <DataTableHead
                    numSelected={1}
                    order={order}
                    orderBy={orderBy}
                    onSelectAllClick={this.handleSelectAllClick}
                    onRequestSort={this.handleRequestSort}
                    rowCount={parseInt(total)}
                  />
                  <TableBody>
                    {ajaxData &&
                      ajaxData.map((n, i) => {
                        return (
                          <TableRow key={i}>
                            <TableCell>{n.hopper_id}</TableCell>
                            <TableCell>{n.priority}</TableCell>
                            <TableCell>{n.lead_id}</TableCell>
                            <TableCell>{n.list_id}</TableCell>
                            <TableCell>{n.phone_number}</TableCell>
                            <TableCell>{n.state}</TableCell>
                            <TableCell>{n.status}</TableCell>
                            <TableCell>{n.called_count}</TableCell>
                            <TableCell>{n.gmt_offset_now}</TableCell>
                            <TableCell>{n.alt_dial}</TableCell>
                            <TableCell>{n.source}</TableCell>
                            <TableCell>{n.vendor_lead_code}</TableCell>
                          </TableRow>
                        );
                      })}
                    {ajaxData &&
                    ajaxData.length == 0 &&
                    this.state.isLoading ? (
                      <TableRow>
                        <TableCell colSpan="12">
                          <center>Loading ......... </center>
                        </TableCell>
                      </TableRow>
                    ) : ajaxData.length == 0 ? (
                      <TableRow>
                        <TableCell colSpan="12">
                          <center>No Records Found </center>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableCell colSpan="12">
                          <center> </center>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <div style={{ margin: "10px 0px 10px 20px" }}>
                  <br />
                  <br />
                  Sources:
                  <br />A = Auto-alt-dial
                  <br />C = Scheduled Callbacks
                  <br />N = Xth New lead order
                  <br />P = Non-Agent API hopper load
                  <br />Q = No-hopper queue insert
                  <br />R = Recycled leads
                  <br />S = Standard hopper load
                  <br />
                </div>
              </div>
            </div>
          </Paper>
          {this.state.isLoading && (
            <div className="loader-view" id="loader-view">
              <CircularProgress />
            </div>
          )}
        </div>
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
  )(List)
);
