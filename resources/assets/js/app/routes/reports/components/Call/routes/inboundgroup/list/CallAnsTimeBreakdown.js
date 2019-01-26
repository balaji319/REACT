import { React,Table,TableBody,TableCell,TableHead,TableRow,Paper} from '../plugins';
import LinearProgress from '@material-ui/core/LinearProgress';
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

const BREAKDOWN_COL = 11;

class CallAnsTimeBreakdown extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            graph_data : []
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            graph_data:[]
        });
    }


    render() {
        const {graph_data,interval,int_percentage,cumulative,cumulative_percentage,cumulative_answer_percentage,} = this.state;
        const {display_as} = this.props;


        for (var i = 0; i < 61;) {
            var d = 'ad_'+i;
            var data = { "name" : i, "pv" : this.props.data.answer_percent_breakdown.interval[d]}
            this.state.graph_data.push(data);   
            i=i+5;
        }
        var data = { "name" : 90, "pv" : this.props.data.answer_percent_breakdown.interval.hd_90}
        this.state.graph_data.push(data);   
        var data = { "name" : '99+', "pv" : this.props.data.answer_percent_breakdown.interval.hd_99}
        this.state.graph_data.push(data);   

        return (
            <div>
                <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12">
                        <label style={{fontSize:20}}>CALL ANSWERED TIME AND PERCENT BREAKDOWN IN SECONDS</label>
                    </div>
                </div>
                {display_as == "TEXT" ?
                <Paper>
                    <div className="table-responsive-material">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell></TableCell>
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
                                    <TableCell>INTERVAL</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.interval.ad_0}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.interval.ad_5}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.interval.ad_10}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.interval.ad_15}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.interval.ad_20}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.interval.ad_25}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.interval.ad_30}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.interval.ad_35}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.interval.ad_40}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.interval.ad_45}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.interval.ad_50}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.interval.ad_55}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.interval.ad_60}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.interval.ad_90}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.interval.ad_99}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.interval.total}</TableCell>
                                    
                                </TableRow>           
                                 <TableRow>
                                    <TableCell>INT % </TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.int_percentage.pad_0}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.int_percentage.pad_5}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.int_percentage.pad_10}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.int_percentage.pad_15}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.int_percentage.pad_20}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.int_percentage.pad_25}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.int_percentage.pad_30}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.int_percentage.pad_35}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.int_percentage.pad_40}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.int_percentage.pad_45}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.int_percentage.pad_50}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.int_percentage.pad_55}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.int_percentage.pad_60}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.int_percentage.pad_90}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.int_percentage.pad_99}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.int_percentage.total}</TableCell>
                                </TableRow>

                                <TableRow>
                                    <TableCell>CUMULATIVE</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative.cad_0}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative.cad_5}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative.cad_10}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative.cad_15}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative.cad_20}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative.cad_25}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative.cad_30}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative.cad_35}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative.cad_40}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative.cad_45}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative.cad_50}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative.cad_55}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative.cad_60}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative.cad_90}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative.cad_99}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative.total}</TableCell>
                                </TableRow>

                                <TableRow>
                                    <TableCell>CUM %	</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_percentage.pcad_0}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_percentage.pcad_5}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_percentage.pcad_10}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_percentage.pcad_15}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_percentage.pcad_20}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_percentage.pcad_25}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_percentage.pcad_30}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_percentage.pcad_35}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_percentage.pcad_40}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_percentage.pcad_45}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_percentage.pcad_50}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_percentage.pcad_55}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_percentage.pcad_60}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_percentage.pcad_90}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_percentage.pcad_99}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_percentage.total}</TableCell>
                                </TableRow>

                                <TableRow>
                                    <TableCell>CUM ANS%	</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_answer_percentage.apcad_0}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_answer_percentage.apcad_5}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_answer_percentage.apcad_10}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_answer_percentage.apcad_15}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_answer_percentage.apcad_20}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_answer_percentage.apcad_25}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_answer_percentage.apcad_30}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_answer_percentage.apcad_35}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_answer_percentage.apcad_40}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_answer_percentage.apcad_45}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_answer_percentage.apcad_50}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_answer_percentage.apcad_55}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_answer_percentage.apcad_60}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_answer_percentage.apcad_90}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_answer_percentage.apcad_99}</TableCell>
                                    <TableCell>{this.props.data.answer_percent_breakdown.cumulative_answer_percentage.total}</TableCell>
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

export default CallAnsTimeBreakdown;
