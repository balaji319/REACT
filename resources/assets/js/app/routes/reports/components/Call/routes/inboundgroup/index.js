import { React,Table,TableBody,TableCell,TableHead,TableRow,InfoCard,ContainerHeader,CardBox,Paper,Input,InputLabel,MenuItem,FormControl,FormHelperText,Select,Card,CardBody,CardSubtitle,CardText,cloneElement,Component,Button,moment} from './plugins';

import InboundGroupMultidropDown from '../common/InboundGroupMultidropDown';
import Dropdown from '../../../common/Dropdown';
import DateRange from '../../../common/DateRange';
import MultiGroupBreakdown from './list/MultiGroupBreakdown';
import CommaTable from './list/CommanTable';
import CallHoldTimeBreakdown from './list/CallHoldTimeBreakdown';
import CallDropTimeBreakdown from './list/CallDropTimeBreakdown';
import CallAnsTimeBreakdown from './list/CallAnsTimeBreakdown';
import CallHangupReasonStats from './list/CallHangupReasonStats';
import CallStatusStats from './list/CallStatusStats';
import CustomStatusCategoryStats from './list/CustomStatusCategoryStats';
import CallInitialQueuePositionBreakdown from './list/CallInitialQueuePositionBreakdown';
import AgentStats from './list/AgentStats';
import IncreamentOfTotalCalls from './list/IncreamentOfTotalCalls';
import CallAnsweredTimeBreakdownInSecond from './list/CallAnsweredTimeBreakdownInSecond';
import {connect} from 'react-redux';
import { dateValidation } from '../../../common/DateDiff';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import "react-sweet-progress/lib/style.css";
import CircularProgress from '@material-ui/core/CircularProgress';
const SHIFT = ['ALL','AM','PM'];
const DISPLAYAS = ['TEXT','HTML'];
import Helmet from "react-helmet";



class InboundGroup extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            shift:'ALL',
            displayAs:'TEXT',
            from: moment(new Date()).format('YYYY-MM-DD'),
            to: moment(new Date()).format('YYYY-MM-DD'),
            inbound_groups:[],
            inound_group_list:[],
            did:"",
            data:[],
            date : moment(new Date()).format('YYYY-MM-DD HH:MM:SS'),
            DateError : '',
            isShow:false,
            isLoading:false,
            activeCol:0,
        };
    }

    handleFromChange = (fromDate) => {
        this.setState({ from : moment(fromDate).format('YYYY-MM-DD') });
    }

    handleToChange = (toDate) => {
        this.setState({ to:moment(toDate).format('YYYY-MM-DD')});
    }    

    handleChange = (name,value) =>{
        if(name=='displayAs'){
            this.setState({
                activeCol:0,
            })
        }

        if(value=='HTML'){
            this.setState({
                activeCol:1,
            })
        }

        this.setState({
            [name]:value,
        }) 
    }

    handleSubmit = () =>{
        
        const {data,from,to,inbound_groups,shift,displayAs,date,isShow,isLoading} = this.state;
        if(displayAs == 'html'){
            this.setState({activeCol:0})
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

            axios.post('api/inbound_calls_report_by_groups/',
            {
                did:"",
                start_date:from,
                end_date:to,
                shift:shift,
                selected_groups:inbound_groups,
                report_display_type:displayAs
            },requestOptions).then(response=>{  
                this.setState({
                    data : response.data.data,
                    isShow : true,
                    isLoading:false,
                })
            }).catch(error =>{
                console.log(error);
            })
        }
        
    }

    componentDidMount() 
    {      
        this.setState({isLoading:true});
        const {from,to,inound_group_list,user,order,displayAs,rowsPerPage,date} = this.state;
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
                flag :true,
            })
        }).catch(error =>{
            console.log(error);
        }) 
        this.handleSubmit();
    }


    render() {
        const {from,to,shift,displayAs,inbound_groups,inound_group_list,date,data,DateError,isShow,isLoading,activeCol} = this.state;
        const myDivStyle = {
            color: 'red',
            fontSize : 14+'px',
          }
    return (
        <div>
            <Helmet>
                <title>InboundReportByGroup | Ytel</title>
            </Helmet>
            <ContainerHeader match={this.props.match} title='Inbound Report By Group'/>
            
            <div className="row">
                <CardBox styleName="col-lg-12" heading="Inbound Report By Group">
                    <form className="row" autoComplete="off">
                        <div className="col-lg-6 col-sm-6 col-12">  
                            
                            <DateRange 
                                onFromChange={this.handleFromChange} 
                                onToChange={this.handleToChange}
                                from={from}
                                to={to}
                            />
                            <FormHelperText style={DateError ? myDivStyle : {}}>The date range for this report is limited to 60 days from today.</FormHelperText>

                            {/* {DateError?
                                    <p style={{"color":"red","fontSize":"14px"}}>The date range for this report is limited to 60 days from today.</p>:''} */}

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

                        <div className="col-lg-6 col-sm-6 col-12">
                            <InboundGroupMultidropDown 
                                default="---NONE---"
                                label={"Inbound Groups"} 
                                options={inound_group_list} 
                                onChange={this.handleChange}
                                name={'inbound_groups'}
                                selectedValue={inbound_groups}
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

            <Card className="shadow border-0 bg-default text-black">
                <CardBody>
                    <span><label className="card-title">Inbound Call Stats:</label>&nbsp;&nbsp;{inbound_groups.join(' | ')} &nbsp;&nbsp;|&nbsp;&nbsp;  {date}</span>
                    <h3 className="card-title">Time range: {from} 00:00:00 To {to} 23:59:59</h3>

                        {isShow ? 
                        <div>
                        <MultiGroupBreakdown display_as={displayAs} data={data}/>
                        <br/>
                        <CommaTable data={data}/>
                        <br/>
                        <CallHoldTimeBreakdown display_as={displayAs} data={data}/>
                        <br/>
                        <CallDropTimeBreakdown display_as={displayAs} data={data}/>
                        <br/>
                        <CallAnsTimeBreakdown display_as={displayAs} data={data}/>
                        <br/>
                        <CallHangupReasonStats display_as={displayAs} data={data}/>                
                        <br/>
                        <CallStatusStats display_as={displayAs} data={data} activeCol={activeCol}/>
                        <br/>
                        <CustomStatusCategoryStats  data={data}/>
                        <br/>
                        <CallInitialQueuePositionBreakdown display_as={displayAs} data={data.initialBreakDown}/>
                        <br/>
                        <AgentStats display_as={displayAs} data={data}/>
                        <br/> 
                        <IncreamentOfTotalCalls display_as={displayAs} data={data}/>
                        <br/>
                        <CallAnsweredTimeBreakdownInSecond data={data}/></div>
                        :""}
                </CardBody>
            </Card>

        </div>
    );
}
}

export default InboundGroup;
