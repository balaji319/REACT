import {
  React,
  Component,
  connect,
  Redirect,
  ContainerHeader,
  Toolbar,
  Typography,
  Paper
} from "./plugins";
import { fetchAllShifts } from "../../../../actions/";
import DataTableHead from "./DataTableHead";
let counter = 0;

class List extends React.Component {
  redirecthangeHandler = name => event => {
    name == "event"
      ? this.props.history.push("event")
      : this.props.history.push("access");
  };
  render() {
    return (
      <div>
        <ContainerHeader match={this.props.match} title="System Audit " />
        <Paper>
          <Toolbar className="table-header">
            <div className="title">
              <h3>
                <i className="zmdi zmdi-view-web mr-2" /> Admin Utilities -
                System Audit - Dashboard
              </h3>
            </div>
            <div className="spacer" />
            <div className="actions" />
          </Toolbar>
          <div className="flex-auto" style={{ height: "900px" }}>
            <div className="table-responsive-material">
              <div
                className="animate col-sm-12 view-container "
                app-view-segment={0}
                style={{}}
              >
                {/* appViewSegment: 1 */}
                <div className="animate " app-view-segment={1} style={{}}>
                  {/* appViewSegment: 2 */}
                  <div className="animate " app-view-segment={2} style={{}}>
                    <hr className="" />
                    <div className="row " style={{ marginTop: "30px" }}>
                      <div className="col-sm-6 col-md-4">
                        <div className="thumbnail">
                          <a
                            href="javascript:void(0)"
                            className="text-center"
                            onClick={this.redirecthangeHandler("event")}
                          >
                            <h2>
                              <i
                                className="fa fa-exchange fa-5x"
                                style={{ fontSize: "7em" }}
                              />
                            </h2>
                            <h3>Event</h3>
                          </a>
                        </div>
                      </div>
                      <div className="col-sm-6 col-md-4">
                        <div className="thumbnail">
                          <a
                            href="javascript:void(0)"
                            className="text-center"
                            onClick={this.redirecthangeHandler("access")}
                          >
                            <h2>
                              <i
                                className="fa fa-key fa-5x"
                                style={{ fontSize: "7em" }}
                              />
                            </h2>
                            <h3>Access</h3>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Paper>
      </div>
    );
  }
}

export default List;
