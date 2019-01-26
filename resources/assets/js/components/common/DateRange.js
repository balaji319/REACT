import {
  React,
  FormControl,
  moment,
  DayPickerInput,
  formatDate,
  parseDate
} from "./plugins";
import "react-day-picker/lib/style.css";
class DateRange extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      from: undefined,
      to: undefined
    };
    this.handleFromChange = this.handleFromChange.bind(this);
    this.handleToChange = this.handleToChange.bind(this);
  }

  showFromMonth() {
    const { from, to } = this.state;
    if (!from) {
      return;
    }
    if (moment(to).diff(moment(from), "months") < 2) {
      this.to.getDayPicker().showMonth(from);
    }
  }

  handleFromChange(from) {
    this.setState({ from });
    this.props.onFromChange(from);
  }

  handleToChange(to) {
    this.setState({ to }, this.showFromMonth);
    this.props.onToChange(to);
    console.log(to);
  }

  render() {
    const { dense, secondary, from, to } = this.state;

    const modifiers = { start: from, end: to };
    return (
      <FormControl className="w-100 mb-2">
        <div key="basic_day" className="picker">
          <div className="InputFromTo">
            <DayPickerInput
              value={this.props.from}
              className="DatePickerInput"
              placeholder="From"
              format="YYYY-MM-DD"
              formatDate={formatDate}
              parseDate={parseDate}
              dayPickerProps={{
                selectedDays: [from, { from, to }],
                disabledDays: { after: to },
                toMonth: to,
                modifiers,
                numberOfMonths: 2,
                onDayClick: () => this.to.getInput().focus()
              }}
              onDayChange={this.handleFromChange}
            />{" "}
            —{" "}
            <span className="InputFromTo-to">
              <DayPickerInput
                ref={el => (this.to = el)}
                value={this.props.to}
                placeholder="To"
                format="YYYY-MM-DD"
                formatDate={formatDate}
                parseDate={parseDate}
                dayPickerProps={{
                  selectedDays: [from, { from, to }],
                  disabledDays: { before: from },
                  modifiers,
                  month: from,
                  fromMonth: from,
                  numberOfMonths: 2
                }}
                onDayChange={this.handleToChange}
              />
            </span>
          </div>
        </div>
      </FormControl>
    );
  }
}

export default DateRange;
