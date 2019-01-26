import {
    React,
    Button
} from './plugins';
import {
    Fragment
} from 'react';

class CsvDownload extends React.Component {
    constructor(props) {
        super(props);
    }

    handleCsvDownload = (e) => {
        const {
            headerdata,
            filename
        } = this.props;
        let this2_ = this;
        var html = document.querySelector("table").outerHTML;
        this.export_table_to_csv(headerdata, html, filename);
    }

    download_csv = (csv, filename) => {
        
        let csvFile;
        let downloadLink;
        csvFile = new Blob([csv], {type: "text/csv" });
        downloadLink = document.createElement("a");
        downloadLink.download = filename;
        downloadLink.href = window.URL.createObjectURL(csvFile);
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
        downloadLink.click();
    }

    export_table_to_csv = (header = 'no', html, filename) => {
        let this3_ = this;
        var csv = [];
        var rows = document.querySelectorAll("table tr");
        if (header != 'no') {
            csv.push(header)
        }
        for (var i = 0; i < rows.length; i++) {
            var row = [],
                cols = rows[i].querySelectorAll("td, th");

            for (var j = 0; j < cols.length; j++)
                row.push(cols[j].innerText);

            csv.push(row.join(","));
        }
        console.log(csv)
        // Download CSV
        this.download_csv(csv.join("\n"), filename);
    }
    render() {
        return ( 
            <Fragment>
                <Button variant = "raised" onClick = {this.handleCsvDownload }
                className = "pull-right jr-btn bg-green text-white">
                CSV Download </Button> 
            </Fragment>
        );
    }
}

export default CsvDownload;