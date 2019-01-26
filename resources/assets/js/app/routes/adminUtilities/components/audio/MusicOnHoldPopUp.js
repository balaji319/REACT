import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import AddIcon from '@material-ui/icons/Add';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import MenuItem from '@material-ui/core/MenuItem';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import SweetAlert from 'react-bootstrap-sweetalert'
import CircularProgress from '@material-ui/core/CircularProgress';
import CardBox from '../../../../../components/CardBox/index';
import {agents_group,mail_data,style_header } from './data';

class VoicemailPopUp extends Component {


 constructor(props) {
        super(props);
        this.state = {
            filtername: '',
            users :[],
            pageTitle: 's',
            showinfo:'Hover to the input on left and help text will come up here :)',
            showinfotitle :'Help Block',
            agent:'',
            agentIdError:'',
            pageError:'',
            agentfullname:'',
            password:'',
            usergroup:'',
            selectedValue: mail_data[1].mailboxes,
            voicemail:'',
            open: false ,
            is_change: false ,
            agentemail:'',
            showAlert :false,
            alertContent:'',
            agentnameError :false,
            alertTitle :'',
            agentpasswordError:false,
            enableAgentActive:true,
            enableAgentActiveValue:'Y',   
            enableAgentqueueActive:true,
            enableAgentqueueActiveValue:'Y',
            enableAgentmdActive:true,
            enableAgentmdActiveValue:'Y',
            enableAgentcbActive:true,
            enableAgentcbActiveValue:'Y',
            enableAgentobActive:true,
            enableAgentobActiveValue:'Y',
    
        };

    }
    handleRequestClose = () => {this.props.onClose(this.props.selectedValue);};

    handleListItemClick = value => {   this.props.onClose(value);};
     handleChange = name => event => { this.setState({ [name]: event.target.value ,is_change :true}); };
    


    handlefilterList =(event) => {
        let filterData=[];
        const filterItems = (query) => {
            this.props.users.filter((e) =>{  
               if( e.name.toLowerCase().indexOf(query.toLowerCase()) > -1 )
                {
                  filterData.push(e);
                }
            });
        }
         filterItems(event.target.value)
       if(filterData.length > 0)
         this.setState({users: filterData});         
       else
        this.setState({users: filterData});   
      
    };
    
    componentWillReceiveProps(){
          this.setState({users: this.props.users});
    }

    render() {
         
        const {classes,  onClose, selectedValue, ...other} = this.props;

            const {users,
            showAlert,alertTitle,alertContent,pageTitle, pageError,agentName,password,agentfullname,usergroup,agentemail,agentIdError,agentpasswordError,agentnameError, enableAgentobActive,enableAgentobActiveValue,enableAgentActive,
            enableAgentActiveValue, enableAgentqueueActive,enableAgentqueueActiveValue,enableAgentmdActive, enableAgentmdActiveValue, enableAgentcbActive,enableAgentcbActiveValue} = this.state;
        return (
            <Dialog onClose={this.handleRequestClose} {...other} id="moh_dailog_list"  >
                <DialogTitle>Add New MOH Entry</DialogTitle>
                <div id="table-1_filter" className="row" style={{width:'100%',paddingLeft: '45px'}}>
            <CardBox styleName="col-lg-8" >
                        
                            <form className="row" noValidate autoComplete="off">
                            <div  className="sub_menu_div" style={style_header} > <i className="fa fa-bars"  style={{marginRight:'10px'}} ></i>Add New MOH Entry</div>
                        
               

                                 <div className="col-md-12 col-6" 
                                                   data-info='The password agent uses to login to Ytel.This field is where you put the users password. Must be at least 2 characters in length. A strong user password should be at least 8 characters in length and have lower case and upper case letters as well as at least one number.' 
                                                   data-title='Password'
                                                   onMouseEnter={this.logMouseEnter} onMouseLeave={this.logMouseLeave}>
                                                <TextField
                                                    id="music-onhold-id"
                                                    label="Music On Hold ID *"
                                                    margin='normal'
                                                    fullWidth  
                                                    value={password}
                                                    onChange={this.handleChange('password')}
                                                     error={agentpasswordError}
                                  />
                                  </div>
                                     <div className="col-md-12 col-6" 
                                                  data-info=' Your Inbound Group ID
                                                  This is name of Inbound Group, must be between 2 and 20 characters in length. '  data-title='Group Name '
                                                  onMouseEnter={this.logMouseEnter} onMouseLeave={this.logMouseLeave}>
                                                <TextField
                                                    id="music-onhold-name"
                                                    label="Music On Hold Name *"
                                                    margin='normal'
                                                    fullWidth  
                                                    value={agentfullname}
                                                    error={agentnameError}
                                                    onChange={this.handleChange('agentfullname')} />

                                              
                                                </div>  
                                        <div className="col-md-12">
                                        <p className="MuiFormHelperText-root-253"  > Random Order </p>
                                            <div className="row"
                                                   data-info='To enable or disable the agent.' 
                                                   data-title='Enable'
                                                   onMouseEnter={this.logMouseEnter} onMouseLeave={this.logMouseLeave}>
                                                             <Switch label='Enable' onChange={this.handleActiveChange}  color="primary" defaultChecked={enableAgentActive} 
                                                              value={enableAgentActiveValue}/> </div>
                                                      </div>


                                        <div className="col-md-12">
                                                       <div className="form-group">
                                                           <TextField
                                                                id="music-moh-user-group-native"
                                                                select
                                                                label="Admin User Group"
                                                                helperText="Please select your User Group"
                                                                margin="normal"
                                                                tabIndex="-1"
                                                                value={usergroup}
                                                                onChange={this.handleChange('usergroup')}
                                                                fullWidth >
                                                                {agents_group.map(option => (
                                                                    <option key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </option>
                                                                ))}
                                                            </TextField> 
                                                        </div>
                                                    </div>

                                            <div className="col-md-12">
                                        <p className="MuiFormHelperText-root-253" > Outbound </p>
                                            <div className="row">
                                                             <Switch 
                                                                 label='Outbound '
                                                                 onChange={this.handleActiveChange}
                                                                 color="primary"
                                                                 onChange={this.handleActiveobChange}
                                                                  defaultChecked={enableAgentobActive}
                                                                  value={enableAgentobActiveValue}
                                                                    />
                                                                </div>
                                                      </div>                  
                          
                 
                       
                               
          
                             
                            </form>
                            </CardBox>
                           <div className="col-lg-4" style={{display: 'grid'}}>
                             <div className="jr-card ">
                                 <div className="jr-card-body ">
                                    <div className="col-md-12 col-12 mt-12">           
                                      <div>
                                        <div className="card-body" style={{padding:'0px'}}>
                                        <h3 style={{padding:'3px', fontSize: '23px'}}>{this.state.showinfotitle!='' ? this.state.showinfotitle : 'title'}</h3>
                                       <hr/>
                                        <p className="card-text">{this.state.showinfo} </p>
                                        </div>
                                        </div>
                                        </div>
                                    </div>
                                </div>

                         </div>
         
                </div>
             <div className="modal-footer">
                <button type="button" className="btn btn-success add-form-moh" id="add-form-moh" onclick="ajaxSaveData()">Save</button> 
                <button type="button" class="btn btn-blue close_audio" data-dismiss="modal" onClick={this.handleRequestClose}>Close</button>
            </div>
            </Dialog>
        );
    }
}

VoicemailPopUp.propTypes = {
    onClose: PropTypes.func,
    selectedValue: PropTypes.string,
};
export default VoicemailPopUp;
