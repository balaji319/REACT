import React from 'react';
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
import {Card, CardBody} from 'reactstrap';
import {cloneElement, Component} from 'react';
import moment from 'moment';
import momentTimezone from 'moment-timezone';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
import {DatePicker} from 'material-ui-pickers';
import {dateValidation} from '../../../common/DateDiff';
import TextTable from './tables/TextTable';
import MultipeDropdown from '../../../common/MultipeDropdown';
import UserGroupMultipeDropdown from '../../../common/UserGroupMultipeDropdown';
import MultipeDropdownCampaigns from '../../../common/MultipeDropdownCampaigns';
import MultipeDropdownUsers from '../../../common/MultipeDropdownUsers';
import Dropdown from '../../../common/Dropdown';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import CircularProgress from '@material-ui/core/CircularProgress';

import {
    fetchAllUserGroup,
    fetchCampaignList,
    fetchUsersList,

} from '../../../../actions/';

const DISPLAYAS = ['TEXT', 'HTML'];
const SHIFT = ['ALL','AM','PM'];

const TODAY = momentTimezone.tz(moment(new Date()), "America/Los_Angeles").format('YYYY-MM-DD');
const YESTERDAY = momentTimezone.tz(moment(new Date()).subtract(1,'d'), "America/Los_Angeles").format('YYYY-MM-DD');
const TWO_DAYS = momentTimezone.tz(moment(new Date()).subtract(2,'d'), "America/Los_Angeles").format('YYYY-MM-DD');
const THREE_DAYS = momentTimezone.tz(moment(new Date()).subtract(3,'d'), "America/Los_Angeles").format('YYYY-MM-DD');
const FIVE_DAYS = momentTimezone.tz(moment(new Date()).subtract(5,'d'), "America/Los_Angeles").format('YYYY-MM-DD');
const TEN_DAYS = momentTimezone.tz(moment(new Date()).subtract(10,'d'), "America/Los_Angeles").format('YYYY-MM-DD');
const THIRTEEN_DAYS = momentTimezone.tz(moment(new Date()).subtract(30,'d'), "America/Los_Angeles").format('YYYY-MM-DD');


let kid = 0;
const BREAKDOWN_COL1 = 7;

function generate(element) {
    return [0, 1, 2].map(value =>
        cloneElement(element, {
            key: value,
        }),
    );
}

class PerformanceComparisonReport extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            fromSelectedDate: momentTimezone.tz(moment(new Date()), "America/Los_Angeles").format('YYYY-MM-DD'),
            todaysDate: momentTimezone.tz(moment(new Date()), "America/Los_Angeles").format('YYYY-MM-DD HH:MM:SS'),
            tableshow: false,
            activeCol:0,
            colName :'TODAY',
            userGroups:['-ALL-'],
            UserGroupList :[],
            campaignsGroups:['-ALL-'],
            campaignList: [],
            usersNames: ['-ALL-'],
            usersList: [],
            displayAs:'TEXT',
            shift:'ALL',
            isLoading:false,
            timeval: false,
            mydata: [],
            flag: "TEXT",
            result: false,
        };
      }

    setSelectOptions = (name,value) =>{
        this.setState({
            [name]:value,
        })
    }

    clickCol = (i,name) =>{
        console.log(i)
        if(this.state.displayAs =='HTML')
        this.setState({
            activeCol:i,
            colName:name,
        })
    }

     handleDateChangeFrom = (date) => {
        this.setState({fromSelectedDate: date.format('YYYY-MM-DD')});
    }

    handleCsvDownload (){
        alert('Download Success');
        //downloadCsvReports();
    }

      componentWillReceiveProps(nextPropsFromRedux) {
        this.setState({
          alertTitle: nextPropsFromRedux.UserGroup.alertMessageTitle,
          showAlert:nextPropsFromRedux.UserGroup.showMessage,
          alertContent: nextPropsFromRedux.UserGroup.alertMessage,
          UserGroupList:nextPropsFromRedux.UserGroup.data,
          campaignList: nextPropsFromRedux.campaignList.data ,
          usersList: nextPropsFromRedux.usersList.data ,
          camploads: nextPropsFromRedux.usersList.camploads ,
        });

      }

    componentDidMount() {
             this.props.fetchCampaignList();
             this.props.fetchAllUserGroup();
             this.props.fetchUsersList();
    }


    handleSubmit=()=>{
        this.setState({result : false})
        //Set Table column active 0
        if(this.state.displayAs=='HTML'){
            this.setState({
                activeCol:1,
                flag: "HTML",
                isLoading: true,

            })
        }else{
             this.setState({
                activeCol:1,
                flag: "TEXT",
                isLoading: true,
            })
        }

        const {shift, displayAs, fromSelectedDate, userGroups, UserGroupList, usersNames, usersList, campaignsGroups, campaignList} = this.state;
        const currentDate = momentTimezone.tz(moment(new Date()), "America/Los_Angeles").format('YYYY-MM-DD HH:MM:SS');
        const query_date = fromSelectedDate;

        const UGL = UserGroupList.map((item,i)=>(item.user_group)).filter(Boolean); //Add .filter(Boolean) if remove "" value from array
        const UL = usersList.map((item,i)=>(item.user)).filter(Boolean);
        const CL = campaignList.map((item,i)=>(item.campaign_id)).filter(Boolean);


        var auth_token = localStorage.getItem("access_token");

           axios.post('api/performance_comparison_report', {
            shift: shift,
            display_type: displayAs.toLowerCase(),
            query_date: query_date,
            completeDate: currentDate,
            user_group: userGroups.indexOf('-ALL-')==-1?userGroups:UGL,
            user: usersNames.indexOf('-ALL-')==-1?usersNames:UL,
            group: campaignsGroups.indexOf('-ALL-')==-1?campaignsGroups:CL,

        }, {headers: {
        	'Content-Type': 'application/json' ,
        	'Authorization' : 'Bearer '+auth_token  ,
        }}).then(response => {
            this.setState({
                mydata : response.data,
                tableshow : true,
                isLoading:false,
                timeval: false,
                result: true,
            })
        }).catch(error => {
            console.log(error);
            this.setState({
                isLoading:false,
                open: false
            })
        })

    }

    render() {
        const {flag, result, mydata, todaysDate, camploads, isLoading, UserGroupList, userGroups, campaignList, campaignsGroups, usersList, usersNames, displayAs, shift, activeCol, display_as, colName, tableshow, dense, secondary, fromSelectedDate} = this.state;

    return (
        <div>
            <ContainerHeader match={this.props.match} title='Server Stats and Reports'/>
            <div className="row">
                    <CardBox styleName="col-lg-12" heading="Performance Comparison Report">
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
                            <div> <br /><br /></div>
                    <div className="col-lg-6 col-sm-6 col-12">
                                <FormControl className="w-100 mb-2">
                                    <MultipeDropdownUsers
                                        label={"Users"}
                                        options={usersList}
                                        onChange={this.setSelectOptions}
                                        name={'usersNames'}
                                        default={'-ALL-'}
                                        selectedValue={usersNames}
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


                            <div className="col-lg-6 col-sm-6 col-12">
                                <div key="datetime_default" className="picker">
                                    <h3>Dates</h3>
                                    <DatePicker
                                        fullWidth
                                        value={fromSelectedDate}
                                        format='YYYY/MM/DD'
                                        onChange={this.handleDateChangeFrom}
                                        animateYearScrolling={false}
                                        leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                                        rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                                    />

                                </div>
                            </div>
                            <div className="col-lg-6 col-sm-6 col-12"></div>
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

                        <div className="col-lg-12">
                            <Button variant="raised" onClick={this.handleSubmit} className="jr-btn bg-green text-white">Submit</Button>
                            <Button variant="raised" onClick={this.handleCsvDownload} className="jr-btn bg-green text-white pull-right">CSV Download</Button>
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

                            { camploads &&
                                <Dialog open={this.state.camploads} onClose={this.handleRequestClose}>
                                    <DialogContent>
                                        <div className="loader-view">
                                            <CircularProgress/>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            }

            {tableshow == true ?
            <Card className="col-lg-12 col-sm-12 col-12 shadow border-0 bg-default text-black">
                <CardBody>
                    <div className="row">
                        <div className="col-lg-12 col-sm-12 col-12">
                            <label>Agent Performance Comparison {todaysDate}</label>

                    </div>
                    </div>
                    <Paper>
                        {tableshow && result && flag == "TEXT" ?
                            <TextTable displayAs={displayAs} mydata={mydata}/>
                        :
                        <div className="table-responsive-material col-lg-12 col-sm-12 col-12">
                             <Table>
                                 <TableHead>
                                     <TableRow>
                                         <TableCell key={1} onClick={()=>this.clickCol(1,'TODAY')} numeric>TODAY {TODAY}</TableCell>
                                         <TableCell key={2} onClick={()=>this.clickCol(2,'YESTERDAY')} numeric>YESTERDAY {YESTERDAY}</TableCell>
                                         <TableCell key={3} onClick={()=>this.clickCol(3,'2 DAYS AGO')} numeric>2 DAYS AGO {TWO_DAYS}</TableCell>
                                         <TableCell key={4} onClick={()=>this.clickCol(4,'3 DAYS AGO')} numeric>3 DAYS AGO {THREE_DAYS}</TableCell>
                                         <TableCell key={5} onClick={()=>this.clickCol(5,'5 DAYS AGO')} numeric>5 DAYS AGO {FIVE_DAYS}</TableCell>
                                         <TableCell key={6} onClick={()=>this.clickCol(6,'10 DAYS AGO')}>10 DAYS AGO {TEN_DAYS}</TableCell>
                                         <TableCell key={7} onClick={()=>this.clickCol(7,'30 DAYS AGO')}>30 DAYS AGO {THIRTEEN_DAYS}</TableCell>
                                     </TableRow>
                                     <TableRow>
                                        <TableCell colSpan={BREAKDOWN_COL1}>{colName}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                         <TableCell>User</TableCell>
                                         <TableCell>ID</TableCell>
                                         <TableCell>(CALLS)</TableCell>
                                         <TableCell>SALES</TableCell>
                                         <TableCell>SALE CONV %</TableCell>
                                         <TableCell>SALES PER HR</TableCell>
                                         <TableCell>TIME</TableCell>
                                    </TableRow>
                                 </TableHead>
                                 <TableBody>
                                    {Object.keys(mydata.data).map((key, value) =>
                                   mydata.data[key].full_name ?
                                    <TableRow key={value}>
                                        <TableCell>{mydata.data[key].full_name}</TableCell>
                                        <TableCell>{mydata.data[key].user}</TableCell>
                                        <TableCell>
                                            <Progress
                                                percent={mydata.data[key].calls[activeCol - 1].width}
                                                theme={{active: { symbol: mydata.data[key].calls[activeCol - 1].value , color: '#0086e3' },
                                                        success: { symbol: mydata.data[key].calls[activeCol - 1].value , color: '#0086e3' },
                                                        default: { symbol: mydata.data[key].calls[activeCol - 1].value , color: '#0086e3' },
                                                    }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Progress
                                                percent={mydata.data[key].sales[activeCol - 1].width}
                                                theme={{active: { symbol: mydata.data[key].sales[activeCol - 1].value , color: '#0086e3' },
                                                        success: { symbol: mydata.data[key].sales[activeCol - 1].value , color: '#0086e3' },
                                                        default: { symbol: mydata.data[key].sales[activeCol - 1].value , color: '#0086e3' },
                                                    }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Progress
                                                percent={mydata.data[key].sale_conv[activeCol - 1].width}
                                                theme={{active: { symbol: mydata.data[key].sale_conv[activeCol - 1].value + '%', color: '#0086e3' },
                                                        success: { symbol: mydata.data[key].sale_conv[activeCol - 1].value + '%', color: '#0086e3' }}}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Progress
                                                percent={mydata.data[key].sales_per_hr[activeCol - 1].width}
                                                theme={{active: { symbol: mydata.data[key].sales_per_hr[activeCol - 1].value , color: '#0086e3' },
                                                        success: { symbol: mydata.data[key].sales_per_hr[activeCol - 1].value , color: '#0086e3' },
                                                        default: { symbol: mydata.data[key].sales_per_hr[activeCol - 1].value , color: '#0086e3' }
                                                    }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Progress
                                                percent={mydata.data[key].time[activeCol - 1].width}
                                                theme={{active: { symbol: mydata.data[key].time[activeCol - 1].value , color: '#0086e3' },
                                                        success: { symbol: mydata.data[key].sales[activeCol - 1].value , color: '#0086e3' },
                                                        default: { symbol: mydata.data[key].sales[activeCol - 1].value , color: '#0086e3' }
                                                        }}
                                            />
                                        </TableCell>


                                    </TableRow> : null
                                )}

                                <TableRow>
                                <TableCell>{mydata.data.total_array[0]}</TableCell>
                                <TableCell>{mydata.data.total_array[1]}</TableCell>
                                {Object.keys(mydata.data.total_graph_array).map((t,r) =>
                                    <TableCell key={r}>{mydata.data.total_graph_array[activeCol-1][t]}</TableCell>
                                )

                                }
                                </TableRow>

                                 </TableBody>
                             </Table>
                         </div>

                        }
                    </Paper>
                    <br/>
                    <br/>
                </CardBody>
            </Card>: ""
                }

            </div>
        </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    console.log(state);

    return {
        UserGroup: state.usergrouplist,
        campaignList: state.campaign_list,
        usersList: state.users_list,

    };
}

 const mapDispatchToProps = {
        fetchAllUserGroup,
        fetchCampaignList,
        fetchUsersList,
    };

export default connect(mapStateToProps, mapDispatchToProps)(PerformanceComparisonReport);
//export default PerformanceComparisonReport;