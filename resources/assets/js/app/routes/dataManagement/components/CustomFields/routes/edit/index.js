import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import keycode from 'keycode';
import ContainerHeader from '../../../../../../../components/ContainerHeader/index';
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
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import FilterListIcon from '@material-ui/icons/FilterList';
import Button from '@material-ui/core/Button';
import { Badge } from 'reactstrap';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import DATA from "./data";
import SweetAlert from 'react-bootstrap-sweetalert';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';

import NewCustomFields from './NewCustomFields';

let counter = 0;

const columnData = [
    { id: 'rank', numeric: false, disablePadding: false, label: 'Rank' },
    { id: 'label', numeric: false, disablePadding: false, label: 'Label' },
    { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
    { id: 'type', numeric: false, disablePadding: false, label: 'Type' },
    { id: 'cost', numeric: false, disablePadding: false, label: 'Cost' },
    { id: 'modify', numeric: true, disablePadding: false, label: 'Modify' },
    { id: 'remove', numeric: true, disablePadding: false, label: 'Remove' },
];

class EnhancedTableHead extends React.Component {
    static propTypes = {
        numSelected: PropTypes.number.isRequired,
        onRequestSort: PropTypes.func.isRequired,

        order: PropTypes.string.isRequired,
        orderBy: PropTypes.string.isRequired,
        rowCount: PropTypes.number.isRequired,
    };
    
    createSortHandler = property => event => {
        this.props.onRequestSort(event, property);
    };

    render() {
        const { order, orderBy, numSelected, rowCount } = this.props;

        return (
            <TableHead>
                <TableRow>
                    {columnData.map(column => {
                        return (
                            <TableCell
                                key={column.id}
                                numeric={column.numeric}
                                padding={column.disablePadding ? 'none' : 'default'}
                            >
                                <Tooltip
                                    title="Sort"
                                    placement={column.numeric ? 'bottom-end' : 'bottom-start'}
                                    enterDelay={300}
                                >
                                    <TableSortLabel
                                        active={orderBy === column.id}
                                        direction={order}
                                        onClick={this.createSortHandler(column.id)}
                                    >
                                        {column.label}
                                    </TableSortLabel>
                                </Tooltip>
                            </TableCell>
                        );
                    }, this)}
                </TableRow>
            </TableHead>
        );
    }
}

class Edit extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            id: this.props.location.pathname.split('/').pop(),
            order: 'asc',
            orderBy: 'calories',
            selected: [],
            data: DATA,
            page: 0,
            rowsPerPage: 5,
            time: 0,
            custom_fields_dialog: false,
            showConfirm:false,
            warning:false,
            view_fields_dialog:false,
        };        
    }

    handleRequestSort = (event, property) => {
        const orderBy = property;
        let order = 'desc';

        if (this.state.orderBy === property && this.state.order === 'desc') {
            order = 'asc';
        }

        const data =
            order === 'desc'
                ? this.state.data.sort((a, b) => (b[orderBy] < a[orderBy] ? -1 : 1))
                : this.state.data.sort((a, b) => (a[orderBy] < b[orderBy] ? -1 : 1));

        this.setState({ data, order, orderBy });
    };


    handleChangePage = (event, page) => {
        this.setState({ page });
    };
    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value });
    };

    handledOpenCustomFieldsDialog = () => {
        this.setState({ custom_fields_dialog: !this.state.custom_fields_dialog })
    }

    handledViewCustomFieldsDialog= () => {
        this.setState({ view_fields_dialog: !this.state.view_fields_dialog })
    }

    DeleteEventHandler = (id) => { this.setState({ warning: true}); };

    deleteFile = () => {
        this.setState({
            warning: false
        })
    };
    onCancelDelete = () => {
        this.setState({
            warning: false
        })
        console.log(this.state.warning)
    };

    render() {
        const { id, data, order, orderBy, selected, rowsPerPage, page, time, custom_fields_dialog,warning,view_fields_dialog} = this.state;

        return (
            <div>
                <ContainerHeader match={this.props.match} title={'List ID: ' + id + ' Records in this custom table: 6'} />

                <Dialog maxWidth="md" fullWidth={true} open={custom_fields_dialog} onClose={this.handledOpenCustomFieldsDialog}>
                    <DialogTitle>Add Custom Field</DialogTitle>
                    <Divider />
                    <DialogContent>
                        <NewCustomFields onClose={this.handledOpenCustomFieldsDialog}/>
                        
                    </DialogContent>
                </Dialog>

                <Dialog maxWidth="md" fullWidth={true} open={view_fields_dialog} onClose={this.handledViewCustomFieldsDialog}>
                    <DialogTitle>View Custom Field</DialogTitle>
                    <Divider />
                    <DialogContent>
                        <h1>Show Dynamic Custom Script Here</h1>
                        
                    </DialogContent>
                    <DialogActions>
                            <Button onClick={this.handledViewCustomFieldsDialog} variant="raised" className="jr-btn bg-grey text-white">
                                Close
                            </Button>
                        </DialogActions>
                </Dialog>

                <SweetAlert show={warning}
                            warning
                            showCancel
                            confirmBtnText={"Yes Delete It"}
                            confirmBtnBsStyle="danger"
                            cancelBtnBsStyle="default"
                            title={""}
                            onConfirm={this.deleteFile}
                            onCancel={this.onCancelDelete}                >
                    Are you sure to delete this Record ?
                </SweetAlert>
                
                <Paper>
                    <br />
                    <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12" style={{ textAlign: 'center' }}>
                            <label>SUMMARY OF FIELDS</label>
                            <Button color="primary" className="jr-btn bg-success text-white pull-right" onClick={this.handledViewCustomFieldsDialog} style={{ margin: '5px' }}>
                                View Custom Fields
                        </Button>
                            <Button color="primary" className="jr-btn bg-success text-white pull-right" onClick={this.handledOpenCustomFieldsDialog} style={{ margin: '5px' }}>
                                Add Custom Fields
                        </Button>

                        </div>
                    </div>

                    <div className="flex-auto">
                        <div className="table-responsive-material">
                            <Table>
                                <EnhancedTableHead
                                    numSelected={selected.length}
                                    order={order}
                                    orderBy={orderBy}

                                    onRequestSort={this.handleRequestSort}
                                    rowCount={data.length}
                                />
                                <TableBody>
                                    {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(n => {

                                        return (
                                            <TableRow hover key={n.field_id}>
                                                <TableCell >{n.field_rank + " - " + n.field_order}</TableCell>
                                                <TableCell >{n.field_label}</TableCell>
                                                <TableCell >{n.field_name}</TableCell>
                                                <TableCell >{n.field_type}</TableCell>
                                                <TableCell >{n.field_cost}</TableCell>
                                                <TableCell numeric>
                                                    <Tooltip title="Modify Custom Fields">
                                                        <IconButton onClick={() => this.handledOpenCustomFieldsDialog(n.field_id)}>
                                                            <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell numeric>
                                                    <Tooltip title="Delete Custom Fields">
                                                        <IconButton onClick={() => this.DeleteEventHandler(n.field_id)}>
                                                            <i className="zmdi zmdi-close " />
                                                        </IconButton>
                                                    </Tooltip>
                                                    
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TablePagination
                                            count={data.length}
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

export default Edit;