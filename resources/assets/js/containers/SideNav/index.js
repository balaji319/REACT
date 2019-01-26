import React from "react";
import { Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import Drawer from "@material-ui/core/Drawer";
import { Config } from "../../constants/ThemeColors";
import SidenavContent from "./SidenavContent";
import UserInfo from "../../components/UserInfo";
import {
  COLLAPSED_DRAWER,
  FIXED_DRAWER,
  HORIZONTAL_NAVIGATION
} from "./../../constants/ActionTypes";
import { toggleCollapsedNav, updateWindowWidth } from "../../actions/Setting";

class SideNav extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  onToggleCollapsedNav = e => {
    const val = !this.props.navCollapsed;
    this.props.toggleCollapsedNav(val);
  };

  componentDidMount() {
    window.addEventListener("resize", () => {
      this.props.updateWindowWidth(window.innerWidth);
    });
  }

  render() {
    let Ytel_standard = false;
    const { navCollapsed, drawerType, width, navigationStyle } = this.props;
    let drawerStyle = drawerType.includes(FIXED_DRAWER)
      ? "d-xl-flex"
      : drawerType.includes(COLLAPSED_DRAWER)
        ? ""
        : "d-flex";
    let type = "permanent";
    if (
      drawerType.includes(COLLAPSED_DRAWER) ||
      (drawerType.includes(FIXED_DRAWER) && width < 1200)
    ) {
      type = "temporary";
    }

    if (navigationStyle === HORIZONTAL_NAVIGATION) {
      drawerStyle = "";
      type = "temporary";
      Ytel_standard = true;
    }
    return (
      <Fragment>
        {Ytel_standard ? (
          <nav
            className="ui left very thin sidebar visible"
            id="ytel-sidebar"
            style={{
              backgroundImage: "linear-gradient(0deg, #0F80F2 0%, #003366 83%)",
              width: 75
            }}
          >
            <div className="header">
              <img className="header-icon" src="images/ytel-logo.svg" />
            </div>
            <div className="items">
              <div className="item sidebarM360Icon" id="sidebarM360icon-popup">
                <i className="supple-m360 icon" />
                <img
                  src="https://portal-qa.message360.com/img/APIwhite.svg"
                  alt="Ytel API icon"
                  style={{ width: "2.9em", marginRight: "13px" }}
                />{" "}
              </div>
            </div>
          </nav>
        ) : (
          <div className={`app-sidebar d-none ${drawerStyle}`}>
            <Drawer
              className="app-sidebar-content"
              variant={type}
              open={type.includes("temporary") ? navCollapsed : true}
              onClose={this.onToggleCollapsedNav}
              classes={{
                paper: "side-nav"
              }}
            >
              <UserInfo />
              <SidenavContent />
            </Drawer>
          </div>
        )}
      </Fragment>
    );
  }
}

const mapStateToProps = ({ settings }) => {
  const { navCollapsed, drawerType, width, navigationStyle } = settings;
  return { navCollapsed, drawerType, width, navigationStyle };
};

export default withRouter(
  connect(
    mapStateToProps,
    { toggleCollapsedNav, updateWindowWidth }
  )(SideNav)
);

//<i className="supple-ytel icon" id="ytel-sidebar-logo" />
