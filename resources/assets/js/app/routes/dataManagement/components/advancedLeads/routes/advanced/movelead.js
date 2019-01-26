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
import TextField from '@material-ui/core/TextField';

import LIST_ID from "./data";

const CALLED_COUNT = ['<', '<=', '>', '>=', '='];
const CALLED_COUNT_VALUE = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];

class MoveLead extends React.Component {
    constructor(props) {
        super(props);
        var ts = new Date();
        this.state = {
            from_list_id: '',
            to_list_id: '',
            status: '',
            lead_from: '',
            lead_to: '',
            call_count: '<',
            call_count_value: '0',
            list_id: LIST_ID,
            country_code: '',
            vender_lead_code: '',
            source_id: '',
            owner: '',
            entry_date: moment(new Date()).format('YYYY-MM-DD'),
            entry_date_operator: '',
            modify_date: moment(new Date()).format('YYYY-MM-DD'),
            modify_date_operator: '',
            security_phrase: '',
            leads: '',
            to_lead:'',
            status_checked: false,
            country_code_checked: false,
            vender_lead_code_checked: false,
            source_id_checked: false,
            owner_checked: false,
            entry_date_checked: false,
            modify_date_checked: false,
            security_phrase__checked: false,
            leads__checked: false,
            call_count_checked: false,

        };
    }





    handleMoveEvent = () => {
        console.log(this.state);
    }

    handleChange = name => event => {
        this.setState({ [name]: event.target.value });
    };

    handleCheckChange = name => (event, checked) => {
        this.setState({ [name]: checked });
    };

    handleEntryDateChange = (date) => {
        this.setState({ entry_date: moment(date).format('YYYY-MM-DD') });
    };

    handleModifyDateChange = (date) => {
        this.setState({ modify_date: moment(date).format('YYYY-MM-DD') });
    };

    render() {
        const { list_id, from_list_id, to_list_id, status, lead_from, lead_to, call_count, call_count_value, country_code,
            vender_lead_code, source_id, owner, entry_date, entry_date_operator, modify_date, modify_date_operator, security_phrase,
            leads, status_checked, country_code_checked,
            vender_lead_code_checked,
            source_id_checked,
            owner_checked,
            entry_date_checked,
            modify_date_checked,
            security_phrase__checked,
            leads__checked,
            call_count_checked,to_lead } = this.state;
        const tdStyle = { textAlign: 'right', width: '40%' };
        return (
            <div>

                <Paper>
                    <div className="table-responsive-material">


                        <Table>
                            <TableHead style={{ backgroundColor: '#036' }}>
                                <TableRow>
                                    <TableCell colSpan={3} style={{ color: '#ffffff', textAlign: 'center' }}>{this.props.title}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow key={1}>
                                    <TableCell style={tdStyle}>From List</TableCell>
                                    <TableCell colSpan={2}>
                                        <div className="col-lg-6 col-sm-6 col-12">
                                            <FormControl className="w-100 mb-2">
                                                <Select
                                                    value={from_list_id}
                                                    onChange={this.handleChange('from_list_id')}
                                                    input={<Input id="age-simple" />}>

                                                    {Object.keys(list_id).map((item, i) => (
                                                        <MenuItem key={i} value={item}>{list_id[item]}</MenuItem>
                                                    ))};
                                                        </Select>
                                            </FormControl>
                                        </div>
                                    </TableCell>
                                </TableRow>

                                <TableRow key={2}>
                                    <TableCell style={tdStyle}>To List</TableCell>
                                    <TableCell colSpan={2}>
                                        <div className="col-lg-6 col-sm-6 col-12">
                                            <FormControl className="w-100 mb-2">
                                                <Select
                                                    value={to_list_id}
                                                    onChange={this.handleChange('to_list_id')}
                                                    input={<Input id="age-simple" />}>

                                                    {Object.keys(list_id).map((item, i) => (
                                                        <MenuItem key={i} value={item}>{list_id[item]}</MenuItem>
                                                    ))};
                                                        </Select>
                                            </FormControl>
                                        </div>
                                    </TableCell>
                                </TableRow>


                                <TableRow key={3}>
                                    <TableCell style={tdStyle}>Status</TableCell>

                                    <TableCell colSpan="2">
                                        <div>
                                            <Checkbox color="primary"
                                                checked={status_checked}
                                                onChange={this.handleCheckChange('status_checked')}
                                                value="status_checked"
                                            />
                                            <Select
                                                value={from_list_id}
                                                onChange={this.handleChange('from_list_id')}
                                                input={<Input id="age-simple" />}
                                                className="w-50"
                                                disabled={status_checked == true ? false : true}
                                            >
                                                {Object.keys(list_id).map((item, i) => (
                                                    <MenuItem key={i} value={item}>{list_id[item]}</MenuItem>
                                                ))};
                                                </Select>
                                        </div>
                                    </TableCell>
                                </TableRow>

                                <TableRow key={4}>
                                    <TableCell style={tdStyle}>Country Code	</TableCell>
                                    <TableCell colSpan="2">
                                        <div>
                                            <Checkbox color="primary"
                                                checked={country_code_checked}
                                                onChange={this.handleCheckChange('country_code_checked')}
                                                value="country_code_checked"
                                            />
                                            <TextField
                                                margin="normal"
                                                id={""}
                                                label={""}
                                                fullWidth
                                                value={country_code}
                                                onChange={this.handleChange("country_code")}
                                                className="w-50"
                                                disabled={country_code_checked == true ? false : true}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>

                                <TableRow key={5}>
                                    <TableCell style={tdStyle}>Vendor Lead Code	</TableCell>
                                    <TableCell colSpan="2">
                                        <div>
                                            <Checkbox color="primary"
                                                checked={vender_lead_code_checked}
                                                onChange={this.handleCheckChange('vender_lead_code_checked')}
                                                value="vender_lead_code_checked"
                                            />
                                            <TextField
                                                margin="normal"
                                                id={""}
                                                label={""}
                                                fullWidth
                                                value={vender_lead_code}
                                                onChange={this.handleChange("vender_lead_code")}
                                                className="w-50"
                                                disabled={vender_lead_code_checked == true ? false : true}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow key={6}>
                                    <TableCell style={tdStyle}>Source ID</TableCell>
                                    <TableCell colSpan="2">
                                        <div>
                                            <Checkbox color="primary"
                                                checked={source_id_checked}
                                                onChange={this.handleCheckChange('source_id_checked')}
                                                value="source_id_checked"
                                            />
                                            <TextField
                                                margin="normal"
                                                id={""}
                                                label={""}
                                                fullWidth
                                                value={source_id}
                                                onChange={this.handleChange("source_id")}
                                                className="w-50"
                                                disabled={source_id_checked == true ? false : true}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow key={7}>
                                    <TableCell style={tdStyle}>Owner</TableCell>
                                    <TableCell colSpan="2">
                                        <div>
                                            <Checkbox color="primary"
                                                checked={owner_checked}
                                                onChange={this.handleCheckChange('owner_checked')}
                                                value="owner_checked"
                                            />
                                            <TextField
                                                margin="normal"
                                                id={""}
                                                label={""}
                                                fullWidth
                                                value={owner}
                                                onChange={this.handleChange("owner")}
                                                className="w-50"
                                                disabled={owner_checked == true ? false : true}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>

                                <TableRow key={8}>
                                    <TableCell style={tdStyle}>Entry Date </TableCell>
                                    <TableCell colSpan="2">
                                        <div>
                                            <Checkbox color="primary"
                                                checked={entry_date_checked}
                                                onChange={this.handleCheckChange('entry_date_checked')}
                                                value="entry_date_checked"
                                            />
                                            <Select
                                                value={call_count}
                                                onChange={this.handleChange('call_count')}
                                                input={<Input id="age-simple" />}
                                                className="w-25"
                                                disabled={entry_date_checked == true ? false : true}
                                            >
                                                {Object.keys(CALLED_COUNT).map((item, i) => (
                                                    <MenuItem key={i} value={item}>{CALLED_COUNT[item]}</MenuItem>
                                                ))};
                                                    </Select>
                                            &nbsp;
                                                    <DatePicker
                                                        fullWidth
                                                        value={entry_date}
                                                        format='YYYY-MM-DD'
                                                        onChange={this.handleEntryDateChange}
                                                        animateYearScrolling={false}
                                                        leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                                                        rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                                                        className="w-25"
                                                        disabled={entry_date_checked == true ? false : true}
                                                    />
                                        </div>
                                    </TableCell>
                                </TableRow>

                                <TableRow key={9}>
                                    <TableCell style={tdStyle}>Modify Date </TableCell>
                                    <TableCell colSpan="2">
                                        <div>
                                            <Checkbox color="primary"
                                                checked={modify_date_checked}
                                                onChange={this.handleCheckChange('modify_date_checked')}
                                                value="modify_date_checked"
                                            />
                                            <Select
                                                value={call_count}
                                                onChange={this.handleChange('call_count')}
                                                input={<Input id="age-simple" />}
                                                className="w-25"
                                                disabled={modify_date_checked == true ? false : true}
                                            >
                                                {Object.keys(CALLED_COUNT).map((item, i) => (
                                                    <MenuItem key={i} value={item}>{CALLED_COUNT[item]}</MenuItem>
                                                ))};
                                                    </Select>
                                            &nbsp;
                                                    <DatePicker
                                                fullWidth
                                                value={modify_date}
                                                format='YYYY-MM-DD'
                                                onChange={this.handleModifyDateChange}
                                                animateYearScrolling={false}
                                                leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                                                rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                                                className="w-25"
                                                disabled={modify_date_checked == true ? false : true}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow key={10}>
                                    <TableCell style={tdStyle}>Security Phrase	</TableCell>
                                    <TableCell colSpan="2">
                                        <div>
                                            <Checkbox color="primary"
                                                checked={security_phrase__checked}
                                                onChange={this.handleCheckChange('security_phrase__checked')}
                                                value="security_phrase__checked"
                                            />
                                            <TextField
                                                margin="normal"
                                                id={""}
                                                label={""}
                                                fullWidth
                                                value={security_phrase}
                                                onChange={this.handleChange("security_phrase")}
                                                className="w-50"
                                                disabled={security_phrase__checked == true ? false : true}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>

                                <TableRow key={11}>
                                    <TableCell style={tdStyle}>Leads </TableCell>
                                    <TableCell colSpan="2">
                                        <div>
                                            <Checkbox color="primary"
                                                checked={leads__checked}
                                                onChange={this.handleCheckChange('leads__checked')}
                                                value="leads__checked"
                                            />
                                            <TextField
                                                margin="normal"
                                                id={""}
                                                label={""}
                                                fullWidth
                                                value={leads}
                                                onChange={this.handleChange("leads")}
                                                className="w-25"
                                                disabled={leads__checked == true ? false : true}
                                            />
                                            &nbsp;To&nbsp;
                                                    <TextField
                                                margin="normal"
                                                id={""}
                                                label={""}
                                                fullWidth
                                                value={to_lead}
                                                onChange={this.handleChange("to_lead")}
                                                className="w-25"
                                                disabled={leads__checked == true ? false : true}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow key={12}>
                                    <TableCell style={tdStyle}>Called Count </TableCell>
                                    <TableCell colSpan="2">
                                        <div>
                                            <Checkbox color="primary"
                                                checked={call_count_checked}
                                                onChange={this.handleCheckChange('call_count_checked')}
                                                value="call_count_checked"
                                            />
                                            <Select
                                                value={call_count}
                                                onChange={this.handleChange('call_count')}
                                                input={<Input id="age-simple" />}
                                                className="w-25"
                                                disabled={call_count_checked == true ? false : true}
                                            >
                                                {Object.keys(CALLED_COUNT).map((item, i) => (
                                                    <MenuItem key={i} value={item}>{CALLED_COUNT[item]}</MenuItem>
                                                ))};
                                                    </Select>
                                            &nbsp;
                                                    <Select
                                                value={call_count_value}
                                                onChange={this.handleChange('call_count_value')}
                                                input={<Input id="age-simple" />}
                                                className="w-25"
                                                disabled={call_count_checked == true ? false : true}
                                            >
                                                {Object.keys(CALLED_COUNT_VALUE).map((item, i) => (
                                                    <MenuItem key={i} value={item}>{CALLED_COUNT_VALUE[item]}</MenuItem>
                                                ))};
                                                    </Select>
                                        </div>
                                    </TableCell>
                                </TableRow>


                                <TableRow key={100}>
                                    <TableCell colSpan={3} style={{ textAlign: 'center' }}>
                                        <Button color="primary" className="jr-btn bg-success text-white" onClick={this.handleMoveEvent}>{this.props.btnText}</Button>
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

export default MoveLead;