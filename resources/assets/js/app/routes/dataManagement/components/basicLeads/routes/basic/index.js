import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import InfoCard from '../../../../../../../components/InfoCard';
import ContainerHeader from '../../../../../../../components/ContainerHeader/index';
import CardBox from '../../../../../../../components/CardBox/index';
import Paper from '@material-ui/core/Paper';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';
import { Card, CardBody, CardSubtitle, CardText } from 'reactstrap';
import { cloneElement, Component } from 'react';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import moment from 'moment';
import { UncontrolledAlert } from 'reactstrap';
import { DatePicker } from 'material-ui-pickers';

import Dropdown from '../../../comman/Dropdown';
import TextFields from '../../../comman/TextFields';
import LIST_ID from "./data";
const OPTIONS = ['APPEND', 'UPDATE', 'REPLACE']
const CALLED_COUNT=['<','<=','>','>=','='];
const CALLED_COUNT_VALUE=['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20'];

class BasicLead extends React.Component {
    constructor(props) {
        super(props);
        var ts = new Date();
        this.state = {
            from_list_id: '',
            to_list_id: '',
            status:'',
            lead_from:'',
            lead_to:'',
            call_count:'<=',
            call_count_value:'0'
        };
    }

    handleChange = (name, value) => {
        this.setState({
            [name]: value,
        })
    }

    handleSubmit = () => {
    
    }

    handleMoveEvent =()=>{
        console.log(this.state);
    }


    render() {
        const { from, to, id, total, rowsPerPage, page ,from_list_id,to_list_id,status,lead_from,lead_to,call_count,call_count_value} = this.state;
        const tdStyle = {textAlign: 'right',width: '40%'};
        return (
            <div>
                <ContainerHeader match={this.props.match} title={'Basic Lead Management'} />

                <Card className="shadow border-0 bg-default text-black">
                    <CardBody>
                        <div className="row">

                            <div className="col-lg-12 col-sm-12 col-12">
                                <UncontrolledAlert className="bg-light text-black shadow-lg">
                                    <div style={{ color: 'green' }}>NOTICE: These features only work on Inactive lists with less than 100,000 leads in them to avoid data inconsistencies. Please mark your lists as Inactive before using these tools.</div>
                                    <div style={{ color: 'red' }}>Warning: If you are moving leads that have custom fields associated with them, then do not apply this update. If you apply this update, then custom field info will not move with the lead.</div>
                                </UncontrolledAlert>
                            </div>

                        </div>
                        <Paper>
                            <div className="table-responsive-material">
                                <Table>
                                    <TableHead style={{backgroundColor:'#036'}}>
                                        <TableRow>
                                            <TableCell colSpan={3} style={{color:'#ffffff',textAlign:'center'}}>Move Leads</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow key={1}>
                                            <TableCell style={tdStyle}>From List</TableCell>
                                            <TableCell colSpan={2}>
                                                <div className="col-lg-6 col-sm-6 col-12">
                                                    <Dropdown 
                                                        label={"From List"}
                                                        name={"from_list_id"}
                                                        selectedValue={from_list_id}
                                                        data={LIST_ID}
                                                        onChange={this.handleChange}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow key={2}>
                                            <TableCell style={tdStyle}>To List</TableCell>
                                            <TableCell colSpan={2}>
                                                <div className="col-lg-6 col-sm-6 col-12">
                                                    <Dropdown 
                                                        label={"To List"}
                                                        name={"to_list_id"}
                                                        selectedValue={to_list_id}
                                                        data={LIST_ID}
                                                        onChange={this.handleChange}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow key={3}>
                                            <TableCell style={tdStyle}>Status</TableCell>
                                            <TableCell colSpan={2}>
                                                <div className="col-lg-6 col-sm-6 col-12">
                                                    <Dropdown 
                                                        label={"Status"}
                                                        name={"status"}
                                                        selectedValue={status}
                                                        data={LIST_ID}
                                                        onChange={this.handleChange}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow key={4}>
                                            <TableCell style={tdStyle}>Leads</TableCell>
                                                <TableCell >
                                                    <TextFields
                                                        id={"lead_from"}
                                                        label={"From"}
                                                        value={lead_from}
                                                        name={"lead_from"}
                                                        onChange={this.handleChange}
                                                    />
                                                </TableCell >
                                                <TableCell >
                                                    <TextFields
                                                        id={"lead_from"}
                                                        label={"To"}
                                                        value={lead_from}
                                                        name={"lead_from"}
                                                        onChange={this.handleChange}
                                                    />
                                                
                                            </TableCell>
                                        </TableRow>
                                        <TableRow key={5}>
                                            <TableCell style={tdStyle}>Called Count	</TableCell>
                                            <TableCell>
                                                    <Dropdown 
                                                        label={""}
                                                        name={"call_count"}
                                                        selectedValue={call_count}
                                                        data={CALLED_COUNT}
                                                        onChange={this.handleChange}
                                                    /> 
                                            </TableCell>
                                            <TableCell>
                                                    <Dropdown 
                                                        label={""}
                                                        name={"call_count_value"}
                                                        selectedValue={call_count_value}
                                                        data={CALLED_COUNT_VALUE}
                                                        onChange={this.handleChange}
                                                    /> 
                                                
                                            </TableCell>

                                        </TableRow>
                                        <TableRow key={6}> 
                                            <TableCell colSpan={3} style={{ textAlign:'center'}}>
                                                <Button color="primary" className="jr-btn bg-success text-white" onClick={this.handleMoveEvent}>Move</Button>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                            </Paper>
                            <br/>
                            <Paper>
                            <div className="table-responsive-material">
                                <Table>
                                    <TableHead style={{backgroundColor:'#036'}}>
                                        <TableRow>
                                            <TableCell colSpan={3} style={{color:'#ffffff',textAlign:'center'}}>Update Lead Statuses</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow key={1}>
                                            <TableCell style={tdStyle}>List</TableCell>
                                            <TableCell colSpan={2}>
                                                <div className="col-lg-6 col-sm-6 col-12">
                                                    <Dropdown 
                                                        label={"From List"}
                                                        name={"from_list_id"}
                                                        selectedValue={from_list_id}
                                                        data={LIST_ID}
                                                        onChange={this.handleChange}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow key={2}>
                                            <TableCell style={tdStyle}>From Status	</TableCell>
                                            <TableCell colSpan={2}>
                                                <div className="col-lg-6 col-sm-6 col-12">
                                                    <Dropdown 
                                                        label={"To List"}
                                                        name={"to_list_id"}
                                                        selectedValue={to_list_id}
                                                        data={LIST_ID}
                                                        onChange={this.handleChange}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow key={3}>
                                            <TableCell style={tdStyle}>To Status</TableCell>
                                            <TableCell colSpan={2}>
                                                <div className="col-lg-6 col-sm-6 col-12">
                                                    <Dropdown 
                                                        label={"Status"}
                                                        name={"status"}
                                                        selectedValue={status}
                                                        data={LIST_ID}
                                                        onChange={this.handleChange}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>

                                        <TableRow key={4}>
                                            <TableCell style={tdStyle}>Called Count	</TableCell>
                                            <TableCell>
                                                    <Dropdown 
                                                        label={""}
                                                        name={"call_count"}
                                                        selectedValue={call_count}
                                                        data={CALLED_COUNT}
                                                        onChange={this.handleChange}
                                                    /> 
                                            </TableCell>
                                            <TableCell>
                                                    <Dropdown 
                                                        label={""}
                                                        name={"call_count_value"}
                                                        selectedValue={call_count_value}
                                                        data={CALLED_COUNT_VALUE}
                                                        onChange={this.handleChange}
                                                    /> 
                                                
                                            </TableCell>

                                        </TableRow>

        
                                        <TableRow key={5}> 
                                            <TableCell colSpan={3} style={{ textAlign:'center'}}>
                                                <Button color="primary" className="jr-btn bg-success text-white" onClick={this.handleMoveEvent}>Update</Button>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </Paper>
                        <br/>
                            <Paper>
                            <div className="table-responsive-material">
                                <Table>
                                    <TableHead style={{backgroundColor:'#036'}}>
                                        <TableRow>
                                            <TableCell colSpan={3} style={{color:'#ffffff',textAlign:'center'}}>Delete Leads</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow key={1}>
                                            <TableCell style={tdStyle}>List</TableCell>
                                            <TableCell colSpan={2}>
                                                <div className="col-lg-6 col-sm-6 col-12">
                                                    <Dropdown 
                                                        label={"From List"}
                                                        name={"from_list_id"}
                                                        selectedValue={from_list_id}
                                                        data={LIST_ID}
                                                        onChange={this.handleChange}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                   
                                        <TableRow key={2}>
                                            <TableCell style={tdStyle}>Status</TableCell>
                                            <TableCell colSpan={2}>
                                                <div className="col-lg-6 col-sm-6 col-12">
                                                    <Dropdown 
                                                        label={"Status"}
                                                        name={"status"}
                                                        selectedValue={status}
                                                        data={LIST_ID}
                                                        onChange={this.handleChange}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow key={3}>
                                            <TableCell style={tdStyle}>Called Count	</TableCell>
                                            <TableCell>
                                                    <Dropdown 
                                                        label={""}
                                                        name={"call_count"}
                                                        selectedValue={call_count}
                                                        data={CALLED_COUNT}
                                                        onChange={this.handleChange}
                                                    /> 
                                            </TableCell>
                                            <TableCell>
                                                    <Dropdown 
                                                        label={""}
                                                        name={"call_count_value"}
                                                        selectedValue={call_count_value}
                                                        data={CALLED_COUNT_VALUE}
                                                        onChange={this.handleChange}
                                                    /> 
                                                
                                            </TableCell>

                                        </TableRow>
                                        <TableRow key={4}> 
                                            <TableCell colSpan={3} style={{ textAlign:'center'}}>
                                                <Button color="primary" className="jr-btn bg-success text-white" onClick={this.handleMoveEvent}>Delete</Button>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </Paper>




                    </CardBody>
                </Card>


            </div>
        );
    }
}

export default BasicLead;