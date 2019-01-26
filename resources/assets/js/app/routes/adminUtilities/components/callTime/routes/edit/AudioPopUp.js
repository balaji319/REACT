import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import AddIcon from '@material-ui/icons/Add';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import MenuItem from '@material-ui/core/MenuItem';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import SweetAlert from 'react-bootstrap-sweetalert'
import CircularProgress from '@material-ui/core/CircularProgress';
import axios from 'axios';

import AudioManager from '../../../../../../../components/AudioManager';


class AudioPopUp extends Component {


 constructor(props) {
        super(props);
        this.state = {
            filtername: '',
            users :[],
            audioData:{audio_list:[],audioDirUrl:''}
    
        };


    }

    componentDidMount() {
         let _this = this;
            axios.get('api/admin-utilities/audio-lists')
                .then(response => { _this.setState({  audioData:  response.data,});})
                .catch(function (error) {
                    console.log(error);
                })
    }

    handleRequestClose = () => {this.props.onClose(this.props.selectedValue); };

    handleListItemClick = value => { 
        this.props.onClose(value); 


    };

    handlefilterList =(event) => {
        let filterData=[];
        const filterItems = (query) => {
            this.props.users.filter((e) =>{  if( e.name.toLowerCase().indexOf(query.toLowerCase()) > -1 ) {
                  filterData.push(e);
                }
            });
        }
       filterItems(event.target.value)
       if(filterData.length > 0)
         this.setState({users: filterData});         
       else
        this.setState({users: filterData});   
    };

    componentWillReceiveProps(){
          this.setState({users: this.props.users});
    }

    render() {
         
        const {classes,  onClose, selectedValue, ...other} = this.props;
         

         const {audioData} = this.state;

        return (
            <Dialog onClose={this.handleRequestClose} {...other} id="voicemail_dailog_list"  >
                <DialogTitle>Audio List</DialogTitle>
                <div id="table-1_filter" class="dataTables_filter" style={{textAlign:'right'}}>
                <label style={{paddingRight:'11px'}}>AUDIO:  <input type="search" value={this.state.inputValue} onChange={this.handlefilterList} className="form-control input-sm" style={{width:'250px',float:'right',marginBottom:'7px',marginLeft: '9px'}} placeholder="" aria-controls="table-1"/></label>
                </div>
                    <DialogContent>
                        <DialogContentText>
                        </DialogContentText>   
                         <table className="w3-table-all" className="w3-table-all">
                        <AudioManager data={audioData}  onSelectLanguage={this.handleListItemClick}/>
                     </table>
                    </DialogContent>
                  <div>
                </div>
            </Dialog>
        );
    }
}

AudioPopUp.propTypes = {
    onClose: PropTypes.func,
    selectedValue: PropTypes.string,
};
export default AudioPopUp;
