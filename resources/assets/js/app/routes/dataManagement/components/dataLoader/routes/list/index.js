import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Dashboard from "./Dashboard";
import CommonView from "./CommonView";

function TabContainer(props) {
  return <div style={{ padding: 20 }}>{props.children}</div>;
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired
};

class DataList extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      value: 0,
      open: false
    };
  }

  tabHandleChange = (event, value) => {
    this.setState({ value });
  };

  handleCsvDownload() {
    alert("Download Success");
    downloadCsvReports();
  }

  render() {
    const { value } = this.state;
    return (
      <div className="app-wrapper">
        <Dashboard />
      </div>
    );
  }
}

export default DataList;

//function mapStateToProps(state, ownProps) {
//    console.log(state);
//
//    return {
//        download_reports: state.download_reports
//    };
//}
//
// const mapDispatchToProps = {
//      fetchAllDownloadReports,
//      downloadCsvReports,
//    };
//
//export default connect(mapStateToProps, mapDispatchToProps)(DataList);

// const mapDispatchToProps = {
//      fetchAllDownloadReports,
//      downloadCsvReports,
//    };
//
//export default connect(mapStateToProps, mapDispatchToProps)(DataList);
