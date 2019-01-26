import React, { Component } from "react";
import { NavLink, withRouter } from "react-router-dom";

import IntlMessages from "../../util/IntlMessages";

class Menu extends Component {
  componentDidMount() {
    const { history } = this.props;

    const pathname = `#${history.location.pathname}`; // get current path
    const mainMenu = document.getElementsByClassName("nav-item");
    for (let i = 0; i < mainMenu.length; i++) {
      mainMenu[i].onclick = function() {
        for (let j = 0; j < mainMenu.length; j++) {
          if (mainMenu[j].classList.contains("active")) {
            mainMenu[j].classList.remove("active");
          }
        }
        this.classList.toggle("active");
      };
    }
    const subMenuLi = document.getElementsByClassName("nav-arrow");
    for (let i = 0; i < subMenuLi.length; i++) {
      subMenuLi[i].onclick = function() {
        for (let j = 0; j < subMenuLi.length; j++) {
          if (subMenuLi[j].classList.contains("active")) {
            subMenuLi[j].classList.remove("active");
          }
        }
        this.classList.toggle("active");
      };
    }
    const activeLi = document.querySelector('a[href="' + pathname + '"]'); // select current a element
    try {
      const activeNav = this.closest(activeLi, "ul"); // select closest ul
      if (activeNav.classList.contains("sub-menu")) {
        this.closest(activeNav, "li").classList.add("active");
      } else {
        this.closest(activeLi, "li").classList.add("active");
      }
      const parentNav = this.closest(activeNav, ".nav-item");
      if (parentNav) {
        parentNav.classList.add("active");
      }
    } catch (e) {}
  }

  closest(el, selector) {
    try {
      let matchesFn;
      // find vendor prefix
      [
        "matches",
        "webkitMatchesSelector",
        "mozMatchesSelector",
        "msMatchesSelector",
        "oMatchesSelector"
      ].some(function(fn) {
        if (typeof document.body[fn] == "function") {
          matchesFn = fn;
          return true;
        }
        return false;
      });

      let parent;

      // traverse parents
      while (el) {
        parent = el.parentElement;
        if (parent && parent[matchesFn](selector)) {
          return parent;
        }
        el = parent;
      }
    } catch (e) {}

    return null;
  }

  render() {
    return (
      <div className="app-main-menu d-none d-md-block">
        <ul className="navbar-nav navbar-nav-mega">
          <li className="nav-item">
            <NavLink className="prepend-icon" to="/app/dashboard">
              <i className="zmdi zmdi-view-dashboard zmdi-hc-fw" />
              <span className="nav-text">Dashboard</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <a href="javascript:void(0)">
              <IntlMessages id="sidebar.components" />
              &nbsp;
              <i className="fa fa-angle-down" />
            </a>
            <ul className="sub-menu">
              <li>
                <NavLink to="/app/agent">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    <span className="nav-text">Agent</span>
                  </span>
                </NavLink>
              </li>

              <li>
                <NavLink to="/app/agent/groups/list">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    <span className="nav-text">Agent Group</span>
                  </span>
                </NavLink>
              </li>
            </ul>
          </li>

          <li className="nav-item">
            <a href="javascript:void(0)">
              <IntlMessages id="sidebar.extensions" />
              &nbsp;
              <i className="fa fa-angle-down" />
            </a>
            <ul className="sub-menu">
              <li>
                <NavLink to="/app/campaigns/allCampaigns">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text">Campaign</span>
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/app/campaigns/campaign-status">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    <span className="nav-text">Campaign Statuses</span>
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/app/campaigns/campaign-list-mix">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    <span className="nav-text">Campaign List Mix</span>
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/app/campaigns/LeadRecycle">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    <span className="nav-text">Lead Recycle</span>{" "}
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/app/campaigns/pausecodes">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text">Pause Codes</span>
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/app/campaigns/AreaCodes">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text">AC-CID</span>
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/app/campaigns/CallTransferPresets">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text">Call Transfer Presets</span>
                  </span>
                </NavLink>
                agent/groups/list
              </li>
            </ul>
          </li>

          <li className="nav-item">
            <a href="javascript:void(0)">
              <IntlMessages id="sidebar.modules" />
              &nbsp;
              <i className="fa fa-angle-down" />
            </a>
            <ul className="sub-menu">
              <li>
                <NavLink to="/app/data-management/data-list">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text">Data Lists</span>
                  </span>
                </NavLink>
              </li>

              <li>
                <NavLink to="/app/data-management/advanced-list-rule">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    <span className="nav-text">Advcanced List Rule</span>
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/app/data-management/data-loader">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text">Data Loader</span>
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/app/data-management/data-search">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text">Data Search</span>
                  </span>
                </NavLink>
              </li>
              <li className="nav-arrow">
                <a role="button" href="javascript:void(0)">
                  <i className="zmdi zmdi-code-setting zmdi-hc-fw" />
                  <span className="nav-text">
                    <span className="nav-text">Custom Fields</span>
                  </span>
                </a>

                <ul className="sub-menu">
                  <li>
                    <NavLink
                      className="prepend-icon"
                      to="/app/data-management/list-custom-fields"
                    >
                      <span className="nav-text">
                        {" "}
                        <span className="nav-text">List Custom Fields</span>
                      </span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      className="prepend-icon"
                      to="/app/data-management/copy-custom-fields"
                    >
                      <span className="nav-text">
                        {" "}
                        <span className="nav-text">Copy Custom Fields</span>
                      </span>
                    </NavLink>
                  </li>
                </ul>
              </li>
              <li className="nav-arrow">
                <a role="button" href="javascript:void(0)">
                  <i className="zmdi zmdi-code-setting zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text">Lead Management</span>
                  </span>
                </a>

                <ul className="sub-menu">
                  <li>
                    <NavLink
                      className="prepend-icon"
                      to="/app/data-management/basic-leads"
                    >
                      <span className="nav-text">
                        {" "}
                        <span className="nav-text">Basic Leads</span>
                      </span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      className="prepend-icon"
                      to="/app/data-management/advanced-leads"
                    >
                      <span className="nav-text">
                        {" "}
                        <span className="nav-text">Advacned Leads</span>{" "}
                      </span>
                    </NavLink>
                  </li>
                </ul>
              </li>
            </ul>
          </li>

          <li className="nav-item">
            <a href="javascript:void(0)">
              <span className="nav-text">
                Inbound &nbsp;
                <i className="fa fa-angle-down" />
              </span>
            </a>
            <ul className="sub-menu">
              <li>
                <NavLink to="/app/inbound/group">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text">Inbound Queues</span>
                  </span>
                </NavLink>
              </li>

              <li>
                <NavLink to="/app/inbound/number">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text text-transform-none">
                      Numbers
                    </span>
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/app/inbound/callmenu/list">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text text-transform-none">
                      Call Menu
                    </span>{" "}
                  </span>
                </NavLink>
              </li>
              <li className="nav-arrow">
                <a role="button" href="javascript:void(0)">
                  <i className="zmdi zmdi-code-setting zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text">Filter Phone Group</span>{" "}
                  </span>
                </a>

                <ul className="sub-menu">
                  <li>
                    <NavLink
                      className="prepend-icon"
                      to="/app/inbound/list-fpg"
                    >
                      <span className="nav-text">
                        {" "}
                        <span className="nav-text">List FPG</span>{" "}
                      </span>
                    </NavLink>
                    r
                  </li>
                  <li>
                    <NavLink className="prepend-icon" to="/app/inbound/fpg">
                      <span className="nav-text">
                        {" "}
                        <span className="nav-text">Add-Delete FPG</span>{" "}
                      </span>
                    </NavLink>
                  </li>
                </ul>
              </li>
            </ul>
          </li>

          <li className="nav-item">
            <a href="javascript:void(0)">
              <IntlMessages id="sidebar.extras" />
              &nbsp;
              <i className="fa fa-angle-down" />
            </a>
            <ul className="sub-menu">
              

              <li className="nav-arrow">
                <a role="button" href="javascript:void(0)">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text">Dashboard</span>{" "}
                  </span>
                </a>

                <ul className="sub-menu">
                  <li>
                    <NavLink
                      className="prepend-icon"
                      to="/app/dashboard"
                    >
                      <span className="nav-text">
                        {" "}
                        <span className="nav-text">Real Time</span>{" "}
                      </span>
                    </NavLink>
                    r
                  </li>
                  <li>
                    <NavLink className="prepend-icon" to="/app/reports">
                      <span className="nav-text">
                        {" "}
                        <span className="nav-text">Campaign Summary</span>{" "}
                      </span>
                    </NavLink>
                  </li>
                </ul>
              </li>

              <li>
                <NavLink to="/app/reports/download-reports">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text text-transform-none">
                      Download Report
                    </span>
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/app/reports/calls">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    <span className="nav-text text-transform-none">Calls</span>
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/app/reports/agent-reports">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text text-transform-none">Agent</span>
                  </span>
                </NavLink>
              </li>

              <li>
                <NavLink to="/app/reports/time-clock">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text text-transform-none">
                      Time Clock
                    </span>
                  </span>
                </NavLink>
              </li>
            </ul>
          </li>

          <li className="nav-item">
            <a href="javascript:void(0)">
              {" "}
              <span className="nav-text">
                Admin Utilities &nbsp;
                <i className="fa fa-angle-down" />
              </span>
            </a>
            <ul className="sub-menu">
              <li>
                <NavLink to="/app/admin-utilities">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text">Scripts</span>{" "}
                  </span>
                </NavLink>
              </li>

              <li>
                <NavLink to="/app/admin-utilities/audio-list">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text">Audio</span>{" "}
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/app/admin-utilities/voicemail-list">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text">Voicemail</span>{" "}
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/app/admin-utilities/dnc-list">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text">DNC Management</span>{" "}
                  </span>
                </NavLink>
              </li>

              <li>
                <NavLink to="/app/admin-utilities/lead-filter-list">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text">Lead Filter List</span>
                  </span>
                </NavLink>
              </li>

              <li>
                <NavLink to="/app/admin-utilities/call-time">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text">Call Time</span>{" "}
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/app/admin-utilities/shifts">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text">Shifts</span>
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/app/admin-utilities/recordings">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text">Recordings</span>
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/app/admin-utilities/ytel-management">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text">Ytel Management</span>{" "}
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/app/admin-utilities/system-audit">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text">System Audit</span>{" "}
                  </span>
                </NavLink>
              </li>
            </ul>
          </li>

          {/* <li className="nav-item">
            <NavLink className="prepend-icon" to="/app/app-marketpace/">
              <i className="zmdi zmdi-view-dashboard zmdi-hc-fw" />
              <span className="nav-text">App Marketplace</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <a href="javascript:void(0)">
              {" "}
              <span className="nav-text">
                Apps &nbsp;<i className="fa fa-angle-down" />{" "}
              </span>
            </a>
            <ul className="sub-menu">
              <li>
                <NavLink to="/app/apps/">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text">Voice Messaging</span>{" "}
                  </span>
                </NavLink>
              </li>

              <li>
                <NavLink to="/app/apps/">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text text-transform-none">AMD</span>
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/app/apps/">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text text-transform-none">
                      Score Cards
                    </span>{" "}
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/app/apps/">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span className="nav-text">
                    {" "}
                    <span className="nav-text text-transform-none">
                      Mbbile-App
                    </span>{" "}
                  </span>
                </NavLink>
              </li>
            </ul>
          </li>

          <li className="nav-item">
            <NavLink className="prepend-icon" to="/app/ytel-documentation/">
              <i className="zmdi zmdi-view-dashboard zmdi-hc-fw" />
              <span className="nav-text">Ytel Documentation</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink className="prepend-icon" to="/app/support-central/">
              <i className="zmdi zmdi-view-dashboard zmdi-hc-fw" />
              <span className="nav-text">Support Central</span>
            </NavLink>
          </li> */}
        </ul>
      </div>
    );
  }
}

export default withRouter(Menu);
