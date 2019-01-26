import React from 'react';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';

class header extends React.Component {

    render() {
        //const {data,name,selectedValue,label}=this.props;
        return (
          <div>
                      <div className="search-bar right-side-icon bg-transparent search-dropdown">
                                      <div className="form-group">
                                      <input className="form-control border-0" type="search" name="search_value"  disabled={this.props.Agent.isLoading} value={search_value} onChange={this.handleChangeHandler('search_value')} />
                                         <button className="search-icon">
                                         <i className="zmdi zmdi-search zmdi-hc-lg" onClick={this.onSearchChange('search_value')} ></i>
                                      </button>
                                      </div>
                      </div>
          </div>
        );
    }
}

export default header;