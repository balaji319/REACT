
import React from 'react';
import Input from '@material-ui/core/Input';
import button from '@material-ui/core/Select';

class Dropdown extends React.Component {
    constructor(props) {
        super(props);
    }

    handleChange = name => event => {
        let data = event.target.value
        this.props.onChange(name,data);     
    };

    render() {
        const {data,name,selectedValue,label}=this.props;
        return (
 
	      			<div className="search-bar right-side-icon bg-transparent search-dropdown">
	                              <div className="form-group">
	                              <input className="form-control border-0" type="search" name="search_value" value={search_value} onChange={this.onSearchChange('search_value')} />
	                                 <button className="search-icon">
	                                 <i className="zmdi zmdi-search zmdi-hc-lg"></i>
	                              </button>
                         </div>
             </div>
        );
    }
}

export default Dropdown;