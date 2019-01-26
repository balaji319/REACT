import React from 'react';
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
import Switch from '@material-ui/core/Switch';
import Dropdown from '../../../comman/Dropdown';
import TextFields from '../../../comman/TextFields';
import moment from 'moment';
import {DatePicker} from 'material-ui-pickers';
import LIST_ID from "./data";
const OPTIONS = ['APPEND','UPDATE','REPLACE']

class CopyCustomFields extends React.Component {
    constructor(props) {
        super(props);
        var ts = new Date();
        this.state = {
            copy_field_from :'',
            copy_field_to :'',
            copy_option:'',
        };
    }

    handleChange = (name, value) => {
        this.setState({
            [name]: value,
        })
    }

    handleSubmit = () => {
        const { copy_field_from,copy_field_to,copy_option } = this.state;
        const data = {
            copy_field_from : copy_field_from,
            copy_field_to : copy_field_to,
            copy_option:copy_option,
        }
    }

    render() {
        const {  copy_field_from,copy_field_to,copy_option  } = this.state;
        return (
            <div>
                <ContainerHeader match={this.props.match} title={'Copy Fields to Another List :'} />

                <div className="row">
                    <CardBox styleName="col-lg-12" heading={""}>
                        <form className="row" autoComplete="off">
                            <div className="col-lg-6 col-sm-6 col-12">

                                <Dropdown 
                                    label={"List ID to Copy Fields From"}
                                    name={"copy_field_from"}
                                    selectedValue={copy_field_from}
                                    data={LIST_ID}
                                    onChange={this.handleChange}
                                 />
                                
                                <Dropdown 
                                    label={"List ID to Copy Fields to"}
                                    name={"copy_field_to"}
                                    selectedValue={copy_field_to}
                                    data={LIST_ID}
                                    onChange={this.handleChange}
                                 />

                                 <Dropdown 
                                    label={"Copy Option"}
                                    name={"copy_option"}
                                    selectedValue={copy_option}
                                    data={OPTIONS}
                                    onChange={this.handleChange}
                                 />                                
                                 
                                <Button color="primary" className="jr-btn bg-success text-white" onClick={this.handleSubmit}>
                                    Copy Data
                                </Button>
                            </div>
                        </form>
                    </CardBox>
                </div>
            </div>
        );
    }
}

export default CopyCustomFields;