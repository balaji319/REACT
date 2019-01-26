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
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import ContainerHeader from '../../../../../../../components/ContainerHeader/index';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


import EditForm from './EditForm';



let counter = 0;

function createData(from_list_id, from_campaign_id, from_list_status, to_list_id, to_list_status, interval, active, last_exec, next_exec, lats_updated_lead_count) {
    counter += 1;
    return {id: counter, from_list_id, from_campaign_id, from_list_status, to_list_id, to_list_status, interval, active, last_exec, next_exec, lats_updated_lead_count };
}

const columnData = [
    {id: 'from_list_id', numeric: false, disablePadding: true, label: 'From List ID'},
    {id: 'from_campaign_id', numeric: false, disablePadding: true, label: 'From Campaign ID'},
    {id: 'from_list_status', numeric: false, disablePadding: true, label: 'From List Status'},
    {id: 'to_list_id', numeric: false, disablePadding: true, label: 'To List ID'},
    {id: 'to_list_status', numeric: false, disablePadding: true, label: 'To List Status'},
    {id: 'interval', numeric: false, disablePadding: true, label: 'Interval (Hour)'},
    {id: 'active', numeric: false, disablePadding: true, label: 'Active'},
    {id: 'last_exec', numeric: false, disablePadding: true, label: 'Last Exec'},
    {id: 'next_exec', numeric: false, disablePadding: true, label: 'Next Exec'},
    {id: 'lats_updated_lead_count', numeric: false, disablePadding: false, label: 'Last Updated Lead Count'},
    {id: 'actions', numeric: false, disablePadding: false, label: 'Actions'},
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
                                padding={'default'}
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
                createData(110, 2017, 23, 110, 911, 1, 'Active', '2018-07-10 09:45:02', '2018-07-10 10:45:02', 12, 'Edit delete' ),
                createData(110, 2017, 23, 110, 911, 1, 'Active', '2018-07-10 09:45:02', '2018-07-10 10:45:02', 12, 'Edit delete' ),
                createData(110, 2017, 23, 110, 911, 1, 'Active', '2018-07-10 09:45:02', '2018-07-10 10:45:02', 12, 'Edit delete' ),
                createData(110, 2017, 23, 110, 911, 1, 'Active', '2018-07-10 09:45:02', '2018-07-10 10:45:02', 12, 'Edit delete' ),
                createData(110, 2017, 23, 110, 911, 1, 'Active', '2018-07-10 09:45:02', '2018-07-10 10:45:02', 12, 'Edit delete' ),
                createData(110, 2017, 23, 110, 911, 1, 'Active', '2018-07-10 09:45:02', '2018-07-10 10:45:02', 12, 'Edit delete' ),
                createData(110, 2017, 23, 110, 911, 1, 'Active', '2018-07-10 09:45:02', '2018-07-10 10:45:02', 12, 'Edit delete' ),
                createData(110, 2017, 23, 110, 911, 1, 'Active', '2018-07-10 09:45:02', '2018-07-10 10:45:02', 12, 'Edit delete' ),
                createData(110, 2017, 23, 110, 911, 1, 'Active', '2018-07-10 09:45:02', '2018-07-10 10:45:02', 12, 'Edit delete' ),
                
            ].sort((a, b) => (a.calories < b.calories ? -1 : 1)),
            page: 0,
            rowsPerPage: 5,
            open: false,
        };
    }
    
//    Custom Functions

    handleEditScript = (id) => {
                    this.props.history.push('edit/'+id);
    };
            
    handleClickOpen = () => {
        this.setState({open: true});
    };

    handleRequestClose = (close) => {
        this.setState({open: close});
    };
    
    handleDelete = () => {
        console.log("Row Deleted");
    }
    
    handleSubmit=()=>{    
         console.log(this.state);
    } 

    render() {
        const {open, data, order, orderBy, selected, rowsPerPage, page} = this.state;

        return (
            <div>
                <ContainerHeader match={this.props.match} title='Download Report'/>
                
                 <Paper>
                <div className="flex-auto">
                    <div className="table-responsive-material">
                        <Table className="">
                            <DataTableHead
                                numSelected={selected.length}
                                order={order}
                                orderBy={orderBy}
                                onRequestSort={this.handleRequestSort}
                                rowCount={data.length}
                            />
                            <TableBody>
                                {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(n => {
                                    const isSelected = this.isSelected(n.id);
                                    return (
                                        <TableRow
                                            hover
                                            onKeyDown={event => this.handleKeyDown(event, n.id)}
                                            tabIndex={-1}
                                            key={n.id}
                                            selected={false}
                                            padding="checkbox"
                                        >
                                            <TableCell padding={'default'}>{n.from_list_id}</TableCell>
                                            <TableCell >{n.from_campaign_id}</TableCell>
                                            <TableCell >{n.from_list_status}</TableCell>
                                            <TableCell >{n.to_list_id}</TableCell>
                                            <TableCell >{n.to_list_status}</TableCell>
                                            <TableCell >{n.interval}</TableCell>
                                            <TableCell >{n.active}</TableCell>
                                            <TableCell >{n.last_exec}</TableCell>
                                            <TableCell >{n.next_exec}</TableCell>
                                            <TableCell >{n.lats_updated_lead_count}</TableCell>
                                            <TableCell >
                                                <Tooltip title="Modify">
                                                    <IconButton className="size-30" onClick={()=>this.handleClickOpen()}>
                                                        <i className="zmdi zmdi-edit font-20" />
                                                    </IconButton>     
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton className="size-30" onClick={()=>this.handleDelete(n.id)}>
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
                
               
                <Dialog fullWidth={true} maxWidth="md"  open={open} onClose={this.handleRequestClose}>                    
                        <EditForm onClose={this.handleRequestClose}/>                    
                </Dialog>
        
        </Paper>
            </div>
            
        );
    }
}

export default DataTable;