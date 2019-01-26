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
                            <TableRow>
                                <TableCell >AGENT</TableCell>
                                <TableCell >SUCCESS</TableCell>
                                <TableCell >XFERS</TableCell>
                                <TableCell >SUCCESS%</TableCell>
                                <TableCell >SALE </TableCell>
                                <TableCell >DROP</TableCell>
                                <TableCell >OTHER</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        { mydata.xfremInfo != "" ?
                            [Object.keys(mydata.xfremInfo).map((key, val) =>
                                <TableRow key={val}>
                                    <TableCell>{mydata.xfremInfo[key].user} - {mydata.xfremInfo[key].full_name}</TableCell>
                                    <TableCell>{mydata.xfremInfo[key].sales}</TableCell>
                                    <TableCell>{mydata.xfremInfo[key].calls}</TableCell>
                                    <TableCell>{mydata.xfremInfo[key].salespercentage}%</TableCell>
                                    <TableCell>{mydata.xfremInfo[key].a1}</TableCell>
                                    <TableCell>{mydata.xfremInfo[key].drop}</TableCell>
                                    <TableCell>{mydata.xfremInfo[key].other}</TableCell>
                                </TableRow>
                            ),
                            <TableRow key={2}>
                                <TableCell>Total Fronters : {mydata.totalXfrem.totagents}</TableCell>
                                <TableCell>{mydata.totalXfrem.totsales}</TableCell>
                                <TableCell>{mydata.totalXfrem.totcalls}</TableCell>
                                <TableCell>{mydata.totalXfrem.totspct}%</TableCell>
                                <TableCell>{mydata.totalXfrem.tot_a1}</TableCell>
                                <TableCell>{mydata.totalXfrem.tot_drop}</TableCell>
                                <TableCell>{mydata.totalXfrem.tot_other}</TableCell>
                            </TableRow>,
                            <TableRow key={3}>
                                <TableCell>Average time in Queue for customers:	</TableCell>
                                <TableCell>{mydata.totalXfrem.avg_wait}</TableCell>
                            </TableRow>]
                            
                            :  [<TableRow key={1}>                                
                                <TableCell>Total Fronters : 0</TableCell>
                                <TableCell>0</TableCell>
                                <TableCell>0</TableCell>
                                <TableCell>0.00%</TableCell>
                                <TableCell>0</TableCell>
                                <TableCell>0</TableCell>
                                <TableCell>0</TableCell>  
                            </TableRow>,                            
                            <TableRow key={2}>
                                <TableCell>Average time in Queue for customers:</TableCell>
                                <TableCell colSpan={6}>00:00:00</TableCell>
                            </TableRow>]
                            
                        }
                        </TableBody>
                    </Table>
                </div>
        );
    }
}

export default TextTable;
