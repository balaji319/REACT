import { React,Table,TableBody,TableCell,TableHead,TableRow,Paper} from '../plugins';
import LinearProgress from '@material-ui/core/LinearProgress';
const BREAKDOWN_COL = 11;

const myClass={
    // width:'2.5px',
    // height:'10px',
}

class CommanTable extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            activeCol:0,
            indicator:[],
            totalcalllogs : [],
            all_drop_call_details : [],
            queue_calls_data : [],
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            indicator : nextProps.data.indicators,
            totalcalllogs : nextProps.data.total_call_log,
            all_drop_call_details : nextProps.data.all_drop_call_details,
            queue_calls_data : nextProps.data.queue_calls_data,
        });
    }


    render() {
        const {queue_calls_data,indicator,totalcalllogs,all_drop_call_details} = this.state;
        const {display_as} = this.props;

        const col60 = {
            width: '60%',
            textAlign: 'left'
        };

        const col40 = {
            width: '40%',
            textAlign: 'left'
        };

        return (
            <div>
                <Paper>
                    <div className="table-responsive-material">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell colSpan={2}>TOTAL </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell style={col60}>Total calls taken in to this In-Group:</TableCell>
                                    <TableCell style={col40}>{this.props.data.total_call_log.total_calls}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell style={col60}>Average Call Length for all Calls:</TableCell>
                                    <TableCell style={col40}>{
                                        parseFloat(Math.round(this.props.data.total_call_log.avg_all_call * 100) / 100).toFixed(2)
                                        }</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell style={col60}> Answered Calls: </TableCell>
                                    <TableCell style={col40}>{this.props.data.total_call_log.total_answer_call} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {this.props.data.total_call_log.answer_percentage} %</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell style={col60}>  Average queue time for Answered Calls:</TableCell>
                                    <TableCell style={col40}>{this.props.data.total_call_log.average_answer} &nbsp;seconds</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell style={col60}> Calls taken into the IVR for this In-Group:</TableCell>
                                    <TableCell style={col40}> {this.props.data.total_call_log.total_ivr}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </Paper>
                <br/>

                <Paper>
                    <div className="table-responsive-material">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell colSpan={2}>DROPS</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow key={1}>
                                    <TableCell style={col60}>Total DROP Calls:</TableCell>
                                    <TableCell style={col40}>{this.props.data.all_drop_call_details.total_drop_calls}+&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{ this.props.data.all_drop_call_details.drop_percentage} %&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;drop/answered:&nbsp;&nbsp;&nbsp;&nbsp;{this.props.data.indicators.drop_answered_percent} %</TableCell>
                                </TableRow>
                                <TableRow key={2}>
                                    <TableCell style={col60}>Average hold time for DROP Calls:</TableCell>
                                    <TableCell style={col40}>{
                                        parseFloat(Math.round(this.props.data.all_drop_call_details.average_hold_time * 100) / 100).toFixed(2)
                                        } &nbsp;seconds</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </Paper>
                <br/>

                <Paper>
                    <div className="table-responsive-material">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell colSpan={2}>CUSTOM INDICATORS</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell style={col60}>GDE (Answered/Total calls taken in to this In-Group):</TableCell>
                                    <TableCell style={col40}>{this.props.data.total_call_log.answer_percentage} %</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell style={col60}>ACR (Dropped/Answered):</TableCell>
                                    <TableCell style={col40}> {this.props.data.indicators.drop_answered_percent} %</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell style={col60}> TMR1 (Answered within {this.props.data.indicators.answer_one}  seconds/Answered): </TableCell>
                                    <TableCell style={col40}> {this.props.data.indicators.pct_answer_sec_pct_rt_stat_one} %</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell style={col60}> TMR2 (Answered within {this.props.data.indicators.answer_two}  seconds/Answered): </TableCell>
                                    <TableCell style={col40}> {this.props.data.indicators.pct_answer_sec_pct_rt_stat_two} %</TableCell>
                                </TableRow>
                        
                            </TableBody>
                        </Table>
                    </div>
                </Paper>
                <br/>

                <Paper>
                    <div className="table-responsive-material">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell colSpan={2}>QUEUE STATS</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell style={col60}>Total Calls That entered Queue: </TableCell>
                                    <TableCell style={col40}>{this.props.data.queue_calls_data.total_queued} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{this.props.data.queue_calls_data.queue_call_percent} %</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell style={col60}>Average QUEUE Length for queue calls:</TableCell>
                                    <TableCell style={col40}> {this.props.data.queue_calls_data.avg_second_for_queued} Seconds</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell style={col60}> Average QUEUE Length across all calls: </TableCell>
                                    <TableCell style={col40}> {this.props.data.queue_calls_data.avg_second_for_all} Seconds</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </Paper>
            </div>
        );
    }
}

export default CommanTable;
