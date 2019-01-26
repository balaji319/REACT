import { React,Table,TableBody,TableCell,TableHead,TableRow,Paper} from '../plugins';
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

class CallInitialQueuePositionBreakdown extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            graph_data : [],
            dropTimeBreakDown : this.props.mydata.data.initial_break_down
        }
    }

    componentWillReceiveProps(nextProps) {
         this.setState({
             graph_data : []
         })
     }

    render() {
        const {graph_data, dropTimeBreakDown} = this.state;
        const {mydata, display_as} = this.props;
        
        for (var i = 0; i < 11;) {
            var d = 'bd_'+i;
            var data = { "name" : i, "value" : this.props.mydata.data.initial_break_down[d]}
            this.state.graph_data.push(data);   
            i++;
        }
        var data1 = { "name" : 15, "value" : this.props.mydata.data.initial_break_down.bd_15}
        this.state.graph_data.push(data1);   
        var data2 = { "name" : 20, "value" : this.props.mydata.data.initial_break_down.bd_20}
        this.state.graph_data.push(data2);   
        var data3 = { "name" : 25, "value" : this.props.mydata.data.initial_break_down.bd_25}
        this.state.graph_data.push(data3);   
        var data4 = { "name" : '25+', "value" : this.props.mydata.data.initial_break_down.bd_26}
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
                            { 
                                Object.keys(mydata.data.initial_break_down).map((item, i) =>
                                        <TableCell key={i}>{mydata.data.initial_break_down[item]}</TableCell>
                                ) 
                            }
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
                            <Line type="monotone" dataKey="value" stroke="#3367d6" activeDot={{r: 8}} />
                            
                        </LineChart>
                    </ResponsiveContainer>
                </Paper>}
            </div>
        );
    }
}

export default CallInitialQueuePositionBreakdown;
