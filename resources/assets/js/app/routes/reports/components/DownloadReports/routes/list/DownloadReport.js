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
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import "react-sweet-progress/lib/style.css";
import CircularProgress from '@material-ui/core/CircularProgress';
import Helmet from "react-helmet";

let counter = 0;

function createData(report_id, report_type, description, request_date, finish_time, requested_by, download) {
    counter += 1;
    return {id: counter, report_id, report_type, description, request_date, finish_time, requested_by, download};
}

const columnData = [
    {id: 'report_id', numeric: false, disablePadding: true, label: 'Report ID'},
    {id: 'report_type', numeric: false, disablePadding: false, label: 'Report Type'},
    {id: 'description', numeric: false, disablePadding: false, label: 'Description'},
    {id: 'request_date', numeric: false, disablePadding: false, label: 'Request Date'},
    {id: 'finish_time', numeric: false, disablePadding: false, label: 'Finish Time'},
    {id: 'requested_by', numeric: false, disablePadding: false, label: 'Requested By'},
    {id: 'download', numeric: true, disablePadding: false, label: 'Download'},
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
                    <Typography type="title">Download Report</Typography>
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
        this.setState({ page });
        this.getReportFileList(page, this.state.rowsPerPage);
    };

    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value });
        this.getReportFileList(this.state.page, event.target.value);
    };


    getReportFileList(page = 0, page_size = 25) {
        let $this = this;
        this.setState({isLoading : true});
        let current_page = page + 1;
        var token = localStorage.getItem("access_token");
        const requestOptions = {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer '+token ,
            }
        };
        axios.get('/api/get-report-file-list?page=' + current_page + '&limit=' + page_size,requestOptions).then(response => {
            console.log("Resp "+response);
            $this.setState({
                data: response.data.data.data,
                total: response.data.data.total,
                isLoading : false,
            })
        }).catch(error => {
            console.log(error);
        })
    }

    componentWillMount() {
        this.getReportFileList();
    }

    isSelected = id => this.state.selected.indexOf(id) !== -1;

    constructor(props, context) {
        super(props, context);

        this.state = {
            order: 'asc',
            orderBy: 'calories',
            selected: [],
            data: [],//.sort((a, b) => (a.calories < b.calories ? -1 : 1)),
            page: 0,
            rowsPerPage: 25,
            total: 0,
            isLoading : false,
        };
    }

    render() {
        const {isLoading,data, order, orderBy, selected, rowsPerPage, page, total} = this.state;

        return (
            <div>
                { isLoading &&
                    <Dialog open={this.state.isLoading} onClose={this.handleRequestClose}>
                        <DialogContent>
                            <div className="loader-view">
                                <CircularProgress/>
                            </div>
                        </DialogContent>
                    </Dialog>   
                }
                <Helmet>
                    <title>DownloadReport | Ytel</title>
                </Helmet>

                <DataTableToolbar numSelected={selected.length}/>
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
                                {data.map(n => {
                                    const isSelected = this.isSelected(n.id);
                                    return (
                                        <TableRow
                                            hover
                                            onKeyDown={event => this.handleKeyDown(event, n.id)}
                                            tabIndex={-1}
                                            key={n.report_file_id}
                                            selected={false}
                                        >
                                            <TableCell padding="none">{n.report_file_id}</TableCell>
                                            <TableCell >{n.report_name}</TableCell>
                                            <TableCell>{n.r_name}</TableCell>
                                            <TableCell >{n.request_datetime}</TableCell>
                                            <TableCell >{n.finish_datetime}</TableCell>
                                            <TableCell >{n.username} {n.name!=null ? n.name :""}</TableCell>
                                            <TableCell numeric>
                                                <IconButton className="size-30" onClick={this.handleCsvDownload}>
                                                    <i className="zmdi zmdi-download zmdi-hc-fw"/>
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TablePagination
                                        count={total}
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
            </div>
        );
    }
}

export default DataTable;