import { React,Table,TableBody,TableCell,TableHead,TableRow,InfoCard,ContainerHeader,
    CardBox,Paper,Input,InputLabel,MenuItem,FormControl,
FormHelperText,Select,Card,CardBody,CardSubtitle,CardText,TextField,cloneElement,Component,Button,moment,DayPickerInput,formatDate,parseDate,Helmet  } from './plugins';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

class InboundGroupDropdown extends React.Component {
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
                    input={<Input id="age-simple"/>}
                    MenuProps={{
                        PaperProps: {
                            style: {
                                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                                width: 200,
                            },
                        },
                    }}
                    >
                            
                    {Object.keys(this.props.data).map((item,i)=>(
                        <MenuItem key={i} value={this.props.data[item].group_id}>{this.props.data[item].group_id} - {this.props.data[item].group_name}</MenuItem>
                    ))};
                    
                </Select>
            </FormControl>
        );
    }
}

export default InboundGroupDropdown;