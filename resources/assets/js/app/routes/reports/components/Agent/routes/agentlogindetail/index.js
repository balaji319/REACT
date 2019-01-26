import React from 'react';
import {cloneElement, Component} from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import ContainerHeader from '../../../../../../../components/ContainerHeader/index';
import CardBox from '../../../../../../../components/CardBox/index';
import Paper from '@material-ui/core/Paper';
import Input from '@material-ui/core/Input';
import FormControl from '@material-ui/core/FormControl';
import {Card, CardBody} from 'reactstrap';
import moment from 'moment';
import momentTimezone from 'moment-timezone';
import Button from '@material-ui/core/Button';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { formatDate, parseDate } from 'react-day-picker/moment';
import Tooltip from '@material-ui/core/Tooltip';
import 'react-day-picker/lib/style.css';
import Toolbar from '@material-ui/core/Toolbar';
import DateRange from '../../../common/DateRange';
import {dateValidation} from '../../../common/DateDiff';
import {Alert} from 'reactstrap';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Helmet from "react-helmet";

function generate(element) {
    return [0, 1, 2].map(value =>
        cloneElement(element, {
            key: value,
        }),
    );
}

class AgentStatusDetail extends React.Component {

    handleCsvDownload (){
        alert('Download Success');
    }


    //Table format text or html

    handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        });
    };

    constructor(props) {
        super(props);    
        this.state = {
            from: momentTimezone.tz(moment(new Date()), "America/Los_Angeles").format('YYYY-MM-DD'),
            to: momentTimezone.tz(moment(new Date()), "America/Los_Angeles").format('YYYY-MM-DD'),
            mydata : [],
            tableshow : false,
            isLoading:false,
            open: false,
            timeval: false,
        };
  }

      
    
     handleFromChange = (fromDate) => {
        this.setState({ from : moment(fromDate).format('YYYY-MM-DD') });
    }

    handleToChange = (toDate) => {
        this.setState({ to:moment(toDate).format('YYYY-MM-DD')});
    }

    handleChange = name => event => {
        this.setState({[name]: event.target.value});
    };
    
    handleCsvDownload () {
      
    };
    
    componentDidMount(){
        this.handleSubmit();
    }
    
    
    handleSubmit=()=>{    
        const {timeval, tableshow, from, to, mydata} = this.state;
        var auth_token = localStorage.getItem("access_token");
        this.setState({isLoading:true, open: true });        
         const date = momentTimezone.tz(moment(new Date()), "America/Los_Angeles").format('YYYY-MM-DD');            
             if(dateValidation(from,to,date,2)==false){
                this.setState({                   
                    isLoading:false,
                    timeval: true,
                })
                
            }else{
                 axios.post('api/agent_login_detail/', {
                    start_date: from,
                    end_date: to,           
                }, {headers: { 
        	'Content-Type': 'application/json' ,
        	'Authorization' : 'Bearer '+auth_token  ,

                }}).then(response => {
                    this.setState({
                        mydata : response.data.list,
                        tableshow : true,
                        isLoading:false,
                        timeval: false,
                    })

                    console.log(this.state.mydata);

                }).catch(error => {
                    console.log(error);
                    this.setState({                   
                        isLoading:false,
                        open: false
                    })
                })       

                console.log(this.state.mydata);
            }
    }

    render() {
        const {timeval, from, to, mydata, tableshow, isLoading} = this.state;
    return (
        <div>
        <Helmet>
          <title>AgentLoginDetailReport : Ytel</title>
        </Helmet>
        <ContainerHeader match={this.props.match} title='Server Stats and Reports'/>
            <div className="row">
                <CardBox styleName="col-lg-12" heading="AGENT LOGIN/LOGOUT TIME">
                    <form className="row" autoComplete="off">                            
                        <div className="col-lg-6 col-sm-6 col-12 .col-lg-offset-6">
                            <FormControl className="w-100 mb-2">
                                <div key="basic_day" className="picker">
                                    <h3>Date Range</h3>
                                    <DateRange 
                                        onFromChange={this.handleFromChange} 
                                        onToChange={this.handleToChange}
                                        from={from}
                                        to={to}
                                    />
                                     {timeval ?
                                            <p style={{color:'red'}}>The date range for this report is limited to 60 days from today.</p>
                                            :<p>The date range for this report is limited to 60 days from today.</p>}
                                </div>
                            </FormControl>
                        </div>
                        <div className="col-lg-12">
                        <Button variant="raised" onClick={this.handleSubmit} className="jr-btn bg-green text-white">Submit</Button>
                        </div>
                    </form> 
                    
                       { isLoading &&
                            <Dialog open={this.state.open} onClose={this.handleRequestClose}>
                                <DialogContent>
                                    <div className="loader-view">
                                        <CircularProgress/>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        }
                            
                </CardBox>
            </div>       
                   {tableshow ?                     
                     Object.keys(mydata).map(function(key,i) {
                         return  <Card key={key} className="shadow border-0 bg-default text-black text-20">
                                 <div style={{padding:'10px'}}>                                   
                                    {i== 0 ?
                                        
                                        <button type="button" className="btn btn-raised btn-sm pull-right btn-success">CSV Download</button>
                                    :""}
                                </div>
                                    <CardBody>
                                    
                                    <div className="row">
                                        <div className="col-lg-12 col-sm-12 col-12" style={{textAlign:'center', background: '#2692EF', padding: "10px 0px"}}>
                                             <h3 style={{color:"#FFFFFF"}}>{key+"-"+mydata[key][0].full_name}</h3>
                                        </div>
                                    </div> 
                                    <div className="table-responsive-material">
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>EVENT</TableCell>
                                                    <TableCell >DATE</TableCell>
                                                    <TableCell >CAMPAIGN</TableCell>
                                                    <TableCell >GROUP</TableCell>
                                                    <TableCell >HOURS MM:SS</TableCell>
                                                    <TableCell >SESSION</TableCell>
                                                    <TableCell >SERVER</TableCell>
                                                    <TableCell >PHONE</TableCell>
                                                    <TableCell >COMPUTER</TableCell>
                                                    <TableCell >PHONE LOGIN</TableCell>
                                                    <TableCell >PHONE IP</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>                                   
                                             {
                                                 mydata[key].map((item,i)=>
                                                 <TableRow key={i} hover>
                                                    <TableCell>{item.event}</TableCell>
                                                    <TableCell>{item.event_date}</TableCell>
                                                    <TableCell>{item.campaign_id}</TableCell>
                                                    <TableCell>{item.user_group}</TableCell>
                                                    <TableCell>{item.session_logout}</TableCell>
                                                    <TableCell>{item.session_id}</TableCell>
                                                    <TableCell>{item.server_ip}</TableCell>
                                                    <TableCell>{item.extension}</TableCell>
                                                    <TableCell>{item.computer_ip}</TableCell>
                                                    <TableCell>{item.phone_login}</TableCell>
                                                    <TableCell>{item.phone_ip}</TableCell>
                                                </TableRow>
                                                 ) 
                                             } 
                                             <TableRow>
                                                <TableCell>Total</TableCell>
                                                <TableCell></TableCell>
                                                <TableCell></TableCell>
                                                <TableCell></TableCell>
                                                <TableCell>{mydata[key][0].total_logout_time}</TableCell>
                                                <TableCell></TableCell>
                                                <TableCell></TableCell>
                                                <TableCell></TableCell>
                                                <TableCell></TableCell>
                                                <TableCell></TableCell>
                                                <TableCell></TableCell>
                                             </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardBody>
                               </Card>
                    }) : ""                   
                   }
        </div>
    );
}
}


export default AgentStatusDetail;