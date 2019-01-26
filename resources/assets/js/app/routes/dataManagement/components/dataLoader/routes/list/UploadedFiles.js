import React from 'react';
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
import Tooltip from '@material-ui/core/Tooltip';
import {Badge} from 'reactstrap';
import Dialog from '@material-ui/core/Dialog';
import SweetAlert from 'react-bootstrap-sweetalert';
import IntlMessages from '../../../../../../../util/IntlMessages';
import {Card, CardBody} from 'reactstrap';


import ContainerHeader from '../../../../../../../components/ContainerHeader/index';

import CommonView from './CommonView';
import {Alert} from 'reactstrap';

import EditForm from './EditForm';

let counter = 0;

function createData(file_name, upload_by, upload_date, file_type, file_size, total_records, processed, actions) {
    counter += 1;
    return {id: counter, file_name, upload_by, upload_date, file_type, file_size, total_records, processed, actions};
}

const columnData = [
    {id: 'file_name', numeric: false, disablePadding: true, label: 'File Name'},
    {id: 'upload_by', numeric: true, disablePadding: false, label: 'Upload By'},
    {id: 'upload_date', numeric: true, disablePadding: false, label: 'Upload Date'},
    {id: 'file_type', numeric: true, disablePadding: false, label: 'File Type'},
    {id: 'file_size', numeric: true, disablePadding: false, label: 'File Size'},
    {id: 'total_records', numeric: true, disablePadding: false, label: 'Total Records'},
    {id: 'processed', numeric: true, disablePadding: false, label: 'Processed'},
    {id: 'actions', numeric: true, disablePadding: false, label: 'Actions'},
];

class DataTableHead extends React.Component {
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
        const {order, orderBy, numSelected, rowCount} = this.props;

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


let DataTableToolbar = props => {
    const {numSelected} = props;

    return (
        <Toolbar
            className={classNames("table-header", '')}
        >
            <div className="title">
                    <Typography type="title">Report In Queue</Typography>
            </div>
            <div className="spacer"/>
            
        </Toolbar>
    );
};

DataTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
};


class DataTable extends React.Component {
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

        this.setState({data, order, orderBy});
    };
   
    handleKeyDown = (event, id) => {
        if (keycode(event) === 'space') {
            this.handleClick(event, id);
        }
    };
   
    handleChangePage = (event, page) => {
        this.setState({page});
    };
    handleChangeRowsPerPage = event => {
        this.setState({rowsPerPage: event.target.value});
    };
    isSelected = id => this.state.selected.indexOf(id) !== -1;

    constructor(props, context) {
        super(props, context);

        this.state = {
            order: 'asc',
            orderBy: 'calories',
            selected: [],
            data: [
                createData('Cupcake', 305, 3.7, 67, 4.3,3,1),
                createData('Donut', 452, 25.0, 51, 4.9, 2, 23),
                createData('Eclair', 262, 16.0, 24, 2, 23, 6.0),
                createData('Frozen yoghurt', 159, 2, 23, 6.0, 24, 4.0),
                createData('Gingerbread', 356, 16.0, 2, 23, 49, 3.9),
                createData('Honeycomb', 408, 3.2, 87, 2, 23, 6.5),
                createData('Ice cream sandwich', 237, 9.0, 2, 23, 37, 4.3),
                createData('Jelly Bean', 375, 0.0, 94, 0.0, 2, 23,),
                createData('KitKat', 518, 26.0, 65, 2, 23, 7.0),
                createData('Lollipop', 392, 0.2, 98, 0.0, 2, 23,),
                createData('Marshmallow', 2, 23, 318, 0, 81, 2.0),
                createData('Nougat', 360, 19.0, 2, 23, 9, 37.0),
                createData('Oreo', 437, 18.0, 63, 4.0, 2, 23,),
            ].sort((a, b) => (a.calories < b.calories ? -1 : 1)),
            page: 0,
            rowsPerPage: 5,
            open: false,
            warning: false,
        };
    }
    
     handleClickOpen = () => {
        this.setState({open: true});
    };

    handleRequestClose = (close) => {
        this.setState({open: close});
    };
    
    onConfirm = () => {
        this.setState({           
            warning: false,
        });
    };
    
    onCancel = () => {
        this.setState({
            custom: false,
            prompt: false
        })
    };
    
    deleteFile = () => {
        this.setState({
            warning: false
        })
    };
    onCancelDelete = () => {
        this.setState({
            warning: false
        })
    };

    render() {
        const {open, warning, data, order, orderBy, selected, rowsPerPage, page} = this.state;
        return (
                <div>
                    <Paper>
                        <CommonView/>
                        <br/>
                        <Alert className="shadow-lg" color="warning">
                            <h1>We are currently doing a system maintenance. Any list uploaded will be processed at 8AM (EST) and 5AM (PST)</h1>
                        </Alert>
                        <div className="row">
                            <div className="col-lg-12">
                                <Card className="shadow border-0 bg-default text-black">
                                    <CardBody>
                                        <DataTableToolbar numSelected={selected.length}/>
                                        <div className="flex-auto">
                                            <Paper>
                                                <div className="table-responsive-material">
                                                    <Table className="">
                                                        <DataTableHead numSelected={selected.length} order={order} orderBy={orderBy} onRequestSort={this.handleRequestSort} rowCount={data.length} />
                                                        <TableBody>
                                                            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(n => { const isSelected = this.isSelected(n.id); return (
                                                            <TableRow hover onKeyDown={event=>
                                                                this.handleKeyDown(event, n.id)} tabIndex={-1} key={n.id} selected={false} >
                                                                <TableCell padding="none">{n.file_name}</TableCell>
                                                                <TableCell numeric>{n.upload_by}</TableCell>
                                                                <TableCell numeric>{n.upload_date}</TableCell>
                                                                <TableCell numeric>{n.file_type}</TableCell>
                                                                <TableCell numeric>{n.file_size}</TableCell>
                                                                <TableCell numeric>{n.total_records}</TableCell>
                                                                <TableCell numeric>
                                                                    <Badge color="success">{n.processed}</Badge>
                                                                </TableCell>
                                                                <TableCell numeric>
                                                                    <Badge href="javascript:void(0)" color="success" onClick={()=>this.handleClickOpen()}><i className="zmdi zmdi-play-circle-outline"></i> Process</Badge>
                                                                    <Badge color="danger" className="show-pointer" onClick={()=> {this.setState({warning: true})}}><i className="zmdi zmdi-delete"></i> Delete</Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                            ); })}
                                                        </TableBody>
                                                        <TableFooter>
                                                            <TableRow>
                                                                <TablePagination count={data.length} rowsPerPage={rowsPerPage} page={page} onChangePage={this.handleChangePage} onChangeRowsPerPage={this.handleChangeRowsPerPage} />
                                                            </TableRow>
                                                        </TableFooter>
                                                    </Table>
                                                </div>
                                            </Paper>
                                        </div>
                                        <Dialog fullWidth={true} maxWidth="md" open={open} onClose={this.handleRequestClose}>
                                            <EditForm onClose={this.handleRequestClose}/>
                                        </Dialog>
                                        <SweetAlert 
                                            show={warning} 
                                            warning 
                                            showCancel 
                                            confirmBtnText={ "Yes DeleteIt"} 
                                            confirmBtnBsStyle="danger" 
                                            cancelBtnBsStyle="default" 
                                            title={ "Are You Sure?"} 
                                            onConfirm={this.deleteFile} 
                                            onCancel={this.onCancelDelete}>
                                            You will not be able to recover this imaginary file!
                                        </SweetAlert>
                                    </CardBody>
                                </Card>
                            </div>
                        </div>
                    </Paper>
                </div>
            );
        }
    }

export default DataTable;