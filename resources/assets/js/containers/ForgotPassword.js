import React from 'react';
import {connect} from 'react-redux';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import CircularProgress from '@material-ui/core/CircularProgress';
import {Link} from 'react-router-dom';
import IntlMessages from '../util/IntlMessages';
import axios from 'axios';
import {
    hideMessage,
    showAuthLoader
} from '../actions/Auth';

class ForgotPassword extends React.Component {
    constructor(props){
        super(props);
        this.state =  {
            username : '',
        }
    }

   /* componentDidUpdate() {
        if (this.props.showMessage) {
            setTimeout(() => {
                this.props.hideMessage();
            }, 3000);
        }
        if (this.props.authUser !== null) {
            this.props.history.push('/');
        }
    }*/


    handleSubmit(e){
        e.preventDefault();
        
        // console.log(this.state);

        axios.post('api/password/email', this.state).then(response => {
            console.log(response)            
            console.log('success');

            //this.refs.username.value="";
            this.setState({err: false,username:''});
              
        }).catch(error =>  {
            this.setState({err: true,username:''});
            //this.refs.username.value="";

        });
    }

    onChange(e){
        const username = e.target.value;
        this.setState({username : username});
    }
    

    render() {
        let error = this.state.err ;
        let msg = (!error) ? 'We have e-mailed your password reset link!' : 'User doesnt exist' ;
        let name = (!error) ? 'alert alert-success' : 'alert alert-danger' ;
        
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
                        <div className="app-login-header">
                            <h2>Account recovery</h2>
                             {error != undefined && <div className={name} role="alert">{msg}</div>}
                        </div>

                        <div className="app-login-form">
                            <form onSubmit={this.handleSubmit.bind(this)}>
                                                              

                                <TextField
                                    type="email"
                                    onChange={this.onChange.bind(this)}
                                    label="Username"
                                    name="username"
                                    fullWidth
                                    margin="normal"
                                    className="mt-0 mb-4"
                                    required                                    
                                />   

                                
                                <div className="mb-3 d-flex align-items-center justify-content-between">
                                    <Button variant="raised"
                                     color="primary"
                                     type="submit">
                                        <IntlMessages
                                            id="appModule.regsiter"/>
                                    </Button>
                                    <Link to="/signin">
                                        <IntlMessages id="appModule.signin"/>
                                    </Link>
                                </div>
                                

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
        )
    }
}

const mapStateToProps = ({auth}) => {
    const {loader, alertMessage, showMessage, authUser} = auth;
    return {loader, alertMessage, showMessage, authUser}
};

export default connect(mapStateToProps, {
    hideMessage,
    showAuthLoader
})(ForgotPassword);
