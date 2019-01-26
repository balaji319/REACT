import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Table from '@material-ui/core/Table';
import MenuItem from '@material-ui/core/MenuItem';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';

let counter = 0;

const columnData = [
    {id: 'Shift ID', numeric: false,disablePadding: false, label: 'Shift ID'},
    {id: 'Shift Name   ', numeric: true, disablePadding: false,  textAlign:'left',  label: 'Shift Name'},
    {id: 'Shift Start', numeric: true, disablePadding: false,  textAlign:'left', label: 'Shift Length'},
    {id: 'Shift Length', numeric: true, disablePadding: false, textAlign:'left',  label: 'Shift Length'},
    {id: 'Shift Weekdays', numeric: true, disablePadding: false, textAlign:'left',  label: 'Shift Weekdays'},
    {id: 'Report Option', numeric: true, disablePadding: false,  textAlign:'left', label: 'Report Option'},
    {id: 'Admin Group ', numeric: true, disablePadding: false,  textAlign:'left', label: 'Admin Group '},
    {id: 'Modify', numeric: true, disablePadding: false,  textAlign:'center', label: 'Modify'},
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
        }
    ;
            render() {
        const {order, orderBy, numSelected, rowCount ,inbound} = this.props;

        return (
                <TableHead>
                    <TableRow>
                
                        {columnData.map(column => {
                                return (
                                                        <TableCell className={column.textAlign}
                                                                   key={column.id}
                                                                   numeric={column.numeric}
                                                                   padding={column.disablePadding ? 'none' : 'default'}
                                                                   padding={column.disablePadding ? 'none' : 'default'}
                                                                   style={{flexDirection:'row',textAlign:column.textAlign,color:'#040404',fontSize:'15px'}}

                                                                   >
                                                            <Tooltip
                                                                title={column.label}
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


        export default DataTableHead ;