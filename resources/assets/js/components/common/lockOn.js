import {
  React,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  InfoCard,
  ContainerHeader,
  CardBox,
  Paper,
  Input,
  InputLabel,
  MenuItem,
  FormControl,
  FormHelperText,
  Select,
  Card,
  CardBody,
  CardSubtitle,
  CardText,
  TextField,
  cloneElement,
  Component,
  Button,
  moment,
  DayPickerInput,
  formatDate,
  parseDate,
  Helmet
} from "./plugins";

class LockOn extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div id="coverScreen" className="LockOn" />
      </div>
    );
  }
}

export default LockOn;
