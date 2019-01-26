import { React,Table,TableBody,TableCell,TableHead,TableRow,InfoCard,ContainerHeader,CardBox,Paper,Input,InputLabel,MenuItem,FormControl,FormHelperText,Select,Card,CardBody,CardSubtitle,CardText,cloneElement,Component,Button,moment} from './plugins';

import {DateTimePicker} from 'material-ui-pickers';
import LinearProgress from '@material-ui/core/LinearProgress';
import MultipeDropdown from '../../../common/MultipeDropdown';
import Dropdown from '../../../common/Dropdown';
//import {DATA} from './data';

import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
import CampaignMultidropdownList from '../common/CampaignMultidropdownList';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

import { dateValidation } from '../../../common/DateDiff';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import "react-sweet-progress/lib/style.css";
import CircularProgress from '@material-ui/core/CircularProgress';

import Helmet from "react-helmet";


const SHIFT = ['ALL','AM','PM'];
const DISPLAYAS = ['TEXT','HTML'];
const BREAKDOWN_COL = 6;

const myClass={
    width:'5px',
    height:'15px',
}
class OutboundIvr extends React.Component {
    constructor(props) {
        super(props);
        var ts = new Date();
        this.state = {
            campaigns: [],
            isLoading : false,
            selected_campaign:[],
            displayAs:'TEXT',
            shift:'ALL',
            from: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            to: moment(new Date).format('YYYY-MM-DD HH:mm:ss'),
            activeCol:0,
            colName:'IVR CALLS',
            data : [],//DATA,
            header :[],//DATA.callscale.split(""),
            date : moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            DateError : '',
            isShow : false,
        };
    }


    handleChange = (name,value) =>{
        this.setState({[name]:value,}) 
        if(name=='displayAs'){
            this.setState({
                activeCol:0,
            })
        }

        if(value == 'HTML'){
            this.setState({
                activeCol:1,
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

    handleSubmit = () => {

        const {header,data,from,to,selected_campaign,displayAs,date,isShow,isLoading,DateError,shift} = this.state;
    
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

            axios.post('api/inbound_ivr_report/',
            {
                outbound:'Y',
                startdate:from,
                enddate:to,
                shift:shift,
                selectedgroups : selected_campaign

            },requestOptions).then(response=>{  
                this.setState({
                    data : response.data,
                    header : response.data.callscale.split(""),
                    isShow : true,
                    isLoading:false,
                })
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

    }


    render() {
        const {header,data,from,to,activeCol,displayAs,colName,shift,DateError,campaigns,selected_campaign,isShow,isLoading} = this.state;
        var j=0;var check=0;var count=0;var last_key=0; var counts1=[];var counts2=[]; var valu='';var last_val='';

        if(isShow){
            for(j=0; j<data.callscale.length;j++)
            {
                if((((data.callscale[j]).trim())!=''))
                {
                    valu=((data.callscale[j]).trim());
                    
                    if(check==1)
                    {
                        last_val=parseInt(last_val+''+valu);
                        counts1.pop();
                    }
                    else
                    last_val=parseInt(valu);
                    check=1;
                    
                    counts1.push({value:count,key:last_val});
                }
                else
                {
                    last_val='';    
                    check=0;
                }
                count++;
            }
            (counts1).slice(0).sort(function(a, b){return a-b});
            
            var my_data = [];
            var i=check=last_key=0;
            while(i<data.timestat.length){
                if((data.timestat[i][1]>0)||(check==1)){
                    var j=0;
                    var k=0;
                    var l=0;
                    var m=0;
                    var timelength=0;
                    var callslength=0;
                    var key_co=0;
                    var key_diff=0;
                    var val_diff=0;
                    var k=0;
                    if(data.timestat[i][1]>0){
                        for(j=0; j<counts1.length;j++)
                        {
                            if(((counts1[j].key)==(data.timestat[i][1]).trim()))
                            {
                                last_key=counts1[j].value;
                                key_co=(data.timestat[i][1]).trim();        
                            }
                            else if(((counts1[j].key)<(data.timestat[i][1]).trim()))
                            {
                                last_key=(counts1[j].value);
                                if(j!=(counts1.length-1))
                                {
                                key_co=counts1[j].key;
                                k=(j+1);
                                key_diff=Math.round(((counts1[j].key)+(counts1[k].key))/2);
                                }
                                else
                                key_co=(data.timestat[i][1]).trim();
                            }    
                        }
                        if(key_co!=(data.timestat[i][1]).trim())
                        {
                            
                            if(((data.timestat[i][1]).trim())>key_diff)
                            {
                            last_key=last_key+2;
                                                    }
                            else
                            {
                            last_key=last_key+1;
                            
                            }
                        }
                        var count=data.callscale.length;
                        if(last_key==0)
                        var remain1=count-(last_key+1);
                        else
                        var remain1=count-(last_key);
                        if((data.timestat[i][1]))
                        {
                            my_data.push({first:data.timestat[i][0],data:data.timestat[i][1],last_key:last_key,remain1:remain1,count:count});
                        }
                        else
                        {
                            if(count==last_key)
                            {
                                my_data.push({first:data.timestat[i][0],data:data.timestat[i][1],last_key:last_key,remain1:remain1,count:count});
                            }
                            else{
                                my_data.push({first:data.timestat[i][0],data:data.timestat[i][1],last_key:last_key,remain1:remain1,count:count});
                            }
                        }
                    }
                    else{
                        var count=data.callscale.length;
                        my_data.push({first:data.timestat[i][0],data:data.timestat[i][1],last_key:last_key,remain1:remain1,count:count});
                    }
                    check=1;
                }
                i++;
            }
        }
    return (
        <div>
            <Helmet>
                <title>OutboundIVRReportExport | Ytel</title>
            </Helmet>

            <ContainerHeader match={this.props.match} title='Outbound IVR Report'/>

            <div className="row">
                <CardBox styleName="col-lg-12" heading="Outbound IVR Report">
                    <form className="row" autoComplete="off">
                        <div className="col-lg-6 col-sm-6 col-12">

                            <FormControl className="w-100 mb-2">
                                <p>Dates</p>
                                <DateTimePicker
                                    fullWidth
                                    format='YYYY-MM-DD HH:mm:ss'
                                    value={from}
                                    showTabs={false}
                                    onChange={this.handleFromDateChange}
                                    leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                                    rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                                />
                                {/* <FormHelperText>The date range for this report is limited to 60 days from today.</FormHelperText> */}
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
                                {DateError?
                                    <FormHelperText style={{"color":"red","fontSize":"14px"}}>The date range for this report is limited to 60 days from today.</FormHelperText>:''}
                            </FormControl>

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
                            />

                            <Dropdown 
                                label={"Display As"} 
                                onChange={this.handleChange}
                                name={'displayAs'}
                                selectedValue={displayAs}
                                data={DISPLAYAS}
                            />
                            
                            <Button color="primary" className="jr-btn bg-success text-white" onClick={this.handleSubmit}>
                                Download CSV
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
            {isShow ? 
            <Card className="shadow border-0 bg-default text-black">
                <CardBody>
                    
                    <span><label className="card-title">IVR Stats Repor:</label>&nbsp;&nbsp;{selected_campaign.join(' | ')} &nbsp;&nbsp;|&nbsp;&nbsp;  {moment(new Date()).format('YYYY-MM-DD HH:MM:SS')}</span>
                    <h3 className="card-title">Time range: {from} To {to}</h3>



                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell colSpan={6}>Calls taken into this IVR: </TableCell>
                                        <TableCell>{data.total_calls}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={6}>Calls with no CallerID: </TableCell>
                                        <TableCell>{data.no_caller_id_calls}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={6}>Unique Callers: </TableCell>
                                        <TableCell>{data.unique_callers}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell onClick={()=>this.clickCol(1,'IVR CALLS')}>
                                             {displayAs=='HTML'?<button className="bg-success text-white">IVR CALLS</button>:'IVR CALLS'} 
                                        </TableCell>
                                        <TableCell onClick={()=>this.clickCol(2,'QUEUE CALLS')}>
                                            {displayAs=='HTML'?<button className="bg-success text-white">IVR CALLS</button>:'QUEUE CALLS'}  
                                        </TableCell>
                                        <TableCell onClick={()=>this.clickCol(3,'QUEUE DROP CALLS')}>
                                            {displayAs=='HTML'?<button className="bg-success text-white">IVR CALLS</button>:'QUEUE DROP CALLS'} 
                                        </TableCell>
                                        <TableCell onClick={()=>this.clickCol(4,'QUEUE DROP PERCENTAGE')}>
                                            {displayAs=='HTML'?<button className="bg-success text-white">IVR CALLS</button>:'QUEUE DROP PERCENTAGE'} 
                                        </TableCell>
                                        <TableCell onClick={()=>this.clickCol(5,'IVR AVG TIME')}>
                                            {displayAs=='HTML'?<button className="bg-success text-white">IVR CALLS</button>:'IVR AVG TIME'} 
                                        </TableCell>
                                        <TableCell onClick={()=>this.clickCol(6,'TOTAL AVG TIME')}>
                                            {displayAs=='HTML'?<button className="bg-success text-white">IVR CALLS</button>:'TOTAL AVG TIME'}
                                        </TableCell>
                                        <TableCell>CALL PATH</TableCell>
                                    </TableRow>

                                    {displayAs=='HTML'?
                                        <TableRow>
                                            <TableCell colSpan={6}>{colName}</TableCell>
                                            <TableCell>CALL PATH</TableCell>
                                        </TableRow>
                                        :null}

                                </TableHead>
                                <TableBody>
                                    {data.total_ivr.map((val,key)=>
                                    <TableRow key={key}>
                                        <TableCell className={activeCol!=0 && activeCol!=1?'hide-td':''} colSpan={activeCol==1?BREAKDOWN_COL:1}>
                                            {activeCol == 1 ? <Progress strokeWidth={30} percent={parseInt(data.total_ivr[key].ivrcalls)} /> :data.total_ivr[key].ivrcalls}
                                        </TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=2?'hide-td':''} colSpan={activeCol==2?BREAKDOWN_COL:1}>
                                            {activeCol == 2 ? <Progress strokeWidth={30} percent={parseInt(data.total_ivr[key].queuecalls)} /> :data.total_ivr[key].queuecalls}
                                        </TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=3?'hide-td':''} colSpan={activeCol==3?BREAKDOWN_COL:1}>
                                            {activeCol == 3 ? <Progress strokeWidth={30} percent={parseInt(data.total_ivr[key].queuedrop)} /> :data.total_ivr[key].queuedrop}
                                        </TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=4?'hide-td':''} colSpan={activeCol==4?BREAKDOWN_COL:1}>
                                        {activeCol == 4 ? <Progress strokeWidth={30} percent={parseInt(data.total_ivr[key].queuedrop)} /> :data.total_ivr[key].dropcallpercent}%
                                        </TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=5?'hide-td':''} colSpan={activeCol==5?BREAKDOWN_COL:1}>
                                            {activeCol == 5 ? <Progress strokeWidth={30} percent={parseInt(data.total_ivr[key].ivravgtime)} /> :data.total_ivr[key].ivravgtime}
                                        </TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=6?'hide-td':''} colSpan={activeCol==6?BREAKDOWN_COL:1}>
                                            {activeCol == 6 ? <Progress strokeWidth={30} percent={parseInt(data.total_ivr[key].totalavgtime)} /> :data.total_ivr[key].totalavgtime}
                                        </TableCell>
                                        <TableCell>{data.total_ivr[key].callstat ? data.total_ivr[key].callstat : 0}</TableCell>
                                    </TableRow>
                                    )}
                                    <TableRow>
                                        <TableCell className={activeCol!=0 && activeCol!=1?'hide-td':''} colSpan={activeCol==1?BREAKDOWN_COL:1}>{data.total_calls}</TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=2?'hide-td':''} colSpan={activeCol==2?BREAKDOWN_COL:1}>{data.totalqueuecalls}</TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=3?'hide-td':''} colSpan={activeCol==3?BREAKDOWN_COL:1}>{data.totaldropcalls}</TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=4?'hide-td':''} colSpan={activeCol==4?BREAKDOWN_COL:1}>{data.totdroppercen}%</TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=5?'hide-td':''} colSpan={activeCol==5?BREAKDOWN_COL:1}>{Math.round(data.totivravgtime)}</TableCell>
                                        <TableCell className={activeCol!=0 && activeCol!=6?'hide-td':''} colSpan={activeCol==6?BREAKDOWN_COL:1}>{Math.round(data.totalavgeragetime)}</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                    <br/>
                    <br/>   

                    <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12">
                            <label>TIME STATS</label><br/>
                            <label>GRAPH IN 15 MINUTE INCREMENTS OF TOTAL CALLS TAKEN INTO THIS IVR</label>
                        </div>
                    </div> 
                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow style={{border : '1px'}}>
                                        <TableCell>HOUR</TableCell>
                                        {
                                            header.map((v,k)=>
                                                <TableCell key={k}>{header[k]}</TableCell>        
                                            )
                                        }
                                        <TableCell>TOTAL</TableCell>
                                    </TableRow>
                                </TableHead>
                                
                                <TableBody>
                                    {my_data.map((val,key)=>
                                        <TableRow key={key}>  
                                            <TableCell>{my_data[key].first}</TableCell>
                                            { my_data[key].data > 0 ?

                                                my_data[key].data ? 
                                                [
                                                    <TableCell style={{backgroundColor : 'green'}} colSpan={my_data[key].last_key}></TableCell>,
                                                    <TableCell colSpan={my_data[key].remain1}></TableCell> 
                                                ]
                                                :
                                                [
                                                    my_data[key].count = my_data[key].last_key ? 
                                                    [   
                                                        <TableCell style={{backgroundColor : 'green'}} colSpan={my_data[key].last_key}></TableCell>,
                                                        <TableCell colSpan={my_data[key].remain1}></TableCell>  
                                                    ]
                                                    :
                                                    <TableCell colSpan={my_data[key].count}></TableCell> 
                                                ]
                                                :
                                                <TableCell colSpan={data.callscale.length}></TableCell> 
                                            }
                                            <TableCell>{my_data[key].data}</TableCell>
                                        </TableRow>
                                    )}
                                    <TableRow>
                                        <TableCell colSpan={data.callscale.length+1}></TableCell>
                                        <TableCell>{data.total_calls}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                    <br/>
                    <br/>   
                </CardBody>
            </Card>
            :""}
        </div>
    );
}
}


export default OutboundIvr;