import React from 'react';
import {connect} from 'react-redux';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import ContainerHeader from '../../../../../../../components/ContainerHeader/index';
import CardBox from '../../../../../../../components/CardBox/index';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {Card, CardBody, CardFooter, CardHeader, CardSubtitle, CardText} from 'reactstrap';
import {cloneElement, Component} from 'react';
import moment from 'moment';
import momentTimezone from 'moment-timezone';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
import {DateTimePicker} from 'material-ui-pickers';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import MultipeDropdown from '../../../common/UserGroupMultipeDropdown';
import UserGroupMultipeDropdown from '../../../common/UserGroupMultipeDropdown';
import MultipeDropdownCampaigns from '../../../common/MultipeDropdownCampaigns';
import StatusesMultipeDropdown from '../../../common/StatusesMultipeDropdown';
import Dropdown from '../../../common/Dropdown';
import {dateValidation} from '../../../common/DateDiff';
import 'react-day-picker/lib/style.css';
import Helmet from "react-helmet";
import {
    fetchAllUserGroup,
    fetchCampaignList,
    fetchAllStatuses,
  
} from '../../../../actions/';
import Divider from '@material-ui/core/Divider';
import TextTable from './tables/TextTable';
const DISPLAYAS = ['TEXT', 'HTML'];
let kid = 0;
const BREAKDOWN_COL1 = 16;

function generate(element) {
    return [0, 1, 2].map(value =>
        cloneElement(element, {
            key: value,
        }),
    );
}

class TeamPerformanceDetail extends React.Component {

    constructor(props) {
        super(props);    
        this.state = {                  
            fromSelectedDate: momentTimezone.tz(moment(new Date()), "America/Los_Angeles").format('MM/DD/YYYY HH:MM:SS'),
            toSelectedDate: momentTimezone.tz(moment(new Date()), "America/Los_Angeles").format('MM/DD/YYYY HH:MM:SS'),      
            tableshow: false,
            activeCol:0,
            colName :'CALLS',
            totColName :'CALLS',
            userGroups:['-ALL-'],
            UserGroupList :[],
            campaignsGroups:['-ALL-'],
            campaignList: [], 
            statuses:['-NO ADDITIONAL STATUSES-'],
            statusesList:[],
            displayAs:'TEXT',
            isLoading:false,
            timeval: false,
            mydata: [],
            flag: "TEXT",
            result: false,            
        };
      }       
    
    setSelectOptions = (name,value) =>{
        this.setState({
            [name]:value,
        })  
    }
    
    clickCol = (i,name) =>{
        console.log(i)
        if(this.state.displayAs =='HTML') 
        this.setState({
            activeCol:i,
            colName:name,
        })
    }
    
    clickTotalCol = (i,name) =>{
        console.log(i)
        if(this.state.displayAs =='HTML') 
        this.setState({
            activeCol:i,
            totColName:name,
        })
    }
     
     handleDateChangeFrom = (date) => {
        this.setState({fromSelectedDate: date.format('MM/DD/YYYY HH:MM:SS')});
    };
    
     handleDateChangeTo = (date) => {
        this.setState({toSelectedDate: date.format('MM/DD/YYYY HH:MM:SS')});
    };
    
    handleCsvDownload (){
        alert('Download Success');
        //downloadCsvReports();
    }    
    
    componentWillReceiveProps(nextPropsFromRedux) {
        this.setState({           
          UserGroupList:nextPropsFromRedux.UserGroup.data,
          campaignList: nextPropsFromRedux.campaignList.data,
          statusesList:nextPropsFromRedux.Statuses.data,
          camploads: nextPropsFromRedux.Statuses.camploads , 
        });

      }   
      
    componentDidMount() {  
        this.props.fetchCampaignList();
        this.props.fetchAllUserGroup();
        this.props.fetchAllStatuses();
    } 

handleSubmit=()=>{
    
        this.setState({result : false})
        //Set Table column active 0        
        if(this.state.displayAs=='HTML'){
            this.setState({
                activeCol:1,
                flag: "HTML",
                isLoading: true,
                
            })
        }else{
             this.setState({
                activeCol:1,
                flag: "TEXT",
                isLoading: true,
            })
        }
        
        let local_db = JSON.parse(localStorage.getItem("selected_db")); 
        let url_address = local_db.application_dns;
        
        let from = moment(this.state.fromSelectedDate).format('MM/DD/YYYY HH:MM:SS')
        let to = moment(this.state.toSelectedDate).format('MM/DD/YYYY HH:MM:SS')        
        let starttime = moment(this.state.fromSelectedDate).format('HH:MM:SS');
        let endtime = moment(this.state.toSelectedDate).format('HH:MM:SS');
       
        const {displayAs, fromSelectedDate, toSelectedDate, statuses, statusesList, UserGroupList, campaignsGroups, userGroups, campaignList} = this.state;        
        const date = momentTimezone.tz(moment(new Date()), "America/Los_Angeles").format('MM/DD/YYYY HH:MM:SS');
                
        const UGL = UserGroupList.map((item,i)=>(item.user_group)).filter(Boolean); //Add .filter(Boolean) if remove "" value from array
        const CL = campaignList.map((item,i)=>(item.campaign_id)).filter(Boolean); 
        
        var auth_token = localStorage.getItem("access_token");       

         if(dateValidation(fromSelectedDate,toSelectedDate,date,2)==false){
            this.setState({                   
                isLoading:false,
                timeval: true,
                tableshow: false,
            }) 
        }else{             
           axios.post('api/team-performance-details', {
            startdate: fromSelectedDate,
            start_time: starttime,
            enddate: toSelectedDate,
            end_time: endtime,
            group: campaignsGroups.indexOf('-ALL-')==-1?campaignsGroups:CL,
            call_status: statuses =='-NO ADDITIONAL STATUSES-'?['-NONE-']:statuses,
            user_group: userGroups.indexOf('-ALL-')==-1?userGroups:UGL, 
            display_type: displayAs.toLowerCase(),            
            url_address: url_address,
        }, {headers: { 
        	'Content-Type': 'application/json' ,
        	'Authorization' : 'Bearer '+auth_token  ,
        }}).then(response => {
            this.setState({
                mydata : response.data,
                tableshow : true,
                isLoading:false,
                timeval: false,
                result: true,
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
        const {result, flag, mydata, timeval, camploads, isLoading, UserGroupList, userGroups, campaignList, campaignsGroups, statusGroups, statuses, statusesList, displayAs, activeCol, colName, totColName, tableshow, fromSelectedDate, toSelectedDate} = this.state;
        
        
    return (
        <div>
        <Helmet>
          <title>TeamPerformanceDetailReport | Ytel</title>
        </Helmet>
            <ContainerHeader match={this.props.match} title='Server Stats and Reports'/>                        
            <div className="row">
                    <CardBox styleName="col-lg-12" heading="Team Performance Detail Report">
                        <form className="row" autoComplete="off">
                            <div className="col-lg-6 col-sm-6 col-12">
                                <FormControl className="w-100 mb-2">
                                    <UserGroupMultipeDropdown 
                                        label={"User Groups"} 
                                        options={UserGroupList} 
                                        onChange={this.setSelectOptions}
                                        name={'userGroups'}
                                        default={'-ALL-'}
                                        selectedValue={userGroups}
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
                                        default={'-ALL-'}
                                        selectedValue={campaignsGroups}
                                    />
                                </FormControl>
                            </div>
                            <div> <br /><br /></div>
                    <div className="col-lg-6 col-sm-6 col-12">
                                <FormControl className="w-100 mb-2">  
                                    <StatusesMultipeDropdown 
                                        label={"-NO ADDITIONAL STATUSES-"} 
                                        options={statusesList} 
                                        onChange={this.setSelectOptions}
                                        name={'statuses'}
                                        default={'-NO ADDITIONAL STATUSES-'}
                                        selectedValue={statuses}
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
                    
                            <div className="col-lg-6 col-sm-6 col-12">
                                <div key="datetime_default" className="picker">
                                    <h3>Dates</h3>
                                    <DateTimePicker
                                        fullWidth
                                        value={fromSelectedDate}
                                        showTabs={false}
                                        format='YYYY/MM/DD HH:mm:ss'
                                        onChange={this.handleDateChangeFrom}
                                        leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                                        rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                                    />
                                     
                                </div>  
                            </div>
                    
                    <div className="col-lg-6 col-sm-6 col-12"></div>
                    
                            <div className="col-lg-6 col-sm-6 col-12">
                                <div key="datetime_default" className="picker">
                                     <h3>To</h3>
                                    <DateTimePicker
                                        fullWidth
                                        value={toSelectedDate}
                                        showTabs={false}
                                        format='YYYY/MM/DD HH:mm:ss'
                                        onChange={this.handleDateChangeTo}
                                        leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                                        rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                                    />
                                     {timeval ?
                                            <p style={{color:'red'}}>The date range for this report is limited to 60 days from today.</p>
                                            :<p>The date range for this report is limited to 60 days from today.</p>}
                                </div>  
                            </div>

                           <div className="col-lg-12">
                            <Button variant="raised" onClick={this.handleSubmit} className="jr-btn bg-green text-white">Submit</Button>
                            <button type="button" onClick={this.handleCsvDownload} className="btn btn-raised btn-sm pull-right btn-success">CSV Download</button>
                            </div>                            
                        </form>
                            { isLoading &&
                                <Dialog open={this.state.isLoading} onClose={this.handleRequestClose}>
                                    <DialogContent>
                                        <div className="loader-view">
                                            <CircularProgress/>
                                        </div>
                                    </DialogContent>
                                </Dialog>   
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
                                     
                    {tableshow && result ? 
                        
                        flag == "TEXT" ?
                           <TextTable displayAs={displayAs} mydata={mydata}/>
                       :   
                       
                       <Card className="shadow border-0 bg-default text-black"> 
                            <CardHeader className="bg-primary text-white">--- CALL CENTER TOTAL</CardHeader>
                        <CardBody>
                            {Object.keys(mydata.data.agent_array).map((item, i) => 
                                <Card style={{padding: "20px"}} className="shadow border-0 bg-default text-black" key={i}>
                                    <h3>--- TEAM: {mydata.data.agent_array[i].team}</h3>
                                    <br/>
                                    {mydata.data.agent_array[i].graph.length != 0 ?                                        
                                        <div className="table-responsive-material">
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell key={1} onClick={()=>this.clickCol(1,'Calls')} numeric>Calls</TableCell>
                                                        <TableCell key={2} onClick={()=>this.clickCol(2,'Leads')} numeric>Leads</TableCell>
                                                        <TableCell key={3} onClick={()=>this.clickCol(3,'CONTACTS')} numeric>CONTACTS</TableCell>
                                                        <TableCell key={4} onClick={()=>this.clickCol(4,'CONTACT RATIO')} numeric>CONTACT RATIO</TableCell>
                                                        <TableCell key={5} onClick={()=>this.clickCol(5,'SYSTEM TIME')} numeric>SYSTEM TIME</TableCell>
                                                        <TableCell key={6} onClick={()=>this.clickCol(6,'TALK TIME')}>TALK TIME</TableCell>
                                                        <TableCell key={7} onClick={()=>this.clickCol(7,'SALES')}>SALE ARRAY</TableCell>
                                                        <TableCell key={8} onClick={()=>this.clickCol(8,'SALES')}>SALE TO LEAD RATION</TableCell>
                                                        <TableCell key={9} onClick={()=>this.clickCol(9,'SALE CONTACT RATION')}>SALE CONTACT RATION</TableCell>
                                                        <TableCell key={10} onClick={()=>this.clickCol(10,'SALES PER HOUR')}>SALES PER HOUR</TableCell>
                                                        <TableCell key={11} onClick={()=>this.clickCol(11,'INCOMPLETE')}>INCOMPLETE ARRAY</TableCell>
                                                        <TableCell key={12} onClick={()=>this.clickCol(12,'CANCEL ARRAY')}>CANCEL ARRAY</TableCell>
                                                        <TableCell key={13} onClick={()=>this.clickCol(13,'CALLBACKS')}>CALLBACKS</TableCell>
                                                        <TableCell key={14} onClick={()=>this.clickCol(14,'STCALL')}>STCALL</TableCell>   
                                                        <TableCell key={16} onClick={()=>this.clickCol(15,'AVG SALE TIME')}>AVG SALE TIME</TableCell>  
                                                        <TableCell key={17} onClick={()=>this.clickCol(16,'AVG CONTACT TIME')}>AVG CONTACT TIME</TableCell>   
                                                    </TableRow>
                                                    <TableRow>
                                                       <TableCell>User</TableCell>
                                                       <TableCell colSpan={BREAKDOWN_COL1}>{colName}</TableCell>
                                                   </TableRow> 
                                                </TableHead>
                                                <TableBody>
                                                    { Object.keys(mydata.data.agent_array[i].graph).map((g, t) =>
                                                    <TableRow key={t}>
                                                        <TableCell>{mydata.data.agent_array[i].graph[g].user}</TableCell>
                                                        <TableCell  className={activeCol!=0 && activeCol!= 1?'hide-td':''} colSpan={activeCol==1?16:1}><Progress percent={mydata.data.agent_array[i].graph[g].calls} /></TableCell>
                                                        <TableCell  className={activeCol!=0 && activeCol!= 2?'hide-td':''} colSpan={activeCol==2?16:1}><Progress percent={mydata.data.agent_array[i].graph[g].leads} /></TableCell>
                                                        <TableCell  className={activeCol!=0 && activeCol!= 3?'hide-td':''} colSpan={activeCol==3?16:1}><Progress percent={mydata.data.agent_array[i].graph[g].contacts} /></TableCell>
                                                        <TableCell  className={activeCol!=0 && activeCol!= 4?'hide-td':''} colSpan={activeCol==4?16:1}><Progress percent={mydata.data.agent_array[i].graph[g].contact_ratio} /></TableCell>
                                                        <TableCell  className={activeCol!=0 && activeCol!= 5?'hide-td':''} colSpan={activeCol==5?16:1}><Progress percent={mydata.data.agent_array[i].graph[g].system_time} /></TableCell>
                                                        <TableCell  className={activeCol!=0 && activeCol!= 6?'hide-td':''} colSpan={activeCol==6?16:1}><Progress percent={mydata.data.agent_array[i].graph[g].talk_time} /></TableCell>
                                                        <TableCell  className={activeCol!=0 && activeCol!= 7?'hide-td':''} colSpan={activeCol==7?16:1}><Progress percent={mydata.data.agent_array[i].graph[g].sale_array} /></TableCell>
                                                        <TableCell  className={activeCol!=0 && activeCol!= 8?'hide-td':''} colSpan={activeCol==8?16:1}><Progress percent={mydata.data.agent_array[i].graph[g].sales_ratio} /></TableCell>
                                                        <TableCell  className={activeCol!=0 && activeCol!= 9?'hide-td':''} colSpan={activeCol==9?16:1}><Progress percent={mydata.data.agent_array[i].graph[g].sale_contact_ratio} /></TableCell>
                                                        <TableCell  className={activeCol!=0 && activeCol!= 10?'hide-td':''} colSpan={activeCol==10?16:1}><Progress percent={mydata.data.agent_array[i].graph[g].sales_per_hour} /></TableCell>
                                                        <TableCell  className={activeCol!=0 && activeCol!= 11?'hide-td':''} colSpan={activeCol==11?16:1}><Progress percent={mydata.data.agent_array[i].graph[g].incomplete_array} /></TableCell>
                                                        <TableCell  className={activeCol!=0 && activeCol!= 12?'hide-td':''} colSpan={activeCol==12?16:1}><Progress percent={mydata.data.agent_array[i].graph[g].cancel_array} /></TableCell>
                                                        <TableCell  className={activeCol!=0 && activeCol!= 13?'hide-td':''} colSpan={activeCol==13?16:1}><Progress percent={mydata.data.agent_array[i].graph[g].callbacks} /></TableCell>
                                                        <TableCell  className={activeCol!=0 && activeCol!= 14?'hide-td':''} colSpan={activeCol==14?16:1}><Progress percent={mydata.data.agent_array[i].graph[g].stcall} /></TableCell>
                                                        <TableCell  className={activeCol!=0 && activeCol!= 15?'hide-td':''} colSpan={activeCol==15?16:1}><Progress percent={mydata.data.agent_array[i].graph[g].avg_sale_time} /></TableCell>
                                                        <TableCell  className={activeCol!=0 && activeCol!= 16?'hide-td':''} colSpan={activeCol==16?16:1}><Progress percent={mydata.data.agent_array[i].graph[g].avg_contact_time} /></TableCell>            
                                                    </TableRow>
                                                    )}
                                                    <TableRow>
                                                        <TableCell>TOTAL</TableCell>
                                                        
                                                           <TableCell colSpan={BREAKDOWN_COL1} >{mydata.data.agent_array[i].total[activeCol]}</TableCell>       
                                                        
                                                        
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>
                                        : <p>**** NO AGENTS FOUND UNDER THESE REPORT PARAMETERS ****</p>
                                    }
                                    
                                </Card> 
                            )}
                            <Card style={{padding: "20px"}} className="shadow border-0 bg-default text-black">
                                <h1 className="text-center">Call Center Total</h1>
                                <div className="table-responsive-material">
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell key={1} onClick={()=>this.clickCol(1,'Calls')} numeric>Calls</TableCell>
                                                <TableCell key={2} onClick={()=>this.clickCol(2,'Leads')} numeric>Leads</TableCell>
                                                <TableCell key={3} onClick={()=>this.clickCol(3,'CONTACTS')} numeric>CONTACTS</TableCell>
                                                <TableCell key={4} onClick={()=>this.clickCol(4,'CONTACT RATIO')} numeric>CONTACT RATIO</TableCell>
                                                <TableCell key={5} onClick={()=>this.clickCol(5,'SYSTEM TIME')} numeric>SYSTEM TIME</TableCell>
                                                <TableCell key={6} onClick={()=>this.clickCol(6,'TALK TIME')}>TALK TIME</TableCell>
                                                <TableCell key={7} onClick={()=>this.clickCol(7,'SALES')}>SALE ARRAY</TableCell>
                                                <TableCell key={8} onClick={()=>this.clickCol(8,'SALES')}>SALE TO LEAD RATION</TableCell>
                                                <TableCell key={9} onClick={()=>this.clickCol(9,'SALE CONTACT RATION')}>SALE CONTACT RATION</TableCell>
                                                <TableCell key={10} onClick={()=>this.clickCol(10,'SALES PER HOUR')}>SALES PER HOUR</TableCell>
                                                <TableCell key={11} onClick={()=>this.clickCol(11,'INCOMPLETE')}>INCOMPLETE ARRAY</TableCell>
                                                <TableCell key={12} onClick={()=>this.clickCol(12,'CANCEL ARRAY')}>CANCEL ARRAY</TableCell>
                                                <TableCell key={13} onClick={()=>this.clickCol(13,'CALLBACKS')}>CALLBACKS</TableCell>
                                                <TableCell key={14} onClick={()=>this.clickCol(14,'STCALL')}>STCALL</TableCell>   
                                                <TableCell key={16} onClick={()=>this.clickCol(15,'AVG SALE TIME')}>AVG SALE TIME</TableCell>  
                                                <TableCell key={17} onClick={()=>this.clickCol(16,'AVG CONTACT TIME')}>AVG CONTACT TIME</TableCell>   
                                            </TableRow>
                                            <TableRow>
                                               <TableCell>User</TableCell>
                                               <TableCell colSpan={BREAKDOWN_COL1}>{colName}</TableCell>
                                           </TableRow> 
                                        </TableHead>
                                        <TableBody>
                                        {Object.keys(mydata.data.total_array).map((key, val) => 

                                         mydata.data.total_array[key].length != 0 ?

                                         <TableRow key={val}>
                                            <TableCell>{mydata.data.total_array[key][0]}</TableCell>
                                            <TableCell colSpan={BREAKDOWN_COL1}>{mydata.data.total_array[key][activeCol]}</TableCell>
                                         </TableRow>
                                         : null
                                        )}
                                         <TableRow>
                                            <TableCell>TOTAL</TableCell>
                                               <TableCell >{mydata.data.total[activeCol]}</TableCell>
                                         </TableRow>
                                        </TableBody>

                                    </Table>
                                </div>
                            </Card>
                        </CardBody>
                </Card>
                        
                    : ""}   
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
        Statuses : state.statusesList,

    };
}

 const mapDispatchToProps = {
      fetchAllUserGroup,
      fetchCampaignList,
      fetchAllStatuses,
    };
    
export default connect(mapStateToProps, mapDispatchToProps)(TeamPerformanceDetail);
