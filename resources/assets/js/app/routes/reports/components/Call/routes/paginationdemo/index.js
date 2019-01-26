import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import {Card, CardBody, CardSubtitle, CardText} from 'reactstrap';
import { cloneElement, Component } from 'react';
import axios from 'axios';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';

class Pagination extends React.Component {

    state = {
        data: [],
        page: 0,
        rowsPerPage: 10,
        total: 0,
        nextPageUrl: '/api/country-lists',
        prevPageUrl: '/api/country-lists',
    };

    componentWillMount() {
        this.getCountryList();
    }

    getCountryList(page = 0, page_size = 10) {
        let $this = this;

        let current_page = page + 1;
        axios.get('/api/country-lists?page=' + current_page + '&page_size=' + page_size).then(response => {
            console.log(response, response.data.data.current_page);
            $this.setState({
                data: response.data.data,
                total: response.data.total
            })
        }).catch(error => {
            console.log(error);
        })
    }

    handleChangePage = (event, page) => {
        this.setState({ page });
        this.getCountryList(page, this.state.rowsPerPage);
    };

    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value });
        this.getCountryList(this.state.page, event.target.value);
    };

    render() {
        const { data, rowsPerPage, page, total } = this.state;
        return (
            <div>       
                <Card className="shadow border-0 bg-default text-black">
                    <CardBody>
                        <div className="row">
                            <div className="col-lg-12 col-sm-12 col-12">
                                <label>MULTI-GROUP BREAKDOWN:</label>
                            </div>
                        </div>
                        <Paper>
                            <div className="table-responsive-material">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Country Code</TableCell>
                                            <TableCell>Country Name</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {this.state.data.map((n, i) => (
                                            <TableRow key={n.id}>
                                                <TableCell>{n.id}</TableCell>
                                                <TableCell>{n.country_code}</TableCell>
                                                <TableCell>{n.country_name}</TableCell>
                                            </TableRow>
                                        )
                                        )}
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
                        </Paper>
                        <br />
                        <br />
                    </CardBody>
                </Card>

            </div>
        );
    }
}


export default Pagination;