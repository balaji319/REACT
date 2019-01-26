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
import moment from 'moment';
import momentTimezone from 'moment-timezone';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { formatDate, parseDate } from 'react-day-picker/moment';
import 'react-day-picker/lib/style.css';
import UserGroupMultipeDropdown from '../../../common/UserGroupMultipeDropdown';
import MultipeDropdownCampaigns from '../../../common/MultipeDropdownCampaigns';
import DateRange from '../../../common/DateRange';
import Dropdown from '../../../common/Dropdown';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
import {dateValidation} from '../../../common/DateDiff';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Helmet from "react-helmet";

const SHIFT = ['ALL','AM','PM'];
const DISPLAYAS = ['TEXT', 'HTML'];

function generate(element) {
    return [0, 1, 2].map(value =>
        cloneElement(element, {
            key: value,
        }),
    );
}

class AgentStatusDetail extends React.Component {

    constructor(props) {
    super(props);   
        this.state = {   
            from: momentTimezone.tz(moment(new Date()), "America/Los_Angeles").format('YYYY-MM-DD'),
            to: momentTimezone.tz(moment(new Date()), "America/Los_Angeles").format('YYYY-MM-DD'),
            shift:'ALL',
            displayAs:'TEXT',
            tableshow: false,       
            activeCol:0,
            colName :'CALLS',
            userGroups:['-ALL-'],
            UserGroupList :[],
            campaignsGroups:['-ALL-'],
            campaignList: [],
            isLoading:false,
            mydata: [],
            headers: [],
            timeval: false,
            
        };
    }   
    
    setSelectOptions = (name,value) =>{
        this.setState({
            [name]:value,
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
    }    
        
    clickCol = (i) =>{
        if(this.state.displayAs =='HTML') 
        this.setState({
            activeCol:i,
        })
    }
    
    componentDidMount() 
    {      
        this.setState({isLoading:true});
        const {UserGroupList, campaignList} = this.state;
        var token = localStorage.getItem("access_token");
        
        const requestOptions = {headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+token ,}};
         
        axios.get('api/agent_campaign_option_list/',requestOptions).then(response=>{  
            this.setState({
                campaignList: response.data.data,
            })
            
            axios.get('api/agent_user_group_option_list/',requestOptions).then(response=>{  
                this.setState({
                    UserGroupList: response.data.data,
                    isLoading: false
                })
                this.handleSubmit();
            }).catch(error =>{
                console.log(error);
            })
            
        }).catch(error =>{
            console.log(error);
        })
    }
    
    handleSubmit=()=>{
        
        const {timeval, from, to, shift, UserGroupList, campaignList, userGroups, displayAs, campaignsGroups, headers} = this.state;
        const UGL = UserGroupList.map((item,i)=>(item.user_group)).filter(Boolean); //Add .filter(Boolean) if remove "" value from array;
        const CL = campaignList.map((item,i)=>(item.campaign_id)).filter(Boolean);
        const date = moment(new Date()).format('YYYY-MM-DD'); 
        var auth_token = localStorage.getItem("access_token");
        this.setState({isLoading:true, open: true });
        
        if(dateValidation(from,to,date,2)==false){                               
           this.setState({                   
               isLoading:false,
               timeval: true,
           })

       }else{
           this.setState({isLoading:true}); 
           if(displayAs == 'html'){
               this.setState({activeCol:0})
           }
           axios.post('api/agent_status_detail/',{
               start_date:from,
               end_date:to,
               shift:shift,
               user_group:userGroups.indexOf('-ALL-')==-1?userGroups:UGL,
               group: campaignsGroups.indexOf('-ALL-')==-1?campaignsGroups:CL,
           }, {headers: { 
           'Content-Type': 'application/json' ,
           'Authorization' : 'Bearer '+auth_token  ,

           }}).then(response=>{

               this.setState({
                   mydata: response.data,
                   headers : response.data.header_array.concat(response.data.sub_statuses_array),
                   tableshow: true,
                   isLoading:false,
                   timeval: false,
               })

               console.log(this.state.mydata);

           }).catch(error =>{
               console.log(error);
               this.setState({                   
                   isLoading:false,
               })
           })
       }       
    } 
    
    render() {
        const {timeval, camploads, UserGroupList, userGroups, campaignList, campaignsGroups, shift, displayAs, activeCol, colName, from, to, tableshow, mydata, headers, isLoading} = this.state;
        
        return (
        <div>
            <Helmet>
              <title>AgentStatusDetailReport : Ytel</title>
            </Helmet>
        <ContainerHeader match={this.props.match} title='Server Stats and Reports'/>
            <div className="row">
                <CardBox styleName="col-lg-12" heading="Agent Status Detail Report">                        
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
                        <div> <br /><br /> </div>
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
                                        :<p>The date range for this report is limited to 60 days from today.</p>
                                    }
                                </div>
                            </FormControl>
                        </div>

                        <div className="col-lg-6 col-sm-6 col-12 .col-offset-6"></div>

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
                            <Button variant="raised" onClick={this.handleCsvDownload} className="pull-right jr-btn bg-green text-white">CSV Download</Button>
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
                {tableshow ? 
                    <CardBox styleName="col-12" cardStyle="p-0">
                    
                        
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead className="tableHead">                                
                                    <TableRow>
                                        <TableCell className={displayAs=='HTML' ? 'hide-td':''}>User Name</TableCell>
                                            {headers.map((item, i) =><TableCell className={displayAs=='HTML' ? 'customTH':''} onClick={()=>this.clickCol(i)}  key={i}><span>{item}</span></TableCell>)}
                                        </TableRow>
                                        
                                    {displayAs=='HTML' ?
                                        <TableRow>
                                            <TableCell className="text-center" colSpan={headers.length}>{headers[activeCol]}</TableCell>
                                        </TableRow>
                                    :null}
                                
                                </TableHead>
                                <TableBody>
                                {
                                    [...Array(mydata.ags_user.length).keys()].map(key => 
                                        <TableRow key={key} hover>
                                               <TableCell>
                                               {displayAs == 'TEXT' ?                                                   
                                                   <a href={"http://127.0.0.1:8000/#/app/reports/agent-reports/AgentStats/?user=" + mydata.ags_name[key]} target="_blank">{mydata.ags_user[key] +"-"+mydata.ags_name[key]}</a>
                                                   : mydata.ags_user[key] +"-"+mydata.ags_name[key]
                                               }
                                                    
                                               </TableCell>
                                       {
                                           Object.keys( mydata.graph_stats[key]).map((item, i) =>

                                               <TableCell className={displayAs=='HTML' && activeCol!=i?'hide-td':''} colSpan={displayAs=='HTML'? headers.length :1} key={i} >
                                                    {
                                                       displayAs == 'HTML' ? 
                                                            <Progress percent={parseInt(mydata.graph_stats[key][++i])} />
                                                        : mydata.graph_stats[key][++i]

                                                    }
                                                </TableCell>
                                            )
                                       }
                                           </TableRow>
                                   )
                                }
                                
                                {
                                   <TableRow>
                                        <TableCell>Total</TableCell>
                                        {                                            
                                           mydata.totall_array.concat(mydata.total_status).map((j, k) =>
                                                    <TableCell key={k} className={displayAs=='HTML' && activeCol!=k?'hide-td':''} colSpan={displayAs=='HTML'? headers.length :1}>
                                                        { j }
                                                    </TableCell>
                                            )

                                        }
                                   </TableRow>
                                }      
                                </TableBody>
                            </Table>
                        </div>
                    </CardBox> : ""
                }
            </div>             
        </div>
    );
}
}

export default AgentStatusDetail;