import { React,Table,TableBody,TableCell,TableHead,TableRow,InfoCard,ContainerHeader,CardBox,Paper,Input,InputLabel,MenuItem,FormControl,FormHelperText,Select,Card,CardBody,CardSubtitle,CardText,cloneElement,Component,Button,moment} from './plugins';

import MultipeDropdown from '../../../common/MultipeDropdown';
import Dropdown from '../../../common/Dropdown';
import InboundGroupDropdown from '../common/InboundGroupDropdown';
import DateRange from '../../../common/DateRange';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { dateValidation } from '../../../common/DateDiff';
import Helmet from "react-helmet";

import ProgressBar from './ProgressBar';

const SHIFT = ['ALL','AM','PM'];
const DISPLAYAS = ['TEXT','HTML'];
const BREAKDOWN_COL = 10;

class ServiceLevel extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            activeCol:0,
            colName :'DROPS',
            shift:'ALL',
            displayAs:'TEXT',
            from: moment(new Date()).format('YYYY-MM-DD'),
            to: moment(new Date()).format('YYYY-MM-DD'),
            date : moment(new Date()).format('YYYY-MM-DD'),
            inboundGroups:'',
            data:[],//DATA.data,
            isLoading:false,
            inound_group_list:[],
            flag1 : false,
            flag2 : false,
            average_hold_time : true, 
            calls_handled : true, 
            DateError:'',
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
        if(name=='displayAs'){
            this.setState({
                activeCol:0,
            })
        }
        if(value == 'TEXT')
        {
            this.setState({
                average_hold_time : true, 
                calls_handled : true 
            });
        }
        else{
            this.setState({
                average_hold_time : true, 
                calls_handled : false 
            })
        }
    }

    handleSubmit = () =>{

        const {data,from,to,date,DateError,shift,inboundGroups,displayAs,flag2} = this.state;
        
        if(displayAs == 'HTML'){this.setState({activeCol:1})}else{this.setState({calls_handled:true})}
        
        this.setState({
            flag2:false,
            date : moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
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
            
            axios.post('api/inbound-service-level-report/',{
                startdate : from,
                enddate : to,
                shift : shift,
                selectedgroups : inboundGroups,
                reportdisplaytype : displayAs
            },requestOptions).then(response=>{  
                this.setState({
                    data: response.data.data,
                    flag2 :true,
                    isLoading:false,
                })

            }).catch(error =>{
                console.log(error);
            })
        }
    }

    clickCol = (i,name) =>{
        if(this.state.displayAs =='HTML') 
        this.setState({
            activeCol:i,
            colName:name,
        })
    }

    componentDidMount() 
    {      
        this.setState({isLoading:true});
        const {inound_group_list} = this.state;
        var token = localStorage.getItem("access_token");
        const requestOptions = {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer '+token ,
            }
        };
        axios.get('api/get-list-service-report/',requestOptions).then(response=>{  
            this.setState({
                inound_group_list: response.data.data,
                inboundGroups : response.data.data[0].group_id,
                flag1 :true,
                isLoading:false,
            })
        }).catch(error =>{
            console.log(error);
        }) 
    }
    
    changeView = (label) =>{
        if(label === 'AVG_HOLD_TIME'){
            this.setState({
                average_hold_time : true, 
                calls_handled : false,
            })
        }
        else{
            this.setState({
                average_hold_time : false, 
                calls_handled : true,
            })
        }
    }

    
    render() {
        const {isLoading,from,to,DateError,shift,displayAs,inboundGroups,activeCol,colName,data,inound_group_list,flag1,flag2,average_hold_time,calls_handled} = this.state;

        if(flag2){
        var max_totDROPSdate = Math.max.apply(Math, data.tot_drops_date);
        var max_totDROPSpctDATE = Math.max.apply(Math, data.tot_drops_pct_date);
        var max_totDROPSavgDATE = Math.max.apply(Math, data.tot_drops_avg_date);
        var max_totQUEUEdate = Math.max.apply(Math, data.tot_queue_date);
        var max_totQUEUEpctDATE = Math.max.apply(Math, data.tot_queuepct_date);
        var max_totQUEUEavgDATE = Math.max.apply(Math, data.tot_queue_avg_date);
        var max_totQUEUEtotDATE = Math.max.apply(Math, data.tot_queue_tot_date);
        var max_totCALLSdate = Math.max.apply(Math, data.tot_calls_date);
        var max_totTIME_MS = Math.max.apply(Math, data.tot_time_ms);
        var max_totCALLSavgDATE = Math.max.apply(Math, data.tot_calls_avg_date);

        var length_back = 0;
        var remain = 0;    
        var remain_handle = 0;    

        var count=data.holdscale_array.length;
        var count_handle=data.call_scale_array.length;
        var dropslength=0;
        var callslength=0;}
    return (
        <div>
            <Helmet>
                <title>InboundServiceLevelReport | Ytel</title>
            </Helmet>



            <ContainerHeader match={this.props.match} title='Inbound Service Level Report'/>

            <div className="row">
                <CardBox styleName="col-lg-12" heading="Inbound Service Level Report">
                    <form className="row" autoComplete="off">
                        <div className="col-lg-4 col-sm-6 col-12">

                            <DateRange 
                                onFromChange={this.handleFromChange} 
                                onToChange={this.handleToChange}
                                from={from}
                                to={to}
                            />
                            {DateError?
                                    <p style={{"color":"red","fontSize":"14px"}}>The date range for this report is limited to 60 days from today.</p>:''}
                            
                            <InboundGroupDropdown 
                                label={"Inbound Groups"} 
                                onChange={this.handleChange}
                                name={'inboundGroups'}
                                selectedValue={inboundGroups}
                                data={inound_group_list}
                            />

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

           


            <Card className="shadow border-0 bg-default text-black">
                <CardBody>
                    

                    {!flag2 ? 
                    <label style={{fontSize:20}}>PLEASE SELECT AN IN-GROUP AND DATE RANGE ABOVE AND CLICK SUBMIT</label>
                    :
                    <div>
                    <span><label className="card-title">Inbound Call Stats:</label>&nbsp;&nbsp;{inboundGroups} &nbsp;&nbsp;|&nbsp;&nbsp;  {moment(new Date()).format('YYYY-MM-DD HH:MM:SS')}</span>
                    <h3 className="card-title">Time range: {from} 00:00:00 To {to} 11:59:59 </h3>
                    
                    <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12">
                            <label style={{fontSize:20}}>CALL HOLD TIME BREAKDOWN IN SECONDS</label>
                            <button type="button" className="btn btn-raised btn-sm pull-right btn-success">CSV Download</button>
                        </div>
                    </div> 
                    

                    <div>
                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>DATE</TableCell>
                                        <TableCell onClick={()=>this.clickCol(1,'DROPS')}>DROPS</TableCell>
                                        <TableCell onClick={()=>this.clickCol(2,'DROP %')}>DROP %</TableCell>
                                        <TableCell onClick={()=>this.clickCol(3,'AVG DROP(s)')}>AVG DROP(s)</TableCell>
                                        <TableCell onClick={()=>this.clickCol(4,'HOLD')}>HOLD </TableCell>
                                        <TableCell onClick={()=>this.clickCol(5,'HOLD %')}>HOLD % </TableCell>
                                        <TableCell onClick={()=>this.clickCol(6,'AVG HOLD(s)HOLD')}>AVG HOLD(s)HOLD </TableCell>
                                        <TableCell onClick={()=>this.clickCol(7,'AVG HOLD(s)TOTAL')}>AVG HOLD(s)TOTAL </TableCell>
                                        <TableCell onClick={()=>this.clickCol(8,'CALLS')}>CALLS </TableCell>
                                        <TableCell onClick={()=>this.clickCol(9,'TOTALCALLTIMEHOUR:MIN:SEC')}>TOTALCALLTIMEHOUR:MIN:SEC</TableCell>
                                        <TableCell onClick={()=>this.clickCol(10,'AVG CALLTIME SECONDS')}>AVG CALLTIME SECONDS </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                        {displayAs=='HTML'?
                                        <TableRow>
                                            <TableCell colSpan={11}>INBOUND SERVICE LEVEL REPORT</TableCell>
                                        </TableRow>
                                        :null}
                                        {displayAs=='HTML'?
                                        <TableRow>
                                            <TableCell>TIME RANGE</TableCell>
                                            <TableCell colSpan={10}>{colName}</TableCell>
                                        </TableRow>
                                        :null}
                                     
                                    
                                    {[...Array(data.tot_drops_date.length).keys()].map(key => 
                                       
                                    <TableRow key={key}>
                                        <TableCell> {data.time_array['day_start'][key]} &nbsp;&nbsp;&nbsp; {data.time_array['day_end'][key]}</TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=1?'hide-td':''} colSpan={activeCol==1?BREAKDOWN_COL:1} >
                                            {activeCol == 1 && displayAs=='HTML' ? 

                                                <ProgressBar 
                                                    title={data.tot_drops_date[key]}
                                                    data={data.tot_drops_date[key] > 0 ? (600*data.tot_drops_date[key]/max_totDROPSdate) : data.tot_drops_date[key]}
                                                    text={data.tot_drops_date[key]}
                                                />
                                                : data.tot_drops_date[key]} 
                                        </TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=2?'hide-td':''} colSpan={activeCol==2?BREAKDOWN_COL:1} >{activeCol == 2 && displayAs=='HTML' ?
                                            //  <LinearProgress color="primary" variant="determinate" value={data.tot_drops_pct_date[key] > 0 ? (600*data.tot_drops_pct_date[key]/max_totDROPSpctDATE) : data.tot_drops_pct_date[key]} className="progressbar-height"/> 
                                             <ProgressBar 
                                                    title={data.tot_drops_pct_date[key]}
                                                    data={data.tot_drops_pct_date[key] > 0 ? (600*data.tot_drops_pct_date[key]/max_totDROPSpctDATE) : data.tot_drops_pct_date[key]}
                                                    text={data.tot_drops_pct_date[key]}
                                                />
                                             : 
                                             data.tot_drops_pct_date[key] }
                                        </TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=3?'hide-td':''} colSpan={activeCol==3?BREAKDOWN_COL:1} >{activeCol == 3 && displayAs=='HTML' ?
                                            //  <LinearProgress color="primary" variant="determinate" value={data.tot_drops_avg_date[key] > 0 ? (600*data.tot_drops_avg_date[key]/max_totDROPSavgDATE) : data.tot_drops_avg_date[key]} className="progressbar-height"/> 
                                             <ProgressBar 
                                                    title={data.tot_drops_avg_date[key]}
                                                    data={data.tot_drops_avg_date[key] > 0 ? (600*data.tot_drops_avg_date[key]/max_totDROPSavgDATE) : data.tot_drops_avg_date[key]}
                                                    text={data.tot_drops_avg_date[key]}
                                                />
                                             : 
                                             data.tot_drops_avg_date[key] }
                                        </TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=4?'hide-td':''} colSpan={activeCol==4?BREAKDOWN_COL:1} >{activeCol == 4 && displayAs=='HTML' ?
                                            //  <LinearProgress color="primary" variant="determinate" value={data.tot_queue_date[key] > 0 ? (600*data.tot_queue_date[key]/max_totQUEUEdate) : data.tot_queue_date[key]} className="progressbar-height"/>    
                                             <ProgressBar 
                                                title={data.tot_queue_date[key]}
                                                data={data.tot_queue_date[key] > 0 ? (600*data.tot_queue_date[key]/max_totQUEUEdate) : data.tot_queue_date[key]}
                                                text={data.tot_queue_date[key]}
                                            />

                                             : 
                                             data.tot_queue_date[key] }
                                        </TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=5?'hide-td':''} colSpan={activeCol==5?BREAKDOWN_COL:1} >{activeCol == 5 && displayAs=='HTML' ?
                                            // <LinearProgress color="primary" variant="determinate" value={data.tot_queuepct_date[key] > 0 ? (600*data.tot_queuepct_date[key]/max_totQUEUEpctDATE) : data.tot_queuepct_date[key]} className="progressbar-height"/> 
                                            <ProgressBar 
                                                title={data.tot_queuepct_date[key]}
                                                data={data.tot_queuepct_date[key] > 0 ? (600*data.tot_queuepct_date[key]/max_totQUEUEpctDATE) : data.tot_queuepct_date[key]}
                                                text={data.tot_queuepct_date[key]}
                                            />
                                             :
                                            data.tot_queuepct_date[key] }
                                        </TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=6?'hide-td':''} colSpan={activeCol==6?BREAKDOWN_COL:1} >{activeCol == 6 && displayAs=='HTML' ?
                                            //  <LinearProgress color="primary" variant="determinate" value={data.tot_queue_avg_date[key] > 0 ? (600*data.tot_queue_avg_date[key]/max_totQUEUEavgDATE) : data.tot_queue_avg_date[key]} className="progressbar-height"/> 
                                             <ProgressBar 
                                                title={data.tot_queue_avg_date[key]}
                                                data={data.tot_queue_avg_date[key] > 0 ? (600*data.tot_queue_avg_date[key]/max_totQUEUEavgDATE) : data.tot_queue_avg_date[key]}
                                                text={data.tot_queue_avg_date[key]}
                                            />
                                             : 
                                             data.tot_queue_avg_date[key] }
                                        </TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=7?'hide-td':''} colSpan={activeCol==7?BREAKDOWN_COL:1} >{activeCol == 7 && displayAs=='HTML' ?
                                            //  <LinearProgress color="primary" variant="determinate" value={data.tot_queue_tot_date[key] >0 ? (600*data.tot_queue_tot_date[key]/max_totQUEUEtotDATE) : data.tot_queue_tot_date[key]} className="progressbar-height"/> 
                                             <ProgressBar 
                                                title={data.tot_queue_tot_date[key]}
                                                data={data.tot_queue_tot_date[key] >0 ? (600*data.tot_queue_tot_date[key]/max_totQUEUEtotDATE) : data.tot_queue_tot_date[key]}
                                                text={data.tot_queue_tot_date[key]}
                                            />
                                             : 
                                             data.tot_queue_tot_date[key] }
                                        </TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=8?'hide-td':''} colSpan={activeCol==8?BREAKDOWN_COL:1} >{activeCol == 8 && displayAs=='HTML' ?
                                            //  <LinearProgress color="primary" variant="determinate" value={data.tot_calls_date[key] > 0 ? (600*data.tot_calls_date[key]/max_totCALLSdate) : data.tot_calls_date[key]} className="progressbar-height"/>    
                                            <ProgressBar 
                                                title={data.tot_calls_date[key]}
                                                data={data.tot_calls_date[key] > 0 ? (600*data.tot_calls_date[key]/max_totCALLSdate) : data.tot_calls_date[key]}
                                                text={data.tot_calls_date[key]}
                                            />
                                             : 
                                             data.tot_calls_date[key] }
                                        </TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=9?'hide-td':''} colSpan={activeCol==9?BREAKDOWN_COL:1} >{activeCol == 9 && displayAs=='HTML' ?
                                            //  <LinearProgress color="primary" variant="determinate" value={data.tot_time_ms[key] > 0 ? (600*data.tot_time_ms[key]/max_totTIME_MS) : data.tot_time_ms[key]} className="progressbar-height"/>      
                                             <ProgressBar 
                                                title={data.tot_time_ms[key]}
                                                data={data.tot_time_ms[key] > 0 ? (600*data.tot_time_ms[key]/max_totTIME_MS) : data.tot_time_ms[key]}
                                                text={data.tot_time_ms[key]}
                                            />
                                             : 
                                             data.tot_time_ms[key] }
                                        </TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=10?'hide-td':''} colSpan={activeCol==10?BREAKDOWN_COL:1} >{activeCol == 10 && displayAs=='HTML' ?
                                            //  <LinearProgress color="primary" variant="determinate" value={data.tot_calls_avg_date[key] > 0 ? (600*data.tot_calls_avg_date[key]/max_totCALLSavgDATE) : data.tot_calls_avg_date[key]} className="progressbar-height"/>   
                                             <ProgressBar 
                                                title={data.tot_calls_avg_date[key]}
                                                data={data.tot_calls_avg_date[key] > 0 ? (600*data.tot_calls_avg_date[key]/max_totCALLSavgDATE) : data.tot_calls_avg_date[key]}
                                                text={data.tot_calls_avg_date[key]}
                                            />
                                             : 
                                             data.tot_calls_avg_date[key] }
                                        </TableCell>
                                    </TableRow>
                                    )}
                                    <TableRow>
                                        <TableCell>TOTAL</TableCell>
                                        <TableCell>{data.ftot_drops} </TableCell>
                                        <TableCell>{data.ftot_drops_pct}</TableCell>
                                        <TableCell>{data.ftot_drops_avg}</TableCell>
                                        <TableCell>{data.ftot_queue}</TableCell>
                                        <TableCell>{data.ftot_queue_pct}</TableCell>
                                        <TableCell>{data.ftot_queue_avg}</TableCell>
                                        <TableCell>{data.ftot_queue_tot}</TableCell>
                                        <TableCell>{data.ftot_calls}</TableCell>
                                        <TableCell>{data.ftot_time_ms}</TableCell>
                                        <TableCell>{data.ftot_calls_avg}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                    <br/>
                    <br/>
                    
                    <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12">
                            <label style={{fontSize:20}}>GRAPH IN 15 MINUTE INCREMENTS OF AVERAGE HOLD TIME FOR CALLS TAKEN INTO THIS IN-GROUP</label>
                        </div>
                    </div> 
                    
                    <Paper>
                        <div className="row">
                        {displayAs === 'HTML' ?
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <Button variant="raised" color="primary" className="jr-btn jr-btn-sm" onClick={()=>this.changeView('AVG_HOLD_TIME')}>
                                                AVERAGE HOLD TIME
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="raised" color="primary" className="jr-btn jr-btn-sm" onClick={()=>this.changeView('CALLS_HANDLED')}>
                                                CALLS HANDLED
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                            </Table>:""}

                        <div className={displayAs === 'TEXT' ? "col-lg-6 col-sm-6 col-6" :"col-lg-12 col-sm-12 col-12" } style={average_hold_time? {} : {display : 'none'} }>
                            <div className="table-responsive-material">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>TIME 15 MIN INT</TableCell>
                                            <TableCell colSpan={count}>AVG HOLD TIME (sec)  </TableCell>
                                            <TableCell colSpan={2}>(in seconds)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell></TableCell>
                                            {[...Array(data.holdscale_array.length).keys()].map(key => 
                                                <TableCell key={key}>{data.holdscale_array[key]}</TableCell>
                                            )}
                                            <TableCell>AVG</TableCell>
                                            <TableCell>MAX</TableCell>
                                        </TableRow>

                                        {[...Array(data.time_array['hm_display'].length).keys()].map(i => 
                                        <TableRow key={i}>
                                            <TableCell>{data.time_array['hm_display'][i]}</TableCell>
                                            {
                                                [...Array(data.holdscale_array.length).keys()].map(j => 
                                                {
                                                    if(data.holdscale_array[j] <= data.qrt_queue_avg[i]){
                                                        length_back=j+1;
                                                        remain= count - length_back;
                                                    } 
                                                }
                                            )}    

                                            
                                            { data.qrt_queue_avg[i] > 0
                                                ? 
                                                    displayAs == 'TEXT' ? 
                                                    [
                                                    <TableCell style={{backgroundColor:'orange'}} colSpan={length_back}></TableCell>,
                                                    (remain > 0
                                                        ? <TableCell key={i} colSpan={remain}></TableCell>
                                                        : null
                                                    )
                                                    ]
                                                    :
                                                    <TableCell colSpan={count}>
                                                        <ProgressBar 
                                                            title={parseInt(400*(data.qrt_queue_avg[i]/100))/1}
                                                            data={parseInt(400*(data.qrt_queue_avg[i]/100))/1}
                                                            text={parseInt(400*(data.qrt_queue_avg[i]/100))/1}
                                                        />
                                                        {/* <Progress strokeWidth={30} percent={parseInt(400*(data.qrt_queue_avg[i]/100))/1} /> */}
                                                    </TableCell> 

                                                :<TableCell colSpan={count}></TableCell> 
                                            }
                                            <TableCell>{data.qrt_queue_avg[i]}</TableCell>
                                            <TableCell>{data.qrt_queue_max[i]}</TableCell>

                                        </TableRow>
                                        )}
                                        <TableRow>
                                            <TableCell colSpan={count+1}>Total </TableCell>
                                            <TableCell>{data.tot_queue_avg}</TableCell>
                                            <TableCell>{data.tot_queue_max}</TableCell>
                                        </TableRow>

                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                        <div className={displayAs === 'TEXT' ? "col-lg-6 col-sm-6 col-6" :"col-lg-12 col-sm-12 col-12" } style={calls_handled? {} : {display : 'none'} }>
                            <div className="table-responsive-material">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>TIME 15 MIN INT</TableCell>
                                            <TableCell colSpan={count_handle}>CALLS HANDLED  </TableCell>
                                            <TableCell colSpan={2}>(in seconds)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell></TableCell>
                                            {[...Array(data.call_scale_array.length).keys()].map(key => 
                                                <TableCell key={key}>{data.call_scale_array[key]}</TableCell>
                                            )}
                                            <TableCell>DROPS</TableCell>
                                            <TableCell>TOTAL</TableCell>
                                        </TableRow>

                                        {[...Array(data.time_array['hm_display'].length).keys()].map(i => 
                                        <TableRow key={i}>
                                            <TableCell>{data.time_array['hm_display'][i]}</TableCell>
                                            {
                                               data.qrt_calls[i]>0 && data.qrt_drops[i]>0 ?
                                                [                                                
                                                    [...Array(data.call_scale_array.length).keys()].map(j => 
                                                        {
                                                            if(data.call_scale_array[j] <= data.qrt_drops[i]){
                                                                dropslength=j+1;
                                                            } 
                                                        }
                                                    ),

                                                    [...Array(data.call_scale_array.length).keys()].map(k => 
                                                        {
                                                            if(data.call_scale_array[k] <= data.qrt_calls[i]){
                                                                callslength=k+1;
                                                            } 
                                                        }
                                                    ),

                                                    data.qrt_calls[i] > data.qrt_drops[i]
                                                    ? 
                                                        count_handle > callslength ?
                                                            [
                                                            <TableCell style={{backgroundColor:'orange'}} colSpan={dropslength}></TableCell>,
                                                            <TableCell style={{backgroundColor:'green'}} colSpan={callslength-dropslength}></TableCell>,
                                                            <TableCell key={i} colSpan={count_handle - callslength}></TableCell>
                                                            ]
                                                            :
                                                            [
                                                                <TableCell style={{backgroundColor:'orange'}} colSpan={dropslength}></TableCell>,
                                                                <TableCell style={{backgroundColor:'green'}} colSpan={callslength-dropslength}></TableCell>
                                                            ]  
                                                    :
                                                    
                                                        count_handle > dropslength ?
                                                        [
                                                            <TableCell style={{backgroundColor:'orange'}} colSpan={dropslength-1}></TableCell>,
                                                            <TableCell style={{backgroundColor:'green'}} colSpan={1}></TableCell>,
                                                            <TableCell colSpan={count_handle-dropslength}></TableCell>
                                                        ]
                                                        :
                                                        [
                                                            <TableCell style={{backgroundColor:'orange'}} colSpan={dropslength-1}></TableCell>,
                                                            <TableCell style={{backgroundColor:'green'}} colSpan={count_handle-dropslength}></TableCell>
                                                        ]  

                                                ]

                                                : //else
                                                
                                                    data.qrt_drops[i]==0 ? 
                                                    [
                                                        [...Array(data.call_scale_array.length).keys()].map(k => 
                                                            {
                                                                if(data.call_scale_array[k] <= data.qrt_calls[i]){
                                                                    callslength=k+1;
                                                                } 
                                                            }
                                                        ),

                                                        data.qrt_calls[i]>0 && count_handle>callslength ?
                                                        [
                                                            <TableCell style={{backgroundColor:'green'}} colSpan={callslength}></TableCell>,
                                                            <TableCell colSpan={count_handle - callslength}></TableCell>,
                                                        ]
                                                        :
                                                        [
                                                            count_handle == callslength ? 
                                                            <TableCell style={{backgroundColor:'green'}} colSpan={callslength}></TableCell>
                                                            :
                                                            <TableCell colSpan={count_handle}></TableCell>
                                                        ]

                                                    ]
                                                    :
                                                    [
                                                        <TableCell colSpan={count_handle}></TableCell>,
                                                    ]
                                            }

                
                                            <TableCell>{data.qrt_drops[i]}</TableCell>
                                            <TableCell>{data.qrt_calls[i]}</TableCell>

                                        </TableRow>
                                        )}

                                        <TableRow>
                                            <TableCell colSpan={count_handle+1}>Total </TableCell>
                                            <TableCell>{data.tot_drops}</TableCell>
                                            <TableCell>{data.tot_calls}</TableCell>
                                        </TableRow>

                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                        </div>
                    </Paper>
                    <br/>
                    <br/>

                    <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12">
                            <label style={{fontSize:20}}>CALL HOLD TIME BREAKDOWN IN SECONDS</label>
                        </div>
                    </div> 
                    <Paper>
                        <div className="row">
                        <div className="col-lg-6 col-sm-6 col-6">
                            <div className="table-responsive-material">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>TIME 15 MIN INT</TableCell>
                                            <TableCell>CALLS    </TableCell>
                                            <TableCell colSpan={8}>% OF CALLS GROUPED BY HOLD TIME (SEC)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell></TableCell>
                                            <TableCell></TableCell>
                                            <TableCell>0</TableCell>
                                            <TableCell>20 </TableCell>
                                            <TableCell>40</TableCell>
                                            <TableCell>60</TableCell>
                                            <TableCell>80</TableCell>
                                            <TableCell>100</TableCell>
                                            <TableCell>120</TableCell>
                                            <TableCell>120+</TableCell>
                                        </TableRow>
                                        
                                        {[...Array(data.time_array['hm_display'].length).keys()].map(i => 
                                            <TableRow key={i}>
                                                <TableCell>{data.time_array['hm_display'][i]}</TableCell>
                                                <TableCell>{data.qrt_calls[i]}</TableCell>
                                                <TableCell>{data.hold_percentage['phd__0'][i]}</TableCell>
                                                <TableCell>{data.hold_percentage['phd_20'][i]}</TableCell>
                                                <TableCell>{data.hold_percentage['phd_40'][i]}</TableCell>
                                                <TableCell>{data.hold_percentage['phd_60'][i]}</TableCell>
                                                <TableCell>{data.hold_percentage['phd_80'][i]}</TableCell>
                                                <TableCell>{data.hold_percentage['phd100'][i]}</TableCell>
                                                <TableCell>{data.hold_percentage['phd120'][i]}</TableCell>
                                                <TableCell>{data.hold_percentage['phd121'][i]}</TableCell>
                                            </TableRow>
                                            
                                        )}
                                        <TableRow>
                                            <TableCell>TOTAL</TableCell>
                                            <TableCell>{data.ftot_calls}</TableCell>
                                            <TableCell>{data.holdtotal_percentage['a_phd__0']}</TableCell>
                                            <TableCell>{data.holdtotal_percentage['a_phd_20']}</TableCell>
                                            <TableCell>{data.holdtotal_percentage['a_phd_40']}</TableCell>
                                            <TableCell>{data.holdtotal_percentage['a_phd_60']}</TableCell>
                                            <TableCell>{data.holdtotal_percentage['a_phd_80']}</TableCell>
                                            <TableCell>{data.holdtotal_percentage['a_phd100']}</TableCell>
                                            <TableCell>{data.holdtotal_percentage['a_phd120']}</TableCell>
                                            <TableCell>{data.holdtotal_percentage['a_phd121']}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                        <div className="col-lg-6 col-sm-6 col-6">
                            <div className="table-responsive-material">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>AVG</TableCell>
                                            <TableCell colSpan={7}>% AVERAGE TIME BEFORE ANSWER (SEC)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell></TableCell>
                                            <TableCell>0</TableCell>
                                            <TableCell>20 </TableCell>
                                            <TableCell>40</TableCell>
                                            <TableCell>60</TableCell>
                                            <TableCell>80</TableCell>
                                            <TableCell>100</TableCell>
                                            <TableCell>120</TableCell>
                                        </TableRow>
                                        
                                        {[...Array(data.time_array['hm_display'].length).keys()].map(i =>

                                        <TableRow key={i}>
                                            <TableCell>{data.qrt_queue_avg[i]}</TableCell>
                                            {(()=> {     
                                                if(data.qrt_queue_avg[i]==0){
                                                    return(<TableCell colSpan={7}></TableCell>);}
                                                if(data.qrt_queue_avg[i]<=20 && data.qrt_queue_avg[i]>0){
                                                    return ([<TableCell style={{backgroundColor:'orange'}} colSpan={1}><span style={{float:'right',color:'black'}}>{data.qrt_queue_avg[i]}</span></TableCell>,
                                                        <TableCell colSpan={6}></TableCell> ]);
                                                }             
                                                if(data.qrt_queue_avg[i]<=40 && data.qrt_queue_avg[i] > 20){
                                                    return([<TableCell style={{backgroundColor:'orange'}} colSpan={2}><span style={{float:'right',color:'black'}}>{data.qrt_queue_avg[i]}</span></TableCell>,
                                                    <TableCell colSpan={5}></TableCell>]);}             
                                                if(data.qrt_queue_avg[i]<=60 && data.qrt_queue_avg[i] > 40){
                                                    return([<TableCell style={{backgroundColor:'orange'}} colSpan={3}><span style={{float:'right',color:'black'}}>{data.qrt_queue_avg[i]}</span></TableCell>,
                                                    <TableCell colSpan={4}></TableCell>]);}             
                                                if(data.qrt_queue_avg[i]<=80 && data.qrt_queue_avg[i] > 60){
                                                    return([<TableCell style={{backgroundColor:'orange'}} colSpan={4}><span style={{float:'right',color:'black'}}>{data.qrt_queue_avg[i]}</span></TableCell>,
                                                    <TableCell colSpan={3}></TableCell>]);}   
                                                if(data.qrt_queue_avg[i]<=100 && data.qrt_queue_avg[i] > 80){
                                                    return([<TableCell style={{backgroundColor:'orange'}} colSpan={6}><span style={{float:'right',color:'black'}}>{data.qrt_queue_avg[i]}</span></TableCell>,
                                                    <TableCell colSpan={1}></TableCell>]);}              
                                                if(data.qrt_queue_avg[i]>100){
                                                    return([<TableCell style={{backgroundColor:'orange'}} colSpan={7}><span style={{float:'right',color:'black'}}>{data.qrt_queue_avg[i]}</span></TableCell>]);}                       
                                                })()}
                                        </TableRow>
                                        )}
                            
                                        <TableRow>
                                            <TableCell>{data.ftot_queue_avg}</TableCell>
                                            <TableCell colSpan={7}></TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                        </div>
                    </Paper>
                    </div>
                    </div>}
                    <br/>
                    <br/>
                </CardBody>
            </Card>

        </div>
    );
}
}


export default ServiceLevel;