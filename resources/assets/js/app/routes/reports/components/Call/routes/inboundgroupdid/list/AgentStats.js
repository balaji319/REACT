import { React,Table,TableBody,TableCell,TableHead,TableRow,Paper} from '../plugins';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
const BREAKDOWN_COL = 3;

class AgentStats extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            activeCol:1,
            colName :'agentcalls',
        }
    }
        
    clickCol = (i,name) =>{
        this.setState({
            activeCol:i,
            colName:name,
        })
    }

    render() {
        const {display_as, mydata} = this.props;
        const {activeCol,colName} = this.state;
        return (
            <div>
            <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12">
                        <label style={{fontSize:20}}>AGENT STATS </label>
                        <button type="button" className="btn btn-raised btn-sm pull-right btn-success">CSV Download</button>
                    </div>
                </div> 
                <Paper>
                    <div className="table-responsive-material">
                        <Table>
                            <TableHead>
                            {display_as == "TEXT" ?
                                <TableRow>
                                    <TableCell>AGENT</TableCell>
                                    <TableCell>CALLS</TableCell>
                                    <TableCell>TIME H:M:S </TableCell>
                                    <TableCell>AVERAGE </TableCell>
                                </TableRow>                                
                                :
                                <TableRow>
                                    <TableCell>AGENT</TableCell>
                                    <TableCell onClick={()=>this.clickCol(1, 'agentcalls')}>CALLS</TableCell>
                                    <TableCell onClick={()=>this.clickCol(2, 'sum_len')}>TIME H:M:S </TableCell>
                                    <TableCell onClick={()=>this.clickCol(3, 'avg_len')}>AVERAGE </TableCell>
                                </TableRow>
                            }                                
                            </TableHead>
                            <TableBody>
                            {display_as == "TEXT" ?
                                [mydata.data.agent_stat_detail['agentdata'].map((val,key)=>
                                <TableRow key= {key}>
                                    <TableCell>{mydata.data.agent_stat_detail['agentdata'][key].usergroup}</TableCell>
                                    <TableCell>{mydata.data.agent_stat_detail['agentdata'][key].countusers}</TableCell>
                                    <TableCell>{mydata.data.agent_stat_detail['agentdata'][key].sum_len}</TableCell>
                                    <TableCell>{mydata.data.agent_stat_detail['agentdata'][key].avg_len}</TableCell>
                                </TableRow>                                
                                ),
                                <TableRow key={4}>
                                    <TableCell>Total Agents:{mydata.data.countAgent}</TableCell>
                                    <TableCell>{mydata.data.agent_stat_detail[0].total.agentcalls}</TableCell>
                                    <TableCell>{mydata.data.agent_stat_detail[0].total.sum_len}</TableCell>
                                    <TableCell>{mydata.data.agent_stat_detail[0].total.avg_len}</TableCell>
                                </TableRow>]
                            :
                                [mydata.data.agent_stat_detail['agentdata'].map((val,key)=>
                                <TableRow key={key}>
                                    <TableCell>{mydata.data.agent_stat_detail['agentdata'][key].usergroup}</TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!= 1?'hide-td':''} colSpan={activeCol==1?3:1}>                                        
                                        <div className="progress">
                                            <div
                                                title={mydata.data.agent_stat_detail['agentdata'][key].countusers}
                                                className={"progress-bar progress-bar-striped progress-bar-animated progress-bar-info"}
                                                style={{
                                                    width:mydata.data.agent_stat_detail['agentdata'][key].countusers,textAlign: 'right'
                                                }}
                                            >{mydata.data.agent_stat_detail['agentdata'][key].countusers}</div>
                                        </div>
                                    </TableCell> 
                                        
                                    <TableCell className={activeCol!=0 && activeCol!= 2?'hide-td':''} colSpan={activeCol==2?3:1}>
                                       
                                        <div className="progress">
                                            <div
                                                title={mydata.data.agent_stat_detail['agentdata'][key].sum_len}
                                                className={"progress-bar progress-bar-striped progress-bar-animated progress-bar-info"}
                                                style={{
                                                    width:mydata.data.agent_stat_detail['agentdata'][key].sum_len,textAlign: 'right'
                                                }}
                                            >{mydata.data.agent_stat_detail['agentdata'][key].sum_len}</div>
                                        </div>
                                    </TableCell>       
                                    <TableCell className={activeCol!=0 && activeCol!= 3?'hide-td':''} colSpan={activeCol==3?3:1}>
                                       
                                        <div className="progress">
                                            <div
                                                title={mydata.data.agent_stat_detail['agentdata'][key].avg_len}
                                                className={"progress-bar progress-bar-striped progress-bar-animated progress-bar-info"}
                                                style={{
                                                    width:mydata.data.agent_stat_detail['agentdata'][key].avg_len,textAlign: 'right'
                                                }}
                                            >{mydata.data.agent_stat_detail['agentdata'][key].avg_len}</div>
                                        </div>
                                    </TableCell>       
                                </TableRow>
                                ),
                                <TableRow key={4}>
                                        <TableCell>Total Agents:{mydata.data.countAgent}</TableCell>
                                        <TableCell colSpan={BREAKDOWN_COL} >{mydata.data.agent_stat_detail[0].total[colName]}</TableCell>                                        
                                </TableRow>]}
                            </TableBody>
                        </Table>
                    </div>
                </Paper>
            </div>
        );
    }
}

export default AgentStats;

