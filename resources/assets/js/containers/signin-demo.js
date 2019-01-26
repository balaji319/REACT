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
import {
    hideMessage,
    showAuthLoader,
    userFacebookSignIn,
    userGithubSignIn,
    userGoogleSignIn,
    userSignIn,
    userTwitterSignIn
} from '../actions/Auth';

class SignIn extends React.Component {
    constructor() {
        super();
        this.state = {
            username: '',
            password: ''
        }
    }

    // componentDidUpdate() {
    //     if (this.props.showMessage) {
    //         setTimeout(() => {
    //             this.props.hideMessage();
    //         }, 100);
    //     }
    //     if (this.props.authUser !== null) {
    //         this.props.history.push('/');
    //     }
    // }

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

    handleSubmit(e){
        e.preventDefault();
        console.log(this.state);

        axios.post('api/signin', this.state).then(response => {
            console.log(response)
            if(response.data.status == 1){
                console.log('success');
                localStorage.setItem ('user_id', '100');
                window.location.href= '#/app/dashboard'
            }
        }).catch((error) =>  {
            console.log(error.response);
             if(response.data.status == 0){
                alert('sorry');
                // alert(error.response.status);
            }
            
        });
    }

    

    render() {
        // const {
        //     email,
        //     password
        // } = this.state;
        const {showMessage, loader, alertMessage} = this.props;
        return (
            <div
                className="app-login-container d-flex justify-content-center align-items-center animated slideInUpTiny animation-duration-3">
                <div className="app-login-main-content">

                    <div className="app-logo-content d-flex align-items-center justify-content-center">
                        <Link className="logo-lg" to="/" title="Jambo">
                            <img src="../../../../images/ytel-logo.svg" style={{'width' : '177px', 'height' : '65px'}} alt="Ytel" title="Ytel" />
                        </Link>
                    </div>

                    <div className="app-login-content">
                        <div className="app-login-header mb-4">
                            <h1><IntlMessages id="appModule.email"/></h1>
                        </div>

                        <div className="app-login-form">
                            <form onSubmit={this.handleSubmit.bind(this)}>
                                <fieldset>
                                    <TextField
                                        label={<IntlMessages id="appModule.email"/>}
                                        fullWidth
                                        value={this.state.username} 
                                        onChange={this.handleUsername.bind(this)}
                                        //defaultValue={this.state.username}
                                        margin="normal"
                                        className="mt-1 my-sm-3"
                                    />
                                    <TextField
                                        type="password"
                                        label={<IntlMessages id="appModule.password"/>}
                                        fullWidth
                                        value={this.state.password} 
                                        onChange={this.handlePassword.bind(this)}
                                        margin="normal"
                                        className="mt-1 my-sm-3"
                                    />

                                    <div className="mb-3 d-flex align-items-center justify-content-between">
                                        <Button
                                        type="submit" 
                                        //onClick={this.alertMessage} 
                                        variant="raised" color="primary">
                                            <IntlMessages id="appModule.signIn"/>
                                        </Button>

                                        <Link to="/signup">
                                            <IntlMessages id="signIn.signUp"/>
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
                {showMessage && NotificationManager.error(alertMessage)}
                <NotificationContainer/>
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
    userTwitterSignIn
})(SignIn);
