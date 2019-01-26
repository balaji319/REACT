import { React,Table,TableBody,TableCell,TableHead,TableRow,Paper} from '../plugins';
import LinearProgress from '@material-ui/core/LinearProgress';
const BREAKDOWN_COL = 4;

class CallStatusStats extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            activeCol:0
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
        const {activeCol} = this.state;

        return (
            <div>
            <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12">
                        <label style={{fontSize:20}}>CALL STATUS STAT {activeCol}</label>
                        <button type="button" className="btn btn-raised btn-sm pull-right btn-success">CSV Download</button>
                    </div>
                </div> 
                <Paper>
                    <div className="table-responsive-material">
                        <Table>
                            <TableHead>
                                <TableRow>

                                    { display_as == 'TEXT' ? <TableCell>STATUS</TableCell> : <TableCell colSpan={3}>STATUS</TableCell>}
                                    { display_as == 'TEXT' ? <TableCell>DESCRIPTION</TableCell>:null}
                                    { display_as == 'TEXT' ? <TableCell>CATEGORY</TableCell>:null}
                                    <TableCell onClick={()=>this.clickCol(1)}>CALLS</TableCell>
                                    <TableCell onClick={()=>this.clickCol(2)}>TOTAL TIME </TableCell>
                                    <TableCell onClick={()=>this.clickCol(3)}>AVG TIME </TableCell>
                                    <TableCell onClick={()=>this.clickCol(4)}>CALL /HOUR </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.props.data.status_stats['statsdata'].map((val,key)=>
                                
                                    <TableRow key={key}>
                                        { display_as == 'HTML' ?<TableCell colSpan={3}>{this.props.data.status_stats['statsdata'][key].status+" "+this.props.data.status_stats['statsdata'][key].description+" "+this.props.data.status_stats['statsdata'][key].category}</TableCell>:null}
                                        { display_as == 'TEXT' ?<TableCell>{this.props.data.status_stats['statsdata'][key].status}</TableCell>:null}
                                        { display_as == 'TEXT' ?<TableCell>{this.props.data.status_stats['statsdata'][key].description}</TableCell>:null}
                                        { display_as == 'TEXT' ?<TableCell>{this.props.data.status_stats['statsdata'][key].category}</TableCell>:null}
                                        <TableCell className={activeCol!=0 && activeCol!=1?'hide-td':''} colSpan={activeCol==1?BREAKDOWN_COL:1} >
                                            {activeCol==1?
                                                <div className="progress">
                                                    <div
                                                        title={parseInt(400*this.props.data.status_stats['statsdata'][key].calls/this.props.data.maxstatusstate)}
                                                        className={"progress-bar progress-bar-striped progress-bar-animated progress-bar-info"}
                                                        style={{
                                                            width:parseInt(400*this.props.data.status_stats['statsdata'][key].calls/this.props.data.maxstatusstate),textAlign: 'right'
                                                        }}
                                                    >{parseInt(400*this.props.data.status_stats['statsdata'][key].calls/this.props.data.maxstatusstate)}</div>
                                                </div>
                                            :
                                                this.props.data.status_stats['statsdata'][key].calls}
                                        </TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=2?'hide-td':''} colSpan={activeCol==2?BREAKDOWN_COL:1} >
                                            {activeCol==2?
                                            
                                            <div className="progress">
                                                <div
                                                    title={this.props.data.status_stats['statsdata'][key].calls}
                                                    className={"progress-bar progress-bar-striped progress-bar-animated progress-bar-info"}
                                                    style={{
                                                        width:parseInt(400*this.props.data.status_stats['statsdata'][key].calls/this.props.data.maxstatusstate),textAlign: 'right'
                                                    }}
                                                >{this.props.data.status_stats['statsdata'][key].calls}</div>
                                            </div>
                                            :
                                            this.props.data.status_stats['statsdata'][key].totTime}
                                        </TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=3?'hide-td':''} colSpan={activeCol==3?BREAKDOWN_COL:1} >
                                            {activeCol==3?
                                            
                                            <div className="progress">
                                                <div
                                                    title={this.props.data.status_stats['statsdata'][key].calls}
                                                    className={"progress-bar progress-bar-striped progress-bar-animated progress-bar-info"}
                                                    style={{
                                                        width:parseInt(400*this.props.data.status_stats['statsdata'][key].calls/this.props.data.maxstatusstate),textAlign: 'right'
                                                    }}
                                                >{this.props.data.status_stats['statsdata'][key].calls}</div>
                                            </div>
                                            :
                                            this.props.data.status_stats['statsdata'][key].avg_sec}
                                         </TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=4?'hide-td':''} colSpan={activeCol==4?BREAKDOWN_COL:1} >
                                            {activeCol==4?
                                            
                                            <div className="progress">
                                                <div
                                                    title={this.props.data.status_stats['statsdata'][key].callperhour}
                                                    className={"progress-bar progress-bar-striped progress-bar-animated progress-bar-info"}
                                                    style={{
                                                        width:parseInt(400*this.props.data.status_stats['statsdata'][key].calls/this.props.data.maxstatusstate),textAlign: 'right'
                                                    }}
                                                >{this.props.data.status_stats['statsdata'][key].callperhour}</div>
                                            </div>
                                            :
                                            this.props.data.status_stats['statsdata'][key].callperhour} 
                                        </TableCell> 
                                    </TableRow>
                                )}
                             
                                <TableRow>
                                    <TableCell>Total</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=1?'hide-td':''} colSpan={activeCol==1?BREAKDOWN_COL:1}>{this.props.data.status_stats[0].total.calls}</TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=2?'hide-td':''} colSpan={activeCol==2?BREAKDOWN_COL:1}>{this.props.data.status_stats[0].total.totTime}</TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=3?'hide-td':''} colSpan={activeCol==3?BREAKDOWN_COL:1}>{this.props.data.status_stats[0].total.avg_sec}</TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=4?'hide-td':''} colSpan={activeCol==4?BREAKDOWN_COL:1}>{Number.parseFloat(this.props.data.status_stats[0].total.callperhour).toFixed(2)}</TableCell>
                                </TableRow> 
                            </TableBody>
                        </Table>



                    </div>
                </Paper>
            </div>
        );
    }
}

export default CallStatusStats;

