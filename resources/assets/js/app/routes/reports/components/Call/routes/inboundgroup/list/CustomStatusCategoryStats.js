import { React,Table,TableBody,TableCell,TableHead,TableRow,Paper} from '../plugins';
import LinearProgress from '@material-ui/core/LinearProgress';
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

const BREAKDOWN_COL = 11;

class CustomStatusCategoryStats extends React.Component {
    constructor(props) {
        super(props);
        // this.state ={
        //     data:[],
        // }
    }

    // componentWillReceiveProps(nextProps) {
    //     this.setState({
    //         data : nextProps.data.category_status_call_detail['vicidial_status_category'],
    //     });
    // }

    render() {
        
        return (
            <div>
                <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12">
                        <label style={{fontSize:20}}>CUSTOM STATUS CATEGORY STATS  </label>
                        <button type="button" className="btn btn-raised btn-sm pull-right btn-success">CSV Download</button>
                    </div>
                </div>
                <Paper> 
                    <div className="table-responsive-material">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>CATEGORY</TableCell>
                                    <TableCell>CALLS</TableCell>
                                    <TableCell>DESCRIPTION</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {/* {this.props.data.category_status_call_detail['vicidial_status_category'].map((val,key)=>
                                    <TableRow key={key}>
                                        <TableCell>{val.vsc_id}</TableCell>
                                        <TableCell>0</TableCell>
                                        <TableCell>{val.vsc_name}</TableCell>
                                    </TableRow>
                                )} */}

                                {this.props.data.category_status_call_detail['vicidial_status_category'].map((val,key)=>
                                    <TableRow key={key}>
                                        <TableCell>{val.vsc_id}</TableCell>
                                        <TableCell>0</TableCell>
                                        <TableCell>{val.vsc_name}</TableCell>
                                    </TableRow>
                                )}
                                <TableRow>
                                    <TableCell>Total</TableCell>
                                    <TableCell>0</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>

                            </TableBody>
                        </Table>
                    </div>
                </Paper>
            </div>
        );
    }
}

export default CustomStatusCategoryStats;
