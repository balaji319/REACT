import { React,Table,TableBody,TableCell,TableHead,TableRow,Paper} from '../plugins';
import LinearProgress from '@material-ui/core/LinearProgress';
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

const BREAKDOWN_COL = 11;

class CallDropTimeBreakdown extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            graph_data : [],
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            graph_data:[]
        });
    }



    render() {

        const {graph_data} = this.state;
        const {display_as} = this.props;

        for (var i = 0; i < 61;) {
            var d = 'dd_'+i;
            var data = { "name" : i, "pv" : this.props.data.drop_time_breakdown[d]}
            this.state.graph_data.push(data);   
            i=i+5;
        }
        var data = { "name" : 90, "pv" : this.props.data.drop_time_breakdown.dd_90}
        this.state.graph_data.push(data);   
        var data = { "name" : '99+', "pv" : this.props.data.drop_time_breakdown.dd_99}
        this.state.graph_data.push(data);   

        return (
            <div>
                <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12">
                        <label style={{fontSize:20}}>CALL DROP TIME BREAKDOWN IN SECONDS:</label>
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
                                <TableCell>5</TableCell>
                                <TableCell>10</TableCell>
                                <TableCell>15</TableCell>
                                <TableCell>20</TableCell>
                                <TableCell>25</TableCell>
                                <TableCell>30</TableCell>
                                <TableCell>35</TableCell>
                                <TableCell>40</TableCell>
                                <TableCell>45</TableCell>
                                <TableCell>50</TableCell>
                                <TableCell>55</TableCell>
                                <TableCell>60</TableCell>
                                <TableCell>90</TableCell>
                                <TableCell>90+</TableCell>
                                <TableCell>Total</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        
                            <TableRow>
                                <TableCell>{this.props.data.drop_time_breakdown.dd_0}</TableCell>
                                <TableCell>{this.props.data.drop_time_breakdown.dd_5}</TableCell>
                                <TableCell>{this.props.data.drop_time_breakdown.dd_10}</TableCell>
                                <TableCell>{this.props.data.drop_time_breakdown.dd_15}</TableCell>
                                <TableCell>{this.props.data.drop_time_breakdown.dd_20}</TableCell>
                                <TableCell>{this.props.data.drop_time_breakdown.dd_25}</TableCell>
                                <TableCell>{this.props.data.drop_time_breakdown.dd_30}</TableCell>
                                <TableCell>{this.props.data.drop_time_breakdown.dd_35}</TableCell>
                                <TableCell>{this.props.data.drop_time_breakdown.dd_40}</TableCell>
                                <TableCell>{this.props.data.drop_time_breakdown.dd_45}</TableCell>
                                <TableCell>{this.props.data.drop_time_breakdown.dd_50}</TableCell>
                                <TableCell>{this.props.data.drop_time_breakdown.dd_55}</TableCell>
                                <TableCell>{this.props.data.drop_time_breakdown.dd_60}</TableCell>
                                <TableCell>{this.props.data.drop_time_breakdown.dd_90}</TableCell>
                                <TableCell>{this.props.data.drop_time_breakdown.dd_99}</TableCell>
                                <TableCell>{this.props.data.drop_time_breakdown.total}</TableCell>
                            </TableRow>
                        
                        </TableBody>
                    </Table>
                </div>
            </Paper> :
                <Paper>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={this.state.graph_data}
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
export default CallDropTimeBreakdown;
