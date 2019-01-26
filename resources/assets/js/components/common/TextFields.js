import { React,Table,TableBody,TableCell,TableHead,TableRow,InfoCard,ContainerHeader,
    CardBox,Paper,Input,InputLabel,MenuItem,FormControl,
FormHelperText,Select,Card,CardBody,CardSubtitle,CardText,TextField,cloneElement,Component,Button,moment,DayPickerInput,formatDate,parseDate,Helmet  } from './plugins';

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