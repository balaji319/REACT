import { React,Table,TableBody,TableCell,TableHead,TableRow,InfoCard,ContainerHeader,CardBox,Paper,Input,InputLabel,MenuItem,FormControl,FormHelperText,Select,Card,CardBody,CardSubtitle,CardText,cloneElement,Component,Button,moment} from './plugins';
import 'react-day-picker/lib/style.css';

import MultipeDropdown from '../../../common/MultipeDropdown';
import InboundGroupDropdown from '../common/InboundGroupDropdown';
import Dropdown from '../../../common/Dropdown';
import DateRange from '../../../common/DateRange';
import { dateValidation } from "../../../common/DateDiff";
import Helmet from "react-helmet";
import momentTimezone from "moment-timezone";
import TextTable from './TextTable';
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import CircularProgress from '@material-ui/core/CircularProgress';


const SHIFT = ['ALL','AM','PM'];
const DISPLAYAS = ['TEXT','HTML'];

const BREAKDOWN_COL = 6;
class FronterCloser extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            shift:'ALL',
            displayAs:'TEXT',
            inboundGroups : [],
            inound_group_list: [],
            activeCol:0,
            colName :'SUCCESS',
            cloName :'CALLS',
            from: momentTimezone.tz(moment(new Date()), "America/Los_Angeles").format("YYYY-MM-DD"),
            to: momentTimezone.tz(moment(new Date()), "America/Los_Angeles").format("YYYY-MM-DD"),
            flag: false,
            timeval: false,
            mydata: [],
            isLoading: false
        };
    }


    handleChange = (name,value) =>{
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

    clickCol = (i,name) =>{
        console.log(i)
        if(this.state.displayAs =='HTML') 
        this.setState({
            activeCol:i,
            colName:name,
        })
    }
    
    clickCol2 = (i,name) =>{
        console.log(i)
        if(this.state.displayAs =='HTML') 
        this.setState({
            activeCol2:i,
            cloName:name,
        })
    }
    
    componentDidMount() 
    {      
        this.setState({isLoading:true});
        const {inound_group_list} = this.state;
        var token = localStorage.getItem("access_token");
        
        const requestOptions = {headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+token ,}};
        
        axios.get('api/inbound_calls_report_groups_list/',requestOptions).then(response=>{  
            this.setState({
                inound_group_list: response.data.list,
                inboundGroups: response.data.list[0].group_id,
                //isLoading:false,
            })
            this.handleSubmit();
            console.log("Inbound Group List: ",response.data.list[0].group_id)
        }).catch(error =>{
            console.log(error);
        })
        
        
        
    }

    handleSubmit = () =>{
        console.log(this.state.inboundGroups);
        if(this.state.displayAs=='HTML'){
            this.setState({
                activeCol:1,
                activeCol2:1,
                isLoading: true,
                
            })
        }else{
             this.setState({
                activeCol:1,
                activeCol2:1,
                isLoading: true,
            })
        }
        
        const {from, to, shift, inboundGroups, displayAs} = this.state;
        var auth_token = localStorage.getItem("access_token");
        const date = moment(new Date()).format("YYYY-MM-DD");

        if (dateValidation(from, to, date, 2) == false) {
          this.setState({
            isLoading: false,
            timeval: true
          });
          console.log("Sorrry")
        }else {
            axios.post('api/fc_state_report/', {
                start_date: from,
                end_date: to,
                shift: shift,
                selected_groups: inboundGroups.split() ,
                report_display_type: displayAs,
            }, {headers: { 
                    'Content-Type': 'application/json' ,
                    'Authorization' : 'Bearer '+auth_token  ,

            }}).then(response => {
                this.setState({
                    mydata : response.data,
                    isLoading:false,
                    flag: true,
                    timeval: false
                })
                
                console.log("firstGroupOpetion", this.state.mydata.basicinfo.salescount[0].count)
            
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

    render() {
        const {isLoading, flag, cloName, mydata, timeval, from, to, inound_group_list, inboundGroups, activeCol, activeCol2, displayAs, colName, shift} = this.state;
    return (
        <div>
        
        <Helmet>
          <title>FCstates | Ytel</title>
        </Helmet>

            <ContainerHeader match={this.props.match} title='Fronter - Closer Report'/>

            <div className="row">
                <CardBox styleName="col-lg-12" heading="Fronter - Closer Report">
                    <form className="row" autoComplete="off">
                        <div className="col-lg-6 col-sm-6 col-12">

                            <DateRange 
                                onFromChange={this.handleFromChange} 
                                onToChange={this.handleToChange}
                                from={from}
                                to={to}
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

                            <Button color="primary" className="jr-btn bg-success text-white" onClick={this.handleSubmit}>Submit</Button>
                            <Button color="primary" className="jr-btn bg-success text-white" onClick={this.handleSubmit}>Download CSV</Button>
                        </div>

                    </form>
                </CardBox>
            </div>
            <div>
            {flag ?
              <Card className="shadow border-0 bg-default text-black">
                <CardBody>
                    <label>In-Group Fronter-Closer Stats Report :   {momentTimezone.tz(moment(new Date()), "America/Los_Angeles").format('YYYY-MM-DD HH:m:ss')}</label><br/>
                    <label className="card-title">TOTALS FOR - {from} 00:00:00 To {to} 23:59:59</label><br/>

                    <label className="card-title">STATUS CUSTOMERS :</label>



                    <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12" style={{textAlign:'center'}}>
                            <label>SALES: {mydata.basicinfo.salescount[0].count}</label>                    
                            <br/>
                            <h2>FRONTER STATS</h2>
                            <br/>
                        </div>
                    </div>                         
                    <Paper>
                    { displayAs == "TEXT" ? 
                        <TextTable displayAs={displayAs} mydata={mydata}/>
                        
                      : 
                      
                    <div className="table-responsive-material">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell onClick={()=>this.clickCol(1,'SUCCESS')}><span className="ancr-style">SUCCESS</span></TableCell>
                                    <TableCell onClick={()=>this.clickCol(2,'XFERS')}><span className="ancr-style">XFERS</span></TableCell>
                                    <TableCell onClick={()=>this.clickCol(3,'SUCCESS%')}><span className="ancr-style">SUCCESS%</span></TableCell>
                                    <TableCell onClick={()=>this.clickCol(4,'SALE')}><span className="ancr-style">SALE</span></TableCell>
                                    <TableCell onClick={()=>this.clickCol(5,'DROP')}><span className="ancr-style">DROP</span></TableCell>
                                    <TableCell onClick={()=>this.clickCol(6,'OTHER')}><span className="ancr-style">OTHER</span></TableCell>
                                </TableRow>
                                <TableRow>
                                   <TableCell>AGENT</TableCell>
                                   <TableCell colSpan={BREAKDOWN_COL}>{colName}</TableCell>
                               </TableRow>
                               { mydata.xfremInfo != "" ?
                                   [Object.keys(mydata.xfremInfo).map((key, val) =>
                                        <TableRow key={val}>
                                             <TableCell>{mydata.xfremInfo[key].user} - {mydata.xfremInfo[key].full_name}</TableCell>
                                             <TableCell className={activeCol!=0 && activeCol!=1?'hide-td':''} colSpan={activeCol==1?BREAKDOWN_COL:1} ><Progress percent={mydata.xfremInfo[key].sales}/></TableCell>
                                             <TableCell className={activeCol!=0 && activeCol!=2?'hide-td':''} colSpan={activeCol==2?BREAKDOWN_COL:1} ><Progress percent={mydata.xfremInfo[key].calls}/></TableCell>
                                             <TableCell className={activeCol!=0 && activeCol!=3?'hide-td':''} colSpan={activeCol==3?BREAKDOWN_COL:1} ><Progress percent={mydata.xfremInfo[key].salespercentage}/></TableCell>
                                             <TableCell className={activeCol!=0 && activeCol!=4?'hide-td':''} colSpan={activeCol==4?BREAKDOWN_COL:1} ><Progress percent={mydata.xfremInfo[key].a1}/></TableCell>
                                             <TableCell className={activeCol!=0 && activeCol!=5?'hide-td':''} colSpan={activeCol==5?BREAKDOWN_COL:1} ><Progress percent={mydata.xfremInfo[key].drop}/></TableCell>
                                             <TableCell className={activeCol!=0 && activeCol!=6?'hide-td':''} colSpan={activeCol==6?BREAKDOWN_COL:1} ><Progress percent={mydata.xfremInfo[key].other}/></TableCell>
                                        </TableRow>        
                                    ), <TableRow key={2}>
                                            <TableCell>TOTAL Fronters: {mydata.totalXfrem.totagents}</TableCell>
                                                <TableCell colSpan={BREAKDOWN_COL} >
                                                { activeCol == 1 ? mydata.totalXfrem.totsales 
                                                    : activeCol == 2 ? mydata.totalXfrem.totcalls 
                                                       : activeCol == 3 ? mydata.totalXfrem.totspct 
                                                           : activeCol == 4 ? mydata.totalXfrem.tot_a1 
                                                               : activeCol == 5 ? mydata.totalXfrem.tot_drop 
                                                                    : activeCol == 6 ? mydata.totalXfrem.tot_other 
                                                                        : ""
                                                }
                                                </TableCell>
                                            </TableRow> ]
                                : <TableRow>
                                        <TableCell>Total Fronters: 0</TableCell>
                                        <TableCell colSpan={5}>0</TableCell>
                                  </TableRow>
                                   
                               }
                            </TableHead>
                        </Table>
                    </div>
                    }
                    </Paper>
                    <br/>
                    <br/>
                    
                    <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12" style={{textAlign:'center'}}>
                            <h2>CLOSER STATS</h2>
                            <br/>
                        </div>
                    </div>                         
                    <Paper>
                        { displayAs == "TEXT" ? 
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell >AGENT</TableCell>
                                        <TableCell >CALLS</TableCell>
                                        <TableCell >SALE</TableCell>
                                        <TableCell >DROP</TableCell>
                                        <TableCell >OTHER</TableCell>
                                        <TableCell >SALE</TableCell>
                                        <TableCell >CONV%</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                { mydata.closorInfo != "" ?
                                    [Object.keys(mydata.closorInfo).map((key, val) =>
                                        <TableRow key={val}>
                                            <TableCell>{mydata.closorInfo[key].user} - {mydata.closorInfo[key].full_name}</TableCell>
                                            <TableCell>{mydata.closorInfo[key].calls}</TableCell>
                                            <TableCell>{mydata.closorInfo[key].a1}</TableCell>
                                            <TableCell>{mydata.closorInfo[key].drop}</TableCell>
                                            <TableCell>{mydata.closorInfo[key].other}</TableCell>
                                            <TableCell>{mydata.closorInfo[key].sales}</TableCell>
                                            <TableCell>{mydata.closorInfo[key].cpt}</TableCell>
                                        </TableRow>
                                    ),
                                    <TableRow key={2}>
                                        <TableCell>Total Fronters : {mydata.totalCloser.totagent}</TableCell>
                                        <TableCell>{mydata.totalCloser.totcalls}</TableCell>
                                        <TableCell>{mydata.totalCloser.tot_a1}</TableCell>
                                        <TableCell>{mydata.totalCloser.totdrop}</TableCell>
                                        <TableCell>{mydata.totalCloser.totother}</TableCell>
                                        <TableCell>{mydata.totalCloser.totsale}</TableCell>
                                        <TableCell>{mydata.totalCloser.totctp}</TableCell>
                                    </TableRow>]

                                    :   <TableRow key={1}>                                
                                            <TableCell>Total Closers : 0</TableCell>
                                            <TableCell>0</TableCell>
                                            <TableCell>0</TableCell>
                                            <TableCell>0</TableCell>
                                            <TableCell>0</TableCell>
                                            <TableCell>0</TableCell>
                                            <TableCell>0.00%</TableCell>  
                                        </TableRow> 
                                }
                                </TableBody>
                            </Table>
                        </div>
                        
                      : 
                      
                    <div className="table-responsive-material">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell onClick={()=>this.clickCol2(1,'CALLS')}><span className="ancr-style">CALLS</span></TableCell>
                                    <TableCell onClick={()=>this.clickCol2(2,'SALES')}><span className="ancr-style">SALES</span></TableCell>
                                    <TableCell onClick={()=>this.clickCol2(3,'DROP')}><span className="ancr-style">DROP</span></TableCell>
                                    <TableCell onClick={()=>this.clickCol2(4,'OTHER')}><span className="ancr-style">OTHER</span></TableCell>
                                    <TableCell onClick={()=>this.clickCol2(5,' SALES')}><span className="ancr-style">SALES</span></TableCell>
                                    <TableCell onClick={()=>this.clickCol2(6,'CONV %')}><span className="ancr-style">CONV %</span></TableCell>
                                </TableRow>
                                <TableRow>
                                   <TableCell>AGENT</TableCell>
                                   <TableCell colSpan={BREAKDOWN_COL}>{cloName}</TableCell>
                               </TableRow>
                               { mydata.closorInfo != "" ?
                                   [Object.keys(mydata.closorInfo).map((key, val) =>
                                        <TableRow key={val}>
                                             <TableCell>{mydata.closorInfo[key].user} - {mydata.closorInfo[key].full_name}</TableCell>
                                             <TableCell className={activeCol2!=0 && activeCol2!=1?'hide-td':''} colSpan={activeCol2==1?BREAKDOWN_COL:1} ><Progress percent={mydata.closorInfo[key].calls}/></TableCell>
                                             <TableCell className={activeCol2!=0 && activeCol2!=2?'hide-td':''} colSpan={activeCol2==2?BREAKDOWN_COL:1} ><Progress percent={mydata.closorInfo[key].a1}/></TableCell>
                                             <TableCell className={activeCol2!=0 && activeCol2!=3?'hide-td':''} colSpan={activeCol2==3?BREAKDOWN_COL:1} ><Progress percent={mydata.closorInfo[key].drop}/></TableCell>
                                             <TableCell className={activeCol2!=0 && activeCol2!=4?'hide-td':''} colSpan={activeCol2==4?BREAKDOWN_COL:1} ><Progress percent={mydata.closorInfo[key].other}/></TableCell>
                                             <TableCell className={activeCol2!=0 && activeCol2!=5?'hide-td':''} colSpan={activeCol2==5?BREAKDOWN_COL:1} ><Progress percent={mydata.closorInfo[key].sales}/></TableCell>
                                             <TableCell className={activeCol2!=0 && activeCol2!=6?'hide-td':''} colSpan={activeCol2==6?BREAKDOWN_COL:1} ><Progress percent={mydata.closorInfo[key].cpt}/></TableCell>
                                        </TableRow>        
                                    ), <TableRow key={2}>
                                            <TableCell>TOTAL Fronters: {mydata.totalCloser.totagent}</TableCell>
                                                <TableCell colSpan={BREAKDOWN_COL} >
                                                { activeCol2 == 1 ? mydata.totalCloser.totcalls 
                                                    : activeCol2 == 2 ? mydata.totalCloser.tot_a1 
                                                       : activeCol2 == 3 ? mydata.totalCloser.totdrop 
                                                           : activeCol2 == 4 ? mydata.totalCloser.totother 
                                                               : activeCol2 == 5 ? mydata.totalCloser.totsale 
                                                                    : activeCol2 == 6 ? mydata.totalCloser.totctp 
                                                                        : ""
                                                }
                                                </TableCell>
                                            </TableRow> ]
                                : <TableRow>
                                        <TableCell>Total Closers: 0</TableCell>
                                        <TableCell colSpan={5}>0</TableCell>
                                  </TableRow>
                                   
                               }
                            </TableHead>
                        </Table>
                    </div>
                    }
                    </Paper>
                    <br/>
                    <br/>
                </CardBody>
            </Card>: ""    
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
            </div>

        </div>
    );
}
}


export default FronterCloser;