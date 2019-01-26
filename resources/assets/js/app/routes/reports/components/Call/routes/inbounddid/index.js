import { React,Table,TableBody,TableCell,TableHead,TableRow,InfoCard,ContainerHeader,CardBox,Paper,Input,InputLabel,MenuItem,FormControl,FormHelperText,Select,Card,CardBody,CardSubtitle,CardText,cloneElement,Component,Button,moment} from './plugins';
import LinearProgress from '@material-ui/core/LinearProgress';
import MultipeDropdownInboundDid from '../../../common/MultipeDropdownInboundDid';
import Dropdown from '../../../common/Dropdown';
import DateRange from '../../../common/DateRange';
import {connect} from 'react-redux';
const SHIFT = ['ALL','AM','PM'];
const DISPLAYAS = ['TEXT','HTML'];
import momentTimezone from 'moment-timezone';
import { dateValidation } from "../../../common/DateDiff";
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
import {
    fetchhInboundDidList,  
  
} from '../../../../actions/';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import Helmet from "react-helmet";
const BREAKDOWN_COL = 11;

const myClass={
    width:'5px',
    height:'15px',
}
class InboundDid extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shift:'ALL',
            displayAs:'TEXT',
            from: momentTimezone.tz(moment(new Date()), "America/Los_Angeles").format('YYYY-MM-DD'),
            to: momentTimezone.tz(moment(new Date()), "America/Los_Angeles").format('YYYY-MM-DD'),
            today: momentTimezone.tz(moment(new Date()), "America/Los_Angeles").format('YYYY-MM-DD HH:MM:SS'),
            inboundGroups:[],
            inboundDidList:[],
            selectedInboundDid:['---NONE---'],
            timeval: false,
            mydata: [],
            did: "",
            flag: false,
            isLoading: false,
        };

    }

    handleFromChange = (fromDate) => {
        this.setState({ from : moment(fromDate).format('YYYY-MM-DD') });
    }

    handleToChange = (toDate) => {
        this.setState({ to:moment(toDate).format('YYYY-MM-DD')});
    }

    handleChange = (name,value) =>{
        this.setState({
            [name]:value,
        }) 
    }
    
    componentWillReceiveProps(nextPropsFromRedux) {
        this.setState({                                       
          inboundDidList:nextPropsFromRedux.inboundDidList.list,
        });         
      }  
    
    componentDidMount() {  
             this.props.fetchhInboundDidList(); 
             this.handleSubmit();             
    }
    

    handleSubmit = () =>{
       
        const {from, to, selectedInboundDid, shift, did, displayAs, download_csv} = this.state;
        var auth_token = localStorage.getItem("access_token");
        this.setState({isLoading:true})
   
        const date = moment(new Date()).format("YYYY-MM-DD");

        if (dateValidation(from, to, date, 2) == false) {
          this.setState({
            isLoading: false,
            timeval: true
          });
          console.log("Sorrry")
        } else {
            axios.post('api/inbound-did-report/', {
                startdate: from,
                enddate: to,
                selectedgroups: selectedInboundDid,
                did: did,
                shift: shift,
            }, {headers: { 
                    'Content-Type': 'application/json' ,
                    'Authorization' : 'Bearer '+auth_token  ,

            }}).then(response => {
                this.setState({
                    mydata : response.data,
                    isLoading:false,
                    flag: true,
                })
            
            }).catch(error => {
                console.log(error);
                this.setState({                   
                    isLoading:false,
                    open: false
                })
            }) 
        }
       
       
        console.log(this.state);
    }


    render() {

        const {isLoading, flag, mydata, today, timeval, inboundDidList, selectedInboundDid, from,to,shift,displayAs,inboundGroups} = this.state;
    return (
        <div>
            <Helmet>
                <title>InboundDid | Ytel</title>
            </Helmet>
            <ContainerHeader match={this.props.match} title='Inbound DID Report'/>

            <div className="row">
                <CardBox styleName="col-lg-12" heading="Inbound DID Report">
                    <form className="row" autoComplete="off">
                        <div className="col-lg-6 col-sm-6 col-12">

                            <DateRange 
                                onFromChange={this.handleFromChange} 
                                onToChange={this.handleToChange}
                                from={from}
                                to={to}
                            />
                            {timeval ? (
                                <p style={{ color: "red" }}>
                                  The date range for this report is limited to 60 days
                                  from today.
                                </p>
                              ) : (
                                <p>
                                  The date range for this report is limited to 60 days
                                  from today.
                                </p>
                              )}

                            <Dropdown 
                                label={"Shift"} 
                                onChange={this.handleChange}
                                name={'shift'}
                                selectedValue={shift}
                                data={SHIFT}
                            />
                            
                            <Dropdown 
                                label={"Display As"} 
                                onChange={this.handleChange}
                                name={'displayAs'}
                                selectedValue={displayAs}
                                data={DISPLAYAS}
                            />


                            <Button color="primary" className="jr-btn bg-success text-white" onClick={this.handleSubmit}>
                                Submit
                            </Button>
                            
                        </div>
                        <div className="col-lg-6 col-sm-6 col-12">
                        <MultipeDropdownInboundDid 
                            label={"Users"} 
                            options={inboundDidList} 
                            onChange={this.handleChange}
                            name={'selectedInboundDid'}
                            default={'---NONE---'}
                            selectedValue={selectedInboundDid}
                        />
                        </div>
                    </form>
                </CardBox>
            </div>
            <div>
            {flag ?
        
           
            
            <Card className="shadow border-0 bg-default text-black">
                <CardBody>
                    
                    <span><label className="card-title">Inbound DID Report : {today}</label> </span>
                    <h3 className="card-title">Time range: {from} 00:00:00 To {to} 23:59:59 </h3>

                    <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12">
                            <h3 className= "text-center">DID SUMMARY</h3>
                            <button type="button" className="btn btn-raised btn-sm pull-right btn-success">CSV Download</button>
                        </div>
                    </div> 
                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                {displayAs == "TEXT" ? 
                                    <TableRow>
                                        <TableCell>DID</TableCell>
                                        <TableCell>DESCRIPTION</TableCell>
                                        <TableCell>ROUTE</TableCell>
                                        <TableCell>CALLS</TableCell>
                                    </TableRow>
                                    : <TableRow>
                                        <TableCell>DID</TableCell>                                       
                                        <TableCell>CALLS</TableCell>    
                                      </TableRow>
                                }
                                    
                                </TableHead>
                                <TableBody>
                                    {displayAs == "TEXT" ?
                                        
                                    mydata.data["first_table"].length == 0 ?                                        
                                    <TableRow>
                                        <TableCell className="text-center" colSpan={4}><h2>NO DATA FOUND</h2></TableCell>  
                                    </TableRow>
                                    : [Object.keys(mydata.data.first_table).map((key, val) =>
                                            <TableRow key={val}>
                                                <TableCell className="custom-td-width">{mydata.data.first_table[key].did_id}</TableCell>
                                                <TableCell>{mydata.data.first_table[key].did_description}</TableCell>
                                                <TableCell>{mydata.data.first_table[key].did_route}</TableCell>
                                                <TableCell>{mydata.data.first_table[key].calls}</TableCell>
                                            </TableRow> 
                                        ),
                                        <TableRow key={2}>
                                            <TableCell>TOTAL CALLS</TableCell>
                                            <TableCell></TableCell>
                                            <TableCell></TableCell>
                                            <TableCell>{mydata.data.tot_calls}</TableCell>
                                        </TableRow>]
                                        
                                    : [Object.keys(mydata.data.first_table).map((key, val) =>
                                            <TableRow key={val}>
                                                <TableCell className="custom-td-width">{mydata.data.first_table[key].did_id}</TableCell>
                                                <TableCell>
                                                <Progress 
                                               percent={mydata.data.first_table[key].calls} 
                                                theme={{active: { symbol: mydata.data.first_table[key].calls , color: '#0086e3' },
                                                        success: { symbol: mydata.data.first_table[key].calls , color: '#0086e3' },
                                                        default: { symbol: mydata.data.first_table[key].calls , color: '#0086e3' },
                                                    }}
                                            />
                                                </TableCell>
                                            </TableRow> 
                                        ),
                                        <TableRow key={2}>
                                            <TableCell>TOTAL CALLS</TableCell>
                                            <TableCell>{mydata.data.tot_calls}</TableCell>
                                        </TableRow>]
                                }
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                    <br/>
                    <br/>   

                    <div className="row">
                        <div className="text-center col-lg-12 col-sm-12 col-12">
                            <h3>Date SUMMARY</h3>
                        </div>
                    </div> 
                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>                                
                                    <TableRow>
                                        <TableCell>SHIFT---DATE-TIME RANGE</TableCell>
                                        <TableCell>CALLS</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {displayAs == "TEXT" ?
                                        
                                        mydata.data["data_summery"].length == 0 ?                                        
                                            <TableRow>
                                                <TableCell className="text-center" colSpan={4}><h2>NO DATA FOUND</h2></TableCell>  
                                            </TableRow>
                                        : [Object.keys(mydata.data.data_summery).map((key, val) =>
                                                <TableRow key={val}>
                                                    <TableCell className="custom-td-width" >{mydata.data.data_summery[key].start_date} - {mydata.data.data_summery[key].end_date}</TableCell>
                                                    <TableCell>{mydata.data.data_summery[key].total_call == "" ? "0" : mydata.data.data_summery[key].total_call}</TableCell>                                                
                                                </TableRow> 
                                            ),
                                            <TableRow key={2}>
                                                <TableCell>TOTAL</TableCell>
                                                <TableCell>{mydata.data.tot_calls}</TableCell>
                                            </TableRow>]

                                        : [Object.keys(mydata.data.data_summery).map((key, val) =>
                                            <TableRow key={val}>
                                                <TableCell className="custom-td-width">{mydata.data.data_summery[key].start_date}</TableCell>
                                                <TableCell>
                                                {mydata.data.data_summery[key].total_call == "" ? "0" : <Progress 
                                                    percent={mydata.data.data_summery[key].total_call} 
                                                    theme={{active: { symbol: mydata.data.data_summery[key].total_call , color: '#0086e3' },
                                                            success: { symbol: mydata.data.data_summery[key].total_call , color: '#0086e3' },
                                                            default: { symbol: mydata.data.data_summery[key].total_call , color: '#0086e3' },
                                                         }}
                                                 />}
                                                </TableCell>
                                            </TableRow> 
                                        ),
                                        <TableRow key={2}>
                                            <TableCell>TOTAL</TableCell>
                                            <TableCell>{mydata.data.tot_calls}</TableCell>
                                        </TableRow>]
                                    }
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                    <br/>
                    <br/>   
                        
                    <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12">
                            <h2>HOLD TIME, CALL AND DROP STATS</h2>
                            <h3>GRAPH IN 15 MINUTE INCREMENTS OF AVERAGE HOLD TIME FOR CALLS TAKEN INTO THIS IN-GROUP</h3>
                        </div>
                    </div> 
                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>                                
                                    <TableRow>
                                        <TableCell>TIME 15 MIN INT</TableCell>
                                        <TableCell>CALLS</TableCell>
                                        <TableCell>DROPS</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {displayAs == "TEXT" ?
                                        
                                        mydata.data["hold_time_array"].length == 0 ?                                        
                                            <TableRow>
                                                <TableCell className="text-center" colSpan={3}><h2>NO DATA FOUND</h2></TableCell>  
                                            </TableRow>
                                        : [Object.keys(mydata.data.hold_time_array).map((key, val) =>
                                                <TableRow key={val}>
                                                    <TableCell className="custom-td-width" >{mydata.data.hold_time_array[key].hm_display}</TableCell>
                                                    <TableCell>{mydata.data.hold_time_array[key].qrt_calls  == "" ? "0" : mydata.data.hold_time_array[key].qrt_calls}</TableCell>                                                
                                                    <TableCell>{mydata.data.hold_time_array[key].qrt_drops  == "" ? "0" : mydata.data.hold_time_array[key].qrt_drops}</TableCell>                                                
                                                </TableRow> 
                                            ),
                                            <TableRow key={2}>
                                                <TableCell>TOTAL</TableCell>
                                                <TableCell colSpan={2}>{mydata.data.tot_calls}</TableCell>
                                            </TableRow>]

                                        : [Object.keys(mydata.data.hold_time_array).map((key, val) =>
                                            <TableRow key={val}>
                                                <TableCell className="custom-td-width">{mydata.data.hold_time_array[key].hm_display}</TableCell>
                                                <TableCell>
                                                {mydata.data.hold_time_array[key].qrt_calls  == "" ? "0" : <Progress 
                                                    percent={mydata.data.hold_time_array[key].qrt_calls} 
                                                    theme={{active: { symbol: mydata.data.hold_time_array[key].qrt_calls , color: '#0086e3' },
                                                            success: { symbol: mydata.data.hold_time_array[key].qrt_calls , color: '#0086e3' },
                                                            default: { symbol: mydata.data.hold_time_array[key].qrt_calls , color: '#0086e3' },
                                                         }}
                                                 />}
                                                </TableCell>
                                                <TableCell>
                                                    {mydata.data.hold_time_array[key].qrt_drops  == "" ? "0" :<Progress 
                                                    percent={mydata.data.hold_time_array[key].qrt_drops} 
                                                    theme={{active: { symbol: mydata.data.hold_time_array[key].qrt_drops , color: '#99000D' },
                                                            success: { symbol: mydata.data.hold_time_array[key].qrt_drops , color: '#99000D' },
                                                            default: { symbol: mydata.data.hold_time_array[key].qrt_drops , color: '#99000D' },
                                                         }}
                                                 />}
                                                </TableCell>                                                
                                            </TableRow> 
                                        ),
                                        <TableRow key={2}>
                                            <TableCell>TOTAL</TableCell>
                                            <TableCell colSpan={2}>{mydata.data.tot_calls}</TableCell>
                                        </TableRow>]
                                    }
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                    <br/>
                    <br/>
                </CardBody>
            </Card> : ""                
            }
            
            { isLoading &&
                <Dialog open={this.state.isLoading} onClose={this.handleRequestClose}>
                    <DialogContent>
                        <div className="loader-view">
                            <CircularProgress/>
                        </div>
                    </DialogContent>
                </Dialog>   
            }
            </div>      
        </div>
    );
}
}


//export default InboundDid;

function mapStateToProps(state, ownProps) {
    console.log(state);

    return {
        inboundDidList: state.inbound_did_list.data,
    };
}

 const mapDispatchToProps = {
      fetchhInboundDidList,
    };
    
export default connect(mapStateToProps, mapDispatchToProps)(InboundDid);