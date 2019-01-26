import { React,Table,TableBody,TableCell,TableHead,TableRow,Paper} from '../plugins';
import { green } from '@material-ui/core/colors';
import purple from '@material-ui/core/colors/purple';
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";

class MultiGroupBreakdown extends React.Component {
    constructor(props) {
        super(props);        
    }

    render() {
        const {display_as, mydata} = this.props;
        const style ={
            height:'10px', 
        }
        return (
            <div>
                <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12">
                        <label style={{fontSize:20}}>MULTI-GROUP BREAKDOWN:</label>
                        <button type="button" className="btn btn-raised btn-sm pull-right btn-success">CSV Download</button>
                    </div>
                </div> 
                <Paper>                
                    <div className="table-responsive-material">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{display_as=='TEXT' ? 'IN-GROUP' : 'Group'}</TableCell>
                                    {display_as=='TEXT' ? <TableCell>CALLS</TableCell> :null}
                                    {display_as=='TEXT' ? <TableCell>DROPS</TableCell>:null}
                                    {display_as=='TEXT' ? <TableCell>DROP %</TableCell>:null}
                                    {display_as=='TEXT' ? <TableCell>IVR </TableCell>:null}
                                    {display_as=='HTML' ?
                                        <TableCell >
                                            <div className="ml-auto px-3 badge badge-pill text-right text-white bg-success">IVRS </div>
                                            <div className="ml-auto px-3 badge badge-pill text-right text-white" style={{backgroundColor:'#FAD839'}}>DROPS </div>
                                            <div className="ml-auto px-3 badge badge-pill text-right text-white bg-danger">CALLS </div>                                       
                                        </TableCell>
                                    :null}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                { mydata.data.campaign_wise_details != "" ? 
                                      mydata.data.campaign_wise_details.map((val,key) =>
                                        <TableRow key={key}>
                                            <TableCell>{val.campaignId} {display_as=='HTML' ? val.campaigndroppersent+'% drops' :''}</TableCell>
                                            {display_as=='TEXT' ?<TableCell>{val.campaigntotalcalls}</TableCell>:null}
                                            {display_as=='TEXT' ?<TableCell>{val.campaigndropcalls}</TableCell>:null}
                                            {display_as=='TEXT' ?<TableCell>{val.campaigndroppersent}</TableCell>:null}
                                            {display_as=='TEXT' ?<TableCell>{val.campaignivrcalls}</TableCell>:null}
                                            {display_as=='HTML' ? <TableCell style={{width:70+'%'}}>
                                            <div className="progress">

                                                {val.campaigndropcalls == 1 && val.campaignivrcalls=="" ?
                                                    [val.campaignivrcalls > 0 ? 
                                                        <div className="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style={{width: parseInt(100*val.campaignivrcalls/mydata.data.maxcampaignivrcalls)+"px",textAlign: 'right'}} aria-valuenow="15" aria-valuemin="0" aria-valuemax="100">{val.campaignivrcalls}</div>    
                                                        :
                                                        null,
                                                    val.campaigndropcalls > 0 ? 
                                                    <div className="progress-bar progress-bar-striped progress-bar-animated bg-warning" role="progressbar" style={{width:parseInt(100*val.campaigndropcalls/mydata.data.maxcampaigndropcalls)+"px",textAlign: 'right'}} aria-valuenow="30" aria-valuemin="0" aria-valuemax="100">{val.campaigndropcalls}</div>

                                                        :
                                                        null
                                                    ]

                                                :
                                                    val.campaignivrcalls > 0 
                                                        ? 
                                                        <div className="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style={{width: 100*val.campaignivrcalls/mydata.data.maxcampaignivrcalls+"px",textAlign: 'right'}} aria-valuenow="15" aria-valuemin="0" aria-valuemax="100">{val.campaignivrcalls}</div>    
                                                        :null
                                                }

                                                {val.campaigndropcalls > 1 ?
                                                    <div className="progress-bar progress-bar-striped progress-bar-animated bg-warning" role="progressbar" style={{width:100*val.campaigndropcalls/mydata.data.maxcampaigndropcalls+"px",textAlign: 'right'}} aria-valuenow="30" aria-valuemin="0" aria-valuemax="100">{val.campaigndropcalls}</div>
                                                :
                                                    null
                                                }

                                                {val.campaigntotalcalls > 1 ?
                                                    <div className="progress-bar progress-bar-striped progress-bar-animated bg-danger" role="progressbar" style={{width: 100*val.campaigntotalcalls/val.campaigntotalcalls+"%",textAlign: 'right'}} aria-valuenow="20" aria-valuemin="0" aria-valuemax="100">{val.campaigntotalcalls}</div>

                                                :
                                                    null
                                                }
                                               </div>
                                            </TableCell>:null}        
                                        </TableRow>
                                    )
                                
                                :""}
                                
                                
                            </TableBody>
                        </Table>
                    </div>
                </Paper>
            </div>
        );
    }
}

export default MultiGroupBreakdown;