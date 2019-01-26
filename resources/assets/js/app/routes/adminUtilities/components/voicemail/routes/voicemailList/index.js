import React, { Component } from "react";
import ContainerHeader from "../../../../../../../components/ContainerHeader/index";
import axios from "axios";
import classNames from "classnames";
import PropTypes from "prop-types";
import keycode from "keycode";
import Table from "@material-ui/core/Table";
import MenuItem from "@material-ui/core/MenuItem";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableFooter from "@material-ui/core/TableFooter";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Toolbar from "@material-ui/core/Toolbar";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Switch from "@material-ui/core/Switch";
import Button from "@material-ui/core/Button";
import SweetAlert from "react-bootstrap-sweetalert";
import { createNotification } from "../../../../../../../Helpers";
import NoRecords from "../../../../../../../components/common/NoRecords";
let counter = 0;

const columnData = [
  { id: "voicemail_id", label: "Voicemail Id" },
  { id: "fullname", label: "Name" },
  { id: "active", textAlign: "text-center", label: "Active" },
  { id: "messages", textAlign: "text-center", label: "New Messages" },
  { id: "old_messages", textAlign: "text-center", label: "Old Messages" },
  { id: "delete_vm_after_email", textAlign: "text-center", label: "Delete" },
  { id: "modify", textAlign: "text-center", label: "Modify" }
];

class DataTableHead extends React.Component {
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
    const {
      onSelectAllClick,
      order,
      orderBy,
      numSelected,
      rowCount
    } = this.props;

    return (
      <TableHead>
        <TableRow>
          {columnData.map(column => {
            return (
              <TableCell
                className={column.textAlign}
                key={column.id}
                numeric={column.numeric}
                padding={column.disablePadding ? "none" : "default"}
              >
                <Tooltip
                  title={column.label}
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

class VoicemailList extends React.Component {
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

    this.setState({
      data,
      order,
      orderBy
    });
  };

  handleKeyDown = (event, id) => {
    if (keycode(event) === "space") {
      this.handleClick(event, id);
    }
  };

  handleClick = (event, id) => {
    const { selected } = this.state;
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    this.setState({
      selected: newSelected
    });
  };

  handleChangePage = (event, page) => {
    this.setState({
      page
    });
  };

  handleChangeRowsPerPage = event => {
    this.setState({
      rowsPerPage: event.target.value
    });
  };

  onCancelAlert = () => {
    this.setState({
      showAlert: false
    });
  };

  onCancelDelete = () => {
    this.setState({
      showConfirm: false,
      deleteScriptId: ""
    });
  };

  isSelected = id => this.state.selected.indexOf(id) !== -1;

  constructor(props, context) {
    super(props, context);

    this.state = {
      order: "asc",
      orderBy: "voicemail_id",
      selected: [],
      data: [],
      page: 0,
      rowsPerPage: DEFAULT_PAGE_SIZE,
      showConfirm: false,
      isLoading: false
    };
  }

  handleActiveChange = (event, data) => {
    let formData = {
      voicemail_id: event.target.value,
      active: data ? "Y" : "N"
    };

    axios
      .post("/api/admin-utilities/set-voicemail-active", formData)
      .then(function(response) {
        createNotification(
          response.data.status,
          response.data.status,
          response.data.msg
        );
      })
      .catch(function(error) {
        createNotification(ERROR, ERROR, ERROR_MSG);
      });
  };

  handleDeleteVoicemail = id => {
    this.setState({
      showConfirm: true,
      deleteScriptId: id
    });
  };

  handleEditVoicemail = id => {
    this.props.history.push("edit/" + id);
  };

  handleDeleteConfirm = () => {
    var id = this.state.deleteScriptId;
    this.onCancelDelete();
    var _this = this;
    axios
      .post("/api/admin-utilities/delete-voicemail", { voicemail_id: id })
      .then(function(response) {
        if (response.data.status == "Success" && response.data.data != "") {
          _this.setState({
            data: response.data.data
          });
        }

        createNotification(
          response.data.status,
          response.data.status,
          response.data.msg
        );
      })
      .catch(function(error) {
        createNotification(ERROR, ERROR, ERROR_MSG);
      });
  };
  handleEditEventHandler = id => {
    id == "add"
      ? this.props.history.push("add")
      : this.props.history.push("edit/" + id);
  };

  componentDidMount() {
    axios
      .get("/api/admin-utilities/voicemail-lists")
      .then(response => {
        this.setState({
          data: response.data.data.data
        });
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  render() {
    const {
      data,
      order,
      orderBy,
      selected,
      rowsPerPage,
      page,
      showConfirm,
      isLoading
    } = this.state;

    return (
      <div>
        <ContainerHeader match={this.props.match} title="Voicemail" />
        <Tooltip title="Add New Voicemail">
          <Button
            variant="raised"
            className="bg-primary text-white"
            style={{ float: "right" }}
            onClick={() => this.handleEditEventHandler("add")}
          >
            Add New Voicemail
          </Button>
        </Tooltip>
        <Paper>
          <SweetAlert
            show={showConfirm}
            warning
            showCancel
            confirmBtnText="Yes Delete It"
            confirmBtnBsStyle="danger"
            cancelBtnBsStyle="default"
            title=""
            onConfirm={this.handleDeleteConfirm}
            onCancel={this.onCancelDelete}
          >
            Are you sure to delete this Script permanently?
          </SweetAlert>
          <Toolbar className="table-header">
            <div className="title">
              <h3>
                <i className="zmdi zmdi-view-web mr-2" />
                Voicemail Listing
              </h3>
            </div>
            <div className="spacer" />
            <div className="actions" />
          </Toolbar>
          <div className="flex-auto">
            <div className="table-responsive-material">
              <Table className="">
                <DataTableHead
                  numSelected={selected.length}
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={this.handleRequestSort}
                  rowCount={data.length}
                />
                <TableBody>
                  {data &&
                    data
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map(n => {
                        const isSelected = this.isSelected(n.id);
                        return (
                          <TableRow key={++counter}>
                            <TableCell>{n.voicemail_id}</TableCell>
                            <TableCell>{n.fullname}</TableCell>
                            <TableCell className="text-center">
                              <Switch
                                value={`${n.voicemail_id}`}
                                defaultChecked={n.active == "Y"}
                                onChange={this.handleActiveChange.bind(this)}
                                color="primary"
                              />
                            </TableCell>

                            <TableCell className="text-center">
                              {n.messages}
                            </TableCell>
                            <TableCell className="text-center">
                              {n.old_messages}
                            </TableCell>
                            <TableCell className="text-center">
                              {n.delete_vm_after_email}
                            </TableCell>
                            <TableCell className="text-center">
                              <Tooltip title="Modify Voicemail">
                                <IconButton
                                  onClick={() =>
                                    this.handleEditVoicemail(n.voicemail_id)
                                  }
                                >
                                  <a className="teal-text">
                                    <i className="fa fa-pencil" />
                                  </a>
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Delete Voicemail">
                                <IconButton
                                  onClick={() =>
                                    this.handleDeleteVoicemail(n.voicemail_id)
                                  }
                                >
                                  <a className="red-text">
                                    <i className="fa fa-times" />
                                  </a>
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}

                  <NoRecords Records={data} isLoading={isLoading} />
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      count={data.length}
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
        </Paper>
      </div>
    );
  }
}

export default VoicemailList;
