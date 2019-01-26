import React, {Component} from 'react';
import ContainerHeader from '../../../../../components/ContainerHeader/index';
import IntlMessages from '../../../../../util/IntlMessages';
import CardBox from '../../../../../components/CardBox';
 import TextFields from './TextFields';

class DataSearch extends Component {

    constructor() {
        super();
    }

    render() {
        return (
                <div >
                    <div className="dashboard animated slideInUpTiny animation-duration-3">
                        <ContainerHeader match={this.props.match} title='Data Search'/>
                    </div>
              
                      <TextFields/>
                </div>


                );
    }
}

export default DataSearch;