import React from 'react';
import {cloneElement, Component} from 'react';
import {connect} from 'react-redux';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import InfoCard from '../../../../../../../components/InfoCard';
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
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import TextField from '@material-ui/core/TextField';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { formatDate, parseDate } from 'react-day-picker/moment';
import CircularProgress from '@material-ui/core/CircularProgress';

import 'react-day-picker/lib/style.css';

import DateRange from '../../../common/DateRange';
import MultipeDropdown from '../../../common/MultipeDropdown';
import MultipeDropdownCampaigns from '../../../common/MultipeDropdownCampaigns';
import Dropdown from '../../../common/Dropdown';

import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";

import { dateValidation } from '../../../common/DateDiff';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import {
    fetchCampaignList, 
  
} from '../../../../actions/';



const SHIFT = ['ALL','AM','PM'];
const DISPLAYAS = ['TEXT','HTML'];
let kid = 0;
//const BREAKDOWN_COL = 32;


class SingleAgentDaily extends React.Component {
      
    constructor(props) {
    super(props);
    this.state = {
        from: moment(new Date()).format('YYYY-MM-DD'),
        to: moment(new Date()).format('YYYY-MM-DD'),
        date : moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        userId: '',       
        tableshow: false,       
        activeCol:0,
        colName :'CALLS', 
        campaignsGroups:['-ALL-'],
        campaignList: [],
        shift:'ALL',
        displayAs:'TEXT',
        data:[],//DATA.data,
        flag : false,
        tot : [],
        BREAKDOWN_COL : 0,
        DateError :'',
        isLoading:false,
    };
  }
      
    handleSubmit = () =>{
        this.setState({
            tableshow: true,
            date : moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        });        
        const {from,to,campaignsGroups,userId,displayAs,shift,flag,date} = this.state;
        let status = false;
        
        if(displayAs == 'HTML'){
            this.setState({activeCol:0})
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
            
            this.setState({isLoading:true});
            var token = localStorage.getItem("access_token");
            const requestOptions = {
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization' : 'Bearer '+token ,
                }
                
            };
            
            axios.post('api/single-agent-daily/',{
                startdate:from,
                enddate:to,
                shift:shift,
                group:campaignsGroups,
                user:userId,
                file_download:'0'
            },requestOptions).then(response=>{  
                this.setState({
                    data: response.data.data,
                    flag :true,
                    isLoading:false,
                    BREAKDOWN_COL : Number(response.data.data.header_array.length) + Number(response.data.data.sub_statuses_ary.length)
                })
                
            }).catch(error =>{
                console.log(error);
            })
        }
    }


    setSelectOptions = (name,value) =>{
        this.setState({
            [name]:value,
        })         
        //Set Table column active 0
        
        if(name=='displayAs' && event.target.value=='HTML'){
            this.setState({
                activeCol:2,
            })
        }else{
             this.setState({
                activeCol:0,
            })
        }
                       
    }
    
    clickCol = (i,name) =>{
        console.log(i)
        if(this.state.displayAs =='HTML') 
        this.setState({
            activeCol:i,
            colName:name,
        })
    }    
    
     handleFromChange = (fromDate) => {
        this.setState({ from : moment(fromDate).format('YYYY-MM-DD') });
    }

    handleToChange = (toDate) => {
        this.setState({ to:moment(toDate).format('YYYY-MM-DD')});
    }

    handleChange = name => event => {
        this.setState({[name]: event.target.value});
    };
    
     handleCsvDownload = () =>
     {
        const {from,to,campaignsGroups,userId,displayAs,shift,flag,date} = this.state;
        var token = localStorage.getItem("access_token");
        const requestOptions = {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer '+token ,
            }
        };

        axios.post('api/csv-single-agent-daily/',{
            startdate:from,
            enddate:to,
            shift:shift,
            group:campaignsGroups,
            user:userId,
            file_download:'1'
        },requestOptions).then(response=>{  
            console.log(response);
        }).catch(error =>{
            console.log(error);
        })


    }
    
    componentWillReceiveProps(nextPropsFromRedux) {
        this.setState({                      
          campaignList: nextPropsFromRedux.campaignList.data ,
          //isLoading: nextPropsFromRedux.campaignList.isLoading , 
        });

      }   
    
    componentDidMount() 
    {               
        this.props.fetchCampaignList();
        this.handleSubmit();
         this.setState({
             tableshow: true,
         });        
    }
    
   
    render() {
        const {isLoading,DateError,date,campaignList, from, to, campaignsGroups, shift, displayAs, userId, activeCol, colName, tableshow,data,flag,tot,BREAKDOWN_COL} = this.state;
        const modifiers = { start: from, end: to };
        
    return (
        <div>
            <ContainerHeader match={this.props.match} title='Server Stats and Reports'/>
            <div className="row">
                    <CardBox styleName="col-lg-12" heading="Single Agent Daily Report">   
                        <form className="row" autoComplete="off">
                            <div className="col-lg-6 col-sm-6 col-12">
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
                    
                            <div className="col-lg-6 col-sm-6 col-12">
                                <FormControl className="w-100 mb-2"><br />
                                    <MultipeDropdownCampaigns 
                                        default={"-ALL-"}
                                        label={"Campaigns Groups"} 
                                        options={campaignList} 
                                        onChange={this.setSelectOptions}
                                        name={'campaignsGroups'}
                                        selectedValue={campaignsGroups}
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
                            <div className="col-lg-6 col-sm-6 col-12"></div>
                                                        

                            <div className="col-lg-6 col-sm-6 col-12 .col-offset-6">
                                <TextField
                                    label="User"
                                    margin="normal"
                                    fullWidth
                                    onChange={this.handleChange('userId')}
                                />
                            </div>

                            <div className="col-lg-6 col-sm-6 col-12"><br />
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

            <div className="col-lg-12">
            {flag ? 
            <Card className="shadow border-0 bg-default text-black">
                <CardBody>
                        <p>LEAD STATS BREAKDOWN: {date}</p>
                        <p>Agent Days Status Report:{this.state.userId}</p>
                        <p>Time Range - {from} 00:00:00   To  {to} 23:59:59</p>
                    <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12">
                            <label>LEAD STATS BREAKDOWN</label>
                            <button type="button" onClick={this.handleCsvDownload} className="btn btn-raised btn-sm pull-right btn-success">CSV Download</button>
                    </div>
                    </div> 
                    <Paper>
                        
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        {
                                            data.header_array.map((item, i)=> 
                                                <TableCell key={i} onClick={()=>this.clickCol(i+1,data.header_array[i])}>{data.header_array[i]}</TableCell>        
                                        )}

                                        {data.sub_statuses_ary.length > 0 ?
                                            data.sub_statuses_ary.map((item, i)=> 
                                                <TableCell key={data.header_array.length+i+1} onClick={()=>this.clickCol(data.header_array.length+i+1,data.sub_statuses_ary[i])}>{data.sub_statuses_ary[i]}</TableCell>        
                                            )
                                            :
                                            ''
                                        }
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                        {displayAs=='HTML'?
                                        <TableRow>
                                            <TableCell colSpan={BREAKDOWN_COL + 1}>{colName}</TableCell>
                                        </TableRow>
                                        :null}
                                        
                                        {
                                            [...Array(data.date_array.length).keys()].map(key => 
                                                <TableRow key={key}>
                                                    {data.date_array[key]!=null ? 
                                                            <TableCell>{data.date_array[key]+" - "+data.date_array[key]}</TableCell>:null}


                                                    {Object.keys( data.graph_stat_display[key]).map((item, i) =>

                                                        <TableCell key={i} className={activeCol!=0 && activeCol!=i+1?'hide-td':''} colSpan={activeCol==i+1?BREAKDOWN_COL:1} >
                                                            {activeCol==i+1? 
                                                                // <LinearProgress color="primary" variant="determinate" value={parseInt(data.graph_stat_display[key][i])*100/parseInt(data.maxvalue['call'])}/>
                                                                <Progress strokeWidth={30} percent={parseInt(data.graph_stat_display[key][i])*100/parseInt(data.maxvalue['call'])} />
                                                                :
                                                                data.graph_stat_display[key][i]}
                                                        </TableCell>

                                                    )}
                                                    {Object.keys( data.avg_display[key]).map((item, i) =>

                                                        <TableCell key={i} className={activeCol!=0 && activeCol!=data.header_array.length+i+1?'hide-td':''} colSpan={activeCol==data.header_array.length+i+1?BREAKDOWN_COL:1} >
                                                        {activeCol==data.header_array.length+i+1? 
                                                            // <LinearProgress color="primary" variant="determinate" value={parseInt(data.avg_value[key][i])/data.secondbar[key]}/>
                                                            <Progress strokeWidth={30} percent={parseInt(data.avg_value[key][i])/data.secondbar[key]} />
                                                            :
                                                            data.avg_display[key][i]}
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                        )}

                                        <TableRow>
                                            <TableCell>TOTAL</TableCell>
                                            {                                            
                                                [
                                                    data.totalresult.map((j, k) =>
                                                        data.totalresult[k] == 0 ? 
                                                            <TableCell key={k} className={activeCol!=0 && activeCol!=k+1?'hide-td':''} colSpan={activeCol==k+1?BREAKDOWN_COL:1}>0</TableCell> 
                                                            : 
                                                            <TableCell key={k} className={activeCol!=0 && activeCol!=k+1?'hide-td':''} colSpan={activeCol==k+1?BREAKDOWN_COL:1}>{data.totalresult[k]} {k==2 ? '%':''}</TableCell>                                                        
                                                    ),
                                                    data.avg_display.map((p, q) =>
                                                        <TableCell key={q} className={activeCol!=0 && activeCol!=data.header_array.length+q+1?'hide-td':''} colSpan={activeCol==data.header_array.length+q+1?BREAKDOWN_COL:1}>{data.avg_display[q].reduce((a, b) => a + b, 0)}</TableCell>    
                                                    )
                                                ]
                                            }
                                        </TableRow>                                 
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                    <br/>
                    <br/>
                </CardBody>
            </Card>: ""
                } 
            </div>
            </div>
        </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    console.log(state);

    return {
        campaignList: state.campaign_list, 

    };
}

 const mapDispatchToProps = {
      fetchCampaignList,
    };
    
export default connect(mapStateToProps, mapDispatchToProps)(SingleAgentDaily);
    
//export default SingleAgentDaily;