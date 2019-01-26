import React, { Component } from 'react';
import { Redirect } from 'react-router-dom'
import ContainerHeader from '../../../../../../../components/ContainerHeader/index';
import axios from 'axios';
import { connect } from 'react-redux';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import SweetAlert from 'react-bootstrap-sweetalert'
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import DATA from './data';
import Clone from '../clone/clone';
import { fetchAllAgent, updateStatusRecord, deleteRecord } from '../../../../actions/';
import DataTableHead from './DataTableHead'
let counter = 0;


class List extends React.Component {

    //pagination functions 
    handleChangePage = (event, page) => { this.setState({ page }); };
    handleChangeRowsPerPage = event => { this.setState({ rowsPerPage: event.target.value }); };

    //calss  constructor 
    constructor(props, context) {
        super(props, context);
        this.state = {
            order: 'asc',
            orderBy: 'list_id',
            selected: [],
            data: DATA,
            page: 0,
            rowsPerPage: 25,
            showAlert: false,
            alertContent: '',
            alertTitle: '',
            showConfirm: false,
            deleteScriptId: '',
            fromScriptId: '',
            newScriptId: '',
            isLoading: false,
            alertTitle: '',
            openClone: false,
            reset_list_status: false,
        };
    }
    //table sort function        
    handleRequestSort = (event, property) => {
        let temp_data = this.props.Agent.data;
        const orderBy = property;
        let order = 'desc';
        if (this.state.orderBy === property && this.state.order === 'desc') { order = 'asc'; }
        const data = order === 'desc' ? temp_data.sort((a, b) => (b[orderBy] < a[orderBy] ? -1 : 1)) : temp_data.sort((a, b) => (a[orderBy] < b[orderBy] ? -1 : 1));
        this.setState({ data, order, orderBy });
    };

    //active  switch changes   
    statusChangeHandler = (event, data) => {
        var let_this = this;
        let formData = {
            'user_id': event.target.value,
            'active': data ? 'Y' : 'N'
        };
        //setTimeout(function () { let_this.props.updateStatusRecord(formData); }, 10);
    };

    DeleteConfirmHandler = () => {
        var let_this = this;
        this.onCancelDeleteHandler();
        let formData = {
            'id': this.state.deleteInboundId
        };
        setTimeout(function () { let_this.props.deleteRecord(formData); }, 10);
    }

    DeleteDataListHandler = (id) => { this.setState({ showConfirm: true }); };
    handleEditEventHandler = (id) => { this.props.history.push('edit/' + id) };
    handleAddEventHandler = () => { this.props.history.push('add/') };
    handleListReportEventHandler = (id) => { this.props.history.push('listreport/' + id) };
    handleResetListEventHandler = (id) => {this.setState({reset_list_status: true});};
    onCancelDeleteHandler = () => { this.setState({ showConfirm: false }); };

    //alert msg 
    showAlert(status, msg) { this.setState({ alertTitle: status, alertContent: msg, showAlert: true }); };

    onCancelAlert = () => { this.setState({ showAlert: false }); };

    componentWillReceiveProps(nextPropsFromRedux) {
        this.setState({
            alertTitle: nextPropsFromRedux.Agent.alertMessageTitle,
            showAlert: nextPropsFromRedux.Agent.showMessage,
            alertContent: nextPropsFromRedux.Agent.alertMessage,
        });

    }

    componentDidMount() {
        //this.props.fetchAllAgent();
    }

    openCloneDialog = () => {
        this.setState({
            openClone: !this.state.openClone,
        })
    }

    handleListResetRequestClose = () => {
        this.setState({ reset_list_status: !this.state.reset_list_status });
    };

    render() {
        const { reset_list_status, openClone, data, order, orderBy, selected, rowsPerPage, page, showAlert, alertContent, alertTitle, showConfirm, showClonePopup, showCloneConfirm, fromScriptId, newScriptId, fromScriptIdError, newScriptIdError } = this.state;

        const { Agent } = this.props;

        const divStyle = { padding: '4px 30px 4px 24px', textAlign: 'center' };
        return (
            <div>
                <ContainerHeader match={this.props.match} title='List Listing ' />
                <SweetAlert
                    show={showConfirm}
                    warning
                    showCancel
                    confirmBtnText='Yes Delete It'
                    confirmBtnBsStyle="danger"
                    cancelBtnBsStyle="default"
                    title=''
                    onConfirm={this.DeleteConfirmHandler}
                    onCancel={this.onCancelDeleteHandler}> Are you sure to delete this Record ?
                    </SweetAlert>
                <Paper>


                    <SweetAlert show={showAlert} success={alertTitle === 'Success' ? true : false} error={alertTitle === 'Error' ? true : false} title='' onConfirm={this.onCancelAlert} onCancel={this.onCancelAlert}> {alertContent}  </SweetAlert>

                    <Dialog maxWidth="md" fullWidth={true} open={this.state.openClone} onClose={this.handleCloneClose}>
                        <DialogTitle>
                            {"Clone User Group"}
                        </DialogTitle>
                        <DialogContent>
                            <Clone closeClone={this.handleSaveCloneClose} />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.openCloneDialog} variant="raised" className="jr-btn bg-grey text-white">
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Dialog maxWidth="md" fullWidth={true} open={reset_list_status} onClose={this.handleListResetRequestClose}>
                        <DialogTitle className="bg-primary">
                            {"Confirmation"}
                        </DialogTitle>
                        <Divider />
                        <DialogContent>
                            <br />
                            <DialogContentText>
                                Are you sure to Reset Lead-Called-Status for this list?
                                </DialogContentText>
                        </DialogContent>
                        <Divider />
                        <DialogActions>
                            <Button onClick={this.handleListResetRequestClose} color="secondary">
                                Cancel
                                </Button>
                            <Button onClick={this.handleListResetRequestClose} color="primary">
                                OK
                                </Button>
                        </DialogActions>
                    </Dialog>


                    <Toolbar
                        className="table-header">
                        <div className="title">
                            <h3><i className="zmdi zmdi-view-web mr-2" />List Listing</h3>
                        </div>
                        <div className="spacer" />
                        <div className="actions">
                            <Tooltip title="Add New List">
                                <IconButton className='btn-sm' aria-label="Delete" onClick={this.handleAddEventHandler} >
                                    <i className="fa fa-plus-circle" aria-hidden="true"></i>
                                </IconButton>
                            </Tooltip>
                        </div>
                        <div className="actions">
                            <Tooltip title="Clone a List">
                                <IconButton className='btn-sm' aria-label="Delete" onClick={this.openCloneDialog} >
                                    <i className="zmdi zmdi-copy font-20" />
                                </IconButton>
                            </Tooltip>
                        </div>
                    </Toolbar>
                    <div className="flex-auto">
                        <div className="table-responsive-material">
                            <Table className="data-management-list-table"  id="data-management-list-table">
                                <DataTableHead
                                    numSelected={selected.length}
                                    order={order}
                                    orderBy={orderBy}
                                    onSelectAllClick={this.handleSelectAllClick}
                                    onRequestSort={this.handleRequestSort}
                                    rowCount={Agent.data ? Agent.data.length : 1}
                                />
                                <TableBody>

                                    {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(n => {
                                        return (
                                            <TableRow key={n.list_id} >
                                                <TableCell >{n.list_id}</TableCell>
                                                <TableCell >{n.list_name}</TableCell>
                                                <TableCell >{n.list_description}</TableCell>
                                                <TableCell className='text-center'>
                                                    <Switch value={n.list_id} onChange={this.statusChangeHandler} defaultChecked={n.active == 'Y'} ref={n.user_id} color="primary" />
                                                </TableCell>

                                                <TableCell >
                                                    {n.list_changedate}
                                                </TableCell>
                                                <TableCell className='text-center'>
                                                    {n.list_lastcalldate}
                                                </TableCell>
                                                <TableCell className='text-center'>
                                                    {n.campaign_id}
                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip title="List Report">
                                                        <IconButton onClick={() => this.handleListReportEventHandler(n.list_id)}>
                                                            <i className="fa fa-font" aria-hidden="true"></i>
                                                        </IconButton>
                                                    </Tooltip>

                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip title="List Report">
                                                        <IconButton onClick={() => this.handleListReportEventHandler(n.list_id)}>
                                                            <i className="fa fa-list" aria-hidden="true"></i>
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip title="List Report">
                                                        <IconButton onClick={() => this.handleResetListEventHandler(n.list_id)}>
                                                            <i className="fa fa-repeat" aria-hidden="true"></i>
                                                        </IconButton>
                                                    </Tooltip>

                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip title="Download">
                                                        <IconButton>
                                                            <i className="fa fa-download" aria-hidden="true"></i>
                                                        </IconButton>
                                                    </Tooltip>

                                                </TableCell>
                                                <TableCell style={divStyle} className='text-center' style={{ whiteSpace: 'nowrap' }}>
                                                    <Tooltip title="Modify List">
                                                        <IconButton onClick={() => this.handleEditEventHandler(n.list_id)}>
                                                            <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Script">
                                                        <IconButton onClick={() => this.DeleteDataListHandler(n.list_id)}>
                                                            <i className="zmdi zmdi-close " />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                    }
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TablePagination
                                            count={data ? data.length : 1}
                                            rowsPerPage={rowsPerPage}
                                            page={page}
                                            onChangePage={this.handleChangePage}
                                            onChangeRowsPerPage={this.handleChangeRowsPerPage}
                                        />
                                    </TableRow>
                                </TableFooter>
                            </Table>

                        </div>
                    </div>
                </Paper>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    console.log(state);

    return {
        Agent: state.agent

    };
}

const mapDispatchToProps = {
    fetchAllAgent,
    deleteRecord,
    updateStatusRecord
};

export default connect(mapStateToProps, mapDispatchToProps)(List);