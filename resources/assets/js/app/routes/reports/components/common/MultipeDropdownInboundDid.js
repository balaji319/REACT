import { React,Table,TableBody,TableCell,TableHead,TableRow,InfoCard,ContainerHeader,
        CardBox,Paper,Input,InputLabel,MenuItem,FormControl,
    FormHelperText,Select,Card,CardBody,CardSubtitle,CardText,TextField,cloneElement,Component,Button,moment,DayPickerInput,formatDate,parseDate,Helmet  } from './plugins';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

class MultipeDropdownInboundDid extends React.Component {
   constructor(props) {
       super(props);
      
   }

   handleChange = name => event => {
       //this.setState({[name]: event.target.value});
       let data = event.target.value
       this.props.onChange(name,data);    
   };

   render() {
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
                           
                        {this.props.default ?
                         <MenuItem
                             key={"001"}
                             value={this.props.default}
                             style={{
                                 fontWeight: this.props.selectedValue.indexOf(this.props.default) !== -1 ? '500' : '400',
                             }}>
                             {this.props.default}
                         </MenuItem>
                         :""}
                     
                        {this.props.options != null ?                           
                            Object.keys(this.props.options).map((name,i )=> (
                                <MenuItem
                                    key={i}
                                    value={this.props.options[name].did_pattern}
                                    style={{
                                        fontWeight: this.props.selectedValue.indexOf(this.props.options[name]) !== -1 ? '500' : '400',
                                    }}>
                                    {this.props.options[name].did_pattern+" - "+this.props.options[name].did_description}
                                </MenuItem>
                            ))
                        : ""}
           
           
                        
            
            
                   </Select>
                   <FormHelperText></FormHelperText>
               </FormControl>
   );
}
}



export default MultipeDropdownInboundDid;