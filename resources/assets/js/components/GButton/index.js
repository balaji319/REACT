import React, { PropTypes } from 'react';
import Button from '@material-ui/core/Button';

const GButton = ({ props }) => {
    return (
        <div className="col-lg-12" style={{padding: '0px'}}>
                                                     <div className="jr-card " style={{ padding: '2px',textAlign:'right',marginBottom:'14px'}}>
                                                         <div className="jr-card-body ">
                                                           <div className = "cardPanel teal">
                                                               <span className = "whiteText">
                                                                  <Button color="primary" className="jr-btn bg-success text-white" style={{marginBottom:'4px',marginRight:'26px'}}  onClick={props.click}>
                                                                      <span> {props.pageTitle=='add'?'Add':'Update'}  </span>
                                                                  </Button>
                                                               </span>
                                                            </div>
                                                            </div>
                                                        </div>
        </div>
    );
};



export default GButton;
