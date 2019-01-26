import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import ContainerHeader from '../../../../../../../components/ContainerHeader/index';
import CardBox from '../../../../../../../components/CardBox/index';
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

let counter = 0;

const columnData = [
    {id: '#', numeric: false, disablePadding: false, label: '#'},
    {id: 'LEAD ID', numeric: false, disablePadding: false, label: 'LEAD ID'},
    {id: 'STATUS', numeric: false, disablePadding: false, label: 'STATUS'},
    {id: 'VENDOR ID', numeric: true, disablePadding: false, label: 'VENDOR ID'},
    {id: 'EMAIL ID', numeric: false, disablePadding: false, label: 'EMAIL ID'},
    {id: 'LAST AGENT', numeric: true, disablePadding: false, label: 'LAST AGENT'},
    {id: 'LIST ID', numeric: true, disablePadding: false, label: 'LIST ID'},
    {id: 'PHONE', numeric: true, disablePadding: false, label: 'PHONE'},
    {id: 'NAME', numeric: false, disablePadding: false, label: 'NAME'},
    {id: 'CITY', numeric: false, disablePadding: false, label: 'CITY'},
    {id: 'SECURITY', numeric: false, disablePadding: false, label: 'SECURITY'},
    {id: 'LAST CALL', numeric: false, disablePadding: false, label: 'LAST CALL'},
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
            data: [],
            page: 0,
            rowsPerPage: 5,
            time:0,
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

        this.setState({data, order, orderBy});
    };
 
    
    handleChangePage = (event, page) => {
        this.setState({page});
    };
    handleChangeRowsPerPage = event => {
        this.setState({rowsPerPage: event.target.value});
    };
    isSelected = id => this.state.selected.indexOf(id) !== -1;

    handleChange1 = pos => {
        this.setState({
          x: pos.x,
          y: pos.y
        });
      };

    handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        });
    };

    render() {
        const {data, order, orderBy, selected, rowsPerPage, page,time} = this.state;

        return (
            <div>
                <ContainerHeader match={this.props.match} title={'SEARCH RESULTS'} />
                <Paper>
                <br/>
                <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12" style={{textAlign:'center'}}>
                        RESULTS : 999
                    </div>
                </div> 
                <br/>
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

                            <TableRow hover key={1}>
                                <TableCell >1</TableCell>
                                <TableCell numeric><a href="/List/modifylead/6923189" className="linkclass">6923189</a></TableCell>
                                <TableCell >Test1</TableCell>
                                <TableCell numeric>19492024997	</TableCell>
                                <TableCell>overbergb@gmail.com	</TableCell>
                                <TableCell numeric>1515</TableCell>
                                <TableCell numeric>998</TableCell>
                                <TableCell numeric>9766428669</TableCell>
                                <TableCell >Brock Overberg</TableCell>
                                <TableCell numeric></TableCell>
                                <TableCell >LBv2_Morning</TableCell>
                                <TableCell numeric>2018-07-06 23:49:42</TableCell>
                            </TableRow>
                            <TableRow hover key={2}>
                                <TableCell >1</TableCell>
                                <TableCell numeric><a href="/List/modifylead/6923189" className="linkclass">6923189</a></TableCell>
                                <TableCell >Test1</TableCell>
                                <TableCell numeric>19492024997	</TableCell>
                                <TableCell>overbergb@gmail.com	</TableCell>
                                <TableCell numeric>1515</TableCell>
                                <TableCell numeric>998</TableCell>
                                <TableCell numeric>9766428669</TableCell>
                                <TableCell >Brock Overberg</TableCell>
                                <TableCell numeric></TableCell>
                                <TableCell >LBv2_Morning</TableCell>
                                <TableCell numeric>2018-07-06 23:49:42</TableCell>
                            </TableRow>
                            <TableRow hover key={3}>
                                <TableCell >1</TableCell>
                                <TableCell numeric><a href="/List/modifylead/6923189" className="linkclass">6923189</a></TableCell>
                                <TableCell >Test1</TableCell>
                                <TableCell numeric>19492024997	</TableCell>
                                <TableCell>overbergb@gmail.com	</TableCell>
                                <TableCell numeric>1515</TableCell>
                                <TableCell numeric>998</TableCell>
                                <TableCell numeric>9766428669</TableCell>
                                <TableCell >Brock Overberg</TableCell>
                                <TableCell numeric></TableCell>
                                <TableCell >LBv2_Morning</TableCell>
                                <TableCell numeric>2018-07-06 23:49:42</TableCell>
                            </TableRow>
                            <TableRow hover key={4}>
                                <TableCell >1</TableCell>
                                <TableCell numeric><a href="/List/modifylead/6923189" className="linkclass">6923189</a></TableCell>
                                <TableCell >Test1</TableCell>
                                <TableCell numeric>19492024997	</TableCell>
                                <TableCell>overbergb@gmail.com	</TableCell>
                                <TableCell numeric>1515</TableCell>
                                <TableCell numeric>998</TableCell>
                                <TableCell numeric>9766428669</TableCell>
                                <TableCell >Brock Overberg</TableCell>
                                <TableCell numeric></TableCell>
                                <TableCell >LBv2_Morning</TableCell>
                                <TableCell numeric>2018-07-06 23:49:42</TableCell>
                            </TableRow>
                            
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