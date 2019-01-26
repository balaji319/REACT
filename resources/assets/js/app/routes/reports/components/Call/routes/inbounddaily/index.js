import { React,Table,TableBody,TableCell,TableHead,TableRow,InfoCard,ContainerHeader,CardBox,Paper,Input,InputLabel,MenuItem,FormControl,FormHelperText,Select,Card,CardBody,CardSubtitle,CardText,cloneElement,Component,Button,moment} from './plugins';
import LinearProgress from '@material-ui/core/LinearProgress';
import MultipeDropdown from '../../../common/MultipeDropdown';
import InboundGroupMultidropDown from '../common/InboundGroupMultidropDown';
import Dropdown from '../../../common/Dropdown';
import DateRange from '../../../common/DateRange';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { dateValidation } from '../../../common/DateDiff';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import "react-sweet-progress/lib/style.css";
import CircularProgress from '@material-ui/core/CircularProgress';
import Helmet from "react-helmet";
import ProgressBar from '../common/ProgressBar';

const DISPLAYAS = ['TEXT','HTML'];
const BREAKDOWN_COL = 12;

class InboundDaily extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayAs:'TEXT',
            from: moment(new Date()).format('YYYY-MM-DD'),
            to: moment(new Date()).format('YYYY-MM-DD'),
            date: moment(new Date()).format('YYYY-MM-DD'),
            inboundGroups:[],
            inound_group_list:[],
            activeColDaily:0,
            activeColWeek:0,
            activeColMonth:0,
            activeColQuarter:0,
            colName :'',
            show_houly: false,
            show_disposition: false,
            ignore_hour: false,
            data :[],//DATA.data,
            isLoading:false,                                                                                                                                                                                                                                                                                                                
            isShow:false,
            html_weeks : [],
        };
        this.handleFromChange = this.handleFromChange.bind(this);
        this.handleToChange = this.handleToChange.bind(this);
    }

    handleFromChange = (fromDate) => {
        this.setState({ from : moment(fromDate).format('YYYY-MM-DD') });
    }

    handleToChange = (toDate) => {
        this.setState({ to:moment(toDate).format('YYYY-MM-DD')});
    }

    handleChange = (name,value) =>{
        this.setState({
            [name]:value,
        }) 
        if(name=='displayAs'){
            this.setState({
                activeColDaily:0,
                activeColWeek:0,
                activeColMonth:0,
                activeColQuarter:0,
            })
        }
        if(value=='HTML'){
            this.setState({
                activeColDaily:1,
                activeColWeek:1,
                activeColMonth:1,
                activeColQuarter:1,
            })
        }

    }


    handleChangeCheck = name => (event, checked) => {
        this.setState({[name]: checked});
    };

    clickCol = (i,name) =>{
        if(this.state.displayAs =='HTML') 
        {
            if(name == 'daily')this.setState({activeColDaily:i})
            if(name == 'week')this.setState({activeColWeek:i})
            if(name == 'month')this.setState({activeColMonth:i})
            if(name == 'quarter')this.setState({activeColQuarter:i})
        }

    }

    handleSubmit = () => {

        const {from,to,inboundGroups,displayAs,date,isShow,isLoading,DateError,show_houly,show_disposition,ignore_hour} = this.state;
        
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
                DateError : ''
            });
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

            axios.post('api/inbound-daily-report/',
            {
                "startdate":from,
                "enddate":to,
                "selectedgroups":inboundGroups,
                "display_type":displayAs,
                "hourlybreakdown":show_houly,
                "showdispositionstatus":show_disposition,
                "ignoreafterhours":ignore_hour,
                "groupText":inboundGroups.toString(),

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
                 inboundGroups: this.state.inboundGroups.concat([response.data.list[0].group_id]),
                 flag :true,
             })
             this.handleSubmit();
         }).catch(error =>{
             console.log(error);
         })
    
        //this.handleSubmit();
    }



    csvHandle = () => {
        const {from,to,inboundGroups,displayAs,date,isShow,isLoading,DateError,show_houly,show_disposition,ignore_hour} = this.state;
        
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
                DateError : ''
            });
            status = false;
        }

        if(status == false)
        {
            // this.setState({
            //     isLoading:true,
            // })

            var token = localStorage.getItem("access_token");
            const requestOptions = {
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization' : 'Bearer '+token ,
                }
            };

            // axios.post('api/inbound-daily-report/',
            // {
            //     "startdate":from,
            //     "enddate":to,
            //     "selectedgroups":inboundGroups,
            //     "display_type":displayAs,
            //     "hourlybreakdown":show_houly,
            //     "showdispositionstatus":show_disposition,
            //     "ignoreafterhours":ignore_hour,
            //     "groupText":inboundGroups.toString(),


            // },requestOptions).then(response=>{  
                // this.setState({
                //     data : response.data.data,
                //     isShow : true,
                //     isLoading:false,
                // })

                // window.open('api/csv_download?file_download=1', "_blank");
                window.open('api/csv-inbound-daily-report?startdate='+from+'&enddate='+to+'&selectedgroups='+inboundGroups+'&display_type='+displayAs+'&hourlybreakdown='+show_houly+'&showdispositionstatus='+show_disposition+'&ignoreafterhours='+ignore_hour+'&groupText='+inboundGroups.toString(), "_blank");
                

                // console.log(response.data.data);

            // }).catch(error =>{
            //     console.log(error);
            // })
        }

        
    }


    render() {
        const {isShow,isLoading,DateError,inound_group_list,data,from,to,activeCol,activeColDaily,activeColWeek,activeColMonth,activeColQuarter,displayAs,colName,inboundGroups} = this.state;
    return (
        <div>
            <Helmet>
                <title>InboundDailyReport | Ytel</title>
            </Helmet>
            <ContainerHeader match={this.props.match} title='Inbound Daily Report'/>
            <div className="row">
                <CardBox styleName="col-lg-12" heading="Inbound Daily Report">
                    <form className="row" autoComplete="off">
                        <div className="col-lg-6 col-sm-6 col-12">

                            <DateRange 
                                onFromChange={this.handleFromChange} 
                                onToChange={this.handleToChange}
                                from={from}
                                to={to}
                            />
                            {DateError?
                                    <p style={{"color":"red","fontSize":"14px"}}>The date range for this report is limited to 60 days from today.</p>:''}


                            <Dropdown 
                                label={"Display As"} 
                                onChange={this.handleChange}
                                name={'displayAs'}
                                selectedValue={displayAs}
                                data={DISPLAYAS}
                            />

                            <FormGroup>
                                <FormControlLabel
                                    control={
                                        <Checkbox color="primary"
                                                  checked={this.state.show_houly}
                                                  onChange={this.handleChangeCheck('show_houly')}
                                                  value="show_houly"
                                        />
                                    }
                                    label="Show hourly results"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox color="primary"
                                                  checked={this.state.show_disposition}
                                                  onChange={this.handleChangeCheck('show_disposition')}
                                                  value="show_disposition"
                                        />
                                    }
                                    label="Show Disposition Statuses"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox color="primary"
                                                  checked={this.state.ignore_hour}
                                                  onChange={this.handleChangeCheck('ignore_hour')}
                                                  value="ignore_hour"
                                        />
                                    }
                                    label=" Ignore after-hours calls"
                                />
                            </FormGroup>

                            <Button color="primary" className="jr-btn bg-success text-white" onClick={this.handleSubmit}>
                                Submit
                            </Button>
      
                            <a color="primary" className="jr-btn bg-success text-white" href='http://127.0.0.1:8000/api/csv_download?file_download=1'>CSV Download Without Authorization</a>
                            <a color="primary" className="jr-btn bg-success text-white" onClick={this.csvHandle}>CSV Download</a>
                            {/* <a color="primary" className="jr-btn bg-success text-white" onClick={this.csvHandle}>CSV Download</a>
                                <Button color="primary" className="jr-btn bg-success text-white">
                                CSV Download
                            </Button> */}
                        </div>
                        <div className="col-lg-6 col-sm-6 col-12">
                            <InboundGroupMultidropDown 
                                label={"Inbound Groups"} 
                                default ={"-ALL-"}
                                options={inound_group_list} 
                                onChange={this.handleChange}
                                name={'inboundGroups'}
                                selectedValue={inboundGroups}
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
            
            {isShow ? 
            <Card className="shadow border-0 bg-default text-black">
                <CardBody>
                    <span><label className="card-title">Inbound Daily Report:</label>&nbsp;&nbsp;{inboundGroups.join(' | ')} &nbsp;&nbsp;|&nbsp;&nbsp;  {moment(new Date()).format('YYYY-MM-DD HH:MM:SS')}</span>
                    <h3 className="card-title">Time range: {from} 00:00:00 To {to} 11:59:59</h3>
                    <label>Selected in-groups: {this.state.name}</label>
                    <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12">
                            <label></label>
                        </div>
                    </div> 
                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                <TableRow>
                                    {Object.keys(data.header_array).map((val,key) =>
                                        <TableCell key={key} onClick={()=>this.clickCol(key,'daily')}>{data.header_array[val]}</TableCell>
                                    )}
                                </TableRow>
                                </TableHead>
                                <TableBody>
                                    
                                    {Object.keys(data.hour_array).map((val,key) =>
                                        
                                        <TableRow key={key}>
                                            {Object.keys(data.hour_array[val]).map((v,k)=>

                                                k == 0 ? <TableCell >{data.hour_array[val][v]}</TableCell> :

                                            <TableCell key={k} className={activeColDaily!=0 && activeColDaily!=k?'hide-td':''} colSpan={activeColDaily==k?BREAKDOWN_COL:1}> 
                                                {activeColDaily==k?
                                                    <ProgressBar 
                                                        title={data.hour_array[val][v]}
                                                        data={data.multihrlyhtml[val][v]}
                                                        text={data.hour_array[val][v]}
                                                    />
                                                    // <LinearProgress color="primary" variant="determinate" value={data.multihrlyhtml[val][v]} className="progressbar-height"/> 
                                                    : 
                                                    data.hour_array[val][v]
                                                }
                                            
                                            </TableCell>
                                            )}
                                        </TableRow>
                                        
                                    )}
                                    <TableRow >
                                        <TableCell>TOTAL</TableCell>
                                        {Object.keys(data.total_arry[0]).map((val,key) =>
                                            <TableCell key={key} className={activeColDaily!=0 && activeColDaily!=key+1?'hide-td':''} colSpan={activeColDaily==key+1?BREAKDOWN_COL:1} >{data.total_arry[0][val]} </TableCell>
                                        )}
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                    <br/>
                    <br/>   

                    <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12">
                            <label>WEEK-TO-DATE RPT - {from} 00:00:00 to {to} 23:59:59</label>
                            
                        </div>
                    </div> 
                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {Object.keys(data.header_array).map((val,key) =>
                                            <TableCell key={key} onClick={()=>this.clickCol(key,'week')}>{data.header_array[val]}</TableCell>
                                        )}
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {Object.keys(data.weekly_array).map((val,key) =>

                                        <TableRow key={key}>
                                            {Object.keys(data.weekly_array[val]).map((v,k)=>
                                            
                                            k == 0 ? <TableCell >{data.weekly_array[val][v]}</TableCell> :


                                            <TableCell key={k} className={activeColWeek!=0 && activeColWeek!=k?'hide-td':''} colSpan={activeColWeek==k?BREAKDOWN_COL:1}> 
                                                {activeColWeek==k?
                                                    <ProgressBar 
                                                        title={data.weekly_array[val][v]}
                                                        data={data.multiweeklyhtml[val][v]}
                                                        text={data.weekly_array[val][v]}
                                                    />
                                                    // <LinearProgress color="primary" variant="determinate" value={data.multiweeklyhtml[val][v]} className="progressbar-height"/> 
                                                    :
                                                    data.weekly_array[val][v]}
                                            </TableCell>
                                            )}
                                        </TableRow>
                                    )}

                                    <TableRow>
                                        <TableCell >TOTAL</TableCell>
                                        {Object.keys(data.total_arry[0]).map((val,key) =>
                                            <TableCell key={key} className={activeColWeek!=0 && activeColWeek!=key+1?'hide-td':''} colSpan={activeColWeek==key+1?BREAKDOWN_COL:1} >{data.total_arry[0][val]} </TableCell>
                                        )}
                                    </TableRow>
                                </TableBody>
                                
                            </Table>
                        </div>
                    </Paper>
                    <br/>
                    <br/>   

                    <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12">
                            <label>MONTH-TO-DATE RPT - {from} 00:00:00 to {to} 23:59:59</label>
                            
                        </div>
                    </div> 
                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {Object.keys(data.header_array).map((val,key) =>
                                            <TableCell key={key} onClick={()=>this.clickCol(key,'month')}>{data.header_array[val]}</TableCell>
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.keys(data.mnthly_array).map((val,key) =>

                                        <TableRow key={key}>
                                            {Object.keys(data.mnthly_array[val]).map((v,k)=>
                                            
                                            k == 0 ? <TableCell >{data.mnthly_array[val][v]}</TableCell> :

                                            <TableCell key={k} className={activeColMonth!=0 && activeColMonth!=k?'hide-td':''} colSpan={activeColMonth==k?BREAKDOWN_COL:1}> 
                                                {activeColMonth==k?
                                                    <ProgressBar 
                                                        title={data.multimtdhtml[val][v]}
                                                        data={data.multimtdhtml[val][v]}
                                                        text={data.weekly_array[val][v]}
                                                    />
                                                // <LinearProgress color="primary" variant="determinate" value={data.multimtdhtml[val][v]} className="progressbar-height" /> 
                                                :
                                                data.mnthly_array[val][v]
                                                }
                                            </TableCell>
                                            )}
                                        </TableRow>
                                    )}
                                    <TableRow>
                                        <TableCell >TOTAL</TableCell>
                                        {Object.keys(data.total_arry[0]).map((val,key) =>
                                            <TableCell key={key} className={activeColMonth!=0 && activeColMonth!=key+1?'hide-td':''} colSpan={activeColMonth==key+1?BREAKDOWN_COL:1} colSpan={activeColMonth==1?BREAKDOWN_COL:1} >{data.total_arry[0][val]} </TableCell>
                                        )}
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                    <br/>
                    <br/>
                    <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12">
                            <label>QUARTER-TO-DATE RPT - {from} 00:00:00 to {to} 23:59:59</label>
                            
                        </div>
                    </div> 
                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {Object.keys(data.header_array).map((val,key) =>
                                            <TableCell key={key} onClick={()=>this.clickCol(key,'quarter')}>{data.header_array[val]}</TableCell>
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>

                                    {Object.keys(data.qutrly_array).map((val,key) =>
                                        <TableRow key={key}>
                                            {Object.keys(data.qutrly_array[val]).map((v,k)=>
                                            k == 0 ? <TableCell >{data.qutrly_array[val][v]}</TableCell> :

                                            <TableCell key={k} className={activeColQuarter!=0 && activeColQuarter!=k?'hide-td':''} colSpan={activeColQuarter==k?BREAKDOWN_COL:1}> 
                                                {activeColQuarter==k?
                                                <ProgressBar 
                                                    title={data.qutrly_array[val][v]}
                                                    data={data.multiqtdhtml[val][v]}
                                                    text={data.qutrly_array[val][v]}
                                                />
                                                // <LinearProgress color="primary" variant="determinate" value={data.multiqtdhtml[val][v]} className="progressbar-height" /> 
                                                :data.qutrly_array[val][v]}
                                            </TableCell>
                                            )}
                                        </TableRow>
                                    )}
                                    <TableRow>
                                        <TableCell >TOTAL</TableCell>
                                        {Object.keys(data.total_arry[0]).map((val,key) =>
                                        
                                        <TableCell key={key} className={activeColQuarter!=0 && activeColQuarter!=key+1?'hide-td':''} colSpan={activeColQuarter==key+1?BREAKDOWN_COL:1} colSpan={activeColQuarter==1?BREAKDOWN_COL:1} >{data.total_arry[0][val]} </TableCell>

                                        )}
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


export default InboundDaily;