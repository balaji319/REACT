import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import Paper from '@material-ui/core/Paper';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { cloneElement, Component } from 'react';
import Button from '@material-ui/core/Button';
import moment from 'moment';
import { DatePicker } from 'material-ui-pickers';
import Checkbox from '@material-ui/core/Checkbox';


import LIST_ID from "./data";


class SwitchCallback extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            list_id: '',
            from_entry_date: moment(new Date()).format('YYYY-MM-DD'),
            to_entry_date: moment(new Date()).format('YYYY-MM-DD'),
            from_callback_date: moment(new Date()).format('YYYY-MM-DD'),
            to_callback_date: moment(new Date()).format('YYYY-MM-DD'),
            callback_date_checked:false,
            entry_date_checked:false,
        };
    }


    handleSwitchCallBack = () => {
        console.log(this.state);
    }

    handleChange = name => event => {
        this.setState({ [name]: event.target.value });
    };

    handleCheckChange = name => (event, checked) => {
        this.setState({ [name]: checked });
    };

    handleFromEntryDateChange = (date) => {
        this.setState({ from_entry_date: moment(date).format('YYYY-MM-DD') });
    };

    handleToEntryDateChange = (date) => {
        this.setState({ to_entry_date: moment(date).format('YYYY-MM-DD') });
    };

    handleFromCallbackDateChange = (date) => {
        this.setState({ from_callback_date: moment(date).format('YYYY-MM-DD') });
    };

    handleToCallbackDateChange = (date) => {
        this.setState({ to_callback_date: moment(date).format('YYYY-MM-DD') });
    };

    render() {
        const { 
            list_id,
            from_entry_date,
            to_entry_date,
            from_callback_date,
            to_callback_date,
            callback_date_checked,
            entry_date_checked,
         } = this.state;
        const tdStyle = { textAlign: 'right', width: '40%' };
        return (
            <div>

                <Paper>
                    <div className="table-responsive-material">

                        <Table>
                            <TableHead style={{ backgroundColor: '#036' }}>
                                <TableRow>
                                    <TableCell colSpan={3} style={{ color: '#ffffff', textAlign: 'center' }}>Switch Callbacks</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow key={1}>
                                    <TableCell style={tdStyle}>List</TableCell>
                                    <TableCell colSpan={2}>
                                        <div className="col-lg-6 col-sm-6 col-12">
                                            <FormControl className="w-100 mb-2">
                                                <Select
                                                    value={list_id}
                                                    onChange={this.handleChange('list_id')}
                                                    input={<Input id="age-simple" />}>

                                                    {Object.keys(LIST_ID).map((item, i) => (
                                                        <MenuItem key={i} value={item}>{LIST_ID[item]}</MenuItem>
                                                    ))};
                                                        </Select>
                                            </FormControl>
                                        </div>
                                    </TableCell>
                                </TableRow>

                                <TableRow key={2}>
                                    <TableCell style={tdStyle}>Entry Date </TableCell>
                                    <TableCell colSpan="2">
                                        <div>
                                            <Checkbox color="primary"
                                                checked={entry_date_checked}
                                                onChange={this.handleCheckChange('entry_date_checked')}
                                                value="entry_date_checked"
                                            />
                                            <DatePicker
                                                        fullWidth
                                                        value={from_entry_date}
                                                        format='YYYY-MM-DD'
                                                        onChange={this.handleFromEntryDateChange}
                                                        animateYearScrolling={false}
                                                        leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                                                        rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                                                        className="w-25"
                                                        disabled={entry_date_checked == true ? false : true}
                                                    />
                                            &nbsp;To&nbsp;
                                                    <DatePicker
                                                        fullWidth
                                                        value={to_entry_date}
                                                        format='YYYY-MM-DD'
                                                        onChange={this.handleToEntryDateChange}
                                                        animateYearScrolling={false}
                                                        leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                                                        rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                                                        className="w-25"
                                                        disabled={entry_date_checked == true ? false : true}
                                                    />
                                        </div>
                                    </TableCell>
                                </TableRow>
                                

                                <TableRow key={3}>
                                    <TableCell style={tdStyle}>Callback Date </TableCell>
                                    <TableCell colSpan="2">
                                        <div>
                                            <Checkbox color="primary"
                                                checked={callback_date_checked}
                                                onChange={this.handleCheckChange('callback_date_checked')}
                                                value="callback_date_checked"
                                            />
                                            <DatePicker
                                                        fullWidth
                                                        value={from_callback_date}
                                                        format='YYYY-MM-DD'
                                                        onChange={this.handleFromCallbackDateChange}
                                                        animateYearScrolling={false}
                                                        leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                                                        rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                                                        className="w-25"
                                                        disabled={callback_date_checked == true ? false : true}
                                                    />
                                            &nbsp;To&nbsp;
                                                    <DatePicker
                                                        fullWidth
                                                        value={to_callback_date}
                                                        format='YYYY-MM-DD'
                                                        onChange={this.handleToCallbackDateChange}
                                                        animateYearScrolling={false}
                                                        leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                                                        rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                                                        className="w-25"
                                                        disabled={callback_date_checked == true ? false : true}
                                                    />
                                        </div>
                                    </TableCell>
                                </TableRow>
                                

                                <TableRow key={4}>
                                    <TableCell colSpan={3} style={{ textAlign: 'center' }}>
                                        <Button color="primary" className="jr-btn bg-success text-white" onClick={this.handleSwitchCallBack}>Switch Callback</Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </Paper>

            </div>
        );
    }
}

export default SwitchCallback;