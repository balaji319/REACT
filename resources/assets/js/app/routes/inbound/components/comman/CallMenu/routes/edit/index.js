import React, {Component} from 'react';
import {UncontrolledAlert, Alert} from 'reactstrap';
import SweetAlert from 'react-bootstrap-sweetalert'
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ContainerHeader from '../../../../../../../../components/ContainerHeader/index';
import CardBox from '../../../../../../../../components/CardBox/index';
import CustomPicker from '../../../../../../../../components/pickers/routes/Color/customPicker';
import IntlMessages from '../../../../../../../../util/IntlMessages';
import {scriptTextFields
,scriptTextFieldsPrefix
,scriptTextFieldsPostfix    
} from './data';
import axios from 'axios';

class EditScript extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            pageTitle: this.props.location.pathname.split('/')[4],
            groupId: this.props.location.pathname.split('/')[4]=='add'?'': this.props.location.pathname.split('/').pop(),
            pageError: false,
            scriptField:'',
            groupName:'',
            scriptComment:'',
            scriptActive:true,
            scriptActiveValue:'Y',
            scriptText:'',
            scriptTextSelectionStart:0,
            showAlert: false,
            alertContent: '',
            alertTitle: '',
            showConfirm:false,
            showinfo:'',
        };

    }

    componentDidMount() {

  

    }
    
    handleShowAlert = (flag) => {
        this.setState({
            showAlert: flag
        });
    };
    
    handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        });
        
        if(name=='scriptText'){
            this.setState({scriptTextSelectionStart: event.target.selectionStart});
        }else if(name=='scriptField'){
            let newField = scriptTextFieldsPrefix+event.target.value+scriptTextFieldsPostfix;
            this.setState({
                scriptText: this.state.scriptText.slice(0, this.state.scriptTextSelectionStart) + newField + this.state.scriptText.slice(this.state.scriptTextSelectionStart + 1)
            });
        }
        
    };
    
    handleScriptTextClick = event =>{this.setState({scriptTextSelectionStart: event.target.selectionStart});  }
    
     logMouseEnter = (id) => { console.log("enter"+id) }
     logMouseLeave = (id) => { console.log("&nbsp;&nbsp;&nbsp;onMouseLeave (react)"+id) }
     logNativeMouseLeave= () => { console.log('&nbsp;&nbsp;&nbsp;mouseleave (native)') }
     clearLog= () => { console.log() }

    handleActiveChange = (event,checked) => {
          this.setState({scriptActive: checked});
          this.setState({scriptActiveValue: checked?'Y':'N'});
    }
    
    handleSubmit = () =>{
        let scriptId = this.state.scriptId;
        let scriptName=this.state.scriptName;
        let scriptComment=this.state.scriptComment;
        let scriptText=this.state.scriptText;
        let scriptActiveValue=this.state.scriptActiveValue;
        let pageTitle =this.state.pageTitle;
        let error=false;
        
        if(scriptId==''){
              this.setState({scriptIdError: true});
              error=true;
        }else{
             this.setState({scriptIdError: false});
         }
        
        if(scriptName==''){
              this.setState({scriptNameError: true});
              error=true;
        }else{
             this.setState({scriptNameError: false});
        }
          if(scriptComment==''){
              this.setState({scriptCommentError: true});
              error=true;
        }else{
             this.setState({scriptCommentError: false});
        }
          if(scriptText==''){
              this.setState({scriptTextError: true});
              error=true;
        }else{
             this.setState({scriptTextError: false});
        }
        
        if(!error){
            
            let postData = {
                'script_id':scriptId
                ,'type':pageTitle
                , 'script_name':scriptName
                , 'script_comments':scriptComment
                , 'script_text':scriptText
                , 'active':scriptActiveValue
            };
            let _this=this;
            axios.post('/api/admin-utilities/update-or-create-script/',postData)
                .then(response => {
                       this.handleShowAlert(true);
                        this.setState({
                            alertTitle: response.data.status,
                            alertContent: response.data.msg,
                            showAlert:true
                        });
                            
                })
                .catch(function (error) {
                   
                })
        }
    }
    
   
    render() {

        const {pageTitle, pageError, showAlert,alertContent,alertTitle,scriptId,scriptName,groupId,groupName,scriptComment,scriptActive,scriptActiveValue,scriptText,scriptField,scriptIdError,scriptNameError,scriptCommentError,scriptTextError} = this.state;

        if (pageTitle=='edit' && pageError) {
            return (
                    <div>
                        <ContainerHeader match={this.props.match} title={pageTitle+' script'}/>
                    
                        <Alert className="shadow-lg" color="danger">
                            <h3 className="alert-heading">Script Not Found</h3>
                            <p>
                              We can not locate your Script, please check your script id.  
                            </p>
                        </Alert>
                    
                    </div>

                    );
        } else {

            return (
                    <div>
                        <ContainerHeader match={this.props.match} title={pageTitle+' Group'}/>
                        
                          <div className="row">
                          
                           <SweetAlert   show={showAlert} 
                                            success={alertTitle==='Success'?true:false} 
                                            error={alertTitle==='Error'?true:false}
                                            title={alertTitle}
                                            onConfirm={()=>this.handleShowAlert(false)}
                                            onCancel={()=>this.handleShowAlert(false)}>
                                            {alertContent}
                                </SweetAlert>
                                                     
                            <CardBox styleName="col-lg-8    "
                             heading={pageTitle=='add'?'Add new Group':scriptId}>

                            <form className="row" noValidate autoComplete="off">

                                <div className="col-md-6 col-6"   onMouseEnter={this.logMouseEnter('groupName')} onMouseLeave={this.logMouseLeave('groupName')} >
                                    <TextField
                                        id="script-id"
                                          onChange={this.handleChange('groupId')}
                                        error={scriptIdError}
                                        label="Group ID *"
                                        value={groupId}
                                         disabled={pageTitle=='add'?false:true}
                                        margin="normal"
                                        fullWidth

                                      
                                    />
                                    <div className="info_div-groupId">
                                    Great !!!!!!!!!!!!!!!!!
                                    </div>
                                </div>

                                <div className="col-md-6 col-6" onMouseEnter={this.logMouseEnter('groupName')} onMouseLeave={this.logMouseLeave('groupName')} >
                                    <TextField
                                        id="Group-Name"
                                        label="Group Name *"
                                        value={groupName}
                                        onChange={this.handleChange('groupName')}
                                        margin="normal"
                                        fullWidth
                                        error={scriptNameError}
                                    />
                                    <div className="info_div-groupName">
                                   NOP.................
                                    </div>
                                </div>


                                <div className="col-md-6 col-6">
                                   <p>Group Color  </p>
                                    <CustomPicker/>
                                </div>

                                 <div className="col-md-12 col-12">
                                    <p></p>
                                    <p className="MuiFormHelperText-root-253" >Script Active *</p>
                                    <div className="row">
                                    <Switch 
                                        value={scriptActiveValue}
                                        onChange={this.handleActiveChange}
                                        label='Script Active'
                                        checked={scriptActive} 
                                        color="primary"
                                        />
                                    </div>
                                    </div>


                                <div className="col-md-12 col-12">

                                    <TextField
                                        id="script-fields"
                                        select
                                        label="Select field"
                                        value={scriptField}
                                        onChange={this.handleChange('scriptField')}
                                        SelectProps={{}}
                                        helperText="Please select field to add in script text"
                                        margin="normal"
                                        fullWidth>
                                        {scriptTextFields.map(option => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                    </div>



                                <div className="col-md-12 col-12">
                                    <TextField
                                        id="script-text"
                                        label="Script Text *"
                                        multiline
                                        rows="4"
                                        onClick={this.handleScriptTextClick}
                                        onChange={this.handleChange('scriptText')}
                                        helperText='This is where you place the content of an agent screen Script.'
                                        value={scriptText}
                                        margin="normal"
                                        error={scriptTextError}
                                        fullWidth
                                    />
                                </div>

                                <div className="col-md-12 col-12">
                                    <br />    <br />
                                    <Button variant="raised" className="jr-btn bg-purple text-white" onClick={this.handleSubmit}>
                                        <i className="zmdi zmdi-mail-send zmdi-hc-fw"/>
                                        <span>Submit</span>
                                    </Button>
                                </div>

                            </form>
                            </CardBox>
                           <div className="col-lg-4" style={{display: 'grid'}}>
                             <div className="jr-card ">
                                 <div className="jr-card-body ">
                                    <div className="col-md-12 col-12 mt-12">           
                                      <div>
                                        <div className="card-body">
                                        <h3 className="card-title">Card Title</h3>
                                        <p className="card-text">Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy.</p>
                                        </div>
                                        </div>
                                        </div>
                                    </div>
                                </div>

                         </div>
                        </div>
                    </div>
                    );
        }
    }
}

export default EditScript;