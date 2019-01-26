import { React,Component,connect, Redirect, ContainerHeader, axios, classNames, PropTypes, keycode, Table, MenuItem, TableBody , TableCell , TableFooter , TableHead , TablePagination , TableRow , TableSortLabel , Toolbar , Typography , Paper , Checkbox , IconButton , Tooltip , DeleteIcon , Switch , Button , Dialog , DialogActions , DialogContent , DialogContentText , DialogTitle , TextField , SweetAlert , CircularProgress  } from '../../../../../../../components/plugins.js';
import { fetchAllAgentGroup, updateRecord ,deleteRecordGroup} from '../../../../actions/';
import {createNotification} from '../../../../../../../Helpers';
import DataTableHead from './DataTableHead';
import Clone from './comman/clone/Clone';
let counter = 0;



class List extends React.Component {

            //calss  constructor 
            constructor(props, context) {
                super(props, context);
                this.state = {
                    order: 'asc',
                    orderBy: 'group_id',
                    selected: [],
                    data: [],
                    page: 0,
                    openClone:false,
                    rowsPerPage: DEFAULT_PAGE_SIZE,
                    showAlert: false,
                    alertContent: '',
                    alertTitle: '',
                    showConfirm:false,
                    deleteScriptId:'',
                    fromScriptId:'',
                    newScriptId:'',
                    isLoading :false,
                    ajaxdata:'',
                    total:'',
                    search_value:''
                    
                };
                           
            }

              //table sort function        
            handleRequestSort = (event, property) => {
                    let temp_data =this.props.Agent.data ;
                    const orderBy = property;
                    let order = 'desc';
                    if (this.state.orderBy === property && this.state.order === 'desc') {order = 'asc';}
                    const data = order === 'desc' ? temp_data.sort((a, b) => (b[orderBy] < a[orderBy] ? -1 : 1)) : temp_data.sort((a, b) => (a[orderBy] < b[orderBy] ? -1 : 1));
                    this.setState({ data, order, orderBy  });
             };

            //active  switch changes   
            statusChangeHandler = (event,data) => {
                var  let_this = this;
                let formData ={
                    'group_id': event.target.value,
                    'active': data ? 'Y' : 'N'
                };
                setTimeout(function(){  let_this.props.updateRecord(formData); }, 10);
              
            };
            
            DeleteConfirmHandler = () =>{ var let_this = this;
                this.onCancelDeleteHandler();
                let formData ={
                    'user_id': this.state.deleteInboundId
                };
                setTimeout(function(){ let_this.props.deleteRecordGroup(formData); }, 10);
             }

            handleKeyPress = (event) => {

                if(event.key == 'Enter'){

                  this.setState({showAlert:false}); let rowsPerPage = this.state.rowsPerPage;this.props.fetchAllAgentGroup(0,rowsPerPage,this.state.search_value); 
                }
              }

            //handle  methods && custome Handler 
            changePageHandler = (event, page) => {this.setState({page});};
            
            changeRowsPerPageHandler = event => {this.setState({rowsPerPage: event.target.value}); };

            DeleteInboundHandler = (id) => {this.setState({showConfirm:true,deleteInboundId:id});};

            handleEditEventHandler = (id) => {this.props.history.push('edit/'+id) };

            DidEventHandler = (id) => {this.props.history.push('InboundGroup/'+id) };

            handleAddEventHandler = (id) => {this.props.history.push('add/') };

            campaignToGroupHandler = (id) => {this.props.history.push('AssignCampaignToGroup/'+id) };

            CallMenEventHandler = (id) => {this.props.history.push('callMenuInGroup/'+id) };

            onCancelDeleteHandler = () => { this.setState({showConfirm: false});};
            
            openCloneDialog = () => {this.setState({openClone:!this.state.openClone, })}
            //alert msg 
            showAlert(status,msg){this.setState({alertTitle: status,alertContent: msg,showAlert:true});};

            onCancelAlert = () => { this.setState({showAlert: false});};

            handleChangeHandler = name => event => {this.setState({ [name]: event.target.value,}); };
       
            componentWillReceiveProps(nextPropsFromRedux) {
              this.setState({  
                alertTitle: nextPropsFromRedux.Agent.alertMessageTitle,
                showAlert:nextPropsFromRedux.Agent.showMessage,
                alertContent: nextPropsFromRedux.Agent.alertMessage,
                total:nextPropsFromRedux.Agent.total,
                ajaxdata:nextPropsFromRedux.Agent.data,
              });

            }

    
             componentDidMount() { 
             this.getAgentGroupList(0,this.state.rowsPerPage)
            }
            // Pagination section 
            getAgentGroupList(page = 0, page_size = 10) { let $this = this; let rowsPerPage = $this.state.rowsPerPage;let current_page = page + 1;this.props.fetchAllAgentGroup(current_page,page_size,this.state.search_value);}
            
            handleChangeRowsPerPage = event => { this.setState({ rowsPerPage: event.target.value });this.getAgentGroupList(this.state.page, event.target.value); };
            //handle  methods && custome Handler 
            changePageHandler = (event, page) => { this.setState({page});this.getAgentGroupList(page, this.state.rowsPerPage); };
            
            changeRowsPerPageHandler = event => {this.setState({rowsPerPage: event.target.value}); this.getAgentGroupList(this.state.page, event.target.value); };

            onSearchChange = name => e => { this.setState({ [name]: e.target.value }); let rowsPerPage = this.state.rowsPerPage;this.props.fetchAllAgentGroup(0,rowsPerPage,e.target.value);  };

            render() {

                const {data, order, orderBy, selected, ajaxdata,total,openClone,rowsPerPage, page, showAlert,alertContent,alertTitle,showConfirm,showClonePopup,search_value,showCloneConfirm,fromScriptId,newScriptId,fromScriptIdError,newScriptIdError} = this.state;

                const {Agent} = this.props;

                const divStyle = {padding: '4px 30px 4px 24px',textAlign:'left'};
                  showAlert ?  (createNotification(alertTitle,alertTitle,alertContent), this.getAgentGroupList(0,this.state.rowsPerPage) ) :'';
                return (
                        <div>
                            <ContainerHeader match={this.props.match} title='Agents Group Listing '/>
                           <Dialog maxWidth="md"  fullWidth={true} open={this.state.openClone} onClose={this.handleCloneClose} close={this.handleCloneClose} >
                                  <DialogTitle>
                                      {"Clone A Agent Group "}
                                  </DialogTitle>
                                  <DialogContent>    
                                      <Clone closeClone={this.handleSaveCloneClose} close={this.openCloneDialog}/>
                                  </DialogContent>
                                  <DialogActions>
                                     
                                  </DialogActions>
                              </Dialog>
                            <Paper>


                               <SweetAlert show={showConfirm} warning showCancel confirmBtnText='Yes Delete It' confirmBtnBsStyle="danger" cancelBtnBsStyle="default"title='' onConfirm={this.DeleteConfirmHandler} onCancel={this.onCancelDeleteHandler}> Are you sure to delete this Record ?</SweetAlert>
                               
                               
                                <Toolbar
                                    className="table-header">
                                    <div className="title">
                                            <h3><i className="zmdi zmdi-view-web mr-2"/> Listing</h3>
                                    </div>
                                    <div className="spacer"/>
                                      <div className="search-bar right-side-icon bg-transparent search-dropdown">
                                              <div className="form-group">
                                              <input className="form-control border-0" type="search" name="search_value"  disabled={this.props.Agent.isLoading} value={search_value} onChange={this.handleChangeHandler('search_value')} onKeyPress= {this.handleKeyPress} />
                                                 <button className="search-icon">
                                                 <i className="zmdi zmdi-search zmdi-hc-lg" onClick={this.onSearchChange('search_value')} ></i>
                                              </button>
                                              </div>
                                            </div>
                                    <div className="actions" style={{ display: 'inherit'}}>
                                             <Tooltip title="Add New List">
                                                <IconButton className='btn-sm' aria-label="Delete" onClick={this.handleAddEventHandler} >
                                                    <i className="fa fa-plus-circle" aria-hidden="true"></i>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Clone a Campaign">
                                                <IconButton className='btn-sm' aria-label="Delete" onClick={this.openCloneDialog} >
                                                  <i className="zmdi zmdi-copy font-20"/>
                                                </IconButton>
                                            </Tooltip>

                                    </div>
                                </Toolbar>
                                <div className="flex-auto">
                                    <div className="table-responsive-material">
                                        <Table className="">
                                            <DataTableHead
                                                numSelected={selected.length}
                                                order={order}
                                                orderBy={orderBy}
                                                onSelectAllClick={this.handleSelectAllClick}
                                                onRequestSort={this.handleRequestSort}
                                                rowCount={parseInt(total)}
                                                />
                                            <TableBody>
                                               { ajaxdata && Agent.sectionin=='Agent Group Success' &&  ajaxdata.map(n => {
                                                        return (
                                                                   <TableRow key={n.group_name} >
                                                                         <TableCell style={ divStyle }>{n.user_group}</TableCell>
                                                                         <TableCell style={ divStyle }>{n.group_name}</TableCell>
                                                                         <TableCell style={ divStyle }>{n.forced_timeclock_login}</TableCell>  
                                                                         <TableCell style={ divStyle } className='text-center' style={{whiteSpace:'nowrap'}}> 
                                                                            <Tooltip title="Modify Agent Group">
                                                                                <IconButton onClick={()=>this.handleEditEventHandler(n.user_group)}>
                                                                                     <a className="teal-text"><i className="fa fa-pencil"></i></a>
                                                                                </IconButton>     
                                                                            </Tooltip>
                                                                            <Tooltip title="Delete Agent Group">
                                                                                <IconButton onClick={()=>this.DeleteInboundHandler(n.user_group)}>
                                                                                  <a className="red-text"><i className="fa fa-times"></i></a>
                                                                                </IconButton>     
                                                                            </Tooltip>
                                                                        </TableCell>
                                                                    </TableRow>
                                                            );
                                     
                                                })}
                                                {ajaxdata.length == 0 && this.props.Agent.isLoading  ? <TableRow><TableCell colSpan="11" ><center>Loading ......... </center></TableCell></TableRow> : ajaxdata.length == 0  ?  <TableRow><TableCell colSpan="11"><center>No Records Found </center></TableCell></TableRow> :<TableRow><TableCell colSpan="11"><center> </center></TableCell></TableRow> }
                                             
                                            </TableBody>
                                            <TableFooter>
                                                <TableRow>
                                                    <TablePagination
                                                        count={parseInt(total)}
                                                        rowsPerPage={rowsPerPage}
                                                        page={page}
                                                        onChangePage={this.changePageHandler} 
                                                        onChangeRowsPerPage={this.changeRowsPerPageHandler}
                                                        />
                                                </TableRow>

                                               
                                            </TableFooter>
                                        </Table>
                                   
                                    </div>
                                </div>
                            </Paper>
                             {
                                this.props.Agent.isLoading &&
                                <div className="loader-view">
                                    <CircularProgress/>
                                </div>
                            }
                        </div>
                       );
                            
            }
        }



function mapStateToProps(state, ownProps) {
    console.log(state);

    return {
        Agent: state.agent

    };
}

 const mapDispatchToProps = {
        fetchAllAgentGroup,
        deleteRecordGroup
    };
    
export default connect(mapStateToProps, mapDispatchToProps)(List);

