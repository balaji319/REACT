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
import HorizontalLabelPositionBelowStepper from "./HorizontalLabelPositionBelowStepper.js";
import Divider from "@material-ui/core/Divider";
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

class ClonePopUp extends Component {
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

  render() {
    const { classes, onClose, selectedValue, ...other } = this.props;
    const { users, listdata, combineData } = this.state;

    return (
      <Dialog
        onClose={this.handleRequestClose}
        {...other}
        id="voicemail_dailog_list"
      >
        <DialogTitle>Clone Inbound</DialogTitle>
        <Divider />
        <div
          id="table-1_filter"
          className="dataTables_filter"
          style={{ textAlign: "right" }}
        />
        <DialogContent>
          <DialogContentText />

          <HorizontalLabelPositionBelowStepper />
        </DialogContent>

        <div />
      </Dialog>
    );
  }
}

ClonePopUp.propTypes = {
  onClose: PropTypes.func,
  selectedValue: PropTypes.string
};
export default ClonePopUp;
