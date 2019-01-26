import React from 'react';
import {connect} from 'react-redux';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import InfoCard from '../../../../../../../components/InfoCard';
import ContainerHeader from '../../../../../../../components/ContainerHeader/index';
import CardBox from '../../../../../../../components/CardBox/index';
import Paper from '@material-ui/core/Paper';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';
import {Card, CardBody, CardSubtitle, CardText} from 'reactstrap';
import {cloneElement, Component} from 'react';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import MultipeDropdownCombineAgents from '../../../common/MultipeDropdownCombineAgents';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Helmet from "react-helmet";

function generate(element) {
    return [0, 1, 2].map(value =>
        cloneElement(element, {
            key: value,
        }),
    );
}

class AgentGroupLoginReport extends React.Component {

    constructor(props) {         
            super(props);   
            this.state = {             
                tableshow: false,
                agentGroup:[],            
                selected_groups:['-ALL-'],
                mydata: [],
                isLoading:false,
            };
          }  
    
    setSelectOptions = (name,value) =>{
        this.setState({
            [name]:value,
        })
    }
    
     handleCsvDownload (){
        alert('Download Success');
        //downloadCsvReports();
    }

    
    componentDidMount() 
    {      
        this.setState({isLoading:true});
        const {agentGroup} = this.state;
        var token = localStorage.getItem("access_token");
        
        const requestOptions = {headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer '+token ,}};
         
        axios.get('api/time_clock_user_group/',requestOptions).then(response=>{  
            this.setState({
                agentGroup: response.data.user_list,
                isLoading:false,
            })
            this.handleSubmit();
        }).catch(error =>{
            console.log(error);
        })
    }
    
    handleSubmit = () =>{            
        const {selected_groups, agentGroup} = this.state;
        const UGL = agentGroup.map((item,i)=>(item.user_group)).filter(Boolean); //Add .filter(Boolean) if remove "" value from array
        var auth_token = localStorage.getItem("access_token");
        this.setState({isLoading:true});
        
        axios.post('api/user_group_login/', {
            selected_groups: selected_groups.indexOf('-ALL-')==-1?selected_groups:UGL,                    
        }, {headers: { 
        	'Content-Type': 'application/json' ,
        	'Authorization' : 'Bearer '+auth_token  ,

        }}).then(response => {
            this.setState({
                mydata : response.data.list,                       
                tableshow : true,
                isLoading:false,
            })
            console.log(this.state.mydata);

        }).catch(error => {
            console.log(error);
            this.setState({                   
                isLoading:false,
                open: false
            })
        })         
    }     
    
    
    render() {
        const {agentGroup, selected_groups, mydata, tableshow, isLoading} = this.state;
     
    return (
        <div>
        <Helmet>
          <title>AgentGroupLoginReport : Ytel</title>
        </Helmet>
        <ContainerHeader match={this.props.match} title='Server Stats and Reports'/>
            <div className="row">
                <CardBox styleName="col-lg-12" heading="Agent Group Login Report">
                    <form className="row" autoComplete="off">

                        <div className="col-lg-6 col-sm-6 col-12 "><br /><br />
                            <FormControl className="w-100 mb-2">                            
                                <MultipeDropdownCombineAgents 
                                        label={"Users"} 
                                        options={agentGroup} 
                                        onChange={this.setSelectOptions}
                                        name={'selected_groups'}
                                        default={'-ALL-'}
                                        selectedValue={selected_groups}
                                    />
                            </FormControl>
                        </div>

                        <div className="col-lg-12">
                        <Button variant="raised" onClick={this.handleSubmit} className="jr-btn bg-green text-white">Submit</Button>
                        <Button variant="raised"  className="jr-btn bg-green text-white">CSV Download</Button>
                        </div>
                    </form>                    
                        { isLoading &&
                             <Dialog open={this.state.isLoading} onClose={this.handleRequestClose}>
                                 <DialogContent>
                                     <div className="loader-view">
                                         <CircularProgress/>
                                     </div>
                                 </DialogContent>
                             </Dialog>   
                         }
                </CardBox>
                <div className="col-lg-12">
                    {tableshow == true ?               
                        <Card className="shadow border-0 bg-default text-black">
                            <CardBody>
                                <Paper>
                                    <div className="table-responsive-material">
                                        <Table>
                                         <TableHead>
                                            <TableRow>
                                                <TableCell>AGENT NAME</TableCell>
                                                <TableCell >ID</TableCell>
                                                <TableCell >AGENT GROUP</TableCell>
                                                <TableCell >FIRST LOGIN DATE</TableCell>
                                                <TableCell >LAST LOGIN DATE</TableCell>
                                                <TableCell >CAMPAIGN</TableCell>
                                                <TableCell >SERVER IP</TableCell>
                                                <TableCell >COMPUTER IP</TableCell>
                                                <TableCell >EXTENSION</TableCell>
                                                <TableCell >BROWSER</TableCell>
                                                <TableCell >PHONE LOGIN</TableCell>
                                                <TableCell >SERVER PHONE</TableCell>
                                                <TableCell >PHONE IP</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>  
                                         {
                                             mydata.map((item,i)=>
                                             <TableRow key={i} hover>
                                                <TableCell>{item.full_name}</TableCell>
                                                <TableCell>{item.user}</TableCell>
                                                <TableCell>{item.user_group}</TableCell>
                                                <TableCell>{item.event_date}</TableCell>
                                                <TableCell>{item.event_date}</TableCell>
                                                <TableCell>{item.campaign_id}</TableCell>
                                                <TableCell>{item.server_ip}</TableCell>
                                                <TableCell>{item.computer_ip}</TableCell>
                                                <TableCell>{item.extension}</TableCell>
                                                <TableCell>{item.browser}</TableCell>
                                                <TableCell>{item.phone_login}</TableCell>
                                                <TableCell>{item.server_phone}</TableCell>
                                                <TableCell>{item.phone_ip}</TableCell>
                                            </TableRow>
                                             )
                                         }                                
                                        </TableBody>
                                            
                                        </Table>
                                    </div>
                                </Paper>
                            </CardBody>
                        </Card>: ""
                    }                 
                </div>
            </div>
        </div>
        );
    }
}

export default AgentGroupLoginReport;
