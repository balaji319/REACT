import React, { Component } from "react";
import PropTypes from "prop-types";
import Table from "@material-ui/core/Table";
import MenuItem from "@material-ui/core/MenuItem";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableFooter from "@material-ui/core/TableFooter";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Toolbar from "@material-ui/core/Toolbar";
import Checkbox from "@material-ui/core/Checkbox";
import Tooltip from "@material-ui/core/Tooltip";

let counter = 0;

const columnData = [
  { id: "USER  ", numeric: false, textAlign: "left", label: "USER" },
  {
    id: "USER GROUP",
    numeric: true,
    textAlign: "left",
    label: "USER GROUP"
  },
  { id: "Selected", numeric: true, textAlign: "left", label: "SELECTED" },
  { id: "Rank", numeric: true, textAlign: "left", label: "RANK" },
  { id: "Grade", numeric: true, label: "GRADE ", textAlign: "left" },
  { id: "Calls", numeric: true, textAlign: "left", label: "CALLS TODAY" }
];

class DataTableHead extends React.Component {
  static propTypes = {
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string.isRequired
    // rowCount: PropTypes.number.isRequired,
  };

  createSortHandler = property => event => {
    this.props.onRequestSort(event, property);
  };
  render() {
    const {
      onSelectAllClick,
      order,
      orderBy,
      numSelected,
      rowCount
    } = this.props;

    return (
      <TableHead>
        <TableRow>
          {columnData.map(column => {
            if (column.id == "Selected") {
              return (
                <TableCell padding="checkbox" key={column.id}>
                  {column.label}

                  <Checkbox
                    color="primary"
                    indeterminate={numSelected > 0 && numSelected < rowCount}
                    checked={numSelected === rowCount && numSelected > 0}
                    onChange={onSelectAllClick}
                  />
                </TableCell>
              );
            } else {
              return (
                <TableCell
                  className={column.textAlign}
                  key={column.id}
                  numeric={column.numeric}
                  padding={column.disablePadding ? "none" : "default"}
                  padding={column.disablePadding ? "none" : "default"}
                  style={{ flexDirection: "row", textAlign: column.textAlign }}
                >
                  <Tooltip
                    title={column.label}
                    placement={column.numeric ? "bottom-end" : "bottom-start"}
                    enterDelay={300}
                  >
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={order}
                      onClick={this.createSortHandler(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>
              );
            }
          }, this)}
        </TableRow>
      </TableHead>
    );
  }
}

export default DataTableHead;
