import { React,Table,TableBody,TableCell,TableHead,TableRow,InfoCard,ContainerHeader,CardBox,Paper,Input,InputLabel,MenuItem,FormControl,FormHelperText,Select,Card,CardBody,CardSubtitle,CardText,cloneElement,Component,Button,moment} from './plugins';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import Dropdown from '../../../common/Dropdown';
import SingleDropdownUsers from '../../../common/SingleDropdownUsers';
import { fetchAllUserGroup } from '../../../../actions/';
import CircularProgress from '@material-ui/core/CircularProgress';
import {connect} from 'react-redux';
import {Badge} from 'reactstrap';

const DISPLAYAS = ['TEXT','HTML'];
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Helmet from "react-helmet";
class GroupTimeClock extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            userGroups:'',
            UserGroupList :[],
            data :[],
            total_hour:'',
            flag : false,
            page: 0,
            rowsPerPage: 25,
            isLoading:false,
            userError : false,
        };
    }


    handleChange = (name,value) =>{
        this.setState({
            [name]:value,
        }) 
    }

    handleSubmit = () =>{
        
        const {userGroups,userError} = this.state;

        var token = localStorage.getItem("access_token");
        const requestOptions = {
            headers: { 
                'Content-Type': 'application/json' ,
                'Authorization' : 'Bearer '+token 
            }  
        };

        if(userGroups!== ''){
            this.setState({isLoading:true,userError:false});
            axios.post('api/user_group_time_clock_status_data/',{
                user_group:userGroups,
            },requestOptions).then(response=>{
                console.log(response);
                this.setState({
                    data: response.data.graph_stat_html,
                    total_hour : response.data.total_hr,
                    flag :true,
                    isLoading:false,
                })
            }).catch(error =>{
                console.log(error);
            })
        }else{
            this.setState({userError:true});
        }


    }

    handleDownloadSubmit = () =>{

    }

    componentWillReceiveProps(nextPropsFromRedux) {
        this.setState({  
          alertTitle: nextPropsFromRedux.UserGroup.alertMessageTitle,                                                                                                                                                                                                                                                                                                                               
          showAlert:nextPropsFromRedux.UserGroup.showMessage,
          alertContent: nextPropsFromRedux.UserGroup.alertMessage,
          UserGroupList:nextPropsFromRedux.UserGroup.data,
          isLoading: nextPropsFromRedux.UserGroup.isLoading,
        });
      }
    

    componentDidMount() {  
        this.props.fetchAllUserGroup();
        
    }

    handleChangePage = (event, page) => {this.setState({page});};
    handleChangeRowsPerPage = event => {this.setState({rowsPerPage: event.target.value}); };
    
    render() {
        const {userGroups,UserGroupList,data,total_hour,flag,rowsPerPage,page,isLoading,userError} = this.state;
    return (
        <div>
            <Helmet>
                <title>UserGroupTimeClockStatusReport| Ytel</title>
            </Helmet>
            <ContainerHeader match={this.props.match} title='User Group Time Clock Status Report'/>

            <div className="row">
                <CardBox styleName="col-lg-12" heading={null}>
                {this.state.data1}
                    <form className="row" autoComplete="off">
                        <div className="col-lg-3 col-sm-4 col-4">
                            <SingleDropdownUsers 
                                label={"User Groups"} 
                                onChange={this.handleChange}
                                name={'userGroups'}
                                selectedValue={userGroups}
                                data={UserGroupList}
                                default={''}
                            />
                            {userError ? <FormHelperText error>Please Select User Group</FormHelperText>:''}
                            
                        </div>
                        <div className="col-lg-6 col-sm-6 col-12">
                            <Button color="primary" className="jr-btn bg-success text-white" onClick={this.handleSubmit}>
                                Submit
                            </Button>
                            <Button color="primary" className="jr-btn bg-success text-white" onClick={this.handleDownloadSubmit}>
                                Download CSV
                            </Button>
                        </div>
                    </form>
                    
                </CardBox>
            </div>  
            
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
                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableBody>
                                    <TableRow key={1}>
                                        <TableCell>
                                            <div className="ml-auto px-3 badge badge-pill" style={{backgroundColor:'#99FF33',borderRadius: '0px'}}>&nbsp;</div>
                                            &nbsp;TC Logged in and VICI active
                                        </TableCell>
                                        <TableCell>
                                            <div className="ml-auto px-3 badge badge-pill" style={{backgroundColor:'#FFFF33',borderRadius: '0px'}}>&nbsp;</div>
                                            &nbsp;&nbsp;TC Logged in only
                                        </TableCell>
                                        <TableCell>
                                            <div className="ml-auto px-3 badge badge-pill" style={{backgroundColor:'#FF6666',borderRadius: '0px'}}>&nbsp;</div>
                                            VICI active only
                                        </TableCell>
                                        <TableCell>
                                            <div className="ml-auto px-3 badge badge-pill" style={{backgroundColor:'#66CC66',borderRadius: '0px'}}>&nbsp;</div>
                                            &nbsp;&nbsp;TC Logged out and VICI active
                                        </TableCell>
                                        <TableCell>
                                            <div className="ml-auto px-3 badge badge-pill" style={{backgroundColor:'#CCCC00',borderRadius: '0px'}}>&nbsp;</div>
                                            &nbsp;&nbsp;TC Logged out only
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                    
                    <br/>

                    <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12" style={{textAlign:'center'}}>
                            <h2 style={{color:'#036'}}>USER STATUS FOR USER GROUP : {userGroups}</h2>
                            <br/>
                        </div>
                    </div>


                    <Paper>
                        <div className="table-responsive-material">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>USER</TableCell>
                                        <TableCell>NAME</TableCell>
                                        <TableCell>IP ADDRESS</TableCell>
                                        <TableCell>TC TIME</TableCell>
                                        <TableCell>TC LOGIN	</TableCell>
                                        <TableCell>VICI LAST LOG	</TableCell>
                                        <TableCell>VICI CAMPAIGN</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>

                                    {data.map((n,i)=>(
                                        <TableRow key={i}>
                                            <TableCell>{n[1]}</TableCell>
                                            <TableCell>{n[2]}</TableCell>
                                            <TableCell>{n[3]}</TableCell>
                                            <TableCell>{n[4]}</TableCell>
                                            <TableCell>{n[5]}</TableCell>
                                            <TableCell>{n[6]}</TableCell>
                                            <TableCell>{n[0]}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow key={3}>
                                        <TableCell >TOTAL</TableCell>
                                        <TableCell ></TableCell>
                                        <TableCell ></TableCell>
                                        <TableCell >{total_hour}</TableCell>
                                        <TableCell ></TableCell>
                                        <TableCell ></TableCell>
                                        <TableCell ></TableCell>
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
            :""}
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
    
export default connect(mapStateToProps, mapDispatchToProps)(GroupTimeClock);
