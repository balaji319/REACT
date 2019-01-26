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
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Progress } from 'react-sweet-progress';

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
                <div className="table-responsive-material">
                    <Table>
                        <TableHead>
                        {Object.keys(mydata.seperate_list_graph).map((key, val) =>
                          [
                              <TableRow key={val}>
                                <TableCell colSpan={2} className="text-center"><strong>{mydata.seperate_list_graph[key].listheading} Total Leads: {mydata.seperate_list_graph[key].totallist}</strong></TableCell>
                              </TableRow>, 
                              <TableRow key={Math.random()}>                            
                                <TableCell><b>{mydata.seperate_list_graph[key].header_1_array[0]}</b></TableCell>
                                <TableCell><b>{mydata.seperate_list_graph[key].header_1_array[1]}</b></TableCell>
                              </TableRow>,
                              <TableRow key={Math.random()}>                            
                                <TableCell>{mydata.seperate_list_graph[key].human_answer[0]}</TableCell>
                                <TableCell>{mydata.seperate_list_graph[key].human_answer[1]}</TableCell>
                              </TableRow>,
                              <TableRow key={Math.random()}>                            
                                <TableCell>{mydata.seperate_list_graph[key].sale[0]}</TableCell>
                                <TableCell>{mydata.seperate_list_graph[key].sale[1]}</TableCell>
                              </TableRow>,
                              <TableRow key={Math.random()}>                            
                                <TableCell>{mydata.seperate_list_graph[key].dnc[0]}</TableCell>
                                <TableCell>{mydata.seperate_list_graph[key].dnc[1]}</TableCell>
                              </TableRow>,
                              <TableRow key={Math.random()}>                            
                                <TableCell>{mydata.seperate_list_graph[key].customer_contact[0]}</TableCell>
                                <TableCell>{mydata.seperate_list_graph[key].customer_contact[1]}</TableCell>
                              </TableRow>,
                              <TableRow key={Math.random()}>                            
                                <TableCell>{mydata.seperate_list_graph[key].not_interested[0]}</TableCell>
                                <TableCell>{mydata.seperate_list_graph[key].not_interested[1]}</TableCell>
                              </TableRow>,
                              <TableRow key={Math.random()}>                            
                                <TableCell>{mydata.seperate_list_graph[key].unworkable[0]}</TableCell>
                                <TableCell>{mydata.seperate_list_graph[key].unworkable[1]}</TableCell>
                              </TableRow>,
                              <TableRow key={Math.random()}>                            
                                <TableCell>{mydata.seperate_list_graph[key].scheduled_callbacks[0]}</TableCell>
                                <TableCell>{mydata.seperate_list_graph[key].scheduled_callbacks[1]}</TableCell>
                              </TableRow>,
                              <TableRow key={Math.random()}>                            
                                <TableCell>{mydata.seperate_list_graph[key].completed[0]}</TableCell>
                                <TableCell>{mydata.seperate_list_graph[key].completed[1]}</TableCell>
                              </TableRow>,
                      
                               <TableRow key={Math.random()}>                            
                                <TableCell><b>{mydata.seperate_list_graph[key].header_2_array[0]}</b></TableCell>
                                <TableCell><b>{mydata.seperate_list_graph[key].header_2_array[1]}</b></TableCell>
                              </TableRow>,
                              
                              Object.keys(mydata.seperate_list_graph[key].header_2_data).map((i, k) =>
                                <TableRow key={Math.random()}>                            
                                    <TableCell>{mydata.seperate_list_graph[key].header_2_data[i][0]}</TableCell>
                                    <TableCell>{mydata.seperate_list_graph[key].header_2_data[i][1]}</TableCell>
                                </TableRow>       
                                ),
                        
                              <TableRow key={Math.random()}>                            
                                <TableCell><b>{mydata.seperate_list_graph[key].final_total[0]}</b></TableCell>
                                <TableCell><b>{mydata.seperate_list_graph[key].final_total[1]}</b></TableCell>
                              </TableRow>,
                            ]
                        )
                            
                        }
                        </TableHead>
                    </Table>
                </div>
        );
    }
}

export default TextTable;
