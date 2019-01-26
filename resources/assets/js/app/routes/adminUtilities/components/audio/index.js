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
import MusicOnHold from '../../../../../components/MusicOnHoldManager';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CustomScrollbars from '../../../../../util/CustomScrollbars';
import { ReactDOM } from 'react-dom';
import FullScreenDialog from './FullScreenDialog.js';
import MusicOnHoldPopUp from './MusicOnHoldPopUp.js';


class Audio extends React.Component {

    componentDidMount() {

         let _this = this;
            axios.get('api/admin-utilities/audio-lists').then(response => { _this.setState({ audioData:  response.data }); }).catch(function (error) {  console.log(error);})
            axios.get('api/admin-utilities/audio-moh-lists').then(response => { _this.setState({ musicData: response.data }); }).catch(function (error) {  console.log(error);})

    }
   
    constructor(props) {
        super(props);
        this.state = {
            audioData:{audio_list:[],audioDirUrl:''},
            open:false,
            musicData:[]
        };

    }
    
    
    handleOpenMoh = () => { this.setState({open: true});};
    handleRequestClose = value => { this.setState({voicemail: value, open: false});};
   
    render() {

        const {audioData,musicData} = this.state;

            return (
                    <div>
                        <ContainerHeader match={this.props.match} title={'Audio'}/>
                            <FullScreenDialog/>
                        <div className="row" style={{ borderStyle:'solid',borderColor: '#15bcd4'}}>
                           <legend style={{backgroundColor: 'rgb(21, 188, 212)', padding: '8px', color: 'rgb(255, 255, 255)', marginBottom:'0px', borderBottom: '0px none'}}>Audio Managers</legend>     
                                 <CardBox styleName="col-lg-12" >
                                     <AudioManager data={audioData}/>
                                </CardBox>
                            
                                 </div>
                                  <Button variant="raised"   className="bg-primary text-white"  style={{margin: '7px 0px 5px 89%'}} onClick={this.handleOpenMoh}>Add New MOH Entry</Button>
                                  <MusicOnHoldPopUp  open={this.state.open}    onClose={this.handleRequestClose.bind(this)} />
                                  <div className="row" style={{ borderStyle:'solid',  borderColor: '#15bcd4'}}>
                                 <legend style={{backgroundColor: 'rgb(21, 188, 212)', padding: '8px', color: 'rgb(255, 255, 255)', marginBottom:'0px', borderBottom: '0px none'}}>MOH</legend>     
                                  <CardBox styleName="col-lg-12" >
                                     <MusicOnHold data={audioData} data1={musicData}/>
                                </CardBox>
                             </div>
                       </div>               
                    );
        
    }
}

export default Audio;