import { React,Table,TableBody,TableCell,TableHead,TableRow,Paper} from '../plugins';
import LinearProgress from '@material-ui/core/LinearProgress';
const BREAKDOWN_COL = 11;

class CallHangupReasonStats extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {display_as} = this.props;
        return (
            <div>
            <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12">
                        <label style={{fontSize:20}}>CALL HANGUP REASON STATS:</label>
                        <button type="button" className="btn btn-raised btn-sm pull-right btn-success">CSV Download</button>
                    </div> 
                </div> 
                <Paper>
                    <div className="table-responsive-material">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>HANGUP REASON</TableCell>
                                    <TableCell style={display_as == 'HTML'? {width:70+'%'}:{width:50+'%'}}>CALLS</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.keys(this.props.data.hangup_stats).map((item, key) => 
                                <TableRow key={key}>
                                    <TableCell>{item}</TableCell>
                                    <TableCell>
                                        {display_as == 'HTML' ? 
                                            item != 'TOTAL' ?
                                            <div className="progress">
                                                <div
                                                    title={this.props.data.hangup_stats[item]}
                                                    className={"progress-bar progress-bar-striped progress-bar-animated progress-bar-info"}
                                                    style={{
                                                        width:this.props.data.hangup_stats[item],textAlign: 'right'
                                                    }}
                                                >{this.props.data.hangup_stats[item]}</div>
                                            </div>
                                            : 
                                            this.props.data.hangup_stats[item]
                                        : this.props.data.hangup_stats[item] }
                                    </TableCell>
                                </TableRow> 
                                )} 
                            </TableBody>
                        </Table>
                    </div>
                </Paper>
            </div>
        );
    }
}

export default CallHangupReasonStats;