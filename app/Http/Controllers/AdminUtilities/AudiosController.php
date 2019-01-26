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
use App\SystemSetting;
use App\Http\Controllers\AdminUtilities\AdminUtilitiesConstants as AdminUtilities;
use App\Http\Controllers\AdminUtilities\AdminUtilitiesErrors;
use Exception;
use Illuminate\Support\Facades\Storage;

class AudiosController extends Controller {

    private $audio_file_url;
    private $audio_dir;
    private $audio_web_server;
    private $audio_dir_url;

    /**
     * Instantiate a new controller instance.
     *
     * @return void
     */
    public function __construct() {


       /* $settings = SystemSetting::getAll(['sounds_web_server', 'sounds_web_directory']);


/*
        $settings = SystemSetting::getAll(['sounds_web_server', 'sounds_web_directory']);
        $sounds_web_server = isset($settings[0]['sounds_web_server']) && $settings[0]['sounds_web_server'] != '' ? $settings[0]['sounds_web_server'] : '';
        $this->audio_web_server = $sounds_web_server;
        $this->audio_dir = isset($settings[0]['sounds_web_server']) && $settings[0]['sounds_web_directory'] != '' ? $settings[0]['sounds_web_directory'] : '';
        $this->audio_file_url = 'http://' . str_replace(array('https://', 'http://', '/'), "", $sounds_web_server) . '/x5/audio.php';
        $this->audio_dir_url = "http://$this->audio_web_server/$this->audio_dir/";*/
        

        $this->audio_dir_url = "http://$this->audio_web_server/$this->audio_dir/";
       

    }

    /**
     * Get voice mail list

     * @param Request $request
     * @return array
     */
     public function ajaxgetAudioManualrecords()
        {

                $list = VicidialAdminLog::where('event_section', 'AUDIOSTORE')->where('record_id', 'manualupload')->get();
                return response()->json($list);
        }


}
