import { React,Table,TableBody,TableCell,TableHead,TableRow,TableFooter,TablePagination,InfoCard,ContainerHeader,CardBox,Paper,Input,InputLabel,MenuItem,FormControl,FormHelperText,Select,Card,CardBody,CardSubtitle,CardText,cloneElement,Component,Button,moment} from './plugins';

const BREAKDOWN_COL = 3;
import LinearProgress from '@material-ui/core/LinearProgress';
import UserGroupMultipeDropdown from '../../../common/UserGroupMultipeDropdown';
import Dropdown from '../../../common/Dropdown';
import DateRange from '../../../common/DateRange';
import TextFields from '../../../common/TextFields';
import CircularProgress from '@material-ui/core/CircularProgress';

import {connect} from 'react-redux';
import { fetchAllUserGroup } from '../../../../actions/';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
import Helmet from "react-helmet";
const ORDER =[
    'hours_up',
    'hours_down',
    'user_up',
    'user_down',
    'name_up',
    'name_down',
    'group_up',
    'group_down',
];
const DISPLAYAS = ['TEXT','HTML'];


class AgentTimeClock extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            activeCol:0,
            colName :'',
            displayAs:'TEXT',
            from: moment(new Date()).format('YYYY-MM-DD'),
            to: moment(new Date()).format('YYYY-MM-DD'),
            userGroups:['-ALL-'],
            user:'',
            order:'hours_up',
            UserGroupList :[],
            data :[],
            total_hour:'',
            flag : false,
            page: 0,
            rowsPerPage: 25,
            isLoading:false,
        };
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
    }

    handleSubmit = () =>{

        const {from,to,userGroups,user,order,displayAs,rowsPerPage} = this.state;
        this.setState({isLoading:true});
        if(displayAs == 'html'){
            this.setState({activeCol:0})
        }

        var token = localStorage.getItem("access_token");
        const requestOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer '+token ,
            }

        };


        axios.post('api/user_time_clock_data/',{
            start_date:from,
            end_date:to,
            order:order,
            user_group:userGroups,
            user:user
        },requestOptions).then(response=>{
            this.setState({
                data: response.data.graph_stat_html,
                total_hour : response.data.total_hours,
                flag :true,
                isLoading:false,
            })
        }).catch(error =>{
            console.log(error);
        })
    }

    clickCol = (i,name) =>{
        if(this.state.displayAs =='HTML')
        this.setState({
            activeCol:i,
            colName:name,
        })
    }

    componentWillReceiveProps(nextPropsFromRedux) {
        this.setState({
          alertTitle: nextPropsFromRedux.UserGroup.alertMessageTitle,
          showAlert:nextPropsFromRedux.UserGroup.showMessage,
          alertContent: nextPropsFromRedux.UserGroup.alertMessage,
          UserGroupList:nextPropsFromRedux.UserGroup.data,
          //isLoading: nextPropsFromRedux.UserGroup.isLoading ,
        });
        this.state.UserGroupList.unshift("-ALL-");
    }

    componentDidMount() {
        this.props.fetchAllUserGroup();
        this.setState({isLoading:true});
        const {from,to,userGroups,user,order,displayAs,rowsPerPage} = this.state;
        var token = localStorage.getItem("access_token");
        const requestOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer '+token ,
            }

        };

        axios.post('api/user_time_clock_data/',{
            start_date:from,
            end_date:to,
            order:order,
            user_group:userGroups,
            user:user
        },requestOptions).then(response=>{
            this.setState({
                data: response.data.graph_stat_html,
                total_hour : response.data.total_hours,
                flag :true,
                isLoading:false,
            })
        }).catch(error =>{
            console.log(error);
        })

    }

    handleChangePage = (event, page) => {this.setState({page});};
    handleChangeRowsPerPage = event => {this.setState({rowsPerPage: event.target.value}); };

    render() {
        const {from,to,displayAs,userGroups,activeCol,colName,user,order,UserGroupList,data,total_hour,flag,rowsPerPage,page,isLoading} = this.state;

    return (
        <div>
            <Helmet>
                <title>UserTimeClockReport | Ytel</title>
            </Helmet>
            <ContainerHeader match={this.props.match} title='User Time Clock Report'/>

            <div className="row">
                <CardBox styleName="col-lg-12" heading="User Time Clock Report">
                    <form className="row" autoComplete="off">
                        <div className="col-lg-6 col-sm-6 col-12">

                            <DateRange
                                onFromChange={this.handleFromChange}
                                onToChange={this.handleToChange}
                                from={from}
                                to={to}
                            />

                            <TextFields
                                label={"User"}
                                name={"user"}
                                id={"user"}
                                value={user}
                                onChange={this.handleChange}
                            />

                            <Dropdown
                                label={"Order"}
                                onChange={this.handleChange}
                                name={'order'}
                                selectedValue={order}
                                data={ORDER}
                            />
                            <br/><br/>
                            <Button color="primary" className="jr-btn bg-success text-white" onClick={this.handleSubmit}>
                                Submit
                            </Button>
                            <Button color="primary" className="jr-btn bg-success text-white" onClick={this.handleSubmit}>
                                Download CSV
                            </Button>

                        </div>
                        <div className="col-lg-6 col-sm-6 col-12">
                            <UserGroupMultipeDropdown
                                label={"User Groups"}
                                options={UserGroupList}
                                onChange={this.handleChange}
                                name={'userGroups'}
                                selectedValue={userGroups}
                                default={'-ALL-'}
                            />

                            <Dropdown
                                label={"Display As"}
                                onChange={this.handleChange}
                                name={'displayAs'}
                                selectedValue={displayAs}
                                data={DISPLAYAS}
                            />
                            <br/><br/>


                        </div>

                    </form>
                </CardBox>
            </div>

            {/* {
                isLoading &&
                <div className="loader-view" style={{position: 'relative'}}>
                    <CircularProgress size={50}/>
                </div>
            } */}

            { isLoading &&
                <Dialog open={this.state.isLoading} onClose={this.handleRequestClose}>
                    <DialogContent>
                        <div className="loader-view">
                            <CircularProgress/>
                        </div>
                    </DialogContent>
                </Dialog>
            }

            {flag  ?
            <Card className="shadow border-0 bg-default text-black">
                <CardBody>
                    <span><label className="card-title">User Time Clock Report:</label>&nbsp;&nbsp;{userGroups.join(' | ')} &nbsp;&nbsp;|&nbsp;&nbsp;  {moment(new Date()).format('YYYY-MM-DD HH:MM:SS')}</span>
                    <h3 className="card-title">Time range: {from} 00:00:00 To {to} 11:59:59</h3>

                    <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12" style={{textAlign:'center'}}>
                            <h2 style={{color:'#036'}}>User Time Clock Details</h2>
                            <br/>
                            <label>These totals do NOT include any active sessions</label>
                            {/* <Button variant="raised" className="jr-btn jr-btn-sm pull-right bg-success text-white">CSV Download</Button> */}
                        </div>
                    </div>
                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>User</TableCell>
                                        <TableCell className={displayAs=='HTML' ? 'hide-td':''} >Name</TableCell>
                                        <TableCell className={displayAs=='HTML' ? 'hide-td':''} >Group</TableCell>
                                        <TableCell colSpan={displayAs=='HTML'?BREAKDOWN_COL:1} >Hours</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                        {data.map((item,i)=>(
                                            <TableRow key={i}>
                                                <TableCell>{displayAs=='HTML' ?item[2]+' ( '+item[3]+' )- '+item[4]+' ) ' :item[2]}</TableCell>
                                                <TableCell className={displayAs=='HTML' ? 'hide-td':''} >{item[3]}</TableCell>
                                                <TableCell className={displayAs=='HTML' ? 'hide-td':''} >{item[4]}</TableCell>
                                                <TableCell colSpan={displayAs=='HTML'?BREAKDOWN_COL:1} >
                                                    {displayAs == 'HTML'?
                                                        // [<LinearProgress color="primary" variant="determinate" value={parseInt(item[1])} className="progressbar-height" />,
                                                        // <span color="primary" className="badge badge-secondary">{item[1]}</span>]
                                                        <Progress strokeWidth={30} percent={item[1]} />
                                                    :
                                                    item[1]}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow key={3}>
                                            <TableCell >TOTAL</TableCell>
                                            <TableCell className={displayAs=='HTML' ? 'hide-td':''}> </TableCell>
                                            <TableCell className={displayAs=='HTML' ? 'hide-td':''}> </TableCell>
                                            <TableCell>
                                                {total_hour}
                                            </TableCell>
                                        </TableRow>
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TablePagination
                                            count={data.length}
                                            rowsPerPage={rowsPerPage}
                                            page={page}
                                            onChangePage={this.handleChangePage}
                                            onChangeRowsPerPage={this.handleChangeRowsPerPage}
                                            />
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>
                    </Paper>

                    <br/>
                    <br/>

                </CardBody>
            </Card>
            :''}

        </div>
    );
}
}

function mapStateToProps(state, ownProps)
{
    return {
        UserGroup: state.usergrouplist
    };
}

const mapDispatchToProps = {
    fetchAllUserGroup
};

export default connect(mapStateToProps, mapDispatchToProps)(AgentTimeClock);
