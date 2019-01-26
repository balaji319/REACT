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

class VoicemailPopUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filtername: "",
      users: [],
      listdata: [],
      combineData: []
    };
  }
  handleRequestClose = () => {
    this.props.onClose(this.props.selectedValue);
  };

  handleListItemClick = value => {
    this.props.onClose(value);
  };

  handlefilterList = event => {
    let filterData = [];
    const { users, listdata } = this.state;
    const combineData =
      listdata != "" && users != "" ? [...users, ...listdata] : [];
    const filterItems = query => {
      this.props.listdata.filter(e => {
        if (e.name.toLowerCase().indexOf(query.toLowerCase()) > -1) {
          filterData.push(e);
        }
      });
    };
    filterItems(event.target.value);
    if (filterData.length > 0) this.setState({ combineData: filterData });
    else this.setState({ combineData: filterData });
  };

  componentWillReceiveProps() {
    this.setState({ users: this.props.users, listdata: this.props.listdata });
    const { users, listdata } = this.state;
    let combineData =
      listdata != "" && users != "" ? [...users, ...listdata] : [];
    this.setState({ combineData: combineData });
  }

  render() {
    const { classes, onClose, selectedValue, ...other } = this.props;
    const { users, listdata, combineData } = this.state;

    return (
      <Dialog
        onClose={this.handleRequestClose}
        {...other}
        id="voicemail_dailog_list"
      >
        <DialogTitle>Voicemail List</DialogTitle>
        <div
          id="table-1_filter"
          className="dataTables_filter"
          style={{ textAlign: "right" }}
        >
          <label style={{ paddingRight: "11px" }}>Search:</label>
          <input
            type="search"
            value={this.state.inputValue}
            onChange={this.handlefilterList}
            className="form-control input-sm"
            style={{
              width: "250px",
              float: "right",
              marginBottom: "7px",
              marginRight: "43px"
            }}
            placeholder=""
            aria-controls="table-1"
          />
        </div>
        <DialogContent>
          <DialogContentText />
          <table className="w3-table-all">
            <thead>
              <tr
                className="w3-green"
                style={{ backgroundColor: "#055a66!important" }}
              >
                <th>Id</th>
                <th>Voice mail boxes</th>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {combineData &&
                combineData.map((user, index) => (
                  <tr key={index}>
                    <td>{index}</td>
                    <td
                      onClick={() =>
                        this.handleListItemClick(user.voicemail_id)
                      }
                    >
                      <a href="javascript: void(0)">{user.voicemail_id}</a>
                    </td>
                    <td>{user.fullname}</td>
                    <td>{user.email}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </DialogContent>

        <div />
      </Dialog>
    );
  }
}

VoicemailPopUp.propTypes = {
  onClose: PropTypes.func,
  selectedValue: PropTypes.string
};
export default VoicemailPopUp;
