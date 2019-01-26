import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import HorizontalLabelPositionBelowStepper from './HorizontalLabelPositionBelowStepper'

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

class FullScreenDialog extends React.Component {
    state = {
        open: false,
    };

    handleClickOpen = () => {
        this.setState({open: true});
    };

    handleRequestClose = () => {
        this.setState({open: false});
    };

    render() {
        return (
            <div style={{overflow:'hidden'}}>
                <Button variant="raised"   className="bg-primary text-white"  style={{float:'right'}} onClick={this.handleClickOpen}>Add New Inbound Group</Button>
                <Dialog
                    fullScreen
                    open={this.state.open}
                    onClose={this.handleRequestClose}
                    TransitionComponent={Transition}>
                    <AppBar className="position-relative">
                        <Toolbar>

                            <Typography type="title" color="inherit" style={{
                                flex: 1,
                            }}>

                            </Typography>
                            <Button onClick={this.handleRequestClose}>

                                <CloseIcon/>

                            </Button>
                        </Toolbar>
                    </AppBar>
                    <List>
                      <center> <h1>  </h1></center>
                    </List>
                       <HorizontalLabelPositionBelowStepper closePopup={this.handleRequestClose}/>

                </Dialog>
            </div>
        );
    }
}

export default FullScreenDialog;