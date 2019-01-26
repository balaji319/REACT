<?php

namespace App\Http\Controllers\Audio;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use \App\Traits\ErrorLog;
use \App\Traits\AccessControl;
use \App\Traits\Helper;
use Exception;

class AudioController extends Controller {

    use ErrorLog,
        AccessControl,
        Helper;

    /**
     * Audio files list
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     * @throws Exception
     */
    public function audioList(Request $request) {
        try {

            $target_url = 'http://' . str_replace(array('https://', 'http://', '/'), "", $request->current_application_dns) . '/x5/audio.php';
            $postdata = http_build_query(
                    array(
                        'action' => 'list-ssdt-ng'
                    )
            );

            $opts = array(
                'http' => array(
                    'method' => "POST",
                    'header' => "Content-type: application/x-www-form-urlencoded",
                    'content' => $postdata
                )
            );

            $context = stream_context_create($opts);
            $return['files'] = json_decode(strstr(@file_get_contents($target_url, false, $context), '['));
            $sound_directory = \App\SystemSetting::select('sounds_web_directory')->first();
            $return['url'] = "http://" . $request->current_application_dns . "/" . $sound_directory->sounds_web_directory . "/";
            return response()->json(['status' => 200, 'message' => 'Success', 'data' => $return]);
        } catch (Exception $e) {
            $this->postLogs(config('errorcontants.mysql'), $e);
            throw $e;
        }
    }

}
