import { React,Table,TableBody,TableCell,TableHead,TableRow,Paper} from '../plugins';
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
const BREAKDOWN_COL = 4;

class CallStatusStats extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            activeCol:1,
            colName :'calls',
            statsData : this.props.mydata.data.StatusStats['statsdata'],
            statsTotal : this.props.mydata.data.StatusStats[0].total,
        }
    }
    
    clickCol = (i,name) =>{
        this.setState({
            activeCol:i,
            colName:name,            
        })
    }
    
    render() {
        const {display_as} = this.props;
        const {activeCol,colName, statsData,statsTotal} = this.state;
        return (
            <div>
            <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12">
                        <label style={{fontSize:20}}>CALL STATUS STAT</label>
                        <button type="button" className="btn btn-raised btn-sm pull-right btn-success">CSV Download</button>
                    </div>
                </div> 
                <Paper>
                    <div className="table-responsive-material">  
                        <Table>
                            <TableHead>
                                {display_as == "TEXT" ?
                                    <TableRow>
                                        <TableCell>STATUS</TableCell>
                                        <TableCell>DESCRIPTION</TableCell>
                                        <TableCell>CATEGORY</TableCell>
                                        <TableCell>CALLS</TableCell>
                                        <TableCell>TOTAL TIME</TableCell>
                                        <TableCell>AVG TIME</TableCell>
                                        <TableCell>CALL/HOUR</TableCell>
                                    </TableRow>
                                    :
                                    <TableRow>
                                        <TableCell>STATUS</TableCell>
                                        <TableCell onClick={()=>this.clickCol(1, 'calls')}>CALLS</TableCell>
                                        <TableCell onClick={()=>this.clickCol(2, 'totTime')}>TOTAL TIME</TableCell>
                                        <TableCell onClick={()=>this.clickCol(3, 'avg_sec')}>AVG TIME</TableCell>
                                        <TableCell onClick={()=>this.clickCol(4, 'callperhour')}>CALL/HOUR</TableCell>
                                    </TableRow>
                                }
                            </TableHead>
                            <TableBody>
                            {display_as == "TEXT" ?
                                [statsData.map((key, val) =>
                                    <TableRow key={val}>
                                        <TableCell>{statsData[val].status}</TableCell>
                                        <TableCell>{statsData[val].description}</TableCell>
                                        <TableCell>{statsData[val].category}</TableCell>
                                        <TableCell>{statsData[val].calls}</TableCell>
                                        <TableCell>{statsData[val].totTime}</TableCell>
                                        <TableCell>{statsData[val].avg_sec}</TableCell>
                                        <TableCell>{statsData[val].callperhour}</TableCell>
                                    </TableRow>
                                ),
                                <TableRow key={4}>
                                    <TableCell>Total</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell>{statsTotal.calls}</TableCell>
                                    <TableCell>{statsTotal.totTime}</TableCell>
                                    <TableCell>{statsTotal.avg_sec}</TableCell>
                                    <TableCell>{statsTotal.callperhour}</TableCell>
                                </TableRow>] 
                                : 
                                [statsData.map((key,val)=>
                                <TableRow key={val}>
                                    <TableCell>{statsData[val].status} {statsData[val].description} {statsData[val].category}</TableCell>
                            
                                    <TableCell className={activeCol!=0 && activeCol!= 1?'hide-td':''} colSpan={activeCol==1?4:1}>
                                        
                                        <div className="progress">
                                            <div
                                                title={statsData[val].calls}
                                                className={"progress-bar progress-bar-striped progress-bar-animated progress-bar-info"}
                                                style={{
                                                    width:statsData[val].calls,textAlign: 'right'
                                                }}
                                            >{statsData[val].calls}</div>
                                        </div>
                                    </TableCell> 
                            
                                    <TableCell className={activeCol!=0 && activeCol!= 2?'hide-td':''} colSpan={activeCol==2?4:1}>
                                       
                                         <div className="progress">
                                            <div
                                                title={statsData[val].totTime}
                                                className={"progress-bar progress-bar-striped progress-bar-animated progress-bar-info"}
                                                style={{
                                                    width:statsData[val].totTime,textAlign: 'right'
                                                }}
                                            >{statsData[val].totTime}</div>
                                        </div>
                                    </TableCell>
                                    
                                    <TableCell className={activeCol!=0 && activeCol!= 3?'hide-td':''} colSpan={activeCol==3?4:1}>
                                       
                                        <div className="progress">
                                            <div
                                                title={statsData[val].avg_sec}
                                                className={"progress-bar progress-bar-striped progress-bar-animated progress-bar-info"}
                                                style={{
                                                    width:statsData[val].avg_sec,textAlign: 'right'
                                                }}
                                            >{statsData[val].avg_sec}</div>
                                        </div>
                                    </TableCell>
                            
                                    <TableCell className={activeCol!=0 && activeCol!= 4?'hide-td':''} colSpan={activeCol==4?4:1}>
                                        
                                        <div className="progress">
                                            <div
                                                title={statsData[val].callperhour}
                                                className={"progress-bar progress-bar-striped progress-bar-animated progress-bar-info"}
                                                style={{
                                                    width:statsData[val].callperhour,textAlign: 'right'
                                                }}
                                            >{statsData[val].callperhour}</div>
                                        </div>
                                    </TableCell>
                                          
                                </TableRow>
                                ),
                                <TableRow key={4}>
                                        <TableCell>Total</TableCell>
                                        <TableCell colSpan={BREAKDOWN_COL} >{statsTotal[colName]}</TableCell>                                        
                                </TableRow>]
                            }
                                
                            </TableBody>
                        </Table>



                    </div>
                </Paper>
            </div>
        );
    }
}

export default CallStatusStats;

