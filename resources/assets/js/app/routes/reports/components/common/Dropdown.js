import { React,Table,TableBody,TableCell,TableHead,TableRow,InfoCard,ContainerHeader,
    CardBox,Paper,Input,InputLabel,MenuItem,FormControl,
FormHelperText,Select,Card,CardBody,CardSubtitle,CardText,TextField,cloneElement,Component,Button,moment,DayPickerInput,formatDate,parseDate,Helmet  } from './plugins';

class Dropdown extends React.Component {
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
                <InputLabel htmlFor="age-simple">{this.props.label}</InputLabel>
                <Select
                    value={this.props.selectedValue}
                    onChange={this.handleChange(this.props.name)}
                    input={<Input id="age-simple"/>}>

                    {this.props.data.map((item,i)=>(
                        <MenuItem key={i} value={item}>{item}</MenuItem>
                    ))};
                    
                </Select>
            </FormControl>
        );
    }
}

export default Dropdown;