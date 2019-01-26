import { React,Table,TableBody,TableCell,TableHead,TableRow,Paper} from '../plugins';
import LinearProgress from '@material-ui/core/LinearProgress';
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';


class CallInitialQueuePositionBreakdown extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            activeCol:0,
            graph_data : [],
        }
    }


    componentDidUpdate() {         
           
        
    }

    render() {
        const {graph_data} = this.state;
        const {display_as} = this.props;
        

        for (var i = 0; i < 11;) {
            var d = 'bd_'+i;
            var data = { "name" : i, "pv" : this.props.data[d]}
            this.state.graph_data.push(data);   
            i++;
        }
        var data1 = { "name" : 15, "pv" : this.props.data.bd_15}
        this.state.graph_data.push(data1);   
        var data2 = { "name" : 20, "pv" : this.props.data.bd_20}
        this.state.graph_data.push(data2);   
        var data3 = { "name" : 25, "pv" : this.props.data.bd_25}
        this.state.graph_data.push(data3);   
        var data4 = { "name" : '25+', "pv" : this.props.data.bd_26}
        this.state.graph_data.push(data4);   


        return (
            <div>
                <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12">
                        <label style={{fontSize:20}}>CALL INITIAL QUEUE POSITION BREAKDOWN</label>
                        <button type="button" className="btn btn-raised btn-sm pull-right btn-success">CSV Download</button>
                    </div>
                </div>
                {display_as == "TEXT" ?
                <Paper>
                <div className="table-responsive-material">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>0</TableCell>
                            <TableCell>1</TableCell>
                            <TableCell>2</TableCell>
                            <TableCell>3</TableCell>
                            <TableCell>4</TableCell>
                            <TableCell>5</TableCell>
                            <TableCell>6</TableCell>
                            <TableCell>7</TableCell>
                            <TableCell>8</TableCell>
                            <TableCell>9</TableCell>
                            <TableCell>10</TableCell>
                            <TableCell>15</TableCell>
                            <TableCell>20</TableCell>
                            <TableCell>25</TableCell>
                            <TableCell>25+</TableCell>
                            <TableCell>Total</TableCell>
                        </TableRow>
                    </TableHead> 
                    <TableBody>
                        <TableRow>
                            <TableCell>{this.props.data.bd_0}</TableCell>
                            <TableCell>{this.props.data.bd_1}</TableCell>
                            <TableCell>{this.props.data.bd_2}</TableCell>
                            <TableCell>{this.props.data.bd_3}</TableCell>
                            <TableCell>{this.props.data.bd_4}</TableCell>
                            <TableCell>{this.props.data.bd_5}</TableCell>
                            <TableCell>{this.props.data.bd_6}</TableCell>
                            <TableCell>{this.props.data.bd_7}</TableCell>
                            <TableCell>{this.props.data.bd_8}</TableCell>
                            <TableCell>{this.props.data.bd_9}</TableCell>
                            <TableCell>{this.props.data.bd_10}</TableCell>
                            <TableCell>{this.props.data.bd_15}</TableCell>
                            <TableCell>{this.props.data.bd_20}</TableCell>
                            <TableCell>{this.props.data.bd_25}</TableCell>
                            <TableCell>{this.props.data.bd_26}</TableCell>
                            <TableCell>{this.props.data.total}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                </div>
            </Paper> :
                <Paper>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={graph_data}
                                margin={{top: 10, right: 5, left: 0, bottom: 0}}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Line type="monotone" dataKey="pv" stroke="#3367d6" activeDot={{r: 8}} />
                            
                        </LineChart>
                    </ResponsiveContainer>
                </Paper>}
            </div>
        );
    }
}

export default CallInitialQueuePositionBreakdown;
