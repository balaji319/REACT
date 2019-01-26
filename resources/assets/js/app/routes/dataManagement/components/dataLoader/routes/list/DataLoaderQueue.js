import React from "react";
import { cloneElement, Component } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { Card, CardBody } from "reactstrap";
import { Badge } from "reactstrap";

import ContainerHeader from "../../../../../../../components/ContainerHeader/index";

import CommonView from "./CommonView";
import { Alert } from "reactstrap";

//import DateRange from '../../../common/DateRange';
let kid = 0;

function generate(element) {
  return [0, 1, 2].map(value =>
    cloneElement(element, {
      key: value
    })
  );
}

class AgentStatusDetail extends React.Component {
  handleCsvDownload() {
    alert("Download Success");
    //downloadCsvReports();
  }

  //Table format text or html

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  //DatePicker
  constructor(props) {
    super(props);
    this.state = {
      tableshow: false
    };
  }

  handleSubmit = () => {
    console.log(this.state);
  };

  render() {
    const {} = this.state;
    return (
      <div>
        <Paper>
          <CommonView />
          <br />
          <Alert className="shadow-lg" color="warning">
            <h1>
              We are currently doing a system maintenance. Any list uploaded
              will be processed at 8AM (EST) and 5AM (PST)
            </h1>
          </Alert>
          <div className="row">
            <div className="col-lg-12">
              <Card className="shadow border-0 bg-default text-black">
                <CardBody>
                  <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12">
                      <label align="center">In Progress</label>
                    </div>
                  </div>
                  <Paper>
                    <div className="table-responsive-material">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Queue ID </TableCell>
                            <TableCell>File Name</TableCell>
                            <TableCell>Server</TableCell>
                            <TableCell>List</TableCell>
                            <TableCell>Records In File</TableCell>
                            <TableCell>Current Row</TableCell>
                            <TableCell>Success</TableCell>
                            <TableCell>Bad</TableCell>
                            <TableCell>Total Processed </TableCell>
                            <TableCell>Create Time</TableCell>
                            <TableCell>Start Time</TableCell>
                            <TableCell>Requester</TableCell>
                            <TableCell>Progress</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow key={1}>
                            <TableCell colSpan="15" className="text-center">
                              No Data Available
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </Paper>
                </CardBody>

                <CardBody>
                  <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12">
                      <label align="center">In Queue</label>
                      <br />
                    </div>
                  </div>
                  <Paper>
                    <div className="table-responsive-material">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Queue ID </TableCell>
                            <TableCell>File Name</TableCell>
                            <TableCell>Server</TableCell>
                            <TableCell>List</TableCell>
                            <TableCell>Records In File</TableCell>
                            <TableCell>Create Time</TableCell>
                            <TableCell>Requester</TableCell>
                            <TableCell>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow key={1}>
                            <TableCell colSpan="8" className="text-center">
                              No Data Available
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </Paper>
                </CardBody>

                <CardBody>
                  <div className="row">
                    <div className="col-lg-12 col-sm-12 col-12">
                      <label align="center">Finished</label>
                      <br />
                    </div>
                  </div>
                  <Paper>
                    <div className="table-responsive-material">
                      <Table className="custom-table">
                        <TableHead>
                          <TableRow>
                            <TableCell>Queue ID </TableCell>
                            <TableCell>File Name</TableCell>
                            <TableCell>Server</TableCell>
                            <TableCell>List</TableCell>
                            <TableCell>Records In File</TableCell>
                            <TableCell>Success</TableCell>
                            <TableCell>Bad</TableCell>
                            <TableCell>Total Processed </TableCell>
                            <TableCell>Create Time</TableCell>
                            <TableCell>Start Time</TableCell>
                            <TableCell>Finish Time</TableCell>
                            <TableCell>Requester</TableCell>
                            <TableCell>Progress</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow key={1}>
                            <TableCell>151311</TableCell>
                            <TableCell>export_2018-05-09 (4).csv</TableCell>
                            <TableCell>ytelindia.ytel.com</TableCell>
                            <TableCell>222</TableCell>
                            <TableCell>3</TableCell>
                            <TableCell>2</TableCell>
                            <TableCell>1</TableCell>
                            <TableCell>3</TableCell>
                            <TableCell>6/20/18 15:09</TableCell>
                            <TableCell>6/20/18 16:31</TableCell>
                            <TableCell>6/20/18 16:31</TableCell>
                            <TableCell>balaji@ytel.co.in</TableCell>
                            <TableCell>
                              <Badge color="success">100.00%</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge color="success">Success</Badge>
                            </TableCell>
                          </TableRow>
                          <TableRow key={2}>
                            <TableCell>151311</TableCell>
                            <TableCell>export_2018-05-09 (4).csv</TableCell>
                            <TableCell>ytelindia.ytel.com</TableCell>
                            <TableCell>222</TableCell>
                            <TableCell>3</TableCell>
                            <TableCell>2</TableCell>
                            <TableCell>1</TableCell>
                            <TableCell>3</TableCell>
                            <TableCell>6/20/18 15:09</TableCell>
                            <TableCell>6/20/18 16:31</TableCell>
                            <TableCell>6/20/18 16:31</TableCell>
                            <TableCell>balaji@ytel.co.in</TableCell>
                            <TableCell>
                              <Badge color="success">100.00%</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge color="success">Success</Badge>
                            </TableCell>
                          </TableRow>
                          <TableRow key={3} className="error-row">
                            <TableCell>136867</TableCell>
                            <TableCell>export_2018-03-30 (1).csv</TableCell>
                            <TableCell>ytelindia.ytel.com</TableCell>
                            <TableCell>13333</TableCell>
                            <TableCell>4056</TableCell>
                            <TableCell>0</TableCell>
                            <TableCell>0</TableCell>
                            <TableCell>0</TableCell>
                            <TableCell>6/20/18 15:09</TableCell>
                            <TableCell>6/20/18 16:31</TableCell>
                            <TableCell>6/20/18 16:31</TableCell>
                            <TableCell>balaji@ytel.co.in</TableCell>
                            <TableCell>
                              <Badge color="danger">0.00%</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge color="danger">Error</Badge>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </Paper>
                </CardBody>
              </Card>
            </div>
          </div>
        </Paper>
      </div>
    );
  }
}

export default AgentStatusDetail;
