import { React,Table,TableBody,TableCell,TableHead,TableRow,InfoCard,ContainerHeader,CardBox,Paper,Input,InputLabel,MenuItem,FormControl,FormHelperText,Select,Card,CardBody,CardSubtitle,CardText,cloneElement,Component,Button,moment} from './plugins';

import MultipeDropdown from '../../../common/MultipeDropdown';
import Dropdown from '../../../common/Dropdown';
import {DateTimePicker} from 'material-ui-pickers';
import LinearProgress from '@material-ui/core/LinearProgress';
import CampaignMultidropdownList from '../common/CampaignMultidropdownList';
import { dateValidation } from '../../../common/DateDiff';

import CampaignStatusHtml from './CampaignStatusHtml';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import "react-sweet-progress/lib/style.css";
import CircularProgress from '@material-ui/core/CircularProgress';

import Helmet from "react-helmet";


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const SHIFT = ['ALL','AM','PM'];
const DISPLAYAS = ['TEXT','HTML'];
const BREAKDOWN_COL = 6;


const myClass={
    width:'5px',
    height:'15px',
}
class CampaignStatus extends React.Component {
    constructor(props) {
        super(props);
        var ts = new Date();
        this.state = {
            campaigns: [],
            displayAs:'TEXT',
            from: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            to:moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            activeCol:0,
            colName:'IVR CALLS',
            isLoading :false,
            campaigns:[],
            selected_campaign:[],
            DateError:'',
            isShow:false,
            date:moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            data:[],
        };
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
    }

    clickCol = (i,name) =>{
        if(this.state.display_as =='HTML') 
        this.setState({
            activeCol:i,
            colName:name,
        })
    }

    handleSubmit = () => {
        const {data,from,to,selected_campaign,campaigns,displayAs,isShow,isLoading,DateError,date} = this.state;
        var from_date = this.state.from.split(" ");
        var to_date = this.state.to.split(" ");
        const CL = campaigns.map((item,i)=>(item.campaign_id)).filter(Boolean);

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

            axios.post('api/campaign-status-list-report/',
            {
                startdate:from_date[0],
                enddate:to_date[0],
                starttime :from_date[1],
                endtime:to_date[1],
                selectedgroups : selected_campaign.indexOf('-ALL-')!='-1' ? CL:selected_campaign
            },requestOptions).then(response=>{  
                this.setState({
                    data : response.data.data.campaignlistnames,
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
                selected_campaign: this.state.selected_campaign.concat([response.data.data[1].campaign_id])
            })
            this.handleSubmit();
        }).catch(error =>{
            console.log(error);
        }) 

    }

    render() {
        const {isShow,from,to,activeCol,displayAs,colName,campaigns,selected_campaign,DateError,data,isLoading} = this.state;
    return (
        <div>
            <Helmet>
                <title>CampaignStatusListReport | Ytel</title>
            </Helmet>
            <ContainerHeader match={this.props.match} title='Campaign Status List Report'/>

            <div className="row">
                <CardBox styleName="col-lg-12" heading="Campaign Status List Report">
                    <form className="row" autoComplete="off">
                        <div className="col-lg-6 col-sm-6 col-12">

                            <FormControl className="w-100 mb-2">
                                <FormHelperText style={{"color":"red","fontSize":"14px"}}><strong>Warning:</strong> It’s recommended that this report be ran outside of normal business hours. This is to avoid disruption on your system's dialing functionality. </FormHelperText>
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
                                <FormHelperText>The date range for this report is limited to 60 days from today.</FormHelperText>
                            </FormControl>

                            <FormControl className="w-100 mb-2">
                                <p>To</p>
                                <DateTimePicker
                                    fullWidth
                                    value={to}
                                    format='YYYY-MM-DD HH:mm:ss'
                                    showTabs={false}
                                    onChange={this.handleToDateChange}
                                    leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                                    rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                                />
                                <FormHelperText>The date range for this report is limited to 60 days from today.</FormHelperText>
                            </FormControl>
                            
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
                            <CampaignMultidropdownList 
                                label={"Campaigns"} 
                                options={campaigns} 
                                default={"-ALL-"}
                                onChange={this.handleChange}
                                name={'selected_campaign'}
                                selectedValue={selected_campaign}
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
            
            <Card className="shadow border-0 bg-default text-black">
                {DateError?
                    <h3 style={{"color":"red","fontSize":"14px"}}>The date range for this report is limited to 60 days from today.</h3>:''}
                {isShow ? 
                <CardBody>
                
                
                {data.map((val,key)=>
                    <div key={key}>
                    <br/>
                    <h3 className="card-title">CAMPAIGN ID : {data[key].campaignid} </h3> 
                    
                    <Paper key={key}>
                    {
                        data[key]['listed'].map((v,k)=>
                        displayAs == 'TEXT' ?
                        data[key]['listed'][k].dispo!="" ?
                            <div className="table-responsive-material" key={k}>
                                <Table key={k}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell colSpan={4} style={{textAlign:'center'}}>
                                                {data[key]['listed'][k]['list']['list_id']+" - "+data[key]['listed'][k]['list']['list_name']}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>DISPOSITION	</TableCell>
                                            <TableCell>CALLS</TableCell>
                                            <TableCell>DURATION</TableCell>
                                            <TableCell>HANDLE TIME</TableCell>
                                        </TableRow>
                                        </TableHead>
                                    <TableBody>
                                            {Object.keys(data[key]['listed'][k].dispo).map((v1,k1)=>
                                                <TableRow key={k1}>
                                                    <TableCell>{v1 +" - "+ data[key]['listed'][k].dispo[v1][5]}	</TableCell>
                                                    <TableCell>{data[key]['listed'][k].dispo[v1][0]}</TableCell>
                                                    <TableCell>{data[key]['listed'][k].dispo[v1][3]} </TableCell>
                                                    <TableCell>{data[key]['listed'][k].dispo[v1][4]} </TableCell>
                                                </TableRow>
                                            )}
                                        <TableRow>
                                            <TableCell>Total </TableCell>
                                            <TableCell>{data[key]['listed'][k].totalmax.total_calls}	</TableCell>
                                            <TableCell>{data[key]['listed'][k].totalmax.total_duration}	</TableCell>
                                            <TableCell>{data[key]['listed'][k].totalmax.total_handle_time}	</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell colSpan={3} style={{textAlign:'center'}}>{data[key]['listed'][k]['list']['list_id']+" - "+data[key]['listed'][k]['list']['list_name']}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={3} style={{textAlign:'center'}}>Total Calls:{data[key]['listed'][k].totalmax.total_calls}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>STATUS FLAGS BREAKDOWN:		</TableCell>
                                            <TableCell colSpan={2}>(and % of total leads in the list)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Human Answer:	 </TableCell>
                                            <TableCell>{data[key]['listed'][k].statusflags.ha_count}</TableCell>
                                            <TableCell>{data[key]['listed'][k].statusflags.ha_percent} %</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Sale:	</TableCell>
                                            <TableCell>{data[key]['listed'][k].statusflags.sale_count}</TableCell>
                                            <TableCell>{data[key]['listed'][k].statusflags.sale_percent} %</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>DNC:		</TableCell>
                                            <TableCell>{data[key]['listed'][k].statusflags.dnc_count}</TableCell>
                                            <TableCell>{data[key]['listed'][k].statusflags.dnc_percent} %</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Customer Contact:			</TableCell>
                                            <TableCell>{data[key]['listed'][k].statusflags.cc_count}</TableCell>
                                            <TableCell>{data[key]['listed'][k].statusflags.cc_percent} %</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Not Interested:				</TableCell>
                                            <TableCell>{data[key]['listed'][k].statusflags.ni_count}</TableCell>
                                            <TableCell>{data[key]['listed'][k].statusflags.ni_percent} %</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Unworkable:					</TableCell>
                                            <TableCell>{data[key]['listed'][k].statusflags.uw_count}</TableCell>
                                            <TableCell>{data[key]['listed'][k].statusflags.uw_percent} %</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Scheduled callbk:</TableCell>
                                            <TableCell>{data[key]['listed'][k].statusflags.sc_count}</TableCell>
                                            <TableCell>{data[key]['listed'][k].statusflags.sc_percent} %</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Completed:	</TableCell>
                                            <TableCell>{data[key]['listed'][k].statusflags.comp_count}</TableCell>
                                            <TableCell>{data[key]['listed'][k].statusflags.comp_percent} %</TableCell>
                                        </TableRow>
                                    </TableBody>    
                                </Table>  
                                <br/>
                            </div> 
                        :
                            <div className="table-responsive-material" key={k}>
                                <br/>
                                <div><b>List ID {data[key]['listed'][k]['list']['list_id']+" - "+data[key]['listed'][k]['list']['list_name']}</b></div>
                                <div><b>***NO CALLS FOUND FROM {from} TO {to} ***</b></div>
                                <br/>
                            </div>
                        :
                            data[key]['listed'][k].dispo!="" ?
                                <CampaignStatusHtml 
                                    data={data[key]['listed'][k].dispo} 
                                    list_id={data[key]['listed'][k]['list']['list_id']}
                                    list_name={data[key]['listed'][k]['list']['list_name']}
                                    totalmax={data[key]['listed'][k].totalmax}
                                    displayAs={displayAs}
                                    key={k}
                                />
                            :
                            <div className="table-responsive-material">
                                <br/>
                                <div><b>List ID {data[key]['listed'][k]['list']['list_id']+" - "+data[key]['listed'][k]['list']['list_name']}</b></div>
                                <div><b>***NO CALLS FOUND FROM {from} TO {to} ***</b></div>
                                <br/>
                            </div>
                        )}
                    </Paper>
                    </div>
                    )}
                </CardBody>
                :""}
            </Card>

        </div>
    );
}
}


export default CampaignStatus;