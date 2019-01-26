import React, {Component} from 'react';
import {UncontrolledAlert, Alert} from 'reactstrap';
import SweetAlert from 'react-bootstrap-sweetalert'
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import ContainerHeader from '../../../../../../../components/ContainerHeader/index';
import CardBox from '../../../../../../../components/CardBox/index';
import CustomPicker from '../../../../../../../components/pickers/routes/Color/customPicker';
import IntlMessages from '../../../../../../../util/IntlMessages';
import VoicemailPopUp from '../../../../../../../components/VoicemailPopUp/VoicemailPopUp';
import { fetchcalltime,addcalltime} from '../../../../actions/';
import {agents_group,mail_data,style_header,week_days_calltime} from './data';
import axios from 'axios';
import {connect} from 'react-redux';
import AudioPopUp from './AudioPopUp';


class ADD extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            pageTitle: this.props.location.pathname.split('/')[4],
            callId: this.props.location.pathname.split('/')[4]=='add'?'': this.props.location.pathname.split('/').pop(),
            showinfo:'Hover to the input on left and help text will come up here :)',
            showinfotitle :'Help Block',
            pageError:'',
            is_change: false ,
            showAlert :false,
            alertContent:'',
            alertTitle:'',
            calltimename:'',
            calltimecomment:'',
            ct_default_start:'',
            ct_default_stop:'',
            usergroup:'',
            callIdError:false,
            calltimenameError:false,
            selectedMValue :'',
            open1:false,
              week_checked:week_days_calltime,
            state_call_time_id:'',
            state_call_time_comments:'',
            state_call_time_name:'',
            state_call_time_state:'',
            state_user_group:''

        };

    }

    componentDidMount() {

         if(this.state.pageTitle=='edit' ){
              this.props.fetchcalltime(this.state.callId);
            }

      }

    componentWillReceiveProps(nextPropsFromRedux) {

         if(nextPropsFromRedux.Agent.record_data){
                  let temp_comment =nextPropsFromRedux.Agent.record_data.data.call_time_comments === undefined  || nextPropsFromRedux.Agent.record_data.data.call_time_comments== null? "" :nextPropsFromRedux.Agent.record_data.data.call_time_comments;
                  let temp_usergroup =nextPropsFromRedux.Agent.record_data.data.user_group === undefined  || nextPropsFromRedux.Agent.record_data.data.user_group== null? "" :nextPropsFromRedux.Agent.record_data.data.user_group;
                  this.setState({  calltimename: nextPropsFromRedux.Agent.record_data.data.call_time_name, calltimecomment:temp_comment,usergroup:temp_usergroup });
          }
       this.setState({ alertTitle: nextPropsFromRedux.Agent.alertMessageTitle,showAlert:nextPropsFromRedux.Agent.showMessage, alertContent: nextPropsFromRedux.Agent.alertMessage,is_change:false })
      }

    handleShowAlert = (flag) => {this.setState({showAlert: flag}); };


    handleRequestClose1 = value => {  this.setState({ open1: false}); };

        handleCheckedChange(index, dataType, value , data) {
         let this_=this;
            const newState = this.state.week_checked.map((item, i) => {
              if (i == index) {
                return {...item, [dataType]: value};
              }
              return item;
            });
            this.setState({ week_checked: newState});
          }


    handleChange = name => event => { this.setState({ [name]: event.target.value ,is_change :true}); };

    logMouseEnter = (e) => {  if(e.target.getAttribute('data-info')){this.setState({showinfo:e.target.getAttribute('data-info')}), this.setState({showinfotitle:e.target.getAttribute('data-title')})}}

    logMouseLeave = (e) => { if(e){} }

    onCancelAlert = () => { this.setState({showAlert: false});};

    handleSubmit = () =>{

        let call_time_id = this.state.callId;
        let call_time_name=this.state.calltimename;
        let call_time_comments=this.state.calltimecomment;
        let usergroup=this.state.usergroup;
        let ct_default_start='900';
        let ct_default_stop='2100';

        let type = this.state.pageTitle =='add' ? 'add':'edit';

        let error=false;

        call_time_id =='' ? (this.setState({callIdError: true}) ,error=true) :this.setState({callIdError: false})
        call_time_name   =='' ? (this.setState({calltimenameError: true}) ,error=true) :this.setState({calltimenameError: false})


        if(!error){

         let postData = {
                  'call_time_id':call_time_id,
                  'call_time_name':call_time_name,
                  'call_time_comments':call_time_comments,
                  'usergroup':usergroup,
                  'ct_default_start':ct_default_start,
                  'ct_default_stop':ct_default_stop,
                  'type':type

            };

            this.props.addcalltime(postData);

      /*      this.props.updateRecord(postData);
             console.log(postData)
            let _this=this;*/

        }
    }


    render() {

      const {showAlert,alertTitle,alertContent,pageTitle, pageError, callId,calltimename,calltimecomment,usergroup,callIdError,calltimenameError,
          state_call_time_id ,state_call_time_comments, state_call_time_name,state_call_time_state,state_user_group} = this.state;
           //console.log(JSON.stringify(this.state.week_checked));

        if (pageTitle=='edit' && pageError) {
            return (
                    <div>
                        <ContainerHeader match={this.props.match} title={'Add New Call Time'}/>

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
                        <ContainerHeader match={this.props.match} title={'Edit Call Time'} style={{marginBottom: '8px'}}/>
                         {this.state.is_change ? ( <div className="col-lg-12" style={{padding: '0px'}}>
                                                     <div className="jr-card " style={{ padding: '2px',textAlign:'right',marginBottom:'14px'}}>
                                                         <div className="jr-card-body ">
                                                           <div className = "cardPanel teal">
                                                               <span className = "whiteText">
                                                                  <Button color="primary" className="jr-btn bg-success text-white" style={{marginBottom:'4px',marginRight:'26px'}} onClick={this.handleSubmit}>
                                                                      <span> {pageTitle=='add'?'Add':'Update'}  </span>
                                                                  </Button>
                                                               </span>
                                                            </div>
                                                            </div>
                                                        </div>
                                                        </div>
                           ) :''}
                         <SweetAlert show={showAlert} success={alertTitle==='Success'?true:false} error={alertTitle==='Error'?true:false} title={alertTitle} onConfirm={this.onCancelAlert} onCancel={this.onCancelAlert}> {alertContent}  </SweetAlert>
                          <div className="row">
                            <CardBox styleName="col-lg-8" >
                            <form className="row" noValidate autoComplete="off">
                                <div style={style_header} > <i className="fa fa-bars" style={{marginRight:'10px'}}></i>Modify A Call Time</div>
                                <div className="col-md-6 col-6"
                                               data-info="Your agent's login.This field is where you put the Agent ID number, can be up to 8 digits in length, Must be at least 2 characters in length."
                                               data-title='Shift ID'
                                               onMouseEnter={this.logMouseEnter} onMouseLeave={this.logMouseLeave}>
                                              <TextField
                                                  id="call-callId-id"
                                                  onChange={this.handleChange('callId')}
                                                  label="Call Time ID *"
                                                  value={callId}
                                                  disabled={pageTitle=='add'?false:true}
                                                  margin="normal"
                                                   error={callIdError}
                                                  fullWidth/>
                                          </div>


                                 <div className="col-md-12 col-6"
                                                   data-info='The password agent uses to login to Ytel.This field is where you put the users password. Must be at least 2 characters in length. A strong user password should be at least 8 characters in length and have lower case and upper case letters as well as at least one number.'
                                                   data-title='Password'
                                                   onMouseEnter={this.logMouseEnter} onMouseLeave={this.logMouseLeave}>
                                                     <TextField
                                                        id="call-callId-name"
                                                        label="Call Time Name *"
                                                        margin='normal'
                                                        fullWidth
                                                        value={calltimename}
                                                        onChange={this.handleChange('calltimename')}
                                                        error={calltimenameError}
                                                />


                                  </div>
                                  <div className="col-md-12 col-6"
                                                   data-info='The password agent uses to login to Ytel.This field is where you put the users password. Must be at least 2 characters in length. A strong user password should be at least 8 characters in length and have lower case and upper case letters as well as at least one number.'
                                                   data-title='Password'
                                                   onMouseEnter={this.logMouseEnter} onMouseLeave={this.logMouseLeave}>
                                                     <TextField
                                                        id="call-calltimecomment-comment"
                                                        label="Filter Comment *"
                                                        margin='normal'
                                                        fullWidth
                                                        value={calltimecomment}
                                                        onChange={this.handleChange('calltimecomment')}

                                                />
                                          </div>
                                          <div className="col-md-12">
                                               <div className="form-group">
                                                   <TextField
                                                        id="agent-user-group-native"
                                                        select
                                                        label="User Group"
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


                                            <div className="col-md-12 col-lg-12 col-sm-12" >

                                                    {this.state.week_checked.map((row, index) => {
                                                          return (
                                                        <div className="row"  key={this.state.week_checked[index].day}>
                                                       <div className="col-md-3 col-lg-3 col-sm-3">
                                               <TextField
                                                          id= {"call-Default-start"+ this.state.week_checked[index].day}
                                                          label={this.state.week_checked[index].name +" Start"}
                                                          margin='normal'
                                                          fullWidth
                                                          value={this.state.week_checked[index].value1}
                                                          onChange={(e) => this.handleCheckedChange(index, 'value1', e.target.value)}

                                                  />
                                                 </div>
                                                  <div className="col-md-3 col-lg-3 col-sm-3">
                                               <TextField
                                                          id= {"call-Default-end"+ this.state.week_checked[index].day}
                                                          label={this.state.week_checked[index].name +" End"}
                                                          margin='normal'
                                                          fullWidth
                                                          value={this.state.week_checked[index].value2}
                                                          onChange={(e) => this.handleCheckedChange(index, 'value2', e.target.value)}
                                                  />
                                                 </div>
                                                  <div className="col-md-4 col-lg-4 col-sm-4">
                                               <TextField
                                                          id= {"call-ahoveride"+ this.state.week_checked[index].day}
                                                          label="AH Override"
                                                          margin='normal'
                                                          fullWidth
                                                         value={this.state.week_checked[index].value3}
                                                          onChange={(e) => this.handleCheckedChange(index, 'value3', e.target.value)}
                                                  />
                                                 </div>
                                                  <div className="col-md-2 col-lg-2 col-sm-2"  style={{paddingTop:'25px'}}>
                                                    <div>
                                                     <a data-controls-modal="  _list" data-backdrop="static" data-keyboard="false" href="javascript:void(0)" className="btn btn-info showVoicemail" onClick={() => this.setState({open1: true})}  >Audio Chooser</a>
                                                    <AudioPopUp  selectedValue={this.state.selectedMValue} open={this.state.open1} onClose={this.handleRequestClose1.bind(this)}/>
                                                    </div>

                                                    </div>
                                                    </div>
                                                          );
                                                      })}

                                              </div>

                                               <div style={style_header} > <i className="fa fa-bars" style={{marginRight:'10px'}}></i>Add A New State Call Time</div>
                                             <table aria-describedby="table-1_info" id="state-table-call" className="table table-striped table-bordered">
                                                  <tbody>
                                                    <tr>
                                                      <th style={{fontWeight:'bold'}}>
                                                  Add A New State Call Time
                                                      </th>
                                                    </tr>
                                                    <tr  style={{display:'none'}}></tr>
                                                  </tbody>
                                                </table>
                                                <table className="table  tableBordered">
                                                            <tbody>
                                                              <tr>
                                                                <td style={{width:'45%'}}>State Call Time ID: </td>
                                                                <td align="left" style={{width:'45%'}} colSpan="2">
                                                                  <div className="form-group">
                                                                          <TextField
                                                                                    id="call-state_call_time_id"
                                                                                    label="State Call Time ID"
                                                                                    margin='normal'
                                                                                    fullWidth
                                                                                    value={state_call_time_id}
                                                                                    onChange={this.handleChange('state_call_time_id')}

                                                                            />
                                                                        </div>
                                                                </td>
                                                              </tr>
                                                              <tr>
                                                                <td style={{width:'45%'}}>State Call Time State: </td>
                                                                <td>
                                                                  <div className="form-group ">

                                                                         <TextField
                                                                                    id="call-state_call_time_state"
                                                                                    label="State Call Time State"
                                                                                    margin='normal'
                                                                                    fullWidth
                                                                                    value={state_call_time_state}
                                                                                    onChange={this.handleChange('state_call_time_state')}

                                                                            />
                                                                        </div>
                                                                       </td>
                                                              </tr>
                                                              <tr>
                                                                <td style={{width:'45%'}}>State Call Time Name: </td>
                                                                <td align="left" style={{width:'45%'}} colSpan="2">
                                                                  <div className="form-group">
                                                                                 <TextField
                                                                                    id="call-state_call_time_name"
                                                                                    label="State Call Time Name"
                                                                                    margin='normal'
                                                                                    fullWidth
                                                                                    value={state_call_time_name}
                                                                                    onChange={this.handleChange('state_call_time_name')}

                                                                            />

                                                                       </div>
                                                                </td>
                                                              </tr>
                                                              <tr>
                                                                <td style={{width:'45%'}}>State Call Time Comments: </td>
                                                                <td align="left" style={{width:'45%'}} colSpan="2">
                                                                  <div className="form-group">
                                                                           <div className="form-group">
                                                                                 <TextField
                                                                                    id="call-state_call_time_comments"
                                                                                    label="State Call Time Comments"
                                                                                    margin='normal'
                                                                                    fullWidth
                                                                                    value={state_call_time_comments}
                                                                                    onChange={this.handleChange('state_call_time_comments')}

                                                                            />
                                                                            </div>

                                                                        </div>
                                                                </td>
                                                              </tr>
                                                              <tr>
                                                                <td style={{width:'45%'}}>Admin User Group:</td>
                                                                <td align="left" style={{width:'45%'}}colSpan="2">
                                                                     <TextField
                                                                              id="agent-user-group-native1"
                                                                              select
                                                                              label="User Group"
                                                                              helperText="Please select your User Group"
                                                                              margin="normal"
                                                                              tabIndex="-1"
                                                                              value={state_user_group}
                                                                              onChange={this.handleChange('state_user_group')}
                                                                              fullWidth >
                                                                              {agents_group.map(option => (
                                                                                  <option key={option.value} value={option.value}>
                                                                                      {option.label}
                                                                                  </option>
                                                                              ))}
                                                                          </TextField>
                                                                            </td>
                                                              </tr>
                                                              <tr>
                                                                <td align="center"></td>
                                                                <td>
                                                                  <input type="submit" onClick="addStateTime();" value="Submit" name="submit" className="btn btn-success"/>
                                                                </td>
                                                              </tr>
                                                            </tbody>
                                                             </table>
                                   <div style={style_header} >

                                   <i className="fa fa-bars" style={{marginRight:'10px'}}></i>
                                   Active State Call Time Definitions for this Record</div>
                                     <table className="table table-striped table-bordered" id="state-table" aria-describedby="table-1_info">

                                     <tbody><tr><th style={{fontWeight:'bold'}}>Call Time ID</th>

                                     <th style={{fontWeight:'bold'}} colSpan="2">Call TIme Name</th></tr><tr style={{display:'none'}}></tr>
                                     </tbody></table>
                                     <table className="table  table-bordered"><tbody><tr><td style={{width:'45%',fontWeight:'bold'}}>
                                     Add state call time rule: </td><td align="left" colSpan="2" style={{width:'45%'}}>
                                     <select size="1" name="state_rule" id="state_rule" style={{width:'45%'}}>
                                          <option value="11">11 - 121</option><option value="ptest123_">ptest123_ - test</option>
                                          <option value="rhodeislan">rhodeislan - Rhode Island restrictions</option>
                                        </select></td>
                                         <td align="center" colSpan="4">
                                         <input type="submit" className="btn btn-success" name="submit" value="Submit" onClick="addState();"/></td></tr></tbody></table>

                                    <div style={style_header} >
                                   <i className="fa fa-bars" style={{marginRight:'10px'}}></i>
                                   Active Inbound Holiday Definitions for this Record</div>
                                     <table className="table table-striped table-bordered" id="state-table" aria-describedby="table-1_info">

                                     <tbody><tr><th style={{fontWeight:'bold'}}>Holiday Name</th>

                                     <th style={{fontWeight:'bold'}} colSpan="2">Call TIme Name</th></tr><tr style={{display:'none'}}></tr>
                                     </tbody></table>
                                         <table className="table  table-bordered"><tbody><tr><td style={{width:'45%',fontWeight:'bold'}}>
                                     Add inbound holiday rule:: </td><td align="left" colSpan="2" style={{width:'45%'}}>
                                     <select size="1" name="state_rule" id="state_rule" style={{width:'45%'}}>
                                          <option value="11">11 - 121</option><option value="ptest123_">ptest123_ - test</option>
                                          <option value="rhodeislan">rhodeislan - Rhode Island restrictions</option>
                                        </select></td>
                                         <td align="center" colSpan="4">
                                         <input type="submit" className="btn btn-success" name="submit" value="Submit" onClick="addState();"/></td></tr></tbody></table>

                                       <div style={style_header} >

                                   <i className="fa fa-bars" style={{marginRight:'10px'}}></i>
                                   Campaigns Using This Call Time</div>
                                     <table className="table table-striped table-bordered" id="state-table" aria-describedby="table-1_info">

                                     <tbody><tr><th style={{fontWeight:'bold'}}>Campaign ID</th>

                                     <th style={{fontWeight:'bold'}} colSpan="2">Campaign Name</th></tr><tr style={{display:'none'}}></tr>
                                     </tbody></table>

                                    <div style={style_header} >
                                   <i className="fa fa-bars" style={{marginRight:'10px'}}></i>
                                  Inbound Groups Using This Call Time</div>
                                     <table className="table table-striped table-bordered" id="state-table" aria-describedby="table-1_info">

                                     <tbody><tr><th style={{fontWeight:'bold'}}>Group ID</th>

                                     <th style={{fontWeight:'bold'}} colSpan="2">Group Name</th></tr><tr style={{display:'none'}}></tr>
                                     </tbody></table>

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
        Agent: state.admin_utilites

    };
}
 const mapDispatchToProps = {addcalltime,fetchcalltime};

export default connect(mapStateToProps, mapDispatchToProps)(ADD);
