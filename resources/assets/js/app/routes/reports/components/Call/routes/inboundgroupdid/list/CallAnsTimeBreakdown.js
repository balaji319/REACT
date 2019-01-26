import { React,Table,TableBody,TableCell,TableHead,TableRow,Paper} from '../plugins';
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

class CallAnsTimeBreakdown extends React.Component {
    constructor(props) {
        super(props);        
        this.state ={
            graph_data : [],
            interval :this.props.mydata.data.answerpercentBreakDown.interval,           
        }       
    }
          
    componentWillReceiveProps(nextProps) {
        this.setState({
            graph_data : []
        })
    }
    
    render() {
        const {graph_data, interval} = this.state;
        const {display_as, mydata} = this.props;        
        
        for (var i = 0; i < 61;) {
            var d = 'ad_'+i;
            var data = { "name" : i, "value" : this.props.mydata.data.answerpercentBreakDown.interval[d]}
            this.state.graph_data.push(data);   
            i=i+5;
        }
        var data = { "name" : 90, "value" : this.props.mydata.data.answerpercentBreakDown.interval.hd_90}
        this.state.graph_data.push(data);   
        var data = { "name" : '99+', "value" : this.props.mydata.data.answerpercentBreakDown.interval.hd_99}
        this.state.graph_data.push(data);        
        
        return (
            <div>
                <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12">
                        <label style={{fontSize:20}}>CALL ANSWERED TIME AND PERCENT BREAKDOWN IN SECONDS</label>
                    </div>
                </div>
                {display_as == "TEXT" ?
                <Paper>
                    <div className="table-responsive-material">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell></TableCell>
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
                                <TableRow>
                                    {Object.keys(mydata.data.answerpercentBreakDown.interval).map((key, val) => 
                                      <TableCell key={val}>{mydata.data.answerpercentBreakDown.interval[key]}</TableCell>          
                                    )}                                    
                                </TableRow>           
                                 <TableRow>
                                     {Object.keys(mydata.data.answerpercentBreakDown.intpercentage).map((key, val) => 
                                      <TableCell key={val}>{mydata.data.answerpercentBreakDown.intpercentage[key]}</TableCell>          
                                    )} 
                                </TableRow>

                                <TableRow>
                                    {Object.keys(mydata.data.answerpercentBreakDown.cumulative).map((key, val) => 
                                      <TableCell key={val}>{mydata.data.answerpercentBreakDown.cumulative[key]}</TableCell>          
                                    )} 
                                    
                                </TableRow>

                                <TableRow>
                                    {Object.keys(mydata.data.answerpercentBreakDown.cumulativepercentage).map((key, val) => 
                                      <TableCell key={val}>{mydata.data.answerpercentBreakDown.cumulativepercentage[key]}</TableCell>          
                                    )} 
                                </TableRow>

                                <TableRow>
                                    {Object.keys(mydata.data.answerpercentBreakDown.cumulativeanswerpercentage).map((key, val) => 
                                      <TableCell key={val}>{mydata.data.answerpercentBreakDown.cumulativeanswerpercentage[key]}</TableCell>          
                                    )}                                   
                                </TableRow> 
                            </TableBody>
                        </Table>
                    </div>
                </Paper> :
                <Paper>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={graph_data}
                                margin={{top: 10, right: 5, left: 0, bottom: 0}}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="#3367d6" activeDot={{r: 8}} />                            
                        </LineChart>
                    </ResponsiveContainer>
                </Paper>}
            </div>
        );
    }
}

export default CallAnsTimeBreakdown;
