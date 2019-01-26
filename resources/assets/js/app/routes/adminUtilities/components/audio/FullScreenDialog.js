import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';

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





function Transition(props) {
    return <Slide direction="up" {...props} />;
}

class FullScreenDialog extends React.Component {

    state = {
        data: [],
        page: 0,
        rowsPerPage: 10,
        total: 0,
        nextPageUrl: '/api/country-lists',
        prevPageUrl: '/api/country-lists',
        open: false,
    };

    componentWillMount() {
        this.getCountryList();
    }

    getCountryList(page = 0, page_size = 10) {
        let $this = this;

        let current_page = page + 1;
        axios.get('api/admin-utilities/audio-manual-lists?page=' + current_page + '&page_size=' + page_size).then(response => {
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



        
    handleRedirect = () => {
        window.open('https://record.ytel.com/','_blank');
    };

    handleClickOpen = () => {
        this.setState({open: true});
    };

    handleRequestClose = () => {
        this.setState({open: false});
    };

    render() {
        const { data, rowsPerPage, page, total } = this.state;
        return (
            <div style={{overflow:'hidden'}}>
                 <Button variant="raised"   className="bg-primary text-white"  style={{float:'right',backgroundColor:'#748bfb',margin: '4px'}} onClick={this.handleClickOpen}>Add New Inbound Group</Button>
               <Button variant="raised"   className="bg-primary text-white"  style={{float:'right',backgroundColor:'#748bfb',margin: '4px'}} onClick={this.handleRedirect} > Record Audio Here </Button>
                <Dialog
                    fullScreen
                    open={this.state.open}
                    onClose={this.handleRequestClose}
                    TransitionComponent={Transition}>
                    <AppBar className="position-relative">
                        <Toolbar>
                          <Typography type="title" color="inherit" style={{
                                flex: 1,
                            }}>
                              
                            </Typography>
                            <Button onClick={this.handleRequestClose}>
                      
                                <CloseIcon/>
                      
                            </Button>
                        </Toolbar>
                    </AppBar>
                    <List>
                     
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
                                                        <TableCell>#</TableCell>
                                                        <TableCell>DATE/TIME</TableCell>
                                                        <TableCell>Country Name</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {this.state.data.map((n, i) => (
                                                        <TableRow key={n.admin_log_id}>
                                                            <TableCell>{n.admin_log_id}</TableCell>
                                                            <TableCell>{n.event_date}</TableCell>
                                                            <TableCell>{n.user}</TableCell>
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

                    </List>
            
                       
                </Dialog>
            </div>
        );
    }
}

export default FullScreenDialog;