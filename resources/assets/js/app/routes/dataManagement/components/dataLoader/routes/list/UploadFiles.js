import React from "react";
import { Button } from "reactstrap";
import Dropzone from "react-dropzone";
import { NavLink, withRouter } from "react-router-dom";
import Paper from "@material-ui/core/Paper";
import { Alert } from "reactstrap";
import CommonView from "./CommonView";

class UploadFiles extends React.Component {
  constructor() {
    super();
    this.state = {
      accepted: [],
      rejected: []
    };
  }

  render() {
    let dropzoneRef;

    return (
      <div>
        <div className="dashboard animated slideInUpTiny animation-duration-3">
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
              <div className="col-lg-12 col-sm-12 col-12">
                <div className="card shadow ">
                  <div className="card-header py-3 d-flex justify-content-between">
                    <h3 className="mb-0">Select files or Drop files here</h3>
                  </div>
                  <div className="stack-order  py-4 px-2">
                    <div className="dropzone-card">
                      <div className="dropzone show-pointer ">
                        <Dropzone
                          accept=".csv,.xml"
                          onDrop={(accepted, rejected) => {
                            this.setState({ accepted, rejected });
                          }}
                        >
                          {({ isDragActive, isDragReject }) => {
                            if (isDragActive) {
                              return "All files will be accepted";
                            }
                            if (isDragReject) {
                              return "Some files will be rejected";
                            }
                            return "Dropping some files here...";
                          }}
                        </Dropzone>
                        <div className="dropzone-content">
                          <h2>Accepted files</h2>{" "}
                          {this.state.accepted.length > 0 && (
                            <ul className="upload-file-list">
                              {this.state.accepted.map(f => (
                                <li key={f.name}>
                                  {f.name} - {f.size} bytes
                                </li>
                              ))}
                            </ul>
                          )}
                          <h2>Rejected files</h2>{" "}
                          {this.state.rejected.length > 0 && (
                            <ul className="upload-file-list">
                              {this.state.rejected.map(f => (
                                <li key={f.name}>
                                  {f.name} - {f.size} bytes
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Paper>
        </div>
      </div>
    );
  }
}

export default UploadFiles;
