import { React,Table,TableBody,TableCell,TableHead,TableRow,Paper} from './plugins';
import LinearProgress from '@material-ui/core/LinearProgress';
const BREAKDOWN_COL = 2;
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";

class CampaignStatusHtml extends React.Component {
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
                                {/* <TableRow>
                                    <TableCell colSpan={3} style={{textAlign:'center'}}>
                                        {this.props.list_id+" - "+this.props.list_name}
                                    </TableCell>
                                </TableRow> */}
                                <TableRow>
                                    <TableCell onClick={()=>this.clickCol(1,'CALLS')}>CALLS</TableCell>
                                    <TableCell onClick={()=>this.clickCol(2,'DURATION')}>DURATION</TableCell>
                                    <TableCell onClick={()=>this.clickCol(3,'HANDLE TIME')}>HANDLE TIME</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={3} style={{textAlign:'center'}}>
                                        {this.props.list_id+" - "+this.props.list_name}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>DISPOSITION	HTML</TableCell>
                                    <TableCell colSpan={2}>{this.state.colName}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                    {Object.keys(this.props.data).map((v1,k1)=>
                                        <TableRow key={k1}>
                                            <TableCell>{v1 +" - "+ this.props.data[v1][5]}	</TableCell>
                                            <TableCell className={activeCol!=0 && activeCol!=1?'hide-td':''} colSpan={activeCol==1?BREAKDOWN_COL:1}>
                                                {activeCol==1?
                                                    <Progress strokeWidth={30} percent={(100*this.props.data[v1][0]/this.props.totalmax.calls).toFixed(2)} />
                                                    :
                                                    this.props.data[v1][0]
                                                }
                                            </TableCell>
                                            <TableCell className={activeCol!=0 && activeCol!=2?'hide-td':''} colSpan={activeCol==2?BREAKDOWN_COL:1}>
                                                {activeCol==2?
                                                    <Progress strokeWidth={30} percent={(100*this.props.data[v1][0]/this.props.totalmax.duration).toFixed(2)} />
                                                    :
                                                    this.props.data[v1][3]
                                                }
                                            </TableCell>
                                            <TableCell className={activeCol!=0 && activeCol!=3?'hide-td':''} colSpan={activeCol==3?BREAKDOWN_COL:1}>
                                                {activeCol==3?
                                                    <Progress strokeWidth={30} percent={(100*this.props.data[v1][2]/this.props.totalmax.handling).toFixed(2)} />
                                                    :
                                                    this.props.data[v1][4]
                                                }
                                            </TableCell>
                                        </TableRow>
                                    )}
                                <TableRow>
                                    <TableCell>Total </TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=1?'hide-td':''} colSpan={activeCol==1?BREAKDOWN_COL:1}>{this.props.totalmax.total_calls}	</TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=2?'hide-td':''} colSpan={activeCol==2?BREAKDOWN_COL:1}>{this.props.totalmax.total_duration}	</TableCell>
                                    <TableCell className={activeCol!=0 && activeCol!=3?'hide-td':''} colSpan={activeCol==3?BREAKDOWN_COL:1}>{this.props.totalmax.total_handle_time}	</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table> 
                    </div>
                </Paper>
            </div>
        );
    }
}

export default CampaignStatusHtml;

