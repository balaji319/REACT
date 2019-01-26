import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import {
  React,
  Component,
  connect,
  Redirect,
  ContainerHeader,
  axios,
  classNames,
  PropTypes,
  keycode,
  Table,
  MenuItem,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  Paper,
  Checkbox,
  IconButton,
  Tooltip,
  DeleteIcon,
  Switch,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  SweetAlert,
  CircularProgress
} from "./plugins";

import Ytel from "../sections/ytel/";
import Group from "../sections/group/";
import DataTableHead from "./DataTableHead";
import {} from "../../../../actions/";
import {
  API_FETCH_YTELGROUP_LIST,
  API_FETCH_YTEL_LIST
} from "../../../../constants/";

import { x5ContactGroups, systemComponents } from "./data";
import NewGroupPopUp from "./NewGroupPopUp";

function TabContainer(props) {
  return <div style={{ padding: 20 }}>{props.children}</div>;
}

class DataList extends React.Component {
  tabHandleChange = (event, value) => {
    if (value == "0") {
      this.setState({ data: [] });
      this.fetchGroupHandler();
    } else {
      this.setState({ YtelData: [] });
      this.fetchUsersHandler();
    }
    this.setState({ value });
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      value: 0,
      order: "asc",
      orderBy: "group_id",
      selected: [],
      data: [],
      page: 0,
      rowsPerPage: 25,
      showAlert: false,
      alertContent: "",
      alertTitle: "",
      showConfirm: false,
      isLoading: false,
      alertTitle: "",
      YtelData: [],
      load_group: "",
      group_open: false,
      selected_id: "",
      deleteInboundId: "",
      selectedID: "",
      showGroup: false
    };
  }

  //table sort function
  handleRequestSort = (event, property) => {
    let temp_data = this.props.Agent.data;
    const orderBy = property;
    let order = "desc";
    if (this.state.orderBy === property && this.state.order === "desc") {
      order = "asc";
    }
    const data =
      order === "desc"
        ? temp_data.sort((a, b) => (b[orderBy] < a[orderBy] ? -1 : 1))
        : temp_data.sort((a, b) => (a[orderBy] < b[orderBy] ? -1 : 1));
    this.setState({ data, order, orderBy });
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };
  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };
  //active  switch changes
  statusChangeHandler = (event, data) => {
    var let_this = this;
    let formData = {
      user_id: event.target.value,
      active: data ? "Y" : "N"
    };
    setTimeout(function() {
      let_this.props.updateStatusRecord(formData);
    }, 10);
  };
  handleEditUserEventHandler = id => {
    alert(id);
  };
  handlePermisssionsUserEventHandler = id => {
    alert(id);
  };
  DeletedUserHandler = id => {};
  handleEditGroupEventHandler = id => {
    let let_this = this;
    this.setState({ selected_id: id });

    setTimeout(function() {
      let_this.setState({ group_open: true });
    }, 10);
  };

  handlePermisssionsGroupEventHandler = id => {
    let let_this = this;
    let_this.setState({ selectedID: id, showGroup: true });
  };
  DeletedGroupHandler = id => {
    this.setState({ showConfirm: true, deleteInboundId: id });
  };

  handleNewGrouptHandler = name => {
    let let_this = this;
    this.setState({ selected_id: "" }),
      setTimeout(function() {
        let_this.setState({ group_open: true });
      }, 10);
  };

  DeleteConfirmHandler = () => {
    var let_this = this;
    this.onCancelDeleteHandler();
    let formData = {
      id: this.state.deleteInboundId
    };
    setTimeout(function() {
      // let_this.props.deleteRecord(formData);
      axios
        .post(API_DELETE_YTELGROUP_RECORD, postData)
        .then(response => {
          this.handleRequestClose();
          let alertTitle = "Success";
          let alertContent = "Group Created Successfully";
          createNotification(alertTitle, alertTitle, alertContent);
          this.props.fetchallgroup();
        })
        .catch(function(error) {
          console.log(error);
        });
    }, 10);
  };

  onCancelDeleteHandler = () => {
    this.setState({ showConfirm: false });
  };

  //handle  methods && custome Handler
  changePageHandler = (event, page) => {
    this.setState({ page });
  };

  changeRowsPerPageHandler = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  //alert msg
  showAlert(status, msg) {
    this.setState({ alertTitle: status, alertContent: msg, showAlert: true });
  }
  handleRequestClose = value => {
    this.setState({ group_open: false });
  };
  onCancelAlert = () => {
    this.setState({ showAlert: false });
  };
  handleChangeHandler = name => event => {};

  componentDidMount() {
    this.fetchGroupHandler();
  }

  fetchGroupHandler = event => {
    let this_ = this;
    this_.setState({ load_group: true });
    axios
      .get(API_FETCH_YTELGROUP_LIST)
      .then(response => {
        setTimeout(function() {
          this_.setState({
            data: response.data.list.data,
            load_group: false
          });
        }, 10);
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  fetchUsersHandler = event => {
    let this_ = this;
    this_.setState({ load_group: true });
    axios
      .get(API_FETCH_YTEL_LIST)
      .then(response => {
        setTimeout(function() {
          this_.setState({
            YtelData: response.data.list.data,
            load_group: false
          });
        }, 10);
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  render() {
    const {
      data,
      order,
      orderBy,
      selected_id,
      YtelData,
      selected,
      rowsPerPage,
      page,
      showAlert,
      alertContent,
      alertTitle,
      showConfirm,
      showClonePopup,
      showCloneConfirm
    } = this.state;
    const divStyle = { padding: "4px 30px 4px 24px", textAlign: "left" };
    const { Agent } = this.props;
    const { value } = this.state;

    return (
      <div className="app-wrapper">
        <div className="dashboard animated slideInUpTiny animation-duration-3">
          <ContainerHeader
            match={this.props.match}
            title={
              value === 1
                ? "Admin Utilities - Permission - Ytel"
                : "Admin Utilities - Management - Ytel Group"
            }
          />
          <AppBar className="bg-primary" position="static">
            <Tabs
              value={value}
              onChange={this.tabHandleChange}
              scrollable
              scrollButtons="on"
            >
              <Tab className="tab" label="Ytel Group" />
              <Tab className="tab" label="Ytel" />
            </Tabs>
          </AppBar>
          <Paper>
            {value === 0 && (
              <TabContainer>
                <SweetAlert
                  show={showConfirm}
                  warning
                  showCancel
                  confirmBtnText="Yes Delete It"
                  confirmBtnBsStyle="danger"
                  cancelBtnBsStyle="default"
                  title=""
                  onConfirm={this.DeleteConfirmHandler}
                  onCancel={this.onCancelDeleteHandler}
                >
                  {" "}
                  Are you sure to delete this Record ?
                </SweetAlert>
                <div className="flex-auto">
                  <NewGroupPopUp
                    open={this.state.group_open}
                    id={selected_id}
                    onClose={this.handleRequestClose.bind(this)}
                    fetchallgroup={this.fetchGroupHandler.bind(this)}
                  />
                  <div className="table-responsive-material">
                    {!this.state.showGroup ? (
                      <React.Fragment>
                        <Tooltip title="Add New Group">
                          <Button
                            variant="raised"
                            onClick={() => this.handleNewGrouptHandler("add")}
                            className="bg-primary text-white"
                            style={{ float: "right" }}
                          >
                            Add New Group
                          </Button>
                        </Tooltip>

                        <Paper>
                          <Toolbar className="table-header">
                            <div className="title">
                              <h3>
                                <i className="zmdi zmdi-view-web mr-2" />
                                Group Listing
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
                                  onSelectAllClick={this.handleSelectAllClick}
                                  onRequestSort={this.handleRequestSort}
                                  rowCount={data ? data.length : 1}
                                />

                                <TableBody>
                                  {data ? (
                                    data
                                      .slice(
                                        page * rowsPerPage,
                                        page * rowsPerPage + rowsPerPage
                                      )
                                      .map(n => {
                                        return (
                                          <TableRow key={n.x5_contact_group_id}>
                                            <TableCell style={divStyle}>
                                              {n.x5_contact_group_id}
                                            </TableCell>
                                            <TableCell style={divStyle}>
                                              {n.group_name}
                                            </TableCell>
                                            <TableCell style={divStyle}>
                                              {n.group_name}
                                            </TableCell>
                                            <TableCell
                                              style={divStyle}
                                              className="text-center"
                                              style={{ whiteSpace: "nowrap" }}
                                            >
                                              <Tooltip title="Modify ">
                                                <IconButton
                                                  onClick={() =>
                                                    this.handleEditGroupEventHandler(
                                                      n.x5_contact_group_id
                                                    )
                                                  }
                                                >
                                                  <i className="fa fa-user" />
                                                </IconButton>
                                              </Tooltip>
                                              <Tooltip title="Edit Ytel Group Permissions ">
                                                <IconButton
                                                  onClick={() =>
                                                    this.handlePermisssionsGroupEventHandler(
                                                      n.x5_contact_group_id
                                                    )
                                                  }
                                                >
                                                  <i className="fa fa-cogs" />
                                                </IconButton>
                                              </Tooltip>
                                              <Tooltip title="Delete Ytel Group  ">
                                                <IconButton
                                                  onClick={() =>
                                                    this.DeletedGroupHandler(
                                                      n.x5_contact_group_id
                                                    )
                                                  }
                                                >
                                                  <i className="fa fa-user-times" />
                                                </IconButton>
                                              </Tooltip>
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })
                                  ) : (
                                    <TableRow>
                                      <TableCell style={divStyle} />
                                      <TableCell style={divStyle}> </TableCell>
                                      <TableCell style={divStyle}> </TableCell>
                                      <TableCell style={divStyle}> </TableCell>
                                      <TableCell style={divStyle}>
                                        {" "}
                                        Loading ..........{" "}
                                      </TableCell>
                                      <TableCell style={divStyle}> </TableCell>
                                      <TableCell style={divStyle}> </TableCell>
                                      <TableCell style={divStyle}> </TableCell>
                                      <TableCell style={divStyle}> </TableCell>
                                      <TableCell
                                        style={divStyle}
                                        className="text-center"
                                        style={{ whiteSpace: "nowrap" }}
                                      />
                                    </TableRow>
                                  )}
                                </TableBody>
                                <TableFooter>
                                  <TableRow>
                                    <TablePagination
                                      count={data ? data.length : 1}
                                      rowsPerPage={rowsPerPage}
                                      page={page}
                                      onChangePage={this.handleChangePage}
                                      onChangeRowsPerPage={
                                        this.handleChangeRowsPerPage
                                      }
                                    />
                                  </TableRow>
                                </TableFooter>
                              </Table>
                            </div>
                          </div>
                        </Paper>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <Tooltip title="Add New Group">
                          <Button
                            variant="raised"
                            onClick={() => {
                              this.setState({ showGroup: false });
                            }}
                            className="bg-primary text-white"
                            style={{ float: "right" }}
                          >
                            Back
                          </Button>
                        </Tooltip>

                        <Paper>
                          <Toolbar className="table-header">
                            <div className="title">
                              <h3>
                                <i className="zmdi zmdi-view-web mr-2" />
                                Permissions {this.state.selectedID}
                              </h3>
                            </div>
                            <div className="spacer" />
                            <div className="actions" />
                          </Toolbar>
                          <div className="flex-auto">
                            <div className="table-responsive-material">
                              <div className="container-fluid x5-admin-main-content">
                                <div className="row">
                                  <div className="row verical_middle" />
                                  {/* Profile Info and Notifications */}
                                  {/*<div class="clearfix">*/}
                                  <div className="col-md-6 col-sm-8 clearfix" />
                                </div>
                                <div className="row">
                                  <div className="col-sm-12">
                                    <hr />
                                  </div>
                                </div>
                                <div className="row">
                                  {/* appViewSegment: 0 */}
                                  <div
                                    className="animate col-sm-12 view-container ng-scope"
                                    app-view-segment={0}
                                    style={{}}
                                  >
                                    <h3 className="ng-binding ng-scope">
                                      Admin Utilities - Management - Ytel Group
                                      - Edit
                                    </h3>
                                    {/* appViewSegment: 1 */}
                                    <div
                                      className="animate ng-scope"
                                      app-view-segment={1}
                                      style={{}}
                                    >
                                      <div className="ng-scope">
                                        <div
                                          className="hide ng-isolate-scope"
                                          ng-joy-ride="startJoyRide"
                                          config="config"
                                          on-finish="setFinished()"
                                          on-skip="setFinished()"
                                        />
                                        <h3>Ytel Permission</h3>

                                        {/* appViewSegment: 2 */}
                                        <div
                                          className="animate ng-scope"
                                          app-view-segment={2}
                                          style={{}}
                                        >
                                          {/* appViewSegment: 3 */}
                                          <div
                                            app-view-segment={3}
                                            className="ng-scope"
                                          >
                                            {/* ngInclude: */}
                                            <ng-include
                                              src="'/AccessControl/angularjsTemplate/permission-edit.html'"
                                              className="ng-scope"
                                              style={{}}
                                            >
                                              <style
                                                className="ng-scope"
                                                dangerouslySetInnerHTML={{
                                                  __html:
                                                    "\n    .sticky-btn {\n        display: none;\n    }\n\n    .stick .sticky-btn {\n        display: inline;\n    }\n\n    .divTable{\n        display: table;\n        width: 100%;\n    }\n    .divTableRow {\n        display: table-row;\n    }\n    .divTableRow:hover > .divTableCell {\n        background-color: #f5f5f5;\n    }\n\n    .divTableRow.has-access-from-group > .divTableCell:first-child,\n    .divTableRow > .divTableCell.has-access-from-group {\n        background-color: #d9edf7;\n    }\n\n    .divTableRow.has-access > .divTableCell:first-child,\n    .divTableRow > .divTableCell.has-access {\n        background-color: #dff0d8 !important;\n    }\n\n    .divTableRow.has-access:hover > .divTableCell:first-child,\n    .divTableRow:hover > .divTableCell.has-access {\n        background-color: #d0e9c6;\n    }\n\n    .divTableHeading {\n        background-color: #EEE;\n        display: table-header-group;\n    }\n    .divTableCell, .divTableHead {\n        border: 1px solid #999999;\n        display: table-cell;\n        padding: 3px 10px;\n    }\n    .divTableHeading {\n        background-color: #EEE;\n        display: table-header-group;\n        font-weight: bold;\n    }\n    .divTableFoot {\n        background-color: #EEE;\n        display: table-footer-group;\n        font-weight: bold;\n    }\n    .divTableBody {\n        display: table-row-group;\n    }\n\n    .divTableControl {\n        text-align: center;\n        width: 71px;\n    }\n\n    .sticky.stick {\n        margin-top: 0 !important;\n        position: fixed;\n        top: 0;\n        z-index: 10000;\n    }\n"
                                                }}
                                              />
                                              {/* ngIf: userPermissions && isSuperAdmin */}
                                              {/* ngIf: userPermissions && !x5ContactInfo.X5Contact.group_names */}
                                              {/* ngIf: !userPermissions || (userPermissions && !isSuperAdmin && x5ContactInfo.X5Contact.group_names) */}
                                              <div
                                                ng-if="!userPermissions || (userPermissions && !isSuperAdmin && x5ContactInfo.X5Contact.group_names)"
                                                className="ng-scope"
                                              >
                                                <div>
                                                  <button
                                                    className="btn btn-success"
                                                    ng-click="saveX5Permission()"
                                                  >
                                                    Save Permissions
                                                  </button>
                                                  <hr />
                                                </div>
                                                <h2>
                                                  Step 1 of 2: System Components
                                                </h2>
                                                <p>
                                                  This area controls which
                                                  components Ytel Admin can have
                                                  access to.
                                                </p>
                                                <div
                                                  id="sticky-anchor"
                                                  style={{ height: 0 }}
                                                />
                                                <div className="divTable">
                                                  <div
                                                    className="sticky divTableHeading"
                                                    style={{ width: 1510 }}
                                                  >
                                                    <div className="divTableRow">
                                                      <div
                                                        className="divTableCell"
                                                        style={{ width: 1226 }}
                                                      >
                                                        <button
                                                          className="sticky-btn btn btn-success"
                                                          ng-click="saveX5Permission()"
                                                        >
                                                          Save Permissions
                                                        </button>
                                                      </div>
                                                      <div className="divTableCell divTableControl">
                                                        Create
                                                      </div>
                                                      <div className="divTableCell divTableControl">
                                                        View
                                                      </div>
                                                      <div className="divTableCell divTableControl">
                                                        Update
                                                      </div>
                                                      <div className="divTableCell divTableControl">
                                                        Delete
                                                      </div>
                                                    </div>
                                                  </div>
                                                  {/* ngRepeat: (name, e_sc) in systemComponents */}
                                                  {Object.keys(
                                                    systemComponents
                                                  ).map((item, i) => (
                                                    <React.Fragment>
                                                      <div
                                                        className="divTableHeading ng-scope"
                                                        ng-repeat-start="(name, e_sc) in systemComponents"
                                                      >
                                                        <div className="divTableRow">
                                                          <div className="divTableCell ng-binding">
                                                            {item}
                                                          </div>
                                                          <div className="divTableCell divTableControl">
                                                            <a
                                                              href="#"
                                                              ng-click="selectSystemComponentPermission(name, '_create', false)"
                                                            >
                                                              <i
                                                                className="fa fa-square-o"
                                                                aria-hidden="true"
                                                              />
                                                            </a>
                                                            <a
                                                              href="#"
                                                              ng-click="selectSystemComponentPermission(name, '_create', true)"
                                                            >
                                                              <i
                                                                className="fa fa-check-square-o"
                                                                aria-hidden="true"
                                                              />
                                                            </a>
                                                          </div>
                                                          <div className="divTableCell divTableControl">
                                                            <a
                                                              href="#"
                                                              ng-click="selectSystemComponentPermission(name, '_read', false)"
                                                            >
                                                              <i
                                                                className="fa fa-square-o"
                                                                aria-hidden="true"
                                                              />
                                                            </a>
                                                            <a
                                                              href="#"
                                                              ng-click="selectSystemComponentPermission(name, '_read', true)"
                                                            >
                                                              <i
                                                                className="fa fa-check-square-o"
                                                                aria-hidden="true"
                                                              />
                                                            </a>
                                                          </div>
                                                          <div className="divTableCell divTableControl">
                                                            <a
                                                              href="#"
                                                              ng-click="selectSystemComponentPermission(name, '_update', false)"
                                                            >
                                                              <i
                                                                className="fa fa-square-o"
                                                                aria-hidden="true"
                                                              />
                                                            </a>
                                                            <a
                                                              href="#"
                                                              ng-click="selectSystemComponentPermission(name, '_update', true)"
                                                            >
                                                              <i
                                                                className="fa fa-check-square-o"
                                                                aria-hidden="true"
                                                              />
                                                            </a>
                                                          </div>
                                                          <div className="divTableCell divTableControl">
                                                            <a
                                                              href="#"
                                                              ng-click="selectSystemComponentPermission(name, '_delete', false)"
                                                            >
                                                              <i
                                                                className="fa fa-square-o"
                                                                aria-hidden="true"
                                                              />
                                                            </a>
                                                            <a
                                                              href="#"
                                                              ng-click="selectSystemComponentPermission(name, '_delete', true)"
                                                            >
                                                              <i
                                                                className="fa fa-check-square-o"
                                                                aria-hidden="true"
                                                              />
                                                            </a>
                                                          </div>
                                                        </div>
                                                      </div>
                                                      {systemComponents[
                                                        item
                                                      ].map((n, i) => {
                                                        return (
                                                          <div
                                                            className="divTableBody ng-scope"
                                                            ng-repeat-end
                                                          >
                                                            {/* ngRepeat: sc in e_sc| orderBy: 'SystemComponent.order' */}
                                                            <div
                                                              className="divTableRow ng-scope has-access"
                                                              ng-repeat="sc in e_sc| orderBy: 'SystemComponent.order'"
                                                              ng-class="{'has-access': hasAccess(x5Permissions[100][sc.SystemComponent.system_component_id]), 'has-access-from-group': hasAccess(x5PermissionsGroup[100][sc.SystemComponent.system_component_id])}"
                                                              style={{}}
                                                            >
                                                              <div className="divTableCell">
                                                                <span className="strong ng-binding">
                                                                  <i
                                                                    className="fa fa-long-arrow-right"
                                                                    aria-hidden="true"
                                                                  />{" "}
                                                                  {
                                                                    n
                                                                      .SystemComponent
                                                                      .name
                                                                  }
                                                                </span>
                                                              </div>
                                                              <div
                                                                className="divTableCell divTableControl"
                                                                ng-class="{'has-access': x5Permissions[100][sc.SystemComponent.system_component_id]._create || x5Permissions[100]._._create, 'has-access-from-group': x5PermissionsGroup[100][sc.SystemComponent.system_component_id]._create || x5PermissionsGroup[100]._._create}"
                                                              >
                                                                {/* ngIf: userPermissions && sc.SystemComponent._create */}
                                                                {/* ngIf: sc.SystemComponent._create */}
                                                              </div>
                                                              <div
                                                                className="divTableCell divTableControl has-access"
                                                                ng-class="{'has-access': x5Permissions[100][sc.SystemComponent.system_component_id]._read || x5Permissions[100]._._read, 'has-access-from-group': x5PermissionsGroup[100][sc.SystemComponent.system_component_id]._read || x5PermissionsGroup[100]._._read}"
                                                                style={{}}
                                                              >
                                                                {/* ngIf: userPermissions && sc.SystemComponent._read */}
                                                                {/* ngIf: sc.SystemComponent._read */}
                                                                <input
                                                                  type="checkbox"
                                                                  ng-model="x5Permissions[100][sc.SystemComponent.system_component_id]._read"
                                                                  ng-change="updatePermission(100, sc.SystemComponent.system_component_id, '_read')"
                                                                  ng-if="sc.SystemComponent._read"
                                                                  ng-disabled="x5Permissions[100]._._read"
                                                                  className="ng-pristine ng-untouched ng-valid ng-scope ng-not-empty"
                                                                  style={{}}
                                                                />
                                                                {/* end ngIf: sc.SystemComponent._read */}
                                                              </div>
                                                              <div
                                                                className="divTableCell divTableControl"
                                                                ng-class="{'has-access': x5Permissions[100][sc.SystemComponent.system_component_id]._update || x5Permissions[100]._._update, 'has-access-from-group': x5PermissionsGroup[100][sc.SystemComponent.system_component_id]._update || x5PermissionsGroup[100]._._update}"
                                                              >
                                                                {/* ngIf: userPermissions && sc.SystemComponent._update */}
                                                                {/* ngIf: sc.SystemComponent._update */}
                                                              </div>
                                                              <div
                                                                className="divTableCell divTableControl"
                                                                ng-class="{'has-access': x5Permissions[100][sc.SystemComponent.system_component_id]._delete || x5Permissions[100]._._delete, 'has-access-from-group': x5PermissionsGroup[100][sc.SystemComponent.system_component_id]._delete || x5PermissionsGroup[100]._._delete}"
                                                              >
                                                                {/* ngIf: userPermissions && sc.SystemComponent._delete */}
                                                                {/* ngIf: sc.SystemComponent._delete */}
                                                              </div>
                                                            </div>
                                                            {/* end ngRepeat: sc in e_sc| orderBy: 'SystemComponent.order' */}

                                                            {/* end ngRepeat: sc in e_sc| orderBy: 'SystemComponent.order' */}
                                                          </div>
                                                        );
                                                      })}
                                                    </React.Fragment>
                                                  ))}
                                                  ;
                                                </div>
                                              </div>
                                              {/* end ngIf: !userPermissions || (userPermissions && !isSuperAdmin && x5ContactInfo.X5Contact.group_names) */}
                                            </ng-include>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {/* Footer */}
                                <div className="row">
                                  <footer
                                    className="col-sm-12 main"
                                    style={{ color: "black" }}
                                  >
                                    © 2018 Ytel, Inc. | Ytel® All rights
                                    reserved. | 800.382.4913{" "}
                                  </footer>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Paper>
                      </React.Fragment>
                    )}
                    <div />
                  </div>
                </div>
              </TabContainer>
            )}

            {value === 1 && (
              <TabContainer>
                <div className="flex-auto">
                  <div className="table-responsive-material">
                    <div>
                      <Paper>
                        <Toolbar className="table-header">
                          <div className="title">
                            <h3>
                              <i className="zmdi zmdi-view-web mr-2" />
                              Ytel Listing
                            </h3>
                          </div>
                          <div className="spacer" />
                          <div className="actions" />
                        </Toolbar>
                        <div className="alert alert-warning ">
                          Warning: <strong>Ytel Contact Center Admins</strong>{" "}
                          that <strong>DO NOT</strong> belong to any{" "}
                          <strong>Ytel Groups</strong> will have{" "}
                          <strong>FULL ACCESS</strong> to the system except for
                          managing other Ytel Admins
                        </div>
                        <div className="flex-auto">
                          <div className="table-responsive-material">
                            <Table className="">
                              <DataTableHead
                                numSelected={selected.length}
                                order={order}
                                orderBy={orderBy}
                                onSelectAllClick={this.handleSelectAllClick}
                                onRequestSort={this.handleRequestSort}
                                rowCount={YtelData ? YtelData.length : 1}
                              />
                              <TableBody>
                                {YtelData ? (
                                  YtelData.slice(
                                    page * rowsPerPage,
                                    page * rowsPerPage + rowsPerPage
                                  ).map(n => {
                                    return (
                                      <TableRow key={n.x5_contact_id}>
                                        <TableCell style={divStyle}>
                                          {n.username}({n.name})
                                        </TableCell>
                                        <TableCell style={divStyle}>
                                          {n.group_names}
                                        </TableCell>
                                        <TableCell style={divStyle}>
                                          {n.enable ? "Active" : "inactive"}
                                        </TableCell>
                                        <TableCell
                                          style={divStyle}
                                          className="text-center"
                                          style={{ whiteSpace: "nowrap" }}
                                        >
                                          <Tooltip title="Modify ">
                                            <IconButton
                                              onClick={() =>
                                                this.handleEditUserEventHandler(
                                                  n.x5_contact_id
                                                )
                                              }
                                            >
                                              <i className="fa fa-user" />
                                            </IconButton>
                                          </Tooltip>
                                          <Tooltip title="Edit Ytel Group Permissions ">
                                            <IconButton
                                              onClick={() =>
                                                this.handlePermisssionsUserEventHandler(
                                                  n.x5_contact_id
                                                )
                                              }
                                            >
                                              <i className="fa fa-cogs" />
                                            </IconButton>
                                          </Tooltip>
                                          <Tooltip title="Delete Ytel Group  ">
                                            <IconButton
                                              onClick={() =>
                                                this.DeletedUserHandler(
                                                  n.x5_contact_id
                                                )
                                              }
                                            >
                                              <i className="fa fa-user-times" />
                                            </IconButton>
                                          </Tooltip>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })
                                ) : (
                                  <TableRow>
                                    <TableCell style={divStyle} />
                                    <TableCell style={divStyle}> </TableCell>
                                    <TableCell style={divStyle}> </TableCell>
                                    <TableCell style={divStyle}> </TableCell>
                                    <TableCell style={divStyle}>
                                      {" "}
                                      Loading ..........{" "}
                                    </TableCell>
                                    <TableCell style={divStyle}> </TableCell>
                                    <TableCell style={divStyle}> </TableCell>
                                    <TableCell style={divStyle}> </TableCell>
                                    <TableCell style={divStyle}> </TableCell>
                                    <TableCell
                                      style={divStyle}
                                      className="text-center"
                                      style={{ whiteSpace: "nowrap" }}
                                    />
                                  </TableRow>
                                )}
                              </TableBody>
                              <TableFooter>
                                <TableRow>
                                  <TablePagination
                                    count={YtelData ? YtelData.length : 1}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onChangePage={this.handleChangePage}
                                    onChangeRowsPerPage={
                                      this.handleChangeRowsPerPage
                                    }
                                  />
                                </TableRow>
                              </TableFooter>
                            </Table>
                          </div>
                        </div>
                      </Paper>
                    </div>
                  </div>
                </div>
              </TabContainer>
            )}
          </Paper>
          {this.state.load_group && (
            <div className="loader-view">
              <CircularProgress />
            </div>
          )}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  console.log("================");
  console.log(state);
  console.log("================");
  return {
    Agent: state.admin_utilites
  };
}

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DataList);
