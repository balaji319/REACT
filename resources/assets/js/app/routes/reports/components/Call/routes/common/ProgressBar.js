import { React,Table,TableBody,TableCell,TableHead,TableRow,Paper} from './plugins';

class ProgressBar extends React.Component {
    constructor(props) {
        super(props);
       
    }
    render() {   
        return (
            <div className="progress">
                <div
                    title={this.props.title}
                    className={"progress-bar progress-bar-striped progress-bar-animated progress-bar-info"}
                    style={{
                        width:this.props.data,textAlign: 'right'
                    }}
                >{this.props.text}
                </div>
            </div>
        );
    }
}

export default ProgressBar
