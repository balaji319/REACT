import React, {Component} from 'react';
import {NavLink, withRouter} from 'react-router-dom';
import Button from '@material-ui/core/Button';

import IntlMessages from '../../util/IntlMessages';
import CustomScrollbars from '../../util/CustomScrollbars';


class SidenavContent extends Component {
    componentDidMount() {
        const {history} = this.props;
        const that = this;
        const pathname = `#${history.location.pathname}`;// get current path

        const subMenuLi = document.querySelectorAll('.sub-menu > li');
        for (let i = 0; i < subMenuLi.length; i++) {
            subMenuLi[i].onclick = function (event) {
                event.stopPropagation();
            }
        }

        const menuLi = document.getElementsByClassName('menu');
        for (let i = 0; i < menuLi.length; i++) {
            menuLi[i].onclick = function (event) {
                for (let j = 0; j < menuLi.length; j++) {
                    const parentLi = that.closest(this, 'li');
                    if (menuLi[j] !== this && (parentLi === null || !parentLi.classList.contains('open'))) {
                        menuLi[j].classList.remove('open')
                    }
                }
                this.classList.toggle('open');
                event.stopPropagation();
            }
        }

        const activeLi = document.querySelector('a[href="' + pathname + '"]');// select current a element
        try {
            const activeNav = this.closest(activeLi, 'ul'); // select closest ul
            if (activeNav.classList.contains('sub-menu')) {
                this.closest(activeNav, 'li').classList.add('open');
            } else {
                this.closest(activeLi, 'li').classList.add('open');
            }
        } catch (error) {

        }
    }

    closest(el, selector) {
        try {
            let matchesFn;
            // find vendor prefix
            ['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector'].some(function (fn) {
                if (typeof document.body[fn] == 'function') {
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
        } catch (e) {

        }

        return null;
    }

    render() {
        return (
            <CustomScrollbars className=" scrollbar">
                <ul className="nav-menu">

                    <li>
                        <NavLink className="prepend-icon" to="/app/dashboard">
                             <i className="zmdi zmdi-view-dashboard zmdi-hc-fw"/>
                            <span className="nav-text">Dashboard</span>
                        </NavLink>
                    </li>
                    
                    <li className="menu collapse-box">
                        <Button href="javascript:void(0)">
                            <i className="zmdi zmdi-account zmdi-hc-fw"/>
                            <span className="nav-text">Agent</span>
                        </Button>
                        <ul className="sub-menu">
                            <li>
                                <NavLink className="prepend-icon" to="/app/agent/">
                                    <span className="nav-text">Agent</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/agent/groups">
                                    <span className="nav-text text-transform-none">Agent Group</span>
                                </NavLink>
                            </li>
                        </ul>
                    </li>


                    <li className="ui_tooltip menu">
                        <Button className="void" href="javascript:void(0)">
                            <i className="zmdi zmdi-collection-text zmdi-hc-fw"/>
                            <span className="nav-text">Campaigns</span>
                        </Button>

                        <ul className="sub-menu">
                            <li>
                                <NavLink className="prepend-icon" to="/app/campaigns/allCampaigns">
                                    <span className="nav-text">Campaign</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/campaigns/campaign-status">
                                    <span className="nav-text">Campaign Statuses</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/campaigns/campaign-list-mix">
                                    <span className="nav-text">Campaign List Mix</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/campaigns/LeadRecycle">
                                    <span className="nav-text">Lead Recycle</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/campaigns/pausecodes">
                                    <span className="nav-text">Pause Codes</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/campaigns/AreaCodes">
                                    <span className="nav-text">AC-CID</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/campaigns/CallTransferPresets">
                                    <span className="nav-text">Call Transfer Presets</span>
                                </NavLink>
                            </li>
                        </ul>
                    </li>
                    <li className="menu">
                        <Button href="javascript:void(0)">
                            <i className="zmdi fa fa-database zmdi-hc-fw"/>
                            <span className="nav-text">Data Management</span>
                        </Button>

                        <ul className="sub-menu">
                            <li>
                                <NavLink className="prepend-icon" to="/app/data-management/data-list">
                                    <span className="nav-text">Data Lists</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/data-management/advanced-list-rule">
                                    <span className="nav-text">Advcanced List Rule</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/data-management/data-loader">
                                    <span className="nav-text">Data Loader</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/data-management/data-search">
                                    <span className="nav-text">Data Search</span>
                                </NavLink>
                            </li>
                            <li className="menu">
                                <Button className="prepend-icon" href="javascript:void(0)">
                                    <span className="nav-text">Custom Fields</span>
                                </Button>

                                <ul className="sub-menu">
                                    <li>
                                        <NavLink className="prepend-icon" to="/app/data-management/list-custom-fields">
                                            <span className="nav-text">List Custom Fields</span>
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink className="prepend-icon" to="/app/data-management/copy-custom-fields">
                                            <span className="nav-text">Copy Custom Fields</span>
                                        </NavLink>
                                    </li>
                                </ul>
                            </li>
                            <li className="menu">
                                <Button className="prepend-icon" href="javascript:void(0)">
                                    <span className="nav-text">Lead Management</span>
                                </Button>

                                <ul className="sub-menu">
                                    <li>
                                        <NavLink className="prepend-icon" to="/app/data-management/basic-leads">
                                            <span className="nav-text">Basic Leads</span>
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink className="prepend-icon" to="/app/data-management/advanced-leads">
                                            <span className="nav-text">Advacned Leads</span>
                                        </NavLink>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                    
                    <li className="menu collapse-box">
                        <Button href="javascript:void(0)">
                            <i className="zmdi zmdi-phone zmdi-hc-fw"/>
                            <span className="nav-text">Inbound</span>
                        </Button>
                        <ul className="sub-menu">
                            <li>
                                <NavLink className="prepend-icon" to="/app/inbound/group">
                                    <span className="nav-text">Inbund Queues</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/inbound/number">
                                    <span className="nav-text text-transform-none">Numbers</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/inbound/callmenu">
                                    <span className="nav-text text-transform-none">Call Menu</span>
                                </NavLink>
                            </li>
                            <li className="menu">
                                <Button className="prepend-icon" href="javascript:void(0)">
                                    <span className="nav-text">Filter Phone Group</span>
                                </Button>

                                <ul className="sub-menu">
                                    <li>
                                        <NavLink className="prepend-icon" to="/app/inbound/list-fpg">
                                            <span className="nav-text">List FPG</span>
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink className="prepend-icon" to="/app/inbound/fpg">
                                            <span className="nav-text">Add-Delete FPG</span>
                                        </NavLink>
                                    </li>
                                </ul>
                            </li>

                     
                        </ul>
                    </li>
                    
                    <li className="menu collapse-box">
                        <Button href="javascript:void(0)">
                            <i className="zmdi zmdi-input-composite zmdi-hc-fw"/>
                            <span className="nav-text">Admin Utilities</span>
                        </Button>
                        <ul className="sub-menu">
                            <li>
                                <NavLink className="prepend-icon" to="/app/admin-utilities">
                                    <span className="nav-text">Scripts</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/admin-utilities/audio-list">
                                    <span className="nav-text">Audio</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/admin-utilities/voicemail-list">
                                    <span className="nav-text">Voicemail</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/admin-utilities/dnc-list">
                                    <span className="nav-text">DNC Management</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/admin-utilities/lead-filter-list">
                                    <span className="nav-text">Lead Filter List</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/admin-utilities/call-time">
                                    <span className="nav-text">Call Time</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/admin-utilities/shifts">
                                    <span className="nav-text">Shifts</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/admin-utilities/recordings">
                                    <span className="nav-text">Recordings</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/admin-utilities/ytel-management">
                                    <span className="nav-text">Ytel Management</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/admin-utilities/system-audit">
                                    <span className="nav-text">System Audit</span>
                                </NavLink>
                            </li>
                        </ul>
                    </li>
                    
                    <li className="menu collapse-box">
                        <Button href="javascript:void(0)">
                            <i className="zmdi zmdi-chart zmdi-hc-fw"/>
                            <span className="nav-text">Reports</span>
                        </Button>
                        <ul className="sub-menu">
                            {/* <li>
                                <NavLink className="prepend-icon" to="/app/reports">
                                    <span className="nav-text">Dashboard</span>
                                </NavLink>
                            </li> */}

                            <li className="menu">
                                <Button className="prepend-icon" href="javascript:void(0)">
                                    <span className="nav-text">Dashboard</span>
                                </Button>

                                <ul className="sub-menu">
                                    <li>
                                        <NavLink className="prepend-icon" to="/app/data-management/basic-leads">
                                            <span className="nav-text">Dashboard</span>
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink className="prepend-icon" to="/app/reports">
                                            <span className="nav-text">Compaign Summary</span>
                                        </NavLink>
                                    </li>
                                </ul>
                            </li>

                            <li>
                                <NavLink className="prepend-icon" to="/app/reports/download-reports">
                                    <span className="nav-text text-transform-none">Download Report</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/reports/calls">
                                    <span className="nav-text text-transform-none">Calls</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/reports/agent-reports">
                                    <span className="nav-text text-transform-none">Agent</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/reports/time-clock">
                                    <span className="nav-text text-transform-none">Time Clock</span>
                                </NavLink>
                            </li>
                        </ul>
                    </li>

                    <li className="menu no-arrow">
                        <NavLink to="/app/app-marketpace/">
                            <i className="zmdi zmdi-pages zmdi-hc-fw"/>
                            <span className="nav-text">App Marketplace</span>
                        </NavLink>
                    </li>

                    <li className="menu collapse-box">
                        <Button href="javascript:void(0)">
                            <i className="zmdi zmdi-collection-item-4 zmdi-hc-fw"/>
                            <span className="nav-text">Apps</span>
                        </Button>
                        <ul className="sub-menu">
                            <li>
                                <NavLink className="prepend-icon" to="/app/apps/">
                                    <span className="nav-text">Voice Messaging</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/apps/">
                                    <span className="nav-text text-transform-none">AMD</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/apps/">
                                    <span className="nav-text text-transform-none">Score Cards</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="prepend-icon" to="/app/apps/">
                                    <span className="nav-text text-transform-none">Mbbile-App</span>
                                </NavLink>
                            </li>
                        </ul>
                    </li>
                    
                    <li className="menu no-arrow">
                        <NavLink to="/app/ytel-documentation/">
                            <i className="zmdi fa fa-question-circle zmdi-hc-fw"/>
                            <span className="nav-text">Ytel Documentation</span>
                        </NavLink>
                    </li>
                    
                    <li className="menu no-arrow">
                        <NavLink to="/app/support-central/">
                            <i className="zmdi zmdi-pin-help zmdi-hc-fw"/>
                            <span className="nav-text">Support Central</span>
                        </NavLink>
                    </li>

                </ul>
            </CustomScrollbars>
        );
    }
}

export default withRouter(SidenavContent);
