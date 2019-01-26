import React, {Component} from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import {NavLink, withRouter} from 'react-router-dom';


class CommonView extends React.Component {
    render() {
        
        return (
                <div>
                    <AppBar className="bg-primary" position="static">
                        <Toolbar>

                            <NavLink className="btn ml-3 text-white d-none d-sm-block" to="/app/data-management/data-loader/dashboard">
                                <span className="nav-text ">Dashboard</span>
                            </NavLink>
                            <NavLink className="btn ml-3 text-white d-none d-sm-block" to="/app/data-management/data-loader/upload-files">
                                <span className="nav-text ">Upload Files</span>
                            </NavLink>
                            <NavLink className="btn ml-3 text-white d-none d-sm-block" to="/app/data-management/data-loader/data-loader-queue">
                                <span className="nav-text ">Data Loader Queue</span>
                            </NavLink>
                            <NavLink className="btn ml-3 text-white d-none d-sm-block" to="/app/data-management/data-loader/uploaded-files">
                                <span className="nav-text ">Uploaded Files</span>
                            </NavLink>
                        </Toolbar>
                    </AppBar>
                </div>
        );
    }
}

export default CommonView;

