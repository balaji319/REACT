import React from "react";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
const NoRecords = ({ Records, isLoading }) => {
  return (
    <React.Fragment>
      {Records.length == 0 && isLoading ? (
        <TableRow>
          <TableCell colSpan="11">
            <center>Loading ......... </center>
          </TableCell>
        </TableRow>
      ) : Records.length == 0 ? (
        <TableRow>
          <TableCell colSpan="11">
            <center>No Records Found </center>
          </TableCell>
        </TableRow>
      ) : (
        <TableRow>
          <TableCell colSpan="11">
            <center> </center>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
};
export default NoRecords;

NoRecords.defaultProps = {
  Records: [],
  isLoading: ""
};
