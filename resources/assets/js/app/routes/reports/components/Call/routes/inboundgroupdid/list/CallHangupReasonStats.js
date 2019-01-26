import { React,Table,TableBody,TableCell,TableHead,TableRow,Paper} from '../plugins';
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";

class CallHangupReasonStats extends React.Component {
    constructor(props) {
        super(props);
    }    

    render() {
        const {display_as, mydata} = this.props;
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
                                    <TableCell>CALLS</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.keys(mydata.data.HangupStats).map((item, key) => 
                                <TableRow key={key}>
                                    <TableCell>{item}</TableCell>
                                    <TableCell>
                                        {display_as == 'HTML' && item != "TOTAL"?                                         
                                            
                                            <div className="progress">
                                                <div
                                                    title={mydata.data.HangupStats[item]}
                                                    className={"progress-bar progress-bar-striped progress-bar-animated progress-bar-info"}
                                                    style={{
                                                        width:mydata.data.HangupStats[item],textAlign: 'right'
                                                    }}
                                                >{mydata.data.HangupStats[item]}</div>
                                            </div>
                        
                                                                                  
                                            : mydata.data.HangupStats[item] }
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