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
                <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow className="tableHead">
                                    {Object.keys(mydata.data.graph_header).map((i, j) =>
                                      <TableCell key={j}>{mydata.data.graph_header[i]}</TableCell>
                                    )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                {Object.keys(mydata.data).map((key, value) =>
                                   mydata.data[key].full_name ?  
                                    <TableRow key={value}>
                                        <TableCell>{mydata.data[key].full_name}</TableCell>
                                        <TableCell>{mydata.data[key].user}</TableCell>
                                        {Object.keys(mydata.data[key].calls).map((j, k) =>
                                         [<TableCell key={1}>{mydata.data[key].calls[j]}</TableCell>,
                                            <TableCell key={2}>{mydata.data[key].sales[j]}</TableCell>,
                                            <TableCell key={3}>{mydata.data[key].sale_conv[j]}</TableCell>,
                                            <TableCell key={4}>{mydata.data[key].sales_per_hr[j]}</TableCell>,
                                            <TableCell key={5}>{mydata.data[key].time[j]}</TableCell>]
                                        )}
                                    </TableRow> : null
                                )}
                                <TableRow>
                                {Object.keys(mydata.data.total_array).map((t, r) =>
                                 <TableCell key={r}>{mydata.data.total_array[t]}</TableCell>   
                                )}
                                </TableRow>
                                </TableBody>
                            </Table>
                        </div>
        );
    }
}

export default TextTable;
