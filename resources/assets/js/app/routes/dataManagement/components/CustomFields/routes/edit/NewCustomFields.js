import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import keycode from 'keycode';
import CardBox from '../../../../../../../components/CardBox/index';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import FilterListIcon from '@material-ui/icons/FilterList';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dropdown from '../../../comman/Dropdown';
import TextFields from '../../../comman/TextFields';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import { CSSTransition } from 'react-transition-group';


const FIELD_RANK = [1,2,3,4,5,6,7];
const FIELD_NAME_POSITION = ['LEFT','TOP'];
const FIELD_TYPE=['TEXT','AREA','SELECT','MULTI','RADIO">RADIO','CHECKBOX','DATE','TIME">TIME','DISPLAY','SCRIPT','HIDDEN">HIDDEN','HIDEBLOB','READONLY']
class NewCustomFields extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            id: '',
            custom_fields_dialog: false,
            field_lable: '',
            field_name: '',
            field_rank: '',
            field_order: '',
            field_name_position: '',
            field_desc: '',
            field_help: '',
            field_type: '',
            field_option: '',
            option_position: '',
            field_size: '',
            field_max: '',
            field_default: '',
            field_required: '',
            flag:false,
        };
        console.log(this.state.data);
    }

    handleChangePage = (event, page) => {
        this.setState({ page });
    };
    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value });
    };

    handledOpenCustomFieldsDialog = () => {
        this.setState({ custom_fields_dialog: !this.state.custom_fields_dialog })
    }
    handleChange = (name, value) => {
        this.setState({
            [name]: value,
        })
    }
    handleClose = () =>{
        this.props.onClose();
    }

    render() {
        const { id, data, order, orderBy, selected, rowsPerPage, page, time, custom_fields_dialog, field_lable, field_name, field_rank, field_order, field_name_position, field_desc, field_help, field_type, field_option, option_position, field_size, field_max, field_default, field_required } = this.state;

        return (
            <div>
                <div className="row">
                    <CardBox styleName="col-lg-12" heading={""}>
                        <form className="row" autoComplete="off">
                            <div className="col-lg-6 col-sm-6 col-12">
                                <TextFields
                                    id={"field_lable"}
                                    label={"Field Label"}
                                    value={field_lable}
                                    name={"field_lable"}
                                    onChange={this.handleChange}
                                />

                                <TextFields
                                    id={"field_name"}
                                    label={"Field Name"}
                                    value={field_name}
                                    name={"field_name"}
                                    onChange={this.handleChange}
                                />

                                <Dropdown
                                    label={"Field Rank"}
                                    name={"field_rank"}
                                    selectedValue={field_rank}
                                    data={FIELD_RANK}
                                    onChange={this.handleChange}
                                />

                                <Dropdown
                                    label={"Field order"}
                                    name={"field_order"}
                                    selectedValue={field_order}
                                    data={FIELD_RANK}
                                    onChange={this.handleChange}
                                />

                                <Dropdown
                                    label={"Field Position"}
                                    name={"field_name_position"}
                                    selectedValue={field_name_position}
                                    data={FIELD_NAME_POSITION}
                                    onChange={this.handleChange}
                                />
                                
                                <TextFields
                                    id={"field_desc"}
                                    label={"Field Description"}
                                    value={field_desc}
                                    name={"field_desc"}
                                    onChange={this.handleChange}
                                />

                                <TextFields
                                    id={"field_help"}
                                    label={"Field Help"}
                                    value={field_help}
                                    name={"field_help"}
                                    onChange={this.handleChange}
                                />

                                <Dropdown
                                    label={"Field Type"}
                                    name={"field_type"}
                                    selectedValue={field_type}
                                    data={FIELD_TYPE}
                                    onChange={this.handleChange}
                                />
                                <br/>
                                <Button color="primary" className="jr-btn bg-success text-white" onClick={this.handleSubmit}>
                                    Submit
                                </Button>
                                <Button color="primary" className="jr-btn bg-success text-white" onClick={this.handleClose}>
                                        Close
                                </Button>
                            </div>
                            <div className="col-lg-6 col-sm-6 col-12">
                            <TextFields
                                    id={"field_option"}
                                    label={"Field Option"}
                                    value={field_option}
                                    name={"field_option"}
                                    onChange={this.handleChange}
                                />

                                <TextFields
                                    id={"option_position"}
                                    label={"Option Position"}
                                    value={option_position}
                                    name={"option_position"}
                                    onChange={this.handleChange}
                                />

                                <TextFields
                                    id={"field_size"}
                                    label={"Field Size"}
                                    value={field_size}
                                    name={"field_size"}
                                    onChange={this.handleChange}
                                />
                                
                                <TextFields
                                    id={"field_max"}
                                    label={"Field Max"}
                                    value={field_max}
                                    name={"field_max"}
                                    onChange={this.handleChange}
                                />

                                <TextFields
                                    id={"field_default"}
                                    label={"Field Default"}
                                    value={field_default}
                                    name={"field_default"}
                                    onChange={this.handleChange}
                                />

                                <TextFields
                                    id={"field_required"}
                                    label={"Field Required"}
                                    value={field_required}
                                    name={"field_required"}
                                    onChange={this.handleChange}
                                />

                            </div>
                        </form>
                    </CardBox>
                </div>
            </div>
        );
    }
}

export default NewCustomFields;