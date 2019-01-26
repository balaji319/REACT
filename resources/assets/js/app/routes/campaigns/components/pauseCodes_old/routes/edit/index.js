import {  Tooltip, IconButton   } from '../list/plugins';

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
import VoicemailPopUp from '../../../../../../../components/VoicemailPopUp/VoicemailPopUp';
//import { fetchAgent,updateRecord } from '../../../../actions/';
//import { getAllCampaign } from '../../../../../../../actions/Global';
import { StickyContainer, Sticky } from 'react-sticky';
import {mail_data, style_header, agents_edit_data, billable_options } from './data';
import axios from 'axios';
import {connect} from 'react-redux';
import ButtonNav from '../../../../../../../components/navButton/';
import TextError from '../../../../../../../components/common/TextError';


class Edit extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            pageTitle: this.props.location.pathname.split('/')[4],
            agentId: this.props.location.pathname.split('/')[4]=='add'?'': this.props.location.pathname.split('/').pop(),
            showinfo:'Hover to the input on left and help text will come up here :)',
            showinfotitle :'Help Block',
            agent:this.props.location.pathname.split('/')[4],
            agentIdError:'',
            pageError:'',
            user:'',
            agentfullname:'',
            password:'',
            usergroup:'',
            selectedValue: mail_data[1].mailboxes,
            voicemail:'',
            data:[],
            voicemailData:[],
            viciPhoneList:[],
            open: false ,
            is_change: false ,
            agentemail:'',
            showAlert :false,
            alertContent:'',
            agentnameError :false,
            alertTitle :'',
            manual_dial_cid:'',
            agents_group:[],
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

            agents_edit_data: agents_edit_data,
            billable_options : billable_options,
            pausecode:'',
            pause_code_name:'',
            billable:'',
            pausecodeError :false,
            pausecodeNameError:false,
            billableError:false,
            error:false,
            success:false

        };

    }
 /*   addPauseCodes() {
     console.log(this.state);
        //alert(this.state.pausecode);
    }*/

     addPauseCodes = () => { 
      let pausecode = this.state.pausecode;
      let pause_code_name = this.state.pause_code_name;
      let billable = this.state.billable;
      let temp_error=false;

      (pausecode!='')? this.setState({pausecodeError:false, error:false}) : (this.setState({pausecodeError:true, error:true}), temp_error=true);
      (pause_code_name!='')? this.setState({pausecodeNameError:false, error:false}) : (this.setState({pausecodeNameError:true, error:true}), temp_error=true);
     
      if(!temp_error) {
        this.setState({success:true})
      } else {
        alert('error')
      }

     };

    componentDidMount() {  
      
      //this.props.getAllCampaign(['camp','agentgroup']);
     // this.props.fetchAgent(this.state.agentId);

       }

    componentWillReceiveProps(nextPropsFromRedux) {
              this.setState({ 
                   alertTitle: nextPropsFromRedux.Agent.alertMessageTitle,
                   showAlert:nextPropsFromRedux.Agent.showMessage,
                   alertContent: nextPropsFromRedux.Agent.alertMessage,
                   data: nextPropsFromRedux.Agent.data,
                   enableAgentActive:nextPropsFromRedux.Agent.data.user_info && nextPropsFromRedux.Agent.data.user_info.active == "N" ?  false : true ,
                   enableAgentActiveValue:nextPropsFromRedux.Agent.data.user_info ? nextPropsFromRedux.Agent.data.user_info.active : "Y",
                   enableAgentobActive:(nextPropsFromRedux.Agent.data.user_info && nextPropsFromRedux.Agent.data.user_info.closer_default_blended === "0") ?  false : true ,
                   enableAgentobActiveValue:(nextPropsFromRedux.Agent.data.user_info && nextPropsFromRedux.Agent.data.user_info.closer_default_blended === "0") ? "N" : "Y",
                   enableAgentqueueActive:(nextPropsFromRedux.Agent.data.user_info && nextPropsFromRedux.Agent.data.user_info.agent_choose_ingroups === "0") ?  false : true ,
                   enableAgentqueueActiveValue:(nextPropsFromRedux.Agent.data.user_info && nextPropsFromRedux.Agent.data.user_info.agent_choose_ingroups === "0") ? "N" : "Y",
                   enableAgentmdActive:(nextPropsFromRedux.Agent.data.user_info && nextPropsFromRedux.Agent.data.user_info.agentcall_manual === "0") ?  false : true ,
                   enableAgentmdActiveValue:(nextPropsFromRedux.Agent.data.user_info && nextPropsFromRedux.Agent.data.user_info.agentcall_manual === "0") ? "N" : "Y",
                   enableAgentcbActive:(nextPropsFromRedux.Agent.data.user_info && nextPropsFromRedux.Agent.data.user_info.agentonly_callbacks === "0") ?  false : true ,
                   enableAgentcbActiveValue:(nextPropsFromRedux.Agent.data.user_info && nextPropsFromRedux.Agent.data.user_info.agentonly_callbacks === "0") ? "N" : "Y",
                   voicemailData:(nextPropsFromRedux.Agent.data.voicemail && nextPropsFromRedux.Agent.data.voicemail != "") ? nextPropsFromRedux.Agent.data.voicemail  : [] ,
                   viciPhoneListData:(nextPropsFromRedux.Agent.data.viciPhoneList && nextPropsFromRedux.Agent.data.viciPhoneList != "") ? nextPropsFromRedux.Agent.data.viciPhoneList  : [] ,
                   agentemail:(nextPropsFromRedux.Agent.data.user_info && nextPropsFromRedux.Agent.data.user_info.email != "") ? nextPropsFromRedux.Agent.data.user_info.email  : "" ,
                   user:(nextPropsFromRedux.Agent.data.user_info && nextPropsFromRedux.Agent.data.user_info.user != "") ? nextPropsFromRedux.Agent.data.user_info.user  : "" ,
                   agentfullname:(nextPropsFromRedux.Agent.data.user_info && nextPropsFromRedux.Agent.data.user_info.full_name != "") ? nextPropsFromRedux.Agent.data.user_info.full_name  : "" ,
                   password:(nextPropsFromRedux.Agent.data.user_info && nextPropsFromRedux.Agent.data.user_info.pass != "") ? nextPropsFromRedux.Agent.data.user_info.pass  : "" , 
                   manual_dial_cid :(nextPropsFromRedux.Agent.data.manual_dial_cid && nextPropsFromRedux.Agent.data.user_info.manual_dial_cid != "") ? nextPropsFromRedux.Agent.data.user_info.manual_dial_cid  : ""  ,
                   voicemail:(nextPropsFromRedux.Agent.data.user_info && nextPropsFromRedux.Agent.data.user_info.voicemail_id != "") ? nextPropsFromRedux.Agent.data.user_info.voicemail_id  : "" ,
                   usergroup:(nextPropsFromRedux.Agent.data.user_info && nextPropsFromRedux.Agent.data.user_info.user_group != "") ? nextPropsFromRedux.Agent.data.user_info.user_group  : "" , 
                   agents_group:(nextPropsFromRedux.Global.agentgroup ) ? nextPropsFromRedux.Global.agentgroup : ""   
                                                     
              });

            

      }

    handleShowAlert = (flag) => {this.setState({showAlert: flag}); };
    
    handleChange = name => event => { this.setState({ [name]: event.target.value ,is_change :true}); };
    
    handleRequestClose = value => {this.setState({voicemail: value, open: false}); };

    handleActiveChange = (event,checked) => {this.setState({enableAgentActive:checked});this.setState({enableAgentActiveValue:checked?'Y':'N',is_change :true}); }

    handleActivequeueChange = (event,checked) => {this.setState({enableAgentqueueActive:checked});this.setState({enableAgentqueueActiveValue:checked?'Y':'N',is_change :true});}

    handleActivecbChange = (event,checked) => { this.setState({enableAgentcbActive:checked});this.setState({enableAgentcbActiveValue:checked?'Y':'N',is_change :true});}

    handleActiveobChange = (event,checked) => {this.setState({enableAgentobActive:checked}); this.setState({enableAgentobActiveValue:checked?'Y':'N',is_change :true});}

    handleActivemdChange = (event,checked) => {this.setState({enableAgentmdActive:checked});this.setState({enableAgentmdActiveValue:checked?'Y':'N',is_change :true});}

    logMouseEnter = (e) => {  if(e.target.getAttribute('data-info')){this.setState({showinfo:e.target.getAttribute('data-info')}), this.setState({showinfotitle:e.target.getAttribute('data-title')})}}

    logMouseLeave = (e) => { if(e){} }
     
    onCancelAlert = () => { this.setState({showAlert: false});};
    
    //handleSubmit1 = () => { alert('work')}

    handleSubmit = () =>{
        let agentId = this.state.agentId;
        let agentName=this.state.agenttName;
        let user=this.state.user;
        let agentfullname=this.state.agentfullname;
        let password=this.state.password;
        let usergroup=this.state.usergroup;
        let voicemail=this.state.voicemail;
        let agentemail=this.state.agentemail;
        let manual_dial_cid=this.state.manual_dial_cid;
        
        
        let error=false;    
         agentfullname=='' ? (this.setState({agentnameError: true}) ,error=true) :this.setState({agentnameError: false})
         password=='' ? (this.setState({agentpasswordError: true}) ,error=true): this.setState({agentpasswordError: false});

        if(!error){

         let postData = {
                  'user_id':agentId,
                  'full_name':agentfullname,
                  'name':user,
                  'user_group':usergroup,
                  'pass':password,
                  'agentName':agentfullname,
                  'voicemail_id':voicemail,
                  'email':agentemail,
                  'manual_dial_cid':manual_dial_cid,
                  'active':this.state.enableAgentActiveValue,   
                  'agent_choose_ingroups':this.state.enableAgentqueueActiveValue,
                  'agentcall_manual':this.state.enableAgentmdActiveValue,
                  'agentonly_callbacks':this.state.enableAgentcbActiveValue,
                  'closer_default_blended': this.state.enableAgentobActiveValue,
          };


            //this.props.updateRecord(postData);
            //console.log("GOOD")
             console.log(postData)
            let _this=this;
           
            
        }
    }
    
   
    render() {

        const {
            showAlert,alertTitle,alertContent,pageTitle,voicemailData, viciPhoneListData,pageError,agentId,agentName,password,agentfullname,usergroup,agentemail,agentIdError,agentpasswordError,agentnameError, enableAgentobActive,enableAgentobActiveValue,enableAgentActive,
            enableAgentActiveValue,data,manual_dial_cid, agents_group,enableAgentqueueActive,user,enableAgentqueueActiveValue,enableAgentmdActive, enableAgentmdActiveValue, enableAgentcbActive,enableAgentcbActiveValue,
            pausecode, error, success
           } = this.state;
           
           const {user_info,admin_user_group_list,viciPhoneList,voicemail}=data;
           const divStyle = {padding: '4px 30px 4px 24px',textAlign:'center'};
            var data_style = {borderColor: '#ced4da'};

            if(error){
              var data_style = {borderColor: '#EC2C26'};
              console.log("errorerrorerrorerrorerrorerrorerrorerror")
              console.log(billable_options)

            }else{
              console.log("----------------------------")
              console.log(voicemailData)
             
            }

  
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
                        <ContainerHeader match={this.props.match} title={pageTitle+' Agent : '+ user } style={{marginBottom: '8px'}}/>
                        
                         {this.state.is_change && ( 
                                 <ButtonNav  click={this.handleSubmit}/>

                               ) }
                
                        <SweetAlert show={showAlert} success={alertTitle==='Success'?true:false} error={alertTitle==='Error'?true:false} title={alertTitle} onConfirm={this.onCancelAlert} onCancel={this.onCancelAlert}> {alertContent}  </SweetAlert>     
                        <div className="row">
                           <CardBox styleName="col-lg-12" >
                            <form className="row" noValidate autoComplete="off">
                            <div  className="sub_menu_div" style={style_header} > <i className="fa fa-bars"  style={{marginRight:'10px'}} ></i>Agent</div>
    


                                <table className="table table-hover">
                                  <thead>
                                        <tr><th ><center>Pause Code</center></th>
                                        <th ><center>Pause Code Name</center></th>
                                        <th ><center>Billable</center></th>
                                        <th ><center>Modify</center></th>
                                        <th ><center>Delete</center></th>
                                        </tr>
                                  </thead>
                                  <tbody>
                                  {
                                    this.state.agents_edit_data.map((agent, index) => {
                                        return (
                                          <tr key={index}>
                                            <td >{agent.id}</td>
                                            <td><input name="pause_code_name" className="form-control" type="text" id="pause_code_name-11" value={agent.pause_code_name} /></td>
                                            <td>
                                              <select className="form-control" id="billable-11" name="billable">
                                                { 
                                                  this.state.billable_options.map(billable_option => {
                                                      return (
                                                         <option  value={billable_option.value}>{billable_option.label}</option>
                                                      )
                                                  })
                                                }
                                              </select>
                                            </td>
                                            <td  style={{textAlign:'center'}}>
                                              <a style={ divStyle } className='text-center' style={{whiteSpace:'nowrap'}}>
                                                   <Tooltip title="Modify Script">
                                                        <IconButton>
                                                            <i className='zmdi zmdi-edit' style={{cursor:'pointer'}}/>
                                                        </IconButton>     
                                                    </Tooltip>
                                              </a>
                                            </td>
                                            <td  style={{textAlign:'center'}}>
                                              <a style={ divStyle } className='text-center' style={{whiteSpace:'nowrap'}}>
                                                   <Tooltip title="Modify Script">
                                                        <IconButton>
                                                            <i className='zmdi zmdi-close' style={{cursor:'pointer'}}/>
                                                        </IconButton>     
                                                    </Tooltip>
                                              </a>
                                            </td>
                                          </tr>
                                        )
                                    })
                                  }


                                  </tbody>
                                </table>
                               
                                <div  className="sub_menu_div" style={style_header} > <i className="fa fa-bars"  style={{marginRight:'10px'}} ></i>Other Settings</div>
                                  <div className="col-md-12">

                                    <table className="table table-hover" style={{width:'100%'}}>
                                      <tbody>
                                        <tr>
                                          <td style={{width:'18%'}}>
                                            <div className="input text">
                                              <input name="pausecode" id="pause_code" style={ data_style } className="form-control tooltip-primary" data-toggle="tooltip" onChange={this.handleChange('pausecode')} data-placement="top" title="" maxLength="6" placeholder="Pause Code" data-original-title="This is Pause Code ID Field and It is required" required="required" type="text" /></div>       
                                          </td>
                                          <td style={{width:'39%'}}> 
                                            <div className="input text"><input name="pause_code_name" style={ data_style } id="pause_code_name" className="form-control tooltip-primary" onChange={this.handleChange('pause_code_name')} data-toggle="tooltip" data-placement="top" title="" placeholder="Pause Code Name" data-original-title="This is Descriptive name of Pause Code Field and It is required" required="required" type="text" /></div>            
                                          </td>
                                          <td style={{width:'18.5%'}}> 
                                            <div className="input select">
                                              <select name="billable" id="billable" onChange={this.handleChange('billable')} className="form-control  tooltip-primary" data-toggle="tooltip" data-placement="top" title="" placeholder="YES" data-original-title="This fields decides wheater pause code is billable or not.">
                                                <option value="YES">YES</option>
                                                <option value="NO">NO</option>
                                                <option value="HALF">HALF</option>
                                              </select>
                                             
                                            </div>             
                                          </td>
                                          <td style={{textAlign:'center'}}>
                                              <a style={ divStyle } className='text-center' style={{whiteSpace:'nowrap'}} onClick={this.addPauseCodes}>
                                                   <Tooltip title="Add Script">
                                                        <IconButton>
                                                            <i className='fa fa-plus' style={{cursor:'pointer'}}/>
                                                        </IconButton>     
                                                    </Tooltip>
                                              </a>
                                          </td>
                                          </tr>        
                                        </tbody>
                                    </table>
                                    {
                                      (error) && 
                                        <TextError Type="alert-danger" msg='field required'/> 

                                    }
                                    {
                                        (success) &&
                                        <TextError Type="alert-success" msg='successfully added'/> 
                                    }
                              </div>

                            </form>
                            </CardBox>
          
                           {
                                this.props.Agent.isLoading &&
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


function mapStateToProps(state, ownProps) {
    return {
        Agent: state.agent,
        Global:state.globel

    };
}

 const mapDispatchToProps = {
  
    };  
    
export default connect(mapStateToProps, mapDispatchToProps)(Edit);
