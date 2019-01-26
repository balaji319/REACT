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

class MusicOnHoldController extends Controller {

 
    /**
     * Instantiate a new controller instance.
     *
     * @return void
     */
    public function __construct() {


     /*   $settings = SystemSetting::getAll(['sounds_web_server', 'sounds_web_directory']);

       /* $settings = SystemSetting::getAll(['sounds_web_server', 'sounds_web_directory']);



        $sounds_web_server = isset($settings[0]['sounds_web_server']) && $settings[0]['sounds_web_server'] != '' ? $settings[0]['sounds_web_server'] : '';
        $this->audio_web_server = $sounds_web_server;
        $this->audio_dir = isset($settings[0]['sounds_web_server']) && $settings[0]['sounds_web_directory'] != '' ? $settings[0]['sounds_web_directory'] : '';
        $this->audio_file_url = 'http://' . str_replace(array('https://', 'http://', '/'), "", $sounds_web_server) . '/x5/audio.php';
        $this->audio_dir_url = "http://$this->audio_web_server/$this->audio_dir/";*/
        
    }

    /**
     * Get music list

     * @param Request $request
     * @return array
     */
     public function ajaxGetMusicList()
        {

      $list = '[{"ViciMusicOnHold":{"moh_id":"default","moh_name":"D","active":"Y","random":"N","user_group":"---ALL---"}},{"ViciMusicOnHold":{"moh_id":"HQ_Sales_MOH","moh_name":"Sales MOH","active":"Y","random":"N","user_group":"---ALL---"}},{"ViciMusicOnHold":{"moh_id":"HQ_Support_MOH","moh_name":"Support MOH","active":"Y","random":"Y","user_group":"---ALL---"}},{"ViciMusicOnHold":{"moh_id":"HQ_Billing_MOH","moh_name":"Billing MOH","active":"Y","random":"N","user_group":"---ALL---"}},{"ViciMusicOnHold":{"moh_id":"VanDam","moh_name":"VanDam","active":"Y","random":"N","user_group":"---ALL---"}},{"ViciMusicOnHold":{"moh_id":"Vring","moh_name":"Vring","active":"Y","random":"N","user_group":"---ALL---"}},{"ViciMusicOnHold":{"moh_id":"Testing123","moh_name":"Testing123","active":"N","random":"N","user_group":"---ALL---"}},{"ViciMusicOnHold":{"moh_id":"PatrickTest","moh_name":"testing","active":"Y","random":"N","user_group":"---ALL---"}},{"ViciMusicOnHold":{"moh_id":"disable","moh_name":"Disable","active":"Y","random":"N","user_group":"---All---"}},{"ViciMusicOnHold":{"moh_id":"brian_rocks","moh_name":"brian rocks","active":"Y","random":"N","user_group":"---ALL---"}},{"ViciMusicOnHold":{"moh_id":"betsytest3","moh_name":"Betsy Test 3","active":"N","random":"N","user_group":"---ALL---"}},{"ViciMusicOnHold":{"moh_id":"Test","moh_name":"Testing purpose","active":"N","random":"N","user_group":"AGENTS"}}]';

                return  $list ;
        }


}
