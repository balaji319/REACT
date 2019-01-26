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

class VoicemailPopUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filtername: "",
      users: []
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

  componentWillReceiveProps() {
    this.setState({ users: this.props.users });
  }

  render() {
    const { classes, onClose, selectedValue, ...other } = this.props;
    const { users } = this.state;
    return (
      <Dialog
        onClose={this.handleRequestClose}
        {...other}
        id="voicemail_dailog_list"
      >
        <DialogTitle>Voicemail List</DialogTitle>
        <div
          id="table-1_filter"
          class="dataTables_filter"
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

            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td onClick={() => this.handleListItemClick(user.mailboxes)}>
                  <a href="javascript: void(0)">{user.mailboxes}</a>
                </td>
                <td>{user.name}</td>
                <td>{user.email}</td>
              </tr>
            ))}
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
