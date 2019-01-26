import React from 'react';
import {Route, Switch, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import Header from '../components/Header/index';
import Sidebar from '../containers/SideNav/index';
import Footer from '../components/Footer';
import TopNav from '../components/TopNav';
import Error_404 from './routes/extraPages/routes/404';
import Dashboard from './routes/dashboard';
import DataManagement from './routes/dataManagement/';
import AdminUtilities from './routes/adminUtilities/';
import ColorOption from '../containers/Customizer/ColorOption';
import Inbound from './routes/inbound/';
import Agent from './routes/agent/';
import Reports from './routes/reports/';
import Campaigns from './routes/campaigns/';

import {
    ABOVE_THE_HEADER,
    BELOW_THE_HEADER,
    COLLAPSED_DRAWER,
    FIXED_DRAWER,
    HORIZONTAL_NAVIGATION
} from '../constants/ActionTypes';

import {isIOS, isMobile} from 'react-device-detect';



class App extends React.Component {

    render() {
        const {match, drawerType, navigationStyle, horizontalNavPosition} = this.props;
        const drawerStyle = drawerType.includes(FIXED_DRAWER) ? ' mini-drawer' : drawerType.includes(COLLAPSED_DRAWER) ? 'collapsible-drawer' : 'fixed-drawer';

        //set default height and overflow for iOS mobile Safari 10+ support.
        if (isIOS && isMobile) {
            document.body.classList.add('ios-mobile-view-height')
        }
        else if (document.body.classList.contains('ios-mobile-view-height')) {
            document.body.classList.remove('ios-mobile-view-height')
        }
        return (
            <div className={`app-container ${drawerStyle}`}>


                <Sidebar/>
                <div className="app-main-container">
                    <div  className={`app-header ${navigationStyle === HORIZONTAL_NAVIGATION ? 'app-header-horizontal' : ''}`} style={{minHeight: '50px'}} >
                        {(navigationStyle === HORIZONTAL_NAVIGATION && horizontalNavPosition === ABOVE_THE_HEADER) &&
                        <TopNav styleName="app-top-header"/>}
                        <Header/>
                        {(navigationStyle === HORIZONTAL_NAVIGATION && horizontalNavPosition === BELOW_THE_HEADER) &&
                        <TopNav/>}

                    </div>

                    <main className="app-main-content-wrapper" style={{height: '1020px'}}>
                        <div className="app-main-content">
                        <div className="app-wrapper">

                            <Switch>
                                <Route path={`${match.url}/dashboard`} component={Dashboard}/>
                                <Route path={`${match.url}/campaigns`} component={Campaigns}/>
                                <Route path={`${match.url}/agent/`} component={Agent}/>
                                <Route path={`${match.url}/data-management`} component={DataManagement}/>
                                <Route path={`${match.url}/admin-utilities`} component={AdminUtilities}/>
                                <Route path={`${match.url}/inbound`} component={Inbound}/>
                                <Route path={`${match.url}/reports`} component={Reports}/>
                                <Route component={Error_404}/>
                            </Switch>
                              </div>
                        </div>
                        <Footer/>
                    </main>
                </div>
                <ColorOption/>

            </div>
        );
    }
}


const mapStateToProps = ({settings}) => {
    const {drawerType, navigationStyle, horizontalNavPosition} = settings;
    return {drawerType, navigationStyle, horizontalNavPosition}
};
export default withRouter(connect(mapStateToProps)(App));