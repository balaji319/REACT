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
import { addShift,fetchShift} from '../../../../actions/';
import {agents_group,mail_data,style_header,week_days } from './data';
import axios from 'axios';
import {connect} from 'react-redux';

class Edit extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            pageTitle: this.props.location.pathname.split('/')[4],
            shiftId: this.props.location.pathname.split('/')[4]=='add'?'': this.props.location.pathname.split('/').pop(),
            showinfo:'Hover to the input on left and help text will come up here :)',
            showinfotitle :'Help Block',
            pageError:'',
            is_change: false ,
            showAlert :false,
            alertContent:'',
            alertTitle :'',
            shiftstime:'' ,
            shiftetime:'',
            shiftname:'',
            totaltime:'',
            reportoption:'N',
            week_checked:week_days,
            shiftIdError:false,
            usergroup:'',
        };

    }

    componentDidMount() { 


      if(this.state.pageTitle=='edit' ){

        this.props.fetchShift(this.state.shiftId);
      }
      


      //console.log("BALAJI"+this.props.Agent.data.filter(x => x.shift_id === '24HRMIDNIGHT'))

       }

    componentWillReceiveProps(nextPropsFromRedux) {
              this.setState({ 
                   alertTitle: nextPropsFromRedux.Agent.alertMessageTitle,
                   showAlert:nextPropsFromRedux.Agent.showMessage,
                   alertContent: nextPropsFromRedux.Agent.alertMessage,
              });

      }

    handleShowAlert = (flag) => {this.setState({showAlert: flag}); };

    Calculationhandler = (e) => {

    var start_time = document.getElementById("shift_start_time");
    var end_time = document.getElementById("shift_end_time");
    var length = document.getElementById("shift_length");
     
    var st_value = start_time.value;
    var et_value = end_time.value;

    while (st_value.length < 4) {st_value = "0" + st_value;}
    while (et_value.length < 4) {et_value = "0" + et_value;}
    var st_hour=st_value.substring(0,2);
    var st_min=st_value.substring(2,4);
    var et_hour=et_value.substring(0,2);
    var et_min=et_value.substring(2,4);
    if (st_hour > 23) {st_hour = 23;}
    if (et_hour > 23) {et_hour = 23;}
    if (st_min > 59) {st_min = 59;}
    if (et_min > 59) {et_min = 59;}
    start_time.value = st_hour + "" + st_min;
    end_time.value = et_hour + "" + et_min;

    var start_time_hour=start_time.value.substring(0,2);
    var start_time_min=start_time.value.substring(2,4);
    var end_time_hour=end_time.value.substring(0,2);
    var end_time_min=end_time.value.substring(2,4);
    start_time_hour=(start_time_hour * 1);
    start_time_min=(start_time_min * 1);
    end_time_hour=(end_time_hour * 1);
    end_time_min=(end_time_min * 1);

    if (start_time.value == end_time.value)
    {
        var shift_length = '24:00';
    }
    else
    {
        if ( (start_time_hour > end_time_hour) || ( (start_time_hour == end_time_hour) && (start_time_min > end_time_min) ) )
        {
        var shift_hour = ( (24 - start_time_hour) + end_time_hour);
        var shift_minute = ( (60 - start_time_min) + end_time_min);
        if (shift_minute >= 60) 
            {
                shift_minute = (shift_minute - 60);
            }
            else
            {
                shift_hour = (shift_hour - 1);
            }
        }
        else
        {
            var shift_hour = (end_time_hour - start_time_hour);
            var shift_minute = (end_time_min - start_time_min);
        }
        if (shift_minute < 0) 
        {
            shift_minute = (shift_minute + 60);
            shift_hour = (shift_hour - 1);
        }

        if (shift_hour < 10) {shift_hour = '0' + shift_hour}
        if (shift_minute < 10) {shift_minute = '0' + shift_minute}
        var shift_length = shift_hour + ':' + shift_minute;
        }

      this.setState({ shiftstime:parseInt(start_time.value) ,shiftetime :parseInt(end_time.value),totaltime:shift_length});

    };

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

        let shiftId = this.state.shiftId;
        let shiftstime=this.state.shiftstime;
        let shiftname=this.state.shiftname;
        let totaltime=this.state.totaltime;
        let reportoption=this.state.reportoption;
        let week_checked=this.state.week_checked;
        let usergroup=this.state.usergroup;
        let type = this.state.pageTitle =='add' ? 'add':'edit';
        let error=false;    
        shiftname =='' ? (this.setState({shiftnameError: true}) ,error=true) :this.setState({shiftnameError: false})
        shiftId   =='' ? (this.setState({shiftIdError: true}) ,error=true) :this.setState({shiftIdError: false})

        if(!error){

         let postData = {
                  'shift_id':shiftId,
                  'shift_start_time':shiftstime,
                  'shift_name':shiftname,
                  'shift_length':totaltime,
                  'report_option':reportoption,
                  'shift_weekdays':week_checked,
                  'user_group':usergroup,
                  'type':type
            };
            console.log(postData)
            this.props.addShift(postData);

      /*      this.props.updateRecord(postData);
             console.log(postData)
            let _this=this;*/
           
            
        }
    }
    
   
    render() {

      const {showAlert,alertTitle,alertContent,pageTitle, pageError,shiftId,shiftstime ,shiftetime ,shiftname,totaltime,reportoption,shiftIdError,shiftnameError,usergroup } = this.state;

           console.log(JSON.stringify(this.state.week_checked));

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
                        <ContainerHeader match={this.props.match} title={pageTitle+' Shift'} style={{marginBottom: '8px'}}/>
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
                 
                                <div className="col-md-6 col-6"
                                               data-info="Your agent's login.This field is where you put the Agent ID number, can be up to 8 digits in length, Must be at least 2 characters in length." 
                                               data-title='Shift ID'
                                               onMouseEnter={this.logMouseEnter} onMouseLeave={this.logMouseLeave}>
                                              <TextField
                                                  id="shift-shift-id"
                                                  onChange={this.handleChange('shiftId')}
                                                  label="Shift ID *"
                                                  value={shiftId}
                                                  disabled={pageTitle=='add'?false:true}   
                                                  margin="normal"
                                                   error={shiftIdError}
                                                  fullWidth/>
                                          </div>
                      
                            
                                 <div className="col-md-12 col-6" 
                                                   data-info='The password agent uses to login to Ytel.This field is where you put the users password. Must be at least 2 characters in length. A strong user password should be at least 8 characters in length and have lower case and upper case letters as well as at least one number.' 
                                                   data-title='Password'
                                                   onMouseEnter={this.logMouseEnter} onMouseLeave={this.logMouseLeave}>
                                                     <TextField
                                                        id="shift-shift-name"
                                                        label="Shift name *"
                                                        margin='normal'
                                                        fullWidth  
                                                        value={shiftname}
                                                        onChange={this.handleChange('shiftname')}
                                                        error={shiftnameError}
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

                                          <div className="col-md-12 "
                                               data-info="Your agent's login.This field is where you put the Agent ID number, can be up to 8 digits in length, Must be at least 2 characters in length." 
                                               data-title='Shift ID'
                                               onMouseEnter={this.logMouseEnter} onMouseLeave={this.logMouseLeave}>
                                                  <TextField
                                                      type='number'
                                                      onChange={this.handleChange('shiftstime')}
                                                      label="Shift Start Time *"
                                                      id="shift_start_time"
                                                      value={shiftstime} 
                                                      margin="normal"
                                                      fullWidth/>
                                          </div>
                                    
                       
                                          <div className="col-md-12 "
                                               data-info="Your agent's login.This field is where you put the Agent ID number, can be up to 8 digits in length, Must be at least 2 characters in length." 
                                               data-title='Shift ID'
                                               onMouseEnter={this.logMouseEnter} onMouseLeave={this.logMouseLeave}>
                                                <TextField
                                                    type='number'
                                                    onChange={this.handleChange('shiftetime')}
                                                    label="Shift End Time *"
                                                    id="shift_end_time"
                                                    value={shiftetime} 
                                                    margin="normal"
                                                    fullWidth/>
                                                    <div> <a data-controls-modal="  _list" data-backdrop="static" data-keyboard="false" href="javascript:void(0)" className="btn btn-info showVoicemail"  onClick={this.Calculationhandler} >Calculate Shift Length</a>
                                                      </div>  
                                             </div>
                                          <div className="col-md-12 "
                                               data-info="Your agent's login.This field is where you put the Agent ID number, can be up to 8 digits in length, Must be at least 2 characters in length." 
                                               data-title='Shift ID'
                                               onMouseEnter={this.logMouseEnter} onMouseLeave={this.logMouseLeave}>
                                                <TextField
                                                    type='text'
                                                    id="shift_length"
                                                    onChange={this.handleChange('totaltime')}
                                                    label="Shift Total Time *"
                                                    value={totaltime} 
                                                    margin="normal"
                                                    disabled={true}
                                                    fullWidth/>
                                          </div>

                                        
                                          <div className="col-md-12 "
                                               data-info="Your agent's login.This field is where you put the Agent ID number, can be up to 8 digits in length, Must be at least 2 characters in length." 
                                               data-title='Shift ID'
                                               onMouseEnter={this.logMouseEnter} onMouseLeave={this.logMouseLeave}>
                                              <div className="form-group" style={{ marginTop:'20px'}}>
                                                     <label htmlFor="shift_weekdays"> <h3>Shift Weekdays </h3></label>
                                                       {this.state.week_checked.map((row, index) => {
                                                          return (
                                                            <div key={this.state.week_checked[index].day}> <Checkbox color="primary"  onClick={(e) => this.handleCheckedChange(index, 'status', e.target.checked)} value={this.state.week_checked[index].day}
                                                                               defaultChecked={this.state.week_checked[index].status}    
                                                                              /> {this.state.week_checked[index].name}
                                                              </div>
                                                          );
                                                      })}
                                                    </div>
                                          </div>

                                          <div className="col-md-12">
                                               <div className="form-group">
                                                 <TextField
                                                      id="agent-report-option"
                                                      select
                                                      label="Report Option"
                                                      helperText="Please select your report option"
                                                      margin="normal"
                                                      tabIndex="-1"
                                                      value={reportoption}
                                                      onChange={this.handleChange('reportoption')}
                                                      fullWidth >
                                                          <option key='1' value='N'>N</option>
                                                          <option key='2' value='Y'>Y</option>
                                                  </TextField> 
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

 const mapDispatchToProps = {
 addShift,
 fetchShift
    };
    
export default connect(mapStateToProps, mapDispatchToProps)(Edit);
