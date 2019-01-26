import React from 'react';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';

class header extends React.Component {
    constructor(props) {
        super(props);
    }

   

    render() {
        //const {data,name,selectedValue,label}=this.props;
        return (
          <div>
                     <div className="row" id="max-user-enabled" style={{}}>
                            <div className="col-sm-4 ">
                            </div>
                            <div className="col-sm-4 ">
                              <div className="tile-stats tile-blue" style={{textAlign: 'center', position: 'relative', background: '#5394c7', padding: 20, marginBottom: 0, overflow: 'hidden', WebkitBackgroundClip: 'padding-box', MozBackgroundClip: 'padding', backgroundClip: 'padding-box', transition: 'all .3s ease-in-out'}}><div className="num" id="max_allowed_login_user" style={{color: 'white', fontSize: 38}}>0<span style={{fontSize: 10}}>(Logged In)</span>/1<span style={{fontSize: 10}}>(License)<span /></span></div><h3>Agents</h3></div>
                            </div>
                          </div>
          </div>
        );
    }
}

export default header;