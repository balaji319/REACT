import React from 'react';
import axios from 'axios';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import keycode from 'keycode';
import Table from '@material-ui/core/Table';
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
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
let counter = 0;
import CustomScrollbars from '../../util/CustomScrollbars';
import Dropzone from 'react-dropzone';
import CardBox from '../../components/CardBox/index';
import {
    Delete,
    PauseCircleOutline,
    PlayCircleOutline


    } from '@material-ui/icons'
function createData(name, calories, fat, carbs, protein) {
    counter += 1;
    return {id: counter, name, calories, fat, carbs, protein};
}

const columnData = [
    {id: 'MOH ID', numeric: false, disablePadding: true, label: 'MOH ID'},
    {id: 'MOH Name', numeric: true, disablePadding: false, label: 'MOH Name'},
    {id: 'Active', numeric: true, disablePadding: false, label: 'Active'},
    {id: 'Random Order', numeric: true, disablePadding: false, label: 'Random Order'},
    {id: 'Admin Group', numeric: true, disablePadding: false, label: 'Admin Group'},
    {id: 'Modify', numeric: false, textAlign:'text-center', disablePadding: false, label: 'Modify'},
];

class DataTableHead extends React.Component {
    static propTypes = {
        onRequestSort: PropTypes.func.isRequired,
        onSelectAllClick: PropTypes.func.isRequired,
        order: PropTypes.string.isRequired,
        orderBy: PropTypes.string.isRequired,
        rowCount: PropTypes.number.isRequired,
    };

    createSortHandler = property => event => {
        this.props.onRequestSort(event, property);
    };

    render() {
        const {onSelectAllClick, order, orderBy, numSelected, rowCount} = this.props;

        return (
            <TableHead>
                <TableRow>
                   
                    {columnData.map(column => {
                        return (
                            <TableCell  className={column.textAlign}
                                key={column.id}
                                numeric={column.numeric}
                                padding={column.disablePadding ? 'none' : 'default'}
                            >
                                <Tooltip
                                    title="Sort"
                                    placement={column.numeric ? 'bottom-end' : 'bottom-start'}
                                    enterDelay={300}
                                >
                                    <TableSortLabel
                                        active={orderBy === column.id}
                                        direction={order}
                                        onClick={this.createSortHandler(column.id)}
                                    >
                                        {column.label}
                                    </TableSortLabel>
                                </Tooltip>
                            </TableCell>
                        );
                    }, this)}
                </TableRow>
            </TableHead>
        );
    }
}



class DataTable extends React.Component {
    handleRequestSort = (event, property) => {
        const orderBy = property;
        let order = 'desc';

        if (this.state.orderBy === property && this.state.order === 'desc') {
            order = 'asc';
        }

        const data =
            order === 'desc'
                ? this.state.data.sort((a, b) => (b[orderBy] < a[orderBy] ? -1 : 1))
                : this.state.data.sort((a, b) => (a[orderBy] < b[orderBy] ? -1 : 1));

        this.setState({data, order, orderBy});
        console.log(event, this.refs.audio);
        this.refs.audio.load();
    };
    handleSelectAllClick = (event, checked) => {
        if (checked) {
            this.setState({selected: this.state.data.map(n => n.id)});
            return;
        }
        this.setState({selected: []});
    };
    handleKeyDown = (event, id) => {
        if (keycode(event) === 'space') {
            this.handleClick(event, id);
        }
    };
    handleClick = (event, id) => {
        const {selected} = this.state;
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        this.setState({selected: newSelected});
    };
    handleChangePage = (event, page) => {
        this.setState({page});
    };
    handleChangeRowsPerPage = event => {
        this.setState({rowsPerPage: event.target.value});
    };
    
    isSelected = id => this.state.selected.indexOf(id) !== -1;

    handleDelete = (event, page) => {
       console.log(page);
    };


    constructor(props, context) {
        super(props, context);

        this.state = {
            order: 'asc',
            orderBy: 'calories',
            selected: [],
            data: this.props.data.audio_list,
            data1:this.props.data1,
            audioDirUrl:this.props.data.audio_dir_url,
            page: 0,
            rowsPerPage: 5,
            value:'',
            currentAudioUrl:'',
            isPLaying:false,
            currentAudio:'',
            lastPlayed:'',
            accepted: '',
            rejected: ''

        };

//         this.refs.pause.hide()
             this.audio = new Audio();

    }
    
    handleChange = (event, value) => {
        this.setState({value});
    };
     componentWillReceiveProps(nextProps) { 
         console.log(nextProps);
  this.setState({data: nextProps.data.audio_list,audioDirUrl:nextProps.data.audio_dir_url,data1:nextProps.data1 });


        }
    
    handlePlay = name => {

        console.log("this.refs.audio",this.refs.audio)
        var nowPlaying = this.state.lastPlayed; 
      
        this.setState({currentAudio: name});
      
        if(nowPlaying!=name || nowPlaying==''){
            this.setState({currentAudioUrl: this.state.audioDirUrl+name,
            lastPlayed:name,
            currentAudio: name});
         //   this.refs.audio.load();
        }
        this.state.currentAudioUrl=this.state.audioDirUrl+name;
        console.log(this.state.currentAudioUrl);
         this.audio = new Audio(this.state.currentAudioUrl);
      
    
         //this.audio.play();
       // this.setState({audio: name});
         // this.refs.audio = new Audio(this.state.currentAudioUrl);
        // 
         this.audio.load()
        this.audio.play()
    }
    
   
    handlePause = name => {
        this.audio.pause();
        this.setState({currentAudio: ''});
    }
   
    onPauseHandler = flag=>  {
        if(flag=='play'){
             this.setState({currentAudio: this.state.lastPlayed});
        }else{
            this.setState({currentAudio: ''});
        }
    }
    
    componentDidMount() {
//         let _this = this;
//            axios.get('api/admin-utilities/audio-lists')
//                .then(response => {
//                    _this.setState({
//                        data:  response.data.audio_list,
//                        audioDirUrl : response.data.audio_dir_url
//                    });
//                })
//                .catch(function (error) {
//                    console.log(error);
//                })
    }
handleLangChange = (value1) => {

    this.props.onSelectLanguage(value1);            
}

    render() {
        const {data, data1,order, orderBy, currentAudio,lastPlayed, selected, rowsPerPage, page,audioDirUrl,currentAudioUrl} = this.state;
          const divStyle = {
              height: 30
             
           };

        return (
             <div>

                <div className="row" >
                    
                </div>
                <div className="flex-auto" style={{width: '100%'}}>
                 {console.log("OKKKK")}{console.log(data1)}
                    <div className="table-responsive-material">

                        <Table className="">
                            <DataTableHead
                                order={order}
                                orderBy={orderBy}
                                onSelectAllClick={this.handleSelectAllClick}
                                onRequestSort={this.handleRequestSort}
                                rowCount={data.length}
                            />
                            <TableBody>
                            

                                {data1.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((n,key) => {
                                    const isSelected = this.isSelected(n.ViciMusicOnHold.moh_name);
                                    return (
                                     <TableRow
                                            hover
                                            onClick={event => this.handleClick(event, n.ViciMusicOnHold.moh_name)}
                                            onKeyDown={event => this.handleKeyDown(event, n.ViciMusicOnHold.moh_name)}
                                            role="checkbox"
                                            aria-checked={isSelected}
                                            tabIndex={-1}
                                            key={key}
                                            selected={isSelected}
                                        >   
                                           <TableCell padding="none" >{n.ViciMusicOnHold.moh_id} </TableCell>
                                            <TableCell numeric>{n.ViciMusicOnHold.moh_name}</TableCell>
                                            <TableCell numeric>{n.ViciMusicOnHold.active}</TableCell>
                                            <TableCell numeric>{n.ViciMusicOnHold.random}</TableCell>
                                            <TableCell numeric>{n.ViciMusicOnHold.user_group}</TableCell>
                                             <TableCell style={ divStyle } className='text-center' style={{whiteSpace:'nowrap'}}> 
                                                <Tooltip title="Modify Script">
                                                    <IconButton onClick={()=>this.handleEditEventHandler(n.ViciMusicOnHold.moh_id)}>
                                                        <i className="zmdi zmdi-edit font-20" />
                                                    </IconButton>     
                                                </Tooltip>
                                                <Tooltip title="Delete Script">
                                                    <IconButton onClick={()=>this.DeleteInboundHandler(n.ViciMusicOnHold.moh_id)}>
                                                      <i className="zmdi zmdi-close " />
                                                    </IconButton>     
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>




                                           
                                    );
                                })}
                              
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TablePagination
                                        count={data.length}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        onChangePage={this.handleChangePage}
                                        onChangeRowsPerPage={this.handleChangeRowsPerPage}
                                    />
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                </div>
            </div>
        );
    }
}

export default DataTable;