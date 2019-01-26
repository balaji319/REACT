import { React,Component,connect, Redirect, ContainerHeader, ButtonNav,axios, classNames, PropTypes, keycode, Table, MenuItem, TableBody , TableCell , TableFooter , TableHead , TablePagination , TableRow , TableSortLabel , Toolbar , Typography , Paper , Checkbox , IconButton , Tooltip , DeleteIcon , Switch , Button , Dialog , DialogActions , DialogContent , DialogContentText , DialogTitle , TextField , SweetAlert , CircularProgress  } from './plugins';
import {createNotification} from '../../../../../../../../Helpers';
import DataTableHead from './DataTableHead';
import {rank_Count,grad_Count } from  './data'
let counter = 0;


class List extends React.Component {

            //calss  constructor
            constructor(props, context) {
                super(props, context);
                this.state = {
                    order: 'asc',
                    pageTitle: this.props.location.pathname.split('/')[5],
                    orderBy: 'group_id',
                    selected: [],
                    data: [],
                    page: 0,
                    rowsPerPage:DEFAULT_PAGE_SIZE,
                    showAlert: false,
                    alertContent: '',
                    alertTitle: '',
                    showConfirm:false,
                    isLoading :false,
                    is_change :false,
                    rankcount:'',
                    gradcount:'',
                    records: [],
                    u_records:[]
                };
            }

              //table sort function
            handleRequestSort = (event, property) => {
                    let temp_data =this.state.data ;
                    const orderBy = property;
                    let order = 'desc';
                    if (this.state.orderBy === property && this.state.order === 'desc') {order = 'asc';}
                    const data = order === 'desc' ? temp_data.sort((a, b) => (b[orderBy] < a[orderBy] ? -1 : 1)) : temp_data.sort((a, b) => (a[orderBy] < b[orderBy] ? -1 : 1));
                    this.setState({ data, order, orderBy  });
             };
            //handle  methods && custome Handler
            handleSubmit = () =>{

                     let formData ={
                          'user': this.state.pageTitle ,
                          'compaign_array' : this.state.u_records
                          };
                    axios.post('/api/compaign-rank-update',formData)
                    .then(response => {
                        createNotification("Success","Great",response.data.message)
                        this.setState({isLoading: false})
                    })
                    .catch(function(error) {
                       createNotification("Error","Error",error.response.data.msg)
                    })

            }

            //alert msg
            showAlert(status,msg){this.setState({alertTitle: status,alertContent: msg,showAlert:true});};

            onCancelAlert = () => { this.setState({showAlert: false});};

            changePageHandler = (event, page) => {this.setState({page});};

            handleChangeHandler = name => event => {


             this.setState({ [name]: event.target.value,});


           };

            handleChange(index, dataType, value , data) {
            let this_=this;
            var datata= this_.state.u_records;
            var retailCompanies =[]
            const newState = this.state.records.map((item, i) => {
              if (i == index) {
                retailCompanies = datata.filter(company => company.campaign_id_values != item.campaign_id_values);
                retailCompanies.push({...item, [dataType]: value,['update_row']:1});
                return {...item, [dataType]: value,['update_row']:1};

              }
              return item;
            });

            this.setState({ records: newState ,u_records:retailCompanies,is_change :true});

          }

            // befour component mount
            componentDidMount() {

                if(this.state.pageTitle=="list"){
                    this.props.history.push("/app/agent/agents/list");
                  }
               let formData ={
                    'user': this.state.pageTitle
                };
                this.setState({isLoading: true});
                 axios.post('/api/compaign-rank',formData)
                    .then(response => {
                        this.setState({records: response.data.data});
                        this.setState({isLoading: false})
                    })
                    .catch(function(error) {
                        console.log(error);
                    })

            }


          render() {
                const {pageTitle,data, order, orderBy, selected, u_records,rowsPerPage, page, showAlert,alertContent,rankcount,gradcountalertTitle,showConfirm,showClonePopup,showCloneConfirm,fromScriptId,newScriptId,fromScriptIdError,newScriptIdError} = this.state;
                //console.clear();
                  //custom style const
                const divStyle = {padding: '4px 30px 4px 24px'};
                const pageTitleTEXT ="Campaign Rank : "+ pageTitle;

                return (
                        <div>
                            <ContainerHeader match={this.props.match} title={pageTitleTEXT}/> {this.state.is_change && (
                            <ButtonNav click={this.handleSubmit} /> ) }
                            <Paper>
                                {/* Confirmation promat */}

                                <Toolbar className="table-header">
                                    <div className="title">
                                        <h3><i className="zmdi zmdi-view-web mr-2" /> Listing</h3>
                                    </div>
                                    <div className="spacer" />
                                    <div className="actions">
                                    </div>
                                </Toolbar>
                                <div className="flex-auto">
                                    <div className="table-responsive-material">
                                        <Table className="">
                                            <DataTableHead numSelected={selected.length} order={order} orderBy={orderBy} onSelectAllClick={this.handleSelectAllClick} onRequestSort={this.handleRequestSort} />
                                            <TableBody>
                                                {this.state.records.map((row, index) => { return (
                                                <TableRow key={this.state.records[index].campaign_id_values}>
                                                    <TableCell style={ divStyle }>
                                                         {this.state.records[index].campaign_id_values } - {this.state.records[index].campaign_name_values }
                                                    </TableCell>
                                                    <TableCell style={ divStyle }>
                                                        <select autoComplete="off" size="1" onChange={(e)=> this.handleChange(index, 'campaign_rank', e.target.value)} className="form-control" name="RANK_121"> {rank_Count.map(option => (
                                                            <option key={option} selected={this.state.records[index].campaign_rank == option ? true:false} value={option}>
                                                                {option}
                                                            </option>
                                                            ))}
                                                        </select>
                                                    </TableCell>
                                                    <TableCell style={ divStyle }>
                                                        <select autoComplete="off" size="1"  onChange={(e)=> this.handleChange(index, 'campaign_grade', e.target.value)} className="form-control" name="GRADE_121"> {grad_Count.map(option => (
                                                            <option key={option} selected={this.state.records[index].campaign_grade == option ? true:false } value={option}>
                                                                {option}
                                                            </option>
                                                            ))}
                                                        </select>
                                                    </TableCell>
                                                    <TableCell style={ divStyle }>{this.state.records[index].calls_today}</TableCell>
                                                    <TableCell style={ divStyle }>
                                                        <input type="text" className="form-control" size="25" maxLength="255" name="WEB_121" onChange={(e)=> this.handleChange(index, 'campaign_web', e.target.value)} value={this.state.records[index].campaign_web}/> </TableCell>

                                                </TableRow>

                                                    ); })}

                                                 {  this.state.records.length == 0 && this.state.isLoading  ? <TableRow><TableCell colSpan="11" ><center>Loading ......... </center></TableCell></TableRow> : this.state.records.length == 0  ?  <TableRow><TableCell colSpan="11"><center>No Records Found </center></TableCell></TableRow> :<TableRow><TableCell colSpan="11"><center> </center></TableCell></TableRow> }

                                            </TableBody>

                                        </Table>


                                    </div>
                                </div>
                            </Paper>
                            { this.state.isLoading &&
                            <div className="loader-view" id="loader-view">
                                <CircularProgress/>
                            </div>
                            }
                        </div>
                       );

            }
        }


export default (List);