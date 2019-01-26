import React from 'react';
import ContainerHeader from '../../../../../../../components/ContainerHeader/index';
import { Card, CardBody, CardSubtitle, CardText } from 'reactstrap';
import { cloneElement, Component } from 'react';
import { UncontrolledAlert } from 'reactstrap';

import MoveLead from './movelead';
import SwitchCallback from './switchcallback';

class AdvancedLead extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div>
                <ContainerHeader match={this.props.match} title={'Basic Lead Management'} />
                <Card className="shadow border-0 bg-default text-black">
                    <CardBody>
                        <div className="row">

                            <div className="col-lg-12 col-sm-12 col-12">
                                <UncontrolledAlert className="bg-light text-black shadow-lg">
                                    <div style={{ color: 'green' }}>NOTICE: These features only work on Inactive lists with less than 100,000 leads in them to avoid data inconsistencies. Please mark your lists as Inactive before using these tools.</div>
                                    <div style={{ color: 'red' }}>Warning: If you are moving leads that have custom fields associated with them, then do not apply this update. If you apply this update, then custom field info will not move with the lead.</div>
                                </UncontrolledAlert>
                            </div>

                        </div>
                        <MoveLead title={"Move Leads"} btnText={"Move"}/>
                        <br />
                        <MoveLead title={"Update Lead Statuses"} btnText={"Update"}/>
                        <br />
                        <MoveLead title={"Delete Leads"} btnText={"Delete"}/>
                        <br/>
                        <SwitchCallback />
                    </CardBody>
                </Card>
            </div>
        );
    }
}

export default AdvancedLead;