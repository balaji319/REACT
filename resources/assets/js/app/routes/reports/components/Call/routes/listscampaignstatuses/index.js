import { React,Table,TableBody,TableCell,TableHead,TableRow,InfoCard,ContainerHeader,
        CardBox,Paper,Input,InputLabel,MenuItem,FormControl,
    FormHelperText,Select,Card,CardBody,CardSubtitle,CardText,DayPickerInput,Button,Helmet,moment,cloneElement, Component,formatDate, parseDate  } from './plugins';
import LinearProgress from '@material-ui/core/LinearProgress';
import 'react-day-picker/lib/style.css';
import momentTimezone from "moment-timezone";
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
import TextTable from './TextTable';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import MultipeDropdown from '../../../common/MultipeDropdown';
import MultipleDropdownCampaigns from '../common/MultipleDropdownCampaigns';
import Dropdown from '../../../common/Dropdown';
const DISPLAYAS = ['TEXT','HTML'];


const BREAKDOWN_COL = 10;
class CampaignStatuses extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            displayAs:'TEXT',
            activeCol:1,
            colName :'',
            campaignList: [],
            campaignsGroups:['ALL'],
            mydata: [], 
            flag: false,
            isLoading: false
        };
    }

    handleChange = (name,value) =>{
        this.setState({
            [name]:value,
        })
        
    }
    
    setSelectOptions = (name,value) =>{
        this.setState({
            [name]:value,
        })  
    }
    
    clickCol = (i,name) =>{
        console.log(i)
        this.setState({
            activeCol:i,
            colName:name,
        })
    }

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
                campaignList: response.data.data,
                isLoading :false,
            })
            this.handleSubmit();
        }).catch(error =>{
            console.log(error);
        }) 
        
    }
    
    
 handleSubmit = () =>{                   
        const {campaignsGroups, displayAs} = this.state;
        var auth_token = localStorage.getItem("access_token");

        this.setState({isLoading:true, open: true, flag: false });
        
        const date = moment(new Date()).format('YYYY-MM-DD');
           axios.post('api/list_campaign_states_report/', {
            display_type: displayAs.toLowerCase(),
            selected_groups: campaignsGroups,
        }, {headers: { 
        	'Content-Type': 'application/json' ,
        	'Authorization' : 'Bearer '+auth_token  ,

        }}).then(response => {
            this.setState({
                mydata : response.data,
                isLoading:false,
                flag: true,
            })
            
        }).catch(error => {
            console.log(error);
            this.setState({                   
                isLoading:false,
            })
        })  
        
    }

    render() {
        const {isLoading, flag, mydata, campaignList, campaignsGroups, activeCol, displayAs, colName, campaigns} = this.state;

    return (
        <div>
            <Helmet>
                <title>ListsCampaignStatusesReport | Ytel</title>
            </Helmet>
    
            <ContainerHeader match={this.props.match} title='Lists Campaign Statuses Report'/>

            <div className="row">
                <CardBox styleName="col-lg-12" heading={""}>
                    <form className="row" autoComplete="off">
                        <div className="col-lg-6 col-sm-6 col-12">

                         <MultipleDropdownCampaigns 
                                    label={"Campaigns Groups"} 
                                    options={campaignList} 
                                    onChange={this.setSelectOptions}
                                    name={'campaignsGroups'}
                                    selectedValue={campaignsGroups}
                                    default={'ALL'}
                                />

                            <Dropdown 
                                label={"Display As"} 
                                onChange={this.handleChange}
                                name={'displayAs'}
                                selectedValue={displayAs}
                                data={DISPLAYAS}
                            />

                            <Button color="primary" className="jr-btn bg-success text-white" onClick={this.handleSubmit}>Submit</Button>
                        </div>
                    </form>
                </CardBox>
            </div>

            <Card className="shadow border-0 bg-default text-black">
            {flag ?
                <CardBody>
                    <span>Lists Campaign Status Stats</span>
                    <span className="pull-right">{momentTimezone.tz(moment(new Date()), "America/Los_Angeles").format("YYYY-MM-DD HH:MM:SS")}</span>
                    <br/>
  
                    <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12" style={{textAlign:'center'}}>
                            <h2>LIST ID SUMMARY</h2>
                            <button type="button" className="btn btn-raised btn-sm pull-right btn-success">CSV Download</button>
                        </div>
                    </div> 
                    <br/>
                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>LIST	</TableCell>
                                        <TableCell>LEADS</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                {Object.keys(mydata.list_id_summery).map((key, val) =>
                                    <TableRow key={val}>
                                        <TableCell className="custom-td-width">{mydata.list_id_summery[key].lead}</TableCell>
                                        {displayAs == "TEXT" ? 
                                        <TableCell>{mydata.list_id_summery[key].list}</TableCell>
                                        :
                                        <TableCell><Progress 
                                                percent={mydata.list_id_summery[key].list} 
                                                theme={{active: { symbol: mydata.list_id_summery[key].list , color: '#0086e3' },
                                                        success: { symbol: mydata.list_id_summery[key].list , color: '#0086e3' },
                                                        default: { symbol: mydata.list_id_summery[key].list , color: '#0086e3' },
                                                    }}
                                            />
                                        </TableCell>}
                                    </TableRow>
                                )                                    
                                }
                                <TableRow>
                                    <TableCell>Total</TableCell>
                                    <TableCell>{mydata.total_leadss}</TableCell>
                                </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                    <br/>
                    <br/>

                    <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12" style={{textAlign:'center'}}>
                            <label>STATUS FLAG SUMMARY(and % of leads in selected lists)CSV Download</label>
                            <button type="button" className="btn btn-raised btn-sm pull-right btn-success">CSV Download</button>
                        </div>
                    </div>                 
                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>LIST	</TableCell>
                                        <TableCell>LEADS</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                {Object.keys(mydata.status_flage_count_graph).map((key, val) =>
                                    <TableRow key={val}>
                                        <TableCell className="custom-td-width">{mydata.status_flage_count_graph[key].key}</TableCell>
                                        {displayAs == "TEXT" ? 
                                        <TableCell>{mydata.status_flage_count_graph[key].value}</TableCell>
                                        :
                                        <TableCell><Progress 
                                                percent={mydata.status_flage_count_graph[key].value.split("(")[1].split("%")[0]} 
                                                theme={{active: { symbol: mydata.status_flage_count_graph[key].value , color: '#0086e3' },
                                                        success: { symbol: mydata.status_flage_count_graph[key].value , color: '#0086e3' },
                                                        default: { symbol: mydata.status_flage_count_graph[key].value , color: '#0086e3' },
                                                    }}
                                            />
                                        </TableCell>}
                                    </TableRow>
                                )
                                    
                                }
                                <TableRow>
                                    <TableCell>Total</TableCell>
                                    <TableCell>{mydata.total_status}</TableCell>
                                </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                    <br/>
                    <br/>

                    <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12" style={{textAlign:'center'}}>
                            <h1>CUSTOM STATUS CATEGORY STATS</h1>
                            <button type="button" className="btn btn-raised btn-sm pull-right btn-success">CSV Download</button>
                        </div>
                    </div>                 
                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>CATEGORY</TableCell>
                                        <TableCell>CALLS</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                {Object.keys(mydata.category_state).map((key, val) =>
                                    <TableRow key={val}>
                                        <TableCell className="custom-td-width">{mydata.category_state[key].category}</TableCell>
                                        {displayAs == "TEXT" ? 
                                        <TableCell>{mydata.category_state[key].count}</TableCell>
                                        :
                                        <TableCell><Progress 
                                                percent={mydata.category_state[key].count} 
                                                theme={{active: { symbol: mydata.category_state[key].count , color: '#0086e3' },
                                                        success: { symbol: mydata.category_state[key].count , color: '#0086e3' },
                                                        default: { symbol: mydata.category_state[key].count , color: '#0086e3' },
                                                    }}
                                            />
                                        </TableCell>}
                                    </TableRow>
                                )
                                    
                                }
                                <TableRow>
                                    <TableCell>Total</TableCell>
                                    <TableCell>{mydata.category_max_call}</TableCell>
                                </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                    <br/>
                    <br/>
                    
    
                    <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12" style={{textAlign:'center'}}>
                            <h1>PER LIST DETAIL STATS</h1>
                            <button type="button" className="btn btn-raised btn-sm pull-right btn-success">CSV Download</button>
                        </div>
                    </div>                 
                    <Paper>
                    { displayAs == "TEXT" ? <TextTable displayAs={displayAs} mydata={mydata}/> 
                        : displayAs == "HTML" ?  
                        
                             <div className="table-responsive-material">
                                <Table>
                                    <TableHead>
                                    {Object.keys(mydata.seperate_list_graph).map((key, val) =>
                                        [<TableRow key={val}>
                                            <TableCell colSpan={2} className="text-center"><h3>{mydata.seperate_list_graph[key].listheading} Total Leads: {mydata.seperate_list_graph[key].totallist}</h3></TableCell>
                                        </TableRow>,
                                        <TableRow key={Math.random()}>
                                            <TableCell onClick={()=>this.clickCol(1,'STATUS FLAG BREAKDOWN')}><span className="ancr-style">STATUS FLAG BREAKDOWN</span></TableCell>
                                            <TableCell onClick={()=>this.clickCol(2,'STATUS BREAKDOWN')}><span className="ancr-style">STATUS BREAKDOWN</span></TableCell>
                                        </TableRow>,
                                        activeCol == 1 ?
                                        [<TableRow key={Math.random()}>                                            
                                            <TableCell><b>{mydata.seperate_list_graph[key].header_1_array[0]}</b></TableCell>
                                            <TableCell><b>{mydata.seperate_list_graph[key].header_1_array[1]}</b></TableCell>                                            
                                        </TableRow>,
                                         <TableRow key={Math.random()}>                            
                                            <TableCell>{mydata.seperate_list_graph[key].human_answer[0]}</TableCell>
                                            <TableCell>                                                
                                                <Progress 
                                                percent={mydata.seperate_list_graph[key].human_answer[1].split("(")[1].split("%")[0]} 
                                                theme={{active: { symbol: mydata.seperate_list_graph[key].human_answer[1] , color: '#0086e3' },
                                                        success: { symbol: mydata.seperate_list_graph[key].human_answer[1] , color: '#0086e3' },
                                                        default: { symbol: mydata.seperate_list_graph[key].human_answer[1] , color: '#0086e3' },
                                                    }}
                                                />                                                
                                            </TableCell>
                                          </TableRow>,
                                          <TableRow key={Math.random()}>                            
                                            <TableCell>{mydata.seperate_list_graph[key].sale[0]}</TableCell>
                                            <TableCell>
                                                <Progress 
                                                percent={mydata.seperate_list_graph[key].sale[1].split("(")[1].split("%")[0]} 
                                                theme={{active: { symbol: mydata.seperate_list_graph[key].sale[1] , color: '#0086e3' },
                                                        success: { symbol: mydata.seperate_list_graph[key].sale[1] , color: '#0086e3' },
                                                        default: { symbol: mydata.seperate_list_graph[key].sale[1] , color: '#0086e3' },
                                                    }}
                                                /> 
                                            </TableCell>
                                          </TableRow>,
                                          <TableRow key={Math.random()}>                            
                                            <TableCell>{mydata.seperate_list_graph[key].dnc[0]}</TableCell>
                                            <TableCell>
                                                <Progress 
                                                percent={mydata.seperate_list_graph[key].dnc[1].split("(")[1].split("%")[0]} 
                                                theme={{active: { symbol: mydata.seperate_list_graph[key].dnc[1] , color: '#0086e3' },
                                                        success: { symbol: mydata.seperate_list_graph[key].dnc[1] , color: '#0086e3' },
                                                        default: { symbol: mydata.seperate_list_graph[key].dnc[1] , color: '#0086e3' },
                                                    }}
                                                /> 
                                            </TableCell>
                                          </TableRow>,
                                          <TableRow key={Math.random()}>                            
                                            <TableCell>{mydata.seperate_list_graph[key].customer_contact[0]}</TableCell>
                                            <TableCell>
                                                <Progress 
                                                percent={mydata.seperate_list_graph[key].customer_contact[1].split("(")[1].split("%")[0]} 
                                                theme={{active: { symbol: mydata.seperate_list_graph[key].customer_contact[1] , color: '#0086e3' },
                                                        success: { symbol: mydata.seperate_list_graph[key].customer_contact[1] , color: '#0086e3' },
                                                        default: { symbol: mydata.seperate_list_graph[key].customer_contact[1] , color: '#0086e3' },
                                                    }}
                                                /> 
                                            </TableCell>
                                          </TableRow>,
                                          <TableRow key={Math.random()}>                            
                                            <TableCell>{mydata.seperate_list_graph[key].not_interested[0]}</TableCell>                                    
                                            <TableCell>
                                                <Progress 
                                                percent={mydata.seperate_list_graph[key].not_interested[1].split("(")[1].split("%")[0]} 
                                                theme={{active: { symbol: mydata.seperate_list_graph[key].not_interested[1] , color: '#0086e3' },
                                                        success: { symbol: mydata.seperate_list_graph[key].not_interested[1] , color: '#0086e3' },
                                                        default: { symbol: mydata.seperate_list_graph[key].not_interested[1] , color: '#0086e3' },
                                                    }}
                                                /> 
                                            </TableCell>
                                          </TableRow>,
                                          <TableRow key={Math.random()}>                            
                                            <TableCell>{mydata.seperate_list_graph[key].unworkable[0]}</TableCell>
                                            <TableCell>
                                                <Progress 
                                                percent={mydata.seperate_list_graph[key].unworkable[1].split("(")[1].split("%")[0]} 
                                                theme={{active: { symbol: mydata.seperate_list_graph[key].unworkable[1] , color: '#0086e3' },
                                                        success: { symbol: mydata.seperate_list_graph[key].unworkable[1] , color: '#0086e3' },
                                                        default: { symbol: mydata.seperate_list_graph[key].unworkable[1] , color: '#0086e3' },
                                                    }}
                                                /> 
                                            </TableCell>
                                          </TableRow>,
                                          <TableRow key={Math.random()}>                            
                                            <TableCell>{mydata.seperate_list_graph[key].scheduled_callbacks[0]}</TableCell>
                                            <TableCell>
                                                <Progress 
                                                percent={mydata.seperate_list_graph[key].scheduled_callbacks[1].split("(")[1].split("%")[0]} 
                                                theme={{active: { symbol: mydata.seperate_list_graph[key].scheduled_callbacks[1] , color: '#0086e3' },
                                                        success: { symbol: mydata.seperate_list_graph[key].scheduled_callbacks[1] , color: '#0086e3' },
                                                        default: { symbol: mydata.seperate_list_graph[key].scheduled_callbacks[1] , color: '#0086e3' },
                                                    }}
                                                /> 
                                            </TableCell>
                                          </TableRow>,
                                          <TableRow key={Math.random()}>                            
                                            <TableCell>{mydata.seperate_list_graph[key].completed[0]}</TableCell>
                                             <TableCell>
                                                <Progress 
                                                percent={mydata.seperate_list_graph[key].completed[1].split("(")[1].split("%")[0]} 
                                                theme={{active: { symbol: mydata.seperate_list_graph[key].completed[1] , color: '#0086e3' },
                                                        success: { symbol: mydata.seperate_list_graph[key].completed[1] , color: '#0086e3' },
                                                        default: { symbol: mydata.seperate_list_graph[key].completed[1] , color: '#0086e3' },
                                                    }}
                                                /> 
                                            </TableCell>
                                          </TableRow>,
                                        ]
                                        
                                    :
                                        [<TableRow key={Math.random()}>  
                                            <TableCell><b>{mydata.seperate_list_graph[key].header_2_array[0]}</b></TableCell>
                                            <TableCell><b>{mydata.seperate_list_graph[key].header_2_array[1]}</b></TableCell>                                            
                                        </TableRow>,
                                        Object.keys(mydata.seperate_list_graph[key].header_2_data).map((i, k) =>
                                        <TableRow key={Math.random()}>                            
                                            <TableCell>{mydata.seperate_list_graph[key].header_2_data[i][0]}</TableCell>
                                            <TableCell>
                                                <Progress 
                                                percent={mydata.seperate_list_graph[key].header_2_data[i][1]} 
                                                theme={{active: { symbol: mydata.seperate_list_graph[key].header_2_data[i][1] , color: '#0086e3' },
                                                        success: { symbol: mydata.seperate_list_graph[key].header_2_data[i][1] , color: '#0086e3' },
                                                        default: { symbol: mydata.seperate_list_graph[key].header_2_data[i][1] , color: '#0086e3' },
                                                    }}
                                                /> 
                                            </TableCell>
                                        </TableRow>       
                                        ),
                                        <TableRow key={Math.random()}>                            
                                            <TableCell><b>{mydata.seperate_list_graph[key].final_total[0]}</b></TableCell>
                                            <TableCell><b>{mydata.seperate_list_graph[key].final_total[1]}</b></TableCell>
                                        </TableRow>,
                                        ]
                                    ]
                                    )}                                        
                                    </TableHead>
                                    
                                </Table>
                            </div>  
                        : ""
                    }
                        
                    </Paper>
                    <br/>
                    <br/>
    
                </CardBody>
                :<CardBody>
                    <h1 className="text-center">PLEASE SELECT A CAMPAIGN ABOVE AND CLICK SUBMIT!</h1>
                </CardBody>
            }
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

export default CampaignStatuses;