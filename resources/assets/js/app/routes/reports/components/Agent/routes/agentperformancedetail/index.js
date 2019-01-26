import React from 'react';
import {cloneElement, Component} from 'react';
import {connect} from 'react-redux';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import ContainerHeader from '../../../../../../../components/ContainerHeader/index';
import CardBox from '../../../../../../../components/CardBox/index';
import Paper from '@material-ui/core/Paper';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {Card, CardBody} from 'reactstrap';
import moment from 'moment';
import {DatePicker} from 'material-ui-pickers';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { formatDate, parseDate } from 'react-day-picker/moment';
import 'react-day-picker/lib/style.css';

import UserGroupMultipeDropdown from '../../../common/UserGroupMultipeDropdown';
import MultipeDropdownCampaigns from '../../../common/MultipeDropdownCampaigns';
import MultipeDropdownUsers from '../../../common/MultipeDropdownUsers';
import DateRange from '../../../common/DateRange';
import Dropdown from '../../../common/Dropdown';
import { dateValidation } from '../../../common/DateDiff';
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
import CircularProgress from '@material-ui/core/CircularProgress';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Helmet from "react-helmet";

const BREAKDOWN_COL1 = 14;

import {
    fetchAllUserGroup,
    fetchCampaignList, 
    fetchUsersList,
} from '../../../../actions/';

const SHIFT = ['ALL','AM','PM'];
const DISPLAYAS = ['TEXT', 'HTML'];
let kid = 0;
const BREAKDOWN_COL = 32;

class AgentPerformanceDetail extends React.Component {
  
    constructor(props) {
        super(props);
        this.state = {   
            flag : false,
            isLoading:false,
            from: moment(new Date()).format('YYYY-MM-DD'),
            to: moment(new Date()).format('YYYY-MM-DD'),
            tableshow: false,       
            activeCol:0,
            statusActiveCol:0,
            statusColName:'',
            colName :'CALLS',            
            PauseCodeActiveCol:0,
            PauseCodeColName:'',
            SubStatusActiveCol:0,
            SubStatusColName:'',
            userGroups:['-ALL-'],
            UserGroupList :[],
            campaignsGroups:['-ALL-'],
            campaignList: [],                       
            usersNames: ['-ALL-'],
            usersList: [],            
            shift:'ALL',
            displayAs:'TEXT',
            dateError : '',
            mydata:[],
            agsname :[],
            group_array:[],
            graph_stat_htmltotal:[],
            graph_stat_display:[],
            statuses_array:[],
            avg_display:[],
            graph_sub_stat_display:[],
            sub_statuses_array:[],
            totalsecarray:[],
            totall_array:[],
            tot_status:[],
            tot_calls:'',
            sub_totall_array:[],
            tot_sub_status:[],
            totalcount:0,
            graph_stat_html:[],
            AGENTSTATLENGTH:0,
            htmlFlag:false,
            DateError :'',
        };
      }   
    
    handleSubmit=()=>{  
    
        
       this.setState({
        flag:false,
       });

        const date = moment(new Date()).format('YYYY-MM-DD');
        const {userGroups,campaignsGroups,campaignList,usersList,UserGroupList,from,to,usersNames,displayAs,shift,DateError} = this.state;
        
        const UGL = UserGroupList.map((item,i)=>(item.user_group)).filter(Boolean);
        const UL = usersList.map((item,i)=>(item.user)).filter(Boolean);
        const CL = campaignList.map((item,i)=>(item.campaign_id)).filter(Boolean);
        
        let status = false;

        if(displayAs=='HTML'){
            this.setState({
                activeCol:14,
                statusActiveCol:1,
                PauseCodeActiveCol:1,
                SubStatusActiveCol:1,
                htmlFlag:true,
            })
        }
        else{
            this.setState({
                htmlFlag:false,
            })
        }

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
                activeCol:14,
                statusActiveCol:1,
                PauseCodeActiveCol:1,
                SubStatusActiveCol:1,
                tableshow: true,
                isLoading:true,
            });

            var token = localStorage.getItem("access_token");
            const requestOptions = {
                headers: { 
                    'Content-Type': 'application/json' ,
                    'Authorization' : 'Bearer '+token 
                }  
            };

            axios.post('api/agent_performance_detail/',{
                start_date:from,
                end_date:to,
                group: campaignsGroups.indexOf('-ALL-')!='-1' ? CL:campaignsGroups,
                user_group:userGroups.indexOf('-ALL-')!='-1' ? UGL:userGroups,
                shift:shift,
                user:usersNames.indexOf('-ALL-') != '-1' ? UL:usersNames,

                // start_date:'2018-05-25',
                // end_date:'2018-07-23',
                // group: ["0001", "0002", "0003", "0004", "0005", "040588", "0409", "0410", "1000", "2016", "2017", "2018"],
                // user_group:["AGENTS", "Alex", "BILLING", "DPPDemo", "Goodsell", "K1", "K2", "K3", "kiran1", "OPENER", "RMR"],
                // shift:'ALL',
                // user:["0001", "0002", "0003", "0004", "0405", "0406", "0407", "0408", "0409", "0410", "1000", "1001"],

            },requestOptions).then(response=>{
                
                this.setState({
                    mydata : response.data,
                    agsname :response.data.agsname,
                    group_array:response.data.group_array,
                    graph_stat_htmltotal:response.data.graph_stat_htmltotal,
                    graph_stat_display:response.data.graph_stat_display,
                    statuses_array:response.data.statuses_array,
                    avg_display:response.data.avg_display,
                    graph_sub_stat_display:response.data.graph_sub_stat_display,
                    sub_statuses_array:response.data.sub_statuses_array,
                    totalsecarray:response.data.totalsecarray,
                    totall_array:response.data.totall_array,
                    tot_status:response.data.tot_status,
                    tot_calls:response.data.tot_calls,
                    sub_totall_array:response.data.sub_totall_array,
                    tot_sub_status:response.data.tot_sub_status,
                    totalcount:response.data.totalcount,
                    graph_stat_html:response.data.graph_stat_html,
                    AGENTSTATLENGTH:response.data.statuses_array.length,
                    SUBSTATUSARRAY: response.data.sub_statuses_array.length,
                    flag :true,
                    isLoading:false,
                })

                console.log(response.data);

            }).catch(error =>{
                console.log(error);
            })
        }
    } 
    
    setSelectOptions = (name,value) =>{

        if(value == '-ALL-'){
            this.setState({
                [name]:[],
            })    
        }
        this.setState({
            [name]:value,
        }) 
        
        //Set Table column active 0
        // if(name=='displayAs' && event.target.value=='HTML'){
        //     this.setState({
        //         activeCol:14,
        //         statusActiveCol:1,
        //         PauseCodeActiveCol:1,
        //         SubStatusActiveCol:1,
        //     })
        // }else{
        //      this.setState({
        //         activeCol:0,
        //     })
        // }
        // console.log(value);
    }
    
    clickCol = (i,name) =>{
        
        if(this.state.displayAs =='HTML') 
        this.setState({
            activeCol:i,
            colName:name,
        })
    }   

    clickColStatus = (i,name) =>{
        
        if(this.state.displayAs =='HTML') 
        this.setState({
            statusActiveCol:i,
            statusColName:name,
        })
    }   
    
    clickColPauseCode=(i,name) =>{
        if(this.state.displayAs =='HTML') 
        this.setState({
            PauseCodeActiveCol:i,
            PauseCodeColName:name,
        })
    }   
    
    clickColSubStatus =(i,name) =>{

        if(this.state.displayAs =='HTML') 
        this.setState({
            SubStatusActiveCol:i,
            SubStatusColName:name,
        })
    }   

    handleFromChange = (fromDate) => {
        this.setState({ from : moment(fromDate).format('YYYY-MM-DD') });
    }

    handleToChange = (toDate) => {
        this.setState({ to:moment(toDate).format('YYYY-MM-DD')});
    }  
    
     handleCsvDownload (){
        alert('Download Success');
        //downloadCsvReports();
    }
    
    
    componentWillReceiveProps(nextPropsFromRedux) {
        this.setState({  
          alertTitle: nextPropsFromRedux.UserGroup.alertMessageTitle,                                                                                                                                                                                                                                                                                                                               
          showAlert:nextPropsFromRedux.UserGroup.showMessage,
          alertContent: nextPropsFromRedux.UserGroup.alertMessage,
          UserGroupList:nextPropsFromRedux.UserGroup.data,
          campaignList: nextPropsFromRedux.campaignList.data ,
          usersList: nextPropsFromRedux.usersList.data ,
          camploads: nextPropsFromRedux.UserGroup.camploads , 
        });

      }   
    
    
    componentDidMount() {               
             this.props.fetchAllUserGroup();
             this.props.fetchCampaignList();
             this.props.fetchUsersList();
    }
    

    render() {
        const {camploads,htmlFlag,UserGroupList, campaignList, userGroups, campaignsGroups, usersList, usersNames, shift, displayAs, activeCol, colName, from, to, tableshow,
            agsname,
            group_array,
            graph_stat_htmltotal,
            graph_stat_display,
            statuses_array,
            avg_display,
            mydata,
            graph_sub_stat_display,
            sub_statuses_array,
            totalsecarray,
            totall_array,
            tot_status,
            tot_calls,
            sub_totall_array,
            tot_sub_status,
            totalcount,
            graph_stat_html,
            statusActiveCol,
            PauseCodeActiveCol,
            SubStatusActiveCol,
            AGENTSTATLENGTH,
            SUBSTATUSARRAY,
            statusColName,
            flag,
            isLoading,
            DateError,
        } = this.state;
               
    return (
        <div>
            <Helmet>
                <title>AgentPerformance| Ytel</title>
            </Helmet>
            <ContainerHeader match={this.props.match} title='Server Stats and Reports'/>
            <div className="row">
                <CardBox styleName="col-lg-12" heading="Agent Performance Detail Report">
                    <form className="row" autoComplete="off">
                        <div className="col-lg-6 col-sm-6 col-12">
                            <FormControl className="w-100 mb-2">
                        
                                <UserGroupMultipeDropdown 
                                    label={"User Groups"} 
                                    options={UserGroupList} 
                                    onChange={this.setSelectOptions}
                                    name={'userGroups'}
                                    selectedValue={userGroups}
                                    default={'-ALL-'}
                                />
                            </FormControl>
                        </div>

                        <div className="col-lg-6 col-sm-6 col-12">
                            <FormControl className="w-100 mb-2">                                    
                                <MultipeDropdownCampaigns 
                                    label={"Campaigns Groups"} 
                                    options={campaignList} 
                                    onChange={this.setSelectOptions}
                                    name={'campaignsGroups'}
                                    selectedValue={campaignsGroups}
                                    default={'-ALL-'}
                                />
                            </FormControl>
                        </div>
                
                        <div> <br /><br /><br /><br /> </div>
                
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
                                    {DateError?
                                    <p style={{"color":"red","fontSize":"14px"}}>The date range for this report is limited to 60 days from today.</p>:''}
                                </div>
                            </FormControl>
                        </div>

                        <div className="col-lg-6 col-sm-6 col-12 .col-offset-6"><br /><br />
                            <FormControl className="w-100 mb-2">                                
                                <MultipeDropdownUsers 
                                    label={"Users"} 
                                    options={usersList} 
                                    onChange={this.setSelectOptions}
                                    name={'usersNames'}
                                    default={'-ALL-'}
                                    selectedValue={usersNames}
                                />
                            </FormControl>
                        </div>

                        <div className="col-lg-6 col-sm-6 col-12">
                            <FormControl className="w-100 mb-2">
                                <Dropdown 
                                    label={"Shift"} 
                                    onChange={this.setSelectOptions}
                                    name={'shift'}
                                    selectedValue={shift}
                                    data={SHIFT}
                                />
                            </FormControl>
                        </div>

                        <div className="col-lg-6 col-sm-6 col-12">
                            <FormControl className="w-100 mb-2">
                                <Dropdown 
                                    label={"Display As"} 
                                    onChange={this.setSelectOptions}
                                    name={'displayAs'}
                                    selectedValue={displayAs}
                                    data={DISPLAYAS}
                                />
                            </FormControl>
                        </div>
                        <div className="col-lg-12">
                        <Button variant="raised" onClick={this.handleSubmit} className="jr-btn bg-green text-white">Submit</Button>
                  
                        </div>
                        
                    </form>
                    {
                        isLoading &&
                        <div className="loader-view">
                            <CircularProgress/>
                        </div>
                    }       
                </CardBox>
            
                { camploads &&
                    <Dialog open={this.state.camploads} onClose={this.handleRequestClose}>
                        <DialogContent>
                            <div className="loader-view">
                                <CircularProgress/>
                            </div>
                        </DialogContent>
                    </Dialog>   
                }

            {flag == true ?        

                <Card className="shadow border-0 bg-default text-black">
                    <CardBody>
                        <h3 className="card-title">Agent Performance Detail Report  |  {moment(new Date()).format('YYYY-MM-DD')}</h3>
                        <h3 className="card-title">Time Range {from} 00:00:00  To  {to} 11:59:59</h3>
                        
                        
              
                { displayAs=="HTML" ? 
                    <div>
                        <div className="row">
                            <div className="col-lg-12 col-sm-12 col-12" style={{textAlign:'center'}}>
                                <h2>CALL STATS BREAKDOWN:</h2>
                                <h4>(Statistics related to handling of calls only)</h4>
                            </div>
                        </div> 

                        <Paper>
                            <div className="table-responsive-material">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>User </TableCell>
                                            <TableCell onClick={()=>this.clickCol(14,'CALLS')} numeric>CALLS</TableCell>
                                            <TableCell onClick={()=>this.clickCol(1,'TIME')} numeric>TIME</TableCell>
                                            <TableCell onClick={()=>this.clickCol(2,'PAUSE')} numeric>PAUSE</TableCell>
                                            <TableCell onClick={()=>this.clickCol(3,'PAUSE AVG')} numeric>PAUSE AVG</TableCell>
                                            <TableCell onClick={()=>this.clickCol(4,'WAIT')} numeric>WAIT</TableCell>
                                            <TableCell onClick={()=>this.clickCol(5,'WAIT AVG')}>WAIT AVG</TableCell>
                                            <TableCell onClick={()=>this.clickCol(6,'TALK')}>TALK</TableCell>
                                            <TableCell onClick={()=>this.clickCol(7,'TALK AVG')}>TALK AVG</TableCell>
                                            <TableCell onClick={()=>this.clickCol(8,'DISPO')}>DISPO</TableCell>
                                            <TableCell onClick={()=>this.clickCol(9,'DISPO AVG')}>DISPO AVG</TableCell>
                                            <TableCell onClick={()=>this.clickCol(10,'DEAD')}>DEAD</TableCell>
                                            <TableCell onClick={()=>this.clickCol(11,'DEAD')}>DEAD AVG</TableCell>
                                            <TableCell onClick={()=>this.clickCol(12,'CUST')}>CUST</TableCell>
                                            <TableCell onClick={()=>this.clickCol(13,'CUST AVG')}>CUST AVG</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>User</TableCell>
                                            <TableCell colSpan={BREAKDOWN_COL1}>{colName}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>         
                                        {
                                            [...Array(agsname.length).keys()].map(key => 
                                                <TableRow key={key}>
                                                    <TableCell>{mydata.agsname[key]}</TableCell>
                                                    <TableCell className={activeCol!=0 && activeCol!=14?'hide-td':''} colSpan={activeCol==14?BREAKDOWN_COL1:1} >
                                                        {<LinearProgress color="primary" variant="determinate" className="progressbar-height" value={graph_stat_htmltotal[key][0]}/>}
                                                    </TableCell>
                                                    {Object.keys( graph_stat_html[key]).map((item, i) =>

                                                        <TableCell key={i} className={activeCol!=0 && activeCol!= i+1?'hide-td':''} colSpan={activeCol==i+1?BREAKDOWN_COL1:1} >
                                                            {<LinearProgress color="primary" variant="determinate" className="progressbar-height" value={parseInt(mydata.graph_stat_html[key][i])} />}
                                                            
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                        )}
                                        {
                                            <TableRow>
                                                    <TableCell>Total</TableCell>
                                                    <TableCell className={activeCol!=0 && activeCol!= 17?'hide-td':''} colSpan={activeCol==17?BREAKDOWN_COL1:1}>{tot_calls}</TableCell>
                                                    {                                            
                                                        totall_array.concat(tot_status).map((j, i) =>
                                                                <TableCell key={i} className={activeCol!=0 && activeCol!= i+1?'hide-td':''} colSpan={activeCol==i+1?BREAKDOWN_COL1:1} >
                                                                    {activeCol==i+1? j :''}          
                                                                </TableCell>
                                                        )
                                                    }
                                            </TableRow>
                                        }
                                    </TableBody>
                                </Table>
                            </div>
                        </Paper>

                            <br/><br/>
                        <Paper>
                            <div className="col-lg-12 col-sm-12 col-12">
                                    <h3 className="card-title">AGENT STATUS REPORTS </h3>
                            </div>
                            <div className="table-responsive-material">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>User </TableCell>
                                            {statuses_array.map((item, i) =>
                                                <TableCell key={i} onClick={()=>this.clickColStatus(i+1,item)}>{item}</TableCell>
                                            )}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>                                      
                                            {
                                                [...Array(agsname.length).keys()].map(key => 
                                                    <TableRow key={key}>
                                                        <TableCell>{mydata.agsname[key]}</TableCell>

                                                        {Object.keys( avg_display[key]).map((item, i) =>
                                                            <TableCell key={i} className={statusActiveCol!=0 && statusActiveCol!= i+1?'hide-td':''} colSpan={statusActiveCol==i+1?AGENTSTATLENGTH:1} >
                                                                {statusActiveCol==i+1? <LinearProgress color="primary" variant="determinate" className="progressbar-height" value={mydata.avg_display[key][i]} />:mydata.avg_display[key][i]} 
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                            )}
                                            {
                                                <TableRow>
                                                        <TableCell>Total</TableCell>
                                                        {                                            
                                                            tot_status.map((j, i) =>
                                                                <TableCell key={i} className={statusActiveCol!=0 && statusActiveCol!= i+1?'hide-td':''} colSpan={statusActiveCol==i+1?AGENTSTATLENGTH:1} >
                                                                    {j}          
                                                                </TableCell>
                                                            )
                                                        }
                                                </TableRow>
                                            }
                                    </TableBody>
                                </Table>
                            </div>
                        </Paper>
                            <br/><br/>
                        <Paper>    
                            <div className="col-lg-12 col-sm-12 col-12">
                                    <h3 className="card-title">PAUSE CODE BREAKDOWN </h3>
                            </div>
                            <div className="table-responsive-material">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>User</TableCell>
                                            <TableCell onClick={()=>this.clickColPauseCode(1,'Total')} >TOTAL</TableCell>
                                            <TableCell onClick={()=>this.clickColPauseCode(2,'Non Pause')} >Non Pause</TableCell>
                                            <TableCell onClick={()=>this.clickColPauseCode(3,'Pause')} >Pause</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>                                      
                                        {[...Array(agsname.length).keys()].map(key => 
                                            <TableRow key={key}>
                                                <TableCell>{mydata.agsname[key]}</TableCell>
                                                
                                                <TableCell className={PauseCodeActiveCol!=0 && PauseCodeActiveCol!= 1?'hide-td':''} colSpan={PauseCodeActiveCol==1?3:1}>
                                                    {<LinearProgress color="primary" variant="determinate" className="progressbar-height" value={totalsecarray[key]} />} 
                                                </TableCell>
                                                <TableCell className={PauseCodeActiveCol!=0 && PauseCodeActiveCol!= 2?'hide-td':''} colSpan={PauseCodeActiveCol==2?3:1}>
                                                    
                                                    {<LinearProgress color="primary" variant="determinate" className="progressbar-height" value={mydata.graph_sub_stat_html[key][0]} />}
                                                </TableCell>
                                                <TableCell className={PauseCodeActiveCol!=0 && PauseCodeActiveCol!= 3?'hide-td':''} colSpan={PauseCodeActiveCol==3?3:1}>

                                                    {<LinearProgress color="primary" variant="determinate" className="progressbar-height" value={mydata.graph_sub_stat_html[key][1]} />}
                                                </TableCell>
                                                
                                            </TableRow>
                                        )} 
                                        {
                                            <TableRow>
                                                    <TableCell>Total</TableCell>
                                                    {                                            
                                                        sub_totall_array.map((j, i) =>
                                                            <TableCell key={i} className={PauseCodeActiveCol!=0 && PauseCodeActiveCol!= i+1?'hide-td':''} colSpan={PauseCodeActiveCol==i+1?3:1} >
                                                                {j}          
                                                            </TableCell>
                                                        )
                                                    }
                                            </TableRow>
                                        } 
                                    </TableBody>
                                </Table>
                            </div>
                        </Paper>
                            <br/><br/>
                        <Paper>
                            <div className="col-lg-12 col-sm-12 col-12">
                                    <h3 className="card-title">AGENT SUB STATUS REPORTS</h3>
                            </div>
                            <div className="table-responsive-material">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>User</TableCell>
                                            {sub_statuses_array.map((item, i) =>
                                                <TableCell key={i} onClick={()=>this.clickColSubStatus(i+1,item)}>{item == null ? 'NOT SET' : item}</TableCell>
                                            )}

                                        </TableRow>
                                    </TableHead>
                                    <TableBody>    

                                        {[...Array(agsname.length).keys()].map(key => 
                                            <TableRow key={key}>
                                                <TableCell>{mydata.agsname[key]}</TableCell>
                                                {Object.keys( mydata.avg_sub_display[key]).map((item, i) =>
                                                    <TableCell key={i} className={SubStatusActiveCol!=0 && SubStatusActiveCol!= i+1?'hide-td':''} colSpan={SubStatusActiveCol==i+1?SUBSTATUSARRAY:1} >
                                                        {<LinearProgress color="primary" variant="determinate" className="progressbar-height" value={mydata.avg_sub_value[key][i]} />} 
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        )}
                                        <TableRow>
                                            <TableCell>Total</TableCell>
                                            {                                            
                                                tot_sub_status.map((j, i) =>
                                                    <TableCell key={i} className={SubStatusActiveCol!=0 && SubStatusActiveCol!= i+1?'hide-td':''} colSpan={SubStatusActiveCol==i+1?SUBSTATUSARRAY:1} >
                                                        {j}          
                                                    </TableCell>
                                                )
                                            }
                                       </TableRow>               
                                    </TableBody>
                                </Table>
                            </div>
                        </Paper>
                    </div>
                :
                    <div>
                    <Paper>
                        <div className="row">
                            <div className="col-lg-12 col-sm-12 col-12" style={{textAlign:'center'}}>
                                <h2>CALL STATS BREAKDOWN: </h2>
                                <h4>(Statistics related to handling of calls only)</h4>
                            </div>
                        </div> 
                        
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>User </TableCell>
                                        <TableCell numeric>USER GROUP</TableCell>
                                        <TableCell numeric>CALLS</TableCell>
                                        <TableCell numeric>TIME</TableCell>
                                        <TableCell numeric>PAUSE</TableCell>
                                        <TableCell numeric>PAUSE AVG</TableCell>
                                        <TableCell numeric>WAIT</TableCell>
                                        <TableCell >WAIT AVG</TableCell>
                                        <TableCell >TALK</TableCell>
                                        <TableCell >TALK AVG</TableCell>
                                        <TableCell >DISPO</TableCell>
                                        <TableCell >DISPO AVG</TableCell>
                                        <TableCell >DEAD</TableCell>
                                        <TableCell >DEAD AVG</TableCell>
                                        <TableCell >CUST</TableCell>
                                        <TableCell >CUST AVG</TableCell>
                                        {statuses_array.map((item, i) =>
                                            <TableCell key={i} >{item}</TableCell>
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>                
                                        {
                                            [...Array(agsname.length).keys()].map(key => 
                                                <TableRow key={key}>
                                                    <TableCell>{mydata.agsname[key]}</TableCell>
                                                    <TableCell>{group_array[key]}</TableCell>
                                                    <TableCell>{graph_stat_htmltotal[key][0]}</TableCell>
                                                    {Object.keys( graph_stat_display[key]).map((item, i) =>

                                                        <TableCell key={i} >{mydata.graph_stat_display[key][i]}</TableCell>
                                                    )}
                                                    {Object.keys( mydata.avg_display[key]).map((item, i) =>

                                                        <TableCell key={i} >{mydata.avg_display[key][i]}</TableCell>
                                                    )}
                                                </TableRow>
                                        )}
                                        
                                        {
                                    <TableRow>
                                        <TableCell>Total</TableCell>
                                        <TableCell>AGENTS : {agsname.length}</TableCell>
                                        <TableCell>{tot_calls}</TableCell>
                                        {                                            
                                            totall_array.concat(tot_status).map((j, k) =>
                                                    <TableCell key={k}>{j}</TableCell>
                                            )
                                        }
                                    </TableRow>
                                }

                                </TableBody>
                            </Table>
                        </div>
                    </Paper>   

                        <br/>
                        <br/>
                    <Paper>
                        <div className="row">
                            <div className="col-lg-12 col-sm-12 col-12">
                                <br/>
                                <h3 className="card-title">PAUSE CODE BREAKDOWN:</h3>
                                <button type="button" onClick={this.handleCsvDownload} className="btn btn-raised btn-sm pull-right btn-success">CSV Download</button>
                            </div>
                        </div> 
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>User </TableCell>
                                        <TableCell onClick={()=>this.clickCol(1,'User Group')} numeric>USER GROUP</TableCell>
                                        <TableCell onClick={()=>this.clickCol(2,'Total')} numeric>TOTAL</TableCell>
                                        <TableCell onClick={()=>this.clickCol(3,'Non Pause')} numeric>Non Pause</TableCell>
                                        <TableCell onClick={()=>this.clickCol(4,'Pause')} numeric>Pause</TableCell>
                                        {sub_statuses_array.map((item, i) =>
                                            <TableCell key={i} >{item == null ? 'NOT SET' : item}</TableCell>
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {[...Array(agsname.length).keys()].map(key => 
                                        <TableRow key={key}>
                                            <TableCell>{mydata.agsname[key]}</TableCell>
                                            <TableCell>{group_array[key]}</TableCell>
                                            <TableCell>{totalsecarray[key]}</TableCell>
                                            <TableCell>{graph_sub_stat_display[key][0]}</TableCell>
                                            <TableCell>{graph_sub_stat_display[key][1]}</TableCell>
                                            {Object.keys( mydata.avg_sub_display[key]).map((item, i) =>
                                                <TableCell key={i} >{mydata.avg_sub_display[key][i]}</TableCell>
                                            )}
                                        </TableRow>
                                    )}
                                    <TableRow>
                                        <TableCell>Total</TableCell>
                                        <TableCell>AGENTS : {agsname.length}</TableCell>
                                        <TableCell>{totalcount}</TableCell>
                                        {                                            
                                           sub_totall_array.concat(tot_sub_status).map((j, k) =>
                                                    <TableCell key={k}>{j}</TableCell>
                                            )
                                        }
                                   </TableRow>               
                                </TableBody>
                            </Table>
                        </div>
                        
                    </Paper>
                    </div>
                }
                    </CardBody>
                </Card>
            :''}       
            </div>             
        </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    console.log(state);
    return {
        UserGroup: state.usergrouplist,
        campaignList: state.campaign_list, 
        usersList: state.users_list,
    };
}

 const mapDispatchToProps = {
        fetchAllUserGroup,
        fetchCampaignList,
        fetchUsersList,
    };
    
export default connect(mapStateToProps, mapDispatchToProps)(AgentPerformanceDetail);
