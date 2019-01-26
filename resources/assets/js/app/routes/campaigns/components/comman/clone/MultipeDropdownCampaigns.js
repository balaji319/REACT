import {
  React,
  Input,
  InputLabel,
  MenuItem,
  FormControl,
  FormHelperText,
  Select
} from "./plugins";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

class InboundGroupDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userGroups: []
    };
  }

  handleChange = name => event => {
    let data = event.target.value;
    this.props.onChange(name, data);
  };

  render() {
    const { userGroups } = this.state;
    return (
      <FormControl className="w-100 mb-2">
        <InputLabel htmlFor="name-multiple">{this.props.label}</InputLabel>
        <Select
          multiple
          value={this.props.selectedValue}
          onChange={this.handleChange(this.props.name)}
          input={<Input id="name-multiple" />}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 200
              }
            }
          }}
        >
          {this.props.default ? (
            <MenuItem
              key={"001"}
              value={this.props.default}
              style={{
                fontWeight:
                  this.props.selectedValue.indexOf(this.props.default) !== -1
                    ? "500"
                    : "400"
              }}
            >
              {this.props.default}
            </MenuItem>
          ) : (
            ""
          )}
          {Object.keys(this.props.options).map((item, i) => (
            <MenuItem
              key={i}
              value={this.props.options[item].campaign_id}
              style={{
                fontWeight:
                  this.props.selectedValue.indexOf(name) !== -1 ? "500" : "400"
              }}
            >
              {this.props.options[item].campaign_id}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText />
      </FormControl>
    );
  }
}

export default InboundGroupDropdown;
