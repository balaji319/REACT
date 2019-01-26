import { React,Table,TableBody,TableCell,TableHead,TableRow,Paper} from '../plugins';
import LinearProgress from '@material-ui/core/LinearProgress';

class CommanTable extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            activeCol:0,
            data : [],
            mydata: this.props.mydata.data.seventhTable
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data : nextProps.mydata.data.seventhTable,
        });
    }

    render() {
        const {data, mydata} = this.state;
        const {display_as} = this.props;
        return (
            <div>
                <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12">
                        <label style={{fontSize:20}}>GRAPH IN 15 MINUTE INCREMENTS OF TOTAL CALLS TAKEN INTO THIS IN-GROUP:</label>
                        <button type="button" className="btn btn-raised btn-sm pull-right btn-success">CSV Download</button>
                    </div>
                </div>
                <Paper>
                    <div className="table-responsive-material">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>HOUR</TableCell>
                                    {display_as == 'TEXT' ?
                                        <TableCell dangerouslySetInnerHTML={{__html: mydata.values}}>
                                        </TableCell>
                                        :
                                        <TableCell>
                                            <div className="ml-auto px-3 badge badge-pill text-right text-white bg-success">DROPS </div>
                                            <div className="ml-auto px-3 badge badge-pill text-right text-white bg-danger">TOTAL </div>
                                        </TableCell>
                                    }
                                    {display_as == 'TEXT' ?<TableCell>DROPS</TableCell>:null}
                                    {display_as == 'TEXT' ?<TableCell>TOTAL</TableCell>:null}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                    
                                {
                                    this.props.mydata.data.seventhTable['fifteen_min_table'].length != null ?
                                    this.props.mydata.data.seventhTable['fifteen_min_table'].map((val,key) => 
                                    <TableRow key={key}>
                                        <TableCell>{val.time} </TableCell>
                                        {display_as=='HTML' ? 
                                            <TableCell style={{width:70+'%'}}>
                                                <div className="progress">
                                                    <div className="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style={{width: parseInt(val.drops),textAlign: 'right'}} aria-valuenow="15" aria-valuemin="0" aria-valuemax="100">{parseInt(val.drops)}</div>    
                                                    <div className="progress-bar progress-bar-striped progress-bar-animated bg-danger" role="progressbar" style={{width: parseInt(val.calls),textAlign: 'right'}} aria-valuenow="15" aria-valuemin="0" aria-valuemax="100">{parseInt(val.calls)}</div>    
                                                </div>


                                            </TableCell>
                                        :<TableCell> 
                                            
                                                <span style={{'backgroundColor':'#E41B17'}}>{val.arrow}</span>
                                                <span style={{'backgroundColor':'#006600'}}> {val.stars}</span>
                                        </TableCell>}

                                        {display_as == 'TEXT' ?<TableCell>{val.drops}</TableCell>:null}
                                        {display_as == 'TEXT' ?<TableCell>{val.calls}</TableCell>:null} 

                                    </TableRow>
                                ):""}
                            </TableBody>
                        </Table>
                    </div>
                </Paper>
                <br/>
            </div>
        );
    }
}

export default CommanTable;
