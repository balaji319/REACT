<?php

/*
 * Controller for admin utilities dnc number module
 * @author om<om@ytel.com>
 * 
 */

namespace App\Http\Controllers\AdminUtilities;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\VicidialVoicemail;
use App\VicidialAdminLog;
use App\VicidialUserGroup;
use App\VicidialShifts;
use App\SystemSetting;
use App\VicidialCallTimes;
use App\ViciRecordingLog;
use App\Http\Controllers\AdminUtilities\AdminUtilitiesConstants as AdminUtilities;
use App\Http\Controllers\AdminUtilities\AdminUtilitiesErrors;
use Illuminate\Support\Facades\Input;
use Exception;

class RecordingLogsController extends Controller {

    /**
     * Get voice mail list
     * @author Balaji  Pastapure <balaji@ytel.com>
     * @param Request $request
     * @return array
     */
    public function Lists(Request $request) {

        //$page_size = $req->input('page_size')??10;

        $page_size = 10;

        $result = DB::table('recording_log')->join('vicidial_users', 'recording_log.user', '=', 'vicidial_users.user')->paginate($page_size);   
          
        return response()->json($result);
    


    }




}
