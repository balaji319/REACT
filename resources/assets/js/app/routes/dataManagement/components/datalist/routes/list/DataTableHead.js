import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';

let counter = 0;

const columnData = [
    { id: 'list_id', numeric: false, disablePadding: false, label: 'List ID' },
    { id: 'List Name   ', numeric: false, disablePadding: false, textAlign: 'left', label: 'List Name' },
    { id: 'Description ', numeric: true, disablePadding: false, label: 'Description' },
    { id: 'Active', numeric: true, disablePadding: false, textAlign: 'left', label: 'Active' },
    { id: 'List Change Date', numeric: true, disablePadding: false, textAlign: 'left', label: 'List Change Date' },
    { id: 'List Call Date', numeric: true, disablePadding: false, label: 'List Call Date' },
    { id: 'Campaign ', numeric: true, disablePadding: false, label: 'Campaign' },
    { id: 'List Rule ', numeric: true, disablePadding: false, label: 'List Rule' },
    { id: 'List Report ', numeric: false, disablePadding: false, label: 'List Report' },
    { id: 'Reset List ', numeric: false, disablePadding: false, label: 'Reset List' },
    { id: 'List Download ', numeric: false, disablePadding: false, label: 'List Download' },
    { id: 'Modify', numeric: false, disablePadding: false, label: 'Modify' },
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
        const { order, orderBy, numSelected, rowCount, inbound } = this.props;

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
                                style={{ flexDirection: 'row', textAlign: column.textAlign, color: '#040404', fontSize: '15px' }}

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


export default DataTableHead;