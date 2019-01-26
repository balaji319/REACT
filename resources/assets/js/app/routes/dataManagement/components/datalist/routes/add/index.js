import React from 'react';
import InfoCard from '../../../../../../../components/InfoCard';
import ContainerHeader from '../../../../../../../components/ContainerHeader/index';
import CardBox from '../../../../../../../components/CardBox/index';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import {Card, CardBody, CardSubtitle, CardText} from 'reactstrap';
import {cloneElement, Component} from 'react';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import DATA from './data';
import Dropdown from '../../../comman/Dropdown';
import TextFields from '../../../comman/TextFields';

class Add extends React.Component {
    constructor(props) {
        super(props);
        var ts = new Date();
        this.state = {
            list_id:'',
            list_name:'',
            list_desc:'',
            campaign:'',
            active:'N',
            campaigns:DATA,
        };
    }

    handleChange = (name, value) => {
        this.setState({
            [name]: value,
        })
    }

    handleSubmit = () => {
        const { list_id,list_name,list_desc,campaign,active } = this.state;
        const data = {
            listId : list_id,
            listName : list_name,
            listDesc:list_desc,
            campaigns :campaigns,
        }
        console.log(data);
    }

    statusChangeHandler = (event, data) => {
        var let_this = this;
        this.setState({
            active: event.target.value,
        })
    };

    render() {
        const { list_id,list_name,list_desc,campaign,active,campaigns } = this.state;
        return (
            <div>

                <ContainerHeader match={this.props.match} title='Add A New List' />

                <div className="row">
                    <CardBox styleName="col-lg-12" heading={""}>
                        <form className="row" autoComplete="off">
                            <div className="col-lg-6 col-sm-6 col-12">

                                <TextFields
                                    id={"list_id"}
                                    label={"List ID (Required)"}
                                    value={list_id}
                                    name={"list_id"}
                                    onChange={this.handleChange}
                                />

                                <TextFields
                                    id={"list_name"}
                                    label={"List Name (Required)"}
                                    value={list_name}
                                    name={"list_name"}
                                    onChange={this.handleChange}
                                />
                                
                                <TextFields
                                    id={"list_desc"}
                                    label={"List Description"}
                                    value={list_desc}
                                    name={"list_desc"}
                                    onChange={this.handleChange}
                                />

                                <Dropdown 
                                    label={"Campaign"}
                                    name={"campaign"}
                                    selectedValue={campaign}
                                    data={campaigns}
                                    onChange={this.handleChange}
                                />
                                
                                <FormControl className="w-100 mb-2">
                                    <label htmlFor="age-simple">Active</label>
                                    <Switch 
                                        value={active} 
                                        onChange={this.statusChangeHandler} 
                                        defaultChecked={active == 'Y'} 
                                        ref={active} 
                                        color="primary" 
                                    />
                                </FormControl>
                                                    

                                <Button color="primary" className="jr-btn bg-success text-white" onClick={this.handleSubmit}>
                                    Submit
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

export default Add;