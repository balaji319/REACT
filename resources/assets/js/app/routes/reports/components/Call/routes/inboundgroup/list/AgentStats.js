import { React,Table,TableBody,TableCell,TableHead,TableRow,Paper} from '../plugins';
import LinearProgress from '@material-ui/core/LinearProgress';
const BREAKDOWN_COL = 3;

class AgentStats extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            activeCol:0,
            data:[],
            global:[],
        }
    }
    clickCol = (i,name) =>{
        if(this.props.display_as =='HTML') 
        {
            this.setState({activeCol:i})
        }

    }

    render() {
        const {display_as} = this.props;
        const {activeCol,data,global} = this.state;
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
                                <TableRow>
                                    <TableCell>AGENT</TableCell>
                                    <TableCell onClick={()=>this.clickCol(1)}>CALLS</TableCell>
                                    <TableCell onClick={()=>this.clickCol(2)}>TIME H:M:S </TableCell>
                                    <TableCell onClick={()=>this.clickCol(3)}>AVERAGE </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                            {this.props.data.agent_stat_detail['agentdata'].map((val,key)=>
                                <TableRow key={key}>
                                    <TableCell>{this.props.data.agent_stat_detail['agentdata'][key].usergroup}</TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=1?'hide-td':''} colSpan={activeCol==1?BREAKDOWN_COL:1} >
                                        {activeCol==1?
                                        
                                            // <LinearProgress color="primary" variant="determinate" value={parseInt(400*this.props.data.agent_stat_detail['agentdata'][key].countusers/this.props.data.agent_stat_detail['agentdata'].agentmax)} />
                                            
                                            <div className="progress">
                                                <div
                                                    title={this.props.data.agent_stat_detail['agentdata'][key].countusers}
                                                    className={"progress-bar progress-bar-striped progress-bar-animated progress-bar-info"}
                                                    style={{
                                                        width:parseInt(400*this.props.data.agent_stat_detail['agentdata'][key].countusers/this.props.data.agent_stat_detail['agentdata'].agentmax),textAlign: 'right'
                                                    }}
                                                >{this.props.data.agent_stat_detail['agentdata'][key].countusers}</div>
                                            </div>

                                        :
                                            this.props.data.agent_stat_detail['agentdata'][key].countusers
                                        } 
                                    </TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=2?'hide-td':''} colSpan={activeCol==2?BREAKDOWN_COL:1} >
                                        {activeCol==2?
                                            // <LinearProgress color="primary" variant="determinate" value={parseInt(400*this.props.data.agent_stat_detail['agentdata'][key].countusers/this.props.data.agent_stat_detail['agentdata'].agentmax)} /> 
                                            
                                            <div className="progress">
                                                <div
                                                    title={this.props.data.agent_stat_detail['agentdata'][key].sum_len}
                                                    className={"progress-bar progress-bar-striped progress-bar-animated progress-bar-info"}
                                                    style={{
                                                        width:parseInt(400*this.props.data.agent_stat_detail['agentdata'][key].countusers/this.props.data.agent_stat_detail['agentdata'].agentmax),textAlign: 'right'
                                                    }}
                                                >{this.props.data.agent_stat_detail['agentdata'][key].sum_len}</div>
                                            </div>

                                            : 
                                            this.props.data.agent_stat_detail['agentdata'][key].sum_len
                                        } 
                                    </TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=3?'hide-td':''} colSpan={activeCol==3?BREAKDOWN_COL:1} >
                                        {activeCol==3?
                                        
                                            // <LinearProgress color="primary" variant="determinate" value={parseInt(400*this.props.data.agent_stat_detail['agentdata'][key].countusers/this.props.data.agent_stat_detail['agentdata'].agentmax)} /> 
                                            <div className="progress">
                                                <div
                                                    title={this.props.data.agent_stat_detail['agentdata'][key].avg_len}
                                                    className={"progress-bar progress-bar-striped progress-bar-animated progress-bar-info"}
                                                    style={{
                                                        width:parseInt(400*this.props.data.agent_stat_detail['agentdata'][key].countusers/this.props.data.agent_stat_detail['agentdata'].agentmax),textAlign: 'right'
                                                    }}
                                                >{this.props.data.agent_stat_detail['agentdata'][key].avg_len}</div>
                                            </div>
                                                : 
                                            this.props.data.agent_stat_detail['agentdata'][key].avg_len
                                        } 
                                    </TableCell>
                                </TableRow>
                            )}

                            <TableRow>
                                <TableCell>Total Agents {this.props.data.agent_stat_detail[0].total.agentcalls}</TableCell>
                                <TableCell className={activeCol!=0 && activeCol!=1?'hide-td':''} colSpan={activeCol==1?BREAKDOWN_COL:1}>{this.props.data.agent_stat_detail[0].total.agentcalls}</TableCell>
                                <TableCell className={activeCol!=0 && activeCol!=2?'hide-td':''} colSpan={activeCol==2?BREAKDOWN_COL:1}>{this.props.data.agent_stat_detail[0].total.sum_len}</TableCell>
                                <TableCell className={activeCol!=0 && activeCol!=3?'hide-td':''} colSpan={activeCol==3?BREAKDOWN_COL:1}>{this.props.data.agent_stat_detail[0].total.avg_len}</TableCell>
                            </TableRow> 
                              
                            </TableBody>
                        </Table>
                    </div>
                </Paper>
            </div>
        );
    }
}

export default AgentStats;

