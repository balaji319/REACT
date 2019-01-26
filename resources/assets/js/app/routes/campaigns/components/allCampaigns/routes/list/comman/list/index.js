import { CardBox } from "./plugins";
import {
  React,
  connect,
  ContainerHeader,
  axios,
  Toolbar,
  Paper,
  Checkbox,
  CircularProgress
} from "../../../../../../../../../components/plugins.js";
import { fetchGlobal } from "../../../../../../../../../actions/Global";
import { Route, withRouter } from "react-router-dom";
import { createNotification } from "../../../../../../../../../Helpers";

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
    campaign_list: [],
    allData: [],
    listData: []
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
      .get(
        "/api/campaign-data-list?order_by=list_name&&campaign_id=" + int_capmId
      )
      .then(response => {
        console.log("-------------------------------------");
        console.log(response.data.data);
        console.log("-------------------------------------");
        _this.setState({
          allData: response.data.data,
          isLoading: false,
          listData: response.data.data.lists
        });
      })
      .catch(function(error) {
        _this.setState({
          error_msg: "Somthing Went Wrong !!!!",
          isLoading: false
        });
      });
  };

  submitList = () => {
    let array_data = this.state.listData
      .filter(row => row.is_check == 1)
      .map(option => option.list_id);
    let $this = this;

    this.setState({ isLoading: true });
    let formData = {
      campaign_id: this.state.pageTitle,
      list_ids: array_data
    };
    axios
      .put("api/campaign-data-list-update", formData)
      .then(response => {
        createNotification("Success", "Success", response.data.msg);
        $this.setState({
          isLoading: false
        });
      })
      .catch(function(error) {
        createNotification("Error", "Error", "Somthing Went Wrong !!!!");
        this.setState({
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

  filterCamp = event => {
    let source_campaign = this.state.source_campaign;
    this.getAllData(source_campaign);
  };

  redirectCamp = id => {
    this.props.history.push("/app/campaigns/allCampaigns/edit/" + id);
  };

  editcam = event => {
    let source_campaign = this.state.source_campaign;
    //this.getAllData(source_campaign);
  };

  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      campaign_list: nextPropsFromRedux.Global.campaigns
        ? nextPropsFromRedux.Global.campaigns
        : ""
    });
  }

  handleChange(index, dataType, value, data) {
    let this_ = this;
    let temp_value = value ? 1 : 0;
    const newState = this.state.listData.map((item, i) => {
      if (i == index) {
        return { ...item, [dataType]: temp_value };
      }
      return item;
    });

    this.setState({
      listData: newState
    });
  }

  render() {
    const { isLoading, pageTitle, listData } = this.state;

    const {
      campaignStatus,
      lists,
      notDialed_satus,
      status_array
    } = this.state.allData;
    console.log("++++++++++++");
    console.log(listData);
    console.log("++++++++++++");
    return (
      <div>
        <ContainerHeader
          match={this.props.match}
          title="Campaigns List Report"
        />
        <div className="fetch_content">
          <div className="alert alert-info">
            This campaign has {campaignStatus && campaignStatus[1]} leads to be
            dialed in those lists.
          </div>
          <div className="alert alert-info">
            This campaign has {campaignStatus && campaignStatus[2]} leads in the
            dial hopper
          </div>
          <legend />
          <div>
            <Paper>
              <Toolbar className="table-header">
                <div className="title">
                  <h3>
                    <i className="zmdi zmdi-view-web mr-2" /> List Within This
                    Campaign:
                    <a id="campaignlink" href="javascript:void(0)" onClick={()=>{this.redirectCamp(pageTitle)}}>
                      {pageTitle}
                    </a>
                  </h3>
                </div>
                <div className="spacer" />
                <div>
                  <span
                    style={{ float: "right", marginRight: 20, width: "200px" }}
                  />
                </div>
                <div className="search-bar right-side-icon bg-transparent search-dropdown" />
                <div className="actions" style={{ display: "inline-flex" }} />
              </Toolbar>
              <div className="flex-auto">
                <div className="table-responsive-material" />
                <table
                  className="table  table-bordered"
                  id="table-1"
                  aria-describedby="table-1_info"
                >
                  <thead style={{ fontSize: "15px" }}>
                    <tr>
                      <th>List Id</th>
                      <th>List Name</th>
                      <th>Description</th>
                      <th>Leads Count</th>
                      <th colSpan={3}>
                        <center>
                          <a
                            style={{ textDecoration: "underline" }}
                            href="javascript:void(0)"
                          >
                            Active
                          </a>
                          <center />
                        </center>
                      </th>
                      <th>Last Call Date</th>
                      <th>
                        <center>Modify</center>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lists &&
                      lists.map((n, i) => {
                        return (
                          <tr key={i}>
                            <td>{n.list_id}</td>
                            <td>{n.list_name}</td>
                            <td>{n.list_description}</td>
                            <td>{n.tally}</td>
                            <td>{n.active}</td>
                            <td>
                              <Checkbox
                                color="primary"
                                onChange={e =>
                                  this.handleChange(
                                    i,
                                    "is_check",
                                    e.target.checked
                                  )
                                }
                                value={
                                  this.state.listData &&
                                  this.state.listData[i].is_check.toString()
                                }
                                checked={
                                  this.state.listData &&
                                  this.state.listData[i].is_check
                                }
                              />
                            </td>
                            <td>
                              <font size={1}>&nbsp;</font>
                            </td>
                            <td>{n.list_lastcalldate}</td>
                            <td align="center">
                              <a className="teal-text">
                                <i className="fa fa-pencil" />
                              </a>
                            </td>
                          </tr>
                        );
                      })}

                    <tr>
                      <td colSpan={9} align="CENTER">
                        <input
                          type="Button"
                          defaultValue="SUBMIT ACTIVE LIST CHANGES"
                          onClick={this.submitList}
                          className="btn btn-success"
                          disabled={this.state.isLoading ? true : false}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Paper>

            <Paper>
              <Toolbar className="table-header">
                <div className="title">
                  <h3>
                    <i className="zmdi zmdi-view-web mr-2" /> Dialable Statuses
                    Within the Active Lists for this Campaign:{pageTitle}
                  </h3>
                </div>
                <div className="spacer" />
                <div>
                  <span
                    style={{ float: "right", marginRight: 20, width: "200px" }}
                  />
                </div>
                <div className="search-bar right-side-icon bg-transparent search-dropdown" />
                <div className="actions" style={{ display: "inline-flex" }} />
              </Toolbar>
              <div className="flex-auto">
                <div className="table-responsive-material" />
                <table
                  className="vicidial_list table table-striped table-bordered"
                  id="table-1"
                  aria-describedby="table-1_info"
                >
                  <thead style={{ fontSize: "15px" }}>
                    <tr>
                      <th>STATUS</th>
                      <th>STATUS NAME</th>
                      <th>CALLED SINCE LAST RESET</th>
                      <th>NOT CALLED SINCE LAST RESET</th>
                      <th>DIALABLE</th>
                      <th>PENETRATION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {status_array &&
                      status_array.list.map((n, i) => {
                        return (
                          <tr key={i}>
                            <td>{n.status}</td>
                            <td>{n.statusnm}</td>
                            <td>{n.called}</td>
                            <td>{n.statusName}</td>
                            <td>{n.Dilablecount}</td>
                            <td>{n.completed}</td>
                          </tr>
                        );
                      })}
                    <tr>
                      <td>SUBTOTALS</td>
                      <td />
                      <td>{status_array && status_array.sub_total.Ncount}</td>
                      <td>{status_array && status_array.sub_total.ycount}</td>
                      <td />
                      <td />
                    </tr>
                    <tr>
                      <td>Total</td>
                      <td />
                      <td>{status_array && status_array.total.total1}</td>
                      <td />
                      <td>{status_array && status_array.total.disable}</td>
                      <td>{status_array && status_array.total.completed}</td>
                    </tr>{" "}
                  </tbody>
                </table>
              </div>
            </Paper>

            <Paper>
              <Toolbar className="table-header">
                <div className="title">
                  <h3>
                    <i className="zmdi zmdi-view-web mr-2" /> Not Dialable
                    Statuses Within the Active Lists for this Campaign:{
                      pageTitle
                    }
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
                <div className="table-responsive-material" />
                <div style={{ border: "6px solid rgb(243, 243, 243)" }}>
                  <table
                    className="vicidial_list table table-striped table-bordered"
                    id="table-1"
                    aria-describedby="table-1_info"
                  >
                    <thead style={{ fontSize: "15px" }}>
                      <tr>
                        <th>STATUS</th>
                        <th>STATUS NAME</th>
                        <th>CALLED SINCE LAST RESET</th>
                        <th>NOT CALLED SINCE LAST RESET</th>
                        <th>DIALABLE</th>
                        <th>PENETRATION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notDialed_satus &&
                        notDialed_satus.list.map((n, i) => {
                          return (
                            <tr key={i}>
                              <td>{n.status}</td>
                              <td>{n.statusnm}</td>
                              <td>{n.called}</td>
                              <td>{n.statusName}</td>
                              <td>{n.Dilablecount}</td>
                              <td>{n.completed}</td>
                            </tr>
                          );
                        })}
                      <tr>
                        <td>SUBTOTALS</td>
                        <td />
                        <td>{status_array && status_array.sub_total.Ncount}</td>
                        <td>{status_array && status_array.sub_total.ycount}</td>
                        <td />
                        <td />
                      </tr>
                      <tr>
                        <td>Total</td>
                        <td />
                        <td>{status_array && status_array.total.total1}</td>
                        <td />
                        <td>{status_array && status_array.total.disable}</td>
                        <td>{status_array && status_array.total.completed}</td>
                      </tr>{" "}
                    </tbody>
                  </table>
                </div>
              </div>
            </Paper>
          </div>
          <style
            dangerouslySetInnerHTML={{
              __html:
                "\n\t\n\t.modal-backdrop {\n    z-index: -1 !important;\n}\n"
            }}
          />
          <div className="modal fade in" id="wizard1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button
                    type="button"
                    className="close"
                    data-dismiss="modal"
                    aria-hidden="true"
                  >
                    ×
                  </button>
                  <h3 className="modal-title">New release for 2.6</h3>
                </div>
                <div className="modal-body">
                  <ul>
                    <li>
                      <h3>
                        Real Time Report UI changes and added new functionality.{" "}
                      </h3>
                      <h3 />
                    </li>
                    <li>
                      <h3>
                        Lead Loader and List Update The Limitation Messages and
                        prevent to add more than 150 leads
                      </h3>
                      <h3 />
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <CardBox styleName="col-lg-12" heading="">
            <form className="row" autoComplete="off" />
          </CardBox>
        </div>

        <div>
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
