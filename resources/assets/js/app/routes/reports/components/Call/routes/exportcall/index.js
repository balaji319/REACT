import { React,Table,TableBody,TableCell,TableHead,TableRow,InfoCard,ContainerHeader,
        CardBox,Paper,Input,InputLabel,MenuItem,FormControl,
    FormHelperText,Select,Card,CardBody,CardSubtitle,CardText,TextField,cloneElement,Component,Button,moment,DayPickerInput,formatDate,parseDate,Helmet  } from './plugins';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

import MultipeDropdown from '../../../common/MultipeDropdown';
import Dropdown from '../../../common/Dropdown';
import DateRange from '../../../common/DateRange';


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


class Exportcall extends React.Component {
    constructor(props) {
        super(props);
        var ts = new Date();
        this.state = {
            campaigns: [],
            displayAs:'TEXT',
            inboundGroup : '',
            from: moment(new Date()).format('YYYY-MM-DD'),
            to: moment(new Date()).format('YYYY-MM-DD'),
            recordingFields:'NONE',
            headerFields:'YES',
            customFields:'NO',
            perCallNotes:'NO',
            exportFields:'STANDARD',
            reportFormat:'CSV',
            notifyEmail:'',
            notifySms:'',
            inboundGroup:[],
            lists:[],
            statuses:[],
            userGroups:[],
        };
    }



    handleChange = (name,value) =>{
        this.setState({
            [name]:value,
        }) 
    }

    handleTextChange = name => event => {
        this.setState({[name]: event.target.value});
    };

    handleSubmit=()=>{
        let date = moment(this.state.fromSelectedDate).format('MM/DD/YYYY HH:MM:SS');
        const {from,to,recordingFields,headerFields,customFields,perCallNotes,exportFields,reportFormat,notifyEmail,notifySms,campaigns,inboundGroup,lists,statuses,userGroups} = this.state;

        const data = {
            'fromDate':from,
            'toDate' :to,
            'recordingFields':recordingFields,
            'headerFields':headerFields,
            'customFields':customFields,
            'perCallNotes':perCallNotes,
            'exportFields':exportFields,
            'reportFormat':reportFormat,
            'notifyEmail':notifyEmail,
            'notifySms':notifySms,
            'campaigns':campaigns,
            'inboundGroup':inboundGroup,
            'lists':lists,
            'statuses':statuses,
            'userGroups':userGroups
        }

        console.log(data);
    }

    handleFromChange = (fromDate) => {
        this.setState({ from : moment(fromDate).format('YYYY-MM-DD') });
    }

    handleToChange = (toDate) => {
        this.setState({ to:moment(toDate).format('YYYY-MM-DD')});
    }        

    render() {
        const {from,to,recordingFields,headerFields,customFields,perCallNotes,exportFields,reportFormat,notifyEmail,notifySms,campaigns,inboundGroup,lists,statuses,userGroups} = this.state;
        
        
    return (
        <div>

            <ContainerHeader match={this.props.match} title='Export Calls Report'/>

            <div className="row">
                <CardBox styleName="col-lg-12" heading={""}>
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
                                label={"Header Fields:"} 
                                onChange={this.handleChange}
                                name={'headerFields'}
                                selectedValue={headerFields}
                                data={HEADERFIELDS}
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

                            <Dropdown 
                                label={"Report Format"} 
                                onChange={this.handleChange}
                                name={'reportFormat'}
                                selectedValue={reportFormat}
                                data={FORMATS}
                            />

                            <FormControl className="w-100 mb-2">
                                <TextField
                                    margin="normal"
                                    id="notifyEmail"
                                    label="Notify Email:"
                                    fullWidth
                                    value={this.state.notifyEmail || ''}
                                    onChange={this.handleTextChange('notifyEmail')}
                                />
                                
                            </FormControl>
                            <FormControl className="w-100 mb-2">
                                <TextField
                                    margin="normal"
                                    id="notifySms"
                                    label="Notify By SMS"
                                    fullWidth
                                    value={this.state.notifySms || ''}
                                    onChange={this.handleTextChange('notifySms')}
                                />
                            </FormControl>

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
                            
                            <MultipeDropdown 
                                label={"Statuses"} 
                                options={names} 
                                onChange={this.handleChange}
                                name={'statuses'}
                                selectedValue={statuses}
                            />
                        
                            <MultipeDropdown 
                                label={"User Groups"} 
                                options={names} 
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


export default Exportcall;