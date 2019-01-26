import React from 'react';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
class TextFields extends React.Component {
    constructor(props) {
        super(props);
    }

    handleChange = name => event => {
        let data = event.target.value
        this.props.onChange(name,data);     
    };

    render() {
        
        return (
            <FormControl className="w-100 mb-2">
                <TextField
                    margin="normal"
                    id={this.props.id}
                    label={this.props.label}
                    fullWidth
                    value={this.props.value}
                    onChange={this.handleChange(this.props.name)}
                />
            </FormControl>
        );
    }
}

export default TextFields;
