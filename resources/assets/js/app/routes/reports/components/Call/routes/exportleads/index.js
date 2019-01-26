import { React,Table,TableBody,TableCell,TableHead,TableRow,InfoCard,ContainerHeader,
        CardBox,Paper,Input,InputLabel,MenuItem,FormControl,
    FormHelperText,Select,Card,CardBody,CardSubtitle,CardText,TextField,cloneElement,Component,Button,moment,DayPickerInput,formatDate,parseDate,Helmet  } from './plugins';

import MultipeDropdown from '../../../common/MultipeDropdown';
import StatusesMultipeDropdown from '../../../common/StatusesMultipeDropdown';
import UserGroupMultipeDropdown from '../../../common/UserGroupMultipeDropdown';
import Dropdown from '../../../common/Dropdown';
import DateRange from '../../../common/DateRange';
import {connect} from 'react-redux';

import { fetchAllUserGroup,fetchAllStatuses } from '../../../../actions/';

const HEADERFIELDS= ['YES','NO'];
const EXPORTFIELDS= [
    'STANDARD',
    'EXTENDED',
    'ALTERNATE_1',
];
const RECORDINGFIELDS = ['NONE','ID','FILENAME','LOCATION','CALLS'];
const FORMATS= ['HTML','CSV'];

const names = [
    'Oliver Hansen',
    'Van Henry',
    'April Tucker',
    'Ralph Hubbard',
    'Omar Alexander',
    'Carlos Abbott',
    'Miriam Wagner',
    'Bradley Wilkerson',
    'Virginia Andrews',
    'Kelly Snyder',
];
    
class ExportLeads extends React.Component {
    constructor(props) {
        super(props);
        var ts = new Date();
        this.state = {
            from: moment(new Date()).format('YYYY-MM-DD'),
            to: moment(new Date()).format('YYYY-MM-DD'),
            recordingFields:'NONE',
            customFields:'NO',
            perCallNotes:'NO',
            exportFields:'STANDARD',
            campaigns: [],
            inboundGroup:[],    
            lists:[],
            statuses:[],
            userGroups:[],
            UserGroupList :[],
            statusesList:[],
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

    handleSubmit=()=>{
        let date = moment(this.state.fromSelectedDate).format('MM/DD/YYYY HH:MM:SS');
        const {from,to,recordingFields,headerFields,customFields,perCallNotes,exportFields,reportFormat,notifyEmail,notifySms,campaigns,inboundGroup,lists,statuses,userGroups} = this.state;

        const data = {
            'fromDate':moment(from).format('MM/DD/YYYY HH:MM:SS'),
            'toDate' :moment(to).format('MM/DD/YYYY HH:MM:SS'),
            'recordingFields':recordingFields,
            'customFields':customFields,
            'perCallNotes':perCallNotes,
            'exportFields':exportFields,
            'campaigns':campaigns,
            'inboundGroup':inboundGroup,
            'lists':lists,
            'statuses':statuses,
            'userGroups':userGroups
        }

        console.log(data);
    }

    componentWillReceiveProps(nextPropsFromRedux) {
        this.setState({  
          alertTitle: nextPropsFromRedux.UserGroup.alertMessageTitle,                                                                                                                                                                                                                                                                                                                               
          showAlert:nextPropsFromRedux.UserGroup.showMessage,
          alertContent: nextPropsFromRedux.UserGroup.alertMessage,
          UserGroupList:nextPropsFromRedux.UserGroup.data,
          statusesList:nextPropsFromRedux.Statuses.data,
        });

      }
    

    componentDidMount() {  
        this.props.fetchAllUserGroup();
        this.props.fetchAllStatuses();
    }

    render() {
        const {from,to,recordingFields,customFields,perCallNotes,exportFields,campaigns,inboundGroup,lists,statuses,userGroups,UserGroupList,statusesList} = this.state;
    return (
        <div>

            <ContainerHeader match={this.props.match} title='Export Leads Report'/>

            <div className="row">
                <CardBox styleName="col-lg-12" heading="Export Leads Report">
                    <form className="row" autoComplete="off">
                        <div className="col-lg-6 col-sm-6 col-12">

                            <DateRange 
                                onFromChange={this.handleFromChange} 
                                onToChange={this.handleToChange}
                                from={from}
                                to={to}
                            />
                       
                            <Dropdown 
                                label={"Recording Fields"} 
                                onChange={this.handleChange}
                                name={'recordingFields'}
                                selectedValue={recordingFields}
                                data={RECORDINGFIELDS}
                            />

                            <Dropdown 
                                label={"Custom Fields"} 
                                onChange={this.handleChange}
                                name={'customFields'}
                                selectedValue={customFields}
                                data={HEADERFIELDS}
                            />

                            <Dropdown 
                                label={"Per Call Notes"} 
                                onChange={this.handleChange}
                                name={'perCallNotes'}
                                selectedValue={perCallNotes}
                                data={HEADERFIELDS}
                            />

                            <Dropdown 
                                label={"Export Fields:"} 
                                onChange={this.handleChange}
                                name={'exportFields'}
                                selectedValue={exportFields}
                                data={EXPORTFIELDS}
                            />
                        
                            <Button color="primary" className="jr-btn bg-success text-white" onClick={this.handleSubmit}>
                                Submit
                            </Button>
                            
                        </div>
                        <div className="col-lg-6 col-sm-6 col-12">
                            <MultipeDropdown 
                                label={"Campaigns"} 
                                options={names} 
                                onChange={this.handleChange}
                                name={'campaigns'}
                                selectedValue={campaigns}
                            />

                            <MultipeDropdown 
                                label={"Inbound Groups"} 
                                options={names} 
                                onChange={this.handleChange}
                                name={'inboundGroup'}
                                selectedValue={inboundGroup}
                            />

                            <MultipeDropdown 
                                label={"Lists"} 
                                options={names} 
                                onChange={this.handleChange}
                                name={'lists'}
                                selectedValue={lists}
                            />
                            
                            <StatusesMultipeDropdown 
                                label={"Statuses"} 
                                options={statusesList} 
                                onChange={this.handleChange}
                                name={'statuses'}
                                selectedValue={statuses}
                            />
                        
                            <UserGroupMultipeDropdown 
                                label={"User Groups"} 
                                options={UserGroupList} 
                                onChange={this.handleChange}
                                name={'userGroups'}
                                selectedValue={userGroups}
                            />
                        </div>
                    </form>
                </CardBox>
            </div>
        </div>
    );
}   
}

function mapStateToProps(state, ownProps) 
{
    return {
        UserGroup: state.usergrouplist,
        Statuses : state.statusesList,
    };
}

 const mapDispatchToProps = {
        fetchAllUserGroup,
        fetchAllStatuses,
    };
    
export default connect(mapStateToProps, mapDispatchToProps)(ExportLeads);
