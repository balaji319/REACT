import React, {Component} from 'react';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import ContainerHeader from '../../../../../components/ContainerHeader/index';
import CardBox from '../../../../../components/CardBox/index';
import {getPageName,getPageParam,createNotification} from '../../../../../Helpers';
import axios from 'axios';
import AudioManager from '../../../../../components/AudioManager';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CustomScrollbars from '../../../../../util/CustomScrollbars';
import { ReactDOM } from 'react-dom';
class Audio extends React.Component {

    componentDidMount() {

         let _this = this;
            axios.get('api/admin-utilities/audio-lists')
                .then(response => {
                    _this.setState({
                        audioData:  response.data,
                    });
                    
                  
                  
                })
                .catch(function (error) {
                    console.log(error);
                })
        
    }
   
    constructor(props) {
        super(props);
        this.state = {
            audioData:{audio_list:[],audioDirUrl:''}
        };

    }
    
   
    render() {

        const {audioData} = this.state;


            return (
                    <div>
                        <ContainerHeader match={this.props.match} title={'Audio'}/>
                        <div className="row">
                    <CardBox styleName="col-lg-12"
                    heading='Audio Manager'>
                                         
                                            <AudioManager data={audioData}/></CardBox>
                         
                    </div></div>

                    );
        
    }
}

export default Audio;