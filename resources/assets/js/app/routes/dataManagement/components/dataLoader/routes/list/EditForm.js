import React from 'react';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CardBox from '../../../../../../../components/CardBox/index';
import FormControl from '@material-ui/core/FormControl';
import {Alert} from 'reactstrap';
import {Badge} from 'reactstrap';
import { clients_list, dup_setting, process_file } from './data';

import SweetAlert from 'react-bootstrap-sweetalert';
import Dropdown from '../common/Dropdown';

const CONDITIONS = ["abc", 'xyz'];
const VENDOR_LEAD_CODE = ["abc", 'xyz'];
const SOURCE_ID = ["abc", 'xyz'];
const PHONE_CODE = ["abc", 'xyz'];
const PHONE_NUMBER = ["abc", 'xyz'];
const TITLE = ["abc", 'xyz'];
const FIRST_NAME = ["abc", 'xyz'];
const MIDDLE_INITIAL = ["abc", 'xyz'];
const LAST_NAME = ["abc", 'xyz'];
const ADDRESS_1 = ["abc", 'xyz'];
const ADDRESS_2 = ["abc", 'xyz'];
const ADDRESS_3 = ["abc", 'xyz'];
const CITY = ["abc", 'xyz'];
const STATE = ["abc", 'xyz'];
const PROVINCE = ["abc", 'xyz'];
const POSTAL_CODE = ["abc", 'xyz'];
const COUNTRY_CODE = ["abc", 'xyz'];
const GENDER = ["abc", 'xyz'];
const DATE_OF_BIRTH = ["abc", 'xyz'];
const ALT_PHONE_NUMBER = ["abc", 'xyz'];
const EMAIL = ["abc", 'xyz'];
const SECURITY_PHRASE = ["abc", 'xyz'];
const COMMENTS = ["abc", 'xyz'];
const RANK = ["abc", 'xyz'];
const OWNER = ["abc", 'xyz'];
const COMPANY_NAME = ["abc", 'xyz'];
const OTHER_FIELD_FOR_TESTING = ["abc", 'xyz'];
const DROP_DOWN = ["abc", 'xyz'];
const NOTES = ["abc", 'xyz'];
const NEW = ["abc", 'xyz'];

class FormDialog extends React.Component {
    constructor(props) {
    super(props);  
        this.state = { 
            clientsList: "",
            dupSetting: "",
            processFile: "",
            vendorLeadCode: "",
            sourceID: "",
            phoneCode: "",
            phoneNumber: "",
            title: "",
            firstName: "",
            middleInitial: "",
            lastName: "",
            address1: "",
            address2: "",
            address3: "",
            city: "",
            state: "",
            province: "",
            postalCode: "",
            countryCode: "",
            gender: "",
            dateOfBirth: "",
            altPhoneNumber: "",
            email: "",
            securityPhrase: "",
            comments: "",
            rank: "",
            owner: "",
            companyName: "",
            otherFieldForTesting: "",
            dropDown: "",
            notes: "",
            newInput: "",
            warning: false
        }; 
    } 
    
   setSelectOptions = (name,value) =>{
        this.setState({
            [name]:value,
        });          
    }
    
    handleRequestClose = () => {
        this.setState({open: false});
        this.props.onClose(this.state.open);
    };  
    
    
    onConfirm = () => {
        this.setState({           
            warning: false,
        });
    };
    
    onCancel = () => {
        this.setState({
            custom: false,
            prompt: false
        })
    };
    
    deleteFile = () => {
        this.setState({
            warning: false
        })
    };
    onCancelDelete = () => {
        this.setState({
            warning: false
        })
    };
    
    handleSubmit=()=>{                     
        console.log(this.state);
        this.props.onClose(this.state.open);
    } 
    
       

    render() {
        const { warning, clientsList, dupSetting, processFile, vendorLeadCode, sourceID, phoneCode, phoneNumber, title, firstName, 
                middleInitial, lastName, address1, address2, address3, city, state, province, postalCode, countryCode, gender, 
                dateOfBirth, altPhoneNumber, email, securityPhrase, comments, rank, owner, companyName, otherFiledForTesting, dropDown, 
                notes, newInput, otherFieldForTesting } = this.state;
        return (
            <div>  
            
                <DialogTitle>File Process Settings - export_2018-05-23.csv</DialogTitle>
                <DialogContent>
                    <Alert className="shadow-lg" color="warning">
                            export_2018-05-23.csv (0.0000 MB) - 0 record(s)
                    </Alert>
                    <br />
        
                    <div className="row">
                    <CardBox styleName="col-lg-12" >
                        <form className="row" autoComplete="off">
                            <div className="col-lg-12 col-sm-12 col-12">                               
                                <FormControl className="w-100 mb-2">
                                     <Dropdown 
                                        label={"Condition"} 
                                        onChange={this.setSelectOptions}
                                        name={'clientsList'}
                                        selectedValue={clientsList}
                                        data={clients_list}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                     <Dropdown 
                                        label={"Condition"} 
                                        onChange={this.setSelectOptions}
                                        name={'dupSetting'}
                                        selectedValue={dupSetting}
                                        data={dup_setting}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <Dropdown 
                                        label={"Condition"} 
                                        onChange={this.setSelectOptions}
                                        name={'processFile'}
                                        selectedValue={processFile}
                                        data={process_file}
                                    />
                                </FormControl>                                
                            </div>
                            <div className="col-lg-6 col-sm-6 col-12">
                               <h3>Column Matching - <Badge href="javascript:void(0)" color="warning"><i className="zmdi zmdi-delete"></i> Reset Matching</Badge></h3>
                                <FormControl className="w-100 mb-2">
                                     <Dropdown 
                                        label={"Vendor Lead Code"} 
                                        onChange={this.setSelectOptions}
                                        name={'vendorLeadCode'}
                                        selectedValue={vendorLeadCode}
                                        data={VENDOR_LEAD_CODE}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                     <Dropdown 
                                        label={"Source ID"} 
                                        onChange={this.setSelectOptions}
                                        name={'sourceID'}
                                        selectedValue={sourceID}
                                        data={SOURCE_ID}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <Dropdown 
                                        label={"Phone Code"} 
                                        onChange={this.setSelectOptions}
                                        name={'phoneCode'}
                                        selectedValue={phoneCode}
                                        data={PHONE_CODE}
                                    />
                                </FormControl>
                            
                                <FormControl className="w-100 mb-2">
                                     <Dropdown 
                                        label={"Phone Number"} 
                                        onChange={this.setSelectOptions}
                                        name={'phoneNumber'}
                                        selectedValue={phoneNumber}
                                        data={PHONE_NUMBER}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                     <Dropdown 
                                        label={"Title"} 
                                        onChange={this.setSelectOptions}
                                        name={'title'}
                                        selectedValue={title}
                                        data={TITLE}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <Dropdown 
                                        label={"First Name"} 
                                        onChange={this.setSelectOptions}
                                        name={'firstName'}
                                        selectedValue={firstName}
                                        data={FIRST_NAME}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <Dropdown 
                                        label={"Middle Initial"} 
                                        onChange={this.setSelectOptions}
                                        name={'middleInitial'}
                                        selectedValue={middleInitial}
                                        data={MIDDLE_INITIAL}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <Dropdown 
                                        label={"Last Name"} 
                                        onChange={this.setSelectOptions}
                                        name={'lastName'}
                                        selectedValue={lastName}
                                        data={LAST_NAME}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <Dropdown 
                                        label={"Address 1"} 
                                        onChange={this.setSelectOptions}
                                        name={'address1'}
                                        selectedValue={address1}
                                        data={ADDRESS_1}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <Dropdown 
                                        label={"Address 2"} 
                                        onChange={this.setSelectOptions}
                                        name={'address2'}
                                        selectedValue={address2}
                                        data={ADDRESS_2}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <Dropdown 
                                        label={"Address 3"} 
                                        onChange={this.setSelectOptions}
                                        name={'address3'}
                                        selectedValue={address3}
                                        data={ADDRESS_3}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <Dropdown 
                                        label={"City"} 
                                        onChange={this.setSelectOptions}
                                        name={'city'}
                                        selectedValue={city}
                                        data={CITY}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <Dropdown 
                                        label={"State"} 
                                        onChange={this.setSelectOptions}
                                        name={'state'}
                                        selectedValue={state}
                                        data={STATE}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <Dropdown 
                                        label={"Province"} 
                                        onChange={this.setSelectOptions}
                                        name={'province'}
                                        selectedValue={province}
                                        data={PROVINCE}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <Dropdown 
                                        label={"Postal Code"} 
                                        onChange={this.setSelectOptions}
                                        name={'postalCode'}
                                        selectedValue={postalCode}
                                        data={POSTAL_CODE}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <Dropdown 
                                        label={"Country Code"} 
                                        onChange={this.setSelectOptions}
                                        name={'countryCode'}
                                        selectedValue={countryCode}
                                        data={COUNTRY_CODE}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <Dropdown 
                                        label={"Gender"} 
                                        onChange={this.setSelectOptions}
                                        name={'gender'}
                                        selectedValue={gender}
                                        data={GENDER}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <Dropdown 
                                        label={"Date Of Birth"} 
                                        onChange={this.setSelectOptions}
                                        name={'dateOfBirth'}
                                        selectedValue={dateOfBirth}
                                        data={DATE_OF_BIRTH}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <Dropdown 
                                        label={"Alt Phone Number"} 
                                        onChange={this.setSelectOptions}
                                        name={'altPhoneNumber'}
                                        selectedValue={altPhoneNumber}
                                        data={ALT_PHONE_NUMBER}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <Dropdown 
                                        label={"Email"} 
                                        onChange={this.setSelectOptions}
                                        name={'email'}
                                        selectedValue={email}
                                        data={EMAIL}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <Dropdown 
                                        label={"Security Phrase"} 
                                        onChange={this.setSelectOptions}
                                        name={'securityPhrase'}
                                        selectedValue={securityPhrase}
                                        data={SECURITY_PHRASE}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <Dropdown 
                                        label={"Comments"} 
                                        onChange={this.setSelectOptions}
                                        name={'comments'}
                                        selectedValue={comments}
                                        data={COMMENTS}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <Dropdown 
                                        label={"Rank"} 
                                        onChange={this.setSelectOptions}
                                        name={'rank'}
                                        selectedValue={rank}
                                        data={RANK}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <Dropdown 
                                        label={"Owner"} 
                                        onChange={this.setSelectOptions}
                                        name={'owner'}
                                        selectedValue={owner}
                                        data={OWNER}
                                    />
                                </FormControl>
                            </div>
                            <div className="col-lg-6 col-sm-6 col-12">
                            <br /><br />
                                <FormControl className="w-100 mb-2">                                                                   
                                    <Dropdown 
                                        label={"Company Name"} 
                                        onChange={this.setSelectOptions}
                                        name={'companyName'}
                                        selectedValue={companyName}
                                        data={COMPANY_NAME}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <Dropdown 
                                        label={"Other field for testing"} 
                                        onChange={this.setSelectOptions}
                                        name={'otherFieldForTesting'}
                                        selectedValue={otherFieldForTesting}
                                        data={OTHER_FIELD_FOR_TESTING}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <Dropdown 
                                        label={"Drop down"} 
                                        onChange={this.setSelectOptions}
                                        name={'dropDown'}
                                        selectedValue={dropDown}
                                        data={DROP_DOWN}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <Dropdown 
                                        label={"notes"} 
                                        onChange={this.setSelectOptions}
                                        name={'notes'}
                                        selectedValue={notes}
                                        data={NOTES}
                                    />
                                </FormControl>
                                <FormControl className="w-100 mb-2">                                                                   
                                    <Dropdown 
                                        label={"new"} 
                                        onChange={this.setSelectOptions}
                                        name={'newInput'}
                                        selectedValue={newInput}
                                        data={NEW}
                                    />
                                </FormControl>
                            </div>
                        </form>
                    </CardBox>            
                    </div>
                </DialogContent>
                    <DialogActions>
                    <Button onClick={()=> {this.setState({warning: true})}} color="secondary">
                        Close
                    </Button>
                    <Button onClick={this.handleSubmit} color="primary">
                        Save
                    </Button>
                </DialogActions>
                <SweetAlert 
                    show={warning} 
                    warning 
                    showCancel 
                    confirmBtnText={ "Yes DeleteIt"} 
                    confirmBtnBsStyle="danger" 
                    cancelBtnBsStyle="default" 
                    title={ "Are You Sure?"} 
                    onConfirm={this.deleteFile} 
                    onCancel={this.onCancelDelete}>
                    You will not be able to recover this imaginary file!
                </SweetAlert>
                
            </div>
        );
    }
}

export default FormDialog;
   // this.handleSubmit = this.handleRequestClose.bind(this);