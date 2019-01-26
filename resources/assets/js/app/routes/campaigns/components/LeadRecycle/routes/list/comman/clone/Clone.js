import React from 'react';
import Stepper from '@material-ui/core/Stepper';import Step from '@material-ui/core/Step';import StepButton from '@material-ui/core/StepButton';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CardBox from '../../../../../../../../../components/CardBox/index';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';
import {connect} from 'react-redux';

import axios from 'axios';
import DATA from './data';
import { fetchGlobal } from '../../../../../../../../../actions/Global';
//import { cloneAgent } from '../../../../../../actions/';




class Clone extends React.Component {

    constructor(props, context) {
        super(props, context);
    }

    state = {

        source_agent:"",
        source_agentError:false,
        list_id:"",
        agents:[],
        agent_name:'',
        agentnameError:false,
        agent_id:'',
        agent_password:'',
        agentError:false,
        agentpasswordError:false,
        agent_password:'',
        error:false,
        error_msg:false,
        error_msg_user:'',
        error_msg_pass:'',    
        sucsess_msg :''

    };

    // componentWillMount(){

    //     let $this = this;
    //     axios.get('/api/get-agentgroup-list').then(response=>{
    //         let group = response.data.group;
    //         $this.setState({
    //             groups:response.data.groups,
    //         })     
    //         console.log(response);
    //     }).catch(error =>{
    //         console.log(error);
    //     })
    // }

    cloneAgent = () =>{

        let $this = this;

        let agent_name =this.state.agent_name;
        let agent_id =this.state.agent_id;
        let agent_password =this.state.agent_password;
        let source_agent =this.state.source_agent;
        let error =this.state.error;

         agent_name=='' ? (this.setState({agentnameError: true}) ,error=true) :this.setState({agentnameError: false})
         agent_id=='' ? (this.setState({agentError: true}) ,error=true): this.setState({agentError: false});
         agent_password=='' ? (this.setState({agentpasswordError: true}) ,error=true) :this.setState({agentpasswordError: false})
         source_agent=='' ? (this.setState({selectedListError: true}) ,error=true): this.setState({selectedListError: false});

         if(!error){

           let data = {
            'from_agent' : source_agent,
            'full_name' : agent_name,
            'user' : agent_id,
            'pass' : agent_password
           } 

        axios.post('/api/clone-agent',data).then(response=>{
           // let group = response.data.group;
            this.setState({sucsess_msg:response.data.message})

             }).catch(error =>{
            //let flag = 0;  
               this.setState({error_msg_user:error.response.data.msg.user,error_msg:true,error_msg_pass:error.response.data.msg.pass})

            })
         }
        
    }
    componentDidMount() {  

      this.props.fetchGlobal(['agent_c']);

       }

    componentWillReceiveProps(nextPropsFromRedux) {
              this.setState({  agents:(nextPropsFromRedux.Global.agent_c ) ? nextPropsFromRedux.Global.agent_c : ""  });
    }
    handleChange = name => event => {
        this.setState({[name]: event.target.value});
    };


    handleTextChange = name => event => {
        this.setState({
            [name]: event.target.value
        });

    };

    render() {
        
        const {agent_name,error_msg_user,error_msg_pass,error_msg,agentnameError,agent_id,sucsess_msg,agentError,agentpasswordError,agent_password,agents,source_agent,selectedListError} = this.state;

        return (
            <div className="w-100">
                <div>
                        <div>
                        { (error_msg && sucsess_msg !='') && 
                          <div className="alert alert-danger" style={{padding: '5px !important', margin: '4px 0px 4px 0px !important'}}>
                            <button type="button" data-dismiss="alert" className="close">
                              <i className="entypo-cancel" /></button>
                                 <div> {error_msg_user}</div>
                                 <div> {error_msg_pass}</div> 
                          </div>
                      }
                        { (sucsess_msg !='' && !error_msg ) &&
                          <div className="alert alert-success" style={{padding: '5px !important', margin: '4px 0px 4px 0px !important'}}>
                            <button type="button" data-dismiss="alert" className="close">
                              <i className="entypo-cancel" /></button>

                            <div>{sucsess_msg}</div>
                            
                          </div> 
                      }
                      

                            <CardBox styleName="col-lg-12" heading="Agent Group">
                                <form className="row" noValidate autoComplete="off">

                                <div className="col-md-12 col-12">
                                        <FormControl className="w-100 mb-2" error>
                                        <TextField
                                            margin="dense"
                                            id="agent_id"
                                            label="Agent ID"
                                            type="text"
                                            fullWidth
                                            type='number'
                                            value={agent_id}
                                            onChange={this.handleTextChange('agent_id')}
                                            helperText="This is your Agent ID."
                                            error={agentError}
                                        />
                                        </FormControl>
                                    </div>
                                <div className="col-md-12 col-12">
                                        <FormControl className="w-100 mb-2" error>
                                        <TextField
                                            margin="dense"
                                            id="agent_password"
                                            label="Agent Password"
                                            type="text"
                                            fullWidth
                                            value={agent_password}
                                            onChange={this.handleTextChange('agent_password')}
                                            helperText="This is your Agent Password."
                                            error={agentpasswordError}
                                        />
                                        </FormControl>
                                    </div>

                               <div className="col-md-12 col-12">
                                        <FormControl className="w-100 mb-2" error>
                                        <TextField
                                            margin="dense"
                                            id="agent_name"
                                            label="Full Name "
                                            type="text"
                                            fullWidth
                                            value={agent_name}
                                            onChange={this.handleTextChange('agent_name')}
                                            helperText="This is your Agent Name."
                                            error={agentnameError}
                                        />
                                        </FormControl>
                                    </div>

                                    <div className="col-lg-12 col-sm-12 col-12">
                                        <FormControl className="w-100 mb-2">
                                            <InputLabel htmlFor="age-simple">Source Agent</InputLabel>
                                            <Select
                                                value={source_agent}
                                                onChange={this.handleTextChange('source_agent')}
                                                input={<Input id="age-simple"/>}
                                                error={selectedListError} >
                                                {agents && agents.map(option => (

                                                <MenuItem key={option.user} value={option.user}>{option.user} - {option.full_name}</MenuItem>
                                                ))}
                                            </Select>
                                            <FormHelperText>Your new list will be cloned from this list.</FormHelperText>
                                        </FormControl>                
                                    </div>

                                </form>
                            </CardBox>  

                        <div> 
                                 <Button onClick={this.props.close} variant="raised" style={{float: 'right',marginLeft:'10px'}}className="jr-btn bg-grey text-white">
                                          Close
                                      </Button>
                                <Button className="jr-btn" variant="raised" color="primary" style={{float: 'right'}}
                                        onClick={this.cloneAgent} >
                                        Start Cloning
                                </Button>
                                
                          
                        </div>
                    </div>
                    
                </div>
            </div>
        );
    }
}



function mapStateToProps(state, ownProps) {
    return {
        Agent: state.agent,
        Global:state.globel

    };
}

 const mapDispatchToProps = {
        fetchGlobal,
        
    };
    
export default connect(mapStateToProps, mapDispatchToProps)(Clone);
