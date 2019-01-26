import React, {Component} from 'react';
import {UncontrolledAlert, Alert} from 'reactstrap';
import SweetAlert from 'react-bootstrap-sweetalert'
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ContainerHeader from '../../../../../../../components/ContainerHeader/index';
import CardBox from '../../../../../../../components/CardBox/index';
import CustomPicker from '../../../../../../../components/pickers/routes/Color/customPicker';
import IntlMessages from '../../../../../../../util/IntlMessages';
import {createNotification} from '../../../../../../../Helpers'; 

import ButtonNav from '../../../../../../../components/navButton/';
import axios from 'axios';
import {connect} from 'react-redux';

class Add extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            pageTitle: this.props.location.pathname.split('/')[4],
            agentGroupName :'',
            showinfo:'Hover to the input on left and help text will come up here :)',
            showinfotitle :'Help Block',
            agentGroupDescription:'',
            agentGroupNameError:false,
            agentGroupDescriptionError :false,
            agentGroupIdError:false,
            showAlert:false,
            alertContent:'',
            alertTitle :'',


        };

    }

    componentDidMount() {  

      

       }

    componentWillReceiveProps(nextPropsFromRedux) {

              //this.state.showMessage ?  this.setState({is_change:false})  : '' ;
      }

    
    handleShowAlert = (flag) => {this.setState({showAlert: flag}); };
    
    handleChange = name => event => { this.setState({ [name]: event.target.value ,is_change :true}); };
    
    handleRequestClose = value => {this.setState({voicemail: value, open: false}); };

    logMouseEnter = (e) => {  if( e.target.getAttribute('data-info')){this.setState({showinfo:e.target.getAttribute('data-info')}), this.setState({showinfotitle:e.target.getAttribute('data-title')})}}

    logMouseLeave = (e) => { if(e){} }

    handleActiveSVTChange = (event,checked) => {this.setState({enableAgentStatusVT:checked}); this.setState({enableAgentStatusVTValue:checked?'Y':'N',is_change :true});}

    handleActiveCLVChange = (event,checked) => {this.setState({enableAgentStatusCLT:checked});this.setState({enableAgentStatusCLTValue:checked?'Y':'N',is_change :true});}

    onCancelAlert = () => { this.setState({showAlert: false});};
    
    handleSubmit = () =>{
        let agentGroupName=this.state.agentGroupName;
        let agentGroupDescription =this.state.agentGroupDescription;

        
        let error=false;    
         agentGroupName =='' ? (this.setState({agentGroupNameError: true}) ,error=true) :this.setState({agentGroupNameError: false})
         agentGroupDescription =='' ? (this.setState({agentGroupDescriptionError: true}) ,error=true): this.setState({agentGroupDescriptionError: false});

        
        if(!error){


         let postData = {
                 'user_group':agentGroupName,
                 'group_name':agentGroupDescription,
   
            };

           // this.props.updateRecord(postData);
             console.log(postData)
             this.submitDataHandler(postData);
            
        }
    }

   submitDataHandler = (postData) => {
       if(postData){
          axios.post('/api/agentgroup-create',postData).then(response=>{

              createNotification("Success","Success",response.data.message) 
              this.props.history.goBack();

               }).catch(error =>{
              //let flag = 0;  
              createNotification("Error","Error",error.response.data.msg.user_group)
                 //this.setState({error_msg_user:error.response.data.msg.user_group,error_msg:true,error_msg_pass:error.response.data.msg.pass})
              })
          }

      };

    
   
    render() {

        const {pageTitle, pageError,agentGroupDescriptionError,agentGroupNameError,agentGroupName,showAlert,alertTitle,alertContent,agentGroupDescription


        } = this.state;

        if (pageTitle=='edit' && pageError) {
            return (
                    <div>
                        <ContainerHeader match={this.props.match} title={pageTitle+' agent'}/>
                    
                        <Alert className="shadow-lg" color="danger">
                            <h3 className="alert-heading">Agent Not Found</h3>
                            <p>
                              We can not locate your Agent, please check your  id.  
                            </p>
                        </Alert>
                    
                    </div>

                    );
        } else {

            return (
                    <div>
                        <ContainerHeader match={this.props.match} title={pageTitle+' Group'} style={{marginBottom: '8px'}}/>
                         {this.state.is_change && (  <ButtonNav  click={this.handleSubmit}/> ) }
                
                         <SweetAlert show={showAlert} success={alertTitle==='Success'?true:false} error={alertTitle==='Error'?true:false} title={alertTitle} onConfirm={this.onCancelAlert} onCancel={this.onCancelAlert}> {alertContent}  </SweetAlert> 
                              
                          <div className="row">
                
                            <CardBox styleName="col-lg-8"
                             heading={pageTitle=='add'?'Add new Group':agentGroupName}>
                            <form className="row" noValidate autoComplete="off">
                                <div className="col-md-6 col-6"
                                data-info='This is Agent Group must be between 2-20 character in a length.'  data-title='Group'   onMouseEnter={this.logMouseEnter} onMouseLeave={this.logMouseLeave}>
                                    <TextField
                                        id="agent-id"
                                        onChange={this.handleChange('agentGroupName')}
                                        label="Agent ID *"
                                        value={agentGroupName}
                                        margin="normal"
                                        fullWidth/>
                                </div>
                                
                                 <div className="col-md-12   col-6" data-info=' This is the description of the User Group must be between 2-40 character in a length.. '  data-title='Description'   onMouseEnter={this.logMouseEnter} onMouseLeave={this.logMouseLeave}>
                                                <TextField
                                                    id="agent-password-id"
                                                    label="Description "
                                                    margin='normal'
                                                    fullWidth  
                                                    value={agentGroupDescription}
                                                    onChange={this.handleChange('agentGroupDescription')}
                                                    
                                  />
                                  </div>
      
                            </form>
                            </CardBox>
                           <div className="col-lg-4" style={{display: 'grid'}}>
                             <div className="jr-card ">
                                 <div className="jr-card-body ">
                                    <div className="col-md-12 col-12 mt-12">           
                                      <div>
                                        <div className="card-body">
                                        <h3 className="card-title">{this.state.showinfotitle!='' ? this.state.showinfotitle : 'title'}</h3>
                                        <p className="card-text">{this.state.showinfo} </p>
                                        </div>
                                        </div>
                                        </div>
                                    </div>
                                </div>

                         </div>
                           {
                                this.state.isLoading &&
                                <div className="loader-view" style={{left:'0',  bottom: '0',right: '0',top: '0',position: 'fixed'}}>
                                    <CircularProgress/>
                                </div>
                            }
                        </div>
                      
                    </div>
                    );
        }
    }
}

export default (Add);
