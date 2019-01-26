import { React,Table,TableBody,TableCell,TableHead,TableRow,InfoCard,ContainerHeader,CardBox,Paper,Input,InputLabel,MenuItem,FormControl,FormHelperText,Select,Card,CardBody,CardSubtitle,CardText,cloneElement,Component,Button,moment} from './plugins';
import LinearProgress from '@material-ui/core/LinearProgress';
import InboundGroupMultidropDown from '../common/InboundGroupMultidropDown';
import Dropdown from '../../../common/Dropdown';
import DateRange from '../../../common/DateRange';

import { dateValidation } from '../../../common/DateDiff';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import "react-sweet-progress/lib/style.css";
import CircularProgress from '@material-ui/core/CircularProgress';

import Helmet from "react-helmet";
const SHIFT = ['ALL','AM','PM'];
const DISPLAYAS = ['TEXT','HTML'];
const DROPGROUPS =['YES','NO'];
const BREAKDOWN_COL = 8;

class SummaryHourly extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            outboundDropGroup:'NO',
            activeCol:0,
            activeColGroup:0,
            shift:'',
            displayAs:'TEXT',
            date: moment(new Date()).format('YYYY-MM-DD'),
            from: moment(new Date()).format('YYYY-MM-DD'),
            to: moment(new Date()).format('YYYY-MM-DD'),
            inboundGroups:[],
            callTime :'',
            inound_group_list:[],
            data : [],//DATA.data,
            call_time :[],
            selected_time:'',
            DateError:'',
            isShow:false,
            isLoading:false,
        };
        this.handleFromChange = this.handleFromChange.bind(this);
        this.handleToChange = this.handleToChange.bind(this);
    }


    handleChange = (name,value) =>{
        this.setState({
            [name]:value,
        })
        if(name=='displayAs'){
            this.setState({
                activeCol:0,
                activeColGroup:0,
            })
        }
    }
    handleTimeChange = name => event => {
        this.setState({
            [name]:event.target.value,
        })
    }

    handleFromChange = (fromDate) => {
        this.setState({ from : moment(fromDate).format('YYYY-MM-DD') });
    }

    handleToChange = (toDate) => {
        this.setState({ to:moment(toDate).format('YYYY-MM-DD')});
    }


    clickCol = (i,name) =>{
        if(this.state.displayAs =='HTML')
        this.setState({
            activeCol:i,
        })
    }

    clickColGroup = (i,name) =>{
        if(this.state.displayAs =='HTML')
        this.setState({
            activeColGroup:i,
        })
    }


    handleSubmit = () => {

        const {selected_time,data,from,to,inboundGroups,displayAs,date,isShow,isLoading,DateError,shift} = this.state;

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

            axios.post('api/inbound-summery-report/',
            {
                startdate:from,
                enddate:to,
                shift:selected_time,
                selectedgroups:inboundGroups,
                reportdisplaytype:displayAs
            },requestOptions).then(response=>{
                this.setState({
                    data : response.data.data,
                    isShow : true,
                    isLoading:false,
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
        const {inound_group_list,displayAs} = this.state;
        var token = localStorage.getItem("access_token");
        const requestOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer '+token ,
            }
        };
        axios.get('api/inbound_calls_report_groups_list/',requestOptions).then(response=>{
            console.log("Helloo  "+response.data.list[0].group_id);
            this.setState({
                inound_group_list: response.data.list,
                inboundGroups: this.state.inboundGroups.concat([response.data.list[0].group_id]),
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


        //this.handleSubmit();
    }

    render() {
        const {isShow,isLoading,DateError,call_time,selected_time,data,from,to,shift,displayAs,inboundGroups,inound_group_list,activeCol,activeColGroup,colName,callTime,outboundDropGroup} = this.state;
        const notInKey = ['hour', 'totCalls', 'totAns', 'totAbandonedCall'];
    return (
        <div>
            <Helmet>
                <title>InboundSummaryHourlyReport | Ytel</title>
            </Helmet>
            <ContainerHeader match={this.props.match} title='Inbound Summary Hourly Report'/>

            <div className="row">

                <CardBox styleName="col-lg-12" heading="Inbound Summary Hourly Report">
                    <form className="row" autoComplete="off">
                        <div className="col-lg-6 col-sm-6 col-12">

                            <DateRange
                                onFromChange={this.handleFromChange}
                                onToChange={this.handleToChange}
                                from={from}
                                to={to}
                            />
                            {DateError?
                                    <p style={{"color":"red","fontSize":"14px"}}>The date range for this report is limited to 60 days from today.</p>:''}

                            {/* <Dropdown
                                label={"Call Times"}
                                onChange={this.handleChange}
                                name={'callTime'}
                                selectedValue={callTime}
                                data={callTimes}
                            /> */}

                            <FormControl className="w-100 mb-2">
                                <InputLabel htmlFor="age-simple">{this.props.label}</InputLabel>
                                <Select
                                    value={selected_time}
                                    onChange={this.handleTimeChange("selected_time")}
                                    input={<Input id="age-simple"/>}>

                                    {Object.keys(call_time).map((item,i)=>(
                                        <MenuItem key={i} value={call_time[item].call_time_id}>{call_time[item].call_time_id} - {call_time[item].call_time_name}</MenuItem>
                                    ))};

                                </Select>
                            </FormControl>

                            <Dropdown
                                label={"Exclude Outbound Drop Groups"}
                                onChange={this.handleChange}
                                name={'outboundDropGroup'}
                                selectedValue={outboundDropGroup}
                                data={DROPGROUPS}
                            />

                            <Button color="primary" className="jr-btn bg-success text-white" onClick={this.handleSubmit}>
                                Submit
                            </Button>
                        </div>
                        <div className="col-lg-6 col-sm-6 col-12">
                            <InboundGroupMultidropDown
                                label={"Inbound Groups"}
                                options={inound_group_list}
                                onChange={this.handleChange}
                                name={'inboundGroups'}
                                selectedValue={inboundGroups}
                            />
                            <br/>
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
                <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12">
                            <button type="button" className="btn btn-raised btn-sm pull-right btn-success">CSV Download</button>
                        </div>
                    </div>
                <CardBody>
                    <h3 className="card-title">{data.report_name}</h3>
                    <h3 className="card-title">{inboundGroups.join(' | ')}</h3>


                    <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12">
                            <label>MULTI-GROUP BREAKDOWN:</label>
                        </div>
                    </div>
                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>IN-GROUP</TableCell>
                                        <TableCell onClick={()=>this.clickCol(1,'TOTAL CALLS')}>TOTAL CALLS</TableCell>
                                        <TableCell onClick={()=>this.clickCol(2)}>TOTAL ANSWER </TableCell>
                                        <TableCell onClick={()=>this.clickCol(3)}>TOTAL TALK   </TableCell>
                                        <TableCell onClick={()=>this.clickCol(4)}>AVERAGE TALK  </TableCell>
                                        <TableCell onClick={()=>this.clickCol(5)}>TOTAL QUEUE TIME  </TableCell>
                                        <TableCell onClick={()=>this.clickCol(6)}>AVERAGE QUEUE TIME    </TableCell>
                                        <TableCell onClick={()=>this.clickCol(7)}>MAXIMUM QUEUE TIME        </TableCell>
                                        <TableCell onClick={()=>this.clickCol(8)}>TOTAL ABANDON CALLS </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>

                                    {Object.keys(data.total_each_in_bound_break_down).map((val,key) =>
                                        <TableRow key={key}>
                                            <TableCell>{data.InBoundGroup[key]}</TableCell>
                                            <TableCell className={activeCol!=0 && activeCol!=1?'hide-td':''} colSpan={activeCol==1?BREAKDOWN_COL:1} >
                                                {activeCol==1?
                                                    <LinearProgress color="primary" variant="determinate" value={data.total_html[val].tot_calls.widhth} className="progressbar-height" />
                                                    :
                                                    data.total_each_in_bound_break_down[val].tot_calls
                                                }
                                            </TableCell>
                                            <TableCell className={activeCol!=0 && activeCol!=2?'hide-td':''} colSpan={activeCol==2?BREAKDOWN_COL:1}>
                                                {activeCol==2?
                                                    <LinearProgress color="primary" variant="determinate" value={data.total_html[val].tot_ans.widhth} className="progressbar-height"/>
                                                    :
                                                    data.total_each_in_bound_break_down[val].tot_ans
                                                }
                                            </TableCell>
                                            <TableCell className={activeCol!=0 && activeCol!=3?'hide-td':''} colSpan={activeCol==3?BREAKDOWN_COL:1}>
                                                {activeCol==3?
                                                    <LinearProgress color="primary" variant="determinate" value={data.total_html[val].tot_talk.widhth} className="progressbar-height"/>
                                                    :
                                                data.total_each_in_bound_break_down[val].tot_talk}
                                            </TableCell>
                                            <TableCell className={activeCol!=0 && activeCol!=4?'hide-td':''} colSpan={activeCol==4?BREAKDOWN_COL:1}>
                                                {activeCol==4?
                                                    <LinearProgress color="primary" variant="determinate" value={data.total_html[val].avg_talk.widhth} className="progressbar-height"/>
                                                    :
                                                data.total_each_in_bound_break_down[val].avg_talk}
                                            </TableCell>
                                            <TableCell className={activeCol!=0 && activeCol!=5?'hide-td':''} colSpan={activeCol==5?BREAKDOWN_COL:1}>
                                                {activeCol==5?
                                                    <LinearProgress color="primary" variant="determinate" value={data.total_html[val].tot_que_time.widhth} className="progressbar-height"/>
                                                    :
                                                data.total_each_in_bound_break_down[val].tot_que_time}
                                            </TableCell>
                                            <TableCell className={activeCol!=0 && activeCol!=6?'hide-td':''} colSpan={activeCol==6?BREAKDOWN_COL:1}>
                                                {activeCol==6?
                                                    <LinearProgress color="primary" variant="determinate" value={data.total_html[val].avg_que_time.widhth} className="progressbar-height"/>
                                                    :
                                                data.total_each_in_bound_break_down[val].avg_que_time}
                                            </TableCell>
                                            <TableCell className={activeCol!=0 && activeCol!=7?'hide-td':''} colSpan={activeCol==7?BREAKDOWN_COL:1}>
                                                {activeCol==7?
                                                        <LinearProgress color="primary" variant="determinate" value={data.total_html[val].max_que_time.widhth} className="progressbar-height"/>
                                                        :
                                                    data.total_each_in_bound_break_down[val].max_que_time
                                                }
                                            </TableCell>
                                            <TableCell className={activeCol!=0 && activeCol!=8?'hide-td':''} colSpan={activeCol==8?BREAKDOWN_COL:1}>
                                                {activeCol==8?
                                                        <LinearProgress color="primary" variant="determinate" value={data.total_html[val].tot_abandoned_call.widhth} className="progressbar-height"/>
                                                        :
                                                    data.total_each_in_bound_break_down[val].tot_abandoned_call}
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    <TableRow>
                                        <TableCell>TOTAL In-Groups: {data.InBoundGroup.length}</TableCell>
                                        <TableCell>{data.total_inbound_break_down.tot_calls}</TableCell>
                                        <TableCell>{data.total_inbound_break_down.tot_ans}</TableCell>
                                        <TableCell>{data.total_inbound_break_down.tot_talk}</TableCell>
                                        <TableCell>{data.total_inbound_break_down.avg_talk}</TableCell>
                                        <TableCell>{data.total_inbound_break_down.tot_que_time}</TableCell>
                                        <TableCell>{data.total_inbound_break_down.avg_que_time}</TableCell>
                                        <TableCell>{data.total_inbound_break_down.max_que_time}</TableCell>
                                        <TableCell>{data.total_inbound_break_down.tot_abandoned_call}</TableCell>
                                    </TableRow>

                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                    <br/>
                    <br/>
                    {Object.keys(data.hourly_break_down_result).map((val,key) =>
                    <div>
                    <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12">
                            <center>
                            <h4>{data.InBoundGroup[key]}</h4>
                            <h4>Hourly Breakdown:</h4>
                            </center>
                        </div>
                    </div>
                    <Paper>
                        <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12">
                            <div className="table-responsive-material">
                                <Table key={key}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>HOUR</TableCell>
                                            <TableCell onClick={()=>this.clickColGroup(1)}>TOTAL CALLS</TableCell>
                                            <TableCell onClick={()=>this.clickColGroup(2)}>TOTAL ANSWER </TableCell>
                                            <TableCell onClick={()=>this.clickColGroup(3)}>TOTAL TALK   </TableCell>
                                            <TableCell onClick={()=>this.clickColGroup(4)}>AVERAGE TALK  </TableCell>
                                            <TableCell onClick={()=>this.clickColGroup(5)}>TOTAL QUEUE TIME  </TableCell>
                                            <TableCell onClick={()=>this.clickColGroup(6)}>AVERAGE QUEUE TIME    </TableCell>
                                            <TableCell onClick={()=>this.clickColGroup(7)}>MAXIMUM QUEUE TIME        </TableCell>
                                            <TableCell onClick={()=>this.clickColGroup(8)}>TOTAL ABANDON CALLS </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Object.keys(data.hourly_break_down_result[val]).map((v,k)=>
                                            <TableRow key={k}>
                                                <TableCell>{data.hourly_break_down_result[val][k].hour}</TableCell>
                                                <TableCell className={activeColGroup!=0 && activeColGroup!=1?'hide-td':''} colSpan={activeColGroup==1?BREAKDOWN_COL:1} >
                                                    {activeColGroup==1?
                                                        <LinearProgress color="primary" variant="determinate" value={data.html_each_first[val].tot_calls[k].widhth} className="progressbar-height"/>
                                                     :
                                                     data.hourly_break_down_result[val][k].tot_calls}
                                                </TableCell>
                                                <TableCell className={activeColGroup!=0 && activeColGroup!=2?'hide-td':''} colSpan={activeColGroup==2?BREAKDOWN_COL:1} >
                                                    {activeColGroup==2?
                                                        <LinearProgress color="primary" variant="determinate" value={data.html_each_first[val].tot_ans[k].widhth} className="progressbar-height"/>
                                                     :data.hourly_break_down_result[val][k].tot_ans}
                                                </TableCell>
                                                <TableCell className={activeColGroup!=0 && activeColGroup!=3?'hide-td':''} colSpan={activeColGroup==3?BREAKDOWN_COL:1} >
                                                    {activeColGroup==3?
                                                        <LinearProgress color="primary" variant="determinate" value={data.html_each_first[val].tot_talk[k].widhth} className="progressbar-height"/>
                                                     :data.hourly_break_down_result[val][k].tot_talk}
                                                </TableCell>
                                                <TableCell className={activeColGroup!=0 && activeColGroup!=4?'hide-td':''} colSpan={activeColGroup==4?BREAKDOWN_COL:1} >
                                                    {activeColGroup==4?
                                                        <LinearProgress color="primary" variant="determinate" value={data.html_each_first[val].avg_talk[k].widhth} className="progressbar-height"/>
                                                     :data.hourly_break_down_result[val][k].avg_talk}
                                                </TableCell>
                                                <TableCell className={activeColGroup!=0 && activeColGroup!=5?'hide-td':''} colSpan={activeColGroup==5?BREAKDOWN_COL:1} >
                                                    {activeColGroup==5?
                                                        <LinearProgress color="primary" variant="determinate" value={data.html_each_first[val].tot_que_time[k].widhth} className="progressbar-height"/>
                                                     :data.hourly_break_down_result[val][k].tot_que_time}
                                                </TableCell>
                                                <TableCell className={activeColGroup!=0 && activeColGroup!=6?'hide-td':''} colSpan={activeColGroup==6?BREAKDOWN_COL:1} >
                                                    {activeColGroup==6?
                                                        <LinearProgress color="primary" variant="determinate" value={data.html_each_first[val].avg_que_time[k].widhth} className="progressbar-height"/>
                                                     :data.hourly_break_down_result[val][k].avg_que_time}
                                                </TableCell>
                                                <TableCell className={activeColGroup!=0 && activeColGroup!=7?'hide-td':''} colSpan={activeColGroup==7?BREAKDOWN_COL:1} >
                                                    {activeColGroup==7?
                                                        <LinearProgress color="primary" variant="determinate" value={data.html_each_first[val].max_que_time[k].widhth} className="progressbar-height"/>
                                                     :data.hourly_break_down_result[val][k].max_que_time}
                                                </TableCell>
                                                <TableCell className={activeColGroup!=0 && activeColGroup!=8?'hide-td':''} colSpan={activeColGroup==8?BREAKDOWN_COL:1} >
                                                    {activeColGroup==8?
                                                        <LinearProgress color="primary" variant="determinate" value={data.html_each_first[val].tot_abandoned_call[k].widhth} className="progressbar-height"/>
                                                     :data.hourly_break_down_result[val][k].tot_abandoned_call}
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        <TableRow>
                                            <TableCell>TOTAL</TableCell>
                                            <TableCell>{data.total_each_in_bound_break_down[val].tot_calls}</TableCell>
                                            <TableCell>{data.total_each_in_bound_break_down[val].tot_ans}</TableCell>
                                            <TableCell>{data.total_each_in_bound_break_down[val].tot_talk}</TableCell>
                                            <TableCell>{data.total_each_in_bound_break_down[val].avg_talk}</TableCell>
                                            <TableCell>{data.total_each_in_bound_break_down[val].tot_que_time}</TableCell>
                                            <TableCell>{data.total_each_in_bound_break_down[val].avg_que_time}</TableCell>
                                            <TableCell>{data.total_each_in_bound_break_down[val].max_que_time}</TableCell>
                                            <TableCell>{data.total_each_in_bound_break_down[val].tot_abandoned_call}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                        </div>
                    </Paper>
                    <br/>
                    <br/>
                    </div>

                    )}


                </CardBody>
            </Card>:""}

        </div>
    );
}
}
export default SummaryHourly;