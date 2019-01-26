import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import InfoCard from '../../../../../../../components/InfoCard';
import ContainerHeader from '../../../../../../../components/ContainerHeader/index';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import { Card, CardBody, CardSubtitle, CardText } from 'reactstrap';
import Button from '@material-ui/core/Button';
import TableFooter from '@material-ui/core/TableFooter';
import moment from 'moment';
import { DatePicker } from 'material-ui-pickers';

import { UncontrolledAlert } from 'reactstrap';


class ListReport extends React.Component {
    constructor(props) {
        super(props);
        var ts = new Date();
        this.state = {
            id: this.props.location.pathname.split('/').pop(),
            from: moment(new Date()).format('YYYY-MM-DD'),
            to: moment(new Date()).format('YYYY-MM-DD'),
            page: 0,
            rowsPerPage: 25,
            total: 2,
        };
    }

    handleSubmit = () => {
        const { from, to } = this.state;
        const data = {
            from: from,
            to: to,
        }
        console.log(data);
    }


    handleFromDateChange = (date) => {
        this.setState({ from: moment(date).format('YYYY-MM-DD') });
    };
    handleToDateChange = (date) => {
        this.setState({ to: moment(date).format('YYYY-MM-DD') });
    };

    handledOpenAudioManagerDialog = () => {
        this.setState({ audio_dialog: !this.state.audio_dialog })
    }

    handleChangePage = (event, page) => { this.setState({ page }); };
    handleChangeRowsPerPage = event => { this.setState({ rowsPerPage: event.target.value }); };

    render() {
        const { from, to, id, total, rowsPerPage, page } = this.state;
        return (
            <div>
                <ContainerHeader match={this.props.match} title={'List Report : ' + id} />

                <Card className="shadow border-0 bg-default text-black">
                    <CardBody>
                        <div className="row">

                            <div className="col-lg-12 col-sm-12 col-12">
                                <UncontrolledAlert className="bg-light text-black shadow-lg">
                                    Dialable statuses are defined at the campaign level in which this list belongs. If a list is reset, leads will be filtered against the campaign settings, Dialable Statuses and Call Count Limit, and totaled in the Dialable column. NOTE: this stat does not take into consideration any filters, list mix, or call time restrictions set.
                                </UncontrolledAlert>
                            </div>
                            <div className="col-lg-6 col-sm-12 col-12" style={{ textAlign: 'center' }}>

                                <FormControl className="w-100 mb-2">
                                    <FormHelperText>From</FormHelperText>
                                    <DatePicker
                                        fullWidth
                                        value={from}
                                        format='YYYY-MM-DD'
                                        onChange={this.handleFromDateChange}
                                        animateYearScrolling={false}
                                        leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                                        rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                                    />
                                </FormControl>

                                <FormControl className="w-100 mb-2">
                                    <FormHelperText>To</FormHelperText>
                                    <DatePicker
                                        fullWidth
                                        value={to}
                                        format='YYYY-MM-DD'
                                        onChange={this.handleToDateChange}
                                        animateYearScrolling={false}
                                        leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                                        rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                                    />
                                </FormControl>
                                <Button color="primary" className="jr-btn bg-success text-white" onClick={this.handleSubmit}>Filter</Button>
                                <Button color="primary" className="jr-btn bg-success text-white" onClick={this.handleSubmit}>List Download</Button>


                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12 col-sm-12 col-12" style={{ textAlign: 'center' }}>
                                <h4>STATUSES WITHIN THIS LIST:</h4>
                            </div>
                        </div>

                        <Paper>
                            <div className="table-responsive-material">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>STATUS</TableCell>
                                            <TableCell>STATUS NAME	</TableCell>
                                            <TableCell>TOTAL LEADS	</TableCell>
                                            <TableCell>CALLED SINCE LAST RESET	</TableCell>
                                            <TableCell>NOT CALLED SINCE LAST RESET	</TableCell>
                                            <TableCell>DIALABLE</TableCell>
                                            <TableCell>CALL COUNT LIMIT</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow key={1}>
                                            <TableCell>NEW</TableCell>
                                            <TableCell>New Lead	</TableCell>
                                            <TableCell>14</TableCell>
                                            <TableCell>0</TableCell>
                                            <TableCell>14</TableCell>
                                            <TableCell>14</TableCell>
                                            <TableCell>0</TableCell>
                                        </TableRow>
                                        <TableRow key={2}>
                                            <TableCell>NEW</TableCell>
                                            <TableCell>New Lead	</TableCell>
                                            <TableCell>14</TableCell>
                                            <TableCell>0</TableCell>
                                            <TableCell>14</TableCell>
                                            <TableCell>14</TableCell>
                                            <TableCell>0</TableCell>
                                        </TableRow>
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

                        <div className="row">
                            <div className="col-lg-12 col-sm-12 col-12" style={{ textAlign: 'center' }}>
                                <h4>TIME ZONES WITHIN THIS LIST:</h4>
                            </div>
                        </div>

                        <Paper>
                            <div className="table-responsive-material">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>GMT OFFSET NOW	</TableCell>
                                            <TableCell>TOTAL	</TableCell>
                                            <TableCell>DIALABLE	</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow key={1}>
                                            <TableCell>-7.00 (Wed 11 Jul 2018 12:52)</TableCell>
                                            <TableCell>8</TableCell>
                                            <TableCell>8</TableCell>
                                        </TableRow>
                                        <TableRow key={2}>
                                            <TableCell>-6.00 (Wed 11 Jul 2018 13:52)	</TableCell>
                                            <TableCell>1</TableCell>
                                            <TableCell>1</TableCell>
                                        </TableRow>
                                        <TableRow key={3}>
                                            <TableCell>-5.00 (Wed 11 Jul 2018 14:52)	</TableCell>
                                            <TableCell>1</TableCell>
                                            <TableCell>1</TableCell>
                                        </TableRow>
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
                        <div className="row">
                            <div className="col-lg-12 col-sm-12 col-12" style={{ textAlign: 'center' }}>
                                <h4>CALLED COUNTS WITHIN THIS LIST:</h4>
                            </div>
                        </div>

                        <Paper>
                            <div className="table-responsive-material">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>STATUS	</TableCell>
                                            <TableCell>STATUS NAME		</TableCell>
                                            <TableCell>0	</TableCell>
                                            <TableCell>SUBTOTAL	</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow key={1}>
                                            <TableCell>NEW</TableCell>
                                            <TableCell>New Lead	</TableCell>
                                            <TableCell>14</TableCell>
                                            <TableCell>14</TableCell>
                                        </TableRow>
                                        <TableRow key={2}>
                                            <TableCell colSpan={2}>Total</TableCell>
                                            <TableCell>14</TableCell>
                                            <TableCell>14</TableCell>
                                        </TableRow>
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

                    </CardBody>
                </Card>
            </div>
        );
    }
}

export default ListReport;