import { React,Table,TableBody,TableCell,TableHead,TableRow,InfoCard,ContainerHeader,
        CardBox,Paper,Input,InputLabel,MenuItem,FormControl,
    FormHelperText,Select,Card,CardBody,CardSubtitle,CardText,TextField,cloneElement,Component,Button,moment,DayPickerInput,formatDate,parseDate,Helmet  } from './plugins';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

class InboundGroupDropdown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userGroups:[],
        };

    }

    handleChange = name => event => {
        //this.setState({[name]: event.target.value});
        let data = event.target.value
        console.log("________________________")
        console.log(name)
        console.log(data)
        console.log("________________________")
        this.props.onChange(name,data);
    };

    render() {
        const {userGroups} = this.state;
    return (
                <FormControl className="w-100 mb-2">
                    <InputLabel htmlFor="name-multiple">{this.props.label}</InputLabel>
                    <Select
                        multiple
                        value={this.props.selectedValue}
                        onChange={this.handleChange(this.props.name)}
                        input={<Input id="name-multiple"/>}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                                    width: 200,
                                },
                            },
                        }}>
                        { Object.keys(this.props.options).map((item, i) => (
                             <MenuItem
                                key={i}
                                value={this.props.options[item].campaign_id}
                                style={{
                                    fontWeight: this.props.selectedValue.indexOf(name) !== -1 ? '500' : '400',
                                }}>
                                {this.props.options[item].campaign_id}
                            </MenuItem>
                        ))}


                    </Select>
                    <FormHelperText></FormHelperText>
                </FormControl>
    );
}
}


export default InboundGroupDropdown;