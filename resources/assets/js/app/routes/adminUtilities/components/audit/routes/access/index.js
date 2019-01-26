import axios from "axios";
import {
  React,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  InfoCard,
  ContainerHeader,
  CardBox,
  Paper,
  Input,
  InputLabel,
  MenuItem,
  FormControl,
  FormHelperText,
  Select,
  Toolbar,
  Card,
  CardBody,
  Tooltip,
  IconButton,
  connect,
  TablePagination,
  TableFooter,
  CardSubtitle,
  CardText,
  TextField,
  cloneElement,
  Component,
  Button,
  moment,
  DayPickerInput,
  formatDate,
  parseDate,
  Helmet
} from "./plugins";
import DateRange from "../../../../../../../components/common/DateRange";

import { fetchGlobal } from "../../../../../../../actions/Global";
import { agents_group } from "./data";

class Pagination extends React.Component {
  constructor(props) {
    super(props);
    var ts = new Date();
    this.state = {
      data: [],
      page: 0,
      rowsPerPage: 10,
      total: 0,
      nextPageUrl: "/api/country-lists",
      prevPageUrl: "/api/country-lists",
      from: moment(new Date()).format("YYYY-MM-DD"),
      to: moment(new Date()).format("YYYY-MM-DD"),
      fromSelectedDate: moment(ts).format("MM/DD/YYYY HH:MM:SS"),
      toSelectedDate: moment(ts).format("MM/DD/YYYY HH:MM:SS"),
      userGroups: [],
      user: "",
      agent_users: "",
      error: false
    };
  }

  componentWillMount() {
    this.getCountryList();
  }

  componentDidMount() {
    this.props.fetchGlobal(["agent_c"]);
  }
  componentWillReceiveProps(nextPropsFromRedux) {
    this.setState({
      userGroups: nextPropsFromRedux.Global.agent_c
        ? nextPropsFromRedux.Global.agent_c
        : ""
    });
  }
  handleFromChange = fromDate => {
    let _this = this;
    this.setState({ from: moment(fromDate).format("YYYY-MM-DD") });
    setTimeout(function() {
      _this.state.from;
    }, 1000);
  };

  handleToChange = toDate => {
    this.setState({ to: moment(toDate).format("YYYY-MM-DD") });
  };
  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  handleSubmit = () => {
    let date = moment(this.state.fromSelectedDate).format(
      "MM/DD/YYYY HH:MM:SS"
    );
    const { from, to, agent_users, error } = this.state;

    console.log(date);

    if (!error) {
      let postData = {
        from: from,
        to: to,
        agent_user: agent_users
      };
      console.log(postData);
    }
  };

  getCountryList(page = 0, page_size = 10) {
    let $this = this;

    let current_page = page + 1;
    axios
      .post(
        "/api/admin-utilities/system-audit-access?page=" +
          current_page +
          "&page_size=" +
          page_size
      )
      .then(response => {
        console.log(response, response.data.data.current_page);
        $this.setState({
          data: response.data.data.data,
          total: response.data.data.total
        });
      })
      .catch(error => {
        console.log(error);
      });
  }

  handleChangePage = (event, page) => {
    this.setState({ page });
    this.getCountryList(page, this.state.rowsPerPage);
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
    this.getCountryList(this.state.page, event.target.value);
  };

  render() {
    const { agent_users, data, rowsPerPage, page, total } = this.state;
    const {
      fromSelectedDate,
      toSelectedDate,
      user,
      lead_id,
      phone_number
    } = this.state;
    const { from, to } = this.state;
    const modifiers = { start: from, end: to };
    return (
      <div>
        <ContainerHeader
          match={this.props.match}
          title="System Audit - Access"
        />
        <CardBox styleName="col-lg-12" heading="">
          <Toolbar className="table-header">
            <div className="title">
              <h3>
                <i className="zmdi zmdi-view-web mr-2" /> Search
              </h3>
            </div>
            <div className="spacer" />
            <div className="actions" />
          </Toolbar>
          <form className="row" autoComplete="off">
            <div
              className="col-lg-6 col-sm-6 col-12"
              style={{ paddingTop: "17px" }}
            >
              <FormControl className="w-100 mb-2">
                <div key="basic_day" className="picker">
                  <div className="InputFromTo">
                    <DateRange
                      onFromChange={this.handleFromChange}
                      onToChange={this.handleToChange}
                      from={from}
                      to={to}
                    />
                    <Helmet />
                  </div>
                  <FormHelperText>
                    The date range for this report is limited to 60 days from
                    today.
                  </FormHelperText>
                </div>
              </FormControl>
            </div>
            <div className="col-lg-6 col-sm-6 col-12">
              <FormControl className="w-100 mb-2">
                <TextField
                  id="select-users-native"
                  select
                  label="Users "
                  helperText="Please select users"
                  margin="normal"
                  tabIndex="-1"
                  value={agent_users}
                  onChange={this.handleChange("agent_users")}
                  fullWidth
                >
                  {agents_group.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </TextField>
              </FormControl>
            </div>
            <Button
              color="primary"
              className="jr-btn bg-success text-white"
              onClick={this.handleSubmit}
            >
              Submit
            </Button>
          </form>
        </CardBox>

        <Card className="shadow border-0 bg-default text-black">
          <CardBody>
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-12">
                <label>List :</label>
              </div>
            </div>
            <Paper>
              <div className="table-responsive-material">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Username</TableCell>
                      <TableCell>IP</TableCell>
                      <TableCell>Browser</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.data.map((n, i) => (
                      <TableRow key={n.event_date}>
                        <TableCell>{n.event_date}</TableCell>
                        <TableCell>{n.user}</TableCell>
                        <TableCell>{n.country_name}</TableCell>
                        <TableCell>{n.country_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TablePagination
                        count={total}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onChangePage={this.handleChangePage}
                        onChangeRowsPerPage={this.handleChangeRowsPerPage}
                      />
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </Paper>
            <br />
            <br />
          </CardBody>
        </Card>
        <style>
          {`
.InputFromTo .DayPicker-Day--selected:not(.DayPicker-Day--start):not(.DayPicker-Day--end):not(.DayPicker-Day--outside) {
background-color: #f0f8ff !important;
color: #4a90e2;
}
.InputFromTo .DayPicker-Day {
border-radius: 0 !important;
}
.InputFromTo .DayPicker-Day--start {
border-top-left-radius: 50% !important;
border-bottom-left-radius: 50% !important;
}
.InputFromTo .DayPicker-Day--end {
border-top-right-radius: 50% !important;
border-bottom-right-radius: 50% !important;
}
.InputFromTo .DayPickerInput-Overlay {
width: 550px;
}
.InputFromTo-to .DayPickerInput-Overlay {
margin-left: -198px;
}
 `}
        </style>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Pagination);
