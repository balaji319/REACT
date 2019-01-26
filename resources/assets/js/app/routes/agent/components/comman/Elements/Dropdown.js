import React from 'react';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';

class Dropdown extends React.Component {
    constructor(props) {
        super(props);
    }

    handleChange = name => event => {
        let data = event.target.value
        this.props.onChange(name,data);     
    };

    render() {
        const {data,name,selectedValue,label}=this.props;
        return (
            <FormControl className="w-100 mb-2">
                <InputLabel htmlFor="age-simple">{label}</InputLabel>
                <Select
                    value={selectedValue}
                    onChange={this.handleChange(name)}
                    input={<Input id="age-simple"/>}>

                    {Object.keys(data).map((item,i)=>(
                        <MenuItem key={i} value={item}>{data[item]}</MenuItem>
                    ))};
                    
                </Select>
            </FormControl>
        );
    }
}

export default Dropdown;
