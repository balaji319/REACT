import { React,Table,TableBody,TableCell,TableHead,TableRow,Paper} from '../plugins';
import LinearProgress from '@material-ui/core/LinearProgress';
const BREAKDOWN_COL = 11;

const myClass={
    // width:'2.5px',
    // height:'10px',
}

class CommanTable extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            data:[],
            data1:[],    
        }
    }


    // componentWillReceiveProps(nextProps) {
    //     console.log("Test",nextProps.data.commonarray15min.adb15[0])
    //     this.setState({
    //         data : nextProps.data.commonarray15min['timearray'],
    //         data2 : nextProps.data.commonarray15min,
    //     });
    // }


    render() {
        const {data,data1} = this.state;
        const {display_as} = this.props;
        var total = 0;
        var grandtotal = 0;
        return (
            <div>
                <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12">
                        <label style={{fontSize:20}}>CALL ANSWERED TIME BREAKDOWN IN SECONDS</label>
                        <button type="button" className="btn btn-raised btn-sm pull-right btn-success">CSV Download</button>
                    </div>
                </div> 
                <Paper>
                <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>HOUR</TableCell>
                                        <TableCell>0</TableCell>
                                        <TableCell>5</TableCell>
                                        <TableCell>10</TableCell>
                                        <TableCell>15</TableCell>
                                        <TableCell>20</TableCell>
                                        <TableCell>25</TableCell>
                                        <TableCell>30</TableCell>
                                        <TableCell>35</TableCell>
                                        <TableCell>40</TableCell>
                                        <TableCell>45</TableCell>
                                        <TableCell>50</TableCell>
                                        <TableCell>55</TableCell>
                                        <TableCell>60</TableCell>
                                        <TableCell>90</TableCell>
                                        <TableCell>90+</TableCell>
                                        <TableCell>Total</TableCell>
                                    </TableRow>
                                </TableHead> 
                                <TableBody>
                                    {
                                        this.props.data.seventhtable['callans_time_breakdown'].length != null ?
                                        this.props.data.seventhtable['callans_time_breakdown'].map((val,key) => 

                                    <TableRow key={key}>
                                        <TableCell>{val['time']}</TableCell>
                                        <TableCell>{val['0']}</TableCell>
                                        <TableCell>{val['5']}</TableCell>
                                        <TableCell>{val['10']}</TableCell>
                                        <TableCell>{val['15']}</TableCell>
                                        <TableCell>{val['20']}</TableCell>
                                        <TableCell>{val['25']}</TableCell>
                                        <TableCell>{val['30']}</TableCell>
                                        <TableCell>{val['35']}</TableCell>
                                        <TableCell>{val['40']}</TableCell>
                                        <TableCell>{val['45']}</TableCell>
                                        <TableCell>{val['50']}</TableCell>
                                        <TableCell>{val['55']}</TableCell>
                                        <TableCell>{val['60']}</TableCell>
                                        <TableCell>{val['90']}</TableCell>
                                        <TableCell>{val['99']}</TableCell>     
                                        <TableCell>{val['total']}</TableCell>
                                    </TableRow>
                                    ):""} 
                                    <TableRow>
                                        <TableCell>Total</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>     
                                        <TableCell>{this.props.data.seventhtable['callans_breakdown_sum']}</TableCell>
                                    </TableRow>                   
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
