import { React,Table,TableBody,TableCell,TableHead,TableRow,Paper} from '../plugins';
import LinearProgress from '@material-ui/core/LinearProgress';

class CommanTable extends React.Component {
    constructor(props) {
        super(props);        
    }

    render() {
        const {display_as, mydata} = this.props;
        return (
            <div>
                <Paper>
                    <div className="table-responsive-material">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell colSpan={2}>TOTAL</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow key={1}>
                                    <TableCell>Total calls taken in to this In-Group:</TableCell>
                                    <TableCell>{mydata.data.total_call_log.totalcalls}</TableCell>
                                </TableRow>
                                <TableRow key={2}>
                                    <TableCell>Average Call Length for all Calls:</TableCell>
                                    <TableCell> {mydata.data.total_call_log.AvgAllCall} seconds</TableCell>
                                </TableRow>
                                <TableRow key={3}>
                                    <TableCell> Answered Calls: </TableCell>
                                    <TableCell>  {mydata.data.total_call_log.totalanswercall}  {mydata.data.total_call_log.answer_percentage}%</TableCell>
                                </TableRow>
                                <TableRow key={4}>
                                    <TableCell>  Average queue time for Answered Calls:</TableCell>
                                    <TableCell> {mydata.data.total_call_log.Averageanswer} seconds</TableCell>
                                </TableRow>
                                <TableRow key={5}>
                                    <TableCell> Calls taken into the IVR for this In-Group:</TableCell>
                                    <TableCell> {mydata.data.total_call_log.totalIVR}</TableCell>
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
                                    <TableCell>Total DROP Calls:</TableCell>
                                    <TableCell>{mydata.data.all_drop_call_details.totaldropcalls} {mydata.data.all_drop_call_details.Droppercentage}% drop/answered: {mydata.data.indicators.drop_answered_percent}%</TableCell>
                                </TableRow>
                                <TableRow key={2}>
                                    <TableCell>Average hold time for DROP Calls:</TableCell>
                                    <TableCell> {mydata.data.all_drop_call_details.average_hold_time} seconds</TableCell>
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
                                <TableRow key={1}>
                                    <TableCell>GDE (Answered/Total calls taken in to this In-Group):</TableCell>
                                    <TableCell>{mydata.data.total_call_log.answer_percentage}%</TableCell>
                                </TableRow>
                                <TableRow key={2}>
                                    <TableCell>ACR (Dropped/Answered):</TableCell>
                                    <TableCell>{mydata.data.indicators.drop_answered_percent}%</TableCell>
                                </TableRow>
                                <TableRow key={3}>
                                    <TableCell> TMR1 (Answered within {mydata.data.indicators.answerone}  seconds/Answered): </TableCell>
                                    <TableCell> {mydata.data.indicators.pct_answer_sec_pct_rt_stat_one}%</TableCell>
                                </TableRow>
                                <TableRow key={4}>
                                    <TableCell>  TMR2 (Answered within {mydata.data.indicators.answertwo} seconds/Answered):</TableCell>
                                    <TableCell>  {mydata.data.indicators.pct_answer_sec_pct_rt_stat_two}%</TableCell>
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
                                <TableRow key={1}>
                                    <TableCell>Total Calls That entered Queue: </TableCell>
                                    <TableCell>{mydata.data.queue_call_details.totalqueued} {mydata.data.queue_call_details.queueCallPercent}%</TableCell>
                                </TableRow>
                                <TableRow key={2}>
                                    <TableCell>Average QUEUE Length for queue calls:</TableCell>
                                    <TableCell> {mydata.data.queue_call_details.avgsecondforqueued} Seconds</TableCell>
                                </TableRow>
                                <TableRow key={3}>
                                    <TableCell> Average QUEUE Length across all calls: </TableCell>
                                    <TableCell> {mydata.data.queue_call_details.avgsecondforall} Seconds</TableCell>
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
