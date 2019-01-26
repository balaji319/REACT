import React, {Component} from 'react';
import ContainerHeader from '../../../../../../../components/ContainerHeader/index';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import keycode from 'keycode';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';import Tab from '@material-ui/core/Tab';
import {connect} from 'react-redux';

import DownloadReport from './DownloadReport';
import QueueReport from './QueueReport';


function TabContainer(props) {
    return (
        <div style={{padding: 20}}>
            {props.children}
        </div>
    );
}

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};


class DataList extends React.Component {
    
    constructor() {
        super();
        this.state = {            
            value: 0,
        };
    }
    
    tabHandleChange = (event, value) => {
        this.setState({value});
    };

   

    render() {
        const {value} = this.state;
        return (
                <div className="app-wrapper">
                    <div className="dashboard animated slideInUpTiny animation-duration-3">
                        <ContainerHeader match={this.props.match} title='Reports'/>
                        <AppBar className="bg-primary" position="static">
                            <Tabs value={value} onChange={this.tabHandleChange} scrollable scrollButtons="on">
                                <Tab className="tab" label="Download" />
                                <Tab className="tab" label="Report In Queue" />
                            </Tabs>
                        </AppBar>
                        <Paper>                    
                            {value === 0 &&
                                <TabContainer>
                                    <DownloadReport />
                                </TabContainer>
                            }
                            {value === 1 &&
                                <TabContainer>
                                   <QueueReport />
                                </TabContainer>
                            }                                
                        </Paper>
                    </div>
                </div>
        );
    }
}
//
//function mapStateToProps(state, ownProps) {
//    console.log(state);
//
//    return {
//        download_reports: state.download_reports
//    };
//}
//
// const mapDispatchToProps = {
//      fetchAllDownloadReports,
//      downloadCsvReports,
//    };

export default DataList;

