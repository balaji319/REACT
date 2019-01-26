import React from "react";
import { connect } from "react-redux";
import { userSignOut } from "../../actions/Auth";
import IntlMessages from "../../util/IntlMessages";

class UserInfoPopup extends React.Component {
  state = {
    user_name: ""
  };

  componentDidMount() {
    var user_id = localStorage.getItem("user_id");
    this.setState({
      user_name: user_id
    });
  }
  render() {
    return (
      <div>
        <div className="user-profile">
          <img
            className="user-avatar border-0 size-40 rounded-circle"
            src=" images/userAvatar/domnic-harris.jpg"
            alt="User"
          />
          <div className="user-detail ml-2">
            <h4 className="user-name mb-0">{this.state.user_name}</h4>
            <small>Administrator</small>
          </div>
        </div>
        <a className="dropdown-item text-muted" href="javascript:void(0)">
          <i className="zmdi zmdi-face zmdi-hc-fw mr-1" />
          <IntlMessages id="popup.profile" />
        </a>
        <a className="dropdown-item text-muted" href="javascript:void(0)">
          <i className="zmdi zmdi-settings zmdi-hc-fw mr-1" />
          <IntlMessages id="popup.setting" />
        </a>
        <a
          className="dropdown-item text-muted"
          href="javascript:void(0)"
          onClick={() => {
            console.log("Try to logoput");
            this.props.userSignOut();
          }}
        >
          <i className="zmdi zmdi-sign-in zmdi-hc-fw mr-1" />
          <IntlMessages id="popup.logout" />
        </a>
      </div>
    );
  }
}

export default connect(
  null,
  { userSignOut }
)(UserInfoPopup);
