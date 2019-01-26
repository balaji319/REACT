import React from 'react';
import {connect} from 'react-redux';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {Card, CardBody, CardFooter, CardHeader, CardSubtitle, CardText} from 'reactstrap';
import {cloneElement, Component} from 'react';
import moment from 'moment';
import momentTimezone from 'moment-timezone';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Progress } from 'react-sweet-progress';
import Helmet from "react-helmet";
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

const BREAKDOWN_COL1 = 11;

class TextTable extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            activeCol:0,
        }
    }

    render() {
        const {displayAs, mydata} = this.props;
        return (
                <Card className="shadow border-0 bg-default text-black"> 
                    <CardHeader className="bg-primary text-white">--- CALL CENTER TOTAL</CardHeader>
                        <CardBody>
                            {Object.keys(mydata.data.ascii_text).map((item, i) => 
                                <Card style={{padding: "20px"}} className="shadow border-0 bg-default text-black" key={i}>
                                    <h3>--- TEAM: {mydata.data.ascii_text[i].user_group} - {mydata.data.ascii_text[i].group_name}</h3>
                                    <br/>

                                    {mydata.data.ascii_text[i].no_agent?                                                    
                                        <p>{mydata.data.ascii_text[i].no_agent} </p>                                            
                                        : 
                                        <div className="table-responsive-material">
                                            
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        {Object.keys(mydata.data.heading).map((head, h) =>
                                                            <TableCell key={h}>{mydata.data.heading[head]}</TableCell>
                                                        ) }
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                { Object.keys(mydata.data.ascii_text[i].info).map((key, val) =>
                                                    <TableRow key={val}>
                                                        <TableCell>{mydata.data.ascii_text[i].info[key].full_name}</TableCell>
                                                        <TableCell>{mydata.data.ascii_text[i].info[key].user}</TableCell>
                                                        <TableCell>{mydata.data.ascii_text[i].info[key].calls}</TableCell>
                                                        <TableCell>{mydata.data.ascii_text[i].info[key].leads}</TableCell>
                                                        <TableCell>{mydata.data.ascii_text[i].info[key].contacts}</TableCell>
                                                        <TableCell>{mydata.data.ascii_text[i].info[key].contact_ratio}</TableCell>
                                                        <TableCell>{mydata.data.ascii_text[i].info[key].user_nonpause_time}</TableCell>
                                                        <TableCell>{mydata.data.ascii_text[i].info[key].user_system_time}</TableCell>
                                                        <TableCell>{mydata.data.ascii_text[i].info[key].user_talk_time}</TableCell>
                                                        <TableCell>{mydata.data.ascii_text[i].info[key].sale_array}</TableCell>
                                                        <TableCell>{mydata.data.ascii_text[i].info[key].sales_per_working_hours}</TableCell>
                                                        <TableCell>{mydata.data.ascii_text[i].info[key].sales_ratio}</TableCell>
                                                        <TableCell>{mydata.data.ascii_text[i].info[key].sale_contact_ratio}</TableCell>
                                                        <TableCell>{mydata.data.ascii_text[i].info[key].sales_per_hour}</TableCell>
                                                        <TableCell>{mydata.data.ascii_text[i].info[key].incomplete_array}</TableCell>
                                                        <TableCell>{mydata.data.ascii_text[i].info[key].cancel_array}</TableCell>
                                                        <TableCell>{mydata.data.ascii_text[i].info[key].callbacks}</TableCell>
                                                        <TableCell>{mydata.data.ascii_text[i].info[key].stcall}</TableCell>
                                                        <TableCell>{mydata.data.ascii_text[i].info[key].average_sale_time}</TableCell>
                                                        <TableCell>{mydata.data.ascii_text[i].info[key].average_contact_time}</TableCell>                                                                 
                                                        { Object.values(mydata.data.call_status).map((c, s) =>
                                                           <TableCell key = {s}>{mydata.data.ascii_text[i].info[key][c]}</TableCell>          
                                                        )}                                                                 
                                                    </TableRow>                                              
                                                  )}
                                                                                                       
                                                    <TableRow>
                                                        <TableCell></TableCell>          
                                                        <TableCell>{mydata.data.ascii_text[i].totals}</TableCell>          
                                                        <TableCell>{mydata.data.ascii_text[i].total_text.group_calls}</TableCell>          
                                                        <TableCell>{mydata.data.ascii_text[i].total_text.group_leads}</TableCell>          
                                                        <TableCell>{mydata.data.ascii_text[i].total_text.group_contacts}</TableCell>          
                                                        <TableCell>{mydata.data.ascii_text[i].total_text.group_contact_ratio}</TableCell>          
                                                        <TableCell>{mydata.data.ascii_text[i].total_text.group_nonpause_time}</TableCell>          
                                                        <TableCell>{mydata.data.ascii_text[i].total_text.group_system_time}</TableCell>          
                                                        <TableCell>{mydata.data.ascii_text[i].total_text.group_talk_time}</TableCell>          
                                                        <TableCell>{mydata.data.ascii_text[i].total_text.group_sales}</TableCell>          
                                                        <TableCell>{mydata.data.ascii_text[i].total_text.sales_per_working_hours}</TableCell>          
                                                        <TableCell>{mydata.data.ascii_text[i].total_text.group_sales_ratio}</TableCell>          
                                                        <TableCell>{mydata.data.ascii_text[i].total_text.group_sale_contact_ratio}</TableCell>          
                                                        <TableCell>{mydata.data.ascii_text[i].total_text.group_sales_per_hour}</TableCell>          
                                                        <TableCell>{mydata.data.ascii_text[i].total_text.group_inc_sales}</TableCell>          
                                                        <TableCell>{mydata.data.ascii_text[i].total_text.group_cnc_sales}</TableCell>          
                                                        <TableCell>{mydata.data.ascii_text[i].total_text.group_callbacks}</TableCell>          
                                                        <TableCell>{mydata.data.ascii_text[i].total_text.group_stcall}</TableCell>          
                                                        <TableCell>{mydata.data.ascii_text[i].total_text.group_average_sale_time}</TableCell>          
                                                        <TableCell>{mydata.data.ascii_text[i].total_text.group_average_contact_time}</TableCell>
                                                        {/*Object.keys(mydata.data.ascii_text[i].total_text.call_status_group_totals).map((cs, gt) =>
                                                           <TableCell key={gt}>{mydata.data.ascii_text[i].total_text.call_status_group_totals[cs]}</TableCell>         
                                                        )*/}
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>
                                    }  
                                </Card> 
                            )}
                
                            {/* --- CALL CENTER TOTAL TABLE */}
                                        
                            <Card style={{padding: "20px"}} className="shadow border-0 bg-default text-black"> 
                                <h3>--- CALL CENTER TOTAL</h3>
                                <br/>

                                <div className="table-responsive-material">
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                    {
                                                        Object.keys(mydata.data.heading).map((head, h) =>
                                                            <TableCell key={h}>{mydata.data.heading[head]}</TableCell>
                                                        ) 
                                                    }
                                                    </TableRow>
                                                    
                                        </TableHead>
                                        <TableBody>
                                                { Object.keys(mydata.data.total_ascii.group_text).map((g, t) =>
                                                  
                                                    <TableRow key={t}>
                                                        <TableCell>{mydata.data.total_ascii.group_text[g].group_name}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.group_text[g].user_group}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.group_text[g].total_text.group_calls}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.group_text[g].total_text.group_leads}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.group_text[g].total_text.group_contacts}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.group_text[g].total_text.group_contact_ratio}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.group_text[g].total_text.group_nonpause_time}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.group_text[g].total_text.group_system_time}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.group_text[g].total_text.group_talk_time}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.group_text[g].total_text.group_sales}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.group_text[g].total_text.sales_per_working_hours}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.group_text[g].total_text.group_sales_ratio}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.group_text[g].total_text.group_sale_contact_ratio}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.group_text[g].total_text.group_sales_per_hour}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.group_text[g].total_text.group_inc_sales}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.group_text[g].total_text.group_cnc_sales}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.group_text[g].total_text.group_callbacks}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.group_text[g].total_text.group_stcall}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.group_text[g].total_text.group_average_sale_time}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.group_text[g].total_text.group_average_contact_time}</TableCell>
                                                        {/*Object.keys(mydata.data.total_ascii.group_text[g].total_text.call_status_group_totals).map((cs, gt) =>
                                                            <TableCell key={gt}>{mydata.data.total_ascii.group_text[g].total_text.call_status_group_totals[cs]}</TableCell>         
                                                          )*/}
                                                </TableRow>

                                                                                                              
                                                  )}
                                                                                               
                                                    <TableRow>
                                                        <TableCell></TableCell>          
                                                        <TableCell>TOTALS:</TableCell>          
                                                        <TableCell>{mydata.data.total_ascii.total_calls}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.total_leads}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.total_contacts}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.total_contact_ratio}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.total_nonpause_time}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.total_system_time}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.total_talk_time}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.total_sales}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.sales_per_working_hours}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.total_sales_ratio}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.total_sale_contact_ratio}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.total_sales_per_hour}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.total_inc_sales}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.total_cnc_sales}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.total_callbacks}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.total_stcall}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.total_average_sale_time}</TableCell>
                                                        <TableCell>{mydata.data.total_ascii.total_average_contact_time}</TableCell>
                                                        {/*Object.keys(mydata.data.total_ascii.call_status_totals_grand_total).map((cs, gt) =>
                                                          <TableCell key={gt}>{mydata.data.total_ascii.call_status_totals_grand_total[cs]}</TableCell>         
                                                        )*/}
                                                     </TableRow>
                                               
                                                </TableBody>
                                    </Table>
                                </div>
                            </Card>
                        </CardBody>
                </Card>
        );
    }
}

export default TextTable;
