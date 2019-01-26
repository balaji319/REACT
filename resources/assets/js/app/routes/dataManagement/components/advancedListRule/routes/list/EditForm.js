import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CardBox from '../../../../../../../components/CardBox/index';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import {Alert} from 'reactstrap';
import {DateTimePicker} from 'material-ui-pickers';

import moment from 'moment';


import { names, campaigns  } from './data';
import MultipeDropdown from '../common/MultipeDropdown';
import Dropdown from '../common/Dropdown';

const CONDITIONS =   ['Equal (=)','Not Equal (≠)','Greater Than or Equal (≥)', 'Greater Than (>)', 'Less Than or Equal (≤)', 'Less Than (<)', 'Between',
                 'Not Between', 'In', 'Not In'];

class FormDialog extends React.Component {
    constructor(props) {
    super(props);  
        this.state = {
            checkedA: true,        
            checkedB: true,  
            userGroups:[],
            campaignsGroups:[],
            cc_conditions: "Not Apply",
            entryDate_conditions: "Not Apply",
            localCall_conditions: "Not Apply",
            entry_fromSelectedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            entry_toSelectedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), 
            last_fromSelectedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            last_toSelectedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), 
            settings_SelectedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), 
            open: false,
        };
        
        // this.handleSubmit = this.handleRequestClose.bind(this);
    
    } 
     
    
   handleChange = name => (event, checked) => {
        this.setState({[name]: checked});
    };
    
    
    entry_handleDateChangeFrom = (date) => {
        this.setState({entry_fromSelectedDate: moment(date).format('YYYY-MM-DD HH:mm:ss')});
        
    };
    
    entry_handleDateChangeTo = (date) => {
        this.setState({entry_toSelectedDate: moment(date).format('YYYY-MM-DD HH:mm:ss')});
  
    }; 
    
    last_handleDateChangeFrom = (date) => {
        this.setState({ last_fromSelectedDate: moment(date).format('YYYY-MM-DD HH:mm:ss')});

    };
    
    last_handleDateChangeTo = (date) => {
        this.setState({last_toSelectedDate: moment(date).format('YYYY-MM-DD HH:mm:ss')});
  
    }; 
    
    settings_handleDateChange = (date) => {
        this.setState({settings_SelectedDate: moment(date).format('YYYY-MM-DD HH:mm:ss')});
  
    };   
    
   setSelectOptions = (name,value) =>{
        this.setState({
            [name]:value,
        });          
    }
    
    handleRequestClose = () => {
        this.setState({open: false});
        this.props.onClose(this.state.open);
    };  
    
    handleSubmit=()=>{                     
        console.log(this.state);
        this.props.onClose(this.state.open);
    } 
    
       

    render() {
        const {userGroups, campaignsGroups, cc_conditions, entryDate_conditions, localCall_conditions, entry_fromSelectedDate, entry_toSelectedDate, last_fromSelectedDate, last_toSelectedDate, settings_SelectedDate} = this.state;
        return (
            <div>  
            
                <DialogTitle>Modify Rule</DialogTitle>
                <DialogContent>
                    <Alert className="shadow-lg" color="warning">
                            This is an advanced feature, please make sure you know what you are doing. Once leads are changed, 
                            there is no way to rollback the changes! Contact ytel support support@ytel.com if you have any questions. Thanks.
                    </Alert>
                    <br />
        
                    <div className="row">
                    <CardBox styleName="col-lg-12" >
                        <form className="row" autoComplete="off">
                            <div className="col-lg-6 col-sm-6 col-12">
                                <h3>FROM</h3>
                                <FormControl className="w-100 mb-2">
                                    <MultipeDropdown 
                                        label={"From List ID"} 
                                        options={names} 
                                        onChange={this.setSelectOptions}
                                        name={'userGroups'}
                                        selectedValue={userGroups}
                                    />
                                    <small>Leave it empty to apply to all list</small>
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <MultipeDropdown 
                                        label={"From Campaign ID"} 
                                        options={campaigns} 
                                        onChange={this.setSelectOptions}
                                        name={'campaignsGroups'}
                                        selectedValue={campaignsGroups}
                                    />
                                    <small>Leave it empty to apply to all list</small>
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <TextField
                                        margin="dense"
                                        id="name"
                                        label="From Status"
                                        type="email"
                                        fullWidth
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <TextField
                                        margin="dense"
                                        id="name"
                                        label="Called Since Last Reset"
                                        type="email"
                                        fullWidth
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">  
                                    
                                        <TextField
                                            margin="dense"
                                            id="name"
                                            label="At Least # Days Since Entry Date"
                                            type="email"
                                            fullWidth
                                            title="Leave empty if you do not want to use this filter"
                                        />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <TextField
                                        margin="dense"
                                        id="name"
                                        label="At Least # Days Since Last Local Call Time"
                                        type="email"
                                        fullWidth
                                        title="Leave empty if you do not want to use this filter"                                        
                                    />
                                </FormControl>
                                
                                <FormControl className=" mb-2 W-45 MR-5">                                                                   
                                    <Dropdown 
                                        label={"Condition"} 
                                        onChange={this.setSelectOptions}
                                        name={'cc_conditions'}
                                        selectedValue={cc_conditions}
                                        data={CONDITIONS}
                                    />
                                </FormControl>
                        
                                <FormControl className=" mb-2 W-45 ML-5">                                                                   
                                    <TextField
                                        margin="dense"
                                        id="name"
                                        label="Called Count"
                                        type="email"
                                        fullWidth
                                        title="Use comma to seprate numbers. Some conditions will only use the first number."
                                    />
                                </FormControl>
                        
                                <FormControl className=" mb-2 W-45 MR-5">                                                                   
                                    <Dropdown 
                                        label={"Condition"} 
                                        onChange={this.setSelectOptions}
                                        name={'entryDate_conditions'}
                                        selectedValue={entryDate_conditions}
                                        data={CONDITIONS}
                                    />
                                </FormControl>
                        
                                <FormControl className=" mb-2 W-45 ML-5">  
                                    <div key="datetime_default" className="picker">
                                    <DateTimePicker
                                        fullWidth
                                        value={entry_fromSelectedDate}
                                        showTabs={false}
                                        format='YYYY/MM/DD HH:mm:ss'
                                        onChange={this.entry_handleDateChangeFrom}
                                        leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                                        rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                                    />
                                    {entryDate_conditions == "Between" || entryDate_conditions == "Not Between"?    
                                    
                                    <DateTimePicker
                                        fullWidth
                                        value={entry_toSelectedDate}
                                        showTabs={false}
                                        format='YYYY/MM/DD HH:mm:ss'
                                        onChange={this.entry_handleDateChangeTo}
                                        leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                                        rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                                        name={"entry_toSelectedDate"}
                                    />: ""}
                                    </div>
                                </FormControl>  
                        
                                <FormControl className=" mb-2 W-45 MR-5">                                                                   
                                    <Dropdown 
                                        label={"Condition"} 
                                        onChange={this.setSelectOptions}
                                        name={'localCall_conditions'}
                                        selectedValue={localCall_conditions}
                                        data={CONDITIONS}
                                    />
                                </FormControl>
                        
                                <FormControl className=" mb-2 W-45 ML-5">                                                                   
                                     <div key="datetime_default" className="picker">
                                    <DateTimePicker
                                        fullWidth
                                        value={last_fromSelectedDate}
                                        showTabs={false}
                                        format='YYYY/MM/DD HH:mm:ss'
                                        onChange={this.last_handleDateChangeFrom}
                                        leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                                        rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                                    />
                                    {localCall_conditions == "Between" || localCall_conditions == "Not Between"?    
                                    
                                    <DateTimePicker
                                        fullWidth
                                        value={last_toSelectedDate}
                                        showTabs={false}
                                        format='YYYY/MM/DD HH:mm:ss'
                                        onChange={this.last_handleDateChangeTo}
                                        leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                                        rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                                    />: ""}
                                    </div>
                                </FormControl>  
                        
                                <Alert className="shadow-lg" color="warning">
                                    This will apply to all the leads, please make sure you want to do that. To limit it, please apply filters.
                                </Alert>
                            </div>
                            
                            <div className="col-lg-6 col-sm-6 col-12">
                            <h3>TO</h3>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <TextField
                                        margin="dense"
                                        id="name"
                                        label="To List ID"
                                        type="email"
                                        fullWidth
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <TextField
                                        margin="dense"
                                        id="name"
                                        label="To Status ID"
                                        type="email"
                                        fullWidth
                                    />
                                </FormControl>
                        
                                <FormControl className="w-100 mb-2">  
                                    <label htmlFor="Reset Called">Reset Called Since Last Reset</label>
                                   <Switch
                                        classes={{
                                            checked: 'text-primary',
                                            bar: 'bg-primary',
                                        }}
                                        checked={this.state.checkedA}
                                        onChange={this.handleChange('checkedA')}
                                        aria-label="checkedA"
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">     
                                    <div className="row">
                                        <div className="col-5"> 
                                            <strong>Entry Date</strong><br/>
                                            <span>2018-05-17 00:16:07</span><br/> 
                                         </div>
                                        <div className="col-7"> 
                                            <strong>Last Updated Lead Count</strong><br/>
                                            <span>0</span><br/>  
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-5"> 
                                            <strong>Last Exec</strong><br/>
                                            <span>2018-07-10 14:15:02</span><br/> 
                                         </div>
                                        <div className="col-7"> 
                                            <strong>Next Exec</strong><br/>
                                            <span>2018-07-10 15:15:02</span><br/>  
                                        </div>
                                    </div>
                                </FormControl>
                            </div>
                            
                            <div className="col-lg-12 col-sm-12 col-12">
                            <h3>Settings</h3>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <TextField
                                        margin="dense"
                                        id="name"
                                        label="Interval (Hour)"
                                        type="number"
                                        fullWidth
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <div key="datetime_default" className="picker">
                                        <DateTimePicker
                                            fullWidth
                                            value={settings_SelectedDate}
                                            showTabs={false}
                                            format='YYYY/MM/DD HH:mm:ss'
                                            onChange={this.settings_handleDateChange}
                                            leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                                            rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                                        />
                                    </div>
                                </FormControl>
                        
                                <FormControl className="w-100 mb-2">  
                                    <label htmlFor="Reset Called">Active</label>
                                   <Switch
                                        classes={{
                                            checked: 'text-primary',
                                            bar: 'bg-primary',
                                        }}
                                        checked={this.state.checkedB}
                                        onChange={this.handleChange('checkedB')}
                                        aria-label="checkedB"
                                    />
                                </FormControl>
                            </div> 
                        </form>
                    </CardBox>            
                    </div>
                </DialogContent>
                    <DialogActions>
                    <Button onClick={this.handleRequestClose} color="secondary">
                        Close
                    </Button>
                    <Button onClick={this.handleSubmit} color="primary">
                        Save
                    </Button>
                </DialogActions>
                
            </div>
        );
    }
}

export default FormDialog;
   // this.handleSubmit = this.handleRequestClose.bind(this);