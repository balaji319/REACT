import React from 'react';
import ContainerHeader from '../../../../../../../components/ContainerHeader/index';
import CardBox from '../../../../../../../components/CardBox/index';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import TextFields from '../../../comman/TextFields';
import moment from 'moment';
import {DatePicker} from 'material-ui-pickers';


class SearchLead extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

            from : moment(new Date()).format('YYYY-MM-DD'),
            to :moment(new Date()).format('YYYY-MM-DD'),
            vender_id:'',
            phone :'',
            alt_phone_search :false,
            lead_id :'',
            status : '',
            list_id:'',
            email :'',
            user:'',
            owner :'',
            first_name :'',
            last_name :'',
            dob :'',
            log_lead_id :'',
            log_phone:'',
        };
    }

    handleChange = (name, value) => {
        this.setState({
            [name]: value,
        })
    }

    handleSubmit = () => {
        const { from,to,vender_id,phone,alt_phone_search,lead_id,status,list_id,email,user,owner,first_name,last_name,dob,log_lead_id,log_phone,} = this.state;
        const data = {
            listId : list_id,
            listName : list_name,
            listDesc:list_desc,
            campaigns :campaign,
        }
        console.log(data);
    }

    statusChangeHandler = (event, data) => {
        var let_this = this;
        this.setState({
            active: event.target.value,
        })
    };

    handleShowResultEventHandler= () => { this.props.history.push('searchresult/') };

    handleFromDateChange = (date)  => {
        this.setState({from: moment(date).format('YYYY-MM-DD')});    
    };
    handleToDateChange = (date)  => {
        this.setState({to: moment(date).format('YYYY-MM-DD')});    
    };

    render() {
        const { from,to,vender_id,phone,alt_phone_search,lead_id,status,list_id,email,user,owner,first_name,last_name,dob,log_lead_id,log_phone} = this.state;

        return (
            <div>
                <ContainerHeader match={this.props.match} title={'Lead Search Options'} />

                <div className="row">
                    <CardBox styleName="col-lg-12" heading={""}>
                        <form className="row" autoComplete="off">
                            <div className="col-lg-6 col-sm-6 col-12">

                                <FormControl className="w-100 mb-2">
                                    <FormHelperText>From Date</FormHelperText>
                                    <DatePicker
                                        fullWidth
                                        value={from}
                                        format='YYYY-MM-DD'
                                        onChange={this.handleFromDateChange}
                                        animateYearScrolling={false}
                                        leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                                        rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                                    />
                                </FormControl>

                                <FormControl className="w-100 mb-2">
                                    <FormHelperText>To Date</FormHelperText>
                                    <DatePicker
                                        fullWidth
                                        value={to}
                                        format='YYYY-MM-DD'
                                        onChange={this.handleToDateChange}
                                        animateYearScrolling={false}
                                        leftArrowIcon={<i className="zmdi zmdi-arrow-back" />}
                                        rightArrowIcon={<i className="zmdi zmdi-arrow-forward" />}
                                    />
                                </FormControl>

                                <TextFields
                                    id={"vender_id"}
                                    label={"Vendor ID(vendor lead code)"}
                                    value={vender_id}
                                    name={"vender_id"}
                                    onChange={this.handleChange}
                                />
                                
                                <TextFields
                                    id={"phone"}
                                    label={"Phone"}
                                    value={phone}
                                    name={"phone"}
                                    onChange={this.handleChange}
                                />

                                <FormControl className="w-100 mb-2">
                                    <label htmlFor="age-simple">Alt Phone Search</label>
                                    <Switch 
                                        value={alt_phone_search} 
                                        onChange={this.statusChangeHandler} 
                                        defaultChecked={alt_phone_search == 'Y'} 
                                        ref={alt_phone_search} 
                                        color="primary" 
                                    />
                                </FormControl>

                                <TextFields
                                    id={"lead_id"}
                                    label={"Lead Id"}
                                    value={lead_id}
                                    name={"lead_id"}
                                    onChange={this.handleChange}
                                />
                                
                                <TextFields
                                    id={"status"}
                                    label={"Status"}
                                    value={status}
                                    name={"status"}
                                    onChange={this.handleChange}
                                />

                                <TextFields
                                    id={"list_id"}
                                    label={"List Id"}
                                    value={list_id}
                                    name={"list_id"}
                                    onChange={this.handleChange}
                                />


                                <TextFields
                                    id={"email"}
                                    label={"Email"}
                                    value={email}
                                    name={"email"}
                                    onChange={this.handleChange}
                                />


                                <TextFields
                                    id={"user"}
                                    label={"User"}
                                    value={user}
                                    name={"user"}
                                    onChange={this.handleChange}
                                />


                                <TextFields
                                    id={"owner"}
                                    label={"Owner"}
                                    value={owner}
                                    name={"owner"}
                                    onChange={this.handleChange}
                                />

                                <TextFields
                                    id={"first_name"}
                                    label={"First Name"}
                                    value={first_name}
                                    name={"first_name"}
                                    onChange={this.handleChange}
                                />

                                <TextFields
                                    id={"last_name"}
                                    label={"Last Name"}
                                    value={last_name}
                                    name={"last_name"}
                                    onChange={this.handleChange}
                                />


                                <TextFields
                                    id={"dob"}
                                    label={"Date of Birth (YYYY-MM-DD)"}
                                    value={dob}
                                    name={"dob"}
                                    onChange={this.handleChange}
                                />

                                <TextFields
                                    id={"log_lead_id"}
                                    label={"Lead ID"}
                                    value={log_lead_id}
                                    name={"log_lead_id"}
                                    onChange={this.handleChange}
                                />

                                <TextFields
                                    id={"log_phone"}
                                    label={"Log Phone"}
                                    value={log_phone}
                                    name={"log_phone"}
                                    onChange={this.handleChange}
                                />

                                <Button color="primary" className="jr-btn bg-success text-white" onClick={this.handleShowResultEventHandler}>
                                    SEARCH
                                </Button>

                            </div>
                            <div className="col-lg-6 col-sm-6 col-12">
                               
                            </div>
                        </form>
                    </CardBox>
                </div>
            </div>
        );
    }
}

export default SearchLead;