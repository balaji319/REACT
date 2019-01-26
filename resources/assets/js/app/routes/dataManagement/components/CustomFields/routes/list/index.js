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
import {Badge} from 'reactstrap';
import TextField from '@material-ui/core/TextField';
import InputSlider from 'react-input-slider';
import Paper from '@material-ui/core/Paper';
import DATA  from "./data";

let counter = 0;

const columnData = [
    {id: 'list_id', numeric: false, disablePadding: false, label: 'List Id'},
    {id: 'list_name', numeric: false, disablePadding: false, label: 'List Name'},
    {id: 'active', numeric: false, disablePadding: false, label: 'Active'},
    {id: 'campaign', numeric: true, disablePadding: false, label: 'Campaign'},
    {id: 'custom_fields', numeric: true, disablePadding: false, label: 'Custom Fields'},
    {id: 'modify', numeric: true, disablePadding: false, label: 'Modify'},
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

class AudioManager extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            order: 'asc',
            orderBy: 'calories',
            selected: [],
            data: DATA,
            page: 0,
            rowsPerPage: 5,
            time:0,
        };
        console.log(this.state.data);
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

        this.setState({data, order, orderBy});
    };
    
    handleEditEventHandler = (id) => { this.props.history.push('edit/' + id) };
    
    handleChangePage = (event, page) => {
        this.setState({page});
    };
    handleChangeRowsPerPage = event => {
        this.setState({rowsPerPage: event.target.value});
    };

    render() {
        const {data, order, orderBy, selected, rowsPerPage, page,time} = this.state;

        return (
            <div>
                <ContainerHeader match={this.props.match} title={'List Custom Fields'} />
                <Paper>
                
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
                                        <TableRow hover key={n.list_id}>
                                            <TableCell >{n.list_id}</TableCell>
                                            <TableCell >{n.list_name}</TableCell>
                                            <TableCell >{n.active}</TableCell>
                                            <TableCell numeric>{n.campaign_id}</TableCell>
                                            <TableCell numeric>{n.list_count}</TableCell>
                                            <TableCell numeric>
                                                <Tooltip title="Modify List">
                                                    <IconButton onClick={() => this.handleEditEventHandler(n.list_id)}>
                                                        <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
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

export default AudioManager;