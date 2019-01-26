import { React,Table,TableBody,TableCell,TableHead,TableRow,Paper} from './plugins';
import LinearProgress from '@material-ui/core/LinearProgress';
const BREAKDOWN_COL = 9;
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";

class OutboundSummaryIntervalHtml extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            activeCol:1,
            colName:'CALLS',
            data : [],
            global : [], 
        }
    }

    clickCol = (i,name) =>{
        this.setState({
            activeCol:i,
            colName:name
        })
    }

    render() {
        const {display_as} = this.props;
        const {activeCol,data,global} = this.state;
    
        return (
            <div>
                <Paper>
                    <div className="table-responsive-material">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell onClick={()=>this.clickCol(1,'CALLS')}>CALLS  </TableCell>
                                    <TableCell onClick={()=>this.clickCol(2,'SYSTEM RELEASE CALLS')}>SYSTEM RELEASE CALLS </TableCell>
                                    <TableCell onClick={()=>this.clickCol(3,'AGENT RELEASE CALLS')}>AGENT RELEASE CALLS </TableCell>
                                    <TableCell onClick={()=>this.clickCol(4,'SALE CALLS')}>SALE CALLS   </TableCell>
                                    <TableCell onClick={()=>this.clickCol(5,'DNC CALLS')}>DNC CALLS    </TableCell>
                                    <TableCell onClick={()=>this.clickCol(6,'NO ANSWER PERCENT')}>NO ANSWER PERCENT    </TableCell>
                                    <TableCell onClick={()=>this.clickCol(7,'DROP PERCENT')}>DROP PERCENT </TableCell>
                                    <TableCell onClick={()=>this.clickCol(8,'AGENT LOGIN TIME')}>AGENT LOGIN TIME  </TableCell>
                                    <TableCell onClick={()=>this.clickCol(9,'AGENT PAUSE TIME')}>AGENT PAUSE TIME</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={4}>INTERVAL</TableCell>
                                    <TableCell colSpan={5}>{this.state.colName}</TableCell>
                                </TableRow>
                                <TableRow >
                                    <TableCell style={{textAlign:'center'}} colSpan={9}>{this.props.campaign_id +" - "+this.props.campaign_name}    INTERVAL BREAKDOWN:</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.props.data.map((v,k)=>
                                
                                <TableRow key={k}>
                                    <TableCell>{this.props.data[k][0]}</TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=1?'hide-td':''} colSpan={activeCol==1?BREAKDOWN_COL:1}>
                                    {activeCol==1? this.props.data[k][1] : this.props.data[k][1]}
                                    </TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=2?'hide-td':''} colSpan={activeCol==2?BREAKDOWN_COL:1}>
                                    {activeCol==2? this.props.data[k][2] : this.props.data[k][2]} 
                                    </TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=3?'hide-td':''} colSpan={activeCol==3?BREAKDOWN_COL:1}>
                                        {activeCol==3? this.props.data[k][3] : this.props.data[k][3]}
                                    </TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=4?'hide-td':''} colSpan={activeCol==4?BREAKDOWN_COL:1}>
                                        {activeCol==4? this.props.data[k][4] : this.props.data[k][4]} 
                                    </TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=5?'hide-td':''} colSpan={activeCol==5?BREAKDOWN_COL:1}>
                                        {activeCol==5? this.props.data[k][5] : this.props.data[k][5]} 
                                    </TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=6?'hide-td':''} colSpan={activeCol==6?BREAKDOWN_COL:1}>
                                        {activeCol==6? this.props.data[k][6] : this.props.data[k][6]}%
                                    </TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=7?'hide-td':''} colSpan={activeCol==7?BREAKDOWN_COL:1}>
                                        {activeCol==7? this.props.data[k][7] : this.props.data[k][7]}%
                                    </TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=8?'hide-td':''} colSpan={activeCol==8?BREAKDOWN_COL:1}>
                                        {activeCol==8? this.props.data[k][10] : this.props.data[k][10]}
                                    </TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=9?'hide-td':''} colSpan={activeCol==9?BREAKDOWN_COL:1}>
                                        {activeCol==9? this.props.data[k][11] : this.props.data[k][11]}
                                    </TableCell>
                                </TableRow>
                                )}

                                <TableRow>
                                    <TableCell>Total</TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=1?'hide-td':''} colSpan={activeCol==1?BREAKDOWN_COL:1}>{this.props.data1.totalcallevents} </TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=2?'hide-td':''} colSpan={activeCol==2?BREAKDOWN_COL:1}>{this.props.data1.totalsystemcalls}</TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=3?'hide-td':''} colSpan={activeCol==3?BREAKDOWN_COL:1}>{this.props.data1.totalagentscalls} </TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=4?'hide-td':''} colSpan={activeCol==4?BREAKDOWN_COL:1}>{this.props.data1.totalsalecallsarray}</TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=5?'hide-td':''} colSpan={activeCol==5?BREAKDOWN_COL:1}>{this.props.data1.totaldnccallsarray}</TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=6?'hide-td':''} colSpan={activeCol==6?BREAKDOWN_COL:1}>{this.props.data1.gna_percent}%    </TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=7?'hide-td':''} colSpan={activeCol==7?BREAKDOWN_COL:1}>{this.props.data1.gdroppercent}% </TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=8?'hide-td':''} colSpan={activeCol==8?BREAKDOWN_COL:1}>{this.props.data1.loginagent_sec}</TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=9?'hide-td':''} colSpan={activeCol==9?BREAKDOWN_COL:1}>{this.props.data1.pauseagent_sec}</TableCell>
                                </TableRow>

                            </TableBody>
                        </Table>
                        <br/>
                    </div>
                </Paper>
            </div>
        );
    }
}

export default OutboundSummaryIntervalHtml;

