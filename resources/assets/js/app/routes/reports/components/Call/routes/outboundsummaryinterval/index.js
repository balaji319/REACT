import { React,Table,TableBody,TableCell,TableHead,TableRow,InfoCard,ContainerHeader,CardBox,Paper,Input,InputLabel,MenuItem,FormControl,FormHelperText,Select,Card,CardBody,CardSubtitle,CardText,cloneElement,Component,Button,moment} from './plugins';
import {DateTimePicker} from 'material-ui-pickers';
import CampaignMultidropdownList from '../common/CampaignMultidropdownList';

import LinearProgress from '@material-ui/core/LinearProgress';
import MultipeDropdown from '../../../common/MultipeDropdown';
import Dropdown from '../../../common/Dropdown';
import DateRange from '../../../common/DateRange';

import { dateValidation } from '../../../common/DateDiff';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import "react-sweet-progress/lib/style.css";
import CircularProgress from '@material-ui/core/CircularProgress';

import Helmet from "react-helmet";
import OutboundSummaryIntervalHtml from './OutboundSummaryIntervalHtml';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const SHIFT = ['ALL','AM','PM'];
const DISPLAYAS = ['TEXT','HTML'];
const DROPGROUPS =['YES','NO'];
const BREAKDOWN_COL = 8;

const myClass={
    width:'5px',
    height:'15px',
}
class OutboundSummaryIntervals extends React.Component {
    constructor(props) {
        super(props);
        var ts = new Date();
        this.state = {
            from: new Date(),
            to: new Date(),
            dropRollover:'NO',
            campaigns:[],
            displayAs:'TEXT',
            callTime:'12pm-5pm',
            timeInterval:'900',
            from: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            to: moment(new Date).format('YYYY-MM-DD HH:mm:ss'),
            isLoading : false,
            selected_campaign:[],
            data : [],//DATA,
            call_time : [],
            selected_time :'',
            activeCol:0,
            date : moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            DateError : '',
            isShow : false,
            colName : '',
        };
    }

    handleChange = (name,value) =>{

        if(name=='displayAs'){
            this.setState({
                activeCol:0,
            })
        }

        this.setState({
            [name]:value,
        }) 
    }

    handleTimeChange = name => event => {
        this.setState({
            [name]:event.target.value,
        }) 
    }

    handleChanged = name => event => {
        this.setState({[name]: event.target.value});
    };

    clickCol = (i,name) =>{
        if(this.state.displayAs =='HTML') 
        this.setState({
            activeCol:i,
            colName : name,
        })
    }

    handleSubmit = () => {

        const {selected_time,data,from,to,dropRollover,selected_campaign,displayAs,date,isShow,isLoading,DateError,shift,timeInterval} = this.state;
    
        name = this.state.displayAs;
        if(name=='displayAs')
        {
            this.setState({
                activeCol:0,
            })
        }  

        this.setState({
            date : moment(new Date()).format('YYYY-MM-DD HH:MM:SS'),
        })

        let status = false;
        if(dateValidation(from,to,date,2)==false){
            this.setState({
                DateError : 'The date range for this report is limited to 60 days from today.'
            });
            status = true;
        }else{
            this.setState({
                DateError : ''});
            status = false;
        }

        if(status == false)
        {
            this.setState({
                isLoading:true,
            })

            var token = localStorage.getItem("access_token");
            const requestOptions = {
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization' : 'Bearer '+token ,
                }
            };

            axios.post('api/outbound_summary_interval_report/',
            {
                startdate:from,
                enddate:to,
                shift:selected_time,
                selectedgroups : selected_campaign,
                timeinterval:timeInterval,
                include_rollover:dropRollover,

            },requestOptions).then(response=>{  
                this.setState({
                    data : response.data,
                    isShow : true,
                    isLoading:false,
                })
                console.log("API REsponse ",response);
            }).catch(error =>{
                console.log(error);
            })
        }
    }




    handleFromDateChange = (date) => {
        this.setState({from: moment(date).format('YYYY-MM-DD HH:mm:ss')});
    };

    handleToDateChange = (date) => {
        this.setState({to: moment(date).format('YYYY-MM-DD HH:mm:ss')});
    };

    componentDidMount() 
    {      
        this.setState({isLoading:true});
        var token = localStorage.getItem("access_token");
        const requestOptions = {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer '+token ,
            }
        };
        axios.get('api/agent_campaign_option_list/',requestOptions).then(response=>{  
            
           this.setState({
               campaigns: response.data.data,
               selected_campaign: this.state.selected_campaign.concat([response.data.data[1].campaign_id]),
               flag :true,
           })
           this.handleSubmit();
       }).catch(error =>{
           console.log(error);
       }) 

        axios.get('api/inbound-call-time/',requestOptions).then(response=>{  
            this.setState({
                call_time: response.data.data,
                selected_time : response.data.data[0].call_time_id,      
            })
        }).catch(error =>{
            console.log(error);
        }) 
    }




    render() {
        const {isShow,isLoading,DateError,call_time,selected_time,selected_campaign,data,from,to,activeCol,displayAs,colName,campaigns,dropRollover,callTime} = this.state;
        var totalfirstTable1 = 0,totalfirstTable2 = 0,totalfirstTable3 = 0,totalfirstTable4 = 0,totalfirstTable5 = 0,totalfirstTable6 = 0,totalfirstTable7 = 0,totalfirstTable8 = 0,totalfirstTable9 = 0;

        var array = [];


        if(isShow){ 
            data.campaign_wise_details.map((val,key)=>{
                totalfirstTable1 =totalfirstTable1+data.campaign_wise_details[key].totalcallevents;
                totalfirstTable2 =totalfirstTable2+data.campaign_wise_details[key].totalsystemcalls;
                totalfirstTable3 =totalfirstTable3+data.campaign_wise_details[key].totalagentscalls; 
                totalfirstTable4 =totalfirstTable4+data.campaign_wise_details[key].totalsalecallsarray;
                totalfirstTable5 =totalfirstTable5+data.campaign_wise_details[key].totaldnccallsarray;
                totalfirstTable6 =totalfirstTable6+data.campaign_wise_details[key].gna_percent;
                totalfirstTable7 =totalfirstTable7+data.campaign_wise_details[key].gdroppercent;
            });
        }
        
    return (
        <div>
            <Helmet>
                <title>OutboundSummaryReport | Ytel</title>
            </Helmet>
            <ContainerHeader match={this.props.match} title='Outbound Summary Interval Report'/>

            <div className="row">
                <CardBox styleName="col-lg-12" heading="Outbound Summary Interval Report">
                    <form className="row" autoComplete="off">
                        <div className="col-lg-6 col-sm-6 col-12">

                            <FormControl className="w-100 mb-2">
                                <p>Dates</p>
                                <DateTimePicker
                                    fullWidth
                                    format='YYYY-MM-DD HH:mm:ss'
                                    locale={'es'}
                                    value={from}
                                    showTabs={false}
                                    onChange={this.handleFromDateChange}
                                    leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                                    rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                                />

                            </FormControl>

                            <FormControl className="w-100 mb-2">
                                <p>To</p>
                                <DateTimePicker
                                    fullWidth
                                    format='YYYY-MM-DD HH:mm:ss'
                                    value={to}
                                    showTabs={false}
                                    onChange={this.handleToDateChange}
                                    leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                                    rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                                />
                                {DateError?<FormHelperText style={{"color":"red","fontSize":"14px"}}>The date range for this report is limited to 60 days from today.</FormHelperText>:''}
                            </FormControl>

                            <Dropdown 
                                label={"Include Drop Groups"} 
                                onChange={this.handleChange}
                                name={'dropRollover'}
                                selectedValue={dropRollover}
                                data={DROPGROUPS}
                            />

                            <FormControl className="w-100 mb-2">
                                <InputLabel htmlFor="age-simple">Call Time</InputLabel>
                                <Select
                                    value={selected_time}
                                    onChange={this.handleTimeChange("selected_time")}
                                    input={<Input id="age-simple"/>}>

                                    {Object.keys(call_time).map((item,i)=>(
                                        <MenuItem key={i} value={call_time[item].call_time_id}>{call_time[item].call_time_id} - {call_time[item].call_time_name}</MenuItem>
                                    ))};
                                    
                                </Select>
                            </FormControl>

                            <Button color="primary" className="jr-btn bg-success text-white" onClick={this.handleSubmit}>
                                Submit
                            </Button>
                            
                        </div>
                        <div className="col-lg-6 col-sm-6 col-12">

                            <CampaignMultidropdownList 
                                label={"Campaigns"} 
                                options={campaigns} 
                                onChange={this.handleChange}
                                name={'selected_campaign'}
                                selectedValue={selected_campaign}
                                default={'--ALL--'}
                            />

                            <FormControl className="w-100 mb-2">
                                <InputLabel htmlFor="age-simple">Time Interval:</InputLabel>
                                <Select
                                    value={this.state.timeInterval}
                                    onChange={this.handleChanged('timeInterval')}
                                    input={<Input id="time-interval"/>}>
                                    
                                    <MenuItem value="900">15 Minutes</MenuItem>
                                    <MenuItem value="1800">30 Minutes</MenuItem>
                                    <MenuItem value="3600">1 Hour</MenuItem>
                                </Select>
                                <FormHelperText></FormHelperText>
                            </FormControl>

                            <Dropdown 
                                label={"Display As"} 
                                onChange={this.handleChange}
                                name={'displayAs'}
                                selectedValue={displayAs}
                                data={DISPLAYAS}
                            />
                        </div>
                    </form>
                </CardBox>
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
            {isShow ? 
            <Card className="shadow border-0 bg-default text-black">
                <CardBody>
                    
                    <span><label className="card-title">Outbound Summary Interval Report:</label>&nbsp;&nbsp;{selected_campaign.join(' | ')} &nbsp;&nbsp;|&nbsp;&nbsp;  {moment(new Date()).format('YYYY-MM-DD HH:MM:SS')}</span>
                    <h3 className="card-title">Time range: {from} To {to}</h3>

                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{textAlign:'center'}} colSpan={10}>MULTI-CAMPAIGN BREAKDOWN</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>CAMPAIGN</TableCell>
                                        <TableCell onClick={()=>this.clickCol(1,'TOTAL CALLS')}>TOTAL CALLS  </TableCell>
                                        <TableCell onClick={()=>this.clickCol(2,'SYSTEM RELEASE CALLS')}>SYSTEM RELEASE CALLS </TableCell>
                                        <TableCell onClick={()=>this.clickCol(3,'AGENT RELEASE CALLS')}>AGENT RELEASE CALLS  </TableCell>
                                        <TableCell onClick={()=>this.clickCol(4,'SALE CALLS')}>SALE CALLS   </TableCell>
                                        <TableCell onClick={()=>this.clickCol(5,'DNC CALLS')}>DNC CALLS    </TableCell>
                                        <TableCell onClick={()=>this.clickCol(6,'NO ANSWER PERCENT')}>NO ANSWER PERCENT    </TableCell>
                                        <TableCell onClick={()=>this.clickCol(7,'DROP PERCENT')}>DROP PERCENT </TableCell>
                                        <TableCell onClick={()=>this.clickCol(8,'AGENT LOGIN TIME(H:M:S)')}>AGENT LOGIN TIME(H:M:S)  </TableCell>
                                        <TableCell onClick={()=>this.clickCol(9,'AGENT PAUSE TIME(H:M:S)')}>AGENT PAUSE TIME(H:M:S)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>

                                    {data.campaign_wise_details.map((val,key)=>
                                            
                                        <TableRow key={key}>     
                                            <TableCell>{data.campaign_wise_details[key].campaign_id +" - "+data.campaign_wise_details[key].campaign_name.campaign_name} </TableCell>
                                            <TableCell className={activeCol!=0 && activeCol!=1?'hide-td':''} colSpan={activeCol==1?BREAKDOWN_COL:1}>
                                                {data.campaign_wise_details[key].totalcallevents} 
                                            </TableCell>
                                            <TableCell className={activeCol!=0 && activeCol!=2?'hide-td':''} colSpan={activeCol==2?BREAKDOWN_COL:1}>
                                                {data.campaign_wise_details[key].totalsystemcalls}
                                            </TableCell>
                                            <TableCell className={activeCol!=0 && activeCol!=3?'hide-td':''} colSpan={activeCol==3?BREAKDOWN_COL:1}>
                                                {data.campaign_wise_details[key].totalagentscalls} 
                                            </TableCell>
                                            <TableCell className={activeCol!=0 && activeCol!=4?'hide-td':''} colSpan={activeCol==4?BREAKDOWN_COL:1}>
                                                {data.campaign_wise_details[key].totalsalecallsarray}
                                            </TableCell>
                                            <TableCell className={activeCol!=0 && activeCol!=5?'hide-td':''} colSpan={activeCol==5?BREAKDOWN_COL:1}>
                                                {data.campaign_wise_details[key].totaldnccallsarray}
                                            </TableCell>
                                            <TableCell className={activeCol!=0 && activeCol!=6?'hide-td':''} colSpan={activeCol==6?BREAKDOWN_COL:1}>
                                                {data.campaign_wise_details[key].gna_percent}%    
                                            </TableCell>
                                            <TableCell className={activeCol!=0 && activeCol!=7?'hide-td':''} colSpan={activeCol==7?BREAKDOWN_COL:1}>
                                                {data.campaign_wise_details[key].gdroppercent}% 
                                            </TableCell>
                                            <TableCell className={activeCol!=0 && activeCol!=8?'hide-td':''} colSpan={activeCol==8?BREAKDOWN_COL:1}>
                                                {data.campaign_wise_details[key].loginagent_sec}
                                            </TableCell>
                                            <TableCell className={activeCol!=0 && activeCol!=9?'hide-td':''} colSpan={activeCol==9?BREAKDOWN_COL:1}>
                                                {data.campaign_wise_details[key].pauseagent_sec}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    <TableRow>
                                        <TableCell>TOTALS Campaigns:</TableCell>
                                        <TableCell>{data.totalcalls} </TableCell>
                                        <TableCell>{data.totalsystemcalls}</TableCell>
                                        <TableCell>{data.totalagentscalls} </TableCell>
                                        <TableCell>{data.totalsalecallsarray} </TableCell>
                                        <TableCell>{data.totaldnccallsarray}   </TableCell>
                                        <TableCell>{data.gtotalnapercent}%    </TableCell>
                                        <TableCell>{data.gtotaldroppercent}% </TableCell>
                                        <TableCell>{data.totalagentlogintime} </TableCell>
                                        <TableCell>{data.totalagentpausetime} </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                    <br/>
                    <br/>   

                    {data.sub_graph_stats.map((val,key)=>

                        //data.sub_graph_stats[key].map((v,k)=>
                    <Paper key={key}>
                        <div className="table-responsive-material">
                            {displayAs == 'TEXT' ?
                            <div>
                            
                            <Table>
                                <TableHead>
                                    <TableRow >
                                        <TableCell style={{textAlign:'center'}} colSpan={10}>{data.campaign_wise_details[key].campaign_id +" - "+data.campaign_wise_details[key].campaign_name.campaign_name}    INTERVAL BREAKDOWN:</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>INTERVAL</TableCell>
                                        <TableCell>TOTAL CALLS  </TableCell>
                                        <TableCell>SYSTEM RELEASE CALLS </TableCell>
                                        <TableCell>AGENT RELEASE CALLS  </TableCell>
                                        <TableCell>SALE CALLS   </TableCell>
                                        <TableCell>DNC CALLS    </TableCell>
                                        <TableCell>NO ANSWER PERCENT    </TableCell>
                                        <TableCell>DROP PERCENT </TableCell>
                                        <TableCell>AGENT LOGIN TIME(H:M:S)  </TableCell>
                                        <TableCell>AGENT PAUSE TIME(H:M:S)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    
                                    {data.sub_graph_stats[key].map((v,k)=>
                                        <TableRow key={k}>
                                            <TableCell>{data.sub_graph_stats[key][k][0]}</TableCell>
                                            <TableCell>{data.sub_graph_stats[key][k][1]}</TableCell>
                                            <TableCell>{data.sub_graph_stats[key][k][2]}</TableCell>
                                            <TableCell>{data.sub_graph_stats[key][k][3]}</TableCell>
                                            <TableCell>{data.sub_graph_stats[key][k][4]}</TableCell>
                                            <TableCell>{data.sub_graph_stats[key][k][5]}</TableCell>
                                            <TableCell>{data.sub_graph_stats[key][k][6]}%</TableCell>
                                            <TableCell>{data.sub_graph_stats[key][k][7]}%</TableCell>
                                            <TableCell>{data.sub_graph_stats[key][k][10]}</TableCell>
                                            <TableCell>{data.sub_graph_stats[key][k][11]}</TableCell>
                                        </TableRow>
                                    )}

                                    <TableRow key={key}>
                                        <TableCell>Total</TableCell>
                                        <TableCell >{data.campaign_wise_details[key].totalcallevents} </TableCell>
                                        <TableCell >{data.campaign_wise_details[key].totalsystemcalls}</TableCell>
                                        <TableCell >{data.campaign_wise_details[key].totalagentscalls} </TableCell>
                                        <TableCell >{data.campaign_wise_details[key].totalsalecallsarray}</TableCell>
                                        <TableCell >{data.campaign_wise_details[key].totaldnccallsarray}</TableCell>
                                        <TableCell >{data.campaign_wise_details[key].gna_percent}%    </TableCell>
                                        <TableCell >{data.campaign_wise_details[key].gdroppercent}% </TableCell>
                                        <TableCell >{data.campaign_wise_details[key].loginagent_sec}</TableCell>
                                        <TableCell >{data.campaign_wise_details[key].pauseagent_sec}</TableCell>
                                    </TableRow>

                                </TableBody>
                            </Table>
                            <br/>
                            </div>
                            :
                            <OutboundSummaryIntervalHtml
                                data={data.sub_graph_stats[key]}
                                data1={data.campaign_wise_details[key]}
                                displayAs = {"HTML"}
                                campaign_id={data.campaign_wise_details[key].campaign_id}
                                campaign_name={data.campaign_wise_details[key].campaign_name.campaign_name}
                            />
                            }
                        </div>
                    </Paper>
                        
                    )}
                  
                    <br/>
                    <br/>      
                </CardBody>
            </Card>:""}
        </div>
    );
}
}


export default OutboundSummaryIntervals;