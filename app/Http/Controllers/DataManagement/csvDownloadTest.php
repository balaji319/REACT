<?php
namespace App\Http\Controllers\DataManagement;
use Response;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Exception;
use Validator;

class csvDownloadTest extends Controller {

    /**
     * Data list
     *  
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function loadForm() {
        ?>
        <form action="http://127.0.0.1:8000/api/csv_download" method="get">
            <h1>Click Below Button to download csv file</h1>
            <br/><br/>
            <span style="font-size: 20px;">Download CSV : </span>
            <!-- <input type="test" name="file_download" value="1" readonly="true"> -->
            <select name="file_download" style="font-size: 30px;">
                <option value="1">Yes</option>
                <option value="0">No</option>
            </select>
            <br/><br/>
            <input type="submit" value="CSV Download" style="font-size: 30px;">
        </form> 
        <?php
    }

    public function csvDownload(Request $request) {
        try {

            $res_data = [
                '1' => ["1"],
                '2' => ["2"],
                '3' => ["3"],
                '4' => ["4"],
                '5' => ["5"]
            ];

            if(isset($request['file_download']) && ($request['file_download']) == 1 ){
                return $this->downloadCsvFile($res_data);
            } else {
                return response()->json([
                    'status'=>200,    
                    'message' => 'successfully',
                    'data' => $res_data
                ]);
            }

        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.csvDownloadTest'), $e);
            throw $e;   
        }
    }


    public function downloadCsvFile($res_data)
    {
        $filename = "test".date('Y-m-dh:i:s').".csv";            
        $handle = fopen($filename, 'w+');
        
        foreach ($res_data as $key => $value) {
            fputcsv($handle, $value, ";", '"');
        }
        fclose($handle);

        $headers = array(
              'Content-Type: text/csv',
            );
        return Response::download($filename, $filename, $headers)->deleteFileAfterSend(true);
    }

}