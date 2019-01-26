import React, { Component } from "react";
import PropTypes from "prop-types";
import Avatar from "@material-ui/core/Avatar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import AddIcon from "@material-ui/icons/Add";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import MenuItem from "@material-ui/core/MenuItem";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableFooter from "@material-ui/core/TableFooter";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import DeleteIcon from "@material-ui/icons/Delete";
import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";
import SweetAlert from "react-bootstrap-sweetalert";
import CircularProgress from "@material-ui/core/CircularProgress";
import CardBox from "../../../../../../../components/CardBox/index";
import { createNotification } from "../../../../../../../Helpers";
import { style_header } from "./data";
import { API_ADD_YTELGROUP_RECORD } from "../../../../constants/";

class NewGroupPopUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filtername: "",
      users: [],
      pageTitle: "s",
      showinfo: "Hover to the input on left and help text will come up here :)",
      showinfotitle: "Help Block",
      open: false,
      is_change: false,
      showAlert: false,
      alertContent: "",
      alertTitle: "",
      groupdescription: "",
      groupdescriptionError: false,
      groupname: "",
      groupnameError: false,
      error: false,
      type: ""
    };
  }

  handleRequestClose = () => {
    this.props.onClose(this.props.selectedValue);
  };
  handleListItemClick = value => {
    this.props.onClose(value);
  };
  handleChange = name => event => {
    this.setState({ [name]: event.target.value, is_change: true });
  };
  handleRequestSave = value => {
    let groupname = this.state.groupname;
    let groupdescription = this.state.groupdescription;
    let error = this.state.error;

    groupname == ""
      ? (this.setState({ groupnameError: true }), (error: true))
      : this.setState({ groupnameError: false });
    groupdescription == ""
      ? (this.setState({ groupdescriptionError: true }), (error: true))
      : this.setState({ groupdescriptionError: false });

    if (!error) {
      let postData = {
        group_name: groupname,
        group_description: groupdescription
      };
      axios
        .post(API_ADD_YTELGROUP_RECORD, postData)
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

      // this.props.updateRecord(postData);
      console.log(postData);
    }
  };

  handlefilterList = event => {
    let filterData = [];
    const filterItems = query => {
      this.props.users.filter(e => {
        if (e.name.toLowerCase().indexOf(query.toLowerCase()) > -1) {
          filterData.push(e);
        }
      });
    };
    filterItems(event.target.value);
    if (filterData.length > 0) this.setState({ users: filterData });
    else this.setState({ users: filterData });
  };

  componentWillReceiveProps(nextProps) {
    // if (this.props.id != "") {
    //   this.setState({ type: "EDIT" });
    //   this.getGroupHandler(this.props.id);
    // } else {
    //   this.setState({ type: "Add" });
    // }
  }

  componentDidMount() {
    // if (this.props.id != "") {
    //   this.getGroupHandler(this.props.id);
    // }
  }

  getGroupHandler = event => {
    let this_ = this;
    this_.setState({ load_group: true });
    axios
      .get("api/admin-utilities/ycc-contactgroup-record")
      .then(response => {
        this_.setState({
          groupname: response.data.userGroup.X5ContactGroup.group_name,
          groupdescription:
            response.data.userGroup.X5ContactGroup.group_description
        });
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  render() {
    const { classes, onClose, ...other } = this.props;

    const {
      users,
      showAlert,
      alertTitle,
      type,
      alertContent,
      pageTitle,
      groupdescription,
      groupdescriptionError,
      groupname,
      groupnameError
    } = this.state;
    return (
      <Dialog onClose={this.handleRequestClose} {...other} id="moh_dailog_list">
        <DialogTitle>{type} Group </DialogTitle>
        <div
          id="table-1_filter"
          className="row"
          style={{ width: "100%", paddingLeft: "45px" }}
        >
          <CardBox styleName="col-lg-8">
            <form className="row" noValidate autoComplete="off">
              <div className="sub_menu_div" style={style_header}>
                {" "}
                <i className="fa fa-bars" style={{ marginRight: "10px" }} />
                Add New Group
              </div>

              <div
                className="col-md-12 col-6"
                data-info="The password agent uses to login to Ytel.This field is where you put the users password. Must be at least 2 characters in length. A strong user password should be at least 8 characters in length and have lower case and upper case letters as well as at least one number."
                data-title="Password"
                onMouseEnter={this.logMouseEnter}
                onMouseLeave={this.logMouseLeave}
              >
                <TextField
                  id="usergroup-name"
                  label="Group Name *"
                  margin="normal"
                  fullWidth
                  value={groupname}
                  onChange={this.handleChange("groupname")}
                  error={groupnameError}
                />
              </div>
              <div
                className="col-md-12 col-6"
                data-info=" Your Inbound Group ID
                                                  This is name of Inbound Group, must be between 2 and 20 characters in length. "
                data-title="Group Name "
                onMouseEnter={this.logMouseEnter}
                onMouseLeave={this.logMouseLeave}
              >
                <TextField
                  id="usergroup-description"
                  label="Group Description  *"
                  margin="normal"
                  fullWidth
                  value={groupdescription}
                  onChange={this.handleChange("groupdescription")}
                  error={groupdescriptionError}
                />
              </div>
            </form>
          </CardBox>
          <div className="col-lg-4" style={{ display: "grid" }}>
            <div className="jr-card ">
              <div className="jr-card-body ">
                <div className="col-md-12 col-12 mt-12">
                  <div>
                    <div className="card-body" style={{ padding: "0px" }}>
                      <h3 style={{ padding: "3px", fontSize: "23px" }}>
                        {this.state.showinfotitle != ""
                          ? this.state.showinfotitle
                          : "title"}
                      </h3>
                      <hr />
                      <p className="card-text">{this.state.showinfo} </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-success add-form-moh"
            onClick={this.handleRequestSave}
            id="add-form-moh"
          >
            Save
          </button>
          <button
            type="button"
            className="btn btn-blue close_audio"
            data-dismiss="modal"
            onClick={this.handleRequestClose}
          >
            Close
          </button>
        </div>
      </Dialog>
    );
  }
}

export default NewGroupPopUp;
