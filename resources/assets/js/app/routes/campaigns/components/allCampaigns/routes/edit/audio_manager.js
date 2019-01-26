import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableFooter from "@material-ui/core/TableFooter";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import { Badge } from "reactstrap";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import { AUDIO_FILE } from "./data";

const columnData = [
  {
    id: "Audio File Name",
    numeric: false,
    disablePadding: true,
    label: "Audio File Name"
  },
  { id: "Size", numeric: true, disablePadding: false, label: "Size" },
  {
    id: "Last Modified",
    numeric: true,
    disablePadding: false,
    label: "Last Modified"
  },
  { id: "Action", numeric: true, disablePadding: false, label: "Action" }
];

class EnhancedTableHead extends React.Component {
  static propTypes = {
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,

    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired
  };

  createSortHandler = property => event => {
    this.props.onRequestSort(event, property);
  };

  render() {
    const { order, orderBy, numSelected, rowCount } = this.props;

    return (
      <TableHead>
        <TableRow>
          {columnData.map(column => {
            return (
              <TableCell
                key={column.id}
                numeric={column.numeric}
                padding={column.disablePadding ? "none" : "default"}
              >
                <Tooltip
                  title="Sort"
                  placement={column.numeric ? "bottom-end" : "bottom-start"}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={order}
                    onClick={this.createSortHandler(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            );
          }, this)}
        </TableRow>
      </TableHead>
    );
  }
}

class AudioManager extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      order: "asc",
      orderBy: "calories",
      selected: [],
      data: [],
      page: 0,
      rowsPerPage: 5,
      time: 0,
      isLoading: false
    };
  }

  componentDidMount() {
    this.getAllAudios();
  }
  getAllAudios = () => {
    let _this = this;
    this.setState({ isLoading: true });
    axios
      .get("api/audio-list")
      .then(response => {
        _this.setState({
          data: response.data.data.files,
          isLoading: false
          //audio_url: response.data.data.url
        });
      })
      .catch(function(error) {
        console.log(error);
        _this.setState({ isLoading: false });
      });
  };
  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = "desc";
    if (this.state.orderBy === property && this.state.order === "desc") {
      order = "asc";
    }
    const data =
      order === "desc"
        ? this.state.data.sort((a, b) => (b[orderBy] < a[orderBy] ? -1 : 1))
        : this.state.data.sort((a, b) => (a[orderBy] < b[orderBy] ? -1 : 1));

    this.setState({ data, order, orderBy });
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };
  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };
  handleLangChange = value => {
    this.props.onSelectLanguage(value);
  };
  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  render() {
    const {
      data,
      order,
      orderBy,
      selected,
      rowsPerPage,
      page,
      time,
      isLoading
    } = this.state;

    return (
      <div style={{ minHeight: "400px" }}>
        <br />

        <div className="row">
          <div className="col-lg-6 col-sm-6 col-6">
            FIle Input
            <br />
            <input type="file" multiple ref="fileInput" />
            <br />
            Please upload wav or gsm files
          </div>
          <div className="col-lg-6 col-sm-6 col-6">
            You can also drop audio file here
            <br />
            <Button variant="raised" className="jr-btn bg-success text-white">
              Upload
            </Button>
          </div>
        </div>
        <br />
        <div className="row">
          <div className="col-lg-4 col-sm-6 col-6">
            <Button
              variant="raised"
              color="primary"
              className="jr-btn text-white"
            >
              Play
            </Button>
            <Button variant="raised" className="jr-btn bg-danger text-white">
              Stop
            </Button>
          </div>
          <div className="col-lg-2 col-sm-2 col-2">
            <TextField
              id="name"
              label={""}
              value={time}
              onChange={this.handleChange("name")}
              margin="normal"
              fullWidth
            />
          </div>
          <div className="col-lg-3 col-sm-3 col-3">
            <span className="input-group-addon">Progress</span>
            <input type="range" min="100" max="355" step="10" />
          </div>
          <div className="col-lg-3 col-sm-3 col-3">
            <span className="input-group-addon">Volume</span>
            <input type="range" min="100" max="355" step="10" />
          </div>
        </div>

        <div className="flex-auto">
          <div className="table-responsive-material">
            <Table>
              <EnhancedTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onRequestSort={this.handleRequestSort}
                rowCount={data && data.length}
              />
              <TableBody>
                {data && data
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(n => {
                    return (
                      <TableRow hover key={n.timestamp}>
                        <TableCell padding="none">
                          <a
                            href="javascript:void(0)"
                            onClick={this.handleLangChange.bind(this, n.name)}
                          >
                            {n.name}
                          </a>
                        </TableCell>
                        <TableCell numeric>{n.size}</TableCell>
                        <TableCell numeric>{n.lastmod}</TableCell>
                        <TableCell numeric>
                          <Badge
                            href="javascript:void(0)"
                            color="info"
                            onClick={this.handleLangChange.bind(this, n.name)}
                          >
                            Select
                          </Badge>
                          <Badge href="javascript:void(0)" color="success">
                            Play
                          </Badge>
                          <Badge href="javascript:void(0)" color="danger">
                            Delete
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    count={data && data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={this.handleChangePage}
                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
        {this.state.isLoading && (
          <div className="loader-view" id="loader-view">
            <CircularProgress />
          </div>
        )}
      </div>
    );
  }
}

export default AudioManager;
