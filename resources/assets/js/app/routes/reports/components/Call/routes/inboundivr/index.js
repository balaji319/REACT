import { React,Table,TableBody,TableCell,TableHead,TableRow,InfoCard,ContainerHeader,CardBox,Paper,Input,InputLabel,MenuItem,FormControl,FormHelperText,Select,Card,CardBody,CardSubtitle,CardText,cloneElement,Component,Button,moment} from './plugins';

import {DateTimePicker} from 'material-ui-pickers';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
import {dateValidation} from '../../../common/DateDiff';
import momentTimezone from 'moment-timezone';
import MultipeDropdown from '../../../common/MultipeDropdown';
import Dropdown from '../../../common/Dropdown';
import InboundGroupMultidropDown from '../common/InboundGroupMultidropDown';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import Helmet from "react-helmet";

import {CSVLink} from 'react-csv';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const DISPLAYAS = ['TEXT','HTML'];
const SHIFT = ['ALL','AM','PM'];
const BREAKDOWN_COL = 6;

const myClass={
    width:'5px',
    height:'15px',
}
class InboundIvr extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            from: moment(new Date()).format('MM/DD/YYYY HH:mm:ss'),
            to: moment(new Date).format('MM/DD/YYYY HH:mm:ss'),
            inboundGroups : [],
            inound_group_list: [],
            displayAs:'TEXT',
            shift:'ALL',            
            activeCol:1,
            colName:'IVR CALLS',
            timeval: false,
            mydata : [],
            flag : false,
            header :[],
            isLoading: false,
            csvData : [],
        };
    }

    handleChange = (name,value) =>{
        this.setState({
            [name]:value,
        }) 
        if(name=='displayAs'){
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
    
     handleFromDateChange = (date) => {
        this.setState({from: moment(date).format('MM/DD/YYYY HH:mm:ss')});
    };

    handleToDateChange = (date) => {
        this.setState({to: moment(date).format('MM/DD/YYYY HH:mm:ss')});
    };

    
    componentDidMount() 
    {      
        this.setState({isLoading:true});
        const {data,inound_group_list,displayAs} = this.state;
        var token = localStorage.getItem("access_token");
        const requestOptions = {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer '+token ,
            }
        };
         axios.get('api/inbound_calls_report_groups_list/',requestOptions).then(response=>{  
             this.setState({
                 inound_group_list: response.data.list,
                 isLoading :false,
             })
             this.handleCsv([]);
         }).catch(error =>{
             console.log(error);
         })

         
    }
    

    handleSubmit=()=>{
        let date = moment(this.state.from).format('MM/DD/YYYY HH:mm:ss');
        const {from, to, inboundGroups, shift} = this.state; 
        var auth_token = localStorage.getItem("access_token");
        
        this.setState({isLoading :true})
        
         if(dateValidation(from,to,date,2)==false){
            this.setState({                   
                isLoading:false,
                timeval: true,
                tableshow: false,
            }) 
        }else{
            axios.post('api/inbound_ivr_report/', {
                startdate: from,
                enddate: to,
                shift: shift,
                selectedgroups: inboundGroups,
                outbound: ""
                // ,file_download : '1'
            }, {headers: { 
                    'Content-Type': 'application/json' ,
                    'Authorization' : 'Bearer '+auth_token,
            }}).then(response => {
                this.setState({
                    mydata : response.data,
                    isLoading:false,
                    flag: true,
                    timeval: false,
                    header : response.data.callscale.split("")
                });
                // console.log(response);
                this.handleCsv(response.data.top_tab_header);          
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


    handleCsv=(resData)=>{

        if( resData.length == 0 ) {
             this.setState({csvData : [],});
        } else{
             this.setState({csvData : resData,});
        }
        // console.log(resData.length);
        // this.setState({csvData : [],});



        // const csvData = [
        //                     ['firstname', 'lastname', 'email'] ,
        //                     ['Ahmed', 'Tomi' , 'ah@smthing.co.com'] ,
        //                     ['Raed', 'Labes' , 'rl@smthing.co.com'] ,
        //                     ['Yezzi','Min l3b', 'ymin@cocococo.com']
        //                 ];
    
        // let date = moment(this.state.from).format('MM/DD/YYYY HH:mm:ss');
        // const {from, to, inboundGroups, shift} = this.state; 
        // var auth_token = localStorage.getItem("access_token");
        
        // // this.setState({isLoading :true})
        
        
        //  if(dateValidation(from,to,date,2)==false){
        //     this.setState({                   
        //         isLoading:false,
        //         timeval: true,
        //         tableshow: false,
        //     }) 
        // }else{
        //     axios.post('api/inbound_ivr_report/', {
        //         startdate: from,
        //         enddate: to,
        //         shift: shift,
        //         selectedgroups: inboundGroups,
        //         outbound: "",
        //         file_download: '1',
        //     }, {headers: { 
        //             'Content-Type': 'application/json' ,
        //             'Authorization' : 'Bearer '+auth_token,
        //     }}).then(response => {
        //         console.log(response);
                // console.log(csvData);

                // this.setState({isLoading :false });
                // this.setState({csvData : resData,});

                // this.setState({
                //         isLoading :false,      
                //         csvData : csvData,
                //     })
                // this.setState({
                //     mydata : response.data,
                //     isLoading:false,
                //     flag: true,
                //     timeval: false,
                //     header : response.data.callscale.split("")
                // })            
        //     }).catch(error => {
        //         console.log(error);
        //         this.setState({                   
        //             isLoading:false,
        //             open: false
        //         })
        //     }) 
        // }
        
        // console.log(this.state);

    }




    render() {

        const {isLoading, header, mydata, flag, inound_group_list, inboundGroups, timeval, from, to, activeCol,displayAs,colName,name,shift} = this.state;
        
         var j=0;var check=0;var count=0;var last_key=0; var counts1=[];var counts2=[]; var valu='';var last_val='';

        if(flag){
            for(j=0; j<mydata.callscale.length;j++)
            {
                if((((mydata.callscale[j]).trim())!=''))
                {
                    valu=((mydata.callscale[j]).trim());
                    
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
            while(i<mydata.timestat.length){
                if((mydata.timestat[i][1]>0)||(check==1)){
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
                    if(mydata.timestat[i][1]>0){
                        for(j=0; j<counts1.length;j++)
                        {
                            if(((counts1[j].key)==(mydata.timestat[i][1]).trim()))
                            {
                                last_key=counts1[j].value;
                                key_co=(mydata.timestat[i][1]).trim();        
                            }
                            else if(((counts1[j].key)<(mydata.timestat[i][1]).trim()))
                            {
                                last_key=(counts1[j].value);
                                if(j!=(counts1.length-1))
                                {
                                key_co=counts1[j].key;
                                k=(j+1);
                                key_diff=Math.round(((counts1[j].key)+(counts1[k].key))/2);
                                }
                                else
                                key_co=(mydata.timestat[i][1]).trim();
                            }    
                        }
                        if(key_co!=(mydata.timestat[i][1]).trim())
                        {
                            
                            if(((mydata.timestat[i][1]).trim())>key_diff)
                            {
                            last_key=last_key+2;
                                                    }
                            else
                            {
                            last_key=last_key+1;
                            
                            }
                        }
                        var count=mydata.callscale.length;
                        if(last_key==0)
                        var remain1=count-(last_key+1);
                        else
                        var remain1=count-(last_key);
                        if((mydata.timestat[i][1]))
                        {
                            my_data.push({first:mydata.timestat[i][0],data:mydata.timestat[i][1],last_key:last_key,remain1:remain1,count:count});
                        }
                        else
                        {
                            if(count==last_key)
                            {
                                my_data.push({first:mydata.timestat[i][0],data:mydata.timestat[i][1],last_key:last_key,remain1:remain1,count:count});
                            }
                            else{
                                my_data.push({first:mydata.timestat[i][0],data:mydata.timestat[i][1],last_key:last_key,remain1:remain1,count:count});
                            }
                        }
                    }
                    else{
                        var count=mydata.callscale.length;
                        my_data.push({first:mydata.timestat[i][0],data:mydata.timestat[i][1],last_key:last_key,remain1:remain1,count:count});
                    }
                    check=1;
                }
                i++;
            }
        }
        
    return (
        <div>
            <Helmet>
                <title>InboundIvr | Ytel</title>
            </Helmet>
            <ContainerHeader match={this.props.match} title='Inbound IVR Report'/>

            <div className="row">
                <CardBox styleName="col-lg-12" heading="Inbound IVR Report">
                    <form className="row" autoComplete="off">
                        <div className="col-lg-6 col-sm-6 col-12">

                            <FormControl className="w-100 mb-2">
                                <p>Dates</p>
                                <DateTimePicker
                                    fullWidth
                                    format='MM/DD/YYYY HH:mm:ss'
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
                                    format='MM/DD/YYYY HH:mm:ss'
                                    value={to}
                                    showTabs={false}
                                    onChange={this.handleToDateChange}
                                    leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                                    rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
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
                            <InboundGroupMultidropDown 
                                label={"Inbound Groups"} 
                                options={inound_group_list} 
                                onChange={this.handleChange}
                                name={'inboundGroups'}
                                selectedValue={inboundGroups}
                            />

                            <Dropdown 
                                label={"Display As"} 
                                onChange={this.handleChange}
                                name={'displayAs'}
                                selectedValue={displayAs}
                                data={DISPLAYAS}
                            />
                            
                            <CSVLink color="primary" className="jr-btn bg-success text-white" data={this.state.inound_group_list}>
                                Download CSV
                            </CSVLink>

                            <a color="primary" className="jr-btn bg-success text-white" onClick={this.handleCsv}>Load</a>

                            {/*<a color="primary" className="jr-btn bg-success text-white" onClick={this.handleCsv}>CSV Download</a>

                            <Button color="primary" className="jr-btn bg-success text-white" onClick={this.handleSubmit}>
                                Download CSV
                            </Button>*/}

                        </div>
                    </form>
                </CardBox>
            </div>

            <Card className="shadow border-0 bg-default text-black">
                <CardBody>
                    <h4>IVR Stats Report {from+'  To  '+to}   Date:  {momentTimezone.tz(moment(new Date()), "America/Los_Angeles").format('YYYY-MM-DD HH:MM:SS')}</h4>
                    <h4>Selected Groups:  {inboundGroups.join(' | ')}</h4> 
                    <br/><br/>
                    {flag == false ?
                    <div>   
                        <Paper>
                            <div className="table-responsive-material">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell colSpan={6}>Calls taken into this IVR: </TableCell>
                                            <TableCell >0</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={6}>Calls with no CallerID: </TableCell>
                                            <TableCell >0</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={6}>Unique Callers: </TableCell>
                                            <TableCell >0</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </Paper>
                        <br/><br/>
                        <h4>IVR STATS</h4>
                        <Paper>
                            <div className="table-responsive-material">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>IVR CALLS</TableCell>
                                            <TableCell>CALL PATH</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    
                                    <TableBody>
                                        <TableRow>                                            
                                            <TableCell >0</TableCell>
                                            <TableCell >TOTAL</TableCell>
                                        </TableRow>                                      
                                    </TableBody>
                                </Table>
                            </div>
                        </Paper>
                        
                        <br/><br/>
                        <h4>TIME STATS</h4>
                        <h4>GRAPH IN 15 MINUTE INCREMENTS OF TOTAL CALLS TAKEN INTO THIS IVR</h4>
                        <Paper>
                            <div className="table-responsive-material">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>HOUR</TableCell>
                                            <TableCell>0</TableCell>
                                            <TableCell>100</TableCell>
                                            <TableCell>100</TableCell>
                                            <TableCell>100</TableCell>
                                            <TableCell>100</TableCell>
                                            <TableCell>100</TableCell>
                                            <TableCell>100</TableCell>
                                            <TableCell>100</TableCell>
                                            <TableCell>100</TableCell>
                                            <TableCell>100</TableCell>
                                            <TableCell>100</TableCell>
                                            <TableCell>100</TableCell>
                                            <TableCell>100</TableCell>
                                            <TableCell>100</TableCell>
                                            <TableCell>TOTAL</TableCell>
                                        </TableRow>
                                    </TableHead>
                                </Table>
                            </div>
                        </Paper>
                    </div>
                    : 
                    <div>    
                        <Paper>
                            <div className="table-responsive-material">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell colSpan={6}>Calls taken into this IVR: </TableCell>
                                            <TableCell >{mydata.total_calls}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={6}>Calls with no CallerID: </TableCell>
                                            <TableCell >{mydata.no_caller_id_calls}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={6}>Unique Callers: </TableCell>
                                            <TableCell >{mydata.unique_callers}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </Paper>
                        <br/><br/>
                        <h4>IVR STATS</h4>
                        <Paper>
                            {displayAs == "TEXT" ?
                                <div className="table-responsive-material">
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>IVR CALLS</TableCell>
                                                <TableCell>QUEUE CALLS</TableCell>
                                                <TableCell>QUEUE DROP CALLS</TableCell>
                                                <TableCell>QUEUE DROP PERCENTAGE</TableCell>
                                                <TableCell>IVR AVG TIME</TableCell>
                                                <TableCell>TOTAL AVG TIME</TableCell>
                                                <TableCell>CALL PATH</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                        {Object.keys(mydata.total_ivr).map((key, val) =>
                                            <TableRow key={val}>                                            
                                                <TableCell >{mydata.total_ivr[key].ivrcalls}</TableCell>
                                                <TableCell >{mydata.total_ivr[key].queuecalls}</TableCell>
                                                <TableCell >{mydata.total_ivr[key].queuedrop}</TableCell>
                                                <TableCell >{mydata.total_ivr[key].dropcallpercent}%</TableCell>
                                                <TableCell >{mydata.total_ivr[key].ivravgtime}</TableCell>
                                                <TableCell >{mydata.total_ivr[key].totalavgtime}</TableCell>
                                                <TableCell >{mydata.total_ivr[key].callstat}</TableCell>
                                            </TableRow>
                                        )}
                                        <TableRow>
                                            <TableCell>{mydata.total_calls}</TableCell>
                                            <TableCell>{mydata.totalqueuecalls}</TableCell>
                                            <TableCell>{mydata.totaldropcalls}</TableCell>
                                            <TableCell>{mydata.totdroppercen}%</TableCell>
                                            <TableCell>{mydata.totivravgtime}</TableCell>
                                            <TableCell>{mydata.totalavgeragetime}</TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                        </TableBody>
                                    </Table>
                                </div> 
                                : 
                                <div className="table-responsive-material">
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell onClick={()=>this.clickCol(1,'IVR CALLS')}><span className="ancr-style">IVR CALLS</span></TableCell>
                                                <TableCell onClick={()=>this.clickCol(2,'QUEUE CALLS')}><span className="ancr-style">QUEUE CALLS</span></TableCell>
                                                <TableCell onClick={()=>this.clickCol(3,'QUEUE DROP CALLS')}><span className="ancr-style">QUEUE DROP CALLS</span></TableCell>
                                                <TableCell onClick={()=>this.clickCol(4,'QUEUE DROP PERCENTAGE')}><span className="ancr-style">QUEUE DROP PERCENTAGE</span></TableCell>
                                                <TableCell onClick={()=>this.clickCol(5,'IVR AVERAGE TIME')}><span className="ancr-style">IVR AVERAGE TIME</span></TableCell>
                                                <TableCell onClick={()=>this.clickCol(6,'TOTAL AVERAGE TIME')}><span className="ancr-style">TOTAL AVERAGE TIME</span></TableCell>
                                            </TableRow>
                                            <TableRow>                                              
                                                <TableCell colSpan={3}>{colName}</TableCell>
                                                <TableCell>CALL PATH</TableCell>
                                           </TableRow>                                           
                                        </TableHead>
                                        <TableBody>
                                                {Object.keys(mydata.total_ivr).map((key, val) =>
                                                    <TableRow key={val}>                                                            
                                                            <TableCell className={activeCol!=0 && activeCol!=1?'hide-td':''} colSpan={activeCol==1?3:1} ><Progress percent={mydata.total_ivr[key].ivrcalls}/></TableCell>
                                                            <TableCell className={activeCol!=0 && activeCol!=2?'hide-td':''} colSpan={activeCol==2?3:1} ><Progress percent={mydata.total_ivr[key].queuecalls}/></TableCell>
                                                            <TableCell className={activeCol!=0 && activeCol!=3?'hide-td':''} colSpan={activeCol==3?3:1} ><Progress percent={mydata.total_ivr[key].queuedrop}/></TableCell>
                                                            <TableCell className={activeCol!=0 && activeCol!=4?'hide-td':''} colSpan={activeCol==4?3:1} ><Progress percent={mydata.total_ivr[key].dropcallpercent}/></TableCell>
                                                            <TableCell className={activeCol!=0 && activeCol!=5?'hide-td':''} colSpan={activeCol==5?3:1} ><Progress percent={mydata.total_ivr[key].ivravgtime}/></TableCell>
                                                            <TableCell className={activeCol!=0 && activeCol!=6?'hide-td':''} colSpan={activeCol==6?3:1} ><Progress percent={mydata.total_ivr[key].totalavgtime}/></TableCell>
                                                            <TableCell colSpan={3}>{mydata.total_ivr[key].callstat}</TableCell>
                                                    </TableRow> 
                                                )}
                                                <TableRow>
                                                    <TableCell className={activeCol!=0 && activeCol!=1?'hide-td':''} colSpan={activeCol==1?3:1} >{mydata.total_calls}</TableCell>
                                                        <TableCell className={activeCol!=0 && activeCol!=2?'hide-td':''} colSpan={activeCol==2?3:1} >{mydata.totalqueuecalls}</TableCell>
                                                        <TableCell className={activeCol!=0 && activeCol!=3?'hide-td':''} colSpan={activeCol==3?3:1} >{mydata.totaldropcalls}</TableCell>
                                                        <TableCell className={activeCol!=0 && activeCol!=4?'hide-td':''} colSpan={activeCol==4?3:1} >{mydata.totdroppercen}%</TableCell>
                                                        <TableCell className={activeCol!=0 && activeCol!=5?'hide-td':''} colSpan={activeCol==5?3:1} >{mydata.totivravgtime}</TableCell>
                                                        <TableCell className={activeCol!=0 && activeCol!=6?'hide-td':''} colSpan={activeCol==6?3:1} >{mydata.totalavgeragetime}</TableCell>
                                                    <TableCell colSpan={3}>TOTAL</TableCell>
                                                </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            }                            
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
                                                    <TableCell key={Math.random()} style={{backgroundColor : 'green'}} colSpan={my_data[key].last_key}></TableCell>,
                                                    <TableCell key={Math.random()} colSpan={my_data[key].remain1}></TableCell> 
                                                ]
                                                :
                                                [
                                                    my_data[key].count = my_data[key].last_key ? 
                                                    [   
                                                        <TableCell key={Math.random()} style={{backgroundColor : 'green'}} colSpan={my_data[key].last_key}></TableCell>,
                                                        <TableCell key={Math.random()} colSpan={my_data[key].remain1}></TableCell>  
                                                    ]
                                                    :
                                                    <TableCell colSpan={my_data[key].count}></TableCell> 
                                                ]
                                                :
                                                <TableCell colSpan={mydata.callscale.length}></TableCell> 
                                            }
                                            <TableCell>{my_data[key].data}</TableCell>
                                        </TableRow>
                                    )}
                                    <TableRow>
                                        <TableCell colSpan={mydata.callscale.length+1}></TableCell>
                                        <TableCell>{mydata.total_calls}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                    <br/>
                    <br/>  
                    </div>
                    }    
                </CardBody>
                { isLoading &&
                <Dialog open={this.state.isLoading} onClose={this.handleRequestClose}>
                    <DialogContent>
                        <div className="loader-view">
                            <CircularProgress/>
                        </div>
                    </DialogContent>
                </Dialog>   
            }
            </Card>

        </div>
    );
}
}


export default InboundIvr;