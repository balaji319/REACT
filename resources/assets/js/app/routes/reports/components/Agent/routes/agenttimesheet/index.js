import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import ContainerHeader from '../../../../../../../components/ContainerHeader/index';
import CardBox from '../../../../../../../components/CardBox/index';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import {Card, CardBody} from 'reactstrap';
import {cloneElement, Component} from 'react';
import moment from 'moment';
import momentTimezone from 'moment-timezone';
import Button from '@material-ui/core/Button';
import {DatePicker} from 'material-ui-pickers';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import {dateValidation} from '../../../common/DateDiff';
import Helmet from "react-helmet";

function generate(element) {
    return [0, 1, 2].map(value =>
        cloneElement(element, {
            key: value,
        }),
    );
}

class AgentTimeSheet extends React.Component {

     constructor(props) {
        super(props);
        this.state = {
            agentID: this.props.location.pathname.split("/")[5],
            fromSelectedDate: momentTimezone.tz(moment(new Date()), "America/Los_Angeles").format('YYYY-MM-DD'),
            tableshow: false,
            userId: '',
            mydata: [],
            isLoading:false,
            open: false,
            timeval: false,
            required:false,
        };

      }



     handleChange = name => event => {
        this.setState({[name]: event.target.value});
    };

     handleDateChangeFrom = (date) => {
        this.setState({fromSelectedDate: date.format('YYYY-MM-DD')});
    }

    consponenetDid
    componentDidMount() {
       let agentID = this.state.agentID;
       let userId =  (agentID !="") ? agentID :"";
        this.setState({userId:userId});
      }

    handleCsvDownload (){
        alert('Download Success');
    }

    handleSubmit=()=>{
        const {required, tableshow, mydata, userId, fromSelectedDate} = this.state;
        this.setState({isLoading:true, open: true });
        var auth_token = localStorage.getItem("access_token");
        const query_date = fromSelectedDate;

        const date = momentTimezone.tz(moment(new Date()), "America/Los_Angeles").format('YYYY-MM-DD');

         if(dateValidation(fromSelectedDate, date,date,2)==false){
            this.setState({
                isLoading:false,
                timeval: true,
            })
        }else if(userId == ""){
            this.setState({
                isLoading:false,
                required: true,
            })
        }
        else{
            axios.post('api/agent_time_sheet/', {
            query_date: query_date,
            user_id: userId
            }, {headers: {
                    'Content-Type': 'application/json' ,
                    'Authorization' : 'Bearer '+auth_token  ,

            }}).then(response => {
                this.setState({
                    mydata : response.data,
                    tableshow : true,
                    isLoading:false,
                    open: false,
                    required: false,
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
        }
    }

    render() {
        const {required, timeval, tableshow, mydata, userId, isLoading, fromSelectedDate} = this.state;
    return (
        <div>
        <Helmet>
          <title>AgentTimeSheetReport: Ytel</title>
        </Helmet>
            <ContainerHeader match={this.props.match} title='Server Stats and Reports'/>
            <div className="row">
                    <CardBox styleName="col-lg-12" heading="Agent Time Sheet Report">
                        <form className="row" autoComplete="off">
                            <div className="col-lg-6 col-sm-6 col-12">
                                <div key="datetime_default" className="picker">
                                    <h3>Dates</h3>
                                    <DatePicker
                                        fullWidth
                                        value={fromSelectedDate}
                                        format='YYYY/MM/DD'
                                        onChange={this.handleDateChangeFrom}
                                        animateYearScrolling={false}
                                        leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                                        rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                                    />
                                     {timeval ?
                                            <p style={{color:'red'}}>The date range for this report is limited to 60 days from today.</p>
                                            :<p>The date range for this report is limited to 60 days from today.</p>}
                                </div>
                            </div>

                    <div className="col-lg-6 col-sm-6 col-12"></div>

                           <div className="col-lg-6 col-sm-6 col-12"><br />
                                <TextField
                                    id="userId"
                                    label="Agent ID"
                                    onChange={this.handleChange('userId')}
                                    margin="normal"
                                    fullWidth
                                    value={userId}
                                    required
                                />
                                {required ?
                                     <p style={{color:'red'}}>Agent ID is required.</p>
                                            :""}
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
            {tableshow == true ?
            <div className="col-lg-12">

            <Card className="shadow border-0 bg-default text-black">
                <CardBody>
                    <p>Agent Time Sheet    {mydata.present_time}</p>
                    <p>Time range: {mydata.start_time_range} to {mydata.end_time_range}</p>

                    <h3>Agent Time Sheet for :  {userId}</h3>

                    <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12">
                            <label>TOTAL CALLS TAKEN: {mydata.total_calls_taken}</label>
                            <button type="button" onClick={this.handleCsvDownload} className="btn btn-raised btn-sm pull-right btn-success">CSV Download</button>
                    </div>
                    </div>
                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableBody>
                                    <TableRow key={1}>
                                         <TableCell>TALK TIME</TableCell>
                                        <TableCell >{mydata.pf_talk_time_hms}</TableCell>
                                        <TableCell >Average</TableCell>
                                        <TableCell >{mydata.pf_talk_avg_ms}</TableCell>
                                    </TableRow>
                                    <TableRow key={2}>
                                        <TableCell>PAUSE TIME</TableCell>
                                        <TableCell >{mydata.pf_pause_time_hms}</TableCell>
                                        <TableCell >Average</TableCell>
                                        <TableCell >{mydata.pf_pause_avg_ms}</TableCell>
                                    </TableRow>
                                    <TableRow key={3}>
                                       <TableCell>WAIT TIME</TableCell>
                                        <TableCell >{mydata.pf_wait_time_hms}</TableCell>
                                        <TableCell >Average</TableCell>
                                        <TableCell >{mydata.pf_wait_avg_ms}</TableCell>
                                    </TableRow>
                                    <TableRow key={4}>
                                        <TableCell>WRAPUP TIME	</TableCell>
                                        <TableCell >{mydata.pf_wrapup_time_hms}</TableCell>
                                        <TableCell >Average</TableCell>
                                        <TableCell >{mydata.pf_wrapup_avg_ms}</TableCell>
                                    </TableRow>
                                    <TableRow key={5}>
                                        <TableCell>TOTAL ACTIVE AGENT TIME</TableCell>
                                        <TableCell >{mydata.pf_total_time_hms}</TableCell>
                                        <TableCell colSpan="2"></TableCell>
                                    </TableRow>

                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                    <br />
                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableBody>
                                    <TableRow key={6}>
                                        <TableCell>FIRST LOGIN</TableCell>
                                        <TableCell >{mydata.first_login_time}</TableCell>
                                    </TableRow>
                                    <TableRow key={7}>
                                        <TableCell>LAST LOG ACTIVITY</TableCell>
                                        <TableCell >{mydata.last_login_time}</TableCell>
                                    </TableRow>
                                    <TableRow key={8}>
                                        <TableCell>TOTAL LOGGED-IN TIME	</TableCell>
                                        <TableCell >{mydata.pf_login_time_hms}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                </CardBody>

                <CardBody>
                    <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12">
                            <label>TIME CLOCK LOGIN/LOGOUT TIME:</label>
                            <button type="button" onClick={this.handleCsvDownload} className="btn btn-raised btn-sm pull-right btn-success">CSV Download</button>
                    </div>
                    </div>
                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell >EVENT</TableCell>
                                        <TableCell >DATE</TableCell>
                                        <TableCell >IP ADDRESS</TableCell>
                                        <TableCell >GROUP</TableCell>
                                        <TableCell >HOURS:MINUTES</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        mydata.time_clock_log_info.map((item, i) =>
                                           <TableRow key={i}>
                                                <TableCell>{item.timeclock_id}</TableCell>
                                                <TableCell>{item.event}</TableCell>
                                                <TableCell>{item.dateval}</TableCell>
                                                <TableCell>{item.ip_address}</TableCell>
                                                <TableCell>{item.user_group}</TableCell>
                                                <TableCell>{item.logoutTime}</TableCell>
                                            </TableRow>
                                        )
                                    }
                                    <TableRow key={1}>
                                        <TableCell>Total</TableCell>
                                        <TableCell ></TableCell>
                                        <TableCell ></TableCell>
                                        <TableCell ></TableCell>
                                        <TableCell ></TableCell>
                                        <TableCell >{mydata.total_timeclock_login_hours_minutes}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                </CardBody>
            </Card>
          </div>: ""
                }
            </div>
        </div>
        );
    }
}


export default AgentTimeSheet;