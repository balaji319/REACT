import {
  React,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  InfoCard,
  ContainerHeader,
  CardBox,
  Paper,
  Input,
  InputLabel,
  MenuItem,
  FormControl,
  FormHelperText,
  Select,
  Card,
  CardBody,
  CardSubtitle,
  CardText
} from "./plugins";
import { NavLink, withRouter } from "react-router-dom";

import { time } from "./time";
import { cloneElement, Component } from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Grid from "@material-ui/core/Grid";
import FolderIcon from "@material-ui/icons/Folder";
import DeleteIcon from "@material-ui/icons/Delete";

function generate(element) {
  return [0, 1, 2].map(value =>
    cloneElement(element, {
      key: value
    })
  );
}

class Agent extends React.Component {
  state = {
    type: "show_all_campaign",
    setTime: "10000",
    dense: false,
    secondary: false
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  render() {
    const { dense, secondary } = this.state;
    return (
      <div>
        <ContainerHeader
          match={this.props.match}
          title="Server Stats and Reports"
        />
        <Paper>
          <div className="col-lg-12 col-sm-12 col-12">
            <div className="row">
              <div className="col-sm-12 col-12">
                <Grid item xs={12} sm={6}>
                  <h3 className="text-gray lighten-2 my-3">Agent Reports</h3>

                  <List dense={dense}>
                    <NavLink
                      to={`/app/reports/agent-reports/agentTimeDetailReport/`}
                    >
                      <ListItem button>
                        <ListItemIcon>
                          <FolderIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Agent Time Detail"
                          secondary={secondary ? "Secondary text" : null}
                        />
                      </ListItem>
                    </NavLink>

                    <NavLink
                      to={`/app/reports/agent-reports/agentStatusDetail/`}
                    >
                      <ListItem button>
                        <ListItemIcon>
                          <FolderIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Agent Status Detail"
                          secondary={secondary ? "Secondary text" : null}
                        />
                      </ListItem>
                    </NavLink>



                    <NavLink
                      to={`/app/reports/agent-reports/TeamPerformanceDetail/`}
                    >
                      <ListItem button>
                        <ListItemIcon>
                          <FolderIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Team Performance Detail"
                          secondary={secondary ? "Secondary text" : null}
                        />
                      </ListItem>
                    </NavLink>

                    <NavLink
                      to={`/app/reports/agent-reports/PerformanceComparisonReport/`}
                    >
                      <ListItem button>
                        <ListItemIcon>
                          <FolderIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Performance Comparison Report"
                          secondary={secondary ? "Secondary text" : null}
                        />
                      </ListItem>
                    </NavLink>

                    <NavLink
                      to={`/app/reports/agent-reports/SingleAgentDaily/`}
                    >
                      <ListItem button>
                        <ListItemIcon>
                          <FolderIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Single Agent Daily"
                          secondary={secondary ? "Secondary text" : null}
                        />
                      </ListItem>
                    </NavLink>

                    <NavLink
                      to={`/app/reports/agent-reports/agentgrouploginreport/`}
                    >
                      <ListItem button>
                        <ListItemIcon>
                          <FolderIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Agent Group Login Report"
                          secondary={secondary ? "Secondary text" : null}
                        />
                      </ListItem>
                    </NavLink>

                    <NavLink to={`/app/reports/agent-reports/AgentStats/` }>
                                        <ListItem button>
                                            <ListItemIcon><FolderIcon/></ListItemIcon>
                                            <ListItemText primary="Agent Stats" secondary={secondary ? 'Secondary text' : null}
                                                />
                                        </ListItem>
                                    </NavLink>

                    <NavLink to={`/app/reports/agent-reports/AgentTimeSheet/`}>
                      <ListItem button>
                        <ListItemIcon>
                          <FolderIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Agent Time Sheet"
                          secondary={secondary ? "Secondary text" : null}
                        />
                      </ListItem>
                    </NavLink>

                    <NavLink
                      to={`/app/reports/agent-reports/AgentLoginDetail/`}
                    >
                      <ListItem button>
                        <ListItemIcon>
                          <FolderIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Agent Login Detail"
                          secondary={secondary ? "Secondary text" : null}
                        />
                      </ListItem>
                    </NavLink>
                  </List>
                </Grid>
              </div>
            </div>
          </div>
        </Paper>
      </div>
    );
  }
}

export default Agent;
