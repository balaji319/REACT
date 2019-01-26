import { React,Table,TableBody,TableCell,TableHead,TableRow,InfoCard,ContainerHeader,CardBox,Paper,Input,InputLabel,MenuItem,FormControl,FormHelperText,Select,Card,CardBody,CardSubtitle,CardText,cloneElement,Component,Button,moment} from './plugins';

import MultipeDropdown from '../../../common/MultipeDropdown';
import Dropdown from '../../../common/Dropdown';
import DateRange from '../../../common/DateRange'
import CampaignMultidropdownList from '../common/CampaignMultidropdownList';
import LinearProgress from '@material-ui/core/LinearProgress';
import { dateValidation } from '../../../common/DateDiff';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import "react-sweet-progress/lib/style.css";
import CircularProgress from '@material-ui/core/CircularProgress';
import Helmet from "react-helmet";
import ProgressBar from '../common/ProgressBar';


const BREAKDOWN_COL = 5;
const BREAKDOWN_COL1 = 2;

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const SHIFT = ['ALL','AM','PM'];
const DISPLAYAS = ['TEXT','HTML'];
const DROPROLLOVER =['YES','NO'];
const CARRIERSTATS =['YES','NO'];
const BOTTOMGRAPH =['YES','NO'];

const myClass={
    width:'5px',
    height:'15px',
}
class OutboundCalling extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shift:'ALL',
            displayAs:'TEXT',
            activeCol:0,
            call_status_col_name :'CALLS',
            agentActiveCol:0,
            agent_stats_colname :'CALLS',
            from: moment(new Date()).format('YYYY-MM-DD'),
            to: moment(new Date()).format('YYYY-MM-DD'),    
            colName :'',
            dropRollover:'NO',
            carrierStats:'NO',
            campaigns:[],
            selected_campaign:[],
            bottomGraph:'NO',
            isLoading:false,
            data : [],//DATA.data,
            DateError:'',
            isShow : false,
            header : [],
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
        if(name=='displayAs'){
            this.setState({
                activeCol:0,
                agentActiveCol:0,
            })
        }

        if(value=='HTML'){
            this.setState({
                activeCol:1,
                agentActiveCol:1,
            })
        }
    }

    clickCol = (i,name) =>{
        if(this.state.displayAs =='HTML') 
        this.setState({
            activeCol:i,
            call_status_col_name:name,
        })
    }

    clickColAgent = (i,name) =>{
        if(this.state.displayAs =='HTML') 
        this.setState({
            agentActiveCol:i,
            agent_stats_colname :name,
        })
    }
    
    handleSubmit = () => {

        const {data,from,to,displayAs,date,isShow,isLoading,DateError,shift,dropRollover,carrierStats,bottomGraph,selected_campaign,campaigns} = this.state;
        var header = [];

        name = this.state.displayAs;
        
        this.setState({
            date : moment(new Date()).format('YYYY-MM-DD HH:MM:SS'),
        })
        const CL = campaigns.map((item,i)=>(item.campaign_id)).filter(Boolean);
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

            axios.post('api/outbound_calling_report/',
            {
                start_date:from,
                end_date:to,
                shift:shift,
                report_display_type:displayAs,
                include_rollover:dropRollover,
                carrier_stats:carrierStats,
                bottom_graph:bottomGraph,
                selected_groups:selected_campaign.indexOf('-ALL-')!='-1' ? CL:selected_campaign,
            },requestOptions).then(response=>{  
                
                header = response.data.data.bottom_graph.header
                header.shift();
                header.splice(-2);
                
                this.setState({
                    data : response.data.data,
                    isShow : true,
                    isLoading:false,
                    header : header,
                })

                console.log("API REsponse ",response);
            }).catch(error =>{
                console.log(error);
            })
        }
    
    }

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
    }

    render() 
    {
        const {header,isShow,isLoading,DateError,agentActiveCol,data,from,to,shift,displayAs,bottomGraph,carrierStats,dropRollover,campaigns,selected_campaign,activeCol} = this.state;
        // var header = [];
        
    return (
        <div>
            <Helmet>
                <title>OutboundCallingReport | Ytel</title>
            </Helmet>
            <ContainerHeader match={this.props.match} title='Outbound Calling Report'/>

            <div className="row">
                <CardBox styleName="col-lg-12" heading="Outbound Calling Report">
                    <form className="row" autoComplete="off">
                        <div className="col-lg-6 col-sm-6 col-12">

                            <DateRange 
                                onFromChange={this.handleFromChange} 
                                onToChange={this.handleToChange}
                                from={from}
                                to={to}
                            />

                            <FormHelperText style={DateError ? {"color":"red","fontSize":"14px"}:{}}>The date range for this report is limited to 60 days from today.</FormHelperText>
                             {/* {DateError?
                                    <p style={{"color":"red","fontSize":"14px"}}>The date range for this report is limited to 60 days from today.</p>:''} */}

                            <Dropdown 
                                label={"Include Drop Rollover"} 
                                onChange={this.handleChange}
                                name={'dropRollover'}
                                selectedValue={dropRollover}
                                data={DROPROLLOVER}
                            />

                            <Dropdown 
                                label={"Carrier Stats"} 
                                onChange={this.handleChange}
                                name={'carrierStats'}
                                selectedValue={carrierStats}
                                data={CARRIERSTATS}
                            />

                            <Dropdown 
                                label={"Shift"} 
                                onChange={this.handleChange}
                                name={'shift'}
                                selectedValue={shift}
                                data={SHIFT}
                            />

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
                                default={'-ALL-'}
                            />

                            <Dropdown 
                                label={"Bottom Graph"} 
                                onChange={this.handleChange}
                                name={'bottomGraph'}
                                selectedValue={bottomGraph}
                                data={BOTTOMGRAPH}
                            />

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
             
                    <span><label className="card-title">Outbound Calling Stats</label>&nbsp;&nbsp;{selected_campaign.join(' | ')} &nbsp;&nbsp;|&nbsp;&nbsp;  {moment(new Date()).format('YYYY-MM-DD HH:MM:SS')}</span>
                    <h3 className="card-title">Time range: {from} 00:00:00 To {to} 23:59:59</h3>

                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>DID</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Total Calls placed from this Campaign:   </TableCell>
                                        <TableCell>{data.total_callsinfo.total_calls}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Average Call Length for all Calls in seconds:    </TableCell>
                                        <TableCell>{data.total_callsinfo.total_calls_avg}</TableCell>
                                    </TableRow>
                                    {dropRollover == 'YES' ?
                                    <TableRow>
                                        <TableCell>Calls that went to rollover In-Group:    </TableCell>
                                        <TableCell>{data.total_callsinfo.rollover}</TableCell>
                                    </TableRow>
                                    :null}
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                    <br/>
                    <br/>   

                    
                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>HUMAN ANSWERED </TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Total Human Answered calls for this Campaign:  </TableCell>
                                        <TableCell>{data.human_answered.total_calls}</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Average Call Length for all HA in seconds:   </TableCell>
                                        <TableCell>
                                            {Number.parseFloat(data.human_answered.total_calls_avg).toFixed(2)}
                                        </TableCell>
                                        <TableCell>Total Time:  </TableCell>
                                        <TableCell>{data.human_answered.total_calls_time}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                    <br/>
                    <br/>   

                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>DROPS</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Total Outbound DROP Calls:   </TableCell>
                                        <TableCell>{data.drop_details.dropcount+"  "+data.drop_details.droptotpercent}%</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Percent of DROP Calls taken out of Answers:  </TableCell>
                                        <TableCell> {data.drop_details.dropcount+"/"+data.drop_details.anscount+"  "+data.drop_details.dropanspercent}%</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell> Percent of DROP/Answer Calls with Rollover: </TableCell>
                                        <TableCell>{data.drop_details.dropcount+"/"+data.drop_details.anscount+"  "+data.drop_details.dropanspercent}%</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell> Average Length for DROP Calls in seconds:    </TableCell>
                                        <TableCell>
                                            {Number.parseFloat(data.drop_details.dropavglength).toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell> Productivity Rating: </TableCell>
                                        <TableCell>{data.drop_details.prodrating}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                    <br/>
                    <br/>

                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell> NO ANSWERS   </TableCell>
                                        <TableCell>  </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Total NA calls -Busy,Disconnect,RingNoAnswer:    </TableCell>
                                        <TableCell>{data.na_calls_info.total_na_calls +"  "+data.na_calls_info.total_na_callspercent}%</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Total auto NA calls -system-set: </TableCell>
                                        <TableCell>{data.na_calls_info.auto_na_calls}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell> Total manual NA calls -agent-set:</TableCell>
                                        <TableCell>{data.na_calls_info.manual_na_calls}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell> Average Call Length for NA Calls in seconds:</TableCell>
                                        <TableCell>{data.na_calls_info.avglength}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                    <br/>
                    <br/>

                    <h3 className="card-title">CALL HANGUP REASON STATS</h3>
                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell >HANGUP REASON</TableCell>
                                        <TableCell>CALLS</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.keys(data.call_hangup_stats).map((val,key)=>
                                        val != 'hanguptotalcalls' ? 
                                            <TableRow key={key}>
                                                <TableCell>{data.call_hangup_stats[val].term_reason}</TableCell>
                                                <TableCell>{
                                                        displayAs == 'TEXT' ? 
                                                            data.call_hangup_stats[val].calls 
                                                            : 
                                                            <ProgressBar 
                                                                title={parseFloat(data.call_hangup_stats[val].calls)}
                                                                data={parseFloat(data.call_hangup_stats[val].calls)}
                                                                text={parseFloat(data.call_hangup_stats[val].calls)}
                                                            />

                                                        // <LinearProgress color="primary" variant="determinate" value={parseFloat(data.call_hangup_stats[val].calls)} className="progressbar-height" /> 
                                                    }</TableCell>
                                            </TableRow>
                                        :
                                        null
                                    )}
                                    <TableRow>
                                        <TableCell>TOTAL</TableCell>
                                        <TableCell>{data.call_hangup_stats.hanguptotalcalls}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>                    
                    <br/>
                    <br/>

                    <h3 className="card-title">CALL STATUS STATS</h3>
                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell >STATUS</TableCell>
                                        <TableCell onClick={()=>this.clickCol(1,'CALLS')}>CALLS</TableCell>
                                        <TableCell onClick={()=>this.clickCol(2,'TOTAL TIME')}>TOTAL TIME   </TableCell>
                                        <TableCell onClick={()=>this.clickCol(3,'AVG TIME')}>AVG TIME </TableCell>
                                        <TableCell onClick={()=>this.clickCol(4,'CALLS/HR')}>CALLS/HR </TableCell>
                                        <TableCell onClick={()=>this.clickCol(5,'AGENT CALLS/HR')}>AGENT CALLS/HR</TableCell>
                                    </TableRow>
                                    {displayAs == 'HTML' ?
                                        <TableRow>
                                            <TableCell>STATUS</TableCell>
                                            <TableCell colSpan={5}>{this.state.call_status_col_name}</TableCell>
                                        </TableRow> : null}
                                </TableHead>
                                <TableBody>
                                    {Object.keys(data.call_status_stat.statusstatsarray).map((val,key)=>
                                        data.call_status_stat.statusstatsarray[val].status ?
                                        <TableRow key={key}>
                                            <TableCell>
                                                {data.call_status_stat.statusstatsarray[val].status}
                                            </TableCell>
                                            <TableCell className={activeCol!=0 && activeCol!=1?'hide-td':''} colSpan={activeCol==1?BREAKDOWN_COL:1} >
                                                {activeCol==1 ? data.call_status_stat.statusstatsarray[val].calls :data.call_status_stat.statusstatsarray[val].calls}
                                            
                                            </TableCell>
                                            <TableCell className={activeCol!=0 && activeCol!=2?'hide-td':''} colSpan={activeCol==2?BREAKDOWN_COL:1} >
                                                {activeCol==2 ? data.call_status_stat.statusstatsarray[val].status_hours : 
                                                data.call_status_stat.statusstatsarray[val].status_hours}
                                            
                                            </TableCell>
                                            <TableCell className={activeCol!=0 && activeCol!=3?'hide-td':''} colSpan={activeCol==3?BREAKDOWN_COL:1} >
                                                {activeCol==3 ? data.call_status_stat.statusstatsarray[val].stats_avg_hours:data.call_status_stat.statusstatsarray[val].stats_avg_hours}
                                            
                                            </TableCell>
                                            <TableCell className={activeCol!=0 && activeCol!=4?'hide-td':''} colSpan={activeCol==4?BREAKDOWN_COL:1} >
                                                {activeCol==4 ? data.call_status_stat.statusstatsarray[val].statusrate : data.call_status_stat.statusstatsarray[val].statusrate}
                                            
                                            </TableCell>
                                            <TableCell className={activeCol!=0 && activeCol!=5?'hide-td':''} colSpan={activeCol==5?BREAKDOWN_COL:1} >
                                                {activeCol==5 ? data.call_status_stat.statusstatsarray[val].agentrate : data.call_status_stat.statusstatsarray[val].agentrate}
                                            
                                            </TableCell>
                                        </TableRow>
                                        :null
                                    )}
                                    <TableRow>
                                        <TableCell>Total</TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=1?'hide-td':''} colSpan={activeCol==1?BREAKDOWN_COL:1}>{data.call_status_stat.statusstatstotalcalls}</TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=2?'hide-td':''} colSpan={activeCol==2?BREAKDOWN_COL:1}>{data.call_status_stat.statustotaltime}</TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=3?'hide-td':''} colSpan={activeCol==3?BREAKDOWN_COL:1}>{data.call_status_stat.statusavgsec}</TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=4?'hide-td':''} colSpan={activeCol==4?BREAKDOWN_COL:1}>{data.call_status_stat.totalstatusrate} </TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=5?'hide-td':''} colSpan={activeCol==5?BREAKDOWN_COL:1}>
                                            {Number.parseFloat(data.call_status_stat.totalagentrate).toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                    <br/>
                    <br/>   

                    <h3 className="card-title">LIST ID STATS</h3>
                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>LIST </TableCell>
                                        <TableCell>CALLS</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.keys(data.list_id_stats).map((val,key)=>
                                        data.list_id_stats[val].list_id ? 
                                        <TableRow key={key}>
                                            <TableCell>{data.list_id_stats[val].list_id}</TableCell>
                                            <TableCell>
                                                {displayAs == 'HTML' ? 
                                                    <ProgressBar 
                                                        title={parseFloat(data.list_id_stats[val].calls)}
                                                        data={parseFloat(data.list_id_stats[val].calls)}
                                                        text={parseFloat(data.list_id_stats[val].calls)}
                                                    />
                                                    // <LinearProgress color="primary" variant="determinate" value={parseFloat(data.list_id_stats[val].calls)} className="progressbar-height" /> 
                                                 :data.list_id_stats[val].calls}
                                            </TableCell>
                                        </TableRow>
                                        :null
                                    )}
                                    <TableRow>
                                        <TableCell>Total</TableCell>
                                        <TableCell>{data.list_id_stats.listtotalcalls}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                    <br/>
                    <br/>   

                    <h3 className="card-title">AGENT PRESET DIALS</h3>
                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {data.agent_preset.agent_preset_head.map((val,key)=>
                                        <TableCell key={key}>{data.agent_preset.agent_preset_head[key]}</TableCell>
                                        )}
                                        
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.agent_preset.agent_preset_data.map((val,key)=>
                                        <TableRow key={key}>
                                            <TableCell>
                                                 {data.agent_preset.agent_preset_data[key].preset_name}
                                            </TableCell>
                                            <TableCell>
                                                {displayAs == 'HTML' ? 
                                                    <ProgressBar 
                                                        title={parseFloat(data.agent_preset.agent_preset_data[key].calls)}
                                                        data={parseFloat(data.agent_preset.agent_preset_data[key].calls)}
                                                        text={parseFloat(data.agent_preset.agent_preset_data[key].calls)}
                                                    />
                                                    // <LinearProgress color="primary" variant="determinate" value={parseFloat(data.agent_preset.agent_preset_data[key].calls)} className="progressbar-height" /> 
                                                 :
                                                 data.agent_preset.agent_preset_data[key].calls}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    <TableRow>
                                        <TableCell>Total</TableCell>
                                        <TableCell>{data.agent_preset.userlisttotalcalls}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                    <br/>
                    <br/>   

                    <h3 className="card-title">CUSTOM STATUS CATEGORY STATS</h3>
                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {data.custom_stats.custom_stats_head.map((val,key)=>
                                        <TableCell key={key}>{data.agent_preset.agent_preset_head[key]}</TableCell>
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.custom_stats.custom_stats_data.map((val,key)=>
                                        <TableRow key={key}>
                                            <TableCell>{data.custom_stats.custom_stats_data[key].vsc_id}</TableCell>
                                            <TableCell>{data.custom_stats.custom_stats_data[key].vsc_name}</TableCell>
                                            <TableCell>
                                                {displayAs == 'HTML' ? 
                                                    <ProgressBar 
                                                        title={parseFloat(data.custom_stats.custom_stats_data[key].statuscattotalcalls)}
                                                        data={parseFloat(data.custom_stats.custom_stats_data[key].statuscattotalcalls)}
                                                        text={parseFloat(data.custom_stats.custom_stats_data[key].statuscattotalcalls)}
                                                    />
                                                    // <LinearProgress color="primary" variant="determinate" value={parseFloat(data.custom_stats.custom_stats_data[key].statuscattotalcalls)} className="progressbar-height" /> 
                                                    :
                                                    data.custom_stats.custom_stats_data[key].statuscattotalcalls
                                                 }
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    <TableRow>
                                        <TableCell colSpan={2}>Total</TableCell>
                                        <TableCell>{data.custom_stats.statuscattotalcalls}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                    <br/>
                    <br/>   

                    <h3 className="card-title">AGENT STATS</h3>
                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {data.agent_statastics.agent_statastics_head.map((val,key)=>
                                            displayAs == 'HTML' && key == 0 ? null :
                                            <TableCell onClick={()=>this.clickColAgent(key,data.agent_statastics.agent_statastics_head[key])} key={key}>{data.agent_statastics.agent_statastics_head[key]}</TableCell>
                                        )}
                                    </TableRow>
                                    {displayAs == 'HTML' ?
                                        <TableRow>
                                            <TableCell>STATUS</TableCell>
                                            <TableCell colSpan={2}>{this.state.agent_stats_colname}</TableCell>
                                        </TableRow> :null}
                                    
                                </TableHead>
                                <TableBody>
                                    {data.agent_statastics.agent_statastics_data.map((val,key)=>
                                        <TableRow key={key}>
                                            <TableCell>{data.agent_statastics.agent_statastics_data[key].user+" - "+data.agent_statastics.agent_statastics_data[key].full_name}</TableCell>
                                            {/* {displayAs == 'TEXT' ?
                                                <TableCell>{data.agent_statastics.agent_statastics_data[key].calls}</TableCell> : null} */}

                                            <TableCell className={agentActiveCol!=0 && agentActiveCol!=1?'hide-td':''} colSpan={agentActiveCol==1?BREAKDOWN_COL1:1} >
                                                {agentActiveCol==1 ? data.agent_statastics.agent_statastics_data[key].calls : data.agent_statastics.agent_statastics_data[key].calls}
                                            
                                            </TableCell>

                                            <TableCell className={agentActiveCol!=0 && agentActiveCol!=2?'hide-td':''} colSpan={agentActiveCol==2?BREAKDOWN_COL1:1} >
                                                {agentActiveCol==2 ? data.agent_statastics.agent_statastics_data[key].total_length : data.agent_statastics.agent_statastics_data[key].total_length}
                                            
                                            </TableCell>
                                            <TableCell className={agentActiveCol!=0 && agentActiveCol!=3?'hide-td':''} colSpan={agentActiveCol==3?BREAKDOWN_COL1:1} >
                                                {agentActiveCol==3 ? data.agent_statastics.agent_statastics_data[key].avg_length :data.agent_statastics.agent_statastics_data[key].avg_length}
                                            
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    <TableRow>
                                        <TableCell>Total</TableCell>
                                        <TableCell className={agentActiveCol!=0 && agentActiveCol!=1?'hide-td':''} colSpan={agentActiveCol==1?BREAKDOWN_COL1:1}> {data.agent_statastics.agent_statastics_total.totalagents} </TableCell>
                                        <TableCell className={agentActiveCol!=0 && agentActiveCol!=2?'hide-td':''} colSpan={agentActiveCol==2?BREAKDOWN_COL1:1}>{data.agent_statastics.agent_statastics_total.totalagenttime}</TableCell>
                                        <TableCell className={agentActiveCol!=0 && agentActiveCol!=3?'hide-td':''} colSpan={agentActiveCol==3?BREAKDOWN_COL1:1}>{data.agent_statastics.agent_statastics_total.totalagentavgtime}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        {displayAs=="TEXT" ? 
                                            [<TableCell colSpan={3}>Average Wait time between calls</TableCell>,
                                            <TableCell>{data.agent_statastics.avgwait_time}</TableCell>]
                                            :
                                            [<TableCell colSpan={1}>Average Wait time between calls</TableCell>,
                                            <TableCell colSpan={2}>{data.agent_statastics.avgwait_time}</TableCell>]
                                        }
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                    <br/>
                    <br/>   
                    {bottomGraph == 'YES' ? 
                    <div>
                        <h3 className="card-title">TIME STATS  </h3>
                        <h4>GRAPH IN 15 MINUTE INCREMENTS OF AVERAGE HOLD TIME FOR CALLS TAKEN INTO THIS IN-GROUP</h4>
                        <Paper>
                            <div className="table-responsive-material">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Hour</TableCell>
                                            <TableCell>{header.join("     ")}</TableCell>
                                            <TableCell>DROPS</TableCell>
                                            <TableCell>TOTAL</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.bottom_graph.data.map((val,key)=>
                                            <TableRow key={key}>
                                                <TableCell>{data.bottom_graph.data[key][0]}</TableCell>
                                                <TableCell>{data.bottom_graph.data[key][1]}</TableCell>
                                                <TableCell>{data.bottom_graph.data[key][2]}</TableCell>
                                                <TableCell>{data.bottom_graph.data[key][3]}</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </Paper>
                        <br/>
                        <br/>
                    </div> 
                    :""}


                </CardBody>
            </Card> : ""}

        </div>
    );
}
}


export default OutboundCalling;