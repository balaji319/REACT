import React from 'react';
import {Link} from 'react-router-dom'
import {connect} from 'react-redux';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import IntlMessages from '../util/IntlMessages';
import CircularProgress from '@material-ui/core/CircularProgress';
import axios from 'axios';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Agreement from './Agreement';
import {UncontrolledAlert} from 'reactstrap';
import {
    hideMessage,
    showAuthLoader,
    userFacebookSignIn,
    userGithubSignIn,
    userGoogleSignIn,
    userSignIn,
    userTwitterSignIn,
    showAuthMessage
} from '../actions/Auth';


class SignIn extends React.Component {
    constructor() {
        super();
        this.state = {
            email: '',
            password: '',

            error: [],
            serverError: [],
            checkedB: false,
            open: false,
            open1: false,
            flag: false,
            user_id: ''
        }
    }

    componentDidUpdate() {
        if (this.props.showMessage) {
            setTimeout(() => {
                this.props.hideMessage();
            }, 800);
        }
        if (this.props.authUser !== null) {
            this.props.history.push('/');
        }
        this.handlebgimg();
    }

    handleUsername(e) {
        this.setState({
            username: e.target.value
        })
    }

    handlePassword(e){
        this.setState({
            password: e.target.value
        })
    }

     handleChange = name => (event, checked) => {
        //this.setState({[name]: checked, });
        this.setState({
          checkedB: !this.state.checkedB,
        });
       // console.log(this.state.checkedB);

    };

    handleRequestClose = () => {
        this.setState({open: false, open1:false});
    };

    handleAlertClose = () => {
        this.setState({               
                flag: false,
             })
    }

  componentWillMount() {
        let $this=this;
        this.handlebgimg();
        setTimeout(function(){ $this.handlebgimg(); }, 100);

    }

   handlebgimg = () => {

        let length= document.querySelectorAll(".app-login-container").length;
        let el=document.getElementById("app");
        length == 1  ? el.className += " Ycc-login-bg " :' ';

    }

    handleSubmit(data){
        //console.log(this.state);
        this.setState({
                error: [],
                serverError:[],
                flag: false,
                clientError:false
             })
        if(this.state.checkedB == false )
        {
            this.setState({
                open1:true
            });
        }else if( this.state.email =='' || this.state.password ==''){
            this.setState({
                clientError:true
            });
           this.props.showAuthMessage('username && password fields are required')
        }
        else{
            this.props.showAuthLoader();
            this.props.userSignIn(data);
    }
    }


    render() {
        const {
            email,
            password
        } = this.state;
        const {showMessage, loader, alertMessage} = this.props;
        return (
            <div
                className="app-login-container d-flex justify-content-center align-items-center animated slideInUpTiny animation-duration-3">
                <div className="app-login-main-content">

                    <div className="app-logo-content d-flex align-items-center justify-content-center" style={{backgroundColor:'#39f'}}>
                        <Link className="logo-lg" to="/" title="Jambo">
                               <img src="../../../../images/ytel-logo.svg" style={{'width' : '177px', 'height' : '65px'}} alt="Ytel" title="Ytel" />
                        </Link>
                    </div>

                    <div className="app-login-content">
                        <div className="app-login-header mb-4">
                            <h1 style={{textAlign: 'center'}}> Login </h1>
                        </div>

                        <div className="app-login-form">
                            <form>
                                <fieldset>
                                    <TextField
                                        label="Username"
                                        fullWidth
                                        onChange={(event) => this.setState({email: event.target.value})}
                                        defaultValue={email}
                                        margin="normal"
                                        className="mt-1 my-sm-3"
                                    />
                                    <TextField
                                        type="password"
                                        label={<IntlMessages id="appModule.password"/>}
                                        fullWidth
                                        onChange={(event) => this.setState({password: event.target.value})}
                                        defaultValue={password}
                                        margin="normal"
                                        className="mt-1 my-sm-3"
                                    />

                                   <FormControlLabel
                                        control={
                                            <Checkbox color="primary"
                                                      checked={this.state.checkedB}
                                                      onChange={this.handleChange('checkedB')}
                                                      value="checkedB"
                                            />
                                        }

                                    />
                   I agree to the terms and conditions set forth in the <a className="ancr-style" style={{cursor:'pointer'}} variant="raised" onClick={() => this.setState({open: true})}>Open
                                        Ytel End User License Agreement</a>
                                        

                                    

                                    <Dialog open={this.state.open} onClose={this.handleRequestClose}>
                                        <DialogTitle>
                                            {"End User License Agreement (“EULA”) & Master Service Agreement - (“MSA”)"}
                                        </DialogTitle>
                                        <DialogContent>
                                            
                                               <Agreement />
                                            
                                        </DialogContent>
                                        <DialogActions>
                                            
                                            <Button onClick={this.handleRequestClose} color="primary">
                                                Agree
                                            </Button>
                                        </DialogActions>
                                    </Dialog>


                                    <Dialog open={this.state.open1} onClose={this.handleRequestClose}>
                                        <DialogTitle>
                                            {"Alert Message"}
                                        </DialogTitle>
                                        <DialogContent>
                                            Please accept terms & Conditions
                                        </DialogContent>
                                        <DialogActions>
                                            
                                            <Button onClick={this.handleRequestClose} color="primary">
                                                OK
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                   
                                    <br/>
                                    <br/>
                                    <div className="mb-3 d-flex align-items-center justify-content-between">
                                        <Button onClick={() => {
                                            this.handleSubmit({email, password});
                                        }} variant="raised" color="primary">
                                            <IntlMessages id="appModule.signIn"/>
                                        </Button>

                                 
                                           <Link to="/forgotpassword">
                                            Forgot Password
                                        </Link>
                                    </div>


                                </fieldset>
                            </form>
                        </div>
                    </div>

                </div>
                {
                    loader &&
                    <div className="loader-view">
                        <CircularProgress/>
                    </div>
                }
                {showMessage && NotificationManager.error('',alertMessage )}
                <NotificationContainer />

            </div>
        );
    }
}

const mapStateToProps = ({auth}) => {
    const {loader, alertMessage, showMessage, authUser} = auth;
    return {loader, alertMessage, showMessage, authUser}
};

export default connect(mapStateToProps, {
    userSignIn,
    hideMessage,
    showAuthLoader,
    userFacebookSignIn,
    userGoogleSignIn,
    userGithubSignIn,
    userTwitterSignIn,
    showAuthMessage
})(SignIn);
