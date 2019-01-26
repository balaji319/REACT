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
import TextError from '../../../../../../../../../components/common/TextError';
import { fetchGlobal } from '../../../../../../../../../actions/Global';
import axios from 'axios';
import {connect} from 'react-redux';
import { Route , withRouter} from 'react-router-dom';
import DATA from './data';



function getSteps() {
     return ['1. User Group Info', '2.Confirm'];
}


class Clone extends React.Component {

    constructor(props, context) {
        super(props, context);
    }

    state = {
        activeStep: 0,
        completed: {},
        selected_list_id:"",
        source_agent_group:'',
        list_id:"",
        lists:DATA,
        listError : false,
        selectListError : false,
        agents_group:[] ,
        sucsess_msg:'',
        error_msg:''
    };
    totalSteps = () => {
        return getSteps().length;
    };
    handleNext = () => {
        let activeStep;

        let isError = false;
        this.state.list_id =='' ? (this.setState({listError:true }),isError =true) :this.setState({listError:false }); 
  
        //this.state.selected_list_id=='' ? (this.setState({selectListError:true }),isError =true) : this.setState({selectListError:false });

        if(!isError){

            if (this.isLastStep() && !this.allStepsCompleted()) {
                const steps = getSteps();
                activeStep = steps.findIndex((step, i) => !(i in this.state.completed));
            } else {
                activeStep = this.state.activeStep + 1;
            }
            this.setState({
                activeStep,
            });
        }
    };
    handleBack = () => {
        const {activeStep} = this.state;
        this.setState({
            activeStep: activeStep - 1,
        });
    };
    handleStep = step => () => {

    let isError = false;
        this.state.list_id =='' ? (this.setState({listError:true }),isError =true) :this.setState({listError:false }); 
  
        this.state.selected_list_id=='' ? (this.setState({selectListError:true }),isError =true) : this.setState({selectListError:false });

         if(!isError){this.setState({activeStep: step})}
    };
    handleComplete = () => {
        const {completed} = this.state;
        completed[this.state.activeStep] = true;
        this.setState({
            completed,
        });
        this.handleNext();
    };
    handleReset = () => {
        this.setState({
            activeStep: 0,
            completed: {},
        });
    };

    completedSteps() {
        return Object.keys(this.state.completed).length;
    }

    isLastStep() {
        return this.state.activeStep === this.totalSteps() - 1;
    }

    allStepsCompleted() {
        return this.completedSteps() === this.totalSteps();
    }

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

    cloneAgentGroup = () =>{
        let $this = this;

       
        console.log("++++++++++")
       console.log(this.state)
       console.log("++++++++++")
        let formdata = {
          
            'user_group' : this.state.list_id,
            'from_user_group' : this.state.source_agent_group
        }

        axios.post('/api/agentgroup-clone',formdata).then(response=>{
            $this.setState({sucsess_msg:'user group created successfully'})
            $this.props.history.push('edit/'+$this.state.list_id)
            //alert("OK")        
        })
        
    }

    componentWillReceiveProps(nextPropsFromRedux) {
              this.setState({  agents_group:(nextPropsFromRedux.Global.agentgroup ) ? nextPropsFromRedux.Global.agentgroup : ""  });
    }

    handleChange = name => event => {
        this.setState({[name]: event.target.value});
    };

    componentDidMount() {  

        this.props.fetchGlobal(['agentgroup']);
    }

    handleTextChange = name => event => {
        this.setState({
            [name]: event.target.value
        });

    };

    render() {
        const steps = getSteps();
        const {activeStep,selected_list_id,error_msg,lists,sucsess_msg,list_id,selectedListError,listError,agents_group,source_agent_group} = this.state;

        return (

            <div className="w-100">
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
                <Stepper nonLinear activeStep={activeStep} className="horizontal-stepper-linear">
                    {steps.map((label, index) => {
                        return (
                            <Step key={label} className={`horizontal-stepper ${index===activeStep?'active':''}`}>
                                <StepButton className="stepperbutton"
                                    onClick={this.handleStep(index)}
                                    completed={this.state.completed[index]}
                                >
                                    {label}

                                </StepButton>
                            </Step>
                        );
                    })}
                </Stepper>
                <div>
                    {this.allStepsCompleted() ? (
                        <div>
                            <Typography className="my-2">
                                All steps completed - you&quot;re finished
                            </Typography>
                            <Button className="jr-btn" onClick={this.handleReset}>Reset</Button>
                        </div>
                    ) : (
                        <div>
                        
                        {activeStep == 0 ? 

                            <CardBox styleName="col-lg-12" heading="Agent Group">
                                <form className="row" noValidate autoComplete="off">
                                    <div className="col-lg-12 col-sm-12 col-12">
                                        <FormControl className="w-100 mb-2">
                                            <InputLabel htmlFor="age-simple">Source Agent</InputLabel>
                                            <Select
                                                value={source_agent_group}
                                                onChange={this.handleTextChange('source_agent_group')}
                                                input={<Input id="age-simple"/>}
                                                error={selectedListError} >
                                                {agents_group && agents_group.map(option => (

                                                <MenuItem key={option.user_group} value={option.user_group}> {option.user_group} - {option.group_name}</MenuItem>
                                                ))}
                                            </Select>
                                            <FormHelperText>Your new list will be cloned from this list.</FormHelperText>
                                        </FormControl>                
                                    </div>
                                    <div className="col-md-12 col-12">
                                        <FormControl className="w-100 mb-2" error>
                                        <TextField
                                            margin="dense"
                                            id="list_id"
                                            label="New User Group ID"
                                            type="text"
                                            fullWidth
                                            value={list_id}
                                            onChange={this.handleTextChange('list_id')}
                                            helperText="This is your new List ID."
                                            error={listError}
                                        />
                                        </FormControl>
                                    </div>
                                </form>
                            </CardBox>
                            :
                            <CardBox styleName="col-lg-12" heading="Agent Group">
                                <form className="row" noValidate autoComplete="off">
                                    <div className="col-md-12 col-12">
                                        <FormControl className="w-100 mb-2">
                                        <TextField
                                            margin="dense"
                                            id="user_group"
                                            label="From List ID"
                                            type="text"
                                            fullWidth
                                            value={source_agent_group}
                                            disabled
                                            helperText="Your new list will be cloned from this list."
                                            error={false}
                                        />
                                        </FormControl>
                                    </div>
                                    <div className="col-md-12 col-12">
                                        <FormControl className="w-100 mb-2">
                                        <TextField
                                            margin="dense"
                                            id="list_id"
                                            label="New List ID"
                                            type="text"
                                            fullWidth
                                            value={list_id}
                                            disabled
                                            helperText="This is your new List ID."
                                            error={false}
                                        />
                                        </FormControl>
                                    </div>
                                </form>
                            </CardBox>                               
                        }
                         
                        <div> 
                            <Button 
                                variant="raised" 
                                color="primary" 
                                onClick={activeStep === 0 ? this.handleNext : this.handleBack} 
                                className="jr-btn">
                                {activeStep == 0 ? 'Next' : 'Previous'}
                            </Button>
                             <Button onClick={this.props.close} variant="raised" style={{float: 'right',marginLeft:'10px'}}className="jr-btn bg-grey text-white">
                                          Close
                              </Button>
                            {activeStep == 1 ? 
                                <Button className="jr-btn" variant="raised" color="primary"
                                        onClick={this.cloneAgentGroup}
                                        disabled={this.state.user_group == "" || this.state.selected_user_group == "" ? true : false }
                                >
                                        Start Cloning
                                </Button>
                                :""
                            }
                        </div>
                    </div>
                    )}
                </div>
            </div>
        );
    }
}


function mapStateToProps(state, ownProps) {
    return {
        Global:state.globel

    };
}

 const mapDispatchToProps = {
        fetchGlobal
    };
    


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Clone));