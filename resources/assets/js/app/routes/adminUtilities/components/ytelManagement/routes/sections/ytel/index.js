
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';import Tab from '@material-ui/core/Tab';

import { React,Component,connect, Redirect, ContainerHeader, axios, classNames, 
    PropTypes, keycode, Table, MenuItem, TableBody , TableCell , TableFooter ,
     TableHead , TablePagination , TableRow , TableSortLabel , Toolbar , Typography ,
      Paper , Checkbox , IconButton , Tooltip , DeleteIcon , Switch , Button , Dialog , 
      DialogActions , DialogContent , DialogContentText , DialogTitle , TextField , SweetAlert ,
       CircularProgress  } from './plugins';



import Group from '../group/'; 
import DataTableHead  from './DataTableHead'


import {x5ContactGroups} from './data'



function TabContainer(props) {
    return (
        <div style={{padding: 20}}>
            {props.children}
        </div>
    );
}


class Ytel extends React.Component {

    tabHandleChange = (event, value) => {
        this.setState({value});
    };

    constructor(props, context) {
        super(props, context);

        this.state = {
                    value: 0,
                    order: 'asc',
                    orderBy: 'group_id',
                    selected: [],
                    data: [],
                    page: 0,
                    rowsPerPage: 25,
                    showAlert: false,
                    alertContent: '',
                    alertTitle: '',
                    showConfirm:false,
                    isLoading :false,
                    alertTitle:''

        }
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
                    'user_id': event.target.value,
                    'active': data ? 'Y' : 'N'
                };
                setTimeout(function(){  let_this.props.updateStatusRecord(formData); }, 10);
            };

             statusChangeoutboundHandler = (event,data) => {
                var  let_this = this;
                let formData ={
                    'user_id': event.target.value,
                    'closer_default_blended': data ? '1' : '0'
                };
               setTimeout(function(){  let_this.props.updateStatusRecord(formData); }, 10);
            };
       
            
            DeleteConfirmHandler = () =>{ var let_this = this;
                this.onCancelDeleteHandler();
                let formData ={
                    'id': this.state.deleteInboundId
                };
                setTimeout(function(){ let_this.props.deleteRecord(formData); }, 10);
             }


            //handle  methods && custome Handler 
            changePageHandler = (event, page) => {this.setState({page});};
            
            changeRowsPerPageHandler = event => {this.setState({rowsPerPage: event.target.value}); };

            DeleteInboundHandler = (id) => {this.setState({showConfirm:true,deleteInboundId:id});}; 

            //alert msg 
            showAlert(status,msg){this.setState({alertTitle: status,alertContent: msg,showAlert:true});};

            onCancelAlert = () => { this.setState({showAlert: false});};

            handleChangeHandler = name => event => {

         
            };
       



    componentDidMount() {  
            this.setState({data:x5ContactGroups})
            } 
            

render() {
            const {data, order, orderBy, selected, rowsPerPage, page, showAlert,alertContent,alertTitle,showConfirm,showClonePopup,showCloneConfirm} = this.state;
            const divStyle = {padding: '4px 30px 4px 24px',textAlign:'left'};
            const {Agent} = this.props;
            const {value} = this.state;

        return (
                <div className="app-wrapper">
                    <div className="dashboard animated slideInUpTiny animation-duration-3">
                        <ContainerHeader match={this.props.match} title={value === 1 ?"Admin Utilities - Permission - Ytel" :"Admin Utilities - Management - Ytel Group"  } />
                        <AppBar className="bg-primary" position="static">
                    <Tabs value={value} onChange={this.tabHandleChange} scrollable scrollButtons="on">
                        <Tab className="tab" label="Ytel Group" />
                        <Tab className="tab" label="Ytel" />
                    </Tabs>
                </AppBar>
            <Paper>          
                {value === 0 &&
                <TabContainer>
                <div className="flex-auto">
                    <div className="table-responsive-material">
  
                          <div>
                            <Tooltip title="Add New Shift">
                                 <Button variant="raised"   className="bg-primary text-white"  style={{float:'right'}} onClick={()=>this.handleEditEventHandler('add')} >Add New Group</Button>
                            </Tooltip>   
                            <Paper>
                                <Toolbar
                                    className="table-header">
                                    <div className="title">
                                            <h3><i className="zmdi zmdi-view-web mr-2"/>Group Listing</h3>
                                    </div>
                                    <div className="spacer"/>
                                    <div className="actions">
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
                                                rowCount={data ? data.length :1}
                                                />
                                            <TableBody>
                                               { data ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(n => {
                                                        return (
                                                                   <TableRow key={n.x5_contact_group_id} >
                                                                         <TableCell style={ divStyle }>{n.X5ContactGroup.x5_contact_group_id}</TableCell>
                                                                         <TableCell style={ divStyle }>{n.X5ContactGroup.group_name}</TableCell>
                                                                         <TableCell style={ divStyle }>{n.X5ContactGroup.group_name}</TableCell>                                                               
                                                                         <TableCell style={ divStyle } className='text-center' style={{whiteSpace:'nowrap'}}> 
                                                                            <Tooltip title="Modify Script">
                                                                                <IconButton onClick={()=>this.handleEditEventHandler(n.x5_contact_group_id)}>
                                                                                    <i className="zmdi zmdi-edit font-20" />
                                                                                </IconButton>     
                                                                            </Tooltip>
                                                                            <Tooltip title="Delete Script">
                                                                                <IconButton onClick={()=>this.DeleteInboundHandler(n.X5ContactGroup.x5_contact_group_id)}>
                                                                                  <i className="zmdi zmdi-close " />
                                                                                </IconButton>     
                                                                            </Tooltip>
                                                                        </TableCell>
                                                                    </TableRow>
                                                            );
                                     
                                                }) : <TableRow > 

                                                <TableCell style={ divStyle }></TableCell>
                                                                         <TableCell style={ divStyle }> </TableCell>
                                                                         <TableCell style={ divStyle }> </TableCell>
                                                                         <TableCell style={ divStyle } > </TableCell>                                                        
                                                                         <TableCell style={ divStyle } > Loading ..........  </TableCell>
                                                                          <TableCell style={ divStyle }> </TableCell>
                                                                         <TableCell style={ divStyle }> </TableCell>
                                                                          <TableCell style={ divStyle }> </TableCell>
                                                                         <TableCell style={ divStyle }> </TableCell>
                                                                         <TableCell style={ divStyle } className='text-center' style={{whiteSpace:'nowrap'}}> 
                                                                        </TableCell>
                                               </TableRow> }
                                       
                                            </TableBody>
                                            <TableFooter>
                                                <TableRow>
                                                    <TablePagination
                                                        count={data ? data.length : 1}
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
                            </Paper>
                         
                        </div>

                     </div>
                </div>




                </TabContainer>}


                {value === 1 &&
                <TabContainer>
                
                <div className="flex-auto">
                    <div className="table-responsive-material">
                        <h1> Great Tab 2</h1>
                       
                         <Ytel/>
                    </div>
                </div>
                </TabContainer>}                                
            </Paper>
            </div>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
     console.log('================');
    console.log(state);
    console.log('================');
    return {
        Agent: state.admin_utilites

    };
}

 const mapDispatchToProps = {
        
    };
    
export default connect(mapStateToProps, mapDispatchToProps)(Ytel);
    



