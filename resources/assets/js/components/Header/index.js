import React from "react";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import axios from "axios";
import AppBar from "@material-ui/core/AppBar";
import Avatar from "@material-ui/core/Avatar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import { userSignOut } from "../../actions/Auth";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import { Dropdown, DropdownMenu, DropdownToggle } from "reactstrap";
import MenuItem from "@material-ui/core/MenuItem";
import LockOn from "../common/lockOn";

import {
  BELOW_THE_HEADER,
  COLLAPSED_DRAWER,
  FIXED_DRAWER,
  HORIZONTAL_NAVIGATION,
  INSIDE_THE_HEADER,
  API_SWICH_DB_GLOBEL
} from "../../constants/ActionTypes";
import SearchBox from "../SearchBox";
import MailNotification from "../MailNotification/index";
import AppNotification from "../AppNotification/index";
import {
  switchLanguage,
  toggleCollapsedNav,
  showNav
} from "../../actions/Setting";
import IntlMessages from "../../util/IntlMessages";
import LanguageSwitcher from "../LanguageSwitcher/index";
import Menu from "../TopNav/Menu";
import UserInfoPopup from "../UserInfo/UserInfoPopup";
import CustomScrollbars from "../../util/CustomScrollbars";
class Header extends React.Component {
  onAppNotificationSelect = () => {
    this.setState({
      appNotification: !this.state.appNotification
    });
  };
  onMailNotificationSelect = () => {
    this.setState({
      mailNotification: !this.state.mailNotification
    });
  };
  onLangSwitcherSelect = event => {
    this.setState({
      langSwitcher: !this.state.langSwitcher,
      anchorEl: event.currentTarget
    });
  };
  onSearchBoxSelect = () => {
    this.setState({
      searchBox: !this.state.searchBox
    });
  };
  onUserInfoSelect = () => {
    this.setState({
      userInfo: !this.state.userInfo
    });
  };
  handleRequestClose = () => {
    this.setState({
      langSwitcher: false,
      userInfo: false,
      mailNotification: false,
      appNotification: false,
      searchBox: false
    });
  };

  constructor() {
    super();
    this.state = {
      anchorEl: undefined,
      searchBox: false,
      searchText: "",
      mailNotification: false,
      userInfo: false,
      langSwitcher: false,
      appNotification: false,
      userDbDetails: [],
      userDbDetailslength: 0,
      selectedDB: [],
      is_load: false
    };
  }

  componentDidMount() {
    var dbDetails = JSON.parse(localStorage.getItem("db_details"));

    var db_last_used = JSON.parse(localStorage.getItem("db_last_used"));

    if (db_last_used != "") {
      var retailCompanies = dbDetails.filter(
        record => record.db_id == db_last_used
      );
      localStorage.setItem("selected_db", JSON.stringify(retailCompanies[0]));
      //localStorage.setItem("db_last_used", JSON.stringify(retailCompanies[0].));
    }
    console.log(HORIZONTAL_NAVIGATION);
    console.log("AAAAAAAAAAAAAAA");

    var selected_db = JSON.parse(localStorage.getItem("selected_db"));

    if (selected_db) {
      console.log(selected_db);
      this.setState({
        selectedDB: selected_db,
        userDbDetails: dbDetails
      });
      console.log("----------------------");
      console.log(this.state.userDbDetails);
      console.log("----------------------");
    } else {
      if (Array.isArray(dbDetails)) {
        var selected = [];
        for (let i = 0; i < dbDetails.length; i++) {
          if (i == 0) {
            selected = dbDetails[i];
          }
        }

        localStorage.setItem("selected_db", JSON.stringify(selected));
        localStorage.setItem("db_last_used", selected.db_id);
        this.setState({
          selectedDB: selected,
          userDbDetails: dbDetails,
          userDbDetailslength: dbDetails.length
        });
      }
    }
  }

  // make  ajax calls
  updateDbApiHandler = evt => {
    let selected_db = JSON.parse(localStorage.getItem("selected_db"));
    if (evt) {
      let data = {
        db_id: selected_db.db_id,
        company_id: selected_db.company_id
      };

      this.setState({ is_load: true });

      axios
        .post(API_SWICH_DB_GLOBEL, data)
        .then(response => {
          // let group = response.data.group;
          this.setState({ is_load: false });
          location.reload();
        })
        .catch(error => {
          //let flag = 0;
          this.setState({ is_load: false });
          //this.setState({error_msg_user:error.response.data.msg.user,error_msg:true,error_msg_pass:error.response.data.msg.pass})
        });
    }
  };

  // update dropdown values
  updateDbHandler = evt => {
    if (evt) {
      var selected_db = JSON.parse(evt.target.getAttribute("data-obj"));

      this.setState({
        selectedDB: selected_db
      });
      localStorage.setItem("selected_db", JSON.stringify(selected_db));
      localStorage.setItem("db_last_used", selected_db.db_id);

      this.updateDbApiHandler("yes");
    }
  };

  onToggleCollapsedNav = e => {
    const val = !this.props.navCollapsed;
    this.props.toggleCollapsedNav(val);
  };

  onShowNav = e => {
    this.props.showNav();
  };

  updateSearchText(evt) {
    this.setState({
      searchText: evt.target.value
    });
  }

  render() {
    const {
      drawerType,
      locale,
      navigationStyle,
      horizontalNavPosition
    } = this.props;
    const { is_load } = this.state;

    const drawerStyle = drawerType.includes(FIXED_DRAWER)
      ? "d-block d-xl-none"
      : drawerType.includes(COLLAPSED_DRAWER)
        ? "d-block"
        : "d-none";
    let userDbDetails = this.state.userDbDetails;
    let selectedDB = this.state.selectedDB;
    console.log("selectedDB");
    console.log(selectedDB);
    let optionItems = userDbDetails.map(record => (
      <li className="pointer" key={record.db_id}>
        <div className="d-flex align-items-center" key={record.db_id}>
          <h4
            key={record.db_id}
            data-dns={record.application_dns}
            style={{ color: selectedDB.db_id == record.db_id ? "green" : "" }}
            data-obj={JSON.stringify(record)}
            data-id={record.db_id}
            onClick={this.updateDbHandler}
          >
            {record.db_description}
          </h4>
        </div>
      </li>
    ));

    return (
      <AppBar
        className={`app-main-header ${
          navigationStyle === HORIZONTAL_NAVIGATION &&
          horizontalNavPosition === BELOW_THE_HEADER
            ? "app-main-header-top"
            : ""
        }`}
      >
        {is_load ? <LockOn /> : ""}

        <Toolbar className="app-toolbar" disableGutters={false}>
          {navigationStyle === HORIZONTAL_NAVIGATION ? (
            <div
              className="d-block d-md-none pointer mr-3"
              onClick={this.onToggleCollapsedNav}
            >
              <span className="jr-menu-icon">
                <span className="menu-icon" />
              </span>
            </div>
          ) : (
            <IconButton
              className={`jr-menu-icon mr-3 ${drawerStyle}`}
              aria-label="Menu"
              onClick={this.onToggleCollapsedNav}
            >
              <span className="menu-icon" />
            </IconButton>
          )}

          {navigationStyle != HORIZONTAL_NAVIGATION && (
            <Link className="app-logo mr-2 d-none d-sm-block" to="/">
              <img
                className="head-icon"
                src="images/ytel-logo.svg"
                alt="Jambo"
                title="Jambo"
              />
            </Link>
          )}
          {navigationStyle === HORIZONTAL_NAVIGATION &&
            horizontalNavPosition === INSIDE_THE_HEADER && <Menu />}
          <ul className="header-notifications list-inline ml-auto">
            <li className="list-inline-item" onClick={this.onShowNav}>
              <i
                className="fa fa-cog fa-1x"
                style={{ paddingTop: "10px", cursor: "pointer" }}
              />
            </li>
            <li className="list-inline-item">
              <Dropdown
                className="quick-menu"
                isOpen={this.state.langSwitcher}
                toggle={this.onLangSwitcherSelect.bind(this)}
              >
                <DropdownToggle
                  className="d-inline-block"
                  tag="span"
                  data-toggle="dropdown"
                >
                  <div className="d-flex align-items-center pointer pt-1">
                    <i className="zmdi zmdi-cloud zmdi-hc-fw mr-1" />{" "}
                    {selectedDB.db_description}
                  </div>
                </DropdownToggle>

                <DropdownMenu>
                  <ul className="list-unstyled ">{optionItems}</ul>
                </DropdownMenu>
              </Dropdown>
            </li>
            {navigationStyle === HORIZONTAL_NAVIGATION && (
              <li className="list-inline-item user-nav">
                <Dropdown
                  className="quick-menu"
                  isOpen={this.state.userInfo}
                  toggle={this.onUserInfoSelect.bind(this)}
                >
                  <DropdownToggle
                    className="d-inline-block"
                    tag="span"
                    data-toggle="dropdown"
                  >
                    <IconButton className="icon-btn size-30">
                      <Avatar
                        alt="..."
                        src="images/userAvatar/domnic-harris.jpg"
                        className="size-30"
                      />
                    </IconButton>
                  </DropdownToggle>

                  <DropdownMenu right>
                    <UserInfoPopup />
                  </DropdownMenu>
                </Dropdown>
              </li>
            )}

            <li className="list-inline-item">
              <a
                className="text-white"
                href="javascript:void(0)"
                onClick={() => {
                  this.handleRequestClose();
                  this.props.userSignOut();
                }}
              >
                <i className="zmdi zmdi-sign-in zmdi-hc-fw" /> Logout
              </a>
            </li>
          </ul>
        </Toolbar>
      </AppBar>
    );
  }
}

const mapStateToProps = ({ settings }) => {
  const {
    drawerType,
    locale,
    navigationStyle,
    horizontalNavPosition
  } = settings;
  return { drawerType, locale, navigationStyle, horizontalNavPosition };
};

export default withRouter(
  connect(
    mapStateToProps,
    { toggleCollapsedNav, showNav, switchLanguage, userSignOut }
  )(Header)
);
