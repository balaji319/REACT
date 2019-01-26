import { React,Table,TableBody,TableCell,TableHead,TableRow,InfoCard,ContainerHeader,
        CardBox,Paper,Input,InputLabel,MenuItem,FormControl,
    FormHelperText,Select,Card,CardBody,CardSubtitle,CardText  } from './plugins';
import CircularProgress from '@material-ui/core/CircularProgress';
import { time  } from './time';
import Helmet from "react-helmet";

class List extends React.Component {

    state = {
        type: 'ALL',
        setTime : 10000,
        data:[],
        flag:false,
        isLoading : false,
        intervalId:'',

    };

   
    componentDidMount() {
         const {setTime} =this.state;
         var intervalId = setInterval(() => this.handleSubmit(),setTime);
         this.setState({intervalId: intervalId});
    }


    handleChange = name => event => {
        this.setState({[name]: event.target.value});
    
        this.handleSubmit();

    };

    handleSubmit = () =>{
        const {type,setTime} = this.state;
        this.setState({isLoading:true});

        setTimeout(() => {this.setState({isLoading: false})}, 2000);
        
        var token = localStorage.getItem("access_token");
        const requestOptions = {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer '+token ,
            }
            
        };

        axios.post('api/campaign_summary/',{
            filter:type,
        },requestOptions).then(response=>{            
            this.setState({
                data: response.data.user_data,
                flag :true,
                isLoading:false,
            })

        }).catch(error =>{
            console.log(error);
        })
    }

    componentWillUnmount = () => {

        clearInterval(this.state.intervalId);
    }

    render() {
        const {data,isLoading} = this.state;
    return (
        <div>
            <Helmet>
                <title>DashboardSummary | Ytel</title>
            </Helmet>
        
        <div className="row">
            <CardBox styleName="col-lg-12" heading="Real-Time Campaign Summary">
                <form className="row" autoComplete="off">
                    <div className="col-lg-3 col-sm-6 col-12">
                        <FormControl className="w-100 mb-2">
                            <InputLabel htmlFor="age-simple"></InputLabel>
                            <Select
                                value={this.state.type}
                                onChange={this.handleChange('type')}
                                input={<Input id="age-simple"/>}
                            >
                                <MenuItem value="ALL">SHOW ALL CAMPAIGN</MenuItem>
                                <MenuItem value="AUTO-DIAL">AUTO-DIAL ONLY</MenuItem>
                                <MenuItem value="MANUAL">SHOW MANUAL ONLY</MenuItem>
                                <MenuItem value="INBOUND">INBOUND ONLY</MenuItem>
                            </Select>
                        </FormControl>
                    </div>

                    <div className="col-lg-3 col-sm-6 col-12">

                        <FormControl className="w-100 mb-2">
                            <InputLabel htmlFor="age-helper"></InputLabel>
                            <Select
                                value={this.state.setTime}
                                onChange={this.handleChange('setTime')}
                                input={<Input id="age-helper"/>}
                            >
                                <MenuItem value={10000}>Screen Refresh (default 10 sec)</MenuItem>
                                {time.map(n => (
                                    <MenuItem key={n.id} value={n.id}>{n.value}</MenuItem>
                                ))
                                }
                            </Select>
                        </FormControl>
                    </div>
                    {
                        isLoading &&
                        <div className="loader-view">
                            <CircularProgress/>
                        </div>
                    }
                </form>
            </CardBox>
        </div>
        

        {data.map((n,i)=>(
        <div key={i}>
        <Paper >
            <div className="table-responsive-material">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell colSpan={4}>Campaign Id : {n.campaign_id} </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow key={1}>
                            <TableCell>DIAL LEVEL : {n.campaign_stat.dial_level}</TableCell>
                            <TableCell>TRUNK SHORT/FILL : {n.campaign_stat.balance_trunk_fill}</TableCell>
                            <TableCell>FILTER : {n.campaign_stat.dial_filter}</TableCell>
                            <TableCell>TIME : {n.campaign_stat.now_time.date}</TableCell>
                        </TableRow>
                        <TableRow key={2}>
                            <TableCell>DIALABLE LEADS : {n.campaign_stat.dial_leads}</TableCell>
                            <TableCell> CALLS TODAY : {n.campaign_stat.calls_today}</TableCell>
                            <TableCell> AVG AGENTS : {n.campaign_stat.agents_average_onemin}</TableCell>
                            <TableCell> DIAL METHOD :{n.campaign_stat.dial_method}</TableCell>
                        </TableRow>
                        <TableRow key={3}>
                            <TableCell> HOPPER LEVEL : {n.campaign_stat.hopper_level}</TableCell>
                            <TableCell>  DROPPED / ANSWERED : {n.campaign_stat.drops_today} / {n.campaign_stat.answers_today}</TableCell>
                            <TableCell>  DL DIFF : {n.campaign_stat.differential_onemin}</TableCell>
                            <TableCell> STATUSES : {n.campaign_stat.dial_statuses}</TableCell>
                        </TableRow>
                        <TableRow key={4}>
                            <TableCell>  LEADS IN HOPPER : {n.campaign_stat.hopper}</TableCell>
                            <TableCell>  DROPPED PERCENT : {n.campaign_stat.drops_answers_today_pct}</TableCell>
                            <TableCell>   DIFF : {n.campaign_stat.diff_pct_one_min} </TableCell>
                            <TableCell> ORDER : {n.campaign_stat.dial_order}</TableCell>
                        </TableRow>

                    </TableBody>
                </Table>
            </div>
            <div className="col-lg-12 col-sm-12 col-12">
                <br/>
                <h4>NO LIVE CALLS WAITING  {n.campaign_agents_on_calls === "" ? "" : "NO AGENTS ON CALLS"}</h4>  
                {n.campaign_agents_on_calls == "" ? "" : 
                <div className="row">
                    <div className="col-sm-2 col-12">
                        <Card className="shadow border-0 bg-primary text-white">
                            <CardBody>
                                <h2 className="card-title text-white">{n.campaign_agents_on_calls.agent_total}</h2>
                                <CardSubtitle className="text-white">Agents Logged In</CardSubtitle>
                            </CardBody>
                        </Card>
                    </div>
                    <div className="col-sm-2 col-12">
                        <Card className="shadow border-0 bg-primary text-white">
                            <CardBody>
                                <h3 className="card-title text-white">{n.campaign_agents_on_calls.agent_incall}</h3>
                                <CardSubtitle className="text-white">Agent In Calls</CardSubtitle>
                            </CardBody>
                        </Card>
                    </div>
                    <div className="col-sm-2 col-12">
                        <Card className="shadow border-0 bg-primary text-white">
                            <CardBody>
                                <h3 className="card-title text-white">{n.campaign_agents_on_calls.agent_ready}</h3>
                                <CardSubtitle className="text-white">Agents Waiting</CardSubtitle>
                            </CardBody>
                        </Card>
                    </div>
                    <div className="col-sm-2 col-12">
                        <Card className="shadow border-0 bg-primary text-white">
                            <CardBody>
                                <h3 className="card-title text-white">{n.campaign_agents_on_calls.agent_paused}</h3>
                                <CardSubtitle className="text-white">Paused Agents</CardSubtitle>
                            </CardBody>
                        </Card>
                    </div>
                </div>}
            </div>
        </Paper>
        <br/>
        </div>
        ))}
        
        </div>
    );
}
}

export default List;