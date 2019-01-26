import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import { NavLink, withRouter } from "react-router-dom";
import ContainerHeader from "../../../../../../../components/ContainerHeader/index";
import Paper from "@material-ui/core/Paper";
import CommonView from "./CommonView";
import { Alert } from "reactstrap";

class DataTable extends React.Component {
  constructor(props, context) {
    super(props);
    this.state = {
      order: "asc",
      orderBy: "calories",
      selected: []
    };
  }

  render() {
    const { selected } = this.state;

    return (
      <div className="app-wrapper">
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
              <div className="col-lg-4 col-sm-6 col-12">
                <div className="card shadow ">
                  <div className="card-header py-3 d-flex justify-content-between">
                    <h3 className="mb-0">Data List</h3>
                  </div>
                  <div className="stack-order  py-4 px-2">
                    <p className="text-muted">Total: 81</p>
                    <p className="text-muted">Active: 37</p>
                    <p className="text-muted">Non-Active: 44</p>
                    <hr />
                    <NavLink
                      className="prepend-icon"
                      to="/app/data-management/data-loader"
                    >
                      <span className="nav-text">Go To Data List</span>
                    </NavLink>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-sm-6 col-12">
                <div className="card shadow">
                  <div className="card-header py-3 d-flex justify-content-between">
                    <h3 className="mb-0">Uploaded Files</h3>
                  </div>
                  <div className="stack-order  py-4 px-2">
                    <p className="text-muted">Processed: 29</p>
                    <p className="text-muted">Not Yet Processed: 42</p>
                    <br />
                    <hr />
                    <NavLink
                      className="prepend-icon"
                      to="/app/data-management/data-loader/uploaded-files"
                    >
                      <span className="nav-text ">Go To Uploaded Files</span>
                    </NavLink>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-sm-6 col-12">
                <div className="card shadow">
                  <div className="card-header py-3 d-flex justify-content-between">
                    <h3 className="mb-0">Data Loader Queue</h3>
                  </div>
                  <div className="stack-order  py-4 px-2">
                    <p className="text-muted">Finished: 102</p>
                    <p className="text-muted">In Queue: 0</p>
                    <p className="text-muted">In Process: 0</p>
                    <hr />
                    <NavLink
                      className="prepend-icon"
                      to="/app/data-management/data-loader/data-loader-queue"
                    >
                      <span className="nav-text">Go To Data Loader Queue</span>
                    </NavLink>
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

export default DataTable;
