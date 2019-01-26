import React from 'react';
import {connect} from 'react-redux';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import CircularProgress from '@material-ui/core/CircularProgress';
import {Link} from 'react-router-dom';
import IntlMessages from '../util/IntlMessages';
import {
    hideMessage,
    showAuthLoader
} from '../actions/Auth';

class ResetPassword extends React.Component {
    constructor() {
        super();
        this.state = {
            username: '',
            password: '',
            confirmpassword: '',
        }
    }

    // componentDidUpdate() {
    //     if (this.props.showMessage) {
    //         setTimeout(() => {
    //             this.props.hideMessage();
    //         }, 3000);
    //     }
    //     if (this.props.authUser !== null) {
    //         this.props.history.push('/');
    //     }
    // }


    handleSubmit(e){
        e.preventDefault();
        
        console.log(this.state);

        axios.post('api/signin', this.state).then(response => {
            console.log(response)
            if(response.data.status == 1){
                console.log('success');
              
            }
            
        }).catch((error) =>  {
            console.log(error.response.data.errors);
             
            
        });
    }
    

    render() {
        const {
            name,
            email,
            password
        } = this.state;
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
                            <h2>Reset New Password</h2>
                        </div>

                        <div className="app-login-form">
                            <form onSubmit={this.handleSubmit.bind(this)}>
                                                              

                                <TextField
                                    type="email"
                                    onChange={(event) => this.setState({username: event.target.value})}
                                    label="Username"
                                    name="username"
                                    fullWidth
                                    margin="normal"
                                    className="mt-0 mb-4"
                                />

                                <TextField
                                    type="password"
                                    onChange={(event) => this.setState({password: event.target.value})}
                                    label="Password"
                                    name="password"
                                    fullWidth
                                    margin="normal"
                                    className="mt-0 mb-4"
                                />

                                <TextField
                                    type="password"
                                    onChange={(event) => this.setState({confirmpassword: event.target.value})}
                                    label="Confirm Password"
                                    name="confirmpassword"
                                    fullWidth
                                    margin="normal"
                                    className="mt-0 mb-4"
                                />

                                <div className="mb-3 d-flex align-items-center justify-content-between">
                                    <Button variant="raised" onClick={() => {
                                        this.props.showAuthLoader();
                                        this.props.userSignUp({email, password});
                                    }} color="primary">
                                        Reset New Password
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
})(ResetPassword);
