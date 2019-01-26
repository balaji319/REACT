import React, {Component} from 'react';
import ContainerHeader from '../../../../../components/ContainerHeader/index';

class DataLoader extends Component {

    constructor() {
        super();
    }

    render() {
        return (
                <div className="app-wrapper">
                    <div className="dashboard animated slideInUpTiny animation-duration-3">
                        <ContainerHeader match={this.props.match} title='Data Loader'/>
                    </div>
                </div>

                );
    }
}

export default DataLoader;