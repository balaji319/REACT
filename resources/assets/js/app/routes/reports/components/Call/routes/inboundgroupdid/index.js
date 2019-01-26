import { React,Table,TableBody,TableCell,TableHead,TableRow,InfoCard,ContainerHeader,CardBox,Paper,Input,InputLabel,MenuItem,FormControl,FormHelperText,Select,Card,CardBody,CardSubtitle,CardText,cloneElement,Component,Button,moment} from './plugins';

import MultipeDropdown from '../../../common/MultipeDropdown';
import Dropdown from '../../../common/Dropdown';
import DateRange from '../../../common/DateRange';
import {connect} from 'react-redux';
import MultiGroupBreakdown from './list/MultiGroupBreakdown';
import CommanTable from './list/CommanTable';
import CallHoldTimeBreakdown from './list/CallHoldTimeBreakdown';
import CallDropTimeBreakdown from './list/CallDropTimeBreakdown';
import CallAnsTimeBreakdown from './list/CallAnsTimeBreakdown';
import CallHangupReasonStats from './list/CallHangupReasonStats';
import CallStatusStats from './list/CallStatusStats';
import CustomStatusCategoryStats from './list/CustomStatusCategoryStats';
import CallInitialQueuePositionBreakdown from './list/CallInitialQueuePositionBreakdown';
import AgentStats from './list/AgentStats';
import IncreamentOfTotalCalls from './list/IncreamentOfTotalCalls';
import CallAnsweredTimeBreakdownInSecond from './list/CallAnsweredTimeBreakdownInSecond';
import MultipeDropdownInboundDid from '../../../common/MultipeDropdownInboundDid';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import Helmet from "react-helmet";
import { dateValidation } from "../../../common/DateDiff";

const SHIFT = ['ALL','AM','PM'];
const DISPLAYAS = ['TEXT','HTML'];

class InboundGroupDid extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            shift:'ALL',
            displayAs:'TEXT',
            from: moment(new Date()).format('YYYY-MM-DD'),
            to: moment(new Date()).format('YYYY-MM-DD'),
            inboundDidList:[],
            selectedInboundDid:['---NONE---'],
            mydata: [],
            flag: false,
            open: false,
            timeval: false,
            
        };
        this.handleFromChange = this.handleFromChange.bind(this);
        this.handleToChange = this.handleToChange.bind(this);
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
    
     componentDidMount() 
    {      
        this.setState({isLoading:true});
        const {UserGroupList, campaignList} = this.state;
        var token = localStorage.getItem("access_token");
        
        const requestOptions = {headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+token ,}};
         
        axios.get('api/get-inbound-did-list/',requestOptions).then(response=>{  
            this.setState({
                inboundDidList: response.data.data.list,
                isLoading: false
            })
           this.handleSubmit();
        }).catch(error =>{
            console.log(error);
        })
    }
    
   
    
    handleSubmit = () =>{                   
        const {from, to, selectedInboundDid, shift, displayAs} = this.state;
        var auth_token = localStorage.getItem("access_token");

        this.setState({isLoading:true });
        
        const date = moment(new Date()).format('YYYY-MM-DD');
        
        if (dateValidation(from, to, date, 2) == false) {
          this.setState({
            isLoading: false,
            timeval: true
          });
        }else{
            axios.post('api/inbound-by-did/', {
            startdate: from,
            enddate: to,
            shift: shift,
            did: "Y",
            selectedgroups: selectedInboundDid,
            reportdisplaytype: displayAs, 
        }, {headers: { 
        	'Content-Type': 'application/json' ,
        	'Authorization' : 'Bearer '+auth_token  ,

        }}).then(response => {
            this.setState({
                mydata : response.data,
                isLoading:false,
                flag: true,
                open: false,
                timeval: false
            })
            
        }).catch(error => {
            console.log(error);
            this.setState({                   
                isLoading:false,
                open: false
            })
        }) 
        }
    } 

    render() {
        const {isLoading, timeval, flag, today, mydata, inboundDidList, selectedInboundDid, from,to,shift,displayAs} = this.state;
    return (
        <div>
         <Helmet>
          <title>InboundReportByDID | Ytel</title>
        </Helmet>

            <ContainerHeader match={this.props.match} title='Inbound Report By DID'/>

            <div className="row">
                <CardBox styleName="col-lg-12" heading="Inbound Report By DID">
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
            
            {flag ? 
                <Card className="shadow border-0 bg-default text-black">
                    <CardBody>
                        <h3 className="card-title">Inbound Call Stats:{mydata.data.group_string === '---NONE---' ? "":"|"+mydata.data.group_string}|  {to} {mydata.data.datetime}</h3>
                        <h3 className="card-title">Time range: {mydata.data.startdate} to {mydata.data.enddate} </h3> 
                        
                        { mydata.data.campaign_wise_details != "" ? 
                        <MultiGroupBreakdown display_as={displayAs} mydata={mydata}/>: "" }
                        <br/>
                        <CommanTable mydata={mydata} />
                        <br/>
                        <CallHoldTimeBreakdown display_as={displayAs} mydata={mydata}/>
                        <br/>
                        <CallDropTimeBreakdown display_as={displayAs} mydata={mydata}/>
                        <br/>
                        <CallAnsTimeBreakdown display_as={displayAs} mydata={mydata}/>
                        <br/>
                        <CallHangupReasonStats display_as={displayAs} mydata={mydata}/>                
                        <br/>
                        <CallStatusStats display_as={displayAs} mydata={mydata}/>
                        <br/>
                        <CustomStatusCategoryStats display_as={displayAs} mydata={mydata}/>
                        <br/>
                        <CallInitialQueuePositionBreakdown display_as={displayAs} mydata={mydata}/>
                        <br/>
                        <AgentStats display_as={displayAs} mydata={mydata}/>
                        <br/>
                        <IncreamentOfTotalCalls display_as={displayAs} mydata={mydata}/>
                        <br/>
                        <CallAnsweredTimeBreakdownInSecond display_as={displayAs} mydata={mydata} />
                    </CardBody>                     
                </Card>
                : ""
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
    );
}
}

export default InboundGroupDid;