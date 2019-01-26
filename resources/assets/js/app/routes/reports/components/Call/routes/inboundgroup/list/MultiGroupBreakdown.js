import { React,Table,TableBody,TableCell,TableHead,TableRow,Paper} from '../plugins';
import LinearProgress from '@material-ui/core/LinearProgress';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import { green } from '@material-ui/core/colors';
import purple from '@material-ui/core/colors/purple';

const BREAKDOWN_COL = 11;

class MultiGroupBreakdown extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            activeCol:0,
            page: 0,
            rowsPerPage: 10,
            total: 0,
            data : [],
            max_value_ivr : '',
            max_value_drop : '',
        }
    }

    handleChangePage = (event, page) => {
        this.setState({ page });
        
    };

    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value });
        this.getCountryList(this.state.page, event.target.value);
    };

    componentWillReceiveProps(nextProps) {
        //console.log('componentWillReceiveProps', nextProps.data);
        this.setState({
            data : nextProps.data.campaign_wise_details,
        });
    }

    render() {
        const {data,max_value_ivr,max_value_drop} = this.state;
        const {display_as} = this.props;
        const { rowsPerPage, page, total } = this.state;
        const style ={
            height:'10px', 
        }
        const test ="";
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
                            
                                {this.props.data.campaign_wise_details.map((val,key)=>
                                    <TableRow key={key}>
                                        <TableCell>{val.campaign_id} {display_as=='HTML' ? val.campaign_drop_persent+'% drops' :''}</TableCell>
                                        {display_as=='TEXT' ?<TableCell>{val.campaign_total_calls}</TableCell>:null}
                                        {display_as=='TEXT' ?<TableCell>{val.campaign_drop_calls}</TableCell>:null}
                                        {display_as=='TEXT' ?<TableCell>{val.campaign_drop_persent}</TableCell>:null}
                                        {display_as=='TEXT' ?<TableCell>{val.campaign_ivr_calls}</TableCell>:null}
                                        {display_as=='HTML' ? <TableCell style={{width:70+'%'}}>
                                        <div className="progress">
                                            {/* <LinearProgress  variant="determinate" value={parseInt(100*val.campaign_ivr_calls/max_value_ivr)} style={style}/>
                                            <LinearProgress  variant="determinate" value={40} style={style}/>
                                            <LinearProgress  variant="determinate" value={80} style={style}/> */}
                                            
                                            {val.campaign_drop_calls == 1 && val.campaign_ivr_calls=="" ?
                                                [val.campaign_ivr_calls > 0 ? 
                                                    <div className="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style={{width: parseInt(100*val.campaign_ivr_calls/this.props.data.maxcampaignivrcalls)+"px",textAlign: 'right'}} aria-valuenow="15" aria-valuemin="0" aria-valuemax="100">{val.campaign_ivr_calls}</div>    
                                                    :
                                                    null,
                                                val.campaign_drop_calls > 0 ? 
                                                <div className="progress-bar progress-bar-striped progress-bar-animated bg-warning" role="progressbar" style={{width:parseInt(100*val.campaign_drop_calls/this.props.data.maxcampaigndropcalls)+"px",textAlign: 'right'}} aria-valuenow="30" aria-valuemin="0" aria-valuemax="100">{val.campaign_drop_calls}</div>
                                                    
                                                    :
                                                    null
                                                ]

                                            :
                                                val.campaign_ivr_calls > 0 
                                                    ? 
                                                    <div className="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style={{width: 100*val.campaign_ivr_calls/this.props.data.maxcampaignivrcalls+"px",textAlign: 'right'}} aria-valuenow="15" aria-valuemin="0" aria-valuemax="100">{val.campaign_ivr_calls}</div>    
                                                    :null
                                            }

                                            {val.campaign_drop_calls > 1 ?
                                                <div className="progress-bar progress-bar-striped progress-bar-animated bg-warning" role="progressbar" style={{width:100*val.campaign_drop_calls/this.props.data.maxcampaigndropcalls+"px",textAlign: 'right'}} aria-valuenow="30" aria-valuemin="0" aria-valuemax="100">{val.campaign_drop_calls}</div>
                                            :
                                                null
                                            }

                                            {val.campaign_total_calls > 1 ?
                                                <div className="progress-bar progress-bar-striped progress-bar-animated bg-danger" role="progressbar" style={{width: 100*val.campaign_total_calls/val.campaign_total_calls+"%",textAlign: 'right'}} aria-valuenow="20" aria-valuemin="0" aria-valuemax="100">{val.campaign_total_calls}</div>
                                                
                                            :
                                                null
                                            }
                                           </div>
                                        </TableCell>:null}        
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

export default MultiGroupBreakdown;